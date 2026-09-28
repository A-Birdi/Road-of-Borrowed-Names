/* Overworld character sprites at the character standard (see docs/ART_DIRECTION.md §10).
 *
 * RB.sprites.getArt(look, dir, frame) returns a 40×56-art-px canvas: one tile and a quarter
 * wide, a tile and three quarters tall, the foot anchor at (20, 53) — the point that stands
 * on the tile, 2 art px above its bottom edge, as before. An adult figure is 50 px tall (the
 * 32×48 sprites it replaces were 45), a child 42; the collision footprint stays one tile.
 *
 * Every look is drawn from one rig: rows for the head, shoulders, belt, hem and boots, and per
 * frame a pose (upper-body bob, each foot's stride and lift, each arm's swing, hair and cloth
 * follow-through). Each of the four directions is drawn, not mirrored: the side views draw the
 * body side that faces the camera in front of the body and the other side behind it, so a
 * side ponytail, a flower, a satchel strap or a braid stays on the side it is worn.
 *
 * Frames: 0 stand, 1 and 2 the two contact steps, 3 blink (as before); 'w0'..'w7' an
 * eight-phase walk (4 per tile step); 'i0'..'i3' idle breathing; any key + 'b' blinks.
 * Results are cached per look and frame. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.pix, SP = RB.sprites;
  const W = 40, H = 56, AX = 20, AY = 53;
  const shade = P.shade, mix = P.mix;

  // ---- palette for one look ---------------------------------------------------------------
  function hairRamp(h) {
    const [h0, h1, h2] = h;
    const l1 = h1 && P.lum(h1) > P.lum(h0) + 0.02 ? mix(h1, shade(h0, 1), 0.3) : shade(h0, 1);
    const l2 = h2 && P.lum(h2) > P.lum(l1) ? h2 : shade(h0, 2);
    return [shade(h0, -2), shade(h0, -1), h0, l1, l2];
  }
  const pcache = new Map();
  function palette(look) {
    const col = SP.colorsOf(look);
    const k = JSON.stringify([col, look.wrapCol, look.hoodCol, look.outlineCol]);
    let p = pcache.get(k);
    if (p) return p;
    const [sk, sd] = col.skin;
    const [cm, cs, ca] = col.cloth;
    const skin = { L: shade(sk, 1), S: sk, s: mix(sd, shade(sk, -1), 0.4), z: shade(sd, -1) };
    const hr = hairRamp(col.hair);
    p = {
      skin, sk: [skin.z, skin.s, skin.S, skin.L],
      hair: hr,
      wrap: P.ramp(look.wrapCol || ca),
      stubble: hr.map((c) => mix(c, sk, 0.4)),
      cl: P.ramp(cm, cs), ac: [shade(ca, -1), ca, shade(ca, 1)],
      pa: [shade(col.pants, -1), col.pants, shade(col.pants, 1)],
      bo: [shade(col.boots, -1), col.boots, shade(col.boots, 1)],
      eye: '#2a1e26', iris: mix(hr[1], '#3a2a3a', 0.55), irisL: mix(hr[2], '#5a4a5a', 0.35), white: '#fff8ee',
      brow: mix(hr[1], '#2a1e26', 0.3),
      mouth: mix(sd, '#8a3a3a', 0.45), blush: P.alpha('#e8807a', 0.42),
      ol: look.outlineCol || '#241c20',
    };
    pcache.set(k, p);
    if (pcache.size > 300) pcache.delete(pcache.keys().next().value);
    return p;
  }

  // ---- masks: hair locks, curls and folds ---------------------------------------------------
  // A mask is a map of pixels; '#' pixels are shaded automatically (locks radiating from a
  // parting point, lit on the side facing the upper-left light), digits 1-5 force a ramp step.
  function newMask() { return { px: new Map() }; }
  function stamp(m, parts, dx, dy) {
    for (const [x, y, rows] of parts) {
      for (let j = 0; j < rows.length; j++) {
        const r = rows[j];
        for (let i = 0; i < r.length; i++) {
          const ch = r[i];
          if (ch === '.' || ch === ' ') continue;
          const key = (x + i + (dx || 0)) + ',' + (y + j + (dy || 0));
          if (ch === 'x') m.px.delete(key); else m.px.set(key, ch);
        }
      }
    }
    return m;
  }
  // span notation: sp(y0, 'a-b,c-d|e-f|...') one row per '|'; 'a-b:4' forces step 4; '*n' repeats.
  function sp(y0, str) {
    const parts = [];
    let y = y0;
    for (let row of str.split('|')) {
      let rep = 1;
      const star = row.indexOf('*');
      if (star >= 0) { rep = +row.slice(star + 1); row = row.slice(0, star); }
      for (let k = 0; k < rep; k++, y++) {
        if (!row) continue;
        for (const seg of row.split(',')) {
          const [rng, force] = seg.split(':');
          const [a, bb] = rng.split('-').map(Number);
          const x1 = bb == null || Number.isNaN(bb) ? a : bb;
          parts.push([a, y, [(force || '#').repeat(x1 - a + 1)]]);
        }
      }
    }
    return parts;
  }
  // mirror a span part list about the figure's centre line (x -> 39 - x)
  function mir(parts) { return parts.map(([x, y, rows]) => [W - 1 - x - rows[0].length + 1, y, rows.map((r) => r.split('').reverse().join(''))]); }
  // Locks: angular sectors round the parting point, each lit on the side facing the upper-left
  // light and shaded on the other, so neighbouring locks meet in a dark seam against a lit edge;
  // a broken highlight band crosses them on the lit side; lower and right edges fall into shadow.
  function shadeMask(b, m, R, o) {
    const has = (x, y) => m.px.has(x + ',' + y);
    const st = o.step || 26, r0 = o.r0 == null ? 5 : o.r0;
    for (const [key, ch] of m.px) {
      const c = key.indexOf(',');
      const x = +key.slice(0, c), y = +key.slice(c + 1);
      let v;
      if (ch >= '1' && ch <= '5') v = +ch;
      else {
        v = 3;
        const dx = x + 0.5 - o.ox, dy = y + 0.5 - o.oy, r = Math.hypot(dx, dy);
        const th = Math.atan2(dy, dx);
        const u = ((th * 180) / Math.PI - (o.phase || 0)) / st, fr = u - Math.floor(u);
        const lit = Math.sin(th) - Math.cos(th) >= 0;
        const q = lit ? fr : 1 - fr;
        const w = st * (Math.PI / 180) * r;
        if (r > r0 && w > 2.5) {
          if (q * w < 0.9) v = 2;
          else if ((1 - q) * w < (w > 5 ? 1.8 : 1.1)) v = 4;
        }
        const hx = o.hx == null ? 2 : o.hx;
        if (o.h0 != null && r >= o.h0 && r < o.h1 && dx < hx) {
          v = q * w < 0.9 && r > r0 ? 3 : r >= o.h0 + 0.7 && r < o.h1 - 0.6 && dx < hx - 2 ? 5 : 4;
        }
        const eB = !has(x, y + 1) && !(o.blend && b.alphaAt(x, y + 1)), eR = !has(x + 1, y), eL = !has(x - 1, y), eT = !has(x, y - 1);
        if (eB) v = Math.min(v, eR || eL ? 1 : 2);
        else if (eR && dx > 1) v = Math.min(v, 2);
        else if ((eT || eL) && dx < -1 && dy < 8 && v === 3) v = 4;
      }
      b.put(x, y, P.rgba(R[v - 1]));
    }
  }
  // Curls: shaded discs on a jittered grid, laid from the bottom up, lit at the top left.
  function curlShade(b, m, R, hiY) {
    let x0 = 99, y0 = 99, x1 = -99, y1 = -99;
    for (const key of m.px.keys()) { const c = key.indexOf(','); const x = +key.slice(0, c), y = +key.slice(c + 1); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const val = new Map(), cells = [];
    for (let gy = y0, row = 0; gy <= y1 + 2; gy += 3, row++) {
      for (let gx = x0 - 1 + (row % 2) * 2; gx <= x1 + 2; gx += 4) cells.push([gx + (RB.tiles.hh(gx, gy, 5) % 2), gy + (RB.tiles.hh(gx, gy, 6) % 2)]);
    }
    cells.sort((a, bb) => bb[1] - a[1]);
    for (const [cx, cy] of cells) {
      for (let y = cy - 3; y <= cy + 3; y++) for (let x = cx - 3; x <= cx + 3; x++) {
        const key = x + ',' + y;
        if (!m.px.has(key)) continue;
        const dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
        if (d2 > 6.3) continue;
        const t = dx + dy;
        let v = t <= -2 ? 4 : t >= 2 ? 2 : 3;
        if (d2 > 4 && t > 0) v = 1;
        if (v === 4 && y < hiY && x < 20) v = 5;
        val.set(key, v);
      }
    }
    for (const [key, ch] of m.px) {
      const c = key.indexOf(',');
      let v = val.get(key) || 2;
      if (ch >= '1' && ch <= '5') v = +ch;
      b.put(+key.slice(0, c), +key.slice(c + 1), P.rgba(R[v - 1]));
    }
  }
  function foldShade(b, m, R, knot) {
    const has = (x, y) => m.px.has(x + ',' + y);
    for (const [key, ch] of m.px) {
      const c = key.indexOf(',');
      const x = +key.slice(0, c), y = +key.slice(c + 1);
      let v = 3;
      if (knot) v = !has(x, y + 1) || !has(x + 1, y) ? 2 : !has(x, y - 1) || !has(x - 1, y) ? 5 : 4;
      else {
        // broad wound bands rising gently to the right, each lit on its upper edge
        const u = (y + x * 0.3 + 40) / 4.4, fr = u - Math.floor(u);
        v = fr < 0.24 ? 2 : fr > 0.7 ? 4 : 3;
        if (!has(x, y + 1) || (!has(x + 1, y) && x > 20)) v = Math.min(v, 2);
        else if ((!has(x, y - 1) || !has(x - 1, y)) && x < 20 && v === 3) v = 4;
      }
      if (ch >= '1' && ch <= '5') v = +ch;
      b.put(x, y, P.rgba(R[v - 1]));
    }
  }

  // ---- poses --------------------------------------------------------------------------------
  // feet: per body side ('R', 'L') a stride (fwd, + = ahead) and a lift; arms: swing (+ = ahead);
  // bob: the upper body settles (+1) onto the legs; lag: hair and hem follow a frame later.
  const WALK_FWD = [2, 1, 0, -1, -2, -1, 1, 2];
  const WALK_LIFT = [0, 0, 0, 0, 1, 2, 2, 1];
  const WALK_BOB = [0, 1, 0, 0, 0, 1, 0, 0];
  const WALK_SWAY = [0, 1, 1, 0, 0, -1, -1, 0];
  const IDLE_BOB = [0, 1, 1, 0];
  const IDLE_LAG = [0, 0, 1, 1];
  const pcacheK = new Map();
  function poseOf(frame) {
    let key = String(frame);
    let hit = pcacheK.get(key);
    if (hit) return hit;
    let blink = false, kind = 'stand', ph = 0;
    if (frame === 3) blink = true;
    else if (frame === 1) { kind = 'walk'; ph = 0; }
    else if (frame === 2) { kind = 'walk'; ph = 4; }
    else if (typeof frame === 'string') {
      if (frame.endsWith('b')) { blink = true; frame = frame.slice(0, -1); }
      if (frame[0] === 'w') { kind = 'walk'; ph = (+frame.slice(1) || 0) & 7; }
      else if (frame[0] === 'i') { kind = 'idle'; ph = (+frame.slice(1) || 0) & 3; }
    }
    const o = { kind, ph, blink, bob: 0, lag: 0, sway: 0, step: kind === 'walk', feet: { R: { fwd: 0, lift: 0 }, L: { fwd: 0, lift: 0 } }, arms: { R: 0, L: 0 } };
    if (kind === 'walk') {
      const pr = ph, pl = (ph + 4) & 7;
      o.feet.R = { fwd: WALK_FWD[pr], lift: WALK_LIFT[pr] };
      o.feet.L = { fwd: WALK_FWD[pl], lift: WALK_LIFT[pl] };
      o.arms.R = Math.sign(-WALK_FWD[pr]) * (Math.abs(WALK_FWD[pr]) > 0 ? 1 : 0);
      o.arms.L = -o.arms.R;
      o.bob = WALK_BOB[ph];
      o.lag = WALK_BOB[(ph + 7) & 7];
      o.sway = WALK_SWAY[ph];
    } else if (kind === 'idle') {
      o.bob = IDLE_BOB[ph];
      o.lag = IDLE_LAG[ph];
    }
    pcacheK.set(key, o);
    return o;
  }

  // ---- geometry -------------------------------------------------------------------------------
  // Adult rows: face 8-24 (hair from 4), neck 25, shoulders 26, belt 34-35, tunic hem 40,
  // boots 48-53. Children keep the head, lower it by 8 and shorten the body; old people stoop.
  const SHAPES = ['tunic', 'apron', 'coat', 'robe', 'dress'];
  function geom(look, pose) {
    const child = look.size === 'child';
    const base = child ? { fy: 16, t: 34, bt: 39, hem: 43, boot: 49 } : { fy: look.age === 'old' ? 9 : 8, t: 26, bt: 34, hem: 40, boot: 48 };
    const bob = pose.bob;
    const g = {
      child, pose, bob, lag: pose.lag,
      fy: base.fy + bob, t: base.t + bob, bt: base.bt + bob, hem: base.hem + bob, boot: base.boot, sole: AY,
      hy: base.fy - 8 + bob,          // head offset from the adult rows (hair masks are authored for fy 8)
      tl: base.fy - 8 + pose.lag,     // offset for things that follow a frame late (tails, long hair tips)
      shape: SHAPES.includes(look.shape) ? look.shape : 'tunic',
    };
    g.low = { tunic: g.hem, apron: g.hem, coat: g.hem + (child ? 3 : 6), robe: child ? 51 : 51, dress: child ? 47 : 46 }[g.shape];
    if (g.shape === 'robe' || g.shape === 'dress') g.low += 0;
    g.apronLow = g.hem + (child ? 3 : 5);
    return g;
  }
  const IVORY = ['#b8ab94', '#d8ccb4', '#ece4d4', '#f8f2e6'];
  // down view: screen column pairs are mirror images about x = 19.5; the body's right side is
  // screen left. up view: the reverse.
  const sideAt = (view, s) => (view === 'down' ? (s ? 'L' : 'R') : (s ? 'R' : 'L'));

  // ---- front and back: legs ---------------------------------------------------------------------
  function legsFB(b, look, p, g, view) {
    const pa = p.pa, bo = p.bo, sh = g.shape;
    const robe = sh === 'robe';
    const lt = sh === 'dress' ? g.low + 1 : g.hem + 1;
    for (let s = 0; s < 2; s++) {
      const foot = g.pose.feet[sideAt(view, s)];
      // the foot further from the camera sits a pixel higher; a lifted foot rises
      const back = view === 'down' ? foot.fwd < 0 : foot.fwd > 0;
      const sole = g.sole - (back ? 1 : 0) - foot.lift;
      const x = s ? 21 : 14; // leg columns (5 wide)
      if (robe) {
        if (foot.lift) continue; // a lifted foot hides under the hem
        const bx = s ? 21 : 13;
        b.rect(bx, sole - 1, 6, 2, bo[1]); b.rect(bx, sole - 1, 6, 1, bo[2]); b.rect(bx, sole, 6, 1, bo[0]);
        b.px(s ? bx + 5 : bx, sole - 1, bo[1]);
        continue;
      }
      const top = sole - 4; // boot cuff row
      if (top > lt) {
        b.rect(x, lt, 5, top - lt, pa[1]);
        b.rect(s ? x + 4 : x, lt, 1, top - lt, s ? pa[0] : pa[2]);   // outer edge: lit on the left, shaded on the right
        b.rect(s ? x : x + 4, lt, 1, top - lt, pa[0]);                // inner edge in shadow
        if (top - lt > 3) b.px(x + (s ? 2 : 1), top - 3, pa[2]);       // knee catches the light
        b.rect(x + 1, top - 1, 3, 1, pa[0]);                          // the trouser leg bunches on the boot
      }
      // boot: cuff, shaft, a rounded toe turned a pixel outward, sole
      const bx = s ? x : x - 1, bw = 6;
      b.rect(x, top, 5, 4, bo[1]);
      b.rect(x, top, 5, 1, bo[2]);
      b.px(s ? x + 4 : x, top, bo[1]);
      b.rect(s ? x + 4 : x, top + 1, 1, 2, s ? bo[0] : bo[1]);
      b.rect(bx, top + 2, bw, 2, bo[1]);
      b.rect(bx + 1, top + 2, 3, 1, bo[2]);
      b.px(s ? bx + 5 : bx, top + 2, bo[0]);
      b.px(s ? bx + 5 : bx, top + 3, shade(bo[0], -1));
      b.rect(bx, top + 4, bw, 1, foot.lift ? bo[0] : shade(bo[0], -1));
    }
    if (!robe && sh !== 'dress') b.rect(19, lt, 2, 2, pa[0]); // crotch shadow
  }

  // ---- front and back: garment -------------------------------------------------------------------
  function garmentFB(b, look, p, g, view) {
    const up = view === 'up';
    const C = p.cl, A = p.ac, sh = g.shape;
    const t = g.t, bt = g.bt, hm = g.hem, low = g.low;
    // chest and back: rounded shoulders, a lit left flank, a shaded right flank
    b.rect(15, t, 10, 1, C[2]);
    b.rect(12, t + 1, 16, bt - t - 1, C[2]);
    b.rect(12, t + 1, 1, bt - t - 1, C[3]);
    b.rect(15, t, 3, 1, C[3]);
    b.rect(13, t + 1, 3, 1, C[4]); b.px(13, t + 2, C[4]);
    b.rect(26, t + 1, 2, bt - t - 1, C[1]);
    b.rect(27, t + 3, 1, bt - t - 3, C[0]);
    b.rect(13, bt - 1, 14, 1, C[1]); // the cloth gathers above the belt
    // below the waist
    const sway = g.pose.step ? g.pose.sway : 0;
    const flare = (y) => {
      const k = y - bt - 2;
      if (sh === 'dress') return Math.floor(k / 3);
      if (sh === 'robe') return y > low - 4 ? 1 : 0;
      if (sh === 'coat') return k > 5 ? 1 : 0;
      return y >= hm ? 1 : 0;
    };
    for (let y = bt + 2; y <= low; y++) {
      const e = flare(y), sw = (sh === 'robe' || sh === 'dress' || sh === 'coat') && y > low - 3 ? sway : 0;
      const x0 = 12 - e + sw, x1 = 27 + e + sw;
      const open = sh === 'coat' && !up && y > bt + 2;
      if (open) { const gw = y > bt + 6 ? 2 : 1; b.rect(x0, y, 19 - gw - x0 + 1, 1, C[2]); b.rect(20 + gw, y, x1 - 20 - gw + 1, 1, C[2]); }
      else b.rect(x0, y, x1 - x0 + 1, 1, C[2]);
      b.px(x0, y, C[3]);
      b.rect(x1 - 1, y, 2, 1, C[1]);
      b.px(x1, y, C[0]);
    }
    b.rect(12, bt + 2, 16, 1, C[1]); // shadow under the belt
    if (sh === 'tunic' || sh === 'apron') {
      b.rect(11, hm, 18, 1, C[1]);
      b.rect(12, hm, 3, 1, C[2]);
      if (!up) { b.rect(19, bt + 3, 1, hm - bt - 3, C[1]); b.rect(20, bt + 3, 1, hm - bt - 4, C[3]); b.line(15, bt + 3, 14, hm - 1, C[1]); b.line(24, bt + 3, 25, hm - 1, C[1]); b.px(15, bt + 4, C[3]); } // front seam and two folds
      else { b.rect(16, bt + 4, 1, hm - bt - 5, C[1]); b.rect(23, bt + 4, 1, hm - bt - 5, C[1]); }  // back folds
      b.px(13, hm - 1, C[3]); b.px(26, hm - 1, C[0]);
    }
    if (sh === 'coat') {
      if (!up) {
        b.rect(17, bt + 3, 1, low - bt - 2, C[3]); b.rect(22, bt + 3, 1, low - bt - 2, C[1]);  // lit and shaded edges of the opening
        b.rect(13, bt + 4, 4, 1, C[1]); b.rect(23, bt + 4, 4, 1, C[0]);                      // pocket flaps
        b.px(13, bt + 5, C[3]);
      } else {
        for (let y = bt + 3; y <= low; y++) { b.px(19, y, C[0]); b.px(20, y, C[1]); }        // back vent
        b.rect(15, bt + 3, 1, low - bt - 5, C[1]); b.rect(24, bt + 3, 1, low - bt - 5, C[1]);
      }
      const e = flare(low);
      if (up) b.rect(12 - e + sway, low, 16 + 2 * e, 1, C[1]);
      else { b.rect(12 - e + sway, low, 6, 1, C[1]); b.rect(22 + sway, low, 6 + e, 1, C[0]); }
    }
    if (sh === 'robe') {
      // long straight folds and a hem band; the hem lifts over a stepping foot
      b.rect(15, bt + 3, 1, low - bt - 5, C[1]);
      b.rect(16, bt + 3, 1, low - bt - 5, C[3]);
      b.rect(24, bt + 3, 1, low - bt - 5, C[1]);
      if (!up) b.line(22, bt + 2, 23, low - 2, C[1]); // overlap of the front panels
      else b.rect(19, bt + 3, 1, low - bt - 5, C[1]);
      b.rect(11 + sway, low - 1, 18, 1, C[1]);
      b.rect(11 + sway, low, 18, 1, C[0]);
      const fR = g.pose.feet[sideAt(view, 0)], fL = g.pose.feet[sideAt(view, 1)];
      if (fR.lift) for (let x = 10; x <= 19; x++) b.clear(x + sway, low);
      if (fL.lift) for (let x = 20; x <= 29; x++) b.clear(x + sway, low);
    }
    if (sh === 'dress') {
      for (const px of [15, 19, 24]) {
        for (let y = bt + 4; y < low; y++) { const e = Math.floor((y - bt - 2) / 3); const xx = px + Math.round(((px - 19.5) * e) / 7); b.px(xx + (y > low - 3 ? sway : 0), y, C[1]); b.px(xx - 1 + (y > low - 3 ? sway : 0), y, C[3]); }
      }
      const e = flare(low);
      b.rect(12 - e + sway, low, 16 + 2 * e, 1, A[1]);
      b.rect(12 - e + sway, low - 1, 16 + 2 * e, 1, C[1]);
      b.px(12 - e + sway, low, A[2]);
    }
    // belt, sash or obi
    const obi = sh === 'robe';
    const by = bt - (obi ? 1 : 0), bh = obi ? 3 : 2;
    b.rect(12, by, 16, bh, A[1]);
    b.rect(12, by, 16, 1, A[2]);
    b.rect(26, by, 2, bh, A[0]);
    b.px(12, by + bh - 1, A[1]);
    if (!up && !obi && sh !== 'dress') { b.rect(18, bt, 3, 2, A[0]); b.px(19, bt, A[2]); b.px(18, bt + 1, A[1]); } // knot or buckle
    if (obi && up) { b.rect(16, bt - 2, 8, 5, A[1]); b.rect(16, bt - 2, 8, 1, A[2]); b.rect(21, bt - 1, 3, 4, A[0]); b.rect(19, bt - 2, 2, 5, A[0]); b.px(17, bt - 1, A[2]); }
    if (obi && !up) { b.line(16, bt - 1, 23, bt + 1, A[0]); }
    if (sh === 'dress') { const bx = up ? 17 : 22; b.rect(bx, bt - 1, 5, 3, A[1]); b.px(bx + 2, bt, A[0]); b.px(bx, bt - 1, A[2]); b.rect(bx + 1, bt + 2, 1, 4, A[1]); b.rect(bx + 3, bt + 2, 1, 3, A[0]); }
    // collars (front) and the back seam
    if (!up) {
      if (sh === 'coat') {
        b.rect(16, t - 1, 8, 1, C[3]); // standing collar
        b.line(15, t, 18, t + 5, C[3]); b.line(24, t, 21, t + 5, C[1]);
        b.rect(18, t, 4, 2, p.skin.s); b.rect(19, t + 2, 2, 2, A[1]); b.px(19, t + 2, A[2]);
        b.px(22, t + 6, A[2]); b.px(22, t + 9 > bt - 1 ? bt - 2 : t + 9, A[2]); // buttons
      } else if (sh === 'robe') {
        b.line(23, t, 17, bt - 2, A[2]); b.line(24, t, 18, bt - 2, A[1]);
        b.line(16, t, 19, t + 3, IVORY[2]); b.px(16, t + 1, IVORY[1]);
        b.rect(17, t, 6, 1, p.skin.s); b.rect(18, t + 1, 3, 1, p.skin.s);
      } else if (sh === 'dress') {
        b.rect(16, t, 8, 1, p.skin.s); b.rect(17, t + 1, 6, 1, p.skin.s);
        b.px(16, t + 1, A[1]); b.px(23, t + 1, A[0]); b.rect(17, t + 2, 6, 1, A[1]); b.px(17, t + 2, A[2]);
      } else {
        // crossed collar: the left panel over the right
        b.rect(17, t, 6, 1, p.skin.s); b.rect(18, t + 1, 4, 1, p.skin.s); b.rect(19, t + 2, 2, 1, p.skin.z);
        b.line(16, t, 19, t + 3, A[2]); b.line(15, t, 18, t + 3, A[1]);
        b.line(23, t, 21, t + 2, A[0]); b.line(24, t, 22, t + 2, A[1]);
        b.px(20, t + 3, A[1]); b.px(20, t + 4, A[0]);
      }
      if (sh === 'tunic' || sh === 'apron') { b.line(14, t + 4, 15, bt - 2, C[1]); b.line(25, t + 4, 24, bt - 2, C[1]); }
    } else {
      b.rect(15, t, 10, 1, C[3]);
      b.rect(16, t - 1, 8, 1, sh === 'coat' ? C[3] : p.skin.s);
      if (sh === 'coat') b.rect(16, t - 1, 8, 1, C[2]);
      if (sh !== 'robe') { b.rect(19, t + 2, 2, bt - t - 3, C[1]); b.rect(19, t + 2, 1, bt - t - 3, C[0]); }
      b.line(14, t + 2, 15, bt - 2, C[1]); b.line(25, t + 2, 24, bt - 2, C[0]);
      b.rect(13, t + 1, 3, 1, C[4]);
    }
    if (sh === 'apron') apronFB(b, p, g, up);
  }
  function apronFB(b, p, g, up) {
    const t = g.t, bt = g.bt, lo = g.apronLow, I = IVORY;
    if (!up) {
      b.rect(15, t + 3, 10, bt - t - 3, I[2]);   // bib
      b.rect(15, t + 3, 10, 1, I[3]);
      b.rect(24, t + 3, 1, bt - t - 3, I[1]);
      b.px(15, t + 2, I[1]); b.px(24, t + 2, I[1]); b.px(15, t + 1, I[1]); b.px(24, t + 1, I[0]); // neck strap
      b.rect(13, bt, 14, 2, I[1]); b.rect(13, bt, 14, 1, I[2]);                                    // waistband
      for (let y = bt + 2; y <= lo; y++) { const e = y > lo - 2 ? 1 : 0; b.rect(13 - e, y, 14 + 2 * e, 1, I[2]); b.px(13 - e, y, I[3]); b.px(26 + e, y, I[1]); }
      b.rect(12, lo, 16, 1, I[1]);
      b.rect(16, bt + 3, 8, 3, I[1]); b.rect(16, bt + 3, 8, 1, I[0]); b.rect(17, bt + 4, 6, 1, I[2]); // pocket
      b.px(20, bt + 4, I[1]);
      b.px(15, lo - 2, I[1]); b.px(24, lo - 3, I[1]);
    } else {
      b.line(13, t + 1, 25, bt - 1, I[1]); b.line(26, t + 1, 14, bt - 1, I[2]); // crossed straps
      b.rect(12, bt, 16, 1, I[2]);
      b.rect(18, bt - 1, 4, 3, I[2]); b.rect(17, bt, 1, 2, I[1]); b.rect(22, bt, 1, 2, I[1]); b.px(18, bt - 1, I[3]); // bow
      b.rect(18, bt + 2, 1, 4, I[1]); b.rect(21, bt + 2, 1, 3, I[1]);
    }
  }

  // ---- front and back: arms --------------------------------------------------------------------
  // Both arms are drawn as the screen-left one and mirrored about the centre line for the other.
  const mxr = (s, x, w) => (s ? W - x - (w || 1) : x);
  function handsFB(g, view) {
    const out = [];
    for (let s = 0; s < 2; s++) {
      const sw = g.pose.arms[sideAt(view, s)];
      // an arm swinging towards the camera shows its hand a pixel lower
      const toward = view === 'down' ? sw > 0 : sw < 0;
      out.push({ x: mxr(s, 9, 3), y: g.bt + 2 + (sw ? (toward ? 1 : -1) : 0), sw });
    }
    return out;
  }
  function armsFB(b, look, p, g, view) {
    const C = p.cl, sk = p.sk, t = g.t;
    const robe = g.shape === 'robe', puff = g.shape === 'dress';
    const hs = handsFB(g, view);
    for (let s = 0; s < 2; s++) {
      const hy = hs[s].y, e = Math.min(t + 6, hy - 2); // elbow row
      const R = (x, y, w, h, c) => b.rect(mxr(s, x, w), y, w, h, c);
      const lit = s ? C[1] : C[3], far = s ? C[0] : C[2];
      // shoulder cap, upper arm hanging by the body, forearm angled a pixel away from it
      R(10, t + 1, 2, 1, s ? C[2] : C[3]);
      R(9, t + 2, 3, e - t - 1, C[2]);
      R(9, t + 2, 1, e - t - 1, lit);
      R(11, t + 3, 1, e - t - 2, s ? C[0] : C[1]);
      b.px(mxr(s, 12, 1), t + 2, C[0]); // armpit
      R(9, e + 1, 3, hy - e - 1, C[2]);
      R(9, e + 1, 1, hy - e - 1, lit);
      R(11, e + 1, 1, hy - e - 1, s ? C[0] : C[1]);
      R(10, e, 1, 1, far); // elbow crease
      if (puff) { R(8, t + 1, 4, 3, C[2]); R(8, t + 1, 2, 1, C[4]); R(8, t + 3, 4, 1, C[1]); R(12, t + 2, 1, 2, C[1]); }
      if (robe) {
        // wide sleeve: from the elbow the mouth flares outward and hangs past the wrist
        R(8, e + 1, 5, hy - e + 1, C[2]);
        R(8, e + 1, 1, hy - e + 1, lit);
        R(12, e + 2, 1, hy - e, C[1]);
        R(8, hy + 1, 5, 1, C[0]);
        R(9, hy, 3, 1, C[1]);
      } else R(9, hy - 1, 3, 1, C[1]); // cuff
      // hand: a round fist, lit at the top left, the thumb towards the body
      const hx = 9, y = robe ? hy + 1 : hy;
      R(hx, y, 3, 2, sk[2]);
      R(hx + 1, y + 2, 2, 1, sk[1]);
      R(hx, y + 1, 1, 1, sk[1]);
      if (!s) b.px(hx, y, sk[3]);
      R(hx + 2, y, 1, 1, sk[1]);
      if (robe) R(hx, y, 3, 1, sk[1]);
    }
  }

  // ---- heads ---------------------------------------------------------------------------------------
  const FACE_D = [
    '.....SSSSSSSS.....',
    '...SSSSSSSSSSSS...',
    '..SSSSSSSSSSSSSS..',
    '.SSSSSSSSSSSSSSSS.',
    '.SSSSSSSSSSSSSSSS.',
    'SSSSSSSSSSSSSSSSSs',
    'SSSSSSSSSSSSSSSSSs',
    'LSSSSSSSSSSSSSSSSs',
    'LSSSSSSSSSSSSSSSss',
    'LSSSSSSSSSSSSSSSss',
    'SSSSSSSSSSSSSSSSss',
    'SSSSSSSSSSSSSSSSss',
    '.SSSSSSSSSSSSSSSs.',
    '.SSSSSSSSSSSSSSss.',
    '..SSSSSSSSSSSSss..',
    '...sSSSSSSSSSss...',
    '.....ssssssss.....',
  ];
  const FACE_S = [
    '.....SSSSSSSS......',
    '...SSSSSSSSSSSS....',
    '..SSSSSSSSSSSSSS...',
    '.SSSSSSSSSSSSSSSS..',
    '.SSSSSSSSSSSSSSSSS.',
    'SSSSSSSSSSSSSSSSSSS',
    'SSSSSSSSSSSSSSSSSSS',
    'sSSSSSSSSSSSSSSSSSS',
    'sSSSSSSSSSSSSSSSSSS',
    'sSSSSSSSSSSSSSSSSSS',
    'sSSSSSSSSSSSSSSSSSs',
    'sSSSSSSSSSSSSSSSSs.',
    '.sSSSSSSSSSSSSSSSs.',
    '.sSSSSSSSSSSSSSSs..',
    '..sSSSSSSSSSSSSs...',
    '...zsSSSSSSSSss....',
    '.....zssssssss.....',
  ];
  // A front-view eye, 3 wide: a dark lid with a lash tick at the outer corner, the iris with a
  // glint towards the light and a lighter lower rim.
  function eyeD(b, p, x, y, blink, left) {
    const o = left ? x - 1 : x + 3;
    if (blink) { b.rect(x, y + 2, 3, 1, p.eye); b.px(o, y + 1, p.eye); return; }
    b.rect(x, y, 3, 1, p.eye);
    b.px(o, y, p.eye);
    b.rect(x, y + 1, 3, 3, p.iris);
    b.px(left ? x : x + 1, y + 1, p.white);
    b.px(left ? x + 1 : x, y + 1, p.eye);
    b.rect(x, y + 3, 3, 1, p.irisL);
    b.px(left ? x : x + 2, y + 3, p.iris);
  }
  function headDown(b, look, p, g, blink) {
    const y0 = g.fy, sk = p.skin;
    b.rect(18, y0 + 17, 4, 2, sk.s); // neck
    b.rect(18, y0 + 17, 4, 1, sk.z);
    b.tpl(11, y0, FACE_D, sk);
    b.rect(10, y0 + 8, 1, 3, sk.S); b.px(10, y0 + 10, sk.s); // ears
    b.rect(29, y0 + 8, 1, 3, sk.s); b.px(29, y0 + 10, sk.z);
    const ey = y0 + 8;
    b.rect(13, ey - 2, 3, 1, p.brow); b.rect(24, ey - 2, 3, 1, p.brow);
    eyeD(b, p, 13, ey, blink, true);
    eyeD(b, p, 24, ey, blink, false);
    if (look.age === 'old') { b.px(13, ey + 5, sk.s); b.px(26, ey + 5, sk.s); b.px(12, ey + 4, sk.s); b.px(27, ey + 4, sk.s); }
    else { b.rect(12, ey + 5, 2, 1, p.blush); b.rect(26, ey + 5, 2, 1, p.blush); }
    b.px(20, ey + 4, mix(sk.S, sk.s, 0.6)); // nose
    b.rect(19, ey + 6, 2, 1, mix(p.mouth, sk.s, 0.25));
  }
  function headUp(b, look, p, g) {
    const y0 = g.fy, sk = p.skin;
    b.rect(18, y0 + 16, 4, 3, sk.s);
    b.rect(18, y0 + 18, 4, 1, sk.z);
    b.tpl(11, y0, FACE_D, { S: sk.S, s: sk.s, z: sk.z, L: sk.S });
    b.rect(10, y0 + 8, 1, 3, sk.S); b.rect(29, y0 + 8, 1, 3, sk.s);
  }
  function headSide(b, look, p, g, blink) {
    const y0 = g.fy, sk = p.skin;
    b.rect(18, y0 + 17, 4, 2, sk.s);
    b.rect(18, y0 + 17, 4, 1, sk.z);
    b.tpl(11, y0, FACE_S, sk);
    b.rect(18, y0 + 8, 2, 3, sk.s); b.px(18, y0 + 9, sk.z); b.px(19, y0 + 8, sk.S); // ear
    const ey = y0 + 8;
    b.rect(25, ey - 2, 3, 1, p.brow);
    if (blink) { b.rect(25, ey + 2, 2, 1, p.eye); }
    else { b.rect(25, ey, 2, 1, p.eye); b.rect(25, ey + 1, 2, 3, p.iris); b.px(26, ey + 1, p.white); b.px(25, ey + 3, p.irisL); b.px(24, ey, p.eye); }
    if (look.age !== 'old') b.rect(25, ey + 4, 2, 1, p.blush);
    else { b.px(24, ey + 4, sk.s); }
    b.px(29, ey + 6, p.mouth); b.px(28, ey + 6, mix(p.mouth, sk.S, 0.5));
    b.px(30, ey + 2, sk.S); b.px(30, ey + 3, sk.s); // nose tip
  }

  // ---- side view (facing right; the near side is the one facing the camera) ------------------
  // stride in px per unit of fwd, and the arm's reach
  function sideFoot(g, side) { const f = g.pose.feet[side]; return { x: 18 + Math.round(f.fwd * 2.5), lift: f.lift }; }
  function legsSide(b, look, p, g, near) {
    const pa = p.pa, bo = p.bo, ft = g.sole;
    const robe = g.shape === 'robe';
    const lt = g.shape === 'dress' ? g.low + 1 : g.hem + 1;
    const leg = (side, isNear) => {
      const { x: fx, lift } = sideFoot(g, side);
      const c = isNear ? pa : [shade(pa[0], -1), pa[0], pa[1]];
      const cb = isNear ? bo : [shade(bo[0], -1), bo[0], bo[1]];
      const hip = 17;
      const sole = ft - lift;
      const top = sole - 5;
      if (robe && lift) return;
      if (!robe) {
        for (let y = lt; y < top; y++) {
          const k = (y - lt) / Math.max(1, top - lt);
          // the knee bends forward on a lifted leg
          const bend = lift ? Math.round(Math.sin(k * Math.PI) * 2) : 0;
          const x = Math.round(hip + (fx - hip) * k) + bend;
          b.rect(x, y, 5, 1, c[1]);
          b.px(x, y, isNear ? c[2] : c[1]);
          b.px(x + 4, y, c[0]);
        }
      }
      // boot: shaft, heel, toe pointing ahead
      const by = robe ? sole - 1 : top;
      b.rect(fx, by, 5, sole - by + 1, cb[1]);
      b.rect(fx, by, 5, 1, cb[2]);
      b.px(fx, by + 1, cb[0]);
      if (!lift) { b.rect(fx + 5, sole - 2, 2, 3, cb[1]); b.px(fx + 5, sole - 2, cb[2]); b.px(fx + 6, sole - 2, cb[2]); b.rect(fx, sole, 7, 1, cb[0]); }
      else { b.rect(fx + 4, sole - 1, 2, 1, cb[1]); b.rect(fx, sole, 5, 1, cb[0]); b.px(fx - 1, sole - 1, cb[0]); }
    };
    const far = near === 'R' ? 'L' : 'R';
    leg(far, false);
    leg(near, true);
  }
  function garmentSide(b, look, p, g) {
    const C = p.cl, A = p.ac, sh = g.shape;
    const t = g.t, bt = g.bt, hm = g.hem, low = g.low, step = g.pose.step;
    // torso in profile: the back (left) catches the light, the chest front falls into shade
    b.rect(16, t, 8, 1, C[2]);
    b.rect(14, t + 1, 12, bt - t, C[2]);
    b.rect(14, t + 1, 1, bt - t, C[3]);
    b.rect(15, t + 1, 3, 2, C[3]); b.px(15, t + 1, C[4]); b.px(16, t, C[3]);
    b.rect(24, t + 2, 1, bt - t - 2, C[1]);
    b.rect(25, t + 2, 1, bt - t - 1, C[0]);
    b.px(25, t + 1, C[1]);
    b.rect(15, bt - 1, 10, 1, C[1]);
    // below the waist; long garments swing with the stride
    const sway = step ? (g.pose.ph < 4 ? 1 : -1) * (g.pose.ph % 4 === 1 || g.pose.ph % 4 === 2 ? 1 : 0) : 0;
    for (let y = bt + 2; y <= low; y++) {
      let x0 = 14, x1 = 25;
      const k = y - bt - 2;
      if (sh === 'dress') { const e = Math.floor(k / 3); x0 -= e; x1 += e; }
      if (sh === 'robe' && y > low - 4) { x0 -= 1; x1 += 1; }
      if (sh === 'coat' && k > 3) { x0 -= 1 + (k > 6 ? 1 : 0); }
      if ((sh === 'robe' || sh === 'dress' || sh === 'coat') && k > 4) { x0 += sway * (k > 8 ? 1 : 0) - (sh === 'coat' && step ? 1 : 0); x1 += sway * (k > 6 ? 1 : 0); }
      if ((sh === 'tunic' || sh === 'apron') && y >= hm) { x0 -= 1; x1 += 1; }
      b.rect(x0, y, x1 - x0 + 1, 1, C[2]);
      b.px(x0, y, C[3]);
      b.rect(x1 - 1, y, 2, 1, C[1]);
      b.px(x1, y, C[0]);
    }
    b.rect(14, bt + 2, 12, 1, C[1]);
    if (sh === 'tunic' || sh === 'apron') { b.rect(13, hm, 14, 1, C[1]); b.rect(20, bt + 3, 1, hm - bt - 4, C[1]); b.px(17, bt + 4, C[1]); b.px(16, bt + 5, C[1]); }
    if (sh === 'coat') { for (let y = bt + 2; y <= low; y++) b.px(24, y, C[1]); b.rect(12 - (step ? 1 : 0), low, 14, 1, C[1]); b.px(24, t + 5, A[2]); b.px(24, t + 8, A[2]); b.rect(18, bt + 4, 4, 1, C[1]); b.rect(18, bt + 5, 1, 1, C[3]); }
    if (sh === 'robe') { b.rect(13, low, 14, 1, C[0]); b.line(24, t + 1, 21, bt - 2, A[2]); b.rect(20, bt + 3, 1, low - bt - 4, C[1]); b.rect(16, bt + 3, 1, low - bt - 5, C[3]); }
    if (sh === 'dress') { const e = Math.floor((low - bt - 2) / 3); b.rect(14 - e, low, 12 + 2 * e, 1, A[1]); for (let y = bt + 4; y < low; y++) { b.px(20 + Math.floor((y - bt - 2) / 6), y, C[1]); b.px(16 - Math.floor((y - bt - 2) / 5), y, C[3]); } }
    const obi = sh === 'robe';
    b.rect(14, bt - (obi ? 1 : 0), 12, obi ? 3 : 2, A[1]);
    b.rect(14, bt - (obi ? 1 : 0), 12, 1, A[2]);
    b.px(25, bt, A[0]);
    if (obi) { b.rect(11, bt - 2, 4, 5, A[1]); b.rect(11, bt - 2, 4, 1, A[2]); b.rect(11, bt + 1, 2, 2, A[0]); }
    if (sh === 'dress') { b.rect(11, bt - 1, 4, 3, A[1]); b.px(11, bt - 1, A[2]); b.rect(11, bt + 2, 1, 3, A[1]); b.rect(13, bt + 2, 1, 2, A[0]); }
    if (sh === 'coat') { b.rect(22, t - 1, 3, 2, C[3]); b.px(24, t - 1, C[2]); } else { b.rect(21, t, 3, 1, p.skin.s); b.px(24, t + 1, A[1]); b.px(21, t + 1, A[1]); b.px(22, t + 2, A[0]); b.px(23, t + 2, A[1]); }
    if (sh === 'apron') {
      const I = IVORY, lo = g.apronLow;
      b.rect(23, t + 3, 3, bt - t - 3, I[2]); b.px(25, t + 3, I[1]); b.px(24, t + 2, I[1]); b.px(23, t + 1, I[1]);
      for (let y = bt; y <= lo; y++) { const e = y > bt + 3 ? 1 : 0; b.rect(23, y, 3 + e, 1, I[2]); b.px(23, y, I[3]); b.px(25 + e, y, I[1]); }
      b.rect(23, lo, 4, 1, I[1]);
      b.rect(14, bt, 9, 1, I[1]); b.rect(11, bt - 1, 3, 3, I[2]); b.px(11, bt + 2, I[1]); b.px(13, bt + 3, I[1]);
    }
  }
  // the hand of one arm in the side view: swings ahead (+x) or behind with the opposite foot
  function sideHand(g, side) {
    const sw = g.pose.arms[side];
    const t = g.t + 1, len = g.bt - g.t + 1;
    return { x: 19 + sw * 4, y: t + len - Math.abs(sw), sw, t };
  }
  function armSide(b, look, p, g, side, isNear) {
    const C = isNear ? p.cl : p.cl.map((c) => shade(c, -1));
    const sk = isNear ? p.sk : p.sk.map((c) => shade(c, -1));
    const { x: hx, y: hy, sw, t } = sideHand(g, side);
    const robe = g.shape === 'robe';
    for (let y = t; y < hy; y++) {
      const k = (y - t) / Math.max(1, hy - t);
      // a slight bend at the elbow: the forearm leads when the arm swings ahead
      const x = Math.round(18 + (hx - 19) * k + (sw > 0 && k > 0.5 ? 1 : 0));
      b.rect(x, y, 4, 1, C[2]);
      b.px(x, y, C[1]);
      b.px(x + 3, y, isNear ? C[3] : C[2]);
      if (robe && y > t + 4) b.px(x - 1, y, C[1]);
    }
    if (g.shape === 'dress') { b.rect(17, t, 5, 2, C[2]); b.rect(18, t, 3, 1, C[3]); }
    const cx = hx - 1 + (sw > 0 ? 1 : 0);
    b.rect(cx - (robe ? 1 : 0), hy - 1, robe ? 5 : 4, robe ? 2 : 1, C[1]);
    b.rect(cx, hy + (robe ? 1 : 0), 3, 3, sk[2]);
    b.rect(cx, hy + 2 + (robe ? 1 : 0), 3, 1, sk[1]);
    b.px(cx + 2, hy + (robe ? 1 : 0), sk[3]);
  }

  // placeholder until the full hair set is authored below
  let HAIR = {};
  let drawHair = () => {};
  let ACC = {};

  // ---- composition -------------------------------------------------------------------------------
  // Accessory layers: 'back' behind the body, 'body' over the clothes, 'face' over the face,
  // 'head' over the hair, 'hand' over the near arm (side views). In a side view accessories worn on
  // the far side draw in 'far' (behind the body) instead.
  function accs(b, look, p, g, d, L, near) {
    for (const a of look.acc || []) {
      const fn = ACC[a];
      if (fn) fn(b, look, p, g, d, L, near);
      else if (L === 'head' && RB.atlasArt && RB.atlasArt.ACC && RB.atlasArt.ACC[a]) legacyAcc(b, RB.atlasArt.ACC[a], look, d, g);
    }
  }
  // Accessories without drawing at this resolution (added by later content) fall back to their
  // 16-px drawing, doubled and placed over the finished figure.
  function legacyAcc(b, fn, look, d, g) {
    const cv = SP.makeCanvas(16, 24);
    const c = cv.getContext('2d', { willReadFrequently: true });
    fn(c, look, d === 'left' || d === 'right' ? 'side' : d, 0);
    const img = c.getImageData(0, 0, 16, 24).data;
    for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) {
      const o = (y * 16 + x) * 4;
      if (img[o + 3] > 100) b.rect(4 + x * 2, 6 + y * 2 + g.hy, 2, 2, [img[o], img[o + 1], img[o + 2], 255]);
    }
  }
  function humanoid(b, look, dir, pose) {
    const p = palette(look);
    const g = geom(look, pose);
    const blink = pose.blink;
    if (dir === 'down') {
      accs(b, look, p, g, 'down', 'back');
      drawHair(b, look, p, g, 'down', 'back');
      legsFB(b, look, p, g, 'down');
      garmentFB(b, look, p, g, 'down');
      armsFB(b, look, p, g, 'down');
      accs(b, look, p, g, 'down', 'body');
      headDown(b, look, p, g, blink);
      accs(b, look, p, g, 'down', 'face');
      drawHair(b, look, p, g, 'down', 'front');
      accs(b, look, p, g, 'down', 'head');
    } else if (dir === 'up') {
      accs(b, look, p, g, 'up', 'back');
      legsFB(b, look, p, g, 'up');
      garmentFB(b, look, p, g, 'up');
      armsFB(b, look, p, g, 'up');
      headUp(b, look, p, g);
      accs(b, look, p, g, 'up', 'body');
      drawHair(b, look, p, g, 'up', 'back');
      drawHair(b, look, p, g, 'up', 'front');
      accs(b, look, p, g, 'up', 'head');
    } else {
      const near = dir === 'right' ? 'R' : 'L', far = near === 'R' ? 'L' : 'R';
      accs(b, look, p, g, 'side', 'far', near);
      armSide(b, look, p, g, far, false);
      accs(b, look, p, g, 'side', 'back', near);
      drawHair(b, look, p, g, 'side', 'back', near);
      legsSide(b, look, p, g, near);
      garmentSide(b, look, p, g);
      accs(b, look, p, g, 'side', 'body', near);
      armSide(b, look, p, g, near, true);
      accs(b, look, p, g, 'side', 'hand', near);
      headSide(b, look, p, g, blink);
      accs(b, look, p, g, 'side', 'face', near);
      drawHair(b, look, p, g, 'side', 'front', near);
      accs(b, look, p, g, 'side', 'head', near);
    }
    return p;
  }

  // ---- entry point --------------------------------------------------------------------------------
  // Variants are keyed through RB.sprites.get (its cache already maps a look, direction and legacy
  // frame to one small canvas, including the Atlas accessory patch): each small canvas owns a map
  // from frame key to the art canvas, so a lookup per draw serves every frame of that look.
  const art = new WeakMap();
  SP.customArt = SP.customArt || {};
  function build(look, dir, frame) {
    const pose = poseOf(frame);
    let b = new P.Buf(W, H);
    let ol = look.outlineCol || '#241c20';
    if (look.custom) {
      // creatures are drawn at 32×48 and stand in the middle of the frame, feet on the anchor
      const cb = new P.Buf(32, 48);
      const d = dir === 'left' || dir === 'right' ? 'side' : dir === 'up' ? 'up' : 'down';
      const f = pose.kind === 'walk' ? (pose.ph < 4 ? 1 : 2) : 0;
      const fn = SP.customArt[look.custom];
      let cl = ol;
      if (fn) {
        const r = fn(cb, look, d, f, pose.blink);
        if (r && r.outline === false) cl = null;
        else if (r && r.outline) cl = r.outline;
      } else if (SP.custom[look.custom]) {
        const cv = SP.makeCanvas(16, 24);
        const c = cv.getContext('2d', { willReadFrequently: true });
        SP.custom[look.custom](c, look, d, f, pose.blink);
        const img = c.getImageData(0, 0, 16, 24).data;
        for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) {
          const o = (y * 16 + x) * 4;
          if (img[o + 3] > 40) cb.rect(x * 2, y * 2, 2, 2, [img[o], img[o + 1], img[o + 2], img[o + 3]]);
        }
      } else return null;
      if (cl) cb.outline(cl);
      let src = cb;
      if (dir === 'left') src = cb.mirror();
      b.draw(src, AX - 16, AY - 46);
      return b.toCanvas();
    }
    humanoid(b, look, dir, pose);
    b.outline(ol);
    if (dir === 'left') b = b.mirror();
    return b.toCanvas();
  }
  SP.getArt = function (look, dir, frame) {
    if (!look) return null;
    frame = frame == null ? 0 : frame;
    const small = SP.get(look, dir, frame === 3 ? 3 : typeof frame === 'number' ? frame : 0);
    let m = art.get(small);
    if (!m) { m = new Map(); art.set(small, m); }
    let cv = m.get(frame);
    if (cv === undefined) {
      cv = build(look, dir, frame);
      m.set(frame, cv);
    }
    return cv;
  };
  // The frame standard (art px): size, and the foot anchor that stands on the tile.
  SP.FRAME = { w: W, h: H };
  SP.ANCHOR = { x: AX, y: AY };
  SP.artW = W; SP.artH = H;
  SP._art = { W, H, AX, AY, palette, geom, hairRamp, poseOf, handsFB, sideHand, sideAt, sp, mir, stamp, newMask, shadeMask, curlShade, foldShade, IVORY, set HAIR(v) { HAIR = v; }, get HAIR() { return HAIR; }, set drawHair(f) { drawHair = f; }, set ACC(v) { ACC = v; }, get ACC() { return ACC; } };
})();
