import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { deleteUploadedFile } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization" }, { status: 403 });
    }

    const { documentId } = await params;
    const document = await db.document.findFirst({
      where: { id: documentId, organizationId: user.organizationId },
      include: { _count: { select: { chunks: true } } },
    });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("[documents/:id GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization" }, { status: 403 });
    }

    const { documentId } = await params;
    const document = await db.document.findFirst({
      where: { id: documentId, organizationId: user.organizationId },
    });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Chunk.document has onDelete: Cascade, so this removes all chunks too.
    await db.document.delete({ where: { id: documentId } });
    await deleteUploadedFile(documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[documents/:id DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
