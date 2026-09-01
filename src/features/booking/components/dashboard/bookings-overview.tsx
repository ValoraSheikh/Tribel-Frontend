"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useGetRoomTemplates } from "@/features/room-template/hooks/use-room-template";
import { cn } from "@/lib/utils";
import { OccupancyBooking } from "../../api/booking.api";
import { BookingDashboard } from "./bookings";
import { TimelineView } from "./timeline-view";
import { TheaterView } from "./theater-view";
import { BookingDrawer } from "./booking-drawer";

export const BookingsOverview = ({ propertyId }: { propertyId: string }) => {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(["timeline", "theater"]).withDefault("timeline"),
  );
  const [templateId, setTemplateId] = useQueryState(
    "template",
    parseAsString.withDefault(""),
  );

  const { data: templates } = useGetRoomTemplates(propertyId);

  const [selectedBooking, setSelectedBooking] =
    useState<OccupancyBooking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openBooking = (booking: OccupancyBooking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Track occupancy, review guests, and manage booking requests.
        </p>
      </div>

      <div className="-mx-4 md:-mx-8">
        <BookingDashboard propertyId={propertyId} showHeader={false} />
      </div>

      {/* Room-type filter — deep-linkable via ?template= */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Room type:</span>
        <button
          type="button"
          onClick={() => setTemplateId("")}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-colors",
            templateId === ""
              ? "border-primary bg-primary/10 font-medium text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          All templates
        </button>
        {(templates ?? []).map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() =>
              setTemplateId(template.id === templateId ? "" : template.id)
            }
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              templateId === template.id
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {template.title}
          </button>
        ))}
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <TabsList className="w-full justify-start overflow-x-auto max-sm:h-11 max-sm:justify-start max-sm:flex-wrap">
          <TabsTrigger value="timeline" className="max-sm:h-9 max-sm:px-4">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="theater" className="max-sm:h-9 max-sm:px-4">
            Theater
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <TimelineView
            propertyId={propertyId}
            templates={templates}
            templateId={templateId || null}
            onOpenBooking={openBooking}
          />
        </TabsContent>

        <TabsContent value="theater" className="mt-4">
          <TheaterView
            propertyId={propertyId}
            templates={templates}
            templateId={templateId || null}
            onOpenBooking={openBooking}
          />
        </TabsContent>
      </Tabs>

      <BookingDrawer
        propertyId={propertyId}
        booking={selectedBooking}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
};
