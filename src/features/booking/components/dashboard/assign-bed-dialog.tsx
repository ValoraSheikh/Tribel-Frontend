"use client";

import { useMemo, useState } from "react";
import { BedDouble, Check, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOccupancy, useAssignBookingBed } from "../../hooks/use-booking";
import { isOccupancyStatus } from "../../lib/status";

interface AssignBedDialogProps {
  propertyId: string;
  bookingId: string;
  roomTemplateId: string;
  startDate: string;
  endDate: string;
  guestName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: () => void;
}

/**
 * Lists every bed of the booked room template for the booking's exact date
 * range. Free beds are selectable; occupied beds stay visible with their
 * current guest. Select a bed, then confirm the assignment.
 */
export function AssignBedDialog({
  propertyId,
  bookingId,
  roomTemplateId,
  startDate,
  endDate,
  guestName,
  open,
  onOpenChange,
  onAssigned,
}: AssignBedDialogProps) {
  const { data, isLoading } = useOccupancy(propertyId, startDate, endDate);
  const assignBed = useAssignBookingBed(propertyId, bookingId);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);

  const handleDialogChange = (next: boolean) => {
    if (!next) setSelectedBedId(null);
    onOpenChange(next);
  };

  const { rooms, occupantByBed, totalFree, totalBeds } = useMemo(() => {
    const activeBookings = (data?.bookings ?? []).filter(
      (b) => isOccupancyStatus(b.status) && b.bed?.id,
    );

    const occupantByBed = new Map<string, string>();
    const bookedBedIds = new Set<string>();
    for (const booking of activeBookings) {
      if (!booking.bed) continue;
      bookedBedIds.add(booking.bed.id);
      const name = [booking.guest?.firstName, booking.guest?.lastName]
        .filter(Boolean)
        .join(" ");
      occupantByBed.set(booking.bed.id, name || "Guest");
    }
    
    console.log("roomTemplateId in here", roomTemplateId)

    const templateBeds = (data?.beds ?? []).filter(
      (bed) => bed.room.roomTemplateId === roomTemplateId,
    );
    
    console.log("templateBeds in here", templateBeds)

    const grouped = new Map<
      string,
      { roomId: string; beds: typeof templateBeds }
    >();
    for (const bed of templateBeds) {
      const existing = grouped.get(bed.room.title);
      if (existing) {
        existing.beds.push(bed);
      } else {
        grouped.set(bed.room.title, { roomId: bed.room.id, beds: [bed] });
      }
    }

    const rooms = Array.from(grouped.entries()).map(([roomTitle, { beds }]) => ({
      roomTitle,
      beds,
    }));

    console.log("rooms in here", rooms)

    return {
      rooms,
      occupantByBed,
      totalFree: templateBeds.filter((bed) => !bookedBedIds.has(bed.id)).length,
      totalBeds: templateBeds.length,
    };
  }, [data, roomTemplateId]);

  const allBeds = rooms.flatMap((room) => room.beds);
  const selectedBed = allBeds.find((bed) => bed.id === selectedBedId) ?? null;

  const handleAssign = () => {
    if (!selectedBed) return;
    assignBed.mutate(selectedBed.id, {
      onSuccess: () => {
        toast.success(`Bed ${selectedBed.bedNo} assigned to ${guestName}`);
        onOpenChange(false);
        onAssigned?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent
        className="flex h-full max-h-full w-full max-w-full flex-col rounded-none border-0 gap-4 p-4 sm:h-auto sm:max-h-[85vh] sm:max-w-4xl sm:rounded-lg sm:border sm:p-6"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Assign a bed</DialogTitle>
          <DialogDescription>
            Every bed in the booked room type for {guestName}&apos;s stay (
            {new Date(startDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}{" "}
            →{" "}
            {new Date(endDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
            ). Select a free bed, then confirm.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading beds...
          </div>
        ) : totalBeds === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            <span>
              <BedDouble className="mx-auto mb-2 h-6 w-6" />
              No beds are configured for this room type yet.
            </span>
          </div>
        ) : (
          <div className="-mx-1 flex-1 space-y-4 overflow-y-auto px-1">
            {rooms.map((room) => (
              <div key={room.roomTitle} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {room.roomTitle}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {room.beds.map((bed) => {
                    const occupant = occupantByBed.get(bed.id);
                    const isFree = !occupant;
                    const isSelected = selectedBedId === bed.id;

                    return (
                      <button
                        key={bed.id}
                        type="button"
                        disabled={!isFree || assignBed.isPending}
                        aria-pressed={isSelected}
                        onClick={() =>
                          setSelectedBedId(isSelected ? null : bed.id)
                        }
                        className={cn(
                          "flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                          isFree
                            ? isSelected
                              ? "border-primary bg-primary/10 font-medium text-primary ring-2 ring-primary/30"
                              : "border-border bg-background hover:border-primary/50 hover:bg-accent"
                            : "cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          <BedDouble className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">Bed {bed.bedNo}</span>
                        </span>
                        {isFree ? (
                          isSelected ? (
                            <Check className="h-4 w-4 shrink-0" />
                          ) : (
                            <span className="text-xs text-emerald-600">
                              Free
                            </span>
                          )
                        ) : (
                          <span className="flex min-w-0 items-center gap-1 text-xs">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate">{occupant}</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {totalFree} of {totalBeds} beds free for these dates
          </p>
          <Button
            className="w-full max-sm:h-11 sm:w-auto"
            disabled={!selectedBed || assignBed.isPending}
            onClick={handleAssign}
          >
            {assignBed.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {assignBed.isPending
              ? "Assigning..."
              : selectedBed
                ? `Assign Bed ${selectedBed.bedNo}`
                : "Select a bed to assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
