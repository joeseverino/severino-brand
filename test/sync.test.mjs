import assert from 'node:assert/strict';
import test from 'node:test';

import { mergeThemes, renderDesignSystemRoot, toJs } from '../brand/sync.mjs';

test('toJs preserves primitive types and safely quotes strings', () => {
  assert.equal(toJs({ schema: 1, enabled: true, note: "Joe's \\ brand" }), [
    '{',
    '  schema: 1,',
    '  enabled: true,',
    "  note: 'Joe\\'s \\\\ brand',",
    '}',
  ].join('\n'));
});

test('mergeThemes preserves light-only roles and derives dark overrides', () => {
  assert.deepEqual(
    mergeThemes(
      { '--color-bg': '#fff', '--color-border': 'currentColor' },
      { '--color-bg': '#111' },
    ),
    {
      '--color-bg': 'light-dark(#fff, #111)',
      '--color-border': 'currentColor',
    },
  );
});

test('mergeThemes rejects a dark-only token that would disappear', () => {
  assert.throws(
    () => mergeThemes({ '--color-bg': '#fff' }, { '--color-typo': '#111' }),
    /dark token "--color-typo" has no light counterpart/,
  );
});

test('renderDesignSystemRoot emits one theme-aware projection', () => {
  assert.equal(
    renderDesignSystemRoot(
      { '--color-bg': '#fff' },
      { dark: { '--color-bg': '#111' } },
    ),
    ':root {\n  color-scheme: light dark;\n  --color-bg: light-dark(#fff, #111);\n}',
  );
});
