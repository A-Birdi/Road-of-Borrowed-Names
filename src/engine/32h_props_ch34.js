/* Held objects added for the staging of Chapters 3 and 4 (docs/expressive/reports/staging_ch3_ch4.md): the
 * things that change hands in those scenes and have no drawing in the pose layer's table yet
 * (src/engine/32g_spritepose.js PROPS; the Chapter 1–2 ones are in 32h_props_ch12.js). Same contract: fn(buf, x, y)
 * draws at the hand that holds it (x, y the hand's anchor, the object above it), a pixel larger than life so it
 * reads at play scale; no letters or kanji are drawn (the name scratched on Tomoe's globe is not drawn either).
 * Drawing only: the inventory stays with !give/!take.
 *   globe     Tomoe's festival lantern globe (round amber glass, a light on its shoulder)
 *   key       a rusty iron key (Tamotsu's fence key; Hoshino's observatory key)
 *   beads     Hiro's glass-bead earrings (two amber drops on a thread)
 *   hoshigaki a string of dried persimmons (Fusa's)
 *   leafpin   Grandma Ume's maple-leaf hairpin
 *   strawhat  Asa's spare straw hat
 *   tin       Nao's flat tin of old address labels
 *   goatbell  Tetsuji's spare goat bell on its strap
 *   scarf     the scarf the Snowbell children chose the colours for
 *   cord      Fuki's cord braided from an old bell rope
 *   flask     a stoppered flask of hot amazake
 */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const PZ = RB.sprites && RB.sprites._pose;
  if (!PZ || !PZ.PROPS) return;
  const add = (name, fn) => { if (!PZ.PROPS[name]) { PZ.PROPS[name] = fn; if (PZ.PROP_NAMES && !PZ.PROP_NAMES.includes(name)) PZ.PROP_NAMES.push(name); } };
  add('globe', (b, x, y) => { b.rect(x - 2, y - 5, 5, 5, '#d8823a'); b.rect(x - 3, y - 4, 7, 3, '#d8823a'); b.rect(x - 1, y - 4, 3, 3, '#f0a850'); b.px(x - 1, y - 5, '#ffe0a0'); b.px(x - 2, y - 4, '#ffd08a'); b.rect(x - 1, y, 3, 1, '#8a4a20'); b.px(x + 2, y - 2, '#a85a28'); });
  add('key', (b, x, y) => { b.rect(x - 3, y - 3, 3, 3, '#6a4a3a'); b.px(x - 2, y - 2, '#2a2024'); b.rect(x, y - 2, 4, 1, '#8a6048'); b.px(x + 3, y - 1, '#8a6048'); b.px(x + 1, y - 1, '#8a6048'); b.px(x - 3, y - 3, '#a8785a'); });
  add('beads', (b, x, y) => { b.px(x - 1, y - 4, '#e8d8b0'); b.px(x + 1, y - 4, '#e8d8b0'); b.rect(x - 2, y - 3, 2, 2, '#e0802a'); b.rect(x + 1, y - 3, 2, 2, '#e0802a'); b.px(x - 2, y - 3, '#ffd08a'); b.px(x + 1, y - 3, '#ffd08a'); });
  add('hoshigaki', (b, x, y) => { b.rect(x, y - 7, 1, 8, '#c8a868'); for (const dy of [-6, -3, 0]) { b.rect(x - 1, y + dy, 3, 2, '#b8582a'); b.px(x - 1, y + dy, '#d8783a'); } });
  add('leafpin', (b, x, y) => { b.px(x, y - 5, '#c8452a'); b.rect(x - 1, y - 4, 3, 1, '#c8452a'); b.rect(x - 2, y - 3, 5, 1, '#c8452a'); b.px(x, y - 3, '#e8703a'); b.px(x - 1, y - 2, '#a83020'); b.px(x + 1, y - 2, '#a83020'); b.rect(x, y - 1, 1, 2, '#8a6a44'); });
  add('strawhat', (b, x, y) => { b.rect(x - 4, y - 1, 9, 1, '#d6b25e'); b.rect(x - 2, y - 3, 5, 2, '#d6b25e'); b.rect(x - 2, y - 2, 5, 1, '#a8402a'); b.px(x - 1, y - 3, '#f0d890'); b.rect(x - 4, y, 9, 1, '#a88a40'); });
  add('tin', (b, x, y) => { b.rect(x - 3, y - 3, 7, 3, '#8a9aa8'); b.rect(x - 3, y - 3, 7, 1, '#b8c8d4'); b.rect(x - 3, y, 7, 1, '#5a6a78'); b.px(x, y - 2, '#e8dcc0'); b.px(x + 1, y - 2, '#e8dcc0'); });
  add('goatbell', (b, x, y) => { b.rect(x - 1, y - 6, 3, 1, '#8a5a3a'); b.rect(x - 2, y - 5, 5, 3, '#c8a040'); b.rect(x - 3, y - 2, 7, 1, '#c8a040'); b.px(x - 1, y - 4, '#f0d070'); b.px(x, y - 1, '#5a4a2a'); });
  add('scarf', (b, x, y) => { b.rect(x - 1, y - 2, 3, 7, '#c84a5a'); b.rect(x - 1, y, 3, 1, '#f0e0c0'); b.rect(x - 1, y + 3, 3, 1, '#4a7ac8'); b.px(x - 1, y + 5, '#a83a4a'); b.px(x + 1, y + 5, '#a83a4a'); });
  add('cord', (b, x, y) => { for (let i = 0; i < 7; i++) b.px(x + (i % 2 ? 1 : 0), y - 5 + i, i % 2 ? '#c84a3a' : '#e8d8b0'); b.px(x - 1, y + 1, '#a8885a'); });
  add('flask', (b, x, y) => { b.px(x, y - 6, '#8a6a44'); b.rect(x - 1, y - 5, 3, 1, '#d8ccb4'); b.rect(x - 2, y - 4, 5, 4, '#e8e0d0'); b.rect(x - 2, y - 2, 5, 1, '#6a8aa0'); b.px(x - 1, y - 4, '#fffaf0'); });
})();
