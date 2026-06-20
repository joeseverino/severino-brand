#!/usr/bin/env bash
# One-off: extract glyph outlines into bin/lib/<font>-glyphs.json. Defaults to
# Inter; pass any .ttf/.otf/.woff2 to experiment. Needs Python + fonttools
# (pip install -r requirements.txt).
# Usage: ./glyphs.sh "<chars>" [weight] [font] [out.json]
#   ./glyphs.sh "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" 800
#   ./glyphs.sh "AB" 700 ~/fonts/SomeFont.ttf
set -euo pipefail
cd "$(dirname "$0")"
python3 bin/lib/extract-glyphs.py "$@"
