"use client";

import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";

export default function EditPropertySkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 md:py-12 lg:px-8 bg-background">
      {/* Page Header */}
      <div className="space-y-2 mb-10 border-b border-border/60 pb-6">
        <Skeleton className="h-10 w-56 max-w-full" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>

      <div className="space-y-14" aria-busy="true" aria-label="Loading property form">
        {/* Section 1: Basic Information */}
        <section className="space-y-6">
          <div className="border-b border-border/50 pb-2 space-y-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full max-w-2xl rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Skeleton className="h-4 w-36" />
              <div className="relative max-w-3xl">
                <Skeleton className="h-[140px] w-full rounded-md" />
                <Skeleton className="absolute bottom-3 right-3 h-4 w-12" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Contact Details */}
        <section className="space-y-6">
          <div className="border-b border-border/50 pb-2 space-y-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </section>

        {/* Section 3: Location Details */}
        <section className="space-y-6">
          <div className="border-b border-border/50 pb-2 space-y-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3 space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="relative max-w-3xl">
                <Skeleton className="h-[100px] w-full rounded-md" />
                <Skeleton className="absolute bottom-3 right-3 h-4 w-12" />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border border-border/50">
              <div className="space-y-2 w-full sm:w-auto">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-72 max-w-full" />
              </div>
              <Skeleton className="h-9 w-full sm:w-44 rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </section>

        {/* Section 4: Media Upload */}
        <section className="space-y-6">
          <div className="border-b border-border/50 pb-2 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>

          <div className="max-w-4xl space-y-4">
            <Skeleton className="h-4 w-28" />
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 sm:p-10">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-56 max-w-full" />
                <Skeleton className="h-3 w-80 max-w-full" />
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Skeleton className="h-10 w-full sm:w-36 rounded-md" />
                  <Skeleton className="h-10 w-full sm:w-44 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Amenities */}
        <section className="space-y-6">
          <div className="border-b border-border/50 pb-2 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>

          <div className="pt-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col items-center justify-center gap-3 p-4 border border-border bg-card rounded-xl"
                >
                  <Skeleton className="h-6 w-6 rounded-md" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Submit Section */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 w-full">
          <Skeleton className="h-10 w-full sm:w-[120px] rounded-md" />
          <Skeleton className="h-10 w-full sm:w-[140px] rounded-md" />
        </div>
      </div>
    </div>
  );
}
