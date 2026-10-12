/* The Cloudroad, Chapter 10 of the twelve: the travel volume's pages (expansion P16; AC-1).
 *
 * cr.summit — the pass (`cr.summit_first`, src/content/cr/23_scenes_pass.js).
 *   clouds  out onto the pass: a sea of cloud on every side, the road you climbed and its stations all under it, the
 *           far peaks standing out of it like islands; the cloud moving slowly
 *   steam   far down to the north-east, a break in the cloud and white steam rising out of a valley in several plumes
 * cr.letter — the last post delivered (`cr.deliver`).
 *   letter  Heisuke at Sakashita with the oiled-paper letter open in his hands, reading; then the long silence
 * cr.relay — the relay running again (`cr.end`).
 *   relay   night on the mountain: the seven stations' lamps lit from the foot to the pass, and between two of them a
 *           courier's lantern on the move. Each lamp burns only if its station's name is back on it (cr_lamp<n>): the
 *           story names six before the chapter can end, and Kumoi's, the seventh, can stay dark
 * No letters, kana or kanji are drawn: the letter's lines are brush marks. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const Q = RB.seqKit, { R, mk, clamp, ease, lerp, cached, stage } = Q;
  const SP = RB.seqPaint;
  const P = () => RB.pxkit;
  const look = (id) => (RB.content.chars[id] || {}).look || {};
  const skin = (id) => Q.skinOf(look(id));

  const HIGH = { mul: [0.96, 0.98, 1.02], add: [6, 8, 14], rim: { side: 'l', col: '#fff4e0', k: [0.42, 0.2], below: 0.85 } };
  const ROOM = { mul: [0.9, 0.82, 0.74], add: [12, 6, 0], rim: { side: 'r', col: '#ffc890', k: [0.42, 0.18], below: 0.85 } };

  // ==== cr.summit · the sea of cloud =================================================================================
  function geomSummit(w, h, vb) { const S = stage(w, h, vb); return Object.assign(S, { narrow: S.lay === 'narrow', sea: Math.round(vb * 0.5) }); }
  function summitStatic(G, east) {
    return cached('cr.summit|' + G.w + 'x' + G.h + '|' + G.vb + '|' + (east ? 1 : 0), () => {
      const { w, h, s, sea } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      Q.bandsIn(g, 0, 0, w, sea + s(10), ['#3a6ab0', '#4a7ab8', '#5e8cc4', '#7aa2d0', '#98b8dc', '#b8cce4'], 0.45);
      const L = SP.layer(w, h), rnd = p.rnd(east ? 83 : 81);
      // far peaks standing out of the cloud, snow on their upper faces
      const rock = p.mat('#5a6478', { n: 7, at: 3, step: 0.07 }), snow = p.mat('#e8eef6', { n: 6, at: 4, step: 0.05 });
      const gx = Math.round(w * (G.narrow ? 0.62 : 0.7));
      for (let i = 0; i < 6; i++) {
        const px = rnd() * w, ph = s(30 + rnd() * 60), pw = ph * (0.9 + rnd() * 0.8), base = sea + s(6);
        if (east && Math.abs(px - gx) < pw + s(30)) continue; // (the sky over the break stays open for the steam)
        L.fill(px - pw, base - ph, px + pw, base, (x, y) => y > base - ph + Math.abs(x - px) * (ph / pw) + Math.sin(x * 0.3) * 1.5, rock, (x, y) => clamp((x < px ? 0.6 : 0.3) + (p.bayer(x, y) - 0.5) * 0.08, 0.02, 0.999));
        L.fill(px - pw, base - ph, px + pw, base, (x, y) => y > base - ph + Math.abs(x - px) * (ph / pw) && y < base - ph * 0.55 + Math.sin(x * 0.7) * 3, snow, (x, y) => clamp(x < px ? 0.8 : 0.45, 0.02, 0.999));
      }
      // the near ground of the pass: rock and dry grass at the bottom edge, the stone on it at the side
      const ground = p.mat('#6a6252', { n: 7, at: 3, step: 0.08 }), grassM = p.mat('#8a8a5a', { n: 6, at: 3, step: 0.08 });
      L.fill(0, 0, w, h, (x, y) => y > G.vb * 0.86 + Math.sin(x / (w * 0.07)) * s(4), ground, (x, y) => clamp(0.5 + (((x * 7 + y * 3) % 13) < 3 ? 0.12 : 0) + (p.bayer(x, y) - 0.5) * 0.1, 0.02, 0.999));
      SP.grass(L, (x) => G.vb * 0.86 + Math.sin(x / (w * 0.07)) * s(4) + s(2), h, grassM, { seed: 19, density: 1400, blade: 1.4 });
      const boulder = p.mat('#7a7468', { n: 7, at: 3, step: 0.07 });
      for (const [bx, bw2] of [[0.06, 22], [0.5, 14], [0.9, 26]]) { const x = Math.round(w * bx), y = Math.round(G.vb * 0.9); L.stone([[x - s(bw2), y + s(10)], [x - s(bw2 * 0.7), y - s(bw2 * 0.5)], [x + s(bw2 * 0.3), y - s(bw2 * 0.7)], [x + s(bw2), y - s(bw2 * 0.2)], [x + s(bw2), y + s(10)]], boulder, { face: 4, bevel: Math.max(2, s(3)), seam: true }); }
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv };
    });
  }
  // the cloud sea: rows of rounded cloud tops lit from above, moving slowly (still: held)
  function cloudSea(c, G, t, still, gap) {
    const { w, s, sea } = G, rnd = P().rnd(5), rows = 7;
    for (let r = 0; r < rows; r++) {
      const y = sea + r * s(8) + Math.round(r * r * 1.2), sc = 0.6 + r * 0.25, speed = (r + 1) * 0.004, n = Math.round(w / (s(30) * sc)) + 2;
      for (let i = 0; i < n; i++) {
        const x0 = ((i * s(30) * sc + (still ? 0 : t * speed) + rnd() * s(20)) % (w + s(40) * sc)) - s(20) * sc;
        if (gap && Math.abs(x0 - gap.x) < gap.r * (1 - r / rows) && r < 3) continue;
        const rr = s(16) * sc * (0.8 + rnd() * 0.4);
        for (let j = -rr; j <= 0; j++) { const half = Math.round(Math.sqrt(Math.max(0, 1 - (j / rr) ** 2)) * rr * 1.4); c.fillStyle = j < -rr * 0.55 ? '#ffffff' : j < -rr * 0.2 ? '#eef2f8' : '#d4dcea'; c.fillRect(Math.round(x0 - half), Math.round(y + j), half * 2, 1); }
      }
      c.fillStyle = '#d4dcea'; c.fillRect(0, y, w, s(10));
    }
  }
  const clouds = {
    phases: [['drift', 1400]],
    safe: { wide: 'the sea of cloud and the peaks above the sheet', narrow: 'the cloud sea in the upper half', land: 'the cloud sea' },
    draw(c, w, h, t, st) {
      const G = geomSummit(w, h, st.vb);
      c.drawImage(summitStatic(G, false).cv, 0, 0);
      cloudSea(c, G, t + ease(st.at('drift')) * 800, st.still, null);
      // redraw the near ground over the clouds (the pass you stand on)
      const near = cached('cr.near|' + w + 'x' + h + '|' + st.vb, () => { const cv = mk(w, h), g = cv.getContext('2d'); g.drawImage(summitStatic(G, false).cv, 0, Math.round(st.vb * 0.82), w, h, 0, Math.round(st.vb * 0.82), w, h); return { cv }; });
      c.drawImage(near.cv, 0, 0);
    },
    focus(w, h, vb) { return { x: 0, y: Math.round(vb * 0.25), w, h: Math.round(vb * 0.55) }; },
  };
  const steam = {
    phases: [['rise', 1400]],
    safe: { wide: 'the break in the cloud and the steam above the sheet', narrow: 'the steam in the upper half', land: 'the steam' },
    draw(c, w, h, t, st) {
      const G = geomSummit(w, h, st.vb), { s, sea } = G, still = st.still;
      c.drawImage(summitStatic(G, true).cv, 0, 0);
      const gx = Math.round(w * (G.narrow ? 0.62 : 0.7)), gap = { x: gx, r: s(70) };
      // the valley under the break: dark green slopes far below
      R(c, gx - s(40), sea + s(2), s(80), s(14), '#3a4e3e');
      R(c, gx - s(24), sea + s(8), s(48), s(10), '#2e4032');
      cloudSea(c, G, t, still, gap);
      // the plumes: columns of white rising and leaning with the wind, each its own pace
      const kr = ease(st.at('rise'));
      for (let i = 0; i < 5; i++) {
        const bx = gx - s(30) + i * s(15), ht = s(40 + (i % 3) * 18) * (0.3 + 0.7 * kr), rnd = P().rnd(90 + i);
        for (let j = 0; j < 20; j++) {
          const u = j / 20, y = sea + s(10) - u * ht, lean = u * u * s(18), wob = still ? 0 : Math.sin(t / 700 + i + u * 6) * s(2) * u;
          const r = Math.max(1, Math.round(s(3) + u * s(6)));
          c.fillStyle = 'rgba(250,250,252,' + (0.75 - u * 0.55).toFixed(2) + ')';
          c.fillRect(Math.round(bx + lean + wob - r + rnd() * 2), Math.round(y), r * 2, Math.max(1, Math.round(ht / 20)));
        }
      }
      // the two of you small on the pass's edge, from behind
      const W = Math.round(clamp(s(90), 60, 120));
      const pb = Q.back(st.cast.pc || {}, W, { light: 'l' });
      if (pb) c.drawImage(pb.cv, Math.round(w * 0.24) - pb.ax, Math.round(st.vb + s(64)) - pb.ay);
      const comp = st.cast.comp;
      if (comp) { const cb = Q.back(comp.look, Math.round(W * 0.95), { light: 'l' }); if (cb) c.drawImage(cb.cv, Math.round(w * 0.24 + W * 0.85) - cb.ax, Math.round(st.vb + s(68)) - cb.ay); }
    },
    focus(w, h, vb) { const G = geomSummit(w, h, vb), gx = Math.round(w * (G.narrow ? 0.62 : 0.7)); return { x: gx - G.s(50), y: Math.max(0, G.sea - G.s(80)), w: G.s(100), h: Math.min(vb - 2, G.sea + G.s(20)) - Math.max(0, G.sea - G.s(80)) }; },
  };
  RB.sequence.define('cr.summit', {
    title: { en: 'Above the sea of cloud', jp: '{雲|くも} の {海|うみ}' }, chapter: 'cr', scene: 'cr.summit_first',
    shots: { clouds, steam },
  });

  // ==== cr.letter · Heisuke and the letter ===========================================================================
  const letter = {
    phases: [['open', 900], ['quiet', 1200]],
    safe: { wide: 'Heisuke\'s face and the letter above the sheet', narrow: 'his face in the upper half', land: 'his face' },
    draw(c, w, h, t, st) {
      const S = stage(w, h, st.vb), { s } = S, narrow = S.lay === 'narrow';
      // the station's front room: dark beams, a paper door warm with the hearth, the courier's box on the step
      const B = cached('cr.room|' + w + 'x' + h + '|' + st.vb, () => {
        const cv = mk(w, h), g = cv.getContext('2d'), p = P();
        g.imageSmoothingEnabled = false;
        const L = SP.layer(w, h), wall = p.mat('#6a5a46', { n: 7, at: 3, step: 0.07 }), beam = p.mat('#3a2a20', { n: 6, at: 3, step: 0.08 }), paper = p.mat('#e8dcc0', { n: 6, at: 4, step: 0.05 });
        L.rect(0, 0, w, h, wall, (x, y) => clamp(0.45 - Math.abs(x - w * 0.3) / w * 0.3 + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999));
        Q.shoji(L, Math.round(w * 0.04), Math.round(st.vb * 0.06), Math.round(w * 0.36), Math.round(st.vb * 0.7), (n) => s(n) * 2, paper, beam, 0.7);
        L.rect(0, Math.round(st.vb * 0.04), w, s(6), beam, 0.5);
        for (const x of [Math.round(w * 0.42), Math.round(w * 0.96)]) L.rect(x, 0, s(7), h, beam, (xx) => (xx < x + s(2) ? 0.6 : 0.28));
        L.outline();
        g.drawImage(L.canvas(), 0, 0);
        SP.glow(g, Math.round(w * 0.22), Math.round(st.vb * 0.4), Math.round(w * 0.3), '255,210,150', 0.3);
        return { cv };
      });
      c.drawImage(B.cv, 0, 0);
      const ko = st.at('open'), kq = st.at('quiet');
      const b = Q.bust('cr_heisuke', kq > 0.4 ? 'sad2' : 'neutral', kq > 0.4 ? null : { look: [0, 1], head: [0, 1] }, ROOM, false, 200);
      const bx = Math.round(w * (narrow ? 0.56 : 0.62)), by = Math.max(Math.round(st.vb + s(12)), 100);
      if (b) c.drawImage(b.cv, bx - b.ax, by - b.ay);
      // the letter opened out in his hands: a long sheet of oiled paper, columns of fading brush marks
      const e = ease(ko), LW = Math.round(clamp(s(54), 34, 80) * (0.4 + 0.6 * e)), LH = Math.round(clamp(s(40), 26, 60));
      const lx = bx - Math.round(LW / 2), ly = by - 18;
      R(c, lx, ly, LW, LH, '#e2d4b0'); R(c, lx, ly + LH - 1, LW, 1, '#b8a682'); R(c, lx + LW - 1, ly, 1, LH, '#c8b690');
      for (let i = 0; i < Math.max(1, Math.round(LW / 7)); i++) SP.marks(c, lx + LW - 4 - i * 7, ly + 3, LH - 6, 4, 1, i < 2 ? '#3a2e2a' : 'rgba(58,46,42,0.5)', 30 + i);
      const sk = skin('cr_heisuke'), sl = (look('cr_heisuke').cloth || ['#5a4a3a'])[0];
      const hl = Q.hand({ size: Math.round(clamp(s(11), 8, 18)), pose: 'pinch', side: 'R', angle: -1.1, skin: sk, sleeve: sl });
      const hr = Q.hand({ size: Math.round(clamp(s(11), 8, 18)), pose: 'pinch', side: 'L', angle: -2.0, skin: sk, sleeve: sl });
      if (hl) c.drawImage(hl.cv, Math.round(lx + 1 - hl.ax), Math.round(ly + LH * 0.7 - hl.ay));
      if (hr) c.drawImage(hr.cv, Math.round(lx + LW - 1 - hr.ax), Math.round(ly + LH * 0.7 - hr.ay));
    },
    focus(w, h, vb) { const S = stage(w, h, vb), narrow = S.lay === 'narrow', bx = Math.round(w * (narrow ? 0.56 : 0.62)), by = Math.max(Math.round(vb + S.s(12)), 100); return { x: bx - 34, y: by - 92, w: 68, h: Math.min(vb - 2, by - 24) - (by - 92) }; },
  };
  RB.sequence.define('cr.letter', {
    title: { en: 'A letter fifty years late', jp: '{五十年|ごじゅうねん} {遅|おく}れ の {手紙|てがみ}' }, chapter: 'cr', scene: 'cr.deliver',
    shots: { letter },
  });

  // ==== cr.relay · the seven lamps at night ============================================================================
  const relay = {
    phases: [['light', 1500]],
    safe: { wide: 'the mountain with its seven lamps above the sheet', narrow: 'the lamps in the upper half', land: 'the lamps' },
    draw(c, w, h, t, st) {
      const S = stage(w, h, st.vb), { s } = S, still = st.still, vb = st.vb;
      const B = cached('cr.night|' + w + 'x' + h + '|' + vb, () => {
        const cv = mk(w, h), g = cv.getContext('2d'), p = P();
        g.imageSmoothingEnabled = false;
        Q.bandsIn(g, 0, 0, w, h, ['#060a18', '#0a1024', '#0e1630', '#141c3a', '#1a2444'], 0.45);
        SP.stars(g, 0, 0, w, Math.round(vb * 0.5), 60, 77, 7);
        const L = SP.layer(w, h), m = p.mat('#1e2638', { n: 6, at: 3, step: 0.08 }), m2 = p.mat('#161c2c', { n: 5, at: 2, step: 0.08 }), snow = p.mat('#8a96b4', { n: 6, at: 3, step: 0.07 });
        const ridge = (x) => vb * 0.18 + Math.abs(x - w * 0.55) * 0.42 + Math.sin(x / (w * 0.07)) * s(10) + Math.sin(x / (w * 0.023)) * s(3) - Math.max(0, s(30) - Math.abs(x - w * 0.3) * 0.4);
        L.fill(0, 0, w, h, (x, y) => y > ridge(x), m, (x, y) => clamp(0.45 - (y - ridge(x)) / h * 0.3 + (p.bayer(x, y) - 0.5) * 0.08, 0.02, 0.999));
        L.fill(0, 0, w, h, (x, y) => y > ridge(x) && y < ridge(x) + s(10) + Math.sin(x * 0.4) * 2, snow, 0.5);
        L.fill(0, 0, w, h, (x, y) => y > vb * 0.7 + Math.sin(x / (w * 0.09) + 2) * s(6), m2, (x, y) => clamp(0.4 + (p.bayer(x, y) - 0.5) * 0.08, 0.02, 0.999));
        // the foot of the road: the first station's village, its roofs and a few lit windows; cedars against the slope
        const tile = p.mat('#20242e', { n: 5, at: 2, step: 0.08 }), cedar = p.mat('#101820', { n: 4, at: 2 }), rr = p.rnd(55);
        for (let i = 0; i < 7; i++) { const x = Math.round(w * (0.04 + i * 0.05)), y = Math.round(vb * (0.84 + (i % 2) * 0.03)); SP.roof(L, x - s(10), x + s(10), y - s(6), s(6), tile, { course: 2 }); L.rect(x - s(8), y, s(16), s(8), m2, 0.3); }
        for (let i = 0; i < 30; i++) { const x = rr() * w, y = vb * (0.66 + rr() * 0.2), ht = s(8 + rr() * 10); L.fill(x - ht * 0.3, y - ht, x + ht * 0.3, y, (xx, yy) => Math.abs(xx - x) <= ht * 0.3 * (yy - (y - ht)) / ht, cedar, 0.5); }
        L.outline();
        g.drawImage(L.canvas(), 0, 0);
        for (let i = 0; i < 7; i += 2) R(g, Math.round(w * (0.04 + i * 0.05)) - 2, Math.round(vb * (0.84 + (i % 2) * 0.03)) + s(3), Math.max(2, s(3)), Math.max(1, s(2)), '#ffc870');
        return { cv };
      });
      c.drawImage(B.cv, 0, 0);
      // the seven stations from the foot (lower left) to the pass (the summit), each lamp lit in turn on this line;
      // a station whose lamp was never named again stays dark, its roof against the snow
      const kl = st.at('light');
      const named = [1, 2, 3, 4, 5, 6, 7].map((n) => st.test('cr_lamp' + n));
      const pts = [];
      for (let i = 0; i < 7; i++) { const u = i / 6; pts.push([lerp(w * 0.14, w * 0.55, u) + Math.sin(u * 9) * s(26), lerp(vb * 0.82, vb * 0.2, Math.pow(u, 0.9))]); }
      c.fillStyle = 'rgba(160,150,140,0.35)';
      for (let i = 1; i < 7; i++) { const a = pts[i - 1], b = pts[i]; const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1])); for (let j = 0; j < n; j += 3) c.fillRect(Math.round(lerp(a[0], b[0], j / n)), Math.round(lerp(a[1], b[1], j / n)), 1, 1); }
      pts.forEach(([x, y], i) => {
        const on = !named[i] ? 0 : still ? 1 : clamp(kl * 7 - i, 0, 1);
        if (!named[i] && (still || kl * 7 - i > 0)) { R(c, x - s(3), y - s(2), s(6), s(4), '#2a2420'); R(c, x - 1, y, Math.max(2, s(2)), Math.max(2, s(2)), '#3a3a44'); return; }
        if (on <= 0) { R(c, x - 1, y - 1, 3, 3, '#3a3a44'); return; }
        R(c, x - s(3), y - s(2), s(6), s(4), '#3a2e26'); // the station's roof
        R(c, x - 1, y, Math.max(2, s(2)), Math.max(2, s(2)), '#ffd080');
        SP.glow(c, x, y, Math.round(s(14) * on), '255,190,100', 0.3 * on);
      });
      // a courier's lantern on the move between the third and the fourth station
      if (kl >= 1 || still) {
        const u = still ? 0.5 : ((t / 7000) % 1), a = pts[2], b = pts[3];
        const x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) - s(2) + (still ? 0 : Math.abs(Math.sin(t / 160)) * -1);
        R(c, x, y, Math.max(1, s(1.5)), Math.max(2, s(2)), '#ffe0a0');
        SP.glow(c, x, y, s(8), '255,200,120', 0.3);
      }
    },
    focus(w, h, vb) { return { x: Math.round(w * 0.08), y: Math.round(vb * 0.14), w: Math.round(w * 0.6), h: Math.round(vb * 0.74) }; },
  };
  RB.sequence.define('cr.relay', {
    title: { en: 'The relay runs again', jp: '{継|つ}ぎ{飛脚|びきゃく} が また {走|はし}る' }, chapter: 'cr', scene: 'cr.end',
    shots: { relay },
  });
})();
