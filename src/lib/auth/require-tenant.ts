import { requireAuth } from "./auth-utils";
import { axiosClient } from "../axios/axios-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const requireTenant = async () => {
  const cookie = (await headers()).get("cookie");
  await requireAuth();

  const user = await axiosClient.get("/api/v1/user/profile", {
    headers: { cookie },
  });
  if (!user.data || !user.data.data.tenant) {
    return null;
  }

  return user.data.data.tenant;
};

export const createdTenant = async () => {
  const cookie = (await headers()).get("cookie");
  await requireAuth();

  const user = await axiosClient.get("/api/v1/user/profile", {
    headers: {
      cookie,
    },
  });
  if (user.data.data.tenant) {
    redirect("/main");
  }
};
