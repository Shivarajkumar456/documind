import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/[.08] dark:border-white/[.08]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
                  <path d="M15 3v5h5" />
                </svg>
              </span>
              <span>DocuMind</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Turn your team&apos;s documents into a searchable, cited knowledge base.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-2">
            <div>
              <h3 className="font-medium text-foreground">Product</h3>
              <ul className="mt-3 space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>
                  <a href="#features" className="hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-foreground">
                    How it Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Account</h3>
              <ul className="mt-3 space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>
                  <Link href="/sign-in" className="hover:text-foreground">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-black/[.08] pt-6 text-xs text-zinc-500 dark:border-white/[.08] dark:text-zinc-500">
          © {new Date().getFullYear()} DocuMind. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
