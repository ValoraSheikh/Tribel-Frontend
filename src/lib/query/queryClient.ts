import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: "always", 
      staleTime: 0, 
    },
    mutations: {
      retry: 1,
    },
  },
});
