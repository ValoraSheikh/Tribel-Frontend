import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BookingsSkeleton () {
  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" /> {/* Title */}
          <Skeleton className="h-4 w-[300px]" /> {/* Description */}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-[100px]" /> {/* Rows per page text */}
          <Skeleton className="h-10 w-[70px]" /> {/* Select Trigger */}
        </div>
      </div>

      {/* Table Card Skeleton */}
      <Card className="py-0">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Guest</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Accommodation</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Booked On</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {/* Guest Column */}
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-3 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </TableCell>

                    {/* Dates Column */}
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-[110px]" />
                        <Skeleton className="h-4 w-[110px]" />
                      </div>
                    </TableCell>

                    {/* Accommodation Column */}
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-[130px]" />
                        <Skeleton className="h-5 w-[60px] rounded-full" /> {/* Badge */}
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </TableCell>

                    {/* Price Column */}
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>

                    {/* Booked On Column */}
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer Pagination Skeleton */}
      <div className="flex items-center justify-between px-2">
        <Skeleton className="h-4 w-[200px]" /> {/* Pagination info */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-[100px]" /> {/* Prev Button */}
          <Skeleton className="h-9 w-20" /> {/* Next Button */}
        </div>
      </div>
    </div>
  );
};