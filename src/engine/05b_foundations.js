/* Foundations for the expansion (docs/future/plan/02_FOUNDATIONS.md S1–S3, K9; playbook P02).
 *
 *   RB.records   per-save records (S3): stamps, seals, stars, the keepsake catalogue's found record. They live in the
 *                slot like everything else: copied with it, deleted with it, never written to another slot.
 *   RB.streams   seeded event streams (S2): one stream per family per save, seeded from the campaign id. An outcome is
 *                drawn once and kept in the save, so loading never re-rolls it.
 *   RB.phase     story phases (S1): what has happened in a region, by name, so content can say `phase.manybridge>=after`
 *                instead of restating flags; and the concepts (responses, constructions, modifiers) taught so far.
 *   RB.events    the result envelope (playbook §06): a rule's outcome computed once, frozen, then presented.
 *   RB.ngplus    the one New Game+ carryover (K9; C-54, C-66): what a new journey keeps, defined once.
 *
 * Everything here is additive: an older save gains empty records on load and nothing it already holds changes. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);

  // ---- records (S3) -------------------------------------------------------------------------------------------
  const KINDS = ['stamps', 'seals', 'stars', 'found'];
  function freshRecords() { return { stamps: {}, seals: {}, stars: {}, found: {} }; }
  function of(s) {
    if (!isObj(s.records)) s.records = freshRecords();
    for (const k of KINDS) if (!isObj(s.records[k])) s.records[k] = {};
    return s.records;
  }
  // at most once: the first award keeps its time and data; later calls change nothing and return false
  function award(s, kind, id, data) {
    if (KINDS.indexOf(kind) < 0) throw new Error('unknown record kind ' + kind);
    const r = of(s)[kind];
    if (r[id]) return false;
    r[id] = Object.assign({ t: Date.now() }, data || {});
    return true;
  }
  const has = (s, kind, id) => !!(s && s.records && s.records[kind] && s.records[kind][id]);
  RB.records = { KINDS, fresh: freshRecords, of, award, has };

  // ---- seeded streams (S2) ------------------------------------------------------------------------------------
  // FNV-1a over the seed string, then mulberry32: a float in [0, 1) that depends only on (campaign, family, n).
  function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function mul(a) {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function rng(s) {
    if (!isObj(s.rng)) s.rng = { n: {}, drawn: {} };
    if (!isObj(s.rng.n)) s.rng.n = {};
    if (!isObj(s.rng.drawn)) s.rng.drawn = {};
    return s.rng;
  }
  // the next value of a family's stream (advances it)
  function next(s, family) {
    const r = rng(s);
    const n = r.n[family] | 0;
    r.n[family] = n + 1;
    return mul(hash((s.id || 'campaign') + '|' + family + '|' + n));
  }
  const int = (s, family, k) => Math.floor(next(s, family) * k);
  const pick = (s, family, arr) => (arr && arr.length ? arr[int(s, family, arr.length)] : undefined);
  // An outcome drawn once and kept: the same key returns the same value until it is consumed, across saves and loads.
  // fn(draw) gets a function returning the family's next value. The value must be plain JSON.
  function fixed(s, key, family, fn) {
    const r = rng(s);
    if (key in r.drawn) return r.drawn[key];
    const v = fn(() => next(s, family));
    r.drawn[key] = v === undefined ? null : v;
    return r.drawn[key];
  }
  function consume(s, key) { const r = rng(s); const had = key in r.drawn; delete r.drawn[key]; return had; }
  const peek = (s, key) => (s && s.rng && s.rng.drawn && key in s.rng.drawn ? s.rng.drawn[key] : undefined);
  RB.streams = { next, int, pick, fixed, consume, peek, hash };

  // ---- story phases and concepts (S1) -------------------------------------------------------------------------
  // A region's phases, in order: each { id, if } holds when its condition does; a region is in the last phase whose
  // condition holds (the first has none). Phase-guarded content writes `phase.<region>>=<id>`.
  const PHASES = {};
  function define(region, list) {
    if (!Array.isArray(list) || !list.length) throw new Error('phases for ' + region + ' must be a list');
    PHASES[region] = list.map((p, i) => ({ id: p.id, if: i === 0 ? null : p.if }));
  }
  function index(s, region) {
    const L = PHASES[region];
    if (!L) throw new Error('no phases for region ' + region);
    let at = 0;
    for (let i = 1; i < L.length; i++) if (RB.state.test(s, L[i].if)) at = i;
    return at;
  }
  const phaseOf = (s, region) => PHASES[region][index(s, region)].id;
  function phaseIndex(region, id) {
    const L = PHASES[region];
    const i = L ? L.findIndex((p) => p.id === id) : -1;
    if (i < 0) throw new Error('unknown phase ' + region + '.' + id);
    return i;
  }
  // Concepts the player can know: a response, a construction or a modifier, each taught by a condition (a scene's
  // flag, a word learned) in a named chapter. Content that uses one declares it; the validator checks the chapter.
  const CONCEPTS = {};
  function concept(id, def) { CONCEPTS[id] = Object.assign({ id, kind: 'construction' }, def); }
  const knows = (s, id) => !!CONCEPTS[id] && RB.state.test(s, CONCEPTS[id].taught);
  // A running task holds the phase and profile it began with (S1 "stable activities").
  function snapshot(s, regions) {
    const out = { profile: s.learn && s.learn.profile, phases: {}, concepts: {} };
    for (const r of regions || Object.keys(PHASES)) out.phases[r] = phaseOf(s, r);
    for (const id in CONCEPTS) if (knows(s, id)) out.concepts[id] = true;
    Object.freeze(out.phases); Object.freeze(out.concepts);
    return Object.freeze(out);
  }
  // the phases of every region the six chapters already have, from their own flags
  const story = (start, done) => [
    { id: 'before' }, { id: 'story', if: start }, { id: 'after', if: done }, { id: 'post', if: 'postgame' },
  ];
  define('reedwake', story('true', 'ch1_done'));
  define('saltglass', story('ch1_done', 'ch2_done'));
  define('cinder', story('ch2_done&!ed>=2|mb2_done', 'ch3_done'));
  define('snowbell', story('ch3_done', 'ch4_done'));
  define('lanternfall', story('ch4_done&!ed>=2|kr_done', 'ch5_done'));
  define('archive', story('ch5_done&!ed>=2|yn_done', 'postgame'));
  RB.state.addTerm('phase', (s, rest, op, val, num, cmp) => {
    if (!op) return index(s, rest) > 0;
    return cmp(index(s, rest), op, phaseIndex(rest, val));
  });
  RB.phase = { define, of: phaseOf, index, phaseIndex, regions: () => Object.keys(PHASES), concept, concepts: () => CONCEPTS, knows, snapshot };

  // ---- the result envelope (playbook §06) ------------------------------------------------------------------------
  // A rule's outcome, computed once: presentation (sound, motion, text, skip) reads it and never runs the rule again.
  let seq = 0;
  const LOG = [];
  function make(e) {
    const ev = {
      id: (e.src || 'ev') + ':' + (++seq),
      src: e.src || null, action: e.action || null, targets: (e.targets || []).slice(),
      changes: clone(e.changes || []), evidence: clone(e.evidence || []), cues: clone(e.cues || []),
    };
    deepFreeze(ev);
    LOG.push(ev);
    if (LOG.length > 200) LOG.shift();
    return ev;
  }
  function deepFreeze(o) { Object.freeze(o); for (const k in o) if (o[k] && typeof o[k] === 'object' && !Object.isFrozen(o[k])) deepFreeze(o[k]); return o; }
  RB.events = { make, log: () => LOG.slice(), clear: () => { LOG.length = 0; } };

  // ---- New Game+ carryover (K9; C-54, C-66) ---------------------------------------------------------------------
  // The one definition of what a new journey keeps from an earlier one, whichever way it begins (the end of the
  // game, the Inn Ledger, an old edition's save). Carries: the learning record; records (stamps, seals, stars, the
  // keepsake catalogue's found record); illustrations seen; pastime records; the noted-words notebook; kept
  // sentences; the traveller as they are (name, pronouns, the look chosen at creation, the bath they chose).
  // Never: story flags, quests, chapter, map knowledge, the companion and Bond, the pet, words learned in the story,
  // equipment and items (keepsakes included), Known details, lore notes, creatures met, field-puzzle and Atlas
  // progress, Atlas cosmetics.
  const CARRY = ['learn', 'records', 'seq', 'practice:records', 'notebook:word', 'bookmarks', 'player', 'ngplus'];
  // later pastimes keep their own records in s.practice[<key>] and are named here (P06: shogi, hanafuda, karuta, festival)
  const PASTIMES = [];
  function carry(from, opts) {
    opts = opts || {};
    const s = RB.state.newCampaign({ player: clone(from.player), edition: opts.edition || (RB.edition ? RB.edition.forNew() : 1) });
    s.learn = clone(from.learn);
    const rec = of(s);
    const fr = isObj(from.records) ? from.records : {};
    for (const k of KINDS) rec[k] = clone(isObj(fr[k]) ? fr[k] : {});
    // the keepsake catalogue's found record (C-66): what the journey found, kept as a record, never as items
    const ks = from.discovery && from.discovery.keepsakes;
    if (isObj(ks)) for (const id in ks) if (!rec.found[id]) rec.found[id] = { t: (ks[id] && ks[id].t) || 0 };
    s.seq = clone(isObj(from.seq) ? from.seq : {});
    // pastime records (lead's decision F-03): shiritori's results with each companion, the fishing journal's fish
    // and personal milestones, the practice tallies. Kept pages, displays and activity progress start fresh, as do
    // sessions under way.
    if (isObj(from.practice) && RB.practice) {
      const p = RB.practice.of(s), fp = from.practice;
      if (isObj(fp.shiritori)) { p.shiritori = clone(fp.shiritori); p.shiritori.active = null; }
      if (isObj(fp.fishing)) {
        if (isObj(fp.fishing.observed)) p.fishing.observed = clone(fp.fishing.observed);
        if (isObj(fp.fishing.milestones)) p.fishing.milestones = clone(fp.fishing.milestones);
      }
      if (isObj(fp.tally)) p.tally = clone(fp.tally);
      for (const k of PASTIMES) if (isObj(fp[k])) { p[k] = clone(fp[k]); if ('active' in p[k]) p[k].active = null; }
    }
    // the Tactics Board's personal bests (lead's decision F-08); the rest of the encounter record starts fresh
    if (isObj(from.enc) && isObj(from.enc.studies) && isObj(s.enc)) s.enc.studies = clone(from.enc.studies);
    s.notebook = (from.notebook || []).filter((n) => n && n.kind === 'word').map(clone);
    s.bookmarks = clone(Array.isArray(from.bookmarks) ? from.bookmarks : []);
    s.ngplus = (from.ngplus || 0) + 1;
    s.ngFrom = { id: from.id || null, comp: from.comp || null, edition: (from.edition || 1), t: Date.now() };
    return s;
  }
  RB.ngplus = { carry, CARRY, PASTIMES };

  // ---- older saves gain empty records (never anything invented); called by RB.save.migrate ------------------------
  RB.foundations = { normalise(st) { of(st); rng(st); if (!st.edition) st.edition = 1; } };
})();
