/* Measuring what players actually meet (expansion L19; docs/future/plan/05_LANGUAGE.md). Every committed answer the
 * learning record receives is also counted here, by chapter (story order: RB.edition), by where it happened and how it
 * was answered, so a playthrough's real diet of language interactions can be read off a save instead of estimated
 * from what was authored. Counting only: nothing here changes a record, a reward or a difficulty.
 *
 *   s.meter = { v: 1, ch: { <chapter key>: { n, where: { story, battle, field, activity, practice, atlas, … },
 *               how: { choice, ime, hand }, assisted, missed, steps: { write, choose, order, … } } } }
 *
 * RB.meter.report(s) summarises it (tests/e2e/matrix.mjs prints it at the end of a route). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.meter = (function () {
  'use strict';
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  function of(s) {
    if (!isObj(s.meter) || s.meter.v !== 1) s.meter = { v: 1, ch: {} };
    return s.meter;
  }
  // where an answer happened, from the context the challenge runner passes (its ctxTag)
  function where(ctx) {
    const c = String(ctx || '');
    if (!c) return 'activity';
    if (c.startsWith('battle:')) return 'battle';
    if (c.startsWith('stretch:')) return 'stretch';
    if (c.startsWith('weave:')) return 'field';
    if (c.startsWith('practice:')) return 'activity';
    if (c === 'practice') return 'practice';
    if (c === 'atlas') return 'atlas';
    if (c === 'fishing' || c === 'signpost' || c === 'history' || c === 'lanterns' || c === 'letters' || c === 'copying' || c === 'proofreading' || c === 'comparisons' || c === 'bookmark') return 'activity';
    return 'story';
  }
  const bump = (o, k, n) => { o[k] = (o[k] || 0) + (n == null ? 1 : n); };
  function count(s, result) {
    if (!s || !result) return;
    const m = of(s);
    const key = (RB.edition && RB.edition.key(s)) || 'prologue';
    const r = m.ch[key] || (m.ch[key] = { n: 0, where: {}, how: {}, assisted: 0, missed: 0, steps: {} });
    r.n++;
    bump(r.where, where(result.ctx));
    bump(r.how, result.mode === 'hand' ? 'hand' : result.mode === 'ime' ? 'ime' : 'choice');
    if (result.assisted) r.assisted++;
    if (!result.ok) r.missed++;
    if (result.kind) bump(r.steps, result.kind);
  }
  function report(s) {
    const m = of(s), out = { total: 0, byChapter: {}, where: {}, how: {}, steps: {}, assisted: 0 };
    for (const k in m.ch) {
      const r = m.ch[k];
      out.total += r.n; out.assisted += r.assisted;
      out.byChapter[k] = r.n;
      for (const w in r.where) bump(out.where, w, r.where[w]);
      for (const h in r.how) bump(out.how, h, r.how[h]);
      for (const st in r.steps) bump(out.steps, st, r.steps[st]);
    }
    return out;
  }
  // every committed answer passes through RB.learn.record: count it there, once per call (not once per item id)
  if (RB.learn && RB.learn.record && !RB.learn.record.__metered) {
    const inner = RB.learn.record;
    const wrapped = function (id, result) {
      const r = inner(id, result);
      try { if (id && RB.game && RB.game.s && !(result && result.unmetered)) count(RB.game.s, result); } catch (e) { /* counting never breaks an answer */ }
      return r;
    };
    wrapped.__metered = true;
    RB.learn.record = wrapped;
  }
  return { of, count, report, where };
})();
