"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

const NAV_LINKS = [
  { href: "/admin/orgs", label: "Organisations" },
  { href: "/admin/stats", label: "Platform Stats" },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-black/[.08] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950/50">
      <div className="flex h-16 items-center gap-2 border-b border-black/[.08] px-5 font-semibold tracking-tight dark:border-white/[.08]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
            <path d="M15 3v5h5" />
          </svg>
        </span>
        <span className="truncate">DocuMind Admin</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-black/[.08] p-3 dark:border-white/[.08]">
        <div className="flex items-center justify-between gap-2 rounded-lg px-3 py-2">
          <span className="truncate text-sm font-medium">{userEmail}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-medium text-zinc-500 transition-colors hover:text-foreground dark:text-zinc-400"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
