import assert from 'node:assert/strict';
import test from 'node:test';

import { BRAND_CONTRACT_SCHEMA, tokenDigest, tokens, webContract } from '../index.mjs';

test('web contract derives every downstream semantic role from canonical tokens', () => {
  assert.equal(BRAND_CONTRACT_SCHEMA, 1);
  assert.match(tokenDigest, /^sha256-[a-f0-9]{64}$/);
  assert.equal(webContract.digest, tokenDigest);
  assert.equal(webContract.identity, tokens.brand);
  assert.deepEqual(webContract.surfaces, {
    light: tokens.designSystem['--color-bg'],
    dark: tokens.designSystemDark['--color-bg'],
  });
  assert.deepEqual(webContract.cardColors, {
    panel: tokens.brand.navy,
    panelDeep: tokens.brand.navyDeep,
    onPanel: tokens.brand.onNavy,
    accent: tokens.brand.card.accent,
    textSoft: tokens.brand.card.textSoft,
    textMuted: tokens.brand.card.textMuted,
  });
  assert.match(webContract.designSystemCss, /color-scheme: light dark/);
});
