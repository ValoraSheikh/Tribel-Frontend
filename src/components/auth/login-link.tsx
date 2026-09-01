"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { buildLoginHref } from "@/lib/auth/return-to";

interface LoginLinkProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function LoginLink({ className, children, onClick }: LoginLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <Link
      href={buildLoginHref(currentPath)}
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
