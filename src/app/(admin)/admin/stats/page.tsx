import { db } from "@/lib/db";

const STATS = [
  { key: "orgs", label: "Organisations" },
  { key: "users", label: "Users" },
  { key: "documents", label: "Documents" },
  { key: "chats", label: "Chat Calls (all-time)" },
] as const;

export default async function AdminStatsPage() {
  const [orgCount, userCount, documentCount, chatCount] = await Promise.all([
    db.organization.count(),
    db.user.count(),
    db.document.count(),
    db.usageLog.count({ where: { type: "CHAT" } }),
  ]);

  const values: Record<(typeof STATS)[number]["key"], number> = {
    orgs: orgCount,
    users: userCount,
    documents: documentCount,
    chats: chatCount,
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Platform Stats</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.key} className="rounded-2xl border border-black/[.08] p-5 dark:border-white/[.08]">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{values[stat.key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
