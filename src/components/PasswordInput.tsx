"use client";

import { useState } from "react";

export function PasswordInput({
  name,
  placeholder,
  minLength,
}: {
  name: string;
  placeholder: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        required
        minLength={minLength}
        placeholder={placeholder}
        className="w-full bg-surface border border-line rounded-xl px-4 py-3 pr-16 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-dim hover:text-ink transition"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
