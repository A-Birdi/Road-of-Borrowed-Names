/* Chapter 6's illustrated sequence: Tōya's four words read in context (`sa.toya_read`,
 * src/content/ch6/52_scenes_climax.js; docs/expressive/SHOTS.md §6). The Heart of the Archive after the Hush has
 * come undone: a floor of paper floating over empty darkness, the white pages settled on it like snow, warm motes
 * in the air. Kasane (they) in their pale hooded robe. Five compositions:
 *   folio   over your shoulder onto Kasane: the folio passes from your hands into theirs; on their line they close
 *           their eyes over it (the rain of the memory falling faint in the dark behind them)
 *   floor   from above, the floor: Kasane's folio open, and your hand laying the key slip (its back up: Tōya's four
 *           hurried words, as marks) and the council's notice beside it; held through the challenge
 *   turned  Kasane with the slip held before them: surprise as they read it; on the line about its front they turn it
 *           over (their own neat hand, the clerk's red stamp); then their eyes close
 *   bell    only when Tōya's bell is carried: your open hand with the little brass bell against the dark; Kasane
 *           takes it up by its cord and rings it once — one ripple of light out through the pages — then holds it
 *           out to you again
 *   decide  Kasane between your shoulder and your companion's: their head lowers (tired), then lifts to face you;
 *           your companion's own small gesture as they answer
 * ch6.ren — the personal questline's insert (SHOTS.md §8.4, `sa.shelf_ren` on its open branch only): see below.
 * People are the game's own drawings (portraits graded into the light; backs from their looks). No letters, kana or
 * kanji are drawn: papers carry ruled marks, scribbles and stamps, never writing. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const Q = RB.seqKit, { R, mk, clamp, ease, lerp, cached, stage } = Q;
  const P = () => RB.pxkit;
  const look = (id) => (RB.content.chars[id] || {}).look || {};
  const step4 = (a) => Math.round(clamp(a, 0, 1) * 4) / 4;
  const hashf = (x, y, k) => (P().hh(x | 0, y | 0, k || 0) % 1000) / 1000;
  // Kasane in the warm light that came back when the Hush let go (from the front and to the left)
  const WARM = { mul: [1, 0.96, 0.91], add: [8, 4, 0], rim: { side: 'l', col: '#ffe4b4', k: [0.42, 0.18], below: 0.85 } };
  const EYE = 54; // a portrait's eye line above its bottom (the horizon of a floor seen standing)
  // Kasane's hands in the same warm light as their face (their portrait is graded by WARM; a hand is not)
  const KSKIN = ['#f2cfb0', '#d8aa88'];

  // ---- the Heart: the dark above the floor, the paper floor, the settled pages, the air ------------------------
  function voidBack(g, w, horizon, s, seed) {
    const rnd = P().rnd(seed || 61), H = Math.max(1, horizon);
    Q.bandsIn(g, 0, 0, w, H, ['#0b0c18', '#0f1020', '#131428', '#181930', '#1e1e36', '#26243c', '#2e2a40'], 0.45);
    // far off in the dark, the Archive's galleries: faint level lines with a few warm points, receding
    for (let i = 0; i < 3; i++) {
      const y = Math.round(H * (0.4 + i * 0.2)), a = 0.04 + i * 0.025;
      g.fillStyle = 'rgba(120,110,150,' + a.toFixed(2) + ')'; g.fillRect(0, y, w, 1);
      for (let x = rnd() * s(30); x < w; x += s(18) + rnd() * s(40)) { g.fillStyle = 'rgba(255,214,160,' + (a * 2.4).toFixed(2) + ')'; g.fillRect(Math.round(x), y - 1, 1, 1); }
    }
    // pages still hanging in the dark, far off, pale and small
    for (let i = 0; i < Math.round(w / 40); i++) { const x = rnd() * w, y = rnd() * H * 0.9; g.fillStyle = 'rgba(220,214,200,' + (0.18 + rnd() * 0.2).toFixed(2) + ')'; g.fillRect(Math.round(x), Math.round(y), Math.max(2, s(4)), Math.max(1, s(2))); }
  }
  // the floor of paper, seen standing (its horizon at the eye line): great sheets, a few seams, the edge's lip
  function paperFloor(g, w, h, yF, s, vx, light) {
    const p = P(), L = p.layer(w, h), M = p.mat('#ddd6c4', { n: 7, at: 4, step: 0.06 });
    const depth = (y) => Math.max(0.02, (y - yF) / Math.max(1, h - yF));
    L.fill(0, yF, w, h, (x, y) => y >= yF, M, (x, y) => {
      const d = depth(y), row = Math.log(d * 7 + 1) * 2.6, col = (x - vx) / (d * s(170) + 1);
      const seam = Math.abs(row - Math.round(row)) < 0.03 / (d + 0.15) || Math.abs(col - Math.round(col)) < 0.008 / (d + 0.05);
      return clamp(0.32 + d * 0.32 + (light ? light(x, y) : 0) - (seam ? 0.1 : 0), 0, 0.999);
    });
    L.outline();
    g.drawImage(L.canvas(), 0, 0);
    g.fillStyle = 'rgba(255,240,214,0.45)'; g.fillRect(0, yF, w, 1);
    for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(12,12,26,0.13)'; g.fillRect(0, yF, w, Math.round((h - yF) * (0.08 + i * 0.07))); }
  }
  // the settled pages: small sheets lying at angles, a shadow under each (y0..y1; size grows toward us)
  function settledPages(g, w, y0, y1, n, s, seed, sizeAt) {
    const rnd = P().rnd(seed || 9);
    for (let i = 0; i < n; i++) {
      const y = lerp(y0, y1, Math.pow(rnd(), 0.8)), d = (y - y0) / Math.max(1, y1 - y0), x = rnd() * w;
      const pw = Math.max(3, Math.round(sizeAt ? sizeAt(d) : lerp(s(5), s(20), d))), ph = Math.max(2, Math.round(pw * (0.3 + rnd() * 0.22))), a = (rnd() - 0.5) * 0.9;
      g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(a);
      g.fillStyle = 'rgba(60,50,40,0.16)'; g.fillRect(-Math.round(pw / 2) + 1, -Math.round(ph / 2) + 1, pw, ph);
      g.fillStyle = i % 4 ? '#f6f2e6' : '#ebe5d6'; g.fillRect(-Math.round(pw / 2), -Math.round(ph / 2), pw, ph);
      g.fillStyle = '#d4ccbc'; g.fillRect(-Math.round(pw / 2), Math.round(ph / 2) - 1, pw, 1);
      g.restore();
    }
  }
  // warm motes in the air drifting up; a page or two still coming down
  function airLife(c, w, h, t, still, n, seed, fall) {
    const rnd = P().rnd(seed || 33);
    for (let i = 0; i < n; i++) {
      const x0 = rnd() * w, y0 = rnd() * h, sp = 0.5 + rnd();
      const y = still ? y0 : (((y0 - (t / (16000 / sp)) * h) % h) + h) % h, x = x0 + (still ? 0 : Math.sin(t / 2200 + i) * 4);
      const a = still ? 0.45 : 0.25 + 0.3 * ((Math.sin(t / 900 + i * 1.7) + 1) / 2);
      c.fillStyle = 'rgba(255,222,170,' + a.toFixed(2) + ')'; c.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    if (fall && !still) {
      for (let i = 0; i < fall; i++) {
        const f = ((t / (12000 + i * 3000)) + hashf(i, 5, 2)) % 1, x = hashf(i, 6, 2) * w + Math.sin(f * 9 + i) * 10, y = lerp(-10, h * 0.95, f);
        const flip = Math.round(Math.abs(Math.sin(f * 14 + i)) * 3) + 1;
        c.fillStyle = 'rgba(246,242,232,0.8)'; c.fillRect(Math.round(x), Math.round(y), 5, flip); c.fillStyle = 'rgba(190,182,166,0.8)'; c.fillRect(Math.round(x), Math.round(y) + flip, 5, 1);
      }
    }
  }
  // a medium shot's backdrop: the dark, the floor from the eye line down, its pages
  function heartBack(G, key, extra) {
    return cached('ch6.' + key + '|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, horizon } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      voidBack(g, w, horizon, s, 61);
      paperFloor(g, w, h, horizon, s, Math.round(w * 0.5), (x) => 0.1 * (1 - Math.abs(x - G.kx) / w));
      settledPages(g, w, horizon + 2, h, Math.round(w / 14), s, 17);
      if (extra) extra(g);
      return { cv };
    });
  }

  // Kasane kneeling on the paper floor: their portrait, and below it the pale robe pooled round their knees (from
  // the portrait's own lowest row, widening to the floor, lit from the left), a soft shadow where it meets the floor.
  // (x, y): the portrait's bottom centre; returns where the floor is under them
  const KNEEL = 50;
  function robe(grade) {
    return Q.small('ch6.robe|' + JSON.stringify(grade || null), () => {
      const b = Q.bust('kasane', 'neutral', null, grade, false, 0);
      if (!b) return null;
      const src = b.cv.getContext('2d', { willReadFrequently: true }).getImageData(0, b.cv.height - 3, b.cv.width, 1).data;
      let x0 = b.cv.width, x1 = 0;
      for (let x = 0; x < b.cv.width; x++) if (src[x * 4 + 3] > 200) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
      if (x1 <= x0) return null;
      const p = P(), W = b.cv.width + 60, H = KNEEL + 8, L = p.layer(W, H), ox = 30, sw = x1 - x0;
      const lk = look('kasane'), base = (lk.cloth || ['#d8d4c8'])[0];
      const M = p.mat(base, { n: 6, at: 3, step: 0.07 });
      const cx = ox + (x0 + x1) / 2;
      // the torso continuing down, the knees spreading in front (rounded at the floor)
      const half = (y) => { const f = y / KNEEL; return sw / 2 * (1 + 0.18 * f + (f > 0.5 ? 0.5 * Math.sin(Math.min(1, (f - 0.5) / 0.3) * Math.PI / 2) : 0)) - (f > 0.86 ? ((f - 0.86) / 0.14) ** 2 * sw * 0.18 : 0); };
      L.fill(0, 0, W, KNEEL, (x, y) => Math.abs(x - cx) <= half(y), M, (x, y) => { const u = (x - cx) / Math.max(1, half(y)), f = y / KNEEL; return clamp(0.6 - u * 0.28 - f * 0.1 + (f > 0.55 ? 0.1 : 0) + (Math.abs(u) > 0.92 ? -0.14 : 0), 0, 0.999); });
      // the sleeves: the arms down the sides and forward to the lap, a shade darker, their inner edges a fold
      const sl = (side) => (x, y) => { const f = y / KNEEL; if (f > 0.66) return false; const outer = cx + side * half(y), inner = cx + side * lerp(sw * 0.3, sw * 0.12, f / 0.66); return side < 0 ? x >= outer && x <= inner : x <= outer && x >= inner; };
      for (const side of [-1, 1]) L.recolor(sl(side), M, M, (x, y) => clamp(0.48 - side * 0.12 - (y / KNEEL) * 0.08, 0, 0.999));
      for (const side of [-1, 1]) L.line(cx + side * sw * 0.3, 2, cx + side * sw * 0.12, KNEEL * 0.66, M, 1);
      // the lap: the knees' fold across, a shadow under the hands
      L.line(cx - half(KNEEL * 0.66) + 2, KNEEL * 0.66, cx + half(KNEEL * 0.66) - 2, KNEEL * 0.66, M, 2);
      L.rect(cx - sw * 0.14, KNEEL * 0.6, sw * 0.28, 2, M, 1);
      L.outline();
      const cv = L.canvas(), g = cv.getContext('2d');
      g.globalCompositeOperation = 'source-atop';
      if (grade && grade.mul) { g.fillStyle = 'rgba(255,228,180,0.08)'; g.fillRect(0, 0, W, H); }
      // the top rows: the portrait's own lowest row continued, so the join does not show
      g.globalCompositeOperation = 'source-over';
      for (let x = 0; x < b.cv.width; x++) { const o = x * 4; if (src[o + 3] < 200) continue; g.fillStyle = 'rgb(' + src[o] + ',' + src[o + 1] + ',' + src[o + 2] + ')'; g.fillRect(ox + x, 0, 1, 4); }
      return { cv, ax: ox + (b.cv.width >> 1), ay: 0, w: W, h: H, sw };
    });
  }
  function kasaneKneeling(c, x, y, expr, fr, grade) {
    const r = robe(grade);
    if (r) {
      c.fillStyle = 'rgba(40,30,30,0.22)'; P().disc(c, x, y + KNEEL - 2, Math.round(r.sw * 0.9), 4);
      c.drawImage(r.cv, x - r.ax, y - 2);
    }
    const kb = Q.bust('kasane', expr, fr, grade, false, 0);
    if (kb) c.drawImage(kb.cv, x - kb.ax, y - kb.ay);
    return y + KNEEL;
  }

  // ---- the papers (marks only: never writing) -------------------------------------------------------------------
  // a neat hand: columns of small even dashes, right to left
  function neat(c, x0, y0, w, h, k, seed, col) {
    c.fillStyle = col || '#6a6476';
    const cw = Math.max(3, Math.round(5 * k)), lh = Math.max(2, Math.round(3 * k)), gap = Math.max(1, Math.round(1.6 * k));
    for (let cx = x0 + w - cw; cx >= x0; cx -= cw) {
      let y = y0 + Math.round(hashf(cx, 1, seed) * 2 * k);
      while (y + lh < y0 + h) { const l = Math.max(1, Math.round(lh * (0.6 + hashf(cx, y, seed) * 0.7))); c.fillRect(cx, y, 1, l); y += l + gap; }
    }
  }
  // a hurried hand: one dark slanted blot per word, ragged at its edges, with the pen's tail (seen from a little way
  // off, writing too quick and close to read — never a character)
  function scribbles(c, cx, y0, n, k, seed) {
    c.fillStyle = '#26222e';
    const bw = Math.max(3, Math.round(6.5 * k)), bh = Math.max(2, Math.round(5.5 * k));
    for (let i = 0; i < n; i++) {
      const yy = y0 + Math.round(i * 9.5 * k);
      for (let y = 0; y < bh; y++) {
        const sh = Math.round((bh - y) * 0.45), l = Math.round(hashf(i, y, seed) * 1.6), r = Math.round(hashf(i, y + 9, seed) * 1.6);
        c.fillRect(cx - Math.round(bw / 2) + sh + l, yy + y, Math.max(1, bw - l - r), 1);
      }
      c.fillRect(cx + Math.round(bw / 2) - 1, yy + bh, Math.max(1, Math.round(k)), Math.max(1, Math.round(2 * k)));
    }
  }
  // Kasane's first folio: card covers tied with a red cord; open, two pages in a neat hand
  function folio(c, x, y, k, open, ang) {
    const W = Math.round(36 * k), H = Math.round(46 * k);
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(ang || 0);
    c.fillStyle = 'rgba(40,30,24,0.25)'; c.fillRect(-W / 2 + 2, -H / 2 + 3, open ? W * 2 : W, H);
    if (!open) {
      c.fillStyle = '#98a0b4'; c.fillRect(-W / 2, -H / 2, W, H);
      c.fillStyle = '#b4bccc'; c.fillRect(-W / 2, -H / 2, W, Math.max(1, Math.round(k)));
      c.fillStyle = '#767e94'; c.fillRect(W / 2 - Math.max(1, Math.round(k)), -H / 2, Math.max(1, Math.round(k)), H); c.fillRect(-W / 2, H / 2 - 1, W, 1);
      c.fillStyle = '#ebe4d2'; c.fillRect(-W / 2 + Math.round(4 * k), -H / 2 + Math.round(5 * k), Math.round(11 * k), Math.round(18 * k)); // its label, blank
      c.fillStyle = '#8a3434'; c.fillRect(-W / 2, -Math.max(1, Math.round(k)), W, Math.max(1, Math.round(1.5 * k))); c.fillRect(Math.round(W * 0.2), -Math.round(3 * k), Math.max(2, Math.round(2.5 * k)), Math.max(2, Math.round(5 * k)));
    } else {
      for (const side of [0, 1]) {
        const x0 = -W / 2 + side * W - (side ? 0 : W / 2), xx = side ? 0 : -W;
        c.fillStyle = side ? '#ece6d6' : '#f2ede0'; c.fillRect(xx, -H / 2, W, H);
        c.fillStyle = '#cfc6b2'; c.fillRect(side ? 0 : -1, -H / 2, 1, H); c.fillRect(xx, H / 2 - 1, W, 1);
        neat(c, xx + Math.round(3 * k), -H / 2 + Math.round(4 * k), W - Math.round(6 * k), H - Math.round(8 * k), k, 11 + side);
        void x0;
      }
      c.fillStyle = '#8a3434'; c.fillRect(-Math.round(2 * k), H / 2 - Math.round(1 * k), Math.max(1, Math.round(1.4 * k)), Math.round(10 * k));
    }
    c.restore();
  }
  // the bell tower's key slip: a stiff narrow tag, a hole, a string. back: Tōya's four hurried words (scribbles);
  // front: Kasane's neat hand and the clerk's red stamp. sx: its turn (1 → 0 → 1 as it is turned over)
  function slip(c, x, y, k, side, ang, sx, str) {
    const W = Math.round(18 * k), H = Math.round(54 * k), f = sx == null ? 1 : sx;
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(ang || 0); c.scale(Math.max(0.06, Math.abs(f)), 1);
    c.fillStyle = 'rgba(40,30,24,0.28)'; c.fillRect(-W / 2 + 2, -H / 2 + 3, W, H);
    c.fillStyle = side === 'back' ? '#e4dabd' : '#ece4cc'; c.fillRect(-W / 2, -H / 2, W, H);
    c.fillStyle = '#cbbf9f'; c.fillRect(-W / 2, H / 2 - 1, W, 1); c.fillRect(W / 2 - 1, -H / 2, 1, H);
    c.fillStyle = '#b4a888'; c.fillRect(-Math.round(3 * k), -H / 2 + Math.round(3 * k), Math.round(6 * k), Math.round(6 * k));
    c.fillStyle = '#2a2430'; c.fillRect(-Math.round(1.5 * k), -H / 2 + Math.round(4.5 * k), Math.max(1, Math.round(3 * k)), Math.max(1, Math.round(3 * k)));
    c.fillStyle = '#a8564a';
    if (str === 'down') { for (let i = 0; i < Math.round(16 * k); i++) c.fillRect(-Math.round(2 * k) - Math.round(Math.sin(i / (6 * k)) * 3 * k) - Math.round(i * 0.35), -H / 2 + Math.round(6 * k) + i, Math.max(1, Math.round(1.2 * k)), 1); }
    else c.fillRect(-Math.max(1, Math.round(0.6 * k)), -H / 2 - Math.round(10 * k), Math.max(1, Math.round(1.2 * k)), Math.round(14 * k));
    if (side === 'back') scribbles(c, 0, -H / 2 + Math.round(13 * k), 4, k, 5);
    else {
      neat(c, -Math.round(6 * k), -H / 2 + Math.round(12 * k), Math.round(12 * k), Math.round(26 * k), k, 7, '#56526a');
      c.fillStyle = '#b4443a'; c.fillRect(-Math.round(4 * k), H / 2 - Math.round(12 * k), Math.round(8 * k), Math.round(8 * k));
      c.fillStyle = '#ece4cc'; c.fillRect(-Math.round(2 * k), H / 2 - Math.round(10 * k), Math.round(4 * k), Math.max(1, Math.round(k))); c.fillRect(-Math.round(2 * k), H / 2 - Math.round(7 * k), Math.max(1, Math.round(k)), Math.round(3 * k));
    }
    c.restore();
  }
  // the council's notice, posted on the night of the flood: water-stained, columns of print, a red seal
  function notice(c, x, y, k, ang) {
    const W = Math.round(52 * k), H = Math.round(40 * k);
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(ang || 0);
    c.fillStyle = 'rgba(40,30,24,0.25)'; c.fillRect(-W / 2 + 2, -H / 2 + 3, W, H);
    c.fillStyle = '#e0d6be'; c.fillRect(-W / 2, -H / 2, W, H);
    neat(c, -W / 2 + Math.round(14 * k), -H / 2 + Math.round(4 * k), W - Math.round(18 * k), H - Math.round(8 * k), k, 13, '#54505e');
    // the water's stain along its lower half, a tide line
    c.fillStyle = 'rgba(150,118,76,0.26)'; c.fillRect(-W / 2, Math.round(H * 0.12), W, Math.round(H * 0.38));
    c.fillStyle = 'rgba(126,96,60,0.45)'; for (let i = 0; i < W; i += 2) c.fillRect(-W / 2 + i, Math.round(H * 0.12 + Math.sin(i * 0.45) * k), 2, 1);
    c.fillStyle = '#a83a32'; c.fillRect(-W / 2 + Math.round(4 * k), H / 2 - Math.round(12 * k), Math.round(8 * k), Math.round(8 * k));
    c.fillStyle = '#e0d6be'; c.fillRect(-W / 2 + Math.round(6 * k), H / 2 - Math.round(10 * k), Math.round(4 * k), Math.max(1, Math.round(k)));
    c.restore();
  }
  // Tōya's messenger's bell: a little round brass bell with its slit, hanging from a red-and-white cord
  function suzu(c, x, y, r, swing, glint) {
    const p = P();
    const B = Q.small('ch6.suzu|' + r, () => {
      const W = r * 2 + 6, H2 = r * 2 + Math.max(4, Math.round(r * 0.6)) + 6, L2 = p.layer(W, H2), cx = W / 2, top = 2, cy = top + Math.max(2, Math.round(r * 0.5)) + r;
      const M = p.mat('#c8a24e', { n: 7, at: 3, step: 0.08 }), D = p.mat('#3a2a18', { n: 3, at: 1 });
      L2.rect(cx - Math.max(1, Math.round(r * 0.18)), top, Math.max(2, Math.round(r * 0.36)), Math.max(2, Math.round(r * 0.6)), M, 3);
      L2.ell(cx, cy, r, r, M, p.sphere(cx - r * 0.35, cy - r * 0.35, r, r, { amb: 0.22 }));
      L2.rect(cx - r * 0.66, cy + Math.max(1, Math.round(r * 0.18)), r * 1.32, Math.max(1, Math.round(r * 0.16)), D, 1);
      L2.ell(cx - r * 0.66, cy + r * 0.26, Math.max(1, r * 0.17), Math.max(1, r * 0.17), D, 1); L2.ell(cx + r * 0.66, cy + r * 0.26, Math.max(1, r * 0.17), Math.max(1, r * 0.17), D, 1);
      L2.outline();
      return { cv: L2.canvas(), ax: Math.round(cx), ay: top };
    });
    const cord = Math.round(r * 2.6);
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(swing || 0);
    for (let i = 0; i < cord; i++) { c.fillStyle = (i >> 1) % 2 ? '#ece4dc' : '#b23a34'; c.fillRect(-1, i, 2, 1); }
    c.drawImage(B.cv, -B.ax, cord - B.ay);
    if (glint) { c.fillStyle = 'rgba(255,250,220,' + glint.toFixed(2) + ')'; c.fillRect(-Math.round(r * 0.4), cord + Math.round(r * 0.6), 2, 2); }
    c.restore();
    return { bx: x, by: y + cord + r };
  }

  // ---- toya · folio: over your shoulder onto Kasane -------------------------------------------------------------
  function geomFolio(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const land = lay === 'land', narrow = lay === 'narrow';
    // Kasane kneeling (the portrait's bottom at ky, the robe below it to the floor); in a phone's band, their face
    // stays in it and the rest goes under the sheet
    const kx = Math.round(w * (narrow ? 0.6 : land ? 0.62 : 0.6));
    const ky = Math.round(narrow ? Math.min(vb * 0.58, h * 0.5) : land ? clamp(vb + 24, 90, 130) : clamp(vb - KNEEL - s(8), 100, h));
    const horizon = ky - EYE;
    const bw = Math.round(clamp(s(narrow ? 176 : 160), 90, 230));
    const bx = Math.round(w * (narrow ? 0.22 : land ? 0.2 : 0.27)), by = Math.round(narrow ? vb + s(40) : land ? vb + 56 : vb + s(56));
    const k = clamp(S.Z * 0.8, 0.6, 1.1);
    return Object.assign(S, { land, narrow, kx, ky, horizon, bw, bx, by, k });
  }
  const folioShot = {
    phases: [['hand', 900], ['close', 700]],
    safe: { wide: 'Kasane\'s face, the folio and the hands in the top 60 %', narrow: 'Kasane above, the folio between you', land: 'Kasane\'s face' },
    draw(c, w, h, t, st) {
      const G = geomFolio(w, h, st.vb), { s, kx, ky, k } = G, still = st.still;
      c.drawImage(heartBack(G, 'folio').cv, 0, 0);
      const kh = st.at('hand'), kc = st.at('close');
      // the memory the folio holds: rain, faint, falling in the dark behind (heard, as the line says)
      if (kh > 0.4) {
        const a = step4((kh - 0.4) / 0.6) * 0.16;
        c.fillStyle = 'rgba(196,206,236,' + a.toFixed(2) + ')';
        for (let i = 0; i < 46; i++) { const x = hashf(i, 9, 1) * w, y0 = hashf(i, 8, 1) * G.horizon, f = still ? 0 : ((t / 1100) + hashf(i, 7, 1)) % 1; c.fillRect(Math.round(x), Math.round((y0 + f * G.horizon) % Math.max(1, G.horizon - s(6))), 1, Math.max(2, s(7))); }
      }
      airLife(c, w, G.horizon + s(30), t, still, 26, 33, 2);
      // Kasane: their eyes on the folio as it comes to them; closed over it on their line
      kasaneKneeling(c, kx, ky, kc > 0.3 ? 'closed' : 'neutral', kc > 0.3 ? { head: [0, 1] } : { look: [-1, 1] }, WARM);
      // the folio: from your hands into theirs, then held in their lap
      const pc = st.cast.pc || {}, pskin = Q.skinOf(pc), psl = Q.clothOf(pc)[0];
      const kskin = KSKIN, ksl = '#b8b4a8';
      const e = ease(kh);
      const fx0 = G.bx + Math.round(G.bw * 0.48), fy0 = Math.min(G.vb - s(14), ky + s(34));
      const fx1 = kx - s(2), fy1 = ky + s(16) + Math.round(ease(kc) * s(2));
      const fx = lerp(fx0, fx1, e), fy = lerp(fy0, fy1, e) - Math.sin(Math.PI * e) * s(8);
      folio(c, fx, fy, k, false, lerp(-0.3, 0.04, e));
      // their hands, reaching to take it, then holding it
      const reach = ease(clamp(kh * 1.5 - 0.2, 0, 1));
      for (const [side, dx] of [['L', -1], ['R', 1]]) {
        const hd = Q.hand({ size: Math.round(9 * k / 0.8), pose: reach > 0.6 ? 'pinch' : 'offer', side, angle: dx < 0 ? Math.PI * 0.08 : Math.PI * 0.92, skin: kskin, sleeve: ksl });
        if (hd && reach > 0) c.drawImage(hd.cv, Math.round(lerp(kx + dx * s(28), fx + dx * s(16) * k, reach) - hd.ax), Math.round(lerp(ky + s(30), fy + s(4), reach) - hd.ay));
      }
      // your hand under it, then letting go and drawing back
      const back = ease(clamp((kh - 0.6) / 0.4, 0, 1));
      const ph = Q.hand({ size: Math.round(11 * k / 0.8), pose: back > 0.2 ? 'rest' : 'offer', side: 'R', angle: -0.4, skin: pskin, sleeve: psl });
      if (ph) c.drawImage(ph.cv, Math.round(lerp(fx - s(14) * k, fx0 - s(24), back) - ph.ax), Math.round(lerp(fy + s(14) * k, G.vb + s(24), back) - ph.ay));
      // you, from behind, at the left, kneeling across from them
      const yb = Q.back(pc, G.bw, { light: 'r' });
      if (yb) c.drawImage(yb.cv, G.bx - yb.ax, G.by - yb.ay);
    },
    focus(w, h, vb) { const G = geomFolio(w, h, vb); if (G.land) return { x: G.kx - 30, y: G.ky - 82, w: 60, h: Math.min(50, vb + 2 - (G.ky - 82)) }; return { x: G.kx - G.s(36), y: G.ky - 88, w: G.s(36) + 34, h: Math.min(vb, G.ky + G.s(36)) - (G.ky - 88) }; },
  };

  // ---- toya · floor: from above, the papers laid out ---------------------------------------------------------------
  function geomFloor(w, h, vb) {
    const S = stage(w, h, vb), { lay } = S;
    const land = lay === 'land', narrow = lay === 'narrow';
    const k = clamp(land ? Math.min(w / 250, (vb - 6) / 60) : narrow ? Math.min(w / 130, vb / 300) : Math.min(w / 230, vb / 104), 0.8, 2.8);
    const cy = Math.round(land ? vb * 0.5 + 2 : vb * (narrow ? 0.46 : 0.48));
    const cx = Math.round(w * 0.5);
    // where each paper lies: the folio at the left, the slip in the middle, the notice at the right (stacked on a phone)
    const at = narrow
      ? { folio: [cx, cy - Math.round(56 * k)], slip: [cx - Math.round(30 * k), cy + Math.round(30 * k)], notice: [cx + Math.round(22 * k), cy + Math.round(34 * k)] }
      : { folio: [cx - Math.round(64 * k), cy], slip: [cx + Math.round(16 * k), cy - Math.round(2 * k)], notice: [cx + Math.round(66 * k), cy + Math.round(4 * k)] };
    return Object.assign(S, { land, narrow, k, cx, cy, at });
  }
  function floorStatic(G) {
    return cached('ch6.floor|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, k } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), L = p.layer(w, h), M = p.mat('#ddd6c4', { n: 7, at: 4, step: 0.06 });
      // the paper floor straight down: great sheets edge to edge; the light warm from the left
      const cw = Math.round(96 * k), chh = Math.round(120 * k);
      L.rect(0, 0, w, h, M, (x, y) => clamp(0.56 - x / w * 0.14 + (((x + Math.round(cw * 0.3)) % cw) < 1 || ((y + Math.round(chh * 0.6)) % chh) < 1 ? -0.12 : 0) , 0, 0.999));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      settledPages(g, w, -s(10), h, Math.round((w * h) / (2200 * k)), s, 41, () => 13 * k);
      return { cv };
    });
  }
  const floorShot = {
    phases: [['lay', 900]],
    safe: { wide: 'the three papers central above the sheet', narrow: 'the folio above, the slip and the notice under it', land: 'the papers in the band' },
    draw(c, w, h, t, st) {
      const G = geomFloor(w, h, st.vb), { s, k, at } = G, still = st.still;
      c.drawImage(floorStatic(G).cv, 0, 0);
      const kl = st.at('lay');
      // Kasane's folio, open, already lying there
      folio(c, at.folio[0], at.folio[1], k, true, -0.03);
      // your hand bringing the key slip (its back up) and the notice down beside it, the slip first
      const e1 = ease(clamp(kl / 0.6, 0, 1)), e2 = ease(clamp((kl - 0.3) / 0.7, 0, 1));
      const off = Math.round(G.vb * 0.6);
      slip(c, at.slip[0], lerp(at.slip[1] + off, at.slip[1], e1), k, 'back', lerp(0.3, 0.05, e1));
      notice(c, at.notice[0], lerp(at.notice[1] + off, at.notice[1], e2), k, lerp(-0.3, -0.04, e2));
      const pc = st.cast.pc || {};
      const out = ease(clamp((kl - 0.78) / 0.22, 0, 1));
      const hd = Q.hand({ size: Math.round(15 * k), pose: kl < 0.9 ? 'pinch' : 'rest', side: 'R', angle: -Math.PI / 2 - 0.25, skin: Q.skinOf(pc), sleeve: Q.clothOf(pc)[0] });
      if (hd && out < 1) c.drawImage(hd.cv, Math.round(at.notice[0] + 8 * k - hd.ax), Math.round(lerp(at.notice[1] + off, at.notice[1] + 24 * k, e2) + out * off - hd.ay));
      airLife(c, w, h, t, still, 14, 71, 0);
      void s;
    },
    focus(w, h, vb) { const G = geomFloor(w, h, vb), k = G.k; if (G.narrow) return { x: Math.round(G.cx - 60 * k), y: Math.round(G.at.folio[1] - 26 * k), w: Math.round(120 * k), h: Math.round(G.at.notice[1] + 22 * k - (G.at.folio[1] - 26 * k)) }; return { x: Math.round(G.at.folio[0] - 40 * k), y: Math.round(G.cy - 28 * k), w: Math.round(G.at.notice[0] + 28 * k - (G.at.folio[0] - 40 * k)), h: Math.round(56 * k) }; },
  };

  // ---- toya · turned: Kasane with the slip held before them --------------------------------------------------------
  function geomTurned(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const land = lay === 'land', narrow = lay === 'narrow';
    const k = clamp(land ? 1 : S.Z * (narrow ? 1.4 : 1.2), 0.8, 1.8);
    const kx = Math.round(w * (narrow ? 0.5 : land ? 0.42 : 0.5));
    // their face high enough that the slip, held below their chin, stays clear of it and above the sheet
    const ky = Math.round(narrow ? Math.min(vb - s(170), h * 0.5) : land ? clamp(vb + 24, 90, 130) : clamp(vb - KNEEL - s(4), 100, h));
    const horizon = ky - EYE;
    const sx = land ? kx + 64 : kx + Math.round(s(2)), sy = land ? Math.round(clamp(vb * 0.5, 30, vb - 16)) : ky + Math.round(30 * k) - 22;
    return Object.assign(S, { land, narrow, kx, ky, horizon, k, sx, sy });
  }
  const turned = {
    phases: [['realise', 700], ['front', 900], ['close', 700]],
    safe: { wide: 'their face, and the slip under it, above the sheet', narrow: 'their face above the slip', land: 'their face and the slip beside it' },
    draw(c, w, h, t, st) {
      const G = geomTurned(w, h, st.vb), { s, kx, ky, k, sx, sy } = G, still = st.still;
      c.drawImage(heartBack(G, 'turned').cv, 0, 0);
      // closer than the room: the dark round them deepened, the light on them
      c.fillStyle = 'rgba(12,12,24,0.3)'; c.fillRect(0, 0, w, h);
      c.globalAlpha = 0.9; P().halo(c, kx, ky - 30, Math.round(s(110)), '255,226,180', 0.14, 4); c.globalAlpha = 1;
      airLife(c, w, G.horizon + s(30), t, still, 20, 35, 1);
      const kr = st.at('realise'), kf = st.at('front'), kc = st.at('close');
      let expr = 'neutral', fr = { look: [0, 1] };
      if (kc > 0.3) { expr = 'closed'; fr = { head: [0, 1] }; }
      else if (kf > 0.4) { expr = 'sad'; fr = { look: [0, 1] }; }
      else if (kr > 0.2) { expr = 'surprise'; fr = kr < 0.6 ? { head: [0, -1], look: [0, 1] } : { look: [0, 1] }; }
      kasaneKneeling(c, kx, ky, expr, fr, WARM);
      // the slip: its back to you as they read it, lifted a little in surprise; turned over on the line about its front
      const lift = Math.round(ease(kr) * s(3)) - Math.round(ease(kc) * s(3));
      const flip = kf <= 0 || kf >= 1 ? 1 : Math.cos(Math.PI * ease(kf));
      const side = kf >= 0.5 ? 'front' : 'back';
      slip(c, sx, sy - lift, k, side, G.land ? 0 : -0.04, flip, 'down');
      const kskin = KSKIN, ksl = '#b8b4a8';
      for (const [sd, dx, ang] of [['L', -1, Math.PI * 0.08], ['R', 1, Math.PI * 0.92]]) {
        const hd = Q.hand({ size: Math.round(10 * k), pose: 'pinch', side: sd, angle: ang, skin: kskin, sleeve: ksl });
        if (hd) c.drawImage(hd.cv, Math.round(sx + dx * (Math.max(0.2, Math.abs(flip)) * 9 + 4) * k - hd.ax), Math.round(sy - lift + 14 * k - hd.ay));
      }
    },
    focus(w, h, vb) { const G = geomTurned(w, h, vb), k = G.k; if (G.land) return { x: G.kx - 30, y: G.ky - 82, w: Math.round(G.sx + 12 * k - (G.kx - 30)), h: Math.min(vb + 2, G.ky - 30) - (G.ky - 82) }; const y0 = G.ky - 88, y1 = Math.min(vb, G.sy + 28 * k); return { x: G.kx - 34, y: y0, w: 68, h: Math.round(y1 - y0) }; },
  };

  // a sleeved forearm reaching in from off the frame to a wrist at (wx, wy): ang is the direction the hand points
  // (the arm runs back the other way), len its visible length, wd its width at the wrist (wider at the elbow)
  function arm(c, wx, wy, ang, len, wd, col) {
    const key = 'ch6.arm|' + [Math.round(ang * 50), len, wd, col].join('|');
    const A = Q.small(key, () => {
      const p = P(), W = Math.ceil(len + wd * 3), L = p.layer(W * 2, W * 2), cx = W, cy = W;
      const M = p.mat(col, { n: 6, at: 3, step: 0.08 });
      const bx = -Math.cos(ang), by = -Math.sin(ang), nx = -by, ny = bx;
      const w0 = wd / 2, w1 = wd * 0.8;
      const pts = [[cx + nx * w0, cy + ny * w0], [cx + bx * len + nx * w1, cy + by * len + ny * w1], [cx + bx * len - nx * w1, cy + by * len - ny * w1], [cx - nx * w0, cy - ny * w0]];
      L.poly(pts, M, (x, y) => clamp(0.55 + ((x - cx) * nx + (y - cy) * ny) / (wd * 1.4) * 0.35 - (((x - cx) * nx + (y - cy) * ny) > w0 * 0.7 ? 0.1 : 0), 0, 0.999));
      // the cuff at the wrist and a fold along it
      L.line(cx + nx * w0, cy + ny * w0, cx - nx * w0, cy - ny * w0, M, 5);
      L.line(cx + bx * len * 0.5 + nx * w0 * 0.3, cy + by * len * 0.5 + ny * w0 * 0.3, cx + bx * len * 0.9 + nx * w1 * 0.2, cy + by * len * 0.9 + ny * w1 * 0.2, M, 1);
      L.outline();
      return { cv: L.canvas(), ax: cx, ay: cy };
    });
    c.drawImage(A.cv, Math.round(wx - A.ax), Math.round(wy - A.ay));
  }

  // ---- toya · bell: the little brass bell, rung once (only when it is carried) -------------------------------------
  function geomBellIns(w, h, vb) {
    const S = stage(w, h, vb), { lay } = S;
    const land = lay === 'land', narrow = lay === 'narrow';
    const k = clamp(land ? (vb - 4) / 56 : narrow ? Math.min(w / 140, vb / 300) : Math.min(w / 220, vb / 108), 0.9, 2.6);
    const cx = Math.round(w * 0.5), cy = Math.round(land ? vb * 0.48 : vb * (narrow ? 0.5 : 0.48));
    const horizon = Math.round(land ? vb * 0.82 : vb * (narrow ? 0.72 : 0.74));
    return Object.assign(S, { land, narrow, k, cx, cy, horizon, kx: cx });
  }
  const bellIns = {
    phases: [['show', 700], ['ring', 1000], ['offer', 800]],
    safe: { wide: 'the hands and the bell central against the dark', narrow: 'the bell in the upper half', land: 'the bell and the hands' },
    draw(c, w, h, t, st) {
      const G = geomBellIns(w, h, st.vb), { s, k, cx, cy } = G, still = st.still;
      c.drawImage(heartBack(G, 'bell').cv, 0, 0);
      c.fillStyle = 'rgba(10,10,22,0.25)'; c.fillRect(0, 0, w, h);
      const ks = st.at('show'), kr = st.at('ring'), ko = st.at('offer');
      // the ring: one ripple of light going out through the air and across the settled pages
      const f = clamp((kr - 0.3) / 0.7, 0, 1);
      if (f > 0 && f < 1) {
        const rr = Math.round(lerp(8 * k, Math.max(w, h) * 0.9, ease(f))), a = 0.55 * (1 - f);
        c.fillStyle = 'rgba(255,236,190,' + a.toFixed(2) + ')';
        for (let x = -rr; x <= rr; x++) { const y = Math.round(rr * 0.5 * Math.sqrt(Math.max(0, 1 - (x / rr) ** 2))); c.fillRect(cx + x, cy + y, 1, Math.max(1, Math.round(k))); if (x & 1) c.fillRect(cx + x, cy - y, 1, 1); }
        // the pages on the floor it passes over catch it
        c.fillStyle = 'rgba(255,240,206,' + (a * 0.6).toFixed(2) + ')';
        const band = cy + Math.round(rr * 0.5);
        if (band > G.horizon) c.fillRect(0, band - Math.max(1, s(3)), w, Math.max(2, s(6)));
      }
      airLife(c, w, h, t, still, 24, 81, 1);
      const pc = st.cast.pc || {}, pskin = Q.skinOf(pc), psl = Q.clothOf(pc)[0];
      const kskin = KSKIN, ksl = '#c8c4b8';
      const r = Math.max(3, Math.round(6 * k));
      // your open hand rising into the picture with the bell lying in it (your sleeve from the lower left)
      const palm = [cx - Math.round(20 * k), Math.round(lerp(G.vb + 30 * k, cy + 20 * k, ease(ks)))];
      const pang = -0.3, psz = Math.round(17 * k);
      arm(c, palm[0] - Math.round(psz * 0.1), palm[1], pang, Math.round(70 * k), Math.round(psz * 0.95), psl);
      const ph = Q.hand({ size: psz, pose: 'offer', side: 'R', angle: pang, skin: pskin });
      // Kasane's hand: down from the upper right to take it up by its cord; it rings once; then held out to you
      const up = ease(clamp(kr / 0.3, 0, 1)), back = ease(ko);
      const top = [lerp(palm[0] + 14 * k, cx + 10 * k, up), lerp(palm[1] - 6 * k - r * 2.6, cy - 30 * k, up)];
      const tp = [lerp(top[0], palm[0] + 16 * k, back), lerp(top[1], palm[1] - r * 2.6 - 16 * k, back)];
      const swing = still ? 0 : kr > 0.25 && kr < 1 ? Math.sin((kr - 0.25) * 22) * 0.5 * (1 - kr) : ko >= 1 ? Math.sin(t / 900) * 0.05 : 0;
      if (ph) c.drawImage(ph.cv, Math.round(palm[0] - ph.ax), Math.round(palm[1] - ph.ay));
      if (kr <= 0) suzu(c, palm[0] + 14 * k, palm[1] - 4 * k - r * 2.6 - r, r, 0.9, 0);
      else {
        const glint = kr > 0.3 && kr < 0.6 && !still ? 0.9 : 0.35;
        suzu(c, tp[0], tp[1], r, swing, glint);
        const ksz = Math.round(13 * k), kang = Math.PI / 2 + 0.55;
        const wx = tp[0] - Math.cos(kang) * ksz * 1.25, wy = tp[1] - Math.sin(kang) * ksz * 1.25;
        arm(c, wx, wy, kang, Math.round(110 * k), Math.round(ksz * 1.05), '#cfcabd');
        const kh = Q.hand({ size: ksz, pose: 'pinch', side: 'R', angle: kang, skin: kskin }); // (side R: the angle as given; an L hand is mirrored)
        if (kh) c.drawImage(kh.cv, Math.round(wx - kh.ax), Math.round(wy - kh.ay));
      }
    },
    focus(w, h, vb) { const G = geomBellIns(w, h, vb), k = G.k; const y0 = Math.max(0, Math.round(G.cy - 50 * k)); return { x: Math.round(G.cx - 46 * k), y: y0, w: Math.round(80 * k), h: Math.round(Math.min(vb, G.cy + 30 * k) - y0) }; },
  };

  // ---- toya · decide: Kasane between your shoulder and your companion's ------------------------------------------
  function geomDecide(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const land = lay === 'land', narrow = lay === 'narrow';
    const kx = Math.round(w * 0.5);
    const ky = Math.round(narrow ? Math.min(vb * 0.52, h * 0.46) : land ? clamp(vb + 24, 90, 130) : clamp(vb - s(58), 100, h));
    const horizon = ky - EYE;
    const bw = Math.round(clamp(s(narrow ? 160 : 170), 90, 230));
    const yb = Math.round(narrow ? ky + s(196) : land ? Math.max(vb + 64, ky + 90) : vb + s(80));
    const gap = Math.round(bw * (narrow ? 0.5 : 0.56));
    return Object.assign(S, { land, narrow, kx, ky, horizon, bw, yb, lx: kx - gap, rx: kx + gap });
  }
  // the companion's own small gesture as they answer (a hand at their shoulder; the lamp's light for Ren)
  function aside(c, G, comp, b, k) {
    const sk = Q.skinOf(comp.look), sl = Q.clothOf(comp.look)[0], e = ease(k), Zs = clamp(G.Z, 0.6, 1.3);
    const hx = b.x - b.w * 0.3, hy = b.y - b.h * 0.42;
    if (comp.id === 'nao') { const hd = Q.hand({ size: Math.round(10 * Zs), pose: 'grip', side: 'L', angle: -Math.PI / 2, skin: sk, sleeve: sl }); if (hd && k > 0.2) c.drawImage(hd.cv, Math.round(hx - hd.ax), Math.round(hy + (1 - e) * 12 - hd.ay)); }
    else if (comp.id === 'mio') { const hd = Q.hand({ size: Math.round(11 * Zs), pose: 'offer', side: 'R', angle: Math.PI + 0.35, skin: sk, sleeve: sl }); if (hd && k > 0.1) c.drawImage(hd.cv, Math.round(lerp(hx, b.x - b.w * 0.62, e) - hd.ax), Math.round(hy + b.h * 0.06 - hd.ay)); }
    else if (comp.id === 'suzu') { const hd = Q.hand({ size: Math.round(10 * Zs), pose: 'point', side: 'R', angle: -Math.PI / 2 - 0.15, skin: sk, sleeve: sl }); if (hd && k > 0.15) c.drawImage(hd.cv, Math.round(hx - hd.ax), Math.round(hy - e * b.h * 0.2 - hd.ay)); }
    else if (comp.id === 'ren') { const lx = Math.round(hx - b.w * 0.05), ly = Math.round(hy - e * b.h * 0.22); c.globalAlpha = 0.9; P().halo(c, lx, ly, Math.round(G.s(56) * (0.6 + e * 0.4)), '255,214,140', 0.24, 4); c.globalAlpha = 1; R(c, lx - 2, ly - 3, 5, 6, '#ffd890'); R(c, lx - 3, ly - 4, 7, 1, '#3a2c20'); R(c, lx - 3, ly + 3, 7, 1, '#3a2c20'); R(c, lx, ly - 8, 1, 4, '#3a2c20'); }
  }
  const decide = {
    phases: [['tired', 700], ['lift', 700], ['aside', 900]],
    safe: { wide: 'Kasane\'s face between your shoulders, in the top 55 %', narrow: 'Kasane above, the two of you below', land: 'Kasane\'s face' },
    draw(c, w, h, t, st) {
      const G = geomDecide(w, h, st.vb), { s, kx, ky } = G, still = st.still;
      c.drawImage(heartBack(G, 'decide').cv, 0, 0);
      airLife(c, w, G.horizon + s(40), t, still, 30, 37, 3);
      const kt = st.at('tired'), kl = st.at('lift'), ka = st.at('aside');
      const comp = st.cast.comp;
      // Kasane: the head lowers, tired; then lifts to face you (Ren's lamp, raised, warms their face)
      let expr = 'tired', fr = { head: [0, Math.round(ease(kt) * 2)], look: [0, 1] };
      if (kl > 0.3) { expr = 'neutral'; fr = { look: [-1, 0] }; }
      const lamp = comp && comp.id === 'ren' && ka > 0.5;
      kasaneKneeling(c, kx, ky, expr, fr, lamp ? { mul: [1, 0.95, 0.86], add: [16, 9, 0], rim: { side: 'r', col: '#ffd890', k: [0.5, 0.22], below: 0.85 } } : WARM);
      // you at the left and your companion at the right, from behind (only a companion who is here)
      const yb = Q.back(st.cast.pc || {}, G.bw, { light: 'r' });
      if (yb) c.drawImage(yb.cv, G.lx - yb.ax, G.yb - yb.ay);
      if (comp) {
        const cb = Q.back(comp.look, Math.round(G.bw * 0.95), { light: 'l' });
        const nod = comp.id === 'nao' && ka > 0 && ka < 1 && !still ? Math.round(Math.sin(Math.PI * ka) * 2) : 0;
        const box = { x: G.rx, y: G.yb, w: cb ? cb.w : G.bw, h: cb ? cb.h : G.bw };
        if (cb) c.drawImage(cb.cv, G.rx - cb.ax, G.yb - cb.ay + nod);
        if (ka > 0) aside(c, G, comp, box, ka);
      }
    },
    focus(w, h, vb) { const G = geomDecide(w, h, vb); return { x: G.kx - 32, y: G.ky - 88, w: 64, h: Math.min(G.land ? 48 : 58, vb - (G.ky - 88)) }; },
  };

  RB.sequence.define('ch6.toya', {
    title: { en: 'Tōya\'s four words', jp: 'トウヤ の {四語|よんご}' }, chapter: 6, scene: 'sa.toya_read', memory: true,
    memo: { jp: '', en: 'In the Heart of the Archive, Kasane read Tōya\'s four words in context at last: an answer, and a promise kept.' },
    shots: { folio: folioShot, floor: floorShot, turned, bell: bellIns, decide },
  });

  // ==== ch6.ren — the teacher's face (`sa.shelf_ren`, its open branch `:ropen`; SHOTS.md §8.4) =====================
  // In the Room of Set-Down Memories, at the shelf labelled in Ushio's strong hand. Ren (they) with their lamp,
  // glasses and patched coat. Three compositions:
  //   open     Ren before the shelves, the folio held at their chest: its cover swings open on the line that says so
  //   face     the open folio close, Ren's hands at its edges: on the narration line a face surfaces on the paper in
  //            ink — heavy eyebrows, the ink smudge on the left cheek (Ushio's own portrait, as ink); it smiles and
  //            its eyes vanish on Ushio's "All right"; the voice's light goes out and the face stays; held through
  //            the challenge
  //   ren      close on Ren: sad; the smirk at the eyebrows; then they take off their glasses and clean them, and
  //            go on cleaning them (a slow hold)
  const RLIGHT = { mul: [0.98, 0.95, 0.9], add: [8, 5, 0], rim: { side: 'l', col: '#ffe2b0', k: [0.42, 0.18], below: 0.85 } };
  const RSKIN = () => Q.skinOf(look('ren')), RSLEEVE = () => (look('ren').cloth || ['#3a3e6a'])[0];
  // Ren's portrait without the glasses (their own portrait with that one accessory left off), graded like Q.bust
  function renBare(expr, fr, g) {
    return Q.small('ch6.renbare|' + expr + '|' + JSON.stringify(fr || null) + '|' + JSON.stringify(g || null), () => {
      const sj = RB.portraits.subject('ren');
      if (!sj) return null;
      const sj2 = { key: 'ren|noglasses', who: 'ren', p: Object.assign({}, sj.p, { acc: (sj.p.acc || []).filter((a) => a !== 'glasses') }) };
      const f = RB.portraits.frame(sj2, expr, fr || null);
      if (!f) return null;
      let cv = mk(f.width, f.height); cv.getContext('2d').drawImage(f, 0, 0);
      cv = Q.grade(cv, g);
      // continued down (its lowest row repeated), as Q.bust does, so a shorter sheet never shows an edge
      const H0 = cv.height, ext = 220, tall = mk(cv.width, H0 + ext), tg = tall.getContext('2d');
      tg.drawImage(cv, 0, 0);
      const d = cv.getContext('2d', { willReadFrequently: true }).getImageData(0, H0 - 3, cv.width, 1).data;
      for (let x = 0; x < cv.width; x++) { const o = x * 4; if (d[o + 3] < 200) continue; tg.fillStyle = 'rgb(' + d[o] + ',' + d[o + 1] + ',' + d[o + 2] + ')'; tg.fillRect(x, H0 - 2, 1, ext + 2); }
      return { cv: tall, ax: cv.width >> 1, ay: H0 };
    });
  }
  // the shelves of the Room of Set-Down Memories filling the background: dark wood, rows of folios with pale labels
  function shelfWall(g, w, h, s, seed, dim) {
    const p = P(), rnd = p.rnd(seed || 5), L = p.layer(w, h);
    const wood = p.mat('#5e5058', { n: 6, at: 3, step: 0.08 });
    const cols = ['#8a7a6a', '#6a7a8a', '#9a8a6a', '#7a6a7a', '#a89a84', '#6a6a5a'].map((c) => p.mat(c, { n: 5, at: 2, step: 0.08 }));
    const lab = p.mat('#e8e0cc', { n: 3, at: 1 });
    L.rect(0, 0, w, h, wood, (x, y) => clamp(0.22 + ((Math.round(x) % Math.max(40, s(150))) < s(6) ? 0.2 : 0), 0, 0.999));
    const rowH = Math.max(18, s(44));
    for (let y0 = s(6); y0 < h; y0 += rowH) {
      for (let x = s(2) + Math.floor(rnd() * s(6)); x < w - 2;) {
        const fw = Math.max(3, s(6 + rnd() * 6)), fh = rowH - Math.max(4, s(8)) - Math.floor(rnd() * s(6)), M = cols[Math.floor(rnd() * cols.length)];
        if (rnd() < 0.06) { x += fw + s(4); continue; } // a gap where something was returned
        L.rect(x, y0 + rowH - s(5) - fh, fw, fh, M, (xx) => (xx < x + 1 ? 0.9 : 0.5));
        if (fw > 4) L.rect(x + 1, y0 + rowH - s(5) - Math.round(fh * 0.7), fw - 2, Math.max(2, s(5)), lab, 1);
        x += fw + (rnd() < 0.2 ? 1 : 0);
      }
      L.rect(0, y0 + rowH - s(5), w, Math.max(2, s(5)), wood, (xx, yy) => (yy < y0 + rowH - s(4) ? 0.85 : 0.4));
    }
    L.outline();
    g.drawImage(L.canvas(), 0, 0);
    g.fillStyle = 'rgba(16,12,22,' + (dim || 0.35).toFixed(2) + ')'; g.fillRect(0, 0, w, h);
  }
  function roomBack(G, key, dim) {
    return cached('ch6.' + key + '|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const cv = mk(G.w, G.h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      shelfWall(g, G.w, G.h, G.s, 5, dim);
      // the warm light of the room's crystal lamp from the left, two flat steps
      g.fillStyle = 'rgba(255,226,180,0.06)'; g.fillRect(0, 0, Math.round(G.w * 0.6), G.h); g.fillRect(0, 0, Math.round(G.w * 0.3), G.h);
      return { cv };
    });
  }
  // the folio Ushio filed: card covers, its label strip in a strong hand (strokes, never writing). e: the cover's
  // swing open (0 closed … 1 open flat to the left of the spine)
  function ushioFolio(c, x, y, k, e) {
    const W = Math.round(36 * k), H = Math.round(46 * k), sx = Math.round(x - W / 2);
    c.fillStyle = 'rgba(30,20,20,0.28)'; c.fillRect(sx + 2, Math.round(y - H / 2) + 3, W, H);
    // the first page (under the cover): pale and empty
    c.fillStyle = '#f0eadb'; c.fillRect(sx, Math.round(y - H / 2), W, H);
    c.fillStyle = '#d8d0bc'; c.fillRect(sx + W - 1, Math.round(y - H / 2), 1, H); c.fillRect(sx, Math.round(y + H / 2) - 1, W, 1);
    // the cover swinging round its spine (sx): in front while closing over the page, behind (its inside) when open
    const cw = Math.round(W * Math.cos(Math.PI * clamp(e, 0, 1)));
    if (cw > 0) {
      c.fillStyle = '#5a4a5e'; c.fillRect(sx, Math.round(y - H / 2), cw, H);
      c.fillStyle = '#7a6a7e'; c.fillRect(sx, Math.round(y - H / 2), cw, Math.max(1, Math.round(k)));
      if (cw > W * 0.5) { c.fillStyle = '#e4dcc4'; c.fillRect(sx + Math.round(cw * 0.25), Math.round(y - H * 0.32), Math.round(cw * 0.5), Math.round(H * 0.22)); scribbles(c, sx + Math.round(cw * 0.5), Math.round(y - H * 0.29), 2, k * 0.55, 31); }
    } else if (cw < 0) {
      c.fillStyle = '#e8e0cc'; c.fillRect(sx + cw, Math.round(y - H / 2), -cw, H);
      c.fillStyle = '#cfc6b0'; c.fillRect(sx - 1, Math.round(y - H / 2), 1, H);
    }
  }
  // Ushio's face as ink on the paper: the portrait's own drawing, its light parts left as paper, its dark ones ink,
  // in four tones; reveal 0..1: the ink coming up from the middle outward (the face surfacing)
  function inkFace(expr) {
    return Q.small('ch6.ink|' + expr, () => {
      const sj = RB.portraits.subject('sa_ushio'), f = sj && RB.portraits.frame(sj, expr, null);
      if (!f) return null;
      const w2 = f.width, h2 = f.height, src = mk(w2, h2), sg = src.getContext('2d', { willReadFrequently: true });
      sg.drawImage(f, 0, 0);
      const d = sg.getImageData(0, 0, w2, h2), px = d.data, ink = new Float32Array(w2 * h2);
      for (let i = 0; i < w2 * h2; i++) {
        if (px[i * 4 + 3] < 100) { ink[i] = 0; continue; }
        // the light (skin, cloth in light) stays paper; the dark lines, brows, hair and the smudge become ink; below
        // the chin it thins away (a face surfacing, not a portrait)
        const lum = (0.3 * px[i * 4] + 0.59 * px[i * 4 + 1] + 0.11 * px[i * 4 + 2]) / 255, yy = Math.floor(i / w2);
        const fadeY = clamp((76 - yy) / 12, 0, 1);
        ink[i] = Math.round(clamp((0.66 - lum) * 2.4, 0, 1) * fadeY * 3) / 3;
      }
      return { ink, w: w2, h: h2 };
    });
  }
  function drawInk(c, F, x, y, a, reveal, t) {
    if (!F) return;
    const cx = F.w / 2, cy = F.h * 0.45;
    for (let yy = 0; yy < F.h; yy++) for (let xx = 0; xx < F.w; xx++) {
      const v = F.ink[yy * F.w + xx];
      if (!v) continue;
      if (reveal < 1) { const dd = Math.hypot(xx - cx, (yy - cy) * 0.9) / (F.w * 0.55) + hashf(xx, yy, 44) * 0.35; if (dd > reveal * 1.35) continue; }
      c.fillStyle = 'rgba(40,30,38,' + (a * (0.25 + v * 0.7)).toFixed(3) + ')';
      c.fillRect(x + xx, y + yy, 1, 1);
    }
    void t;
  }

  // ---- ren · open: Ren before the shelves, the folio opened at their chest ----------------------------------------
  function geomRen(w, h, vb, close) {
    const S = stage(w, h, vb), { s, lay } = S;
    const land = lay === 'land', narrow = lay === 'narrow';
    const kx = Math.round(w * (narrow ? 0.5 : land ? 0.42 : 0.5));
    // a phone held upright as the wide frame: the bust low, its shoulders meeting the sheet (never a column of robe)
    const ky = Math.round(land ? clamp(vb + 24, 90, 130) : clamp(vb - s(close ? 30 : 40), 100, h));
    const k = clamp(land ? 1 : S.Z * (narrow ? 1.25 : 1.05), 0.8, 1.6);
    return Object.assign(S, { land, narrow, kx, ky, k });
  }
  const renOpen = {
    phases: [['open', 1000]],
    safe: { wide: 'Ren\'s face and the folio in the top 60 %', narrow: 'Ren above the folio', land: 'Ren\'s face' },
    draw(c, w, h, t, st) {
      const G = geomRen(w, h, st.vb, false), { s, kx, ky, k } = G, still = st.still;
      c.drawImage(roomBack(G, 'renroom', 0.32).cv, 0, 0);
      airLife(c, w, h, t, still, 18, 63, 0);
      const ko = st.at('open');
      const rb = Q.bust('ren', 'neutral', { look: [0, 1] }, RLIGHT, false, 220);
      if (rb) c.drawImage(rb.cv, kx - rb.ax, ky - rb.ay);
      // the folio at their chest (beside the face in a phone's band), the cover swinging open
      const fx = G.land ? kx + 70 : kx + Math.round(6 * k), fy = G.land ? Math.round(clamp(G.vb * 0.5, 30, G.vb - 16)) : ky - Math.round(2 * k);
      ushioFolio(c, fx, fy, k, ease(ko));
      const skin = RSKIN(), sl = RSLEEVE();
      const W = Math.round(36 * k);
      const hl = Q.hand({ size: Math.round(10 * k), pose: 'pinch', side: 'L', angle: Math.PI * 0.08, skin, sleeve: sl });
      const hr = Q.hand({ size: Math.round(10 * k), pose: 'pinch', side: 'R', angle: Math.PI * 0.92, skin, sleeve: sl });
      // the left hand holds the spine; the right turns the cover (it follows the cover's edge, then rests on the page)
      const cw = W * Math.cos(Math.PI * ease(ko));
      if (hl) c.drawImage(hl.cv, Math.round(fx - W / 2 - 4 * k - hl.ax), Math.round(fy + 10 * k - hl.ay));
      if (hr) c.drawImage(hr.cv, Math.round(fx - W / 2 + Math.max(cw, W * 0.9 * (ko >= 1 ? 1 : 0)) + 4 * k - hr.ax), Math.round(fy + 8 * k - hr.ay));
      void s;
    },
    focus(w, h, vb) { const G = geomRen(w, h, vb, false), k = G.k; if (G.land) return { x: G.kx - 30, y: G.ky - 82, w: Math.round(G.kx + 70 + 20 * k - (G.kx - 30)), h: Math.min(vb + 2, G.ky - 30) - (G.ky - 82) }; const y0 = G.ky - 88; return { x: Math.round(G.kx - 34), y: y0, w: 68, h: Math.round(Math.min(vb, G.ky + 22 * k) - y0) }; },
  };

  // ---- ren · face: the open folio, close; the face surfacing on the paper -------------------------------------------
  function geomPage(w, h, vb) {
    const S = stage(w, h, vb), { lay } = S;
    const land = lay === 'land', narrow = lay === 'narrow';
    // the right-hand page holds the 96-px face with room round it; the spread centred above the sheet (on a short
    // landscape band, with the challenge's tall sheet up, the page rises only until the face's brow meets the top)
    const pw = 132, ph = 150;
    const cx = Math.round(w * (narrow ? 0.38 : land ? 0.4 : 0.42)), cy = Math.round(land ? Math.max(vb * 0.5 + 8, 50) : narrow ? Math.min(vb * 0.42, h * 0.38) : vb * 0.5);
    return Object.assign(S, { land, narrow, pw, ph, cx, cy });
  }
  function pageStatic(G) {
    return cached('ch6.page|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, pw, ph, cx, cy } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      shelfWall(g, w, h, s, 9, 0.7);
      // the spread: the inside of the cover at the left (Ushio's filing slip pasted on it), the first page at the right
      const p = P(), L = p.layer(w, h), paper = p.mat('#ece5d4', { n: 6, at: 3, step: 0.05 }), card = p.mat('#e2d9c2', { n: 5, at: 3, step: 0.05 });
      const x0 = cx - pw, y0 = cy - Math.round(ph / 2);
      L.rect(x0 - 4, y0 - 4, pw * 2 + 8, ph + 8, p.mat('#5a4a5e', { n: 5, at: 2 }), (x, y) => (y < y0 - 3 ? 0.8 : 0.4));
      L.rect(x0, y0, pw, ph, card, (x) => clamp(0.55 + (x - x0) / pw * 0.12, 0, 0.999));
      L.rect(cx, y0, pw, ph, paper, (x) => clamp(0.66 - (x - cx) / pw * 0.12 + (x < cx + 4 ? -0.15 : 0), 0, 0.999));
      L.rect(cx - 1, y0, 2, ph, p.mat('#b8ae98', { n: 3, at: 1 }), 1);
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // Ushio's filing slip on the cover: a strong hand, as broad strokes (marks only)
      g.fillStyle = '#ddd2b6'; g.fillRect(x0 + Math.round(pw * 0.2), y0 + Math.round(ph * 0.14), Math.round(pw * 0.6), Math.round(ph * 0.5));
      scribbles(g, x0 + Math.round(pw * 0.62), y0 + Math.round(ph * 0.2), 4, 1.4, 52);
      scribbles(g, x0 + Math.round(pw * 0.42), y0 + Math.round(ph * 0.22), 3, 1.4, 53);
      g.fillStyle = '#a83a32'; g.fillRect(x0 + Math.round(pw * 0.26), y0 + Math.round(ph * 0.52), 8, 8);
      return { cv, x0, y0 };
    });
  }
  const renFace = {
    phases: [['surface', 1500], ['smile', 900], ['fade', 1200]],
    safe: { wide: 'the face on the page above the sheet', narrow: 'the page in the upper half', land: 'the face' },
    draw(c, w, h, t, st) {
      const G = geomPage(w, h, st.vb), { cx, cy, pw, ph } = G, still = st.still;
      const S0 = pageStatic(G);
      c.drawImage(S0.cv, 0, 0);
      const ks = st.at('surface'), km = st.at('smile'), kf = st.at('fade');
      // the face on the right-hand page
      const fx = cx + Math.round((pw - 96) / 2), fy = cy - Math.round(ph / 2) + Math.round((ph - 96) * 0.3);
      // the voice's light round the page while it speaks, going out on its line (the face stays)
      const voice = (ks > 0.6 ? 1 : 0) * (1 - ease(kf));
      if (voice > 0) {
        c.globalAlpha = step4(voice) * 0.9; P().halo(c, fx + 48, fy + 44, 70, '255,232,190', 0.16, 4); c.globalAlpha = 1;
        if (!still) for (let i = 0; i < 10; i++) { const f = ((t / 2200) + i / 10) % 1; c.fillStyle = 'rgba(255,232,190,' + ((1 - f) * 0.6 * voice).toFixed(2) + ')'; c.fillRect(Math.round(fx + 20 + hashf(i, 1, 6) * 56), Math.round(fy + 80 - f * 90), 1, 1); }
      }
      const N = inkFace('neutral'), M2 = inkFace('smile2');
      const em = step4(km);
      if (em < 1) drawInk(c, N, fx, fy, 1 - em, ks, t);
      if (em > 0) drawInk(c, M2, fx, fy, em, 1, t);
      // Ren's hands at the spread's lower corners, holding it open
      const skin = RSKIN(), sl = RSLEEVE();
      const x0 = cx - pw, y1 = cy + Math.round(ph / 2);
      const hl = Q.hand({ size: 16, pose: 'grip', side: 'L', angle: -Math.PI * 0.42, skin, sleeve: sl }), hr = Q.hand({ size: 16, pose: 'grip', side: 'R', angle: -Math.PI * 0.58, skin, sleeve: sl });
      if (hl) c.drawImage(hl.cv, Math.round(x0 + 10 - hl.ax), Math.round(y1 + 6 - hl.ay));
      if (hr) c.drawImage(hr.cv, Math.round(cx + pw - 10 - hr.ax), Math.round(y1 + 6 - hr.ay));
      airLife(c, w, h, t, still, 12, 64, 0);
    },
    focus(w, h, vb) { const G = geomPage(w, h, vb); const fx = G.cx + Math.round((G.pw - 96) / 2), fy = G.cy - Math.round(G.ph / 2) + Math.round((G.ph - 96) * 0.3); return { x: fx + 14, y: fy + 10, w: 68, h: Math.min(66, vb + 2 - (fy + 10)) }; },
  };

  // ---- ren · ren: close on Ren; the glasses off ----------------------------------------------------------------------
  // the glasses as a thing in the hand: two round rims, the bridge, the arms folded behind
  function specs(c, x, y, r, open) {
    c.fillStyle = '#2a2430';
    P().ring(c, x - r - 1, y, r, 1); P().ring(c, x + r + 1, y, r, 1);
    c.fillRect(x - 1, y - 1, 3, 1);
    if (open) { c.fillRect(x - 2 * r - 2, y - 1, 1, r + 2); c.fillRect(x + 2 * r + 2, y - 1, 1, r + 2); }
    c.fillStyle = 'rgba(220,236,255,0.35)'; c.fillRect(x - r - 2, y - Math.round(r * 0.4), 2, 1); c.fillRect(x + r, y - Math.round(r * 0.4), 2, 1);
  }
  const renClose = {
    phases: [['sad', 600], ['smirk', 500], ['glasses', 1400]],
    safe: { wide: 'Ren\'s face and hands in the top 60 %', narrow: 'Ren\'s face above their hands', land: 'Ren\'s face' },
    draw(c, w, h, t, st) {
      const G = geomRen(w, h, st.vb, true), { kx, ky, k } = G, still = st.still;
      c.drawImage(roomBack(G, 'renclose', 0.62).cv, 0, 0);
      c.globalAlpha = 0.9; P().halo(c, kx, ky - 44, Math.round(G.s(100)), '255,226,180', 0.12, 4); c.globalAlpha = 1;
      airLife(c, w, h, t, still, 14, 65, 0);
      const ksd = st.at('sad'), ksm = st.at('smirk'), kg = st.at('glasses');
      const off = kg > 0.35;
      // the face: sad, its head a pixel lower; the smirk at the eyebrows; then, the glasses off, eyes down
      let expr = 'neutral', fr = null;
      if (off) { expr = 'neutral'; fr = { look: [0, 1], lids: 'half' }; }
      else if (ksm > 0.3) { expr = 'smirk'; fr = null; }
      else if (ksd > 0.1) { expr = 'sad'; fr = { head: [0, Math.round(ease(ksd))] }; }
      const rb = off ? renBare(expr, fr, RLIGHT) : Q.bust('ren', expr, fr, RLIGHT, false, 220);
      if (rb) c.drawImage(rb.cv, kx - rb.ax, ky - rb.ay);
      // the glasses lifted off the face and brought down to the hands; then the cloth going round a lens, slowly
      if (kg > 0) {
        const e = ease(clamp((kg - 0.25) / 0.75, 0, 1));
        const ex = kx, ey = ky - 96 + 47;                                              // where the glasses sat
        const hx = G.land ? kx + 64 : kx, hy = G.land ? Math.round(clamp(G.vb * 0.55, 30, G.vb - 12)) : ky - Math.round(4 * k);
        const gx = Math.round(lerp(ex, hx, e)), gy = Math.round(lerp(ey, hy, e));
        if (off) specs(c, gx, gy, Math.max(3, Math.round(4 * k)), e < 0.6);
        const skin = RSKIN(), sl = RSLEEVE();
        const h1 = Q.hand({ size: Math.round(10 * k), pose: 'pinch', side: 'L', angle: Math.PI * 0.05, skin, sleeve: sl });
        if (h1) c.drawImage(h1.cv, Math.round(gx - 11 * k - h1.ax), Math.round(gy + 2 * k - h1.ay));
        if (kg >= 1 || e > 0.8) {
          // the cloth in the other hand, rubbing the right lens round and round, for longer than it needs
          const rub = still ? 0 : Math.sin(t / 700) * 2 * k, rv = still ? 0 : Math.cos(t / 700) * 1.2 * k;
          c.fillStyle = '#d8d2c4'; c.fillRect(Math.round(gx + 2 * k + rub), Math.round(gy - 3 * k + rv), Math.round(8 * k), Math.round(7 * k));
          c.fillStyle = '#b8b0a2'; c.fillRect(Math.round(gx + 2 * k + rub), Math.round(gy + 4 * k + rv), Math.round(8 * k), 1);
          const h2 = Q.hand({ size: Math.round(10 * k), pose: 'pinch', side: 'R', angle: Math.PI * 0.95, skin, sleeve: sl });
          if (h2) c.drawImage(h2.cv, Math.round(gx + 14 * k + rub - h2.ax), Math.round(gy + 1 * k + rv - h2.ay));
        }
      }
    },
    focus(w, h, vb) { const G = geomRen(w, h, vb, true), k = G.k; if (G.land) return { x: G.kx - 30, y: G.ky - 82, w: Math.round(G.kx + 64 + 26 * k - (G.kx - 30)), h: Math.min(vb + 2, G.ky - 30) - (G.ky - 82) }; const y0 = G.ky - 88; return { x: G.kx - 34, y: y0, w: 68, h: Math.round(Math.min(vb, G.ky + 6 * k) - y0) }; },
  };

  RB.sequence.define('ch6.ren', {
    title: { en: 'The teacher\'s face', jp: '{師|し} の {顔|かお}' }, chapter: 6, scene: 'sa.shelf_ren', memory: true,
    memo: { jp: '', en: 'At their teacher\'s shelf, Ren opened the folio, and the face came back: smiling, the last time.' },
    shots: { open: renOpen, face: renFace, ren: renClose },
  });
})();
