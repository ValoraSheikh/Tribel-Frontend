"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookingFlow } from "@/features/booking/components/public/booking-flow";
import { Loader2 } from "lucide-react";

function NewBookingContent() {
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

export default function NewBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NewBookingContent />
    </Suspense>
  );
}
