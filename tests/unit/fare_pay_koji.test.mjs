// The fare repaid when you speak to Kōji first (CC-625; Agnes 6926300199, 6927046186; Akashi CL-870, CL-871): his talk
// at quest step 4 runs lq.fare_pay_koji, which only calls lq.fare_pay, and lq.fare_pay steps you aside to (5,7),
// facing up, as Chigusa rises, on that route alone (`?(scene.lq.fare_pay_koji)`, the existing runtime-only term), so
// her mark at (4,6) is free whichever side of him you spoke from. Checked here, without the browser:
//  1. the wiring: Kōji's step-4 talk names the wrapper, on the same condition as before; Chigusa's own talk still
//     runs lq.fare_pay; no other map, scene or condition names the wrapper, and nothing reads seen.lq.fare_pay_koji;
//  2. the wrapper is one command, the call;
//  3. lq.fare_pay has one walk of yours, guarded by the route, between "Let's begin." and Chigusa standing, and one
//     unguarded `!look koji lq_chigusa` right after her walk to (4,6), before the coins, so Kōji faces her for the coin
//     exchange whichever side you spoke from (CC-627; Agnes 6930123788; Akashi CL-873); the look before the book and
//     the turn to you after the seal stay; every other command of it is exactly 315b770's (compared by hash, line
//     numbers aside: the commands carry Japanese);
//  4. the route term is false outside a run of the wrapper;
//  5. the quest guide answers exactly as 315b770 does (CL-871's parity check): the whole answer for lq_fare at step 4,
//     its targets and its nudges, from the teahouse and from the village, compared by hash (it carries the scenes'
//     Japanese), and read in English: one authored target, Chigusa at her table (6,4) on rw.tea, talked to for
//     lq.fare_pay. The guide follows the wrapper's call; it never points you at Kōji for this.
//  6. the two staging walks of CC-644 (Agnes 6946332830): Oto's one step west, on Chigusa's route only and only when he
//     is there (slot.oto=3&departed, his teahouse figure's own condition; CC-649, Agnes 6948894795), as the scene's
//     first command, before your companion's door walk; and your companion's door walk tried again on the route through
//     K~ji, straight after your step aside and before Chigusa stands; each exactly once, and nothing else of the scene
//     changed (3 sets them aside, with the two of yours and K~ji's above).
// The browser half (each side, each companion, Skip seen, save and load) is tests/e2e/fare_pay_staging.mjs; the two
// walks and the end of the scene are tests/e2e/fare_pay_two_walks.mjs.
import { createHash } from 'node:crypto';
import { load } from '../lib/load.mjs';

