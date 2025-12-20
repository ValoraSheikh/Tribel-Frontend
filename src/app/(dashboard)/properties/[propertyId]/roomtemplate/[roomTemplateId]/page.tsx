import { serverRoomTemplateApi } from "@/features/room-template/api/room-template.api";
import { USE_ROOM_TEMPLATE_QUERY_KEY } from "@/features/room-template/hooks/use-room-template";
import { createServerAxios } from "@/lib/axios/axios-server";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import RoomTemplateDetailSkeleton from "./loading";
import { Suspense } from "react";
import { RoomTemplateDetails } from "@/features/room-template/components/dashboard/room-template-details";

type ParamsProp = {
  params: { propertyId: string; roomTemplateId: string };
};

const Page = async ({ params }: ParamsProp) => {
  const { propertyId, roomTemplateId } = await params;

  const queryClient = new QueryClient();
  const serverAxios = await createServerAxios();

  await queryClient.prefetchQuery({
    queryKey: [USE_ROOM_TEMPLATE_QUERY_KEY, propertyId, roomTemplateId],
    queryFn: () =>
      serverRoomTemplateApi.getRoomTemplateDetails(
        serverAxios,
        propertyId,
        roomTemplateId,
      ),
  });
  

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<RoomTemplateDetailSkeleton/>}>
        <RoomTemplateDetails propertyId={propertyId} roomTemplateId={roomTemplateId} />
      </Suspense>
    </HydrationBoundary>
  
  );
};

export default Page;
