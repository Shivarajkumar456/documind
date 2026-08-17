import { requireSuperAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const result = await requireSuperAdmin();
  if ("error" in result) return result.error;
  const { user: superAdmin } = result;

  const { name, adminEmail } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const org = await db.$transaction(async (tx) => {
    const created = await tx.organization.create({ data: { name: name.trim(), isActive: true } });
    if (adminEmail?.trim()) {
      await tx.orgInvite.create({
        data: {
          email: adminEmail.trim(),
          organizationId: created.id,
          invitedBy: superAdmin.id,
          role: "ADMIN",
          expiresAt: new Date(Date.now() + INVITE_TTL_MS),
        },
      });
    }
    return created;
  });

  return NextResponse.json({ orgId: org.id });
}
