// SVG path-data parser and sampler (build-time only).
// Supports M m L l H h V v C c S s Q q T t Z z (A a approximated by a line to the end point),
// implicit repeated commands, and compact number syntax ("1.5-2.3", ".5.5", "1e-3").

const NUM = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/y;

export function tokenize(d) {
  const out = [];
  let i = 0;
  while (i < d.length) {
    const c = d[i];
    if (/[\s,]/.test(c)) { i++; continue; }
    if (/[MmLlHhVvCcSsQqTtZzAa]/.test(c)) { out.push(c); i++; continue; }
    NUM.lastIndex = i;
    const m = NUM.exec(d);
    if (!m) throw new Error(`Bad path data at ${i}: ${d.slice(i, i + 20)}`);
    out.push(parseFloat(m[0]));
    i = NUM.lastIndex;
  }
  return out;
}

const ARGC = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, Z: 0, A: 7 };

// Returns a list of subpaths; each subpath is a list of absolute segments:
// {type:'L', p0, p1} | {type:'C', p0, c1, c2, p1} | {type:'Q', p0, c1, p1}
export function parsePath(d) {
  const tok = tokenize(d);
  const subpaths = [];
  let cur = null;
  let x = 0, y = 0, sx = 0, sy = 0;
  let lastC2 = null, lastQ = null, prevCmd = '';
  let i = 0, cmd = null;
  while (i < tok.length) {
    if (typeof tok[i] === 'string') cmd = tok[i++];
    else if (cmd === null) throw new Error('Path data must start with a command');
    const up = cmd.toUpperCase();
    const rel = cmd !== up;
    const n = ARGC[up];
    if (up === 'Z') {
      if (cur && (x !== sx || y !== sy)) cur.push({ type: 'L', p0: [x, y], p1: [sx, sy] });
      x = sx; y = sy; prevCmd = 'Z'; lastC2 = lastQ = null;
      cmd = null; // Z takes no arguments; a following number is an error
      continue;
    }
    const a = tok.slice(i, i + n);
    if (a.length < n || a.some((v) => typeof v !== 'number')) throw new Error(`Missing args for ${cmd}`);
    i += n;
    const ox = rel ? x : 0, oy = rel ? y : 0;
    switch (up) {
      case 'M':
        x = a[0] + ox; y = a[1] + oy; sx = x; sy = y;
        cur = []; subpaths.push(cur);
        cmd = rel ? 'l' : 'L'; // implicit lineto after moveto
        lastC2 = lastQ = null;
        break;
      case 'L': case 'H': case 'V': case 'A': {
        let nx = x, ny = y;
        if (up === 'L') { nx = a[0] + ox; ny = a[1] + oy; }
        else if (up === 'H') nx = a[0] + ox;
        else if (up === 'V') ny = a[0] + oy;
        else { nx = a[5] + ox; ny = a[6] + oy; }
        cur.push({ type: 'L', p0: [x, y], p1: [nx, ny] });
        x = nx; y = ny; lastC2 = lastQ = null;
        break;
      }
      case 'C': case 'S': {
        let c1;
        if (up === 'C') c1 = [a[0] + ox, a[1] + oy];
        else c1 = lastC2 && /[CcSs]/.test(prevCmd) ? [2 * x - lastC2[0], 2 * y - lastC2[1]] : [x, y];
        const k = up === 'C' ? 2 : 0;
        const c2 = [a[k] + ox, a[k + 1] + oy];
        const p1 = [a[k + 2] + ox, a[k + 3] + oy];
        cur.push({ type: 'C', p0: [x, y], c1, c2, p1 });
        lastC2 = c2; lastQ = null; x = p1[0]; y = p1[1];
        break;
      }
      case 'Q': case 'T': {
        let c1;
        if (up === 'Q') c1 = [a[0] + ox, a[1] + oy];
        else c1 = lastQ && /[QqTt]/.test(prevCmd) ? [2 * x - lastQ[0], 2 * y - lastQ[1]] : [x, y];
        const k = up === 'Q' ? 2 : 0;
        const p1 = [a[k] + ox, a[k + 1] + oy];
        cur.push({ type: 'Q', p0: [x, y], c1, p1 });
        lastQ = c1; lastC2 = null; x = p1[0]; y = p1[1];
        break;
      }
    }
    prevCmd = up === 'M' ? 'M' : cmd;
  }
  return subpaths;
}

function evalSeg(s, t) {
  const u = 1 - t;
  if (s.type === 'L') return [u * s.p0[0] + t * s.p1[0], u * s.p0[1] + t * s.p1[1]];
  if (s.type === 'Q') {
    const a = u * u, b = 2 * u * t, c = t * t;
    return [a * s.p0[0] + b * s.c1[0] + c * s.p1[0], a * s.p0[1] + b * s.c1[1] + c * s.p1[1]];
  }
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
  return [
    a * s.p0[0] + b * s.c1[0] + c * s.c2[0] + e * s.p1[0],
    a * s.p0[1] + b * s.c1[1] + c * s.c2[1] + e * s.p1[1],
  ];
}

// Dense polyline for a path (all subpaths concatenated in drawing order).
export function flatten(d, stepsPerCurve = 48) {
  const pts = [];
  for (const sp of parsePath(d)) {
    for (const s of sp) {
      const n = s.type === 'L' ? 1 : stepsPerCurve;
      for (let k = pts.length ? 1 : 0; k <= n; k++) pts.push(evalSeg(s, k / n));
    }
  }
  return pts;
}

export function pathLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}

// Uniform arc-length resampling with the given spacing (keeps both end points).
export function resampleBySpacing(pts, spacing) {
  const L = pathLength(pts);
  const n = Math.max(1, Math.round(L / spacing));
  const out = [pts[0].slice()];
  const step = L / n;
  let acc = 0, i = 1, prev = pts[0].slice();
  for (let k = 1; k < n; k++) {
    const target = k * step;
    while (i < pts.length) {
      const seg = Math.hypot(pts[i][0] - prev[0], pts[i][1] - prev[1]);
      if (acc + seg >= target) {
        const t = seg > 0 ? (target - acc) / seg : 0;
        const q = [prev[0] + (pts[i][0] - prev[0]) * t, prev[1] + (pts[i][1] - prev[1]) * t];
        acc = target; prev = q;
        out.push(q);
        break;
      }
      acc += seg; prev = pts[i]; i++;
    }
  }
  out.push(pts[pts.length - 1].slice());
  return out;
}

// Ramer–Douglas–Peucker simplification.
export function rdp(pts, eps) {
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    let best = -1, bi = -1;
    for (let i = a + 1; i < b; i++) {
      const d = len > 1e-9
        ? Math.abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / len
        : Math.hypot(pts[i][0] - ax, pts[i][1] - ay);
      if (d > best) { best = d; bi = i; }
    }
    if (best > eps) { keep[bi] = 1; stack.push([a, bi], [bi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
