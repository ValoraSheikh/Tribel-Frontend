"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { OccupancyBooking } from "../../api/booking.api";
import { BookingDashboard } from "./bookings";
import { TimelineView } from "./timeline-view";
import { TheaterView } from "./theater-view";
import { BookingDrawer } from "./booking-drawer";

export const BookingsTabs = ({ propertyId }: { propertyId: string }) => {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(["timeline", "theater", "table"]).withDefault(
      "timeline",
    ),
  );
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

      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <TabsList className="w-full justify-start overflow-x-auto max-sm:h-auto max-sm:flex-wrap">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="theater">Theater</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <TimelineView propertyId={propertyId} onOpenBooking={openBooking} />
        </TabsContent>

        <TabsContent value="theater" className="mt-4">
          <TheaterView propertyId={propertyId} onOpenBooking={openBooking} />
        </TabsContent>

        <TabsContent value="table" className="mt-4 -mx-4 md:-mx-8">
          <BookingDashboard propertyId={propertyId} showHeader={false} />
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
