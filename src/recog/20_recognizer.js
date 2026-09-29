/* Local handwriting recognizer (RB.recog).
 *
 * Templates: real KanjiVG stroke paths (src/recog/10_strokedata.js, CC BY-SA 3.0).
 * Method (see docs/RECOGNITION.md):
 *  1. Normalise translation and scale only (bounding-box centre, longest side;
 *     aspect ratio kept). No rotation or reflection normalisation.
 *  2. Pre-filter templates with an order/direction-free, orientation-aware
 *     point-cloud distance (symmetric chamfer).
 *  3. Stroke-structured match for the short list: every input stroke and every
 *     template stroke is resampled to M points; stroke-to-stroke cost is mean
 *     point distance + direction difference, reversed strokes are allowed at a
 *     penalty; strokes are paired by an optimal (Hungarian) assignment with
 *     penalties for unmatched strokes and a small stroke-order penalty.
 *     Joined strokes (template side) and pen-lift splits (input side) are tried
 *     as alternatives, with curated low-cost variants for common handwriting
 *     joins/splits.
 *  4. Small kana share their large form's shape; small vs large is decided by
 *     the explicit toggle and box-relative size (sizeHint). Shape-identical
 *     pairs across scripts are returned together with a note; kana/kanji twins
 *     (ロ/口…) at one distance, kana first.
 *  5. Outside the allowed set: with kanji off, a supported kanji that matches
 *     clearly better is named (kanjiHint); a kanji-like drawing that nothing
 *     allowed matches is flagged (kanjiLike). Neither adds a candidate.
 * The recognizer never receives the expected answer; `script` and `kanji` are
 * the pad mode.
 */
var RB = (globalThis.RB = globalThis.RB || {});

