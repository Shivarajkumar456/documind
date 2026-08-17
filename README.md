# DocuMind

A multi-tenant SaaS where organizations upload documents (PDF, DOCX) and team
members ask questions in natural language, getting answers grounded strictly
in those documents with source citations.

## Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Auth**: Neon Auth (managed Better Auth)
- **Database**: Neon Postgres + pgvector, via Prisma
- **AI**: Google Gemini (chat + embeddings), Vercel AI SDK
- **Rate limiting**: Upstash Redis

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Environment variables (see `.env.local`): `DATABASE_URL`,
`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEON_AUTH_BASE_URL`,
`NEON_AUTH_COOKIE_SECRET`, `GOOGLE_GENERATIVE_AI_API_KEY`.

## Database

```bash
npx prisma migrate dev     # apply migrations locally
npx prisma generate        # regenerate the client after schema changes
```

`npm run build` runs `prisma migrate deploy` automatically before building,
so deployments apply any pending migrations against the configured database.
