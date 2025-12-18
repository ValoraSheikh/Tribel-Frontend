"use client";
import * as React from "react";
import { CreateRoomTemplate } from "./create-roomtemplate";
import { ListRoomTemplate } from "./room-templates";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard } from "lucide-react";

type PropertyIdProps = {
  propertyId: string;
};

export function ManageRoomTemplate({ propertyId }: PropertyIdProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      
      <Separator className="my-10" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Room Templates
            </h2>
          </div>
          <p className="text-muted-foreground">
            Create and manage the different types of rooms available at this property.
          </p>
        </div>

        {/* CLEANED UP: Styling is now handled inside the component */}
        <div className="w-full sm:w-auto">
          <CreateRoomTemplate propertyId={propertyId} />
        </div>
      </div>

      <ListRoomTemplate propertyId={propertyId} />
    </div>
  );
}