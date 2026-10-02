/* A Quiet Cast — the waterside stage (Practice addendum §8.2, §8.3). A
 * dedicated scene, not the battle screen: the near bank at the lower left,
 * the water ahead and to the right, the far side dressed from the actual
 * site (the Reedwake bridge and far-bank reeds; the reed-ended pond under its
 * trees; the two Saltglass piers and open water). It never changes between
 * casts. Everything is drawn at art resolution and scaled by a whole number.
 *
 * Actors use the game's own rigs and palettes: the player from their actual
 * look and worn equipment (RB.equip.look) and the companion from theirs, both
 * through the battle-figure rig (RB.battlers, rear three-quarter facing the
 * water) with fishing poses written here; the pet through RB.petArt's battle
 * view. Rod, line, float and water are one geometry: the line runs from the
 * rod tip to the float, and the float sits on the patch.
 *
 *   const st = RB.fishStage.create(host, { site, comp, pet, look, ribbon })
 *   st.go(phase, o) -> Promise       prep | cast | wait | bite | situation | task | act | land | observe | release | after
 *   st.event(kind, o)                splash | remark (the companion's brief response)
 *   st.set({ patch, fish, situation, intent, labels, ribbon })
 *   st.text()                        the text equivalent of what is shown now
 *   st.stats()                       what was drawn (tests: poses, behaviours, reactions)
 *   st.destroy()
 * Decorative motion has its own seeded stream; nothing here decides anything.
 * Reduced motion: still key poses and a brief dissolve between them. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.fishStage = (function () {
  'use strict';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const cl = (k) => clamp(k, 0, 1);
  const ease = (k) => { k = cl(k); return k * k * (3 - 2 * k); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const bell = (k) => Math.sin(Math.PI * cl(k));

  // ---- the battle-figure rig, posed for fishing ---------------------------------------------------------------
  // The rig's projection (src/engine/34_battlers.js): yaw/pitch from the module, ZS (art px per body
  // unit) mirrored here and checked against the rig's own anchor points by tests/unit/fishing_art.test.mjs.
  const ZS = 1.14;
  const BT = () => RB.battlers;
  function proj(v) {
    const Y = BT()._.YAW, P = BT()._.PITCH;
    const w0 = Math.cos(Y) * v[0] + Math.sin(Y) * v[2], w1 = v[1], w2 = Math.sin(Y) * v[0] - Math.cos(Y) * v[2];
    return { x: w0 * ZS, y: -(w1 * Math.cos(P) - w2 * Math.sin(P)) * ZS };
  }
  const isArr = Array.isArray;
  function clone(p) { const o = {}; for (const k in p) o[k] = isArr(p[k]) ? p[k].slice() : p[k] && typeof p[k] === 'object' ? Object.assign({}, p[k]) : p[k]; return o; }
  function over(base, o) { const r = clone(base); for (const k in o) r[k] = isArr(o[k]) ? o[k].slice() : o[k] && typeof o[k] === 'object' ? Object.assign({}, o[k]) : o[k]; return r; }
  function blend(a, b, k) {
    const r = clone(a);
    for (const key in b) {
      const va = a[key], vb = b[key];
      if (isArr(vb) && isArr(va)) r[key] = va.map((x, i) => lerp(x, vb[i], k));
      else if (typeof vb === 'number' && typeof va === 'number') r[key] = lerp(va, vb, k);
      else if (key === 'prop') r[key] = k < 0.5 ? Object.assign({}, va) : Object.assign({}, vb);
      else r[key] = k < 0.5 ? va : vb;
    }
    return r;
  }
  const holdsLeft = (look) => (look.acc || []).some((a) => a === 'lamp' || a === 'cane');
  // the player: twelve poses (§8.2); hand targets in the body's ground frame, as in the rig
  const PC = {
    rest: { spinePitch: 4, headPitch: 0, handR: [10.6, 27, 3.4], handL: [-10, 27.2, 1.6], elbowR: [1, -0.4, -0.8], rod: 66 },
    prepare: { spinePitch: 9, headPitch: 10, headYaw: 4, handR: [8.6, 33, 4.6], handL: [2.6, 30.2, 6], elbowL: [-1, -0.6, -0.4], rod: 58 },
    castBack: { spinePitch: 3, spineYaw: -12, headPitch: -6, handR: [7, 45, -3.6], handL: [3, 37, 2], elbowR: [1, -0.2, -0.6], pelvis: [-0.4, -1.4, -0.8], rod: 112 },
    cast: { spinePitch: 12, spineYaw: 14, headPitch: -6, handR: [13.6, 38, 14], handL: [5, 32, 10], elbowR: [1, -0.6, -0.2], pelvis: [0.6, -1.8, 1.2], rod: 40 },
    watch: { spinePitch: 10, headPitch: -6, headYaw: 10, handR: [11.2, 31.4, 8.4], handL: [2.4, 29.4, 6.4], rod: 54 },
    attend: { spinePitch: 15, headPitch: -2, headYaw: 12, handR: [12, 33, 10.4], handL: [3.4, 31.2, 8.6], pelvis: [0.4, -2.4, 0.6], rod: 58 },
    guideL: { spinePitch: 11, spineYaw: -17, headYaw: -6, handR: [4.6, 34, 10], handL: [-3, 31, 8], rod: 78, sweep: -1 },
    guideR: { spinePitch: 11, spineYaw: 19, headYaw: 22, handR: [15.4, 32, 7.6], handL: [6.2, 30, 7], rod: 36, sweep: 1 },
    slack: { spinePitch: 17, headPitch: 2, handR: [12.4, 26.6, 14], handL: [4.4, 27.4, 10.4], pelvis: [0.4, -2.2, 0.8], rod: 30 },
    lift: { spinePitch: 2, headPitch: -12, handR: [11, 44, 6.4], handL: [4, 38.4, 5.4], rod: 82 },
    close: { spinePitch: 13, headPitch: 6, handR: [8, 34, 1.6], handL: [-2.4, 30, 6.4], pelvis: [-0.4, -1.8, -0.6], rod: 66 },
    observe: { spinePitch: 22, headPitch: 18, headYaw: 4, handR: [5.6, 25, 10.4], handL: [-3.6, 25.4, 10.6], elbowR: [1, -0.6, -0.6], elbowL: [-1, -0.6, -0.6], pelvis: [0, -5, 0], rod: null },
    release: { spinePitch: 31, headPitch: 22, handR: [6.6, 12.6, 14.6], handL: [-2.6, 12.6, 14.4], pelvis: [0, -9, 0.6], footR: [6.6, 0, 6.4], rod: null },
  };
  PC.lifted = PC.lift;
  // the companions: seven behaviours each, with their own gestures and timing (§8.2, §8.3)
  const COMP = {
    nao: { ms: 300,
      settle: { handL: [-6.4, 38.4, 2.4], handR: [9.6, 27.4, 2.6], headYaw: 12, pelvisRoll: 3, spinePitch: 5 },
      notes: { handR: [4, 30.4, 8.4], handL: [-2.2, 30, 8.2], headPitch: 18, spinePitch: 12 },
      watch: { handR: [-4.2, 36.8, 6.4], handL: [5.2, 36, 6.2], headPitch: -4, spinePitch: 6, headYaw: 14 },
      splash: { pelvis: [-0.6, -1, -1.4], handR: [10.4, 40, 4.4], handL: [-8, 40.4, 3.2], spinePitch: -4, headPitch: -8 },
      lean: { pelvis: [0, -4, 0.6], spinePitch: 30, handR: [7.4, 22, 8.4], handL: [-5.4, 22, 8.4], headPitch: 8 },
      respond: { headRoll: 8, headPitch: 9, handR: [9.4, 30, 4], handL: [-6.4, 38.4, 2.4] },
      rest: { handL: [-6.4, 38.4, 2.4], handR: [9.6, 27.4, 2.6], headYaw: 6, spinePitch: 4 } },
    mio: { ms: 620,
      settle: { pelvis: [0.2, -10.4, -1], footL: [-4.6, -1.8, -9.4], footR: [6.4, 0, 6.6], spinePitch: 14, handR: [5.4, 19, 6.4], handL: [-4, 19.4, 6.2], headPitch: 6 },
      notes: { pelvis: [0.2, -10.4, -1], footL: [-4.6, -1.8, -9.4], footR: [6.4, 0, 6.6], spinePitch: 18, handR: [8.6, 22, 8.6], handL: [-1.6, 21.6, 8.4], headPitch: 16, headYaw: -10 },
      watch: { pelvis: [0.2, -10.4, -1], footL: [-4.6, -1.8, -9.4], footR: [6.4, 0, 6.6], spinePitch: 10, handR: [2, 30, 6.4], handL: [-2.2, 30, 6.4], headPitch: -2 },
      splash: { pelvis: [0.2, -10, -1.4], footL: [-4.6, -1.8, -9.4], footR: [6.4, 0, 6.6], spinePitch: 4, handR: [2.6, 40, 7], headPitch: 2 },
      lean: { pelvis: [0.4, -10.4, 0.4], footL: [-4.6, -1.8, -9.4], footR: [6.4, 0, 6.6], spinePitch: 30, handR: [8, 15, 12], handL: [-2, 16, 11], headPitch: 14 },
      respond: { pelvis: [0.2, -10.4, -1], footL: [-4.6, -1.8, -9.4], footR: [6.4, 0, 6.6], spinePitch: 12, headRoll: -9, handR: [5.4, 19, 6.4], handL: [-4, 19.4, 6.2] },
      rest: { pelvis: [0.2, -10.4, -1], footL: [-4.6, -1.8, -9.4], footR: [6.4, 0, 6.6], spinePitch: 14, handR: [5.4, 19, 6.4], handL: [-4, 19.4, 6.2], headPitch: 4 } },
    ren: { ms: 460,
      settle: { spinePitch: 2, headPitch: 4, handR: [8.4, 30, 6.4] },
      notes: { spinePitch: 8, headPitch: 18, headYaw: -6, handR: [5.6, 35, 9.4], writing: 1 },
      watch: { spinePitch: 3, headPitch: -6, headYaw: 12, handR: [8.6, 29.4, 5.4] },
      splash: { spinePitch: -2, headPitch: -10, handR: [4.4, 49, 6.6] },
      lean: { spinePitch: 24, headPitch: 10, handR: [-5.6, 30, -6.4], pelvis: [0, -2.4, 0.4] },
      respond: { headPitch: 13, handR: [8.4, 30, 6.4] },
      rest: { spinePitch: 2, headPitch: 0, handR: [8.4, 28.6, 5.4] } },
    suzu: { ms: 250,
      settle: { handR: [9.4, 33.4, -2.4], handL: [-9.4, 33, -2.4], spinePitch: -2, headYaw: 8, pelvisRoll: -3 },
      notes: { handR: [5, 40, 9.4], handL: [-3, 40.4, 9], headPitch: 12, spinePitch: 6 },
      watch: { handR: [3, 46, 7.4], handL: [-6, 32, 6], spinePitch: 12, headPitch: 4, headRoll: -6 },
      splash: { handR: [12.4, 60, 5.4], handL: [-11, 58, 4.4], spinePitch: -4, headPitch: -10 },
      lean: { spinePitch: 22, handR: [2.4, 32, 10.4], handL: [-2.4, 32, 10.4], headPitch: 10 },
      respond: { spinePitch: 30, headPitch: 20, handR: [6, 26, -2.4], handL: [-8, 28, -1] },
      rest: { handR: [9.4, 33.4, -2.4], handL: [-9.4, 33, -2.4], spinePitch: 0, headYaw: 4 } },
  };
  const BEHAVIOURS = ['settle', 'notes', 'watch', 'splash', 'lean', 'respond', 'rest'];

  // ---- the stage -------------------------------------------------------------------------------------------------------
  function create(host, opts) {
    opts = opts || {};
    const reduce = () => !!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion());
    const S = RB.fishing.site(opts.site);
    const dress = (S && S.dress) || 'river';
    const pal = RB.tiles.PAL[(S && S.region) || 'reedwake'] || RB.tiles.PAL.reedwake;
    const wrap = RB.ui.el('div', 'fs-stage');
    wrap.innerHTML = '<canvas class="fs-canvas" role="img"></canvas><div class="fs-labels" aria-hidden="true"></div><div class="fs-say" role="status" aria-live="polite"></div>';
    host.appendChild(wrap);
    const capEl = RB.ui.el('p', 'fs-caption');
    capEl.setAttribute('aria-hidden', 'true'); // the canvas carries the same text as its accessible name
    if (host.parentNode) host.parentNode.insertBefore(capEl, host.nextSibling);
    const cv = wrap.querySelector('canvas'), labelsEl = wrap.querySelector('.fs-labels'), sayEl = wrap.querySelector('.fs-say');
    const art = document.createElement('canvas');
    const g = art.getContext('2d');
    let AW = 320, AH = 180, q = 1, dpr = 1, bg = null, bgKey = '';
    let dead = false, raf = 0, prev = null, dissolveT0 = 0;
    const seed = RB.util.hashStr(String(opts.site) + '|' + String(opts.decorSeed || 0));
    const decor = RB.util.rng(seed); // decorative values only: its own stream
    const ripples = [];
    const stats = { frames: 0, poses: {}, comp: {}, pet: {}, phases: {} };
    const ST = {
      phase: 'prep', t0: now(), patch: null, fish: null, situation: null, intent: null, labels: null,
      ribbon: !!opts.ribbon, compBeh: 'settle', compT0: now(), petBeh: 'calm', petT0: now(), floatAt: null, resolveFn: null,
    };
    const comp = opts.comp && COMP[opts.comp] && RB.content.chars[opts.comp] ? opts.comp : null;
    const compLook = comp ? RB.content.chars[comp].look : null;
    const look = opts.look || {};
    const pet = opts.pet || null; // { species, look, name }
    function now() { return typeof performance !== 'undefined' ? performance.now() : Date.now(); }

    // ---- layout -----------------------------------------------------------------------------------------------
    function layout() {
      const r = wrap.getBoundingClientRect();
      dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
      const dw = Math.max(200, Math.round(r.width * dpr)), dh = Math.max(120, Math.round(r.height * dpr));
      q = Math.max(1, Math.min(Math.floor(dw / 260), Math.round(dh / 210)));
      AW = Math.ceil(dw / q); AH = Math.ceil(dh / q);
      cv.width = dw; cv.height = dh;
      art.width = AW; art.height = AH;
      bg = null;
      placeLabels();
      draw();
    }
    // scene geometry (art px) -------------------------------------------------------------------------------------
    const G = {
      shore: () => Math.round(AH * 0.3),            // far bank's water line
      // the near bank's top edge at x (art px): level, then rounding down into the water
      // the near bank runs across the whole width at every site (you face the water); the quay is straight
      bankY: (x) => Math.round(AH * 0.8 + (dress === 'harbor' ? 0 : Math.sin(x / 23) * 1.5 + Math.sin(x / 61) * 2)),
      bankX: () => AW,
      pc: () => ({ x: Math.round(AW * 0.3), y: AH - 7 }),
      comp: () => ({ x: Math.round(AW * 0.12), y: AH - 15 }),
      pet: () => ({ x: Math.round(AW * 0.44), y: AH - 4 }),
      patch: (p) => { const P = p && S && S.patches.find((x) => x.id === p); const a = P ? P.at : [0.6, 0.48]; return { x: Math.round(AW * a[0]), y: Math.round(AH * a[1]) }; },
      tub: () => ({ x: Math.round(AW * 0.18), y: AH - 18 }),
    };

    // ---- the background, cached per size ------------------------------------------------------------------------
    const P5 = (k) => pal[k] || ['#888', '#999', '#aaa', '#bbb'];
    function R(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
    function drawBg() {
      const key = AW + 'x' + AH + dress;
      if (bg && bgKey === key) { g.drawImage(bg, 0, 0); return; }
      const W = P5('water'), Gr = P5('grass'), Lf = P5('leaf'), Rd = P5('reed'), Wd = P5('wood'), St = P5('stone'), Tr = P5('trunk');
      const shore = G.shore();
      R(0, 0, AW, AH, pal.sky || '#dff1ff');
      // sky band with a faint warm horizon
      R(0, Math.round(shore * 0.55), AW, Math.round(shore * 0.2), RB.propKit.mix(pal.sky || '#dff1ff', '#fff4dc', 0.4));
      // water: the whole lower part, deepening toward the bottom
      for (let y = shore; y < AH; y++) { const k = (y - shore) / (AH - shore); R(0, y, AW, 1, k < 0.25 ? W[2] : k < 0.6 ? W[1] : W[0]); }
      const r = RB.util.rng(seed ^ 0x51ed);
      if (dress === 'harbor') {
        // the open sea's horizon, the two piers running out, a moored boat
        R(0, Math.round(shore * 0.9), AW, 2, RB.propKit.mix(W[1], '#ffffff', 0.25));
        R(0, shore - 2, AW, 2, W[3]);
        for (const [x0, w] of [[AW * 0.04, AW * 0.09], [AW * 0.86, AW * 0.09]]) {
          for (let y = Math.round(shore + 4); y < AH * 0.8; y += 1) R(x0 + (y - shore) * 0.05, y, w + (y - shore) * 0.12, 1, (y & 3) ? Wd[2] : Wd[1]);
          for (let y = Math.round(shore + 8); y < AH * 0.8; y += 14) R(x0 + (y - shore) * 0.05 - 1, y, 3, 8, Wd[0]);
        }
        R(AW * 0.7, shore + 12, 22, 5, Wd[1]); R(AW * 0.7 + 2, shore + 10, 18, 3, Wd[2]); R(AW * 0.7 + 9, shore + 2, 1, 9, Wd[0]);
      } else {
        // the far bank: grass, trees, and (river) reeds and the bridge, (pond) dense trees and shade
        R(0, shore - 12, AW, 12, Gr[1]);
        R(0, shore - 3, AW, 3, Gr[3]);
        const ell = (cx, cy, rx, ry, c) => RB.propKit.ell(g, Math.round(cx), Math.round(cy), Math.round(rx), Math.round(ry), c);
        // a back row, darker and smaller, then a front row of fuller crowns lit from the upper left
        for (const row of [0, 1]) {
          const nT = dress === 'pond' ? (row ? 11 : 15) : (row ? 7 : 10);
          for (let i = 0; i < nT; i++) {
            const x = (i + 0.3 + r() * 0.4) * (AW / nT), base = shore - (row ? 10 : 14), h = (row ? 18 : 13) + r() * 9, w = (row ? 15 : 11) + r() * 8;
            if (dress === 'river' && row && x > AW * 0.22 && x < AW * 0.42) continue; // room for the ferry house
            R(x - 1, base - 6, 2, 8, Tr[row]);
            const L0 = row ? Lf : Lf.map((c) => RB.propKit.mix(c, '#2a3a40', 0.35));
            ell(x, base - h * 0.55, w * 0.55, h * 0.45, L0[3]);
            ell(x - 1, base - h * 0.62, w * 0.48, h * 0.38, L0[0]);
            ell(x - w * 0.15, base - h * 0.72, w * 0.3, h * 0.24, L0[1]);
            R(x - w * 0.25, base - h * 0.85, 2, 1, L0[2]);
          }
        }
        if (dress === 'river') {
          // Koji's ferry house on the far bank, upstream of where you stand
          const hx = Math.round(AW * 0.27), hy = shore - 10;
          R(hx, hy - 12, 26, 12, Wd[2]); R(hx, hy - 12, 26, 1, Wd[3]); R(hx + 10, hy - 8, 6, 8, Wd[0]); R(hx + 2, hy - 9, 5, 4, '#e8d8a0');
          for (let k = 0; k < 9; k++) R(hx - 3 + k, hy - 13 - k, 32 - 2 * k, 1, k < 2 ? P5('roof')[1] : P5('roof')[(k & 1) ? 2 : 3]);
        }
        if (dress === 'pond') {
          // the shaded margin under the trees, and the reeds that close the pond at both ends
          R(0, shore, AW, Math.round(AH * 0.08), RB.propKit.mix(W[1], '#203020', 0.35));
          for (const x0 of [AW * 0.02, AW * 0.88]) for (let i = 0; i < 9; i++) { const x = x0 + i * (AW * 0.012), h = 14 + r() * 12; R(x, AH * 0.5 - h, 1, h, Rd[i & 1 ? 2 : 1]); R(x, AH * 0.5 - h - 2, 1, 3, Rd[3]); }
        } else {
          for (let i = 0; i < AW; i += 3) { const h = 3 + r() * 6; R(i, shore - h, 1, h + 2, Rd[(i / 3) & 1 ? 2 : 0]); }
          // upstream, on your left: the bridge
          R(0, shore + 2, AW * 0.2, 5, Wd[2]); R(0, shore + 2, AW * 0.2, 1, Wd[3]); R(0, shore + 7, AW * 0.2, 1, Wd[0]);
          for (let x = 4; x < AW * 0.2; x += 12) R(x, shore + 7, 2, 7, Wd[0]);
        }
      }
      // the near bank: a stone quay or a grassy bank with a few reeds at the water's edge
      for (let x = 0; x < G.bankX(); x++) {
        const y0 = G.bankY(x);
        if (y0 >= AH) continue;
        if (dress === 'harbor') {
          // dressed stone: courses of blocks, a lit coping edge, a dark line where it meets the water
          for (let y = y0; y < AH; y++) { const row = Math.floor((y - y0) / 7), col = Math.floor((x + (row & 1) * 6) / 12); R(x, y, 1, 1, ((y - y0) % 7 === 0 || (x + (row & 1) * 6) % 12 === 0) ? St[0] : (row + col) & 1 ? St[1] : St[2]); }
          R(x, y0, 1, 2, RB.propKit.mix(St[2], '#ffffff', 0.25));
        } else {
          for (let y = y0; y < AH; y++) R(x, y, 1, 1, ((x * 7 + y * 3) % 11 === 0) ? Gr[3] : y - y0 < 3 ? Gr[2] : ((x + y) % 5 === 0 ? Gr[0] : Gr[1]));
          R(x, y0 + 3, 1, 1, Gr[0]);
        }
        // the water's edge: a pale line where bank meets water
        R(x, y0 - 1, 1, 1, W[3]);
      }
      // reed tufts along the bank's edge (left of you and further right), clear in front of you
      if (dress !== 'harbor') for (let i = 0; i < 26; i++) { const x = (i < 9 ? AW * 0.01 + i * 4 : AW * 0.52 + (i - 9) * 7) + (i % 3), y = G.bankY(x); if (x < AW && y < AH) { const h = 8 + (i * 5) % 8; R(x, y - h, 1, h + 2, Rd[i & 1]); R(x, y - h - 2, 1, 3, Rd[3]); } }
      bg = document.createElement('canvas'); bg.width = AW; bg.height = AH;
      bg.getContext('2d').drawImage(art, 0, 0);
      bgKey = key;
    }

    // ---- figures ---------------------------------------------------------------------------------------------------
    const figCache = new Map();
    const lookKeyOf = (l) => JSON.stringify(l);
    const LK = lookKeyOf(look), CK = compLook ? lookKeyOf(compLook) : '';
    function basePose(lk, who) {
      const ps = clone(BT()._.poseAt(lk, 'ready', 'direct', 0, 0, who, true));
      ps.prop = {};
      return ps;
    }
    let pcBase = null, compBase = null;
    function figure(lk, who, ps, key) {
      let f = figCache.get(key);
      if (f) return f;
      if (who !== 'comp' || !holdsLeft(lk)) ps.prop = ps.prop || {};
      const { b, J } = BT()._.render(lk, ps);
      f = { cv: b.toCanvas(), hand: proj(J.handR), handL: proj(J.handL), head: proj(J.headC) };
      figCache.set(key, f);
      while (figCache.size > 260) figCache.delete(figCache.keys().next().value);
      return f;
    }
    const Q = (k) => Math.round(cl(k) * 8) / 8;
    // the player's pose now: [poseA, poseB, k]
    function pcPose(t) {
      const ph = ST.phase, e = t - ST.t0, rd = reduce();
      const key = (a, b, k) => (rd ? [b, b, 1] : [a, b, k]);
      switch (ph) {
        case 'prep': return ['rest', 'rest', 1];
        case 'cast': {
          if (e < 300) return key('rest', 'prepare', e / 300);
          if (e < 560) return key('prepare', 'castBack', (e - 300) / 260);
          return key('castBack', 'cast', (e - 560) / 300);
        }
        case 'wait': return key('cast', 'watch', e / 500);
        case 'bite': case 'situation': case 'task': return key('watch', 'attend', e / 400);
        case 'act': {
          const I = ST.intent, a = ACT[I] || ACT.close;
          const seq = a.pc;
          const span = 1100 / seq.length;
          const i = Math.min(seq.length - 1, Math.floor(e / span));
          return key(i === 0 ? 'attend' : seq[i - 1], seq[i], (e - i * span) / (span * 0.7));
        }
        case 'land': return key('lift', 'close', e / 700);
        case 'observe': return key('close', 'observe', e / 500);
        case 'release': return key('observe', 'release', e / 450);
        case 'after': return key('release', 'rest', e / 600);
        default: return ['rest', 'rest', 1];
      }
    }
    function drawPc(t) {
      if (!pcBase) pcBase = basePose(look, 'pc');
      const [a, b, k0] = pcPose(t);
      const k = Q(ease(k0));
      const idle = reduce() ? 0 : Math.floor((t % 3200) / 800); // a slow breath (four still steps)
      const key = 'pc|' + a + '|' + b + '|' + k + '|' + idle;
      let f = figCache.get(key);
      if (!f) {
        const A = over(pcBase, strip(PC[a])), B = over(pcBase, strip(PC[b]));
        const ps = blend(A, B, k);
        ps.pelvis = ps.pelvis.slice(); ps.pelvis[1] += [0, -0.4, -0.6, -0.3][idle];
        if (holdsLeft(look)) { ps.handL = pcBase.handL.slice(); ps.elbowL = pcBase.elbowL; }
        f = figure(look, 'pc', ps, key);
      }
      stats.poses[k >= 0.5 ? b : a] = (stats.poses[k >= 0.5 ? b : a] || 0) + 1;
      const o = G.pc();
      g.drawImage(f.cv, o.x - BT().ANCHOR.x, o.y - BT().ANCHOR.y);
      // the rod: from the right hand, at the pose's angle (null: laid on the bank)
      const ra = PC[a].rod, rb = PC[b].rod;
      const hand = { x: o.x + f.hand.x, y: o.y + f.hand.y };
      let tip = null;
      const held = k < 0.5 ? ra != null : rb != null;
      if (held) {
        const ang = ((ra == null ? rb : rb == null ? ra : lerp(ra, rb, k)) * Math.PI) / 180;
        const L = Math.round(Math.min(AW, AH) * 0.42);
        tip = { x: hand.x + Math.cos(ang) * L, y: hand.y - Math.sin(ang) * L };
        rodLine(hand.x - Math.cos(ang) * 6, hand.y + Math.sin(ang) * 6, tip.x, tip.y);
        if (ST.ribbon) { const rx = lerp(hand.x, tip.x, 0.22), ry = lerp(hand.y, tip.y, 0.22); R(rx, ry, 2, 2, '#c8344a'); R(rx + 2, ry + 1 + ((t / 500 | 0) & 1 && !reduce() ? 1 : 0), 2, 1, '#e05a6a'); R(rx - 1, ry + 2, 1, 2, '#a82a3c'); }
      } else {
        // the rod laid on the bank beside you, behind your feet
        rodLine(o.x - 34, o.y - 9, o.x + 30, o.y - 12);
      }
      return { hand, tip, head: { x: o.x + f.head.x, y: o.y + f.head.y } };
    }
    const strip = (p) => { const r = {}; for (const k in p) if (k !== 'rod' && k !== 'sweep' && k !== 'writing') r[k] = p[k]; return r; };
    function rodLine(x0, y0, x1, y1) {
      const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0)));
      const W5 = P5('wood');
      for (let i = 0; i <= n; i++) {
        const k = i / n, x = lerp(x0, x1, k), y = lerp(y0, y1, k);
        R(x, y, k < 0.35 ? 2 : 1, k < 0.35 ? 2 : 1, k < 0.35 ? W5[0] : W5[1]);
      }
    }
    // the companion's behaviour now
    function compPose(t) {
      const D = COMP[comp], e = t - ST.compT0;
      const b = ST.compBeh, a = ST.compPrev || b;
      if (reduce()) return [b, b, 1];
      return [a, b, e / D.ms];
    }
    function drawComp(t) {
      if (!comp) return null;
      if (!compBase) compBase = basePose(compLook, 'comp');
      const [a, b, k0] = compPose(t);
      const k = Q(ease(k0));
      const D = COMP[comp];
      const wr = D[b] && D[b].writing && !reduce() ? Math.floor((t % 900) / 300) : 0;
      const key = 'c|' + comp + '|' + a + '|' + b + '|' + k + '|' + wr;
      let f = figCache.get(key);
      if (!f) {
        const A = over(compBase, strip(D[a] || D.settle)), B = over(compBase, strip(D[b] || D.settle));
        const ps = blend(A, B, k);
        if (wr) { ps.handR = ps.handR.slice(); ps.handR[0] += [0, 0.8, -0.6][wr]; ps.handR[1] += [0, -0.5, 0.4][wr]; }
        if (holdsLeft(compLook)) { ps.handL = compBase.handL.slice(); ps.elbowL = compBase.elbowL; }
        f = figure(compLook, 'comp', ps, key);
      }
      stats.comp[comp + ':' + b] = (stats.comp[comp + ':' + b] || 0) + 1;
      const o = G.comp();
      g.drawImage(f.cv, o.x - BT().ANCHOR.x, o.y - BT().ANCHOR.y);
      return { head: { x: o.x + f.head.x, y: o.y + f.head.y } };
    }
    // the pet: watching, never acting (§8.3)
    const PETK = {
      cat: { calm: { sit: 1 }, follow: (u) => ({ sit: 1, hy: clamp(u * 60, -40, 40), hp: -6, earF: 0.5 }), splash: { sit: 1, earF: 0.8, hp: -10, tall: 0.6 }, attend: { sit: 1, earF: 0.4, hp: -4 } },
      dog: { calm: { sit: 1 }, follow: (u) => ({ sit: 1, hy: clamp(u * 30, -24, 24), earF: 0.4 }), splash: { sit: 0, lean: 0.7, earF: 0.9, hp: -10 }, attend: { sit: 1, earF: 0.7, hp: -6 } },
      bird: { calm: {}, follow: (u) => ({ hy: clamp(u * 40, -30, 30), hp: -4 }), splash: { hy: 20, hp: -10, wing: 0.3 }, attend: { hp: -8 }, ripple: (u) => ({ hy: clamp(u * 70, -50, 50), hp: -10 }) },
      tanuki: { calm: { sit: 1 }, follow: (u) => ({ sit: 0.6, hy: clamp(u * 40, -30, 30) }), splash: { sit: 1, paws: 1, earF: 0.6, blink: 0.5 }, attend: { sit: 0.4, rise: 0.3, paws: 0.8, earF: 0.4, hp: -4 } },
    };
    function petPose(t, floatX) {
      const sp = pet.species, K = PETK[sp] || PETK.cat;
      const o = G.pet();
      const u = floatX == null ? 0 : (floatX - o.x) / AW;
      const ph = ST.phase;
      const e = t - ST.petT0;
      let name = 'calm', po = K.calm;
      if (ST.petBeh === 'splash' && (e < 900 || reduce())) { name = 'splash'; po = K.splash; }
      else if (sp === 'bird' && ripples.length && !reduce() && ph !== 'prep') { name = 'ripple'; po = K.ripple(u); }
      else if (sp === 'tanuki' && (ph === 'bite' || ph === 'situation' || ph === 'task' || ph === 'wait')) {
        // copies your attentive posture a moment too late
        name = (t - ST.t0) > 450 || reduce() ? 'attend' : 'calm'; po = name === 'attend' ? K.attend : K.calm;
      } else if (floatX != null && ph !== 'prep' && ph !== 'after') { name = 'follow'; po = K.follow(u); }
      return { name, po };
    }
    function drawPet(t, floatX) {
      if (!pet || !RB.petArt) return;
      const { name, po } = petPose(t, floatX);
      const qp = {};
      for (const k in po) { const v = po[k]; qp[k] = typeof v === 'number' ? (/^(hy|hp|hr)$/.test(k) ? Math.round(v / 4) * 4 : Math.round(v * 10) / 10) : v; }
      const f = RB.petArt.frame(pet.species, pet.look, { kind: 'battle' }, qp);
      if (!f) return;
      stats.pet[pet.species + ':' + name] = (stats.pet[pet.species + ':' + name] || 0) + 1;
      const o = G.pet();
      const hop = name === 'ripple' && !reduce() ? Math.round(Math.abs(Math.sin(t / 220)) * 2) : 0;
      g.globalAlpha = 0.35; R(o.x - 9, o.y - 2, 18, 3, '#1a2230'); g.globalAlpha = 1;
      g.drawImage(f.cv, o.x - f.ax, o.y - f.ay - hop);
    }

    // ---- what the intents do to the line (§6.2 "visible result") ---------------------------------------------------
    // pc: the player's pose sequence; float(k, F): where the float goes from F as the action plays
    const ACT = {
      wait: { pc: ['attend', 'watch', 'lift'], float: (k, F) => ({ x: F.x + Math.sin(k * 6) * 2 * (1 - k), y: F.y + (k > 0.55 ? 4 : 0), under: k > 0.55 }) },
      right: { pc: ['guideR', 'guideR', 'close'], float: (k, F) => ({ x: F.x + ease(k) * AW * 0.12, y: F.y + ease(k) * AH * 0.06 }) },
      left: { pc: ['guideL', 'guideL', 'close'], float: (k, F) => ({ x: F.x - ease(k) * AW * 0.12, y: F.y + ease(k) * AH * 0.04 }) },
      lift: { pc: ['attend', 'lift', 'lift'], float: (k, F) => ({ x: F.x - ease(k) * 8, y: F.y - ease(k) * 4 }) },
      slack: { pc: ['slack', 'slack', 'close'], float: (k, F) => ({ x: F.x + ease(k) * 6, y: F.y + ease(k) * 6 }), sag: (k) => (k < 0.6 ? 1 : 0.3) },
      lane: { pc: ['guideL', 'watch', 'close'], float: (k, F) => ({ x: F.x - ease(k) * AW * 0.1, y: F.y + ease(k) * AH * 0.08 }) },
      close: { pc: ['attend', 'close', 'close'], float: (k, F) => ({ x: lerp(F.x, AW * 0.5, ease(k) * 0.6), y: lerp(F.y, AH * 0.72, ease(k) * 0.6) }) },
      side: { pc: ['guideR', 'slack', 'close'], float: (k, F) => ({ x: F.x + ease(k) * AW * 0.14, y: F.y + ease(k) * 4 }) },
      tray: { pc: ['close', 'guideL', 'close'], float: (k, F) => ({ x: lerp(F.x, AW * 0.4, ease(k)), y: lerp(F.y, AH * 0.74, ease(k)) }) },
      slow: { pc: ['close', 'close', 'close'], float: (k, F) => ({ x: lerp(F.x, AW * 0.48, ease(k) * 0.5), y: lerp(F.y, AH * 0.75, ease(k) * 0.5) }) },
      recover: { pc: ['watch', 'close', 'close'], float: (k, F) => ({ x: lerp(F.x, AW * 0.52, ease(k) * 0.4), y: lerp(F.y, AH * 0.7, ease(k) * 0.4) }), sag: (k) => 1 - ease(k) },
      patch: { pc: ['castBack', 'cast', 'watch'], float: (k, F) => ({ x: lerp(F.x, ST.markerAt ? ST.markerAt.x : F.x, ease(k)), y: lerp(F.y, ST.markerAt ? ST.markerAt.y : F.y, ease(k)) }) },
      closefirst: { pc: ['close', 'close', 'lift'], float: (k, F) => ({ x: lerp(F.x, AW * 0.5, ease(k) * 0.7), y: lerp(F.y, AH * 0.7, ease(k) * 0.7) }) },
    };

    // ---- the water's moving parts, the float and the line -----------------------------------------------------------
    function floatPos(t) {
      const F0 = ST.floatAt || G.patch(ST.patch);
      const ph = ST.phase, e = t - ST.t0, rd = reduce();
      const sit = ST.situation ? RB.fishing.situation(ST.situation) : null;
      const sg = (sit && sit.stage) || {};
      if (ph === 'prep' || ph === 'observe' || ph === 'release' || ph === 'after') return null;
      if (ph === 'cast') {
        if (e < 560) return null;
        const k = cl((e - 560) / 300);
        return { x: lerp(G.pc().x + 40, F0.x, k), y: lerp(G.pc().y - 120, F0.y, k) - bell(k) * 20, flying: k < 1 };
      }
      if (ph === 'act') return Object.assign({}, (ACT[ST.intent] || ACT.close).float(cl(e / 1100), F0));
      if (ph === 'land') return null;
      let x = F0.x, y = F0.y, under = false;
      const bob = rd ? 0 : Math.round(Math.sin(t / 520) * 0.8);
      if (ph === 'wait') y += bob;
      if (ph === 'bite') y += rd ? 1 : Math.round(Math.abs(Math.sin(t / 160)) * 2);
      if (ph === 'situation' || ph === 'task') {
        if (sg.drift) x += rd ? 6 : Math.round(Math.sin(t / 900) * 8);
        if (sg.float === 'under') under = true;
        if (sg.dips) { const c = rd ? 3 : Math.floor(((t - ST.t0) % 3600) / 600); y += c === 1 || c === 3 ? 3 : c >= 4 ? 2 : 0; }
        if (sg.taut) { y += 2; }
        if (sg.far) { x = Math.round(AW * 0.56); y = Math.round(AH * 0.36); }
        if (sg.near) { x = Math.round(AW * 0.5); y = Math.round(AH * 0.74); }
        if (sg.lanes) { x = Math.round(AW * 0.66); y = Math.round(AH * 0.46); }
      }
      return { x, y, under };
    }
    function drawFloat(F) {
      if (!F) return;
      if (F.under) { ring(F.x, F.y + 1, 4, 0.6); R(F.x, F.y, 1, 1, '#d8463a'); return; }
      R(F.x - 1, F.y - 3, 3, 2, '#d8463a'); R(F.x - 1, F.y - 1, 3, 2, '#f4efe0'); R(F.x, F.y - 4, 1, 1, '#2a2430');
      if (!F.flying) { g.globalAlpha = 0.5; R(F.x - 3, F.y + 1, 7, 1, '#ffffff'); g.globalAlpha = 1; }
    }
    function ring(x, y, r, a) { g.globalAlpha = a; g.strokeStyle = '#eef8ff'; g.lineWidth = 1; g.beginPath(); g.ellipse(x + 0.5, y + 0.5, r, r * 0.4, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    function drawLine(tip, F, t) {
      if (!tip || !F) return;
      const sit = ST.situation ? RB.fishing.situation(ST.situation) : null;
      const sg = (sit && sit.stage) || {};
      let sag = 0.35;
      if ((ST.phase === 'situation' || ST.phase === 'task') && sg.slack) sag = 1.2;
      if ((ST.phase === 'situation' || ST.phase === 'task') && sg.taut) sag = 0;
      if (ST.phase === 'act') { const a = ACT[ST.intent]; if (a && a.sag) sag = a.sag(cl((t - ST.t0) / 1100)); }
      const mx = (tip.x + F.x) / 2, my = Math.max(tip.y, F.y) + Math.abs(F.x - tip.x) * 0.2 * sag;
      g.strokeStyle = 'rgba(240,236,224,0.85)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(tip.x + 0.5, tip.y + 0.5); g.quadraticCurveTo(mx, my, F.x + 0.5, F.y - 3.5); g.stroke();
    }
    function drawWater(t) {
      const rd = reduce();
      const W5 = P5('water');
      if (dress === 'river') {
        // the current: short light streaks drifting downstream (left to right)
        for (let i = 0; i < 26; i++) {
          const y = G.shore() + 6 + ((i * 37) % Math.max(1, AH * 0.48)), sp = 0.012 + (i % 5) * 0.004;
          const x = ((i * 53 + (rd ? 0 : t * sp)) % (AW + 20)) - 10;
          R(x, y, 4 + (i % 3) * 2, 1, W5[3]);
        }
      } else if (dress === 'pond') {
        for (let i = 0; i < 6; i++) { const x = (i * 71) % AW, y = G.shore() + 14 + ((i * 29) % (AH * 0.4)); R(x, y, 3, 1, W5[3]); }
      } else {
        for (let i = 0; i < 18; i++) { const y = G.shore() + 4 + ((i * 41) % (AH * 0.5)); const x = ((i * 61 + (rd ? 0 : Math.sin(t / 1400 + i) * 6)) % AW); R(x, y, 5, 1, W5[3]); }
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i], k = (t - rp.t0) / rp.ms;
        if (k >= 1 || rd) { if (k >= 1) ripples.splice(i, 1); if (rd) ring(rp.x, rp.y, rp.r, 0.5); continue; }
        ring(rp.x, rp.y, rp.r * (0.4 + k), 0.7 * (1 - k));
      }
    }
    // the situation, as drawn (§6.2): each is placed relative to the float
    function drawSituation(F, t) {
      const sit = ST.situation ? RB.fishing.situation(ST.situation) : null;
      if (!sit || !F) return;
      const sg = sit.stage || {}, Rd = P5('reed'), Wd = P5('wood'), Lf = P5('leaf'), Tr = P5('trunk');
      const reeds = (x0) => { for (let i = 0; i < 8; i++) { const x = x0 + i * 2, h = 10 + ((i * 7) % 6); R(x, F.y - h + 2, 1, h, Rd[i & 1 ? 2 : 0]); R(x, F.y - h, 1, 2, Rd[3]); } };
      if (sg.obstacle === 'reeds') reeds(sg.side === 'left' ? F.x - 24 : F.x + 8);
      if (sg.obstacle === 'branch') { for (let i = 0; i < 26; i++) R(F.x + 6 + i, F.y - 26 + i * 0.9, 2, 1, Tr[0]); for (let i = 0; i < 9; i++) R(F.x + 10 + i * 3, F.y - 22 + i * 3, 3, 3, Lf[i % 3]); }
      if (sg.obstacle === 'post') { R(F.x - 22, F.y - 22, 5, 26, Wd[1]); R(F.x - 22, F.y - 22, 5, 1, Wd[3]); R(F.x - 21, F.y - 22, 1, 26, Wd[2]); ring(F.x - 20, F.y + 3, 5, 0.6); }
      if (sg.snag) { R(F.x + 4, F.y - 1, 9, 1, Tr[0]); R(F.x + 8, F.y - 2, 1, 1, Tr[1]); R(F.x + 6, F.y - 2, 2, 1, '#e8e4d8'); }
      if (sg.ripple && !reduce() && (t | 0) % 1600 < 30) ripples.push({ x: F.x + 10, y: F.y + 2, r: 9, t0: t, ms: 1400 });
      if (sg.ripple && reduce()) ring(F.x + 10, F.y + 2, 7, 0.6);
      if (sg.branchOver) { for (let i = 0; i < AW * 0.3; i++) R(F.x - AW * 0.15 + i, F.y - 30 + Math.sin(i / 9) * 2, 1, 2, Tr[0]); for (let i = 0; i < 12; i++) R(F.x - AW * 0.12 + i * 6, F.y - 28, 4, 4, Lf[i % 3]); reeds(F.x + 12); reeds(F.x + 26); }
      if (sg.notice) { const x = Math.round(AW * 0.36), y = G.bankY(x) - 22; R(x, y, 12, 9, '#d8c89a'); R(x, y, 12, 1, '#f0e4c0'); R(x + 5, y + 9, 2, 10, Wd[0]); }
      if (sg.tub) { const p = G.tub(); R(p.x - 9, p.y - 7, 18, 7, Wd[1]); R(p.x - 8, p.y - 7, 16, 2, P5('water')[2]); R(p.x - 9, p.y - 7, 18, 1, Wd[3]); R(Math.round(AW * 0.42), AH - 12, 20, 8, '#c8b088'); }
      if (sg.neighbour) { const x0 = AW - 2, y0 = Math.round(AH * 0.28); g.strokeStyle = 'rgba(240,236,224,0.7)'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(F.x + 30, F.y - 30, F.x + 20, F.y); g.stroke(); R(F.x + 19, F.y - 3, 3, 3, '#3a8a5a'); rodLine(AW - 1, Math.round(AH * 0.55), x0, y0); }
      if (sg.markers) {
        const a = { x: Math.round(AW * 0.44), y: Math.round(AH * 0.4) }, b = { x: Math.round(AW * 0.72), y: Math.round(AH * 0.38) };
        for (const m of [a, b]) { R(m.x - 2, m.y - 6, 5, 6, '#c83a2e'); R(m.x - 2, m.y - 6, 5, 1, '#e86a5a'); R(m.x, m.y - 12, 1, 6, '#2a2430'); ring(m.x, m.y + 1, 5, 0.5); }
        ST.markerAt = a;
      }
      if (sg.lanes) {
        const y = Math.round(AH * 0.46);
        for (let i = 0; i < 18; i++) R(AW * 0.74 + ((i * 13 + (reduce() ? 0 : t / 40)) % (AW * 0.24)), y - 8 + (i % 4) * 4, 5, 1, '#f4fbff');
        R(AW * 0.6, y - 10, AW * 0.12, 18, 'rgba(30,60,80,0.12)');
        for (const x of [AW * 0.62, AW * 0.86]) { R(x, y - 18, 1, 14, Wd[0]); R(x - 4, y - 22, 9, 6, '#e8dcb8'); }
      }
    }
    // the fish: a submerged silhouette near the float, the leap to land, held, released
    function fishDef() { return ST.fish ? RB.fishing.fish(ST.fish) : null; }
    function drawShadow(F, t) {
      const d = fishDef();
      if (!d || !F) return;
      const ph = ST.phase;
      if (ph !== 'wait' && ph !== 'bite' && ph !== 'situation' && ph !== 'task' && ph !== 'act') return;
      const c = RB.fishArt.canvas(d, { len: d.stage || 22, view: 'silhouette', alpha: 0.42, facing: 'right' });
      const k = ph === 'wait' ? cl((t - ST.t0) / 1800) : 1;
      const sit = ST.situation ? RB.fishing.situation(ST.situation) : null;
      const near = sit && sit.stage && sit.stage.near && (ph === 'situation' || ph === 'task');
      const dx = near ? 4 : lerp(-40, -14, ease(k)) + (reduce() ? 0 : Math.sin(t / 700) * 3);
      g.drawImage(c, Math.round(F.x + dx - c.width / 2), Math.round(F.y + 6 + (near ? 2 : 0)));
    }
    function drawLanding(t, pcInfo) {
      const d = fishDef();
      if (!d) return;
      const ph = ST.phase, e = t - ST.t0;
      const tubLand = ST.intent === 'tray';
      const hand = pcInfo ? pcInfo.hand : G.pc();
      if (ph === 'land') {
        const F0 = ST.lastFloat || G.patch(ST.patch);
        const to = tubLand ? G.tub() : { x: hand.x - 6, y: hand.y - 4 };
        const k = reduce() ? 1 : cl(e / 900);
        const x = lerp(F0.x, to.x, ease(k)), y = lerp(F0.y, to.y, ease(k)) - bell(k) * 26;
        const c = RB.fishArt.canvas(d, { len: d.stage || 22, view: 'side', bend: reduce() ? 0 : Math.sin(e / 70) * 0.8, facing: 'right' });
        const fx = Math.round(x - c.width / 2), fy = Math.round(y - c.height / 2);
        if (pcInfo && pcInfo.tip && !tubLand) { g.strokeStyle = 'rgba(240,236,224,0.85)'; g.lineWidth = 1; g.beginPath(); g.moveTo(pcInfo.tip.x + 0.5, pcInfo.tip.y + 0.5); g.lineTo(fx + c._fish.mouth.x + 0.5, fy + c._fish.mouth.y + 0.5); g.stroke(); }
        g.drawImage(c, fx, fy);
        if (!reduce() && e < 60 && !ST._splashed) { ST._splashed = true; ripples.push({ x: F0.x, y: F0.y, r: 10, t0: t, ms: 900 }); }
      } else if (ph === 'observe') {
        // held close to you: drawn a little larger than out on the water
        const c = RB.fishArt.canvas(d, { len: Math.round((d.stage || 22) * 1.4), view: 'side', facing: 'right' });
        const p = tubLand ? G.tub() : { x: hand.x - 6, y: hand.y };
        g.drawImage(c, Math.round(p.x - c.width / 2), Math.round(p.y - c.height / 2 - (tubLand ? 6 : 0)));
      } else if (ph === 'release') {
        const k = reduce() ? 1 : cl(e / 700);
        const p0 = tubLand ? G.tub() : { x: hand.x - 6, y: hand.y }, p1 = { x: Math.round(AW * 0.56), y: Math.round(AH * 0.78) };
        if (k < 1) {
          g.globalAlpha = 1 - ease(k) * 0.9;
          const c = RB.fishArt.canvas(d, { len: d.stage || 22, view: 'side', facing: 'right', bend: reduce() ? 0 : Math.sin(e / 90) * 0.5 });
          g.drawImage(c, Math.round(lerp(p0.x, p1.x, ease(k)) - c.width / 2), Math.round(lerp(p0.y, p1.y, ease(k)) - c.height / 2));
          g.globalAlpha = 1;
        }
        if (!ST._released && k > 0.6) { ST._released = true; ripples.push({ x: p1.x, y: p1.y, r: 9, t0: t, ms: 1000 }); }
      }
    }

    // ---- one frame -------------------------------------------------------------------------------------------------------
    function draw() {
      if (dead) return;
      const t = now();
      g.imageSmoothingEnabled = false;
      drawBg();
      drawWater(t);
      const F = floatPos(t);
      if (F) ST.lastFloat = { x: F.x, y: F.y };
      drawSituation(F, t);
      drawShadow(F, t);
      drawFloat(F);
      // depth order: the companion behind, then the player, then the pet in front on the bank
      drawComp(t);
      const pcInfo = drawPc(t);
      drawLine(pcInfo.tip, F, t);
      drawLanding(t, pcInfo);
      drawPet(t, F ? F.x : null);
      stats.frames++;
      stats.phases[ST.phase] = (stats.phases[ST.phase] || 0) + 1;
      // to the screen at a whole-number scale; under reduced motion, a brief dissolve from the last still
      const c = cv.getContext('2d');
      c.imageSmoothingEnabled = false;
      c.globalAlpha = 1;
      c.drawImage(art, 0, 0, AW * q, AH * q);
      if (prev) {
        const k = cl((t - dissolveT0) / 260);
        if (k >= 1) prev = null; else { c.globalAlpha = 1 - k; c.drawImage(prev, 0, 0); c.globalAlpha = 1; }
      }
    }
    function loop() {
      if (dead) return;
      raf = 0;
      draw();
      if (!reduce() || prev) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf && !dead) raf = requestAnimationFrame(loop); }
    function snapshot() {
      if (!reduce()) return;
      prev = document.createElement('canvas'); prev.width = cv.width; prev.height = cv.height;
      prev.getContext('2d').drawImage(cv, 0, 0);
      dissolveT0 = now();
    }

    // ---- labels the stage carries (readable text in the DOM, never pixel glyphs) ------------------------------------------
    function placeLabels() {
      labelsEl.innerHTML = '';
      const add = (x, y, html, cls) => {
        const d = RB.ui.el('div', 'fs-lab ' + (cls || ''), html);
        d.style.left = (x / AW * 100) + '%'; d.style.top = (y / AH * 100) + '%';
        labelsEl.appendChild(d);
      };
      const L = ST.labels || {};
      if (ST.phase === 'prep' && S) for (const p of S.patches) { const a = G.patch(p.id); add(a.x, a.y, RB.ui.jhtml(p.name.jp), 'patch' + (p.id === ST.patch ? ' on' : '')); }
      if (L.fast || L.slow) { const y = Math.round(AH * 0.46) - 24; add(AW * 0.62, y, RB.ui.jhtml(L.slow || ''), 'sign'); add(AW * 0.86, y, RB.ui.jhtml(L.fast || ''), 'sign'); }
      if (L.a || L.b) { add(AW * 0.44, AH * 0.4 - 18, RB.ui.jhtml(L.a || ''), 'tag'); add(AW * 0.72, AH * 0.38 - 18, RB.ui.jhtml(L.b || ''), 'tag'); }
    }
    // the companion's brief remark, over the stage (never over an open answer: the activity decides when)
    let sayT = 0;
    function say(line, who) {
      clearTimeout(sayT);
      if (!line) { sayEl.innerHTML = ''; sayEl.classList.remove('on'); return; }
      const nm = who && RB.content.chars[who] ? RB.content.chars[who].name.en : '';
      sayEl.innerHTML = '<span class="who">' + RB.util.esc(nm) + '</span>' + RB.ui.jhtml(line.jp) + '<span class="en">' + RB.util.esc(line.en) + '</span>';
      sayEl.classList.add('on');
      sayT = setTimeout(() => { sayEl.classList.remove('on'); }, 5200);
    }

    // ---- control -------------------------------------------------------------------------------------------------------------
    const DUR = { cast: 900, act: 1150, land: 1000, release: 800, observe: 500, after: 400 };
    function go(phase, o) {
      o = o || {};
      snapshot();
      ST.phase = phase; ST.t0 = now();
      if (phase === 'cast') { ST.floatAt = null; ST._splashed = false; ST._released = false; ST.markerAt = null; }
      if (phase === 'act') ST.floatAt = ST.lastFloat ? { x: ST.lastFloat.x, y: ST.lastFloat.y } : null;
      if (phase === 'land') { ST._splashed = false; event('splash'); }
      if (phase === 'release') ST._released = false;
      if (o.intent) ST.intent = o.intent;
      // the companion's behaviour follows the phase
      const beh = { prep: 'settle', cast: 'notes', wait: 'watch', bite: 'watch', situation: 'watch', task: 'watch', act: 'watch', land: 'splash', observe: 'lean', release: 'lean', after: 'rest' }[phase];
      if (beh && comp && phase !== 'land') setComp(beh);
      if (phase === 'prep' && comp) setTimeout(() => { if (!dead && ST.phase === 'prep') setComp('notes'); }, reduce() ? 0 : 1600);
      if (phase === 'after' && comp) setTimeout(() => { if (!dead && ST.phase === 'after') setComp('rest'); }, 900);
      placeLabels();
      updateText();
      kick();
      const ms = DUR[phase];
      if (!ms) return Promise.resolve();
      return new Promise((res) => setTimeout(() => { kick(); res(); }, reduce() ? 300 : ms));
    }
    function setComp(b) { if (!comp || ST.compBeh === b) return; ST.compPrev = ST.compBeh; ST.compBeh = b; ST.compT0 = now(); kick(); }
    function event(kind) {
      if (kind === 'splash') { if (comp) { setComp('splash'); setTimeout(() => { if (!dead && ST.phase === 'land') setComp('watch'); }, 700); } ST.petBeh = 'splash'; ST.petT0 = now(); }
      if (kind === 'remark' && comp) { const b0 = ST.compBeh; setComp('respond'); setTimeout(() => { if (!dead && ST.compBeh === 'respond') setComp(b0 === 'respond' ? 'rest' : b0); }, 1200); }
      kick();
    }
    function set(o) {
      if ('patch' in o) ST.patch = o.patch;
      if ('fish' in o) ST.fish = o.fish;
      if ('situation' in o) ST.situation = o.situation;
      if ('intent' in o) ST.intent = o.intent;
      if ('labels' in o) ST.labels = o.labels;
      if ('ribbon' in o) ST.ribbon = !!o.ribbon;
      placeLabels();
      updateText();
      kick();
    }
    // the text equivalent of the stage (its accessible name), by phase
    function text() {
      const parts = [];
      const nm = S ? S.name.en : 'the water';
      parts.push('You stand at ' + nm + ' with a rod' + (ST.ribbon ? ' (a ribbon tied on it)' : '') + '.');
      if (comp) parts.push(RB.content.chars[comp].name.en + ' is ' + ({ settle: 'settling in nearby', notes: 'getting the notes ready', watch: 'watching the float', splash: 'reacting to the splash', lean: 'leaning in to look', respond: 'answering', rest: 'resting nearby' }[ST.compBeh] || 'nearby') + '.');
      if (pet) parts.push('Your ' + ({ cat: 'cat', dog: 'dog', bird: 'small bird', tanuki: 'tanuki' }[pet.species] || 'pet') + ' ' + ({ cat: 'sits on the dry bank, following the float with its eyes', dog: 'sits by you, ears up', bird: 'hops along the bank, turning toward the ripples', tanuki: 'copies how you sit, a moment late' }[pet.species]) + '.');
      const P = ST.patch && S && S.patches.find((p) => p.id === ST.patch);
      const ph = ST.phase;
      if (ph === 'prep') parts.push(P ? 'You mean to cast at the ' + P.name.en.toLowerCase() + '.' : 'Choose where to cast.');
      if (ph === 'cast') parts.push('You cast toward the ' + (P ? P.name.en.toLowerCase() : 'water') + '.');
      if (ph === 'wait') parts.push('The float rests on the water. You wait.');
      if (ph === 'bite') parts.push('The float is bobbing: something is at the bait.');
      if ((ph === 'situation' || ph === 'task') && ST.situation) parts.push(RB.fishing.situation(ST.situation).scene.en);
      if (ph === 'act') parts.push('The line moves as you answered.');
      if (ph === 'land') parts.push('A fish comes up out of the water.');
      if (ph === 'observe' && fishDef()) parts.push('You hold the ' + fishDef().en + ' and look at it closely.');
      if (ph === 'release') parts.push('You let the fish go into the same water.');
      return parts.join(' ');
    }
    function updateText() { const t = text(); cv.setAttribute('aria-label', t); capEl.textContent = t; }

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => layout()) : null;
    if (ro) ro.observe(wrap);
    requestAnimationFrame(layout);
    updateText();
    return {
      el: wrap, go, set, event, say, text, layout,
      stats: () => JSON.parse(JSON.stringify(stats)),
      state: () => ({ phase: ST.phase, comp, compBeh: ST.compBeh, pet: pet ? pet.species : null, patch: ST.patch, fish: ST.fish, situation: ST.situation, intent: ST.intent, q, AW, AH }),
      destroy() { dead = true; if (raf) cancelAnimationFrame(raf); clearTimeout(sayT); if (ro) ro.disconnect(); figCache.clear(); wrap.remove(); capEl.remove(); },
    };
  }
  return { create, PC, COMP, BEHAVIOURS, proj, ZS };
})();
