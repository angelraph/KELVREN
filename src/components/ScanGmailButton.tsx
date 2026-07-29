"use client";

import { useState } from "react";

export function ScanGmailButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/gmail/scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }
      window.location.href = `/dashboard?scanned=${data.created}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="text-sm text-ink-dim hover:text-ink transition disabled:opacity-50"
      >
        {pending ? "Scanning Gmail..." : "Scan Gmail"}
      </button>
      {error && <p className="text-xs text-warn">{error}</p>}
    </div>
  );
}
