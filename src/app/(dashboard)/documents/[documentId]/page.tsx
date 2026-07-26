import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { ChatInterface } from "@/components/chat/ChatInterface";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_STYLES: Record<string, string> = {
  PROCESSING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  READY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const { data: session } = await auth.getSession();
  const user = await db.user.findUnique({ where: { id: session!.user.id } });

  const document = await db.document.findUnique({
    where: { id: documentId },
    include: { _count: { select: { chunks: true } } },
  });
  if (!document || document.organizationId !== user!.organizationId) {
    notFound();
  }

  return (
    <div className="flex h-full">
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-black/[.08] p-6 dark:border-white/[.08]">
        <Link href="/documents" className="text-xs font-medium text-zinc-500 hover:text-foreground dark:text-zinc-400">
          ← Back to documents
        </Link>

        <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
            <path d="M15 3v5h5" />
          </svg>
        </div>

        <h1 className="mt-3 break-words text-lg font-medium">{document.title}</h1>

        <span
          className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[document.status]}`}
        >
          {document.status === "PROCESSING" ? "Processing…" : document.status === "READY" ? "Ready" : "Failed"}
        </span>

        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">File name</dt>
            <dd className="mt-0.5 break-words">{document.fileName}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Size</dt>
            <dd className="mt-0.5">{formatFileSize(document.fileSize)}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Chunks</dt>
            <dd className="mt-0.5">{document._count.chunks}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Uploaded</dt>
            <dd className="mt-0.5">
              {new Date(document.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </aside>

      <main className="flex-1 overflow-hidden">
        {document.status === "READY" ? (
          <ChatInterface documentId={document.id} />
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {document.status === "PROCESSING"
              ? "This document is still processing. Chat will be available once it's ready."
              : "This document failed to process, so it can't be chatted with."}
          </div>
        )}
      </main>
    </div>
  );
}
