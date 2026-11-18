# Changelog

## 2.2.0 (18 November 2026)

Breaking for any project that uses the retired values or classes; `cya-brand-check` flags the colours.

- **One button style** (Glenn, 18 Nov 2026). `.cya-btn` is the gold button on its own: Urbanist 700 at 19px, 52px high (`--cya-button-height`), 8px corners, white text, hover `gold-hover`. `.cya-btn--primary` still works and is the same style.
- **Secondary and on-deep buttons retired.** `.cya-btn--secondary` and `.cya-btn--on-deep` are removed. Use `.cya-link` (or `.cya-btn--text`) for every other action: Open Sans 600, 15px, deep teal, underlined, white inside `.cya-surface-deep`.
- **Gold deepened** from #CA8D26 to #C28624, so white on gold is 3.1:1 and passes WCAG 2.2 AA as large text at the button's 19px bold. Never set white on gold below 19px bold.
- **Green grey (#E7ECE8) retired**, with `surface-quiet` and `.cya-surface-quiet`. Alternate `surface-page` and `surface-card` instead. `border-hairline` now uses the new `charcoal-hairline` (#DEDFDB, charcoal at 12% on warm white).
- **Logo colours** `logo-teal` and `logo-pale` match the original logo files again (#5CB8B2, #BEE3E0).
- `button` type style moves to Urbanist 700, 19px.

## 2.1.0 (10 November 2026)

- `cya-brand-check` flags headings that end in a full stop: `heading`, `headline` and `title` fields, and JSX `<h1>` to `<h6>`. Headings never end in a full stop (Glenn, 10 Nov 2026).

## 2.0.0 (10 November 2026)

First release, matching CYA Design System 2.0.

- Urbanist headings (600, 700, 800) and Open Sans body (400, 600, 700), self-hosted.
- 1.3 palette plus gold hover (#9C691B), charcoal muted (#5A6465), charcoal border (#878F90), error and success.
- CTAs: signature gold #CA8D26, white text, 8px corners, 48px minimum height.
- Tailwind 4 theme, shared component classes, JavaScript export and the `cya-brand-check` command.
