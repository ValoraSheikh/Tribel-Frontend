"use client";

import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function TenantProfileSkeleton() {
  return (
    <div className="w-full bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* LEFT COLUMN */}
          <aside className="w-full lg:w-[340px] shrink-0 order-2 lg:order-1">
            <div className="sticky top-10 rounded-3xl border border-border/40 bg-card p-6 sm:p-8 shadow-xl shadow-black/5">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="h-32 w-32 rounded-full mb-4" />

                <Skeleton className="h-7 w-40" />

                <Skeleton className="mt-3 h-7 w-24 rounded-full" />
              </div>

              <Separator className="my-8 bg-border/50" />

              <div className="space-y-5">
                <Skeleton className="h-6 w-48" />

                <div className="space-y-5">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4"
                    >
                      <Skeleton className="h-5 w-5 rounded-md shrink-0" />

                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        {index === 2 && (
                          <Skeleton className="h-3 w-32" />
                        )}
                      </div>

                      <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>


          {/* RIGHT COLUMN */}
          <main className="flex-1 order-1 lg:order-2 space-y-10">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-3 flex-1">
                <Skeleton className="h-12 sm:h-14 w-72 max-w-full" />

                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-6 w-24 rounded-md" />

                  <Skeleton className="h-5 w-40" />

                  <Skeleton className="h-6 w-28 rounded-md" />
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full" />

                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </div>


            <Separator className="bg-border/60" />


            {/* About */}
            <section className="space-y-4">
              <Skeleton className="h-8 w-64" />

              <div className="space-y-3 max-w-3xl">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </section>


            <Separator className="bg-border/60" />


            {/* Settings */}
            <section className="space-y-6">
              <Skeleton className="h-8 w-64" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start"
                  >
                    <Skeleton className="h-7 w-7 rounded-md shrink-0" />

                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-28" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            </section>


            <Separator className="bg-border/60" />


            {/* Metadata */}
            <section className="pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/40 border border-border/40">
                <Skeleton className="h-4 w-4 rounded-md" />
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}