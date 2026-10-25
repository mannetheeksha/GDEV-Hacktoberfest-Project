"use client";

import { useState } from "react";

const COLORS = ["#E21833", "#FFD200", "#1a1a1a", "#ffffff", "#9BD77E"];

// A one-time burst of UMD-colored confetti
export default function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 70 }, () => ({
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      dx: Math.random() * 200 - 100,
      rot: Math.random() * 720 - 360,
      dur: 2.5 + Math.random() * 1.5,
      delay: Math.random() * 0.5,
      round: Math.random() < 0.3,
    }))
  );

  return (
    <>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
            border: p.color === "#ffffff" ? "1px solid #eee" : undefined,
            "--dx": `${p.dx}px`,
            "--rot": `${p.rot}deg`,
            "--dur": `${p.dur}s`,
            "--delay": `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}
