import type { BookingProps } from "../api/booking.api";

export type BookingStatus = BookingProps["status"];

export const OCCUPANCY_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "ONGOING",
  "COMPLETED",
];

interface StatusStyle {
  label: string;
  badge: string;
  bar: string;
  legend: string;
}

export const BOOKING_STATUS_STYLES: Record<BookingStatus, StatusStyle> = {
  PENDING: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "bg-amber-200 text-amber-900 border-2 border-dashed border-amber-500",
    legend: "bg-amber-200 border-2 border-dashed border-amber-500",
  },
  CONFIRMED: {
    label: "Incoming",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    bar: "bg-blue-500 text-white border border-blue-600",
    legend: "bg-blue-500",
  },
  ONGOING: {
    label: "Ongoing",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500 text-white border border-emerald-600",
    legend: "bg-emerald-500",
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    bar: "bg-slate-300 text-slate-700 border border-slate-400",
    legend: "bg-slate-300",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    bar: "",
    legend: "",
  },
  REJECTED: {
    label: "Rejected",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    bar: "",
    legend: "",
  },
};

export const isOccupancyStatus = (status: BookingStatus): boolean =>
  OCCUPANCY_STATUSES.includes(status);
