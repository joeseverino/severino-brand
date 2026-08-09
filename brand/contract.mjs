import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { renderDesignSystemRoot } from './sync.mjs';

export const BRAND_CONTRACT_SCHEMA = 1;

const tokenBytes = readFileSync(new URL('./tokens.json', import.meta.url));
export const tokenDigest = `sha256-${createHash('sha256').update(tokenBytes).digest('hex')}`;
export const tokens = JSON.parse(tokenBytes);

function required(value, path) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required brand token: ${path}`);
  }
  return value;
}

const brand = tokens.brand;
const light = tokens.designSystem;
const dark = tokens.designSystemDark;

// The normalized, versioned boundary consumed by websites and other surfaces.
// Every semantic mapping is derived here once; consumers serialize or render it.
export const webContract = Object.freeze({
  schema: BRAND_CONTRACT_SCHEMA,
  digest: tokenDigest,
  identity: brand,
  surfaces: Object.freeze({
    light: required(light['--color-bg'], 'designSystem.--color-bg'),
    dark: required(dark['--color-bg'], 'designSystemDark.--color-bg'),
  }),
  cardColors: Object.freeze({
    panel: required(brand.navy, 'brand.navy'),
    panelDeep: required(brand.navyDeep, 'brand.navyDeep'),
    onPanel: required(brand.onNavy, 'brand.onNavy'),
    accent: required(brand.card?.accent, 'brand.card.accent'),
    textSoft: required(brand.card?.textSoft, 'brand.card.textSoft'),
    textMuted: required(brand.card?.textMuted, 'brand.card.textMuted'),
  }),
  primaryByTheme: Object.freeze({
    light: Object.freeze({
      primary: required(brand.navy, 'brand.navy'),
      deep: required(brand.navyDeep, 'brand.navyDeep'),
    }),
    dark: Object.freeze({
      primary: required(brand.onDark?.primary, 'brand.onDark.primary'),
      deep: required(brand.onDark?.primaryDeep, 'brand.onDark.primaryDeep'),
    }),
  }),
  designSystemCss: renderDesignSystemRoot(light, { dark }),
});
