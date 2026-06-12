# Engineering Principles

The "why" behind the rules, tailored to this repository's stack: **TypeScript · React · Next.js (App Router) · zod · Postgres · Tailwind**. The upstream multi-language principles (Python, Rust, C) are intentionally omitted — this is a TypeScript/React codebase. Concrete rules live in the [coding standards](coding-standards.md) and the language/framework guides; this document is the reasoning.

## General

**Responsibility & Simplicity**

1. Every module, class, and function does exactly one thing.
2. If you can't describe what it does without "and," it's two things — split it.
3. Solve the problem you have now; build for the future when the future arrives.
4. Write the boring, obvious version first; optimize only against measured evidence.
5. Every abstraction you add is a line someone else has to understand — earn it.
6. Dead code, commented-out blocks, and speculative features are liabilities.

**Dependencies & Configuration**

7. Pass dependencies in as arguments; never reach out for them from inside business logic.
8. Business logic must not import from infrastructure layers. (Here: `src/lib/**` is the pure core — see [architecture.md](../architecture.md).)
9. Pin all dependencies with lockfiles and audit transitive dependencies for vulnerabilities.
10. Every environment-specific value lives outside source code — in environment variables or a secrets manager.
11. Configuration must be injectable and overridable per environment without a code change.

**Error Handling**

12. Fail the moment invalid state is detected, not three layers later.
13. Every error includes what failed, why, and enough context to reproduce it.
14. Catch the narrowest exception possible; never catch what you can't meaningfully handle.
15. Never silently swallow an error — at minimum, record it with full context.

**Type Safety & Validation**

16. Type-annotate every public interface; untyped code is unfinished code.
17. Use structured types for structured data — not strings, dictionaries, or raw maps.
18. Validate all data at trust boundaries before it enters your system.
19. Never trust input from users, other services, or your own database without validation.

**Observability**

20. Emit one structured record per request per service with everything needed to debug it.
21. Every production service exposes latency, traffic, errors, and saturation metrics.
22. Propagate correlation IDs across every service boundary.
23. Never deploy without observability already in place.

**Resilience**

24. Every external call gets a timeout — the default of "wait forever" is a production incident waiting to happen.
25. Every retry has a bound and uses exponential backoff with jitter.
26. Every write path must produce the same result when executed twice.
27. Handle shutdown gracefully — complete in-flight work, close connections, then exit.

**Testing**

28. Every test must actually fail when the code it covers breaks.
29. Tests ship in the same changelist as the code they cover.
30. If a function is hard to test, it's doing too much or hiding a dependency.

**Safety**

31. Secrets belong in a secrets manager, never in source code or committed files.
32. Sanitize everything that crosses a trust boundary.
33. Use parameterized queries; never interpolate user input into commands or queries.

**Code Quality & Operations**

34. Names should make comments unnecessary.
35. Keep functions short enough to read without scrolling.
36. One logical change per pull request; never mix formatting with behavior.
37. Feature-flag new code so it can be disabled without a rollback.
38. Every incident becomes a blameless postmortem that prevents the next one.

---

## JavaScript

**Variables & Scope**

1. Use `const` by default; use `let` only when reassignment is necessary; never use `var`.
2. One variable per declaration; declare at the narrowest possible scope.

**Async**

3. Use `async/await` over raw Promise chains.
4. Always wrap `await` in `try/catch` with specific error handling.
5. Use `Promise.allSettled()` when you need all results regardless of individual failures.
6. Every network request in production must have an explicit timeout mechanism.
7. Register a global unhandled-rejection handler as a safety net, but never rely on it as your error handling strategy.

**Error Handling**

8. Always throw `Error` objects or custom subclasses — never strings or plain objects.
9. Create domain-specific error classes with structured properties (code, status, cause).
10. Use the `cause` option for error chaining so original context is preserved.

**Modules & Structure**

11. Use ES modules (`import`/`export`) exclusively.
12. Prefer named exports over default exports — they provide canonical names and are easier to refactor.
13. Use destructuring for clean parameter access.

**Security**

14. Sanitize all user-provided HTML before rendering.
15. Implement Content Security Policy headers.
16. Set `HttpOnly`, `Secure`, and `SameSite` on all cookies.
17. Never use `eval()`, direct HTML injection of untrusted data, or dynamic function construction with user input.

**Server-Side Production**

18. Use deterministic, lockfile-based installs in CI — never non-deterministic install commands.
19. Use structured, leveled logging to stdout — never `console.log` in production.
20. Implement graceful shutdown on termination signals.
21. Never use synchronous I/O functions in production servers — they block the event loop for all concurrent requests.

**Tooling**

22. Enforce a shared linting configuration and an automated formatter across the team.
23. Enable security-focused lint rules; enforce no unused variables, no console output, and immutable-by-default declarations.

**Anti-Patterns**

24. Never use `==` — always `===`; the only exception is `== null` for null/undefined checks.
25. Never iterate objects with `for...in` without filtering — it walks the prototype chain; use `for...of` or key-extraction methods.
26. Never commit dependency directories or secret files to version control.
27. Never use bare `return` without `await` inside `try/catch` in async functions — stack traces are lost.

---

## TypeScript

**Compiler Configuration**

