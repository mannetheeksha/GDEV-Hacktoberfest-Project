"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DarkRoom from "../components/DarkRoom";
import YearEmblem, { type Year } from "../components/YearEmblem";
import GraduationCountdown from "../components/GraduationCountdown";

type CapsuleSummary = { id: string; author: string; unlockDate: string; sealedAt: string };

// Each card is named after the school year it was written in
const YEARS: { label: string; year: Year }[] = [
  { label: "Freshman Year", year: "freshman" },
  { label: "Sophomore Year", year: "sophomore" },
  { label: "Junior Year", year: "junior" },
  { label: "Senior Year", year: "senior" },
];

// e.g. sealed Oct 2026, graduating May 2029 → the 2026–27 school year → Sophomore
function schoolYear(cap: CapsuleSummary) {
  const sealed = new Date(cap.sealedAt);
  const schoolYearEnds = sealed.getMonth() >= 6 ? sealed.getFullYear() + 1 : sealed.getFullYear(); // July starts a new year
  const yearsLeft = new Date(cap.unlockDate).getFullYear() - schoolYearEnds;
  if (yearsLeft < 0) return { label: "Alumni Letter", year: "alumni" as Year };
  return YEARS[Math.max(0, 3 - yearsLeft)];
}

export default function VaultPage() {
  const [skipToGrad, setSkipToGrad] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [capsules, setCapsules] = useState<CapsuleSummary[] | null>(null);
  const [wallet, setWallet] = useState("");      // whose vault we're showing
  const [walletInput, setWalletInput] = useState("");

  useEffect(() => {
    setMounted(true);
    setSkipToGrad(sessionStorage.getItem("skipToGrad") === "true");
    setWallet(localStorage.getItem("myWallet") || "");
  }, []);

  // Your wallet is your identity: only load that wallet's capsules
  useEffect(() => {
    if (!wallet) return;
    setCapsules(null);
    fetch(`/api/capsules?wallet=${encodeURIComponent(wallet)}`)
      .then((res) => res.json())
      .then(setCapsules);
  }, [wallet]);

  function chooseWallet(e: React.FormEvent) {
    e.preventDefault();
    const w = walletInput.trim();
    localStorage.setItem("myWallet", w);
    setWallet(w);
  }

  function changeWallet() {
    localStorage.removeItem("myWallet");
    setWallet("");
    setWalletInput("");
    setCapsules(null);
  }

  function isLocked(cap: CapsuleSummary): boolean {
    return new Date(cap.unlockDate).getTime() > Date.now();
  }

  function getCountdown(unlockDate: string): string {
    if (!mounted) return "...";
    const now = new Date();
    const unlock = new Date(unlockDate);
    const diff = unlock.getTime() - now.getTime();
    if (diff <= 0) return "Ready to open";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const years = Math.floor(days / 365);
    const remaining = days % 365;
    if (years > 0) return `${years}y ${remaining}d remaining`;
    return `${days} days remaining`;
  }

  function toggleSkip() {
    const next = !skipToGrad;
    setSkipToGrad(next);
    sessionStorage.setItem("skipToGrad", String(next));
  }

  return (
    <DarkRoom className="px-4 pb-16">
      {/* Nav */}
      <nav className="relative max-w-4xl mx-auto flex items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold" style={{ color: "#f5d77a" }}>
          <span className="w-8 h-8 rounded-md flex items-center justify-center text-sm" style={{ background: "#E21833" }}>
            🐢
          </span>
          Terp Time Capsule
        </Link>
        <Link
          href="/write"
          className="px-4 py-2 rounded-full text-sm font-bold shadow-md transition-transform hover:scale-105"
          style={{ background: "#E21833", color: "white" }}
        >
          + New Capsule
        </Link>
      </nav>

      <div className="relative max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-center mt-4 mb-8">
          <h1 className="font-display text-5xl font-bold drop-shadow-lg" style={{ color: "#fbe9c6" }}>
            The Vault 🏛️
          </h1>
          <p className="text-white/70 mt-2">Your time capsules through the years.</p>

          {wallet && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="text-white/70">
                {capsules ? `${capsules.length} capsule${capsules.length === 1 ? "" : "s"}` : "Opening the vault..."} for{" "}
                <span className="font-mono">{wallet.slice(0, 4)}...{wallet.slice(-4)}</span>{" "}
                <button onClick={changeWallet} className="underline" style={{ color: "#f5d77a" }}>
                  change
                </button>
              </span>
              <button
                onClick={toggleSkip}
                className="px-4 py-1.5 rounded-full font-semibold border-2 transition-all"
                style={{
                  borderColor: skipToGrad ? "#FFD200" : "rgba(255,255,255,0.3)",
                  background: skipToGrad ? "#FFD200" : "rgba(0,0,0,0.3)",
                  color: skipToGrad ? "#1a1a1a" : "rgba(255,255,255,0.8)",
                  boxShadow: skipToGrad ? "0 0 24px rgba(255,210,0,0.5)" : "none",
                }}
                title="Unlocks all capsules for demo purposes"
              >
                ⏩ Skip to Graduation
              </button>
            </div>
          )}
        </div>

        {/* Ask whose vault this is */}
        {mounted && !wallet && (
          <form onSubmit={chooseWallet} className="max-w-md mx-auto rounded-3xl p-8 border-2 text-center" style={{ background: "#fffaf0", borderColor: "#FFD200", boxShadow: "0 0 60px rgba(255,190,90,0.25)" }}>
            <div className="text-5xl mb-3">👛</div>
            <h2 className="font-display font-bold text-gray-800 text-2xl mb-1">Your wallet is your key</h2>
            <p className="text-sm text-gray-500 mb-4">Paste the Solana wallet address you sealed your capsules with.</p>
            <input
              type="text"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              required
              placeholder="e.g. 7xKqP3..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-[#fffdf8] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
            />
            <button
              type="submit"
              className="w-full mt-4 py-3 rounded-full font-bold shadow-md transition-transform hover:scale-105"
              style={{ background: "#E21833", color: "white" }}
            >
              Show my capsules
            </button>
          </form>
        )}

        {/* Empty vault */}
        {capsules?.length === 0 && (
          <div className="max-w-md mx-auto rounded-3xl p-10 text-center text-gray-600" style={{ background: "#fffaf0", boxShadow: "0 0 60px rgba(255,190,90,0.2)" }}>
            <div className="text-6xl mb-3">🐢</div>
            <p>No capsules for this wallet yet. Testudo is waiting for your first one!</p>
            <Link
              href="/write"
              className="inline-block mt-5 px-6 py-3 rounded-full font-bold shadow-md transition-transform hover:scale-105"
              style={{ background: "#E21833", color: "white" }}
            >
              ✍️ Write your first capsule
            </Link>
          </div>
        )}

        {/* Live countdown to graduation, above the cards */}
        {mounted && capsules && capsules.length > 0 && (
          <GraduationCountdown unlockDates={capsules.map((c) => c.unlockDate)} skipped={skipToGrad} />
        )}

        {/* Capsule grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {capsules?.map((cap, i) => {
            const isUnlocked = skipToGrad || !isLocked(cap);
            const year = schoolYear(cap);
            const card = (
              <div
                className="fade-up group h-full rounded-3xl p-4 border-2 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "#fffaf0",
                  borderColor: isUnlocked ? "#FFD200" : "rgba(212,167,44,0.35)",
                  boxShadow: isUnlocked ? "0 0 40px rgba(255,210,0,0.35)" : "0 0 30px rgba(255,190,90,0.12)",
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                {/* Illustration tile */}
                <div
                  className="relative h-40 rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{ background: "radial-gradient(circle at 50% 45%, #5a3a22 0%, #2a1a10 60%, #150c06 100%)" }}
                >
                  <div className="lantern-glow absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,200,100,0.35), transparent 60%)" }} />
                  <span className="twinkle absolute top-3 left-4 text-yellow-300 text-sm">✦</span>
                  <span className="twinkle absolute bottom-4 right-8 text-yellow-200 text-xs" style={{ animationDelay: "0.8s" }}>✦</span>
                  <span className="twinkle absolute bottom-5 left-10 text-yellow-300 text-xs" style={{ animationDelay: "1.6s" }}>✦</span>
                  <YearEmblem
                    year={year.year}
                    className="relative h-32 drop-shadow-[0_0_14px_rgba(255,210,0,0.45)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                  />
                  <span
                    className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={isUnlocked ? { background: "#FFD200", color: "#1a1a1a" } : { background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.85)" }}
                  >
                    {isUnlocked ? "Ready ✨" : "🔒 Locked"}
                  </span>
                </div>

                <div className="px-1 pt-3 flex items-end justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-bold text-gray-900">{year.label}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Sealed {new Date(cap.sealedAt).toLocaleDateString()}</p>
                    <p className="text-sm mt-1" style={{ color: isUnlocked ? "#16a34a" : "#6b7280" }}>
                      {isUnlocked ? "Ready to open" : getCountdown(cap.unlockDate)}
                    </p>
                  </div>
                  {isUnlocked && (
                    <span className="shrink-0 px-4 py-2 rounded-full text-sm font-bold shadow-sm" style={{ background: "#E21833", color: "white" }}>
                      Open →
                    </span>
                  )}
                </div>
              </div>
            );
            return isUnlocked ? (
              <Link key={cap.id} href={`/capsule/${cap.id}`} aria-label={`Open ${year.label} capsule`}>
                {card}
              </Link>
            ) : (
              <div key={cap.id}>{card}</div>
            );
          })}
        </div>
      </div>
    </DarkRoom>
  );
}
