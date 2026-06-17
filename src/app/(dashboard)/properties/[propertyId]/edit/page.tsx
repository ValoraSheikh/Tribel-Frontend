import { serverPropertyApi } from "@/features/property/api/property.api";
import { USE_PROPERTY_QUERY_KEY } from "@/features/property/hooks/use-property";
import { createServerAxios } from "@/lib/axios/axios-server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import EditPropertySkeleton from "./loading";
import { EditProperty } from "@/features/property/components/dashboard/edit-property";

type props = {
  params: { propertyId: string };
};

const Page = async ({ params }: props) => {
  const { propertyId } = await params;
  const queryClient = new QueryClient();
  const serverAxios = await createServerAxios();

  await queryClient.prefetchQuery({
    queryKey: [USE_PROPERTY_QUERY_KEY, propertyId],
    queryFn: () =>
      serverPropertyApi.getPropertyDetails(serverAxios, propertyId),
  });

  return (
    <div className="min-h-screen w-full bg-gray-50/50 p-4 md:p-8 lg:p-12">
      <div className="mx-auto max-w-7xl">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<EditPropertySkeleton />}>
            <EditProperty propertyId={propertyId} />
          </Suspense>
        </HydrationBoundary>
      </div>
    </div>
  );
};

export default Page;
