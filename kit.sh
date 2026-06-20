#!/usr/bin/env bash
# Combo: a full kit for one surface = mark set + wordmark (when text is given).
# Pass a font as the 5th arg to render the whole kit in a different typeface.
# The "make a different two-letter, two-color kit real quick" command.
#
# Usage: ./kit.sh <slug> <hex> <initials> ["Wordmark"] [font]
#   ./kit.sh acme ff5733 AC "Acme Corp"
#   ./kit.sh scratch 7c3aed XY                              # mark only
#   ./kit.sh acme ff5733 AC "Acme Corp" ~/fonts/Space.ttf  # whole kit in Space
set -euo pipefail
cd "$(dirname "$0")"
slug="${1:?usage: ./kit.sh <slug> <hex> <initials> [\"Wordmark\"] [font]}"
hex="${2:?usage: ./kit.sh <slug> <hex> <initials> [\"Wordmark\"] [font]}"
glyph="${3:-JS}"
wordmark="${4:-}"
font="${5:-}"

if [ -n "$font" ]; then
  stem="$(basename "$font")"; stem="${stem%.*}"
  python3 bin/lib/extract-glyphs.py "$glyph" 800 "$font" "${stem}-glyphs.json"
  export BRAND_GLYPHS="${stem}-glyphs.json" BRAND_FONT="$font"
fi

node bin/make-mark.mjs "$slug" "$hex" "$glyph"
if [ -n "$wordmark" ]; then node bin/make-wordmark.mjs "$slug" "$hex" "$wordmark" "$glyph"; fi
node bin/make-sheet.mjs "$slug" "$hex" "$glyph" "$wordmark"
node bin/make-web.mjs "$slug" "$hex" "$glyph" "$wordmark"
