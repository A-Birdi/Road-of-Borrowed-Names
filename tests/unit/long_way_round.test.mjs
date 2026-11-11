// The Long Way Round's middle roots (Kotonoha; Agnes 6550658712 and 6550969828; Local CL-577, CL-578; Cloud CC-418,
// CC-419): the first leaf (B, ko_root_b) draws back the roots in the middle of the passage, but the arch there (11,15)
// is two wide and one high while the passage is three rows high, so you could pass it on rows 16-17 before B, reach the
// second leaf (C) and the reunion, and never see B. Now the passage is walled at (11..12, 16..17), placed after the
// scatter, and the guide's stage 5 names B's leaf until B or C. In node, the real map, collision and guide:
//  1. the terrain: the four cells are walls; every other tile and block is as before (a fingerprint of the map with
//     those four cells left out, taken before the change); the scattered rocks where they were; props, exits, spawns
//     and the echo unchanged;
//  2. the way west (4-way steps on the engine's own collision, RB.maps.blockedStatic, and exits through RB.maps.exitAt):
//     before B, from the entrance, C's leaf is out of reach and B's in reach, the way north shut; after B, C's leaf in
//     reach; with C done and B not (a journey that passed before this change), B's leaf from the entrance, and from the
//     west side the way north open; a west-side save with neither: C's leaf in reach (its way out), B's not;
//  3. the way round after C: from the way round's landing in the Tidal Hollow (2,4), apart or together, its west exit
//     back to the Long Way Round's entrance, beside B's leaf;
//  4. the guide at stage 5: before B or C, B's leaf (26,20); after B, C's leaf, as before; with C done, never back to B
//     (as before); a west-side save from before the change with neither done is pointed at B as well: the known limit
//     (Agnes 6550969828), whose way out is C;
//  5. no line, scene or quest text changes.
// Walked in the browser (the old bypass, the barrier, B opening it, saves on the four cells, the echo) is
// tests/e2e/long_way_round.mjs.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, D = C.maps['ko.roots3'];
  const CELLS = [[11, 16], [12, 16], [11, 17], [12, 17]];
  const camp = (flags, map) => {
    const s = RB.state.newCampaign(); s.edition = 2; s.map = map || 'ko.roots3';
    Object.assign(s.flags, { ko_ch9: true, ko_tide_in: true, ko_apart: true, ko_root_a: true }, flags);
    RB.state.setQuest(s, 'ko_main', 5);
    RB.game.s = s; if (RB.game.G) RB.game.G.s = s;
    return s;
  };
  camp({});
  RB.maps.forget('ko.roots3'); RB.maps.forget('ko.roots2');
  const m = RB.maps.compile('ko.roots3');

  // ---- 1. the terrain
  t.ok(CELLS.every(([x, y]) => m.block[y * m.w + x] && D.terrain[y][x] === '#'), '1 the four cells (11..12, 16..17) are walls');
  const mask = (arr) => Array.from(arr, (v, i) => (CELLS.some(([x, y]) => y * m.w + x === i) ? null : v));
  const fp = crypto.createHash('sha256').update(JSON.stringify({ tiles: mask(m.tiles), block: mask(m.block).map((b) => (b == null ? null : !!b)) })).digest('hex');
  t.eq([m.w, m.h, fp], [30, 24, 'c3c30381a81cc7a8d681f1f7e43f2174cabe5790cefaf0ba39e83089e0a17d7c'], '1 every other tile and block as before the change (the map without those four cells)');
  const rocks = []; D.terrain.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'r') rocks.push(x + ',' + y); }));
  t.eq(rocks, ['13,16', '16,17', '20,18', '25,18'], '1 the four scattered rocks where they were');
  const rest = { props: D.props, exits: D.exits, spawn: D.spawn, foes: D.foes, npcs: D.npcs, triggers: D.triggers || [], onEnter: D.onEnter };
  t.eq(crypto.createHash('sha256').update(JSON.stringify(rest)).digest('hex'), 'aebcae6d30642445f032d0ceecee74eae31784fe3ebd9e056ff99311b4565a3a',
    '1 props (the postgame tide puzzle\'s included), exits, spawns, people, triggers and arrivals as before the change');
  t.eq(D.foes, [{ id: 'r3a', enemy: 'ko.echo', x: 5, y: 10, patrol: 2, bg: 'kotonoha_cave' }], '1 the echo as before');

  // ---- 2. the way west
  const reach = (mapId, from) => {
    const mm = RB.maps.compile(mapId), seen = new Set([from.join(',')]), q = [from];
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (seen.has(k) || RB.maps.blockedStatic(mm, nx, ny)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return seen;
  };
  const beside = (S, x, y) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].some(([a, b]) => S.has(a + ',' + b));
  const north = (S) => S.has('22,0') && !!RB.maps.exitAt(m, 22, 0);
  const row = (flags, from) => { camp(flags); const S = reach('ko.roots3', from); return { C: beside(S, 4, 6), B: beside(S, 26, 20), north: north(S) }; };
  t.eq(row({}, [28, 18]), { C: false, B: true, north: false }, '2 before B, from the entrance: C\'s leaf out of reach, B\'s in reach, the way north shut');
  camp({});
  t.ok(CELLS.concat([[11, 15], [12, 15]]).every(([x, y]) => RB.maps.blockedStatic(m, x, y)), '2 before B: the arch and the four cells all closed');
  t.eq(row({ ko_root_b: true }, [28, 18]), { C: true, B: true, north: false }, '2 after B: C\'s leaf in reach');
  t.ok([[11, 15], [12, 15]].every(([x, y]) => !RB.maps.blockedStatic(m, x, y)) && CELLS.every(([x, y]) => RB.maps.blockedStatic(m, x, y)), '2 after B: row 15 open under the arch, the four cells still walls');
  t.eq(row({ ko_root_c: true }, [28, 18]), { C: false, B: true, north: false }, '2 C done, B not (passed before the change), from the entrance: B\'s leaf');
  t.eq(row({ ko_root_c: true }, [4, 8]), { C: true, B: false, north: true }, '2 C done, B not, from the west side: the way north open');
  t.eq(row({}, [4, 8]), { C: true, B: false, north: false }, '2 a west-side save with neither: C\'s leaf in reach (its way out), B\'s not');

  // ---- 3. the way round after C, back to the entrance
  const m2 = RB.maps.compile('ko.roots2'), sp3 = D.spawn.from_roots2;
  for (const [what, flags] of [['apart', { ko_root_c: true }], ['together', { ko_root_c: true, ko_apart: false, ko_reunited: true }]]) {
    camp(flags, 'ko.roots2');
    const S = reach('ko.roots2', C.maps['ko.roots2'].spawn.from_round.slice(0, 2));
    const out = [[0, 18], [0, 19]].filter(([x, y]) => S.has(x + ',' + y)).map(([x, y]) => RB.maps.exitAt(m2, x, y)).filter((e) => e && e.to === 'ko.roots3' && e.sp === 'from_roots2');
    camp(flags);
    t.ok(out.length > 0 && beside(reach('ko.roots3', sp3.slice(0, 2)), 26, 20), '3 ' + what + ': from the way round\'s landing (2,4), the west exit back to the entrance (28,18), beside B\'s leaf');
  }

  // ---- 4. the guide at stage 5
  const guide = (flags) => { const r = RB.questGuide.analyse('ko_main', camp(flags)); return [r.how, (r.targets || []).map((x) => [x.map, x.x, x.y])]; };
  t.eq(guide({}), ['authored', [['ko.roots3', 26, 20]]], '4 before B or C: B\'s leaf (26,20)');
  t.eq(guide({ ko_root_b: true }), ['needs', [['ko.roots3', 4, 6]]], '4 after B: C\'s leaf, as before');
  const after = guide({ ko_root_c: true });
  t.ok(after[0] === 'direct' && after[1].every(([mp]) => mp === 'ko.roots2'), '4 C done, B not: on to the Tidal Hollow, never back to B ' + JSON.stringify(after));
  t.eq(guide({ ko_root_b: true, ko_root_c: true }), after, '4 B and C done: the same');
  t.eq(guide({}), ['authored', [['ko.roots3', 26, 20]]], '4 the known limit: a west-side save from before the change with neither done is pointed at B as well (its way out is C)');
  const st5 = C.quests.ko_main.stages[5];
  t.eq([st5.en, st5.atIf], ['The tide has come in between you and your companion. Find a way round.', [{ if: '!ko_root_b&!ko_root_c', at: { map: 'ko.roots3', prop: 'ko_current', x: 26, y: 20 } }]], '4 stage 5: its line as before, one entry');

  // ---- 5. no text changes
  t.eq([D.name.en, D.name.jp], ['The Long Way Round', '{回|まわ}り{道|みち}'], '5 the map\'s name as before');
};
