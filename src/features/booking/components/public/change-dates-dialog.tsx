"use client";

import { format } from "date-fns";
import { CalendarDays, Loader2 } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUpdateGuestBookingDates } from "../../hooks/use-booking";

interface ChangeDatesDialogProps {
  bookingId: string;
  startDate: string;
  endDate: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Lets a guest reschedule a booking that hasn't started yet. Picks a new
 * range, re-checks availability server-side and re-prices the booking.
 */
export function ChangeDatesDialog({
  bookingId,
  startDate,
  endDate,
  open,
  onOpenChange,
}: ChangeDatesDialogProps) {
  const updateDates = useUpdateGuestBookingDates(bookingId);
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(startDate),
    to: new Date(endDate),
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDialogChange = (next: boolean) => {
    if (next) {
      setRange({ from: new Date(startDate), to: new Date(endDate) });
    }
    onOpenChange(next);
  };

  const valid =
    Boolean(range?.from) &&
    Boolean(range?.to) &&
    range!.from! < range!.to!;

  const changed =
    (range?.from &&
      format(range.from, "yyyy-MM-dd") !==
        format(new Date(startDate), "yyyy-MM-dd")) ||
    (range?.to &&
      format(range.to, "yyyy-MM-dd") !==
        format(new Date(endDate), "yyyy-MM-dd"));

  const handleSave = () => {
    if (!range?.from || !range?.to) return;
    updateDates.mutate(
      { startDate: range.from, endDate: range.to },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change stay dates</DialogTitle>
          <DialogDescription>
            Pick new check-in and check-out dates. Availability is re-checked
            and the total is recalculated.
          </DialogDescription>
        </DialogHeader>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal max-sm:h-11",
                !range && "text-muted-foreground",
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {range?.from ? (
                range.to ? (
                  <>
                    {format(range.from, "dd MMM yyyy")} —{" "}
                    {format(range.to, "dd MMM yyyy")}
                  </>
                ) : (
                  format(range.from, "dd MMM yyyy")
                )
              ) : (
                "Pick your stay dates"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={1}
              disabled={(date) => date < today}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleDialogChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid || !changed || updateDates.isPending}
            onClick={handleSave}
          >
            {updateDates.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {updateDates.isPending ? "Saving..." : "Save new dates"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
