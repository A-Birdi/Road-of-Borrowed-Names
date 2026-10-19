/* Item icons (LI-2, Robin 2026-10-16: "every item needs to have a unique icon, dedicated to what it actually represents
 * and looks like … without looking like a squiggly mess"). Each item's icon is a small authored pixel table, 16×16,
 * drawn at whole-number scales and never blurred (AC-1: "a small authored pixel table … beats an ellipse generator").
 *
 *   RB.itemArt.def(id, { pal: { a: '#hex', … }, px: [16 strings of 16 characters] })
 *       '.' is transparent; 'o' is the shared outline ink unless the icon names its own; every other character is a
 *       colour of the icon's palette. Definitions live in src/content/item_art/ (one file per region group).
 *   RB.itemArt.has(id) · ids() · get(id)
 *   RB.itemArt.url(id)            a 16×16 PNG as a data URL (made once, then cached)
 *   RB.itemArt.html(id, scale, cls)  an <img> at 16×scale CSS pixels, pixelated, decorative (alt=""); an item without an
 *                                 icon falls back to the folio's line drawing for its kind
 *   RB.itemArt.problems(id)       what is wrong with a definition (size, characters, palette), for the validator
 * Drawing only: nothing here changes what an item is or does. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

// (one maker, two registries: the items' icons, and the battle's: its moves and its responses, RB.battleArt, IC-1)
RB.pixelIcons = function (fallback) {
  'use strict';
  const N = 16;
  const OUT = '#2a2024'; // the outline ink of the keepsakes' pixel art (src/content/discovery/60_keepsakes.js)
  const DEFS = Object.create(null);
  const cache = Object.create(null);

  function def(id, art) { DEFS[id] = art; delete cache[id]; }
  const has = (id) => !!DEFS[id];
  const get = (id) => DEFS[id] || null;
  const ids = () => Object.keys(DEFS);
  const palOf = (a) => Object.assign({ o: OUT }, a.pal || {});

  function problems(id) {
    const a = DEFS[id];
    if (!a) return ['no icon'];
    const out = [];
    const px = a.px || [];
    if (px.length !== N) out.push(px.length + ' rows, not ' + N);
    const pal = palOf(a);
    let ink = 0;
    px.forEach((row, y) => {
      if (row.length !== N) out.push('row ' + y + ' is ' + row.length + ' wide');
      for (const ch of row) {
        if (ch === '.') continue;
        ink++;
        if (!pal[ch]) out.push('row ' + y + ': "' + ch + '" is not in the palette');
        else if (!/^#[0-9a-f]{6}$/i.test(pal[ch])) out.push('"' + ch + '" is not a #rrggbb colour');
      }
    });
    if (ink < 24) out.push('only ' + ink + ' pixels drawn');
    return [...new Set(out)];
  }

  // the 16×16 picture as a canvas (browser only)
  function paint(id) {
    const a = DEFS[id];
    if (!a || typeof document === 'undefined') return null;
    const cv = document.createElement('canvas');
    cv.width = N; cv.height = N;
    const g = cv.getContext('2d');
    const pal = palOf(a);
    (a.px || []).forEach((row, y) => {
      for (let x = 0; x < Math.min(N, row.length); x++) {
        const c = pal[row[x]];
        if (row[x] === '.' || !c) continue;
        g.fillStyle = c;
        g.fillRect(x, y, 1, 1);
      }
    });
    return cv;
  }
  function url(id) {
    if (cache[id]) return cache[id];
    const cv = paint(id);
    if (!cv) return '';
    try { cache[id] = cv.toDataURL('image/png'); } catch (e) { cache[id] = ''; }
    return cache[id];
  }
  function html(id, scale, cls) {
    const s = Math.max(1, Math.round(scale || 2));
    const u = has(id) ? url(id) : '';
    if (!u) return '<span class="it-ic it-ic-line' + (cls ? ' ' + cls : '') + '" style="width:' + N * s + 'px;height:' + N * s + 'px" aria-hidden="true">' + (fallback ? fallback(id) : '') + '</span>';
    return '<img class="it-ic' + (cls ? ' ' + cls : '') + '" src="' + u + '" width="' + N * s + '" height="' + N * s + '" alt="" aria-hidden="true" draggable="false">';
  }
  return { def, has, get, ids, url, html, problems, paint, SIZE: N, OUT };
};
// (an item without its own picture yet: the folio's line drawing for its kind)
RB.itemArt = RB.pixelIcons((id) => {
  const d = RB.content && RB.content.items && RB.content.items[id];
  return RB.ui.folio ? RB.ui.folio.icon(RB.ui.folio.itemIcon ? RB.ui.folio.itemIcon(id, d) : 'pouch') : '';
});
// The battle's icons (IC-1, Robin 2026-10-19: "Given the Icon expansion in the inventory, we could probably use new
// icons for the battle menus and enemy Intent"): one per move a creature telegraphs and per kind of response, keyed
// by the line icon's name they replace (src/ui/80_combat.js); drawn in src/content/battle_art/. One without its own
// picture falls back to the line drawing.
RB.battleArt = RB.pixelIcons((id) => (RB.learnUi && RB.learnUi.icon ? RB.learnUi.icon(id) : ''));
