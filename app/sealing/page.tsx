"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const LOADING_STEPS = [
  "Testudo is guarding your capsule...",
  "Pressing the wax seal...",
  "Asking Solana to remember this forever...",
  "Sealed. ✅",
];

export default function SealingPage() {
  const [step, setStep] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const [saved, setSaved] = useState<{ id: string; explorerUrl: string } | null>(null);
  const [error, setError] = useState("");
  const startedSaving = useRef(false);

  // Only show "Sealed" once the animation AND the save are both finished
  const done = animationDone && saved !== null;

  // Save the capsule from /write
  useEffect(() => {
    if (startedSaving.current) return; // React dev mode runs effects twice — don't save twice
    startedSaving.current = true;

    const draft = sessionStorage.getItem("capsuleDraft");
    if (!draft) {
      setError("Nothing to seal — write a capsule first.");
      return;
    }

    fetch("/api/seal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: draft,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        sessionStorage.removeItem("capsuleDraft");
        setSaved(data);
      })
      .catch((err) => setError(err.message || "Something went wrong while sealing."));
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    LOADING_STEPS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setStep(i);
          if (i === LOADING_STEPS.length - 1) {
            setTimeout(() => setAnimationDone(true), 600);
          }
        }, i * 1400)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d0a0a 100%)" }}
    >
      {/* Wax seal animation */}
      <div
        className="text-9xl mb-8 transition-all duration-700"
        style={{
          transform: done ? "scale(1.1)" : "scale(1)",
          filter: done ? "drop-shadow(0 0 24px #FFD200)" : "drop-shadow(0 0 8px #E21833)",
        }}
      >
        {done ? "🪙" : "🔐"}
      </div>

      {error ? (
        <div className="text-center max-w-md">
          <p className="text-xl mb-6" style={{ color: "#FFD200" }}>⚠️ {error}</p>
          <Link
            href="/write"
            className="inline-block px-8 py-3 rounded-full font-bold shadow-xl"
            style={{ background: "#E21833", color: "white" }}
          >
            ← Back to writing
          </Link>
        </div>
      ) : !done ? (
        <div className="text-center">
          <p
            className="text-xl md:text-2xl font-medium transition-opacity duration-500"
            style={{ color: "#FFD200" }}
          >
            {LOADING_STEPS[step]}
          </p>
          {/* Progress dots */}
          <div className="flex gap-2 justify-center mt-6">
            {LOADING_STEPS.map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  background: i <= step ? "#FFD200" : "#444",
                  transform: i === step ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#FFD200" }}>
            Sealed on Solana! 🎉
          </h2>
          <p className="text-white/70 mb-6">
            Your capsule is now permanently recorded on the Solana devnet blockchain. Nobody can edit or backdate it.
          </p>

          {/* Explorer link appears once Step 5 sends the real transaction */}
          {saved?.explorerUrl && (
            <a
              href={saved.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mb-6 px-5 py-2 rounded-full text-sm font-mono transition-opacity hover:opacity-80"
              style={{ background: "#1a1a2e", color: "#FFD200", border: "1px solid #FFD200" }}
            >
              View on Solana Explorer ↗
            </a>
          )}

          <div>
            <Link
              href="/vault"
              className="inline-block px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-transform hover:scale-105"
              style={{ background: "#E21833", color: "white" }}
            >
              Go to the Vault →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
