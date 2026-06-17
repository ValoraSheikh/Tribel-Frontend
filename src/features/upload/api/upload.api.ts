import { axiosClient } from "@/lib/axios/axios-client";

export interface UploadProps {
  entity: string;
  fileType: string;
  entityId: string;
}

export interface FileProps {
  url: string;
  file: File;
}

interface UploadResponse {
  data: UploadURLProps;
}

interface UploadURLProps {
  uploadUrl: string;
  key: string;
}

export const uploadApi = {
  uploadUrl: async (payload: UploadProps) => {
    const { data } = await axiosClient.post<UploadResponse>(
      "/api/v1/uploads/presign",
      payload,
    );
    return data.data;
  },

  uploadFile: async ({ url, file }: FileProps) => {
    await axiosClient.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  },

  deleteImage: async ({ key }: { key: string }) => {
    const { data } = await axiosClient.post("/api/v1/uploads/deleteKey", {
      key,
    });
    return data.data;
  },
};
