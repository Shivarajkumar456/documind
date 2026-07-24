# CLAUDE.md — DocuMind Project Spec

> Single source of truth. Read this entire file before writing any code.
> Follow the stack, patterns, and phase order exactly.

---

## What We Are Building

**DocuMind** — A multi-tenant SaaS where organisations upload documents (PDF, DOCX)
and team members ask questions in natural language, getting answers grounded strictly
in those documents with source citations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Auth | Neon Auth (Managed Better Auth) — `@neondatabase/auth` |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma 6 |
| Vector Search | pgvector (Postgres extension) |
| Rate Limiting | Upstash Redis + @upstash/ratelimit |
| AI / LLM | Google Gemini — `gemini-1.5-flash` (chat) + `text-embedding-004` (768 dims) |
| AI SDK | Vercel AI SDK v4 (`ai`, `@ai-sdk/google`, `@ai-sdk/react`) |
| File Parsing | pdf-parse (PDFs), mammoth (DOCX) |
| Deployment | Vercel |

---

## Current Project State

✅ Already done — do NOT redo these:
- Next.js 15 project initialised (TypeScript, Tailwind, App Router, src dir)
- Core packages installed (prisma, ai, @ai-sdk/google, upstash, zod, pdf-parse, mammoth)
- `src/lib/ratelimit.ts` created
- Home/landing page built and working

🔄 Needs cleanup before continuing:
- Remove `next-auth` and `@auth/prisma-adapter` if installed
- Remove `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from `.env.local`
  (GitHub OAuth is configured in the Neon Console UI, not in code)
- Remove any `<ClerkProvider>` or `<SessionProvider>` wrapper from layout

❌ Not built yet — build in phase order below:
- Neon Auth wiring (server instance, API route, middleware)
- Sign-in / Sign-up pages
- Prisma schema + migration
- pgvector extension + embedding column
- Organisation creation flow
- Document upload + ingestion pipeline
- Chat API with RAG retrieval
- All dashboard UI pages

---

## Package Changes

```bash
# Remove old auth packages if present
npm uninstall next-auth @auth/prisma-adapter @clerk/nextjs

# Add Neon Auth
npm install @neondatabase/auth@latest
```

All other packages (ai, @ai-sdk/google, @google/generative-ai, prisma, upstash, etc.)
should already be installed. Verify with `cat package.json`.

---

## Environment Variables

**`.env.local`** — remove any old Clerk/NextAuth/GitHub keys and use only these:

```env
# Database (Neon Postgres)
DATABASE_URL="postgresql://..."

# Neon Auth — get both values from: Neon Console → Project → Branch → Auth → Configuration
NEON_AUTH_BASE_URL=https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth
NEON_AUTH_COOKIE_SECRET=your-secret-min-32-chars   # generate: openssl rand -base64 32

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Google AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key
```

**About GitHub OAuth:**
GitHub client ID/secret are NOT needed in `.env.local`. If you want GitHub as a
login option, enter those keys inside Neon Console → Auth → OAuth Providers → Add Provider → GitHub.
Neon Auth handles the entire OAuth flow; your Next.js code never sees the keys.

---

## Directory Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx                      # Email/password sign-in form
│   │   ├── sign-up/page.tsx                      # Email/password sign-up form
│   │   └── sign-up/actions.ts                    # Server action for sign-up
│   ├── (dashboard)/
│   │   ├── layout.tsx                            # Sidebar + nav layout (protected)
│   │   ├── dashboard/page.tsx                    # Stats + recent docs
│   │   ├── documents/
│   │   │   ├── page.tsx                          # Documents grid
│   │   │   └── [documentId]/page.tsx             # Single doc + chat
│   │   └── settings/page.tsx                     # Org settings + usage
│   ├── api/
│   │   ├── auth/[...path]/route.ts               # Neon Auth handler (proxy)
│   │   ├── org/route.ts                          # POST create org / GET current org
│   │   ├── documents/
│   │   │   ├── route.ts                          # GET list, POST upload
│   │   │   └── [documentId]/route.ts             # GET, DELETE
│   │   ├── ingest/route.ts                       # POST: extract → chunk → embed → store
│   │   └── chat/route.ts                         # POST: embed → retrieve → stream
│   ├── layout.tsx                                # Root layout (no auth provider wrapper needed)
│   └── page.tsx                                  # ✅ Landing page — already built
├── lib/
│   ├── auth/
│   │   ├── server.ts                             # createNeonAuth() server instance
│   │   └── client.ts                             # createAuthClient() for client components
│   ├── db.ts                                     # Prisma client singleton
│   ├── ratelimit.ts                              # ✅ Already exists
│   ├── gemini.ts                                 # Google AI client singleton
│   ├── embeddings.ts                             # generateEmbedding() — 768 dims
│   ├── chunker.ts                                # splitTextIntoChunks()
│   └── parsers.ts                                # extractTextFromFile() — pdf + docx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopNav.tsx
│   ├── documents/
│   │   ├── DocumentCard.tsx
│   │   ├── DocumentUpload.tsx
│   │   └── DocumentList.tsx
│   └── chat/
│       ├── ChatInterface.tsx
│       ├── ChatMessage.tsx
│       └── ChatInput.tsx
└── types/index.ts
```

