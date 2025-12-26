import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function TenantProfileSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      {/* --- Section 1: Tenant Header Skeleton --- */}
      <Card className="overflow-hidden border-none shadow-md py-0">
        {/* Banner */}
        <Skeleton className="h-32 w-full rounded-none" />
        
        <CardContent className="relative px-6 pb-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end">
            {/* Avatar with negative margin */}
            <Skeleton className="-mt-12 h-24 w-24 rounded-full border-4 border-background shadow-sm" />

            <div className="flex-1 space-y-2 pt-2">
              <div className="flex items-center gap-2">
                {/* Name */}
                <Skeleton className="h-8 w-48" />
                {/* Slug Badge */}
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              {/* Tenant ID */}
              <div className="flex items-center gap-1">
                 <Skeleton className="h-4 w-16" />
                 <Skeleton className="h-4 w-32" />
              </div>
            </div>

            <div className="flex gap-2 pt-4 md:pt-0">
              {/* Joined Date Badge */}
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* --- Section 2: Main Details Skeleton (Left Col) --- */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description lines */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
              </div>

              <Separator />

              {/* Grid: Timezone & Currency */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Box 1 */}
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>

                {/* Box 2 */}
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                <Skeleton className="h-4 w-48" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Section 3: User/Owner Details Skeleton (Right Col) --- */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                {/* User Avatar */}
                <Skeleton className="h-20 w-20 rounded-full" />
                
                <div className="flex flex-col items-center space-y-2">
                  {/* User Name */}
                  <Skeleton className="h-5 w-40" />
                  {/* Role Badge */}
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>

                <Separator className="my-4" />

                <div className="w-full space-y-3">
                  {/* Email */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  {/* Phone */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-[80%]" />
                  </div>
                  {/* Auth ID */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-[60%]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}