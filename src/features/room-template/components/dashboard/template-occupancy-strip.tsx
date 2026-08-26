"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isToday,
  parseISO,
  startOfMonth,
} from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OccupancyBooking } from "@/features/booking/api/booking.api";
import { useOccupancy } from "@/features/booking/hooks/use-booking";
import {
  BOOKING_STATUS_STYLES,
  OCCUPANCY_STATUSES,
  isOccupancyStatus,
} from "@/features/booking/lib/status";
import { BookingDrawer } from "@/features/booking/components/dashboard/booking-drawer";

interface TemplateOccupancyStripProps {
  propertyId: string;
  roomTemplateId: string;
}

export const TemplateOccupancyStrip = ({
  propertyId,
  roomTemplateId,
}: TemplateOccupancyStripProps) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const { data } = useOccupancy(
    propertyId,
    format(monthStart, "yyyy-MM-dd"),
    format(monthEnd, "yyyy-MM-dd"),
  );

  const [selectedBooking, setSelectedBooking] =
    useState<OccupancyBooking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const days = useMemo(
    () => eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd],
  );
  const totalDays = days.length;

  const beds = useMemo(
    () =>
      (data?.beds ?? []).filter(
        (bed) => bed.room.roomTemplateId === roomTemplateId,
      ),
    [data?.beds, roomTemplateId],
  );

  const bookings = useMemo(
    () =>
      (data?.bookings ?? []).filter(
        (booking) =>
          booking.room.roomTemplateId === roomTemplateId &&
          isOccupancyStatus(booking.status),
      ),
    [data?.bookings, roomTemplateId],
  );

  const barSegments = (booking: OccupancyBooking) => {
    const startIdx = Math.max(
      differenceInCalendarDays(parseISO(booking.startDate), monthStart),
      0,
    );
    const endIdxExclusive = Math.min(
      differenceInCalendarDays(parseISO(booking.endDate), monthStart),
      totalDays,
    );
    if (endIdxExclusive <= 0 || startIdx >= totalDays) return null;
    return {
      left: `${(startIdx / totalDays) * 100}%`,
      width: `${((endIdxExclusive - startIdx) / totalDays) * 100}%`,
    };
  };

  if (beds.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">
          Occupancy this month
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/properties/${propertyId}/bookings?view=timeline`}>
            View full calendar
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {OCCUPANCY_STATUSES.map((status) => (
            <span
              key={status}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className={`h-2.5 w-2.5 rounded-sm ${BOOKING_STATUS_STYLES[status].legend}`}
              />
              {BOOKING_STATUS_STYLES[status].label}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div style={{ minWidth: totalDays * 28 + 140 }}>
            <div className="flex border-b">
              <div className="w-[140px] shrink-0 px-2 py-1 text-xs font-medium text-muted-foreground">
                Bed
              </div>
              <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${totalDays}, 1fr)` }}>
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`border-r border-border/40 py-1 text-center text-[10px] last:border-r-0 ${
                      isToday(day) ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                ))}
              </div>
            </div>

            {beds.map((bed) => {
              const bedBookings = bookings.filter(
                (booking) => booking.bed.id === bed.id,
              );
              return (
                <div key={bed.id} className="flex border-b last:border-b-0">
                  <div className="flex h-8 w-[140px] shrink-0 items-center truncate px-2 text-xs">
                    {bed.room.title} · B{bed.bedNo}
                  </div>
                  <div className="relative h-8 flex-1">
                    <div
                      className="absolute inset-0 grid"
                      style={{ gridTemplateColumns: `repeat(${totalDays}, 1fr)` }}
                    >
                      {days.map((day) => (
                        <div
                          key={day.toISOString()}
                          className={`border-r border-border/30 last:border-r-0 ${isToday(day) ? "bg-primary/5" : ""}`}
                        />
                      ))}
                    </div>
                    {bedBookings.map((booking) => {
                      const segment = barSegments(booking);
                      if (!segment) return null;
                      return (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setDrawerOpen(true);
                          }}
                          title={`${booking.guest.firstName} ${booking.guest.lastName ?? ""} · ${format(parseISO(booking.startDate), "MMM d")} – ${format(parseISO(booking.endDate), "MMM d")}`}
                          className={`absolute bottom-1 top-1 overflow-hidden rounded px-1 text-left text-[10px] font-medium transition-opacity hover:opacity-85 ${BOOKING_STATUS_STYLES[booking.status].bar}`}
                          style={segment}
                        >
                          {booking.guest.firstName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <BookingDrawer
        propertyId={propertyId}
        booking={selectedBooking}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </Card>
  );
};
