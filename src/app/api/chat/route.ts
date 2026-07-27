import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { ratelimit } from "@/lib/ratelimit";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.organizationId) return new Response("No organization", { status: 403 });

  const { success } = await ratelimit.limit(user.organizationId);
  if (!success) return new Response("Rate limit exceeded", { status: 429 });

  const { messages, documentId }: { messages: UIMessage[]; documentId: string } = await req.json();

  const document = await db.document.findUnique({ where: { id: documentId } });
  if (!document || document.organizationId !== user.organizationId) {
    return new Response("Document not found", { status: 404 });
  }

  const lastUserMessage = messages.at(-1);
  const userText =
    lastUserMessage?.parts
      ?.filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join("") ?? "";

  // 1. Embed the user question
  const queryEmbedding = await generateEmbedding(userText);

  // 2. Retrieve the 5 most semantically similar chunks
  const chunks = await db.$queryRaw<Array<{ content: string; chunkIndex: number; pageNumber: number | null }>>`
    SELECT content, "chunkIndex", "pageNumber"
    FROM "Chunk"
    WHERE "documentId" = ${documentId}
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT 5
  `;

  // 3. Build context — cite page numbers when available (null for DOCX chunks)
  const context = chunks
    .map((c, i) => `[Source ${i + 1}${c.pageNumber != null ? `, page ${c.pageNumber}` : ""}] ${c.content}`)
    .join("\n\n");

  // 4. Stream via Gemini — answer ONLY from context
  const result = streamText({
    model: google("gemini-3.5-flash"),
    system: `You are a document assistant.
Answer using ONLY the context below. If the answer is not in the context, say exactly:
"I couldn't find that in this document."
Always cite which source sections you used.

Context:
${context}`,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ usage }) => {
      await db.usageLog.create({
        data: {
          organizationId: user.organizationId!,
          type: "CHAT",
          tokensUsed: usage.totalTokens ?? 0,
        },
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
