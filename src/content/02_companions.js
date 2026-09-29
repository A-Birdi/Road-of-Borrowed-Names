/* What each companion can do on their own turn in battle (src/engine/95_combat.js
 * compAct). A companion is not an inkweaver: every action is support — small,
 * in character, and never a language step. The one strong thing a companion
 * does is still the coordinated technique (Harmony).
 *
 * Each action:
 *   id, name {jp, en} (Japanese with furigana markup), desc (what it does, in
 *   plain words), aim: 'foe' (the target) | 'foes' (every creature) |
 *   'allies' (you both) | 'aimed' (the one the target's blow is aimed at) |
 *   'lower' (whichever of you has less resolve) | 'none',
 *   uses: n per encounter (omitted: every round), unlock: a condition for
 *   RB.state.test (omitted: from the day they join you), effect: {kind, n, …}.
 *
 * Unlocks (a contract with the quest lines): the first action from
 * recruitment; one more after the second chapter (ch2_done); one with the
 * companion's own quest (quest.<id>=done); one at each of two milestones of
 * the later quest lines (lq_ally1, lq_ally2).
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
      { id: 'nao_route', name: T('Find the way round', '{回|まわ}り{道|みち}'), aim: 'foe', uses: 1, unlock: 'lq_ally1', effect: { kind: 'stun' },
        say: 'Nao finds the way round it: its move will come to nothing.',
        desc: 'Once per encounter: Nao gets in its way — the target\'s move comes to nothing.' },
      { id: 'nao_mark', name: T('Mark the thread', '{印|しるし} を つける'), aim: 'none', uses: 1, unlock: 'lq_ally2', effect: { kind: 'mark' },
        desc: 'Once per encounter: your next Unravel frees two knots, whatever you answered.' },
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
      { id: 'mio_salts', name: T('Smelling salts', '{気付|きつ}け{薬|ぐすり}'), aim: 'allies', uses: 1, unlock: 'lq_ally1', effect: { kind: 'salts' },
        say: 'Mio hands you both smelling salts: whatever lands this round, neither of you will fall.',
        desc: 'Once per encounter: this round no blow can take either of you below 1.' },
      { id: 'mio_tonic', name: T('Bracing tonic', '{元気|げんき} の {出|で}る {薬|くすり}'), aim: 'allies', uses: 1, unlock: 'lq_ally2', effect: { kind: 'heal', n: 3 },
        say: 'Mio\'s bracing tonic: you both stand straighter (+3).',
        desc: 'Once per encounter: restores 3 resolve to each of you.' },
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
      { id: 'ren_chime', name: T('Lamp chime', 'ランプ の {鈴|すず}'), aim: 'allies', uses: 1, unlock: 'lq_ally1', effect: { kind: 'hush' },
        say: 'Ren rings the little chime on the lamp: the hush breaks.',
        desc: 'Once per encounter: breaks the Hush over you, and stops any Hush about to fall this round.' },
      { id: 'ren_lanterns', name: T('Lanterns all round', '{灯籠|とうろう} を {並|なら}べる'), aim: 'foes', uses: 1, unlock: 'lq_ally2', effect: { kind: 'clear', states: ['shroud'], moves: ['shroud'] },
        say: 'Ren sets lanterns all round: there is nowhere left for mist.',
        desc: 'Once per encounter: burns off the mist around every creature, and stops any Shroud about to fall this round.' },
    ],
    suzu: [
      { id: 'suzu_heckle', name: T('Heckle', '{野次|やじ} を {飛|と}ばす'), aim: 'foe', effect: { kind: 'heckle', n: 1 },
        desc: 'The target\'s blow this round lands 1 softer; its False promise falls flat if your response is right.' },
      { id: 'suzu_eye', name: T('Draw its eye', '{目|め} を {引|ひ}く'), aim: 'foe', unlock: 'ch2_done', effect: { kind: 'draw' },
        desc: 'The target\'s blow at one of you comes at Suzu instead.' },
      { id: 'suzu_encore', name: T('Encore', 'アンコール'), aim: 'none', uses: 1, unlock: 'quest.co_suzu=done', effect: { kind: 'harmony', n: 1 },
        say: 'Suzu calls for an encore: Harmony rises by one more.',
        desc: 'Once per encounter: if your response is right first time, Harmony rises by one more.' },
      { id: 'suzu_feint', name: T('Feint', 'フェイント'), aim: 'foe', uses: 1, unlock: 'lq_ally1', effect: { kind: 'stun' },
        say: 'Suzu feints: it lunges at nothing, and its move comes to nothing.',
        desc: 'Once per encounter: the target\'s move comes to nothing.' },
      { id: 'suzu_finale', name: T('Grand gesture', '{大見得|おおみえ}'), aim: 'foes', uses: 1, unlock: 'lq_ally2', effect: { kind: 'soften', n: 1 },
        say: 'Suzu strikes a grand pose: every creature\'s blow will land 1 softer.',
        desc: 'Once per encounter: every creature\'s blow this round lands 1 softer.' },
    ],
  };
})(RB.content);
