/* The wait at the tide-watcher's window (Chapter 2, sg.tide_wait): the view
 * from Shiori's hut while the tide goes out. The point runs out from the left
 * to its lighthouse; the little island sits offshore with its stone gateway;
 * on the sill, the weak tea Shiori made and her salt-whitened notebooks.
 *   wait  the sea falls away over the first lines: a pale bar shows under the
 *         water, wet sand comes up at both ends of it and below the window
 *   road  the last of the water draws off: a white sand road, straight from
 *         the tip of the point to the island
 *   fog   a thick white fog gathers on the road, and only there, and sits
 * No wind (it has dropped since the storm): the clouds and the fog stay put,
 * the sea is glassy. The sea floor is a height field laid out in the picture;
 * each tide level colours it once (water by depth, sand by how lately it was
 * uncovered) and is cached until the level moves on. Drawn with RB.pxkit at
 * art resolution in the prologue's manner (see 41_prologue_art.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.prologueArt, { R, mk, clamp, stage, bandsIn } = A.kit;
  // its own layers (the floor, the view, the room per size) and the one sea layer for the tide shown;
  // kept apart from the prologue's small cache, which a tide level per step would churn
  const mine = new Map();
  let sea = null;
  const cached = (key, build) => {
    let v = mine.get(key);
    if (!v) { v = build(); mine.set(key, v); if (mine.size > 8) mine.delete(mine.keys().next().value); }
    return v;
  };
  A.kit.onRelease(() => { mine.clear(); sea = null; });
  const K = () => RB.pxkit;
  const ease = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  const hex3 = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

  // ---- where everything is -----------------------------------------------------------------
  function geom(w, h, vb) {
    const S = stage(w, h, vb), { s } = S;
    const wm = clamp(Math.round(w * 0.07), s(12), s(64));          // the wall either side of the window
    const x0 = wm, x1 = w - wm, ow = x1 - x0;
    const y0 = Math.max(s(8), Math.round(h * 0.035));               // the lintel
    const tr = s(14);                                                // the lattice transom under it
    const vy0 = y0 + tr + s(4);                                      // the top of the view
    const yS = Math.round(vb - s(18));                               // the sill's top edge (the view's bottom)
    const iw = Math.max(s(16), Math.round(Math.min(ow * 0.1, (yS - vy0) * 0.24))), ih = Math.round(iw * 0.5);
    const yH = Math.round(vy0 + Math.max((yS - vy0) * 0.34, ih * 2.3 + s(4))); // the horizon (room above it for the island)
    const ox = (u) => Math.round(x0 + u * ow);
    const D = yS - yH;
    // the point runs out from our left to its tip; the road goes on from there, away from us, to the island
    const tip = { x: ox(0.42), y: Math.round(yH + D * 0.4) };
    const isl = { x: ox(0.6), y: Math.round(yH + D * 0.07) };       // the island's foot (its middle)
    const end = { x: Math.round(isl.x - iw * 0.22), y: Math.round(isl.y + ih * 0.1) }; // the road reaches the gateway
    const hwA = Math.max(s(7), Math.round(ow * 0.03));
    const hwB = Math.max(1.5, hwA * (end.y - yH) / Math.max(1, tip.y - yH));
    const yF = Math.round(yS - Math.max(s(22), D * 0.2));            // where the shore below the window begins
    const glassX = ox(0.8);                                          // the sliding pane, pushed to the right
    // the point: its ridge rises toward us on the left, its shore runs from the tip back to the beach
    const shoreAt = (y) => tip.x + s(4) + (ox(0.12) - tip.x - s(4)) * clamp((y - tip.y) / Math.max(1, yF - tip.y), 0, 1);
    const ridgeAt = (x) => Math.round(tip.y - s(10) - (tip.x - x) * (tip.y - yH - D * 0.08) / Math.max(1, tip.x - x0) * 0.9);
    // the road: along it (0 at the tip, 1 at the gateway) and across it (in its half-widths)
    const RL = Math.hypot(end.x - tip.x, end.y - tip.y), rdx = (end.x - tip.x) / RL, rdy = (end.y - tip.y) / RL;
    const roadUV = (X, Y) => {
      const px = X - tip.x, py = Y - tip.y, along = (px * rdx + py * rdy) / RL, t = clamp(along, 0, 1);
      return { t, along, q: Math.abs(px * rdy - py * rdx) / (hwA + (hwB - hwA) * t) };
    };
    return Object.assign(S, { w, h, vb, wm, x0, x1, ow, y0, tr, vy0, yS, yH, D, ox, tip, isl, iw, ih, end, hwA, hwB, yF, glassX, shoreAt, ridgeAt, roadUV });
  }

  // ---- the sea floor ------------------------------------------------------------------------
  // Height per pixel of the view below the horizon (−1 deep … 1 high and dry),
  // and which pixels are rock. The sand road is highest at its two ends, so it
  // comes up from the point and from the island before its middle.
  const N2 = (x, y) => Math.sin(x * 0.31 + y * 0.17) * 0.5 + Math.sin(x * 0.071 - y * 0.23 + 1.3) * 0.5;
  function floor(G) {
    return cached('tidefloor|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { x0, ow, yH, yS, tip, isl, iw, ih, end, hwA, hwB, yF, s } = G;
      const W = ow, H = yS - yH, hgt = new Float32Array(W * H), rock = new Uint8Array(W * H), road = new Uint8Array(W * H);
      const rnd = K().rnd(3301), rocks = [];
      // rocks off the point's shore, round the island's foot and on the beach below
      for (let i = 0; i < 9; i++) { const k = rnd(); rocks.push([G.shoreAt(tip.y + k * (yF - tip.y)) + s(3) + rnd() * s(9), tip.y + k * (yF - tip.y) + s(2), s(2) + rnd() * s(3)]); }
      for (let i = 0; i < 7; i++) { const a = rnd() * Math.PI; rocks.push([isl.x + Math.cos(a) * iw * (0.9 + rnd() * 0.4), isl.y + ih * 0.3 + Math.sin(a) * ih * 0.35, s(1.5) + rnd() * s(2)]); }
      for (let i = 0; i < 10; i++) rocks.push([x0 + rnd() * ow, yF + s(4) + rnd() * (yS - yF - s(4)), s(3) + rnd() * s(5)]);
      for (let y = 0; y < H; y++) {
        const Y = y + yH, d = (Y - yH) / Math.max(1, H);
        for (let x = 0; x < W; x++) {
          const X = x + x0, n = N2(X, Y);
          let v = -1 + d * 0.25;
          // the road, from the tip (t 0) to the island (t 1), narrowing with distance
          {
            const R0 = G.roadUV(X, Y);
            if (R0.along > -0.04 && R0.along < 1.04 && R0.q < 2) {
              const crest = 0.6 - 0.3 * Math.sin(Math.PI * R0.t), r = crest - 0.9 * R0.q * R0.q + 0.04 * n;
              if (r > v) { v = r; if (R0.q < 1.15) road[y * W + x] = R0.q < 0.4 ? 2 : 1; }
            }
          }
          // flats off the tip and round the island
          { const dx = (X - tip.x) / s(26), dy = (Y - tip.y - s(2)) / s(9), r = 0.74 - Math.sqrt(dx * dx + dy * dy) * 0.95 + 0.07 * n; if (r > v) v = r; }
          { const dx = (X - isl.x) / (iw * 1.3), dy = (Y - isl.y - ih * 0.25) / Math.max(3, ih * 0.5), r = 0.7 - Math.sqrt(dx * dx + dy * dy) * 0.95 + 0.07 * n; if (r > v) v = r; }
          // the point's shore shelves down from its foot
          if (Y > tip.y) { const r = 0.62 - (X - G.shoreAt(Y)) / s(15) + 0.08 * n; if (r > v) v = r; }
          // the beach below the window rises toward us
          if (Y > yF - s(10)) { const k = (Y - yF) / Math.max(1, yS - yF); const r = -0.45 + k * 1.75 + 0.1 * n; if (r > v) v = r; }
          hgt[y * W + x] = v;
        }
      }
      for (const [rx, ry, rr] of rocks) {
        const ryy = Math.max(1.5, rr * 0.55);
        for (let y = Math.floor(ry - ryy); y <= ry + ryy; y++) for (let x = Math.floor(rx - rr); x <= rx + rr; x++) {
          const a = (x - rx) / rr, b = (y - ry) / ryy;
          if (a * a + b * b > 1) continue;
          const X = x - x0, Y = y - yH;
          if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
          const i = Y * W + X;
          rock[i] = b < -0.2 ? 2 : 1; // 2: the lit top
          hgt[i] = Math.max(hgt[i], 0.3 + (1 - a * a - b * b) * 0.5);
        }
      }
      return { W, H, hgt, rock, road };
    });
  }

  // Sea level for a tide level L (0 high water … 1 the lowest of the month).
  const levelOf = (L) => 0.95 - 0.86 * L;
  const ROWS = ['#b6cdd8', '#a2bfcf', '#8eb0c4', '#7aa1b8', '#6892ac', '#5884a0', '#4a7794', '#3f6b88'].map(hex3);
  const SHALLOW = ['#e8f2ee', '#a8d8cc', '#86c2bc', '#6ea8ae'].map(hex3);
  const SAND = { edge: hex3('#8c8470'), wet: hex3('#b4aa8e'), road: hex3('#ece5cf'), roadDk: hex3('#d8cfb6'), beach: hex3('#d6c6a0'), beachDk: hex3('#c2b28c') };
  const ROCK = { lit: hex3('#9a958c'), mid: hex3('#76726c'), wet: hex3('#4e4c4a'), weed: hex3('#56603a') };
  function seaLayer(G, F, q) {
    const key = G.w + 'x' + G.h + '|' + G.vb + '|' + q;
    if (sea && sea.key === key) return sea.cv;
    sea = { key, cv: (() => {
      const { W, H, hgt, rock, road } = F, SL = levelOf(q / 48), bay = K().bayer;
      const cv = mk(W, H), g = cv.getContext('2d'), img = g.createImageData(W, H), d = img.data;
      for (let y = 0; y < H; y++) {
        const rf = (y / Math.max(1, H - 1)) * (ROWS.length - 1), ri = Math.min(ROWS.length - 2, Math.floor(rf)), rr = rf - ri;
        for (let x = 0; x < W; x++) {
          const i = y * W + x, v = hgt[i], b = bay(x + G.x0, y + G.yH);
          let c;
          if (v < SL) {
            const dep = SL - v;
            if (dep < 0.025) c = SHALLOW[0];
            else if (dep < 0.42) {
              const f = (dep - 0.025) / 0.13, k = Math.min(2, Math.floor(f)), fr = f - k;
              c = SHALLOW[1 + (fr > 0.72 && fr - 0.72 > b * 0.28 && k < 2 ? k + 1 : k)];
              if (k === 2 && fr > 0.5 && b < (fr - 0.5)) c = ROWS[rr > b ? ri + 1 : ri];
            } else c = ROWS[rr > 0.6 && rr - 0.6 > b * 0.4 ? ri + 1 : ri];
            if (rock[i] && dep < 0.18) c = ROCK.wet;
          } else {
            const dz = v - SL;
            if (rock[i]) c = dz < 0.12 ? (dz < 0.06 ? ROCK.weed : ROCK.wet) : rock[i] === 2 ? ROCK.lit : ROCK.mid;
            else if (dz < 0.03) c = SAND.edge;
            else if (dz < 0.11) c = SAND.wet;
            else if (road[i]) c = b < 0.1 ? SAND.roadDk : SAND.road;
            else c = b < 0.14 ? SAND.beachDk : SAND.beach;
          }
          const o = i * 4;
          d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
      return cv;
    })() };
    return sea.cv;
  }

  // ---- the sky, the point and the island (still) ---------------------------------------------
  function view(G) {
    return cached('tideview|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, x0, x1, ow, vy0, yH, yS, tip, isl, iw, ih, end, s } = G;
      const P = K(), rnd = P.rnd(9127);
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      // afternoon sky, the sun high on the left behind stepped rings
      bandsIn(g, x0, G.y0, ow, yH - G.y0, ['#78a0c8', '#86aace', '#94b4d2', '#a4bfd6', '#b6cad8', '#c8d4da', '#dadcd4', '#eae2cc'], 0.45);
      const sx = G.ox(0.13), sy = vy0 + s(14), sr = Math.max(3, s(6));
      P.halo(g, sx, sy, sr * 6, '255,244,214', 0.3, 5);
      g.fillStyle = '#fff6e0'; P.disc(g, sx, sy, sr); g.fillStyle = '#fffcf4'; P.disc(g, sx - 1, sy - 1, Math.max(1, sr - 2));
      // flat clouds that do not move (there is no wind)
      const CL = P.layer(w, h), cloud = P.mat('#d8dee8', { n: 5, at: 2, step: 0.07 });
      for (const [fx, fy, cw] of [[0.46, 0.3, 0.2], [0.78, 0.55, 0.16], [0.28, 0.72, 0.1]]) {
        const ccx = G.ox(fx), ccy = Math.round(vy0 + (yH - vy0) * fy), W2 = Math.round(ow * cw / 2);
        for (let i = 0; i < 6; i++) {
          const ex = ccx - W2 + Math.round((W2 * 2 * (i + 0.5)) / 6), er = Math.max(3, Math.round(W2 * (0.24 + 0.12 * Math.sin(i * 2.3 + fx * 9)))), ery = Math.max(2, Math.round(er * 0.42));
          CL.ell(ex, ccy - Math.round(ery * 0.4), er, ery, cloud, (x, y) => (y < ccy - ery * 0.6 ? 0.95 : y < ccy ? 0.62 : 0.3));
        }
        CL.rect(ccx - W2, ccy, W2 * 2, Math.max(1, s(2)), cloud, 0.3);
      }
      g.drawImage(CL.canvas(), 0, 0);
      // haze on the horizon
      for (let y = yH - s(5); y < yH; y++) for (let x = x0 + (y & 1) * 2; x < x1; x += 4) R(g, x, y, 2, 1, 'rgba(240,236,222,0.4)');
      R(g, x0, yH, ow, 1, '#c8d6dc');

      // the island: a rock with cliffs toward us, pines along its top, a stone gateway at its foot
      const I = P.layer(w, h);
      const rockM = P.mat('#8a847a', { n: 6, at: 3, step: 0.085 }), pine = P.mat('#3e5e46', { n: 5, at: 2, step: 0.08 }), dress = P.mat('#b0a690', { n: 5, at: 2 });
      const iTop = isl.y - ih * 1.25;
      I.poly([[isl.x - iw, isl.y + ih * 0.25], [isl.x - iw * 0.86, isl.y - ih * 0.5], [isl.x - iw * 0.55, iTop + ih * 0.25], [isl.x - iw * 0.1, iTop], [isl.x + iw * 0.45, iTop + ih * 0.15], [isl.x + iw * 0.85, isl.y - ih * 0.45], [isl.x + iw, isl.y + ih * 0.25]],
        rockM, (x, y) => { const f = (x - isl.x) / iw; return clamp(0.82 - f * 0.42 - ((Math.round(y) % 4 === 0) ? 0.18 : 0) - (y > isl.y ? 0.25 : 0), 0, 0.999); });
      for (let i = 0; i < 9; i++) {
        const px2 = isl.x - iw * 0.7 + (iw * 1.45 * i) / 8 + (rnd() - 0.5) * s(3), top = iTop + ih * 0.1 + Math.abs(px2 - isl.x + iw * 0.1) * 0.25, ph = Math.max(s(5), ih * (0.55 + rnd() * 0.3));
        I.poly([[px2, top - ph], [px2 - ph * 0.45, top + 1], [px2 + ph * 0.45, top + 1]], pine, (x) => (x < px2 ? 0.75 : 0.35));
      }
      // the gateway: dressed jambs and lintel round a dark opening, where the road arrives
      const gx = end.x, gy = Math.round(isl.y + ih * 0.1), gw = Math.max(3, Math.round(iw * 0.13)), gh = Math.max(4, Math.round(ih * 0.62));
      I.rect(gx - gw - 2, gy - gh - 2, gw * 2 + 4, gh + 2, dress, (x, y) => (y < gy - gh ? 0.9 : x < gx ? 0.7 : 0.45));
      I.fill(gx - gw, gy - gh, gx + gw, gy, (x, y) => y > gy - gh + Math.abs(x - gx) * 0.35 || Math.abs(x - gx) < gw * 0.6, P.solid('#1c1a22'));
      I.outline();
      g.drawImage(I.canvas(), 0, 0);

      // the point: a grassy headland running out from our left, rocks where it meets the sea, a path
      // along its back to the lighthouse at the tip
      const L = P.layer(w, h);
      const grass = P.mat('#6a9046', { n: 6, at: 3, step: 0.075 }), stone = P.mat('#8e8678', { n: 5, at: 2, step: 0.09 }), dirt = P.mat('#c8b48a', { n: 4, at: 2 });
      const bush = P.mat('#46683e', { n: 5, at: 2, step: 0.08 });
      const pts = [[x0 - 2, G.ridgeAt(x0)]];
      for (let x = x0; x <= tip.x - s(6); x += Math.max(2, s(5))) pts.push([x, G.ridgeAt(x) + Math.round(Math.sin(x * 0.13) * s(1.5))]);
      pts.push([tip.x - s(3), tip.y - s(9)], [tip.x + s(5), tip.y - s(3)], [tip.x + s(5), tip.y + 1]);
      for (let y = tip.y + 2; y <= G.yF + s(4); y += Math.max(2, s(3))) pts.push([G.shoreAt(y) + Math.round(Math.sin(y * 0.37) * s(1.4)), y]);
      pts.push([x0 - 2, G.yF + s(4)]);
      const near = (x, y) => clamp((y - G.ridgeAt(x)) / Math.max(4, G.yF - G.ridgeAt(x)), 0, 1);
      L.poly(pts, grass, (x, y) => clamp(0.9 - near(x, y) * 0.5 - (N2(x * 0.45, y * 0.9) > 0.55 ? 0.13 : 0) - (N2(x * 1.7 + 3, y * 2.3) > 0.8 ? 0.1 : 0), 0, 0.999));
      // rock along the waterline, a little wider at the tip
      L.recolor((x, y) => y > tip.y - s(4) && x > G.shoreAt(Math.max(y, tip.y)) - s(4) - (y < tip.y + s(8) ? s(4) : 0), grass, stone, (x, y) => (Math.round(y + x * 0.5) % 4 === 0 ? 0.25 : y < tip.y ? 0.85 : 0.55));
      // the path, worn pale, from the near hill out to the lighthouse door
      for (let x = x0; x < tip.x - s(10); x++) {
        const y = G.ridgeAt(x) + s(5) + Math.round((x - x0) * 0.04), wd = Math.max(1, Math.round(s(3) * (1 - (x - x0) / Math.max(1, tip.x - x0)) + 1));
        L.rect(x, y, 1, wd, dirt, (xx, yy) => (yy < y + 1 ? 0.9 : 0.5));
      }
      // bushes and two wind-bent pines
      const rr = P.rnd(77);
      for (let i = 0; i < 7; i++) {
        const bx = x0 + s(8) + rr() * (tip.x - x0 - s(26)), by = G.ridgeAt(bx) + s(9) + rr() * s(14), br = s(3) + rr() * s(3);
        if (by > G.shoreAt(by) - s(8) && by > tip.y) continue;
        L.ell(bx, by, br, br * 0.7, bush, P.sphere(bx - br * 0.3, by - br * 0.3, br, br * 0.7, { amb: 0.2 }));
      }
      for (const u of [0.18, 0.34]) {
        const px2 = Math.round(x0 + (tip.x - x0) * u), base = G.ridgeAt(px2) + s(2), ph = s(18) - u * s(10);
        L.rect(px2 - 1, base - ph * 0.45, Math.max(1, s(1.5)), ph * 0.45, P.mat('#5a4030', { n: 4, at: 2 }), 1);
        L.ell(px2 + s(3), base - ph * 0.62, s(7), s(3), bush, (x, y) => (y < base - ph * 0.65 ? 0.85 : 0.35));
        L.ell(px2 + s(1), base - ph * 0.85, s(5), s(2.5), bush, (x, y) => (y < base - ph * 0.88 ? 0.9 : 0.45));
      }
      // tufts, larger toward us
      for (let i = 0; i < 60; i++) {
        const tx = x0 + rr() * (tip.x - x0), ty = G.ridgeAt(tx) + s(4) + Math.pow(rr(), 0.8) * (G.yF - G.ridgeAt(tx));
        if (tx > G.shoreAt(Math.max(ty, tip.y)) - s(7)) continue;
        const hgt = 1 + Math.round(near(tx, ty) * s(3));
        L.rect(tx, ty - hgt, 1, hgt, grass, 0.98); L.rect(tx + 1, ty - hgt + 1, 1, hgt - 1 || 1, grass, 0.2);
      }
      L.outline();
      // the lighthouse: a white tower tapering a little, an iron gallery and lantern room, a dark cap,
      // and the keeper's house at its foot
      const lx = tip.x - s(10), lb = tip.y - s(6), th = Math.max(s(20), Math.round(Math.min((lb - G.vy0) * 0.62, ow * 0.2, lb - G.vy0 - s(16)))), rw = Math.max(4, s(7)), rt = Math.max(3, s(5));
      const white = P.mat('#e8e2d6', { n: 6, at: 3, step: 0.08 }), iron = P.mat('#3a3a44', { n: 4, at: 2 }), glass = P.mat('#f4dc96', { n: 4, at: 2 });
      const roofM = P.mat('#5a4a4a', { n: 4, at: 2 });
      L.rect(lx - rw - s(14), lb - s(8), s(13), s(8), white, (x) => (x < lx - rw - s(8) ? 0.75 : 0.5));
      L.poly([[lx - rw - s(16), lb - s(8)], [lx - rw - s(8), lb - s(13)], [lx - rw, lb - s(8)]], roofM, (x) => (x < lx - rw - s(8) ? 0.8 : 0.4));
      L.rect(lx - rw - s(10), lb - s(5), s(3), s(5), iron, 1);
      L.fill(lx - rw - 1, lb - th, lx + rw + 1, lb, (x, y) => Math.abs(x - lx) <= rt + (rw - rt) * clamp((y - (lb - th)) / th, 0, 1), white, (x, y) => clamp(0.88 - (x - lx + rw * 0.4) / (rw * 2) * 0.72, 0, 0.999));
      L.rect(lx - rt - 2, lb - th - 1, rt * 2 + 5, Math.max(2, s(2)), iron, (x) => (x < lx ? 2 : 1));
      L.rect(lx - rt + 1, lb - th - s(7), rt * 2 - 1, s(6), glass, (x) => (x < lx ? 0.95 : 0.55));
      for (let x = lx - rt + 1 + s(3); x < lx + rt; x += s(3)) L.rect(x, lb - th - s(7), 1, s(6), iron, 1);
      L.ell(lx, lb - th - s(7), rt + 1, Math.max(2, s(3)), iron, (x, y) => (y > lb - th - s(7) ? -1 : x < lx ? 0.9 : 0.4));
      L.rect(lx, lb - th - s(12), 1, s(3), iron, 0);
      for (const k of [0.32, 0.6]) L.rect(lx - 1, Math.round(lb - th * k), Math.max(2, s(2.5)), s(4), iron, 1); // stair windows
      L.rect(lx - s(2), lb - s(6), s(4), s(6), iron, 0); // the door
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return cv;
    });
  }

  // ---- the room: wall, window, sill and the tea (still; the view shows through) ---------------
  function room(G) {
    return cached('tideroom|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, x0, x1, ow, y0, tr, vy0, yS, glassX, Z, s } = G;
      const P = K();
      const L = P.layer(w, h);
      const wood = P.mat('#6e523c', { n: 6, at: 3, step: 0.075 }), wall = P.mat('#4c3e36', { n: 5, at: 2, step: 0.06 }), lat = P.mat('#5a4232', { n: 5, at: 2 });
      // wall boards either side and above, in the room's shade
      L.fill(0, 0, w, h, (x, y) => x < x0 || x >= x1 || y < y0 || y >= yS, wall, (x, y) => {
        const seam = ((x + 3) % s(18)) < 1 ? 0.05 : ((x + 3) % s(18)) < 2 ? 0.75 : 0.45;
        return x < x0 ? seam * (0.85 + 0.15 * (x / Math.max(1, x0))) : seam * 0.9;
      });
      // the frame: posts, lintel, the reveal catching the daylight on the right-hand side
      L.rect(x0 - s(5), y0 - s(3), s(5), yS - y0 + s(3), wood, (x) => (x < x0 - s(3) ? 0.55 : 0.35));
      L.rect(x1, y0 - s(3), s(5), yS - y0 + s(3), wood, (x) => (x < x1 + s(2) ? 0.9 : 0.6));
      L.rect(x0 - s(5), y0 - s(4), ow + s(10), s(4), wood, (x, y) => (y < y0 - s(3) ? 0.9 : 0.5));
      // the transom: a square kumiko lattice against the sky
      L.rect(x0, y0, ow, s(2), lat, 1);
      L.rect(x0, y0 + tr, ow, s(4), wood, (x, y) => (y < y0 + tr + 1 ? 0.85 : 0.45));
      for (let x = x0 + s(6); x < x1; x += s(7)) L.rect(x, y0, Math.max(1, s(1.4)), tr, lat, 2);
      for (let y = y0 + s(5); y < y0 + tr; y += s(5)) L.rect(x0, y, ow, 1, lat, 2);
      // the pane slid to the right: its frame and a muntin, the glass itself drawn below
      L.rect(glassX - s(3), vy0, s(3), yS - vy0, wood, (x) => (x < glassX - s(2) ? 0.85 : 0.5));
      L.rect(glassX, Math.round((vy0 + yS) / 2), x1 - glassX, Math.max(1, s(2)), wood, 2);
      // the sill: a lit top, a front edge in shade
      L.rect(x0 - s(8), yS, ow + s(16), s(8), wood, (x, y) => (y < yS + 1 ? 0.98 : y < yS + s(5) ? 0.8 : 0.62));
      L.rect(x0 - s(8), yS + s(8), ow + s(16), s(5), wood, (x, y) => (y < yS + s(9) ? 0.4 : 0.25));
      L.outline();
      const cv = L.canvas(), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      // the glass: a cool tint and two reflections
      g.fillStyle = 'rgba(214,232,240,0.16)'; g.fillRect(glassX, vy0, x1 - glassX, yS - vy0);
      g.fillStyle = 'rgba(255,255,255,0.22)';
      for (const [u, wd] of [[0.18, 3], [0.36, 1]]) {
        const bx = glassX + Math.round((x1 - glassX) * u);
        for (let y = vy0; y < yS; y++) { const xx = bx + Math.round((y - vy0) * 0.35); if (xx < x1 - 1) g.fillRect(Math.max(glassX, xx - (y - vy0)), y, Math.max(1, s(wd)), 1); }
      }
      // daylight on the sill
      g.fillStyle = 'rgba(255,240,206,0.18)';
      for (let y = yS; y < yS + s(8); y++) g.fillRect(x0 + s(10) + (y - yS) * 2, y, Math.round(ow * 0.62), 1);
      // on the sill: the notebooks (the oldest white with salt), the tray, two cups, the pot
      const books = P.layer(s(40), s(22));
      const covers = [P.mat('#3c5674', { n: 4, at: 2 }), P.mat('#6a3a30', { n: 4, at: 2 }), P.mat('#4e6a4a', { n: 4, at: 2 }), P.mat('#e4e0d4', { n: 4, at: 2 })];
      const pages = P.mat('#efe6d0', { n: 3, at: 1 });
      for (let i = 0; i < 4; i++) {
        const by = s(18) - i * s(4), bx = s(2) + (i % 2) * s(2);
        books.rect(bx, by, s(32), s(3), covers[i], (x) => (x < bx + s(4) ? 0.9 : 0.55));
        books.rect(bx + s(30), by + 1, s(2), Math.max(1, s(2)), pages, 1);
      }
      books.outline();
      g.drawImage(books.canvas(), G.ox(0.07), yS + s(6) - s(22));
      const kit = A.kit, cup = kit.scaled(kit.cupSprite(), Z * 0.8), pot = kit.scaled(kit.potSprite(), Z * 0.8), tray = kit.scaled(kit.traySprite(), Z * 0.8);
      const tx = G.ox(0.44), ty = yS + s(6);
      g.drawImage(tray.cv, tx - tray.ax, ty - tray.ay);
      const cups = [{ x: tx - s(14), y: ty - s(4) }, { x: tx + s(14), y: ty - s(3) }];
      for (const c of cups) g.drawImage(cup.cv, c.x - cup.ax, c.y - cup.ay);
      g.drawImage(pot.cv, G.ox(0.62) - pot.ax, ty + s(1) - pot.ay);
      return { cv, cups: cups.map((c) => ({ x: c.x, y: c.y - cup.top })) };
    });
  }

  // ---- live ---------------------------------------------------------------------------------
  function glints(c, G, F, SL, t, still) {
    const { W, H, hgt } = F, rnd = K().rnd(611);
    for (let n = 0; n < W * H / 900; n++) {
      const x = Math.floor(rnd() * W), y = Math.floor(Math.pow(rnd(), 1.3) * H), ph = rnd() * 6.28;
      if (hgt[y * W + x] > SL - 0.3) continue; // open water only
      const kk = still ? 0.7 : (Math.sin(t / 1500 + ph) + 1) / 2;
      if (kk < 0.62) continue;
      const len = 1 + Math.round((y / H) * 6);
      c.fillStyle = 'rgba(248,250,250,' + (0.25 + (kk - 0.62) * 1.4).toFixed(2) + ')';
      c.fillRect(G.x0 + x, G.yH + y, len, 1);
    }
  }
  function gulls(c, G, t, still) {
    const { s } = G;
    for (let i = 0; i < 2; i++) {
      const a = still ? 1 + i : t / (9000 + i * 2600) + i * 2.4;
      const x = Math.round(G.ox(0.52 + i * 0.2) + Math.cos(a) * G.ow * 0.08), y = Math.round(G.vy0 + (G.yH - G.vy0) * (0.42 + i * 0.16) + Math.sin(a * 2) * s(4));
      const flap = still ? 1 : Math.floor(t / 260 + i * 3) % 4 === 0 ? 0 : 1;
      c.fillStyle = '#4a5462';
      c.fillRect(x - 3, y - flap, 2, 1); c.fillRect(x - 1, y, 1, 1); c.fillRect(x + 1, y - flap, 2, 1);
      if (s(1) > 1) { c.fillRect(x - 4, y - flap - 1, 1, 1); c.fillRect(x + 3, y - flap - 1, 1, 1); }
    }
  }
  // The fog: one thick bank lying on the road and nowhere else, flat underneath, heaped on top.
  // Puffs of varied size along the road are drawn in passes (all the shadow, then all the body,
  // then the lit tops) so they merge into a single mass. It gathers from the island end; then it
  // sits, only breathing a pixel (no wind to move it).
  function fog(c, G, k, t, still) {
    if (k <= 0) return;
    const { tip, end, hwA, hwB, s } = G, P = K();
    const puffs = [];
    for (let i = 0; i <= 30; i++) {
      const u = i / 30, x = tip.x + (end.x - tip.x) * u, y = tip.y + (end.y - tip.y) * u, hw = hwA + (hwB - hwA) * u;
      const grow = clamp(k * 1.7 - (1 - u) * 0.7, 0, 1);
      if (grow <= 0) continue;
      const v = 0.7 + 0.6 * ((Math.sin(i * 2.7) + Math.sin(i * 1.3 + 1)) / 4 + 0.5);
      const br = still ? 0 : Math.sin(t / 2600 + i * 1.7) * 0.6;
      const r = Math.max(2, Math.round((hw * 1.6 + s(2)) * v * (0.4 + 0.6 * grow) + br)), ry = Math.max(2, Math.round(r * 0.62));
      puffs.push({ x: Math.round(x), y: Math.round(y), r, ry, top: Math.round(y - ry * 0.55), grow });
      // heaps on its back, here and there
      if (i % 3 === 1) { const r2 = Math.max(2, Math.round(r * (0.5 + 0.25 * Math.sin(i * 1.9)))); puffs.push({ x: Math.round(x + r * 0.2 * Math.sin(i)), y: Math.round(y - ry * 0.5), r: r2, ry: Math.max(2, Math.round(r2 * 0.7)), top: Math.round(y - ry * 0.55 - r2 * 0.6), grow }); }
    }
    const pass = (col, a, dx, dy, dr) => {
      for (let j = puffs.length - 1; j >= 0; j--) {
        const p2 = puffs[j], rr = Math.max(1, p2.r + dr), ry = Math.max(1, p2.ry + dr);
        c.fillStyle = 'rgba(' + col + ',' + (a * p2.grow).toFixed(2) + ')';
        // flat underneath: rows below the road's line are not drawn
        for (let jy = -ry; jy <= ry; jy++) {
          const yy = p2.top + jy + dy;
          if (yy > p2.y + 1) break;
          const kk = jy / (ry + 0.5), hw = Math.round(rr * Math.sqrt(Math.max(0, 1 - kk * kk)));
          c.fillRect(p2.x + dx - hw, yy, hw * 2 + 1, 1);
        }
      }
    };
    pass('200,208,222', 0.32, 0, 0, 2);          // the soft edge
    pass('190,198,214', 0.85, 1, 1, 0);          // shadow, below and right
    pass('230,234,240', 0.92, 0, 0, -1);         // body
    pass('248,249,252', 0.85, -1, -Math.max(1, s(1.5)), -Math.max(2, s(2.5))); // lit tops, upper left
  }

  // ---- the tide over the stages ---------------------------------------------------------------
  const live = { stage: null, L: 0, from: 0 };
  function tideAt(st) {
    if (st.stage !== live.stage) { live.from = live.stage ? live.L : 0; live.stage = st.stage; }
    if (st.still) return (live.L = st.stage === 'wait' ? 0.55 : 1);
    if (st.stage === 'wait') return (live.L = 0.7 * ease(st.since / 12000) + 0.06 * clamp((st.since - 12000) / 24000, 0, 1));
    return (live.L = live.from + (1 - live.from) * ease(st.since / 2200));
  }

  RB.interlude.ART.tide_wait = {
    stages: ['wait', 'road', 'fog'],
    draw(c, w, h, t, st) {
      const G = geom(w, h, st.vb), F = floor(G);
      const L = tideAt(st), q = Math.round(L * 48), SL = levelOf(q / 48);
      c.fillStyle = '#2c241e'; c.fillRect(0, 0, w, h);
      c.drawImage(seaLayer(G, F, q), G.x0, G.yH);
      c.drawImage(view(G), 0, 0);
      glints(c, G, F, SL, t, st.still);
      gulls(c, G, t, st.still);
      fog(c, G, st.stage === 'fog' ? (st.still ? 1 : ease(st.since / 2800)) : 0, t, st.still);
      const rm = room(G);
      c.drawImage(rm.cv, 0, 0);
      rm.cups.forEach((cp, i) => A.kit.steam(c, cp.x, cp.y, st.still ? 0 : t, i, 3, st.still ? 0.8 : 1, G.s));
      live.q = q;
    },
    // tests: the tide level shown and how much of the road is dry
    probe(w, h, vb) {
      const G = geom(w, h, vb), F = floor(G), SL = levelOf((live.q || 0) / 48);
      let road = 0, dry = 0;
      for (let i = 0; i < F.road.length; i++) if (F.road[i] === 2) { road++; if (F.hgt[i] >= SL) dry++; } // its crown
      return { L: live.L, q: live.q, roadDry: road ? dry / road : 0, tip: G.tip, end: G.end, yH: G.yH, yS: G.yS, x0: G.x0, glassX: G.glassX };
    },
  };
})();
