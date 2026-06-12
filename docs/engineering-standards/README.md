# Engineering Standards

The **authoritative code style and language rules** for this repository. These are
vendored in (not referenced from a contributor's machine) so the public repo, its CI,
and any Claude Code session are fully self-contained.

## Contents

| File | What it covers |
|---|---|
| [coding-standards.md](coding-standards.md) | Language-agnostic staff-level rules: structure, naming, dependencies, error handling, types/validation, observability, resilience, security, testing. |
| [style-guide-typescript.md](style-guide-typescript.md) | **Primary language guide.** Naming, formatting, the strict `tsconfig` baseline, type-system patterns (zod-derived types, discriminated unions, branded types, Result pattern), TSDoc, anti-patterns. |
| [style-guide-react-nextjs.md](style-guide-react-nextjs.md) | **Framework guide.** Server vs. Client Components, the server-only secret boundary, data fetching/ISR, route handlers, hooks/state, Tailwind, accessibility, metadata, testing. |
| [style-guide-javascript.md](style-guide-javascript.md) | Underlying JS conventions the TypeScript guide extends (all JS standards apply). |
| [engineering-principles.md](engineering-principles.md) | The "why" behind the rules — tailored to this stack (TS · React · Next.js · zod · Postgres · Tailwind), incl. Accessibility. |

## How these relate to the rest of the docs

```
docs/engineering-standards/   ← authoritative, general rules (this folder)
        ▲
        │ extended by
        │
docs/style-guide.md           ← repo-SPECIFIC choices + content & commit/PR style
CLAUDE.md                     ← project rules + hard constraints for Claude sessions
```

- For **general language/style questions**, this folder is the source of truth.
- For **repo-specific conventions** (file naming, the `src/lib` layering boundary, how to write a matrix technique, commit format), see [`docs/style-guide.md`](../style-guide.md).
- TypeScript is the project language; the Python/Rust/C guides and principles from the upstream standards are intentionally **not** vendored — they were trimmed so everything here matches this repo's stack (TypeScript · React · Next.js · zod · Postgres · Tailwind).

## Precedence

When guidance conflicts, the more specific source wins:

`CLAUDE.md` (hard rules) → `docs/style-guide.md` (repo-specific) → this folder (general). An explicit instruction in a task overrides all of them, but the deviation must be flagged.

---

*Provenance: vendored and lightly adapted from the maintainers' shared engineering standards. Treat them as the standards of record for this repository.*
