/* Companion shiritori: where it is offered (Practice addendum §3.3, §20.1).
 * Registered here (content loads after the pets' rest choice) so the rest menu
 * reads: Just chat (first, the default), the ritual, the next topic, the pet's
 * greeting, then Talk: How we played (when it waits) and Play shiritori, then
 * Not now. Nothing intercepts talking to the companion elsewhere; a waiting
 * story topic, an owed ending or a Pages conversation still comes first. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const W = RB.content.wordplay;
  const U = () => RB.ui.wordplay;
  if (RB.company && RB.company.addRestOption) {
    // How we played: an activity-owned flag, offered as one more rest topic (never talk._pending)
    RB.company.addRestOption((s) => {
      if (!s || !s.comp || !RB.wordplay.reflection(s)) return null;
      const sc = W.reflections[s.comp];
      if (!sc || !RB.content.scenes[sc]) return null;
      return { id: 'wordplay-reflect', label: W.labels.talkReflect, run: () => RB.script.run(sc) };
    });
    // Play shiritori: the scene lets go first, then the activity opens (the same preparation sheet)
    RB.company.addRestOption((s) => {
      if (!s || !s.comp) return null;
      const waiting = RB.wordplay.ns(s).active;
      return { id: 'shiritori', label: waiting ? { jp: W.labels.resume.jp, en: 'Shiritori: resume the match' } : W.labels.play, run: () => { U().launchAfterScene({ source: 'companion-talk', resume: !!waiting }); } };
    });
  }
  // Words › Ways to practise: where it is offered; "Begin here" only at a rest stop, never remotely
  if (RB.practice && RB.practice.addActivity) {
    RB.practice.addActivity({
      id: 'shiritori', en: 'Shiritori with your companion', jp: W.labels.title.jp, icon: 'talk', order: 20,
      where: W.labels.where,
      available: (s) => !!(s && s.comp),
      here: (s) => !!(s && s.comp && RB.company.restHere(s)),
      note: (s) => (!s || !s.comp ? 'Once a companion has set out with you.' : RB.company.restHere(s) ? 'Talk to your companion here, or begin now.' : 'Offered at rest stops: an inn, the teahouse, a hut or a camp. Company › Wordplay keeps the records.'),
      begin: (ctx) => U().launch({ source: 'words' }),
    });
  }
})();
