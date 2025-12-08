"use client";

import { userApi, UserProps } from "@/lib/api/user.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const USE_QUERY_KEY = ["user", "profile"] as const;

export const useProfile = () => {
  return useQuery({
    queryKey: USE_QUERY_KEY,
    queryFn: userApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 mins
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

    onSuccess: () => {
      toast.success("Profile Updated Successfully");
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

      toast.error("Failed to update profile");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.clear();
      toast.success("Account deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete Account");
    },
  });
};
