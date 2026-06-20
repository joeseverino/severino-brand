#!/usr/bin/env bash
# One-off: the drop-in web wiring for a kit (tokens.css, site.webmanifest,
# head.html) into kits/<slug>/web/.
# Usage: ./web.sh <slug> <hex> [glyph] [name]
set -euo pipefail
cd "$(dirname "$0")"
node bin/make-web.mjs "$@"
