// Analysis of the Japanese instrument voices (Playwright + Chromium).
//
//   node tools/build.mjs && node tests/e2e/audio_instruments.mjs [--standalone] [--json]
//
// Renders single notes / strokes of every instrument and percussion voice in
// an OfflineAudioContext — the voice straight into the destination, without
// the master chain, so the measurement is of the voice itself — and reports:
//   peak, RMS, NaN; attack time (onset to 90 % of the envelope peak); decay
//   (envelope peak to -20 dB and to -40 dB); spectral centroid early (first
//   60 ms) and late (150–450 ms); the share of energy off the harmonics of
//   the note (breath/noise); the share of energy from the 6th harmonic up
//   late in the note (buzz); the pitch early and settled (autocorrelation,
//   in cents); the strongest partial; the number of audio nodes a note owns
//   and the number of fixed filters its track shares between notes; and the
//   render cost of a 10 s passage (CPU).
// Each voice must be non-silent, finite, with a peak below 1, and show the
// features its model claims (checked against a related plain voice where
// that makes sense, e.g. shamisen against pluck, shakuhachi against flute).
// These are signal measurements. They say a voice has the claimed
// features; they do not say it sounds good — nobody has listened here.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const standalone = args.includes('--standalone');
const asJson = args.includes('--json');
let failures = 0;
const ok = (cond, msg) => { if (!cond) { failures++; console.log('  FAIL:', msg); } };

