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
const REFUND_METHODS = ["RAZORPAY", "CASH", "UPI", "BANK_TRANSFER"] as const;

export function MarkBookingPaidModal({
  propertyId,
  bookingId,
  guestName,
}: {
  propertyId: string;
  bookingId: string;
  guestName: string;
}) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<string>("CASH");
  const [reference, setReference] = useState("");
  const markPaid = useMarkBookingPaid(propertyId, bookingId);

  function handleSubmit() {
    markPaid.mutate(
      { provider, reference: reference || undefined },
      {
        onSuccess: () => {
          toast.success("Payment marked as paid");
          setOpen(false);
          setReference("");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full max-sm:h-11">
          <Banknote className="mr-1 h-4 w-4" />
          Mark as paid
        </Button>
      </DialogTrigger>
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
  total,
  paymentMode,
}: {
  propertyId: string;
  bookingId: string;
  guestName: string;
  total: number;
  paymentMode: string;  
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>(String(total));
  const [method, setMethod] = useState<string>(
    paymentMode === "ONLINE" ? "RAZORPAY" : "CASH",
  );
  const [razorpayRefundId, setRazorpayRefundId] = useState("");
  const [reference, setReference] = useState("");
  const recordRefund = useRecordBookingRefund(propertyId, bookingId);

  function handleSubmit() {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid refund amount");
      return;
    }

    recordRefund.mutate(
      {
        amount: parsedAmount,
        method,
        razorpayRefundId: razorpayRefundId || undefined,
        reference: reference || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Refund recorded");
          setOpen(false);
          setRazorpayRefundId("");
          setReference("");
          setAmount(String(total));
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full max-sm:h-11">
          <Undo2 className="mr-1 h-4 w-4" />
          Record refund
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record refund</DialogTitle>
          <DialogDescription>
            Record the refund issued to {guestName}. Booking total is{" "}
            {total.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            })}
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refund-amount">Refund amount</Label>
            <Input
              id="refund-amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {Number(amount) > 0 && Number(amount) < total && (
              <p className="text-xs text-muted-foreground">
                Partial refund — payment status becomes partially paid.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Refund method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFUND_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {method === "RAZORPAY" && (
            <div className="space-y-2">
              <Label htmlFor="razorpay-refund-id">
                Razorpay refund ID (optional)
              </Label>
              <Input
                id="razorpay-refund-id"
                placeholder="rfnd_..."
                value={razorpayRefundId}
                onChange={(e) => setRazorpayRefundId(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="refund-reference">Reference (optional)</Label>
            <Input
              id="refund-reference"
              placeholder="Note, UTR, receipt..."
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
            {recordRefund.isPending ? "Recording..." : "Record refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
