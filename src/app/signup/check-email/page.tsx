import Link from "next/link";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

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
        <h1 className="text-2xl font-medium text-ink">Check your email</h1>
        <p className="mt-6 text-sm text-ink-dim leading-relaxed">
          We sent a confirmation link to{" "}
          <span className="text-ink font-medium">{email ?? "your email"}</span>.
          Click it to activate your account, then log in.
        </p>
        <p className="mt-6 text-sm text-ink-dim">
          Already confirmed?{" "}
          <Link href="/login" className="text-accent underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
