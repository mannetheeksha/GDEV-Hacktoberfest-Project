"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type CapsuleSummary = { id: string; author: string; unlockDate: string; sealedAt: string };

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
    <div className="min-h-screen py-12 px-4" style={{ background: "#fdf8f0" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm block mb-1" style={{ color: "#E21833" }}>← Home</Link>
            <h1 className="text-3xl font-bold" style={{ color: "#E21833" }}>The Vault 🏛️</h1>
            {wallet && (
              <p className="text-gray-500 text-sm mt-1">
                {capsules ? `${capsules.length} capsule${capsules.length === 1 ? "" : "s"}` : "Opening the vault..."} for{" "}
                <span className="font-mono">{wallet.slice(0, 4)}...{wallet.slice(-4)}</span>{" "}
                <button onClick={changeWallet} className="underline" style={{ color: "#E21833" }}>
                  change
                </button>
              </p>
            )}
          </div>
          <button
            onClick={toggleSkip}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all"
            style={{
              borderColor: skipToGrad ? "#FFD200" : "#ccc",
              background: skipToGrad ? "#FFD200" : "white",
              color: skipToGrad ? "#1a1a1a" : "#888",
            }}
            title="Unlocks all capsules for demo purposes"
          >
            ⏩ Skip to Graduation
          </button>
        </div>

        {/* Ask whose vault this is */}
        {mounted && !wallet && (
          <form onSubmit={chooseWallet} className="bg-white rounded-2xl p-8 shadow-sm border-2 text-center" style={{ borderColor: "#FFD200" }}>
            <div className="text-5xl mb-3">👛</div>
            <h2 className="font-bold text-gray-800 text-lg mb-1">Your wallet is your key</h2>
            <p className="text-sm text-gray-500 mb-4">Paste the Solana wallet address you sealed your capsules with.</p>
            <input
              type="text"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              required
              placeholder="e.g. 7xKqP3..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2"
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

        {/* Capsule list */}
        <div className="flex flex-col gap-4">
          {capsules?.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-500 border border-gray-100">
              <div className="text-5xl mb-3">🐢</div>
              No capsules for this wallet yet. Testudo is waiting for your first one!
            </div>
          )}
          {capsules?.map((cap) => {
            const isUnlocked = skipToGrad || !isLocked(cap);
            return (
              <div
                key={cap.id}
                className="bg-white rounded-2xl p-6 shadow-sm border flex items-center justify-between"
                style={{ borderColor: isUnlocked ? "#FFD200" : "#e5e7eb" }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{isUnlocked ? "📬" : "🔒"}</span>
                    <span className="font-bold text-gray-800">{cap.author}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Sealed {new Date(cap.sealedAt).toLocaleDateString()}
                  </p>
                  <p
                    className="text-sm font-medium mt-1"
                    style={{ color: isUnlocked ? "#16a34a" : "#6b7280" }}
                  >
                    {isUnlocked ? "Ready to open ✅" : getCountdown(cap.unlockDate)}
                  </p>
                </div>
                {isUnlocked ? (
                  <Link
                    href={`/capsule/${cap.id}`}
                    className="px-5 py-2 rounded-full font-semibold text-sm shadow-sm transition-transform hover:scale-105"
                    style={{ background: "#E21833", color: "white" }}
                  >
                    Open →
                  </Link>
                ) : (
                  <div
                    className="px-5 py-2 rounded-full text-sm font-semibold"
                    style={{ background: "#f3f4f6", color: "#9ca3af" }}
                  >
                    Locked
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Write new */}
        <div className="mt-10 text-center">
          <Link
            href="/write"
            className="inline-block px-8 py-3 rounded-full font-bold text-base shadow-md transition-transform hover:scale-105"
            style={{ background: "#E21833", color: "white" }}
          >
            ✍️ Write a new capsule
          </Link>
        </div>
      </div>
    </div>
  );
}
