/* Held objects added for the staging of Chapters 1 and 2 (docs/expressive/reports/staging_ch1_ch2.md): the
 * things that change hands in those scenes and have no drawing in the pose layer's table yet
 * (src/engine/32g_spritepose.js PROPS). Same contract: fn(buf, x, y) draws at the hand that holds it (x, y the
 * hand's anchor, the object above it), a pixel larger than life so it reads at play scale; no letters or
 * kanji are drawn (a nameplate is a blank blue glass plate). Drawing only: the inventory stays with
 * !give/!take.
 *   charm    Mame's reed charm (a small woven knot on a red cord)
 *   plane    Bunta's woodworking plane
 *   shuttle  Kiku's loom shuttle
 *   seaglass a piece of blue sea glass
 *   plate    the sea-glass nameplate for Fuku's boat
 *   rope     a coil of rope (Tetsu's)
 *   nets     a bundle of fishing net (Sōta's)
 */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const PZ = RB.sprites && RB.sprites._pose;
  if (!PZ || !PZ.PROPS) return;
  const add = (name, fn) => { if (!PZ.PROPS[name]) { PZ.PROPS[name] = fn; if (PZ.PROP_NAMES && !PZ.PROP_NAMES.includes(name)) PZ.PROP_NAMES.push(name); } };
  add('charm', (b, x, y) => { b.rect(x - 1, y - 4, 3, 3, '#8a9a4a'); b.px(x, y - 4, '#c8d880'); b.px(x - 1, y - 2, '#5a6a2a'); b.px(x + 1, y - 3, '#5a6a2a'); b.rect(x, y - 1, 1, 2, '#c84a3a'); });
  add('plane', (b, x, y) => { b.rect(x - 3, y - 3, 7, 3, '#a87a48'); b.rect(x - 3, y - 3, 7, 1, '#c89a60'); b.rect(x, y - 5, 2, 2, '#6a4a2a'); b.rect(x - 2, y, 5, 1, '#5a3e24'); b.px(x + 1, y, '#c8c8d0'); });
  add('shuttle', (b, x, y) => { b.rect(x - 3, y - 3, 7, 2, '#b88a50'); b.px(x - 4, y - 2, '#8a6438'); b.px(x + 4, y - 2, '#8a6438'); b.rect(x - 1, y - 3, 3, 1, '#ecdcb4'); b.rect(x - 3, y - 1, 7, 1, '#7a5430'); });
  add('seaglass', (b, x, y) => { b.rect(x - 1, y - 3, 3, 3, '#4a90c8'); b.px(x - 1, y - 3, '#a8d8f8'); b.px(x, y - 3, '#78b8e8'); b.px(x + 1, y - 1, '#2a6aa0'); });
  add('plate', (b, x, y) => { b.rect(x - 4, y - 4, 9, 4, '#3a78b8'); b.rect(x - 4, y - 4, 9, 1, '#88c0ec'); b.rect(x - 3, y - 2, 7, 1, '#5a98d0'); b.rect(x - 4, y, 9, 1, '#1e4a78'); b.px(x + 4, y - 3, '#a8d8f8'); });
  add('rope', (b, x, y) => { b.rect(x - 2, y - 4, 5, 4, '#c8a868'); b.rect(x - 1, y - 3, 3, 2, '#8a6a3a'); b.px(x, y - 2, '#c8a868'); b.px(x + 2, y, '#c8a868'); b.px(x + 3, y + 1, '#a88848'); });
  add('nets', (b, x, y) => { b.rect(x - 3, y - 4, 7, 5, '#5a7a6a'); for (let i = 0; i < 7; i += 2) b.px(x - 3 + i, y - 3, '#a8c8b8'); for (let i = 1; i < 7; i += 2) b.px(x - 3 + i, y - 1, '#a8c8b8'); b.px(x + 3, y - 4, '#c8a868'); b.px(x - 3, y + 1, '#c8a868'); });
})();
