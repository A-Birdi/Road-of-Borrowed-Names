/* Map kit: deterministic helpers for authoring terrain as drawing commands
 * (fill, rectangles, paths, borders, seeded scatter). Produces the same
 * ASCII rows format the map compiler reads. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.mapkit = (function () {
  'use strict';
  function make(w, h, fill) {
    const g = [];
    for (let y = 0; y < h; y++) g.push(new Array(w).fill(fill || '.'));
    const k = {
      w, h,
      get(x, y) { return x >= 0 && y >= 0 && x < w && y < h ? g[y][x] : null; },
      set(x, y, ch) { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = ch; return k; },
      rect(x, y, rw, rh, ch) { for (let yy = y; yy < y + rh; yy++) for (let xx = x; xx < x + rw; xx++) k.set(xx, yy, ch); return k; },
      frame(x, y, rw, rh, ch) { for (let xx = x; xx < x + rw; xx++) { k.set(xx, y, ch); k.set(xx, y + rh - 1, ch); } for (let yy = y; yy < y + rh; yy++) { k.set(x, yy, ch); k.set(x + rw - 1, yy, ch); } return k; },
      border(ch, t) { t = t || 1; for (let i = 0; i < t; i++) k.frame(i, i, w - i * 2, h - i * 2, ch); return k; },
      hline(x0, x1, y, ch, thick) { thick = thick || 1; for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let t = 0; t < thick; t++) k.set(x, y + t, ch); return k; },
      vline(x, y0, y1, ch, thick) { thick = thick || 1; for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let t = 0; t < thick; t++) k.set(x + t, y, ch); return k; },
      // Manhattan path through points (L-shaped segments), width thick.
      path(pts, ch, thick) {
        for (let i = 0; i < pts.length - 1; i++) {
          const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
          k.hline(x0, x1, y0, ch, thick);
          k.vline(x1, y0, y1, ch, thick);
        }
        return k;
      },
      // Replace only cells currently equal to `onlyOn` (string of allowed chars).
      scatter(ch, n, seed, region, onlyOn) {
        const r = RB.util.rng(seed || 1);
        const [rx, ry, rw, rh] = region || [0, 0, w, h];
        let placed = 0, tries = 0;
        while (placed < n && tries < n * 30) {
          tries++;
          const x = rx + r.int(rw), y = ry + r.int(rh);
          if (onlyOn && onlyOn.indexOf(k.get(x, y)) < 0) continue;
          k.set(x, y, ch);
          placed++;
        }
        return k;
      },
      // Irregular edge of `ch` along a side, depth 1..maxDepth (natural shorelines/forest edges).
      ragged(side, ch, maxDepth, seed) {
        const r = RB.util.rng(seed || 7);
        const len = side === 'top' || side === 'bottom' ? w : h;
        let d = 1 + r.int(maxDepth);
        for (let i = 0; i < len; i++) {
          if (r() < 0.35) d = Math.max(1, Math.min(maxDepth, d + (r() < 0.5 ? -1 : 1)));
          for (let j = 0; j < d; j++) {
            if (side === 'top') k.set(i, j, ch);
            if (side === 'bottom') k.set(i, h - 1 - j, ch);
            if (side === 'left') k.set(j, i, ch);
            if (side === 'right') k.set(w - 1 - j, i, ch);
          }
        }
        return k;
      },
      // Replace every `from` char inside region with `to`.
      swap(from, to, region) {
        const [rx, ry, rw, rh] = region || [0, 0, w, h];
        for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) if (k.get(x, y) === from) k.set(x, y, to);
        return k;
      },
      stamp(x, y, rows) { rows.forEach((row, dy) => { for (let dx = 0; dx < row.length; dx++) if (row[dx] !== '?') k.set(x + dx, y + dy, row[dx]); }); return k; },
      rows() { return g.map((r) => r.join('')); },
    };
    return k;
  }
  function build(w, h, fill, fn) {
    const k = make(w, h, fill);
    fn(k);
    return k.rows();
  }
  // Standard interior room: walls around, floor inside, door gap at bottom.
  function room(w, h, floor, doorX) {
    return build(w, h, '#', (k) => {
      k.rect(1, 2, w - 2, h - 3, floor || '_');
      if (doorX != null) k.set(doorX, h - 1, floor || '_');
    });
  }
  return { make, build, room };
})();
