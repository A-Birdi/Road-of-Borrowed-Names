// RBN-QA-096 (Agnes 6336494089, 6336521164, 6337682714; Local CL-180, CL-181; Cloud CC-108 §3): the reunion in the
// Root Hollows is unavoidable on every way off the Tidal Hollow's north side. With your companion left on the far side
// (ko_apart) and the hollows reshaped (ko_root_c), the reunion's step triggers are walls on a graph of ko.roots2 and
// ko.roots3 together (every exit between them followed to its spawn): from the landing, the whole of the way round and
// the whole south bank, no route reaches the way up to the Whispering Hollow (ko.roots1) or on to the garden. Checked
// twice: with the engine's own blocking in that state, and with an overestimate that walks every walkable tile and
// ignores every prop (so the result never rests on a prop being solid). The negative controls: the old trigger alone,
// and the landing cut alone, each still let you out (the step south from the landing; the way round, the south bank
// and the reopened bridge). Also: coming back from either way off, the only step that plays nothing is the one straight
// back out; from the landing the only one is west into the passage; no trigger on the south bank; nothing before the
// third root; once only.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const camp = (flags) => {
    const s = RB.state.newCampaign({ edition: 2 });
    s.id = 'ko-reach'; s.comp = 'mio';
    for (const f of flags) s.flags[f] = true;
    RB.game.s = s;
    return s;
  };
  const test = (s, cond) => RB.state.test(s, cond);
  const MAPS = ['ko.roots2', 'ko.roots3'];
  const OUT = ['ko.roots1', 'ko.garden'];
  const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  const inR = (r, x, y) => x >= r.x && x < r.x + (r.w || 1) && y >= r.y && y < r.y + (r.h || 1);

  // the reunion's triggers as authored, and the two shapes that came before (the negative controls)
  const r2 = C.maps['ko.roots2'];
  const authored = r2.triggers.filter((tr) => tr.scene === 'ko.reunion');
  const COND = 'ko_apart&ko_root_c';
  const OLD = [{ x: 2, y: 3, w: 2, h: 2, scene: 'ko.reunion', if: COND }];
  const LANDING = [{ x: 2, y: 3, w: 2, h: 3, scene: 'ko.reunion', if: COND }];

  // walkable: 'engine' = the engine's own static blocking in this state (conditional props included); 'over' = every
  // tile the terrain lets you walk on, every prop ignored
  const walk = (mode, m, x, y) => {
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false;
    return mode === 'engine' ? !RB.maps.blockedStatic(m, x, y) : !!RB.maps.tileAt(m, x, y).walk;
  };
  // Every way off the north side that can be reached from `starts` without stepping onto a live reunion trigger
  function escapes(s, mode, reunion, starts) {
    const seen = new Set(), q = [], out = [];
    const push = (map, x, y, via) => { const k = map + ':' + x + ',' + y; if (!seen.has(k)) { seen.add(k); q.push([map, x, y, via]); } };
    for (const [map, x, y] of starts) push(map, x, y, map + ':' + x + ',' + y);
    while (q.length) {
      const [map, x, y, via] = q.shift();
      const m = RB.maps.compile(map);
      const trig = map === 'ko.roots2' ? reunion.filter((tr) => test(s, tr.if)) : [];
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy;
        if (!walk(mode, m, nx, ny)) continue;
        const ex = m.exits.find((e) => inR(e, nx, ny) && (!e.if || test(s, e.if)));
        if (ex) {
          if (OUT.includes(ex.to)) { out.push(ex.to + ' (from ' + via + ')'); continue; }
          const sp = C.maps[ex.to].spawn[ex.sp];
          push(ex.to, sp[0], sp[1], via);
          continue;
        }
        if (trig.some((tr) => inR(tr, nx, ny))) continue; // the reunion plays here
        push(map, nx, ny, via);
      }
    }
    return [...new Set(out.map((o) => o.split(' ')[0]))].map((to) => out.find((o) => o.startsWith(to + ' ')));
  }
  // from the landing, every tile of the way round, every tile of the south bank (rows 13 and below)
  function starts(mode) {
    const list = [['ko.roots2', ...r2.spawn.from_round.slice(0, 2)]];
    const m3 = RB.maps.compile('ko.roots3'), m2 = RB.maps.compile('ko.roots2');
    for (let y = 0; y < m3.h; y++) for (let x = 0; x < m3.w; x++) if (walk(mode, m3, x, y)) list.push(['ko.roots3', x, y]);
    for (let y = 13; y < m2.h; y++) for (let x = 0; x < m2.w; x++) if (walk(mode, m2, x, y)) list.push(['ko.roots2', x, y]);
    return list;
  }

  // ---- the triggers as authored -------------------------------------------------------------------------------------
  const rects = authored.map((tr) => [tr.x, tr.y, tr.w, tr.h].join(','));
  t.eq(rects.sort(), ['14,1,4,2', '2,3,2,3', '29,3,2,2'], 'the reunion: the landing (x2–3, rows 3–5), before the way up (x14–17, rows 1–2) and before the garden (x29–30, rows 3–4)');
  t.ok(authored.every((tr) => tr.if === COND && !tr.once), 'each only while apart once the third root has turned (' + COND + '), none spent on its own');
  t.ok(authored.every((tr) => tr.y + tr.h - 1 <= 9), 'none on the south bank (all on rows 1–9, the north side)');
  t.ok((C.maps['ko.roots3'].triggers || []).every((tr) => tr.scene !== 'ko.reunion'), 'none on the way round');
  const ops = (C.scenes['ko.reunion'].cmds || []).map((c) => c.op + ':' + (c.args || []).join(' '));
  t.ok(ops.includes('unset:ko_apart') && ops.indexOf('unset:ko_apart') < ops.indexOf('quest:ko_main 6'), 'once only: the reunion unsets ko_apart (every trigger goes quiet) before the chapter moves on');

  // ---- the graph -------------------------------------------------------------------------------------------------------
  const APART = ['ko_ch9', 'ko_tide_in', 'ko_apart', 'ko_root_a', 'ko_root_b', 'ko_root_c'];
  for (const mode of ['engine', 'over']) {
    const s = camp(APART);
    const st = starts(mode);
    const now = escapes(s, mode, authored, st);
    t.ok(now.length === 0, mode + ': with the reunion\'s triggers, no way off the north side from the landing, the way round or the south bank (' + JSON.stringify(now) + ')');
    const old = escapes(s, mode, OLD, st);
    t.ok(old.some((o) => /^ko\.roots1/.test(o)) && old.some((o) => /^ko\.garden/.test(o)), mode + ', negative control: the old trigger alone lets you out both ways (' + JSON.stringify(old) + ')');
    const fromLanding = escapes(s, mode, OLD, [['ko.roots2', 2, 4]]);
    t.ok(fromLanding.length === 2, mode + ', negative control: with the old trigger, the landing\'s step south gets you out (' + JSON.stringify(fromLanding) + ')');
    const cut = escapes(s, mode, LANDING, st);
    t.ok(cut.length === 2 && cut.every((o) => /from ko\.roots(3|2:\d+,(1[3-9]|2\d))/.test(o)), mode + ', negative control: the landing cut alone still lets you out, by the way round, the south bank and the reopened bridge (' + JSON.stringify(cut) + ')');
    const cutLanding = escapes(s, mode, LANDING, [['ko.roots2', 2, 4]]);
    t.ok(cutLanding.length === 2, mode + ', negative control: with the landing cut alone, west from the landing and round again gets you out (' + JSON.stringify(cutLanding) + ')');
  }

  // ---- the first step from each arrival ----------------------------------------------------------------------------------
  {
    const s = camp(APART), m = RB.maps.compile('ko.roots2');
    const quiet = (x, y) => DIRS.map(([dx, dy]) => [x + dx, y + dy]).filter(([nx, ny]) => walk('over', m, nx, ny) && !authored.some((tr) => test(s, tr.if) && inR(tr, nx, ny)))
      .map(([nx, ny]) => { const ex = m.exits.find((e) => inR(e, nx, ny) && (!e.if || test(s, e.if))); return ex ? ex.to : nx + ',' + ny; });
    const sp = r2.spawn;
    t.eq(quiet(sp.from_round[0], sp.from_round[1]), ['1,4'], 'up from the way round (2,4): the only step that plays nothing is west, back into the passage');
    t.eq(quiet(sp.from_roots1[0], sp.from_roots1[1]), ['ko.roots1'], 'back from the Whispering Hollow (15,1): the only step that plays nothing is straight back up');
    t.eq(quiet(sp.from_garden[0], sp.from_garden[1]), ['ko.garden'], 'back from the garden (30,4): the only step that plays nothing is straight back east');
    const south = quiet(sp.from_roots3[0], sp.from_roots3[1]);
    t.ok(south.length >= 2 && !south.includes('ko.roots1') && !south.includes('ko.garden'), 'on the south bank (1,18) nothing plays (' + JSON.stringify(south) + ')');
  }

  // ---- nothing before the third root, nothing once together ----------------------------------------------------------------
  {
    const before = camp(['ko_ch9', 'ko_tide_in', 'ko_apart', 'ko_root_a', 'ko_root_b']);
    t.ok(authored.every((tr) => !test(before, tr.if)), 'before the third root (ko_root_c) no reunion trigger is live');
    const together = camp(['ko_ch9', 'ko_tide_in', 'ko_root_a', 'ko_root_b', 'ko_root_c', 'ko_reunited']);
    t.ok(authored.every((tr) => !test(together, tr.if)), 'once together again (ko_apart unset) none is live');
    const normal = camp(['ko_ch9']);
    t.ok(authored.every((tr) => !test(normal, tr.if)), 'on the way down, before the tide (no ko_apart), none is live');
  }
};
