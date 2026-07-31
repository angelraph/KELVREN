import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { issueVerificationEmail } from "@/lib/verification";
import { PasswordInput } from "@/components/PasswordInput";
import { SubmitButton } from "@/components/SubmitButton";
import { GoogleIcon } from "@/components/GoogleIcon";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  const { error } = await searchParams;

  async function create(formData: FormData) {
    "use server";
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;

    if (!name || !email || !password || password.length < 8) {
      redirect("/signup?error=invalid");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      redirect("/signup?error=exists");
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.create({ data: { name, email, passwordHash } });
    await issueVerificationEmail(email, name);

    redirect(`/signup/check-email?email=${encodeURIComponent(email)}`);
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
          <h1 className="text-2xl font-medium text-ink">Create your account</h1>

          {error && (
            <p className="mt-6 text-sm text-warn bg-warn-soft rounded-lg px-4 py-3">
              {error === "exists"
                ? "An account with that email already exists. Try logging in instead."
                : "Enter a name, email, and a password of at least 8 characters."}
            </p>
          )}

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/onboarding" });
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

          <form action={create} className="mt-8 space-y-4">
            <input
              type="text"
              name="name"
              required
              placeholder="Name"
              className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Email"
              className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <PasswordInput name="password" placeholder="Password (min 8 characters)" minLength={8} />
            <SubmitButton
              pendingText="Creating account..."
              className="w-full bg-accent text-paper rounded-xl px-6 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition shadow-sm"
            >
              Create account
            </SubmitButton>
          </form>
        </div>

        <p className="mt-6 text-sm text-ink-dim text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-accent underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
