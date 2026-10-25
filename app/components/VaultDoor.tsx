// The round vault door on the welcome page.
// When `open` turns true: the wheel spins, the door swings open, and the campus glows through.

const GOLD = "#d4a72c";
const GOLD_LIGHT = "#f5d77a";

export default function VaultDoor({ open }: { open: boolean }) {
  return (
    <div className={`relative w-[min(78vw,400px)] aspect-square ${open ? "vault-open" : ""}`} style={{ perspective: "1400px" }}>
      {/* Glow that spills out when the door opens */}
      <div
        className="vault-glow absolute -inset-[30%] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,214,120,0.55) 0%, rgba(255,170,60,0.25) 35%, transparent 65%)" }}
      />

      {/* Iron frame with rivets */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full drop-shadow-2xl">
        <defs>
          <radialGradient id="iron" cx="45%" cy="40%" r="65%">
            <stop offset="0" stopColor="#5a4636" />
            <stop offset="0.7" stopColor="#2e2219" />
            <stop offset="1" stopColor="#140d08" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="198" fill="url(#iron)" stroke="#0b0705" strokeWidth="3" />
        <circle cx="200" cy="200" r="174" fill="#0b0705" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          // rounded so the server and browser draw the exact same numbers
          const x = (200 + 186 * Math.cos(a)).toFixed(1);
          const y = (200 + 186 * Math.sin(a)).toFixed(1);
          return <circle key={i} cx={x} cy={y} r="4.5" fill={GOLD} stroke="#5c4310" strokeWidth="1" />;
        })}
      </svg>

      {/* The campus behind the door */}
      <div className="absolute rounded-full overflow-hidden" style={{ inset: "6.5%" }}>
        <CampusScene />
      </div>

      {/* The door itself (swings on its right hinge) */}
      <div className="vault-door absolute rounded-full" style={{ inset: "6.5%" }}>
        <svg viewBox="0 0 340 340" className="absolute inset-0 w-full h-full">
          <defs>
            <radialGradient id="doorFace" cx="42%" cy="38%" r="70%">
              <stop offset="0" stopColor="#a3162a" />
              <stop offset="0.6" stopColor="#6e0c1a" />
              <stop offset="1" stopColor="#3a050c" />
            </radialGradient>
          </defs>
          <circle cx="170" cy="170" r="168" fill="url(#doorFace)" stroke={GOLD} strokeWidth="5" />
          <circle cx="170" cy="170" r="142" fill="none" stroke={GOLD} strokeWidth="3" opacity="0.9" />
          <circle cx="170" cy="170" r="132" fill="none" stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />
          {/* locking bolts */}
          {Array.from({ length: 8 }, (_, i) => (
            <rect
              key={i}
              x="164"
              y="12"
              width="12"
              height="22"
              rx="3"
              fill={GOLD}
              stroke="#5c4310"
              strokeWidth="1.5"
              transform={`rotate(${i * 45 + 22.5} 170 170)`}
            />
          ))}
        </svg>

        {/* Spinning wheel handle */}
        <div className="vault-wheel absolute" style={{ inset: "18%" }}>
          <svg viewBox="0 0 220 220" className="w-full h-full">
            <defs>
              <radialGradient id="hub" cx="40%" cy="35%" r="70%">
                <stop offset="0" stopColor="#c81d34" />
                <stop offset="1" stopColor="#5a0814" />
              </radialGradient>
            </defs>
            {Array.from({ length: 6 }, (_, i) => (
              <g key={i} transform={`rotate(${i * 60} 110 110)`}>
                <line x1="110" y1="110" x2="110" y2="14" stroke={GOLD} strokeWidth="9" strokeLinecap="round" />
                <circle cx="110" cy="12" r="10" fill={GOLD_LIGHT} stroke="#5c4310" strokeWidth="2" />
              </g>
            ))}
            <circle cx="110" cy="110" r="70" fill="none" stroke={GOLD} strokeWidth="9" />
            <circle cx="110" cy="110" r="40" fill="url(#hub)" stroke={GOLD_LIGHT} strokeWidth="5" />
            <text x="110" y="126" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize="44" fill={GOLD_LIGHT}>
              T
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}

// Sunrise over a domed campus building (McKeldin-style)
function CampusScene() {
  return (
    <svg viewBox="0 0 340 340" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd98a" />
          <stop offset="0.55" stopColor="#ffb85c" />
          <stop offset="1" stopColor="#f6a24a" />
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="38%" r="45%">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset="0.4" stopColor="#fff1b8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="340" height="340" fill="url(#sky)" />
      <g className="scene-rays" style={{ transformOrigin: "170px 130px" }}>
        {Array.from({ length: 12 }, (_, i) => (
          <polygon key={i} points="170,130 160,-60 180,-60" fill="#fff6d6" opacity="0.35" transform={`rotate(${i * 30} 170 130)`} />
        ))}
      </g>
      <rect width="340" height="340" fill="url(#sun)" />

      {/* trees */}
      {[[30, 215, 38], [80, 225, 30], [270, 222, 34], [318, 212, 40]].map(([x, y, r]) => (
        <circle key={x} cx={x} cy={y} r={r} fill="#5e8f3e" opacity="0.9" />
      ))}

      {/* building */}
      <g fill="#fbf3e4" stroke="#b9a07a" strokeWidth="1.5">
        <rect x="95" y="175" width="150" height="70" />
        <polygon points="120,175 170,148 220,175" />
        <rect x="150" y="118" width="40" height="32" />
        <path d="M146,120 Q170,78 194,120 Z" />
        <rect x="166" y="66" width="8" height="18" />
      </g>
      {[110, 132, 154, 176, 198, 220].map((x) => (
        <rect key={x} x={x} y="182" width="9" height="56" fill="#ffffff" stroke="#c9b28c" strokeWidth="1" />
      ))}
      <rect x="85" y="243" width="170" height="8" fill="#e8dcc4" />

      {/* lawn + path */}
      <rect x="0" y="250" width="340" height="90" fill="#6fa64a" />
      <polygon points="150,251 190,251 250,340 90,340" fill="#e9d8b4" />
    </svg>
  );
}
