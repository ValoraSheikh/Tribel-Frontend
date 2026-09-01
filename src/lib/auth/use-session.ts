"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { SessionUser } from "./auth-utils";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const USE_SESSION_QUERY_KEY = ["session"];

/**
 * Client-side session for UI chrome (navbar avatar/actions).
 * The page-level `requireAuth` guard stays server-side; this only
 * drives the navbar so it renders instantly without a suspense fallback.
 */
export function useSessionQuery() {
  const query = useQuery({
    queryKey: USE_SESSION_QUERY_KEY,
    queryFn: async (): Promise<SessionUser | null> => {
      try {
        const res = await axios.get(`${API_BASE}/api/v1/user/profile`, {
          withCredentials: true,
          timeout: 3000,
          validateStatus: (status) => status < 500,
        });
        return (res.data?.data as SessionUser | undefined) ?? null;
      } catch {
        return null;
      }
    },
    staleTime: 30_000,
    retry: false,
  });

  return { ...query, data: query.data ?? null };
}
