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
        className="w-full bg-transparent border border-line px-3 py-2 pr-16 text-sm text-ink outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-dim hover:text-ink transition"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
