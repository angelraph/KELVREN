import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resendVerificationEmail } from "@/lib/actions";
import { PasswordInput } from "@/components/PasswordInput";
import { SubmitButton } from "@/components/SubmitButton";
import { GoogleIcon } from "@/components/GoogleIcon";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string; verified?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  const { error, email: unverifiedEmail, verified } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && !existing.passwordHash) {
      redirect("/login?error=no_password");
    }
    if (existing?.passwordHash && !existing.emailVerified) {
      redirect(`/login?error=unverified&email=${encodeURIComponent(email)}`);
    }

    try {
      await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=CredentialsSignin");
      }
      throw err;
    }
  }

  return (
    <main className="min-h-screen hero-field">
      <header className="px-5 sm:px-8 py-6">
        <Link
          href="/"
          className="text-sm tracking-[0.25em] uppercase text-ink-dim hover:text-ink transition"
        >
          Kelvren
        </Link>
      </header>
      <div className="max-w-sm mx-auto px-5 sm:px-8 py-10 sm:py-16">
        <div className="card px-6 py-8 sm:px-8 sm:py-10">
          <h1 className="text-2xl font-medium text-ink">Log in</h1>

          {verified && (
            <p className="mt-6 text-sm text-accent bg-accent-soft rounded-lg px-4 py-3">
              Email confirmed. Log in below.
            </p>
          )}

          {error && error !== "unverified" && (
            <p className="mt-6 text-sm text-warn bg-warn-soft rounded-lg px-4 py-3">
              {error === "no_password"
                ? "That email is registered with Google. Use \"Continue with Google\" below instead of a password."
                : "Wrong email or password. Try again."}
            </p>
          )}

          {error === "unverified" && unverifiedEmail && (
            <div className="mt-6 text-sm text-warn bg-warn-soft rounded-lg px-4 py-3">
              <p>Confirm your email before logging in. We can send a new link.</p>
              <form action={resendVerificationEmail} className="mt-3">
                <input type="hidden" name="email" value={unverifiedEmail} />
                <button type="submit" className="underline text-accent font-medium">
                  Resend confirmation email
                </button>
              </form>
            </div>
          )}

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
            className="mt-8"
          >
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-3 border border-line rounded-xl px-6 py-3 text-sm font-medium tracking-wide text-ink bg-surface hover:bg-surface-hover hover:border-ink-dim transition"
            >
              <GoogleIcon className="h-4 w-4" />
              Continue with Google
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs uppercase tracking-widest text-ink-dim">
              or
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form action={login} className="mt-8 space-y-4">
            <input
              type="email"
              name="email"
              required
              placeholder="Email"
              className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <PasswordInput name="password" placeholder="Password" />
            <SubmitButton
              pendingText="Logging in..."
              className="w-full bg-accent text-paper rounded-xl px-6 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition shadow-sm"
            >
              Log in
            </SubmitButton>
          </form>
        </div>

        <p className="mt-6 text-sm text-ink-dim text-center">
          Need an account?{" "}
          <Link href="/signup" className="text-accent underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
