import { axiosClient } from "@/lib/axios/axios-client";
import { AxiosInstance } from "axios";

export interface BookingProps {
  id: string;
  propertyId: string;
  roomId: string;
  guestId: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "UPCOMING" | "ONGOING";
  totalPrice: number;
  startDate: string;
  property: PropertyProps;
  room: Room;
  bed: Bed;
  guest: Guest;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string;
  bedId: string;
}

interface Guest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: number;
}

interface PropertyProps {
  id: string;
  adminId: string;
  title: string;
  type: string;
  gstin: string;
  address: string;
  description: string;
  images: string[];
  city: string;
  state: string;
}

interface Room {
  title: string;
}

interface Bed {
  bedNo: number;
}

interface BookingsResponse {
  data: {
    bookings: BookingProps[];
    page: number;
    totalBookings: number;
    totalPages: number;
  };
}

interface BookingResponse {
  data: {
    booking: BookingProps;
  };
}

export interface CreateBookingPayload {
  propertyId: string;
  roomTemplateId: string;
  startDate: Date;
  endDate: Date;
  paymentMode: "ONLINE" | "OFFLINE";
}

export const bookingApi = {
  getUserBookings: async (query?: { limit?: number; page?: number }) => {
    const { data } = await axiosClient.get<BookingsResponse>(
      `/api/v1/booking/user`,
      {
        params: query,
      },
    );
    return data.data;
  },

  getBookingDetails: async (bookingId: string) => {
    const { data } = await axiosClient.get<BookingsResponse>(
      `/api/v1/booking/${bookingId}`,
    );

    return data.data;
  },

  getBookingsForAdmin: async (
    propertyId: string,
    query?: { limit?: number; page?: number },
  ) => {
    const { data } = await axiosClient.get<BookingsResponse>(
      `/api/v1/booking/${propertyId}`,
      {
        params: query,
      },
    );
    return data.data;
  },

  getAllBookings: async (query?: { limit?: number; page?: number }) => {
    const { data } = await axiosClient.get<BookingsResponse>(
      `/api/v1/booking/admin/all`,
      {
        params: query,
      },
    );
    return data.data;
  },

  createBooking: async ({
    payload,
    idempotencyKey,
  }: {
    payload: CreateBookingPayload;
    idempotencyKey: string;
  }) => {
    const { data } = await axiosClient.post<BookingResponse>(
      `/api/v1/booking`,
      payload,
      {
        headers: {
          "Idempotency-key": idempotencyKey,
        },
      },
    );
    return data.data;
  },

  cancelBooking: async (bookingId: string) => {
    const { data } = await axiosClient.patch<BookingResponse>(
      `/api/v1/booking`,
      { bookingId },
    );
    return data.data;
  },

  cancelAdminBooking: async (propertyId: string, bookingId: string) => {
    const { data } = await axiosClient.patch(
      `/api/v1/booking/admin/${propertyId}`,
      { bookingId },
    );

    return data.data;
  },

  updateBooking: async (payload: BookingProps, bookingId: string) => {
    const { data } = await axiosClient.patch<BookingResponse>(
      `/api/v1/booking/${bookingId}`,
      payload,
    );
    return data.data;
  },
};

export const serverBookingApi = {
  getUserBookings: async (axiosInstance: AxiosInstance) => {
    const { data } =
      await axiosInstance.get<BookingsResponse>(`/api/v1/booking/user`);
    return data.data;
  },

  getBookingsForAdmin: async (
    axiosInstance: AxiosInstance,
    propertyId: string,
  ) => {
    const { data } = await axiosInstance.get<BookingsResponse>(
      `/api/v1/booking/${propertyId}`,
    );
    return data.data;
  },

  getAllBookings: async (axiosInstance: AxiosInstance) => {
    const { data } = await axiosInstance.get<BookingsResponse>(
      `/api/v1/booking/admin/all`,
    );
    return data.data;
  },
};
