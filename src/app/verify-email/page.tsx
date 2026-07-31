import Link from "next/link";
import { resendVerificationEmail } from "@/lib/actions";

export default async function VerifyEmailErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const { error, email } = await searchParams;

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
        <div className="card px-6 py-8 sm:px-8 sm:py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warn-soft">
            <svg
              className="h-6 w-6 text-warn"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-medium text-ink">
            {error === "expired" ? "Link expired" : "Invalid link"}
          </h1>
          <p className="mt-3 text-sm text-ink-dim leading-relaxed">
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
        </div>

        <p className="mt-6 text-sm text-ink-dim text-center">
          <Link href="/login" className="text-accent underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
