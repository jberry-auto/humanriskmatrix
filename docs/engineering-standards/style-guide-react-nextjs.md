# React & Next.js Style Guide (App Router)

The framework guide for this repository. All [TypeScript](style-guide-typescript.md) and [JavaScript](style-guide-javascript.md) standards apply; this document adds the React + Next.js App Router specifics that those guides don't cover. The reasoning lives in [engineering-principles.md](engineering-principles.md) (React & Next.js, Accessibility).

---

## Server vs. Client Components

- **Default to Server Components.** A component is a Server Component unless it has a `'use client'` directive. Server Components ship zero JS, can read server data directly, and keep secrets server-side.
- **Add `'use client'` only when you need:** state/effect hooks, event handlers, browser-only APIs, or a client-only library. Put the directive in the smallest leaf component that needs it — never on a whole page if a single button is what's interactive.
- **Keep the boundary shallow on the client side.** A Client Component can render Server Components passed as `children`/props, so wrap interactive islands rather than converting their subtree.

```tsx
// components/ColumnDisclosure.tsx
'use client';
import { useState } from 'react';

export function ColumnDisclosure({ summary, children }: { summary: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button aria-expanded={open} onClick={() => setOpen((v) => !v)}>{summary}</button>
      {open && <div>{children}</div>}   {/* children may be a Server Component */}
    </div>
  );
}
```

## The secret boundary (critical)

- Never import `src/config.ts` or any secret-bearing module into a `'use client'` module — it (and its transitive imports) is bundled to the browser.
- Never pass secrets, `config`, an API client, or a DB handle as **props** from a Server to a Client Component — props are serialized into the page payload. Pass only the computed, non-sensitive result.
- Add `import 'server-only'` at the top of server modules so an accidental client import fails the build. Only `NEXT_PUBLIC_*` values reach the browser. See [`../security.md`](../security.md) and [`../secrets-management.md`](../secrets-management.md).

## Data fetching & rendering

- Fetch on the server: in Server Components or route handlers. Avoid client-side fetching for content that can be rendered/cached server-side.
- **Static by default.** Content pages (Matrix, Theory) are statically rendered from validated `content/`. Use `export const revalidate = N` / ISR for periodically-refreshed data (the feed) instead of per-request work.
- Be explicit about caching (`fetch` cache options, `revalidate`, `dynamic`); don't rely on implicit defaults for anything cost- or freshness-sensitive.
- Co-locate `loading.tsx`, `error.tsx`, and `not-found.tsx` per route segment for resilient UX; use `Suspense` to stream slow async UI.

## Route handlers (`app/api/**/route.ts`)

- Validate the request (`body`, params, query) with **zod** at the top; return `400` on failure.
- Return typed, bounded JSON. **Never** echo upstream/SDK errors, stack traces, or internal metadata to the client — map to a generic message and log the detail server-side with a correlation id.
- Construct I/O dependencies here (Anthropic client, DB) and inject them into the pure `src/lib/**` core; keep handlers thin.
- Set explicit `permissions`-appropriate methods (export only `GET`/`POST`/… you implement). Protected endpoints (feed refresh) verify a token with a constant-time compare.

## Components

- **Function components only**, named-exported (`export function ColumnCard(...)`), one primary component per file. File name `PascalCase.tsx` matching the export.
- Props typed by an explicit `interface` (or `type`); no `any`. Type children as `React.ReactNode`. Mark props `readonly` where natural.
- Keep components presentational where possible; pull data shaping into `src/lib/**` (pure, tested) so components stay thin and snapshot-stable.
- Co-locate a component's small helpers/subcomponents in the same file; promote to `components/` when reused.

```tsx
interface ColumnCardProps {
  readonly column: MatrixColumn;
  readonly mappedFrameworkNames: readonly string[];
}

export function ColumnCard({ column, mappedFrameworkNames }: ColumnCardProps) { /* … */ }
```

## Hooks & state

- Obey the **Rules of Hooks**: call unconditionally at the top level; never in conditions, loops, or after an early return.
- Effect dependency arrays are complete and honest; never silence the linter. If an effect is hard to express, the data probably belongs on the server.
- Prefer **derived state** over stored state; lift state only as far as needed. Reach for global/client state only with a real second use case — URL and server state are preferred for shareable, durable UI.
- Custom hooks are named `useX` and own a single concern.

## Lists, forms, events

- Lists use **stable identity keys** (`column.id`), never the array index for dynamic lists.
- Forms: validate on the server (route handler or Server Action) regardless of any client validation; the Threat Modeler form gates submit on Turnstile and the server re-verifies.
- Event handlers are named `handleX`; keep them thin and delegate logic to pure functions.

## Styling (Tailwind)

- Utility-first Tailwind. Extract a component when a class list repeats or a unit of UI earns a name; don't build a parallel CSS abstraction.
- Define shared design tokens once — notably the **5-phase color scale** — and reuse across the legend, grid bands, and chips. **Encode meaning with text/shape too, not color alone.**
- Use a `cn()` class-merge helper for conditional classes; avoid inline `style` except for truly dynamic values.

## Performance & assets

- Favor Server Components to ship less JS; `dynamic()`-import heavy client-only widgets (e.g. an interactive heatmap) so they don't bloat first load.
- Images via `next/image`, fonts via `next/font`. Watch the client bundle; a content site should ship very little JS.

## Accessibility (required)

- Semantic HTML first (`<table>`, `<nav>`, `<button>`, ordered headings); ARIA only to fill genuine gaps.
- Keyboard-complete interactions with visible focus and logical tab order; modals trap and restore focus.
- Every control/field has an accessible name; icon-only buttons use `aria-label`; meaningful `alt` text (empty for decorative).
- WCAG AA contrast (the phase palette must pass); respect `prefers-reduced-motion`; never convey state by color alone.
- The dense matrix must remain legible and operable on mobile. Verify with axe/Lighthouse (a11y ≥ 95) and a keyboard-only pass. See [`../testing-qa.md`](../testing-qa.md).

## Metadata & SEO

- Use the App Router `metadata` export / `generateMetadata` for titles, descriptions, and Open Graph; don't hand-roll `<head>` tags.
- Per-page titles and descriptions; canonical URLs for stable pages.

## Testing

- `@testing-library/react`: test from the user's perspective (roles, labels, text), not implementation details.
- Assert accessibility affordances (a control is reachable by its accessible name; a `null` MITRE id renders no broken link; untrusted content renders inert).
- Pure rendering logic lives in `src/lib/**` and is unit-tested there; components test the wiring. See [`../testing-qa.md`](../testing-qa.md).

## Anti-patterns

| Anti-pattern | Do instead |
|---|---|
| `'use client'` at the page root for one interactive widget | Mark only the leaf component |
| Passing `config`/secrets/clients as props to a client component | Pass the computed, non-sensitive result; keep secrets server-side |
| `dangerouslySetInnerHTML` with model/RSS/user content | Render escaped text; sanitize markdown (raw HTML disabled) |
| Array index as a list `key` | Stable identity key |
| Client-side `fetch` for static content | Render on the server / ISR |
| Silencing the `exhaustive-deps` lint | Fix the dependency or move work server-side |
| `default export` for components | Named export |
| Color-only meaning in the heatmap | Add text/shape encoding |
