import { axiosClient } from "@/lib/axios/axios-client";
import type { AxiosInstance } from "axios";

export interface Amenity{
  name: string;
  icon: string;
}

export interface User{
  id: string
  firstName: string
  lastName: string
  avatar: string
  email: string
  phoneNo: string
}

export interface Bed{
  id: string
  roomId: string
  bedNo: number
  createdAt: string
  updatedAt: string
  user: User | null
}

export interface Room{
  id: string
  title: string
  description: string
  pricePerBed: number
  roomTemplateId: string
  bedCount: number
  propertyId: string
  createdAt: string
  updatedAt: string
  beds: Bed[] | null
}

export interface RoomTemplateProps {
  id: string;
  title: string;
  description: string;
  bedsPerRoom: number;
  numberOfRooms: number;
  pricePerBed: number;
  image: string;
  type: string;
  amenities: Amenity[] | null
  rooms: Room[]
}

export interface CreateRoomTemplatePayload{
  title: string;
  description: string;
  bedsPerRoom: number;
  numberOfRooms: number;
  pricePerBed: number;
  image: string;
  type: string;
}

interface RoomTemplateResponse {
  data: RoomTemplateProps;
}

interface RoomTemplatesResponses {
  data: RoomTemplateProps[];
}

export interface UpdateRoomTemplate {
  title: string;
  description: string;
  pricePerBed: number;
  type: string;
  image: string;
}

export const roomTemplateApi = {
  getRoomTemplates: async (propertyId: string) => {
    const { data } = await axiosClient.get<RoomTemplatesResponses>(
      `/api/v1/p/${propertyId}/roomTemplate`,
    );
    return data.data;
  },

  getRoomTemplateDetails: async (
    propertyId: string,
    roomTemplateId: string,
  ) => {
    const { data } = await axiosClient.get<RoomTemplateResponse>(
      `/api/v1/p/${propertyId}/roomTemplate/${roomTemplateId}`,
    );
    return data.data;
  },

  createRoomTemplate: async (payload:CreateRoomTemplatePayload, propertyId: string) => {
    const { data } = await axiosClient.post<RoomTemplateResponse>(
      `/api/v1/p/${propertyId}/roomTemplate`,
      payload
    );
    return data.data;
  },

  updateRoomTemplate: async (
    propertyId: string,
    roomTemplateId: string,
    payload: UpdateRoomTemplate,
  ) => {
    const { data } = await axiosClient.patch<RoomTemplateResponse>(
      `/api/v1/p/${propertyId}/roomTemplate/${roomTemplateId}`,
      payload,
    );
    return data.data;
  },

  deleteRoomTemplate: async (propertyId: string, roomTemplateId: string) => {
    const { data } = await axiosClient.delete<RoomTemplateResponse>(
      `/api/v1/p/${propertyId}/roomTemplate/${roomTemplateId}`,
    );
    return data.data;
  },
};

export const serverRoomTemplateApi = {
  getRoomTemplates: async (
    axiosInstance: AxiosInstance,
    propertyId: string,
  ) => {
    const { data } = await axiosInstance.get<RoomTemplatesResponses>(
      `/api/v1/p/${propertyId}/roomTemplate`,
    );
    return data.data;
  },
  
  getRoomTemplateDetails: async (
    axiosInstance: AxiosInstance,
    propertyId: string,
    roomTemplateId: string,
  ) => {
    const { data } = await axiosInstance.get<RoomTemplateResponse>(
      `/api/v1/p/${propertyId}/roomTemplate/${roomTemplateId}`,
    );
    return data.data;
  },
  
};
