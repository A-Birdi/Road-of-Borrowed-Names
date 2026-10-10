/* The fidelity study's mill and wheel (docs/future/work/P01_STUDY.md; development only).
 *
 * The mill stands on the map's own footprint (rw.millroad, the house at tiles 6–12 × 1–4, its door at tile 9), the
 * wheel on its own (tiles 14–15 × 2–3) in the race. Drawn pixel by pixel in world art px:
 *  - a stone footing of fitted blocks, lit on their upper left edges, mossy at the foot;
 *  - a timber frame (posts, sill, top plate, braces) with lime plaster between, weathered, cracked, patched;
 *  - two windows lit warm from inside, open shutters, flower boxes; an arched door in a stone surround, a lantern;
 *  - a deep thatch roof in courses of straw, the cut eave catching the light, the left hip lit and the right in
 *    shade, a bound ridge with grass growing on it, moss in the shade;
 *  - by the wall: flour sacks, a spare millstone, a barrel;
 *  - the lean-to that carries the axle out to the wheel, and the wheel itself turning in a loop of frames, wet at
 *    the bottom, with foam and drips where it meets the race. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.studyHouse = (function () {
  'use strict';
  const K = RB.studyKit;
  const { RAMP, hash, vnoise, fbm, Buf, clamp, covered, inPoly } = K;
  const OX = 172, OY = -24, BW = 264, BH = 192; // the mill's buffer, world art px
  // the facade: the top plate at 82, the sill at 141, the footing to the ground at 160; a door as tall as a person
  const WT = 82, SILL = 141, FOOT = 147, GROUND = 160;

  function buildMill() {
    const b = new Buf(BW, BH);
    const P = (x, y, c, a) => b.set(x - OX, y - OY, c, a);
    const G = (x, y) => b.get(x - OX, y - OY);
    const Pl = RAMP.plaster, Wd = RAMP.wood, St = RAMP.stone, Th = RAMP.thatch, Gr = RAMP.grass, Au = RAMP.gold;
    const darken = (x, y, k) => { const c = G(x, y); if (c) P(x, y, [c[0] * k, c[1] * k, c[2] * (k + (1 - k) * 0.25)]); };

    // ---- the wall's infill: lime plaster, warm, weathered toward the foot ----------------------------------------
    for (let y = WT; y < FOOT; y++) for (let x = 196; x < 413; x++) {
      let v = 5 + (vnoise(x, y, 3, 501) - 0.5) * 1.3 + (fbm(x, y, 18, 502, 2) - 0.5) * 1.2;
      if (y > SILL - 8) v -= (y - (SILL - 8)) * 0.16;
      P(x, y, Pl[clamp(Math.round(v), 1, 7)]);
    }
    for (let k = 0; k < 11; k++) {
      let x = 200 + Math.floor(hash(k, 1, 503) * 206), y = WT + 12 + Math.floor(hash(k, 2, 503) * 40);
      for (let s2 = 0; s2 < 4 + Math.floor(hash(k, 3, 503) * 6); s2++) { P(x, y, Pl[2]); x += hash(k, s2, 504) > 0.5 ? 1 : 0; y += 1; }
    }
    for (const [px, py] of [[206, 116], [393, 96], [292 - 60, 132]]) {
      for (let y = py; y < py + 8; y++) for (let x = px; x < px + 11; x++) {
        if (((x - px - 5.5) / 6) ** 2 + ((y - py - 4) / 4.2) ** 2 > 1) continue;
        const row = Math.floor((y - py) / 3), col = Math.floor((x - px + row * 2) / 4);
        const edge = (y - py) % 3 === 0 || (x - px + row * 2) % 4 === 0;
        P(x, y, edge ? St[2] : St[3 + Math.floor(hash(col, row, 505) * 2)]);
      }
    }
    // ---- the timber frame ----------------------------------------------------------------------------------------
    const post = (x0, x1, y0, y1) => {
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        let v = 3.4 + (hash(x, y >> 2, 506) - 0.5) * 0.9;
        if (x === x0) v += 1.6;
        if (x === x1 - 1) v -= 1.6;
        if (hash(x, y >> 3, 507) > 0.9) v -= 1;
        P(x, y, Wd[clamp(Math.round(v), 0, 7)]);
      }
    };
    const beam = (x0, x1, y0, y1) => {
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        let v = 3.4 + (hash(x >> 2, y, 508) - 0.5) * 0.9;
        if (y === y0) v += 1.5;
        if (y === y1 - 1) v -= 1.7;
        P(x, y, Wd[clamp(Math.round(v), 0, 7)]);
      }
    };
    const brace = (xa, ya, xb, yb) => {
      const n = Math.max(Math.abs(xb - xa), Math.abs(yb - ya));
      for (let i = 0; i <= n; i++) {
        const x = Math.round(xa + ((xb - xa) * i) / n), y = Math.round(ya + ((yb - ya) * i) / n);
        P(x, y, Wd[4]); P(x + 1, y, Wd[3]); P(x + 2, y, Wd[3]); P(x + 3, y, Wd[1]);
      }
    };
    brace(267, SILL, 277, WT + 6);
    brace(329, WT + 6, 337, SILL);
    beam(196, 413, WT, WT + 6);
    beam(196, 413, SILL, FOOT);
    for (const [x0, x1] of [[196, 202], [262, 267], [280, 285], [323, 328], [341, 346], [407, 413]]) post(x0, x1, WT, FOOT);

    // ---- the footing: fitted stones in two courses, mossy at the foot --------------------------------------------
    for (const [y0, off] of [[FOOT, 0], [FOOT + 7, 6]]) {
      let x = 192 - off, n = 0;
      while (x < 417) {
        const w = 9 + Math.floor(hash(n, y0, 509) * 8), tone = 3.6 + hash(n, y0, 510) * 1.6;
        for (let y = y0; y < Math.min(y0 + 7, GROUND); y++) for (let xx = x; xx < x + w && xx < 417; xx++) {
          if (xx < 192) continue;
          const ex = xx - x, ey = y - y0;
          let v = tone;
          if (ex === 0 || ey === 0) v += 1.6;
          if (ex === w - 1 || ey === 6) v = 1.2;
          v += (vnoise(xx, y, 2, 511) - 0.5) * 0.8;
          P(xx, y, St[clamp(Math.round(v), 0, 8)]);
        }
        x += w; n++;
      }
    }
    for (let x = 192; x < 417; x++) {
      const h = Math.floor(vnoise(x, 0, 5, 512) * 4);
      for (let k = 0; k < h; k++) P(x, GROUND - k, Gr[3 + (k === h - 1 ? 2 : 0) + (hash(x, k, 513) > 0.7 ? 1 : 0)]);
    }

    // ---- windows: warm light inside, a cross of mullions, open shutters, a flower box ----------------------------
    const windowAt = (cx) => {
      const x0 = cx - 12, x1 = cx + 12, y0 = 99, y1 = 124;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const fr = x < x0 + 2 || x >= x1 - 2 || y < y0 + 2 || y >= y1 - 2;
        if (fr) { P(x, y, Wd[x === x0 || y === y0 ? 4 : 2]); continue; }
        if (x === cx || x === cx - 1 || y === y0 + 11) { P(x, y, Wd[3]); continue; }
        let v = 3.2 + ((y - y0) / (y1 - y0)) * 2.8;
        if (y < y0 + 5) v -= 1.6;
        let c = Au[clamp(Math.round(v), 1, 6)];
        if (x < x0 + 6) c = RAMP.dress[clamp(Math.round(v * 0.8), 2, 6)]; // a curtain
        if ((x - x0) + (y - y0) >= 8 && (x - x0) + (y - y0) <= 9 && y < y0 + 11 && x < cx - 1) c = [214, 230, 236];
        P(x, y, c);
      }
      for (const [sx0, sx1] of [[x0 - 9, x0 - 1], [x1 + 1, x1 + 9]]) for (let y = y0 - 1; y < y1 + 1; y++) for (let x = sx0; x < sx1; x++) {
        let v = 4 + ((x - sx0) % 3 === 0 ? -1.5 : 0) + (x === sx0 ? 1.2 : 0) + (hash(x, y >> 2, 514) - 0.5) * 0.7;
        if (y === y0 + 4 || y === y1 - 4) v = 2;
        P(x, y, Wd[clamp(Math.round(v), 0, 7)]);
      }
      for (let y = y1; y < y1 + 6; y++) for (let x = x0 - 3; x < x1 + 3; x++) P(x, y, Wd[y === y1 ? 5 : y === y1 + 5 ? 1 : 3]);
      for (let k = 0; k < 30; k++) {
        const fx = x0 - 3 + Math.floor(hash(k, cx, 515) * 30), fy = y1 - 4 + Math.floor(hash(k, cx + 1, 515) * 5);
        const fl = [RAMP.flower.red, RAMP.flower.pink, RAMP.flower.white, RAMP.flower.red][k % 4];
        if (k % 3 === 0) { P(fx, fy, Gr[6]); P(fx + 1, fy, Gr[4]); P(fx, fy + 1, Gr[3]); continue; }
        P(fx, fy, fl[2]); P(fx + 1, fy, fl[1]); P(fx, fy + 1, fl[1]); P(fx + 1, fy + 1, fl[0]);
      }
      for (let x = x0 - 2; x < x1 + 2; x += 3) { P(x, y1 + 6, Gr[4]); P(x + 1, y1 + 7, Gr[2]); }
    };
    windowAt(240);
    windowAt(368);

    // ---- the door: an arch of stones, two plank leaves, iron straps, a warm line of light at the seam ------------
    const dcx = 304, ar = 14, ay = 112, dBot = 157;
    const inDoor = (x, y) => (y >= ay && y < dBot && Math.abs(x - dcx) < ar) || ((x - dcx) ** 2 + (y - ay) ** 2 < ar * ar && y < ay);
    const inArch = (x, y) => (y >= ay && y < dBot && Math.abs(x - dcx) < ar + 4) || ((x - dcx) ** 2 + (y - ay) ** 2 < (ar + 4) ** 2 && y < ay);
    for (let y = ay - ar - 5; y < dBot; y++) for (let x = dcx - ar - 5; x < dcx + ar + 5; x++) {
      if (!covered(inArch, x, y) || covered(inDoor, x, y)) continue;
      const a = Math.atan2(y + 0.5 - ay, x + 0.5 - dcx), seg = Math.floor((a + Math.PI) / (Math.PI / 7));
      const joint = y >= ay ? (y - ay) % 7 === 6 : Math.abs((a + Math.PI) % (Math.PI / 7)) < 0.07;
      let v = 5 + (hash(seg, y >= ay ? Math.floor((y - ay) / 7) : 0, 516) - 0.5) * 1.6;
      if (x < dcx - ar - 2) v += 1; else if (x > dcx + ar + 1) v -= 1;
      P(x, y, St[clamp(Math.round(joint ? 2 : v), 1, 8)]);
    }
    for (let y = ay - ar; y < dBot; y++) for (let x = dcx - ar; x < dcx + ar; x++) {
      if (!covered(inDoor, x, y)) continue;
      const plank = Math.floor((x - (dcx - ar)) / 4), seam = (x - (dcx - ar)) % 4 === 0;
      let v = 3.6 + (plank % 2 ? 0.5 : -0.3) + (hash(x, y >> 2, 517) - 0.5) * 0.8 - (y < ay ? 1 : 0);
      if (seam) v = 1.6;
      const strap = y === 120 || y === 121 || y === 145 || y === 146;
      let c = strap ? St[y === 120 || y === 145 ? 3 : 1] : Wd[clamp(Math.round(v), 0, 7)];
      if (strap && (x - dcx) % 5 === 0) c = St[6];
      if (x === dcx && y > 128 && y < 140) c = Wd[5]; // the leaves meet: a lighter edge where the light catches it
      P(x, y, c);
    }
    for (const [x, y, c] of [[dcx + 5, 132, St[1]], [dcx + 6, 132, St[1]], [dcx + 5, 133, St[6]], [dcx + 6, 133, St[2]], [dcx + 5, 134, St[1]]]) P(x, y, c);
    for (let y = 157; y < 162; y++) for (let x = dcx - 17; x < dcx + 17; x++) P(x, y, St[y === 157 ? 7 : y === 161 ? 2 : 5]);

    // ---- the lantern on the right of the door --------------------------------------------------------------------
    for (let x = 327; x < 337; x++) P(x, 98, St[1]);
    for (let y = 100; y < 110; y++) for (let x = 332; x < 339; x++) {
      const fr = x === 332 || x === 338 || y === 100 || y === 109;
      P(x, y, fr ? St[1] : Au[y < 103 ? 7 : y < 106 ? 6 : 5]);
    }
    P(335, 99, St[2]); P(334, 110, St[1]); P(336, 110, St[1]);

    // ---- the eave's shadow on the wall --------------------------------------------------------------------------
    for (let y = WT + 4; y < WT + 20; y++) for (let x = 192; x < 417; x++) darken(x, y, y < WT + 10 ? 0.5 : 0.5 + (y - (WT + 10)) * 0.05);

    // ---- the roof: courses of straw with ragged edges, the left hip in the sun, the right in shade ---------------
    const RT = -6, RB = 96;
    const inRoof = inPoly([[180, RB], [428, RB], [374, RT], [234, RT]]);
    const hipL = (y) => 234 + (204 - 234) * ((y - RT) / (RB - RT)), hipR = (y) => 374 + (404 - 374) * ((y - RT) / (RB - RT));
    for (let y = RT - 4; y < RB + 4; y++) for (let x = 176; x < 432; x++) {
      if (!covered(inRoof, x, y)) continue;
      const side = x < hipL(y) ? -1 : x > hipR(y) ? 1 : 0;
      // the course boundary wanders a couple of pixels; each course is 8 px of straw
      const cy2 = y - RT + 2.4 * vnoise(x, 0, 6, 518) + 1.2 * vnoise(x, 7, 2.5, 519);
      const course = Math.floor(cy2 / 8), within = cy2 - course * 8;
      // the sun from the upper left: the left hip brightest, the front slope warming toward its upper left,
      // the right hip and the lower courses in shade
      let v = side < 0 ? 6.8 : side > 0 ? 3.2 : 5.2 + (1 - (x - 204) / 200) * 0.9;
      v += (1 - (y - RT) / (RB - RT)) * 1.1;
      v += (hash(x, course, 520) - 0.5) * 1.5 + (vnoise(x, y, 3, 521) - 0.5) * 0.6;
      // each course: straw tips catching light at its top, its belly in the shadow of the course above
      if (within > 6.9) v -= 2.2;
      else if (within > 6) v -= 1;
      else if (within < 1.3 && hash(x, course, 522) > 0.5) v += 1.2;
      else if (within < 2.6) v -= 0.5;
      if (y > 56) v -= (y - 56) / 30;
      let c = Th[clamp(Math.round(v), 1, 9)];
      // moss in small cushions, tucked into the shaded side's lower courses, the colour of old straw gone green
      const moss = fbm(x, y, 6, 523, 2);
      if (y > 40 && (side > 0 || x > 350) && moss > 0.7 && within < 6) c = K.mixc(Gr[clamp(Math.round(2.4 + (moss - 0.7) * 14 + (hash(x, y, 524) > 0.85 ? 1 : 0)), 2, 5)], Th[3], 0.35);
      P(x, y, c);
    }
    for (let y = RT + 2; y < RB; y++) { if (hash(1, y, 525) > 0.2) P(Math.round(hipL(y)), y, Th[8]); if (hash(2, y, 525) > 0.2) P(Math.round(hipR(y)), y, Th[2]); }
    // the cut eave: straw ends catching the light, a dark underside
    for (let x = 180; x < 428; x++) {
      const depth = 5 + Math.floor(vnoise(x, 0, 4, 526) * 3);
      for (let k = 0; k < depth; k++) {
        let v = (k === depth - 1 ? 1.5 : 6.6 - k * 0.75) + (hash(x, k, 527) - 0.5) * 1.4;
        if (x < 200) v += 0.8; else if (x > 410) v -= 1.2;
        P(x, RB + k, Th[clamp(Math.round(v), 0, 9)]);
      }
      P(x, RB + depth, Th[0]);
    }
    // the ridge: a thick bound roll with grass growing along it
    const RR = RT - 9;
    for (let y = RR; y < RR + 13; y++) for (let x = 228; x < 381; x++) {
      const t = (y - RR) / 12, ex = Math.min(x - 228, 380 - x);
      if (ex < 3 && (t < 0.25 || t > 0.85)) continue;
      let v = t < 0.2 ? 6.5 : t < 0.5 ? 5 : t < 0.8 ? 3.5 : 2;
      v += (hash(x, y >> 1, 528) - 0.5) * 1.2;
      if ((x - 228) % 16 < 2) v = t < 0.5 ? 7.5 : 4;
      P(x, y, Th[clamp(Math.round(v), 0, 9)]);
    }
    for (let x = 230; x < 379; x++) if (hash(x, 1, 529) > 0.55) { const hgt = 1 + Math.floor(hash(x, 2, 529) * 3); for (let k = 0; k < hgt; k++) P(x, RR - k, Gr[k === hgt - 1 ? 7 : 5]); }

    // ---- by the wall: flour sacks, a spare millstone, a barrel ----------------------------------------------------
    const sack = (cx, by, w, h) => {
      for (let y = by - h; y < by; y++) for (let x = cx - w; x <= cx + w; x++) {
        const u = (x - cx) / w, t = (y - (by - h)) / h;
        const half = 0.62 + 0.38 * Math.sin(Math.min(1, t * 1.25) * Math.PI * 0.5);
        if (Math.abs(u) > half) continue;
        let v = 6.2 - u * 1.8 - t * 0.9 + (hash(x, y, 530) - 0.5) * 0.5;
        if (Math.abs(u) > half - 0.12) v -= 1.6;
        if (t < 0.16 && Math.abs(u) < 0.3) v = 3;
        P(x, y, Pl[clamp(Math.round(v), 1, 7)]);
      }
      P(cx, by - h - 1, Wd[3]); P(cx - 1, by - h, Wd[2]); P(cx + 1, by - h, Wd[4]);
    };
    sack(262, 158, 6, 16); sack(275, 158, 6, 15); sack(268, 145, 6, 14);
    for (let y = 134; y < 159; y++) for (let x = 348; x < 374; x++) {
      const dx = x + 0.5 - 361, dy = y + 0.5 - 146.5, r = Math.hypot(dx, dy);
      if (r > 12.5) continue;
      let v = 4.6 - ((dx + dy) / 12) * 1.4 + (Math.floor(Math.atan2(dy, dx) * 3) % 2 ? 0.4 : -0.4);
      if (r > 11.5) v -= 1.8;
      if (r < 2.6) v = 0.5;
      else if (r < 3.6) v = 6.8;
      P(x, y, St[clamp(Math.round(v), 0, 8)]);
    }
    for (let y = 139; y < 160; y++) for (let x = 384; x < 400; x++) {
      const u = (x + 0.5 - 392) / 8, t = (y - 139) / 21;
      if (Math.abs(u) > 0.92 + 0.08 * Math.sin(t * Math.PI)) continue;
      let v = 4.4 - u * 2 + ((x - 384) % 4 === 0 ? -1.2 : 0);
      if (y === 142 || y === 155) v = -1;
      P(x, y, v < 0 ? St[u < 0 ? 4 : 2] : Wd[clamp(Math.round(v), 0, 7)]);
    }
    return b;
  }

  // ---- the lean-to carrying the axle, and the wheel ---------------------------------------------------------------
  const WH = { cx: 480, cy: 92, R: 34 };
  function buildLeanTo() {
    const b = new Buf(52, 80), ox = 410, oy = 52, Wd = RAMP.wood, St = RAMP.stone;
    const P = (x, y, c) => b.set(x - ox, y - oy, c);
    // the axle from the wall to the hub
    for (let x = 412; x < 462; x++) for (let y = 89; y < 95; y++) P(x, y, Wd[y === 89 ? 5 : y === 94 ? 1 : 3 + (hash(x >> 2, y, 530) > 0.6 ? -1 : 0)]);
    for (const px of [420, 444]) for (let y = 62; y < 128; y++) for (let x = px; x < px + 5; x++) P(x, y, Wd[x === px ? 5 : x === px + 4 ? 1 : 3 + (hash(x, y >> 2, 531) > 0.8 ? -1 : 0)]);
    for (let x = 412; x < 452; x++) for (let y = 58; y < 66; y++) P(x, y, Wd[y === 58 ? 6 : y === 65 ? 1 : 4 - ((x - 412) % 6 === 0 ? 1 : 0)]); // the cap beam
    for (let y = 89; y < 95; y++) for (const px of [421, 445]) P(px, y, St[2]); // iron straps
    return { cv: b.canvas(), x: ox, y: oy, z: 126 };
  }
  const WHEEL_N = 30, WHEEL_MS = 1500; // one 30° step (the paddles' and spokes' symmetry) per WHEEL_MS
  function buildWheel() {
    const sz = WH.R * 2 + 4, c0 = sz / 2, frames = [];
    const Wd = RAMP.wood, St = RAMP.stone, Wa = RAMP.water;
    for (let f = 0; f < WHEEL_N; f++) {
      const th = (f / WHEEL_N) * (Math.PI / 6), b = new Buf(sz, sz);
      for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) {
        const dx = x + 0.5 - c0, dy = y + 0.5 - c0, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx) - th;
        const off = (n, ph) => { const step = (Math.PI * 2) / n; let q = (((a + ph) % step) + step) % step; if (q > step / 2) q -= step; return q * r; };
        const lit = -(dx * 0.7 + dy * 0.7) / Math.max(r, 1);
        let v = 3.6 + lit * 1.5, col = null;
        if (r < 4.5) col = St[r < 1.6 ? 1 : dx + dy < -2 ? 6 : 3]; // the iron hub
        else if (r >= 21 && r < WH.R - 1) {
          // the band of paddle boards between the two rims: each board lit on its upper face, a dark gap after it
          const step = (Math.PI * 2) / 12, q = ((((a + Math.PI / 12) % step) + step) % step) / step;
          if (r < 22.4 || r > WH.R - 2.4) v -= 1.2; // the rims' edges
          else if (q > 0.8) v -= 2.2; // the gap between boards
          else if (q < 0.18) v += 1; // the board's lit edge
          if (r > WH.R - 3.4 && q > 0.8) continue; // the boards stand proud of the rim: notches in the outline
        } else if (r >= 12 && r < 14.4) v -= 0.4; // the inner ring
        else if (r < 21 && Math.abs(off(6, 0)) < 1.7) { if (off(6, 0) > 0.6) v -= 1; } // six spokes
        else continue;
        if (!col) col = Wd[clamp(Math.round(v), 0, 7)];
        // under the race's surface: the wheel sinks into the water (tinted, darker), foam along the line
        const wy = WH.cy - c0 + y;
        if (wy > 108) col = K.mixc(col, Wa[3], 0.6);
        else if (wy === 108) col = Wa[8];
        else if (dy > 4 && hash(x, y, 532 + f) > 0.94) col = Wa[8]; // wet glints just above
        b.set(x, y, col);
      }
      frames.push(b.canvas());
    }
    return { frames, x: WH.cx - c0, y: WH.cy - c0, z: 127 };
  }
  // foam and drips where the wheel meets the race: drawn every frame, in front of the wheel
  function drawFoam(c, cam, t) {
    const Wa = RAMP.water, f = Math.floor(t / 90);
    const px = (x, y, col) => { c.fillStyle = col; c.fillRect(Math.round(x - cam.x), Math.round(y - cam.y), 1, 1); };
    const C = (i) => 'rgb(' + Wa[i].join(',') + ')';
    for (let k = 0; k < 46; k++) {
      const x = 450 + hash(k, f % 7, 540) * 58, y = 112 + hash(k, (f + 3) % 7, 541) * 10;
      px(x, y, C(hash(k, 1, 542) > 0.5 ? 9 : 8));
      if (hash(k, 2, 542) > 0.6) px(x + 1, y, C(7));
    }
    // drips falling from the paddles rising on the left
    for (let k = 0; k < 7; k++) {
      const life = 520, ph = ((t + k * 140) % life) / life, x0 = 452 + k * 2.5, y0 = 96 + (k % 3) * 4;
      px(x0 - ph * 2, y0 + ph * ph * 22, C(8));
    }
  }

  function build() {
    const mill = buildMill();
    return { mill: { cv: mill.canvas(), x: OX, y: OY, z: 161 }, lean: buildLeanTo(), wheel: buildWheel(), WHEEL_N, WHEEL_MS, drawFoam,
      // the lights that glow: windows, the lantern, the door's seam (world art px)
      lights: [{ x: 240, y: 111, r: 18, a: 0.5 }, { x: 368, y: 111, r: 18, a: 0.5 }, { x: 335, y: 105, r: 11, a: 0.8 }],
      // the mill's shadow on the ground, to the lower right of its east wall
      shadow: [[413, 92], [438, 90], [462, 118], [462, 168], [413, 166]] };
  }
  return { build };
})();
