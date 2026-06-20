#!/usr/bin/env bash
# One-off: the OG + GitHub social cards, into kits/cards/.
# Usage: ./cards.sh
set -euo pipefail
cd "$(dirname "$0")"
node bin/make-cards.mjs "$@"
