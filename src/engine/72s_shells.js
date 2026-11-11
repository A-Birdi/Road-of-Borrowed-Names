/* Shell messages (expansion P11; plan 07_REGIONS.md R4, A53 distributed messages, A5 reference, A10 comic
 * reconstruction). Kotonoha's conches each hold a fragment of something once said aloud; the player reads each one
 * (and can listen, with the device's own Japanese voice where there is one: optional, src/audio/50_voice.js), then
 * works out who said it to whom. The clues are in the words: who is called what (姉さん, お嬢さん), how plain or polite
 * the speech is, and what each line answers. A wrong pairing is shown for what it would mean (often funny), with the
 * clue that points the other way; nothing is lost, and the reconstruction is done when every line has its speaker and
 * listener. The rules only; the sheet is src/ui/89s_shells.js, the content RB.content.shells (src/content/ko/).
 *
 *   C.shells[id] = { id, title:{jp,en}, question:{jp,en}, people: [{ id, jp, en }],
 *     frags: [{ id, shell, text: { F:{jp,en}, E:…, I:…, A:… }, who, to, cue:{en}, comic:{en}, comicIf: { who | to } }],
 *     read: challenge id (a reference question about the same lines, at the profile's tier: the language evidence) }
 *
 * What is kept (no new save field): s.flags['shells_' + id] once every line is placed. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.shells = (function () {
  'use strict';
  const PROF = ['F', 'E', 'I', 'A'];
  const def = (id) => ((RB.content && RB.content.shells) || {})[id] || null;
  // a fragment's text at a profile: its own tier, else the nearest below, else the nearest above
  function textAt(fr, prof) {
    const t = fr.text || {};
    const i = Math.max(0, PROF.indexOf(prof));
    for (let j = i; j >= 0; j--) if (t[PROF[j]]) return t[PROF[j]];
    for (let j = i + 1; j < PROF.length; j++) if (t[PROF[j]]) return t[PROF[j]];
    return { jp: '', en: '' };
  }
  // judge the placings: { fragId: { who, to } } → per fragment whether the speaker and the listener are right
  function judge(d, placed) {
    if (!d) return { ok: false, frags: {} };
    const out = {};
    let all = true;
    for (const fr of d.frags) {
      const p = (placed || {})[fr.id] || {};
      const who = p.who === fr.who, to = p.to === fr.to;
      out[fr.id] = { who, to, done: !!(p.who && p.to), ok: who && to };
      if (!(who && to)) all = false;
    }
    return { ok: all, frags: out };
  }
  // A line's comic says what one particular wrong placing would mean, so it is shown for that placing only: its
  // comicIf names the one field the comic changes (who or to) and the person it puts there, and the other field must be
  // the line's own (Agnes 6550310863 and 6550523690; Local CL-576; Cloud CC-417). Any other wrong placing gets the clue
  // alone. A comicIf that is missing or malformed never shows the comic (the clue alone, never a joke about a placing
  // that was not made); tools/validate.mjs reports it by the same rule.
  const FIELDS = ['who', 'to'];
  function comicProblem(d, fr) {
    if (!fr || !fr.comic) return null;
    const c = fr.comicIf;
    if (c == null) return 'has a comic but no comicIf';
    if (typeof c !== 'object' || Array.isArray(c)) return 'comicIf must be an object naming who or to';
    const keys = Object.keys(c);
    if (keys.length !== 1) return 'comicIf must name exactly one field (who or to), not ' + (keys.length ? keys.join(', ') : 'none');
    const k = keys[0];
    if (!FIELDS.includes(k)) return 'comicIf names an unknown field ' + k;
    if (!((d && d.people) || []).some((pp) => pp.id === c[k])) return 'comicIf names someone not among the people: ' + c[k];
    if (c[k] === fr[k]) return 'comicIf names the right ' + k + ' (' + c[k] + '), not a wrong one';
    return null;
  }
  function comicFits(d, fr, p) {
    if (!fr || !fr.comic || !p || comicProblem(d, fr)) return false;
    const k = Object.keys(fr.comicIf)[0], other = k === 'who' ? 'to' : 'who';
    return p[k] === fr.comicIf[k] && p[other] === fr[other];
  }
  function keep(s, id, r) { if (r.ok) s.flags['shells_' + id] = true; }
  // the automated runs: every line placed right
  function autoPlaced(d) { return Object.fromEntries(d.frags.map((fr) => [fr.id, { who: fr.who, to: fr.to }])); }
  return { def, textAt, judge, keep, autoPlaced, comicProblem, comicFits };
})();
