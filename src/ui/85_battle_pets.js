/* The cosmetic pet in battle: it watches, and never acts (addendum §2, §4.2–4.4).
 *
 * It listens to the semantic presentation events the battle emits once the
 * rules have committed a result (src/ui/80_combat.js: present:action,
 * present:enemy, present:scene; docs/ADDENDUM_CONTRACTS.md §6) and plays a
 * reaction inside the same rhythm, on the presentation clock (so a hurried
 * sequence hurries it too). It adds no turn delay: nothing waits for it, and
 * no sequence is lengthened. It is never a target, never struck, carries no
 * number, bar, ward or status mark, casts nothing, and is drawn only on the
 * battle canvas at its own place between the two of you (RB.battleStage
 * layout `pet`), clear of the response area, the writing pad and the Next
 * button (no DOM layer, so it can intercept nothing).
 *
 * - Calm (while you read, choose or write): quiet — sitting, breathing, and
 *   now and then one of three or four small movements, on its own irregular
 *   timing (its own random stream; never the game's).
 * - Ready (while an exchange plays): alert, facing the creature.
 * - A response or a companion's action: the reaction for its family (13
 *   families × 4 species; see REACT), opening with an attention shift to
 *   whoever acts. One dominant reaction per exchange; a second action in the
 *   same exchange gets a short acknowledgement of its family instead of a
 *   second flourish. A technique is one combined culmination, not three.
 * - A creature's move nearby: the species' safe nearby-impact reaction (never
 *   an injury cue, whether the blow landed or a ward took it).
 * - The final knot: the settled-victory gesture with your cheer; defeat: it
 *   keeps low and close (not hurt). Arrival: it trots in beside you; exit: gone.
 * - Reduced motion: every reaction is its key pose held (no hops, no travel).
 *
 *   RB.battlePets.wants() (the stage reserves its place), draw(c, lay, fr), stats(),
 *   RB.battlePets.sample(species, look, family, t, o) -> pose (the coverage gallery, tests),
 *   RB.battlePets.REACT, dev (playback controls; tests and ?dev=pets only). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.battlePets = (function () {
  'use strict';
  let seed = 0x51f15e;
  const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const sm = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));

  // ---- base stances --------------------------------------------------------------------------------------
  const BASE = {
    cat: { calm: { sit: 1 }, ready: { sit: 1, earF: 0.5, hp: -4 }, defeat: { sit: 1, crouch: 0.5, earF: -0.6, hy: 40 }, victory: { sit: 1, tall: 1, tUp: 38, blink: 0.5, earF: 0.4 } },
    dog: { calm: { sit: 1 }, ready: { sit: 0, lean: 0.35, earF: 0.7, hp: -4 }, defeat: { lie: 1, earF: -0.7, hy: 45 }, victory: { sit: 1, earF: 0.5, hp: -8 } },
    bird: { calm: {}, ready: { earF: 0, hp: -6, lean: 0.2 }, defeat: { crouch: 0.6, fluff: 0.8, hy: 50 }, victory: { hp: -10 } },
    tanuki: { calm: { sit: 1 }, ready: { sit: 1, rise: 0.15, paws: 0.5, earF: 0.3, hp: -4 }, defeat: { sit: 1, crouch: 0.5, paws: 1, earF: -0.6, hy: 40 }, victory: { sit: 1, paws: 1, blink: 0.5 } },
  };
  // Where it looks: at you (on its right), at your companion (over its left shoulder), at the creature.
  const LOOK = { pc: 52, comp: -70, foe: 6 };

  // ---- reactions: keyframes [ms, pose] per species and family (a pose merges over the stance) ----------------------
  // `key` is the moment held with reduced motion; `lift(t)` a small hop (px, drawn offset).
  const K = (ms, keys, key, lift) => ({ ms, keys, key: key == null ? 2 : key, lift });
  const hop = (at, h, d) => (t) => (t > at && t < at + d ? Math.round(Math.sin(((t - at) / d) * Math.PI) * h) : 0);
  const REACT = {
    cat: {
      unravel: K(950, [[0, {}], [240, { hy: 14, hp: -10, earF: 0.7 }], [460, { hy: 10, hp: -14, pawR: 0.6, earF: 0.7 }], [700, { hy: 8, hp: -8, pawR: 0.1 }], [950, {}]]),
      protect: K(900, [[0, {}], [220, { tall: 0.9, spread: 0.6, earF: 0.4 }], [650, { tall: 1, spread: 0.6, earF: 0.4 }], [900, {}]]),
      light: K(1000, [[0, {}], [240, { hy: 10, hp: -16 }], [460, { hy: 10, hp: -16, blink: 1 }], [720, { hy: 10, hp: -14, blink: 0 }], [1000, {}]]),
      heal: K(1000, [[0, { crouch: 0.25, earF: -0.4 }], [320, { tall: 0.8, hp: -12 }], [620, { tall: 0.5, blink: 1 }], [1000, {}]]),
      water: K(900, [[0, {}], [200, { pawL: 0.55, lean: -0.3, earL: 0.6 }], [520, { pawL: 0.5, lean: -0.3, earL: 0.4, hy: -8 }], [900, {}]]),
      wind: K(900, [[0, {}], [200, { wind: 1, tSide: -34, earF: -0.4, crouch: 0.25 }], [520, { wind: 0.5, tSide: -18, crouch: 0.15, pawR: 0.2 }], [900, {}]]),
      bind: K(950, [[0, {}], [260, { hy: 12, hp: -8, tSide: 36, tUp: 20 }], [620, { hy: 10, hp: -6, earF: 0.7, tSide: 36, tUp: 20 }], [950, {}]]),
      stone: K(1000, [[0, {}], [320, { crouch: 0.7, spread: 0.5, earF: 0.2 }], [700, { crouch: 0.55, spread: 0.5 }], [1000, {}]]),
      ice: K(850, [[0, {}], [200, { hy: 10, hp: -10 }], [380, { hy: 10, hp: -10, earR: 1 }], [520, { hy: 10, hp: -10 }], [850, {}]]),
      fire: K(1000, [[0, {}], [260, { hy: 40, hp: -2, blink: 0.4 }], [720, { hy: 40, blink: 0.45, tall: 0.3 }], [1000, {}]]),
      bell: K(850, [[0, {}], [140, { earR: 0.9 }], [320, { earL: 0.9, earR: 0 }], [500, { earR: 0.7, earL: 0 }], [850, {}]], 2),
      interpret: K(1050, [[0, { hy: 10, hp: -8, earF: 0.9 }], [520, { hy: 10, hp: -8, earF: 0.9 }], [640, { hy: 10, blink: 1 }], [780, { hy: 10 }], [1050, {}]], 0),
      support: K(700, [[0, {}], [200, { hy: LOOK.comp, earL: 0.6 }], [450, { hy: LOOK.comp }], [700, {}]], 1),
      // the technique's culmination: sits tall, tail straight up, a slow blink
      technique: K(1100, [[0, {}], [240, { tall: 1, tUp: 44, earF: 0.6 }], [600, { tall: 1, tUp: 44, blink: 1 }], [820, { tall: 0.8, tUp: 30 }], [1100, {}]]),
    },
    dog: {
      unravel: K(950, [[0, {}], [260, { hy: 12, hp: -12, earF: 1 }], [560, { hy: 4, hp: -6, earF: 1 }], [950, {}]]),
      protect: K(950, [[0, {}], [220, { crouch: 0.35, lean: -0.4, spread: 0.6, earF: 0.3 }], [650, { crouch: 0.3, lean: -0.35, spread: 0.6 }], [950, {}]]),
      light: K(950, [[0, {}], [260, { hp: -22, earF: 0.9 }], [650, { hp: -20, earF: 0.9 }], [950, {}]]),
      heal: K(1000, [[0, { earF: 0.3 }], [300, { crouch: 0.2, earF: -0.4, wag: 0.4, blink: 0.5 }], [560, { crouch: 0.2, earF: -0.4, wag: -0.4, blink: 0.5 }], [800, { wag: 0.2 }], [1000, {}]]),
      water: K(950, [[0, {}], [260, { hr: 24, hy: 10, earF: 0.5 }], [700, { hr: 22, hy: 10 }], [950, {}]]),
      wind: K(900, [[0, {}], [200, { wind: 1, crouch: 0.3, spread: 0.5, earF: -0.4 }], [560, { wind: 0.6, crouch: 0.25, spread: 0.5 }], [900, {}]]),
      bind: K(950, [[0, {}], [240, { lean: -0.6, hy: 18, earF: 0.4 }], [640, { lean: -0.5, hy: 14 }], [950, {}]]),
      stone: K(950, [[0, {}], [280, { spread: 1, crouch: 0.3, earF: 0.3 }], [680, { spread: 1, crouch: 0.25 }], [950, {}]]),
      ice: K(850, [[0, {}], [200, { hp: -6, nose: 1 }], [360, { hp: -6, nose: 0, earR: 0.9 }], [520, { hp: -4 }], [850, {}]]),
      fire: K(950, [[0, {}], [260, { hy: 46, earF: 0.3 }], [700, { hy: 44, earF: 0.3, wag: 0.3 }], [950, {}]]),
      bell: K(800, [[0, {}], [240, { hr: 26, earF: 0.7 }], [560, { hr: 24, earF: 0.7 }], [800, {}]]),
      interpret: K(1050, [[0, { hy: LOOK.pc }], [340, { hy: LOOK.pc, earF: 0.6 }], [560, { hy: 4, earF: 0.8 }], [860, { hy: 4 }], [1050, {}]], 2),
      support: K(700, [[0, {}], [220, { hy: LOOK.comp, earF: 0.5, wag: 0.3 }], [460, { hy: LOOK.comp, wag: -0.3 }], [700, {}]], 1),
      // a brief forward-ready gesture, then recovery
      technique: K(1000, [[0, {}], [240, { lean: 0.7, crouch: 0.25, earF: 1, wag: 0.5 }], [560, { lean: 0.8, crouch: 0.2, earF: 1, wag: -0.5 }], [1000, {}]]),
    },
    bird: {
      unravel: K(900, [[0, {}], [240, { hy: 10, hp: -16 }], [460, { hy: 6, hp: -8 }], [900, {}]], 1, hop(420, 3, 200)),
      protect: K(900, [[0, {}], [220, { tuck: 1, hy: 30, lean: -0.3 }], [650, { tuck: 1, hy: 28, lean: -0.3 }], [900, {}]]),
      light: K(950, [[0, {}], [260, { hy: 16, hr: -18, hp: -10 }], [660, { hy: 16, hr: -16, hp: -10 }], [950, {}]]),
      heal: K(1000, [[0, { fluff: 1 }], [300, { fluff: 0.6 }], [560, { fluff: 0, blink: 1 }], [760, {}], [1000, {}]], 1),
      water: K(850, [[0, {}], [160, { fluff: 1, wing: 0.25 }], [300, { fluff: 0, wing: 0 }], [440, { fluff: 1, wing: 0.25 }], [600, {}], [850, {}]], 1),
      wind: K(900, [[0, {}], [200, { wing: 0.5, flap: 0.3, lean: -0.3 }], [420, { wing: 0.35, flap: 0.1, lean: -0.2 }], [620, {}], [900, {}]], 1),
      bind: K(950, [[0, {}], [260, { hr: 26, hy: 14 }], [680, { hr: 24, hy: 12 }], [950, {}]]),
      stone: K(950, [[0, {}], [300, { crouch: 0.7 }], [650, { crouch: 0.6 }], [950, {}]]),
      ice: K(850, [[0, {}], [220, { fluff: 0.9, hy: 8 }], [600, { fluff: 0.8 }], [850, {}]]),
      fire: K(1000, [[0, {}], [280, { wing: 0.6, flap: 0.3, hy: 30 }], [560, { wing: 0.2, hy: 30 }], [760, { hy: 30 }], [1000, {}]], 1),
      bell: K(900, [[0, {}], [160, { beak: 1, hp: -12 }], [300, { beak: 0, hp: -8 }], [440, { beak: 1, hp: -12 }], [600, {}], [900, {}]], 1, hop(560, 2, 180)),
      interpret: K(1100, [[0, {}], [240, { hr: 26 }], [460, { hr: 0 }], [680, { hr: -26 }], [900, { hr: 0 }], [1100, {}]], 1),
      support: K(700, [[0, {}], [220, { hy: LOOK.comp, hr: 14 }], [460, { hy: LOOK.comp }], [700, {}]], 1),
      // one contained wing flourish
      technique: K(1000, [[0, {}], [200, { wing: 1, flap: 0.25, hp: -10 }], [420, { wing: 1, flap: 0.75, hp: -10 }], [640, { wing: 0.4, flap: 0.3 }], [1000, {}]], 1, hop(160, 3, 420)),
    },
    tanuki: {
      unravel: K(1000, [[0, {}], [260, { rise: 0.35, pawsUp: 0.7, hy: 10 }], [560, { rise: 0.3, pawsUp: 0.6, hy: 8 }], [800, { paws: 0.4 }], [1000, {}]]),
      protect: K(950, [[0, {}], [240, { rise: 0.45, paws: 0.9, earF: 0.4, hy: 10 }], [680, { rise: 0.45, paws: 0.9, earF: 0.4, hy: 10 }], [950, {}]]),
      light: K(1050, [[0, {}], [240, { shade: 1, hp: -10, hy: 8 }], [560, { shade: 1, hp: -10, hy: 8 }], [780, { lean: 0.5, hy: 8 }], [1050, {}]]),
      heal: K(1000, [[0, { crouch: 0.3 }], [300, { breath: 1, tall: 0.3 }], [580, { breath: 0, crouch: 0.15, blink: 1, paws: 0.6 }], [1000, {}]]),
      water: K(950, [[0, {}], [220, { paws: 1, crouch: 0.2 }], [520, { paws: 1, hp: -12, hy: 8 }], [950, {}]]),
      wind: K(950, [[0, {}], [220, { lean: 0.8, wind: 1, earF: -0.4 }], [520, { lean: 0.5, wind: 0.6 }], [720, { lean: -0.15 }], [950, {}]]),
      bind: K(1000, [[0, {}], [220, { pawsUp: 0.4, rise: 0.2 }], [480, { paws: 1, rise: 0.25 }], [720, { paws: 0.7 }], [1000, {}]]),
      stone: K(1000, [[0, {}], [320, { crouch: 0.6, spread: 0.7, earF: -0.4, blink: 1, hp: 8 }], [720, { crouch: 0.55, spread: 0.7, earF: -0.4, blink: 1, hp: 8 }], [1000, {}]]),
      ice: K(900, [[0, {}], [240, { lean: 0.6, hy: 10 }], [480, { lean: -0.3 }], [900, {}]]),
      fire: K(1000, [[0, {}], [260, { pawsUp: 0.55, hy: 34 }], [640, { pawsUp: 0.5, hy: 34 }], [1000, {}]]),
      bell: K(900, [[0, {}], [220, { hr: 16 }], [450, { hr: -14 }], [660, { hr: 0 }], [900, {}]], 1),
      interpret: K(1150, [[0, {}], [260, { scratch: 1, scratchPh: 0, hy: 8 }], [420, { scratch: 1, scratchPh: 0.5, hy: 8 }], [580, { scratch: 1, scratchPh: 1, hy: 8 }], [800, { earF: 0.7, hy: 6 }], [1150, {}]], 1),
      support: K(750, [[0, {}], [220, { hy: LOOK.comp, paws: 0.5 }], [480, { hy: LOOK.comp, paws: 0.5 }], [750, {}]], 1),
      // a confident imitation, then a composed finish (paws folded)
      technique: K(1150, [[0, {}], [240, { rise: 0.7, pawsUp: 0.9 }], [560, { rise: 0.7, pawsUp: 0.9, blink: 1 }], [820, { paws: 1, rise: 0.1 }], [1150, { paws: 0.6 }]]),
    },
  };
  // A creature's move near you: the species' safe response (no injury cue for a blow or a ward).
  const IMPACT = {
    cat: { hit: K(800, [[0, {}], [120, { crouch: 0.6, earF: -0.5 }], [420, { crouch: 0.3, earF: -0.2, hy: 30 }], [800, {}]], 1), soft: K(650, [[0, {}], [140, { crouch: 0.3, earF: -0.3 }], [650, {}]], 1), status: K(700, [[0, {}], [200, { earF: -0.5, hp: -6 }], [700, {}]], 1) },
    dog: { hit: K(900, [[0, {}], [120, { crouch: 0.4, lean: -0.3, spread: 0.6 }], [420, { hy: 40, crouch: 0.2 }], [900, {}]], 1), soft: K(700, [[0, {}], [140, { lean: -0.2, spread: 0.4 }], [700, {}]], 1), status: K(700, [[0, {}], [220, { hp: -8, earF: 0.9 }], [700, {}]], 1) },
    bird: { hit: K(700, [[0, {}], [100, { wing: 0.45, flap: 0.3, fluff: 0.5 }], [260, { wing: 0.3, flap: 0.8 }], [440, { fluff: 0.3 }], [700, {}]], 3, hop(80, 2, 260)), soft: K(600, [[0, {}], [140, { fluff: 0.6, tuck: 0.5 }], [600, {}]], 1), status: K(650, [[0, {}], [200, { hr: 18, hp: -8 }], [650, {}]], 1) },
    tanuki: { hit: K(850, [[0, {}], [120, { lean: -0.6, crouch: 0.35 }], [440, { lean: -0.2, crouch: 0.2, paws: 0.6 }], [850, {}]], 1), soft: K(700, [[0, {}], [160, { lean: -0.3, spread: 0.4 }], [700, {}]], 1), status: K(700, [[0, {}], [220, { hp: -8, nose: 1 }], [700, {}]], 1) },
  };
  // Around a creature's move (battle addendum §11): while it prepares, a glance at it and a small brace
  // (ears back, weight down, feathers sleeked) that holds until contact; after the move, a settle (the cat
  // re-curls its tail, the dog shakes out its ruff, the bird fluffs and smooths, the tanuki folds its paws).
  // Neither is an injury cue, and neither is ever a target, a number or a mark.
  const PREP = {
    cat: K(520, [[0, {}], [180, { hy: LOOK.foe, earF: -0.45, crouch: 0.2, tSide: 14 }], [520, { hy: LOOK.foe, earF: -0.5, crouch: 0.25, tSide: 18 }]], 2),
    dog: K(520, [[0, {}], [180, { hy: LOOK.foe, earF: 0.9, lean: -0.25, spread: 0.4 }], [520, { hy: LOOK.foe, earF: 0.9, lean: -0.3, spread: 0.5, crouch: 0.15 }]], 2),
    bird: K(480, [[0, {}], [160, { hr: 12, fluff: -0.2, tuck: 0.3 }], [480, { hr: 12, tuck: 0.45, crouch: 0.3 }]], 2),
    tanuki: K(560, [[0, {}], [200, { hy: LOOK.foe, earF: -0.4, paws: 0.8, crouch: 0.15 }], [560, { hy: LOOK.foe, earF: -0.45, paws: 1, crouch: 0.2 }]], 2),
  };
  const SETTLE = {
    cat: K(620, [[0, {}], [180, { tCurl: 20, tFlick: 24, earR: 0.4 }], [400, { tFlick: -10 }], [620, {}]], 1),
    dog: K(640, [[0, {}], [120, { hr: 12, earF: -0.3 }], [240, { hr: -12, earF: -0.3 }], [360, { hr: 8 }], [480, { hr: -4 }], [640, {}]], 2),
    bird: K(600, [[0, {}], [180, { fluff: 0.9 }], [340, { fluff: 0.2, wing: 0.18 }], [600, {}]], 1),
    tanuki: K(640, [[0, {}], [220, { paws: 1, breath: 1 }], [460, { paws: 0.8, breath: 0, blink: 1 }], [640, {}]], 1),
  };
  // the flinch itself is quick (0.7 of its first timing); the settle carries the recovery
  const quick = (R, f) => K(Math.round(R.ms * f), R.keys.map(([ms, po]) => [Math.round(ms * f), po]), R.key, R.lift ? ((g) => (tt) => g(tt / f))(R.lift) : undefined);
  for (const sp in IMPACT) {
    for (const k of ['hit', 'soft', 'status']) IMPACT[sp][k] = quick(IMPACT[sp][k], 0.7);
    IMPACT[sp].prep = PREP[sp]; IMPACT[sp].settle = SETTLE[sp];
  }
  // The settled-victory gesture (with your cheer).
  const VICTORY = {
    cat: K(1300, [[0, {}], [300, { tall: 1, tUp: 40, earF: 0.4 }], [700, { tall: 1, tUp: 40, blink: 1 }], [1000, { tall: 1, tUp: 36 }], [1300, { tall: 1, tUp: 38, blink: 0.5 }]], 2),
    dog: K(1300, [[0, {}], [200, { sit: 0, wag: 0.8, earF: 0.6 }], [400, { sit: 0, wag: -0.8, earF: 0.6 }], [600, { sit: 0, wag: 0.8, earF: 0.6 }], [800, { sit: 0.6, wag: -0.5 }], [1300, { sit: 1, earF: 0.5, hp: -8 }]], 1),
    bird: K(1200, [[0, {}], [200, { wing: 1, flap: 0.25, hp: -12 }], [420, { wing: 1, flap: 0.75 }], [640, { wing: 0.3 }], [1200, { hp: -10 }]], 1, hop(150, 4, 480)),
    tanuki: K(1300, [[0, {}], [260, { rise: 0.6, pawsUp: 0.9 }], [560, { rise: 0.6, pawsUp: 0.9 }], [880, { paws: 1, rise: 0 }], [1300, { paws: 1, blink: 0.5 }]], 1),
  };
  // calm idles: three or four small movements per species, on its own irregular clock
  const CALM = {
    cat: [K(700, [[0, {}], [160, { earR: 0.9 }], [520, { earR: 0.9 }], [700, {}]], 1), K(1400, [[0, {}], [300, { hy: LOOK.pc }], [600, { hy: LOOK.pc, blink: 1 }], [800, { hy: LOOK.pc }], [1400, {}]], 2), K(700, [[0, {}], [200, { tFlick: 30 }], [420, { tFlick: -12 }], [700, {}]], 1), K(900, [[0, {}], [250, { pawL: 0.2 }], [650, { pawL: 0.2 }], [900, {}]], 1)],
    dog: [K(1600, [[0, {}], [600, { breath: 1 }], [1200, { breath: 0 }], [1600, {}]], 1), K(700, [[0, {}], [200, { earL: 0.6 }], [500, { earL: 0.6 }], [700, {}]], 1), K(1000, [[0, {}], [250, { wag: 0.25 }], [500, { wag: -0.25 }], [750, { wag: 0.2 }], [1000, {}]], 1), K(1300, [[0, {}], [300, { hy: LOOK.comp }], [1000, { hy: LOOK.comp }], [1300, {}]], 1)],
    bird: [K(900, [[0, {}], [220, { hr: 24 }], [700, { hr: 24 }], [900, {}]], 1), K(300, [[0, {}], [100, { blink: 1 }], [200, { blink: 1 }], [300, {}]], 1), K(1200, [[0, {}], [300, { fluff: 0.8 }], [500, { fluff: 0.2, preen: 0.7 }], [900, { preen: 0.7 }], [1200, {}]], 2)],
    tanuki: [K(300, [[0, {}], [100, { blink: 1 }], [200, { blink: 1 }], [300, {}]], 1), K(800, [[0, {}], [150, { nose: 1 }], [300, { nose: 0 }], [450, { nose: 1 }], [600, {}], [800, {}]], 1), K(1300, [[0, {}], [350, { lean: 0.35 }], [800, { lean: -0.2 }], [1300, {}]], 1)],
  };
  // ready: the alert stance, with a small movement now and then (the cat settles a forepaw; the bird hops)
  const READY = {
    cat: K(700, [[0, {}], [200, { pawR: 0.25 }], [450, { pawR: 0 }], [700, {}]], 1),
    dog: K(800, [[0, {}], [300, { lean: 0.55 }], [800, {}]], 1),
    bird: K(600, [[0, {}], [300, {}], [600, {}]], 1, hop(100, 3, 300)),
    tanuki: K(900, [[0, {}], [300, { paws: 1, rise: 0.3 }], [600, { paws: 0.4 }], [900, {}]], 1),
  };

  // ---- sampling a timeline ------------------------------------------------------------------------------------
  function sampleK(R, t) {
    const ks = R.keys;
    if (t <= ks[0][0]) return Object.assign({}, ks[0][1]);
    for (let i = 1; i < ks.length; i++) {
      if (t <= ks[i][0]) {
        const a = ks[i - 1], b = ks[i], k = sm((t - a[0]) / Math.max(1, b[0] - a[0]));
        const out = {};
        const keys = new Set(Object.keys(a[1]).concat(Object.keys(b[1])));
        for (const n of keys) {
          const va = a[1][n] == null ? 0 : a[1][n], vb = b[1][n] == null ? 0 : b[1][n];
          out[n] = va + (vb - va) * k;
        }
        return out;
      }
    }
    return Object.assign({}, ks[ks.length - 1][1]);
  }
  const scaleP = (po, f) => { const o = {}; for (const k in po) o[k] = po[k] * f; return o; };
  function merge(base, over) {
    const o = Object.assign({}, base);
    for (const k in over) {
      const v = over[k];
      if (k === 'sit' || k === 'lie') o[k] = v; else o[k] = (o[k] || 0) + v;
    }
    return o;
  }
  // quantize so nearby moments share a cached frame
  function quant(po) {
    const o = {};
    for (const k in po) {
      const v = po[k];
      if (typeof v !== 'number') { o[k] = v; continue; }
      const q = /^(hy|hp|hr|tUp|tSide|tFlick|tCurl)$/.test(k) ? Math.round(v / 4) * 4 : Math.round(v * 10) / 10;
      if (q) o[k] = q;
    }
    return o;
  }
  // The pose of a reaction at time t (ms). o: { reduce, secondary, actor }.
  function sample(sp, family, t, o) {
    o = o || {};
    const R = (REACT[sp] || {})[family] || (REACT[sp] || {}).support;
    if (!R) return {};
    if (o.reduce) {
      // reduced motion: the key moment held (a pose change, no hop)
      const kk = R.keys[Math.min(R.keys.length - 1, R.key)];
      return scaleP(kk[1], o.secondary ? 0.6 : 1);
    }
    let po = sampleK(R, o.secondary ? t / 0.62 : t);
    if (o.secondary) po = scaleP(po, 0.55);
    // the attention shift: a glance at whoever acts, woven into the reaction's first moments
    if (o.actor && !o.secondary && t < 260 && po.hy == null) po.hy = (o.actor === 'comp' ? LOOK.comp : LOOK.pc) * sm(t / 120) * (1 - sm((t - 140) / 120));
    return po;
  }

  // Any timeline as the stage would show it (the stance merged under it): for the dev playback and the gallery.
  // kind: 'react' (name = family), 'impact' (hit | soft | status), 'victory', 'calm' (name = variant index),
  // 'ready', or a bare stance ('calm' | 'ready' | 'defeat' | 'victory' with t = null). Returns { po, lift, ms }.
  function sampleAny(sp, kind, name, t, o) {
    o = o || {};
    const st = kind === 'react' || kind === 'impact' ? 'ready' : kind === 'victory' ? 'calm' : kind;
    const base = Object.assign({}, BASE[sp][st] || BASE[sp].calm);
    let R = null;
    if (kind === 'react') R = REACT[sp][name] || REACT[sp].support;
    else if (kind === 'impact') R = IMPACT[sp][name];
    else if (kind === 'victory') R = VICTORY[sp];
    else if (kind === 'calm' && name != null) R = CALM[sp][+name];
    else if (kind === 'ready' && name != null) R = READY[sp];
    if (!R || t == null) return { po: quant(base), lift: 0, ms: 0 };
    let over;
    if (kind === 'react') over = sample(sp, name, t, o);
    else if (o.reduce) over = kind === 'calm' || kind === 'ready' ? {} : R.keys[Math.min(R.keys.length - 1, R.key)][1];
    else over = sampleK(R, t);
    const lift = !o.reduce && R.lift && !o.secondary ? R.lift(t) : 0;
    return { po: quant(merge(base, over)), lift, ms: o.secondary ? R.ms * 0.62 : R.ms };
  }

  // ---- one encounter ------------------------------------------------------------------------------------------
  let B = null;
  const pt = () => (RB.battleSeq ? RB.battleSeq.now() : 0);
  function wants() {
    const s = RB.game && RB.game.s;
    return !!(B && B.on && s && RB.pets && RB.pets.visible(s, 'battle'));
  }
  function begin(e) {
    const s = RB.game && RB.game.s;
    const sp = s && RB.pets.active(s);
    B = null;
    if (!sp || !RB.pets.visible(s, 'battle')) return;
    // the look is taken once, here: nothing changes the animal halfway through an exchange
    B = {
      on: true, sp, look: RB.pets.lookOf(s, sp), base: 'calm', q: [], idle: null, idleAt: 0, enterT: null, ex: -1, dom: 0,
      stats: { reactions: 0, secondary: 0, impacts: 0, preps: 0, settles: 0, skipped: 0, fitted: 0, families: {}, calmIdles: 0, victory: 0, drawn: 0, maxParticles: 0 }, trace: [],
      comp: e && e.comp, gen: (B0 = (B0 + 1) | 0),
    };
  }
  let B0 = 0;
  function end() { B = null; }
  // Fit a reaction into the action it answers (battle addendum §11: reactions overlap the action and never
  // outlast it into the next decision). `from`..`until` is the window on the presentation clock; a reaction
  // longer than its window plays faster (never more than 1.6×) and is eased out at the next calm. A window
  // shorter than 120 ms (instant playback) plays nothing: the recap carries the result, not the pet.
  const MIN_WIN = 120, MAX_RATE = 1.6, SETTLE_GRACE = 450;
  function fit(r, R, from, until, optional) {
    const dur = r.secondary ? R.ms * 0.62 : R.ms;
    if (until != null && until - from < MIN_WIN) return null;
    // a brace or a settle that cannot fit even at the fastest rate is left out (it is optional)
    if (optional && until != null && until - from < dur / MAX_RATE) return null;
    let rate = 1;
    if (until != null && until - from < dur) { rate = Math.min(MAX_RATE, dur / Math.max(1, until - from)); B.stats.fitted++; }
    r.at = from; r.rate = rate; r.dur = dur / rate;
    return r;
  }
  function schedule(r, R, until) {
    if (!B) return false;
    const traced = { kind: r.kind, family: r.family || r.impact || null, actor: r.actor || null, secondary: !!r.secondary, outcome: r.outcome || null };
    const optional = r.impact === 'prep' || r.impact === 'settle';
    if (!fit(r, R, r.at, until, optional)) { if (!optional) { B.stats.skipped++; traced.skipped = 'instant'; B.trace.push(traced); while (B.trace.length > 60) B.trace.shift(); } return false; }
    traced.rate = Math.round(r.rate * 100) / 100;
    B.q.push(r);
    B.q.sort((a, b) => a.at - b.at);
    while (B.q.length > 8) B.q.shift();
    B.trace.push(traced);
    while (B.trace.length > 60) B.trace.shift();
    return true;
  }
  const reactOf = (sp, family) => REACT[sp][family] || REACT[sp].support;
  function onAction(e) {
    if (!B || !B.on || e.scope !== 'battle') return;
    const family = RB.families.LIST.indexOf(e.family) >= 0 ? e.family : 'support';
    // one dominant reaction per exchange; later actions in it get a short acknowledgement
    const secondary = B.ex === e.exchange && B.dom > 0;
    if (B.ex !== e.exchange) { B.ex = e.exchange; B.dom = 0; }
    B.dom++;
    const t0 = e.t0 != null ? e.t0 : pt();
    const at = t0 + Math.max(0, (e.beat || 400) - 180);
    const until = e.end != null ? t0 + e.end : null;
    // a technique: its own combined culmination (the base family is how it began)
    const ok = schedule({ kind: 'react', family, base: family === 'technique' ? RB.families.base('technique', e.tech || B.comp) : null, actor: e.actor, secondary, at, targets: e.targets || [] }, reactOf(B.sp, family), until);
    if (ok) { B.stats.reactions++; if (secondary) B.stats.secondary++; B.stats.families[family] = (B.stats.families[family] || 0) + 1; }
    B.base = 'ready';
    if (e.won && e.victory != null) schedule({ kind: 'victory', at: t0 + e.victory }, VICTORY[B.sp], null);
  }
  function onEnemy(e) {
    if (!B || !B.on || e.scope !== 'battle') return;
    const kind = e.outcome === 'hit' ? 'hit' : e.outcome === 'status' ? 'status' : 'soft';
    const t0 = e.t0 != null ? e.t0 : pt();
    const contact = t0 + Math.max(0, (e.at || 500) - 60);
    const until = e.end != null ? t0 + e.end : null;
    const I = IMPACT[B.sp];
    // while it prepares: a glance at it and a brace, held until contact
    if (contact - t0 >= 200 && schedule({ kind: 'impact', impact: 'prep', at: t0, targets: e.targets || [] }, I.prep, contact)) B.stats.preps++;
    if (schedule({ kind: 'impact', impact: kind, outcome: e.outcome, at: contact, targets: e.targets || [] }, I[kind], until)) B.stats.impacts++;
    // after it: a settle — the pet's own recovery, alongside the creature's; it may run up to SETTLE_GRACE
    // past the creature's recovery (the next decision eases it out; nothing waits for it)
    const last = B.q.length ? B.q[B.q.length - 1] : null;
    if (last && last.impact === kind && until != null && schedule({ kind: 'impact', impact: 'settle', at: last.at + last.dur, targets: [] }, I.settle, until + SETTLE_GRACE)) B.stats.settles++;
    B.base = 'ready';
  }
  function onScene(e) {
    if (e.scope !== 'battle') return;
    if (e.phase === 'enter') { begin(e); if (B) B.enterT = pt(); return; }
    if (!B) return;
    if (e.phase === 'exit') { end(); return; }
    if (e.phase === 'calm') {
      B.base = 'calm';
      // the next decision: anything pending from a settled (skipped) sequence is dropped (nothing replays
      // later), and a reaction still playing eases out to the stance
      B.q = [];
    }
    if (e.phase === 'ready') B.base = 'ready';
    if (e.phase === 'victory') { B.base = 'victory'; B.stats.victory++; }
    if (e.phase === 'defeat') B.base = 'defeat';
  }
  // ---- the pose now -----------------------------------------------------------------------------------------------
  const TAIL = ['tUp', 'tSide', 'tFlick', 'tCurl', 'wag'], EARS = ['earF', 'earL', 'earR'];
  const lerpPose = (a, b, k) => { const o = {}; const ks = new Set(Object.keys(a).concat(Object.keys(b))); for (const n of ks) { const va = typeof a[n] === 'number' ? a[n] : 0, vb = typeof b[n] === 'number' ? b[n] : 0; o[n] = va + (vb - va) * k; } return o; };
  function timelineOf(sp, cur) { return cur.kind === 'victory' ? VICTORY[sp] : cur.kind === 'impact' ? IMPACT[sp][cur.impact] : reactOf(sp, cur.family); }
  // one timeline's override at its own time tt (ms of its authored timing)
  function overAt(sp, cur, R, tt, reduce) {
    if (cur.kind === 'react') return sample(sp, cur.family, tt, { reduce, secondary: cur.secondary, actor: cur.actor });
    return reduce ? Object.assign({}, R.keys[Math.min(R.keys.length - 1, R.key)][1]) : sampleK(R, tt);
  }
  function poseAt(now, t, reduce) {
    const sp = B.sp;
    const base = BASE[sp][B.base] || BASE[sp].calm;
    let po = Object.assign({}, base);
    let lift = 0;
    // the arrival: a few steps in from your left, then it sits (no wait: the intro line runs meanwhile)
    let dx = 0;
    if (B.enterT != null && !reduce) {
      const k = (now - B.enterT) / 700;
      if (k < 1) {
        dx = -Math.round((1 - sm(k)) * 34);
        po = sp === 'bird' ? { wing: 1, flap: (now / 160) % 1 } : { gait: 'walk', ph: (now / 380) % 1 };
        if (sp === 'bird') lift = Math.round((1 - k) * 8);
        return { po, lift, dx };
      }
    }
    // the reaction playing now (the latest one started), on its fitted clock
    let cur = null;
    for (const r of B.q) if (r.at <= now) cur = r;
    if (cur && now - cur.at < cur.dur) {
      const R = timelineOf(sp, cur);
      const tt = (now - cur.at) * cur.rate;
      let over = overAt(sp, cur, R, tt, reduce);
      if (!reduce) {
        // follow-through: the tail answers about 90 ms after the body and the ears about 50 ms after it
        const tl = overAt(sp, cur, R, Math.max(0, tt - 90), false), er = overAt(sp, cur, R, Math.max(0, tt - 50), false);
        for (const n of TAIL) { if (tl[n] != null) over[n] = tl[n]; else delete over[n]; }
        for (const n of EARS) { if (er[n] != null) over[n] = er[n]; else delete over[n]; }
        // a new timeline takes over from the last pose shown (no pop between a brace and the flinch)
        if (B.lastOver && B.lastR !== cur) B.blend = { r: cur, at: now, from: B.lastOver };
        if (B.blend && B.blend.r === cur && now - B.blend.at < 110) over = lerpPose(B.blend.from, over, sm((now - B.blend.at) / 110));
      }
      B.release = null;
      if (cur.kind === 'impact' && cur.impact !== 'settle' && cur.targets.length && !reduce && over.hy == null && sp !== 'bird') over.hy = (cur.targets[0] === 'comp' ? LOOK.comp : LOOK.pc) * 0.5 * sm(tt / 300);
      B.lastOver = over; B.lastR = cur;
      po = merge(po, over);
      if (R.lift && !reduce && !cur.secondary) lift = R.lift(tt);
      if (cur.kind === 'victory' && now - cur.at > cur.dur - 1) B.base = 'victory';
      return { po, lift, dx };
    }
    // the victory gesture ends in the victory stance itself (nothing to ease back from)
    if (cur && cur.kind === 'victory') { B.base = 'victory'; B.lastOver = null; }
    // eased back to the stance after a reaction (or after one cut short by the next decision)
    if (B.lastOver && !reduce) {
      if (!B.release) B.release = { at: now, from: B.lastOver };
      const k = (now - B.release.at) / 160;
      if (k < 1) return { po: merge(po, lerpPose(B.release.from, {}, sm(k))), lift, dx };
    }
    B.lastOver = null; B.lastR = null; B.release = null; B.blend = null;
    // idle: calm variants on their own irregular clock; ready's small movements; nothing with reduced motion
    if (reduce) return { po, lift, dx };
    if (B.base === 'calm' || B.base === 'ready') {
      if (!B.idle || t > B.idle.t0 + B.idle.R.ms) {
        if (!B.idleAt) B.idleAt = t + 1800 + rnd() * 2600;
        if (t >= B.idleAt) {
          const set = B.base === 'calm' ? CALM[sp] : [READY[sp]];
          B.idle = { R: set[Math.floor(rnd() * set.length)], t0: t };
          B.idleAt = t + B.idle.R.ms + (B.base === 'calm' ? 3700 + rnd() * 4600 : 1400 + rnd() * 2200);
          if (B.base === 'calm') B.stats.calmIdles++;
        } else B.idle = null;
      }
      if (B.idle) {
        const it = t - B.idle.t0;
        const iv = sampleK(B.idle.R, it), tl = sampleK(B.idle.R, Math.max(0, it - 90));
        for (const n of TAIL) { if (tl[n] != null) iv[n] = tl[n]; else delete iv[n]; }
        po = merge(po, iv);
        if (B.idle.R.lift) lift = B.idle.R.lift(it);
      }
      // a slow breath while sitting (quantized: a pixel, not a shimmer)
      if (sp !== 'bird' && B.base === 'calm') po.breath = (po.breath || 0) + (((t / 3400) % 1) < 0.45 ? 0.6 : 0);
    }
    return { po, lift, dx };
  }
  // ---- where it sits (from the live party anchors, every frame) ----------------------------------------------------
  // Between your companion and you, a little in front of your companion and behind you; alone, at your left.
  // Its ground footprint never covers an adventurer's foot anchor (the anchor ± 15 % of the battle frame's
  // width: the planted feet and a margin), nor a creature or an intent badge; when the gap between the two of you is too narrow it moves to
  // the far side of your companion, and when there is no room there either it lies down in the gap (a resting
  // pose is narrower). Positions are canvas px, recomputed from L every frame, so a withdrawn panel or a
  // growing stage never leaves it on old coordinates. Nothing here writes to the layout.
  function badgeRects(L) {
    const out = [];
    for (const f of L.foes || []) {
      const e = f.ext, sc = L.scale || 1;
      if (e) out.push({ x0: f.ex + e.left * sc, y0: f.ey + e.top * sc, x1: f.ex + e.right * sc, y1: f.ey + e.bottom * sc, foe: true });
    }
    for (const b of L.badges || []) out.push(b);
    return out;
  }
  function footSpans(L) {
    const ps = L.ps || 1, half = Math.round((L.F ? L.F.w : 80) * ps * 0.15);
    return [L.pc].concat(L.comp ? [L.comp] : []).filter(Boolean).map((a) => ({ x0: a.x - half, x1: a.x + half, y: a.y, ax: a.x }));
  }
  function place(L, w, h) {
    const ps = L.ps || 1, pc = L.pc, comp = L.comp, Sr = L.Sr || { x: 0, y: 0, w: 1e9, h: 1e9 };
    const spans = footSpans(L), half = Math.ceil(w / 2) + ps;
    const hit = (x, y, hh) => {
      for (const s of spans) if (x + half > s.x0 && x - half < s.x1 && y > s.y - h * 0.9 && y - hh < s.y + 2 * ps) return true;
      for (const b of badgeRects(L)) if (x + half > b.x0 && x - half < b.x1 && y > b.y0 && y - hh < b.y1) return true;
      return false;
    };
    const inside = (x) => x - half >= Sr.x && x + half <= Sr.x + Sr.w;
    let x, y;
    if (comp) { x = Math.round((comp.x + pc.x) / 2 + (L.pw || 80) * 0.03); y = Math.round((comp.y + pc.y) / 2 + ps); }
    else { x = Math.round(pc.x - (L.pw || 80) * 0.52); y = Math.round(pc.y - Math.max(2, (L.ph || 104) * 0.04)); }
    if (!hit(x, y, h) && inside(x)) return { x, y, mode: comp ? 'between' : 'beside' };
    // between them but crowded: the middle of the actual gap, if the animal fits there
    if (comp) {
      const a = spans[1], b = spans[0], mid = Math.round((a.x1 + b.x0) / 2);
      if (!hit(mid, y, h) && inside(mid)) return { x: mid, y, mode: 'gap' };
      // the far side of your companion
      const lx = a.x0 - half - ps, ly = comp.y + ps;
      if (!hit(lx, ly, h) && inside(lx)) return { x: lx, y: ly, mode: 'outside' };
    } else {
      const lx = spans[0].x0 - half - ps;
      if (!hit(lx, y, h) && inside(lx)) return { x: lx, y, mode: 'beside' };
    }
    // no room anywhere clear: lying down (a lower, narrower outline) just behind the line of your feet
    return { x: comp ? Math.round((spans[1].x1 + spans[0].x0) / 2) : Math.round(spans[0].x0 - half), y: Math.round(Math.min(pc.y, comp ? comp.y : pc.y) - (L.ph || 104) * 0.06), mode: 'rest' };
  }
  // The party's drawn height (art px) sets the animal's own art density, so a larger party frame gives the
  // pet more drawn detail at the same proportion (never a stretched sprite: the pet stays on the party's grid).
  // Measured once per battle frame size from the four companions' ready stances (their mean: 81.75 px at the
  // base commit's 80×104 frame) — a reference that does not change with the player's hat or hair.
  const TUNED_H = 82;
  let figMemo = null;
  function heightOf(cv) {
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let y0 = -1, y1 = -1;
    for (let y = 0; y < cv.height && y0 < 0; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 100) { y0 = y; break; }
    for (let y = cv.height - 1; y >= 0 && y1 < 0; y--) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 100) { y1 = y; break; }
    return y0 >= 0 && y1 > y0 ? y1 - y0 + 1 : 0;
  }
  function figureH(L) {
    const F = L.F || { w: 80, h: 104 };
    const key = F.w + 'x' + F.h;
    if (figMemo && figMemo.key === key) return figMemo.h;
    let hgt = F.h * (TUNED_H / 104);
    try {
      const hs = ['nao', 'mio', 'ren', 'suzu'].map((id) => RB.content.chars[id] && RB.battlers.preview ? heightOf(RB.battlers.preview(RB.content.chars[id].look, 'ready', null, 0)) : 0).filter((v) => v > 0);
      if (hs.length) hgt = hs.reduce((a, v) => a + v, 0) / hs.length;
    } catch (err) { /* keep the estimate from the frame */ }
    figMemo = { key, h: hgt };
    return hgt;
  }
  const densityOf = (L) => Math.max(0.75, Math.min(2.5, Math.round((figureH(L) / TUNED_H) * 20) / 20));
  // ---- drawing (called by the stage, between your companion and you) ------------------------------------------------
  function draw(c, L, fr) {
    if (!B || !B.on || !L.pc) return;
    const reduce = !!fr.reduce;
    const now = fr.pt, t = fr.t;
    let { po, lift, dx } = poseAt(now, t, reduce);
    const dens = densityOf(L);
    const view = { kind: 'battle', density: dens };
    const s = L.ps || 1;
    // where it can be: measured from its sitting outline at this density
    const sitF = RB.petArt.frame(B.sp, B.look, view, quant(BASE[B.sp].calm));
    if (!sitF) return;
    if (B.offX == null || B.dens !== dens) { B.offX = centreOf(sitF); B.dens = dens; B.ext = extentOf(sitF); }
    const P = place(L, B.ext.w * s, B.ext.h * s);
    if (P.mode === 'rest') { po = Object.assign({}, po, B.sp === 'bird' ? { crouch: 0.8, fluff: 0.6, tuck: 1 } : { sit: 0, lie: 1 }); lift = 0; }
    const f = RB.petArt.frame(B.sp, B.look, view, quant(po));
    if (!f) return;
    const x = P.x + (dx * dens - B.offX) * s, y = P.y;
    RB.battleScene.shadow(c, x + Math.round(B.offX * s), y - s, Math.round((B.sp === 'bird' ? 7 : B.sp === 'dog' ? 15 : 13) * dens * s), Math.max(2, Math.round(3 * dens * s)), 0.5);
    c.imageSmoothingEnabled = false;
    const px = Math.round(x - f.ax * s), py = Math.round(y - f.ay * s - lift * dens * s);
    c.drawImage(f.cv, px, py, f.w * s, f.h * s);
    B.stats.drawn++;
    B.last = { x: px, y: py, w: f.w * s, h: f.h * s, pose: po, base: B.base, place: P, density: dens, foot: { x: Math.round(x + B.offX * s), y }, ground: { x0: Math.round(P.x - B.ext.w * s / 2), x1: Math.round(P.x + B.ext.w * s / 2), y } };
  }
  // the horizontal middle of a frame's drawing, from its anchor (art px)
  function centreOf(f) {
    try {
      const d = f.cv.getContext('2d').getImageData(0, 0, f.w, f.h).data;
      let x0 = f.w, x1 = -1;
      for (let i = 3; i < d.length; i += 4) if (d[i]) { const x = ((i - 3) / 4) % f.w; if (x < x0) x0 = x; if (x > x1) x1 = x; }
      return x1 < 0 ? 0 : Math.round((x0 + x1) / 2 - f.ax);
    } catch (e) { return 0; }
  }
  // the drawn width and height of a frame (art px)
  function extentOf(f) {
    try {
      const d = f.cv.getContext('2d').getImageData(0, 0, f.w, f.h).data;
      let x0 = f.w, x1 = -1, y0 = f.h;
      for (let i = 3; i < d.length; i += 4) if (d[i]) { const p = (i - 3) / 4, x = p % f.w, yy = (p / f.w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (yy < y0) y0 = yy; }
      return x1 < 0 ? { w: f.w, h: f.h } : { w: x1 - x0 + 1, h: f.ay - y0 + 1 };
    } catch (e) { return { w: f.w, h: f.h }; }
  }
  function stats() {
    if (!B) return { on: false };
    const cp = RB.battleStage.cssPerArt ? RB.battleStage.cssPerArt() : 1;
    const box = B.last ? { x: Math.round(B.last.x * cp), y: Math.round(B.last.y * cp), w: Math.round(B.last.w * cp), h: Math.round(B.last.h * cp) } : null;
    const L = B.last;
    return {
      on: B.on, sp: B.sp, look: B.look, base: B.base, queued: B.q.length, stats: JSON.parse(JSON.stringify(B.stats)), trace: B.trace.slice(), box,
      art: L ? { x: L.x, y: L.y, w: L.w, h: L.h } : null, pose: L ? L.pose : null, place: L ? L.place.mode : null, density: L ? L.density : null,
      ground: L ? L.ground : null, foot: L ? L.foot : null, cssPerArt: cp,
    };
  }

  if (RB.bus) {
    const safe = (fn) => (e) => { try { fn(e || {}); } catch (err) { console.warn('battle pet', err); } };
    RB.bus.on('present:action', safe(onAction));
    RB.bus.on('present:enemy', safe(onEnemy));
    RB.bus.on('present:scene', safe(onScene));
  }

  // ---- settings rows (Display: show in exploration / in battle; Audio: quiet pet sounds) ----------------------------
  if (RB.ui && RB.ui.settings && RB.ui.settings.addRows) {
    RB.ui.settings.addRows('display', ({ sw }) => '<h3 class="pet-set">Pets</h3>' +
      sw('petWorld', 'Show pet in exploration', 'A pet you have met and chosen follows you on the road. It is only company: it changes nothing in play.') +
      sw('petBattle', 'Show pet in battle', 'It sits beside the two of you and watches. It never acts, and hiding it changes nothing.'));
    RB.ui.settings.addRows('audio', ({ sw }) => sw('petSounds', 'Quiet pet sounds', 'An occasional soft sound from your pet (never needed: everything it does is also seen).'));
  }

  return { wants, draw, stats, sample, sampleAny, centreOf, extentOf, place, footSpans, densityOf, poseAt: (now, t, reduce) => (B ? poseAt(now, t, reduce) : null), REACT, IMPACT, PREP, SETTLE, VICTORY, CALM, READY, BASE, LOOK, MIN_WIN, MAX_RATE, SETTLE_GRACE, _begin: begin, _end: end, get _B() { return B; } };
})();
