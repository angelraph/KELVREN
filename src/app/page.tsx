import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/categories";

const STEPS = [
  {
    n: "01",
    title: "Connect",
    body: "Sign in with Google and give Kelvren read-only access to your inbox. Nothing is sent, deleted, or replied to.",
  },
  {
    n: "02",
    title: "Detect",
    body: "Finds the real deadline, in your inbox or entered by hand, before it becomes urgent.",
  },
  {
    n: "03",
    title: "Decide",
    body: "Checks the cost against the limit you set for that category. Under it, it acts. Over it, it asks.",
  },
  {
    n: "04",
    title: "Settle",
    body: "Pays through Prava with a single-use card, and leaves a receipt you can check against.",
  },
];

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-5 sm:px-8 py-6 flex items-center justify-between border-b border-line">
        <span className="text-sm tracking-[0.25em] uppercase text-ink-dim">
          Kelvren
        </span>
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

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/onboarding" });
            }}
            className="mt-10"
          >
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-accent text-paper px-6 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition"
            >
              Continue with Google
            </button>
          </form>
          <p className="mt-4 text-xs text-ink-dim">
            We ask for read-only access to scan for renewal notices. Nothing
            is sent, deleted, or replied to.
          </p>
          <p className="mt-6 text-sm text-ink-dim">
            Prefer email?{" "}
            <Link href="/login" className="text-accent underline">
              Log in
            </Link>{" "}
            or{" "}
            <Link href="/signup" className="text-accent underline">
              sign up
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-xs uppercase tracking-widest text-ink-dim">
            How it works
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
            {STEPS.map((step) => (
              <div key={step.n}>
                <span className="tabular text-xs text-ink-dim">{step.n}</span>
                <p className="mt-2 text-sm font-medium text-ink">
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
                className="text-xs text-ink-dim border border-line px-3 py-1.5"
              >
                {CATEGORY_LABEL[c]}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
