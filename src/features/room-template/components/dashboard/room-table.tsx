"use client";

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
import { Bed, Room } from "../api/room-template.api";

export function RoomTable({ rooms }: { rooms: Room[] }) {
  return (
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
                      {room.beds?.map((bed: Bed) => (
                        <Tooltip key={bed.id}>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              <Avatar className="border-2 border-background w-8 h-8">
                                <AvatarImage src={bed.user?.avatar} />
                                <AvatarFallback
                                  className={
                                    bed.user
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  }
                                >
                                  {bed.user ? bed.user.firstName[0] : bed.bedNo}
                                </AvatarFallback>
                              </Avatar>
                              {bed.user && (
                                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {bed.user ? (
                              <div className="text-xs">
                                <p className="font-bold">
                                  {bed.user.firstName} {bed.user.lastName}
                                </p>
                                <p>{bed.user.phoneNo}</p>
                                <p className="text-muted-foreground">
                                  {bed.user.email}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs">
                                Bed No: {bed.bedNo} (Available)
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ))}
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
  );
}
