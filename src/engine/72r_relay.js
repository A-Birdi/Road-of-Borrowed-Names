/* The relay (expansion P12; plan 07_REGIONS.md R2, A8 carry a message faithfully, A52 the Mountain Relay;
 * docs/future/work/P12_CLOUDROAD.md). On the Cloudroad a message is carried from one station to the next and repeated
 * there, part by part, *with the certainty the carrier actually has*: what they saw, what someone told them, what the
 * signs suggest, what was only rumour. The next station acts on what was said. Saying more than you know (a rumour
 * passed on as fact) sends help the wrong way: a side consequence the story lets you put right later, never a failure
 * and never a gate. Saying less than you know is noted kindly and costs nothing. The rules only; the sheet is
 * src/ui/89r_relay.js and the messages RB.content.relay (src/content/cr/31_reports.js).
 *
 *   C.relay[id] = { id, title:{jp,en}, to:{jp,en} (who hears it), items: [learning item ids],
 *     parts: [{ id, if?: condition (a part only when it holds, e.g. only if you walked that road),
 *       have: {jp,en} (what you have of it, and how you came by it),
 *       say: { F:[opt], E:[opt], I:[opt], A:[opt] }  (nearest tier below, else above, as tellings' texts),
 *       opt = { id, jp, en, ok?: true | over?: true | under?: true, why: {en} } }],
 *     acts?: { over: { part id: flag } } }   a flag the story reads when that part was overstated
 *
 * What is kept (campaign-local, no new save field), under the id with its dots as underscores (cr.r1 → cr_r1):
 * s.vars['relay_' + key] = 'ok' | 'over' | 'under' (the whole message), s.vars['relay_' + key + '_' + part] = the
 * option said, s.flags['relay_' + key + '_done'], and any acts.over flag. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.relay = (function () {
  'use strict';
  const C = () => RB.content;
  const PROF = ['F', 'E', 'I', 'A'];
  const def = (id) => (C().relay || {})[id] || null;
  // a part's options at a profile: its own tier, else the nearest below, else the nearest above
  function optsAt(part, prof) {
    const t = part.say || {};
    const i = Math.max(0, PROF.indexOf(prof));
    for (let j = i; j >= 0; j--) if (t[PROF[j]]) return t[PROF[j]];
    for (let j = i + 1; j < PROF.length; j++) if (t[PROF[j]]) return t[PROF[j]];
    return [];
  }
  // the parts that apply now (a part may depend on the road walked, a person met)
  function parts(d, s) { return d.parts.filter((p) => !p.if || (s && RB.state.test(s, p.if))); }
  const statusOf = (o) => (!o ? null : o.over ? 'over' : o.under ? 'under' : o.ok ? 'ok' : 'off');
  // judge what was said: { partId: optionId } → { ok, verdict, byPart: {id: {said, status, why}}, over: [ids] }
  function judge(d, said, s, prof) {
    const out = { byPart: {}, over: [], under: [] };
    for (const p of parts(d, s)) {
      const o = optsAt(p, prof).find((x) => x.id === (said || {})[p.id]) || null;
      const st = statusOf(o);
      out.byPart[p.id] = { said: o ? o.id : null, status: st, why: o && o.why ? o.why : null };
      if (st === 'over') out.over.push(p.id);
      if (st === 'under' || st === 'off') out.under.push(p.id);
    }
    const all = parts(d, s).every((p) => out.byPart[p.id].said);
    out.complete = all;
    out.verdict = !all ? null : out.over.length ? 'over' : out.under.length ? 'under' : 'ok';
    out.ok = out.verdict === 'ok';
    return out;
  }
  // keep what was said, raise the flags the story reads, record the language evidence
  const key = (id) => String(id).replace(/\./g, '_');
  function keep(s, d, said, r, prof) {
    s.vars = s.vars || {};
    const k = key(d.id);
    s.vars['relay_' + k] = r.verdict;
    for (const pid in r.byPart) s.vars['relay_' + k + '_' + pid] = r.byPart[pid].said;
    for (const pid of r.over) { const f = d.acts && d.acts.over && d.acts.over[pid]; if (f) s.flags[f] = true; }
    s.flags['relay_' + k + '_done'] = true;
    if (d.items && RB.learn && RB.learn.record) {
      try { RB.learn.record(d.items, { ok: r.ok, mode: 'choice', assisted: false, ctx: 'relay:' + d.id, kind: 'relay' }); } catch (e) { /* recording never blocks the road */ }
    }
  }
  // the automated runs: say every part faithfully
  function autoSaid(d, s, prof) {
    const out = {};
    for (const p of parts(d, s)) { const o = optsAt(p, prof).find((x) => x.ok) || optsAt(p, prof)[0]; if (o) out[p.id] = o.id; }
    return out;
  }
  // content check: every part offers exactly one faithful way to say it at each tier it has, every other option says
  // why, and every acts flag names a real part
  function check() {
    const bad = [];
    for (const id in C().relay || {}) {
      const d = C().relay[id];
      if (!d.parts || !d.parts.length) bad.push(id + ': no parts');
      for (const p of d.parts || []) {
        if (!p.have || !p.have.jp) bad.push(id + '.' + p.id + ': what you have of it is missing');
        for (const k in p.say || {}) {
          const os = p.say[k];
          if (os.filter((o) => o.ok).length !== 1) bad.push(id + '.' + p.id + '.' + k + ': not exactly one faithful option');
          for (const o of os) if (!o.ok && !(o.why && o.why.en)) bad.push(id + '.' + p.id + '.' + k + '.' + o.id + ': no reason given');
          for (const o of os) if (!o.ok && !o.over && !o.under) bad.push(id + '.' + p.id + '.' + k + '.' + o.id + ': neither over nor under');
        }
      }
      for (const pid in (d.acts && d.acts.over) || {}) if (!(d.parts || []).some((p) => p.id === pid)) bad.push(id + ': acts names no part ' + pid);
    }
    return bad;
  }
  return { def, optsAt, parts, judge, keep, autoSaid, check, key, PROF };
})();
