import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { RemoveMemberButton } from "@/components/admin/RemoveMemberButton";
import { InviteAdminForm } from "@/components/admin/InviteAdminForm";
import { AdminInviteRow } from "@/components/admin/AdminInviteRow";

const STATUS_STYLES: Record<string, string> = {
  PROCESSING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  READY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default async function AdminOrgDetailPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  const org = await db.organization.findUnique({
    where: { id: orgId },
    include: {
      users: { orderBy: { createdAt: "asc" } },
      documents: { include: { _count: { select: { chunks: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!org) notFound();

  const [chatCount, embeddingCount, pendingAdminInvites] = await Promise.all([
    db.usageLog.count({ where: { organizationId: orgId, type: "CHAT" } }),
    db.usageLog.count({ where: { organizationId: orgId, type: "EMBEDDING" } }),
    db.orgInvite.findMany({
      where: { organizationId: orgId, role: "ADMIN", accepted: false },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{org.name}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        <span className={org.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
          {org.isActive ? "Active" : "Inactive"}
        </span>{" "}
        · created {org.createdAt.toLocaleDateString()}
      </p>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Members ({org.users.length})
          </h2>
          <div className="mt-3 space-y-2">
            {org.users.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No members yet.</p>
            )}
            {org.users.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-xl border border-black/[.08] p-3 dark:border-white/[.08]"
              >
                <div>
                  <p className="font-mono text-xs">{member.id.slice(0, 8)}…</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">{member.role}</span>{" "}
                    · joined {member.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <RemoveMemberButton orgId={org.id} userId={member.id} />
              </div>
            ))}
          </div>

          <h2 className="mt-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">Invite an admin</h2>
          <InviteAdminForm orgId={org.id} />
          {pendingAdminInvites.length > 0 && (
            <div className="mt-4 space-y-2">
              {pendingAdminInvites.map((invite) => (
                <AdminInviteRow key={invite.id} orgId={org.id} invite={invite} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Documents ({org.documents.length})
          </h2>
          <div className="mt-3 space-y-2">
            {org.documents.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No documents yet.</p>
            )}
            {org.documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-black/[.08] p-3 dark:border-white/[.08]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{doc.title}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[doc.status]}`}>
                    {doc.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {doc._count.chunks} chunks · {doc.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/[.08] p-5 dark:border-white/[.08]">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Chat calls</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{chatCount}</p>
        </div>
        <div className="rounded-2xl border border-black/[.08] p-5 dark:border-white/[.08]">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Embedding calls</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{embeddingCount}</p>
        </div>
      </div>
    </div>
  );
}
