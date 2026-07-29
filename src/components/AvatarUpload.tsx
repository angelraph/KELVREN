"use client";

import { useRef, useState } from "react";

export function AvatarUpload({
  name,
  email,
  image,
}: {
  name: string | null;
  email: string;
  image: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(image);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initial = (name ?? email)[0]?.toUpperCase();

  function handlePick() {
    inputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file");
      return;
    }
    if (file.size > 1_500_000) {
      setError("Image is too large (max ~1MB)");
      return;
    }

    setError(null);
    setPending(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Could not save photo");
        }
        setPreview(dataUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save photo");
      } finally {
        setPending(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={handlePick}
        disabled={pending}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-accent-soft text-accent text-xl font-medium shrink-0 overflow-hidden disabled:opacity-50"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </button>
      <div>
        <button
          type="button"
          onClick={handlePick}
          disabled={pending}
          className="text-sm text-accent underline disabled:opacity-50"
        >
          {pending ? "Uploading..." : preview ? "Change photo" : "Add a photo"}
        </button>
        {error && <p className="mt-1 text-xs text-warn">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
