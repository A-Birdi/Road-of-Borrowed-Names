// The bell tower's guidance (Agnes 6548995370; Cloud CC-412; Local CL-571 and CL-572; Agnes 6549259814). Inside the
// tower (lf_main step 7, "read each gate plate carefully and drain the way down to the bell chamber") the guide showed
// only "wait", with nothing marked, until gate C: the three gates are flags, not steps, and the derivation can't see
// past a shut one. Now step 7 names the plate of the first gate still shut: A on the Upper Floor, B in the Gate Works,
// C on the Drowned Stair. After C, the derivation finds the Bell Chamber as before. No fourth target, no hint, no new
// text, no step changed.
// With synthetic campaigns only (the guide asked, never played), carrying what a journey has by step 7 (Tokuji's boat
// lent, the stacks open, the ledger and the channel seen):
//  1. the step: its three atIf entries in order, its words unchanged, no hint; ten steps, step 3's own atIf as before;
//  2. no gates: plate A (lf.tower_upper 5,2), from the tower's top floor, the Upper Floor, the sluice and the town;
//  3. gate A: plate B (lf.tower_mid 9,3), from the Upper and Middle floors, the top floor and the sluice; the same with
//     the middle drained but not sealed, the east door open, and the middle reflooded;
//  4. gates A and B: plate C (lf.tower_low 3,2), from the Middle and Lower floors and the sluice; the same with one plug
//     pulled; gate B sealed as its scene does it (the east door's flag cleared, the gate's set), then down a floor: C;
//  5. each plate marked is there in that state, is the one its gate's plate scene reads, and the guide's Next line names
//     its floor, never "no way there"; marked, and no "wait";
//  6. after C: the Bell Chamber, before and after the keeper, from the tower and from the sluice, as on the parent; no
//     "wait";
//  7. every other step (0 to 6, 8 and 9), in each gate state and from each place, as on the parent;
//  8. asking changes nothing in the journey.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

