"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOutIcon, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AvatarImg from "@/features/profile/components/avatar";
import { LoginLink } from "@/components/auth/login-link";
import { buildLoginHref } from "@/lib/auth/return-to";
import type { SessionUser } from "@/lib/auth/auth-utils";
import { toUrl } from "@/utils/image";

interface MobileNavSheetProps {
  session: SessionUser | null;
  tenant: { id: string } | null;
  sessionLoading: boolean;
  logo: { url: string; src: string; alt: string };
}

export function MobileNavSheet({
  session,
  tenant,
  sessionLoading,
  logo,
}: MobileNavSheetProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links = [
    { title: "Search Property", href: "/search" },
    {
      title: "Your Bookings",
      href: session ? "/yourBookings" : buildLoginHref("/yourBookings"),
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open menu">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            <Link
              href={logo.url}
              onClick={close}
              className="flex items-center gap-2"
            >
              <Image
                width={116}
                height={32}
                src={logo.src}
                className="dark:invert"
                alt={logo.alt}
              />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 p-4">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                onClick={close}
                className="rounded-md px-3 py-2.5 text-md font-semibold transition-colors hover:bg-accent"
              >
                {link.title}
              </Link>
            ))}
          </nav>

          <Separator />

          {/* Host */}
          {!tenant && !sessionLoading && (
            <Button asChild variant="outline" className="min-h-11 w-full">
              <Link
                href={
                  session ? "/createTenant" : buildLoginHref("/createTenant")
                }
                onClick={close}
              >
                Become a host
              </Link>
            </Button>
          )}

          {/* Account */}
          {!sessionLoading && (
            <div className="mt-auto flex flex-col gap-3 border-t pt-4">
              {session ? (
              <>
                <div className="flex items-center gap-3">
                  <AvatarImg avatar={toUrl(session.avatar!)} onClick={close} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {session.firstName} {session.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {session.email}
                    </span>
                  </div>
                </div>
                {tenant && (
                  <Button
                    asChild
                    variant="outline"
                    className="min-h-11 w-full"
                  >
                    <Link href="/main" onClick={close}>
                      Go to Dashboard
                    </Link>
                  </Button>
                )}
                <Link
                  href="/logout"
                  onClick={close}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOutIcon className="size-4" />
                  Log out
                </Link>
              </>
            ) : (
              <Button asChild className="min-h-11 w-full">
                <LoginLink onClick={close}>Log in</LoginLink>
              </Button>
            )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
