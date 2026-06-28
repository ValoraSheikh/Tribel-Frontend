import { axiosClient } from "@/lib/axios/axios-client";

interface CreateOrderResponse {
  data: {
    orderId: string;
    amount: number;
    currency: string;
    bookingId: string;
  };
}

interface VerifyPaymentResponse {
  data: {
    payment: unknown;
    bookingId: string;
    redirect: string;
  };
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
}

export const paymentApi = {
  createOrder: async (bookingId: string) => {
    const { data } = await axiosClient.post<CreateOrderResponse>(
      "/api/v1/payment/create-order",
      { bookingId },
    );
    return data.data;
  },

  verifyPayment: async (payload: RazorpayVerifyPayload) => {
    const { data } = await axiosClient.post<VerifyPaymentResponse>(
      "/api/v1/payment/verify",
      payload,
    );
    return data.data;
  },
};
