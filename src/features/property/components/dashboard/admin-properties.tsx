"use client";

import { parseAsInteger, useQueryState } from "nuqs";
import {
  MapPin,
  Star,
  Phone,
  Mail,
  FileTextIcon,
  Calendar1Icon,
  Clock2Icon,
  Globe2Icon,
  Building2,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useGetAdminProperties } from "../../hooks/use-property";
import { PropertyProps } from "../../api/property.api";

export const AdminProperties = () => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(4),
  );

  const { data, isLoading, isError, error } = useGetAdminProperties({
    page,
    limit,
  });

  const handleNextPage = () => {
    if (data && page < data.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value));
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse">
        Loading Properties Profile for you...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        <p>
          Failed to load properties. Please try again later.{" "}
          {error.message || "Something went wrong"}
        </p>
      </div>
    );
  }

  if (!data || !data.properties || data.properties.length === 0) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-10 w-10 text-muted-foreground" />
          </div>

          <h3 className="mt-4 text-lg font-semibold">No properties found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            You haven&apos;t added any properties yet. Start by creating your
            first property listing.
          </p>

          <Button asChild>
            <Link href="/createProperty" prefetch>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Property
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  const { properties, totalProperty, totalPages } = data;

  return (
    <div className="container mx-auto space-y-6 p-4 pb-20 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground text-sm">
            Total Properties:{" "}
            <span className="font-medium text-foreground">{totalProperty}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Rows per page
          </span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent>
              {[4, 8, 12, 16].map((val) => (
                <SelectItem key={val} value={val.toString()}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- Properties Grid --- */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
        {properties.map((property: PropertyProps) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* --- Footer / Pagination --- */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const PropertyCard = ({ property }: { property: PropertyProps }) => {
  const coverImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : "https://placehold.co/600x400?text=No+Image";

  return (
    <Card
      key={property.id}
      className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg border-muted-foreground/20 py-0"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          height={500}
          width={500}
          priority
          src={coverImage}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300"
        />
        <div className="absolute right-3 top-3 flex gap-2">
          {/* Star Rating Badge */}
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-white/90 backdrop-blur-md text-yellow-600 shadow-sm"
          >
            <Star className="h-3 w-3 fill-current" />
            {property.starRating || "N/A"}
          </Badge>
          {/* Property Type Badge */}
          <Badge className="bg-primary/90 backdrop-blur-md shadow-sm">
            {property.type}
          </Badge>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <h3
          className="line-clamp-1 text-lg font-bold tracking-tight"
          title={property.title}
        >
          {property.title}
        </h3>
      </CardHeader>

      <CardContent className="grid grow gap-4 p-4 pt-2 text-sm">
        {/* Section: Contact Info */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">
              Contact Details
            </p>

            {property.contact_email && (
              <div className="flex items-center gap-2 overflow-hidden">
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate" title={property.contact_email}>
                  {property.contact_email}
                </span>
              </div>
            )}

            {property.contact_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{property.contact_phone}</span>
              </div>
            )}
          </div>

          {/* Section: Location */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">
              Location
            </p>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="line-clamp-2 leading-tight">
                {property.address} <br />
                {property.city}, {property.state} - {property.postal_code}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Globe2Icon className="h-3 w-3" />
              <span>{property.country}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section: Admin Info (GSTIN & Logic) */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-1">
            <FileTextIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono font-medium">
              GST: {property.gstin || "N/A"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 bg-muted/30 p-4 text-xs text-muted-foreground">
        <div className="grid w-full grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar1Icon className="h-3.5 w-3.5" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase">Created</span>
              <span>{new Date(property.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock2Icon className="h-3.5 w-3.5" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase">Updated</span>
              <span>{new Date(property.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <Separator className="bg-border/50" />

        <div className="flex w-full items-center justify-between gap-2">
          <span
            className="font-mono text-[10px] opacity-70 truncate max-w-20sm:max-w-none"
            title={property.id}
          >
            ID: {property.id}
          </span>

          <div className="flex items-center gap-2">
            <Link href={`/properties/${property.id}/manage`}>
              <Button size="sm" className="h-7 px-3 text-xs font-medium">
                Manage Property
              </Button>
            </Link>

            {/*<Link href={`properties/${property.id}/edit`}>
              <Button size="sm" className="h-7 px-3 text-xs font-medium">
                Edit
              </Button>
            </Link>*/}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
