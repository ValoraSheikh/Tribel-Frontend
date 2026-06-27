"use client";

import { useMutation } from "@tanstack/react-query";
import { paymentApi, RazorpayVerifyPayload } from "../api/payment.api";

export const useCreateRazorpayOrder = () => {
  return useMutation({
    mutationFn: (bookingId: string) => paymentApi.createOrder(bookingId),
    retry: 1,
  });
};

export const useVerifyRazorpayPayment = () => {
  return useMutation({
    mutationFn: (payload: RazorpayVerifyPayload) =>
      paymentApi.verifyPayment(payload),
    retry: 0,
  });
};
