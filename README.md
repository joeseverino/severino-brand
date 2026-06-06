# severino-brand

Joe Severino's brand, defined as data and rendered by
[branding-engine](../../Projects/branding-engine).

The brand was shaped and proven on [jseverino.com](https://jseverino.com), so the
site is its flagship example. This repo is where the brand is *defined*; the
engine turns it into kits.

## Layout

```
brand/      THE BRAND: the single source of truth
  brand.json     name, weight, primary identity, card copy
  surfaces.json  the other surfaces (inherit the brand, override what differs)
  tokens.json    design-system token reference
  fonts/  portrait.jpg
kits/       GENERATED: delete it, run `npm run build`, get it back identical
  joe-severino/  the brand's own kit
  hq/            a surface
  cards/         brand-wide social cards
```

The generators live in their own repo (`branding-engine`) and come in as a
dependency. Nothing Severino-specific lives in the engine.

## The brand model

`brand/brand.json` is the brand: name, weight, the **primary identity** (navy, the
`JS` glyph, "Joe Severino"), and the card copy. `brand/surfaces.json` lists the
other faces, which **inherit** the font and glyph and override only what differs:

```json
{ "hq": { "color": "#1f4d57", "wordmark": "Severino HQ" } }
```

To add or change a surface, edit those files and run `npm run build`. One fact
lives in one place.

## Commands

```sh
npm run build                                   # rebuild every kit from brand/ + cards
npm run kit -- <slug> <hex> <initials> "Name"   # a one-off kit (mark, wordmark, sheet, web)
npm run kit -- acme ff5733 AC "Acme Corp"
```

These wrap the `branding-engine` CLI; see its README for all flags (`--only`,
`--font`, `--out`).

## What every kit gives you

- **`icons/`**: `favicon.svg/.ico`, `favicon-32/192.png`, `apple-touch-icon.png` (180, full-bleed for iOS).
- **`mark/`**: `mark.svg`, `mark-512/1024.png`, and transparent variants for light and dark surfaces.
- **`wordmark/`**: the mark + name lockup, vector-first: `wordmark.svg` (text in `currentColor`) with `wordmark-light/dark.png` rasterized from it, plus all-caps `wordmark-caps.*`.
- **`sheet/`**: the poster `overview.png` and its section images (`palette`, `type-specimen`, `sheet-mark`), in the kit's font.
- **`web/`**: drop-in wiring: `tokens.css` (palette as CSS vars), `site.webmanifest`, `head.html` (the favicon + theme-color `<link>` block).
- **`README.md`**: the brand sheet, inlining the poster and section images.

## Fonts

The monogram can be any initials (`A–Z`, `0–9` are bundled). To render the brand
in a different typeface, set `"font"` in `brand/brand.json` (relative to `brand/`)
and rebuild. The bundled Inter needs no python; a custom font is extracted on
first use and needs `python3` + `fonttools`.

## Requirements

`npm install` pulls the engine (sharp, plus an optional headless browser used only
for the sheet and social cards).
