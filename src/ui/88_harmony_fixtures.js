/* Harmony portrait art — the appearance coverage set (Harmony addendum §20.4,
 * §23.3). A QA fixture list built from the actual registries, never a
 * hand-kept copy: every hairstyle (RB.sprites.HAIRSTYLES), garment shape (the
 * creation cuts plus the dress the battle figures support), cloth palette,
 * skin, hair colour and accessory category (RB.sprites.ACCESSORIES), every
 * keepsake in the cosmetic slot (RB.content.items, worn through
 * RB.equip.lookWith so same-place replacement is the real rule), and named
 * stress combinations (glasses with a fringe, headwear over large hair, a
 * scarf with a strap, the arriving drawing whose hand crosses the body and,
 * for Ren, the face).
 *
 * Every fixture is SYNTHETIC: a look assembled for inspection, not a saved
 * campaign or real play. The contact sheets (tests/e2e/harmony_art_sheets.mjs)
 * and the browser test (tests/e2e/harmony_art.mjs) label it as such. Nothing
 * here runs unless a test or a developer calls it. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const SHAPES = ['tunic', 'robe', 'coat', 'apron', 'dress'];
  function fixtures() {
    const SP = RB.sprites, out = [];
    const nS = SP.SKIN.length, nH = SP.HAIR.length, nC = SP.CLOTH.length, A = SP.ACCESSORIES;
    // one per hairstyle; skins, hair colours, cloth palettes, cuts and accessory categories cycle so that each
    // value appears at least once across the twelve
    SP.HAIRSTYLES.forEach((hair, i) => out.push({
      id: 'style_' + hair, group: 'hairstyle',
      look: { skin: i % nS, hair, hairColor: (i * 3) % nH, outfit: i % nC, shape: SHAPES[i % SHAPES.length], acc: [A[i % A.length]] },
    }));
    // named looks: the creation default, the owner's acceptance example (green coat, auburn ponytail)
    out.push({ id: 'creation_default', group: 'reference', look: { skin: 2, hair: 'short', hairColor: 1, outfit: 0, shape: 'tunic', acc: ['scarf'] } });
    out.push({ id: 'acceptance_green_auburn', group: 'reference', look: { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] } });
    // stress combinations (two creation accessories at most, as character creation allows)
    const stress = [
      ['glasses_blunt_fringe', { skin: 0, hair: 'bob', hairColor: 0, outfit: 5, shape: 'coat', acc: ['glasses'] }],
      ['glasses_long_fringe', { skin: 4, hair: 'long', hairColor: 6, outfit: 1, shape: 'robe', acc: ['glasses', 'earrings'] }],
      ['glasses_wrap', { skin: 6, hair: 'wrap', hairColor: 2, outfit: 7, shape: 'tunic', acc: ['glasses', 'earrings'] }],
      ['hat_curly', { skin: 5, hair: 'curly', hairColor: 4, outfit: 3, shape: 'apron', acc: ['hat', 'scarf'] }],
      ['hat_wavy', { skin: 1, hair: 'wavy', hairColor: 9, outfit: 6, shape: 'dress', acc: ['hat', 'earrings'] }],
      ['hat_spiky', { skin: 3, hair: 'spiky', hairColor: 5, outfit: 4, shape: 'tunic', acc: ['hat', 'satchel'] }],
      ['scarf_strap', { skin: 2, hair: 'short', hairColor: 3, outfit: 2, shape: 'tunic', acc: ['scarf', 'satchel'] }],
      ['cape_strap', { skin: 0, hair: 'ponytail', hairColor: 8, outfit: 5, shape: 'coat', acc: ['cape', 'satchel'] }],
      ['headband_twintails', { skin: 4, hair: 'twintails', hairColor: 7, outfit: 0, shape: 'robe', acc: ['headband', 'flower'] }],
      ['braid_scarf', { skin: 3, hair: 'braid', hairColor: 1, outfit: 6, shape: 'apron', acc: ['scarf', 'earrings'] }],
      ['shaved_glasses_cape', { skin: 6, hair: 'shaved', hairColor: 0, outfit: 1, shape: 'coat', acc: ['glasses', 'cape'] }],
      ['bun_headband', { skin: 1, hair: 'bun', hairColor: 4, outfit: 4, shape: 'dress', acc: ['headband', 'earrings'] }],
    ];
    for (const [id, look] of stress) out.push({ id, group: 'stress', look });
    // every keepsake that can be worn, on a base look of its own, through the real resolver
    const items = (RB.content && RB.content.items) || {};
    const ids = Object.keys(items).filter((k) => items[k] && items[k].slot === 'cosmetic').sort();
    ids.forEach((id, i) => {
      const base = { skin: (i * 2) % nS, hair: SP.HAIRSTYLES[(i * 5) % SP.HAIRSTYLES.length], hairColor: (i * 7) % nH, outfit: (i * 3) % nC, shape: SHAPES[i % 4], acc: [i % 2 ? 'hat' : 'scarf'] };
      const look = RB.equip && RB.equip.lookWith ? RB.equip.lookWith(base, id) : base;
      out.push({ id: 'keepsake_' + id, group: 'keepsake', item: id, acc: items[id].acc, base, look });
    });
    return out.map((f) => Object.assign({ synthetic: true }, f));
  }
  // What the set covers, by category (for the docs' coverage table and the tests).
  function coverage(list) {
    list = list || fixtures();
    const SP = RB.sprites, seen = { hair: new Set(), shape: new Set(), outfit: new Set(), skin: new Set(), hairColor: new Set(), acc: new Set(), item: new Set() };
    for (const f of list) {
      const L = f.look;
      seen.hair.add(L.hair); seen.shape.add(L.shape); seen.outfit.add(L.outfit); seen.skin.add(L.skin); seen.hairColor.add(L.hairColor);
      for (const a of L.acc || []) seen.acc.add(a);
      if (f.item) seen.item.add(f.item);
    }
    const items = (RB.content && RB.content.items) || {};
    const want = {
      hair: SP.HAIRSTYLES, shape: SHAPES, outfit: SP.CLOTH.map((_, i) => i), skin: SP.SKIN.map((_, i) => i), hairColor: SP.HAIR.map((_, i) => i),
      acc: SP.ACCESSORIES, item: Object.keys(items).filter((k) => items[k] && items[k].slot === 'cosmetic'),
    };
    const res = {};
    for (const k in want) res[k] = { want: want[k].length, got: want[k].filter((v) => seen[k].has(v)).length, missing: want[k].filter((v) => !seen[k].has(v)) };
    return res;
  }
  RB.harmonyArtFixtures = { fixtures, coverage, SHAPES };
})();
