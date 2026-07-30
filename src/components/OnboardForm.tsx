"use client";

import { useState } from "react";
import { CATEGORY_LABEL, CATEGORY_DEFAULT_LIMIT, CATEGORY_ORDER } from "@/lib/categories";
import type { DeadlineCategory } from "@/generated/prisma/enums";

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "NGN", symbol: "₦" },
];

export function OnboardForm({
  initialCategory,
}: {
  initialCategory?: DeadlineCategory;
}) {
  const startCategory =
    initialCategory && CATEGORY_ORDER.includes(initialCategory)
      ? initialCategory
      : CATEGORY_ORDER[0];
  const [category, setCategory] = useState(startCategory);
  const [limit, setLimit] = useState(String(CATEGORY_DEFAULT_LIMIT[startCategory]));
  const [currency, setCurrency] = useState(CURRENCIES[0].code);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/prava/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, monthlyLimit: Number(limit), currency }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }
      window.location.href = data.iframeUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="text-xs uppercase tracking-widest text-ink-dim">
          Category
        </label>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORY_ORDER.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => {
                setCategory(c);
                setLimit(String(CATEGORY_DEFAULT_LIMIT[c]));
              }}
              className={`text-left px-4 py-3 text-sm border transition ${
                category === c
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-line text-ink-dim hover:border-ink-dim"
              }`}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-ink-dim">
          Currency
        </label>
        <div className="mt-3 flex gap-2">
          {CURRENCIES.map((c) => (
            <button
              type="button"
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={`px-4 py-2 text-sm border transition ${
                currency === c.code
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-line text-ink-dim hover:border-ink-dim"
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="limit"
          className="text-xs uppercase tracking-widest text-ink-dim"
        >
          Monthly spend limit
        </label>
        <div className="mt-3 flex items-center gap-2 border border-line px-4 py-3 max-w-xs">
          <span className="tabular text-ink-dim">{symbol}</span>
          <input
            id="limit"
            type="number"
            min="1"
            step="1"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="tabular bg-transparent outline-none w-full text-ink"
          />
        </div>
        <p className="mt-2 text-xs text-ink-dim max-w-md">
          Kelvren can charge up to this amount per month in this category
          without asking. Anything above it waits for your approval. You
          approve this limit yourself, on the next screen, with your
          passkey.
        </p>
      </div>

      {error && <p className="text-sm text-warn">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto bg-accent text-paper px-6 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
      >
        {pending ? "Opening approval..." : "Set limit and approve"}
      </button>
    </form>
  );
}
