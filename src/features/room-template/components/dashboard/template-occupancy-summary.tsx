"use client";

import Link from "next/link";
import {
  addDays,
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ArrowUpRight, BedDouble, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOccupancy } from "@/features/booking/hooks/use-booking";
import { isOccupancyStatus } from "@/features/booking/lib/status";

interface TemplateOccupancySummaryProps {
  propertyId: string;
  roomTemplateId: string;
}

export function TemplateOccupancySummary({
  propertyId,
  roomTemplateId,
}: TemplateOccupancySummaryProps) {
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

  const { data } = useOccupancy(propertyId, monthStart, monthEnd);

  // Shares the calendar's ["occupancy", propertyId, start, end] cache —
  // no extra network call when the calendar was already loaded.
  const beds = (data?.beds ?? []).filter(
    (bed) => bed.room.roomTemplateId === roomTemplateId,
  );
  const activeBookings = (data?.bookings ?? []).filter(
    (booking) =>
      booking.room?.roomTemplateId === roomTemplateId &&
      isOccupancyStatus(booking.status),
  );

  const occupiedBedIds = new Set(
    activeBookings.map((b) => b.bed?.id).filter((id): id is string => Boolean(id)),
  );
  const occupiedCount = beds.filter((bed) => occupiedBedIds.has(bed.id)).length;

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const checkInsThisWeek = activeBookings.filter((booking) =>
    isWithinInterval(parseISO(booking.startDate), {
      start: weekStart,
      end: weekEnd,
    }),
  ).length;

  if (beds.length === 0) return null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">{occupiedCount}</span>
              <span className="text-muted-foreground"> of {beds.length} </span>
              beds occupied this month
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LogIn className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">{checkInsThisWeek}</span>
              <span className="text-muted-foreground"> check-ins</span> this
              week
            </span>
          </div>
        </div>

        <Button asChild size="sm" variant="outline">
          <Link
            href={`/properties/${propertyId}/bookings?view=timeline&template=${roomTemplateId}`}
          >
            View in calendar
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
