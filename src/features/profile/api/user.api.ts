import { axiosClient } from "@/lib/axios/axios-client";
import type { AxiosInstance } from "axios";

export interface UserProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: "Guest" | "Staff" | "Admin" | "Super_Admin";
  phoneNo: string;
  createdAt: string;
  updatedAt: string;
}

interface UserResponse {
  data: UserProps;
}

interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  phoneNo: string;
}

interface avatarUrl{
  key:string
}

export const userApi = {
  getProfile: async (): Promise<UserProps> => {
    const { data } = await axiosClient.get<UserResponse>(
      "/api/v1/user/profile",
    );
    return data.data;
  },

  updateProfile: async (payload: UpdateUserPayload) => {
    const { data } = await axiosClient.patch<UserResponse>(
      "/api/v1/user/profile",
      payload,
    );
    return data.data;
  },

  updateAvatar: async (payload: avatarUrl): Promise<void> => {
    await axiosClient.patch("/api/v1/user/avatar", payload);
  },

  deleteUser: async (): Promise<void> => {
    await axiosClient.delete("/api/v1/user/delete");
  },
};

export const serverUserApi = {
  getProfile: async (axiosInstance: AxiosInstance): Promise<UserProps> => {
    const { data } = await axiosInstance.get<UserResponse>(
      "/api/v1/user/profile",
    );
    return data.data;
  },
};
