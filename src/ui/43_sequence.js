/* Illustrated sequences with manual advancement (the Harmony & Expressive Storytelling addendum §17–§19;
 * docs/expressive/CONTRACT.md §3.5; shot plans and common rules in docs/expressive/SHOTS.md §0).
 *
 * A sequence is a run of a scene's existing lines shown as pictures in place of the map. Nothing in it is
 * timed: text speed reveals the line, and only the reader moves on (Next). A shot's one-time action plays
 * once, then the shot holds — calm, with only ambient motion — for as long as the reader likes. TTS, music,
 * gestures, focus loss, timers and loops never advance anything.
 *
 * ---- Authoring (scene scripts; the validator and the quest guide know these ops) --------------------------
 *   !sequence <seqId> begin     after the scene's own entry transition: the map dissolves into the first shot
 *   !shot <shotId> [phase]      before the line the shot (or its phase's one-time action) opens with. A new
 *                               shot dissolves in (≈350 ms); a phase of the shot on screen starts that phase's
 *                               action (phases only go forward: earlier ones stay at their end state)
 *   !sequence <seqId> end       before the return to the world: the picture dissolves back into the map
 * State commands (!set !give !take !quest !note !refresh …) stay where they are and run once; review and
 * replay never run them. `?(cond)` prefixes work on these ops as on any, so a branch-only shot or phase is
 * written like a branch-only line. Inside a sequence the world is behind the picture: !move and !walkto
 * finish at once (the shots show the movement), !emote does not wait, !shake never fires, and !fade is left
 * to the shots (a scene begun in the dark — after a !fade out — has the dark lifted over its first shot and
 * put back at `end`, so the scene's own !fade in shows the world as written).
 *
 * ---- Shots (one file per chapter: 43a_seq_ch1.js, 43b_seq_ch2.js; later 43c_…, 43d_… add their own) ------
 *   RB.sequence.define(seqId, { title: { en, jp }, chapter, scene, memory: bool, enter: ms, exit: ms,
 *                               shots: { [shotId]: shot } })
 *   RB.sequence.shot(seqId, shotId, shot)   add or replace one shot of a defined sequence
 *   shot = { phases: [[id, ms], …] | { id: ms, … },     the one-time actions in order (the first starts with
 *                                                        the shot, after its entrance); ms 0 = no action
 *            draw(c, w, h, t, st),                       at art resolution; c is the buffer (w × h)
 *            focus(w, h, vb, st) → { x, y, w, h }        optional: the faces / focal object (tests check it
 *                                                        sits above the sheet at every screen shape)
 *            safe: { wide, narrow, land } }              optional notes (SHOTS.md safe areas)
 *   st = { seq, shot, phase, pi, k (0..1 through this phase's action, then 1 for good), at(phase) → 0..1,
 *          since (ms in this shot), vb (the sheet's top: keep the focal area above it), still (reduced motion:
 *          k is 1 at once and ambient motion stops), review (a read-only look back), hold (the action is
 *          over), cast: { pc: the player's look snapshotted at entry, comp: { id, look } | null — only a
 *          companion who is actually here }, test(cond) (RB.state.test on the campaign), t (ms, ambient) }
 *   The shared drawing kit is RB.seqKit (43_sequence_kit.js). A shot reads state; it never writes it.
 *
 * ---- Runtime -----------------------------------------------------------------------------------------
 *   RB.sequence.active() / state() / stats()          (tests: state, token, shot, phase, beats, review …)
 *   RB.sequence.dispose(why)                          scene end, error, campaign change (also automatic)
 *   RB.sequence.view(o) → Promise                     a sequence outside a scene with its own caption slip
 *                                                     (the prologue, a replay, the dev viewer)
 *   RB.sequence.replay(ref)                           a read-only replay of a kept memory (Company)
 *   RB.sequence.Player                                the state machine on its own (unit tests)
 * States: entering → presenting (one-time action) → holding (indefinitely) → advancing (the reader moved on)
 * → … → exiting → disposed; reviewing while the reader looks back with Previous. Every instance has a token;
 * a callback of an old instance never touches a newer one. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.sequence = (function () {
  'use strict';
  const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const esc = (s) => (RB.util && RB.util.esc ? RB.util.esc(s) : String(s));
  const hasDom = () => typeof document !== 'undefined' && !!document.getElementById;
  const ENTER = 350, EXIT = 300;

  // ---- registry -----------------------------------------------------------------------------------------
  const DEFS = {};
  function normPhases(p) {
    if (!p) return [{ id: 'hold', ms: 0 }];
    const a = Array.isArray(p)
      ? p.map((x) => (Array.isArray(x) ? { id: String(x[0]), ms: +x[1] || 0 } : typeof x === 'string' ? { id: x, ms: 0 } : { id: String(x.id), ms: +x.ms || 0 }))
      : Object.keys(p).map((k) => ({ id: k, ms: +p[k] || 0 }));
    return a.length ? a : [{ id: 'hold', ms: 0 }];
  }
  function define(id, def) {
    def = def || {};
    const d = Object.assign({ enter: ENTER, exit: EXIT, title: null, chapter: null, scene: null, memory: false }, def, { id, shots: {} });
    DEFS[id] = d;
    for (const k in def.shots || {}) shot(id, k, def.shots[k]);
    return d;
  }
  function shot(id, shotId, sd) {
    const d = DEFS[id] || define(id, {});
    d.shots[shotId] = Object.assign({}, sd, { id: shotId, phases: normPhases(sd && sd.phases) });
    return d.shots[shotId];
  }
  const get = (id) => DEFS[id] || null;
  const ids = () => Object.keys(DEFS);

  // ---- the player: one sequence's state machine and its drawing --------------------------------------------
  let TOK = 0;
  function Player(def, o) {
    o = o || {};
    this.def = typeof def === 'string' ? DEFS[def] : def;
    if (!this.def) throw new Error('unknown sequence ' + def);
    this.now = o.now || nowMs;
    this.isStill = o.still || (() => !!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion()));
    this.cast = o.cast || {};
    this.test = o.test || (() => false);
    this.tok = ++TOK;
    this.state = 'entering';
    this.cur = null;      // { id, sd, pi, t0 (entered), a0 (the current phase's action starts) }
    this.beats = [];      // reached beats: { i, shot, pi, line }
    this.rv = -1;         // the beat looked back at (-1: live)
    this.rep = null;      // a replay of a shot's actions { id, pi, at }
    this.from = null;     // the picture this shot dissolves from (the map, the previous shot, black)
    this.t0 = 0;
    this.enter = this.def.enter != null ? this.def.enter : ENTER;
    this.last = null;     // the buffer last drawn into { cv, w, h } (for the next dissolve)
    this.drawn = 0;
  }
  const PP = Player.prototype;
  PP.shotDef = function (id) { return this.def.shots[id] || null; };
  PP.copyLast = function () {
    const L = this.last;
    if (!L || !L.cv || !L.w || !L.h) return null;
    const cv = RB.sprites.makeCanvas(L.w, L.h);
    cv.getContext('2d').drawImage(L.cv, 0, 0, L.w, L.h, 0, 0, L.w, L.h);
    return cv;
  };
  // the picture to dissolve from (the map's last frame at entry, black for a sequence's first shot)
  PP.setFrom = function (cv) {
    if (this.state === 'disposed' || this.state === 'exiting') return;
    this.from = cv;
    const t = this.now();
    this.t0 = t;
    if (this.cur) { this.cur.t0 = t; this.cur.a0 = t + this.enter; }
    if (this.rv < 0) this.state = 'entering';
  };
  PP.toShot = function (id, phase) {
    if (this.state === 'disposed' || this.state === 'exiting') return false;
    const sd = this.shotDef(id);
    if (!sd) { if (typeof console !== 'undefined') console.warn('sequence ' + this.def.id + ': no shot ' + id); return false; }
    if (this.cur && this.cur.id === id) return phase ? this.phase(phase) : true;
    if (this.rv >= 0) this.endReview();
    const t = this.now();
    const from = this.copyLast();
    let pi = 0;
    if (phase) { pi = sd.phases.findIndex((p) => p.id === phase); if (pi < 0) pi = 0; }
    this.from = from;
    this.cur = { id, sd, pi, t0: t, a0: t + (from ? this.enter : 0) };
    this.t0 = t;
    this.rep = null;
    this.state = from ? 'entering' : this.kAt(pi, t) >= 1 ? 'holding' : 'presenting';
    return true;
  };
  PP.phase = function (id) {
    const c = this.cur;
    if (!c || this.state === 'disposed' || this.state === 'exiting') return false;
    const j = c.sd.phases.findIndex((p) => p.id === id);
    if (j < 0) { if (typeof console !== 'undefined') console.warn('sequence ' + this.def.id + ': shot ' + c.id + ' has no phase ' + id); return false; }
    if (j <= c.pi) return true; // phases only go forward
    const t = this.now();
    c.pi = j;
    c.a0 = Math.max(t, this.state === 'entering' ? c.t0 + this.enter : t);
    this.rep = null;
    if (this.state !== 'entering' && this.rv < 0) this.state = this.kAt(j, t) >= 1 ? 'holding' : 'presenting';
    return true;
  };
  // progress (0..1) of phase j's one-time action at time t
  PP.kAt = function (j, t, view) {
    const v = view || this.cur;
    if (!v) return 1;
    const sd = view ? this.shotDef(view.shot) : v.sd, pi = v.pi;
    if (!sd) return 1;
    if (this.isStill()) return j <= pi ? 1 : 0;
    const id = view ? view.shot : v.id;
    if (this.rep && this.rep.id === id) {
      if (j > this.rep.pi) return 0;
      let start = this.rep.at;
      for (let i = 0; i < j; i++) start += sd.phases[i].ms;
      const ms = sd.phases[j].ms;
      return ms ? clamp((t - start) / ms, 0, 1) : t >= start ? 1 : 0;
    }
    if (j < pi) return 1;
    if (j > pi || view) return view ? (j <= pi ? 1 : 0) : 0;
    const ms = sd.phases[j] ? sd.phases[j].ms : 0;
    if (!ms) return t >= v.a0 ? 1 : 0;
    return clamp((t - v.a0) / ms, 0, 1);
  };
  PP.repDone = function (t, id, pi) {
    const sd = this.shotDef(id);
    let end = this.rep.at;
    for (let i = 0; i <= pi; i++) end += sd.phases[i].ms;
    return t >= end;
  };
  PP.tick = function (t) {
    if (this.state === 'entering' && t - this.t0 >= this.enter) { this.from = null; this.state = 'presenting'; }
    if (this.rep) {
      const v = this.rv >= 0 ? this.beats[this.rv] : this.cur ? { shot: this.cur.id, pi: this.cur.pi } : null;
      if (!v || this.repDone(t, v.shot, v.pi)) this.rep = null;
    }
    if (this.state === 'presenting' && !this.rep && this.kAt(this.cur ? this.cur.pi : 0, t) >= 1) this.state = 'holding';
    return this.state;
  };
  // an early advance: the entrance and the action jump to their end (the reader asked to move on)
  PP.settle = function () {
    if (this.cur) { this.cur.t0 = -1e9; this.cur.a0 = -1e9; }
    this.t0 = -1e9;
    this.from = null;
    this.rep = null;
    if (this.state === 'entering' || this.state === 'presenting') this.state = 'holding';
  };
  // a press during the entrance completes the dissolve only (it never also moves the beat on)
  PP.settleEntrance = function () {
    if (this.state !== 'entering') return false;
    const t = this.now();
    this.from = null;
    this.t0 = t - this.enter;
    if (this.cur) { this.cur.t0 = this.t0; this.cur.a0 = t; }
    this.state = this.kAt(this.cur ? this.cur.pi : 0, t) >= 1 ? 'holding' : 'presenting';
    return true;
  };
  PP.advance = function () {
    if (this.rv >= 0) this.endReview();
    this.settle();
    if (this.state !== 'disposed' && this.state !== 'exiting') this.state = 'advancing';
  };
  PP.beat = function (line) {
    if (this.state === 'disposed') return null;
    if (this.rv >= 0) this.endReview();
    const b = { i: this.beats.length, shot: this.cur ? this.cur.id : null, pi: this.cur ? this.cur.pi : 0, line: line || null };
    this.beats.push(b);
    if (this.beats.length > 400) this.beats.splice(0, this.beats.length - 400);
    if (this.state === 'advancing') this.state = this.kAt(b.pi, this.now()) >= 1 ? 'holding' : 'presenting';
    return b;
  };
  // Previous: one reached beat back (read-only); Next while looking back walks forward and rejoins the
  // live beat without moving it on
  PP.prev = function () {
    if (this.state === 'disposed' || this.state === 'exiting') return null;
    if (this.rv < 0) {
      if (this.beats.length < 2) return null;
      this.settle();
      this.rv = this.beats.length - 2;
    } else if (this.rv > 0) this.rv--;
    else return null;
    this.rep = null;
    this.state = 'reviewing';
    return this.beats[this.rv];
  };
  PP.fwd = function () {
    if (this.rv < 0) return null;
    this.rv++;
    this.rep = null;
    if (this.rv >= this.beats.length - 1) { this.endReview(); return { live: true, beat: this.beats[this.beats.length - 1] || null }; }
    return this.beats[this.rv];
  };
  PP.endReview = function () {
    if (this.rv < 0) return;
    this.rv = -1;
    this.rep = null;
    this.settle();
    if (this.state === 'reviewing') this.state = 'holding';
  };
  // Replay this shot: its one-time actions again, in order, up to where it is (presentation only)
  PP.replay = function () {
    if (this.state === 'disposed' || this.state === 'exiting') return false;
    const v = this.rv >= 0 ? this.beats[this.rv] : this.cur ? { shot: this.cur.id, pi: this.cur.pi } : null;
    if (!v || !v.shot) return false;
    if (this.state === 'entering') this.settleEntrance();
    this.rep = { id: v.shot, pi: v.pi, at: this.now() };
    if (this.rv < 0) this.state = 'presenting';
    return true;
  };
  PP.view = function () {
    const r = this.rv >= 0 ? this.beats[this.rv] : null;
    return r ? { shot: r.shot, pi: r.pi, review: true } : this.cur ? { shot: this.cur.id, pi: this.cur.pi, review: false } : null;
  };
  PP.stOf = function (w, h, vb, t, T) {
    const v = this.view();
    if (!v || !v.shot) return null;
    const sd = this.shotDef(v.shot);
    if (!sd) return null;
    const review = v.review, vw = review ? { shot: v.shot, pi: v.pi } : null;
    const kOf = (j) => (review && !(this.rep && this.rep.id === v.shot) ? (j <= v.pi ? 1 : 0) : this.kAt(j, T, vw));
    const pi = v.pi;
    return {
      seq: this.def.id, shot: v.shot, phase: sd.phases[pi].id, pi, k: kOf(pi),
      at: (name) => { const j = typeof name === 'number' ? name : sd.phases.findIndex((p) => p.id === name); return j < 0 ? 0 : kOf(j); },
      since: review || !this.cur ? 1e9 : T - this.cur.t0, vb, still: this.isStill(), review, hold: this.state === 'holding' || this.state === 'advancing' || review,
      cast: this.cast, test: this.test, t, sd,
    };
  };
  PP.draw = function (c, w, h, t, vb) {
    const T = this.now();
    this.tick(T);
    this.last = { cv: c.canvas, w, h };
    c.imageSmoothingEnabled = false;
    const st = this.stOf(w, h, vb, t, T);
    if (!st) {
      if (this.from) c.drawImage(this.from, 0, 0, w, h);
      else { c.fillStyle = '#07080d'; c.fillRect(0, 0, w, h); }
      return null;
    }
    st.sd.draw(c, w, h, t, st);
    if (!st.review && this.state === 'entering' && this.from) {
      const e = clamp((T - this.t0) / this.enter, 0, 1);
      c.globalAlpha = 1 - e;
      c.drawImage(this.from, 0, 0, w, h);
      c.globalAlpha = 1;
    }
    this.drawn++;
    return st;
  };
  PP.info = function () {
    const v = this.view(), sd = v && this.shotDef(v.shot), T = this.now();
    return {
      tok: this.tok, seq: this.def.id, state: this.state, shot: v ? v.shot : null, phase: sd ? sd.phases[v.pi].id : null,
      k: v && !v.review ? this.kAt(v.pi, T) : v ? 1 : null, beats: this.beats.length, review: this.rv, replaying: !!this.rep, drawn: this.drawn,
    };
  };
  PP.dispose = function () {
    this.state = 'disposed';
    this.from = null; this.last = null; this.rep = null;
    this.beats = []; this.rv = -1;
  };

  // ---- seen lines and the skip control ----------------------------------------------------------------------
  const lineHash = (l) => (RB.util && RB.util.hashStr ? RB.util.hashStr(String(l.jp || '') + '||' + String(l.en || '')).toString(36) : String(l.jp || '') + '||' + String(l.en || ''));
  // the campaign's record of what was shown: s.seq[seqId] = { n: times it reached its end, h: [line hashes] }
  // (optional; older campaigns gain an empty record through 80_save.js migrate)
  function seenRec(s, id) {
    if (!s) return null;
    if (!s.seq || typeof s.seq !== 'object' || Array.isArray(s.seq)) s.seq = {};
    let r = s.seq[id];
    if (!r || typeof r !== 'object') r = s.seq[id] = { n: 0, h: [] };
    if (!Array.isArray(r.h)) r.h = [];
    return r;
  }
  const STOPS = new Set(['choice', 'challenge', 'activity', 'battle', 'lesson', 'teach', 'shop', 'inn', 'menu', 'credits', 'recruit', 'depart']);
  // Is any line between here (command index `from` of scene sc) and the sequence's end new to this campaign?
  // Follows !goto and !if as the runner would now and looks into !call'ed scenes; stops where a skip stops
  // (a choice, a challenge, a decision), since a skip never goes past those.
  function aheadUnseen(sc, from, seqId, seen, test, depth) {
    if (!sc) return false;
    let pc = from, guard = 0;
    while (pc < sc.cmds.length && guard++ < 600) {
      const c = sc.cmds[pc++];
      if (c.if && !test(c.if)) continue;
      const a = c.args || [];
      if (c.op === 'sequence' && a[0] === seqId && a[1] === 'end') return false;
      if (c.op === 'say') { if (!seen.has(lineHash(c))) return true; continue; }
      if (STOPS.has(c.op) || c.op === 'end') return false;
      if (c.op === 'goto' || c.op === 'if') {
        let to = c.op === 'goto' ? a[0] : null;
        if (c.op === 'if') { const i = a.indexOf('->'); if (i >= 0 && test(a.slice(0, i).join(' '))) to = a[i + 1]; }
        if (to == null) continue;
        if (to === 'end' || sc.labels[to] == null) return false;
        pc = sc.labels[to];
        continue;
      }
      if (c.op === 'call' && (depth || 0) < 3) { if (aheadUnseen(RB.content.scenes[a[0]], 0, seqId, seen, test, (depth || 0) + 1)) return true; }
    }
    return false;
  }

  // ---- counters (tests: bounded listeners, timers, layers over many entries) ----------------------------------
  const S = { begun: 0, ended: 0, disposed: 0, skipped: 0, listeners: 0, timers: 0, overlays: 0, errors: 0, views: 0, reviews: 0, replays: 0, absorbed: 0 };
  const timers = new Set();
  function later(fn, ms) {
    const id = setTimeout(() => { timers.delete(id); S.timers = timers.size; fn(); }, ms);
    timers.add(id); S.timers = timers.size;
    return id;
  }
  function cancelTimers(set) { for (const id of set) { clearTimeout(id); timers.delete(id); } set.clear(); S.timers = timers.size; }

  // ---- icons for the controls (24 × 24, stroke currentColor; read by RB.ui.folio.icon) ------------------------
  if (RB.ui && RB.ui.folio && RB.ui.folio.ICONS) Object.assign(RB.ui.folio.ICONS, {
    'sq-prev': '<path d="M15 5l-7 7 7 7"/>',
    'sq-replay': '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 3.5v4h4"/>',
    'sq-hide': '<path d="M3 3l18 18"/><path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4.5 9.5 6-0.5 0.8-1.5 2.1-2.9 3.3M6.3 7.6C4.6 8.9 3.2 10.7 2.5 12c1 1.5 4.5 6 9.5 6 1.6 0 3-0.4 4.2-1.1"/><path d="M9.9 10a3 3 0 0 0 4.1 4.2"/>',
    'sq-show': '<path d="M2.5 12c1-1.5 4.5-6 9.5-6s8.5 4.5 9.5 6c-1 1.5-4.5 6-9.5 6s-8.5-4.5-9.5-6z"/><circle cx="12" cy="12" r="3"/>',
    'sq-skip': '<path d="M5 5l7 7-7 7"/><path d="M12 5l7 7-7 7"/>',
    'sq-scene': '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 9h18M7 5v4M12 5v4M17 5v4"/>',
  });
  const I = (n) => (RB.ui && RB.ui.folio && RB.ui.folio.icon ? RB.ui.folio.icon(n) : '');
  // bindings for the three new controls (Settings › Controls lists and remaps them; older settings records
  // lack them and take these): Next is `ok`, the skip control is `cancel`, History is `log` (unchanged)
  if (RB.input && RB.input.DEFAULT_BINDS && !RB.input.DEFAULT_BINDS.prev) {
    Object.assign(RB.input.DEFAULT_BINDS, { prev: ['KeyP', 'PageUp'], replay: ['KeyR'], hide: ['KeyI'] });
    Object.assign(RB.input.ACTION_LABELS, { prev: 'Previous line (in a scene)', replay: 'Replay this shot (in a scene)', hide: 'Hide or show the text (in a scene)' });
  }
  const keyOf = (a) => { try { const b = RB.input.getBinds()[a] || []; return b.length ? RB.input.keyName(b[0]) : ''; } catch (e) { return ''; } };

  // ---- the scene driver ------------------------------------------------------------------------------------
  let D = null; // the sequence of the scene being played
  const black = (w, h) => { const cv = RB.sprites.makeCanvas(Math.max(1, w), Math.max(1, h)), g = cv.getContext('2d'); g.fillStyle = '#05060a'; g.fillRect(0, 0, cv.width, cv.height); return cv; };
  function castOf(s) {
    const W = RB.world && RB.world.W;
    const cid = W && W.comp && W.map ? W.comp.id : null; // only a companion who is here, on this map
    const ch = cid && RB.content.chars[cid];
    let pc = {};
    try { pc = RB.equip ? RB.util.deepClone(RB.equip.look(s)) : {}; } catch (e) { pc = {}; }
    return { pc, comp: ch ? { id: cid, look: RB.util.deepClone(ch.look || {}) } : null };
  }
  function makeFrame(inst) {
    const fn = (c, w, h, t) => {
      if (D !== inst) { c.fillStyle = '#07080d'; c.fillRect(0, 0, w, h); return; }
      try {
        if (!inst.started) {
          inst.started = true;
          // the first frame: dissolve from the map as it last was (or from black when begun in the dark)
          const L = { cv: c.canvas, w, h };
          let from;
          if (inst.lifted) from = black(w, h);
          else { from = RB.sprites.makeCanvas(w, h); from.getContext('2d').drawImage(L.cv, 0, 0, w, h, 0, 0, w, h); }
          inst.p.setFrom(from);
        }
        const vb = RB.interlude ? RB.interlude.sheetTop(inst.rec, h) : Math.round(h * 0.64);
        inst.lastSt = inst.p.draw(c, w, h, t, vb);
        inst.vb = vb; inst.wh = [w, h];
      } catch (err) {
        c.fillStyle = '#07080d'; c.fillRect(0, 0, w, h);
        if (!inst.failed) { inst.failed = true; S.errors++; console.error('sequence', inst.id, err); }
      }
    };
    fn.art = true;
    return fn;
  }
  function begin(id, sc) {
    const def = DEFS[id];
    if (!def) { console.warn('missing sequence', id); return null; }
    if (D) dispose('replaced');
    const s = RB.game && RB.game.s;
    if (RB.interlude && RB.interlude.active()) RB.interlude.clear();
    const p = new Player(def, { cast: castOf(s), test: (cond) => !!(RB.game.s && RB.state.test(RB.game.s, cond)) });
    const inst = { id, def, p, sc: sc || null, s, rec: { top: null }, skip: false, hidden: false, started: false, lifted: false,
      ctrl: null, timers: new Set(), off: [], tok: p.tok, lines: 0 };
    inst.fn = makeFrame(inst);
    D = inst;
    // begun in the dark (after a !fade out): the dark lifts over the first shot and comes back at the end
    if (hasDom() && document.querySelector('#overlay > .fade.on') && RB.ui.fade) { inst.lifted = true; RB.ui.fade(false, def.enter || ENTER); }
    RB.render.setOverride(inst.fn);
    // a tap on the picture while the text is hidden brings the text back (it never moves the scene on)
    const wv = hasDom() && document.getElementById('world');
    if (wv) {
      const onTap = () => { if (D === inst && inst.hidden) setHidden(inst, false); };
      wv.addEventListener('pointerdown', onTap);
      S.listeners++;
      inst.off.push(() => { wv.removeEventListener('pointerdown', onTap); S.listeners--; });
    }
    S.begun++;
    if (RB.bus) RB.bus.emit('sequence:begin', { id, tok: p.tok });
    return inst;
  }
  function toShot(shotId, phase) {
    const inst = D;
    if (!inst) { console.warn('!shot outside a sequence', shotId); return false; }
    const ok = inst.p.toShot(shotId, phase || null);
    if (inst.skip) inst.p.settle();
    return ok;
  }
  // a line is being shown (20_dialogue.js say()): a reached beat; the controls; what this campaign has seen
  function onLine(line) {
    const inst = D;
    if (!inst || !line) return;
    inst.p.beat({ who: line.who, expr: line.expr || null, jp: line.jp || '', en: line.en || '', sceneId: line.sceneId || null, line: line.line || null });
    inst.lines++;
    if (line.sceneId) {
      inst.at = { sceneId: line.sceneId, line: line.line };
      RB.render.setOverride(inst.fn); // (a battle or activity inside the sequence may have taken the screen)
      const s = RB.game.s;
      if (s === inst.s) {
        const r = seenRec(s, inst.id), h = lineHash(line);
        const known = r.h.indexOf(h) >= 0;
        if (!known) { r.h.push(h); if (r.h.length > 200) r.h.splice(0, r.h.length - 200); }
        // seen per line: skipping seen lines stops at the first line of this sequence not yet shown here
        if (!known && RB.game.fastForward && RB.game.fastForward()) RB.game.setFastForward(false);
      }
    }
    ensureControls(inst);
  }
  const skipping = () => !!(D && D.skip);
  function stopSkip(why) {
    const inst = D;
    if (!inst) return;
    if (inst.skip) { inst.skip = false; inst.stopped = why || 'stop'; }
    // (a choice's replies are put up just after this: the controls are brought up to date once they are)
    Promise.resolve().then(() => { if (D === inst) syncControls(inst); });
  }
  // the dialogue's Next (not the auto-advance of a skip or a test): true when the press is used up here
  function intercept() {
    const inst = D;
    if (!inst) return false;
    if (inst.hidden) { setHidden(inst, false); return true; }
    if (inst.p.rv >= 0) { reviewFwd(inst); return true; }
    if (inst.p.state === 'entering') { inst.p.settleEntrance(); S.absorbed++; return true; }
    return false;
  }
  // the line is moving on (after its text was revealed): the shot settles at its end state
  function advancing() { if (D) D.p.advance(); }
  // keys while a line of the sequence is shown (20_dialogue.js onAction)
  function onAction(a) {
    const inst = D;
    if (!inst) return false;
    if (a === 'cancel') {
      if (inst.ctrl && inst.ctrl.classList.contains('open')) { openMenu(inst, false); return true; }
      askSkip(inst, true);
      return true;
    }
    if (a === 'left' || a === 'prev') { reviewBack(inst); return true; }
    if (a === 'right') { if (inst.p.rv >= 0) reviewFwd(inst); return true; }
    if (a === 'replay') { replayShot(inst); return true; }
    if (a === 'hide') { setHidden(inst, !inst.hidden); return true; }
    return false;
  }
  function choiceUp() { const t = RB.ui.topLayer && RB.ui.topLayer(); return !!(t && t.name === 'choices'); }
  function reviewBack(inst) {
    if (choiceUp()) return false;
    const b = inst.p.prev();
    if (!b) return false;
    S.reviews++;
    if (RB.ui.dialogue.review) RB.ui.dialogue.review(b.line);
    syncControls(inst);
    return true;
  }
  function reviewFwd(inst) {
    const r = inst.p.fwd();
    if (!r) return false;
    if (RB.ui.dialogue.review) RB.ui.dialogue.review(r.live ? null : r.line);
    syncControls(inst);
    return true;
  }
  function replayShot(inst) { if (inst.p.replay()) { S.replays++; syncControls(inst); } }
  function setHidden(inst, on) {
    inst.hidden = !!on;
    const box = hasDom() && document.querySelector('#ui > .dlg');
    if (box) box.classList.toggle('seq-hidden', inst.hidden);
    syncControls(inst);
    if (!on && inst.ctrl) { const b = inst.ctrl.querySelector('.b-hide'); if (b && document.activeElement === b) b.focus(); }
  }
  async function askSkip(inst, viaKey) {
    if (inst.asking || D !== inst || choiceUp()) return; // (a choice on screen is answered first; nothing is chosen for you)
    let unseen = true;
    try {
      const at = inst.at, sc = at && RB.content.scenes[at.sceneId];
      const i = sc ? sc.cmds.findIndex((c) => c.op === 'say' && c.line === at.line) : -1;
      const r = seenRec(inst.s, inst.id);
      unseen = i < 0 ? true : aheadUnseen(sc, i + 1, inst.id, new Set(r ? r.h : []), (cond) => RB.state.test(RB.game.s, cond));
    } catch (e) { unseen = true; }
    if (unseen || viaKey) {
      inst.asking = true;
      const r = await RB.ui.confirm(unseen ? 'Skip the rest of this scene? Some of it is new to you. Any choice ahead still waits for you.' : 'Skip the rest of this scene?', ['Skip scene', 'Keep watching']);
      inst.asking = false;
      if (D !== inst || r !== 0) { focusNext(); return; }
    }
    inst.skip = true;
    S.skipped++;
    inst.p.settle();
    if (inst.p.rv >= 0) { inst.p.endReview(); if (RB.ui.dialogue.review) RB.ui.dialogue.review(null); }
    if (inst.hidden) setHidden(inst, false);
    syncControls(inst);
    if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
    focusNext();
  }
  function focusNext() {
    const b = hasDom() && document.querySelector('#ui > .dlg:not(.hidden) .b-next');
    if (b && !(RB.ui.topLayer && RB.ui.topLayer())) b.focus({ preventScroll: true });
  }

  // ---- the controls in the dialogue sheet's control row --------------------------------------------------------
  const btn = (cls, icon, label, title, pressed) => '<button class="dbtn ' + cls + '" type="button" title="' + esc(title) + '"' + (pressed ? ' aria-pressed="false"' : '') + '>' + I(icon) + '<span>' + esc(label) + '</span></button>';
  function ensureControls(inst) {
    if (!hasDom()) return;
    const box = document.querySelector('#ui > .dlg');
    if (!box) return;
    box.classList.add('in-seq');
    if (inst.ctrl && inst.ctrl.isConnected) { syncControls(inst); return; }
    const row = box.querySelector('.ctrl'), next = row && row.querySelector('.b-next');
    if (!row) return;
    const el = document.createElement('div');
    el.className = 'seq-ctrl';
    const gid = 'seq-g' + inst.tok;
    el.innerHTML = '<button class="dbtn seq-more" type="button" aria-expanded="false" aria-controls="' + gid + '" title="Scene controls">' + I('sq-scene') + '<span>Scene</span></button>' +
      '<div class="seq-g" id="' + gid + '" role="group" aria-label="Scene controls">' +
      btn('b-prev', 'sq-prev', 'Previous', 'Read the previous line again (' + (keyOf('prev') || 'P') + ' or ←); Next comes back') +
      btn('b-replay', 'sq-replay', 'Replay shot', 'Play this picture again (' + (keyOf('replay') || 'R') + ')') +
      btn('b-hide', 'sq-hide', 'Hide text', 'Hide the text to see the whole picture (' + (keyOf('hide') || 'I') + ')', true) +
      btn('b-sskip', 'sq-skip', 'Skip scene', 'Skip the rest of this scene (Esc); it stops at any choice') + '</div>';
    const onClick = (e) => {
      const b = e.target.closest('button');
      if (!b || D !== inst) return;
      if (b.classList.contains('seq-more')) { openMenu(inst, !el.classList.contains('open')); return; }
      if (b.classList.contains('b-prev')) reviewBack(inst);
      else if (b.classList.contains('b-replay')) replayShot(inst);
      else if (b.classList.contains('b-hide')) setHidden(inst, !inst.hidden);
      else if (b.classList.contains('b-sskip')) askSkip(inst, false);
      if (!b.classList.contains('b-hide')) openMenu(inst, false);
    };
    el.addEventListener('click', onClick);
    S.listeners++;
    inst.off.push(() => { el.removeEventListener('click', onClick); S.listeners--; el.remove(); });
    row.insertBefore(el, next || null);
    inst.ctrl = el;
    syncControls(inst);
  }
  function openMenu(inst, on) {
    if (!inst.ctrl) return;
    inst.ctrl.classList.toggle('open', !!on);
    const m = inst.ctrl.querySelector('.seq-more');
    m.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) { const f = inst.ctrl.querySelector('.seq-g button:not([disabled])'); if (f) f.focus({ preventScroll: true }); }
  }
  function syncControls(inst) {
    const el = inst && inst.ctrl;
    if (!el) return;
    const p = inst.p, rv = p.rv >= 0;
    const prev = el.querySelector('.b-prev'), hide = el.querySelector('.b-hide'), skip = el.querySelector('.b-sskip');
    prev.disabled = !(rv ? p.rv > 0 : p.beats.length > 1) || inst.skip;
    hide.setAttribute('aria-pressed', inst.hidden ? 'true' : 'false');
    hide.innerHTML = I(inst.hidden ? 'sq-show' : 'sq-hide') + '<span>' + (inst.hidden ? 'Show text' : 'Hide text') + '</span>';
    skip.disabled = !!inst.skip || choiceUp();
    const box = el.closest('.dlg');
    if (box) box.classList.toggle('seq-review', rv);
  }
  function teardown(inst) {
    for (const f of inst.off.splice(0)) { try { f(); } catch (e) { /* already gone */ } }
    cancelTimers(inst.timers);
    inst.ctrl = null;
    const box = hasDom() && document.querySelector('#ui > .dlg');
    if (box) {
      if (box.classList.contains('reviewing') && RB.ui.dialogue.review) RB.ui.dialogue.review(null);
      box.classList.remove('in-seq', 'seq-hidden', 'seq-review');
    }
  }
  // the picture dissolves into the map: a copy of its last frame over the world canvas, fading out
  function fadeOver(ms) {
    if (!hasDom()) return;
    const w = document.getElementById('world');
    if (!w || !w.width || !w.height) return;
    const ov = document.createElement('canvas');
    ov.width = w.width; ov.height = w.height; ov.className = 'seq-out'; ov.setAttribute('aria-hidden', 'true');
    ov.getContext('2d').drawImage(w, 0, 0);
    w.parentNode.insertBefore(ov, w.nextSibling);
    S.overlays++;
    const go = () => { ov.style.transition = 'opacity ' + ms + 'ms linear'; ov.style.opacity = '0'; };
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(go); else go();
    later(() => { ov.remove(); S.overlays--; }, ms + 80);
  }
  async function end(id) {
    const inst = D;
    if (!inst || (id && inst.id !== id)) return false;
    const s = RB.game && RB.game.s;
    if (s && s === inst.s) {
      const r = seenRec(s, inst.id);
      r.n = (r.n || 0) + 1;
      keepMemory(inst, s);
    }
    D = null;
    inst.p.state = 'exiting';
    teardown(inst);
    if (RB.ui.dialogue.isOpen && RB.ui.dialogue.isOpen()) focusNext();
    if (inst.lifted) {
      // begun in the dark: back to the dark; the scene's own !fade in shows the world
      if (!inst.skip) await RB.ui.fade(true, inst.def.exit || EXIT); else await RB.ui.fade(true, 60);
      RB.render.setOverride(null);
    } else {
      if (!inst.skip) fadeOver(inst.def.exit || EXIT);
      RB.render.setOverride(null);
    }
    inst.p.dispose();
    if (RB.seqKit) RB.seqKit.release();
    S.ended++; S.disposed++;
    if (RB.bus) RB.bus.emit('sequence:end', { id: inst.id, tok: inst.tok, skipped: !!inst.skip });
    return true;
  }
  // scene end (a sequence left open), an error, a campaign change: everything this sequence owns goes
  function dispose(why) {
    const inst = D;
    if (!inst) return false;
    D = null;
    inst.p.state = 'exiting';
    teardown(inst);
    if (why === 'scene-end' && !inst.skip) fadeOver(inst.def.exit || EXIT);
    RB.render.setOverride(null);
    if (inst.lifted && why === 'scene-end' && RB.ui.fade) RB.ui.fade(false, 200);
    inst.p.dispose();
    if (RB.seqKit) RB.seqKit.release();
    S.disposed++;
    if (RB.bus) RB.bus.emit('sequence:end', { id: inst.id, tok: inst.tok, why });
    return true;
  }
  // the script runner's op (70_script.js): `!sequence <id> begin|end`
  async function cmd(id, verb, sc) {
    if ((verb || 'begin') === 'begin') { begin(id, sc); return; }
    if (verb === 'end') await end(id);
  }
  const active = () => !!D;
  const hidesWorld = () => !!D;
  function state() {
    if (!D) return null;
    return Object.assign(D.p.info(), { id: D.id, skip: D.skip, hidden: D.hidden, lifted: D.lifted, vb: D.vb || null, wh: D.wh || null, cast: { comp: D.p.cast.comp ? D.p.cast.comp.id : null } });
  }
  // the focal rectangle of the shot on screen (tests: it sits above the sheet at every screen shape)
  function focus() {
    if (!D || !D.lastSt || !D.wh) return null;
    const st = D.lastSt, sd = st.sd;
    return sd && sd.focus ? sd.focus(D.wh[0], D.wh[1], D.vb, st) : null;
  }
  const stats = () => Object.assign({ live: D ? 1 : 0, view: V ? 1 : 0 }, S, { kit: RB.seqKit ? RB.seqKit.stats() : null });
  // One moment of a shot, drawn directly (the dev viewer, evidence stills, tests): o = { seq, shot, phase,
  // k (0..1 through that phase's action; earlier phases at their end), vb, t, still, review, cast, test }.
  // Returns the st it drew with (and the shot's focus rectangle, if it has one).
  function drawAt(c, w, h, o) {
    const def = DEFS[o.seq], sd = def && def.shots[o.shot];
    if (!sd) return null;
    let pi = o.phase ? sd.phases.findIndex((p) => p.id === o.phase) : 0;
    if (pi < 0) pi = 0;
    const k = o.k == null ? 1 : clamp(o.k, 0, 1), vb = o.vb == null ? Math.round(h * 0.64) : o.vb;
    const kOf = (j) => (o.still ? (j <= pi ? 1 : 0) : j < pi ? 1 : j > pi ? 0 : k);
    const st = {
      seq: o.seq, shot: o.shot, phase: sd.phases[pi].id, pi, k: kOf(pi), at: (name) => { const j = typeof name === 'number' ? name : sd.phases.findIndex((p) => p.id === name); return j < 0 ? 0 : kOf(j); },
      since: 1e9, vb, still: !!o.still, review: !!o.review, hold: kOf(pi) >= 1, cast: o.cast || { pc: {}, comp: null }, test: o.test || (() => false), t: o.t || 0, sd,
    };
    c.imageSmoothingEnabled = false;
    sd.draw(c, w, h, o.t || 0, st);
    st.focusRect = sd.focus ? sd.focus(w, h, vb, st) : null;
    return st;
  }

  // ---- HX53: a kept memory (Company › Shared memories) and its read-only replay ----------------------------------
  // On a sequence's end, when the definition asks for it and a companion is travelling with you, the moment is
  // kept in the companion record's memories (RB.company.memory, kind 'together'; the Company page lists it).
  // What is kept is small: the beats actually shown (shot, phase, and where the line is in the scene with a
  // hash of its text) and the appearance selectors of the moment. No picture is stored.
  function keepMemory(inst, s) {
    const def = inst.def;
    if (!def.memory || !s || !s.comp || !RB.company || !RB.company.memory || inst.skip) return;
    const beats = inst.p.beats.filter((b) => b.line && b.line.sceneId).slice(0, 60).map((b) => [b.shot, b.pi, b.line.sceneId, b.line.line, lineHash(b.line)]);
    if (!beats.length) return;
    const t = def.title || { en: def.id };
    RB.company.memory(s, {
      id: 'seq:' + def.id, kind: 'together', title: { jp: t.jp || '', en: t.en || def.id }, text: def.memo || null,
      ref: { kind: 'seq', seq: def.id, beats, cast: { pc: inst.p.cast.pc, comp: inst.p.cast.comp } },
    });
  }
  // The beats of a kept memory as lines again, from the scenes as they are now; a line whose text changed
  // since is found by its hash, else the memory is shown up to it (nothing is invented).
  function beatsOf(ref) {
    const out = [];
    for (const [shotId, pi, sceneId, lineNo, h] of ref.beats || []) {
      const sc = RB.content.scenes[sceneId];
      if (!sc) break;
      let c = sc.cmds.find((x) => x.op === 'say' && x.line === lineNo && lineHash(x) === h);
      if (!c) c = sc.cmds.find((x) => x.op === 'say' && lineHash(x) === h);
      if (!c) break;
      const def = DEFS[ref.seq], sd = def && def.shots[shotId];
      if (!sd) break;
      const who = c.who === 'comp' ? (ref.cast && ref.cast.comp ? ref.cast.comp.id : 'narr') : c.who;
      out.push({ shot: shotId, phase: (sd.phases[pi] || sd.phases[0]).id, line: { who, expr: c.expr || null, jp: c.jp, en: c.en } });
    }
    return out;
  }
  function replay(ref) {
    if (!ref || !DEFS[ref.seq]) return Promise.resolve(null);
    const beats = beatsOf(ref);
    if (!beats.length) return Promise.resolve(null);
    const def = DEFS[ref.seq];
    return view({ seq: ref.seq, beats, cast: ref.cast || {}, label: 'Replay: ' + ((def.title && def.title.en) || ref.seq), name: 'seq-replay', seen: () => true,
      skip: { label: 'Close' }, replay: true, speakers: true });
  }
  if (typeof setTimeout !== 'undefined') setTimeout(() => {
    const CP = RB.ui && RB.ui.companyPages;
    if (!CP || !CP.addRef) return;
    CP.addRef('seq', {
      html: (m) => (m.ref && DEFS[m.ref.seq] ? '<button class="pbtn quiet" data-co-ref="seq">' + I('sq-replay') + 'Watch it again</button>' : ''),
      // the folio closes for the replay (the picture is the whole screen) and opens again on the memories after it
      click: async (b, s, api) => {
        const li = b.closest('[data-kind]'), rb = li && li.querySelector('[data-co-recall]');
        const m = rb && ((s.company || {}).memories || []).find((x) => x.id === rb.getAttribute('data-co-recall'));
        if (!m || !m.ref) return;
        if (api && api.remember) api.remember();
        if (RB.ui.menu && RB.ui.menu.close) RB.ui.menu.close();
        await replay(m.ref);
        if (RB.ui.menu && RB.ui.menu.open && RB.game.s === s) RB.ui.menu.open('memories');
      },
    });
  }, 0);

  // ---- a sequence outside a scene: its own caption slip (the prologue, a replay, the dev viewer) ---------------
  // o: { seq, beats: [{ shot, phase?, line: { jp, en, who? } }], label, tag, name, cast, music, seen() → bool,
  //      onSeen(), skip: { label, confirm, yes, no }, speakers: bool, onExit } → Promise resolving { how }
  // (tag: a visible note above the caption, e.g. the dev viewer's "synthetic preview"; English only, no kanji)
  // Next: the entrance completes if still dissolving; otherwise the next beat (a new shot dissolves in, a
  // phase starts its action); the last Next leaves once. Previous / Replay shot / Hide text as in scenes;
  // Skip (and Escape) asks first unless the whole was seen before.
  let V = null;
  function view(o) {
    if (V) closeView('replaced');
    return new Promise((resolve) => {
      const def = typeof o.seq === 'string' ? DEFS[o.seq] : o.seq;
      if (!def || !o.beats || !o.beats.length) { resolve({ how: 'none' }); return; }
      const p = new Player(def, { cast: o.cast || {}, test: o.test || (() => false) });
      const v = { o, p, i: 0, done: false, hidden: false, asking: false, leaving: 0, timers: new Set(), resolve, tok: p.tok, started: false };
      V = v;
      S.views++;
      const cap = RB.ui.el('div', 'cr-prologue seq-view');
      cap.setAttribute('role', 'dialog');
      cap.setAttribute('aria-label', o.label || 'Scene');
      const gid = 'seq-vg' + p.tok;
      cap.innerHTML = '<div class="slip">' + (o.tag ? '<div class="seq-tag">' + esc(o.tag) + '</div>' : '') + '<div class="pg" aria-hidden="true"></div><div class="seq-rv" aria-live="polite"></div><div class="txt" aria-live="polite"></div></div>' +
        '<div class="acts"><button class="cbtn seq-more" type="button" aria-expanded="false" aria-controls="' + gid + '">' + I('sq-scene') + '<span>Scene</span></button>' +
        '<div class="seq-g" id="' + gid + '" role="group" aria-label="Scene controls">' +
        '<button class="cbtn" type="button" data-a="prev" title="The previous caption again (' + (keyOf('prev') || 'P') + ' or ←)">' + I('sq-prev') + '<span>Previous</span></button>' +
        '<button class="cbtn" type="button" data-a="replay" title="Play this picture again (' + (keyOf('replay') || 'R') + ')">' + I('sq-replay') + '<span>Replay shot</span></button>' +
        '<button class="cbtn" type="button" data-a="hide" aria-pressed="false" title="Hide the caption to see the whole picture (' + (keyOf('hide') || 'I') + ')">' + I('sq-hide') + '<span>Hide text</span></button></div>' +
        '<button class="cbtn" type="button" data-a="skip">' + esc((o.skip && o.skip.label) || 'Skip') + '</button>' +
        '<button class="cbtn cr-primary autofocus" type="button" data-a="next"><span>Next</span>' + I('next') + '</button></div>';
      v.cap = cap;
      const layer = { el: cap, name: o.name || 'sequence' };
      v.layer = layer;
      const seen = () => { try { return !!(o.seen && o.seen()); } catch (e) { return false; } };
      const nameOf = (who) => {
        if (!who || who === 'narr') return '';
        if (who === 'pc') return (RB.game.s && RB.game.s.player && RB.game.s.player.name) || '';
        const ch = RB.content.chars[who];
        return ch && ch.name ? ch.name.en : '';
      };
      function caption(line, j, review) {
        const t = cap.querySelector('.txt');
        const nm = o.speakers ? nameOf(line.who) : '';
        t.innerHTML = (nm ? '<div class="who">' + esc(nm) + '</div>' : '') + (line.jp ? RB.ui.jhtml(line.jp) : '') + '<div class="en">' + esc(RB.script && RB.game.s ? RB.script.enVars(line.en || '') : line.en || '') + '</div>';
        cap.querySelector('.pg').innerHTML = o.beats.map((x, k) => '<i class="' + (k === j ? 'on' : k < j ? 'past' : '') + '"></i>').join('');
        cap.querySelector('.seq-rv').textContent = review ? 'Looking back — Next returns to where you were' : '';
        cap.classList.toggle('seq-review', !!review);
        sync();
      }
      function sync() {
        const pv = cap.querySelector('[data-a=prev]'), hd = cap.querySelector('[data-a=hide]');
        pv.disabled = !(p.rv >= 0 ? p.rv > 0 : p.beats.length > 1);
        hd.setAttribute('aria-pressed', v.hidden ? 'true' : 'false');
        hd.innerHTML = I(v.hidden ? 'sq-show' : 'sq-hide') + '<span>' + (v.hidden ? 'Show text' : 'Hide text') + '</span>';
        cap.classList.toggle('seq-hidden', v.hidden);
      }
      function go(j) {
        const b = o.beats[j];
        p.toShot(b.shot, b.phase || null);
        p.beat(b.line);
        caption(b.line, j, false);
        if (j === o.beats.length - 1 && o.onSeen) { try { o.onSeen(); } catch (e) { /* (a settings write) */ } }
      }
      function next() {
        if (v.done || v.asking || v.leaving) return;
        if (v.hidden) { setH(false); return; }
        if (p.rv >= 0) {
          const r = p.fwd();
          if (r) { if (r.live) caption(o.beats[v.i].line, v.i, false); else caption(r.line, r.i, true); }
          return;
        }
        if (p.state === 'entering') { p.settleEntrance(); S.absorbed++; return; }
        p.advance();
        if (v.i >= o.beats.length - 1) { leave('end'); return; }
        v.i++;
        go(v.i);
      }
      function prev() {
        if (v.done || v.leaving) return;
        const b = p.prev();
        if (b) { S.reviews++; caption(b.line, b.i, true); }
      }
      function setH(on) { v.hidden = !!on; sync(); }
      async function skip(viaKey) {
        if (v.done || v.asking || v.leaving) return;
        if (!seen() || (viaKey && !o.replay)) {
          v.asking = true;
          const sk = o.skip || {};
          const r = await RB.ui.confirm(sk.confirm || 'Skip the rest of this scene?', [sk.yes || 'Skip', sk.no || 'Keep watching']);
          v.asking = false;
          if (V !== v || r !== 0) { const nb = cap.querySelector('[data-a=next]'); if (nb && V === v) nb.focus({ preventScroll: true }); return; }
        }
        leave('skip');
      }
      function leave(how) {
        if (v.leaving || v.done) return;
        v.leaving = nowMs();
        v.how = how;
        const ms = how === 'skip' ? 0 : def.exit != null ? def.exit : EXIT;
        if (!ms) finish();
        else { const id = setTimeout(() => { v.timers.delete(id); finish(); }, ms); v.timers.add(id); }
      }
      function finish() {
        if (v.done) return;
        v.done = true;
        cancelTimers(v.timers);
        if (V === v) V = null;
        RB.render.setOverride(null);
        p.dispose();
        if (RB.seqKit) RB.seqKit.release();
        if (o.release) o.release();
        RB.ui.popLayer(layer);
        if (v.pushed) RB.game.popMode('sequence');
        cap.removeEventListener('click', onClick); S.listeners--;
        if (o.onExit) { try { o.onExit(v.how); } catch (e) { /* (caller) */ } }
        resolve({ how: v.how || 'end' });
      }
      v.finish = finish;
      const onClick = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.classList.contains('seq-more')) { const on = !cap.classList.contains('seq-open'); cap.classList.toggle('seq-open', on); b.setAttribute('aria-expanded', on ? 'true' : 'false'); return; }
        const a = b.getAttribute('data-a');
        if (a === 'next') next();
        else if (a === 'prev') prev();
        else if (a === 'replay') { if (p.replay()) S.replays++; }
        else if (a === 'hide') setH(!v.hidden);
        else if (a === 'skip') skip(false);
        if (a && a !== 'hide' && cap.classList.contains('seq-open')) { cap.classList.remove('seq-open'); cap.querySelector('.seq-more').setAttribute('aria-expanded', 'false'); }
      };
      cap.addEventListener('click', onClick);
      S.listeners++;
      layer.onAction = (a, e) => {
        if (a === 'cancel') {
          if (cap.classList.contains('seq-open')) { cap.classList.remove('seq-open'); cap.querySelector('.seq-more').setAttribute('aria-expanded', 'false'); return true; }
          if (o.replay) leave('skip'); else skip(true);
          return true;
        }
        if (a === 'ok') {
          // Enter on one of the other buttons does what that button says; otherwise Next
          const f = document.activeElement;
          if (f && cap.contains(f) && f.tagName === 'BUTTON' && f.getAttribute('data-a') !== 'next') f.click(); else next();
          return true;
        }
        if (a === 'left' || a === 'prev') { prev(); return true; }
        if (a === 'right') { if (p.rv >= 0) next(); return true; }
        if (a === 'replay') { if (p.replay()) S.replays++; return true; }
        if (a === 'hide') { setH(!v.hidden); return true; }
        if (a === 'menu') return !(e && e.key === 'Tab');
        return false;
      };
      // the shot's focal area stays above the caption slip (its top, as a buffer row)
      function slipTop(h) {
        const cv = document.getElementById('world'), sl = cap.querySelector('.slip');
        if (!cv || !sl) return h;
        const a = cv.getBoundingClientRect(), b = sl.getBoundingClientRect();
        if (!a.height || !b.height) return h;
        return ((b.top - a.top) * h) / a.height;
      }
      const frame = (c, w, h, t) => {
        if (V !== v && !v.leaving) return;
        try {
          if (!v.started) { v.started = true; p.setFrom(black(w, h)); }
          const vb = o.vb ? o.vb(h) : slipTop(h);
          v.lastSt = p.draw(c, w, h, t, vb);
          v.vb = vb; v.wh = [w, h];
          if (v.leaving) {
            const ms = def.exit != null ? def.exit : EXIT;
            c.globalAlpha = clamp((nowMs() - v.leaving) / Math.max(1, ms), 0, 1);
            c.fillStyle = '#05060a'; c.fillRect(0, 0, w, h);
            c.globalAlpha = 1;
          }
        } catch (err) {
          c.fillStyle = '#07080d'; c.fillRect(0, 0, w, h);
          if (!v.failed) { v.failed = true; S.errors++; console.error('sequence view', def.id, err); }
        }
      };
      frame.art = true;
      if (o.music && RB.audio) RB.audio.playSong(o.music);
      // opened over the world (a replay from the Company page): the world takes no input while it shows
      if (RB.game && RB.game.mode && RB.game.mode() === 'world') { RB.game.pushMode('sequence'); v.pushed = true; }
      RB.render.setOverride(frame);
      go(0);
      RB.ui.pushLayer(layer);
    });
  }
  function closeView(why) {
    const v = V;
    if (!v) return false;
    v.how = why;
    v.finish();
    return true;
  }
  const viewState = () => (V ? Object.assign(V.p.info(), { i: V.i, n: V.o.beats.length, hidden: V.hidden, leaving: !!V.leaving, vb: V.vb || null, wh: V.wh || null }) : null);
  function viewFocus() {
    if (!V || !V.lastSt || !V.wh) return null;
    const st = V.lastSt, sd = st.sd;
    return sd && sd.focus ? sd.focus(V.wh[0], V.wh[1], V.vb, st) : null;
  }

  if (RB.bus) RB.bus.on('campaign:changing', () => { dispose('campaign'); if (V && V.o.replay) closeView('campaign'); });

  // ---- the prologue's shots (art: src/ui/41*_prologue_*.js; captions and flow: src/ui/40_create.js) ----------
  // One-time actions (SHOTS.md §7): the riverbank lantern's name leaving it (4 s) and the traveller's walk up
  // the road (6 s). The other four approved shots draw no one-time action, only their ambient life (steam,
  // flicker, water, motes), so they hold from the start.
  define('prologue', {
    title: { en: 'Prologue' }, enter: 400, exit: 300,
    shots: Object.fromEntries([['road', 0], ['tea', 0], ['cup', 0], ['lantern', 4000], ['bridge', 0], ['walker', 6000]].map(([kind, ms]) => [kind, {
      phases: [['act', ms]],
      draw: (c, w, h, t, st) => RB.prologueArt.draw(kind, c, w, h, t, st.k, { vb: st.vb, still: st.still, hold: st.k >= 1, ms }),
      focus: kind === 'walker' ? (w, h, vb, st) => { const W = RB.prologueArt.walkerAt(w, h, st.k, vb, st.still); return { x: W.x - 6, y: W.y - W.H, w: 12, h: W.H }; } : null,
    }])),
  });

  return {
    define, shot, get, ids, Player, normPhases,
    // the script runner and the dialogue
    cmd, begin, end, toShot, onLine, intercept, advancing, onAction, skipping, stopSkip, hidesWorld, active, dispose,
    // a sequence outside a scene
    view, closeView, viewState, viewFocus, replay, beatsOf,
    // tests
    state, focus, stats, drawAt, aheadUnseen, lineHash, seenRec, ENTER, EXIT,
  };
})();
