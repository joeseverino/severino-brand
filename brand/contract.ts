import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { renderDesignSystemRoot } from './sync.ts';
import type { TokenMap } from './sync.ts';

export interface ThemePair {
  primary: string;
  deep: string;
}

export interface CardColors {
  panel: string;
  panelDeep: string;
  onPanel: string;
  accent: string;
  textSoft: string;
  textMuted: string;
}

export interface Brand {
  navy: string;
  navyDeep: string;
  onNavy: string;
  card?: { accent: string; textSoft: string; textMuted: string };
  onDark?: { primary: string; primaryDeep: string };
  glyph: string;
}

export interface Tokens {
  brand: Brand;
  designSystem: TokenMap;
  designSystemDark: TokenMap;
}

export interface WebContract {
  readonly schema: number;
  readonly digest: string;
  readonly identity: Brand;
  readonly surfaces: Readonly<{ light: string; dark: string }>;
  readonly cardColors: Readonly<CardColors>;
  readonly primaryByTheme: Readonly<{ light: Readonly<ThemePair>; dark: Readonly<ThemePair> }>;
  readonly designSystemCss: string;
}

export const BRAND_CONTRACT_SCHEMA = 1;

const tokenBytes = readFileSync(new URL('./tokens.json', import.meta.url));
export const tokenDigest: string = `sha256-${createHash('sha256').update(tokenBytes).digest('hex')}`;
export const tokens: Tokens = JSON.parse(tokenBytes.toString());

function required(value: string | null | undefined, path: string): string {
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
export const webContract: WebContract = Object.freeze({
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
