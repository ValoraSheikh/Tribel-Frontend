import Profile from "@/feature/profile/profile";
import { USE_QUERY_KEY } from "@/hooks/use-user";
import { serverUserApi } from "@/lib/api/user.api";
import { requireAuth } from "@/lib/auth-utils";
import { createServerAxios } from "@/lib/axios/axios-server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

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
      <Profile />
    </HydrationBoundary>
  );
};

export default Page;
