"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy,
  Download,
  Eye,
  MoreHorizontalIcon,
  Pencil,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { BookingProps } from "../../api/booking.api";
import { BookingDetails } from "./booking-details";
import { CancelAdminBookingModal } from "./cancel-admin-booking";
import { invoiceApi } from "@/features/invoice/api/invoice.api";

interface BookingRowActionsProps {
  booking: BookingProps;
  propertyId: string;
}

export function BookingRowActions({
  booking,
  propertyId,
}: BookingRowActionsProps) {
  const handleDownloadInvoice = async (bookingId: string) => {
    try {
      const result = await invoiceApi.getAdminInvoice(bookingId);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch {
      toast.error("Failed to download invoice");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for booking ${booking.guest?.firstName ?? ""}`}
          className="size-8 max-sm:size-11"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(booking.id)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
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
          onClick={() => handleDownloadInvoice(booking.id)}
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
  );
}
