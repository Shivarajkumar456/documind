import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Routes where a signed-in user is deliberately expected to NOT have an org yet
  // (or where org membership isn't required at all — SUPER_ADMIN may have no org).
  // "/api/org" and "/api/org/invites/accept" are path-exact, NOT prefix matches:
  // "/api/org/members" and "/api/org/invites" still require organizationId.
  const orgNotRequired =
    pathname.startsWith("/create-org") ||
    pathname === "/api/org" ||
    pathname === "/api/org/invites/accept" ||
    isAdminRoute;

  const { data: session } = await auth.getSession();

  if (!session?.user) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!orgNotRequired) {
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.organizationId) {
      if (isApiRoute) {
        return NextResponse.json({ error: "No organization" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/create-org", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/documents/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/api/documents/:path*",
    "/api/ingest/:path*",
    "/api/chat/:path*",
    "/api/org/:path*",
    "/api/admin/:path*",
  ],
};
