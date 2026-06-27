"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCreateBooking } from "../../hooks/use-booking";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useRazorpay } from "@/features/payment/hooks/use-razorpay";
import {
  useCreateRazorpayOrder,
  useVerifyRazorpayPayment,
} from "@/features/payment/hooks/use-payment";
import axios from "axios";
import type { CreateBookingPayload } from "../../api/booking.api";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingPayload: Omit<CreateBookingPayload, "paymentMode">;
  onSuccess?: () => void;
}

type PaymentState =
  | "creating-booking"
  | "creating-order"
  | "checkout-open"
  | "verifying"
  | "completed"
  | "failed";

export function PaymentDialog({
  open,
  onOpenChange,
  bookingPayload,
  onSuccess,
}: PaymentDialogProps) {
  const router = useRouter();
  const [idempotencyKey, setIdempotencyKey] = useState(() => uuidv4());
  const [paymentState, setPaymentState] = useState<PaymentState>("creating-booking");
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const createBooking = useCreateBooking();
  const createRazorpayOrder = useCreateRazorpayOrder();
  const verifyPayment = useVerifyRazorpayPayment();
  const { openCheckout } = useRazorpay();

  // Kick off the payment flow when the dialog opens
  useEffect(() => {
    if (open) {
      startPaymentFlow();
    }
  }, [open]);

  async function startPaymentFlow() {
    try {
      // Step 1: Create booking with ONLINE payment mode
      const bookingResult = await createBooking.mutateAsync({
        payload: {
          ...bookingPayload,
          paymentMode: "ONLINE",
        },
        idempotencyKey,
      });

      const bookingId = bookingResult.booking.id;
      setCreatedBookingId(bookingId);

      // Step 2: Create Razorpay order
      setPaymentState("creating-order");
      const order = await createRazorpayOrder.mutateAsync(bookingId);

      // Step 3: Open Razorpay checkout
      setPaymentState("checkout-open");
      const razorpayResponse = await openCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount * 100,
        currency: order.currency,
        order_id: order.orderId,
        name: "Tribel",
        description: `Booking Payment`,
      });

      // Step 4: Verify payment on backend
      setPaymentState("verifying");
      await verifyPayment.mutateAsync({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        bookingId,
      });

      // Success
      setPaymentState("completed");
      toast.success("Payment Successful", {
        description: "Your booking is confirmed.",
      });
      setIdempotencyKey(uuidv4());
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        router.push("/yourBookings");
      }, 1500);
    } catch (error) {
      if (error instanceof Error && error.message !== "Payment cancelled") {
        let message = "Payment failed. Please try again.";
        if (axios.isAxiosError(error)) {
          message = error.response?.data?.message ?? message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        toast.error("Payment Failed", { description: message });
      }
      setPaymentState("failed");
    }
  }

  function resetPayment() {
    setPaymentState("creating-booking");
    setCreatedBookingId(null);
  }

  function handleRetry() {
    if (!createdBookingId) return;
    setPaymentState("creating-order");
    createRazorpayOrder.mutate(createdBookingId, {
      onSuccess: (order) => {
        setPaymentState("checkout-open");
        openCheckout({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount: order.amount * 100,
          currency: order.currency,
          order_id: order.orderId,
          name: "Tribel",
          description: `Booking Payment`,
        })
          .then(async (razorpayResponse) => {
            setPaymentState("verifying");
            await verifyPayment.mutateAsync({
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              bookingId: createdBookingId,
            });
            setPaymentState("completed");
            toast.success("Payment Successful", {
              description: "Your booking is confirmed.",
            });
            setIdempotencyKey(uuidv4());
            onSuccess?.();
            setTimeout(() => {
              onOpenChange(false);
              router.push("/yourBookings");
            }, 1500);
          })
          .catch(() => {
            setPaymentState("failed");
          });
      },
      onError: () => {
        toast.error("Failed to create payment order. Please try again.");
        setPaymentState("failed");
      },
    });
  }

  function handleClose() {
    setIdempotencyKey(uuidv4());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            {paymentState === "failed"
              ? "Payment was interrupted."
              : "Processing your payment..."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-4 py-12">
          {/* Creating booking */}
          {paymentState === "creating-booking" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
              <p className="text-lg font-medium">Creating booking...</p>
            </div>
          )}

          {/* Creating order */}
          {paymentState === "creating-order" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
              <p className="text-lg font-medium">
                Creating payment order...
              </p>
            </div>
          )}

          {/* Checkout open */}
          {paymentState === "checkout-open" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
              <p className="text-lg font-medium">
                Complete payment in the popup...
              </p>
              <p className="text-sm text-muted-foreground">
                If the popup didn&apos;t open, check your browser settings.
              </p>
            </div>
          )}

          {/* Verifying */}
          {paymentState === "verifying" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
              <p className="text-lg font-medium">Verifying payment...</p>
            </div>
          )}

          {/* Completed */}
          {paymentState === "completed" && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-lg font-medium text-green-700">
                Payment Successful!
              </p>
            </div>
          )}

          {/* Failed */}
          {paymentState === "failed" && (
            <div className="flex flex-col items-center gap-3">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-lg font-medium">Payment Cancelled</p>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Your booking is created but payment is pending. You can retry
                or choose to pay offline.
              </p>
              <div className="flex gap-3 mt-2">
                <Button variant="outline" onClick={resetPayment}>
                  Change Payment Method
                </Button>
                <Button
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={handleRetry}
                  disabled={createRazorpayOrder.isPending}
                >
                  {createRazorpayOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    "Retry Payment"
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                className="mt-1 text-muted-foreground"
                onClick={handleClose}
              >
                Pay Offline Later
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
