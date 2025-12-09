import Profile from "@/feature/profile/profile";
import { USE_QUERY_KEY } from "@/hooks/use-user";
import { serverUserApi } from "@/lib/api/user.api";
import { requireAuth } from "@/lib/auth/auth-utils";
import { createServerAxios } from "@/lib/axios/axios-server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import ProfileSkeleton from "./loading";

const Page = async () => {
  await requireAuth();

  const queryClient = new QueryClient();
  const axiosServer = await createServerAxios();

  await queryClient.prefetchQuery({
    queryKey: [USE_QUERY_KEY],
    queryFn: () => serverUserApi.getProfile(axiosServer),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
