// Build the publishable package into dist/: compiled JS and declarations from
// the TypeScript sources, plus the token data they read at runtime.
//
// The sources import each other as `.ts` so Node runs them unbuilt in this repo;
// tsc rewrites those specifiers in the emitted JS but leaves them in the
// declarations, where a consumer could not resolve them. Rewrite them here.
import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
execFileSync('tsc', ['-p', 'tsconfig.build.json'], { cwd: root, stdio: 'inherit' });

const declarations = [dist, path.join(dist, 'brand')].flatMap((dir) =>
  readdirSync(dir)
    .filter((name) => name.endsWith('.d.ts'))
    .map((name) => path.join(dir, name)),
);
for (const file of declarations) {
  const source = readFileSync(file, 'utf8');
  const rewritten = source.replace(/(from '\.[^']*)\.ts'/g, "$1.js'");
  if (rewritten !== source) writeFileSync(file, rewritten);
}

copyFileSync(path.join(root, 'brand/tokens.json'), path.join(dist, 'brand/tokens.json'));
