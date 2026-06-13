# Phase 3 — SLM Threat Feed (outline)

**Status: outline.** Locked decisions captured; expand to build-ready at the start of Phase 3. Read with `docs/reliability-sre.md`, `docs/deployment-do.md`, `docs/security.md`, and `docs/secrets-management.md`.

**Goal:** a continuously updated feed of security/insider-risk news, each item **summarized** by Claude Haiku, **mapped to the matrix categories** it implicates, with **suggested team actions**.

## Locked decisions
- Source: **curated RSS feeds** (config-driven, PR-extendable).
- Model: **Claude Haiku 4.5** for summarize + map + suggest-actions; structured (zod) output.
- Persistence: **DO Managed Postgres** — durable, deduped storage that survives the ephemeral container; dedup by **canonical URL** so each article is summarized once.
- Scheduling: a **scheduled GitHub Action** (`feed-refresh.yml`) hits a **token-protected** refresh endpoint.
- New secrets: `DATABASE_URL`, `FEED_REFRESH_TOKEN` (+ the Phase 2 Anthropic vars), all via DO encrypted env vars.

## Shape

```
src/lib/feed/sources.ts        # curated RSS source list (config)
src/lib/feed/fetch-feed.ts     # fetch + parse (rss-parser) behind an injected fetcher; explicit timeout
src/lib/feed/canonical.ts      # canonicalizeUrl() for dedup key — PURE
src/lib/feed/pipeline.ts       # PURE core: given articles + deps (summarizer, store), produce/persist items
src/lib/feed/schema.ts         # FeedItemSummarySchema (zod)
app/api/feed/refresh/route.ts  # token-protected: run the pipeline
app/threat-feed/page.tsx       # reads persisted items, renders FeedCards (ISR/revalidate)
components/FeedCard.tsx
db/ (migrations)               # articles, summaries, mappings
```

## Summary schema (draft)

```ts
const FeedItemSummarySchema = z.object({
  canonicalUrl: z.string().url(),
  title: z.string().min(1),
  source: z.string().min(1),
  publishedAt: z.string(),               // ISO
  summary: z.string().max(800),
  mappedCategories: z.array(z.number().int().min(1).max(11)).max(11),
  suggestedActions: z.array(z.string()).max(5),
});
```

## Postgres (draft)
- `articles(canonical_url PK, source, title, published_at, fetched_at)`
- `summaries(article_url FK, summary, model, created_at)`
- `article_categories(article_url FK, category_id)` — the matrix mapping (many-to-many)
- Migrations run on deploy; connection pooling; backups enabled (see `docs/reliability-sre.md`).

## Pipeline
1. Fetch each curated source (timeout per source; one failing source must not fail the run).
2. Canonicalize URLs; skip any already in `articles` (dedup → no re-summarization → bounded cost).
3. For each new article: summarize + map + suggest actions via Haiku → validate against schema → persist atomically.
4. Record per-run metrics (fetched, new, summarized, errors).

## Security — untrusted content
Article titles/bodies are **untrusted**, and so is the **model-generated summary derived from them** — both are persisted and served to every visitor, so both are stored-XSS vectors. They are passed to the model strictly as data with explicit framing; the model must never follow instructions embedded in article text (prompt-injection containment per `docs/security.md`). **Render all feed content (article text and model output) as escaped plain text — never `dangerouslySetInnerHTML`;** if markdown is rendered, sanitize with a strict allow-list (e.g., `rehype-sanitize`, raw HTML disabled). Outbound links are `rel="noopener noreferrer"`. DB access is parameterized; the refresh endpoint is token-protected (constant-time compare) and only fetches from the curated source allow-list (no arbitrary URLs → no SSRF).

## Reliability
Explicit timeouts + bounded retries on fetch and on the model call; the refresh endpoint is idempotent (dedup makes re-runs safe); graceful degradation — if the model or a source is down, the feed still serves the last persisted items. SLOs and alerting in `docs/reliability-sre.md`.

## UI
`app/threat-feed/page.tsx` uses ISR (`revalidate`) to render persisted items; `FeedCard` shows summary, mapped-category chips (linking `/matrix`), suggested actions, source, date, and a "model-generated summary" label.

## Acceptance criteria (Phase 3 exit)
- Feed renders durable, deduped, matrix-mapped summaries with suggested actions.
- Each article summarized exactly once (dedup verified); refresh endpoint rejects unauthenticated calls.
- One failing source/API call does not break the feed; last-good items still served.
- Postgres migrations + backups in place; tests cover RSS parsing (fixtures, incl. malformed), canonicalization/dedup, mapping validation, and the auth path.
