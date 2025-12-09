import type { AxiosInstance } from "axios";
import { axiosClient } from "../axios/axios-client";

export interface TenantProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  profile: string;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    avatar: string;
    email: string;
    role: "Guest" | "Staff" | "Admin" | "Super_Admin";
    phoneNo: string;
    auth0Id: string;
  };
}

export interface TenantResponse {
  data: TenantProps;
}

interface CreateTenantPayload {
  name: string;
  slug: string;
  description: string;
  profile: string;
  currency: string;
  timezone: string;
}

export interface UpdateTenant {
  name: string;
  description: string;
  profile: string;
  currency: string;
  timezone: string;
}

export const tenantApi = {
  getTenant: async (): Promise<TenantProps> => {
    const { data } = await axiosClient.get<TenantResponse>(`/api/v1/tenant/`);
    return data.data;
  },

  createTenant: async (payload: CreateTenantPayload) => {
    const { data } = await axiosClient.post<TenantResponse>(
      "/api/v1/tenant",
      payload,
    );
    return data.data;
  },

  updateTenant: async ( payload: UpdateTenant) => {
    const { data } = await axiosClient.patch<TenantResponse>(
      `/api/v1/tenant/`,
      payload,
    );
    return data.data;
  },
};

export const serverTenantApi = {
  getTenant: async (axiosInstance: AxiosInstance): Promise<TenantProps> => {
    const { data } = await axiosInstance.get<TenantResponse>(`/api/v1/tenant/`);
    return data.data;
  },
};
