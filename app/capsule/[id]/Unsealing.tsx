"use client";

// The opening scene: envelope wiggles while Solana re-checks the fingerprint,
// then the wax seal cracks, the flap opens and the letter slides out.

export type Phase = "scanning" | "result" | "opening";
export type Check = { verified?: boolean; sealedAt?: string; reason?: string; error?: string };

const RED = "#E21833";
const INK = "#2b2b2b";

export default function Unsealing({ phase, check, hash }: { phase: Phase; check: Check | null; hash: string }) {
  const scanColor = phase === "scanning" || !check ? "#9ca3af" : check.verified ? "#16a34a" : check.error ? "#6b7280" : "#dc2626";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#fdf8f0" }}>
      {/* Envelope */}
      <svg
        viewBox="0 -100 300 320"
        className={`w-72 max-w-full ${phase === "scanning" ? "anim-wiggle" : ""} ${phase === "opening" ? "opened" : ""}`}
        aria-label="Your capsule envelope"
      >
        {/* back + open flap (behind the letter) */}
        <rect x="20" y="60" width="260" height="150" rx="12" fill="#f5e6c8" stroke={INK} strokeWidth="5" />
        <polygon className="flap-open" points="20,62 280,62 150,-25" fill="#f5e6c8" stroke={INK} strokeWidth="5" strokeLinejoin="round" />

        {/* the letter */}
        <g className="letter">
          <rect x="45" y="72" width="210" height="125" rx="6" fill="#fff" stroke={INK} strokeWidth="4" />
          {[95, 115, 135, 155].map((y) => (
            <line key={y} x1="65" y1={y} x2={y === 155 ? 170 : 235} y2={y} stroke="#d1d5db" strokeWidth="5" strokeLinecap="round" />
          ))}
        </g>

        {/* front pocket */}
        <path d="M20,100 L150,168 L280,100 L280,198 Q280,210 268,210 L32,210 Q20,210 20,198 Z" fill="#fffaf0" stroke={INK} strokeWidth="5" strokeLinejoin="round" />

        {/* closed flap + wax seal */}
        <polygon className="flap-closed" points="20,62 280,62 150,150" fill="#fffaf0" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path className="seal-half seal-left" d="M150,126 A24,24 0 0,0 150,174 Z" fill={RED} stroke={INK} strokeWidth="3" />
        <path className="seal-half seal-right" d="M150,126 A24,24 0 0,1 150,174 Z" fill={RED} stroke={INK} strokeWidth="3" />
        <text className="seal-half seal-right" x="150" y="158" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize="24" fill="#FFD200">
          T
        </text>
      </svg>

      {/* Fingerprint scanner */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center gap-5 max-w-md w-full">
        <div className="relative w-16 h-20 shrink-0 overflow-hidden">
          <svg viewBox="0 0 80 100" className="w-full h-full">
            {[10, 18, 26, 34].map((r, i) => (
              <ellipse
                key={r}
                cx="40"
                cy="52"
                rx={r}
                ry={r * 1.25}
                fill="none"
                stroke={scanColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${18 + i * 6} 7`}
                style={{ transition: "stroke 0.4s" }}
              />
            ))}
          </svg>
          {phase === "scanning" && (
            <div className="scan-line absolute left-0 right-0 h-1 rounded-full" style={{ background: "#FFD200", boxShadow: "0 0 10px #FFD200" }} />
          )}
        </div>

        <div className="text-sm">
          {phase === "scanning" || !check ? (
            <>
              <p className="font-semibold text-gray-700">Re-checking the capsule&apos;s fingerprint on Solana...</p>
              <p className="font-mono text-xs text-gray-400 mt-1">sha256: {hash.slice(0, 10)}…{hash.slice(-6)}</p>
            </>
          ) : check.verified ? (
            <>
              <p className="font-bold text-green-700">✅ Fingerprint matches Solana</p>
              <p className="text-gray-500 mt-1">
                Unedited since {new Date(check.sealedAt!).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </>
          ) : check.error ? (
            <p className="font-semibold text-gray-600">📡 {check.error}</p>
          ) : (
            <>
              <p className="font-bold text-red-600">⚠️ Fingerprint doesn&apos;t match!</p>
              <p className="text-gray-500 mt-1">{check.reason}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
