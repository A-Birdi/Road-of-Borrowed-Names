// MW-1 (Robin, after AR-1 Mill): a travel tile that is a door or a change of level is walked onto, never only used; the
// Old Mill's flow follows the gears. The stairs are walked onto and say why they are shut (the pit is flooded while the
// gears are stopped) until the gears are mended, which also drains the pit; the loft's ladder is not there until the
// mended gears free the trapdoor and it drops with a thud; the millstone stands still until then; the wheel outside,
// looked at after the gears, still will not turn and points you up to the loft; the Mill Echo cannot be walked round.
// Elsewhere, every exit that plays a scene (stairs, ladders, doors that ask or explain first) is a real exit on its tile,
// so walking onto it plays that scene. The walking itself is tested in the browser (tests/e2e/mw1_mill_flow.mjs).
import { load } from '../lib/load.mjs';

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const M = RB.content.maps, P = RB.props.P, S = RB.content.scenes;
  const def = M['rw.mill1'];
  const ops = (id) => (S[id] ? S[id].cmds : []);
  const lines = (id) => ops(id).filter((c) => c.op === 'say').map((c) => c.jp + ' || ' + c.en);

  // ---- the stairs and the ladder are exits on their own tiles, walked onto ----
  t.eq(def.exits, [
    { x: 7, y: 11, to: 'rw.millroad', tx: 9, ty: 5, dir: 'down' },
    { x: 12, y: 9, to: 'rw.mill0', tx: 2, ty: 7, dir: 'up', locked: 'rw.m1_stairs', unlock: 'rw_gears' },
    { x: 2, y: 2, to: 'rw.mill2', tx: 2, ty: 6, dir: 'up', if: 'rw_gears' },
  ], 'the mill\'s ground floor: the door, the stairs (shut until the gears are mended, and they say why) and the ladder (only once it has dropped)');
  for (const e of def.exits.slice(1)) {
    const pr = def.props.filter((p) => p.x === e.x && p.y === e.y);
    t.ok(pr.length === 1 && P[pr[0].p].block === false && pr[0].block === undefined, 'the ' + pr.map((p) => p.p).join() + ' at ' + e.x + ',' + e.y + ' can be stepped onto');
  }
  t.ok(M['rw.mill0'].exits.some((e) => e.to === 'rw.mill1' && e.tx === 12 && e.ty === 8) && M['rw.mill2'].exits.some((e) => e.to === 'rw.mill1'), 'the pit and the loft lead back to the ground floor');
  const m1 = RB.maps.compile('rw.mill1');
  for (const [mp, x, y] of [['rw.mill0', 2, 7], ['rw.mill2', 2, 6]]) {
    const m = RB.maps.compile(mp);
    t.ok(!m.block[y * m.w + x] && !m.exits.some((e) => e.x === x && e.y === y), 'you land in ' + mp + ' at ' + x + ',' + y + ' on open floor, not on its way back');
  }

  // ---- the gears: the water drains from under the stairs, then the ladder drops (the flag between the two lines) ----
  const g = ops('rw.m1_gears');
  const iDrain = g.findIndex((c) => c.op === 'say' && /水|みず/.test(c.jp) && /降|お/.test(c.jp) && /draining/.test(c.en));
  const iSet = g.findIndex((c) => c.op === 'set' && c.args.join(' ') === 'rw_gears');
  const iThud = g.findIndex((c) => c.op === 'say' && /どすん/.test(c.jp) && /梯子/.test(c.jp) && /thud/.test(c.en));
  t.ok(iDrain > 0 && iSet > iDrain && iThud > iSet, 'the gears scene: the pit drains (now you can go down), the gears are set, the ladder drops with a thud (' + [iDrain, iSet, iThud] + ')');
  t.ok((RB.lex.bySurface('どすん') || []).length > 0, 'どすん is in the lexicon');
  const ladder = def.props.filter((p) => p.p === 'ladder');
  t.ok(ladder.length === 1 && ladder[0].if === 'rw_gears' && ladder[0].x === 2 && ladder[0].y === 2, 'the ladder is only there once the gears are mended');
  t.eq(ops('rw.m1_ladder').map((c) => c.op + ' ' + (c.args || []).join(' ')), ['warp rw.mill2 2 6 up'], 'using it from beside climbs, as walking onto it does');

  // ---- the stairs say why they are shut and what opens them ----
  const dark = lines('rw.m1_stairs').join('\n');
  t.ok(/歯車/.test(dark) && /水路/.test(dark) && /gears stopped/.test(dark) && /millrace/.test(dark) && !/wheel is jammed/.test(dark), 'the shut stairs: flooded, because the stopped gears keep the water from the millrace');
  t.ok(JSON.stringify(ops('rw.m1_stairs')).includes('rw.mill0'), 'and, mended, they lead down to the pit');

  // ---- the millstone stands still until the gears turn it ----
  const ms = def.props.filter((p) => p.p === 'millstone');
  t.eq(ms.map((p) => [p.if, p.o || null, p.scene]), [['!rw_gears', { still: true }, 'rw.m1_stone'], ['rw_gears', null, 'rw.m1_stone']], 'still before the gears, turning after');
  const stone = ops('rw.m1_stone');
  t.ok(stone.some((c) => c.op === 'if' || /rw_gears/.test(JSON.stringify(c))) && lines('rw.m1_stone').some((l) => /turns, heavily/.test(l)), 'its look after the gears: it turns, heavily, and is hot');
  t.ok(lines('rw.m1_stone').some((l) => /no one is turning it/.test(l)), 'before: warm, and no one is turning it');

  // ---- the wheel outside, after the gears: still will not turn, and the loft is why ----
  const wheel = lines('rw.mr_wheel').join('\n');
  t.ok(/rw_gears/.test(JSON.stringify(ops('rw.mr_wheel'))) && /屋根裏/.test(wheel) && /loft/.test(wheel) && /still won't turn/.test(wheel), 'the wheel after the gears: it strains but will not turn; something in the loft holds it');
  t.ok(M['rw.millroad'].props.some((p) => p.p === 'millwheel' && p.scene === 'rw.mr_wheel' && p.if === '!rw_echo_done'), 'and it can be looked at until the echo is put to rest');

  // ---- the Mill Echo cannot be walked round ----
  const band = def.triggers.find((tr) => tr.scene === 'rw.m1_boss');
  t.ok(band && band.if === 'rw_loft_done&!rw_echo_done' && band.x <= 1 && band.x + band.w >= 14, 'its approach is the whole width of the room');
  t.ok(def.onEnter.some((e) => e.scene === 'rw.m1_boss' && e.if === band.if && e.once !== false), 'and it meets you as you first come down from the loft, once (arrival events also run after every scene: a repeating one would restart the fight after a defeat)');
  const inBand = (x, y) => x >= band.x && x < band.x + band.w && y >= band.y && y < band.y + band.h;
  const seen = new Set(['2,3']), q = [[2, 3]];
  let out = null;
  while (q.length && !out) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (seen.has(k) || nx < 0 || ny < 0 || nx >= m1.w || ny >= m1.h || m1.block[ny * m1.w + nx] || inBand(nx, ny)) continue;
      if (m1.exits.some((e) => e.x === nx && e.y === ny && e.to !== 'rw.mill2')) { out = k; break; }
      seen.add(k); q.push([nx, ny]);
    }
  }
  t.ok(!out, 'from the foot of the ladder there is no way to the door or the stairs that keeps off its approach' + (out ? ' (' + out + ')' : ''));
  t.ok(S['rw.m1_boss'] && JSON.stringify(ops('rw.m1_boss')).includes('rw_echo'), 'the Echo\'s scene is there');

  // ---- every scene-exit in the game: a real way on, walked onto ----
  const sceneExits = [];
  for (const [id, m] of Object.entries(M)) for (const e of m.exits || []) if (e.scene) sceneExits.push([id, e]);
  t.ok(sceneExits.length >= 19, 'the stairs, ladders and doors that ask or explain first are exits on their tiles (' + sceneExits.length + ')');
  for (const [id, e] of sceneExits) {
    const where = id + ' ' + e.x + ',' + e.y;
    t.ok(!!S[e.scene], where + ': its scene ' + e.scene + ' exists');
    t.ok(!!M[e.to] && JSON.stringify(ops(e.scene)).includes('"' + e.to + '"'), where + ': its scene takes you to ' + e.to + ', where the exit says it goes');
    // the thing on the tile while the way is open (a shut hatch or a dead lantern in its place before then says its own)
    const pr = (m) => (m.props || []).filter((p) => p.x === e.x && p.y === e.y && p.scene && (!p.if || p.if === e.if));
    t.ok(pr(M[id]).every((p) => p.scene === e.scene), where + ': using the thing there plays the same scene');
    const to = RB.maps.compile(e.to);
    t.ok(!to.exits.some((x) => x.x === e.tx && x.y === e.ty), where + ': you land in ' + e.to + ' at ' + e.tx + ',' + e.ty + ', off its exits');
  }
  // ---- doors that were hidden until opened now say why they are shut ----
  t.ok(M['yn.lower'].exits.some((e) => e.locked === 'yn.vents_door' && e.unlock === 'yn_vents_open' && !e.if) && !!S['yn.vents_door'], 'the Steam Vents door: walked onto while shut, it says so');
  t.ok(M['lf.records'].exits.some((e) => e.locked === 'lf.stacks_door' && e.unlock === 'lf_stacks_open' && !e.if) && !!S['lf.stacks_door'], 'the stacks door: walked onto while locked, it says so');
};
