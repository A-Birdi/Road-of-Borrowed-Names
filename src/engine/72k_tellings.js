/* Weighing tellings (expansion P10; plan 07_REGIONS.md R8, 08_CULTURE.md C9, A49 folklore told several ways, A5
 * sources and reference). The Keepers' Road's verb: several sources describe the same thing differently (an
 * inscription, an old keeper's memory, a children's rhyme, a teller's scroll); the player marks what each one can
 * vouch for, then acts on the result. The rules only; the sheet is src/ui/89k_tellings.js and the content
 * RB.content.tellings (src/content/kr/31_tellings.js).
 *
 *   C.tellings[id] = { id, title:{jp,en}, question:{jp,en},
 *     sources: [{ id, kind: 'inscription'|'memory'|'rhyme'|'scroll'|'board'|'record', who:{jp,en},
 *       read: challenge id (reading it, at the profile's tier; the language evidence),
 *       text: { F:{jp,en}, E:…, I:…, A:… } (what it says, by profile; A may carry a classical line and its gloss),
 *       claims: [{ id, jp, en, vouch: true|false, why:{en}, rule? }] }],
 *     answer: { kind: 'order', items: [{ id, jp, en }] }      the claims' rules decide which orders are supported
 *           | { kind: 'choice', options: [{ id, jp, en, needs: [claim ids], best?: true, detour?:{en}, why?:{en} }] } }
 *
 * A claim's rule (orders only): { first: x } | { last: x } | { at: [x, n] } (1-based) | { before: [x, y] }.
 * Only claims a source can really vouch for (vouch: true) bind the answer: a reading is supported when it breaks
 * none of them; for a choice, when every claim it needs can be vouched for. Any supported reading succeeds; one
 * marked best saves a detour. Marks are the player's own judgement, given feedback (a claim marked the other way
 * says why) and never a gate: nothing is lost by a wrong mark, and the reading is judged on the sources alone.
 *
 * What is kept (campaign-local, no new save field): s.vars['tell_' + id] = the reading taken ('east,spring,…' or the
 * option id), s.flags['tell_' + id + '_ok'] once a supported reading was acted on, ['tell_' + id + '_best'] when it
 * was the best one. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.tellings = (function () {
  'use strict';
  const C = () => RB.content;
  const def = (id) => (C().tellings || {})[id] || null;
  const PROF = ['F', 'E', 'I', 'A'];
  // a source's text at a profile: its own tier, else the nearest below, else the nearest above
  function textAt(src, prof) {
    const t = src.text || {};
    const i = Math.max(0, PROF.indexOf(prof));
    for (let j = i; j >= 0; j--) if (t[PROF[j]]) return t[PROF[j]];
    for (let j = i + 1; j < PROF.length; j++) if (t[PROF[j]]) return t[PROF[j]];
    return { jp: '', en: '' };
  }
  const claims = (d) => [].concat(...d.sources.map((s) => (s.claims || []).map((c) => Object.assign({ source: s.id }, c))));
  const binding = (d) => claims(d).filter((c) => c.vouch);
  // does an order keep a rule?
  function keeps(order, r) {
    if (!r) return true;
    const at = (x) => order.indexOf(x);
    if (r.first) return at(r.first) === 0;
    if (r.last) return at(r.last) === order.length - 1;
    if (r.at) return at(r.at[0]) === r.at[1] - 1;
    if (r.before) return at(r.before[0]) >= 0 && at(r.before[1]) >= 0 && at(r.before[0]) < at(r.before[1]);
    return true;
  }
  // the rules an order breaks: the vouched claims it goes against (each says where it comes from)
  function broken(d, order) { return binding(d).filter((c) => !keeps(order, c.rule)); }
  // every order the vouched claims allow (small sets only: four or five items)
  function supportedOrders(d) {
    const ids = d.answer.items.map((x) => x.id), out = [];
    const perm = (pre, rest) => { if (!rest.length) { if (!broken(d, pre).length) out.push(pre); return; } rest.forEach((x, i) => perm(pre.concat(x), rest.slice(0, i).concat(rest.slice(i + 1)))); };
    perm([], ids);
    return out;
  }
  // feedback on the player's marks: { claimId: { mark, right, why } }
  function markFeedback(d, marks) {
    const out = {};
    for (const c of claims(d)) {
      if (!(c.id in (marks || {}))) continue;
      out[c.id] = { mark: !!marks[c.id], right: !!marks[c.id] === !!c.vouch, why: c.why || null };
    }
    return out;
  }
  // judge a reading: an order (array of item ids) or a choice (option id)
  function judge(d, reading) {
    if (!d) return { ok: false };
    if (d.answer.kind === 'order') {
      const order = [].concat(reading || []);
      const bad = broken(d, order);
      const all = supportedOrders(d);
      return { ok: !bad.length && order.length === d.answer.items.length, best: !bad.length, broken: bad, supported: all, reading: order.join(',') };
    }
    const opt = d.answer.options.find((o) => o.id === reading);
    if (!opt) return { ok: false, reading };
    const byId = Object.fromEntries(claims(d).map((c) => [c.id, c]));
    const missing = (opt.needs || []).filter((cid) => !(byId[cid] && byId[cid].vouch));
    return { ok: !missing.length, best: !missing.length && !!opt.best, detour: !missing.length && !opt.best ? opt.detour || null : null, missing: missing.map((cid) => byId[cid]).filter(Boolean), option: opt, reading };
  }
  // keep what was decided (a supported reading acted on)
  function keep(s, id, r) {
    s.vars = s.vars || {};
    s.vars['tell_' + id] = r.reading;
    if (r.ok) s.flags['tell_' + id + '_ok'] = true;
    if (r.ok && r.best) s.flags['tell_' + id + '_best'] = true;
  }
  // the automated runs: the best supported reading (the first supported order; the best option, else any supported)
  function autoReading(d) {
    if (d.answer.kind === 'order') return supportedOrders(d)[0] || d.answer.items.map((x) => x.id);
    const ok = d.answer.options.filter((o) => judge(d, o.id).ok);
    return ((ok.find((o) => o.best) || ok[0]) || d.answer.options[0]).id;
  }
  return { def, textAt, claims, binding, keeps, broken, supportedOrders, markFeedback, judge, keep, autoReading };
})();
