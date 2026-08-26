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
}: {
  propertyId: string;
  bookingId: string;
  onCancelled?: () => void;
}) {
  const [open, setOpen] = useState<boolean>(false)
  const cancelAdminBooking = useCancelAdminBooking(propertyId, bookingId);

  function handleCancel() {
    cancelAdminBooking.mutate(undefined, {
      onSuccess: () => {
        toast.success("Booking cancelled successfully ");
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <span className="cursor-pointer">Cancel Booking</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will cancel booking.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelAdminBooking.isPending}
              onClick={() => handleCancel()}
              className="min-w-[100px]"
            >
              {cancelAdminBooking.isPending
                ? "Cancelling..."
                : "Cancel Booking"}
            </Button>
          </>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
