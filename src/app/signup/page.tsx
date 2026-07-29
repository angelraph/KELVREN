import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

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

    try {
      await signIn("credentials", { email, password, redirectTo: "/onboarding" });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=CredentialsSignin");
      }
      throw err;
    }
  }

  return (
    <main className="min-h-screen">
      <header className="px-5 sm:px-8 py-6 border-b border-line">
        <Link
          href="/"
          className="text-sm tracking-[0.25em] uppercase text-ink-dim hover:text-ink transition"
        >
          Kelvren
        </Link>
      </header>
      <div className="max-w-sm mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <h1 className="text-2xl font-medium text-ink">Create your account</h1>

        {error && (
          <p className="mt-6 text-sm text-warn bg-warn-soft px-4 py-3">
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
            className="w-full inline-flex items-center justify-center gap-3 border border-line px-6 py-3 text-sm font-medium tracking-wide text-ink hover:border-ink-dim transition"
          >
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
            className="w-full bg-transparent border border-line px-3 py-2 text-sm text-ink outline-none"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            className="w-full bg-transparent border border-line px-3 py-2 text-sm text-ink outline-none"
          />
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
            className="w-full bg-transparent border border-line px-3 py-2 text-sm text-ink outline-none"
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-accent text-paper px-6 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-dim">
          Already have an account?{" "}
          <Link href="/login" className="text-accent underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
