import { useMutation } from "@tanstack/react-query";
import { FileProps, uploadApi, UploadProps } from "../api/upload.api";
import { toast } from "sonner";

export const useGetUploadUrl = () => {
  return useMutation({
    mutationFn: (payload: UploadProps) => uploadApi.uploadUrl(payload),
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({ url, file }: FileProps) =>
      uploadApi.uploadFile({ url, file }),
      onError: () => {
        toast.error("Failed to update avatar")
      }
  });
  
};
