"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tenantApi, TenantProps } from "../api/tenant.api";

export const USE_TENANT_QUERY_KEY = ["tenant"] as const;

export const useTenant = () => {
  return useQuery({
    queryKey: USE_TENANT_QUERY_KEY,
    queryFn: tenantApi.getTenant,
  });
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tenantApi.updateTenant,
    onMutate: (newData) => {
      queryClient.cancelQueries({ queryKey: USE_TENANT_QUERY_KEY });
      const previousTenant =
        queryClient.getQueryData<TenantProps>(USE_TENANT_QUERY_KEY);

      if (previousTenant) {
        queryClient.setQueryData<TenantProps>(USE_TENANT_QUERY_KEY, {
          ...previousTenant,
          ...newData,
        });
      }

      return {
        previousTenant,
      };
    },

    onSuccess: (updateTenant) => {
      if (updateTenant) {
        queryClient.setQueryData<TenantProps>(
          USE_TENANT_QUERY_KEY,
          updateTenant,
        );
      }
      toast.success("Tenant Updated successfully");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USE_TENANT_QUERY_KEY });
    },

    onError: (err, newData, context) => {
      if (context?.previousTenant) {
        queryClient.setQueryData<TenantProps>(
          USE_TENANT_QUERY_KEY,
          context.previousTenant,
        );
      }
      toast.error(
        `Failed to update tenant: ${err.message || "Something went wrong"}`,
      );
    },
  });
};

export const useCreateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tenantApi.createTenant,
    onSuccess: (createTenant) => {
      if (createTenant) {
        queryClient.setQueryData<TenantProps>(
          USE_TENANT_QUERY_KEY,
          createTenant,
        );
      }
      queryClient.invalidateQueries({ queryKey: USE_TENANT_QUERY_KEY });

      toast.success("Tenant created successfully");
    },
    onError: (err) => {
      toast.error(
        `Failed to create tenant: ${err.message || "Something went wrong"}`,
      );
    },
  });
};
