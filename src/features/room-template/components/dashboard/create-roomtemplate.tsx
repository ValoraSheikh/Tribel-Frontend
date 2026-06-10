"use client";

import { Button } from "@/components/ui/button";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { IndianRupeeIcon, PlusIcon, UploadCloudIcon, X } from "lucide-react";
import { toast } from "sonner";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { useCreateRoomTemplate } from "@/features/room-template/hooks/use-room-template";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import roomFeatures from "@/constants/rooms-icon";
import { useRef, useState } from "react";
import { useGetUploadUrl, useUploadFile } from "@/features/upload/hooks/use-upload";
import Image from "next/image";

const roomType = [
  { label: "Single Bed", value: "SINGLE" },
  { label: "Double Bed", value: "DOUBLE" },
  { label: "Bunk Bed", value: "BUNK" },
] as const;

const formSchema = z.object({
  title: z
    .string()
    .min(2, "Title must have at least 2 characters")
    .max(24, "Title must be at most 24 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(50, "Description must be at most 50 characters."),
  bedsPerRoom: z.coerce.number<number>().min(1).max(100),
  numberOfRooms: z.coerce.number<number>().min(1).max(500),
  pricePerBed: z.coerce.number<number>().min(1),
  type: z.string().min(1).max(20),
  // image: z.string().url("Please enter a valid URL"), // Added URL validation
  amenities: z
    .array(
      z.object({
        name: z.string(),
        icon: z.string(),
      }),
    )
    .optional(),
});

type PropertyIdProps = {
  propertyId: string;
};

export function CreateRoomTemplate({ propertyId }: PropertyIdProps) {
  const [open, setOpen] = useState<boolean>(false);

  const createRoomTemplate = useCreateRoomTemplate(propertyId);
  const getUploadUrl = useGetUploadUrl();
  const uploadFile = useUploadFile();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      bedsPerRoom: 0,
      numberOfRooms: 0,
      pricePerBed: 0,
      type: "",
      amenities: [],
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFileError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!selectedFile) {
      setFileError("Room image is required.");
      toast.error("Please upload a room image before proceeding.");
      return;
    }

    setIsUploading(true);

    try { 
      const { uploadUrl, key } = await getUploadUrl.mutateAsync({
        entity: "tenant",
        entityId: "98a7sef654a6s5d4f",
        fileType: selectedFile.type,
      });
  
      await uploadFile.mutateAsync({
        url: uploadUrl,
        file: selectedFile,
      });
  
      const payload = { ...data, image: key };

      console.log("payload", payload);
      
      createRoomTemplate.mutate(payload, {
        onSuccess: () => {
          toast("Success", {
            description: "Room template created successfully.",
          });
          form.reset();
          setOpen(false);
        },
        onError: (error) => {
          toast.error("Failed to create room template", {
            description: error.message || "Something went wrong.",
            position: "bottom-right",
            classNames: {
              content: "flex flex-col gap-2",
            },
            style: {
              "--border-radius": "calc(var(--radius)  + 4px)",
            } as React.CSSProperties,
          });
        },
      });
    } catch (error) {
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
        <form
          id="form-create-room"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <DialogHeader>
            <DialogTitle className="text-xl">Create Room Template</DialogTitle>
            <DialogDescription>
              Fill in the details below to list your room type on the platform.
            </DialogDescription>
          </DialogHeader>

          {/* Grid Layout: 1 column on mobile, 2 columns on desktop (md) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="w-full">
                    <FieldLabel htmlFor="title">Room Title</FieldLabel>
                    <Input
                      {...field}
                      id="title"
                      placeholder="e.g. Deluxe Single Room"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Room Type */}
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="room_type">Room Type</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="room_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomType.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Price Per Bed */}
            <Controller
              name="pricePerBed"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="pricePerBed">Price Per Bed</FieldLabel>
                  <div className="relative">
                    <IndianRupeeIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      id="pricePerBed"
                      className="pl-9"
                      type="number"
                      placeholder="0.00"
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Number of Rooms */}
            <Controller
              name="numberOfRooms"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="numberOfRooms">Total Rooms</FieldLabel>
                  <Input
                    {...field}
                    id="numberOfRooms"
                    type="number"
                    placeholder="e.g. 10"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Beds Per Room */}
            <Controller
              name="bedsPerRoom"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="bedsPerRoom">Beds per Room</FieldLabel>
                  <Input
                    {...field}
                    id="bedsPerRoom"
                    type="number"
                    placeholder="e.g. 2"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Image Upload Dropzone - Full Width */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <FieldLabel>Room Image</FieldLabel>
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                    fileError
                      ? "border-destructive bg-destructive/5 hover:bg-destructive/10"
                      : "border-muted-foreground/25 hover:bg-muted/50"
                  }`}
                >
                  <UploadCloudIcon
                    className={`w-6 h-6 ${fileError ? "text-destructive" : "text-muted-foreground"}`}
                  />
                  <p
                    className={`text-sm font-medium ${fileError ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    Click to select an image
                  </p>
                  <p
                    className={`text-xs ${fileError ? "text-destructive/80" : "text-muted-foreground/70"}`}
                  >
                    PNG, JPG or WEBP (max. 2MB)
                  </p>
                </div>
              ) : (
                <div className="relative flex items-center justify-center border rounded-lg p-4 bg-muted/20">
                  <Image
                    height={100}
                    width={100}
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-32 rounded-md object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md"
                    onClick={handleRemoveFile}
                    disabled={isUploading || createRoomTemplate.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {fileError && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {fileError}
                </p>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
            </div>

            {/* Description - Spans full width */}
            <div className="md:col-span-2">
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="description"
                        placeholder="Describe the amenities, view, etc..."
                        className="resize-none"
                        rows={3}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums text-xs">
                          {field.value?.length ?? 0}/50
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Amenities Section - Spans full width */}
            <div className="md:col-span-2">
              <Controller
                name="amenities"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Amenities</FieldLabel>
                    <FieldDescription className="mb-3">
                      Select all that apply
                    </FieldDescription>

                    {/* Responsive Grid for Amenities */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {roomFeatures.map((amenity) => {
                        const IconComponent = amenity.IconComponent;
                        const isSelected =
                          field.value?.some((a) => a.name === amenity.name) ??
                          false;

                        return (
                          <label
                            key={amenity.name}
                            className={`
                              cursor-pointer flex flex-col items-center justify-center gap-2
                              p-3 rounded-lg border text-sm font-medium transition-all
                              hover:bg-accent hover:text-accent-foreground
                              ${
                                isSelected
                                  ? "border-primary bg-primary/5 ring-1 ring-primary text-primary"
                                  : "border-muted-foreground/20 bg-card text-muted-foreground"
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={isSelected}
                              onChange={(e) => {
                                const currentValue = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([
                                    ...currentValue,
                                    {
                                      name: amenity.name,
                                      icon: amenity.icon,
                                    },
                                  ]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (a) => a.name !== amenity.name,
                                    ),
                                  );
                                }
                              }}
                            />
                            <IconComponent
                              className={`h-5 w-5 ${
                                isSelected
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                            {/* Uncommented the name for better UX */}
                            <span className="truncate w-full text-center text-xs">
                              {amenity.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </Field>
                )}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createRoomTemplate.isPending || isUploading}>
              {(createRoomTemplate.isPending || isUploading) ? "Saving..." : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
