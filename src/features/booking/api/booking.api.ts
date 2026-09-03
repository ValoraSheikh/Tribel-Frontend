import { axiosClient } from "@/lib/axios/axios-client";
import type { RoomTemplateProps } from "@/features/room-template/api/room-template.api";
import { AxiosInstance } from "axios";

export interface BookingProps {
  id: string;
  propertyId: string;
  roomId: string;
  guestId: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "ONGOING"
    | "COMPLETED"
    | "CANCELLED"
    | "REJECTED";
  totalPrice: number;
  startDate: string;
  property: PropertyProps;
  paymentMode: "ONLINE" | "OFFLINE";
  paymentStatus:
    | "PENDING"
    | "PAID"
    | "PENDING_APPROVAL"
    | "FAILED"
    | "PARTIALLY_PAID"
    | "REJECTED"
    | "REFUNDED";
  room: Room;
  bed: Bed;
  guest: Guest;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string;
  bedId: string;
  invoiceId?: string | null;
  invoice?: {
    status: "PENDING" | "GENERATED" | "FAILED";
  } | null;
}

export interface OccupancyBooking {
  id: string;
  status: BookingProps["status"];
  totalPrice: number;
  startDate: string;
  endDate: string;
  paymentMode: "ONLINE" | "OFFLINE";
  paymentStatus: BookingProps["paymentStatus"];
  invoiceId?: string | null;
  invoice?: {
    status: "PENDING" | "GENERATED" | "FAILED";
  } | null;
  guest: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phoneNo: string | null;
    avatar: string | null;
  };
  bed: {
    id: string;
    bedNo: number;
    roomId: string;
  };
  room: {
    id: string;
    title: string;
    roomTemplateId: string;
  };
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    images: string[];
  };
}

export interface OccupancyBed {
  id: string;
  bedNo: number;
  room: {
    id: string;
    title: string;
    roomTemplateId: string;
  };
}

export interface OccupancyResponse {
  bookings: OccupancyBooking[];
  beds: OccupancyBed[];
  startDate: string;
  endDate: string;
}

export interface BookingDataResponse {
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    country: string;
    images: string[];
    contact_email: string;
    contact_phone: string;
    tenant: {
      id: string;
      name: string;
      currency: string;
    };
  };
  roomTemplates: RoomTemplateProps[];
}

interface Guest {
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNo: string | null;
  avatar: string | null;
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

  getBookingData: async (propertyId: string) => {
    const { data } = await axiosClient.get<{ data: BookingDataResponse }>(
      `/api/v1/properties/${propertyId}/booking-data`,
    );
    return data.data;
  },

  getOccupancy: async (
    propertyId: string,
    query: { startDate: string; endDate: string },
  ) => {
    const { data } = await axiosClient.get<{ data: OccupancyResponse }>(
      `/api/v1/booking/occupancy/${propertyId}`,
      {
        params: query,
      },
    );
    return data.data;
  },

  updateBookingStatus: async (
    propertyId: string,
    bookingId: string,
    action: "APPROVE" | "REJECT",
  ) => {
    const { data } = await axiosClient.patch<{
      data: { bookingId: string; status: string };
    }>(`/api/v1/booking/admin/${propertyId}/status`, {
      bookingId,
      action,
    });
    return data.data;
  },

  markBookingPaid: async (
    propertyId: string,
    bookingId: string,
    payload: { provider?: string; reference?: string } = {},
  ) => {
    const { data } = await axiosClient.patch(
      `/api/v1/booking/admin/${propertyId}/payment/paid`,
      { bookingId, ...payload },
    );
    return data.data;
  },

  recordBookingRefund: async (
    propertyId: string,
    bookingId: string,
    payload: {
      amount?: number;
      method?: string;
      reference?: string;
      razorpayRefundId?: string;
    } = {},
  ) => {
    const { data } = await axiosClient.patch(
      `/api/v1/booking/admin/${propertyId}/payment/refund`,
      { bookingId, ...payload },
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

  getOccupancy: async (
    axiosInstance: AxiosInstance,
    propertyId: string,
    query: { startDate: string; endDate: string },
  ) => {
    const { data } = await axiosInstance.get<{ data: OccupancyResponse }>(
      `/api/v1/booking/occupancy/${propertyId}`,
      {
        params: query,
      },
    );
    return data.data;
  },
};
