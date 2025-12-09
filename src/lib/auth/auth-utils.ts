import axios from "axios";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
  const cookie = (await headers()).get("cookie");
  const res = await axios.get("http://localhost:3000/profile", {
    headers: {
      cookie,
    },
  });
  if (!res.data.isAuthenticated || !res.data.user) redirect("/");

  return res.data.user;
};

export const requireSession = async () => {
  const cookie = (await headers()).get("cookie");
  const res = await axios.get("http://localhost:3000/profile", {
    headers: {
      cookie,
    },
  });
  if (!res.data.isAuthenticated || !res.data.user) return null;

  return res.data.user;
}

export const requireLogout = () => {
  return redirect("http://localhost:3000/logout")
}