---

## Database Schema

**`prisma/schema.prisma`** — clean, no NextAuth boilerplate tables:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User.id maps directly to the Neon Auth user ID (UUID from neon_auth.users).
// We do NOT duplicate name/email here — those live in neon_auth.users.
// This table only holds app-specific data (org membership, role).
model User {
  id             String        @id            // same UUID as neon_auth.users.id
  organizationId String?
  role           Role          @default(MEMBER)
  organization   Organization? @relation(fields: [organizationId], references: [id])
  documents      Document[]    @relation("UploadedBy")
  createdAt      DateTime      @default(now())

  @@index([organizationId])
}

enum Role {
  ADMIN
  MEMBER
}

model Organization {
  id        String     @id @default(cuid())
  name      String
  users     User[]
  documents Document[]
  usageLogs UsageLog[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Document {
  id             String       @id @default(cuid())
  title          String
  fileName       String
  fileSize       Int
  mimeType       String
  status         DocStatus    @default(PROCESSING)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  uploadedBy     String
  uploader       User         @relation("UploadedBy", fields: [uploadedBy], references: [id])
  chunks         Chunk[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([organizationId])
}

enum DocStatus {
  PROCESSING
  READY
  FAILED
}

model Chunk {
  id         String   @id @default(cuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  content    String
  chunkIndex Int
  // embedding column added via raw SQL below — Prisma does not support vector type
  createdAt  DateTime @default(now())

  @@index([documentId])
}

model UsageLog {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  type           UsageType
  tokensUsed     Int          @default(0)
  createdAt      DateTime     @default(now())

  @@index([organizationId, createdAt])
}

enum UsageType {
  EMBEDDING
  CHAT
}
```

### After `npx prisma migrate dev --name init`, run in Neon SQL editor:

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 768 dims — matches Gemini text-embedding-004 output (NOT 1536)
ALTER TABLE "Chunk" ADD COLUMN embedding vector(768);

-- IVFFlat cosine similarity index
CREATE INDEX chunk_embedding_idx
  ON "Chunk" USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

---

## Phase-by-Phase Build Order

---

### Phase 1 — Neon Auth Wiring

**Goal:** Auth is working end to end. Sign up, sign in, session accessible server-side.

**`src/lib/auth/server.ts`:**
```ts
import { createNeonAuth } from '@neondatabase/auth/next/server';

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
```

**`src/lib/auth/client.ts`:**
```ts
'use client';
import { createAuthClient } from '@neondatabase/auth/next';

export const authClient = createAuthClient();
```

**`src/app/api/auth/[...path]/route.ts`:**
```ts
import { auth } from '@/lib/auth/server';
export const { GET, POST } = auth.handler();
```

**`src/middleware.ts`** (or `proxy.ts` for Next.js 16+):
```ts
import { auth } from '@/lib/auth/server';

export default auth.middleware({
  loginUrl: '/sign-in',
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/documents/:path*',
    '/settings/:path*',
    '/api/documents/:path*',
    '/api/ingest/:path*',
    '/api/chat/:path*',
    '/api/org/:path*',
  ],
};
```

**`src/app/layout.tsx`** — no provider wrapper needed:
```tsx
// Just a plain layout — Neon Auth uses cookies, no React context required
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
```

**Test:** Visit `/dashboard` without login → redirects to `/sign-in`. ✅

---

### Phase 2 — Sign-up + Sign-in Pages

**`src/app/(auth)/sign-up/actions.ts`:**
```ts
'use server';
import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export async function signUpAction(
  _prev: { error: string } | null,
  formData: FormData
) {
  const { error } = await auth.signUp.email({
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) return { error: error.message || 'Failed to create account' };
  redirect('/create-org');
}
```

**`src/app/(auth)/sign-up/page.tsx`:**
```tsx
'use client';
import { useActionState } from 'react';
import { signUpAction } from './actions';

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form action={formAction} className="w-full max-w-sm space-y-4 p-8 border rounded-xl">
        <h1 className="text-xl font-medium">Create your account</h1>
        <input name="name" type="text" placeholder="Full name" required className="w-full border rounded px-3 py-2" />
        <input name="email" type="email" placeholder="Email" required className="w-full border rounded px-3 py-2" />
        <input name="password" type="password" placeholder="Password" required className="w-full border rounded px-3 py-2" />
        {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
        <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white rounded py-2">
          {isPending ? 'Creating account...' : 'Sign up'}
        </button>
        <p className="text-sm text-center">Already have an account? <a href="/sign-in" className="text-blue-600">Sign in</a></p>
      </form>
    </div>
  );
}
```

**`src/app/(auth)/sign-in/page.tsx`** — same pattern, use `auth.signIn.email()`, redirect to `/dashboard`.

**Getting session in server components / API routes:**
```ts
const { data: session } = await auth.getSession();
// session.user.id  — the Neon Auth user UUID
// session.user.email
// session.user.name
```

**Test:** Sign up → redirects to `/create-org`. Sign in → redirects to `/dashboard`. ✅

---

### Phase 3 — Organisation Creation

After sign-up, the user has a Neon Auth session but no org yet.
Middleware redirects them to `/create-org` if they have a session but no `organizationId` in DB.

**`src/app/(auth)/create-org/page.tsx`:**
- Simple form: org name input + "Create organisation" button
- On submit → calls `POST /api/org`
- On success → redirects to `/dashboard`

**`src/app/api/org/route.ts`:**
```ts
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  // Create org
  const org = await db.organization.create({ data: { name: name.trim() } });

  // Upsert User record (links Neon Auth user ID to our app's User table)
  await db.user.upsert({
    where: { id: session.user.id },
    create: { id: session.user.id, organizationId: org.id, role: 'ADMIN' },
    update: { organizationId: org.id, role: 'ADMIN' },
  });

  return NextResponse.json({ orgId: org.id });
}

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });

  return NextResponse.json({ org: user?.organization ?? null });
}
```

**Update middleware to check org existence:**
```ts
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export default auth.middleware(async (req) => {
  const session = req.auth;
  if (!session?.user) return; // auth.middleware handles redirect to loginUrl

  // If user has a session but no org yet, redirect to create-org
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/documents');
  const isCreatingOrg = req.nextUrl.pathname.startsWith('/create-org') ||
    req.nextUrl.pathname.startsWith('/api/org');

  if (isDashboard && !isCreatingOrg) {
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.organizationId) {
      return NextResponse.redirect(new URL('/create-org', req.url));
    }
  }
}, { loginUrl: '/sign-in' });
```

**Test:** Fresh sign-up → `/create-org` → fill form → `/dashboard`. Second login → goes directly to `/dashboard`. ✅

---

### Phase 4 — Dashboard Layout Shell

**`src/app/(dashboard)/layout.tsx`:**
```tsx
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/sign-in');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });
  if (!user?.organizationId) redirect('/create-org');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar orgName={user.organization!.name} userName={session.user.name ?? ''} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
