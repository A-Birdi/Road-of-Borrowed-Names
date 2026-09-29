/* Quest markers in the world (docs/ART_DIRECTION.md §7, "Quest markers"):
 * for the followed quest's next step (RB.questGuide), when Quest guidance
 * is "Markers and hints":
 * - above the person, thing or spot on this map: an amber paper diamond,
 *   inked like everything else, that bobs gently (still with reduced motion).
 *   It sits above the ▾ you-can-act-here chevron and is a different shape
 *   and colour, so the two never read as one;
 * - the same target off-screen: the diamond at the edge of the view with a
 *   small arrow toward it;
 * - on another map: a chunky arrow over the way out that starts the journey
 *   there (RB.world.towards; scene warps through RB.questGuide.firstHop),
 *   pointing out through it, or at the view's edge when that is off-screen;
 *   nothing when there is no way there now.
 * Drawn on the canvas only in plain walking ('world' mode): never over
 * dialogue, menus, battles or a scene. Edge pointers keep clear of the HUD
 * tags at the top and of the touch controls at the bottom. The Journey page
 * carries the same information as text ("Next: …"). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.questMarks = (function () {
  'use strict';
  const INK = '#2a2024', FILL = '#f0b43c', LIGHT = '#fff0b8', SHADE = '#c0761c', DEEP = '#8a4e12';
  const art = {};
  function makeDiamond() {
    // 15×17 art px: an inked diamond, lit from the upper left, with a fold
    const cv = RB.sprites.makeCanvas(15, 17), g = cv.getContext('2d');
    const rows = [[7, 1], [6, 3], [5, 5], [4, 7], [3, 9], [2, 11], [1, 13], [2, 11], [3, 9], [4, 7], [5, 5], [6, 3], [7, 1]];
    // outline: each row one pixel wider than the fill
    rows.forEach(([x, w], i) => { g.fillStyle = INK; g.fillRect(x - 1, i + 1, w + 2, 1); });
    g.fillRect(7, 0, 1, 1); g.fillRect(7, 14, 1, 1);
    rows.forEach(([x, w], i) => {
      const y = i + 1;
      g.fillStyle = FILL; g.fillRect(x, y, w, 1);
      // upper-left faces light, lower-right faces shade
      g.fillStyle = i < 6 ? LIGHT : FILL; g.fillRect(x, y, Math.ceil(w / 2), 1);
      g.fillStyle = i >= 6 ? SHADE : FILL; g.fillRect(x + Math.ceil(w / 2), y, Math.floor(w / 2), 1);
    });
    g.fillStyle = DEEP; g.fillRect(7, 8, 1, 5); // the fold
    g.fillStyle = '#ffffff'; g.fillRect(5, 4, 1, 1); g.fillRect(4, 5, 1, 1); // a glint
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(6, 16, 3, 1); // a faint drop shadow under the tip
    return cv;
  }
  // a chunky arrow pointing right (rotated in 90° steps: stays pixel-crisp)
  function makeArrow(dir) {
    const cv = RB.sprites.makeCanvas(16, 16), g = cv.getContext('2d');
    const px = (x, y, col) => {
      let X = x, Y = y;
      if (dir === 'left') X = 15 - x;
      else if (dir === 'down') { X = y; Y = x; }
      else if (dir === 'up') { X = y; Y = 15 - x; }
      g.fillStyle = col; g.fillRect(X, Y, 1, 1);
    };
    // shaft rows 5..10 from x 1..8, head from x 8..14
    for (let x = 0; x <= 15; x++) for (let y = 0; y <= 15; y++) {
      const inShaft = x >= 1 && x <= 8 && y >= 5 && y <= 10;
      const inHead = x >= 8 && x <= 14 && Math.abs(y - 7.5) <= (14 - x) + 0.5;
      if (!inShaft && !inHead) continue;
      const edgeShaft = inShaft && !inHead && (x === 1 || y === 5 || y === 10);
      const edgeHead = inHead && Math.abs(y - 7.5) > (14 - x) - 0.5;
      const edge = edgeShaft || edgeHead || (inHead && x === 8 && (y < 5 || y > 10));
      px(x, y, edge ? INK : y <= 7 ? (x < 11 ? LIGHT : FILL) : SHADE);
    }
    return cv;
  }
  const diamond = () => art.d || (art.d = makeDiamond());
  const arrow = (dir) => art['a' + dir] || (art['a' + dir] = makeArrow(dir));

  // ---- which quest, which targets (refreshed a few times a second) -------------------------------
  let cur = null;
  function info(W) {
    const now = W.time;
    if (cur && cur.map === W.map.id && now - cur.at < 300) return cur;
    const s = RB.game.s, G = RB.questGuide;
    const qid = G.followed(s);
    const r = qid ? G.targets(qid, s) : null;
    const way = r ? G.wayFrom(r) : null;
    cur = { at: now, map: W.map.id, qid, r, way };
    return cur;
  }
  function shown() {
    return !!(RB.game.s && RB.game.G && RB.game.G.playing && RB.game.mode() === 'world' && RB.questGuide.mode() === 'full' && RB.render.worldVisible());
  }

  // ---- the edges that must stay clear (in buffer px) ------------------------------------------------
  let safe = null, safeAt = -1e9;
  function insets(h, t) {
    if (safe && t - safeAt < 400) return safe;
    safeAt = t;
    const k = h.ART / RB.render.viewSize().scale; // buffer px per CSS px
    let top = 6, bottom = 6;
    if (typeof document !== 'undefined') {
      const hud = document.querySelector('.hud:not(.hidden)');
      if (hud) { const r = hud.getBoundingClientRect(); if (r.height) top = Math.max(top, r.bottom + 6); }
      if (document.body.classList.contains('touch')) {
        let minTop = window.innerHeight;
        document.querySelectorAll('.touchpad .tp-move, .touchpad .tp-act, .touchpad button').forEach((e) => {
          const r = e.getBoundingClientRect();
          if (r.height && e.offsetParent) minTop = Math.min(minTop, r.top);
        });
        bottom = Math.max(bottom, window.innerHeight - minTop + 6);
      }
    }
    safe = { top: Math.round(top * k), bottom: Math.round(bottom * k), side: Math.round(8 * k) };
    return safe;
  }

  // ---- drawing -----------------------------------------------------------------------------------------
  const last = { marks: [], qid: null, at: -1e9 };
  function draw(c, h, t) {
    last.marks = [];
    last.at = typeof performance !== 'undefined' ? performance.now() : 0;
    const W = RB.world.W;
    if (!W.map || !shown()) { last.qid = null; return; }
    const I = info(W);
    last.qid = I.qid;
    if (!I.r || !I.way) return;
    const still = RB.game.reducedMotion();
    const bob = still ? 0 : Math.round(Math.sin(t / 380) * 2);
    const S = insets(h, t);
    const L = S.side, T = S.top, R = h.bw - S.side, B = h.bh - S.bottom;
    const place = (mk) => {
      // mk: {x, y} anchor = the diamond's bottom tip, in buffer px
      const onScreen = mk.x >= L && mk.x <= R && mk.y - 17 >= T && mk.y <= B;
      if (onScreen) {
        c.drawImage(diamond(), mk.x - 7, mk.y - 17 + bob);
        last.marks.push(Object.assign({ edge: false, x: mk.x, y: mk.y }, mk.info));
        return;
      }
      // off-screen: clamp to the safe rectangle and point toward it
      const cx = Math.max(L + 10, Math.min(R - 10, mk.x)), cy = Math.max(T + 19, Math.min(B - 10, mk.y));
      const ox = mk.x < L ? L - mk.x : mk.x > R ? mk.x - R : 0;
      const oy = mk.y - 17 < T ? T - (mk.y - 17) : mk.y > B ? mk.y - B : 0;
      const dir = ox >= oy ? (mk.x < L ? 'left' : 'right') : (mk.y - 17 < T ? 'up' : 'down');
      const nudge = still ? 0 : Math.round((Math.sin(t / 380) + 1));
      let dx = cx - 7, dy = cy - 17;
      if (dir === 'left') dx += 8; else if (dir === 'right') dx -= 8; else if (dir === 'up') dy += 8; else dy -= 4;
      c.drawImage(diamond(), dx, dy);
      const ax = dir === 'left' ? dx - 14 - nudge : dir === 'right' ? dx + 13 + nudge : dx - 1;
      const ay = dir === 'up' ? dy - 14 - nudge : dir === 'down' ? dy + 15 + nudge : dy + 1;
      c.drawImage(arrow(dir), ax, ay);
      last.marks.push(Object.assign({ edge: true, dir, x: cx, y: cy }, mk.info));
    };
    const TS = h.TS, ATS = TS * h.ART;
    // the ▾ chevron shows on the tile you face (when you are not walking): the diamond sits above it there
    const front = !W.player.mv ? RB.world.frontTile() : null;
    if (I.way.here && I.way.here.length) {
      for (const tg of I.way.here) {
        const sp = RB.questGuide.spotOf(tg);
        if (!sp) continue; // arriving on this map is the step: nothing to point at
        const x = h.ax(sp.x * TS) + ATS / 2;
        const faced = front && front[0] === Math.round(sp.x) && front[1] === Math.round(sp.y);
        let y;
        // people and things: just above a standing person's head (the ▾'s height), like the ▾ itself
        if (tg.kind === 'npc' || tg.kind === 'foe' || tg.kind === 'prop') y = h.ay(sp.y * TS) - h.HEAD - (faced ? 17 : 9);
        else y = h.ay(sp.y * TS) + ATS / 2 - 2; // a spot on the ground
        place({ x, y, info: { kind: 'target', target: tg.kind, id: tg.id || tg.p || null, map: tg.map, tx: Math.round(sp.x), ty: Math.round(sp.y) } });
      }
      return;
    }
    const ex = I.way.exit;
    if (!ex) return;
    const x = h.ax(ex.x * TS) + ATS / 2, y = h.ay(ex.y * TS) + ATS / 2;
    const onScreen = x >= L + 8 && x <= R - 8 && y >= T + 8 && y <= B - 8;
    if (onScreen) {
      const slide = still ? 0 : Math.round((Math.sin(t / 300) + 1) * 1.5);
      const d = ex.dir;
      const sx = d === 'left' ? -slide : d === 'right' ? slide : 0, sy = d === 'up' ? -slide : d === 'down' ? slide : 0;
      c.drawImage(arrow(d), x - 8 + sx, y - 8 + sy);
      last.marks.push({ kind: 'exit', edge: false, dir: d, x, y, tx: ex.x, ty: ex.y, to: ex.to, dest: ex.dest });
      return;
    }
    place({ x, y: y + 8, info: { kind: 'exit', tx: ex.x, ty: ex.y, to: ex.to, dest: ex.dest } });
  }
  // CSS-pixel positions of what was drawn in the last frame (for tests); when
  // the world has not been drawn for a moment (a battle, the title), nothing
  function marks() {
    const k = RB.render.viewSize().scale / RB.render.ART;
    const fresh = typeof performance !== 'undefined' && performance.now() - last.at < 250;
    return { qid: fresh ? last.qid : null, fresh, marks: fresh ? last.marks.map((m) => Object.assign({}, m, { cssX: Math.round(m.x * k), cssY: Math.round(m.y * k) })) : [], safe };
  }
  function refresh() { cur = null; safe = null; }
  return { draw, marks, refresh };
})();
