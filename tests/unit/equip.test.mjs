// Equipment data: every equippable item in every chapter and the Atlas gets
// keyword tags from its data (no effect kind without a keyword), each tag's
// Japanese label carries furigana, every keepsake names an accessory the art
// knows, and the worn look lays a keepsake over the player's own look
// (replacing the same kind, in its own colours) without changing it.
import { load } from '../lib/load.mjs';

export default async function (t) {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.equip;
  const ids = Object.keys(C.items).filter((k) => C.items[k].slot);
  t.ok(ids.length >= 20, 'equippable items found (' + ids.length + ')');
  const slots = new Set(E.SLOTS.map((z) => z.id));
  const icons = RB.ui.folio.ICONS;
  const jpOk = (s) => !RB.jp.validate(s).length && !RB.jp.validateMixed(s).length;
  for (const id of ids) {
    const it = C.items[id];
    t.ok(slots.has(it.slot), id + ': a known slot (' + it.slot + ')');
    for (const k in it.effect || {}) t.ok(E.knownEffect(k), id + ': effect "' + k + '" has keyword tags');
    const tags = E.tags(it);
    t.ok(tags.length >= 1, id + ': at least one tag');
    t.ok(!tags.some((x) => x.id === 'special'), id + ': no generic "special effect" tag');
    for (const x of tags) {
      t.ok(x.id && x.en && x.jp && x.key && icons[x.icon], id + ': tag ' + x.id + ' has label, Japanese, explanation and an icon');
      t.ok(jpOk(x.jp), id + ': tag ' + x.id + ' Japanese has furigana: ' + x.jp);
      t.ok(['boon', 'cost', 'look', 'none'].includes(x.kind), id + ': tag ' + x.id + ' kind');
    }
    if (it.slot === 'cosmetic') t.ok(!!it.acc && tags.some((x) => x.id === 'look'), id + ': a keepsake names its accessory and is tagged Appearance');
    if (it.slot === 'charm' && !it.effect) t.ok(tags.map((x) => x.id).join() === 'nobattle' && /nothing in battle/.test(it.desc), id + ': a charm without an effect says so (tag and description)');
    t.ok(/Can be worn as a/.test(E.note(it)), id + ': the Received note says it can be worn');
  }
  for (const z of E.SLOTS) t.ok(jpOk(z.jp), 'slot ' + z.id + ' Japanese has furigana');
  // the accessories keepsakes use are drawn by the sprite art and the portrait (by name in the source)
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { root } = await import('../lib/load.mjs');
  // (the road sprites' accessories live in 32k_spriteacc.js)
  const sprite = fs.readdirSync(path.join(root, 'src/engine')).filter((f) => /^32/.test(f)).map((f) => fs.readFileSync(path.join(root, 'src/engine', f), 'utf8')).join('\n');
  const face = fs.readFileSync(path.join(root, 'src/engine/35_portraits.js'), 'utf8');
  const battle = fs.readFileSync(path.join(root, 'src/engine/34_battlers.js'), 'utf8');
  for (const id of ids.filter((k) => C.items[k].acc)) {
    const a = C.items[id].acc;
    t.ok(new RegExp('\\n    ' + a + '\\(b').test(sprite), id + ': sprite art draws "' + a + '"');
    t.ok(battle.includes("case '" + a + "'"), id + ': battle figure art draws "' + a + '"');
    t.ok(face.includes("a.includes('" + a + "')") || face.includes("p.acc.includes('" + a + "')"), id + ': portrait art draws "' + a + '"');
    for (const k in C.items[id].wear || {}) t.ok(/Col$|Stripe$/.test(k) && /^#[0-9a-f]{6}$/i.test(C.items[id].wear[k]), id + ': wear.' + k + ' is a colour');
  }
  // the worn look
  const base = { skin: 2, hair: 'short', hairColor: 1, outfit: 0, acc: ['hat', 'scarf'] };
  const w = E.lookWith(base, 'lf_ferry_cap');
  t.eq(w.acc, ['scarf', 'cap'], 'a cap takes the hat\'s place; the keepsake is drawn last');
  t.eq(base.acc, ['hat', 'scarf'], 'the player\'s own look is not changed');
  t.ok(w.capCol === C.items.lf_ferry_cap.wear.capCol, 'the keepsake\'s colours come with it');
  t.eq(E.lookWith(base, 'sb_scarf').acc, ['hat', 'scarf'], 'the knitted scarf replaces the starting scarf (one scarf, its own colours)');
  t.eq(E.replaces(base, 'co_straw_hat'), ['hat'], 'the Satchel can say what a keepsake replaces');
  t.eq(E.lookWith(base, 'rw_mill_charm'), Object.assign({}, base, { acc: ['hat', 'scarf'] }), 'a charm does not change the look');
  const s = RB.state.newCampaign({});
  s.player.look = base; s.equip.cosmetic = 'atlas_cos_quill';
  t.eq(E.look(s).acc, ['hat', 'scarf', 'atlas_quill'], 'the look everything draws includes the equipped keepsake');
  t.ok(E.equip(s, 'sg_float_charm') && s.equip.charm === 'sg_float_charm' && E.isWorn(s, 'sg_float_charm'), 'equip puts an item in its slot');
  t.ok(E.unequip(s, 'charm') && s.equip.charm === null, 'unequip empties the slot');
  t.ok(!E.equip(s, 'rw_letter'), 'something without a slot cannot be equipped');
}
