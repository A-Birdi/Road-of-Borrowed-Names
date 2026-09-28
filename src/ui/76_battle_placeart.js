/* Battle places — the art. Everything the location-aware backdrops draw,
 * authored at art resolution on the same grid as the world (a tile is 32 art
 * px; a character 32×48), so a crate behind a battle is the same size and the
 * same drawing as the crate you walked past:
 *  - world props through their own draw2 (cropped to their pixels, cached);
 *  - small accessories (sacks, a lantern on a crate, hanging scrolls, rope,
 *    tufts, shells…) drawn with the prop kit in the world's style: light from
 *    the upper left, hue-shifted ramps, a selective outline in the object's
 *    own darker colour (never the ink line interactable things carry), a
 *    soft contact shadow;
 *  - elements seen from the battle's eye level: building fronts, a water
 *    wheel, tree lines, rock ridges, water, a path, a back wall with its
 *    posts and beam, doorways, the mill's gear train, light from windows;
 *  - the shells: a room (wall + floor in perspective, lit from the party's
 *    lantern) or open land (sky, far ridges, ground) per region.
 * Nothing here chooses anything: RB.battlePlaces decides what goes where. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.battlePlaceArt = (function () {
  'use strict';
  const K = () => RB.propKit;
  const hh = (a, b, c) => RB.tiles.hh(a, b, c);
  const R = (g, x, y, w, h, c) => { if (w <= 0 || h <= 0) return; g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const PI = Math.PI;
  const mk = (w, h) => RB.sprites.makeCanvas(Math.max(1, w), Math.max(1, h));
  const palOf = (region) => RB.tiles.PAL[region] || RB.tiles.PAL.reedwake;

  // ---- fixed material ramps (dark → light) -------------------------------------------------
  const HESSIAN = ['#4e3e2c', '#7a6246', '#a88e66', '#cdb58a', '#e8d8b0'];
  const FLOUR = ['#b8b0a0', '#d4ccbc', '#e8e2d4', '#f4f0e6', '#fffdf6'];

  // ---- sprites: a canvas, its size and its anchor (the contact point, bottom centre) ----------
  const sprites = new Map();
  function remember(key, build) {
    let s = sprites.get(key);
    if (!s) { s = build(); sprites.set(key, s); if (sprites.size > 600) sprites.delete(sprites.keys().next().value); }
    return s;
  }
  // crop a canvas to its opaque pixels; anchor given in the uncropped canvas
  function crop(cv, ax, ay) {
    const g = cv.getContext('2d', { willReadFrequently: true });
    const W = cv.width, H = cv.height, d = g.getImageData(0, 0, W, H).data;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return { cv: mk(1, 1), w: 1, h: 1, ax: 0, ay: 0 };
    const w = x1 - x0 + 1, h = y1 - y0 + 1, out = mk(w, h);
    out.getContext('2d').drawImage(cv, x0, y0, w, h, 0, 0, w, h);
    return { cv: out, w, h, ax: ax - x0, ay: ay - y0 };
  }
  // A world prop as the world draws it (still frame), cropped; anchor = the
  // bottom centre of its footprint.
  function worldProp(id, region, o) {
    const pd = RB.props.P[id];
    if (!pd) return null;
    o = o || {};
    // a few variants per prop are plenty (the world picks one per tile)
    const v = hh(o.cx | 0, o.cy | 0, 5) % 4;
    const key = 'w|' + id + '|' + region + '|' + v + '|' + (o.o ? JSON.stringify(o.o) : '');
    return remember(key, () => {
      const fw = (o.w || pd.w) * 32, fh = (o.h || pd.h) * 32;
      const W = fw + 96, H = fh + 160, ox = 48, oy = 128;
      const cv = mk(W, H), g = cv.getContext('2d', { willReadFrequently: true });
      g.imageSmoothingEnabled = false;
      const opts = Object.assign({ cx: v * 7, cy: 3, still: true }, o.o || {});
      try {
        if (pd.draw2) pd.draw2(g, ox, oy, palOf(region), 0, opts);
        else { g.save(); g.scale(2, 2); pd.draw(g, ox / 2, oy / 2, palOf(region), 0, opts); g.restore(); }
      } catch (e) { return null; }
      const s = crop(cv, ox + fw / 2, oy + fh);
      s.foot = [fw, fh];
      s.key = key;
      return s;
    });
  }

  // ---- authored accessories (prop-kit style) -------------------------------------------------
  // spec: box [w, h], anchor [ax, ay], draw(g, M, v, pal), shadow [cx, cy, rx, ry, a]?,
  // glow: [x, y, r] for lights (drawn by the composer), outline: false to skip.
  const ACC = {};
  const A = (id, spec) => (ACC[id] = spec);
  function acc(id, region, v) {
    const spec = ACC[id];
    if (!spec) return null;
    v = v || 0;
    return remember('a|' + id + '|' + region + '|' + v, () => {
      const k = K(), pal = palOf(region), M = k.mat(pal);
      const [w, h] = spec.box, pad = 2;
      const cv = k.make(w + pad * 2, h + pad * 2, (g) => {
        g.translate(pad, pad);
        spec.draw(g, M, v, pal, k);
        g.setTransform(1, 0, 0, 1, 0, 0);
        if (spec.outline !== false) k.outline(g, w + pad * 2, h + pad * 2, 'sel');
        if (spec.over) { g.translate(pad, pad); spec.over(g, M, v, pal, k); g.setTransform(1, 0, 0, 1, 0, 0); }
        if (spec.shadow) {
          g.globalCompositeOperation = 'destination-over';
          const s = spec.shadow;
          k.shadow(g, s[0] + pad, s[1] + pad, s[2], s[3], s[4]);
          g.globalCompositeOperation = 'source-over';
        }
      });
      const out = crop(cv, spec.anchor[0] + pad, spec.anchor[1] + pad);
      out.key = 'a|' + id + '|' + region + '|' + v;
      if (spec.glow) out.glow = [spec.glow[0] + pad - (spec.anchor[0] + pad) , spec.glow[1] + pad - (spec.anchor[1] + pad), spec.glow[2]];
      return out;
    });
  }
  const P = (g, x, y, c) => R(g, x, y, 1, 1, c);

  // A flour or grain sack: a soft bag, gathered and tied at the neck.
  A('sack', {
    box: [18, 20], anchor: [9, 19],
    draw(g, M, v, pal, k) {
      const h5 = v === 2 ? ['#44402e', '#6e6848', '#9a9266', '#c0b88a', '#dcd6b0'] : HESSIAN;
      for (let y = 5; y < 19; y++) {
        const u = (y - 5) / 13, half = Math.round(5 + Math.sin(Math.min(1, u * 1.25) * PI * 0.5) * 3 + (u > 0.85 ? -1 : 0));
        for (let x = -half; x <= half; x++) {
          const nx = x / (half + 0.5), l = -0.55 * nx - 0.45 * (u - 0.4) + 0.2;
          R(g, 9 + x, y, 1, 1, h5[l > 0.45 ? 4 : l > 0.15 ? 3 : l > -0.2 ? 2 : l > -0.5 ? 1 : 0]);
        }
      }
      // weave: short vertical creases, clustered
      for (let i = 0; i < 4; i++) R(g, 6 + i * 2 + (i > 1 ? 1 : 0), 9 + (i % 2) * 3, 1, 3, h5[1]);
      if (v === 1) { k.ell(g, 9, 5, 5, 2, FLOUR[3]); R(g, 6, 5, 6, 1, FLOUR[4]); R(g, 5, 6, 8, 1, h5[1]); }
      else {
        // gathered neck and a cord
        R(g, 7, 2, 4, 4, h5[2]); R(g, 7, 2, 1, 4, h5[3]); R(g, 10, 2, 1, 4, h5[1]);
        R(g, 6, 0, 6, 2, h5[3]); R(g, 6, 0, 2, 1, h5[4]);
        R(g, 6, 5, 6, 1, '#6a4a2a'); R(g, 11, 5, 2, 2, '#6a4a2a');
      }
      if (v === 0) { k.ell(g, 9, 13, 3, 2, '#7a5a3a'); k.ell(g, 9, 13, 2, 1, h5[3]); } // a miller's round mark
      if (v !== 2) { R(g, 5, 16, 3, 1, FLOUR[2]); R(g, 11, 17, 2, 1, FLOUR[2]); } // flour dust on the cloth
    },
    shadow: [9, 18, 8, 2, 0.34],
  });
  A('sackLie', {
    box: [24, 12], anchor: [12, 11],
    draw(g, M, v) {
      const h5 = HESSIAN;
      for (let y = 2; y < 11; y++) {
        const u = (y - 2) / 8, half = Math.round(9 + Math.sin(u * PI) * 2);
        for (let x = -half; x <= half; x++) { const l = -0.4 * (x / half) - 0.7 * (u - 0.35); R(g, 12 + x, y, 1, 1, h5[l > 0.35 ? 4 : l > 0.05 ? 3 : l > -0.3 ? 2 : 1]); }
      }
      R(g, 21, 4, 3, 5, h5[2]); R(g, 21, 5, 1, 3, '#6a4a2a');
      for (let i = 0; i < 3; i++) R(g, 6 + i * 4, 5 + (i % 2), 1, 3, h5[1]);
    },
    shadow: [12, 10, 11, 2, 0.32],
  });
  // A little drift of spilled flour.
  A('flour', {
    box: [18, 5], anchor: [9, 4], outline: false,
    draw(g) { R(g, 2, 3, 14, 1, FLOUR[1]); R(g, 4, 2, 10, 1, FLOUR[2]); R(g, 6, 1, 5, 1, FLOUR[3]); R(g, 7, 1, 2, 1, FLOUR[4]); R(g, 15, 3, 2, 1, FLOUR[2]); R(g, 0, 4, 3, 1, FLOUR[1]); },
  });
  // A coil of rope.
  A('rope', {
    box: [16, 8], anchor: [8, 7],
    draw(g, M, v, pal, k) {
      const s = k.FIX.straw;
      k.ell(g, 8, 5, 7, 3, s[1]); k.ell(g, 8, 4, 7, 3, s[2]);
      k.ell(g, 8, 4, 5, 2, s[1]); k.ell(g, 8, 3.6, 4, 1.6, s[3]); k.ell(g, 8, 3.6, 2, 1, s[0]);
      for (let x = 2; x < 14; x += 3) R(g, x, 5, 1, 1, s[0]);
      R(g, 13, 5, 3, 1, s[2]); R(g, 15, 6, 1, 1, s[1]);
    },
    shadow: [8, 6, 7, 2, 0.3],
  });
  // A small lantern (lit), for standing on a crate or a floor. Decorative:
  // selective outline, warm paper panel.
  A('lamp', {
    box: [10, 15], anchor: [5, 14], glow: [5, 7, 22],
    draw(g, M, v, pal, k) {
      const ir = k.FIX.iron, gl = k.FIX.glow;
      R(g, 4, 0, 2, 2, ir[2]); R(g, 1, 2, 8, 2, ir[1]); R(g, 1, 2, 8, 1, ir[3]);
      R(g, 2, 4, 6, 8, gl[2]); R(g, 3, 5, 3, 6, gl[3]); R(g, 4, 6, 1, 4, gl[4]); R(g, 7, 4, 1, 8, gl[1]);
      R(g, 2, 4, 1, 8, ir[1]); R(g, 7, 4, 1, 8, ir[1]); R(g, 1, 12, 8, 2, ir[1]); R(g, 1, 12, 8, 1, ir[2]);
    },
    shadow: [5, 14, 4, 1, 0.3],
  });
  // A lantern hung from a hook on a beam (anchor = the hook).
  A('hangLamp', {
    box: [10, 22], anchor: [5, 0], glow: [5, 14, 24],
    draw(g, M, v, pal, k) {
      const ir = k.FIX.iron, gl = k.FIX.glow;
      R(g, 4, 0, 2, 1, ir[3]); R(g, 5, 1, 1, 6, ir[2]);
      R(g, 2, 7, 6, 2, ir[1]); R(g, 1, 9, 8, 10, gl[2]); R(g, 2, 10, 4, 8, gl[3]); R(g, 3, 11, 2, 5, gl[4]);
      for (const y of [12, 15]) R(g, 1, y, 8, 1, gl[1]);
      R(g, 2, 19, 6, 2, ir[1]); R(g, 4, 21, 2, 1, ir[2]);
    },
  });
  // A hanging scroll on a nail: a paper panel between two rods, brush dashes
  // (never shapes that could be read as characters).
  A('scroll', {
    box: [11, 30], anchor: [5, 0],
    draw(g, M, v, pal, k) {
      const pp = v % 2 ? ['#6f6a5e', '#9c9888', '#c8c4b0', '#e2dfcc', '#f4f2e6'] : k.FIX.paper, wd = M.wood, ink = k.FIX.ink;
      R(g, 5, 0, 1, 3, '#2a2024'); R(g, 3, 2, 5, 1, '#2a2024');
      R(g, 1, 3, 9, 2, wd[1]); R(g, 1, 3, 9, 1, wd[3]); R(g, 0, 3, 1, 2, wd[0]); R(g, 10, 3, 1, 2, wd[0]);
      R(g, 2, 5, 7, 20, pp[2]); R(g, 2, 5, 1, 20, pp[3]); R(g, 8, 5, 1, 20, pp[1]);
      R(g, 3, 6, 5, 18, pp[3]); R(g, 3, 6, 5, 1, pp[4]);
      // a border band and brush dashes
      R(g, 2, 7, 7, 1, v % 3 === 2 ? '#8a5a4a' : '#6a7a8a');
      const dash = (x, y, l) => { R(g, x, y, 1, l, ink[2]); R(g, x, y + l, 1, 1, ink[3]); };
      if (v % 3 === 0) { dash(5, 10, 5); dash(5, 17, 3); }
      else if (v % 3 === 1) { dash(4, 10, 3); dash(6, 11, 6); R(g, 4, 20, 3, 1, ink[3]); }
      else { k.ell(g, 5.5, 14, 2, 2, '#b04a3a'); dash(5, 18, 3); }
      R(g, 1, 25, 9, 2, wd[1]); R(g, 1, 25, 9, 1, wd[2]); R(g, 0, 25, 1, 2, wd[0]); R(g, 10, 25, 1, 2, wd[0]);
    },
  });
  // A broom leaning on the wall (anchor: its foot).
  A('broom', {
    box: [10, 30], anchor: [7, 29],
    draw(g, M, v, pal, k) {
      const wd = M.wood, s = k.FIX.straw;
      k.line(g, 2, 0, 6, 19, wd[3]); k.line(g, 3, 0, 7, 19, wd[1]);
      k.poly(g, [4, 19, 9, 19, 10, 29, 3, 29], s[2]);
      R(g, 4, 19, 6, 2, '#6a4a2a');
      for (let x = 4; x < 10; x += 2) R(g, x, 22, 1, 7, s[1]);
      R(g, 5, 22, 1, 6, s[3]);
    },
    shadow: [7, 29, 5, 1, 0.3],
  });
  // A peg board with a coil of rope and a cloth bag hung on it (anchor: top centre, on the wall).
  A('pegs', {
    box: [30, 22], anchor: [15, 0],
    draw(g, M, v, pal, k) {
      const wd = M.wood, s = k.FIX.straw;
      R(g, 1, 1, 28, 4, wd[2]); R(g, 1, 1, 28, 1, wd[3]); R(g, 1, 4, 28, 1, wd[0]);
      for (const x of [6, 15, 24]) { R(g, x, 3, 2, 3, wd[1]); R(g, x, 3, 1, 1, wd[4]); }
      // rope coil on the first peg
      k.ell(g, 7, 11, 4, 6, s[1]); g.clearRect(6, 8, 2, 7);
      R(g, 4, 7, 1, 8, s[2]); R(g, 10, 8, 1, 7, s[0]); R(g, 5, 16, 4, 1, s[0]);
      // a cloth bag on the middle peg
      k.poly(g, [13, 6, 18, 6, 20, 17, 11, 17], v % 2 ? '#6a7a8a' : '#8a5a4a');
      R(g, 13, 7, 2, 9, v % 2 ? '#8494a4' : '#a4705a'); R(g, 14, 5, 3, 2, '#5a4030');
      // a sickle on the last peg
      if (v % 3 !== 2) { k.line(g, 25, 6, 25, 12, wd[1]); for (let a = 0; a < 7; a++) R(g, 25 + Math.round(Math.cos(a / 6 * PI) * 3), 13 + Math.round(Math.sin(a / 6 * PI) * 3), 1, 1, '#9593a0'); }
    },
  });
  // A plank shelf on two brackets with jars and a bundle on it (anchor: its
  // top centre on the wall).
  A('shelfJars', {
    box: [34, 22], anchor: [17, 0],
    draw(g, M, v, pal, k) {
      const wd = M.wood;
      R(g, 1, 14, 32, 3, wd[3]); R(g, 1, 14, 32, 1, wd[4]); R(g, 1, 16, 32, 1, wd[1]);
      for (const x of [5, 27]) { R(g, x, 17, 2, 4, wd[1]); k.line(g, x + 1, 20, x + 3, 17, wd[2]); }
      const jar = (x, c5, h) => { for (let y = 0; y < h; y++) { const half = y < 2 ? 2 : 3; for (let i = -half; i < half; i++) R(g, x + i, 14 - h + y, 1, 1, k.cylCol(i + half, half * 2, c5)); } R(g, x - 2, 14 - h - 1, 4, 1, c5[1]); };
      jar(7, k.FIX.clay, 8); jar(14, v % 2 ? k.FIX.ceramic : k.FIX.clay, 10);
      if (v !== 1) jar(21, k.FIX.ceramic, 7);
      R(g, 24, 10, 7, 4, k.FIX.paper[2]); R(g, 24, 10, 7, 1, k.FIX.paper[4]); R(g, 27, 10, 1, 4, '#8a5a3a');
    },
  });
  // A woven basket (v: grain, apples, empty).
  A('basket', {
    box: [16, 11], anchor: [8, 10],
    draw(g, M, v, pal, k) {
      const s = k.FIX.straw;
      if (v === 0) { k.ell(g, 8, 3, 6, 2, s[3]); R(g, 4, 2, 8, 1, s[4]); }
      if (v === 1) for (const [x, y] of [[5, 2], [8, 1], [11, 2], [7, 3]]) { k.ell(g, x, y + 1, 2, 2, '#b8483a'); P(g, x - 1, y, '#e88a6a'); }
      k.poly(g, [1, 3, 15, 3, 13, 10, 3, 10], s[2]);
      for (let y = 4; y < 10; y += 2) R(g, 2, y, 12, 1, s[1]);
      for (let x = 3; x < 14; x += 3) R(g, x, 4, 1, 6, s[3]);
      R(g, 1, 3, 14, 1, s[3]);
    },
    shadow: [8, 10, 7, 2, 0.3],
  });
  A('bucket', {
    box: [12, 12], anchor: [6, 11],
    draw(g, M, v, pal, k) {
      const wd = M.wood, ir = k.FIX.iron;
      for (let x = 0; x < 10; x++) R(g, 1 + x, 2, 1, 9, k.cylCol(x, 10, wd));
      R(g, 1, 4, 10, 1, ir[2]); R(g, 1, 9, 10, 1, ir[2]);
      k.ell(g, 6, 2.5, 5, 1.5, wd[0]); R(g, 3, 2, 6, 1, '#3a5a7a');
      k.line(g, 1, 2, 6, -1, ir[3]); k.line(g, 6, -1, 11, 2, ir[3]);
    },
    shadow: [6, 11, 6, 1, 0.3],
  });
  A('jar', {
    box: [10, 13], anchor: [5, 12],
    draw(g, M, v, pal, k) {
      const c5 = v % 2 ? k.FIX.ceramic : k.FIX.clay;
      for (let y = 3; y < 12; y++) { const half = Math.round(3 + Math.sin(((y - 3) / 9) * PI) * 1.6); for (let x = -half; x < half; x++) R(g, 5 + x, y, 1, 1, k.cylCol(x + half, half * 2, c5)); }
      R(g, 3, 1, 4, 2, c5[1]); R(g, 2, 0, 6, 1, c5[2]); R(g, 4, 0, 2, 1, c5[3]);
    },
    shadow: [5, 12, 4, 1, 0.3],
  });
  // A stack of bound books.
  A('books', {
    box: [14, 12], anchor: [7, 11],
    draw(g, M, v, pal, k) {
      const cols = [k.FIX.lacquer, ['#243a4a', '#34546a', '#4a7088', '#6a90a4', '#9ab8c8'], ['#3a4a2a', '#56683a', '#74884e', '#98a868', '#c0cc90'], ['#4a3424', '#6a4c34', '#8e6a48', '#b08c64', '#d0b088']];
      let y = 11;
      for (let i = 0; i < 3 + (v % 2); i++) {
        const c = cols[(i + v) % 4], w = 12 - (i % 2) * 2 - (i === 3 ? 2 : 0), x = 1 + (i % 2) + (i === 2 ? 1 : 0), th = 2 + ((i + v) % 2);
        y -= th;
        R(g, x, y, w, th, c[2]); R(g, x, y, w, 1, c[3]); R(g, x + w - 2, y, 2, th, k.FIX.paper[3]); R(g, x + w - 2, y, 2, 1, k.FIX.paper[4]);
      }
    },
    shadow: [7, 11, 6, 1, 0.3],
  });
  A('papers', {
    box: [16, 7], anchor: [8, 6],
    draw(g, M, v, pal, k) {
      const pp = k.FIX.paper;
      R(g, 1, 2, 14, 4, pp[2]); R(g, 1, 2, 14, 1, pp[4]); R(g, 2, 3, 12, 1, pp[3]); R(g, 1, 5, 14, 1, pp[1]);
      R(g, 7, 1, 2, 5, '#8a5a3a'); R(g, 1, 3, 14, 1, pp[3]);
    },
    shadow: [8, 6, 7, 1, 0.28],
  });
  A('pages', {
    box: [20, 6], anchor: [10, 5], outline: false,
    draw(g, M, v, pal, k) {
      const pp = k.FIX.paper;
      k.poly(g, [1, 4, 8, 2, 11, 4, 4, 6], pp[3]); k.poly(g, [7, 4, 14, 1, 19, 3, 12, 6], pp[2]); k.poly(g, [9, 3, 14, 2, 16, 3, 11, 4], pp[4]);
      R(g, 11, 4, 4, 1, pp[1]); R(g, 3, 4, 3, 1, pp[1]);
      if (v % 2) R(g, 13, 3, 2, 1, k.FIX.ink[3]);
    },
  });
  A('inkpot', {
    box: [12, 10], anchor: [4, 9],
    draw(g, M, v, pal, k) {
      const ink = k.FIX.ink;
      k.ell(g, 4, 6, 3, 3, ink[2]); R(g, 2, 3, 4, 2, ink[1]); R(g, 3, 5, 1, 2, ink[4]);
      k.line(g, 5, 1, 10, 8, M.wood[3]); R(g, 9, 7, 2, 2, ink[1]);
    },
    shadow: [5, 9, 4, 1, 0.3],
  });
  A('candle', {
    box: [6, 12], anchor: [3, 11], glow: [3, 2, 14],
    draw(g, M, v, pal, k) {
      const gl = k.FIX.glow;
      R(g, 2, 0, 2, 3, gl[3]); R(g, 2, 1, 1, 2, gl[4]); R(g, 3, 3, 1, 1, '#2a2024');
      R(g, 1, 4, 4, 6, '#ece6d4'); R(g, 1, 4, 1, 6, '#fffaf0'); R(g, 4, 4, 1, 6, '#c8bea8');
      R(g, 0, 10, 6, 1, k.FIX.brass[2]); R(g, 0, 10, 2, 1, k.FIX.brass[3]);
    },
    shadow: [3, 11, 3, 1, 0.3],
  });
  A('stool', {
    box: [14, 12], anchor: [7, 11],
    draw(g, M) {
      const wd = M.wood;
      R(g, 1, 2, 12, 3, wd[3]); R(g, 1, 2, 12, 1, wd[4]); R(g, 1, 4, 12, 1, wd[1]);
      R(g, 2, 5, 2, 6, wd[2]); R(g, 10, 5, 2, 6, wd[1]); R(g, 6, 5, 2, 5, wd[1]); R(g, 3, 8, 8, 1, wd[1]);
    },
    shadow: [7, 11, 6, 1, 0.3],
  });
  A('pots', {
    box: [18, 16], anchor: [9, 15],
    draw(g, M, v, pal, k) {
      const c5 = v % 2 ? ['#6a5040', '#8e6c54', '#b08a6a', '#c8a888', '#e0c8a8'] : k.FIX.clay;
      const pot = (cx, by, r) => { for (let y = 0; y < r * 2; y++) { const half = Math.round(r * Math.sin(((y + 0.5) / (r * 2)) * PI) + 0.5); for (let x = -half; x < half; x++) R(g, cx + x, by - r * 2 + y, 1, 1, k.cylCol(x + half, half * 2, c5)); } R(g, cx - 2, by - r * 2 - 1, 4, 2, c5[1]); R(g, cx - 2, by - r * 2 - 1, 4, 1, c5[3]); };
      pot(6, 15, 4); pot(13, 15, 3); pot(9, 8, 3);
    },
    shadow: [9, 15, 8, 2, 0.32],
  });
  A('firewood', {
    box: [22, 12], anchor: [11, 11],
    draw(g, M, v, pal, k) {
      const tr = M.trunk, wd = M.wood;
      const log = (x, y) => { R(g, x, y, 6, 4, tr[2]); R(g, x, y, 6, 1, tr[3]); R(g, x + 1, y + 1, 4, 2, wd[3]); R(g, x + 2, y + 1, 2, 2, wd[4]); P(g, x + 2, y + 2, wd[2]); };
      log(1, 7); log(7, 7); log(13, 7); log(4, 3); log(10, 3); if (v % 2) log(7, -1);
    },
    shadow: [11, 11, 10, 2, 0.32],
  });
  A('ashpile', {
    box: [16, 6], anchor: [8, 5], outline: false,
    draw(g, M, v, pal, k) {
      const c = k.FIX.char;
      R(g, 1, 4, 14, 1, c[1]); R(g, 3, 3, 10, 1, c[2]); R(g, 5, 2, 6, 1, c[3]); R(g, 7, 1, 2, 1, c[4]);
      R(g, 9, 3, 1, 1, '#b83a18'); R(g, 5, 4, 1, 1, '#6a1c10');
    },
  });
  A('puddle', {
    box: [22, 5], anchor: [11, 4], outline: false,
    draw(g, M, v, pal) {
      const w = pal.water;
      g.globalAlpha = 0.7; R(g, 2, 2, 18, 2, w[0]); R(g, 4, 1, 13, 1, w[1]); g.globalAlpha = 1;
      R(g, 6, 2, 5, 1, w[2]); R(g, 13, 3, 3, 1, w[3]);
    },
  });
  A('charts', {
    box: [16, 9], anchor: [8, 8],
    draw(g, M, v, pal, k) {
      const pp = ['#5c6c80', '#8e9cae', '#c4ccd4', '#e4e8ea', '#fbfbf7'];
      for (let i = 0; i < 3; i++) { const y = 7 - i * 3 + (i === 2 ? 1 : 0), x = 1 + i * 2; R(g, x, y - 2, 12, 3, pp[2]); R(g, x, y - 2, 12, 1, pp[4]); R(g, x + 11, y - 2, 2, 3, pp[1]); R(g, x + 3, y - 2, 1, 3, '#3a4a70'); }
    },
    shadow: [8, 8, 7, 1, 0.3],
  });
  // ---- outdoor ground detail ----
  A('tuft', {
    box: [12, 10], anchor: [6, 9],
    draw(g, M, v, pal) {
      const gr = v === 2 ? M.reed : M.grass;
      R(g, 2, 8, 8, 1, gr[0]);
      const blades = [[3, 4, -1], [5, 7, 0], [7, 6, 1], [9, 4, 1], [4, 5, 0]];
      for (const [x, hgt, lean] of blades) for (let i = 0; i < hgt; i++) R(g, x + Math.round(lean * i / hgt * 2), 8 - i, 1, 1, i > hgt - 2 ? gr[4] : i > hgt / 2 ? gr[3] : gr[2]);
    },
  });
  A('flowers', {
    box: [14, 10], anchor: [7, 9],
    draw(g, M, v, pal) {
      const gr = M.grass, fl = pal.flower;
      R(g, 2, 8, 10, 1, gr[0]);
      for (const [x, h] of [[3, 5], [6, 7], [9, 6], [11, 4]]) R(g, x, 9 - h, 1, h, gr[2]);
      const c = fl[v % fl.length], c2 = fl[(v + 2) % fl.length];
      for (const [x, y, cc] of [[3, 3, c], [6, 1, c2], [9, 2, c], [11, 4, c2]]) { R(g, x - 1, y, 3, 2, cc); P(g, x, y, '#fff4c0'); }
      R(g, 7, 6, 2, 1, gr[3]); R(g, 4, 6, 1, 1, gr[3]);
    },
  });
  A('pebbles', {
    box: [14, 6], anchor: [7, 5],
    draw(g, M) {
      const s = M.stone;
      const st = (x, y, w, h) => { R(g, x, y, w, h, s[2]); R(g, x, y, w - 1, 1, s[4]); R(g, x + w - 1, y + 1, 1, h - 1, s[1]); };
      st(1, 3, 4, 2); st(6, 2, 5, 3); st(11, 4, 3, 1);
    },
    shadow: [7, 5, 6, 1, 0.26],
  });
  A('stone', {
    box: [14, 10], anchor: [7, 9],
    draw(g, M, v, pal, k) {
      const s = M.stone;
      k.poly(g, [1, 9, 3, 3, 7, 1, 12, 3, 13, 9], s[2]);
      k.poly(g, [3, 4, 7, 2, 10, 3, 6, 6], s[3]); R(g, 5, 3, 3, 1, s[4]);
      k.poly(g, [9, 5, 12, 4, 13, 9, 9, 9], s[1]);
    },
    shadow: [7, 9, 7, 2, 0.3],
  });
  A('mushrooms', {
    box: [11, 9], anchor: [5, 8],
    draw(g, M, v, pal, k) {
      const cap = v % 2 ? ['#6a2a22', '#9a3c2e', '#c05a44', '#d8826a', '#f0b8a0'] : ['#7a6a52', '#a08c6c', '#c4b08c', '#dccaa6', '#f0e4c8'];
      R(g, 2, 5, 2, 3, '#e8e0cc'); k.ell(g, 3, 5, 3, 2, cap[2]); R(g, 1, 4, 3, 1, cap[3]); R(g, 1, 6, 5, 1, cap[1]);
      R(g, 7, 6, 1, 2, '#e8e0cc'); k.ell(g, 7.5, 6, 2, 1.5, cap[2]); R(g, 7, 5, 1, 1, cap[4]);
    },
  });
  A('leaves', {
    box: [18, 5], anchor: [9, 4], outline: false,
    draw(g, M, v, pal) {
      const c = pal.leaf;
      for (const [x, y, i] of [[1, 3, 1], [4, 2, 0], [8, 3, 2], [11, 2, 1], [14, 3, 0], [6, 4, 3]]) { R(g, x, y, 3, 1, c[i]); P(g, x + 1, y - 1, c[(i + 1) % 3]); }
    },
  });
  A('shell', {
    box: [18, 7], anchor: [9, 6],
    draw(g, M, v, pal, k) {
      const d = M.wood;
      // driftwood with a shell beside it
      R(g, 1, 4, 13, 2, '#9a8e7a'); R(g, 1, 4, 13, 1, '#c4baa4'); R(g, 3, 3, 3, 1, '#b0a690'); R(g, 13, 3, 2, 1, '#9a8e7a');
      k.ell(g, 15.5, 4.5, 2, 1.8, '#f0e2d0'); R(g, 15, 3, 1, 3, '#d8b8a0'); void d;
    },
    shadow: [9, 6, 8, 1, 0.26],
  });
  A('snowclump', {
    box: [18, 7], anchor: [9, 6], outline: false,
    draw(g, M) {
      const s = M.snow;
      R(g, 1, 5, 16, 1, s[1]); R(g, 2, 4, 14, 1, s[2]); R(g, 4, 3, 10, 1, s[3]); R(g, 6, 2, 6, 1, s[4]); R(g, 13, 4, 3, 1, s[1]);
    },
  });
  A('twigs', {
    box: [14, 7], anchor: [7, 6], outline: false,
    draw(g, M, v, pal, k) {
      const t = M.trunk;
      k.line(g, 1, 5, 12, 3, t[1]); k.line(g, 5, 4, 7, 1, t[1]); k.line(g, 9, 3, 12, 1, t[2]);
    },
  });
  A('logs', {
    box: [22, 11], anchor: [11, 10],
    draw(g, M, v, pal, k) {
      const tr = M.trunk, wd = M.wood;
      const log = (x, y, w) => { R(g, x, y, w, 4, tr[2]); R(g, x, y, w, 1, tr[3]); R(g, x, y + 3, w, 1, tr[0]); k.ell(g, x + w, y + 2, 2, 2, wd[3]); P(g, x + w, y + 2, wd[2]); };
      log(1, 6, 16); log(3, 2, 13);
    },
    shadow: [11, 10, 10, 2, 0.3],
  });
  A('icicles', {
    box: [16, 10], anchor: [8, 0], outline: false,
    draw(g) { for (const [x, l] of [[1, 5], [4, 8], [7, 4], [10, 9], [13, 6]]) { R(g, x, 0, 2, l - 2, '#d6e6f4'); R(g, x, 0, 1, l - 2, '#ffffff'); R(g, x, l - 2, 1, 2, '#a8c4dc'); } },
  });
  A('cobweb', {
    box: [14, 14], anchor: [0, 0], outline: false,
    draw(g, M, v) {
      g.fillStyle = 'rgba(214,214,224,0.4)';
      const fl = v % 2 ? (x) => 13 - x : (x) => x;
      for (let i = 0; i < 14; i++) { g.fillRect(fl(i), 0, 1, 1); g.fillRect(fl(0), i, 1, 1); g.fillRect(fl(Math.round(i * 0.7)), Math.round(i * 0.7), 1, 1); }
      for (const r of [5, 9]) for (let a = 0; a <= 8; a++) { const an = (a / 8) * PI / 2; g.fillRect(fl(Math.round(Math.cos(an) * r)), Math.round(Math.sin(an) * r), 1, 1); }
    },
  });

  // ---- tints: distance haze, room shadow, sepia ------------------------------------------------
  // a copy of a sprite washed toward a colour (keeps every pixel crisp)
  function tinted(s, col, a) {
    if (!a) return s;
    return remember('t|' + s.key + '|' + col + '|' + a, () => {
      const cv = mk(s.w, s.h), g = cv.getContext('2d');
      g.drawImage(s.cv, 0, 0);
      g.globalCompositeOperation = 'source-atop';
      g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, s.w, s.h);
      return Object.assign({}, s, { cv });
    });
  }

  // ---- elements seen at eye level ------------------------------------------------------------
  // A building's front (its south face, as the map shows it), at `tp` px per
  // tile: stone footing, the wall (wood boards, plaster between timbers, or
  // stone courses), windows and a door where the map puts them, eaves and a
  // shallow roof. x0/by: left edge and ground line.
  const ROOFC = {
    thatch: ['#6a5028', '#8e6e38', '#b89a58', '#d4b872', '#e8d494'],
    slate: ['#2a3038', '#3c4450', '#56606e', '#707a88', '#8e98a4'],
    snow: ['#8a96a4', '#cdd8e2', '#e8eef4', '#f4f8fb', '#ffffff'],
    indigo: ['#22203a', '#3a3860', '#4c4a78', '#6e6ca0', '#8e8cbc'],
    ash: ['#2e2622', '#4a3c36', '#6e5a52', '#8e7870', '#a8948a'],
    tile: ['#4a1e18', '#6f2e22', '#943f2e', '#b2573f', '#cf7a5c'],
    glass: ['#3c6a70', '#5e9496', '#8fc2bc', '#c4e6de', '#f0fff8'],
  };
  function facade(g, x0, by, st, tp, region, o) {
    o = o || {};
    const pal = palOf(region), M = K().mat(pal);
    const W = Math.round(st.w * tp), wallH = Math.round(tp * 1.35), roofH = Math.round(tp * 1.1);
    const wy = by - wallH;
    const roof = ROOFC[st.roof] || ROOFC[region === 'saltglass' ? 'tile' : region === 'lanternfall' ? 'indigo' : 'thatch'];
    const wallKind = st.wall || 'plaster';
    const wd = M.wood, wl = M.wall, sn = M.stone;
    // footing
    R(g, x0, by - 3, W, 3, sn[1]); R(g, x0, by - 3, W, 1, sn[3]);
    // wall
    if (wallKind === 'wood') {
      R(g, x0, wy, W, wallH - 3, wd[2]);
      for (let x = x0 + 2; x < x0 + W; x += 4) { R(g, x, wy, 1, wallH - 3, wd[1]); if (hh(x, st.x | 0, 5) % 3 === 0) R(g, x + 1, wy + 2, 1, wallH - 7, wd[3]); }
    } else if (wallKind === 'stone') {
      R(g, x0, wy, W, wallH - 3, sn[2]);
      for (let y = wy + 1, r = 0; y < by - 3; y += 5, r++) { R(g, x0, y + 4, W, 1, sn[1]); for (let x = x0 + (r % 2) * 4; x < x0 + W; x += 8) R(g, x, y, 1, 4, sn[1]); R(g, x0, y, W, 1, sn[3]); }
    } else {
      R(g, x0, wy, W, wallH - 3, wl[3]);
      R(g, x0, by - 3 - Math.round(tp * 0.35), W, Math.round(tp * 0.35), wd[2]); // board dado
      for (let x = x0; x < x0 + W; x += tp) R(g, x, wy, 2, wallH - 3, wd[1]);
      R(g, x0 + W - 2, wy, 2, wallH - 3, wd[1]);
    }
    // windows and the door, where the map puts them
    const lit = !!o.lit;
    for (const wx of st.windows || []) {
      const cx = x0 + Math.round((wx + 0.5) * tp), ww = Math.max(4, Math.round(tp * 0.42)), wh = Math.max(4, Math.round(tp * 0.42));
      const yy = wy + Math.round(wallH * 0.22);
      R(g, cx - ww / 2 - 1, yy - 1, ww + 2, wh + 2, wd[0]);
      R(g, cx - ww / 2, yy, ww, wh, lit ? '#f4c870' : '#5a7890');
      R(g, cx - ww / 2, yy, ww, 1, lit ? '#fce4a8' : '#8ab0c8');
      R(g, Math.round(cx) - 1, yy, 1, wh, wd[0]); R(g, cx - ww / 2, yy + Math.round(wh / 2), ww, 1, wd[0]);
    }
    if (st.door != null) {
      const cx = x0 + Math.round((st.door + 0.5) * tp), dw = Math.max(5, Math.round(tp * 0.5)), dh = Math.round(wallH * 0.72);
      R(g, cx - dw / 2 - 1, by - 3 - dh - 1, dw + 2, dh + 1, wd[0]);
      R(g, cx - dw / 2, by - 3 - dh, dw, dh, st.to ? wd[1] : wd[2]);
      R(g, cx - dw / 2, by - 3 - dh, dw, 1, wd[3]); R(g, Math.round(cx), by - 3 - dh, 1, dh, wd[0]);
    }
    // eaves (a shadow line under them) and a shallow roof, lit on the left
    const ey = wy - 2;
    R(g, x0 - 2, wy, W + 4, 2, 'rgba(20,14,30,0.35)');
    for (let j = 0; j < roofH; j++) {
      const inset = Math.round((j / roofH) * tp * 0.55), yy = ey - j;
      const col = j < 2 ? roof[1] : j > roofH - 3 ? roof[4] : roof[2 + ((j >> 1) % 2)];
      R(g, x0 - 3 + inset, yy, W + 6 - inset * 2, 1, col);
      R(g, x0 - 3 + inset, yy, 2, 1, roof[3]); R(g, x0 + W + 1 - inset, yy, 2, 1, roof[1]);
    }
    if (st.roof === 'thatch' || !st.roof) for (let x = x0 - 2; x < x0 + W + 2; x += 3) R(g, x, ey + 1, 1, 2, roof[1]);
    if (region === 'snowbell' || st.roof === 'snow') R(g, x0 - 3, ey - roofH + 1, W + 6, 3, '#f4f8fb');
    return { x: x0 - 3, y: ey - roofH, w: W + 6, h: by - (ey - roofH) };
  }
  // A water wheel seen from the side: rim, spokes, paddles, axle.
  function wheel(g, cx, cy, r, region, turning) {
    const M = K().mat(palOf(region)), wd = M.wood;
    const k = K();
    for (let a = 0; a < 16; a++) {
      const an = (a / 16) * PI * 2 + (turning || 0);
      const x = cx + Math.cos(an) * (r + 1), y = cy + Math.sin(an) * (r + 1);
      k.line(g, cx + Math.cos(an) * (r - 2), cy + Math.sin(an) * (r - 2), x + Math.cos(an) * 3, y + Math.sin(an) * 3, wd[1], 2);
    }
    for (let a = 0; a < 64; a++) { const an = (a / 64) * PI * 2; R(g, cx + Math.cos(an) * r - 1, cy + Math.sin(an) * r - 1, 2, 2, a > 8 && a < 40 ? wd[1] : wd[3]); }
    for (let a = 0; a < 6; a++) { const an = (a / 6) * PI * 2 + (turning || 0); k.line(g, cx, cy, cx + Math.cos(an) * r, cy + Math.sin(an) * r, wd[2], 1); }
    k.ell(g, cx, cy, 3, 3, wd[0]); R(g, cx - 1, cy - 1, 2, 1, wd[4]);
  }
  // A line of tree crowns on the horizon (clumps lit from the upper left).
  function treeline(g, x0, x1, base, hgt, seed, region, dark) {
    const M = K().mat(palOf(region));
    const lf = region === 'snowbell' || region === 'sa_mount' ? ['#1c302c', '#223832', '#2f4c46', '#3c5f56', '#557d70'] : M.leaf;
    const pine = region === 'snowbell' || region === 'sa_mount';
    for (let x = x0; x < x1; x += pine ? 7 : 8) {
      const k = hh(x, seed, 3), hh2 = Math.round(hgt * (0.6 + (k % 40) / 100));
      if (pine) {
        for (let j = 0; j < hh2; j++) { const half = Math.round((j / hh2) * 5); R(g, x - half, base - hh2 + j, half * 2 + 1, 1, j % 4 === 0 ? lf[3 - dark] : lf[2 - dark]); }
        R(g, x - 1, base - hh2, 2, 2, region === 'snowbell' ? '#eef3f7' : lf[4]);
      } else {
        const rw = 5 + (k % 3);
        for (let j = 0; j < hh2; j++) {
          const u = j / hh2, half = Math.round(rw * Math.sqrt(Math.max(0, 1 - (1 - u) * (1 - u))));
          R(g, x - half, base - hh2 + j, half * 2 + 1, 1, lf[2 - dark]);
          if (j < hh2 * 0.45) R(g, x - half, base - hh2 + j, Math.max(1, Math.round(half * 0.8)), 1, lf[3 - dark]);
          if (j > hh2 * 0.75) R(g, x + Math.round(half * 0.2), base - hh2 + j, Math.max(1, Math.round(half * 0.8)), 1, lf[1 - Math.min(1, dark)]);
        }
      }
    }
  }
  // A low rocky ridge (cliffs seen beyond the ground).
  function rocks(g, x0, x1, base, hgt, seed, region) {
    const M = K().mat(palOf(region)), s = M.stone;
    const top = (x) => Math.round(base - hgt * (0.55 + 0.45 * Math.abs(Math.sin(x * 0.09 + seed) * 0.7 + Math.sin(x * 0.23 + seed * 1.7) * 0.3)));
    for (let x = x0; x < x1; x++) {
      const t = top(x), tl = top(x - 2), tr = top(x + 2);
      R(g, x, t, 1, base - t, s[1]);
      if (tr < tl) R(g, x, t, 1, Math.min(4, base - t), s[3]); else R(g, x, t, 1, 2, s[2]);
      if ((x + seed) % 11 === 0) R(g, x, t + 4, 1, Math.max(0, base - t - 6), s[0]);
    }
    R(g, x0, base - 1, x1 - x0, 1, s[0]);
  }
  // Water inside a mask (the water cells projected onto the ground): bands,
  // lighter toward the viewer, clustered ripple marks, never blurred.
  function waterIn(g, mask, y0, y1, pal, dark) {
    const w = dark ? ['#0e1426', '#16203a', '#243456', '#5a74a8'] : pal.water;
    const cv = mk(g.canvas.width, g.canvas.height), c2 = cv.getContext('2d');
    for (let y = Math.floor(y0); y < y1; y++) { const u = (y - y0) / Math.max(1, y1 - y0); c2.fillStyle = u < 0.18 ? w[0] : w[1]; c2.fillRect(0, y, cv.width, 1); }
    for (let i = 0; i < Math.round(cv.width * 0.25); i++) {
      const x = hh(i, 7, 1) % cv.width, u = (hh(i, 7, 2) % 1000) / 1000, y = Math.round(y0 + Math.pow(u, 0.8) * (y1 - y0));
      const l = 3 + Math.round(u * 6) + (i % 3);
      c2.fillStyle = i % 4 ? w[2] : w[3]; c2.fillRect(x, y, l, 1);
    }
    c2.globalCompositeOperation = 'destination-in';
    c2.drawImage(mask, 0, 0);
    g.drawImage(cv, 0, 0);
  }

  // ---- shells ------------------------------------------------------------------------------
  const skyBands = (g, W, y0, y1, cols) => { const n = cols.length; for (let i = 0; i < n; i++) { const a = y0 + Math.round(((y1 - y0) * i) / n), b = y0 + Math.round(((y1 - y0) * (i + 1)) / n); R(g, 0, a, W, b - a, cols[i]); if (i) for (let x = (i * 5) % 8; x < W; x += 8) R(g, x, a - 1, 4, 1, cols[i]); } };
  function ridge(g, W, base, amp, seed, col, lit, shade, o) {
    o = o || {};
    const f1 = o.f1 || 0.011, f2 = o.f2 || 0.029, sharp = o.sharp || 1;
    const top = (x) => { const v = Math.sin(x * f1 + seed) * 0.6 + Math.sin(x * f2 + seed * 2.3) * 0.3 + Math.sin(x * f2 * 2.7 + seed * 0.7) * 0.1; return Math.round(base - amp * Math.pow(0.5 + v * 0.5, sharp)); };
    for (let x = 0; x < W; x++) {
      const t = top(x), tl = top(x - 2), tr = top(x + 2);
      R(g, x, t, 1, base - t + 1, col);
      if (lit && tr < tl - 1) R(g, x, t, 1, Math.min(4, base - t), lit);
      else if (shade && tr > tl + 1) R(g, x, t + 1, 1, Math.min(6, base - t), shade);
    }
    return top;
  }
  function cloud(g, x, y, wd, cols) {
    const lobes = [[0, 0, wd * 0.5], [wd * 0.28, -wd * 0.12, wd * 0.34], [-wd * 0.26, -wd * 0.05, wd * 0.28]];
    for (const [lx, ly, r] of lobes) { const ry = Math.round(r * 0.45); for (let j = -ry; j <= 0; j++) { const half = Math.round(r * Math.sqrt(1 - (j / (ry + 0.5)) ** 2)); R(g, x + lx - half, y + ly + j, half * 2, 1, j < -ry * 0.5 ? cols[2] : cols[1]); } }
    R(g, x - wd * 0.5, y, wd, 2, cols[0]);
  }
  // Perspective rows between the horizon and the bottom (nearer rows taller).
  const rowsOf = (HZ, H, n, p) => { const out = []; for (let i = 0; i <= n; i++) out.push(HZ + Math.round((H - HZ) * Math.pow(i / n, p || 1.6))); return out; };

  // Open land per region: sky, far ridges, and the ground's base colour and
  // texture. Local features (water, trees, buildings, a path) are drawn by
  // the composer over this.
  const LAND = {
    reedwake: { sky: ['#5f98b8', '#6fa6c0', '#86b6c6', '#a2c8c6', '#b8d8c0'], cloud: ['#a6c4d0', '#d8e8ea', '#f2f6f0'], ridges: [[0.3, 1.7, '#8fb4b4', '#a2c2bc', '#80a4ac'], [0.16, 4.2, '#6f9a86', '#82ac90', '#5f8a7c']], haze: '#a8cac4' },
    saltglass: { sky: ['#5e8fb8', '#6a9ac0', '#88b0cc', '#b0cadc', '#d8e8f0'], cloud: ['#b8cedc', '#e2ecf2', '#f8fbfc'], ridges: [[0.14, 3.1, '#9aa8b0', '#b0bcc2', '#8a98a2']], haze: '#c8dae4' },
    cinder: { sky: ['#c8805a', '#d8905a', '#e4a86e', '#ecbc80', '#f0c890'], ridges: [[0.34, 2.4, '#b88468', '#c89478', '#a47462', 1.4], [0.15, 5.1, '#9a7a6c', '#aa887a', '#8a6c62']], haze: '#e0b490', chimneys: true },
    snowbell: { sky: ['#7890b2', '#8aa0c0', '#a4b6cc', '#c4d0dc', '#dde6ee'], peaks: true, ridges: [[0.18, 6.2, '#b8c6d6', '#d0dae6', '#a8b8cc']], haze: '#d4dee8' },
    sa_mount: { sky: ['#6a7c9a', '#7a8cac', '#96a6c0', '#b8c4d4', '#d4dce6'], peaks: true, ridges: [[0.18, 6.2, '#aab8c8', '#c4d0dc', '#98a8bc']], haze: '#c4ccd8' },
    lanternfall: { sky: ['#5a5a94', '#6a6aa0', '#8a82b4', '#b4a8d0', '#d8c8e8'], ridges: [[0.12, 2.2, '#8a84b0', '#9c96c0', '#7a74a0']], haze: '#b8b0d4' },
    still: { sky: ['#08090f', '#0a0c18', '#10122a', '#1a1c30'], dotted: true, haze: '#2a2c44' },
    atlas: { sky: ['#c8b890', '#d4c6a0', '#e0d4b4', '#f0e8d0'], grid: true, symbols: true, haze: '#e4d8b8' },
  };
  const GROUND = {
    meadow: (pal) => [pal.grass[1], pal.grass[0], mix(pal.grass[0], pal.grass[3], 0.5), pal.grass[3]],
    sand: (pal) => [pal.sand[0], pal.sand[1], mix(pal.sand[1], pal.sand[0], 0.5), pal.sand[2]],
    snow: () => ['#e2eaf1', '#eef3f7', '#e6edf3', '#d6e2ec'],
    ash: () => ['#948e8a', '#8a8480', '#7c7672', '#6e6864'],
    paper: () => ['#d6ceb8', '#e4ddc8', '#dcd4be', '#c8c0a8'],
    stone: (pal) => [pal.stone[1], pal.stone[0], mix(pal.stone[0], pal.stone[2], 0.4), pal.stone[2]],
    earth: (pal) => [pal.dirt[1], pal.dirt[0], mix(pal.dirt[0], pal.dirt[2], 0.5), pal.dirt[2]],
    parch: () => ['#c0b892', '#b8b08a', '#aca47e', '#a09872'],
  };
  function mix(a, b, t) { return K().mix(a, b, t); }
  function land(g, W, H, HZ, sp) {
    const L = LAND[sp.sky] || LAND.reedwake, pal = palOf(sp.region);
    skyBands(g, W, 0, HZ, L.sky);
    if (L.grid) { for (let x = 0; x < W; x += 32) R(g, x, 0, 1, HZ, 'rgba(160,140,100,0.18)'); for (let y = 0; y < HZ; y += 32) R(g, 0, y, W, 1, 'rgba(160,140,100,0.18)'); }
    if (L.dotted) {
      for (let i = 0; i < 16; i++) { const x = hh(i, 91) % W, y = 8 + (hh(i, 92) % Math.max(1, HZ - 60)); R(g, x, y, 8, 6, '#3a3a4c'); R(g, x, y, 8, 1, '#4c4c60'); }
      const top = (x) => Math.round(HZ - 16 - Math.sin(x * 0.012 + 1) * 12 - Math.sin(x * 0.031) * 5);
      for (let x = 0; x < W; x += 3) R(g, x, top(x), 2, 1, '#4a4a60');
    }
    if (L.cloud && sp.clouds !== false) { cloud(g, W * 0.2, HZ * 0.3, Math.max(40, W * 0.12), L.cloud); cloud(g, W * 0.78, HZ * 0.18, Math.max(30, W * 0.08), L.cloud); }
    if (L.peaks) {
      const top = ridge(g, W, HZ, Math.min(64, HZ * 0.46), 3.3, '#9aaac2', null, null, { sharp: 1.6, f1: 0.014 });
      for (let x = 0; x < W; x++) { const t = top(x), tl = top(x - 2), tr = top(x + 2), cap = HZ - Math.min(64, HZ * 0.46) * 0.55; if (t < cap) R(g, x, t, 1, Math.round(cap - t), tr > tl ? '#c8d4e4' : '#f2f6fa'); }
    }
    for (const r of L.ridges || []) ridge(g, W, HZ, Math.min(46, HZ * r[0]), r[1], r[2], r[3], r[4], { sharp: r[5] || 1 });
    if (L.chimneys && sp.chimneys) for (const fx of sp.chimneys) {
      const x = Math.round(W * fx), top = HZ - 26 - (hh(Math.round(fx * 100), 5) % 10);
      R(g, x, top, 5, HZ - top, '#8a6a5a'); R(g, x, top, 2, HZ - top, '#9a7a68');
      for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(150,130,125,' + (0.45 - i * 0.09).toFixed(2) + ')'; K().ell(g, x + 3 + i * 4, top - 5 - i * 6, 3 + i, 2 + i, g.fillStyle); }
    }
    if (L.symbols) for (let x = 10; x < W; x += 22 + (hh(x, 5) % 14)) {
      const s = 7 + (hh(x, 6) % 7);
      for (let j = 0; j < s; j++) { R(g, x - j, HZ - 4 - s + j, 1, 1, '#8a765a'); R(g, x + j, HZ - 4 - s + j, 1, 1, '#8a765a'); if (j > 1 && j % 2) R(g, x + j - 1, HZ - 4 - s + j, 1, 1, '#b09a7a'); }
    }
    // ground
    const cols = (GROUND[sp.ground] || GROUND.meadow)(pal);
    const rows = rowsOf(HZ, H, cols.length, 1.6);
    for (let i = 0; i < cols.length; i++) { R(g, 0, rows[i], W, rows[i + 1] - rows[i], cols[i]); if (i) for (let x = (i * 5) % 8; x < W; x += 8) R(g, x, rows[i] - 1, 4, 1, cols[i]); }
    R(g, 0, HZ, W, 1, mix(cols[0], '#1c1636', 0.25));
    groundTexture(g, W, H, HZ, sp.ground, pal, sp.seed || 1);
  }
  // Ground texture in clusters, growing toward the viewer. The composer's
  // actor boxes are left plain so the combatants stand on calm ground.
  function groundTexture(g, W, H, HZ, kind, pal, seed) {
    const scatter = (n, sd, fn) => { for (let i = 0; i < n; i++) { const u = (hh(i, sd, 1) % 1000) / 1000, v = (hh(i, sd, 2) % 1000) / 1000; const y = HZ + 3 + Math.round(Math.pow(v, 0.75) * (H - HZ - 4)); fn(Math.round(u * W), y, (y - HZ) / Math.max(1, H - HZ), hh(i, sd, 3)); } };
    if (kind === 'meadow') {
      scatter(Math.round(W * 0.05), 12 + seed, (x, y, d) => { const l = 12 + Math.round(d * 36); R(g, x, y, l, 2 + Math.round(d * 2), pal.grass[0]); R(g, x + 3, y - 1, l - 6, 1, pal.grass[0]); });
      scatter(Math.round(W * 0.2), 11 + seed, (x, y, d, k) => {
        const s = 2 + Math.round(d * 3), bw = d > 0.5 ? 2 : 1;
        R(g, x - s, y, s * 2 + bw, 1, pal.grass[3]);
        R(g, x - s + 1, y - s, bw, s, pal.grass[1]); R(g, x, y - s * 2, bw, s * 2, pal.grass[2]); R(g, x + s - 1, y - s - 1, bw, s + 1, pal.grass[0]);
        if (k % 23 === 0) { R(g, x + s + 2, y - s - 2, 2, 2, pal.flower[k % 4]); }
      });
    } else if (kind === 'sand') {
      scatter(Math.round(W * 0.3), 33 + seed, (x, y, d) => { const l = 4 + Math.round(d * 8); R(g, x, y, l, 1, pal.sand[2]); R(g, x + 1, y - 1, l - 2, 1, pal.sand[1]); });
    } else if (kind === 'snow') {
      scatter(Math.round(W * 0.1), 71 + seed, (x, y, d) => { const l = 10 + Math.round(d * 24); R(g, x, y, l, 2, '#c7d4de'); R(g, x + 2, y - 1, l - 4, 1, '#ffffff'); });
    } else if (kind === 'ash') {
      scatter(Math.round(W * 0.24), 51 + seed, (x, y, d) => { const s = 2 + Math.round(d * 3); R(g, x, y, s + 1, Math.max(1, s - 1), '#5a5450'); R(g, x, y - 1, s, 1, '#a09a94'); });
    } else if (kind === 'paper' || kind === 'parch') {
      const rows = rowsOf(HZ, H, 9, 1.4); for (let i = 1; i < rows.length - 1; i++) R(g, 0, rows[i], W, 1, kind === 'paper' ? '#c8c0aa' : '#a49c76');
    } else if (kind === 'stone') {
      const rows = rowsOf(HZ, H, 7, 1.5); for (let i = 1; i < rows.length - 1; i++) { R(g, 0, rows[i], W, 1, mix(pal.stone[2], '#1c1636', 0.2)); for (let x = (i % 2) * 16; x < W; x += 32) R(g, x, rows[i], 1, rows[i + 1] - rows[i], mix(pal.stone[2], '#1c1636', 0.25)); }
    } else if (kind === 'earth') {
      scatter(Math.round(W * 0.16), 21 + seed, (x, y, d) => R(g, x, y, 3 + Math.round(d * 4), 1, pal.dirt[2]));
    }
  }

  // Rooms: the back wall (the world's wall styles: timber-framed plaster,
  // stone or brick courses), a beam, and the floor in perspective.
  const ROOMS = {
    mill: { wall: 'timber', floor: 'wood', dark: 0.5 },
    kiln: { wall: 'brick', floor: 'flags', dark: 0.55, warm: true },
    archive: { wall: 'stone', floor: 'flags', dark: 0.6, cool: true },
    observatory: { wall: 'stone', floor: 'flags', dark: 0.55, cool: true },
    belltower: { wall: 'stone', floor: 'flags', dark: 0.6, cool: true },
    still: { wall: 'void', floor: 'paper', dark: 0.5 },
    interior: { wall: 'timber', floor: 'wood', dark: 0.35 },
  };
  // the room's own colours, dimmed toward its shadow
  const DUSK = '#281a1e';
  const dimR = (r5, a) => r5.map((c) => mix(c, DUSK, a));
  function room(g, W, H, HZ, sp) {
    const pal = palOf(sp.region), M = K().mat(pal), k = K();
    const wd = dimR(M.wood, 0.28), st = M.stone;
    // plaster in the room's warm shadow
    const WS = '#34201a', wl = [mix(pal.wall[2], WS, 0.68), mix(pal.wall[2], WS, 0.58), mix(pal.wall[1], WS, 0.54), mix(pal.wall[0], WS, 0.52), mix(pal.wall[0], WS, 0.42)];
    const brick = sp.wall === 'brick';
    const beamY = sp.beamY != null ? sp.beamY : Math.round(HZ * 0.3);
    // back wall
    if (sp.wall === 'void') {
      skyBands(g, W, 0, HZ, ['#08090f', '#0a0c18', '#10122a', '#1a1c30']);
    } else if (sp.wall === 'timber') {
      // above the head beam: the dark underside of the floor above, joist ends
      R(g, 0, 0, W, beamY, mix(wd[0], DUSK, 0.5));
      for (let x = hh(W, 5) % 30; x < W; x += 30) { R(g, x, Math.max(0, beamY - 8), 8, 8, wd[1]); R(g, x, Math.max(0, beamY - 8), 8, 1, wd[2]); }
      // plaster panels in soft clusters
      R(g, 0, beamY, W, HZ - beamY, wl[2]);
      for (let i = 0; i < W * HZ / 220; i++) { const x = hh(i, 61) % W, y = beamY + (hh(i, 62) % Math.max(1, HZ - beamY)); R(g, x, y, 3 + (i % 4), 2, i % 3 ? wl[1] : wl[3]); }
      // a tie rail across the panels, and a board dado below it
      const rail = beamY + Math.round((HZ - beamY) * 0.42), dado = HZ - Math.max(18, Math.round((HZ - beamY) * 0.34));
      R(g, 0, rail, W, 5, wd[2]); R(g, 0, rail, W, 1, wd[3]); R(g, 0, rail + 4, W, 1, wd[0]); R(g, 0, rail + 5, W, 1, 'rgba(16,10,24,0.3)');
      R(g, 0, dado, W, HZ - dado, wd[1]);
      for (let x = 0; x < W; x += 7) { R(g, x, dado, 1, HZ - dado, wd[0]); if (hh(x, 9) % 3 === 0) R(g, x + 2, dado + 2, 1, HZ - dado - 6, wd[2]); }
      R(g, 0, dado - 3, W, 3, wd[2]); R(g, 0, dado - 3, W, 1, wd[3]);
    } else {
      const R5 = brick ? ['#3a1c14', '#4a2218', '#5a2c1e', '#6a3624', '#7a4230'] : st;
      const bw = brick ? 14 : 22, bh = brick ? 7 : 12;
      R(g, 0, 0, W, HZ, R5[1]);
      for (let y = HZ - bh, r = 0; y > -bh; y -= bh, r++) {
        const off = r % 2 ? bw >> 1 : 0;
        for (let x = -off; x < W; x += bw) {
          const t = hh(x + 999, r, 7) % 4;
          R(g, x + 1, y + 1, bw - 1, bh - 1, R5[[2, 2, 3, 1][t]]);
          R(g, x + 1, y + 1, bw - 1, 1, R5[Math.min(4, [2, 2, 3, 1][t] + 1)]);
        }
      }
    }
    // the floor
    const fl = sp.floor;
    if (fl === 'wood') {
      const F = dimR([mix(pal.floor[2], '#1c1636', 0.35), pal.floor[2], pal.floor[1], pal.floor[0], mix(pal.floor[0], '#fff0c0', 0.25)], 0.3);
      const rows = rowsOf(HZ, H, 11, 1.45);
      for (let i = 0; i < rows.length - 1; i++) {
        const y0 = rows[i], hgt = rows[i + 1] - y0;
        R(g, 0, y0, W, hgt, F[1 + (i % 3 === 1 ? 1 : 0)]);
        R(g, 0, y0, W, 1, F[0]);
        if (hgt > 3) R(g, 0, y0 + 1, W, 1, F[3]);
        // staggered board ends, spaced wider toward the viewer
        const step = 40 + i * 14;
        for (let x = (hh(i, 3) % step); x < W; x += step + (hh(x, i) % 30)) { R(g, x, y0, 1, hgt, F[0]); R(g, x + 1, y0 + 1, 1, Math.max(0, hgt - 1), F[3]); }
        // grain in short clustered streaks
        for (let j = 0; j < W / 18; j++) { const x = hh(j, i, 9) % W; if (hgt > 4) R(g, x, y0 + 2 + (hh(j, i, 10) % Math.max(1, hgt - 3)), 3 + (j % 5), 1, F[j % 2 ? 0 : 2]); }
      }
    } else if (fl === 'paper') {
      const rows = rowsOf(HZ, H, 4, 1.6), cols = ['#d6ceb8', '#e4ddc8', '#dcd4be', '#c8c0a8'];
      for (let i = 0; i < 4; i++) R(g, 0, rows[i], W, rows[i + 1] - rows[i], cols[i]);
      const r2 = rowsOf(HZ, H, 10, 1.4); for (let i = 1; i < r2.length - 1; i++) R(g, 0, r2[i], W, 1, '#c8c0aa');
      R(g, Math.round(W * 0.07), HZ, 1, H - HZ, '#d4a8a0');
    } else {
      // flagstones: rows, and joints that converge on the vanishing point
      const S5 = brick ? ['#3a2c28', '#443630', '#4a3a34', '#56443c', '#62504a'] : sp.cool ? ['#262a3e', '#2e3248', '#343852', '#3e4460', '#4a5270'] : [mix(pal.stone[2], '#1c1636', 0.45), mix(pal.stone[2], '#1c1636', 0.2), pal.stone[2], pal.stone[0], pal.stone[1]];
      const rows = rowsOf(HZ, H, 8, 1.5);
      for (let i = 0; i < rows.length - 1; i++) { R(g, 0, rows[i], W, rows[i + 1] - rows[i], S5[1 + (i % 2)]); R(g, 0, rows[i], W, 1, S5[0]); if (rows[i + 1] - rows[i] > 3) R(g, 0, rows[i] + 1, W, 1, S5[3]); }
      const vx = W * 0.5;
      for (let x = -W; x < W * 2; x += 40) for (let i = 0; i < rows.length - 1; i++) {
        const u = (rows[i] - HZ) / Math.max(1, H - HZ), off = (i % 2) * 20;
        const xx = Math.round(vx + (x + off - vx) * (0.3 + u * 1.1));
        R(g, xx, rows[i], 1, rows[i + 1] - rows[i], S5[0]);
      }
    }
    // skirting where the wall meets the floor, and a head beam
    if (sp.wall !== 'void') {
      R(g, 0, HZ - 5, W, 5, sp.wall === 'timber' ? wd[1] : mix(st[0], '#1c1636', 0.3));
      R(g, 0, HZ - 5, W, 1, sp.wall === 'timber' ? wd[3] : st[2]);
      R(g, 0, HZ, W, 2, 'rgba(16,10,24,0.45)');
    }
  }
  // How each kind of building is built, on its back wall (architecture, not
  // furniture): the Drowned Archive's arched bays, the observatory's
  // pilasters under a frieze of charted stars, the bell tower's timber braces
  // against the stone, soot above a kiln's floor. x0: where the stage begins.
  function wallDress(g, W, HZ, beamY, kind, region, x0) {
    const k = K(), M = k.mat(palOf(region)), st = M.stone;
    const dk = (c, a) => mix(c, '#12101c', a);
    if (kind === 'archive') {
      const bay = 64, top = beamY + 12;
      for (let x = x0 - bay; x < W + bay; x += bay) {
        // a recessed bay under a round arch, a pilaster between bays
        const cx = x + bay / 2, r = bay / 2 - 7;
        R(g, x + 7, top + r, bay - 14, HZ - 6 - top - r, dk(st[1], 0.55));
        k.ell(g, cx, top + r, r, r, dk(st[1], 0.55)); R(g, x + 7, top + r, bay - 14, r, dk(st[1], 0.55));
        for (let a = 0; a <= 24; a++) { const an = PI + (a / 24) * PI; R(g, cx + Math.cos(an) * (r + 1) - 1, top + r + Math.sin(an) * (r + 1) - 1, 3, 3, a < 12 ? dk(st[3], 0.3) : dk(st[2], 0.35)); }
        R(g, x, top - 4, 7, HZ - top - 1, dk(st[2], 0.3)); R(g, x, top - 4, 2, HZ - top - 1, dk(st[3], 0.25)); R(g, x + 6, top - 4, 1, HZ - top - 1, dk(st[0], 0.3));
        // tide marks: the water once stood higher
        R(g, x + 7, HZ - 22, bay - 14, 1, 'rgba(120,160,200,0.25)'); R(g, x + 7, HZ - 16, bay - 14, 2, 'rgba(40,60,90,0.35)');
      }
    } else if (kind === 'observatory') {
      for (let x = x0 - 36; x < W + 72; x += 72) { R(g, x, beamY + 8, 8, HZ - beamY - 13, dk(st[2], 0.25)); R(g, x, beamY + 8, 2, HZ - beamY - 13, dk(st[3], 0.2)); R(g, x + 7, beamY + 8, 1, HZ - beamY - 13, dk(st[0], 0.3)); }
      R(g, 0, beamY + 12, W, 8, '#1c2440'); R(g, 0, beamY + 12, W, 1, '#3a4670'); R(g, 0, beamY + 19, W, 1, '#10142a');
      for (let x = 3; x < W; x += 11) { const q = hh(x, 3, 9) % 7; if (q < 3) R(g, x, beamY + 14 + (q * 2), 1, 1, q ? '#c8d4f0' : '#f4e8b0'); }
    } else if (kind === 'belltower') {
      const wd = dimR(M.wood, 0.35);
      for (let x = x0 - 48; x < W + 96; x += 96) {
        R(g, x, beamY + 8, 6, HZ - beamY - 13, wd[2]); R(g, x, beamY + 8, 1, HZ - beamY - 13, wd[3]);
        k.line(g, x + 6, HZ - 12, x + 50, beamY + 14, wd[1], 4); k.line(g, x + 6, HZ - 13, x + 50, beamY + 13, wd[2], 1);
      }
    } else if (kind === 'kiln') {
      for (let x = hh(W, 2) % 50; x < W; x += 50 + (hh(x, 4) % 40)) for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(20,10,8,' + (0.12 - i * 0.02).toFixed(2) + ')'; g.fillRect(x - i * 2, beamY + 10 + i * 6, 14 + i * 4, HZ - beamY - 16 - i * 6); }
    }
  }
  // Wall posts (timber rooms) and a beam across the top at `beamY`.
  function posts(g, xs, HZ, beamY, region) {
    const M = K().mat(palOf(region)), wd = dimR(M.wood, 0.3);
    for (const x of xs) { R(g, x, beamY, 6, HZ - beamY - 5, wd[2]); R(g, x, beamY, 1, HZ - beamY - 5, wd[3]); R(g, x + 5, beamY, 1, HZ - beamY - 5, wd[0]); R(g, x + 1, beamY + 9, 4, 2, wd[1]); }
  }
  function beam(g, W, y, region, stone) {
    const M = K().mat(palOf(region)), wd = dimR(stone ? M.stone : M.wood, 0.3);
    R(g, 0, y, W, 9, wd[2]); R(g, 0, y, W, 2, wd[3]); R(g, 0, y + 8, W, 1, wd[0]);
    for (let x = hh(y, 3) % 40; x < W; x += 36 + (hh(x, y) % 24)) R(g, x, y + 3, 5 + (x % 4), 1, wd[1]);
    R(g, 0, y + 9, W, 2, 'rgba(16,10,24,0.35)');
  }
  // A dark opening in the back wall (a doorway, a passage) with a lintel.
  function doorway(g, cx, HZ, w, h, region, stone) {
    const M = K().mat(palOf(region)), wd = stone ? M.stone : M.wood;
    R(g, cx - w / 2 - 3, HZ - h - 4, w + 6, h + 4, wd[1]);
    R(g, cx - w / 2 - 3, HZ - h - 4, w + 6, 2, wd[3]);
    R(g, cx - w / 2, HZ - h, w, h, '#120e18'); R(g, cx - w / 2, HZ - h, w, 3, '#0a0810');
    R(g, cx - w / 2 + 2, HZ - 6, w - 4, 6, 'rgba(60,50,70,0.5)');
  }
  // A wooden pit wheel: a rim of pegged cogs on a cross of arms, lit along
  // its upper left, in the room's shadow; its axle runs back into the wall.
  function bigGear(g, cx, cy, r, region, lit) {
    const k = K(), ir = k.FIX.iron, M = k.mat(palOf(region));
    const wd = dimR(M.wood, lit ? 0.1 : 0.3);
    const cw = wd[1], rim = wd[2], hi = wd[3], lo = wd[0];
    // cogs: short pegs standing out of the rim, lit ones on the upper left
    const teeth = Math.max(16, Math.round(r / 2.4));
    for (let a = 0; a < teeth; a++) {
      const an = (a / teeth) * PI * 2, lt = Math.cos(an - PI * 1.25) > 0.3;
      const x = cx + Math.cos(an) * (r + 2), y = cy + Math.sin(an) * (r + 2);
      k.line(g, cx + Math.cos(an) * (r - 1), cy + Math.sin(an) * (r - 1), x + Math.cos(an) * 2, y + Math.sin(an) * 2, lt ? hi : cw, 4);
    }
    // the rim (a ring of felloes) and the dark space inside it
    k.ell(g, cx, cy, r, r, rim); k.ell(g, cx, cy, r - 5, r - 5, mix(lo, DUSK, 0.45));
    for (let a = 0; a < 8; a++) { const an = (a / 8) * PI * 2 + 0.2; R(g, cx + Math.cos(an) * (r - 2.5) - 1, cy + Math.sin(an) * (r - 2.5) - 1, 2, 2, lo); }
    // two crossed arms, and the square axle block
    for (const an of [0.35, 0.35 + PI / 2]) {
      k.line(g, cx - Math.cos(an) * (r - 4), cy - Math.sin(an) * (r - 4), cx + Math.cos(an) * (r - 4), cy + Math.sin(an) * (r - 4), cw, 5);
      k.line(g, cx - Math.cos(an) * (r - 4), cy - Math.sin(an) * (r - 4) - 2, cx + Math.cos(an) * (r - 4), cy + Math.sin(an) * (r - 4) - 2, hi, 1);
    }
    R(g, cx - 6, cy - 6, 12, 12, lo); R(g, cx - 5, cy - 5, 10, 10, cw); R(g, cx - 5, cy - 5, 10, 2, hi); R(g, cx - 2, cy - 2, 4, 4, ir[1]);
    // light along the upper-left of the rim
    for (let a = 0; a < 26; a++) { const an = PI * 1.02 + (a / 26) * PI * 0.5; R(g, cx + Math.cos(an) * (r - 1), cy + Math.sin(an) * (r - 1), 2, 1, hi); }
  }
  // Stairs going down through the floor: an opening with a lip and the first
  // steps falling away into the dark (x, y: the near-left corner of the opening).
  function stairsDown(g, x, y, w, region) {
    const M = K().mat(palOf(region)), wd = dimR(M.wood, 0.25);
    const d = Math.round(w * 0.42);
    R(g, x, y - d, w, d, '#0c0810');
    for (let i = 0; i < 4; i++) { const yy = y - d + 3 + i * Math.round(d / 4); R(g, x + 3, yy, w - 6, 2, i ? mix(wd[1], '#0c0810', i * 0.22) : wd[2]); }
    R(g, x - 2, y - d - 2, w + 4, 2, wd[3]); R(g, x - 2, y, w + 4, 2, wd[1]);
    R(g, x - 2, y - d - 2, 2, d + 4, wd[2]); R(g, x + w, y - d - 2, 2, d + 4, wd[0]);
    // a handrail post at the far corner
    R(g, x + w - 2, y - d - 20, 3, 20, wd[2]); R(g, x + w - 2, y - d - 20, 1, 20, wd[3]); R(g, x + 2, y - d - 18, w - 1, 2, wd[2]);
  }
  // Pale light from a window behind the viewer: a slanted band falling to the
  // floor and a lit patch where it lands (translucent, stepped, never blurred).
  function shaft(g, x, yTop, yFloor, H, w) {
    for (let y = yTop; y < yFloor; y++) {
      const off = Math.round((y - yTop) * 0.42), a = 0.02 + 0.035 * ((y - yTop) / Math.max(1, yFloor - yTop));
      g.fillStyle = 'rgba(246,230,180,' + a.toFixed(3) + ')';
      g.fillRect(Math.round(x - off), y, w + Math.round(off * 0.25), 1);
    }
    const off = Math.round((yFloor - yTop) * 0.42), fx = x - off;
    for (let i = 0; i < 3; i++) K().ell(g, fx + w / 2 + 6, yFloor + 8, (w * 0.9 + 10) * (1 - i * 0.28), 7 * (1 - i * 0.25), 'rgba(250,226,160,0.07)');
    void H;
  }
  // Warm light: stepped translucent ellipses (never blurred).
  function pool(g, cx, cy, rx, ry, rgb, a) {
    const k = K();
    for (let i = 4; i >= 1; i--) k.ell(g, cx, cy, (rx * i) / 4, (ry * i) / 4, 'rgba(' + rgb + ',' + ((a * (5 - i)) / 10).toFixed(3) + ')');
  }
  // Shade over a rect in steps (a vignette toward the top or sides).
  function shade(g, x, y, w, h, rgb, a0, a1, steps, vertical) {
    steps = steps || 6;
    for (let i = 0; i < steps; i++) {
      const a = a0 + (a1 - a0) * (i / (steps - 1));
      g.fillStyle = 'rgba(' + rgb + ',' + a.toFixed(3) + ')';
      if (vertical) g.fillRect(Math.round(x), Math.round(y + (h * i) / steps), Math.round(w), Math.ceil(h / steps));
      else g.fillRect(Math.round(x + (w * i) / steps), Math.round(y), Math.ceil(w / steps), Math.round(h));
    }
  }

  return {
    worldProp, acc, tinted, facade, wheel, treeline, rocks, waterIn, land, room, wallDress, posts, beam, doorway, bigGear, stairsDown, shaft, pool, shade, dimR, DUSK,
    ROOMS, LAND, GROUND, ACC, palOf, R, ridge,
  };
})();
