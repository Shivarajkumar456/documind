import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { id: session.user.id } });

  if (user?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex h-screen items-center justify-center p-8 text-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Access Denied</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar userEmail={session.user.email ?? ""} />
      <main className="flex-1 overflow-hidden overflow-y-auto">{children}</main>
    </div>
  );
}
