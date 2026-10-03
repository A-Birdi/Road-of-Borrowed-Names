/* One Word, Two Moments (Practice addendum §19): twelve authored comparisons of two
 * lines the player has actually seen in the story (or explicitly labelled teaching
 * examples), in Words. Content: src/content/practice_b/30_compare.js
 * (RB.content.practiceB.compare); interface: src/ui/92_compare.js.
 *
 * Source integrity (§19.2). Every quoted line records its scene id and command index,
 * the frozen quotation (markup), its contextual reading, the speaker and a hash of the
 * Japanese and English. status(src) checks it against the content now:
 *   'ok'       the line is where it was, unchanged
 *   'moved'    unchanged, at another index of the same scene
 *   'changed'  the scene exists but the line is no longer in it
 *   'removed'  the scene is gone
 * A pair whose sources are not all 'ok'/'moved' is not offered as a comparison (a
 * contradiction is never shown silently); a comparison the player marked keeps its
 * frozen quotations and is shown as a historical quotation.
 *
 * Seen (never reveal an unseen scene). A source counts as seen when
 *   - it was recorded as seen (s.practice.compare.seen[key] — written when the line is
 *     found in the dialogue history after a scene, see scan()), or
 *   - it is in the dialogue history now (s.backlog, matched by scene and text), or
 *   - its scene has been seen and the line is on the scene's unconditional opening
 *     stretch (before any choice, jump, end, battle or hook, with no condition of its own),
 *     so it was certainly shown when the scene ran.
 * Teaching examples are always available and always labelled as such.
 *
 * s.practice.compare = {
 *   v: 1,
 *   seen: { '<scene>#<i>': hash },      sightings (bounded by the authored sources)
 *   done: { C01: { t, prof, replays } },
 *   marks: { C01: { t, quotes: [{ scene, line, who, jp, en, h }] } },  optional bookmarks
 *   assessed: { 'compare:C01': 1 }, recent: [{ id, m? }],
 * } */
var RB = (globalThis.RB = globalThis.RB || {});

