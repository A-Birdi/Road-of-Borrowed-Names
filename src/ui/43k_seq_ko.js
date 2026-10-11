/* Kotonoha, Chapter 9 of the twelve: the travel volume's pages (expansion P16; AC-1).
 *
 * ko.garden — the Garden of Unsent Words once the Gardener has settled (`ko.gardener`, src/content/ko/22_scenes_story.js,
 * from its settling to the companion's word; the conversation itself is the world's).
 *   garden  under the tree's heart: the roots woven overhead into a vault, countless leaves hung from them on threads
 *           like paper lanterns, each faintly lit; the tall shape of the roots sinking back into the weave, the wind
 *           stopping and the leaves in the air coming down one by one onto their threads
 *   leaves  the two of you under the hanging leaves: you from behind, your companion turned to you in their light
 * ko.end — the chapter's end at the Wind Stone (`ko.end`).
 *   stone   Otoha by the Wind Stone on the island's crown, the great tree behind her breathing, leaves falling slowly
 *   north   she looks north: over the strait the far mountains, and high up among them a pale point; a few leaves
 *           like torn pages drifting from that way
 * No letters, kana or kanji are drawn: the leaves carry a stroke or two of ink, never characters. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const Q = RB.seqKit, { R, mk, clamp, ease, lerp, cached, stage } = Q;
  const SP = RB.seqPaint;
  const P = () => RB.pxkit;
  const sub = (k, a, b) => clamp((k - a) / (b - a), 0, 1);

  const LEAF = { mul: [0.8, 0.86, 0.78], add: [6, 12, 6], rim: { side: 'r', col: '#f0f0b0', k: [0.42, 0.18], below: 0.85 } };
  const DAY = { mul: [0.98, 0.96, 0.92], add: [6, 4, 0], rim: { side: 'l', col: '#fff0d0', k: [0.4, 0.18], below: 0.85 } };

  // ==== ko.garden · the root vault and its hanging leaves ===========================================================
  function geomGarden(w, h, vb) { const S = stage(w, h, vb); return Object.assign(S, { narrow: S.lay === 'narrow' }); }
  // the leaves: [x, y (where it hangs), thread length, size, tint, seed] in buffer units, seeded
  function leavesOf(G) {
    return Q.small('ko.leaves|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const rnd = P().rnd(37), out = [];
      for (let i = 0; i < 120; i++) {
        const depth = rnd(), x = rnd() * G.w, top = G.vb * (0.03 + (1 - depth) * 0.12) + Math.sin(x / (G.w * 0.12)) * G.s(8);
        out.push({ x, top, len: G.vb * (0.06 + rnd() * 0.42) * (0.5 + depth * 0.5), sz: Math.max(2, Math.round(G.s(2 + depth * 5))), tint: rnd(), depth, seed: i });
      }
      return out.sort((a, b) => a.depth - b.depth);
    });
  }
  function gardenStatic(G) {
    return cached('ko.garden|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      Q.bandsIn(g, 0, 0, w, h, ['#0a1410', '#0e1c16', '#12241c', '#182c22', '#1e3428', '#24402e'], 0.45);
      const L = SP.layer(w, h);
      // the root vault: thick roots arching overhead and coming down at the sides, woven, with dark gaps between
      const root = p.mat('#5a4a36', { n: 7, at: 3, step: 0.08 }), rnd = p.rnd(23);
      for (let i = 0; i < 14; i++) {
        const x0 = -s(20) + rnd() * w * 0.3, x1 = w * 0.7 + rnd() * w * 0.4, sag = G.vb * (0.05 + rnd() * 0.2), thick = s(6 + rnd() * 10);
        const pts = []; for (let j = 0; j <= 20; j++) { const u = j / 20; pts.push([lerp(x0, x1, u), sag * Math.sin(Math.PI * u) - s(4) + Math.sin(u * 9 + i) * s(3), thick * (0.6 + 0.4 * Math.sin(Math.PI * u))]); }
        L.path(pts, thick, root, (x, y) => clamp(0.55 - (y / (G.vb * 0.3)) * 0.2 + (((Math.round(x) + Math.round(y) * 2) % 9) === 0 ? -0.18 : 0) + (p.bayer(x, y) - 0.5) * 0.08, 0.02, 0.999));
      }
      // the roots coming down the sides into the floor
      for (const side of [0, 1]) for (let i = 0; i < 5; i++) {
        const x = side ? w - s(10 + i * 14) : s(10 + i * 14), lean = (side ? -1 : 1) * s(6);
        L.path([[x, -s(4), s(12)], [x + lean, G.vb * 0.5, s(10)], [x + lean * 2, h, s(14)]], s(12), root, (xx, yy) => clamp(0.4 + (side ? -0.08 : 0.06) + (((Math.round(yy) + i * 7) % 11) === 0 ? -0.2 : 0), 0.02, 0.999));
      }
      // the floor: moss and fallen leaves, a little light on it
      const moss = p.mat('#3a5a36', { n: 6, at: 3, step: 0.08 });
      SP.grass(L, (x) => G.vb * 0.78 + Math.sin(x / (w * 0.1)) * s(4), h, moss, { seed: 13, base: 0.42, density: 120 });
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // the leaves' light lying on the moss, and leaves fallen there
      for (let i = 0; i < 9; i++) SP.glow(g, Math.round(w * (0.08 + i * 0.11)), Math.round(G.vb * 0.84), s(26), '200,230,150', 0.16);
      const rf = p.rnd(31);
      for (let i = 0; i < 26; i++) { const x = Math.round(rf() * w), y = Math.round(G.vb * 0.8 + rf() * (h - G.vb * 0.8)); g.fillStyle = i % 2 ? '#a8b880' : '#c0b07a'; g.fillRect(x, y, s(3), Math.max(1, s(1.5))); }
      return { cv };
    });
  }
  // one leaf hanging on its thread at (x, y): a pale oval with a midrib and a stroke of ink, glowing faintly
  function leaf(c, x, y, sz, tint, glowA, seed) {
    const col = tint < 0.33 ? ['#c8d8a0', '#e8f0c0'] : tint < 0.66 ? ['#d8c890', '#f0e4b8'] : ['#b8d0a8', '#dcecc8'];
    if (glowA > 0) SP.glow(c, x, y, Math.round(sz * 2.4), '230,240,170', glowA);
    for (let j = -sz; j <= sz; j++) {
      const half = Math.round(Math.sqrt(Math.max(0, 1 - (j / sz) ** 2)) * sz * 0.55);
      R(c, x - half, y + j, half * 2 + 1, 1, j < 0 ? col[1] : col[0]);
    }
    R(c, x, y - sz + 1, 1, sz * 2 - 1, 'rgba(90,110,60,0.7)');
    if (sz >= 4) { c.fillStyle = 'rgba(40,30,30,0.75)'; c.fillRect(x + 1, y - 1 + (seed % 3) - 1, Math.max(1, Math.round(sz * 0.3)), 1); }
  }
  const garden = {
    phases: [['settle', 1600]],
    safe: { wide: 'the hanging leaves under the root vault, above the sheet', narrow: 'the leaves in the upper half', land: 'the leaves' },
    draw(c, w, h, t, st) {
      const G = geomGarden(w, h, st.vb), { s } = G, still = st.still;
      c.drawImage(gardenStatic(G).cv, 0, 0);
      const k = st.at('settle'), e = ease(k);
      // the tall shape of roots sinking back into the weave at the middle
      const sinkH = Math.round(lerp(G.vb * 0.62, 0, e));
      if (sinkH > 2) {
        const cx = Math.round(w * 0.5), base = Math.round(G.vb * 0.8);
        c.fillStyle = '#4a3c2c';
        for (let y = base - sinkH; y < base; y++) { const half = Math.round(s(10) + (y - (base - sinkH)) * 0.18); c.fillRect(cx - half, y, half * 2, 1); }
        c.fillStyle = '#e8f0c0'; c.fillRect(cx - s(3), base - sinkH + s(6), s(6), s(3)); // its lantern of a face, last to go
      }
      // the leaves: those still in the air come down onto their threads one after another as the wind stops
      const Lv = leavesOf(G);
      for (const L0 of Lv) {
        const landed = sub(e, (L0.seed % 10) * 0.07, (L0.seed % 10) * 0.07 + 0.3);
        const sway = still ? 0 : Math.sin(t / (900 + L0.seed * 13) + L0.seed) * s(1.5) * (1 - landed * 0.6);
        const drift = (1 - landed) * s(20) * Math.sin(L0.seed * 1.7);
        const y = L0.top + L0.len + (1 - ease(landed)) * -s(16), x = L0.x + sway + drift;
        c.fillStyle = 'rgba(160,170,130,0.5)'; c.fillRect(Math.round(L0.x), Math.round(L0.top), 1, Math.max(1, Math.round((y - L0.top) * landed)));
        leaf(c, Math.round(x), Math.round(y), L0.sz, L0.tint, 0.08 + 0.1 * L0.depth, L0.seed);
      }
    },
    focus(w, h, vb) { return { x: Math.round(w * 0.15), y: Math.round(vb * 0.05), w: Math.round(w * 0.7), h: Math.round(vb * 0.7) }; },
  };
  const leaves = {
    phases: [['turn', 800]],
    safe: { wide: 'your companion\'s face under the leaves, above the sheet', narrow: 'their face in the upper half', land: 'their face' },
    draw(c, w, h, t, st) {
      const G = geomGarden(w, h, st.vb), { s } = G, still = st.still;
      c.drawImage(gardenStatic(G).cv, 0, 0);
      for (const L0 of leavesOf(G)) {
        const sway = still ? 0 : Math.sin(t / (900 + L0.seed * 13) + L0.seed) * s(1.5);
        c.fillStyle = 'rgba(160,170,130,0.5)'; c.fillRect(Math.round(L0.x), Math.round(L0.top), 1, Math.round(L0.len));
        leaf(c, Math.round(L0.x + sway), Math.round(L0.top + L0.len), L0.sz, L0.tint, 0.1 + 0.1 * L0.depth, L0.seed);
      }
      const W = Math.round(clamp(s(118), 80, 160));
      const pb = Q.back(st.cast.pc || {}, W, { light: 'r' });
      const bx = Math.round(w * (G.narrow ? 0.28 : 0.26)), by = Math.round(st.vb + s(G.narrow ? 90 : 80));
      if (pb) c.drawImage(pb.cv, bx - pb.ax, by - pb.ay);
      const comp = st.cast.comp;
      if (comp) {
        const kt = st.at('turn');
        const expr = st.test('comp=mio') ? 'smile' : st.test('comp=suzu') ? 'smile2' : 'neutral';
        const b = Q.bust(comp.id, kt > 0.3 ? expr : 'neutral', kt > 0.3 ? { look: [-1, 0], head: [-1, 0] } : { look: [0, -1] }, LEAF, false, 200);
        const cx = Math.round(w * (G.narrow ? 0.7 : 0.66) + (1 - ease(kt)) * s(6)), cy = Math.max(Math.round(st.vb + s(10)), 98);
        if (b) c.drawImage(b.cv, cx - b.ax, cy - b.ay);
      }
    },
    focus(w, h, vb) { const G = geomGarden(w, h, vb), cx = Math.round(w * (G.narrow ? 0.7 : 0.66)), cy = Math.max(Math.round(vb + G.s(10)), 98); return { x: cx - 34, y: cy - 92, w: 68, h: Math.min(vb - 2, cy - 30) - (cy - 92) }; },
  };
  RB.sequence.define('ko.garden', {
    title: { en: 'The Garden of Unsent Words', jp: '{出|だ}されなかった {言葉|ことば} の {庭|にわ}' }, chapter: 'ko', scene: 'ko.gardener',
    shots: { garden, leaves },
  });

  // ==== ko.end · the Wind Stone, and the way north ===================================================================
  function geomCrown(w, h, vb) { const S = stage(w, h, vb); return Object.assign(S, { narrow: S.lay === 'narrow' }); }
  function crownStatic(G, north) {
    return cached('ko.crown|' + G.w + 'x' + G.h + '|' + G.vb + '|' + (north ? 1 : 0), () => {
      const { w, h, s } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      Q.bandsIn(g, 0, 0, w, h, north ? ['#5a7aac', '#7090bc', '#8aa6cc', '#a8bed8', '#c6d4e2', '#dce4ea'] : ['#6a8ec0', '#82a2cc', '#9cb6d8', '#b8cce4', '#d0dee8'], 0.45);
      SP.clouds(g, w, { n: north ? 5 : 4, seed: north ? 71 : 73, y0: s(10), y1: G.vb * 0.3, scale: G.Z, light: '#ffffff', mid: '#eef0f6', shade: '#c4cce0' });
      const L = SP.layer(w, h);
      if (north) {
        // the far mountains in two ranges, ridged, the pale point among the highest; the strait; the island's shoulder
        const farer = p.mat('#8a98b4', { n: 7, at: 3, step: 0.06 }), far = p.mat('#6a7c9c', { n: 7, at: 3, step: 0.07 }), sea = p.mat('#4a7aa0', { n: 7, at: 3, step: 0.07 });
        const r1 = (x) => G.vb * 0.3 - Math.abs(Math.sin(x / (w * 0.11) + 2)) * s(34) + Math.sin(x / (w * 0.035)) * s(4);
        L.fill(0, 0, w, h, (x, y) => y > r1(x), farer, (x, y) => clamp(0.55 + (((Math.round(x) + Math.round(y * 2)) % 9) < 2 && y - r1(x) < s(16) ? 0.18 : 0) - (y - r1(x)) / h * 0.4 + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999));
        const r2 = (x) => G.vb * 0.44 + Math.sin(x / (w * 0.15) + 1) * s(10) + Math.sin(x / (w * 0.05)) * s(3);
        L.fill(0, 0, w, h, (x, y) => y > r2(x), far, (x, y) => clamp(0.5 - (y - r2(x)) / h * 0.3 + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999));
        SP.water(L, 0, Math.round(G.vb * 0.52), w, h, sea, { band: Math.max(3, s(4)), deep: 0.25, seed: 9, lit: (x, y) => clamp(1 - Math.abs(x - w * 0.6) / (w * 0.3), 0, 1) * 0.2 });
        const grassM = p.mat('#5a7a44', { n: 7, at: 3, step: 0.08 }), flowers = p.mat('#e8e0f0', { n: 4, at: 2 });
        SP.grass(L, (x) => G.vb * 0.72 + (x / w) * s(18) + Math.sin(x / (w * 0.08)) * s(3), h, grassM, { seed: 5, flowers, density: 90 });
        // a wind-bent pine on the shoulder at the right
        const bark = p.mat('#4a3a2c', { n: 6, at: 3, step: 0.08 }), pine = p.mat('#2e4a34', { n: 7, at: 3, step: 0.08 });
        const px = Math.round(w * 0.86), py = Math.round(G.vb * 0.78);
        L.path([[px, py, s(6)], [px - s(6), py - s(30), s(4)], [px - s(18), py - s(52), s(3)]], s(5), bark, 0.45);
        SP.crown(L, px - s(22), py - s(56), s(34), s(14), pine, { n: 6, seed: 3 });
        SP.crown(L, px - s(4), py - s(36), s(24), s(10), pine, { n: 5, seed: 4 });
      } else {
        // the sea along the horizon at the left; the crown's grass rising to the tree; the Wind Stone on a worn path
        const sea = p.mat('#4a82aa', { n: 7, at: 3, step: 0.07 }), trunk = p.mat('#6a5038', { n: 7, at: 3, step: 0.08 }), leafM = p.mat('#4a7a3a', { n: 7, at: 3, step: 0.08 });
        const grassM = p.mat('#6a8a48', { n: 7, at: 3, step: 0.08 }), stoneM = p.mat('#8a8a84', { n: 7, at: 3, step: 0.07 }), path = p.mat('#a89a78', { n: 6, at: 3, step: 0.08 }), flowers = p.mat('#f0e8a8', { n: 4, at: 2 });
        SP.water(L, 0, Math.round(G.vb * 0.62), Math.round(w * 0.5), Math.round(G.vb * 0.7), sea, { band: Math.max(2, s(3)), deep: 0.2, seed: 21 });
        const tx = Math.round(w * (G.narrow ? 0.66 : 0.7)), ty = Math.round(G.vb * 0.66);
        // the trunk with its buttress roots spreading into the grass, bark in long vertical clusters
        L.fill(tx - s(50), s(10), tx + s(50), ty + s(10), (x, y) => Math.abs(x - tx) < s(20) + Math.max(0, y - ty + s(40)) ** 2 / s(60), trunk, (x, y) => clamp(0.62 - (x - tx + s(20)) / s(60) * 0.55 + (((Math.round(x * 0.7) * 5) % 7) === 0 ? -0.12 : 0) + (((Math.round(y) + Math.round(x) * 3) % 17) === 0 ? -0.1 : 0), 0.02, 0.999));
        SP.crown(L, tx, Math.round(G.vb * 0.14), Math.round(w * 0.42), Math.round(G.vb * 0.26), leafM, { n: 40, seed: 11 });
        SP.grass(L, (x) => G.vb * 0.66 + Math.sin(x / (w * 0.2)) * s(6) - (x > tx - s(60) ? s(4) : 0), h, grassM, { seed: 7, flowers, density: 80 });
        const sx = Math.round(w * (G.narrow ? 0.16 : 0.16)), sy = Math.round(G.vb * 0.74);
        L.fill(0, sy - s(4), w, h, (x, y) => Math.abs(x - lerp(sx, w * 0.45, (y - sy) / (h - sy))) < s(8) + (y - sy) * 0.25 && y > sy, path, (x, y) => clamp(0.55 + (p.bayer(x, y) - 0.5) * 0.12, 0.02, 0.999));
        L.stone([[sx - s(14), sy], [sx - s(10), sy - s(44)], [sx + s(2), sy - s(52)], [sx + s(12), sy - s(38)], [sx + s(15), sy]], stoneM, { face: 4, bevel: Math.max(2, s(3)), seam: true });
      }
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv };
    });
  }
  // leaves falling (or drifting from the north): a few small pale ovals turning as they come
  function falling(c, G, t, still, n, seed, from) {
    const rnd = P().rnd(seed);
    for (let i = 0; i < n; i++) {
      const x0 = rnd() * G.w, sp = 0.4 + rnd() * 0.6, ph = rnd();
      const u = still ? ph : ((t / (9000 / sp)) + ph) % 1;
      const x = from === 'north' ? lerp(G.w * (0.5 + rnd() * 0.3), x0 - G.w * 0.3, u) : x0 + Math.sin(u * 6 + i) * G.s(8);
      const y = from === 'north' ? lerp(G.vb * 0.25, G.vb * 0.9, u) : lerp(-G.s(10), G.vb, u);
      const turn = Math.floor((u * 40 + i) % 4);
      c.fillStyle = from === 'north' ? '#ece6d4' : i % 2 ? '#c8d8a0' : '#e0d494';
      if (turn < 2) c.fillRect(Math.round(x), Math.round(y), 3, 2); else c.fillRect(Math.round(x), Math.round(y), 1, 2);
    }
  }
  const stone = {
    phases: [['breathe', 1200]],
    safe: { wide: 'Otoha\'s face by the stone, the tree behind, above the sheet', narrow: 'her face in the upper half', land: 'her face' },
    draw(c, w, h, t, st) {
      const G = geomCrown(w, h, st.vb), { s } = G;
      c.drawImage(crownStatic(G, false).cv, 0, 0);
      falling(c, G, t, st.still, 18, 7, 'tree');
      const kb = st.at('breathe');
      const b = Q.bust('ko_otoha', kb > 0.3 ? 'smile' : 'neutral', kb > 0.3 ? { look: [1, -1] } : null, DAY, false, 200);
      const bx = Math.round(w * (G.narrow ? 0.4 : 0.38)), by = Math.max(Math.round(st.vb + s(10)), 98);
      if (b) c.drawImage(b.cv, bx - b.ax, by - b.ay);
    },
    focus(w, h, vb) { const G = geomCrown(w, h, vb), bx = Math.round(w * (G.narrow ? 0.4 : 0.38)), by = Math.max(Math.round(vb + G.s(10)), 98); return { x: bx - 34, y: by - 92, w: 68, h: Math.min(vb - 2, by - 30) - (by - 92) }; },
  };
  const north = {
    phases: [['look', 1200]],
    safe: { wide: 'the far mountains and the pale point above the sheet', narrow: 'the mountains in the upper half', land: 'the mountains' },
    draw(c, w, h, t, st) {
      const G = geomCrown(w, h, st.vb), { s } = G;
      c.drawImage(crownStatic(G, true).cv, 0, 0);
      // the pale point high in the mountains (somewhere very high: never named)
      const kl = ease(st.at('look')), px = Math.round(w * 0.62), py = Math.round(st.vb * 0.16);
      R(c, px, py, Math.max(1, s(2)), Math.max(1, s(2)), '#f4f2ec');
      SP.glow(c, px, py, Math.round(s(14) * (0.6 + 0.4 * kl)), '255,255,245', 0.25 * kl);
      falling(c, G, t, st.still, 10, 13, 'north');
      // Otoha from behind at the lower left, looking that way
      const W = Math.round(clamp(s(104), 70, 140));
      const ob = Q.back((RB.content.chars.ko_otoha || {}).look || {}, W, { light: 'l' });
      if (ob) c.drawImage(ob.cv, Math.round(w * (G.narrow ? 0.26 : 0.2)) - ob.ax, Math.round(st.vb + s(G.narrow ? 84 : 74)) - ob.ay);
    },
    focus(w, h, vb) { return { x: Math.round(w * 0.45), y: Math.round(vb * 0.06), w: Math.round(w * 0.34), h: Math.round(vb * 0.4) }; },
  };
  RB.sequence.define('ko.end', {
    title: { en: 'Leaves from the north', jp: '{北|きた} から {来|き}た {葉|は}' }, chapter: 'ko', scene: 'ko.end',
    shots: { stone, north },
  });
})();
