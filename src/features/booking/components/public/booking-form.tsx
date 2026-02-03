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
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoomTemplateProps } from "@/features/room-template/api/room-template.api";
import { RoomCard1 } from "@/features/room-template/components/dashboard/room-templates";
import { useGetRoomTemplates } from "@/features/room-template/hooks/use-room-template";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useCreateBooking } from "../../hooks/use-booking";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

interface DateRange {
  from: Date;
  to: Date;
}

const formSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  roomTemplateId: z.string().min(1, "Please select a room"),
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
  const router = useRouter();
  const idempotencyKey = useRef(uuidv4());

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
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function onSubmit(data: z.infer<typeof formSchema>) {
    const payload = {
      propertyId: data.propertyId,
      roomTemplateId: data.roomTemplateId,
      startDate: data.dateRange.from,
      endDate: data.dateRange.to,
    };

    createBooking.mutate(
      { payload, idempotencyKey: idempotencyKey.current },
      {
        onSuccess: () => {
          toast.success("Booking Request Sent", {
            description: "Your booking has been successfully submitted.",
          });
          setOpen(false);
          form.reset();
          idempotencyKey.current = uuidv4();
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
  }

  const selectedRoomId = form.watch("roomTemplateId");
  const selectedDateRange = form.watch("dateRange");

  return (
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
                  initialFocus
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

          {/* 2. ROOM SELECTION */}
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
                    // Type as RoomTemplateProps if available
                    const isSelected = selectedRoomId === room.id;
                    return (
                      <div
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
                        {/* Selection Indicator Overlay */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 z-20 bg-rose-500 text-white rounded-full p-1 shadow-sm">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}

                        {/* Prevent internal clicks from bubbling awkwardly if needed, usually css pointer-events-none on children helps, but explicit onClick on container is best */}
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
              {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// NOTE: Ensure RoomCard1 is imported or defined here.
// I have made slight CSS adjustments to RoomCard1 wrapper in the logic above
// to ensure it handles "Selection" state visually.
