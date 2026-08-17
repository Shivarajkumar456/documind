import Link from "next/link";
import { db } from "@/lib/db";
import { OrgStatusToggle } from "@/components/admin/OrgStatusToggle";

export default async function AdminOrgsPage() {
  const orgs = await db.organization.findMany({
    include: { _count: { select: { users: true, documents: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Organisations</h1>
        <Link
          href="/admin/orgs/new"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          New Organisation
        </Link>
      </div>

      <div className="mt-6 space-y-2">
        {orgs.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No organisations yet.</p>
        )}
        {orgs.map((org) => (
          <div
            key={org.id}
            className="flex items-center justify-between rounded-2xl border border-black/[.08] p-4 dark:border-white/[.08]"
          >
            <div>
              <p className="font-medium">{org.name}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {org._count.users} members · {org._count.documents} documents ·{" "}
                <span
                  className={
                    org.isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {org.isActive ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/orgs/${org.id}`} className="text-sm font-medium hover:underline">
                View
              </Link>
              <OrgStatusToggle orgId={org.id} isActive={org.isActive} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
