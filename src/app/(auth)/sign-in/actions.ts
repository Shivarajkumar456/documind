"use server";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function signInAction(
  _prev: { error: string } | null,
  formData: FormData
) {
  const { error } = await auth.signIn.email({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message || "Invalid email or password" };
  redirect("/dashboard");
}
