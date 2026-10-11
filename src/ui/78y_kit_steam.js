/* Creatures C — Steamhollow (expansion P16b; the interim creatures given drawings of their own on the kit in
 * 78u_creature_kit.js). They face the party (screen left); the light comes from the upper left.
 *   yn.steamwisp  the Steam Wisp: a puff of steam with a scowl in it, hissing from its crack in the rock
 *   yn.pebbles    the Pebble Stack: a little tower of flat stones stacked for luck, offended when knocked down
 *   yn.toad       the Sulphur Toad: a fat yellow toad squatting in the channel, stirring the silt
 *   yn.lostguest  the Lost Guest: a guest in a yukata with a room tag, the steam showing through them
 *   yn.towelthief the Towel Thief: a hand towel come alive, flapping like a bird
 *   yn.chochin    the Stray Lantern: a festival paper lantern, still lit, with one eye and a long tongue
 *   yn.kettle     the Kettle Below: an iron kettle the size of a house, sunk in its boiling pool and shaking
 * (The Kettle's Mother, among the guardians, is drawn on the Kettle Below's drawing, larger and older.) */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const KIT = RB.creatureKit;
  if (!KIT) return;

  // ---- the Steam Wisp -----------------------------------------------------------------------------------------
  KIT.define('yn_steamwisp', {
    spec: { w: 220, h: 230, ox: 110, oy: 124, ms: 120, bob: (t) => Math.sin(t / 300) * 4 },
    moves: ['heat', 'shroud'],
    fx: { heat: 'kilnBreath' },
    idleOpts: { breath: 0.06, bob: 2, puff: 0.3 },
    veil: (o) => ({ kind: 'mist', cols: ['#f4f2ee', '#e2e0da', '#b8b4ac'] }),
    audit: { anatomy: 'a puff of steam rising from a crack in the rock: billows heaped on billows, and in the front billow a scowl (two heavy brows, two small eyes, a mouth pulled down at the corners) that hisses', materials: 'white steam in soft stepped tones, cooler in its shadows, warm pink when it heats; the crack\'s dark rock below', moves: { heat: 'it swells and goes hot pink and breathes scalding steam', shroud: 'it bursts into a veil of steam' } },
    draw(L, q, o, H, C) {
      const { mat, ball } = C;
      const hot = Math.max(0, q.glow - 1), col = C.mix(o.col || '#eeece4', '#f0a090', Math.min(0.6, hot * 0.8));
      const steam = mat('steam' + Math.round(hot * 10), col, { n: 6, lo: 0.5, l: 0.84, hi: 0.98, alpha: 214, line: false }), rock = mat('rock', '#3a3430', { n: 5 }), face = mat('face', '#4a3a3a', { n: 3, line: false, cols: ['#2a1a1c', '#5a3a3a', '#f8f0f0'] });
      const out = L.like(), fx = L.like();
      const swell = 1 + q.puff * 0.25 + hot * 0.2 + q.squash * -0.1, by = -q.lift;
      // the crack it rises from
      C.stone(out, [[-30, 70], [-8, 62], [10, 66], [34, 72], [30, 80], [-34, 80]], rock, { face: 2 });
      out.rect(-6, 64, 10, 3, rock, 0);
      // billows: a column rising from the crack, the big front one with the face
      const B = [[0, 52, 10], [-4, 34, 16], [8, 18, 20], [-10, 4, 24], [12, -14, 22], [-2, -28, 30]];
      B.forEach(([x, y, r], i) => { const R = r * swell, X = x + Math.sin(q.ph * 6.28 + i) * 2, Y = y * swell + by; out.ell(X, Y, R, R * 0.86, steam, ball(X - R * 0.35, Y - R * 0.4, R, R * 0.86, { lift: 0.12 })); });
      const fx0 = -6, fy0 = -28 * swell + by;
      // the scowl
      for (const sd of [-1, 1]) out.seg(fx0 + sd * 10 - 4, fy0 - 10 + (sd < 0 ? 0 : -1), fx0 + sd * 3 - 4, fy0 - 6, 2.4, face, 1);
      if (q.eyes === 'shut') for (const sd of [-1, 1]) out.rect(fx0 + sd * 7 - 6, fy0 - 3, 5, 1, face, 0);
      else for (const sd of [-1, 1]) out.rect(fx0 + sd * 7 - 5, fy0 - 4, 3, q.eyes === 'wide' ? 4 : 2, face, 0);
      const mo = 2 + q.open * 5 + hot * 3;
      out.fill(fx0 - 14, fy0 + 4, fx0 + 6, fy0 + 14 + mo, (x, y) => { const u = (x - fx0 + 4) / 9; return Math.abs(u) <= 1 && y >= fy0 + 7 - (1 - u * u) * 2 && y <= fy0 + 7 + mo * (1 - u * u * 0.7); }, face, 0);
      // hissing jets
      if (q.open > 0.1 || hot > 0.1) for (let i = 0; i < 4; i++) fx.seg(fx0 - 14 - i * 8, fy0 + 8 + i * 2, fx0 - 22 - i * 8, fy0 + 6 + i * 3, 1.4, steam, 4);
      C.outline(out);
      return out.over(fx);
    },
  });

  // ---- the Pebble Stack ---------------------------------------------------------------------------------------
  KIT.define('yn_pebbles', {
    spec: { w: 200, h: 230, ox: 100, oy: 140, ms: 210 },
    moves: ['charge', 'strike'],
    fx: { strike: 'stoneDust', charge: 'gather' },
    travel: { strike: 0.22 },
    idleOpts: { breath: 0.02, bob: 0 },
    audit: { anatomy: 'a little tower of flat river stones stacked for luck, each smaller than the one below, the top stone with two eyes peering out of a crack in it; it wobbles, topples onto you, and stacks itself up again', materials: 'smooth water-worn stones in greys and warm browns, each lit along its upper rim; a tied straw rope with a paper streamer round the middle stone', moves: { strike: 'it leans and topples its stones onto you', charge: 'it stacks itself higher, stone by stone' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const col = o.col || '#8e887c', st = [mat('s0', col, { n: 6 }), mat('s1', C.mix(col, '#a08060', 0.4), { n: 6 }), mat('s2', C.mix(col, '#6a6a70', 0.4), { n: 6 })];
      const rope = mat('rope', '#c8b070', { n: 4 }), paper = mat('paper', '#f4f0e4', { n: 3 }), eyeM = mat('eye', '#1a1816', { n: 3, line: false, cols: ['#0e0c0a', '#2a2420', '#f0ece0'] });
      const out = L.like(), fx = L.like();
      for (const Lr of [out, fx]) Lr.translate(0, 80).scale(1.75, 1.75).translate(0, -80);
      const tall = 1 + Math.max(0, q.squash) * 0.25 + Math.max(0, q.glow - 1) * 0.3, lean = q.lean * 0.5 + q.reach * 0.6 + q.tilt;
      const S = [[0, 34, 13], [2, 30, 11], [-2, 26, 10], [3, 22, 9], [-1, 18, 8], [1, 14, 7]];
      let y = 80;
      S.forEach(([dx, w, h], i) => {
        const hh2 = h * tall, cy = y - hh2 / 2, cx = dx + Math.sin(lean) * (80 - cy) * 0.9 + Math.sin(q.ph * 6.28 + i) * (i * 0.3);
        out.ell(cx, cy, w, hh2 / 2 + 1, st[i % 3], ball(cx - w * 0.3, cy - hh2 * 0.4, w, hh2 / 2 + 1, { k: 1.1, lift: 0.1 }));
        if (i === 2) { out.rect(cx - w, cy - 1, w * 2, 2, rope, 2); out.rect(cx - 4, cy + 1, 4, 7, paper, 2); out.rect(cx + 2, cy + 1, 3, 9, paper, 1); }
        if (i === S.length - 1) {
          out.line(cx - 6, cy, cx + 4, cy - 1, st[i % 3], 0);
          C.eyes(fx, [[cx - 5, cy + 1], [cx + 1, cy + 1]], q, eyeM, { r: 1 });
        }
        y -= hh2 - 1;
      });
      const res = finish([out], { shadow: null });
      C.rim(res, null, { w: 1 });
      return res.over(fx);
    },
  });

  // ---- the Sulphur Toad ---------------------------------------------------------------------------------------
  KIT.define('yn_toad', {
    spec: { w: 260, h: 200, ox: 130, oy: 108, ms: 240 },
    moves: ['sweep', 'strike'],
    fx: { sweep: 'ashDrift', strike: 'inkLash' },
    travel: { strike: 0.1, sweep: 0.08 },
    idleOpts: { breath: 0.05, bob: 0, puff: 0.4 },
    audit: { anatomy: 'a fat toad squatting in the channel: a broad warty back, a pale throat that swells, a wide mouth, two eyes high on the head with heavy lids, strong folded back legs stirring the silt and splayed front feet; a long tongue for a blow', materials: 'sulphur yellow skin with olive warts and a lit ridge along the back; a cream throat; dark wet eyes with gold rims; the channel\'s cloudy water round its feet', moves: { strike: 'its tongue lashes out at you', sweep: 'it kicks with its back feet and the silt clouds round you' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const col = o.col || '#c8b44e', skin = mat('skin', col, { n: 7 }), wart = mat('wart', C.mix(col, '#5a6a2a', 0.5), { n: 4 }), throat = mat('throat', '#ece0b8', { n: 4 });
      const tongue = mat('tongue', '#c86a6a', { n: 4 }), eyeM = mat('eye', '#1a1408', { n: 4, line: false, cols: ['#0e0a04', '#3a2a10', '#d8a830', '#fff8d0'] });
      const water = mat('water', '#8a8a5a', { n: 4, alpha: 170, line: false });
      const back = L.like(), body = L.like(), front = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 5, bx = -q.lean * 12, swell = q.puff * 6 + Math.sin(q.ph * 6.28) * 2;
      // back leg (stirring), the body, the head
      const kick = Math.abs(q.wing) * 14 + Math.sin(q.ph * 6.28) * 2;
      back.ell(bx + 40 + kick * 0.5, 62 + by, 22, 14, skin, ball(bx + 34, 56 + by, 22, 14));
      back.path([[bx + 54, 70, 6], [bx + 66 + kick, 76, 5], [bx + 74 + kick * 1.4, 78, 4]], 5, skin, 0.4);
      body.ell(bx + 10, 44 + by, 52, 34, skin, ball(bx - 6, 28 + by, 52, 34));
      body.ell(bx - 30, 56 + by, 20, 14 + swell, throat, ball(bx - 34, 52 + by, 20, 14 + swell, { lift: 0.06 }));
      for (let i = 0; i < 16; i++) { const x = bx - 20 + C.hh(i) * 70, y = 20 + by + C.hh(i + 9) * 34; if (((x - bx - 10) / 52) ** 2 + ((y - 44 - by) / 34) ** 2 < 0.8) body.ell(x, y, 2.6, 2, wart, ball(x - 1, y - 1, 2.6, 2)); }
      // head: wide mouth, eyes high
      const hx = bx - 34, hy = 30 + by;
      body.ell(hx, hy, 24, 18, skin, ball(hx - 8, hy - 6, 24, 18));
      const mo = q.open * 6 + q.reach * 4;
      body.fill(hx - 26, hy, hx + 12, hy + 10 + mo, (x, y) => { const u = (x - hx + 6) / 20; return Math.abs(u) <= 1 && y >= hy + 6 - u * 2 && y <= hy + 7 - u * 2 + mo * (1 - u * u); }, mat('mouth', '#3a1a10', { n: 2, line: false }), 0);
      body.line(hx - 24, hy + 6, hx + 10, hy + 2, skin, 0);
      for (const ex of [hx - 12, hx + 6]) { body.ell(ex, hy - 14, 8, 8, skin, ball(ex - 2, hy - 18, 8, 8)); }
      C.eyes(fx, [[hx - 13, hy - 15], [hx + 5, hy - 16]], q, eyeM, { r: 3 });
      for (const ex of [hx - 12, hx + 6]) fx.rect(ex - 6, hy - 21, 12, 2, skin, 4);
      // front feet
      for (const [x, Lr] of [[hx - 6, front], [hx + 20, back]]) { Lr.path([[x, hy + 16, 6], [x - 6, 76, 4]], 5, skin, 0.5); for (let k = -1; k <= 1; k++) Lr.seg(x - 6, 76, x - 10 + k * 4, 80, 2, skin, 0.5); }
      // the tongue, lashing out
      if (q.reach > 0.2) front.path([[hx - 20, hy + 8, 4], [hx - 20 - q.reach * 50, hy + 4 - q.reach * 6, 3.4], [hx - 24 - q.reach * 80, hy + 2, 5]], 4, tongue, 0.6);
      const out = finish([back, body, front], { shadow: [2, 2] });
      C.rim(out, null, { w: 1 });
      // cloudy water round its feet
      fx.fill(-130, 70, 130, 90, (x, y) => ((x - bx) / 110) ** 2 + ((y - 80) / 7) ** 2 <= 1 && y > 76 + Math.sin(x / 7 + q.ph * 6.28), water, (x, y) => (y < 79 ? 0.75 : 0.35));
      return out.over(fx);
    },
  });

  // ---- the Lost Guest -----------------------------------------------------------------------------------------
  KIT.define('yn_lostguest', {
    spec: { w: 220, h: 260, ox: 110, oy: 150, ms: 210, bob: (t) => Math.sin(t / 800) * 2 },
    moves: ['plea', 'strike'],
    fx: { plea: 'note', strike: 'wispTrail' },
    travel: { strike: 0.2 },
    idleOpts: { breath: 0.03, bob: 1 },
    audit: { anatomy: 'a guest in a yukata walking slowly up and down: the robe wrapped left over right with a soft obi, wide sleeves, hair loose and damp, geta on bare feet, a wooden room tag held out on its cord; the steam shows through them', materials: 'a translucent lilac-grey, the yukata\'s indigo pattern faint in it (a plain repeating mark), the room tag the one solid warm wood', moves: { plea: 'they hold the tag out to you: which room is this?', strike: 'they turn suddenly and pass through you' } },
    draw(L, q, o, H, C) {
      const { mat } = C;
      const col = o.col || '#bcb4cc', ghost = mat('ghost', col, { n: 6, lo: 0.4, l: 0.72, hi: 0.94, alpha: 170, line: false }), indigo = mat('indigo', '#5a6a9a', { n: 3, alpha: 120, line: false });
      const tagM = mat('tag', '#a8784a', { n: 4 }), cord = mat('cord', '#c84a3a', { n: 3 }), eyeM = mat('eye', '#3a3448', { n: 2, alpha: 200, line: false }), steam = mat('steam', '#ffffff', { n: 2, alpha: 120, line: false });
      const back = L.like(), out = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 5, bx = -q.lean * 12, offer = q.open + q.reach * 0.6;
      const P = C.figure(out, ghost, { x: bx, y: 4 + by, h: 1.5, stride: Math.sin(q.ph * 6.28) * 0.15, lean: 0.1 + offer * 0.2, armF: 0.5 + offer * 1.0, armB: -0.15, bend: 0.5, opt: { lift: 0.04 } }, back);
      // the yukata: a robe from the shoulders to the shins, wide sleeves, the obi
      out.fill(bx - 30, P.neck[1], bx + 30, 48 + by, (x, y) => { const u = (y - P.neck[1]) / (48 + by - P.neck[1]); return Math.abs(x - bx - (1 - u) * (P.neck[0] - bx)) < 13 + u * 6; }, ghost, (x, y) => C.clamp(0.55 - (x - bx) / 70, 0, 0.999));
      out.line(P.neck[0] - 4, P.neck[1] + 2, bx + 6, 20 + by, ghost, 1);
      out.rect(bx - 15, 0 + by, 30, 6, indigo, 1);
      for (let i = 0; i < 10; i++) { const x = bx - 12 + (i % 4) * 8 + (Math.floor(i / 4) % 2) * 4, y = -16 + by + Math.floor(i / 4) * 16; if (y > P.neck[1] + 6) out.ell(x, y, 1.6, 1.6, indigo, 2); }
      const [hx, hy] = P.hands[0];
      out.ell(hx + 4, hy - 6, 9, 14, ghost, 0.5);
      // the room tag on its cord
      fx.seg(hx, hy, hx - 4, hy + 10, 1, cord, 1);
      fx.rect(hx - 9, hy + 10, 10, 18, tagM, 2); fx.rect(hx - 9, hy + 10, 10, 2, tagM, 3); fx.rect(hx - 6, hy + 16, 4, 6, tagM, 0);
      // hair, eyes, the steam through them
      out.ell(P.head[0] + 3, P.head[1] - 3, 9, 10, mat('hair', '#4a4458', { n: 3, alpha: 180, line: false }), 1);
      if (q.eyes !== 'shut') fx.rect(P.head[0] - 7, P.head[1] + 1, 3, q.eyes === 'wide' ? 2 : 1, eyeM, 1);
      for (let i = 0; i < 6; i++) { const t = (q.ph + C.hh(i)) % 1; fx.ell(bx - 20 + C.hh(i + 4) * 40, 40 - t * 120 + by, 4 + t * 4, 2 + t * 2, steam, 1); }
      return back.over(out).over(fx);
    },
  });

  // ---- the Towel Thief ----------------------------------------------------------------------------------------
  KIT.define('yn_towelthief', {
    spec: { w: 240, h: 210, ox: 120, oy: 104, ms: 100, bob: (t) => Math.sin(t / 240) * 6 },
    moves: ['gust', 'strike'],
    fx: { gust: 'gust', strike: 'inkLash' },
    travel: { strike: 0.34 },
    idleOpts: { breath: 0.02, bob: 2, wing: 0.9 },
    audit: { anatomy: 'a hand towel come alive: a long strip of cotton folded at its middle into a body and a head, its two ends flapping as wings, frayed fringes at the tips, two bright eyes in the fold', materials: 'off-white cotton with a woven texture and two indigo stripes near each end, softly shaded in its folds', moves: { gust: 'it beats its ends and the air buffets you', strike: 'it snaps at you like a wet towel' } },
    draw(L, q, o, H, C) {
      const { mat } = C;
      const col = o.col || '#e8e2d0', cloth = mat('cloth', col, { n: 6, lo: 0.4, l: 0.82, hi: 0.97 }), stripe = mat('stripe', '#3a5a8a', { n: 4 });
      const eyeM = mat('eye', '#1a1a22', { n: 3, line: false, cols: ['#101018', '#3a3a50', '#ffffff'] });
      const out = L.like(), fx = L.like();
      const by = -q.lift, bx = -q.lean * 18 - q.reach * 14, beat = q.wing;
      // each end: a cloth strip from the fold out to the tip, rippling; the stripes near its end
      const end = (sd, near) => {
        const up = -beat * 30 * (near ? 1 : 0.8), len = 74 + q.reach * (near ? 20 : 0), pts = [];
        for (let k = 0; k <= 12; k++) { const u = k / 12, x = bx + sd * (8 + u * len), y = by - 4 + up * u + Math.sin(u * 7 + q.ph * 12.56 + sd) * 4 * u + u * u * 10; pts.push([x, y]); }
        for (let k = 1; k < pts.length; k++) {
          const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], u = k / 12, w = 13 - u * 2;
          C.fpoly(out, [[x0, y0 - w], [x1, y1 - w], [x1, y1 + w], [x0, y0 + w]], u > 0.72 && u < 0.86 && (k % 1 === 0) ? stripe : cloth, (x, y) => C.clamp((near ? 0.66 : 0.42) - (y - y0) / 60 + (Math.floor(x + y) % 3 === 0 ? 0.04 : 0) + Math.sin(u * 7 + q.ph * 12.56) * 0.08, 0, 0.999));
        }
        const [tx, ty] = pts[12];
        for (let f = -3; f <= 3; f++) out.seg(tx, ty + f * 3.5, tx + sd * 6, ty + f * 3.8 + 2, 1, cloth, 2);
      };
      end(1, false);
      // the fold: body and head
      out.ell(bx, by, 18, 16, cloth, (x, y) => C.clamp(0.7 - (x - bx) / 60 - (y - by) / 50, 0, 0.999));
      out.line(bx - 12, by + 4, bx + 12, by + 8, cloth, 1);
      end(-1, true);
      C.outline(out);
      C.eyes(fx, [[bx - 9, by - 4], [bx + 1, by - 5]], q, eyeM, { r: 2 });
      return out.over(fx);
    },
  });

  // ---- the Stray Lantern --------------------------------------------------------------------------------------
  KIT.define('yn_chochin', {
    spec: { w: 210, h: 250, ox: 104, oy: 120, ms: 150, bob: (t) => Math.sin(t / 420) * 5 },
    moves: ['lie', 'heat', 'mend'],
    fx: { lie: 'paperCut', heat: 'kilnStoke', mend: 'mendThread' },
    idleOpts: { breath: 0.04, bob: 2 },
    audit: { anatomy: 'a paper festival lantern (chōchin) drifted off its street: a ribbed paper body, black lacquered rims top and bottom, a hook and cord above; split across its middle into a wide mouth with a long tongue, one big eye above it, the candle\'s light inside', materials: 'warm orange-red paper glowing from inside, darker on its ribs; black lacquer with a lit rim; the eye pale, the tongue pink', moves: { lie: 'it tells you the house rules, wrong, flapping its mouth', heat: 'its candle flares and the paper glows hot', mend: 'it glues its torn paper back with a lick' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const col = o.col || '#e8763a', paper = mat('paper', col, { n: 7, l: 0.55 }), lac = mat('lac', '#1e1a1e', { n: 4 }), eyeM = mat('eye', '#f8f0e0', { n: 4, line: false, cols: ['#1a1010', '#5a2a1a', '#f0e6d4', '#ffffff'] });
      const tongue = mat('tongue', '#d86a7a', { n: 4 }), mouth = mat('mouth', '#4a1a10', { n: 3, line: false });
      const body = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 6, bx = -q.lean * 14, sw = Math.sin(q.ph * 6.28) * 0.06 + q.tilt + q.lean * 0.2;
      body.save().translate(bx, -60 + by).rotate(sw).translate(-bx, 60 - by);
      body.seg(bx, -96 + by, bx, -74 + by, 1.4, lac, 2);
      body.ell(bx, -96 + by, 4, 3, lac, 1);
      const hot = Math.max(0, q.glow - 1), lit = 0.25 + hot * 0.3;
      // the ribbed body: an oval of paper, its ribs as darker rings, the mouth split across it
      const mo = 3 + q.open * 10 + (q.eyes === 'narrow' ? 6 : 0), my = 10 + by;
      body.fill(bx - 44, -70 + by, bx + 44, 58 + by, (x, y) => { const u = (x - bx) / 42, v = (y - (-6 + by)) / 62; return u * u + v * v <= 1 && !(y > my - mo / 2 && y < my + mo / 2 && Math.abs(x - bx + 10) < 36); }, paper, (x, y) => {
        const rib = ((y + 400) % 8) < 1.4, u = (x - bx) / 42;
        return C.clamp(0.42 + lit + (1 - Math.abs(u + 0.2)) * 0.25 - (rib ? 0.22 : 0) - u * 0.12, 0, 0.999);
      });
      body.fill(bx - 44, my - mo / 2, bx + 30, my + mo / 2, (x, y) => Math.abs(x - bx + 10) < 36 && ((x - bx) / 42) ** 2 + ((y - (-6 + by)) / 62) ** 2 <= 1, mouth, 0);
      // rims
      C.fpoly(body, [[bx - 22, -72 + by], [bx + 22, -72 + by], [bx + 24, -64 + by], [bx - 24, -64 + by]], lac, (x, y) => (y < -70 + by ? 0.8 : 0.3));
      C.fpoly(body, [[bx - 24, 52 + by], [bx + 24, 52 + by], [bx + 22, 60 + by], [bx - 22, 60 + by]], lac, (x, y) => (y < 54 + by ? 0.7 : 0.3));
      // the eye; the tongue lolling out of the mouth
      const ex = bx - 8, ey = -24 + by;
      if (q.eyes === 'shut') body.path([[ex - 12, ey, 2], [ex, ey + 3, 2], [ex + 12, ey, 2]], 2, lac, 0);
      else { const eh = q.eyes === 'wide' ? 12 : 10; body.ell(ex, ey, 14, eh, eyeM, (x, y) => (y < ey - eh * 0.4 ? 0.62 : 0.78)); body.ell(ex - 4, ey + 1, 6, Math.min(7, eh - 2), eyeM, 0); body.dot(ex - 6, ey - 2, eyeM, 3); }
      body.path([[bx - 26, my + 2, 6], [bx - 38, my + 16 + q.open * 8, 5], [bx - 34, my + 30 + q.open * 14, 4.5]], 5, tongue, (x, y) => (x < bx - 34 ? 0.85 : 0.6));
      body.restore();
      const out = finish([body], { shadow: null });
      C.rim(out, null, { w: 1 });
      H.glow(fx, bx, -6 + by, 50 + hot * 20, 60 + hot * 20, col, 0.14 + hot * 0.2, 3);
      return out.over(fx);
    },
  });

  // ---- the Kettle Below (boss); the Kettle's Mother is drawn on it ----------------------------------------------
  function kettle(L, q, o, H, C, act) {
    const { mat, ball, finish } = C;
    const mother = !!o.mother, Z = mother ? 1.12 : 1;
    const col = o.col || '#3e3c42', iron = mat('iron' + (mother ? 'm' : ''), col, { n: 7, l: mother ? 0.42 : 0.3, hi: mother ? 0.76 : 0.64, sat: 0.35, cool: 220 }), rust = mat('rust', '#7a4a32', { n: 4 });
    const water = mat('water', '#c8d8d4', { n: 5, lo: 0.4, l: 0.7, alpha: 210 }), steam = mat('steam', '#f8f8f6', { n: 4, lo: 0.78, l: 0.9, hi: 0.99, alpha: 120, line: false });
    const eyeM = mat('eye', '#f0d890', { n: 3, line: false, cols: ['#2a2010', '#c8a040', '#fff4c0'] }), core = o.core ? mat('core', o.core, { n: 4, l: 0.8, line: false }) : null;
    const back = L.like(), body = L.like(), lidL = L.like(), front = L.like(), fx = L.like();
    const cold = /chill/.test(act || '') ? 1 : 0, shake = cold ? 0 : Math.sin(q.ph * 6.28 * 3) * 1.5 + q.squash * 3, by = -q.lift - (mother ? q.puff * 10 : 0);
    for (const Lr of [back, body, lidL, front, fx]) Lr.scale(Z, Z);
    const cx = shake, cy = 20 + by;
    // the handle arching over it, the spout toward the party
    back.path([[cx - 70, cy - 40, 8], [cx - 40, cy - 108, 7], [cx + 40, cy - 108, 7], [cx + 70, cy - 40, 8]], 8, iron, 0.3);
    C.tube(body, [[cx - 78, cy + 6, 16], [cx - 104, cy - 14, 10], [cx - 118, cy - 34, 7]], iron, { lift: 0.02 });
    // the body: a squat round kettle with the hailstone pattern (arare) in its iron
    body.ell(cx, cy, 92, 64, iron, (x, y) => { const v = ball(cx - 26, cy - 22, 92, 64)(x, y); const gx = ((x - cx + 400) % 9), gy = ((y - cy + 400) % 9); return C.clamp(v + (gx < 3 && gy < 3 ? 0.1 : 0), 0, 0.999); });
    for (let i = 0; i < 12; i++) { const x = cx - 60 + C.hh(i) * 120, y = cy - 30 + C.hh(i + 5) * 70; if (((x - cx) / 90) ** 2 + ((y - cy) / 62) ** 2 < 0.85) body.ell(x, y, 3 + C.hh(i + 9) * 4, 2, rust, 1); }
    // the lid, rattling up off its rim; under it, two eyes peering out
    const lift = cold ? 0 : 4 + Math.abs(Math.sin(q.ph * 6.28 * 2)) * 6 + q.open * 10 + Math.max(0, q.glow - 1) * 10;
    body.ell(cx, cy - 58, 50, 10, iron, 0.15);
    lidL.ell(cx - 2, cy - 62 - lift, 52, 12, iron, (x, y) => C.clamp(0.6 - (x - cx) / 160 - (y - (cy - 62 - lift)) / 30, 0, 0.999));
    lidL.ell(cx - 2, cy - 74 - lift, 10, 6, iron, ball(cx - 5, cy - 77 - lift, 10, 6));
    if (core && q.glow > 1.05) body.ell(cx, cy - 58, 46, 6, core, 2);
    if (q.eyes !== 'shut' && lift > 3) for (const ex of [cx - 22, cx + 4]) { const eh = q.eyes === 'wide' ? 3 : q.eyes === 'narrow' ? 1 : 2; fx.rect(ex, cy - 60 - Math.min(lift, 8) / 2, 7, eh, eyeM, 2); fx.dot(ex + 1, cy - 60 - Math.min(lift, 8) / 2, eyeM, 2); }
    // the boiling pool round it, and its steam
    front.fill(-160, cy + 20, 160, cy + 80, (x, y) => ((x - cx * 0.3) / (mother ? 128 : 146)) ** 2 + ((y - cy - 52) / 18) ** 2 <= 1 && y > cy + 40 + Math.sin(x / 8 + q.ph * 6.28 * 2) * 2, water, (x, y) => (y < cy + 44 + Math.sin(x / 8 + q.ph * 12.56) * 2 ? 0.85 : 0.4));
    if (!cold) for (let i = 0; i < 8; i++) { const b = (q.ph * 2 + C.hh(i)) % 1; front.ell(-120 + C.hh(i + 2) * 240, cy + 46 - b * 4, 3 + b * 2, 2, water, 4); }
    const out = finish([back, body, lidL, front], { shadow: [2, 3] });
    C.rim(out, null, { w: 1 });
    const puffs = cold ? 2 : 6 + Math.round(Math.max(0, q.glow - 1) * 6) + (mother ? 6 : 0);
    for (let i = 0; i < puffs; i++) { const t = (q.ph + C.hh(i)) % 1, x = cx - 100 + C.hh(i + 7) * 200, y = cy + 30 - t * (mother ? 200 : 140); fx.ell(x + Math.sin(t * 6 + i) * 6, y, 10 + t * 14, 6 + t * 8, steam, 2 + (i % 2)); }
    if (cold) for (let i = 0; i < 10; i++) fx.dot(cx - 80 + C.hh(i) * 160, cy - 60 + C.hh(i + 3) * 100, mat('frost', '#e8f4ff', { n: 2, line: false }), 1);
    return out.over(fx);
  }
  KIT.kettle = kettle;
  KIT.define('yn_kettle', {
    spec: { w: 300, h: 296, ox: 150, oy: 168, ms: 160 },
    moves: ['charge', 'chill'],
    fx: { charge: 'kilnStoke', chill: 'frostDust' },
    idleOpts: { breath: 0.04, bob: 0 },
    audit: { anatomy: 'an iron kettle (tetsubin) the size of a house, sunk in its boiling pool: a squat round body with the hailstone pattern in its iron, a spout toward the party, an arched handle, a lid that rattles up off its rim, and under the lid two eyes peering out like a frightened animal\'s', materials: 'black cast iron with a cool sheen and rust blooms; the pool milky and boiling; the steam white', moves: { charge: 'it shakes, its lid rattles high, steam bursts round it', chill: 'it goes quiet and still; the steam stops and frost forms on the iron' } },
    draw: kettle,
  });
})();
