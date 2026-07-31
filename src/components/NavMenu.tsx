"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/lib/actions";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/onboarding", label: "Add a limit" },
  { href: "/profile", label: "Profile" },
];

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Menu"
        onClick={() => setOpen((o) => !o)}
        className="flex flex-col gap-1.5 p-2 -m-2"
      >
        <span className="block w-5 h-px bg-ink" />
        <span className="block w-5 h-px bg-ink" />
        <span className="block w-5 h-px bg-ink" />
      </button>

      {open && (
        <div className="card absolute right-0 mt-3 w-48 py-1.5 z-10 overflow-hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-ink-dim hover:text-ink hover:bg-accent-soft transition"
            >
              {link.label}
            </Link>
          ))}
          <div className="my-1.5 h-px bg-line" />
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full text-left px-4 py-2.5 text-sm text-warn hover:bg-warn-soft transition"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
