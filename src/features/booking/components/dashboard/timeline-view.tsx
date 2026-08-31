"use client";

import { useMemo } from "react";
import {
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { OccupancyBooking } from "../../api/booking.api";
import { useOccupancy } from "../../hooks/use-booking";
import {
  BOOKING_STATUS_STYLES,
  OCCUPANCY_STATUSES,
  isOccupancyStatus,
} from "../../lib/status";

const LABEL_WIDTH = 160;

interface TimelineViewProps {
  propertyId: string;
  onOpenBooking: (booking: OccupancyBooking) => void;
}

export const TimelineView = ({
  propertyId,
  onOpenBooking,
}: TimelineViewProps) => {
  const [anchor, setAnchor] = useQueryState(
    "anchor",
    parseAsString.withDefault(format(new Date(), "yyyy-MM-dd")),
  );
  const [span, setSpan] = useQueryState(
    "span",
    parseAsStringLiteral(["month", "week"]).withDefault("month"),
  );

  const anchorDate = useMemo(() => parseISO(anchor), [anchor]);

  const { windowStart, windowEnd, days } = useMemo(() => {
    const start =
      span === "month"
        ? startOfMonth(anchorDate)
        : startOfWeek(anchorDate, { weekStartsOn: 1 });
    const end =
      span === "month"
        ? endOfMonth(anchorDate)
        : endOfWeek(anchorDate, { weekStartsOn: 1 });
    return {
      windowStart: start,
      windowEnd: end,
      days: eachDayOfInterval({ start, end }),
    };
  }, [anchorDate, span]);

  const { data, isLoading, isError, error } = useOccupancy(
    propertyId,
    format(windowStart, "yyyy-MM-dd"),
    format(windowEnd, "yyyy-MM-dd"),
  );

  const rooms = useMemo(() => {
    const beds = data?.beds ?? [];
    const grouped = new Map<
      string,
      { roomId: string; roomTitle: string; beds: typeof beds }
    >();
    for (const bed of beds) {
      const existing = grouped.get(bed.room.id);
      if (existing) {
        existing.beds.push(bed);
      } else {
        grouped.set(bed.room.id, {
          roomId: bed.room.id,
          roomTitle: bed.room.title,
          beds: [bed],
        });
      }
    }
    return Array.from(grouped.values());
  }, [data?.beds]);

  const visibleBookings = useMemo(
    () =>
      (data?.bookings ?? []).filter((booking) =>
        isOccupancyStatus(booking.status),
      ),
    [data?.bookings],
  );

  const totalDays = days.length;
  const colMinWidth = span === "month" ? 44 : 96;

  const navigate = (direction: 1 | -1) => {
    const next =
      span === "month"
        ? addMonths(anchorDate, direction)
        : addWeeks(anchorDate, direction);
    setAnchor(format(next, "yyyy-MM-dd"));
  };

  const barSegments = (booking: OccupancyBooking) => {
    const bookingStart = parseISO(booking.startDate);
    const bookingEnd = parseISO(booking.endDate);
    const startIdx = Math.max(
      differenceInCalendarDays(bookingStart, windowStart),
      0,
    );
    const endIdxExclusive = Math.min(
      differenceInCalendarDays(bookingEnd, windowStart),
      totalDays,
    );
    if (endIdxExclusive <= 0 || startIdx >= totalDays) return null;
    return {
      left: `${(startIdx / totalDays) * 100}%`,
      width: `${((endIdxExclusive - startIdx) / totalDays) * 100}%`,
    };
  };

  const headerLabel =
    span === "month"
      ? format(windowStart, "MMMM yyyy")
      : `${format(windowStart, "MMM d")} – ${format(windowEnd, "MMM d, yyyy")}`;

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[40vh] flex-col items-center justify-center text-destructive">
        <p className="text-lg font-semibold">Error loading occupancy</p>
        <p className="text-sm">{error?.message || "Something went wrong"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous"
            className="max-sm:size-11"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next"
            className="max-sm:size-11"
            onClick={() => navigate(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="max-sm:h-11 max-sm:px-4"
            onClick={() => setAnchor(format(new Date(), "yyyy-MM-dd"))}
          >
            Today
          </Button>
          <span className="ml-1 text-sm font-semibold">{headerLabel}</span>
        </div>

        <Tabs value={span} onValueChange={(v) => setSpan(v as "week" | "month")}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {OCCUPANCY_STATUSES.map((status) => (
          <span
            key={status}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className={`h-3 w-3 rounded-sm ${BOOKING_STATUS_STYLES[status].legend}`}
            />
            {BOOKING_STATUS_STYLES[status].label}
          </span>
        ))}
      </div>

      {rooms.length === 0 ? (
        <div className="flex h-[30vh] items-center justify-center text-sm text-muted-foreground">
          No beds configured for this property yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <div
            style={{ minWidth: LABEL_WIDTH + totalDays * colMinWidth }}
          >
            <div className="flex border-b bg-muted/40">
              <div
                className="sticky left-0 z-10 shrink-0 border-r bg-muted/90 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur"
                style={{ width: LABEL_WIDTH }}
              >
                Room / Bed
              </div>
              <div
                className="grid flex-1"
                style={{
                  gridTemplateColumns: `repeat(${totalDays}, minmax(${colMinWidth}px, 1fr))`,
                }}
              >
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`border-r py-2 text-center text-xs last:border-r-0 ${
                      isToday(day)
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div>{format(day, span === "month" ? "d" : "EEE d")}</div>
                    {span === "month" && (
                      <div className="text-[10px] uppercase">
                        {format(day, "EEE")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {rooms.map((room) => (
              <div key={room.roomId}>
                <div className="flex border-b bg-muted/20">
                  <div
                    className="sticky left-0 z-10 shrink-0 border-r bg-muted/70 px-3 py-1.5 text-xs font-semibold backdrop-blur"
                    style={{ width: LABEL_WIDTH }}
                  >
                    {room.roomTitle}
                  </div>
                  <div className="flex-1" />
                </div>

                {room.beds.map((bed) => {
                  const bedBookings = visibleBookings.filter(
                    (booking) => booking.bed.id === bed.id,
                  );
                  const todayIdx = days.findIndex((day) => isToday(day));

                  return (
                    <div key={bed.id} className="flex border-b last:border-b-0">
                      <div
                        className="sticky left-0 z-10 flex h-12 shrink-0 items-center border-r bg-background px-3 text-sm"
                        style={{ width: LABEL_WIDTH }}
                      >
                        Bed {bed.bedNo}
                      </div>
                      <div className="relative h-12 flex-1">
                        <div
                          className="absolute inset-0 grid"
                          style={{
                            gridTemplateColumns: `repeat(${totalDays}, minmax(${colMinWidth}px, 1fr))`,
                          }}
                        >
                          {days.map((day) => (
                            <div
                              key={day.toISOString()}
                              className={`border-r border-border/40 last:border-r-0 ${
                                isToday(day) ? "bg-primary/5" : ""
                              }`}
                            />
                          ))}
                        </div>

                        {todayIdx >= 0 && (
                          <div
                            className="absolute bottom-0 top-0 z-[5] w-px bg-primary/60"
                            style={{
                              left: `${((todayIdx + 0.5) / totalDays) * 100}%`,
                            }}
                          />
                        )}

                        {bedBookings.map((booking) => {
                          const segment = barSegments(booking);
                          if (!segment) return null;
                          const style = BOOKING_STATUS_STYLES[booking.status];
                          return (
                            <button
                              key={booking.id}
                              type="button"
                              onClick={() => onOpenBooking(booking)}
                              title={`${booking.guest.firstName} ${booking.guest.lastName ?? ""} · ${format(parseISO(booking.startDate), "MMM d")} – ${format(parseISO(booking.endDate), "MMM d")}`}
                              className={`absolute bottom-1.5 top-1.5 z-[6] overflow-hidden truncate rounded-md px-2 text-left text-xs font-medium transition-opacity hover:opacity-85 ${style.bar}`}
                              style={segment}
                            >
                              {booking.guest.firstName}
                              {booking.guest.lastName
                                ? ` ${booking.guest.lastName}`
                                : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
