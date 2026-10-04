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
    // Nothing below the low mids goes into the hall: its tail darkens as it
    // decays, so the low end of every hard attack (a shamisen stroke, a
    // shakuhachi puff, a drum) came back as a long deep rush, like surf
    // breaking under the music. The dry sound keeps its low end.
    const revHp = bq(ctx, 'highpass', 300, 0.54);
    const revHp2 = bq(ctx, 'highpass', 300, 1.31); // with the first: a steep (4th-order Butterworth) cut
    g.revIn.connect(revHp);
    revHp.connect(revHp2);
    revHp2.connect(g.rev);
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

  // ------------------------------------------- Japanese instruments (wagakki)
  // Same rules as the voices above — envelopes on the audio clock, the shared
  // deterministic noise buffer, nothing created at load time except a small
  // Float32Array curve — with one difference that keeps them light enough for
  // phones: their filters are FIXED and SHARED. A note never automates a
  // filter (a biquad whose frequency moves recomputes its coefficients every
  // sample); brightness that changes over a note is made with gains instead
  // (a bright path that fades fast beside a duller one). And a fixed filter
  // is created once per track strip and reused by every note on that track:
  // filtering is linear, so filtering the sum of the notes is the same as
  // filtering each note. A note itself owns only oscillators and gains
  // (at most 12 nodes), and its short parts (plectrum click, body thump,
  // pick "ting") stop as soon as they are inaudible. Everything works the
  // same in the live and the offline context (the cache lives on the graph).

  // A node chain built once per (graph, track strip, key) and reused.
  function shared(g, out, key, make) {
    if (!g.shared) g.shared = new WeakMap();
    let m = g.shared.get(out);
    if (!m) {
      m = new Map();
      g.shared.set(out, m);
    }
    let n = m.get(key);
    if (!n) {
      n = make();
      m.set(key, n);
    }
    return n;
  }
  // frequencies of shared filters snap to quarter-octave steps, so a track
  // owns at most a few dozen of them
  const snap = (f) => Math.pow(2, Math.round(Math.log2(Math.max(20, f)) * 4) / 4);
  function sbq(g, out, type, f, q) {
    const fs = snap(f);
    return shared(g, out, type + fs + ':' + q, () => {
      const b = bq(g.ctx, type, fs, q);
      b.connect(out);
      return b;
    });
  }
  _.shared = { shared, sbq, snap };

  // Sawari: on the shamisen and the biwa the lowest string touches a raised
  // spot near the nut, so every vibration is clipped unevenly — a bright,
  // buzzing "zing" that keeps ringing after the plucked tone has dulled. An
  // asymmetric clipping curve turns the string's periodic wave into that
  // buzz (harmonics of the note, not noise), band-passed into the region
  // where the ear hears the zing. The clipper is shared by a track's notes
  // (overlapping strings buzz against each other, as on the instrument).
  let SAWARI = null;
  function sawariCurve() {
    if (SAWARI) return SAWARI;
    const n = 1024;
    SAWARI = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      SAWARI[i] = x > 0 ? Math.tanh(5 * x) : -0.3 * Math.tanh(-2 * x) + 0.12 * x * x;
    }
    return SAWARI;
  }
  // Pitch helper: every oscillator in `list` starts at f*r0 and settles at f.
  function glide(list, f, t, r0, hold, secs) {
    for (const o of list) {
      o.frequency.setValueAtTime(f * r0, t);
      if (hold > 0) o.frequency.setValueAtTime(f * r0, t + hold);
      o.frequency.exponentialRampToValueAtTime(f, t + hold + secs);
    }
  }
  // a gain with a plucked envelope (instant rise, exponential fall, damped at `off`)
  function plk(c, t, pk, tau, off, rel) {
    const a = amp(c, 0);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(pk, t + 0.0015);
    a.gain.setTargetAtTime(0, t + 0.0015, tau);
    if (off != null) a.gain.setTargetAtTime(0, off, rel);
    return a;
  }

  // Plucked lute shared by the shamisen and the biwa. The string (a saw,
  // plus an optional second wave for body) is heard three ways: raw with a
  // very fast decay (the strike), through the track's fixed low-pass with
  // the note's own decay (the tone), and through the track's sawari clipper
  // (the buzz, which rings longer than the strike's brightness). Then the
  // plectrum (bachi) clicks on string and skin, and the skin-covered body
  // answers with a short low "tsun". The string starts sharp — the tension
  // of the strike — and drops into tune.
  // saw + mix × triangle as one periodic wave (the biwa's rounder string),
  // not normalised, so it matches the two oscillators it replaces
  function luteWave(g, mix) {
    const key = 'luteWave' + mix;
    if (g[key]) return g[key];
    const H = 48;
    const re = new Float32Array(H);
    const im = new Float32Array(H);
    for (let n = 1; n < H; n++) {
      im[n] = (2 / (Math.PI * n)) * (n % 2 ? 1 : -1);
      if (n % 2) im[n] += mix * (8 / (Math.PI * Math.PI * n * n)) * ((n - 1) / 2 % 2 ? -1 : 1);
    }
    try {
      g[key] = g.ctx.createPeriodicWave(re, im, { disableNormalization: true });
    } catch (e) {
      g[key] = g.ctx.createPeriodicWave(re, im);
    }
    return g[key];
  }
  function lute(g, out, t, f, d, v, o) {
    const c = g.ctx;
    const o1 = osc(c, 'sawtooth', f, t);
    if (o.mix2) o1.setPeriodicWave(luteWave(g, o.mix2));
    const srcs = [o1];
    const nodes = [o1];
    const src = o1;
    glide(srcs, f, t, o.drop, 0, o.dropT);
    const off = t + Math.max(d, 0.04);
    const dec = clamp(o.dec - f / 2600, o.dec * 0.35, o.dec);
    const aB = plk(c, t, o.pk * o.strike * v, o.close);
    const a = plk(c, t, o.pk * v, dec, off, 0.05);
    const sg = plk(c, t, v, dec * o.buzzLen, off, 0.07);
    const buzz = shared(g, out, 'sawari' + o.buzzF, () => {
      const drive = amp(c, o.drive);
      const ws = c.createWaveShaper();
      ws.curve = sawariCurve();
      const bp = bq(c, 'bandpass', o.buzzF, o.buzzQ);
      // the asymmetric clip also makes a slow offset and low difference tones
      // (worst under chords); they came through the band-pass's skirt as a
      // dark smear after every stroke, so they are cut here
      const hp = bq(c, 'highpass', o.buzzF * 0.35, 0.7);
      const lvl = amp(c, o.buzz);
      drive.connect(ws);
      ws.connect(bp);
      bp.connect(hp);
      hp.connect(lvl);
      lvl.connect(out);
      return drive;
    });
    src.connect(aB);
    aB.connect(out);
    src.connect(a);
    a.connect(sbq(g, out, 'lowpass', Math.min(Math.max(f * o.settle, o.floor), 8000), o.q));
    src.connect(sg);
    sg.connect(buzz);
    nodes.push(aB, a, sg);
    run(c, srcs, nodes, t, Math.min(off + 0.32, t + dec * Math.max(4.5, o.buzzLen * 4)));
    // bachi: a click of the plectrum on string and skin
    const n = noise(g);
    const ng = plk(c, t, o.click * v, o.clickT);
    n.connect(ng);
    ng.connect(sbq(g, out, 'bandpass', o.clickF, 0.9));
    run(c, [n], [n, ng], t, t + o.clickT * 8);
    // the body's "tsun"
    const sk = osc(c, 'sine', o.body, t);
    sk.frequency.exponentialRampToValueAtTime(o.body * 0.72, t + 0.05);
    const skg = plk(c, t, o.thump * v, 0.03);
    sk.connect(skg);
    skg.connect(out);
    run(c, [sk], [sk, skg], t, t + 0.24);
  }
  // Shamisen: bright and dry, a short body decay, the sawari ringing on.
  I.shamisen = (g, o, t, f, d, v) => lute(g, o, t, f, d, v, {
    mix2: 0, drop: 1.02, dropT: 0.045, q: 1.2, strike: 0.6, settle: 5, floor: 900, close: 0.035,
    dec: 0.3, pk: 0.2, drive: 2, buzz: 0.34, buzzQ: 0.9, buzzF: 2900, buzzLen: 2.6,
    click: 0.2, clickF: 2600, clickT: 0.008, body: 200, thump: 0.1,
  });
  // Biwa: lower, rounder strings, a heavier bachi on the body, a longer and
  // stronger buzz (the biwa's frets are built for sawari).
  I.biwa = (g, o, t, f, d, v) => lute(g, o, t, f, d, v, {
    mix2: 0.5, drop: 1.032, dropT: 0.07, q: 1, strike: 0.55, settle: 3.5, floor: 500, close: 0.05,
    dec: 0.7, pk: 0.24, drive: 2.4, buzz: 0.5, buzzQ: 0.9, buzzF: 1800, buzzLen: 2.8,
    click: 0.28, clickF: 1200, clickT: 0.012, body: 140, thump: 0.16,
  });

  // Koto: thirteen plucked silk strings over a long wooden body. A rounded
  // core (triangle + octave) that rings long, a saw that is loud only at the
  // strike (the ivory pick's brightness), an inharmonic "ting" from the pick
  // (tsume) and a click. `press` > 0 is ato-oshi (oshide): the string is
  // plucked a whole tone low and pressed up to the written note behind the
  // bridge.
  // the koto's sustained core: a triangle with its octave partial, as one
  // periodic wave (one oscillator per string instead of two)
  function kotoWave(g) {
    if (g.kotoWave) return g.kotoWave;
    const re = new Float32Array(10);
    const im = new Float32Array(10);
    im[1] = 1;
    im[2] = 0.22;
    for (let k = 3; k < 10; k += 2) im[k] = (k % 4 === 1 ? 1 : -1) / (k * k);
    g.kotoWave = g.ctx.createPeriodicWave(re, im);
    return g.kotoWave;
  }
  function koto(g, out, t, f, d, v, press) {
    const c = g.ctx;
    const o1 = c.createOscillator();
    o1.setPeriodicWave(kotoWave(g));
    o1.frequency.setValueAtTime(f, t);
    const o3 = osc(c, 'sawtooth', f, t);
    const tg = osc(c, 'sine', f * 3.01, t);
    if (press) glide([o1, o3, tg], f, t, Math.pow(2, -press / 12), 0.06, 0.13);
    else glide([o1, o3, tg], f, t, 1.006, 0, 0.03);
    const ring = clamp(3.2 - f / 450, 0.9, 3.2);
    const off = t + Math.max(d, 0.05) + 0.25;
    const a = plk(c, t, 0.31 * v, ring / 3, off, 0.15);
    const m3 = plk(c, t, 0.3 * v, 0.07);
    o1.connect(a);
    a.connect(out);
    o3.connect(m3);
    m3.connect(out);
    run(c, [o1], [o1, a], t, Math.min(off + 0.65, t + ring * 2.4));
    run(c, [o3], [o3, m3], t, t + 0.32);
    const tgg = plk(c, t, 0.12 * v, 0.08);
    tg.connect(tgg);
    tgg.connect(out);
    run(c, [tg], [tg, tgg], t, t + 0.38);
    const n = noise(g);
    const ng = plk(c, t, 0.1 * v, 0.006);
    n.connect(ng);
    ng.connect(sbq(g, out, 'bandpass', 3600, 1.2));
    run(c, [n], [n, ng], t, t + 0.05);
  }
  I.koto = (g, o, t, f, d, v) => koto(g, o, t, f, d, v, 0);
  I.koto_oshi = (g, o, t, f, d, v) => koto(g, o, t, f, d, v, 2);

  // Shakuhachi: end-blown bamboo. Far more breath than the flute — a pitched
  // edge-tone hiss around the note plus a wide band of air — a meri scoop
  // (the note starts nearly a semitone flat and is lifted into tune), a
  // slow, wide, late vibrato, and on accented notes a burst of breath
  // (muraiki).
  // the shakuhachi's breath band: a high-pass a little under the note into a
  // band-pass above it, both fixed and shared by the track's notes
  function breathBand(g, out, f) {
    const hp = snap(f * 0.85);
    const bp = snap(Math.min(f * 1.6, 7000));
    return shared(g, out, 'breath' + hp + ':' + bp, () => {
      const h = bq(g.ctx, 'highpass', hp, 0.7);
      const b = bq(g.ctx, 'bandpass', bp, 3);
      h.connect(b);
      b.connect(out);
      return h;
    });
  }
  I.shakuhachi = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const s = osc(c, 'sine', f, t);
    const tr = osc(c, 'triangle', f, t);
    const scoop = Math.min(0.24, Math.max(0.09, d * 0.35));
    glide([s, tr], f, t, Math.pow(2, -0.85 / 12), 0.025, scoop);
    const lfo = osc(c, 'sine', 4.3, t);
    const lg = amp(c, 0);
    if (d > 0.5) {
      lg.gain.setValueAtTime(0, t + 0.35);
      lg.gain.linearRampToValueAtTime(f * 0.009, t + Math.min(d, 1.5));
    }
    lfo.connect(lg);
    lg.connect(s.frequency);
    lg.connect(tr.frequency);
    const off = t + Math.max(d, 0.08);
    // The breath: a short puff at the start of the note settling to a thin
    // stream, band-passed around the note with everything below the note
    // taken off first. (It was louder and reached down to the bass, and
    // through the long reverb every note left a deep rush behind it like a
    // wave breaking: the owner heard it as a crashing instrument of its own.)
    const n = noise(g);
    const ng = amp(c, 0);
    const muraiki = clamp((v - 0.85) * 2.5, 0, 0.6);
    ng.gain.setValueAtTime(0, t);
    ng.gain.linearRampToValueAtTime((0.4 + muraiki) * v, t + 0.03);
    ng.gain.setTargetAtTime(0.1 * v, t + 0.035, 0.08 + muraiki * 0.12);
    ng.gain.setTargetAtTime(0, off, 0.05);
    const hg = amp(c, 0);
    hg.gain.setValueAtTime(0, t);
    hg.gain.linearRampToValueAtTime(0.035 * v, t + 0.04);
    hg.gain.setTargetAtTime(0.015 * v, t + 0.05, 0.15);
    hg.gain.setTargetAtTime(0, off, 0.05);
    const att = clamp(d * 0.25, 0.06, 0.18);
    const a = amp(c, 0);
    env(a.gain, t, att, 0.25 * v, 0.5, 0.85, off, 0.09);
    const at = amp(c, 0);
    env(at.gain, t, att, 0.06 * v, 0.5, 0.85, off, 0.09);
    s.connect(a);
    a.connect(out);
    tr.connect(at);
    at.connect(sbq(g, out, 'lowpass', Math.min(f * 3, 5000), 0.6));
    n.connect(ng);
    ng.connect(breathBand(g, out, f));
    n.connect(hg);
    hg.connect(sbq(g, out, 'highpass', 3200, 0.7));
    run(c, [s, tr, lfo, n], [s, tr, lfo, lg, n, ng, hg, a, at], t, off + 0.45);
  };

  // Shinobue: the high bamboo festival flute — bright (some square in the
  // tone), a little breath, a quick grace from a whole tone above (a finger
  // "hit", uchi) on notes long enough to carry it, a fast shallow vibrato.
  I.shinobue = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const s = osc(c, 'sine', f, t);
    const tr = osc(c, 'triangle', f, t);
    const trg = amp(c, 0.45);
    const sq = osc(c, 'square', f, t);
    const sqg = amp(c, 0.16);
    if (d >= 0.22) glide([s, tr, sq], f, t, Math.pow(2, 2 / 12), 0.022, 0.012);
    else glide([s, tr, sq], f, t, Math.pow(2, -0.25 / 12), 0, 0.03);
    const lfo = osc(c, 'sine', 5.9, t);
    const lg = amp(c, 0);
    if (d > 0.3) {
      lg.gain.setValueAtTime(0, t + 0.18);
      lg.gain.linearRampToValueAtTime(f * 0.0045, t + Math.min(d, 0.7));
    }
    lfo.connect(lg);
    lg.connect(s.frequency);
    lg.connect(tr.frequency);
    lg.connect(sq.frequency);
    const off = t + Math.max(d, 0.06);
    const n = noise(g);
    const ng = amp(c, 0);
    ng.gain.setValueAtTime(0, t);
    ng.gain.linearRampToValueAtTime(0.25 * v, t + 0.015);
    ng.gain.setTargetAtTime(0.09 * v, t + 0.02, 0.06);
    ng.gain.setTargetAtTime(0, off, 0.04);
    const a = amp(c, 0);
    env(a.gain, t, 0.02, 0.2 * v, 0.35, 0.8, off, 0.05);
    const ab = amp(c, 0);
    env(ab.gain, t, 0.02, 0.2 * v, 0.35, 0.8, off, 0.05);
    s.connect(a);
    a.connect(out);
    tr.connect(trg);
    trg.connect(ab);
    sq.connect(sqg);
    sqg.connect(ab);
    ab.connect(sbq(g, out, 'lowpass', Math.min(f * 7, 10000), 0.7));
    n.connect(ng);
    ng.connect(sbq(g, out, 'bandpass', Math.min(f * 2.5, 9000), 1.5));
    run(c, [s, tr, sq, lfo, n], [s, tr, trg, sq, sqg, lfo, lg, n, ng, a, ab], t, off + 0.35);
  };

  // Shō: the free-reed mouth organ of gagaku. A reedy periodic wave (all
  // harmonics, odd ones a little stronger) on two slightly detuned
  // oscillators, a slow swell and a slow release; meant for held clusters.
  function shoWave(g) {
    if (g.shoWave) return g.shoWave;
    const H = 14;
    const re = new Float32Array(H);
    const im = new Float32Array(H);
    for (let k = 1; k < H; k++) im[k] = (k % 2 ? 1 : 0.6) / Math.pow(k, 0.7);
    g.shoWave = g.ctx.createPeriodicWave(re, im);
    return g.shoWave;
  }
  I.sho = function (g, out, t, f, d, v) {
    const c = g.ctx;
    const w = shoWave(g);
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    o1.setPeriodicWave(w);
    o2.setPeriodicWave(w);
    o1.frequency.setValueAtTime(f * 0.9985, t);
    o2.frequency.setValueAtTime(f * 1.0015, t);
    const a = amp(c, 0);
    const off = t + Math.max(d, 0.2);
    env(a.gain, t, clamp(d * 0.4, 0.25, 0.9), 0.05 * v, 0, 1, off, 0.5);
    o1.connect(a);
    o2.connect(a);
    a.connect(sbq(g, out, 'lowpass', Math.min(f * 8, 7000), 0.5));
    run(c, [o1, o2], [o1, o2, a], t, off + 2.6);
  };

  // Rin: a struck bowl bell. Bowl modes at about 1 : 2.76 : 5.2, the lower
  // two as slightly mistuned pairs so they beat slowly, and a long ring
  // (faded out at about -30 dB so a voice does not live for ten seconds).
  function rin(g, out, t, f, v, len) {
    const c = g.ctx;
    const parts = [[1, 0.055, 1.6 * len, 0.7], [2.76, 0.03, 0.8 * len, 1.6], [5.2, 0.026, 0.32 * len, 0]];
    const srcs = [];
    const nodes = [];
    const end = t + 1.6 * len * 3.4;
    const a = amp(c, 1);
    a.gain.setValueAtTime(1, end - 0.5);
    a.gain.linearRampToValueAtTime(0, end - 0.02);
    for (const [r, pk, tau, beat] of parts) {
      for (const dt of beat ? [0, beat] : [0]) {
        const s = osc(c, 'sine', f * r + dt, t);
        const sg = amp(c, 0);
        sg.gain.setValueAtTime(0, t);
        sg.gain.linearRampToValueAtTime(pk * v, t + 0.002);
        sg.gain.setTargetAtTime(0, t + 0.002, tau);
        s.connect(sg);
        sg.connect(a);
        srcs.push(s);
        nodes.push(s, sg);
      }
    }
    a.connect(out);
    nodes.push(a);
    run(c, srcs, nodes, t, end);
  }
  I.rin = (g, o, t, f, d, v) => rin(g, o, t, f, v, 1);

  // ---------------------------------------------------------- percussion
  // Signature: fn(g, out, t, vel, seed) — seed in [0,1) varies small details.
  const P = (_.perc = {});
  // `k` (optional): how many time constants a stroke lives (default 7, about
  // -60 dB); the Japanese percussion uses 4.5 (about -40 dB) to save voices.
  function thump(g, out, t, v, f0, f1, sweep, tau, pk, k) {
    const c = g.ctx;
    const s = osc(c, 'sine', f0, t);
    s.frequency.exponentialRampToValueAtTime(f1, t + sweep);
    const a = amp(c, 0);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(pk * v, t + 0.003);
    a.gain.setTargetAtTime(0, t + 0.003, tau);
    s.connect(a);
    a.connect(out);
    run(c, [s], [s, a], t, t + tau * (k || 7));
  }
  function hiss(g, out, t, v, type, f, q, att, tau, pk, k) {
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
    run(c, [n], [n, fl, a], t, t + att + tau * (k || 7));
  }
  // hiss through the track's shared fixed filter (the Japanese percussion:
  // see the note on shared filters above the wagakki)
  function hissS(g, out, t, v, type, f, q, att, tau, pk, k) {
    const c = g.ctx;
    const n = noise(g);
    const a = amp(c, 0);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(pk * v, t + att);
    a.gain.setTargetAtTime(0, t + att, tau);
    n.connect(a);
    a.connect(sbq(g, out, type, f, q));
    run(c, [n], [n, a], t, t + att + tau * (k || 7));
  }
  function ping(g, out, t, v, f, tau, pk, k) {
    const c = g.ctx;
    const s = osc(c, 'sine', f, t);
    const a = amp(c, 0);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(pk * v, t + 0.001);
    a.gain.setTargetAtTime(0, t + 0.001, tau);
    s.connect(a);
    a.connect(out);
    run(c, [s], [s, a], t, t + tau * (k || 7) + 0.01);
  }
  _.voice = { thump, hiss, ping, rin };

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

  // ------------------------------------------ Japanese percussion (wadaiko …)
  P.z = (g, o, t, v) => { // ōdaiko "don": deep membrane, a higher mode, rumble, skin slap
    thump(g, o, t, v, 104, 58, 0.2, 0.34, 0.5, 4.5);
    thump(g, o, t, v, 168, 128, 0.12, 0.09, 0.14, 4.5);
    // the rumble is a short shiver under the boom, not a wash (it was 0.22 for 0.16 s)
    hissS(g, o, t, v, 'lowpass', 240, 0.7, 0.003, 0.09, 0.12, 4.5);
    hissS(g, o, t, v, 'bandpass', 950, 1, 0.001, 0.016, 0.24, 4.5);
  };
  P.e = (g, o, t, v) => { // shime-daiko "ten": tight, high, dry
    thump(g, o, t, v, 360, 300, 0.035, 0.05, 0.3, 4.5);
    thump(g, o, t, v, 560, 520, 0.02, 0.025, 0.08, 4.5);
    hissS(g, o, t, v, 'bandpass', 2900, 1.3, 0.001, 0.018, 0.2, 4.5);
  };
  P.f = (g, o, t, v) => { // taiko rim "ka" (fuchi): wood on wood
    ping(g, o, t, v, 1450, 0.018, 0.16, 4.5);
    ping(g, o, t, v, 2650, 0.01, 0.07, 4.5);
    hissS(g, o, t, v, 'bandpass', 3300, 2, 0.001, 0.006, 0.12, 4.5);
  };
  P.m = (g, o, t, v) => { // kotsuzumi "pon": a hollow pitched tone that sags as the ropes relax
    thump(g, o, t, v, 470, 396, 0.12, 0.15, 0.28, 4.5);
    ping(g, o, t, v, 1090, 0.045, 0.05, 4.5);
    hissS(g, o, t, v, 'bandpass', 1800, 1.5, 0.001, 0.01, 0.1, 4.5);
  };
  P.q = (g, o, t, v) => { // ōtsuzumi "kan": hard dry skin, a sharp crack, almost no ring
    hissS(g, o, t, v, 'bandpass', 3300, 2.2, 0.001, 0.028, 0.4, 4.5);
    ping(g, o, t, v, 1250, 0.024, 0.17, 4.5);
    ping(g, o, t, v, 2900, 0.012, 0.07, 4.5);
  };
  P.y = (g, o, t, v) => { // hyōshigi: two hardwood clappers
    ping(g, o, t, v, 2300, 0.034, 0.15, 4.5);
    ping(g, o, t, v, 3550, 0.022, 0.065, 4.5);
    ping(g, o, t, v, 5200, 0.01, 0.03, 4.5);
    hissS(g, o, t, v, 'bandpass', 4200, 1.5, 0.001, 0.004, 0.12, 4.5);
  };
  P.a = (g, o, t, v, seed) => { // atarigane: small festival hand gong (plate modes)
    const f = 1150 * (1 + ((seed || 0.5) - 0.5) * 0.02);
    ping(g, o, t, v, f, 0.22, 0.07, 4.5);
    ping(g, o, t, v, f * 2.72, 0.12, 0.05, 4.5);
    ping(g, o, t, v, f * 4.98, 0.06, 0.035, 4.5);
    ping(g, o, t, v, f * 7.6, 0.035, 0.02, 4.5);
    hissS(g, o, t, v, 'bandpass', 6000, 1, 0.001, 0.004, 0.1, 4.5);
  };
  P.v = (g, o, t, v) => { // chappa: small cymbals
    hissS(g, o, t, v, 'bandpass', 5200, 2.5, 0.001, 0.14, 0.17, 4.5);
    hissS(g, o, t, v, 'highpass', 8000, 0.7, 0.001, 0.08, 0.1, 4.5);
    ping(g, o, t, v, 3810, 0.09, 0.025, 4.5);
    ping(g, o, t, v, 3870, 0.09, 0.025, 4.5);
  };
  P.i = (g, o, t, v, seed) => rin(g, o, t, 1180 * (1 + ((seed || 0.5) - 0.5) * 0.004), v * 0.9, 0.85); // rin bowl bell

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
