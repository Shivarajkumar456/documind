import { db } from "@/lib/db";
import { AcceptInviteButton } from "@/components/auth/AcceptInviteButton";

const Logo = () => (
  <div className="mb-8 flex items-center justify-center gap-2 font-semibold tracking-tight">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M15 3v5h5" />
      </svg>
    </span>
    <span className="text-lg">DocuMind</span>
  </div>
);

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ inviteId?: string }>;
}) {
  const { inviteId } = await searchParams;

  const invite = inviteId
    ? await db.orgInvite.findFirst({
        where: { id: inviteId, accepted: false, expiresAt: { gt: new Date() } },
        include: { organization: { select: { name: true } } },
      })
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-black">
      <div className="w-full max-w-sm">
        <Logo />

        <div className="rounded-2xl border border-black/[.08] p-8 dark:border-white/[.08]">
          <h1 className="text-xl font-medium">Join organisation</h1>

          {!inviteId ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              This invite link is missing its invite id.
            </p>
          ) : !invite ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              This invite is invalid, expired, or has already been used.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                You&apos;ve been invited to join{" "}
                <span className="font-medium text-foreground">{invite.organization.name}</span> as{" "}
                {invite.role === "ADMIN" ? "an admin" : "a member"}. Sign in first if you
                haven&apos;t already, then confirm below to join.
              </p>

              <AcceptInviteButton inviteId={invite.id} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
