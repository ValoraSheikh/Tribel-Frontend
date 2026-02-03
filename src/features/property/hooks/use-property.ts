import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  propertyApi,
  PropertyProps,
  UpdateProperty,
} from "../api/property.api";

export const USE_PROPERTY_QUERY_KEY = ["property"] as const;
export const USE_PROPERTIES_QUERY_KEY = ["properties"] as const;

export const usePropertyDetails = (propertyId: string) => {
  return useQuery({
    queryKey: [...USE_PROPERTY_QUERY_KEY, propertyId],
    queryFn: () => propertyApi.getPropertyDetails(propertyId),
  });
};

export const useNewProperties = (query?: { limit?: number }) => {
  return useQuery({
    queryKey: [...USE_PROPERTIES_QUERY_KEY, query?.limit ?? 8],
    queryFn: () => propertyApi.getNewProperty(query),
  });
};

export const useGetAdminProperties = (query?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [
      ...USE_PROPERTIES_QUERY_KEY,
      query?.page ?? 1,
      query?.limit ?? 10,
    ],
    queryFn: () => propertyApi.getAdminProperties(query),
  });
};

export const useSearchProperty = (query?: {
  property?: string;
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: [...USE_PROPERTIES_QUERY_KEY, "property", query],
    queryFn: () => propertyApi.getSearchProperty(query),
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertyApi.createProperty,
    onSuccess: (createProperty) => {
      if (createProperty) {
        queryClient.invalidateQueries({ queryKey: USE_PROPERTIES_QUERY_KEY });
        toast.success("Property created successfully");
      }
    },
    onError: (err) => {
      toast.error(
        `Failed to create property: ${err.message || "Something went wrong"}`,
      );
    },
  });
};

export const useUpdateProperty = (propertyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProperty) =>
      propertyApi.updateProperty(propertyId, payload),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: [...USE_PROPERTY_QUERY_KEY, propertyId],
      });

      const previousProperty = queryClient.getQueryData<PropertyProps>([
        ...USE_PROPERTY_QUERY_KEY,
        propertyId,
      ]);
      if (previousProperty) {
        queryClient.setQueryData<PropertyProps>(
          [...USE_PROPERTY_QUERY_KEY, propertyId],
          {
            ...previousProperty,
            ...newData,
          },
        );
      }

      return { previousProperty };
    },

    onSuccess: () => {
      toast.success("Property updated successfully");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [...USE_PROPERTY_QUERY_KEY, propertyId],
      });
      queryClient.invalidateQueries({ queryKey: USE_PROPERTIES_QUERY_KEY });
    },

    onError: (err, newData, context) => {
      if (context?.previousProperty) {
        queryClient.setQueryData<PropertyProps>(
          [...USE_PROPERTY_QUERY_KEY, propertyId],
          context.previousProperty,
        );
        toast.error(
          `Failed to update property: ${err.message || "Something went wrong"}`,
        );
      }
    },
  });
};

export const useDeleteProperty = (propertyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => propertyApi.deleteProperty(propertyId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: [...USE_PROPERTY_QUERY_KEY, propertyId],
      });
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: [...USE_PROPERTY_QUERY_KEY, propertyId],
      });
      queryClient.invalidateQueries({ queryKey: USE_PROPERTIES_QUERY_KEY });
      toast.success("Property deleted succesfully");
    },
    onError: (err) => {
      toast.error(
        `Failed to delete property ${err.message || "Something went wrong"}`,
      );
    },
  });
};
