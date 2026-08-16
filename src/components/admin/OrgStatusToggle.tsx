"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrgStatusToggle({ orgId, isActive }: { orgId: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      alert("Failed to update organization status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="text-sm font-medium text-zinc-500 transition-colors hover:text-foreground disabled:opacity-60 dark:text-zinc-400"
    >
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
