"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewOrgPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, adminEmail: adminEmail.trim() || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/admin/orgs");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">New Organisation</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-sm">
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

        <label htmlFor="admin-email" className="mt-4 block text-sm font-medium">
          Initial admin email (optional)
        </label>
        <input
          id="admin-email"
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="admin@acme.com"
          className="mt-2 h-11 w-full rounded-lg border border-black/[.08] bg-transparent px-3 text-sm outline-none focus:border-foreground dark:border-white/[.08]"
        />
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Sends an admin invite for this organisation — no email is sent yet, so you&apos;ll need to
          share the accept link manually from the organisation page.
        </p>

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
  );
}
