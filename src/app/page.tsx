import Link from "next/link";
import { auth } from "@/auth";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/categories";
import { NavMenu } from "@/components/NavMenu";

const STEPS = [
  {
    n: "01",
    title: "You sign in",
    body: "Sign in with Google. Kelvren asks for permission to read your inbox — not to send, delete, or reply to anything in it.",
  },
  {
    n: "02",
    title: "It watches for bills",
    body: "It looks for emails about things that expire or need paying: a domain, a passport, a subscription, a utility bill. You can also add one yourself if it's not in your inbox.",
  },
  {
    n: "03",
    title: "You set the rules",
    body: "You pick a monthly limit per category, like \"$50 a month for subscriptions.\" Anything under that limit, Kelvren can pay on its own. Anything over it, it asks you first.",
  },
  {
    n: "04",
    title: "It pays and shows you the receipt",
    body: "When something's due and it's within your limit, Kelvren pays it through Prava right then, and the receipt shows up on your dashboard.",
  },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-5 sm:px-8 py-6 flex items-center justify-between border-b border-line">
        <span className="text-sm tracking-[0.25em] uppercase text-ink-dim">
          Kelvren
        </span>
        {session?.user ? (
          <NavMenu />
        ) : (
          <Link
            href="/login"
            className="text-sm text-ink-dim hover:text-ink transition"
          >
            Log in
          </Link>
        )}
      </header>

      <section className="hero-field">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16 sm:py-24 w-full">
          <h1 className="text-4xl sm:text-5xl font-medium leading-tight tracking-tight text-ink">
            Renews itself before you remember it&apos;s due.
          </h1>
          <p className="mt-6 text-lg text-ink-dim leading-relaxed">
            Kelvren watches the domains, registrations, licenses, permits, and
            everyday bills that quietly come due, and resolves them with
            money you have already approved. Small categories renew on their
            own inside a limit you set. Anything larger waits for you to say
            yes.
          </p>

          <Link
            href={session?.user ? "/dashboard" : "/login"}
            className="mt-10 w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-accent text-paper rounded-xl px-7 py-3.5 text-sm font-medium tracking-wide hover:opacity-90 transition shadow-sm"
          >
            {session?.user ? "Go to dashboard" : "Get started"}
          </Link>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-xs uppercase tracking-widest text-ink-dim">
            How it works
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step) => (
              <div key={step.n} className="card card-interactive px-5 py-6">
                <span className="tabular flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs text-accent">
                  {step.n}
                </span>
                <p className="mt-4 text-sm font-medium text-ink">
                  {step.title}
                </p>
                <p className="mt-2 text-sm text-ink-dim leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-xs uppercase tracking-widest text-ink-dim">
            What a day actually looks like
          </h2>
          <div className="mt-6 max-w-2xl space-y-4 text-sm text-ink-dim leading-relaxed">
            <p>
              Most days there is nothing to do, and Kelvren does nothing. It
              still checks your inbox every time you ask it to, quietly,
              looking for the kind of email that means something is about to
              expire or come due.
            </p>
            <p>
              When it finds one, it reads the amount, the due date, and who
              it is owed to. If that fits inside the limit you set for that
              category, it settles it through Prava the moment it is due and
              leaves a receipt. If it does not, it waits at the top of your
              dashboard until you say yes or no.
            </p>
            <p>
              Nothing here is simulated. Every deadline shown comes from a
              real email or something you entered by hand, and every receipt
              is a real charge Kelvren made on your behalf.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-xs uppercase tracking-widest text-ink-dim">
            Everyday and annual, covered
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORY_ORDER.filter((c) => c !== "OTHER").map((c) => (
              <span
                key={c}
                className="text-xs text-ink-dim bg-surface border border-line rounded-full px-3.5 py-1.5"
              >
                {CATEGORY_LABEL[c]}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-dim">
          <span>&copy; {new Date().getFullYear()} Kelvren</span>
          <Link href="/privacy" className="hover:text-ink transition">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ink transition">
            Terms
          </Link>
        </div>
      </footer>
    </main>
  );
}
