// Synthetic handwriting distortions for evaluating RB.recog (test/eval only).
// Nothing here is used to build templates: templates are the KanjiVG paths
// plus the fixed variant rules in src/recog/20_recognizer.js. Every sample is
// seeded from (family, character, index) so runs are reproducible.

export function rng(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  let s = h >>> 0;
  const f = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.range = (a, b) => a + (b - a) * f();
  f.int = (n) => Math.floor(f() * n);
  return f;
}

const len = (s) => s.reduce((L, p, i) => (i ? L + Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1]) : 0), 0);

function densify(s, spacing) {
  const L = len(s);
  if (L < 1e-6) return [s[0].slice(), s[0].slice()];
  const n = Math.max(2, Math.round(L / spacing) + 1);
  const out = [];
  let acc = 0, i = 1, prev = s[0];
  out.push(s[0].slice());
  for (let k = 1; k < n - 1; k++) {
    const target = (k * L) / (n - 1);
    while (i < s.length) {
      const seg = Math.hypot(s[i][0] - prev[0], s[i][1] - prev[1]);
      if (acc + seg >= target && seg > 0) {
        const t = (target - acc) / seg;
        prev = [prev[0] + (s[i][0] - prev[0]) * t, prev[1] + (s[i][1] - prev[1]) * t];
        acc = target; out.push(prev); break;
      }
      acc += seg; prev = s[i]; i++;
    }
  }
  out.push(s[s.length - 1].slice());
  return out;
}

// Characters distinguished from another character mainly by stroke direction.
export const DIRECTION_CRITICAL = new Set([...'ソンシツゾジヅッ']);

// Parameter ranges per family. 'dev' is the only family used while tuning
// recognizer constants; the 'heldout-*' families use different seeds and
// wider ranges and are only used for reporting.
// 'dev-strong' is the tuning family for the kanji-at-scale constants (the
// coarse pre-filter, shortlists, joins, twins; 2026-09-29): as strong as
// 'heldout-mixed' but with its own seeds; the held-out families stay unseen.
export const FAMILIES = {
  dev: { rot: 8, shear: 0.1, aniso: 0.12, strokeJit: 2.5, strokeRot: 5, wobble: 1.2, noise: 0.5, trunc: 0.06, ext: 0.05, pJoin: 0.15, pSwap: 0.1, pRev: 0.1 },
  'dev-strong': { rot: 11, shear: 0.14, aniso: 0.17, strokeJit: 3.5, strokeRot: 7, wobble: 2.0, noise: 0.9, trunc: 0.1, ext: 0.08, pJoin: 0.25, pSwap: 0.2, pRev: 0.2 },
  'heldout-affine': { rot: 12, shear: 0.18, aniso: 0.2, strokeJit: 0, strokeRot: 0, wobble: 0, noise: 0.3, trunc: 0, ext: 0, pJoin: 0, pSwap: 0, pRev: 0 },
  'heldout-noise': { rot: 4, shear: 0.05, aniso: 0.08, strokeJit: 4, strokeRot: 8, wobble: 2.2, noise: 1.0, trunc: 0, ext: 0, pJoin: 0, pSwap: 0, pRev: 0 },
  'heldout-truncext': { rot: 4, shear: 0.05, aniso: 0.08, strokeJit: 1.5, strokeRot: 3, wobble: 0.8, noise: 0.4, trunc: 0.12, ext: 0.1, pJoin: 0, pSwap: 0, pRev: 0 },
  'heldout-joined': { rot: 4, shear: 0.05, aniso: 0.08, strokeJit: 1.5, strokeRot: 3, wobble: 0.8, noise: 0.4, trunc: 0, ext: 0, pJoin: 1, pSwap: 0, pRev: 0 },
  'heldout-permuted': { rot: 4, shear: 0.05, aniso: 0.08, strokeJit: 1.5, strokeRot: 3, wobble: 0.8, noise: 0.4, trunc: 0, ext: 0, pJoin: 0, pSwap: 1, pRev: 0 },
  'heldout-reversed': { rot: 4, shear: 0.05, aniso: 0.08, strokeJit: 1.5, strokeRot: 3, wobble: 0.8, noise: 0.4, trunc: 0, ext: 0, pJoin: 0, pSwap: 0, pRev: 1 },
  'heldout-mixed': { rot: 12, shear: 0.15, aniso: 0.18, strokeJit: 3.5, strokeRot: 7, wobble: 1.8, noise: 0.8, trunc: 0.1, ext: 0.08, pJoin: 0.25, pSwap: 0.2, pRev: 0.2 },
};

