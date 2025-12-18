import { axiosClient } from "@/lib/axios/axios-client";
import type { AxiosInstance } from "axios";

export interface Amenity {
  name: string;
  icon: string;
}

export interface PropertyProps {
  id: string;
  adminId: string;
  title: string;
  type: string;
  gstin: string;
  address: string;
  description: string;
  amenities: Amenity[] | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  contact_email: string;
  contact_phone: string;
  starRating: number;
  images: string[];
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  tenant: {
    name: string;
    currency: string;
    user: {
      firstName: string;
      lastName: string;
      avatar: string;
    };
  };
}

interface PropertyResponse {
  data: PropertyProps;
}

interface PropertiesResponse {
  data: {
    totalProperty: number;
    properties: PropertyProps[];
    totalPages: number;
  };
}

interface CreatePropertyPayload {
  title: string;
  type: string;
  gstin: string;
  address: string;
  city: string;
  description: string;
  state: string;
  country: string;
  images: string[];
  postal_code: string;
  latitude: number;
  longitude: number;
  contact_email: string;
  contact_phone: string;
}

export interface UpdateProperty {
  title: string;
  type: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  country: string;
  description: string;
  images: string[];
  postal_code: string;
  latitude: number;
  longitude: number;
  contact_email: string;
  contact_phone: string;
}

export const propertyApi = {
  getPropertyDetails: async (propertyId: string) => {
    const { data } = await axiosClient.get<PropertyResponse>(
      `/api/v1/properties/${propertyId}`,
    );
    return data.data;
  },

  getAdminProperties: async (query?: { page?: number; limit?: number }) => {
    const { data } = await axiosClient.get<PropertiesResponse>(
      `/api/v1/properties`,
      { params: query },
    );
    return data.data;
  },

  createProperty: async (payload: CreatePropertyPayload) => {
    const { data } = await axiosClient.post<PropertyResponse>(
      `/api/v1/properties`,
      payload,
    );
    return data.data;
  },

  updateProperty: async (propertyId: string, payload: UpdateProperty) => {
    const { data } = await axiosClient.patch<PropertyResponse>(
      `/api/v1/properties/${propertyId}`,
      payload,
    );
    return data.data;
  },

  deleteProperty: async (propertyId: string) => {
    const { data } = await axiosClient.delete<PropertyResponse>(
      `/api/v1/properties/${propertyId}`,
    );
    return data.data;
  },

  getNewProperty: async () => {
    const { data } = await axiosClient.get<PropertiesResponse>(
      `/api/v1/properties/newProperty`,
    );
    return data.data;
  },

  getSearchProperty: async (
    query?: Record<string, string | number | boolean>,
  ) => {
    const { data } = await axiosClient.get<PropertiesResponse>(
      `/api/v1/properties/search`,
      { params: query },
    );
    return data.data;
  },
};

export const serverPropertyApi = {
  getAdminProperties: async (axiosInstance: AxiosInstance) => {
    const { data } = await axiosInstance.get("/api/v1/properties");
    return data.data;
  },

  getPropertyDetails: async (
    axiosInstance: AxiosInstance,
    propertyId: string,
  ) => {
    const { data } = await axiosInstance.get<PropertyResponse>(
      `/api/v1/properties/${propertyId}`,
    );
    return data.data;
  },

  getSearchProperty: async (
    axiosInstance: AxiosInstance,
    query?: Record<string, string | number | boolean>,
  ) => {
    const { data } = await axiosInstance.get<PropertiesResponse>(
      `/api/v1/properties/search`,
      { params: query },
    );
    return data.data;
  },
};
