import { serverBookingApi } from "@/features/booking/api/booking.api";
import {
  USE_ADMIN_BOOKINGS_KEY,
  USE_OCCUPANCY_KEY,
} from "@/features/booking/hooks/use-booking";
import { createServerAxios } from "@/lib/axios/axios-server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { Suspense } from "react";
import BookingsSkeleton from "./loading";
import { BookingsOverview } from "@/features/booking/components/dashboard/bookings-overview";

type props = {
  params: { propertyId: string };
};

const Page = async ({ params }: props) => {
  const { propertyId } = await params;
  const queryClient = new QueryClient();
  const serverAxios = await createServerAxios();

  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: [...USE_ADMIN_BOOKINGS_KEY, propertyId],
      queryFn: () =>
        serverBookingApi.getBookingsForAdmin(serverAxios, propertyId),
    }),
    queryClient.prefetchQuery({
      queryKey: [...USE_OCCUPANCY_KEY, propertyId, monthStart, monthEnd],
      queryFn: () =>
        serverBookingApi.getOccupancy(serverAxios, propertyId, {
          startDate: monthStart,
          endDate: monthEnd,
        }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<BookingsSkeleton />}>
        <BookingsOverview propertyId={propertyId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
