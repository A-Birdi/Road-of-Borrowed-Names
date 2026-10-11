/* Creatures C — the roads: Keepers' Road, Lanternfall, Snowbell and the kiln (expansion P16b; the interim creatures
 * given drawings of their own on the kit in 78u_creature_kit.js). They face the party (screen left); the light comes
 * from the upper left; y = 0 is the body's middle.
 *   kr.sandal   the Hundred-Year Sandal: a straw sandal grown old enough to wake (a tsukumogami): one eye, a tongue,
 *               two cord arms and a single leg to hop on
 *   kr.moss     the Moss Lantern: a stone lantern so overgrown it has stood up on feet of moss
 *   kr.shadow   the Teller's Shadow: a storyteller's shadow on the cave wall, kneeling, a fan in its hand
 *   kr.hyakuwa  the Hundredth Tale: the dark in the corner risen over the guttering wicks, no face, only a mouth
 *   lf.mimic    the Notice-Board Mimic: a notice board on its two posts, its papers parting on a mouth of pins
 *   lf.queue    the Queue Spirit: faint figures standing in one line, slips in their hands, waiting
 *   lf.weevil   the Ledger Weevil: a long-snouted weevil whose shell shows the shapes of what it has eaten
 *   sb.bat      the Icicle Bat: a frost-blue bat with icicles along its wings
 *   sb.starling the Starling Wisp: a star flown off the chart in the shape of a small bird
 *   co.shard    the Glass-Shard Wisp: a floating shard of kiln glass with the fire still inside it
 *   co.mole     the Ash Mole: a heaving mound of ash with a pink nose and two broad digging claws
 * Marks on paper, shells and boards are ruled lines and blots, never letters. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const KIT = RB.creatureKit;
  if (!KIT) return;

  // ---- the Hundred-Year Sandal --------------------------------------------------------------------------------
  KIT.define('kr_sandal', {
    spec: { w: 200, h: 220, ox: 100, oy: 116, ms: 140 },
    moves: ['sweep', 'strike'],
    fx: { strike: 'stoneDust', sweep: 'ashDrift' },
    travel: { strike: 0.3, sweep: 0.14 },
    idleOpts: { breath: 0.05, bob: 3 },
    audit: { anatomy: 'a straw sandal standing on its heel: the woven sole for a body, the red cloth thong at its top for a topknot, one large eye, a wide mouth with a long tongue, two straw-cord arms and a single bare leg it hops on', materials: 'straw woven in diagonal rows, frayed at the rim; red cloth thong; a pale eye with a dark pupil; a pink tongue', moves: { strike: 'it hops in and kicks', sweep: 'it spins on its one leg and kicks up the road\'s dust' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const straw = mat('straw', o.col || '#a8885a', { n: 7 }), cloth = mat('thong', '#b03a2e', { n: 5 }), skin = mat('leg', '#c89a78', { n: 5 });
      const eyeM = mat('eye', '#f0ead8', { n: 4, line: false, cols: ['#1a1410', '#4a3020', '#e8e0cc', '#ffffff'] }), mouthM = mat('mouth', '#3a1418', { n: 4, line: false, cols: ['#240a0e', '#5a1a20', '#d07070', '#e89090'] });
      const back = L.like(), body = L.like(), front = L.like(), fx = L.like();
      const hop = Math.max(0, Math.sin(q.ph * Math.PI * 2)) * 6 + q.reach * 8, bx = -q.lean * 14, by = -q.lift - hop + q.squash * 6;
      const tilt = q.tilt + q.lean * 0.25 + q.wing * 0.3;
      body.save().translate(bx, 40 + by).rotate(tilt).translate(-bx, -(40 + by));
      // the sole: a long rounded oval standing on its heel, woven in diagonal rows
      const scx = bx, scy = -6 + by, rx = 30, ry = 54;
      body.ell(scx, scy, rx, ry, straw, (x, y) => {
        const u = (x - scx) / rx, v = (y - scy) / ry, d = u * u + v * v, weave = Math.floor((x + y * 0.6 + 400) / 3.4) % 2, row = Math.floor((y + 400) / 6) % 2;
        let s = 0.5 - u * 0.18 - v * 0.08 + (weave ^ row ? 0.08 : -0.06);
        if (d > 0.82) s -= 0.12;
        return C.clamp(s, 0, 0.999);
      });
      for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2, x = scx + Math.cos(a) * (rx + 1), y = scy + Math.sin(a) * (ry + 1); body.seg(x, y, x + Math.cos(a) * 3, y + Math.sin(a) * 3, 1.2, straw, 0.3); }
      // the thong: a red cloth loop at the toe, its two straps running down the sole's sides
      body.path([[scx - 4, scy - ry + 4, 5], [scx - 2, scy - ry - 8, 4], [scx + 6, scy - ry - 4, 4]], 4, cloth, 0.6);
      for (const sd of [-1, 1]) body.path([[scx - 2, scy - ry + 6, 3.4], [scx + sd * 14, scy - 10, 3], [scx + sd * 22, scy + 14, 2.6]], 3, cloth, sd < 0 ? 0.7 : 0.4);
      // the eye and the mouth with its tongue
      const ex = scx - 6, ey = scy - 18, er = q.eyes === 'wide' ? 11 : 10;
      if (q.eyes === 'shut') body.path([[ex - 9, ey, 2], [ex, ey + 3, 2], [ex + 9, ey, 2]], 2, mouthM, 0);
      else {
        const eh = q.eyes === 'narrow' ? 3 : er * 0.8;
        body.ell(ex, ey, er, eh, eyeM, (x, y) => (y < ey - eh * 0.4 ? 0.62 : 0.75));
        body.ell(ex - 3, ey + 1, Math.min(5, eh), Math.min(5, eh), eyeM, 0);
        body.dot(ex - 5, ey - 2, eyeM, 3);
      }
      const my = scy + 14, mw = 16 + q.open * 4;
      body.fill(scx - mw - 4, my - 4, scx + mw - 4, my + 12, (x, y) => { const u = (x - scx + 4) / mw; return Math.abs(u) <= 1 && y >= my - 2 + u * u * 2 && y <= my + 4 + (1 - u * u) * (6 + q.open * 6); }, mouthM, 0.2);
      body.path([[scx - 6, my + 4, 7], [scx - 10, my + 16 + q.open * 6, 6], [scx - 6, my + 24 + q.open * 8, 5]], 6, mouthM, (x, y) => (x < scx - 9 ? 0.85 : 0.65));
      body.restore();
      // the cord arms
      const sh = [[bx - 26, 4 + by], [bx + 26, 6 + by]];
      for (const [i, [sx, sy]] of sh.entries()) {
        const near = i === 0, ang = near ? Math.PI + 0.5 - q.reach * 0.7 - q.wing * 0.6 : -0.4 + q.wing * 0.4, ax = sx + Math.cos(ang) * 16, ay = sy + Math.sin(ang) * -16 + 12;
        (near ? front : back).path([[sx, sy, 3], [ax, ay, 2.6], [ax + (near ? -6 : 6), ay + 6, 2.2]], 2.6, straw, near ? 0.6 : 0.3);
      }
      // the one leg, under the heel
      const kick = q.reach * 18;
      back.path([[bx + 2, 44 + by, 7], [bx + 6 - kick * 0.6, 62 + by - kick * 0.4, 6], [bx + 2 - kick, 78 + Math.min(0, by) - kick * 0.3, 5]], 6, skin, 0.45);
      back.ell(bx - 4 - kick, 80 + Math.min(0, by) - kick * 0.3, 8, 3, skin, 0.4);
      const out = finish([back, body, front], { shadow: [2, 2] });
      C.rim(out, null, { w: 1 });
      return out.over(fx);
    },
  });

  // ---- the Moss Lantern ---------------------------------------------------------------------------------------
  KIT.define('kr_moss', {
    spec: { w: 220, h: 260, ox: 110, oy: 150, ms: 230 },
    moves: ['chill', 'strike'],
    fx: { strike: 'stoneDust', chill: 'frostDust' },
    travel: { strike: 0.18 },
    idleOpts: { breath: 0.015, bob: 0 },
    audit: { anatomy: 'a stone lantern (tōrō) standing up: the jewel on top, the broad roof hung with moss, the fire box with its window (the light inside is its eye), the shaft and base, and under it two stubby feet of moss', materials: 'grey granite with lit bevels and dark pitting; thick green moss in clumps with lit tips; the fire box\'s light amber, going cold blue as it chills', moves: { strike: 'it rocks back and topples its roof at you', chill: 'its light goes cold and frost breathes from the window' } },
    draw(L, q, o, H, C, act) {
      const { mat, ball, finish } = C;
      const stone = mat('stone', C.mix(o.col || '#6a7a5a', '#8a8a84', 0.6), { n: 7 }), moss = mat('moss', o.col || '#6a7a5a', { n: 6, l: 0.4 });
      const cold = /chill/.test(act || '') ? 1 : 0, warm = true;
      const lightM = mat('light', cold ? '#a8d0e8' : o.core || '#c8b070', { n: 5, l: 0.75, line: false });
      const back = L.like(), body = L.like(), green = L.like(), fx = L.like();
      const tilt = q.tilt + q.lean * 0.22 - q.reach * 0.16, by = -q.lift + q.squash * 4;
      for (const Lr of [body, green]) Lr.save().translate(0, 76).rotate(tilt).translate(0, -76);
      // base, shaft, middle table, fire box, roof, jewel
      C.stone(body, [[-30, 62 + by * 0.3], [30, 62 + by * 0.3], [34, 74], [-34, 74]], stone, { face: 3 });
      C.stone(body, [[-11, 14 + by], [11, 14 + by], [12, 62 + by * 0.3], [-12, 62 + by * 0.3]], stone, { face: 3 });
      C.stone(body, [[-26, 2 + by], [26, 2 + by], [22, 14 + by], [-22, 14 + by]], stone, { face: 3 });
      C.stone(body, [[-20, -34 + by], [20, -34 + by], [20, 2 + by], [-20, 2 + by]], stone, { face: 3 });
      body.rect(-11, -26 + by, 22, 20, stone, 0);
      body.rect(-9, -24 + by, 18, 16, lightM, warm ? Math.min(4, Math.round(1 + q.glow * 1.5)) : 0);
      body.rect(-1, -24 + by, 2, 16, stone, 1);
      C.stone(body, [[-48, -38 + by], [-14, -58 + by], [14, -58 + by], [48, -38 + by], [44, -32 + by], [-44, -32 + by]], stone, { face: 3, bevel: 3 });
      body.ell(0, -64 + by, 8, 8, stone, ball(-3, -67 + by, 8, 8));
      body.ell(0, -72 + by, 4, 5, stone, ball(-1, -74 + by, 4, 5));
      // pitting
      for (let i = 0; i < 26; i++) { const x = (C.hh(i) - 0.5) * 50, y = -40 + C.hh(i + 50) * 110 + by; body.dot(x, y, stone, 1); }
      // the moss: clumps on the roof, hanging fringes, the shaft wrapped, the feet
      const clump = (x, y, r) => green.fill(x - r, y - r, x + r, y + r, (X, Y) => Math.hypot(X - x, (Y - y) * 1.3) < r * (0.75 + C.hh(Math.floor(X * 3 + Y * 7)) * 0.3), moss, (X, Y) => C.clamp(0.5 - (X - x) / (r * 4) - (Y - y) / (r * 3) + (C.hh(Math.floor(X / 2) * 5 + Math.floor(Y / 2)) - 0.5) * 0.2, 0, 0.999));
      for (let i = 0; i < 9; i++) clump(-42 + i * 10.5, -44 + Math.abs(i - 4) * 3 + by, 8 + C.hh(i) * 4);
      for (let i = 0; i < 8; i++) { const x = -44 + i * 12 + C.hh(i + 3) * 4, len = 8 + C.hh(i + 9) * 14 + q.sway; green.path([[x, -34 + by, 3], [x + 1, -34 + len * 0.6 + by, 2.4], [x, -34 + len + by, 1.4]], 2.4, moss, 0.4); }
      for (let i = 0; i < 4; i++) clump(-8 + (i % 2) * 14, 20 + i * 11 + by, 7);
      clump(-26, 4 + by, 8); clump(22, 6 + by, 7);
      for (const [x, s] of [[-18, 1], [18, -1]]) { const step = s > 0 ? q.reach * -6 : 0; green.ell(x + step, 78, 16, 7, moss, ball(x - 4 + step, 75, 16, 7)); }
      const out = finish([back, body, green], { shadow: [2, 2] });
      C.rim(out, null, { w: 1 });
      if (warm) H.glow(fx, 0, -16 + by, 24 + q.glow * 6, 18, cold ? '#a8d0e8' : o.core || '#c8b070', 0.14 * q.glow, 2);
      return out.over(fx);
    },
  });

  // ---- the Teller's Shadow ------------------------------------------------------------------------------------
  KIT.define('kr_shadow', {
    spec: { w: 220, h: 230, ox: 110, oy: 124, ms: 190, bob: (t) => Math.sin(t / 700) * 2 },
    moves: ['lie', 'strike'],
    fx: { strike: 'inkLash', lie: 'pane' },
    travel: { strike: 0.2 },
    idleOpts: { breath: 0.03, bob: 1 },
    audit: { anatomy: 'a storyteller\'s shadow, kneeling as a teller kneels: head and topknot, narrow shoulders, wide sleeves, one hand lifting a folding fan; its edge soft where it leaves the wall; two pale eyes the only thing in it', materials: 'a translucent violet-black, darker at its heart, its edge fraying into the cave wall\'s light; the eyes a dim grey-white', moves: { strike: 'the fan snaps shut and cracks at you', lie: 'it turns its fan and tells it wrong' } },
    draw(L, q, o, H, C) {
      const { mat, ball } = C;
      const shade = mat('shade', o.col || '#3a3440', { n: 5, l: 0.18, alpha: 214, line: false }), edge = mat('edge', o.col || '#3a3440', { n: 4, l: 0.3, alpha: 110, line: false });
      const eyeM = mat('eye', '#c8c4d8', { n: 3, line: false, cols: ['#4a4658', '#a8a4bc', '#e8e4f4'] });
      const sh = L.like(), fx = L.like();
      const lean = q.lean, bx = -lean * 14, by = -q.lift + q.squash * 5;
      const fig = (Lr, M, grow) => {
        // kneeling body: a broad base, the back's curve, the shoulders
        Lr.fill(-60, -10 - grow, 60, 84 + grow, (x, y) => { const u = (y - 10 - by) / 72; if (u < 0 || u > 1) return false; const half = 22 + u * 30 + grow; return Math.abs(x - bx * (1 - u) - 4) < half; }, M, 0.4);
        Lr.ell(bx - 2, -14 + by, 15 + grow, 17 + grow, M, 0.4);
        Lr.ell(bx + 4, -32 + by, 6 + grow, 6 + grow, M, 0.4);
        Lr.ell(bx + 1, 6 + by, 30 + grow, 14 + grow, M, 0.4);
        // the fan hand: up and forward, the fan open (snapping shut in a strike)
        const ang = Math.PI * 0.82 - q.reach * 0.5 + q.wing * 0.3, hx = bx - 22 + Math.cos(ang) * 22, hy = 4 + by - Math.sin(ang) * 26;
        Lr.path([[bx - 18, 4 + by, 12 + grow], [hx, hy, 7 + grow]], 10, M, 0.4);
        const open = C.clamp(1 - q.reach * 1.2, 0.08, 1), fa = -0.5 + (q.tilt || 0);
        for (let i = 0; i <= 6; i++) { const a = fa - Math.PI / 2 - open * 0.9 + (i / 6) * open * 1.8; Lr.seg(hx, hy, hx + Math.cos(a) * (22 + grow), hy + Math.sin(a) * (22 + grow), 3 + grow, M, 0.4); }
      };
      fig(sh, edge, 3);
      fig(sh, shade, 0);
      if (q.eyes !== 'shut') for (const ex of [bx - 9, bx + 1]) { sh.rect(ex, -16 + by, 3, q.eyes === 'narrow' ? 1 : 2, eyeM, q.eyes === 'wide' ? 2 : 1); }
      else for (const ex of [bx - 9, bx + 1]) sh.rect(ex, -15 + by, 3, 1, eyeM, 0);
      return sh.over(fx);
    },
  });

  // ---- the Hundredth Tale (boss) ------------------------------------------------------------------------------
  KIT.define('kr_hyakuwa', {
    spec: { w: 300, h: 296, ox: 150, oy: 180, ms: 210, bob: (t) => Math.sin(t / 900) * 3 },
    moves: ['lie', 'plea', 'heat'],
    fx: { lie: 'pane', plea: 'note', heat: 'kilnStoke' },
    idleOpts: { breath: 0.03, bob: 1 },
    audit: { anatomy: 'the dark in the corner risen: a tall drift of darkness with no face, only a wide mouth that opens on a low ember glow; arms of smoke; at its foot the last wicks of the hundred, guttering in their dishes', materials: 'layered translucent black-violet, darker at the heart, its edges in thin smoke; the mouth\'s ember red; the wick flames small and yellow, the dishes dark clay', moves: { lie: 'its mouth shapes the tale and tells it wrong', plea: 'it leans down and its mouth opens, wanting to be heard', heat: 'the wicks flare all at once' } },
    draw(L, q, o, H, C) {
      const { mat, ball } = C;
      const dark = mat('dark', o.col || '#1e1c26', { n: 5, l: 0.16, alpha: 228, line: false }), smoke = mat('smoke', o.col || '#1e1c26', { n: 4, l: 0.28, alpha: 120, line: false });
      const ember = mat('ember', '#a83a20', { n: 5, l: 0.5, line: false }), clay = mat('clay', '#4a3a30', { n: 5 }), flame = mat('flame', '#f0c860', { n: 5, l: 0.75, line: false });
      const body = L.like(), wicks = L.like(), fx = L.like();
      for (const Lr of [body, wicks, fx]) Lr.scale(0.92, 0.92); // (inside the frame budget's canvas)
      const by = -q.lift + q.squash * 6, bx = -q.lean * 18, sway = Math.sin(q.ph * 6.28) * 4;
      // the drift of darkness: wider at the base, its top leaning toward the party, smoke at every edge
      const shape = (M, grow) => body.fill(-160, -190, 160, 120, (x, y) => { const u = (y + 160 - by) / 260; if (u < 0 || u > 1) return false; const cx = bx * (1 - u) + (1 - u) * (1 - u) * (-28 + sway); const half = 24 + Math.pow(u, 0.7) * 96 + Math.sin(u * 11 + q.ph * 6.28 + x / 30) * 6 + grow; return Math.abs(x - cx) < half; }, M, (x, y) => C.clamp(0.42 - Math.abs(x - bx) / 300 + Math.sin((x - bx) / 13 + Math.sin(y / 34 + q.ph * 6.28) * 1.6) * 0.07 - (x > bx + 30 ? 0.06 : 0), 0, 0.999));
      shape(smoke, 10);
      shape(dark, 0);
      // smoke rising off its top in thin tendrils
      for (let i = 0; i < 5; i++) { const x0 = bx * 0.2 - 40 + sway - 16 + i * 10, pts = []; for (let k = 0; k <= 6; k++) { const u = k / 6; pts.push([x0 + Math.sin(q.ph * 6.28 + i * 1.3 + u * 4) * 6 * u - u * 10, -150 + by - u * (24 + i * 4), 4 - u * 3]); } body.path(pts, 3, smoke, 2); }
      // smoke arms
      for (const sd of [-1, 1]) { const reach = sd < 0 ? q.reach * 30 + q.open * 20 : 0; body.path([[bx + sd * 50, -70 + by, 14], [bx + sd * (78 + reach), -30 + by - reach * 0.5, 10], [bx + sd * (88 + reach), 10 + by, 6]], 10, dark, 0.3); }
      // the mouth: no face above it, only this
      const mx = bx - 24 + sway * 0.5, my = -84 + by, mw = 26 + q.open * 8, mh = 4 + q.open * 18 + (q.eyes === 'wide' ? 4 : 0);
      body.fill(mx - mw, my - 6, mx + mw, my + mh + 4, (x, y) => { const u = (x - mx) / mw; return Math.abs(u) <= 1 && y >= my - (1 - u * u) * 3 && y <= my + (1 - u * u) * mh; }, ember, (x, y) => C.clamp(0.25 + (y - my) / (mh + 6) * 0.5, 0, 0.999));
      // the last wicks, guttering at its foot
      const heat = Math.max(0, q.glow - 1);
      for (let i = 0; i < 7; i++) {
        const x = -110 + i * 36 + (i % 2) * 6, y = 112 - (i % 3) * 3;
        wicks.ell(x, y, 10, 3, clay, (X, Y) => (Y < y ? 0.6 : 0.3));
        const fh = 4 + heat * 12 + Math.abs(Math.sin(q.ph * 12.56 + i * 1.7)) * 3;
        wicks.fill(x - 4, y - fh - 2, x + 4, y, (X, Y) => Math.abs(X - x) < 2.6 * (1 - (y - Y) / (fh + 2)) + 0.6, flame, (X, Y) => (Y < y - fh * 0.5 ? 0.85 : 0.5));
        wicks.dot(x, y - 1, clay, 0);
      }
      const out = body.over(wicks);
      C.outline(wicks);
      H.glow(fx, mx, my + mh * 0.4, mw + 10, 10 + mh * 0.6, '#c84a28', 0.1 + q.open * 0.12, 2);
      if (heat > 0.05) for (let i = 0; i < 7; i++) H.glow(fx, -110 + i * 36 + (i % 2) * 6, 104, 10 + heat * 10, 10 + heat * 10, '#f0c860', 0.12 * heat, 2);
      return out.over(fx);
    },
  });

  // ---- the Notice-Board Mimic ---------------------------------------------------------------------------------
  KIT.define('lf_mimic', {
    spec: { w: 230, h: 250, ox: 116, oy: 140, ms: 180 },
    moves: ['lie', 'plea'],
    fx: { lie: 'paperFlurry', plea: 'note' },
    idleOpts: { breath: 0.02, bob: 1 },
    audit: { anatomy: 'a village notice board walking on its two posts: a small gabled roof, the board crowded with pinned papers, two brass pin-heads for eyes, and a mouth where the papers part on a row of pins', materials: 'weathered planks and posts; paper notices of several sizes, ruled and blotted (never written), curling at their corners; brass pins', moves: { lie: 'its papers shuffle round and settle in the wrong places', plea: 'it leans down, its papers lifting like hands' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const wood = mat('wood', '#7a5e40', { n: 7 }), paper = mat('paper', o.col || '#c8b48a', { n: 5, l: 0.6 }), pin = mat('pin', '#c8a040', { n: 4, l: 0.55 }), ink = mat('ink', '#3a3028', { n: 3, line: false });
      const mouthM = mat('mouth', '#1a1410', { n: 3, line: false });
      const back = L.like(), board = L.like(), papers = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 4 - Math.abs(Math.sin(q.ph * 6.28)) * 2, tilt = q.tilt + q.lean * 0.18 - q.open * 0.12;
      for (const Lr of [board, papers]) Lr.save().translate(0, 80).rotate(tilt).translate(0, -80);
      // the posts (its legs), one stepping
      for (const [x, Lr, st] of [[-34, back, Math.sin(q.ph * 6.28) * 3], [30, back, -Math.sin(q.ph * 6.28) * 3]]) Lr.path([[x, 10 + by, 7], [x + st, 82, 7]], 7, wood, x < 0 ? 0.55 : 0.35);
      // the board and its little roof
      C.stone(board, [[-52, -54 + by], [52, -54 + by], [52, 28 + by], [-52, 28 + by]], wood, { face: 2, bevel: 3 });
      C.fpoly(board, [[-62, -54 + by], [0, -80 + by], [62, -54 + by], [56, -50 + by], [-56, -50 + by]], wood, (x, y) => (x < 0 ? 0.62 : 0.4));
      // the papers: the ones above the mouth and below it; lie shuffles them, plea lifts their corners
      const shuffle = q.ph * (q.eyes === 'narrow' ? 2 : 0.3);
      const sheets = [[-44, -48, 26, 22], [-14, -50, 22, 30], [12, -46, 34, 20], [-46, -2, 30, 24], [-12, 2, 24, 22], [16, -4, 30, 26]];
      sheets.forEach(([x, y, w, h], i) => {
        const dx = Math.round(Math.sin(shuffle * 6.28 + i * 2) * 3), lift = q.open * (i < 3 ? -4 : 4), ang = (C.hh(i) - 0.5) * 0.12 + q.open * (i % 2 ? 0.2 : -0.2);
        papers.save().translate(x + dx + w / 2, y + by + lift).rotate(ang).translate(-(x + dx + w / 2), -(y + by + lift));
        C.fpoly(papers, [[x + dx, y + by + lift], [x + dx + w, y + by + lift], [x + dx + w, y + h + by + lift], [x + dx, y + h + by + lift]], paper, (X, Y) => C.clamp(0.62 - (X - x) / 200 + (Y > y + h + by + lift - 3 && X > x + dx + w - 6 ? -0.2 : 0), 0, 0.999));
        for (let r = 4; r < h - 3; r += 4) papers.line(x + dx + 3, y + by + lift + r, x + dx + w - 4 - ((r * 7) % 9), y + by + lift + r, ink, 1);
        if (i % 2) papers.ell(x + dx + w - 7, y + by + lift + h - 7, 3, 3, mat('seal', '#a83a2a', { n: 3, line: false }), 1);
        papers.dot(x + dx + w / 2, y + by + lift + 2, pin, 3);
        papers.restore();
      });
      // the mouth: a gap between the rows of papers, lined with pins
      const my = -20 + by, mo = 3 + q.open * 8 + (q.eyes === 'wide' ? 3 : 0);
      papers.rect(-48, my, 96, mo, mouthM, 0);
      for (let x = -44; x < 46; x += 7) { papers.seg(x, my, x + 1, my + Math.min(4, mo), 1.4, pin, 3); papers.seg(x + 3, my + mo, x + 4, my + mo - Math.min(4, mo), 1.4, pin, 2); }
      // eyes: two pin-heads above the mouth
      const eyesY = -32 + by;
      for (const ex of [-22, 4]) { if (q.eyes === 'shut') papers.rect(ex - 3, eyesY, 6, 1, ink, 0); else { papers.ell(ex, eyesY, 4, q.eyes === 'narrow' ? 2 : 4, pin, ball(ex - 1, eyesY - 1, 4, 4, { lift: 0.1 })); papers.dot(ex - 1, eyesY - 1, pin, 3); } }
      for (const Lr of [board, papers]) Lr.restore();
      const out = finish([back, board, papers], { shadow: [1, 2] });
      C.rim(out, null, { w: 1 });
      return out.over(fx);
    },
  });

  // ---- the Queue Spirit ---------------------------------------------------------------------------------------
  KIT.define('lf_queue', {
    spec: { w: 300, h: 250, ox: 110, oy: 120, ms: 220, bob: (t) => Math.sin(t / 800) * 2 },
    moves: ['sweep'],
    fx: { sweep: 'mistRoll' },
    travel: { sweep: 0.12 },
    idleOpts: { breath: 0.02, bob: 0 },
    audit: { anatomy: 'faint figures standing in one line, the nearest the tallest and clearest and the ones behind fainter: heads bowed, shoulders, long coats, a numbered slip (a blank slip with a stamp) in each hand; they have no feet, only the floor\'s light through them', materials: 'pale blue-grey translucent, each figure fainter down the line, with a lit edge on the side toward the light; the slips paper-white', moves: { sweep: 'the whole line surges forward together' } },
    draw(L, q, o, H, C) {
      const { mat } = C;
      const col = o.col || '#a8b8c8', paper = mat('slip', '#f0ece0', { n: 3, line: false }), eyeM = mat('eye', '#2a3440', { n: 3, line: false });
      const out = L.like();
      const surge = Math.max(0, q.reach) + Math.max(0, q.lean) * 1.5;
      for (let k = 4; k >= 0; k--) {
        const M = mat('ghost' + k, col, { n: 5, l: 0.55, alpha: Math.round(200 - k * 34), line: false });
        const s = 1.3 - k * 0.12, x = k * 40 - surge * (20 + k * 6), y = -k * 3 + Math.sin(q.ph * 6.28 + k) * 1.5 - q.lift;
        const Lr = out.like();
        Lr.save().translate(x, y).scale(s, s);
        Lr.fill(-26, -20, 26, 74, (X, Y) => { const u = (Y + 8) / 78; if (u < 0 || u > 1) return false; return Math.abs(X - 2) < 13 + u * 10 && (u < 0.82 || ((Math.floor(X / 3) + Math.floor(Y / 2)) % 3) > (u - 0.82) * 14); }, M, (X, Y) => C.clamp(0.5 - X / 60 + (X < -8 ? 0.15 : 0), 0, 0.999));
        Lr.ell(-2, -22, 11, 12, M, (X, Y) => C.clamp(0.55 - X / 40 - Y / 80, 0, 0.999));
        Lr.path([[-10, 6, 6], [-18, 26, 5], [-16, 34, 4]], 5, M, 0.45);
        Lr.rect(-22, 32, 8, 11, paper, 1); Lr.dot(-18, 40, mat('seal', '#a83a2a', { n: 3, line: false }), 1);
        if (k === 0 && q.eyes !== 'shut') for (const ex of [-8, 0]) Lr.rect(ex, -21, 2, q.eyes === 'wide' ? 2 : 1, eyeM, 1);
        Lr.restore();
        out.over(Lr);
      }
      return out;
    },
  });

  // ---- the Ledger Weevil --------------------------------------------------------------------------------------
  KIT.define('lf_weevil', {
    spec: { w: 260, h: 190, ox: 136, oy: 98, ms: 150 },
    moves: ['mend', 'charge', 'strike'],
    fx: { strike: 'clawSnap', charge: 'gather' },
    travel: { strike: 0.3 },
    idleOpts: { breath: 0.025, bob: 1 },
    audit: { anatomy: 'a weevil: a long down-curved snout with elbowed antennae, a small round head, a pear-shaped body under hard wing-cases, six jointed legs; on its back what it has eaten shows as ledger rulings and blots in the shell (marks, never letters)', materials: 'hard lacquered shell in ledger browns with a cream ground showing through in strokes; dark legs; a small bright eye', moves: { strike: 'it drives its snout in like an awl', charge: 'the marks on its back glow and crawl', mend: 'it chews, and its shell knits where it was cracked' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const shell = mat('shell', o.col || '#6a5a3a', { n: 7, l: 0.36 }), mark = mat('mark', o.col2 || '#d8c8a0', { n: 4, l: 0.6, line: false }), legM = mat('leg', C.mix(o.col || '#6a5a3a', '#181418', 0.5), { n: 5 });
      const eyeM = mat('eye', '#1a1a22', { n: 4, line: false, cols: ['#0e0e16', '#3a1e14', '#e8d890', '#ffffff'] });
      const back = L.like(), body = L.like(), front = L.like(), fx = L.like();
      const bx = -q.lean * 18, by = 26 - q.lift + q.squash * 5, GY = 76;
      const leg = (Lr, x, dir, far) => { const hx = bx + x, hy = by + 18, kx = hx + dir * 15, ky = hy - 2, fxx = kx + dir * 8 + q.sway * (far ? -1 : 1); Lr.path([[hx, hy, 4.4], [kx, ky, 3.8]], 4, legM, far ? 0.2 : 0.5); Lr.path([[kx, ky, 3.2], [fxx, GY, 2.4]], 3, legM, far ? 0.18 : 0.42); };
      for (const [x, dir] of [[-20, -1], [4, -0.2], [26, 0.9]]) leg(back, x + 6, dir, true);
      // the body: pear-shaped, the wing-cases' ridges, the marks of eaten characters
      const rx = 52, ry = 30;
      body.fill(bx - rx, by - ry, bx + rx + 6, by + ry, (x, y) => { const u = (x - bx) / rx, w = 1 - 0.25 * Math.max(0, -u); return u * u + ((y - by) / (ry * w)) ** 2 <= 1; }, shell, (x, y) => C.clamp(ball(bx - 16, by - 14, rx, ry)(x, y) + (Math.floor((y - by + 40) / 7) % 2 ? 0.04 : -0.02), 0, 0.999));
      const glow = q.glow > 1.05 ? Math.min(3, 1 + Math.round((q.glow - 1) * 4)) : 1;
      for (let i = 0; i < 9; i++) {
        const cx = bx - 30 + (i % 5) * 16 + (Math.floor(i / 5) ? 8 : 0), cy = by - 14 + Math.floor(i / 5) * 14 + Math.sin(q.ph * 6.28 + i) * (q.glow > 1.05 ? 1 : 0);
        // ledger rulings and blots, eaten into the shell: bars of different lengths and a dot, never a crossed stroke
        const w1 = 4 + Math.floor(C.hh(i + 31) * 6), w2 = 3 + Math.floor(C.hh(i + 37) * 5);
        body.rect(cx - 5, cy - 3, w1, 1.6, mark, glow); body.rect(cx - 5, cy + 1, w2, 1.6, mark, glow);
        if (C.hh(i + 43) > 0.5) body.ell(cx + w1 - 2, cy + 4, 1.6, 1.4, mark, glow);
      }
      // the head and its snout, the elbowed antennae
      const hx = bx - rx - 6, hy = by - 6;
      body.ell(hx, hy, 12, 11, shell, ball(hx - 4, hy - 4, 12, 11, { lift: 0.04 }));
      const ram = q.reach * 14, chew = q.open * 2 + (q.eyes === 'narrow' ? 1 : 0);
      C.tube(body, [[hx - 6, hy + 2, 5], [hx - 22 - ram, hy + 6 + ram * 0.1, 3.6], [hx - 34 - ram, hy + 16, 2.4], [hx - 38 - ram, hy + 24 + chew, 1.6]], shell, { lift: 0.04, gloss: 0.1 });
      for (const sd of [0, 1]) { const ax = hx - 18 - ram * 0.8 - sd * 3, ay = hy + 4; body.path([[ax, ay, 1.4], [ax - 4, ay - 14 - sd * 2, 1.2], [ax - 14 + q.sway, ay - 20 - sd * 3, 1]], 1.4, legM, 0.45); }
      C.eyes(fx, [[hx - 4, hy - 2]], q, eyeM, { r: 2 });
      for (const [x, dir] of [[-20, -1], [4, -0.2], [26, 0.9]]) leg(front, x, dir, false);
      const out = finish([back, body, front], { shadow: [2, 2] });
      C.rim(out, null, { w: 1 });
      if (q.glow > 1.05) H.glow(fx, bx, by - 6, 50, 24, o.col2 || '#d8c8a0', 0.18 * (q.glow - 1), 2);
      return out.over(fx);
    },
  });

  // ---- the Icicle Bat -----------------------------------------------------------------------------------------
  KIT.define('sb_bat', {
    spec: { w: 280, h: 210, ox: 140, oy: 100, ms: 110, bob: (t) => Math.sin(t / 260) * 5 },
    moves: ['chill', 'gust', 'strike'],
    fx: { strike: 'clawSnap', chill: 'frostDust', gust: 'gust' },
    travel: { strike: 0.32 },
    idleOpts: { breath: 0.03, bob: 2, wing: 0.7 },
    audit: { anatomy: 'a bat in flight: a furred body, big pointed ears, a pug face with small fangs, two wings of membrane stretched on long finger bones, icicles hanging from each wing\'s trailing edge; small clawed feet', materials: 'night-blue fur with a frost-white chest and cool rim; dark membrane with lit bones; clear blue-white ice', moves: { strike: 'it dives in, fangs first', gust: 'its wings beat down hard and cold air falls', chill: 'it hangs in the air and breathes frost' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const fur = mat('fur', o.col || '#5a6a8a', { n: 7, l: 0.34 }), mem = mat('mem', C.mix(o.col || '#5a6a8a', '#1a1e2a', 0.45), { n: 5 }), ice = mat('ice', o.col2 || '#d8e8f8', { n: 5, l: 0.7, alpha: 230 });
      const eyeM = mat('eye', '#e0f0ff', { n: 4, line: false, cols: ['#101420', '#4a6aa0', '#c8e0ff', '#ffffff'] }), fang = mat('fang', '#f4f4f0', { n: 3, line: false });
      const back = L.like(), wingL = L.like(), body = L.like(), front = L.like(), fx = L.like();
      const bx = -q.lean * 20 - q.reach * 10, by = -q.lift + q.reach * 8, beat = q.wing;
      // two wings: shoulder, wrist, three finger bones, the membrane between, icicles on the edge
      const wing = (Lr, sd, far) => {
        const up = -beat * 34, sx = bx + sd * 10, sy = by - 6;
        const wx = sx + sd * 46, wy = sy - 24 + up * 0.6;
        const tips = [[wx + sd * 50, wy - 8 + up * 0.5], [wx + sd * 40, wy + 26 + up * 0.3], [wx + sd * 16, wy + 44 + up * 0.15]];
        const pts = [[sx, sy - 4], [wx, wy], tips[0], [C.lerp(tips[0][0], tips[1][0], 0.5) - sd * 6, C.lerp(tips[0][1], tips[1][1], 0.5) + 2], tips[1], [C.lerp(tips[1][0], tips[2][0], 0.5) - sd * 6, C.lerp(tips[1][1], tips[2][1], 0.5) + 2], tips[2], [sx + sd * 4, sy + 20]];
        C.fpoly(Lr, pts, mem, (x, y) => C.clamp((far ? 0.3 : 0.5) - (y - sy) / 160, 0, 0.999));
        Lr.path([[sx, sy - 2, 4], [wx, wy, 3.4]], 3.4, fur, far ? 0.3 : 0.55);
        for (const t of tips) Lr.path([[wx, wy, 2.4], [t[0], t[1], 1.2]], 2, fur, far ? 0.25 : 0.5);
        // icicles along the trailing edge
        for (let i = 0; i < 6; i++) { const k = i / 5, a = i < 3 ? tips[0] : tips[1], b = i < 3 ? tips[1] : tips[2], kk = (i % 3) / 3 + 0.15, x = C.lerp(a[0], b[0], kk), y = C.lerp(a[1], b[1], kk) + 2, len = 7 + C.hh(i + sd * 9) * 10; Lr.fill(x - 3, y, x + 3, y + len, (X, Y) => Math.abs(X - x) < 2.4 * (1 - (Y - y) / len), ice, (X, Y) => (X < x ? 0.8 : 0.5)); void k; }
      };
      wing(back, 1, true);
      wing(wingL, -1, false);
      // body, head, ears, face
      body.ell(bx, by + 6, 15, 19, fur, ball(bx - 5, by, 15, 19));
      body.ell(bx - 3, by + 10, 8, 11, mat('chest', '#c8d4e4', { n: 5 }), ball(bx - 5, by + 6, 8, 11, { lift: 0.1 }));
      const hx = bx - 4, hy = by - 20;
      body.ell(hx, hy, 13, 12, fur, ball(hx - 4, hy - 4, 13, 12));
      for (const sd of [-1, 1]) C.fpoly(body, [[hx + sd * 4, hy - 8], [hx + sd * 14, hy - 30], [hx + sd * 13, hy - 4]], fur, sd < 0 ? 0.6 : 0.35);
      body.ell(hx - 6, hy + 4, 6, 4, fur, 0.62);
      C.eyes(fx, [[hx - 9, hy - 2], [hx + 1, hy - 3]], q, eyeM, { r: 2 });
      const mo = q.open * 3 + (q.reach > 0.5 ? 3 : 0);
      fx.rect(hx - 10, hy + 6, 7, 1 + mo, mat('mouth', '#240a14', { n: 2, line: false }), 0);
      fx.rect(hx - 9, hy + 6, 1, 3 + mo * 0.5, fang, 2); fx.rect(hx - 5, hy + 6, 1, 3 + mo * 0.5, fang, 2);
      for (const sd of [-1, 1]) front.path([[bx + sd * 5, by + 22, 2.6], [bx + sd * 7, by + 30, 2], [bx + sd * 5, by + 33, 1.6]], 2, fur, 0.3);
      const out = finish([back, body, wingL, front], { shadow: [2, 2] });
      C.rim(out, null, { w: 1 });
      return out.over(fx);
    },
  });

  // ---- the Starling Wisp --------------------------------------------------------------------------------------
  KIT.define('sb_starling', {
    spec: { w: 230, h: 200, ox: 116, oy: 100, ms: 100, bob: (t) => Math.sin(t / 300) * 6 },
    moves: ['shroud', 'strike'],
    fx: { strike: 'wispTrail' },
    travel: { strike: 0.34 },
    idleOpts: { breath: 0.04, bob: 2, wing: 0.8 },
    veil: (o) => ({ kind: 'mist', cols: ['#f8f0c8', '#e8d8a0', '#a8a0c0'] }),
    audit: { anatomy: 'a small bird made of starlight: a five-pointed star for its body and heart, a round head with a short beak, two swept wings and a forked tail of light, a trail of sparks behind it', materials: 'pale gold light in stepped rings, brightest at the star\'s heart; the feathers\' edges a cool lilac; sparks in white and gold', moves: { strike: 'it darts in, a streak of light', shroud: 'it shakes out a veil of starlight dust' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const col = o.col || '#f0e0a0', glowM = mat('star', col, { n: 6, l: 0.66 }), feather = mat('feather', C.mix(col, '#c8c0f0', 0.35), { n: 5, l: 0.68 }), spark = mat('spark', '#ffffff', { n: 3, line: false, cols: ['#e8d8a0', '#fff4d0', '#ffffff'] });
      const eyeM = mat('eye', '#2a2440', { n: 3, line: false, cols: ['#1a1428', '#4a3a6a', '#ffffff'] });
      const back = L.like(), body = L.like(), fx = L.like();
      for (const Lr of [back, body, fx]) Lr.scale(1.6, 1.6);
      const bx = -q.lean * 14 - q.reach * 12, by = -q.lift * 0.6 + q.reach * 3, beat = q.wing;
      // the trail behind it
      for (let i = 0; i < 9; i++) { const x = bx + 34 + i * 9 + q.reach * i * 4, y = by + 6 + Math.sin(q.ph * 6.28 + i) * 4 + i * 1.5; fx.dot(x, y, spark, i % 3 ? 1 : 2); if (i % 2) fx.dot(x + 1, y, spark, 0); }
      // wings
      for (const [sd, Lr] of [[1, back], [-1, body]]) { const up = -beat * 26 * (sd > 0 ? 0.8 : 1); C.fpoly(Lr, [[bx + 2, by - 4], [bx + 18 + sd * 4, by - 26 + up], [bx + 40, by - 18 + up * 0.8], [bx + 30, by - 6 + up * 0.3], [bx + 16, by + 2]], feather, (x, y) => C.clamp((sd > 0 ? 0.35 : 0.6) - (x - bx) / 120, 0, 0.999)); }
      // the tail: a forked streak
      for (const sd of [-1, 1]) C.fpoly(back, [[bx + 14, by + 4], [bx + 46, by + 2 + sd * 10], [bx + 40, by + 6 + sd * 4]], feather, 0.4);
      // the star body
      const R1 = 18, R2 = 8, rot = q.ph * 0.6 + q.tilt;
      const star = []; for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + (i / 10) * Math.PI * 2, r = i % 2 ? R2 : R1; star.push([bx + Math.cos(a) * r, by + Math.sin(a) * r]); }
      C.fpoly(body, star, glowM, (x, y) => C.clamp(0.85 - Math.hypot(x - bx, y - by) / 30 - (x - bx + y - by) / 120, 0, 0.999));
      // head and beak
      const hx = bx - 16, hy = by - 10;
      body.ell(hx, hy, 8, 7, glowM, ball(hx - 2, hy - 2, 8, 7, { lift: 0.2 }));
      C.fpoly(body, [[hx - 7, hy - 1], [hx - 15 - q.reach * 3, hy + 1], [hx - 7, hy + 3]], mat('beak', '#d8a040', { n: 4 }), 0.6);
      C.eyes(fx, [[hx - 2, hy - 1]], q, eyeM, { r: 1 });
      const out = finish([back, body], { shadow: [1, 1] });
      H.glow(fx, bx, by, 28 + (q.glow - 1) * 20, 24, col, 0.2 * q.glow, 3);
      return out.over(fx);
    },
  });

  // ---- the Glass-Shard Wisp -----------------------------------------------------------------------------------
  KIT.define('co_shard', {
    spec: { w: 210, h: 220, ox: 106, oy: 108, ms: 120, bob: (t) => Math.sin(t / 380) * 5 },
    moves: ['mirror', 'heat'],
    fx: { mirror: 'pane', heat: 'kilnStoke' },
    idleOpts: { breath: 0.02, bob: 2 },
    audit: { anatomy: 'a long shard of broken glass hanging point-down in the air, turning slowly: three facets, a chipped top edge, the kiln\'s fire still burning inside it, which is its eye', materials: 'sea-green glass, translucent, its facets in three tones with a white specular edge; the fire inside orange to yellow; flecks of ash in the glass', moves: { mirror: 'it turns its face to you and shows your words back to front', heat: 'the fire inside it flares and the glass glows' } },
    draw(L, q, o, H, C) {
      const { mat, finish } = C;
      const col = o.col || '#9ad0c0', glass = mat('glass', col, { n: 6, l: 0.55, alpha: 214 }), edge = mat('edge', '#ffffff', { n: 3, line: false, cols: ['#c8f0e8', '#e8fff8', '#ffffff'] });
      const fire = mat('fire', '#e87830', { n: 5, l: 0.6, line: false, cols: ['#8a2a10', '#c84a18', '#e87830', '#f0b040', '#fff0b0'] });
      const body = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 4, bx = -q.lean * 18, turn = Math.sin(q.ph * 6.28) * 0.3 + q.tilt + (q.eyes === 'wide' ? 0.4 : 0);
      const w = 30 * Math.cos(turn) + 8, top = -64 + by, tip = 70 + by;
      // three facets: the lit left face, the face toward you, the shadowed right
      const A = [bx - w, top + 8], B = [bx - w * 0.2, top - 4], D = [bx + w * 0.9, top + 10], T = [bx + 4 * Math.sin(turn), tip], M = [bx - w * 0.15 + 6 * Math.sin(turn), top + 30];
      C.fpoly(body, [A, B, M, T], glass, 4);
      C.fpoly(body, [B, D, T, M], glass, 2);
      C.fpoly(body, [D, [D[0] - 6, D[1] + 30], T], glass, 1);
      // the chipped top edge, the specular edges
      for (let i = 0; i < 5; i++) { const x = C.lerp(A[0], D[0], i / 5 + 0.08), y = C.lerp(A[1], D[1], i / 5 + 0.08) - 3 + C.hh(i) * 4; body.dot(x, y, glass, 5); }
      body.line(A[0] + 1, A[1] + 1, T[0], T[1] - 2, edge, 2); body.line(B[0], B[1] + 1, M[0], M[1], edge, 1);
      // the fire inside, its eye
      const fy = by - 4, fh = 18 + (q.glow - 1) * 30 + Math.abs(Math.sin(q.ph * 12.56)) * 3, fw = 9 + (q.glow - 1) * 6;
      body.fill(bx - fw - 4, fy - fh, bx + fw, fy + 16, (x, y) => { const u = (y - fy + fh) / (fh + 16); return u >= 0 && u <= 1 && Math.abs(x - bx + 2 + Math.sin(u * 7 + q.ph * 12.56) * 2) < fw * Math.sin(u * Math.PI) ** 0.7; }, fire, (x, y) => C.clamp(0.95 - Math.abs(x - bx) / (fw * 2.2) - Math.abs(y - fy) / 70, 0, 0.999));
      if (q.eyes !== 'shut') { const eh = q.eyes === 'narrow' ? 1 : 3; fx.rect(bx - 4, fy - eh, 6, eh * 2, fire, 4); fx.rect(bx - 2, fy - eh + 1, 2, Math.max(1, eh * 2 - 2), fire, 0); }
      for (let i = 0; i < 6; i++) body.dot(bx - 14 + C.hh(i) * 26, top + 24 + C.hh(i + 7) * 70, mat('ash', '#4a4a4a', { n: 2, line: false }), 0);
      const out = finish([body], { shadow: null });
      H.glow(fx, bx, fy, 30 + (q.glow - 1) * 30, 36, '#e87830', 0.12 + (q.glow - 1) * 0.3, 3);
      return out.over(fx);
    },
  });

  // ---- the Ash Mole -------------------------------------------------------------------------------------------
  KIT.define('co_mole', {
    spec: { w: 260, h: 200, ox: 130, oy: 108, ms: 200 },
    moves: ['charge', 'flood', 'mend'],
    fx: { charge: 'gather', flood: 'ashDrift', mend: 'mendThread' },
    idleOpts: { breath: 0.03, bob: 0 },
    audit: { anatomy: 'a mole mostly under the ash: a heaving mound, out of it the front of its head (the long pink nose with its star of feelers, tiny eyes in the fur) and two broad pink digging hands with claws', materials: 'grey ash in soft heaps with cinders glowing in it; dark grey velvet fur; pink skin on the nose and hands; pale claws', moves: { charge: 'the mound heaves and cinders glow under it', flood: 'it digs and ash pours out over the floor', mend: 'it pats the ash back smooth' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const ash = mat('ash', C.mix(o.col || '#8a8078', '#a8a49c', 0.4), { n: 7 }), fur = mat('fur', '#3a3638', { n: 6, l: 0.3 }), pink = mat('pink', '#d89088', { n: 5 }), claw = mat('claw', '#e8e0d0', { n: 3 });
      const cinder = mat('cinder', o.core || '#d8a070', { n: 4, l: 0.7, line: false });
      const eyeM = mat('eye', '#0e0e10', { n: 3, line: false, cols: ['#0a0a0c', '#2a2a30', '#c8c8d0'] });
      const back = L.like(), head = L.like(), mound = L.like(), front = L.like(), lip = L.like(), fx = L.like();
      const heave = q.squash * 8 + Math.max(0, q.glow - 1) * 10, bx = -q.lean * 14;
      // the head coming out of the ash: fur, then the pink nose with its star
      const hx = bx - 24 - q.reach * 8, hy = 26 - heave * 0.5 - q.lift;
      head.ell(hx + 12, hy + 8, 30, 24, fur, ball(hx + 2, hy - 2, 30, 24));
      C.tube(head, [[hx - 6, hy + 6, 9], [hx - 22, hy + 10, 6], [hx - 30, hy + 12, 4.5]], pink, { lift: 0.06 });
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + q.ph * 1.5, r = 5 + Math.abs(Math.sin(q.ph * 12.56 + i)) * 1.5; head.seg(hx - 32, hy + 12, hx - 32 + Math.cos(a) * r, hy + 12 + Math.sin(a) * r, 1.6, pink, 0.7); }
      C.eyes(fx, [[hx - 4, hy - 2]], q, eyeM, { r: 1 });
      // the hands: broad, palms out, digging
      const dig = q.open + Math.abs(q.puff) * 0.6;
      for (const [sd, Lr] of [[0, front], [1, back]]) {
        const x = hx + 2 + sd * 34, y = hy + 34 - dig * 10 * (sd ? 0.6 : 1) + Math.sin(q.ph * 6.28 + sd) * 2;
        Lr.ell(x, y, 13, 9, pink, ball(x - 4, y - 3, 13, 9));
        for (let k = 0; k < 5; k++) { const cx = x - 11 + k * 5, cy = y - 7 - (k === 2 ? 2 : 0); Lr.path([[cx, cy, 3], [cx - 2, cy - 8 - dig * 3, 1.6]], 2, claw, 1); }
      }
      // the mound of ash round and over it, cinders glowing in it
      const mtop = (x) => 40 - heave - 26 * Math.exp(-(((x - bx - 20) / 70) ** 2)) - 10 * Math.exp(-(((x - bx + 60) / 40) ** 2));
      const ashSh = (x, y) => C.clamp(0.58 - (x - bx) / 380 - (y - mtop(x)) / 110 + (C.hh(Math.floor(x / 7) * 7 + Math.floor(y / 5)) - 0.5) * 0.06, 0, 0.999);
      mound.fill(-130, -40, 130, 84, (x, y) => y >= mtop(x) + Math.sin(x / 7) * 1.5 && y <= 82 && Math.abs(x - bx + 10) < 120 - Math.max(0, 72 - y) * 0.4, ash, ashSh);
      // the ash heaped round its chin and hands, in front of it
      lip.fill(-130, 30, 130, 84, (x, y) => y >= 56 - heave * 0.3 + Math.sin(x / 6) * 2 - 6 * Math.exp(-(((x - hx) / 30) ** 2)) && y <= 82 && Math.abs(x - bx + 10) < 118, ash, ashSh);
      const lit = Math.max(0, q.glow - 1) * 1.6 + 0.2;
      for (let i = 0; i < 12; i++) { const x = bx - 90 + C.hh(i) * 200, y = mtop(x) + 6 + C.hh(i + 20) * 30; if (y < 80 && C.hh(i + 40) < lit) (y > 58 ? lip : mound).rect(x, y, 2, 2, cinder, 2 + (i % 2)); }
      // ash pouring as it floods
      if (q.puff > 0.05) for (let i = 0; i < 6; i++) { const x = hx - 30 - i * 12 - q.puff * 30, y = 70 - C.hh(i) * 10; lip.ell(x, y + 6, 10 + q.puff * 8, 5, ash, 0.5); }
      const out = finish([mound, back, head, front, lip], { shadow: [2, 2] });
      C.rim(out, null, { w: 1 });
      return out.over(fx);
    },
  });
})();
