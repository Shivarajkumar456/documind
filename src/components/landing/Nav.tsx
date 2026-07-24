"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/[.08] bg-white/80 backdrop-blur dark:border-white/[.08] dark:bg-black/80">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
              <path d="M15 3v5h5" />
              <path d="M8.5 13.5h7M8.5 17h4.5" />
            </svg>
          </span>
          <span className="text-lg">DocuMind</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium sm:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
          >
            Sign in
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[.08] sm:hidden dark:border-white/[.145]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-black/[.08] px-6 py-4 sm:hidden dark:border-white/[.08]">
          <div className="flex flex-col gap-4 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-zinc-600 dark:text-zinc-400"
              >
                {link.label}
              </a>
            ))}
            <Link href="/sign-in" onClick={() => setOpen(false)} className="text-zinc-600 dark:text-zinc-400">
              Sign in
            </Link>
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="rounded-full bg-foreground px-4 py-2 text-center text-background"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
