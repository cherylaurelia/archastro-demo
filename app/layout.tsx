import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scopey: Claude Code tool arguments for the judge (unofficial demo)",
  robots: { index: false, follow: false },
  description:
    "Scopey's judge sees tool names without arguments on Claude Code. A small fix for issue 29. Unofficial demo, not affiliated with ArchAstro.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <body>{children}</body>
    </html>
  );
}
