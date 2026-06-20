#!/usr/bin/env bash
# Rebuild the whole brand: every surface in surfaces.json + the social cards.
# The "update all my brand shit" command. Edit surfaces.json, then run this.
# Usage: ./build.sh
set -euo pipefail
cd "$(dirname "$0")"
node bin/build.mjs
