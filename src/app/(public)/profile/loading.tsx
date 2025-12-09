
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


export default function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Top identity card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Skeleton className="h-20 w-20 rounded-full" />

          {/* Name + role */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded" />
            {/* role badge shape */}
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Edit button */}
          <div className="ml-auto">
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </Card>

      {/* Details card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {/* Email */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-56" />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-40" />
          </div>

          {/* Created At */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>

          {/* Last Updated */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
