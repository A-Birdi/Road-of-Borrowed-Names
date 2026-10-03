/* Character sprites: layered procedural pixel art (16×24) with automatic
 * outline. Looks are plain data so the player, companions and NPCs share one
 * vocabulary while keeping distinct silhouettes via hair, outfit shape,
 * size and accessories. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.sprites = (function () {
  'use strict';
  const W = 16, H = 24;
  const SKIN = [
    ['#f6dcc4', '#e4bea0'], ['#eec8a4', '#d8a882'], ['#dcae84', '#c28e64'],
    ['#c08a5e', '#a06e46'], ['#9a6a44', '#7e5234'], ['#74492e', '#5c3822'], ['#553522', '#422818'],
  ];
  const HAIR = [
    ['#1e1a1c', '#35302e', '#4a4442'], ['#3b2a20', '#553d2e', '#6e5240'], ['#6a4428', '#855a38', '#a0724a'],
    ['#8e3e22', '#aa5230', '#c86a42'], ['#c8962e', '#e0b048', '#f0cc70'], ['#8a8a90', '#a8a8ae', '#c8c8cc'],
    ['#e4e0dc', '#f4f2ee', '#ffffff'], ['#1e2a44', '#2e3e5e', '#44587c'], ['#2c6a6a', '#3a8484', '#52a0a0'],
    ['#5a2e4e', '#723e64', '#8e5480'],
  ];
  const HAIR_NAMES = ['black', 'dark brown', 'brown', 'auburn', 'gold', 'grey', 'white', 'blue-black', 'teal', 'plum'];
  const CLOTH = [
    ['#4a6a9a', '#38527a', '#e0c068'], ['#9a4a3e', '#7a3a30', '#e8d8b0'], ['#4e7a4a', '#3c5e38', '#d8b060'],
    ['#7a5a8a', '#5e446c', '#e0c8a0'], ['#c08a3a', '#9a6c2a', '#5a3a2a'], ['#3e4450', '#2c3038', '#b8a070'],
    ['#d8d0bc', '#b8ae98', '#6a8aa8'], ['#2e6a6e', '#225256', '#e8b070'],
  ];
  const PANTS = ['#3a3440', '#4a3e34', '#2e3a4a', '#5a4a3a'];
  const HAIRSTYLES = ['short', 'bob', 'long', 'ponytail', 'bun', 'curly', 'spiky', 'braid', 'shaved', 'twintails', 'wavy', 'wrap'];
  const ACCESSORIES = ['scarf', 'satchel', 'glasses', 'headband', 'flower', 'hat', 'earrings', 'cape'];

  const cache = new Map();
  function key(look, dir, frame) {
    return JSON.stringify(look) + '|' + dir + '|' + frame;
  }

  function colorsOf(look) {
    const skin = typeof look.skin === 'number' ? SKIN[look.skin] || SKIN[2] : look.skin;
    const hair = typeof look.hairColor === 'number' ? HAIR[look.hairColor] || HAIR[0] : look.hairColor;
    const cloth = look.cloth || CLOTH[look.outfit || 0] || CLOTH[0];
    const pants = look.pants || PANTS[(look.outfit || 0) % PANTS.length];
    return { skin, hair, cloth, pants, boots: look.boots || '#2e2420' };
  }

  // ---- drawing helpers ----------------------------------------------------
  function R(c, x, y, w, h, col) {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  }

  function drawBody(c, look, col, dir, frame) {
    const long = look.shape === 'robe' || look.shape === 'dress';
    const coat = look.shape === 'coat';
    const small = look.size === 'child';
    const oy = small ? 4 : 0;
    const step = frame === 1 ? 1 : frame === 2 ? -1 : 0; // leg offset
    const [cm, cs, ca] = col.cloth;
    if (dir === 'down' || dir === 'up') {
      // legs
      const ly = 19 + oy;
      const lh = small ? 2 : 3;
      if (!long) {
        R(c, 5, ly, 3, lh + (step > 0 ? -1 : 0), col.pants);
        R(c, 8, ly, 3, lh + (step < 0 ? -1 : 0), col.pants);
        R(c, 5, ly + lh - (step > 0 ? 1 : 0), 3, 2, col.boots);
        R(c, 8, ly + lh - (step < 0 ? 1 : 0), 3, 2, col.boots);
      } else {
        R(c, 4, ly - 1, 8, lh + 1, cm);
        R(c, 4, ly - 1, 1, lh + 1, cs);
        R(c, 11, ly - 1, 1, lh + 1, cs);
        R(c, 5 + (step > 0 ? 0 : 0), ly + lh, 2, 2, col.boots);
        R(c, 9, ly + lh, 2, 2, col.boots);
        if (step) R(c, step > 0 ? 5 : 9, ly + lh, 2, 1, cs);
      }
      // torso
      const ty = 13 + oy;
      const th = small ? 5 : 6;
      R(c, 4, ty, 8, th, cm);
      R(c, 4, ty, 1, th, cs);
      R(c, 11, ty, 1, th, cs);
      if (coat) { R(c, 3, ty + 2, 1, th + 3, cs); R(c, 12, ty + 2, 1, th + 3, cs); R(c, 4, ty + th, 8, 2, cm); }
      if (dir === 'down') {
        R(c, 7, ty, 2, 1, col.skin[1]); // collar
        R(c, 4, ty + th - 2, 8, 1, ca); // belt/sash
        if (look.shape === 'apron') { R(c, 5, ty + 1, 6, th + 2, '#ece4d4'); R(c, 5, ty + 1, 6, 1, '#d4c8b0'); }
        if (coat) { R(c, 7, ty + 1, 2, th + 1, cs); R(c, 5, ty + 2, 1, 1, ca); R(c, 10, ty + 3, 1, 1, ca); }
      } else {
        R(c, 4, ty + th - 2, 8, 1, ca);
      }
      // arms swing
      const as = frame === 0 ? 0 : frame === 1 ? 1 : -1;
      R(c, 3, ty + 1 + (as > 0 ? 1 : 0), 1, 4, cm);
      R(c, 12, ty + 1 + (as < 0 ? 1 : 0), 1, 4, cm);
      R(c, 3, ty + 5 + (as > 0 ? 1 : 0), 1, 1, col.skin[0]);
      R(c, 12, ty + 5 + (as < 0 ? 1 : 0), 1, 1, col.skin[0]);
      // neck
      R(c, 7, ty - 1, 2, 1, col.skin[1]);
    } else {
      // side view (facing right; left is mirrored by caller)
      const ly = 19 + oy;
      const lh = small ? 2 : 3;
      if (!long) {
        const a = frame === 0 ? 0 : frame === 1 ? 1 : -1;
        R(c, 6 + a, ly, 2, lh, col.pants);
        R(c, 8 - a, ly, 2, lh, col.pants);
        R(c, 6 + a, ly + lh, 3, 2, col.boots);
        R(c, 8 - a, ly + lh, 3, 2, col.boots);
      } else {
        R(c, 5, ly - 1, 6, lh + 1, cm);
        R(c, 5, ly - 1, 1, lh + 1, cs);
        const a = frame === 0 ? 0 : frame === 1 ? 1 : -1;
        R(c, 6 + a, ly + lh, 3, 2, col.boots);
        R(c, 8 - a, ly + lh, 2, 2, col.boots);
      }
      const ty = 13 + oy;
      const th = small ? 5 : 6;
      R(c, 5, ty, 6, th, cm);
      R(c, 5, ty, 1, th, cs);
      if (coat) { R(c, 4, ty + 2, 1, th + 3, cs); R(c, 5, ty + th, 6, 2, cm); }
      R(c, 5, ty + th - 2, 6, 1, ca);
      if (look.shape === 'apron') R(c, 9, ty + 1, 2, th + 2, '#ece4d4');
      const as = frame === 0 ? 0 : frame === 1 ? 1 : -1;
      R(c, 7 + as, ty + 1, 2, 4, cs);
      R(c, 7 + as, ty + 5, 2, 1, col.skin[0]);
      R(c, 8, ty - 1, 2, 1, col.skin[1]);
    }
  }

  function drawHead(c, look, col, dir, blink) {
    const oy = look.size === 'child' ? 4 : 0;
    const [sk, sd] = col.skin;
    if (dir === 'down') {
      R(c, 4, 4 + oy, 8, 8, sk);
      R(c, 5, 3 + oy, 6, 1, sk);
      R(c, 5, 12 + oy, 6, 1, sd);
      R(c, 4, 11 + oy, 1, 1, sd);
      R(c, 11, 11 + oy, 1, 1, sd);
      if (!blink) {
        R(c, 6, 8 + oy, 1, 2, '#2a2024');
        R(c, 9, 8 + oy, 1, 2, '#2a2024');
      } else {
        R(c, 6, 9 + oy, 1, 1, '#2a2024');
        R(c, 9, 9 + oy, 1, 1, '#2a2024');
      }
      R(c, 5, 10 + oy, 1, 1, '#e89a8a80');
      R(c, 10, 10 + oy, 1, 1, '#e89a8a80');
    } else if (dir === 'up') {
      R(c, 4, 4 + oy, 8, 8, sk);
      R(c, 5, 3 + oy, 6, 1, sk);
      R(c, 5, 12 + oy, 6, 1, sd);
    } else {
      R(c, 5, 4 + oy, 7, 8, sk);
      R(c, 6, 3 + oy, 5, 1, sk);
      R(c, 12, 8 + oy, 1, 2, sk); // nose
      R(c, 6, 12 + oy, 5, 1, sd);
      if (!blink) R(c, 10, 8 + oy, 1, 2, '#2a2024');
      else R(c, 10, 9 + oy, 1, 1, '#2a2024');
      R(c, 10, 10 + oy, 1, 1, '#e89a8a80');
    }
  }

  // Hair styles: back layer (drawn before head) and front layer (after).
  function hairBack(c, look, col, dir) {
    const oy = look.size === 'child' ? 4 : 0;
    const [h0, h1] = col.hair;
    const st = look.hair;
    if (dir === 'down') {
      if (st === 'long' || st === 'wavy') { R(c, 3, 5 + oy, 10, 11, h1); }
      if (st === 'twintails') { R(c, 2, 6 + oy, 2, 8, h0); R(c, 12, 6 + oy, 2, 8, h0); }
    } else if (dir === 'up') {
      if (st === 'long' || st === 'wavy') R(c, 3, 5 + oy, 10, 12, h0);
    } else {
      if (st === 'long' || st === 'wavy') R(c, 3, 5 + oy, 5, 11, h1);
      if (st === 'ponytail') { R(c, 2, 6 + oy, 3, 2, h0); R(c, 2, 8 + oy, 2, 5, h0); }
      if (st === 'twintails') R(c, 3, 7 + oy, 2, 7, h0);
      if (st === 'braid') { R(c, 3, 7 + oy, 2, 8, h0); R(c, 3, 9 + oy, 2, 1, h1); R(c, 3, 12 + oy, 2, 1, h1); }
    }
  }
  function hairFront(c, look, col, dir) {
    const oy = look.size === 'child' ? 4 : 0;
    const [h0, h1, h2] = col.hair;
    const st = look.hair;
    const y = (v) => v + oy;
    if (st === 'wrap') {
      const cc = look.wrapCol || col.cloth[2];
      if (dir === 'side') { R(c, 4, y(2), 8, 5, cc); R(c, 3, y(5), 2, 5, cc); }
      else { R(c, 3, y(2), 10, 5, cc); R(c, 3, y(6), 1, 3, cc); R(c, 12, y(6), 1, 3, cc); if (dir === 'up') R(c, 4, y(6), 8, 5, cc); }
      R(c, 4, y(3), 8, 1, '#ffffff30');
      return;
    }
    if (st === 'shaved') {
      if (dir === 'side') R(c, 5, y(3), 6, 2, h1);
      else R(c, 4, y(3), 8, 2, h1);
      if (dir === 'up') R(c, 4, y(5), 8, 3, h1);
      return;
    }
    if (dir === 'down') {
      // crown
      R(c, 4, y(2), 8, 3, h0);
      R(c, 3, y(4), 10, 2, h0);
      R(c, 5, y(2), 3, 1, h2);
      // bangs
      if (st === 'spiky') { R(c, 4, y(6), 1, 2, h0); R(c, 6, y(6), 1, 1, h0); R(c, 8, y(6), 2, 2, h0); R(c, 11, y(6), 1, 2, h0); R(c, 5, y(1), 1, 1, h0); R(c, 8, y(1), 1, 1, h0); R(c, 10, y(1), 1, 1, h0); }
      else if (st === 'curly') { R(c, 2, y(3), 12, 4, h0); R(c, 2, y(7), 2, 4, h0); R(c, 12, y(7), 2, 4, h0); R(c, 4, y(6), 8, 1, h1); R(c, 3, y(2), 1, 1, h1); R(c, 12, y(2), 1, 1, h1); }
      else { R(c, 4, y(6), 8, 1, h0); R(c, 4, y(7), 2, 1, h0); R(c, 10, y(7), 2, 1, h0); R(c, 7, y(7), 1, 1, h0); }
      // sides
      if (st === 'bob') { R(c, 3, y(6), 2, 6, h0); R(c, 11, y(6), 2, 6, h0); }
      if (st === 'long' || st === 'wavy') { R(c, 3, y(6), 1, 9, h0); R(c, 12, y(6), 1, 9, h0); if (st === 'wavy') { R(c, 2, y(12), 1, 2, h0); R(c, 13, y(12), 1, 2, h0); } }
      if (st === 'short' || st === 'ponytail' || st === 'bun' || st === 'braid' || st === 'spiky') { R(c, 3, y(6), 1, 3, h0); R(c, 12, y(6), 1, 3, h0); }
      if (st === 'bun') { R(c, 6, y(0), 4, 2, h0); R(c, 7, y(0), 2, 1, h2); }
      if (st === 'braid') { R(c, 12, y(8), 2, 6, h0); R(c, 12, y(10), 2, 1, h1); R(c, 12, y(13), 2, 1, h2); }
      if (st === 'twintails') { R(c, 3, y(6), 1, 2, h0); R(c, 12, y(6), 1, 2, h0); R(c, 2, y(5), 2, 2, col.cloth[2]); R(c, 12, y(5), 2, 2, col.cloth[2]); }
    } else if (dir === 'up') {
      R(c, 4, y(2), 8, 3, h0);
      R(c, 3, y(4), 10, 6, h0);
      R(c, 4, y(10), 8, 1, h1);
      R(c, 6, y(3), 3, 1, h2);
      if (st === 'spiky') { R(c, 5, y(1), 1, 1, h0); R(c, 8, y(1), 1, 1, h0); R(c, 10, y(1), 1, 1, h0); }
      if (st === 'curly') { R(c, 2, y(3), 12, 9, h0); R(c, 3, y(6), 2, 1, h1); R(c, 9, y(8), 2, 1, h1); }
      if (st === 'bob') R(c, 3, y(10), 10, 2, h0);
      if (st === 'ponytail') { R(c, 7, y(10), 2, 6, h0); R(c, 7, y(10), 2, 1, col.cloth[2]); }
      if (st === 'bun') { R(c, 6, y(1), 4, 3, h0); R(c, 6, y(2), 4, 1, h1); }
      if (st === 'braid') { R(c, 7, y(10), 2, 7, h0); R(c, 7, y(12), 2, 1, h1); R(c, 7, y(15), 2, 1, h1); }
      if (st === 'twintails') { R(c, 2, y(6), 2, 8, h0); R(c, 12, y(6), 2, 8, h0); }
      if (st === 'long' || st === 'wavy') R(c, 3, y(10), 10, 6, h0);
    } else {
      R(c, 5, y(2), 7, 3, h0);
      R(c, 4, y(4), 5, 5, h0);
      R(c, 9, y(4), 3, 2, h0);
      R(c, 11, y(5), 1, 2, h0);
      R(c, 6, y(2), 3, 1, h2);
      if (st === 'spiky') { R(c, 6, y(1), 1, 1, h0); R(c, 9, y(1), 1, 1, h0); R(c, 3, y(4), 1, 2, h0); }
      if (st === 'curly') { R(c, 3, y(2), 9, 9, h0); R(c, 10, y(4), 2, 3, h0); R(c, 4, y(5), 2, 1, h1); }
      if (st === 'bob') R(c, 4, y(6), 3, 6, h0);
      if (st === 'long' || st === 'wavy') R(c, 4, y(6), 3, 9, h0);
      if (st === 'bun') { R(c, 3, y(2), 3, 3, h0); R(c, 3, y(3), 3, 1, h1); }
      if (st === 'ponytail') R(c, 3, y(5), 2, 1, col.cloth[2]);
    }
  }

  function drawAccessories(c, look, col, dir, layer) {
    const oy = look.size === 'child' ? 4 : 0;
    const acc = look.acc || [];
    const y = (v) => v + oy;
    for (const a of acc) {
      if (layer === 'back') {
        if (a === 'cape') { if (dir === 'up') { R(c, 3, y(13), 10, 8, look.capeCol || '#6a3a4a'); R(c, 3, y(13), 10, 1, '#00000030'); } else if (dir === 'side') R(c, 3, y(13), 3, 8, look.capeCol || '#6a3a4a'); }
        if (a === 'satchel' && dir === 'side') R(c, 3, y(15), 3, 4, '#8a6a3a');
        if (a === 'lamp' && dir === 'up') R(c, 12, y(15), 3, 4, '#ffd27a');
        continue;
      }
      switch (a) {
        case 'scarf': {
          const sc = look.scarfCol || '#c8962e';
          if (dir === 'side') { R(c, 5, y(12), 6, 2, sc); R(c, 4, y(13), 2, 4, sc); }
          else { R(c, 4, y(12), 8, 2, sc); if (dir === 'down') R(c, 9, y(14), 2, 4, sc); else R(c, 5, y(14), 2, 3, sc); }
          R(c, dir === 'side' ? 6 : 5, y(12), 2, 1, '#ffffff30');
          break;
        }
        case 'satchel':
          if (dir === 'down') { R(c, 4, y(13), 1, 1, '#6a4a2a'); R(c, 5, y(14), 1, 1, '#6a4a2a'); R(c, 10, y(16), 4, 4, '#8a6a3a'); R(c, 10, y(16), 4, 1, '#a88a50'); if (look.bigSatchel) R(c, 10, y(15), 3, 1, '#e8e0cc'); }
          else if (dir === 'up') { R(c, 2, y(15), 4, 4, '#8a6a3a'); R(c, 11, y(13), 1, 2, '#6a4a2a'); }
          else { R(c, 7, y(13), 1, 4, '#6a4a2a'); }
          break;
        case 'glasses':
          if (dir === 'down') { R(c, 5, y(8), 3, 1, '#2a2a2a'); R(c, 8, y(8), 3, 1, '#2a2a2a'); R(c, 5, y(9), 1, 1, '#2a2a2a'); R(c, 10, y(9), 1, 1, '#2a2a2a'); }
          else if (dir === 'side') { R(c, 9, y(8), 3, 1, '#2a2a2a'); R(c, 11, y(9), 1, 1, '#2a2a2a'); }
          break;
        case 'headband': {
          const hc = look.bandCol || col.cloth[2];
          if (dir === 'side') R(c, 5, y(5), 7, 1, hc); else R(c, 3, y(5), 10, 1, hc);
          break;
        }
        case 'flower':
          if (dir !== 'up') { R(c, dir === 'side' ? 5 : 10, y(4), 2, 2, look.flowerCol || '#f4a6a0'); R(c, dir === 'side' ? 6 : 11, y(4), 1, 1, '#fff4c0'); }
          else R(c, 10, y(4), 2, 2, look.flowerCol || '#f4a6a0');
          break;
        case 'hat': {
          const hc = look.hatCol || '#8a6a44';
          R(c, 1, y(4), 14, 2, hc);
          R(c, 4, y(1), 8, 3, hc);
          R(c, 4, y(3), 8, 1, '#00000030');
          break;
        }
        case 'earrings':
          if (dir === 'down') { R(c, 3, y(10), 1, 1, '#e8c860'); R(c, 12, y(10), 1, 1, '#e8c860'); }
          else if (dir === 'side') R(c, 7, y(10), 1, 1, '#e8c860');
          break;
        case 'cape':
          if (dir === 'down') { R(c, 3, y(13), 1, 7, look.capeCol || '#6a3a4a'); R(c, 12, y(13), 1, 7, look.capeCol || '#6a3a4a'); R(c, 4, y(12), 8, 1, look.capeCol || '#6a3a4a'); }
          break;
        case 'lamp':
          if (dir === 'down') { R(c, 13, y(15), 1, 2, '#3a3440'); R(c, 12, y(17), 3, 3, '#ffd27a'); R(c, 12, y(17), 3, 1, '#3a3440'); }
          else if (dir === 'side') { R(c, 10, y(16), 1, 2, '#3a3440'); R(c, 9, y(18), 3, 3, '#ffd27a'); R(c, 9, y(18), 3, 1, '#3a3440'); }
          break;
        case 'ribbon': {
          const rc = look.ribbonCol || '#c85a6a';
          if (dir === 'down') { R(c, 9, y(2), 3, 2, rc); R(c, 11, y(4), 1, 3, rc); }
          else if (dir === 'up') { R(c, 4, y(2), 3, 2, rc); R(c, 4, y(4), 1, 5, rc); R(c, 6, y(4), 1, 4, rc); }
          else { R(c, 4, y(3), 3, 2, rc); R(c, 3, y(5), 1, 5, rc); }
          break;
        }
        case 'bottles':
          if (dir === 'down') { R(c, 4, y(17), 2, 2, '#6ab0a0'); R(c, 6, y(17), 1, 2, '#e0c070'); R(c, 10, y(17), 2, 2, '#c8a0d0'); }
          else if (dir === 'side') { R(c, 9, y(17), 2, 2, '#6ab0a0'); }
          break;
        case 'beard':
          if (dir === 'down') { R(c, 5, y(10), 6, 3, col.hair[1]); R(c, 6, y(13), 4, 1, col.hair[1]); }
          else if (dir === 'side') R(c, 8, y(10), 4, 3, col.hair[1]);
          break;
        case 'cane':
          if (dir === 'down') R(c, 13, y(15), 1, 8, '#6a4a2a');
          else if (dir === 'side') R(c, 12, y(14), 1, 9, '#6a4a2a');
          break;
        case 'basket':
          if (dir === 'down') { R(c, 1, y(16), 4, 3, '#b08a4a'); R(c, 1, y(15), 4, 1, '#8a6a3a'); }
          else if (dir === 'side') { R(c, 10, y(16), 4, 3, '#b08a4a'); }
          break;
        case 'book':
          if (dir === 'down') { R(c, 2, y(15), 3, 4, '#6a3a3a'); R(c, 2, y(15), 3, 1, '#e8e0c8'); }
          break;
        case 'hood': {
          const hc = look.hoodCol || col.cloth[1];
          if (dir === 'down') { R(c, 3, y(2), 10, 3, hc); R(c, 3, y(5), 1, 7, hc); R(c, 12, y(5), 1, 7, hc); }
          else if (dir === 'up') R(c, 3, y(2), 10, 11, hc);
          else { R(c, 4, y(2), 8, 3, hc); R(c, 3, y(4), 3, 9, hc); }
          break;
        }
        case 'patches':
          if (dir === 'down') { R(c, 5, y(15), 2, 2, '#8a7a5a'); R(c, 10, y(20), 1, 1, '#8a7a5a'); }
          else if (dir === 'up') { R(c, 8, y(14), 2, 2, '#8a7a5a'); }
          break;
        case 'toolbelt':
          if (dir === 'down') { R(c, 4, y(17), 8, 1, '#5a3a2a'); R(c, 10, y(17), 1, 3, '#9a9aa0'); R(c, 5, y(17), 1, 2, '#8a6a3a'); }
          break;
        case 'apronstrap':
          break;
      }
    }
  }

  // Auto outline: every transparent pixel next to an opaque one becomes outline.
  function outline(cv, colr) {
    const c = cv.getContext('2d');
    const img = c.getImageData(0, 0, cv.width, cv.height);
    const d = img.data;
    const w = cv.width, h = cv.height;
    const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 100;
    const marks = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (op(x, y)) continue;
        if (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1)) marks.push(x, y);
      }
    const [r, g, b] = [parseInt(colr.slice(1, 3), 16), parseInt(colr.slice(3, 5), 16), parseInt(colr.slice(5, 7), 16)];
    for (let i = 0; i < marks.length; i += 2) {
      const o = (marks[i + 1] * w + marks[i]) * 4;
      d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  }

  function makeCanvas(w, h) {
    if (typeof OffscreenCanvas !== 'undefined' && !RB.sprites._forceDom) return new OffscreenCanvas(w, h);
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    return cv;
  }

  // Returns a canvas (16×24) for the look, direction and frame (0 stand, 1/2 steps, 3 blink).
  function get(look, dir, frame) {
    const k = key(look, dir, frame);
    let cv = cache.get(k);
    if (cv) return cv;
    cv = makeCanvas(W, H);
    const c = cv.getContext('2d', { willReadFrequently: true });
    // an animal drawn with the pets' rig (look.pet): its art frame at half size (the 16×24 standard)
    if (look.pet) {
      const art = RB.sprites.getArt && RB.sprites.getArt(look, dir, frame);
      if (art) { c.imageSmoothingEnabled = false; c.drawImage(art, 0, 0, art.width, art.height, 0, 0, W, H); }
      cache.set(k, cv);
      return cv;
    }
    const col = colorsOf(look);
    const side = dir === 'left' || dir === 'right';
    const d = side ? 'side' : dir;
    const blink = frame === 3;
    const f = blink ? 0 : frame;
    if (look.custom && RB.sprites.custom[look.custom]) {
      RB.sprites.custom[look.custom](c, look, d, f, blink);
    } else {
      drawAccessories(c, look, col, d, 'back');
      hairBack(c, look, col, d);
      drawBody(c, look, col, d, f);
      drawHead(c, look, col, d, blink);
      hairFront(c, look, col, d);
      drawAccessories(c, look, col, d, 'front');
    }
    outline(cv, look.outlineCol || '#241c20');
    if (dir === 'left') {
      const m = makeCanvas(W, H);
      const mc = m.getContext('2d');
      mc.translate(W, 0);
      mc.scale(-1, 1);
      mc.drawImage(cv, 0, 0);
      cv = m;
    }
    cache.set(k, cv);
    if (cache.size > 1500) cache.delete(cache.keys().next().value);
    return cv;
  }

  // Non-humanoid overworld creatures (Hush-touched things) drawn per frame.
  const custom = {};
  custom.wisp = (c, look, d, f) => {
    const col = look.col || '#9fb8e8';
    c.fillStyle = col + '60'; c.beginPath(); c.arc(8, 13, 6, 0, 7); c.fill();
    c.fillStyle = col; c.beginPath(); c.arc(8, 13, 4, 0, 7); c.fill();
    R(c, 6, 12, 1, 2, '#1a1a30'); R(c, 9, 12, 1, 2, '#1a1a30');
    R(c, 7 + (f === 1 ? 1 : 0), 18, 2, 3, col + 'a0');
  };
  custom.moth = (c, look, d, f) => {
    const col = look.col || '#c8c0e0';
    const flap = f === 1 ? 2 : 0;
    c.fillStyle = col; c.beginPath(); c.ellipse(4, 12 + flap, 4, 3, -0.4, 0, 7); c.fill();
    c.beginPath(); c.ellipse(12, 12 + flap, 4, 3, 0.4, 0, 7); c.fill();
    R(c, 7, 10, 2, 7, '#4a4060');
    R(c, 6, 8, 1, 2, '#4a4060'); R(c, 9, 8, 1, 2, '#4a4060');
  };
  custom.blot = (c, look, d, f) => {
    c.fillStyle = look.col || '#2a2440';
    c.beginPath(); c.ellipse(8, 18, 7, 4 + (f === 1 ? 1 : 0), 0, 0, 7); c.fill();
    c.beginPath(); c.arc(8, 14, 4, 0, 7); c.fill();
    R(c, 6, 13, 1, 1, '#f0f0ff'); R(c, 9, 13, 1, 1, '#f0f0ff');
  };
  custom.crane = (c, look, d, f) => {
    c.fillStyle = look.col || '#f4efe0';
    c.beginPath(); c.moveTo(1, 12 - (f === 1 ? 2 : 0)); c.lineTo(8, 15); c.lineTo(15, 12 - (f === 1 ? 2 : 0)); c.lineTo(8, 19); c.fill();
    R(c, 11, 10, 2, 5, look.col || '#f4efe0'); R(c, 12, 9, 2, 1, '#c85a4a');
  };
  custom.golem = (c, look, d, f) => {
    const col = look.col || '#8fb8b0';
    R(c, 3, 9, 10, 12, col); R(c, 4, 6, 8, 4, col); R(c, 3, 9, 10, 1, '#ffffff50');
    R(c, 6, 7, 1, 1, '#1a2a2a'); R(c, 9, 7, 1, 1, '#1a2a2a');
    R(c, 4, 21, 3, 2, col); R(c, 9, 21, 3, 2, col);
  };
  custom.lanternghost = (c, look, d, f) => {
    R(c, 5, 8, 6, 9, '#3a2e2a'); R(c, 6, 9, 4, 7, f === 1 ? '#a8c8ff' : '#8aa8e8');
    c.fillStyle = '#8aa8e850'; c.beginPath(); c.moveTo(4, 17); c.lineTo(12, 17); c.lineTo(8, 23); c.fill();
  };
  custom.cat = (c, look, d, f) => {
    const col = look.col || '#e0a060';
    R(c, 4, 16, 8, 5, col); R(c, 3, 13, 5, 5, col); R(c, 3, 12, 1, 1, col); R(c, 7, 12, 1, 1, col);
    R(c, 4, 15, 1, 1, '#222'); R(c, 6, 15, 1, 1, '#222');
    R(c, 12, 15 - (f === 1 ? 1 : 0), 1, 4, col); R(c, 4, 21, 1, 2, col); R(c, 10, 21, 1, 2, col);
  };
  custom.heron = (c, look, d, f) => {
    R(c, 6, 11, 5, 6, '#dfe6ea'); R(c, 9, 5, 2, 7, '#dfe6ea'); R(c, 10, 4, 3, 2, '#dfe6ea'); R(c, 13, 5, 2, 1, '#d8a040');
    R(c, 7, 17, 1, 6, '#6a6a6a'); R(c, 9, 17, 1, 6, '#6a6a6a');
  };
  custom.spirit = (c, look, d, f) => {
    const col = look.col || '#e8e4ff';
    c.fillStyle = col + 'a0'; c.beginPath(); c.moveTo(3, 22); c.quadraticCurveTo(2, 6, 8, 4); c.quadraticCurveTo(14, 6, 13, 22); c.lineTo(10, 20); c.lineTo(8, 22); c.lineTo(6, 20); c.fill();
    R(c, 6, 10, 1, 2, '#2a2440'); R(c, 9, 10, 1, 2, '#2a2440');
  };

  function randomLook(seed) {
    const r = RB.util.rng(seed);
    return {
      skin: r.int(SKIN.length), hair: r.pick(HAIRSTYLES.slice(0, 9)), hairColor: r.int(8),
      outfit: r.int(CLOTH.length), shape: r.pick(['tunic', 'tunic', 'robe', 'apron', 'coat']), acc: [],
    };
  }

  return {
    W, H, get, SKIN, HAIR, HAIR_NAMES, CLOTH, PANTS, HAIRSTYLES, ACCESSORIES, custom, randomLook, makeCanvas, colorsOf,
  };
})();
