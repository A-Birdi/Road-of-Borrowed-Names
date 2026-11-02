// The Upper Basin's drained walkway (Agnes 6569630781; Cloud CC-467; Local CL-631). The drowned stretch of the north
// walkway, nine tiles at (26–28, 2–4), was authored as shallow water under the flood, so draining the basin showed water
// where the sluice's narration says the walkway rises out of it. Now the nine tiles are paving (stonefloor) under the same
// conditional flood. With synthetic campaigns only:
//  1. the map: the nine tiles stonefloor and walkable; the twelve-chapter edition's map, as before;
//  2. before the drain: each of the nine under its own flood and closed to walking, as before, and the way east to the
//     stairs closed;
//  3. the drain, the sluice's own scene (mb.gate1) through the real runner: mb_u1_low set; the nine open and paved, the
//     way east to the stairs open; the sluice asked again says it is open;
//  4. a save round-tripped through the save's own migration: still paved and open;
//  5. everything else as before: every other tile against the base's fingerprint (taken on the base, d37ccf5); the scattered puddles
//     on the same ten tiles; the basin's 162 tiles of dark water; the flood's nine props and their condition;
//  no scene ended on an error from the runner.
import { createHash } from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, M = RB.maps;
  const flat = (x) => JSON.stringify(x);
  const ID = 'mb.under1';
  const NINE = [];
  for (let y = 2; y <= 4; y++) for (let x = 26; x <= 28; x++) NINE.push([x, y]);
  const nine = (x, y) => x >= 26 && x <= 28 && y >= 2 && y <= 4;

  // ---- a minimal stage (as tests/unit/mp_comic_cancel.test.mjs) ---------------------------------------------------------
  let lines = [];
  RB.ui.dialogue.say = async (l) => { lines.push(l.en || ''); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.inBattle = () => false;
  RB.game.transition = async () => {};
  RB.save.autosave = async () => {};
  if (RB.staging) RB.staging.walkTo = async () => {};
  const m = M.compile(ID);
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = m; return st; };
  const fresh = (flags) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'mb-basin-test'; st.map = ID; st.x = 9; st.y = 17;
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb_under_seen: true, mb_tab1: true }, flags || {});
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id) => { lines = []; try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  const tile = (x, y) => M.tileAt(m, x, y);
  const closed = () => NINE.filter(([x, y]) => M.blockedStatic(m, x, y) || !tile(x, y).walk).map(([x, y]) => x + ',' + y);
  // on foot, from the walkway west of the stretch to the tile beside the stairs down
  const reach = (from, to) => {
    const seen = new Set([from.join()]), q = [from];
    while (q.length) {
      const [x, y] = q.shift();
      if (x === to[0] && y === to[1]) return true;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        const tl = tile(nx, ny);
        if (seen.has(k) || !tl || !tl.walk || M.blockedStatic(m, nx, ny)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return false;
  };
  const floods = () => m.props.filter((p) => p.p === 'lf_flood');

  // 1. the map
  t.ok(NINE.every(([x, y]) => tile(x, y).id === 'stonefloor' && tile(x, y).walk) && C.maps[ID].edition === 2,
    '1 the nine tiles are stonefloor and walkable; the twelve-chapter edition\'s map ' + flat(NINE.map(([x, y]) => tile(x, y).id)));

  // 2. before the drain
  fresh();
  const covered = NINE.filter(([x, y]) => floods().some((p) => p.x === x && p.y === y && p.if === '!mb_u1_low'));
  t.ok(covered.length === 9 && flat(closed()) === flat(NINE.map((c) => c.join())) && !reach([25, 3], [30, 3]),
    '2 before the drain: each of the nine under its flood and closed, and the way east to the stairs closed ' + flat({ covered: covered.length, closed: closed().length }));

  // 3. the drain, through the sluice's own scene
  await run('mb.gate1');
  const said = lines.slice();
  t.ok(!!s.flags.mb_u1_low && closed().length === 0 && NINE.every(([x, y]) => tile(x, y).id === 'stonefloor') && reach([25, 3], [30, 3]) && reach([30, 3], [3, 3]) && said.some((l) => /east walkway/i.test(l)),
    '3 the sluice opened: mb_u1_low set, the nine open and paved, the way east to the stairs open ' + flat({ low: !!s.flags.mb_u1_low, closed: closed(), said: said.slice(-1) }));
  await run('mb.gate1');
  t.ok(lines.length === 1 && /The sluice is open/.test(lines[0]),
    '3 the sluice asked again: it says it is open, as before ' + flat(lines));

  // 4. a save and load
  use(RB.save.migrate(JSON.parse(JSON.stringify(s))));
  t.ok(!!s.flags.mb_u1_low && closed().length === 0 && NINE.every(([x, y]) => tile(x, y).id === 'stonefloor') && reach([25, 3], [30, 3]),
    '4 after a save and load: still paved and open ' + flat({ closed: closed() }));

  // 5. everything else as before
  const ids = [], puddles = [], counts = {};
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const id = tile(x, y).id;
    ids.push(nine(x, y) ? '?' : id);
    if (!nine(x, y)) counts[id] = (counts[id] || 0) + 1;
    if (id === 'shallow') puddles.push(x + ',' + y);
  }
  t.eq(createHash('sha256').update(ids.join(',')).digest('hex'), '88df949ccbbd6da3b83f904cad9e208e8c99c25677d9ef876bd3b7022688720e',
    '5 every other tile of the map as on the base (its fingerprint, the nine left out)');
  t.eq(puddles.join(' '), '8,2 10,2 23,2 14,3 17,3 19,3 20,3 4,4 9,4 18,4', '5 the scattered puddles on the same ten tiles, and no other shallow water');
  t.ok(counts.darkwater === 162 && floods().length === 9 && floods().every((p) => p.if === '!mb_u1_low' && nine(p.x, p.y)),
    '5 the basin\'s 162 tiles of dark water, and the flood\'s nine props and their condition, as before ' + flat({ dark: counts.darkwater, floods: floods().length }));

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
