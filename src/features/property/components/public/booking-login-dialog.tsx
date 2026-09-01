"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildLoginHref } from "@/lib/auth/return-to";

interface BookingLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnTo: string;
  propertyName?: string;
}

export function BookingLoginDialog({
  open,
  onOpenChange,
  returnTo,
  propertyName,
}: BookingLoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-2xl px-8 pt-12 pb-8 sm:max-w-[400px]">
        <DialogHeader className="items-center sm:text-center">
          <Image
            src="/logo.svg"
            alt="Tribel"
            width={36}
            height={36}
            unoptimized
            className="size-9"
          />
          <DialogTitle className="mt-4 text-xl font-bold tracking-tight">
            Log in or sign up
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {propertyName
              ? `Continue to request your stay at ${propertyName}.`
              : "Continue to request your stay."}
          </DialogDescription>
        </DialogHeader>

        <Link
          href={buildLoginHref(returnTo)}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-base font-semibold transition-colors hover:bg-primary/90"
        >
          Log in to continue
        </Link>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="mt-2 flex h-11 w-full items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Keep browsing
        </button>
      </DialogContent>
    </Dialog>
  );
}
