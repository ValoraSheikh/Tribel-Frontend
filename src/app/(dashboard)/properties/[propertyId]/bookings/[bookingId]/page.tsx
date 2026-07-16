import { requireAuth } from "@/lib/auth/auth-utils";
import { createServerAxios } from "@/lib/axios/axios-server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { serverBookingApi } from "@/features/booking/api/booking.api";
import { USE_USER_BOOKING_KEY } from "@/features/booking/hooks/use-booking";
import { BookingDetails } from "@/features/booking/components/dashboard/booking-details";
import { notFound } from "next/navigation";
import type { BookingProps } from "@/features/booking/api/booking.api";

const Page = async ({
  params,
}: {
  params: Promise<{ bookingId: string; propertyId: string }>;
}) => {
  await requireAuth();

  const { bookingId, propertyId } = await params;

  const queryClient = new QueryClient();
  const axiosServer = await createServerAxios();

  const result = await serverBookingApi
    .getBookingsForAdmin(axiosServer, propertyId)
    .catch(() => null);

  if (!result) {
    return notFound();
  }

  const booking = (result as { bookings: BookingProps[] }).bookings?.find(
    (b) => b.id === bookingId,
  );

  if (!booking) {
    return notFound();
  }

  await queryClient.prefetchQuery({
    queryKey: [...USE_USER_BOOKING_KEY, bookingId],
    queryFn: async () => booking,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookingDetails booking={booking} />
    </HydrationBoundary>
  );
};

export default Page;
