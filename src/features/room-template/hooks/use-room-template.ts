import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateRoomTemplatePayload,
  roomTemplateApi,
  RoomTemplateProps,
  UpdateRoomTemplate,
} from "../api/room-template.api";

export const USE_ROOM_TEMPLATE_QUERY_KEY = ["roomtemplate"] as const;
export const USE_ROOM_TEMPLATES_QUERY_KEY = ["roomtemplates"] as const;

export const useGetRoomTemplates = (propertyId: string) => {
  return useQuery({
    queryKey: [...USE_ROOM_TEMPLATES_QUERY_KEY, propertyId],
    queryFn: () => roomTemplateApi.getRoomTemplates(propertyId),
  });
};

export const useCreateRoomTemplate = (propertyId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoomTemplatePayload) =>
      roomTemplateApi.createRoomTemplate(payload, propertyId),

    onSuccess: (createRoomTemplate) => {
      if (createRoomTemplate) {
        queryClient.invalidateQueries({
          queryKey: [...USE_ROOM_TEMPLATES_QUERY_KEY, propertyId],
        });
      }
    },

    onError: (err) => {
      // Something if you want
    },
  });
};

export const useGetRoomTemplateDetails = (
  propertyId: string,
  roomTemplateId: string,
) => {
  return useQuery({
    queryKey: [...USE_ROOM_TEMPLATE_QUERY_KEY, propertyId, roomTemplateId],
    queryFn: () =>
      roomTemplateApi.getRoomTemplateDetails(propertyId, roomTemplateId),
  });
};

export const useUpdateRoomTemplate = (
  propertyId: string,
  roomTemplateId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRoomTemplate) =>
      roomTemplateApi.updateRoomTemplate(propertyId, roomTemplateId, payload),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: [...USE_ROOM_TEMPLATE_QUERY_KEY, propertyId, roomTemplateId],
      });

      const previousRoomTemplate = queryClient.getQueryData<RoomTemplateProps>([
        ...USE_ROOM_TEMPLATE_QUERY_KEY,
        propertyId,
        roomTemplateId,
      ]);

      if (previousRoomTemplate) {
        queryClient.setQueryData<RoomTemplateProps>(
          [...USE_ROOM_TEMPLATE_QUERY_KEY, propertyId, roomTemplateId],
          { ...previousRoomTemplate, ...newData },
        );
      }

      return {
        previousRoomTemplate,
      };
    },

    onSuccess: () => {
      // Something if you want
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [...USE_ROOM_TEMPLATE_QUERY_KEY, propertyId, roomTemplateId],
      });

      queryClient.invalidateQueries({
        queryKey: [...USE_ROOM_TEMPLATES_QUERY_KEY, propertyId],
      });
    },

    onError: (err, newData, context) => {
      if (context?.previousRoomTemplate) {
        queryClient.setQueryData<RoomTemplateProps>(
          [...USE_ROOM_TEMPLATE_QUERY_KEY, propertyId, roomTemplateId],
          context?.previousRoomTemplate,
        );
      }
    },
  });
};

export const useDeleteRoomTemplate = (
  propertyId: string,
  roomTemplateId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      roomTemplateApi.deleteRoomTemplate(propertyId, roomTemplateId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: [...USE_ROOM_TEMPLATE_QUERY_KEY, propertyId, roomTemplateId],
      });
      await queryClient.cancelQueries({
        queryKey: [...USE_ROOM_TEMPLATES_QUERY_KEY, propertyId],
      });

      const previousRoomTemplate = queryClient.getQueryData<
        RoomTemplateProps[]
      >([...USE_ROOM_TEMPLATES_QUERY_KEY, propertyId]);

      if (previousRoomTemplate) {
        queryClient.setQueryData<RoomTemplateProps[]>(
          [...USE_ROOM_TEMPLATE_QUERY_KEY, propertyId, roomTemplateId],
          previousRoomTemplate.filter(
            (template) => template.id !== roomTemplateId,
          ),
        );
      }

      return {
        previousRoomTemplate,
      };
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: [...USE_ROOM_TEMPLATE_QUERY_KEY, propertyId, roomTemplateId],
      });
      queryClient.invalidateQueries({
        queryKey: [...USE_ROOM_TEMPLATES_QUERY_KEY, propertyId],
      });
    },
    onError: (err) => {
      // Something if you want
    },
  });
};
