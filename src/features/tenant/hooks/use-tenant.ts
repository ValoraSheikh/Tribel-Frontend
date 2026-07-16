"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantApi, TenantProps } from "../api/tenant.api";
import { toast } from "sonner";

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
    },
  });
};

export const useUpdateTenantProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tenantApi.updateTenantProfile,
    onMutate: async (newKey) => {
      await queryClient.cancelQueries({ queryKey: USE_TENANT_QUERY_KEY });
      const previousTenant = queryClient.getQueryData(USE_TENANT_QUERY_KEY);

      if (previousTenant)
        queryClient.setQueryData(USE_TENANT_QUERY_KEY, {
          ...previousTenant,
          profile: newKey,
        });

      return {
        previousTenant,
      };
    },
    onSuccess: () => {},

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USE_TENANT_QUERY_KEY });
    },
    onError: (err, newKey, context) => {
      if (context?.previousTenant) {
        queryClient.setQueryData(USE_TENANT_QUERY_KEY, context.previousTenant);
      }
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
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to create tenant");
    },
  });
};
