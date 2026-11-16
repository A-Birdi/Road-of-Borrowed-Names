// Runs every tests/unit/*.test.mjs file. Each exports default async (t) => {...}
// The console is shared by the whole run (tests/lib/load.mjs gives every vm context Node's own), so after each file,
// its import as well as its run, the runner checks that the console is as it was: the object itself and each of its
// methods. Anything a file replaced, deleted or redefined is put back and reported as a failure of that file (LEAK),
// so it can neither pass silently nor hide a later file's output. The runner's own lines, and t's, go through the
// console's log as it was at the start, so a test that replaces console.log can't hide them either. A file that throws
// fails whatever it threw (even undefined), and what it threw is shown without ever being changed. This checks at file
// boundaries only: it doesn't isolate global state a file changes later, from a timer or a promise it left running.
// (Agnes 6921074159, 6922668177, 6923303419; CL-860, CL-863, CL-865; CC-620, CC-621)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'unit');
const only = process.argv[2];

// the console as it was before any test: the object, how it is held, and each method's own descriptor
const realConsole = globalThis.console;
let consoleHeld = Object.getOwnPropertyDescriptor(globalThis, 'console');
const methods = new Map();
for (const k of Object.getOwnPropertyNames(realConsole)) {
  const d = Object.getOwnPropertyDescriptor(realConsole, k);
  if (d && 'value' in d && typeof d.value === 'function') methods.set(k, d);
}
const log = realConsole.log.bind(realConsole);

// what a file threw, for its ERROR line: its stack if it has one, else the value itself. Never throws (a stack getter
// or a conversion that throws gives a fixed text instead) and never changes the value.
const show = (v) => {
  try { const s = v != null ? v.stack : undefined; if (typeof s === 'string' && s) return s; } catch (e) { /* shown below */ }
  try { return 'thrown: ' + (typeof v === 'string' ? JSON.stringify(v) : String(v)); } catch (e) { /* shown below */ }
  return 'thrown: (a value that cannot be shown)';
};

// put the console back as it was, each part on its own (one that can't be put back doesn't stop the others), and say
// what had changed, one line each. A part that can't be put back is reported once, by the file that changed it; later
// files are then checked against it as it now is, so they are blamed only for changes of their own
const sameDescriptor = (a, b) => !!a && !!b && a.value === b.value && a.get === b.get && a.set === b.set && a.writable === b.writable && a.enumerable === b.enumerable && a.configurable === b.configurable;
const restoreConsole = () => {
  const found = [];
  try {
    if (!sameDescriptor(Object.getOwnPropertyDescriptor(globalThis, 'console'), consoleHeld)) {
      Object.defineProperty(globalThis, 'console', consoleHeld);
      found.push('console: replaced by this file and not restored by it; the runner has put it back');
    }
  } catch (e) {
    found.push('console: changed by this file and not restored by it; the runner could not put it back (' + show(e).split('\n')[0] + '), so later files run with it changed');
    try { consoleHeld = Object.getOwnPropertyDescriptor(globalThis, 'console'); } catch (e2) { /* still reported above */ }
  }
  for (const [k, d] of methods) {
    try {
      const now = Object.getOwnPropertyDescriptor(realConsole, k);
      if (sameDescriptor(now, d)) continue;
      Object.defineProperty(realConsole, k, d);
      found.push('console.' + k + ': ' + (now ? 'replaced' : 'deleted') + ' by this file and not restored by it; the runner has put it back');
    } catch (e) {
      found.push('console.' + k + ': changed by this file and not restored by it; the runner could not put it back (' + show(e).split('\n')[0] + '), so later files run with it changed');
      try { const stuck = Object.getOwnPropertyDescriptor(realConsole, k); if (stuck) methods.set(k, stuck); else methods.delete(k); } catch (e2) { /* still reported above */ }
    }
  }
  return found;
};

let pass = 0, fail = 0;
const t = {
  ok(cond, msg) { if (cond) pass++; else { fail++; log('  FAIL:', msg); } },
  eq(a, b, msg) { const ok = JSON.stringify(a) === JSON.stringify(b); if (ok) pass++; else { fail++; log('  FAIL:', msg, '\n    got', JSON.stringify(a), '\n    want', JSON.stringify(b)); } },
  log: (...a) => log('  ', ...a),
};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.test.mjs')).sort()) {
  if (only && !f.includes(only)) continue;
  log('#', f);
  const before = fail;
  let threw = false, thrown;
  try { await (await import(pathToFileURL(path.join(dir, f)))).default(t); }
  catch (e) { threw = true; thrown = e; }
  const leaks = restoreConsole();
  if (threw) { fail++; log('  ERROR', show(thrown)); }
  for (const l of leaks) { fail++; log('  LEAK', l); }
  if (fail === before) log('  ok');
}
log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
