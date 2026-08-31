"use client";

import { useSearchParams } from "next/navigation";
import { BookingFlow } from "@/features/booking/components/public/booking-flow";

export function NewBookingContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  if (!propertyId) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-lg text-destructive">
          No property selected. Please select a property to book.
        </p>
      </div>
    );
  }

  return <BookingFlow propertyId={propertyId} />;
}
