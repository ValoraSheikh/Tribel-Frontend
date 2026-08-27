"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { buildLoginHref } from "@/lib/auth/return-to";

interface BookingLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnTo: string;
}

export function BookingLoginDialog({
  open,
  onOpenChange,
  returnTo,
}: BookingLoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Log in to request this bunk
          </DialogTitle>
          <DialogDescription>
            Your dates and room choice come next.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button asChild size="lg" className="min-h-11 w-full sm:w-auto">
            <Link href={buildLoginHref(returnTo)}>Log in to continue</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="min-h-11 w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Keep browsing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
