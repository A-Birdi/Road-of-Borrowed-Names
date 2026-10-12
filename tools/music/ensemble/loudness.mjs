// ITU-R BS.1770-4 loudness for stereo Float32Arrays (K-weighting at any sample rate, as libebur128 designs it;
// 400 ms blocks, 75 % overlap; absolute gate -70 LUFS, relative gate -10 LU). No dependencies, so the same function
// runs in Node and, as source text, in the browser (verify.mjs). Checked against FFmpeg's ebur128 by verify.mjs.
export function kWeight(x, fs) {
  const out = new Float64Array(x.length);
  let K = Math.tan(Math.PI * 1681.974450955533 / fs);
  const Vh = Math.pow(10, 3.999843853973347 / 20), Vb = Math.pow(Vh, 0.4996667741545416), Q1 = 0.7071752369554196;
  let a0 = 1 + K / Q1 + K * K;
  const s1 = [(Vh + Vb * K / Q1 + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q1 + K * K) / a0, 2 * (K * K - 1) / a0, (1 - K / Q1 + K * K) / a0];
  K = Math.tan(Math.PI * 38.13547087602444 / fs);
  const Q2 = 0.5003270373238773;
  a0 = 1 + K / Q2 + K * K;
  const s2 = [1, -2, 1, 2 * (K * K - 1) / a0, (1 - K / Q2 + K * K) / a0];
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, u1 = 0, u2 = 0, z1 = 0, z2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = x[i];
    const y = s1[0] * v + s1[1] * x1 + s1[2] * x2 - s1[3] * y1 - s1[4] * y2;
    x2 = x1; x1 = v; y2 = y1; y1 = y;
    const z = s2[0] * y + s2[1] * u1 + s2[2] * u2 - s2[3] * z1 - s2[4] * z2;
    u2 = u1; u1 = y; z2 = z1; z1 = z;
    out[i] = z;
  }
  return out;
}
// { integrated (LUFS), momentary: [{t, lufs}] (400 ms blocks every 100 ms), peak (sample) }
export function loudness(L, R, fs) {
  const a = kWeight(L, fs), b = kWeight(R, fs);
  const block = Math.round(0.4 * fs), hop = Math.round(0.1 * fs);
  const zs = [], mom = [];
  // running sums of squares
  const ca = new Float64Array(a.length + 1), cb = new Float64Array(b.length + 1);
  for (let i = 0; i < a.length; i++) { ca[i + 1] = ca[i] + a[i] * a[i]; cb[i + 1] = cb[i] + b[i] * b[i]; }
  for (let s = 0; s + block <= a.length; s += hop) {
    const z = (ca[s + block] - ca[s]) / block + (cb[s + block] - cb[s]) / block;
    zs.push(z);
    mom.push({ t: (s + block) / fs, lufs: z > 0 ? -0.691 + 10 * Math.log10(z) : -Infinity });
  }
  const lk = (z) => -0.691 + 10 * Math.log10(z);
  const abs = zs.filter((z) => z > 0 && lk(z) > -70);
  let integrated = -Infinity;
  if (abs.length) {
    const rel = lk(abs.reduce((p, q) => p + q, 0) / abs.length) - 10;
    const g = abs.filter((z) => lk(z) > rel);
    if (g.length) integrated = lk(g.reduce((p, q) => p + q, 0) / g.length);
  }
  let peak = 0;
  for (let i = 0; i < L.length; i++) { const m = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (m > peak) peak = m; }
  return { integrated, momentary: mom, peak };
}
