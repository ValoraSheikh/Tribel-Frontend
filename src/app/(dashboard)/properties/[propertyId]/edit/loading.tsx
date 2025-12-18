import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditPropertySkeleton() {
  return (

    
    <div className="min-h-screen w-full bg-gray-50/50 p-4 md:p-8 lg:p-12">
      <div className="mx-auto max-w-7xl">
        <Card className="w-full border-muted/60 shadow-md">
          {/* Header */}
          <CardHeader className="space-y-1 border-b bg-gray-50/50 px-6 py-5">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-full max-w-md" />
          </CardHeader>
    
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Title - Full Width */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
    
              {/* Hostel Type */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
    
              {/* GSTIN */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
    
              {/* Empty div for layout balance (hidden lg:block) */}
              <div className="hidden lg:block"></div>
    
              {/* Email */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
    
              {/* Phone */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
    
              {/* City */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
    
              {/* State */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
    
              {/* Country */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
    
              {/* Postal Code */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
    
              {/* Latitude */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
    
              {/* Longitude */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
    
              {/* Images - Full Width */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-64" /> {/* Helper text */}
              </div>
    
              {/* Description - Full Width + Textarea height */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="min-h-[100px] w-full" />
              </div>
    
              {/* Address - Full Width + Textarea height */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="min-h-[100px] w-full" />
              </div>
            </div>
          </CardContent>
    
          {/* Footer */}
          <CardFooter className="border-t bg-gray-50/50 p-6">
            <div className="flex w-full items-center justify-end gap-4">
              <Skeleton className="h-10 w-24" /> {/* Delete Button */}
              <Skeleton className="h-10 w-32" /> {/* Update Button */}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}