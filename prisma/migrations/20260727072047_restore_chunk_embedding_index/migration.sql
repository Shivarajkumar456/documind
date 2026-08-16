-- Restores the ivfflat vector index dropped as drift by the preceding
-- super_admin_role migration. This index has no Prisma-schema representation
-- (ivfflat isn't an expressible Prisma index type), so every `prisma migrate dev`
-- run will keep seeing it as drift and dropping it — this same recreate step
-- will be needed again after any future schema change until that's addressed.
CREATE INDEX IF NOT EXISTS chunk_embedding_idx ON "Chunk" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);