"use client";

import {
  BedIcon,
  Building,
  CalendarDaysIcon,
  ChevronLeft,
  ChevronRight,
  CopyIcon,
  EyeIcon,
  HistoryIcon,
  MapPin,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { parseAsInteger, useQueryState } from "nuqs";

import { useUserBookings } from "../../hooks/use-booking";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingProps } from "../../api/booking.api";
import { BookingDetails } from "../dashboard/booking-details";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CancelBookingModal } from "./cancel-booking";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

export const Bookings = () => {
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(4),
  );

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const { data, isLoading, error, isError } = useUserBookings({ limit, page });

  if (isLoading) {
    return <BookingsLoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center p-6">
        <div className="p-4 bg-red-100 text-red-600 rounded-full">
          <HistoryIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">{error.message}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const bookingsList = data?.bookings || [];
  const totalPages = data?.totalPages || 0;
  const totalBookings = data?.totalBookings || 0;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-5xl space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Booking History
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Total bookings:{" "}
            <span className="font-medium text-foreground">{totalBookings}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Show:
          </span>
          <Select
            value={limit.toString()}
            onValueChange={(val) => {
              setLimit(parseInt(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[70px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {bookingsList.length === 0 && (
        <div className="text-center py-20 bg-muted/5 rounded-xl border border-dashed">
          <p className="text-muted-foreground">
            No bookings found in your history.
          </p>
        </div>
      )}

      {/* Cards List */}
      <div className="flex flex-col gap-4 md:gap-6">
        {bookingsList.map((booking: BookingProps) => {
          return <BookingCard key={booking.id} booking={booking} />;
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="h-9"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>

          <div className="text-xs font-semibold px-3 py-1 bg-muted rounded-full">
            {page} / {totalPages}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="h-9"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

const BookingCard = ({ booking }: { booking: BookingProps }) => {
  const status = booking.status;

  const statusKey = (status || "").toLowerCase();
  const statusClasses = (() => {
    switch (statusKey) {
      case "upcoming":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
      case "canceled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "ongoing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  })();

  return (
    <Card
      key={booking.id}
      className="overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-sm py-0"
    >
      <div className="flex flex-col md:flex-row h-full">
        <div className="relative w-full md:w-64 lg:w-72 shrink-0 aspect-video md:aspect-auto">
          {booking.property.images?.length > 0 ? (
            <Image
              src={booking.property.images[0]}
              alt={booking.property.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-muted">
              <Building className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge
              className={`shadow-md backdrop-blur-md bg-background/80 text-foreground border-none capitalize ${statusClasses}`}
              variant="outline"
            >
              {status}
            </Badge>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-lg md:text-xl leading-tight line-clamp-1">
              {booking.property.title}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
              <span className="line-clamp-1">
                {booking.property.city}, {booking.property.state}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Room
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <BedIcon className="w-4 h-4 text-primary shrink-0" />
                <span className="line-clamp-1">{booking.room.title}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Stay Dates
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarDaysIcon className="w-4 h-4 text-primary shrink-0" />
                <span className="whitespace-nowrap">
                  {new Date(booking.startDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(booking.endDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-muted/20 border-t md:border-t-0 md:border-l flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:w-48 shrink-0">
          <div className="text-left md:text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold md:mb-1">
              Paid Amount
            </p>
            <p className="text-lg md:text-xl font-bold text-primary">
              {formatPrice(booking.totalPrice)}
            </p>
          </div>

          <div className="flex items-center justify-end w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="inline-flex items-center justify-center h-8 w-8 p-0"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={6}
                className="w-44"
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(booking.id)}
                  className="flex items-center"
                >
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="flex items-center"
                >
                  <EyeIcon className="mr-2 h-4 w-4" />
                  <BookingDetails booking={booking} />
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center">
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit Booking
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <div
                  role="button"
                  tabIndex={0}
                  className="
                         flex items-center w-full rounded-sm px-2 py-1.5
                         text-sm text-destructive cursor-pointer
                         hover:bg-destructive/10
                         focus:bg-destructive/10 focus:outline-none
                       "
                >
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  <CancelBookingModal bookingId={booking.id} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
};

const BookingsLoadingSkeleton = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row border rounded-xl overflow-hidden h-auto md:h-44"
          >
            <Skeleton className="w-full md:w-64 h-40 md:h-full" />
            <div className="flex-1 p-5 space-y-4">
              <Skeleton className="h-6 w-2/3" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="p-5 md:w-44 border-t md:border-l flex md:flex-col justify-between items-center md:items-end gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
