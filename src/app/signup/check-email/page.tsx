import Link from "next/link";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
            <svg
              className="h-6 w-6 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-medium text-ink">Check your email</h1>
          <p className="mt-3 text-sm text-ink-dim leading-relaxed">
            We sent a confirmation link to{" "}
            <span className="text-ink font-medium">{email ?? "your email"}</span>.
            Click it to activate your account, then log in.
          </p>
        </div>

        <p className="mt-6 text-sm text-ink-dim text-center">
          Already confirmed?{" "}
          <Link href="/login" className="text-accent underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
