// Song data validation (node; no Web Audio). Compiles every song through the
// real compiler in src/audio/20_sequencer.js and checks structure, ranges,
// durations and that each song really quotes the motifs it claims.
import { load } from '../lib/load.mjs';

// Comfortable ranges per instrument (MIDI). Wider than strictly needed, but
// catches octave slips that would make a part shrill or muddy.
const RANGE = {
  bass: [28, 64], pad: [40, 86], choir: [45, 84], bowed: [36, 90], flute: [55, 96],
  pluck: [36, 100], harp: [38, 100], mallet: [45, 98], keys: [45, 90],
  bell: [36, 98], celesta: [48, 100], toll: [30, 70], glass: [40, 96],
  // the Japanese instruments (src/audio/10_synth.js), roughly their real compass (the shakuhachi down to A3,
  // a long 2.4-shaku instrument, for the Drowned Archive's low pass)
  shamisen: [45, 88], biwa: [36, 72], koto: [40, 93], koto_oshi: [40, 93], shakuhachi: [57, 91],
  shinobue: [69, 100], sho: [60, 93], rin: [64, 100],
};

export default async (t) => {
  const RB = load(['core/00_ns.js', 'audio']);
  const A = RB.audio;
  const _ = A._;
  t.ok(typeof A.init === 'function' && typeof A.playSong === 'function', 'audio API loads in node without Web Audio');
  t.ok(A.ready() === false, 'ready() is false without a context');
  t.ok(A.sfx('confirm') === false, 'sfx() is a no-op without a context');
  t.ok(A.playSong('road') === false && A.currentSong() === 'road', 'playSong before init remembers the request');
  A.stopSong();
  t.ok(A.currentSong() === null, 'stopSong clears the pending request');
  t.ok(A.playSong('no_such_song') === false, 'unknown song id is rejected');
  t.ok(A.playSong(null) === false, 'null song id is a no-op');

  // --- required ids
  for (const id of _.REQUIRED_SONGS) t.ok(!!_.songDefs[id], 'song defined: ' + id);
  for (const id of _.REQUIRED_SFX) t.ok(!!_.sfxDefs[id], 'sfx defined: ' + id);

  // --- every song compiles and is sane
  const summary = [];
  const instSeen = new Set();
  for (const id of Object.keys(_.songDefs)) {
    const def = _.songDefs[id];
    let s;
    try {
      s = _.compile(def);
    } catch (e) {
      t.ok(false, id + ' compiles: ' + e.message);
      continue;
    }
    t.ok(typeof def.title === 'string' && def.title.length > 2, id + ' has a title');
    t.ok(typeof def.notes === 'string' && def.notes.length > 30, id + ' has motif/arrangement notes');
    t.ok(s.events.length > 20, id + ' has events');
    t.ok(s.length > 0, id + ' has positive length');
    for (const sec of s.sections) t.ok(sec.seconds > 0 && sec.bars > 0, `${id}:${sec.s} section is non-empty`);
    for (const [name, sec] of Object.entries(def.sections)) t.ok(sec.bars > 0 || sec.from, `${id}:${name} declares bars`);
    let rangeBad = 0;
    for (const e of s.events) {
      if (!(e.t >= 0) || !(e.d > 0) || !(e.v > 0 && e.v < 2)) { rangeBad++; continue; }
      if (e.m == null) continue;
      instSeen.add(e.i);
      const r = RANGE[e.i];
      if (!r || e.m < r[0] || e.m > r[1]) {
        rangeBad++;
        if (rangeBad < 4) t.log(`${id}: ${e.i} note ${e.m} outside ${r} at ${e.t.toFixed(2)}s`);
      }
    }
    t.ok(rangeBad === 0, id + ': all notes/durations/velocities in range');
    // every declared track is used somewhere
    const used = new Set(s.events.map((e) => e.tr));
    s.tracks.forEach((tk, i) => t.ok(used.has(i), `${id}: track "${tk.name}" is used`));
    // durations by kind
    const loopLen = s.loop ? s.length - s.loopStart : null;
    if (def.kind === 'area' || def.kind === 'battle' || def.kind === 'boss') t.ok(s.loop && loopLen >= 60, `${id}: ${def.kind} theme loops for >= 60 s (got ${loopLen && loopLen.toFixed(1)})`);
    t.ok(['area', 'battle', 'boss', 'scene', 'companion', 'cutscene', 'sting'].includes(def.kind), `${id}: has a known kind (${def.kind})`);
    if (def.kind === 'companion' || def.kind === 'scene') t.ok(s.loop && loopLen >= 40, `${id}: scene loop >= 40 s`);
    if (id === 'prologue') t.ok(!s.loop && s.length >= 30 && s.length <= 60, 'prologue is a 30–60 s non-looping cue');
    if (id === 'victory') t.ok(!s.loop && s.length <= 10, 'victory is a short non-looping sting');
    summary.push(`${id}:${s.length.toFixed(0)}s`);
    // deterministic
    t.ok(_.compile(def).events.length === s.events.length, id + ' compiles deterministically');
  }
  t.log('durations', summary.join(' '));
  for (const inst of Object.keys(RANGE)) t.ok(instSeen.has(inst), 'instrument used in some song: ' + inst);

  // --- motif quotes (diatonic contour, transposition/mode independent)
  const contains = (hay, needle) => {
    outer: for (let i = 0; i + needle.length <= hay.length; i++) {
      for (let j = 0; j < needle.length; j++) if (hay[i + j] !== needle[j]) continue outer;
      return true;
    }
    return false;
  };
  const steps = {};
  for (const [k, m] of Object.entries(_.motifs)) steps[k] = _.motifSteps(m.deg);
  t.eq(steps.road, [5, -1, -1, 1], 'road motif contour');
  t.eq(steps.hush, [3, 1, 1, 1], 'hush motif contour');
  for (const id of Object.keys(_.songDefs)) {
    const def = _.songDefs[id];
    const s = _.getSong(id);
    const perTrack = new Map();
    for (const e of s.events) {
      if (e.sd == null) continue;
      if (!perTrack.has(e.tr)) perTrack.set(e.tr, []);
      perTrack.get(e.tr).push(e.sd);
    }
    const contours = [...perTrack.values()].map((sd) => sd.slice(1).map((v, i) => v - sd[i]));
    for (const m of def.motifs || []) {
      t.ok(!!steps[m], `${id}: motif ${m} exists`);
      t.ok(contours.some((c) => contains(c, steps[m])), `${id} quotes the ${m} motif`);
    }
  }
  for (const c of ['nao', 'mio', 'ren', 'suzu']) {
    t.ok((_.songDefs['companion_' + c].motifs || []).includes(c), `companion_${c} claims its own motif`);
  }

  // --- harmony lint: no sustained (>= 1.5 beat) melody note a semitone above
  // a chord tone, or a tritone above the root. Allowed on purpose: the Hush
  // motif's raised fourth hanging over open fifths, and sorrow's F->E sigh.
  const clashes = [];
  for (const id of Object.keys(_.songDefs)) {
    const s = _.getSong(id);
    for (const e of s.events) {
      if (e.m == null) continue;
      const tk = s.tracks[e.tr];
      if (tk.pat || tk.hold) continue;
      const sec = s.sections.find((x) => e.t >= x.start - 1e-6 && e.t < x.start + x.seconds - 1e-6);
      if (!sec || !sec.chords.length || e.d / sec.spb < 1.5) continue;
      const ch = sec.chords.find((c) => e.t >= c.t0 - 1e-6 && e.t < c.t1 - 1e-6);
      if (!ch) continue;
      const pc = ((e.m % 12) + 12) % 12;
      const semi = ch.tones.some((ct) => (pc - ct + 12) % 12 === 1);
      const trit = (pc - ch.tones[0] + 12) % 12 === 6;
      if (!semi && !trit) continue;
      // the Hush's raised fourth over open fifths: in the original Hush-touched
      // songs, and in any later song that claims the hush motif
      const hushFourth = trit && /P/.test(ch.src) && (['hush', 'lanternfall', 'still_archive'].includes(id) || (_.songDefs[id].motifs || []).includes('hush'));
      const sigh = id === 'sorrow' && sec.s === 'B';
      if (!hushFourth && !sigh) clashes.push(`${id}:${sec.s} ${tk.name} midi ${e.m} over ${ch.src} at ${e.t.toFixed(2)}s`);
    }
  }
  t.ok(clashes.length === 0, 'no sustained melody/chord clashes: ' + clashes.slice(0, 6).join('; '));

  // --- the validator catches authoring mistakes
  const base = () => ({
    id: 'probe', key: 'C', bpm: 90,
    tracks: { lead: { i: 'flute', o: 5 }, bass: { i: 'bass', o: 2, pat: true } },
    sections: { A: { bars: 2, ch: '1 5', lead: '1 - 2 - 3 - 4 - | 5 - - - - - - -', bass: '0 - - - 2 - - -' } },
    form: ['A'],
  });
  const throws = (mut, msg) => {
    const d = base();
    mut(d);
    let threw = false;
    try { _.compile(d); } catch (e) { threw = true; }
    t.ok(threw, 'validator rejects: ' + msg);
  };
  t.ok(_.compile(base()).events.length > 0, 'probe song compiles');
  throws((d) => { d.sections.A.lead = '1 - 2 - 3 - 4 | 5 - - - - - - -'; }, 'short bar');
  throws((d) => { d.sections.A.lead = '1 - 2 - 3 - 4 - 5 | - - - - - - -'; }, 'long bar');
  throws((d) => { d.sections.A.lead = '1 - 2 - 3 - 4 - 5 - -'; }, 'melody not dividing section');
  throws((d) => { d.sections.A.ch = '1 5 1'; }, 'chords overrun section');
  throws((d) => { d.sections.A.lead = '1 - 9 - 3 - 4 - | 5 - - - - - - -'; }, 'degree out of range');
  throws((d) => { d.sections.A.bass = '0 - 7 -'; }, 'chord tone out of range');
  throws((d) => { d.tracks.lead.i = 'kazoo'; }, 'unknown instrument');
  throws((d) => { d.sections.A.bars = 0; }, 'zero-length section');
  throws((d) => { d.form = ['B']; }, 'missing section');
  throws((d) => { d.key = 'H'; }, 'unknown key');
  throws((d) => { d.tracks.lead.o = 9; }, 'notes beyond MIDI range');
  throws((d) => { d.tracks.p = { perc: true }; d.sections.A.p = 'ku..'; }, 'unknown percussion letter (u is unassigned; z is now the ōdaiko)');
  throws((d) => { d.tracks.p = { perc: true }; d.sections.A.p = 'k...|k..'; }, 'percussion bar length');
  throws((d) => { delete d.sections.A.ch; }, 'pattern track without chords');
  throws((d) => { d.sections.A.lead = '1:0 - 2 - 3 - 4 - | 5 - - - - - - -'; }, 'zero-length token');

  // --- songList
  const list = A.songList();
  t.ok(list.length === Object.keys(_.songDefs).length, 'songList lists every song');
  t.ok(list.every((x) => x.title && Array.isArray(x.motifs) && x.seconds > 0), 'songList entries have title, motifs, seconds');
};
