import type { AxiosInstance } from "axios";
import { axiosClient } from "../axios/axios-client";

export interface UserProps {
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

  deleteUser: async (): Promise<void> => {
    await axiosClient.delete("/api/v1/delete");
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
