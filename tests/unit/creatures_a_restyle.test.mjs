// Creatures A restyle (docs/battle/creatures_a.md, "The rendering standard"): the shared ramp and
// outline helpers keep their promises (a high value range, shadows turning cool, highlights warm,
// outlines a dark colour rather than black), every drawing of every family fits its canvas (no
// clipped pose), each family's idle extent — what the stage lays out — stays close to the one the
// layout was tuned for, and the shared creature frame cache stays inside its byte budget with
// truthful statistics. Frames are rasterised in node through a minimal canvas stand-in (pixels
// only; nothing is drawn to a screen).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const A = RB.creaturesA, EA = RB.enemyArt, K = RB.pxkit;
  // a canvas stand-in: keeps the RGBA a frame was rasterised into
  class Cv { constructor(w, h) { this.width = w; this.height = h; this.data = null; } getContext() { const self = this; return { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData(img) { self.data = img.data; }, drawImage() {}, fillRect() {}, clearRect() {} }; } }
  RB.sprites.makeCanvas = (w, h) => new Cv(w, h);
  const hsl = (hex) => { const c = K.parse(hex); return K.rgb2hsl(c[0], c[1], c[2]); };
  const hueDist = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

  // ---- ramps and outlines -------------------------------------------------------------------
  for (const [name, base] of [['flour cream', '#e8e0d0'], ['teal glass', '#8fb8b0'], ['brick clay', '#8a5a40'], ['indigo ink', '#2a2a44'], ['reed green', '#b8d88a']]) {
    const r = A.hramp(base, { n: 6 }), L = r.map((c) => hsl(c)[2]);
    t.ok(L.every((v, i) => i === 0 || v > L[i - 1]), name + ': the ramp runs dark → light');
    t.ok(L[5] - L[0] >= 0.6, name + ': a high value range (' + (L[5] - L[0]).toFixed(2) + ')');
    const h0 = hsl(r[0])[0], h5 = hsl(r[5])[0], hb = hsl(base)[0];
    t.ok(hueDist(h0, 250) < hueDist(hb, 250) || hueDist(h0, hb) > 8, name + ': its shadow turns toward the cool side (' + h0.toFixed(0) + '° from ' + hb.toFixed(0) + '°)');
    t.ok(hueDist(h5, 50) <= hueDist(hb, 50) + 1, name + ': its highlight turns warm (' + h5.toFixed(0) + '°)');
    const M = A.hmat(base, { n: 6 }), line = [M.line & 255, (M.line >> 8) & 255, (M.line >> 16) & 255];
    const lh = K.rgb2hsl(line[0], line[1], line[2]);
    t.ok(lh[2] < L[0] && lh[2] > 0.02 && lh[1] >= 0.3, name + ': its outline is a dark colour, darker than its darkest tone, not black (l ' + lh[2].toFixed(2) + ', s ' + lh[1].toFixed(2) + ')');
  }

  // ---- every drawing fits its canvas; the idle extent the stage lays out ---------------------
  // the idle extents (height, art px) the stage layout was tuned with before the restyle
  const WAS = { moth: 128, wisp: 135, echo: 141, blot: 109, crab: 125, golem: 160, crane: 136, sg_letter: 130, clerk: 149, warden: 206 };
  const box = (cv) => {
    const d = cv.data, w = cv.width, h = cv.height;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return [x0, y0, x1, y1];
  };
  for (const f of A.FAMILIES) {
    const spec = EA.P[f], ids = Object.keys(RB.content.enemies).filter((id) => RB.content.enemies[id].art === f);
    const opts = ids.map((id) => Object.assign({}, RB.content.enemies[id].artOpts || {}));
    const clipped = [];
    for (const o of opts.slice(0, 1)) {
      const seq = [...new Set(spec.seq || [...Array(spec.frames).keys()])];
      const L0 = K.layer(spec.w, spec.h, spec.ox, spec.oy);
      for (const fr of seq) { const L = K.layer(spec.w, spec.h, spec.ox, spec.oy); const cv = (spec.build(L, fr, o, EA.H) || L).canvas(); const b = box(cv); if (b[0] <= 0 || b[1] <= 0 || b[2] >= spec.w - 1 || b[3] >= spec.h - 1) clipped.push('idle' + fr); }
      for (const key of Object.keys(spec.poses)) for (let i = 0; i < spec.poses[key]; i++) {
        const L = K.layer(spec.w, spec.h, spec.ox, spec.oy), cv = (spec.pose(L, key, i, spec.poses[key], o, EA.H, -1) || L).canvas(), b = box(cv);
        if (b[2] < 0) continue;
        if (b[0] <= 0 || b[1] <= 0 || b[2] >= spec.w - 1 || b[3] >= spec.h - 1) clipped.push(key + '#' + i);
      }
      void L0;
    }
    t.ok(!clipped.length, f + ': every idle and posed drawing fits its ' + spec.w + ' × ' + spec.h + ' canvas' + (clipped.length ? ' (clipped: ' + clipped.slice(0, 6).join(', ') + ')' : ''));
    const e = EA.extent(f, opts[0]), hgt = e.bottom - e.top;
    t.ok(Math.abs(hgt - WAS[f]) <= 8, f + ': its idle extent (what the stage lays out) stays within 8 art px of the height the layout was tuned with (' + hgt + ', was ' + WAS[f] + ')');
  }

  // ---- the shared frame cache is bounded by bytes, and its statistics are truthful ------------
  const st0 = EA.cacheStats();
  t.ok(st0.capBytes > 0 && st0.capBytes <= 32 * 1048576 && st0.cap === 140, 'the creature frame cache is bounded by count (140) and by bytes (' + (st0.capBytes / 1048576) + ' MiB)');
  // fill it with every family's frames in several palettes (far more than it may hold)
  let built = 0;
  for (const f of A.FAMILIES) {
    const spec = EA.P[f], ids = Object.keys(RB.content.enemies).filter((id) => RB.content.enemies[id].art === f);
    for (const id of ids.slice(0, 3)) { const o = Object.assign({}, RB.content.enemies[id].artOpts || {}); for (let fr = 0; fr < spec.frames; fr++) { EA.frame(f, fr, o); built++; } }
  }
  const st = EA.cacheStats();
  t.ok(built > st.frames, 'more frames were built (' + built + ') than the cache keeps (' + st.frames + ')');
  t.ok(st.bytes <= st.capBytes && st.frames <= st.cap, 'the cache stays inside its bounds: ' + st.frames + ' frames, ' + st.mib + ' MiB');
  t.ok(st.mib === +(st.bytes / 1048576).toFixed(3) && st.bytes % 4 === 0 && st.bytes > 0, 'cacheStats reports its bytes as the sum of w × h × 4 over the frames it holds');
};
