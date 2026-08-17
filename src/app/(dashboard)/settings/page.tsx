import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { InviteForm } from "@/components/settings/InviteForm";
import { MemberRow } from "@/components/settings/MemberRow";
import { InviteRow } from "@/components/settings/InviteRow";

export default async function SettingsPage() {
  const { data: session } = await auth.getSession();
  const user = await db.user.findUnique({
    where: { id: session!.user.id },
    include: { organization: true },
  });
  const organizationId = user!.organizationId!;
  const isAdmin = user!.role === "ADMIN";

  const [members, invites, chatCount, embeddingCount] = await Promise.all([
    db.user.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    isAdmin
      ? db.orgInvite.findMany({ where: { organizationId, accepted: false }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
    db.usageLog.count({ where: { organizationId, type: "CHAT" } }),
    db.usageLog.count({ where: { organizationId, type: "EMBEDDING" } }),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="mt-6">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Organisation</h2>
        <p className="mt-2 text-lg font-medium">{user!.organization!.name}</p>
      </section>

      {!isAdmin && (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Your role</h2>
          <span className="mt-2 inline-block rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium dark:bg-zinc-800">
            {user!.role}
          </span>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Members</h2>
        <div className="mt-3 space-y-2">
          {members.map((m) => (
            <MemberRow key={m.id} member={m} canRemove={isAdmin && m.role === "MEMBER"} />
          ))}
        </div>
      </section>

      {isAdmin && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Invite a teammate</h2>
          <InviteForm />
          {invites.length > 0 && (
            <div className="mt-4 space-y-2">
              {invites.map((invite) => (
                <InviteRow key={invite.id} invite={invite} />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/[.08] p-5 dark:border-white/[.08]">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Chat calls</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{chatCount}</p>
        </div>
        <div className="rounded-2xl border border-black/[.08] p-5 dark:border-white/[.08]">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Embedding calls</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{embeddingCount}</p>
        </div>
      </section>
    </div>
  );
}
