// Expeditions (expansion P07; src/engine/98_expedition.js): the resolve accounting behind persistent condition (D2),
// tested before any dungeon uses it, with the playbook's fixtures (mistake then heal, heal then mistake, mixed
// damage, defeat at low resolve, status damage, repeated capped mistakes); then the instance: entering, the reset
// matrix of a restart and of leaving (D3a), stations used up and restored only by a restart, shortcuts kept, the
// defeat rule, the preview card, and the battle hooks (resolve carried at the campaign's scale; ordinary battles
// untouched).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const X = RB.expedition;
  const battle = (pc, comp, max) => X.track({ pc, comp, max, compId: comp != null ? 'mio' : null });
  const mis = (st, n) => X.mistake(st, () => { st.pc = Math.max(0, st.pc - (n || 1)); });
  const hit = (st, who, n) => { st[who] = Math.max(0, st[who] - n); };
  const heal = (st, who, n) => { st[who] = Math.min(st.max, st[who] + n); };

  // ---- the accounting ----------------------------------------------------------------------------------------------
  {
    let st = battle(12, 12, 12); mis(st); mis(st); hit(st, 'pc', 3);
    t.eq([st.pc, X.settle(st).pc], [7, 9], 'mixed damage: two mistakes and a blow of 3; the two come back, the blow stays');
    st = battle(12, 12, 12); mis(st); heal(st, 'pc', 1);
    t.eq(X.settle(st).pc, 12, 'mistake then heal: whole again, nothing more to give back, never above full');
    st = battle(12, 12, 12); hit(st, 'pc', 4); heal(st, 'pc', 2); mis(st);
    t.eq([st.pc, X.settle(st).pc], [9, 10], 'blow, heal, mistake: the heal mended the blow first; the mistake comes back; 2 of the blow stay');
    st = battle(12, 12, 12); mis(st); hit(st, 'pc', 3); heal(st, 'pc', 2);
    t.eq([st.pc, X.settle(st).pc], [10, 11], 'mistake, blow, heal: the heal mends the blow first, so the mistake still comes back');
    st = battle(8, 12, 12); mis(st); mis(st);
    t.eq(X.settle(st).pc, 8, 'starting short (4 missing from before): mistakes come back, the old loss stays');
    st = battle(2, 12, 12); hit(st, 'pc', 5); mis(st);
    t.eq([st.pc, X.settle(st).pc], [0, 0], 'defeat at low resolve: a mistake at 0 cost nothing, so nothing comes back');
    st = battle(12, 12, 12); for (let i = 0; i < 6; i++) mis(st);
    t.eq([st.pc, X.settle(st).pc], [6, 12], 'six capped mistakes: all six come back');
    st = battle(12, 10, 12); hit(st, 'comp', 3);
    t.eq([X.settle(st).comp, X.settle(st).refund.comp], [7, 0], 'the companion\'s blows stay (they make no language mistakes)');
    st = battle(12, 12, 12); X.mistake(st, () => { st.pc = st.pc - 1; }); st.pc = st.pc - 2; // a status's damage outside the mistake
    t.eq(X.settle(st).pc, 10, 'status damage counts with the blows, not the mistakes');
    st = battle(12, 12, 12); mis(st); hit(st, 'pc', 2); heal(st, 'pc', 10);
    t.eq([st.pc, X.settle(st).pc, X.settle(st).refund.pc], [12, 12, 0], 'a big heal mends everything: nothing left to give back');
    // the invariant over many random sequences: refund never more than missing; carried = what the rest cost, net of heals
    let bad = 0;
    let seed = 7;
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    for (let k = 0; k < 2000; k++) {
      const st2 = battle(12, 12, 12);
      for (let i = 0; i < 12; i++) { const r = rnd(); if (r < 0.35) mis(st2); else if (r < 0.7) hit(st2, 'pc', 1 + Math.floor(rnd() * 4)); else heal(st2, 'pc', 1 + Math.floor(rnd() * 4)); }
      const P = st2.acct.pools.pc, out = X.settle(st2);
      if (out.pc > st2.max || out.pc < st2.pc || P.rest + P.mist !== st2.max - st2.pc) bad++;
    }
    t.eq(bad, 0, 'two thousand random sequences: the pools always add up to what is missing; the refund never exceeds it');
  }

  // ---- an instance ------------------------------------------------------------------------------------------------
  X.define('xp_test', {
    title: { en: 'Test cellars', jp: 'テスト' }, kind: 'side',
    floors: [{ id: 'f1', map: 'rw.village', entry: { x: 22, y: 30, dir: 'up' } }, { id: 'f2', map: 'rw.road', entry: { x: 3, y: 10, dir: 'right' } }],
    preview: { language: { en: 'directions', jp: '' }, size: { en: 'two floors' } },
    rules: { persistent: true, restart: 'entrance' },
    stations: { b1: { kind: 'bench', map: 'rw.village', x: 1, y: 1 }, sp: { kind: 'spring', map: 'rw.road', x: 2, y: 2 }, lamp: { kind: 'lamp', map: 'rw.road', x: 3, y: 3, requires: 'xp_xp_test_lamp_fixed' } },
    shortcuts: { gate: { map: 'rw.road' } }, mechanisms: ['pz_test'],
  });
  const s = RB.state.newCampaign({ edition: 2 }); s.id = 'xp-test'; s.comp = 'mio'; RB.game.s = s;
  s.discovery = s.discovery || {}; s.discovery.puzzles = s.discovery.puzzles || {};
  t.ok(!X.active(s), 'not on an expedition');
  X.enter(s, 'xp_test');
  t.ok(X.active(s) && X.of(s).floor === 0 && s.resolve.pc === s.resolve.max, 'entered: the first floor, at full resolve');
  s.resolve.pc = 5;
  let u = X.useStation(s, 'b1');
  t.ok(u.ok && u.gave.pc === 4 && u.left === 1 && s.resolve.pc === 9, 'a rest bench: +4, one use left');
  X.useStation(s, 'b1');
  t.eq(X.useStation(s, 'b1').ok, false, 'used up for this expedition');
  t.eq(X.useStation(s, 'lamp').why, 'Not yet.', 'the lamp is a rest point only once mended');
  s.flags.xp_xp_test_lamp_fixed = true;
  t.ok(X.useStation(s, 'lamp').ok, 'mended: one more rest');
  // the visit's state, and what a restart does to it
  s.flags['foe:rw.village:f9'] = true; s.discovery.puzzles.pz_test = { state: { open: true }, done: true };
  X.openShortcut(s, 'xp_test', 'gate');
  s.learn.items['v:みず'] = { seen: 3 };
  s.resolve.pc = 3;
  X.restart(s);
  t.ok(!s.flags['foe:rw.village:f9'] && !s.discovery.puzzles.pz_test && !s.flags.xp_xp_test_lamp_fixed, 'restart: creatures, mechanisms and the visit\'s own flags reset');
  t.ok(X.stationLeft(s, 'b1') === 2 && X.stationLeft(s, 'sp') === 1 && s.resolve.pc === s.resolve.max, 'stations and condition back to full');
  t.ok(X.shortcutOpen(s, 'xp_test', 'gate') && s.learn.items['v:みず'] && X.of(s).restarts === 1, 'kept: the shortcut, the learning record; the restart counted');
  // defeat applies the rule: back to the entrance, restarted
  X.useStation(s, 'b1');
  const wake = X.onDefeat(s);
  t.ok(wake && wake.map === 'rw.village' && wake.x === 22 && X.stationLeft(s, 'b1') === 2, 'defeat: the entrance, a fresh visit');
  // floors follow the maps walked onto
  RB.bus.emit('map:enter', { id: 'rw.road' });
  t.eq(X.floorOf(s).id, 'f2', 'walking onto the second floor\'s map: the second floor');
  // the battle hooks: resolve carried at the campaign's scale
  s.resolve.pc = 10; s.resolve.comp = 12;
  const st = { pc: 10, comp: 12, max: 12, compId: 'mio' };
  X.battleStart(st, s);
  mis(st); hit(st, 'pc', 3);
  t.ok(X.battleEnd(st, s, 'win') && s.resolve.pc === 7, 'after a win: the blow carried, the mistake given back (10 → 7)');
  t.eq(X.battleEnd({ pc: 0, comp: 0, max: 12 }, s, 'lose'), false, 'a defeat is left to the expedition\'s rule');
  // leaving: the next visit starts fresh
  X.leave(s);
  t.ok(!X.active(s) && s.resolve.pc === s.resolve.max && X.shortcutOpen(s, 'xp_test', 'gate'), 'leaving: no expedition, full resolve; the shortcut stays open');
  // an ordinary battle outside any expedition: untouched
  const st0 = { pc: 12, comp: 12, max: 12 };
  X.battleStart(st0, s);
  t.ok(!st0.acct && X.battleEnd(st0, s, 'win') === false, 'outside an expedition: no accounting, the game restores resolve as always');
  // the battle screen's bar hook (D1) carries the Atlas's escorted lantern, which needed a page observer before
  {
    const a = RB.state.newCampaign({ edition: 1 }); a.id = 'atlas-bar'; a.map = 'atlas.r1'; a.atlas = { run: { lantern: { hp: 3, max: 5 }, mods: ['escort'], relics: [] } }; RB.game.s = a;
    const html = (RB.ui.combatBars || []).map((f) => f({}, a)).join('');
    t.ok(/atlas-lantern/.test(html) && /3\/5/.test(html), 'the lantern drawn with the bars: ' + html.slice(0, 60));
    a.map = 'rw.hall';
    t.eq((RB.ui.combatBars || []).map((f) => f({}, a)).join(''), '', 'and nothing outside the Atlas');
    RB.game.s = s;
  }
  // the preview card
  const pv = X.preview('xp_test');
  t.ok(pv.rules.some((r) => /mistakes cost always comes back/.test(r.en)) && pv.rules.some((r) => /1 rest bench|rest bench/.test(r.en)) && pv.rules.some((r) => /entrance/.test(r.en)) && pv.rules.some((r) => /mended/.test(r.en)), 'the preview card says the rules in words: ' + pv.rules.map((r) => r.en).join(' | '));
};
