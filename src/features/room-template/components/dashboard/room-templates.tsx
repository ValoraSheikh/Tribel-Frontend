"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDouble, DoorOpen, IndianRupee, StarIcon } from "lucide-react";
import Image from "next/image";
import roomFeatures from "@/constants/rooms-icon";
import { DeleteRoomTemplateModal } from "./delete-room-template";
import { EditRoomTemplate } from "./edit-room-template";
import Link from "next/link";
import { useGetRoomTemplates } from "../../hooks/use-room-template";
import { Amenity, RoomTemplateProps } from "../../api/room-template.api";
import { toUrl } from "@/utils/image";

type PropertyIdProps = {
  propertyId: string;
};

const AmenityIcon = ({ iconName }: { iconName: string }) => {
  const icons = roomFeatures.find((icon) => icon.icon == iconName);
  const Icon = icons?.IconComponent || StarIcon;
  return <Icon className="h-4 w-4 mr-2 inline-block text-slate-500" />;
};

export function ListRoomTemplate({ propertyId }: PropertyIdProps) {
  const {
    data: rooms,
    isLoading,
    isError,
    error,
  } = useGetRoomTemplates(propertyId);

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse">
        Loading Room Templates for you...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center border border-dashed rounded-lg bg-red-50 text-red-500 mt-4">
        <h3 className="font-medium">Failed to load rooms</h3>
        <p className="text-xs">Please try refreshing the page.</p>
        <p>
          Failed to load room templates. Please try again later.{" "}
          {error.message || "Something went wrong"}
        </p>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed mt-4">
        No room templates found. Create one to get started!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-4 pb-12">
      {rooms.map((room: RoomTemplateProps) => (
        <RoomCard key={room.id} room={room} propertyId={propertyId} />
      ))}
    </div>
  );
}

