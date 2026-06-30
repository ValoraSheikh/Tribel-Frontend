import { useQuery } from "@tanstack/react-query";
import { invoiceApi } from "../api/invoice.api";

export const INVOICE_KEYS = {
  all: ["invoice"] as const,
  detail: (bookingId: string) =>
    [...INVOICE_KEYS.all, "detail", bookingId] as const,
  adminDetail: (bookingId: string) =>
    [...INVOICE_KEYS.all, "admin", "detail", bookingId] as const,
};

export function useInvoice(bookingId: string | undefined) {
  return useQuery({
    queryKey: INVOICE_KEYS.detail(bookingId!),
    queryFn: () => invoiceApi.getInvoice(bookingId!),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminInvoice(bookingId: string | undefined) {
  return useQuery({
    queryKey: INVOICE_KEYS.adminDetail(bookingId!),
    queryFn: () => invoiceApi.getAdminInvoice(bookingId!),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
}
