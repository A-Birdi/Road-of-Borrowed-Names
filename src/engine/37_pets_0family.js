/* Response families (docs/ADDENDUM_CONTRACTS.md §6): every existing player
 * response, coordinated technique and companion action, mapped explicitly to
 * one stable family id. Presentation (the pet's reactions, a companion's field
 * reaction) reads the family; it never reads localised text, so a translated
 * name cannot change an animation. tests/unit/pets.test.mjs fails on any id
 * that is not listed here.
 *
 * Families: unravel protect light heal water wind bind stone ice fire bell
 * interpret technique support ('support': a companion action that fits none).
 *
 *   RB.families.LIST
 *   RB.families.ofCard(card)          a response card from RB.combatLogic.responses
 *   RB.families.ofResponse(id)        'unravel' | 'answer' | 'truth' | 'w:<word id>' | 'tech:<companion>'
 *   RB.families.ofAction(id)          a companion action id (C.companionActions), or 'join'
 *   RB.families.ofPassive(who)        a companion's own move inside an exchange (fx 'comp')
 *   RB.families.base(family, id)      a technique's underlying family (its culmination) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.families = (function () {
  'use strict';
  const LIST = ['unravel', 'protect', 'light', 'heal', 'water', 'wind', 'bind', 'stone', 'ice', 'fire', 'bell', 'interpret', 'technique', 'support'];
  // Player responses. The words by what the word physically does (a word's tags say the same):
  // 氷 is chill applied to a target (ice), not water; 土 and 石 both stand firm (stone); 鈴 and 声 are sound.
  const RESPONSE = {
    unravel: 'unravel',
    answer: 'interpret',   // こたえる: answering what it is really asking
    truth: 'interpret',    // みぬく: seeing through a falsehood
    'w:mamoru': 'protect',
    'w:mizu': 'water',
    'w:hikari': 'light',
    'w:iyasu': 'heal',
    'w:kaze': 'wind',
    'w:nawa': 'bind',
    'w:ishi': 'stone',
    'w:koori': 'ice',
    'w:tsuchi': 'stone',
    'w:honoo': 'fire',
    'w:suzu': 'bell',
    'w:koe': 'bell',
    'tech:nao': 'technique',
    'tech:mio': 'technique',
    'tech:ren': 'technique',
    'tech:suzu': 'technique',
  };
  // A technique's culmination is its underlying action, as the two of you perform it (the gestures in
  // src/ui/82_battle_seq.js: Nao directs, Mio restores, Ren wards, Suzu flows).
  const TECH_BASE = { nao: 'unravel', mio: 'heal', ren: 'protect', suzu: 'wind' };
  // Companion actions (src/content/02_companions.js), each by what it looks like when it happens.
  const ACTION = {
    nao_opening: 'interpret', // spots the opening
    nao_warn: 'bell',         // calls out its aim (a voice)
    nao_hand: 'unravel',      // one more knot
    nao_route: 'support',     // moves on the opening: its move comes to nothing
    nao_mark: 'protect',      // takes half of what comes for you
    mio_draught: 'heal',
    mio_salve: 'heal',
    mio_vapour: 'water',      // a cooling vapour washes Heat, mist and Gathering away
    mio_salts: 'heal',
    mio_tonic: 'heal',
    ren_shade: 'protect',     // a small ward of lamplight
    ren_flare: 'light',
    ren_vigil: 'protect',
    ren_lanterns: 'light',
    ren_chime: 'protect',     // stands in front of you
    suzu_heckle: 'bell',      // a heckle: a voice
    suzu_eye: 'support',      // draws its eye
    suzu_encore: 'bell',      // calls for an encore
    suzu_feint: 'support',
    suzu_finale: 'support',
    join: 'technique',        // joins the queued technique
  };
  // A companion's own move inside an exchange (the rules' fx 'comp'): Nao's second thread, Ren's
  // lamp in the Atlas, Suzu turning a blow aside, Mio's vial.
  const PASSIVE = { nao: 'unravel', ren: 'light', suzu: 'support', mio: 'heal' };

  function ofResponse(id) { return RESPONSE[id] || null; }
  function ofCard(card) {
    if (!card) return null;
    if (card.kind === 'tech') return RESPONSE['tech:' + card.tech] || null;
    if (card.kind === 'word') return RESPONSE['w:' + (card.word && card.word.id)] || null;
    return RESPONSE[card.kind] || RESPONSE[card.id] || null;
  }
  function ofAction(id) { return ACTION[id] || null; }
  function ofPassive(who) { return PASSIVE[who] || null; }
  function base(family, id) { return family === 'technique' ? TECH_BASE[id] || 'unravel' : family; }
  return { LIST, RESPONSE, ACTION, PASSIVE, TECH_BASE, ofResponse, ofCard, ofAction, ofPassive, base };
})();
