/* Chapter 5's illustrated sequences (docs/expressive/SHOTS.md §5 and §7b).
 *
 * ch5.bell — the drowned bell rings (`lf.bell_touch`, src/content/ch5/24_tower.js). The Bell Chamber at the foot
 * of the drowned tower: a platform of stone over dark water, the great bell gone green on its charred beam, the
 * slack pipes of its keeper draped over the platform's edge where they fell. Four compositions:
 *   bell   a low view up at the bell from the water, you and your companion small on the platform under it: a
 *          slow light slides across its surface and the words cast into it stand out (relief, never writing);
 *          held through the kana lesson, the challenge and the choice
 *   gong   close on the bell's lip over the water, the foot of a conduit at the frame's edge: the bell swings once
 *          (in place of a screen shake), the green shaken off its lip where the clapper struck, rings spreading
 *          over the water; the rings reach the stone and a pale line of sound starts up the pipe
 *   town   from a window high in the tower, the conduits climbing the wall beside it, Lanternfall across the lake
 *          at dusk: two more pulses climb the pipes; then they turn, run down and out along the pipeline toward
 *          the town, and its windows light street by street
 *   hall   back in the chamber, from across the water: the bell gleaming now; a ring on the empty water when the
 *          voice speaks; you turn to it (nobody is there: Tōya is never drawn); your companion's own small
 *          gesture; and the lake drawing back down the stones
 * ch5.boat — the faded passage filled (`lf.boat_to_tower`, src/content/ch5/22_main.js): the crossing in Tokuji's
 * boat, lifted out of the dark of the scene's own fade: you at the oars, your companion in the bow, the still lake
 * with the drowned lower town under it, the tower ahead with the green bell in its belfry.
 * People are the game's own drawings (road sprites, graded into the light). No letters, kana or kanji are
 * drawn: the bell's inscription is cast relief, never writing. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const Q = RB.seqKit, { R, mk, clamp, ease, lerp, cached, stage } = Q;
  const P = () => RB.pxkit;
  const PATINA = '#5c7a66', BRONZE = '#b8984a', BEAM = '#3a2e2a', PIPE = '#3a3850';
  // people in the chamber's dark, lit by the lamp from above and in front (a warm rim along the top)
  const HALL = { mul: [0.6, 0.66, 0.84], add: [0, 2, 12], rim: { side: 't', col: '#ffd890', k: [0.55, 0.25] } };
  const HALL_L = { mul: [0.66, 0.7, 0.86], add: [4, 3, 10], rim: { side: 'l', col: '#ffe0a0', k: [0.5, 0.22] } };
  const hashf = (x, y, k) => (P().hh(x | 0, y | 0, k || 0) % 1000) / 1000;
  // smooth value noise (blotches that keep their size whatever the scale of the drawing)
  function vnoise(x, y, seed) {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    return lerp(lerp(hashf(xi, yi, seed), hashf(xi + 1, yi, seed), sx), lerp(hashf(xi, yi + 1, seed), hashf(xi + 1, yi + 1, seed), sx), sy);
  }
  // darker toward the frame's edges and its top (a stepped vignette: four flat steps)
  function vignette(c, w, h, a, top) {
    for (let i = 0; i < 4; i++) {
      const m = Math.round(Math.min(w, h) * (0.03 + i * 0.045));
      c.fillStyle = 'rgba(4,6,12,' + (a / 4).toFixed(3) + ')';
      c.fillRect(0, 0, m, h); c.fillRect(w - m, 0, m, h); c.fillRect(m, 0, w - 2 * m, Math.round(m * (top || 1)));
    }
  }

  // ---- the bell: a body of revolution, lit by the lamp low in front and to the left ---------------------------
  // half-width (in units of the body's height H) at t (0 = the shoulder's top, 1 = the lip)
  const bellHw = (t) => (t < 0.14 ? 0.3 * Math.sqrt(Math.max(0, t) / 0.14) : 0.3 + 0.075 * ((t - 0.14) / 0.7) + (t > 0.8 ? 0.11 * ((t - 0.8) / 0.2) ** 2 : 0));
  const BANDS = [0.3, 0.62, 0.86], BW = 0.024;
  const bandAt = (t) => { for (const b of BANDS) { const d = t - b; if (Math.abs(d) < BW) return d < 0 ? 1 : -1; } return 0; };
  // metal: 'patina' (green with age) | 'struck' (the green shaken off round the lip) | 'gold' (rung);
  // vr: how much of the mouth shows (the view's height: 0.2 from below, 0.07 level with the lip)
  function bellArt(H, metal, vr, noClapper) {
    H = Math.max(24, Math.round(H));
    vr = vr || 0.2;
    return Q.small('ch5.bell|' + H + '|' + metal + '|' + vr + '|' + (noClapper ? 0 : 1), () => {
      const p = P(), lipR = bellHw(1) * H, W = Math.ceil(lipR * 2 + 10), crown = Math.round(H * 0.14), ry = Math.max(2, Math.round(lipR * vr));
      const bob = Math.round(clamp(H * 0.045, 2, 14)), Hc = Math.ceil(crown + 2 + H + ry + bob * 3 + 6), cx = W / 2, y0 = crown + 2, lipY = y0 + H;
      const L = p.layer(W, Hc);
      const gold = metal === 'gold';
      const M = p.mat(gold ? BRONZE : PATINA, { n: 8, at: 4, step: 0.07 });
      const B = p.mat(BRONZE, { n: 8, at: 4, step: 0.07 });
      const V = p.mat('#4a6c5a', { n: 6, at: 3, step: 0.07 }), Vl = p.mat('#7ea290', { n: 5, at: 3, step: 0.06 });
      const shade = (x, y) => {
        const t = (y - y0) / H, hw = bellHw(t) * H;
        if (hw <= 0) return 0.3;
        const nx = clamp((x - cx) / hw, -1, 1), nz = Math.sqrt(1 - nx * nx), flare = t > 0.78 ? (t - 0.78) / 0.22 : 0;
        let v = 0.14 + 0.56 * Math.max(0, -nx * 0.5 + nz * 0.74) + flare * 0.22 * nz + (t > 0.45 ? (t - 0.45) * 0.24 : 0) - (t < 0.14 ? 0.12 : 0);
        const b = bandAt(t);
        if (b > 0) v += 0.22; else if (b < 0) v -= 0.3;
        if (nx > 0.86) v += 0.09; // light thrown back off the far edge
        return clamp(v, 0.02, 0.999);
      };
      L.fill(0, y0, W, y0 + H, (x, y) => { const t = (y - y0) / H; return t >= 0 && t <= 1 && Math.abs(x - cx) <= bellHw(t) * H; }, M, shade);
      // the green: a fine mottle of darker verdigris (clusters of a few pixels at any scale), a pale chalky crust on
      // the shoulder and on top of each band, and pale streaks run down under the bands
      const cell = clamp(H / 18, 2.5, 8);
      if (!gold) {
        L.recolor((x, y) => { const t = (y - y0) / H; return !bandAt(t) && vnoise(x / cell, y / cell, 5) < 0.3; }, M, V, (x, y) => shade(x, y) * 0.96);
        L.recolor((x, y) => { const t = (y - y0) / H; return (t < 0.12 || BANDS.some((b) => t > b - 0.05 && t < b - BW)) && vnoise(x / cell * 1.3, y / cell * 1.3, 7) > 0.62; }, null, Vl, (x, y) => clamp(shade(x, y) + 0.1, 0, 0.999));
        const sw = H > 220 ? 2 : 1, ns = Math.round(clamp(lipR / 3, 18, 90));
        for (let i = 0; i < ns; i++) {
          const u = hashf(i, 3, 9) * 1.76 - 0.88, tb = BANDS[i % 3 === 2 ? 0 : i % 2] + BW, len = 0.04 + hashf(i, 7, 9) * 0.14;
          L.recolor((x, y) => { const t = (y - y0) / H; return t > tb && t < tb + len && Math.abs(x - (cx + u * bellHw(t) * H)) < sw * 0.6; }, null, Vl, (x, y) => clamp(shade(x, y) + 0.16, 0, 0.999));
        }
        if (metal === 'struck') {
          // round the lip, where the clapper struck, the green has flaked off in chips and the bronze shows
          // a band round the lip with a ragged upper edge, and a few chips just above it
          const c2 = clamp(H / 30, 2, 7);
          L.recolor((x, y) => { const t = (y - y0) / H; return t > 0.86 - 0.07 * vnoise(x / (c2 * 2.5), 0.5, 9) || (t > 0.74 && vnoise(x / c2, y / c2, 10) < 0.12); }, null, B, shade);
        }
      } else {
        // rung: the bronze clean and bright, a long highlight down the lit side, a softer one far right
        L.recolor((x, y) => { const t = (y - y0) / H, nx = (x - cx) / Math.max(1, bellHw(t) * H); return t > 0.05 && ((nx > -0.64 && nx < -0.5) || (nx > 0.62 && nx < 0.68)); }, M, M, (x, y) => clamp(shade(x, y) + 0.28, 0, 0.999));
        L.recolor((x, y) => { const t = (y - y0) / H; return !bandAt(t) && vnoise(x / cell, y / cell, 15) < 0.2; }, M, M, (x, y) => clamp(shade(x, y) - 0.08, 0, 0.999));
      }
      // the crown: a heavy loop on top
      const cr = Math.max(3, Math.round(H * 0.09));
      L.fill(cx - cr - 2, 0, cx + cr + 2, y0 + 2, (x, y) => { const a = (x - cx) / cr, b = (y - y0 + 1) / crown; const d = a * a + b * b; return y <= y0 + 1 && d <= 1 && d >= 0.34; }, gold ? B : M, (x) => (x < cx ? 0.7 : 0.3));
      // the mouth: the near rim's edge, and the inside — its far wall dim in the lamp's light from below
      const th = Math.max(2, Math.round(H * 0.03));
      L.ell(cx, lipY, lipR, ry, metal === 'patina' ? M : B, (x, y) => clamp(0.4 + (y > lipY ? 0.3 : -0.1) - (x - cx) / lipR * 0.22, 0, 0.999));
      const IN = p.mat('#4a3826', { n: 5, at: 2, step: 0.09, line: false });
      L.ell(cx, lipY - Math.max(1, Math.round(th * vr * 2)), lipR - th, Math.max(1, ry - Math.max(1, Math.round(th * 0.6))), IN, (x, y) => clamp(0.08 + ((y - (lipY - ry)) / Math.max(1, ry * 2)) * 0.5 - Math.abs(x - cx) / lipR * 0.2, 0, 0.999));
      if (!noClapper) clapperInto(L, cx, lipY, ry, bob, 0);
      L.outline();
      // the cast words: columns of raised marks between the upper bands (a texture, never writing)
      const relief = [];
      for (let ci = 0; ci < 13; ci++) {
        const a = -1.1 + ci * 0.183;
        for (let r = 0; r < 6; r++) {
          if (hashf(ci, r, 21) < 0.2) continue;
          const t = 0.37 + r * 0.038, x = cx + Math.sin(a) * bellHw(t) * H;
          relief.push([Math.round(x - Math.max(1, H * 0.011)), Math.round(y0 + t * H), Math.max(1, Math.round(H * 0.022 * Math.cos(a))), Math.max(1, Math.round(H * 0.02))]);
        }
      }
      const cv = L.canvas(), g = cv.getContext('2d');
      for (const [x, y, w, h] of relief) { g.fillStyle = gold ? 'rgba(80,56,20,0.55)' : 'rgba(22,36,30,0.55)'; g.fillRect(x, y + 1, w, h); g.fillStyle = gold ? 'rgba(255,232,170,0.4)' : 'rgba(170,204,186,0.25)'; g.fillRect(x, y, w, 1); }
      return { cv, ax: Math.round(cx), ay: 0, w: W, h: Hc, y0, lipY, lipR, ry, relief, H, bob, crown };
    });
  }
  // the clapper: an iron rod and a pear-shaped bob, hanging in the mouth (dx: its swing at the bob)
  function clapperInto(L, cx, lipY, ry, bob, dx) {
    const p = P(), iron = p.mat('#3a3630', { n: 5, at: 2, step: 0.1 });
    const by = lipY + Math.round(bob * 1.1);
    L.seg(cx, lipY - ry, cx + dx, by - bob, Math.max(1, Math.round(bob * 0.35)), iron, 1);
    L.ell(cx + dx, by, bob, Math.round(bob * 1.15), iron, p.sphere(cx + dx - bob * 0.35, by - bob * 0.3, bob, bob * 1.15, { amb: 0.2 }));
  }
  function clapper(bob, dx) {
    return Q.small('ch5.clap|' + bob + '|' + dx, () => {
      const W = bob * 2 + Math.abs(dx) * 2 + 6, H2 = bob * 4 + 8, L = P().layer(W, H2), cx = Math.round(W / 2);
      clapperInto(L, cx, 2 + bob, bob, bob, dx);
      L.outline();
      return { cv: L.canvas(), ax: cx, ay: 2 + bob };
    });
  }
  // a copy of a drawing with stepped light laid over its own pixels (bands: [[y0, y1, rgba], …] in its frame)
  function litCopy(src, key, bands) {
    return Q.small('ch5.lit|' + key, () => {
      const cv = mk(src.width, src.height), g = cv.getContext('2d');
      g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-atop';
      for (const [y0, y1, col] of bands) { g.fillStyle = col; g.fillRect(0, Math.round(y0), src.width, Math.round(y1 - y0)); }
      return cv;
    });
  }
  // the lit relief as the light passes (band: x of the light in the bell's own frame; null: all, at a)
  function reliefLight(c, b, ox, oy, band, a, warm) {
    for (const [x, y, w, h] of b.relief) {
      const k = band == null ? a : a * clamp(1 - Math.abs(x - band) / Math.max(1, b.lipR * 0.45), 0, 1);
      if (k < 0.08) continue;
      c.fillStyle = warm ? 'rgba(255,236,190,' + (0.8 * k).toFixed(2) + ')' : 'rgba(214,240,234,' + (0.85 * k).toFixed(2) + ')';
      c.fillRect(ox + x, oy + y, w, 1);
      c.fillStyle = 'rgba(8,16,18,' + (0.55 * k).toFixed(2) + ')';
      c.fillRect(ox + x, oy + y + h, w, 1);
    }
  }

  // ---- the chamber: stone, water, pipes ---------------------------------------------------------------------
  const STONE = '#3e4460', WATER = ['#16303e', '#132a37', '#112532', '#0f202c', '#0d1c27', '#0b1822'];
  // a wall of great dressed blocks, courses running across, damp streaks; light(x, y) adds the lamp's warmth
  function blocks(L, x0, y0, x1, y1, s, M, light, seed, big) {
    const bh = Math.max(5, s(big ? 26 : 18)), bw = Math.max(10, s(big ? 58 : 40));
    L.rect(x0, y0, x1 - x0, y1 - y0, M, (x, y) => {
      const row = Math.floor((y - y0) / bh), off = (row % 2) * bw * 0.5 + hashf(row, 0, seed) * bw * 0.3, u = (x - x0 + off) % bw, v = (y - y0) % bh;
      if (v < 1 || u < 1) return 0.04;
      const n = hashf(Math.floor((x - x0 + off) / bw), row, seed || 3);
      const damp = vnoise(x / (bw * 0.1), y / (bh * 1.6), seed + 1) < 0.16 ? -0.07 : 0;
      return clamp(0.24 + n * 0.12 + damp + (light ? light(x, y) : 0) + (v < 2 ? 0.06 : v > bh - 3 ? -0.06 : 0) + (u < 2 ? 0.04 : 0), 0, 0.999);
    });
  }
  // a pipe standing in the water and climbing the wall: flanges, bolts
  function pipeUp(L, x, y0, y1, r, s, lit, gap) {
    const p = P(), M = p.mat(PIPE, { n: 7, at: 3, step: 0.085 }), bolt = p.mat('#8a8aa8', { n: 3, at: 1 });
    L.rect(x - r, y0, r * 2, y1 - y0, M, (xx) => clamp(0.18 + (lit || 0) + 0.55 * Math.max(0, 1 - Math.abs((xx - (x - r * 0.4)) / (r * 1.1))) + (xx > x + r * 0.7 ? 0.1 : 0), 0, 0.999));
    for (let y = y1 - s(18); y > y0 - s(4); y -= Math.max(18, gap || s(64))) {
      const fh = Math.max(2, s(5));
      L.rect(x - r - Math.max(1, s(2)), y, r * 2 + Math.max(2, s(4)), fh, M, (xx, yy) => clamp(0.3 + (lit || 0) + (xx < x ? 0.32 : 0) + (yy < y + 1 ? 0.15 : 0), 0, 0.999));
      L.dot(x - r, y + Math.round(fh / 2), bolt, 2); L.dot(x + r - 1, y + Math.round(fh / 2), bolt, 1);
    }
  }
  // a slack pipe: a fat line with a lit top and flanges at its joints
  function pipeSlack(L, pts, r, M, lit) {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      L.seg(a[0], a[1], b[0], b[1], r * 2, M, 1 + (lit || 0));
      L.seg(a[0], a[1] - r * 0.35, b[0], b[1] - r * 0.35, Math.max(1, r * 1.1), M, 3 + (lit || 0));
      L.seg(a[0] - 1, a[1] - r * 0.7, b[0] - 1, b[1] - r * 0.7, 1, M, 5);
      if (i % 2 === 0) L.ell(a[0], a[1], r * 1.35, r * 1.35, M, 2 + (lit || 0));
    }
  }
  // still water: shimmer dashes drifting very slowly; warm: a lamp's reflection column [x, half-width]
  function stillWater(c, x0, y0, w, h, t, still, seed, warm, cool) {
    const rnd = P().rnd(seed || 41), H = Math.max(1, h);
    for (let n = 0; n < (w * h) / 480; n++) {
      const d = Math.pow(rnd(), 1.2), y = Math.round(y0 + d * H);
      const len = 2 + Math.round(d * 10), xr = rnd() * (w + 40), sp = 0.003 + d * 0.006;
      const x = Math.round(x0 + ((((xr + (still ? 0 : t * sp)) % (w + 40)) + w + 40) % (w + 40)) - 20);
      const a = still ? 0.22 : 0.1 + 0.18 * ((Math.sin(t / 1300 + n * 1.3) + 1) / 2);
      const near = warm && Math.abs(x - warm[0]) < warm[1] * (0.35 + d);
      c.fillStyle = (near ? 'rgba(255,212,140,' : cool ? 'rgba(' + cool + ',' : 'rgba(140,182,204,') + (near ? Math.min(0.9, a * 2.4) : a).toFixed(2) + ')';
      c.fillRect(x, y, len, 1);
    }
  }
  // rings on still water: k 0..1 across the spread; n rings, the later ones fainter; clipTop: none above it
  function rings(c, cx, cy, k, n, rmax, flat, col, a0, clipTop) {
    for (let i = 0; i < n; i++) {
      const kk = clamp(k * 1.25 - i * 0.12, 0, 1);
      if (kk <= 0 || kk >= 1) continue;
      const rx = Math.max(2, Math.round(rmax * ease(kk))), ry = Math.max(1, Math.round(rx * flat));
      const a = (a0 == null ? 0.5 : a0) * (1 - kk) * (1 - i * 0.18);
      if (a <= 0.02) continue;
      c.fillStyle = 'rgba(' + (col || '190,220,230') + ',' + a.toFixed(2) + ')';
      const top = clipTop == null ? -1e9 : clipTop;
      for (let x = -rx; x <= rx; x += 1) {
        const y = Math.round(ry * Math.sqrt(Math.max(0, 1 - (x / rx) * (x / rx))));
        if (cy + y >= top) c.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
        if (cy - y >= top && (x & 1)) c.fillRect(Math.round(cx + x), Math.round(cy - y), 1, 1);
      }
    }
  }
  // a pulse of pale light travelling along a polyline (u 0..1 along it; len a fraction of it)
  function pulse(c, pts, u, len, a, wd) {
    let tot = 0;
    const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    const a0 = (u - len) * tot, a1 = u * tot;
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = seg[i - 1];
      for (let j = 0; j <= d; j += 1) {
        const at = acc + j;
        if (at < a0 || at > a1) continue;
        const f = (at - a0) / Math.max(1, a1 - a0);
        const x = pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * j) / Math.max(1, d), y = pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * j) / Math.max(1, d);
        c.fillStyle = 'rgba(218,228,255,' + (a * (0.3 + 0.7 * f)).toFixed(2) + ')';
        c.fillRect(Math.round(x - (wd || 1) / 2), Math.round(y), wd || 1, 1);
      }
      acc += d;
    }
  }
  // a reflection below axis y: src's rows mirrored, broken into strips, fading with depth
  function reflect(g, src, sx, sy, sw, sh, axis, depth, tint, t, still, amp) {
    for (let y = 0; y < depth; y += 1) {
      if ((y % 3) !== 0) continue;
      const srcY = sy + sh - 1 - y;
      if (srcY < sy) break;
      const wob = still ? 0 : Math.round(Math.sin((t || 0) / 420 + y * 0.6) * (amp || 1));
      g.globalAlpha = 0.42 * (1 - y / depth);
      g.drawImage(src, sx, srcY, sw, 1, sx + wob, axis + y, sw, 1);
    }
    g.globalAlpha = 1;
    if (tint) { g.fillStyle = tint; g.fillRect(sx, axis, sw, depth); }
  }
  // the lamp's glow where you stand, warm against the chamber's blue
  function lampGlow(c, x, y, r, t, still, a) {
    const fl = still ? 0.9 : 0.86 + 0.08 * Math.sin(t / 370) + 0.04 * Math.sin(t / 97);
    c.globalAlpha = fl; P().halo(c, x, y, r, '255,200,120', a || 0.22, 5); c.globalAlpha = 1;
  }
  // motes of light rising in a conduit (the old Hush's way of carrying words up; a few, slow)
  function motesUp(c, x, y0, y1, t, still, n, seed) {
    if (still) return;
    for (let i = 0; i < (n || 3); i++) {
      const f = ((t / (2600 + i * 400)) + hashf(i, seed || 0, 3)) % 1;
      c.fillStyle = 'rgba(200,210,255,' + (0.6 - f * 0.5).toFixed(2) + ')';
      c.fillRect(Math.round(x), Math.round(lerp(y1, y0, f)), 1, 2);
    }
  }
  // you and your companion side by side (only a companion who is here); returns where they stand
  function pair(c, st, x, y, sc, dir, keys, grade, gap) {
    const comp = st.cast.comp, out = [];
    const fp = Q.figure(st.cast.pc, dir, (keys && keys.pc) || 'i0', sc, grade);
    const fc = comp ? Q.figure(comp.look, dir, (keys && keys.comp) || 'i0', sc, grade) : null;
    const x0 = x - (fc ? gap : 0), x1 = x + gap;
    c.fillStyle = 'rgba(4,8,14,0.5)';
    if (fp) { P().disc(c, x0, y, Math.round(fp.w * 0.26), Math.max(1, Math.round(fp.h * 0.03))); c.drawImage(fp.cv, x0 - fp.ax, y - fp.ay); out.push({ x: x0, f: fp }); }
    if (fc) { P().disc(c, x1, y, Math.round(fc.w * 0.26), Math.max(1, Math.round(fc.h * 0.03))); c.drawImage(fc.cv, x1 - fc.ax, y - fc.ay); out.push({ x: x1, f: fc }); }
    return out;
  }

  // ---- bell · 1: the bell, from below -------------------------------------------------------------------------
  function geomBell(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const land = lay === 'land', narrow = lay === 'narrow';
    // the eye low at the water; the platform's front edge above it (its top out of sight), people behind the edge
    const yW = Math.round(land ? vb + s(4) : vb * (narrow ? 0.86 : 0.88));
    const yPt = yW - Math.max(4, s(narrow ? 22 : 16));
    const cx = Math.round(w * 0.5);
    const lipY = land ? Math.round(vb - 4) : yPt - s(narrow ? 54 : 40);
    const H = Math.round(clamp(Math.min(lipY * (land ? 1.02 : narrow ? 0.9 : 1), (w * (narrow ? 0.88 : 0.8)) / (bellHw(1) * 2)), 30, 420));
    const sc = clamp(S.Z * (narrow ? 0.86 : 0.68), 0.4, 1);
    return Object.assign(S, { land, narrow, yW, yPt, cx, lipY, H, sc });
  }
  function bellStatic(G) {
    return cached('ch5.bell|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, cx, yW, yPt, H, lipY } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P();
      const L = p.layer(w, h), stone = p.mat(STONE, { n: 8, at: 3, step: 0.06 });
      // the far wall rising into the dark; the lamp's light warms the courses near it
      const lx = cx, ly = yPt - s(16), lr = s(G.narrow ? 260 : 230);
      blocks(L, 0, 0, w, yW, s, stone, (x, y) => clamp(0.3 * (1 - Math.hypot(x - lx, (y - ly) * 1.3) / lr) - (1 - y / yW) * 0.12, -0.16, 0.34), 7, true);
      // pillars standing in the water, framing it
      for (const fx of G.narrow ? [0.05, 0.95] : [0.16, 0.84]) {
        const px = Math.round(w * fx), pw = Math.max(10, s(G.narrow ? 30 : 40));
        L.rect(px - pw / 2, 0, pw, yW, stone, (x, y) => clamp(0.28 + (x < px - pw * 0.1 ? 0.14 : -0.1) + ((Math.round(y) % Math.max(8, s(34))) < 1 ? -0.2 : 0) + 0.18 * (1 - Math.hypot(x - lx, y - ly) / lr), 0, 0.999));
      }
      // the conduits climbing the walls at each side
      for (const fx of G.narrow ? [0.18, 0.82] : [0.05, 0.95]) pipeUp(L, Math.round(w * fx), 0, yW, Math.max(3, s(8)), s, -0.05);
      L.outline();
      g.fillStyle = '#06080f'; g.fillRect(0, 0, w, h);
      g.drawImage(L.canvas(), 0, 0);
      // the dark falling from the vault above
      for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(4,6,12,0.16)'; g.fillRect(0, 0, w, Math.round(yW * (0.55 - i * 0.12))); }
      // the water toward us
      Q.bandsIn(g, 0, yW, w, h - yW, WATER, 0.45);
      return { cv };
    });
  }
  // the platform's front face (drawn over the people's feet: we look up at its edge from the water), with the
  // keeper's slack pipes draped over it into the water
  function bellFront(G) {
    return cached('ch5.bellF|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, cx, yW, yPt } = G, p = P(), rnd = p.rnd(4242);
      const L = p.layer(w, h), ps = p.mat('#4e5470', { n: 7, at: 3, step: 0.075 });
      const p0 = Math.round(w * (G.narrow ? 0.02 : 0.2)), p1 = Math.round(w * (G.narrow ? 0.98 : 0.8));
      for (let x = p0; x < p1;) { const bw = s(30) + Math.floor(rnd() * s(18)); L.stone([[x, yPt], [Math.min(p1, x + bw), yPt], [Math.min(p1, x + bw), yW], [x, yW]], ps, { face: 2, bevel: Math.max(1, s(2)) }); x += bw; }
      // its edge, catching the lamp
      L.rect(p0, yPt, p1 - p0, Math.max(1, s(2)), ps, (x) => clamp(0.9 - Math.abs(x - cx) / w * 0.9, 0.3, 0.999));
      const pm = p.mat(PIPE, { n: 7, at: 3, step: 0.085 }), r = Math.max(2, s(G.narrow ? 7 : 5));
      pipeSlack(L, [[p0 + s(30), yPt - s(2)], [p0 + s(36), yPt + s(8)], [p0 + s(22), yW - s(2)], [p0 - s(20), yW + s(6)], [p0 - s(70), yW + s(4)]], r, pm, 0);
      pipeSlack(L, [[p1 - s(46), yPt - s(1)], [p1 - s(40), yPt + s(10)], [p1 - s(52), yW], [p1 + s(10), yW + s(10)], [p1 + s(60), yW + s(8)]], r, pm, 0);
      pipeSlack(L, [[cx + s(64), yPt - s(1)], [cx + s(70), yW - s(4)], [cx + s(110), yW + s(12)]], Math.max(2, r - 1), pm, 0);
      L.outline();
      const cv = L.canvas(), g = cv.getContext('2d');
      // the wet foot of the stone, the water's dark line
      g.fillStyle = 'rgba(6,12,18,0.6)'; g.fillRect(p0, yW - Math.max(1, s(3)), p1 - p0, Math.max(1, s(3)));
      return cv;
    });
  }
  const bellShot = {
    phases: [['light', 1400]],
    safe: { wide: 'the bell top-centre, the two of you above the sheet', narrow: 'the bell in the upper half, the platform under it', land: 'the bell' },
    draw(c, w, h, t, st) {
      const G = geomBell(w, h, st.vb), { s, cx, lipY, H, yW, yPt } = G, still = st.still;
      c.drawImage(bellStatic(G).cv, 0, 0);
      for (const fx of G.narrow ? [0.18, 0.82] : [0.05, 0.95]) motesUp(c, Math.round(w * fx) - Math.max(1, s(3)), 0, yW, t, still, 3, fx * 10);
      lampGlow(c, cx, yPt - s(20), s(G.narrow ? 130 : 96), t, still, 0.14);
      const b = bellArt(H, 'patina', 0.2);
      // the lamp below warms its lower half, in three steps
      const y0b = b.y0;
      const lit = litCopy(b.cv, 'bell|' + H, [[y0b + H * 0.5, y0b + H * 0.7, 'rgba(255,186,104,0.07)'], [y0b + H * 0.7, y0b + H * 0.86, 'rgba(255,186,104,0.13)'], [y0b + H * 0.86, b.h, 'rgba(255,196,118,0.22)']]);
      const bx = cx - b.ax, by = lipY - b.lipY;
      c.drawImage(lit, bx, by);
      // the slow light across its face (only over the bell's own pixels); the relief it leaves standing out
      const k = st.at('light');
      if (k > 0) {
        const band = lerp(-b.lipR * 0.4, b.w + b.lipR * 0.4, ease(k));
        if (k < 1) {
          const sc2 = Q.small('ch5.bandbuf|' + b.w + 'x' + b.h, () => mk(b.w, b.h));
          const bg = sc2.getContext('2d');
          bg.clearRect(0, 0, b.w, b.h); bg.drawImage(lit, 0, 0); bg.globalCompositeOperation = 'source-atop';
          bg.fillStyle = 'rgba(196,232,224,0.22)'; bg.fillRect(Math.round(band - b.lipR * 0.24), 0, Math.round(b.lipR * 0.48), b.h);
          bg.fillStyle = 'rgba(220,244,238,0.2)'; bg.fillRect(Math.round(band - b.lipR * 0.09), 0, Math.round(b.lipR * 0.18), b.h);
          bg.globalCompositeOperation = 'source-over';
          c.drawImage(sc2, bx, by);
          reliefLight(c, b, bx, by, band, 1, false);
        }
        reliefLight(c, b, bx, by, null, 0.6 * clamp((k - 0.2) / 0.8, 0, 1), true);
      }
      // the lamp where you stand: you are dark against its light
      lampGlow(c, cx, yPt - s(18), s(G.narrow ? 70 : 54), t, still, 0.34);
      // the two of you on the platform, your feet hidden by its edge, looking up at it
      if (!G.land) pair(c, st, cx, yPt + Math.max(2, s(5)), G.sc, 'up', null, HALL, Math.round(s(G.narrow ? 13 : 11)));
      c.drawImage(bellFront(G), 0, 0);
      // the water: the lamp's reflection under you, shimmer, a drop from the platform's edge now and then
      stillWater(c, 0, yW + 1, w, h - yW, t, still, 77, [cx, s(26)]);
      if (!still) { const f = (t / 3400) % 1; if (f < 0.25) { c.fillStyle = 'rgba(200,224,232,0.7)'; c.fillRect(cx + s(52), Math.round(lerp(yPt + s(2), yW + s(8), (f / 0.25) ** 2)), 1, 2); } else rings(c, cx + s(52), yW + s(8), (f - 0.25) / 0.75, 2, s(24), 0.2, '200,224,232', 0.5, yW); }
      vignette(c, w, h, 0.5, 0.6);
    },
    focus(w, h, vb) { const G = geomBell(w, h, vb), b = bellArt(G.H, 'patina', 0.2); const y0 = Math.max(0, G.lipY - b.lipY + b.y0 + Math.round(G.H * 0.12)); const y1 = G.land ? Math.min(vb, G.lipY + b.ry) : G.yPt; return { x: Math.round(G.cx - b.lipR), y: y0, w: Math.round(b.lipR * 2), h: y1 - y0 }; },
  };

  // ---- bell · 2: GONNNG — the lip close, the water, the foot of a pipe ------------------------------------------
  function geomGong(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const land = lay === 'land', narrow = lay === 'narrow';
    const yW = Math.round(land ? vb - Math.max(4, s(8)) : vb * (narrow ? 0.66 : 0.74));      // the water's surface
    const lipY = Math.round(yW - (land ? Math.max(14, vb * 0.3) : vb * (narrow ? 0.14 : 0.2)));
    const lipW = land ? w * 0.62 : narrow ? w * 1.06 : w * 0.82;                          // a big bell: only its lower part shows
    const H = Math.round(lipW / (bellHw(1) * 2));
    const cx = Math.round(w * (narrow ? 0.45 : 0.44));
    const px = Math.round(w * (narrow ? 0.9 : land ? 0.9 : 0.9)), pr = Math.max(5, s(narrow ? 18 : 15));
    return Object.assign(S, { land, narrow, yW, lipY, H, cx, px, pr });
  }
  function gongStatic(G) {
    return cached('ch5.gong|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, yW, px, pr, cx } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P();
      const L = p.layer(w, h), stone = p.mat(STONE, { n: 8, at: 3, step: 0.06 });
      blocks(L, 0, 0, w, yW, s, stone, (x, y) => clamp(0.22 * (1 - Math.hypot(x - cx, (y - yW) * 1.6) / (w * 0.7)) - 0.04, -0.16, 0.3), 13, true);
      // the platform's stone at the waterline behind the bell
      const ps = p.mat('#4e5470', { n: 7, at: 3 });
      L.rect(0, yW - s(12), w, s(12), ps, (x, y) => clamp((y < yW - s(11) ? 0.7 : 0.38) + 0.2 * (1 - Math.abs(x - cx) / w), 0, 0.999));
      pipeUp(L, px, 0, yW + s(8), pr, s, 0.06, s(90));
      L.outline();
      g.fillStyle = '#06080f'; g.fillRect(0, 0, w, h);
      g.drawImage(L.canvas(), 0, 0);
      for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(4,6,12,0.16)'; g.fillRect(0, 0, w, Math.round(yW * (0.4 - i * 0.1))); }
      Q.bandsIn(g, 0, yW, w, h - yW, WATER, 0.45);
      return { cv };
    });
  }
  // the green flakes shaken off the lip at the stroke, falling into the water
  function flakes(c, G, b, k, t) {
    const { cx, lipY, yW } = G, rnd = P().rnd(606);
    for (let i = 0; i < 16; i++) {
      const u = rnd() * 2 - 1, x = cx + u * b.lipR * 0.95, y0 = lipY - rnd() * G.H * 0.12, d = rnd() * 0.3;
      const f = clamp((k - 0.2 - d) / 0.45, 0, 1);
      if (f <= 0 || f >= 1) continue;
      const y = lerp(y0, yW + 2, f * f);
      c.fillStyle = i % 3 ? '#6e9a80' : '#9cc2aa';
      c.fillRect(Math.round(x + Math.sin(f * 6 + i) * 2), Math.round(y), 2, 1);
    }
    void t;
  }
  const gong = {
    phases: [['swing', 1400], ['climb', 1000]],
    safe: { wide: 'the lip and the rings in the band above the sheet', narrow: 'the lip over the water, the pipe at the side', land: 'the lip and the first rings' },
    draw(c, w, h, t, st) {
      const G = geomGong(w, h, st.vb), { s, yW, lipY, H, cx, px, pr } = G, still = st.still;
      c.drawImage(gongStatic(G).cv, 0, 0);
      motesUp(c, px - Math.round(pr * 0.4), 0, yW, t, still, 2, 5);
      const ks = st.at('swing'), kc = st.at('climb');
      // the water's shimmer, then the rings going out from under the bell
      stillWater(c, 0, yW + 1, w, h - yW, t, still, 19, [cx, s(40)]);
      if (ks > 0 && ks < 1) rings(c, cx, yW + s(10), ks, 4, Math.max(w * 0.75, s(300)), 0.14, '200,226,236', 0.75, yW);
      if (ks >= 1 && !still) { rings(c, cx, yW + s(10), ((t / 2800) % 1), 2, w * 0.6, 0.14, '200,226,236', 0.2, yW); rings(c, cx, yW + s(10), ((t / 2800 + 0.5) % 1), 1, w * 0.4, 0.14, '200,226,236', 0.14, yW); }
      // the bell: one swing on its beam (the shake of the stone, shown as the bell's own movement), the clapper
      // lagging behind it and striking the lip
      const struck = ks > 0.2;
      const b = bellArt(H, struck ? 'struck' : 'patina', 0.07, true);
      const ang = still ? 0 : 0.03 * Math.sin(Math.PI * 2 * 1.25 * ks) * (1 - ks) ** 1.3;
      const pivY = lipY - b.lipY;
      const bobOff = still || ks >= 1 ? 0 : Math.round(-Math.sin(Math.PI * 2 * 1.25 * ks - 0.9) * (1 - ks) * b.lipR * 0.22);
      // its reflection, broken by the rings (drawn first, under the water's own light)
      const refl = Q.small('ch5.gref|' + b.w + 'x' + b.h, () => mk(b.w, b.h));
      const rg = refl.getContext('2d'); rg.clearRect(0, 0, b.w, b.h); rg.drawImage(b.cv, 0, 0);
      c.save(); c.beginPath(); c.rect(0, yW + 1, w, h - yW); c.clip();
      reflect(c, refl, 0, 0, b.w, b.lipY + b.ry, yW + s(2), Math.min(h - yW, Math.round(b.H * 0.35)), null, t, still, ks > 0 && kc < 1 ? 3 : 1);
      c.restore();
      c.save(); c.translate(cx, pivY); c.rotate(ang);
      c.drawImage(b.cv, -b.ax, 0);
      const cl = clapper(b.bob, bobOff);
      c.drawImage(cl.cv, -cl.ax, b.lipY - b.ry - cl.ay + b.bob);
      c.restore();
      if (ks > 0) flakes(c, G, b, ks, t);
      // the sound starting up the pipe: a pale line rising from the water
      if (kc > 0) {
        const lx = px - Math.round(pr * 0.35);
        pulse(c, [[lx, yW + s(6)], [lx, -s(10)]], clamp(kc * 1.1, 0, 1), 0.55, 0.95, Math.max(2, Math.round(pr * 0.35)));
        if (kc >= 1) { c.fillStyle = 'rgba(214,224,255,0.2)'; c.fillRect(lx - Math.round(pr * 0.17), 0, Math.max(2, Math.round(pr * 0.35)), yW + s(6)); motesUp(c, lx, 0, yW, t, still, 4, 9); }
        // where the rings touch the stone, a pale edge
        c.fillStyle = 'rgba(200,226,236,' + (0.35 * ease(clamp(kc * 2, 0, 1))).toFixed(2) + ')'; c.fillRect(0, yW - 1, w, 1);
      }
      vignette(c, w, h, 0.45, 0.8);
    },
    focus(w, h, vb) { const G = geomGong(w, h, vb), b = bellArt(G.H, 'patina', 0.07, true); const top = Math.max(0, G.lipY - Math.round(G.H * 0.16)); const x0 = Math.max(0, Math.round(G.cx - b.lipR * 0.85)), x1 = Math.min(w, Math.round(G.cx + b.lipR * 0.85)); return { x: x0, y: top, w: x1 - x0, h: Math.min(vb, G.yW + G.s(4)) - top }; },
  };

  // ---- bell · 3: towards the town — from a window high in the tower, at dusk ------------------------------------
  function geomTown(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const land = lay === 'land', narrow = lay === 'narrow';
    // the window's opening (a round-headed arch in a thick wall) and the far shore in it
    const win = narrow ? { x: Math.round(w * 0.24), y: Math.round(vb * 0.06), w: Math.round(w * 0.7), h: Math.round(vb * 0.84) }
      : land ? { x: Math.round(w * 0.22), y: 1, w: Math.round(w * 0.74), h: Math.round(vb + s(20)) }
      : { x: Math.round(w * 0.26), y: Math.round(vb * 0.05), w: Math.round(w * 0.64), h: Math.round(vb * 0.9) };
    const yH = Math.round(win.y + win.h * (narrow ? 0.36 : land ? 0.5 : 0.44));       // the far shore
    const pipes = narrow ? [Math.round(w * 0.07), Math.round(w * 0.17)] : [Math.round(w * 0.08), Math.round(w * 0.17)];
    return Object.assign(S, { land, narrow, win, yH, pipes });
  }
  // the town across the lake: rows of houses up the shore, roofs, the records hall's tower, an arched bridge over a
  // canal's mouth; its windows (each with the order in which it lights: the near rows first, outward)
  function townLayer(G) {
    return cached('ch5.townL|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, win, yH } = G, p = P(), rnd = p.rnd(3131);
      const L = p.layer(w, h);
      const roof = p.mat('#46447a', { n: 6, at: 3, step: 0.08 }), wall = p.mat('#c4b8d4', { n: 6, at: 3, step: 0.07 }), dark = p.mat('#2a2846', { n: 4, at: 2 }), emb = p.mat('#8a82a0', { n: 5, at: 2 });
      const wins = [];
      const x0 = win.x - s(6), x1 = win.x + win.w + s(6);
      // the embankment along the water, a canal's mouth with an arched bridge
      L.rect(x0, yH + s(2), x1 - x0, s(6), emb, (x, y) => (y < yH + s(3) ? 0.75 : 0.4));
      const kx = Math.round(win.x + win.w * 0.3), kw = s(26);
      // a canal's mouth through the embankment; the arched bridge over it
      L.rect(kx, yH + s(1), kw, s(7), p.mat('#24244a', { n: 3, at: 1 }), 1);
      L.rect(kx - s(4), yH - s(2), kw + s(8), Math.max(2, s(3)), emb, 4);
      L.fill(kx, yH + 1, kx + kw, yH + s(8), (x, y) => y > yH + 1 && ((x - kx - kw / 2) / (kw / 2)) ** 2 + ((y - yH - s(8)) / s(6)) ** 2 > 1, emb, 2);
      for (let row = 0; row < 4; row++) {
        const sc = [0.5, 0.66, 0.84, 1.04][row], yb = yH - s(2) - (3 - row) * s(9), hh = Math.round(s(15) * sc), rh = Math.round(s(9) * sc);
        for (let x = x0 + Math.floor(rnd() * s(12)); x < x1;) {
          const bw = Math.round(s(20 + rnd() * 18) * sc), yy = yb - Math.round(rnd() * s(3));
          if (row === 3 && x + bw > kx - s(2) && x < kx + kw + s(2)) { x = kx + kw + s(4); continue; }
          L.rect(x, yy - hh, bw, hh, wall, (xx, y) => clamp(0.3 + row * 0.04 + (xx < x + Math.max(2, bw * 0.2) ? 0.2 : 0) - (y - (yy - hh)) / hh * 0.12, 0, 0.999));
          L.poly([[x - Math.round(s(2) * sc), yy - hh + 1], [x + bw / 2, yy - hh - rh], [x + bw + Math.round(s(2) * sc), yy - hh + 1]], roof, (xx, y) => clamp(0.42 + row * 0.04 + (xx < x + bw / 2 ? 0.2 : -0.08) + ((Math.round(y) % 2) ? 0 : -0.06), 0, 0.999));
          const ww = Math.max(1, Math.round(s(2.4) * sc)), wh = Math.max(1, Math.round(s(3.4) * sc));
          for (let wx = x + Math.max(2, Math.round(s(4) * sc)); wx < x + bw - ww - 1; wx += Math.max(4, Math.round(s(7) * sc))) {
            const wy = yy - Math.round(hh * 0.6);
            L.rect(wx, wy, ww, wh, dark, 1);
            wins.push([wx, wy, ww, wh, row, x]);
          }
          x += bw + Math.round(rnd() * s(5));
        }
      }
      // the records hall's tower over the roofs
      const tx = Math.round(win.x + win.w * 0.64), tw = s(14), th = s(48);
      L.rect(tx, yH - th, tw, th - s(10), wall, (xx) => (xx < tx + Math.max(2, s(4)) ? 0.62 : 0.36));
      L.poly([[tx - s(3), yH - th + 1], [tx + tw / 2, yH - th - s(14)], [tx + tw + s(3), yH - th + 1]], roof, (xx) => (xx < tx + tw / 2 ? 0.62 : 0.34));
      wins.push([tx + Math.round(tw * 0.3), yH - th + s(8), Math.max(2, s(4)), Math.max(2, s(6)), 1, tx]);
      L.outline();
      const nx = (x) => Math.abs(x - (win.x + win.w * 0.3)) / Math.max(1, win.w);
      for (const wv of wins) wv.push(clamp((3 - wv[4]) * 0.17 + nx(wv[5]) * 0.55 + rnd() * 0.1, 0, 1));
      return { cv: L.canvas(), wins };
    });
  }
  function townStatic(G) {
    return cached('ch5.town|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, win, yH, pipes } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(919);
      // the dusk in the window: the sky deepening upward, the last warmth low over the hills
      Q.bandsIn(g, win.x, win.y, win.w, yH - win.y, ['#1e2048', '#2a2a5a', '#3e386c', '#5a4a78', '#7e5e84', '#a47088', '#c88a88', '#e0a688'], 0.45);
      for (let i = 0; i < 14; i++) R(g, win.x + Math.round(rnd() * win.w), win.y + Math.round(rnd() * (yH - win.y) * 0.4), 1, 1, 'rgba(240,232,255,0.7)');
      for (let x = win.x; x < win.x + win.w; x++) { const v = Math.sin(x / (w * 0.09) + 1.2) * 0.6 + Math.sin(x / (w * 0.031)) * 0.4; const t1 = Math.round(yH - s(36) - s(10) * (0.5 + v * 0.5)); R(g, x, t1, 1, yH - t1, '#3a3458'); R(g, x, t1, 1, 1, '#5a4a6e'); }
      // the lake: the sky's colours in it, darker toward us
      Q.bandsIn(g, win.x, yH + s(8), win.w, win.y + win.h - yH - s(8), ['#8a6a86', '#6a5680', '#4e4674', '#3a3864', '#2c2c54', '#22244a'], 0.4);
      const T = townLayer(G);
      g.drawImage(T.cv, 0, 0);
      // the town in the water, broken
      reflect(g, T.cv, win.x, yH - s(48), win.w, s(48) + s(8), yH + s(8), Math.round(s(30)), 'rgba(40,36,80,0.25)', 0, true, 0);
      // the pipeline from under this window across the lake to the town, on low trestles
      const L2 = p.layer(w, h), pm = p.mat(PIPE, { n: 7, at: 3, step: 0.085 });
      const x0 = win.x - s(10), x1 = win.x + win.w * 0.36, y0 = win.y + win.h + s(4), y1 = yH + s(10);
      const lineY = (x) => lerp(y0, y1, Math.pow(clamp((x - x0) / (x1 - x0), 0, 1), 0.55));
      const lw = (x) => Math.max(1, lerp(s(10), 1, Math.pow(clamp((x - x0) / (x1 - x0), 0, 1), 0.5)));
      const pts = [];
      for (let x = x0; x <= x1; x += Math.max(2, s(4))) pts.push([x, lineY(x), lw(x)]);
      L2.path(pts, 2, pm, 3);
      for (let x = x0 + s(20); x < x1; x += Math.max(6, s(30) * (1 - (x - x0) / (x1 - x0)) + s(6))) L2.rect(x, lineY(x), Math.max(1, lw(x) * 0.3), Math.max(1, lw(x) * 0.9), pm, 1);
      L2.outline();
      g.save(); g.beginPath(); g.rect(win.x, win.y, win.w, win.h); g.clip(); g.drawImage(L2.canvas(), 0, 0); g.restore();
      // the thick wall around the window: a round-headed arch, the reveal lit by the dusk, the sill
      const W2 = p.layer(w, h), st = p.mat('#3e4460', { n: 8, at: 3, step: 0.06 });
      blocks(W2, 0, 0, w, h, s, st, (x, y) => clamp(0.16 * (1 - Math.hypot(x - (win.x + win.w / 2), y - (win.y + win.h * 0.6)) / (w * 0.6)) - 0.04, -0.16, 0.2), 29, true);
      const ar = win.w / 2, acx = win.x + ar, arcY = win.y + Math.round(Math.min(ar, win.h * 0.4));
      const inWin = (x, y) => x >= win.x && x < win.x + win.w && y < win.y + win.h && (y >= arcY || ((x - acx) / ar) ** 2 + ((y - arcY) / (arcY - win.y)) ** 2 <= 1);
      W2.erase(win.x, win.y, win.x + win.w, win.y + win.h, inWin);
      // the right-hand reveal of the wall's thickness, warm with the last light
      const rv = Math.max(4, s(18));
      W2.fill(win.x + win.w - rv, win.y, win.x + win.w, win.y + win.h, (x, y) => inWin(x, y) && x > win.x + win.w - rv * (1 - Math.max(0, (arcY - y) / (arcY - win.y)) * 0.6), p.mat('#7a6a84', { n: 6, at: 3 }), (x, y) => clamp(0.6 - (x - (win.x + win.w - rv)) / rv * 0.3, 0, 0.999));
      W2.rect(win.x - s(8), win.y + win.h, win.w + s(16), Math.max(4, s(10)), st, (x, y) => (y < win.y + win.h + 1 ? 0.9 : y < win.y + win.h + s(3) ? 0.6 : 0.36));
      // the conduits climbing the wall beside the window; the near one bends out through the sill to the lake
      for (const [i, x] of pipes.entries()) pipeUp(W2, x, 0, h, Math.max(4, s(i ? 9 : 13)), s, 0.08, s(70));
      const pm2 = p.mat(PIPE, { n: 7, at: 3, step: 0.085 }), rr = Math.max(3, s(9));
      W2.seg(pipes[1], win.y + win.h + s(16), win.x + s(6), win.y + win.h + s(16), rr * 2, pm2, 2);
      W2.seg(pipes[1], win.y + win.h + s(16) - rr * 0.35, win.x + s(6), win.y + win.h + s(16) - rr * 0.35, rr, pm2, 4);
      W2.outline();
      g.drawImage(W2.canvas(), 0, 0);
      return { cv, pts: pts.map(([x, y]) => [x, y - 1]) };
    });
  }
  const town = {
    phases: [['pulses', 1200], ['turn', 1500]],
    safe: { wide: 'the pipes at the left, the town in the window above the sheet', narrow: 'the pipes upright, the town above the sheet', land: 'the window: the town and the pipes' },
    draw(c, w, h, t, st) {
      const G = geomTown(w, h, st.vb), { s, win, yH, pipes } = G, still = st.still;
      const S0 = townStatic(G), T = townLayer(G);
      c.drawImage(S0.cv, 0, 0);
      const kp = st.at('pulses'), kt = st.at('turn');
      c.save(); c.beginPath(); c.rect(win.x, win.y, win.w, win.h); c.clip();
      stillWater(c, win.x, yH + s(9), win.w, win.y + win.h - yH - s(9), t, still, 61, null, '200,176,210');
      // the windows of the town, lit street by street as the voices come down to it; their light in the water
      const lit = ease(kt);
      for (const [x, y, ww, wh, row, , ord] of T.wins) {
        if (lit <= ord) continue;
        const fl = still ? 1 : 0.88 + 0.12 * Math.sin(t / 700 + x * 0.7);
        c.fillStyle = 'rgba(255,212,128,' + (0.95 * fl).toFixed(2) + ')'; c.fillRect(x, y, ww, wh);
        if (row >= 2) { c.fillStyle = 'rgba(255,200,120,' + (0.3 * fl).toFixed(2) + ')'; c.fillRect(x, yH + s(9) + Math.round((yH - y) * 0.7), ww, Math.max(1, s(2))); }
      }
      c.restore();
      // the pulses: up the two pipes beside us; then turning, down and out along the pipeline to the town
      const up = (x) => [[x - 1, h + s(4)], [x - 1, -s(8)]];
      if (kp > 0 && kt <= 0) for (let i = 0; i < 2; i++) { const u = clamp(kp * 1.3 - i * 0.3, 0, 1); if (u > 0 && u < 1) pulse(c, up(pipes[i]), u, 0.35, 0.95, Math.max(2, s(5))); }
      if (kt > 0) {
        const down = (x) => [[x - 1, -s(8)], [x - 1, win.y + win.h + s(16)]];
        for (let i = 0; i < 2; i++) { const u = clamp(kt * 2.4 - i * 0.25, 0, 1); if (u > 0 && u < 1) pulse(c, down(pipes[i]), u, 0.35, 0.95, Math.max(2, s(5))); }
        c.save(); c.beginPath(); c.rect(win.x, win.y, win.w, win.h); c.clip();
        const u2 = clamp((kt - 0.3) / 0.5, 0, 1);
        if (u2 > 0 && u2 < 1) pulse(c, S0.pts, u2, 0.4, 0.9, Math.max(1, s(3)));
        if (kt >= 1 && !still) pulse(c, S0.pts, (t / 3600) % 1, 0.16, 0.45, Math.max(1, s(2)));
        c.restore();
      }
      if (kt >= 1) for (const x of pipes) { c.fillStyle = 'rgba(214,224,255,0.1)'; c.fillRect(x - Math.max(1, s(2)), 0, Math.max(2, s(4)), h); }
      vignette(c, w, h, 0.4, 0.5);
    },
    focus(w, h, vb) { const G = geomTown(w, h, vb); const x0 = Math.max(0, G.pipes[0] - G.s(14)); const y0 = Math.max(0, G.yH - G.s(70)); return { x: x0, y: y0, w: Math.round(G.win.x + G.win.w - x0), h: Math.min(vb, G.yH + G.s(14)) - y0 }; },
  };

  // ---- bell · 4: "…It rang. At last." — the chamber from across the water, three-quarter ----------------------------
  function geomHall(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const land = lay === 'land', narrow = lay === 'narrow';
    // the platform's near corner (where the two of you stand), its edges running back left and right
    const nc = narrow ? [Math.round(w * 0.6), Math.round(vb * 0.74)] : land ? [Math.round(w * 0.6), Math.round(vb + s(10))] : [Math.round(w * 0.5), Math.round(vb * 0.8)];
    const yBack = Math.round(narrow ? vb * 0.5 : land ? vb * 0.58 : vb * 0.56);
    const cxB = Math.round(narrow ? w * 0.36 : land ? w * 0.34 : w * 0.3);
    const H = Math.round(clamp(narrow ? w * 0.4 : land ? vb * 0.9 : vb * 0.48, 30, 220));
    const lipY = Math.round(narrow ? yBack - s(14) : land ? yBack + s(6) : yBack - s(8));
    const sc = clamp(S.Z * (land ? 1.8 : narrow ? 0.95 : 0.82), 0.45, 1);
    // where the voice's ring shows on the water: right of the corner, toward us
    const rv = narrow ? [Math.round(w * 0.42), Math.round(vb * 0.9)] : land ? [Math.round(w * 0.84), Math.round(vb * 0.8)] : [Math.round(w * 0.74), Math.round(vb * 0.9)];
    return Object.assign(S, { land, narrow, nc, yBack, cxB, H, lipY, sc, rv });
  }
  function hallStatic(G) {
    return cached('ch5.hall|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, nc, yBack, cxB } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P();
      const L = p.layer(w, h), stone = p.mat(STONE, { n: 8, at: 3, step: 0.06 });
      const wallB = yBack - s(16);
      blocks(L, 0, 0, w, wallB + s(4), s, stone, (x, y) => clamp(0.26 * (1 - Math.hypot(x - cxB, (y - yBack) * 1.4) / (w * 0.6)) - 0.02, -0.16, 0.3), 31, true);
      for (const fx of G.narrow ? [0.08, 0.92] : [0.62, 0.9]) {
        const px = Math.round(w * fx), pw = Math.max(10, s(34));
        L.rect(px - pw / 2, 0, pw, wallB + s(24), stone, (x, y) => clamp(0.26 + (x < px - pw * 0.1 ? 0.12 : -0.1) + ((Math.round(y) % Math.max(8, s(34))) < 1 ? -0.2 : 0), 0, 0.999));
      }
      for (const fx of G.narrow ? [0.2, 0.8] : [0.05, 0.78]) pipeUp(L, Math.round(w * fx), 0, wallB + s(18), Math.max(3, s(8)), s, -0.04);
      L.outline();
      g.fillStyle = '#06080f'; g.fillRect(0, 0, w, h);
      g.drawImage(L.canvas(), 0, 0);
      for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(4,6,12,0.18)'; g.fillRect(0, 0, w, Math.round(wallB * (0.5 - i * 0.12))); }
      Q.bandsIn(g, 0, wallB, w, h - wallB, WATER, 0.45);
      // the beam high over the bell
      const B = p.layer(w, h), bm = p.mat(BEAM, { n: 5, at: 2 });
      const by = Math.max(1, G.lipY - Math.round(G.H * 1.16) - s(8));
      B.rect(-2, by, w + 4, Math.max(3, s(9)), bm, (x, y) => (y < by + 1 ? 0.7 : 0.3));
      B.outline();
      g.drawImage(B.canvas(), 0, 0);
      void nc;
      return { cv, wallB };
    });
  }
  // the platform seen from the side and a little above: its top (a lozenge), the two faces toward us, the keeper's
  // pipes draped over its edge; d: how far the water has drawn back (a wet band on the stone, the pipes emerging)
  function platformLayer(G, d) {
    return cached('ch5.plat|' + G.w + 'x' + G.h + '|' + G.vb + '|' + d, () => {
      const { w, h, s, nc, yBack, cxB } = G, p = P(), rnd = p.rnd(55);
      const L = p.layer(w, h), ps = p.mat('#525874', { n: 7, at: 3, step: 0.075 });
      const left = [Math.round(nc[0] - (nc[0] - (G.narrow ? -s(20) : -s(40)))), yBack + s(6)];
      const back = [Math.round(cxB + (G.narrow ? s(40) : s(80))), yBack - s(10)];
      const right = [Math.round(nc[0] + (G.narrow ? s(120) : s(150))), yBack + s(14)];
      const top = [nc, right, back, left];
      L.poly(top, ps, (x, y) => clamp(0.52 + 0.3 * (1 - Math.hypot(x - nc[0], y - nc[1]) / (w * 0.6)) + (((Math.round(x * 0.5 + y)) % Math.max(5, s(22))) < 1 ? -0.12 : 0), 0, 0.999));
      const fh = s(G.narrow ? 22 : 18);
      // the two faces toward us
      const fL = [left, nc, [nc[0], nc[1] + fh], [left[0], left[1] + fh]];
      const fR = [nc, right, [right[0], right[1] + fh], [nc[0], nc[1] + fh]];
      L.poly(fL, ps, (x, y) => clamp(0.4 + ((Math.round(x / Math.max(8, s(30)))) % 2 ? 0.05 : -0.03) + (y > lerp(left[1], nc[1], (x - left[0]) / Math.max(1, nc[0] - left[0])) + fh * 0.7 ? -0.12 : 0), 0, 0.999));
      L.poly(fR, ps, (x, y) => clamp(0.26 + ((Math.round(x / Math.max(8, s(30)))) % 2 ? 0.04 : -0.03), 0, 0.999));
      // its lit edges
      L.line(left[0], left[1], nc[0], nc[1], ps, 6); L.line(nc[0], nc[1], right[0], right[1], ps, 5);
      // the keeper's pipes fallen across it and over its edge into the water
      const pm = p.mat(PIPE, { n: 7, at: 3, step: 0.085 }), r = Math.max(2, s(4));
      const em = Math.round(d);
      pipeSlack(L, [[back[0] - s(30), back[1] + s(14)], [left[0] + s(60), left[1] + s(4)], [left[0] + s(40), left[1] + fh + s(4)], [left[0] - s(10), left[1] + fh + s(14) + em]], r, pm, 0);
      pipeSlack(L, [[right[0] - s(70), right[1] - s(6)], [right[0] - s(30), right[1] + s(2)], [right[0] - s(20), right[1] + fh + s(2)], [right[0] + s(40), right[1] + fh + s(10) + em]], r, pm, 0);
      L.outline();
      const cv = L.canvas(), g = cv.getContext('2d');
      // the water at its foot (dropping as the lake draws back: a wet dark band above the new line)
      const wl = (x0, y0, x1, y1) => { for (let x = Math.round(x0); x < x1; x++) { const y = Math.round(lerp(y0, y1, (x - x0) / Math.max(1, x1 - x0))); if (em > 0) { g.fillStyle = 'rgba(10,16,26,0.5)'; g.fillRect(x, y - em, 1, em); } g.fillStyle = 'rgba(150,186,204,0.35)'; g.fillRect(x, y, 1, 1); } };
      wl(left[0], left[1] + fh, nc[0], nc[1] + fh);
      wl(nc[0], nc[1] + fh, right[0], right[1] + fh);
      void rnd;
      return { cv, left, right, back, fh };
    });
  }
  const COMP_ASIDE = { nao: 'p:cupear', mio: 'p:heart', ren: 'p:lampup', suzu: 'p:clasp' };
  const hall = {
    phases: [['voice', 700], ['turn', 900], ['aside', 900], ['ebb', 1500]],
    safe: { wide: 'the two of you and the bell above the sheet, the empty water at the right', narrow: 'the bell, the platform and the two of you above the sheet', land: 'the two of you on the platform' },
    draw(c, w, h, t, st) {
      const G = geomHall(w, h, st.vb), { s, nc, cxB, H, lipY, rv } = G, still = st.still;
      const S0 = hallStatic(G);
      c.drawImage(S0.cv, 0, 0);
      const kv = st.at('voice'), kt = st.at('turn'), ka = st.at('aside'), ke = st.at('ebb');
      stillWater(c, 0, S0.wallB + 2, w, h - S0.wallB, t, still, 23, [cxB, s(50)]);
      // the bell, rung: gleaming, still faintly trembling; its light warm on the stone
      const b = bellArt(H, 'gold', 0.14);
      const tr = still ? 0 : Math.round(Math.sin(t / 260) * 0.6);
      lampGlow(c, cxB, lipY - Math.round(H * 0.4), Math.round(H * 1.3), t, still, 0.16);
      c.drawImage(b.cv, cxB - b.ax + tr, lipY - b.lipY);
      reliefLight(c, b, cxB - b.ax + tr, lipY - b.lipY, null, 0.4, true);
      const PL = platformLayer(G, Math.round(ease(ke) * 4) * Math.max(1, s(2)));
      c.drawImage(PL.cv, 0, 0);
      lampGlow(c, nc[0], nc[1] - s(14), s(G.narrow ? 90 : 80), t, still, 0.2);
      // a ring on the empty water where the voice was; nobody there
      if (kv > 0 && kv < 1) rings(c, rv[0], rv[1], kv, 3, s(G.narrow ? 80 : 110), 0.2, '214,228,242', 0.7);
      if (kv >= 1 && !still) rings(c, rv[0], rv[1], ((t / 4400) % 1), 1, s(G.narrow ? 60 : 84), 0.2, '214,228,242', 0.24);
      if (kv >= 1 && still) rings(c, rv[0], rv[1], 0.5, 1, s(G.narrow ? 60 : 84), 0.2, '214,228,242', 0.3);
      // the two of you at the near corner: facing the bell (away from us), then turned to the water
      const comp = st.cast.comp;
      const turned = kt >= 0.5;
      const mid = kt > 0.15 && kt < 0.5 && !still;
      const dir = turned ? 'down' : mid ? 'right' : 'up';
      const cKey = turned && ka > 0.1 && comp ? (COMP_ASIDE[comp.id] || 'p:nod1') : 'i0';
      pair(c, st, nc[0], nc[1] - Math.max(1, s(3)), G.sc, dir, { comp: cKey }, turned ? HALL_L : HALL, Math.round(s(G.land ? 8 : 12) * G.sc / 0.82));
      vignette(c, w, h, 0.45, 0.6);
    },
    focus(w, h, vb) {
      const G = geomHall(w, h, vb), sc = G.sc, fh = Math.round(58 * sc), gap = Math.round(G.s(G.land ? 8 : 12) * sc / 0.82) + Math.round(20 * sc);
      if (G.land) return { x: G.nc[0] - gap, y: G.nc[1] - fh, w: gap * 2, h: Math.min(fh, vb - (G.nc[1] - fh)) };
      const b = bellArt(G.H, 'gold', 0.14); const y0 = Math.max(0, G.lipY - b.lipY + b.y0);
      const x0 = Math.round(G.cxB - b.lipR - 2), x1 = G.nc[0] + gap;
      return { x: x0, y: y0, w: x1 - x0, h: G.nc[1] - y0 };
    },
  };

  RB.sequence.define('ch5.bell', {
    title: { en: 'The drowned bell rings', jp: '{沈|しず}んだ {鐘|かね} が {鳴|な}る' }, chapter: 5, scene: 'lf.bell_touch', memory: true,
    memo: { jp: '', en: 'In the drowned tower, the bell rang after thirty years, and the voices in the pipes turned back toward the town.' },
    shots: { bell: bellShot, gong, town, hall },
  });

  // ---- ch5.boat: across the still lake ---------------------------------------------------------------------------
  // A cut at the water's surface: above it, Tokuji's boat in profile — you at the oars facing the stern, your
  // companion in the bow looking ahead — and the tower's belfry rising out of the lake ahead in the haze; below it,
  // in the green-blue murk, the drowned lower town (roofs, a lane's stone lantern) and the tower going down into
  // the deep. The stroke: the near oar's blade in, pulled through, out; the boat moves on a little.
  function geomBoat(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const land = lay === 'land', narrow = lay === 'narrow';
    const yS = Math.round(land ? vb * 0.66 : vb * (narrow ? 0.36 : 0.46));              // the surface
    const bx = Math.round(w * (narrow ? 0.42 : land ? 0.4 : 0.38));                       // the boat's middle
    const bl = Math.round(clamp(s(narrow ? 190 : 176), 60, w * (narrow ? 0.78 : 0.5)));  // its length
    const tx = Math.round(w * (narrow ? 0.84 : land ? 0.84 : 0.8)), tw = Math.round(clamp(s(narrow ? 44 : 52), 18, 90));
    const tTop = Math.round(land ? 2 : Math.max(s(6), yS - s(narrow ? 132 : 112)));
    const sc = clamp(S.Z * (land ? 1.5 : narrow ? 1 : 0.95), 0.5, 1);
    return Object.assign(S, { land, narrow, yS, bx, bl, tx, tw, tTop, sc });
  }
  function boatStatic(G) {
    return cached('ch5.boat|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, yS, tx, tw, tTop } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(2024);
      // above: a pale still afternoon, haze over the far shore
      Q.bandsIn(g, 0, 0, w, yS, ['#7c84a0', '#8c92ac', '#9ca0b6', '#acaec0', '#bcbcca', '#cac8d2', '#d6d2d8'], 0.45);
      for (let x = 0; x < w; x++) { const v = Math.sin(x / (w * 0.13) + 0.4) * 0.6 + Math.sin(x / (w * 0.041)) * 0.4; const t1 = Math.round(yS - s(4) - s(12) * (0.5 + v * 0.5)); R(g, x, t1, 1, yS - t1, '#a6a4b8'); R(g, x, t1, 1, 1, '#b6b4c6'); }
      for (let x = 0; x < w * 0.36; x += s(9)) { const hh = s(3) + Math.round(rnd() * s(5)); R(g, Math.round(x), yS - hh, s(7), hh, '#9492ac'); R(g, Math.round(x) - 1, yS - hh - 1, s(9), 1, '#82809c'); }
      // below: the murk, lighter near the surface
      Q.bandsIn(g, 0, yS, w, h - yS, ['#5e8494', '#4e7686', '#426a7a', '#365c6c', '#2c4e5e', '#224252', '#1a3646', '#142c3a'], 0.4);
      // the tower going down into the deep (only its belfry clears the lake)
      const T = p.layer(w, h), st = p.mat('#9a94a6', { n: 7, at: 3, step: 0.07 }), rf = p.mat('#3a3860', { n: 6, at: 3, step: 0.08 }), pm = p.mat(PIPE, { n: 6, at: 3 });
      const course = Math.max(3, s(7));
      T.rect(tx - tw / 2, tTop + s(14), tw, yS - tTop - s(14), st, (x, y) => clamp(0.5 + (x < tx - tw * 0.15 ? 0.16 : -0.14) + ((Math.round(y - tTop) % course) < 1 ? -0.18 : 0), 0, 0.999));
      const aw = Math.round(tw * 0.48), ay = tTop + s(22), ah = Math.round(tw * 0.66);
      T.rect(tx - aw / 2, ay, aw, ah, p.mat('#1a1e2c', { n: 3, at: 1 }), 1);
      T.ell(tx, ay, aw / 2, Math.max(2, aw * 0.42), p.mat('#1a1e2c', { n: 3, at: 1 }), 1);
      // the bell in the arch, green, the pipes wound round it so it cannot swing
      const bm = p.mat(PATINA, { n: 5, at: 2 });
      T.poly([[tx - aw * 0.2, ay + ah * 0.14], [tx + aw * 0.2, ay + ah * 0.14], [tx + aw * 0.36, ay + ah * 0.8], [tx - aw * 0.36, ay + ah * 0.8]], bm, (x) => (x < tx ? 0.7 : 0.35));
      for (let i = 0; i < 3; i++) T.seg(tx - aw * 0.4, ay + ah * (0.28 + i * 0.16), tx + aw * 0.4, ay + ah * (0.36 + i * 0.16), Math.max(1, s(2)), pm, 2);
      T.poly([[tx - tw / 2 - s(8), tTop + s(16)], [tx, tTop], [tx + tw / 2 + s(8), tTop + s(16)]], rf, (x) => (x < tx ? 0.65 : 0.35));
      T.rect(tx - 1, tTop - s(8), Math.max(1, s(2)), s(8), pm, 2);
      T.outline();
      g.drawImage(T.canvas(), 0, 0);
      // under the surface: its drowned courses, dim, and the conduits down its side
      const U = p.layer(w, h), ust = p.mat('#4e6c7a', { n: 6, at: 3, step: 0.07 });
      U.rect(tx - tw / 2 - s(4), yS, tw + s(8), h - yS, ust, (x, y) => clamp(0.5 - (y - yS) / (h - yS) * 0.45 + (x < tx ? 0.1 : -0.1) + ((Math.round(y - yS) % course) < 1 ? -0.15 : 0), 0, 0.999));
      U.rect(tx + tw / 2 - s(2), yS, Math.max(2, s(5)), h - yS, p.mat('#3a4c64', { n: 5, at: 2 }), 2);
      // the drowned lower town: rows of houses seen from the side, roofs and walls, a lane's stone lantern
      const rfU = p.mat('#2a4456', { n: 6, at: 3, step: 0.07 }), wlU = p.mat('#4e707e', { n: 6, at: 3, step: 0.07 }), lm = p.mat('#62828c', { n: 5, at: 2 }), dk = p.mat('#1a3040', { n: 3, at: 1 });
      const rows = G.narrow ? 4 : 3;
      for (let r = 0; r < rows; r++) {
        const d = r / Math.max(1, rows - 1); // 0 the row nearest the surface … 1 the deepest
        const yb = Math.round(lerp(yS + s(G.narrow ? 120 : 104), G.narrow ? h * 0.94 : h * 1.02, d * (G.narrow ? 0.92 : 1))) - (G.land ? s(20) : 0);
        const sc = lerp(1.0, 0.72, d);
        for (let x = -s(40) + Math.round(rnd() * s(30)); x < w + s(30);) {
          const bw = Math.round(s(44 + rnd() * 40) * sc), hh = Math.round(s(24 + rnd() * 18) * sc), rh = Math.round(s(14 + rnd() * 6) * sc);
          if (Math.abs(x + bw / 2 - tx) < tw * 0.9) { x += bw; continue; }
          const broken = rnd() < 0.22, hip = rnd() < 0.4;
          U.rect(x, yb - hh, bw, hh, wlU, (xx, y) => clamp(0.4 - d * 0.16 + (xx < x + bw * 0.2 ? 0.12 : 0) - (y - (yb - hh)) / hh * 0.08, 0, 0.999));
          for (let wx = x + Math.round(s(8) * sc); wx < x + bw - s(9) * sc; wx += Math.round(s(15) * sc)) U.rect(wx, yb - Math.round(hh * 0.66), Math.max(1, Math.round(s(5) * sc)), Math.max(2, Math.round(s(7) * sc)), dk, 1);
          const ins = hip ? Math.round(bw * 0.3) : Math.round(bw * 0.12);
          U.poly([[x - Math.round(s(5) * sc), yb - hh + 1], [x + ins, yb - hh - rh], [x + bw - ins, yb - hh - rh], [x + bw + Math.round(s(5) * sc), yb - hh + 1]], rfU, (xx, y) => clamp(0.4 - d * 0.14 + ((Math.round(y) % Math.max(2, Math.round(s(4) * sc))) < 1 ? -0.14 : 0) + (y < yb - hh - rh * 0.6 ? 0.12 : 0), 0, 0.999));
          // a roof fallen in: a dark gap, a rafter across it
          if (broken) { const gx = x + Math.round(bw * (0.3 + rnd() * 0.3)), gw = Math.round(bw * 0.22); U.poly([[gx, yb - hh - rh * 0.9], [gx + gw, yb - hh - rh * 0.7], [gx + gw * 0.8, yb - hh + 1], [gx - gw * 0.2, yb - hh + 1]], dk, 1); U.line(gx - 2, yb - hh - rh * 0.5, gx + gw + 2, yb - hh - rh * 0.3, wlU, 2); }
          x += bw + Math.round(s(rnd() < 0.35 ? 34 : 6) * sc);
        }
        if (r === 0) {
          // the lane's stone lantern, standing where the first block began
          const lx = Math.round(w * (G.narrow ? 0.14 : 0.1)), ly = yb + s(4);
          U.rect(lx - s(3), ly - s(18), s(6), s(18), lm, 2); U.rect(lx - s(8), ly - s(25), s(16), s(7), lm, 3); U.poly([[lx - s(10), ly - s(25)], [lx, ly - s(34)], [lx + s(10), ly - s(25)]], lm, 3); U.rect(lx - s(7), ly, s(14), s(3), lm, 1);
        }
      }
      U.outline();
      // the murk over them: deeper rows paler and bluer (the water between), the whole wavering a little
      const uc = U.canvas(), wc = mk(w, h), wg = wc.getContext('2d');
      for (let y = yS; y < h; y++) wg.drawImage(uc, 0, y, w, 1, Math.round(Math.sin(y * 0.31) * 1.2), y, w, 1);
      wg.globalCompositeOperation = 'source-atop';
      for (let i = 0; i < 6; i++) { const y0 = yS + Math.round((h - yS) * i / 6); wg.fillStyle = 'rgba(70,120,136,' + (0.3 + i * 0.06).toFixed(2) + ')'; wg.fillRect(0, y0, w, Math.ceil((h - yS) / 6) + 1); }
      g.drawImage(wc, 0, 0);
      // the light coming down in slanting shafts (stepped, flat)
      for (let i = 0; i < 5; i++) {
        const x0 = Math.round(w * (0.08 + i * 0.21 + rnd() * 0.05)), bw = s(14 + rnd() * 18), len = Math.round((h - yS) * (0.5 + rnd() * 0.4));
        g.fillStyle = 'rgba(210,236,240,0.06)';
        g.beginPath(); g.moveTo(x0, yS); g.lineTo(x0 + bw, yS); g.lineTo(x0 + bw + len * 0.35, yS + len); g.lineTo(x0 + len * 0.35, yS + len); g.fill();
      }
      // the surface seen from just below: a bright skin
      R(g, 0, yS, w, 1, 'rgba(232,240,246,0.85)'); R(g, 0, yS + 1, w, Math.max(1, s(2)), 'rgba(150,196,210,0.4)');
      // the haze where the far shore meets the water, and round the tower's foot
      for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(224,224,232,' + (0.14 - i * 0.04).toFixed(2) + ')'; g.fillRect(0, yS - s(4) - i * s(4), w, s(4)); }
      return { cv };
    });
  }
  // Tokuji's boat in profile: old planks kept well, a fresh-pitched seam; the bow rising at the right
  function boatHull(G) {
    return Q.small('ch5.hull|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { s, bl } = G, p = P();
      const ht = Math.max(6, Math.round(bl * 0.13)), cw = bl + 8, ch = ht * 3 + 8, x0 = 4, top = ht + 2, keel = top + ht;
      const L = p.layer(cw, ch);
      const wood = p.mat('#7a5a4e', { n: 7, at: 3, step: 0.075 }), pitch = p.mat('#24202a', { n: 3, at: 1 });
      // the sheer line: low amidships, rising to the stern (left) and higher to the bow (right)
      const sheer = (u) => top - ht * (0.35 * (1 - u) ** 3 * 1.2 + 1.1 * u ** 4);
      const bottom = (u) => keel - ht * 0.2 * (Math.abs(u - 0.45) * 2) ** 2 - (u > 0.85 ? (u - 0.85) * ht * 6 : 0);
      L.fill(0, 0, cw, ch, (x, y) => { const u = (x - x0) / bl; return u >= 0 && u <= 1 && y >= sheer(u) && y <= bottom(u); }, wood, (x, y) => { const u = (x - x0) / bl, f = (y - sheer(u)) / Math.max(1, bottom(u) - sheer(u)); return clamp(0.66 - f * 0.4 + ((Math.round(f * 4) !== Math.round((f + 0.08) * 4)) ? -0.18 : 0), 0, 0.999); });
      // the planks' seams along the hull, the fresh pitch on one; the gunwale's lit rail
      for (const f of [0.34, 0.62]) L.path(Array.from({ length: 21 }, (_, i) => { const u = i / 20; return [x0 + u * bl, lerp(sheer(u), bottom(u), f)]; }), 1, f > 0.5 ? pitch : wood, f > 0.5 ? 1 : 1);
      L.path(Array.from({ length: 21 }, (_, i) => { const u = i / 20; return [x0 + u * bl, sheer(u) + 1]; }), Math.max(1, s(2)), wood, 6);
      // the stern post and the stem
      L.seg(x0 + 1, sheer(0) - 1, x0 + 3, bottom(0.02), Math.max(1, s(2)), wood, 2);
      L.seg(x0 + bl - 2, sheer(1) - 2, x0 + bl - ht * 0.6, bottom(0.88), Math.max(1, s(2.5)), wood, 5);
      // the oarlock pin amidships
      L.rect(x0 + Math.round(bl * 0.4), sheer(0.4) - Math.max(2, s(4)), Math.max(1, s(2)), Math.max(2, s(4)), p.mat('#5a5a66', { n: 3, at: 1 }), 2);
      L.outline();
      return { cv: L.canvas(), x0, sheer, bottom, top, keel, ht, w: cw, h: ch };
    });
  }
  const crossShot = {
    phases: [['stroke', 1500]],
    safe: { wide: 'the boat and the tower above the surface; the drowned roofs under it, above the sheet', narrow: 'the boat and the tower in the top third, the drowned town below', land: 'the boat at the surface' },
    draw(c, w, h, t, st) {
      const G = geomBoat(w, h, st.vb), { s, yS, bx, bl, sc } = G, still = st.still;
      c.drawImage(boatStatic(G).cv, 0, 0);
      const k = st.at('stroke');
      // the surface's slow light, above; motes drifting in the murk, below
      stillWater(c, 0, yS - Math.max(2, s(6)), w, Math.max(2, s(6)), t, still, 88, null, '244,246,250');
      if (!still) for (let i = 0; i < 14; i++) { const f = ((t / (9000 + i * 700)) + hashf(i, 1, 4)) % 1; c.fillStyle = 'rgba(200,226,232,0.35)'; c.fillRect(Math.round(hashf(i, 2, 4) * w + Math.sin(t / 2000 + i) * 3), Math.round(lerp(h, yS + s(10), f)), 1, 1); }
      const hull = boatHull(G);
      // the boat moves on a little with the stroke; then rides the stillness (a slow pixel's rise and fall)
      const glide = Math.round(ease(k) * s(8)), bob = still ? 0 : Math.round(Math.sin(t / 1700) * 0.6);
      const hx = Math.round(bx - bl / 2 + glide), wl = Math.round(hull.top + hull.ht * 0.5);   // its waterline row
      const hy = yS - wl + bob;
      // the hull under the surface, dimmer and wavering (seen through the water); its shadow on the murk
      const sub = Q.small('ch5.hullsub|' + hull.w + 'x' + hull.h, () => { const cv2 = mk(hull.w, hull.h), g2 = cv2.getContext('2d'); g2.drawImage(hull.cv, 0, 0); g2.globalCompositeOperation = 'source-atop'; g2.fillStyle = 'rgba(54,96,112,0.55)'; g2.fillRect(0, 0, hull.w, hull.h); return cv2; });
      for (let y = wl + 1; y < hull.h; y++) c.drawImage(sub, 0, y, hull.w, 1, hx + (still ? 0 : Math.round(Math.sin(t / 500 + y * 0.7) * 0.6)), hy + y, hull.w, 1);
      // the people in it (only a companion who is here): you at the oars facing the stern, your companion in the bow
      const grade = { mul: [0.96, 0.96, 1], add: [2, 2, 6], rim: { side: 'r', col: '#f4f2fa', k: [0.4, 0.18] } };
      const seatY = hy + hull.top + Math.round(hull.ht * 0.25);
      const comp = st.cast.comp;
      if (comp) { const fc = Q.figure(comp.look, 'right', 'p:sitlook', sc, grade); if (fc) c.drawImage(fc.cv, Math.round(hx + bl * 0.74 - fc.ax), seatY - fc.ay); }
      const fp = Q.figure(st.cast.pc, 'left', 'p:sitlap', sc, grade);
      const rx = Math.round(hx + bl * 0.42);
      if (fp) c.drawImage(fp.cv, rx - fp.ax, seatY - fp.ay);
      c.drawImage(hull.cv, 0, 0, hull.w, wl + 1, hx, hy, hull.w, wl + 1);
      // the near oar: from the rower's hands over the gunwale to the blade in the water; the stroke sweeps the
      // blade from the bow side to the stern side, lifting it out at the end
      const hxp = rx - Math.round(s(6) * sc), hyp = seatY - Math.round(s(18) * sc);           // the hands
      const pin = [Math.round(hx + bl * 0.4 + 1), hy + hull.sheer(0.4) - 1];                       // the oarlock
      const sw = still ? 1 : k;
      const ang = lerp(0.45, -0.55, ease(clamp(sw / 0.85, 0, 1)));                                // + toward the bow
      const lift = sw >= 0.85 || still ? 1 : 0;
      const L2 = Math.round(s(78) * sc);
      const bxl = pin[0] + Math.round(Math.sin(ang) * L2), byl = pin[1] + Math.round(Math.cos(ang) * L2 * 0.62) - (lift ? Math.round(s(9) * sc) : 0);
      c.strokeStyle = '#6e5038'; c.lineWidth = Math.max(1, Math.round(s(2.4) * sc));
      c.beginPath(); c.moveTo(hxp, hyp); c.lineTo(pin[0], pin[1]); c.lineTo(bxl, byl); c.stroke();
      // the blade: above the surface it is plain wood; under it, dimmed
      const bw2 = Math.max(2, Math.round(s(5) * sc)), bh2 = Math.round(s(16) * sc);
      for (let i = 0; i < bh2; i++) { const yy = byl - Math.round(bh2 * 0.3) + i; c.fillStyle = yy > yS ? '#5a6e6e' : '#9c7c58'; c.fillRect(bxl - Math.round(bw2 / 2) + Math.round(Math.sin(ang) * i * 0.3), yy, bw2, 1); }
      // the water it moves: rings where it bites, a swirl under the surface; drops off it when it lifts
      if (!still && k > 0.05 && k < 0.85) { rings(c, bxl, yS, clamp((k - 0.05) / 0.6, 0, 1), 2, s(30), 0.18, '244,246,250', 0.8); c.fillStyle = 'rgba(220,240,244,0.4)'; for (let i = 0; i < 6; i++) c.fillRect(bxl - s(6) + Math.round(Math.cos(t / 120 + i) * s(6)), yS + s(4) + Math.round(Math.sin(t / 120 + i) * s(3)), 1, 1); }
      if (lift && !still) { const dr = (t / 1400) % 1; if (dr < 0.35) { c.fillStyle = 'rgba(236,244,248,0.8)'; c.fillRect(bxl, Math.round(lerp(byl + bh2 * 0.6, yS, dr / 0.35)), 1, 2); } else rings(c, bxl, yS, (dr - 0.35) / 0.65, 1, s(14), 0.2, '244,246,250', 0.5); }
      // the bow's ripple and the wake at the stern, on the surface line
      c.fillStyle = 'rgba(244,246,250,0.6)';
      for (let i = 1; i < 10; i++) c.fillRect(Math.round(hx - i * s(8) - (still ? 0 : (t / 90) % s(8))), yS - (i % 2), Math.max(1, s(4) - i % 3), 1);
      c.fillRect(Math.round(hx + bl - s(4)), yS - 1, Math.max(2, s(6)), 1);
    },
    focus(w, h, vb) { const G = geomBoat(w, h, vb); const top = Math.min(G.tTop, G.yS - Math.round(G.s(60) * G.sc)); const x0 = Math.max(0, Math.round(G.bx - G.bl / 2 - G.s(6))), x1 = Math.min(w, G.tx + G.tw); const y1 = Math.min(vb, G.yS + (G.land ? 0 : G.s(30))); return { x: x0, y: Math.max(0, top), w: x1 - x0, h: y1 - Math.max(0, top) }; },
  };
  RB.sequence.define('ch5.boat', {
    title: { en: 'Across the still lake', jp: '{静|しず}か な {湖|みずうみ} を {渡|わた}る' }, chapter: 5, scene: 'lf.boat_to_tower', memory: false,
    shots: { cross: crossShot },
  });
})();
