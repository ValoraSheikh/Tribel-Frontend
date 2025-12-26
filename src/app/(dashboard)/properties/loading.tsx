import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PropertiesSkeleton() {
  return (
    <div className="container mx-auto space-y-6 p-4 pb-20 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="flex h-full flex-col overflow-hidden border-muted-foreground/20 py-0"
          >
            <Skeleton className="aspect-video w-full rounded-none" />

            <CardHeader className="p-4 pb-2">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>

            <CardContent className="grid grow gap-4 p-4 pt-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>

              <Separator className="my-2" />
              <Skeleton className="h-6 w-32 rounded-md" />
            </CardContent>

            <CardFooter className="flex flex-col gap-3 bg-muted/30 p-4">
              <div className="grid w-full grid-cols-2 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <Separator className="bg-border/50" />
              <div className="flex w-full items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32 rounded-md" />{" "}

              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
        <Skeleton className="h-4 w-24" /> {/* Page X of X */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" /> {/* Prev Button */}
          <Skeleton className="h-9 w-20" /> {/* Next Button */}
        </div>
      </div>
    </div>
  );
}
