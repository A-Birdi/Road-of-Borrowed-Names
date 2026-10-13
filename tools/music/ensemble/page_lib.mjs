// MT-1: measurement helpers installed in the game page (verify.mjs; tests/e2e/music_performance.mjs), as source text:
// decode a file with the browser, read windows of it, render the game's own scheduler raw against a model of it, and
// render through the game graph for loudness and onsets. Development and tests only; nothing here ships.
export const XJ = 0.05; // the join / cycle crossfade (src/audio/22_ensemble.js)
export const PAGE_LIB = `
window.__mt = { bufs: {} };
window.__mtDecode = async function (url, rates) {
  const r = await fetch(url, { cache: 'no-store' });
  const bytes = await r.arrayBuffer();
  const out = { url, bytes: bytes.byteLength, rates: {} };
  for (const rate of rates) {
    const c = new OfflineAudioContext(2, 1, rate);
    const b = await c.decodeAudioData(bytes.slice(0));
    let finite = true, peak = 0;
    for (let ch = 0; ch < b.numberOfChannels; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < d.length; i++) { const v = d[i]; if (!isFinite(v)) finite = false; else if (Math.abs(v) > peak) peak = Math.abs(v); } }
    out.rates[rate] = { frames: b.length, channels: b.numberOfChannels, sampleRate: b.sampleRate, finite, peak };
    if (rate === 48000) window.__mt.bufs[url] = b;
  }
  return out;
};
const b64 = (a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let s = ''; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); };
window.__mtWindows = function (url, starts, win, search) {
  const b = window.__mt.bufs[url];
  return starts.map((s) => ({ at: s, L: b64(b.getChannelData(0).slice(s - search, s + win + search)), R: b64(b.getChannelData(1).slice(s - search, s + win + search)) }));
};
// the scheduler's raw render against its model (the decoded files read where the segments say, the same gains)
window.__mtPlace = async function (id, entry, fi, from, seconds) {
  const fmt = entry.formats[fi], bufs = { first: window.__mt.bufs[fmt.first.url], loop: fmt.loop ? window.__mt.bufs[fmt.loop.url] : null };
  const opts = { entry, fmt, raw: true, from, sampleRate: 48000 };
  const out = await RB.audio.renderEnsembleOffline(id, bufs, seconds, opts);
  const segs = opts.segments.map((s) => Object.assign({}, s, { b: bufs[s.role], stopAt: s.until == null ? Infinity : s.until + ${XJ} + 0.01 }));
  const sr = 48000, n = out.length, oL = out.getChannelData(0), oR = out.getChannelData(1);
  // how the browser turns (when, offset) into frames: the exact read position interpolated ('linear') or rounded
  // ('nearest'), or as Chromium does it (measured with a ramp buffer): the offset rounded to a frame, the start
  // time honoured to the sub-sample by interpolation ('chromium'). The best-fitting model is reported with its SNR.
  const MODELS = ['linear', 'nearest', 'chromium'];
  const at0 = (d, k) => (k >= 0 && k < d.length ? d[k] : 0);
  const lin = (d, pos) => { const k = Math.floor(pos), f = pos - k; return k + 1 < d.length && k >= 0 ? d[k] * (1 - f) + d[k + 1] * f : 0; };
  const readSeg = (s, i, ch, m) => {
    const d = s.b.getChannelData(ch), t = i / sr;
    if (t < s.when) return 0;
    if (m === 'chromium') return lin(d, Math.round(s.offset * sr) + (i - s.when * sr));
    const pos = (s.offset + (t - s.when)) * sr;
    return m === 'linear' ? lin(d, pos) : at0(d, Math.round(pos));
  };
  const gainOf = (s, t) => { let g = 1; if (s.fadeIn && t < s.when + ${XJ}) g = Math.max(0, (t - s.when) / ${XJ}); if (s.until != null && t >= s.until) g *= Math.max(0, 1 - (t - s.until) / ${XJ}); return g; };
  const sigM = {}, errM = {}, maxM = {};
  for (const m of MODELS) { sigM[m] = 0; errM[m] = 0; maxM[m] = 0; }
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    for (const m of MODELS) {
      let l = 0, r = 0;
      for (const s of segs) {
        if (t < s.when - 1 / sr || t >= s.stopAt) continue;
        const g = gainOf(s, t);
        l += g * readSeg(s, i, 0, m); r += g * readSeg(s, i, 1, m);
      }
      sigM[m] += l * l + r * r;
      const e = (oL[i] - l) ** 2 + (oR[i] - r) ** 2; errM[m] += e; if (e > maxM[m]) maxM[m] = e;
    }
  }
  const snr = {};
  for (const m of MODELS) snr[m] = +(10 * Math.log10(sigM[m] / Math.max(1e-30, errM[m]))).toFixed(2);
  const model = MODELS.reduce((a, b) => (snr[b] > snr[a] ? b : a), MODELS[0]);
  // at each seam: the two renderings over the crossfade (their agreement) and the largest step near it
  const seams = segs.filter((s) => s.fadeIn).map((s) => {
    const prev = segs.find((q) => q.until != null && Math.abs(q.until - s.when) < 1e-6);
    const i0 = Math.ceil(s.when * sr), i1 = Math.min(n, Math.floor((s.when + ${XJ}) * sr));
    if (i0 + 2 >= n) return null; // (beyond this render)
    // the incoming and the outgoing rendering over the crossfade: their agreement, and whether the blend makes a
    // larger sample step than either rendering alone (a seam click would; a note's own attack would be in both)
    let a = 0, d = 0, sr0 = 0, sx = 0, sy = 0, px = null, py = null, pr = null;
    for (let i = i0; i < i1; i++) {
      const t = i / sr;
      const x = [0, 1].map((ch) => readSeg(s, i, ch, model));
      const y = prev ? [0, 1].map((ch) => readSeg(prev, i, ch, model)) : x;
      const o = [oL[i], oR[i]];
      for (const ch of [0, 1]) {
        a += x[ch] * x[ch]; d += (x[ch] - y[ch]) ** 2;
        if (px) { sx = Math.max(sx, Math.abs(x[ch] - px[ch])); sy = Math.max(sy, Math.abs(y[ch] - py[ch])); sr0 = Math.max(sr0, Math.abs(o[ch] - pr[ch])); }
      }
      px = x; py = y; pr = o;
    }
    return { at: +s.when.toFixed(6), kind: s.role === 'loop' && prev && prev.role === 'first' ? 'join' : 'boundary', agreementDb: +(10 * Math.log10(a / Math.max(1e-30, d))).toFixed(2), stepRatio: +(sr0 / Math.max(1e-12, sx, sy)).toFixed(4) };
  }).filter(Boolean);
  return { seconds, from, segments: opts.segments, model, modelSnrDb: snr[model], snrByModel: snr, maxErr: Math.sqrt(maxM[model]), seams };
};
// the game graph: Original (mix 1) or Ensemble (mix 0), loudness and the 1 ms onset envelope
window.__mtGraph = async function (id, entry, fi, seconds, opts) {
  const fmt = entry.formats[fi], bufs = { first: window.__mt.bufs[fmt.first.url], loop: fmt.loop ? window.__mt.bufs[fmt.loop.url] : null };
  const out = await RB.audio.renderEnsembleOffline(id, bufs, seconds, Object.assign({ entry, fmt, original: true, sampleRate: 48000 }, opts));
  const L = out.getChannelData(0), R = out.getChannelData(1);
  let nan = false, clipped = 0;
  for (let i = 0; i < L.length; i++) { if (L[i] !== L[i] || R[i] !== R[i]) nan = true; if (Math.abs(L[i]) >= 0.999 || Math.abs(R[i]) >= 0.999) clipped++; }
  const t0 = Math.round(0.05 * 48000), t1 = Math.min(L.length, Math.round((opts.until || seconds) * 48000));
  const lu = window.__lufs(L.subarray(t0, t1), R.subarray(t0, t1), 48000);
  // onset envelope: 1 ms frames of high-passed mono energy, rises in dB
  let env = null;
  if (opts.onsets) {
    // 1 ms frames of high-passed mono energy (dB); onsets are its rises over 5 ms, half-wave
    const hop = 48, nf = Math.floor((t1 - t0) / hop), e = new Float64Array(nf);
    let p = 0, y = 0;
    for (let f = 0; f < nf; f++) { let s = 0; for (let k = 0; k < hop; k++) { const i = t0 + f * hop + k, m = (L[i] + R[i]) * 0.5; y = 0.96 * (y + m - p); p = m; s += y * y; } e[f] = 10 * Math.log10(s / hop + 1e-10); }
    env = new Float64Array(nf); for (let f = 5; f < nf; f++) env[f] = Math.max(0, e[f] - e[f - 5]);
    window.__mt['env' + opts.onsets] = env;
  }
  return { integrated: lu.integrated, peak: lu.peak, nan, clipped, momentary: opts.momentary ? lu.momentary : undefined };
};
// (MT-2) the Original's parts, each on its own, and the whole Original through the game graph, from one render of its
// first pass: the game's own player (as __mtGraph plays it: default volumes, the cue at 0.05 s, rendered to D + 0.05)
// with every track's strip (after the track's gain, before its pan, room and echo) tapped to its own channel, mono
// ((L + R) / 2), and the graph's output on the last two. Per part: the K-weighted mean square (BS.1770's filter,
// ungated) and the RMS, for render.py's part balance. The whole: exactly what __mtGraph(mix 1, until D, onsets 'O',
// momentary) reports, for verify.mjs's calibration (so the Original's first pass is rendered once per song).
window.__mtStems = async function (id, seconds) {
  const _ = RB.audio._, song = _.getSong(id), O = _.OAC(), sr = 48000, n = song.tracks.length;
  // (seconds: the render's length, D + 0.05 for the first pass, as __mtGraph's calibration render)
  const ctx = new O({ numberOfChannels: n + 2, length: Math.ceil(sr * seconds), sampleRate: sr });
  const g = _.buildGraph(ctx, Object.assign({}, _.DEFAULT_VOL), false);
  const p = new _.Player(g, song, 0.05, false);
  const merger = ctx.createChannelMerger(n + 2);
  try { ctx.destination.channelInterpretation = 'discrete'; } catch (e) { /* ignore */ }
  p.strips.forEach((s, i) => { const m = ctx.createGain(); m.channelCount = 1; m.channelCountMode = 'explicit'; m.channelInterpretation = 'speakers'; s.connect(m); m.connect(merger, 0, i); });
  const split = ctx.createChannelSplitter(2);
  g.out.connect(split); split.connect(merger, 0, n); split.connect(merger, 1, n + 1);
  merger.connect(ctx.destination);
  p.pump(seconds);
  const buf = await ctx.startRendering(), t0 = Math.round(0.05 * sr);
  const parts = song.tracks.map((tk, i) => {
    const x = buf.getChannelData(i).subarray(t0), k = window.__kWeight(x, sr);
    let ms = 0, ks = 0, pk = 0;
    for (let j = 0; j < x.length; j++) { ms += x[j] * x[j]; ks += k[j] * k[j]; if (Math.abs(x[j]) > pk) pk = Math.abs(x[j]); }
    return { track: tk.name, i: tk.i || null, perc: !!tk.perc, kms: ks / x.length, rms: Math.sqrt(ms / x.length), peak: pk, frames: x.length };
  });
  // the whole, as __mtGraph measures it (render window [0.05, D), the 1 ms onset envelope)
  const L = buf.getChannelData(n), R = buf.getChannelData(n + 1);
  let nan = false, clipped = 0;
  for (let i = 0; i < L.length; i++) { if (L[i] !== L[i] || R[i] !== R[i]) nan = true; if (Math.abs(L[i]) >= 0.999 || Math.abs(R[i]) >= 0.999) clipped++; }
  const t1 = Math.min(L.length, Math.round((seconds - 0.05) * sr));
  const lu = window.__lufs(L.subarray(t0, t1), R.subarray(t0, t1), sr);
  const hop = 48, nf = Math.floor((t1 - t0) / hop), e = new Float64Array(nf);
  let pp = 0, y = 0;
  for (let f = 0; f < nf; f++) { let s = 0; for (let k = 0; k < hop; k++) { const i = t0 + f * hop + k, m = (L[i] + R[i]) * 0.5; y = 0.96 * (y + m - pp); pp = m; s += y * y; } e[f] = 10 * Math.log10(s / hop + 1e-10); }
  const env = new Float64Array(nf); for (let f = 5; f < nf; f++) env[f] = Math.max(0, e[f] - e[f - 5]);
  const whole = { integrated: lu.integrated, peak: lu.peak, nan, clipped, momentary: lu.momentary, envO: b64(env) };
  return { parts, whole };
};
// (MT-2) the Original's measurement from stems.mjs, for verify.mjs: its onset envelope back in place
window.__mtSetOriginal = function (envB64) {
  const s = atob(envB64), u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  window.__mt.envO = new Float64Array(u.buffer);
};
// normalized cross-correlation of the two onset envelopes, lag in ms (positive: the Ensemble later)
// (shift, MT-2: a negative control: the Ensemble's envelope read shift ms late, as if the recording were misplaced)
window.__mtOnsetLag = function (maxLag, shift) {
  const a = window.__mt.envO, b0 = window.__mt.envE, k0 = shift || 0;
  const b = k0 ? b0.subarray(k0) : b0, n = Math.min(a.length, b.length);
  const mean = (x) => { let s = 0; for (let i = 0; i < n; i++) s += x[i]; return s / n; };
  const ma = mean(a), mb = mean(b);
  let va = 0, vb = 0; for (let i = 0; i < n; i++) { va += (a[i] - ma) ** 2; vb += (b[i] - mb) ** 2; }
  const r = {};
  let best = null;
  for (let lag = -maxLag; lag <= maxLag; lag++) {
    let s = 0; for (let i = Math.max(0, -lag); i < n - Math.max(0, lag); i++) s += (a[i] - ma) * (b[i + lag] - mb);
    r[lag] = s / Math.sqrt(va * vb);
    if (!best || r[lag] > best.r) best = { lag, r: r[lag] };
  }
  // (MT-2) how far the peak stands above the misaligned lags as a whole: its z-score against every lag 25-50 ms away
  const far = []; for (let k = 25; k <= maxLag; k++) far.push(r[k], r[-k]);
  const fm = far.reduce((a, b) => a + b, 0) / far.length, fs = Math.sqrt(far.reduce((a, b) => a + (b - fm) ** 2, 0) / far.length);
  return { lagMs: best.lag, r: +best.r.toFixed(3), rAt40: +Math.max(r[-40], r[40]).toFixed(3), zFar: +((best.r - fm) / Math.max(1e-12, fs)).toFixed(2), farMean: +fm.toFixed(4), farSd: +fs.toFixed(4), curve: [-50, -40, -30, -20, -10, -5, 0, 5, 10, 20, 30, 40, 50].map((k) => [k, +r[k].toFixed(3)]) };
};
`;

