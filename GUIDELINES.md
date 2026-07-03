# Severino Brand Kit

The Severino brand: the mark, palette, type and motion system, voice, and how it
all gets applied. This kit is the brand's home and stands on its own.

The brand was shaped and proven on [jseverino.com](https://jseverino.com), so the
site runs through this guide as the flagship example. Most decisions here are
something you can go see live. New surfaces take their cues from this document,
not from any one implementation.

---

## Personality

A working security and infrastructure engineer's site. The brand reads the way
the work does: precise, calm, technical, built to be inspected. The site itself
is the brand statement: static, locked-down, reviewable, no tracking theater. The
voice is a competent engineer talking to peers, not a personal brand performing.

Navy, not purple. The 2026 rebrand moved the primary off a purple family onto a
deep navy (`#1E3A8A`). Navy carries the trust-and-infrastructure register the old
purple didn't; it sits better next to the terminal palette that runs through the
writeups.

---

## The mark

A `JS` monogram built from real Inter (weight 800) glyph outlines, so it matches
the brand typeface instead of approximating it. It is composed programmatically,
not drawn: the `branding-engine` lays out bundled glyph outlines into the mark.

**Construction** (the numbers that define it, in `mark.mjs`):

| Param | Value | Meaning |
|---|---|---|
| Glyph | `JS` | Joe Severino |
| Weight | Inter 800 | the brand's heaviest type |
| Letter-spacing | `-0.045em` | tight pairing of the two letters |
| Ink width | `0.63` of box | glyph fills 63% of the canvas width |
| Corner radius | `0.22` of box | the rounded-square container |
| Tile fill | accent color | navy `#1E3A8A` (site), teal `#1f4d57` (HQ) |
| Glyph on tile | `#ffffff` | white glyph |

**Variants** (per kit, in `kits/<slug>/mark/`, e.g. `kits/joe-severino/` navy, `kits/hq/` teal):

- `mark.svg` / `mark-512.png` / `mark-1024.png`: rounded accent tile, white glyph.
  The default. Use anywhere the mark needs its own footprint.
- `mark-transparent-light.png`: accent glyph, no tile. For light surfaces where a
  tile would be visual noise.
- `mark-transparent-dark.png`: white glyph, no tile. For dark surfaces.

**Rules:**

- Don't recolor the glyph or the tile outside a surface's accent + white.
- Don't re-typeset `JS` in another font to fake the mark. Regenerate it
  (`npm run kit -- <slug> <hex> JS --only mark`) so it stays real Inter.
- Keep clearspace of at least one glyph stroke around the tile.
- The favicon and app icons (`kits/<slug>/icons/`) are the same mark down-rendered;
  don't substitute a different glyph at small sizes.

---

## Wordmark / lockup

When the brand needs to sign something with the full name, pair the mark with a
wordmark: the tile, then the name set in Inter, on one baseline.

- **Construction:** mark tile, a gap of roughly one tile-width, then the wordmark
  in Inter weight 700 (`wordmarkWeight`, lighter than the mark), the ink box
  centered on the tile. Title case sets `letter-spacing -0.03em`; the all-caps
  variant matches the site at `-0.02em`.
- **Vector-first:** `wordmark.svg` is the source, built from real Inter outlines
  (no raster, no headless browser); its text ink is `currentColor`. The PNGs are
  rasterized from it.
- **Color:** the SVG inherits the surrounding text color; the PNGs ship dark ink
  (`#0b0620`) for light backgrounds and white for dark. The tile keeps its accent.
- **Variants** (in `kits/<slug>/wordmark/`): title case `wordmark.svg` +
  `wordmark-light/dark.png`, and all-caps `wordmark-caps.svg` +
  `wordmark-caps-light/dark.png`. Site reads "Joe Severino"; HQ reads "Severino HQ".
- Regenerate with `npm run kit -- <slug> <hex> <initials> "<text>" --only wordmark`.
- Use the bare mark, not the lockup, when space is tight (favicons, avatars, tiles).

---

## Color

### Brand

| Token | Hex | Use |
|---|---|---|
| `navy` | `#1E3A8A` | primary: links, interactive accent, the mark tile, `theme-color` |
| `navyDeep` | `#14245C` | hover / active states, card gradient end |
| `onNavy` | `#ffffff` | text and glyph on navy |

Social-card palette (used by the OG and social cards):

| Token | Hex |
|---|---|
| `card.accent` | `#5B82D6` |
| `card.textSoft` | `#DDE6FB` |
| `card.textMuted` | `#A9C0E8` |

### Interface (semantic)

These are the themeable UI tokens. A future dark mode flips these and only these.

| Token | Value | Role |
|---|---|---|
| `--color-bg` | `#ffffff` | page background |
| `--color-text` | `#0b0620` | body text |
| `--color-text-alt` | `#4C63A0` | secondary / muted-navy text |
| `--color-soft` | `#eff3fb` | soft navy-tinted fill |
| `--color-muted` | `#6E6B7C` | de-emphasized text |
| `--color-border` | `color-mix(in oklch, text 8%)` | hairlines, derived from text |
| `--color-success` / `--color-error` | `#166534` / `#991b1b` | form + status |

### Terminal signature (tokenized, stays dark)

The code-block and terminal palette is a tokenized group (`--code-*`, `--term-*`)
that stays dark regardless of theme: it represents a real terminal, not a
themeable surface. The site is light-only, so these never recolor — but they are
still named so the whole palette reads in one place and changes in one edit.

| Token | Hex | Where |
|---|---|---|
| `--code-bg` / `--code-fg` | `#020617` / `#d1d5db` | standalone code blocks |
| `--term-bg` / `--term-fg` | `#0b1220` / `#e2e8f0` | terminal block surface + text |
| `--term-bar-bg` / `--term-bar-fg` | `#111827` / `#94a3b8` | terminal title bar |
| `--term-border` | `rgb(148 163 184 / 12%)` | terminal hairlines |
| `--term-prompt` / `--term-cmd` / `--term-out` | `#38bdf8` / `#f8fafc` / `#4ade80` | prompt, command, output |
| `--term-dot-red` / `-amber` / `-green` | `#ef4444` / `#f59e0b` / `#22c55e` | window dots |

### Token rule

Every color is a named token. There is no literal-vs-token judgment call: the
palette lives in one place, so any change is one edit and the system has no
exceptions to remember. Tokens that represent a *themeable role* (navy-derived
fills, hairlines) recolor with the accent; the terminal group is named for
single-source clarity but stays dark.

---

## Typography

**Inter**, a single variable woff2 (`weight 200–900`), is the entire type system,
shipped as branding-engine's bundled default (no local copy). Fallback:
`system-ui, sans-serif`. Monospace for code and terminal:
`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.

**Weights in use:** 400 body · 500 nav links · 600 headings and strong · 650
active nav · 700 eyebrows and labels · 800 the mark.

**Scale** is fluid `clamp()` per step, not a fixed ladder. The verbose form is
intentional: it gives per-step control over how fast each size grows with the
viewport. Do not simplify to raw `vw`.

| Token | Value | Used by |
|---|---|---|
| `--font-xs` | `clamp(14px, …, 16px)` | eyebrows, fine print |
| `--font-sm` | `1rem` | small UI |
| `--font-base` | `clamp(0.875rem, …, 1.125rem)` | body |
| `--font-md` | `1.25rem` | lead UI text |
| `--font-lg` | `clamp(1.25rem, …, 1.75rem)` | h3 |
| `--font-xl` | `clamp(1.39rem, …, 2.25rem)` | h2 |
| `--font-xxl` | `clamp(1.5rem, …, 3rem)` | h1 |
| `--font-prose-sm` / `-md` | prose sub-headings | h4, lead paragraphs |

Headings: weight 600, `line-height 1.15`, `letter-spacing -0.02em`. Body:
`line-height 1.6`. Eyebrows: weight 700, uppercase tracking `letter-spacing
0.12em`. Full values live in `brand/tokens.json` → `designSystem`.

---

## Motion

Restrained and consistent. One easing, a small set of durations, and it all
yields to `prefers-reduced-motion`.

| Token | Value |
|---|---|
| `--motion-duration-instant` | `120ms` |
| `--motion-duration-fast` | `150ms` (most hover transitions) |
| `--motion-duration-standard` | `200ms` |
| `--motion-duration-deliberate` | `220ms` |
| `--motion-stagger-step` | `55ms` (list/card stagger) |
| `--motion-ease-standard` | `ease` |

---

## Voice and copy

The copy rules are part of the brand. They keep the writing sounding like a
person, not a content engine.

- **Concrete and specific.** No AI-flavored buzzwords, no filler preamble. Say
  the actual thing.
- **No em dashes.** Known AI tell. Use periods, colons, parentheses, or commas.
  En dashes in numeric ranges (`1–2 MB`) are fine.
- **Imperative or direct address**, never third-person "the operator." This is a
  solo site; write to the reader or state the action.
- **Minimal footer:** View Source plus social icons, nothing else. No privacy /
  copyright / sitemap clutter, even when a scanner asks for it.
- **Private links** to tailnet-only services use the tooltip convention:
  `[Text](url "private: message")`.

---

## Applications

- **The website** is the flagship example. When in doubt about how a brand
  decision should look, go look at the live site.
- **Favicons / app icons** (`kits/<slug>/icons/`, with `web/site.webmanifest` and
  `web/head.html` to wire them in): the mark down-rendered, `theme-color` set to
  the kit's accent.
- **OG card** (`kits/cards/og-default.png`, 1200×630) and **GitHub social card**
  (`kits/cards/github-social-preview.png`, 1280×640): rendered in real Inter via
  headless Chromium. Regenerate with `npm run build`.
- **Portrait** (`brand/portrait.jpg`): the Person image used in structured data
  and as the card photo.

---

## Asset index

| File | What |
|---|---|
| `kits/<slug>/mark/` | mark: `mark.svg`, `mark-512/1024.png`, transparent light/dark |
| `kits/<slug>/icons/` | `favicon.svg/.ico`, `favicon-32/192.png`, `apple-touch-icon.png` (180) |
| `kits/<slug>/wordmark/` | lockup: `wordmark.svg` + light/dark PNGs, plus `-caps` variants |
| `kits/<slug>/sheet/` | poster `overview.png` + section images |
| `kits/<slug>/web/` | `tokens.css`, `site.webmanifest`, `head.html` |
| `kits/cards/` | OG (1200×630) + GitHub social (1280×640) cards |
| `brand/brand.json` · `surfaces.json` | the brand definition |
| `brand/portrait.jpg` | portrait / Person image / card photo |
| `brand/tokens.json` | design-system token reference |
| `LICENSE` | all rights reserved |

---

## Regenerating

```sh
npm run build                                   # rebuild every kit from brand/ + cards
npm run kit -- <slug> <hex> <initials> "Name"   # one full kit (mark, wordmark, sheet, web)

# or the engine CLI directly, for finer control:
npx branding-engine kit <slug> <hex> <initials> "Name" --only mark,wordmark
```

One monogram, any accent color. The mark and wordmark are pure vector from real
Inter outlines; only the cards and sheet render live text via headless Chromium
(it reuses the cached browser). See the README and the `branding-engine` README
for the full output list and flags.
