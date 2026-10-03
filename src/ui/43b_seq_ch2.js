/* Chapter 2's illustrated sequences (docs/expressive/SHOTS.md §2 and §7b).
 *
 * ch2.notice — the pivotal exchange in the harbour office (`sg.omi_wataru`, src/content/ch2/21_scenes_main.js,
 * between the staged beats omi.pivot.begin and the end of the notice). Both routes reach it; Ōmi's softened
 * look is a phase only on Wataru's own route (`?(sg_wataru_self) !shot face soften`), and the room shows the
 * companion who is actually here. Four compositions, afternoon light from the harbour window:
 *   faults  over Wataru's shoulder onto Ōmi behind her desk: her hand rests on the company's ledger for the
 *           company's fault, then moves across to the re-written tags for his
 *   face    the reverse, close on Wataru, Ōmi's shoulder at the frame's edge: a brief upward look, then a
 *           careful exhale, his shoulders dropping; on his own route her face turns a little toward him
 *   room    the office from the window side, the four of them: your companion's small reaction on their
 *           aside; Ōmi points to the window (Lanternfall, Kurobe), then back to Wataru
 *   notice  the hands across the desk: the notice passes from your hand to his (one envelope, never two); his
 *           hands steady; the seal breaks and a gull crosses the window
 * ch2.plate — the faded passage filled (`sg.asahi_name`, src/content/ch2/24_scenes_hub.js): the registry card
 * on the glassworks counter; the hands at work, the nameplate taking shape; Asahi holding it up. The furnace
 * is lit only once the story has lit it (`sg_boss_done`).
 * People are the game's own drawings (portraits, road sprites), graded into the light. No letters, kana or
 * kanji are drawn: papers carry ruled lines and marks, never writing. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const Q = RB.seqKit, { R, mk, clamp, ease, lerp, cached, stage } = Q;
  const P = () => RB.pxkit;
  const look = (id) => (RB.content.chars[id] || {}).look || {};
  const step4 = (a) => Math.round(clamp(a, 0, 1) * 4) / 4;
  const WIN = { mul: [0.92, 0.94, 1], add: [0, 2, 8], rim: { side: 'r', col: '#f4f0d8', k: [0.45, 0.2], below: 0.8 } }; // backlit by the window
  const FACE = { mul: [1, 0.97, 0.93], add: [6, 4, 0], rim: { side: 'l', col: '#fff0d0', k: [0.4, 0.16], below: 0.8 } };   // lit from the window
  const PANEL = '#6a5848', DESK = '#4e3424';

  // ---- the harbour seen through a window: sky, the far breakwater, water with glints, a moored boat ------
  function harbour(g, x, y, w, h, s, rnd) {
    if (w < 4 || h < 4) return;
    Q.bandsIn(g, x, y, w, Math.round(h * 0.5), ['#8eb0cc', '#a2bed4', '#b8ccd8', '#d2dcdc'], 0.4);
    const yw = y + Math.round(h * 0.5);
    R(g, x, yw - Math.max(2, s(3)), w, Math.max(2, s(3)), '#7a8494');
    for (let i = 0; i < 4; i++) R(g, x + Math.round(w * (0.1 + i * 0.22)), yw - s(5), s(3), s(2), '#6a7484');
    Q.bandsIn(g, x, yw, w, h - Math.round(h * 0.5), ['#6a9cb8', '#5a8caa', '#4c7c9c', '#406e8e'], 0.4);
    for (let n = 0; n < (w * h) / 300; n++) { const gx = x + Math.floor(rnd() * w), gy = yw + 2 + Math.floor(rnd() * (h * 0.5 - 3)); R(g, gx, gy, 2 + Math.floor(rnd() * s(5)), 1, 'rgba(230,240,240,0.45)'); }
    // a moored boat: hull, mast, a furled sail
    const bx = x + Math.round(w * 0.62), by = yw + Math.round(h * 0.18);
    R(g, bx - s(12), by, s(24), s(4), '#5a3a2a'); R(g, bx - s(10), by + s(4), s(20), s(2), '#3a2a22'); R(g, bx, by - s(22), 1, s(22), '#3a2a22'); R(g, bx - s(1), by - s(16), s(8), s(2), '#d8d0c0');
  }
  function windowFrame(L, x, y, w, h, s) {
    const p = P(), fr = p.mat('#4a3a2e', { n: 5, at: 2, step: 0.09 });
    L.rect(x - s(5), y - s(5), w + s(10), s(5), fr, (xx, yy) => (yy < y - s(4) ? 0.9 : 0.5));
    L.rect(x - s(5), y + h, w + s(10), s(6), fr, (xx, yy) => (yy < y + h + 1 ? 0.95 : 0.4));
    L.rect(x - s(5), y, s(5), h, fr, 0.7); L.rect(x + w, y, s(5), h, fr, 0.3);
    L.rect(x + Math.round(w / 2) - 1, y, s(3), h, fr, 0.55);
    for (let yy = y + Math.round(h / 3); yy < y + h - 2; yy += Math.round(h / 3)) L.rect(x, yy, w, Math.max(1, s(1.5)), fr, 0.5);
  }
  function panelled(L, x0, y0, x1, y1, s, light) {
    const p = P(), m = p.mat(PANEL, { n: 6, at: 3, step: 0.07 });
    const pw = Math.max(12, s(34)), rail = Math.round(lerp(y0, y1, 0.62));
    L.rect(x0, y0, x1 - x0, y1 - y0, m, (x, y) => { const u = Math.round(x - x0) % pw; return u < 1 ? 0.18 : u < 2 ? 0.62 : clamp(0.48 + (light || 0) - (y - y0) / (y1 - y0) * 0.16 + (((Math.round(x) * 5 + Math.round(y) * 11) % 37) === 0 ? 0.06 : 0), 0, 0.999); });
    L.rect(x0, rail, x1 - x0, Math.max(2, s(3)), m, (x, y) => (y < rail + 1 ? 0.85 : 0.3));
    L.rect(x0, y1 - s(14), x1 - x0, s(2), m, 4);
  }
  // papers on a desk: a ledger open at ruled pages, a stack of re-written tags with their strings
  function ledger(L, x, y, w, h, s) {
    const p = P(), cover = p.mat('#3a4a6a', { n: 5, at: 2 }), page = p.mat('#e8e0cc', { n: 4, at: 2 }), ink = p.mat('#5a5a6a', { n: 3, at: 1 });
    L.poly([[x, y + h], [x + s(4), y], [x + w - s(4), y], [x + w, y + h]], cover, (xx, yy) => (yy < y + 2 ? 0.9 : 0.4));
    L.poly([[x + s(2), y + h - s(2)], [x + s(5), y + s(2)], [x + w / 2 - 1, y + s(3)], [x + w / 2 - 1, y + h - s(1)]], page, (xx) => (xx < x + w * 0.3 ? 0.9 : 0.7));
    L.poly([[x + w / 2 + 1, y + h - s(1)], [x + w / 2 + 1, y + s(3)], [x + w - s(5), y + s(2)], [x + w - s(2), y + h - s(2)]], page, 0.6);
    for (let yy = y + s(6); yy < y + h - s(3); yy += Math.max(2, s(3))) { L.line(x + s(7), yy, x + w / 2 - s(3), yy, ink, 1); L.line(x + w / 2 + s(3), yy, x + w - s(7), yy, ink, 0); }
  }
  function tags(L, x, y, s, n) {
    const p = P(), card = p.mat('#e4d8b8', { n: 4, at: 2 }), string = p.mat('#a83a2a', { n: 3, at: 1 }), ink = p.mat('#4a4a5a', { n: 3, at: 1 });
    for (let i = 0; i < n; i++) {
      const tx = x + ((i * 5) % 3) * s(2) - s(1), ty = y - i * Math.max(1, s(1.6)), tw = s(20), th = s(10);
      L.poly([[tx, ty], [tx + tw - s(3), ty], [tx + tw, ty + th / 2], [tx + tw - s(3), ty + th], [tx, ty + th]], card, (xx, yy) => (yy < ty + 1 ? 0.95 : 0.65));
      if (i === n - 1) { L.line(tx + s(3), ty + s(3), tx + tw - s(6), ty + s(3), ink, 1); L.line(tx + s(3), ty + s(6), tx + tw - s(9), ty + s(6), ink, 1); }
    }
    L.path([[x + s(20), y - n * s(1.6) + s(5)], [x + s(28), y - s(2)], [x + s(34), y + s(6)]], 1, string, 1);
  }

  // ---- notice · faults: over Wataru's shoulder onto Ōmi behind her desk -------------------------------------
  function geomFaults(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const ox = Math.round(w * (lay === 'narrow' ? 0.56 : 0.58));
    // Ōmi's portrait bottom (the desk covers her below the chest); where the sheet leaves only a band, her face
    // stays in it and the desk goes under the sheet
    const oy = Math.max(Math.round(vb - s(lay === 'land' ? 26 : 30)) + s(14), 98), deskY = oy - s(14);
    const win = { x: Math.round(ox - s(70)), y: Math.round(Math.max(s(8), oy - 96 - s(40))), w: s(140), h: Math.round(Math.min(s(80), deskY - s(30) - Math.max(s(8), oy - 96 - s(40)))) };
    const led = { x: Math.round(ox - s(80)), y: deskY + s(6), w: s(60), h: s(20) }, tg = { x: Math.round(ox + s(30)), y: deskY + s(14) };
    return Object.assign(S, { ox, oy, deskY, win, led, tg });
  }
  function faultsStatic(G) {
    return cached('ch2.faults|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, deskY, win } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(1203);
      const L = p.layer(w, h);
      panelled(L, 0, 0, w, deskY + s(10), s, 0.05);
      // shelves of ledgers either side of the window, spines in muted colours (no lettering)
      const sp = [p.mat('#5a3a32', { n: 4, at: 2 }), p.mat('#3a4a5a', { n: 4, at: 2 }), p.mat('#5a5a3a', { n: 4, at: 2 }), p.mat('#6a5a4a', { n: 4, at: 2 })], shelf = p.mat('#4a3a2e', { n: 4, at: 2 });
      for (const [x0, x1] of [[s(10), win.x - s(20)], [win.x + win.w + s(20), w - s(10)]]) {
        if (x1 - x0 < s(30)) continue;
        for (let row = 0; row < 3; row++) {
          const yb = win.y + s(14) + row * s(28);
          if (yb > deskY - s(8)) break;
          for (let x = x0; x < x1 - s(4);) { const bw = s(4) + Math.floor(rnd() * s(4)), bh = s(16) + Math.floor(rnd() * s(8)); L.rect(x, yb - bh, bw, bh, sp[Math.floor(rnd() * 4)], (xx) => (xx < x + 1 ? 0.95 : 0.5)); x += bw + (rnd() < 0.15 ? s(6) : 0); }
          L.rect(x0 - s(2), yb, x1 - x0 + s(4), s(3), shelf, (xx, yy) => (yy < yb + 1 ? 0.9 : 0.4));
        }
      }
      L.erase(win.x, win.y, win.x + win.w, win.y + win.h, () => true);
      windowFrame(L, win.x, win.y, win.w, win.h, s);
      L.outline();
      harbour(g, win.x, win.y, win.w, win.h, s, rnd);
      g.drawImage(L.canvas(), 0, 0);
      // the light from the window on the wall either side, two flat steps
      g.fillStyle = 'rgba(255,248,220,0.06)'; g.fillRect(win.x - s(40), win.y, win.w + s(80), deskY - win.y);
      return { cv };
    });
  }
  function deskLayer(G) {
    return cached('ch2.desk|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, deskY, led, tg } = G, p = P();
      const L = p.layer(w, h), desk = p.mat(DESK, { n: 6, at: 3, step: 0.08 });
      L.rect(0, deskY, w, h - deskY, desk, (x, y) => (y < deskY + 1 ? 0.95 : y < deskY + s(4) ? 0.75 : clamp(0.55 - (y - deskY) / (h - deskY) * 0.3 + ((Math.round(x * 0.2 + y * 1.7) % 9) === 0 ? 0.1 : 0), 0, 0.999)));
      ledger(L, led.x, led.y, led.w, led.h, s);
      tags(L, tg.x, tg.y, s, 6);
      // an inkstone and a brush on its rest
      const stone = p.mat('#2e2e36', { n: 4, at: 2 }), br = p.mat('#8a6a3a', { n: 4, at: 2 });
      L.rect(Math.round(G.ox - s(18)), deskY + s(18), s(16), s(8), stone, (x, y) => (y < deskY + s(19) ? 0.9 : 0.4));
      L.seg(G.ox + s(4), deskY + s(22), G.ox + s(22), deskY + s(20), Math.max(1, s(1.6)), br, 0.7);
      L.outline();
      return L.canvas();
    });
  }
  const faults = {
    phases: [['company', 600], ['yours', 800]],
    safe: { wide: 'Ōmi\'s face and both hands in the top 60 %', narrow: 'Ōmi upper half, desk below', land: 'her face and the desk' },
    draw(c, w, h, t, st) {
      const G = geomFaults(w, h, st.vb), { s, ox, oy, deskY, led, tg } = G, still = st.still;
      c.drawImage(faultsStatic(G).cv, 0, 0);
      Q.gull(c, G.win.x + G.win.w * (0.3 + (still ? 0.2 : ((t / 30000) % 1) * 0.5)), G.win.y + G.win.h * 0.25, t, Math.max(1, s(1)), still);
      const kc = st.at('company'), ky = st.at('yours');
      const ob = Q.bust('omi', ky > 0.2 ? 'neutral' : 'think', ky > 0.2 ? { look: [1, 1] } : { look: [-1, 1] }, WIN);
      if (ob) c.drawImage(ob.cv, ox - ob.ax, oy - ob.ay);
      c.drawImage(deskLayer(G), 0, 0);
      // her hand: to the company's ledger on the company's fault, across to his tags on his
      const skin = Q.skinOf(look('omi'));
      const hx = lerp(lerp(ox + s(10), led.x + led.w * 0.62, ease(kc)), tg.x + s(10), ease(ky)), hy = lerp(lerp(deskY + s(2), led.y + s(6), ease(kc)), tg.y - s(4), ease(ky)) - Math.sin(Math.PI * ky) * s(6);
      const hd = Q.hand({ size: 12, pose: 'rest', side: 'R', angle: Math.PI * 0.42, skin, sleeve: look('omi').cloth[0], cuff: '#c8a050' });
      if (hd) c.drawImage(hd.cv, Math.round(hx - hd.ax), Math.round(hy - hd.ay));
      // the other hand rests flat at the desk's edge
      const h2 = Q.hand({ size: 12, pose: 'rest', side: 'L', angle: Math.PI * 0.55, skin, sleeve: look('omi').cloth[0], cuff: '#c8a050' });
      if (h2) c.drawImage(h2.cv, Math.round(ox - s(36) - h2.ax), Math.round(deskY + s(4) - h2.ay));
      // Wataru from behind at the left edge, close
      const wb = Q.back(look('wataru'), Math.round(clamp(s(180), 120, 230)), { light: 'r' });
      if (wb) c.drawImage(wb.cv, Math.round((G.lay === 'narrow' ? w * 0.08 : w * 0.14) - wb.ax), Math.round(G.vb + s(40) - wb.ay));
    },
    focus(w, h, vb) { const G = geomFaults(w, h, vb); return G.deskY > vb ? { x: G.ox - 30, y: G.oy - 88, w: 60, h: 56 } : { x: G.led.x, y: G.oy - 88, w: G.tg.x + G.s(24) - G.led.x, h: G.led.y + G.led.h - (G.oy - 88) }; },
  };

  // ---- notice · face: the reverse, close on Wataru ------------------------------------------------------------
  function geomFace(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const wx = Math.round(w * (lay === 'narrow' ? 0.46 : 0.44)), wy = Math.max(Math.round(vb + s(10)), 98);
    return Object.assign(S, { wx, wy });
  }
  function faceStatic(G) {
    return cached('ch2.face|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, wx, wy } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(733);
      const L = p.layer(w, h);
      panelled(L, 0, 0, w, h, s, 0.1);
      // the pinboard behind him: tags pinned in rows, a few re-written in his careful hand (marks only)
      const bx = Math.round(wx - s(84)), by = Math.round(Math.max(s(8), wy - 96 - s(20))), bw = s(200), bh = s(84);
      const cork = p.mat('#8a6a48', { n: 5, at: 2 }), fr = p.mat('#4a3a2e', { n: 4, at: 2 }), card = p.mat('#e4d8b8', { n: 4, at: 2 }), pin = p.mat('#a83a2a', { n: 3, at: 1 }), ink = p.mat('#4a4a5a', { n: 3, at: 1 });
      L.rect(bx, by, bw, bh, cork, (x, y) => (((Math.round(x) * 7 + Math.round(y) * 3) % 11) === 0 ? 0.3 : 0.6));
      L.rect(bx - s(3), by - s(3), bw + s(6), s(3), fr, 3); L.rect(bx - s(3), by + bh, bw + s(6), s(3), fr, 1); L.rect(bx - s(3), by, s(3), bh, fr, 2); L.rect(bx + bw, by, s(3), bh, fr, 1);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) {
        if (rnd() < 0.2) continue;
        const tx = bx + s(8) + i * s(23) + Math.floor(rnd() * s(4)), ty = by + s(8) + r * s(21) + Math.floor(rnd() * s(3));
        if (tx + s(16) > bx + bw) continue;
        L.rect(tx, ty, s(16), s(11), card, (x, y) => (y < ty + 1 ? 0.95 : 0.65)); L.dot(tx + s(8), ty + 1, pin, 2);
        L.line(tx + s(3), ty + s(5), tx + s(12), ty + s(5), ink, 1); if (rnd() < 0.6) L.line(tx + s(3), ty + s(8), tx + s(9), ty + s(8), ink, 1);
      }
      // a shelf of ledgers at the left
      const sp = [p.mat('#5a3a32', { n: 4, at: 2 }), p.mat('#3a4a5a', { n: 4, at: 2 }), p.mat('#5a5a3a', { n: 4, at: 2 })];
      for (let row = 0; row < 4; row++) { const yb = by + s(12) + row * s(30); if (yb > h) break; for (let x = s(4); x < bx - s(24);) { const bw2 = s(4) + Math.floor(rnd() * s(4)), bh2 = s(18) + Math.floor(rnd() * s(8)); L.rect(x, yb - bh2, bw2, bh2, sp[Math.floor(rnd() * 3)], (xx) => (xx < x + 1 ? 0.9 : 0.45)); x += bw2; } L.rect(0, yb, bx - s(20), s(3), fr, 2); }
      // a lamp bracket on the wall at the right, unlit (daytime)
      L.rect(w - s(60), by + s(10), s(3), s(24), fr, 2); L.ell(w - s(58), by + s(36), s(7), s(9), p.mat('#c8b890', { n: 4, at: 2 }), (x) => (x < w - s(60) ? 0.85 : 0.5));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // the window's light falls on him from our left
      g.fillStyle = 'rgba(255,246,220,0.08)'; g.fillRect(0, 0, Math.round(wx), h);
      return { cv };
    });
  }
  const face = {
    phases: [['look', 700], ['exhale', 900], ['soften', 800]],
    safe: { wide: 'his face in the top 55 %', narrow: 'face in the top third', land: 'his face' },
    draw(c, w, h, t, st) {
      const G = geomFace(w, h, st.vb), { s, wx, wy } = G;
      c.drawImage(faceStatic(G).cv, 0, 0);
      const kl = st.at('look'), ke = st.at('exhale'), ks = st.at('soften');
      // a brief upward look of surprise, then a careful exhale: eyes closed a moment, the shoulders down
      let expr = 'neutral', fr = null;
      if (ke > 0) { expr = ke < 0.55 ? 'closed' : 'neutral'; fr = { body: [0, 1], head: [0, 1], look: ke < 0.55 ? null : [0, 1] }; if (!fr.look) delete fr.look; }
      else if (kl > 0) { expr = 'surprise'; fr = kl < 0.5 ? { look: [0, -1], head: [0, -1] } : { head: [0, -1] }; }
      const wb = Q.bust('wataru', expr, fr, FACE, false, 200);
      if (wb) c.drawImage(wb.cv, wx - wb.ax, wy - wb.ay);
      // his notebook held at his chest; it lowers a little as he breathes out
      const skin = Q.skinOf(look('wataru')), drop = Math.round(ease(ke) * s(3));
      const nb = { x: Math.round(wx - s(26)), y: Math.round(wy - s(30) + drop) };
      R(c, nb.x, nb.y, s(34), s(26), '#5a3a2a'); R(c, nb.x + 1, nb.y + 1, s(34) - 2, 1, '#7a5a42'); R(c, nb.x + s(30), nb.y, s(4), s(26), '#e8e0cc');
      for (const [hx, side, ang] of [[nb.x - s(2), 'L', 0.9], [nb.x + s(36), 'R', Math.PI - 0.9]]) {
        const hd = Q.hand({ size: 10, pose: 'pinch', side, angle: -ang, skin, sleeve: look('wataru').cloth[0] });
        if (hd) c.drawImage(hd.cv, Math.round(hx - hd.ax), Math.round(nb.y + s(12) - hd.ay));
      }
      // Ōmi's shoulder and hat at the right edge; on his own route she turns a little toward him
      const turn = ease(ks);
      const ob = Q.back(look('omi'), Math.round(clamp(s(220), 150, 280)), { light: 'l' });
      if (ob) {
        const bx = Math.round(Math.min(w - s(10), G.wx + s(250)) - turn * s(16)), by = Math.round(G.vb + s(96));
        c.drawImage(ob.cv, bx - ob.ax, by - ob.ay);
        if (turn > 0) {
          // the edge of her cheek and jaw coming into view: her face turned toward him, softened
          const hx0 = bx - ob.ax + ob.head.x - ob.head.r, hy0 = by - ob.ay + ob.head.y;
          const sk = Q.skinOf(look('omi'))[0];
          c.globalAlpha = step4(turn);
          c.fillStyle = sk; P().disc(c, hx0 + 1, hy0 + Math.round(ob.head.r * 0.25), Math.max(2, Math.round(ob.head.r * 0.35)), Math.max(3, Math.round(ob.head.r * 0.55)));
          c.fillStyle = '#5a3a2e'; c.fillRect(hx0 - Math.round(ob.head.r * 0.25), hy0 - Math.round(ob.head.r * 0.05), 2, 1); // the closed, softened eye
          c.globalAlpha = 1;
        }
      }
    },
    focus(w, h, vb) { const G = geomFace(w, h, vb); return { x: G.wx - 34, y: G.wy - 92, w: 68, h: 60 }; },
  };

  // ---- notice · room: the office from the window side ----------------------------------------------------------
  function geomRoom(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const yF = Math.round(vb * (lay === 'land' ? 0.6 : lay === 'narrow' ? 0.6 : 0.68));   // the floor's far edge (the back wall's foot)
    const cx = Math.round(w * (lay === 'narrow' ? 0.5 : 0.48));
    const deskY = Math.round(lerp(yF, vb, 0.42));
    const sc = clamp(S.Z * (lay === 'land' ? 1 : 1), 0.6, 1);
    return Object.assign(S, { yF, cx, deskY, sc });
  }
  function roomStatic(G) {
    return cached('ch2.room|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, yF, cx, deskY } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(904);
      const L = p.layer(w, h);
      panelled(L, 0, 0, w, yF, s, 0.08);
      // the floor: boards running toward us, the window's light on them
      const fl = p.mat('#7a6048', { n: 6, at: 3, step: 0.07 });
      L.rect(0, yF, w, h - yF, fl, (x, y) => { const d = y - yF, gap = Math.max(2, Math.round(2 + d * 0.12)); return (d % gap) === 0 ? 0.25 : clamp(0.5 + ((Math.round(x / (gap * 9)) + Math.floor(d / gap)) % 3) * 0.06, 0, 0.999); });
      L.rect(0, yF, w, Math.max(1, s(3)), p.mat('#4a3a2e', { n: 4, at: 2 }), 1);
      // the door to the quay at the left of the back wall, open a hand's width (the harbour light), a coat rack
      const dX = Math.round(cx - s(150)), dW = s(40), dT = yF - s(80);
      if (dX > s(4)) {
        L.rect(dX, dT, dW, yF - dT, p.mat('#5a4636', { n: 5, at: 2 }), (x) => (x < dX + s(6) ? 0.3 : 0.55));
        L.rect(dX - s(4), dT - s(4), dW + s(8), s(4), p.mat('#4a3a2e', { n: 4, at: 2 }), 3);
      }
      // a ceiling beam across the top, a framed chart of the coast (an outline and soundings: no lettering)
      L.rect(0, 0, w, s(10), p.mat('#3e3026', { n: 4, at: 2 }), (x, y) => (y > s(8) ? 0.2 : 0.55));
      {
        const fx = Math.round(cx + s(70)), fy = Math.round(yF - s(96)), fw = s(70), fh = s(46);
        if (fx + fw < w - s(60) && fy > s(14)) {
          L.rect(fx - s(3), fy - s(3), fw + s(6), fh + s(6), p.mat('#4a3a2e', { n: 4, at: 2 }), 2);
          L.rect(fx, fy, fw, fh, p.mat('#d8cca8', { n: 4, at: 2 }), 2);
          const ink = p.mat('#5a6a7a', { n: 3, at: 1 }), coast = [];
          for (let i = 0; i <= 12; i++) coast.push([fx + s(4) + i * (fw - s(8)) / 12, fy + fh * (0.3 + 0.25 * Math.sin(i * 0.9) + 0.1 * Math.sin(i * 2.3))]);
          L.path(coast, 1, ink, 1);
          for (let i = 0; i < 9; i++) L.dot(fx + s(6) + ((i * 37) % (fw - s(12))), fy + fh * 0.62 + ((i * 13) % Math.round(fh * 0.3)), ink, 1);
        }
      }
      // the counter of pigeonholes behind the desk (ledger spines)
      const sp = [p.mat('#5a3a32', { n: 4, at: 2 }), p.mat('#3a4a5a', { n: 4, at: 2 }), p.mat('#5a5a3a', { n: 4, at: 2 })];
      for (let row = 0; row < 2; row++) { const yb = yF - s(36) - row * s(26); for (let x = cx - s(70); x < cx + s(70);) { const bw = s(4) + Math.floor(rnd() * s(4)); L.rect(x, yb - s(18), bw, s(18), sp[Math.floor(rnd() * 3)], (xx) => (xx < x + 1 ? 0.9 : 0.45)); x += bw; } L.rect(cx - s(74), yb, s(148), s(3), p.mat('#4a3a2e', { n: 4, at: 2 }), 2); }
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // the window at our right, tall, the harbour in it; its light across the floor
      const wx = w - s(46), wy = Math.round(yF - s(110));
      const W2 = p.layer(w, h);
      windowFrame(W2, wx, wy, s(60), s(96), s);
      W2.outline();
      harbour(g, wx, wy, s(60), s(96), s, rnd);
      g.drawImage(W2.canvas(), 0, 0);
      g.fillStyle = 'rgba(255,246,214,0.1)';
      g.beginPath(); g.moveTo(wx, yF + s(4)); g.lineTo(w, yF + s(4)); g.lineTo(w - s(60), h); g.lineTo(cx - s(40), h); g.fill();
      void deskY;
      return { cv };
    });
  }
  const COMP_REACT = { mio: 'p:nod2', ren: 'p:nod1', suzu: 'p:size_out', nao: 'p:stiff~l' };
  const room = {
    phases: [['aside', 900], ['point', 1300]],
    safe: { wide: 'the four in the top 60 %', narrow: 'Ōmi and Wataru, the pair at the bottom edge above the sheet', land: 'the desk and the four' },
    draw(c, w, h, t, st) {
      const G = geomRoom(w, h, st.vb), { s, cx, deskY, sc } = G;
      c.drawImage(roomStatic(G).cv, 0, 0);
      const ka = st.at('aside'), kp = st.at('point');
      const sun = { rim: { side: 'r', col: '#fff0d0', k: [0.45, 0.2] }, mul: [0.98, 0.96, 0.95], add: [4, 3, 0] };
      // Ōmi behind her desk: palm toward Wataru, pointing to the window (Lanternfall) on the Kurobe line,
      // then her open hand back toward him
      const omiKey = kp > 0.05 && kp < 0.7 ? 'p:point.L' : kp >= 0.7 ? 'p:palm.L' : 'p:palm.L';
      const fo = Q.figure(look('omi'), 'down', omiKey, sc, sun);
      if (fo) c.drawImage(fo.cv, cx - fo.ax, Math.round(deskY - s(2) - fo.ay));
      // the desk in front of her
      const p = P(), D = p.layer(w, h), desk = p.mat(DESK, { n: 6, at: 3, step: 0.08 });
      D.rect(cx - s(46), deskY - s(14), s(92), s(14), desk, (x, y) => (y < deskY - s(13) ? 0.95 : y < deskY - s(10) ? 0.78 : 0.4));
      D.rect(cx - s(42), deskY, s(4), s(10), desk, 0.3); D.rect(cx + s(38), deskY, s(4), s(10), desk, 0.3);
      D.rect(cx - s(30), deskY - s(17), s(18), s(4), p.mat('#3a4a6a', { n: 4, at: 2 }), 2); D.rect(cx + s(10), deskY - s(16), s(12), s(3), p.mat('#e4d8b8', { n: 4, at: 2 }), 2);
      D.outline();
      c.drawImage(D.canvas(), 0, 0);
      // Wataru at the desk's right corner, facing her, the notice not yet in his hands
      const fw = Q.figure(look('wataru'), 'left', 'i0', sc, sun);
      if (fw) c.drawImage(fw.cv, Math.round(cx + s(70) - fw.ax), Math.round(deskY + s(10) - fw.ay));
      // you and your companion a little apart at the left, side on, toward the desk
      const yP = Math.round(Math.min(G.vb - s(6), deskY + s(22)));
      const comp = st.cast.comp;
      if (comp) {
        const react = ka > 0.15 && ka < 1 ? (COMP_REACT[comp.id] || 'p:nod1') : comp.id === 'nao' && ka >= 1 ? 'p:stiff~r' : 'i0';
        const fc = Q.figure(comp.look, 'right', react, sc, sun);
        if (fc) c.drawImage(fc.cv, Math.round(cx - s(132) - fc.ax), Math.round(yP + s(2) - fc.ay));
      }
      const fp = Q.figure(st.cast.pc, 'right', 'i0', sc, sun);
      if (fp) c.drawImage(fp.cv, Math.round(cx - s(94) - fp.ax), yP - fp.ay);
      // a lamp hanging from the beam, unlit in the daytime; dust in the window's light
      R(c, cx - s(30), s(10), 1, s(26), '#2a221c'); P().disc(c, cx - s(30), s(40), s(6), s(5)); c.fillStyle = '#c8b890'; P().disc(c, cx - s(31), s(39), s(4), s(3));
      Q.dust(c, w - s(110), deskY - s(60), w - s(10), G.vb, -s(40), t, 14, '255,246,214', st.still, 31);
    },
    focus(w, h, vb) { const G = geomRoom(w, h, vb); return { x: G.cx - G.s(124), y: G.deskY - G.s(58), w: G.s(206), h: G.s(66) }; },
  };

  // ---- notice · the hands across the desk ---------------------------------------------------------------------
  function geomNotice(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const yW = Math.round(vb * (lay === 'narrow' ? 0.18 : 0.26));     // the window strip's bottom (the desk's far edge)
    const ex = Math.round(w * 0.5), ey = Math.round(lerp(yW, vb, 0.56)); // the envelope's place between the hands
    const k = clamp(Math.min(w / 260, (vb - yW) / 70), 0.7, 3);
    return Object.assign(S, { yW, ex, ey, k });
  }
  function noticeStatic(G) {
    return cached('ch2.notice|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, yW } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(2718);
      // the window across the top: frame, the harbour beyond
      harbour(g, 0, 0, w, yW, s, rnd);
      const L = p.layer(w, h);
      windowFrame(L, s(6), s(4), w - s(12), Math.max(s(10), yW - s(10)), s);
      // the desk close: grain running across, the light from the window on its far half
      const desk = p.mat(DESK, { n: 7, at: 3, step: 0.07 });
      L.rect(0, yW, w, h - yW, desk, (x, y) => clamp(0.62 - (y - yW) / (h - yW) * 0.3 + (Math.sin(y * 0.55 + Math.sin(x * 0.03) * 2) > 0.85 ? 0.12 : 0) - (Math.sin(y * 0.21 + x * 0.004) > 0.92 ? 0.1 : 0), 0, 0.999));
      L.rect(0, yW, w, Math.max(1, s(2)), desk, 6);
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv };
    });
  }
  // the final notice: an envelope of heavy paper with a red seal across its flap; open: the flap up, the
  // letter's edge inside (ruled marks only)
  function envelope(c, x, y, k, open, s) {
    const W = Math.round(64 * k), H = Math.round(40 * k), x0 = Math.round(x - W / 2), y0 = Math.round(y - H / 2);
    c.fillStyle = 'rgba(30,18,10,0.3)'; c.fillRect(x0 + Math.round(3 * k), y0 + Math.round(4 * k), W, H);
    if (open > 0) {
      // the letter rising a little out of the opened envelope
      const ly = Math.round(y0 - open * 10 * k);
      R(c, x0 + Math.round(5 * k), ly, W - Math.round(10 * k), Math.round(H * 0.6), '#f2ecdc');
      for (let i = 0; i < 4; i++) R(c, x0 + Math.round(10 * k), ly + Math.round((5 + i * 4) * k), W - Math.round((22 + (i % 2) * 10) * k), 1, '#8a8478');
    }
    R(c, x0, y0, W, H, '#e6dcc4'); R(c, x0, y0, W, 1, '#f6f0e0'); R(c, x0, y0 + H - 1, W, 1, '#b8aa8a'); R(c, x0 + W - 1, y0, 1, H, '#c4b696');
    // the flap: closed, a triangle down to the seal; open, folded up behind
    c.fillStyle = open > 0 ? '#d4c8aa' : '#ddd2b6';
    const fy = open > 0 ? y0 - Math.round(H * 0.45 * ease(open)) : y0 + Math.round(H * 0.55);
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + W, y0); c.lineTo(x0 + W / 2, fy); c.closePath(); c.fill();
    c.fillStyle = '#a89a7a'; c.fillRect(x0, y0, W, 1);
    // the seal: whole, or two halves pulled apart
    const sx = Math.round(x0 + W / 2), sy = Math.round(y0 + H * 0.55), sr = Math.max(2, Math.round(6 * k));
    const gap = Math.round(clamp(open * 3, 0, 1) * 4 * k);
    c.fillStyle = '#8a2422'; P().disc(c, sx - gap, sy, sr, sr); if (gap) { c.fillStyle = '#e6dcc4'; c.fillRect(sx - gap, sy - sr, gap * 2, sr * 2 + 1); c.fillStyle = '#8a2422'; P().disc(c, sx + gap, sy, sr, sr); c.fillStyle = '#e6dcc4'; c.fillRect(sx - gap + 1, sy - sr, gap * 2 - 2, sr * 2 + 1); }
    c.fillStyle = '#b8443a'; c.fillRect(sx - gap - Math.round(sr * 0.4), sy - Math.round(sr * 0.5), Math.max(1, Math.round(sr * 0.5)), 1);
    return { x0, y0, W, H };
  }
  const noticeShot = {
    phases: [['hand', 900], ['steady', 700], ['seal', 1200]],
    safe: { wide: 'hands and envelope central', narrow: 'the envelope in the upper half', land: 'the hands and the envelope' },
    draw(c, w, h, t, st) {
      const G = geomNotice(w, h, st.vb), { s, ex, ey, k } = G, still = st.still;
      c.drawImage(noticeStatic(G).cv, 0, 0);
      const kh = st.at('hand'), kst = st.at('steady'), ksl = st.at('seal');
      // a gull crosses the window as the seal breaks
      if (ksl > 0 && ksl < 1 && !still) Q.gull(c, lerp(-s(10), w + s(10), ksl), G.yW * 0.4 + Math.sin(ksl * 6) * s(3), t, Math.max(1, s(1.5)), false);
      else if (ksl >= 1 || (still && ksl > 0)) Q.gull(c, w * 0.78, G.yW * 0.35, t, Math.max(1, s(1.5)), true);
      // the envelope: from your hand (lower left) to his (upper right), one envelope only
      const e = ease(kh);
      const x = lerp(ex - 34 * k, ex + 10 * k, e), y = lerp(ey + 14 * k, ey - 2 * k, e);
      const tremble = still ? 0 : kst < 1 ? Math.round(Math.sin(t / 45) * (1 - kst) * (kh >= 1 ? 1.2 : 0)) : 0;
      const pc = st.cast.pc || {}, pskin = Q.skinOf(pc), psleeve = Q.clothOf(pc)[0];
      const wskin = Q.skinOf(look('wataru')), wsleeve = look('wataru').cloth[0];
      const sz = Math.round(24 * k);
      // your hand, holding it out, then letting go and drawing back
      const back = ease(clamp((kh - 0.55) / 0.45, 0, 1));
      const ph = Q.hand({ size: sz, pose: back > 0.1 ? 'rest' : 'pinch', side: 'R', angle: -0.5, skin: pskin, sleeve: psleeve });
      if (ph) c.drawImage(ph.cv, Math.round(lerp(x - 34 * k, -30 * k, back) - ph.ax), Math.round(lerp(y + 12 * k, G.vb + 40 * k, back) - ph.ay));
      const env = envelope(c, x + tremble, y, k, ksl, s);
      // his two hands taking it, from the upper right
      const reach = ease(clamp(kh / 0.6, 0, 1));
      const hA = Q.hand({ size: sz, pose: kh > 0.5 ? 'pinch' : 'offer', side: 'L', angle: Math.PI + 0.55, skin: wskin, sleeve: wsleeve });
      const hB = Q.hand({ size: sz, pose: kh > 0.5 ? 'pinch' : 'offer', side: 'R', angle: Math.PI - 0.35, skin: wskin, sleeve: wsleeve });
      if (hA) c.drawImage(hA.cv, Math.round(lerp(w + 30 * k, env.x0 + env.W + 6 * k, reach) + tremble - hA.ax), Math.round(env.y0 + env.H * 0.35 - hA.ay));
      if (hB && reach > 0.5) c.drawImage(hB.cv, Math.round(lerp(w + 40 * k, env.x0 + env.W * 0.66, reach) + tremble - hB.ax), Math.round(env.y0 - 5 * k - hB.ay));
    },
    focus(w, h, vb) { const G = geomNotice(w, h, vb), k = G.k; return { x: Math.round(G.ex - 66 * k), y: Math.round(G.ey - 24 * k), w: Math.round(108 * k), h: Math.round(52 * k) }; },
  };

  RB.sequence.define('ch2.notice', {
    title: { en: 'The notice, opened', jp: '{督促状|とくそくじょう} を {開|ひら}く' }, chapter: 2, scene: 'sg.omi_wataru', memory: true,
    memo: { jp: '', en: 'In the harbour office, Wataru opened the notice he had been too frightened to open.' },
    shots: { faults, face, room, notice: noticeShot },
  });

  // ---- ch2.plate: the glassworks ----------------------------------------------------------------------------
  // the workshop behind the counter: the furnace (lit only once the story has lit it), shelves of glass
  // floats catching the light, tools on hooks, the window to the harbour
  function shop(L, g, G, lit, rnd) {
    const p = P(), { w, h, s, back } = G;
    const brick = p.mat('#7a4a3a', { n: 5, at: 2, step: 0.08 }), wall = p.mat('#5a4a40', { n: 6, at: 3, step: 0.07 });
    L.rect(0, 0, w, back, wall, (x, y) => ((Math.round(x) % s(90)) < s(6) ? ((Math.round(x) % s(90)) < 1 ? 0.2 : 0.38) : clamp(0.52 + (lit ? 0.06 : 0) - y / back * 0.1 + (((x * 7 + y * 13) % 29) === 0 ? 0.08 : 0), 0, 0.999)));
    // the furnace: a brick dome with its mouth
    const fx = Math.round(w * 0.22), fy = back, fr = s(46);
    L.fill(fx - fr, fy - fr * 1.3, fx + fr, fy, (x, y) => ((x - fx) / fr) ** 2 + ((y - fy) / (fr * 1.3)) ** 2 <= 1, brick, (x, y) => (((Math.round(y) % s(5)) < 1 || ((Math.round(x + (Math.floor(y / s(5)) % 2) * s(4)) % s(8)) < 1)) ? 0.2 : clamp(0.62 - (x - fx) / fr * 0.25, 0, 0.999)));
    L.ell(fx, fy - fr * 0.45, fr * 0.36, fr * 0.3, p.solid(lit ? '#ffb050' : '#1c1416'), 0);
    // shelves of glass floats on the right
    const glass = [p.mat('#4a9a8a', { n: 5, at: 2 }), p.mat('#5a7ab8', { n: 5, at: 2 }), p.mat('#8ab86a', { n: 5, at: 2 })], shelf = p.mat('#4a3a2e', { n: 4, at: 2 });
    for (let row = 0; row < 2; row++) {
      const yb = Math.round(back * (0.42 + row * 0.3));
      for (let x = Math.round(w * 0.6); x < w - s(16); x += s(16)) { const r = s(5) + Math.floor(rnd() * s(2)); L.ell(x + s(7), yb - r, r, r, glass[Math.floor(rnd() * 3)], p.sphere(x + s(5), yb - r - s(2), r, r, { amb: 0.3 })); }
      L.rect(Math.round(w * 0.58), yb, Math.round(w * 0.4), s(3), shelf, 2);
    }
    // tools on hooks: blowpipes, tongs
    for (let i = 0; i < 4; i++) { const x = Math.round(w * 0.42) + i * s(10); L.rect(x, Math.round(back * 0.2), Math.max(1, s(2)), Math.round(back * 0.5), p.mat('#6a6a72', { n: 4, at: 2 }), 2); }
    void g; void h;
    return { fx, fy, fr };
  }
  function geomShop(w, h, vb, near) {
    const S = stage(w, h, vb), { s, lay } = S;
    // her portrait's bottom; where the sheet leaves only a band (a phone on its side) her face stays in it
    const ay0 = Math.round(near ? vb + s(4) : vb * 0.78 + s(10)), ay = Math.max(ay0, 98);
    const back = near ? Math.round(vb * 0.9) : ay - s(10);       // the counter line (under the sheet in a band)
    const band = ay > ay0;
    const ax = Math.round(w * (lay === 'narrow' ? 0.56 : near ? (band ? 0.36 : 0.5) : 0.56));
    return Object.assign(S, { back, ax, ay, band, near: !!near });
  }
  function shopStatic(G, lit) {
    return cached('ch2.shop|' + (G.near ? 'n' : 'm') + '|' + (lit ? 1 : 0) + '|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, back } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(55);
      const L = p.layer(w, h);
      const f = shop(L, g, G, lit, rnd);
      if (!G.near) {
        // the counter: a thick board with the light along its edge, the front in shadow
        const ctr = p.mat('#7a5a3e', { n: 6, at: 3, step: 0.08 });
        L.rect(0, back, w, s(10), ctr, (x, y) => (y < back + 1 ? 0.98 : y < back + s(7) ? 0.75 : 0.55));
        L.rect(0, back + s(10), w, h - back, p.mat('#4e3828', { n: 5, at: 3 }), (x, y) => ((Math.round(x) % s(30)) < 1 ? 0.15 : 0.45));
      }
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      if (lit) { P().halo(g, f.fx, f.fy - Math.round(f.fr * 0.45), Math.round(f.fr * 2.2), '255,160,80', 0.22, 4); }
      return { cv, f };
    });
  }
  // the registry card: stiff paper with ruled lines and a stamp (marks, not writing)
  function regCard(c, x, y, k, ang) {
    const W = Math.round(46 * k), H = Math.round(30 * k);
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(ang || 0);
    c.fillStyle = 'rgba(30,18,10,0.3)'; c.fillRect(-W / 2 + 2, -H / 2 + 3, W, H);
    c.fillStyle = '#ece2c8'; c.fillRect(-W / 2, -H / 2, W, H);
    c.fillStyle = '#c8b894'; c.fillRect(-W / 2, H / 2 - 1, W, 1); c.fillRect(W / 2 - 1, -H / 2, 1, H);
    c.fillStyle = '#8a8478'; for (let i = 0; i < 4; i++) c.fillRect(-W / 2 + Math.round(4 * k), -H / 2 + Math.round((6 + i * 6) * k), Math.round(W * (i % 2 ? 0.5 : 0.7)), 1);
    c.fillStyle = '#a83a2a'; c.fillRect(W / 2 - Math.round(12 * k), -H / 2 + Math.round(4 * k), Math.round(8 * k), Math.round(8 * k));
    c.restore();
  }
  const card = {
    phases: [['show', 800], ['know', 600], ['take', 900]],
    safe: { wide: 'her face and the card in the top 60 %', narrow: 'her face above, the card below', land: 'her face and the card' },
    draw(c, w, h, t, st) {
      const lit = st.test('sg_boss_done');
      const G = geomShop(w, h, st.vb, false), { s, ax, ay, back } = G, still = st.still;
      const S0 = shopStatic(G, lit);
      c.drawImage(S0.cv, 0, 0);
      if (lit && !still) { const fl = 0.8 + 0.2 * Math.sin(t / 230); c.globalAlpha = fl; P().halo(c, S0.f.fx, S0.f.fy - Math.round(S0.f.fr * 0.45), Math.round(S0.f.fr * 0.6), '255,210,120', 0.25, 3); c.globalAlpha = 1; }
      const ks = st.at('show'), kn = st.at('know'), kt = st.at('take');
      const expr = kt > 0.3 ? 'smile' : kn > 0.1 ? 'surprise' : 'neutral';
      const fr = kt > 0.3 ? null : kn > 0.1 ? { head: [0, 1], look: [0, 1] } : { look: [0, 1] };
      const g2 = lit ? { mul: [1, 0.94, 0.86], add: [10, 4, 0], rim: { side: 'l', col: '#ffc070', k: [0.45, 0.2], below: 0.85 } } : { mul: [0.95, 0.94, 0.96], add: [2, 2, 6] };
      const ab = Q.bust('asahi', expr, fr, g2);
      if (ab) c.drawImage(ab.cv, ax - ab.ax, ay - ab.ay);
      // the counter in front of her (it covers her below the chest)
      c.drawImage(S0.cv, 0, back, w, h - back, 0, back, w, h - back);
      // the card: slid onto the counter by your hand; then Asahi takes it up
      const pc = st.cast.pc || {}, k = clamp(G.Z * 0.9, 0.7, 1.1);
      const cx0 = ax - s(30), cy0 = back + s(5);
      const cxs = lerp(s(30), cx0, ease(ks)), cys = lerp(G.vb + s(20), cy0, ease(ks));
      const take = ease(kt);
      const cx = lerp(cxs, ax + s(44), take), cy = lerp(cys, ay - s(22), take);
      regCard(c, cx, cy, k, lerp(-0.1, 0.05, take));
      const out = ease(clamp((ks - 0.6) / 0.4, 0, 1));
      const ph = Q.hand({ size: Math.round(13 * k), pose: 'rest', side: 'R', angle: -0.3, skin: Q.skinOf(pc), sleeve: Q.clothOf(pc)[0] });
      if (ph && out < 1) c.drawImage(ph.cv, Math.round(lerp(cxs - s(16) * k, s(-20), out) - ph.ax), Math.round(lerp(cys + s(8), G.vb + s(30), out) - ph.ay));
      if (take > 0) { const hd = Q.hand({ size: Math.round(11 * k), pose: 'pinch', side: 'L', angle: Math.PI * 0.62, skin: Q.skinOf(look('asahi')), sleeve: look('asahi').cloth[0] }); if (hd) c.drawImage(hd.cv, Math.round(cx + s(14) * k - hd.ax), Math.round(cy - hd.ay)); }
    },
    focus(w, h, vb) { const G = geomShop(w, h, vb, false); return G.band ? { x: G.ax - 30, y: G.ay - 88, w: 60, h: 56 } : { x: G.ax - G.s(70), y: G.ay - 88, w: G.s(70) + 48, h: G.back + G.s(12) - (G.ay - 88) }; },
  };

  // ---- plate · work: the hands at the bench, the plate taking shape ------------------------------------------
  function geomWork(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const yW = Math.round(vb * (lay === 'narrow' ? 0.16 : 0.22));
    const k = clamp(Math.min(w / 250, (vb - yW) / 78), 1.1, 3);
    const px = Math.round(w * 0.48), py = Math.round(lerp(yW, vb, 0.52));
    return Object.assign(S, { yW, k, px, py });
  }
  // the chidori (a plover) cut into the plate: a round body, a short beak, a wing, a tail — as a path of
  // points the chisel follows (an emblem, not a character)
  const BIRD = [[-0.30, 0.10], [-0.36, -0.02], [-0.30, -0.14], [-0.16, -0.2], [-0.04, -0.16], [0.02, -0.26], [0.1, -0.3], [0.14, -0.26], [0.1, -0.2], [0.18, -0.16], [0.3, -0.18], [0.24, -0.08], [0.32, 0.02], [0.2, 0.06], [0.06, 0.14], [-0.12, 0.16], [-0.30, 0.10]];
  const WING = [[-0.18, -0.04], [-0.02, -0.1], [0.14, -0.06], [0.0, 0.04], [-0.16, 0.04]];
  function workStatic(G) {
    return cached('ch2.work|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, yW } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(808);
      harbour(g, 0, 0, w, yW, s, rnd);
      const L = p.layer(w, h);
      windowFrame(L, s(6), s(4), w - s(12), Math.max(s(10), yW - s(10)), s);
      // the bench: a scarred plank, burn marks, a scatter of shavings at its edge
      const bench = p.mat('#8a6a48', { n: 7, at: 3, step: 0.07 });
      L.rect(0, yW, w, h - yW, bench, (x, y) => clamp(0.6 - (y - yW) / (h - yW) * 0.28 + (Math.sin(y * 0.4 + Math.sin(x * 0.02) * 3) > 0.88 ? 0.12 : 0) - (((x * 13 + y * 7) % 97) === 0 ? 0.4 : 0), 0, 0.999));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      for (let i = 0; i < 6; i++) { const x = Math.round(rnd() * w), y = Math.round(yW + s(10) + rnd() * (h - yW)); P().disc(g, x, y, s(3), s(2)); }
      return { cv };
    });
  }
  function plate(c, x, y, k, carve, sheen, s, hold) {
    const W = Math.round(110 * k), H = Math.round(48 * k), x0 = Math.round(x - W / 2), y0 = Math.round(y - H / 2);
    c.fillStyle = 'rgba(40,24,12,0.32)'; c.fillRect(x0 + Math.round(3 * k), y0 + Math.round(4 * k), W, H);
    // a board of pale hinoki with rounded corners and grain
    for (let yy = 0; yy < H; yy++) {
      const inset = yy < 2 || yy > H - 3 ? 2 : yy < 4 || yy > H - 5 ? 1 : 0;
      c.fillStyle = yy < 2 ? '#e8d0a0' : yy > H - 4 ? '#b89060' : (Math.sin(yy * 0.9 + x0 * 0.01) > 0.7 ? '#d0b080' : '#dcbc8c');
      c.fillRect(x0 + inset, y0 + yy, W - inset * 2, 1);
    }
    // the carved line: the bird, cut as far as the chisel has gone
    const pts = BIRD.map(([u, v]) => [x + u * W * 0.9, y + v * H * 1.4]).concat(WING.map(([u, v]) => [x + u * W * 0.9, y + v * H * 1.4]));
    const segs = pts.length - 1, upto = carve * segs;
    let tip = pts[0];
    for (let i = 0; i < segs; i++) {
      if (i === BIRD.length - 1) continue; // (the wing starts a new cut)
      const f = clamp(upto - i, 0, 1);
      if (f <= 0) break;
      const a = pts[i], b = pts[i + 1], bx = a[0] + (b[0] - a[0]) * f, by = a[1] + (b[1] - a[1]) * f;
      const n = Math.max(1, Math.ceil(Math.hypot(bx - a[0], by - a[1])));
      for (let j = 0; j <= n; j++) { const px = Math.round(a[0] + (bx - a[0]) * j / n), py = Math.round(a[1] + (by - a[1]) * j / n); c.fillStyle = '#7a5434'; c.fillRect(px, py, Math.max(1, Math.round(k)), Math.max(1, Math.round(k))); c.fillStyle = '#f0dcb0'; c.fillRect(px, py + Math.max(1, Math.round(k)), Math.max(1, Math.round(k)), 1); }
      tip = [bx, by];
    }
    // the eye, last
    if (carve >= 1) { c.fillStyle = '#5a3a24'; c.fillRect(Math.round(x + 0.12 * W * 0.9), Math.round(y - 0.24 * H * 1.4), Math.max(1, Math.round(k)), Math.max(1, Math.round(k))); }
    // the sheen of the polish passing once along the board
    if (sheen > 0 && sheen < 1) { const sx = Math.round(x0 + W * sheen); c.fillStyle = 'rgba(255,248,224,0.35)'; c.fillRect(sx - Math.round(6 * k), y0 + 1, Math.round(6 * k), H - 2); }
    if (sheen >= 1 && hold) { c.fillStyle = 'rgba(255,248,224,0.18)'; c.fillRect(x0 + 2, y0 + 2, W - 4, Math.max(1, Math.round(2 * k))); }
    void s;
    return { tip, x0, y0, W, H };
  }
  const work = {
    phases: [['carve', 1500]],
    safe: { wide: 'the plate and the hands central', narrow: 'the plate in the upper half', land: 'the plate and the hands' },
    draw(c, w, h, t, st) {
      const G = geomWork(w, h, st.vb), { s, k, px, py } = G, still = st.still;
      c.drawImage(workStatic(G).cv, 0, 0);
      // a gull now and then beyond the window
      if (!still) { const ph = (t / 11000) % 1; if (ph < 0.4) Q.gull(c, lerp(w + s(10), -s(10), ph / 0.4), G.yW * 0.4, t, Math.max(1, s(1.4)), false); }
      const kc = st.at('carve'), carve = clamp(kc / 0.75, 0, 1), sheen = clamp((kc - 0.75) / 0.25, 0, 1);
      const pl = plate(c, px, py, k, carve, sheen, s, st.hold || still);
      // shavings curling off as the line goes
      const rnd = P().rnd(99);
      for (let i = 0; i < Math.round(carve * 12); i++) { const x = pl.x0 + rnd() * pl.W, y = pl.y0 + pl.H + s(4) + rnd() * s(14); c.fillStyle = '#e8cc98'; P().ring(c, x, y, Math.max(1, Math.round(2 * k)), 1); }
      // her left hand steadying the plate; her right with the chisel at the line's end (laid down at the end)
      const skin = Q.skinOf(look('asahi')), sleeve = look('asahi').cloth[0];
      const hl = Q.hand({ size: Math.round(22 * k), pose: 'rest', side: 'L', angle: 0.25, skin, sleeve });
      if (hl) c.drawImage(hl.cv, Math.round(pl.x0 - s(8) * k - hl.ax), Math.round(pl.y0 + pl.H * 0.7 - hl.ay));
      const done = kc >= 1 || still;
      const tip = done ? [pl.x0 + pl.W + s(26) * k, pl.y0 + pl.H * 0.8] : pl.tip;
      const jit = still || done ? 0 : Math.sin(t / 60) * 0.6;
      // the chisel: a steel blade into a wooden handle, held in her fist
      const cl = Math.round(34 * k), ang = done ? -0.2 : -0.75;
      const ex = tip[0] + Math.cos(ang + Math.PI) * cl * -1, ey = tip[1] + Math.sin(ang + Math.PI) * cl * -1;
      c.strokeStyle = '#b8bcc4'; c.lineWidth = Math.max(1, Math.round(2 * k)); c.beginPath(); c.moveTo(Math.round(tip[0]), Math.round(tip[1] + jit)); c.lineTo(Math.round((tip[0] + ex) / 2), Math.round((tip[1] + ey) / 2 + jit)); c.stroke();
      c.strokeStyle = '#7a4a2a'; c.lineWidth = Math.max(2, Math.round(4 * k)); c.beginPath(); c.moveTo(Math.round((tip[0] + ex) / 2), Math.round((tip[1] + ey) / 2 + jit)); c.lineTo(Math.round(ex), Math.round(ey + jit)); c.stroke();
      const hr = Q.hand({ size: Math.round(22 * k), pose: 'grip', side: 'R', angle: ang + Math.PI, skin, sleeve });
      if (hr) c.drawImage(hr.cv, Math.round(ex - hr.ax), Math.round(ey + jit - hr.ay));
      // the polishing cloth folded beside the plate at the end
      if (sheen > 0) { c.fillStyle = '#d8d2c4'; c.fillRect(Math.round(pl.x0 + pl.W * 0.2), Math.round(pl.y0 + pl.H + s(8)), Math.round(26 * k), Math.round(10 * k)); c.fillStyle = '#b8b2a4'; c.fillRect(Math.round(pl.x0 + pl.W * 0.2), Math.round(pl.y0 + pl.H + s(8) + 8 * k), Math.round(26 * k), Math.round(2 * k)); }
      Q.dust(c, 0, G.yW, w, G.vb, s(30), t, 18, '255,240,210', still, 17);
    },
    focus(w, h, vb) { const G = geomWork(w, h, vb), W = Math.round(110 * G.k), H = Math.round(48 * G.k); return { x: G.px - W / 2, y: G.py - H / 2, w: W, h: H }; },
  };

  // ---- plate · done: Asahi holds it up ---------------------------------------------------------------------------
  const done = {
    phases: [['lift', 800]],
    safe: { wide: 'her face and the plate in the top 60 %', narrow: 'face above, plate below it', land: 'face and plate' },
    draw(c, w, h, t, st) {
      const lit = st.test('sg_boss_done');
      const G = geomShop(w, h, st.vb, true), { s, ax, ay } = G, still = st.still;
      const S0 = shopStatic(G, lit);
      c.drawImage(S0.cv, 0, 0);
      if (lit && !still) { const fl = 0.8 + 0.2 * Math.sin(t / 230); c.globalAlpha = fl; P().halo(c, S0.f.fx, S0.f.fy - Math.round(S0.f.fr * 0.45), Math.round(S0.f.fr * 0.6), '255,210,120', 0.25, 3); c.globalAlpha = 1; }
      const kl = st.at('lift');
      const g2 = lit ? { mul: [1, 0.94, 0.86], add: [10, 4, 0], rim: { side: 'l', col: '#ffc070', k: [0.45, 0.2], below: 0.85 } } : { mul: [0.97, 0.95, 0.95], add: [4, 3, 4] };
      const ab = Q.bust('asahi', kl > 0.4 ? 'smile' : 'think2', kl > 0.4 ? null : { look: [0, 1] }, g2, false, 200);
      if (ab) c.drawImage(ab.cv, ax - ab.ax, ay - ab.ay);
      // the finished plate rises into her hands, held out toward you
      const k = clamp(G.Z * 0.9, 0.7, 1.2), e = ease(kl);
      // (in a band above the sheet she holds it up beside her face instead)
      const py = Math.round(lerp(G.vb + s(40), G.band ? ay - 58 : ay - s(12), e)), pxx = G.band ? Math.round(ax + 48 + 58 * k) : ax;
      const pl = plate(c, pxx, py, k, 1, 1, s, true);
      const skin = Q.skinOf(look('asahi')), sleeve = look('asahi').cloth[0];
      for (const [hx, side, ang] of [[pl.x0 + s(2), 'L', -0.4], [pl.x0 + pl.W - s(2), 'R', Math.PI + 0.4]]) {
        const hd = Q.hand({ size: Math.round(13 * k), pose: 'pinch', side, angle: ang - Math.PI / 2, skin, sleeve });
        if (hd) c.drawImage(hd.cv, Math.round(hx - hd.ax), Math.round(pl.y0 + pl.H * 0.6 - hd.ay));
      }
      if (!still) Q.dust(c, 0, 0, w, G.vb, s(20), t, 12, lit ? '255,200,140' : '240,236,226', still, 23);
    },
    focus(w, h, vb) { const G = geomShop(w, h, vb, true), k = clamp(G.Z * 0.9, 0.7, 1.2), W = Math.round(110 * k); return G.band ? { x: G.ax - 30, y: G.ay - 88, w: Math.round(78 + W), h: 56 } : { x: G.ax - W / 2, y: G.ay - 88, w: W, h: 88 }; },
  };

  RB.sequence.define('ch2.plate', {
    title: { en: 'A nameplate for the Chidori-maru', jp: '{千鳥丸|ちどりまる} の {名札|なふだ}' }, chapter: 2, scene: 'sg.asahi_name', memory: true,
    memo: { jp: '', en: 'At the glassworks, Asahi carved the boat\'s name she had remembered.' },
    shots: { card, work, done },
  });
})();
