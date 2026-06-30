import { axiosClient } from "@/lib/axios/axios-client";
import type { InvoiceResponse } from "../types";

export const invoiceApi = {
  getInvoice: async (bookingId: string) => {
    const { data } = await axiosClient.get<InvoiceResponse>(
      `/api/v1/invoice/${bookingId}`,
    );
    return data.data;
  },

  getAdminInvoice: async (bookingId: string) => {
    const { data } = await axiosClient.get<InvoiceResponse>(
      `/api/v1/invoice/admin/${bookingId}`,
    );
    return data.data;
  },
};
