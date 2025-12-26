import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  bookingApi,
  BookingProps,
  CreateBookingPayload,
} from "../api/booking.api";

export const USE_USER_BOOKINGS_KEY = ["user", "bookings"] as const;
export const USE_USER_BOOKING_KEY = ["user", "booking"] as const;
export const USE_ADMIN_BOOKINGS_KEY = ["admin", "bookings"] as const;
export const USE_ADMIN_BOOKING_KEY = ["admin", "booking"] as const;
export const USE_BOOKINGS_KEY = ["bookings"] as const;

export const useUserBookings = (query?: { limit?: number; page?: number }) => {
  return useQuery({
    queryKey: [...USE_USER_BOOKINGS_KEY, query?.limit ?? 8, query?.page ?? 1],
    queryFn: () => bookingApi.getUserBookings(query),
    staleTime: 0,
  });
};

export const useBookingDetails = (bookingId: string) => {
  return useQuery({
    queryKey: [...USE_USER_BOOKING_KEY, bookingId],
    queryFn: () => bookingApi.getBookingDetails(bookingId),
    staleTime: 0,
  });
};

export const useAdminBookings = (
  propertyId: string,
  query?: { limit?: number; page?: number },
) => {
  return useQuery({
    queryKey: [
      ...USE_ADMIN_BOOKINGS_KEY,
      propertyId,
      query?.limit ?? 8,
      query?.page ?? 1,
    ],
    queryFn: () => bookingApi.getBookingsForAdmin(propertyId, query),
    placeholderData: keepPreviousData,
  });
};

export const useCancelAdminBooking = (
  propertyId: string,
  bookingId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...USE_ADMIN_BOOKING_KEY, propertyId, bookingId],
    mutationFn: () => bookingApi.cancelAdminBooking(propertyId, bookingId),
    onSuccess: () => {
      toast.success("Booking cancelled successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [...USE_ADMIN_BOOKING_KEY, propertyId, bookingId],
      });

      queryClient.invalidateQueries({
        queryKey: [...USE_ADMIN_BOOKINGS_KEY, propertyId],
      });
    },

    onError: () => {
      toast.error("Failed to cancel this booking");
    },
  });
};

export const useGetAllBookings = (query?: {
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: [...USE_BOOKINGS_KEY, query?.limit ?? 8, query?.page ?? 1],
    queryFn: () => bookingApi.getAllBookings(query),
    placeholderData: keepPreviousData,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      bookingApi.createBooking(payload),
    onSuccess: () => {
      toast.success("Booking Created successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: USE_USER_BOOKINGS_KEY,
      });
    },
    onError: (err) => {
      toast.error(`Failed to create booking ${err.message}`);
    },
  });
};

export const useUpdateBookings = (bookingId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...USE_USER_BOOKING_KEY, bookingId],
    mutationFn: (payload: BookingProps) =>
      bookingApi.updateBooking(payload, bookingId),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: [...USE_USER_BOOKING_KEY, bookingId],
      });

      const previousBooking = queryClient.getQueryData<BookingProps>([
        ...USE_USER_BOOKING_KEY,
        bookingId,
      ]);

      if (previousBooking) {
        queryClient.setQueryData<BookingProps>(
          [...USE_USER_BOOKING_KEY, bookingId],
          {
            ...previousBooking,
            ...newData,
          },
        );
      }

      return {
        previousBooking,
      };
    },

    onSuccess: () => {
      toast.success("Booking updated successfully");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [...USE_USER_BOOKING_KEY, bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: USE_USER_BOOKINGS_KEY,
      });
    },

    onError: (err, newData, context) => {
      if (context?.previousBooking) {
        queryClient.setQueryData<BookingProps>(
          [...USE_USER_BOOKING_KEY, bookingId],
          context?.previousBooking,
        );
      }

      toast.error(`Failed to update your booking ${err.message}`);
    },
  });
};

export const useCancelBooking = (bookingId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...USE_USER_BOOKING_KEY, bookingId],
    mutationFn: () => bookingApi.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...USE_USER_BOOKING_KEY, bookingId],
      });
      toast.success("Booking cancelled successfully");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: USE_USER_BOOKINGS_KEY,
      });
    },

    onError: (err) => {
      toast.error(`Failed to cancel booking ${err.message}`);
    },
  });
};
