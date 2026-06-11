"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
import states from "@/constants/states";
import hostelType from "@/constants/hostel-type";
import availableAmenities from "@/constants/amenities";
import { Spinner } from "@/components/ui/spinner";
import { FileUpload } from "@/features/upload/components/file-upload";
import { Amenity } from "@/features/room-template/api/room-template.api";

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Property title must be at least 5 characters.")
    .max(32, "Property title must be at most 32 characters."),
  type: z.string().min(1).max(20),
  gstin: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(
      z
        .string()
        .regex(
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
          "Enter a valid 15-character GSTIN.",
        ),
    ),
  city: z
    .string()
    .min(2, "City must be at least 2 characters.")
    .max(32, "City must be at most 32 characters."),
  state: z.string().min(2, "State is required."),
  country: z.string().min(2, "Country is required."),
  postal_code: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code."),
  latitude: z.coerce
    .number<number>({ error: "Latitude is necessary" })
    .min(-90, "Latitude must be ≥ -90.")
    .max(90, "Latitude must be ≤ 90."),
  longitude: z.coerce
    .number<number>({ error: "Longitude is necessary" })
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
    .min(20, "Description must be at least 20 characters.")
    .max(150, "Description must be at most 150 characters."),
  // images: z.array(z.string()).min(1, "Add at least one image URL.").optional(),
  amenities: z
    .array(
      z.object({
        name: z.string(),
        icon: z.string(),
      }),
    )
    .optional(),
});

interface PropertyValuesProps {
  title: string;
  type: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  country: string;
  description: string;
  images: string[];
  postal_code: string;
  latitude: number;
  longitude: number;
  contact_email: string;
  contact_phone: string;
  amenities: Amenity[] | null;
}

interface PropertyFormProps {
  initials?: PropertyValuesProps;
  mode?: "create" | "edit";
  onSubmit: (data: z.infer<typeof formSchema>, imageKeys: string[]) => void;
  isSubmitting?: boolean;
  heading?: string;
  paragraph?: string;
}

export function PropertyForm({
  heading,
  paragraph,
  initials,
  mode,
  onSubmit,
  isSubmitting = false,
}: PropertyFormProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [imageKeys, setImageKeys] = useState<string[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);

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
      latitude: undefined,
      longitude: undefined,
      postal_code: "",
      state: initials?.state ?? "",
      type:
        initials?.type ??
        (undefined as unknown as z.infer<typeof formSchema>["type"]),
      // images: [],
      description: "",
      amenities: [],
    },
  });

  useEffect(() => {
    if (initials) {
      form.reset({
        title: initials.title,
        address: initials.address,
        city: initials.city,
        contact_email: initials.contact_email,
        contact_phone: initials.contact_phone,
        country: initials.country,
        gstin: initials.gstin,
        latitude: initials.latitude,
        longitude: initials.longitude,
        postal_code: initials.postal_code,
        state: initials.state,
        type: initials.type,
        description: initials.description,
        amenities: initials?.amenities || [],
      });
      setImageKeys(initials.images || []);
    }
  }, [initials, form]);

  const initialImages = mode === "edit" ? (initials?.images ?? []) : [];

  async function getLocation() {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        form.setValue("latitude", lat, { shouldValidate: true });
        form.setValue("longitude", lon, { shouldValidate: true });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
          );
          const data = await response.json();

          if (data.address) {
            const { city, town, village, state, country, postcode } =
              data.address;
            form.setValue("city", city || town || village || "", {
              shouldValidate: true,
            });
            form.setValue("state", state || "", { shouldValidate: true });
            form.setValue("country", country || "", { shouldValidate: true });
            form.setValue("postal_code", postcode || "", {
              shouldValidate: true,
            });

            toast.success("Location and address auto-filled!");
          }
        } catch (error) {
          toast.warning("Coordinates found, but address lookup failed.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        toast.error("Location access denied, Turn On Location", {
          description: error.message,
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true },
    );
  }

  const handleImageKeys = useCallback((keys: string[]) => {
    setImageKeys(keys);
  }, []);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data, imageKeys);
  });

  return (
    <div>
      {/* Page Header */}
      <div className="space-y-2 mb-10 border-b border-border/60 pb-6">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">
          {heading}
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl">{paragraph}</p>
      </div>

      <form id="form-rhf-demo" onSubmit={handleSubmit} className="space-y-14">
        {/* Section 1: Basic Information */}
        <div className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-lg font-medium text-foreground tracking-tight">
              Basic Information
            </h3>
            <p className="text-sm text-muted-foreground">
              General details and description of the property.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="property-title">
                      Property Title
                    </FieldLabel>
                    <Input
                      {...field}
                      id="property-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Sunshine Backpackers Hostel"
                      autoComplete="off"
                      className="max-w-2xl"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
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
                    <SelectTrigger
                      id="hostel_type"
                      aria-invalid={fieldState.invalid}
                    >
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="md:col-span-2">
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="hostel-description">
                      Hostel Description
                    </FieldLabel>
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-lg font-medium text-foreground tracking-tight">
              Contact Details
            </h3>
            <p className="text-sm text-muted-foreground">
              How guests or admins can reach the property.
            </p>
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </div>

        {/* Section 3: Location Details */}
        <div className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-lg font-medium text-foreground tracking-tight">
              Location Details
            </h3>
            <p className="text-sm text-muted-foreground">
              Physical address and map coordinates.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-address">
                      Hostel Address
                    </FieldLabel>
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Location Fetcher Banner */}
            <div className="sm:col-span-2 lg:col-span-3 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border border-border/50">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  GPS Coordinates
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Use your device to auto-fill your exact latitude and
                  longitude.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={getLocation}
                disabled={isLocating}
                className="w-full sm:w-auto gap-2  shadow-sm hover:bg-accent"
              >
                {isLocating ? (
                  <Spinner className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                {isLocating ? "Locating..." : "Use Current Location"}
              </Button>
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                    value={field.value ?? ""}
                    id="latitude"
                    readOnly
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. 28.6139"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                    value={field.value ?? ""}
                    id="longitude"
                    aria-invalid={fieldState.invalid}
                    readOnly
                    placeholder="e.g. 77.2090"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </div>

        {/* Section 4: Media Upload */}
        <div className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-lg font-medium text-foreground tracking-tight">
              Property Images
            </h3>
            <p className="text-sm text-muted-foreground">
              Upload high-quality images showcasing your property.
            </p>
          </div>

          <div className="max-w-4xl">
            <FieldLabel className="mb-4 block">Image Upload</FieldLabel>

            <FileUpload
              className="py-8 max-w-full"
              onImageKeys={handleImageKeys}
              initialImages={initialImages}
              onUploadStart={() => setIsImageUploading(true)}
              onUploadComplete={() => setIsImageUploading(false)}
            />
          </div>
        </div>

        {/* Section 5: Amenities */}
        <div className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-lg font-medium text-foreground tracking-tight">
              Amenities
            </h3>
            <p className="text-sm text-muted-foreground">
              Select the facilities and amenities available to guests.
            </p>
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
                      field.value?.some((a) => a.name === amenity.name) ??
                      false;

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
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground"
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
            onClick={() => {
              form.reset();
              setImageKeys([]);
            }}
            disabled={isSubmitting || isLocating || isImageUploading}
            className="w-full sm:w-auto min-w-[120px] bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            form="form-rhf-demo"
            disabled={isSubmitting || isLocating || isImageUploading}
            className="w-full sm:w-auto min-w-[140px] shadow-sm transition-all"
          >
            {isSubmitting ? (
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
