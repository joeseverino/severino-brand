// Resolves the live-text font used by the wordmark and card renderers (which
// embed the font and render real text via Chromium). BRAND_FONT overrides it;
// the default is the bundled Inter. The mark uses pre-extracted outlines instead
// (see mark.mjs / BRAND_GLYPHS), so a full font swap sets both.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const DEFAULT_FONT = 'brand/fonts/inter/inter-variable-latin.woff2';

export function fontPath() {
  const f = process.env.BRAND_FONT || DEFAULT_FONT;
  return path.isAbsolute(f) ? f : path.resolve(root, f);
}
