/* Harmony portrait busts — the cast: who is drawn how, in which pose.
 *
 * A bust is assembled from the kit (88_harmony_body.js, 88_harmony_figure.js,
 * 88_harmony_hair.js, 88_harmony_acc.js) in a pose-aware layer order. The
 * contract (§6.4 of the Harmony addendum), back to front:
 *
 *   cape (back) · back hair · far earring · neck · torso/clothing (a hanging
 *   arm is part of it) · straps and chest pieces · scarf · head (face, near
 *   ear) · hair cap · glasses · fringe and side locks · brows · head
 *   accessories · near earring · far arm, what it holds, far hand · near
 *   arm, what it holds, near hand · lamp glow · held in front · ink · effects
 *
 * A raised arm comes after the head, so a hand may cross the face (the far
 * hand at Ren's glasses as he arrives): it covers part of a lens while the
 * frame, drawn beneath, stays whole and attached. Held things sit between
 * the sleeve and the fingers (a brush shaft, a vial) or hang in front (the
 * lamp).
 *
 * Poses: 'rally' (the player: grounded, determined, the writing hand
 * gathering ink on the brush toward the shared action), 'route' (Nao),
 * 'draught' (Mio), 'ward' (Ren), 'curtain' (Suzu). Each has an 'enter'
 * drawing (arriving) and a 'hold' drawing (the one characteristic gesture
 * resolved); loose ends (hair, earrings, ribbon tails, a scarf's tail) sit a
 * pixel or two behind in 'enter' and settle in 'hold'. Variants: 'standard'
 * (head, shoulders, chest and the gesture) and 'compact' (an authored
 * head-and-shoulders version with the gesture brought in close). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.harmonyKit = RB.harmonyKit || {};
(function (HK) {
  'use strict';
  const BW = 160, BH = 100;           // a bust's canvas (art px)
  const AX = 80, AY = 72;             // the anchor (pit of the neck) in it
  const HEAD_AT = [-1, -35];          // the head's origin from the anchor
  HK.BUST = { w: BW, h: BH, ax: AX, ay: AY, head: HEAD_AT };
  const IVORY = '#ece4d4';

  // ---- appearance ------------------------------------------------------------------------------------
  // Everything the art needs from a look (the player's effective look, or a companion's canonical one
  // with their portrait traits), as plain data; also the cache key's source.
  const ART_FIELDS = ['skin', 'hair', 'hairColor', 'outfit', 'cloth', 'shape', 'acc', 'scarfCol', 'scarfStripe', 'ribbonCol', 'hatCol', 'wrapCol', 'bandCol', 'flowerCol', 'capeCol', 'sashCol', 'earCol', 'capCol', 'leafCol', 'bellCol', 'cordCol', 'glassCol', 'size', 'age', 'bigSatchel'];
  function artLook(look) {
    look = look || {};
    const o = {};
    for (const k of ART_FIELDS) if (look[k] != null) o[k] = Array.isArray(look[k]) ? look[k].slice() : look[k];
    o.acc = (o.acc || []).slice();
    return o;
  }
  function lookKey(look) {
    const a = artLook(look);
    return JSON.stringify(ART_FIELDS.map((k) => (a[k] == null ? null : a[k])));
  }
  HK.artLook = artLook; HK.lookKey = lookKey;

  // Resolved colours and materials for a look.
  function dress(look, extra) {
    const SP = RB.sprites;
    const col = SP.colorsOf(look);
    const P = RB.pxkit;
    const cloth = col.cloth;
    const d = {
      skinCols: col.skin, hairCols: col.hair, cloth,
      F: HK.faceColours(col.skin, extra && extra.iris),
      Mh: HK.hairMat(col.hair),
      Mc: HK.clothMat(cloth[0]),
      Ma: HK.clothMat(cloth[2], { step: 0.09 }),
      Mi: HK.clothMat(IVORY, { step: 0.06, cool: 230 }),
      shape: look.shape || 'tunic',
      style: look.hair || 'short',
      acc: (look.acc || []).slice(),
      brow: null,
    };
    // brows: the hair's own dark tone
    d.Mb = HK.M('brow', P.hex(P.mix(d.Mh.rgba[0], [24, 12, 16], 0.25)), { cols: [P.hex(P.mix(d.Mh.rgba[0], [16, 8, 12], 0.5)), P.hex(d.Mh.rgba[1])], at: 1 });
    return d;
  }
  HK.dressOf = dress;

  // ---- the companions' canonical looks (src/content/00_world.js) and portrait traits ----------------------
  function compLook(id) {
    const ch = RB.content && RB.content.chars && RB.content.chars[id];
    if (!ch) return null;
    const look = Object.assign({}, ch.look || {});
    const pt = ch.portrait || {};
    look.acc = (pt.acc || look.acc || []).slice();
    for (const k of ['scarfCol', 'ribbonCol']) if (pt[k]) look[k] = pt[k];
    return { look, traits: { eyes: pt.eyes || 'round', parted: !!pt.parted, pins: !!pt.pins, collar: pt.collar, mole: !!pt.mole } };
  }
  HK.compLook = compLook;

  // ---- layers ---------------------------------------------------------------------------------------------
  function Stack(w, h) {
    this.w = w; this.h = h; this.layers = new Map(); this.order = [];
  }
  Stack.prototype.L = function (name) {
    let l = this.layers.get(name);
    if (!l) { l = RB.pxkit.layer(this.w, this.h); this.layers.set(name, l); }
    return l;
  };
  // outline every layer except those that should not be (effects), then composite in `order`
  Stack.prototype.flatten = function (order, noOutline) {
    const out = RB.pxkit.layer(this.w, this.h);
    for (const name of order) {
      const l = this.layers.get(name);
      if (!l) continue;
      if (!(noOutline && noOutline.includes(name)) && !l._outlined) { l.outline(); l._outlined = true; }
      out.over(l);
    }
    return out;
  };
  HK.Stack = Stack;

  // ---- hand drawings ---------------------------------------------------------------------------------------
  // Hands are authored pixel drawings (skin steps 1–5; 1 the dark line where fingers meet, '.' empty), one
  // per gesture and phase, placed so their `wrist` meets the sleeve; the layer's outline closes them. hold:
  // where a held thing is gripped. Light from the upper left: lit planes on the top and left of each finger.
  const HANDS = {
    // Suzu: the right hand opened toward us, fingers fanned up and to the left, the thumb out to the right
    open: {
      wrist: [8, 19],
      rows: [
        '......5..........',
        '...4..54..4......',
        '..45.454.454.....',
        '..45.454.454.....',
        '.454.45..454.....',
        '.45.454..45......',
        '.45.45..454......',
        '.45.45.454.....44',
        '.45445.45.....453',
        '..45445454...453.',
        '..4544445443.43..',
        '..4544444444443..',
        '..344444444443...',
        '..33444444443....',
        '...3344444433....',
        '....3444444......',
        '.....444443......',
        '.....444443......',
        '.....444443......',
        '.....444443......',
      ],
    },
    openSoft: {
      wrist: [8, 18],
      rows: [
        '.....45.4.......',
        '...4.45.454.....',
        '..45.45.454.....',
        '..45445.454.....',
        '.454454.45......',
        '.45.45.454......',
        '.45445.45.....4.',
        '..4545454....453',
        '..4544454...453.',
        '..454444443.43..',
        '..4544444444443.',
        '..344444444443..',
        '..33444444443...',
        '...3344444433...',
        '....3444444.....',
        '.....444443.....',
        '.....444443.....',
        '.....444443.....',
        '.....444443.....',
      ],
    },
    // a right hand closed round something upright, the palm toward us: the fingers wrap across the front,
    // the thumb comes up on the right
    gripR: {
      wrist: [5, 13], hold: [5, 1],
      rows: [
        '..444444...',
        '.45544443..',
        '.32222223.4',
        '.44444443.43',
        '.32222223443',
        '.3444443.443',
        '..222222443.',
        '..34444443..',
        '..3344443...',
        '...334433...',
        '....4443....',
        '....4443....',
        '....4443....',
        '....4443....',
      ],
    },
    // the same grip in the left hand (the player's brush): the thumb comes up on the left
    gripL: {
      wrist: [6, 13], hold: [6, 1],
      rows: [
        '...444444..',
        '..45544443.',
        '45.3222223.',
        '454.4444443',
        '4543222223.',
        '454.444443.',
        '.4543222222',
        '..34444443.',
        '...3444433.',
        '...3344433.',
        '....4443...',
        '....4443...',
        '....4443...',
        '....4443...',
      ],
    },
    // Nao: the right hand's back toward us, pointing to the right with the index, the others folded under
    point: {
      wrist: [1, 6], tip: [16, 2],
      rows: [
        '...44444.........',
        '..4554444444444..',
        '.455445555544444.',
        '.444444333333333.',
        '.4444442222222...',
        '.44444434443.....',
        '.34444423443.....',
        '.3444443333......',
        '..33442333.......',
        '...33333.........',
      ],
    },
    pointSoft: {
      wrist: [1, 7], tip: [11, 2],
      rows: [
        '...4444......',
        '..455444444..',
        '.45544444443.',
        '.4444442222..',
        '.44444434443.',
        '.3444442344..',
        '.344444333...',
        '..3344333....',
        '...3333......',
      ],
    },
    // Ren: the left hand at the bridge of his glasses, its back toward us, the index straight up
    pointUp: {
      wrist: [5, 16], tip: [6, 0],
      rows: [
        '.....44..',
        '.....453.',
        '.....453.',
        '.....453.',
        '.....453.',
        '..44.453.',
        '.44544543',
        '.45244543',
        '.4434243.',
        '.4444443.',
        '.3444443.',
        '..344443.',
        '..334433.',
        '...4443..',
        '...4443..',
        '...4443..',
        '...4443..',
      ],
    },
    // Ren: the right hand round the lamp's bail, knuckles up, its back toward us
    bail: {
      wrist: [2, 8], hold: [6, 8],
      rows: [
        '...444444...',
        '..45544444..',
        '.4554444443.',
        '.4444444443.',
        '.4424424423.',
        '.4434434433.',
        '.4434434433.',
        '..333333333.',
        '...3...3....',
      ],
    },
  };
  function drawHandTpl(L, X0, Y0, t, sk, owner) {
    for (let j = 0; j < t.rows.length; j++) for (let i = 0; i < t.rows[j].length; i++) {
      const ch = t.rows[j][i];
      if (ch === '.') continue;
      HK.put(L, X0 + i, Y0 + j, sk, +ch);
    }
  }
  HK.HANDS = HANDS; HK.drawHandTpl = drawHandTpl;


  // ---- props ---------------------------------------------------------------------------------------------------
  const PROP = {
    wood: () => HK.M('brushWood', '#b0814c', { n: 5, at: 3, step: 0.1, cool: 350, warm: 48, lineCol: '#1c0e06' }),
    ink: () => HK.M('ink', '#24203a', { n: 4, at: 1, step: 0.08, cool: 250, warm: 230, lineCol: '#08060e' }),
    inkfx: () => HK.M('inkfx', '#262248', { n: 5, at: 1, step: 0.13, cool: 250, warm: 210, lineCol: '#06040c' }),
    route: () => HK.M('route', '#c8962e', { n: 5, at: 3, step: 0.1, cool: 20, warm: 56, lineCol: '#2a1404' }),
    glass: () => HK.M('glass', '#5aa898', { n: 6, at: 3, step: 0.08, cool: 230, warm: 120, lineCol: '#0c2420' }),
    cork: () => HK.M('cork', '#b08a5a', { n: 4, at: 2, step: 0.09, lineCol: '#2a1608' }),
    iron: () => HK.M('iron', '#4a4450', { n: 5, at: 2, step: 0.1, lineCol: '#0c0a10' }),
    glow: () => HK.M('glow', '#ffd27a', { cols: ['#c87830', '#e8a040', '#ffd27a', '#fff0b8', '#fffae0'], at: 2, lineCol: '#5a2a10' }),
  };
  // the writing brush: a wooden shaft, a brass ferrule, the inked tip (from → to, anchor space)
  function brush(L, ax, ay, b) {
    const Ms = PROP.wood(), Mk = PROP.ink(), Mf = HK.metalMat('#b89048');
    const [x0, y0] = b.from, [x1, y1] = b.to;
    const dx = x1 - x0, dy = y1 - y0;
    const at = (t, w) => [ax + x0 + dx * t, ay + y0 + dy * t, w];
    HK.strand(L, [at(0, 1.25), at(0.7, 1.25)], Ms, { raw: true, base: 3, tipDark: 0, seam: false });
    HK.strand(L, [at(0.7, 1.55), at(0.78, 1.55)], Mf, { raw: true, base: 3, tipDark: 0, seam: false });
    HK.strand(L, [at(0.78, 1.75), at(0.88, 1.6), at(1, 0.35)], Mk, { raw: true, base: 2, tipDark: 0.3, seam: false });
    for (const t of [0.2, 0.46]) { const p = at(t); HK.put(L, Math.floor(p[0]), Math.floor(p[1]), Ms, 1); }
  }
  // ink gathering on the brush tip: a full bead hanging at the tip and four motes of the inscription's pale
  // thread (the paper-white the party's written effects use) drawn in toward it, nearer and smaller in turn
  function inkGather(L, ax, ay, tip, dir) {
    const Mi = PROP.inkfx(), Th = HK.M('thread', '#efe2c4', { cols: ['#b8a888', '#e0d2b2', '#f6ecd4', '#fffaf0'], at: 2, line: false });
    const x = ax + tip[0], y = ay + tip[1];
    const ux = dir[0], uy = dir[1], nx = -uy, ny = ux;
    const P = (a, b) => [x + ux * a + nx * b, y + uy * a + ny * b];
    // motes on a curve sweeping in to the tip: [along, across, size]
    for (const [a, b, sz] of [[9, 6.4, 2], [11.4, 0.6, 2], [8.4, -5.6, 1], [5, -8.4, 1]]) {
      const q = P(a, b), X = Math.floor(q[0]), Y = Math.floor(q[1]);
      if (sz > 1) { HK.put(L, X, Y, Th, 3); HK.put(L, X + 1, Y, Th, 2); HK.put(L, X, Y + 1, Th, 2); HK.put(L, X + 1, Y + 1, Th, 1); }
      else HK.put(L, X, Y, Th, 2);
    }
    // the bead
    const b = P(1.8, 0);
    for (let Y = Math.floor(b[1] - 2); Y <= b[1] + 2; Y++) for (let X = Math.floor(b[0] - 2); X <= b[0] + 2; X++) {
      const dx = X + 0.5 - b[0], dy = Y + 0.5 - b[1];
      if (dx * dx + dy * dy > 3.3) continue;
      HK.put(L, X, Y, Mi, dx + dy < -1 ? 3 : 1);
    }
  }
  // Mio's vial: green glass round-bellied, a neck and a cork (base: the bottom's centre; up: its axis)
  function vial(L, ax, ay, base, ang, o) {
    o = o || {};
    const a = (ang || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    const R = (x, y) => [ax + base[0] + x * c - y * s, ay + base[1] + x * s + y * c];
    const G = PROP.glass(), Ck = PROP.cork();
    const bx0 = Math.floor(ax + base[0] - 10), bx1 = Math.ceil(ax + base[0] + 10), by0 = Math.floor(ay + base[1] - 20), by1 = Math.ceil(ay + base[1] + 4);
    for (let Y = by0; Y <= by1; Y++) for (let X = bx0; X <= bx1; X++) {
      const dx = X + 0.5 - ax - base[0], dy = Y + 0.5 - ay - base[1];
      const x = dx * c + dy * s, y = -dx * s + dy * c;   // into vial space
      let inside = false, k = 3;
      if (HK.inEll(x, y, 0, -4.6, 4.4, 4.8)) { inside = true; k = x < -1.6 && y < -5 ? 5 : x > 2 ? 2 : y > -2 ? 2 : 3; if (y > -5.6 && y < -4.6) k = Math.max(k - 1, 1); }
      else if (Math.abs(x) <= 1.8 && y <= -8 && y >= -13.4) { inside = true; k = x < -0.4 ? 4 : 2; }
      else if (Math.abs(x) <= 2.4 && y < -13.4 && y >= -14.6) { inside = true; k = 4; }
      if (inside) HK.put(L, X, Y, G, k);
      else if (Math.abs(x) <= 1.6 && y < -14.6 && y >= -17.4) HK.put(L, X, Y, Ck, x < 0 ? 3 : 1);
    }
    // the draught's surface line and a glint
    const g = R(-2, -7); HK.put(L, Math.floor(g[0]), Math.floor(g[1]), HK.flat('#ffffff'), 0);
    if (o.glint) { const q = R(-2.6, -8.6); HK.put(L, Math.floor(q[0]), Math.floor(q[1]), HK.flat('#fffbe8'), 0); }
    return R(0, -15);
  }
  // Ren's lamp hanging from its bail (top: where the hand holds the bail, anchor space)
  function lamp(L, ax, ay, top, o) {
    o = o || {};
    const Mi = PROP.iron(), Gl = PROP.glow();
    const x = ax + top[0], y = ay + top[1];
    HK.line(L, 0, 0, x - 3, y + 4, x, y, Mi, 2); HK.line(L, 0, 0, x + 3, y + 4, x, y, Mi, 1);
    // cap, glass body, base
    HK.polyFill(L, x, y, [[-4.6, 4], [4.6, 4], [3.6, 6.4], [-3.6, 6.4]], Mi, (px, py) => (px < -1 ? 3 : 2));
    for (let Y = Math.floor(y + 6); Y <= y + 16; Y++) for (let X = Math.floor(x - 5); X <= x + 5; X++) {
      const dx = X + 0.5 - x, dy = Y + 0.5 - (y + 11.2);
      if (!HK.inEll(dx, dy, 0, 0, 4.8, 5.2)) continue;
      let k = 2;
      if (Math.abs(dx) < 2.4) k = 3;
      if (dx < -1 && dy < 0) k = 4;
      if (o.bright && Math.abs(dx) < 3) k = Math.min(4, k + 1);
      if (Math.abs(dy) < 0.6 || Math.abs(dy + 3) < 0.5 || Math.abs(dy - 3) < 0.5) k = Math.max(0, k - 1); // the frame's ribs
      HK.put(L, X, Y, Gl, k);
    }
    HK.polyFill(L, x, y, [[-3.6, 16], [3.6, 16], [4.4, 18.2], [-4.4, 18.2]], Mi, (px) => (px < -1 ? 3 : 1));
    return [x, y + 11];
  }
  // a stepped glow round a point (flat rings of falling alpha: no blur)
  function glow(L, x, y, r, col) {
    const steps = [[r, 0.12], [r * 0.72, 0.16], [r * 0.46, 0.2]];
    for (const [rr, a] of steps) {
      const M = HK.flat(col + Math.round(a * 255).toString(16).padStart(2, '0'), { line: false });
      for (let Y = Math.floor(y - rr); Y <= y + rr; Y++) for (let X = Math.floor(x - rr); X <= x + rr; X++) {
        if ((X + 0.5 - x) ** 2 + (Y + 0.5 - y) ** 2 > rr * rr) continue;
        const i = Y * L.w + X;
        if (X < 0 || Y < 0 || X >= L.w || Y >= L.h) continue;
        const p = L.px[i];
        const add = M.c[0];
        if (!p) { L.px[i] = add; L.mt[i] = M.id; continue; }
        const pa = p >>> 24, aa = add >>> 24;
        const na = Math.min(255, pa + aa);
        L.px[i] = (((na & 255) << 24) | (add & 0xffffff)) >>> 0;
      }
    }
  }
  // a route-like ink stroke in Nao's gold: dashes along a gentle curve and a small waypoint at its end
  function route(L, pts) {
    const Mi = PROP.route();
    const sm = HK.smooth(pts.map((p) => [p[0], p[1], 1.05]), 10);
    let run = 0;
    for (let i = 1; i < sm.length; i++) {
      run++;
      if (run % 6 >= 4) continue;
      HK.strand(L, [sm[i - 1], sm[i]], Mi, { raw: true, base: 3, tipDark: 0, seam: false });
    }
    const e = pts[pts.length - 1];
    const X = Math.floor(e[0]), Y = Math.floor(e[1]);
    for (const [dx, dy, k] of [[0, -1, 4], [-1, 0, 4], [0, 0, 3], [1, 0, 2], [0, 1, 2]]) HK.put(L, X + dx, Y + dy, Mi, k);
  }
  function glint(L, x, y) {
    const W = HK.flat('#fffbe8'), G = HK.flat('#ffd870');
    x = Math.round(x); y = Math.round(y);
    for (let i = 1; i <= 3; i++) for (const [dx, dy] of [[i, 0], [-i, 0], [0, i], [0, -i]]) HK.put(L, x + dx, y + dy, i === 3 ? G : W, 0);
    HK.put(L, x, y, W, 0);
    for (const [dx, dy] of [[1, 1], [-1, -1], [1, -1], [-1, 1]]) HK.put(L, x + dx, y + dy, G, 0);
  }
  HK.brush = brush; HK.inkGather = inkGather; HK.vial = vial; HK.lamp = lamp; HK.glowAt = glow; HK.route = route; HK.glint = glint;

  // ---- poses ----------------------------------------------------------------------------------------------
  // A pose (ph 'enter' | 'hold', v 'standard' | 'compact') returns: head [dx, dy]; expr { near, far (eye
  // options), brow, mouth, blush }; arms { near, far } ('down' | 'up'); nearArm / farArm { sh, el, wr (anchor
  // space: the sleeve's end), widths, tpl (a HANDS drawing whose wrist meets wr) }; props(S, ax, ay, opt, hx,
  // hy) drawing what is held (into nearHeld / farHeld: between the sleeve and the fingers; or held: in front)
  // and the effects; settle (px loose ends trail by; 0 at the hold).
  const POSES = {};
  HK.POSES = POSES;
  // where a point of a hand drawing lands (anchor space), given the arm
  const handAt = (a, pt) => { const t = HANDS[a.tpl]; return [Math.round(a.wr[0]) - t.wrist[0] + pt[0], Math.round(a.wr[1]) - t.wrist[1] + pt[1]]; };
  HK.handAt = handAt;

  // The player — the shared rally: a grounded, determined look. Arriving, the writing hand (the far hand) is
  // gathered across the chest with the brush held up beside the near jaw — the wind-up, crossing the body;
  // at the hold it has swept out toward the action, the brush raised and the ink gathering on its tip.
  POSES.rally = function (ph, v) {
    const hold = ph === 'hold', cmp = v === 'compact';
    const p = {
      head: [0, hold ? 0 : 1], settle: hold ? 0 : 2,
      expr: hold ? { near: {}, far: {}, brow: 'firm', mouth: 'calm' } : { near: { lid: 1 }, far: { lid: 1 }, brow: 'knit', mouth: 'firm' },
      arms: { near: 'down', far: 'up' },
    };
    let wr, el, ang;
    if (hold) {
      if (cmp) { wr = [29, -2]; el = [27, 14]; ang = 34; } else { wr = [35, 2]; el = [32, 17]; ang = 34; }
    } else if (cmp) { wr = [-2, 6]; el = [16, 12]; ang = -50; }
    else { wr = [-2, 8]; el = [17, 16]; ang = -50; }
    p.farArm = { sh: [20, 2], el, wr, w0: 5.4, w1: 4.6, w2: 3.8, tpl: 'gripL' };
    const g = handAt(p.farArm, HANDS.gripL.hold);
    const a = ang * Math.PI / 180, ux = Math.sin(a), uy = -Math.cos(a);
    const len = hold ? (cmp ? 21 : 26) : (cmp ? 24 : 27), back = hold ? 8 : 5;
    const from = [g[0] + 0.5 - ux * back, g[1] + 2 - uy * back], to = [from[0] + ux * len, from[1] + uy * len];
    p.props = (S, ax, ay, opt) => {
      brush(S.L('farHeld'), ax, ay, { from, to });
      if (hold && opt.fx) inkGather(S.L('ink'), ax, ay, to, [ux, uy]);
    };
    p.crossing = !hold;
    return p;
  };

  // Suzu — Curtain Call: a welcoming rally, the near hand opened toward us; animated eyes; at the hold a single
  // wink and one glint beside the winking eye.
  POSES.curtain = function (ph, v) {
    const hold = ph === 'hold', cmp = v === 'compact';
    const p = {
      head: [hold ? -1 : 0, 0], settle: hold ? 0 : 2,
      expr: hold ? { near: { closed: 'up' }, far: {}, brow: 'lift', mouth: 'grin', blush: true } : { near: {}, far: {}, brow: 'up', mouth: 'open' },
      arms: { near: 'up', far: 'down' },
    };
    let wr, el;
    if (cmp) { wr = hold ? [-30, -2] : [-29, 2]; el = [-33, 10]; }
    else { wr = hold ? [-43, 4] : [-40, 8]; el = hold ? [-38, 16] : [-36, 18]; }
    p.nearArm = { sh: [-27, 2], el, wr, w0: 5.4, w1: 4.6, w2: 3.8, tpl: hold ? 'open' : 'openSoft' };
    p.props = (S, ax, ay, opt, hx, hy) => { if (hold && opt.fx) glint(S.L('fx'), hx + HK.HEAD.eyeN.x - 10, hy + HK.HEAD.eyeN.y - 7); };
    return p;
  };

  // Nao — Read the Opening: a focused three-quarter gaze and a slight, sure smile; his far hand comes up past
  // his shoulder and points the way, precisely, toward the action; a short route-like ink stroke runs on from
  // the fingertip at the hold.
  POSES.route = function (ph, v) {
    const hold = ph === 'hold', cmp = v === 'compact';
    const p = {
      head: [hold ? 1 : 0, 0], settle: hold ? 0 : 2,
      expr: hold ? { near: {}, far: {}, brow: 'knit', mouth: 'smirk' } : { near: {}, far: {}, brow: 'firm', mouth: 'firm' },
      arms: { near: 'down', far: 'up' },
    };
    let wr, el;
    if (cmp) { wr = hold ? [21, -4] : [19, 2]; el = [25, 10]; }
    else { wr = hold ? [23, -5] : [21, 3]; el = hold ? [29, 11] : [28, 15]; }
    p.farArm = { sh: [20, 2], el, wr, w0: 5.4, w1: 4.8, w2: 4, tpl: hold ? 'point' : 'pointSoft' };
    const tip = handAt(p.farArm, HANDS[p.farArm.tpl].tip);
    p.props = (S, ax, ay, opt) => {
      // (the compact pair has no room for it beside the player's face: particles go before faces, §5.4)
      if (hold && opt.fx && !cmp) p.overlay = { kind: 'route', pts: [[ax + tip[0] + 3, ay + tip[1]], [ax + tip[0] + 9, ay + tip[1] - 2], [ax + tip[0] + 13, ay + tip[1] - 7], [ax + tip[0] + 14, ay + tip[1] - 12]] };
    };
    return p;
  };

  // Mio — Clearwater Draught: composed and reassuring; the near hand raises the draught (a vial from the
  // bottles she carries) beside her face, steady; at the hold it catches the light.
  POSES.draught = function (ph, v) {
    const hold = ph === 'hold', cmp = v === 'compact';
    const p = {
      head: [0, hold ? 0 : 1], settle: hold ? 0 : 2,
      expr: hold ? { near: { smile: true }, far: { smile: true }, brow: 'soft', mouth: 'soft', blush: true } : { near: {}, far: {}, brow: 'soft', mouth: 'calm' },
      arms: { near: 'up', far: 'down' },
    };
    let wr, el, ang;
    if (cmp) { wr = hold ? [-28, -6] : [-28, 0]; el = [-32, 8]; ang = hold ? 0 : 14; }
    else { wr = hold ? [-32, -6] : [-32, 4]; el = hold ? [-39, 8] : [-38, 14]; ang = hold ? 0 : 16; }
    p.nearArm = { sh: [-27, 2], el, wr, w0: 5.2, w1: 4.4, w2: 3.8, tpl: 'gripR' };
    const g = handAt(p.nearArm, HANDS.gripR.hold);
    p.props = (S, ax, ay, opt) => { vial(S.L('nearHeld'), ax, ay, [g[0] + 0.5, g[1] + 4], ang, { glint: hold && opt.fx }); };
    return p;
  };

  // Ren — Lantern Ward: an intent gaze behind his glasses; as he arrives his far hand settles the glasses at
  // the far rim (crossing the face; the frame stays on, drawn under the fingers); at the hold the lamp is
  // raised beside his face, its light framed.
  POSES.ward = function (ph, v) {
    const hold = ph === 'hold', cmp = v === 'compact';
    const p = {
      head: [0, 0], settle: hold ? 0 : 2,
      expr: hold ? { near: { lid: 1 }, far: { lid: 1 }, brow: 'knit', mouth: 'firm' } : { near: { lid: 1 }, far: {}, brow: 'flat', mouth: 'calm' },
      arms: { near: 'up', far: hold ? 'down' : 'up' },
    };
    let wr, el;
    if (cmp) { wr = hold ? [-29, -20] : [-30, -6]; el = [-35, 2]; }
    else { wr = hold ? [-34, -24] : [-36, -4]; el = hold ? [-41, -2] : [-40, 12]; }
    p.nearArm = { sh: [-27, 2], el, wr, w0: 5.4, w1: 4.6, w2: 3.8, tpl: 'bail' };
    if (!hold) {
      // the far hand at the far rim of the glasses: the index finger up along the frame's edge
      const H = HK.HEAD, tipAt = [HEAD_AT[0] + H.eyeF.x + 5, HEAD_AT[1] + H.eyeF.y - 1];
      const t = HANDS.pointUp;
      const wr2 = [tipAt[0] - t.tip[0] + t.wrist[0], tipAt[1] - t.tip[1] + t.wrist[1]];
      p.farArm = { sh: [20, 2], el: cmp ? [22, 8] : [25, 8], wr: wr2, w0: 5.2, w1: 4.4, w2: 3.8, tpl: 'pointUp' };
    }
    const top = handAt(p.nearArm, HANDS.bail.hold);
    p.props = (S, ax, ay, opt) => {
      const c = lamp(S.L('held'), ax, ay, top, { bright: hold });
      if (opt.fx) glow(S.L('glow'), c[0], c[1], hold ? 13 : 9, '#ffd27a');
    };
    return p;
  };

  // The cool rim light of the battle figures (docs/battle/party.md): down the right-hand silhouette, the pixel
  // just inside the outline takes a step toward a cool sky blue, so the bust turns in the same light.
  function rim(L) {
    const w = L.w, px = L.px, src = px.slice();
    const A = (i) => src[i] >>> 24;
    const lum = (c) => (c & 255) * 0.3 + ((c >> 8) & 255) * 0.59 + ((c >> 16) & 255) * 0.11;
    for (let y = 1; y < L.h - 1; y++) for (let x = 1; x < w - 2; x++) {
      const i = y * w + x;
      if (A(i) < 255 || A(i + 1) < 255 || A(i + 2)) continue;          // two pixels in from an empty one, on the right
      const c = src[i], o = src[i + 1];
      if (lum(o) > 90 || lum(c) < 40) continue;                         // i + 1 must be the dark outline; skip near-blacks
      const k = 0.36;
      const r = (c & 255) * (1 - k) + 0x8e * k, g = ((c >> 8) & 255) * (1 - k) + 0xc0 * k, b = ((c >> 16) & 255) * (1 - k) + 0xff * k;
      px[i] = ((255 << 24) | (Math.round(b) << 16) | (Math.round(g) << 8) | Math.round(r)) >>> 0;
    }
  }
  HK.rim = rim;

  // ---- assembling a bust -------------------------------------------------------------------------------
  // who: 'pc' | 'nao' | 'mio' | 'ren' | 'suzu'; look: the player's effective look (ignored for companions);
  // pose: a POSES key; ph: 'enter' | 'hold'; variant: 'standard' | 'compact'.
  function drawBust(who, look, pose, ph, variant, opt) {
    opt = opt || {};
    let traits = { eyes: 'round' };
    if (who !== 'pc') {
      const c = compLook(who);
      if (!c) throw new Error('harmony art: no companion "' + who + '" in RB.content.chars');
      look = c.look; traits = c.traits;
    }
    const d = dress(look);
    const S = new Stack(BW, BH);
    const P = (POSES[pose] || POSES.rally)(ph, variant);
    const ax = AX, ay = AY;
    const hx = ax + HEAD_AT[0] + (P.head ? P.head[0] : 0), hy = ay + HEAD_AT[1] + (P.head ? P.head[1] : 0);
    const H = HK.HEAD;
    const style = d.style;
    const hc = { hx, hy, M: d.Mh, look, s: P.settle || 0, traits, d, head: S.L('head') };
    // hair behind
    HK.hairPart('back', style, Object.assign({ L: S.L('hairBack') }, hc));
    // neck, torso
    HK.neck(S.L('neck'), hx, hy, d.F.skin, { len: ay - hy + 2 });
    const shape = traits.collar === 'high' ? 'high' : d.shape;
    HK.torso(S.L('torso'), ax, ay, { shape, M: d.Mc, A: d.Ma, Iv: d.Mi, sk: d.F.skin, arms: P.arms });
    // head
    const head = S.L('head');
    HK.headFill(head, hx, hy, d.F.skin);
    HK.ear(head, hx, hy, d.F.skin);
    HK.hairPart('cap', style, Object.assign({ L: S.L('cap') }, hc));
    HK.hairPart('front', style, Object.assign({ L: S.L('front') }, hc));
    // the hair's shadow across the forehead and temples, then the head's outline; features go on after it
    HK.hairShadow(head, S.L('cap'), d.F.skin, hx - 22, hy - 30, hx + 22, hy + 24);
    HK.hairShadow(head, S.L('front'), d.F.skin, hx - 22, hy - 30, hx + 22, hy + 24);
    S.L('head').outline(); S.L('head')._outlined = true;
    const ex = P.expr || {};
    HK.eye(head, hx + H.eyeN.x, hy + H.eyeN.y, 'near', Object.assign({ style: traits.eyes }, ex.near), d.F);
    HK.eye(head, hx + H.eyeF.x, hy + H.eyeF.y, 'far', Object.assign({ style: traits.eyes }, ex.far), d.F);
    if (ex.blush) { // a warm flush across both cheeks, under the eyes
      for (const [x0, w] of [[H.eyeN.x - 3, 5], [H.eyeF.x - 1, 3]]) for (let i = 0; i < w; i++) { HK.put(head, hx + x0 + i, hy + H.eyeN.y + 6, d.F.blush, 0); if (i % 2 === 0) HK.put(head, hx + x0 + i + 1, hy + H.eyeN.y + 7, d.F.blush, 0); }
    }
    HK.nose(head, hx, hy, d.F.skin);
    HK.mouth(head, hx, hy, ex.mouth || 'firm', d.F);
    let mole = null;
    if (traits.mole) { mole = { x: hx + 10, y: hy + 12 }; HK.put(head, mole.x, mole.y, d.F.lash, 0); }
    // accessories
    const ac = { S, hx, hy, ax, ay, look, d, arms: P.arms || {}, s: P.settle || 0, who };
    const accRes = HK.drawAcc(ac);
    // arms
    const hands = [];
    const arm = (key, side) => {
      const a = P[key];
      if (!a) return;
      HK.arm(S.L(side + 'Arm'), ax, ay, a, d.Mc, d.Ma);
      if (!a.tpl) return;
      const t = HANDS[a.tpl];
      const X0 = ax + Math.round(a.wr[0]) - t.wrist[0], Y0 = ay + Math.round(a.wr[1]) - t.wrist[1];
      drawHandTpl(S.L(side + 'Hand'), X0, Y0, t, d.F.skin);
      const w = t.rows.reduce((m, r) => Math.max(m, r.length), 0);
      hands.push({ x: X0 - 1, y: Y0 - 1, w: w + 2, h: t.rows.length + 2, side, tpl: a.tpl });
    };
    arm('nearArm', 'near'); arm('farArm', 'far');
    if (P.props) P.props(S, ax, ay, { fx: opt.fx !== false }, hx, hy);
    // brows over the fringe
    const brows = S.L('brows');
    HK.brow(brows, hx + H.eyeN.x, hy + H.eyeN.y, 'near', ex.brow || 'flat', d.Mb);
    HK.brow(brows, hx + H.eyeF.x, hy + H.eyeF.y, 'far', ex.brow || 'flat', d.Mb);
    // the layering contract (a pose can move a hand in front of the face: P.order)
    const order = P.order || ['capeBack', 'hairBack', 'earF', 'neck', 'torso', 'chest', 'scarf', 'head', 'cap', 'glasses', 'front', 'brows', 'headAcc', 'earN', 'farArm', 'farHeld', 'farHand', 'nearArm', 'nearHeld', 'nearHand', 'glow', 'held', 'ink', 'fx'];
    const out = S.flatten(order, ['brows', 'fx', 'glasses', 'glow']);
    rim(out);
    const face = { x: hx - 17, y: hy - 11, w: 36, h: 33 };
    const box = (L) => { let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; if (L) for (let i = 0; i < L.px.length; i++) if (L.px[i]) { const x = i % L.w, y = (i / L.w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return x1 < 0 ? null : { x0, y0, x1, y1 }; };
    const res = { layer: out, w: BW, h: BH, anchor: { x: ax, y: ay }, face, hands, head: { x: hx, y: hy }, acc: accRes, overlay: P.overlay || null, order, mole, hairBox: { back: box(S.layers.get('hairBack')) } };
    // (tools only: the registry export and the synthetic sample read the named, outlined layers)
    if (opt.keepLayers) res.stack = S;
    return res;
  }
  HK.drawBust = drawBust;

})(RB.harmonyKit);
