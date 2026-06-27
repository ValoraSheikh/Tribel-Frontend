"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoomCard1 } from "@/features/room-template/components/dashboard/room-templates";
import type { RoomTemplateProps } from "@/features/room-template/api/room-template.api";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2,
  CreditCard,
  Loader2,
  Wallet,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useCreateBooking } from "../../hooks/use-booking";
import { useBookingData } from "../../hooks/use-booking";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useRazorpay } from "@/features/payment/hooks/use-razorpay";
import {
  useCreateRazorpayOrder,
  useVerifyRazorpayPayment,
} from "@/features/payment/hooks/use-payment";
import axios from "axios";

interface DateRange {
  from: Date;
  to: Date;
}

const paymentOptions = [
  {
    value: "ONLINE",
    title: "Online Payment",
    description: "Pay securely online after your booking request is accepted.",
    icon: CreditCard,
  },
  {
    value: "OFFLINE",
    title: "Offline Payment",
    description: "Pay directly at the property or as instructed by the host.",
    icon: Wallet,
  },
] as const;

const formSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  roomTemplateId: z.string().min(1, "Please select a room"),
  paymentMode: z.enum(["ONLINE", "OFFLINE"], {
    message: "Please select a payment mode",
  }),
  dateRange: z
    .object({
      from: z.date("Start date is required"),
      to: z.date("End date is required"),
    })
    .refine((data) => data.from && data.to, {
      message: "Please select both check-in and check-out dates",
    }),
});

