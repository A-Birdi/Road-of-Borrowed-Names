/* Manybridge, Chapter 3 of the twelve: the travel volume's pages (expansion P16; F-39; AC-1).
 *
 * mb1.named — the first bridge given its name (`mb.bridge_named`, src/content/mb/23_scenes_under.js), from the name
 * spoken to the companion's word on the bank. Under the city: the oldest canal in a stone undercroft, its vault and a
 * tunnel running on into the dark; three stone piers across the water and, between them, the grey shape that held the
 * torn planks like a wall.
 *   spans   the grey shape sinks with rings spreading round it; the three spans come down onto the piers one after
 *           another, end to end to the far bank; a warm light runs along the rails from the near end to the far
 *   plaque  close on the bridge's end post, its bronze cap and the plaque nailed under it: the plaque was blank, and the
 *           brush marks come back down it; through a grating in the vault far above, the city's lamplight and its
 *           voices (light falling in a shaft, dust turning in it)
 *   bank    the two of you on the stone bank, the lit bridge before you: you from behind, your companion turned to you
 * mb1.dusk — the evening after (`mb.chapter_end`, from the Exchange at dusk to the way upriver).
 *   dusk    down the canal at dusk: storehouses with white plaster and black tile on both banks, arched bridges going
 *           off into the distance with their lanterns lit, a barge poled toward us; at the left the Exchange's tally
 *           board under its little roof, filling slip by slip
 *   sen     Sen at the boards with the register open in her hands; then the frown (the woodblocks)
 *   block   Sanpei pushing through the crowd with the blank woodblock held up, ink to the elbows; your companion turns
 * People are the game's own drawings (portraits, road sprites, the back view), graded into each shot's light. No letters,
 * kana or kanji are drawn: plaques, slips and registers carry brush marks and ruled lines only. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const Q = RB.seqKit, { R, mk, clamp, ease, lerp, cached, stage } = Q;
  const SP = RB.seqPaint;
  const P = () => RB.pxkit;
  const look = (id) => (RB.content.chars[id] || {}).look || {};
  const skin = (id) => Q.skinOf(look(id));
  const sub = (k, a, b) => clamp((k - a) / (b - a), 0, 1);
  const pts = (a) => { const o = []; for (let i = 0; i < a.length; i += 2) o.push([a[i], a[i + 1]]); return o; };

  // ---- light ----------------------------------------------------------------------------------------------
  // the undercroft: cool dark, the lamp you carry (warm, low left) and, once named, the bridge's warm rails
  const UNDER = { mul: [0.7, 0.78, 0.82], add: [4, 10, 14], rim: { side: 'r', col: '#ffcf86', k: [0.42, 0.18], below: 0.85 } };
  const DUSK = { mul: [0.92, 0.82, 0.8], add: [14, 4, 8], rim: { side: 'l', col: '#ffb070', k: [0.42, 0.2], below: 0.85 } };
  const DUSK_R = { mul: [0.92, 0.82, 0.8], add: [14, 4, 8], rim: { side: 'r', col: '#ffb070', k: [0.42, 0.2], below: 0.85 } };

  // ==== mb1.named · the undercroft, built once as a small place and seen from three cameras ======================
  // World units: the water is Y = 0; the far wall stands at Z = ZW with the vault springing from its top; the bridge
  // runs from its near end N to its far end E (each [X, Z]); its deck is at Y = DECK, the rails' tops at Y = RAIL.
  const ZW = 16, WALL = 3.0, DECK = 1.0, RAIL = 1.62, BW = 1.25;
  const VIEWS = {
    // wide, from the near bank: the bridge going away across the frame from the lower left
    wide: { F: 0.95, hy: 0.36, cx: 0.5, ch: 1.5, N: [-2.0, 4.6], E: [5.0, 15.0], tunnel: 8.2 },
    // from the bank further back and lower, for the two of you
    bank: { F: 0.82, hy: 0.36, cx: 0.46, ch: 1.3, N: [-1.4, 5.6], E: [4.6, 15.0], tunnel: 7.6 },
    // on the bridge at its near end, looking along it to the far bank
    along: { F: 0.8, hy: 0.42, cx: 0.5, ch: 1.75, N: [0.7, 2.6], E: [3.0, 14.0], tunnel: 5.6 },
  };
  const narrowV = (v) => Object.assign({}, v, { F: v.F * 1.9, cx: v.cx + 0.08, hy: v.hy * 0.92 });
  function camOf(w, vb, key, narrow) { const v = narrow ? narrowV(VIEWS[key]) : VIEWS[key]; return { v, C: SP.cam(w, vb, v) }; }
  // the bridge's frame: a point u (0 near … 1 far) along it, a across it (−1 the near side … 1 the far side)
  function bridgeAt(v, u, a, Y) {
    const dx = v.E[0] - v.N[0], dz = v.E[1] - v.N[1], len = Math.hypot(dx, dz);
    const ax = dz / len, az = -dx / len; // across, pointing to the bridge's left as it goes away
    const side = -(BW / 2) * a;
    return [v.N[0] + dx * u + ax * side, Y, v.N[1] + dz * u + az * side];
  }
  // which side of the bridge faces the camera: −1 or 1 (the side whose middle is nearer the eye)
  function nearSide(v) {
    const d = (a) => { const q = bridgeAt(v, 0.5, a, DECK); return Math.hypot(q[0], q[2]); };
    return d(-1) <= d(1) ? -1 : 1;
  }
  // the room: the far wall in courses, the tunnel, the vault over it, the water; and the piers
  function roomStatic(G, key, lit) {
    return cached('mb1.room|' + key + '|' + G.w + 'x' + G.h + '|' + G.vb + '|' + (lit ? 1 : 0), () => {
      const { w, h, narrow } = G, { v, C } = camOf(w, G.vb, key, narrow);
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), L = SP.layer(w, h), rnd = p.rnd(41);
      g.fillStyle = '#07090c'; g.fillRect(0, 0, w, h);
      const wallTop = Math.round(C.p(0, WALL, ZW)[1]), wallFoot = Math.round(C.p(0, 0, ZW)[1]);
      // the vault: courses of stone running across (lines of constant depth), two ribs coming toward us
      const vault = p.mat('#2e3436', { n: 6, at: 3, step: 0.07 });
      const vY = (Z) => WALL + 1.3 * (1 - ((Z - 9) / 7) ** 2);
      const rowZ = [];
      for (let y = 0; y < wallTop; y++) {
        let Z = ZW;
        for (let z = ZW; z > 1; z -= 0.02) { if (C.p(0, vY(z), z)[1] <= y) { Z = z; break; } }
        rowZ.push(Z);
      }
      if (wallTop > 0) L.fill(0, 0, w, wallTop, () => true, vault, (x, y) => {
        const Z = rowZ[Math.max(0, Math.min(rowZ.length - 1, Math.round(y)))];
        const course = (Math.floor(Z * 2) % 2 === 0 && ((Z * 2) % 1) < 0.08) ? -0.2 : 0;
        const X = ((x - C.cx) * Z) / C.F, rib = [-5, 2.5, 10].some((rx) => Math.abs(X - rx) < 0.28) ? 0.22 : 0;
        return clamp(0.18 + course + rib + (Z - 9) / 30 + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.6);
      });
      // the far wall: dressed stone in courses of uneven blocks, wet and darker near the water, moss at the foot
      const stone = p.mat('#4c5452', { n: 7, at: 3, step: 0.07 }), moss = p.mat('#3e5a44', { n: 5, at: 2, step: 0.08 });
      const ch = Math.max(3, Math.round(C.F * 0.3 / ZW)), bw0 = Math.max(6, Math.round(C.F * 0.62 / ZW));
      const tone = []; for (let i = 0; i < 997; i++) tone.push((rnd() - 0.5) * 0.05);
      L.fill(0, wallTop, w, wallFoot, () => true, stone, (x, y) => {
        const row = Math.floor((y - wallTop) / ch), off = (row * 37) % bw0, bx = Math.floor((x + off) / bw0), jx = (x + off) % bw0, jy = (y - wallTop) % ch;
        const joint = jy === 0 || jx === 0 ? -0.26 : jy === 1 ? 0.1 : jy === ch - 1 || jx === bw0 - 1 ? -0.08 : 0;
        const wet = clamp((y - (wallFoot - ch * 3)) / (ch * 3), 0, 1) * 0.16;
        const streak = ((bx * 13 + 5) % 7 === 0 && jx > 2 && jx < 5) ? -0.08 : 0;
        return clamp(0.36 + tone[(row * 31 + bx) % 997] + joint - wet + streak - (1 - (y - wallTop) / Math.max(1, wallFoot - wallTop)) * 0.12 + (lit ? 0.04 : 0), 0.02, 0.999);
      });
      L.recolor((x, y) => y > wallFoot - ch * 2 && ((x * 7 + y * 3) % 5 < 2), stone, moss, (x, y) => clamp(0.4 - (wallFoot - y) / (ch * 2) * 0.2, 0, 0.999));
      // the tunnel: a round-headed opening, its ring of wedge stones, the black of the canal going on
      const tc = C.p(v.tunnel, 1.0, ZW), tr = C.F * 1.25 / ZW;
      L.fill(tc[0] - tr - 2, tc[1] - tr - 2, tc[0] + tr + 2, wallFoot, (x, y) => (y >= tc[1] ? Math.abs(x - tc[0]) <= tr : (x - tc[0]) ** 2 + (y - tc[1]) ** 2 <= tr * tr), p.mat('#06080a', { n: 3, at: 1, line: false }), (x, y) => clamp(0.1 + (y - tc[1] + tr) / (tr * 6), 0, 0.5));
      for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; L.seg(tc[0] + Math.cos(a) * (tr + 1), tc[1] + Math.sin(a) * (tr + 1), tc[0] + Math.cos(a) * (tr + Math.max(2, tr * 0.22)), tc[1] + Math.sin(a) * (tr + Math.max(2, tr * 0.22)), Math.max(2, tr * 0.18), stone, i % 2 ? 0.62 : 0.5); }
      // the water: green-black, lighter under the lamp you carry (low left) and, once named, under the rails
      const wat = p.mat('#1c3836', { n: 7, at: 3, step: 0.07 });
      const railLine = (x) => { // where the near rail's reflection falls on the water at this screen x (approximate)
        const a = C.p(...bridgeAt(v, 0, -1, 0)), b = C.p(...bridgeAt(v, 1, -1, 0));
        const k2 = clamp((x - a[0]) / (b[0] - a[0] || 1), 0, 1);
        return lerp(a[1], b[1], k2);
      };
      SP.water(L, 0, wallFoot, w, h, wat, { band: Math.max(3, Math.round(C.F * 0.2 / ZW)), deep: 0.5, seed: 31, lit: (x, y) => {
        const lamp = clamp(1 - Math.hypot(x - w * 0.02, (y - h) * 1.4) / (w * 0.5), 0, 1) * 0.26;
        const rail = lit ? clamp(1 - Math.abs(y - railLine(x) - 6) / 26, 0, 1) * 0.24 : 0;
        return lamp + rail;
      } });
      // the piers, two thirds of the way and one third: stone blocks standing in the water
      const pier = p.mat('#68706a', { n: 7, at: 3, step: 0.07 });
      for (const u of [2 / 3, 1 / 3]) {
        const hl = 0.28 / Math.hypot(v.E[0] - v.N[0], v.E[1] - v.N[1]);
        const A = (uu, a, Y) => bridgeAt(v, uu, a * 1.18, Y);
        // its near face (toward the bridge's near end) and its left side (toward us), then the cap
        const pc = C.p(...A(u, -1, 0)), pch = Math.max(3, Math.round(pc[2] * 0.22)), pbw = Math.max(4, Math.round(pc[2] * 0.36));
        const blk = (base) => (x, y) => { const row = Math.floor(y / pch), bx = Math.floor((x + (row % 2) * (pbw >> 1)) / pbw); const j = (Math.round(y) % pch === 0 || Math.round(x + (row % 2) * (pbw >> 1)) % pbw === 0) ? -0.2 : 0; const wet = y > pc[1] - pch * 1.5 ? -0.16 : 0; return clamp(base + tone[(row * 17 + bx * 7) % 997] + j + wet + (p.bayer(x, y) - 0.5) * 0.05, 0.02, 0.999); };
        C.poly(L, [A(u - hl, -1, -0.2), A(u - hl, 1, -0.2), A(u - hl, 1, DECK - 0.16), A(u - hl, -1, DECK - 0.16)], pier, blk(0.5));
        const ns = nearSide(v);
        C.poly(L, [A(u - hl, ns, -0.2), A(u + hl, ns, -0.2), A(u + hl, ns, DECK - 0.16), A(u - hl, ns, DECK - 0.16)], pier, blk(ns < 0 ? 0.3 : 0.62));
      }
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // the wet line at the piers' feet and the wall's foot
      g.fillStyle = 'rgba(10,20,22,0.5)'; g.fillRect(0, wallFoot - 1, w, 2);
      return { cv, wallFoot };
    });
  }
  // one span of the bridge (i 0..2): its deck (planks across), its near-side fascia, posts and two rails each side;
  // the end posts (the bridge's first and last) thicker, with bronze caps
  function spanArt(G, key, i) {
    return Q.small('mb1.span|' + key + '|' + G.w + 'x' + G.h + '|' + G.vb + '|' + i, () => {
      const { w, h, narrow } = G, { v, C } = camOf(w, G.vb, key, narrow), p = P();
      const L = SP.layer(w, h);
      const wood = p.mat('#5e4632', { n: 7, at: 3, step: 0.07 }), rail = p.mat('#6e5440', { n: 6, at: 3, step: 0.08 }), bronze = p.mat('#7e6c3a', { n: 7, at: 3, step: 0.08 });
      const u0 = i / 3, u1 = (i + 1) / 3, B = (u, a, Y) => bridgeAt(v, u, a, Y);
      const len = Math.hypot(v.E[0] - v.N[0], v.E[1] - v.N[1]), ns = nearSide(v);
      // the far side's rails first (behind the deck)
      const railRun = (a) => {
        for (let u = u0; u <= u1 + 1e-6; u += 0.9 / len) C.seg(L, B(u, a, DECK), B(u, a, RAIL), 0.07, rail, a !== ns ? 0.35 : 0.7);
        C.seg(L, B(u0, a, RAIL), B(u1, a, RAIL), 0.06, rail, a !== ns ? 0.45 : 0.8);
        C.seg(L, B(u0, a, (DECK + RAIL) / 2), B(u1, a, (DECK + RAIL) / 2), 0.035, rail, a !== ns ? 0.3 : 0.55);
      };
      railRun(-ns);
      // the deck: planks across, a dark seam between each
      C.poly(L, [B(u0, -1, DECK), B(u1, -1, DECK), B(u1, 1, DECK), B(u0, 1, DECK)], wood, 0.66);
      for (let u = u0 + 0.22 / len; u < u1; u += 0.22 / len) C.seg(L, B(u, -1, DECK), B(u, 1, DECK), 0.018, wood, 0.36);
      for (let u = u0 + 0.11 / len; u < u1; u += 0.22 / len) C.seg(L, B(u, -0.9, DECK), B(u, 0.9, DECK), 0.012, wood, 0.74);
      // the fascia on the near side and its shadowed beam
      C.poly(L, [B(u0, ns, DECK), B(u1, ns, DECK), B(u1, ns, DECK - 0.16), B(u0, ns, DECK - 0.16)], wood, 0.3);
      for (let u = u0 + 0.6 / len; u < u1; u += 0.6 / len) C.seg(L, B(u, ns, DECK), B(u, ns, DECK - 0.16), 0.012, wood, 0.12);
      C.poly(L, [B(u0, ns, DECK - 0.16), B(u1, ns, DECK - 0.16), B(u1, ns, DECK - 0.24), B(u0, ns, DECK - 0.24)], wood, 0.14);
      for (let u = u0 + 0.45 / len; u < u1; u += 0.9 / len) C.poly(L, [B(u - 0.05 / len, ns * 1.12, DECK - 0.13), B(u + 0.05 / len, ns * 1.12, DECK - 0.13), B(u + 0.05 / len, ns * 1.12, DECK - 0.27), B(u - 0.05 / len, ns * 1.12, DECK - 0.27)], wood, 0.5);
      // the near edge of the deck catches a little light
      C.seg(L, B(u0, ns, DECK), B(u1, ns, DECK), 0.02, wood, 0.82);
      railRun(ns);
      // the end posts with their caps (a giboshi: a bronze onion on a ring)
      for (const [u, a] of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
        if ((u === 0 && i !== 0) || (u === 1 && i !== 2)) continue;
        if (key === 'along' && u === 0 && a === ns) continue; // (that post is the one close in front of us in this shot)
        C.seg(L, B(u, a, DECK - 0.2), B(u, a, RAIL + 0.16), 0.17, wood, a === ns ? 0.7 : 0.35);
        const c0 = C.p(...B(u, a, RAIL + 0.3)), r = Math.max(2, c0[2] * 0.12);
        L.fill(c0[0] - r, c0[1] - r * 1.8, c0[0] + r, c0[1] + r, (x, y) => { const t2 = (y - (c0[1] - r * 1.8)) / (r * 2.8); const rr = r * Math.sin(Math.PI * clamp(t2 * 0.9 + 0.1, 0, 1)) * (t2 < 0.35 ? 0.4 + t2 * 1.7 : 1); return Math.abs(x - c0[0]) <= rr; }, bronze, p.sphere(c0[0] - r * 0.4, c0[1] - r * 0.6, r, r * 1.2, { amb: 0.3 }));
      }
      L.outline();
      return { cv: L.canvas() };
    });
  }
  // the near rail's top, as screen points from u = 0 to u = k (for the light running along it)
  function railPts(C, v, k, a) {
    const out = [], n = 60;
    for (let j = 0; j <= Math.round(n * k); j++) { const q = C.p(...bridgeAt(v, j / n, a, RAIL)); out.push(q); }
    return out;
  }
  function drawLight(c, C, v, k, t, still) {
    if (k <= 0) return;
    for (const a of [-1, 1]) {
      const pts = railPts(C, v, k, a);
      for (let j = 1; j < pts.length; j++) {
        const A = pts[j - 1], B = pts[j], n = Math.max(1, Math.round(Math.hypot(B[0] - A[0], B[1] - A[1])));
        for (let s2 = 0; s2 < n; s2++) { const x = lerp(A[0], B[0], s2 / n), y = lerp(A[1], B[1], s2 / n), th = Math.max(1, Math.round(A[2] * 0.025)); R(c, x, y - (th >> 1), 1, th, a === nearSide(v) ? ((j + s2) % 5 ? '#f0b870' : '#fff0c8') : '#c08850'); }
      }
      if (a === nearSide(v)) for (let j = 6; j < pts.length; j += 14) SP.glow(c, pts[j][0], pts[j][1] + pts[j][2] * 0.3, pts[j][2] * 0.4 * (still ? 1 : 0.95 + Math.sin(t / 900 + j) * 0.05), '255,196,120', 0.09, 4);
    }
  }
  // the grey shape that held the planks: tall, stooped, the torn planks hugged upright before it (2.6 units tall)
  function spirit(G, C) {
    const hpx = Math.round(C.F * 2.6 / 8.4);
    return Q.small('mb1.spirit|' + hpx, () => {
      const p = P(), H = hpx, W = Math.round(H * 0.5), L = SP.layer(W, H), cx = W / 2, u = H / 92;
      const grey = p.mat('#9aa8a4', { n: 7, at: 3, step: 0.07 });
      const half = (y) => (y < 14 * u ? Math.sqrt(Math.max(0, 1 - ((y - 14 * u) / (12 * u)) ** 2)) * 9 * u : 10 * u + (y - 14 * u) * 0.16);
      L.fill(0, 0, W, H, (x, y) => y >= 2 * u && Math.abs(x - cx + (y < 30 * u ? (30 * u - y) * 0.12 : 0)) <= half(y), grey, (x, y) => clamp(0.6 - (x - cx) / W * 0.9 - y / H * 0.25 + ((Math.round(y + x * 0.5) % Math.max(3, Math.round(9 * u))) === 0 ? -0.12 : 0), 0.02, 0.999));
      L.ell(cx - 3 * u, 14 * u, Math.max(1, 1.4 * u), Math.max(1, 2 * u), p.solid('#2a3436'), 1);
      L.ell(cx + 3.4 * u, 14 * u, Math.max(1, 1.4 * u), Math.max(1, 2 * u), p.solid('#2a3436'), 1);
      const wood = p.mat('#6e5a46', { n: 6, at: 3, step: 0.08 });
      for (let i = 0; i < 4; i++) {
        const bx = cx - 12 * u + i * 6 * u, top = (22 + (i % 2) * 4) * u;
        L.rect(bx, top, 5 * u, H - top, wood, (x, y) => clamp(0.62 - (x - bx) / (5 * u) * 0.4 - (y - top) / H * 0.2 + (((Math.round(y) + i * 5) % Math.max(3, Math.round(11 * u))) === 0 ? -0.2 : 0), 0.02, 0.999));
      }
      L.seg(cx - 14 * u, 36 * u, cx + 10 * u, 40 * u, Math.max(2, 4 * u), grey, 0.55);
      L.seg(cx - 12 * u, 52 * u, cx + 12 * u, 50 * u, Math.max(2, 4 * u), grey, 0.4);
      L.outline();
      return { cv: L.canvas(), W, H, cx };
    });
  }
  const geomRoom = (w, h, vb) => { const S = stage(w, h, vb); return Object.assign(S, { narrow: S.lay === 'narrow' }); };

  const spans = {
    phases: [['name', 1600]],
    safe: { wide: 'the bridge across the frame above the sheet', narrow: 'the bridge in the upper half', land: 'the bridge and the shape' },
    draw(c, w, h, t, st) {
      const G = geomRoom(w, h, st.vb), still = st.still, { v, C } = camOf(w, st.vb, 'wide', G.narrow);
      const k = st.at('name'), lightK = ease(sub(k, 0.72, 1));
      // (the room's own light comes up with the light along the rails: it switched on in one frame as the action ended; AR-2)
      const room = roomStatic(G, 'wide', lightK >= 1);
      c.drawImage(room.cv, 0, 0);
      if (lightK > 0 && lightK < 1) { c.globalAlpha = lightK; c.drawImage(roomStatic(G, 'wide', true).cv, 0, 0); c.globalAlpha = 1; }
      // the shape sinks (0 … 0.42) where the middle span will lie, rings spreading round it
      const mid = bridgeAt(v, 0.5, 0, 0), mp = C.p(mid[0], 0, mid[2]);
      const sink = ease(sub(k, 0, 0.42));
      if (sink < 1) {
        const sp = spirit(G, C), top = Math.round(mp[1] - sp.H * 0.96 + sp.H * sink);
        const vis = Math.max(0, Math.round(mp[1]) - top);
        if (vis > 0) c.drawImage(sp.cv, 0, 0, sp.W, vis, Math.round(mp[0] - sp.cx), top, sp.W, vis);
      }
      SP.rings(c, mp[0], mp[1] + 1, mp[2] * 0.7, sub(k, 0.05, 0.75), '200,226,226', 4);
      // the spans come down onto the piers one after another (0.3 … 0.8), the near one first
      for (let i = 0; i < 3; i++) {
        const d = ease(sub(k, 0.3 + i * 0.13, 0.48 + i * 0.13));
        if (d <= 0) continue;
        // (each comes out of the dark as it starts down: it appeared whole in mid-air; AR-2)
        c.globalAlpha = Math.min(1, d * 4);
        c.drawImage(spanArt(G, 'wide', i).cv, 0, Math.round((1 - d) * -C.p(...bridgeAt(v, (i + 0.5) / 3, 0, 0))[2] * 1.6));
        c.globalAlpha = 1;
      }
      drawLight(c, C, v, lightK, t, still);
      if (lightK > 0) SP.glints(c, 0, room.wallFoot + 2, w, Math.max(4, st.vb - room.wallFoot), t, 22, 41, '255,214,150', still);
      SP.glints(c, 0, h - Math.round(h * 0.25), w * 0.35, Math.round(h * 0.2), t, 10, 43, '255,226,180', still);
    },
    focus(w, h, vb) { const G = geomRoom(w, h, vb), { v, C } = camOf(w, vb, 'wide', G.narrow); const a = C.p(...bridgeAt(v, 0.05, -1, RAIL + 0.5)), b = C.p(...bridgeAt(v, 0.95, 1, 0)); const x0 = clamp(Math.min(a[0], b[0]), 0, w - 20), x1 = clamp(Math.max(a[0], b[0]), x0 + 20, w), y0 = clamp(Math.min(a[1], b[1]), 0, vb - 20); return { x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(Math.min(vb - 2, Math.max(a[1], b[1])) - y0) }; },
  };

  // ==== mb1.named · plaque: on the bridge at its near end, the end post close at the left; the city's light ======
  const plaque = {
    phases: [['letters', 1500]],
    safe: { wide: 'the plaque and its cap above the sheet, the bridge going away behind', narrow: 'the plaque in the upper half', land: 'the plaque' },
    draw(c, w, h, t, st) {
      const G = geomRoom(w, h, st.vb), still = st.still, { s } = G, { v, C } = camOf(w, st.vb, 'along', G.narrow);
      c.drawImage(roomStatic(G, 'along', true).cv, 0, 0);
      for (let i = 2; i >= 0; i--) c.drawImage(spanArt(G, 'along', i).cv, 0, 0);
      drawLight(c, C, v, 1, t, still);
      // the city's lamplight falling through a grating in the vault onto the middle of the bridge: a shaft of
      // stepped warm light with dust turning in it
      const foot = C.p(...bridgeAt(v, 0.45, 0, DECK)), top = [foot[0] + w * 0.18, -2];
      const half0 = Math.max(4, foot[2] * 0.5);
      c.fillStyle = 'rgba(255,200,130,0.075)';
      for (let y = Math.max(0, top[1]); y < foot[1]; y++) { const f = (y - top[1]) / (foot[1] - top[1]); const x = lerp(top[0], foot[0], f), hw = lerp(half0 * 0.7, half0, f); c.fillRect(Math.round(x - hw), y, Math.round(hw * 2), 1); }
      SP.glow(c, foot[0], foot[1], half0 * 1.6, '255,206,140', 0.14, 3);
      Q.dust(c, top[0] - half0, 0, top[0] + half0, foot[1], foot[0] - top[0], t, 26, '255,226,170', still, 9);
      // the end post close at the left: square timber, the plaque nailed to it, its bronze cap above
      const k = clamp(G.Z * 1.5, 1, 2.2), px = Math.round(w * (G.narrow ? 0.2 : 0.17)), pw = Math.round(24 * k);
      const capY = Math.round(Math.max(s(8), st.vb * 0.1)), plY = capY + Math.round(30 * k), plH = Math.round(Math.min(st.vb - plY - s(4), 96 * k)), plW = Math.round(16 * k);
      const POST = Q.small('mb1.post|' + w + 'x' + h + '|' + st.vb, () => {
        const p = P(), L = SP.layer(w, h), wood = p.mat('#6a4e36', { n: 7, at: 3, step: 0.07 }), bronze = p.mat('#7e6c3a', { n: 7, at: 3, step: 0.08 }), board = p.mat('#c8b48e', { n: 6, at: 3, step: 0.06 });
        L.rect(px - pw / 2, capY + Math.round(12 * k), pw, h, wood, (x, y) => clamp(0.66 - (x - px + pw / 2) / pw * 0.36 + (((Math.round(y) + Math.round(x * 3)) % Math.round(13 * k)) === 0 ? -0.12 : 0), 0.02, 0.999));
        L.rect(px + pw / 2, capY + Math.round(14 * k), Math.round(7 * k), h, wood, 0.2);
        L.ell(px, capY + Math.round(10 * k), Math.round(14 * k), Math.round(4 * k), bronze, 0.4);
        L.fill(px - Math.round(11 * k), capY - Math.round(12 * k), px + Math.round(11 * k), capY + Math.round(10 * k), (x, y) => { const u = (y - (capY - 12 * k)) / (22 * k); const r = 11 * k * Math.sin(Math.PI * clamp(u * 0.92 + 0.08, 0, 1)) * (u < 0.3 ? 0.55 + u * 1.5 : 1); return Math.abs(x - px) <= r; }, bronze, p.sphere(px - 4 * k, capY - 4 * k, 11 * k, 11 * k, { amb: 0.3 }));
        L.rect(px - 1, capY - Math.round(17 * k), Math.max(2, Math.round(2 * k)), Math.round(6 * k), bronze, 0.7);
        L.rect(px - plW / 2, plY, plW, plH, board, (x, y) => clamp(0.58 - (x - px + plW / 2) / plW * 0.2 - (y - plY) / plH * 0.12 + (((Math.round(y) * 3 + Math.round(x)) % Math.round(9 * k)) === 0 ? -0.08 : 0), 0.02, 0.999));
        for (const ny of [plY + Math.round(3 * k), plY + plH - Math.round(4 * k)]) L.rect(px - 1, ny, Math.max(2, Math.round(2 * k)), Math.max(2, Math.round(2 * k)), p.mat('#4a4448', { n: 3, at: 1 }), 0.8);
        L.outline();
        return { cv: L.canvas() };
      });
      c.drawImage(POST.cv, 0, 0);
      // the shaft's warmth on the post's lit face, and the brush marks coming back down the plaque
      const kl = st.at('letters');
      SP.marks(c, px, plY + Math.round(6 * k), plH - Math.round(12 * k), 7, kl, '#2a1e1a', 77);
      if (kl > 0 && kl < 1) SP.glow(c, px, plY + Math.round(6 * k) + (plH - Math.round(12 * k)) * kl, Math.round(10 * k), '255,210,140', 0.3, 3);
      SP.glow(c, px, plY + plH / 2, Math.round(plH * 0.6), '255,200,130', 0.06 + 0.1 * ease(kl), 4);
    },
    focus(w, h, vb) { const G = geomRoom(w, h, vb), k = clamp(G.Z * 1.5, 1, 2.2), px = Math.round(w * (G.narrow ? 0.2 : 0.17)), capY = Math.round(Math.max(G.s(8), vb * 0.1)); return { x: px - Math.round(14 * k), y: Math.max(0, capY - Math.round(18 * k)), w: Math.round(28 * k), h: Math.round(vb - 4 - Math.max(0, capY - Math.round(18 * k))) }; },
  };

  // ==== mb1.named · bank: the two of you before the lit bridge =================================================
  const bank = {
    phases: [['turn', 800]],
    safe: { wide: 'your companion\'s face and the lit bridge above the sheet', narrow: 'their face in the upper half', land: 'their face' },
    draw(c, w, h, t, st) {
      const G = geomRoom(w, h, st.vb), still = st.still, { s } = G, { v, C } = camOf(w, st.vb, 'bank', G.narrow);
      c.drawImage(roomStatic(G, 'bank', true).cv, 0, 0);
      for (let i = 2; i >= 0; i--) c.drawImage(spanArt(G, 'bank', i).cv, 0, 0);
      drawLight(c, C, v, 1, t, still);
      SP.glints(c, 0, Math.round(C.p(0, 0, ZW)[1]) + 2, w, st.vb, t, 18, 51, '255,214,150', still);
      // the stone bank you stand on, along the bottom of the frame
      const ledge = Q.small('mb1.ledge|' + w + 'x' + h + '|' + st.vb, () => {
        const p = P(), L = SP.layer(w, h), M = p.mat('#5a6062', { n: 7, at: 3, step: 0.07 }), y0 = Math.round(st.vb - s(G.narrow ? 6 : 14));
        const bw2 = Math.max(10, s(26)), rr = p.rnd(19), tn = []; for (let i = 0; i < 64; i++) tn.push((rr() - 0.5) * 0.08);
        L.rect(0, y0, w, h - y0, M, (x, y) => { const row = Math.floor((y - y0) / s(9)), bx = Math.floor((x + row * 11) / bw2); const j = ((y - y0) % s(9) === 0 || (x + row * 11) % bw2 === 0) ? -0.22 : 0; return clamp(0.5 - (y - y0) / (h - y0) * 0.25 + tn[(row * 7 + bx) & 63] + j, 0.02, 0.999); });
        L.rect(0, y0, w, Math.max(2, s(2)), M, 0.78);
        L.outline();
        return { cv: L.canvas() };
      });
      c.drawImage(ledge.cv, 0, 0);
      // you from behind at the lower left, your companion at the right turning to you
      const W = Math.round(clamp(s(118), 80, 160));
      const pb = Q.back(st.cast.pc || {}, W, { light: 'r' });
      const bx = Math.round(w * (G.narrow ? 0.26 : 0.2)), by = Math.round(st.vb + s(G.narrow ? 90 : 80));
      if (pb) c.drawImage(pb.cv, bx - pb.ax, by - pb.ay);
      const comp = st.cast.comp;
      if (comp) {
        const kt = st.at('turn'), e = ease(kt);
        const expr = st.test('comp=suzu') ? 'laugh' : 'smile';
        const b = Q.bust(comp.id, kt > 0.3 ? expr : 'neutral', kt > 0.3 ? { look: [-1, 0], head: [-1, 0] } : { look: [1, -1] }, UNDER, false, 200);
        const cx = Math.round(w * (G.narrow ? 0.7 : 0.66) + (1 - e) * s(4)), cy = Math.max(Math.round(st.vb + s(10)), 98);
        if (b) c.drawImage(b.cv, cx - b.ax, cy - b.ay);
      }
    },
    focus(w, h, vb) { const G = geomRoom(w, h, vb), cx = Math.round(w * (G.narrow ? 0.7 : 0.66)), cy = Math.max(Math.round(vb + G.s(10)), 98); return { x: cx - 34, y: cy - 92, w: 68, h: Math.min(vb - 2, cy - 30) - (cy - 92) }; },
  };

  RB.sequence.define('mb1.named', {
    title: { en: 'Musubi Bridge', jp: '{結|むす}び{橋|ばし}' }, chapter: 'mb1', scene: 'mb.bridge_named', memory: true,
    memo: { jp: '', en: 'Under Manybridge, the first bridge took back its name, and its light ran along the rails to the far bank.' },
    shots: { spans, plaque, bank },
  });

  // ==== mb1.dusk · down the canal at dusk =====================================================================
  // World units: the canal's water is Y = 0 and runs away along +Z between stone embankments at X = ±CW; a walkway on
  // each side, then the storehouses' fronts at X = ±HX; arched bridges cross it at the depths in BRIDGES.
  const CW = 2.3, HX = 3.5, BRIDGES = [8.5, 16, 26];
  const DVIEW = { F: 0.85, hy: 0.44, cx: 0.52, ch: 1.55 };
  function geomDusk(w, h, vb) {
    const S = stage(w, h, vb), narrow = S.lay === 'narrow';
    const C = SP.cam(w, vb, narrow ? { F: 1.5, hy: 0.42, cx: 0.55, ch: 1.55 } : DVIEW);
    const bx = Math.round(narrow ? -S.s(10) : w * 0.0), bw = Math.round(narrow ? w * 0.26 : w * 0.13);
    return Object.assign(S, { C, narrow, bx, bw, hz: C.hy, vx: C.cx });
  }
  function duskStatic(G) {
    return cached('mb1.dusk|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, C } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(83);
      Q.bandsIn(g, 0, 0, w, C.hy + 4, ['#2a2650', '#3e3462', '#5e406a', '#8a4e66', '#b8645e', '#dc8a5e', '#f0b070'], 0.45);
      SP.stars(g, 0, 0, w, Math.round(C.hy * 0.4), 18, 61, 0);
      const L = SP.layer(w, h);
      // the water between the embankments, the sky's orange lying down its middle
      const wat = p.mat('#3a4a5e', { n: 7, at: 3, step: 0.08 });
      SP.water(L, 0, C.hy, w, h, wat, { band: Math.max(3, G.s(4)), deep: 0.25, seed: 63, lit: (x, y) => clamp(1 - Math.abs(x - C.cx) / Math.max(4, (y - C.hy) * 0.9), 0, 1) * 0.36 });
      const stone = p.mat('#6a6662', { n: 7, at: 3, step: 0.07 }), plaster = p.mat('#ddd4c2', { n: 7, at: 4, step: 0.06 }), base = p.mat('#3a3a46', { n: 6, at: 2, step: 0.08 }), tile = p.mat('#3a3e50', { n: 7, at: 3, step: 0.07 }), wood = p.mat('#5a4030', { n: 6, at: 3, step: 0.08 }), paper = p.mat('#ffcf86', { n: 4, at: 2 });
      const Zf = 60;
      for (const side of [-1, 1]) {
        const lit = side < 0 ? 0.62 : 0.4; // the left bank's fronts face the sunset glow a little more
        // the embankment's face and the walkway's top
        C.poly(L, [[side * CW, 0, 1], [side * CW, 0, Zf], [side * CW, 0.55, Zf], [side * CW, 0.55, 1]], stone, (x, y) => clamp(lit - 0.12 + ((Math.round(y) % 4) === 0 ? -0.14 : 0) + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999));
        C.poly(L, [[side * CW, 0.55, 1], [side * CW, 0.55, Zf], [side * HX, 0.55, Zf], [side * HX, 0.55, 1]], stone, (x, y) => clamp(0.5 + (p.bayer(x, y) - 0.5) * 0.08, 0.02, 0.999));
        // the storehouses, nearest last so each overlaps the one behind
        const houses = [];
        for (let z = 1.2; z < Zf; ) { const len = 2.6 + rnd() * 1.8; houses.push([z, z + len, 2.6 + rnd() * 0.9]); z += len + (rnd() < 0.25 ? 0.6 : 0.1); }
        for (const [z0, z1, top] of houses.reverse()) {
          const X = side * HX, eave = side * (HX - 0.55);
          // the front: dark base boards to 1.4, white plaster over it, a lit paper window in some
          C.poly(L, [[X, 0.55, z0], [X, 0.55, z1], [X, 1.4, z1], [X, 1.4, z0]], base, (x, y) => clamp(0.4 + ((Math.round(x) + Math.round(y)) % 4 === 0 ? 0.2 : 0), 0.02, 0.999));
          C.poly(L, [[X, 1.4, z0], [X, 1.4, z1], [X, top, z1], [X, top, z0]], plaster, (x, y) => clamp(lit + (p.bayer(x, y) - 0.5) * 0.05, 0.02, 0.999));
          if (rnd() < 0.6) { const wz = lerp(z0, z1, 0.3 + rnd() * 0.3); C.poly(L, [[X, 1.8, wz], [X, 1.8, wz + 0.5], [X, 2.3, wz + 0.5], [X, 2.3, wz]], paper, (x, y) => (rnd() < 0.5 ? 0.6 : 0.9)); }
          // the end wall's edge toward us, darker
          C.poly(L, [[X, 0.55, z0], [X + side * 0.3, 0.55, z0], [X + side * 0.3, top, z0], [X, top, z0]], plaster, () => 0.2);
          // the eave and the roof going up and back
          C.poly(L, [[eave, top + 0.2, z0 - 0.3], [eave, top + 0.2, z1 + 0.3], [X, top + 0.1, z1 + 0.3], [X, top + 0.1, z0 - 0.3]], wood, () => 0.12);
          C.poly(L, [[eave, top + 0.2, z0 - 0.3], [eave, top + 0.2, z1 + 0.3], [X + side * 1.6, top + 1.4, z1 + 0.3], [X + side * 1.6, top + 1.4, z0 - 0.3]], tile, (x, y) => clamp(0.5 + ((Math.round(x) % 3) === 0 ? -0.2 : 0) + (p.bayer(x, y) - 0.5) * 0.05, 0.02, 0.999));
          C.seg(L, [eave, top + 0.2, z0 - 0.3], [eave, top + 0.2, z1 + 0.3], 0.07, tile, 0.86);
        }
      }
      // the bridges, furthest first: a shallow arch of planks with rails, posts at the ends
      for (const z of BRIDGES.slice().reverse()) {
        const n = 16, arc = (i) => { const u = i / n, X = lerp(-HX + 0.4, HX - 0.4, u); return [X, 0.9 + Math.sin(Math.PI * u) * 0.6, z]; };
        for (let i = 0; i < n; i++) {
          const a = arc(i), b = arc(i + 1);
          C.poly(L, [[a[0], a[1], z], [b[0], b[1], z], [b[0], b[1] - 0.24, z], [a[0], a[1] - 0.24, z]], wood, () => 0.45);
          C.seg(L, [a[0], a[1] + 0.55, z], [b[0], b[1] + 0.55, z], 0.06, wood, 0.7);
          if (i % 2 === 0) C.seg(L, [a[0], a[1], z], [a[0], a[1] + 0.55, z], 0.06, wood, 0.6);
        }
      }
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv };
    });
  }
  // the Exchange's tally board at the left: a dark board with rows of hooks under a little roof, slips filling it
  function boardStatic(G) {
    return cached('mb1.board|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { s, bx, bw } = G, p = P();
      const top = Math.round(G.vb * 0.06), H = Math.round(G.h - top), L = SP.layer(G.w, G.h);
      const wood = p.mat('#4a3628', { n: 7, at: 3, step: 0.07 }), tile = p.mat('#3a3e4e', { n: 6, at: 3, step: 0.08 });
      SP.planks(L, bx, top + s(16), bw, H, wood, { vertical: true, board: Math.max(3, s(8)), base: 0.4, seed: 13 });
      SP.roof(L, bx - s(6), bx + bw + s(8), top, s(16), tile, { course: Math.max(2, s(4)) });
      for (const x of [bx - s(2), bx + bw - s(4)]) L.rect(x, top + s(14), s(6), H, wood, (xx) => (xx < x + s(2) ? 0.75 : 0.3));
      L.outline();
      const rows = [], hooks = Math.max(3, Math.round(bw / s(14)));
      for (let r = 0; r < 4; r++) for (let i = 0; i < hooks; i++) rows.push({ x: Math.round(bx + s(6) + (i + 0.5) * (bw - s(12)) / hooks), y: Math.round(top + s(26) + r * s(30)) });
      return { cv: L.canvas(), rows, top };
    });
  }
  const DUSK_PEOPLE = ['mb_gonta', 'mb_ichi', 'mb_sen'];
  const dusk = {
    phases: [['boards', 1500]],
    safe: { wide: 'the canal and its bridges above the sheet, the board at the left', narrow: 'the canal in the upper half', land: 'the canal' },
    draw(c, w, h, t, st) {
      const G = geomDusk(w, h, st.vb), { s, C } = G, still = st.still;
      c.drawImage(duskStatic(G).cv, 0, 0);
      // lanterns on the bridges and at the storehouse corners
      for (const z of BRIDGES) {
        for (const X of [-HX + 0.6, -1.2, 1.2, HX - 0.6]) {
          const q = C.p(X, 1.9, z), r0 = Math.max(1, Math.round(q[2] * 0.09)), h0 = Math.max(2, Math.round(q[2] * 0.17));
          if (q[2] > 30) SP.lantern(c, q[0], q[1], r0, h0, true, t, still);
          else { R(c, q[0], q[1], Math.max(1, Math.round(q[2] * 0.08)), Math.max(1, Math.round(q[2] * 0.1)), '#ffcf86'); SP.glow(c, q[0], q[1], Math.max(3, q[2] * 0.3), '255,190,110', 0.25); }
        }
      }
      // people crossing the near bridge (small road figures)
      const nb = BRIDGES[0];
      DUSK_PEOPLE.forEach((id, i) => {
        const X = -1.6 + i * 1.3 + (still ? 0 : ((t / 3000 + i * 0.37) % 1) * 0.6 * (i % 2 ? -1 : 1));
        const q = C.p(X, 0.9 + Math.sin(Math.PI * (X + HX) / (2 * HX)) * 0.6, nb), sc = clamp(q[2] * 1.7 / 58, 0.2, 1);
        const f = Q.figure(look(id), i % 2 ? 'left' : 'right', still ? 'i0' : 'w' + (Math.floor(t / 180 + i) % 4), sc, DUSK);
        if (f) c.drawImage(f.cv, Math.round(q[0] - f.ax), Math.round(q[1] - f.ay));
      });
      // a barge poled toward us down the middle, bales aboard, its prow lantern lit
      const bob = still ? 0 : Math.sin(t / 700) * 0.02;
      const hz = 5.2, hp = (X, Y) => C.p(X, Y + bob, hz);
      const a = hp(-0.9, 0.18), b = hp(0.9, 0.18), a2 = hp(-0.9, 0.0);
      R(c, a[0], a[1], b[0] - a[0], Math.max(2, a2[1] - a[1]), '#4a3426');
      R(c, a[0], a[1] - 1, b[0] - a[0], 1, '#7a5a40');
      for (let i = 0; i < 3; i++) { const q = hp(-0.7 + i * 0.42, 0.42); R(c, q[0], q[1], Math.round(q[2] * 0.38), Math.round(q[2] * 0.22), i % 2 ? '#b8a070' : '#a08a5e'); R(c, q[0], q[1], Math.round(q[2] * 0.38), 1, '#d8c494'); }
      const pr = hp(0.85, 0.9);
      SP.lantern(c, pr[0], pr[1], Math.max(2, Math.round(pr[2] * 0.08)), Math.max(3, Math.round(pr[2] * 0.15)), true, t, still);
      const bmq = hp(0.45, 0.2), bm = Q.figure({ skin: 3, hair: 'shaved', hairColor: 1, cloth: ['#3a4a6a', '#2e3a54', '#c8b890'], shape: 'tunic', acc: ['headband'], bandCol: '#e8e0cc' }, 'down', 'i0', clamp(bmq[2] * 1.7 / 58, 0.3, 1), DUSK);
      if (bm) { c.drawImage(bm.cv, Math.round(bmq[0] - bm.ax), Math.round(bmq[1] - bm.ay)); R(c, bmq[0] + Math.round(bmq[2] * 0.12), bmq[1] - Math.round(bmq[2] * 1.6), Math.max(1, Math.round(bmq[2] * 0.03)), Math.round(bmq[2] * 2.1), '#8a6a48'); }
      SP.rings(c, bmq[0] + Math.round(bmq[2] * 0.12), Math.round(C.p(0, 0, hz)[1]) + 2, bmq[2] * 0.3, still ? 0.5 : (t % 2400) / 2400, '255,214,170', 2);
      SP.glints(c, 0, C.hy + 2, w, h - C.hy, t, 30, 67, '255,200,140', still);
      // the tally board at the left, filling slip by slip
      const B = boardStatic(G), kb = st.at('boards');
      c.drawImage(B.cv, 0, 0);
      const n = Math.round(B.rows.length * (0.3 + 0.7 * ease(kb)));
      for (let i = 0; i < n; i++) {
        const r = B.rows[i];
        R(c, r.x, r.y - s(2), 1, s(2), '#2a2024');
        SP.slip(c, r.x - s(4), r.y, s(8), s(18), { seed: 900 + i, n: 4 });
      }
      SP.lantern(c, G.bx + G.bw - s(2), B.top + s(16), Math.max(2, s(4)), Math.max(3, s(8)), true, t, still);
    },
    focus(w, h, vb) { const G = geomDusk(w, h, vb), q = G.C.p(0, 1.5, BRIDGES[0]); return { x: Math.round(G.vx - w * 0.22), y: Math.round(Math.max(0, q[1] - G.s(50))), w: Math.round(w * 0.44), h: Math.round(Math.min(vb - 2, G.hz + G.s(40)) - Math.max(0, q[1] - G.s(50))) }; },
  };

  // ==== mb1.dusk · sen: the register at the boards ===========================================================
  function boardsBack(w, h, vb, key, fl) {
    return cached('mb1.boards|' + key + '|' + w + 'x' + h + '|' + vb + '|' + (fl ? fl.join(',') : ''), () => {
      const S = stage(w, h, vb), { s } = S, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      Q.bandsIn(g, 0, 0, w, h, ['#3a2c40', '#4e3446', '#6a3e48', '#8a4e4e'], 0.45);
      const L = SP.layer(w, h), wood = p.mat('#4a3628', { n: 7, at: 3, step: 0.07 });
      // three boards side by side behind, each full of slips
      const bw = Math.round(w / 3.2);
      for (let b = 0; b < 4; b++) SP.planks(L, Math.round(b * bw * 1.05 - bw * 0.3), Math.round(vb * 0.08), bw, h, wood, { vertical: true, board: Math.max(3, s(7)), base: 0.32, seed: 20 + b });
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // the quay's stones at the boards' foot, a little behind whoever stands before them (the boards ran to the
      // frame's bottom, and Sen stood on them once her body was drawn; AR-1)
      if (fl && fl[0] < h) Q.floor(g, w, h, fl[0], { kind: 'flags', col: '#5a5054', eye: fl[1], s, n: 12, cross: 6 });
      for (let b = 0; b < 4; b++) for (let r = 0; r < 5; r++) for (let i = 0; i < 6; i++) {
        const x = Math.round(b * bw * 1.05 - bw * 0.3 + s(6) + i * (bw - s(12)) / 6), y = Math.round(vb * 0.12 + r * s(28));
        if ((b * 31 + r * 7 + i * 3) % 5 === 0 || (fl && y + s(16) > fl[0])) continue;
        SP.slip(g, x, y, s(7), s(16), { seed: b * 100 + r * 10 + i, n: 3 });
      }
      // a dimming over all of it, so the person in front stands out
      g.fillStyle = 'rgba(30,18,30,0.18)'; g.fillRect(0, 0, w, h);
      return { cv };
    });
  }
  // a ledger held open in two hands (ruled lines and brush marks, never letters)
  function register(c, x, y, W, H, skinC, sleeveC, k) {
    R(c, x - Math.round(W / 2), y, W, H, '#5a3a2a');
    R(c, x - Math.round(W / 2) + 1, y + 1, Math.round(W / 2) - 2, H - 2, '#ece4cc');
    R(c, x + 1, y + 1, Math.round(W / 2) - 2, H - 2, '#e4dac0');
    R(c, x, y + 1, 1, H - 2, '#b8ac8e');
    for (let r = 0; r < 5; r++) { R(c, x - Math.round(W / 2) + 3, y + 4 + r * Math.round((H - 8) / 5), Math.round(W / 2) - 6, 1, '#d0c2a0'); R(c, x + 3, y + 4 + r * Math.round((H - 8) / 5), Math.round(W / 2) - 6, 1, '#d0c2a0'); }
    SP.marks(c, x - Math.round(W / 4), y + 4, Math.round(H * 0.55), 4, 1, '#2a2024', 5);
    SP.marks(c, x + Math.round(W / 4), y + 4, Math.round(H * 0.4 * clamp(k, 0.3, 1)), 3, 1, '#2a2024', 6);
    const hl = Q.hand({ size: Math.max(8, Math.round(W * 0.16)), pose: 'grip', side: 'R', angle: -1.25, skin: skinC, sleeve: sleeveC });
    const hr = Q.hand({ size: Math.max(8, Math.round(W * 0.16)), pose: 'grip', side: 'L', angle: 1.9, skin: skinC, sleeve: sleeveC });
    if (hl) c.drawImage(hl.cv, Math.round(x - W / 2 - hl.ax + W * 0.04), Math.round(y + H * 0.75 - hl.ay));
    if (hr) c.drawImage(hr.cv, Math.round(x + W / 2 - hr.ax - W * 0.04), Math.round(y + H * 0.75 - hr.ay));
  }
  const sen = {
    phases: [['register', 700], ['odd', 700]],
    safe: { wide: 'Sen\'s face and the register above the sheet', narrow: 'her face in the upper half', land: 'her face' },
    draw(c, w, h, t, st) {
      const S = stage(w, h, st.vb), { s, lay } = S, narrow = lay === 'narrow';
      // (her body its full length, as everyone's: it was a quarter of the picture's height, so on a desktop her legs were
      // under half as long as anyone else's; AR-2)
      const by0 = Math.round(Math.max(st.vb + s(16), 100)), feet0 = by0 + 200;
      c.drawImage(boardsBack(w, h, st.vb, 'sen', [Math.round(feet0 - 0.22 * (feet0 - (by0 - 60))), by0 - 60]).cv, 0, 0);
      SP.lantern(c, Math.round(w * (narrow ? 0.86 : 0.8)), Math.round(st.vb * 0.06), Math.max(3, s(6)), Math.max(5, s(12)), true, t, st.still);
      const ko = st.at('odd');
      const fr = ko > 0.3 ? { look: [0, 1], head: [0, 1] } : { look: [0, 0] };
      const bx = Math.round(w * (narrow ? 0.5 : 0.42)), by = Math.round(Math.max(st.vb + s(16), 100));
      // the register held open in front of her (she lifts it a little on her first line); her forearms to its two sides
      const kr = ease(st.at('register'));
      const rw = Math.round(clamp(s(64), 40, 90)), rh = Math.round(rw * 0.6), rx = bx + Math.round(s(2)), ry = Math.round(by - s(6) - kr * s(6));
      const b = Q.bust('mb_sen', ko > 0.3 ? 'worry' : 'smile', fr, DUSK_R, false, 200, Q.holdArms(bx, by, [rx - rw / 2 + rw * 0.04, ry + rh * 0.75], [rx + rw / 2 - rw * 0.04, ry + rh * 0.75]));
      if (b) c.drawImage(b.cv, bx - b.ax, by - b.ay);
      register(c, rx, ry, rw, rh, skin('mb_sen'), (look('mb_sen').cloth || ['#2e3a5e'])[0], kr);
    },
    focus(w, h, vb) { const S = stage(w, h, vb), narrow = S.lay === 'narrow'; const x = Math.round(w * (narrow ? 0.5 : 0.42)), y = Math.round(Math.max(vb + S.s(16), 100)); return { x: x - 32, y: y - 92, w: 64, h: Math.min(vb - 2, y - 40) - (y - 92) }; },
  };

  // ==== mb1.dusk · block: Sanpei with the blank woodblock =======================================================
  // the block: pale cherry, its face worn smooth (the ghost of carved lines gone almost flat), the ink in its grain
  function woodblock(c, x, y, W, H) {
    const p = P();
    const art = Q.small('mb1.block|' + W + 'x' + H, () => {
      const L = SP.layer(W + 2, H + Math.round(H * 0.2) + 2), cherry = p.mat('#c89a6a', { n: 7, at: 3, step: 0.07 });
      const side = Math.round(H * 0.2);
      L.rect(0, 0, W, H, cherry, (xx, yy) => clamp(0.66 - xx / W * 0.2 - yy / H * 0.15 + (((Math.round(yy) * 2 + Math.round(xx * 0.3)) % 7) === 0 ? -0.06 : 0), 0.02, 0.999));
      L.rect(0, H, W, side, cherry, 0.3);
      // the ghost of the carving: faint lines nearly gone
      for (let i = 0; i < 4; i++) L.line(Math.round(W * (0.2 + i * 0.18)), Math.round(H * 0.15), Math.round(W * (0.2 + i * 0.18)), Math.round(H * 0.8), cherry, 0.52);
      L.outline();
      return { cv: L.canvas() };
    });
    c.drawImage(art.cv, Math.round(x - W / 2), Math.round(y));
  }
  const block = {
    phases: [['run', 800], ['cry', 600], ['comp', 700]],
    safe: { wide: 'Sanpei\'s face and the block above the sheet', narrow: 'his face and the block in the upper half', land: 'his face' },
    draw(c, w, h, t, st) {
      const S = stage(w, h, st.vb), { s, lay } = S, narrow = lay === 'narrow', still = st.still;
      // the crowd at dusk behind: the people of the Exchange, backlit by the last of the sky, under a string of
      // lanterns — each once, and only those the world has there (Matsu is at home, Sōbē upriver and not yet met;
      // Haru is out looking while Ichi is lost; Sen comes running with the news). sequence_world.mjs checks it.
      const haru = st.test('!mb_ichi_lost|mb_ichi_found'), ichi = st.test('mb_ichi_found');
      const B = cached('mb1.crowd|' + w + 'x' + h + '|' + st.vb + '|' + haru + ichi, () => {
        const cv = mk(w, h), g = cv.getContext('2d');
        g.imageSmoothingEnabled = false;
        Q.bandsIn(g, 0, 0, w, h, ['#3e3462', '#5e406a', '#8a4e66', '#b8645e', '#cf7a5e'], 0.45);
        // the storehouse roofs across the street behind them
        const p = P(), L = SP.layer(w, h), tile = p.mat('#2e3242', { n: 6, at: 3, step: 0.08 }), plaster = p.mat('#9a8e8a', { n: 6, at: 3, step: 0.07 });
        const ry = Math.round(st.vb * 0.3);
        L.rect(0, ry + s(14), w, h, plaster, (x, y) => clamp(0.4 + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999));
        SP.roof(L, -s(4), w + s(4), ry, s(14), tile, { course: Math.max(2, s(4)) });
        const post = p.mat('#3a2a22', { n: 5, at: 2 }), noren = p.mat('#2e3a62', { n: 5, at: 2, step: 0.1 }), base2 = p.mat('#3a3a46', { n: 5, at: 2 });
        // the storehouses' stone plinth, then the street toward us (the plinth ran to the frame's bottom, and the people
        // stood on its face once bodies were drawn; AR-1)
        const yF = Math.round(st.vb * 0.56);
        L.rect(0, Math.round(st.vb * 0.5), w, yF - Math.round(st.vb * 0.5), base2, 0.4);
        for (let x = 0, i = 0; x < w; x += s(64), i++) {
          L.rect(x, ry + s(14), s(5), h, post, (xx) => (xx < x + s(2) ? 0.7 : 0.3));
          if (i % 2 === 0) { L.rect(x + s(14), ry + s(24), s(18), s(16), p.mat('#ffcf86', { n: 4, at: 2 }), 0.8); for (let k2 = 0; k2 < 3; k2++) L.rect(x + s(14) + k2 * s(6), ry + s(18), s(5), s(14), noren, (xx, yy) => clamp(0.6 - (yy - ry) / s(40), 0.05, 0.999)); }
        }
        L.outline();
        g.drawImage(L.canvas(), 0, 0);
        R(g, 0, yF, w, h - yF, '#2a2228');
        Q.floor(g, w, h, yF, { kind: 'flags', col: '#4e4248', eye: Math.round(st.vb * 0.3), s, n: 14, cross: 7 });
        const BACK = { mul: [0.3, 0.26, 0.36], add: [8, 2, 12], rim: { side: 't', col: '#ffb070', k: [0.45, 0.2] } };
        const who = ['mb_take', 'mb_gonta', haru ? 'mb_haru' : null, 'mb_masa', ichi ? 'mb_ichi' : null, 'mb_masu', 'mb_sen'].filter(Boolean);
        const rnd = p.rnd(73);
        who.forEach((id, i) => {
          const row = i % 3, sc = [1, 0.82, 0.66][row] * (0.92 + rnd() * 0.12), dir = ['left', 'right', 'down', 'up'][Math.floor(rnd() * 4)];
          const f = Q.figure(look(id), dir, 'i0', sc, BACK);
          if (!f) return;
          const x = Math.round((i + 0.5) * w / who.length + (rnd() - 0.5) * s(22)), y = Math.round(st.vb * [0.86, 0.72, 0.6][row] + s(row ? 0 : 6));
          g.fillStyle = 'rgba(14,8,20,0.28)'; const sw = Math.round(9 * sc * 1.4); g.fillRect(x - sw, y - 1, sw * 2, Math.max(2, Math.round(3 * sc)));
          g.drawImage(f.cv, x - f.ax, y - f.ay);
        });
        return { cv };
      });
      c.drawImage(B.cv, 0, 0);
      // the string of lanterns across the street
      const ly = Math.round(st.vb * 0.06);
      c.fillStyle = '#2a2024';
      for (let x = 0; x < w; x += 1) c.fillRect(x, ly + Math.round(Math.sin((x / w) * Math.PI * 4) * s(3) + s(3)), 1, 1);
      for (let i = 0; i < 5; i++) { const x = Math.round(w * (0.08 + i * 0.21)); SP.lantern(c, x, ly + Math.round(Math.sin((x / w) * Math.PI * 4) * s(3) + s(5)), Math.max(2, s(4)), Math.max(4, s(8)), true, t, still); }
      // Sanpei runs in from the right and stops; on his cry he lifts the block higher
      const kr = ease(st.at('run')), kc = ease(st.at('cry')), kp = ease(st.at('comp'));
      const bx = Math.round(lerp(w * 1.1, w * (narrow ? 0.5 : 0.46), kr) - kp * s(18)), by = Math.round(Math.max(st.vb + s(18), 104));
      // the block held up in both inky hands (his forearms up to them)
      const BW = Math.round(clamp(s(36), 24, 54)), BH = Math.round(BW * 0.64), lift = Math.round(kc * s(5));
      const yy = by - 20 - lift; // at his chest, below the chin (the portrait's chin sits about 30 px above its foot)
      const b = Q.bust('mp_sanpei', kc > 0.3 ? 'worry' : 'surprise', kc > 0.3 ? { look: [0, -1] } : null, DUSK, false, 200, Q.holdArms(bx, by, [bx - BW / 2 + 2, yy + BH * 0.7], [bx + BW / 2 - 2, yy + BH * 0.7]));
      if (b) c.drawImage(b.cv, bx - b.ax, by - b.ay);
      woodblock(c, bx, yy, BW, BH);
      const sk = skin('mp_sanpei'), ink = ['#3a3440', '#2a2430'];
      const inky = [sk[0], sk[1]];
      const hl = Q.hand({ size: Math.max(7, Math.round(BW * 0.22)), pose: 'grip', side: 'R', angle: -1.4, skin: inky, sleeve: (look('mp_sanpei').cloth || ['#4a5a7a'])[0] });
      const hr = Q.hand({ size: Math.max(7, Math.round(BW * 0.22)), pose: 'grip', side: 'L', angle: 1.75, skin: inky, sleeve: (look('mp_sanpei').cloth || ['#4a5a7a'])[0] });
      if (hl) c.drawImage(hl.cv, Math.round(bx - BW / 2 - hl.ax + 2), Math.round(yy + BH * 0.7 - hl.ay));
      if (hr) c.drawImage(hr.cv, Math.round(bx + BW / 2 - hr.ax - 2), Math.round(yy + BH * 0.7 - hr.ay));
      // ink on his hands: dark blots over the knuckles
      for (const [dx, dy] of [[-BW / 2 + 1, BH * 0.62], [-BW / 2 + 3, BH * 0.78], [BW / 2 - 2, BH * 0.66], [BW / 2 - 4, BH * 0.8]]) R(c, Math.round(bx + dx), Math.round(yy + dy), Math.max(1, s(2)), Math.max(1, s(1.5)), ink[(dx > 0) ? 1 : 0]);
      // your companion turns at the left edge on their line
      const comp = st.cast.comp;
      if (comp && kp > 0) {
        const expr = st.test('comp=mio') || st.test('comp=ren') ? 'surprise' : st.test('comp=suzu') ? 'smirk' : 'think2';
        const cb = Q.bust(comp.id, expr, { look: [1, 0], head: [1, 0] }, DUSK_R, false, 200); // (full length, as Sanpei; AR-2)
        if (cb) c.drawImage(cb.cv, Math.round(lerp(-s(40), w * (narrow ? 0.16 : 0.18), kp) - cb.ax), Math.round(by + s(8) - cb.ay));
      }
    },
    focus(w, h, vb) { const S = stage(w, h, vb), narrow = S.lay === 'narrow'; const x = Math.round(w * (narrow ? 0.5 : 0.46)), y = Math.round(Math.max(vb + S.s(18), 104)); return { x: x - 34, y: y - 92 - S.s(10), w: 68, h: Math.min(vb - 2, y - 30) - (y - 92 - S.s(10)) }; },
  };

  RB.sequence.define('mb1.dusk', {
    title: { en: 'Manybridge at dusk', jp: '{夕暮|ゆうぐ}れ の {八百橋|やおばし}' }, chapter: 'mb1', scene: 'mb.chapter_end',
    shots: { dusk, sen, block },
  });
})();
