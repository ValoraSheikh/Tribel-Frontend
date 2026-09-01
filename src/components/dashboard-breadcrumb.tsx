"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { usePropertyDetails } from "@/features/property/hooks/use-property";
import { useGetRoomTemplateDetails } from "@/features/room-template/hooks/use-room-template";

type Crumb = {
  label: React.ReactNode;
  href?: string;
};

export const DashboardBreadcrumb = () => {
  const pathname = usePathname();

  const segments = pathname ? pathname.split("/").filter(Boolean) : [];
  const isPropertyRoute = segments[0] === "properties" && segments.length >= 2;

  const propertyId = isPropertyRoute ? segments[1] : "";
  const action = isPropertyRoute ? segments[2] : undefined;
  const roomTemplateId =
    action === "roomtemplate" ? segments[3] : undefined;

  const { data: property, isLoading: propertyLoading } =
    usePropertyDetails(propertyId, { enabled: isPropertyRoute });

  const { data: roomTemplate, isLoading: rtLoading } =
    useGetRoomTemplateDetails(propertyId, roomTemplateId ?? "", {
      enabled: isPropertyRoute && !!roomTemplateId,
    });

  if (!isPropertyRoute) return null;
  if (!pathname) return null;

  const propertyLabel = propertyLoading ? (
    <Skeleton className="h-4 w-28" />
  ) : (
    property?.title ?? "Property"
  );

  const crumbs: Crumb[] = [
    { label: "Dashboard", href: "/main" },
    { label: "Properties", href: "/properties" },
  ];

  if (!action) {
    crumbs.push({ label: propertyLabel });
  } else if (action === "edit") {
    crumbs.push({
      label: propertyLabel,
      href: `/properties/${propertyId}/manage`,
    });
    crumbs.push({ label: "Edit Property" });
  } else if (action === "manage") {
    crumbs.push({ label: propertyLabel });
    crumbs.push({ label: "Manage" });
  } else if (action === "bookings") {
    crumbs.push({
      label: propertyLabel,
      href: `/properties/${propertyId}/manage`,
    });
    crumbs.push({ label: "Bookings" });
  } else if (action === "roomtemplate" && roomTemplateId) {
    crumbs.push({
      label: propertyLabel,
      href: `/properties/${propertyId}/manage`,
    });
    crumbs.push({ label: "Manage", href: `/properties/${propertyId}/manage` });
    crumbs.push({
      label: "Room Templates",
      href: `/properties/${propertyId}/manage`,
    });
    const rtLabel = rtLoading ? (
      <Skeleton className="h-4 w-24" />
    ) : (
      roomTemplate?.title ?? "Room Template"
    );
    crumbs.push({ label: rtLabel });
  }

  // Mobile: parent-only back-link — the last navigable level above the
  // current page (per the standard mobile breadcrumb pattern).
  const parentCrumb = [...crumbs].reverse().find(
    (c): c is Crumb & { href: string } => Boolean(c.href),
  );

  return (
    <>
      {/* Full breadcrumb — sm and up */}
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((crumb, i) => (
            <Fragment key={i}>
              <BreadcrumbItem>
                {crumb.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href} className="whitespace-nowrap">
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="whitespace-nowrap">
                    {crumb.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {i < crumbs.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Parent back-link — mobile */}
      <Breadcrumb className="sm:hidden">
        <BreadcrumbList className="flex-nowrap">
          {parentCrumb && (
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={parentCrumb.href}
                  className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="size-4" />
                  <span className="max-w-[220px] truncate">
                    {parentCrumb.label}
                  </span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
};
