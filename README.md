# severino-brand

Joe Severino's brand, defined as data and rendered by
[branding-engine](https://github.com/joeseverino/branding-engine)
([npm](https://www.npmjs.com/package/branding-engine)).

The brand was shaped and proven on [jseverino.com](https://jseverino.com), so the
site is its flagship example. This repo is where the brand is *defined*; the
engine turns it into kits.

## Layout

```
brand/      THE BRAND: the single source of truth
  brand.json     name, weight, primary identity, card copy
  surfaces.json  the other surfaces (inherit the brand, override what differs)
  tokens.json    design-system token reference
  sync.mjs       SHARED: read/splice/render primitives for projecting tokens.json
                 into a consumer's own file (the site's base.css, the vault's
                 Obsidian theme) — consumers own their targets, not a copy of the logic
  fonts/  portrait.jpg
kits/       GENERATED: delete it, run `npm run build`, get it back identical
  joe-severino/  the brand's own kit  (tracked)
  cards/         brand-wide social cards  (tracked)
  …              one-off / surface kits are private — git-ignored by default
bin/brand          CORDON EMITTER (Node): derives build/kit from package.json
contract/brand.json  GENERATED: the cordon-v4 command-surface contract
```

## Cordon contract

This repo emits its `build`/`kit` command surface as a
[Cordon](https://github.com/joeseverino/cordon) v4 contract — the fleet's first
**Node** emitter. Emit once: `bin/brand` *derives* the surface from this repo's
`package.json` scripts via cordon's reusable [`emitters/node`](https://github.com/joeseverino/cordon/tree/main/emitters/node)
(referenced, never vendored). Each command's `delegates` is the literal
`branding-engine` command its script runs, and the only thing declared by hand is
each command's `local_write` blast radius — nothing about the surface is typed
twice. It follows cordon's tool convention — an executable `bin/<tool>` answering
`--describe` — so the reusable `cordon / gate` covers it unchanged (`conformance`
validates the contract; `drift` diffs it). `tools/bin/brand` is the launcher and
*derives* build/kit from this contract rather than redeclaring them.

```sh
bin/brand --describe      # print the contract
npm run describe:write    # regenerate contract/brand.json after a scripts change
bin/brand --check         # fail if the committed contract is stale
```

`bin/brand` only **emits** — it is not a launcher. Build with `npm run build` /
`npm run kit` (or `brand build` via the tools CLI).

The generators live in their own public repo (`branding-engine`) and come in as
an npm dependency (`^0.2.1`). Nothing Severino-specific lives in the engine.

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
and rebuild. The engine reads the glyph outlines directly (via `opentype.js`),
so any `.ttf`/`.otf`/`.woff2` works with no extra tooling.

## Requirements

`npm install` pulls the engine (sharp, plus an optional headless browser used only
for the sheet and social cards).