// from 315b770, by the same reading as below
const PARENT_GUIDE = 'e820a5503d639d50e62f5ab91a3a99c3e9b7db129102002c328bcafaac2002e9';
const PARENT_FARE_PAY = 'e5d36502ddddf6e7b8df32ffe0b8772e9518fcda5257257cec9607f3fe9f1cf3';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, G = RB.questGuide, SC = C.scenes;
  const sha = (v) => createHash('sha256').update(JSON.stringify(v)).digest('hex');
  const COND = 'quest.lq_fare=4&lq_fare_found&ch4_done&!lq_fare_paid';

  // 1. the wiring
  const tea = C.maps['rw.tea'];
  const koji = tea.npcs.find((n) => n.id === 'koji'), chig = tea.npcs.find((n) => n.id === 'lq_chigusa');
  const k4 = (Array.isArray(koji && koji.talk) ? koji.talk : []).filter((o) => /quest\.lq_fare=4/.test(o.if || ''));
  t.eq(k4, [{ if: COND, scene: 'lq.fare_pay_koji' }], "Kōji's talk at step 4 runs lq.fare_pay_koji, on the same condition as before");
  t.eq(chig && { if: chig.if, talk: chig.talk, at: [chig.x, chig.y] }, { if: 'lq_fare_found&ch4_done&!lq_fare_paid', talk: 'lq.fare_pay', at: [6, 4] }, "Chigusa's own talk still runs lq.fare_pay, from her table");
  const maps = Object.entries(C.maps).filter(([, m]) => JSON.stringify(m).includes('fare_pay_koji')).map(([id]) => id);
  t.eq([maps, JSON.stringify(tea).split('fare_pay_koji').length - 1], [['rw.tea'], 1], 'no other map, and nothing else on rw.tea, names the wrapper');
  const naming = Object.values(SC).filter((sc) => sc.cmds.some((c) => JSON.stringify([c.args, c.if, c.expr]).includes('fare_pay_koji'))).map((sc) => sc.id).sort();
  t.eq(naming, ['lq.fare_pay'], 'of all ' + Object.keys(SC).length + ' scenes, only lq.fare_pay names the wrapper (its guarded lines)');
  const seenReaders = Object.values(SC).filter((sc) => sc.cmds.some((c) => JSON.stringify(c).includes('seen.lq.fare_pay_koji'))).map((sc) => sc.id);
  t.eq([seenReaders, Object.values(C.maps).filter((m) => JSON.stringify(m).includes('seen.lq.fare_pay_koji')).length], [[], 0], 'nothing reads seen.lq.fare_pay_koji (the one entry the wrapper adds to a save)');

  // 2. the wrapper
  const w = SC['lq.fare_pay_koji'];
  t.eq(w && w.cmds.map((c) => [c.op, c.args, c.if]), [['call', ['lq.fare_pay'], null]], 'lq.fare_pay_koji only calls lq.fare_pay');

  // 3. lq.fare_pay: the one new line, and the rest exactly as before
  const cm = SC['lq.fare_pay'].cmds;
  const mine = cm.map((c, i) => [c, i]).filter(([c]) => c.op === 'walkto' && c.args[0] === 'pc');
  t.eq(mine.map(([c]) => [c.args, c.if]), [[['pc', '5', '7', 'up'], 'scene.lq.fare_pay_koji']], 'lq.fare_pay has one walk of yours: to (5,7), facing up, on the route through Kōji only');
  // (your companion's door walk tried again, CC-644, comes straight after it and is set aside here; 6 checks it)
  const isRetry = (c) => c && c.op === 'walkto' && c.args[0] === 'comp' && c.if === 'comp&scene.lq.fare_pay_koji';
  const i = mine.length === 1 ? mine[0][1] : -1, prev = cm[i - 1] || {}, next = cm.slice(i + 1).filter((c) => !isRetry(c)).slice(0, 2);
  t.ok(i > 0 && prev.op === 'say' && prev.who === 'lq_chigusa' && /Let's begin/.test(prev.en || ''), 'it comes after Chigusa\'s "Let\'s begin." (' + JSON.stringify({ op: prev.op, who: prev.who, en: String(prev.en || '').replace(/[^\x20-\x7e]/g, '') }) + ')');
  t.eq(next.map((c) => [c.op, c.args, c.if]), [['pose', ['lq_chigusa', 'stiff'], null], ['walkto', ['lq_chigusa', '4', '6', 'right'], null]], 'and just before she stands and walks to her mark (4,6)');
  // the look at the coins (CC-627): right after her walk to (4,6), before the coin prop, on every route
  const isW = (c) => c && c.op === 'walkto' && JSON.stringify(c.args) === JSON.stringify(['lq_chigusa', '4', '6', 'right']);
  const looks = cm.map((c, j) => [c, j]).filter(([c]) => c.op === 'look' && c.args[0] === 'koji');
  const early = looks.filter(([, j]) => isW(cm[j - 1]));
  t.eq(early.map(([c, j]) => [c.args, c.if, cm[j + 1] && cm[j + 1].op, cm[j + 1] && cm[j + 1].args]), [[['koji', 'lq_chigusa'], null, 'prop', ['lq_chigusa', 'coins']]], 'one unguarded look of Kōji\'s at Chigusa right after her walk to (4,6), just before the coins');
  t.eq(looks.map(([c, j]) => [c.args, c.if, j > i]), [[['koji', 'lq_chigusa'], null, true], [['koji', 'lq_chigusa'], null, true], [['koji', 'pc'], null, true]], 'his looks, in order: at her for the coins, at her again for the book, at you after the seal');
  const coinLook = early.length === 1 ? early[0][0] : null;
  const isOto = (c) => c && c.op === 'walkto' && c.args[0] === 'oto';
  const rest = cm.filter((c) => !(c.op === 'walkto' && c.args[0] === 'pc') && c !== coinLook && !isOto(c) && !isRetry(c)).map((c) => { const o = Object.assign({}, c); delete o.line; return o; });
  t.eq([rest.length, sha(rest)], [52, PARENT_FARE_PAY], 'every other command of lq.fare_pay is exactly 315b770\'s (52, line numbers aside)');

  // 4. the route term outside a run
  const s0 = RB.state.newCampaign({ edition: 2 });
  t.ok(!RB.state.test(s0, 'scene.lq.fare_pay_koji') && !RB.state.test(s0, 'scene.lq.fare_pay'), 'the route term is false outside a run (runtime only, never saved)');

  // 5. the quest guide, as 315b770 answers it
  const out = {};
  for (const [name, map, x, y] of [['at the teahouse', 'rw.tea', 4, 7], ['in the village', 'rw.village', 30, 20]]) {
    const s = RB.state.newCampaign({ edition: 2 });
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, rw_koji_back: true, rw_echo_done: true, lq_fare_found: true, lq_ally1: true });
    s.quests.lq_fare = { stage: 4, done: false, t: 1 };
    s.map = map; s.x = x; s.y = y;
    G.reset();
    out[name] = { targets: G.targets('lq_fare', s), nudges: G.nudges('lq_fare', s) };
    const tg = out[name].targets;
    const one = tg && tg.targets && tg.targets.length === 1 ? tg.targets[0] : null;
    t.eq(one && { stage: tg.stage, how: tg.how, kind: one.kind, map: one.map, id: one.id, at: [one.x, one.y], opts: one.opts }, { stage: 4, how: 'authored', kind: 'npc', map: 'rw.tea', id: 'lq_chigusa', at: [6, 4], opts: [{ scene: 'lq.fare_pay' }] }, name + ': the guide names one place, Chigusa at her table, talked to for lq.fare_pay');
  }
  t.eq(sha(out), PARENT_GUIDE, 'the guide\'s whole answer at step 4 (targets and nudges, both places) is exactly 315b770\'s');
  // 6. the two staging walks of CC-644 (Agnes 6946332830)
  {
    const otos = cm.map((c, j) => [c, j]).filter(([c]) => c.op === 'walkto' && c.args[0] === 'oto');
    t.eq(otos.map(([c, j]) => [j, c.args, c.if]), [[0, ['oto', '3', '4', 'down'], '!scene.lq.fare_pay_koji&slot.oto=3&departed']], "Oto's one step west to (3,4), facing down, on Chigusa's route only and only when he is in the room (slot.oto=3&departed), is the scene's first command");
    t.eq([cm[1] && cm[1].op, cm[1] && cm[1].args, cm[1] && cm[1].if], ['walkto', ['comp', '3', '7', 'right'], 'comp'], "and your companion's walk to the door comes next, as before");
    const retries = cm.map((c, j) => [c, j]).filter(([c]) => isRetry(c));
    t.eq(retries.map(([c, j]) => [j - i, c.args]), [[1, ['comp', '3', '7', 'right']]], "your companion's door walk tried again once, on the route through K~ji, straight after your step aside to (5,7)");
    const walks = cm.filter((c) => c.op === 'walkto').map((c) => [c.args[0], c.if]);
    t.eq(walks, [['oto', '!scene.lq.fare_pay_koji&slot.oto=3&departed'], ['comp', 'comp'], ['pc', 'scene.lq.fare_pay_koji'], ['comp', 'comp&scene.lq.fare_pay_koji'], ['lq_chigusa', null]], 'the scene\'s walks, in order: Oto, your companion, you (K~ji\'s route), your companion again (K~ji\'s route), Chigusa');
  }
};
