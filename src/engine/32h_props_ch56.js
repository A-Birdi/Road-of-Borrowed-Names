/* Held objects added for the staging of Chapters 5 and 6 (docs/expressive/reports/staging_ch5_ch6.md): the
 * things that change hands in those scenes and have no drawing in the pose layer's table yet
 * (src/engine/32g_spritepose.js PROPS; the Chapter 1–2 additions are in 32h_props_ch12.js). Same contract:
 * fn(buf, x, y) draws at the hand that holds it (x, y the hand's anchor, the object above it), a pixel larger
 * than life so it reads at play scale; no letters or kanji are drawn. Drawing only: the inventory stays with
 * !give/!take.
 *   key    a small brass key (Akari's key to the basement stacks)
 *   bell   a messenger's small brass bell on a cord (Tōya's, kept by Tokuji)
 */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const PZ = RB.sprites && RB.sprites._pose;
  if (!PZ || !PZ.PROPS) return;
  const add = (name, fn) => { if (!PZ.PROPS[name]) { PZ.PROPS[name] = fn; if (PZ.PROP_NAMES && !PZ.PROP_NAMES.includes(name)) PZ.PROP_NAMES.push(name); } };
  // the bow (a ring) above the hand, the shaft and two teeth below it
  add('key', (b, x, y) => { b.rect(x - 1, y - 5, 3, 3, '#c8a040'); b.px(x, y - 4, '#5a4a2a'); b.px(x - 1, y - 5, '#ecd078'); b.rect(x, y - 2, 1, 3, '#b08a30'); b.px(x + 1, y, '#b08a30'); b.px(x + 1, y - 1, '#8a6a20'); });
  // a cord from the fingers, the bell's crown, its flared body and the clapper's dark mouth
  add('bell', (b, x, y) => { b.px(x, y - 6, '#8a3a3a'); b.px(x, y - 5, '#8a3a3a'); b.rect(x - 1, y - 4, 3, 1, '#c8a040'); b.rect(x - 2, y - 3, 5, 2, '#d8b050'); b.px(x - 1, y - 3, '#f4dc88'); b.rect(x - 2, y - 1, 5, 1, '#9a7428'); b.px(x, y, '#4a3a20'); });
})();
