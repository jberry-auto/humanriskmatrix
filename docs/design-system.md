# Design System

The visual + interaction language for humanriskmatrix.org: a **formal "serif revival"** — editorial, clean, buttoned-up — built on **accessible primitives** so the dense matrix UI is correct for keyboard and screen-reader users from the start.

- **Type:** Source Serif 4 (headings) · Source Sans 3 (body + UI) · Source Code Pro (mono / MITRE IDs).
- **Color:** **light mode only** for now; warm ink-on-paper with an evergreen accent.
- **Primitives:** [React Aria Components](https://react-aria.adobe.com/) (`react-aria-components`), styled with Tailwind v4 via the `tailwindcss-react-aria-components` plugin.

## Principles

1. **Editorial & formal** — serif display, generous whitespace, hairline borders, minimal shadows, small radii.
2. **Accessibility is non-negotiable** — interactive components come from React Aria (keyboard, focus management, ARIA built in). Verify a keyboard-only pass before shipping any page.
3. **Never color alone** — phase color always accompanies a text label (and/or shape). See `Tag`.
4. **Light is the default**, with a dark theme available via the header toggle. Tokens are CSS variables, so dark is a token override — components need no `dark:` variants.
5. **Server by default** — presentational components are Server Components; only interactive primitives are `'use client'`.

## Foundations

### Color tokens
Defined in `app/globals.css` `@theme`; consumed as Tailwind utilities (`bg-bg`, `text-ink`, `border-border`, `bg-accent`, `text-phase-internal`, …). The table shows **light** (default) values; the **dark** theme overrides the same tokens under `.dark` (see Theming).

| Token | Hex | Use |
|---|---|---|
| `bg` | `#FAF8F3` | page background (warm paper) |
| `surface` | `#FFFFFF` | cards, popovers, dialogs |
| `ink` | `#1B1A17` | primary text |
| `muted` | `#5C5A52` | secondary text |
| `faint` | `#8A877D` | captions, placeholders |
| `border` | `#E4E0D6` | hairline borders |
| `border-strong` | `#D4CFC1` | emphasized borders |
| `accent` | `#21603C` | links, focus, primary actions (evergreen) |
| `accent-hover` | `#1A4E31` | hover/pressed accent |
| `accent-contrast` | `#FFFFFF` | text on accent |
| `accent-subtle` | `#E8F0EA` | tinted accent background |

**Phases** (muted/editorial, cool→warm): `phase-internal #3F6E8C` · `phase-approach #4E5C8A` · `phase-deception #6B5080` · `phase-imposition #9A5B57` · `phase-alignment #8C3B36`. All meet WCAG AA against paper; always paired with a label.

### Typography
Families: `font-serif` (Source Serif 4), `font-sans` (Source Sans 3, default body), `font-mono` (Source Code Pro). Loaded self-hosted via `next/font` in `app/layout.tsx` (no external font origin → CSP `font-src 'self'`). Base layer sets body = sans 17px/1.6, and `h1–h4` = serif. Use the `Heading` component for headings (semantic level decoupled from visual `size`).

### Spacing, radii, borders, shadows, focus
- Radii: `rounded-sm` (2px) · `rounded-md` (4px) · `rounded-lg` (8px) — small and formal.
- Borders: 1px hairline (`border-border`).
- Shadows: minimal; only on overlays (dialog/popover).
- Focus: visible 2px accent outline with offset (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`). Never remove focus rings.

## Components (`src/components/ui/`)

Import via the `@/components/ui/*` alias. **Server** (presentational): `Container`, `Section`, `Card`, `Heading`, `Eyebrow`, `Prose`, `Tag`. **Client** (React Aria, `'use client'`): `Button`, `Link`, `Disclosure`, `Tabs`, `Dialog`, `SideSheet`, `TextField`, `Checkbox`, `ThemeToggle`.

| Component | Notes |
|---|---|
| `Container` | Centered max-width page gutter. |
| `Section` | Semantic `<section>` with vertical rhythm; forwards attrs (e.g. `aria-labelledby`). |
| `Heading` | `level` (1–4, semantic) + optional `size` (`display`→`h4`, visual). Serif. |
| `Eyebrow` | Small-caps label above a heading. |
| `Card` | Surface with hairline border. |
| `Prose` | Long-form/MDX wrapper: measured width, rhythm, styled links/lists. |
| `Tag` | Label; optional `phase` adds a color dot — **label text always present**. |
| `Button` | RAC Button. `variant` = primary/secondary/ghost, `size` = sm/md. Use for actions; use `Link` for navigation. |
| `Checkbox` | RAC Checkbox styled to tokens; render-prop box with check + focus ring. Controlled via `isSelected`/`onChange`. |
| `SideSheet` | Right-anchored, full-height modal drawer (focus-trap, Esc/click-away). Controlled via `isOpen`/`onOpenChange`. Used for the matrix technique detail. |
| `Link` | RAC Link, client-routed via the provider. `variant` = default/nav. External links fall back to normal navigation. |
| `Disclosure` | RAC Disclosure: accessible expand/collapse (used for matrix column detail). |
| `Tabs` | RAC Tabs from a `{ id, label, content }[]` + accessible `label`. |
| `Dialog` | RAC modal dialog: focus trap, escape, scroll lock. Pass a `trigger` (a `Button`) + `title`. |
| `TextField` | RAC field: `Label`/`Input`/description/error wired for accessibility. |

A live reference renders every component at **`/styleguide`** (noindexed) — use it for visual + keyboard QA.

## How to consume

- **Styling:** Tailwind utilities from the tokens above. React Aria state variants come from the plugin — use `hovered:`, `pressed:`, `selected:`, `focus-visible:`, `disabled:`, `group-data-[expanded]:` etc. (no `data-` prefix). Configured in `app/globals.css` via `@plugin "tailwindcss-react-aria-components"`.
- **Routing:** `app/providers.tsx` wraps the app in React Aria's `RouterProvider` wired to `next/navigation`, so RAC `Link`/components do client routing. It is the single root client boundary; pages stay Server Components.
- **Secret boundary:** components are infrastructure — never import `src/config` or secrets, and never receive secrets as props (`docs/security.md`).

## Theming (light + dark)
**Light is the default.** A `ThemeToggle` (sun/moon, top-right of the header) switches to dark via [`next-themes`](https://github.com/pacocoursey/next-themes), configured in `app/providers.tsx` with `attribute="class"`, `defaultTheme="light"`, `enableSystem={false}` (we don't follow the OS — light is the intended default). It toggles `.dark` on `<html>`; `app/globals.css` overrides the neutral/accent/phase tokens under `.dark` (and sets `color-scheme: dark`). Because every component styles from tokens, **dark needs no component changes**.

- `<html>` carries `suppressHydrationWarning` (next-themes sets the class before paint).
- `ThemeToggle` renders a placeholder until mounted to avoid a hydration mismatch.
- The no-flash inline script relies on the current CSP allowing inline scripts (M0 baseline). When the strict nonce-based CSP lands, pass that nonce to `ThemeProvider`.

Dark palette: warm near-black `bg #14130F` / `surface #1C1B17`, ink `#ECE9E0`, a lightened evergreen `accent #6FBF8E`, and lightened phase colors — all chosen for AA contrast on the dark background.

See also: [`style-guide.md`](style-guide.md) (repo conventions), [`engineering-standards/style-guide-react-nextjs.md`](engineering-standards/style-guide-react-nextjs.md) (framework rules), [`architecture.md`](architecture.md) (layering + client boundary).
