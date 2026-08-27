"use client";

import { useSyncExternalStore, useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, X, Download, ArrowUpRight } from "lucide-react";
import { BookingProps, OccupancyBooking } from "../../api/booking.api";
import { BookingDetailsBody } from "./booking-details";
import { CancelAdminBookingModal } from "./cancel-admin-booking";
import { useUpdateBookingStatus } from "../../hooks/use-booking";
import type { BookingStatus } from "../../lib/status";
import { invoiceApi } from "@/features/invoice/api/invoice.api";
import { toast } from "sonner";

const useIsDesktop = () => {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia("(min-width: 640px)");
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia("(min-width: 640px)").matches,
    () => true,
  );
};

const toBookingProps = (booking: OccupancyBooking): BookingProps => {
  return {
    id: booking.id,
    propertyId: booking.property.id,
    roomId: booking.room.id,
    guestId: booking.guest.id,
    status: booking.status,
    totalPrice: booking.totalPrice,
    startDate: booking.startDate,
    endDate: booking.endDate,
    paymentMode: booking.paymentMode,
    paymentStatus: booking.paymentStatus,
    room: { title: booking.room.title },
    bed: { bedNo: booking.bed.bedNo },
    guest: {
      firstName: booking.guest.firstName,
      lastName: booking.guest.lastName,
      email: booking.guest.email,
      phoneNo: booking.guest.phoneNo,
    },
    property: {
      id: booking.property.id,
      adminId: "",
      title: booking.property.title,
      type: "",
      gstin: "",
      address: booking.property.address,
      description: "",
      images: booking.property.images,
      city: booking.property.city,
      state: booking.property.state,
    },
    createdAt: "",
    updatedAt: "",
    cancelledAt: "",
    bedId: booking.bed.id,
    invoiceId: booking.invoiceId,
    invoice: booking.invoice,
  };
};

interface BookingDrawerProps {
  propertyId: string;
  booking: OccupancyBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BookingDrawer = ({
  propertyId,
  booking,
  open,
  onOpenChange,
}: BookingDrawerProps) => {
  const isDesktop = useIsDesktop();
  const updateStatus = useUpdateBookingStatus(propertyId);
  const [statusOverride, setStatusOverride] = useState<{
    bookingId: string;
    status: BookingStatus;
  } | null>(null);

  const displayBooking =
    booking && statusOverride?.bookingId === booking.id
      ? { ...booking, status: statusOverride.status }
      : booking;

  const handleStatusAction = (action: "APPROVE" | "REJECT") => {
    if (!booking) return;
    updateStatus.mutate(
      { bookingId: booking.id, action },
      {
        onSuccess: () => {
          setStatusOverride({
            bookingId: booking.id,
            status: action === "APPROVE" ? "CONFIRMED" : "REJECTED",
          });
        },
      },
    );
  };

  const handleDownloadInvoice = async (bookingId: string) => {
    try {
      const result = await invoiceApi.getAdminInvoice(bookingId);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch {
      toast.error("Failed to download invoice");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={`w-full overflow-y-auto p-0 gap-0 sm:max-w-md ${
          isDesktop ? "" : "max-h-[85vh] rounded-t-2xl"
        }`}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Booking details</SheetTitle>
          <SheetDescription>
            {displayBooking
              ? `Booking ${displayBooking.id}`
              : "Booking details"}
          </SheetDescription>
        </SheetHeader>

        {displayBooking && (
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto">
              <BookingDetailsBody booking={toBookingProps(displayBooking)} />
            </div>

            <div className="border-t bg-background p-4 space-y-2">
              {displayBooking.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={updateStatus.isPending}
                    onClick={() => handleStatusAction("APPROVE")}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    disabled={updateStatus.isPending}
                    onClick={() => handleStatusAction("REJECT")}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  disabled={!displayBooking.invoiceId}
                  onClick={() => handleDownloadInvoice(displayBooking.id)}
                >
                  <Download className="mr-1 h-4 w-4" />
                  Invoice
                </Button>
                <Button className="flex-1" variant="outline" asChild>
                  <Link
                    href={`/properties/${propertyId}/bookings/${displayBooking.id}`}
                  >
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    Details
                  </Link>
                </Button>
              </div>

              {displayBooking.status !== "CANCELLED" &&
                displayBooking.status !== "REJECTED" &&
                displayBooking.status !== "COMPLETED" && (
                  <Button className="w-full" variant="ghost">
                    <CancelAdminBookingModal
                      propertyId={propertyId}
                      bookingId={displayBooking.id}
                      onCancelled={() => onOpenChange(false)}
                    />
                  </Button>
                )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
