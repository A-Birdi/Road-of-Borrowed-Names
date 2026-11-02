// The Moss Lantern's legacy repair (Agnes 6581849812, 6584263954; Local CL-652; Cloud CC-489). A save from before the
// Moss's own settling row could hold the creature's defeat (foe:kr.steps:moss1) with its name never called (no
// kr_moss1_named): then neither the Moss nor the lit lantern stood on the Cedar Steps, for good. A load-time repair beside
// the encounter (src/content/kr/33_cave.js) deletes that one key in that one state. With synthetic saves only (never a
// real one), round-tripped as JSON, through RB.save.migrate and the session store's own write and read:
//  1. the legacy pair: the key gone, kr_moss1_named still absent, and nothing else changed (the whole migrated save the
//     same as the same save migrated without the key: every other flag, the notebook's note of the Moss, learning,
//     words, quests, items, the encounters' records); wherever it was made (on the Cedar Steps, on the Moss's own
//     tile, on the ridge, in Steamhollow);
//  2. untouched: named and beaten (the normal end), named alone, never fought, another creature's stored defeat, the
//     key false: each as it was;
//  3. run again: the same;
//  4. through the store: a manual save, an autosave, a pre-departure point and a suspend point, each read back
//     repaired; the stored record itself as it was until saved again; saved again, the repair kept;
//  5. after the repair: the Moss's placement holds and its defeat isn't stored, so it stands; the lit lantern's
//     condition doesn't hold; its knots freed bring no win, and only its name wins (kr_moss1_named).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  t.eq(await RB.save.detect(), 'session', 'session-only in the unit context');
  RB.game.inBattle = () => false;
  // the clock held still, so two loads of one save compare (a load stamps the time on what it fills in, e.g. the
  // company's first memory)
  const VmDate = RB.content.constructor.constructor('return Date')();
  VmDate.now = () => 1793600000000;
  const C = RB.content, E = RB.encounter;
  const J = (o) => JSON.stringify(o);
  const KEY = 'foe:kr.steps:moss1', NAMED = 'kr_moss1_named';
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  // a journey on the Keepers' Road with a life of its own: flags, the notebook, learning, words, quests, items
  const mk = (map, x, y, extra) => {
    const s = RB.state.newCampaign({ edition: 2 });
    s.id = 'kr-moss-legacy'; s.map = map; s.x = x; s.y = y; s.comp = 'mio'; s.player.name = 'Legacy';
    s.words = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu'];
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_cedar_cleared: true, 'foe:kr.ridge:r1': true, kr_seiji_met: true }, extra || {});
    s.quests.kr_main = { stage: 3, done: false, t: 1 };
    s.inv.kr_stampbook = 1;
    s.creatures['kr.moss'] = { t: 1, maps: { 'kr.steps': 1 }, notes: { settled: 1 } };
    s.learn.stats = Object.assign({}, s.learn.stats, { answered: 41, right: 37 });
    return JSON.parse(J(s));
  };
  const mig = (s) => RB.save.migrate(JSON.parse(J(s)));
  const without = (s, k) => { const c = JSON.parse(J(s)); delete c.flags[k]; return c; };

  // 1. the legacy pair, wherever it was made
  for (const [where, map, x, y] of [['on the Cedar Steps', 'kr.steps', 14, 12], ['on the Moss\'s own tile', 'kr.steps', 14, 9], ['on the ridge', 'kr.ridge', 10, 10], ['in Steamhollow', 'yn.upper', 20, 14]]) {
    const s = mk(map, x, y, { [KEY]: true });
    const a = mig(s), b = mig(without(s, KEY));
    t.ok(!(KEY in a.flags) && !(NAMED in a.flags) && J(a) === J(b) && a.map === map && a.x === x && a.y === y,
      '1 the legacy pair ' + where + ': the key gone, still not named, and the whole save as it would be without the key ' + J({ key: KEY in a.flags, named: NAMED in a.flags, same: J(a) === J(b) }));
  }

  // 2. untouched
  for (const [what, extra] of [['named and beaten', { [KEY]: true, [NAMED]: true }], ['named alone', { [NAMED]: true }], ['never fought', {}], ['the key false', { [KEY]: false }]]) {
    const s = mk('kr.steps', 14, 12, extra);
    const a = mig(s), b = mig(s);
    const pair = (f) => J([f[KEY], f[NAMED]]);
    t.ok(pair(a.flags) === pair(s.flags) && Object.keys(s.flags).every((k) => J(a.flags[k]) === J(s.flags[k])) && J(a) === J(b) && a.creatures['kr.moss'] && J(a.creatures['kr.moss']) === J(s.creatures['kr.moss']),
      '2 ' + what + ': as it was ' + pair(a.flags));
  }
  {
    const s = mk('kr.steps', 14, 12, { [KEY]: true, [NAMED]: true, 'foe:kr.ridge:r1': true });
    const a = mig(s);
    t.ok(a.flags['foe:kr.ridge:r1'] === true && a.flags[KEY] === true, '2 another creature\'s stored defeat (the ridge\'s sandal) kept, as the Moss\'s own named one');
  }

  // 3. run again
  {
    const once = mig(mk('kr.steps', 14, 12, { [KEY]: true }));
    const twice = RB.save.migrate(JSON.parse(J(once)));
    t.ok(J(once) === J(twice), '3 run again: the same');
  }

  // 4. through the store: each kind of record read back repaired; stored as it was until saved again
  {
    const VmMap = RB.content.constructor.constructor('return Map')();
    const set = VmMap.prototype.set;
    let mem = null;
    VmMap.prototype.set = function (k, v) { if (typeof k === 'string' && k.startsWith('slots:')) mem = this; return set.call(this, k, v); };
    const legacy = mk('kr.steps', 14, 9, { [KEY]: true });
    await RB.save.writeSlot(3, legacy);
    VmMap.prototype.set = set;
    for (const kind of ['auto', 'predeparture', 'suspend']) await RB.save.writeRecovery(3, legacy, kind, null);
    const got = {};
    for (const which of ['manual', 'auto', 'predeparture', 'suspend']) {
      const r = await RB.save.read(3, which);
      got[which] = { key: KEY in r.state.flags, named: NAMED in r.state.flags, at: [r.state.map, r.state.x, r.state.y] };
    }
    t.ok(Object.values(got).every((g) => !g.key && !g.named && J(g.at) === J(['kr.steps', 14, 9])),
      '4 a manual save, an autosave, a pre-departure point and a suspend point: each read back repaired ' + J(got));
    const stored = mem && mem.get('slots:3');
    t.ok(stored && stored.state.flags[KEY] === true && [...mem.entries()].filter(([k]) => k.startsWith('recovery:3:')).every(([, v]) => v.state.flags[KEY] === true),
      '4 the stored records themselves as they were (the repair is made on what is read)');
    const r = await RB.save.read(3, 'manual');
    await RB.save.writeSlot(3, r.state);
    const again = mem.get('slots:3');
    const r2 = await RB.save.read(3, 'manual');
    t.ok(!(KEY in again.state.flags) && !(KEY in r2.state.flags) && !(NAMED in r2.state.flags), '4 saved again: the repair kept in the record, and read back the same');
  }

  // 5. after the repair: the Moss stands, the lantern doesn't, and only its name wins
  {
    const s = mig(mk('kr.steps', 14, 12, { [KEY]: true }));
    const foe = C.maps['kr.steps'].foes.find((f) => f.id === 'moss1');
    const lamp = C.maps['kr.steps'].props.find((q) => q.p === 'kr_toro' && q.x === 14 && q.y === 9);
    t.ok(foe && RB.state.test(s, foe.if) && !s.flags['foe:kr.steps:' + foe.id] && lamp && !RB.state.test(s, lamp.if),
      '5 the Moss\'s placement holds and its defeat isn\'t stored; the lit lantern\'s condition doesn\'t hold');
    RB.game.s = s;
    const st = E.begin('kr.moss_steps', s);
    const words = s.words.map((w) => C.words[w]).filter(Boolean);
    const play = (card) => E.exchange(st, { card, res: OK, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });
    for (let i = 0; i < 5 && !st.over; i++) play(E.cards(st, s, words).find((c) => c.kind === 'unravel'));
    const knots = { over: st.over, knots: st.foes[0].knots };
    play(E.cards(st, s, words).find((c) => c.kind === 'proc' && c.action.id === 'call'));
    const fin = st.over === 'win' ? E.finishEncounter(st, s, 'win') : null;
    t.ok(!knots.over && knots.knots === 0 && st.over === 'win' && st.enc.outcome === 'named' && fin && fin.flags && fin.flags[NAMED] === true,
      '5 its knots freed bring no win; then only its name wins, with kr_moss1_named ' + J({ knots, over: st.over, outcome: st.enc.outcome }));
  }
};
