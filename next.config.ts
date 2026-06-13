import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * HTTP security headers (see docs/security.md).
 *
 * Development needs 'unsafe-eval' (React Fast Refresh / debugging) and a websocket
 * for HMR, so the CSP is relaxed in dev ONLY. The production CSP omits 'unsafe-eval'.
 *
 * NOTE (M0 baseline): the production CSP still allows 'unsafe-inline' for script/style
 * because Next.js + Tailwind inject inline script/style without a nonce by default.
 * Before public launch this MUST become a strict, nonce-based CSP (no 'unsafe-inline'
 * / 'unsafe-eval'), per docs/security.md. Tracked as a pre-launch hardening item.
 */
const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";
const connectSrc = isDev ? "'self' ws:" : "'self'";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src ${connectSrc}`,
  "style-src 'self' 'unsafe-inline'",
  `script-src ${scriptSrc}`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
