"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";

type UploadStatus = "idle" | "uploading" | "processing" | "ready" | "error";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function DocumentUpload() {
  const router = useRouter();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setFileName(null);
    setError(null);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);

      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setStatus("error");
        setError("Only PDF and DOCX files are supported.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setStatus("error");
        setError("File exceeds the 50MB limit.");
        return;
      }

      setStatus("uploading");
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("mimeType", file.type);

        const uploadRes = await fetch("/api/documents", { method: "POST", body: formData });
        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Upload failed");
        }
        const { documentId } = await uploadRes.json();

        setStatus("processing");
        const ingestRes = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId }),
        });
        if (!ingestRes.ok) {
          const data = await ingestRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Processing failed");
        }

        setStatus("ready");
        router.refresh();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    },
    [router]
  );

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  const isBusy = status === "uploading" || status === "processing";

  return (
    <div
      onDrop={isBusy ? undefined : handleDrop}
      onDragOver={isBusy ? undefined : handleDragOver}
      onDragLeave={isBusy ? undefined : handleDragLeave}
      onClick={() => !isBusy && status !== "ready" && inputRef.current?.click()}
      className={`flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
        isBusy ? "cursor-default" : "cursor-pointer"
      } ${
        isDragging
          ? "border-foreground bg-black/[.03] dark:bg-white/[.06]"
          : "border-black/[.12] hover:border-black/[.2] dark:border-white/[.14] dark:hover:border-white/[.24]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {status === "idle" && (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-medium">Drag and drop a PDF or DOCX here</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">or click to browse — up to 50MB</p>
        </>
      )}

      {(status === "uploading" || status === "processing") && (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-foreground dark:border-zinc-700" />
          <p className="text-sm font-medium">
            {status === "uploading" ? "Uploading" : "Processing"}
            {fileName ? ` ${fileName}…` : "…"}
          </p>
        </>
      )}

      {status === "ready" && (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-medium">{fileName} is ready</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            className="text-xs font-medium text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            Upload another document
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            className="text-xs font-medium text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}
