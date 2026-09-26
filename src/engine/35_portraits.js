/* Procedural 48×48 portraits with expressions. Parameters come from the
 * character definition (portrait: {...}) so each named character has a
 * distinct face, hair and accessories rather than a palette swap. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.portraits = (function () {
  'use strict';
  const S = 48;
  const cache = new Map();

  function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function E(c, x, y, rx, ry, col, a0, a1) {
    c.fillStyle = col;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, a0 || 0, a1 == null ? Math.PI * 2 : a1);
    c.fill();
  }
  function poly(c, pts, col) {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.closePath();
    c.fill();
  }

  function paramsFor(id) {
    const ch = RB.content.chars[id];
    if (!ch) return null;
    if (ch.portrait) return Object.assign({}, fromLook(ch.look || {}), ch.portrait);
    return fromLook(ch.look || RB.sprites.randomLook(RB.util.hashStr(id)));
  }
  function fromLook(look) {
    const col = RB.sprites.colorsOf(look);
    return {
      skin: col.skin, hair: col.hair, cloth: col.cloth, style: look.hair || 'short',
      acc: (look.acc || []).slice(), eyes: 'round', bg: '#2a3048', age: look.age || 'adult',
      scarfCol: look.scarfCol, ribbonCol: look.ribbonCol, hatCol: look.hatCol, wrapCol: look.wrapCol, hoodCol: look.hoodCol,
    };
  }

  function drawFace(c, p, expr) {
    const [sk, sd] = p.skin;
    const [h0, h1, h2] = p.hair;
    const [cm, cs, ca] = p.cloth;
    const old = p.age === 'old';
    // background
    const g = c.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, p.bg || '#2a3048');
    g.addColorStop(1, '#10121c');
    // (background drawn separately onto the display canvas so outline ignores it)
    // hair back layer
    const st = p.style;
    if (st === 'long' || st === 'wavy') { E(c, 24, 26, 16, 18, h1); R(c, 8, 26, 32, 16, h1); }
    if (st === 'bob') E(c, 24, 24, 15, 15, h1);
    if (st === 'twintails') { E(c, 7, 30, 4, 10, h0); E(c, 41, 30, 4, 10, h0); }
    if (st === 'ponytail') E(c, 38, 20, 5, 8, h1);
    if (st === 'braid') { R(c, 34, 28, 5, 16, h0); for (let i = 0; i < 4; i++) R(c, 34, 30 + i * 4, 5, 1, h1); }
    if (st === 'curly') { E(c, 24, 20, 17, 15, h0); }
    // shoulders / clothing
    poly(c, [4, 48, 8, 38, 17, 34, 31, 34, 40, 38, 44, 48], cm);
    poly(c, [4, 48, 8, 38, 12, 37, 10, 48], cs);
    poly(c, [44, 48, 40, 38, 36, 37, 38, 48], cs);
    // neck
    R(c, 20, 31, 8, 6, sd);
    // collar variants
    if (p.collar === 'high') { poly(c, [16, 34, 20, 30, 28, 30, 32, 34, 28, 38, 20, 38], cs); R(c, 16, 34, 16, 1, ca); }
    else if (p.collar === 'apron') { R(c, 17, 38, 14, 10, '#ece4d4'); R(c, 18, 36, 2, 3, '#ece4d4'); R(c, 28, 36, 2, 3, '#ece4d4'); }
    else { poly(c, [18, 35, 24, 41, 30, 35], sd); R(c, 17, 34, 14, 1, ca); }
    // face
    E(c, 24, 21, 11, 13, sk);
    E(c, 24, 29, 8, 5, sk);
    R(c, 13, 20, 1, 5, sd); R(c, 34, 20, 1, 5, sd);
    // ears
    E(c, 13, 22, 2, 3, sk); E(c, 35, 22, 2, 3, sk);
    // eyes
    const ex = [19, 29], ey = 22;
    const dark = '#231a24';
    const iris = p.iris || '#3a2a30';
    for (const x of ex) {
      if (expr === 'laugh' || expr === 'smile2') { R(c, x - 2, ey + 1, 1, 1, dark); R(c, x - 1, ey, 3, 1, dark); R(c, x + 2, ey + 1, 1, 1, dark); continue; }
      if (expr === 'tired' || expr === 'think2') { R(c, x - 2, ey + 1, 5, 1, dark); R(c, x - 1, ey + 2, 3, 1, iris); continue; }
      if (expr === 'closed' || expr === 'sad2') { R(c, x - 2, ey + 1, 5, 1, dark); continue; }
      const big = expr === 'surprise';
      if (p.eyes === 'narrow' || p.eyes === 'sharp') {
        R(c, x - 2, ey, 5, 1, dark);
        R(c, x - 1, ey + 1, 3, big ? 3 : 2, iris);
        R(c, x, ey + 1, 1, 1, '#ffffff');
        if (p.eyes === 'sharp') R(c, x + (x < 24 ? -3 : 3), ey - 1, 1, 1, dark);
      } else if (p.eyes === 'soft') {
        R(c, x - 1, ey, 3, big ? 4 : 3, iris);
        R(c, x - 2, ey - 1, 5, 1, dark);
        R(c, x, ey, 1, 1, '#ffffff');
        R(c, x - 1, ey + (big ? 4 : 3), 3, 1, sd);
      } else {
        R(c, x - 1, ey - 1, 3, big ? 5 : 4, iris);
        R(c, x - 2, ey - 1, 5, 1, dark);
        R(c, x, ey, 1, 1, '#ffffff');
      }
      if (expr === 'shy') R(c, x - 1, ey + 2, 3, 1, iris);
    }
    if (p.acc.includes('glasses')) {
      c.strokeStyle = p.glassCol || '#2a2a2a'; c.lineWidth = 1;
      c.strokeRect(15.5, 19.5, 8, 6); c.strokeRect(25.5, 19.5, 8, 6);
      R(c, 23, 21, 3, 1, p.glassCol || '#2a2a2a');
    }
    // brows
    const bc = old ? '#d8d4d0' : h0;
    const brow = (x, dir) => {
      // dir: 0 flat, 1 worried (inner up), -1 angry (inner down)
      const inner = x < 24 ? x + 2 : x - 2;
      const outer = x < 24 ? x - 3 : x + 3;
      const by = 17 + (p.browY || 0);
      if (dir === 0) R(c, Math.min(inner, outer), by, 5, 1, bc);
      else {
        R(c, Math.min(inner, outer) + (x < 24 ? 0 : 3), by + (dir > 0 ? 1 : -1) * (x < 24 ? 1 : 0) + (dir > 0 ? 0 : 1), 2, 1, bc);
        R(c, Math.min(inner, outer) + (x < 24 ? 3 : 0), by + (dir > 0 ? -1 : 1) * (x < 24 ? 1 : 0), 2, 1, bc);
        R(c, Math.min(inner, outer) + (x < 24 ? 2 : 1), by, 2, 1, bc);
      }
    };
    const bd = expr === 'worry' || expr === 'sad' || expr === 'shy' ? 1 : expr === 'angry' ? -1 : 0;
    brow(19, bd); brow(29, expr === 'think' ? 1 : bd);
    // nose
    R(c, 24, 25, 1, 2, sd);
    // blush
    if (expr === 'shy' || expr === 'laugh' || p.blush) { R(c, 16, 27, 3, 1, '#e8908080'); R(c, 29, 27, 3, 1, '#e8908080'); }
    // mouth
    const mc = '#7a3a3a';
    switch (expr) {
      case 'smile': case 'smile2': R(c, 21, 30, 1, 1, mc); R(c, 22, 31, 4, 1, mc); R(c, 26, 30, 1, 1, mc); break;
      case 'laugh': R(c, 21, 30, 6, 1, mc); R(c, 22, 31, 4, 2, '#5a2020'); break;
      case 'sad': case 'sad2': R(c, 22, 31, 4, 1, mc); R(c, 21, 32, 1, 1, mc); R(c, 26, 32, 1, 1, mc); break;
      case 'angry': R(c, 21, 31, 6, 1, mc); break;
      case 'surprise': E(c, 24, 31, 1.6, 2, '#5a2020'); break;
      case 'worry': R(c, 22, 31, 3, 1, mc); R(c, 25, 30, 1, 1, mc); break;
      case 'think': case 'think2': R(c, 23, 31, 3, 1, mc); break;
      case 'tired': R(c, 22, 31, 4, 1, mc); break;
      case 'smirk': R(c, 22, 31, 3, 1, mc); R(c, 25, 30, 2, 1, mc); break;
      default: R(c, 22, 31, 4, 1, mc);
    }
    if (p.mole) R(c, 30, 28, 1, 1, '#4a2a2a');
    if (old) { R(c, 16, 26, 2, 1, sd); R(c, 30, 26, 2, 1, sd); R(c, 18, 15, 12, 1, sd); }
    if (p.scar) { R(c, 30, 18, 1, 5, '#c89080'); }
    if (p.beard) { E(c, 24, 32, 8, 5, p.beard === true ? h1 : p.beard); R(c, 22, 30, 4, 1, mc); }
    // hair front
    if (st === 'wrap') {
      E(c, 24, 14, 13, 8, p.wrapCol || ca);
      R(c, 11, 14, 26, 4, p.wrapCol || ca);
      R(c, 14, 12, 20, 1, '#ffffff30');
    } else if (st === 'shaved') {
      E(c, 24, 12, 11, 5, h1);
    } else if (st !== 'bald') {
      E(c, 24, 12, 13, 8, h0);
      R(c, 11, 12, 26, 5, h0);
      // bangs
      if (st === 'spiky') { poly(c, [11, 16, 14, 4, 17, 14, 20, 2, 24, 13, 28, 2, 31, 14, 34, 4, 37, 16], h0); }
      else if (st === 'curly') { for (let i = 0; i < 7; i++) E(c, 12 + i * 4, 15 + (i % 2), 3, 3, h0); E(c, 10, 22, 3, 5, h0); E(c, 38, 22, 3, 5, h0); }
      else if (p.parted) { poly(c, [11, 20, 12, 12, 24, 9, 22, 15, 16, 17, 13, 22], h0); poly(c, [37, 20, 36, 12, 25, 9, 28, 15, 34, 17, 35, 22], h0); }
      else { poly(c, [11, 19, 12, 12, 36, 12, 37, 19, 33, 15, 30, 18, 27, 15, 23, 18, 19, 15, 15, 18], h0); }
      if (st === 'bob' || st === 'long' || st === 'wavy' || st === 'twintails' || st === 'braid') { R(c, 10, 14, 4, st === 'bob' ? 16 : 20, h0); R(c, 34, 14, 4, st === 'bob' ? 16 : 20, h0); }
      if (st === 'bun') { E(c, 24, 4, 6, 5, h0); E(c, 23, 3, 2, 1, h2); if (p.pins) { R(c, 29, 2, 5, 1, '#e0c070'); R(c, 15, 5, 4, 1, '#e0c070'); } }
      if (st === 'ponytail') { R(c, 34, 12, 4, 6, h0); }
      if (st === 'short' || st === 'spiky') { R(c, 11, 14, 3, 8, h0); R(c, 34, 14, 3, 8, h0); }
      // highlight
      R(c, 17, 7, 6, 1, h2); R(c, 15, 9, 3, 1, h2);
    }
    // accessories
    for (const a of p.acc) {
      if (a === 'scarf') {
        const sc = p.scarfCol || '#c8962e';
        poly(c, [10, 40, 14, 33, 24, 36, 34, 33, 38, 40, 30, 43, 18, 43], sc);
        R(c, 30, 40, 6, 8, sc);
        R(c, 14, 36, 20, 1, '#ffffff30');
        R(c, 31, 44, 4, 1, '#00000030');
      }
      if (a === 'satchel') { poly(c, [12, 38, 15, 36, 36, 48, 32, 48], '#6a4a2a'); }
      if (a === 'ribbon') { const rc = p.ribbonCol || '#c8687a'; poly(c, [30, 6, 38, 2, 37, 10], rc); poly(c, [30, 6, 34, 12, 38, 16], rc); E(c, 31, 7, 2, 2, rc); }
      if (a === 'flower') { E(c, 34, 10, 3, 3, p.flowerCol || '#f4a6a0'); E(c, 34, 10, 1, 1, '#fff4c0'); }
      if (a === 'headband') R(c, 11, 11, 26, 2, p.bandCol || ca);
      if (a === 'hat') { const hc = p.hatCol || '#8a6a44'; E(c, 24, 10, 20, 4, hc); E(c, 24, 6, 10, 6, hc); R(c, 14, 8, 20, 1, '#00000030'); }
      if (a === 'hood') { const hc = p.hoodCol || cs; poly(c, [8, 40, 9, 14, 24, 2, 39, 14, 40, 40, 36, 36, 35, 16, 24, 8, 13, 16, 12, 36], hc); }
      if (a === 'earrings') { R(c, 12, 25, 1, 2, '#e8c860'); R(c, 35, 25, 1, 2, '#e8c860'); }
      if (a === 'lamp') { E(c, 42, 42, 5, 5, '#ffd27a60'); R(c, 40, 38, 5, 7, '#3a3440'); R(c, 41, 39, 3, 5, '#ffd27a'); }
      if (a === 'bottles') { R(c, 38, 40, 3, 6, '#6ab0a0'); R(c, 38, 39, 3, 1, '#ddd'); R(c, 7, 41, 3, 5, '#c8a0d0'); }
      if (a === 'patches') { R(c, 9, 42, 4, 4, '#8a7a5a'); R(c, 36, 44, 3, 3, '#6a7a8a'); R(c, 9, 42, 4, 1, '#ffffff30'); }
      if (a === 'pencil') { poly(c, [34, 12, 40, 6, 41, 7, 35, 13], '#e0b040'); }
      if (a === 'cape') { poly(c, [2, 48, 6, 36, 12, 36, 10, 48], p.capeCol || '#6a3a4a'); poly(c, [46, 48, 42, 36, 36, 36, 38, 48], p.capeCol || '#6a3a4a'); }
      if (a === 'pin') { R(c, 16, 38, 3, 3, '#e0c070'); }
      if (a === 'goggles') { R(c, 12, 10, 24, 3, '#5a4a3a'); E(c, 19, 11, 3, 3, '#8fb8b0'); E(c, 29, 11, 3, 3, '#8fb8b0'); }
    }
    if (p.extra) p.extra(c, expr);
  }

  function threshold(c) {
    const img = c.getImageData(0, 0, S, S);
    const d = img.data;
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] < 110 ? 0 : 255;
    c.putImageData(img, 0, 0);
  }
  function outline(c) {
    const img = c.getImageData(0, 0, S, S);
    const d = img.data;
    const op = (x, y) => x >= 0 && y >= 0 && x < S && y < S && d[(y * S + x) * 4 + 3] > 0;
    const marks = [];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (!op(x, y) && (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1))) marks.push((y * S + x) * 4);
    for (const o of marks) { d[o] = 26; d[o + 1] = 20; d[o + 2] = 28; d[o + 3] = 255; }
    c.putImageData(img, 0, 0);
  }

  function build(p, expr, keyStr) {
    if (cache.has(keyStr)) return cache.get(keyStr);
    const cv = RB.sprites.makeCanvas(S, S);
    const c = cv.getContext('2d', { willReadFrequently: true });
    drawFace(c, p, expr || 'neutral');
    threshold(c);
    outline(c);
    cache.set(keyStr, cv);
    if (cache.size > 300) cache.delete(cache.keys().next().value);
    return cv;
  }
  function paint(target, img, bg) {
    const c = target.getContext('2d');
    target.width = S; target.height = S;
    const g = c.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, bg || '#2a3048');
    g.addColorStop(1, '#0e1018');
    c.fillStyle = g;
    c.fillRect(0, 0, S, S);
    c.drawImage(img, 0, 0);
  }
  function draw(target, id, expr) {
    const p = paramsFor(id);
    if (!p) return;
    paint(target, build(p, expr, id + '|' + expr), p.bg);
  }
  function drawPlayer(target, look, expr) {
    const p = fromLook(look);
    p.bg = '#2e3a34';
    p.acc = (look.acc || []).filter((a) => a !== 'satchel' || true);
    paint(target, build(p, expr, 'pc|' + JSON.stringify(look) + '|' + expr), p.bg);
  }
  function image(id, expr) {
    const p = paramsFor(id);
    return p ? build(p, expr, id + '|' + expr) : null;
  }
  return { draw, drawPlayer, image, fromLook, S };
})();
