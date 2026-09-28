/* Procedural audio engine — context lifecycle, mix buses, master chain,
 * synthesised instruments and percussion. Everything is generated with the
 * Web Audio API at runtime: no samples, no network, no external libraries.
 *
 * Nothing here creates an AudioContext at load time. RB.audio.init() must be
 * called from a user gesture (it is idempotent and cheap to call repeatedly).
 * If Web Audio is missing, every public call is a safe no-op.
 *
 * Files: 10_synth.js (this: engine + instruments), 20_sequencer.js (song
 * compiler, lookahead scheduler, playSong/renderOffline), 30_songs.js (song
 * data + notation docs), 40_sfx.js (sound effects), 50_voice.js (optional
 * local Japanese speech synthesis). Architecture notes: docs/AUDIO.md. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {}); // internals shared by the audio files
  const G = globalThis;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  _.clamp = clamp;
  _.mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  _.AC = () => G.AudioContext || G.webkitAudioContext || null;
  _.OAC = () => G.OfflineAudioContext || G.webkitOfflineAudioContext || null;

  // ---------------------------------------------------------------- state
  const st = (_.st = {
    ctx: null,
    g: null,
    vol: { master: 0.8, music: 0.7, sfx: 0.8, voice: 1 },
    muted: false,
    ducked: false,
    hiddenSuspended: false,
    pauseWhenHidden: true,
    listening: false,
    lastError: null,
  });
  _.DEFAULT_VOL = { master: 0.8, music: 0.7, sfx: 0.8, voice: 1 };
  const hooks = (_.hooks = { init: [], mute: [], state: [] });
  function fire(list, arg) {
    for (const f of list) {
      try { f(arg); } catch (e) { /* hooks must never break audio */ }
    }
  }

  // ------------------------------------------------- per-context buffers
  // Deterministic white noise (2 s, mono) shared by every noisy voice.
  function noiseBuffer(ctx) {
    const n = Math.floor(ctx.sampleRate * 2);
    const b = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = b.getChannelData(0);
    const r = RB.util.rng(1234567);
    for (let i = 0; i < n; i++) d[i] = r() * 2 - 1;
    return b;
  }
  // Algorithmic reverb impulse: pre-delay, a few early reflections, then a
  // noise tail that decays exponentially and darkens as it decays.
  function impulse(ctx, secs, tau, seed) {
    const sr = ctx.sampleRate;
    const n = Math.floor(sr * secs);
    const buf = ctx.createBuffer(2, n, sr);
    const r = RB.util.rng(seed);
    const pre = Math.floor(sr * 0.014);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let lp = 0;
      for (let i = pre; i < n; i++) {
        const t = (i - pre) / sr;
        const a = 0.5 * Math.exp(-t / (tau * 0.8)) + 0.06; // one-pole LP coefficient
        lp += a * (r() * 2 - 1 - lp);
        const fadeTail = i > n * 0.9 ? (n - i) / (n * 0.1) : 1;
        d[i] = lp * Math.exp(-t / tau) * fadeTail;
      }
      for (let k = 0; k < 7; k++) {
        const idx = pre + Math.floor(sr * (0.004 + r() * 0.07));
        if (idx < n) d[idx] += (r() < 0.5 ? -1 : 1) * (0.15 + r() * 0.35);
      }
    }
    return buf;
  }
  // Final safety stage: linear up to 0.85, then a tanh knee that can never
  // exceed ~0.99, so nothing the game does can hard-clip the output.
  function clipCurve() {
    const n = 4096;
    const c = new Float32Array(n);
    const knee = 0.85;
    const room = 0.14;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      const ax = Math.abs(x);
      const y = ax <= knee ? ax : knee + room * Math.tanh((ax - knee) / room);
      c[i] = x < 0 ? -y : y;
    }
    return c;
  }
  _.clipCurve = clipCurve;

  // ------------------------------------------------------- node helpers
  function osc(c, type, f, t) {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    return o;
  }
  function amp(c, v) {
    const n = c.createGain();
    n.gain.value = v == null ? 0 : v;
    return n;
  }
  function bq(c, type, f, q, gdb) {
    const b = c.createBiquadFilter();
    b.type = type;
    b.frequency.value = Math.min(f, c.sampleRate * 0.45);
    if (q != null) b.Q.value = q;
    if (gdb != null) b.gain.value = gdb;
    return b;
  }
  function noise(g) {
    const s = g.ctx.createBufferSource();
    s.buffer = g.noise;
    s.loop = true;
    return s;
  }
  // Start sources at t, stop at end, and disconnect everything afterwards so
  // finished voices are garbage-collected.
  function run(c, srcs, nodes, t, end) {
    end = Math.max(end, t + 0.03);
    for (const s of srcs) {
      if (s.buffer) s.start(t, (t * 0.6180339) % 1.5);
      else s.start(t);
      s.stop(end);
    }
    srcs[0].onended = () => {
      for (const n of nodes) {
        try { n.disconnect(); } catch (e) { /* already gone */ }
      }
    };
  }
  // Linear attack -> exponential decay toward sustain -> release at `off`.
  function env(p, t, a, peak, tau, sus, off, rel) {
    p.setValueAtTime(0, t);
    p.linearRampToValueAtTime(peak, t + a);
    if (tau > 0) p.setTargetAtTime(peak * sus, t + a, tau);
    p.setTargetAtTime(0, Math.max(off, t + a + 0.002), rel);
  }
  _.node = { osc, amp, bq, noise, run, env };

  // ------------------------------------------------------------- graph
  // Builds the full mix graph for any (realtime or offline) context:
  //   music -> duck ┐
  //   sfx ──────────┼-> master -> HP -> shelf -> glue comp -> trim -> limiter -> soft clip -> out
  //   voice ────────┘
  // Music reverb returns into the music bus (so music volume/duck apply to the
  // tail); effects have their own shorter room returning into the sfx bus.
  _.buildGraph = function (ctx, vol, muted) {
    const g = { ctx, noise: noiseBuffer(ctx) };
    g.master = amp(ctx, muted ? 0 : vol.master);
    const hp = bq(ctx, 'highpass', 28, 0.7);
    const shelf = bq(ctx, 'highshelf', 6500, null, -4);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 12;
    comp.ratio.value = 2.5;
    comp.attack.value = 0.015;
    comp.release.value = 0.3;
    const trim = amp(ctx, 0.62); // offsets the compressor's automatic make-up gain
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -3;
    lim.knee.value = 0;
    lim.ratio.value = 20;
    lim.attack.value = 0.002;
    lim.release.value = 0.12;
    const clip = ctx.createWaveShaper();
    clip.curve = clipCurve();
    clip.oversample = '2x';
    g.master.connect(hp);
    hp.connect(shelf);
    shelf.connect(comp);
    comp.connect(trim);
    trim.connect(lim);
    lim.connect(clip);
    g.tap = shelf; // pre-dynamics level (tests report it as rawPeak)
    g.out = clip;

    g.music = amp(ctx, vol.music);
    g.duck = amp(ctx, 1);
    g.music.connect(g.duck);
    g.duck.connect(g.master);
    g.sfx = amp(ctx, vol.sfx);
    g.sfx.connect(g.master);
    g.voice = amp(ctx, vol.voice);
    g.voice.connect(g.master);

    g.rev = ctx.createConvolver();
    g.rev.buffer = impulse(ctx, 3.0, 0.62, 77);
    g.revIn = amp(ctx, 1);
    const revOut = amp(ctx, 0.8);
    g.revIn.connect(g.rev);
    g.rev.connect(revOut);
    revOut.connect(g.music);

    g.srev = ctx.createConvolver();
    g.srev.buffer = impulse(ctx, 1.5, 0.3, 99);
    g.srevIn = amp(ctx, 1);
    const srevOut = amp(ctx, 0.7);
    g.srevIn.connect(g.srev);
    g.srev.connect(srevOut);
    srevOut.connect(g.sfx);
    return g;
  };

  // -------------------------------------------------------- instruments
  // Signature: fn(g, out, t, freq, dur, vel). `out` is the track's input node.
  const I = (_.inst = {});

  // Plucked string (koto/guitar-ish): triangle + a little saw through a
  // lowpass whose cutoff falls quickly; natural decay, damped at note end.
  I.pluck = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const o1 = osc(c, 'triangle', f, t);
    const o2 = osc(c, 'sawtooth', f * 1.003, t);
    const m2 = amp(c, 0.2);
    const lp = bq(c, 'lowpass', 1000, 0.9);
    const a = amp(c, 0);
    lp.frequency.setValueAtTime(Math.min(f * (4 + 5 * v), 7500), t);
    lp.frequency.setTargetAtTime(Math.max(f * 1.5, 250), t + 0.004, 0.13);
    const ring = clamp(1.7 - f / 900, 0.45, 1.7);
    const pk = 0.3 * v;
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(pk, t + 0.004);
    a.gain.setTargetAtTime(0, t + 0.004, ring / 3.2);
    const off = t + Math.max(d, 0.03);
    a.gain.setTargetAtTime(0, off, 0.08);
    o1.connect(lp);
    o2.connect(m2);
    m2.connect(lp);
    lp.connect(a);
    a.connect(out);
    run(c, [o1, o2], [o1, o2, m2, lp, a], t, Math.min(off + 0.5, t + ring * 2.4));
  };

  // Harp: rounder than pluck and lets strings ring past the written length.
  I.harp = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const o1 = osc(c, 'triangle', f, t);
    const o2 = osc(c, 'sine', f * 2, t);
    const m2 = amp(c, 0.12);
    const lp = bq(c, 'lowpass', 1000, 0.6);
    const a = amp(c, 0);
    lp.frequency.setValueAtTime(Math.min(f * 6, 7000), t);
    lp.frequency.setTargetAtTime(Math.max(f * 2.2, 400), t + 0.003, 0.25);
    const ring = clamp(2.6 - f / 700, 0.7, 2.6);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(0.27 * v, t + 0.003);
    a.gain.setTargetAtTime(0, t + 0.003, ring / 3);
    const off = t + Math.max(d, 0.05) + 0.7;
    a.gain.setTargetAtTime(0, off, 0.2);
    o1.connect(lp);
    o2.connect(m2);
    m2.connect(lp);
    lp.connect(a);
    a.connect(out);
    run(c, [o1, o2], [o1, o2, m2, lp, a], t, Math.min(off + 0.9, t + ring * 2.3));
  };

  // Two-operator FM bell. ratio 3.5 = inharmonic bell, 4 = celesta/music box.
  function fmBell(g, out, t, f, d, v, ratio, idx, dec, pk, ring) {
    const c = g.ctx;
    const car = osc(c, 'sine', f, t);
    const mod = osc(c, 'sine', f * ratio, t);
    const mg = amp(c, 0);
    const a = amp(c, 0);
    const k = idx * clamp(700 / f, 0.25, 1.2); // tame brightness of high notes
    mg.gain.setValueAtTime(f * k, t);
    mg.gain.setTargetAtTime(f * k * 0.08, t, dec * 0.3);
    mod.connect(mg);
    mg.connect(car.frequency);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(pk * v, t + 0.002);
    a.gain.setTargetAtTime(0, t + 0.002, dec * 0.4);
    const off = t + Math.max(d, 0.05) + ring;
    a.gain.setTargetAtTime(0, off, 0.2);
    car.connect(a);
    a.connect(out);
    run(c, [car, mod], [car, mod, mg, a], t, Math.min(off + 1.0, t + dec * 3.3));
  }
  I.bell = (g, o, t, f, d, v) => fmBell(g, o, t, f, d, v, 3.5, 1.5, 1.5, 0.2, 0.5);
  I.celesta = (g, o, t, f, d, v) => fmBell(g, o, t, f, d, v, 4, 0.8, 0.9, 0.26, 0.35);
  I.toll = (g, o, t, f, d, v) => fmBell(g, o, t, f, d, v, 3.5, 2.0, 3.2, 0.26, 1.5);

  // Glass: near-pure sines with a slow beating pair — calm, clean, empty.
  I.glass = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const s1 = osc(c, 'sine', f, t);
    const s2 = osc(c, 'sine', f * 1.0021, t);
    const s3 = osc(c, 'sine', f * 2.002, t);
    const m3 = amp(c, 0.12);
    const a = amp(c, 0);
    const pk = 0.12 * v;
    const off = t + Math.max(d, 0.08);
    env(a.gain, t, 0.05, pk, 0.9, 0.7, off, 0.4);
    s1.connect(a);
    s2.connect(a);
    s3.connect(m3);
    m3.connect(a);
    a.connect(out);
    run(c, [s1, s2, s3], [s1, s2, s3, m3, a], t, off + 2.2);
  };

  // Breathy flute: sine + filtered triangle, pitch scoop on attack, delayed
  // vibrato, band-passed noise breath strongest at the onset.
  I.flute = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const s = osc(c, 'sine', f, t);
    const tr = osc(c, 'triangle', f, t);
    const trg = amp(c, 0.14);
    const lp = bq(c, 'lowpass', Math.min(f * 3.5, 6000), 0.5);
    s.frequency.setValueAtTime(f * 0.988, t);
    s.frequency.exponentialRampToValueAtTime(f, t + 0.07);
    tr.frequency.setValueAtTime(f * 0.988, t);
    tr.frequency.exponentialRampToValueAtTime(f, t + 0.07);
    const lfo = osc(c, 'sine', 5.1, t);
    const lg = amp(c, 0);
    if (d > 0.35) {
      lg.gain.setValueAtTime(0, t + 0.22);
      lg.gain.linearRampToValueAtTime(f * 0.0055, t + Math.min(d, 0.8));
    }
    lfo.connect(lg);
    lg.connect(s.frequency);
    lg.connect(tr.frequency);
    const n = noise(g);
    const bp = bq(c, 'bandpass', Math.min(f * 2, 7000), 1.1);
    const ng = amp(c, 0);
    const off = t + Math.max(d, 0.07);
    ng.gain.setValueAtTime(0, t);
    ng.gain.linearRampToValueAtTime(0.09 * v, t + 0.025);
    ng.gain.setTargetAtTime(0.02 * v, t + 0.03, 0.07);
    ng.gain.setTargetAtTime(0, off, 0.04);
    const a = amp(c, 0);
    env(a.gain, t, 0.055, 0.27 * v, 0.4, 0.82, off, 0.06);
    s.connect(a);
    tr.connect(trg);
    trg.connect(lp);
    lp.connect(a);
    n.connect(bp);
    bp.connect(ng);
    ng.connect(out);
    a.connect(out);
    run(c, [s, tr, lfo, n], [s, tr, trg, lp, lfo, lg, n, bp, ng, a], t, off + 0.4);
  };

  // Bowed string: two detuned saws, opening lowpass, delayed vibrato.
  I.bowed = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const s1 = osc(c, 'sawtooth', f * 0.998, t);
    const s2 = osc(c, 'sawtooth', f * 1.002, t);
    const lp = bq(c, 'lowpass', f * 1.4, 0.8);
    const hp = bq(c, 'highpass', 90, 0.7);
    lp.frequency.setValueAtTime(Math.min(f * 1.4, 3000), t);
    lp.frequency.setTargetAtTime(Math.min(f * 4.5, 4000), t, 0.3);
    const lfo = osc(c, 'sine', 5.3, t);
    const lg = amp(c, 0);
    if (d > 0.4) {
      lg.gain.setValueAtTime(0, t + 0.3);
      lg.gain.linearRampToValueAtTime(f * 0.005, t + Math.min(d, 0.9));
    }
    lfo.connect(lg);
    lg.connect(s1.frequency);
    lg.connect(s2.frequency);
    const a = amp(c, 0);
    const off = t + Math.max(d, 0.1);
    env(a.gain, t, Math.min(0.18, Math.max(0.04, d * 0.4)), 0.15 * v, 0, 1, off, 0.12);
    s1.connect(lp);
    s2.connect(lp);
    lp.connect(hp);
    hp.connect(a);
    a.connect(out);
    run(c, [s1, s2, lfo], [s1, s2, lp, hp, lfo, lg, a], t, off + 0.7);
  };

  // Soft bass: sine + triangle, lowpassed.
  I.bass = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const s = osc(c, 'sine', f, t);
    const sg = amp(c, 0.7);
    const tr = osc(c, 'triangle', f, t);
    const tg = amp(c, 0.55);
    const lp = bq(c, 'lowpass', 700 + f * 3, 0.6);
    const a = amp(c, 0);
    const off = t + Math.max(d, 0.05);
    env(a.gain, t, 0.008, 0.3 * v, 0.35, 0.75, off, 0.05);
    s.connect(sg);
    sg.connect(a);
    tr.connect(tg);
    tg.connect(lp);
    lp.connect(a);
    a.connect(out);
    run(c, [s, tr], [s, sg, tr, tg, lp, a], t, off + 0.35);
  };

  // Pad: triangle core with two detuned saws, slow swell, slowly opening LP.
  I.pad = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const o1 = osc(c, 'triangle', f, t);
    const o2 = osc(c, 'sawtooth', f * 1.006, t);
    const o3 = osc(c, 'sawtooth', f * 0.994, t);
    const sg = amp(c, 0.16);
    const lp = bq(c, 'lowpass', 400 + f, 0.4);
    lp.frequency.setValueAtTime(400 + f, t);
    lp.frequency.setTargetAtTime(Math.min(900 + f * 2, 3000), t, 0.9);
    const a = amp(c, 0);
    const off = t + Math.max(d, 0.1);
    env(a.gain, t, clamp(d * 0.4, 0.08, 0.7), 0.09 * v, 0, 1, off, 0.45);
    o1.connect(lp);
    o2.connect(sg);
    o3.connect(sg);
    sg.connect(lp);
    lp.connect(a);
    a.connect(out);
    run(c, [o1, o2, o3], [o1, o2, o3, sg, lp, a], t, off + 2.4);
  };

  // Electric-piano-like keys: 1:1 FM with decaying index.
  I.keys = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const car = osc(c, 'sine', f, t);
    const mod = osc(c, 'sine', f, t);
    const mg = amp(c, 0);
    mg.gain.setValueAtTime(f * (0.6 + 0.6 * v), t);
    mg.gain.setTargetAtTime(f * 0.12, t, 0.3);
    mod.connect(mg);
    mg.connect(car.frequency);
    const a = amp(c, 0);
    const off = t + Math.max(d, 0.05);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(0.22 * v, t + 0.004);
    a.gain.setTargetAtTime(0, t + 0.004, 1.1);
    a.gain.setTargetAtTime(0, off, 0.12);
    car.connect(a);
    a.connect(out);
    run(c, [car, mod], [car, mod, mg, a], t, off + 0.7);
  };

  // Mallet (marimba-ish): fundamental + short 4th partial.
  I.mallet = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const s1 = osc(c, 'sine', f, t);
    const s2 = osc(c, 'sine', f * 3.93, t);
    const a1 = amp(c, 0);
    const a2 = amp(c, 0);
    const dec = clamp(0.5 - f / 3000, 0.15, 0.45);
    a1.gain.setValueAtTime(0, t);
    a1.gain.linearRampToValueAtTime(0.34 * v, t + 0.003);
    a1.gain.setTargetAtTime(0, t + 0.003, dec);
    const off = t + Math.max(d, 0.05) + 0.05;
    a1.gain.setTargetAtTime(0, off, 0.07);
    a2.gain.setValueAtTime(0, t);
    a2.gain.linearRampToValueAtTime(0.08 * v, t + 0.002);
    a2.gain.setTargetAtTime(0, t + 0.002, 0.035);
    s1.connect(a1);
    s2.connect(a2);
    a1.connect(out);
    a2.connect(out);
    run(c, [s1, s2], [s1, s2, a1, a2], t, Math.min(off + 0.4, t + dec * 6));
  };

  // Choir-ish "oo/ah": detuned saws through three formant band-passes.
  I.choir = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const s1 = osc(c, 'sawtooth', f * 0.997, t);
    const s2 = osc(c, 'sawtooth', f * 1.003, t);
    const lfo = osc(c, 'sine', 4.7, t);
    const lg = amp(c, 0);
    lg.gain.setValueAtTime(0, t + 0.2);
    lg.gain.linearRampToValueAtTime(f * 0.004, t + 0.8);
    lfo.connect(lg);
    lg.connect(s1.frequency);
    lg.connect(s2.frequency);
    const mix = amp(c, 1);
    s1.connect(mix);
    s2.connect(mix);
    const b1 = bq(c, 'bandpass', 520, 3.5);
    const b2 = bq(c, 'bandpass', 900, 4.5);
    const b3 = bq(c, 'bandpass', 2500, 7);
    const g1 = amp(c, 1);
    const g2 = amp(c, 0.55);
    const g3 = amp(c, 0.12);
    const lp = bq(c, 'lowpass', 3200, 0.5);
    mix.connect(b1);
    mix.connect(b2);
    mix.connect(b3);
    b1.connect(g1);
    b2.connect(g2);
    b3.connect(g3);
    g1.connect(lp);
    g2.connect(lp);
    g3.connect(lp);
    const a = amp(c, 0);
    const off = t + Math.max(d, 0.1);
    env(a.gain, t, clamp(d * 0.5, 0.1, 0.45), 0.42 * v, 0, 1, off, 0.35);
    lp.connect(a);
    a.connect(out);
    run(c, [s1, s2, lfo], [s1, s2, lfo, lg, mix, b1, b2, b3, g1, g2, g3, lp, a], t, off + 1.8);
  };

  // ---------------------------------------------------------- percussion
  // Signature: fn(g, out, t, vel, seed) — seed in [0,1) varies small details.
  const P = (_.perc = {});
  function thump(g, out, t, v, f0, f1, sweep, tau, pk) {
    const c = g.ctx;
    const s = osc(c, 'sine', f0, t);
    s.frequency.exponentialRampToValueAtTime(f1, t + sweep);
    const a = amp(c, 0);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(pk * v, t + 0.003);
    a.gain.setTargetAtTime(0, t + 0.003, tau);
    s.connect(a);
    a.connect(out);
    run(c, [s], [s, a], t, t + tau * 7);
  }
  function hiss(g, out, t, v, type, f, q, att, tau, pk) {
    const c = g.ctx;
    const n = noise(g);
    const fl = bq(c, type, f, q);
    const a = amp(c, 0);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(pk * v, t + att);
    a.gain.setTargetAtTime(0, t + att, tau);
    n.connect(fl);
    fl.connect(a);
    a.connect(out);
    run(c, [n], [n, fl, a], t, t + att + tau * 7);
  }
  function ping(g, out, t, v, f, tau, pk) {
    const c = g.ctx;
    const s = osc(c, 'sine', f, t);
    const a = amp(c, 0);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(pk * v, t + 0.001);
    a.gain.setTargetAtTime(0, t + 0.001, tau);
    s.connect(a);
    a.connect(out);
    run(c, [s], [s, a], t, t + tau * 7 + 0.01);
  }
  _.voice = { thump, hiss, ping };

  P.k = (g, o, t, v) => { // soft kick
    thump(g, o, t, v, 110, 46, 0.11, 0.11, 0.42);
    hiss(g, o, t, v, 'lowpass', 1800, 0.7, 0.001, 0.01, 0.08);
  };
  P.t = (g, o, t, v) => { // hand tom
    thump(g, o, t, v, 190, 118, 0.16, 0.13, 0.34);
    hiss(g, o, t, v, 'bandpass', 400, 1, 0.001, 0.03, 0.06);
  };
  P.l = (g, o, t, v) => { // low drum (soft, taiko-sized but gentle)
    thump(g, o, t, v, 92, 56, 0.3, 0.22, 0.36);
    hiss(g, o, t, v, 'lowpass', 220, 0.7, 0.002, 0.06, 0.15);
  };
  P.o = (g, o, t, v) => { // big drum (taiko-sized, full weight: boss fights)
    thump(g, o, t, v, 132, 44, 0.16, 0.22, 0.6);
    thump(g, o, t, v, 72, 40, 0.28, 0.3, 0.28);
    hiss(g, o, t, v, 'lowpass', 900, 0.8, 0.001, 0.02, 0.2);
  };
  P.n = (g, o, t, v) => { // frame-drum snap (a bright backbeat)
    hiss(g, o, t, v, 'bandpass', 2200, 0.9, 0.001, 0.07, 0.32);
    thump(g, o, t, v, 240, 170, 0.05, 0.05, 0.18);
  };
  P.s = (g, o, t, v) => hiss(g, o, t, v, 'bandpass', 5200, 0.8, 0.012, 0.04, 0.28); // shaker
  P.b = (g, o, t, v) => hiss(g, o, t, v, 'bandpass', 2600, 0.6, 0.015, 0.07, 0.18); // brush
  P.w = (g, o, t, v) => { // woodblock
    ping(g, o, t, v, 820, 0.022, 0.2);
    ping(g, o, t, v, 1230, 0.016, 0.08);
  };
  P.h = (g, o, t, v) => { // high woodblock
    ping(g, o, t, v, 1180, 0.02, 0.17);
    ping(g, o, t, v, 1770, 0.014, 0.06);
  };
  P.r = (g, o, t, v) => { // rim click
    hiss(g, o, t, v, 'bandpass', 1800, 4, 0.001, 0.012, 0.2);
    ping(g, o, t, v, 540, 0.018, 0.12);
  };
  P.p = (g, o, t, v) => { // hand pat
    hiss(g, o, t, v, 'bandpass', 1000, 1.2, 0.002, 0.025, 0.18);
    ping(g, o, t, v, 170, 0.03, 0.15);
  };
  P.x = (g, o, t, v) => { // clock tick
    ping(g, o, t, v, 2000, 0.012, 0.1);
    hiss(g, o, t, v, 'bandpass', 3500, 2, 0.001, 0.008, 0.08);
  };
  P.g = (g, o, t, v) => { // glass tick (the Hush's metronome)
    ping(g, o, t, v, 1760, 0.16, 0.06);
    ping(g, o, t, v, 3537, 0.05, 0.006);
  };
  P.d = (g, o, t, v, seed) => { // water drop
    const c = g.ctx;
    const f0 = 800 + (seed || 0.5) * 700;
    const s = osc(c, 'sine', f0, t);
    s.frequency.exponentialRampToValueAtTime(f0 * 1.8, t + 0.05);
    const a = amp(c, 0);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(0.16 * v, t + 0.002);
    a.gain.setTargetAtTime(0, t + 0.002, 0.035);
    s.connect(a);
    a.connect(o);
    run(c, [s], [s, a], t, t + 0.3);
  };
  P.c = (g, o, t, v, seed) => { // wooden creak (waterwheel axle)
    const c = g.ctx;
    const f0 = 30 + (seed || 0.5) * 8;
    const s = osc(c, 'sawtooth', f0, t);
    s.frequency.linearRampToValueAtTime(f0 * 1.45, t + 0.5);
    const lfo = osc(c, 'sine', 8.5, t);
    const lg = amp(c, f0 * 0.3);
    lfo.connect(lg);
    lg.connect(s.frequency);
    const b1 = bq(c, 'bandpass', 850, 5);
    const b2 = bq(c, 'bandpass', 1500, 6);
    const a = amp(c, 0);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(0.35 * v, t + 0.12);
    a.gain.setTargetAtTime(0, t + 0.4, 0.08);
    s.connect(b1);
    s.connect(b2);
    b1.connect(a);
    b2.connect(a);
    a.connect(o);
    run(c, [s, lfo], [s, lfo, lg, b1, b2, a], t, t + 0.9);
  };
  P.j = (g, o, t, v, seed) => { // small jingle bells, very soft
    const fs = [2637, 3322, 3951, 4699];
    for (let k = 0; k < 2; k++) {
      const tk = t + k * 0.035;
      for (let i = 0; i < fs.length; i++) {
        ping(g, o, tk + i * 0.003, v, fs[i] * (1 + ((seed || 0) - 0.5) * 0.01), 0.05 + i * 0.015, 0.018);
      }
    }
  };

  // ------------------------------------------------------ public: context
  A.supported = () => !!_.AC();
  A.ready = () => !!(st.ctx && st.ctx.state === 'running');
  A.state = () => ({
    supported: !!_.AC(),
    context: st.ctx ? st.ctx.state : 'none',
    muted: st.muted,
    volumes: Object.assign({}, st.vol),
    song: A.currentSong ? A.currentSong() : null,
    error: st.lastError,
  });
  A.getVolume = (bus) => st.vol[bus];
  A.isMuted = () => st.muted;
  A.setPauseWhenHidden = (b) => { st.pauseWhenHidden = !!b; };

  function resume() {
    const c = st.ctx;
    if (!c || c.state === 'running' || c.state === 'closed') return Promise.resolve();
    try {
      const p = c.resume();
      return p && p.catch ? p.catch(() => {}) : Promise.resolve();
    } catch (e) {
      return Promise.resolve();
    }
  }
  _.resume = resume;

  function installListeners() {
    if (st.listening || typeof document === 'undefined' || !document.addEventListener) return;
    st.listening = true;
    // Any later gesture revives a context that the browser suspended or
    // interrupted (iOS calls, other audio apps, device switches, autoplay).
    const kick = () => {
      const c = st.ctx;
      if (!c || c.state === 'running' || c.state === 'closed') return;
      if (st.hiddenSuspended && document.hidden) return;
      resume();
    };
    for (const ev of ['pointerdown', 'mousedown', 'touchend', 'keydown']) {
      document.addEventListener(ev, kick, { capture: true, passive: true });
    }
    document.addEventListener('visibilitychange', () => {
      const c = st.ctx;
      if (!c || c.state === 'closed') return;
      if (document.hidden) {
        if (st.pauseWhenHidden && c.state === 'running') {
          st.hiddenSuspended = true;
          try { c.suspend().catch(() => {}); } catch (e) { /* ignore */ }
        }
      } else if (st.hiddenSuspended) {
        st.hiddenSuspended = false;
        resume();
      }
    });
    const md = G.navigator && G.navigator.mediaDevices;
    if (md && md.addEventListener) {
      md.addEventListener('devicechange', () => {
        // Browsers normally follow the new default output on their own; if the
        // switch left the context suspended, try to resume (or wait for a gesture).
        if (st.ctx && st.ctx.state !== 'running' && !st.hiddenSuspended) resume();
        fire(hooks.state, 'devicechange');
      });
    }
  }

  // Creates (or revives) the AudioContext. Call from a user gesture.
  // Idempotent; returns Promise<boolean ready>.
  A.init = function () {
    const C = _.AC();
    if (!C) return Promise.resolve(false);
    let fresh = false;
    if (!st.ctx || st.ctx.state === 'closed') {
      let ctx = null;
      try {
        ctx = new C({ latencyHint: 'interactive' });
      } catch (e) {
        try { ctx = new C(); } catch (e2) { st.lastError = String(e2 && e2.message); return Promise.resolve(false); }
      }
      try {
        st.g = _.buildGraph(ctx, st.vol, st.muted);
        if (st.ducked) st.g.duck.gain.value = 0.3;
        st.g.out.connect(ctx.destination);
      } catch (e) {
        st.lastError = String(e && e.message);
        try { ctx.close(); } catch (e2) { /* ignore */ }
        return Promise.resolve(false);
      }
      st.ctx = ctx;
      ctx.onstatechange = () => fire(hooks.state, ctx.state);
      installListeners();
      fresh = true;
    }
    const p = resume(); // synchronous call inside the gesture (Safari needs this)
    if (fresh) fire(hooks.init);
    return p.then(() => A.ready());
  };

  function ramp(param, v, tc) {
    const c = st.ctx;
    if (!c) return;
    const now = c.currentTime;
    param.cancelScheduledValues(now);
    param.setTargetAtTime(v, now, tc);
  }

  A.setVolume = function (bus, v) {
    if (!(bus in st.vol)) return;
    v = clamp(Number(v), 0, 1);
    if (!(v === v)) return; // NaN
    st.vol[bus] = v;
    const g = st.g;
    if (!g) return;
    if (bus === 'master') ramp(g.master.gain, st.muted ? 0 : v, 0.03);
    else ramp(g[bus].gain, v, 0.03);
  };

  A.setMuted = function (b) {
    b = !!b;
    const changed = b !== st.muted;
    st.muted = b;
    if (st.g) ramp(st.g.master.gain, b ? 0 : st.vol.master, 0.03);
    if (changed) fire(hooks.mute, b);
  };

  // Lower music under speech. Effects are left alone.
  A.duck = function (on) {
    st.ducked = !!on;
    if (st.g) ramp(st.g.duck.gain, on ? 0.3 : 1, on ? 0.08 : 0.35);
  };
})(RB.audio);
