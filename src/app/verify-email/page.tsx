import Link from "next/link";
import { resendVerificationEmail } from "@/lib/actions";

export default async function VerifyEmailErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const { error, email } = await searchParams;

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
        <h1 className="text-2xl font-medium text-ink">
          {error === "expired" ? "Link expired" : "Invalid link"}
        </h1>
        <p className="mt-6 text-sm text-ink-dim leading-relaxed">
          {error === "expired"
            ? "That confirmation link has expired."
            : "That confirmation link is invalid or has already been used."}
        </p>

        {email && (
          <form action={resendVerificationEmail} className="mt-6">
            <input type="hidden" name="email" value={email} />
            <button type="submit" className="underline text-accent font-medium text-sm">
              Send a new confirmation link
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-ink-dim">
          <Link href="/login" className="text-accent underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
