import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

/**
 * Layering boundary (see docs/architecture.md): `src/lib/**` is the pure business
 * core. It must not import framework or infrastructure modules — dependencies are
 * injected as arguments. This rule fails the build if that boundary is crossed.
 */
const pureCoreBoundary = {
  files: ["src/lib/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          { name: "react", message: "src/lib is the pure core — no React imports." },
          { name: "react-dom", message: "src/lib is the pure core — no react-dom." },
          { name: "server-only", message: "src/lib must stay injectable, not server-bound." },
        ],
        patterns: [
          {
            group: [
              "next",
              "next/*",
              "@/app/*",
              "@/components/*",
              "pg",
              "@anthropic-ai/*",
              "rss-parser",
            ],
            message:
              "src/lib is the pure core: no framework/infra imports — inject dependencies instead (docs/architecture.md).",
          },
        ],
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  pureCoreBoundary,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "coverage/**"]),
]);

export default eslintConfig;
