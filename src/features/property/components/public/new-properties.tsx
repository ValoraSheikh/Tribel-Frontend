"use client";

import { parseAsInteger, useQueryState } from "nuqs";
import { useNewProperties } from "../../hooks/use-property";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "./property-card";
import { NewPropertyProps } from "../../api/property.api";

export function NewProperties() {
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(8),
  );
  const { data: properties, isLoading, isError } = useNewProperties({ limit });

  if (isError) {
    return (
      <div className="py-10 text-center text-destructive">
        Error loading properties. Please try again later.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Properties</h2>
          <p className="text-muted-foreground">Discover our latest listings</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Show:
          </span>
          <Select
            value={limit.toString()}
            onValueChange={(value) => setLimit(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder="8" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {properties?.map((property: NewPropertyProps, index: number) => (
            <PropertyCard key={index} property={property} />
          ))}
        </div>
      )}

      {properties?.length === 0 && !isLoading && (
        <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
          <p className="text-muted-foreground">No properties found.</p>
        </div>
      )}
    </div>
  );
}
