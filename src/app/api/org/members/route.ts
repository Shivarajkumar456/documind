import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caller = await db.user.findUnique({ where: { id: session.user.id } });
  if (!caller?.organizationId) return NextResponse.json({ error: "No organization" }, { status: 403 });
  if (caller.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const target = await db.user.findFirst({
    where: { id: userId, organizationId: caller.organizationId },
  });
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  if (target.role === "ADMIN" || target.role === "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Cannot remove an admin — contact a platform administrator" },
      { status: 403 }
    );
  }

  await db.user.update({ where: { id: userId }, data: { organizationId: null, role: "MEMBER" } });
  return NextResponse.json({ success: true });
}
