"use client";

import { Calendar, Coins, Globe, Mail, Phone, User, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EditTenant } from "./edit-tenant";
import { useTenant } from "../../hooks/use-tenant";
import { toUrl } from "@/utils/image";
import { UpdateProfile } from "./update-profile-avatar";

const getInitials = (first: string = "", last: string = "") => {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
};

export function TenantProfile() {
  const { data: tenant, isLoading, isError } = useTenant();

  if (isLoading) {
    <div className="p-8 text-center animate-pulse min-h-screen">
      Loading Tenant Profile for you...
    </div>;
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        Failed to load tenant profile.
      </div>
    );
  }

  if (!tenant) return null;

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <Card className="overflow-hidden border-none shadow-md py-0">
        {/* Header Image */}
        <div className="h-32 bg-linear-to-r from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800" />

        <CardContent className="relative px-6 pb-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end">
            <UpdateProfile
              tenantName={tenant.name}
              avatarUrl={tenant.profile}
              tenantId={tenant.id}
            />

            {/* Text Info */}
            <div className="flex-1 space-y-1 pt-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {tenant.name}
                </h1>
                <Badge variant="secondary" className="font-mono text-xs">
                  {tenant.slug}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Tenant ID:{" "}
                <span className="font-mono text-xs">{tenant.id}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 md:ml-auto md:pt-0">
              <button
                aria-label="Edit tenant profile"
                className="p-2 hover:rounded hover:bg-muted"
              >
                <EditTenant />
              </button>

              <Badge variant="outline" className="gap-1 px-3 py-1">
                <Calendar className="h-3 w-3" />
                Joined {new Date(tenant.createdAt).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tenant.description ||
                  "No description provided for this tenant."}
              </p>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Timezone
                    </p>
                    <p className="text-sm font-medium">
                      {tenant.timezone || "UTC"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-md border p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Currency
                    </p>
                    <p className="text-sm font-medium">
                      {tenant.currency || "USD"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                System Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Updated: {new Date(tenant.updatedAt).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Primary Contact</CardTitle>
              <CardDescription>Administrative account holder</CardDescription>
            </CardHeader>
            <CardContent>
              {tenant.user ? (
                <div className="flex flex-col items-center space-y-4 text-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={toUrl(tenant.user.avatar) || ""} />
                    <AvatarFallback>
                      {getInitials(tenant.user.firstName, tenant.user.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <h3 className="font-semibold leading-none">
                      {tenant.user.firstName} {tenant.user.lastName}
                    </h3>
                    <Badge variant="secondary" className="mt-2">
                      {tenant.user.role}
                    </Badge>
                  </div>

                  <Separator className="my-4" />

                  <div className="w-full space-y-3 text-left">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{tenant.user.email}</span>
                    </div>
                    {tenant.user.phoneNo && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{tenant.user.phoneNo}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate text-xs text-muted-foreground">
                        {tenant.user.auth0Id}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No user information available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
