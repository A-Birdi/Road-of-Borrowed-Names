/* Shell messages (expansion P11; plan 07_REGIONS.md R4, A53 distributed messages, A5 reference, A10 comic
 * reconstruction). Kotonoha's conches each hold a fragment of something once said aloud; the player reads each one
 * (and can listen, with the device's own Japanese voice where there is one: optional, src/audio/50_voice.js), then
 * works out who said it to whom. The clues are in the words: who is called what (姉さん, お嬢さん), how plain or polite
 * the speech is, and what each line answers. A wrong pairing is shown for what it would mean (often funny), with the
 * clue that points the other way; nothing is lost, and the reconstruction is done when every line has its speaker and
 * listener. The rules only; the sheet is src/ui/89s_shells.js, the content RB.content.shells (src/content/ko/).
 *
 *   C.shells[id] = { id, title:{jp,en}, question:{jp,en}, people: [{ id, jp, en }],
 *     frags: [{ id, shell, text: { F:{jp,en}, E:…, I:…, A:… }, who, to, cue:{en}, comic:{en} }],
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
  function keep(s, id, r) { if (r.ok) s.flags['shells_' + id] = true; }
  // the automated runs: every line placed right
  function autoPlaced(d) { return Object.fromEntries(d.frags.map((fr) => [fr.id, { who: fr.who, to: fr.to }])); }
  return { def, textAt, judge, keep, autoPlaced };
})();
