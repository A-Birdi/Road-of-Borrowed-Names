/* A written leaf carried off the Wind Stone (RBN-QA-076; Agnes 6318288260, Local CL-114). When a leaf is sent home
 * from the stone (each of Kotonoha's ko.sent_* scenes: `!beat leafhome.east`, or `leafhome.north`, as the line that
 * sends it is read), one leaf, drawn as the island's written leaves are (gold, a stroke of ink), rises off the stone's
 * top turning over and is carried away on the wind the way its line names, fading as it goes, in about 1.8 s; east is
 * the way the stone's wind blows. `!beat leafhome.end` after that line: with Reduce motion the leaf has lain still on
 * the stone while the line was read, and is gone (a still cue; the toast says where it went). Nothing is drawn while
 * Skip seen runs, nor after the map or the campaign changes. Presentation only (52_staging.js's beats): the leaf's
 * item, the flags, the count, the sound, the toast and the scene's flow are the scenes' own and unchanged.
 * Drawn from 60_render.js after the world's things, so it is lit and graded with them. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.leafHome = (function () {
  'use strict';
  const DUR = 1800;
  const GOLD = ['#a8822e', '#d0a844', '#e8c868'], INK = '#2a2434';
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  let cur = null, drawn = null;

  // the Wind Stone on this map: the thing whose scene is the stone's, its top over the middle of its tiles
  function stone() {
    const W = RB.world && RB.world.W, m = W && W.map;
    if (!m) return null;
    const p = (m.props || []).find((q) => q.scene === 'ko.windstone');
    if (!p) return null;
    const pd = (RB.props && RB.props.P[p.p]) || {};
    return { map: m.id, x: p.x + (p.w || pd.w || 1) / 2, y: p.y };
  }
  function start(dir) {
    cur = null; drawn = null;
    if (RB.game.fastForward && RB.game.fastForward()) return;
    const st = stone();
    if (!st) return;
    cur = { map: st.map, x: st.x, y: st.y, dir: dir === 'north' ? 'north' : 'east', at: now(), still: !!RB.game.reducedMotion() };
  }
  // the line has been read: the still leaf is gone; one in flight finishes by itself
  function end() { if (cur && cur.still) cur = null; }
  function onBeat(e) {
    const id = (e && e.id) || '';
    if (id === 'leafhome.end') end();
    else if (id.indexOf('leafhome.') === 0) start(id.slice(9));
  }

  // one written leaf, about 18×7 art px, so it reads at play size: flat (an almond of gold in an ink rim, lit above and
  // shaded below, its midrib, and short strokes of ink across it: writing, never a character) or turned edge-on (a
  // sliver)
  const ROWS = [[6, 6], [3, 12], [1, 16], [0, 18], [1, 16], [3, 12], [6, 6]]; // [x, width] per row
  function leaf(c, x, y, flat) {
    const P = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x + a), Math.round(y + b), w, h); };
    if (!flat) { P(7, -1, 4, 9, INK); P(8, 0, 2, 7, GOLD[1]); return; }
    P(6, -1, 6, 1, INK); P(6, 7, 6, 1, INK);
    ROWS.forEach(([a, w], i) => P(a - 1, i, w + 2, 1, INK));
    ROWS.forEach(([a, w], i) => P(a, i, w, 1, i < 3 ? GOLD[2] : i < 5 ? GOLD[1] : GOLD[0]));
    P(2, 3, 14, 1, GOLD[0]);
    for (const [a, b, w] of [[4, 2, 3], [9, 2, 2], [12, 2, 2], [5, 4, 3], [10, 4, 3]]) P(a, b, w, 1, INK);
  }
  function draw(c, env) {
    if (!cur) return;
    const W = RB.world && RB.world.W;
    if (!W || !W.map || W.map.id !== cur.map || (RB.game.fastForward && RB.game.fastForward())) { cur = null; return; }
    const x0 = env.ax(cur.x * env.TS) - 9, y0 = env.ay(cur.y * env.TS) + 1; // on the stone's top, in its middle
    if (cur.still) { leaf(c, x0, y0, true); drawn = { x: x0, y: y0, flat: true, alpha: 1, at: now() }; return; }
    const u = (now() - cur.at) / DUR;
    if (u >= 1) { cur = null; return; }
    // lifted off quickly, then carried: up and away east on the stone's wind, or up and away north (a shorter climb:
    // the stone stands near the top of the village's view, and the leaf should fade before it leaves it), swaying as
    // it goes and turning over every few frames
    const lift = 1 - (1 - Math.min(1, u * 1.6)) * (1 - Math.min(1, u * 1.6));
    const sway = Math.sin(u * 9) * 4;
    const x = cur.dir === 'east' ? x0 + Math.pow(u, 1.5) * 150 + sway : x0 + sway * 1.5;
    const y = y0 - lift * 26 - u * (cur.dir === 'north' ? 44 : 56);
    const alpha = u < 0.72 ? 1 : Math.max(0, (1 - u) / 0.28);
    c.save();
    c.globalAlpha = alpha;
    const flat = Math.floor(u * 16) % 4 < 3;
    leaf(c, x, y, flat);
    c.restore();
    drawn = { x: Math.round(x), y: Math.round(y), flat, alpha, u, at: now() };
  }
  // for the browser tests: what is shown now (in flight, the fraction of its way), and where the leaf was last drawn
  // (its top-left in the buffer's art px, flat or edge-on; at = when)
  const state = () => (cur ? { map: cur.map, x: cur.x, y: cur.y, dir: cur.dir, still: cur.still, u: cur.still ? null : Math.min(1, (now() - cur.at) / DUR) } : null);
  const last = () => drawn;

  if (RB.bus) {
    RB.bus.on('stage:beat', onBeat);
    RB.bus.on('campaign:changing', () => { cur = null; });
  }
  return { draw, state, last };
})();
