import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteId } = await req.json();
  if (!inviteId) return NextResponse.json({ error: "inviteId required" }, { status: 400 });

  const invite = await db.orgInvite.findFirst({
    where: { id: inviteId, accepted: false, expiresAt: { gt: new Date() } },
  });
  if (!invite) return NextResponse.json({ error: "Invite not found or expired" }, { status: 404 });

  if (invite.email.toLowerCase() !== session.user.email?.toLowerCase()) {
    return NextResponse.json(
      { error: "This invite was sent to a different email address" },
      { status: 403 }
    );
  }

  const existingUser = await db.user.findUnique({ where: { id: session.user.id } });
  if (existingUser?.organizationId) {
    return NextResponse.json(
      { error: "You are already a member of an organisation. Leave it before accepting a new invite." },
      { status: 409 }
    );
  }

  // Invites can only grant ADMIN or MEMBER — SUPER_ADMIN is a platform-level
  // role assigned outside the invite system, never through acceptance here.
  const grantedRole = invite.role === "ADMIN" ? "ADMIN" : "MEMBER";

  await db.$transaction([
    db.user.upsert({
      where: { id: session.user.id },
      create: { id: session.user.id, organizationId: invite.organizationId, role: grantedRole },
      update: { organizationId: invite.organizationId, role: grantedRole },
    }),
    db.orgInvite.update({ where: { id: invite.id }, data: { accepted: true } }),
  ]);

  return NextResponse.json({ success: true, organizationId: invite.organizationId });
}
