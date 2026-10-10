/* Sound effects — all synthesised on demand with the same instrument voices
 * as the music, so effects sit in the same world. Soft by design: nothing
 * uses harsh square waves, alarms or buzzers; mistakes get a gentle falling
 * mallet third, recognition uncertainty a neutral "question" figure.
 *
 * RB.audio.sfx(id, {pitch, vol}) — pitch in semitones (e.g. -3 for a lower
 * text blip), vol 0..2 multiplier. Calls before init(), while muted by the
 * browser (suspended), or faster than an effect's minimum gap are dropped
 * rather than queued, so nothing bursts out later. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  const st = _.st;
  const N = _.node;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // --------------------------------------------------------- primitives
  // Enveloped oscillator with optional glide and filter.
  function tone(g, out, t, o) {
    const c = g.ctx;
    const a0 = o.a || 0.005;
    const hold = o.hold || 0;
    const r = o.r || 0.1;
    const s = N.osc(c, o.type || 'sine', o.f, t);
    if (o.f2) s.frequency.exponentialRampToValueAtTime(o.f2, t + (o.glide || a0 + hold + r));
    const nodes = [s];
    let node = s;
    if (o.lp) {
      const f = N.bq(c, 'lowpass', o.lp, o.q || 0.7);
      node.connect(f);
      node = f;
      nodes.push(f);
    }
    if (o.bp) {
      const f = N.bq(c, 'bandpass', o.bp, o.q || 2);
      node.connect(f);
      node = f;
      nodes.push(f);
    }
    const a = N.amp(c, 0);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(o.v, t + a0);
    if (hold) a.gain.setValueAtTime(o.v, t + a0 + hold);
    a.gain.setTargetAtTime(0, t + a0 + hold, r / 3);
    node.connect(a);
    a.connect(out);
    nodes.push(a);
    N.run(c, [s], nodes, t, t + a0 + hold + r * 2.5);
  }
  // Filtered noise burst with optional frequency sweep.
  function whoosh(g, out, t, o) {
    const c = g.ctx;
    const a0 = o.a || 0.01;
    const hold = o.hold || 0;
    const r = o.r || 0.1;
    const n = N.noise(g);
    const f = N.bq(c, o.type || 'bandpass', o.f, o.q || 1);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(Math.min(o.f2, c.sampleRate * 0.45), t + a0 + hold + r);
    const a = N.amp(c, 0);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(o.v, t + a0);
    if (hold) a.gain.setValueAtTime(o.v, t + a0 + hold);
    a.gain.setTargetAtTime(0, t + a0 + hold, r / 3);
    n.connect(f);
    f.connect(a);
    a.connect(out);
    N.run(c, [n], [n, f, a], t, t + a0 + hold + r * 2.5);
  }
  function note(g, out, t, inst, midi, dur, v, p) {
    _.inst[inst](g, out, t, _.mtof(midi) * p, dur, v);
  }
  function seq(g, out, t, inst, notes, step, dur, v, p) {
    notes.forEach((m, i) => note(g, out, t + i * step, inst, m, dur, v, p));
  }
  function chord(g, out, t, inst, notes, dur, v, p) {
    for (const m of notes) note(g, out, t, inst, m, dur, v, p);
  }

  // --------------------------------------------------------- definitions
  // def(id, lengthSeconds, reverbSend, minGapSeconds, fn(g, out, t, pitchRatio, rng))
  const X = (_.sfxDefs = {});
  function def(id, len, rv, gap, fn) {
    X[id] = { fn, len, rv, gap };
  }

  // movement
  def('step', 0.15, 0, 0.06, (g, o, t, p) => {
    whoosh(g, o, t, { type: 'lowpass', f: 520 * p, q: 0.8, a: 0.003, r: 0.05, v: 0.3 });
    tone(g, o, t, { f: 95 * p, f2: 60 * p, a: 0.002, r: 0.05, v: 0.2 });
  });
  def('step_snow', 0.2, 0, 0.06, (g, o, t, p, r) => {
    whoosh(g, o, t, { f: 2200 * p, q: 0.8, a: 0.012, r: 0.08, v: 0.28 });
    for (let i = 0; i < 3; i++) {
      whoosh(g, o, t + 0.012 + i * (0.014 + r() * 0.012), { f: (3000 + r() * 1200) * p, q: 2, a: 0.001, r: 0.012, v: 0.1 });
    }
  });
  def('step_wood', 0.15, 0.1, 0.06, (g, o, t, p) => {
    tone(g, o, t, { type: 'triangle', f: 190 * p, f2: 150 * p, a: 0.002, r: 0.07, v: 0.24 });
    whoosh(g, o, t, { f: 1100 * p, q: 2, a: 0.001, r: 0.03, v: 0.13 });
  });
  def('footstep_grass', 0.15, 0, 0.06, (g, o, t, p) => {
    whoosh(g, o, t, { f: 3600 * p, q: 0.6, a: 0.015, r: 0.06, v: 0.2 });
    whoosh(g, o, t + 0.03, { f: 2800 * p, q: 0.8, a: 0.01, r: 0.05, v: 0.11 });
  });
  def('bump', 0.2, 0, 0.15, (g, o, t, p) => {
    tone(g, o, t, { f: 85 * p, f2: 55 * p, a: 0.002, r: 0.12, v: 0.38 });
    whoosh(g, o, t, { type: 'lowpass', f: 300, q: 0.7, a: 0.002, r: 0.06, v: 0.22 });
  });
  def('door', 0.7, 0.2, 0.2, (g, o, t, p) => {
    tone(g, o, t, { type: 'sawtooth', f: 95 * p, f2: 125 * p, glide: 0.28, a: 0.03, hold: 0.2, r: 0.1, v: 0.07, bp: 900, q: 4 });
    tone(g, o, t + 0.3, { f: 70 * p, f2: 50 * p, a: 0.003, r: 0.14, v: 0.36 });
    whoosh(g, o, t + 0.3, { type: 'lowpass', f: 260, q: 0.7, a: 0.003, r: 0.08, v: 0.25 });
  });

  // interface
  def('confirm', 0.6, 0.25, 0.04, (g, o, t, p) => {
    note(g, o, t, 'pluck', 81, 0.1, 0.75, p);
    note(g, o, t + 0.06, 'pluck', 88, 0.25, 0.75, p);
    note(g, o, t + 0.06, 'celesta', 88, 0.2, 0.35, p);
  });
  def('cancel', 0.5, 0.2, 0.04, (g, o, t, p) => {
    note(g, o, t, 'pluck', 76, 0.1, 0.65, p);
    note(g, o, t + 0.06, 'pluck', 69, 0.2, 0.55, p);
  });
  def('cursor', 0.08, 0, 0.03, (g, o, t, p) => {
    tone(g, o, t, { f: 1320 * p, a: 0.001, r: 0.025, v: 0.13 });
    tone(g, o, t, { f: 2640 * p, a: 0.001, r: 0.012, v: 0.02 });
  });
  def('text_blip', 0.06, 0, 0.035, (g, o, t, p) => {
    tone(g, o, t, { type: 'triangle', f: 620 * p, a: 0.002, r: 0.03, v: 0.17, lp: 2200 });
  });
  def('menu_open', 0.4, 0.15, 0.08, (g, o, t, p) => {
    note(g, o, t, 'pluck', 69, 0.08, 0.45, p);
    note(g, o, t + 0.045, 'pluck', 76, 0.15, 0.45, p);
    whoosh(g, o, t, { f: 1500, f2: 3000, q: 1, a: 0.02, r: 0.08, v: 0.03 });
  });
  def('menu_close', 0.4, 0.15, 0.08, (g, o, t, p) => {
    note(g, o, t, 'pluck', 76, 0.08, 0.4, p);
    note(g, o, t + 0.045, 'pluck', 69, 0.15, 0.4, p);
  });
  def('page', 0.4, 0.1, 0.08, (g, o, t, p) => {
    whoosh(g, o, t, { f: 1800 * p, f2: 3200 * p, q: 0.8, a: 0.03, hold: 0.05, r: 0.08, v: 0.17 });
    whoosh(g, o, t + 0.1, { f: 4000 * p, q: 1.5, a: 0.002, r: 0.03, v: 0.07 });
  });
  def('save', 1.6, 0.35, 0.3, (g, o, t, p) => seq(g, o, t, 'celesta', [72, 79, 76], 0.12, 0.3, 0.4, p));
  def('quest_update', 1.6, 0.35, 0.3, (g, o, t, p) => {
    note(g, o, t, 'bell', 79, 0.2, 0.4, p);
    note(g, o, t + 0.14, 'bell', 84, 0.3, 0.4, p);
    chord(g, o, t, 'pad', [72, 79], 0.5, 0.7, p);
  });

  // writing and recognition
  def('pen_down', 0.06, 0, 0.03, (g, o, t, p) => {
    whoosh(g, o, t, { f: 2600 * p, q: 1.5, a: 0.002, r: 0.02, v: 0.12 });
    tone(g, o, t, { f: 300 * p, a: 0.001, r: 0.02, v: 0.07 });
  });
  def('pen_stroke', 0.15, 0, 0.05, (g, o, t, p, r) => {
    whoosh(g, o, t, { f: (2700 + r() * 300) * p, f2: 3500 * p, q: 1.2, a: 0.02, hold: 0.03, r: 0.05, v: 0.09 });
  });
  def('pen_up', 0.05, 0, 0.03, (g, o, t, p) => {
    whoosh(g, o, t, { f: 3500 * p, q: 2, a: 0.001, r: 0.015, v: 0.08 });
    tone(g, o, t, { f: 700 * p, a: 0.001, r: 0.015, v: 0.05 });
  });
  def('recog_ok', 1.2, 0.3, 0.1, (g, o, t, p) => chord(g, o, t, 'celesta', [84, 88], 0.3, 0.42, p));
  // A neutral rising second — a question, not a judgement.
  def('recog_unsure', 0.8, 0.25, 0.1, (g, o, t, p) => {
    note(g, o, t, 'mallet', 74, 0.12, 0.55, p);
    note(g, o, t + 0.11, 'mallet', 76, 0.25, 0.5, p);
  });
  def('answer_right', 1.6, 0.3, 0.15, (g, o, t, p) => {
    seq(g, o, t, 'harp', [72, 76, 79, 84], 0.055, 0.3, 0.6, p);
    note(g, o, t + 0.22, 'bell', 88, 0.4, 0.3, p);
  });
  // "Not quite": a soft falling third on mallet — never a buzzer.
  def('answer_wrong', 0.9, 0.2, 0.15, (g, o, t, p) => {
    note(g, o, t, 'mallet', 67, 0.2, 0.5, p);
    note(g, o, t + 0.13, 'mallet', 64, 0.3, 0.45, p);
  });

  // inkweaving
  def('ward', 2.0, 0.4, 0.2, (g, o, t, p) => {
    chord(g, o, t, 'pad', [62, 69, 74, 78], 0.6, 1, p);
    whoosh(g, o, t, { f: 700, f2: 2600, q: 1.5, a: 0.3, hold: 0.1, r: 0.3, v: 0.06 });
    note(g, o, t + 0.35, 'celesta', 86, 0.3, 0.4, p);
  });
  def('water', 1.2, 0.35, 0.1, (g, o, t, p, r) => {
    for (let i = 0; i < 5; i++) _.perc.d(g, o, t + i * 0.07 + r() * 0.04, 0.8, r());
    whoosh(g, o, t, { type: 'lowpass', f: 900, q: 0.7, a: 0.12, hold: 0.1, r: 0.3, v: 0.08 });
  });
  def('wind', 2.0, 0.3, 0.3, (g, o, t, p) => {
    whoosh(g, o, t, { f: 350 * p, f2: 1100 * p, q: 1.5, a: 0.45, hold: 0.3, r: 0.5, v: 0.32 });
    whoosh(g, o, t + 0.1, { f: 700 * p, f2: 1800 * p, q: 3, a: 0.5, hold: 0.2, r: 0.5, v: 0.07 });
  });
  def('light', 1.6, 0.4, 0.15, (g, o, t, p) => {
    seq(g, o, t, 'celesta', [79, 83, 86, 91, 95], 0.04, 0.25, 0.32, p);
    note(g, o, t + 0.1, 'glass', 91, 0.5, 0.6, p);
  });
  def('fire_out', 1.0, 0.2, 0.2, (g, o, t, p) => {
    whoosh(g, o, t, { type: 'lowpass', f: 3000 * p, f2: 250 * p, q: 0.7, a: 0.01, hold: 0.2, r: 0.3, v: 0.18 });
    tone(g, o, t, { f: 120 * p, f2: 60 * p, a: 0.005, r: 0.15, v: 0.16 });
  });
  def('reveal', 2.0, 0.45, 0.2, (g, o, t, p) => {
    tone(g, o, t, { f: 440 * p, f2: 880 * p, glide: 0.6, a: 0.3, hold: 0.3, r: 0.4, v: 0.07 });
    seq(g, o, t + 0.1, 'celesta', [74, 78, 81, 86], 0.08, 0.3, 0.35, p);
    chord(g, o, t, 'pad', [62, 69, 74], 0.8, 0.9, p);
  });
  def('heal', 2.0, 0.4, 0.2, (g, o, t, p) => {
    seq(g, o, t, 'harp', [67, 69, 71, 74, 76, 79], 0.07, 0.3, 0.45, p);
    chord(g, o, t, 'pad', [67, 71, 74], 0.8, 0.9, p);
  });
  def('knot_untie', 1.2, 0.25, 0.15, (g, o, t, p) => {
    tone(g, o, t, { type: 'sawtooth', f: 196 * p, f2: 233 * p, glide: 0.25, a: 0.004, r: 0.3, v: 0.07, lp: 1400 });
    seq(g, o, t + 0.12, 'pluck', [74, 79, 86], 0.08, 0.2, 0.5, p);
  });
  def('enemy_intent', 1.5, 0.35, 0.2, (g, o, t, p) => {
    note(g, o, t, 'bell', 57, 0.4, 0.45, p);
    note(g, o, t + 0.16, 'bell', 63, 0.4, 0.35, p);
    whoosh(g, o, t, { type: 'lowpass', f: 400, q: 0.7, a: 0.25, r: 0.35, v: 0.08 });
  });
  def('enemy_hit', 0.8, 0.25, 0.08, (g, o, t, p) => {
    whoosh(g, o, t, { type: 'lowpass', f: 1800 * p, q: 0.7, a: 0.001, r: 0.12, v: 0.3 });
    tone(g, o, t, { f: 140 * p, f2: 70 * p, a: 0.002, r: 0.14, v: 0.36 });
    note(g, o, t, 'bell', 81, 0.2, 0.25, p);
  });
  def('party_hit', 0.6, 0.15, 0.08, (g, o, t, p) => {
    tone(g, o, t, { f: 110 * p, f2: 60 * p, a: 0.002, r: 0.16, v: 0.34 });
    whoosh(g, o, t, { type: 'lowpass', f: 700, q: 0.7, a: 0.002, r: 0.1, v: 0.2 });
  });
  def('harmony_ready', 2.0, 0.45, 0.3, (g, o, t, p) => {
    note(g, o, t, 'bell', 74, 0.4, 0.42, p);
    note(g, o, t + 0.09, 'bell', 81, 0.4, 0.42, p);
    note(g, o, t + 0.15, 'glass', 86, 0.7, 0.6, p);
  });
  def('technique', 1.6, 0.35, 0.2, (g, o, t, p) => {
    whoosh(g, o, t, { f: 500, f2: 2600, q: 1.2, a: 0.12, r: 0.2, v: 0.12 });
    seq(g, o, t + 0.05, 'pluck', [62, 69, 74, 78], 0.03, 0.4, 0.5, p);
    note(g, o, t + 0.15, 'bell', 86, 0.3, 0.32, p);
  });

  // Harmony (expansion E21; Robin: the cut-in "feels a bit empty" without sound). One arrival for every pair, timed
  // to the portrait sliding in, so the player learns "this is Harmony"; then one accent per companion at their peak,
  // drawn from their technique. Played by src/ui/82d_harmony_cutin.js; none on Instant (no portrait plays then).
  def('harmony_arrive', 1.8, 0.45, 0.4, (g, o, t, p) => {
    // a short rising swell with a soft strike
    whoosh(g, o, t, { f: 420 * p, f2: 2400 * p, q: 1.1, a: 0.22, hold: 0.04, r: 0.22, v: 0.1 });
    chord(g, o, t + 0.02, 'pad', [62, 69, 74], 0.45, 0.55, p);
    note(g, o, t + 0.24, 'bell', 81, 0.35, 0.34, p);
    _.perc.t(g, o, t + 0.24, 0.35);
  });
  def('harmony_nao', 1.0, 0.25, 0.3, (g, o, t, p) => {
    // a quick throw and a paper snap, like a letter landing on a counter
    whoosh(g, o, t, { f: 900 * p, f2: 3600 * p, q: 1.4, a: 0.06, r: 0.06, v: 0.12 });
    whoosh(g, o, t + 0.09, { f: 2400 * p, q: 2.5, a: 0.001, r: 0.025, v: 0.2 });
    _.perc.w(g, o, t + 0.1, 0.45);
    note(g, o, t + 0.12, 'pluck', 79, 0.18, 0.4, p);
  });
  def('harmony_mio', 1.6, 0.4, 0.3, (g, o, t, p, r) => {
    // a rising shimmer of water, then a glass chime
    for (let i = 0; i < 4; i++) _.perc.d(g, o, t + i * 0.05 + r() * 0.02, 0.55, r());
    seq(g, o, t, 'harp', [74, 78, 81, 86], 0.045, 0.25, 0.3, p);
    note(g, o, t + 0.22, 'glass', 93, 0.6, 0.5, p);
  });
  def('harmony_ren', 2.4, 0.5, 0.4, (g, o, t, p) => {
    // a deep lantern-bell tone that blooms and hangs
    note(g, o, t, 'toll', 50, 0.9, 0.45, p);
    note(g, o, t + 0.04, 'bell', 74, 0.6, 0.22, p);
    chord(g, o, t + 0.05, 'pad', [62, 69], 1.1, 0.4, p);
  });
  def('harmony_suzu', 1.4, 0.35, 0.3, (g, o, t, p) => {
    // a sparkle and a little drum flourish: a stage's "ta-da"
    seq(g, o, t, 'celesta', [86, 91, 95], 0.035, 0.2, 0.3, p);
    _.perc.t(g, o, t + 0.08, 0.4); _.perc.t(g, o, t + 0.14, 0.45);
    _.perc.l(g, o, t + 0.24, 0.55);
    note(g, o, t + 0.24, 'bell', 88, 0.35, 0.32, p);
  });

  // world
  def('discover', 1.8, 0.45, 0.3, (g, o, t, p) => {
    seq(g, o, t, 'celesta', [72, 76, 78, 79, 83], 0.06, 0.3, 0.4, p);
    chord(g, o, t, 'pad', [72, 76, 79, 83], 0.6, 0.8, p);
  });
  def('item_get', 1.5, 0.3, 0.2, (g, o, t, p) => {
    seq(g, o, t, 'pluck', [67, 71, 74, 79], 0.06, 0.2, 0.55, p);
    note(g, o, t + 0.26, 'bell', 83, 0.4, 0.32, p);
  });
  def('lantern', 1.5, 0.3, 0.2, (g, o, t, p, r) => {
    note(g, o, t, 'bell', 62, 0.3, 0.55, p);
    for (let i = 0; i < 6; i++) whoosh(g, o, t + r() * 0.4, { f: 2300 + r() * 600, q: 3, a: 0.001, r: 0.01, v: 0.045 });
    whoosh(g, o, t, { type: 'lowpass', f: 600, q: 0.7, a: 0.2, hold: 0.1, r: 0.4, v: 0.06 });
  });
  def('bell', 4.0, 0.5, 0.3, (g, o, t, p) => {
    note(g, o, t, 'toll', 57, 0.5, 0.7, p);
    note(g, o, t, 'bell', 69, 0.4, 0.18, p);
  });
  def('splash', 1.0, 0.3, 0.15, (g, o, t, p, r) => {
    whoosh(g, o, t, { type: 'lowpass', f: 2600 * p, f2: 600 * p, q: 0.7, a: 0.005, r: 0.3, v: 0.26 });
    for (let i = 0; i < 4; i++) _.perc.d(g, o, t + 0.05 + r() * 0.25, 0.6, r());
    tone(g, o, t, { f: 200 * p, f2: 90 * p, a: 0.003, r: 0.1, v: 0.18 });
  });
  def('chest', 1.4, 0.3, 0.3, (g, o, t, p) => {
    tone(g, o, t, { type: 'sawtooth', f: 110 * p, f2: 140 * p, glide: 0.18, a: 0.02, hold: 0.12, r: 0.08, v: 0.06, bp: 1000, q: 4 });
    tone(g, o, t + 0.2, { f: 1500 * p, a: 0.001, r: 0.01, v: 0.08 });
    seq(g, o, t + 0.3, 'celesta', [84, 88, 91], 0.05, 0.3, 0.35, p);
  });
  def('levelup', 2.5, 0.45, 0.5, (g, o, t, p) => {
    seq(g, o, t, 'harp', [62, 66, 69, 74, 78, 81, 86], 0.05, 0.4, 0.5, p);
    note(g, o, t + 0.35, 'bell', 86, 0.5, 0.35, p);
    chord(g, o, t, 'pad', [62, 69, 74, 78], 1.0, 0.9, p);
  });
  // Gentle: a slow falling line, not a failure jingle.
  def('defeat', 3.0, 0.4, 0.5, (g, o, t, p) => {
    note(g, o, t, 'bowed', 69, 0.45, 0.6, p);
    note(g, o, t + 0.4, 'bowed', 65, 0.45, 0.55, p);
    note(g, o, t + 0.8, 'bowed', 62, 0.9, 0.5, p);
    chord(g, o, t, 'pad', [50, 57, 62, 65], 1.6, 0.8, p);
  });
  def('flee', 0.8, 0.2, 0.2, (g, o, t, p) => {
    whoosh(g, o, t, { f: 2000, f2: 600, q: 1, a: 0.02, r: 0.2, v: 0.11 });
    seq(g, o, t + 0.03, 'pluck', [79, 76, 72], 0.05, 0.12, 0.45, p);
  });

  _.REQUIRED_SFX = [
    'step', 'step_snow', 'step_wood', 'bump', 'door', 'confirm', 'cancel', 'cursor', 'text_blip',
    'pen_down', 'pen_stroke', 'pen_up', 'recog_ok', 'recog_unsure', 'answer_right', 'answer_wrong',
    'ward', 'water', 'wind', 'light', 'fire_out', 'reveal', 'heal', 'knot_untie', 'enemy_intent',
    'enemy_hit', 'party_hit', 'harmony_ready', 'technique', 'discover', 'item_get', 'quest_update',
    'save', 'lantern', 'bell', 'page', 'splash', 'chest', 'footstep_grass', 'menu_open', 'menu_close',
    'levelup', 'defeat', 'flee', 'harmony_arrive', 'harmony_nao', 'harmony_mio', 'harmony_ren', 'harmony_suzu',
  ];

  // --------------------------------------------------------- playback
  const rng = RB.util.rng(24681357);
  // Plays an effect into graph g at time t. Used live and by renderOffline.
  _.sfxPlay = function (g, id, t, opts) {
    const d = X[id];
    if (!d) return false;
    opts = opts || {};
    const c = g.ctx;
    const out = N.amp(c, clamp(opts.vol == null ? 1 : Number(opts.vol) || 0, 0, 2));
    out.connect(g.sfx);
    let wet = null;
    if (d.rv) {
      wet = N.amp(c, d.rv);
      out.connect(wet);
      wet.connect(g.srevIn);
    }
    const p = Math.pow(2, clamp(Number(opts.pitch) || 0, -24, 24) / 12);
    d.fn(g, out, t, p, rng);
    if (typeof setTimeout === 'function' && typeof c.startRendering !== 'function') {
      setTimeout(() => {
        try { out.disconnect(); if (wet) wet.disconnect(); } catch (e) { /* ignore */ }
      }, (d.len + 3) * 1000);
    }
    return true;
  };

  const lastAt = {};
  let active = [];
  const MAX_ACTIVE = 24;
  A.sfx = function (id, opts) {
    const c = st.ctx;
    if (!st.g || !c || c.state !== 'running') return false;
    const d = X[id];
    if (!d) {
      if (typeof console !== 'undefined') console.warn('[audio] unknown sfx', id);
      return false;
    }
    const now = c.currentTime;
    if (lastAt[id] != null && now - lastAt[id] < d.gap) return false;
    active = active.filter((e) => e > now);
    if (active.length >= MAX_ACTIVE) return false;
    lastAt[id] = now;
    active.push(now + d.len);
    try {
      return _.sfxPlay(st.g, id, now + 0.005, opts);
    } catch (e) {
      st.lastError = String(e && e.message);
      return false;
    }
  };
  A.sfxList = () => Object.keys(X);
})(RB.audio);
