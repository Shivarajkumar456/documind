import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { readUploadedFile } from "@/lib/storage";
import { extractTextFromFile } from "@/lib/parsers";
import { splitTextIntoChunks } from "@/lib/chunker";
import { generateEmbeddings } from "@/lib/embeddings";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let documentId: string | undefined;

  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization" }, { status: 403 });
    }

    ({ documentId } = await req.json());
    if (!documentId) {
      return NextResponse.json({ error: "documentId required" }, { status: 400 });
    }

    const document = await db.document.findFirst({
      where: { id: documentId, organizationId: user.organizationId },
    });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const buffer = await readUploadedFile(documentId);
    const pages = await extractTextFromFile(buffer, document.mimeType);

    const chunkRecords: { content: string; chunkIndex: number; pageNumber: number | null }[] = [];
    let chunkIndex = 0;
    for (const page of pages) {
      for (const content of splitTextIntoChunks(page.text)) {
        chunkRecords.push({ content, chunkIndex: chunkIndex++, pageNumber: page.pageNumber });
      }
    }
    if (chunkRecords.length === 0) {
      throw new Error("No extractable text found in document");
    }

    const embeddings = await generateEmbeddings(chunkRecords.map((c) => c.content));

    for (let i = 0; i < chunkRecords.length; i++) {
      const { content, chunkIndex: idx, pageNumber } = chunkRecords[i];
      await db.$executeRaw`
        INSERT INTO "Chunk" (id, "documentId", content, "chunkIndex", "pageNumber", embedding, "createdAt")
        VALUES (
          ${randomUUID()},
          ${documentId},
          ${content},
          ${idx},
          ${pageNumber},
          ${JSON.stringify(embeddings[i])}::vector,
          now()
        )
      `;
    }

    await db.document.update({ where: { id: documentId }, data: { status: "READY" } });

    // Rough ~4-chars-per-token estimate — embedContent() returns no usage
    // metadata at all, so this is an approximation, not a measured value.
    const approxTokens = chunkRecords.reduce((sum, c) => sum + Math.ceil(c.content.length / 4), 0);
    await db.usageLog.create({
      data: { organizationId: user.organizationId, type: "EMBEDDING", tokensUsed: approxTokens },
    });

    return NextResponse.json({ success: true, chunkCount: chunkRecords.length });
  } catch (error) {
    console.error("[ingest]", error);
    if (documentId) {
      await db.document.update({ where: { id: documentId }, data: { status: "FAILED" } }).catch(() => {});
    }
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
  }
}
