"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VaultDoor from "./components/VaultDoor";

const DOOR_OPEN_MS = 2400; // wheel spins, then the door swings open

export default function Home() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const navigating = useRef(false);

  // Any first click, tap or key press opens the vault
  function openVault() {
    setOpen(true);
  }

  // The two big buttons: open the vault, then walk through it
  function goThrough(e: React.MouseEvent, href: string) {
    e.preventDefault();
    e.stopPropagation();
    if (navigating.current) return;
    navigating.current = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOpen(true);
    setTimeout(() => router.push(href), open || reduceMotion ? 300 : DOOR_OPEN_MS);
  }

  // Runs every time this page is shown — including coming Back to it,
  // since Next keeps the page alive in the background: close the door and allow clicks again
  useEffect(() => {
    setOpen(false);
    navigating.current = false;
    router.prefetch("/write");
    router.prefetch("/vault");
    window.addEventListener("keydown", openVault, { once: true });
    return () => window.removeEventListener("keydown", openVault);
  }, [router]);

  return (
    <div
      onPointerDown={openVault}
      className="relative min-h-screen overflow-hidden flex flex-col items-center px-4 pb-10"
      style={{
        background:
          "radial-gradient(ellipse at 50% 45%, #3b2618 0%, #1e130c 55%, #0d0805 100%)",
      }}
    >
      {/* stone wall texture */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 46px, rgba(0,0,0,0.6) 46px 48px), repeating-linear-gradient(90deg, transparent 0 94px, rgba(0,0,0,0.45) 94px 96px)",
        }}
      />

      {/* Banners + lanterns (wider screens) */}
      <Banner side="left" />
      <Banner side="right" />
      <Lantern side="left" />
      <Lantern side="right" />

      {/* Nav */}
      <nav className="relative z-10 w-full max-w-6xl flex items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold" style={{ color: "#f5d77a" }}>
          <span className="w-8 h-8 rounded-md flex items-center justify-center text-sm" style={{ background: "#E21833", color: "#FFD200" }}>
            🐢
          </span>
          Terp Time Capsule
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/" className="hidden sm:inline text-white/80 hover:text-white">Home</Link>
          <Link href="/vault" onClick={(e) => goThrough(e, "/vault")} className="hidden sm:inline text-white/80 hover:text-white">Vault</Link>
          <Link
            href="/write"
            onClick={(e) => goThrough(e, "/write")}
            className="px-4 py-2 rounded-full font-semibold shadow-lg transition-transform hover:scale-105"
            style={{ background: "#E21833", color: "white" }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Title */}
      <div className="relative z-10 text-center mt-4 md:mt-8">
        <h1 className="font-display text-5xl md:text-7xl font-bold drop-shadow-lg" style={{ color: "#fbe9c6" }}>
          Terp Time Capsule
        </h1>
        <p className="mt-3 text-lg md:text-xl text-white/85 max-w-xl mx-auto">
          Write a letter to your future self.
          <br />
          Sealed on Solana. Opened on graduation day.
        </p>
      </div>

      {/* The vault */}
      <div className="relative z-10 mt-8 md:mt-10 cursor-pointer" onClick={openVault}>
        <VaultDoor open={open} />
      </div>
      <p className={`relative z-10 mt-4 text-sm ${open ? "invisible" : "animate-pulse"}`} style={{ color: "#f5d77a" }}>
        Tap the vault to open it
      </p>

      {/* Buttons */}
      <div className="relative z-10 mt-4 flex flex-col sm:flex-row gap-4">
        <Link
          href="/write"
          onClick={(e) => goThrough(e, "/write")}
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-transform hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(180deg, #ffe066, #FFD200)", color: "#1a1a1a" }}
        >
          📜 Write your capsule →
        </Link>
        <Link
          href="/vault"
          onClick={(e) => goThrough(e, "/vault")}
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg border-2 transition-transform hover:scale-105 active:scale-95"
          style={{ borderColor: "#FFD200", color: "#FFD200", background: "rgba(0,0,0,0.35)" }}
        >
          🏛️ View the vault
        </Link>
      </div>

      <p className="relative z-10 mt-8 text-center text-sm text-white/60 max-w-md">
        Your words. Your memories. Locked in the blockchain
        <br />
        until you walk across that stage.
      </p>
    </div>
  );
}

function Banner({ side }: { side: "left" | "right" }) {
  return (
    <div
      className="hidden lg:flex absolute top-24 w-24 h-72 flex-col items-center pt-8 shadow-2xl"
      style={{
        [side]: "6%",
        background: "linear-gradient(180deg, #c8142c, #8e0b1d)",
        borderLeft: "4px solid #d4a72c",
        borderRight: "4px solid #d4a72c",
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)",
      }}
    >
      <div className="w-full h-2 absolute top-0" style={{ background: "#d4a72c" }} />
      <span className="font-display text-5xl font-bold" style={{ color: "#FFD200" }}>T</span>
      <span className="mt-3 text-2xl">🐢</span>
    </div>
  );
}

function Lantern({ side }: { side: "left" | "right" }) {
  return (
    <div className="hidden md:block absolute top-[55%]" style={{ [side]: "4%" }}>
      <div className="lantern-glow absolute -inset-16 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,190,90,0.45), transparent 70%)" }} />
      <div className="relative w-10 h-14 rounded-md border-4" style={{ borderColor: "#2a1d12", background: "linear-gradient(180deg, #ffe8a8, #ffb347)" }}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-3 rounded-t-md" style={{ background: "#2a1d12" }} />
      </div>
    </div>
  );
}
