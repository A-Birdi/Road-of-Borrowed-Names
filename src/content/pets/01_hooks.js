/* Cosmetic pets: the scene hooks the vignettes and greetings use (docs/CONTENT.md
 * "!hook"; docs/ADDENDUM_CONTRACTS.md §4). Presentation and the pet records only:
 * nothing here gives an item, a word, a bond point or a quest step.
 *
 *   !hook pet_meet <species>      acquisition (once per campaign), naming, the Pets memory,
 *                                 then an explicit choice to travel together now (selection)
 *   !hook pet_vig <species> <st>  a vignette's animal does something (near, settled, …)
 *   !hook pet_hide / pet_show     a scene that cannot stage the pet hides it (restored after)
 *   !hook pet_come <who>          the travelling pet comes beside someone ('comp', 'pc', an npc)
 *   !hook pet_do <anim>           the travelling pet plays a short authored movement
 *   !hook pet_face <who>          it turns to someone */
var RB = (globalThis.RB = globalThis.RB || {});
RB.hooks = RB.hooks || {};

(function (C) {
  'use strict';
  // The meeting memory for each animal: title, what happened, and each companion's recorded response.
  // (Filled by each vignette file: RB.pets.meeting[species] = { title, text, reply: { nao, mio, ren, suzu } }.)
  RB.pets.meeting = RB.pets.meeting || {};

  const wait = (ms) => new Promise((r) => setTimeout(r, RB.test && RB.test.auto ? 0 : ms));
  RB.hooks.pet_meet = async (args) => {
    const s = RB.game.s, sp = args[0];
    if (!RB.pets.meet(s, sp, { map: s.map })) return; // met already: nothing happens twice
    RB.pets.sound(sp, 'meet');
    RB.ui.dialogue.hide();
    // the name it will be called (the default kept if you like it); plain text, never markup
    const name = RB.test && RB.test.auto ? RB.pets.record(s, sp).name : await RB.ui.petName(s, sp);
    RB.pets.nameAtMeet(s, sp, name);
    const M = RB.pets.meeting[sp];
    const comp = s.comp || null;
    if (M) RB.company.memory(s, { id: 'pet:met:' + sp, kind: 'pets', title: M.title, text: M.text, reply: comp && M.reply ? M.reply[comp] || null : null, map: s.map, pet: { species: sp, name }, ref: 'pet:' + sp });
    // selection is its own choice: an animal never replaces the one travelling with you by itself
    const cur = RB.pets.active(s);
    const label = RB.pets.species(sp).label.en.toLowerCase();
    let pick = 0;
    if (!(RB.test && RB.test.auto)) {
      const q = cur ? 'Travel with ' + name + ' now? ' + RB.pets.nameOf(s, cur) + ' would rest for a while (Company › Pet changes this whenever you like).' : 'Travel with ' + name + ' now? (Company › Pet changes this whenever you like.)';
      pick = await RB.ui.confirm(q, ['Travel together', 'Not yet']);
    }
    if (pick === 0) RB.pets.select(s, sp);
    RB.ui.notice(pick === 0 ? name + ' (' + label + ') is travelling with you.' : name + ' (' + label + ') will wait for you. Company › Pet can bring them along.', 'info');
    await RB.save.autosave('auto');
    await wait(120);
  };
  RB.hooks.pet_vig = async (args) => {
    const v = RB.pets.vignettes[args[0]];
    if (v && v.stage) await v.stage(args[1], args.slice(2));
  };
  RB.hooks.pet_hide = async () => { RB.pets.hide('scene'); };
  RB.hooks.pet_show = async () => { RB.pets.show('scene'); };
  RB.hooks.pet_come = async (args) => { await RB.petWorld.come(args[0] || 'comp'); };
  RB.hooks.pet_face = async (args) => { RB.petWorld.face(args[0] || 'pc'); };
  RB.hooks.pet_do = async (args) => {
    const sp = RB.pets.active(RB.game.s);
    const A = sp && RB.pets.WORLD_ANIM[args[0]];
    if (!A) return;
    await RB.petWorld.act(typeof A === 'function' ? A(sp) : A);
  };

  // Short authored movements in the world (pet_do). ms, pose(t) and the key pose held with reduced motion.
  const sm = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  const bell = (t, a, b, e) => sm((t - a) / (e || 160)) * (1 - sm((t - b) / (e || 160)));
  RB.pets.WORLD_ANIM = {
    // the species' own affection (§4.2): lean into a hand, a wag, a preen, folded paws
    affection: (sp) => ({ ms: 1700, key: RB.pets.AFFECTION[sp].key, pose: (t) => RB.pets.AFFECTION[sp].pose(t / 1700) }),
    // settle down beside someone
    settle: (sp) => ({ ms: 1400, key: sp === 'bird' ? { fluff: 0.6 } : { lie: 1 }, pose: (t) => (sp === 'bird' ? { fluff: 0.6 * sm(t / 600) } : t < 500 ? { sit: sm(t / 400) } : { lie: sm((t - 500) / 500) }) }),
    sit: (sp) => ({ ms: 900, key: sp === 'bird' ? {} : { sit: 1 }, pose: (t) => (sp === 'bird' ? { crouch: 0.3 * sm(t / 300) } : { sit: sm(t / 400) }) }),
    // looks up at someone, ears forward
    lookup: (sp) => ({ ms: 1200, key: { sit: sp === 'bird' ? 0 : 1, hp: -16, earF: 0.7 }, pose: (t) => ({ sit: sp === 'bird' ? 0 : 1, hp: -16 * bell(t, 100, 1000), earF: 0.7 * bell(t, 100, 1000) }) }),
    // a curious sniff (a hand, a bundle, a lamp)
    sniff: (sp) => ({ ms: 1300, key: { hp: 14, nose: 1, lean: 0.4 }, pose: (t) => ({ sit: sp === 'bird' ? 0 : 0.4, hp: 14 * bell(t, 100, 1100), lean: 0.4 * bell(t, 100, 1100), nose: Math.floor(t / 180) % 2 }) }),
    // mirror a gesture: up on the hind legs (the tanuki's specialty), a hop for the bird, a head tilt for the others
    mirror: (sp) => (sp === 'tanuki' ? { ms: 1500, key: { rise: 0.6, pawsUp: 0.8 }, pose: (t) => ({ rise: 0.6 * bell(t, 150, 1250), pawsUp: 0.8 * bell(t, 250, 1150) }) }
      : sp === 'bird' ? { ms: 1200, key: { wing: 0.6, flap: 0.3 }, pose: (t) => ({ wing: 0.7 * bell(t, 200, 900), flap: (t / 170) % 1 }), lift: (t) => Math.round(Math.sin(Math.min(1, t / 900) * Math.PI) * 5) }
        : { ms: 1300, key: { sit: 1, hr: 20 }, pose: (t) => ({ sit: 1, hr: (t < 650 ? 20 : -20) * bell(t, 100, 1200) }) }),
    // curl up (cat), lie down (dog, tanuki), fluff up and doze (bird)
    curl: (sp) => ({ ms: 1600, key: sp === 'bird' ? { fluff: 1, blink: 1 } : { lie: 1, blink: 1 }, pose: (t) => (sp === 'bird' ? { fluff: sm(t / 700), blink: t > 900 ? 1 : 0 } : { lie: sm(t / 700), blink: t > 1000 ? 1 : 0 }) }),
    // a small happy hop / wag
    hop: (sp) => ({ ms: 900, key: sp === 'dog' ? { wag: 0.8 } : { earF: 0.6 }, pose: (t) => (sp === 'dog' ? { wag: Math.sin(t / 60) * 0.8 } : { earF: 0.6 * bell(t, 50, 800) }), lift: (t) => Math.round(Math.sin(Math.min(1, t / 500) * Math.PI) * 3) }),
    // steps back from something too warm, then sits at a safe distance
    back: (sp) => ({ ms: 1100, key: { lean: -0.6, earF: -0.3 }, pose: (t) => ({ lean: -0.6 * bell(t, 50, 700), earF: -0.3 * bell(t, 50, 700), sit: sm((t - 700) / 300) }) }),
  };
  void C;
})(RB.content);
