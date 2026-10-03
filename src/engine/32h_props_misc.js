/* Held objects added for the staging of the long quests, the deduction cases, The Pages We Keep and the pet
 * vignettes (docs/expressive/reports/staging_lq_misc.md): the things that change hands in those scenes and have
 * no drawing in the pose layer's table yet (src/engine/32g_spritepose.js PROPS; the Chapter 1–2 additions are
 * 32h_props_ch12.js). Same contract: fn(buf, x, y) draws at the hand that holds it (x, y the hand's anchor, the
 * object above it), a pixel larger than life so it reads at play scale; no letters or kanji are drawn (the
 * parcel's label and the stamped scrap stay blank). Drawing only: the inventory stays with !give/!take.
 *   coins      a small stack of coins (Chigusa's fare, thirty years late)
 *   parcel     a small package tied with string, a red wax seal (the case of the parcel)
 *   persimmon  a persimmon (Kayo's first pick; Ume's dried one is the same colour, darker)
 *   kaki       a dried persimmon (Ume's, for Yasu)
 *   wax        the round of red sealing wax with the bell mark (Hama's keepsake)
 *   bellpart   the small metal clapper from the call bell (the parcel's contents)
 *   shell      a shell button (Shiori's thanks)
 *   tenugui    the persimmon-dyed cloth from the tree-keeper's chest
 *   knife      a small folding knife (Kayo cuts her new height mark on the trunk)
 *   shears     garden shears (Kayo's, trembling in her hand while she says "certainly")
 *   star       a folded paper star (from the box in Hoshino's house)
 *   swallow    Nobu's small clay swallow
 *   spool      Tokuji's little spool of mending thread
 */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const PZ = RB.sprites && RB.sprites._pose;
  if (!PZ || !PZ.PROPS) return;
  const add = (name, fn) => { if (!PZ.PROPS[name]) { PZ.PROPS[name] = fn; if (PZ.PROP_NAMES && !PZ.PROP_NAMES.includes(name)) PZ.PROP_NAMES.push(name); } };
  add('coins', (b, x, y) => { b.rect(x - 2, y - 2, 4, 2, '#c8a040'); b.rect(x - 2, y - 3, 4, 1, '#e8c860'); b.rect(x - 1, y - 4, 3, 1, '#f0d878'); b.px(x + 1, y - 1, '#8a6a20'); b.px(x - 2, y - 1, '#a8862c'); });
  add('parcel', (b, x, y) => { b.rect(x - 3, y - 4, 7, 5, '#b89868'); b.rect(x - 3, y - 4, 7, 1, '#d8b888'); b.rect(x, y - 4, 1, 5, '#6a4a2a'); b.rect(x - 3, y - 2, 7, 1, '#6a4a2a'); b.px(x + 2, y - 3, '#c83a3a'); b.rect(x - 3, y + 1, 7, 1, '#7a5a38'); });
  add('persimmon', (b, x, y) => { b.rect(x - 1, y - 3, 3, 3, '#e8702a'); b.px(x - 1, y - 3, '#f8a050'); b.px(x + 1, y - 1, '#b84a1a'); b.rect(x - 1, y - 4, 3, 1, '#4a6a2a'); b.px(x, y - 5, '#3a4a1a'); });
  add('kaki', (b, x, y) => { b.rect(x - 1, y - 3, 3, 3, '#a85a2a'); b.px(x - 1, y - 3, '#c8783a'); b.px(x + 1, y - 1, '#7a3a1a'); b.px(x, y - 4, '#5a4a2a'); });
  add('wax', (b, x, y) => { b.rect(x - 1, y - 3, 3, 3, '#c83a3a'); b.px(x - 1, y - 3, '#e86a5a'); b.px(x, y - 2, '#8a2020'); b.px(x + 1, y - 1, '#a02a2a'); });
  add('bellpart', (b, x, y) => { b.rect(x, y - 4, 1, 3, '#8a8a92'); b.rect(x - 1, y - 2, 3, 2, '#c8c8d0'); b.px(x - 1, y - 2, '#e8e8f0'); b.px(x + 1, y - 1, '#6a6a72'); });
  add('shell', (b, x, y) => { b.rect(x - 1, y - 3, 3, 3, '#f0e4d0'); b.px(x, y - 2, '#a89878'); b.px(x - 1, y - 3, '#fff8ec'); b.px(x + 1, y - 1, '#c8b898'); });
  add('knife', (b, x, y) => { b.rect(x, y - 1, 1, 2, '#6a4a2a'); b.rect(x, y - 5, 1, 4, '#c8c8d0'); b.px(x, y - 6, '#e8e8f0'); b.px(x + 1, y - 4, '#8a8a92'); });
  add('shears', (b, x, y) => { b.line(x - 2, y - 5, x + 1, y - 1, '#a8a8b0'); b.line(x + 2, y - 5, x - 1, y - 1, '#c8c8d0'); b.rect(x - 2, y, 2, 2, '#8a3a2a'); b.rect(x + 1, y, 2, 2, '#8a3a2a'); });
  add('star', (b, x, y) => { b.rect(x - 1, y - 3, 3, 3, '#f0d060'); b.px(x, y - 4, '#f8e890'); b.px(x - 2, y - 2, '#e8c040'); b.px(x + 2, y - 2, '#e8c040'); b.px(x, y - 2, '#c8a030'); });
  add('swallow', (b, x, y) => { b.rect(x - 2, y - 2, 4, 2, '#b8683a'); b.px(x - 3, y - 3, '#a85a30'); b.px(x + 2, y - 3, '#a85a30'); b.px(x - 1, y - 3, '#d88858'); b.px(x + 1, y, '#8a4a28'); });
  add('spool', (b, x, y) => { b.rect(x - 1, y - 4, 3, 1, '#8a6a44'); b.rect(x - 1, y, 3, 1, '#8a6a44'); b.rect(x - 1, y - 3, 3, 3, '#5a7aa8'); b.px(x, y - 2, '#8aa8d0'); });
  add('tenugui', (b, x, y) => { b.rect(x - 1, y, 3, 6, '#9a5a32'); b.rect(x - 1, y + 5, 3, 1, '#7a4222'); b.px(x + 1, y + 1, '#b87448'); b.px(x - 1, y + 2, '#b87448'); });
})();
