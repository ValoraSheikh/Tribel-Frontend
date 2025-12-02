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
  console.log("Look here: ", res.data.isAuthenticated);
  if (!res.data.isAuthenticated || !res.data.user) redirect("/login");

  return res.data.user;
};

export const requireLogout = async() => {
  return redirect("/http://localhost:3000/logout")
}
