import axios from "axios";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const requireAuth = async () => {
  const cookie = (await headers()).get("cookie");
  try {
    const res = await axios.get(`${API_BASE}/profile`, {
      headers: { cookie },
      validateStatus: (status) => status < 500,
    });
    if (!res.data.isAuthenticated || !res.data.user) redirect("/");
    return res.data.user;
  } catch {
    redirect("/");
  }
};

export const requireSession = async () => {
  const cookie = (await headers()).get("cookie");
  try {
    const res = await axios.get(`${API_BASE}/profile`, {
      headers: { cookie },
      validateStatus: (status) => status < 500,
    });
    if (!res.data.isAuthenticated || !res.data.user) return null;
    return res.data.user;
  } catch {
    return null;
  }
};

export const requireLogout = () => {
  return redirect(`${API_BASE}/logout`);
};