export function BookingFlow({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [idempotencyKey, setIdempotencyKey] = useState(() => uuidv4());
  const [paymentState, setPaymentState] = useState<
    | "idle"
    | "creating-order"
    | "checkout-open"
    | "verifying"
    | "completed"
    | "failed"
  >("idle");
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const createBooking = useCreateBooking();
  const createRazorpayOrder = useCreateRazorpayOrder();
  const verifyPayment = useVerifyRazorpayPayment();
  const { openCheckout } = useRazorpay();
  const {
    data: bookingData,
    isLoading,
    isError,
    error,
  } = useBookingData(propertyId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: propertyId,
      roomTemplateId: "",
      paymentMode: "ONLINE",
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  async function handleOnlinePayment(data: z.infer<typeof formSchema>) {
    try {
      const bookingResult = await createBooking.mutateAsync({
        payload: {
          propertyId: data.propertyId,
          roomTemplateId: data.roomTemplateId,
          startDate: data.dateRange.from,
          endDate: data.dateRange.to,
          paymentMode: "ONLINE",
        },
        idempotencyKey,
      });
      const bookingId = bookingResult.booking.id;
      setCreatedBookingId(bookingId);

      setPaymentState("creating-order");
      const order = await createRazorpayOrder.mutateAsync(bookingId);

      setPaymentState("checkout-open");
      const razorpayResponse = await openCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount * 100,
        currency: order.currency,
        order_id: order.orderId,
        name: "Tribel",
        description: `Booking Payment`,
      });

      setPaymentState("verifying");
      await verifyPayment.mutateAsync({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        bookingId,
      });

      setPaymentState("completed");
      toast.success("Payment Successful", {
        description: "Your booking is confirmed.",
      });
      form.reset();
      setIdempotencyKey(uuidv4());
      router.push("/yourBookings");
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

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (data.paymentMode === "OFFLINE") {
      const payload = {
        propertyId: data.propertyId,
        roomTemplateId: data.roomTemplateId,
        startDate: data.dateRange.from,
        endDate: data.dateRange.to,
        paymentMode: data.paymentMode as "ONLINE" | "OFFLINE",
      };
      createBooking.mutate(
        { payload, idempotencyKey },
        {
          onSuccess: () => {
            toast.success("Booking Request Sent", {
              description: "Your booking has been successfully submitted.",
            });
            form.reset();
            setIdempotencyKey(uuidv4());
            router.push("/yourBookings");
          },
          onError: (error) => {
            toast.error("Booking Failed", {
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
        },
      );
    } else {
      handleOnlinePayment(data);
    }
  }

  function resetPayment() {
    setPaymentState("idle");
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
            form.reset();
            setIdempotencyKey(uuidv4());
            router.push("/yourBookings");
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

  const selectedRoomId = useWatch({
    control: form.control,
    name: "roomTemplateId",
  });
  const selectedPaymentMode = useWatch({
    control: form.control,
    name: "paymentMode",
  });
  const selectedDateRange = useWatch({
    control: form.control,
    name: "dateRange",
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-lg text-destructive">
          {error?.message || "Failed to load booking data."}
        </p>
        <Button variant="outline" onClick={() => router.push("/discover")}>
          Browse Properties
        </Button>
      </div>
    );
  }

  if (paymentState === "completed") {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="text-lg font-medium text-green-700">
          Booking Confirmed!
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting to your bookings...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Property header */}
      {bookingData && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Book {bookingData.property.title}
          </h1>
          <p className="text-muted-foreground">
            {bookingData.property.city}
            {bookingData.property.state ? `, ${bookingData.property.state}` : ""}
          </p>
        </div>
      )}

      {paymentState === "idle" ? (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* Dates */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none">
              Booking Dates
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-12",
                    !selectedDateRange && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDateRange?.from ? (
                    selectedDateRange.to ? (
                      <>
                        {format(selectedDateRange.from, "LLL dd, y")} -{" "}
                        {format(selectedDateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(selectedDateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Select check-in and check-out dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={selectedDateRange?.from}
                  selected={selectedDateRange}
                  onSelect={(range) =>
                    form.setValue("dateRange", range as DateRange, {
                      shouldValidate: true,
                    })
                  }
                  numberOfMonths={2}
                  disabled={(date) => date < today}
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.dateRange && (
              <span className="text-sm font-medium text-destructive">
                {form.formState.errors.dateRange.message ||
                  form.formState.errors.dateRange.root?.message}
              </span>
            )}
          </div>

          {/* Payment mode */}
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium leading-none">
                Payment Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Choose how you want to complete the payment for this booking.
              </p>
            </div>

            <RadioGroup
              value={selectedPaymentMode}
              onValueChange={(value) =>
                form.setValue("paymentMode", value as "ONLINE" | "OFFLINE", {
                  shouldValidate: true,
                })
              }
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedPaymentMode === option.value;

                return (
                  <Label
                    key={option.value}
                    htmlFor={`payment-${option.value.toLowerCase()}`}
                    className={cn(
                      "relative flex cursor-pointer items-start gap-3 rounded-2xl border bg-background p-4 shadow-xs transition-all hover:border-rose-300 hover:bg-rose-50/40 sm:min-h-32",
                      isSelected
                        ? "border-rose-500 bg-rose-50 ring-2 ring-rose-500/20"
                        : "border-border",
                    )}
                  >
                    <RadioGroupItem
                      id={`payment-${option.value.toLowerCase()}`}
                      value={option.value}
                      className="mt-1 border-rose-500 text-rose-600"
                    />
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div
                        className={cn(
                          "hidden size-10 shrink-0 items-center justify-center rounded-full sm:flex",
                          isSelected
                            ? "bg-rose-500 text-white"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {option.title}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground">
                            {option.value}
                          </span>
                        </div>
                        <p className="text-sm leading-5 text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </Label>
                );
              })}
            </RadioGroup>

            {form.formState.errors.paymentMode && (
              <span className="text-sm font-medium text-destructive">
                {form.formState.errors.paymentMode.message}
              </span>
            )}
          </div>

          {/* Room selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none">
              Select Room
            </label>

            {bookingData && bookingData.roomTemplates.length > 0 && (
              <ScrollArea className="h-[300px] sm:h-[400px] pr-4 border rounded-md p-2 bg-muted/10">
                <div className="flex flex-col gap-4">
                  {bookingData.roomTemplates.map((room: RoomTemplateProps) => {
                    const isSelected = selectedRoomId === room.id;
                    return (
                      <div
                        data-testid="room-card-select"
                        key={room.id}
                        onClick={() =>
                          form.setValue("roomTemplateId", room.id, {
                            shouldValidate: true,
                          })
                        }
                        className={cn(
                          "relative cursor-pointer rounded-xl border-2 transition-all duration-200",
                          isSelected
                            ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50"
                            : "border-transparent hover:border-muted-foreground/20",
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 z-20 bg-rose-500 text-white rounded-full p-1 shadow-sm">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        <div className="pointer-events-none">
                          <RoomCard1 room={room} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            {bookingData && bookingData.roomTemplates.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">
                No rooms available for this property.
              </p>
            )}

            {form.formState.errors.roomTemplateId && (
              <span className="text-sm font-medium text-destructive">
                {form.formState.errors.roomTemplateId.message}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBooking.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      ) : (
        /* Payment processing states */
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          {/* Creating order */}
          {paymentState === "creating-order" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
              <p className="text-lg font-medium">Creating payment order...</p>
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
                onClick={() => {
                  form.reset();
                  setIdempotencyKey(uuidv4());
                  resetPayment();
                  router.push("/yourBookings");
                }}
              >
                Pay Offline Later
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
