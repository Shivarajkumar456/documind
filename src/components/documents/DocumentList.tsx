import type { DocumentWithChunkCount } from "@/types";
import { DocumentCard } from "./DocumentCard";

export function DocumentList({ documents }: { documents: DocumentWithChunkCount[] }) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/[.12] p-12 text-center dark:border-white/[.14]">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No documents yet. Upload your first document.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} />
      ))}
    </div>
  );
}
