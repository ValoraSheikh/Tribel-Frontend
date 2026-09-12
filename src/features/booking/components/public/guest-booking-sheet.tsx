"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { XIcon } from "lucide-react";
import { invoiceApi } from "@/features/invoice/api/invoice.api";
import { BookingProps } from "../../api/booking.api";
import { BookingDetailsBody } from "../dashboard/booking-details";
import { CancelBookingModal } from "./cancel-booking";
import { ChangeDatesDialog } from "./change-dates-dialog";

interface GuestBookingSheetProps {
  booking: BookingProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Guest-facing booking details sheet. Shows the same rich details the admin
 * drawer renders, with guest-safe actions only: download invoice, change
 * dates (pending bookings) and cancel (pre-arrival).
 */
export function GuestBookingSheet({
  booking,
  open,
  onOpenChange,
}: GuestBookingSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [datesOpen, setDatesOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const handleSheetOpenChange = (next: boolean) => {
    if (!next) {
      setDatesOpen(false);
      setCancelOpen(false);
    }
    onOpenChange(next);
  };

  const status = booking?.status;
  const cancellable =
    (status === "PENDING" || status === "CONFIRMED") &&
    Boolean(booking) &&
    new Date(booking!.startDate) > new Date() &&
    !(
      booking?.paymentMode === "OFFLINE" &&
      booking?.paymentStatus === "PAID"
    );
  const canChangeDates =
    status === "PENDING" &&
    Boolean(booking) &&
    new Date(booking!.startDate) > new Date();

  const handleDownloadInvoice = async (bookingId: string) => {
    try {
      const result = await invoiceApi.getInvoice(bookingId);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch (error) {
      const message =
        (
          error as {
            response?: { data?: { message?: string } };
          }
        )?.response?.data?.message ?? "Failed to download invoice";
      toast.error(message);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        showCloseButton={false}
        className={`flex w-full flex-col overflow-hidden p-0 gap-0 sm:max-w-lg ${
          isDesktop ? "h-full" : "h-[85vh] rounded-t-2xl"
        }`}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Booking details</SheetTitle>
          <SheetDescription>
            {booking ? `Booking ${booking.id}` : "Booking details"}
          </SheetDescription>
        </SheetHeader>

        {/* Floats over the cover image, so it carries its own contrast rather
            than sitting on top of whatever block happens to be first. */}
        <SheetClose
          aria-label="Close"
          className="absolute top-3 right-3 z-20 grid size-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65 focus:ring-2 focus:ring-white/70 focus:outline-hidden"
        >
          <XIcon className="size-4" />
        </SheetClose>

        {booking && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <BookingDetailsBody booking={booking} />
            </div>

            <div className="space-y-3 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
                <button
                  type="button"
                  disabled={!booking.invoiceId}
                  className={
                    booking.invoiceId
                      ? "text-muted-foreground transition-colors hover:text-foreground hover:underline"
                      : "cursor-not-allowed text-muted-foreground/50"
                  }
                  onClick={() => handleDownloadInvoice(booking.id)}
                >
                  Download invoice
                </button>
                {canChangeDates && (
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    onClick={() => setDatesOpen(true)}
                  >
                    Change dates
                  </button>
                )}
                {cancellable && (
                  <button
                    type="button"
                    className="text-destructive transition-colors hover:text-destructive/80 hover:underline"
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel booking
                  </button>
                )}
              </div>

              <ChangeDatesDialog
                bookingId={booking.id}
                startDate={booking.startDate}
                endDate={booking.endDate}
                open={datesOpen}
                onOpenChange={setDatesOpen}
              />
              <CancelBookingModal
                bookingId={booking.id}
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                onCancelled={() => {
                  setCancelOpen(false);
                  onOpenChange(false);
                }}
              />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
