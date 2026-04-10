"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi, UserProps } from "../api/user.api";

export const USE_QUERY_KEY = ["user", "profile"] as const;

export const useProfile = () => {
  return useQuery({
    queryKey: USE_QUERY_KEY,
    queryFn: userApi.getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: USE_QUERY_KEY });

      const previousUser = queryClient.getQueryData<UserProps>(USE_QUERY_KEY);

      if (previousUser) {
        queryClient.setQueryData<UserProps>(USE_QUERY_KEY, {
          ...previousUser,
          ...newData,
        });
      }

      return { previousUser };
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USE_QUERY_KEY });
    },

    onError: (err, newData, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData<UserProps>(
          USE_QUERY_KEY,
          context.previousUser,
        );
      }
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (err) => {
      // Something if you want
    },
  });
};
