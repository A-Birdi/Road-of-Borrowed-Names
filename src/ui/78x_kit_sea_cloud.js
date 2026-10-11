/* Creatures C — Kotonoha and the Cloudroad (expansion P16b; the interim creatures given drawings of their own on the
 * kit in 78u_creature_kit.js). They face the party (screen left); the light comes from the upper left.
 *   ko.leafling  the Leafling: a little figure of leaves holding up one written leaf like a placard
 *   ko.jelly     the Driftword Jelly: a cartwheel-wide jellyfish, half-dissolved marks turning inside its bell
 *   ko.mirror    the Tidepool Mirror: a rock pool whose still water stands up as a mirror
 *   ko.echo      the Conch Echo: a voice come loose from a conch, the shape of a curl of shell
 *   ko.gardener  the Gardener of Unsent Words: woven roots standing up in a mantle of leaves, a lantern for a face
 *   cr.waystone  the Waystone Imp: a little stone figure with a signpost's arm for each hand
 *   cr.echo      the Runner's Echo: a runner's shape in the mist, mid-stride, never arriving
 *   cr.ox        the Cloud Ox: a cloud in the shape of an ox, lying across the road, chewing the fog
 *   cr.fogporter the Fog Porter: a porter made of fog, a real carrying pole across its shoulders
 *   cr.moth      the Blankpage Moth: a moth whose wings are two blank pages
 *   cr.courier   the Courier Who Never Arrived: a runner in a straw hat, a bag on a pole, the snow showing through him
 * Marks on leaves, pages and boards are ruled lines and blots, never letters. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const KIT = RB.creatureKit;
  if (!KIT) return;
  const C0 = KIT.C;

  const figure = (...a) => C0.figure(...a);

  // ---- the Leafling -------------------------------------------------------------------------------------------
  KIT.define('ko_leafling', {
    spec: { w: 230, h: 250, ox: 116, oy: 138, ms: 130, bob: (t) => Math.sin(t / 340) * 4 },
    moves: ['gust', 'lie'],
    fx: { gust: 'gust', lie: 'paperCut' },
    idleOpts: { breath: 0.04, bob: 2 },
    audit: { anatomy: 'a small figure made of leaves: a round head of overlapping leaves with two dark eyes, a body of layered leaves, twig arms and legs; one big leaf held up over its head like a placard, ruled with veins and a few blots (never writing)', materials: 'autumn gold leaves in three tones with darker veins and lit edges; twig brown', moves: { gust: 'it flings its arms and a gust of its own leaves blows at you', lie: 'it turns the placard and reads it out wrong' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const col = o.col || '#d8b84a', leaf = mat('leaf', col, { n: 7 }), leaf2 = mat('leaf2', C.mix(col, '#a86a2a', 0.35), { n: 6 }), twig = mat('twig', '#6a4a2a', { n: 4 });
      const eyeM = mat('eye', '#1a1410', { n: 3, line: false, cols: ['#120c08', '#3a2a18', '#f8f0d0'] });
      const back = L.like(), body = L.like(), front = L.like(), fx = L.like();
      for (const Lr of [back, body, front, fx]) Lr.scale(1.4, 1.4);
      const by = -q.lift + q.squash * 5, bx = -q.lean * 10;
      const lf = (Lr, M, x, y, r, a, sh) => { Lr.save().translate(x, y).rotate(a); Lr.fill(-r, -r * 0.55, r, r * 0.55, (X, Y) => (X / r) ** 2 + (Y / (r * 0.5)) ** 2 * (1 + X / (r * 2.2)) <= 1, M, (X, Y) => C.clamp(sh - Y / (r * 3) + (Math.abs(Y) < 0.6 ? -0.18 : 0), 0, 0.999)); Lr.restore(); };
      // legs and arms of twig
      for (const [sd, Lr] of [[-1, body], [1, back]]) Lr.path([[bx + sd * 6, 30 + by, 2.4], [bx + sd * 9, 50 + by * 0.5, 2.2], [bx + sd * 8 - 4, 66, 2]], 2.2, twig, sd < 0 ? 0.6 : 0.3);
      // the body: leaves overlapping, the lowest first
      for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2, x = bx + Math.cos(a) * 9, y = 14 + by + Math.sin(a) * 12; lf(i % 2 ? body : back, i % 3 ? leaf : leaf2, x, y, 12, a + Math.PI / 2 + Math.sin(q.ph * 6.28 + i) * 0.1, 0.55); }
      // the head
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, x = bx - 2 + Math.cos(a) * 8, y = -12 + by + Math.sin(a) * 7; lf(body, i % 2 ? leaf : leaf2, x, y, 10, a + Math.PI / 2, 0.62); }
      body.ell(bx - 2, -12 + by, 10, 9, leaf, ball(bx - 6, -16 + by, 10, 9));
      C.eyes(fx, [[bx - 8, -12 + by], [bx, -13 + by]], q, eyeM, { r: 1 });
      // arms up, holding the placard leaf (it tips as it lies, flings out in a gust)
      const fling = q.wing, tip = q.tilt * 2 + (q.eyes === 'narrow' ? 0.2 : 0);
      const hl = [bx - 14 - fling * 10, -40 + by + Math.abs(fling) * 10], hr = [bx + 12 + fling * 8, -42 + by + Math.abs(fling) * 8];
      front.path([[bx - 7, 4 + by, 2.2], [bx - 14, -14 + by, 2], hl.concat(1.8)], 2, twig, 0.55);
      back.path([[bx + 6, 4 + by, 2.2], [bx + 14, -16 + by, 2], hr.concat(1.8)], 2, twig, 0.3);
      const px = (hl[0] + hr[0]) / 2, py = (hl[1] + hr[1]) / 2 - 16;
      front.save().translate(px, py).rotate(tip - fling * 0.4);
      front.fill(-26, -18, 26, 18, (X, Y) => (X / 25) ** 2 + (Y / 17) ** 2 <= 1 && !(X > 18 && Math.abs(Y) < 3 - (X - 18)), leaf, (X, Y) => C.clamp(0.66 - X / 120 - Y / 80, 0, 0.999));
      front.line(-22, 0, 24, 0, leaf, 1);
      for (const sx of [-12, 0, 12]) { front.line(sx, 0, sx + 6, -11, leaf, 2); front.line(sx, 0, sx + 6, 11, leaf, 2); }
      front.rect(-16, -6, 9, 2, mat('ink', '#3a2a18', { n: 2, line: false }), 0); front.rect(2, 5, 11, 2, mat('ink', '#3a2a18', { n: 2, line: false }), 0); front.ell(-4, 8, 2, 2, mat('ink', '#3a2a18', { n: 2, line: false }), 0);
      front.path([[0, 16, 1.6], [0, 24, 1.2]], 1.4, twig, 1);
      front.restore();
      // leaves blown off it in a gust
      if (Math.abs(fling) > 0.2 || q.puff > 0.1) for (let i = 0; i < 6; i++) lf(fx, leaf, bx - 30 - i * 12 - Math.abs(fling) * 16, -10 + by + (C.hh(i) - 0.5) * 50, 5, i, 0.6);
      const out = finish([back, body, front], { shadow: [1, 2] });
      C.rim(out, null, { w: 1 });
      return out.over(fx);
    },
  });

  // ---- the Driftword Jelly ------------------------------------------------------------------------------------
  KIT.define('ko_jelly', {
    spec: { w: 260, h: 250, ox: 130, oy: 110, ms: 200, bob: (t) => Math.sin(t / 700) * 6 },
    moves: ['flood', 'chill'],
    fx: { flood: 'tideWash', chill: 'frostDust' },
    idleOpts: { breath: 0.05, bob: 2 },
    audit: { anatomy: 'a jellyfish as wide as a cartwheel, drifting a hand above the ground: a domed bell with a frilled rim, four frilly arms under it and many long fine tentacles; inside the bell, half-dissolved marks turn over slowly (curls, bars and dots, never letters)', materials: 'translucent sea-teal, brighter at the rim and the frills, the light through it; the marks inside darker and softening at their ends', moves: { flood: 'its bell pulses and a wash of sea water rolls out', chill: 'it goes pale and cold and sheds a frost of sea-salt' } },
    draw(L, q, o, H, C, act) {
      const { mat } = C;
      const col = o.col || '#7ac8c8', bell = mat('bell', col, { n: 6, l: 0.6, alpha: 186, line: false }), rim = mat('rim', C.mix(col, '#ffffff', 0.4), { n: 4, l: 0.7, alpha: 220, line: false });
      const arm = mat('arm', col, { n: 5, l: 0.55, alpha: 170, line: false }), markM = mat('mark', C.mix(col, '#1a3a4a', 0.6), { n: 3, alpha: 200, line: false });
      const cold = /chill/.test(act || '');
      const out = L.like(), fx = L.like();
      const pulse = q.squash, by = -q.lift + pulse * 6, bw = 70 * (1 + pulse * 0.12), bh = 48 * (1 - pulse * 0.2);
      // tentacles and frilled arms first (behind the bell's front)
      for (let i = 0; i < 12; i++) { const x0 = -bw * 0.8 + (i / 11) * bw * 1.6, len = 70 + C.hh(i) * 50 - pulse * 20; const pts = []; for (let k = 0; k <= 6; k++) { const u = k / 6; pts.push([x0 + Math.sin(q.ph * 6.28 + i + u * 4) * 6 * u + q.lean * -20 * u, by + 6 + u * len, 1.4 - u * 0.6]); } out.path(pts, 1.2, arm, 2); }
      for (let i = 0; i < 4; i++) { const x0 = -24 + i * 16; for (let k = 0; k < 10; k++) { const u = k / 10, x = x0 + Math.sin(q.ph * 6.28 + i * 1.3 + u * 5) * 8, y = by + 10 + u * 70; out.ell(x, y, 5 - u * 2.5, 4, arm, 3); } }
      // the bell
      out.fill(-bw, by - bh, bw, by + 10, (x, y) => { const u = x / bw, top = by - bh * Math.sqrt(Math.max(0, 1 - u * u)), bot = by + 6 + Math.sin(x / 6 + q.ph * 6.28) * 2; return y >= top && y <= bot; }, bell, (x, y) => C.clamp(0.45 - x / (bw * 4) - (y - by) / 120 + (cold ? 0.15 : 0), 0, 0.999));
      out.fill(-bw, by - 4, bw, by + 12, (x, y) => { const bot = by + 6 + Math.sin(x / 6 + q.ph * 6.28) * 2; return Math.abs(x) < bw && y > bot - 3 && y <= bot + 1; }, rim, 2);
      out.fill(-bw, by - bh, bw, by, (x, y) => { const u = x / bw, top = by - bh * Math.sqrt(Math.max(0, 1 - u * u)); return y >= top && y < top + 3 && x < 0; }, rim, 3);
      // the marks turning inside
      for (let i = 0; i < 7; i++) {
        const a = q.ph * 6.28 * 0.5 + i * 0.9, cx = Math.cos(a) * bw * 0.45, cy = by - bh * 0.45 + Math.sin(a * 1.3) * bh * 0.25, ang = a * 2 + i;
        out.save().translate(cx, cy).rotate(ang);
        if (i % 3 === 0) { for (let t = 0; t < 2.6; t += 0.3) out.dot(Math.cos(t) * (3 + t), Math.sin(t) * (3 + t), markM, 1); }
        else if (i % 3 === 1) { for (let t = 0; t < 3.1; t += 0.35) out.dot(Math.cos(t) * 5, Math.sin(t) * 2.5, markM, 1); out.dot(0, 4, markM, 1); }
        else { out.seg(-5, -1, 5, 1, 1.6, markM, 1); out.ell(6, -3, 1.4, 1.4, markM, 1); }
        out.restore();
      }
      if (cold) for (let i = 0; i < 8; i++) fx.dot(-bw + C.hh(i) * bw * 2, by + 14 + C.hh(i + 5) * 30, rim, 3);
      H.glow(fx, 0, by - bh * 0.4, bw * 0.9, bh * 0.8, cold ? '#d8f0ff' : col, 0.12, 2);
      return out.over(fx);
    },
  });

  // ---- the Tidepool Mirror ------------------------------------------------------------------------------------
  KIT.define('ko_mirror', {
    spec: { w: 260, h: 240, ox: 130, oy: 140, ms: 220 },
    moves: ['mirror', 'chill'],
    fx: { mirror: 'pane', chill: 'frostDust' },
    idleOpts: { breath: 0.02, bob: 0 },
    audit: { anatomy: 'a rock pool in a basin of dark stone, barnacles and weed on its lip; its still water stands up out of it as an oval mirror, rippling at its edge; in the mirror the room shows upside down, and two glints in it are its eyes', materials: 'wet basalt with lit bevels; white barnacles; green-brown weed; the water a pale sea-blue with a sky-bright top and a sharp white edge', moves: { mirror: 'its face tilts to you and your words come back with everyone in the wrong place', chill: 'the water stiffens and its edge frosts' } },
    draw(L, q, o, H, C, act) {
      const { mat, ball, finish } = C;
      const col = o.col || '#a8d0d8', rock = mat('rock', '#3e4448', { n: 7 }), weed = mat('weed', '#5a6a3a', { n: 4 }), barn = mat('barnacle', '#d8d4c8', { n: 3 });
      const water = mat('water', col, { n: 6, l: 0.6, alpha: 214 }), edgeM = mat('edge', '#ffffff', { n: 3, line: false, cols: ['#d0f0f8', '#eefcff', '#ffffff'] }), eyeM = mat('eye', '#ffffff', { n: 2, line: false, cols: ['#a8e0f0', '#ffffff'] });
      const basin = L.like(), mir = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 4, tilt = q.tilt + q.lean * -0.25 + (q.reach || 0) * -0.15;
      // the basin: a ring of stones
      for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI, x = Math.cos(a) * 92, y = 70 + Math.sin(a) * -10 + (i % 2) * 3, w = 24 + C.hh(i) * 8; C.stone(basin, [[x - w / 2, y - 10], [x + w / 2, y - 12], [x + w / 2 + 4, y + 12], [x - w / 2 - 4, y + 12]], rock, { face: 2, bevel: 3 }); }
      basin.ell(0, 76, 82, 9, water, 3);
      for (let i = 0; i < 12; i++) { const x = -90 + i * 16 + C.hh(i) * 6; basin.ell(x, 62 + (i % 3), 2.4, 2, barn, 2); }
      for (let i = 0; i < 5; i++) { const x = -80 + i * 38; basin.path([[x, 66, 2], [x - 4, 74, 1.6], [x + 2, 82, 1.2]], 1.6, weed, 2); }
      // the standing mirror of water
      mir.save().translate(0, 70 + by).rotate(tilt).translate(0, -(70 + by));
      const mx = 0, my = -6 + by, rx = 46, ry = 70 + q.squash * -8;
      mir.fill(mx - rx - 4, my - ry - 4, mx + rx + 4, 72 + by, (x, y) => ((x - mx) / (rx + Math.sin(y / 8 + q.ph * 6.28) * 1.5)) ** 2 + ((y - my) / ry) ** 2 <= 1 && y < 70 + by, water, (x, y) => {
        // the room upside down: a pale band (the far floor) high, a darker band (the ceiling) low, ripples
        const v = (y - (my - ry)) / (ry * 2);
        return C.clamp(0.62 - v * 0.3 + (v > 0.62 ? -0.18 : 0) + (Math.sin(y / 3 + x / 20 + q.ph * 6.28) > 0.92 ? 0.15 : 0) - (x - mx) / 300, 0, 0.999);
      });
      // inverted silhouettes in it (the party, upside down), dim
      for (const [x, s] of [[-20, 1], [10, 0.85]]) mir.fill(mx + x - 8 * s, my + 8, mx + x + 8 * s, my + 40 * s, (X, Y) => Math.abs(X - mx - x) < (Y > my + 30 * s ? 6 * s : 4 * s), water, 1);
      mir.fill(mx - rx - 4, my - ry - 4, mx + rx + 4, 72 + by, (x, y) => { const d = ((x - mx) / rx) ** 2 + ((y - my) / ry) ** 2; return d <= 1 && d > 0.86 && x < mx + 10 && y < 70 + by; }, edgeM, /chill/.test(act || '') ? 2 : 1);
      if (q.eyes !== 'shut') for (const ex of [mx - 14, mx + 6]) { mir.rect(ex, my - 20, 3, q.eyes === 'narrow' ? 1 : 3, eyeM, 1); mir.dot(ex, my - 20, eyeM, 1); }
      mir.restore();
      const out = finish([basin, mir], { shadow: [2, 2] });
      if (/chill/.test(act || '')) for (let i = 0; i < 10; i++) fx.dot(-50 + C.hh(i) * 100, -60 + C.hh(i + 3) * 120 + by, edgeM, 2);
      return out.over(fx);
    },
  });

  // ---- the Conch Echo -----------------------------------------------------------------------------------------
  KIT.define('ko_echo', {
    spec: { w: 260, h: 240, ox: 124, oy: 120, ms: 160, bob: (t) => Math.sin(t / 500) * 5 },
    moves: ['plea', 'strike'],
    fx: { plea: 'echoRings', strike: 'wispTrail' },
    travel: { strike: 0.3 },
    idleOpts: { breath: 0.04, bob: 2 },
    audit: { anatomy: 'a voice the shape of a curl of shell: a conch\'s spiral drawn in light, its whorls narrowing to a point, the lip of its opening flared toward the party and in the opening a dim mouth that says the one thing; rings of sound loosening off it', materials: 'a translucent shell-pink with a pearly inner lip, brighter on its lit whorls; the rings pale and fading', moves: { plea: 'it says its one thing again, and the rings carry it to you', strike: 'it spins and strikes with its point' } },
    draw(L, q, o, H, C) {
      const { mat } = C;
      const col = o.col || '#e0c4b4', shellM = mat('shell', col, { n: 6, l: 0.6, alpha: 214 }), lip = mat('lip', C.mix(col, '#fff4f0', 0.5), { n: 4, l: 0.7, alpha: 230 }), ring = mat('ring', '#fff4ec', { n: 2, alpha: 150, line: false });
      const mouth = mat('mouth', '#6a3a40', { n: 3, alpha: 220, line: false });
      const out = L.like(), fx = L.like();
      for (const Lr of [out, fx]) Lr.scale(1.45, 1.45);
      const by = -q.lift + q.squash * 4, bx = -q.lean * 12 - q.reach * 10, spin = q.ph * 0.4 + q.reach * 1.2 + q.tilt;
      out.save().translate(bx, by).rotate(spin);
      // the whorls: an outward spiral of tubes, widening toward the opening
      const pts = [];
      for (let t = 0; t <= 1; t += 0.04) { const a = t * Math.PI * 3.2, r = 6 + t * 38; pts.push([Math.cos(a) * r * 0.8 + 18 - t * 18, Math.sin(a) * r * 0.7 - 6, 2 + t * 13]); }
      C.tube(out, pts, shellM, { lift: 0.08 });
      for (let i = 2; i < pts.length; i += 3) out.dot(pts[i][0] - pts[i][2] * 0.4, pts[i][1] - pts[i][2] * 0.5, lip, 3);
      // the spire's point behind, the opening's flared lip in front
      C.tube(out, [[20, -10, 6], [42, -20, 3], [56, -26, 1]], shellM, { lift: 0.04 });
      const [ox, oy] = pts[pts.length - 1];
      out.ell(ox - 6, oy + 4, 16, 12, lip, (x, y) => C.clamp(0.7 - (x - ox) / 60, 0, 0.999));
      const mo = 3 + q.open * 6 + (q.eyes === 'wide' ? 2 : 0);
      out.ell(ox - 8, oy + 5, 8, mo, mouth, 1);
      out.restore();
      // rings of sound loosening off it
      const n = 2 + Math.round(q.open * 2);
      for (let i = 0; i < n; i++) { const r = 14 + ((q.ph * 30 + i * 18) % 54); for (let a = -0.9; a < 0.9; a += 0.08) fx.dot(bx - 10 - Math.cos(a) * r, by + Math.sin(a) * r, ring, 1); }
      return out.over(fx);
    },
  });

  // ---- the Gardener of Unsent Words (boss) --------------------------------------------------------------------
  KIT.define('ko_gardener', {
    spec: { w: 300, h: 296, ox: 150, oy: 172, ms: 240 },
    moves: ['lie', 'plea', 'mend'],
    fx: { lie: 'paperCut', plea: 'note', mend: 'mendThread' },
    idleOpts: { breath: 0.02, bob: 0 },
    audit: { anatomy: 'woven roots standing up: a tall body of plaited roots spreading into the ground, a mantle of leaves over its shoulders, long root arms with twig fingers, and where a face would be a hollow holding a lantern, whose light is its face', materials: 'dark root brown with lit strands where the weave turns to the light; green leaves in three tones; the lantern\'s paper warm amber', moves: { lie: 'it lifts a leaf and says the unsent word wrong', plea: 'it bends close and its lantern brightens, asking', mend: 'its roots weave back over a broken place' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const col = o.col || '#5e8a5a', root = mat('root', '#5a4430', { n: 7 }), leaf = mat('leaf', col, { n: 6 }), lampM = mat('lamp', '#f0c070', { n: 5, l: 0.78, line: false }), frame = mat('frame', '#3a2a1a', { n: 4 });
      const back = L.like(), body = L.like(), mantle = L.like(), front = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 6, bx = -q.lean * 18 - q.open * 10;
      // the roots spreading into the ground
      for (let i = 0; i < 9; i++) { const x = bx - 60 + i * 15, ex = x + (i - 4) * 9; (i % 2 ? back : body).path([[bx + (i - 4) * 4, 60 + by * 0.5, 6], [x, 88, 4], [ex, 104, 2.4]], 4, root, i % 2 ? 0.3 : 0.5); }
      // the plaited body: strands crossing as they rise
      for (let k = 0; k < 8; k++) {
        const pts = [];
        for (let t = 0; t <= 1; t += 0.08) { const y = 70 + by * 0.5 - t * 150 + by * t, w = 26 - t * 6, x = bx * t + Math.sin(t * 9 + k * 0.8) * w * (k % 2 ? 1 : -1) * 0.8; pts.push([x, y, 5 - t]); }
        C.tube(k % 2 ? body : back, pts, root, { lift: k % 2 ? 0.02 : -0.12 });
      }
      // the head's hollow and its lantern
      const hx = bx - 6, hy = -96 + by;
      body.ell(hx, hy, 24, 28, root, ball(hx - 6, hy - 8, 24, 28));
      body.ell(hx - 4, hy + 2, 15, 18, frame, 0);
      body.rect(hx - 12, hy - 10, 16, 24, lampM, Math.min(4, Math.round(1 + q.glow * 1.6)));
      for (const yy of [hy - 4, hy + 4, hy + 10]) body.rect(hx - 12, yy, 16, 1, frame, 1);
      body.rect(hx - 13, hy - 12, 18, 3, frame, 2); body.rect(hx - 13, hy + 13, 18, 3, frame, 2);
      if (q.eyes === 'shut') body.rect(hx - 12, hy - 10, 16, 24, lampM, 0);
      // the mantle of leaves over the shoulders
      for (let i = 0; i < 26; i++) { const a = Math.PI * (0.05 + (i / 25) * 0.9), r = 34 + (i % 3) * 8, x = bx + Math.cos(a) * r * 1.3 - 4, y = -60 + by + Math.sin(a) * -r * 0.35 + (i % 4) * 9; mantle.save().translate(x, y).rotate(a + Math.sin(q.ph * 6.28 + i) * 0.1); mantle.fill(-9, -5, 9, 5, (X, Y) => (X / 9) ** 2 + (Y / 4.5) ** 2 <= 1, leaf, (X, Y) => C.clamp(0.6 - Y / 20 - X / 60 + (i % 3) * 0.08 - 0.08, 0, 0.999)); mantle.restore(); }
      // root arms with twig fingers; the near one reaching (plea, mend) or lifting a leaf (lie)
      const ang = 0.6 + q.reach * 0.7 + q.open * 0.6 + (q.eyes === 'narrow' ? 0.5 : 0), sx = bx - 30, sy = -54 + by, ex = sx - Math.sin(ang) * 40, ey = sy + Math.cos(ang) * 40, wx = ex - Math.sin(ang + 0.5) * 34, wy = ey + Math.cos(ang + 0.5) * 34;
      C.tube(front, [[sx, sy, 7], [ex, ey, 5], [wx, wy, 3.4]], root, { lift: 0.02 });
      for (let f = 0; f < 4; f++) front.path([[wx, wy, 2], [wx - 8 + f * 3, wy + 10 - f * 2, 1.4]], 1.4, root, 0.5);
      if (q.eyes === 'narrow') { front.save().translate(wx - 6, wy - 4).rotate(-0.6); front.fill(-10, -5, 10, 5, (X, Y) => (X / 10) ** 2 + (Y / 5) ** 2 <= 1, leaf, 0.7); front.line(-8, 0, 8, 0, leaf, 1); front.restore(); }
      C.tube(back, [[bx + 26, sy, 7], [bx + 40, sy + 34, 5], [bx + 34, sy + 64, 3.4]], root, { lift: -0.14 });
      const out = finish([back, body, mantle, front], { shadow: [2, 3] });
      C.rim(out, null, { w: 1 });
      H.glow(fx, hx - 4, hy + 2, 30 + q.glow * 10, 30 + q.glow * 8, '#f0c070', 0.12 * q.glow, 2);
      return out.over(fx);
    },
  });

  // ---- the Waystone Imp ---------------------------------------------------------------------------------------
  KIT.define('cr_waystone', {
    spec: { w: 230, h: 220, ox: 116, oy: 120, ms: 170 },
    moves: ['lie', 'strike'],
    fx: { lie: 'pane', strike: 'stoneDust' },
    travel: { strike: 0.28 },
    idleOpts: { breath: 0.02, bob: 1 },
    audit: { anatomy: 'a little stone figure no taller than a signpost: a rounded head with a carved face, a squat rounded body wearing a red cloth bib (as roadside stones are given), stubby stone feet, and for each hand a signpost\'s wooden arm, pointed at the end, which it turns about', materials: 'grey roadside granite, lichen spots, lit bevels; weathered wood boards with a painted band (no lettering) and iron pins', moves: { lie: 'it swings both its arms round to point the wrong way', strike: 'it swats with a signboard' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const stone = mat('stone', o.col || '#8a9094', { n: 7 }), lichen = mat('lichen', '#b8b070', { n: 3 }), wood = mat('wood', '#8a6a44', { n: 6 }), band = mat('band', '#a84a3a', { n: 3 }), iron = mat('iron', '#3a3a44', { n: 3 });
      const eyeM = mat('eye', '#20242a', { n: 3, line: false });
      const back = L.like(), body = L.like(), front = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 4 - Math.abs(Math.sin(q.ph * 6.28)) * 2, bx = -q.lean * 14;
      // feet, pillar, head
      for (const sd of [-1, 1]) C.stone(sd > 0 ? back : body, [[bx + sd * 10 - 8, 60], [bx + sd * 10 + 8, 60], [bx + sd * 10 + 10, 70], [bx + sd * 10 - 10, 70]], stone, { face: sd > 0 ? 2 : 3 });
      body.fill(bx - 26, -12 + by, bx + 26, 64, (x, y) => { const u = (y - (-10 + by)) / (64 - (-10 + by)); return u >= 0 && u <= 1 && Math.abs(x - bx) < 15 + Math.sin(u * 2.4) * 8; }, stone, (x, y) => C.clamp(0.6 - (x - bx) / 60 - (y - by) / 260 + (Math.abs(x - bx) > 17 ? -0.12 : 0), 0, 0.999));
      // a red cloth bib, as the roadside stones are given
      body.fill(bx - 18, -10 + by, bx + 18, 18 + by, (x, y) => y > -8 + by && Math.abs(x - bx) < 17 - (y - (-8 + by)) * 0.55, mat('bib', '#b03a2e', { n: 4 }), (x, y) => C.clamp(0.6 - (x - bx) / 50, 0, 0.999));
      body.ell(bx - 2, -26 + by, 21, 20, stone, ball(bx - 8, -32 + by, 21, 20));
      for (let i = 0; i < 9; i++) body.dot(bx - 18 + C.hh(i) * 36, -40 + C.hh(i + 9) * 96 + by, lichen, 1 + (i % 2));
      // the face: carved brows, eyes, a small mouth
      const ey = -28 + by;
      if (q.eyes === 'shut') for (const ex of [bx - 12, bx + 2]) body.rect(ex, ey, 6, 1, eyeM, 0);
      else for (const ex of [bx - 12, bx + 2]) { body.rect(ex, ey - (q.eyes === 'wide' ? 2 : 1), 5, q.eyes === 'narrow' ? 1 : q.eyes === 'wide' ? 4 : 3, eyeM, 0); body.rect(ex - 1, ey - 4, 7, 1, stone, 1); }
      body.rect(bx - 7, ey + 9, 7, 1, eyeM, 0);
      // the signpost arms: boards on pins, turning
      const arm = (Lr, sx, sy, ang, far) => {
        Lr.save().translate(sx, sy).rotate(ang);
        C.fpoly(Lr, [[0, -6], [-44, -6], [-54, 0], [-44, 6], [0, 6]], wood, (x, y) => C.clamp((far ? 0.35 : 0.6) - y / 40 + (C.hh(Math.floor(x / 4)) - 0.5) * 0.1, 0, 0.999));
        Lr.rect(-40, -2, 30, 3, band, far ? 0 : 1);
        Lr.dot(-4, 0, iron, 1);
        Lr.restore();
      };
      const swing = q.eyes === 'narrow' ? 2.4 : 0;
      arm(back, bx + 14, -2 + by, Math.PI + 0.25 + swing + q.sway * 0.04, true);
      arm(front, bx - 14, 4 + by, 0.15 - q.reach * 0.7 - q.wing * 0.4 + swing * 0.5, false);
      const out = finish([back, body, front], { shadow: [2, 2] });
      C.rim(out, null, { w: 1 });
      return out.over(fx);
    },
  });

  // ---- the Runner's Echo --------------------------------------------------------------------------------------
  KIT.define('cr_echo', {
    spec: { w: 260, h: 250, ox: 120, oy: 140, ms: 160, bob: (t) => Math.sin(t / 450) * 3 },
    moves: ['mirror', 'strike'],
    fx: { mirror: 'pane', strike: 'wispTrail' },
    travel: { strike: 0.34 },
    idleOpts: { breath: 0.03, bob: 1 },
    audit: { anatomy: 'a runner\'s shape in the mist, caught mid-stride and never arriving: head down, one arm forward and one back, the front knee high, the back foot pushing off; behind it the mist it is made of trails away', materials: 'pale mist in layers, densest at the chest and head, thinning to nothing at the trailing edge; a faint warm tint where the light catches it', moves: { mirror: 'it turns, and says back the last thing it heard, a little wrong', strike: 'it runs through you' } },
    draw(L, q, o, H, C) {
      const { mat } = C;
      const col = o.col || '#d8c8a8', mist = mat('mist', C.mix(col, '#f4f2ee', 0.45), { n: 6, lo: 0.5, l: 0.8, hi: 0.97, alpha: 160, line: false }), thin = mat('thin', C.mix(col, '#f4f2ee', 0.45), { n: 4, lo: 0.6, l: 0.84, hi: 0.97, alpha: 96, line: false });
      const eyeM = mat('eye', '#5a4a3a', { n: 2, alpha: 200, line: false });
      const out = L.like(), back = L.like(), fx = L.like();
      const run = Math.sin(q.ph * 6.28) * 0.25, by = -q.lift + q.squash * 4, bx = -q.lean * 16 - q.reach * 16;
      const turn = q.eyes === 'narrow' ? -1 : 1;
      // the trailing mist behind it
      for (let i = 0; i < 8; i++) out.ell(bx + 30 + i * 13, -18 + by + Math.sin(q.ph * 6.28 + i) * 4 + i * 4, 18 - i * 1.6, 11 - i, thin, 2);
      const P = figure(out, mist, { x: bx, y: 2 + by, h: 1.5, stride: 0.9 + run, lean: 0.6 + q.reach * 0.3, armF: 1.1 * turn + run, armB: -0.9 * turn - run, bend: 0.9, opt: { lift: 0.06 } }, back);
      if (q.eyes !== 'shut') fx.rect(P.head[0] - 10, P.head[1] - 1, 3, q.eyes === 'wide' ? 2 : 1, eyeM, 1);
      return back.over(out).over(fx);
    },
  });

  // ---- the Cloud Ox -------------------------------------------------------------------------------------------
  KIT.define('cr_ox', {
    spec: { w: 320, h: 240, ox: 160, oy: 130, ms: 260 },
    moves: ['sweep', 'mend'],
    fx: { sweep: 'mistRoll', mend: 'mendThread' },
    travel: { sweep: 0.12 },
    idleOpts: { breath: 0.03, bob: 0 },
    audit: { anatomy: 'a cloud in the shape of an ox lying across the road: a long body of billowing puffs folded down on its legs, a heavy head low and forward with two curved horns and soft ears, a dewlap, a tail-tuft of mist; it chews, slowly', materials: 'cloud white with lilac-grey shadows in the folds of the puffs and a bright lit top; the horns pale horn-grey; the eyes dark and mild', moves: { sweep: 'it heaves up and swings its great head through the fog', mend: 'it settles again and the torn puffs close up' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const col = o.col || '#dfe4e8', cloud = mat('cloud', col, { n: 7, lo: 0.5, l: 0.82, hi: 0.98, cool: 260 }), horn = mat('horn', '#b8b0a0', { n: 5 }), eyeM = mat('eye', '#2a2830', { n: 3, line: false, cols: ['#18161c', '#3a3644', '#f8f8ff'] });
      const back = L.like(), body = L.like(), head = L.like(), fx = L.like();
      const rise = Math.max(0, q.lift + q.reach * 14 + Math.abs(q.wing) * 10), by = -rise * 0.7 + q.squash * 6, chew = Math.sin(q.ph * 6.28 * 2) * 1.5;
      const puff = (Lr, x, y, r, k) => Lr.ell(x, y, r, r * 0.86, cloud, ball(x - r * 0.35, y - r * 0.4, r, r * 0.86, { lift: k || 0 }));
      // folded legs (or standing, as it rises)
      for (const [x, Lr] of [[-60, body], [-30, back], [56, body], [80, back]]) { const len = 10 + rise * 1.4; Lr.ell(x, 60 + by * 0.3 + len * 0.3, 12, 8 + len * 0.4, cloud, ball(x - 4, 56 + by * 0.3, 12, 10)); }
      // the body: a row of puffs, the top ones lit
      for (let i = 0; i < 9; i++) { const x = -72 + i * 20, y = 24 + by + Math.sin(i * 1.7) * 4; puff(i % 2 ? body : back, x, y + 10, 24 + (i % 3) * 4, -0.06); }
      for (let i = 0; i < 7; i++) { const x = -60 + i * 22, y = 6 + by + Math.sin(i * 2.3 + q.ph * 6.28) * 2; puff(body, x, y, 20 + (i % 2) * 4, 0.06); }
      // tail tuft
      body.path([[110, 14 + by, 5], [126, 30 + by, 4], [124, 50 + by, 3]], 4, cloud, 0.45); puff(body, 124, 54 + by, 7, 0.02);
      // the head: low and forward, swinging in a sweep
      const sw = q.wing * 0.4 + q.reach * 0.25, hx = -102 - q.reach * 10, hy = 18 + by + sw * 20;
      head.save().translate(-80, 10 + by).rotate(-sw).translate(80, -(10 + by));
      puff(head, -84, 6 + by, 22, 0);
      head.ell(hx, hy, 24, 20, cloud, ball(hx - 8, hy - 7, 24, 20, { lift: 0.06 }));
      head.ell(hx - 16, hy + 10 + chew, 13, 10, cloud, ball(hx - 20, hy + 6, 13, 10, { lift: 0.04 }));
      head.ell(hx - 4, hy + 22, 10, 7, cloud, 0.35);
      for (const [sd, L2] of [[-1, head], [1, back]]) { L2.ell(hx + 10 + sd * 2, hy - 14 - sd * 2, 9, 5, cloud, sd < 0 ? 0.6 : 0.35); C.tube(L2, [[hx + 2 + sd * 4, hy - 16, 4.4], [hx + 14 + sd * 10, hy - 28, 3.4], [hx + 6 + sd * 18, hy - 40, 2], [hx - 4 + sd * 18, hy - 44, 1]], horn, { lift: sd < 0 ? 0.08 : -0.1 }); }
      C.eyes(head, [[hx - 8, hy - 4]], q, eyeM, { r: 2 });
      head.dot(hx - 24, hy + 8 + chew, eyeM, 1);
      head.restore();
      const out = finish([back, body, head], { shadow: [2, 3] });
      C.rim(out, null, { w: 2 });
      return out.over(fx);
    },
  });

  // ---- the Fog Porter -----------------------------------------------------------------------------------------
  KIT.define('cr_fogporter', {
    spec: { w: 260, h: 240, ox: 130, oy: 124, ms: 190, bob: (t) => Math.sin(t / 600) * 2 },
    moves: ['shroud', 'strike'],
    fx: { strike: 'stoneDust' },
    travel: { strike: 0.24 },
    idleOpts: { breath: 0.03, bob: 1 },
    veil: (o) => ({ kind: 'fog', cols: ['#e8ecee', '#d0d8dc', '#9aa4ac'] }),
    audit: { anatomy: 'a porter made of fog, bent under a carrying pole across its shoulders, from each end of which hang the outlines of bundles that are not there; a broad hat of fog, legs braced; the pole is the only solid thing about it', materials: 'layered grey-white fog, densest at the shoulders, its hem drifting; the pole real bamboo, polished where the hands go; the bundles only rope outlines', moves: { strike: 'it swings the pole round at you', shroud: 'it sets its load down and the fog of it spreads' } },
    draw(L, q, o, H, C) {
      const { mat } = C;
      const col = o.col || '#c4ccd0', fog = mat('fog', col, { n: 6, lo: 0.46, l: 0.76, hi: 0.95, alpha: 186, line: false }), thin = mat('thin', col, { n: 4, lo: 0.6, l: 0.8, hi: 0.95, alpha: 104, line: false });
      const bam = mat('bamboo', '#b49a62', { n: 5 }), ropeM = mat('rope', '#c8c0a8', { n: 3, alpha: 200 });
      const back = L.like(), out = L.like(), pole = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 6 + q.puff * 6, bx = -q.lean * 14;
      // the hem drifting at its feet
      for (let i = 0; i < 6; i++) out.ell(bx - 30 + i * 12, 70 + Math.sin(q.ph * 6.28 + i) * 2, 12, 5, thin, 1);
      const P = figure(out, fog, { x: bx, y: 4 + by, h: 1.2, stride: 0.35, lean: 0.35, armF: 2.6, armB: -2.4, bend: -0.6, opt: { lift: 0.05 } }, back);
      // the broad hat of fog
      out.fill(P.head[0] - 24, P.head[1] - 18, P.head[0] + 24, P.head[1] - 2, (x, y) => Math.abs(x - P.head[0]) < 24 - (P.head[1] - 4 - y) * 1.8 && y < P.head[1] - 3, fog, (x, y) => C.clamp(0.66 - (x - P.head[0]) / 80, 0, 0.999));
      // the pole across the shoulders; swung round in a strike
      const ang = -0.08 + q.reach * 0.9 + q.wing * 0.4, cx = P.neck[0] + 2, cy = P.neck[1] + 2, half = 66;
      const a0 = [cx - Math.cos(ang) * half, cy - Math.sin(ang) * half], a1 = [cx + Math.cos(ang) * half, cy + Math.sin(ang) * half];
      pole.seg(a0[0], a0[1], a1[0], a1[1], 4, bam, 0.6);
      for (let x = -half + 10; x < half; x += 22) { const px = cx + Math.cos(ang) * x, py = cy + Math.sin(ang) * x; pole.rect(px, py - 2, 1, 4, bam, 1); }
      // the bundles that are not there: rope outlines only
      for (const [ex, ey] of [a0, a1]) { const sw = Math.sin(q.ph * 6.28) * 2; pole.line(ex, ey, ex + sw, ey + 16, ropeM, 1); for (let a = 0; a < Math.PI * 2; a += 0.12) pole.dot(ex + sw + Math.cos(a) * 14, ey + 30 + Math.sin(a) * 12, ropeM, 1 + (a < Math.PI ? 1 : 0)); pole.line(ex + sw - 14, ey + 30, ex + sw + 14, ey + 30, ropeM, 0); }
      C.outline(pole);
      return back.over(out).over(pole).over(fx);
    },
  });

  // ---- the Blankpage Moth -------------------------------------------------------------------------------------
  KIT.define('cr_moth', {
    spec: { w: 260, h: 220, ox: 130, oy: 108, ms: 120, bob: (t) => Math.sin(t / 360) * 5 },
    moves: ['silence', 'chill'],
    fx: { silence: 'hushWave', chill: 'frostDust' },
    idleOpts: { breath: 0.03, bob: 2, wing: 0.6 },
    audit: { anatomy: 'a moth whose four wings are blank pages: the forewings long leaves of paper with a deckled edge and faint ruled lines, the hindwings smaller and rounder; a soft white furred body, feathered antennae, dark round eyes; a fine dust always falling from it', materials: 'cream paper with a soft lit side and grey ruled lines that fade; white fur; the dust pale and sparse', moves: { silence: 'it folds its pages shut and the sound goes out of the air', chill: 'it fans its pages and a cold dust settles' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const col = o.col || '#eeeae0', paper = mat('paper', col, { n: 6, lo: 0.42, l: 0.84, hi: 0.97 }), fur = mat('fur', '#f4f0e8', { n: 5, lo: 0.42, l: 0.82, hi: 0.97 }), rule = mat('rule', '#a8a49a', { n: 2, line: false });
      const eyeM = mat('eye', '#1a1820', { n: 3, line: false, cols: ['#121018', '#3a3640', '#ffffff'] }), dust = mat('dust', '#f8f4ea', { n: 2, line: false });
      const back = L.like(), body = L.like(), front = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 4, bx = -q.lean * 18, fold = C.clamp(q.squash * 1.8 + (q.eyes === 'shut' ? 0.3 : 0), 0, 1), beat = q.wing;
      const page = (Lr, sd, fore, sh) => {
        const ang = (fore ? -0.55 : 0.35) * sd + beat * 0.35 * (fore ? 1 : 0.6), open = 1 - fold * 0.75, len = (fore ? 74 : 48) * open, wdt = fore ? 38 : 32;
        const sx = bx + (fore ? -2 : 6), sy = by + (fore ? -4 : 8);
        Lr.save().translate(sx, sy).rotate(ang - Math.PI / 2 * sd * 0);
        const flip = sd < 0 ? -1 : 1;
        Lr.fill(-wdt, -len - 2, wdt, len + 2, (x, y) => { const u = (flip * x) / len; return u >= 0 && u <= 1 && Math.abs(y) < wdt * (fore ? 0.55 : 0.75) * Math.sin(Math.min(1, u * 1.15) * Math.PI) ** 0.6 + (u > 0.9 ? (C.hh(Math.floor(y)) - 0.5) * 2 : 0); }, paper, (x, y) => C.clamp(sh - y / 140 - flip * x / 400, 0, 0.999));
        for (let r = -3; r <= 3; r++) Lr.line(flip * 10, r * 6, flip * len * 0.82, r * 6 * 0.8, rule, r % 2 ? 0 : 1);
        Lr.restore();
      };
      // wings out to both sides (screen left is toward the party): far pair behind, near pair in front of the body
      page(back, 1, true, 0.42); page(back, 1, false, 0.38);
      page(front, -1, true, 0.66); page(front, -1, false, 0.6);
      // the body and head, antennae
      C.tube(body, [[bx + 2, by - 10, 7], [bx + 4, by + 10, 7.5], [bx + 6, by + 30, 4]], fur, { lift: 0.06 });
      body.ell(bx, by - 18, 8, 7, fur, ball(bx - 3, by - 21, 8, 7, { lift: 0.06 }));
      for (const sd of [-1, 1]) { const ax = bx - 2 + sd * 3, ay = by - 24; for (let k = 0; k < 8; k++) { const u = k / 7, x = ax + sd * u * 18 - u * 6, y = ay - u * 20; body.seg(x, y, x - 3, y - 2 + sd * 2, 1, fur, 2); } }
      C.eyes(fx, [[bx - 5, by - 18]], q, eyeM, { r: 2 });
      // the dust falling from it
      for (let i = 0; i < 10 + Math.round(q.puff * 10); i++) { const t = (q.ph + C.hh(i)) % 1; fx.dot(bx - 40 + C.hh(i + 8) * 90, by + 20 + t * 60, dust, 1); }
      const out = finish([back, body, front], { shadow: [1, 2] });
      C.rim(out, null, { w: 1 });
      return out.over(fx);
    },
  });

  // ---- the Courier Who Never Arrived (boss) -------------------------------------------------------------------
  KIT.define('cr_courier', {
    spec: { w: 280, h: 300, ox: 140, oy: 170, ms: 200, bob: (t) => Math.sin(t / 650) * 2 },
    moves: ['lie', 'plea'],
    fx: { lie: 'paperCut', plea: 'note' },
    idleOpts: { breath: 0.03, bob: 1 },
    audit: { anatomy: 'a courier standing in a doorway, the snow showing through him: a wide straw hat, a short coat tucked up for running, bare runner\'s legs with wrapped shins, straw sandals; over one shoulder a pole with a letter-box bag tied at its end; he keeps glancing back the way he came', materials: 'a translucent cold blue-white for the body, warmer where the hat\'s straw and the bag\'s cloth still keep their colour; snow specks drifting through', moves: { lie: 'he tells himself what happened (that he ran, that he fell, that a fox misled him), each a little different', plea: 'he holds the bag out, asking someone to take it the last of the way' } },
    draw(L, q, o, H, C) {
      const { mat } = C;
      const col = o.col || '#c8b48a', ghost = mat('ghost', C.mix(col, '#d8e4f0', 0.6), { n: 6, lo: 0.45, l: 0.76, hi: 0.95, alpha: 176, line: false }), straw = mat('straw', col, { n: 5, l: 0.55, alpha: 214 });
      const bag = mat('bag', '#6a5a7a', { n: 5, alpha: 210 }), bam = mat('bamboo', '#a89060', { n: 4, alpha: 220 }), wrap = mat('wrap', '#e8e8f0', { n: 3, alpha: 190, line: false });
      const snow = mat('snow', '#ffffff', { n: 2, line: false }), eyeM = mat('eye', '#3a4a5a', { n: 2, alpha: 220, line: false });
      const back = L.like(), out = L.like(), gear = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 6, bx = -q.lean * 14;
      const glance = q.eyes === 'narrow' ? 1 : 0, offer = q.open + q.reach;
      const P = figure(out, ghost, { x: bx, y: 10 + by, h: 1.6, stride: 0.25 + Math.sin(q.ph * 6.28) * 0.08, lean: 0.2 + offer * 0.3, armF: 0.4 + offer * 1.2, armB: -0.3, bend: 0.4 + offer * 0.4, opt: { lift: 0.08 } }, back);
      // wrapped shins
      for (let k = 0; k < 2; k++) for (let y = 0; y < 5; y++) out.rect(bx - 12 + k * 14 - (k ? 4 : 0), 40 + by + y * 4, 9, 1, wrap, 1);
      // the coat's skirt tucked up
      out.fill(bx - 18, 0 + by, bx + 18, 22 + by, (x, y) => Math.abs(x - bx) < 13 + (y - by) * 0.35, ghost, (x, y) => C.clamp(0.5 - (x - bx) / 60, 0, 0.999));
      // the straw hat, turned back as he glances behind
      const hx = P.head[0] + glance * 4, hy = P.head[1] - 10;
      gear.fill(hx - 34, hy - 16, hx + 34, hy + 6, (x, y) => Math.abs(x - hx) < 34 - (hy + 4 - y) * 2.2 && y < hy + 4, straw, (x, y) => C.clamp(0.66 - (x - hx) / 90 + ((Math.floor(x) + Math.floor(y * 2)) % 4 === 0 ? -0.1 : 0), 0, 0.999));
      if (q.eyes !== 'shut') fx.rect(P.head[0] - 8 + glance * 8, P.head[1] + 1, 3, q.eyes === 'wide' ? 2 : 1, eyeM, 1);
      // the pole over the shoulder with the letter bag at its end, held out when he pleads
      const ang = 2.6 - offer * 0.9, px = P.neck[0] + 4, py = P.neck[1] + 4, ex = px + Math.cos(ang) * 70, ey = py - Math.sin(ang) * 70;
      gear.seg(px + 24, py + 18, ex, ey, 3, bam, 1);
      gear.ell(ex, ey + 12, 12, 14, bag, (x, y) => C.clamp(0.6 - (x - ex) / 40 - (y - ey) / 60, 0, 0.999));
      gear.rect(ex - 10, ey + 2, 20, 3, bag, 1);
      C.outline(gear);
      // snow through him
      for (let i = 0; i < 16; i++) { const t = (q.ph * 0.5 + C.hh(i)) % 1; fx.dot(bx - 80 + C.hh(i + 3) * 160, -120 + t * 220 + by, snow, 1); }
      return back.over(out).over(gear).over(fx);
    },
  });
})();
