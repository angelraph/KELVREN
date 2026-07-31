"use client";

import { useState } from "react";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/categories";

export function AddDeadlineForm() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORY_ORDER[0]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/watch-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title,
          dueDate,
          merchantName: merchantName || undefined,
          estimatedAmount: estimatedAmount || undefined,
          currency: "USD",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-accent underline"
      >
        + Add a deadline by hand
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {CATEGORY_ORDER.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setCategory(c)}
            className={`text-left px-3 py-2 text-xs rounded-lg border transition ${
              category === c
                ? "border-accent bg-accent-soft text-ink"
                : "border-line bg-surface text-ink-dim hover:border-ink-dim"
            }`}
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <input
        type="text"
        required
        placeholder="Title (e.g. example.com domain renewal)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-surface border border-line rounded-xl px-4 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      />

      <div className="flex items-center gap-2">
        <label className="text-xs uppercase tracking-widest text-ink-dim">Due</label>
        <input
          type="date"
          required
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-surface border border-line rounded-xl px-4 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <input
        type="text"
        placeholder="Merchant (optional)"
        value={merchantName}
        onChange={(e) => setMerchantName(e.target.value)}
        className="w-full bg-surface border border-line rounded-xl px-4 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      />

      <div className="flex items-center gap-2">
        <span className="tabular text-ink-dim">$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Estimated amount (optional)"
          value={estimatedAmount}
          onChange={(e) => setEstimatedAmount(e.target.value)}
          className="tabular bg-surface border border-line rounded-xl px-4 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 max-w-xs"
        />
      </div>

      {error && <p className="text-sm text-warn">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-paper rounded-xl px-5 py-2.5 text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50 shadow-sm"
        >
          {pending ? "Adding..." : "Add deadline"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-ink-dim hover:text-ink transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
