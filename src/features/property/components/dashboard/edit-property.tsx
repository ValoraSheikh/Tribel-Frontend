"use client";

import * as React from "react";
import { toast } from "sonner";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  usePropertyDetails,
  useUpdateProperty,
} from "../../hooks/use-property";
import { PropertyValuesProps } from "./create-property";
import { PropertyForm } from "../property-form";


type PropertyIdProps = {
  propertyId: string;
};

export function EditProperty({ propertyId }: PropertyIdProps) {
  const router = useRouter();
  const {
    data: propertyDetail,
    isLoading,
    isError,
    error,
  } = usePropertyDetails(propertyId);
  const updateProperty = useUpdateProperty(propertyId);


  if (isLoading) {
    return  (
      <div className="p-8 text-center animate-pulse">
        Loading Edit Property for you...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        <p>
          Failed to load property details. Please try again later.{" "}
          {error.message || "Something went wrong"}
        </p>
      </div>
    );
  }

  if (!propertyDetail) return null;

  function onSubmit(data: PropertyValuesProps, imageKeys: string[]) {
    if (imageKeys.length === 0) {
      return toast.error("Please upload at least one image.");
    }

    const payload = {
      ...data,
      images: imageKeys,
    };

    updateProperty.mutate(payload, {
      onSuccess: () => {
        toast.success("Property updated successfully");
        router.push("/properties");
      },

      onError: (error: Error) => {
        toast.error("Failed to update property", {
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
        isSubmitting={updateProperty.isPending}
        heading="Edit your Property"
        paragraph="Fill in the details below to update your property details on the platform.
        Provide accurate information to help guests find and choose your
        location."
        mode="edit"
        initials={propertyDetail}
        propertyId={propertyId}
      />

      
    </div>
  );
}
