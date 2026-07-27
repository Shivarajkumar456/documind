"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DocumentWithChunkCount } from "@/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const STATUS_STYLES: Record<DocumentWithChunkCount["status"], string> = {
  PROCESSING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  READY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export function DocumentCard({ document }: { document: DocumentWithChunkCount }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${document.title}"? This cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents/${document.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch {
      setIsDeleting(false);
      alert("Failed to delete document. Please try again.");
    }
  }

  return (
    <Link
      href={`/documents/${document.id}`}
      className="group relative flex flex-col gap-3 rounded-2xl border border-black/[.08] p-5 transition-colors hover:border-black/[.16] dark:border-white/[.08] dark:hover:border-white/[.2]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
            <path d="M15 3v5h5" />
          </svg>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[document.status]}`}>
          {document.status === "PROCESSING" ? "Processing…" : document.status === "READY" ? "Ready" : "Failed"}
        </span>
      </div>

      <div>
        <h3 className="truncate font-medium">{document.title}</h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {formatFileSize(document.fileSize)} · {document._count.chunks} chunks · {formatDate(document.createdAt)}
        </p>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete document"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 disabled:opacity-100 group-hover:opacity-100 dark:hover:bg-red-950/40 dark:hover:text-red-400"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
        </svg>
      </button>
    </Link>
  );
}
