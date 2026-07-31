"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { issueVerificationEmail } from "@/lib/verification";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function resendVerificationEmail(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerified) {
    await issueVerificationEmail(email, user.name ?? "");
  }
  redirect(`/signup/check-email?email=${encodeURIComponent(email)}`);
}
