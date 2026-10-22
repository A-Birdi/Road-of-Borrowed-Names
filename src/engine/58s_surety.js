/* Staying behind (expansion P12; plan 10_STORY.md §8 "staying behind", playbook P12: "tuned for one traveller with no
 * replacement fighter"). For a stretch the companion is away (the surety at the Mist Barrier, a night apart) and the
 * player goes on alone: no one follows, battles are fought by one (the combat rules already know a party of one), no
 * coordinated techniques, and no one takes the companion's place. `!hook comp_away <why>` keeps who the companion is
 * (s.vars._away, and why in s.vars._away_why) and leaves the party's second place empty; `!hook comp_back` brings
 * them back. A condition head `away` (`away`, `away=nao`) reads it, so a scene can speak of the one who is waiting.
 * It is ordinary campaign state: a save made during the stretch loads into the same stretch. A story separation is
 * never caused by a Japanese mistake, and the same companion always returns (spec amendment, 10_STORY.md §6). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.hooks = RB.hooks || {};
  const refresh = () => { try { if (RB.world && RB.world.refreshActors && RB.world.W && RB.world.W.map) RB.world.refreshActors(); } catch (e) { /* a refresh never blocks the story */ } };
  RB.hooks.comp_away = (a) => {
    const s = RB.game && RB.game.s;
    if (!s || !s.comp) return;
    s.vars = s.vars || {};
    s.vars._away = s.comp;
    s.vars._away_why = (a && a[0]) || '';
    s.comp = null;
    // the one following you stays where they stand: never still following you while their waiting place appears (RBN-QA-103)
    try { if (RB.world && RB.world.companionStays && RB.world.W && RB.world.W.map) RB.world.companionStays(); } catch (e) { /* never blocks the story */ }
    refresh();
  };
  RB.hooks.comp_back = () => {
    const s = RB.game && RB.game.s;
    if (!s || !s.vars || !s.vars._away) return;
    s.comp = s.vars._away;
    delete s.vars._away;
    delete s.vars._away_why;
    // their figure here, if any, is the one who follows you again, from where it stands (RBN-QA-103)
    try { if (RB.world && RB.world.companionBack && RB.world.W && RB.world.W.map) { if (RB.world.companionBack()) RB.world.placeCompanion({ near: true }); return; } } catch (e) { /* never blocks the story */ }
    refresh();
  };
  if (RB.state && RB.state.addTerm) RB.state.addTerm('away', (s, rest, op, val, num, cmp) => (op ? cmp((s.vars && s.vars._away) || 'none', op, val) : !!(s.vars && s.vars._away)));
})();
