import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RoomTemplateDetailSkeleton() {
  return (
    <div className="flex flex-col space-y-6 p-6 animate-in fade-in duration-500">
      {/* Header Section Skeleton */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image Skeleton */}
        <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>

        {/* Text Content Skeleton */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-10 w-3/4" /> {/* Title */}
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full" /> {/* Description Line 1 */}
              <Skeleton className="h-4 w-[90%]" /> {/* Description Line 2 */}
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-3 border rounded-lg bg-card flex flex-col items-center gap-2"
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Amenities Section Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-md" />
          ))}
        </CardContent>
      </Card>

      {/* Table Section Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" /> {/* Table Title */}
        <div className="border rounded-md">
          <div className="p-4 border-b">
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
