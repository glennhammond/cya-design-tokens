# CYA Design Tokens

The code side of **CYA Design System 2.0**: one versioned package that every Corporate Yoga Australia and Wellbeing Studio codebase installs, so colours, fonts, corners and buttons are identical everywhere.

- Design system (guidance, components, logos, photography): https://claude.ai/artifact/NrFu9Esk1ob8ZQMAaggXR6
- This repo is the **source of truth for values**. The design system page documents them and is re-synced from here.

## What's inside

| Import | What it gives you |
|---|---|
| `cya-design-tokens/index.css` | Tokens, type classes, base element styles and component classes in one import (fonts load separately) |
| `cya-design-tokens/theme.css` | Tailwind 4 theme: `bg-teal`, `text-charcoal`, `border-border-control`, `font-heading`, `font-body`, `rounded-md` (8px), `shadow-raised` |
| `cya-design-tokens/tokens.css` | CSS variables only, all prefixed `--cya-` |
| `cya-design-tokens/fonts.css` | Self-hosted Urbanist and Open Sans. Import it from JavaScript, not from CSS (see below) |
| `cya-design-tokens/type.css` | `.cya-display`, `.cya-heading-xl` to `.cya-heading-sm`, `.cya-body`, `.cya-kicker` and the rest |
| `cya-design-tokens/base.css` | Body, heading, link and focus defaults |
| `cya-design-tokens/components.css` | `.cya-btn`, `.cya-input`, `.cya-label`, `.cya-kicker`, `.cya-section`, `.cya-container`, `.cya-card`, surface classes |
| `cya-design-tokens` (JS) | `tokens.colors.gold` and so on, resolved hex values for charts, emails and PDFs |
| `cya-brand-check` | Command that flags off-palette colours, retired fonts, "programme", "CYA" in public copy, em dashes and headings ending in a full stop |

## Install

Straight from GitHub, pinned to a release tag. No registry needed.

```bash
npm install github:glennhammond/cya-design-tokens#<commit or tag>
```

## Use it

### Next.js or Vite with Tailwind 4

In the global stylesheet (for example `app/globals.css`):

```css
@import "tailwindcss";
@import "cya-design-tokens/index.css";
@import "cya-design-tokens/theme.css";
```

Then:

```tsx
<a href="/contact" className="cya-btn cya-btn--primary">Plan with us</a>
<h2 className="cya-heading-lg">Work wellness into your workday</h2>
<p className="text-text-muted">Sessions run on site, by livestream or in Wellbeing Studio.</p>
```

**Fonts in Next.js:** use `next/font`, which self-hosts and preloads them. Replace the Plus Jakarta Sans setup in the root layout with:

```tsx
import { Urbanist, Open_Sans } from "next/font/google";

const heading = Urbanist({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-cya-heading" });
const body = Open_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-cya-body" });

// <html lang="en-AU" className={`${heading.variable} ${body.variable}`}>
```

The tokens pick up `--font-cya-heading` and `--font-cya-body` automatically.

**Fonts in Vite or anything else:** import the self-hosted faces from your JavaScript entry, so the bundler resolves the font files:

```ts
import "cya-design-tokens/fonts.css";
```

Don't `@import` `fonts.css` from a stylesheet that Tailwind processes: Tailwind inlines it without rewriting the font paths, and the fonts fail to load.

Note: `theme.css` sets Tailwind's `rounded-md` to 8px and `font-sans` to Open Sans, deliberately, so the defaults are on-brand.

### Without Tailwind

```ts
import "cya-design-tokens/fonts.css";
import "cya-design-tokens/index.css";
```

### JavaScript

```ts
import { tokens } from "cya-design-tokens";
chart.color = tokens.colors.teal; // "#115e67"
```

## Brand check

Add a script to each project:

```json
"qa:brand": "cya-brand-check app components --copy content"
```

Copy `cya-brand.config.example.json` to `cya-brand.config.json` to set paths once. Use `--warn` to report without failing while a project is mid-migration. Add the comment `cya-brand-ignore` to a line to skip it, for internal-only strings such as a short name in config. Logo-only colours are deliberately not allowed in code. SVG files are not scanned, so logos are safe.

## Changing the brand

1. Edit `src/tokens.json` (never `dist/`).
2. `npm run build`.
3. Update `CHANGELOG.md` and the `version` in `package.json` and `src/tokens.json`. Breaking visual change: major (3.0.0). New token: minor (2.1.0). Fix: patch.
4. Commit, tag (`git tag v2.1.0`), push with tags.
5. Re-sync the design system page from this repo.
6. Bump each project's install tag when you're ready to adopt it.

`npm run check` rebuilds and fails if `dist/` is out of date, so it can run in CI.

## Fonts

Urbanist and Open Sans are under the SIL Open Font Licence (`fonts/OFL-*.txt`). Latin subsets only.
