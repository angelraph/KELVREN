"use client";

import { useEffect, useState } from "react";

interface Operator {
  id: number;
  name: string;
  data: boolean;
  bundle: boolean;
  minAmount: number;
  maxAmount: number;
  senderCurrencyCode: string;
}

export function TopUpForm({ maxAmount }: { maxAmount: number }) {
  const [open, setOpen] = useState(false);
  const [operators, setOperators] = useState<Operator[] | null>(null);
  const [operatorId, setOperatorId] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open || operators) return;
    fetch("/api/reloadly/operators")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setOperators(data.operators);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Could not load operators"));
  }, [open, operators]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!operatorId) {
      setError("Choose a network");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const operator = operators?.find((o) => o.id === operatorId);
      const res = await fetch("/api/reloadly/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorId,
          operatorName: operator?.name,
          amount: Number(amount),
          phoneNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Top-up failed");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Top-up failed");
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <p className="mt-2 text-xs text-accent">
        Top-up sent. Refresh the page to see the receipt.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs text-accent underline"
      >
        Top up airtime or data
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-line pt-3">
      {loadError && <p className="text-xs text-warn">{loadError}</p>}
      {!operators && !loadError && (
        <p className="text-xs text-ink-dim">Loading networks...</p>
      )}
      {operators && (
        <div className="flex flex-wrap gap-2">
          {operators
            .filter((o) => !o.bundle)
            .map((o) => (
              <button
                type="button"
                key={o.id}
                onClick={() => setOperatorId(o.id)}
                className={`px-3 py-1.5 text-xs border transition ${
                  operatorId === o.id
                    ? "border-accent bg-accent-soft text-ink"
                    : "border-line text-ink-dim hover:border-ink-dim"
                }`}
              >
                {o.name}
              </button>
            ))}
        </div>
      )}
      <input
        type="tel"
        required
        placeholder="Phone number (e.g. 08012345678)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="w-full bg-transparent border border-line px-3 py-2 text-xs text-ink outline-none"
      />
      <input
        type="number"
        required
        min="1"
        max={maxAmount}
        step="1"
        placeholder={`Amount (up to ${maxAmount})`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full bg-transparent border border-line px-3 py-2 text-xs text-ink outline-none"
      />
      {error && <p className="text-xs text-warn">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-paper px-4 py-2 text-xs font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
        >
          {pending ? "Sending..." : "Send top-up"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink-dim hover:text-ink transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
