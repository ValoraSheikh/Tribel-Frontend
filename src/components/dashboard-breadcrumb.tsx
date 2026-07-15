"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const isCorrectRoute = segments[0] === "properties" && segments.length >= 2;

  const propertyId = isCorrectRoute ? segments[1] : "";
  const action = segments[2];
  const roomTemplateId =
    action === "roomtemplate" ? segments[3] : undefined;

  const { data: property, isLoading: propertyLoading } =
    usePropertyDetails(propertyId);

  const { data: roomTemplate, isLoading: rtLoading } =
    useGetRoomTemplateDetails(propertyId, roomTemplateId ?? "", {
      enabled: !!roomTemplateId,
    });

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

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <Fragment key={i}>
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {i < crumbs.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
