/* Accessories and keepsakes for the overworld figures (40×56; see 32_spriteart.js).
 *
 * Each accessory draws itself for a view ('down', 'up', 'side' facing right) and a layer:
 * 'back' behind the body, 'body' over the clothes, 'face' over the face, 'head' over the hair;
 * in the side views also 'far' (behind the far arm, for things worn on the side turned away
 * from the camera) and 'hand' (over the near arm). Things worn on one side name it — a flower
 * or ribbon on the left of the head, a book in the right hand, a cane or lantern in the left,
 * a satchel's strap over the right shoulder and its bag on the left hip — and are placed on
 * that side in every view: screen right in the front view, screen left from behind, in front
 * of the body in the side view that faces that side, behind it in the other. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.sprites._art, P = RB.pix, shade = P.shade, mix = P.mix;
  const W = A.W;
  const r3 = (c) => [shade(c, -1), c, shade(c, 1)];
  const r5 = (c) => [shade(c, -2), shade(c, -1), c, shade(c, 1), shade(c, 2)];
  const GOLD = ['#a8842c', '#e8c860', '#fff0a8'];
  const LEATHER = ['#5a3e22', '#8a6a3a', '#b08e58'];
  const STRAP = '#6a4a2a';
  const IRON = '#3a3440';
  // screen column (0 left, 1 right) of a body side in the front and back views
  const scr = (v, side) => (v === 'down' ? (side === 'R' ? 0 : 1) : (side === 'R' ? 1 : 0));
  // mirror an x span about the centre line
  const MX = (x, w) => W - x - (w || 1);
  // In a side view, the layer a one-sided thing draws in: its own layer when its side faces the
  // camera, 'far' when it does not.
  const sideLayer = (near, side, own) => (near === side ? own : 'far');

  function lantern(b, x, y, small) {
    // hanging lantern: bail, dark cap, glowing paper body with ribs, dark foot (x,y = top-left of the body)
    const w = small ? 3 : 5, h = small ? 3 : 5;
    b.px(x + (w >> 1), y - 2, IRON);
    b.rect(x, y - 1, w, 1, IRON);
    b.rect(x, y, w, h, '#ffd27a');
    b.rect(x, y, 1, h, '#fff0b8');
    b.rect(x + w - 1, y, 1, h, '#e8a040');
    if (!small) { b.rect(x + 2, y, 1, h, '#f0b050'); b.px(x + 1, y + 1, '#fffae0'); }
    b.rect(x, y + h, w, 1, IRON);
    if (!small) b.px(x + 2, y + h + 1, IRON);
  }
  function flowerAt(b, look, x, y, leaf) {
    const R = r3(look.flowerCol || '#f4a6a0');
    // five petals round a small yellow heart, lit from the upper left, and a leaf
    b.rect(x + 1, y, 3, 5, R[1]); b.rect(x, y + 1, 5, 3, R[1]);
    b.px(x + 1, y, R[2]); b.px(x + 2, y, R[2]); b.px(x, y + 1, R[2]); b.px(x, y + 2, R[2]);
    b.px(x + 4, y + 3, R[0]); b.px(x + 3, y + 4, R[0]); b.px(x + 2, y + 4, R[0]);
    b.px(x + 2, y + 1, '#fff4c0'); b.rect(x + 1, y + 2, 3, 1, '#fff4c0'); b.px(x + 2, y + 3, '#fff4c0'); b.px(x + 2, y + 2, '#e8b050');
    if (leaf) { b.px(x - 1, y + 4, '#5a8a4a'); b.px(x, y + 5, '#4a7a3a'); b.px(x - 1, y + 5, '#4a7a3a'); }
  }
  function bowAt(b, R, x, y, tails) {
    b.rect(x, y, 3, 3, R[1]); b.rect(x + 4, y, 3, 3, R[1]); b.rect(x + 3, y + 1, 1, 2, R[0]);
    b.px(x, y, R[2]); b.px(x + 1, y, R[2]); b.px(x + 4, y, R[2]); b.px(x + 2, y + 2, R[0]); b.px(x + 6, y + 2, R[0]);
    b.px(x + 3, y, R[1]);
    if (tails) { b.rect(x + 2, y + 3, 1, 4, R[1]); b.px(x + 2, y + 3, R[2]); b.rect(x + 4, y + 3, 1, 3, R[0]); b.px(x + 1, y + 6, R[1]); }
  }
  function leafAt(b, R, x, y) {
    // a maple leaf: five points, lit from the upper left, a short stem
    b.px(x + 3, y, R[2]);
    b.px(x + 1, y + 1, R[2]); b.px(x + 3, y + 1, R[1]); b.px(x + 5, y + 1, R[1]);
    b.rect(x + 1, y + 2, 5, 1, R[1]); b.px(x + 1, y + 2, R[2]);
    b.rect(x, y + 3, 7, 1, R[1]); b.px(x, y + 3, R[2]); b.px(x + 6, y + 3, R[0]);
    b.rect(x + 1, y + 4, 5, 1, R[1]); b.px(x + 5, y + 4, R[0]);
    b.rect(x + 2, y + 5, 3, 1, R[0]);
    b.px(x + 3, y + 2, R[2]); b.px(x + 3, y + 3, R[2]); b.px(x + 3, y + 4, R[1]);
    b.px(x + 3, y + 6, '#6a4a2a');
  }

  const ACC = {
    scarf(b, look, p, g, v, L) {
      // from behind the wrap and tail lie over long hair, so they draw in the head layer there
      if (L !== (v === 'up' ? 'head' : 'body')) return;
      const R = r3(look.scarfCol || '#c8962e'), t = g.t;
      const S = look.scarfStripe ? r3(look.scarfStripe) : null; // a knitted stripe (a keepsake scarf)
      if (v === 'side') {
        b.rect(17, t - 2, 9, 4, R[1]); b.rect(17, t - 2, 9, 1, R[2]); b.rect(17, t + 1, 9, 1, R[0]); b.px(25, t - 1, R[0]);
        const fl = g.pose.step ? 1 : 0; // the tail streams behind and lifts with the stride
        b.rect(13, t - 1, 4, 3, R[1]); b.px(13, t - 1, R[2]);
        b.rect(10, t + 1 - fl, 4, 3, R[1]); b.rect(9, t + 2 - fl, 2, 3, R[0]); b.px(11, t + 1 - fl, R[2]);
        if (S) { for (const x of [19, 23]) { b.rect(x, t - 2, 1, 4, S[1]); b.px(x, t - 2, S[2]); } b.rect(14, t - 1, 1, 3, S[1]); b.rect(11, t + 1 - fl, 1, 3, S[1]); }
        return;
      }
      b.rect(15, t - 2, 10, 1, R[1]); b.rect(14, t - 1, 12, 3, R[1]); b.rect(14, t - 1, 12, 1, R[2]); b.rect(14, t + 1, 12, 1, R[0]);
      b.px(15, t - 1, shade(R[2], 1)); b.px(25, t, R[0]);
      // the tail hangs on the body's left
      const tx = v === 'down' ? 21 : 15, sw = g.pose.step ? g.pose.sway : 0;
      b.rect(tx, t + 2, 4, 7, R[1]); b.rect(tx, t + 2, 1, 7, R[2]); b.rect(tx + 3, t + 2, 1, 7, R[0]);
      b.rect(tx + sw, t + 9, 4, 1, R[1]); b.px(tx + sw, t + 10, R[0]); b.px(tx + 2 + sw, t + 10, R[0]);
      if (S) {
        for (const x of [16, 19, 22]) { b.rect(x, t - 1, 1, 3, S[1]); b.px(x, t - 1, S[2]); }
        for (const y of [t + 4, t + 7]) { b.rect(tx, y, 4, 1, S[1]); b.px(tx, y, S[2]); }
      }
    },
    satchel(b, look, p, g, v, L, near) {
      const t = g.t, bt = g.bt, big = look.bigSatchel;
      const bag = (x, y) => {
        const w = big ? 8 : 7, h = big ? 8 : 7;
        if (big) { b.rect(x + 1, y - 2, w - 3, 2, '#f0e8d4'); b.rect(x + 2, y - 3, 2, 1, '#f8f2e4'); b.px(x + 4, y - 2, '#c8b890'); b.px(x + 5, y - 3, '#e8dcc0'); }
        b.rect(x, y, w, h, LEATHER[1]);
        b.rect(x, y, w, 3, LEATHER[2]);           // flap
        b.px(x, y, shade(LEATHER[2], 1));
        b.rect(x, y + 3, w, 1, LEATHER[0]);
        b.rect(x + w - 1, y, 1, h, LEATHER[0]);
        b.rect(x, y + h - 1, w, 1, LEATHER[0]);
        b.px(x + (w >> 1), y + 2, GOLD[1]); b.px(x + (w >> 1), y + 3, GOLD[0]); // clasp
        b.px(x + 1, y + 5, LEATHER[0]);             // a stitched seam
      };
      if (v === 'down') {
        if (L !== 'body') return;
        b.line(14, t, 24, bt - 1, STRAP); b.line(15, t, 25, bt - 1, LEATHER[0]); b.px(14, t, LEATHER[2]);
        bag(big ? 21 : 22, bt - 1);
      } else if (v === 'up') {
        if (L !== 'body') return;
        b.line(25, t, 15, bt - 1, STRAP); b.line(24, t, 14, bt - 1, LEATHER[0]);
        bag(big ? 11 : 11, bt - 1);
      } else if (near === 'L') {
        // the bag rides on the near hip, the strap comes round from the far shoulder
        if (L === 'body') { b.line(24, t + 1, 19, bt - 1, STRAP); b.px(24, t, STRAP); bag(big ? 12 : 13, bt - 1); }
      } else {
        if (L === 'back') bag(big ? 7 : 8, bt - 2);
        if (L === 'body') { b.line(21, t - 1, 16, bt, STRAP); b.line(22, t - 1, 25, t + 3, STRAP); }
      }
    },
    glasses(b, look, p, g, v, L) {
      const fc = look.glassCol || '#5a4852', hi = mix(fc, '#f4fbff', 0.6), y = g.fy + 7;
      if (v === 'down') {
        if (L !== 'face') return;
        // thin round rims a pixel clear of each eye, a bridge, a glint where the light catches them
        for (const x of [12, 23]) {
          b.rect(x + 1, y, 3, 1, fc); b.rect(x, y + 1, 1, 3, fc); b.rect(x + 4, y + 1, 1, 3, fc); b.rect(x + 1, y + 5, 3, 1, fc);
          b.px(x, y + 4, mix(fc, p.skin.S, 0.5)); b.px(x + 4, y + 4, mix(fc, p.skin.S, 0.5));
          b.px(x + 1, y, hi);
        }
        b.rect(17, y + 2, 6, 1, fc);
      } else if (v === 'up') {
        if (L !== 'head') return;
        b.px(9, y + 2, fc); b.px(30, y + 2, fc); // the ends of the arms behind the ears
      } else {
        if (L !== 'face') return;
        b.rect(24, y, 4, 1, fc); b.rect(23, y + 1, 1, 4, fc); b.rect(28, y + 1, 1, 4, fc); b.rect(24, y + 5, 4, 1, fc);
        b.px(24, y, hi);
        b.rect(19, y + 2, 4, 1, fc);
      }
    },
    headband(b, look, p, g, v, L) {
      if (L !== 'head') return;
      const R = r3(look.bandCol || p.ac[1]), y = g.fy + 2;
      if (v === 'side') {
        b.line(9, y + 2, 30, y, R[1], 1); b.line(9, y + 3, 30, y + 1, R[1], 1); b.line(10, y + 2, 29, y, R[2], 1);
        const fl = g.pose.step ? 1 : 0; // the knot's ends flutter behind
        b.rect(6, y + 3 - fl, 4, 1, R[1]); b.rect(5, y + 4 - fl, 3, 1, R[0]); b.rect(7, y + 4, 2, 3, R[1]); b.px(7, y + 6, R[0]);
      } else {
        b.rect(9, y, 22, 2, R[1]); b.rect(9, y, 22, 1, R[2]); b.rect(27, y, 4, 2, R[0]); b.px(11, y, shade(R[2], 1));
        if (v === 'up') { b.rect(18, y - 1, 4, 4, R[1]); b.px(18, y - 1, R[2]); b.rect(18, y + 3, 1, 4, R[1]); b.rect(21, y + 3, 1, 5, R[0]); b.px(20, y + 1, R[0]); }
      }
    },
    flower(b, look, p, g, v, L, near) {
      const y = g.fy - 3;
      if (v === 'down') { if (L === 'head') flowerAt(b, look, 24, y, true); }
      else if (v === 'up') { if (L === 'head') flowerAt(b, look, 11, y, true); }
      else if (L === sideLayer(near, 'L', 'head')) { if (near === 'L') flowerAt(b, look, 14, y + 1, true); else flowerAt(b, look, 15, y - 3, false); }
    },
    hat(b, look, p, g, v, L) {
      if (L !== 'head') return;
      const c = look.hatCol || '#8a6a44', R = r5(c);
      const y = g.hy;
      if (v === 'side') {
        b.rect(13, y + 2, 13, 7, R[2]); b.rect(15, y + 1, 9, 1, R[2]); b.rect(13, y + 2, 13, 1, R[3]); b.rect(14, y + 1, 4, 1, R[3]);
        b.rect(14, y + 3, 3, 3, R[3]); b.px(14, y + 3, R[4]); b.rect(24, y + 3, 2, 4, R[1]);
        b.rect(13, y + 6, 13, 2, R[1]); b.rect(13, y + 7, 13, 1, shade(R[1], -1));
        b.rect(4, y + 8, 32, 2, R[2]); b.rect(4, y + 8, 32, 1, R[3]); b.rect(5, y + 10, 30, 1, R[0]); b.px(4, y + 9, R[1]); b.px(35, y + 9, R[1]);
      } else {
        b.rect(13, y + 1, 14, 7, R[2]); b.rect(15, y, 10, 1, R[2]);
        b.rect(13, y + 1, 5, 5, R[3]); b.rect(15, y, 3, 1, R[3]); b.px(14, y + 2, R[4]); b.px(15, y + 1, R[4]);
        b.rect(23, y + 1, 4, 6, R[1]); b.rect(26, y + 2, 1, 5, R[0]);
        b.rect(13, y + 6, 14, 2, R[1]); b.rect(13, y + 7, 14, 1, shade(R[1], -1)); // band
        b.oval(3, y + 8, 36, y + 13, R[2]);
        b.rect(5, y + 9, 30, 1, R[3]); b.rect(9, y + 8, 22, 1, R[3]);
        b.oval(5, y + 11, 34, y + 13, R[1]);
        for (let x = 6; x < 34; x += 4) b.px(x + (x % 8 ? 1 : 0), y + 10, R[1]); // straw weave
        b.rect(10, y + 14, 20, 1, P.alpha('#1a1020', 0.3));
      }
    },
    earrings(b, look, p, g, v, L, near) {
      // drops hanging below each ear, over the hair so no hairstyle hides them
      if (L !== 'head') return;
      const R = look.earCol ? r3(look.earCol) : GOLD, y = g.fy + 11;
      const drop = (x) => {
        b.px(x + 1, y, '#8a6a2a'); b.px(x + 1, y + 1, R[1]);
        b.rect(x, y + 2, 3, 3, R[1]); b.px(x, y + 2, R[2]); b.px(x + 1, y + 2, R[2]); b.px(x, y + 3, R[2]); b.px(x + 2, y + 4, R[0]);
        b.px(x + 1, y + 5, R[0]);
      };
      if (v === 'side') drop(17);
      else { drop(9); drop(28); }
    },
    cape(b, look, p, g, v, L) {
      const c = look.capeCol || '#6a3a4a', R = [shade(c, -2), shade(c, -1), c, shade(c, 1)];
      const t = g.t, lo = g.hem + 5, sw = g.pose.step ? g.pose.sway : 0;
      if (v === 'down') {
        if (L === 'back') {
          b.rect(6, t + 2, 3, lo - t - 2, R[1]); b.rect(31, t + 2, 3, lo - t - 2, R[0]); b.rect(6, t + 2, 1, lo - t - 2, R[2]);
          b.rect(6 + sw, lo - 3, 3, 3, R[1]); b.rect(31 + sw, lo - 3, 3, 3, R[0]);
        }
        if (L === 'body') {
          b.rect(13, t - 1, 14, 2, R[2]); b.rect(9, t, 5, 3, R[2]); b.rect(26, t, 5, 3, R[1]); b.rect(13, t - 1, 14, 1, R[3]); b.rect(9, t, 3, 1, R[3]);
          b.rect(19, t, 2, 2, GOLD[1]); b.px(19, t, GOLD[2]); b.px(20, t + 1, GOLD[0]);
        }
      } else if (v === 'up') {
        if (L !== 'body') return;
        for (let y = t - 1; y <= lo; y++) {
          const e = Math.floor((y - t) / 5), s2 = y > lo - 4 ? sw : 0;
          b.rect(10 - e + s2, y, 20 + 2 * e, 1, R[2]); b.px(10 - e + s2, y, R[3]); b.px(29 + e + s2, y, R[1]);
        }
        for (const x of [15, 20, 25]) b.rect(x, t + 3, 1, lo - t - 3, R[1]);
        b.rect(16, t + 3, 1, lo - t - 3, R[3]); b.rect(21, t + 5, 1, lo - t - 6, R[3]);
        b.rect(11, lo, 18, 1, R[1]);
        b.rect(12, t - 1, 16, 1, R[3]);
      } else {
        if (L !== 'back') return;
        const fl = g.pose.step ? 1 : 0;
        for (let y = t; y <= lo; y++) { const e = Math.floor((y - t) / 4) + (y > lo - 5 ? fl : 0); b.rect(12 - e, y, 5 + e, 1, R[2]); b.px(12 - e, y, R[3]); b.px(16, y, R[1]); }
        b.rect(20, t - 1, 5, 2, R[2]); b.rect(20, t - 1, 5, 1, R[3]);
      }
    },
    lamp(b, look, p, g, v, L, near) {
      if (v === 'side') {
        if (L !== sideLayer(near, 'L', 'hand')) return;
        const h = A.sideHand(g, 'L');
        b.rect(h.x + 1, h.y + 3, 1, 2, IRON); lantern(b, h.x - 1, h.y + 6);
        return;
      }
      if (L !== 'body') return;
      const h = A.handsFB(g, v)[scr(v, 'L')];
      b.rect(h.x + 1, h.y + 3, 1, 2, IRON);
      lantern(b, h.x - 1, h.y + 6);
    },
    ribbon(b, look, p, g, v, L, near) {
      const R = r3(look.ribbonCol || '#c85a6a'), y = g.fy - 5;
      if (v === 'down') { if (L === 'head') bowAt(b, R, 23, y, true); }
      else if (v === 'up') { if (L === 'head') bowAt(b, R, 10, y, true); }
      else if (L === sideLayer(near, 'L', 'head')) { if (near === 'L') bowAt(b, R, 12, y + 1, true); else bowAt(b, R, 14, y - 2, false); }
    },
    // ---- keepsakes from the road ----
    bell(b, look, p, g, v, L) {
      // a little bell on a red cord round the neck; from behind, the cord's bow at the nape
      const R = look.bellCol ? r3(look.bellCol) : GOLD, cord = look.cordCol || '#b8342a', t = g.t, O = '#4a3418';
      const bell = (x, y) => {
        b.px(x + 2, y, cord);
        b.rect(x + 1, y + 1, 3, 1, O);
        b.px(x, y + 2, O); b.px(x + 4, y + 2, O); b.rect(x + 1, y + 2, 3, 1, R[1]); b.px(x + 1, y + 2, R[2]);
        b.px(x, y + 3, O); b.px(x + 4, y + 3, O); b.rect(x + 1, y + 3, 3, 1, R[1]); b.px(x + 3, y + 3, R[0]);
        b.rect(x, y + 4, 5, 1, R[1]); b.px(x, y + 4, R[2]); b.px(x + 4, y + 4, R[0]);
        b.rect(x + 1, y + 5, 3, 1, O); b.px(x + 2, y + 5, '#1e140a');
      };
      if (v === 'down') { if (L === 'head') { b.rect(16, t - 1, 8, 1, cord); b.px(15, t - 2, cord); b.px(24, t - 2, cord); b.px(19, t, cord); bell(17, t + 1); } }
      else if (v === 'side') { if (L === 'hand') { b.rect(19, t - 1, 6, 1, cord); bell(22, t); } }
      else if (L === 'head') {
        const k = shade(cord, -1);
        b.rect(15, t - 2, 10, 1, cord);
        b.rect(15, t - 4, 3, 2, cord); b.rect(22, t - 4, 3, 2, cord); b.px(15, t - 4, shade(cord, 1));
        b.rect(18, t - 3, 4, 2, k); b.px(17, t - 1, cord); b.px(22, t - 1, k); b.px(17, t, k); b.px(22, t, k);
      }
    },
    cap(b, look, p, g, v, L) {
      // a peaked cap (a ferry clerk's): round crown, dark band with a brass badge, a stiff peak
      if (L !== 'head') return;
      const c = look.capCol || '#2c4468', R = r5(c), y = g.hy;
      if (v === 'side') {
        b.rect(13, y + 2, 11, 1, R[3]); b.rect(10, y + 3, 16, 6, R[2]); b.rect(10, y + 3, 16, 1, R[3]); b.rect(11, y + 4, 4, 2, R[4]);
        b.rect(10, y + 9, 16, 2, R[1]); b.rect(10, y + 10, 16, 1, R[0]);
        b.rect(22, y + 5, 3, 3, GOLD[1]); b.px(22, y + 5, GOLD[2]);
        b.rect(25, y + 10, 8, 2, R[0]); b.rect(25, y + 10, 8, 1, R[1]);
        return;
      }
      b.rect(13, y + 2, 14, 1, R[3]); b.rect(10, y + 3, 20, 6, R[2]);
      b.rect(10, y + 3, 6, 4, R[3]); b.px(11, y + 4, R[4]); b.px(12, y + 4, R[4]); b.rect(26, y + 3, 4, 6, R[1]);
      b.rect(9, y + 9, 22, 2, R[1]); b.rect(9, y + 10, 22, 1, R[0]);
      if (v === 'down') {
        b.rect(18, y + 5, 4, 3, GOLD[1]); b.px(18, y + 5, GOLD[2]); b.px(21, y + 7, GOLD[0]);
        b.rect(11, y + 11, 18, 2, R[0]); b.rect(12, y + 11, 16, 1, R[1]);
        b.rect(12, y + 13, 16, 1, P.alpha('#1a1020', 0.3));
      }
    },
    leaf(b, look, p, g, v, L, near) {
      const R = r3(look.leafCol || '#c8452a'), y = g.fy - 5;
      if (v === 'down') { if (L === 'head') leafAt(b, R, 24, y); }
      else if (v === 'up') { if (L === 'head') leafAt(b, R, 9, y); }
      else if (L === sideLayer(near, 'L', 'head')) leafAt(b, R, near === 'L' ? 12 : 14, near === 'L' ? y + 1 : y - 2);
    },
    bottles(b, look, p, g, v, L, near) {
      if (L !== 'body') return;
      const y = g.bt + 2;
      const bottle = (x, c, h) => { b.px(x, y, '#a88860'); b.rect(x, y + 1, 2, h, c); b.px(x, y + 1, shade(c, 2)); b.px(x + 1, y + h, shade(c, -1)); };
      if (v === 'down') { bottle(14, '#6ab0a0', 4); bottle(18, '#e0c070', 3); bottle(23, '#c8a0d0', 4); }
      else if (v === 'side') bottle(22, '#6ab0a0', 4);
      else bottle(15, '#6ab0a0', 3);
    },
    beard(b, look, p, g, v, L) {
      if (L !== 'face') return;
      const R = p.hair, y = g.fy;
      if (v === 'down') {
        b.rect(12, y + 12, 16, 4, R[3]); b.rect(13, y + 16, 14, 1, R[3]); b.rect(15, y + 17, 10, 1, R[2]);
        b.rect(11, y + 9, 2, 4, R[3]); b.rect(27, y + 9, 2, 4, R[2]);
        b.rect(15, y + 14, 1, 3, R[2]); b.rect(20, y + 14, 1, 4, R[2]); b.rect(24, y + 13, 1, 3, R[2]); b.rect(12, y + 12, 2, 2, R[4]);
        b.rect(16, y + 12, 8, 1, R[2]); b.rect(19, y + 13, 2, 1, p.mouth); // moustache and mouth
      } else if (v === 'side') {
        b.rect(20, y + 11, 10, 5, R[3]); b.rect(21, y + 16, 7, 1, R[2]); b.rect(18, y + 9, 2, 5, R[3]);
        b.rect(23, y + 13, 1, 3, R[2]); b.rect(27, y + 12, 2, 1, R[2]); b.px(28, y + 13, p.mouth);
      }
    },
    cane(b, look, p, g, v, L, near) {
      const wood = '#6a4a2a', top = '#8a6a44';
      if (v === 'side') {
        if (L !== sideLayer(near, 'L', 'hand')) return;
        const h = A.sideHand(g, 'L'), x = h.x + 3;
        b.rect(x, h.y - 1, 1, g.sole - h.y + 1, wood); b.rect(x - 2, h.y - 1, 3, 1, top); b.px(x, g.sole, '#3a2a1a');
        return;
      }
      if (L !== 'body') return;
      const h = A.handsFB(g, v)[scr(v, 'L')], s = scr(v, 'L');
      const x = s ? h.x + 3 : h.x - 1;
      b.rect(x, h.y - 1, 1, g.sole - h.y + 1, wood); b.rect(s ? x - 2 : x, h.y - 2, 3, 1, top); b.px(s ? x - 3 : x + 3, h.y - 1, top); b.px(x, g.sole, '#3a2a1a');
    },
    basket(b, look, p, g, v, L, near) {
      const W1 = ['#7a5a2e', '#b08a4a', '#d0ac6a'];
      const bask = (x, y) => {
        b.rect(x, y, 7, 4, W1[1]); b.rect(x, y, 7, 1, W1[2]);
        for (let i = 0; i < 7; i += 2) b.px(x + i, y + 2, W1[0]);
        b.rect(x + 1, y + 4, 5, 1, W1[0]);
        b.line(x + 1, y - 1, x + 3, y - 3, W1[0]); b.line(x + 3, y - 3, x + 5, y - 1, W1[0]);
        b.px(x + 2, y - 1, '#e8a0a0'); b.px(x + 4, y - 1, '#a0c880');
      };
      if (v === 'side') { if (L === sideLayer(near, 'R', 'hand')) { const h = A.sideHand(g, 'R'); bask(h.x - 3, h.y + 2); } return; }
      if (L !== 'body') return;
      const s = scr(v, 'R'), h = A.handsFB(g, v)[s];
      bask(s ? h.x + 2 : h.x - 6, h.y + 1);
    },
    book(b, look, p, g, v, L, near) {
      const cover = ['#4a2828', '#6a3a3a', '#8a4a44'];
      if (v === 'side') {
        if (L !== sideLayer(near, 'R', 'hand')) return;
        const h = A.sideHand(g, 'R');
        b.rect(h.x - 2, h.y - 2, 6, 4, cover[1]); b.rect(h.x - 2, h.y - 2, 6, 1, '#e8e0c8'); b.px(h.x + 3, h.y + 1, cover[0]);
        return;
      }
      if (L !== 'body') return;
      const s = scr(v, 'R'), h = A.handsFB(g, v)[s], x = s ? h.x + 2 : h.x - 4, y = h.y - 3;
      b.rect(x, y, 5, 7, cover[1]); b.rect(x, y, 5, 1, cover[2]); b.rect(s ? x : x + 4, y + 1, 1, 6, '#e8e0c8'); b.rect(x, y + 6, 5, 1, cover[0]); b.px(x + 2, y + 2, GOLD[1]);
    },
    hood(b0, look, p, g, v, L) {
      if (L !== 'head') return;
      const c = look.hoodCol || p.cl[1], R = [shade(c, -2), shade(c, -1), c, shade(c, 1)];
      const y = g.hy;
      const b = new P.Buf(W, A.H);
      if (v === 'down') {
        b.oval(8, y + 1, 31, y + 20, R[2]);
        b.rect(7, y + 11, 4, 15, R[2]); b.rect(29, y + 11, 4, 15, R[1]); b.rect(7, y + 11, 1, 15, R[3]);
        b.rect(10, y + 24, 20, 3, R[2]); b.rect(10, y + 26, 20, 1, R[1]);
        for (let yy = y + 10; yy <= y + 25; yy++) for (let x = 11; x <= 28; x++) {
          const dx = (x + 0.5 - 20) / 8.2, dy = (yy + 0.5 - (y + 17.5)) / 8.4;
          if (dx * dx + dy * dy <= 1) b.clear(x, yy);
        }
        b.rect(10, y + 3, 7, 2, R[3]); b.px(11, y + 2, R[3]);
        for (let yy = y + 11; yy <= y + 23; yy++) { b.px(10, yy, R[3]); b.px(29, yy, R[0]); }
        b.rect(12, y + 9, 16, 1, R[3]);
      } else if (v === 'up') {
        b.oval(8, y + 1, 31, y + 24, R[2]);
        b.rect(9, y + 18, 22, 10, R[2]); b.rect(10, y + 28, 20, 1, R[1]);
        b.rect(10, y + 3, 6, 3, R[3]); b.rect(26, y + 6, 4, 18, R[1]); b.rect(19, y + 4, 1, 21, R[1]);
      } else {
        b.oval(8, y + 1, 28, y + 21, R[2]);
        b.rect(7, y + 12, 12, 16, R[2]); b.rect(7, y + 12, 1, 16, R[3]);
        b.rect(10, y + 3, 7, 2, R[3]);
        for (let yy = y + 6; yy <= y + 25; yy++) for (let x = 18; x <= 31; x++) { const dx = (x + 0.5 - 26) / 8, dy = (yy + 0.5 - (y + 16)) / 10; if (dx * dx + dy * dy <= 1) b.clear(x, yy); }
        for (let yy = y + 7; yy <= y + 24; yy++) { const dy = (yy + 0.5 - (y + 16)) / 10, xx = Math.ceil(26 - 8 * Math.sqrt(Math.max(0, 1 - dy * dy))) - 1; if (b.alphaAt(xx, yy)) b.px(xx, yy, R[3]); }
      }
      b0.draw(b, 0, 0);
    },
    patches(b, look, p, g, v, L, near) {
      if (L !== 'body') return;
      const pc = ['#6a5c42', '#8a7a5a', '#a89a78'];
      const patch = (x, y) => { b.rect(x, y, 3, 3, pc[1]); b.rect(x, y, 3, 1, pc[2]); b.px(x + 2, y + 2, pc[0]); b.px(x + 1, y + 1, pc[0]); };
      if (v === 'down') { patch(14, g.t + 5); patch(23, g.hem + 2); }
      else if (v === 'up') patch(23, g.t + 4);
      else if (near === 'R') patch(17, g.t + 4);
      else patch(16, g.hem + 1);
    },
    toolbelt(b, look, p, g, v, L, near) {
      if (L !== 'body') return;
      const y = g.bt + 1;
      const pouch = (x) => { b.rect(x, y + 1, 4, 4, LEATHER[1]); b.rect(x, y + 1, 4, 1, LEATHER[2]); b.px(x + 3, y + 4, LEATHER[0]); b.px(x + 1, y + 2, LEATHER[0]); };
      const tool = (x) => { b.rect(x, y, 1, 6, '#8a6a44'); b.rect(x - 1, y + 5, 3, 2, '#9a9aa0'); b.px(x - 1, y + 5, '#c8c8d0'); };
      if (v === 'side') { b.rect(14, y, 12, 1, '#5a3a2a'); if (near === 'R') pouch(16); else tool(19); return; }
      b.rect(12, y, 16, 1, '#5a3a2a');
      if (v === 'down') { pouch(13); tool(24); } else { pouch(23); tool(15); }
    },
    apronstrap() {},
    // ---- Unwritten Atlas keepsakes ----
    atlas_sash(b, look, p, g, v, L, near) {
      const c = look.sashCol || '#d8c89a', ln = '#8a7a5a', dk = shade(c, -1);
      if (v === 'side') {
        // over the near shoulder and down the chest; from the far side, only where it crosses the front
        if (L !== 'hand') return;
        if (near === 'R') { b.rect(18, g.t - 1, 7, 2, c); b.rect(18, g.t, 7, 1, dk); b.rect(23, g.t + 1, 2, g.bt - g.t + 1, c); b.rect(24, g.t + 1, 1, g.bt - g.t + 1, dk); b.px(23, g.t + 3, ln); b.px(23, g.t + 6, ln); }
        else { b.rect(23, g.t + 2, 2, g.bt - g.t, c); b.rect(24, g.t + 2, 1, g.bt - g.t, dk); b.rect(14, g.bt + 1, 4, 3, c); b.rect(14, g.bt + 4, 2, 4, c); b.rect(16, g.bt + 4, 2, 3, dk); }
        return;
      }
      const [x0, x1] = v === 'down' ? [14, 25] : [25, 14];
      // the knot at the left hip with its folded ends; from behind it lies over long hair
      const knot = () => {
        const kx = v === 'down' ? x1 - 2 : x1 - 1, ky = g.bt + 1;
        b.rect(kx, ky, 4, 3, c); b.px(kx, ky, shade(c, 1)); b.rect(kx + 3, ky, 1, 3, dk);
        b.rect(kx, ky + 3, 2, 4, c); b.rect(kx + 2, ky + 3, 2, 3, dk); b.px(kx, ky + 5, ln);
      };
      if (v === 'up' && L === 'head') { knot(); return; }
      if (L !== 'body') return;
      b.line(x0, g.t, x1, g.bt + 1, c, 2);
      b.line(x0, g.t + 2, x1, g.bt + 3, dk);
      b.px(Math.round((x0 * 2 + x1) / 3), g.t + 3, ln); b.px(Math.round((x0 + x1 * 2) / 3), g.t + 6, ln);
      if (v === 'down') knot();
    },
    atlas_pin(b, look, p, g, v, L, near) {
      // a compass rose (four points round a blue heart) on the right breast, over long hair
      const rose = (x, y) => {
        b.rect(x + 3, y, 1, 7, GOLD[1]); b.rect(x, y + 3, 7, 1, GOLD[1]); b.rect(x + 2, y + 2, 3, 3, GOLD[1]);
        b.px(x + 3, y, GOLD[2]); b.px(x, y + 3, GOLD[2]); b.px(x + 2, y + 2, GOLD[2]);
        b.px(x + 6, y + 3, GOLD[0]); b.px(x + 3, y + 6, GOLD[0]); b.px(x + 4, y + 4, GOLD[0]);
        b.px(x + 3, y + 3, '#3a5a8a');
      };
      if (v === 'side') { if (L === 'hand' && near === 'R') rose(19, g.t); return; }
      if (L !== 'head') return;
      rose(v === 'down' ? 12 : 22, g.t);
    },
    atlas_lamplet(b, look, p, g, v, L, near) {
      // a small lantern hanging at the right hip
      if (v === 'side') { if (L === sideLayer(near, 'R', 'hand')) { b.rect(13, g.bt, 1, 2, IRON); lantern(b, 12, g.bt + 3, true); } return; }
      if (L !== (v === 'up' ? 'head' : 'body')) return;
      const s = scr(v, 'R'), x = s ? 29 : 8;
      b.rect(x + 1, g.bt, 1, 2, IRON); lantern(b, x, g.bt + 3, true);
    },
    atlas_quill(b, look, p, g, v, L, near) {
      // a white feather tucked in the hair on the left
      const y = g.hy;
      const q = (x) => { b.line(x, y + 12, x + 2, y + 1, '#f4f0e0', 1); b.line(x + 1, y + 11, x + 3, y + 2, '#d8d0bc', 1); b.px(x + 2, y, '#f4f0e0'); b.px(x, y + 12, '#6a5a3a'); };
      if (v === 'down') { if (L === 'head') q(27); }
      else if (v === 'up') { if (L === 'head') q(9); }
      else if (L === sideLayer(near, 'L', 'head')) q(near === 'L' ? 13 : 15);
    },
  };
  A.ACC = ACC;
  A.accSide = { flower: 'L', ribbon: 'L', leaf: 'L', atlas_quill: 'L', lamp: 'L', cane: 'L', book: 'R', basket: 'R', atlas_lamplet: 'R', atlas_pin: 'R', satchel: 'L', scarf: 'L', braid: 'L', ponytail: 'L' };
})();
