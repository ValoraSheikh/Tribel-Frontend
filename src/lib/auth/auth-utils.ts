import axios from "axios";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buildLoginHref, getSafeReturnPath } from "./return-to";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface SessionUser {
  id: string;
  role: "Guest" | "Staff" | "Admin" | "Super_Admin";
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  avatar?: string;
  auth0Id: string;
  phoneNo?: string;
  tenant?: {
    id: string;
    userId: string;
    [key: string]: unknown;
  } | null;
}

export interface SessionData {
  message: string;
  data: SessionUser;
  statusCode: number;
  success: boolean;
}

const getCookie = async () => (await headers()).get("cookie");

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookie = await getCookie();
  try {
    const res = await axios.get(`${API_BASE}/api/v1/user/profile`, {
      headers: { cookie },
      validateStatus: (status) => status < 500,
    });
    if (!res.data?.data) return null;
    return res.data.data as SessionUser;
  } catch {
    return null;
  }
});

export const requireSession = getSession;

export const requireAuth = async (): Promise<SessionUser> => {
  const session = await getSession();
  if (!session) {
    redirect(buildLoginHref(getSafeReturnPath("/discover")));
  }
  return session;
};

export const requireLogout = () => {
  return redirect(`${API_BASE}/logout`);
};
