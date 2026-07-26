-- Reconciles migration history with an index that was already applied
-- out-of-band via `prisma db execute` in an earlier phase (not tracked
-- in any migration file until now). Marked as already-applied via
-- `prisma migrate resolve --applied`, not actually executed.
CREATE INDEX IF NOT EXISTS chunk_embedding_idx ON "Chunk" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
