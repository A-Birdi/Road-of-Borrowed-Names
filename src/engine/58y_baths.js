/* The baths (expansion P13; plan 07_REGIONS.md R3 "The baths follow pronouns"; Robin's C-27, C-56; 08_CULTURE.md C13).
 *
 * At a hot spring the baths follow the player's pronouns, never a gender: she/her uses the women's bath, he/him the
 * men's. They/them and custom pronouns choose once (the men's, the women's or the inn's reserved bath, 貸切風呂, a real
 * custom), and the game keeps that choice for every bath after (s.vars.bath_side: 1 men's, 2 women's, 3 reserved).
 * Companions choose in character, always the same (the scenes say so; nobody is assigned).
 *
 * Two condition heads:
 *   pron=she | he | they | custom   the player's pronouns as set at the start (an object is custom)
 *   bathview=summarised | shown      the device's comfort setting for bathing scenes (Settings › Learning & Challenge, beside Grave outcomes: shown, or told
 *                                    in a sentence). Presentation only: what happens, and what follows, is the same.
 * And one hook: `!hook bath_soak <n>`, a long soak that restores a little resolve to both of you (a hot pool in the
 * Steam Vents restores some and then runs cool: the map's own state says which pool is spent). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.hooks = RB.hooks || {};
  const pronOf = (s) => {
    const p = s && s.player && s.player.pronouns;
    if (p && typeof p === 'object') return 'custom';
    return p === 'she' || p === 'he' ? p : 'they';
  };
  const view = () => ((RB.game && RB.game.settings && RB.game.settings.bathScenes) === 'summarised' ? 'summarised' : 'shown');
  if (RB.state && RB.state.addTerm) {
    RB.state.addTerm('pron', (s, rest, op, val, num, cmp) => cmp(pronOf(s), op || '=', val));
    RB.state.addTerm('bathview', (s, rest, op, val, num, cmp) => cmp(view(), op || '=', val || 'summarised'));
  }
  RB.hooks.bath_soak = (a) => {
    const s = RB.game && RB.game.s;
    if (!s || !s.resolve) return;
    const n = Math.max(1, +(a && a[0]) || 3);
    s.resolve.pc = Math.min(s.resolve.max, s.resolve.pc + n);
    s.resolve.comp = Math.min(s.resolve.max, s.resolve.comp + n);
  };
  RB.baths = { pronOf, view };
})();