// ref: {box, strokes:[[{x,y}]]} as returned by RB.recog.reference.
// Returns {strokes:[[{x,y,t}]], box:{w,h}, info:{joined, swapped, reversed}}
export function distort(ref, family, seed, opt = {}) {
  const F = typeof family === 'string' ? FAMILIES[family] : family;
  const r = rng(`${typeof family === 'string' ? family : 'custom'}|${seed}`);
  const B = ref.box;
  let strokes = ref.strokes.map((s) => s.map((p) => [p.x, p.y]));
  const info = { joined: 0, swapped: 0, reversed: 0 };
  const c0 = [B / 2, B / 2];

  // per-stroke rigid jitter
  strokes = strokes.map((s) => {
    const cx = s.reduce((a, p) => a + p[0], 0) / s.length, cy = s.reduce((a, p) => a + p[1], 0) / s.length;
    const a = (r.range(-F.strokeRot, F.strokeRot) * Math.PI) / 180;
    const tx = r.range(-F.strokeJit, F.strokeJit), ty = r.range(-F.strokeJit, F.strokeJit);
    const ca = Math.cos(a), sa = Math.sin(a);
    return s.map(([x, y]) => [cx + (x - cx) * ca - (y - cy) * sa + tx, cy + (x - cx) * sa + (y - cy) * ca + ty]);
  });
  // truncation / extension at the ends of longer strokes
  strokes = strokes.map((s) => {
    const L = len(s);
    if (L < 12 || (!F.trunc && !F.ext)) return s;
    let d = densify(s, 0.5);
    const cutA = Math.floor(d.length * r.range(0, F.trunc)), cutB = Math.floor(d.length * r.range(0, F.trunc));
    if (d.length - cutA - cutB > 6) d = d.slice(cutA, d.length - cutB);
    if (F.ext && r() < 0.5) {
      const e = r.range(0, F.ext) * L, n = d.length;
      const a = d[n - 1], b = d[Math.max(0, n - 4)];
      const l = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1;
      d.push([a[0] + ((a[0] - b[0]) / l) * e, a[1] + ((a[1] - b[1]) / l) * e]);
    }
    return d;
  });
  // reversed stroke (one of the longer strokes). Not applied where direction is
  // the distinguishing feature (a reversed ソ stroke is ン): see DIRECTION_CRITICAL.
  let revIdx = -1;
  if (F.pRev && r() < F.pRev && !DIRECTION_CRITICAL.has(opt.ch)) {
    const cand = strokes.map((s, i) => [len(s), i]).filter((x) => x[0] > 15);
    if (cand.length) { revIdx = cand[r.int(cand.length)][1]; strokes[revIdx] = strokes[revIdx].slice().reverse(); info.reversed++; }
  }
  // joined consecutive strokes (end of one flows into the start of the next);
  // never across the boundary between a base character and its ゛/゜
  if (F.pJoin && r() < F.pJoin && strokes.length > 1) {
    const cand = [];
    const nfd = (opt.ch || '').normalize('NFD');
    const diacN = nfd.length > 1 ? (nfd.charCodeAt(1) === 0x309a ? 1 : 2) : 0;
    for (let i = 0; i + 1 < strokes.length; i++) {
      if (diacN && i === strokes.length - diacN - 1) continue;
      if (i === revIdx || i + 1 === revIdx) continue; // a join follows the writing direction
      const a = strokes[i][strokes[i].length - 1], b = strokes[i + 1][0];
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 40) cand.push(i);
    }
    if (cand.length) {
      const i = cand[r.int(cand.length)];
      strokes.splice(i, 2, strokes[i].concat(strokes[i + 1]));
      info.joined++;
    }
  }
  // swapped stroke order
  if (F.pSwap && r() < F.pSwap && strokes.length > 1) {
    const i = r.int(strokes.length - 1);
    const j = i + 1 + r.int(strokes.length - 1 - i);
    [strokes[i], strokes[j]] = [strokes[j], strokes[i]];
    info.swapped++;
  }
  // global affine
  const rot = (r.range(-F.rot, F.rot) * Math.PI) / 180, sh = r.range(-F.shear, F.shear);
  const sx = 1 + r.range(-F.aniso, F.aniso), sy = 1 + r.range(-F.aniso, F.aniso);
  const ca = Math.cos(rot), sa = Math.sin(rot);
  strokes = strokes.map((s) => s.map(([x, y]) => {
    let X = (x - c0[0]) * sx, Y = (y - c0[1]) * sy;
    X += sh * Y;
    return [c0[0] + X * ca - Y * sa, c0[1] + X * sa + Y * ca];
  }));
  // wobble + noise along densified strokes (pointer-like sampling)
  const ph1 = r.range(0, 6.28), ph2 = r.range(0, 6.28), f1 = r.range(0.04, 0.09), f2 = r.range(0.1, 0.2);
  strokes = strokes.map((s) => {
    const d = densify(s, r.range(1.2, 2.2));
    let acc = 0;
    return d.map((p, i) => {
      if (i) acc += Math.hypot(p[0] - d[i - 1][0], p[1] - d[i - 1][1]);
      const w1 = F.wobble * Math.sin(acc * f1 + ph1), w2 = F.wobble * 0.5 * Math.sin(acc * f2 + ph2);
      return [p[0] + w1 + r.range(-F.noise, F.noise), p[1] + w2 + r.range(-F.noise, F.noise)];
    });
  });
  // place into a pad box (pixels), keep KanjiVG-relative size unless overridden
  const padW = opt.pad || 300;
  const scale = (padW / B) * (opt.scale || r.range(0.85, 1.05));
  const ox = r.range(-0.04, 0.04) * padW + (padW - B * scale) / 2, oy = r.range(-0.04, 0.04) * padW + (padW - B * scale) / 2;
  let t = 0;
  const out = strokes.map((s) => {
    t += 150 + r.int(200);
    return s.map((p) => ({ x: ox + p[0] * scale, y: oy + p[1] * scale, t: (t += 8 + r.int(8)) }));
  });
  return { strokes: out, box: { w: padW, h: padW }, info };
}

