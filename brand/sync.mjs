// Reusable primitives for projecting brand/tokens.json into downstream
// targets (site CSS, Obsidian snippet, …). The token-read + marker-splice
// logic lives here ONCE; each consumer only declares WHAT to write WHERE.
//
// Consumers (site bin/sync-tokens.mjs, vault sync-obsidian-theme.mjs) import
// these and supply a `targets` array. Don't fork this logic into a consumer —
// add a primitive here instead.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const brandRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Locate + parse brand/tokens.json. Defaults to this repo; BRAND_DIR overrides. */
export function loadTokens(brandDir = process.env.BRAND_DIR ?? brandRoot) {
  const tokensPath = path.join(path.resolve(brandDir), 'brand/tokens.json');
  if (!fs.existsSync(tokensPath)) {
    throw new Error(
      `No brand tokens at ${tokensPath}. Set BRAND_DIR to the severino-brand checkout.`,
    );
  }
  return { tokens: JSON.parse(fs.readFileSync(tokensPath, 'utf8')), tokensPath };
}

/** Replace the text between `${label}:start` and `${label}:end` markers, in place. */
export function spliceMarkers(source, label, inner, file = '<source>') {
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
export function toJs(value, depth = 0) {
  if (value === null || typeof value !== 'object') return `'${value}'`;
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
export function renderCssVars(vars, selector = ':root') {
  const body = Object.entries(vars)
    .map(([prop, val]) => `  ${prop}: ${val};`)
    .join('\n');
  return `${selector} {\n${body}\n}`;
}

/** designSystem object → a `:root { … }` CSS block (site's :root token block). */
export function renderDesignSystemRoot(designSystem, selector = ':root') {
  return renderCssVars(designSystem, selector);
}

/** Run a set of {file,label,inner} splices in place; log + return change count. */
export function syncTargets(targets, { root = process.cwd(), log = console.log } = {}) {
  let changed = 0;
  for (const { file, label, inner } of targets) {
    const rel = path.relative(root, file);
    const before = fs.readFileSync(file, 'utf8');
    const after = spliceMarkers(before, label, inner, rel);
    if (after === before) {
      log(`= ${rel} (already in sync)`);
      continue;
    }
    fs.writeFileSync(file, after);
    log(`✓ ${rel} (rewrote token block)`);
    changed += 1;
  }
  return changed;
}
