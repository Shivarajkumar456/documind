import { requireSuperAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

export async function POST(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const result = await requireSuperAdmin();
  if ("error" in result) return result.error;
  const { user: superAdmin } = result;

  const { orgId } = await params;
  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const { email } = await req.json();
  if (!email?.trim()) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const existing = await db.orgInvite.findFirst({
    where: {
      email: email.trim(),
      organizationId: orgId,
      accepted: false,
      expiresAt: { gt: new Date() },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "An active invite already exists for this email" }, { status: 409 });
  }

  const invite = await db.orgInvite.create({
    data: {
      email: email.trim(),
      organizationId: orgId,
      invitedBy: superAdmin.id,
      role: "ADMIN",
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
  });

  // TODO: send invite email via Resend once wired up. For now, share the
  // /accept-invite?inviteId=... link with the invitee manually.

  return NextResponse.json({ invite });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const result = await requireSuperAdmin();
  if ("error" in result) return result.error;

  const { orgId } = await params;
  const { inviteId } = await req.json();
  if (!inviteId) return NextResponse.json({ error: "inviteId required" }, { status: 400 });

  const invite = await db.orgInvite.findFirst({ where: { id: inviteId, organizationId: orgId } });
  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

  await db.orgInvite.delete({ where: { id: inviteId } });
  return NextResponse.json({ success: true });
}
