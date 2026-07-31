import Link from "next/link";

export const metadata = {
  title: "Terms of Service - Kelvren",
};

export default function TermsPage() {
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
        <h1 className="text-2xl font-medium text-ink">Terms of Service</h1>
        <p className="mt-2 text-sm text-ink-dim">Last updated July 31, 2026</p>

        <div className="mt-10 space-y-8 text-sm text-ink-dim leading-relaxed">
          <section>
            <h2 className="text-ink font-medium">What you&apos;re agreeing to</h2>
            <p className="mt-2">
              By creating a Kelvren account you agree to these terms and to
              our{" "}
              <Link href="/privacy" className="text-accent underline">
                Privacy Policy
              </Link>
              . If you don&apos;t agree, don&apos;t use Kelvren.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">What Kelvren does</h2>
            <p className="mt-2">
              Kelvren detects recurring bills and renewal deadlines (from
              Gmail, if you connect it, or entries you add by hand) and pays
              them automatically through Prava, but only inside a monthly
              limit you explicitly set per category. Nothing is charged in a
              category until you&apos;ve set a limit for it, and anything
              above your limit waits for your explicit approval before it is
              paid.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">Your responsibilities</h2>
            <p className="mt-2">
              You&apos;re responsible for keeping your login credentials
              secure, for the accuracy of any limits and payment details you
              set, and for having sufficient funds available for payments
              Kelvren makes on your behalf inside those limits. You&apos;re
              responsible for reviewing the receipts Kelvren generates and
              for flagging anything that looks wrong.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">Automated detection isn&apos;t perfect</h2>
            <p className="mt-2">
              Deadline detection from Gmail uses automated extraction and can
              miss a bill or misread a date or amount. Kelvren is a tool to
              help you keep on top of recurring payments, not a guarantee
              that every bill will be caught - review your dashboard rather
              than relying on it exclusively, especially for anything with a
              real financial or legal consequence if missed.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">Third-party services</h2>
            <p className="mt-2">
              Payments run through Prava; airtime and utility top-ups run
              through Reloadly; email delivery runs through Resend; deadline
              extraction runs through OpenAI. Your use of Kelvren is also
              subject to those providers&apos; own terms where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">Account termination</h2>
            <p className="mt-2">
              You may stop using Kelvren and request account deletion at any
              time (see the{" "}
              <Link href="/privacy" className="text-accent underline">
                Privacy Policy
              </Link>{" "}
              for how). We may suspend or terminate accounts used for fraud,
              abuse, or in violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">No warranty</h2>
            <p className="mt-2">
              Kelvren is provided as-is, without warranty of any kind. To the
              extent permitted by law, we aren&apos;t liable for indirect,
              incidental, or consequential damages arising from your use of
              the service.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">Changes</h2>
            <p className="mt-2">
              We may update these terms as Kelvren changes. Material changes
              will be reflected here with an updated date above.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium">Contact</h2>
            <p className="mt-2">
              Questions about these terms: email{" "}
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
