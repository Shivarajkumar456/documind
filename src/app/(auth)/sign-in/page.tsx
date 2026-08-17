"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "./actions";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-black">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
              <path d="M15 3v5h5" />
            </svg>
          </span>
          <span className="text-lg">DocuMind</span>
        </Link>

        <div className="rounded-2xl border border-black/[.08] p-8 dark:border-white/[.08]">
          <h1 className="text-xl font-medium">Sign in to DocuMind</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Chat with your team&apos;s documents using AI.
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                className="mt-2 h-11 w-full rounded-lg border border-black/[.08] bg-transparent px-3 text-sm outline-none focus:border-foreground dark:border-white/[.08]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-foreground">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="mt-2 h-11 w-full rounded-lg border border-black/[.08] bg-transparent px-3 text-sm outline-none focus:border-foreground dark:border-white/[.08]"
              />
            </div>

            {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="font-medium text-foreground">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
