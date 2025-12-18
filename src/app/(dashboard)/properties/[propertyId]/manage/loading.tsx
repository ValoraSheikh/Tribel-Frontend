import { Skeleton } from "@/components/ui/skeleton";

export default function ManagePropertySkeleton (){
  return(
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="col-span-2 space-y-6">
           <div className="flex items-center gap-4">
             <Skeleton className="h-14 w-14 rounded-full" />
             <div className="space-y-2">
               <Skeleton className="h-6 w-48" />
               <Skeleton className="h-4 w-32" />
             </div>
           </div>
           <Skeleton className="h-40 w-full" />
        </div>
        <div className="col-span-1">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}