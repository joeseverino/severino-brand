#!/usr/bin/env python3
"""Swap the two brand colors in a mark, keeping its geometry exactly.

Used for the HQ Development vault icon, which must be the precise inverse of HQ
Production: the same JS, the same size, teal on white instead of white on teal.

Re-rendering the transparent mark through the pictogram pipeline cannot do this.
That artwork carries its own padding, so `fit` applies it twice and the mark
lands at 0.39 of the tile against production's 0.63; correcting for that still
finishes 2px off, because 646px artwork will not resample onto a 322px raster.
Next to production in a sidebar, 2px is visible.

Swapping colors in the rendered tile avoids resampling entirely. Every pixel is
a blend of the two colors, so recovering how far along that blend it sits and
rebuilding it from the opposite end preserves anti-aliased edges and leaves the
geometry untouched. Verified: identical bounding box, 322x212 at (95,150).

Usage:
    python3 scripts/invert-mark.py kits/hq/mark/mark-512.png \\
        kits/hq/mark/mark-inverse-512.png

Defaults to the HQ pair, which is the only thing this is used for today. Output
lands under kits/, which is generated and gitignored, so this script is the
reproducible artifact rather than the PNG.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

# The HQ kit's accent and its paper. Read from kits/hq/web/tokens.css, and
# matching a pixel sample of the shipped mark.
TEAL = (31, 77, 87)
WHITE = (255, 255, 255)

DEFAULT_SOURCE = Path("kits/hq/mark/mark-512.png")
DEFAULT_TARGET = Path("kits/hq/mark/mark-inverse-512.png")


def swap(source: Path, target: Path, a: tuple[int, int, int], b: tuple[int, int, int]) -> None:
    """Write ``source`` to ``target`` with colors ``a`` and ``b`` exchanged."""

    delta = tuple(b[i] - a[i] for i in range(3))
    denom = sum(component * component for component in delta)
    if denom == 0:
        raise SystemExit("the two colors are identical, so there is nothing to swap")

    image = Image.open(source).convert("RGBA")
    pixels = image.load()
    out = Image.new("RGBA", image.size)
    out_pixels = out.load()
    width, height = image.size

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            # How far this pixel sits along the line between the two colors.
            position = (
                (red - a[0]) * delta[0] + (green - a[1]) * delta[1] + (blue - a[2]) * delta[2]
            ) / denom
            position = 0.0 if position < 0 else (1.0 if position > 1 else position)
            out_pixels[x, y] = (
                round(b[0] + position * (a[0] - b[0])),
                round(b[1] + position * (a[1] - b[1])),
                round(b[2] + position * (a[2] - b[2])),
                alpha,
            )

    out.save(target)


def main(argv: list[str]) -> int:
    source = Path(argv[1]) if len(argv) > 1 else DEFAULT_SOURCE
    target = Path(argv[2]) if len(argv) > 2 else DEFAULT_TARGET
    if not source.is_file():
        raise SystemExit(f"{source} does not exist")
    swap(source, target, TEAL, WHITE)
    print(f"wrote {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
