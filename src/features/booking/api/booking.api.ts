import { axiosClient } from "@/lib/axios/axios-client";
import type { RoomTemplateProps } from "@/features/room-template/api/room-template.api";
import { AxiosInstance } from "axios";

export interface BookingProps {
  id: string;
  propertyId: string;
  roomTemplateId: string;
  roomId: string | null;
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
  payments?: { refundStatus: "PENDING" | "PROCESSED" | "FAILED" | null }[];
  room: Room | null;
  bed: Bed | null;
  guest: Guest;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  bedId: string | null;
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
  roomTemplateId: string;
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
  bed?: {
    id: string;
    bedNo: number;
    roomId: string;
  } | null;
  room?: {
    id: string;
    title: string;
    roomTemplateId: string;
  } | null;
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
  id: string;
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
  id: string;
  title: string;
}

interface Bed {
  id: string;
  bedNo: number;
  roomId: string;
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
  phoneNo?: string;
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

    console.log("data is in API frontend", data.data);
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
      reference?: string;
    } = {},
  ) => {
    const { data } = await axiosClient.patch(
      `/api/v1/booking/admin/${propertyId}/payment/refund`,
      { bookingId, ...payload },
    );
    return data.data;
  },

  assignBookingBed: async (
    propertyId: string,
    bookingId: string,
    bedId: string,
  ) => {
    const { data } = await axiosClient.patch(
      `/api/v1/booking/admin/${propertyId}/booking/assign-bed`,
      { bookingId, bedId },
    );
    return data.data;
  },

  updateGuestBookingDates: async (
    bookingId: string,
    payload: { startDate: string; endDate: string },
  ) => {
    const { data } = await axiosClient.patch(`/api/v1/booking/dates`, {
      bookingId,
      ...payload,
    });
    return data.data;
  },

  updateAdminBookingDates: async (
    propertyId: string,
    bookingId: string,
    payload: { startDate: string; endDate: string },
  ) => {
    const { data } = await axiosClient.patch(
      `/api/v1/booking/admin/${propertyId}/booking/dates`,
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

/**
 * Maps a paginated booking row (admin list / guest list shape) into the
 * richer booking shape the details sheet renders.
 */
export function toDrawerBooking(booking: BookingProps): OccupancyBooking {
  return {
    id: booking.id,
    status: booking.status,
    totalPrice: Number(booking.totalPrice),
    startDate: booking.startDate,
    endDate: booking.endDate,
    paymentMode: booking.paymentMode,
    paymentStatus: booking.paymentStatus,
    roomTemplateId: booking.roomTemplateId,
    invoiceId: booking.invoiceId ?? null,
    invoice: booking.invoice ?? null,
    guest: {
      id: booking.guest.id,
      firstName: booking.guest.firstName,
      lastName: booking.guest.lastName,
      email: booking.guest.email,
      phoneNo: booking.guest.phoneNo,
      avatar: booking.guest.avatar,
    },
    bed: booking.bed
      ? {
          id: booking.bed.id,
          bedNo: booking.bed.bedNo,
          roomId: booking.bed.roomId,
        }
      : null,
    room: booking.room
      ? {
          id: booking.room.id,
          title: booking.room.title,
          roomTemplateId: booking.roomTemplateId,
        }
      : null,
    property: {
      id: booking.property.id,
      title: booking.property.title,
      address: booking.property.address,
      city: booking.property.city,
      state: booking.property.state,
      images: booking.property.images,
    },
  };
}
