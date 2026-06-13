import type { Metadata } from "next";
import { Source_Code_Pro, Source_Sans_3, Source_Serif_4 } from "next/font/google";

import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

import "./globals.css";
import { Providers } from "./providers";

const serif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});
const sans = Source_Sans_3({ variable: "--font-source-sans", subsets: ["latin"], display: "swap" });
const mono = Source_Code_Pro({
  variable: "--font-source-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://humanriskmatrix.org"),
  title: {
    default: "Human Risk Matrix",
    template: "%s · Human Risk Matrix",
  },
  description:
    "An open taxonomy providing a comprehensive view of human risk impacting organizational systems and data confidentiality, availability, integrity, fitness for purpose, and processes — unifying counterintelligence, cybersecurity, social-engineering defense, and safety science across 11 categories of behavior arranged on a spectrum of malicious intent.",
};

const GITHUB_URL = "https://github.com/jberry-auto/humanriskmatrix";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-contrast"
        >
          Skip to content
        </a>
        <Providers>
          <header className="border-b border-border">
            <Container>
              <nav className="flex items-center justify-between py-4">
                <div className="flex items-center gap-6">
                  <Link
                    href="/"
                    variant="nav"
                    className="font-serif text-lg font-semibold tracking-tight"
                  >
                    Human Risk Matrix
                  </Link>
                  <Link href="/matrix" variant="nav" className="text-sm">
                    Matrix
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={GITHUB_URL} variant="nav" className="text-sm">
                    GitHub
                  </Link>
                  <ThemeToggle />
                </div>
              </nav>
            </Container>
          </header>
          <main id="main" className="flex-1 py-12">
            <Container>{children}</Container>
          </main>
          <footer className="border-t border-border py-6 text-sm text-muted">
            <Container>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Link href={GITHUB_URL} variant="nav" className="text-sm">
                  Source
                </Link>
                <span>Code: PolyForm Noncommercial · Content: CC BY-NC 4.0</span>
              </div>
            </Container>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
