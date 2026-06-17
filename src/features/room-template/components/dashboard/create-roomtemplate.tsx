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
import { PlusIcon } from "lucide-react";
import { useCreateRoomTemplate } from "@/features/room-template/hooks/use-room-template";
import { useGetUploadUrl, useUploadFile } from "@/features/upload/hooks/use-upload";
import { RoomTemplateFormFields, RoomTemplateFormValues } from "../room-template-form";

const createSchema = z.object({
  title: z.string().min(2).max(24),
  description: z.string().min(10).max(50),
  pricePerBed: z.coerce.number<number>().min(1),
  type: z.string().min(1).max(20),
  bedsPerRoom: z.coerce.number<number>().min(1),
  numberOfRooms: z.coerce.number<number>().min(1),
  amenities: z
    .array(z.object({ name: z.string(), icon: z.string() }))
    .optional(),
});

type CreateValues = z.infer<typeof createSchema>;

type Props = {
  propertyId: string;
};

export function CreateRoomTemplate({ propertyId }: Props) {
  const [open, setOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const createRoomTemplate = useCreateRoomTemplate(propertyId);
  const getUploadUrl = useGetUploadUrl();
  const uploadFile = useUploadFile();

  const form = useForm<RoomTemplateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: "",
      description: "",
      pricePerBed: 0,
      type: "",
      bedsPerRoom: 0,
      numberOfRooms: 0,
      amenities: [],
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFileError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
  };

  async function onSubmit(data: CreateValues) {
    if (!selectedFile) {
      setFileError("Room image is required.");
      toast.error("Please upload a room image before proceeding.");
      return;
    }

    setIsUploading(true);
    try {
      const { uploadUrl, key } = await getUploadUrl.mutateAsync({
        entity: "tenant",
        entityId: propertyId,
        fileType: selectedFile.type,
      });

      await uploadFile.mutateAsync({ url: uploadUrl, file: selectedFile });

      createRoomTemplate.mutate(
        { ...data, image: key },
        {
          onSuccess: () => {
            toast.success("Room template created successfully.");
            form.reset();
            setSelectedFile(null);
            setPreviewUrl(null);
            setOpen(false);
          },
          onError: (error) => {
            toast.error("Failed to create room template", {
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
        <Button className="w-full sm:w-auto gap-2 shadow-sm">
          <PlusIcon className="h-4 w-4" />
          Add New Room Type
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl">Create Room Template</DialogTitle>
            <DialogDescription>
              Fill in the details below to list your room type on the platform.
            </DialogDescription>
          </DialogHeader>

          <RoomTemplateFormFields
            form={form}
            mode="create"
            // selectedFile={selectedFile}
            previewUrl={previewUrl}
            fileError={fileError}
            isUploading={isUploading || createRoomTemplate.isPending}
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
                  setPreviewUrl(null);
                  setFileError(null);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createRoomTemplate.isPending || isUploading}>
              {createRoomTemplate.isPending || isUploading ? "Saving..." : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}