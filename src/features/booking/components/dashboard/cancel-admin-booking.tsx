"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCancelAdminBooking } from "../../hooks/use-booking";
import { useState } from "react";

export function CancelAdminBookingModal({
  propertyId,
  bookingId,
  onCancelled,
  open: controlledOpen,
  onOpenChange,
}: {
  propertyId: string;
  bookingId: string;
  onCancelled?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (!isControlled) setInternalOpen(next);
  };
  const cancelAdminBooking = useCancelAdminBooking(propertyId, bookingId);

  function handleCancel() {
    cancelAdminBooking.mutate(undefined, {
      onSuccess: () => {
        toast.success("Booking cancelled successfully");
        setOpen(false)
        onCancelled?.();
      },
      onError: (error) => {
        toast.error("Failed to cancel booking", {
          description: error.message || "Something went wrong.",
          position: "bottom-right",
          classNames: {
            content: "flex flex-col gap-2",
          },
          style: {
            "--border-radius": "calc(var(--radius)  + 4px)",
          } as React.CSSProperties,
        });
      },
    });
  }

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <AlertDialogTrigger asChild>
          <span className="cursor-pointer">Cancel Booking</span>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
          <AlertDialogDescription>
            The booking will be marked as cancelled and the bed will be freed
            for other guests. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep booking</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={cancelAdminBooking.isPending}
            onClick={() => handleCancel()}
            className="min-w-[120px]"
          >
            {cancelAdminBooking.isPending ? "Cancelling..." : "Cancel booking"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
