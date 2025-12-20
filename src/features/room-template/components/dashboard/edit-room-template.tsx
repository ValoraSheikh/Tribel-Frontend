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
import { Edit3Icon, IndianRupeeIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import {
  useGetRoomTemplateDetails,
  useUpdateRoomTemplate,
} from "@/features/room-template/hooks/use-room-template";
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
import { useEffect } from "react";

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
  pricePerBed: z.coerce.number<number>().min(1),
  type: z.string().min(1).max(20),
  image: z.string().url("Please enter a valid URL"),
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

type RoomTemplateIdProps = {
  roomTemplateId: string;
};

export function EditRoomTemplate({
  propertyId,
  roomTemplateId,
}: PropertyIdProps & RoomTemplateIdProps) {
  const updateRoomTemplate = useUpdateRoomTemplate(propertyId, roomTemplateId);
  const {
    data: room,
    isLoading,
    isError,
  } = useGetRoomTemplateDetails(propertyId, roomTemplateId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: room?.title,
      description: room?.description,
      pricePerBed: room?.pricePerBed,
      image: room?.image,
      type: room?.type,
      amenities: room?.amenities || [],
    },
  });

  useEffect(() => {
    if (room) {
      form.reset({
        title: room?.title,
        description: room?.description,
        pricePerBed: room?.pricePerBed,
        image: room?.image,
        type: room?.type,
        amenities: room?.amenities || [],
      });
    }
  }, [room, form]);

  if (isLoading) return <h1>Loading...</h1>;

  if (isError) console.log("There is an error here");

  function onSubmit(data: z.infer<typeof formSchema>) {
    updateRoomTemplate.mutate(data, {
      onSuccess: () => {
        toast("Success", {
          description: "Room template created successfully.",
        });
        form.reset();
      },
      onError: () => {
        toast.error("Error", {
          description: "Failed to create room template.",
        });
      },
    });
  }

  return (
    <Dialog>
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
        <form
          id="form-create-room"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Room Template</DialogTitle>
            <DialogDescription>
              Fill in the details below to edit your room type on the platform.
            </DialogDescription>
          </DialogHeader>

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
                  <FieldLabel htmlFor="room_type">Hostel Type</FieldLabel>
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

            {/* Image URL - Spans full width */}
            <div className="md:col-span-2">
              <Controller
                name="image"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="image">Cover Image URL</FieldLabel>
                    <Input {...field} id="image" placeholder="https://..." />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
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
            <Button type="submit" disabled={updateRoomTemplate.isPending}>
              {updateRoomTemplate.isPending ? "Saving..." : "Edit Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
