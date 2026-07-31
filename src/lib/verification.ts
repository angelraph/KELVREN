import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function issueVerificationEmail(email: string, name: string) {
  const token = crypto.randomBytes(32).toString("hex");

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}`;
  await sendVerificationEmail(email, name, verifyUrl);
}