RB.recog = (function () {
  'use strict';
  // Local aliases: global lookups are slow inside some sandboxes (e.g. node vm).
  const sqrt = Math.sqrt, hypot = Math.hypot, floor = Math.floor, round = Math.round;
  const mmin = Math.min, mmax = Math.max, mabs = Math.abs, mexp = Math.exp, mlog = Math.log, atan2 = Math.atan2, PI = Math.PI;
  const INF = 1e300;
  const F64 = Float64Array, I32 = Int32Array, U8 = Uint8Array;

  // ------------------------------------------------------------ parameters
  const P = {
    M: 16, // points per resampled stroke
    NC: 40, // points in the chamfer cloud
    dirW: 0.3, // weight of direction mismatch (0..1 scale) in a stroke-pair cost
    revPen: 0.12, // lenient: cost of a reversed stroke (scaled by stroke length confidence)
    revPenStrict: 0.35,
    unmatchedBase: 0.35, // cost of an unpaired stroke
    unmatchedLen: 0.12, // + per unit of its length
    orderPen: 0.03, // per fraction of inverted stroke pairs (lenient)
    orderPenStrict: 0.12,
    joinCurated: 0.005, // template strokes joined where handwriting commonly joins them
    joinGeneric: 0.045, // any other consecutive template strokes written as one
    inputJoin: 0.04, // consecutive input strokes with a small gap treated as one (pen lift)
    inputJoinGap: 0.22, // max gap (normalised) for an input pen-lift join
    splitVariant: 0.005,
    loopOpenPen: 0.3, // an open stroke compared with a closed template loop (゜)
    cloudW: 0.45, // weight of chamfer distance in the final distance
    cloudOri: 0.12, // orientation weight inside the chamfer
    refineTop: 8, // leading candidates that get the bounded alignment refinement
    refineScale: 1.25, // per-axis scale bound for the refinement
    refineShift: 0.1, // translation bound
    refineCost: 0.05, // distance added per unit of |log scale| + |shift|
    shortlist: 40, // templates passed from the chamfer pre-filter to the structured matcher
    scoreScale: 0.25, // score = exp(-dist/scoreScale); similarity, not a probability
    confidentMax: 0.2, // best distance must be below this for 'confident'
    confidentMaxKanji: 0.17, // ...0.17 for a kanji (a kanji outside the game's set can come close to one inside it)
    nonsenseMin: 0.38, // best distance above this -> 'nonsense'
    smallZ: 0.2, // sizeHint 'small' when (1 - relative size) + smallDyW * (lowering) exceeds this
    smallDyW: 1.5,
    margin: 0.02, // best vs best-other-shape distance gap needed for 'confident'
    marginRatio: 0.12, // ...or relative gap
    marginCross: 0.06, // gap needed when the runner-up is a lookalike from the other script
    marginKanji: 0.04, // gap needed when the best is a kanji (tuned on dev-strong + half of the
    marginRatioKanji: 0.25, // Tomoe kanji the game does not use; see docs/RECOGNITION.md)
    // Outside the allowed set (see docs/RECOGNITION.md "Kanji outside the pad's set"):
    kanjiHintMax: 0.16, // kanji off: a supported kanji must match at least this well to be named...
    kanjiHintGap: 0.04, // ...and beat every allowed character by this much
    kanjiLikeStrokes: 5, // kanji-like: at least this many strokes (a kana has at most 6),
    kanjiLikeStraight: 0.6, // mostly straight strokes (mean chord / length; scribbles are ~0.15),
    // and nothing allowed matches well: rejected (no-match / too many strokes), or the best
    // match is above kanjiLikeWeak — kanjiLikeWeakKana when the best is a kana with no
    // more than one stroke fewer than drawn (a sloppy ボ or ぎ must not be taken for a kanji)
    kanjiLikeWeak: 0.2,
    kanjiLikeWeakKana: 0.27,
    // Kanji at scale (every kanji the game displays; see docs/RECOGNITION.md "At scale"):
    coarseGrid: 6, // coarse directional feature: G x G cells x 4 orientations
    coarseKeep: 100, // kanji kept by the coarse pre-filter for the chamfer stage
    coarseStrokeW: 1.2, // weight of the stroke-count difference in the coarse rank
    kanjiShortlist: 20, // kanji passed from the chamfer stage to the structured match...
    coarseBlend: 0.05, // ...ranked by chamfer + this x coarse distance
    kanjiJoins: 4, // at most this many joined stroke pairs tried for a kanji (greedy)
    hintKeep: 30, // kanji hint (kanji off): only a close kanji can be named, so fewer are checked
  };

  // ------------------------------------------------------------ tables
  const SMALL_PAIRS = 'あぁいぃうぅえぇおぉつっやゃゆゅよょわゎアァイィウゥエェオォツッヤャユュヨョワヮ';
  const SMALL_OF = {}; // large -> small
  const LARGE_OF = {}; // small -> large
  for (let i = 0; i < SMALL_PAIRS.length; i += 2) {
    SMALL_OF[SMALL_PAIRS[i]] = SMALL_PAIRS[i + 1];
    LARGE_OF[SMALL_PAIRS[i + 1]] = SMALL_PAIRS[i];
  }
  // Pairs whose standard written shapes are the same (verified against the
  // templates by tests/unit/recog.test.mjs). Kanji members only apply when
  // kanji are enabled. The kana/kanji pairs are every pair whose clean
  // KanjiVG templates read each other within 0.09 (ー/一 0.02, ニ/二 0.03,
  // エ/工 0.03, ロ/口 0.04, チ/千 0.06, カ/力 0.07, タ/夕 0.08, オ/才 0.09); the
  // next closest, ナ/十 and ハ/八 (0.11-0.12), stay two shapes
  // (tests/unit/recog-coverage.test.mjs re-measures this).
  const SAME_SHAPE = [
    ['へ', 'ヘ'], ['べ', 'ベ'], ['ぺ', 'ペ'],
    ['ー', '一'], ['ロ', '口'], ['カ', '力'], ['ニ', '二'],
    ['エ', '工'], ['チ', '千'], ['タ', '夕'], ['オ', '才'],
  ];
  const SAME_OF = {};
  for (const g of SAME_SHAPE) for (const c of g) SAME_OF[c] = g;
  // kana/kanji twins (ー/一, ロ/口, カ/力, ニ/二): with kanji enabled both are
  // returned at the same distance, the kana form first (the pad reorders them
  // by the characters already written; see RB.pad).
  const TWIN_OF = {};
  for (const g of SAME_SHAPE) if (g.some((c) => scriptOf(c) === 'kanji')) for (const c of g) TWIN_OF[c] = g;

  // Legitimate handwriting variants (1-based KanjiVG stroke numbers), matched at
  // almost no extra cost. Any other pair of consecutive strokes written as one is
  // still tolerated, at a larger cost (joinGeneric), as is a pen lift inside a
  // stroke (inputJoin); base strokes are never joined to a ゛/゜.
  // join: those consecutive strokes are commonly written in one movement.
  // split: that stroke is commonly written as two, split at its first sharp corner.
  // Voiced forms inherit their base character's variants (ぎ from き, etc.), and
  // the two ゛ ticks written in one movement is a curated join for every voiced kana.
  const VARIANTS = {
    'き': [{ join: 3 }], // diagonal and lower curve joined (print style, 3 strokes)
    'さ': [{ join: 2 }], // diagonal and lower curve joined (print style, 2 strokes)
    'ふ': [{ join: 1 }, { join: 2 }], // top dot flowing into the middle curve / middle curve into the left dot
    'り': [{ join: 1 }], // り in one stroke
    'こ': [{ join: 1 }], // こ in one flowing stroke
    'い': [{ join: 1 }], // い in one flowing stroke
    'た': [{ join: 3 }], // the こ part of た in one stroke
    'に': [{ join: 2 }], // the こ part of に in one stroke
    'け': [{ join: 1 }], // left stroke flowing into the cross bar
    'ち': [{ join: 1 }], // bar flowing into the vertical/curve
    'そ': [{ split: 1 }], // そ with a separate top stroke (2 strokes; KanjiVG has 1)
  };

  // ------------------------------------------------------------ geometry helpers
  function scriptOf(ch) {
    const c = ch.codePointAt(0);
    if (ch === 'ー') return 'both';
    if (c >= 0x3041 && c <= 0x309f) return 'hira';
    if (c >= 0x30a0 && c <= 0x30ff) return 'kata';
    return 'kanji';
  }
  function baseOf(ch) {
    // が -> か, ぱ -> は, ヴ -> ウ (Unicode canonical decomposition)
    const n = ch.normalize ? ch.normalize('NFD') : ch;
    return n.length > 1 ? n[0] : ch;
  }

  function polyLen(pts) {
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return L;
  }

  // Resample a polyline ([x,y] pairs) to n points equally spaced along its length.
  function resample(pts, n) {
    const out = new Array(n);
    const L = polyLen(pts);
    if (pts.length === 1 || L < 1e-9) {
      for (let k = 0; k < n; k++) out[k] = [pts[0][0], pts[0][1]];
      return out;
    }
    const step = L / (n - 1);
    out[0] = [pts[0][0], pts[0][1]];
    let acc = 0, i = 1, px = pts[0][0], py = pts[0][1], k = 1;
    while (k < n - 1 && i < pts.length) {
      const target = k * step;
      const dx = pts[i][0] - px, dy = pts[i][1] - py;
      const seg = sqrt(dx * dx + dy * dy);
      if (acc + seg >= target && seg > 0) {
        const t = (target - acc) / seg;
        px += dx * t; py += dy * t; acc = target;
        out[k++] = [px, py];
      } else {
        acc += seg; px = pts[i][0]; py = pts[i][1]; i++;
      }
    }
    while (k < n) out[k++] = [pts[pts.length - 1][0], pts[pts.length - 1][1]];
    return out;
  }

  function bbox(strokes) {
    let x0 = INF, y0 = INF, x1 = -INF, y1 = -INF;
    for (const s of strokes) for (const p of s) {
      if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
      if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1];
    }
    return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
  }

  // Translate bbox centre to the origin and divide by the longest side.
  function normalize(strokes) {
    const b = bbox(strokes);
    const s = mmax(b.w, b.h, 1e-9);
    const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
    return strokes.map((st) => st.map((p) => [(p[0] - cx) / s, (p[1] - cy) / s]));
  }

  // Prepared stroke: resampled points + unit segment directions.
  function prepStroke(pts) {
    const M = P.M;
    const r = resample(pts, M);
    const p = new F64(2 * M);
    for (let k = 0; k < M; k++) { p[2 * k] = r[k][0]; p[2 * k + 1] = r[k][1]; }
    const u = new F64(2 * (M - 1));
    for (let k = 0; k < M - 1; k++) {
      const dx = p[2 * k + 2] - p[2 * k], dy = p[2 * k + 3] - p[2 * k + 1];
      const l = sqrt(dx * dx + dy * dy);
      if (l > 1e-9) { u[2 * k] = dx / l; u[2 * k + 1] = dy / l; }
    }
    const len = polyLen(pts);
    return { p, u, len, conf: mmin(1, len / 0.15), raw: pts };
  }

  function joinStrokes(list) {
    const out = [];
    for (const s of list) for (const q of s) out.push(q);
    return out;
  }

  // Index of the first sharp corner (turn > 60°) of a polyline, or -1.
  function firstCorner(pts) {
    const r = resample(pts, 48);
    for (let i = 2; i < r.length - 2; i++) {
      const ax = r[i][0] - r[i - 2][0], ay = r[i][1] - r[i - 2][1];
      const bx = r[i + 2][0] - r[i][0], by = r[i + 2][1] - r[i][1];
      const la = hypot(ax, ay), lb = hypot(bx, by);
      if (la < 1e-9 || lb < 1e-9) continue;
      if ((ax * bx + ay * by) / (la * lb) < 0.5) return { r, i };
    }
    return null;
  }

  // Orientation-aware point cloud (direction-free: orientation is taken mod 180°).
  function makeCloud(nstrokes) {
    const lens = nstrokes.map(polyLen);
    const L = lens.reduce((a, b) => a + b, 0) || 1;
    const xs = [], ys = [], ox = [], oy = [], w = [];
    nstrokes.forEach((s, si) => {
      const n = mmax(1, round((P.NC * lens[si]) / L));
      const r = n === 1 ? [s[floor(s.length / 2)]] : resample(s, n);
      const full = resample(s, mmax(2, n + 1));
      for (let k = 0; k < r.length; k++) {
        const a = full[mmin(k, full.length - 2)], b = full[mmin(k + 1, full.length - 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1], l = hypot(dx, dy);
        xs.push(r[k][0]); ys.push(r[k][1]);
        ox.push(l > 1e-9 ? dx / l : 0); oy.push(l > 1e-9 ? dy / l : 0);
        w.push(mmin(1, lens[si] / 0.15));
      }
    });
    return { n: xs.length, x: F64.from(xs), y: F64.from(ys), ox: F64.from(ox), oy: F64.from(oy), w: F64.from(w) };
  }

  function cloudDist(A, B) {
    const na = A.n, nb = B.n;
    const minB = new F64(nb).fill(INF);
    let sumA = 0;
    const g = P.cloudOri;
    for (let i = 0; i < na; i++) {
      const ax = A.x[i], ay = A.y[i], aox = A.ox[i], aoy = A.oy[i], aw = A.w[i];
      let best = INF;
      for (let j = 0; j < nb; j++) {
        const dx = ax - B.x[j], dy = ay - B.y[j];
        let d = sqrt(dx * dx + dy * dy);
        const cr = aox * B.oy[j] - aoy * B.ox[j];
        d += g * (cr < 0 ? -cr : cr) * (aw < B.w[j] ? aw : B.w[j]);
        if (d < best) best = d;
        if (d < minB[j]) minB[j] = d;
      }
      sumA += best;
    }
    let sumB = 0;
    for (let j = 0; j < nb; j++) sumB += minB[j];
    return 0.5 * (sumA / na + sumB / nb);
  }

  // Start- and direction-free cost for closed template loops: symmetric chamfer.
  function loopCost(a, b) {
    const M = P.M, ap = a.p, bp = b.p;
    let sa = 0, sb = 0;
    const mb = new F64(M).fill(INF);
    for (let i = 0; i < M; i++) {
      let best = INF;
      for (let j = 0; j < M; j++) {
        const dx = ap[2 * i] - bp[2 * j], dy = ap[2 * i + 1] - bp[2 * j + 1];
        const d = sqrt(dx * dx + dy * dy);
        if (d < best) best = d;
        if (d < mb[j]) mb[j] = d;
      }
      sa += best;
    }
    for (let j = 0; j < M; j++) sb += mb[j];
    // an open input stroke (e.g. both dakuten ticks written in one movement) is not a loop
    const gx = ap[0] - ap[2 * M - 2], gy = ap[1] - ap[2 * M - 1];
    const open = sqrt(gx * gx + gy * gy) / mmax(a.len, 0.02);
    const c = 0.5 * (sa + sb) / M + P.loopOpenPen * mmin(1, mmax(0, (open - 0.15) / 0.35));
    return [c, false, c, c];
  }

  // Cost of pairing input stroke a with template stroke b.
  // Returns [bestCost, reversed?, forwardCost, reversedCostWithoutPenalty]
  function pairCost(a, b, revPen) {
    if (b.closed) return loopCost(a, b);
    const M = P.M, ap = a.p, bp = b.p, au = a.u, bu = b.u;
    let pf = 0, pr = 0, df = 0, dr = 0;
    for (let k = 0; k < M; k++) {
      let dx = ap[2 * k] - bp[2 * k], dy = ap[2 * k + 1] - bp[2 * k + 1];
      pf += sqrt(dx * dx + dy * dy);
      const r = M - 1 - k;
      dx = ap[2 * r] - bp[2 * k]; dy = ap[2 * r + 1] - bp[2 * k + 1];
      pr += sqrt(dx * dx + dy * dy);
    }
    for (let k = 0; k < M - 1; k++) {
      const bx = bu[2 * k], by = bu[2 * k + 1];
      df += 1 - (au[2 * k] * bx + au[2 * k + 1] * by);
      const r = M - 2 - k;
      dr += 1 + (au[2 * r] * bx + au[2 * r + 1] * by);
    }
    const conf = a.conf < b.conf ? a.conf : b.conf;
    const f = pf / M + P.dirW * conf * (df / (2 * (M - 1)));
    const rr = pr / M + P.dirW * conf * (dr / (2 * (M - 1)));
    const rp = rr + revPen * conf;
    return rp < f ? [rp, true, f, rr] : [f, false, f, rr];
  }

  // Hungarian algorithm (square matrix, minimisation). Returns row->col array.
  // Work buffers are reused between calls (same arithmetic as fresh ones).
  let HB = { n: -1 };
  function hungarian(a, n) {
    if (HB.n < n + 1) HB = { n: n + 1, minv: new F64(n + 1), used: new U8(n + 1) };
    const u = new F64(n + 1), v = new F64(n + 1);
    const p = new I32(n + 1), way = new I32(n + 1);
    const minv = HB.minv, used = HB.used;
    for (let i = 1; i <= n; i++) {
      p[0] = i;
      let j0 = 0;
      for (let j = 0; j <= n; j++) { minv[j] = INF; used[j] = 0; }
      do {
        used[j0] = 1;
        const i0 = p[j0];
        let delta = INF, j1 = 0;
        for (let j = 1; j <= n; j++) {
          if (used[j]) continue;
          const cur = a[(i0 - 1) * n + (j - 1)] - u[i0] - v[j];
          if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
          if (minv[j] < delta) { delta = minv[j]; j1 = j; }
        }
        for (let j = 0; j <= n; j++) {
          if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta;
        }
        j0 = j1;
      } while (p[j0] !== 0);
      do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
    }
    const rowTo = new I32(n).fill(-1);
    for (let j = 1; j <= n; j++) if (p[j]) rowTo[p[j] - 1] = j - 1;
    return rowTo;
  }

  function unmatchedCost(s) {
    return P.unmatchedBase + P.unmatchedLen * mmin(s.len, 1.5);
  }

  // Optimal assignment of rows (input strokes) to cols (template strokes);
  // unpaired strokes on either side cost unmatchedCost. cols[].ord (template
  // stroke number) drives the stroke-order penalty.
  function assign(rows, cols, ctx, forbid) {
    const N = rows.length, K = cols.length, S = mmax(N, K);
    const a = new F64(S * S);
    const pc = new Array(N * K);
    for (let i = 0; i < N; i++) for (let j = 0; j < K; j++) {
      const c = ctx.cost(rows[i], cols[j]);
      pc[i * K + j] = c;
      a[i * S + j] = forbid && forbid(i, j) ? 1e6 : c[0];
    }
    for (let i = 0; i < N; i++) for (let j = K; j < S; j++) a[i * S + j] = unmatchedCost(rows[i]);
    for (let i = N; i < S; i++) for (let j = 0; j < K; j++) a[i * S + j] = unmatchedCost(cols[j]);
    const rowTo = hungarian(a, S);
    let sum = 0, inv = 0, pairs = 0, reversed = 0;
    const map = new Array(N).fill(-1);
    const matchedCols = new U8(K);
    for (let i = 0; i < N; i++) {
      const j = rowTo[i];
      if (j < K) {
        const c = pc[i * K + j];
        sum += c[0]; map[i] = j; matchedCols[j] = 1;
        if (c[1]) reversed++;
      } else sum += unmatchedCost(rows[i]);
    }
    for (let j = 0; j < K; j++) if (!matchedCols[j]) sum += unmatchedCost(cols[j]);
    // stroke-order inversions among matched pairs (input order vs template order)
    for (let i = 0; i < N; i++) {
      if (map[i] < 0) continue;
      for (let i2 = i + 1; i2 < N; i2++) {
        if (map[i2] < 0) continue;
        pairs++;
        if (cols[map[i2]].ord < cols[map[i]].ord) inv++;
      }
    }
    const order = pairs ? inv / pairs : 0;
    const dist = sum / S + ctx.orderPen * order;
    return { dist, map, order, reversed, pc, K, rows, cols };
  }

  // ------------------------------------------------------------ templates
  let T = null;
  let B64IDX = null;
  function b64idx() {
    if (B64IDX) return B64IDX;
    const A = RB.recogData.alphabet;
    B64IDX = {};
    for (let i = 0; i < A.length; i++) B64IDX[A[i]] = i;
    return B64IDX;
  }

  // Kana: every point is 3 characters encoding x*109+y.
  function decode(str) {
    const box = RB.recogData.box, idx = b64idx();
    return str.split(' ').map((s) => {
      const pts = [];
      for (let i = 0; i + 2 < s.length; i += 3) {
        const v = (idx[s[i]] << 12) | (idx[s[i + 1]] << 6) | idx[s[i + 2]];
        pts.push([floor(v / box), v % box]);
      }
      return pts;
    });
  }
  // Kanji: the first point as above, then 2 characters per step (dx+32, dy+32).
  function decodeDelta(str) {
    const box = RB.recogData.box, idx = b64idx();
    return str.split(' ').map((s) => {
      const v = (idx[s[0]] << 12) | (idx[s[1]] << 6) | idx[s[2]];
      let x = floor(v / box), y = v % box;
      const pts = [[x, y]];
      for (let i = 3; i + 1 < s.length; i += 2) {
        x += idx[s[i]] - 32; y += idx[s[i + 1]] - 32;
        pts.push([x, y]);
      }
      if (pts.length === 1) pts.push([x, y]);
      return pts;
    });
  }

  function turnsOf(nstrokes) {
    // sharp direction reversals on a coarse resampling (used by the nonsense filter)
    let turns = 0;
    for (const s of nstrokes) {
      const L = polyLen(s);
      const n = mmax(2, mmin(200, round(L / 0.04) + 1));
      if (L < 0.08) continue;
      const r = resample(s, n);
      for (let i = 1; i < r.length - 1; i++) {
        const ax = r[i][0] - r[i - 1][0], ay = r[i][1] - r[i - 1][1];
        const bx = r[i + 1][0] - r[i][0], by = r[i + 1][1] - r[i][1];
        const la = hypot(ax, ay), lb = hypot(bx, by);
        if (la > 1e-9 && lb > 1e-9 && (ax * bx + ay * by) / (la * lb) < -0.34) turns++;
      }
    }
    return turns;
  }

  function prepTemplateStrokes(nraw) {
    return nraw.map((s, i) => {
      const o = prepStroke(s);
      o.ord = i;
      // closed loop (the handakuten circle): start point and direction are arbitrary
      const a = s[0], b = s[s.length - 1];
      o.closed = o.len > 0.08 && hypot(a[0] - b[0], a[1] - b[1]) < 0.2 * o.len;
      return o;
    });
  }

  function build() {
    const data = RB.recogData;
    const byChar = {};
    const list = [];
    let maxK = 0;
    for (const ch of Object.keys(data.d)) {
      const raw = decode(data.d[ch]);
      const entry = { ch, script: scriptOf(ch), raw, small: !!LARGE_OF[ch] };
      byChar[ch] = entry;
      if (entry.small) continue; // small kana are matched through their large form
      const nraw = normalize(raw);
      finishEntry(entry, nraw);
      if (nraw.length > maxK) maxK = nraw.length;
      list.push(entry);
    }
    T = { byChar, list, maxK };
    return T;
  }
  function tables() { return T || build(); }

  // Variants (joins, splits), stroke-structured templates, the chamfer cloud,
  // size/position, ink and sharp turns of one template. Kana get this when the
  // tables are built; a kanji only when it first reaches the chamfer stage.
  function finishEntry(entry, nraw) {
    {
      const ch = entry.ch, raw = entry.raw, data = RB.recogData;
      const variants = [];
      const rules = VARIANTS[ch] || VARIANTS[baseOf(ch)] || [];
      const nfd = ch.normalize ? ch.normalize('NFD') : ch;
      const diacN = nfd.length > 1 ? (nfd.charCodeAt(1) === 0x309a ? 1 : 2) : 0; // ゜ is 1 stroke, ゛ is 2
      const joinPens = (K) => {
        const jp = new Array(mmax(0, K - 1)).fill(P.joinGeneric);
        if (diacN && K - diacN - 1 >= 0) jp[K - diacN - 1] = INF; // never join base and diacritic
        if (diacN === 2 && K >= 2) jp[K - 2] = P.joinCurated; // ゛ written in one movement
        return jp;
      };
      const joinPen = joinPens(nraw.length);
      for (const r of rules) if (r.join && r.join < nraw.length - diacN) joinPen[r.join - 1] = P.joinCurated;
      const mk = (strokesN, pen, tag, ordMap) => {
        const S = prepTemplateStrokes(strokesN);
        if (ordMap) S.forEach((s, i) => { s.ord = ordMap[i]; });
        const merged = [], merged3 = [];
        for (let j = 0; j + 1 < strokesN.length; j++) {
          const m = prepStroke(joinStrokes([strokesN[j], strokesN[j + 1]]));
          m.ord = S[j].ord; merged.push(m);
          if (j + 2 < strokesN.length) {
            const m3 = prepStroke(joinStrokes([strokesN[j], strokesN[j + 1], strokesN[j + 2]]));
            m3.ord = S[j].ord; merged3.push(m3);
          }
        }
        const jp = tag ? joinPens(strokesN.length) : joinPen;
        variants.push({ S, merged, merged3, pen, tag, joinPen: jp });
      };
      mk(nraw, 0, '');
      for (const r of rules) {
        if (!r.split) continue;
        const si = r.split - 1;
        const c = firstCorner(nraw[si]);
        if (!c) continue;
        const a = c.r.slice(0, c.i + 1), b = c.r.slice(c.i);
        const sp = nraw.slice(0, si).concat([a, b], nraw.slice(si + 1));
        const ordMap = sp.map((_, i) => (i <= si ? i : i - 1));
        mk(sp, P.splitVariant, 'split' + r.split, ordMap);
      }
      const bb = bbox(raw);
      entry.ext = mmax(bb.w, bb.h) / data.box; // standard box-relative size ...
      entry.cy = (bb.y0 + bb.y1) / 2 / data.box; // ... and vertical position
      entry.K = nraw.length;
      entry.variants = variants;
      entry.cloud = makeCloud(nraw);
      if (entry.ink == null) entry.ink = nraw.reduce((acc, s) => acc + polyLen(s), 0);
      if (entry.turns == null) entry.turns = turnsOf(nraw);
      entry.ready = true;
    }
  }

  // ------------------------------------------------------------ kanji tables
  // Every kanji the game displays (RB.recogData.k, generated from KanjiVG).
  // Decoded on first use; each template's structured form is built only when
  // it first reaches the chamfer stage (finishEntry), so a kana-only pad never
  // pays for them.
  let TK = null, KLIST = null;
  function kanjiChars() {
    if (KLIST) return KLIST;
    KLIST = (RB.recogData.k || []).map((line) => String.fromCodePoint(line.codePointAt(0)));
    return KLIST;
  }
  function kanjiTables() { return buildKanji(INF); }
  // Decodes up to `count` more kanji templates; returns the (possibly still
  // partial) tables. kanjiTables() finishes them; warm() spreads the work
  // over idle moments so the first kanji reading does not wait for it.
  function buildKanji(count) {
    const data = RB.recogData;
    const lines = data.k || [];
    if (!TK) TK = { byChar: {}, list: [], maxK: 0, maxInk: 0, maxTurns: 0, next: 0, done: false };
    const end = mmin(lines.length, TK.next + count);
    for (let i = TK.next; i < end; i++) {
      const line = lines[i];
      const ch = String.fromCodePoint(line.codePointAt(0));
      const raw = decodeDelta(line.slice(ch.length));
      const e = { ch, script: 'kanji', raw, small: false, idx: i, rad: data.rad ? data.rad[i] : null };
      const nraw = normalize(raw);
      e.nraw = nraw;
      e.K = nraw.length;
      e.ink = nraw.reduce((acc, s) => acc + polyLen(s), 0);
      e.turns = turnsOf(nraw);
      e.feat = coarseFeat(nraw);
      const bb = bbox(raw);
      e.ext = mmax(bb.w, bb.h) / data.box;
      e.cy = (bb.y0 + bb.y1) / 2 / data.box;
      if (e.K > TK.maxK) TK.maxK = e.K;
      if (e.ink > TK.maxInk) TK.maxInk = e.ink;
      if (e.turns > TK.maxTurns) TK.maxTurns = e.turns;
      TK.byChar[ch] = e;
      TK.list.push(e);
    }
    TK.next = end;
    TK.done = end >= lines.length;
    return TK;
  }
  // Prepare the kanji templates in small slices (a pad that reads kanji calls
  // this when it opens). Safe to call more than once; `done` runs at the end.
  let warming = false;
  function warm(done) {
    tables();
    if ((TK && TK.done) || warming) { if (done) setTimeout(done, 0); return; }
    warming = true;
    const step = () => {
      buildKanji(120);
      if (TK.done) { warming = false; if (done) done(); } else setTimeout(step, 0);
    };
    setTimeout(step, 0);
  }
  function ready(e) {
    if (!e.ready) finishEntry(e, e.nraw);
    return e;
  }
  // Any template by character (kana, or a kanji: decoded on demand).
  function entryOf(ch) {
    const t = tables();
    if (t.byChar[ch]) return t.byChar[ch];
    if (!ch || scriptOf(ch) !== 'kanji' || kanjiChars().indexOf(ch) < 0) return null;
    return kanjiTables().byChar[ch] || null;
  }

  // Coarse directional feature (kanji pre-filter): ink length per cell of a
  // G x G grid over the normalised square, split into 4 orientations (mod
  // 180°, so stroke direction and order do not matter), with bilinear spread
  // across cells and orientations; normalised to sum 1, square-rooted
  // (Hellinger), compared with L1. Cheap enough to rank all kanji per call.
  function coarseFeat(nstrokes) {
    const G = P.coarseGrid, f = new F64(G * G * 4);
    const STEP = 0.05;
    let total = 0;
    for (const s of nstrokes) {
      // walk the stroke in ~0.05 steps: directions over such steps are not
      // thrown about by the jitter of a drawn line
      const L0 = polyLen(s);
      if (L0 < 1e-9) continue;
      const n = mmax(1, round(L0 / STEP)), step = L0 / n;
      let px = s[0][0], py = s[0][1], qx = px, qy = py, i = 1;
      for (let k = 0; k < n; k++) {
        // the point one step further along the stroke
        let need = step;
        while (i < s.length) {
          const tx = s[i][0] - qx, ty = s[i][1] - qy, tl = sqrt(tx * tx + ty * ty);
          if (tl >= need) { qx += (tx / tl) * need; qy += (ty / tl) * need; break; }
          need -= tl; qx = s[i][0]; qy = s[i][1]; i++;
        }
        const dx = qx - px, dy = qy - py, L = sqrt(dx * dx + dy * dy);
        if (L > 1e-9) {
          let ang = atan2(dy, dx);
          if (ang < 0) ang += PI;
          let o = (ang / PI) * 4;
          if (o >= 4) o = 0;
          const io = floor(o), fo = o - io, o0 = io & 3, o1 = (io + 1) & 3;
          const gx = ((px + qx) / 2 + 0.5) * G - 0.5, gy = ((py + qy) / 2 + 0.5) * G - 0.5;
          const ix = floor(gx), iy = floor(gy), fx = gx - ix, fy = gy - iy;
          for (let a = 0; a < 2; a++) {
            const cx = ix + a;
            if (cx < 0 || cx >= G) continue;
            const wx = (a ? fx : 1 - fx) * L;
            for (let b = 0; b < 2; b++) {
              const cy = iy + b;
              if (cy < 0 || cy >= G) continue;
              const w = wx * (b ? fy : 1 - fy), base = (cy * G + cx) * 4;
              f[base + o0] += w * (1 - fo);
              f[base + o1] += w * fo;
            }
          }
          total += L;
        }
        px = qx; py = qy;
      }
    }
    if (total > 1e-9) for (let i = 0; i < f.length; i++) f[i] = sqrt(f[i] / total);
    return f;
  }
  function coarseDist(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d < 0 ? -d : d; }
    return s;
  }
  // The kanji worth a closer look for this drawing: coarse distance plus a
  // stroke-count term (joins and pen lifts are tolerated, so it is soft),
  // best P.coarseKeep. `filter(e)` may exclude templates.
  function kanjiShortlist(inp, keep, filter) {
    const K = kanjiTables();
    if (!inp.feat) inp.feat = coarseFeat(inp.nraw);
    const N = inp.S.length;
    const out = [];
    for (const e of K.list) {
      if (filter && !filter(e)) continue;
      const dk = e.K - N;
      // more drawn strokes than the template has, or far fewer: costly in the
      // structured match anyway (unpaired strokes), so ranked down here
      const sc = coarseDist(inp.feat, e.feat) + P.coarseStrokeW * (dk > 0 ? dk * 0.5 : -dk) / mmax(N, e.K);
      out.push({ e, sc });
    }
    out.sort((a, b) => a.sc - b.sc);
    return out.slice(0, keep);
  }

  function allowedSet(opts) {
    const script = (opts && opts.script) || 'any';
    const kanji = script === 'kanji' || !!(opts && opts.kanji);
    return (e) => {
      if (e.script === 'kanji') return kanji;
      if (script === 'kanji') return false;
      if (script === 'any' || e.script === 'both') return true;
      return e.script === script;
    };
  }

  // ------------------------------------------------------------ input preparation
  function cleanStrokes(strokes) {
    const out = [];
    if (!Array.isArray(strokes)) return out;
    for (const st of strokes) {
      if (!Array.isArray(st)) continue;
      const s = [];
      for (const p of st) {
        if (!p) continue;
        const x = Array.isArray(p) ? p[0] : p.x, y = Array.isArray(p) ? p[1] : p.y;
        if (typeof x !== 'number' || typeof y !== 'number' || !isFinite(x) || !isFinite(y)) continue;
        const last = s[s.length - 1];
        if (!last || last[0] !== x || last[1] !== y) s.push([x, y]);
      }
      if (s.length) out.push(s);
    }
    return out;
  }

  function prepInput(clean) {
    return prepInputN(normalize(clean));
  }
  function prepInputN(nraw) {
    const S = nraw.map((s, i) => { const o = prepStroke(s); o.ord = i; return o; });
    const joins = [];
    for (let i = 0; i + 1 < nraw.length; i++) {
      const a = nraw[i][nraw[i].length - 1], b = nraw[i + 1][0];
      if (hypot(a[0] - b[0], a[1] - b[1]) <= P.inputJoinGap) {
        const m = prepStroke(joinStrokes([nraw[i], nraw[i + 1]]));
        m.ord = i;
        joins.push({ i, m });
      }
    }
    return { nraw, S, joins, cloud: makeCloud(nraw), ink: nraw.reduce((a, s) => a + polyLen(s), 0), turns: turnsOf(nraw) };
  }

  // ------------------------------------------------------------ structured match
  function matchEntry(inp, entry, ctx) {
    if (entry.script === 'kanji' && entry.idx != null) return matchKanji(inp, ready(entry), ctx);
    let best = null;
    const N = inp.S.length;
    const consider = (res, pen, tag) => {
      res.dist += pen;
      res.tag = tag;
      if (!best || res.dist < best.dist) best = res;
    };
    for (const v of entry.variants) {
      const K = v.S.length;
      consider(assign(inp.S, v.S, ctx), v.pen, v.tag);
      if (N < K) {
        // template strokes written joined
        for (let j = 0; j < v.merged.length; j++) {
          if (v.joinPen[j] >= INF) continue;
          const cols = v.S.slice(0, j).concat([v.merged[j]], v.S.slice(j + 2));
          consider(assign(inp.S, cols, ctx), v.pen + v.joinPen[j], (v.tag ? v.tag + '+' : '') + 'join' + (j + 1));
        }
        if (K - N >= 2) {
          for (let j1 = 0; j1 < v.merged.length; j1++) {
            for (let j2 = j1 + 2; j2 < v.merged.length; j2++) {
              if (v.joinPen[j1] >= INF || v.joinPen[j2] >= INF) continue;
              const cols = v.S.slice(0, j1).concat([v.merged[j1]], v.S.slice(j1 + 2, j2), [v.merged[j2]], v.S.slice(j2 + 2));
              consider(assign(inp.S, cols, ctx), v.pen + v.joinPen[j1] + v.joinPen[j2], 'join' + (j1 + 1) + ',' + (j2 + 1));
            }
          }
          for (let j = 0; j < v.merged3.length; j++) {
            if (v.joinPen[j] >= INF || v.joinPen[j + 1] >= INF) continue;
            const cols = v.S.slice(0, j).concat([v.merged3[j]], v.S.slice(j + 3));
            consider(assign(inp.S, cols, ctx), v.pen + v.joinPen[j] + v.joinPen[j + 1], 'join3-' + (j + 1));
          }
        }
      } else if (N > K && inp.joins.length) {
        // pen lifted inside one stroke
        for (const jn of inp.joins) {
          const rows = inp.S.slice(0, jn.i).concat([jn.m], inp.S.slice(jn.i + 2));
          consider(assign(rows, v.S, ctx), v.pen + P.inputJoin, 'penlift' + (jn.i + 1));
        }
      }
    }
    return best;
  }

  // Least-squares per-axis scale + translation (no rotation, no reflection,
  // bounded) mapping the paired input strokes onto the template strokes, then
  // a re-match. Absorbs proportion differences of an individual's writing.
  function refine(inp, sc, ctx) {
    const m = sc.m, M = P.M;
    let n = 0, sax = 0, sbx = 0, say = 0, sby = 0, saxx = 0, sayy = 0, saxbx = 0, sayby = 0;
    for (let i = 0; i < m.map.length; i++) {
      const j = m.map[i];
      if (j < 0) continue;
      const a = m.rows[i].p, b = m.cols[j].p, rev = m.pc[i * m.K + j][1] && !m.cols[j].closed;
      if (m.cols[j].closed) continue;
      for (let k = 0; k < M; k++) {
        const ka = rev ? M - 1 - k : k;
        const ax = a[2 * ka], ay = a[2 * ka + 1], bx = b[2 * k], by = b[2 * k + 1];
        n++; sax += ax; say += ay; sbx += bx; sby += by;
        saxx += ax * ax; sayy += ay * ay; saxbx += ax * bx; sayby += ay * by;
      }
    }
    if (n < 2 * M) return null;
    const fit = (sa, sb, saa, sab) => {
      const ma = sa / n, mb = sb / n, va = saa / n - ma * ma, cv = sab / n - ma * mb;
      let sc2 = va > 1e-4 ? cv / va : 1;
      sc2 = mmin(P.refineScale, mmax(1 / P.refineScale, sc2));
      let t = mb - sc2 * ma;
      t = mmin(P.refineShift, mmax(-P.refineShift, t));
      return [sc2, t];
    };
    const [sx, tx] = fit(sax, sbx, saxx, saxbx);
    const [sy, ty] = fit(say, sby, sayy, sayby);
    if (mabs(sx - 1) < 0.02 && mabs(sy - 1) < 0.02 && mabs(tx) < 0.01 && mabs(ty) < 0.01) return null;
    const nraw = inp.nraw.map((st) => st.map((p) => [p[0] * sx + tx, p[1] * sy + ty]));
    const inp2 = prepInputN(nraw);
    const m2 = matchEntry(inp2, sc.e, ctx);
    const cd2 = cloudDist(inp2.cloud, sc.e.cloud);
    const cost = P.refineCost * (mabs(mlog(sx)) + mabs(mlog(sy)) + mabs(tx) + mabs(ty));
    return { e: sc.e, cd: cd2, m: m2, dist: m2.dist + P.cloudW * cd2 + cost, refined: true };
  }

  // Stroke-pair costs are memoised per input stroke for the call: the join
  // alternatives of a template reuse the same pairs many times. The values are
  // exactly those of pairCost, so results do not change.
  function makeCtx(strict) {
    const rp = strict ? P.revPenStrict : P.revPen;
    const ctx = { orderPen: strict ? P.orderPenStrict : P.orderPen };
    ctx.cost = (a, b) => {
      let m = a.memo;
      if (!m || a.memoCtx !== ctx) { m = a.memo = new Map(); a.memoCtx = ctx; }
      let c = m.get(b);
      if (c === undefined) { c = pairCost(a, b, rp); m.set(b, c); }
      return c;
    };
    return ctx;
  }

  // Structured match for a kanji template. Kanji have no curated variants;
  // strokes written joined are tried greedily: the best single join, then the
  // best further join (or a three-stroke join) on top of it, up to
  // P.kanjiJoins, each at the generic join cost. A pen lift inside one stroke
  // is tried as for kana.
  function matchKanji(inp, entry, ctx) {
    const v = entry.variants[0];
    const N = inp.S.length, K = v.S.length;
    let best = assign(inp.S, v.S, ctx);
    best.tag = '';
    if (N < K) {
      // groups: [start, length] over the template strokes, in order
      let groups = [];
      for (let j = 0; j < K; j++) groups.push([j, 1]);
      const colOf = (g) => (g[1] === 1 ? v.S[g[0]] : g[1] === 2 ? v.merged[g[0]] : v.merged3[g[0]]);
      const steps = mmin(K - N, P.kanjiJoins);
      let cur = best;
      for (let step = 1; step <= steps; step++) {
        let stepBest = null, stepGroups = null;
        // only joins next to a column the current assignment leaves unpaired
        const near = new U8(groups.length);
        const paired = new U8(groups.length);
        for (const j of cur.map) if (j >= 0) paired[j] = 1;
        for (let gi = 0; gi < groups.length; gi++) if (!paired[gi]) { near[gi] = 1; if (gi) near[gi - 1] = 1; }
        for (let gi = 0; gi + 1 < groups.length; gi++) {
          if (!near[gi]) continue;
          const a = groups[gi], b = groups[gi + 1];
          const len = a[1] + b[1];
          if (len > 3) continue;
          const ng = groups.slice(0, gi).concat([[a[0], len]], groups.slice(gi + 2));
          const res = assign(inp.S, ng.map(colOf), ctx);
          res.dist += P.joinGeneric * step;
          if (!stepBest || res.dist < stepBest.dist) { stepBest = res; stepGroups = ng; }
        }
        if (!stepBest) break;
        stepBest.tag = 'join×' + step;
        if (stepBest.dist < best.dist) best = stepBest;
        groups = stepGroups;
        cur = stepBest;
      }
    } else if (N > K && inp.joins.length) {
      for (const jn of inp.joins) {
        const rows = inp.S.slice(0, jn.i).concat([jn.m], inp.S.slice(jn.i + 2));
        const res = assign(rows, v.S, ctx);
        res.dist += P.inputJoin;
        res.tag = 'penlift' + (jn.i + 1);
        if (res.dist < best.dist) best = res;
      }
    }
    return best;
  }

  // ------------------------------------------------------------ public API
  function supported(opts) {
    const t = tables();
    const kanji = !!(opts && opts.kanji);
    const kana = Object.keys(t.byChar);
    return kanji ? kana.concat(kanjiChars()) : kana;
  }
  // Is this character one the recognizer can read (kanji only with kanji on)?
  function knows(ch, opts) {
    if (!ch) return false;
    if (tables().byChar[ch]) return true;
    return !!(opts && opts.kanji) && kanjiChars().indexOf(ch) >= 0;
  }

  function reference(ch) {
    const e = entryOf(ch);
    if (!e) return null;
    return { box: RB.recogData.box, strokes: e.raw.map((s) => s.map((p) => ({ x: p[0], y: p[1] }))) };
  }
  // KanjiVG's radical for a supported kanji (氵 as 水), or null.
  function radical(ch) {
    const i = scriptOf(ch || 'あ') === 'kanji' ? kanjiChars().indexOf(ch) : -1;
    const r = i >= 0 && RB.recogData.rad ? RB.recogData.rad[i] : null;
    return r && r !== '・' ? r : null;
  }
  // Number of strokes of a supported character (KanjiVG), or 0.
  function strokeCount(ch) {
    if (tables().byChar[ch]) return tables().byChar[ch].raw.length;
    const i = kanjiChars().indexOf(ch);
    if (i < 0) return 0;
    return RB.recogData.k[i].slice(ch.length).split(' ').length;
  }

  // Box-relative size/position, judged against the standard proportions of the
  // recognised shape (its large form in KanjiVG): KanjiVG's small kana are ~0.8x
  // the size of the large form and sit ~0.1 box lower; handwritten small kana are
  // usually smaller still. rel < 1 means smaller than standard, dy > 0 lower.
  function sizeHintOf(clean, box, entry) {
    if (!box || !(box.w > 0) || !(box.h > 0) || !entry) return null;
    const b = bbox(clean);
    const ext = mmax(b.w, b.h) / mmin(box.w, box.h);
    const cy = (b.y0 + b.y1) / 2 / box.h;
    const rel = ext / entry.ext, dy = cy - entry.cy;
    return 1 - rel + P.smallDyW * dy > P.smallZ ? 'small' : 'normal';
  }

  function nonsenseCheck(clean, inp, box, t, allowed, kanjiOn) {
    const b = bbox(clean);
    const ext = mmax(b.w, b.h);
    const side = box && box.w > 0 && box.h > 0 ? mmin(box.w, box.h) : 0;
    if (side ? ext < 0.06 * side : ext < 4) return 'dot';
    let maxK = 0, maxInk = 0, maxTurns = 0;
    for (const e of t.list) {
      if (!allowed(e)) continue;
      if (e.K > maxK) maxK = e.K;
      if (e.ink > maxInk) maxInk = e.ink;
      if (e.turns > maxTurns) maxTurns = e.turns;
    }
    if (kanjiOn) {
      const K = kanjiTables();
      maxK = mmax(maxK, K.maxK); maxInk = mmax(maxInk, K.maxInk); maxTurns = mmax(maxTurns, K.maxTurns);
    }
    if (clean.length > maxK + 3) return 'too-many-strokes';
    if (inp.ink > maxInk * 1.6) return 'dense-ink';
    if (inp.turns > maxTurns + 5) return 'zigzag';
    return null;
  }

  // Mean straightness of the drawn strokes: chord / path length (1 = a straight
  // line). Kanji strokes are mostly straight; wandering scribbles are not.
  function straightness(clean) {
    let s = 0;
    for (const st of clean) {
      const L = polyLen(st), a = st[0], b = st[st.length - 1];
      s += L > 1e-9 ? hypot(b[0] - a[0], b[1] - a[1]) / L : 1;
    }
    return clean.length ? s / clean.length : 0;
  }

  // The best supported kanji for this drawing, used only when kanji are not in
  // the allowed set: the same match on the kanji templates alone (the coarse
  // pre-filter's best P.hintKeep, a chamfer shortlist of 6, structured match,
  // refinement of the leading 3).
  // `limit`: only a kanji closer than this is of interest; templates whose
  // chamfer term alone (with a margin for the refinement) exceeds it are skipped.
  function bestKanji(inp, t, ctx, limit) {
    const pool = [];
    for (const { e, sc } of kanjiShortlist(inp, P.hintKeep)) {
      const cd = cloudDist(inp.cloud, ready(e).cloud);
      if (P.cloudW * cd <= limit + 0.02) pool.push({ e, cd, sc });
    }
    if (!pool.length) return null;
    pool.sort((a, b) => (a.cd + P.coarseBlend * a.sc) - (b.cd + P.coarseBlend * b.sc));
    const sc = pool.slice(0, 6).map(({ e, cd }) => { const m = matchEntry(inp, e, ctx); return { e, cd, m, dist: m.dist + P.cloudW * cd }; });
    sc.sort((a, b) => a.dist - b.dist);
    for (let k = 0; k < mmin(3, sc.length); k++) {
      if (sc[k].dist > limit + 0.06) break;
      const r = refine(inp, sc[k], ctx);
      if (r && r.dist < sc[k].dist) sc[k] = r;
    }
    sc.sort((a, b) => a.dist - b.dist);
    return sc[0];
  }

  function recognize(strokes, opts) {
    opts = opts || {};
    const t = tables();
    const clean = cleanStrokes(strokes);
    const result = { status: 'empty', candidates: [], sizeHint: null, notes: [], kanjiHint: null, kanjiLike: false };
    if (!clean.length) return result;
    const allowed = allowedSet(opts);
    const kanjiOn = (opts.script || 'any') === 'kanji' || !!opts.kanji;
    const inp = prepInput(clean);
    const ctx = makeCtx(opts.mode === 'strict');
    // Is the drawing outside the allowed set? (a) kanji off, and a supported
    // kanji matches clearly better than anything allowed: name it (kanjiHint);
    // (b) otherwise, kanji-like (several mostly straight strokes) while nothing
    // allowed matches well: say so (kanjiLike). Both use the drawing only.
    const outside = (bestDist, bestCh, rejected) => {
      if (rejected && rejected !== 'no-match' && rejected !== 'too-many-strokes') return;
      const limit = mmin(P.kanjiHintMax, bestDist - P.kanjiHintGap);
      if (!kanjiOn && rejected !== 'too-many-strokes' && limit > 0) {
        const k = bestKanji(inp, t, ctx, limit);
        const twin = k && bestCh && TWIN_OF[k.e.ch] && TWIN_OF[k.e.ch].includes(bestCh);
        if (k && !twin && k.dist <= P.kanjiHintMax && k.dist + P.kanjiHintGap <= bestDist) {
          result.kanjiHint = { ch: k.e.ch, dist: +k.dist.toFixed(4) };
          result.notes.push('kanji-hint: ' + k.e.ch);
          return;
        }
      }
      const e = bestCh ? entryOf(bestCh) : null;
      const kanaLike = e && (e.script !== 'kanji' || TWIN_OF[bestCh]) && clean.length < e.K + 2;
      const weak = rejected || bestDist > (kanaLike ? P.kanjiLikeWeakKana : P.kanjiLikeWeak);
      if (clean.length >= P.kanjiLikeStrokes && weak && straightness(clean) >= P.kanjiLikeStraight) {
        result.kanjiLike = true;
        result.sizeHint = null;
        result.notes.push('kanji-like');
      }
    };
    const bad = nonsenseCheck(clean, inp, opts.box, t, allowed, kanjiOn);
    if (bad) {
      result.status = 'nonsense';
      result.notes.push('nonsense: ' + bad);
      outside(INF, null, bad);
      return result;
    }
    // 1) chamfer pre-filter (kanji: the coarse directional pre-filter first)
    // kana: the best P.shortlist by chamfer distance (as ever); kanji: the
    // coarse pre-filter's best P.coarseKeep, then the best P.kanjiShortlist
    // by chamfer + coarse (among many similar kanji the coarse feature ranks
    // the right one better than the chamfer alone)
    const pool = [];
    for (const e of t.list) if (allowed(e)) pool.push({ e, cd: cloudDist(inp.cloud, e.cloud) });
    pool.sort((a, b) => a.cd - b.cd);
    const short = pool.slice(0, P.shortlist);
    if (kanjiOn) {
      const kpool = kanjiShortlist(inp, P.coarseKeep).map(({ e, sc }) => ({ e, sc, cd: cloudDist(inp.cloud, ready(e).cloud) }));
      kpool.sort((a, b) => (a.cd + P.coarseBlend * a.sc) - (b.cd + P.coarseBlend * b.sc));
      for (const k of kpool.slice(0, P.kanjiShortlist)) short.push({ e: k.e, cd: k.cd });
    }
    // 2) structured match
    const scored = short.map(({ e, cd }) => {
      const m = matchEntry(inp, e, ctx);
      return { e, cd, m, dist: m.dist + P.cloudW * cd };
    });
    scored.sort((a, b) => a.dist - b.dist);
    // 3) bounded alignment refinement of the leading candidates
    for (let k = 0; k < mmin(P.refineTop, scored.length); k++) {
      const r = refine(inp, scored[k], ctx);
      if (r && r.dist < scored[k].dist) scored[k] = r;
    }
    scored.sort((a, b) => a.dist - b.dist);
    // size is judged against the kana form of a kana/kanji twin (エ/工: small ェ)
    const e0 = scored.length ? scored[0].e : null;
    const kanaTwin = e0 && e0.script === 'kanji' && TWIN_OF[e0.ch] ? TWIN_OF[e0.ch].find((c) => scriptOf(c) !== 'kanji') : null;
    result.sizeHint = e0 ? sizeHintOf(clean, opts.box, (kanaTwin && t.byChar[kanaTwin]) || e0) : null;
    // 4) candidates with small/large expansion and script filter
    const script = opts.script || 'any';
    // explicit toggle wins; otherwise box-relative size decides; default is the large form
    const preferSmall = opts.smallToggle === true || result.sizeHint === 'small';
    const cands = [];
    const seen = new Set();
    const push = (ch, dist, extra) => {
      if (seen.has(ch) || cands.length >= 6) return;
      seen.add(ch);
      cands.push({ ch, score: +mexp(-dist / P.scoreScale).toFixed(3), dist: +dist.toFixed(4), ...extra });
    };
    const pushChar = (ch, dist) => {
      const sm = SMALL_OF[ch];
      const smOk = sm && t.byChar[sm] && (script === 'any' || scriptOf(sm) === script);
      if (sm && smOk && preferSmall) {
        push(sm, dist);
        push(ch, dist + 0.004);
      } else {
        push(ch, dist);
        if (sm && smOk) push(sm, dist + 0.004);
      }
    };
    const byCh = {};
    for (const s of scored) if (!byCh[s.e.ch]) byCh[s.e.ch] = s;
    for (const s of scored) {
      const ch = s.e.ch;
      // kana/kanji twins: one shape, so one distance, kana form first
      const tw = TWIN_OF[ch] && TWIN_OF[ch].filter((c) => byCh[c]);
      if (tw && tw.length > 1) {
        const d = mmin(...tw.map((c) => byCh[c].dist));
        // the other character of the same shape comes before a small form (オ 才 ォ)
        if (!preferSmall) for (const c of tw) push(c, d);
        for (const c of tw) pushChar(c, d);
      } else pushChar(ch, s.dist);
      if (cands.length >= 6) break;
    }
    // keep order consistent with scores
    result.candidates = cands.map((c) => ({ ch: c.ch, score: c.score, dist: c.dist }));
    const best = scored[0];
    if (!best) { result.status = 'nonsense'; result.notes.push('nonsense: no-templates'); return result; }
    const bestCh = best.e.ch;
    // competitor: best-scoring template of a different shape
    const sameGroup = new Set([bestCh]);
    if (SAME_OF[bestCh]) for (const c of SAME_OF[bestCh]) sameGroup.add(c);
    const other = scored.find((s) => !sameGroup.has(s.e.ch));
    // notes
    const shown = new Set(result.candidates.map((c) => c.ch));
    for (const g of SAME_SHAPE) {
      if (g.every((c) => shown.has(c)) && g.includes(bestCh)) result.notes.push('identical-shape: ' + g.join('/'));
    }
    const top = result.candidates[0] && result.candidates[0].ch;
    const lg = LARGE_OF[top] || top;
    if (SMALL_OF[lg] && shown.has(lg) && shown.has(SMALL_OF[lg])) {
      result.notes.push('size-variant: ' + lg + '/' + SMALL_OF[lg] +
        (opts.smallToggle ? ' (small toggle on)' : result.sizeHint ? ' (by size: ' + result.sizeHint + ')' : ' (no size info)'));
    }
    if (best.m.reversed) result.notes.push('reversed-strokes: ' + best.m.reversed);
    if (best.m.tag) result.notes.push('variant: ' + best.m.tag);
    // status
    if (best.dist > P.nonsenseMin) {
      result.status = 'nonsense';
      result.notes.push('nonsense: no-match');
      result.candidates = [];
      outside(best.dist, bestCh, 'no-match');
      return result;
    }
    const gap = other ? other.dist - best.dist : INF;
    // hiragana/katakana lookalikes (り/リ, も/モ, や/ヤ...) need a wider margin in a mixed pad
    const cross = other && best.e.script !== other.e.script && best.e.script !== 'both' && other.e.script !== 'both';
    // a kanji among ~1,550 has many near neighbours: it needs a wider margin
    const kanjiBest = best.e.script === 'kanji' && !TWIN_OF[bestCh];
    const close = kanjiBest
      ? gap < P.marginKanji || gap < P.marginRatioKanji * best.dist
      : gap < (cross ? P.marginCross : P.margin) || gap < P.marginRatio * best.dist;
    const confMax = kanjiBest ? P.confidentMaxKanji : P.confidentMax;
    result.status = best.dist <= confMax && !close ? 'confident' : 'uncertain';
    if (close && other) result.notes.push('close-alternative: ' + other.e.ch);
    if (best.dist > confMax) result.notes.push('weak-match');
    outside(best.dist, bestCh, null);
    return result;
  }

  // ------------------------------------------------------------ stroke-order feedback (practice mode)
  // Plain-English description of a reference stroke's start/end (for feedback).
  function describeDir(s, all) {
    const b = bbox(all);
    const side = mmax(b.w, b.h, 1e-9), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
    const where = (p) => {
      const fx = (p[0] - cx) / side, fy = (p[1] - cy) / side;
      const v = fy < -0.17 ? 'top' : fy > 0.17 ? 'bottom' : '';
      const h = fx < -0.17 ? 'left' : fx > 0.17 ? 'right' : '';
      return v && h ? v + ' ' + h : v || h || 'centre';
    };
    const a = s[0], z = s[s.length - 1];
    const k = mmin(s.length - 1, mmax(1, floor(s.length / 5)));
    const dx = s[k][0] - a[0], dy = s[k][1] - a[1];
    const move = mabs(dx) > 2 * mabs(dy) ? (dx > 0 ? 'right' : 'left') : mabs(dy) > 2 * mabs(dx) ? (dy > 0 ? 'down' : 'up') :
      (dy > 0 ? 'down' : 'up') + ' and ' + (dx > 0 ? 'right' : 'left');
    const ws = where(a), we = where(z);
    return 'start at the ' + ws + ' moving ' + move + (we !== ws ? ' and finish at the ' + we : '');
  }

  function strokeOrderFeedback(strokes, ch, opts) {
    opts = opts || {};
    const t = tables();
    const out = { confident: false, strokeCountOk: false, issues: [] };
    const entry0 = entryOf(ch);
    if (!entry0) return out;
    const clean = cleanStrokes(strokes);
    if (!clean.length) return out;
    // Compare against the real reference strokes of this exact character.
    const ref = normalize(entry0.raw);
    const R = prepTemplateStrokes(ref);
    const inp = prepInput(clean);
    const N = inp.S.length, K = R.length;
    out.strokeCountOk = N === K;
    const ctx = { cost: (a, b) => pairCost(a, b, 0), orderPen: 0 };
    const PAIR_OK = 0.2; // each paired stroke must actually resemble its reference stroke
    const MARGIN = 0.03; // optimal assignment must beat any alternative by this much
    const pairsOk = (res) => res.map.every((j, i) => j >= 0 && res.pc[i * res.K + j][0] < PAIR_OK);
    // second-best assignment: forbid each matched pair in turn
    const secondBest = (rows, cols, res) => {
      let sb = INF;
      res.map.forEach((j, i) => {
        if (j < 0) return;
        const alt = assign(rows, cols, ctx, (a, b) => a === i && b === j);
        if (alt.dist < sb) sb = alt.dist;
      });
      return sb;
    };
    if (N === K) {
      const res = assign(inp.S, R, ctx);
      if (!pairsOk(res)) return out;
      if (K > 1 && secondBest(inp.S, R, res) - res.dist < MARGIN / K) return out;
      out.confident = true;
      out.mapping = res.map.slice();
      res.map.forEach((j, i) => {
        if (j !== i) {
          out.issues.push({ stroke: i, kind: 'order', expected: j, en: 'Your stroke ' + (i + 1) + ' is stroke ' + (j + 1) + ' in the standard order.' });
        }
      });
      res.map.forEach((j, i) => {
        const c = res.pc[i * res.K + j];
        const a = inp.S[i];
        // reversed clearly fits better and the stroke is long enough for direction to be meaningful
        if (a.conf >= 0.8 && c[3] + 0.04 < c[2]) {
          out.issues.push({ stroke: i, kind: 'direction', expected: j, en: 'Stroke ' + (i + 1) + ' is drawn in reverse: ' + describeDir(entry0.raw[j], entry0.raw) + '.' });
        }
      });
      return out;
    }
    // Count mismatch: only explain it when exactly one join/split accounts for it unambiguously.
    const options = [];
    if (N === K - 1) {
      for (let j = 0; j + 1 < K; j++) {
        const m = prepStroke(joinStrokes([ref[j], ref[j + 1]]));
        m.ord = j;
        const cols = R.slice(0, j).concat([m], R.slice(j + 2));
        const res = assign(inp.S, cols, ctx);
        const i = res.map.indexOf(j);
        options.push({ res, ok: pairsOk(res), issue: { stroke: i, kind: 'count', expected: j, en: 'Your stroke ' + (i + 1) + ' joins strokes ' + (j + 1) + ' and ' + (j + 2) + '; write them as two separate strokes.' } });
      }
    } else if (N === K + 1) {
      for (let i = 0; i + 1 < N; i++) {
        const m = prepStroke(joinStrokes([inp.nraw[i], inp.nraw[i + 1]]));
        m.ord = i;
        const rows = inp.S.slice(0, i).concat([m], inp.S.slice(i + 2));
        const res = assign(rows, R, ctx);
        const j = res.map[i];
        options.push({ res, ok: pairsOk(res), issue: { stroke: i, kind: 'count', expected: j, en: 'Your strokes ' + (i + 1) + ' and ' + (i + 2) + ' together form stroke ' + (j + 1) + '; write it as one stroke.' } });
      }
    }
    if (!options.length) return out;
    options.sort((a, b) => a.res.dist - b.res.dist);
    const o = options[0];
    const next = options[1] ? options[1].res.dist : INF;
    if (o.ok && next - o.res.dist >= MARGIN) {
      out.confident = true;
      out.issues.push(o.issue);
    }
    return out;
  }

  // The group of characters written with the same shape as ch (['ロ', '口']), or null.
  function sameShape(ch) {
    return SAME_OF[ch] ? SAME_OF[ch].slice() : null;
  }

  return {
    supported,
    knows,
    warm,
    recognize,
    reference,
    radical,
    strokeCount,
    strokeOrderFeedback,
    sameShape,
    // exposed for tests and tooling only
    _internal: { P, tables, kanjiTables, kanjiChars, entryOf, ready, cloudDist, coarseFeat, kanjiShortlist, prepInput, SMALL_OF, LARGE_OF, SAME_SHAPE, TWIN_OF, VARIANTS, scriptOf, baseOf, normalize, cleanStrokes, straightness },
  };
})();
