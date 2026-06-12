import "server-only";

import { z } from "zod";

/**
 * Single, validated entry point for environment configuration (docs/secrets-management.md).
 * Server-only: importing this from a client component is a build error, so secrets can
 * never reach the browser. Phase 1 needs no application secrets — only these baseline
 * values. Later phases extend the schema (ANTHROPIC_API_KEY, DATABASE_URL, ...).
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Config = z.infer<typeof EnvSchema>;

function loadConfig(): Config {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Fail fast — a misconfigured environment must not boot silently.
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const config: Config = loadConfig();
