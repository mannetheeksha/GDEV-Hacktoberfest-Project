import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #E21833 0%, #8B0000 100%)" }}
    >
      {/* Turtle emoji as motif */}
      <div className="text-8xl mb-6 drop-shadow-lg select-none">🐢</div>

      <h1
        className="text-5xl md:text-6xl font-bold text-center mb-4 drop-shadow-md"
        style={{ color: "#FFD200", fontFamily: "Georgia, serif" }}
      >
        Terp Time Capsule
      </h1>

      <p className="text-xl md:text-2xl text-white text-center max-w-lg mb-4 leading-relaxed opacity-90">
        Write a letter to your future self. Sealed on Solana. Opened on graduation day.
      </p>

      <p className="text-white/70 text-sm text-center mb-12 max-w-md">
        Your words, your memories, locked in the blockchain — untouched until you walk across that stage.
      </p>

      <Link
        href="/write"
        className="inline-block text-lg font-bold px-10 py-4 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
        style={{ background: "#FFD200", color: "#1a1a1a" }}
      >
        ✍️ Write your capsule
      </Link>

      <Link
        href="/vault"
        className="mt-4 text-white/80 underline underline-offset-4 text-sm hover:text-white transition-colors"
      >
        View the vault →
      </Link>

      {/* Footer */}
      <div className="mt-20 text-white/40 text-xs text-center">
        University of Maryland · Devnet · Hacktoberfest 2024
      </div>
    </div>
  );
}
