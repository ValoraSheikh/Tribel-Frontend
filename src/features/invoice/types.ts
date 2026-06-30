export type InvoiceStatus = "PENDING" | "GENERATED" | "FAILED";

export interface InvoiceProps {
  id: string;
  bookingId: string;
  paymentId: string | null;
  invoiceNo: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  pdfUrl: string | null;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceResponse {
  data: {
    invoice: InvoiceProps;
    downloadUrl: string;
  };
  message: string;
  statusCode: number;
}
