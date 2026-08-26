"use client";

import { useMemo } from "react";
import {
  differenceInCalendarDays,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parseAsString, useQueryState } from "nuqs";
import { OccupancyBooking } from "../../api/booking.api";
import { useOccupancy } from "../../hooks/use-booking";
import { isOccupancyStatus } from "../../lib/status";

type BedDayState = "free" | "occupied" | "arriving" | "departing";

const STATE_STYLES: Record<BedDayState, string> = {
  free: "border bg-background text-muted-foreground",
  occupied: "border border-blue-600 bg-blue-500 text-white",
  arriving: "border border-emerald-600 bg-emerald-500 text-white",
  departing: "border border-orange-500 bg-orange-400 text-white",
};

const STATE_LABELS: Record<BedDayState, string> = {
  free: "Free",
  occupied: "Occupied",
  arriving: "Arriving",
  departing: "Departing",
};

interface TheaterViewProps {
  propertyId: string;
  onOpenBooking: (booking: OccupancyBooking) => void;
}

export const TheaterView = ({ propertyId, onOpenBooking }: TheaterViewProps) => {
  const [day, setDay] = useQueryState(
    "day",
    parseAsString.withDefault(format(new Date(), "yyyy-MM-dd")),
  );

  const selectedDay = useMemo(() => parseISO(day), [day]);
  const monthStart = startOfMonth(selectedDay);
  const monthEnd = endOfMonth(selectedDay);

  const { data, isLoading, isError, error } = useOccupancy(
    propertyId,
    format(monthStart, "yyyy-MM-dd"),
    format(monthEnd, "yyyy-MM-dd"),
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

  const bookingsByBed = useMemo(() => {
    const map = new Map<string, OccupancyBooking[]>();
    for (const booking of data?.bookings ?? []) {
      if (!isOccupancyStatus(booking.status)) continue;
      const list = map.get(booking.bed.id) ?? [];
      list.push(booking);
      map.set(booking.bed.id, list);
    }
    return map;
  }, [data?.bookings]);

  const bedState = (
    bedId: string,
  ): { state: BedDayState; booking: OccupancyBooking | null } => {
    const bookings = bookingsByBed.get(bedId) ?? [];

    const arriving = bookings.find(
      (b) => differenceInCalendarDays(parseISO(b.startDate), selectedDay) === 0,
    );
    if (arriving) return { state: "arriving", booking: arriving };

    const staying = bookings.find(
      (b) =>
        differenceInCalendarDays(parseISO(b.startDate), selectedDay) < 0 &&
        differenceInCalendarDays(parseISO(b.endDate), selectedDay) > 0,
    );
    if (staying) return { state: "occupied", booking: staying };

    const departing = bookings.find(
      (b) => differenceInCalendarDays(parseISO(b.endDate), selectedDay) === 0,
    );
    if (departing) return { state: "departing", booking: departing };

    return { state: "free", booking: null };
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDay, "EEE, MMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={(date) => {
                if (date) setDay(format(date, "yyyy-MM-dd"));
              }}
            />
          </PopoverContent>
        </Popover>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {(Object.keys(STATE_LABELS) as BedDayState[]).map((state) => (
            <span
              key={state}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className={`h-3 w-3 rounded-sm ${STATE_STYLES[state]}`}
              />
              {STATE_LABELS[state]}
            </span>
          ))}
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="flex h-[30vh] items-center justify-center text-sm text-muted-foreground">
          No beds configured for this property yet.
        </div>
      ) : (
        <div className="space-y-6 rounded-lg border p-4">
          {rooms.map((room) => (
            <div key={room.roomId} className="space-y-2">
              <h3 className="text-sm font-semibold">{room.roomTitle}</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
                {room.beds.map((bed) => {
                  const { state, booking } = bedState(bed.id);
                  const clickable = booking !== null;
                  return (
                    <button
                      key={bed.id}
                      type="button"
                      disabled={!clickable}
                      onClick={() => booking && onOpenBooking(booking)}
                      title={
                        booking
                          ? `${booking.guest.firstName} ${booking.guest.lastName ?? ""} · ${format(parseISO(booking.startDate), "MMM d")} – ${format(parseISO(booking.endDate), "MMM d")}`
                          : `Bed ${bed.bedNo} · free`
                      }
                      className={`flex h-14 flex-col items-center justify-center rounded-lg text-xs font-medium transition-opacity ${STATE_STYLES[state]} ${
                        clickable
                          ? "cursor-pointer hover:opacity-85"
                          : "cursor-default"
                      }`}
                    >
                      <span>B{bed.bedNo}</span>
                      <span className="max-w-full truncate px-1 text-[10px] opacity-90">
                        {booking
                          ? booking.guest.firstName
                          : STATE_LABELS[state]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
