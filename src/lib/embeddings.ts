import { genAI } from "./gemini";
import type { EmbedContentRequest } from "@google/generative-ai";

// `text-embedding-004` (CLAUDE.md's spec model) has been retired by Google.
// `gemini-embedding-001` is the current stable replacement, but it defaults to
// 3072-dim output — passing `outputDimensionality: 768` keeps it matching our
// pgvector(768) column. The installed SDK's types predate this parameter, so
// the request object needs an `as` cast to bypass the excess-property check.
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

function embedRequest(text: string): EmbedContentRequest {
  return {
    content: { role: "user", parts: [{ text }] },
    outputDimensionality: EMBEDDING_DIMENSIONS,
  } as EmbedContentRequest;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(embedRequest(text.replace(/\n/g, " ")));
  return result.embedding.values; // always 768 floats
}

// Batched version for ingestion — processes 10 at a time to respect rate limits
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += 10) {
    const batch = texts.slice(i, i + 10);
    const embeddings = await Promise.all(
      batch.map(async (text) => {
        const r = await model.embedContent(embedRequest(text.replace(/\n/g, " ")));
        return r.embedding.values;
      })
    );
    results.push(...embeddings);
  }

  return results;
}
