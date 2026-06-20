// Shared glyph-outline cache management. A cache is the JSON that
// extract-glyphs.py writes: { font, unitsPerEm, weight, glyphs }. Both the mark
// (uppercase monogram at the brand weight) and the wordmark (mixed case at the
// lighter wordmark weight) sit on this, so extraction logic lives in one place.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_FONT, fontPath } from './font.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

// The wordmark cache bundles the whole alphabet (both cases), digits, and space,
// so any name renders from the default-font cache without re-extracting — the
// same reason the mark cache bundles A-Z/0-9. Text-driven extraction would let a
// one-off ("./kit.sh chris-blake …") overwrite the shared set with its own chars.
export const WORDMARK_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';

// True when the cache file exists and already covers this font, weight, and
// every character (a missing glyph or a font/weight change forces a re-extract).
export function cacheCovers({ file, font, weight, chars }) {
  const p = path.resolve(here, file);
  if (!existsSync(p)) return false;
  try {
    const g = JSON.parse(readFileSync(p, 'utf8'));
    if (font && g.font !== path.basename(font)) return false;
    if (weight != null && Number(g.weight) !== Number(weight)) return false;
    return [...chars].every((ch) => g.glyphs && g.glyphs[ch]);
  } catch {
    return false;
  }
}

// Extract `chars` from `font` at `weight` into `file` unless the cache already
// covers them. Throws with an actionable message if python3/fonttools is absent.
export function ensureGlyphs({ file, font = fontPath(), weight, chars, label = file }) {
  if (cacheCovers({ file, font, weight, chars })) return;
  const charset = [...new Set([...chars])].join('');
  console.log(`Extracting ${label} "${charset}" @ ${weight} from ${path.basename(font)}`);
  try {
    execFileSync(
      'python3',
      [path.resolve(here, 'extract-glyphs.py'), charset, String(weight), font, file],
      { stdio: 'inherit', cwd: path.resolve(here, '..', '..') },
    );
  } catch {
    throw new Error(
      `Could not extract glyphs into ${file}. Needs python3 + fonttools ` +
        `(pip install -r requirements.txt), or run it yourself:\n` +
        `  ./glyphs.sh "${charset}" ${weight} "${font}" ${file}`,
    );
  }
}

export function loadGlyphs(file) {
  return JSON.parse(readFileSync(path.resolve(here, file), 'utf8'));
}

// The wordmark's outline cache. Defaults to wordmark-glyphs.json (the bundled
// Inter set); a one-off in a custom font gets its own file so Inter's cache is
// never clobbered. Both the generator (extract) and the renderer (load) call
// this so they always agree on the filename.
export function wordmarkGlyphFile() {
  if (process.env.BRAND_WORDMARK_GLYPHS) return process.env.BRAND_WORDMARK_GLYPHS;
  const f = process.env.BRAND_FONT;
  if (f && path.basename(f) !== path.basename(DEFAULT_FONT)) {
    return `${path.basename(f).replace(/\.[^.]+$/, '')}-wordmark-glyphs.json`;
  }
  return 'wordmark-glyphs.json';
}
