/* What each companion can do on their own turn in battle (src/engine/95_combat.js
 * compAct). A companion is not an inkweaver: every action is support — small,
 * in character, and never a language step. The one strong thing a companion
 * does is still the coordinated technique (Harmony).
 *
 * Each action:
 *   id, name {jp, en} (Japanese with furigana markup), desc (what it does, in
 *   plain words), aim: 'foe' (the target) | 'foes' (every creature) |
 *   'allies' (you both) | 'aimed' (the one the target's blow is aimed at) |
 *   'lower' (whichever of you has less resolve) | 'pc' (you) | 'none',
 *   uses: n per encounter (omitted: every round), unlock: a condition for
 *   RB.state.test (omitted: from the day they join you), effect: {kind, n, …}.
 *
 * Unlocks (a contract with the quest lines): the first action from
 * recruitment; one more after the second chapter (ch2_done); one with the
 * companion's own quest (quest.<id>=done); one at each of two milestones of
 * the later quest lines (lq_ally1, lq_ally2). What those two unlock keeps the
 * companion's promise in the scenes that set them (src/content/lq/30_fare.js:
 * "act on their own initiative" — they move before you ask; 40_road.js:
 * "stand with you" — they share or take what comes for you).
 *
 * Traits that stay passive (not actions): Nao reads a creature's next two
 * moves; Ren starts each encounter behind a small ward; once per encounter
 * Suzu turns aside a blow that would leave one of you at 2 or less. The old
 * per-exchange passives (Mio's draught, Nao's opening, Ren's lamp against a
 * Gathering, Suzu's laugh at a false promise) are now actions below, so
 * nothing counts twice. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.companionActions = {
    nao: [
      { id: 'nao_opening', name: T('Spot the opening', 'すき を {見|み}る'), aim: 'none', effect: { kind: 'opening' },
        desc: 'If your response answers a move right first time, your next Unravel frees two knots.' },
      { id: 'nao_warn', name: T('Call out its aim', '{声|こえ} を かける'), aim: 'foe', unlock: 'ch2_done', effect: { kind: 'soften', n: 1 },
        say: 'Nao calls out where it will strike: its blow will land 1 softer.',
        desc: 'Nao shouts a warning: the target\'s blow this round lands 1 softer.' },
      { id: 'nao_hand', name: T('Lend a hand', '{手|て} を {貸|か}す'), aim: 'foe', uses: 1, unlock: 'quest.lf_nao=done', effect: { kind: 'knot', n: 1 },
        desc: 'Once per encounter: if your response is right first time, one more of the target\'s knots comes loose.' },
      // lq_ally1 ("when I see an opening, I'll move without waiting for your signal")
      { id: 'nao_route', name: T('Seize the opening', '{隙|すき} を {突|つ}く'), aim: 'foe', uses: 1, unlock: 'lq_ally1', effect: { kind: 'stun' },
        say: 'Nao sees the opening and moves without waiting for your signal: its move will come to nothing.',
        desc: 'Once per encounter: Nao moves on the opening without waiting for your signal — the target\'s move comes to nothing.' },
      // lq_ally2 ("whatever comes for you, count it as coming for me; I'll take half")
      { id: 'nao_mark', name: T('Take half', '{半分|はんぶん} {引|ひ}き{受|う}ける'), aim: 'allies', uses: 1, unlock: 'lq_ally2', effect: { kind: 'share' },
        say: 'Nao stands at your shoulder: whatever comes for you this round, he takes half.',
        desc: 'Once per encounter: this round, every blow that lands on you is shared — Nao takes the larger half.' },
    ],
    mio: [
      { id: 'mio_draught', name: T('Warm draught', '{温|あたた}かい {薬|くすり}'), aim: 'allies', effect: { kind: 'heal', n: 1 },
        say: 'Mio presses a warm draught into your hands (+1).',
        desc: 'Restores 1 resolve to each of you who is standing.' },
      { id: 'mio_salve', name: T('Salve', '{塗|ぬ}り{薬|ぐすり}'), aim: 'lower', unlock: 'ch2_done', effect: { kind: 'heal', n: 2 },
        say: 'Mio dabs on a salve (+2).',
        desc: 'Restores 2 resolve to whichever of you has less.' },
      { id: 'mio_vapour', name: T('Clearing vapour', '{清|きよ}め の {湯気|ゆげ}'), aim: 'foe', uses: 1, unlock: 'quest.lf_mio=done', effect: { kind: 'clear', states: ['heat', 'shroud', 'charge'] },
        say: 'Mio uncorks a bottle of sharp vapour: Heat, mist and gathered force wash off it.',
        desc: 'Once per encounter: washes the target\'s Heat, mist and Gathering away.' },
      // lq_ally1 ("in a fight, I'll move before you have to ask")
      { id: 'mio_salts', name: T('Smelling salts', '{気付|きつ}け{薬|ぐすり}'), aim: 'allies', uses: 1, unlock: 'lq_ally1', effect: { kind: 'salts' },
        say: 'Mio has the smelling salts out before you can ask: whatever lands this round, neither of you will fall.',
        desc: 'Once per encounter: Mio moves before you have to ask — this round no blow can take either of you below 1.' },
      // lq_ally2 ("don't take it all alone; I'm right beside you")
      { id: 'mio_tonic', name: T('Right beside you', '{隣|となり} に いる'), aim: 'allies', uses: 1, unlock: 'lq_ally2', effect: { kind: 'heal', n: 3 },
        say: 'Mio stays right beside you with a bracing tonic: you both stand straighter (+3).',
        desc: 'Once per encounter: Mio is right beside you — a bracing tonic restores 3 resolve to each of you.' },
    ],
    ren: [
      { id: 'ren_shade', name: T('Lamp ward', '{灯|あか}り の {守|まも}り'), aim: 'aimed', effect: { kind: 'ward', n: 1 },
        say: 'Ren holds the lamp up: a small ward of light (+1).',
        desc: 'A 1-point ward in front of the one the target is aiming at (you, if it aims at no one).' },
      { id: 'ren_flare', name: T('Flare the lamp', '{灯|ひ} を {強|つよ}める'), aim: 'foe', uses: 1, unlock: 'ch2_done', effect: { kind: 'clear', states: ['shroud', 'charge'], moves: ['shroud', 'charge'] },
        say: 'Ren\'s lamp flares: the mist burns off and its gathered force scatters.',
        desc: 'Once per encounter: burns off the target\'s mist and scatters its Gathering (the one it holds, or the one it is about to make).' },
      { id: 'ren_vigil', name: T('Keep watch', '{見守|みまも}る'), aim: 'allies', uses: 1, unlock: 'quest.ren_ushio=done', effect: { kind: 'ward', n: 2 },
        say: 'Ren keeps watch over you both: a ward of 2 before each of you.',
        desc: 'Once per encounter: a 2-point ward in front of each of you.' },
      // lq_ally1 ("I'll raise the light before I'm asked — in a fight, too")
      { id: 'ren_lanterns', name: T('Raise the lamps', '{灯|あか}り を {掲|かか}げる'), aim: 'foes', uses: 1, unlock: 'lq_ally1', effect: { kind: 'clear', states: ['shroud'], moves: ['shroud', 'silence'], hush: true },
        say: 'Ren raises the lamps before you can ask: the mist burns off every creature and the hush breaks.',
        desc: 'Once per encounter: Ren raises the light before you ask — mist burns off every creature, the Hush over you breaks, and any Shroud or Hush about to fall this round is stopped.' },
      // lq_ally2 ("I'll stand in front of you")
      { id: 'ren_chime', name: T('Stand in front', '{前|まえ} に {立|た}つ'), aim: 'pc', uses: 1, unlock: 'lq_ally2', effect: { kind: 'ward', n: 3 },
        say: 'Ren steps in front of you, lamp raised: a ward of 3 before you.',
        desc: 'Once per encounter: Ren stands in front of you — a 3-point ward before you.' },
    ],
    suzu: [
      { id: 'suzu_heckle', name: T('Heckle', '{野次|やじ} を {飛|と}ばす'), aim: 'foe', effect: { kind: 'heckle', n: 1 },
        desc: 'The target\'s blow this round lands 1 softer; its False promise falls flat if your response is right.' },
      { id: 'suzu_eye', name: T('Draw its eye', '{目|め} を {引|ひ}く'), aim: 'foe', unlock: 'ch2_done', effect: { kind: 'draw' },
        desc: 'The target\'s blow at one of you comes at Suzu instead.' },
      { id: 'suzu_encore', name: T('Encore', 'アンコール'), aim: 'none', uses: 1, unlock: 'quest.co_suzu=done', effect: { kind: 'harmony', n: 1 },
        say: 'Suzu calls for an encore: Harmony rises by one more.',
        desc: 'Once per encounter: if your response is right first time, Harmony rises by one more.' },
      // lq_ally1 ("when it's time to step out, I'll step out on my own — no signal needed")
      { id: 'suzu_feint', name: T('On her own cue', '{自分|じぶん} の {出番|でばん}'), aim: 'foe', uses: 1, unlock: 'lq_ally1', effect: { kind: 'stun' },
        say: 'Suzu steps out on her own cue — a feint: it lunges at nothing, and its move comes to nothing.',
        desc: 'Once per encounter: Suzu steps out on her own cue, no signal needed — a feint, and the target\'s move comes to nothing.' },
      // lq_ally2 ("if something takes aim at you, I'll draw the audience's eye")
      { id: 'suzu_finale', name: T('Grand gesture', '{大見得|おおみえ}'), aim: 'foes', uses: 1, unlock: 'lq_ally2', effect: { kind: 'drawAll' },
        say: 'Suzu strikes a grand pose and draws every eye: whatever takes aim at you this round aims at her instead.',
        desc: 'Once per encounter: every creature that takes aim at you this round aims at Suzu instead (Draw its eye, for all of them).' },
    ],
  };
})(RB.content);
