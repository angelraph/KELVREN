import { Resend } from "resend";

function client(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set - required to send account email.");
  }
  return new Resend(key);
}

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? "Kelvren <onboarding@resend.dev>";
}

export async function sendVerificationEmail(to: string, name: string, verifyUrl: string) {
  const resend = client();
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to,
    subject: "Confirm your Kelvren account",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
        <p style="letter-spacing: 0.25em; text-transform: uppercase; font-size: 13px; color: #888;">Kelvren</p>
        <h1 style="font-size: 22px; font-weight: 500;">Confirm your email</h1>
        <p style="font-size: 15px; color: #333; line-height: 1.5;">
          Hi ${name || "there"}, click the button below to confirm ${to} and activate your Kelvren account. This link expires in 24 hours.
        </p>
        <p style="margin: 28px 0;">
          <a href="${verifyUrl}" style="background: #111; color: #fff; padding: 12px 24px; text-decoration: none; font-size: 14px; font-weight: 500;">
            Confirm email
          </a>
        </p>
        <p style="font-size: 13px; color: #888;">
          If you didn't create a Kelvren account, you can ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}
