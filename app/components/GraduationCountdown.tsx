"use client";

import { useEffect, useState } from "react";

// "2029-05-20" → midnight on May 20, 2029 in the viewer's own time zone
function localDate(isoDate: string): Date {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Live countdown (ticks every second) to the next graduation in this vault
export default function GraduationCountdown({ unlockDates, skipped }: { unlockDates: string[]; skipped: boolean }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // The soonest unlock date that hasn't happened yet
  const upcoming = unlockDates
    .map(localDate)
    .filter((d) => d.getTime() > now)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const panel = "relative mb-8 rounded-3xl border-2 px-5 py-6 text-center overflow-hidden";
  const panelStyle = {
    background: "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.25))",
    borderColor: "rgba(255,210,0,0.55)",
    boxShadow: "0 0 50px rgba(255,190,90,0.22), inset 0 0 40px rgba(255,190,90,0.08)",
  };

  if (skipped || !upcoming) {
    return (
      <div className={`${panel} fade-up`} style={panelStyle}>
        <p className="font-display text-3xl md:text-4xl font-bold" style={{ color: "#FFD200", textShadow: "0 0 20px rgba(255,210,0,0.6)" }}>
          🎓 Happy Graduation, Terp!
        </p>
        <p className="mt-2 text-white/75">{skipped ? "You skipped ahead. Your capsules are ready to open." : "The wait is over. Your capsules are ready to open."}</p>
      </div>
    );
  }

  const ms = upcoming.getTime() - now;
  const parts = [
    { label: "Days", value: Math.floor(ms / 86_400_000) },
    { label: "Hours", value: Math.floor(ms / 3_600_000) % 24 },
    { label: "Minutes", value: Math.floor(ms / 60_000) % 60 },
    { label: "Seconds", value: Math.floor(ms / 1000) % 60 },
  ];

  return (
    <div className={`${panel} fade-up`} style={panelStyle}>
      <p className="text-xs md:text-sm uppercase tracking-[0.25em]" style={{ color: "#f5d77a" }}>
        Countdown to Graduation · Class of {upcoming.getFullYear()}
      </p>

      <div className="mt-4 flex justify-center gap-2 md:gap-4">
        {parts.map(({ label, value }) => (
          <div
            key={label}
            className="w-[4.5rem] md:w-24 rounded-2xl py-3 border"
            style={{ background: "rgba(20,12,6,0.8)", borderColor: "rgba(255,210,0,0.3)" }}
          >
            <div
              className="font-display text-3xl md:text-5xl font-bold tabular-nums"
              style={{ color: "#FFD200", textShadow: "0 0 16px rgba(255,210,0,0.55)" }}
            >
              {label === "Days" ? value : String(value).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[0.65rem] md:text-xs uppercase tracking-widest text-white/60">{label}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-white/65">
        until{" "}
        {upcoming.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  );
}
