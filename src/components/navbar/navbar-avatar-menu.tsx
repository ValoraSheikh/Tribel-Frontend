"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2Icon,
  LogOutIcon,
  UserRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { toUrl } from "@/utils/image";
import type { SessionUser } from "@/lib/auth/auth-utils";

interface NavbarAvatarMenuProps {
  session: SessionUser;
  tenant: { id: string } | null;
}

export function NavbarAvatarMenu({ session, tenant }: NavbarAvatarMenuProps) {
  const name = `${session.firstName} ${session.lastName}`.trim();
  const initials = `${session.firstName?.[0] ?? ""}${session.lastName?.[0] ?? ""}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="rounded-full transition-opacity hover:opacity-85 focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Avatar className="size-9">
            <AvatarImage src={toUrl(session.avatar ?? "")} alt={name} />
            <AvatarFallback className="text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-lg"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={toUrl(session.avatar ?? "")} alt={name} />
              <AvatarFallback className="rounded-lg text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {session.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRoundIcon />
            Profile
          </Link>
        </DropdownMenuItem>
        {!tenant && (
          <DropdownMenuItem asChild>
            <Link href="/createTenant">
              <Building2Icon />
              Become a host
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild variant="destructive">
          <Link href="/logout">
            <LogOutIcon />
            Log out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
