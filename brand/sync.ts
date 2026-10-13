// Reusable primitives for projecting brand/tokens.json into downstream
// targets (site CSS, Obsidian snippet, …). The token-read + marker-splice
// logic lives here ONCE; each consumer only declares WHAT to write WHERE.
//
// Consumers (site bin/sync-tokens.mjs, vault sync-obsidian-theme.mjs) import
// these and supply a `targets` array. Don't fork this logic into a consumer —
// add a primitive here instead.
import fs from 'node:fs';
import path from 'node:path';

import type { Tokens } from './contract.ts';

export type TokenMap = Record<string, string>;

export interface SyncTarget {
  file: string;
  label: string;
  inner: string;
}

export interface SyncOptions {
  root?: string;
  log?: (line: string) => void;
  check?: boolean;
}

const brandRoot = path.resolve(import.meta.dirname, '..');

/** Locate + parse brand/tokens.json. Defaults to this repo; BRAND_DIR overrides. */
export function loadTokens(brandDir: string = process.env.BRAND_DIR ?? brandRoot): {
  tokens: Tokens;
  tokensPath: string;
} {
  const tokensPath = path.join(path.resolve(brandDir), 'brand/tokens.json');
  if (!fs.existsSync(tokensPath)) {
    throw new Error(
      `No brand tokens at ${tokensPath}. Set BRAND_DIR to the severino-brand checkout.`,
    );
  }
  return { tokens: JSON.parse(fs.readFileSync(tokensPath, 'utf8')), tokensPath };
}

/** Replace the text between `${label}:start` and `${label}:end` markers, in place. */
export function spliceMarkers(
  source: string,
  label: string,
  inner: string,
  file = '<source>',
): string {
  const start = source.indexOf(`${label}:start`);
  const end = source.indexOf(`${label}:end`);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Missing ${label}:start/${label}:end markers in ${file}`);
  }
  const afterStartLine = source.indexOf('\n', start) + 1;
  const endLineStart = source.lastIndexOf('\n', end) + 1;
  return source.slice(0, afterStartLine) + inner + '\n' + source.slice(endLineStart);
}

/** Serialize a value as a JS object literal: unquoted identifier keys, single quotes. */
export function toJs(value: unknown, depth = 0): string {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'string') {
      return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
    }
    return JSON.stringify(value);
  }
  const pad = '  '.repeat(depth + 1);
  const close = '  '.repeat(depth);
  const body = Object.entries(value)
    .map(([key, val]) => {
      const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : `'${key}'`;
      return `${pad}${safeKey}: ${toJs(val, depth + 1)},`;
    })
    .join('\n');
  return `{\n${body}\n${close}}`;
}

/** A flat `{ '--var': value }` map → a `selector { … }` CSS block. */
export function renderCssVars(vars: TokenMap, selector = ':root'): string {
  const body = Object.entries(vars)
    .map(([prop, val]) => `  ${prop}: ${val};`)
    .join('\n');
  return `${selector} {\n${body}\n}`;
}

/**
 * Fold a dark override map into the light one as `light-dark(light, dark)` values.
 * Keys absent from `dark` pass through untouched, so the dark map lists only the
 * themeable subset. A key present ONLY in `dark` is a typo that would otherwise
 * vanish from the output, so it throws.
 */
export function mergeThemes(light: TokenMap, dark: TokenMap = {}): TokenMap {
  const orphan = Object.keys(dark).find((key) => !(key in light));
  if (orphan) throw new Error(`dark token "${orphan}" has no light counterpart`);
  return Object.fromEntries(
    Object.entries(light).map(([key, value]) =>
      key in dark ? [key, `light-dark(${value}, ${dark[key]})`] : [key, value],
    ),
  );
}

/**
 * designSystem object → a `:root { … }` CSS block (site's :root token block).
 * Pass `dark` to emit dual-value tokens; `color-scheme: light dark` leads the
 * block because it is what makes `light-dark()` resolve at all.
 */
export function renderDesignSystemRoot(
  designSystem: TokenMap,
  { selector = ':root', dark }: { selector?: string; dark?: TokenMap } = {},
): string {
  if (!dark) return renderCssVars(designSystem, selector);
  return renderCssVars({ 'color-scheme': 'light dark', ...mergeThemes(designSystem, dark) }, selector);
}

/** Run a set of {file,label,inner} splices in place; log + return change count. */
export function syncTargets(
  targets: readonly SyncTarget[],
  { root = process.cwd(), log = console.log, check = false }: SyncOptions = {},
): number {
  let changed = 0;
  for (const { file, label, inner } of targets) {
    const rel = path.relative(root, file);
    const before = fs.readFileSync(file, 'utf8');
    const after = spliceMarkers(before, label, inner, rel);
    if (after === before) {
      log(`= ${rel} (already in sync)`);
      continue;
    }
    if (!check) fs.writeFileSync(file, after);
    log(`${check ? '!' : '✓'} ${rel} (${check ? 'token projection is stale' : 'rewrote token block'})`);
    changed += 1;
  }
  if (check && changed) {
    throw new Error(`${changed} generated token projection${changed === 1 ? ' is' : 's are'} stale.`);
  }
  return changed;
}
