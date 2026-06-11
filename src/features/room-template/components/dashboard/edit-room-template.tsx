"use client";

import * as React from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit3Icon } from "lucide-react";
import { useUpdateRoomTemplate } from "@/features/room-template/hooks/use-room-template";
import { useGetUploadUrl, useUploadFile } from "@/features/upload/hooks/use-upload";
import { RoomTemplateProps } from "@/features/room-template/api/room-template.api";
import { toUrl } from "@/utils/image";
import { RoomTemplateFormFields } from "../room-template-form";

const editSchema = z.object({
  title: z.string().min(2).max(24),
  description: z.string().min(10).max(50),
  pricePerBed: z.coerce.number<number>().min(1),
  type: z.string().min(1).max(20),
  amenities: z
    .array(z.object({ name: z.string(), icon: z.string() }))
    .optional(),
});

type EditValues = z.infer<typeof editSchema>;

type Props = {
  propertyId: string;
  roomTemplateId: string;
  room: RoomTemplateProps;
};

export function EditRoomTemplate({ propertyId, roomTemplateId, room }: Props) {
  const [open, setOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(toUrl(room.image) ?? "");
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const updateRoomTemplate = useUpdateRoomTemplate(propertyId, roomTemplateId);
  const getUploadUrl = useGetUploadUrl();
  const uploadFile = useUploadFile();

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    mode: "onChange",
    defaultValues: {
      title: room.title,
      description: room.description,
      pricePerBed: room.pricePerBed,
      type: room.type,
      amenities: room.amenities || [],
    },
  });

  React.useEffect(() => {
    form.reset({
      title: room.title,
      description: room.description,
      pricePerBed: room.pricePerBed,
      type: room.type,
      amenities: room.amenities || [],
    });
    setPreviewUrl(toUrl(room.image) ?? "");
    setSelectedFile(null);
    setFileError(null);
  }, [room, form]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFileError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(toUrl(room.image) ?? "");
    setFileError(null);
  };

  async function onSubmit(data: EditValues) {
    setIsUploading(true);

    try {
      let imageKey = room.image;

      if (selectedFile) {
        const { uploadUrl, key } = await getUploadUrl.mutateAsync({
          entity: "tenant",
          entityId: propertyId,
          fileType: selectedFile.type,
        });

        await uploadFile.mutateAsync({ url: uploadUrl, file: selectedFile });
        imageKey = key;
      }

      updateRoomTemplate.mutate(
        { ...data, image: imageKey },
        {
          onSuccess: () => {
            toast.success("Room template updated successfully.");
            setOpen(false);
          },
          onError: (error) => {
            toast.error("Failed to update room template", {
              description: error.message || "Something went wrong.",
            });
          },
        },
      );
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs border-primary/20 text-primary hover:bg-primary/5 px-2.5"
        >
          <Edit3Icon className="w-3.5 h-3.5 mr-1.5" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Room Template</DialogTitle>
            <DialogDescription>
              Update the room details below.
            </DialogDescription>
          </DialogHeader>

          <RoomTemplateFormFields
            form={form}
            mode="edit"
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            fileError={fileError}
            isUploading={isUploading || updateRoomTemplate.isPending}
            onFileSelect={handleFileSelect}
            onRemoveFile={handleRemoveFile}
          />

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  form.reset();
                  setSelectedFile(null);
                  setPreviewUrl(toUrl(room.image) ?? "");
                  setFileError(null);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateRoomTemplate.isPending || isUploading}>
              {updateRoomTemplate.isPending || isUploading ? "Saving..." : "Edit Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}