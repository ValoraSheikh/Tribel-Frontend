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
import { SquarePenIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { useTenant, useUpdateTenant } from "@/hooks/use-tenant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

const formSchema = z.object({
  name: z
    .string()
    .min(5, "Tenant title must be at least 5 characters.")
    .max(32, "Tenant title must be at most 32 characters."),

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

export function EditTenant() {
  const { data: tenant, isLoading, error } = useTenant();

  const updateTenant = useUpdateTenant();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: tenant?.name,
      profile: tenant?.profile,
      timezone: tenant?.timezone,
      currency: tenant?.currency,
      description: tenant?.description,
    },
  });

  if (isLoading) {
    <h1>Loading...</h1>;
  }

  if (error) {
    console.log(error);
  }

  if (!tenant) return null;

  function onSubmit(data: z.infer<typeof formSchema>) {
    updateTenant.mutate(data, {
      onSuccess: () => {
        toast("You submitted the following values:", {
          description: (
            <pre className="bg-code text-accent-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
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
        toast.error("You submitted the following values Failed:", {
          description: (
            <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
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
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <SquarePenIcon size={18} />
      </DialogTrigger>

      {/* FIX:
          1. w-[95vw] -> Ensures it fits on mobile screens with small margins.
          2. sm:max-w-lg -> Slightly wider on desktop for a cleaner look.
          3. max-h-[85vh] -> Prevents the modal from going off-screen on small laptops/phones.
          4. overflow-y-auto -> Adds internal scroll if content is too tall.
      */}
      <DialogContent className="w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <form
          id="form-rhf-demo"
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Profile</DialogTitle>
            <DialogDescription>
              Update your tenant details and preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5">
            {/* ROW 1: Name & Profile URL (Stacked for full width clarity) */}
            <div className="space-y-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Tenant Name</FieldLabel>
                    <Input
                      {...field}
                      id="name"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Acme Corp"
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
                    <FieldLabel htmlFor="profile">Profile URL</FieldLabel>
                    <Input
                      {...field}
                      id="profile"
                      aria-invalid={fieldState.invalid}
                      placeholder="https://..."
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* ROW 2: Currency & Timezone (Side-by-side on Desktop, Stacked on Mobile) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Controller
                name="currency"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="responsive"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="currency">Currency</FieldLabel>
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
                          <SelectItem
                            key={language.value}
                            value={language.value}
                          >
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
                      <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
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
                          <SelectItem
                            key={language.value}
                            value={language.value}
                          >
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            {/* ROW 3: Description */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="form-rhf-demo-description">
                      Description
                    </FieldLabel>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {field.value?.length || 0}/100
                    </span>
                  </div>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="form-rhf-demo-description"
                      placeholder="Tell us about your organization..."
                      rows={4}
                      className="min-h-[100px] resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <Button type="submit" disabled={updateTenant.isPending}>
              {updateTenant.isPending ? "Saving changes..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
