/* The Road Stamp Book's language stamps (expansion P06, K1): the first "What I can do" of each kind, shown in two
 * different places (never a mastery star: C-13). Loaded last, after the "What I can do" themes. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const add = (id, d) => { C.stamps[id] = Object.assign({ id }, d); };
  // ---- language: the first "What I can do" of each kind ----------------------------------------------------------
  for (const th of C.canDoThemes || []) {
    add('can.' + th.id, { family: 'language', title: th, criteria: T('Show you can do one thing of this kind, in two different places.', '「できる こと」'), when: (s) => {
      if (RB.edition.of(s) < 2 || !RB.ui || !RB.ui.mastery || !RB.ui.mastery.canDoState) return false;
      return (C.canDo || []).filter((x) => x.theme === th.id).some((x) => RB.ui.mastery.canDoState(s, x).status === 'shown');
    }, stand: null, design: { shape: 'oval', motif: 'brush', ink: '#2a4f8a' } });
  }

})(RB.content);
