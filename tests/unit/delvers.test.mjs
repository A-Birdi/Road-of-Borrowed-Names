// Delvers (expansion P07, plan D8; src/engine/98b_delvers.js, src/content/expeditions/40_delvers.js) and the
// evidence that room variation never blocks an anchor or an exit, for the expansion's runs too (D1, C-57). The
// playbook's acceptance: no lucky meeting required; assistance never removed after a wrong memory; once per
// instance; safe record handling; runs viable with no delver visit.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, D = RB.delvers, X = RB.expedition, AT = RB.atlas;
  const ids = D.list().map((d) => d.id);
  t.eq(ids, ['yasu', 'hana', 'fuku', 'wataru', 'goro', 'hoshino'], 'six people from Reedwake to Snowbell');
  for (const d of D.list()) {
    const sc = C.scenes['dv.' + d.id];
    t.ok(C.scenes[d.source] && sc, d.id + ': met in ' + d.source + '; a meeting scene');
    const ch = sc.cmds.find((c) => c.op === 'choice');
    t.ok(ch && ch.opts.filter((o) => o.to === 'right').length === 1 && ch.opts.length === 3, d.id + ': one remembered answer among three');
    const ops = sc.cmds.map((c) => c.op + ':' + (c.args || []).join(' '));
    const aidAt = ops.findIndex((o) => o.indexOf('hook:dv_aid') === 0), choiceAt = ops.findIndex((o) => o.indexOf('choice') === 0);
    t.ok(aidAt >= 0 && aidAt < choiceAt, d.id + ': the aid is given before the question is asked');
  }

  // ---- who may be met: only people this journey has met, only in the twelve-chapter edition ------------------------
  const camp = (ed, seen) => { const s = RB.state.newCampaign({ edition: ed }); s.id = 'dv-' + ed + '-' + (seen || []).length; s.comp = 'mio'; for (const id of seen || []) s.seen[id] = true; RB.game.s = s; return s; };
  t.eq(D.eligible(camp(1, ['rw.yasu_after', 'rw.hana_first'])), [], 'a six-chapter journey meets nobody');
  t.eq(D.eligible(camp(2, [])), [], 'a journey that has met nobody yet meets nobody');
  const s = camp(2, ['rw.yasu_after', 'rw.hana_first', 'sg.wataru_first']);
  t.eq(D.eligible(s), ['yasu', 'hana', 'wataru'], 'only the people met (their scene seen)');
  let hits = 0, strangers = 0;
  for (let seed = 1; seed <= 2000; seed++) { const id = D.pick(s, seed, 0.5); if (id) { hits++; if (['yasu', 'hana', 'wataru'].indexOf(id) < 0) strangers++; } }
  t.ok(hits > 900 && hits < 1100 && strangers === 0, 'a seeded chance (about half the visits: ' + hits + ' of 2000), never a stranger');
  t.eq(D.pick(s, 42, 0.5), D.pick(s, 42, 0.5), 'the same seed, the same meeting');

  // ---- the cellars: a roll once per visit; aid always; a wrong memory keeps it; once per instance ------------------
  s.flags.ch2_done = true;
  let met = 0, flagsOk = 0;
  for (let i = 0; i < 400; i++) {
    if (i === 0) X.enter(s, 'cellars'); else X.restart(s);
    const e = X.of(s);
    const flags = Object.keys(s.flags).filter((k) => /^xp_cellars_dv_/.test(k));
    if (e.delver) { met++; if (flags.length === 1 && flags[0] === 'xp_cellars_dv_' + e.delver.id + '_' + e.delver.floor) flagsOk++; }
    else if (!flags.length) flagsOk++;
  }
  t.ok(met > 140 && met < 260 && flagsOk === 400, 'each visit rolls once (' + met + ' meetings in 400 visits); a restart clears the last one\'s flag');
  // the places: walkable, and the way on never blocked by someone standing there
  for (const fl in X.get('cellars').delvers) {
    const at = X.get('cellars').delvers[fl];
    RB.maps.invalidate();
    const m = RB.maps.compile(at.map);
    t.ok(!RB.maps.blockedStatic(m, at.x, at.y), fl + ': the delver stands on open floor');
  }
  // aid and memory
  s.resolve.pc = 5; s.resolve.comp = 5;
  const a1 = D.aid(s, 'yasu', { kind: 'expedition', exp: 'cellars' });
  t.ok(a1.kind === 'rest' && s.resolve.pc === 9, 'Yasu\'s aid: a rest (+4), given before any question');
  D.met(s, 'yasu', false);
  t.ok(s.resolve.pc === 9 && s.delvers.met.yasu === 1 && !s.delvers.remembered.yasu, 'a wrong memory takes nothing away (still 9); the meeting is kept, not as remembered');
  D.bonus(s, 'yasu');
  t.eq(s.resolve.pc, 12, 'a remembered moment: a little more rest, never above full');
  delete s.flags.xpk_cellars_sc_ladder;
  const a2 = D.aid(s, 'wataru', { kind: 'expedition', exp: 'cellars' });
  t.ok(a2.kind === 'shortcut' && X.shortcutOpen(s, 'cellars', 'ladder'), 'Wataru opens the grate when it is still shut');
  const a3 = D.aid(s, 'wataru', { kind: 'expedition', exp: 'cellars' });
  t.ok(a3.kind === 'guide' || a3.kind === 'rest', 'with the grate open, his aid is something else (' + a3.kind + '), never nothing');
  // once per instance: the hook keeps it for the visit; the next visit may meet again
  await RB.hooks.dv_met(['hana', '1']);
  t.ok(s.flags.xp_cellars_dv_met && s.delvers.remembered.hana, 'met once this visit, remembered');
  const npc = C.maps['rw.cellar1'].npcs.find((n) => n.id === 'hana');
  s.flags.xp_cellars_dv_hana_b1 = true;
  t.ok(npc && !RB.state.test(s, npc.if), 'once met, nobody waits there again this visit');
  X.restart(s);
  t.ok(!s.flags.xp_cellars_dv_met && s.delvers.met.hana === 1, 'a new visit: a new chance; the record stays');
  const s1 = camp(1, []);
  t.ok(!s1.delvers && D.peek(s1).met && !s1.delvers, 'reading makes no record; a six-chapter journey never gets one');

  // ---- the Atlas: someone at the camp, fixed with the run; every room still solvable --------------------------------
  const sA = camp(2, ['rw.yasu_after', 'sb.hoshino', 'co.goro']);
  const K = RB.atlasCommissions;
  const kinds = [null].concat(K.offers(sA).filter((o) => o.kind !== 'practice').map((o) => o.id));
  const r = AT.selfCheck(96, {
    salt: 0x5eed,
    dress(run, i, st) {
      st.edition = 2; for (const id of ['rw.yasu_after', 'sb.hoshino', 'co.goro']) st.seen[id] = true;
      const o = kinds[i % kinds.length] ? K.offers(st).find((x) => x.id === kinds[i % kinds.length]) : null;
      if (o) run.commission = K.commission(o, ['short', 'standard', 'long'][i % 3]);
      if (i % 2) run.safe = Object.keys(K.AREAS).slice(0, 1 + (i % 3));
      run.delver = ['yasu', 'hoshino', 'goro'][i % 3];
    },
  });
  t.ok(r.ok, 'the self-check over 96 runs dressed as commissions (every errand and survey, every length), with safe passage and a delver at the camp: every room solvable, every exit reachable, nobody standing in the way (' + r.errors.length + ' errors' + (r.errors.length ? ': ' + r.errors.slice(0, 3).join(' | ') : '') + ')');
  const run = AT.newRun(sA, [], { seed: 515 }); run.delver = 'hoshino';
  const b = AT.buildMaps(run);
  const campMap = b.maps[AT.mapId(run, 'c')];
  const dv = campMap.npcs.find((n) => n.id === 'hoshino');
  t.ok(dv && dv.if === 'ed>=2&!atlas_r_dv_met' && dv.talk === 'dv.hoshino', 'Hoshino waits at the camp of a run that rolled him, only in the twelve-chapter edition');
  const plainRun = AT.newRun(sA, [], { seed: 515 });
  t.ok(!Object.values(AT.buildMaps(plainRun).maps).some((m) => m.npcs.some((n) => /^dv\./.test(String(n.talk)))), 'a run that rolled nobody has nobody');
};
