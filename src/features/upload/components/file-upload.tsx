"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

type UploadItemStatus = "uploading" | "completed" | "error";

interface UploadItem {
  id: string;
  kind: "existing" | "uploaded";
  file?: File;
  preview: string;
  progress: number;
  status: UploadItemStatus;
  error?: string;
  type: string;
  key: string;
  alt: string;
  src: string;
}

interface ImageUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  className?: string;
  onImagesChange?: (images: UploadItem[]) => void;
  onUploadComplete?: (images: UploadItem[]) => void;
  onImageKeys?: (images: string[]) => void;
  onUploadStart?: () => void;
  initialImages?: string[];
}

function buildExistingItems(keys: string[]): UploadItem[] {
  return keys.map((key) => ({
    id: key,
    kind: "existing",
    preview: toUrl(key) ?? "",
    progress: 100,
    status: "completed",
    type: "image/*",
    key,
    alt: "Property Image",
    src: toUrl(key) ?? "",
  }));
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

  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const uploadIntervalsRef = useRef<Record<string, number>>({});
  const itemsRef = useRef<UploadItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const emitStructuralChange = useCallback(
    (nextItems: UploadItem[]) => {
      onImagesChange?.(nextItems);
      onImageKeys?.(nextItems.map((item) => item.key).filter(Boolean));
    },
    [onImagesChange, onImageKeys],
  );

  useEffect(() => {
    const nextItems = buildExistingItems(initialImages);
    setItems(nextItems);
    emitStructuralChange(nextItems);
    // cleanup old upload intervals when the source set changes
    Object.values(uploadIntervalsRef.current).forEach((intervalId) =>
      clearInterval(intervalId),
    );
    uploadIntervalsRef.current = {};
  }, [initialImages.join("|"), emitStructuralChange]);

  useEffect(() => {
    return () => {
      Object.values(uploadIntervalsRef.current).forEach((intervalId) =>
        clearInterval(intervalId),
      );
      uploadIntervalsRef.current = {};

      itemsRef.current.forEach((item) => {
        if (item.preview.startsWith("blob:")) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  const updateItemById = useCallback(
    (id: string, updater: (item: UploadItem) => UploadItem) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? updater(item) : item)),
      );
    },
    [],
  );

  const addImages = useCallback(
    async (files: FileList | File[]) => {
      const validateFile = (file: File): string | null => {
        if (!file.type.startsWith("image/")) {
          return "File must be an image";
        }
        if (file.size > maxSize) {
          return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
        }
        return null;
      };

      const currentCount = itemsRef.current.length;
      const availableSlots = maxFiles - currentCount;

      if (availableSlots <= 0) {
        toast.error(`You have reached the maximum of ${maxFiles} images.`);
        return;
      }

      const incomingFiles = Array.from(files);
      const filesToProcess = incomingFiles.slice(0, availableSlots);

      if (incomingFiles.length > availableSlots) {
        toast.error(
          `Only ${availableSlots} more image${availableSlots === 1 ? "" : "s"} can be added.`,
        );
      }

      const newErrors: string[] = [];
      const newItems: UploadItem[] = [];

      for (const file of filesToProcess) {
        const error = validateFile(file);
        if (error) {
          newErrors.push(`${file.name}: ${error}`);
          continue;
        }

        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          kind: "uploaded",
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: "uploading",
          type: file.type,
          key: "",
          alt: file.name,
          src: URL.createObjectURL(file),
        });
      }

      if (newErrors.length > 0) {
        setErrors((prev) => [...prev, ...newErrors]);
      }

      if (newItems.length === 0) {
        return;
      }

      onUploadStart?.();

      const nextItems = [...itemsRef.current, ...newItems];
      setItems(nextItems);
      emitStructuralChange(nextItems);

      const uploadTasks = newItems.map(async (item) => {
        const toastId = toast.loading("Uploading image...", {
          description: item.file?.name ?? "Image",
        });

        let intervalId: number | undefined;

        try {
          const { uploadUrl, key } = await getUploadUrl.mutateAsync({
            entity: "property",
            entityId: item.id,
            fileType: item.file?.type ?? item.type,
          });

          updateItemById(item.id, (current) => ({
            ...current,
            key,
            preview: current.preview,
          }));

          intervalId = window.setInterval(() => {
            setItems((prev) =>
              prev.map((current) => {
                if (current.id !== item.id) return current;
                if (current.status !== "uploading") return current;

                const nextProgress = Math.min(
                  95,
                  current.progress + Math.random() * 18,
                );

                return {
                  ...current,
                  progress: nextProgress,
                };
              }),
            );
          }, 120);

          await uploadFile.mutateAsync(
            {
              file: item.file as File,
              url: uploadUrl,
            },
            {
              onError: () => {
                toast.error("Failed to upload image");
              },
            },
          );

          if (intervalId) {
            clearInterval(intervalId);
            delete uploadIntervalsRef.current[item.id];
          }

          setItems((prev) =>
            prev.map((current) =>
              current.id === item.id
                ? {
                    ...current,
                    progress: 100,
                    status: "completed",
                    key,
                  }
                : current,
            ),
          );

          return key;
        } catch (error) {
          if (intervalId) {
            clearInterval(intervalId);
            delete uploadIntervalsRef.current[item.id];
          }

          setItems((prev) =>
            prev.map((current) =>
              current.id === item.id
                ? {
                    ...current,
                    status: "error",
                    error: "Upload failed",
                  }
                : current,
            ),
          );

          throw error;
        } finally {
          toast.dismiss(toastId);
        }
      });

      const results = await Promise.allSettled(uploadTasks);
      const successfulKeys = results
        .filter(
          (result): result is PromiseFulfilledResult<string> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      if (successfulKeys.length > 0) {
        setItems((prev) => {
          const next = [...prev];
          emitStructuralChange(next);
          return next;
        });
      }

      onUploadComplete?.(itemsRef.current);
    },
    [
      maxFiles,
      getUploadUrl,
      uploadFile,
      emitStructuralChange,
      onUploadStart,
      onUploadComplete,
      updateItemById,
    ],
  );

  const removeImage = useCallback(
    async (id: string) => {
      const item = itemsRef.current.find((current) => current.id === id);
      if (!item) return;

      const intervalId = uploadIntervalsRef.current[id];
      if (intervalId) {
        clearInterval(intervalId);
        delete uploadIntervalsRef.current[id];
      }

      if (item.preview.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }

      // If it's an already uploaded/existing image, delete it on the backend.
      if (item.key && item.status === "completed") {
        const deleteToast = toast.loading("Deleting image...");

        try {
          await deleteImage.mutateAsync(item.key);
          toast.success("Image deleted");
        } catch {
          toast.error("Failed to delete image");
          return;
        } finally {
          toast.dismiss(deleteToast);
        }
      }

      const nextItems = itemsRef.current.filter((current) => current.id !== id);
      setItems(nextItems);
      emitStructuralChange(nextItems);
    },
    [deleteImage, emitStructuralChange],
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
        void addImages(files);
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

      input.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files) {
          void addImages(target.files);
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

  const sortableIds = items.map((item) => item.id);

  return (
    <div className={cn("w-full max-w-4xl", className)}>
      <div className="mb-4 text-center">
        <p className="text-muted-foreground text-sm">
          Upload up to {maxFiles} images (JPG, PNG, GIF, WebP, max{" "}
          {formatBytes(maxSize)} each). <br />
          Drag and drop images to reorder.
          {items.length > 0 && ` ${items.length}/${maxFiles} uploaded.`}
        </p>
      </div>

      <div className="mb-6">
        <Sortable
          value={sortableIds}
          onValueChange={(newItemIds) => {
            const nextItems = newItemIds
              .map((itemId) =>
                itemsRef.current.find((img) => img.id === itemId),
              )
              .filter((item): item is UploadItem => item !== undefined);

            setItems(nextItems);
            emitStructuralChange(nextItems);

            toast.success("Images reordered successfully!", {
              duration: 3000,
            });
          }}
          getItemValue={(item) => item}
          strategy="grid"
          className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5"
        >
          {items.map((item) => (
            <SortableItem key={item.id} value={item.id}>
              <div className="group/item border-border relative flex shrink-0 items-center justify-center rounded-md border bg-accent/50 shadow-none transition-all duration-200 hover:z-10 hover:bg-accent/70 data-[dragging=true]:z-50">
                <Image
                  height={100}
                  width={500}
                  src={item.src || item.preview}
                  unoptimized
                  className="pointer-events-none h-[120px] w-full rounded-md object-cover"
                  alt={item.alt}
                />

                <SortableItemHandle className="absolute start-2 top-2 cursor-grab opacity-0 active:cursor-grabbing group-hover/item:opacity-100">
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    className="size-6 rounded-full dark:bg-zinc-800 hover:dark:bg-zinc-700"
                  >
                    <GripVerticalIcon className="size-3.5" />
                  </Button>
                </SortableItemHandle>

                <Button
                  onClick={() => void removeImage(item.id)}
                  variant="outline"
                  size="icon"
                  type="button"
                  className="absolute end-2 top-2 size-6 rounded-full opacity-0 shadow-sm group-hover/item:opacity-100 dark:bg-zinc-800 hover:dark:bg-zinc-700"
                >
                  <XIcon className="size-3.5" />
                </Button>
              </div>
            </SortableItem>
          ))}
        </Sortable>
      </div>

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
          <h3 className="text-foreground mb-0.5 text-2sm font-medium">
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

      {items.some(
        (item) => item.status === "uploading" || item.status === "error",
      ) && (
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2">
          {items
            .filter((item) => item.status !== "completed")
            .map((item) => (
              <Card key={item.id} className="rounded-md py-0 shadow-none">
                <CardContent className="flex items-center gap-2 p-2.5">
                  <div className="border-border flex size-[32px] shrink-0 items-center justify-center rounded-md border">
                    <ImageIcon className="text-muted-foreground size-4" />
                  </div>

                  <div className="flex w-full flex-col gap-1.5">
                    <div className="-mt-2 flex w-full items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="text-foreground max-w-[100px] truncate text-xs font-medium leading-none lg:max-w-[150px]"
                          title={item.file?.name ?? item.alt}
                        >
                          {item.file?.name ?? item.alt}
                        </span>
                        {item.file && (
                          <span className="text-muted-foreground text-xs font-normal">
                            {formatBytes(item.file.size)}
                          </span>
                        )}
                        {item.status === "uploading" && (
                          <p className="text-muted-foreground text-xs">
                            Uploading... {Math.round(item.progress)}%
                          </p>
                        )}
                        {item.status === "error" && (
                          <p className="text-destructive text-xs">
                            {item.error ?? "Upload failed"}
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={() => void removeImage(item.id)}
                        variant="ghost"
                        type="button"
                        size="icon"
                        className="size-6"
                      >
                        <CircleXIcon className="size-3.5" />
                      </Button>
                    </div>

                    <Progress
                      value={item.progress}
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
