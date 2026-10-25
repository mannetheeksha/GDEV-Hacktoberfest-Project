import type { Metadata } from "next";
import "./globals.css";
import "./animations.css";
import { Playfair_Display } from "next/font/google";

// Fancy serif for big titles (used via the .font-display class)
const display = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Terp Time Capsule",
  description: "Seal your UMD memories on Solana. Open on graduation day.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={display.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
