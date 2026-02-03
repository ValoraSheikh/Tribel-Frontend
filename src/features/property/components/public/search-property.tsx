"use client";

import { useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Search, LayoutGrid, ShieldAlertIcon } from "lucide-react";
import { useSearchProperty } from "../../hooks/use-property";
import { PropertyCard1 } from "./property-card";
import { PropertyProps } from "../../api/property.api";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchProperty() {
  const [propertySearch, setPropertySearch] = useQueryState("property", {
    defaultValue: "",
    // shallow: true,
    throttleMs: 500,
  });

  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(8),
  );

  const [page, setPage] = useState<number>(0);

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useSearchProperty({ property: propertySearch, limit, page });

  const totalPages = response?.totalPages || 0;
  const totalProperties = response?.totalProperty || 0;

  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={propertySearch}
            placeholder="Search by city, address, or property name..."
            className="pl-10 h-12 text-lg shadow-sm rounded-full border-muted-foreground/20 focus-visible:ring-primary"
            onChange={(e) => {
              setPropertySearch(e.target.value || null);
              setPage(0);
            }}
          />
        </div>
      </div>

      {!propertySearch ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in-50">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Search properties here
          </h1>
          <p className="text-muted-foreground max-w-md">
            Enter a property name, city, or address in the search bar above to
            see available listings.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Properties
              </h2>
              {!isLoading && (
                <span className="text-muted-foreground text-sm font-medium bg-muted px-2 py-1 rounded-md">
                  {totalProperties} found
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Rows per page:
              </span>
              <Select
                value={limit.toString()}
                onValueChange={(val) => {
                  setLimit(parseInt(val));
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="8" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <PropertiesSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in-50">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <ShieldAlertIcon className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">
                {error.message}
              </h1>
            </div>
          ) : response?.properties && response.properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {response.properties.map((prop: PropertyProps, index: number) => (
                <PropertyCard1 key={prop.id || index} property={prop} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <LayoutGrid className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No properties found</p>
              <p>Try adjusting your search terms</p>
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="mt-10">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page - 1);
                      }}
                      className={
                        page === 0
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => {
                    if (
                      i === 0 ||
                      i === totalPages - 1 ||
                      (i >= page - 1 && i <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            isActive={page === i}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(i);
                            }}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    // Show ellipsis
                    if (i === page - 2 || i === page + 2) {
                      return (
                        <PaginationItem key={i}>
                          <span className="flex h-9 w-9 items-center justify-center">
                            ...
                          </span>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page + 1);
                      }}
                      className={
                        page === totalPages - 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PropertiesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
