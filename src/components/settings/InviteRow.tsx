"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Invite {
  id: string;
  email: string;
  createdAt: Date | string;
  expiresAt: Date | string;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function InviteRow({ invite }: { invite: Invite }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRevoke() {
    setLoading(true);
    try {
      const res = await fetch("/api/org/invites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId: invite.id }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      setLoading(false);
      alert("Failed to revoke invite.");
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-black/[.08] p-3 dark:border-white/[.08]">
      <div>
        <p className="text-sm font-medium">{invite.email}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          sent {formatDate(invite.createdAt)} · expires {formatDate(invite.expiresAt)}
        </p>
      </div>
      <button
        type="button"
        onClick={handleRevoke}
        disabled={loading}
        className="text-xs font-medium text-zinc-500 transition-colors hover:text-red-600 disabled:opacity-60 dark:text-zinc-400 dark:hover:text-red-400"
      >
        Revoke
      </button>
    </div>
  );
}
