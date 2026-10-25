"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { OpenedCapsule } from "@/lib/capsules";
import { classYear } from "@/lib/badge";

export default function OpenCapsule({
  id,
  author,
  secretQuestion,
}: {
  id: string;
  author: string;
  secretQuestion?: string;
}) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [capsule, setCapsule] = useState<OpenedCapsule | null>(null);
  const verified = true; // Step 6: /api/verify will check this against Solana

  async function tryOpen(answerToSend: string) {
    setChecking(true);
    setError("");
    const res = await fetch("/api/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, answer: answerToSend }),
    });
    const data = await res.json();
    setChecking(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setCapsule(data);
  }

  // Older capsules have no secret question — open them straight away
  useEffect(() => {
    if (!secretQuestion) tryOpen("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Locked: ask the secret question ----------
  if (!capsule) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center" style={{ background: "#fdf8f0" }}>
        <div className="max-w-md mx-auto w-full">
          <Link href="/vault" className="text-sm block mb-6" style={{ color: "#E21833" }}>
            ← Back to vault
          </Link>

          {secretQuestion ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                tryOpen(answer);
              }}
              className="bg-white rounded-3xl p-8 shadow-md border-2 text-center"
              style={{ borderColor: "#FFD200" }}
            >
              <div className="text-6xl mb-4">🔑</div>
              <p className="text-gray-500 mb-2">Testudo has one question for you, {author}:</p>
              <h1 className="text-2xl font-bold mb-6" style={{ color: "#E21833" }}>
                {secretQuestion}
              </h1>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                autoFocus
                placeholder="Your answer"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-center focus:outline-none focus:ring-2"
              />
              {error && <p className="text-sm mt-3" style={{ color: "#dc2626" }}>{error}</p>}
              <button
                type="submit"
                disabled={checking}
                className="w-full mt-5 py-3 rounded-full font-bold text-lg shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
                style={{ background: "#E21833", color: "white" }}
              >
                {checking ? "Testudo is checking..." : "🔓 Unlock my capsule"}
              </button>
              <p className="text-xs text-gray-400 mt-3">Not case sensitive.</p>
            </form>
          ) : (
            <p className="text-center text-gray-500">{error || "Opening the capsule..."}</p>
          )}
        </div>
      </div>
    );
  }

  // ---------- Unlocked: show everything ----------
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "#fdf8f0" }}>
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <Link href="/vault" className="text-sm block mb-6" style={{ color: "#E21833" }}>
          ← Back to vault
        </Link>

        {/* Verification banner */}
        {verified ? (
          <div
            className="rounded-2xl px-5 py-3 mb-6 flex items-center gap-3 text-sm font-semibold"
            style={{ background: "#dcfce7", color: "#15803d" }}
          >
            <span className="text-lg">✅</span>
            Verified on Solana — Unedited since {new Date(capsule.sealedAt).toLocaleDateString()}
          </div>
        ) : (
          <div
            className="rounded-2xl px-5 py-3 mb-6 flex items-center gap-3 text-sm font-semibold"
            style={{ background: "#fef2f2", color: "#dc2626" }}
          >
            <span className="text-lg">⚠️</span>
            Hash mismatch — this capsule may have been tampered with
          </div>
        )}

        {/* Author + date */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ background: "#E21833", color: "white" }}
            >
              {capsule.author[0]}
            </div>
            <div>
              <p className="font-bold text-gray-800">{capsule.author}</p>
              <p className="text-xs text-gray-400">
                Sealed {new Date(capsule.sealedAt).toLocaleDateString(undefined, {
                  year: "numeric", month: "long", day: "numeric"
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Letter */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-5">
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>📜</span> Their Letter
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
            {capsule.letter}
          </p>
        </div>

        {/* Photos */}
        {(capsule.photoUrls.some(Boolean) || capsule.photoCaptions.some(Boolean)) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-5">
            <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>📷</span> Their Photos
            </h2>
            <div className="flex flex-col gap-5">
              {capsule.photoUrls.map((url, i) => (
                <figure key={i}>
                  {/* A slot can have a caption with no photo */}
                  {url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={capsule.photoCaptions[i] || `Photo ${i + 1}`} className="w-full rounded-xl" />
                  )}
                  {capsule.photoCaptions[i] && (
                    <figcaption className="text-sm text-gray-500 italic mt-2 text-center">
                      {capsule.photoCaptions[i]}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}

        {/* Semester notes */}
        {capsule.notes && (
          <div
            className="rounded-2xl p-6 shadow-sm mb-5 border"
            style={{ background: "#fffbeb", borderColor: "#FFD200" }}
          >
            <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: "#92400e" }}>
              <span>📝</span> Semester Notes
            </h2>
            <p className="leading-relaxed text-base whitespace-pre-line" style={{ color: "#78350f" }}>
              {capsule.notes}
            </p>
          </div>
        )}

        {/* Badge (filled in by Step 7) */}
        {capsule.badgeMintAddress && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/badge/${classYear(capsule.unlockDate)}`} alt="Terp badge" className="w-48 h-48 mx-auto mb-3 rounded-full" />
            <h2 className="font-bold text-gray-800 mb-1">Terp Class of {classYear(capsule.unlockDate)} Badge Minted!</h2>
            <p className="text-xs text-gray-400 font-mono mb-4">{capsule.badgeMintAddress}</p>
            <a
              href={`https://explorer.solana.com/address/${capsule.badgeMintAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "#FFD200", color: "#1a1a1a" }}
            >
              View badge on Explorer ↗
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
