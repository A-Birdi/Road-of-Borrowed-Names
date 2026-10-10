// The Ledger's Distractions tab and the pastimes' pages (expansion P06, K7, K10; src/ui/68b_distractions.js,
// src/engine/72c_pastimes.js, src/content/pastimes/): the tab only in a twelve-chapter journey (F-21); the index lists
// only what the traveller has met, in order; reading a page or loading a save never makes a record (older saves stay
// exactly as they were); records hide their totals when the setting says so; every Japanese line has its readings and
// every word is in the dictionary; Fuku's bench offers a game only in a twelve-chapter journey, after her nameplate.
import fs from 'node:fs';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const P = RB.pastimes;
  const fresh = (ed, extra) => {
    const s = RB.state.newCampaign({ edition: ed });
    s.id = 'ds-test'; s.comp = 'mio'; s.visited = s.visited || {};
    RB.game.s = s;
    return Object.assign(s, extra || {});
  };

  // ---- the registry and the tab -------------------------------------------------------------------------------------
  t.eq(P.all().map((d) => d.id), ['shiritori', 'shogi', 'fishing'], 'three pastimes so far, in the index\'s order');
  const s1 = fresh(1), s2 = fresh(2);
  t.eq(P.met(s1).map((d) => d.id), [], 'a six-chapter journey meets none of them here (F-21)');
  t.ok(!RB.recordsUI.inCampaign(s1) && RB.recordsUI.inCampaign(s2), 'the tab is for twelve-chapter journeys');
  t.eq(P.met(s2).map((d) => d.id), ['shiritori'], 'with a companion, shiritori first; shogi waits for Saltglass');
  s2.visited['sg.harbor'] = true;
  t.ok(P.met(s2).map((d) => d.id).includes('shogi'), 'Saltglass reached: shogi too');
  t.ok(!P.met(s2).map((d) => d.id).includes('fishing'), 'fishing waits for Yasu\'s survey (the end of the journey)');
  const sf = fresh(2); sf.flags.postgame = true;
  t.ok(P.met(sf).map((d) => d.id).includes('fishing'), 'the survey begun: fishing\'s page');
  // reading never writes
  const before = JSON.stringify(s2.practice);
  for (const d of P.met(s2)) d.records(s2);
  t.eq(JSON.stringify(s2.practice), before, 'reading the pages makes no record');
  // a record is made on first use; loading leaves an older save's practice alone
  const r = P.rec(s2, 'shogi');
  t.ok(r && r.v === 1 && s2.practice.shogi === r, 'first use makes the shogi record');
  P.result(s2, 'shogi', 'mini', true);
  const rows = P.get('shogi').records(s2);
  t.ok(rows.some((x) => x.en === 'Mini-shogi' && /1 won of 1/.test(x.value) && x.total), 'a game and a win, marked as a total (the setting can hide it)');
  t.eq(Object.keys(RB.practice.fill(JSON.parse(JSON.stringify(fresh(2).practice)))).filter((k) => /shogi|hanafuda|karuta/.test(k)), [], 'filling a loaded practice record adds no pastime record');
  t.ok(RB.ngplus.PASTIMES.includes('shogi'), 'New Game+ carries the shogi record when there is one');

  // ---- Fuku's bench -------------------------------------------------------------------------------------------------
  const bench = RB.content.scenes['sg.bench_fuku'];
  const gate = bench.cmds.find((c) => c.op === 'hook' || (c.if && /ed>=2/.test(c.if)));
  t.ok(!!gate, 'the bench\'s scene offers the game behind a condition');
  const cond = 'ed>=2&quest.sg_seaglass=done';
  const sA = fresh(1), sB = fresh(2);
  for (const x of [sA, sB]) { x.quests = x.quests || {}; x.quests.sg_seaglass = { stage: 99, done: true, state: 'done' }; }
  t.ok(!RB.state.test(sA, cond), 'never in a six-chapter journey');
  t.ok(RB.state.test(sB, cond), 'in a twelve-chapter journey, once the nameplate is home');
  const sC = fresh(2); sC.quests = sC.quests || {}; sC.quests.sg_seaglass = { stage: 1, done: false };
  t.ok(!RB.state.test(sC, cond), 'not while her quest is still open');
  t.ok(!!RB.content.scenes['pt.fuku_bench'] && typeof RB.hooks.pt_play === 'function' && typeof RB.hooks.pt_fuku_bench === 'function', 'her scene and the hooks that open the board');

  // ---- the Japanese -----------------------------------------------------------------------------------------------
  {
    const errs = [], unknown = new Map();
    const jcheck = (line, where) => {
      if (!line) return;
      for (const p of RB.jp.validate(line)) errs.push(where + ': ' + (p.msg || JSON.stringify(p)));
      for (const tk of RB.jp.parse(line)) {
        if (tk.punct || tk.ph || !/[぀-ヿ一-鿿]/.test(tk.surface)) continue;
        let info; try { info = RB.jp.lookup(tk); } catch (e) { info = { unknown: true }; }
        if (info.unknown && !unknown.has(tk.surface)) unknown.set(tk.surface, where);
      }
    };
    const walk = (o, where, seen = new Set()) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      if (Array.isArray(o)) { o.forEach((x, i) => walk(x, where + '[' + i + ']', seen)); return; }
      if (typeof o.jp === 'string') { jcheck(o.jp, where); if (typeof o.en !== 'string' || !o.en) errs.push(where + ': no English'); }
      for (const k in o) if (k !== 'jp' && o[k] && typeof o[k] === 'object') walk(o[k], where + '.' + k, seen);
    };
    for (const d of P.all()) walk(d, 'pastime ' + d.id);
    for (const c of RB.content.scenes['pt.fuku_bench'].cmds) { if (c.jp) jcheck(c.jp, 'pt.fuku_bench'); if (c.opts) c.opts.forEach((o) => jcheck(o.jp, 'pt.fuku_bench choice')); }
    const ui = fs.readFileSync(new URL('../../src/ui/68b_distractions.js', import.meta.url), 'utf8');
    for (const m of ui.matchAll(/(?:label\(|jp: )'((?:[^'\\]|\\.)*[一-鿿](?:[^'\\]|\\.)*)'/g)) jcheck(m[1], 'tab');
    t.eq(errs, [], 'every line has furigana on its kanji and English beside it');
    t.eq([...unknown.entries()].map(([w, at]) => w + ' (' + at + ')'), [], 'every word is in the dictionary');
  }
};
