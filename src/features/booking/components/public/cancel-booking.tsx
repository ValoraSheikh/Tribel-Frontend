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
import { useCancelBooking } from "../../hooks/use-booking";
import { useState } from "react";

const formatMoney = (amount: number) =>
  amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export function CancelBookingModal({
  bookingId,
  onCancelled,
  open: controlledOpen,
  onOpenChange,
}: {
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
  const cancelBooking = useCancelBooking(bookingId);

  function handleCancel() {
    cancelBooking.mutate(undefined, {
      onSuccess: (result) => {
        if (result.refundRequired) {
          toast.info("Booking cancelled", {
            description: `${formatMoney(result.refundSummary.refundableAmount)} is refundable — the property will process the refund.`,
          });
        } else {
          toast.success("Booking cancelled successfully");
        }
        setOpen(false);
        onCancelled?.();
      },
      onError: (error) => {
        toast.error("Failed to cancel booking", {
          description: error.message || "Something went wrong.",
          position: "bottom-right",
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
            Your stay dates will be released back to the property. Any refund is
            processed by the property. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep booking</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={cancelBooking.isPending}
            onClick={() => handleCancel()}
            className="min-w-[120px]"
          >
            {cancelBooking.isPending ? "Cancelling..." : "Cancel booking"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
