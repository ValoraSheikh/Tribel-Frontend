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
  FieldGroup,
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTenant } from "@/hooks/use-tenant";

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
      },
      onError: () => {
        toast.error("Failed to create tenant");
      },
    });
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Create your Tenant here</CardTitle>
        <CardDescription>
          You can fill the following coloumns to create your tenant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="tenant-title">Tenant Title</FieldLabel>
                  <Input
                    {...field}
                    id="tenant-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your tenant name here"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="slug">Slug Title</FieldLabel>
                  <Input
                    {...field}
                    id="slug"
                    aria-invalid={fieldState.invalid}
                    placeholder="Slug name here"
                    autoComplete="off"
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
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="slug">Profile URL</FieldLabel>
                  <Input
                    {...field}
                    id="profile"
                    aria-invalid={fieldState.invalid}
                    placeholder="Profile url here"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="currency"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent>
                    <FieldLabel htmlFor="currency">Your Currency</FieldLabel>
                    <FieldDescription>
                      Select currency that you are using
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
                      className="min-w-[120px]"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectSeparator />
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
                >
                  <FieldContent>
                    <FieldLabel htmlFor="timezone">Your Timezone</FieldLabel>
                    <FieldDescription>
                      Select timezone that you are in
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
                      className="min-w-[120px]"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      <SelectItem value="Asia/Kolkata">
                        India Standard Time (IST)
                      </SelectItem>
                      <SelectSeparator />
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
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-description">
                    Description
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="form-rhf-demo-description"
                      placeholder="Introduce yourself and your hosting experience. Who are you, what do you manage, and what can guests expect?"
                      rows={6}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value?.length}/100 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Share details about yourself as a host and your approach to
                    managing properties.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            type="submit"
            form="form-rhf-demo"
            disabled={createTenant.isPending}
          >
            {createTenant.isPending ? "Submitting..." : "Submit"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
