"use client";

import { useState } from "react";
import type { MandateStatus } from "@/generated/prisma/enums";

export function MandateActions({
  mandateId,
  status,
}: {
  mandateId: string;
  status: MandateStatus;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "pause" | "resume" | "cancel") {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/prava/mandates/${mandateId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
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

  if (status !== "ACTIVE" && status !== "PAUSED") {
    return null;
  }

  return (
    <div className="flex items-center gap-3 mt-1">
      {status === "ACTIVE" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run("pause")}
          className="text-xs text-ink-dim hover:text-ink transition disabled:opacity-50"
        >
          Pause
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run("resume")}
          className="text-xs text-ink-dim hover:text-ink transition disabled:opacity-50"
        >
          Resume
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => run("cancel")}
        className="text-xs text-warn hover:opacity-80 transition disabled:opacity-50"
      >
        Cancel
      </button>
      {error && <p className="text-xs text-warn">{error}</p>}
    </div>
  );
}
