/* Harmony portrait art — the paired busts shown when a real Harmony technique
 * reaches its animation interval (Harmony addendum §4–§6, §21). This module
 * draws and caches the art; placement, timing and lifecycle belong to the
 * cut-in overlay, which builds on this API.
 *
 * The composition: the companion on the left and the player on the right,
 * both turned toward the shared action, the player a little in front so the
 * companion's far shoulder sits behind the player's near one (never a face).
 * Behind them a small indigo ink backing with sparse gold and paper edging
 * and a ragged, tapering right end; its left edge bleeds off the canvas so
 * the cluster reads as having entered from the left. No title, slogan or
 * lettering is drawn into the art.
 *
 * Native sizes (art px, drawn nearest-neighbour at an integer CSS scale):
 *   standard 228 × 100 — about 35 % × 26–28 % of a 1280 × 720 or 1920 × 1080
 *            view at 2× / 3× (fitScale picks the largest scale inside §5.2's
 *            upper limits: 42 % width, 30 % height, 12 % area)
 *   compact  an authored head-and-shoulders pair for narrow screens
 *            160 × 84, up to the view's width (≥ 64 CSS px of face height per
 *            participant at 2×: a 390 × 844 or 320 × 640 phone)
 * docs/harmony/ART.md records how these were chosen.
 *
 * API
 *   RB.harmonyArt.compose({ comp, look, variant, phase, still, backing, fx, omit, view })
 *     → { cv, w, h, faces: [{ who, x, y, w, h }], hands: [{ who, x, y, w, h }],
 *         anchor: { x, y }, scale, bleed, bounds, key, phase, variant }
 *     comp 'nao'|'mio'|'ren'|'suzu'; look: the player's effective look (default
 *     RB.equip.look() of the running game); variant 'standard'|'compact';
 *     phase 'enter'|'hold'; still (reduced motion) → the hold drawing;
 *     backing/fx false leave out the backing / the glints and ink (art review);
 *     omit 'pc'|'comp' leaves one bust out (tests); view { w, h } CSS px → scale.
 *     faces/hands are rectangles in cv's art px; anchor is the point on the
 *     backing's left edge, half way down it, where the cluster enters.
 *   RB.harmonyArt.bust(who, look, pose, phase[, variant]) → { cv, w, h, face, hands, anchor }
 *   RB.harmonyArt.prepare(spec | [spec], { async }) — build into the caches (in idle
 *     slices with async: true → Promise)
 *   RB.harmonyArt.fitScale(viewW, viewH, variant) → integer CSS px per art px (0: none fits)
 *   RB.harmonyArt.stats(), clear(), keyOf(spec)
 * Caches: busts and compositions, least-recently-used, bounded (CAP); keys carry
 * ART_VERSION, the resolved appearance (every art-relevant field of the effective
 * look), the companion, pose, phase and variant. An equipment change drops the
 * player's stale entries; a campaign change clears everything. Nothing here
 * animates or loops: 'enter' and 'hold' are two still drawings. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.harmonyArt = (function () {
  'use strict';
  const ART_VERSION = 1;
  const HK = () => RB.harmonyKit;
  const COMPANIONS = ['nao', 'mio', 'ren', 'suzu'];
  const POSE_OF = { pc: 'rally', nao: 'route', mio: 'draught', ren: 'ward', suzu: 'curtain' };
  const NATIVE = { standard: { w: 228, h: 100 }, compact: { w: 160, h: 84 } };
  // where each bust's anchor (pit of the neck) sits in the composition
  const PLACE = {
    standard: { comp: [70, 72], pc: [136, 74], nao: [62, 72] },
    compact: { comp: [45, 72], pc: [108, 73] },
  };
  const CAP = { busts: 24, comps: 16 };
  const S = { hits: 0, misses: 0, builds: 0, evictions: 0, buildMs: [], invalidations: 0 };
  const busts = new Map(), comps = new Map();
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  function lru(map, key) {
    const v = map.get(key);
    if (v) { map.delete(key); map.set(key, v); }
    return v;
  }
  function store(map, key, v, cap) {
    map.set(key, v);
    while (map.size > cap) { map.delete(map.keys().next().value); S.evictions++; }
  }

  // ---- looks ---------------------------------------------------------------------------------------
  function effectiveLook(look) {
    if (look) return look;
    try { return (RB.equip && RB.game && RB.game.s && RB.equip.look(RB.game.s)) || {}; } catch (e) { return {}; }
  }
  function norm(o) {
    o = o || {};
    const variant = o.variant === 'compact' ? 'compact' : 'standard';
    const phase = o.still ? 'hold' : o.phase === 'enter' ? 'enter' : 'hold';
    const comp = COMPANIONS.includes(o.comp) ? o.comp : null;
    return { comp, variant, phase, look: effectiveLook(o.look), backing: o.backing !== false, fx: o.fx !== false, omit: o.omit || null, view: o.view || null };
  }
  function bustKey(who, look, pose, phase, variant, fx) {
    return ['v' + ART_VERSION, who, pose, phase, variant, fx === false ? 'nofx' : 'fx', who === 'pc' ? HK().lookKey(look) : '-'].join('|');
  }
  function keyOf(o) {
    const n = norm(o);
    return ['v' + ART_VERSION, n.comp, n.variant, n.phase, n.backing ? 'b' : 'nb', n.fx ? 'fx' : 'nofx', n.omit || '-', HK().lookKey(n.look)].join('|');
  }

  // ---- busts ---------------------------------------------------------------------------------------
  function bustLayer(who, look, pose, phase, variant, fx) {
    const key = bustKey(who, look, pose, phase, variant, fx);
    let b = lru(busts, key);
    if (b) { S.hits++; return b; }
    S.misses++;
    const t0 = now();
    b = HK().drawBust(who, look, pose, phase, variant, { fx: fx !== false });
    b.key = key;
    S.builds++;
    S.buildMs.push(now() - t0);
    if (S.buildMs.length > 64) S.buildMs.shift();
    store(busts, key, b, CAP.busts);
    return b;
  }
  function bust(who, look, pose, phase, variant) {
    who = who || 'pc';
    const b = bustLayer(who, effectiveLook(look), pose || POSE_OF[who] || 'rally', phase === 'enter' ? 'enter' : 'hold', variant === 'compact' ? 'compact' : 'standard', true);
    if (!b.cv) b.cv = b.layer.canvas();
    return { cv: b.cv, w: b.w, h: b.h, face: Object.assign({}, b.face), hands: b.hands.map((r) => Object.assign({}, r)), anchor: Object.assign({}, b.anchor), key: b.key };
  }

  // ---- the backing ---------------------------------------------------------------------------------
  // Deterministic shape and strokes per variant (a hash of the column and row, never Math.random).
  const hh = (x, y, k) => { let h = (x * 374761393 + y * 668265263 + (k || 0) * 2246822519) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return (h ^ (h >>> 16)) >>> 0; };
  // The band: its top edge a brush's edge (a slow wave with a few nicks), its lower edge a straight cut rising
  // gently to the right, its right end a handful of brush tails of different lengths.
  function edges(variant) {
    const N = NATIVE[variant];
    const cmp = variant === 'compact';
    const top0 = cmp ? 24 : 26, rise = cmp ? 0.03 : 0.045;
    const top = (x) => top0 - x * rise + Math.sin(x / 23) * 1.2 + Math.sin(x / 7.3 + 1) * 0.5 + ((hh(x >> 3, 1) % 7) === 0 ? 1 : 0);
    const bot = (x) => N.h - (cmp ? 3 : 4) - x * (cmp ? 0.04 : 0.075);
    return { top, bot, end: N.w - (cmp ? 4 : 6) };
  }
  function backing(variant) {
    const K = RB.pxkit, N = NATIVE[variant], cmp = variant === 'compact';
    const L = K.layer(N.w, N.h);
    const ink = HK().M('backing', '#222a52', { cols: ['#11152e', '#191f42', '#212a52', '#2b3562', '#384476'], at: 2, line: false });
    const E = edges(variant);
    // brush tails at the right: [row from the band's top (0..1), length back from the end]
    const tails = cmp ? [[0.1, 30], [0.32, 10], [0.55, 0], [0.78, 16], [0.95, 34]] : [[0.06, 40], [0.22, 18], [0.4, 4], [0.58, 0], [0.74, 12], [0.9, 28], [1, 44]];
    const span = (x) => Math.max(1, E.bot(x) - E.top(x));
    const endAt = (x, y) => {
      const t = (y - E.top(x)) / span(x);
      let best = -1e9;
      for (const [ty, back] of tails) { const d = Math.abs(t - ty) * span(x); const reach = E.end - back - d * d * 0.9; best = Math.max(best, reach); }
      return best;
    };
    // long horizontal strokes laid along the band, each a few rows deep, tapered at both ends
    const strokes = [];
    const nS = cmp ? 9 : 13;
    for (let i = 0; i < nS; i++) {
      const t = (i + 0.5) / nS;
      const x0 = (hh(i, 51) % 60) - 30, len = 70 + (hh(i, 53) % 110);
      strokes.push({ t, x0, x1: x0 + len, h: 2 + (hh(i, 55) % 3), k: hh(i, 57) % 4 === 0 ? 3 : 2 });
    }
    for (let y = 0; y < N.h; y++) for (let x = 0; x < N.w; x++) {
      const yt = E.top(x), yb = E.bot(x);
      if (y < yt || y > yb || x > endAt(x, y)) continue;
      const t = (y - yt) / (yb - yt);
      let k = 1;
      for (const s of strokes) {
        const c = yt + s.t * (yb - yt);
        const taper = Math.min(1, Math.min(x - s.x0, s.x1 - x) / 14);
        if (taper <= 0) continue;
        if (Math.abs(y + 0.5 - c) < s.h * 0.5 * taper + 0.2) k = Math.max(k, s.k);
      }
      if (t < 0.1 || t > 0.93) k = Math.min(k, 1);
      // dry brush at the tails: the stroke breaks up into its hairs near the end
      const ex = endAt(x, y) - x;
      if (ex < 6 && ((hh(x, y, 3) % 3) === 0 || (y & 1))) { if (ex < 3) continue; k = Math.min(k, 2); }
      HK().put(L, x, y, ink, k);
    }
    // a lit hairline where the brush laid the ink thin, two thirds down
    for (let x = 10; x < E.end - 40; x++) {
      if (hh(x >> 4, 5) % 3 === 0) continue;
      const y = Math.round(E.top(x) + span(x) * 0.66 + Math.sin(x / 17) * 1.5);
      if (HK().get(L, x, y)) HK().put(L, x, y, ink, 4);
    }
    // sparse edging: gold along the top in a few long broken runs, paper flecks along the bottom
    const gold = HK().M('edgeGold', '#d8b060', { cols: ['#8a6428', '#c89a48', '#e8c878'], at: 1, line: false });
    const paper = HK().M('edgePaper', '#efe4c8', { cols: ['#a89a80', '#d8ccb0', '#efe4c8'], at: 1, line: false });
    for (let x = 0; x < E.end - 30; x++) {
      const seg = Math.floor((x + 7) / 26);
      if (hh(seg, 21) % 3 === 0 || (x + 7) % 26 > 19) continue;
      const y = Math.floor(E.top(x)) - 1;
      HK().put(L, x, y, gold, (x + 7) % 26 < 2 ? 0 : (x + 7) % 26 > 16 ? 0 : 1);
      if ((x + 7) % 26 === 6) HK().put(L, x, y, gold, 2);
    }
    for (let x = 3; x < E.end - 36; x++) {
      const seg = Math.floor(x / 15);
      if (hh(seg, 31) % 2 || x % 15 > 9) continue;
      HK().put(L, x, Math.ceil(E.bot(x)) + 1, paper, x % 15 === 4 ? 2 : 1);
    }
    for (let i = 0; i < (cmp ? 4 : 6); i++) {
      const tt = 0.15 + (hh(i, 41) % 70) / 100;
      const x = Math.round(E.end - 6 - (hh(i, 43) % 26));
      const y = Math.round(E.top(x) + span(x) * tt);
      if (HK().get(L, x, y) || HK().get(L, x - 1, y)) continue;
      HK().put(L, x, y, paper, 1);
    }
    return { L, E, endAt };
  }
  const backs = new Map();
  function backingOf(variant) {
    let b = backs.get(variant);
    if (!b) { b = backing(variant); backs.set(variant, b); }
    return b;
  }

  // ---- composition ---------------------------------------------------------------------------------
  function blit(dst, src, dx, dy, clip) {
    for (let y = 0; y < src.h; y++) {
      const Y = y + dy;
      if (Y < 0 || Y >= dst.h) continue;
      for (let x = 0; x < src.w; x++) {
        const X = x + dx;
        if (X < 0 || X >= dst.w) continue;
        const p = src.px[y * src.w + x];
        if (!(p >>> 24)) continue;
        if (clip && !clip(X, Y)) continue;
        const i = Y * dst.w + X;
        dst.px[i] = p; dst.mt[i] = src.mt[y * src.w + x];
      }
    }
  }
  function build(n) {
    const K = RB.pxkit, N = NATIVE[n.variant], pl = PLACE[n.variant];
    const out = K.layer(N.w, N.h);
    const B = backingOf(n.variant);
    if (n.backing) out.over(B.L);
    const E = B.E;
    // busts are cropped by the band's lower edge (a deliberate line across the chest, never a face)
    const clip = (X, Y) => Y <= E.bot(X) + 0.5;
    const res = { faces: [], hands: [] };
    const place = (who, b, at) => {
      const dx = at[0] - b.anchor.x, dy = at[1] - b.anchor.y;
      blit(out, b.layer, dx, dy, clip);
      res.faces.push({ who, x: b.face.x + dx, y: b.face.y + dy, w: b.face.w, h: b.face.h });
      for (const h of b.hands) res.hands.push({ who, x: h.x + dx, y: h.y + dy, w: h.w, h: h.h });
    };
    const overlays = [];
    const place2 = (who, b, at) => { place(who, b, at); if (b.overlay) overlays.push({ o: b.overlay, dx: at[0] - b.anchor.x, dy: at[1] - b.anchor.y }); };
    if (n.comp && n.omit !== 'comp') place2(n.comp, bustLayer(n.comp, null, POSE_OF[n.comp], n.phase, n.variant, n.fx), pl[n.comp] || pl.comp);
    if (n.omit !== 'pc') place2('pc', bustLayer('pc', n.look, 'rally', n.phase, n.variant, n.fx), pl.pc);
    // effects that join the two (Nao's route stroke) go over both busts
    for (const { o, dx, dy } of overlays) {
      const t = K.layer(N.w, N.h);
      if (o.kind === 'route') HK().route(t, o.pts.map((p) => [p[0] + dx, p[1] + dy]));
      t.outline();
      out.over(t);
    }
    // the edging's bottom line is redrawn over the crop so the cut reads as the band's edge
    if (n.backing) {
      for (let x = 0; x < N.w; x++) {
        const y = Math.ceil(E.bot(x)) + 1, i = y * N.w + x;
        if (y < N.h && B.L.px[i]) { out.px[i] = B.L.px[i]; out.mt[i] = B.L.mt[i]; }
      }
    }
    // visible bounds
    let x0 = N.w, y0 = N.h, x1 = -1, y1 = -1;
    for (let y = 0; y < N.h; y++) for (let x = 0; x < N.w; x++) if (out.px[y * N.w + x] >>> 24) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    res.bounds = x1 < 0 ? { x: 0, y: 0, w: 0, h: 0 } : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
    res.layer = out;
    res.anchor = { x: 0, y: Math.round((E.top(0) + E.bot(0)) / 2) };
    return res;
  }
  function compose(o) {
    const n = norm(o);
    if (!n.comp) throw new Error('harmonyArt.compose: comp must be one of ' + COMPANIONS.join(', '));
    const key = keyOf(o);
    let c = lru(comps, key);
    if (c) S.hits++;
    else {
      S.misses++;
      const t0 = now();
      c = build(n);
      c.cv = c.layer.canvas();
      c.key = key;
      c.ms = now() - t0;
      store(comps, key, c, CAP.comps);
    }
    const N = NATIVE[n.variant];
    const view = n.view || (typeof window !== 'undefined' && window.innerWidth ? { w: window.innerWidth, h: window.innerHeight } : null);
    return {
      cv: c.cv, w: N.w, h: N.h,
      faces: c.faces.map((r) => Object.assign({}, r)), hands: c.hands.map((r) => Object.assign({}, r)),
      anchor: Object.assign({}, c.anchor), bounds: Object.assign({}, c.bounds),
      scale: view ? fitScale(view.w, view.h, n.variant) : null,
      bleed: { left: true }, key, phase: n.phase, variant: n.variant,
    };
  }

  // The largest integer CSS scale at which the variant's visible footprint stays inside §5.2's limits
  // (standard: 42 % width, 30 % height, 12 % area; compact: up to the view's width, 27 % of its height).
  function fitScale(vw, vh, variant) {
    const N = NATIVE[variant === 'compact' ? 'compact' : 'standard'];
    for (let s = 6; s >= 1; s--) {
      const w = N.w * s, h = N.h * s;
      if (variant === 'compact') { if (w <= vw && h <= vh * 0.27) return s; continue; }
      if (w <= vw * 0.42 && h <= vh * 0.3 && w * h <= vw * vh * 0.12) return s;
    }
    return 0;
  }

  // ---- preparation and housekeeping ----------------------------------------------------------------
  function specs(list) {
    list = Array.isArray(list) ? list : [list || {}];
    const out = [];
    for (const o of list) {
      const comps2 = o.comp === 'all' || !o.comp ? COMPANIONS : [o.comp];
      const phases = o.phase ? [o.phase] : ['enter', 'hold'];
      const variants = o.variant ? [o.variant] : ['standard'];
      for (const c of comps2) for (const ph of phases) for (const v of variants) out.push(Object.assign({}, o, { comp: c, phase: ph, variant: v }));
    }
    return out;
  }
  function prepare(list, opt) {
    const todo = specs(list);
    if (opt && opt.async) {
      return new Promise((resolve) => {
        let i = 0;
        const step = (dl) => {
          const t0 = now();
          while (i < todo.length && now() - t0 < 8) compose(todo[i++]);
          if (i < todo.length) schedule(step); else resolve(todo.length);
        };
        schedule(step);
      });
    }
    for (const o of todo) compose(o);
    return todo.length;
  }
  function schedule(fn) {
    if (typeof requestIdleCallback === 'function') requestIdleCallback(fn, { timeout: 200 });
    else setTimeout(fn, 16);
  }
  function stats() {
    let bytes = 0;
    for (const b of busts.values()) bytes += b.w * b.h * 4 * (b.cv ? 2 : 1);
    for (const c of comps.values()) bytes += c.layer.w * c.layer.h * 4 * 2;
    for (const b of backs.values()) bytes += b.L.w * b.L.h * 4;
    const ms = S.buildMs;
    return {
      artVersion: ART_VERSION, busts: busts.size, compositions: comps.size, backings: backs.size, cap: Object.assign({}, CAP),
      bytes, hits: S.hits, misses: S.misses, builds: S.builds, evictions: S.evictions, invalidations: S.invalidations,
      bustBuildMs: ms.length ? { last: +ms[ms.length - 1].toFixed(1), mean: +(ms.reduce((a, b) => a + b, 0) / ms.length).toFixed(1), max: +Math.max(...ms).toFixed(1) } : null,
      keys: { busts: [...busts.keys()], compositions: [...comps.keys()] },
    };
  }
  function clear() { busts.clear(); comps.clear(); backs.clear(); S.invalidations++; }
  // drop the player's entries that do not belong to the look now worn
  function invalidate(look) {
    const k = HK().lookKey(effectiveLook(look));
    for (const [key] of [...busts]) if (key.split('|')[1] === 'pc' && !key.endsWith(k)) busts.delete(key);
    for (const [key] of [...comps]) if (!key.endsWith(k)) comps.delete(key);
    S.invalidations++;
  }
  if (RB.bus) {
    RB.bus.on('equip:change', () => { try { invalidate(); } catch (e) { clear(); } });
    RB.bus.on('campaign:changing', clear);
  }

  return { ART_VERSION, NATIVE, COMPANIONS, POSE_OF, compose, bust, prepare, fitScale, stats, clear, invalidate, keyOf, _: { build, backingOf, norm, PLACE } };
})();
