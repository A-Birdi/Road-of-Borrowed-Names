// Loads game source files into a fresh vm context for node tests.
// load(['core','lang']) -> RB object. Paths are relative to src/.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function expand(entry) {
  const p = path.join(root, 'src', entry);
  if (!fs.existsSync(p)) return [];
  if (!fs.statSync(p).isDirectory()) return [p];
  const out = [];
  const walk = (d) =>
    fs.readdirSync(d, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((e) => {
        const fp = path.join(d, e.name);
        if (e.isDirectory()) walk(fp);
        else if (e.name.endsWith('.js')) out.push(fp);
      });
  walk(p);
  return out;
}

export function load(entries, extraGlobals = {}) {
  const ctx = { console, setTimeout, clearTimeout, performance, ...extraGlobals };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const e of entries) for (const f of expand(e)) {
    vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: path.relative(root, f) });
  }
  return ctx.RB;
}
export { root };
