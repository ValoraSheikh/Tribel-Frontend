import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookingProps } from "../../api/booking.api";
import { BOOKING_STATUS_STYLES } from "../../lib/status";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  User,
  CreditCard,
  BedDouble,
  Mail,
  Phone,
  Building,
} from "lucide-react";
import Image from "next/image";
import { toUrl } from "@/utils/image";

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return format(new Date(dateString), "EEE, MMM dd, yyyy");
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const BookingDetailsBody = ({ booking }: { booking: BookingProps }) => {
  const coverImage = toUrl(booking.property?.images?.[0]) || null;

  return (
    <div>
      {coverImage ? (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            height={500}
            width={500}
            src={coverImage}
            unoptimized
            alt={booking.property?.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-lg font-bold line-clamp-1">
              {booking.property?.title}
            </h2>
            <p className="text-xs text-white/90 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {booking.property?.city}, {booking.property?.state}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-primary/10 h-24 flex items-center justify-center rounded-t-lg">
          <Building className="h-10 w-10 text-primary/50" />
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Booking Details</h2>
            <Badge
              className={`shadow-md backdrop-blur-md bg-background/80 text-foreground border-none ${BOOKING_STATUS_STYLES[booking.status].badge}`}
              variant="outline"
            >
              {BOOKING_STATUS_STYLES[booking.status].label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            ID: <span className="font-mono text-xs">{booking.id}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg border p-3 bg-muted/20">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Check-in
            </span>
            <p className="text-sm font-semibold">
              {formatDate(booking.startDate)}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
              Check-out <Calendar className="h-3 w-3" />
            </span>
            <p className="text-sm font-semibold">
              {formatDate(booking.endDate)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Guest Information
            </h3>
            <div className="grid grid-cols-1 gap-3 pl-3 border-l-2 border-muted ml-1">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 border bg-muted">
                  <AvatarImage
                    src={toUrl(booking.guest?.avatar ?? "")}
                    alt={`${booking.guest?.firstName ?? ""} ${booking.guest?.lastName ?? ""}`}
                  />
                  <AvatarFallback className="text-sm font-medium">
                    {booking.guest?.firstName?.[0]}
                    {booking.guest?.lastName?.[0] ?? ""}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {booking.guest?.firstName} {booking.guest?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">Guest</p>
                </div>
              </div>
              <div className="ml-1 flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{booking.guest?.email}</span>
                </div>
                {booking.guest?.phoneNo && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{booking.guest.phoneNo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-primary" /> Accommodation
            </h3>
            <div className="flex items-center justify-between bg-secondary/30 p-3 rounded-md">
              <div>
                <p className="text-sm font-medium">{booking.room?.title}</p>
                <p className="text-xs text-muted-foreground">
                  {booking.property?.address}
                </p>
              </div>
              {booking.bed?.bedNo && (
                <Badge variant="outline" className="bg-background">
                  Bed {booking.bed.bedNo}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Payment
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Amount
                </span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Payment Status
                </span>
                <Badge
                  className={`shadow-md backdrop-blur-md bg-background/80 text-foreground border-none capitalize ${(() => {
                    switch (booking.paymentStatus) {
                      case "PAID":
                        return "bg-emerald-50 text-emerald-700 border-emerald-200";
                      case "PENDING":
                        return "bg-amber-50 text-amber-700 border-amber-200";
                      case "PENDING_APPROVAL":
                        return "bg-blue-50 text-blue-700 border-blue-200";
                      case "FAILED":
                      case "REJECTED":
                        return "bg-rose-50 text-rose-700 border-rose-200";
                      case "PARTIALLY_PAID":
                        return "bg-purple-50 text-purple-700 border-purple-200";
                      case "REFUNDED":
                        return "bg-slate-50 text-slate-700 border-slate-200";
                      default:
                        return "bg-muted text-muted-foreground border-border";
                    }
                  })()}`}
                  variant="outline"
                >
                  {booking.paymentStatus?.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Payment Mode
                </span>
                <Badge
                  className={`shadow-md backdrop-blur-md bg-background/80 text-foreground border-none capitalize ${booking.paymentMode === "ONLINE" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                  variant="outline"
                >
                  {booking.paymentMode}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BookingDetails = ({ booking }: { booking: BookingProps }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="cursor-pointer">View Details</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>Booking {booking.id}</DialogDescription>
        </DialogHeader>
        <BookingDetailsBody booking={booking} />
        <div className="px-6 pb-6 -mt-2">
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              Close
            </Button>
          </DialogTrigger>
        </div>
      </DialogContent>
    </Dialog>
  );
};
