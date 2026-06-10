"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/reui/alert";
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "@/components/reui/sortable";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CircleAlertIcon,
  CircleXIcon,
  CloudUploadIcon,
  GripVerticalIcon,
  ImageIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import {
  useDeleteImage,
  useGetUploadUrl,
  useUploadFile,
} from "@/features/upload/hooks/use-upload";
import { toUrl } from "@/utils/image";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
  type: string;
  key: string;
}

type SortableImage = {
  id: string;
  src: string;
  alt: string;
  type: "default" | "uploaded";
};

interface ImageUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  className?: string;
  onImagesChange?: (images: ImageFile[]) => void;
  onUploadComplete?: (images: ImageFile[]) => void;
  onImageKeys?: (images: string[]) => void;
  onUploadStart?: () => void;
  initialImages?: string[];
}

export function FileUpload({
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  accept = "image/*",
  className,
  onImagesChange,
  initialImages = [],
  onUploadComplete,
  onImageKeys,
  onUploadStart,
}: ImageUploadProps) {
  const getUploadUrl = useGetUploadUrl();
  const uploadFile = useUploadFile();
  const deleteImage = useDeleteImage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [allImages, setAllImages] = useState<SortableImage[]>([]);
  const [imageKeys, setImageKeys] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && initialImages.length > 0) {
      const defaultImages: SortableImage[] = initialImages.map((key) => ({
        id: key,
        src: toUrl(key) ?? "",
        alt: "Property Image",
        type: "default",
      }));

      setAllImages(defaultImages);
      setImageKeys(initialImages);
      onImageKeys?.(initialImages);
      setIsInitialized(true);
    }
  }, [initialImages, isInitialized, onImageKeys]);

  useEffect(() => {
    onImageKeys?.(imageKeys);
  }, [imageKeys, onImageKeys]);

  const createSortableImage = useCallback(
    (imageFile: ImageFile): SortableImage => ({
      id: imageFile.id,
      src: imageFile.preview,
      alt: imageFile.file.name,
      type: "uploaded",
    }),
    [],
  );

  useEffect(() => {
    setAllImages((prev) => prev.filter((item) => item && item.id));
    setImages((prev) => prev.filter((item) => item && item.id));
  }, []);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "File must be an image";
    }
    if (file.size > maxSize) {
      return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }
    return null;
  };

  const addImages = useCallback(
    (files: FileList | File[]) => {
      const availableSlots = maxFiles - images.length;

      if (availableSlots <= 0) {
        toast.error(`You have reached the maximum of ${maxFiles} images.`);
        return;
      }

      onUploadStart?.();
      const newImages: ImageFile[] = [];
      const newErrors: string[] = [];

      Array.from(files).forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(`${file.name}: ${error}`);
          return;
        }

        const imageFile: ImageFile = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: "uploading",
          type: file.type,
          key: "",
        };

        newImages.push(imageFile);
      });

      if (newErrors.length > 0) {
        setErrors((prev) => [...prev, ...newErrors]);
      }

      if (newImages.length > 0) {
        newImages.map(async (imageFile) => {
          const toastId = toast.loading("Uploading image...", {
            description: imageFile.file.name,
          });
          const { uploadUrl, key } = await getUploadUrl.mutateAsync({
            entity: "property",
            entityId: imageFile.id,
            fileType: imageFile?.type,
          });

          setImageKeys((prev) => [...prev, key]);
          imageFile.key = key;

          await uploadFile.mutateAsync(
            {
              file: imageFile.file,
              url: uploadUrl,
            },
            {
              onError: () => {
                toast.error("Failed to upload image");
              },
            },
          );

          simulateUpload(imageFile);
          toast.dismiss(toastId);
        });

        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onImagesChange?.(updatedImages);

        const newSortableImages = newImages.map(createSortableImage);
        setAllImages((prev) => [...prev, ...newSortableImages]);
      }
    },
    [images, maxSize, maxFiles, onImagesChange, createSortableImage],
  );

  const simulateUpload = (imageFile: ImageFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageFile.id
              ? { ...img, progress: 100, status: "completed" as const }
              : img,
          ),
        );

        const updatedImages = images.map((img) =>
          img.id === imageFile.id
            ? { ...img, progress: 100, status: "completed" as const }
            : img,
        );

        if (updatedImages.every((img) => img.status === "completed")) {
          onUploadComplete?.(updatedImages);
        }
      } else {
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageFile.id ? { ...img, progress } : img,
          ),
        );
      }
    }, 100);
  };

  async function removeImageKey(key: string) {
    
    const deleteImageToast = toast.loading("Deleting image...");
    await deleteImage.mutateAsync(key, {
      onSuccess: () => {
        toast.success("Image deleted");
      },
      onError: () => {
        toast.error("Failed to delete image");
      },
      onSettled: () => {
        toast.dismiss(deleteImageToast);
      },
    });

    setImageKeys((prev) => prev.filter((k) => k !== key));
    onImageKeys?.(imageKeys);
  }
  
  const removeImage = useCallback(
    (id: string) => {
      setAllImages((prev) => prev.filter((img) => img.id !== id));
      const image = images.find((img) => img.id === id);
      
      if (image?.key || id?.startsWith("public/")) {
        removeImageKey(image?.key || id);
      }

      // setImageKeys((prev) => prev.filter((key) => key !== image?.key));
      // console.log("removeImage", imageKeys);
      // onImageKeys?.(imageKeys);


      const uploadedImage = images.find((img) => img.id === id);
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage.preview);
        setImages((prev) => prev.filter((img) => img.id !== id));
      }
    },
    [images, onImageKeys, imageKeys],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        addImages(files);
      }
    },
    [addImages],
  );

  const openFileDialog = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = accept;
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files) {
          addImages(target.files);
        }
      };
      input.click();
    },
    [accept, addImages],
  );

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className={cn("w-full max-w-4xl", className)}>
      {/* Instructions */}
      <div className="mb-4 text-center">
        <p className="text-muted-foreground text-sm">
          Upload up to {maxFiles} images (JPG, PNG, GIF, WebP, max{" "}
          {formatBytes(maxSize)} each). <br />
          Drag and drop images to reorder.
          {images.length > 0 && ` ${images.length}/${maxFiles} uploaded.`}
        </p>
      </div>

      {/* Image Grid with Sortable */}
      <div className="mb-6">
        {/* Combined Images Sortable */}
        <Sortable
          value={allImages.map((item) => item.id)}
          onValueChange={(newItemIds) => {
            // Reconstruct the allImages array based on the new order
            const newAllImages = newItemIds
              .map((itemId) => {
                // First try to find in allImages (default images)
                const existingImage = allImages.find(
                  (img) => img.id === itemId,
                );
                if (existingImage) return existingImage;

                // If not found, it's a newly uploaded image
                const uploadedImage = images.find((img) => img.id === itemId);
                if (uploadedImage) {
                  return createSortableImage(uploadedImage);
                }
                return null;
              })
              .filter((item): item is SortableImage => item !== null);

            setAllImages(newAllImages);

            toast.success("Images reordered successfully!", {
              duration: 3000,
            });
          }}
          getItemValue={(item) => item}
          strategy="grid"
          className="grid auto-rows-fr grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3"
        >
          {allImages.map((item) => (
            <SortableItem key={item.id} value={item.id}>
              <div className="bg-accent/50 group/item border-border hover:bg-accent/70 rounded-md relative flex shrink-0 items-center justify-center border shadow-none transition-all duration-200 hover:z-10 data-[dragging=true]:z-50">
                <Image
                  height={100}
                  width={500}
                  src={item.src}
                  unoptimized={true}
                  className="rounded-md pointer-events-none h-[120px] w-full object-cover"
                  alt={item.alt}
                />

                {/* Drag Handle */}
                <SortableItemHandle className="absolute start-2 top-2 cursor-grab opacity-0 group-hover/item:opacity-100 active:cursor-grabbing">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-6 rounded-full dark:bg-zinc-800 hover:dark:bg-zinc-700"
                  >
                    <GripVerticalIcon className="size-3.5" />
                  </Button>
                </SortableItemHandle>

                {/* Remove Button Overlay */}
                <Button
                  onClick={() => removeImage(item.id, item.src)}
                  variant="outline"
                  size="icon"
                  className="absolute end-2 top-2 size-6 rounded-full opacity-0 shadow-sm group-hover/item:opacity-100 dark:bg-zinc-800 hover:dark:bg-zinc-700"
                >
                  <XIcon className="size-3.5" />
                </Button>
              </div>
            </SortableItem>
          ))}
        </Sortable>
      </div>

      {/* Upload Area */}
      <Card
        className={cn(
          "rounded-md border-dashed shadow-none transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent className="text-center">
          <div className="border-border mx-auto mb-3 flex size-[32px] items-center justify-center rounded-full border">
            <CloudUploadIcon className="size-4" />
          </div>
          <h3 className="text-2sm text-foreground mb-0.5 font-medium">
            Choose a file or drag & drop here.
          </h3>
          <span className="text-secondary-foreground mb-3 block text-xs font-normal">
            JPEG, PNG, up to {formatBytes(maxSize)}.
          </span>
          <Button size="sm" type="button" onClick={openFileDialog}>
            Browse File
          </Button>
        </CardContent>
      </Card>

      {/* Upload Progress Cards */}
      {images.length > 0 && (
        /* Changed space-y-3 to a responsive grid layout with gap-3 */
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 ">
          {images.map((imageFile) => (
            <Card key={imageFile.id} className="rounded-md shadow-none py-0">
              <CardContent className="flex items-center gap-2 p-2.5">
                <div className="border-border rounded-md flex size-[32px] shrink-0 items-center justify-center border">
                  <ImageIcon className="text-muted-foreground size-4" />
                </div>
                <div className="flex w-full flex-col gap-1.5">
                  <div className="-mt-2 flex w-full items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="text-foreground text-xs leading-none font-medium truncate max-w-[100px] lg:max-w-[150px]"
                        title={imageFile.file.name}
                      >
                        {imageFile.file.name}
                      </span>
                      <span className="text-muted-foreground text-xs font-normal">
                        {formatBytes(imageFile.file.size)}
                      </span>
                      {imageFile.status === "uploading" && (
                        <p className="text-muted-foreground text-xs">
                          Uploading... {Math.round(imageFile.progress)}%
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => removeImage(imageFile.id)}
                      variant="ghost"
                      size="icon"
                      className="size-6"
                    >
                      <CircleXIcon className="size-3.5" />
                    </Button>
                  </div>

                  <Progress
                    value={imageFile.progress}
                    className={cn(
                      "h-1 transition-all duration-300",
                      "[&>div]:bg-zinc-950 dark:[&>div]:bg-zinc-50",
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mt-5">
          <CircleAlertIcon />
          <AlertTitle>File upload error(s)</AlertTitle>
          <AlertDescription>
            {errors.map((error, index) => (
              <p key={index} className="last:mb-0">
                {error}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