```

**Test:** After full login + org creation, sidebar renders. Nav links work. ✅

---

### Phase 5 — Gemini Client + Embeddings

**`src/lib/gemini.ts`:**
```ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const globalForGenAI = globalThis as unknown as { genAI: GoogleGenerativeAI };
export const genAI = globalForGenAI.genAI ?? new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
if (process.env.NODE_ENV !== 'production') globalForGenAI.genAI = genAI;
```

**`src/lib/embeddings.ts`:**
```ts
import { genAI } from './gemini';

const EMBEDDING_MODEL = 'text-embedding-004';

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(text.replace(/\n/g, ' '));
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
        const r = await model.embedContent(text.replace(/\n/g, ' '));
        return r.embedding.values;
      })
    );
    results.push(...embeddings);
  }

  return results;
}
```

**Test:** Quick script — call `generateEmbedding("test")`, log `result.length` → must be **768**. ✅

---

### Phase 6 — File Parsers + Chunker

**`next.config.ts`** — add this or pdf-parse will fail at build time:
```ts
const nextConfig = {
  serverExternalPackages: ['pdf-parse'],
};
export default nextConfig;
```

**`src/lib/parsers.ts`:**
```ts
export async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);
    return result.text;
  }
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}
```

**`src/lib/chunker.ts`:**
```ts
export function splitTextIntoChunks(text: string, chunkSize = 600, overlap = 100): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 50) chunks.push(chunk);
    start += chunkSize - overlap;
  }
  return chunks;
}
```

---

### Phase 7 — Document Upload + Ingestion Pipeline

**`src/lib/db.ts`:**
```ts
import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

