import { createServerAxios } from "@/lib/axios/axios-server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import PropertiesSkeleton from "./loading";
import { Suspense } from "react";
import { USE_PROPERTIES_QUERY_KEY } from "@/features/property/hooks/use-property";
import { serverPropertyApi } from "@/features/property/api/property.api";
import { AdminProperties } from "@/features/property/components/admin-properties";

const Page = async () => {
  const queryClient = new QueryClient();
  const serverAxios = await createServerAxios();

  await queryClient.prefetchQuery({
    queryKey: [USE_PROPERTIES_QUERY_KEY],
    queryFn: () => serverPropertyApi.getAdminProperties(serverAxios),
  });

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<PropertiesSkeleton />}>
          <AdminProperties />
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;
