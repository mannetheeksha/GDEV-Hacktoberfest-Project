"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const STEPS = ["Preparing", "Sealing", "Recording on Solana", "Complete"];
const STEP_TEXT = [
  "Testudo is guarding your capsule...",
  "Pressing the wax seal...",
  "Asking Solana to remember this forever...",
  "Sealed. ✅",
];
const SEALING_AT_MS = 1200;    // letter starts going into the envelope
const RECORDING_AT_MS = 3800;  // seal is stamped; now we wait for Solana
const RECORD_AT_LEAST_MS = 5000;

// Fixed positions so the server and browser draw the same sparkles
const SPARKLES = [
  [8, 12, 0], [22, 70, 0.6], [35, 20, 1.2], [70, 15, 0.3], [85, 60, 0.9],
  [92, 25, 1.5], [15, 45, 1.8], [60, 85, 0.4], [78, 88, 1.1], [45, 8, 2],
];
const PHOTO_SPOTS = [
  { left: "6%", top: "18%", tilt: "-8deg", delay: "0s" },
  { left: "8%", top: "58%", tilt: "6deg", delay: "1.2s" },
  { right: "7%", top: "30%", tilt: "9deg", delay: "0.6s" },
];
const PLACEHOLDERS = ["🐢", "📚", "🏈"];

