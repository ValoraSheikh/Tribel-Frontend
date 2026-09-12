"use client";

import { useSyncExternalStore, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, Circle, XIcon } from "lucide-react";
import {
  BookingProps,
  OccupancyBooking,
  refundSummaryOf,
} from "../../api/booking.api";
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
    roomTemplateId: booking.roomTemplateId,
    roomId: booking.room?.id ?? null,
    guestId: booking.guest.id,
    status: booking.status,
    totalPrice: booking.totalPrice,
    refunds: booking.refunds,
    startDate: booking.startDate,
    endDate: booking.endDate,
    paymentMode: booking.paymentMode,
    paymentStatus: booking.paymentStatus,
    refundSummary: booking.refundSummary,
    room: booking.room
      ? { id: booking.room.id, title: booking.room.title }
      : null,
    bed: booking.bed
      ? {
          id: booking.bed.id,
          bedNo: booking.bed.bedNo,
          roomId: booking.bed.roomId,
        }
      : null,
    guest: {
      id: booking.guest.id,
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
  const [cancelOpen, setCancelOpen] = useState(false);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  const handleSheetOpenChange = (next: boolean) => {
    if (!next) {
      setAssignOpen(false);
      setCancelOpen(false);
      setMarkPaidOpen(false);
      setRefundOpen(false);
    }
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

  const guestName =
    `${displayBooking?.guest?.firstName ?? "Guest"} ${displayBooking?.guest?.lastName ?? ""}`.trim();
  const status = displayBooking?.status;
  const isPending = status === "PENDING";
  const isConfirmed = status === "CONFIRMED";
  const isOngoing = status === "ONGOING";
  const isTerminal =
    status === "CANCELLED" || status === "REJECTED" || status === "COMPLETED";
  const bedAssigned = Boolean(displayBooking?.bed);
  const bedLabel = displayBooking?.bed ? `Bed ${displayBooking.bed.bedNo}` : "";
  const offlineUnpaid =
    displayBooking?.paymentMode === "OFFLINE" &&
    displayBooking?.paymentStatus === "PENDING";
  const refunds = displayBooking
    ? refundSummaryOf(displayBooking)
    : refundSummaryOf({});
  const canRefund =
    (displayBooking?.paymentStatus === "PAID" ||
      displayBooking?.paymentStatus === "PARTIALLY_PAID") &&
    refunds.refundableAmount > 0;
  const hasArrived = displayBooking
    ? hasCheckinArrived(displayBooking.startDate)
    : false;

  const checklist: { label: string; done: boolean }[] = [];
  if (isPending) {
    checklist.push(
      bedAssigned
        ? { label: `Bed assigned (${bedLabel})`, done: true }
        : { label: "Assign a bed", done: false },
      { label: "Approve booking", done: false },
    );
  } else if (isConfirmed) {
    checklist.push({ label: "Booking approved", done: true });
    checklist.push(
      bedAssigned
        ? { label: `Bed assigned (${bedLabel})`, done: true }
        : { label: "Assign a bed", done: false },
    );
    if (offlineUnpaid) {
      checklist.push({
        label: hasArrived ? "Collect payment" : "Collect payment (due by check-in)",
        done: false,
      });
    }
  } else if (isOngoing) {
    checklist.push({ label: "Guest checked in", done: true });
    if (offlineUnpaid) {
      checklist.push({ label: "Collect payment", done: false });
    }
  }

  let primary: { label: string; onClick: () => void; disabled?: boolean } | null =
    null;
  if (isPending && !bedAssigned) {
    primary = { label: "Assign bed & approve", onClick: () => setAssignOpen(true) };
  } else if (isPending) {
    primary = {
      label: "Approve booking",
      onClick: () => handleStatusAction("APPROVE"),
      disabled: updateStatus.isPending,
    };
  } else if (isConfirmed && !bedAssigned) {
    primary = { label: "Assign bed", onClick: () => setAssignOpen(true) };
  } else if (isOngoing && offlineUnpaid) {
    primary = { label: "Collect payment", onClick: () => setMarkPaidOpen(true) };
  }

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
        showCloseButton={false}
        className={`flex w-full flex-col overflow-hidden p-0 gap-0 sm:max-w-lg ${
          isDesktop ? "h-full" : "h-[85vh] rounded-t-2xl"
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

        {/* Floats over the cover image, so it carries its own contrast rather
            than sitting on top of whatever block happens to be first. */}
        <SheetClose
          aria-label="Close"
          className="absolute top-3 right-3 z-20 grid size-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65 focus:ring-2 focus:ring-white/70 focus:outline-hidden"
        >
          <XIcon className="size-4" />
        </SheetClose>

        {displayBooking && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <BookingDetailsBody booking={toBookingProps(displayBooking)} />
            </div>

            <div className="space-y-3 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {!isTerminal &&
                (displayBooking.status === "PENDING" ||
                  displayBooking.status === "CONFIRMED") &&
                hasCheckinArrived(displayBooking.startDate) && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    {displayBooking.bed
                      ? "This stay has started but the booking is still awaiting your approval."
                      : "This stay has started with no bed assigned — assign a bed and approve to confirm it."}
                  </div>
                )}
              {!isTerminal && checklist.length > 0 && (
                <div className="space-y-1.5 rounded-lg bg-muted/40 p-3">
                  {checklist.map((item) => (
                    <p
                      key={item.label}
                      className="flex items-center gap-2 text-sm"
                    >
                      {item.done ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={item.done ? "text-muted-foreground" : undefined}
                      >
                        {item.label}
                      </span>
                    </p>
                  ))}
                  {!primary && (
                    <p className="pt-1 text-sm text-muted-foreground">
                      {isConfirmed
                        ? "All set — awaiting check-in."
                        : "Guest is in-house."}
                    </p>
                  )}
                </div>
              )}

              {primary && (
                <Button
                  className="max-sm:h-11 w-full"
                  disabled={primary.disabled}
                  onClick={primary.onClick}
                >
                  {primary.label}
                </Button>
              )}

              {displayBooking.status === "CANCELLED" && canRefund && (
                <p className="text-center text-sm text-amber-700 dark:text-amber-400">
                  Refund due to the guest: ₹
                  {refunds.refundableAmount.toLocaleString("en-IN")} — record it
                  so the ledger closes.
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
                {isConfirmed && offlineUnpaid && (
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    onClick={() => setMarkPaidOpen(true)}
                  >
                    Mark as paid
                  </button>
                )}
                {canRefund && (
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    onClick={() => setRefundOpen(true)}
                  >
                    {refunds.refundFailed ? "Retry refund" : "Record refund"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={!displayBooking.invoiceId}
                  className={
                    displayBooking.invoiceId
                      ? "text-muted-foreground transition-colors hover:text-foreground hover:underline"
                      : "cursor-not-allowed text-muted-foreground/50"
                  }
                  onClick={() => handleDownloadInvoice(displayBooking.id)}
                >
                  Invoice
                </button>
                {isPending && (
                  <button
                    type="button"
                    disabled={updateStatus.isPending}
                    className="text-destructive transition-colors hover:text-destructive/80 hover:underline disabled:opacity-50"
                    onClick={() => handleStatusAction("REJECT")}
                  >
                    Reject booking
                  </button>
                )}
                {!isTerminal && (
                  <button
                    type="button"
                    className="text-destructive transition-colors hover:text-destructive/80 hover:underline"
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel booking
                  </button>
                )}
              </div>

              {displayBooking && (
                <>
                  <AssignBedDialog
                    propertyId={propertyId}
                    bookingId={displayBooking.id}
                    roomTemplateId={displayBooking.roomTemplateId}
                    startDate={displayBooking.startDate}
                    endDate={displayBooking.endDate}
                    guestName={guestName}
                    open={assignOpen}
                    onOpenChange={setAssignOpen}
                    onAssigned={() => {
                      if (isPending) handleStatusAction("APPROVE");
                    }}
                  />
                  <MarkBookingPaidModal
                    propertyId={propertyId}
                    bookingId={displayBooking.id}
                    guestName={guestName}
                    open={markPaidOpen}
                    onOpenChange={setMarkPaidOpen}
                  />
                  <RecordBookingRefundModal
                    propertyId={propertyId}
                    bookingId={displayBooking.id}
                    guestName={guestName}
                    captured={refunds.capturedAmount}
                    refundable={refunds.refundableAmount}
                    paymentMode={displayBooking.paymentMode}
                    open={refundOpen}
                    onOpenChange={setRefundOpen}
                  />
                  <CancelAdminBookingModal
                    propertyId={propertyId}
                    bookingId={displayBooking.id}
                    open={cancelOpen}
                    onOpenChange={setCancelOpen}
                    onCancelled={(result) => {
                      setCancelOpen(false);
                      setStatusOverride({
                        bookingId: displayBooking.id,
                        status: "CANCELLED",
                      });

                      // A cancelled paid booking leaves money owed to the
                      // guest — keep the drawer open and settle it right here.
                      if (result.refundRequired) {
                        setRefundOpen(true);
                      } else {
                        onOpenChange(false);
                      }
                    }}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
