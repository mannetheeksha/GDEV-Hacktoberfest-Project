// The dark, lantern-lit stone room behind the welcome, write and vault pages
export default function DarkRoom({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative min-h-screen overflow-hidden ${className}`}
      style={{ background: "radial-gradient(ellipse at 50% 40%, #3b2618 0%, #1e130c 55%, #0d0805 100%)" }}
    >
      {/* stone wall texture */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 46px, rgba(0,0,0,0.6) 46px 48px), repeating-linear-gradient(90deg, transparent 0 94px, rgba(0,0,0,0.45) 94px 96px)",
        }}
      />
      {/* warm glow from above */}
      <div
        className="lantern-glow absolute left-1/2 -translate-x-1/2 -top-40 w-[900px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,190,90,0.16), transparent 65%)" }}
      />
      {children}
    </div>
  );
}
