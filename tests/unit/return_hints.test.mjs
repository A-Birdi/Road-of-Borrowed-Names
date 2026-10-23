// What waits on a return, the Reedwake pilot (Robin, 2026-10-23, issue #1 6373239443; Local CL-240, CL-241; Agnes
// 6372913375): RB.town.returns(s) names a pilot town where a return key you noticed can open now, or a stamp you earned
// waits at its stand, both within reach, read from the journey with nothing kept; the Journey's Places and the Map show
// it (src/ui/50_menu.js). In node:
//  1. appearance: a noticed key whose need is now met; an earned, unpressed stamp; both in one entry for the town;
//  2. absence: never noticed; noticed but its need not met; out of reach (the quest guide's reachable()); its spot gone;
//     another town's openable key (Reedwake only);
//  3. clearing on resolution: the key examined again and opened; the stamp pressed (no reminder for a claimed stamp);
//  4. a six-chapter journey: nothing, and the journey untouched; and returns() never writes to any journey;
//  5. the copy: one line per town that never names what waits, in both languages, every kanji with its reading.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, T = RB.town;
  // a twelve-chapter journey in Saltglass that can travel to Reedwake
  const fresh = (ed) => { const s = S.newCampaign({ edition: ed || 2 }); s.map = 'sg.harbor'; s.travel = { reedwake: true, saltglass: true }; return s; };
  const got = (s) => T.returns(s).map((r) => r.town + ' keys:' + r.keys.join(',') + ' stamps:' + r.stamps.join(','));
  const same = (s, fn) => { const before = JSON.stringify(s); const r = fn(); return { r, same: JSON.stringify(s) === before }; };
  t.eq(T.RETURN_TOWNS, ['reedwake'], 'the pilot is Reedwake only');
  t.eq(['rw_jars', 'rw_floodstone', 'rw_votives'].map((k) => T.townOf(C.sealed[k].map)), ['reedwake', 'reedwake', 'reedwake'], 'Reedwake\'s three return keys');

  // ---- 1. and 2.
  {
    const s = fresh();
    t.eq(got(s), [], 'a new journey: nothing');
    s.flags.learn_wait = true;
    t.eq(got(s), [], 'its need met but never noticed: nothing');
    s.flags.learn_wait = false;
    s.world.sealed.rw_floodstone = 'noticed';
    t.eq(got(s), [], 'noticed but its need not yet met: nothing');
    s.flags.learn_wait = true;
    const a = same(s, () => got(s));
    t.eq(a.r, ['reedwake keys:rw_floodstone stamps:'], 'noticed, and now it can open: Reedwake, that key');
    t.ok(a.same, 'reading it changes nothing in the journey');
    s.flags.ch1_done = true;
    t.eq(got(s), ['reedwake keys:rw_floodstone stamps:ch.rw'], 'and a stamp earned, not pressed: in the same entry');
    const r = T.returns(s)[0];
    t.ok(r.place === 'reedwake' && r.name && r.name.en === 'Reedwake', 'the entry names the town and its place on the chart (' + r.place + ')');
    // out of reach: no travel to Reedwake known from Saltglass (the quest guide's own reachable())
    const far = fresh(); Object.assign(far.flags, s.flags); far.world.sealed = Object.assign({}, s.world.sealed); far.travel = {};
    const R = RB.questGuide.reachable(far);
    t.ok(R && !R.has('rw.village'), 'precondition: from Saltglass with no travel known, Reedwake is out of reach');
    t.eq(got(far), [], 'out of reach: nothing, for the key or the stamp');
    // its spot gone (the flag it opens set, as by an old journey that opened it another way)
    const gone = fresh(); Object.assign(gone.flags, { learn_wait: true, lw_rw_flood_open: true }); gone.world.sealed.rw_floodstone = 'noticed';
    t.eq(got(gone), [], 'the spot no longer there: nothing');
    // another town's key that can open now: not shown (Reedwake only)
    const sg = fresh(); sg.world.sealed.sg_seacave = 'noticed'; sg.flags.sea_boat = true;
    t.ok(T.canOpen(sg, 'sg_seacave') && T.townOf('sg.harbor') === 'saltglass', 'precondition: Saltglass\'s sea cave can open in that journey');
    t.eq(got(sg), [], 'another town\'s openable key: nothing');
  }

  // ---- 3. clearing on resolution
  {
    const s = fresh();
    Object.assign(s.flags, { learn_wait: true, mod_sorezore: true, ch1_done: true });
    s.world.sealed.rw_floodstone = 'noticed'; s.world.sealed.rw_jars = 'noticed';
    t.eq(got(s), ['reedwake keys:rw_jars,rw_floodstone stamps:ch.rw'], 'two keys and a stamp: one entry for the town');
    const e = T.examine(s, 'rw_floodstone');
    t.ok(e && e.state === 'opened', 'the flood stone looked at again: it opens');
    t.eq(got(s), ['reedwake keys:rw_jars stamps:ch.rw'], 'that key is no longer named; the rest stay');
    T.examine(s, 'rw_jars');
    t.eq(got(s), ['reedwake keys: stamps:ch.rw'], 'both opened: the stamp alone');
    const pressed = RB.stampBook.pressAt(s, 'reedwake');
    t.ok(pressed.includes('ch.rw'), 'the stamp pressed at Reedwake\'s stand');
    t.eq(got(s), [], 'nothing left: no reminder for a pressed stamp');
  }

  // ---- 4. a six-chapter journey
  {
    const s = fresh(1);
    Object.assign(s.flags, { learn_wait: true, ch1_done: true });
    if (s.world && s.world.sealed) s.world.sealed.rw_floodstone = 'noticed';
    const a = same(s, () => T.returns(s));
    t.ok(a.r.length === 0 && a.same, 'a six-chapter journey: nothing, and it is not touched');
    const bare = fresh(1); delete bare.world;
    const b = same(bare, () => T.returns(bare));
    t.ok(b.r.length === 0 && b.same && !('world' in bare), 'one without the world record is not given one');
  }

  // ---- 5. the copy
  {
    const L = RB.ui.menu.returnLine;
    const nm = C.towns.reedwake.name, mk = (keys, stamps) => ({ town: 'reedwake', name: nm, keys, stamps });
    const lines = [mk(['k'], []), mk([], ['a']), mk([], ['a', 'b']), mk(['k'], ['a']), mk(['k', 'l'], ['a', 'b'])].map(L);
    t.eq(lines.map((l) => l.en), [
      'Something you noticed in Reedwake may open now.',
      'A stamp you have earned waits to be pressed in Reedwake.',
      'Stamps you have earned wait to be pressed in Reedwake.',
      'Something you noticed in Reedwake may open now, and a stamp you have earned waits to be pressed there.',
      'Something you noticed in Reedwake may open now, and stamps you have earned wait to be pressed there.',
    ], 'the English: one line, the kind of thing only, never what');
    const bare = (jp) => jp.replace(/\{[^|}]*\|[^}]*\}/g, '');
    t.ok(lines.every((l) => !/[㐀-鿿豈-﫿々]/.test(bare(l.jp)) && /\{葦\|あし\}ノ\{瀬\|せ\}/.test(l.jp)), 'the Japanese: every kanji with its reading, the town named (' + lines.map((l) => l.jp).join(' / ') + ')');
    // (a key the player opens: 開けられそう, "you could open it now", not 開けそう ひらける "open up"; Local CL-248, Agnes 6375174827)
    t.ok(lines[0].jp === '{葦|あし}ノ{瀬|せ} で {気|き}づいた もの が 、 {今|いま} なら {開|あ}けられそう だ 。' && lines.filter((l, i) => i !== 1 && i !== 2).every((l) => /\{開\|あ\}けられそう/.test(l.jp)), 'the key line says you could open it now: 開けられそう (' + lines[0].jp + ')');
    const named = /jar|stone|flood|votive|lamp|壺|石|灯/;
    t.ok(lines.every((l) => !named.test(l.en) && !named.test(bare(l.jp))), 'neither names a key or what it opens');
  }
};
