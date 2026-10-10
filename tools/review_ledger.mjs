// The language review ledger (docs/future/plan/02_FOUNDATIONS.md S5; Robin's C-26: no native reviewer is available).
// Every Japanese line in the expansion's new content (the id prefixes in src/content/00_expansion.js) is listed in
// docs/review/language/<prefix>.json under a stable key (where it lives + a hash of its text), with its review status.
// The only status the lead can give is "self-reviewed", with what it was checked against; nothing here ever claims a
// native review. Usage:
//   node tools/review_ledger.mjs            report lines without an entry (exit 1 if any)
//   node tools/review_ledger.mjs --add "<ref>"  add entries for new lines as self-reviewed against <ref> (run only after
//                                           actually reviewing them); stale entries (text changed or gone) are dropped
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../tests/lib/load.mjs';

export function lines(RB) {
  const C = RB.content, pre = Object.assign({}, C.chapterOfPrefix || {});
  for (const x of C.reviewPrefixes || []) pre[x] = pre[x] || 'review';
  const prefixOf = (id) => String(id).split(/[._]/)[0];
  const out = [];
  const hash = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); };
  const add = (id, where, jp, en) => { if (!jp || !pre[prefixOf(id)]) return; out.push({ prefix: prefixOf(id), key: where + '#' + hash(jp), jp, en: en || '' }); };
  for (const id in C.scenes) for (const c of C.scenes[id].cmds) {
    if (c.op === 'say' || c.op === 'card' || c.op === 'journal' || c.op === 'toast') add(id, 'scene:' + id, c.jp, c.en);
    if (c.simple) add(id, 'scene:' + id + ':simpler', c.simple.jp, c.simple.en);
    if (c.op === 'choice') for (const o of c.opts) add(id, 'scene:' + id + ':choice', o.jp, o.en);
  }
  // every Japanese string under a content object: {jp} texts, and the strings of parts, tiles, answers and pieces
  const JA = /[\u3040-\u30ff\u4e00-\u9fff]/;
  const walk = (id, where, o, seen) => {
    if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
    if (Array.isArray(o)) { for (const x of o) { if (typeof x === 'string' && JA.test(x)) add(id, where, x.replace(/^\?/, ''), ''); else if (x && typeof x === 'object') walk(id, where, x, seen); } return; }
    if (typeof o.jp === 'string') add(id, where, o.jp, typeof o.en === 'string' ? o.en : '');
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === 'string' && k !== 'jp' && JA.test(v) && /^(answer|text|jpK)$/.test(k)) add(id, where, v, '');
      else if (v && typeof v === 'object') walk(id, where, v, seen);
    }
  };
  for (const kind of ['challenges', 'notes', 'quests', 'maps', 'enemies', 'items']) for (const id in C[kind] || {}) walk(id, kind + ':' + id, C[kind][id], new Set());
  for (const d of C.drills || []) walk(d.id, 'drill:' + d.id, d, new Set());
  return out;
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const L = lines(RB);
  const dir = path.join(root, 'docs', 'review', 'language');
  const ai = process.argv.indexOf('--add'), ref = ai >= 0 ? process.argv[ai + 1] : null;
  const by = {};
  for (const l of L) (by[l.prefix] = by[l.prefix] || []).push(l);
  let missing = 0;
  for (const p of Object.keys(by)) {
    const f = path.join(dir, p + '.json');
    const led = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
    const keys = new Set(by[p].map((l) => l.key));
    const next = {};
    for (const l of by[p]) {
      if (led[l.key]) next[l.key] = led[l.key];
      else if (ref) next[l.key] = { status: 'self-reviewed', ref, jp: l.jp, en: l.en };
      else { missing++; console.log('no entry: ' + l.key + '  ' + l.jp.slice(0, 50)); }
    }
    const dropped = Object.keys(led).filter((k) => !keys.has(k)).length;
    if (ref) { fs.writeFileSync(f, JSON.stringify(next, null, 1) + '\n'); console.log(p + ': ' + Object.keys(next).length + ' entries (' + dropped + ' stale dropped)'); }
  }
  console.log(L.length + ' new-content lines; ' + (ref ? 'ledger updated' : missing + ' without an entry'));
  process.exit(!ref && missing ? 1 : 0);
}
