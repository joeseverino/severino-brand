#!/usr/bin/env bash
# One-off: a horizontal lockup (mark + name), light + dark, into kits/<slug>/wordmark/.
# Usage: ./wordmark.sh <slug> <hex> "<text>"
#   ./wordmark.sh site 1E3A8A "Joe Severino"
set -euo pipefail
cd "$(dirname "$0")"
node bin/make-wordmark.mjs "$@"
