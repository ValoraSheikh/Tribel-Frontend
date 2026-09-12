"use client";

import { useState } from "react";
import { Banknote, Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useMarkBookingPaid,
  useRecordBookingRefund,
} from "../../hooks/use-booking";

const OFFLINE_PROVIDERS = ["CASH", "UPI", "BANK_TRANSFER"] as const;
const OFFLINE_REFUND_METHODS = ["CASH", "UPI", "BANK_TRANSFER"] as const;

const formatMoney = (amount: number) =>
  amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export function MarkBookingPaidModal({
  propertyId,
  bookingId,
  guestName,
  open: controlledOpen,
  onOpenChange: onControlledOpenChange,
}: {
  propertyId: string;
  bookingId: string;
  guestName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const [provider, setProvider] = useState<string>("CASH");
  const [reference, setReference] = useState("");
  const markPaid = useMarkBookingPaid(propertyId, bookingId);

  function handleOpenChange(next: boolean) {
    onControlledOpenChange?.(next);
    if (!isControlled) setInternalOpen(next);
  }

  function handleSubmit() {
    markPaid.mutate(
      { provider, reference: reference || undefined },
      {
        onSuccess: () => {
          toast.success("Payment marked as paid");
          handleOpenChange(false);
          setReference("");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full max-sm:h-11">
            <Banknote className="mr-1 h-4 w-4" />
            Mark as paid
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record offline payment</DialogTitle>
          <DialogDescription>
            Confirm you have collected the payment from {guestName} for this
            booking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Payment method</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OFFLINE_PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paid-reference">Reference (optional)</Label>
            <Input
              id="paid-reference"
              placeholder="Receipt no, UTR, note..."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="w-full"
            disabled={markPaid.isPending}
            onClick={handleSubmit}
          >
            {markPaid.isPending && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            {markPaid.isPending ? "Recording..." : "Confirm payment received"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RecordBookingRefundModal({
  propertyId,
  bookingId,
  guestName,
  captured,
  refundable,
  paymentMode,
  defaultAmount,
  triggerLabel = "Record refund",
  open: controlledOpen,
  onOpenChange: onControlledOpenChange,
}: {
  propertyId: string;
  bookingId: string;
  guestName: string;
  /** What the guest actually paid — never the booking total. */
  captured: number;
  /** What is still refundable, as derived by the server. */
  refundable: number;
  paymentMode: string;
  defaultAmount?: number;
  triggerLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const fallbackAmount = defaultAmount ?? refundable;
  const [amount, setAmount] = useState<string>(String(fallbackAmount));
  const [method, setMethod] = useState<string>("CASH");
  const [reference, setReference] = useState("");
  const recordRefund = useRecordBookingRefund(propertyId, bookingId);

  const isOnline = paymentMode === "ONLINE";

  function handleOpenChange(next: boolean) {
    onControlledOpenChange?.(next);
    if (!isControlled) setInternalOpen(next);
    if (next) {
      setAmount(String(fallbackAmount));
      setMethod("CASH");
      setReference("");
    }
  }

  function handleSubmit() {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid refund amount");
      return;
    }

    if (parsedAmount > refundable) {
      toast.error(`Only ${formatMoney(refundable)} is still refundable here`);
      return;
    }

    recordRefund.mutate(
      {
        amount: parsedAmount,
        reference: reference || undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            isOnline
              ? "Refund initiated via Razorpay — status updates once processed"
              : "Refund recorded",
          );
          handleOpenChange(false);
          setReference("");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full max-sm:h-11">
            <Undo2 className="mr-1 h-4 w-4" />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isOnline ? "Refund guest" : "Record refund"}</DialogTitle>
          <DialogDescription>
            {isOnline
              ? `Refunds for online payments are processed through Razorpay to ${guestName} and typically settle in 5–7 working days. ${formatMoney(captured)} was collected; ${formatMoney(refundable)} is still refundable.`
              : `Record the refund issued to ${guestName}. ${formatMoney(captured)} was collected; ${formatMoney(refundable)} is still refundable.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refund-amount">Refund amount</Label>
            <Input
              id="refund-amount"
              type="number"
              min={1}
              max={refundable}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {Number(amount) > 0 && Number(amount) < refundable && (
              <p className="text-xs text-muted-foreground">
                Partial refund — the booking keeps showing what the guest paid,
                and the rest stays refundable.
              </p>
            )}
          </div>

          {!isOnline && (
            <div className="space-y-2">
              <Label>Refund method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OFFLINE_REFUND_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="refund-reference">
              Reference {isOnline ? "(optional reason)" : "(optional)"}
            </Label>
            <Input
              id="refund-reference"
              placeholder={isOnline ? "Reason for refund..." : "Note, UTR, receipt..."}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            disabled={recordRefund.isPending}
            onClick={handleSubmit}
          >
            {recordRefund.isPending && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            {recordRefund.isPending
              ? isOnline
                ? "Initiating..."
                : "Recording..."
              : isOnline
                ? "Initiate refund"
                : "Record refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
