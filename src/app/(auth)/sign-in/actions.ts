"use server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { findPendingInviteForEmail } from "@/lib/invites";
import { redirect } from "next/navigation";

export async function signInAction(
  _prev: { error: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const { data, error } = await auth.signIn.email({
    email,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message || "Invalid email or password" };

  // Use the user returned directly by signIn.email — a fresh auth.getSession()
  // call here would not see the session cookie signIn.email just set, since
  // that mutation only takes effect on the *next* request, not this one.
  const user = await db.user.findUnique({ where: { id: data.user.id } });
  if (!user?.organizationId) {
    const pendingInvite = await findPendingInviteForEmail(email);
    if (pendingInvite) redirect(`/accept-invite?inviteId=${pendingInvite.id}`);
  }

  redirect("/dashboard");
}
