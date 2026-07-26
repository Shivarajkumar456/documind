import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { DocumentList } from "@/components/documents/DocumentList";

export default async function DocumentsPage() {
  const { data: session } = await auth.getSession();
  const user = await db.user.findUnique({ where: { id: session!.user.id } });

  const documents = await db.document.findMany({
    where: { organizationId: user!.organizationId! },
    include: { _count: { select: { chunks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
      <div className="mt-6">
        <DocumentUpload />
      </div>
      <div className="mt-8">
        <DocumentList documents={documents} />
      </div>
    </div>
  );
}