function standalonePage() {
  const files = [path.join(root, 'src/core/00_ns.js')];
  const dir = path.join(root, 'src/audio');
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort()) files.push(path.join(dir, f));
  const js = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'rb-inst-')), 'inst.html');
  fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><title>instruments</title><script>${js}</script>`);
  return out;
}
const target = standalone ? standalonePage() : path.join(root, 'index.html');
if (!fs.existsSync(target)) { console.log('index.html not found — run `node tools/build.mjs` first (or use --standalone).'); process.exit(2); }

const browser = await chromium.launch();
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e.message || e)));
await page.goto(pathToFileURL(target).href);
await page.waitForFunction(() => globalThis.RB && RB.audio && RB.audio._ && RB.audio._.inst, null, { timeout: 15000 });

// [name, kind, midi or null, duration (s), velocity]
const VOICES = [
  ['pluck', 'inst', 62, 0.6, 0.8], ['flute', 'inst', 74, 1.2, 0.8], ['harp', 'inst', 62, 0.8, 0.8],
  ['shamisen', 'inst', 62, 0.6, 0.8], ['biwa', 'inst', 50, 1.0, 0.8],
  ['koto', 'inst', 62, 1.0, 0.8], ['koto_oshi', 'inst', 62, 1.0, 0.8],
  ['shakuhachi', 'inst', 74, 1.2, 0.8], ['shinobue', 'inst', 86, 1.0, 0.8],
  ['sho', 'inst', 69, 2.0, 0.8], ['rin', 'inst', 81, 0.5, 0.8],
  ['o', 'perc', null, 0, 0.8], ['l', 'perc', null, 0, 0.8],
  ['z', 'perc', null, 0, 0.8], ['e', 'perc', null, 0, 0.8], ['f', 'perc', null, 0, 0.8], ['m', 'perc', null, 0, 0.8],
  ['q', 'perc', null, 0, 0.8], ['y', 'perc', null, 0, 0.8], ['a', 'perc', null, 0, 0.8], ['v', 'perc', null, 0, 0.8],
  ['i', 'perc', null, 0, 0.8], ['w', 'perc', null, 0, 0.8],
];

// where the "early" pitch is read (s after the onset); breathy voices are read
// a little later so the breath burst does not swamp the estimate
const EARLY = { shakuhachi: 0.05, shinobue: 0.004 };
const res = await page.evaluate(async ([VOICES, EARLY]) => {
  const _ = RB.audio._;
  const SR = 44100;
  // radix-2 FFT magnitude spectrum of x[0..N) with a Hann window
  function spectrum(x, N) {
    const re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = (x[i] || 0) * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
    for (let i = 1, j = 0; i < N; i++) {
      let bit = N >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
    }
    for (let len = 2; len <= N; len <<= 1) {
      const ang = (-2 * Math.PI) / len;
      for (let i = 0; i < N; i += len) {
        for (let k = 0; k < len / 2; k++) {
          const wr = Math.cos(ang * k), wi = Math.sin(ang * k);
          const ar = re[i + k + len / 2], ai = im[i + k + len / 2];
          const xr = ar * wr - ai * wi, xi = ar * wi + ai * wr;
          re[i + k + len / 2] = re[i + k] - xr; im[i + k + len / 2] = im[i + k] - xi;
          re[i + k] += xr; im[i + k] += xi;
        }
      }
    }
    const mag = new Float64Array(N / 2);
    for (let i = 0; i < N / 2; i++) mag[i] = re[i] * re[i] + im[i] * im[i];
    return mag; // power
  }
  const binHz = (N) => SR / N;
  // spectral centroid weighted by magnitude (the usual brightness measure)
  function centroid(p, N) {
    let s = 0, w = 0;
    for (let i = 1; i < p.length; i++) { const m = Math.sqrt(p[i]); s += m * i * binHz(N); w += m; }
    return w > 0 ? s / w : 0;
  }
  function above(p, N, hz) {
    let s = 0, w = 0;
    for (let i = 1; i < p.length; i++) { w += p[i]; if (i * binHz(N) >= hz) s += p[i]; }
    return w > 0 ? s / w : 0;
  }
  function offHarmonic(p, N, f0) {
    // energy farther than 4 % (in frequency) from every harmonic of f0, up to 8 kHz
    let off = 0, tot = 0;
    for (let i = 2; i < p.length; i++) {
      const hz = i * binHz(N);
      if (hz > 8000) break;
      tot += p[i];
      const k = Math.max(1, Math.round(hz / f0));
      if (Math.abs(hz - k * f0) > Math.max(0.04 * k * f0, 2.5 * binHz(N))) off += p[i];
    }
    return tot > 0 ? off / tot : 0;
  }
  function strongest(p, N) {
    let bi = 1;
    for (let i = 2; i < p.length; i++) if (p[i] > p[bi]) bi = i;
    return Math.round(bi * binHz(N));
  }
  // pitch by autocorrelation in [t0, t0+win), searching near f0
  function pitch(x, t0, win, f0) {
    const a = Math.floor(t0 * SR), n = Math.floor(win * SR);
    const lo = Math.floor(SR / (f0 * 1.25)), hi = Math.ceil(SR / (f0 * 0.8));
    let best = -Infinity, bl = lo;
    for (let L = lo; L <= hi; L++) {
      let s = 0;
      for (let i = 0; i < n; i++) s += (x[a + i] || 0) * (x[a + i + L] || 0);
      if (s > best) { best = s; bl = L; }
    }
    // parabolic refinement
    const ac = (L) => { let s = 0; for (let i = 0; i < n; i++) s += (x[a + i] || 0) * (x[a + i + L] || 0); return s; };
    const y0 = ac(bl - 1), y1 = best, y2 = ac(bl + 1);
    const den = y0 - 2 * y1 + y2;
    const d = den !== 0 ? 0.5 * (y0 - y2) / den : 0;
    return SR / (bl + d);
  }
  const out = [];
  for (const [name, kind, midi, dur, vel] of VOICES) {
    const secs = kind === 'perc' ? 3 : name === 'rin' ? 6 : Math.max(2.5, dur + 1.5);
    const ctx = new OfflineAudioContext(1, Math.ceil(SR * secs), SR);
    const g = _.buildGraph(ctx, { master: 1, music: 1, sfx: 1, voice: 1 }, false);
    // count the nodes one note creates
    let nodes = 0;
    const proto = Object.getPrototypeOf(ctx);
    const names = ['createOscillator', 'createGain', 'createBiquadFilter', 'createBufferSource', 'createWaveShaper', 'createStereoPanner', 'createDelay', 'createConvolver'];
    const saved = {};
    for (const k of names) { saved[k] = ctx[k]; ctx[k] = function () { nodes++; return proto[k].apply(this, arguments); }; }
    const dest = ctx.createGain();
    nodes = 0;
    dest.connect(ctx.destination);
    const t0 = 0.05;
    const f = midi != null ? _.mtof(midi) : 0;
    if (kind === 'perc') _.perc[name](g, dest, t0, vel, 0.5);
    else _.inst[name](g, dest, t0, f, dur, vel);
    const firstNote = nodes;
    for (const k of names) ctx[k] = saved[k];
    // a second note on another track strip of a throwaway context: the nodes
    // a note owns once the strip's shared filters exist
    const ctx2 = new OfflineAudioContext(1, SR, SR);
    const g2 = _.buildGraph(ctx2, { master: 1, music: 1, sfx: 1, voice: 1 }, false);
    const d2 = ctx2.createGain();
    d2.connect(ctx2.destination);
    const play2 = () => (kind === 'perc' ? _.perc[name](g2, d2, 0.05, vel, 0.5) : _.inst[name](g2, d2, 0.05, f, dur, vel));
    play2();
    let n2 = 0;
    for (const k of names) ctx2[k] = function () { n2++; return proto[k].apply(this, arguments); };
    play2();
    const perNote = n2;
    const sharedNodes = firstNote - n2;
    const tStart = performance.now();
    const buf = await ctx.startRendering();
    const renderMs = performance.now() - tStart;
    const x = buf.getChannelData(0);
    let peak = 0, sum = 0, nan = false;
    for (let i = 0; i < x.length; i++) {
      const v = x[i];
      if (!Number.isFinite(v)) { nan = true; continue; }
      sum += v * v;
      if (Math.abs(v) > peak) peak = Math.abs(v);
    }
    // 5 ms RMS envelope
    const W = Math.floor(SR * 0.005);
    const envl = [];
    for (let i = 0; i + W <= x.length; i += W) { let s = 0; for (let k = 0; k < W; k++) s += x[i + k] * x[i + k]; envl.push(Math.sqrt(s / W)); }
    let ep = 0, epi = 0;
    for (let i = 0; i < envl.length; i++) if (envl[i] > ep) { ep = envl[i]; epi = i; }
    const onset = envl.findIndex((e) => e > ep * 0.01);
    const at90 = envl.findIndex((e) => e >= ep * 0.9);
    const after = (db) => { const thr = ep * Math.pow(10, db / 20); for (let i = epi; i < envl.length; i++) if (envl[i] < thr) return (i - epi) * 0.005; return null; };
    const N = 4096;
    const s0 = Math.floor(t0 * SR);
    const early = spectrum(x.subarray(s0, s0 + Math.floor(0.06 * SR)), N);
    const lateA = s0 + Math.floor(0.15 * SR);
    const late = spectrum(x.subarray(lateA, lateA + Math.floor(0.3 * SR)), N);
    const whole = spectrum(x.subarray(s0, s0 + N), N);
    const r = {
      name, kind, midi, f: Math.round(f * 10) / 10, perNote, sharedNodes, renderMs: Math.round(renderMs),
      peak, rms: Math.sqrt(sum / x.length), nan,
      attackMs: onset >= 0 && at90 >= 0 ? (at90 - onset) * 5 : null,
      decay20: after(-20), decay40: after(-40),
      centroidEarly: Math.round(centroid(early, N)), centroidLate: Math.round(centroid(late, N)),
      hfLate: above(late, N, 2000), lowShare: above(whole, N, 150) != null ? 1 - above(whole, N, 150) : null,
      strongest: strongest(whole, N),
    };
    if (f) {
      r.offHarm = offHarmonic(late, N, f);
      r.offHarmEarly = offHarmonic(early, N, f);
      r.hiLate = above(late, N, f * 6); // power share from the 6th harmonic up, late in the note (buzz)
      const pe = pitch(x, t0 + (EARLY[name] || 0.012), 0.02, f);
      const pl = pitch(x, t0 + Math.min(0.35, dur * 0.6), 0.04, f);
      r.centsEarly = Math.round(1200 * Math.log2(pe / f));
      r.centsLate = Math.round(1200 * Math.log2(pl / f));
    }
    out.push(r);
  }
  return out;
}, [VOICES, EARLY]);

// ---- CPU: a 10 s passage of eighth notes at 120 bpm (20 notes/s for
// percussion, 4 notes/s for pitched voices), rendered offline through the
// full mix graph; reported as render time per second of audio (best of 3).
const cpu = await page.evaluate(async (VOICES) => {
  const _ = RB.audio._;
  const out = {};
  for (const [name, kind, midi, dur, vel] of VOICES) {
    let best = Infinity;
    for (let rep = 0; rep < 3; rep++) {
      const SR = 44100, secs = 10;
      const ctx = new OfflineAudioContext(2, SR * secs, SR);
      const g = _.buildGraph(ctx, _.DEFAULT_VOL, false);
      g.out.connect(ctx.destination);
      const n = kind === 'perc' ? 40 : 40;
      for (let i = 0; i < n; i++) {
        const t = 0.05 + i * 0.25;
        if (kind === 'perc') _.perc[name](g, g.music, t, vel, (i * 0.37) % 1);
        else _.inst[name](g, g.music, t, _.mtof(midi + [0, 2, 4, 7][i % 4]), 0.25, vel);
      }
      const t0 = performance.now();
      await ctx.startRendering();
      best = Math.min(best, performance.now() - t0);
    }
    out[name] = best / 10; // ms per second of audio
  }
  // the graph alone (reverbs, compressor, limiter) for reference
  let base = Infinity;
  for (let rep = 0; rep < 3; rep++) {
    const ctx = new OfflineAudioContext(2, 44100 * 10, 44100);
    const g = _.buildGraph(ctx, _.DEFAULT_VOL, false);
    g.out.connect(ctx.destination);
    const t0 = performance.now();
    await ctx.startRendering();
    base = Math.min(base, performance.now() - t0);
  }
  out._graph = base / 10;
  return out;
}, VOICES);

const by = Object.fromEntries(res.map((r) => [r.name, r]));
const pad = (s, n) => String(s).padEnd(n);
const fx = (v, d = 3) => (v == null ? '—' : typeof v === 'number' ? v.toFixed(d) : v);
console.log('# instrument analysis (single notes, raw voice, 44.1 kHz)');
console.log([pad('voice', 11), pad('nodes', 6), pad('shared', 7), pad('peak', 6), pad('att ms', 7), pad('-20dB s', 8), pad('-40dB s', 8), pad('cent E', 7), pad('cent L', 7), pad('hi>6f L', 8), pad('offHarm', 8), pad('cents E/L', 10), pad('top Hz', 7)].join(' '));
for (const r of res) {
  console.log([pad(r.name, 11), pad(r.perNote, 6), pad(r.sharedNodes, 7), pad(fx(r.peak), 6), pad(r.attackMs == null ? '—' : r.attackMs, 7), pad(fx(r.decay20, 2), 8), pad(fx(r.decay40, 2), 8),
    pad(r.centroidEarly, 7), pad(r.centroidLate, 7), pad(r.hiLate == null ? '—' : fx(r.hiLate), 8), pad(r.offHarm == null ? '—' : fx(r.offHarm), 8),
    pad(r.centsEarly == null ? '—' : r.centsEarly + '/' + r.centsLate, 10), pad(r.strongest, 7)].join(' '));
}
console.log('\n# CPU (offline render, ms per second of audio; 4 notes/s, best of 3; the mix graph alone: ' + cpu._graph.toFixed(1) + ' ms/s)');
console.log(res.map((r) => `${r.name} ${(cpu[r.name] - cpu._graph).toFixed(1)}`).join('  '));
if (asJson) console.log(JSON.stringify({ res, cpu }, null, 1));

// ---- every voice: non-silent, finite, below full scale, bounded node count
for (const r of res) {
  ok(!r.nan, r.name + ': NaN in output');
  ok(r.peak > 0.01, r.name + ': silent (peak ' + r.peak + ')');
  ok(r.peak < 1, r.name + ': peak ' + r.peak + ' >= 1');
  ok(r.perNote <= 16, r.name + ': ' + r.perNote + ' nodes per note (budget 16)');
  ok(r.sharedNodes <= 8, r.name + ': ' + r.sharedNodes + ' shared nodes per track (budget 8)');
}
// ---- the features each model claims
const S = by.shamisen, B = by.biwa, K = by.koto, KO = by.koto_oshi, SH = by.shakuhachi, FL = by.flute, SN = by.shinobue, PL = by.pluck;
ok(S.attackMs <= 10, 'shamisen: attack should be a plectrum strike (<= 10 ms), got ' + S.attackMs);
ok(S.centsEarly >= 12 && Math.abs(S.centsLate) <= 8, `shamisen: pitch should drop into tune after the strike (early ${S.centsEarly}, settled ${S.centsLate} cents)`);
ok(S.hiLate > 0.05 && S.hiLate > PL.hiLate * 10, `shamisen: the sawari buzz keeps energy from the 6th harmonic up late in the note (shamisen ${S.hiLate.toFixed(3)} vs pluck ${PL.hiLate.toFixed(4)})`);
ok(S.decay20 < K.decay20, `shamisen: drier than the koto (-20 dB in ${S.decay20}s vs ${K.decay20}s)`);
ok(B.hiLate > 0.05 && B.hiLate > PL.hiLate * 10 && B.decay20 > S.decay20, `biwa: buzzing and longer than the shamisen (hi ${B.hiLate.toFixed(3)}, -20 dB ${B.decay20}s vs ${S.decay20}s)`);
ok(B.centroidLate < S.centroidLate, `biwa: darker than the shamisen (centroid ${B.centroidLate} vs ${S.centroidLate} Hz)`);
ok(K.attackMs <= 10 && K.decay20 > 0.5, `koto: plucked attack and a long ring (attack ${K.attackMs} ms, -20 dB ${K.decay20}s)`);
ok(K.centroidEarly > K.centroidLate * 1.3, `koto: bright attack that mellows (centroid ${K.centroidEarly} -> ${K.centroidLate} Hz)`);
ok(KO.centsEarly <= -150 && Math.abs(KO.centsLate) <= 10, `koto_oshi: plucked a whole tone low and pressed up (early ${KO.centsEarly}, settled ${KO.centsLate} cents)`);
ok(SH.offHarm > FL.offHarm * 2, `shakuhachi: far breathier than the flute (off-harmonic energy ${SH.offHarm.toFixed(3)} vs ${FL.offHarm.toFixed(3)})`);
ok(SH.centsEarly <= -40 && Math.abs(SH.centsLate) <= 12, `shakuhachi: meri scoop from below (early ${SH.centsEarly}, settled ${SH.centsLate} cents)`);
ok(SH.attackMs >= FL.attackMs, `shakuhachi: swells in no faster than the flute (${SH.attackMs} vs ${FL.attackMs} ms)`);
ok(SN.centroidLate / SN.f > (FL.centroidLate / FL.f) * 1.3, `shinobue: brighter than the flute relative to its pitch (centroid/f ${(SN.centroidLate / SN.f).toFixed(2)} vs ${(FL.centroidLate / FL.f).toFixed(2)})`);
ok(SN.centsEarly >= 100 && Math.abs(SN.centsLate) <= 12, `shinobue: grace from above (early ${SN.centsEarly}, settled ${SN.centsLate} cents)`);
ok(by.sho.attackMs >= 150 && by.sho.centroidLate > by.sho.f * 2.2, `sho: slow swell and a reedy spectrum (attack ${by.sho.attackMs} ms, centroid ${by.sho.centroidLate} Hz for ${by.sho.f} Hz)`);
ok(by.rin.decay20 > 1.5, 'rin: long ring (-20 dB after ' + by.rin.decay20 + ' s)');
// percussion
const Z = by.z, E = by.e, M = by.m, Q = by.q, Y = by.y, AT = by.a, V = by.v, I = by.i;
ok(Z.strongest < 130 && Z.lowShare > 0.4 && Z.decay20 > E.decay20, `ōdaiko: deep (strongest ${Z.strongest} Hz, ${(Z.lowShare * 100).toFixed(0)} % below 150 Hz) and longer than the shime (-20 dB ${Z.decay20}s vs ${E.decay20}s)`);
ok(Z.decay20 > by.o.decay20, `ōdaiko: rings longer than the existing big drum (${Z.decay20}s vs ${by.o.decay20}s)`);
ok(E.strongest > 250 && E.strongest < 420 && E.decay20 < 0.25, `shime-daiko: tight and high (strongest ${E.strongest} Hz, -20 dB ${E.decay20}s)`);
ok(M.strongest > 350 && M.strongest < 500 && M.decay20 > Q.decay20, `kotsuzumi: a pitched, resonant "pon" (strongest ${M.strongest} Hz, -20 dB ${M.decay20}s vs kan ${Q.decay20}s)`);
ok(Q.centroidEarly > 2000 && Q.decay20 < 0.12, `ōtsuzumi: a sharp dry crack (centroid ${Q.centroidEarly} Hz, -20 dB ${Q.decay20}s)`);
ok(Y.centroidEarly > 2000 && Y.decay20 < 0.15, `hyōshigi: bright and short (centroid ${Y.centroidEarly} Hz, -20 dB ${Y.decay20}s)`);
ok(AT.centroidEarly > 1500 && AT.decay20 > Y.decay20, `atarigane: metallic and ringing longer than wood (centroid ${AT.centroidEarly} Hz, -20 dB ${AT.decay20}s)`);
ok(V.centroidEarly > 4000, `chappa: cymbal-bright (centroid ${V.centroidEarly} Hz)`);
ok(I.decay20 > 1, 'rin (percussion): long ring (-20 dB after ' + I.decay20 + ' s)');
ok(by.f.centroidEarly > 1200 && by.f.decay20 < 0.12, `taiko rim: a wooden click (centroid ${by.f.centroidEarly} Hz, -20 dB ${by.f.decay20}s)`);

ok(!pageErrors.length, 'page errors: ' + pageErrors.join(' | '));
await browser.close();
console.log(failures ? `\n${failures} FAILED` : '\nall instrument checks passed');
process.exit(failures ? 1 : 0);
