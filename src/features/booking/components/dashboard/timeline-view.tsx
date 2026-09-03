"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
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
import { useMediaQuery } from "@/hooks/use-media-query";
import { OccupancyBooking } from "../../api/booking.api";
import type { RoomTemplateProps } from "../../../room-template/api/room-template.api";
import { useOccupancy } from "../../hooks/use-booking";
import {
  BOOKING_STATUS_STYLES,
  OCCUPANCY_STATUSES,
  isOccupancyStatus,
} from "../../lib/status";

interface TimelineViewProps {
  propertyId: string;
  templates?: RoomTemplateProps[];
  templateId?: string | null;
  onOpenBooking: (booking: OccupancyBooking) => void;
}

export const TimelineView = ({
  propertyId,
  templates,
  templateId,
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

  // Mobile: force Week span (a month of columns can't fit a phone).
  const isMobile = useMediaQuery("(max-width: 767px)");
  const effectiveSpan: "week" | "month" = isMobile ? "week" : span;

  const { windowStart, windowEnd, days } = useMemo(() => {
    const start =
      effectiveSpan === "month"
        ? startOfMonth(anchorDate)
        : startOfWeek(anchorDate, { weekStartsOn: 1 });
    const end =
      effectiveSpan === "month"
        ? endOfMonth(anchorDate)
        : endOfWeek(anchorDate, { weekStartsOn: 1 });
    return {
      windowStart: start,
      windowEnd: end,
      days: eachDayOfInterval({ start, end }),
    };
  }, [anchorDate, effectiveSpan]);

  const { data, isLoading, isError, error } = useOccupancy(
    propertyId,
    format(windowStart, "yyyy-MM-dd"),
    format(windowEnd, "yyyy-MM-dd"),
  );

  const rooms = useMemo(() => {
    const beds = data?.beds ?? [];
    const grouped = new Map<
      string,
      {
        roomId: string;
        roomTitle: string;
        roomTemplateId: string;
        beds: typeof beds;
      }
    >();
    for (const bed of beds) {
      const existing = grouped.get(bed.room.id);
      if (existing) {
        existing.beds.push(bed);
      } else {
        grouped.set(bed.room.id, {
          roomId: bed.room.id,
          roomTitle: bed.room.title,
          roomTemplateId: bed.room.roomTemplateId,
          beds: [bed],
        });
      }
    }
    return Array.from(grouped.values());
  }, [data?.beds]);

  // Group rooms under their room template, honoring the ?template= filter.
  const templateGroups = useMemo(() => {
    const filtered = templateId
      ? rooms.filter((room) => room.roomTemplateId === templateId)
      : rooms;

    const byTemplate = new Map<string, typeof rooms>();
    for (const room of filtered) {
      const list = byTemplate.get(room.roomTemplateId) ?? [];
      list.push(room);
      byTemplate.set(room.roomTemplateId, list);
    }

    return Array.from(byTemplate.entries()).map(([id, rooms]) => ({
      templateId: id,
      templateTitle: templates?.find((t) => t.id === id)?.title ?? "Rooms",
      rooms,
    }));
  }, [rooms, templateId, templates]);

  const visibleBookings = useMemo(
    () =>
      (data?.bookings ?? []).filter((booking) =>
        isOccupancyStatus(booking.status),
      ),
    [data?.bookings],
  );

  const totalDays = days.length;

  // Responsive sizing: the label column shrinks on mobile; day columns shrink
  // to fit the container (color bands + tooltips at small sizes) and only
  // scroll horizontally below a bare 20px/day minimum.
  const labelWidth = isMobile ? 88 : 160;
  const colMinWidth = isMobile ? 32 : effectiveSpan === "month" ? 20 : 96;

  // Measure a stable wrapper (not the scroll container itself — its box shifts
  // by the scrollbar width and would feed a resize loop back into `fits`).
  const measureRef = useRef<HTMLDivElement | null>(null);
  const containerWidthRef = useRef(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.round(entry.contentRect.width);
        if (width !== containerWidthRef.current) {
          containerWidthRef.current = width;
          setContainerWidth(width);
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const innerMinWidth = labelWidth + totalDays * colMinWidth;
  const fits = containerWidth === 0 || containerWidth >= innerMinWidth + 8;
  const perDay = fits
    ? containerWidth > 0
      ? (containerWidth - labelWidth) / totalDays
      : colMinWidth
    : colMinWidth;
  const gridTemplateColumns = `repeat(${totalDays}, ${
    fits ? "minmax(0, 1fr)" : `${colMinWidth}px`
  })`;

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
      days: endIdxExclusive - startIdx,
    };
  };

  const headerLabel =
    effectiveSpan === "month"
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

        <div className="hidden sm:block">
          <Tabs
            value={span}
            onValueChange={(v) => setSpan(v as "week" | "month")}
          >
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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

      {templateGroups.length === 0 ? (
        <div className="flex h-[30vh] items-center justify-center text-sm text-muted-foreground">
          {templateId
            ? "No beds for this room type yet."
            : "No beds configured for this property yet."}
        </div>
      ) : (
        <div ref={measureRef}>
          {/* overflow-y-scroll keeps the scrollbar width constant so the
              measured container never feeds back into the layout */}
          <div className="max-h-[60vh] overflow-y-scroll overflow-x-auto rounded-lg border">
            <div style={fits ? undefined : { minWidth: innerMinWidth }}>
            <div className="sticky top-0 z-20 flex border-b bg-muted">
              <div
                className="sticky left-0 z-10 shrink-0 border-r bg-muted px-3 py-2 text-xs font-medium text-muted-foreground"
                style={{ width: labelWidth }}
              >
                Room / Bed
              </div>
              <div
                className="grid flex-1"
                style={{ gridTemplateColumns: gridTemplateColumns }}
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
                    <div>
                      {format(
                        day,
                        effectiveSpan === "month" || isMobile ? "d" : "EEE d",
                      )}
                    </div>
                    {(effectiveSpan === "month" || isMobile) && (
                      <div className="text-[10px] uppercase">
                        {format(day, "EEE")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {templateGroups.map((group) => (
              <Fragment key={group.templateId}>
                {/* Template section header */}
                <div className="flex border-b border-l-4 border-l-primary bg-primary/10">
                  <div className="sticky left-0 z-10 flex h-9 w-full items-center bg-primary/10 px-3 text-xs font-bold uppercase tracking-wider text-primary">
                    {group.templateTitle}
                  </div>
                </div>

                {group.rooms.map((room) => (
                  <div key={room.roomId}>
                    <div className="flex border-b bg-muted/20">
                      <div
                        className="sticky left-0 z-10 shrink-0 truncate border-r bg-muted px-3 py-1.5 text-xs font-semibold"
                        style={{ width: labelWidth }}
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
                        style={{ width: labelWidth }}
                      >
                        Bed {bed.bedNo}
                      </div>
                      <div className="relative h-12 flex-1">
                        <div
                          className="absolute inset-0 grid"
                          style={{ gridTemplateColumns: gridTemplateColumns }}
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
                          const showName = segment.days * perDay >= 48;
                          return (
                            <button
                              key={booking.id}
                              type="button"
                              onClick={() => onOpenBooking(booking)}
                              title={`${booking.guest.firstName} ${booking.guest.lastName ?? ""} · ${format(parseISO(booking.startDate), "MMM d")} – ${format(parseISO(booking.endDate), "MMM d")}`}
                              className={`absolute bottom-1.5 top-1.5 z-[6] overflow-hidden truncate rounded-md px-2 text-left text-xs font-medium transition-opacity hover:opacity-85 ${style.bar}`}
                              style={segment}
                            >
                              {showName && (
                                <>
                                  {booking.guest.firstName}
                                  {booking.guest.lastName
                                    ? ` ${booking.guest.lastName}`
                                    : ""}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
