import { useId } from "react";

// A crest for each school year: same shield shape, different colors, numeral and stars
export type Year = "freshman" | "sophomore" | "junior" | "senior" | "alumni";

const STYLES: Record<Year, { top: string; bottom: string; trim: string; text: string; numeral: string; stars: number; ribbon: string; ribbonText: string; label: string }> = {
  freshman: { top: "#d8203a", bottom: "#7a0b1b", trim: "#FFD200", text: "#FFD200", numeral: "I", stars: 1, ribbon: "#FFD200", ribbonText: "#7a0b1b", label: "FRESHMAN" },
  sophomore: { top: "#ffe066", bottom: "#c99712", trim: "#8e0b1d", text: "#8e0b1d", numeral: "II", stars: 2, ribbon: "#E21833", ribbonText: "#FFD200", label: "SOPHOMORE" },
  junior: { top: "#4a4a4a", bottom: "#141414", trim: "#FFD200", text: "#FFD200", numeral: "III", stars: 3, ribbon: "#E21833", ribbonText: "#ffffff", label: "JUNIOR" },
  senior: { top: "#b5122a", bottom: "#4a050f", trim: "#FFD200", text: "#ffe9a0", numeral: "IV", stars: 4, ribbon: "#FFD200", ribbonText: "#4a050f", label: "SENIOR" },
  alumni: { top: "#6fa64a", bottom: "#2f5a1f", trim: "#FFD200", text: "#FFD200", numeral: "∞", stars: 1, ribbon: "#FFD200", ribbonText: "#2f5a1f", label: "ALUMNI" },
};

const SHIELD = "M60,6 L108,22 L108,70 C108,104 84,124 60,134 C36,124 12,104 12,70 L12,22 Z";

function star(cx: number, cy: number, r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = ((-90 + i * 36) * Math.PI) / 180;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

export default function YearEmblem({ year, className = "" }: { year: Year; className?: string }) {
  const s = STYLES[year];
  const id = "g" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const starGap = 13;
  const firstStar = 60 - ((s.stars - 1) * starGap) / 2;

  return (
    <svg viewBox="-12 -4 144 160" className={className} aria-label={`${s.label} emblem`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.top} />
          <stop offset="1" stopColor={s.bottom} />
        </linearGradient>
      </defs>

      {/* Senior gets a laurel wreath */}
      {year === "senior" &&
        [-1, 1].map((side) =>
          [0, 1, 2, 3, 4].map((i) => (
            <ellipse
              key={`${side}${i}`}
              cx={60 + side * (56 - i * 2)}
              cy={40 + i * 19}
              rx="5"
              ry="11"
              fill="#7cb342"
              stroke="#33691e"
              strokeWidth="1"
              transform={`rotate(${side * (25 + i * 8)} ${60 + side * (56 - i * 2)} ${40 + i * 19})`}
            />
          ))
        )}

      {/* Shield */}
      <path d={SHIELD} fill={`url(#${id})`} stroke={s.trim} strokeWidth="5" strokeLinejoin="round" />
      <path d={SHIELD} fill="none" stroke={s.trim} strokeWidth="1.5" opacity="0.6" transform="translate(60 70) scale(0.84) translate(-60 -70)" />
      <path d="M22,26 L60,14 L98,26 L98,46 L22,46 Z" fill="#fff" opacity="0.08" />

      {/* Stars = year number */}
      {Array.from({ length: s.stars }, (_, i) => (
        <polygon key={i} points={star(firstStar + i * starGap, 36, 6)} fill={s.text} />
      ))}

      {/* Numeral */}
      <text x="60" y="88" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fontSize={s.numeral.length > 2 ? 34 : 40} fill={s.text}>
        {s.numeral}
      </text>

      {/* Ribbon with the year name */}
      <path d="M-4,104 L8,98 L8,124 L-4,118 L2,111 Z" fill={s.ribbon} opacity="0.75" />
      <path d="M124,104 L112,98 L112,124 L124,118 L118,111 Z" fill={s.ribbon} opacity="0.75" />
      <rect x="6" y="99" width="108" height="24" rx="3" fill={s.ribbon} stroke="#2b1a0e" strokeWidth="1.5" />
      <text x="60" y="116" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize="12" letterSpacing="2" fill={s.ribbonText}>
        {s.label}
      </text>
    </svg>
  );
}
