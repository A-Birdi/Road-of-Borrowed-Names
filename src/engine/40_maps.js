/* Map compilation. Maps are authored as ASCII terrain plus structures,
 * props, NPCs, exits and triggers (see docs/CONTENT.md). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.maps = (function () {
  'use strict';
  const compiled = {};

  function compile(id) {
    if (compiled[id]) return compiled[id];
    const def = RB.content.maps[id];
    if (!def) throw new Error('Unknown map ' + id);
    const legend = Object.assign({}, RB.tiles.LEGEND, def.legend || {});
    const rows = def.terrain;
    const h = rows.length;
    const w = Math.max.apply(null, rows.map((r) => r.length));
    const tiles = new Array(w * h);
    const block = new Uint8Array(w * h);
    const props = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const ch = rows[y][x] == null ? ' ' : rows[y][x];
        const L = legend[ch] || legend['.'];
        const tile = RB.tiles.T[L.tile] || RB.tiles.T.grass;
        tiles[y * w + x] = tile;
        if (!tile.walk) block[y * w + x] = 1;
        if (L.prop) {
          const pd = RB.props.P[L.prop];
          props.push({ p: L.prop, x, y, auto: true });
          if (pd && pd.block) block[y * w + x] = 1;
        }
      }
    }
    const exits = [];
    const shut = []; // doors of buildings you cannot enter: solid, and they say so
    const structs = (def.structs || []).map((s) => Object.assign({}, s));
    for (const s of structs) {
      for (let yy = s.y; yy < s.y + s.h; yy++)
        for (let xx = s.x; xx < s.x + s.w; xx++) if (xx >= 0 && yy >= 0 && xx < w && yy < h) block[yy * w + xx] = 1;
      if (s.door != null) {
        const dx = s.x + s.door, dy = s.y + s.h - 1;
        if (s.to) {
          block[dy * w + dx] = 0;
          exits.push({ x: dx, y: dy, w: 1, h: 1, to: s.to, tx: s.spawn ? s.spawn[0] : null, ty: s.spawn ? s.spawn[1] : null, dir: 'up', door: true, if: s.if, locked: s.locked });
        } else shut.push({ x: dx, y: dy, if: s.if, text: s.shut || null });
      }
    }
    for (const p of def.props || []) {
      const pd = RB.props.P[p.p];
      if (!pd) { console.warn('unknown prop', p.p, 'in', id); continue; }
      props.push(Object.assign({}, p));
      if (p.if) continue; // conditional props block dynamically (see blockedStatic)
      if (pd.block && p.block !== false) {
        const pw = p.w || pd.w, ph = p.h || pd.h;
        for (let yy = p.y; yy < p.y + ph; yy++) for (let xx = p.x; xx < p.x + pw; xx++) if (xx < w && yy < h) block[yy * w + xx] = 1;
      }
    }
    for (const e of def.exits || []) exits.push(Object.assign({ w: 1, h: 1 }, e));
    const m = {
      id, def, w, h, tiles, block, props, structs, exits, shut,
      region: def.region || 'reedwake',
      triggers: (def.triggers || []).map((t) => Object.assign({ w: 1, h: 1 }, t)),
      staticLayer: null,
      staticKey: null,
    };
    compiled[id] = m;
    return m;
  }

  function tileAt(m, x, y) {
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return null;
    return m.tiles[y * m.w + x];
  }
  // Static blocking plus conditional props that are currently present.
  function blockedStatic(m, x, y) {
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return true;
    if (m.block[y * m.w + x]) return true;
    const s = RB.game && RB.game.s;
    if (!s) return false;
    for (const p of m.props) {
      if (!p.if) continue;
      const pd = RB.props.P[p.p];
      if (!pd || !pd.block || p.block === false) continue;
      const pw = p.w || pd.w, ph = p.h || pd.h;
      if (x >= p.x && x < p.x + pw && y >= p.y && y < p.y + ph && RB.state.test(s, p.if)) return true;
    }
    return false;
  }
  function exitAt(m, x, y) {
    const s = RB.game && RB.game.s;
    for (const e of m.exits) {
      if (x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h) {
        if (e.if && s && !RB.state.test(s, e.if)) continue;
        return e;
      }
    }
    return null;
  }
  // The shut door of a building with no interior at x,y (if that building is there now).
  function shutDoorAt(m, x, y) {
    const s = RB.game && RB.game.s;
    for (const d of m.shut || []) if (d.x === x && d.y === y && (!d.if || !s || RB.state.test(s, d.if))) return d;
    return null;
  }
  function invalidate() {
    for (const k in compiled) delete compiled[k];
  }
  return { compile, tileAt, blockedStatic, exitAt, shutDoorAt, invalidate };
})();
