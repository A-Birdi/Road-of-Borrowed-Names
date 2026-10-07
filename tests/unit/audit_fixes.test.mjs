// Defects found by the expansion-plan audit (docs/future/plan/11_CONTRADICTIONS.md part D), fixed
// 2026-10-07. The browser half (the Words › Grammar met page, Translate in activities, copy steps)
// is tests/e2e/audit_fixes.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from '../lib/load.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const s = RB.state.newCampaign({ profile: 'E' });
  RB.game.s = s;

  // ---- promotion: "not merely by choosing from options" reads the current run of clean answers ----
  // Each answer is a separate learning event two ticks after the last, so "spaced" always holds.
  const answer = (id, mode, ok) => { RB.learn.record('v:filler', { ok: true, mode: 'choice' }); return RB.learn.record(id, { ok, mode }); };
  let r;
  for (let i = 0; i < 6; i++) r = answer('v:audit_a', 'choice', true);
  t.eq(r.box, 2, 'choice alone reaches box 2 and stops there');
  r = answer('v:audit_a', 'ime', false); // a wrong typed attempt (this used to unlock choice-only promotion)
  t.eq(r.box, 1, 'the wrong attempt drops the box as before');
  for (let i = 0; i < 6; i++) r = answer('v:audit_a', 'choice', true);
  t.eq(r.box, 2, 'a wrong typed attempt no longer lets choice alone climb past box 2');
  t.ok(r.modes.recall === 1, 'the attempt is still tallied as typed (the tallies are unchanged)');
  r = answer('v:audit_a', 'hand', true);
  t.eq(r.box, 3, 'a clean handwritten answer in the run promotes');
  r = answer('v:audit_a', 'choice', true);
  t.eq(r.box, 4, 'the run keeps its typed-or-written answer, so the next spaced clean answer promotes');
  r = answer('v:audit_a', 'choice', false);
  t.ok(r.box === 3 && !r.vary, 'a mistake ends the run and its flag');
  for (let i = 0; i < 4; i++) r = answer('v:audit_a', 'choice', true);
  t.eq(r.box, 3, 'after a mistake, choice alone does not climb again');
  // an assisted answer neither counts towards the run nor breaks it
  r = answer('v:audit_a', 'ime', true);
  RB.learn.record('v:filler', { ok: true, mode: 'choice' });
  const before = r.box;
  r = RB.learn.record('v:audit_a', { ok: true, mode: 'hand', assisted: true });
  t.ok(r.box === before && r.vary, 'assisted: no promotion, the run unbroken');
  // records saved before the fix keep their box; nothing is lowered on load
  s.learn.items['v:audit_old'] = { id: 'v:audit_old', box: 4, seen: 9, ok: 8, bad: 1, streak: 3, last: 1, lastOk: 1, due: 0, cool: 0, modes: { recog: 8, recall: 1, hand: 0, assisted: 0 }, ctx: [] };
  r = answer('v:audit_old', 'choice', true);
  t.eq(r.box, 4, 'an old record keeps its box; choice alone does not move it on');
  r = answer('v:audit_old', 'ime', true);
  t.eq(r.box, 5, 'its next clean typed answer does');

  // ---- the lantern list names grammar points (RB.grammar has get(), not points) ----
  t.ok(RB.grammar.points === undefined && typeof RB.grammar.get === 'function', 'RB.grammar is looked up with get()');
  const lab = RB.lanterns.labelOf('g:prt_wa', { title: 'a step title' });
  t.ok(lab.mixed === RB.grammar.get('prt_wa').title && !lab.jp, 'a grammar lamp is labelled with its point\'s title: ' + JSON.stringify(lab));
  const fall = RB.lanterns.labelOf('g:no_such_point', { title: 'Step' });
  t.ok(fall.en === 'Step' && !fall.mixed, 'an unknown point still falls back to the step');
  const users = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (f.endsWith('.js') && /RB\.grammar\.points/.test(fs.readFileSync(f, 'utf8'))) users.push(path.relative(root, f)); } };
  walk(path.join(root, 'src'));
  // (70_lessons.js asks for get() first and only falls back to points when get is missing)
  t.eq(users.filter((f) => f !== path.join('src', 'ui', '70_lessons.js')), [], 'nothing else reads the missing RB.grammar.points');

  // ---- every road on the route chart can be walked between its two places ----
  const C = RB.content;
  const pre = (id) => id.split('.')[0];
  const links = (def) => { const out = new Set(); const seen = new Set(); const go = (o) => { if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o); if (typeof o.to === 'string' && C.maps[o.to]) out.add(o.to); for (const k in o) if (k !== 'npcs') go(o[k]); }; go(def.exits); go(def.props); go(def.structs); return out; };
  for (const [a, b] of C.roads) {
    const A = C.places[a].map, B = C.places[b].map, ok = new Set([pre(A), pre(B)]);
    const seen = new Set([A]), q = [A];
    while (q.length) { const m = q.shift(); for (const n of links(C.maps[m])) if (ok.has(pre(n)) && !seen.has(n)) { seen.add(n); q.push(n); } }
    t.ok(seen.has(B), 'the road ' + a + '–' + b + ' can be walked');
  }
  t.ok(!C.roads.some((r) => r.includes('cinder') && r.includes('lanternfall')), 'no Cinder–Lanternfall road on the chart');

  // ---- creatures' patrols draw from the world's stream, never the language tasks' Math.random ----
  const world = fs.readFileSync(path.join(root, 'src/engine/50_world.js'), 'utf8').replace(/\/\/.*$/gm, '');
  t.ok(!/Math\.random/.test(world), 'the world engine never calls Math.random');
};
