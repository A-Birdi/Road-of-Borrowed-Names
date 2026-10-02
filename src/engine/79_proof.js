/* The Proofreader's Tray (Practice addendum §18): twelve short notices, each laid
 * on one sheet beside all the evidence needed to check it, at the same post box as
 * the practice letters (src/engine/79_bcore.js PLACE), from the resolution of
 * Chapter 2 on (flag ch2_done). Content: src/content/practice_b/20_proof.js
 * (RB.content.practiceB.proof); interface: src/ui/91_proof.js.
 *
 * A task is solved in two moves: find the part of the notice that disagrees with the
 * evidence (or, for P12, conclude that the evidence cannot settle it), then repair it
 * with approved pieces, a rearrangement or a short supported replacement. Stylistic
 * alternatives are accepted; uncertain handwriting is never a proofreading error.
 *
 * s.practice.proof = {
 *   v: 1,
 *   done: { P01: { t, prof, replays } },
 *   assessed: { 'proof:P01': 1 },  one ordinary assessment per task per campaign
 *   recent: [{ id, m? }],           cooldown across sittings
 * }
 * A finished sheet can be kept as a practice page (typeset; never handwriting) in the
 * shared six-page budget s.practice.deskPages: { id, kind: 'proof', mode: 'proof',
 * typeset: { task, lv, lines }, label, bytes, saved, created, updated }.
 *
 *   RB.proof.list(s) · RB.proof.tier(def, prof) · RB.proof.complete(s, id, info)
 *   RB.proof.eligible(s) · RB.proof.pageFor(def, tier, label) · RB.proof.kept(s) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.proof = (function () {
  'use strict';
  const LV = ['F', 'E', 'I', 'A'];
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const def = () => ({ v: 1, done: {}, assessed: {}, recent: [] });
  function norm(r) {
    if (!isObj(r)) return def();
    if (!isObj(r.done)) r.done = {};
    if (!isObj(r.assessed)) r.assessed = {};
    if (!Array.isArray(r.recent)) r.recent = [];
    if (r.recent.length > 8) r.recent = r.recent.slice(-8);
    for (const k in r.done) { const d = r.done[k]; if (!isObj(d)) r.done[k] = { replays: 0 }; else d.replays = Math.max(0, Math.min(9999, d.replays | 0)); }
    if (r.v == null) r.v = 1;
    return r;
  }
  if (RB.practice) RB.practice.addNamespace('proof', def, norm);

  const defs = () => ((RB.content.practiceB && RB.content.practiceB.proof) || []);
  const byId = (id) => defs().find((d) => d.id === id) || null;
  const rec = (s) => { const P = RB.practice.of(s); if (!P.proof) P.proof = def(); return P.proof; };
  function tier(d, prof) {
    if (!d || !d.tiers) return null;
    const i = Math.max(0, LV.indexOf(prof || 'E'));
    for (let k = i; k >= 0; k--) if (d.tiers[LV[k]]) return Object.assign({ lv: LV[k] }, d.tiers[LV[k]]);
    for (let k = i + 1; k < 4; k++) if (d.tiers[LV[k]]) return Object.assign({ lv: LV[k] }, d.tiers[LV[k]]);
    return null;
  }
  const list = (s) => { const r = rec(s); return defs().map((d) => ({ id: d.id, def: d, rec: r.done[d.id] || null })); };
  function complete(s, id, info) {
    const r = rec(s);
    info = info || {};
    if (!r.done[id]) { r.done[id] = { t: Date.now(), prof: info.prof || null, replays: 0 }; return { first: true, rec: r.done[id] }; }
    r.done[id].replays = Math.min(9999, (r.done[id].replays | 0) + 1);
    return { first: false, rec: r.done[id] };
  }
  const available = (s) => !!s && RB.state.test(s, 'ch2_done');
  function eligible(s) {
    if (!s) return { ok: false, why: 'Not in a campaign.' };
    if (!available(s)) return { ok: false, why: 'The tray is set out once Saltglass\'s trouble is settled.' };
    if (!RB.practiceB.atPlace(s)) return { ok: false, why: 'At the post box in Shino\'s Post House.' };
    return RB.practiceB.worldSafe();
  }
  // the repaired notice as markup lines (what a kept page shows, typeset)
  function repairedLines(t) {
    const segs = (t.notice && t.notice.segs) || [];
    if (t.fixed) return [].concat(t.fixed);
    return [segs.map((g) => (g.bad && g.fix ? g.fix : g.jp)).join(' ')];
  }
  // a kept page: typeset (the game's own lettering), labelled, never presented as handwriting
  function pageFor(d, t, label) {
    const now = Date.now();
    return {
      id: 'proof:' + d.id + ':' + t.lv, kind: 'proof', mode: 'proof',
      typeset: { task: d.id, lv: t.lv, lines: repairedLines(t), title: d.title },
      label: RB.practiceB.cleanLabel(label || (d.title && d.title.en) || d.id),
      saved: false, created: now, updated: now,
    };
  }
  const kept = (s) => RB.practiceB.pages(s, 'proof');

  return { LV, defs, byId, rec, tier, list, complete, eligible, available, repairedLines, pageFor, kept, norm, def };
})();
