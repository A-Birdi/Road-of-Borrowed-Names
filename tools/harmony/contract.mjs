// Loads the Harmony art contract (src/ui/88_harmony_contract.js, the file the game itself runs) into a node vm,
// so the importer and the game read one definition.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
let cached = null;
export function loadContract() {
  if (cached) return cached;
  const ctx = {};
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/ui/88_harmony_contract.js'), 'utf8'), ctx, { filename: 'src/ui/88_harmony_contract.js' });
  // plain copies (vm objects work, but JSON round-tripping keeps data free of the other realm's prototypes)
  cached = ctx.RB.harmonyContract;
  return cached;
}
// The registry export (docs/harmony/contract/registry.json), if present.
export function loadRegistry(file) {
  const p = file || path.join(root, 'docs/harmony/contract/registry.json');
  if (!fs.existsSync(p)) return null;
  const buf = fs.readFileSync(p);
  return { json: JSON.parse(buf.toString('utf8')), path: p, bytes: buf };
}
