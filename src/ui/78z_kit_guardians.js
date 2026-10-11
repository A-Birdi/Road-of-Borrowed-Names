/* Creatures C — the old guardians (expansion P15e, drawn in P16b on the kit in 78u_creature_kit.js). They face the
 * party (screen left); the light comes from the upper left. Each canvas stays within the enemy-art cache's frame
 * budget (at most about 300 × 296).
 *   gd.founder        the Founder's Voice: the mill's waterwheel turning by itself, and in its flour the old miller
 *   gd.headoffice     the Head Office: the wall of pigeonholes leaning out, ledgers for a body, stamps for hands
 *   gd.firstfire      the First Fire: a shape of flame taller than the Warden, standing up out of the ash
 *   gd.sisterstar     the Sister Star: a star come down like snow, standing in the dome as a figure of light
 *   gd.maker          the Bell's Maker: a figure in a scorched leather apron with a hammer, beside the Drowned Bell
 *   gd.bridgefounder  the Bridge Founder: a builder of timber and river-stone unfolding, holding a plan
 *   gd.oxelder        the Cloud Ox Elder: the eldest cloud ox, standing, prayer strips on its horns
 *   gd.kettlemother   the Kettle's Mother: the Kettle Below's drawing, larger and older, rising from the steam
 *   gd.firstkeeper    the First Keeper: an old woman of bark and leaf-litter sorting leaves onto shelves no longer there
 * Plans, ledgers and pages carry ruled lines and blots, never letters. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const KIT = RB.creatureKit;
  if (!KIT) return;
  const BOSS = { w: 300, h: 296, ox: 150, oy: 176 };

  // ---- the Founder's Voice ------------------------------------------------------------------------------------
  KIT.define('gd_founder', {
    spec: Object.assign({}, BOSS, { ms: 200 }),
    moves: ['strike', 'mend'],
    fx: { strike: 'stoneDust', mend: 'mendThread' },
    travel: { strike: 0.1 },
    idleOpts: { breath: 0.02, bob: 0 },
    audit: { anatomy: 'the mill\'s waterwheel turning a quarter turn by itself (spokes, rim, paddles dripping), and standing out of its flour the old miller who founded it: a stooped figure with a headband, rolled sleeves, a long flour beard; the voice in the rafters is theirs', materials: 'dark wet timber and iron bands on the wheel; the miller made of drifting flour, cream and translucent, its motes hanging in the air', moves: { strike: 'the wheel lurches round and the miller swings a sack-hook', mend: 'the flour gathers back into the miller\'s shape' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const wood = mat('wood', '#5a4430', { n: 7 }), iron = mat('iron', '#3a3a44', { n: 4 }), wet = mat('wet', '#a8c8d0', { n: 3, alpha: 180, line: false });
      const flour = mat('flour', o.col || '#d8cfa8', { n: 6, lo: 0.5, l: 0.82, hi: 0.97, alpha: 176, line: false }), mote = mat('mote', '#f4f0e0', { n: 2, line: false });
      const wheel = L.like(), out = L.like(), back = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 4, turn = q.ph * 1.57 + q.reach * 0.8 + q.wing * 0.4;
      // the wheel behind, to the right
      const wx = 60, wy = -10, R = 96;
      wheel.fill(wx - R, wy - R, wx + R, wy + R, (x, y) => { const d = Math.hypot(x - wx, y - wy); return d <= R && d >= R - 9; }, wood, (x, y) => C.clamp(0.55 - ((x - wx) * 0.6 + (y - wy) * 0.8) / (R * 2), 0, 0.999));
      wheel.fill(wx - R, wy - R, wx + R, wy + R, (x, y) => { const d = Math.hypot(x - wx, y - wy); return d <= R - 3 && d >= R - 5; }, iron, 2);
      for (let i = 0; i < 8; i++) { const a = turn + (i / 8) * Math.PI * 2; wheel.seg(wx, wy, wx + Math.cos(a) * (R - 6), wy + Math.sin(a) * (R - 6), 5, wood, Math.sin(a) < 0 ? 0.6 : 0.35); }
      for (let i = 0; i < 16; i++) { const a = turn + (i / 16) * Math.PI * 2, x = wx + Math.cos(a) * R, y = wy + Math.sin(a) * R; wheel.save().translate(x, y).rotate(a); wheel.rect(-2, -9, 14, 18, wood, Math.sin(a) < 0 ? 4 : 2); wheel.restore(); if (Math.sin(a) > 0.6) fx.seg(x, y + 6, x - 1, y + 16 + (i % 3) * 4, 1, wet, 1); }
      wheel.ell(wx, wy, 14, 14, wood, ball(wx - 4, wy - 4, 14, 14));
      // the miller in the flour
      const P = C.figure(out, flour, { x: -40 - q.lean * 16, y: 34 + by, h: 1.7, stride: 0.15, lean: 0.3 + q.reach * 0.3, armF: 0.6 + q.reach * 1.1, armB: -0.2, bend: 0.7, opt: { lift: 0.04 } }, back);
      out.fill(P.head[0] - 14, P.head[1] - 6, P.head[0] + 14, P.head[1] - 1, (x, y) => Math.abs(x - P.head[0]) < 13, mat('band', '#c8b890', { n: 3, alpha: 200, line: false }), 1);
      out.fill(P.head[0] - 14, P.head[1] + 4, P.head[0] + 4, P.head[1] + 34, (x, y) => Math.abs(x - P.head[0] + 5) < 8 - (y - P.head[1] - 4) * 0.22, flour, 5);
      const [hx, hy] = P.hands[0];
      out.path([[hx, hy, 2], [hx - 6, hy + 10, 2], [hx - 2, hy + 16, 2]], 2, iron, 2);
      if (q.eyes !== 'shut') fx.rect(P.head[0] - 8, P.head[1] + 1, 3, 1, mat('eye', '#5a4a30', { n: 2, line: false }), 1);
      for (let i = 0; i < 18 + Math.round(q.puff * 12); i++) { const t = (q.ph * 0.5 + C.hh(i)) % 1; fx.dot(-110 + C.hh(i + 3) * 160, -100 + C.hh(i + 7) * 200 - t * 20 + by, mote, 1); }
      const res = finish([wheel], { shadow: null });
      C.outline(back); C.outline(out);
      return res.over(back).over(out).over(fx);
    },
  });

  // ---- the Head Office ----------------------------------------------------------------------------------------
  KIT.define('gd_headoffice', {
    spec: Object.assign({}, BOSS, { ms: 240 }),
    moves: [],
    idleOpts: { breath: 0.015, bob: 0 },
    audit: { anatomy: 'the office\'s back wall of pigeonholes leaning out and becoming a shape: a tall cabinet of cubbies stuffed with papers and ledgers for a body, two arms of jointed drawers ending in rubber stamps, a long drawer that slides open for a mouth, and two green desk lamps for eyes', materials: 'dark varnished wood with lit edges, brass pulls and corner plates; paper bundles tied with string; red and black stamp pads; the lamps\' green glass and light', moves: { strike: 'it brings a stamp down', rest: 'it settles back against the wall' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const wood = mat('wood', o.col || '#2a3a4c', { n: 7, l: 0.32 }), brass = mat('brass', '#c8a050', { n: 4 }), paper = mat('paper', '#e8e0c8', { n: 4 }), ink = mat('ink', '#a83a2a', { n: 3 });
      const lampM = mat('lamp', '#7ab88a', { n: 5, l: 0.6 }), light = mat('light', '#f0f0c0', { n: 3, l: 0.85, line: false }), mouthM = mat('mouth', '#0e0e14', { n: 2, line: false });
      const back = L.like(), body = L.like(), front = L.like(), fx = L.like();
      const lean = 0.08 + q.lean * 0.2 + q.reach * 0.12, by = -q.lift + q.squash * 4;
      body.save().translate(0, 110).rotate(-lean).translate(0, -110);
      // the cabinet and its grid of pigeonholes, papers in them
      C.stone(body, [[-74, -140 + by], [74, -140 + by], [78, 110], [-78, 110]], wood, { face: 3, bevel: 4 });
      for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) {
        const x = -64 + c * 26, y = -128 + r * 24 + by;
        if (r === 3) continue;
        body.rect(x, y, 22, 20, wood, 0);
        const k = C.hh(r * 5 + c);
        if (k > 0.3) { body.rect(x + 2, y + 6, 18, 12, paper, 1 + (k > 0.7 ? 1 : 0)); body.line(x + 4, y + 9, x + 15, y + 9, paper, 0); if (k > 0.8) body.rect(x + 8, y + 6, 1, 12, ink, 1); }
        else if (k > 0.15) { body.rect(x + 3, y + 2, 4, 18, ink, 0); body.rect(x + 8, y + 3, 4, 17, wood, 4); }
      }
      // the long drawer: its mouth
      const mo = 2 + q.open * 14 + (q.eyes === 'wide' ? 4 : 0), my = -128 + 3 * 24 + by;
      body.rect(-66, my, 132, 20, wood, 4);
      body.rect(-66, my + 20 - Math.min(18, mo), 132, Math.min(18, mo), mouthM, 0);
      body.rect(-8, my + 6, 16, 4, brass, 2);
      // the lamp eyes on top
      for (const ex of [-40, 30]) { body.seg(ex, -140 + by, ex - 6, -156 + by, 2, brass, 2); C.fpoly(body, [[ex - 20, -150 + by], [ex + 8, -150 + by], [ex + 2, -166 + by], [ex - 14, -166 + by]], lampM, (x, y) => C.clamp(0.7 - (y + 150 - by) / -40, 0, 0.999)); if (q.eyes !== 'shut') body.rect(ex - 16, -151 + by, 20, q.eyes === 'narrow' ? 1 : 3, light, 2); }
      body.restore();
      // the drawer arms with stamps for hands; the near one comes down in a strike
      const arm = (Lr, sx, sd, k) => {
        const ang = (sd < 0 ? Math.PI + 0.4 : -0.4) + (sd < 0 ? -k : 0), len = 50, ex = sx + Math.cos(ang) * len, ey = -40 + by + Math.sin(-ang) * -len * 0.4 + k * 30;
        for (let i = 0; i < 4; i++) { const u = i / 3, x = C.lerp(sx, ex, u), y = C.lerp(-60 + by, ey, u); C.stone(Lr, [[x - 9, y - 7], [x + 9, y - 7], [x + 9, y + 7], [x - 9, y + 7]], wood, { face: sd < 0 ? 3 : 2 }); Lr.rect(x - 2, y - 1, 4, 2, brass, 2); }
        Lr.rect(ex - 10, ey + 8, 20, 14, wood, sd < 0 ? 4 : 2); Lr.rect(ex - 12, ey + 22, 24, 6, ink, sd < 0 ? 2 : 1);
      };
      arm(back, 60, 1, 0);
      arm(front, -70, -1, q.reach);
      const out = finish([back, body, front], { shadow: [3, 3] });
      C.rim(out, null, { w: 1 });
      for (const ex of [-40, 30]) if (q.eyes !== 'shut') H.glow(fx, ex - 6 - lean * 100, -150 + by, 22, 12, '#e8f0b0', 0.16, 2);
      return out.over(fx);
    },
  });

  // ---- the First Fire -----------------------------------------------------------------------------------------
  KIT.define('gd_firstfire', {
    spec: Object.assign({}, BOSS, { ms: 110, bob: (t) => Math.sin(t / 500) * 3 }),
    moves: ['heat', 'strike', 'plea', 'sweep'],
    fx: { heat: 'kilnStoke', strike: 'kilnBolt', plea: 'note', sweep: 'kilnBreath' },
    travel: { strike: 0.12, sweep: 0.08 },
    idleOpts: { breath: 0.04, bob: 2 },
    audit: { anatomy: 'a shape of flame standing up out of the kiln\'s ash, taller than the Warden: broad shoulders of fire, long arms of flame, a head of white-hot light with two darker eyes, its legs lost in the ash and embers; tongues of flame always leaving it upward', materials: 'stepped fire from deep red at its edges through orange to a white-yellow heart; grey ash and glowing cinders at its feet; sparks', moves: { heat: 'it draws breath and burns white', strike: 'it throws a fist of fire', plea: 'it bends low, its fire gone soft and amber, asking to be remembered', sweep: 'it sweeps a long arm of flame across you' } },
    draw(L, q, o, H, C) {
      const { mat } = C;
      const fire = mat('fire', o.col || '#c4502a', { n: 7, l: 0.5, line: false, cols: ['#5a1408', '#8a2a10', '#c4502a', '#e87830', '#f0a840', '#f8d880', '#fff8e0'] });
      const ash = mat('ash', '#6a6460', { n: 5 }), cinder = mat('cinder', '#f08030', { n: 3, l: 0.6, line: false }), eyeM = mat('eye', '#5a1408', { n: 2, line: false });
      const out = L.like(), fx = L.like();
      const soft = q.open > 0.3 && q.lean > 0 ? 0.2 : 0, heat = Math.max(0, q.glow - 1), by = -q.lift + q.squash * 6, bx = -q.lean * 16;
      const flick = (x, y) => Math.sin(y / 6 + q.ph * 12.56 + x / 9) * 3 + Math.sin(y / 13 - q.ph * 6.28) * 2;
      const tone = (x, y, cx, r) => C.clamp(0.95 + heat * 0.1 - soft - Math.hypot(x - cx, (y - (-40 + by)) * 0.6) / (r * 1.6), 0, 0.999);
      // body: a tall flame shape, shoulders wide, rising tongues
      out.fill(-120, -150, 120, 110, (x, y) => { const u = (y + 130 - by) / 230; if (u < 0 || u > 1) return false; const half = (u < 0.3 ? 20 + u * 140 : 62 - (u - 0.3) * 30) + flick(x, y); return Math.abs(x - bx * (1 - u)) < half; }, fire, (x, y) => tone(x, y, bx, 70));
      for (let i = 0; i < 6; i++) { const x0 = bx - 50 + i * 20, top = -150 + by - C.hh(i) * 30 - Math.abs(Math.sin(q.ph * 12.56 + i)) * 12; out.fill(x0 - 10, top, x0 + 10, -90 + by, (x, y) => Math.abs(x - x0 - Math.sin(y / 7 + q.ph * 12.56 + i) * 3) < (y - top) * 0.18, fire, (x, y) => tone(x, y, bx, 70) - 0.2); }
      // head
      out.ell(bx - 4, -112 + by, 22, 24, fire, (x, y) => C.clamp(0.98 - soft - Math.hypot(x - bx + 6, y + 116 - by) / 40, 0, 0.999));
      if (q.eyes !== 'shut') for (const ex of [bx - 14, bx + 2]) out.ell(ex, -114 + by, 4, q.eyes === 'narrow' ? 1 : 3, eyeM, 1);
      // arms of flame
      const arm = (sd, k, sw) => { const sx = bx + sd * 50, sy = -78 + by, a = (sd < 0 ? Math.PI : 0) + sd * (0.9 - k) - sw, len = 70 + k * 40; const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([sx + Math.cos(a) * len * u + Math.sin(u * 6 + q.ph * 12.56) * 4, sy + Math.sin(a) * -len * u * -1 + u * u * 20, 14 - u * 8]); } C.tube(out, pts, fire, { lift: -0.12 - soft }); for (let k = 2; k < pts.length; k += 2) { const [x, y, r] = pts[k], h2 = r * 1.4 + Math.abs(Math.sin(q.ph * 12.56 + k)) * 4; out.fill(x - r, y - r - h2, x + r, y, (X, Y) => Math.abs(X - x - Math.sin(Y / 4 + k) * 1.5) < r * 0.7 * (1 - (y - r - Y) / h2 * -1) && Y > y - r - h2, fire, 0.55); } };
      arm(1, 0.1, 0);
      arm(-1, q.reach + Math.abs(q.wing) * 0.8, q.wing * 0.6);
      // ash and cinders at its feet
      out.fill(-140, 80, 140, 112, (x, y) => ((x - bx * 0.2) / 130) ** 2 + ((y - 100) / 12) ** 2 <= 1 && y > 92 + Math.sin(x / 5) * 1.5, ash, (x, y) => C.clamp(0.5 - x / 400 + (C.hh(Math.floor(x / 4) * 3 + Math.floor(y / 3)) - 0.5) * 0.1, 0, 0.999));
      for (let i = 0; i < 14; i++) fx.rect(-120 + C.hh(i) * 240, 92 + C.hh(i + 5) * 14, 2, 2, cinder, 1 + (i % 2));
      for (let i = 0; i < 12; i++) { const t = (q.ph + C.hh(i + 20)) % 1; fx.dot(bx - 60 + C.hh(i + 30) * 120, -60 - t * 110 + by, cinder, 2); }
      C.outline(out);
      H.glow(fx, bx, -50 + by, 90 + heat * 30, 110, '#f08030', 0.1 + heat * 0.12 - soft * 0.2, 3);
      return out.over(fx);
    },
  });

  // ---- the Sister Star ----------------------------------------------------------------------------------------
  KIT.define('gd_sisterstar', {
    spec: Object.assign({}, BOSS, { ms: 150, bob: (t) => Math.sin(t / 900) * 4 }),
    moves: ['shroud', 'strike', 'plea', 'chill'],
    fx: { strike: 'wispTrail', plea: 'note', chill: 'frostDust' },
    travel: { strike: 0.14 },
    idleOpts: { breath: 0.03, bob: 1 },
    veil: (o) => ({ kind: 'mist', cols: ['#f4f2ff', '#dcdcf8', '#a8a8d0'] }),
    audit: { anatomy: 'a star come down slowly, as snow does, and standing: a tall slender woman\'s shape of light in a long robe that pools on the floor, a star at her heart with long points, her hair a fall of light, her hands open; a halo of fine rays round her', materials: 'cold white-violet light in stepped bands, brightest at the star, the robe\'s folds pale lilac; snowlike motes falling round her', moves: { shroud: 'starlight spills from her robe in a veil', strike: 'a ray of her light strikes', plea: 'she holds out her hands, asking who lit the lamp that called her', chill: 'the cold of the high sky falls from her' } },
    draw(L, q, o, H, C) {
      const { mat } = C;
      const col = o.col || '#e8eaff', light = mat('light', col, { n: 7, lo: 0.4, l: 0.8, hi: 0.99, alpha: 214, line: false }), robe = mat('robe', C.mix(col, '#a8a0e0', 0.35), { n: 6, lo: 0.36, l: 0.72, hi: 0.95, alpha: 196, line: false });
      const star = mat('star', '#ffffff', { n: 3, line: false, cols: ['#e8e8ff', '#f8f8ff', '#ffffff'] }), mote = mat('mote', '#ffffff', { n: 2, line: false });
      const out = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 4, bx = -q.lean * 12, offer = q.open + q.reach * 0.5;
      // the robe pooling on the floor
      out.fill(-110, -90, 110, 110, (x, y) => { const u = (y + 80 - by) / 186; if (u < 0 || u > 1) return false; return Math.abs(x - bx * (1 - u)) < 18 + u * u * 70 + Math.sin(u * 8 + x / 14 + q.ph * 6.28) * 2; }, robe, (x, y) => C.clamp(0.6 - (x - bx) / 160 + (Math.sin((x - bx) / 7) > 0.7 ? 0.12 : 0), 0, 0.999));
      // shoulders, head, the fall of hair
      out.ell(bx, -86 + by, 22, 10, robe, 0.6);
      out.ell(bx - 2, -112 + by, 12, 15, light, (x, y) => C.clamp(0.85 - (x - bx) / 50, 0, 0.999));
      out.fill(bx - 14, -126 + by, bx + 20, -40 + by, (x, y) => x > bx + 2 && x < bx + 14 + (y + 120 - by) * 0.08 && Math.abs(x - bx - 8) < 9, light, 0.62);
      // the arms, open (reaching out as she pleads)
      for (const sd of [-1, 1]) { const ex = bx + sd * (30 + offer * (sd < 0 ? 30 : 6)), ey = -40 + by - offer * (sd < 0 ? 20 : 4); C.tube(out, [[bx + sd * 16, -84 + by, 5], [bx + sd * 24, -62 + by, 4], [ex, ey, 3.4]], light, { lift: 0.06 }); }
      // the star at her heart, its points long
      const sx = bx, sy = -64 + by, R1 = 22 + Math.max(0, q.glow - 1) * 14, rot = q.ph * 0.4;
      const pts = []; for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + (i / 10) * Math.PI * 2, r = i % 2 ? 6 : R1; pts.push([sx + Math.cos(a) * r, sy + Math.sin(a) * r]); }
      C.fpoly(out, pts, star, (x, y) => C.clamp(1 - Math.hypot(x - sx, y - sy) / (R1 * 1.6), 0, 0.999));
      // the halo's rays and the falling motes
      for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + q.ph * 0.3, r0 = 34, r1 = 34 + (i % 2 ? 12 : 22); fx.line(bx - 2 + Math.cos(a) * r0, -112 + by + Math.sin(a) * r0, bx - 2 + Math.cos(a) * r1, -112 + by + Math.sin(a) * r1, mote, i % 2 ? 0 : 1); }
      if (q.eyes !== 'shut') for (const ex of [bx - 8, bx]) fx.dot(ex, -112 + by, mat('eye', '#6a6aa8', { n: 2, line: false }), 1);
      for (let i = 0; i < 20; i++) { const t = (q.ph * 0.4 + C.hh(i)) % 1; fx.dot(-120 + C.hh(i + 4) * 240, -140 + t * 250, mote, 1); }
      H.glow(fx, sx, sy, 44 + Math.max(0, q.glow - 1) * 30, 44, '#e8eaff', 0.16, 3);
      return out.over(fx);
    },
  });

  // ---- the Bell's Maker ---------------------------------------------------------------------------------------
  KIT.define('gd_maker', {
    spec: Object.assign({}, BOSS, { ms: 220 }),
    moves: [],
    idleOpts: { breath: 0.02, bob: 0 },
    audit: { anatomy: 'a figure in a scorched leather apron walking round the Drowned Bell, tapping it with a hammer and listening: broad shoulders, sleeves bound back, a cloth tied over the hair, the hammer in one hand and the other spread on the bell; the bell beside them, green with the river, larger than they are', materials: 'warm skin and dark leather, scorch marks on the apron; bronze bell gone verdigris green, with a lit lip and dark mouth; a faint ring of sound off the bell when it is struck', moves: { strike: 'they bring the hammer down on the bell', rest: 'they lay a hand on the bell and listen' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const skin = mat('skin', '#b88a68', { n: 6 }), leather = mat('leather', o.col || '#6a5a3a', { n: 6 }), cloth = mat('cloth', '#5a6a7a', { n: 5 }), bronze = mat('bronze', '#4a8a78', { n: 7 });
      const iron = mat('iron', '#3a3a44', { n: 4 }), ring = mat('ring', '#f0f4e8', { n: 2, alpha: 160, line: false }), scorch = mat('scorch', '#2a2018', { n: 3, line: false });
      const back = L.like(), bell = L.like(), out = L.like(), front = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 4;
      // the bell, to the right
      const bxl = 70, top = -90;
      bell.fill(bxl - 74, top - 10, bxl + 74, 100, (x, y) => { const u = (y - top) / 190; if (u < 0 || u > 1) return false; const half = 26 + Math.pow(u, 1.6) * 44 + (u > 0.92 ? 6 : 0); return Math.abs(x - bxl) < half; }, bronze, (x, y) => { const u = (y - top) / 190, nx = (x - bxl) / (26 + Math.pow(u, 1.6) * 44); return C.clamp(0.5 - nx * 0.35 + (Math.abs(nx) < 0.2 ? 0.1 : 0) + ((Math.floor(y) % 34) < 2 ? -0.15 : 0) + (C.hh(Math.floor(x / 5) + Math.floor(y / 5) * 9) - 0.5) * 0.06, 0, 0.999); });
      bell.ell(bxl, top - 4, 16, 8, bronze, 0.5); bell.rect(bxl - 6, top - 20, 12, 16, bronze, 2);
      bell.ell(bxl, 98, 74, 6, bronze, 0.1);
      // the maker: standing at the bell's left side, hammer raised
      const strike = q.reach;
      const P = C.figure(out, skin, { x: -46 - q.lean * 10, y: 30 + by, h: 1.7, stride: 0.2, lean: 0.05 + strike * 0.2, armF: -0.3, armB: 2.4 - strike * 1.6, bend: -0.4 + strike * 0.6 }, back);
      // the apron, the head cloth, scorch marks
      out.fill(-80, -30 + by, -10, 70 + by, (x, y) => { const u = (y - (-24 + by)) / 90; return u >= 0 && u <= 1 && Math.abs(x - (-46 - q.lean * 10)) < 15 + u * 6; }, leather, (x, y) => C.clamp(0.55 - (x + 46) / 70, 0, 0.999));
      for (let i = 0; i < 5; i++) out.ell(-58 + C.hh(i) * 22, -10 + C.hh(i + 3) * 70 + by, 3 + C.hh(i + 6) * 3, 2, scorch, 1);
      out.ell(P.head[0] + 2, P.head[1] - 6, 14, 7, cloth, 0.6);
      const [hx, hy] = P.hands[1];
      front.seg(hx, hy, hx + 22, hy - 6 + strike * 18, 3, iron, 1);
      front.rect(hx + 18, hy - 14 + strike * 18, 10, 16, iron, 2);
      if (q.eyes !== 'shut') fx.rect(P.head[0] - 6, P.head[1] + 1, 3, 1, mat('eye', '#2a2018', { n: 2, line: false }), 0);
      if (strike > 0.7) for (let k = 0; k < 3; k++) for (let a = -0.8; a < 0.8; a += 0.1) fx.dot(bxl + Math.cos(a) * (60 + k * 14), 10 + Math.sin(a) * (60 + k * 14), ring, 1);
      const res = finish([back, bell, out, front], { shadow: [2, 2] });
      C.rim(res, null, { w: 1 });
      return res.over(fx);
    },
  });

  // ---- the Bridge Founder -------------------------------------------------------------------------------------
  KIT.define('gd_bridgefounder', {
    spec: Object.assign({}, BOSS, { ms: 230 }),
    moves: [],
    idleOpts: { breath: 0.02, bob: 0 },
    audit: { anatomy: 'a builder made of timber and river-stone unfolding under the first bridge: a chest and hips of stacked river-stones, limbs of jointed timber pinned with iron, a head like a pile cap with a carpenter\'s band, holding open a long plan of the bridge (ruled lines, never letters)', materials: 'wet grey-brown river-stone with lit bevels; dark oak with iron pins; the plan\'s paper pale with blue-grey lines', moves: { strike: 'it swings a beam-arm down', rest: 'it holds out the plan and waits for you to read it' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const stone = mat('stone', o.col || '#7a6a50', { n: 7 }), wood = mat('wood', '#5a4430', { n: 7 }), iron = mat('iron', '#3a3a44', { n: 4 }), paper = mat('paper', '#ece4d0', { n: 4 }), rule = mat('rule', '#5a6a8a', { n: 2, line: false });
      const glowM = mat('glow', o.core || '#e0c890', { n: 3, l: 0.8, line: false });
      const back = L.like(), body = L.like(), front = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 6, bx = -q.lean * 12;
      // legs of timber
      for (const [sd, Lr] of [[-1, body], [1, back]]) { Lr.path([[bx + sd * 16, 30 + by, 9], [bx + sd * 20, 66 + by * 0.5, 8], [bx + sd * 18, 100, 8]], 8, wood, sd < 0 ? 0.55 : 0.3); Lr.rect(bx + sd * 18 - 10, 98, 22, 6, stone, 2); Lr.dot(bx + sd * 20, 66 + by * 0.5, iron, 2); }
      // the body of stacked stones
      const S = [[0, 28, 22, 14], [-2, 6, 30, 14], [2, -18, 36, 16], [0, -44, 40, 16]];
      S.forEach(([dx, y, w, h]) => C.stone(body, [[bx + dx - w, y - h + by], [bx + dx + w, y - h + by], [bx + dx + w + 2, y + h + by], [bx + dx - w - 2, y + h + by]], stone, { face: 3, bevel: 3 }));
      body.ell(bx, -10 + by, 8, 8, glowM, Math.min(2, Math.round(q.glow)));
      // the head: a pile cap with a band
      C.stone(body, [[bx - 18, -100 + by], [bx + 18, -100 + by], [bx + 16, -62 + by], [bx - 16, -62 + by]], wood, { face: 3, bevel: 3 });
      body.rect(bx - 19, -92 + by, 38, 5, mat('band', '#c8b890', { n: 3 }), 1);
      if (q.eyes !== 'shut') for (const ex of [bx - 10, bx + 2]) body.rect(ex, -80 + by, 5, q.eyes === 'narrow' ? 1 : 2, glowM, 2);
      // the arms of timber holding the plan open in front
      const py = -24 + by + q.reach * -10, px = bx - 76 - q.reach * 10;
      for (const [sx, Lr] of [[bx - 36, front], [bx + 36, back]]) Lr.path([[sx, -54 + by, 8], [(sx + px + 40) / 2, -40 + by, 7], [sx < bx ? px : px + 90, py, 6]], 7, wood, sx < bx ? 0.55 : 0.3);
      front.save().translate(px + 45, py).rotate(-0.12 + q.tilt);
      C.fpoly(front, [[-52, -26], [50, -30], [52, 22], [-50, 26]], paper, (x, y) => C.clamp(0.7 - x / 260 - y / 200, 0, 0.999));
      for (let k = -2; k <= 2; k++) front.line(-44, k * 9, 44, k * 9 - 2, rule, 1);
      front.line(-30, 14, 30, 14, rule, 0);
      for (const x of [-30, 0, 30]) front.line(x, 14, x, -14, rule, 0);
      front.fill(-32, -18, 32, 14, (x, y) => Math.abs(Math.hypot(x / 32, (y - 14) / 30) - 1) < 0.05 && y < 14, rule, 0);
      front.ell(-56, -2, 6, 28, paper, 0.4); front.ell(54, -4, 6, 28, paper, 0.4);
      front.restore();
      const out = finish([back, body, front], { shadow: [2, 3] });
      C.rim(out, null, { w: 1 });
      return out.over(fx);
    },
  });

  // ---- the Cloud Ox Elder -------------------------------------------------------------------------------------
  KIT.define('gd_oxelder', {
    spec: Object.assign({}, BOSS, { ms: 260 }),
    moves: ['strike', 'lie', 'sweep'],
    fx: { strike: 'stoneDust', lie: 'paperCut', sweep: 'mistRoll' },
    travel: { strike: 0.1, sweep: 0.08 },
    idleOpts: { breath: 0.025, bob: 0 },
    audit: { anatomy: 'the eldest of the cloud oxen, older than the road: the Cloud Ox\'s drawing standing and heavier, a mane of older cloud over its shoulders, and travellers\' prayer strips (white zigzag paper on cords) tied to its horns', materials: 'cloud white with lilac-grey folds and a lit top; horn grey; the prayer strips paper-white with red cord', moves: { strike: 'it lowers its horns and charges', lie: 'it shakes its prayer strips and they say the wrong thing', sweep: 'it swings its great head through the fog' } },
    draw(L, q, o, H, C, act, i) {
      const base = KIT.DEFS.cr_ox.draw(L.like(), Object.assign({}, q, { lift: q.lift + 10 }), Object.assign({}, o, { col: o.col || '#f0f2f4' }), H, C, act, i);
      const { mat } = C;
      const paper = mat('strip', '#ffffff', { n: 3, line: false, cols: ['#c8c4bc', '#ece8e0', '#ffffff'] }), cord = mat('cord', '#c84a3a', { n: 3 }), cloud = mat('mane', o.col || '#f0f2f4', { n: 6, lo: 0.5, l: 0.82, hi: 0.98, cool: 260 });
      const top = L.like();
      // an older mane of cloud over the shoulders
      for (let k = 0; k < 6; k++) top.ell(-70 + k * 14, -18 - Math.sin(k) * 6 - q.lift, 16, 12, cloud, C.ball(-74 + k * 14, -22 - q.lift, 16, 12, { lift: 0.08 }));
      // prayer strips hanging from the horns (zigzag shide)
      const sw = q.wing * 0.4 + q.reach * 0.25, hx = -102 - q.reach * 10, hy = 18 - q.lift - 10 + sw * 20;
      for (const [dx, dy] of [[4, -38], [18, -42]]) {
        const x0 = hx + dx, y0 = hy + dy;
        top.line(x0, y0, x0 + 2, y0 + 6, cord, 1);
        for (let z = 0; z < 4; z++) { const zx = x0 + (z % 2 ? 4 : -2) + Math.sin(q.ph * 6.28 + z) * 1.5, zy = y0 + 6 + z * 7; top.rect(zx - 3, zy, 7, 6, paper, z % 2 ? 1 : 2); }
      }
      C.outline(top);
      return base.over(top);
    },
  });

  // ---- the Kettle's Mother ------------------------------------------------------------------------------------
  KIT.define('gd_kettlemother', {
    spec: Object.assign({}, BOSS, { ms: 170 }),
    moves: ['flood', 'charge', 'plea', 'strike'],
    fx: { flood: 'tideWash', charge: 'kilnStoke', plea: 'note', strike: 'stoneDust' },
    travel: { strike: 0.08 },
    idleOpts: { breath: 0.03, bob: 0, puff: 0.5 },
    audit: { anatomy: 'the Kettle Below\'s drawing, larger and older, rising out of the pool\'s steam: the same iron kettle with its arched handle, its spout and its lid, paler and furred with old scale, with more steam always round her, two calm eyes under the lid', materials: 'old grey cast iron, mineral-white scale in its hailstone pattern; the pool milky; the steam heavy and white', moves: { flood: 'the pool boils up and over', charge: 'she rattles her lid and the steam roars', plea: 'she lowers herself and her lid lifts gently: let it sleep', strike: 'she rocks forward onto you' } },
    draw(L, q, o, H, C, act) {
      return KIT.kettle(L, q, Object.assign({}, o, { mother: true, col: o.col || '#5a5258' }), H, C, act);
    },
  });

  // ---- the First Keeper ---------------------------------------------------------------------------------------
  KIT.define('gd_firstkeeper', {
    spec: Object.assign({}, BOSS, { ms: 230 }),
    moves: ['mend', 'strike'],
    fx: { mend: 'mendThread', strike: 'paperCut' },
    travel: { strike: 0.12 },
    idleOpts: { breath: 0.02, bob: 0 },
    audit: { anatomy: 'an old woman made of bark and leaf-litter, stooped, sorting leaves onto shelves that are no longer there: a bark body and long bark arms, a face like a knot in the wood with two small bright eyes, hair of dry leaves and moss, leaves in her hands; the shelves she reaches for drawn only as faint lines of light', materials: 'grey-brown bark in ridges with lit edges; green and brown leaves; moss; the absent shelves a faint green-gold line', moves: { mend: 'she sets a leaf on a shelf that is not there, and the shelf is a little more there', strike: 'she flicks a sharp leaf at you' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const col = o.col || '#4a7a4a', bark = mat('bark', '#6a5a48', { n: 7 }), leaf = mat('leaf', col, { n: 6 }), dry = mat('dry', '#a8884a', { n: 5 }), ghost = mat('shelf', '#c8e0a0', { n: 3, alpha: 150, line: false });
      const eyeM = mat('eye', '#f0e8a0', { n: 3, line: false, cols: ['#1a1408', '#a89040', '#fff8c0'] });
      const back = L.like(), body = L.like(), front = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 6, bx = -q.lean * 12 + 10;
      // the shelves that are no longer there
      for (let k = 0; k < 4; k++) { const y = -90 + k * 40; fx.line(-140, y, -60, y + 2, ghost, k === 1 && q.open > 0.3 ? 2 : 1); fx.line(-140, y, -140, y + 40, ghost, 0); }
      // the stooped body of bark, ridged
      const ridge = (x, y) => (Math.floor((x + Math.sin(y / 9) * 3 + 400) / 5) % 2 ? 0.06 : -0.06);
      body.fill(bx - 40, -70 + by, bx + 40, 104, (x, y) => { const u = (y - (-64 + by)) / (104 - (-64 + by)); return u >= 0 && u <= 1 && Math.abs(x - bx - (1 - u) * -16) < 16 + u * 22; }, bark, (x, y) => C.clamp(0.5 - (x - bx) / 120 + ridge(x, y), 0, 0.999));
      // head, bent forward, a knot of a face; leaf hair
      const hx = bx - 26, hy = -78 + by;
      body.ell(hx, hy, 18, 20, bark, (x, y) => C.clamp(ball(hx - 6, hy - 6, 18, 20)(x, y) + ridge(x, y) * 0.5, 0, 0.999));
      body.ell(hx - 6, hy + 4, 7, 6, bark, 0.2);
      for (let k = 0; k < 14; k++) { const a = Math.PI * (0.9 + (k / 13) * 1.2), x = hx + Math.cos(a) * 18 + 6, y = hy + Math.sin(a) * 16 - 4; body.save().translate(x, y).rotate(a); body.fill(-6, -3, 6, 3, (X, Y) => (X / 6) ** 2 + (Y / 3) ** 2 <= 1, k % 3 ? dry : leaf, 0.55); body.restore(); }
      C.eyes(fx, [[hx - 10, hy - 2], [hx - 1, hy - 3]], q, eyeM, { r: 1 });
      // arms: the near one reaching up to a shelf with a leaf (or flicking one out)
      const reach = q.open + q.reach;
      const ex = hx - 40 - reach * 20, ey = -70 + by - reach * 30;
      C.tube(front, [[bx - 14, -48 + by, 6], [bx - 40, -40 + by, 5], [ex, ey, 4]], bark, { lift: 0.02 });
      front.save().translate(ex - 4, ey - 4).rotate(-0.8 + q.reach); front.fill(-8, -4, 8, 4, (X, Y) => (X / 8) ** 2 + (Y / 4) ** 2 <= 1, leaf, 0.65); front.line(-6, 0, 6, 0, leaf, 1); front.restore();
      C.tube(back, [[bx + 14, -46 + by, 6], [bx + 26, -10 + by, 5], [bx + 14, 20 + by, 4]], bark, { lift: -0.14 });
      for (let k = 0; k < 4; k++) back.ell(bx + 12 + k * 3, 24 + by + k * 2, 5, 3, k % 2 ? leaf : dry, 0.5);
      // leaf litter round her feet
      for (let k = 0; k < 16; k++) front.ell(bx - 50 + C.hh(k) * 100, 100 + C.hh(k + 4) * 6, 5, 2.4, k % 3 ? dry : leaf, 0.5);
      const out = finish([back, body, front], { shadow: [2, 2] });
      C.rim(out, null, { w: 1 });
      return out.over(fx);
    },
  });
})();
