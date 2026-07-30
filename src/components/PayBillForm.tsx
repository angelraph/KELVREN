"use client";

import { useEffect, useState } from "react";

interface Biller {
  id: number;
  name: string;
  serviceType: string;
  minLocalTransactionAmount: number;
  maxLocalTransactionAmount: number;
  localTransactionCurrencyCode: string;
}

export function PayBillForm({ maxAmount }: { maxAmount: number }) {
  const [open, setOpen] = useState(false);
  const [billers, setBillers] = useState<Biller[] | null>(null);
  const [billerId, setBillerId] = useState<number | null>(null);
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open || billers) return;
    fetch("/api/reloadly/billers")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setBillers(data.billers);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Could not load billers"));
  }, [open, billers]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!billerId) {
      setError("Choose a biller");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const biller = billers?.find((b) => b.id === billerId);
      const res = await fetch("/api/reloadly/utility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billerId,
          billerName: biller?.name,
          amount: Number(amount),
          meterNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Bill payment failed");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bill payment failed");
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <p className="mt-2 text-xs text-accent">
        Payment sent. Refresh the page to see the receipt.
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
        Pay an electricity bill
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-line pt-3">
      {loadError && <p className="text-xs text-warn">{loadError}</p>}
      {!billers && !loadError && (
        <p className="text-xs text-ink-dim">Loading billers...</p>
      )}
      {billers && (
        <div className="flex flex-wrap gap-2">
          {billers.map((b) => (
            <button
              type="button"
              key={b.id}
              onClick={() => setBillerId(b.id)}
              className={`px-3 py-1.5 text-xs border transition ${
                billerId === b.id
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-line text-ink-dim hover:border-ink-dim"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}
      <input
        type="text"
        required
        placeholder="Meter or account number"
        value={meterNumber}
        onChange={(e) => setMeterNumber(e.target.value)}
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
          {pending ? "Sending..." : "Pay bill"}
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
