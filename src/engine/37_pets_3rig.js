/* Cosmetic pets, part 3: the four animals as posed rigs of volumes, their
 * three looks each, and the frames the world, the battle and the Company page
 * draw (cached by appearance and pose; never rebuilt per frame).
 *
 * Species: cat, dog, bird, tanuki. Every one is original art built here from
 * simple volumes (see 37_pets_2art.js), never a resized creature sprite.
 *
 * A pose is a small object of numbers (all optional):
 *   sit, lie (0..1 blends from standing), crouch (0..1), lean (-1..1), rise (0..1, up on the hind legs),
 *   gait ('walk' | 'run'), ph (0..1 through its cycle),
 *   hy, hp, hr (head yaw / pitch / roll, degrees), earF (-1..1 back..forward), earL, earR (twitch),
 *   blink (0..1), tUp, tSide, tCurl, tFlick (tail, degrees), wag (-1..1),
 *   pawR, pawL (a front paw raised and reaching, 0..1), pawsUp (both front paws up, 0..1),
 *   paws (0..1 front paws gathered in front of the chest: folded or cupped), breath (0..1), nose (0..1),
 *   wind (-1..1 fur and ears pushed toward screen right/left), fluff (0..1),
 *   bird: wing (0 folded .. 1 spread), flap (0..1 phase), tuck (0..1), beak (0..1), preen (0..1).
 * Views: { kind: 'world', dir: 'up'|'down'|'left'|'right' } (32×32, the bird 24×24; anchor at the
 * feet) or { kind: 'battle' } (48×48, the bird 40×40; rear three-quarter facing up-right), or
 * { kind: 'portrait', size } (a front three-quarter bust).
 *
 *   RB.petArt.frame(species, look, view, pose) -> { cv, ax, ay, w, h, head, chest }
 *   RB.petArt.SIZES, RB.petArt.LOOKS, RB.petArt.cacheStats() */
var RB = (globalThis.RB = globalThis.RB || {});

