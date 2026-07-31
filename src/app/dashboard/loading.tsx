export default function DashboardLoading() {
  return (
    <main className="min-h-screen">
      <header className="px-5 sm:px-8 py-6 border-b border-line flex flex-wrap items-center justify-between gap-y-3">
        <span className="text-sm tracking-[0.25em] uppercase text-ink-dim">
          Kelvren
        </span>
        <div className="h-5 w-5 rounded-sm bg-line animate-pulse" />
      </header>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
        <section>
          <div className="h-3 w-28 rounded bg-line animate-pulse" />
          <div className="mt-3 h-3 w-72 max-w-full rounded bg-line animate-pulse" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card flex items-center gap-3 px-4 py-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-line animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-line animate-pulse" />
                  <div className="h-3 w-1/3 rounded bg-line animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {["Due within 7 days", "Upcoming", "Receipts"].map((label) => (
          <section key={label}>
            <div className="h-3 w-32 rounded bg-line animate-pulse" />
            <div className="mt-4 card px-5 py-8">
              <div className="h-3 w-2/3 mx-auto rounded bg-line animate-pulse" />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
