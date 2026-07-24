"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CreateOrgPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-black">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
              <path d="M15 3v5h5" />
            </svg>
          </span>
          <span className="text-lg">DocuMind</span>
        </div>

        <div className="rounded-2xl border border-black/[.08] p-8 dark:border-white/[.08]">
          <h1 className="text-xl font-medium">Create your organisation</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            You&apos;ll be the admin. You can invite teammates later.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <label htmlFor="org-name" className="text-sm font-medium">
              Organisation name
            </label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc."
              required
              className="mt-2 h-11 w-full rounded-lg border border-black/[.08] bg-transparent px-3 text-sm outline-none focus:border-foreground dark:border-white/[.08]"
            />

            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
            >
              {loading ? "Creating…" : "Create organisation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