// Nonsense generators for rejection tests.
export function nonsense(kind, seed, padW = 300) {
  const r = rng(`nonsense-${kind}|${seed}`);
  const P = (x, y, t) => ({ x, y, t });
  let t = 0;
  const line = (pts) => pts.map(([x, y]) => P(x, y, (t += 10)));
  const W = padW;
  if (kind === 'dot') {
    const x = r.range(0.2, 0.8) * W, y = r.range(0.2, 0.8) * W;
    return [line([[x, y], [x + r.range(0, 3), y + r.range(0, 3)]])];
  }
  if (kind === 'blob') {
    // tight back-and-forth hatching filling a region
    const cx = r.range(0.35, 0.65) * W, cy = r.range(0.35, 0.65) * W, R = r.range(0.12, 0.25) * W;
    const pts = [];
    for (let k = 0; k < 40; k++) {
      const yy = cy - R + (2 * R * k) / 39;
      pts.push([cx - R + r.range(-5, 5), yy], [cx + R + r.range(-5, 5), yy + r.range(-3, 3)]);
    }
    return [line(pts)];
  }
  if (kind === 'zigzag') {
    const n = 10 + r.int(12), pts = [];
    for (let k = 0; k < n; k++) pts.push([0.05 * W + (0.9 * W * k) / (n - 1), k % 2 ? 0.1 * W + r.range(0, 20) : 0.9 * W - r.range(0, 20)]);
    return [line(pts)];
  }
  if (kind === 'scribble') {
    // several strokes of random smooth-ish wandering lines
    const ns = 2 + r.int(4), out = [];
    for (let s = 0; s < ns; s++) {
      let x = r.range(0.1, 0.9) * W, y = r.range(0.1, 0.9) * W, a = r.range(0, 6.28);
      const pts = [[x, y]];
      const steps = 30 + r.int(50);
      for (let k = 0; k < steps; k++) {
        a += r.range(-0.9, 0.9);
        x = Math.min(W * 0.95, Math.max(W * 0.05, x + Math.cos(a) * 8));
        y = Math.min(W * 0.95, Math.max(W * 0.05, y + Math.sin(a) * 8));
        pts.push([x, y]);
      }
      out.push(line(pts));
    }
    return out;
  }
  if (kind === 'tangle') {
    // one long random tangle of straight segments between random points
    const pts = [];
    const n = 8 + r.int(8);
    for (let k = 0; k < n; k++) pts.push([r.range(0.1, 0.9) * W, r.range(0.1, 0.9) * W]);
    return [line(pts)];
  }
  throw new Error('unknown nonsense kind ' + kind);
}

