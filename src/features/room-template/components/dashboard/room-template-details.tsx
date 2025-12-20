"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RoomTable } from "./room-table";
import Image from "next/image";
import { StarIcon } from "lucide-react";
import roomFeatures from "@/constants/rooms-icon";
import { useGetRoomTemplateDetails } from "../../hooks/use-room-template";
import { Amenity } from "../../api/room-template.api";

type RoomTemplateProps = {
  roomTemplateId: string;
  propertyId: string;
};

function AmenityIcon({ IconName }: { IconName: string }) {
  const icons = roomFeatures.find((icon) => icon.icon == IconName);
  const Icon = icons?.IconComponent || StarIcon;

  return <Icon />;
}

export function RoomTemplateDetails({
  roomTemplateId,
  propertyId,
}: RoomTemplateProps) {
  const {
    data: room,
    isLoading,
    isError,
  } = useGetRoomTemplateDetails(propertyId, roomTemplateId);

  if (isLoading)
    return (
      <div className="p-8 text-center animate-pulse">
        Loading Room Template Details...
      </div>
    );
  if (isError || !room)
    return (
      <div className="p-8 text-center text-destructive">
        Error loading data.
      </div>
    );

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative w-full md:w-1/3 aspect-video rounded-xl overflow-hidden border">
          {room.image ? (
            <Image
              src={room.image}
              alt={room.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="capitalize">
                {room.type}
              </Badge>
              <Badge variant="secondary">₹{room.pricePerBed} / Bed</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{room.title}</h1>
            <p className="text-muted-foreground mt-2">{room.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg bg-card text-center">
              <p className="text-xs text-muted-foreground uppercase">
                Total Rooms
              </p>
              <p className="text-xl font-semibold">{room.numberOfRooms}</p>
            </div>
            <div className="p-3 border rounded-lg bg-card text-center">
              <p className="text-xs text-muted-foreground uppercase">
                Beds per Room
              </p>
              <p className="text-xl font-semibold">{room.bedsPerRoom}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Amenities Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Included Amenities
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {room.amenities?.map((amenity: Amenity, idx: number) => {
            
            return (
              <Badge
                key={idx}
                variant="outline"
                className="py-1.5 px-3 flex items-center gap-2"
              >
                <AmenityIcon IconName={amenity.icon} />
                {amenity.name}
              </Badge>
            );
          })}
        </CardContent>
      </Card>

      {/* Dynamic Table Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Room Inventory Management
        </h2>
        <RoomTable rooms={room.rooms} />
      </div>
    </div>
  );
}
