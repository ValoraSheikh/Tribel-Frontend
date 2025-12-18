import { serverPropertyApi } from "@/features/property/api/property.api";
import { USE_PROPERTY_QUERY_KEY } from "@/features/property/hooks/use-property";
import { createServerAxios } from "@/lib/axios/axios-server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import ManagePropertySkeleton from "./loading";
import { ManageProperty } from "@/features/property/components/manage-property";
import { serverRoomTemplateApi } from "@/features/room-template/api/room-template.api";
import { USE_ROOM_TEMPLATES_QUERY_KEY } from "@/features/room-template/hooks/use-room-template";

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

  await queryClient.prefetchQuery({
    queryKey: [USE_ROOM_TEMPLATES_QUERY_KEY],
    queryFn: () =>
      serverRoomTemplateApi.getRoomTemplates(serverAxios, propertyId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ManagePropertySkeleton />}>
        <ManageProperty propertyId={propertyId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