**`src/app/api/documents/route.ts`** — POST: register document:
```ts
// 1. auth.getSession() → userId
// 2. Look up user → get organizationId
// 3. Check rate limit: ratelimit.limit(organizationId)
// 4. Parse FormData → get file (Buffer), fileName, mimeType
// 5. Validate: only PDF or DOCX, max 50MB
// 6. Store file buffer in /tmp (dev) or Vercel Blob (prod)
// 7. Create Document record with status: PROCESSING
// 8. Return { documentId }
```

**`src/app/api/ingest/route.ts`** — POST: run ingestion:
```ts
// Body: { documentId: string }
// 1. auth.getSession() → userId → get organizationId
// 2. Fetch Document from DB, verify organizationId matches
// 3. Read file buffer from storage
// 4. extractTextFromFile(buffer, mimeType)
// 5. splitTextIntoChunks(text) → string[]
// 6. generateEmbeddings(chunks) → number[][]
// 7. Insert via $executeRaw — Prisma cannot handle vector type:
//
//    for (const [i, chunk] of chunks.entries()) {
//      await db.$executeRaw`
//        INSERT INTO "Chunk" (id, "documentId", content, "chunkIndex", embedding, "createdAt")
//        VALUES (
//          ${createId()},
//          ${documentId},
//          ${chunk},
//          ${i},
//          ${JSON.stringify(embeddings[i])}::vector,
//          now()
//        )
//      `;
//    }
//
// 8. Update document.status = 'READY'
// 9. Log to UsageLog (type: EMBEDDING)
// 10. Return { success: true, chunkCount }
```

**`src/components/documents/DocumentUpload.tsx`** — upload UI:
- Drag-and-drop zone (accept .pdf, .docx)
- On drop: POST FormData to `/api/documents` → get documentId
- Immediately POST `{ documentId }` to `/api/ingest`
- Show progress states: Uploading → Processing → Ready
- On Ready: trigger document list refresh

**Test:** Upload a real PDF → Neon console SQL: `SELECT id, content FROM "Chunk" LIMIT 3` — rows must exist with non-null `embedding`. ✅

---

### Phase 8 — RAG Chat with Streaming

**`src/app/api/chat/route.ts`:**
```ts
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { ratelimit } from '@/lib/ratelimit';
import { generateEmbedding } from '@/lib/embeddings';

export async function POST(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.organizationId) return new Response('No organisation', { status: 403 });

  const { success } = await ratelimit.limit(user.organizationId);
  if (!success) return new Response('Rate limit exceeded', { status: 429 });

  const { messages, documentId } = await req.json();
  const userMessage = messages.at(-1).content;

  // 1. Embed the user question
  const queryEmbedding = await generateEmbedding(userMessage);

  // 2. Retrieve the 5 most semantically similar chunks
  const chunks = await db.$queryRaw<Array<{ content: string; chunkIndex: number }>>`
    SELECT content, "chunkIndex"
    FROM "Chunk"
    WHERE "documentId" = ${documentId}
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT 5
  `;

  // 3. Build context
  const context = chunks.map((c, i) => `[Source ${i + 1}] ${c.content}`).join('\n\n');

  // 4. Stream via Gemini — answer ONLY from context
  return streamText({
    model: google('gemini-1.5-flash'),
    system: `You are a document assistant.
Answer using ONLY the context below. If the answer is not in the context, say exactly:
"I couldn't find that in this document."
Always cite which source sections you used.

Context:
${context}`,
    messages,
  }).toDataStreamResponse();
}
```

**`src/components/chat/ChatInterface.tsx`:**
```tsx
'use client';
import { useChat } from '@ai-sdk/react';
import { ChatMessage } from './ChatMessage';

