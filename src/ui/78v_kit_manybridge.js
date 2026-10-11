/* Creatures C — Manybridge (expansion P16b; F-36's interim creatures given drawings of their own, on the kit in
 * 78u_creature_kit.js). They face the party (screen left); the light comes from the upper left; y = 0 is the body's
 * middle and the ground is near y = 82.
 *   mb.snail   the Lockgate Snail: a heavy shell built like a lock gate (planks in a spiral, iron straps, a capstan on
 *              top) on a slow grey-green body with two long eyestalks; it gathers itself into the shell and butts
 *   mb.beetle  the Abacus Beetle: a beetle whose wing-cases are an abacus frame, beads on rods that slide and click;
 *              a single horn for a blow
 *   mb.tangle  the IOU Tangle: a ball of twine, every strand tied to a slip of paper; two loose strands for arms
 *   mb.barge   the Driftbarge: an empty flat barge on its own slick of water, with eyes painted on the bow, a pole and
 *              a stern lantern
 *   mb.bridge  the Nameless Bridge: the first bridge standing up on its stone piers, its torn-up planks held before it
 *              like a wall, a bridge-lamp for a head and a blank board where its name should be
 *   mp.kuroko  the Prompter's Ghost: a stagehand in black, the gauze over its face, a pole with a paper butterfly
 *   mp.imp     the Loose Type Imp: a squat grey imp scaled with pieces of type, more of them always falling off it
 *   mp.naraku  the Lord of the Understage: a prompter's hood the size of the stage, with ropes, weights and a windlass
 *              under it, and the names it has taken circling it like moths */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const KIT = RB.creatureKit;
  if (!KIT) return;

  // ---- the Lockgate Snail --------------------------------------------------------------------------------------
  KIT.define('mb_snail', {
    spec: { w: 240, h: 200, ox: 124, oy: 106, ms: 220 },
    moves: ['charge', 'strike'],
    fx: { strike: 'stoneDust', charge: 'gather' },
    travel: { strike: 0.16 },
    idleOpts: { breath: 0.03, bob: 0 },
    audit: { anatomy: 'mollusc under a built shell: a long soft foot on the ground, a neck and head that stretch and withdraw, two eyestalks and two short feelers, a shell of planks in a spiral bound with iron straps and a capstan on top', materials: 'wet grey-green body with a gloss streak along the neck and a pale sole; oak planks with grain and lit bevels; iron straps with rivets; the core light through the seams', moves: { strike: 'the head drawn back, then a butt with the whole body behind it', charge: 'it withdraws into the shell, the capstan turns, light shows in the seams' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const col = o.col || '#6e7a6a';
      const body = mat('body', C.mix(col, '#8a9a84', 0.2), { n: 7, l: 0.4 }), sole = mat('sole', C.mix(col, '#e0d8c0', 0.55), { n: 5, line: false });
      const wood = mat('wood', '#7a5a38', { n: 7 }), iron = mat('iron', '#454450', { n: 6, l: 0.32 }), core = mat('core', o.core || '#c8d0b8', { n: 5, l: 0.7, line: false });
      const eyeM = mat('eye', '#1a1a22', { n: 4, line: false, cols: ['#0e0e16', '#24242e', '#3a3a44', '#f4f8ec'] }), mouthM = mat('mouth', '#2a3028', { n: 3, line: false });
      const back = L.like(), mid = L.like(), front = L.like(), fx = L.like();
      const pull = C.clamp(q.squash, 0, 1) * 1.6;                 // withdrawing into the shell
      const lean = q.lean, reach = q.reach;
      const hx = -64 + pull * 34 - lean * 26 - reach * 18, hy = 40 + pull * 14 - q.lift + reach * 6; // the head
      const hr = 14 - pull * 4;
      // one soft body: the tail thinning behind, the long foot under the shell, rising at the front through the neck to
      // the head; flat where it lies on the ground, with a pale wet sole and a frilled skirt along its edge
      const spine = [[74, 79, 4], [52, 77, 8], [22, 74, 11], [-8, 73, 12 - pull * 2], [C.lerp(-34, hx + 14, pull * 0.5), 70, 12 - pull * 2], [C.lerp(-50, hx + 6, 0.5), C.lerp(60, hy + 8, 0.4), 11 - pull * 2], [hx + 4, hy + 4, hr * 0.8], [hx, hy, hr]];
      C.tube(back, spine, body, { clip: (x, y) => y <= 82, gloss: 0.16, lift: -0.08 });
      back.fill(-90, 76, 80, 83, (x, y) => y >= 79.5 && y <= 82 && x < 74 - pull * 4 && x > Math.min(hx, -50) - 6, sole, (x, y) => (y < 81 ? 0.75 : 0.5));
      for (let x = -46; x < 66; x += 3) if (C.hh(x) > 0.35) back.dot(x, 79 + (C.hh(x * 3) > 0.6 ? 0 : -1), sole, 4);
      // the mouth and two short feelers under the head
      if (pull < 0.9) {
        back.seg(hx - hr + 2, hy + 5, hx - hr + 8, hy + 7, 1, mouthM, 0.2);
        for (const [dx, dy] of [[-7, 4], [-2, 7]]) back.path([[hx - hr + 4, hy + 6, 2.4], [hx - hr + 4 + dx * 0.5, hy + 9 + dy * 0.4, 2], [hx - hr + 4 + dx, hy + 11 + dy * 0.6, 1.4]], 2, body, 0.6);
      }
      // the eyestalks (they fold back as it withdraws), with round pale eyes
      const st = [[hx - 5, hy - 9, -12, -30], [hx + 5, hy - 10, 1, -34]];
      for (const [x0, y0, dx, dy] of st) {
        const k = 1 - pull * 0.6, x1 = x0 + dx * k + q.sway * 1.2, y1 = y0 + dy * k;
        C.tube(mid, [[x0, y0, 2.6], [(x0 + x1) / 2 + 2, (y0 + y1) / 2, 1.9], [x1, y1, 1.6]], body, { lift: 0.06 });
        mid.ell(x1, y1, 5.5, 5, body, ball(x1 - 1, y1 - 1, 5.5, 5, { lift: 0.14 }));
        C.eyes(fx, [[x1 - 1, y1]], q, eyeM, { r: 2 });
      }
      // the shell: oak planks wound in a spiral, iron straps across, its mouth toward the body
      const sx = 22, sy = 20 + pull * 2 - q.lift * 0.5, R = 46;
      const spiral = (x, y) => { const dx = x - sx, dy = (y - sy) * 1.08, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx); return { r, a, band: ((r / 9 + a / (Math.PI * 2)) % 1 + 1) % 1 }; };
      front.fill(sx - R, sy - R, sx + R, sy + R, (x, y) => spiral(x, y).r <= R && y < 76, wood, (x, y) => {
        const s = spiral(x, y), lit = -((x - sx) * 0.6 + (y - sy) * 0.8) / R;
        return C.clamp(0.42 + lit * 0.22 + (s.band < 0.12 ? -0.24 : s.band < 0.2 ? 0.1 : 0) + (C.hh(Math.floor(s.a * 9) + Math.floor(s.r / 9) * 11) - 0.5) * 0.12, 0, 0.999);
      });
      // light from inside where it gathers itself: along the spiral's seams
      if (q.glow > 1.05) front.fill(sx - R, sy - R, sx + R, sy + R, (x, y) => { const s = spiral(x, y); return s.r < R - 4 && s.band < 0.07 && C.hh(Math.floor(s.a * 20)) < (q.glow - 1) * 1.2; }, core, 0.75);
      // two iron straps over the shell, riveted, and the capstan on top
      // two iron straps round it like a gate's cross-beams, bending with the curve, riveted
      const strapY = (x, c) => sy + c + (x - sx) * 0.12 + Math.cos(((x - sx) / R) * 1.4) * (c < 0 ? -5 : 5);
      for (const c of [-17, 15]) {
        front.fill(sx - R - 2, sy - R - 2, sx + R + 2, sy + R + 2, (x, y) => Math.hypot(x - sx, y - sy) <= R + 1 && Math.abs(y - strapY(x, c)) < 3.5 && y < 76, iron, (x, y) => C.clamp(0.45 - ((x - sx) * 0.6) / R * 0.25 + (y < strapY(x, c) - 1.5 ? 0.25 : 0), 0, 0.999));
        for (let x = sx - R + 8; x < sx + R - 4; x += 11) { const y = strapY(x, c); if (Math.hypot(x - sx, y - sy) < R - 3) front.dot(Math.round(x), Math.round(y), iron, 5); }
      }
      const cx = sx + 4, cy = sy - R - 4;
      front.rect(cx - 3, cy, 6, 10, iron, 0.4);
      front.ell(cx, cy, 13, 4, wood, (x, y) => C.clamp(0.6 - (x - cx) / 26, 0, 0.999));
      const turn = q.ph * Math.PI * 2 + (q.glow > 1.05 ? q.glow * 2 : 0);
      for (let i = 0; i < 4; i++) { const a = turn + (i / 4) * Math.PI * 2, ex = cx + Math.cos(a) * 17, ey = cy - 2 + Math.sin(a) * 4; front.seg(cx, cy - 2, ex, ey, 2.4, wood, Math.sin(a) > 0 ? 0.35 : 0.6); }
      const out = finish([back, mid, front]);
      C.rim(out, null, { w: 1 });
      // the core's light
      if (q.glow > 1.05) H.glow(fx, sx, sy, 34, 26, o.core || '#c8d0b8', 0.25 * (q.glow - 1), 2);
      return out.over(fx);
    },
  });

  // ---- the Abacus Beetle --------------------------------------------------------------------------------------
  KIT.define('mb_beetle', {
    spec: { w: 260, h: 190, ox: 132, oy: 98, ms: 160 },
    moves: ['charge', 'strike'],
    fx: { strike: 'clawSnap', charge: 'gather' },
    travel: { strike: 0.3 },
    idleOpts: { breath: 0.025, bob: 1 },
    audit: { anatomy: 'insect (armoured): six jointed legs, a domed body, wing-cases that are an abacus frame with rods and beads, a head with one long forward horn and short antennae', materials: 'lacquered brown shell with a hard specular streak; dark wood frame; brass rods; gold beads that catch the light', moves: { strike: 'it rears on its back legs, then drives the horn in', charge: 'the frame lifts, the beads slide and click, a warm light runs along the rods' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const Z = 1.3;
      const shell = mat('shell', o.col || '#7a5a3a', { n: 7, l: 0.38 }), legM = mat('leg', C.mix(o.col || '#7a5a3a', '#201820', 0.45), { n: 5 });
      const frameM = mat('frame', '#4a3020', { n: 6 }), rod = mat('rod', '#b89048', { n: 5, line: false }), bead = mat('bead', o.col2 || '#c8a050', { n: 6, l: 0.6 });
      const eyeM = mat('eye', '#1a1a22', { n: 4, line: false, cols: ['#0e0e16', '#3a1e14', '#f0d890', '#ffffff'] });
      const back = L.like(), body = L.like(), top = L.like(), front = L.like(), fx = L.like();
      const rear = C.clamp(-q.lean, 0, 1) * 10, ram = q.reach;
      const bx = -q.lean * 20, by = 30 - q.lift - rear * 0.8 + q.squash * 6, tilt = q.tilt - rear * 0.03 + ram * 0.05;
      const R = (x, y) => [bx + Z * (x * Math.cos(tilt) - y * Math.sin(tilt)), by + Z * (x * Math.sin(tilt) + y * Math.cos(tilt))];
      const GY = 76;
      // six legs, jointed: the thigh out and a little up to the knee, the shin down to a two-toed foot; the front pair
      // reaching forward, the back pair back; the far three behind the body
      const leg = (Lr, x, dir, far) => {
        const [hx, hy] = R(x, 14), kx = hx + dir * 13 * Z + (far ? 4 : 0), ky = hy - 3 + (far ? 2 : 0), fx2 = kx + dir * 7 + q.sway * (far ? -1 : 1), fy = GY;
        Lr.path([[hx, hy, 4.6], [kx, ky, 4]], 4, legM, far ? 0.25 : 0.55);
        Lr.path([[kx, ky, 3.4], [fx2, fy - 2, 2.6]], 3, legM, far ? 0.2 : 0.45);
        Lr.seg(fx2, fy - 2, fx2 + dir * 3 - 2, fy, 1.6, legM, far ? 0.1 : 0.4); Lr.seg(fx2, fy - 2, fx2 + dir * 3 + 2, fy, 1.6, legM, far ? 0.1 : 0.4);
      };
      for (const [x, dir] of [[-22, -1], [2, -0.25], [24, 0.9]]) leg(back, x + 6, dir, true);
      // the body: the domed shell, the pronotum at the front, the head with its curved horn and antennae
      const [cx, cy] = R(0, 0), rx = 44 * Z, ry = 22 * Z;
      body.ell(cx, cy, rx, ry, shell, ball(cx - 14, cy - 12, rx, ry));
      const [px, py] = R(-34, 2);
      body.ell(px, py, 16 * Z, 16 * Z, shell, ball(px - 5, py - 7, 16 * Z, 16 * Z, { lift: 0.04 }));
      const [hx, hy] = R(-50, 6);
      body.ell(hx, hy, 12 * Z, 10 * Z, shell, ball(hx - 4, hy - 4, 12 * Z, 10 * Z, { lift: -0.06 }));
      const H0 = R(-56, 2), H1 = R(-70 - ram * 8, -6 - ram * 2), H2 = R(-80 - ram * 16, -22 - ram * 4), H3 = R(-76 - ram * 18, -32 - ram * 4);
      C.tube(body, [[H0[0], H0[1], 5.5], [H1[0], H1[1], 4.4], [H2[0], H2[1], 2.8], [H3[0], H3[1], 1.2]], shell, { lift: 0.08, gloss: 0.12 });
      for (const sd of [-1, 1]) { const [ax, ay] = R(-56, 0 + sd * 2); body.path([[ax, ay, 1.6], [ax - 8, ay - 9 - sd * 2, 1.4], [ax - 4 + q.sway, ay - 17, 1.2]], 1.6, legM, 0.4); }
      C.eyes(fx, [R(-53, 5)], q, eyeM, { r: 2 });
      // the wing-cases are the abacus: a dark wood rim following the dome, three curved rods, five beads on each; they
      // lift as the beetle gathers itself
      const lift = C.clamp(q.squash, 0, 1) * 10 + (q.glow > 1.05 ? 4 : 0);
      const ex = cx - 18 * Z, top0 = (x) => cy - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
      const inCase = (x, y) => { const yy = y + lift; return x > ex && ((x - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1 && yy < cy + 6; };
      top.fill(ex, cy - ry - lift - 1, cx + rx, cy + 7, inCase, frameM, (x, y) => C.clamp(0.5 - (x - ex) / (rx * 4) - (y + lift - top0(x)) / 60, 0, 0.999));
      const inField = (x, y) => { const yy = y + lift; return x > ex + 5 && ((x - cx) / (rx - 5)) ** 2 + ((yy - cy) / (ry - 5)) ** 2 <= 1 && yy < cy + 2; };
      top.fill(ex, cy - ry - lift, cx + rx, cy + 3, inField, frameM, 0.08);
      const slide = Math.sin(q.ph * Math.PI * 2) * 5 + (q.glow > 1.05 ? (q.glow - 1) * 12 : 0);
      for (let r = 0; r < 3; r++) {
        const sc = 0.72 - r * 0.26, rodY = (x) => cy - (ry - 5) * sc * Math.sqrt(Math.max(0, 1 - ((x - cx) / (rx - 5)) ** 2)) - lift;
        const xa = ex + 6, xb = cx + (rx - 6) * Math.sqrt(1 - sc * sc * 0.4);
        for (let x = xa; x < xb; x += 1) top.dot(x, Math.round(rodY(x)), rod, q.glow > 1.05 ? 4 : 2);
        for (let i = 0; i < 5; i++) {
          const off = i < 2 ? (r % 2 ? slide : -slide) : 0, x = C.lerp(xa + 4, xb - 4, (i + 0.5) / 5.4 + off / 70), y = rodY(x);
          top.ell(x, y, 3.8, 3.2, bead, ball(x - 1.5, y - 1.5, 3.8, 3.2, { lift: q.glow > 1.05 ? 0.15 : 0 }));
        }
      }
      // the seam where the pronotum meets the wing-cases
      for (let y = Math.round(cy - ry * 0.9 - lift); y < cy + 6; y++) top.dot(ex, y, frameM, 0);
      for (const [x, dir] of [[-22, -1], [2, -0.25], [24, 0.9]]) leg(front, x, dir, false);
      const out = finish([back, body, top, front]);
      C.rim(out, null, { w: 1 });
      if (q.glow > 1.05) H.glow(fx, cx, cy - 14, 52, 22, o.col2 || '#c8a050', 0.22 * (q.glow - 1), 2);
      return out.over(fx);
    },
  });

  // ---- the IOU Tangle -----------------------------------------------------------------------------------------
  KIT.define('mb_tangle', {
    spec: { w: 240, h: 210, ox: 120, oy: 110, ms: 170 },
    moves: ['strike', 'sweep'],
    fx: { strike: 'inkLash', sweep: 'paperFlurry' },
    travel: { strike: 0.2, sweep: 0.12 },
    idleOpts: { breath: 0.04, bob: 1 },
    audit: { anatomy: 'a ball of twine with no front or back: loops crossing over and under, ends trailing to the ground, two long strands for arms, a slip of paper tied to every strand, two bead eyes in the knot', materials: 'brown twine lit on its near loops and dark on its far ones; pale paper slips with ruled lines and a red seal (marks, never writing)', moves: { strike: 'one strand lashes out with its slip at the end', sweep: 'both strands fling round, the slips flying out' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const col = o.col || '#8a6a4a';
      const tw = mat('twine', col, { n: 7, l: 0.4 }), paper = mat('paper', '#e8dcc0', { n: 5 }), seal = mat('seal', '#b04030', { n: 3, line: false });
      const eyeM = mat('eye', '#1a1418', { n: 4, line: false, cols: ['#0e0a0c', '#2a2024', '#4a3a3c', '#fff4e0'] });
      const back = L.like(), core = L.like(), front = L.like(), arms = L.like(), fx = L.like();
      const cx = q.lean * -14, cy = 14 - q.lift + q.squash * 6, R = 38 * (1 - q.squash * 0.2);
      // the knot's dark heart, then the loops wound round it, near halves in front and far halves behind
      core.ell(cx, cy, R, R * 0.92, tw, ball(cx - 8, cy - 10, R, R * 0.92, { lift: -0.18 }));
      for (let i = 0; i < 22; i++) {
        const rot = C.hh(i) * Math.PI + q.ph * 0.6 * (i % 2 ? 1 : -1), a = R * (0.62 + C.hh(i + 7) * 0.48), b = R * (0.22 + C.hh(i + 13) * 0.5), ph = C.hh(i + 9) * 6;
        const ox = cx + (C.hh(i + 3) - 0.5) * 12, oy = cy + (C.hh(i + 5) - 0.5) * 10;
        let prev = null;
        for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.22) {
          const u = Math.cos(t) * a, v = Math.sin(t) * b, x = ox + u * Math.cos(rot) - v * Math.sin(rot), y = oy + u * Math.sin(rot) + v * Math.cos(rot), z = Math.sin(t + ph);
          if (prev) { const lit = C.clamp(0.5 - ((x - cx) * 0.56 + (y - cy) * 0.68) / (R * 2.4) + z * 0.2, 0, 0.999); (z > 0 ? front : back).seg(prev[0], prev[1], x, y, 2.2, tw, lit); }
          prev = [x, y];
        }
      }
      // ends trailing to the ground
      for (const [x0, dx] of [[-14, -10], [6, 4], [20, 14]]) back.path([[cx + x0, cy + R * 0.8, 2], [cx + x0 + dx * 0.5, cy + R + 14, 2], [cx + x0 + dx, 82, 1.8], [cx + x0 + dx + (dx > 0 ? 8 : -8), 82, 1.6]], 2, tw, 0.35);
      // the slips, each on its own thread
      const slip = (Lr, ax, ay, len, ang, i) => {
        const ex = ax + Math.cos(ang) * len, ey = ay + Math.sin(ang) * len, sw = Math.sin(q.ph * Math.PI * 2 + i) * 0.12 + q.sway * 0.05 + (ang - Math.PI / 2) * 0.3;
        Lr.seg(ax, ay, ex, ey, 1, tw, 0.3);
        Lr.save().translate(ex, ey).rotate(sw);
        C.fpoly(Lr, [[-5, 0], [5, 0], [5, 13], [-5, 13]], paper, (x, y) => (x < -3.5 || y < 1.5 ? 0.85 : 0.6));
        Lr.line(-3, 4, 3, 4, paper, 1); Lr.line(-3, 7, 3, 7, paper, 1);
        if (i % 3 === 0) Lr.ell(1.5, 10, 2, 1.6, seal, 1);
        Lr.restore();
      };
      const anchors = [[-0.4, 16], [0.5, 12], [1.2, 20], [1.9, 14], [2.6, 18], [0.1, 22], [1.6, 10]];
      anchors.forEach(([a0, len], i) => { const ang = Math.PI / 2 + (a0 - 1) * 0.9 + q.puff * (i % 2 ? 0.6 : -0.6); slip(i % 2 ? front : back, cx + Math.cos(Math.PI / 2 + (a0 - 1)) * R * 0.9, cy + Math.sin(Math.PI / 2 + (a0 - 1)) * R * 0.8, len + q.puff * 10, ang, i); });
      // the two arms: long loose strands toward the party, a slip at each end; they lash (reach) and fling (wing)
      for (const [k, by] of [[0, -6], [1, 8]]) {
        const ang = Math.PI + 0.25 - k * 0.5 - q.wing * (k ? 0.9 : 1.2) + q.sway * 0.04, len = 40 + q.reach * 46 + Math.abs(q.wing) * 14;
        const bx0 = cx - R * 0.8, by0 = cy + by, tx = bx0 + Math.cos(ang) * len, ty = by0 + Math.sin(ang) * len;
        const mx = (bx0 + tx) / 2 + Math.sin(ang) * 8, my = (by0 + ty) / 2 - Math.cos(ang) * 8 * (k ? -1 : 1);
        arms.path([[bx0, by0, 3], [mx, my, 2.6], [tx, ty, 2]], 2.4, tw, 0.55);
        slip(arms, tx, ty, 4, ang + 0.6, 10 + k);
      }
      const out = finish([back, core, front, arms], { shadow: [1, 2] });
      C.rim(out, null, { w: 1 });
      // two bead eyes peeking out of the knot
      C.eyes(fx, [[cx - 13, cy - 4], [cx - 3, cy - 6]], q, eyeM, { r: 2 });
      return out.over(fx);
    },
  });

  // ---- the Driftbarge -----------------------------------------------------------------------------------------
  KIT.define('mb_barge', {
    spec: { w: 290, h: 200, ox: 146, oy: 112, ms: 240 },
    moves: ['charge', 'flood', 'strike'],
    fx: { strike: 'stoneDust', flood: 'tideWash', charge: 'gather' },
    travel: { strike: 0.26 },
    idleOpts: { breath: 0.02, bob: 1 },
    audit: { anatomy: 'a flat-bottomed barge seen from the side, its bow toward the party: strakes of planking, a heavy gunwale, a square stern, a mooring rope trailing, a punt pole leaning on the stern, a lantern on a post; the eyes painted on its bow are its eyes', materials: 'weathered planks lit along their upper edges, tarred seams, iron fittings; dark water round it with pale ripple lines; the lantern\'s warm light', moves: { strike: 'the bow lifts and it rams forward', flood: 'it dips its bow and the hold\'s water slops out over the gunwale', charge: 'its planks creak, light shows between them, the lantern flares' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const wood = mat('wood', o.col || '#7e5a3e', { n: 7 }), tar = mat('tar', '#2a2420', { n: 4 }), iron = mat('iron', '#454450', { n: 5, l: 0.3 });
      const water = mat('water', '#2a3a44', { n: 5, alpha: 215 }), glowM = mat('lamp', o.core || '#c6a150', { n: 5, l: 0.75, line: false });
      const paint = mat('paint', '#e8e0cc', { n: 4, line: false, cols: ['#141418', '#3a3430', '#d8d0bc', '#f4ecd8'] });
      const pond = L.like(), hull = L.like(), gear = L.like(), wet = L.like(), fx = L.like();
      const tilt = q.tilt - q.reach * 0.1 + q.open * 0.09, dy = -q.lift + q.squash * 3;
      // the slick of water it sits on
      pond.ell(0, 66, 138, 13, water, (x, y) => C.clamp(0.35 + (y < 62 ? 0.15 : 0), 0, 0.999));
      for (let i = 0; i < 9; i++) { const x = -120 + i * 30 + Math.sin(q.ph * 6.28 + i) * 3, y = 62 + (i % 3) * 4; pond.seg(x, y, x + 12 + (i % 2) * 6, y, 1, water, 4); }
      for (const Lr of [hull, gear]) Lr.save().translate(0, 58 + dy).rotate(tilt).translate(0, -58);
      // the hull: strakes from the bow (left, raked up) to the square stern
      const sheer = (x) => 8 + Math.pow((x + 10) / 100, 2) * 10 - (x < -60 ? (x + 60) * 0.25 : 0);
      const hullPts = [[-108, sheer(-108) - 8], [-60, sheer(-60)], [0, sheer(0)], [60, sheer(60)], [92, sheer(92) - 2], [88, 58], [-72, 58]];
      C.fpoly(hull, hullPts, wood, (x, y) => {
        const top = sheer(x), strake = Math.floor((y - top) / 9), f = (y - top) % 9;
        let v = 0.62 - strake * 0.07 - (x > 40 ? 0.05 : 0) + (C.hh(strake * 31 + Math.floor((x + 200) / 26)) - 0.5) * 0.1;
        if (f < 1.2) v = 0.12; else if (f < 2.4) v += 0.14;
        if (q.glow > 1.05 && f < 1.2 && C.hh(Math.floor(x / 6) + strake * 7) < (q.glow - 1) * 1.4) return -1;
        return C.clamp(v, 0, 0.999);
      });
      // light from the hold through the seams as it gathers itself
      if (q.glow > 1.05) C.fpoly(hull, hullPts, glowM, (x, y) => { const top = sheer(x), strake = Math.floor((y - top) / 9), f = (y - top) % 9; return f < 1.2 && C.hh(Math.floor(x / 6) + strake * 7) < (q.glow - 1) * 1.4 ? 0.8 : -1; });
      // the gunwale, the stern post and the iron at the bow
      hull.path([[-108, sheer(-108) - 9, 4], [-60, sheer(-60) - 1, 4], [0, sheer(0) - 1, 4], [60, sheer(60) - 1, 4], [92, sheer(92) - 3, 4]], 4, wood, 0.86);
      hull.rect(84, sheer(92) - 6, 7, 64, wood, 0.3);
      hull.path([[-106, sheer(-106) - 7, 3], [-80, 52, 3]], 3, iron, 0.45);
      // the eyes painted on the bow
      const ex = -82, ey = sheer(-82) + 16;
      if (q.eyes === 'shut') hull.line(ex - 7, ey, ex + 7, ey, paint, 0);
      else {
        const hh2 = q.eyes === 'narrow' ? 2 : q.eyes === 'wide' ? 5 : 4;
        hull.fill(ex - 9, ey - hh2, ex + 9, ey + hh2, (x, y) => Math.abs(y - ey) <= hh2 * (1 - ((x - ex) / 9) ** 2), paint, 3);
        hull.ell(ex - 1, ey, Math.min(3, hh2), Math.min(3, hh2), paint, 0);
        hull.dot(ex - 2, ey - 1, paint, 3);
      }
      // the pole leaning on the stern; the lantern on its post; the rope from the bow
      gear.path([[62, -50 - q.lean * 10, 2.6], [78, 8, 3]], 3, wood, 0.7);
      gear.rect(70, sheer(70) - 22, 3, 20, wood, 0.35);
      gear.fill(64, sheer(70) - 34, 80, sheer(70) - 20, (x, y) => true, iron, (x, y) => (x < 66 || x > 77 || y < sheer(70) - 32 ? 0.3 : -1));
      gear.rect(66, sheer(70) - 31, 10, 9, glowM, Math.min(4, Math.round(1 + q.glow * 1.6)));
      gear.path([[-104, sheer(-104) - 2, 2], [-112, 30, 2], [-110, 52, 2], [-96, 64, 2]], 2, tar, 2);
      const out = finish([pond, hull, gear], { shadow: [2, 2] });
      // the water up its sides, level whatever the hull does; slopping over the bow as it floods
      wet.fill(-140, 54, 140, 76, (x, y) => { const lv = 56 + Math.sin(x / 9 + q.ph * 6.28) * 1.2; return y > lv && Math.abs(x) < 112; }, water, (x, y) => (y < 58 + Math.sin(x / 9 + q.ph * 6.28) ? 0.75 : 0.32));
      if (q.puff > 0.05) for (let i = 0; i < 7; i++) { const x = -96 + i * 5, top = sheer(x) - 6 - q.puff * (10 + C.hh(i) * 10); wet.path([[x, top, 2.4], [x - 6 - q.puff * 6, top + 22, 3], [x - 10 - q.puff * 10, 60, 3.4]], 3, water, 3 + (i % 2)); }
      out.over(wet);
      C.rim(out, null, { w: 1 });
      if (q.glow > 1.05) H.glow(fx, 72, sheer(70) - 26, 26, 22, o.core || '#c6a150', 0.24 * (q.glow - 1), 2);
      return out.over(fx);
    },
  });

  // ---- the Nameless Bridge (boss) ------------------------------------------------------------------------------
  KIT.define('mb_bridge', {
    spec: { w: 300, h: 296, ox: 156, oy: 160, ms: 240 },
    moves: ['flood', 'strike', 'charge'],
    fx: { strike: 'stoneDust', flood: 'tideWash', charge: 'gather' },
    travel: { strike: 0.14 },
    idleOpts: { breath: 0.02, bob: 0 },
    audit: { anatomy: 'a bridge standing up: two stone piers for legs in the water, the span\'s arch between them, the deck for shoulders, beam arms holding a wall of its own torn-up planks before it, a bridge-lamp on a post for a head, and below the lamp a blank board where its name should be', materials: 'dressed river-stone with lit bevels and wet dark feet; old timber; rope lashings; dark water with ripple lines; the lamp\'s pale light', moves: { strike: 'the wall of planks swings out and slams down', flood: 'the river surges up under its arch and over its feet', charge: 'it braces on its piers and the lamp flares' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const stoneM = mat('stone', o.col || '#6a6458', { n: 7 }), wood = mat('wood', '#6e5238', { n: 7 }), rope = mat('rope', '#a8905a', { n: 4 });
      const water = mat('water', '#1e2a32', { n: 5, alpha: 225 }), lamp = mat('lamp', o.core || '#d8ccb0', { n: 5, l: 0.8, line: false }), board = mat('board', '#9a8a68', { n: 5 }), iron = mat('iron', '#3a3a44', { n: 4 });
      const back = L.like(), body = L.like(), wall = L.like(), wet = L.like(), fx = L.like();
      const dy = -q.lift + q.squash * 6, lean = q.lean;
      // the piers: stacked river-stone, tall as legs, the far one darker
      for (const [px, Lr, k] of [[46, back, -1], [-30, body, 0]]) {
        for (let r = 0; r < 7; r++) {
          const y0 = 112 - r * 13, off = (r % 2) * 4 - 2, sh = dy * (r / 7);
          C.stone(Lr, [[px - 17 + off, y0 - 13 + sh], [px + 17 + off, y0 - 13 + sh], [px + 18, y0 + sh * 0.9], [px - 18, y0 + sh * 0.9]], stoneM, { face: 3 + k, bevel: 3 });
        }
      }
      // the span: an arch of wedge stones over the dark between the piers, the deck beam and its rail along the top
      const sy = 14 + dy, ax0 = 8, ay0 = sy + 46;
      for (let i = 0; i < 9; i++) {
        const a0 = Math.PI + (i / 9) * Math.PI, a1 = Math.PI + ((i + 1) / 9) * Math.PI, ri = 34, ro = 50;
        const P = (a, r) => [ax0 + Math.cos(a) * r * 1.25, ay0 + Math.sin(a) * r];
        C.stone(body, [P(a0, ri), P(a0, ro), P(a1, ro), P(a1, ri)], stoneM, { face: 3, bevel: 2 });
      }
      C.fpoly(body, [[-66, sy - 6], [80, sy - 8], [82, sy + 22], [66, sy + 26], [-50, sy + 26], [-68, sy + 20]], stoneM, (x, y) => (Math.hypot((x - ax0) / 1.25, y - ay0) < 50 ? -1 : C.clamp(0.62 - (y - sy) / 80 - (x > 40 ? 0.1 : 0) + (C.hh(Math.floor(x / 10) + Math.floor(y / 7) * 13) - 0.5) * 0.12, 0, 0.999)));
      body.path([[-70, sy - 10, 7], [84, sy - 12, 7]], 7, wood, 0.6);
      for (let x = -64; x < 82; x += 12) body.rect(x, sy - 22, 3, 10, wood, 0.45);
      body.path([[-66, sy - 22, 2.6], [80, sy - 24, 2.6]], 2.6, wood, 0.72);
      // the lamp post and its lamp (its face), the blank name board below the lamp
      const lx = 22 + lean * -10, ly = sy - 92;
      body.rect(lx - 4, ly + 14, 8, 80, wood, 0.5);
      C.fpoly(body, [[lx - 18, ly - 6], [lx + 18, ly - 6], [lx + 13, ly + 16], [lx - 13, ly + 16]], wood, 0.32);
      C.fpoly(body, [[lx - 24, ly - 6], [lx, ly - 22], [lx + 24, ly - 6], [lx + 20, ly - 3], [lx - 20, ly - 3]], wood, (x, y) => (x < lx ? 0.7 : 0.45));
      body.rect(lx - 12, ly - 3, 24, 17, lamp, Math.min(4, Math.round(1 + q.glow * 1.5)));
      body.rect(lx - 1, ly - 3, 2, 17, wood, 1);
      if (q.eyes === 'shut') body.rect(lx - 12, ly - 3, 24, 12, wood, 1);
      else if (q.eyes === 'narrow') { body.rect(lx - 12, ly - 3, 24, 7, wood, 1); body.rect(lx - 12, ly + 9, 24, 5, wood, 1); }
      C.stone(body, [[lx - 15, ly + 30], [lx + 15, ly + 30], [lx + 15, ly + 50], [lx - 15, ly + 50]], board, { face: 2, bevel: 2 });
      // the arms: beams from the deck's ends; the wall of its own planks held across its front
      const wx = -44 - q.reach * 34 + lean * -10, wy = -34 + dy - q.reach * 12, wt = q.reach * -0.2 + q.tilt;
      back.path([[78, sy - 14, 8], [wx + 56, wy + 6, 7]], 7, wood, 0.25);
      wall.save().translate(wx, wy + 40).rotate(wt).translate(-wx, -(wy + 40));
      for (let i = 0; i < 7; i++) { const x = wx - 38 + i * 12, top = wy - 52 + (C.hh(i + 3) - 0.5) * 12, bot = wy + 58 + (C.hh(i) - 0.5) * 8; C.fpoly(wall, [[x, top + 3], [x + 5, top], [x + 11, top + 3], [x + 11, bot], [x, bot]], wood, (X, Y) => C.clamp(0.58 - i * 0.025 - (Y - top) / 460 + (C.hh(i * 13 + Math.floor(Y / 7)) - 0.5) * 0.12 + (X < x + 2 ? 0.14 : 0), 0, 0.999)); for (const ny of [top + 14, bot - 16]) wall.dot(x + 5, ny, iron, 2); }
      for (const yy of [wy - 26, wy + 30]) { wall.path([[wx - 40, yy, 3.4], [wx + 46, yy + 2, 3.4]], 3.4, rope, 2); for (let x = wx - 34; x < wx + 44; x += 12) wall.rect(x, yy - 3, 2, 6, rope, 1); }
      wall.restore();
      body.path([[-64, sy - 12, 8], [wx + 30, wy + 34, 7]], 7, wood, 0.42);
      const out = finish([back, body, wall], { shadow: [3, 3] });
      // the dark water at its feet, rising as it floods
      const lv = 104 - q.open * 18 - q.puff * 8;
      wet.fill(-160, lv - 30, 160, 126, (x, y) => y > lv + Math.sin(x / 11 + q.ph * 6.28) * 2 && (x / 150) ** 2 + ((y - lv - 6) / 16) ** 2 <= 1, water, (x, y) => (y < lv + 3 + Math.sin(x / 11 + q.ph * 6.28) * 2 ? 0.7 : 0.3));
      for (let i = 0; i < 8; i++) { const x = -110 + i * 28, y = lv + 6 + (i % 3) * 4; wet.seg(x, y, x + 12, y, 1, water, 4); }
      if (q.puff > 0.05) for (let i = 0; i < 9; i++) { const x = -40 + i * 10, h = q.puff * (20 + C.hh(i) * 26); wet.path([[x, lv, 3], [x - 4, lv - h, 2.4], [x - 10, lv - h * 0.6, 1.6]], 3, water, 4); }
      out.over(wet);
      C.rim(out, null, { w: 1 });
      H.glow(fx, lx, ly + 5, 26 + q.glow * 8, 20 + q.glow * 6, o.core || '#d8ccb0', 0.16 * q.glow, 2);
      return out.over(fx);
    },
  });

  // ---- the Prompter's Ghost -----------------------------------------------------------------------------------
  KIT.define('mp_kuroko', {
    spec: { w: 210, h: 240, ox: 112, oy: 124, ms: 170, bob: (t) => Math.sin(t / 600) * 3 },
    moves: ['shroud', 'strike'],
    fx: { strike: 'inkLash' },
    travel: { strike: 0.22 },
    idleOpts: { breath: 0.03, bob: 1 },
    veil: (o) => ({ kind: 'mist', cols: ['#2a2830', '#3e3a46', '#141218'] }),
    audit: { anatomy: 'a stagehand in black: a hood with a gauze panel hanging over the face, narrow shoulders, wide sleeves, a long robe that thins to nothing above the floor; it holds a slender pole with a paper butterfly on a wire, as a stagehand works one', materials: 'matt black cloth with violet-grey folds and a cool rim; the gauze translucent over two faint glints; bamboo; white paper', moves: { strike: 'it leans in and flicks the butterfly at you on its pole', shroud: 'the robe billows and black gauze spills from it' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const cloth = mat('cloth', o.col || '#1e1c22', { n: 7, l: 0.2, cool: 270 }), gauze = mat('gauze', '#2a2832', { n: 4, alpha: 200, line: false });
      const bam = mat('bamboo', '#b49a62', { n: 5 }), pap = mat('paper', '#f0ece0', { n: 4 }), eyeM = mat('eye', '#d8d0f0', { n: 3, line: false, cols: ['#3a3448', '#9a90b8', '#e8e2ff'] });
      const back = L.like(), body = L.like(), arm = L.like(), veilL = L.like(), fx = L.like();
      const lean = q.lean, bx = -lean * 16, by = -q.lift + q.squash * 4, flare = q.puff * 12 + q.open * 6;
      // the robe: from the shoulders, widening, its hem drawn out into trailing points above the floor
      const hem = 70 + Math.sin(q.ph * 6.28) * 2;
      const hemAt = (x) => hem - Math.abs(Math.sin((x - bx) / 7 + q.ph * 3)) * 14 - (Math.abs(x - bx) > 30 ? 6 : 0);
      body.fill(-70, -10, 70, 92, (x, y) => { const u = (y - (-6 + by)) / (hem - (-6 + by)); if (u < 0 || y > hemAt(x)) return false; const half = 16 + u * (24 + flare) + Math.sin(u * 9 + q.ph * 6.28) * 2; return Math.abs(x - bx * (1 - u * 0.6) - 2) < half; }, cloth, (x, y) => C.clamp(0.4 - (x - bx) / 140 + (Math.sin((x - bx) / 5 + y / 30) > 0.6 ? 0.12 : 0) - (y > hemAt(x) - 12 ? 0.12 : 0), 0, 0.999));
      // the head in its hood, peaked and falling back; the gauze panel hanging from the brow over the face
      const hx = bx - 2 - lean * 6, hy = -26 + by;
      C.fpoly(back, [[hx - 15, hy + 14], [hx - 16, hy - 6], [hx - 8, hy - 20], [hx + 6, hy - 24], [hx + 20, hy - 18], [hx + 24, hy - 4], [hx + 20, hy + 16]], cloth, (x, y) => C.clamp(0.42 - (x - hx) / 70 - (y - hy) / 120, 0, 0.999));
      back.path([[hx + 18, hy - 16, 6], [hx + 28, hy - 8, 4], [hx + 30, hy + 4, 2]], 4, cloth, 0.22);
      veilL.fill(hx - 15, hy - 10, hx + 9, hy + 26, (x, y) => x > hx - 14 + (y - hy) * 0.04 && x < hx + 8 && y > hy - 9 && y < hy + 24 + Math.sin(x / 2.5 + q.ph * 6.28) * 1.2, gauze, (x, y) => C.clamp(0.55 + ((Math.floor(x) % 4) === 0 ? 0.08 : 0) - (y - hy) / 90 + (x < hx - 10 ? 0.12 : 0), 0, 0.999));
      // the sleeves: the near arm holds the pole up and out toward the party
      const sx = bx - 12, sy = -4 + by, ang = Math.PI + 0.55 - q.reach * 0.55 - q.wing * 0.3, ax = sx + Math.cos(ang) * 30, ay = sy - Math.sin(ang) * 30 + 14;
      arm.path([[sx, sy, 12], [(sx + ax) / 2, (sy + ay) / 2 + 4, 14 + flare * 0.3], [ax, ay, 10]], 12, cloth, 0.38);
      back.path([[bx + 16, sy, 11], [bx + 26, sy + 26, 12], [bx + 18, sy + 44, 9]], 11, cloth, 0.18);
      const pl = 64 + q.reach * 34, pa = Math.PI - 0.6 + q.reach * 0.48 + q.sway * 0.03, tx = ax + Math.cos(pa) * pl, ty = ay - Math.sin(pa) * pl;
      arm.seg(ax - 2, ay, tx, ty, 2, bam, 0.6);
      const bfx = tx - 4, bfy = ty - 6 - Math.sin(q.ph * 12.56) * 2, flap = 0.5 + Math.abs(Math.sin(q.ph * 12.56 + q.reach * 3)) * 0.6;
      arm.seg(tx, ty, bfx, bfy, 1, bam, 0.4);
      for (const sd of [-1, 1]) { C.fpoly(arm, [[bfx, bfy], [bfx - 15 * flap, bfy - 13 * sd], [bfx - 10 * flap, bfy + 2 * sd]], pap, sd < 0 ? 0.75 : 0.55); C.fpoly(arm, [[bfx, bfy], [bfx + 11 * flap, bfy - 11 * sd], [bfx + 8 * flap, bfy + 3 * sd]], pap, sd < 0 ? 0.6 : 0.4); }
      arm.seg(bfx - 1, bfy - 3, bfx + 1, bfy + 3, 1.6, bam, 0.2);
      const out = finish([back, body, arm], { shadow: [2, 2] });
      C.rim(out, null, { w: 1 });
      out.over(veilL);
      // two faint glints behind the gauze
      if (q.eyes !== 'shut') for (const ex of [hx - 7, hx + 1]) { fx.dot(ex, hy + 6, eyeM, q.eyes === 'wide' ? 2 : 1); if (q.eyes !== 'narrow') fx.dot(ex, hy + 5, eyeM, 1); }
      return out.over(fx);
    },
  });

  // ---- the Loose Type Imp -------------------------------------------------------------------------------------
  KIT.define('mp_imp', {
    spec: { w: 210, h: 200, ox: 108, oy: 112, ms: 130 },
    moves: ['strike', 'sweep'],
    fx: { strike: 'stampSeal', sweep: 'shardVolley' },
    travel: { strike: 0.32, sweep: 0.12 },
    idleOpts: { breath: 0.05, bob: 2 },
    audit: { anatomy: 'a squat imp: a big head with two stubby horns and pointed ears, a wide grin, round eyes, a small pot belly, short bowed legs and long arms; pieces of type stuck all over it like scales and more falling off it; a composing stick in one fist', materials: 'ink-grey skin with a lead sheen; type metal (bright face, dark body, the raised face a plain nub, never a letter); a wooden composing stick', moves: { strike: 'it hops in and hits with the composing stick', sweep: 'it shakes itself and type flies off it in a spray' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const skin = mat('skin', o.col || '#5a5e66', { n: 7, l: 0.36 }), metal = mat('metal', '#8a8c94', { n: 5, l: 0.5 }), wood = mat('wood', '#8a6a44', { n: 5 });
      const mouthM = mat('mouth', '#1a1418', { n: 3, line: false, cols: ['#120c10', '#5a2028', '#e8e0d0'] }), eyeM = mat('eye', '#e8c050', { n: 4, line: false, cols: ['#1a1410', '#a08020', '#e8c050', '#fff8d8'] });
      const back = L.like(), body = L.like(), front = L.like(), fx = L.like();
      const hop = Math.max(0, q.reach) * 8, bx = -q.lean * 18, by = -q.lift - hop + q.squash * 5;
      const sort = (Lr, x, y, a, s) => { Lr.save().translate(x, y).rotate(a); Lr.rect(-2.5 * s, -3.5 * s, 5 * s, 7 * s, metal, 1); Lr.rect(-2.5 * s, -3.5 * s, 5 * s, 1.5, metal, 4); Lr.rect(-1, -2.5 * s, 2, 2, metal, 3); Lr.restore(); };
      // legs and the far arm
      for (const [s, Lr] of [[1, back], [-1, body]]) Lr.path([[bx + s * 9, 50 + by, 6], [bx + s * 14, 62 + by * 0.5, 5], [bx + s * 10, 74, 5], [bx + s * 10 - 7, 76, 4]], 5, skin, s > 0 ? 0.25 : 0.45);
      back.path([[bx + 14, 26 + by, 5], [bx + 26, 40 + by + q.wing * -12, 4.4], [bx + 22, 54 + by + q.wing * -20, 4]], 4, skin, 0.2);
      // the body and the big head
      body.ell(bx, 40 + by, 18, 17, skin, ball(bx - 6, 34 + by, 18, 17));
      const hx = bx - 4, hy = 6 + by;
      body.ell(hx, hy, 27, 23, skin, ball(hx - 8, hy - 8, 27, 23));
      for (const s of [-1, 1]) { C.fpoly(back, [[hx + s * 22, hy - 4], [hx + s * 36, hy - 12], [hx + s * 24, hy + 6]], skin, s < 0 ? 0.55 : 0.3); C.fpoly(body, [[hx + s * 9 - 4, hy - 18], [hx + s * 13, hy - 33], [hx + s * 15 + 3, hy - 17]], skin, s < 0 ? 0.62 : 0.4); }
      // type stuck all over it, and more falling off
      for (let i = 0; i < 16; i++) { const a = C.hh(i) * 6.28, r = C.hh(i + 4) * 0.8, onHead = i < 9; const x = (onHead ? hx : bx) + Math.cos(a) * r * (onHead ? 22 : 15), y = (onHead ? hy : 40 + by) + Math.sin(a) * r * (onHead ? 16 : 13); if (onHead && y > hy + 4 && x < hx + 4) continue; sort(front, x, y, (C.hh(i + 9) - 0.5) * 0.8, 1); }
      const fall = q.puff + Math.abs(q.wing) * 0.6;
      for (let i = 0; i < 5 + Math.round(fall * 8); i++) { const t = (q.ph + C.hh(i + 20)) % 1, x = bx + (C.hh(i + 30) - 0.5) * (60 + fall * 70) - fall * 30, y = 20 + by + t * (50 + fall * 20) - fall * 30 * C.hh(i + 40); sort(back, x, y, t * 4 + i, 0.9); }
      // the grin, the eyes
      const gw = 14 + (q.eyes === 'wide' ? 3 : 0);
      front.fill(hx - gw - 6, hy + 4, hx + gw - 6, hy + 16, (x, y) => { const u = (x - (hx - 6)) / gw; return Math.abs(u) <= 1 && y >= hy + 6 + u * u * -3 + (1 - u * u) * 0 && y <= hy + 8 + (1 - u * u) * 6; }, mouthM, (x, y) => (y < hy + 8.5 && Math.floor(x) % 4 !== 0 ? 0.9 : 0.2));
      C.eyes(fx, [[hx - 15, hy - 3], [hx + 1, hy - 4]], q, eyeM, { r: 3 });
      // the near arm with the composing stick
      const ang = Math.PI + 0.9 - q.reach * 1.3 - q.wing * 0.5, ex = bx - 14 + Math.cos(ang) * 22, ey = 28 + by - Math.sin(ang) * 22;
      front.path([[bx - 14, 28 + by, 5], [ex, ey, 4.4]], 4, skin, 0.5);
      front.save().translate(ex, ey).rotate(-ang + Math.PI / 2 + 0.6);
      front.rect(-3, -22, 7, 26, wood, 2); front.rect(-3, -22, 7, 3, wood, 4); front.rect(3, -20, 2, 22, metal, 3);
      front.restore();
      const out = finish([back, body, front], { shadow: [2, 2] });
      C.rim(out, null, { w: 1 });
      return out.over(fx);
    },
  });

  // ---- the Lord of the Understage (boss) ------------------------------------------------------------------------
  KIT.define('mp_naraku', {
    spec: { w: 300, h: 296, ox: 150, oy: 156, ms: 220 },
    moves: ['charge', 'strike', 'flood'],
    fx: { strike: 'stoneDust', charge: 'gather', flood: 'tideWash' },
    floodInk: true,
    travel: { strike: 0.12 },
    idleOpts: { breath: 0.02, bob: 1 },
    audit: { anatomy: 'the Understage risen: a prompter\'s hood as tall as the stage, its opening dark with two lamp eyes; under it the machinery (fly ropes with sandbag weights, a great windlass at its chest); round it, the names it has taken, slips of paper circling like moths round a lamp', materials: 'black cloth in heavy folds with a cold rim; hemp rope; canvas sandbags; a wooden windlass with iron bands; the lamps\' amber; pale slips (marks only)', moves: { strike: 'a weight swings out on its rope at you', flood: 'darkness pours from under the hood across the floor', charge: 'the windlass spins, the ropes run, the lamp eyes flare' } },
    draw(L, q, o, H, C) {
      const { mat, ball, finish } = C;
      const cloth = mat('cloth', o.col || '#3e3028', { n: 7, l: 0.22, cool: 260 }), rope = mat('rope', '#a08858', { n: 5 }), sack = mat('sack', '#8a7a5a', { n: 6 });
      const wood = mat('wood', '#6a4e34', { n: 6 }), iron = mat('iron', '#3a3a44', { n: 5 }), lampM = mat('lamp', o.core || '#c8a050', { n: 5, l: 0.8, line: false }), pap = mat('paper', '#e8e0c8', { n: 4 });
      const ink = mat('ink', '#141016', { n: 4, alpha: 215, line: false });
      const back = L.like(), hood = L.like(), mach = L.like(), front = L.like(), fx = L.like();
      const by = -q.lift + q.squash * 6, bx = -q.lean * 14;
      // the hood: a tall cowl, wide at the shoulders, its folds falling to the floor
      const hemN = (x) => 112 - Math.abs(Math.sin((x - bx) / 11 + q.ph * 2)) * 18;
      hood.fill(-130, -160, 130, 120, (x, y) => { const u = (y + 150 - by) / 262; if (u < 0 || y > hemN(x)) return false; const half = 10 + Math.pow(u, 0.6) * 118 + Math.sin(u * 14 + q.ph * 6.28) * 3 * u; return Math.abs(x - bx * (1 - u) + (1 - u) * (1 - u) * 22) < half; }, cloth, (x, y) => { const u = (y + 150 - by) / 262, fold = Math.sin((x - bx) / 9 + u * 3); return C.clamp(0.34 - (x - bx) / 560 + (fold > 0.55 ? 0.12 : fold < -0.7 ? -0.1 : 0) - u * 0.08 - (y > hemN(x) - 14 ? 0.08 : 0), 0, 0.999); });
      // the cowl's rim round the opening
      hood.fill(-60, -130, 40, -30, (x, y) => { const d = Math.hypot((x - bx + 8) / 33, (y + 82 - by) / 40); return d > 0.86 && d < 1.06 && y < -50 + by; }, cloth, (x, y) => (x < bx - 8 ? 0.62 : 0.4));
      // its opening: the dark face with two lamp eyes
      const fx0 = bx - 8, fy0 = -82 + by;
      hood.ell(fx0, fy0, 28, 34, cloth, 0);
      for (const ox of [-30, -10, 12, 32]) mach.seg(bx + ox, -40 + by, bx + ox * 0.4 - 8, -60 + by, 1.6, rope, 1);
      if (q.eyes !== 'shut') for (const ex of [fx0 - 10, fx0 + 8]) { const hgt = q.eyes === 'narrow' ? 2 : q.eyes === 'wide' ? 6 : 4; hood.ell(ex, fy0 - 2, 4, hgt, lampM, Math.min(4, Math.round(2 + q.glow))); }
      else for (const ex of [fx0 - 10, fx0 + 8]) hood.rect(ex - 4, fy0 - 1, 8, 1, lampM, 1);
      // the machinery under it: the windlass at the chest, ropes running down to sandbag weights
      const wx = bx - 4, wy = -12 + by, turn = q.ph * 6.28 + (q.glow > 1.05 ? (q.glow - 1) * 8 : 0);
      mach.ell(wx, wy, 30, 30, wood, ball(wx - 8, wy - 8, 30, 30));
      mach.ell(wx, wy, 22, 22, wood, 1);
      for (let i = 0; i < 6; i++) { const a = turn + i * 1.047; mach.seg(wx, wy, wx + Math.cos(a) * 40, wy + Math.sin(a) * 40, 5, wood, Math.sin(a) < 0 ? 0.6 : 0.3); }
      mach.ell(wx, wy, 7, 7, iron, ball(wx - 2, wy - 2, 7, 7));
      const weights = [[-56, 0.9, 70], [-28, 1.4, 96], [30, 2.1, 84], [58, 2.8, 62]];
      weights.forEach(([x, ph, len], i) => {
        const sw = Math.sin(q.ph * 6.28 + ph) * 4 + (i === 0 ? -q.reach * 70 : 0), dl = i === 0 ? q.reach * 20 : 0;
        const top = [bx + x, -40 + by], end = [bx + x + sw, top[1] + len + dl - (i === 0 ? q.reach * 40 : 0)];
        (i % 2 ? back : mach).seg(top[0], top[1], end[0], end[1], 2, rope, 2);
        (i % 2 ? back : mach).ell(end[0], end[1] + 10, 9, 12, sack, ball(end[0] - 3, end[1] + 6, 9, 12));
        (i % 2 ? back : mach).rect(end[0] - 4, end[1] - 1, 8, 3, rope, 3);
      });
      const out = finish([back, hood, mach], { shadow: [3, 3] });
      // the names it has taken, circling like moths round a lamp
      for (let i = 0; i < 7; i++) {
        const a = q.ph * 6.28 * (i % 2 ? 1 : -1) + i * 0.9 + (q.glow > 1.05 ? q.glow : 0), rx = 120 + (i % 3) * 10, ry = 46 + (i % 2) * 14;
        const x = bx + Math.cos(a) * rx, y = -60 + by + Math.sin(a) * ry, near = Math.sin(a) > 0;
        if (!near && Math.abs(x - bx) < 90) continue;
        front.save().translate(x, y).rotate(Math.sin(a * 2) * 0.5);
        front.rect(-5, -7, 10, 14, pap, near ? 3 : 1); front.line(-3, -3, 3, -3, pap, 0); front.line(-3, 0, 3, 0, pap, 0); front.line(-3, 3, 1, 3, pap, 0);
        front.restore();
      }
      // darkness pouring out across the floor as it floods
      if (q.puff > 0.05 || q.open > 0.05) { const k = Math.max(q.puff, q.open); front.fill(-150, 90, 150, 128, (x, y) => y > 112 - k * 12 + Math.sin(x / 13 + q.ph * 6.28) * 2 && x < bx + 40 && x > bx - 60 - k * 90, ink, (x, y) => (y < 116 - k * 12 ? 0.8 : 0.3)); }
      out.over(front);
      C.rim(out, null, { w: 1 });
      H.glow(fx, fx0, fy0 - 2, 34 + q.glow * 8, 18, o.core || '#c8a050', 0.12 * q.glow, 2);
      return out.over(fx);
    },
  });
})();
