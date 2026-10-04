/* Song compiler + lookahead scheduler + public music API.
 *
 * Songs are authored in the compact degree notation documented at the top of
 * 30_songs.js. _.compile(def) turns a definition into a flat, time-sorted
 * event list (seconds) and validates it (bar lengths, ranges, chord coverage),
 * throwing a descriptive Error on any authoring mistake. Compilation is pure
 * JS (no Web Audio) so node unit tests can validate every song.
 *
 * Playback: a Player owns one song's channel strips and a cursor into its
 * events. A single 25 ms setInterval tick schedules everything that falls
 * within the next 0.2 s against AudioContext.currentTime (the audio clock,
 * not rAF or wall time), so music does not stutter when frames drop.
 * Crossfades run two Players at once on independent fade gains. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  const st = _.st;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // ------------------------------------------------------------ theory
  const KEYS = {
    C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6,
    G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
  };
  const MODES = {
    ionian: [0, 2, 4, 5, 7, 9, 11],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10],
  };
  // Explicit chord qualities (semitones for chord tones 0..4).
  const QUAL = {
    M: [0, 4, 7, 11, 14],
    m: [0, 3, 7, 10, 14],
    D: [0, 4, 7, 10, 14],
    o: [0, 3, 6, 9, 14],
    P: [0, 7, 12, 14, 19],
  };
  _.KEYS = KEYS;
  _.MODES = MODES;

  function fail(where, msg) {
    throw new Error('[audio ' + where + '] ' + msg);
  }
  // deg0 is a 0-based diatonic index relative to the tonic (may be negative or >6).
  function degMidi(keyPc, mode, oct, deg0, acc) {
    const o = Math.floor(deg0 / 7);
    const i = ((deg0 % 7) + 7) % 7;
    return 12 * (oct + o + 1) + keyPc + mode[i] + acc;
  }
  _.degMidi = degMidi;

  // ----------------------------------------------------------- parsing
  const TOK_RE = /^(.+?)(?::(\d+(?:\.\d+)?))?([!?]?)$/;
  const NOTE_RE = /^([#b]?)(\d)([',]*)$/;
  // kind 'mel': degrees 1..7; kind 'pat': chord-tone indices 0..4.
  function parseLine(str, kind, barUnits, where) {
    if (typeof str !== 'string') fail(where, 'line must be a string');
    const toks = str.trim().split(/\s+/).filter(Boolean);
    const hasBars = toks.includes('|');
    const notes = [];
    let pos = 0;
    let barStart = 0;
    let last = null;
    const checkBar = () => {
      const got = pos - barStart;
      if (Math.abs(got - barUnits) > 1e-6) {
        fail(where, 'bar ' + (Math.round(barStart / barUnits) + 1) + ' has ' + got + ' units, expected ' + barUnits);
      }
      barStart = pos;
    };
    for (const tok of toks) {
      if (tok === '|') { checkBar(); continue; }
      if (tok === '-') {
        if (last) last.len += 1;
        pos += 1;
        continue;
      }
      const m = TOK_RE.exec(tok);
      if (!m) fail(where, 'bad token "' + tok + '"');
      const len = m[2] ? parseFloat(m[2]) : 1;
      if (!(len > 0)) fail(where, 'zero-length token "' + tok + '"');
      const vel = m[3] === '!' ? 1.25 : m[3] === '?' ? 0.6 : 1;
      if (m[1] === '.') {
        last = null;
        pos += len;
        continue;
      }
      const members = m[1].split('+').map((s) => {
        const n = NOTE_RE.exec(s);
        if (!n) fail(where, 'bad note "' + s + '" in "' + tok + '"');
        const num = +n[2];
        if (kind === 'mel' && (num < 1 || num > 7)) fail(where, 'scale degree out of range: ' + s);
        if (kind === 'pat' && num > 4) fail(where, 'chord-tone index out of range (0-4): ' + s);
        let oc = 0;
        for (const ch of n[3]) oc += ch === "'" ? 1 : -1;
        return { acc: n[1] === '#' ? 1 : n[1] === 'b' ? -1 : 0, n: num, oc };
      });
      last = { pos, len, members, vel };
      notes.push(last);
      pos += len;
    }
    if (hasBars && pos > barStart + 1e-9) checkBar();
    if (!(pos > 0)) fail(where, 'empty line');
    return { notes, units: pos };
  }

  const CH_RE = /^([#b]?)([1-7])((?:M|m|D|o|P|s4|s2)*)(?:\/([#b]?)([1-7]))?$/;
  function parseChords(str, where) {
    const toks = String(str).trim().split(/\s+/).filter(Boolean);
    const out = [];
    let pos = 0;
    let last = null;
    for (const tok of toks) {
      if (tok === '|') continue;
      if (tok === '-') {
        if (last) last.len += 1;
        pos += 1;
        continue;
      }
      const m = /^(.+?)(?::(\d+(?:\.\d+)?))?$/.exec(tok);
      if (!m) fail(where, 'bad chord token "' + tok + '"');
      const len = m[2] ? parseFloat(m[2]) : 1;
      if (!(len > 0)) fail(where, 'zero-length chord "' + tok + '"');
      if (m[1] === '.') {
        last = { pos, len, ch: null, src: '.' };
        out.push(last);
        pos += len;
        continue;
      }
      const c = CH_RE.exec(m[1]);
      if (!c) fail(where, 'bad chord "' + m[1] + '"');
      last = {
        pos,
        len,
        src: m[1],
        ch: {
          acc: c[1] === '#' ? 1 : c[1] === 'b' ? -1 : 0,
          deg: +c[2],
          q: c[3] || '',
          bass: c[5] ? { acc: c[4] === '#' ? 1 : c[4] === 'b' ? -1 : 0, deg: +c[5] } : null,
        },
      };
      out.push(last);
      pos += len;
    }
    return { list: out, units: pos };
  }

  function chordTones(ch, keyPc, mode, oct) {
    const d0 = ch.deg - 1;
    const q = ch.q;
    const qual = q.includes('P') ? 'P' : q.includes('D') ? 'D' : q.includes('o') ? 'o'
      : q.includes('M') ? 'M' : q.includes('m') ? 'm' : ch.acc ? 'M' : null;
    const root = degMidi(keyPc, mode, oct, d0, ch.acc);
    let tones;
    if (qual) {
      tones = QUAL[qual].map((x) => root + x);
      if (qual !== 'P' && q.includes('s4')) tones[1] = root + 5;
      if (qual !== 'P' && q.includes('s2')) tones[1] = root + 2;
    } else {
      tones = [0, 2, 4, 6, 8].map((k) => degMidi(keyPc, mode, oct, d0 + k, 0));
      if (q.includes('s4')) tones[1] = degMidi(keyPc, mode, oct, d0 + 3, 0);
      if (q.includes('s2')) tones[1] = degMidi(keyPc, mode, oct, d0 + 1, 0);
    }
    let bass = tones[0];
    if (ch.bass) {
      bass = degMidi(keyPc, mode, oct, ch.bass.deg - 1, ch.bass.acc);
      while (bass >= root + 7) bass -= 12;
      while (bass < root - 5) bass += 12;
    }
    return { tones, bass };
  }

  // ----------------------------------------------------------- compile
  const PERC_ACCENT = 1.3;
  _.compile = function (def) {
    const id = def.id || '?';
    if (!def.tracks || typeof def.tracks !== 'object') fail(id, 'missing tracks');
    if (!Array.isArray(def.form) || !def.form.length) fail(id, 'missing form');
    if (!def.sections) fail(id, 'missing sections');
    const names = Object.keys(def.tracks);
    const tIndex = {};
    names.forEach((n, i) => { tIndex[n] = i; });
    const events = [];
    const sections = [];
    const loopFrom = def.loopFrom || 0;
    if (loopFrom < 0 || loopFrom >= def.form.length) fail(id, 'loopFrom outside form');
    let tSec = 0;
    let loopStart = 0;
    const resolveSection = (name, where, depth) => {
      const s = def.sections[name];
      if (!s) fail(where, 'form refers to missing section "' + name + '"');
      if (!s.from) return s;
      if (depth > 4) fail(where, 'section "from" chain too deep');
      return Object.assign({}, resolveSection(s.from, where, depth + 1), s, { from: undefined });
    };

    def.form.forEach((fe0, fi) => {
      const fe = typeof fe0 === 'string' ? { s: fe0 } : fe0;
      const where = id + ':' + fe.s + '#' + fi;
      const sec = resolveSection(fe.s, where, 0);
      if (fi === loopFrom) loopStart = tSec;
      const meter = sec.meter || def.meter || 4;
      const bpm = fe.bpm || sec.bpm || def.bpm;
      if (!(bpm >= 30 && bpm <= 240)) fail(where, 'bpm out of range: ' + bpm);
      const keyName = fe.key || sec.key || def.key;
      const keyPc = KEYS[keyName];
      if (keyPc === undefined) fail(where, 'unknown key "' + keyName + '"');
      const modeName = fe.mode || sec.mode || def.mode || 'ionian';
      const mode = MODES[modeName];
      if (!mode) fail(where, 'unknown mode "' + modeName + '"');
      const tr = (def.tr || 0) + (sec.tr || 0) + (fe.tr || 0);
      const bars = sec.bars;
      if (!(bars > 0)) fail(where, 'section needs bars > 0');
      const secBeats = bars * meter;
      const spb = 60 / bpm;
      const dyn = (sec.dyn || 1) * (fe.dyn || 1);
      const swing = (def.swing || 0) * 0.5;
      const beatShift = (b) => {
        const fr = b - Math.floor(b + 1e-9);
        return swing && Math.abs(fr - 0.5) < 1e-6 ? swing : 0;
      };
      const accent = (b) => {
        const inBar = b % meter;
        if (Math.abs(inBar) < 1e-6) return 1.08;
        return Math.abs(b - Math.round(b)) < 1e-6 ? 1 : 0.92;
      };

      // chords -> segments in beats
      let segs = null;
      if (sec.ch) {
        const chu = sec.chu || meter;
        const pc = parseChords(sec.ch, where + '.ch');
        const total = pc.units * chu;
        if (Math.abs(total - secBeats) > 1e-6) {
          fail(where, 'chords cover ' + total + ' beats but the section has ' + secBeats);
        }
        segs = pc.list.map((c) => ({ b0: c.pos * chu, b1: (c.pos + c.len) * chu, ch: c.ch, src: c.src }));
      }

      for (const name of names) {
        const tdef = def.tracks[name];
        const content = Object.prototype.hasOwnProperty.call(sec, name) ? sec[name]
          : def.all && Object.prototype.hasOwnProperty.call(def.all, name) ? def.all[name] : undefined;
        if (content == null || content === '') continue;
        if (fe.m && fe.m.includes(name)) continue;
        const w = where + '.' + name;
        const inst = (fe.i && fe.i[name]) || tdef.i;
        if (!tdef.perc && !(_.inst && typeof _.inst[inst] === 'function')) fail(w, 'unknown instrument "' + inst + '"');
        const oct = (tdef.o || 4) + ((fe.o && fe.o[name]) || 0);
        let str = content;
        let unit = tdef.u || 0.5;
        if (typeof content === 'object') {
          str = content.n;
          unit = content.u || unit;
        }
        const barUnits = meter / unit;
        const tri = tIndex[name];
        const vScale = (tdef.vel || 1) * dyn * ((fe.v && fe.v[name]) || 1); // fe.v: a part played softer in this pass

        if (tdef.perc) {
          const raw = String(str).replace(/\s+/g, '');
          if (raw.includes('|')) {
            const parts = raw.split('|').filter((p) => p.length);
            parts.forEach((p, k) => {
              if (p.length !== barUnits) fail(w, 'percussion bar ' + (k + 1) + ' has ' + p.length + ' steps, expected ' + barUnits);
            });
          }
          const chars = raw.replace(/\|/g, '');
          if (!chars.length) fail(w, 'empty percussion line');
          const lineBeats = chars.length * unit;
          for (let start = 0; start < secBeats - 1e-9; start += lineBeats) {
            for (let k = 0; k < chars.length; k++) {
              const b = start + k * unit;
              if (b >= secBeats - 1e-9) break;
              const chr = chars[k];
              if (chr === '.') continue;
              const letter = chr.toLowerCase();
              if (!_.perc[letter]) fail(w, 'unknown percussion letter "' + chr + '"');
              events.push({
                t: tSec + (b + beatShift(b)) * spb, d: unit * spb, p: letter,
                v: 0.8 * vScale * (chr !== letter ? PERC_ACCENT : 1), tr: tri, i: 'perc',
              });
            }
          }
          continue;
        }

        if (tdef.pat || tdef.hold) {
          if (!segs) fail(w, 'pattern track needs chords (ch) in the section');
          const base = degMidi(keyPc, mode, oct, 0, 0);
          const toneMidi = (mb, info) => {
            let m = mb.n === 0 && tdef.bass ? info.bass : info.tones[mb.n];
            m += mb.acc;
            if (tdef.fold === 'all') {
              const lo = base + (tdef.win || 0);
              while (m < lo) m += 12;
              while (m >= lo + 12) m -= 12;
            }
            return m + 12 * mb.oc + tr;
          };
          const emit = (list, b0, b1, members, vel, first) => {
            for (const sg of list) {
              const s0 = Math.max(b0, sg.b0);
              const s1 = Math.min(b1, sg.b1);
              if (s1 - s0 <= 1e-9 || !sg.ch) continue;
              const info = chordTones(sg.ch, keyPc, mode, oct);
              const seen = new Set();
              for (const mb of members) {
                const midi = toneMidi(mb, info);
                if (seen.has(midi)) continue;
                seen.add(midi);
                events.push({
                  t: tSec + (s0 + beatShift(s0)) * spb, d: (s1 - s0) * spb, m: midi,
                  v: 0.8 * vel * vScale * accent(s0) * (s0 > b0 + 1e-9 && !first ? 0.85 : 1),
                  tr: tri, i: inst, sd: null,
                });
              }
            }
          };
          if (tdef.hold) {
            const pl = parseLine(str, 'pat', Infinity, w);
            const members = pl.notes[0].members;
            // merge consecutive identical chords so held pads do not retrigger
            let i = 0;
            while (i < segs.length) {
              let j = i;
              while (j + 1 < segs.length && segs[j + 1].src === segs[i].src) j++;
              if (segs[i].ch) {
                const b0 = segs[i].b0;
                const b1 = segs[j].b1;
                emit([{ b0, b1, ch: segs[i].ch }], b0, b1, members, pl.notes[0].vel, true);
              }
              i = j + 1;
            }
            continue;
          }
          const pl = parseLine(str, 'pat', barUnits, w);
          const lineBeats = pl.units * unit;
          for (let start = 0; start < secBeats - 1e-9; start += lineBeats) {
            for (const n of pl.notes) {
              const b0 = start + n.pos * unit;
              if (b0 >= secBeats - 1e-9) break;
              const b1 = Math.min(b0 + n.len * unit, secBeats);
              emit(segs, b0, b1, n.members, n.vel, false);
            }
          }
          continue;
        }

        // melody
        const pl = parseLine(str, 'mel', barUnits, w);
        const lineBeats = pl.units * unit;
        const reps = secBeats / lineBeats;
        if (Math.abs(reps - Math.round(reps)) > 1e-6 || Math.round(reps) < 1) {
          fail(w, 'melody is ' + lineBeats + ' beats; section is ' + secBeats + ' beats (must be equal or divide evenly)');
        }
        for (let r = 0; r < Math.round(reps); r++) {
          for (const n of pl.notes) {
            const b = r * lineBeats + n.pos * unit;
            const single = n.members.length === 1;
            for (const mb of n.members) {
              const d0 = mb.n - 1 + 7 * mb.oc;
              events.push({
                t: tSec + (b + beatShift(b)) * spb,
                d: n.len * unit * spb * (tdef.leg || 1),
                m: degMidi(keyPc, mode, oct, d0, mb.acc) + tr,
                v: 0.8 * n.vel * vScale * accent(b),
                tr: tri, i: inst,
                sd: single ? oct * 7 + d0 : null,
              });
            }
          }
        }
      }
      const chordInfo = segs
        ? segs.filter((sg) => sg.ch).map((sg) => {
          const info = chordTones(sg.ch, keyPc, mode, 4);
          return { t0: tSec + sg.b0 * spb, t1: tSec + sg.b1 * spb, src: sg.src, tones: info.tones.slice(0, 3).map((m) => ((m + tr) % 12 + 12) % 12) };
        })
        : [];
      sections.push({ s: fe.s, start: tSec, beats: secBeats, seconds: secBeats * spb, bars, key: keyName, mode: modeName, bpm, spb, meter, chords: chordInfo });
      tSec += secBeats * spb;
    });

    for (const e of events) {
      if (e.m != null && !(e.m >= 21 && e.m <= 108)) fail(id, 'note out of range (MIDI ' + e.m + ') on track ' + names[e.tr] + ' at ' + e.t.toFixed(2) + 's');
      if (!(e.d > 0)) fail(id, 'non-positive duration on track ' + names[e.tr]);
    }
    events.sort((a, b) => a.t - b.t || a.tr - b.tr);
    const loop = def.loop !== false;
    let loopIdx = events.findIndex((e) => e.t >= loopStart - 1e-9);
    if (loopIdx < 0) loopIdx = events.length;
    if (loop && loopIdx >= events.length) fail(id, 'loop region has no events');
    return {
      id,
      title: def.title || id,
      events,
      length: tSec,
      loop,
      loopStart,
      loopIdx,
      bpm: def.bpm,
      echo: def.echo || null,
      tracks: names.map((n) => Object.assign({ name: n }, def.tracks[n])),
      sections,
    };
  };

  const compiled = new Map();
  _.getSong = function (id) {
    if (!compiled.has(id)) {
      const def = _.songDefs && _.songDefs[id];
      if (!def) return null;
      compiled.set(id, _.compile(def));
    }
    return compiled.get(id);
  };

  // ------------------------------------------------------------ player
  const amp = (c, v) => {
    const n = c.createGain();
    n.gain.value = v;
    return n;
  };
  function Player(g, song, when, live) {
    const c = g.ctx;
    this.g = g;
    this.song = song;
    this.live = live;
    this.offset = when; // audio time of song-time 0 for the current cycle
    this.idx = 0;
    this.cycle = 0;
    this.ended = false;
    this.stopping = false;
    this.stopAt = Infinity;
    this.rng = RB.util.rng(RB.util.hashStr(song.id));
    this.dry = amp(c, 1);
    this.wet = amp(c, 1);
    this.dry.connect(g.music);
    this.wet.connect(g.revIn);
    this.nodes = [this.dry, this.wet];
    this.echoIn = null;
    if (song.echo) {
      const d = c.createDelay(2);
      d.delayTime.value = clamp((song.echo.beats || 0.75) * 60 / song.bpm, 0.05, 1.9);
      const fb = amp(c, clamp(song.echo.fb || 0.3, 0, 0.7));
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2600;
      const out = amp(c, song.echo.mix || 0.3);
      this.echoIn = amp(c, 1);
      this.echoIn.connect(d);
      d.connect(lp);
      lp.connect(fb);
      fb.connect(d);
      lp.connect(out);
      out.connect(this.dry);
      out.connect(this.wet);
      this.nodes.push(d, fb, lp, out, this.echoIn);
    }
    this.strips = song.tracks.map((tk) => {
      const inp = amp(c, tk.v == null ? 0.7 : tk.v);
      let node = inp;
      if (tk.pan && c.createStereoPanner) {
        const p = c.createStereoPanner();
        p.pan.value = clamp(tk.pan, -1, 1);
        inp.connect(p);
        node = p;
        this.nodes.push(p);
      }
      node.connect(this.dry);
      if (tk.rv) {
        const s = amp(c, tk.rv);
        node.connect(s);
        s.connect(this.wet);
        this.nodes.push(s);
      }
      if (tk.dl && this.echoIn) {
        const s = amp(c, tk.dl);
        node.connect(s);
        s.connect(this.echoIn);
        this.nodes.push(s);
      }
      this.nodes.push(inp);
      return inp;
    });
  }
  Player.prototype.pump = function (until) {
    const ev = this.song.events;
    const now = this.g.ctx.currentTime;
    until = Math.min(until, this.stopAt);
    let guard = 0;
    while (!this.ended && guard++ < 100000) {
      if (this.idx >= ev.length) {
        if (!this.song.loop) {
          this.ended = true;
          this.endTime = this.offset + this.song.length;
          break;
        }
        this.offset += this.song.length - this.song.loopStart;
        this.idx = this.song.loopIdx;
        this.cycle++;
        continue;
      }
      const e = ev[this.idx];
      const at = this.offset + e.t;
      if (at >= until) break;
      this.idx++;
      if (this.live ? at < now - 0.05 : at < 0) continue; // late (tab stalled): drop, don't burst
      this.fire(e, Math.max(at, now));
    }
  };
  Player.prototype.fire = function (e, at) {
    const r = this.rng;
    const out = this.strips[e.tr];
    try {
      if (e.p) {
        _.perc[e.p](this.g, out, at, e.v * (0.94 + r() * 0.12), r());
      } else {
        const jit = (r() - 0.5) * 0.012;
        const t = Math.max(at + jit, this.g.ctx.currentTime);
        _.inst[e.i](this.g, out, t, _.mtof(e.m), e.d, e.v * (0.94 + r() * 0.1));
      }
    } catch (err) {
      st.lastError = String(err && err.message);
    }
  };
  Player.prototype.fade = function (from, to, secs) {
    const now = this.g.ctx.currentTime;
    for (const n of [this.dry, this.wet]) {
      n.gain.cancelScheduledValues(now);
      n.gain.setValueAtTime(from, now);
      n.gain.linearRampToValueAtTime(to, now + Math.max(secs, 0.01));
    }
  };
  Player.prototype.stop = function (secs) {
    if (this.stopping) return;
    this.stopping = true;
    const now = this.g.ctx.currentTime;
    secs = Math.max(secs, 0.02);
    const cur = this.dry.gain.value;
    this.fade(cur, 0, secs);
    this.stopAt = now + secs;
    this.disposeAt = now + secs + 4; // let reverb/echo tails die under zero gain
  };
  Player.prototype.dispose = function () {
    for (const n of this.nodes) {
      try { n.disconnect(); } catch (e) { /* ignore */ }
    }
    this.nodes = [];
    this.disposed = true;
  };
  _.Player = Player;

  // ------------------------------------------------------ live scheduler
  const LOOKAHEAD = 0.2;
  const TICK_MS = 25;
  const players = [];
  let cur = null;
  let timer = null;

  function tick() {
    const c = st.ctx;
    if (!c) return;
    const hidden = typeof document !== 'undefined' && document.hidden;
    const until = c.currentTime + (hidden ? 1.5 : LOOKAHEAD); // background timers are throttled
    for (const p of players) if (!p.disposed) p.pump(until);
    for (let i = players.length - 1; i >= 0; i--) {
      const p = players[i];
      if (p.ended && !p.stopping && c.currentTime > p.endTime + 0.05) {
        // a non-looping song finished naturally
        p.stopping = true;
        p.disposeAt = c.currentTime + 4;
        if (p === cur) {
          cur = null;
          st.wantSong = null;
          if (RB.bus) RB.bus.emit('audio:songend', { id: p.song.id });
        }
      }
      if (p.disposeAt && c.currentTime > p.disposeAt) {
        p.dispose();
        players.splice(i, 1);
      }
    }
    if (!players.length && timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  function ensureTimer() {
    if (!timer) timer = setInterval(tick, TICK_MS);
  }

  A.playSong = function (id, opts) {
    opts = opts || {};
    if (id == null || id === '') return false;
    if (!_.songDefs || !_.songDefs[id]) {
      if (typeof console !== 'undefined') console.warn('[audio] unknown song', id);
      return false;
    }
    st.wantSong = id;
    if (!st.g || !st.ctx) return false; // starts after init()
    if (cur && cur.song.id === id && !cur.stopping && !opts.restart) return true;
    let song;
    try {
      song = _.getSong(id);
    } catch (e) {
      st.lastError = String(e && e.message);
      return false;
    }
    const fade = Math.max(0, opts.fade == null ? 800 : +opts.fade) / 1000;
    const now = st.ctx.currentTime;
    const had = !!cur;
    if (cur) cur.stop(fade);
    const p = new Player(st.g, song, now + 0.06, true);
    p.fade(0, 1, had ? Math.max(fade, 0.05) : Math.min(Math.max(fade, 0.05), 0.3));
    cur = p;
    players.push(p);
    ensureTimer();
    tick();
    return true;
  };

  A.stopSong = function (opts) {
    opts = opts || {};
    st.wantSong = null;
    if (!cur) return;
    cur.stop(Math.max(0, opts.fade == null ? 800 : +opts.fade) / 1000);
    cur = null;
    ensureTimer();
  };

  A.currentSong = () => (cur ? cur.song.id : st.wantSong || null);

  // Start any song requested before the context existed.
  _.hooks.init.push(() => {
    if (st.wantSong && !cur) A.playSong(st.wantSong, { fade: 600 });
  });

  A.songList = function () {
    return Object.keys(_.songDefs || {}).map((id) => {
      const d = _.songDefs[id];
      let seconds = null;
      let loopSeconds = null;
      try {
        const s = _.getSong(id);
        seconds = Math.round(s.length * 10) / 10;
        loopSeconds = s.loop ? Math.round((s.length - s.loopStart) * 10) / 10 : null;
      } catch (e) { /* reported by tests */ }
      return { id, title: d.title, kind: d.kind || null, chapter: d.chapter || null, motifs: (d.motifs || []).slice(), notes: d.notes || '', seconds, loopSeconds, loop: d.loop !== false };
    });
  };

  // Shared motifs with their degree spelling and a note on what they mean.
  A.motifList = () => Object.keys(_.motifs || {}).map((id) => ({ id, degrees: _.motifs[id].deg, notes: _.motifs[id].notes }));

  // ------------------------------------------------------ offline render
  // Renders a song (or 'sfx:<id>') into an OfflineAudioContext through the
  // same graph as live playback. Channels 0-1 = final output, 2-3 = the
  // pre-dynamics tap. Resolves {rms, peak, rawPeak, nan, clipped, seconds}.
  A.renderOffline = function (id, seconds, opts) {
    opts = opts || {};
    const O = _.OAC();
    seconds = clamp(Number(seconds) || 8, 0.1, 600);
    if (!O) return Promise.resolve({ unsupported: true, rms: 0, peak: 0, rawPeak: 0, nan: false, seconds });
    const sr = opts.sampleRate || 44100;
    const len = Math.ceil(sr * seconds);
    let ctx;
    try {
      ctx = new O({ numberOfChannels: 4, length: len, sampleRate: sr });
    } catch (e) {
      ctx = new O(4, len, sr);
    }
    const g = _.buildGraph(ctx, Object.assign({}, _.DEFAULT_VOL, opts.vol || {}), false);
    const merger = ctx.createChannelMerger(4);
    const s1 = ctx.createChannelSplitter(2);
    const s2 = ctx.createChannelSplitter(2);
    g.out.connect(s1);
    s1.connect(merger, 0, 0);
    s1.connect(merger, 1, 1);
    g.tap.connect(s2);
    s2.connect(merger, 0, 2);
    s2.connect(merger, 1, 3);
    try { ctx.destination.channelInterpretation = 'discrete'; } catch (e) { /* ignore */ }
    merger.connect(ctx.destination);
    try {
      if (String(id).startsWith('sfx:')) {
        if (!_.sfxPlay(g, String(id).slice(4), 0.05, opts)) return Promise.reject(new Error('unknown sfx ' + id));
      } else {
        const song = _.getSong(id);
        if (!song) return Promise.reject(new Error('unknown song ' + id));
        const p = new Player(g, song, 0.05 - (opts.offset || 0), false);
        if (Array.isArray(opts.solo)) {
          // balance analysis: silence every track not listed
          song.tracks.forEach((tk, i) => { if (!opts.solo.includes(tk.name)) p.strips[i].gain.value = 0; });
        }
        p.pump(seconds);
      }
    } catch (e) {
      return Promise.reject(e);
    }
    return ctx.startRendering().then((buf) => {
      const L = buf.getChannelData(0);
      const R = buf.getChannelData(1);
      const L2 = buf.getChannelData(2);
      const R2 = buf.getChannelData(3);
      let sum = 0;
      let peak = 0;
      let raw = 0;
      let nan = false;
      let clipped = 0;
      let dsum = 0;
      let prev = 0;
      // longest run of 50 ms windows quieter than -55 dBFS (after the first 0.1 s)
      const win = Math.floor(sr * 0.05);
      const quiet = Math.pow(10, -55 / 20);
      let wsum = 0;
      let wn = 0;
      let run = 0;
      let longest = 0;
      for (let i = 0; i < L.length; i++) {
        const a = L[i];
        const b = R[i];
        if (a !== a || b !== b) { nan = true; continue; }
        sum += a * a + b * b;
        const mono = (a + b) * 0.5;
        dsum += (mono - prev) * (mono - prev);
        prev = mono;
        const m = Math.max(Math.abs(a), Math.abs(b));
        if (m > peak) peak = m;
        if (m >= 0.999) clipped++;
        const m2 = Math.max(Math.abs(L2[i]), Math.abs(R2[i]));
        if (m2 > raw) raw = m2;
        wsum += mono * mono;
        if (++wn === win) {
          if (i > sr * 0.1 && Math.sqrt(wsum / wn) < quiet) { run++; if (run > longest) longest = run; } else run = 0;
          wsum = 0;
          wn = 0;
        }
      }
      let msum = 0;
      for (let i = 0; i < L.length; i++) { const x = (L[i] + R[i]) * 0.5; msum += x * x; }
      // Effective frequency of a sine with the same derivative/level ratio —
      // a crude brightness figure (a harsh mix reads several kHz higher).
      const ratio = msum > 0 ? Math.sqrt(dsum / msum) : 0;
      const brightness = Math.round((sr / Math.PI) * Math.asin(Math.min(1, ratio / 2)));
      return { rms: Math.sqrt(sum / (2 * L.length)), peak, rawPeak: raw, nan, clipped, brightness, longestSilence: longest * 0.05, seconds, sampleRate: sr };
    });
  };
})(RB.audio);
