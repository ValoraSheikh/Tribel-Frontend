import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildLoginHref } from "@/lib/auth/return-to";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const cookie = request.headers.get("cookie");
  if (!cookie) {
    const loginUrl = new URL(buildLoginHref(`${pathname}${search}`), request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { cookie },
      cache: "no-store",
    });
    const body = (await res.json()) as {
      isAuthenticated?: boolean;
      user?: unknown;
    };

    if (body.isAuthenticated && body.user) {
      return NextResponse.next();
    }
  } catch {
    // Fall through to redirect below if validation fails
  }

  const loginUrl = new URL(buildLoginHref(`${pathname}${search}`), request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/profile",
    "/yourBookings",
    "/createTenant",
    "/bookings/new",
    "/main",
    "/tenant",
    "/createProperty",
    "/properties/:path*",
    "/private",
  ],
};
