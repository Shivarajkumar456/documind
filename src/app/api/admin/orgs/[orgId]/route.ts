import { requireSuperAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const result = await requireSuperAdmin();
  if ("error" in result) return result.error;

  const { orgId } = await params;
  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const updated = await db.organization.update({
    where: { id: orgId },
    data: { isActive: !org.isActive },
  });
  return NextResponse.json({ isActive: updated.isActive });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const result = await requireSuperAdmin();
  if ("error" in result) return result.error;

  const { orgId } = await params;
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const target = await db.user.findFirst({ where: { id: userId, organizationId: orgId } });
  if (!target) return NextResponse.json({ error: "Member not found in this organization" }, { status: 404 });

  await db.user.update({ where: { id: userId }, data: { organizationId: null, role: "MEMBER" } });
  return NextResponse.json({ success: true });
}
