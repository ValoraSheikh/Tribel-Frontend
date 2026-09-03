"use client";

import { useMemo, useState } from "react";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bed, Room } from "../../api/room-template.api";
import { OccupancyBooking } from "@/features/booking/api/booking.api";
import { useOccupancy } from "@/features/booking/hooks/use-booking";
import { isOccupancyStatus } from "@/features/booking/lib/status";
import { toUrl } from "@/utils/image";
import { BookingDrawer } from "@/features/booking/components/dashboard/booking-drawer";

export function RoomTable({
  rooms,
  propertyId,
}: {
  rooms: Room[];
  propertyId: string;
}) {
  const now = new Date();
  // Window spans the current month plus two ahead so upcoming confirmed
  // stays (e.g. next month) are clickable too. The drawer opens with the
  // bed's active booking whichever month it falls in.
  const { data: occupancy } = useOccupancy(
    propertyId,
    format(startOfMonth(now), "yyyy-MM-dd"),
    format(endOfMonth(addMonths(now, 2)), "yyyy-MM-dd"),
  );

  const [selectedBooking, setSelectedBooking] =
    useState<OccupancyBooking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeBookingByBedId = useMemo(() => {
    const map = new Map<string, OccupancyBooking>();
    for (const booking of occupancy?.bookings ?? []) {
      if (isOccupancyStatus(booking.status)) {
        map.set(booking.bed.id, booking);
      }
    }
    return map;
  }, [occupancy?.bookings]);

  const handleBedClick = (bed: Bed) => {
    const booking = activeBookingByBedId.get(bed.id);
    if (!booking) return;
    setSelectedBooking(booking);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px]">Room Title</TableHead>
              <TableHead>Occupancy Status</TableHead>
              <TableHead>Beds (Occupant Details)</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => {
              const occupiedCount: number =
                room.beds?.filter((b: Bed) => b.user).length ?? 0;
              const totalBeds = room.bedCount;

              return (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">
                    <div>{room.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {room.description}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium">
                        {occupiedCount} / {totalBeds} Beds Occupied
                      </span>
                      <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{
                            width: `${(occupiedCount / totalBeds) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex -space-x-2">
                      <TooltipProvider>
                        {room.beds?.map((bed: Bed) => {
                          const hasActiveBooking = activeBookingByBedId.has(
                            bed.id,
                          );
                          const occupant = bed.user;
                          const avatarSrc = occupant
                            ? toUrl(occupant.avatar ?? "")
                            : "";

                          return (
                            <Tooltip key={bed.id}>
                              <TooltipTrigger asChild>
                                {hasActiveBooking ? (
                                  <button
                                    type="button"
                                    aria-label={`View booking for bed ${bed.bedNo}`}
                                    className="relative cursor-pointer rounded-full transition-transform hover:scale-110 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50"
                                    onClick={() => handleBedClick(bed)}
                                  >
                                    <Avatar className="border-2 border-background w-8 h-8">
                                      <AvatarImage src={avatarSrc} />
                                      <AvatarFallback className="bg-primary text-primary-foreground">
                                        {occupant?.firstName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
                                  </button>
                                ) : (
                                  <div className="relative">
                                    <Avatar className="border-2 border-background w-8 h-8">
                                      <AvatarImage src={avatarSrc} />
                                      <AvatarFallback className="bg-muted text-muted-foreground">
                                        {bed.bedNo}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                {occupant ? (
                                  <div className="text-xs">
                                    <p className="font-bold">
                                      {occupant.firstName} {occupant.lastName}
                                    </p>
                                    <p>{occupant.phoneNo}</p>
                                    <p className="text-muted-foreground">
                                      {occupant.email}
                                    </p>
                                    {hasActiveBooking && (
                                      <p className="mt-1 font-medium">
                                        Click to view booking
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs">
                                    Bed No: {bed.bedNo} (Available)
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </TooltipProvider>
                    </div>
                  </TableCell>

                  <TableCell className="text-right font-mono">
                    ₹{room.pricePerBed}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <BookingDrawer
        booking={selectedBooking}
        propertyId={propertyId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
