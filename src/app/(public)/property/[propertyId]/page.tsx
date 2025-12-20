import { serverPropertyApi } from "@/features/property/api/property.api";
import { PropertyDetails } from "@/features/property/components/public/property-details";
import { USE_PROPERTY_QUERY_KEY } from "@/features/property/hooks/use-property";
import { createServerAxios } from "@/lib/axios/axios-server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import PropertyProfileSkeleton from "./loading";

type PropertyParams = {
  params: { propertyId: string };
};
const Page = async ({ params }: PropertyParams) => {
  const { propertyId } = await params;

  const queryClient = new QueryClient();
  const serverAxios = await createServerAxios();

  await queryClient.prefetchQuery({
    queryKey: [USE_PROPERTY_QUERY_KEY, propertyId],
    queryFn: () =>
      serverPropertyApi.getPropertyDetails(serverAxios, propertyId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PropertyProfileSkeleton />}>
        <PropertyDetails propertyId={propertyId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
