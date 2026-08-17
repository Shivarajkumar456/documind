import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.organizationId) return NextResponse.json({ error: "No organization" }, { status: 403 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json();
  if (!email?.trim()) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const existing = await db.orgInvite.findFirst({
    where: {
      email: email.trim(),
      organizationId: user.organizationId,
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
      organizationId: user.organizationId,
      invitedBy: user.id,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
  });

  // TODO: send invite email via Resend once wired up. For now, share the
  // /accept-invite?inviteId=... link with the invitee manually.

  return NextResponse.json({ invite });
}

export async function DELETE(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.organizationId) return NextResponse.json({ error: "No organization" }, { status: 403 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { inviteId } = await req.json();
  const invite = await db.orgInvite.findFirst({
    where: { id: inviteId, organizationId: user.organizationId },
  });
  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

  await db.orgInvite.delete({ where: { id: inviteId } });
  return NextResponse.json({ success: true });
}
