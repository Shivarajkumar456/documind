import { genAI } from "./gemini";
import type { EmbedContentRequest, GenerativeModel } from "@google/generative-ai";

// `text-embedding-004` (CLAUDE.md's spec model) has been retired by Google.
// `gemini-embedding-001` is the current stable replacement, but it defaults to
// 3072-dim output — passing `outputDimensionality: 768` keeps it matching our
// pgvector(768) column. The installed SDK's types predate this parameter, so
// the request object needs an `as` cast to bypass the excess-property check.
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

const MAX_RETRIES = 5;
const DEFAULT_RETRY_DELAY_MS = 10_000;
const MAX_RETRY_DELAY_MS = 60_000;
const BATCH_DELAY_MS = 2_000;

function embedRequest(text: string): EmbedContentRequest {
  return {
    content: { role: "user", parts: [{ text }] },
    outputDimensionality: EMBEDDING_DIMENSIONS,
  } as EmbedContentRequest;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gemini's 429 responses include a RetryInfo detail with the server's own
// suggested wait (e.g. "47s") — prefer that over guessing a backoff.
function retryDelayMsFromError(error: unknown): number | null {
  const details = (error as { errorDetails?: Array<Record<string, unknown>> })?.errorDetails;
  if (!Array.isArray(details)) return null;

  const retryInfo = details.find((d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo");
  const retryDelay = retryInfo?.retryDelay;
  if (typeof retryDelay !== "string") return null;

  const seconds = parseFloat(retryDelay.replace(/s$/, ""));
  return Number.isFinite(seconds) ? seconds * 1000 : null;
}

// Gemini's free tier hits per-minute quotas quickly on larger documents
// (many chunks = many embedContent calls). Retry 429s with the server's
// suggested delay (or a fixed backoff if none given) instead of failing
// the whole ingestion on a single transient rate-limit response.
async function embedWithRetry(model: GenerativeModel, text: string): Promise<number[]> {
  for (let attempt = 0; ; attempt++) {
    try {
      const result = await model.embedContent(embedRequest(text));
      return result.embedding.values;
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status !== 429 || attempt >= MAX_RETRIES) throw err;

      const delay = Math.min(retryDelayMsFromError(err) ?? DEFAULT_RETRY_DELAY_MS, MAX_RETRY_DELAY_MS);
      await sleep(delay);
    }
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  return embedWithRetry(model, text.replace(/\n/g, " "));
}

// Batched version for ingestion — processes 10 at a time to respect rate
// limits, with a short pause between batches and per-call 429 retry/backoff
// (see embedWithRetry) so larger documents don't fail outright on a single
// rate-limit response.
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += 10) {
    const batch = texts.slice(i, i + 10);
    const embeddings = await Promise.all(batch.map((text) => embedWithRetry(model, text.replace(/\n/g, " "))));
    results.push(...embeddings);

    if (i + 10 < texts.length) await sleep(BATCH_DELAY_MS);
  }

  return results;
}