(function (A) {
  'use strict';
  const P = RB.pix;
  const { add, sub, mul, lerp, norm, mv, rotX, rotY, rotZ, mm, along, len } = A.V;
  const DEG = Math.PI / 180;
  const ramp = A.ramp;

  // ---- looks: three grounded variants per species (addendum §3.3) ---------------------------------------
  // Colours are the animal's own; patterns are painted in each part's own coordinates.
  const LOOKS = {
    cat: {
      ginger: { en: 'Ginger', pattern: 'tabby', base: '#d9893f', stripe: '#a95d2c', under: '#f3ddb8', eye: '#9aa83a', nose: '#d98a86', pad: '#c9787a', inner: '#e0a49a' },
      gray: { en: 'Gray', pattern: 'tabby', base: '#8f929b', stripe: '#565962', under: '#e2e0dc', eye: '#c9a53c', nose: '#b87c80', pad: '#a8707a', inner: '#d7a6a6', bib: true },
      calico: { en: 'Calico', pattern: 'calico', base: '#f1ebdf', patchA: '#d6843c', patchB: '#3b3334', under: '#f6f1e8', eye: '#b5943a', nose: '#e2a2a2', pad: '#d99a9a', inner: '#e8b0aa' },
      // Mochi, Tomo's cat in Reedwake (an npc, never a pet's look: not in LOOK_ORDER): white, red collar
      mochi: { en: 'White', pattern: 'plain', base: '#ece4d6', under: '#faf6ee', eye: '#aab83e', nose: '#e2a0a0', pad: '#d99a9a', inner: '#eab0aa', collar: '#c8463c' },
    },
    dog: {
      cream: { en: 'Cream', pattern: 'urajiro', base: '#e3c690', under: '#f7eedc', ear: '#c69a5c', eye: '#3a2618', nose: '#2e2628', inner: '#e8b8a0' },
      brown: { en: 'Brown', pattern: 'urajiro', base: '#a4643a', under: '#f0dcc0', ear: '#7e4a2a', eye: '#2e1c12', nose: '#282024', inner: '#d8a088' },
      blacktan: { en: 'Black and tan', pattern: 'blacktan', base: '#38323a', tan: '#c88c4c', under: '#efe0c6', ear: '#2a262e', eye: '#2a1a12', nose: '#1e1a20', inner: '#b88878' },
    },
    bird: {
      brown: { en: 'Brown', pattern: 'sparrow', base: '#9a6e46', cap: '#7a4a2c', back: '#8a6040', streak: '#4e3424', under: '#ece2cc', cheek: '#f4eee0', bar: '#f0e4c8', beak: '#4a3a32', leg: '#b09080', eye: '#1e1618' },
      gray: { en: 'Gray', pattern: 'plain', base: '#8d929c', cap: '#5c606c', back: '#7e838e', streak: '#4a4e58', under: '#e6e4e0', cheek: '#f0f0ee', bar: '#dcdee2', beak: '#3a3436', leg: '#8a8488', eye: '#1a1618' },
      cream: { en: 'Muted cream', pattern: 'plain', base: '#e0d2b0', cap: '#c8b48c', back: '#d4c29c', streak: '#9a7c52', under: '#f4ecda', cheek: '#f8f2e4', bar: '#f4ead4', beak: '#8a6a4a', leg: '#b8a08a', eye: '#221a18' },
    },
    tanuki: {
      warm: { en: 'Warm brown', pattern: 'tanuki', base: '#a7794c', dark: '#2f2622', under: '#ead9b8', saddle: '#6e4e34', eye: '#1a1414', nose: '#1c1618' },
      graybrown: { en: 'Gray-brown', pattern: 'tanuki', base: '#8f836f', dark: '#2c2826', under: '#e2d8c4', saddle: '#5e5446', eye: '#1a1414', nose: '#1c1618' },
      dark: { en: 'Dark brown', pattern: 'tanuki', base: '#6c4e36', dark: '#221c1a', under: '#d6c2a0', saddle: '#48321f', eye: '#141010', nose: '#161214' },
    },
  };
  const LOOK_ORDER = { cat: ['ginger', 'gray', 'calico'], dog: ['cream', 'brown', 'blacktan'], bird: ['brown', 'gray', 'cream'], tanuki: ['warm', 'graybrown', 'dark'] };

  // ---- materials per look ----------------------------------------------------------------------------------
  // A pattern returns { R } (another ramp for this pixel) or a step change.
  const frac = (x) => x - Math.floor(x);
  const blob = (l, c, r) => { const dx = l[0] - c[0], dy = l[1] - c[1], dz = l[2] - c[2]; return dx * dx + dy * dy + dz * dz < r * r; };
  const mcache = new Map();
  function mats(sp, lk) {
    const key = sp + '|' + lk;
    let M = mcache.get(key);
    if (M) return M;
    const L = LOOKS[sp][lk];
    const R = ramp(L.base), U = ramp(L.under || L.base);
    const th = [0.72, 0.34, -0.06, -0.45];
    M = { L };
    if (sp === 'cat') {
      const S = ramp(L.stripe || L.base), PA = ramp(L.patchA || L.base), PB = ramp(L.patchB || L.base), CO = L.collar ? ramp(L.collar) : null;
      const tabby = L.pattern === 'tabby', calico = L.pattern === 'calico';
      // underside and chin/bib in the lighter coat
      const under = (info) => {
        const l = info.l, p = info.part;
        if (p === 'belly' && l[1] < -0.45) return true;
        // the pale chest is on the front only (never a line round the neck seen from behind)
        if (p === 'chest' && l[1] < -0.5 && l[2] > 0.2) return true;
        if (p === 'chest' && L.bib && l[2] > 0.45 && l[1] < 0.3) return true;
        // (the throat stays the coat colour: seen from the side it read as a collar line)
        if (p === 'muzzle' && (l[1] < 0.1 || calico)) return true;
        if (p === 'head' && l[2] > 0.55 && l[1] < -0.25) return true;
        if ((p === 'paw' || p === 'hpaw')) return true;
        return false;
      };
      M.fur = {
        R, th, pat(info, v) {
          const l = info.l, p = info.part;
          if (CO && p === 'neck' && info.u != null && info.u > 0.28 && info.u < 0.6) return { R: CO };
          if (!l) return 0;
          if (calico) {
            // patches placed on each part (stable in every view): orange on the head, back and tail, dark over them
            if (p === 'head' && (blob(l, [0.7, 0.55, -0.1], 0.72) || blob(l, [-0.6, 0.7, 0.2], 0.5))) return { R: blob(l, [0.75, 0.7, -0.2], 0.42) ? PB : PA };
            if (p === 'ear' && info.u > 0.15 && l[0] > -2) return { R: info.side > 0 ? PA : PB };
            // patches meet side by side (never one inside another)
            if (p === 'hips' && blob(l, [0.62, 0.55, -0.35], 0.62)) return { R: PA };
            if (p === 'hips' && blob(l, [-0.1, 0.85, -0.2], 0.5)) return { R: PB };
            if (p === 'belly' && (blob(l, [-0.5, 0.75, 0.3], 0.55) || blob(l, [0.6, 0.6, -0.6], 0.5))) return { R: l[0] > 0 ? PA : PB };
            if (p === 'chest' && blob(l, [0.6, 0.7, -0.3], 0.5)) return { R: PB };
            if (p === 'neck') return l[1] > 0.45 ? { R: PA } : { R };
            if (p === 'tail') return { R: info.u > 0.62 ? PB : PA };
            if (p === 'haunch' && blob(l, [0.2, 0.75, -0.55], 0.55)) return { R: PA };
            return { R };
          }
          if (under(info)) return { R: U, d: v < 2 ? 0 : 0 };
          if (!tabby) return 0;
          // tabby: a dark line down the spine, broad bands curving down the upper flanks (fading toward
          // the belly), rings on the legs and tail, and lines on the brow and down the nape — few and
          // wide enough to stay bands at battle size, never a speckle
          if (p === 'belly' || p === 'hips' || p === 'chest') {
            if (l[1] > 0.8 && Math.abs(l[0]) < 0.42) return { R: S };
            if (l[1] < -0.15 + Math.abs(l[0]) * 0.1) return 0;
            const s = frac(l[2] * 1.45 - l[1] * 0.35 + (p === 'hips' ? 0.42 : p === 'chest' ? 0.12 : 0));
            return s < 0.36 ? { R: S } : 0;
          }
          if (p === 'haunch') return l[1] > -0.2 && frac(l[1] * 1.2 - l[2] * 0.4 + 0.25) < 0.34 ? { R: S } : 0;
          if (p === 'leg' || p === 'hleg') return info.u != null && info.u < 0.7 && frac(info.u * 2.2) < 0.4 ? { R: S } : 0;
          if (p === 'tail') return frac((info.u || 0) * 4.2) < 0.4 || info.u > 0.9 ? { R: S } : 0;
          if (p === 'head') {
            if (l[1] > 0.35 && l[2] > 0.05 && frac(l[0] * 2.4 + 0.5) < 0.34) return { R: S };
            if (l[1] > 0.1 && l[1] < 0.35 && Math.abs(l[0]) > 0.7 && l[2] > -0.2) return { R: S };
            // the nape: two bands running back from the crown
            if (l[2] < -0.25 && l[1] > -0.1 && frac(Math.abs(l[0]) * 1.8 + 0.1) < 0.4) return { R: S };
          }
          return 0;
        },
      };
      M.ear = { R, th, pat(info) { if (info.inner) return { R: ramp(L.inner), d: 0 }; return calico ? { R: info.side > 0 ? PA : PB } : tabby && info.u > 0.72 ? { R: S } : 0; } };
      M.nose = { R: A.flat(L.nose, 0.6), flag: 3 };
    } else if (sp === 'dog') {
      const T = ramp(L.tan || L.base), E = ramp(L.ear || L.base);
      const bt = L.pattern === 'blacktan';
      // urajiro: the pale "underside" of a Japanese dog — cheeks, throat, chest, belly and inner legs
      const pale = (info) => {
        const l = info.l, p = info.part;
        if (p === 'muzzle') return l[1] < 0.35 || l[2] > 0.5;
        if (p === 'head') return (l[2] > 0.4 && l[1] < -0.1) || (l[1] < -0.45);
        if (p === 'chest') return l[2] > 0.1 && l[1] < 0.25 || l[1] < -0.3;
        // (the neck keeps the coat colour: a pale or tan throat read as a collar in the sitting view)
        if (p === 'belly') return l[1] < -0.35;
        if (p === 'paw' || p === 'hpaw') return true;
        if (p === 'leg') return (info.u || 0) > 0.55;
        if (p === 'tail') return info.under;
        return false;
      };
      M.fur = {
        R, th, pat(info) {
          const l = info.l, p = info.part;
          if (!l) return 0;
          if (bt) {
            // black and tan: tan points (brows, cheeks, throat, legs, under the tail) on a dark coat
            if (p === 'head' && (blob(l, [0.42, 0.42, 0.78], 0.2) || blob(l, [-0.42, 0.42, 0.78], 0.2))) return { R: T };
            if (p === 'muzzle') return { R: l[1] > 0.4 && l[2] < 0.2 ? R : l[1] < -0.1 ? U : T };
            if (p === 'head' && l[1] < -0.3 && l[2] > 0.2) return { R: U };
            if (p === 'chest' && l[2] > 0.3 && l[1] < 0.3) return { R: l[1] < -0.1 ? U : T };
            if (p === 'leg' || p === 'hleg') return (info.u || 0) > 0.35 ? { R: T } : 0;
            if (p === 'paw' || p === 'hpaw') return { R: T };
            if (p === 'belly' && l[1] < -0.4) return { R: T };
            if (p === 'tail' && info.under) return { R: T };
            return 0;
          }
          return pale(info) ? { R: U } : 0;
        },
      };
      M.ear = { R: E, th, pat(info) { return info.inner ? { R: ramp(L.inner) } : 0; } };
      M.nose = { R: A.flat(L.nose, 0.5), flag: 3 };
    } else if (sp === 'tanuki') {
      const D = ramp(L.dark), SD = ramp(L.saddle), FR = ramp(A.mix(L.base, L.under, 0.24));
      M.fur = {
        R, th, pat(info) {
          const l = info.l, p = info.part;
          if (!l) return 0;
          // the mask: a dark band round the eyes, pale cheeks and brow, a dark muzzle tip
          if (p === 'head') {
            if (l[2] > 0.2 && l[1] > -0.35 && l[1] < 0.28 && Math.abs(l[0]) > 0.18) return { R: D };
            if (l[2] > 0.25 && l[1] >= 0.28 && l[1] < 0.62) return { R: U };
            if (l[1] < -0.35 && l[2] > 0) return { R: U };
            if (Math.abs(l[0]) > 0.72 && l[1] < 0.2) return { R: U }; // cheek ruff
            if (l[1] > 0.55) return { R: SD };
            return 0;
          }
          if (p === 'muzzle') return l[2] > 0.55 ? { R: D } : l[1] < 0 ? { R: U } : { R: U, d: -1 };
          // the cheek ruff: pale tufts with a dark root where they leave the face
          if (p === 'ruff') return (info.u || 0) < 0.25 ? { R: D } : { R: U };
          if (p === 'leg' || p === 'hleg' || p === 'paw' || p === 'hpaw') return { R: D };
          if (p === 'haunch') return l[1] < -0.2 ? { R: D } : l[1] > 0.55 ? { R: FR } : 0;
          if (p === 'neck') return l[1] < -0.2 ? { R: D } : l[1] > 0.4 ? { R: SD } : 0;
          // a dark chest and a dark band across the shoulders running down to the forelegs, a darker
          // line down the back, and the grizzled, frost-tipped coat over the back and hips
          if (p === 'chest') return l[1] < -0.1 || l[2] > 0.55 ? { R: D } : l[1] > 0.3 ? { R: SD, d: l[1] > 0.6 && Math.abs(l[0]) < 0.4 ? -1 : 0 } : Math.abs(l[0]) > 0.6 && l[2] > 0 ? { R: SD } : 0;
          if (p === 'belly') return l[1] < -0.5 ? { R: D } : l[1] > 0.55 && Math.abs(l[0]) < 0.4 ? { R: SD } : l[1] > 0.62 ? { R: FR } : 0;
          if (p === 'hips') return l[1] > 0.6 && Math.abs(l[0]) < 0.4 ? { R: SD } : l[1] > 0.45 && Math.abs(l[0]) < 0.7 ? { R: FR } : 0;
          if (p === 'tail') return (info.u || 0) > 0.66 ? { R: D } : l[1] > 0.1 ? { R: SD } : 0; // darker above, a dark tip, no rings
          return 0;
        },
      };
      M.ear = { R: D, th, pat(info) { return info.inner ? { R: U, d: -1 } : (info.u || 0) < 0.6 ? { R: SD } : 0; } };
      M.nose = { R: A.flat(L.nose, 0.5), flag: 3 };
    } else if (sp === 'bird') {
      const CAP = ramp(L.cap), BK = ramp(L.back), ST = ramp(L.streak), BAR = ramp(L.bar), CH = ramp(L.cheek);
      const sparrow = L.pattern === 'sparrow';
      M.fur = {
        R, th: [0.66, 0.3, -0.1, -0.5], pat(info) {
          const l = info.l, p = info.part;
          if (!l) return 0;
          if (p === 'head') {
            if (l[1] > 0.32) return { R: CAP };
            if (l[2] > 0.35 && l[1] < -0.2) return { R: sparrow ? ramp('#3a2c28') : U }; // bib
            if (Math.abs(l[0]) > 0.58 && l[1] < 0.22 && l[1] > -0.4) return sparrow && blob(l, [Math.sign(l[0]) * 0.85, -0.15, -0.15], 0.24) ? { R: ramp('#3a2c28') } : { R: CH };
            return 0;
          }
          if (p === 'body') {
            if (l[1] < -0.05 && l[2] > -0.6) return { R: U };
            if (l[1] > 0.3) return sparrow && frac(l[0] * 3 + l[2] * 1.5) < 0.25 ? { R: ST } : { R: BK };
            return 0;
          }
          if (p === 'wing') {
            // folded: coverts, one pale wing bar, the darker secondaries, the primaries at the tip — in bands
            // along the wing (no speckle); spread: the same bands from the root out
            const u = info.u || 0;
            if (u > 0.74) return { R: ST };
            if (u > 0.3 && u < 0.4) return { R: BAR };
            if (u >= 0.4) return { R: BK, d: -1 };
            return { R: BK };
          }
          if (p === 'tailf') return { R: ST };
          return 0;
        },
      };
      M.beak = { R: A.flat(L.beak, 0.7), th: [0.5, 0.1, -0.3, -0.7] };
      M.leg = { R: A.flat(L.leg, 0.6), min: 1, max: 3 };
    }
    M.eye = L.eye;
    mcache.set(key, M);
    return M;
  }

  // ---- geometry helpers --------------------------------------------------------------------------------
  const L3 = (a, b, t) => lerp(a, b, t);
  const n3 = (a, b, c, wa, wb, wc) => [a[0] * wa + b[0] * wb + c[0] * wc, a[1] * wa + b[1] * wb + c[1] * wc, a[2] * wa + b[2] * wb + c[2] * wc];
  // blend a key (object of points and radii) from three keys by weights
  function mix3(Ka, Kb, Kc, wa, wb, wc) {
    const out = {};
    for (const k in Ka) {
      const a = Ka[k], b = Kb[k] || a, c = Kc[k] || a;
      if (Array.isArray(a) && typeof a[0] === 'number') out[k] = a.map((v, i) => v * wa + b[i] * wb + c[i] * wc);
      else if (Array.isArray(a)) out[k] = a.map((p, i) => n3(p, b[i] || p, c[i] || p, wa, wb, wc));
      else if (typeof a === 'number') out[k] = a * wa + b * wb + c * wc;
      else out[k] = a;
    }
    return out;
  }
  // two-bone IK in the plane: from a toward t (lengths l1, l2), bending toward pole
  function ik(a, t, l1, l2, pole) {
    let d = sub(t, a), dl = len(d);
    const maxl = l1 + l2 - 0.01;
    if (dl > maxl) { d = mul(d, maxl / dl); dl = maxl; }
    const dn = norm(d);
    const x = (l1 * l1 - l2 * l2 + dl * dl) / (2 * dl);
    const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
    let pv = sub(pole, mul(dn, A.V.dot(pole, dn)));
    pv = len(pv) < 1e-6 ? [0, 0, -1] : norm(pv);
    return add(add(a, mul(dn, x)), mul(pv, h));
  }
  // a smooth curve through control points (Catmull-Rom), n samples
  function curve(pts, n) {
    const out = [];
    const P0 = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
    for (let k = 0; k <= n; k++) {
      const t = (k / n) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(t)), u = t - i;
      const p0 = P0(i - 1), p1 = P0(i), p2 = P0(i + 1), p3 = P0(i + 2);
      const u2 = u * u, u3 = u2 * u;
      out.push([0, 1, 2].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3)));
    }
    return out;
  }

  // ---- quadruped keys: stand, sit, lie (body space: x its right, y up, z its nose; ground at y 0) -------
  // Species shape: proportions for the cat (slim, round head, tall ears, long tail), the dog (deeper
  // chest, longer muzzle, erect ears, a tail curled over the back) and the tanuki (round, short dark
  // legs, small round ears, a masked face, a bushy tail with a dark tip).
  const Q = {
    cat: {
      keys: {
        stand: { chest: [0, 8.3, 4.2], hips: [0, 8.6, -4.0], head: [0, 12.6, 8.4], sh: [1.7, 7.8, 4.6], hip: [1.7, 8.2, -4.4], fpaw: [1.6, 0.8, 5.0], hpaw: [1.6, 0.8, -5.2], haunch: [1.9, 7.0, -4.2], tail: [[0, 9.6, -7.2], [0, 10.6, -9.6], [0, 13.4, -11.0], [0, 16.2, -10.6], [0, 17.2, -9.2]], chestR: [3.2, 3.4, 3.6], hipsR: [3.0, 3.3, 3.5], haunchR: [1.4, 2.4, 2.4], hpawR: [1.0, 0.8, 1.5] },
        sit: { chest: [0, 8.9, 2.3], hips: [0, 4.2, -2.4], head: [0, 14.2, 4.0], sh: [1.5, 7.3, 2.9], hip: [2.2, 3.6, -2.0], fpaw: [1.35, 0.8, 3.7], hpaw: [2.6, 0.8, 1.2], haunch: [2.7, 3.6, -1.2], tail: [[0, 1.8, -5.8], [2.4, 1.1, -7.0], [5.0, 1.1, -5.4], [5.9, 1.1, -2.0], [5.2, 1.1, 1.6], [3.4, 1.1, 3.9]], chestR: [3.0, 3.5, 3.0], hipsR: [4.2, 3.8, 3.8], haunchR: [2.0, 2.9, 3.4], hpawR: [1.1, 0.8, 1.9] },
        lie: { chest: [0, 4.2, 3.2], hips: [0, 4.2, -3.4], head: [0, 7.8, 6.8], sh: [1.6, 3.4, 4.6], hip: [1.8, 3.4, -3.4], fpaw: [1.3, 0.9, 6.3], hpaw: [2.2, 0.9, -0.6], haunch: [2.3, 3.2, -2.6], tail: [[0, 3.0, -6.6], [2.0, 1.2, -7.4], [3.9, 1.0, -5.0], [4.3, 1.0, -1.6], [3.8, 1.0, 1.8]], chestR: [3.4, 3.4, 3.6], hipsR: [3.4, 3.4, 3.6], haunchR: [1.6, 2.4, 2.8], hpawR: [0.9, 0.8, 1.6] },
      },
      bellyR: [2.9, 3.0], neckR: 2.2, headR: [3.7, 3.3, 3.4], muzzle: { off: [0, -1.1, 2.5], r: [1.7, 1.2, 1.3] },
      ears: { base: [1.75, 2.1, 0.1], tip: [2.5, 5.3, -0.3], r: [1.55, 0.25], flat: 0.42 }, eye: { off: [1.35, 0.25, 2.75], w: 1 }, nose: [0, -0.4, 3.55],
      leg: { r: [1.25, 0.95, 0.9], upper: 4.1, lower: 3.9 }, fpawR: [1.0, 0.75, 1.3], hleg: { r: [1.2, 0.9, 0.85] }, tail: { r: [1.0, 0.95, 0.9, 0.85, 0.8, 0.75], wag: 0 },
    },
    dog: {
      keys: {
        stand: { chest: [0, 10.2, 5.0], hips: [0, 10.0, -4.4], head: [0, 15.2, 9.4], sh: [1.9, 9.6, 5.4], hip: [1.9, 9.8, -4.8], fpaw: [1.9, 0.9, 5.8], hpaw: [1.9, 0.9, -5.6], haunch: [2.1, 8.6, -4.6], tail: [[0, 11.6, -7.6], [0, 14.2, -8.6], [0, 16.4, -7.4], [0, 16.6, -5.2], [0, 15.0, -4.2]], chestR: [3.7, 4.3, 4.2], hipsR: [3.3, 3.6, 3.7], haunchR: [1.6, 2.8, 2.7], hpawR: [1.2, 0.9, 1.6] },
        sit: { chest: [0, 10.2, 2.8], hips: [0, 4.7, -2.8], head: [0, 16.0, 5.0], sh: [1.8, 8.6, 3.4], hip: [2.2, 4.2, -2.4], fpaw: [1.7, 0.9, 4.6], hpaw: [2.7, 0.9, 1.2], haunch: [2.9, 4.1, -1.4], tail: [[0, 5.4, -5.6], [1.0, 8.0, -6.8], [2.4, 9.8, -5.8], [3.0, 9.6, -3.8], [2.6, 8.0, -3.0]], chestR: [3.5, 4.5, 3.5], hipsR: [4.2, 3.9, 3.8], haunchR: [1.9, 3.2, 3.6], hpawR: [1.2, 0.9, 2.0] },
        lie: { chest: [0, 4.8, 3.4], hips: [0, 4.4, -4.0], head: [0, 9.8, 7.6], sh: [1.9, 3.8, 5.0], hip: [2.0, 3.6, -4.0], fpaw: [1.6, 0.9, 9.4], hpaw: [2.6, 0.9, -1.0], haunch: [2.6, 3.4, -3.0], tail: [[0, 3.6, -7.4], [1.8, 1.4, -9.0], [3.8, 1.1, -8.0], [4.6, 1.0, -5.6]], chestR: [3.7, 3.8, 4.0], hipsR: [3.6, 3.6, 3.8], haunchR: [1.8, 2.6, 3.0], hpawR: [1.1, 0.9, 1.8] },
      },
      bellyR: [3.1, 3.1], neckR: 2.8, headR: [3.6, 3.35, 3.5], muzzle: { off: [0, -1.2, 3.3], r: [1.7, 1.45, 2.3] },
      ears: { base: [1.7, 2.3, -0.3], tip: [2.3, 5.4, -0.1], r: [1.7, 0.35], flat: 0.45 }, eye: { off: [1.3, 0.6, 2.7], w: 1 }, nose: [0, -0.5, 5.7],
      leg: { r: [1.45, 1.1, 1.05], upper: 5.0, lower: 4.7 }, fpawR: [1.2, 0.85, 1.45], hleg: { r: [1.4, 1.05, 1.0] }, tail: { r: [1.5, 1.6, 1.5, 1.3, 1.0], curl: true },
    },
    tanuki: {
      keys: {
        stand: { chest: [0, 7.6, 3.8], hips: [0, 7.8, -3.6], head: [0, 10.6, 8.0], sh: [1.9, 6.2, 4.2], hip: [1.9, 6.4, -4.0], fpaw: [1.9, 0.8, 4.6], hpaw: [1.9, 0.8, -4.6], haunch: [2.2, 5.8, -3.8], tail: [[0, 8.4, -7.2], [0, 7.8, -9.6], [0, 6.2, -11.2], [0, 4.6, -11.6]], chestR: [4.0, 4.1, 4.0], hipsR: [4.2, 4.3, 4.2], haunchR: [1.7, 2.3, 2.4], hpawR: [1.1, 0.8, 1.4] },
        sit: { chest: [0, 7.8, 1.6], hips: [0, 4.4, -2.0], head: [0, 11.8, 3.2], sh: [1.8, 6.6, 2.6], hip: [2.2, 3.6, -1.8], fpaw: [1.7, 0.8, 3.4], hpaw: [2.8, 0.8, 1.6], haunch: [2.9, 3.3, -1.0], tail: [[0, 2.4, -5.6], [2.4, 1.9, -7.2], [5.0, 1.9, -6.4], [6.4, 1.9, -3.8], [6.6, 1.9, -1.2]], chestR: [4.2, 4.0, 3.8], hipsR: [5.0, 4.4, 4.4], haunchR: [2.1, 2.7, 3.1], hpawR: [1.1, 0.8, 1.7] },
        lie: { chest: [0, 4.6, 2.8], hips: [0, 4.6, -3.0], head: [0, 7.4, 6.4], sh: [1.8, 3.6, 4.2], hip: [2.0, 3.4, -3.0], fpaw: [1.5, 0.9, 6.2], hpaw: [2.4, 0.9, -0.4], haunch: [2.4, 3.2, -2.4], tail: [[0, 3.4, -6.2], [2.2, 1.6, -7.4], [4.4, 1.5, -5.2], [5.0, 1.4, -2.0]], chestR: [4.0, 4.0, 3.8], hipsR: [4.2, 4.2, 4.0], haunchR: [1.8, 2.4, 2.6], hpawR: [1.0, 0.8, 1.5] },
      },
      bellyR: [3.8, 3.8], neckR: 3.0, headR: [3.9, 3.4, 3.4], muzzle: { off: [0, -1.1, 2.9], r: [1.4, 1.15, 1.9] },
      ears: { base: [2.1, 2.2, -0.4], tip: [2.6, 4.2, -0.6], r: [1.4, 0.7], flat: 0.5 }, eye: { off: [1.3, 0.2, 2.8], w: 1 }, nose: [0, -0.8, 4.8],
      leg: { r: [1.2, 1.0, 0.95], upper: 3.2, lower: 3.0 }, fpawR: [1.0, 0.75, 1.2], hleg: { r: [1.2, 0.95, 0.9] }, tail: { r: [1.8, 2.6, 2.9, 2.7, 2.0], bushy: true },
    },
  };

  // Every key's tail gets the same number of points (evenly along its curve), so keys blend.
  function resample(pts, n) {
    const c = curve(pts, 40);
    const acc = [0];
    for (let i = 1; i < c.length; i++) acc.push(acc[i - 1] + len(sub(c[i], c[i - 1])));
    const L = acc[acc.length - 1], out = [];
    for (let k = 0; k <= n; k++) {
      const want = (L * k) / n;
      let i = 1;
      while (i < c.length - 1 && acc[i] < want) i++;
      const t = (want - acc[i - 1]) / ((acc[i] - acc[i - 1]) || 1);
      out.push(lerp(c[i - 1], c[i], Math.max(0, Math.min(1, t))));
    }
    return out;
  }
  for (const sp in Q) for (const k in Q[sp].keys) Q[sp].keys[k].tail = resample(Q[sp].keys[k].tail, 6);

  // ---- the cycle of a walk / a trot ------------------------------------------------------------------------
  // Walk: a lateral sequence (left hind, left fore, right hind, right fore), each foot on the ground
  // for 62 % of the cycle. Run (catching up): a trot, diagonal pairs, longer reach and more lift.
  function footOf(ph, off, run) {
    const duty = run ? 0.5 : 0.62;
    const p = frac(ph - off);
    if (p < duty) { const t = p / duty; return { dz: (0.5 - t), lift: 0 }; }
    const t = (p - duty) / (1 - duty);
    return { dz: -0.5 + t, lift: Math.sin(Math.PI * t) };
  }

  // ---- building one quadruped frame ------------------------------------------------------------------------------
  function quadruped(K, sp, M, po, sc) {
    const S = Q[sp];
    const sit = Math.max(0, Math.min(1, po.sit || 0)), lie = Math.max(0, Math.min(1 - sit, po.lie || 0)), st = 1 - sit - lie;
    const k = mix3(S.keys.stand, S.keys.sit, S.keys.lie, st, sit, lie);
    const run = po.gait === 'run', walking = po.gait === 'walk' || run;
    const ph = po.ph || 0;
    const stride = (run ? 5.4 : 3.4) * (sp === 'tanuki' ? 0.8 : sp === 'dog' ? 1.1 : 1);
    const lift = run ? 2.2 : 1.3;
    // body offsets: crouch lowers the body, lean moves the chest over the forepaws, rise lifts the front
    const crouch = (po.crouch || 0) * (st > 0.5 ? 2.2 : 1.2);
    const bob = walking ? (run ? Math.abs(Math.sin(ph * Math.PI * 2)) * 0.9 - 0.4 : Math.sin(ph * Math.PI * 4) * 0.3) : 0;
    const breath = (po.breath || 0) * 0.35;
    const lean = (po.lean || 0) * 1.4;
    const rise = po.rise || 0;
    const tall = po.tall || 0;
    const dy = -crouch + bob;
    const chest = add(k.chest, [0, dy + breath + rise * 4.2 + tall * 1.3, lean - rise * 1.6]);
    const hips = add(k.hips, [0, dy * 0.9 - rise * 0.8, lean * 0.4 + rise * 0.6]);
    let head = add(k.head, [0, dy + breath * 0.6 + rise * 6.0 + tall * 2.0 + (po.headY || 0), lean * 1.1 - rise * 3.0 + (po.headZ || 0)]);
    if (run) { chest[2] += 0.6; head = add(head, [0, -1.0, 1.2]); }
    const spine = sub(chest, hips);
    const SM = along(spine, [0, 1, 0]);
    const mid = L3(hips, chest, 0.5);
    const blen = len(spine);
    // the trunk as one light mass (the larger views): body, haunches and legs share its planes
    if (sc >= 1.4) {
      const top = Math.max(chest[1] + k.chestR[1], hips[1] + k.hipsR[1]);
      const rz = Math.abs(chest[2] - hips[2]) / 2 + Math.max(k.chestR[2], k.hipsR[2]);
      K.mass([0, top * 0.5, (chest[2] + hips[2]) / 2], [Math.max(k.chestR[0], k.hipsR[0]) * 1.3, top * 0.5 + 1, rz], 0.5);
    }
    // belly and body
    K.ell('belly', mid, [S.bellyR[0], S.bellyR[1] - (po.tuck || 0) * 0.4, blen * 0.62], M.fur, { M: SM, grp: 'body' });
    K.ell('hips', hips, k.hipsR, M.fur, { M: SM, grp: 'body' });
    K.ell('chest', chest, add(k.chestR, [0, breath * 0.5, 0]), M.fur, { M: SM, grp: 'body' });
    // neck to the head
    const neckA = add(chest, mul(SM[2], k.chestR[2] * 0.55)), neckB = add(head, [0, -1.4, -1.0]);
    K.chain('neck', [add(neckA, [0, 0.8, 0]), neckB], [S.neckR, S.neckR * 0.9], M.fur, { grp: 'body' });

    // legs: the four paws, planted or lifted by the gait, the hind legs with a haunch and a hock
    const fr = (side) => {
      const x = side;
      const shoulder = add([k.sh[0] * x, k.sh[1], k.sh[2]], [0, dy + rise * 2.8 + tall * 1.0, lean * 0.9 - rise * 0.8]);
      let paw = [k.fpaw[0] * x + (po.spread || 0) * 0.9 * x, k.fpaw[1], k.fpaw[2] + lean * 0.6];
      if (walking && st > 0.5) {
        const f = footOf(ph, x < 0 ? 0.25 : 0.75, run);
        paw = add(paw, [0, f.lift * lift, f.dz * stride]);
      }
      // a paw raised and reaching (the cat's restrained reach), or both up (the tanuki's gestures)
      const reach = x > 0 ? po.pawR || 0 : po.pawL || 0;
      const up = po.pawsUp || 0, gather = po.paws || 0;
      if (reach) paw = L3(paw, add(shoulder, [x * 0.2, -1.0 + reach * 1.2, 3.8]), Math.min(1, reach));
      if (gather) paw = L3(paw, add(shoulder, [-x * 0.9, -2.2, 2.4]), gather);
      if (up) paw = L3(paw, add(shoulder, [x * 0.6, 3.2, 1.6]), up);
      if (rise > 0.3) paw = L3(paw, add(shoulder, [x * 0.4, -2.4, 1.8]), Math.min(1, (rise - 0.3) / 0.5));
      // the right paw to the brow (shading the eyes) or to the side of the head (a thoughtful scratch)
      if (x > 0 && po.shade) paw = L3(paw, add(head, [1.2, 0.9, 2.2]), po.shade);
      if (x > 0 && po.scratch) paw = L3(paw, add(head, [2.4, 1.2 + Math.sin((po.scratchPh || 0) * Math.PI * 2) * 0.5, -0.2]), po.scratch);
      const elbow = ik(shoulder, paw, S.leg.upper, S.leg.lower, [0, 0, -1]);
      K.chain('leg', [shoulder, elbow, paw], S.leg.r, M.fur, { grp: 'fl' + x });
      K.ell('paw', add(paw, [0, 0.05, 0.3]), S.fpawR, M.fur, { grp: 'fl' + x });
    };
    const hi = (side) => {
      const x = side;
      const hipJ = add([k.hip[0] * x, k.hip[1], k.hip[2]], [0, dy * 0.9 - rise * 0.8, lean * 0.4]);
      let paw = [k.hpaw[0] * x, k.hpaw[1], k.hpaw[2]];
      if (walking && st > 0.5) {
        const f = footOf(ph, x < 0 ? 0 : 0.5, run);
        paw = add(paw, [0, f.lift * lift * 0.9, f.dz * stride]);
      }
      const haunch = add([k.haunch[0] * x, k.haunch[1], k.haunch[2]], [0, dy * 0.8 - rise * 0.6, lean * 0.3]);
      const hM = along(sub(chest, hips), [0, 1, 0]);
      K.ell('haunch', haunch, k.haunchR, M.fur, { M: hM, grp: 'hl' + x });
      if (sit < 0.6 && lie < 0.6) {
        // knee under the haunch, the hock behind: a hind leg reads as a hind leg
        const knee = add(haunch, [0, -k.haunchR[1] * 0.7, k.haunchR[2] * 0.25]);
        const hock = ik(knee, paw, (knee[1] - paw[1]) * 0.55 + 0.6, (knee[1] - paw[1]) * 0.6 + 0.6, [0, 0, -1]);
        K.chain('hleg', [knee, hock, paw], S.hleg.r, M.fur, { grp: 'hl' + x });
      }
      K.ell('hpaw', add(paw, [0, 0.05, 0.4]), k.hpawR, M.fur, { grp: 'hl' + x });
      void hipJ;
    };
    // draw order does not matter (depth buffer); groups separate the contour
    fr(1); fr(-1); hi(1); hi(-1);

    // tail (its own form) and head (its own mass: brow, cheeks and muzzle share the head's planes)
    K.mass(null);
    tail(K, sp, M, po, k, dy, st, sit, lie, ph, walking);
    if (sc >= 1.4) K.mass(head, S.headR.map((v) => v * 1.3), 0.35);
    headOf(K, sp, M, po, head, sc);
    K.mass(null);
    return { head, chest };
  }
  function tail(K, sp, M, po, k, dy, st, sit, lie, ph, walking) {
    const S = Q[sp];
    const base = k.tail[0];
    let pts = k.tail.map((p, i) => (i === 0 ? add(p, [0, dy * 0.9, 0]) : add(p, [0, dy * (st > 0.5 ? 1 : 0.2), 0])));
    // raise, swing aside, curl and flick: rotate each point about the base, more toward the tip
    const up = (po.tUp || 0) * DEG, side = (po.tSide || 0) * DEG, flick = (po.tFlick || 0) * DEG;
    let wag = po.wag || 0;
    if (walking && st > 0.5) wag += Math.sin(ph * Math.PI * 2) * (sp === 'dog' ? 0.25 : 0.12);
    const n = pts.length;
    pts = pts.map((p, i) => {
      if (i === 0) return p;
      const t = i / (n - 1);
      let q = sub(p, base);
      if (up) q = mv(rotX(-up * t), q);
      const sw = side * t + wag * 0.5 * t + (i === n - 1 ? flick : i === n - 2 ? flick * 0.5 : 0);
      if (sw) q = mv(rotY(sw), q);
      return add(base, q);
    });
    const smooth = curve(pts, (n - 1) * 2);
    const radii = smooth.map((_, i) => { const t = i / (smooth.length - 1); const r = S.tail.r; const f = t * (r.length - 1), a = Math.floor(f), b = Math.min(r.length - 1, a + 1); return r[a] + (r[b] - r[a]) * (f - a); });
    const pat = M.fur;
    // the tail's underside (dogs: pale under the curl) is known by the part's own "up"
    K.chain('tail', smooth, radii, S.tail.bushy ? { R: pat.R, th: pat.th, pat: (info, v, l) => pat.pat(Object.assign({}, info, { part: 'tail' }), v, l) } : pat, { grp: 'tail', up: [0, 1, 0], keep: null });
  }
  function headOf(K, sp, M, po, c, sc) {
    const S = Q[sp];
    const Mh = mm(rotY((po.hy || 0) * DEG), mm(rotX((po.hp || 0) * DEG), rotZ((po.hr || 0) * DEG)));
    const at = (o) => add(c, mv(Mh, o));
    K.ell('head', c, S.headR, M.fur, { M: Mh, grp: 'head' });
    // the muzzle (cats: small, dogs: long, tanuki: pointed)
    K.ell('muzzle', at(S.muzzle.off), S.muzzle.r, M.fur, { M: Mh, grp: 'head' });
    if (sp === 'dog') K.ell('muzzle', at([0, -0.4, 4.6]), [1.25, 1.1, 1.3], M.fur, { M: Mh, grp: 'head' });
    if (sp === 'tanuki') {
      K.ell('head', at([0, -0.6, -0.4]), [3.9, 2.6, 2.8], M.fur, { M: Mh, grp: 'head' }); // cheek ruff
      // the ruff's tufts: pale fur swept out and down from each cheek (the tanuki's silhouette)
      for (const x of [1, -1]) K.chain('ruff', [at([x * 2.8, -1.0, 0.7]), at([x * 4.2, -1.9, 0.1]), at([x * 4.9, -2.8, -0.3])], [1.25, 0.85, 0.3], M.fur, { grp: 'head' });
    }
    // ears: flattened tapering cones; the inner ear shows on the side facing forward
    const E = S.ears;
    for (const x of [1, -1]) {
      const tw = (x > 0 ? po.earR : po.earL) || 0;
      const back = (po.earF || 0) * -1 + tw;             // + folds back
      const wind = (po.wind || 0) * x * 0.6;
      const b = [E.base[0] * x, E.base[1], E.base[2]];
      let tip = [E.tip[0] * x, E.tip[1], E.tip[2]];
      // fold back / turn: rotate the tip about the base
      let q = sub(tip, b);
      q = mv(rotX(back * 38 * DEG), q);
      q = mv(rotZ((-x * back * 10 + wind * 20) * DEG), q);
      tip = add(b, q);
      const mid = L3(b, tip, 0.5);
      // the way the face points, in the world (normals reach the pattern in world space)
      const fwd = K.dir(mv(Mh, [0, 0, 1]));
      const pts = [at(b), at(mid), at(tip)];
      const rr = [E.r[0], (E.r[0] + E.r[1]) * 0.55, E.r[1]];
      K.chain('ear', pts, rr, { R: M.ear.R, th: M.ear.th, pat: (info, v, l) => {
        const faceFwd = A.V.dot(info.n, fwd) > 0.35;
        return M.ear.pat(Object.assign({}, info, { inner: faceFwd && (info.u || 0) < 0.78 && Math.abs(info.l[0]) < 0.62, side: x }), v, l);
      } }, { grp: 'ear' + x, up: fwd, flat: [1, E.flat] });
    }
    // eyes and nose: decals where they are visible
    const blink = po.blink || 0;
    const eye = M.eye;
    const big = sc >= 1.5;
    for (const x of [1, -1]) {
      const e = S.eye.off;
      K.decal(at([e[0] * x, e[1], e[2]]), (d) => {
        const b = d.b;
        if (blink > 0.6) { b.rect(d.x - (big ? 1 : 0), d.y, big ? 3 : 2, 1, '#241c20'); return; }
        if (big) {
          // an upper lid, a 2×2 iris with its pupil (a cat's is a slit), a glint toward the light
          b.rect(d.x - 1, d.y - 2, 3, 1, '#241c20');
          b.rect(d.x - 1, d.y - 1, 2, 2, eye);
          b.px(d.x, d.y - 1, '#241c20');
          if (sp === 'cat') b.px(d.x, d.y, '#241c20');
          if (blink > 0.25) b.rect(d.x - 1, d.y - 1, 2, 1, '#241c20');
          else b.px(d.x - 1, d.y - 1, '#fff8ee');
        } else {
          b.px(d.x, d.y, '#241c20');
          if (blink < 0.25) b.px(d.x, d.y - 1, sp === 'cat' ? eye : '#241c20');
        }
      }, { tol: 1.2, grp: 'head' });
    }
    K.decal(at(S.nose), (d) => { d.b.px(d.x, d.y, M.nose.R[1]); if (big) d.b.px(d.x + (d.mirror ? 1 : -1), d.y, M.nose.R[2]); }, { tol: 1.4, grp: 'head' });
    if ((po.nose || 0) > 0.5 && sp === 'tanuki') K.decal(at(add(S.nose, [0, 0.4, -0.1])), (d) => d.b.px(d.x, d.y - 1, '#241c20'), { tol: 1.4, grp: 'head' });
  }

  // ---- the bird --------------------------------------------------------------------------------------------
  // A small stylized bird: a round body, a round head, a short beak, a tail of flat feathers, folded wings
  // that open and beat, thin legs. Poses: stand (a perky upright), hop (both feet tucked), fly (wings up
  // and down through `flap`), perch-rest (fluffed, head in), preen (beak to the shoulder).
  function bird(K, M, po, sc) {
    const fluff = (po.fluff || 0) * 0.45 + (po.lie || 0) * 0.35;
    const tuck = po.tuck || 0;
    const crouch = (po.crouch || 0) * 1.0 + (po.sit || 0) * 0.6 + (po.lie || 0) * 1.4;
    const bodyY = 4.3 - crouch + (po.breath || 0) * 0.2;
    const lean = (po.lean || 0) * 14 * DEG;
    const bodyM = rotX(-24 * DEG + lean + (po.lie || 0) * 14 * DEG);
    const body = [0, bodyY, 0];
    const bigB = sc >= 1.4;
    // the body, wings and tail as one light mass in the larger views
    if (bigB) K.mass(body, [3.0 + fluff, 3.0 + fluff, 3.8], 0.45);
    K.ell('body', body, [2.35 + fluff, 2.3 + fluff, 2.9 + fluff * 0.5], M.fur, { M: bodyM, grp: 'body' });
    // head: round, set forward on the body; a preen turns it back to the shoulder
    const preen = po.preen || 0;
    const head = add(body, [preen * 1.0, 2.5 - tuck * 0.9 - preen * 0.6 + (po.headY || 0), 1.7 - preen * 1.6 + (po.headZ || 0)]);
    const Mh = mm(rotY(((po.hy || 0) + preen * 120) * DEG), mm(rotX(((po.hp || 0) + preen * 20) * DEG), rotZ((po.hr || 0) * DEG)));
    const at = (o) => add(head, mv(Mh, o));
    if (bigB) K.mass(head, [2.3, 2.2, 2.3], 0.3);
    K.ell('head', head, [1.85 + fluff * 0.3, 1.75 + fluff * 0.3, 1.85], M.fur, { M: Mh, grp: 'head' });
    if (bigB) K.mass(body, [3.0 + fluff, 3.0 + fluff, 3.8], 0.45);
    // beak: a short cone (two halves: it opens a little when it calls)
    const bo = (po.beak || 0) * 0.5;
    K.chain('beak', [at([0, -0.1 + bo * 0.3, 1.45]), at([0, -0.3, 2.75])], [0.62, 0.12], M.beak, { grp: 'head' });
    if (bo) K.chain('beak', [at([0, -0.55, 1.4]), at([0, -0.9 - bo, 2.4])], [0.42, 0.1], M.beak, { grp: 'head' });
    // tail: a short flat fan behind and a little down
    const tf = (po.tUp || 0) * DEG;
    const tailA = add(body, mv(bodyM, [0, 0.3, -2.2]));
    const tailB = add(body, mv(bodyM, mv(rotX(-tf), [0, -0.2, -4.9])));
    K.chain('tailf', [tailA, tailB], [0.95, 0.8], M.fur, { grp: 'tail', flat: [1.45, 0.32], up: [0, 1, 0] });
    // wings: folded against the body, or spread (a broad thin shape) and beating
    const spread = Math.max(0, Math.min(1, po.wing || 0));
    const flap = po.flap != null ? Math.sin((po.flap || 0) * Math.PI * 2) : 0.4;
    for (const x of [1, -1]) {
      if (spread < 0.15) {
        const root = add(body, mv(bodyM, [x * 1.55, 0.9, 1.0]));
        const tip = add(body, mv(bodyM, [x * 1.7, 0.1, -3.2]));
        const mid = add(body, mv(bodyM, [x * 2.05, 0.4, -0.9]));
        K.chain('wing', [root, mid, tip], [1.45, 1.35, 0.5], M.fur, { grp: 'wing' + x, flat: [0.5, 1], up: [0, 1, 0] });
      } else {
        const root = add(body, mv(bodyM, [x * 1.4, 1.0, 0.4]));
        const lift = (0.2 + 0.8 * flap) * spread;
        const tip = add(root, [x * 5.2 * spread, 0.6 + lift * 3.6, -1.0]);
        const mid = add(L3(root, tip, 0.5), [0, 0.8 * lift, 0]);
        K.chain('wing', [root, mid, tip], [1.6, 1.4, 0.55], M.fur, { grp: 'wing' + x, flat: [0.34, 1.55], up: [0, 0, 1] });
      }
    }
    // legs (tucked while it hops or flies)
    const legUp = Math.max(tuck, spread > 0.3 ? 1 : 0, po.hopping ? 1 : 0);
    K.mass(null);
    // thin legs (finer in the larger views, where a leg was a two-pixel block), toes forward
    const lr = bigB ? 0.8 : 1;
    for (const x of [1, -1]) {
      const top = add(body, [x * 0.85, -1.7, 0.2]);
      const foot = legUp ? add(top, [0, -0.8, -0.7]) : [x * 0.85, 0.35, 0.5];
      K.chain('leg', [top, foot], [0.42 * lr, 0.3 * lr], M.leg, { grp: 'leg' + x });
      if (!legUp) K.chain('leg', [add(foot, [0, 0, -0.5]), add(foot, [0, 0, 1.1])], [0.3 * lr, 0.24 * lr], M.leg, { grp: 'leg' + x });
    }
    // eye
    const blink = po.blink || 0, big = sc >= 1.5;
    for (const x of [1, -1]) {
      K.decal(at([x * 1.3, 0.35, 0.95]), (d) => {
        const b = d.b;
        if (blink > 0.6) { b.rect(d.x, d.y, big ? 2 : 1, 1, '#3a2c2c'); return; }
        b.px(d.x, d.y, M.eye);
        if (big) { b.px(d.x, d.y - 1, M.eye); b.px(d.x + (d.mirror ? 1 : -1), d.y - 1, '#fff8ee'); }
      }, { tol: 1.1, grp: 'head' });
    }
    return { head, chest: body };
  }

  // ---- views and the frame cache -------------------------------------------------------------------------------
  // World: 32×32 (the bird 24×24), feet at the anchor; Battle: 48×48 (the bird 40×40).
  const SIZES = {
    world: { quad: { w: 32, h: 32, ax: 16, ay: 29, zs: 1 }, bird: { w: 24, h: 24, ax: 12, ay: 21, zs: 1.2 } },
    battle: { quad: { w: 48, h: 56, ax: 22, ay: 45, zs: 1.72 }, bird: { w: 40, h: 40, ax: 20, ay: 35, zs: 1.9 } }, // (quad h 56: the tanuki's tail lying on the ground was cut at 52)
  };
  const YAW = { up: 0, right: 90, down: 180, left: -90 };
  // battle scale per species: sitting, each is about 40–45 % of an adventurer's 86 px (the bird less)
  const BZS = { cat: 1.72, dog: 1.5, tanuki: 1.78, bird: 2.25 }; // the bird a little larger than before (1.9): its wing bar, cap and cheek read
  const cache = new Map();
  let built = 0, hits = 0;
  const CAP = 900;
  // quantize a pose so nearby moments share a frame
  function poseKey(po) {
    const ks = Object.keys(po).sort();
    return ks.map((k) => { const v = po[k]; return k + ':' + (typeof v === 'number' ? Math.round(v * 20) / 20 : v); }).join(',');
  }
  function frame(sp, lk, view, po) {
    po = po || {};
    if (!LOOKS[sp]) return null;
    if (!LOOKS[sp][lk]) lk = LOOK_ORDER[sp][0];
    // battle density: the party's drawn height over the 86 px these sizes were tuned for (0.75..2.5, in 0.05 steps)
    const dens = view.kind === 'battle' && view.density ? Math.max(0.75, Math.min(2.5, Math.round(view.density * 20) / 20)) : 1;
    const vk = view.kind === 'world' ? 'w' + view.dir + (view.turn != null ? '~' + view.turn : '') : view.kind === 'portrait' ? 'p' + view.size + (view.yaw != null ? '~' + view.yaw : '') : view.kind === 'preview' ? 'v' : 'b' + (dens !== 1 ? dens : '');
    const key = sp + '|' + lk + '|' + vk + '|' + poseKey(po);
    let f = cache.get(key);
    if (f) { hits++; cache.delete(key); cache.set(key, f); return f; }
    const kind = sp === 'bird' ? 'bird' : 'quad';
    let cam, box;
    if (view.kind === 'world') {
      box = SIZES.world[kind];
      const dir = view.dir || 'down';
      // seen end-on an animal is a narrow column: toward and away from the viewer it is drawn a
      // little turned (three-quarter) and a little broader, as road sprites of animals usually are
      const endOn = dir === 'up' || dir === 'down';
      cam = A.camera(Object.assign({}, box, { pitch: endOn ? 32 : 28, yaw: dir === 'left' ? 90 : YAW[dir] + (view.turn != null ? view.turn : endOn ? (dir === 'down' ? -24 : 24) : 0), mirror: dir === 'left', wide: endOn ? 1.18 : 1 }));
    } else if (view.kind === 'preview') {
      // the whole animal, front three-quarter (the Company page's live preview)
      box = kind === 'bird' ? { w: 40, h: 40, ax: 20, ay: 34, zs: 2.2 } : { w: 48, h: 48, ax: 23, ay: 42, zs: sp === 'dog' ? 1.42 : 1.6 };
      cam = A.camera(Object.assign({}, box, { pitch: 22, yaw: 150 }));
    } else if (view.kind === 'portrait') {
      const s = view.size || 48;
      box = { w: s, h: s, ax: Math.round(s * 0.5), ay: Math.round(s * (kind === 'bird' ? 1.3 : 1.18)), zs: s / (kind === 'bird' ? 11 : 16) };
      cam = A.camera(Object.assign({}, box, { pitch: 12, yaw: 152 }));
    } else {
      const b0 = SIZES.battle[kind];
      box = dens === 1 ? b0 : { w: Math.ceil(b0.w * dens), h: Math.ceil(b0.h * dens), ax: Math.round(b0.ax * dens), ay: Math.round(b0.ay * dens) };
      // seen from a little further round than the adventurers (54° rather than their 36°), still facing the
      // creature: the head's profile — eye, muzzle, ears — reads at this size (the bird stands more side-on still)
      cam = A.camera(Object.assign({}, box, { pitch: 20, yaw: sp === 'bird' ? 58 : 54, zs: (BZS[sp] || b0.zs) * dens }));
    }
    const M = mats(sp, lk);
    let J = null;
    // the larger views (battle, preview, portrait) group their planes and cast shadows under overlaps
    const big = cam.zs >= 1.4;
    const cv = A.render(cam, (K) => { J = kind === 'bird' ? bird(K, M, po, cam.zs) : quadruped(K, sp, M, po, cam.zs); J = { head: K.at(J.head), chest: K.at(J.chest) }; }, { contour: kind === 'bird' ? 1.2 : 1.6, cast: big, cluster: big ? 2 : 0 }).toCanvas();
    built++;
    f = { cv, ax: box.ax, ay: box.ay, w: box.w, h: box.h, head: J.head, chest: J.chest };
    cache.set(key, f);
    while (cache.size > CAP) cache.delete(cache.keys().next().value);
    return f;
  }
  // bytes: the cached frames' pixels (4 bytes each), for the memory report
  function cacheStats() {
    let bytes = 0;
    for (const f of cache.values()) if (f && f.cv) bytes += f.cv.width * f.cv.height * 4;
    return { size: cache.size, built, hits, cap: CAP, bytes };
  }
  function clearCache() { cache.clear(); }

  Object.assign(A, { LOOKS, LOOK_ORDER, SIZES, frame, cacheStats, clearCache, _mats: mats, _Q: Q });
})(RB.petArt);