// Kanji the recognizer does NOT know, built from the real KanjiVG strokes of
// kanji it does know, placed as components (林 = 木 + 木, 明 = 日 + 月). They
// stand in for "a kanji outside the supported set" in tests of the kanji-like
// detection; no stroke data from outside the repository is used. Each part is
// {ch, x0, y0, x1, y1}: a supported kanji and its box in 0..1 of the square.
const LR = (a, b, s = 0.46) => [{ ch: a, x0: 0.08, y0: 0.1, x1: 0.08 + s * 0.9, y1: 0.9 }, { ch: b, x0: 0.54, y0: 0.08, x1: 0.94, y1: 0.92 }];
const TB = (a, b) => [{ ch: a, x0: 0.15, y0: 0.06, x1: 0.85, y1: 0.46 }, { ch: b, x0: 0.12, y0: 0.52, x1: 0.88, y1: 0.94 }];
const T3 = (a, b, c) => [{ ch: a, x0: 0.25, y0: 0.06, x1: 0.75, y1: 0.46 }, { ch: b, x0: 0.08, y0: 0.52, x1: 0.46, y1: 0.94 }, { ch: c, x0: 0.54, y0: 0.52, x1: 0.92, y1: 0.94 }];
export const UNKNOWN_KANJI = {
  '林': LR('木', '木'), '明': LR('日', '月', 0.36), '朋': LR('月', '月'), '炎': TB('火', '火'), '昌': TB('日', '日'),
  '圭': TB('土', '土'), '岩': TB('山', '石'), '男': TB('田', '力'), '呂': TB('口', '口'), '品': T3('口', '口', '口'),
  '森': T3('木', '木', '木'), '晶': T3('日', '日', '日'), '畑': LR('火', '田', 0.4), '杏': TB('木', '口'), '呆': TB('口', '木'),
  '古': TB('十', '口'), '早': TB('日', '十'), '杜': LR('木', '土'), '相': LR('木', '目', 0.44), '叶': LR('口', '十', 0.4),
  '回': [{ ch: '口', x0: 0.1, y0: 0.08, x1: 0.9, y1: 0.92 }, { ch: '口', x0: 0.35, y0: 0.35, x1: 0.65, y1: 0.62 }],
  '旦': TB('日', '一'), '吉': [{ ch: '土', x0: 0.15, y0: 0.06, x1: 0.85, y1: 0.5 }, { ch: '口', x0: 0.25, y0: 0.56, x1: 0.75, y1: 0.94 }],
};
// reference(ch) -> {box, strokes:[[{x,y}]]} (RB.recog.reference). Returns the
// same shape for the composed kanji, in the 109 box.
export function composeKanji(reference, parts) {
  const strokes = [];
  for (const p of parts) {
    const ref = reference(p.ch);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const s of ref.strokes) for (const q of s) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
    const w = Math.max(1, x1 - x0), h = Math.max(1, y1 - y0);
    for (const s of ref.strokes) strokes.push(s.map((q) => ({ x: Math.round((p.x0 + ((q.x - x0) / w) * (p.x1 - p.x0)) * 108), y: Math.round((p.y0 + ((q.y - y0) / h) * (p.y1 - p.y0)) * 108) })));
  }
  return { box: 109, strokes };
}
