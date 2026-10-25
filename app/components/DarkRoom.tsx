// The dark, lantern-lit stone room behind every page (styles: .dark-room in animations.css)
export default function DarkRoom({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`dark-room min-h-screen overflow-hidden ${className}`}>{children}</div>;
}
