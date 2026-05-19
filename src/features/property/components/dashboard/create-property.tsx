"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
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
import { useRouter } from "next/navigation";
import states from "@/constants/states";
import hostelType from "@/constants/hostel-type";
import availableAmenities from "@/constants/amenities";
import { useCreateProperty } from "../../hooks/use-property";
import { Spinner } from "@/components/ui/spinner";

import {
  useGetUploadUrl,
  useUploadFile,
} from "@/features/upload/hooks/use-upload";
import { FileUpload } from "@/components/file-upload";

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Property title must be at least 5 characters.")
    .max(32, "Property title must be at most 32 characters."),
  type: z.string().min(1).max(20),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
      "Enter a valid 15-character GSTIN.",
    ),
  city: z
    .string()
    .min(2, "City must be at least 2 characters.")
    .max(32, "City must be at most 32 characters."),
  state: z.string().min(2, "State is required."),
  country: z.string().min(2, "Country is required."),

  postal_code: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code."),

  latitude: z.coerce
    .number<number>()
    .min(-90, "Latitude must be ≥ -90.")
    .max(90, "Latitude must be ≤ 90."),

  longitude: z.coerce
    .number<number>()
    .min(-180, "Longitude must be ≥ -180.")
    .max(180, "Longitude must be ≤ 180."),

  contact_email: z.string().email("Enter a valid email address."),

  contact_phone: z
    .string()
    .regex(/^\d{10}$/, "Enter a valid Indian phone number."),

  address: z
    .string()
    .min(20, "Address must be at least 20 characters.")
    .max(150, "Address must be at most 150 characters."),

  description: z
    .string()
    .min(20, "Address must be at least 20 characters.")
    .max(150, "Address must be at most 150 characters."),

  images: z
    .array(z.string().url("Images must be valid URLs."))
    .min(1, "Add at least one image URL."),

  amenities: z
    .array(
      z.object({
        name: z.string(),
        icon: z.string(),
      }),
    )
    .optional(),
});

