"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  role: string;
  createdAt: Date | string;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function MemberRow({ member, canRemove }: { member: Member; canRemove: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!confirm("Remove this member from the organisation?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/org/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.id }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      setLoading(false);
      alert("Failed to remove member.");
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-black/[.08] p-3 dark:border-white/[.08]">
      <div>
        <p className="font-mono text-xs">{member.id.slice(0, 8)}…</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">{member.role}</span>{" "}
          · joined {formatDate(member.createdAt)}
        </p>
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={loading}
          className="text-xs font-medium text-zinc-500 transition-colors hover:text-red-600 disabled:opacity-60 dark:text-zinc-400 dark:hover:text-red-400"
        >
          Remove
        </button>
      )}
    </div>
  );
}
