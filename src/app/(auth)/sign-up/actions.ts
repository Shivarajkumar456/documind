"use server";
import { auth } from "@/lib/auth/server";
import { findPendingInviteForEmail } from "@/lib/invites";
import { redirect } from "next/navigation";

export async function signUpAction(
  _prev: { error: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const { error } = await auth.signUp.email({
    name: formData.get("name") as string,
    email,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message || "Failed to create account" };

  const pendingInvite = await findPendingInviteForEmail(email);
  if (pendingInvite) redirect(`/accept-invite?inviteId=${pendingInvite.id}`);

  redirect("/create-org");
}