export function ChatInterface({ documentId }: { documentId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { documentId },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-8">
            Ask anything about this document.
          </p>
        )}
        {messages.map((m) => <ChatMessage key={m.id} message={m} />)}
        {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Thinking...</p>}
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question about this document..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          Send
        </button>
      </form>
    </div>
  );
}
```

**Test:** Upload PDF, open document, ask a question — streamed answer appears, references actual document content. ✅

---

### Phase 9 — Documents Page + Document Detail

**`src/app/(dashboard)/documents/page.tsx`:**
```ts
// Server component
// 1. auth.getSession() → userId
// 2. db.user.findUnique → organizationId
// 3. db.document.findMany({ where: { organizationId }, include: { _count: { select: { chunks: true } } }, orderBy: { createdAt: 'desc' } })
// 4. Render DocumentCard grid
// 5. Empty state: "No documents yet. Upload your first document."
```

**`src/app/(dashboard)/documents/[documentId]/page.tsx`:**
- Two-column layout: left = document info panel, right = `<ChatInterface documentId={id} />`

---

### Phase 10 — Dashboard Overview

**`src/app/(dashboard)/dashboard/page.tsx`:**
```ts
// Fetch in parallel:
// const [docCount, totalChunks, todayChats] = await Promise.all([
//   db.document.count({ where: { organizationId } }),
//   db.chunk.count({ where: { document: { organizationId } } }),
//   db.usageLog.count({ where: { organizationId, type: 'CHAT', createdAt: { gte: startOfToday } } }),
// ])
// Render stats cards + recent documents list (last 5)
```

---

## Auth Helper — Use This Pattern in Every API Route

```ts
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { ratelimit } from '@/lib/ratelimit';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Org check
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organisation' }, { status: 403 });
    }

    // 3. Rate limit (keyed by org, not user — prevents org-level abuse)
    const { success } = await ratelimit.limit(user.organizationId);
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again shortly.' }, { status: 429 });
    }

    // 4. Your logic here
    const { organizationId } = user;

    return NextResponse.json({ data: 'result' });
  } catch (error) {
    console.error('[route_name]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## TypeScript Types (`src/types/index.ts`)

```ts
export interface DocumentWithChunkCount {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  uploadedBy: string;
  createdAt: Date;
  _count: { chunks: number };
}

export interface ChatChunk {
  content: string;
  chunkIndex: number;
  similarity: number;
}

export interface OrgUser {
  id: string;
  organizationId: string;
  role: 'ADMIN' | 'MEMBER';
  organization: {
    id: string;
    name: string;
  };
}
```

---

## Testing Checklist Per Phase

| Phase | What to test manually |
|---|---|
| 1 | Hit `/dashboard` without session → redirects to `/sign-in` |
| 2 | Sign up with email → session created, redirects to `/create-org` |
| 3 | Create org → `User` row appears in DB with `organizationId` set |
| 4 | After login + org, sidebar renders with org name, all nav links work |
| 5 | Embedding test script → logs array of length **768** |
| 6 | `splitTextIntoChunks("a".repeat(2000))` → returns correct chunk array |
| 7 | Upload PDF → `SELECT * FROM "Chunk" LIMIT 3` in Neon console shows rows |
| 8 | Ask question about uploaded doc → streaming response, cites document |
| 9 | Documents grid loads, delete removes doc + its chunks (cascade) |
| 10 | Dashboard stat counts match actual DB row counts |

---

## Critical Gotchas

1. **Embedding dims are 768.** Gemini `text-embedding-004` = 768 floats. Schema uses `vector(768)`. Any mismatch = Postgres error.
2. **pgvector inserts need raw SQL.** Prisma cannot insert `vector`. Always use `db.$executeRaw` with `::vector` cast.
3. **User table is a thin bridge.** `User.id` = Neon Auth `user.id`. Name/email come from `auth.getSession()`, not from your DB.
4. **Upsert the User on org creation.** First-time sign-up: the `User` row does not exist in your DB yet. `POST /api/org` must `upsert` (not `create`) the User record.
5. **`pdf-parse` needs `serverExternalPackages`.** Without it Next.js tries to bundle a Node binary and breaks.
6. **Middleware DB call.** The middleware now does a DB lookup to check org existence. This adds ~10ms per request. Acceptable for now; cache it with Upstash if latency becomes a concern.
7. **Gemini free tier rate limit.** `text-embedding-004`: 100 requests/minute. Batch in groups of 10 (already handled in `generateEmbeddings`). For large PDFs, add a `await new Promise(r => setTimeout(r, 1000))` between batches if you hit 429s.