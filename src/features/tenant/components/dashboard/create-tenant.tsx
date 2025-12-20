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
import { useCreateTenant } from "../../hooks/use-tenant";

const formSchema = z.object({
  name: z
    .string()
    .min(5, "Tenant title must be at least 5 characters.")
    .max(32, "Tenant title must be at most 32 characters."),
  slug: z
    .string()
    .min(5, "Slug title must be at least 5 characters.")
    .max(32, "Slug title must be at most 32 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may only contain lowercase letters, numbers, and single hyphens.",
    ),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters."),
  profile: z.string().max(500),
  timezone: z.string().min(1, "Please select your timezone."),
  currency: z.string().min(1, "Please select your currency."),
});

const currencies = [
  { label: "Indian Rupee (₹)", value: "INR" },
  { label: "US Dollar ($)", value: "USD" },
  { label: "Euro (€)", value: "EUR" },
] as const;

const timezones = [
  { label: "India Standard Time (IST)", value: "Asia/Kolkata" },
  { label: "Pacific Time (PT)", value: "America/Los_Angeles" },
  { label: "Eastern Time (ET)", value: "America/New_York" },
  { label: "Central European Time (CET)", value: "Europe/Berlin" },
  { label: "Japan Standard Time (JST)", value: "Asia/Tokyo" },
] as const;

export function TenantForm() {
  const createTenant = useCreateTenant();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      profile: "",
      timezone: "",
      currency: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    createTenant.mutate(data, {
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
      },
      onError: () => {
        toast.error("Failed to create tenant");
      },
    });
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Create your Tenant
        </CardTitle>
        <CardDescription>
          Fill in the details below to configure your new tenant environment.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          {/* GRID SYSTEM:
             - Mobile: 1 column (stack)
             - Tablet/Desktop (md): 2 columns
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ROW 1: Name (Full Width) */}
            <div className="col-span-1 md:col-span-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1.5"
                  >
                    <FieldLabel htmlFor="tenant-title">Tenant Title</FieldLabel>
                    <Input
                      {...field}
                      id="tenant-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your tenant name here"
                      autoComplete="off"
                      className="w-full"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* ROW 2: Slug & Profile (Side by Side on Desktop) */}
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="space-y-1.5"
                >
                  <FieldLabel htmlFor="slug">Slug Title</FieldLabel>
                  <Input
                    {...field}
                    id="slug"
                    aria-invalid={fieldState.invalid}
                    placeholder="Slug name here"
                    autoComplete="off"
                    className="w-full"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="profile"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="space-y-1.5"
                >
                  <FieldLabel htmlFor="profile">Profile URL</FieldLabel>
                  <Input
                    {...field}
                    id="profile"
                    aria-invalid={fieldState.invalid}
                    placeholder="Profile url here"
                    autoComplete="off"
                    className="w-full"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* ROW 3: Currency & Timezone (Side by Side on Desktop) */}
            <Controller
              name="currency"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                  className="space-y-1.5"
                >
                  <FieldContent>
                    <FieldLabel htmlFor="currency">Currency</FieldLabel>
                    {/* Hidden description on mobile to save space, visible if needed */}
                    <FieldDescription className="sr-only md:not-sr-only text-xs">
                      Select your billing currency
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="currency"
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {currencies.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="timezone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                  className="space-y-1.5"
                >
                  <FieldContent>
                    <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
                    <FieldDescription className="sr-only md:not-sr-only text-xs">
                      Select your local timezone
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="timezone"
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {timezones.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {/* ROW 4: Description (Full Width) */}
            <div className="col-span-1 md:col-span-2">
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1.5"
                  >
                    <FieldLabel htmlFor="form-rhf-demo-description">
                      Description
                    </FieldLabel>
                    <InputGroup className="w-full">
                      <InputGroupTextarea
                        {...field}
                        id="form-rhf-demo-description"
                        placeholder="Introduce yourself and your hosting experience..."
                        rows={4}
                        className="min-h-[100px] resize-none w-full"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums text-xs text-muted-foreground">
                          {field.value?.length}/100
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription className="text-xs">
                      Share details about yourself as a host.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          className="w-full sm:w-auto"
        >
          Reset
        </Button>
        <Button
          type="submit"
          form="form-rhf-demo"
          disabled={createTenant.isPending}
          className="w-full sm:w-auto"
        >
          {createTenant.isPending ? "Creating..." : "Create Tenant"}
        </Button>
      </CardFooter>
    </Card>
  );
}
