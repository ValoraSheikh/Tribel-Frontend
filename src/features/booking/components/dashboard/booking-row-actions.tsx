"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Download, Eye, MoreHorizontalIcon, Trash } from "lucide-react";
import { toast } from "sonner";
import { BookingProps, toDrawerBooking } from "../../api/booking.api";
import { BookingDrawer } from "./booking-drawer";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

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
    <>
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
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setDrawerOpen(true);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDownloadInvoice(booking.id)}
            disabled={!booking.invoiceId}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setCancelOpen(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Cancel booking
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BookingDrawer
        booking={toDrawerBooking(booking)}
        propertyId={propertyId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
      <CancelAdminBookingModal
        propertyId={propertyId}
        bookingId={booking.id}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </>
  );
}
