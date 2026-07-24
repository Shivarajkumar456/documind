import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");
  const isCreatingOrg = pathname.startsWith("/create-org") || pathname.startsWith("/api/org");

  const { data: session } = await auth.getSession();

  if (!session?.user) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!isCreatingOrg) {
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
    "/api/documents/:path*",
    "/api/ingest/:path*",
    "/api/chat/:path*",
    "/api/org/:path*",
  ],
};
