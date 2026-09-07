"use client";

import { useSyncExternalStore, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BedDouble, Check, X, Download } from "lucide-react";
import { BookingProps, OccupancyBooking } from "../../api/booking.api";
import { BookingDetailsBody } from "./booking-details";
import { CancelAdminBookingModal } from "./cancel-admin-booking";
import { AssignBedDialog } from "./assign-bed-dialog";
import {
  MarkBookingPaidModal,
  RecordBookingRefundModal,
} from "./payment-actions";
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
    roomTemplateId: booking.room?.roomTemplateId ?? "",
    roomId: booking.room?.id ?? null,
    guestId: booking.guest.id,
    status: booking.status,
    totalPrice: booking.totalPrice,
    startDate: booking.startDate,
    endDate: booking.endDate,
    paymentMode: booking.paymentMode,
    paymentStatus: booking.paymentStatus,
    room: booking.room ? { title: booking.room.title } : null,
    bed: booking.bed ? { bedNo: booking.bed.bedNo } : null,
    guest: {
      firstName: booking.guest.firstName,
      lastName: booking.guest.lastName,
      email: booking.guest.email,
      phoneNo: booking.guest.phoneNo,
      avatar: booking.guest.avatar,
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
    cancelledAt: null,
    bedId: booking.bed?.id ?? null,
    invoiceId: booking.invoiceId,
    invoice: booking.invoice,
  };
};

/** IST-day check: the booking's check-in date has arrived or passed. */
function hasCheckinArrived(startDate: string): boolean {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date(startDate)) <= formatter.format(new Date());
}

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
  const [assignOpen, setAssignOpen] = useState(false);

  const handleSheetOpenChange = (next: boolean) => {
    if (!next) setAssignOpen(false);
    onOpenChange(next);
  };

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
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
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
              {(displayBooking.status === "PENDING" ||
                displayBooking.status === "CONFIRMED") &&
                hasCheckinArrived(displayBooking.startDate) && (
                  <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    {displayBooking.bed
                      ? "This booking's stay has started but is still awaiting your approval."
                      : "This booking's stay has started with no bed assigned. Assign a bed below, then approve."}
                  </div>
                )}
              <BookingDetailsBody booking={toBookingProps(displayBooking)} />
            </div>

            <div className="border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-2">
              {displayBooking.status === "PENDING" && (
                <div className="flex gap-2 max-sm:flex-col">
                  <Button
                    className="max-sm:h-11 flex-1"
                    disabled={updateStatus.isPending}
                    onClick={() => handleStatusAction("APPROVE")}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    className="max-sm:h-11 flex-1"
                    variant="destructive"
                    disabled={updateStatus.isPending}
                    onClick={() => handleStatusAction("REJECT")}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}

              {!displayBooking.bed &&
                (displayBooking.status === "CONFIRMED" ||
                  displayBooking.status === "PENDING") && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full max-sm:h-11"
                      onClick={() => setAssignOpen(true)}
                    >
                      <BedDouble className="mr-1 h-4 w-4" />
                      Assign bed
                    </Button>
                    <AssignBedDialog
                      propertyId={propertyId}
                      bookingId={displayBooking.id}
                      roomTemplateId={displayBooking.room?.roomTemplateId ?? ""}
                      startDate={displayBooking.startDate}
                      endDate={displayBooking.endDate}
                      guestName={`${displayBooking.guest?.firstName ?? "Guest"} ${
                        displayBooking.guest?.lastName ?? ""
                      }`.trim()}
                      open={assignOpen}
                      onOpenChange={setAssignOpen}
                    />
                  </>
                )}

              <div className="flex gap-2 max-sm:flex-col">
                <Button
                  className="max-sm:h-11 flex-1"
                  variant="outline"
                  disabled={!displayBooking.invoiceId}
                  onClick={() => handleDownloadInvoice(displayBooking.id)}
                >
                  <Download className="mr-1 h-4 w-4" />
                  Invoice
                </Button>
              </div>

              {displayBooking.paymentMode === "OFFLINE" &&
                displayBooking.paymentStatus === "PENDING" && (
                  <MarkBookingPaidModal
                    propertyId={propertyId}
                    bookingId={displayBooking.id}
                    guestName={`${displayBooking.guest?.firstName ?? "Guest"} ${
                      displayBooking.guest?.lastName ?? ""
                    }`.trim()}
                  />
                )}

              {(displayBooking.paymentStatus === "PAID" ||
                displayBooking.paymentStatus === "PARTIALLY_PAID") && (
                <RecordBookingRefundModal
                  propertyId={propertyId}
                  bookingId={displayBooking.id}
                  guestName={`${displayBooking.guest?.firstName ?? "Guest"} ${
                    displayBooking.guest?.lastName ?? ""
                  }`.trim()}
                  total={Number(displayBooking.totalPrice)}
                  paymentMode={displayBooking.paymentMode}
                />
              )}

              {displayBooking.status !== "CANCELLED" &&
                displayBooking.status !== "REJECTED" &&
                displayBooking.status !== "COMPLETED" && (
                  <Button
                    className="max-sm:h-11 w-full"
                    variant="ghost"
                  >
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
