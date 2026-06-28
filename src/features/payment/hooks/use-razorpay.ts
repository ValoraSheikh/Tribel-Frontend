"use client";

import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      close: () => void;
    };
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface UseRazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState<boolean>(
    () => typeof window !== "undefined" && !!window.Razorpay,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () =>
      setLoadError("Failed to load Razorpay SDK. Please check your connection.");
    document.body.appendChild(script);
  }, []);

  const openCheckout = useCallback(
    (options: UseRazorpayOptions): Promise<RazorpayResponse> => {
      return new Promise((resolve, reject) => {
        if (!window.Razorpay) {
          reject(new Error("Razorpay SDK not loaded yet"));
          return;
        }

        const razorpay = new window.Razorpay({
          key: options.key,
          amount: options.amount,
          currency: options.currency,
          name: options.name ?? "Tribel",
          description: options.description ?? "Booking Payment",
          order_id: options.order_id,
          prefill: options.prefill,
          handler: (response: RazorpayResponse) => resolve(response),
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        });

        razorpay.open();
      });
    },
    [],
  );

  return { isLoaded, loadError, openCheckout };
}
