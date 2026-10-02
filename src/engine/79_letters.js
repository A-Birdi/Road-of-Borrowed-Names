/* Villagers' correspondence (Practice addendum §17): twelve short practice letters
 * from villagers you have met, answered at the post box in Shino's Post House after
 * the journey's end. Content: src/content/practice_b/10_letters.js
 * (RB.content.practiceB.letters); interface: src/ui/90_letters.js.
 *
 * s.practice.letters = {
 *   v: 1,
 *   active: null | { id, opened },     at most one letter is open at a time; the others wait
 *   done: { L01: { st: 'sent', tone, via, reply, prof, t, replays, last? } },
 *   assessed: { 'letter:L01': 1 },     one ordinary assessment per letter per campaign
 *   recent: [{ id, m? }],              the last eight objectives (cooldown across sittings)
 * }
 * A letter is answered once in the story of the campaign ('sent'); opening it again later
 * is practice on a copy that is not sent (counted in `replays`), so nobody receives the same
 * reply twice. Nothing here expires, keeps a streak, reads the wall clock for eligibility,
 * awards bond, or unlocks anything: completion is informational (the Words folder).
 *
 *   RB.letters.list(s)               [{ id, def, state: 'waiting'|'open'|'answered', rec, met }]
 *   RB.letters.tier(def, prof)       the adaptation for a learning profile (F/E/I/A)
 *   RB.letters.open(s, id)           { ok } | { ok:false, why:'other-open'|'unknown'|'not-met' }
 *   RB.letters.setAside(s)           the open letter goes back on the pile (no penalty)
 *   RB.letters.complete(s, id, info) records a reply: { sent: bool, rec }
 *   RB.letters.eligible(s)           { ok, why } — after the journey's end, at the post box */
var RB = (globalThis.RB = globalThis.RB || {});

RB.letters = (function () {
  'use strict';
  const LV = ['F', 'E', 'I', 'A'];
  const MAX_REPLY = 80; // characters of the reply text kept with a sent letter
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const def = () => ({ v: 1, active: null, done: {}, assessed: {}, recent: [] });
  // load-time normalisation: keep every record (unknown future ids included), bound what grows
  function norm(r) {
    if (!isObj(r)) return def();
    if (!isObj(r.done)) r.done = {};
    if (!isObj(r.assessed)) r.assessed = {};
    if (!Array.isArray(r.recent)) r.recent = [];
    if (r.recent.length > 8) r.recent = r.recent.slice(-8);
    if (r.active != null && (!isObj(r.active) || typeof r.active.id !== 'string')) r.active = null;
    for (const k in r.done) {
      const d = r.done[k];
      if (!isObj(d)) { r.done[k] = { st: 'sent', replays: 0 }; continue; }
      if (typeof d.reply === 'string' && d.reply.length > MAX_REPLY) d.reply = d.reply.slice(0, MAX_REPLY);
      d.replays = Math.max(0, Math.min(9999, d.replays | 0));
    }
    if (r.v == null) r.v = 1;
    return r;
  }
  if (RB.practice) RB.practice.addNamespace('letters', def, norm);

  const defs = () => ((RB.content.practiceB && RB.content.practiceB.letters) || []);
  const byId = (id) => defs().find((d) => d.id === id) || null;
  const rec = (s) => { const P = RB.practice.of(s); if (!P.letters) P.letters = def(); return P.letters; };
  function tier(d, prof) {
    if (!d || !d.tiers) return null;
    const i = Math.max(0, LV.indexOf(prof || 'E'));
    for (let k = i; k >= 0; k--) if (d.tiers[LV[k]]) return Object.assign({ lv: LV[k] }, d.tiers[LV[k]]);
    for (let k = i + 1; k < 4; k++) if (d.tiers[LV[k]]) return Object.assign({ lv: LV[k] }, d.tiers[LV[k]]);
    return null;
  }
  // a letter comes from someone you have met (its `met` condition); postgame, all of them are
  const met = (s, d) => !d.met || RB.state.test(s, d.met);
  function list(s) {
    const r = rec(s);
    return defs().map((d) => ({
      id: d.id, def: d, rec: r.done[d.id] || null, met: met(s, d),
      state: r.active && r.active.id === d.id ? 'open' : r.done[d.id] ? 'answered' : 'waiting',
    }));
  }
  function open(s, id) {
    const d = byId(id);
    if (!d) return { ok: false, why: 'unknown' };
    if (!met(s, d)) return { ok: false, why: 'not-met' };
    const r = rec(s);
    if (r.active && r.active.id !== id) return { ok: false, why: 'other-open', open: r.active.id };
    if (!r.active) r.active = { id, opened: RB.practice.seq(s) };
    return { ok: true, replay: !!r.done[id] };
  }
  function setAside(s) { const r = rec(s); r.active = null; }
  // info: { tone, via: 'parts'|'choice'|'ime'|'hand', reply (plain text), prof }
  function complete(s, id, info) {
    const r = rec(s);
    info = info || {};
    const reply = String(info.reply || '').slice(0, MAX_REPLY);
    let sent = false;
    if (!r.done[id]) {
      r.done[id] = { st: 'sent', tone: info.tone || null, via: info.via || null, reply, prof: info.prof || null, t: Date.now(), replays: 0 };
      sent = true;
    } else {
      const d = r.done[id];
      d.replays = Math.min(9999, (d.replays | 0) + 1);
      d.last = { tone: info.tone || null, via: info.via || null, t: Date.now() };
    }
    if (r.active && r.active.id === id) r.active = null;
    return { sent, rec: r.done[id] };
  }
  function eligible(s) {
    if (!s) return { ok: false, why: 'Not in a campaign.' };
    if (!RB.state.test(s, 'post')) return { ok: false, why: 'The practice letters wait for the journey\'s end.' };
    if (!RB.practiceB.atPlace(s)) return { ok: false, why: 'At the post box in Shino\'s Post House.' };
    return RB.practiceB.worldSafe();
  }
  const available = (s) => !!s && RB.state.test(s, 'post');
  const answered = (s) => Object.keys(rec(s).done).filter((k) => byId(k)).length;

  return { LV, defs, byId, rec, tier, list, open, setAside, complete, eligible, available, answered, met, norm, def, MAX_REPLY };
})();
