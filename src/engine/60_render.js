/* World renderer. The world keeps its 16-px logical grid (movement, collision,
 * triggers, saves), but is drawn into a buffer at ART = 2 art pixels per
 * logical pixel: 32×32-art-pixel tiles and 40×58 character frames. The buffer is
 * then scaled by an integer number of device pixels (artPx) so pixel art stays
 * crisp. Art authored at art resolution provides draw2/getArt; older 16-px art
 * is drawn through a ×2 transform until it is redrawn (legacy adapter). Text
 * is never drawn here — the DOM text layer handles Japanese (spec §16). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.render = (function () {
  'use strict';
  const TS = 16;            // logical tile (game pixels)
  const ART = 2;            // art pixels per logical pixel
  const ATS = TS * ART;     // art pixels per tile
  let canvas = null, ctx = null;
  let buf = null, bctx = null;
  let light = null, lctx = null;
  let artPx = 2, cssW = 0, cssH = 0, dpr = 1;
  let bw = 0, bh = 0;       // buffer size in art pixels
  const cam = { x: 0, y: 0 }; // logical pixels (multiples of 1/ART)
  let particles = [];
  let staticDirty = true;
  let override = null; // function(ctx, w, h, t) for full-screen modes (combat, title, creation)

  function init(cv) {
    canvas = cv;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
    canvas.addEventListener('pointerdown', onPointer);
  }
  // Field of view: about 12 tiles across on phones, 17 on tablets, 21 on
  // desktops (8–12 tall). A tile is 32 art pixels, each artPx device pixels.
  // The world proof (src/engine/65_worldlook.js, development only) may ask for a wider view through setView:
  // a function of the window's CSS size giving {w, h} tiles. Without it the view is exactly as above.
  let viewTarget = null;
  function setView(fn) {
    viewTarget = typeof fn === 'function' ? fn : null;
    if (canvas) { resize(); invalidate(); }
  }
  function resize() {
    cssW = window.innerWidth;
    cssH = window.innerHeight;
    dpr = window.devicePixelRatio || 1;
    const vt = viewTarget && viewTarget(cssW, cssH);
    const targetW = vt ? vt.w : cssW < 700 ? 12 : cssW < 1100 ? 17 : 21;
    const targetH = vt ? vt.h : cssH < 520 ? 8 : 12;
    const tileDev = Math.min(cssW / targetW, cssH / targetH) * dpr;
    artPx = Math.max(1, Math.round(tileDev / ATS));
    // never show much less than the intended view: step down if rounding up cost > 20 %
    if (artPx > 1 && (cssW * dpr) / (artPx * ATS) < targetW * 0.8) artPx--;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    bw = Math.ceil(canvas.width / artPx);
    bh = Math.ceil(canvas.height / artPx);
    buf = RB.sprites.makeCanvas(bw, bh);
    bctx = buf.getContext('2d');
    bctx.imageSmoothingEnabled = false;
    light = RB.sprites.makeCanvas(bw, bh);
    lctx = light.getContext('2d');
    RB.bus.emit('resize', { cssW, cssH, scale: (artPx * ART) / dpr });
  }
  // Logical view size (game pixels) and CSS px per game pixel.
  function viewSize() {
    return { w: bw / ART, h: bh / ART, scale: (artPx * ART) / dpr };
  }
  function invalidate() {
    staticDirty = true;
    particles = [];
  }
  function palOf(m) {
    return RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake;
  }
  // Draw older 16-px art through a ×ART transform (logical coordinates).
  function legacy(c, fn) {
    c.save();
    c.scale(ART, ART);
    fn();
    c.restore();
  }

  // ---- beyond the map's edge ---------------------------------------------------
  // Outdoors the ground at each edge carries on past it: the same tiles with
  // their own per-cell variation (so nothing repeats in stripes), the river
  // keeps flowing, a road keeps going, and a wooded, reedy or rocky edge stays
  // so — scenery is scattered at the density found along that stretch of edge.
  // It darkens gently with distance so it never reads as walkable. Walled
  // interiors keep the dark timber surround (the building around the room).
  const SCENERY = { tree: 1, orchard: 1, pine: 1, deadtree: 1, bush: 1, reeds: 1, rock: 1, stump: 1, co_scrub: 1, sb_drift: 1 };
  function enclosed(m) {
    if (m.enclosed != null) return m.enclosed;
    let e = m.region === 'interior' || !!(m.def && m.def.indoor);
    if (!e) {
      let wall = 0, n = 0;
      const at = (x, y) => { n++; if (m.tiles[y * m.w + x].id === 'wall') wall++; };
      for (let x = 0; x < m.w; x++) { at(x, 0); at(x, m.h - 1); }
      for (let y = 1; y < m.h - 1; y++) { at(0, y); at(m.w - 1, y); }
      e = wall / n >= 0.5;
    }
    return (m.enclosed = e);
  }
  // A map that brings its own surround (map.surround: the ground far below an
  // elevated deck, src/engine/61_below.js) is framed like a room: no apron, no
  // fade, the soft edge shadow round its deck (it reads as the drop). It is
  // not indoors.
  const framed = (m) => enclosed(m) || !!(m.def && m.def.surround);
  const fromHeight = (m) => !!(RB.below && RB.below.active(m));
  const clampI = (v, n) => (v < 0 ? 0 : v >= n ? n - 1 : v);
  // Margin (tiles) the current view can show past each edge: half the room a
  // small map leaves, plus the touch-controls reserve below.
  function marginFor(m) {
    if (framed(m)) return { x: 0, y: 0 };
    const vwT = bw / ATS, vhT = bh / ATS, rT = reserveLogical() / TS;
    const y = Math.max(1, Math.ceil((vhT - m.h) / 2) + 1) + Math.ceil(rT);
    return { x: Math.max(1, Math.ceil((vwT - m.w) / 2) + 1), y: Math.max(y, Math.ceil(headroom(m)) + 1) };
  }
  // Headroom (map.headroom, in tiles): how far the view may look above the
  // map's top row, for a map with something tall standing against it (the
  // observatory's dome above the Star Stair path). The camera eases up into
  // it as the player nears the top, so those rows show only up there; what
  // fills them is the map's own edge continued (the apron). Coordinates,
  // collision and exits are unchanged. Maps without it are unaffected.
  const headroom = (m) => (m.def && m.def.headroom) || 0;
  // Scenery continued past the edge: for each outside cell, the edge cell it
  // continues from sets the ground; the scenery found within two cells of that
  // edge cell sets how likely a piece is here and which kind (by hash, stable).
  function buildApronProps(m, g) {
    const at = new Map();
    for (const p of m.props) {
      if (p.if || !SCENERY[p.p]) continue;
      const pd = RB.props.P[p.p];
      if (!pd || (p.w || pd.w) !== 1 || (p.h || pd.h) !== 1) continue;
      at.set(p.y * m.w + p.x, p.p);
    }
    const base = new Map(); // prop kind -> the tile it stands on (from the map itself)
    for (const p of m.props) if (SCENERY[p.p] && !base.has(p.p)) base.set(p.p, m.tiles[p.y * m.w + p.x]);
    const out = [];
    for (let y = -g.y; y < m.h + g.y; y++)
      for (let x = -g.x; x < m.w + g.x; x++) {
        if (x >= 0 && y >= 0 && x < m.w && y < m.h) continue;
        const cx = clampI(x, m.w), cy = clampI(y, m.h);
        const count = new Map();
        let n = 0, hit = 0;
        for (let yy = Math.max(0, cy - 2); yy <= Math.min(m.h - 1, cy + 2); yy++)
          for (let xx = Math.max(0, cx - 2); xx <= Math.min(m.w - 1, cx + 2); xx++) {
            n++;
            const k = at.get(yy * m.w + xx);
            if (k) { hit++; count.set(k, (count.get(k) || 0) + 1); }
          }
        if (!hit) continue;
        const ground = m.tiles[cy * m.w + cx];
        // only where that ground could carry it (never on the river or the road)
        const kinds = [...count].filter(([k]) => base.get(k) === ground);
        if (!kinds.length) continue;
        const r = RB.tiles.hh(x, y, 11) % 1000;
        if (r >= (1000 * hit) / n) continue;
        let pick = RB.tiles.hh(x, y, 12) % kinds.reduce((a, [, c]) => a + c, 0), kind = kinds[0][0];
        for (const [k, c] of kinds) { if (pick < c) { kind = k; break; } pick -= c; }
        out.push({ p: kind, x, y, auto: true, apron: true });
      }
    return out;
  }

  // Static layer of a map at art resolution, with the apron around it when
  // the map is outdoors. Only the current and previous maps keep one (a large
  // map is a few megabytes at this resolution).
  let staticMaps = [];
  function buildStatic(m) {
    const g = marginFor(m);
    const cv = RB.sprites.makeCanvas((m.w + 2 * g.x) * ATS, (m.h + 2 * g.y) * ATS);
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    const pal = palOf(m);
    const ext = !framed(m), open = fromHeight(m);
    for (let y = -g.y; y < m.h + g.y; y++)
      for (let x = -g.x; x < m.w + g.x; x++) {
        const t = m.tiles[clampI(y, m.h) * m.w + clampI(x, m.w)];
        if (open && t.id === 'void') continue; // round a deck the ground far below shows through
        // outdoors every tile sees the ground continuing past the edge
        const nb = ext ? (dx, dy) => m.tiles[clampI(y + dy, m.h) * m.w + clampI(x + dx, m.w)] : (dx, dy) => RB.maps.tileAt(m, x + dx, y + dy);
        const px = (x + g.x) * ATS, py = (y + g.y) * ATS;
        if (t.draw2) t.draw2(c, px, py, pal, RB.tiles.hh(x, y), nb, x, y);
        else legacy(c, () => t.draw(c, px / ART, py / ART, pal, RB.tiles.hh(x, y), nb));
      }
    if (RB.tileArt && RB.tileArt.flush) RB.tileArt.flush(); // tile art batches its output per row
    m.staticLayer = cv;
    m.margin = g;
    m.apronProps = ext ? buildApronProps(m, g) : [];
    staticDirty = false;
    staticMaps = staticMaps.filter((o) => o !== m);
    staticMaps.push(m);
    while (staticMaps.length > 2) { const old = staticMaps.shift(); old.staticLayer = null; old.apronProps = null; }
  }

  // The camera never moves because a panel opened or closed: the dialogue
  // docks at the top of the screen instead when it would cover someone (see
  // 20_dialogue.js). The one thing it allows for is the band the touch
  // controls occupy on a touch device (CSS px): a property of the device, so
  // the view can run past the map's bottom edge by that much and keep the
  // player clear of the pad.
  let reserve = 0;
  let camMap = null, camY = 0, camX = 0;
  function setReserve(px) {
    reserve = Math.max(0, px || 0);
  }
  function reserveLogical() {
    return Math.min((bh / ART) * 0.3, (reserve * dpr) / (artPx * ART));
  }
  function updateCamera(W) {
    const p = W.player;
    const m = W.map;
    const vw = bw / ART, vh = bh / ART; // logical view
    const rb = reserveLogical();
    const mw = m.w * TS, mh = m.h * TS;
    let cx = (p.fx + 0.5) * TS - vw / 2;
    cx = mw <= vw ? (mw - vw) / 2 : Math.max(0, Math.min(mw - vw, cx));
    // centred on the player in the view above the reserve; the view may run
    // past the bottom edge by the reserve (that ground is drawn: the apron)
    const hi = mh - vh + rb;
    const H = headroom(m) * TS;
    let cy;
    if (mh + rb <= vh) cy = Math.max((mh - vh) / 2, hi);
    else if (!H) cy = Math.max(0, Math.min(hi, (p.fy + 0.5) * TS - (vh - rb) / 2 - 4));
    else {
      // within five rows of the top the view rises (smoothly) by up to the headroom
      let c = (p.fy + 0.5) * TS - (vh - rb) / 2 - 4;
      const L = 5 * TS;
      if (c < L) c -= H * (1 - Math.max(0, c) / L);
      cy = Math.max(-H, Math.min(hi, c));
    }
    // follow the walking player exactly; ease only larger jumps (a resize, or
    // the reserve appearing); snap on a new map or with reduced motion
    if (camMap !== m || RB.game.reducedMotion()) { camMap = m; camX = cx; camY = cy; }
    else {
      camX = Math.abs(cx - camX) > 12 ? camX + (cx - camX) * 0.2 : cx;
      camY = Math.abs(cy - camY) > 12 ? camY + (cy - camY) * 0.2 : cy;
    }
    // snap to whole art pixels so nothing shimmers
    cam.x = Math.round(camX * ART) / ART;
    cam.y = Math.round(camY * ART) / ART;
  }
  // logical -> buffer (art) pixel
  const ax = (lx) => Math.round((lx - cam.x) * ART);
  const ay = (ly) => Math.round((ly - cam.y) * ART);

  // Outside a small map: a quiet surround in the region's darkest colour —
  // timber for interiors, a faint weave outdoors, or, round an elevated deck,
  // the ground far below (src/engine/61_below.js) — and a soft edge shadow, so
  // the map reads as a lit room, a stage or a height rather than an empty band.
  // Nothing here looks walkable. Patterns are cached per palette.
  const surroundCache = new Map();
  function mix(hex, to, a) {
    const n = parseInt(hex.slice(1), 16), m2 = parseInt(to.slice(1), 16);
    const ch = (v, w) => Math.round(v + (w - v) * a);
    const r = ch(n >> 16, m2 >> 16), g = ch((n >> 8) & 255, (m2 >> 8) & 255), b = ch(n & 255, m2 & 255);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  function surroundPattern(c, pal, indoor) {
    const key = pal.dark + (indoor ? 'i' : 'o');
    let pat = surroundCache.get(key);
    if (pat) return pat;
    const cv = RB.sprites.makeCanvas(64, 64);
    const g = cv.getContext('2d');
    g.fillStyle = pal.dark;
    g.fillRect(0, 0, 64, 64);
    if (indoor) {
      // dark timber: 16-px boards with a lit edge and a shadowed seam, staggered joints, the odd knot
      const seam = mix(pal.dark, '#000000', 0.4), lit = mix(pal.dark, '#ffffff', 0.06), grain = mix(pal.dark, '#000000', 0.18);
      for (let x = 0; x < 64; x += 16) {
        g.fillStyle = seam; g.fillRect(x, 0, 1, 64);
        g.fillStyle = lit; g.fillRect(x + 1, 0, 1, 64);
        g.fillStyle = grain; g.fillRect(x + 6, 0, 1, 64); g.fillRect(x + 11, 0, 1, 64);
      }
      g.fillStyle = seam;
      g.fillRect(2, 18, 13, 1); g.fillRect(18, 50, 13, 1); g.fillRect(34, 8, 13, 1); g.fillRect(50, 36, 13, 1);
      g.fillStyle = grain; g.fillRect(40, 26, 3, 2); g.fillRect(9, 44, 2, 2);
    } else {
      // a faint two-way weave, like the folio's cloth
      const hi = mix(pal.dark, '#ffffff', 0.05), lo = mix(pal.dark, '#000000', 0.3);
      for (let j = 0; j < 64; j += 4) for (let i = 0; i < 64; i += 4) {
        g.fillStyle = hi; g.fillRect((i + j) % 64, j, 2, 1);
        g.fillStyle = lo; g.fillRect((i + 66 - j) % 64, j + 2, 2, 1);
      }
    }
    pat = c.createPattern(cv, 'repeat');
    surroundCache.set(key, pat);
    return pat;
  }
  // soft shadow just outside a rectangle's edges (a room's walls, a deck's edge)
  function edgeShadow(c, mx, my, mw, mh) {
    const sh = 20;
    const edge = (x0, y0, x1, y1, x, y, w, h) => {
      const gr = c.createLinearGradient(x0, y0, x1, y1);
      gr.addColorStop(0, 'rgba(0,0,0,0.55)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gr;
      c.fillRect(x, y, w, h);
    };
    edge(0, my, 0, my - sh, mx - sh, my - sh, mw + 2 * sh, sh);
    edge(0, my + mh, 0, my + mh + sh, mx - sh, my + mh, mw + 2 * sh, sh);
    edge(mx, 0, mx - sh, 0, mx - sh, my, sh, mh);
    edge(mx + mw, 0, mx + mw + sh, 0, mx + mw, my, sh, mh);
  }
  const belowEnv = (m, t) => ({ ax, ay, bw, bh, cam, t: t || 0, still: RB.game.reducedMotion(), player: RB.world.W.player, amb: ambientOf(m).ambient || {} });
  function drawSurround(c, m, pal, t) {
    if (fromHeight(m)) {
      // the ground far below, round the deck, with the deck's edge shadow
      RB.below.draw(c, m, belowEnv(m, t));
      const D = RB.below.deckOf(m);
      edgeShadow(c, ax(D.x0 * TS), ay(D.y0 * TS), (D.x1 - D.x0) * ATS, (D.y1 - D.y0) * ATS);
      return;
    }
    const g = m.margin || { x: 0, y: 0 };
    const mx = ax(-g.x * TS), my = ay(-g.y * TS), mw = (m.w + 2 * g.x) * ATS, mh = (m.h + 2 * g.y) * ATS;
    c.fillStyle = pal.dark;
    if (mx <= 0 && my <= 0 && mx + mw >= bw && my + mh >= bh) { c.fillRect(0, 0, bw, bh); return; }
    // plain ground under the map itself; the patterned surround only in the
    // strips around it (painting the whole buffer twice a frame cost about
    // a third of a small interior's frame time)
    c.fillRect(mx, my, mw, mh);
    const indoor = framed(m);
    // rooms get dark timber, larger walled places (archives, towers) the weave
    const timber = m.region === 'interior' || (m.def && m.def.indoor) || (m.w <= 17 && m.h <= 12);
    c.save();
    c.translate(mx & 63, my & 63); // the pattern stays put relative to the map
    c.fillStyle = surroundPattern(c, pal, timber);
    const ox = mx & 63, oy = my & 63, top = Math.max(0, my), bot = Math.min(bh, my + mh);
    if (my > 0) c.fillRect(-ox, -oy, bw, my);
    if (my + mh < bh) c.fillRect(-ox, my + mh - oy, bw, bh - my - mh);
    if (mx > 0 && bot > top) c.fillRect(-ox, top - oy, mx, bot - top);
    if (mx + mw < bw && bot > top) c.fillRect(mx + mw - ox, top - oy, bw - mx - mw, bot - top);
    c.restore();
    if (!indoor) return; // outdoors the apron fades instead (drawFade)
    edgeShadow(c, mx, my, mw, mh);
  }

  // Characters stand on their tile by a foot anchor (RB.sprites.ANCHOR, inside a
  // RB.sprites.FRAME-sized frame): the middle of the tile, 2 art px above its
  // bottom edge. Walking shows an eight-phase cycle (four frames per step, from
  // the step's progress); standing people breathe — shoulders, head and arms
  // settle a pixel onto the legs and their hair follows a beat later — each on
  // their own beat, and blink. Reduced motion keeps them still.
  const WALK_PHASES = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'];
  const IDLE_KEYS = ['i0', 'i1', 'i2', 'i3'], IDLE_BLINK = ['i0b', 'i1b', 'i2b', 'i3b'];
  function actorFrame(a, t, isFoe, still) {
    const blink = !a.mv && a.blinkT != null && a.blinkT < 0;
    if (!a.look || a.look.custom) return blink ? 3 : a.frame || 0;
    if (a.mv) {
      const k = Math.max(0, Math.min(0.999, a.mv.t / a.mv.dur));
      return WALK_PHASES[(a.stepToggle ? 0 : 4) + Math.floor(k * 4)];
    }
    if (isFoe || still) return blink ? 3 : 0;
    const ph = a.breath == null ? (a.breath = RB.tiles.hh((a.id || '').length * 31 + (a.home ? a.home[0] * 7 + a.home[1] : 3), 17) % 2600) : a.breath;
    const u = ((t + ph) % 2600) / 2600;
    const i = u < 0.46 ? 0 : u < 0.52 ? 1 : u < 0.88 ? 2 : u < 0.94 ? 3 : 0;
    return (blink ? IDLE_BLINK : IDLE_KEYS)[i];
  }
  function drawActor(c, a, t, isFoe) {
    const x = ax(a.fx * TS), y = ay(a.fy * TS);
    const fx = x + ATS / 2, fy = y + ATS - 2; // the foot anchor on this tile
    const alpha = a.alpha == null ? 1 : Math.max(0, Math.min(1, a.alpha));
    if (alpha < 1) c.globalAlpha = alpha;
    // contact shadow (an animal's is the pets' smaller one)
    const animal = !!(a.look && a.look.pet);
    c.fillStyle = animal ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.25)';
    c.beginPath();
    c.ellipse(fx, fy - 2, animal ? 8 : 11, animal ? 2.5 : 4, 0, 0, Math.PI * 2);
    c.fill();
    // an animal among the people (Mochi) is drawn with the pets' rig, like every other animal (57_petworld.js)
    const pf = a.look && a.look.pet && RB.petWorld && RB.petWorld.actorFrame && RB.petWorld.actorFrame(a, t);
    if (pf) {
      c.drawImage(pf.cv, Math.round(fx - pf.ax), Math.round(fy - pf.ay + (a.dy || 0)));
      if (alpha < 1) c.globalAlpha = 1;
      return;
    }
    const still = RB.game.reducedMotion();
    const bob = isFoe && !still ? Math.round(Math.sin(t / 300 + a.x) * 3) : 0;
    // (a turn on the spot is drawn through a pivot: RB.sprites.view, src/engine/32_spriteart.js — drawing only)
    const fr0 = actorFrame(a, t, isFoe, still), vw = RB.sprites.view ? RB.sprites.view(a, t, still || isFoe, fr0) : null;
    // staged or idle body language (src/engine/52_staging.js): a pose key, a drawn facing, a small offset
    // (a half-step, a hop); not while a turn pivots, so the turn still shows
    const sf = !isFoe && (!vw || !vw.turn) && RB.staging ? RB.staging.frameOf(a, t, still, vw ? vw.frame : fr0) : null;
    const art = RB.sprites.getArt && RB.sprites.getArt(a.look, sf ? sf.dir : vw ? vw.dir : a.dir, sf && sf.key ? sf.key : vw ? vw.frame : fr0);
    const dy = (a.dy || 0) + (sf ? sf.oy : 0); // a knee dip during a field action (src/ui/57_weave.js)
    const ox = sf ? sf.ox : 0;
    if (art) c.drawImage(art, fx - RB.sprites.ANCHOR.x + ox, fy - RB.sprites.ANCHOR.y + bob + dy);
    else c.drawImage(RB.sprites.get(a.look, a.dir, a.frame || 0), fx - 16, fy - 46 + bob + dy, 32, 48);
    if (a.overlay) a.overlay(c, fx, fy + dy, t); // the raised hand and brush of a field action
    if (alpha < 1) c.globalAlpha = 1;
  }
  // Top of an adult's head above its tile's top edge, in art px (for bubbles and markers).
  const HEAD_TOP = 20;

  // Emote bubbles at art resolution: an inked paper bubble with a tail and a
  // small drawn mark. Cached per kind.
  const emoteCache = new Map();
  const EMOTE = {
    '!': [[9, 3, 3, 7, 'i'], [9, 12, 3, 3, 'i']],
    '?': [[7, 3, 6, 2, 'i'], [12, 4, 2, 3, 'i'], [10, 7, 3, 2, 'i'], [9, 8, 2, 2, 'i'], [9, 12, 3, 3, 'i']],
    '...': [[4, 9, 3, 3, 'i'], [9, 9, 3, 3, 'i'], [14, 9, 3, 3, 'i']],
    note: [[11, 3, 2, 9, 'i'], [13, 3, 4, 2, 'i'], [15, 5, 2, 2, 'i'], [7, 10, 5, 4, 'i'], [8, 9, 3, 1, 'i']],
    heart: [[5, 5, 4, 3, 'r'], [12, 5, 4, 3, 'r'], [4, 7, 13, 3, 'r'], [6, 10, 9, 2, 'r'], [8, 12, 5, 2, 'r'], [10, 14, 1, 1, 'r'], [6, 6, 2, 1, 'w']],
    sweat: [[10, 3, 2, 2, 'b'], [9, 5, 4, 3, 'b'], [8, 8, 6, 5, 'b'], [9, 13, 4, 1, 'b'], [9, 8, 1, 2, 'w']],
    anger: [[5, 4, 3, 3, 'r'], [13, 4, 3, 3, 'r'], [5, 11, 3, 3, 'r'], [13, 11, 3, 3, 'r'], [8, 6, 2, 1, 'r'], [11, 6, 2, 1, 'r'], [8, 12, 2, 1, 'r'], [11, 12, 2, 1, 'r']],
  };
  const EMOTE_COL = { i: '#2a2024', r: '#c8404e', b: '#4a8ad0', w: '#ffffff' };
  function emoteArt(kind) {
    let cv = emoteCache.get(kind);
    if (cv) return cv;
    cv = RB.sprites.makeCanvas(22, 24);
    const g = cv.getContext('2d');
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    // outline, paper, a lit top edge and a shaded bottom edge, and the tail
    R(1, 0, 20, 19, '#2a2024'); R(0, 1, 22, 17, '#2a2024');
    R(2, 1, 18, 17, '#fffaf0'); R(1, 2, 20, 15, '#fffaf0');
    R(2, 16, 18, 1, '#e3d7bf'); R(2, 1, 18, 1, '#ffffff');
    R(8, 19, 6, 2, '#2a2024'); R(9, 18, 4, 2, '#fffaf0'); R(10, 21, 2, 2, '#2a2024'); R(10, 20, 2, 1, '#e3d7bf');
    for (const [x, y, w, h, k] of EMOTE[kind] || EMOTE['...']) R(x, y, w, h, EMOTE_COL[k]);
    emoteCache.set(kind, cv);
    return cv;
  }
  function drawEmote(c, a, kind) {
    c.drawImage(emoteArt(kind), ax(a.fx * TS) + ATS / 2 - 11, ay(a.fy * TS) - HEAD_TOP - 28);
  }

  function interactMarker(c, W, t) {
    if (RB.game.mode() !== 'world' || W.player.mv) return;
    const [fx, fy] = RB.world.frontTile();
    let show = false;
    for (const n of W.npcs) if (n.x === fx && n.y === fy && n.def.talk) show = true;
    for (const f of W.foes) if (f.x === fx && f.y === fy) show = true;
    const s = RB.game.s;
    for (const p of W.map.props) {
      if (!(p.text || p.scene) || (p.if && !RB.state.test(s, p.if))) continue;
      const pd = RB.props.P[p.p];
      const pw = p.w || (pd && pd.w) || 1, ph = p.h || (pd && pd.h) || 1;
      if (fx >= p.x && fx < p.x + pw && fy >= p.y && fy < p.y + ph) show = true;
    }
    if (!show) return;
    // a small inked chevron over the thing you can act on
    const x = ax(fx * TS) + 12;
    const y = ay(fy * TS) - HEAD_TOP - 12 + (RB.game.reducedMotion() ? 0 : Math.round(Math.sin(t / 200) * 3));
    c.fillStyle = '#2a2024';
    c.fillRect(x - 1, y - 1, 10, 3); c.fillRect(x + 1, y + 2, 6, 2); c.fillRect(x + 3, y + 4, 2, 2);
    c.fillStyle = '#fff4c8';
    c.fillRect(x, y, 8, 1); c.fillRect(x + 1, y + 1, 6, 1); c.fillRect(x + 2, y + 2, 4, 1); c.fillRect(x + 3, y + 3, 2, 1);
  }

  // Past an outdoor map's edge the ground darkens towards the region's night
  // colour over three tiles, from nothing at the edge itself, so the boundary
  // reads without a line. Corners take both bands and so fall off further.
  function drawFade(c, m, pal) {
    if (framed(m)) return;
    const X0 = ax(0), Y0 = ay(0), X1 = ax(m.w * TS), Y1 = ay(m.h * TS);
    if (X0 <= 0 && Y0 <= 0 && X1 >= bw && Y1 >= bh) return;
    const n = parseInt(pal.dark.slice(1), 16), rgb = (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
    const D = 3 * ATS, A = 0.5;
    const band = (fx, fy, tx, ty, x, y, w, h) => {
      const gr = c.createLinearGradient(fx, fy, tx, ty);
      gr.addColorStop(0, 'rgba(' + rgb + ',0)');
      gr.addColorStop(1, 'rgba(' + rgb + ',' + A + ')');
      c.fillStyle = gr;
      c.fillRect(x, y, w, h);
    };
    if (X0 > 0) band(X0, 0, X0 - D, 0, 0, 0, X0, bh);
    if (X1 < bw) band(X1, 0, X1 + D, 0, X1, 0, bw - X1, bh);
    if (Y0 > 0) band(0, Y0, 0, Y0 - D, 0, 0, bw, Y0);
    if (Y1 < bh) band(0, Y1, 0, Y1 + D, 0, Y1, bw, bh - Y1);
  }

  function drawWorld(t) {
    const W = RB.world.W;
    const m = W.map;
    if (!m) return;
    if (staticDirty || !m.staticLayer) buildStatic(m);
    else { const need = marginFor(m); if (need.x > m.margin.x || need.y > m.margin.y) buildStatic(m); }
    updateCamera(W);
    const c = bctx;
    const pal = palOf(m);
    const g = m.margin;
    drawSurround(c, m, pal, t);
    c.drawImage(m.staticLayer, ax(-g.x * TS), ay(-g.y * TS));
    // animated water (past the edge too: the river keeps flowing)
    const x0 = Math.max(-g.x, Math.floor(cam.x / TS)), y0 = Math.max(-g.y, Math.floor(cam.y / TS));
    const x1 = Math.min(m.w + g.x, Math.ceil((cam.x + bw / ART) / TS) + 1), y1 = Math.min(m.h + g.y, Math.ceil((cam.y + bh / ART) / TS) + 1);
    const still = RB.game.reducedMotion();
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const tile = m.tiles[clampI(y, m.h) * m.w + clampI(x, m.w)];
        if (!tile.anim) continue;
        const sx = ax(x * TS), sy = ay(y * TS);
        if (tile.anim2) { tile.anim2(c, sx, sy, pal, t, x, y, still); continue; }
        const ph = (t / 900 + RB.tiles.hh(x, y) % 7) % 4;
        c.fillStyle = pal.water[2];
        const o = still ? 0 : Math.floor(ph * 2);
        c.fillRect(sx + ((RB.tiles.hh(x, y, 3) + o) % 12) * ART, sy + (5 + (RB.tiles.hh(x, y, 4) % 6)) * ART, 3 * ART, ART);
        if (ph < 1) { c.fillStyle = pal.water[3] + '90'; c.fillRect(sx + (RB.tiles.hh(x, y, 5) % 13) * ART, sy + 11 * ART, 2 * ART, ART); }
      }
    // y-sorted drawables
    const s = RB.game.s;
    const list = [];
    const night = ambientOf(m).night;
    for (const st of m.structs) {
      if (st.if && !RB.state.test(s, st.if)) continue;
      const kind = st.type || 'house';
      const o = Object.assign({ night }, st);
      const d2 = RB.props.STRUCT2 && RB.props.STRUCT2[kind];
      list.push({
        z: (st.y + st.h) * TS,
        draw: d2 ? () => d2(c, ax(st.x * TS), ay(st.y * TS), pal, t, o)
          : () => legacy(c, () => RB.props.STRUCT[kind](c, st.x * TS - cam.x, st.y * TS - cam.y, pal, t, o)),
      });
    }
    for (const p of m.props) {
      if (p.if && !RB.state.test(s, p.if)) continue;
      const pd = RB.props.P[p.p];
      if (!pd) continue;
      const ph = p.h || pd.h;
      const lx = p.x * TS - cam.x, ly = p.y * TS - cam.y;
      if (lx < -64 || ly < -64 || lx > bw / ART + 64 || ly > bh / ART + 80) continue;
      const opts = Object.assign({ cx: p.x, cy: p.y, still }, p.o || {});
      list.push({
        z: (p.y + ph) * TS - (pd.block === false ? 12 : 0) - 0.5,
        draw: pd.draw2 ? () => pd.draw2(c, ax(p.x * TS), ay(p.y * TS), pal, t, opts) : () => legacy(c, () => pd.draw(c, lx, ly, pal, t, opts)),
      });
    }
    for (const p of m.apronProps || []) {
      const lx = p.x * TS - cam.x, ly = p.y * TS - cam.y;
      if (lx < -64 || ly < -64 || lx > bw / ART + 64 || ly > bh / ART + 80) continue;
      const pd = RB.props.P[p.p];
      const opts = { cx: p.x, cy: p.y, still };
      list.push({ z: (p.y + 1) * TS - 0.5, draw: pd.draw2 ? () => pd.draw2(c, ax(p.x * TS), ay(p.y * TS), pal, t, opts) : () => legacy(c, () => pd.draw(c, lx, ly, pal, t, opts)) });
    }
    for (const n of W.npcs) list.push({ z: n.fy * TS + TS, draw: () => drawActor(c, n, t) });
    for (const n of W.leavers || []) list.push({ z: n.fy * TS + TS, draw: () => drawActor(c, n, t) });
    for (const n of W.extras || []) list.push({ z: n.fy * TS + TS, draw: () => drawActor(c, n, t) });
    for (const f of W.foes) list.push({ z: f.fy * TS + TS, draw: () => drawActor(c, f, t, true) });
    if (W.comp) list.push({ z: W.comp.fy * TS + TS - 0.1, draw: () => drawActor(c, W.comp, t) });
    list.push({ z: W.player.fy * TS + TS, draw: () => drawActor(c, W.player, t) });
    if (RB.petWorld) RB.petWorld.push(list, c, ax, ay, t); // the cosmetic pet (src/engine/57_petworld.js)
    list.sort((a, b) => a.z - b.z);
    for (const d of list) d.draw();
    drawFade(c, m, pal);
    interactMarker(c, W, t);
    drawLighting(c, m, W, t);
    if (fromHeight(m)) RB.below.drawLights(c, m, belowEnv(m, t)); // the lights far below, through the night
    drawWeather(c, m, t);
    for (const e of W.emotes) {
      const a = RB.world.actorById(e.who);
      if (a) drawEmote(c, a, e.kind);
    }
    // the followed quest's next step (src/engine/62_questmarks.js): over the lighting, so it reads at night
    if (RB.questMarks) RB.questMarks.draw(c, { ax, ay, bw, bh, TS, ART, HEAD: HEAD_TOP }, t);
    // field weaving (src/ui/57_weave.js): the chosen target's frame, support marks, the action's effect
    if (RB.weaveFx) RB.weaveFx.draw(c, { ax, ay, bw, bh, TS, ART, HEAD: HEAD_TOP }, t);
    if (RB.company && RB.company.drawIndicator) RB.company.drawIndicator(c, { ax, ay, TS, ART, HEAD: HEAD_TOP }, t); // a topic waits (58_companion.js)
  }

  // Effective ambience: a map may define alt: [{if, ambient, night}] for story states.
  function ambientOf(m) {
    const s = RB.game.s;
    // a scene's own ambience (night on the veranda), presentation only: RB.staging.ambience
    const ov = RB.staging && RB.staging.ambienceNow();
    if (ov) return ov;
    for (const a of m.def.alt || []) if (s && RB.state.test(s, a.if)) return a;
    return { ambient: m.def.ambient || {}, night: m.def.night };
  }
  function drawLighting(c, m, W, t) {
    const amb = ambientOf(m).ambient || {};
    const dark = amb.dark || 0;
    if (amb.tint) {
      c.fillStyle = amb.tint;
      c.fillRect(0, 0, bw, bh);
    }
    if (!dark) return;
    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, bw, bh);
    lctx.fillStyle = `rgba(${amb.darkCol || '8,10,24'},${dark})`;
    lctx.fillRect(0, 0, bw, bh);
    lctx.globalCompositeOperation = 'destination-out';
    const hole = (lx, ly, r) => {
      const x = ax(lx), y = ay(ly), R = r * ART;
      const g = lctx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.6, 'rgba(0,0,0,0.7)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = g;
      lctx.beginPath();
      lctx.arc(x, y, R, 0, Math.PI * 2);
      lctx.fill();
    };
    // each pool of light breathes on its own phase (by where it is), slowly: a map's lamps no longer pulse
    // together like one heartbeat (the props balance pass)
    const still = RB.game.reducedMotion();
    const flick = (ph) => (still ? 0 : Math.sin(t / 300 + ph) * 1.2);
    const pr = amb.playerLight == null ? 44 : amb.playerLight;
    if (pr) hole(W.player.fx * TS + 8, W.player.fy * TS + 4, pr + flick(0));
    if (W.comp && W.comp.id === 'ren') hole(W.comp.fx * TS + 8, W.comp.fy * TS + 6, 34 + flick(2.1));
    const s = RB.game.s;
    for (const p of m.props) {
      const pd = RB.props.P[p.p];
      if (!pd || !(pd.light || p.light)) continue;
      if (p.if && !RB.state.test(s, p.if)) continue;
      if (p.o && p.o.lit === false) continue;
      hole(p.x * TS + 8, p.y * TS + 2, (p.light || pd.light) + flick(p.x * 1.7 + p.y * 2.3));
    }
    for (const st of m.structs) if (st.lit || ambientOf(m).night) (st.windows || []).forEach((wx) => hole((st.x + wx) * TS + 8, (st.y + st.h) * TS - 10, 18));
    lctx.globalCompositeOperation = 'source-over';
    c.drawImage(light, 0, 0);
  }

  // Weather particles draw from their own stream (xorshift), never Math.random: the language tasks pick
  // from Math.random, and rain or snow must not change which task comes next.
  let pseed = 0x6c8e9cf5;
  function prand() { pseed ^= pseed << 13; pseed >>>= 0; pseed ^= pseed >>> 17; pseed ^= pseed << 5; pseed >>>= 0; return pseed / 4294967296; }
  // Weather at art resolution: finer drops, flakes and motes than the tiles.
  function drawWeather(c, m, t) {
    const amb = ambientOf(m).ambient || {};
    const kind = amb.weather;
    if (!kind) return;
    const reduced = RB.game.reducedMotion();
    const target = reduced ? 16 : kind === 'rain' ? 110 : 60;
    while (particles.length < target) particles.push({ x: prand() * bw, y: prand() * bh, v: 0.5 + prand(), p: prand() * 6 });
    for (const p of particles) {
      if (kind === 'rain') {
        p.y += (reduced ? 2 : 8) * p.v; p.x -= reduced ? 0.4 : 2;
        c.fillStyle = 'rgba(200,220,255,0.45)';
        c.fillRect(p.x, p.y, 1, 7);
      } else if (kind === 'snow') {
        p.y += 0.7 * p.v; p.x += Math.sin(t / 900 + p.p) * 0.5;
        c.fillStyle = 'rgba(255,255,255,0.85)';
        const sz = p.v > 1.1 ? 3 : 2;
        c.fillRect(p.x, p.y, sz, sz);
      } else if (kind === 'embers') {
        p.y -= 0.6 * p.v; p.x += Math.sin(t / 700 + p.p) * 0.6;
        c.fillStyle = `rgba(255,${150 + (p.p * 15 | 0)},80,0.75)`;
        c.fillRect(p.x, p.y, 2, 2);
      } else if (kind === 'motes' || kind === 'fireflies') {
        p.y += Math.sin(t / 1200 + p.p) * 0.24; p.x += Math.cos(t / 1500 + p.p) * 0.24;
        const a = (Math.sin(t / 500 + p.p * 3) + 1) / 2;
        c.fillStyle = kind === 'fireflies' ? `rgba(220,255,140,${a})` : `rgba(255,248,220,${a * 0.6})`;
        c.fillRect(p.x, p.y, 2, 2);
        if (kind === 'fireflies' && a > 0.7) { c.fillStyle = `rgba(220,255,140,${(a - 0.7) * 0.8})`; c.fillRect(p.x - 1, p.y - 1, 4, 4); }
      } else if (kind === 'leaves') {
        p.y += 0.8 * p.v; p.x += Math.sin(t / 600 + p.p) * 1;
        c.fillStyle = p.p > 3 ? '#e09a48' : '#cc7036';
        c.fillRect(p.x, p.y, 3, 2);
        c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(p.x + 1, p.y + 2, 2, 1);
      } else if (kind === 'pages') {
        p.y += 0.5 * p.v; p.x += Math.sin(t / 800 + p.p) * 0.8;
        c.fillStyle = 'rgba(240,236,220,0.75)';
        c.fillRect(p.x, p.y, 6, 4);
        c.fillStyle = 'rgba(90,80,70,0.35)'; c.fillRect(p.x + 1, p.y + 1, 4, 1);
      }
      if (p.y > bh + 8) { p.y = -8; p.x = prand() * bw; }
      if (p.y < -12) { p.y = bh + 4; p.x = prand() * bw; }
      if (p.x < -8) p.x = bw + 4;
      if (p.x > bw + 12) p.x = -4;
    }
  }

  function frame(t) {
    if (!ctx) return;
    if (override) {
      // overrides that draw at art resolution say so with fn.art = true;
      // older ones draw in logical pixels through the ×ART transform
      if (override.art) override(bctx, bw, bh, t);
      else legacy(bctx, () => override(bctx, Math.ceil(bw / ART), Math.ceil(bh / ART), t));
    } else if (RB.world.W.map) {
      drawWorld(t);
    } else {
      bctx.fillStyle = '#0e1116';
      bctx.fillRect(0, 0, bw, bh);
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, bw * artPx, bh * artPx);
  }
  function setOverride(fn) {
    override = fn;
  }
  // Draw one frame now, e.g. while a transition is still dark, so the new
  // map's static layer and prop caches are built before it fades in.
  function prewarm() {
    if (!override && RB.world.W.map) frame(typeof performance !== 'undefined' ? performance.now() : 0);
  }

  function onPointer(e) {
    if (!RB.world.W.map || override) return;
    const rect = canvas.getBoundingClientRect();
    const gx = ((e.clientX - rect.left) * dpr) / (artPx * ART) + cam.x;
    const gy = ((e.clientY - rect.top) * dpr) / (artPx * ART) + cam.y;
    RB.world.tapTile(Math.floor(gx / TS), Math.floor(gy / TS));
  }

  // Small thumbnail of the current view for save slots (data URL).
  function thumbnail() {
    try {
      const W = RB.world.W;
      if (!W.map) return null;
      const tw = 96, th = 64;
      const cv = document.createElement('canvas');
      cv.width = tw; cv.height = th;
      const c = cv.getContext('2d');
      c.imageSmoothingEnabled = true;
      const sw = 144 * ART, sh = 96 * ART;
      const sx = Math.max(0, Math.round(bw / 2 - sw / 2)), sy = Math.max(0, Math.round(bh / 2 - sh / 2));
      c.drawImage(buf, sx, sy, sw, sh, 0, 0, tw, th);
      return cv.toDataURL('image/png');
    } catch (err) {
      return null;
    }
  }
  // Whether the world map is what is on screen (not combat, the title or creation).
  function worldVisible() {
    return !override && !!RB.world.W.map;
  }
  // Screen position (css px) of a tile, for placing DOM bubbles.
  function tileToCss(x, y) {
    const k = (artPx * ART) / dpr;
    return { x: (x * TS - cam.x) * k, y: (y * TS - cam.y) * k };
  }

  return { init, frame, prewarm, invalidate, setOverride, setReserve, viewSize, thumbnail, tileToCss, worldVisible, resize, setView, cam, enclosed, ART, TS };
})();
