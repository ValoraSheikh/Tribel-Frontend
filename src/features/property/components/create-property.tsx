"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useCreateProperty } from "../hooks/use-property";
import { useRouter } from "next/navigation";
import states from "@/constants/states";
import hostelType from "@/constants/hostel-type";
import availableAmenities from "@/constants/amenities";


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
  const router = useRouter();
  const createProperty = useCreateProperty();
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

  function onSubmit(data: z.infer<typeof formSchema>) {
    createProperty.mutate(data, {
      onSuccess: () => {
        toast("You submitted the following values:", {
          description: (
            <pre className="bg-code text-muted-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          ),
          position: "bottom-right",
          classNames: {
            content: "flex flex-col gap-2",
          },
          style: {
            "--border-radius": "calc(var(--radius)  + 4px)",
          } as React.CSSProperties,
        });

        form.reset();
        router.push("/properties");
      },
      onError: () => {
        toast.error("Failed to create property");
      },
    });
  }

  return (
    <Card className="w-full border-muted/60 shadow-md">
      <CardHeader className="space-y-1 border-b bg-gray-50/50 px-6 py-5">
        <CardTitle className="text-2xl font-bold">
          Create your Property
        </CardTitle>
        <CardDescription className="text-base">
          Fill in the details below to list your property on the platform.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 md:p-8">
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Title spans full width because it's the most important field */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
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
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent>
                    <FieldLabel htmlFor="hostel_type">Hostel Type</FieldLabel>
                  </FieldContent>
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
                    placeholder="Enter GSTIN"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Empty div to balance grid on large screens if needed, or let content flow */}
            <div className="hidden lg:block"></div>

            <Controller
              name="contact_email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
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
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
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
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent>
                    <FieldLabel htmlFor="state">State</FieldLabel>
                  </FieldContent>
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
                    placeholder="Postal Code"
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
                    id="latitude"
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
                    id="longitude"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. 77.2090"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Images spans full width */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <Controller
                name="images"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="images">Images</FieldLabel>
                    <Input
                      id="images"
                      aria-invalid={fieldState.invalid}
                      placeholder="https://example.com/1.jpg, https://example.com/2.jpg"
                      autoComplete="off"
                      // 1. DISPLAY LOGIC: Join array back to string for the input
                      value={
                        Array.isArray(field.value)
                          ? field.value.join(", ")
                          : (field.value ?? "")
                      }
                      // 2. UPDATE LOGIC: Split string into array for Zod
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          field.onChange([]);
                        } else {
                          // Split by comma and trim whitespace around urls
                          field.onChange(
                            value.split(",").map((url) => url.trim()),
                          );
                        }
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                    <FieldDescription>
                      Paste image URLs separated by commas.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Description spans full width */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="hostel-description">
                      Hostel description
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="hostel--description"
                        placeholder="Enter description for your hostel..."
                        rows={4}
                        className="min-h-[100px] resize-y"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
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

            {/* Address spans full width */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-description">
                      Hostel Address
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="form-rhf-demo-description"
                        placeholder="Enter full street address here..."
                        rows={4}
                        className="min-h-[100px] resize-y"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
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

            {/* Amenities Section */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <Controller
                name="amenities"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Amenities</FieldLabel>
                    <FieldDescription>
                      Select the amenities available at your property
                    </FieldDescription>
                    {/* UPDATED GRID: Scales from 2 cols (mobile) to 6 cols (desktop) */}
                    <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {availableAmenities.map((amenity) => {
                        const IconComponent = amenity.IconComponent;
                        const isSelected =
                          field.value?.some((a) => a.name === amenity.name) ??
                          false;

                        return (
                          <label
                            key={amenity.name}
                            className={`flex items-center gap-2 p-2.5 border rounded-md cursor-pointer transition-all hover:bg-slate-50 ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                                : "border-muted hover:border-primary/50"
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
                            {/* Icon slightly smaller/adjusted color */}
                            <IconComponent
                              className={`w-4 h-4 ${
                                isSelected
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                            {/* Text truncates if too long, keeps layout neat */}
                            <span
                              className={`text-sm font-medium truncate ${
                                isSelected ? "text-primary" : "text-foreground"
                              }`}
                            >
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
        </form>
      </CardContent>

      <CardFooter className="border-t bg-gray-50/50 p-6">
        <div className="flex w-full items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            className="min-w-[100px]"
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="form-rhf-demo"
            disabled={createProperty.isPending}
            className="min-w-[100px]"
          >
            {createProperty.isPending ? "Submitting..." : "Submit Property"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
