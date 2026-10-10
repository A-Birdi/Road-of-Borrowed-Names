/* The evidence log (expansion L1, L2, L6, L20; docs/future/plan/05_LANGUAGE.md). Beside the scheduler's own record
 * (src/learn/10_mastery.js, unchanged), every committed answer leaves an honest trace of what happened:
 *
 *   how it was answered (evidence mode): recog (chose among options) · context (understood a passage in a situation)
 *     · construct (ordered or forged a sentence) · typed · hand (handwritten) · listen (device voice; optional)
 *   where (context type: story, battle, field, activity, practice, atlas, exam, chart)
 *   what help supplied, by category (L2): conceptual < constrain < supplied; access and input help never count
 *   whether the first committed answer was right, recognition repairs (input data, never a mistake), whether a model
 *   was shown (exposed: copying and guided examples are practice, not independent production)
 *
 * Per item (s.learn.items[id]): `log` (the last 12 attempts), `ev` (independent successes per mode, plus `transfer`:
 * an independent success in a context type the item had not succeeded in before), `evTry` (attempts per mode),
 * `okIn` (context types of independent successes), `lastDay`. Kanji have their own record (s.learn.kanji[char]):
 * the words they were met and used in, with each word's reading, so meeting 水 in みず never certifies すい.
 * Nothing earlier is rewritten: an older item simply starts its log empty. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.evidence = (function () {
  'use strict';
  const LOG = 12;
  const MODES = ['recog', 'context', 'construct', 'typed', 'hand', 'listen'];
  const COUNTING = { constrain: true, supplied: true }; // help that counts as "assisted" for a star (L2)
  const day = (t) => Math.floor((t == null ? Date.now() : t) / 86400000);
  const isKanji = (ch) => /[\u4e00-\u9fff\u3400-\u4dbf\u3005]/.test(ch);

  // the evidence mode of an answer, from the step and the input used
  function modeOf(step, inputMode) {
    if (!step) return 'recog';
    if (step.kind === 'listen') return 'listen';
    if (step.kind === 'order' || step.kind === 'forge') return inputMode === 'hand' ? 'hand' : inputMode === 'ime' ? 'typed' : inputMode === 'choice' ? 'recog' : 'construct';
    if (step.kind === 'choose') return step.ctx && step.ctx.jp && plainLen(step.ctx.jp) > 12 ? 'context' : 'recog';
    if (inputMode === 'hand') return 'hand';
    if (inputMode === 'ime') return 'typed';
    return 'recog';
  }
  function plainLen(jp) { try { return RB.tasks.plain(jp).length; } catch (e) { return String(jp).length; } }
  const independent = (r) => !!(r.ok && r.firstTry !== false && !r.exposed && !(r.help && COUNTING[r.help]) && !r.assisted);

  function add(s, ids, r) {
    if (!s || !s.learn || !ids) return;
    const list = Array.isArray(ids) ? ids : [ids];
    const where = RB.meter ? RB.meter.where(r.ctx) : 'story';
    const today = day(r.t);
    const entry = { d: today, m: r.ev || 'recog', c: where, h: r.help || null, f: r.firstTry === false || !r.ok ? 0 : 1, x: r.exposed ? 1 : 0 };
    if (r.repairs) entry.r = r.repairs;
    const indep = independent(r);
    for (const id of list) {
      const it = s.learn.items[id];
      if (!it) continue;
      const log = it.log || (it.log = []);
      log.push(entry);
      if (log.length > LOG) log.splice(0, log.length - LOG);
      const tries = it.evTry || (it.evTry = {});
      tries[entry.m] = (tries[entry.m] || 0) + 1;
      if (indep) {
        const ev = it.ev || (it.ev = {});
        ev[entry.m] = (ev[entry.m] || 0) + 1;
        const okIn = it.okIn || (it.okIn = []);
        if (okIn.length && okIn.indexOf(where) < 0) ev.transfer = (ev.transfer || 0) + 1;
        if (okIn.indexOf(where) < 0) okIn.push(where);
      }
      it.lastDay = today;
      // kanji: the words they appear in (with that word's reading), and whether they were written by hand
      if (id.slice(0, 2) === 'v:') kanjiOf(s, id.slice(2), r, entry, indep);
    }
  }
  function kanjiRec(s, ch) {
    const K = s.learn.kanji || (s.learn.kanji = {});
    return K[ch] || (K[ch] = { met: 0, words: {}, hand: 0, handOk: 0, lastDay: null });
  }
  function readingOf(surface) {
    try { const e = RB.lex && RB.lex.get ? RB.lex.get(surface) : null; return e && e.r ? e.r : null; } catch (e) { return null; }
  }
  function kanjiOf(s, surface, r, entry, indep) {
    const chars = Array.from(surface).filter(isKanji);
    if (!chars.length) return;
    const rd = readingOf(surface);
    const key = surface + (rd ? '（' + rd + '）' : '');
    const written = r.written ? Array.from(String(r.written)) : [];
    for (const ch of chars) {
      const k = kanjiRec(s, ch);
      k.met++;
      k.words[key] = (k.words[key] || 0) + 1;
      k.lastDay = entry.d;
      // written by hand in this answer (not merely shown in it)
      if (entry.m === 'hand' && written.indexOf(ch) >= 0) { k.hand++; if (indep) k.handOk++; }
    }
  }
  // L20: the kanji chart's practice square (src/ui/62_kanjichart.js): tracing over the model is exposed practice,
  // writing from memory is handwriting practice. Never a mistake, never a box change.
  function chartPractice(s, ch, o) {
    if (!s || !s.learn || !isKanji(ch)) return null;
    const k = kanjiRec(s, ch);
    k.practice = k.practice || { traced: 0, memory: 0, memoryOk: 0 };
    if (o && o.traced) k.practice.traced++;
    else { k.practice.memory++; if (o && o.ok) k.practice.memoryOk++; }
    k.lastDay = day();
    return k;
  }
  // a plain summary for an item's page (L4): never a single percentage, always with its denominator
  function profile(s, id) {
    const it = s && s.learn && s.learn.items[id];
    if (!it) return null;
    const ev = it.ev || {}, tries = it.evTry || {};
    const recent = (it.log || []).slice(-10);
    return {
      id, box: it.box, seen: it.seen,
      recogRecent: { ok: recent.filter((e) => (e.m === 'recog' || e.m === 'context') && e.f && !e.h).length, of: recent.filter((e) => e.m === 'recog' || e.m === 'context').length },
      modes: Object.fromEntries(MODES.map((m) => [m, { independent: ev[m] || 0, tries: tries[m] || 0 }])),
      contexts: (it.okIn || []).slice(), transfer: ev.transfer || 0, helped: (it.log || []).filter((e) => e.h).length,
      lastDay: it.lastDay == null ? null : it.lastDay, limited: (it.log || []).length < 3,
    };
  }

  // every committed answer passes through RB.learn.record: log it there (after the meter)
  if (RB.learn && RB.learn.record && !RB.learn.record.__evidence) {
    const inner = RB.learn.record;
    const wrapped = function (id, result) {
      const out = inner(id, result);
      try { if (id && RB.game && RB.game.s && result) add(RB.game.s, id, result); } catch (e) { /* the log never breaks an answer */ }
      return out;
    };
    wrapped.__evidence = true; wrapped.__metered = !!inner.__metered;
    RB.learn.record = wrapped;
  }
  return { modeOf, add, chartPractice, profile, independent, day, MODES, COUNTING, LOG };
})();
