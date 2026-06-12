import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://humanriskmatrix.org"),
  title: {
    default: "Human Risk Matrix",
    template: "%s · Human Risk Matrix",
  },
  description:
    "An open taxonomy of human behavior that produces business impact — unifying counterintelligence tradecraft and safety science across 11 columns and 5 phases.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <header className="border-b border-black/10 dark:border-white/15">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
              Human Risk Matrix
            </Link>
            <a
              href="https://github.com/jberry-auto/humanriskmatrix"
              className="text-sm underline-offset-4 hover:underline"
            >
              GitHub
            </a>
          </nav>
        </header>
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
          {children}
        </main>
        <footer className="border-t border-black/10 py-6 text-sm text-black/60 dark:border-white/15 dark:text-white/60">
          <div className="mx-auto flex max-w-5xl flex-wrap gap-x-6 gap-y-2 px-6">
            <a href="https://github.com/jberry-auto/humanriskmatrix" className="hover:underline">
              Source
            </a>
            <span>Code: PolyForm Noncommercial · Content: CC BY-NC 4.0</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