1. Enable the strictest compiler mode available — this is non-negotiable for production code.
2. Additionally enable unchecked index access safety, exact optional properties, implicit return checks, override annotations, and consistent file casing.

**Type System**

3. Use discriminated unions for state modeling — they make impossible states unrepresentable.
4. Add exhaustive checks in switch/if default cases so the compiler catches unhandled variants.
5. Use branded types to prevent semantic type confusion between structurally identical types (e.g. `UserId` vs `OrderId` that are both strings).
6. Always type `catch` variables as `unknown` and narrow before use.
7. Add explicit return types to all exported functions.
8. Constrain generics with `extends` when minimum requirements are known; don't genericize if the type parameter appears only once.

**Validation & Error Handling**

9. Use a schema validation library (zod, here) at trust boundaries; prefer safe-parse methods that return result types over methods that throw.
10. Derive TypeScript types from validation schemas (`z.infer`) so the schema is the single source of truth.
11. Use a Result pattern for expected errors; reserve `throw` for programmer errors and truly exceptional conditions.

**Imports & Exports**

12. Use type-only imports for values that exist only at compile time.
13. Use named exports exclusively — no default exports.
14. Never use `namespace`; use ES modules.

**Immutability & Safety**

15. Use `readonly` on properties not reassigned after construction.
16. Use const assertions for literal type preservation.
17. Use type-narrowing operators to validate object shapes without widening types.

**Naming**

18. Don't prefix interfaces with `I`; don't suffix types with `Type`.
19. Treat abbreviations as words in identifiers (`loadHttpUrl`, not `loadHTTPURL`).

**Anti-Patterns**

20. Never use `any` — use `unknown` and narrow; every `any` is a hole in your type safety.
21. Never use type assertions to silence errors — validate with runtime checks instead.
22. Never suppress compiler errors without a documented reason and linked issue.
23. Prefer const objects with derived union types over enums — they tree-shake better and behave more predictably.
24. Never use wrapper object types (`String`, `Number`, `Boolean`) — always use lowercase primitives.
25. Never put business logic in type guards — they must be pure validation with no side effects.

---

## React & Next.js (App Router)

**Server/Client boundary**

1. Components are **Server Components by default**; add `'use client'` only when a component needs interactivity, browser APIs, or stateful hooks. Push `'use client'` as far down the tree (toward leaves) as possible to keep the client bundle small.
2. **Secrets are server-only.** Never import server config or secret-bearing modules into a client component, and never pass secrets/clients/`config` as props across the server→client boundary — props are serialized into the browser. Guard server modules with `server-only`. (See [security.md](../security.md).)
3. Fetch data on the server (Server Components, route handlers); avoid client-side fetching for content that can be rendered or cached server-side.

**Rendering & data**

4. Static content renders statically; use `revalidate`/ISR for periodically-refreshed data (e.g. the feed) rather than per-request work.
5. Validate every route-handler input with zod at the boundary; return typed, bounded responses; never leak upstream/error internals to the client.
6. Use `error.tsx`, `loading.tsx`, and `not-found.tsx` segment files for resilient UI states; wrap async UI in `Suspense` where it improves perceived performance.

**Components & hooks**

7. Function components only, named-exported, one primary component per file; props typed by an explicit interface (no `any`, `children: ReactNode`).
8. Obey the Rules of Hooks: call hooks unconditionally at the top level; give effects complete, honest dependency arrays; never put side effects in render.
9. Prefer derived state over stored state; lift state only as far as needed; reach for global state only with a real second use case. URL and server state beat client state for shareable, durable UI.
10. Lists use **stable, identity-based keys** — never the array index for dynamic lists.
11. Custom hooks are named `useX` and encapsulate one concern.

**Performance & assets**

12. Favor Server Components to ship less JS; `dynamic()`-import heavy client-only widgets.
13. Use `next/image` for images and `next/font` for fonts; don't ship unbounded client bundles.

**Security in the UI**

14. Never `dangerouslySetInnerHTML` with model-generated or user/RSS content; render as escaped text, sanitize markdown with raw HTML disabled. (See [security.md](../security.md).)
15. Keep a strict CSP; avoid `'unsafe-inline'`/`'unsafe-eval'` — use nonces for any inline script.

---

## Accessibility

The Matrix is a dense, public reference; accessibility is a requirement, not a polish item.

1. **Semantic HTML first** — real `<table>`, `<nav>`, `<button>`, `<a>`, headings in order. Reach for ARIA only to fill a gap semantics can't, and never to paper over a non-semantic element.
2. **Keyboard-complete** — every interaction (column disclosure, modal, nav) is operable by keyboard, with a visible focus indicator and a logical tab order; modals trap and restore focus.
3. **Labels & names** — every control and form field has an accessible name; icon-only buttons have `aria-label`; images carry meaningful `alt` (empty `alt=""` for decorative).
4. **Contrast & motion** — meet WCAG AA contrast (the phase color scale must pass); respect `prefers-reduced-motion`.
5. **Don't rely on color alone** — the matrix heatmap and phase bands must encode meaning with text/shape too, not just hue.
6. **Verify** — automated checks (axe/Lighthouse, a11y assertions in component tests) plus a keyboard-only manual pass before a page ships (Lighthouse a11y ≥ 95). See [testing-qa.md](../testing-qa.md).
