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
  const [viewing, setViewing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initial = (name ?? email)[0]?.toUpperCase();

  function handlePick() {
    setViewing(false);
    inputRef.current?.click();
  }

  function handleAvatarClick() {
    if (preview) {
      setViewing(true);
    } else {
      handlePick();
    }
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
    <>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={pending}
          className="relative flex items-center justify-center w-16 h-16 rounded-full bg-accent-soft text-accent text-xl font-medium shrink-0 overflow-hidden ring-1 ring-line hover:opacity-90 transition disabled:opacity-50"
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
            onClick={preview ? () => setViewing(true) : handlePick}
            disabled={pending}
            className="text-sm text-accent underline disabled:opacity-50"
          >
            {pending ? "Uploading..." : preview ? "View photo" : "Add a photo"}
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

      {viewing && preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-5"
          onClick={() => setViewing(false)}
        >
          <div className="card p-6 max-w-xs w-full text-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              className="mx-auto w-48 h-48 rounded-full object-cover ring-1 ring-line"
            />
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handlePick}
                className="bg-accent text-paper rounded-xl px-5 py-2.5 text-sm font-medium tracking-wide hover:opacity-90 transition"
              >
                Change photo
              </button>
              <button
                type="button"
                onClick={() => setViewing(false)}
                className="text-sm text-ink-dim hover:text-ink transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
