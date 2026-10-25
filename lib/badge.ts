// Draws the "Envelope Peek" badge: Testudo peeking out of a sealed letter.

export const FIRST_CLASS_YEAR = 2029;

const RED = "#E21833";
const GOLD = "#FFD200";
const INK = "#2b2b2b";
const SKIN = "#9BD77E";
const BLUSH = "#ff8fa3";

// The graduation year is the year the capsule unlocks (never earlier than 2029)
export function classYear(unlockDate: string): number {
  return Math.max(FIRST_CLASS_YEAR, new Date(unlockDate).getFullYear());
}

function eye(x: number, y: number) {
  return `
  <circle cx="${x}" cy="${y}" r="13" fill="${INK}"/>
  <circle cx="${x - 4.5}" cy="${y - 5}" r="5" fill="#fff"/>
  <circle cx="${x + 4.5}" cy="${y + 4.5}" r="2.3" fill="#fff"/>`;
}

function sparkle(x: number, y: number, s: number, color: string) {
  return `<path d="M${x},${y - s} Q${x},${y} ${x + s},${y} Q${x},${y} ${x},${y + s} Q${x},${y} ${x - s},${y} Q${x},${y} ${x},${y - s} Z" fill="${color}"/>`;
}

export function badgeSvg(year: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="#fff"/>
  <circle cx="200" cy="200" r="182" fill="#FFE3E7" stroke="${RED}" stroke-width="14"/>

  <!-- envelope back + open flap -->
  <polygon points="90,190 200,112 310,190" fill="#f5e6c8" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
  <rect x="90" y="188" width="220" height="140" rx="12" fill="#fffaf0" stroke="${INK}" stroke-width="6"/>

  <!-- Testudo's face -->
  <ellipse cx="200" cy="190" rx="72" ry="62" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>
  ${eye(172, 185)}${eye(228, 185)}
  <ellipse cx="152" cy="210" rx="14" ry="8" fill="${BLUSH}" opacity=".75"/>
  <ellipse cx="248" cy="210" rx="14" ry="8" fill="${BLUSH}" opacity=".75"/>
  <path d="M188,208 q6,9 12,0 q6,9 12,0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>

  <!-- envelope front, hands, heart seal -->
  <path d="M90,192 L200,262 L310,192 L310,316 Q310,328 298,328 L102,328 Q90,328 90,316 Z" fill="#fffaf0" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="140" cy="222" r="15" fill="${SKIN}" stroke="${INK}" stroke-width="5"/>
  <circle cx="260" cy="222" r="15" fill="${SKIN}" stroke="${INK}" stroke-width="5"/>
  <path transform="translate(200,268) scale(1.5)" d="M0,13 C-30,-6 -15,-28 0,-14 C15,-28 30,-6 0,13 Z" fill="${RED}" stroke="${INK}" stroke-width="3"/>
  <text x="200" y="312" text-anchor="middle" font-family="Trebuchet MS, Arial Rounded MT Bold, Arial, sans-serif" font-weight="bold" font-size="20" letter-spacing="1" fill="${RED}">CLASS OF ${year}</text>

  ${sparkle(85, 110, 14, GOLD)}${sparkle(320, 110, 10, RED)}${sparkle(335, 300, 9, GOLD)}
</svg>`;
}
