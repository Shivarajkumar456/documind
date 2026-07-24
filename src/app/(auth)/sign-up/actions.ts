"use server";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function signUpAction(
  _prev: { error: string } | null,
  formData: FormData
) {
  const { error } = await auth.signUp.email({
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message || "Failed to create account" };
  redirect("/create-org");
}