export function PropertyForm() {
  const getUploadUrl = useGetUploadUrl();
  const uploadFile = useUploadFile();
  const router = useRouter();
  const createProperty = useCreateProperty();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      address: "",
      city: "",
      contact_email: "",
      contact_phone: "",
      country: "",
      gstin: "",
      latitude: 0,
      longitude: 0,
      postal_code: "",
      state: "",
      type: undefined as unknown as z.infer<typeof formSchema>["type"],
      images: [],
      description: "",
      amenities: [],
    },
  });
  const images: string[] = [];

  async function handleUpload() {
    const { uploadUrl, key } = await getUploadUrl.mutateAsync({
      entity: "property",
      entityId: "",
      fileType: selectedFile?.type,
    });

    uploadFile.mutate({
      file: selectedFile,
      url: uploadUrl,
    });

    images.push(key);
    return key;
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    const payload = {
      ...data,
      images: images,
    };

    createProperty.mutate(payload, {
      onSuccess: () => {
        toast.success("Property created successfully");
        form.reset();
        router.push("/properties");
      },

      onError: (error) => {
        toast.error("Failed to create property", {
          description: error.message || "Something went wrong.",
          position: "bottom-right",
          classNames: {
            content: "flex flex-col gap-2",
          },
          style: {
            "--border-radius": "calc(var(--radius) + 4px)",
          } as React.CSSProperties,
        });
      },
    });
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 md:py-12 lg:px-8 bg-background">
      {/* Page Header */}
      <div className="space-y-2 mb-10 border-b border-border/60 pb-6">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">
          Create your Property
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl">
          Fill in the details below to list your property on the platform. Provide accurate information to help guests find and choose your location.
        </p>
      </div>

      <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)} className="space-y-14">
        
        {/* Section 1: Basic Information */}
        <div className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-lg font-medium text-foreground tracking-tight">Basic Information</h3>
            <p className="text-sm text-muted-foreground">General details and description of the property.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="property-title">Property Title</FieldLabel>
                    <Input
                      {...field}
                      id="property-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Sunshine Backpackers Hostel"
                      autoComplete="off"
                      className="max-w-2xl"
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
                  <FieldLabel htmlFor="hostel_type">Hostel Type</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="hostel_type" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostelType.map((type) => (
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
              name="gstin"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="gstin">GSTIN</FieldLabel>
                  <Input
                    {...field}
                    id="gstin"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter 15-character GSTIN"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="md:col-span-2">
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="hostel-description">Hostel Description</FieldLabel>
                    <InputGroup className="max-w-3xl">
                      <InputGroupTextarea
                        {...field}
                        id="hostel-description"
                        placeholder="Enter a detailed description for your property..."
                        rows={5}
                        className="min-h-[140px] resize-y"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums text-muted-foreground text-xs">
                          {field.value?.length ?? 0}/150
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-lg font-medium text-foreground tracking-tight">Contact Details</h3>
            <p className="text-sm text-muted-foreground">How guests or admins can reach the property.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              name="contact_email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="contact@example.com"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="contact_phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    {...field}
                    id="phone"
                    aria-invalid={fieldState.invalid}
                    placeholder="99999 99999"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </div>

        {/* Section 3: Location Details */}
        <div className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-lg font-medium text-foreground tracking-tight">Location Details</h3>
            <p className="text-sm text-muted-foreground">Physical address and map coordinates.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-address">Hostel Address</FieldLabel>
                    <InputGroup className="max-w-3xl">
                      <InputGroupTextarea
                        {...field}
                        id="form-rhf-demo-address"
                        placeholder="Enter full street address here..."
                        rows={3}
                        className="min-h-[100px] resize-y"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums text-muted-foreground text-xs">
                          {field.value?.length ?? 0}/150
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="city"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input
                    {...field}
                    id="city"
                    aria-invalid={fieldState.invalid}
                    placeholder="City name"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="state"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="state">State</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="state" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="country"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <Input
                    {...field}
                    id="country"
                    aria-invalid={fieldState.invalid}
                    placeholder="Country"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="postal_code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="postal_code">Postal Code</FieldLabel>
                  <Input
                    {...field}
                    id="postal_code"
                    aria-invalid={fieldState.invalid}
                    placeholder="6-digit code"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="latitude"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
                  <Input
                    {...field}
                    id="latitude"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. 28.6139"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="longitude"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
                  <Input
                    {...field}
                    id="longitude"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. 77.2090"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </div>

        {/* Section 4: Media Upload */}
        <div className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-lg font-medium text-foreground tracking-tight">Property Images</h3>
            <p className="text-sm text-muted-foreground">Upload high-quality images showcasing your property.</p>
          </div>
          
          <div className="max-w-4xl">
            <FieldLabel className="mb-4 block">Image Upload</FieldLabel>
            <FileUpload className="py-8 max-w-full" />
          </div>
        </div>

        {/* Section 5: Amenities */}
        <div className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-lg font-medium text-foreground tracking-tight">Amenities</h3>
            <p className="text-sm text-muted-foreground">Select the facilities and amenities available to guests.</p>
          </div>
          
          <Controller
            name="amenities"
            control={form.control}
            render={({ field }) => (
              <div className="pt-2">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {availableAmenities.map((amenity) => {
                    const IconComponent = amenity.IconComponent;
                    const isSelected =
                      field.value?.some((a) => a.name === amenity.name) ?? false;

                    return (
                      <label
                        key={amenity.name}
                        className={`group relative flex flex-col items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ease-in-out select-none
                          ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                              : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"
                          }`}
                      >
                        <input
                          type="checkbox"
                          className="absolute opacity-0 w-0 h-0"
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
                          className={`w-6 h-6 transition-colors duration-200 ${
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium text-center leading-tight transition-colors duration-200 ${
                            isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        >
                          {amenity.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          />
        </div>

        {/* Submit Section */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            className="w-full sm:w-auto min-w-[120px] bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            form="form-rhf-demo"
            disabled={createProperty.isPending}
            className="w-full sm:w-auto min-w-[140px] shadow-sm transition-all"
          >
            {createProperty.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4 animate-spin" />
                <span>Submitting...</span>
              </span>
            ) : (
              "Submit Property"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}