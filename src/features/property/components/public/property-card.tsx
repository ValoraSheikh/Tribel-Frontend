"use client";

import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { NewPropertyProps, PropertyProps } from "../../api/property.api";
import Link from "next/link";
import { toUrl } from "@/utils/image";

export function PropertyCard({ property }: { property: NewPropertyProps }) {
  return (
    <Card className="group border-none shadow-none bg-transparent cursor-pointer">
      <CardContent className="p-0">
        <Link href={`property/${property.id}`}>
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
            <Image
              height={500}
              width={500}
              src={toUrl(property.images[0])!}
              unoptimized={true}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-300"
            />
            <Badge className="absolute top-3 left-3 bg-white/90 text-black hover:bg-white border-none shadow-sm">
              {property.type}
            </Badge>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-base line-clamp-1 flex-1">
                {property.title}
              </h3>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{property.starRating || "New"}</span>
              </div>
            </div>

            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="line-clamp-1">
                {property.city}, {property.state}
              </span>
            </div>

            <p className="text-xs text-muted-foreground/80 line-clamp-1 italic">
              {property.address}
            </p>

            <p className="text-sm font-light text-muted-foreground">
              {property.country}
            </p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}


export function PropertyCard1({ property }: { property: PropertyProps }) {
  return (
    <Card className="group border-none shadow-none bg-transparent cursor-pointer">
      <CardContent className="p-0">
        <Link href={`property/${property.id}`}>
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
            <Image
              height={500}
              width={500}
              src={toUrl(property.images[0]) || "/api/placeholder/400/400"}
              alt={property.title}
              unoptimized
              className="h-full w-full object-cover transition-transform duration-300"
            />
            <Badge className="absolute top-3 left-3 bg-white/90 text-black hover:bg-white border-none shadow-sm">
              {property.type}
            </Badge>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-base line-clamp-1 flex-1">
                {property.title}
              </h3>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{property.starRating || "New"}</span>
              </div>
            </div>

            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="line-clamp-1">
                {property.city}, {property.state}
              </span>
            </div>

            <p className="text-xs text-muted-foreground/80 line-clamp-1 italic">
              {property.address}
            </p>

            <p className="text-sm font-light text-muted-foreground">
              {property.country}
            </p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}