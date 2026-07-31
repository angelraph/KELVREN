import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Kelvren",
};

export default function PrivacyPage() {
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
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <h1 className="text-2xl font-medium text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ink-dim">Last updated July 31, 2026</p>

        <div className="mt-10 space-y-8 text-sm text-ink-dim leading-relaxed">
          <section>
            <h2 className="text-ink font-medium">What Kelvren is</h2>
            <p className="mt-2">
              Kelvren tracks recurring bills and renewal deadlines and, within
              limits you set, pays them automatically. This page explains what
              data that requires, why, and who it passes through.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">Account data</h2>
            <p className="mt-2">
              When you create an account we store your name, email address,
              and (if you sign up with a password) a salted, hashed copy of
              it - never the password itself. If you sign in with Google
              instead, we store the account identifiers Google gives us
              rather than a password.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">Gmail access</h2>
            <p className="mt-2">
              If you connect Google, Kelvren requests read-only access to
              your Gmail (the <code>gmail.readonly</code> scope) - it cannot
              send, delete, or modify anything in your inbox. When you run a
              scan, Kelvren searches for messages that look like bills or
              renewal notices, reads the matching messages, and sends their
              text to OpenAI to extract a due date, amount, and category. We
              store the extracted deadline (title, amount, due date,
              category, and the source Gmail message ID); we do not store the
              full email body or the rest of your inbox.
            </p>
            <p className="mt-2">
              You can revoke this access at any time from your Google
              Account&apos;s{" "}
              <a
                href="https://myaccount.google.com/permissions"
                className="text-accent underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                third-party access settings
              </a>
              , which immediately stops any further scanning.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">Payments</h2>
            <p className="mt-2">
              Payments you authorize are processed by Prava, our payment
              partner - Kelvren does not store your card number. We store the
              limits you configure per category, the resulting payment
              mandates, and a record of each charge (amount, merchant, and
              reason) so you have a receipt trail. Airtime and utility
              top-ups are fulfilled through Reloadly.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">Who we share data with</h2>
            <p className="mt-2">
              Kelvren does not sell your data. We share the minimum needed to
              operate with: Google (Gmail API access you grant), OpenAI
              (extracting deadlines from matched email text), Prava
              (payment execution), Reloadly (airtime/bill fulfillment),
              Resend (account emails like verification links), and our
              infrastructure providers (Vercel for hosting, Neon for the
              database).
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">Data retention and deletion</h2>
            <p className="mt-2">
              We keep your account data for as long as your account is
              active. To delete your account and associated data, email{" "}
              <a
                href="mailto:uzoechiraphael1@gmail.com"
                className="text-accent underline"
              >
                uzoechiraphael1@gmail.com
              </a>{" "}
              and we will remove it, aside from records we&apos;re legally
              required to keep (e.g. completed payment records).
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">Contact</h2>
            <p className="mt-2">
              Questions about this policy or your data: email{" "}
              <a
                href="mailto:uzoechiraphael1@gmail.com"
                className="text-accent underline"
              >
                uzoechiraphael1@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm text-ink-dim">
          <Link href="/" className="text-accent underline">
            Back to Kelvren
          </Link>
        </p>
      </div>
    </main>
  );
}
