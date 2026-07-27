import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { DocumentList } from "@/components/documents/DocumentList";

const STATS = [
  { key: "documents", label: "Documents" },
  { key: "chunks", label: "Total Chunks" },
  { key: "chatsToday", label: "Chats Today" },
] as const;

export default async function DashboardPage() {
  const { data: session } = await auth.getSession();
  const user = await db.user.findUnique({ where: { id: session!.user.id } });
  const organizationId = user!.organizationId!;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [documentCount, totalChunks, chatsToday, recentDocuments] = await Promise.all([
    db.document.count({ where: { organizationId } }),
    db.chunk.count({ where: { document: { organizationId } } }),
    db.usageLog.count({ where: { organizationId, type: "CHAT", createdAt: { gte: startOfToday } } }),
    db.document.findMany({
      where: { organizationId },
      include: { _count: { select: { chunks: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const values: Record<(typeof STATS)[number]["key"], number> = {
    documents: documentCount,
    chunks: totalChunks,
    chatsToday,
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div
            key={stat.key}
            className="rounded-2xl border border-black/[.08] p-5 dark:border-white/[.08]"
          >
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{values[stat.key]}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Recent documents</h2>
        <div className="mt-3">
          <DocumentList documents={recentDocuments} />
        </div>
      </div>
    </div>
  );
}
