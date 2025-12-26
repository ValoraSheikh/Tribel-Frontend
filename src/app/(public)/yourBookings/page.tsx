import { serverBookingApi } from "@/features/booking/api/booking.api";
import { USE_USER_BOOKINGS_KEY } from "@/features/booking/hooks/use-booking";
import { createServerAxios } from "@/lib/axios/axios-server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import BookingSkeleton from "./loading";
import { Suspense } from "react";
import { Bookings } from "@/features/booking/components/public/bookings";

const Page = async () => {
  const queryClient = new QueryClient();
  const serverAxios = await createServerAxios();

  await queryClient.prefetchQuery({
    queryKey: [...USE_USER_BOOKINGS_KEY],
    queryFn: () => serverBookingApi.getUserBookings(serverAxios),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<BookingSkeleton />}>
        <Bookings />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
