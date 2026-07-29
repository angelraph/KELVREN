import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardForm } from "@/components/OnboardForm";
import { NavMenu } from "@/components/NavMenu";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  const { error } = await searchParams;

  return (
    <main className="min-h-screen">
      <header className="px-5 sm:px-8 py-6 border-b border-line flex items-center justify-between">
        <Link
          href="/"
          className="text-sm tracking-[0.25em] uppercase text-ink-dim hover:text-ink transition"
        >
          Kelvren
        </Link>
        <NavMenu />
      </header>
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
        <h1 className="text-2xl font-medium text-ink">
          Set your first limit
        </h1>
        <p className="mt-3 text-sm text-ink-dim leading-relaxed">
          Pick one category to start with. You can add more later. The next
          screen is Prava&apos;s own approval page, where you confirm this
          limit with your card and a passkey.
        </p>

        {error && (
          <p className="mt-6 text-sm text-warn bg-warn-soft px-4 py-3">
            {error === "mandate_not_found"
              ? "The approval did not finish in time. If you approved it, wait a moment and check the dashboard, otherwise try again."
              : "That approval could not be completed. Try again."}
          </p>
        )}

        <div className="mt-10">
          <OnboardForm />
        </div>
      </div>
    </main>
  );
}