function RoomCard({
  room,
  propertyId,
}: { room: RoomTemplateProps } & PropertyIdProps) {
  return (
    <Card className="group overflow-hidden flex flex-col sm:flex-row border-border transition-all duration-250 hover:shadow-md rounded-xl bg-white py-0">
      <div className="relative w-full h-48 sm:h-auto sm:w-44 md:w-52 shrink-0 bg-muted overflow-hidden">
        <Image
          src={toUrl(room.image)!}
          unoptimized={true}
          alt={room.title}
          fill
          className="object-cover w-full h-full transition-transform duration-500 "
        />
        <div className="absolute top-2 left-2">
          <Badge
            variant="secondary"
            className="backdrop-blur-md bg-black/65 text-white border-none shadow-sm text-[10px] px-2 py-0.5 rounded-full"
          >
            {room.type}
          </Badge>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 min-w-0 justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/properties/${propertyId}/roomtemplate/${room.id}`}>
                <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight truncate">
                  {room.title}
                </h3>
              </Link>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                <span className="flex items-center bg-muted/40 px-2 py-0.5 rounded-md">
                  <DoorOpen className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                  {room.numberOfRooms} Units
                </span>
                <span className="flex items-center bg-muted/40 px-2 py-0.5 rounded-md">
                  <BedDouble className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                  {room.bedsPerRoom} Beds
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1 text-primary shrink-0 sm:text-right">
              <IndianRupee className="w-4 h-4" />
              <span className="text-xl sm:text-2xl font-bold">
                {room.pricePerBed}
              </span>
              <span className="text-xs text-muted-foreground font-medium self-end mb-1 ml-1">
                / bed
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
            {room.description}
          </p>

          {/* amenity chips */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <div className="flex items-center flex-wrap gap-2">
                {room.amenities
                  .slice(0, 5)
                  .map((amenity: Amenity, idx: number) => (
                    <div
                      key={idx}
                      className="inline-flex items-center text-[11px] text-muted-foreground bg-muted/10 px-2 py-0.5 rounded-md"
                      title={amenity.name}
                    >
                      <AmenityIcon iconName={amenity.icon} />
                      <span className="truncate max-w-26">{amenity.name}</span>
                    </div>
                  ))}
              </div>

              {room.amenities.length > 5 && (
                <span className="text-[11px] text-muted-foreground self-center pl-1">
                  +{room.amenities.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          className="flex items-center justify-end gap-2 pt-2 mt-1 border-t
          border-dashed border-border/60"
        >
          <DeleteRoomTemplateModal
            propertyId={propertyId}
            roomTemplateId={room.id}
          />
          <EditRoomTemplate propertyId={propertyId} roomTemplateId={room.id} room={room} />
        </div>
      </div>
    </Card>
  );
}

export function ListRoomTemplate1({ propertyId }: PropertyIdProps) {
  const { data: rooms, isLoading, isError, error } = useGetRoomTemplates(propertyId);

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse">
        Loading Room Templates for you...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center border border-dashed rounded-lg bg-red-50 text-red-500 mt-4">
        <h3 className="font-medium">Failed to load rooms</h3>
        <p className="text-xs">Please try refreshing the page.</p>
        <p>
          Failed to load room templates. Please try again later.{" "}
          {error.message || "Something went wrong"}
        </p>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed mt-4">
        No room templates found. Create one to get started!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-4 pb-12">
      {rooms.map((room: RoomTemplateProps) => (
        <RoomCard1 key={room.id} room={room} />
      ))}
    </div>
  );
}

export function RoomCard1({ room }: { room: RoomTemplateProps }) {
  return (
    <Card className="group overflow-hidden flex flex-col sm:flex-row border-border transition-all duration-250 hover:shadow-md rounded-xl bg-white py-0">
      <div className="relative w-full h-48 sm:h-auto sm:w-44 md:w-52 shrink-0 bg-muted overflow-hidden">
        <Image
          src={toUrl(room.image)!}
          unoptimized={true}
          alt={room.title}
          fill
          className="object-cover w-full h-full transition-transform duration-500 "
        />
        <div className="absolute top-2 left-2">
          <Badge
            variant="secondary"
            className="backdrop-blur-md bg-black/65 text-white border-none shadow-sm text-[10px] px-2 py-0.5 rounded-full"
          >
            {room.type}
          </Badge>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 min-w-0 justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight truncate">
                {room.title}
              </h3>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                <span className="flex items-center bg-muted/40 px-2 py-0.5 rounded-md">
                  <DoorOpen className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                  {room.numberOfRooms} Units
                </span>
                <span className="flex items-center bg-muted/40 px-2 py-0.5 rounded-md">
                  <BedDouble className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                  {room.bedsPerRoom} Beds
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1 text-primary shrink-0 sm:text-right">
              <IndianRupee className="w-4 h-4" />
              <span className="text-xl sm:text-2xl font-bold">
                {room.pricePerBed}
              </span>
              <span className="text-xs text-muted-foreground font-medium self-end mb-1 ml-1">
                / bed
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
            {room.description}
          </p>

          {/* amenity chips */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <div className="flex items-center flex-wrap gap-2">
                {room.amenities
                  .slice(0, 5)
                  .map((amenity: Amenity, idx: number) => (
                    <div
                      key={idx}
                      className="inline-flex items-center text-[11px] text-muted-foreground bg-muted/10 px-2 py-0.5 rounded-md"
                      title={amenity.name}
                    >
                      <AmenityIcon iconName={amenity.icon} />
                      <span className="truncate max-w-26">{amenity.name}</span>
                    </div>
                  ))}
              </div>

              {room.amenities.length > 5 && (
                <span className="text-[11px] text-muted-foreground self-center pl-1">
                  +{room.amenities.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {/*<div
          className="flex items-center justify-end gap-2 pt-2 mt-1 border-t
          border-dashed border-border/60"
        >
          <Button variant="outline">Select</Button>
        </div>*/}
      </div>
    </Card>
  );
}
