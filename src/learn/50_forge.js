/* Sentence forging (expansion L7; docs/future/plan/05_LANGUAGE.md): say what you need. A forge step states an
 * intention ("Ask the keeper to leave the side gate open until evening"), sometimes with a picture or a situation,
 * and accepts any of its authored replies. The answer space is the villagers' letters' (src/engine/79_bcore.js,
 * RB.practiceB): families of approved parts, optional parts ('?'), either sentence order, kanji or kana per word.
 * Text outside it is "outside what this can read", never marked wrong.
 *
 * The support ladder (the player picks a rung and can change it mid-task, as input modes switch today):
 *   1 'choice'  choose among complete sentences               evidence: recog
 *   2 'build'   arrange meaningful chunks (some don't belong)  construct
 *   3 'fine'    arrange it word by word, particles and endings separate   construct
 *   4 'ime' / 'hand'  type or handwrite it                     typed / hand
 *
 * A step: { kind: 'forge', id, title, prompt: { en, jp? }, ctx?, header?, families: [{ parts, also?, ok, tone?, en,
 *   why?, result? }], extra?: [markup chunks that don't belong], extraFine?: [words that don't belong], explain?,
 *   item?, concepts? }. A family's `result` (a short id) is what the scene does next: the keeper opens the gate, the
 *   barge goes where you sent it (RB.challenge.run leaves it in var._forge). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.forge = (function () {
  'use strict';
  const B = () => RB.practiceB;
  const reading = (m) => { try { return RB.jp.reading(m).replace(/\s+/g, ''); } catch (e) { return String(m); } };
  const bare = (p) => (typeof p === 'string' && p[0] === '?' ? p.slice(1) : p);
  // the word-by-word tiles of a chunk: its markup tokens, punctuation kept with the word before it
  function words(chunk) {
    const out = [];
    for (const t of String(bare(chunk)).split(' ').filter(Boolean)) {
      if (/^[。、！？]$/.test(t) && out.length) out[out.length - 1] += ' ' + t;
      else out.push(t);
    }
    return out;
  }
  function prepare(step) {
    if (step.__forge) return step;
    const fams = step.families || [];
    const oks = fams.filter((f) => f.ok);
    if (!oks.length) throw new Error('forge ' + (step.id || '?') + ': no accepted reply');
    const sp = B().space(fams);
    let longest = '';
    const okReadings = [];
    fams.forEach((f) => B().sequences(f).forEach((q) => { const r = reading(q.join(' ')); if (f.ok) okReadings.push(r); if (r.length > longest.length) longest = r; }));
    const chunks = B().pieces(fams, step.extra);
    const fine = [];
    for (const c of chunks) for (const w of words(c)) if (fine.indexOf(w) < 0) fine.push(w);
    for (const w of step.extraFine || []) if (fine.indexOf(w) < 0) fine.push(w);
    const out = Object.assign({}, step, {
      __forge: true, kind: 'forge',
      answer: B().replyOf(oks[0]), answerReading: reading(B().replyOf(oks[0])), fullAnswer: longest, accept: okReadings, mode: 'reading',
      sentences: fams.map((f) => ({ jp: B().replyOf(f), en: f.en, ok: !!f.ok, why: f.why || null, _f: f })),
      chunks, fine,
      judge(text, jo) {
        const m = B().match(sp, text, { handwritten: !!(jo && jo.handwritten) });
        if (!m) return { ok: false, limit: true, head: 'Outside what this can read', html: limitHtml(fams), feedback: [] };
        if (m.family.ok) return { ok: true, matched: m.family, family: m.i };
        return { ok: false, family: m.i, feedback: [{ code: 'intent', en: m.family.why ? m.family.why.en : 'That says something else.' }] };
      },
    });
    return out;
  }
  // pieces placed in order (chunks or words): which family they make, or null (outside the space)
  function piecesMatch(step, picked) { return B().partsMatch(step.families, picked); }
  function limitHtml(fams) {
    const esc = RB.util.esc;
    return '<p>This task can only read the sentences it was written with (' + fams.length + ' of them). Yours may be perfectly good Japanese; it is simply outside what it can check, so it is not marked wrong.</p>' +
      '<p class="muted small">Sentences it can read say:</p><ul class="pb-shapes">' + fams.filter((f) => f.ok).map((f) => '<li>' + esc(f.en) + '</li>').join('') + '</ul>';
  }
  // the family a result came from, and what it does in the scene
  function outcome(step, res) {
    const fams = step.families || [];
    let i = res && res.given && res.given.family != null ? res.given.family : -1;
    if (i < 0 && res && res.given && res.given.option && res.given.option._f) i = fams.indexOf(res.given.option._f);
    const f = fams[i] || fams.find((x) => x.ok) || null;
    return f ? { family: i, result: f.result || null, tone: f.tone || null, en: f.en } : null;
  }
  const RUNGS = ['choice', 'build', 'fine', 'ime', 'hand'];
  // the rung a player starts on: the one they chose last time, else by level (Foundations and Elementary: chunks;
  // Intermediate: word by word; Advanced: typing)
  function startRung(settings, profile) {
    const r = settings && settings.forgeRung;
    if (RUNGS.indexOf(r) >= 0) return r;
    return profile === 'A' ? 'ime' : profile === 'I' ? 'fine' : 'build';
  }
  return { prepare, piecesMatch, outcome, words, RUNGS, startRung };
})();
