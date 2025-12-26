import { Skeleton } from "@/components/ui/skeleton";


export default function BookingSkeleton()  {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row border rounded-xl overflow-hidden h-auto md:h-[180px]"
          >
            {/* Image Skeleton */}
            <Skeleton className="w-full md:w-[280px] h-[200px] md:h-full" />

            <div className="flex-1 p-4 md:p-6 flex flex-col justify-between space-y-4 md:space-y-0">
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex gap-8">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            {/* Price Skeleton */}
            <div className="p-4 md:w-[200px] border-t md:border-l md:border-t-0 flex md:flex-col justify-between items-center">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

