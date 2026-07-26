-- AlterTable
ALTER TABLE "Chunk" ADD COLUMN     "pageNumber" INTEGER;

-- Fix embedding column dimension: it was created as vector(1536) in the very
-- first migration (OpenAI/1536-dim era) and never actually altered since —
-- Prisma treats Unsupported() column types as opaque and never regenerates
-- ALTER statements when the string literal inside Unsupported("...") changes
-- across schema edits. schema.prisma has said vector(768) (matching Gemini's
-- configured 768-dim output) since an earlier phase, but the live column
-- never followed. Table is empty (nothing has been ingested yet), so this is
-- a safe in-place type change, not a destructive one.
ALTER TABLE "Chunk" ALTER COLUMN "embedding" TYPE vector(768);
