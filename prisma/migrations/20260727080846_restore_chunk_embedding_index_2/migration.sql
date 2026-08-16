-- Restores the ivfflat vector index dropped as drift by the preceding
-- org-invites migration, for the same reason as the earlier
-- restore_chunk_embedding_index migration: this index has no Prisma-schema
-- representation, so it is re-detected as drift and dropped by every
-- `prisma migrate dev` run that touches anything else in the schema.
CREATE INDEX IF NOT EXISTS chunk_embedding_idx ON "Chunk" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);