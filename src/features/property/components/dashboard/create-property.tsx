"use client";

import * as React from "react";
import { toast } from "sonner";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useCreateProperty } from "../../hooks/use-property";
import { PropertyForm } from "../property-form";
import { Amenity } from "../../api/property.api";


export interface PropertyValuesProps {
  title: string;
  type: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  country: string;
  description: string;
  // images: string[];
  postal_code: string;
  latitude: number;
  longitude: number;
  contact_email: string;
  contact_phone: string;
  amenities?: Amenity[] | null;
}

export function CreateProperty() {
  const router = useRouter();
  const createProperty = useCreateProperty();


  function onSubmit(data: PropertyValuesProps, imageKeys: string[]) {
    if (imageKeys.length === 0) {
      return toast.error("Please upload at least one image.");
    }

    const payload = {
      ...data,
      images: imageKeys,
    };

    createProperty.mutate(payload, {
      onSuccess: () => {
        toast.success("Property created successfully");
        // form.reset();
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


      <PropertyForm
        onSubmit={onSubmit}
        isSubmitting={createProperty.isPending}
        heading="Create your Property"
        paragraph="Fill in the details below to list your property on the platform.
        Provide accurate information to help guests find and choose your
        location."
        mode="create"
      />
    </div>
  );
}
