"use client";

import * as React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IndianRupeeIcon, UploadCloudIcon, X } from "lucide-react";
import Image from "next/image";
import roomFeatures from "@/constants/rooms-icon";

const roomType = [
  { label: "Single Bed", value: "SINGLE" },
  { label: "Double Bed", value: "DOUBLE" },
  { label: "Bunk Bed", value: "BUNK" },
] as const;

type RoomTemplateBaseValues = {
  title: string;
  description: string;
  pricePerBed: number;
  type: string;
  amenities?: { name: string; icon: string }[];
};

export type CreateRoomTemplateValues = RoomTemplateBaseValues & {
  bedsPerRoom?: number;
  numberOfRooms?: number;
};

export type EditRoomTemplateValues = RoomTemplateBaseValues;

export type RoomTemplateFormValues =
  | CreateRoomTemplateValues
  | EditRoomTemplateValues;

type Props = {
  form: UseFormReturn<RoomTemplateFormValues >;
  mode: "create" | "edit";
  previewUrl: string | null;
  fileError: string | null;
  isUploading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
};

export function RoomTemplateFormFields({
  form,
  mode,
  previewUrl,
  fileError,
  isUploading,
  onFileSelect,
  onRemoveFile,
}: Props) {
  const showCreateOnlyFields = mode === "create";

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="type"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="room_type">Room Type</FieldLabel>
            <Select name={field.name} value={field.value} onValueChange={field.onChange}>
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
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

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
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {showCreateOnlyFields && (
        <>
          <Controller
            name="numberOfRooms"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="numberOfRooms">Total Rooms</FieldLabel>
                <Input {...field} id="numberOfRooms" type="number" placeholder="e.g. 10" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="bedsPerRoom"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="bedsPerRoom">Beds per Room</FieldLabel>
                <Input {...field} id="bedsPerRoom" type="number" placeholder="e.g. 2" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </>
      )}

      <div className="col-span-1 md:col-span-2 space-y-1.5">
        <FieldLabel>Room Image</FieldLabel>

        {!previewUrl ? (
          <div
            onClick={() => document.getElementById("room-template-file")?.click()}
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
              unoptimized
              alt="Preview"
              className="max-h-32 rounded-md object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md"
              onClick={onRemoveFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {fileError && <p className="text-[0.8rem] font-medium text-destructive">{fileError}</p>}

        <input
          id="room-template-file"
          type="file"
          onChange={onFileSelect}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
      </div>

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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="md:col-span-2">
        <Controller
          name="amenities"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Amenities</FieldLabel>
              <FieldDescription className="mb-3">Select all that apply</FieldDescription>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {roomFeatures.map((amenity) => {
                  const IconComponent = amenity.IconComponent;
                  const isSelected =
                    field.value?.some((a) => a.name === amenity.name) ?? false;

                  return (
                    <label
                      key={amenity.name}
                      className={`cursor-pointer flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary text-primary"
                          : "border-muted-foreground/20 bg-card text-muted-foreground"
                      }`}
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
                              { name: amenity.name, icon: amenity.icon },
                            ]);
                          } else {
                            field.onChange(
                              currentValue.filter((a) => a.name !== amenity.name),
                            );
                          }
                        }}
                      />
                      <IconComponent
                        className={`h-5 w-5 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
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
  );
}