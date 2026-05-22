"use client";

import Link from "next/link";
import {
  MapPin,
  Star,
  Share,
  Edit,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  NotebookTabsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import availableAmenities from "@/constants/amenities";
import Image from "next/image";
import { Amenity } from "../../api/property.api";
import { usePropertyDetails } from "../../hooks/use-property";
import { toUrl } from "@/utils/image";

type PropertyIdProps = {
  propertyId: string;
};

const getAmenityIcon = (iconName: string) => {
  const icons = availableAmenities.find((icon) => icon.icon == iconName);
  const IconToRender = icons?.IconComponent || CheckCircle2;
  return <IconToRender className="h-5 w-5" />;
};

export function PropertyProfile({ propertyId }: PropertyIdProps) {
  const {
    data: property,
    isLoading,
    isError,
    error,
  } = usePropertyDetails(propertyId);

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse">
        Loading Properties Profile for you...
      </div>
    );
  }
  if (isError || !property)
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        <p>
          Failed to load property data. Please try again later.{" "}
          {error?.message || "Something went wrong"}
        </p>
      </div>
    );

  const host = property.tenant.user;
  const tenantProfile = property.tenant;

  console.log("here is the data", property)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* --- HEADER SECTION --- */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-2">
          {property.title}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-medium">
              {property.type}
            </Badge>
            <span className="flex items-center gap-1 font-semibold text-black">
              <Star className="h-4 w-4 fill-black" />
              {property.starRating || "New"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 hover:underline cursor-pointer">
              <MapPin className="h-4 w-4" />
              {`${property.city}, ${property.state}, ${property.country}`}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <Share className="h-4 w-4" /> Share
            </Button>

            <Link href={`/properties/${property.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary/20 hover:bg-primary/5"
              >
                <Edit className="h-4 w-4" /> Edit Property
              </Button>
            </Link>
            
            <Link href={`/properties/${property.id}/bookings`}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary/20 hover:bg-primary/5"
              >
                <NotebookTabsIcon className="h-4 w-4" /> See Your Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* --- IMAGE GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[450px] rounded-2xl overflow-hidden mb-10 relative">
        <div
          className={`relative h-full ${property.images?.length > 1 ? "md:col-span-2" : "md:col-span-4"}`}
        >
          {property.images?.[0] ? (
            <Image
              height={500}
              width={500}
              src={toUrl(property.images[0])!}
              unoptimized={true}
              alt="Main property"
              className="object-cover w-full h-full transition-transform duration-500 cursor-pointer"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              No Image
            </div>
          )}
        </div>

        {/* Secondary Images Grid */}
        {property.images?.length > 1 && (
          <div className="hidden md:grid md:grid-cols-2 gap-2 md:col-span-2 h-full">
            {property.images.slice(1, 5).map((img: string, idx: number) => (
              <div key={idx} className="relative h-full overflow-hidden">
                <Image
                  height={500}
                  width={500}
                  src={toUrl(img)!}
                  unoptimized={true}
                  alt={`Property detail ${idx}`}
                  className="object-cover w-full h-full transition-transform duration-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          className="absolute bottom-4 right-4 text-xs"
        >
          Show all photos
        </Button>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Host Info Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Hosted by {host.firstName} {host.lastName}
              </h2>
              <p className="text-muted-foreground mt-1">
                Managed by {tenantProfile.name} • Joined{" "}
                {new Date(property.createdAt).getFullYear()}
              </p>
            </div>
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
              <AvatarImage src={toUrl(host.avatar )|| ""} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {host.firstName?.[0]}
                {host.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <Separator />

          {/* Highlights */}
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <ShieldCheck className="h-6 w-6 mt-1 text-primary" />
              <div>
                <h3 className="font-semibold">Verified Listing</h3>
                <p className="text-sm text-muted-foreground">
                  Admin ID: {property.adminId} has verified this property.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <MapPin className="h-6 w-6 mt-1 text-primary" />
              <div>
                <h3 className="font-semibold">Great Location</h3>
                <p className="text-sm text-muted-foreground">
                  Located in the heart of {property.city}.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold mb-4">About this place</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          <Separator />

          {/* Amenities */}
          <div>
            <h3 className="text-xl font-semibold mb-6">
              What this place offers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              {property.amenities && property.amenities.length > 0 ? (
                property.amenities.map((amenity: Amenity, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <span className="text-gray-500">
                      {getAmenityIcon(amenity.icon)}
                    </span>
                    <span>{amenity.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No specific amenities listed.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="shadow-lg border-muted/60">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Contact Details</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manager Information (Admin View)
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info Block */}
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-medium text-muted-foreground">
                        Email
                      </p>
                      <p
                        className="text-sm font-semibold truncate"
                        title={property.contact_email}
                      >
                        {property.contact_email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Phone
                      </p>
                      <p className="text-sm font-semibold">
                        {property.contact_phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="text-xs text-muted-foreground space-y-2 pt-2">
                  <div className="flex justify-between">
                    <span>GSTIN</span>
                    <span className="font-mono">{property.gstin || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Postal Code</span>
                    <span>{property.postal_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated</span>
                    <span>
                      {new Date(property.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currency</span>
                    <span>{tenantProfile.currency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* --- LOCATION SECTION --- */}
      <Separator className="my-10" />
      <div className="space-y-4 mb-10">
        <h3 className="text-xl font-semibold">Where you&apos;ll be</h3>
        <p className="text-muted-foreground">
          {property.address}, {property.city}, {property.country}
        </p>

        <div className="w-full h-[300px] bg-muted/40 rounded-xl flex items-center justify-center border-2 border-dashed relative overflow-hidden">
          <MapPin className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <span className="absolute bottom-4 right-4 bg-white/80 px-3 py-1 text-xs rounded-md shadow backdrop-blur-sm">
            Lat: {property.latitude} | Long: {property.longitude}
          </span>
        </div>
      </div>
    </div>
  );
}
