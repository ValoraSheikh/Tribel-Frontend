"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  MoreHorizontalIcon,
  Pencil,
  Trash,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { BookingProps } from "../../api/booking.api";
import { useAdminBookings } from "../../hooks/use-booking";
import { BookingDetails } from "./booking-details";
import { CancelAdminBookingModal } from "./cancel-admin-booking";
import { toast } from "sonner";
import { invoiceApi } from "@/features/invoice/api/invoice.api";
import { InvoiceStatusBadge } from "@/features/invoice/components/InvoiceStatusBadge";

const getBookingStatus = (status: string) => {
  switch (status) {
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
};

const getPaymentStatusStyle = (status: string) => {
  switch (status) {
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
};

const getPaymentModeStyle = (mode: string) => {
  switch (mode) {
    case "ONLINE":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "OFFLINE":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const BookingDashboard = ({ propertyId }: { propertyId: string }) => {
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const { data, isLoading, error, isError } = useAdminBookings(propertyId, {
    limit,
    page,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const handleDownloadInvoice = async (bookingId: string) => {
    try {
      const result = await invoiceApi.getAdminInvoice(bookingId);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch {
      // silently fail
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse">
        Loading Bookings for you...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center text-destructive">
        <p className="text-lg font-semibold">Error loading bookings</p>
        <p className="text-sm">{error?.message || "Something went wrong"}</p>
      </div>
    );
  }

  const { bookings, totalPages, totalBookings } = data || {
    bookings: [],
    totalPages: 0,
    totalBookings: 0,
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your property bookings and guest details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={limit.toString()}
            onValueChange={(val) => {
              setLimit(parseInt(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Guest</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Accommodation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Booked On</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking: BookingProps) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>
                            {booking.guest?.firstName} {booking.guest?.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {booking.guest?.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {booking.guest?.phoneNo}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="whitespace-nowrap">
                            In: {formatDate(booking.startDate)}
                          </span>
                          <span className="whitespace-nowrap text-muted-foreground">
                            Out: {formatDate(booking.endDate)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">
                            {booking.room?.title}
                          </span>
                          <div className="flex gap-2">
                            {booking.bed?.bedNo && (
                              <Badge variant="secondary" className="text-xs">
                                Bed {booking.bed.bedNo}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {booking.property?.title}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`shadow-md backdrop-blur-md bg-background/80 text-foreground border-none capitalize ${getBookingStatus(booking.status)}`}
                          variant="outline"
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`shadow-md backdrop-blur-md bg-background/80 text-foreground border-none capitalize ${getPaymentStatusStyle(booking.paymentStatus)}`}
                          variant="outline"
                        >
                          {booking.paymentStatus?.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`shadow-md backdrop-blur-md bg-background/80 text-foreground border-none capitalize ${getPaymentModeStyle(booking.paymentMode)}`}
                          variant="outline"
                        >
                          {booking.paymentMode}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <InvoiceStatusBadge status={booking.invoice?.status} />
                      </TableCell>

                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(booking.totalPrice)}
                        </span>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatDate(booking.createdAt)}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                navigator.clipboard.writeText(booking.id)
                              }
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <div className="flex items-center w-full">
                                <Eye className="mr-2 h-4 w-4" />
                                <BookingDetails booking={booking} />
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDownloadInvoice(booking.id)
                              }
                              disabled={!booking.invoiceId}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download Invoice
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
                              <Trash className="mr-2 h-4 w-4" />
                              <CancelAdminBookingModal
                                propertyId={propertyId}
                                bookingId={booking.id}
                              />
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1} ({totalBookings} entries)
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
