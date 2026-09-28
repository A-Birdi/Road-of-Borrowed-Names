/* Equipment in one place: the worn look and the Satchel's keyword tags.
 *
 * The worn look is the player's own look with the equipped keepsake's
 * accessory (and its colours) laid over it. Everything that draws the
 * player asks for it here — the world sprite, the battle party, the dialogue
 * portrait (and so the save thumbnails, which are snapshots of the world) —
 * so a keepsake shows everywhere at once. A keepsake of the same kind as
 * something the player already wears (a second hat, a scarf over the
 * starting scarf) takes that thing's place in its own colours, so wearing it
 * always changes something you can see.
 *
 * Keyword tags ([Battle start: ward +1], [Quicker stride], [Appearance] …)
 * are derived from each item's data (slot, effect fields, acc), so every
 * item in every chapter and the Atlas gets them with no hand-kept list.
 * Effect kinds defined elsewhere (the Atlas charms) register their own tags
 * with defineEffect next to the code that implements them. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.equip = (function () {
  'use strict';

  // ---- slots ------------------------------------------------------------------------------------
  const SLOTS = [
    { id: 'charm', en: 'Charm', jp: 'お{守|まも}り', where: 'works in battle', icon: 'charm' },
    { id: 'tool', en: 'Tool', jp: '{道具|どうぐ}', where: 'works on the road', icon: 'tool' },
    { id: 'cosmetic', en: 'Keepsake', jp: '{飾|かざ}り', where: 'appearance only', icon: 'keepsake' },
  ];
  const slot = (id) => SLOTS.find((x) => x.id === id) || null;
  const item = (id) => (id && RB.content.items[id]) || null;

  // ---- the worn look ------------------------------------------------------------------------------
  // Accessories that sit in the same place: one thing on the head at a time.
  const SAME_PLACE = { hat: ['hat', 'cap'], cap: ['hat', 'cap'] };
  function lookWith(base, id) {
    base = base || {};
    const out = Object.assign({}, base, { acc: (base.acc || []).slice() });
    const it = item(id);
    if (!it || !it.acc) return out;
    const drop = SAME_PLACE[it.acc] || [it.acc];
    out.acc = out.acc.filter((a) => drop.indexOf(a) < 0);
    out.acc.push(it.acc); // last, so it is drawn over everything else in its layer
    if (it.wear) Object.assign(out, it.wear);
    return out;
  }
  // The look the player is drawn with everywhere.
  function look(s) {
    s = s || (RB.game && RB.game.s);
    if (!s || !s.player) return {};
    return lookWith(s.player.look, s.equip && s.equip.cosmetic);
  }
  // What of the player's own look a keepsake takes the place of (for the Satchel's note).
  function replaces(base, id) {
    const it = item(id);
    if (!it || !it.acc) return [];
    const drop = SAME_PLACE[it.acc] || [it.acc];
    return ((base && base.acc) || []).filter((a) => drop.indexOf(a) >= 0);
  }
  // Keep the world sprite in step with the equipment straight away.
  function refresh(s) {
    const W = RB.world && RB.world.W;
    if (W && W.player) W.player.look = look(s);
  }
  function equip(s, id) {
    const it = item(id);
    if (!it || !it.slot || !s.equip) return false;
    s.equip[it.slot] = id;
    refresh(s);
    RB.bus && RB.bus.emit('equip:change', { slot: it.slot, id });
    return true;
  }
  function unequip(s, slotId) {
    if (!s.equip || !slot(slotId)) return false;
    s.equip[slotId] = null;
    refresh(s);
    RB.bus && RB.bus.emit('equip:change', { slot: slotId, id: null });
    return true;
  }
  const isWorn = (s, id) => { const it = item(id); return !!(it && it.slot && s.equip && s.equip[it.slot] === id); };

  // ---- keyword tags ---------------------------------------------------------------------------------
  // A tag: { id, icon, kind, en, jp, key }. kind: 'boon' (a benefit), 'cost' (the drawback that
  // comes with it), 'look' (appearance only) or 'none' (no effect). `key` explains it in the Key.
  const T = {
    ward: (n) => ({ id: 'ward' + n, icon: 'ward', kind: 'boon', en: 'Battle start: ward +' + n, jp: '{初|はじ}め から {守|まも}り ＋' + n,
      key: 'Every battle begins with a ward of ' + n + ' in front of you (and your companion), before anything has happened.' }),
    harmony: (n) => ({ id: 'harmony' + n, icon: 'harmony', kind: 'boon', en: 'Battle start: harmony +' + n, jp: '{初|はじ}め から {調和|ちょうわ} ＋' + n,
      key: 'Every battle begins with ' + n + ' harmony already built, so a coordinated technique comes sooner. (Harmony builds with a companion.)' }),
    resolve: (n) => ({ id: 'resolve' + n, icon: 'resolve', kind: 'boon', en: 'Resolve +' + n, jp: '{気力|きりょく} ＋' + n,
      key: 'In battle you (and your companion) start with ' + n + ' more resolve, and your maximum is ' + n + ' higher.' }),
    stride: () => ({ id: 'stride', icon: 'stride', kind: 'boon', en: 'Quicker stride', jp: '{早足|はやあし}',
      key: 'You walk and run a little faster on the road (each step takes about an eighth less time).' }),
    look: () => ({ id: 'look', icon: 'look', kind: 'look', en: 'Appearance', jp: '{見|み}た{目|め}',
      key: 'Changes only how you look: on the road, in battle and in your portrait. No effect on play.' }),
    noBattle: () => ({ id: 'nobattle', icon: 'none', kind: 'none', en: 'No battle effect', jp: '{戦|たたか}い の {効果|こうか} なし',
      key: 'A keepsake worn as a charm. It fills the charm slot but changes nothing in battle.' }),
    noEffect: () => ({ id: 'noeffect', icon: 'none', kind: 'none', en: 'No effect', jp: '{効果|こうか} なし',
      key: 'Worn for its own sake. It changes nothing in play.' }),
    special: () => ({ id: 'special', icon: 'charm', kind: 'boon', en: 'Special effect', jp: '{特別|とくべつ} な {効果|こうか}',
      key: 'It does something particular; its description says what.' }),
    // for effect kinds registered elsewhere: boon(id, icon, en, jp, key) / cost(id, en, jp, key)
    boon: (id, icon, en, jp, key) => ({ id, icon, kind: 'boon', en, jp, key }),
    cost: (id, en, jp, key) => ({ id, icon: 'cost', kind: 'cost', en, jp, key }),
  };
  const EFFECT = {
    startWard: (v) => [T.ward(v)],
    harmonyStart: (v) => [T.harmony(v)],
    resolve: (v) => [T.resolve(v)],
    walk: () => [T.stride()],
  };
  function defineEffect(key, fn) { EFFECT[key] = fn; }
  function tags(it) {
    if (typeof it === 'string') it = item(it);
    if (!it || !it.slot) return [];
    const out = [];
    const eff = it.effect || {};
    for (const k in eff) {
      const fn = EFFECT[k];
      const got = fn ? [].concat(fn(eff[k], T) || []) : [T.special()];
      for (const g of got) if (g && !out.some((o) => o.id === g.id)) out.push(g);
    }
    if (it.acc) out.push(T.look());
    if (!out.length) out.push(it.slot === 'charm' ? T.noBattle() : T.noEffect());
    return out;
  }
  // Every effect key has tags (for the content check).
  const knownEffect = (k) => Object.prototype.hasOwnProperty.call(EFFECT, k);
  // One line for the "Received" note: that it can be worn, where, and what it does.
  function note(it) {
    const z = it && it.slot && slot(it.slot);
    if (!z) return null;
    return 'Can be worn as a ' + z.en.toLowerCase() + ' (' + tags(it).map((t) => (t.kind === 'cost' ? 'but ' : '') + t.en).join(', ') + '). Equip it in the Satchel.';
  }

  return { SLOTS, slot, SAME_PLACE, lookWith, look, replaces, refresh, equip, unequip, isWorn, tags, note, defineEffect, knownEffect, T };
})();
