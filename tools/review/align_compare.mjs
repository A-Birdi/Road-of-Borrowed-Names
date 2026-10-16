// AG-1: the hover pairs before and after a change to src/lang/88_speech_align.js, on the game's own lines.
// Loads the game twice (the current source, and the same with an older aligner) and compares, line by line, what each
// Japanese word is paired with. Prints the totals (links kept, removed, added, changed), how often each construction
// and each grammar note occurs now, and a reproducible sample of changed lines to review by hand.
// Usage: node tools/review/align_compare.mjs --before <old 88_speech_align.js> [--samples N] [--seed S] [--grep re] [--changes]
//        (git show <rev>:src/lang/88_speech_align.js > /tmp/old.js gives the older file)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { root } from '../../tests/lib/load.mjs';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const beforeFile = arg('--before');
if (!beforeFile) { console.error('usage: --before <old 88_speech_align.js>'); process.exit(2); }
const samples = +(arg('--samples') || 30), grep = arg('--grep') ? new RegExp(arg('--grep')) : null;
let seed = +(arg('--seed') || 1);
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

function loadWith(override) {
  const ctx = { console, setTimeout, clearTimeout, performance, __RB_TEST__: true };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  const walk = (d, out) => { fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).forEach((e) => { const fp = path.join(d, e.name); if (e.isDirectory()) walk(fp, out); else if (e.name.endsWith('.js')) out.push(fp); }); return out; };
  for (const dir of ['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas']) {
    for (const f of walk(path.join(root, 'src', dir), [])) {
      const rel = path.relative(root, f);
      const src = override && rel === 'src/lang/88_speech_align.js' ? fs.readFileSync(override, 'utf8') : fs.readFileSync(f, 'utf8');
      vm.runInContext(src, ctx, { filename: rel });
    }
  }
  return ctx.RB;
}
globalThis.__RB_TEST__ = true;
const NEW = loadWith(null), OLD = loadWith(beforeFile);
const vars = { name: 'ロビン' };
const T = { lines: 0, changedLines: 0, kept: 0, removed: 0, added: 0, changed: 0 };
const kinds = {}, notes = {}, unresolved = {};
const changed = [];
for (const id in NEW.content.scenes) {
  for (const c of NEW.content.scenes[id].cmds || []) {
    if (c.op !== 'say' || !c.jp || !c.en) continue;
    const en = c.en.replace(/\$name/g, 'Robin');
    const tn = NEW.jp.render(c.jp, { vars, spacing: true, furigana: true }).tokens;
    const to = OLD.jp.render(c.jp, { vars, spacing: true, furigana: true }).tokens;
    const a = NEW.jp.speech.align(tn, en, { name: 'Robin' }), b = OLD.jp.speech.align(to, en, { name: 'Robin' });
    T.lines++;
    for (const r of a.rels || []) if (r.fn && !/^(meaning|prt|neg|cop|conj|desire|vol|req|try|pot|passpot|cond|evenif|caus|ne|too|easy|hard|while|looks|after)$/.test(r.fn)) kinds[r.fn] = (kinds[r.fn] || 0) + 1;
    (a.notes || []).forEach((ns) => ns.forEach((n) => { if (n.kind === 'function') notes[n.fn] = (notes[n.fn] || 0) + 1; else unresolved[n.text.split(':')[0]] = (unresolved[n.text.split(':')[0]] || 0) + 1; }));
    const W = (al, i) => (al.map[i] || []).map((k) => al.words[k].text);
    const G = (al, i) => (al.gmap[i] || []).map((k) => al.words[k].text);
    let diff = false;
    const rows = tn.map((t, i) => {
      if (t.punct) return null;
      const nw = W(a, i).join(','), ng = G(a, i).join(','), ow = W(b, i).join(','), og = G(b, i).join(',');
      for (const [o, n] of [[ow, nw], [og, ng]]) {
        if (o === n) { if (o) T.kept++; }
        else { diff = true; if (!o) T.added++; else if (!n) T.removed++; else T.changed++; }
      }
      const fmt = (w, g) => (w ? '=' + w : '') + (g ? '~' + g : '');
      return t.surface + (fmt(ow, og) === fmt(nw, ng) ? fmt(nw, ng) : ' [' + (fmt(ow, og) || '·') + ' → ' + (fmt(nw, ng) || '·') + ']');
    }).filter(Boolean);
    if (diff) { T.changedLines++; if (!grep || grep.test(c.jp) || grep.test(en)) changed.push({ id, jp: rows.join(' '), en }); }
  }
}
console.log(JSON.stringify(T));
console.log('constructions and groups now:', JSON.stringify(kinds));
console.log('grammar notes now:', JSON.stringify(notes));
console.log('unresolved now:', JSON.stringify(unresolved));
const pick = [];
while (pick.length < Math.min(samples, changed.length)) { const x = changed[Math.floor(rand() * changed.length)]; if (!pick.includes(x)) pick.push(x); }
// --changes: only each sampled line's changed words, numbered (for a review sheet)
let n = 0;
for (const x of pick) {
  if (process.argv.includes('--changes')) {
    console.log('\n' + x.id + ' | ' + x.en);
    for (const m of x.jp.matchAll(/(\S+) \[([^\]]*)\]/g)) console.log('  ' + (++n) + '. ' + m[1] + ' ' + m[2]);
  } else console.log('\n' + x.id + '\n  ' + x.jp + '\n  ' + x.en);
}
