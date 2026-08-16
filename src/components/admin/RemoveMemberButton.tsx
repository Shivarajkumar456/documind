"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemoveMemberButton({ orgId, userId }: { orgId: string; userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!confirm("Remove this member from the organisation?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      setLoading(false);
      alert("Failed to remove member.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={loading}
      className="text-xs font-medium text-zinc-500 transition-colors hover:text-red-600 disabled:opacity-60 dark:text-zinc-400 dark:hover:text-red-400"
    >
      Remove
    </button>
  );
}
