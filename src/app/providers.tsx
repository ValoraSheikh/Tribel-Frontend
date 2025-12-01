"use client";
import { StoreProvider } from "@/app/StoreProvider";
import { queryClient } from "@/lib/query/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

export default function TanstackProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>{children}</StoreProvider>
    </QueryClientProvider>
  );
}
