"use client";

import { 
  Calendar, 
  Coins, 
  Globe, 
  Mail, 
  Phone, 
  User, 
  Clock,
  Check,
  ShieldCheck,
  Building2,
  Loader2
} from "lucide-react";

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
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Building2 className="h-10 w-10 text-destructive/50" />
        <p className="text-base font-medium">Failed to load organization profile.</p>
      </div>
    );
  }

  if (!tenant) return null;

  return (
    <div className="w-full bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 md:py-16">
        
        {/* Main Layout: Stacks on mobile, Side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* LEFT COLUMN: Primary Contact (The "Host" Card) */}
          <aside className="w-full lg:w-[340px] shrink-0 order-2 lg:order-1">
            <div className="sticky top-10 rounded-3xl border border-border/40 bg-card p-6 sm:p-8 shadow-xl shadow-black/5">
              
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 mb-4 border-4 border-background shadow-sm">
                  <AvatarImage 
                    src={tenant.user ? (toUrl(tenant.user.avatar) || "") : ""} 
                    alt="Contact Avatar" 
                  />
                  <AvatarFallback className="text-3xl font-medium bg-primary/5 text-primary">
                    {tenant.user ? getInitials(tenant.user.firstName, tenant.user.lastName) : "N/A"}
                  </AvatarFallback>
                </Avatar>
                
                {tenant.user ? (
                  <>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                      {tenant.user.firstName} {tenant.user.lastName}
                    </h2>
                    <Badge variant="secondary" className="mt-3 px-3 py-1 text-xs font-medium bg-secondary/60">
                      {tenant.user.role}
                    </Badge>
                  </>
                ) : (
                  <h2 className="text-xl font-medium text-muted-foreground">No Contact Assigned</h2>
                )}
              </div>

              {tenant.user && (
                <>
                  <Separator className="my-8 bg-border/50" />
                  
                  <div className="space-y-5">
                    <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                      Confirmed Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-foreground/80">
                        <Mail className="h-5 w-5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                        <span className="truncate font-medium">{tenant.user.email}</span>
                        <Check className="h-4 w-4 ml-auto text-green-600 shrink-0" />
                      </div>
                      
                      {tenant.user.phoneNo && (
                        <div className="flex items-center gap-4 text-foreground/80">
                          <Phone className="h-5 w-5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                          <span className="font-medium">{tenant.user.phoneNo}</span>
                          <Check className="h-4 w-4 ml-auto text-green-600 shrink-0" />
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-foreground/80">
                        <User className="h-5 w-5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                        <div className="flex flex-col truncate">
                          <span className="text-xs text-muted-foreground">System ID</span>
                          <span className="truncate font-mono text-sm">{tenant.user.auth0Id}</span>
                        </div>
                        <ShieldCheck className="h-4 w-4 ml-auto text-green-600 shrink-0" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* RIGHT COLUMN: Organization Details */}
          <main className="flex-1 order-1 lg:order-2 space-y-10">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                  {tenant.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 bg-muted/30">
                    {tenant.slug}
                  </Badge>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" strokeWidth={1.5} />
                    <span>Joined {new Date(tenant.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span>•</span>
                  <span className="font-mono text-xs bg-accent/50 px-2 py-0.5 rounded-md">
                    ID: {tenant.id}
                  </span>
                </div>
              </div>

              {/* Actions & Avatar Box */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border border-border bg-muted shadow-sm flex items-center justify-center">
                  <UpdateProfile
                    tenantName={tenant.name}
                    avatarUrl={tenant.profile}
                    tenantId={tenant.id}
                  />
                </div>
                <button
                  aria-label="Edit tenant profile"
                  className="rounded-full border border-border bg-card p-3 hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
                >
                  <EditTenant />
                </button>
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* About Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                About the Organization
              </h2>
              <p className="text-lg leading-relaxed font-light text-foreground/80 max-w-3xl">
                {tenant.description || "No description has been provided for this organization yet."}
              </p>
            </section>

            <Separator className="bg-border/60" />

            {/* Quick Facts Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Settings & Preferences
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
                
                <div className="flex gap-4 items-start">
                  <Globe className="h-7 w-7 text-muted-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg text-foreground">Timezone</h3>
                    <p className="text-muted-foreground">{tenant.timezone || "Coordinated Universal Time (UTC)"}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <Coins className="h-7 w-7 text-muted-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg text-foreground">Currency</h3>
                    <p className="text-muted-foreground">{tenant.currency || "USD"}</p>
                  </div>
                </div>

              </div>
            </section>

            <Separator className="bg-border/60" />

            {/* Metadata Section */}
            <section className="pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/40 text-sm text-muted-foreground border border-border/40">
                <Clock className="h-4 w-4" />
                <span>Profile last updated on {new Date(tenant.updatedAt).toLocaleString()}</span>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}