// computed on the parent (17d35e9): step 7 after gate C, and every other step, in each gate state and from each place
const AFTER_C_FP = '53fbd4598c3dedfb';
const OTHER_FP = '6dcc0a6515dcf334';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, G = RB.questGuide, test = RB.state.test;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const Q = C.quests.lf_main, st7 = Q.stages[7];
  const BASE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'lf_arrived', 'lf_town_intro', 'lf_yae_told', 'lf_tokuji_told', 'lf_tokuji_boat', 'lf_akari_key', 'lf_stacks_open', 'lf_ledger_seen',
    'lf_conduit_seen', 'lf_tower_entered'];
  const where = (e) => e.map + ':' + e.kind + ':' + (e.id || e.p) + (e.x != null ? '@' + e.x + ',' + e.y : '');
  function camp(map, x, y, flags, stage = 7) {
    const s = RB.state.newCampaign({ edition: 2 });
    s.id = 'lf-tower-guide'; s.comp = 'nao';
    for (const f of BASE) s.flags[f] = true;
    Object.assign(s.flags, flags || {});
    s.quests.lf_main = { stage, done: false, t: 1 };
    s.map = map; s.x = x; s.y = y;
    RB.game.s = s;
    return s;
  }
  // each question here starts from a clear cache (when this test was written, the guide's signature counted flags, so
  // two synthetic states with the same count on the same map shared an answer; it names them now:
  // tests/unit/guide_cache.test.mjs)
  const ask = (s) => {
    G.reset();
    const before = flat([s.flags, s.quests, s.inv, s.map, s.x, s.y]);
    const r = G.targets('lf_main', s), n = G.nudges('lf_main', s);
    const next = G.nextLines(r).map((l) => l.en).join(' | ');
    return { how: r.how, targets: r.targets.map(where), next, markable: !!n.markable, wait: /wait/i.test(flat(n)), nowhere: /no way there/i.test(next + flat(n)), pure: before === flat([s.flags, s.quests, s.inv, s.map, s.x, s.y]), r };
  };
  const PLACES = { top: ['lf.tower_top', 7, 9], upper: ['lf.tower_upper', 10, 10], mid: ['lf.tower_mid', 10, 4], low: ['lf.tower_low', 10, 4], bell: ['lf.bellhall', 7, 12], sluice: ['lf.sluice', 10, 10], town: ['lf.town', 11, 12] };
  const PLATE = { a: ['lf.tower_upper:prop:lf_plate@5,2', 'lf.plate_a', /in Upper Floor/], b: ['lf.tower_mid:prop:lf_plate@9,3', 'lf.plate_b', /in Gate Works/], c: ['lf.tower_low:prop:lf_plate@3,2', 'lf.plate_c', /in Drowned Stair/] };
  const plateHere = (s, tg, scene) => (C.maps[tg.map].props || []).filter((q) => q.p === tg.p && q.x === tg.x && q.y === tg.y && (!q.if || test(s, q.if))).map((q) => q.scene).join() === scene;
  const GATES = { none: {}, a: { lf_gate_a: true }, ab: { lf_gate_a: true, lf_gate_b: true }, abc: { lf_gate_a: true, lf_gate_b: true, lf_gate_c: true } };

  // 1. the step
  {
    const a = (st7.atIf || []).map((x) => x.if + '>' + x.at.map + ':' + x.at.prop + '@' + x.at.x + ',' + x.at.y);
    const other = Q.stages.map((x, i) => (i !== 7 && (x.atIf || x.at) ? i : null)).filter((x) => x != null);
    t.ok(flat(a) === flat(['!lf_gate_a>lf.tower_upper:lf_plate@5,2', '!lf_gate_b>lf.tower_mid:lf_plate@9,3', '!lf_gate_c>lf.tower_low:lf_plate@3,2']) &&
      st7.en === 'Inside the tower: read each gate plate carefully and drain the way down to the bell chamber.' &&
      st7.jp === '{水門|すいもん} の {札|ふだ} を {読|よ}み 、{鐘|かね} の {間|ま} の {水|みず} を {抜|ぬ}く 。' && !st7.hint && !st7.at && !st7.textIf && Q.stages.length === 10 &&
      flat(other) === '[3]' && flat(Q.stages[3].atIf) === flat([{ if: '!lf_stacks_open', at: { map: 'lf.records', prop: 'stairs', x: 14, y: 3 } }]),
      '1 step 7: plates A, B and C in order, its words unchanged, no hint; ten steps; step 3\'s own atIf as before ' + flat({ a, other }));
  }

  // 2.-5. before gate C: the plate of the first gate still shut
  const cases = [
    ['2 no gates', GATES.none, ['top', 'upper', 'sluice', 'town'], 'a'],
    ['3 gate A', GATES.a, ['upper', 'mid', 'top', 'sluice'], 'b'],
    ['3 gate A, the middle drained but not sealed', Object.assign({ lf_mid_seen: true, lf_shortcut: true, lf_mid_drained: true }, GATES.a), ['mid', 'top', 'sluice'], 'b'],
    ['3 gate A, the east door open', Object.assign({ lf_mid_seen: true, lf_shortcut: true, lf_mid_drained: true, lf_east_open: true }, GATES.a), ['mid', 'upper'], 'b'],
    ['3 gate A, the middle reflooded', Object.assign({ lf_mid_seen: true, lf_shortcut: true, lf_plate_b_read: true }, GATES.a), ['mid', 'top', 'town'], 'b'],
    ['4 gates A and B', GATES.ab, ['mid', 'low', 'sluice'], 'c'],
    ['4 gates A and B, one plug pulled', Object.assign({ lf_low_seen: true, lf_south_pulled: true }, GATES.ab), ['low', 'mid'], 'c'],
  ];
  for (const [label, flags, places, plate] of cases) {
    const got = [];
    let good = true;
    for (const pl of places) {
      const s = camp(...PLACES[pl], flags);
      const r = ask(s);
      const tg = r.r.targets[0] || {};
      const okHere = r.how === 'authored' && flat(r.targets) === flat([PLATE[plate][0]]) && plateHere(s, tg, PLATE[plate][1]) && PLATE[plate][2].test(r.next) &&
        /^Next: /.test(r.next) && !r.nowhere && r.markable && !r.wait && r.pure;
      good = good && okHere;
      got.push({ pl, how: r.how, targets: r.targets, next: r.next, markable: r.markable, wait: r.wait, pure: r.pure });
    }
    t.ok(good, label + ': plate ' + plate.toUpperCase() + ' (' + PLATE[plate][0] + ', read by ' + PLATE[plate][1] + '), marked and named by its floor, from ' + places.join(', ') + '; no "wait"; nothing changed ' + flat(got));
  }

  // 4. gate B sealed as lf.east_door's :seal does it, then down to the Drowned Stair (the exit the seal opens)
  {
    const s = camp(...PLACES.mid, Object.assign({ lf_mid_seen: true, lf_shortcut: true, lf_mid_drained: true, lf_east_open: true, lf_plate_b_read: true }, GATES.a));
    const before = ask(s);
    delete s.flags.lf_east_open; s.flags.lf_gate_b = true;
    const exit = (C.maps['lf.tower_mid'].exits || []).find((e) => e.to === 'lf.tower_low');
    s.map = exit.to; s.x = exit.tx; s.y = exit.ty;
    const after = G.targets('lf_main', s);
    t.ok(flat(before.targets) === flat([PLATE.b[0]]) && test(s, exit.if) && flat(after.targets.map(where)) === flat([PLATE.c[0]]),
      '4 gate B sealed as its scene does it, then down the exit it opens: plate C ' + flat({ before: before.targets, exit: exit.if, after: after.targets.map(where) }));
  }

  // 6. after C: the Bell Chamber, before and after the keeper, as on the parent
  {
    const got = {};
    let good = true;
    for (const [k, f] of [['keeper', GATES.abc], ['after', Object.assign({ lf_boss_done: true }, GATES.abc)]]) for (const pl of ['low', 'bell', 'mid', 'sluice']) {
      const r = ask(camp(...PLACES[pl], f));
      got[k + ':' + pl] = [r.how, r.targets, r.next];
      good = good && r.how !== 'authored' && r.targets.some((x) => /^lf\.bellhall:prop:lf_bigbell@7,7$/.test(x)) && r.markable && !r.wait && r.pure;
    }
    t.ok(good && fp(got) === AFTER_C_FP, '6 after gate C: the Bell Chamber, before and after the keeper, from the tower and the sluice, as on the parent; no "wait" ' + flat({ fp: fp(got), keeper: got['keeper:low'], after: got['after:bell'], sluice: [got['keeper:sluice'][0], got['after:sluice'][0]] }));
  }

  // 7. every other step, as on the parent
  {
    const got = {};
    for (const stage of [0, 1, 2, 3, 4, 5, 6, 8, 9]) for (const g of Object.keys(GATES)) for (const pl of Object.keys(PLACES)) {
      const r = ask(camp(...PLACES[pl], GATES[g], stage));
      got[stage + ':' + g + ':' + pl] = [r.how, r.targets, r.next, r.markable];
    }
    t.ok(fp(got) === OTHER_FP, '7 every other step (0 to 6, 8, 9), in each gate state and from each place, as on the parent ' + flat({ fp: fp(got), n: Object.keys(got).length, s6: got['6:none:sluice'], s9: got['9:abc:bell'] }));
  }

  // 8. asking changes nothing (also checked in each case above)
  {
    const s = camp(...PLACES.mid, GATES.a);
    const before = flat(s);
    for (let i = 0; i < 3; i++) { G.targets('lf_main', s); G.nudges('lf_main', s); G.nextLines(G.targets('lf_main', s)); }
    t.ok(flat(s) === before, '8 asking the guide three times changes nothing in the journey');
  }
};
