import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });
  if (!user?.organizationId) {
    // A SUPER_ADMIN is a platform-level role and may have no org of their
    // own — send them to the admin section instead of the org-creation flow.
    redirect(user?.role === "SUPER_ADMIN" ? "/admin/orgs" : "/create-org");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        orgName={user.organization!.name}
        userName={session.user.name ?? ""}
        isSuperAdmin={user.role === "SUPER_ADMIN"}
      />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
