"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoomTemplateProps } from "@/features/room-template/api/room-template.api";
import { RoomCard1 } from "@/features/room-template/components/dashboard/room-templates";
import { useGetRoomTemplates } from "@/features/room-template/hooks/use-room-template";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useCreateBooking } from "../../hooks/use-booking";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { PaymentDialog } from "./payment-dialog";

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

export function CreateBooking({ propertyId }: { propertyId: string }) {
  const [open, setOpen] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingBookingPayload, setPendingBookingPayload] = useState<{
    propertyId: string;
    roomTemplateId: string;
    startDate: Date;
    endDate: Date;
  } | null>(null);
  const router = useRouter();
  const [idempotencyKey, setIdempotencyKey] = useState(() => uuidv4());

  const createBooking = useCreateBooking();
  const {
    data: rooms,
    isLoading,
    isError,
    error,
  } = useGetRoomTemplates(propertyId);

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
            setOpen(false);
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
      setPendingBookingPayload({
        propertyId: data.propertyId,
        roomTemplateId: data.roomTemplateId,
        startDate: data.dateRange.from,
        endDate: data.dateRange.to,
      });
      setShowPaymentDialog(true);
    }
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-12 text-md font-semibold bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md text-white">
            Request Booking
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              Select dates and a room to create a reservation.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6 flex-1 overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                  form.setValue(
                    "paymentMode",
                    value as "ONLINE" | "OFFLINE",
                    {
                      shouldValidate: true,
                    },
                  )
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

            {/* ROOM SELECTION */}
            <div className="flex flex-col gap-2 flex-1 min-h-0">
              <label className="text-sm font-medium leading-none">
                Select Room
              </label>

              {isLoading && (
                <div className="py-8 text-center text-muted-foreground">
                  Loading rooms...
                </div>
              )}

              {isError && (
                <div className="py-8 text-center text-destructive">
                  {error?.message}
                </div>
              )}

              {!isLoading && !isError && rooms && (
                <ScrollArea className="h-[300px] sm:h-[400px] pr-4 border rounded-md p-2 bg-muted/10">
                  <div className="flex flex-col gap-4">
                    {rooms.map((room: RoomTemplateProps) => {
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
              {form.formState.errors.roomTemplateId && (
                <span className="text-sm font-medium text-destructive">
                  {form.formState.errors.roomTemplateId.message}
                </span>
              )}
            </div>

            <DialogFooter className="mt-auto pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBooking.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {createBooking.isPending
                  ? "Confirming..."
                  : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {pendingBookingPayload && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={(open) => {
            setShowPaymentDialog(open);
            if (!open) setPendingBookingPayload(null);
          }}
          bookingPayload={pendingBookingPayload}
          onSuccess={() => {
            setOpen(false);
            form.reset();
            setIdempotencyKey(uuidv4());
            setPendingBookingPayload(null);
          }}
        />
      )}
    </>
  );
}
