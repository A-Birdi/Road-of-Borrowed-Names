/* The Drowned Bell's Keeper in the Bell Chamber (Chapter 5, lf.boss_intro; RBN-QA-071). On the map the chamber only
 * ever shows its hanging bell (the lf_bigbell prop, rung or not): the keeper exists as its battle drawing (creature
 * family 'lf_keeper', src/ui/78o_bells.js). So the lines that tell it rising and coming apart are shown as pictures of
 * the chamber with that same drawing in it, the battle's own figure in the battle's own colours (lf.keeper's artOpts):
 *   heave   the water in front of the bell swells up into a mound, rings spreading from it
 *   rise    pipes twist up out of the mound and the keeper rises on them, water running off it (then its own idle
 *           cycle, as in battle); pipes climb out of the water and wind round the hanging bell
 *   face    held: your companion faces it in their own way (Nao and Suzu point, Mio's guarded hand, Ren's lamp up)
 *   apart   after the battle: the keeper as the battle left it (its settled pose) sinks into the water, then the four
 *           pipes of its legs go under one by one
 *   loosen  the pipes wound round the bell slacken and fall away, over the island's edge into the water; the bell
 *           hangs green and unrung, as the world has it
 * The chamber is the Bell Chamber of the ch5.bell sequence (src/ui/43e_seq_ch5.js, RB.seqCh5: its dressed walls, beam,
 * conduits, water shimmer and green bell), seen from the near ledge where you stand (lf.bellhall: the bell on its island,
 * a pillar either side, the conduits lit on the side walls), in the map's own colours (RB.tiles.PAL.lanternfall under the
 * chamber's dark: slate water, lavender-grey stone, the bell a darker green). You and your
 * companion (only one who is on the map) stand on the ledge in front, seen from behind (the road figures, graded into
 * the chamber's light). Each picture keeps what the line names (the mound, the keeper down to the water, the bell) above
 * the dialogue sheet (vb). "heave" and "apart" come in by dissolving from the map as it last was; the battle's own fade
 * takes the screen from "face", and the scene fades "loosen" out. Reduced motion: each stage is one still picture with
 * its action complete ("apart": its legs still standing). Drawn at art resolution in the prologue's manner (RB.pxkit;
 * released with the interlude); implemented provisionally under AC-1. Presentation only: nothing here reads or changes
 * the battle or any state.
 *   RB.interlude.ART.lf_keeper.probe(w, h, vb)   tests: where the keeper, the mound, the bell and the water are (buffer
 *                                                px), by default at the size last drawn */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.prologueArt;
  const K = () => RB.pxkit, Q = () => RB.seqKit, C5 = () => RB.seqCh5;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const ease = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  const lerp = (a, b, k) => a + (b - a) * k;
  const span = (k, a, b) => clamp((k - a) / (b - a), 0, 1);
  const hashf = (x, y, k) => (K().hh(x | 0, y | 0, k || 0) % 1000) / 1000;
  const ART = 'lf_keeper';
  const OPTS = { col: '#4a5a52' }; // lf.keeper's artOpts (src/content/ch5/40_enemies.js): the battle's colours and frames
  const MS = { heave: 1500, rise: 2600, face: 0, apart: 3200, loosen: 2200 }; // each stage's one-time action
  // with Reduce motion each stage is one still picture: its action complete, except "apart", held where its line is
  // told best (the keeper gone under, its four pipe legs still standing in the water)
  const STILL = { apart: 0.55 };
  const ENTER = 450; // the dissolve from the map
  const WL = 64;     // the waterline on the keeper's drawing (art px below its origin): it stands in the water to the knee
  // the rig's blued iron (78o_bells.js KPAL.iron), for the pipes drawn here: its legs' tops, the pipes round the bell
  const IRON = ['#100e26', '#1f1e40', '#33335e', '#4e5084', '#7e84b4', '#c6cceb'];
  // where its four legs cross the waterline (art px from its origin, 78o_bells.js tendrilPts at the knee)
  const LEGS = [-62, -17, 16, 62];
  const COMP_KEY = { nao: 'p:point', mio: 'p:guard', ren: 'p:lampup', suzu: 'p:point' };

  // ---- caches: its own layers and sprites, dropped with the interlude (and the shared kit's, when no sequence is up) --
  const mine = new Map();
  const cached = (key, build) => {
    let v = mine.get(key);
    if (v === undefined) { v = build(); mine.set(key, v); while (mine.size > 32) mine.delete(mine.keys().next().value); }
    return v;
  };
  let entry = null; // the map as it last was, for the dissolve in (one per showing)
  let metrics = null, colours = null, warm = 0;
  A.kit.onRelease(() => {
    mine.clear(); entry = null; warm = 0;
    if (RB.seqKit && !(RB.sequence && RB.sequence.active && RB.sequence.active())) RB.seqKit.release();
  });
  const mk = (w, h) => Q().mk(w, h);

  // the keeper's reach round its origin (art px at scale 1), from the battle drawing itself
  function km() {
    if (!metrics) { const e = RB.enemyArt.extent(ART, OPTS); metrics = { top: e.top + 6, left: e.left, right: e.right }; }
    return metrics;
  }

  // ---- layout ---------------------------------------------------------------------------------------------------
  // the chamber's colours from the region's palette under the chamber's dark (lf.bellhall: ambient dark 0.5, a blue
  // tint): its slate water, its lavender-grey stone (the island, the ledge and the pillars), the walls deeper still
  function cols() {
    if (colours) return colours;
    const pal = (RB.tiles && RB.tiles.PAL && RB.tiles.PAL.lanternfall) || {};
    const w = pal.water || ['#3c5c8a', '#4a6c9c', '#6c8cbc', '#e0e8f8'], st = pal.stone || ['#b9b3c2', '#d0cad6', '#9892a4'], dk = pal.dark || '#1a1830', P = K();
    const wt = P.mix(w[0], st[2], 0.38), m = (a, k) => P.hex(P.mix(a, dk, k));
    return (colours = {
      bands: [0.5, 0.54, 0.58, 0.62, 0.66, 0.7].map((k) => m(wt, k)),
      // the swell: its foot, flank, shoulder, crest and foam
      swell: [m(wt, 0.56), m(wt, 0.44), m(P.mix(w[1], st[2], 0.3), 0.36), m(P.mix(w[2], st[2], 0.3), 0.3), m(w[3], 0.16)],
      stone: m(st[2], 0.42), wall: m(st[2], 0.66),
    });
  }
  function geom(w, h, vb) {
    const S = Q().stage(w, h, vb), { s, lay } = S;
    const narrow = lay === 'narrow', land = lay === 'land';
    vb = S.vb;
    const wallB = Math.round(vb * (narrow ? 0.27 : 0.3));                      // the far wall's foot, in the water
    // the island in the middle distance (its top seen from a little above), the bell hanging over it from the beam
    const cxI = Math.round(w * (narrow ? 0.4 : land ? 0.33 : 0.39));
    const wI = Math.round(narrow ? w * 0.33 : land ? w * 0.17 : w * 0.2);      // half the width of its front edge
    const yIt = Math.round(vb * (narrow ? 0.37 : 0.38)), yIb = yIt + Math.max(4, s(narrow ? 22 : 18)), yIf = yIb + Math.max(3, s(narrow ? 11 : 9));
    const H = Math.round(clamp(narrow ? w * 0.29 : vb * 0.26, 24, 200));
    const lipY = Math.round(lerp(yIt, yIb, 0.55)) - Math.max(2, s(8));
    const beamY = Math.max(1, lipY - Math.round(H * 1.16) - s(8));
    // the keeper in the water in front of the island and a little to its right, turned toward you (its battle view)
    const M = km();
    const yK = Math.round(vb * (narrow ? 0.83 : land ? 0.93 : 0.89));
    const room = yK - Math.max(S.top, beamY + s(6));
    const ks = clamp(room / (WL - M.top), 0.35, 1);
    const kx = Math.min(Math.round(w * (narrow ? 0.6 : land ? 0.66 : 0.64)), Math.round(w - 4 - M.right * ks));
    const oyK = Math.round(yK - WL * ks);
    // the near ledge you stand on (its edge toward the water), the two of you on it, the lamp's light
    const yL = vb - Math.max(4, s(9));
    const px = Math.round(w * (narrow ? 0.13 : 0.2)), gap = Math.max(10, s(narrow ? 24 : 21));
    const sc = clamp(S.Z * (narrow ? 0.95 : 0.9), 0.45, 1);
    const WC = cols();
    return Object.assign(S, {
      w, h, narrow, land, wallB, cxI, wI, yIt, yIb, yIf, H, lipY, beamY, yK, ks, kx, oyK, yL, px, gap, sc, lx: px + (gap >> 1),
      // a pillar either side of the island, at its back corners (lf.bellhall's far pair); the conduits on the side walls
      pillars: [cxI - wI - s(narrow ? 12 : 24), cxI + wI + s(narrow ? 12 : 24)], conduits: narrow ? [0.035, 0.965] : [0.03, 0.97], yGlow: wallB - s(narrow ? 30 : 22),
      WATER: WC.bands, SW: WC.swell, STONE: WC.stone, WALL: WC.wall, key: w + 'x' + h + '|' + vb,
    });
  }

  // ---- the chamber -----------------------------------------------------------------------------------------------
  // the far wall and its conduits, the water, the pillars standing in it, the conduits' lamps, the beam
  function back(G) {
    return cached('back|' + G.key, () => {
      const { w, h, s, wallB } = G, S5 = C5(), P = K();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const L = P.layer(w, h), stone = P.mat(G.WALL, { n: 8, at: 3, step: 0.06 }), pst = P.mat(G.STONE, { n: 7, at: 3, step: 0.075 });
      S5.blocks(L, 0, 0, w, wallB + s(4), s, stone, (x, y) => clamp(0.24 * (1 - Math.hypot(x - G.cxI, (y - G.lipY) * 1.4) / (w * 0.6)) - 0.02, -0.16, 0.3), 37, true);
      for (const fx of G.conduits) S5.pipeUp(L, Math.round(w * fx), 0, wallB + s(4), Math.max(3, s(7)), s, -0.04);
      L.outline();
      g.fillStyle = '#06080f'; g.fillRect(0, 0, w, h);
      g.drawImage(L.canvas(), 0, 0);
      for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(4,6,12,0.18)'; g.fillRect(0, 0, w, Math.round(wallB * (0.5 - i * 0.12))); }
      Q().bandsIn(g, 0, wallB, w, h - wallB, G.WATER, 0.45);
      // the pillars, standing in the water at the island's back corners, their feet wet
      const Pl = P.layer(w, h), pw = Math.max(8, s(G.narrow ? 22 : 26)), foot = G.yIt + s(3);
      for (const x0 of G.pillars) {
        Pl.rect(x0 - pw / 2, 0, pw, foot, pst, (x, y) => clamp(0.28 + (x < x0 - pw * 0.15 ? 0.14 : x > x0 + pw * 0.3 ? -0.12 : 0) + ((Math.round(y) % Math.max(8, s(34))) < 1 ? -0.2 : 0) + 0.12 * (1 - Math.hypot(x - G.cxI, y - G.lipY) / (w * 0.5)), 0, 0.999));
        Pl.rect(x0 - pw / 2 - Math.max(1, s(2)), foot - s(8), pw + Math.max(2, s(4)), s(8), pst, (x, y) => (y < foot - s(7) ? 0.62 : x < x0 ? 0.42 : 0.26));
      }
      Pl.outline();
      g.drawImage(Pl.canvas(), 0, 0);
      for (const x0 of G.pillars) { g.fillStyle = 'rgba(6,10,20,0.45)'; g.fillRect(x0 - pw / 2 - Math.max(1, s(2)), foot - s(3), pw + Math.max(2, s(4)), s(3)); g.fillStyle = 'rgba(150,176,214,0.4)'; g.fillRect(x0 - pw / 2 - Math.max(1, s(2)), foot, pw + Math.max(2, s(4)), 1); }
      // the conduits' lamps on the side walls (the map's lit lf_conduit): a lit slot in each, its light on the stone
      for (const fx of G.conduits) {
        const x = Math.round(w * fx), lw = Math.max(3, s(7)), lh = Math.max(5, s(16));
        P.halo(g, x, G.yGlow, s(G.narrow ? 34 : 42), '255,214,150', 0.26, 4);
        g.fillStyle = '#3a2a1a'; g.fillRect(x - lw / 2 - 1, G.yGlow - lh / 2 - 1, lw + 2, lh + 2);
        g.fillStyle = '#ffcf7a'; g.fillRect(x - lw / 2, G.yGlow - lh / 2, lw, lh);
        g.fillStyle = '#fff1c8'; g.fillRect(x - lw / 2, G.yGlow - lh / 2, Math.max(1, lw >> 1), lh);
        g.fillStyle = 'rgba(255,200,120,0.3)'; g.fillRect(x - s(3), G.wallB + 2, s(6), Math.max(2, s(30)));
      }
      const B = P.layer(w, h), bm = P.mat(S5.BEAM, { n: 5, at: 2 });
      B.rect(-2, G.beamY, w + 4, Math.max(3, s(9)), bm, (x, y) => (y < G.beamY + 1 ? 0.7 : 0.3));
      B.outline();
      g.drawImage(B.canvas(), 0, 0);
      return { cv };
    });
  }
  // the island (its top and its front face of dressed stone) with the bell over it: green, unrung, the world's bell
  function island(G) {
    return cached('isle|' + G.key, () => {
      const { w, h, s, cxI, wI, yIt, yIb, yIf } = G, P = K(), S5 = C5();
      const L = P.layer(w, h), ps = P.mat(G.STONE, { n: 7, at: 3, step: 0.075 });
      const bk = Math.round(wI * 0.84);
      L.poly([[cxI - bk, yIt], [cxI + bk, yIt], [cxI + wI, yIb], [cxI - wI, yIb]], ps, (x, y) => clamp(0.46 + 0.24 * (1 - Math.hypot(x - G.lx, y - yIb) / (w * 0.8)) + ((Math.round(x * 0.5 + y)) % Math.max(5, s(20)) < 1 ? -0.12 : 0), 0, 0.999));
      const rnd = P.rnd(91);
      for (let x = cxI - wI; x < cxI + wI;) { const bw = s(26) + Math.floor(rnd() * s(14)); L.stone([[x, yIb], [Math.min(cxI + wI, x + bw), yIb], [Math.min(cxI + wI, x + bw), yIf], [x, yIf]], ps, { face: 2, bevel: Math.max(1, s(2)) }); x += bw; }
      L.line(cxI - wI, yIb, cxI + wI - 1, yIb, ps, 6);
      L.outline();
      const cv = L.canvas(), g = cv.getContext('2d');
      g.fillStyle = 'rgba(6,12,18,0.55)'; g.fillRect(cxI - wI, yIf - Math.max(1, s(2)), wI * 2, Math.max(1, s(2)));
      g.fillStyle = 'rgba(150,176,214,0.35)'; g.fillRect(cxI - wI, yIf, wI * 2, 1);
      const b = S5.bellArt(G.H, 'patina', 0.16);
      const lit = S5.litCopy(b.cv, 'keeper|' + G.H, [[0, b.h, 'rgba(10,16,28,0.34)'], [b.y0 + G.H * 0.55, b.y0 + G.H * 0.8, 'rgba(255,186,104,0.05)'], [b.y0 + G.H * 0.8, b.h, 'rgba(255,196,118,0.1)']]);
      const bx = cxI - b.ax, by = G.lipY - b.lipY;
      g.drawImage(lit, bx, by);
      return { cv, b, bx, by };
    });
  }
  // the near ledge, its edge toward the water catching the lamp
  function ledge(G) {
    return cached('ledge|' + G.key, () => {
      const { w, h, s, yL } = G, P = K();
      const L = P.layer(w, h), ps = P.mat(G.STONE, { n: 7, at: 3, step: 0.075 });
      L.rect(0, yL, w, h - yL, ps, (x, y) => clamp(0.4 + 0.28 * (1 - Math.abs(x - G.lx) / (w * 0.55)) + ((Math.round(x) % Math.max(10, s(40))) < 1 || (y - yL) % Math.max(6, s(16)) === Math.max(5, s(15)) ? -0.14 : 0) - (y > yL + s(5) ? 0.06 : 0), 0, 0.999));
      L.rect(0, yL, w, Math.max(1, s(1.5)), ps, (x) => clamp(0.92 - Math.abs(x - G.lx) / w, 0.35, 0.999));
      L.outline();
      return L.canvas();
    });
  }

  // ---- pipes: round iron at any angle (a cross-section stamped at every pixel step; outline first, then the body) --
  function stamp(c, x, y, d, horiz, pass) {
    const h0 = d >> 1;
    if (pass === 0) { c.fillStyle = IRON[0]; if (horiz) c.fillRect(x, y - h0 - 1, 1, d + 2); else c.fillRect(x - h0 - 1, y, d + 2, 1); return; }
    const runs = [[0, IRON[4]], [1, IRON[3]], [Math.max(2, Math.round(d * 0.45)), IRON[2]], [d - 1, IRON[1]]];
    for (let i = 0; i < runs.length; i++) {
      const a = runs[i][0], b = i + 1 < runs.length ? Math.max(a + 1, runs[i + 1][0]) : d;
      if (a >= d) break;
      c.fillStyle = runs[i][1];
      if (horiz) c.fillRect(x, y - h0 + a, 1, b - a); else c.fillRect(x - h0 + a, y, b - a, 1);
    }
  }
  // pts: [[x, y], …]; d: its thickness; fr: how much of it, from its start (0..1)
  function pipe(c, pts, d, fr) {
    let tot = 0;
    const ls = [];
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); ls.push(l); tot += l; }
    const lim = tot * (fr == null ? 1 : fr);
    for (let pass = 0; pass < 2; pass++) {
      let acc = 0;
      for (let i = 1; i < pts.length && acc < lim; i++) {
        const a = pts[i - 1], b = pts[i], l = ls[i - 1], horiz = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]), n = Math.max(1, Math.ceil(l));
        for (let j = 0; j <= n; j++) {
          if (acc + (l * j) / n > lim) break;
          stamp(c, Math.round(a[0] + ((b[0] - a[0]) * j) / n), Math.round(a[1] + ((b[1] - a[1]) * j) / n), d, horiz, pass);
        }
        acc += l;
      }
    }
  }
  // a pipe's open end standing up out of the water (h above it; tilt: its lean)
  function stub(c, x, yW, h, d, tilt) {
    if (h < 1) return;
    pipe(c, [[x, yW + 1], [x + tilt, yW - h]], d, 1);
    const tx = Math.round(x + tilt), ty = Math.round(yW - h);
    c.fillStyle = IRON[3]; c.fillRect(tx - (d >> 1) - 1, ty - 1, d + 2, 2);
    c.fillStyle = IRON[0]; c.fillRect(tx - (d >> 1), ty - 1, d, 1);
  }

  // the pipes wound round the bell: two that climb out of the water at the island's foot and wrap its body, crossing.
  // Each is a list of points with a side: 'f' in front of the bell, 'b' behind it (drawn under the island's layer, so
  // the bell hides it). loose 0..1: slackened and fallen, draped over the island's edge into the water.
  function coilPaths(G) {
    return cached('coilp|' + G.key, () => {
      const I = island(G), b = I.b, S5 = C5(), s = G.s, H = G.H;
      const cx = G.cxI, Y0 = I.by + b.y0, vr = 0.16, r = Math.max(1, s(2));
      const hw = (t) => S5.bellHw(t) * H + r;
      const arc = (t0, t1, dir, side) => {
        const out = [];
        for (let i = 0; i <= 24; i++) {
          const u = dir * (-1 + (2 * i) / 24), t = lerp(t0, t1, i / 24), bulge = vr * hw(t) * Math.sqrt(Math.max(0, 1 - u * u));
          out.push([cx + u * hw(t), Y0 + t * H + (side === 'f' ? bulge : -bulge), side]);
        }
        return out;
      };
      const climb = (pts) => pts.map(([x, y]) => [x, y, 'f']);
      const A = climb([[cx - s(40), G.yIf + s(4)], [cx - s(42), G.yIb + s(1)], [cx - s(30), G.yIt + s(3)], [cx - hw(0.95), Y0 + 0.95 * H]])
        .concat(arc(0.93, 0.66, 1, 'f'), arc(0.64, 0.58, -1, 'b'), arc(0.56, 0.33, 1, 'f'), arc(0.31, 0.26, -1, 'b'));
      const B = climb([[cx + s(46), G.yIf + s(5)], [cx + s(44), G.yIb + s(1)], [cx + s(28), G.yIt + s(3)], [cx + hw(0.86), Y0 + 0.86 * H]])
        .concat(arc(0.84, 0.48, -1, 'f'), arc(0.46, 0.42, 1, 'b'));
      // where each falls: draped over the island's front edge and down its face into the water
      const slackA = [[cx - s(6), G.yIt + s(3)], [cx - s(30), G.yIt + s(5)], [cx - s(44), G.yIb + s(1)], [cx - s(48), G.yIf - s(1)], [cx - s(68), G.yIf + s(6)], [cx - s(98), G.yIf + s(9)]];
      const slackB = [[cx + s(4), G.yIt + s(4)], [cx + s(28), G.yIt + s(6)], [cx + s(42), G.yIb + s(1)], [cx + s(46), G.yIf], [cx + s(64), G.yIf + s(7)], [cx + s(92), G.yIf + s(12)]];
      return [{ pts: A, slack: resample(slackA, A.length) }, { pts: B, slack: resample(slackB, B.length) }];
    });
  }
  function resample(pts, n) {
    let tot = 0;
    const ls = [];
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); ls.push(l); tot += l; }
    const out = [];
    for (let k = 0; k < n; k++) {
      let d = (tot * k) / Math.max(1, n - 1), i = 0;
      while (i < ls.length - 1 && d > ls[i]) { d -= ls[i]; i++; }
      const f = ls[i] ? clamp(d / ls[i], 0, 1) : 0;
      out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]);
    }
    return out;
  }
  // draw the coils' back ('b') or front ('f') runs; wound: how far they have climbed (0..1); loose: how far fallen
  // (held wound, or fallen, they are a cached layer; only their movement is drawn frame by frame)
  function coils(c, G, side, wound, loose) {
    if (wound <= 0) return;
    if (wound >= 1 && (loose <= 0 || loose >= 1)) {
      c.drawImage(cached('coils|' + G.key + '|' + side + '|' + (loose >= 1 ? 1 : 0), () => {
        const cv = mk(G.w, G.h);
        drawCoils(cv.getContext('2d'), G, side, 1, loose >= 1 ? 1 : 0);
        return cv;
      }), 0, 0);
      return;
    }
    drawCoils(c, G, side, wound, loose);
  }
  function drawCoils(c, G, side, wound, loose) {
    const d = Math.max(3, G.s(G.narrow ? 6 : 5));
    for (const P of coilPaths(G)) {
      const n = P.pts.length, upto = Math.round(n * wound);
      const at = (i) => {
        const p = P.pts[i];
        if (!loose) return [p[0], p[1]];
        const q = P.slack[i], e = ease(clamp(loose * 1.25 - (i / n) * 0.25, 0, 1));
        return [lerp(p[0], q[0], e), lerp(p[1], q[1], e) + Math.sin(Math.PI * e) * G.s(6)];
      };
      // in front once it has slipped from the bell
      const sideOf = (i) => (loose > 0.5 ? 'f' : P.pts[i][2]);
      let run = [];
      const flush = () => { if (run.length > 1) pipe(c, run, d, 1); run = []; };
      for (let i = 0; i < upto; i++) {
        if (sideOf(i) !== side) { flush(); continue; }
        run.push(at(i));
      }
      flush();
    }
  }

  // ---- the keeper: the battle's own drawing, in the chamber's light -------------------------------------------------
  // its idle frame f (the battle's cache), or its settled pose (the last drawing of the battle's 'settle')
  function rigFrame(kind, f) {
    const EA = RB.enemyArt, spec = EA.P[ART];
    if (kind === 'idle') return EA.frame(ART, f, OPTS);
    return cached('kset', () => {
      const n = (spec.poses && spec.poses.settle) || 1, L = K().layer(spec.w, spec.h, spec.ox, spec.oy);
      return (spec.pose(L, 'settle', n - 1, n, OPTS, EA.H, -1) || L).canvas();
    });
  }
  // graded (the chamber's dark over it, the lamp low in front warming its lower half), shrunk when the picture is small
  function keeperSprite(kind, f, ks) {
    return cached('ks|' + kind + '|' + f + '|' + ks.toFixed(3), () => {
      const spec = RB.enemyArt.P[ART], src = rigFrame(kind, f);
      if (!src) return null;
      const cv = mk(src.width, src.height), g = cv.getContext('2d');
      g.drawImage(src, 0, 0);
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = 'rgba(10,14,38,0.36)'; g.fillRect(0, 0, cv.width, cv.height);
      for (const [y0, y1, a] of [[spec.oy - 6, spec.oy + 14, 0.05], [spec.oy + 14, spec.oy + 34, 0.09], [spec.oy + 34, cv.height, 0.13]]) { g.fillStyle = 'rgba(255,190,110,' + a + ')'; g.fillRect(0, y0, cv.width, y1 - y0); }
      g.globalCompositeOperation = 'source-over';
      if (ks > 0.999) return { cv, ax: spec.ox, ay: spec.oy, w: cv.width, h: cv.height };
      const r = RB.prologueArt.shrink(cv, spec.ox, spec.oy, ks), out = mk(r.w, r.h), og = out.getContext('2d'), img = og.createImageData(r.w, r.h);
      img.data.set(r.px); og.putImageData(img, 0, 0);
      return { cv: out, ax: r.ax, ay: r.ay, w: r.w, h: r.h };
    });
  }
  // the keeper with its origin at (X, Y): what is above the water whole; just under the surface its shape, fading
  // with depth (dp: how deep the water still shows it)
  function drawKeeper(c, spr, X, Y, yW, dp) {
    if (!spr) return;
    const top = Y - spr.ay, rows = clamp(yW - top, 0, spr.h);
    for (let b = 0; b < 4; b++) {
      const r0 = Math.max(rows, Math.round(yW - top + (dp * b) / 4)), r1 = Math.min(spr.h, Math.round(yW - top + (dp * (b + 1)) / 4));
      if (r1 <= r0) continue;
      c.globalAlpha = 0.2 - b * 0.045;
      c.drawImage(spr.cv, 0, r0, spr.w, r1 - r0, X - spr.ax, top + r0, spr.w, r1 - r0);
    }
    c.globalAlpha = 1;
    if (rows > 0) c.drawImage(spr.cv, 0, 0, spr.w, rows, X - spr.ax, top, spr.w, rows);
  }
  // the foam where it stands in the water: the back half (before it is drawn) or the front half (after)
  function foam(c, G, x, yW, rx, front, T, still, a) {
    const ry = Math.max(2, Math.round(rx * 0.09));
    c.fillStyle = 'rgba(214,226,246,' + ((front ? 0.62 : 0.34) * (a == null ? 1 : a)).toFixed(2) + ')';
    for (let i = -rx; i <= rx; i++) {
      const on = hashf(i, Math.floor(still ? 0 : T / 240), 13) > (front ? 0.42 : 0.55);
      if (!on) continue;
      const y = Math.round(ry * Math.sqrt(Math.max(0, 1 - (i / rx) * (i / rx))));
      c.fillRect(x + i, front ? yW + y : yW - y, 1, 1);
    }
  }

  // ---- the swell -----------------------------------------------------------------------------------------------
  // the water heaving up in a mound: an uneven crest (it churns), its flank toward the light paler, water running
  // down it, foam on the crest and at its foot; k: its heave (spray is thrown while it rises)
  function swell(c, G, x, yW, hM, rx, T, still, k) {
    const H = Math.round(hM);
    if (H < 1 || rx < 2) return;
    const C = G.SW, ph = still ? 0 : T / 260, fr = Math.floor(still ? 0 : T / 200);
    // the trough round it, darker
    c.fillStyle = 'rgba(6,10,26,0.35)';
    for (let i = -rx - 6; i <= rx + 6; i++) { const d = Math.abs(i) / (rx + 6); c.fillRect(x + i, yW + 1, 1, Math.max(1, Math.round(3 * (1 - d)))); }
    for (let i = -rx; i <= rx; i++) {
      const u = i / rx, prof = Math.sqrt(Math.max(0, 1 - u * u)), wob = 1 + 0.16 * Math.sin(u * 7.3 + ph) * prof + 0.08 * Math.sin(u * 17 - ph * 1.7);
      const hc = Math.max(0, Math.round(H * prof * wob));
      if (!hc) continue;
      // (the lit and shaded flanks meet the body along a ragged line, not a straight seam)
      const j = (hashf(i, 7, 61) - 0.5) * 0.16, side = u < -0.35 + j ? 1 : u > 0.45 + j ? -1 : 0, tone = (t) => C[clamp(t + side, 0, 3)];
      const a = Math.round(hc * 0.3), b2 = Math.round(hc * 0.66);
      c.fillStyle = tone(0); c.fillRect(x + i, yW - a, 1, a + 1);
      c.fillStyle = tone(1); c.fillRect(x + i, yW - b2, 1, b2 - a);
      c.fillStyle = tone(2); c.fillRect(x + i, yW - hc, 1, hc - b2);
      c.fillStyle = C[3]; c.fillRect(x + i, yW - hc, 1, Math.max(1, Math.round(hc * 0.12)));
      // water running down: a pale thread in a few columns, moving down it
      if (hashf(i, 4, 21) > 0.86) { const run = still ? hc >> 1 : Math.floor((T / 70 + hashf(i, 5, 21) * 40) % hc); c.fillStyle = C[3]; c.fillRect(x + i, yW - hc + run, 1, Math.min(4, hc - run)); }
      // foam: on the crest, and along the foot
      c.fillStyle = C[4];
      if (Math.abs(u) < 0.7 && hashf(i, fr, 31) > 0.45) c.fillRect(x + i, yW - hc - (hashf(i, fr, 35) > 0.8 ? 1 : 0), 1, 1);
      if (hashf(i, fr, 33) > 0.4) c.fillRect(x + i, yW - (hashf(i, 1, 34) > 0.6 ? 1 : 0), 1, 1);
    }
    // spray thrown up from the crest while it heaves
    if (!still && k < 1) {
      c.fillStyle = 'rgba(214,226,246,0.85)';
      for (let j = 0; j < 9; j++) {
        const q = ((T / 650) + hashf(j, 2, 41)) % 1, sx = x + Math.round((hashf(j, 3, 41) - 0.5) * rx * 0.9);
        c.fillRect(sx + Math.round((hashf(j, 6, 41) - 0.5) * 10 * q), Math.round(yW - H - 2 - Math.sin(q * Math.PI) * G.s(12) * (1 - k * 0.5)), 1, 1);
      }
    }
  }
  // pipes twisting up out of the swell, round one another, drawing together at the top (len: how far up)
  function twist(c, G, x, yW, len, T, still) {
    if (len < 2) return;
    const d = Math.max(3, Math.round(G.s(6) * G.ks)), R0 = G.s(26) * G.ks, segs = [];
    for (let j = 0; j < 4; j++) {
      let cur = null, curZ = null;
      for (let v = 0; v <= len; v += 2) {
        const f = v / len, a = (j * Math.PI) / 2 + v * 0.05 + (still ? 0 : T / 900), r = R0 * (1 - 0.7 * f);
        const p = [x + Math.sin(a) * r, yW - v], z = Math.cos(a) >= 0;
        if (cur && z !== curZ) { cur.push(p); segs.push({ z: curZ, pts: cur }); cur = null; }
        if (!cur) { cur = [p]; curZ = z; } else cur.push(p);
      }
      if (cur && cur.length > 1) segs.push({ z: curZ, pts: cur });
    }
    for (const sg of segs) if (!sg.z) pipe(c, sg.pts, d, 1);
    for (const sg of segs) if (sg.z) pipe(c, sg.pts, d, 1);
  }

  // ---- you and your companion, on the ledge -------------------------------------------------------------------
  function people(c, G, stage, T, still) {
    if (G.land) return;
    const S5 = C5(), W = RB.world && RB.world.W, s0 = RB.game && RB.game.s;
    const comp = W && W.comp && W.map ? W.comp.id : null;
    let pcLook = {};
    try { pcLook = RB.equip.look(s0); } catch (e) { pcLook = {}; }
    const pcKey = stage === 'heave' ? 'p:flinch' : stage === 'apart' || stage === 'loosen' ? 'p:observe' : 'i0';
    const cKey = stage === 'face' && comp ? COMP_KEY[comp] || 'i0' : 'i0';
    S5.lampGlow(c, G.lx, G.yL - G.s(24), G.s(G.narrow ? 60 : 56), T, still, 0.14);
    const feet = G.vb - Math.max(2, G.s(3));
    const fp = Q().figure(pcLook, 'up', pcKey, G.sc, S5.HALL);
    const fc = comp ? Q().figure((RB.content.chars[comp] || {}).look || {}, 'up', cKey, G.sc, S5.HALL) : null;
    const x0 = fc ? G.px : G.px + (G.gap >> 1), x1 = G.px + G.gap;
    c.fillStyle = 'rgba(4,8,14,0.5)';
    if (fp) { K().disc(c, x0, feet, Math.round(fp.w * 0.26), Math.max(1, Math.round(fp.h * 0.03))); c.drawImage(fp.cv, x0 - fp.ax, feet - fp.ay); }
    if (fc) { K().disc(c, x1, feet, Math.round(fc.w * 0.26), Math.max(1, Math.round(fc.h * 0.03))); c.drawImage(fc.cv, x1 - fc.ax, feet - fc.ay); }
  }

  // ---- the picture ------------------------------------------------------------------------------------------------
  let last = null; // the size last drawn at (tests)
  function draw(c, w, h, t, st) {
    const S5 = C5();
    if (!S5 || !RB.enemyArt || !RB.enemyArt.P[ART]) { c.fillStyle = '#07080d'; c.fillRect(0, 0, w, h); return; }
    const stage = st.stage, still = !!st.still;
    // the map as it last was, the first time "heave" or "apart" is drawn: the picture dissolves in from it
    if (!entry && (stage === 'heave' || stage === 'apart')) {
      const cv = mk(w, h);
      cv.getContext('2d').drawImage(c.canvas, 0, 0, w, h, 0, 0, w, h);
      entry = { stage, cv };
    }
    const G = geom(w, h, st.vb);
    last = { w, h, vb: st.vb };
    const k = still ? (STILL[stage] != null ? STILL[stage] : 1) : !MS[stage] ? 1 : clamp(st.since / MS[stage], 0, 1);
    const T = still ? 0 : t, s = G.s, ks = G.ks, yK = G.yK, kx = G.kx;
    c.drawImage(back(G).cv, 0, 0);
    S5.stillWater(c, 0, G.wallB + 1, w, h - G.wallB - 1, T, still, 71, [G.lx, s(34)], '150,172,216');
    // the pipes round the bell (they climb as it rises; they hold through the battle; they fall after it)
    const wound = stage === 'heave' ? 0 : stage === 'rise' ? span(k, 0.45, 1) : 1;
    const loose = stage === 'loosen' ? k : 0;
    coils(c, G, 'b', wound, loose);
    c.drawImage(island(G).cv, 0, 0);
    coils(c, G, 'f', wound, loose);
    const rx = Math.round(s(G.narrow ? 74 : 70) * ks), hM = s(28) * ks, frame = still ? 0 : Math.floor(T / 150) % 8;
    if (stage === 'heave') {
      // while the water heaves, the keeper's idle drawings are made ready, one a frame, so it rises without a stall
      if (st.since > ENTER && warm < (still ? 1 : 8)) keeperSprite('idle', warm++, ks);
      const e = ease(k);
      if (e > 0) S5.rings(c, kx, yK, still ? 0.6 : span(k, 0.1, 1), 3, s(130) * ks, 0.16, '176,198,236', 0.5);
      const bob = still ? 1 : 1 + 0.14 * Math.sin(Math.PI * span(k, 0.45, 1)) + (k >= 1 ? 0.03 * Math.sin(T / 520) : 0);
      swell(c, G, kx, yK, hM * e * bob, Math.round(rx * (0.6 + 0.4 * e)), T, still, k);
    } else if (stage === 'rise' || stage === 'face') {
      // the pipes twist up first; the keeper rises through them, the swell falling away round it
      const kb = ease(span(k, 0.28, 0.9)), top = -km().top;
      const Y = Math.round(lerp(yK + top * ks + 2, G.oyK, kb));
      const spr = keeperSprite('idle', frame, ks);
      if (kb > 0) foam(c, G, kx, yK, rx, false, T, still, kb);
      drawKeeper(c, spr, kx, Y, yK, s(30) * ks);
      const tw = 1 - span(k, 0.34, 0.62);
      if (tw > 0) { c.globalAlpha = tw; twist(c, G, kx, yK, Math.round(s(84) * ks * ease(span(k, 0, 0.42))), T, still); c.globalAlpha = 1; }
      swell(c, G, kx, yK, hM * (1 - span(k, 0.3, 0.7)), rx, T, still, 1);
      if (kb > 0) foam(c, G, kx, yK, rx, true, T, still, kb);
      // water running off it as it comes up (and for a moment after)
      const run = still || stage !== 'rise' ? 0 : 1 - span(st.since, MS.rise, MS.rise + 900);
      if (run > 0 && kb > 0.05 && spr) {
        c.fillStyle = 'rgba(200,220,250,' + (0.55 * run).toFixed(2) + ')';
        for (let j = 0; j < 14; j++) {
          const u = hashf(j, 7, 51) * 2 - 1, x0 = Math.round(kx + u * 46 * ks), yt = Math.round(Y - 40 * ks), len = Math.max(2, Math.round((yK - yt) * 0.25));
          const y = yt + Math.floor((T / 40 + j * 13) % Math.max(1, yK - yt));
          if (y < yK - 1) c.fillRect(x0, y, 1, Math.min(len, yK - y));
        }
      }
      if (kb >= 1) {
        if (!still) S5.rings(c, kx, yK, (T / 4200) % 1, 2, s(120) * ks, 0.16, '176,198,236', 0.3);
        else S5.rings(c, kx, yK, 0.45, 1, s(120) * ks, 0.16, '176,198,236', 0.3);
      }
    } else if (stage === 'apart') {
      // as the battle left it, settled low; a moment, then it sinks, and its four pipe legs stand a moment longer and
      // go under one by one
      const kb = ease(span(k, 0.18, 0.55)), top = -km().top;
      const Y = Math.round(lerp(G.oyK, yK + top * ks + 2, kb));
      const spr = keeperSprite('settle', 0, ks);
      foam(c, G, kx, yK, rx, false, T, still, 1 - kb);
      drawKeeper(c, spr, kx, Y, yK, s(30) * ks * (1 - span(k, 0.45, 0.8)));
      foam(c, G, kx, yK, rx, true, T, still, 1 - kb * 0.6);
      if (kb > 0 && kb < 1) S5.rings(c, kx, yK, kb, 3, s(120) * ks, 0.16, '176,198,236', 0.5);
      const d = Math.max(3, Math.round(s(8) * ks)), show = span(kb, 0.5, 0.85);
      LEGS.forEach((lx, j) => {
        const k0 = 0.56 + j * 0.09, gone = ease(span(k, k0, k0 + 0.08));
        const x = Math.round(kx + lx * ks), hh = Math.round(s(j === 1 || j === 2 ? 16 : 20) * ks * show * (1 - gone));
        stub(c, x, yK, hh, d, Math.round((lx < 0 ? -1 : 1) * s(3) * ks));
        const rk = span(k, k0 + 0.06, k0 + 0.3);
        if (rk > 0 && rk < 1) S5.rings(c, x, yK, rk, 2, s(46) * ks, 0.18, '176,198,236', 0.5);
      });
      // then still water where it stood, a slow ring now and then
      if (k >= 1) S5.rings(c, kx, yK, still ? 0.5 : (T / 4600) % 1, 1, s(90) * ks, 0.16, '176,198,236', 0.26);
    } else if (stage === 'loosen') {
      // where the fallen pipes meet the water
      const rk = span(k, 0.62, 1);
      for (const P of coilPaths(G)) {
        const e = P.slack[P.slack.length - 1];
        if (rk > 0 && rk < 1) S5.rings(c, Math.round(e[0]), Math.round(e[1]), rk, 2, s(40), 0.18, '176,198,236', 0.5);
        else if (still || rk >= 1) S5.rings(c, Math.round(e[0]), Math.round(e[1]), 0.6, 1, s(40), 0.18, '176,198,236', 0.22);
      }
    }
    c.drawImage(ledge(G), 0, 0);
    people(c, G, stage, T, still);
    S5.vignette(c, w, h, 0.45, 0.6);
    if (entry && entry.stage === stage && st.since < ENTER && entry.cv.width === w && entry.cv.height === h) {
      c.globalAlpha = 1 - clamp(st.since / ENTER, 0, 1);
      c.drawImage(entry.cv, 0, 0);
      c.globalAlpha = 1;
    }
  }

  RB.interlude.ART.lf_keeper = {
    stages: ['heave', 'rise', 'face', 'apart', 'loosen'],
    draw,
    // tests: where the things the lines name are (buffer px) against the dialogue sheet's top (vb): the keeper as it
    // stands (from its crown down to the water), the sluice plate on its face, the swell, the bell; by default at the
    // size last drawn
    probe(w, h, vb) {
      if (w == null) { if (!last) return null; ({ w, h, vb } = last); }
      const G = geom(w, h, vb), M = km(), I = island(G), ks = G.ks;
      const x0 = Math.round(G.kx + M.left * ks), x1 = Math.round(G.kx + M.right * ks), y0 = Math.round(G.oyK + M.top * ks);
      const rx = Math.round(G.s(G.narrow ? 74 : 70) * ks);
      return {
        w, h, vb: G.vb, lay: G.lay, water: G.yK, ks,
        keeper: { x: x0, y: y0, w: x1 - x0, h: G.yK - y0 },
        plate: [Math.round(G.kx - 15 * ks), Math.round(G.oyK - 26 * ks)],
        swell: { x: G.kx - rx, y: Math.round(G.yK - G.s(28) * ks), w: rx * 2, h: Math.round(G.s(28) * ks) },
        bell: { x: I.bx + I.b.ax - Math.round(I.b.lipR), y: I.by + I.b.y0, w: Math.round(I.b.lipR * 2), h: G.H },
      };
    },
  };
})();
