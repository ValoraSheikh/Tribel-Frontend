"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useState, useRef } from "react";
import { UploadCloud, X } from "lucide-react";

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
import { useRouter } from "next/navigation";
import {
  useGetUploadUrl,
  useUploadFile,
} from "@/features/upload/hooks/use-upload";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

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
  profile: z.string().max(500).or(z.literal("")).optional(),
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
  const router = useRouter();
  const createTenant = useCreateTenant();
  const getUploadUrl = useGetUploadUrl();
  const uploadFile = useUploadFile();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      profile: "",
      timezone: "",
      currency: "",
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
      setFileError("Tenant logo is required.");
      toast.error("Please upload a tenant logo before proceeding.");
      return;
    }

    try {
      setIsUploading(true);

      const { uploadUrl, key } = await getUploadUrl.mutateAsync({
        entity: "tenant",
        entityId: "98a7sef654a6s5d4f",
        fileType: selectedFile.type,
      });

      await uploadFile.mutateAsync({
        url: uploadUrl,
        file: selectedFile,
      });

      const finalPayload = {
        ...data,
        profile: key,
      };

      createTenant.mutate(finalPayload, {
        onSuccess: () => {
          toast.success("Tenant created successfully!");
          form.reset();
          handleRemoveFile();
          router.push("/tenant");
        },
        onError: (error) => {
          toast.error("Failed to create tenant", {
            description: error.message || "Something went wrong.",
          });
        },
      });
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border shadow-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Custom Logo Upload Dropzone - Full Width */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <FieldLabel>Tenant Logo</FieldLabel>
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                    fileError
                      ? "border-destructive bg-destructive/5 hover:bg-destructive/10"
                      : "border-muted-foreground/25 hover:bg-muted/50"
                  }`}
                >
                  <UploadCloud
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
                    disabled={isUploading || createTenant.isPending}
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

            {/* Tenant Title - Full Width */}
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

            {/* Slug Title - Half Width */}
            <div className="col-span-1">
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
            </div>

            {/* Currency - Half Width */}
            <div className="col-span-1">
              <Controller
                name="currency"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="vertical"
                    data-invalid={fieldState.invalid}
                    className="space-y-1.5"
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="currency">Currency</FieldLabel>
                      <FieldDescription className="sr-only">
                        Select your billing currency
                      </FieldDescription>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="currency"
                          aria-invalid={fieldState.invalid}
                          className="w-full mt-1.5"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          {currencies.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            </div>

            {/* Timezone - Half Width (Stays on left side) */}
            <div className="col-span-1">
              <Controller
                name="timezone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="vertical"
                    data-invalid={fieldState.invalid}
                    className="space-y-1.5"
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
                      <FieldDescription className="sr-only">
                        Select your local timezone
                      </FieldDescription>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="timezone"
                          aria-invalid={fieldState.invalid}
                          className="w-full mt-1.5"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            </div>

            {/* Empty Div to maintain grid structure if needed, or Description goes full width */}

            {/* Description - Full Width */}
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
                    <InputGroup className="w-full mt-1.5">
                      <InputGroupTextarea
                        {...field}
                        id="form-rhf-demo-description"
                        placeholder="Introduce your tenant setup..."
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
          onClick={() => {
            form.reset();
            handleRemoveFile();
            setFileError(null);
          }}
          className="w-full sm:w-auto"
          disabled={isUploading || createTenant.isPending}
        >
          Reset
        </Button>
        <Button
          type="submit"
          form="form-rhf-demo"
          disabled={isUploading || createTenant.isPending}
          className="w-full sm:w-auto"
        >
          {isUploading || createTenant.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>Processing...</span>
            </span>
          ) : (
            "Create Tenant"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
