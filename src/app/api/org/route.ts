import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const org = await db.organization.create({ data: { name: name.trim() } });

  await db.user.upsert({
    where: { id: session.user.id },
    create: { id: session.user.id, organizationId: org.id, role: "ADMIN" },
    update: { organizationId: org.id, role: "ADMIN" },
  });

  return NextResponse.json({ orgId: org.id });
}

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });

  return NextResponse.json({ org: user?.organization ?? null });
}
