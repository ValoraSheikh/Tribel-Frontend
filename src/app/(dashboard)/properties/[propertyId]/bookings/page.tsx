import { serverBookingApi } from "@/features/booking/api/booking.api";
import { USE_ADMIN_BOOKINGS_KEY } from "@/features/booking/hooks/use-booking";
import { createServerAxios } from "@/lib/axios/axios-server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import BookingsSkeleton from "./loading";
import { BookingDashboard } from "@/features/booking/components/dashboard/bookings";

type props = {
  params: { propertyId: string };
};

const Page = async ({ params }: props) => {
  const { propertyId } = await params;
  const queryClient = new QueryClient();
  const serverAxios = await createServerAxios();

  await queryClient.prefetchQuery({
    queryKey: [...USE_ADMIN_BOOKINGS_KEY, propertyId],
    queryFn: () =>
      serverBookingApi.getBookingsForAdmin(serverAxios, propertyId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<BookingsSkeleton />}>
        <BookingDashboard propertyId={propertyId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;