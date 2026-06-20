#!/usr/bin/env bash
# One-off: the icon set + mark for one kit, into kits/<slug>/ (icons/ + mark/).
# Usage: ./mark.sh <slug> <hex> [glyph]
#   ./mark.sh hq 1f4d57
set -euo pipefail
cd "$(dirname "$0")"
node bin/make-mark.mjs "$@"
