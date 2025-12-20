import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* --- HEADER SECTION SKELETON --- */}
      <div className="mb-6 space-y-4">
        {/* Title */}
        <Skeleton className="h-10 w-3/4 sm:w-1/2 mb-2" />

        {/* Meta Data Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" /> {/* Badge */}
            <Skeleton className="h-5 w-16" /> {/* Rating */}
            <span className="text-muted-foreground">•</span>
            <Skeleton className="h-5 w-48" /> {/* Location */}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>

      {/* --- IMAGE GRID SKELETON --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[450px] rounded-2xl overflow-hidden mb-10">
        {/* Main Image (Takes up 2 cols on desktop) */}
        <div className="md:col-span-2 h-full">
          <Skeleton className="w-full h-full" />
        </div>
        
        {/* Small Images Grid (Takes up 2 cols on desktop) */}
        <div className="hidden md:grid md:grid-cols-2 gap-2 md:col-span-2 h-full">
          <Skeleton className="w-full h-full" />
          <Skeleton className="w-full h-full" />
          <Skeleton className="w-full h-full" />
          <Skeleton className="w-full h-full" />
        </div>
      </div>

      {/* --- MAIN CONTENT GRID SKELETON --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Host Info Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" /> {/* Hosted by... */}
              <Skeleton className="h-4 w-48" /> {/* Managed by... */}
            </div>
            <Skeleton className="h-14 w-14 rounded-full" /> {/* Avatar */}
          </div>

          <Skeleton className="h-[1px] w-full" /> {/* Separator */}

          {/* Highlights (Verified, Location) */}
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <Skeleton className="h-6 w-6 rounded-full" /> {/* Icon */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <Skeleton className="h-6 w-6 rounded-full" /> {/* Icon */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </div>

          <Skeleton className="h-[1px] w-full" /> {/* Separator */}

          {/* Description */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-40 mb-4" /> {/* Heading */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          <Skeleton className="h-[1px] w-full" /> {/* Separator */}

          {/* Amenities */}
          <div>
            <Skeleton className="h-7 w-48 mb-6" /> {/* Heading */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Generate 6 dummy amenity items */}
               {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-32" />
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: STICKY SIDEBAR SKELETON --- */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="rounded-xl border bg-card text-card-foreground shadow-lg h-[500px] p-6 space-y-6">
               {/* Card Header */}
               <div className="space-y-2">
                 <Skeleton className="h-6 w-1/2" />
                 <Skeleton className="h-4 w-3/4" />
               </div>

               {/* Contact Block */}
               <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                 <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                 </div>
               </div>

               {/* Details */}
               <div className="space-y-3 pt-2">
                 <div className="flex justify-between"><Skeleton className="h-3 w-12"/><Skeleton className="h-3 w-16"/></div>
                 <div className="flex justify-between"><Skeleton className="h-3 w-16"/><Skeleton className="h-3 w-12"/></div>
                 <div className="flex justify-between"><Skeleton className="h-3 w-14"/><Skeleton className="h-3 w-20"/></div>
               </div>

               <Skeleton className="h-[1px] w-full" />

               {/* Booking Button */}
               <Skeleton className="h-12 w-full rounded-md" />
               <div className="flex justify-center">
                 <Skeleton className="h-5 w-24 rounded-full" />
               </div>
            </div>

            {/* Report Link */}
            <div className="mt-6 flex justify-center">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* --- LOCATION SECTION SKELETON (Bottom) --- */}
      <Skeleton className="h-[1px] w-full my-10" />
      <div className="space-y-4 mb-10">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="w-full h-[300px] rounded-xl" />
      </div>

    </div>
  );
}