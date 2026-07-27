import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { ratelimit } from "@/lib/ratelimit";
import { saveUploadedFile } from "@/lib/storage";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function resolveMimeType(fileName: string): string | null {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return null;
}

export async function POST(req: Request) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization" }, { status: 403 });
    }

    const { success } = await ratelimit.limit(user.organizationId);
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again shortly." }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const fileName = (formData.get("fileName") as string) || file.name;
    // Derived from the extension server-side, not trusted verbatim from the
    // client's mimeType field — browsers report inconsistent MIME types for
    // .docx (e.g. sometimes application/zip).
    const mimeType = resolveMimeType(fileName);
    if (!mimeType) {
      return NextResponse.json({ error: "Only PDF and DOCX files are supported" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds the 50MB limit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const document = await db.document.create({
      data: {
        title: fileName.replace(/\.(pdf|docx)$/i, ""),
        fileName,
        fileSize: file.size,
        mimeType,
        status: "PROCESSING",
        organizationId: user.organizationId,
        uploadedBy: user.id,
      },
    });

    try {
      await saveUploadedFile(document.id, buffer);
    } catch (err) {
      console.error("[documents:store]", err);
      await db.document.update({ where: { id: document.id }, data: { status: "FAILED" } });
      return NextResponse.json({ error: "Failed to store file" }, { status: 500 });
    }

    return NextResponse.json({ documentId: document.id });
  } catch (error) {
    console.error("[documents:POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization" }, { status: 403 });
    }

    const documents = await db.document.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { chunks: true } } },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("[documents:GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
