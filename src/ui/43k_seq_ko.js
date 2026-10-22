/* Kotonoha, Chapter 9 of the twelve: the travel volume's pages (expansion P16; AC-1).
 *
 * ko.garden — the Garden of Unsent Words once the Gardener has settled (`ko.gardener`, src/content/ko/22_scenes_story.js,
 * from its settling to the companion's word; the conversation itself is the world's).
 *   garden  under the tree's heart: the roots woven overhead into a vault, countless leaves hung from them on threads
 *           like paper lanterns, each faintly lit; the tall shape of the roots sinking back into the weave, the wind
 *           stopping and the leaves in the air coming down one by one onto their threads
 *   leaves  the two of you under the hanging leaves: you from behind, your companion turned to you in their light
 * ko.end — the chapter's end at the Wind Stone (`ko.end`), in the Keepers' Village (ko.village).
 *   stone   Otoha by the Wind Stone on its paving, the village's thatched roofs across the green, and up the hill
 *           behind them, on the island's crown, the great tree breathing, leaves falling slowly
 *   north   she looks north: over the island's shoulder and the strait the far mountains, and high up among them a
 *           pale point; a few leaves like torn pages drifting from that way
 * ko.tide_night — the Tide Calendar's end, the spring-tide night on the point (`ko.tide_night`, called from the
 *          calendar stone's ring in the tide pools; RBN-QA-089). The world stays as it is: the night is the picture's.
 *   point  under the full moon the tide draws far out over a wide wet flat; the party small on the point's end from
 *          behind, Koyomi a step ahead, looking out; written leaves lying on the flat
 *   rise   the leaves lift one by one and rise toward the moon, each to its own height, and hold there
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
    return cached('ko.village|' + G.w + 'x' + G.h + '|' + G.vb + '|' + (north ? 1 : 0), () => {
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
        // the Keepers' Village round the Wind Stone's paving (ko.village): the sea far off at the left, thatched roofs
        // across the green, and up the hill behind them, on the island's crown, the great tree, breathing
        const sea = p.mat('#4a82aa', { n: 7, at: 3, step: 0.07 }), trunk = p.mat('#6a5038', { n: 7, at: 3, step: 0.08 }), leafM = p.mat('#4a7a3a', { n: 7, at: 3, step: 0.08 });
        const grassM = p.mat('#6a8a48', { n: 7, at: 3, step: 0.08 }), hillM = p.mat('#5a7a46', { n: 7, at: 3, step: 0.08 }), stoneM = p.mat('#8a8a84', { n: 7, at: 3, step: 0.07 });
        const pave = p.mat('#a49c8a', { n: 6, at: 3, step: 0.07 }), thatch = p.mat('#9a8458', { n: 7, at: 3, step: 0.08 }), wall = p.mat('#7a5e44', { n: 6, at: 3, step: 0.08 }), flowers = p.mat('#f0e8a8', { n: 4, at: 2 });
        const vb = G.vb;
        SP.water(L, 0, Math.round(vb * 0.5), Math.round(w * 0.42), Math.round(vb * 0.58), sea, { band: Math.max(2, s(3)), deep: 0.2, seed: 21 });
        // the hill rising to the crown at the right, terraced
        const hill = (x) => vb * 0.52 - clamp((x - w * 0.28) / (w * 0.5), 0, 1) * vb * 0.16 + Math.sin(x / (w * 0.09)) * s(2);
        const hillShade = (x, y) => clamp(0.5 - (y - hill(x)) / h * 0.3 + (((Math.round(y - hill(x)) % Math.max(4, s(7))) === 0) ? -0.12 : 0) + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999);
        L.fill(0, 0, w, h, (x, y) => y > hill(x), hillM, hillShade);
        // the great tree on the crown, the same tree as the island's first sight and the crossing draw it
        // (RB.firstSightArt.paintTree; RBN-QA-079, Agnes 6326875198, Local CL-143): its long limbs reaching out low under
        // a wide umbrella of separate leaf masses, its trunk flaring into the crest with its roots. Its crown keeps one
        // shape at every screen shape: 4.6 times as wide as it is tall (the crossing's, seen from across the water, as
        // it is seen here from the village below), a quarter of the picture's width either side of the trunk, smaller
        // only where the sky over the crest is too low for it (the crown and its trunk stand about 2.6 crown-heights),
        // or where its low far end would reach into Otoha's face beside it (the shot's focus; the smallest picture)
        const tx = Math.round(w * (G.narrow ? 0.7 : 0.74)), crest = Math.round(hill(tx));
        const F = stone.focus(w, h, vb), crTop = (k) => Math.round(crest + s(3) - k * 1.1); // the crown's middle: the fork (half a crown-height under it) a little above the crest
        let crh = Math.max(4, Math.round(Math.min((w * 0.24) / 4.6, (crest - s(4)) / 2.6)));
        if (crTop(crh) + crh > F.y && tx - crh * 4.6 * 1.12 < F.x + F.w + s(2)) crh = Math.max(4, Math.floor((tx - F.x - F.w - s(2)) / (4.6 * 1.12)));
        const crw = Math.round(crh * 4.6), cry = crTop(crh);
        RB.firstSightArt.paintTree(L, { s, narrow: G.narrow, tx, crest, cr: { x: tx, y: cry, rx: crw, ry: crh } }, trunk, leafM);
        // seated on this hill: paintTree's flare and roots end level with the crest, and where the slope falls away
        // under them (on a phone the hill levels only right of the trunk) the ground rises to meet them, a low mound of
        // the hill under the roots that slopes off past their tips, so nothing hangs over the sky (Local CL-145, Agnes
        // 6327999945)
        const base = crest + s(3), reach = Math.round(s(G.narrow ? 9 : 10) * 1.5 + s(30)) + 2, tops = [];
        for (let x = Math.max(0, tx - reach); x <= Math.min(w - 1, tx + reach); x++) {
          for (let y = Math.min(h - 1, base + s(4)); y >= base - s(10); y--) if (L.mt[y * w + x] === trunk.id) { tops[x] = y + 1; break; }
        }
        let tip = -1;
        for (let x = Math.max(0, tx - reach); x <= tx && tip < 0; x++) if (tops[x] != null) tip = x;
        for (let x = tip - 1, k = 1; tip > 0 && x >= 0 && tops[tip] + k * 0.75 < hill(x); x--, k++) tops[x] = Math.round(tops[tip] + k * 0.75);
        const mound = (x, y) => { const c = hillM.c[clamp(Math.floor(hillShade(x, y) * hillM.n), 0, hillM.n - 1)]; L.px[y * w + x] = c; L.mt[y * w + x] = hillM.id; };
        tops.forEach((top, x) => { for (let y = top; y <= Math.min(h - 1, Math.ceil(hill(x))); y++) if (L.mt[y * w + x] !== trunk.id) mound(x, y); });
        // the village's houses across the green: thatched roofs (hipped, the left slope in the light) over dark walls
        const house = (x0, x1, y, ht) => {
          L.fill(x0, y, x1, y + ht, (xx, yy) => yy >= y && xx >= x0 + (y + ht - yy) * 0.7 && xx <= x1 - (y + ht - yy) * 0.7, thatch, (xx, yy) => clamp((xx < x0 + (x1 - x0) * 0.35 ? 0.66 : 0.46) - (yy - y) / ht * 0.1 + (((Math.round(xx) * 3 + Math.round(yy)) % 5) === 0 ? -0.1 : 0), 0.02, 0.999));
          L.rect(x0, y + ht - Math.max(1, s(2)), x1 - x0, Math.max(1, s(2)), thatch, 0.3);
          L.rect(x0 + s(3), y + ht, x1 - x0 - s(6), Math.round(ht * 0.7), wall, (xx) => (xx < x0 + s(6) ? 0.5 : 0.36));
          L.rect(Math.round((x0 + x1) / 2) - s(3), y + ht + s(2), s(6), Math.round(ht * 0.7) - s(2), p.mat('#2a2220', { n: 3, at: 1 }), 0.4);
        };
        const ry = Math.round(vb * 0.53);
        house(Math.round(w * 0.02), Math.round(w * 0.2), ry, s(14));
        house(Math.round(w * 0.36), Math.round(w * 0.56), ry + s(3), s(13));
        house(Math.round(w * 0.82), Math.round(w * 0.99), ry + s(2), s(12));
        // the green, then the Wind Stone's paving in front: flat stones laid in courses
        SP.grass(L, (x) => vb * 0.68 + Math.sin(x / (w * 0.2)) * s(3), h, grassM, { seed: 7, flowers, density: 60 });
        // (in perspective: each course a quarter deeper than the one beyond it, its stones as wide as three of its depth)
        const py = Math.round(vb * 0.8), rows = [];
        for (let y = py, d = Math.max(3, s(4)), r = 0; y < h; y += Math.round(d), d *= 1.25, r++) rows.push([y, Math.max(3, Math.round(d)), r]);
        L.rect(0, py, w, h - py, pave, (x, y) => {
          let q = rows[0]; for (const row of rows) { if (row[0] > y) break; q = row; }
          const [y0, d, r] = q, cw = d * 3, xo = Math.round(x) + (r % 2) * Math.round(cw / 2), j = ((xo % cw) + cw) % cw, k = Math.floor(xo / cw);
          const tone = (((k * 7 + r * 13) % 5) - 2) * 0.03; // each stone a little lighter or darker than its neighbours
          return clamp((j === 0 || y === y0 ? 0.36 : y === y0 + 1 ? 0.6 : 0.52 + tone) - (y - py) / h * 0.1, 0.02, 0.999);
        });
        // the Wind Stone on its paving at the left: broad and low, as it stands in the village (ko_windstone, RBN-QA-075):
        // its front in shade under a flat top worn even for laying a leaf on, lit from the upper left, its front lip
        // catching the light; a crack and some moss low on the front, and a few written leaves pinned against its
        // western end by the wind that always blows over it
        const sx = Math.round(w * 0.16), sy = Math.round(vb * 0.85);
        L.stone([[sx - s(29), sy], [sx - s(32), sy - s(3)], [sx - s(33), sy - s(10)], [sx - s(30), sy - s(16)], [sx - s(25), sy - s(22)], [sx + s(24), sy - s(23)], [sx + s(30), sy - s(17)], [sx + s(33), sy - s(9)], [sx + s(32), sy - s(3)], [sx + s(28), sy]], stoneM, { face: 3, bevel: Math.max(2, s(3)), seam: true });
        L.poly([[sx - s(30), sy - s(16)], [sx - s(25), sy - s(22)], [sx + s(24), sy - s(23)], [sx + s(30), sy - s(17)]], stoneM, (xx) => (xx < sx - s(8) ? 0.79 : 0.72));
        L.seg(sx - s(29), sy - s(16), sx + s(29), sy - s(17), Math.max(1, s(1.5)), stoneM, 0.93);
        L.path([[sx + s(6), sy - s(14)], [sx + s(9), sy - s(10)], [sx + s(12), sy - s(8)]], Math.max(1, s(1)), stoneM, 0.07);
        const moss = p.mat('#5e7a3e', { n: 5, at: 2, step: 0.08 });
        for (const [a, b, l] of [[-24, 2, 9], [-14, 2, 5], [16, 2, 6]]) L.rect(sx + s(a), sy - s(b), s(l), Math.max(1, s(2)), moss, (xx) => (((Math.round(xx) * 5) % 3) === 0 ? 0.3 : 0.55));
        const gold = p.mat('#d0a844', { n: 5, at: 2, step: 0.09 }), ink = p.mat('#2a2434', { n: 3, at: 1 });
        for (const [a, b, ang] of [[-34, 15, -0.5], [-35, 6, 0.5]]) {
          const lx = sx + s(a), ly = sy - s(b), dx = Math.cos(ang) * s(3), dy = Math.sin(ang) * s(3);
          L.seg(lx - dx, ly - dy, lx + dx, ly + dy, Math.max(2, s(3)), gold, 0.7);
          L.rect(Math.round(lx), Math.round(ly), 1, 1, ink, 0.5);
        }
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
      const b = Q.bust('ko_otoha', kb > 0.3 ? 'smile' : 'neutral', kb > 0.3 ? { look: [1, -1] } : null, DAY, false, 200, { arms: { l: 'clasp', r: 'clasp' } });
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

  // ==== ko.tide_night · the spring-tide night on the point (RBN-QA-089) =============================================
  // Masses first: the night sky and the full moon, the sea drawn far out under it, the wide wet flat the tide leaves,
  // and the point's dark rocks reaching into it from the left with two wind-bent pines; the party small on its end, from
  // behind, looking out (Koyomi a step ahead). Detail last and little of it: the moon's road on the water, the leaves
  // lying on the flat. Moonlight comes from the upper right: cool and pale on the rocks' right faces and the figures'
  // right sides, the rest in shade. Nothing here is a clock or a tide table: the picture is the night the scene tells.
  const MOONLIT = { mul: [0.5, 0.56, 0.78], add: [2, 6, 22], rim: { side: 'r', col: '#dfe8ff', k: [0.42, 0.18], below: 0.85 } };
  function geomTide(w, h, vb) {
    const S = stage(w, h, vb), narrow = S.lay === 'narrow', V = S.vb;
    // the horizon, the far water's edge once the tide is out, the near edge of the flat, the point's tip
    const hz = Math.round(V * 0.36), far = Math.round(V * 0.46), near = Math.round(V * 0.92);
    const tipX = Math.round(w * (narrow ? 0.5 : 0.4)), tipY = Math.round(V * 0.7);
    return Object.assign(S, { narrow, hz, far, near, tipX, tipY, slope: narrow ? 0.55 : 1.1,
      moon: { x: Math.round(w * (narrow ? 0.72 : 0.7)), y: Math.round(V * (narrow ? 0.18 : 0.15)), r: Math.max(6, S.s(narrow ? 15 : 13)) } });
  }
  // where the point's rock meets the flat at row y (below its tip the shore runs back toward us and to the left)
  const shoreX = (G, y) => G.tipX - Math.max(0, y - G.tipY) * G.slope + Math.round(Math.sin(y / G.s(5)) * G.s(1.5));
  // the point's upper edge at x (left of its tip): rising toward the left edge, a few rock steps along it
  function pointTop(G, x) {
    const u = clamp(x / G.tipX, 0, 1);
    return G.tipY - (1 - u) * (1 - u) * G.vb * 0.2 - Math.round(Math.sin(x / G.s(9)) * G.s(1.5)) - (((Math.floor(x / G.s(14))) % 3) === 0 ? G.s(2) : 0);
  }
  function tideStatic(G) {
    return cached('ko.tide_night|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, hz, far, moon } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      Q.bandsIn(g, 0, 0, w, hz + 1, ['#060918', '#090e22', '#0c142c', '#111a36', '#162040', '#1c2848'], 0.45);
      SP.stars(g, 0, 0, w, Math.round(hz * 0.85), Math.round(70 * G.Z), 61, 9);
      // the full moon: its light round it, then the disc, a little shaded at its lower left, with a few grey seas
      SP.glow(g, moon.x, moon.y, moon.r * 5, '200,212,255', 0.22);
      SP.glow(g, moon.x, moon.y, moon.r * 2.4, '226,232,255', 0.35);
      const mr = moon.r;
      for (let j = -mr; j <= mr; j++) for (let i = -mr; i <= mr; i++) {
        const d = Math.hypot(i, j) / mr;
        if (d > 1) continue;
        const sea = (Math.hypot(i + mr * 0.25, j + mr * 0.2) < mr * 0.32) || (Math.hypot(i - mr * 0.3, j + mr * 0.05) < mr * 0.22) || (Math.hypot(i + mr * 0.05, j - mr * 0.4) < mr * 0.2);
        const shade = (i + j) / mr > 0.55 && d > 0.7;
        g.fillStyle = sea ? (shade ? '#b4bcc8' : '#c8ced8') : (shade ? '#dce0e8' : d > 0.88 ? '#e8ecf2' : '#f4f6fa');
        g.fillRect(moon.x + i, moon.y + j, 1, 1);
      }
      const L = SP.layer(w, h);
      // the sea drawn far out: ripple bands, the moon's road down it
      const sea = p.mat('#24345a', { n: 7, at: 3, step: 0.07 });
      const road = (x, y) => clamp(1 - Math.abs(x - moon.x) / (s(8) + (y - hz) * 1.4), 0, 1);
      SP.water(L, 0, hz + 1, w, far, sea, { band: Math.max(2, s(3)), deep: 0.3, seed: 41, lit: (x, y) => road(x, y) * 0.3 });
      // the flat the tide leaves: wet sand, quiet; the moon's road lying on it where it is wettest, sand ripples faint
      const sand = p.mat('#3c4660', { n: 7, at: 3, step: 0.07 });
      // two wet channels winding out across the flat from under the point toward the far water, darker, a lit lip
      const chan = [[G.tipX - s(10), w * 0.62, 0.3], [G.tipX + s(30), w * 0.86, 1.7]];
      const inChan = (x, y) => {
        if (y > G.near) return 0;
        const u = clamp((y - far) / (G.near - far), 0, 1);
        for (const [x0, x1, ph] of chan) {
          const cx = lerp(x1, x0, u) + Math.sin(u * 7 + ph) * s(10), hw = (s(1.5) + u * s(5)) * Math.min(1, (1 - u) * 6), d = x - cx;
          if (Math.abs(d) < hw) return d < -hw + 1.2 ? 2 : 1; // (its far lip, toward the moon, lit)
        }
        return 0;
      };
      L.fill(0, far, w, h, () => true, sand, (x, y) => {
        const d = (y - far) / (h - far);
        const ripRow = ((Math.round(y * 2 + Math.sin(x / s(11)) * s(3)) % Math.max(4, s(6))) === 0);
        // the moon's road on the wet sand: broken, caught only on the ripples' crests
        const wet = road(x, y) * (1 - d) * (ripRow ? 0.22 : 0.05);
        const c = inChan(x, y), ch = c === 1 ? -0.1 : c === 2 ? 0.08 : 0;
        return clamp(0.36 + d * 0.1 + (ripRow ? 0.05 : 0) + wet + ch + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999);
      });
      // a few pools left on the flat, holding the sky
      const pool = p.mat('#2a3a62', { n: 5, at: 2, step: 0.08 }), rp = p.rnd(43);
      for (let i = 0; i < 6; i++) {
        const px = Math.round(G.tipX + s(8) + rp() * (w - G.tipX - s(8))), py = Math.round(lerp(far + s(8), G.near - s(4), rp())), rw = s(8 + rp() * 14);
        L.ell(px, py, rw, Math.max(1, Math.round(rw * 0.22)), pool, (x) => clamp(0.45 + road(x, py) * 0.4, 0.02, 0.999));
      }
      // the point: dark rock from the left edge out to its tip, its right faces taking the moon
      const rock = p.mat('#323848', { n: 7, at: 3, step: 0.09 });
      L.fill(0, 0, G.tipX + s(4), h, (x, y) => y >= pointTop(G, x) && x <= shoreX(G, y), rock, (x, y) => {
        const top = pointTop(G, x), face = y - top, side = shoreX(G, y) - x;
        // its top and its seaward side take the moon; ledges across the face; darker into the land
        const lit = face < s(2.5) ? 0.34 : side < s(2.5) ? 0.4 : side < s(7) ? 0.2 : 0;
        const ledge = ((Math.round(y - top * 0.5 + x * 0.25) % Math.max(6, s(11))) === 0) ? 0.12 : 0;
        return clamp(0.3 + lit + ledge - (face / h) * 0.3 + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999);
      });
      // boulders fallen at the point's foot, lit on their seaward side
      const rb = p.rnd(29);
      for (let i = 0; i < 7; i++) {
        const by = Math.round(lerp(G.tipY + s(6), G.near, rb())), bx = Math.round(shoreX(G, by) + s(2) + rb() * s(10)), br = s(2 + rb() * 4);
        L.ell(bx, by, br, Math.max(1, Math.round(br * 0.65)), rock, (x, y) => clamp((x > bx ? 0.62 : 0.36) + (y < by - br * 0.3 ? 0.14 : 0), 0.02, 0.999));
      }
      // two pines on the point, bent by the wind off the sea, dark against the sky
      const bark = p.mat('#1c1a1e', { n: 4, at: 2, step: 0.06 }), pine = p.mat('#16202a', { n: 5, at: 2, step: 0.06 });
      for (const [fx, ht, lean, seed] of [[0.07, 54, -1, 5], [0.17, 38, -1, 6]]) {
        const tx = Math.round(w * fx), ty = Math.round(pointTop(G, tx)), H = s(ht);
        L.path([[tx, ty, s(4)], [tx + lean * s(6), ty - H * 0.5, s(3)], [tx + lean * s(14), ty - H, s(2)]], s(3), bark, 0.4);
        SP.crown(L, tx + lean * s(18), ty - H - s(2), s(ht * 0.5), s(10), pine, { n: 6, seed });
        SP.crown(L, tx + lean * s(8), ty - H * 0.6, s(ht * 0.34), s(7), pine, { n: 4, seed: seed + 10 });
      }
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv };
    });
  }
  // the leaves on the flat: where each lies, its size, how it lies, and when it lifts and how long it takes to rise
  function tideLeaves(G) {
    return Q.small('ko.tide_leaves|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const rnd = P().rnd(53), out = [];
      for (let i = 0; i < 22; i++) {
        const y = lerp(G.far + G.s(10), G.near - G.s(6), rnd() ** 0.8), x = lerp(G.tipX + G.s(14), G.w - G.s(6), rnd());
        const d = (y - G.far) / (G.near - G.far);
        out.push({ x, y, len: Math.max(3, Math.round(G.s(3 + d * 4))), ang: rnd() * 3.14, seed: i * 17 + 3,
          rest: rnd(), sway: rnd() * 6.28 });
      }
      return out;
    });
  }
  // a leaf rising from where it lay toward the moon: q 0 lying … 1 high under the moon (and gone)
  function riseAt(G, L0, q) {
    const e = ease(clamp(q * 1.15, 0, 1));
    const x = lerp(L0.x, G.moon.x + (L0.x - G.moon.x) * 0.25, e) + Math.sin(q * 9 + L0.sway) * G.s(6) * Math.min(1, q * 4);
    const y = lerp(L0.y, G.moon.y + G.moon.r * 3, e);
    return { x: Math.round(x), y: Math.round(y), len: Math.max(2, Math.round(L0.len * (1 - e * 0.55))), a: q < 0.85 ? 1 : clamp((1 - q) / 0.15, 0, 1) };
  }
  // the party on the point's end, from behind, looking out to sea: Koyomi a step ahead, you and your companion
  function tideParty(c, G, st) {
    const sc = clamp(0.5 * G.Z, 0.3, 0.6), ko = (RB.content.chars.ko_koyomi || {}).look;
    const shadow = (x, y) => { c.fillStyle = 'rgba(6,8,16,0.4)'; P().disc(c, x, y, G.s(6), Math.max(1, G.s(1.5))); };
    const at = (dx) => { const x = G.tipX - G.s(dx); return [x, Math.round(pointTop(G, x)) + 1]; };
    const people = [[at(6), ko], [at(22), st.cast.pc]];
    if (st.cast.comp) people.push([at(36), st.cast.comp.look]);
    for (const [[x, y], look] of people.reverse()) {
      const f = Q.figure(look, 'up', 'i0', sc, MOONLIT);
      if (!f) continue;
      shadow(x, y);
      c.drawImage(f.cv, x - f.ax, y - f.ay);
    }
  }
  function partyBox(G) {
    const sc = clamp(0.5 * G.Z, 0.3, 0.6), x0 = G.tipX - G.s(36) - Math.round(14 * sc), x1 = G.tipX - G.s(6) + Math.round(14 * sc);
    const y1 = Math.round(pointTop(G, G.tipX - G.s(6))) + 2, y0 = Math.round(pointTop(G, G.tipX - G.s(36))) - Math.round(58 * sc);
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  const point = {
    phases: [['ebb', 1400]],
    safe: { wide: 'the moon, the point and the party on it, above the sheet', narrow: 'the moon and the party in the upper half', land: 'the party on the point' },
    draw(c, w, h, t, st) {
      const G = geomTide(w, h, st.vb), { s } = G;
      c.drawImage(tideStatic(G).cv, 0, 0);
      // the tide drawing out: a sheet of shallow water over the flat whose edge goes out from near the point to the far
      // water (Reduce motion: out at once)
      const k = ease(st.at('ebb')), edge = Math.round(lerp(G.tipY + s(6), G.far, k));
      if (edge > G.far + 1) {
        for (let y = G.far; y < edge; y++) {
          const dd = (y - G.far) / Math.max(1, edge - G.far);
          c.fillStyle = 'rgba(40,58,98,' + (0.55 - dd * 0.25).toFixed(2) + ')';
          c.fillRect(G.tipX, y, w - G.tipX, 1);
        }
        c.fillStyle = 'rgba(190,204,232,0.55)';
        for (let x = G.tipX; x < w; x += 2) if (((x >> 2) + (edge >> 1)) % 3) c.fillRect(x, edge + (((x >> 3) % 2) ? 0 : -1), 2, 1);
      }
      SP.glints(c, G.moon.x - s(14), G.hz + 2, s(28), G.far - G.hz - 2, t, 16, 71, '226,234,255', st.still);
      // the leaves lying on the flat, faintly lit
      for (const L0 of tideLeaves(G)) {
        if (L0.y < edge) continue;
        SP.glow(c, L0.x, L0.y, L0.len + 2, '240,228,170', 0.1);
        RB.firstSightArt.goldLeaf(c, L0.x, L0.y, L0.len, L0.ang, 0.9, L0.seed, h);
      }
      tideParty(c, G, st);
    },
    focus(w, h, vb) { return partyBox(geomTide(w, h, vb)); },
  };
  // where each leaf is at the lift's progress k (0 … 1): it lies on the flat until its turn (one after another across
  // the first part of the lift), then rises to its own height on the way to the moon and stays there. At k = 1 every
  // leaf is at its height: the picture the shot holds, the same however long a line is read (only the moon's glints on
  // the far water come and go, as in the first shot). Replay runs the lift again from the flat.
  function liftAt(L0, i, n, k) {
    const d = (i / n) * 0.5, top = 0.15 + L0.rest * 0.68; // (its height stays under 0.85: no leaf fades away)
    return top * ease(sub(k, d, d + 0.5));
  }
  const rise = {
    phases: [['lift', 1600]],
    safe: { wide: 'the leaves rising toward the moon over the party, above the sheet', narrow: 'the leaves and the moon in the upper half', land: 'the leaves and the moon' },
    draw(c, w, h, t, st) {
      const G = geomTide(w, h, st.vb), { s } = G;
      c.drawImage(tideStatic(G).cv, 0, 0);
      SP.glints(c, G.moon.x - s(14), G.hz + 2, s(28), G.far - G.hz - 2, t, 16, 71, '226,234,255', st.still);
      // one by one the leaves lift and rise toward the moon, each to its own height, and hold there (Reduce motion and a
      // look back: there at once)
      const k = st.at('lift'), Lv = tideLeaves(G);
      for (let i = 0; i < Lv.length; i++) {
        const L0 = Lv[i], q = liftAt(L0, i, Lv.length, k);
        if (q <= 0) { RB.firstSightArt.goldLeaf(c, L0.x, L0.y, L0.len, L0.ang, 0.9, L0.seed, h); continue; }
        const r = riseAt(G, L0, q);
        if (r.a <= 0) continue;
        c.globalAlpha = r.a;
        SP.glow(c, r.x, r.y, r.len + 3, '244,232,176', 0.18);
        RB.firstSightArt.goldLeaf(c, r.x, r.y, r.len, L0.ang + q * 6, 0.35 + 0.6 * Math.abs(Math.sin(q * 7 + L0.sway)), L0.seed, h);
        c.globalAlpha = 1;
      }
      tideParty(c, G, st);
    },
    focus(w, h, vb) { const G = geomTide(w, h, vb), b = partyBox(G), y0 = G.moon.y - G.moon.r; return { x: Math.min(b.x, G.tipX), y: y0, w: Math.max(b.x + b.w, G.moon.x + G.moon.r) - Math.min(b.x, G.tipX), h: b.y + b.h - y0 }; },
  };
  RB.sequence.define('ko.tide_night', {
    title: { en: 'The spring-tide night', jp: '{大潮|おおしお} の {夜|よる}' }, chapter: 'ko', scene: 'ko.tide_night',
    shots: { point, rise },
  });

  // The leaves coming down, for the island's first sight on landing (src/ui/42g_interlude_firstsight.js, RBN-QA-073),
  // so the tree's leaves fall the same way in every picture of it.
  RB.seqKo = { falling };
})();
