import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/categories";
import { ScanGmailButton } from "@/components/ScanGmailButton";
import { AddDeadlineForm } from "@/components/AddDeadlineForm";
import { MandateActions } from "@/components/MandateActions";
import { NavMenu } from "@/components/NavMenu";
import { TopUpForm } from "@/components/TopUpForm";
import { PayBillForm } from "@/components/PayBillForm";
import type { Mandate } from "@/generated/prisma/client";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatMoney(amount: unknown, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    Number(amount)
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarded?: string; scanned?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }
  const { onboarded, scanned } = await searchParams;
  const userId = session.user.id;

  const [watchItems, mandates, charges] = await Promise.all([
    prisma.watchItem.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" },
    }),
    prisma.mandate.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.charge.findMany({
      where: { watchItem: { userId } },
      include: { watchItem: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const mandateByCategory = new Map<string, Mandate>();
  for (const m of mandates) {
    if (!mandateByCategory.has(m.category)) {
      mandateByCategory.set(m.category, m);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueSoon = watchItems.filter((w) => {
    const days = (w.dueDate.getTime() - today.getTime()) / 86400000;
    return days <= 7;
  });
  const upcoming = watchItems.filter((w) => {
    const days = (w.dueDate.getTime() - today.getTime()) / 86400000;
    return days > 7;
  });

  return (
    <main className="min-h-screen">
      <header className="px-5 sm:px-8 py-6 border-b border-line flex flex-wrap items-center justify-between gap-y-3">
        <Link
          href="/"
          className="text-sm tracking-[0.25em] uppercase text-ink-dim hover:text-ink transition"
        >
          Kelvren
        </Link>
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <ScanGmailButton />
          <NavMenu />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
        {onboarded === "1" && (
          <p className="text-sm text-accent bg-accent-soft px-4 py-3">
            Limit approved. Kelvren can now act inside it.
          </p>
        )}

        {scanned !== undefined && (
          <p className="text-sm text-accent bg-accent-soft px-4 py-3">
            {scanned === "0"
              ? "Gmail scan complete. No new deadlines found."
              : `Gmail scan complete. Found ${scanned} new deadline${scanned === "1" ? "" : "s"}.`}
          </p>
        )}

        <section>
          <h2 className="text-xs uppercase tracking-widest text-ink-dim">
            Set your limits
          </h2>
          <p className="mt-2 text-xs text-ink-dim max-w-md">
            Pick a category to set the monthly amount Kelvren can pay on its
            own. Nothing gets charged in a category until it has a limit.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORY_ORDER.map((c) => {
              const mandate = mandateByCategory.get(c);
              if (!mandate) {
                return (
                  <Link
                    key={c}
                    href={`/onboarding?category=${c}`}
                    className="border border-line px-4 py-3 hover:border-ink-dim transition"
                  >
                    <p className="text-sm text-ink">{CATEGORY_LABEL[c]}</p>
                    <p className="mt-1 text-xs text-accent">Set a limit &rarr;</p>
                  </Link>
                );
              }
              return (
                <div key={c} className="border border-accent bg-accent-soft px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-ink">{CATEGORY_LABEL[c]}</p>
                    <span className="tabular text-sm text-ink">
                      {formatMoney(mandate.approvedAmount, mandate.currency)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-dim">
                    {mandate.recurringFrequency} &middot; {mandate.status.toLowerCase()}
                  </p>
                  <MandateActions mandateId={mandate.id} status={mandate.status} />
                  {c === "PHONE_INTERNET" && mandate.status === "ACTIVE" && (
                    <TopUpForm maxAmount={Number(mandate.approvedAmount)} />
                  )}
                  {c === "UTILITY" && mandate.status === "ACTIVE" && (
                    <PayBillForm maxAmount={Number(mandate.approvedAmount)} />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-widest text-ink-dim">
              Due within 7 days
            </h2>
          </div>
          <div className="mt-4">
            <AddDeadlineForm />
          </div>
          <div className="mt-4 border-t border-line">
            {dueSoon.length === 0 ? (
              <p className="py-6 text-sm text-ink-dim">
                Nothing due soon. Kelvren will list anything it detects here
                before it becomes urgent.
              </p>
            ) : (
              dueSoon.map((item) => (
                <div
                  key={item.id}
                  className="py-4 border-b border-line flex flex-wrap items-center justify-between gap-x-4 gap-y-1"
                >
                  <div>
                    <p className="text-sm text-ink">{item.title}</p>
                    <p className="text-xs text-ink-dim mt-1">
                      {CATEGORY_LABEL[item.category]} &middot; due{" "}
                      {formatDate(item.dueDate)}
                    </p>
                  </div>
                  <span className="tabular text-xs text-ink-dim">
                    {item.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-widest text-ink-dim">
            Upcoming
          </h2>
          <div className="mt-4 border-t border-line">
            {upcoming.length === 0 ? (
              <p className="py-6 text-sm text-ink-dim">
                Nothing further out yet. Connect Gmail scanning to let
                Kelvren find renewal notices on its own.
              </p>
            ) : (
              upcoming.map((item) => (
                <div
                  key={item.id}
                  className="py-4 border-b border-line flex flex-wrap items-center justify-between gap-x-4 gap-y-1"
                >
                  <div>
                    <p className="text-sm text-ink">{item.title}</p>
                    <p className="text-xs text-ink-dim mt-1">
                      {CATEGORY_LABEL[item.category]} &middot; due{" "}
                      {formatDate(item.dueDate)}
                    </p>
                  </div>
                  <span className="tabular text-xs text-ink-dim">
                    {item.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-widest text-ink-dim">
            Receipts
          </h2>
          <div className="mt-4 border-t border-line">
            {charges.length === 0 ? (
              <p className="py-6 text-sm text-ink-dim">
                Nothing has been paid yet. Every real charge Kelvren makes
                will show up here with a reason and a receipt.
              </p>
            ) : (
              charges.map((c) => (
                <div key={c.id} className="py-4 border-b border-line">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-ink">
                      {c.merchantName ?? c.watchItem.title}
                    </p>
                    <span className="tabular text-sm text-ink">
                      {formatMoney(c.amount, c.currency)}
                    </span>
                  </div>
                  <p className="text-xs text-ink-dim mt-1">{c.rationale}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