RB.compare = (function () {
  'use strict';
  const LV = ['F', 'E', 'I', 'A'];
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const def = () => ({ v: 1, seen: {}, done: {}, marks: {}, assessed: {}, recent: [] });
  const MAX_SEEN = 64, MAX_MARKS = 32;
  function norm(r) {
    if (!isObj(r)) return def();
    for (const k of ['seen', 'done', 'marks', 'assessed']) if (!isObj(r[k])) r[k] = {};
    if (!Array.isArray(r.recent)) r.recent = [];
    if (r.recent.length > 8) r.recent = r.recent.slice(-8);
    const sk = Object.keys(r.seen);
    if (sk.length > MAX_SEEN) for (const k of sk.slice(0, sk.length - MAX_SEEN)) delete r.seen[k];
    for (const k in r.marks) { const m = r.marks[k]; if (!isObj(m) || !Array.isArray(m.quotes)) delete r.marks[k]; else m.quotes = m.quotes.slice(0, 2); }
    for (const k in r.done) { const d = r.done[k]; if (!isObj(d)) r.done[k] = { replays: 0 }; else d.replays = Math.max(0, Math.min(9999, d.replays | 0)); }
    if (r.v == null) r.v = 1;
    return r;
  }
  if (RB.practice) RB.practice.addNamespace('compare', def, norm);

  const hash = (jp, en) => RB.util.hashStr(String(jp || '') + '||' + String(en || '')).toString(36);
  const defs = () => ((RB.content.practiceB && RB.content.practiceB.compare) || []);
  const byId = (id) => defs().find((d) => d.id === id) || null;
  const rec = (s) => { const P = RB.practice.of(s); if (!P.compare) P.compare = def(); return P.compare; };
  const keyOf = (src) => src.scene + '#' + src.line;
  // a sighting recorded for this line, under its index now or an earlier one (scene direction added before a
  // quoted line moves it to a later index; the recorded hash still names the same line)
  const sighted = (r, src) => r.seen[keyOf(src)] === src.h || Object.keys(r.seen).some((k) => r.seen[k] === src.h && k.slice(0, k.lastIndexOf('#')) === src.scene);
  const isTeach = (src) => !!(src && src.teach);
  function tier(d, prof) {
    if (!d || !d.q) return null;
    const i = Math.max(0, LV.indexOf(prof || 'E'));
    for (let k = i; k >= 0; k--) if (d.q[LV[k]]) return Object.assign({ lv: LV[k] }, d.q[LV[k]]);
    for (let k = i + 1; k < 4; k++) if (d.q[LV[k]]) return Object.assign({ lv: LV[k] }, d.q[LV[k]]);
    return null;
  }

  // ---- source integrity ---------------------------------------------------------------------
  function status(src) {
    if (isTeach(src)) return 'teach';
    const sc = RB.content.scenes[src.scene];
    if (!sc) return 'removed';
    const c = sc.cmds[src.line];
    if (c && c.op === 'say' && hash(c.jp, c.en) === src.h) return 'ok';
    if (sc.cmds.some((x) => x.op === 'say' && hash(x.jp, x.en) === src.h)) return 'moved';
    return 'changed';
  }
  const valid = (d) => [d.a, d.b].every((x) => { const st = status(x); return st === 'ok' || st === 'moved' || st === 'teach'; });

  // the index of the first command after which a line may be skipped
  const FLOW = new Set(['choice', 'if', 'goto', 'end', 'battle', 'hook']);
  const certain = new Map();
  function certainlyShown(sceneId, i) {
    const sc = RB.content.scenes[sceneId];
    if (!sc) return false;
    if (!certain.has(sceneId)) { let k = sc.cmds.findIndex((c) => FLOW.has(c.op)); certain.set(sceneId, k < 0 ? sc.cmds.length : k); }
    const c = sc.cmds[i];
    return !!c && c.op === 'say' && !c.if && i < certain.get(sceneId);
  }
  // the line's index now (the authored one, or where an unchanged line moved to)
  function indexNow(src) {
    const sc = RB.content.scenes[src.scene];
    if (!sc) return -1;
    const c = sc.cmds[src.line];
    if (c && c.op === 'say' && hash(c.jp, c.en) === src.h) return src.line;
    return sc.cmds.findIndex((x) => x.op === 'say' && hash(x.jp, x.en) === src.h);
  }
  function inBacklog(s, src) {
    for (const e of s.backlog || []) {
      if (!e || e.jp !== src.jp || e.en !== src.en) continue;
      const k = e.k && e.k.src;
      if (k && k.k === 'sc' && k.id === src.scene) return true;
      if (!k && e.who === src.who) return true; // a history line from before event-time context existed
    }
    return false;
  }
  function seen(s, src) {
    if (isTeach(src)) return true;
    if (!s) return false;
    const r = rec(s);
    if (sighted(r, src)) return true;
    if (inBacklog(s, src)) return true;
    const i = indexNow(src);
    return i >= 0 && !!(s.seen && s.seen[src.scene]) && certainlyShown(src.scene, i);
  }
  // record sightings of the authored sources from the dialogue history (after each scene)
  function scan(s) {
    if (!s || !Array.isArray(s.backlog)) return 0;
    const r = rec(s);
    let n = 0;
    for (const d of defs()) for (const src of [d.a, d.b]) {
      if (isTeach(src) || sighted(r, src)) continue;
      if (status(src) === 'ok' || status(src) === 'moved') {
        if (inBacklog(s, src) || (s.seen && s.seen[src.scene] && certainlyShown(src.scene, indexNow(src)))) {
          if (Object.keys(r.seen).length >= MAX_SEEN) break;
          r.seen[keyOf(src)] = src.h; n++;
        }
      }
    }
    return n;
  }
  if (RB.bus) RB.bus.on('story:settled', () => { try { const s = RB.game && RB.game.s; if (s) scan(s); } catch (e) { console.error('compare scan', e); } });

  // pairs the player can open now; samples are the labelled teaching-example pairs
  function unlocked(s) { return defs().filter((d) => !d.sample && valid(d) && seen(s, d.a) && seen(s, d.b)); }
  const locked = (s) => defs().filter((d) => !d.sample && !(valid(d) && seen(s, d.a) && seen(s, d.b))).length;
  const samples = () => defs().filter((d) => d.sample);

  function complete(s, id, info) {
    const r = rec(s);
    info = info || {};
    if (!r.done[id]) { r.done[id] = { t: Date.now(), prof: info.prof || null, replays: 0 }; return { first: true, rec: r.done[id] }; }
    r.done[id].replays = Math.min(9999, (r.done[id].replays | 0) + 1);
    return { first: false, rec: r.done[id] };
  }
  // an optional bookmark of a comparison: its quotations frozen as they were read
  function mark(s, id) {
    const d = byId(id);
    if (!d) return null;
    const r = rec(s);
    if (r.marks[id]) return r.marks[id];
    if (Object.keys(r.marks).length >= MAX_MARKS) return null;
    const q = (x) => (isTeach(x) ? { teach: 1, jp: x.jp, en: x.en } : { scene: x.scene, line: x.line, who: x.who, jp: x.jp, en: x.en, h: x.h });
    r.marks[id] = { t: Date.now(), quotes: [q(d.a), q(d.b)] };
    return r.marks[id];
  }
  function unmark(s, id) { const r = rec(s); if (!r.marks[id]) return false; delete r.marks[id]; return true; }
  // a mark whose quotations no longer match the game is shown as a historical quotation
  function markStatus(m) {
    if (!m) return 'none';
    for (const q of m.quotes) {
      if (q.teach) continue;
      const st = status({ scene: q.scene, line: q.line, h: q.h });
      if (st !== 'ok' && st !== 'moved') return 'historical';
    }
    return 'current';
  }
  const eligible = () => RB.practiceB.worldSafe();

  return { LV, defs, byId, rec, tier, hash, status, valid, seen, scan, unlocked, locked, samples, complete, mark, unmark, markStatus, eligible, certainlyShown, inBacklog, keyOf, norm, def, MAX_SEEN, MAX_MARKS };
})();