export default function SealingPage() {
  const [phase, setPhase] = useState(0); // 0 Preparing → 1 Sealing → 2 Recording
  const [recordedLongEnough, setRecordedLongEnough] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saved, setSaved] = useState<{ id: string; explorerUrl: string } | null>(null);
  const [error, setError] = useState("");
  const startedSaving = useRef(false);

  // Only show "Complete" once the animation AND the save are both finished
  const done = recordedLongEnough && saved !== null;
  const currentStep = done ? 3 : phase;

  // Save the capsule from /write
  useEffect(() => {
    if (startedSaving.current) return; // React dev mode runs effects twice — don't save twice
    startedSaving.current = true;

    const draft = sessionStorage.getItem("capsuleDraft");
    if (!draft) {
      setError("Nothing to seal — write a capsule first.");
      return;
    }
    setPhotos((JSON.parse(draft).photoUrls || []).filter(Boolean));

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

  // Animation timeline
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), SEALING_AT_MS),
      setTimeout(() => setPhase(2), RECORDING_AT_MS),
      setTimeout(() => setRecordedLongEnough(true), RECORD_AT_LEAST_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "radial-gradient(ellipse at 50% 45%, #5a0d18 0%, #2a060b 55%, #120305 100%)" }}
    >
      {/* Sparkles */}
      {SPARKLES.map(([x, y, delay], i) => (
        <span
          key={i}
          className="twinkle absolute pointer-events-none"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s`, color: i % 3 ? "#FFD200" : "#ffffff", fontSize: i % 2 ? 14 : 20 }}
        >
          ✦
        </span>
      ))}

      {/* Floating polaroids: their photos, or cute placeholders */}
      {PHOTO_SPOTS.map((spot, i) => (
        <div
          key={i}
          className="float-photo hidden md:block absolute bg-white p-2 pb-6 shadow-2xl rounded-sm"
          style={{ left: spot.left, right: spot.right, top: spot.top, animationDelay: spot.delay, "--tilt": spot.tilt } as React.CSSProperties}
        >
          {photos[i] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photos[i]} alt="" className="w-24 h-24 object-cover" />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center text-4xl" style={{ background: "#fdf3e1" }}>
              {PLACEHOLDERS[i]}
            </div>
          )}
        </div>
      ))}

      <h1 className="font-display relative text-4xl md:text-5xl font-bold text-center mb-8" style={{ color: "#FFD200" }}>
        {done ? "Sealed on Solana! 🎉" : "Sealing your capsule..."}
      </h1>

      {error ? (
        <div className="relative text-center max-w-md">
          <p className="text-xl mb-6" style={{ color: "#FFD200" }}>⚠️ {error}</p>
          <Link
            href="/write"
            className="inline-block px-8 py-3 rounded-full font-bold shadow-xl"
            style={{ background: "#E21833", color: "white" }}
          >
            ← Back to writing
          </Link>
        </div>
      ) : (
        <>
          <SealingEnvelope sealing={phase >= 1} recording={phase >= 2 && !done} done={done} />

          {/* Progress: Preparing → Sealing → Recording on Solana → Complete */}
          <div className="relative w-full max-w-lg mt-10 flex items-start">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center relative">
                {i > 0 && (
                  <div
                    className="absolute top-2 right-1/2 w-full h-0.5 transition-colors duration-700"
                    style={{ background: i <= currentStep ? "#FFD200" : "rgba(255,255,255,0.2)" }}
                  />
                )}
                <div
                  className="relative z-10 w-4 h-4 rounded-full transition-all duration-500"
                  style={{
                    background: i <= currentStep ? "#FFD200" : "rgba(255,255,255,0.25)",
                    boxShadow: i === currentStep ? "0 0 0 5px rgba(255,210,0,0.25)" : "none",
                  }}
                />
                <span className="mt-2 text-xs text-center" style={{ color: i <= currentStep ? "#fff3c4" : "rgba(255,255,255,0.45)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p className="relative mt-6 text-white/70 text-center min-h-6">{STEP_TEXT[currentStep]}</p>

          {done && saved && (
            <div className="fade-up relative mt-6 flex flex-col items-center gap-4">
              <a
                href={saved.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-full text-sm font-mono transition-opacity hover:opacity-80"
                style={{ background: "rgba(0,0,0,0.35)", color: "#FFD200", border: "1px solid #FFD200" }}
              >
                View on Solana Explorer ↗
              </a>
              <Link
                href="/vault"
                className="px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-transform hover:scale-105"
                style={{ background: "#FFD200", color: "#1a1a1a" }}
              >
                Go to the Vault →
              </Link>
            </div>
          )}

          {!done && (
            <p className="relative mt-8 text-sm text-white/40 text-center">Your memories are being sealed and recorded on the blockchain.</p>
          )}
        </>
      )}
    </div>
  );
}

// The letter slides into the envelope, the flap closes and the wax seal stamps down
function SealingEnvelope({ sealing, recording, done }: { sealing: boolean; recording: boolean; done: boolean }) {
  const INK = "#3a1d0e";
  return (
    <div className="relative w-[min(80vw,340px)]">
      {/* golden swirl while Solana records it */}
      <div className={`absolute -inset-8 transition-opacity duration-700 pointer-events-none ${recording ? "opacity-100" : "opacity-0"}`}>
        <div className="orbit absolute inset-0 rounded-full border-4 border-transparent" style={{ borderTopColor: "#FFD200", borderRightColor: "rgba(255,210,0,0.4)" }} />
        <div className="orbit-reverse absolute inset-6 rounded-full border-2 border-transparent" style={{ borderBottomColor: "#ffe9a0", borderLeftColor: "rgba(255,233,160,0.4)" }} />
      </div>

      <svg viewBox="0 -110 300 330" className={`relative w-full ${sealing ? "sealing" : ""} ${done ? "glow-pulse" : ""}`} aria-label="Your letter being sealed in an envelope">
        <defs>
          <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffaf0" />
            <stop offset="1" stopColor="#f4e6c8" />
          </linearGradient>
          <radialGradient id="wax" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#ff5a6e" />
            <stop offset="0.55" stopColor="#E21833" />
            <stop offset="1" stopColor="#7a0b1b" />
          </radialGradient>
          {/* the letter is trimmed at the envelope's bottom edge, so it never pokes out below */}
          <clipPath id="insideEnvelope">
            <rect x="0" y="-200" width="300" height="410" />
          </clipPath>
        </defs>

        {/* back of the envelope + open flap */}
        <rect x="20" y="60" width="260" height="150" rx="10" fill="#ead6b0" stroke={INK} strokeWidth="4" />
        <polygon className="seal-flap-open" points="20,62 280,62 150,-30" fill="#e3cca0" stroke={INK} strokeWidth="4" strokeLinejoin="round" />

        {/* the letter */}
        <g clipPath="url(#insideEnvelope)">
        <g className="seal-letter">
          <rect x="48" y="-45" width="204" height="130" rx="5" fill="url(#paper)" stroke={INK} strokeWidth="3" />
          <text x="66" y="-18" fontFamily="Georgia, serif" fontStyle="italic" fontSize="15" fill="#7a4b1d">Dear future me,</text>
          {[0, 18, 36, 54].map((dy) => (
            <line key={dy} x1="66" y1={2 + dy} x2={dy === 54 ? 170 : 232} y2={2 + dy} stroke="#d9c49c" strokeWidth="4" strokeLinecap="round" />
          ))}
        </g>
        </g>

        {/* front pocket */}
        <path d="M20,100 L150,168 L280,100 L280,200 Q280,210 270,210 L30,210 Q20,210 20,200 Z" fill="url(#paper)" stroke={INK} strokeWidth="4" strokeLinejoin="round" />

        {/* closed flap + wax seal */}
        <polygon className="seal-flap-closed" points="20,62 280,62 150,150" fill="#f7ead0" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <g className="wax-stamp">
          <circle cx="150" cy="148" r="30" fill="url(#wax)" stroke="#5a0814" strokeWidth="3" />
          <circle cx="150" cy="148" r="21" fill="none" stroke="#8c0d1f" strokeWidth="2.5" opacity="0.7" />
          <text x="150" y="158" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize="28" fill="#FFD200">T</text>
        </g>
      </svg>
    </div>
  );
}
