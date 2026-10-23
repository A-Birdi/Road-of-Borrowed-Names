// RBN-QA-163 C (Agnes 6375174827; Local CL-248; Cloud CC-154 §4): the Ink Bridge's water is "cloudy black" because the
// ink-makers wash their brushes under it, but the canal was drawn clear. A patch of ink is laid on the water there,
// for as long as the washing goes on (always: it is the washing's, not the census's). In node:
//  1. one mp_inkwater, on Blockprint Row at (18,24), the first water row south of the Ink Bridge; always there (no
//     condition, so baked into the ground), never in the way, nothing to look at; no other map has it;
//  2. what it paints (its baked box: three tiles by three, from its own row down) is all canal water, and none of it
//     is the bridge's rows or a bank;
//  3. the scene's line it matches still says the water is cloudy black.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const all = Object.entries(C.maps).flatMap(([m, d]) => (d.props || []).filter((p) => p.p === 'mp_inkwater').map((p) => m + '@' + p.x + ',' + p.y + (p.if ? ' if ' + p.if : '') + (p.scene ? ' scene' : '')));
  const pd = RB.props.P.mp_inkwater;
  t.ok(JSON.stringify(all) === JSON.stringify(['mp.blockprint@18,24']) && pd && pd.block === false && pd.w === 3 && typeof pd.bake2 === 'function',
    'one patch, at the Ink Bridge, always there and baked into the ground, never in the way (' + all.join(' ') + ')');
  const cm = RB.maps.compile('mp.blockprint');
  const tiles = [];
  for (let y = 24; y <= 26; y++) for (let x = 18; x <= 20; x++) tiles.push(RB.maps.tileAt(cm, x, y).id || RB.maps.tileAt(cm, x, y).name);
  const bridge = [];
  for (let y = 22; y <= 23; y++) for (let x = 18; x <= 20; x++) bridge.push(RB.maps.tileAt(cm, x, y).id || RB.maps.tileAt(cm, x, y).name);
  t.ok(tiles.every((k) => k === 'water') && bridge.every((k) => k === 'bridgeH'), 'it lies on the canal\'s water only (' + [...new Set(tiles)] + '), the bridge just north of it (' + [...new Set(bridge)] + ')');
  const line = C.scenes['mp.plaque_sumi'].cmds.find((c) => /cloudy black/.test(c.en || ''));
  t.ok(line && /{黒|くろ}く {濁|にご}って いる/.test(line.jp), 'the scene still says the water under the bridge is cloudy black');
};
