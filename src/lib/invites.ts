import { db } from "@/lib/db";

export function findPendingInviteForEmail(email: string) {
  // A single email can have multiple pending invites across different orgs
  // (e.g. re-invited after cleanup, or invited to more than one org before
  // ever signing up). Without an explicit order, Prisma's findFirst returns
  // an arbitrary match — always prefer the most recently sent invite.
  return db.orgInvite.findFirst({
    where: { email, accepted: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
}
