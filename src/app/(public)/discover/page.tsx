import { serverPropertyApi } from "@/features/property/api/property.api";
import { Hero } from "@/features/property/components/public/hero";
import { USE_PROPERTIES_QUERY_KEY } from "@/features/property/hooks/use-property";
import { createServerAxios } from "@/lib/axios/axios-server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import NewPropertiesSkeleton from "./loading";
import { NewProperties } from "@/features/property/components/public/new-properties";

const Page = async () => {
  const queryClient = new QueryClient();
  const serverAxios = await createServerAxios();

  await queryClient.prefetchQuery({
    queryKey: [USE_PROPERTIES_QUERY_KEY],
    queryFn: () => serverPropertyApi.getNewProperty(serverAxios),
  });

  return (
    <>
      <Hero />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<NewPropertiesSkeleton />}>
          <NewProperties />
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;
