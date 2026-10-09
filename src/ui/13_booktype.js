/* The book preview's embedded type (expansion U02; data/fonts/README.md).
 * The font files travel inside the page as an inert JSON block (<script type="application/json" id="rb-type">,
 * written by tools/build.mjs). When the preview is on, install() turns them into FontFaces from their bytes: no URL
 * is loaded and nothing is fetched. The classic look never calls it, so it pays nothing beyond the page's size.
 * Each face keeps today's system fonts behind it in the style sheet (src/styles/90_book.css), so if the block is
 * missing or a face fails to load, the text still draws. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.bookType = (function () {
  'use strict';
  let state = null; // once installing: a promise of how many faces loaded

  function bytes(b64) {
    const s = atob(b64);
    const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return u.buffer;
  }
  function install() {
    if (state) return state;
    const el = typeof document !== 'undefined' && document.getElementById('rb-type');
    if (!el || typeof FontFace === 'undefined' || !document.fonts) return (state = Promise.resolve(0));
    let list;
    try { list = JSON.parse(el.textContent); } catch (e) { return (state = Promise.resolve(0)); }
    const loads = list.map((f) => {
      try {
        const face = new FontFace(f.family, bytes(f.b64), { weight: f.weight, style: f.style, display: 'block' });
        document.fonts.add(face);
        return face.loaded.then(() => 1, () => 0);
      } catch (e) { return Promise.resolve(0); }
    });
    return (state = Promise.all(loads).then((r) => r.reduce((a, b) => a + b, 0)));
  }
  return { install, installed: () => !!state };
})();
