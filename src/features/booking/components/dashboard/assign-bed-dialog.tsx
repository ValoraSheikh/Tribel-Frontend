"use client";

import { useMemo } from "react";
import { BedDouble, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
}

/**
 * Shows the beds of the booked room template that are free for the booking's
 * exact date range. Free = no other active booking overlapping the window on
 * that bed. Grouped by room; one tap assigns.
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
}: AssignBedDialogProps) {
  const { data, isLoading } = useOccupancy(propertyId, startDate, endDate);
  const assignBed = useAssignBookingBed(propertyId, bookingId);

  const rooms = useMemo(() => {
    const activeBookings = (data?.bookings ?? []).filter((b) =>
      isOccupancyStatus(b.status),
    );
    const bookedBedIds = new Set(
      activeBookings.map((b) => b.bed?.id).filter((id): id is string => Boolean(id)),
    );

    const templateBeds = (data?.beds ?? []).filter(
      (bed) => bed.room.roomTemplateId === roomTemplateId,
    );

    const grouped = new Map<string, { roomId: string; beds: typeof templateBeds }>();
    for (const bed of templateBeds) {
      if (bookedBedIds.has(bed.id)) continue;
      const existing = grouped.get(bed.room.title);
      if (existing) {
        existing.beds.push(bed);
      } else {
        grouped.set(bed.room.title, { roomId: bed.room.id, beds: [bed] });
      }
    }

    return Array.from(grouped.entries()).map(([roomTitle, { beds }]) => ({
      roomTitle,
      beds,
    }));
  }, [data, roomTemplateId]);

  const totalFree = rooms.reduce((sum, room) => sum + room.beds.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign a bed</DialogTitle>
          <DialogDescription>
            Free beds for {guestName}&apos;s dates (
            {new Date(startDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}{" "}
            →{" "}
            {new Date(endDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
            ). Tap a bed to assign it.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading beds...
          </div>
        ) : totalFree === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            <BedDouble className="mx-auto mb-2 h-6 w-6" />
            No free beds in this room type for the selected dates. Cancel the
            booking and refund the guest, or free a bed first.
          </div>
        ) : (
          <div className="max-h-[50vh] space-y-4 overflow-y-auto">
            {rooms.map((room) => (
              <div key={room.roomTitle} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {room.roomTitle}
                </p>
                <div className="flex flex-wrap gap-2">
                  {room.beds.map((bed) => (
                    <Button
                      key={bed.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-9"
                      disabled={assignBed.isPending}
                      onClick={() =>
                        assignBed.mutate(bed.id, {
                          onSuccess: () => {
                            toast.success(
                              `Bed ${bed.bedNo} assigned`,
                            );
                            onOpenChange(false);
                          },
                        })
                      }
                    >
                      <BedDouble className="mr-1 h-3.5 w-3.5" />
                      Bed {bed.bedNo}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
