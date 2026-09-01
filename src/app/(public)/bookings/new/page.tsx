import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { requireAuth } from "@/lib/auth/auth-utils";
import { NewBookingContent } from "@/features/booking/components/public/new-booking-content";

export default async function NewBookingPage() {
  await requireAuth();

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
