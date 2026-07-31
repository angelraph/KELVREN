"use client";

import { useRef, useState } from "react";

const AVATAR_SIZE = 256;

async function resizeToAvatar(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

  return canvas.toDataURL("image/jpeg", 0.85);
}

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

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file");
      return;
    }
    // Phone camera photos are routinely 5-15MB - far past what an avatar
    // needs. Downscale to a small square client-side instead of rejecting
    // large source files, so any normal photo just works.
    if (file.size > 25_000_000) {
      setError("That image is too large to process");
      return;
    }

    setError(null);
    setPending(true);
    try {
      const dataUrl = await resizeToAvatar(file);
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
