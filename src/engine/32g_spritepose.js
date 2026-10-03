/* Pose layer for the overworld figures (the expressive actor system, docs/expressive/CONTRACT.md §3.4).
 *
 * The road sprites (32_spriteart.js, 40×58 art px) breathe, blink, walk and turn. This layer lets the
 * same rig hold a pose: arms and hands at a target (chest, chin, mouth, forehead, temple, a pointing
 * arm, an open palm, both hands presenting something, arms folded, a hand on the hip, hands behind the
 * back …), the head lowered or turned a pixel, the eyes aside or downcast, the upper body leaning or
 * bowing (side views), the body lowered to kneel or sit, and a held object (papers, a ledger, a cup, a
 * notice, a lamp …) that follows the hand that holds it. It draws from the same parts (legs, garment,
 * head, hair, accessories), so a posed figure is the same person with the same look, including the
 * player's effective look (RB.equip.look).
 *
 * Legibility at play scale (a hand is 3 art px): every pose is a deliberate silhouette — an arm that
 * crosses the body or the face gets its own dark contour, the elbow sticks out where the gesture says
 * so, a pointing arm is long and level, a held object is bigger than life by a pixel. Poses are named
 * key poses (POSES), not free parameters, so the frame keys stay few and the cache stays bounded.
 *
 * Frame keys: 'p:<pose>[.<R|L>][/<prop>][~<gaze>][:<breath 0|1>][b]'
 *   pose   a name in POSES ('chin', 'point', 'folded', 'bow2' …)
 *   R|L    the hand that gestures (the person's own right or left); default: the free hand
 *          (a cane, lamp, book or basket is held in its own hand, which stays put)
 *   prop   a held object (PROPS: paper, ledger, notice, cup, teapot, tags, brush, stamp, book …)
 *   gaze   eyes-only glance: l / r (screen side), u, d (downcast), c (closed), b (side view: back)
 *   breath 1 = the breathing key that settles a pixel (as i1/i2)
 * RB.sprites.getArt(look, dir, key) draws it; frames are cached per look, direction and key in a
 * bounded LRU (RB.sprites._pose.stats()). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const SP = RB.sprites, A = SP._art, P = RB.pix, shade = P.shade, mix = P.mix;
  const W = A.W, H = 56 + A.TOP, TOP = A.TOP;
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  // ---- arm targets ------------------------------------------------------------------------------
  // Geometry in art px from the body rows T (shoulders), B (belt), F (top of the face) of geom().
  //   DN: the down (front) view's screen-left arm (the person's right); the screen-right arm mirrors.
  //   SD: the side view's near arm, facing right (the shoulder at 20, T+2).
  // E elbow, H hand centre, h hand shape, a anchor ('f' moves with the head, else with the body),
  // k layering: 'front' crosses the body (contour), 'over' lies over the face (after the head),
  // 'side' beside the body. up: in the back view a front/over arm is hidden behind the body.
  const DN = {
    chest: (T, B, F) => ({ E: [10, T + 7], H: [15, T + 5], h: 'open', k: 'front' }),
    heart: (T, B, F) => ({ E: [10, T + 7], H: [16, T + 4], h: 'flat', k: 'front' }),
    chin: (T, B, F) => ({ E: [11, T + 8], H: [17, F + 16], h: 'fist', k: 'over', a: 'f' }),
    mouth: (T, B, F) => ({ E: [11, T + 7], H: [18, F + 14], h: 'open', k: 'over', a: 'f' }),
    forehead: (T, B, F) => ({ E: [5, T + 1], H: [14, F + 4], h: 'flat', k: 'over', a: 'f' }),
    temple: (T, B, F) => ({ E: [6, T + 2], H: [12, F + 8], h: 'pinch', k: 'over', a: 'f' }),
    hair: (T, B, F) => ({ E: [6, T + 2], H: [10, F + 9], h: 'open', k: 'over', a: 'f' }),
    shade: (T, B, F) => ({ E: [5, T], H: [14, F + 5], h: 'flat', k: 'over', a: 'f' }),
    raise: (T, B, F) => ({ E: [7, T + 2], H: [8, F + 8], h: 'fist', k: 'side' }),
    half: (T, B, F) => ({ E: [9, T + 7], H: [13, T + 3], h: 'open', k: 'front' }),
    palm: (T, B, F) => ({ E: [8, T + 7], H: [5, B], h: 'palm', k: 'side' }),
    palmout: (T, B, F) => ({ E: [7, T + 6], H: [3, B - 2], h: 'palm', k: 'side' }),
    point: (T, B, F) => ({ E: [7, T + 3], H: [5, T + 3], h: 'point', k: 'side', d: [-1, 0] }),
    pointup: (T, B, F) => ({ E: [6, T + 1], H: [6, F + 3], h: 'point', k: 'side', d: [0, -1] }),
    pointdown: (T, B, F) => ({ E: [7, T + 6], H: [5, B + 3], h: 'point', k: 'side', d: [-1, 1] }),
    out: (T, B, F) => ({ E: [7, T + 6], H: [3, B - 2], h: 'open', k: 'side' }),
    in: (T, B, F) => ({ E: [10, T + 7], H: [15, B - 2], h: 'open', k: 'front' }),
    forward: (T, B, F) => ({ E: [10, T + 7], H: [15, T + 7], h: 'open', k: 'front' }),
    folded: (T, B, F) => ({ E: [10, T + 6], H: [24, T + 6], h: 'hidden', k: 'front' }),
    hip: (T, B, F) => ({ E: [6, T + 6], H: [11, B], h: 'fist', k: 'side' }),
    behind: (T, B, F) => ({ E: [10, T + 6], H: [14, B + 1], h: 'hidden', k: 'behind' }),
    up: (T, B, F) => ({ E: [6, T + 1], H: [6, F + 4], h: 'open', k: 'side' }),
    fist: (T, B, F) => ({ E: [9, T + 7], H: [11, T + 3], h: 'fist', k: 'side' }),
    count1: (T, B, F) => ({ E: [10, T + 7], H: [14, T + 3], h: 'count1', k: 'front' }),
    count2: (T, B, F) => ({ E: [10, T + 7], H: [14, T + 3], h: 'count2', k: 'front' }),
    count3: (T, B, F) => ({ E: [10, T + 7], H: [14, T + 3], h: 'count3', k: 'front' }),
    sleeve: (T, B, F) => ({ E: [10, T + 6], H: [18, B - 2], h: 'hidden', k: 'front' }),
    clasp: (T, B, F) => ({ E: [10, T + 7], H: [17, B + 1], h: 'open', k: 'front' }),
    reach: (T, B, F) => ({ E: [7, T + 5], H: [5, T + 7], h: 'open', k: 'side' }),
    stretch: (T, B, F) => ({ E: [7, T - 1], H: [9, F - 3], h: 'fist', k: 'side' }),
    rub: (T, B, F) => ({ E: [10, T + 7], H: [18, T + 6], h: 'open', k: 'front' }),
    low: (T, B, F) => ({ E: [10, T + 7], H: [14, B + 1], h: 'open', k: 'front' }),
    flatdown: (T, B, F) => ({ E: [9, T + 7], H: [14, B + 1], h: 'flat', k: 'front' }),
    strap: (T, B, F) => ({ E: [10, T + 7], H: [15, T + 3], h: 'fist', k: 'front' }),
    forearm: (T, B, F) => ({ E: [10, T + 7], H: [24, B - 1], h: 'open', k: 'front' }),
  };
  const SD = {
    chest: (T, B, F) => ({ E: [19, T + 7], H: [25, T + 5], h: 'open', k: 'front' }),
    heart: (T, B, F) => ({ E: [19, T + 7], H: [24, T + 4], h: 'flat', k: 'front' }),
    chin: (T, B, F) => ({ E: [21, T + 8], H: [27, F + 16], h: 'fist', k: 'over', a: 'f' }),
    mouth: (T, B, F) => ({ E: [22, T + 7], H: [28, F + 14], h: 'open', k: 'over', a: 'f' }),
    forehead: (T, B, F) => ({ E: [25, T], H: [27, F + 4], h: 'flat', k: 'over', a: 'f' }),
    temple: (T, B, F) => ({ E: [23, T + 2], H: [24, F + 8], h: 'pinch', k: 'over', a: 'f' }),
    hair: (T, B, F) => ({ E: [16, T + 2], H: [17, F + 10], h: 'open', k: 'over', a: 'f' }),
    shade: (T, B, F) => ({ E: [25, T], H: [29, F + 5], h: 'flat', k: 'over', a: 'f' }),
    raise: (T, B, F) => ({ E: [22, T + 1], H: [25, F + 7], h: 'fist', k: 'front' }),
    half: (T, B, F) => ({ E: [21, T + 7], H: [27, T + 6], h: 'open', k: 'front' }),
    palm: (T, B, F) => ({ E: [21, T + 7], H: [28, B - 2], h: 'palm', k: 'front' }),
    palmout: (T, B, F) => ({ E: [22, T + 6], H: [30, B - 3], h: 'palm', k: 'front' }),
    point: (T, B, F) => ({ E: [26, T + 3], H: [32, T + 2], h: 'point', k: 'front', d: [1, 0] }),
    pointup: (T, B, F) => ({ E: [24, T + 1], H: [28, F + 2], h: 'point', k: 'front', d: [1, -1] }),
    pointdown: (T, B, F) => ({ E: [24, T + 6], H: [30, B + 3], h: 'point', k: 'front', d: [1, 1] }),
    out: (T, B, F) => ({ E: [23, T + 6], H: [29, T + 5], h: 'open', k: 'front' }),
    in: (T, B, F) => ({ E: [21, T + 7], H: [27, B - 2], h: 'open', k: 'front' }),
    forward: (T, B, F) => ({ E: [21, T + 7], H: [28, T + 7], h: 'open', k: 'front' }),
    folded: (T, B, F) => ({ E: [19, T + 7], H: [25, T + 6], h: 'hidden', k: 'front' }),
    hip: (T, B, F) => ({ E: [15, T + 6], H: [19, B], h: 'fist', k: 'front' }),
    behind: (T, B, F) => ({ E: [17, T + 6], H: [14, B + 1], h: 'hidden', k: 'front' }),
    up: (T, B, F) => ({ E: [23, T], H: [25, F + 2], h: 'open', k: 'front' }),
    fist: (T, B, F) => ({ E: [20, T + 7], H: [24, T + 3], h: 'fist', k: 'front' }),
    count1: (T, B, F) => ({ E: [21, T + 7], H: [26, T + 3], h: 'count1', k: 'front' }),
    count2: (T, B, F) => ({ E: [21, T + 7], H: [26, T + 3], h: 'count2', k: 'front' }),
    count3: (T, B, F) => ({ E: [21, T + 7], H: [26, T + 3], h: 'count3', k: 'front' }),
    sleeve: (T, B, F) => ({ E: [19, T + 6], H: [25, B - 2], h: 'hidden', k: 'front' }),
    clasp: (T, B, F) => ({ E: [19, T + 7], H: [24, B + 1], h: 'open', k: 'front' }),
    reach: (T, B, F) => ({ E: [25, T + 5], H: [31, T + 6], h: 'open', k: 'front' }),
    stretch: (T, B, F) => ({ E: [21, T - 2], H: [23, F - 3], h: 'fist', k: 'front' }),
    rub: (T, B, F) => ({ E: [21, T + 7], H: [26, T + 6], h: 'open', k: 'front' }),
    low: (T, B, F) => ({ E: [21, T + 7], H: [27, B + 1], h: 'open', k: 'front' }),
    flatdown: (T, B, F) => ({ E: [21, T + 7], H: [27, B + 1], h: 'flat', k: 'front' }),
    strap: (T, B, F) => ({ E: [19, T + 7], H: [23, T + 4], h: 'fist', k: 'front' }),
    forearm: (T, B, F) => ({ E: [19, T + 7], H: [24, B - 1], h: 'open', k: 'front' }),
  };
  // the far arm of a two-handed pose in a side view: the same target a little further on, darker
  const FAR_OFF = { forward: [1, -1], in: [1, 0], out: [-2, 4], clasp: [1, 0], sleeve: [1, 0], rub: [1, 0], folded: [0, 1], stretch: [-1, 0], low: [1, -1], behind: [-1, 0], hip: [0, 0], flatdown: [0, 0], chest: [1, 1], forearm: [1, 0] };
  // in the back view these arms are hidden behind the body (only an elbow can show)
  const UP_BEHIND = new Set(['chest', 'heart', 'chin', 'mouth', 'half', 'in', 'forward', 'folded', 'count1', 'count2', 'count3', 'sleeve', 'clasp', 'rub', 'low', 'flatdown', 'strap', 'temple', 'forearm', 'fist']);

  // ---- named key poses --------------------------------------------------------------------------
  // G: the gesturing hand's target, O: the other hand's (null = at rest); hx, hy: head offset (side
  // views: + forward); lean: upper body shear at the shoulders (side: + forward; front/back: screen x,
  // signed by the gesturing side); drop: the body lowered (kneel, sit; −1 raises the shoulders);
  // legs: 'kneel' | 'sit' | 'step'; eyes, mouth: see 32_spriteart.js headDown; prop: the default held
  // object and its hand ('G' | 'O' | 'both').
  const POSES = {
    // resting stances
    hip: { G: 'hip' }, hips: { G: 'hip', O: 'hip' }, behind: { G: 'behind', O: 'behind' }, folded: { G: 'folded', O: 'folded' },
    clasp: { G: 'clasp', O: 'clasp' }, sleeves: { G: 'sleeve', O: 'sleeve' }, strap: { G: 'strap' }, heart: { G: 'heart' },
    // attention
    listen: { lean: 1 }, nod1: { hy: 1 }, nod2: { hy: 2, eyes: 'd' }, observe: { G: 'behind', O: 'behind', lean: 2, hx: 1, hy: 1, eyes: 'd' },
    // thought
    chin0: { G: 'half' }, chin: { G: 'chin', hx: -1, fhx: -1 }, temple: { G: 'temple' }, temple2: { G: 'temple', hy: -1 },
    half: { G: 'half' }, aside: { hx: -1 },
    // explanation
    palm: { G: 'palm' }, palmout: { G: 'palmout' }, point: { G: 'point' }, pointup: { G: 'pointup', eyes: 'u' }, pointdown: { G: 'pointdown', eyes: 'd' },
    size_out: { G: 'out', O: 'out' }, size_in: { G: 'in', O: 'in' }, count1: { G: 'count1' }, count2: { G: 'count2' }, count3: { G: 'count3' },
    // objects
    present: { G: 'forward', O: 'forward', hy: 1, eyes: 'd', prop: 'both' }, reach: { G: 'reach', prop: 'G' }, take: { G: 'chest', prop: 'G' },
    hold: { G: 'chest', prop: 'G' }, holdboth: { G: 'forward', O: 'forward', prop: 'both' },
    kneel: { G: 'low', legs: 'kneel', drop: 6, hy: 1, eyes: 'd' }, bend: { G: 'low', lean: 3, hx: 2, hy: 2, drop: 1, eyes: 'd' },
    read: { G: 'forward', O: 'forward', hy: 1, eyes: 'd', prop: 'both' }, trace: { G: 'forward', O: 'low', hy: 1, eyes: 'd', prop: 'O' },
    // uncertainty
    shrug: { G: 'palm', O: 'palm', drop: -1, hy: 1, hx: 1, fhx: 1, mouth: 'f' }, step: { legs: 'step', lean: 1 }, guard: { G: 'heart', lean: -1 },
    shakeL: { hx: -1, eyes: 'd' }, shakeR: { hx: 1, eyes: 'd' },
    // tension
    recoil: { G: 'half', lean: -2, hy: -1, eyes: 'u', mouth: 'o' }, forehead: { G: 'forehead', hy: 1, eyes: 'c' },
    emph0: { G: 'chest', mouth: 'f' }, emph1: { G: 'flatdown', hy: 1, mouth: 'f' },
    // vulnerability
    low: { hy: 2, drop: 1, eyes: 'd' }, fidget1: { G: 'rub', O: 'rub', eyes: 'd' }, fidget2: { G: 'forearm', eyes: 'd' },
    avert: { hx: -1, eyes: 'd' }, bow1: { G: 'clasp', O: 'clasp', lean: 1, hx: 1, hy: 1, eyes: 'd' }, bow2: { G: 'clasp', O: 'clasp', lean: 3, hx: 3, hy: 3, drop: 1, eyes: 'c' },
    duck: { hy: 2, eyes: 'c' }, lowface: { hy: 1, drop: 1 }, flinch: { lean: -1, hy: -1, mouth: 'o' },
    // release
    exhale: { drop: 1, eyes: 'c', mouth: 'o' }, thanks: { G: 'palm', O: 'palm', hy: 1, mouth: 'w' }, fist: { G: 'fist' }, pump: { G: 'fist', mouth: 'w' },
    laugh: { G: 'mouth', eyes: 'c' }, laugh2: { G: 'mouth', drop: 1, eyes: 'c' }, smile: { mouth: 'w' },
    // idle habits
    shiftL: { sway: -1 }, shiftR: { sway: 1 }, touchhair: { G: 'hair', eyes: 'd' }, stretch: { G: 'stretch', O: 'stretch', eyes: 'c', mouth: 'o' },
    rub: { G: 'rub', O: 'rub', drop: -1 }, shadeeyes: { G: 'shade', eyes: 'u' }, yawn: { G: 'mouth', eyes: 'c', mouth: 'o' },
    check: { G: 'chest', hy: 1, eyes: 'd' }, brow: { G: 'forehead', eyes: 'c' }, wave: { G: 'up', mouth: 'w' },
    // occupations
    tidy1: { G: 'low', O: 'low', hy: 1, eyes: 'd' }, tidy2: { G: 'in', O: 'low', hy: 1, eyes: 'd' },
    write1: { G: 'low', O: 'in', hy: 1, eyes: 'd', prop: 'G' }, write2: { G: 'in', O: 'in', hy: 1, eyes: 'd', prop: 'G' },
    sort1: { G: 'low', O: 'in', hy: 1, eyes: 'd', prop: 'G' }, sort2: { G: 'palm', O: 'in', hy: 1, eyes: 'd', prop: 'G' },
    stampup: { G: 'raise', O: 'low', hy: 1, eyes: 'd', prop: 'G' }, stampdown: { G: 'flatdown', O: 'low', hy: 1, eyes: 'd', prop: 'G' },
    sweep1: { G: 'chest', O: 'low', hy: 1, eyes: 'd', prop: 'G' }, sweep2: { G: 'rub', O: 'in', hy: 1, eyes: 'd', prop: 'G' },
    pour: { G: 'forward', O: 'low', hy: 1, eyes: 'd', prop: 'G' }, stir1: { G: 'low', hy: 1, eyes: 'd' }, stir2: { G: 'in', hy: 1, eyes: 'd' },
    polish1: { G: 'rub', O: 'chest', hy: 1, eyes: 'd', prop: 'O' }, polish2: { G: 'chest', O: 'chest', hy: 1, eyes: 'd', prop: 'O' },
    hang: { G: 'up', O: 'up', eyes: 'u' }, fold: { G: 'forward', O: 'forward', hy: 1, eyes: 'd' },
    hammer1: { G: 'raise', O: 'low', hy: 1, eyes: 'd' }, hammer2: { G: 'low', O: 'low', hy: 1, eyes: 'd' },
    tend1: { G: 'up', eyes: 'u' }, tend2: { G: 'up', O: 'chest', eyes: 'u' },
    lampup: { G: 'chest', hy: 1, eyes: 'd' }, trim: { G: 'chest', O: 'rub', hy: 1, eyes: 'd' },
    feed: { G: 'low', legs: 'kneel', drop: 6, hy: 1, eyes: 'd' }, jiggle1: { G: 'low', O: 'low', hy: 1, eyes: 'd' }, jiggle2: { G: 'in', O: 'low', hy: 1, eyes: 'd' },
    knead1: { G: 'low', O: 'low', drop: 1, eyes: 'd' }, knead2: { G: 'in', O: 'in', eyes: 'd' },
    sip: { G: 'mouth', eyes: 'c', prop: 'G' }, cuphold: { G: 'chest', prop: 'G' },
    sit: { legs: 'sit', drop: 7 }, sitlap: { G: 'low', O: 'low', legs: 'sit', drop: 7 }, sitlow: { G: 'low', O: 'low', legs: 'sit', drop: 7, hy: 2, eyes: 'd' },
    sitlook: { G: 'low', O: 'low', legs: 'sit', drop: 7, eyes: 'u' }, sitbook: { G: 'forward', O: 'forward', legs: 'sit', drop: 7, hy: 1, eyes: 'd', prop: 'both' },
    crouch: { G: 'low', O: 'low', legs: 'kneel', drop: 6, eyes: 'd' }, peek: { lean: 2, hx: 2, eyes: 'u' }, bounce: { drop: -1 },
    stiff: {}, tilt: { hx: 1 },
  };

  // ---- held objects (drawn at the hand; 'both' between the hands) ------------------------------
  const PAPER = ['#b8ab94', '#d8ccb4', '#f2ead8', '#fffaf0'], INK = '#3a3040';
  const PROPS = {
    paper(b, x, y) { b.rect(x - 2, y - 5, 5, 6, PAPER[2]); b.rect(x - 2, y - 5, 5, 1, PAPER[3]); b.rect(x + 2, y - 4, 1, 5, PAPER[1]); b.px(x - 1, y - 3, INK); b.px(x, y - 3, INK); b.px(x - 1, y - 1, INK); b.px(x + 1, y - 1, INK); },
    letter(b, x, y) { b.rect(x - 3, y - 4, 6, 4, PAPER[2]); b.rect(x - 3, y - 4, 6, 1, PAPER[3]); b.line(x - 3, y - 4, x, y - 2, PAPER[0]); b.line(x + 2, y - 4, x, y - 2, PAPER[0]); b.px(x, y - 2, '#b83a3a'); },
    notice(b, x, y) { b.rect(x - 3, y - 4, 6, 4, '#e8dcc0'); b.rect(x - 3, y - 4, 6, 1, '#f8f0dc'); b.rect(x - 3, y - 2, 6, 1, '#8a3a3a'); b.px(x + 1, y - 3, '#c84a3a'); b.rect(x + 2, y - 3, 1, 3, '#b8a888'); },
    ledger(b, x, y) { b.rect(x - 3, y - 5, 7, 6, '#4a3a5a'); b.rect(x - 3, y - 5, 7, 1, '#6a5a7a'); b.rect(x + 3, y - 4, 1, 5, PAPER[1]); b.rect(x - 3, y, 7, 1, '#2e2438'); b.px(x, y - 3, '#d8b060'); },
    book(b, x, y) { b.rect(x - 4, y - 4, 8, 4, PAPER[2]); b.rect(x - 4, y - 4, 8, 1, PAPER[3]); b.rect(x, y - 4, 1, 4, PAPER[0]); b.rect(x - 4, y, 8, 1, '#6a3a3a'); b.px(x - 3, y - 2, INK); b.px(x - 2, y - 2, INK); b.px(x + 2, y - 2, INK); },
    folio(b, x, y) { b.rect(x - 3, y - 5, 7, 6, '#e8dcbc'); b.rect(x - 3, y - 5, 7, 1, '#f8f0dc'); b.rect(x - 3, y - 3, 7, 1, '#6a4a3a'); b.rect(x + 3, y - 4, 1, 5, '#b8a888'); },
    accountbook(b, x, y) { b.rect(x - 2, y - 4, 5, 4, '#a83a4a'); b.rect(x - 2, y - 4, 5, 1, '#c85a6a'); b.rect(x + 2, y - 3, 1, 3, PAPER[1]); b.px(x, y - 2, '#e8c070'); },
    cup(b, x, y) { b.rect(x - 1, y - 3, 3, 3, '#e8e0d0'); b.rect(x - 1, y - 3, 3, 1, '#6a8aa0'); b.px(x + 1, y - 1, '#b8b0a0'); },
    teapot(b, x, y) { b.rect(x - 2, y - 3, 5, 3, '#4a5a4a'); b.rect(x - 1, y - 4, 3, 1, '#5a6a5a'); b.px(x + 3, y - 3, '#4a5a4a'); b.px(x + 4, y - 4, '#4a5a4a'); b.px(x - 1, y - 3, '#7a8a7a'); },
    tags(b, x, y) { b.rect(x - 2, y - 4, 3, 4, '#e8d8b0'); b.rect(x, y - 5, 3, 4, '#f4e8c8'); b.px(x + 1, y - 4, '#8a3a3a'); b.px(x - 1, y - 3, INK); b.line(x - 1, y - 6, x + 1, y - 5, '#8a6a44'); },
    brush(b, x, y) { b.rect(x, y - 6, 1, 6, '#8a6a44'); b.px(x, y - 7, '#a88a5a'); b.rect(x, y, 1, 2, '#2a2024'); },
    stamp(b, x, y) { b.rect(x - 1, y - 4, 3, 3, '#8a6a44'); b.px(x - 1, y - 4, '#b08e58'); b.rect(x - 1, y - 1, 3, 1, '#c83a3a'); },
    broom(b, x, y) { b.line(x, y - 6, x - 2, y + 10, '#8a6a44'); b.rect(x - 5, y + 10, 6, 3, '#c8a860'); b.rect(x - 5, y + 12, 6, 1, '#a88a40'); },
    lantern(b, x, y) { b.rect(x, y, 1, 2, '#3a3440'); b.rect(x - 2, y + 2, 5, 1, '#3a3440'); b.rect(x - 2, y + 3, 5, 5, '#ffd27a'); b.rect(x - 2, y + 3, 1, 5, '#fff0b8'); b.rect(x + 2, y + 3, 1, 5, '#e8a040'); b.rect(x - 2, y + 8, 5, 1, '#3a3440'); },
    bottle(b, x, y) { b.px(x, y - 5, '#a88860'); b.rect(x - 1, y - 4, 2, 4, '#6ab0a0'); b.px(x - 1, y - 4, '#9ad8c8'); },
    cloth(b, x, y) { b.rect(x - 1, y, 3, 5, '#f0ece0'); b.rect(x - 1, y + 4, 3, 1, '#c8c4b8'); b.px(x + 1, y + 1, '#d8d4c8'); },
    envelopes(b, x, y) { b.rect(x - 3, y - 5, 6, 3, '#e8dcc0'); b.rect(x - 2, y - 3, 6, 3, '#f4ead4'); b.px(x + 1, y - 2, '#b83a3a'); b.rect(x - 3, y - 5, 6, 1, '#f8f0dc'); },
    pipe(b, x, y) { b.line(x, y, x + 9, y - 3, '#6a6a72'); b.rect(x + 9, y - 4, 2, 2, '#ffb050'); b.px(x + 10, y - 4, '#fff0a0'); },
    ribbon(b, x, y) { b.rect(x - 1, y, 2, 6, '#c8a0a8'); b.px(x, y + 6, '#a88088'); b.px(x - 1, y, '#e8c0c8'); },
    flint(b, x, y) { b.rect(x - 1, y - 2, 2, 2, '#8a8a92'); b.px(x - 1, y - 2, '#b8b8c0'); },
    seeds(b, x, y) { b.rect(x - 2, y - 3, 4, 3, '#b89a6a'); b.rect(x - 2, y - 3, 4, 1, '#d8ba8a'); b.px(x, y - 4, '#8a6a44'); },
  };
  const PROP_NAMES = Object.keys(PROPS);

  // ---- parsing frame keys -------------------------------------------------------------------------
  // 'p:<pose>[+<seat>]…': a gesture made sitting or kneeling takes the legs and the lowered body of
  // the seat pose (+sit, +kneel) and the arms, head and eyes of the gesture
  const RE = /^p:([a-z_0-9]+)(?:\+([a-z_0-9]+))?(?:\.([RL]))?(?:\/([a-z_]+))?(?:~([lrudcb]))?(?::([01]))?(b)?$/;
  const combos = new Map();
  function combine(name, seat) {
    const k = name + '+' + seat;
    let c = combos.get(k);
    if (!c) {
      const A0 = POSES[name], S0 = POSES[seat];
      c = Object.assign({}, A0, { legs: S0.legs, drop: (S0.drop || 0) + Math.max(0, A0.drop || 0) });
      if (S0.legs === 'sit' || S0.legs === 'kneel') delete c.lean; // no bow from the waist while seated
      combos.set(k, c);
    }
    return c;
  }
  function parse(key) {
    const m0 = RE.exec(key);
    // (positions in the match: 1 pose, 2 seat, 3 hand, 4 prop, 5 gaze, 6 breath, 7 blink)
    const m = m0 ? [m0[0], m0[1], m0[3], m0[4], m0[5], m0[6], m0[7]] : null;
    const name = m && POSES[m[1]] ? m[1] : 'stiff';
    const seat = m0 && m0[2] && POSES[m0[2]] && POSES[m0[2]].legs ? m0[2] : null;
    const S = seat && seat !== name ? combine(name, seat) : POSES[name];
    const breath = m && m[5] ? +m[5] : 0;
    const drop = S.drop || 0;
    const spec = { name, hand: (m && m[2]) || null, prop: (m && m[3]) || null, eyes: (m && m[4]) || S.eyes || null, mouth: S.mouth || null, S };
    const legs = S.legs === 'step' ? { R: { fwd: 1, lift: 0 }, L: { fwd: -1, lift: 0 } } : { R: { fwd: 0, lift: 0 }, L: { fwd: 0, lift: 0 } };
    return { kind: 'pose', ph: 0, blink: !!(m && m[6]), bob: drop + breath, lag: breath, drop, sway: 0, step: false, feet: legs, arms: { R: 0, L: 0 }, P: spec };
  }

  // ---- which hand gestures -------------------------------------------------------------------------
  // A held thing stays in its own hand: a cane, a lamp (left) or a book, a basket (right). The free hand
  // gestures; a cane hand never leaves the cane (a two-handed pose becomes one-handed).
  function holds(look) {
    const acc = look.acc || [];
    return { L: acc.includes('cane') ? 'cane' : acc.includes('lamp') ? 'lamp' : null, R: acc.includes('book') ? 'book' : acc.includes('basket') ? 'basket' : null };
  }
  function freeHand(look) {
    const h = holds(look);
    if (!h.R) return 'R';
    if (!h.L) return 'L';
    return h.L === 'cane' ? 'R' : 'L';
  }
  function resolve(look, spec) {
    const S = spec.S, h = holds(look);
    const G = spec.hand || freeHand(look), O = G === 'R' ? 'L' : 'R';
    const arms = { R: null, L: null };
    if (S.G) arms[G] = S.G;
    if (S.O) arms[O] = S.O;
    if (h.L === 'cane') arms.L = null; // the cane stays planted
    let prop = spec.prop || null, propAt = S.prop || (prop ? 'G' : null);
    if (prop && !PROPS[prop]) prop = null;
    const ph = propAt === 'both' ? (arms[O] ? 'both' : G) : propAt === 'O' ? (arms[O] ? O : G) : G;
    return { arms, G, O, prop, propHand: ph };
  }

  // ---- drawing helpers ------------------------------------------------------------------------------
  const buf = () => { const x = new P.Buf(W, H); x.oy = TOP; return x; };
  const put = (dst, src, dx, dy) => dst.draw(src, dx || 0, (dy || 0) - TOP);
  function shiftRow(bb, row, k) {
    const w = bb.w, d = bb.d, o = row * w * 4;
    const copy = d.slice(o, o + w * 4);
    d.fill(0, o, o + w * 4);
    for (let x = 0; x < w; x++) { const nx = x + k; if (nx < 0 || nx >= w) continue; for (let c = 0; c < 4; c++) d[o + nx * 4 + c] = copy[x * 4 + c]; }
  }
  // the upper body leans: rows above the shoulders by dx, the chest by part of it, nothing at the belt
  const leanAt = (dx, T, B, y) => (!dx ? 0 : y <= T + 1 ? dx : y >= B ? 0 : Math.round((dx * (B - y)) / (B - T - 1)));
  function shear(bb, dx, T, B) {
    if (!dx) return;
    for (let y = -TOP; y < B; y++) { const k = leanAt(dx, T, B, y); if (k) shiftRow(bb, y + TOP, k); }
  }
  // a limb segment of radius r, lit on its upper-left side
  function seg(ab, x0, y0, x1, y1, r, C, cuffAt) {
    const vx = x1 - x0, vy = y1 - y0, L2 = vx * vx + vy * vy || 1, L = Math.sqrt(L2);
    let nx = -vy / L, ny = vx / L;
    if (nx + ny > 0) { nx = -nx; ny = -ny; }
    const bx0 = Math.floor(Math.min(x0, x1) - r - 1), bx1 = Math.ceil(Math.max(x0, x1) + r + 1);
    const by0 = Math.floor(Math.min(y0, y1) - r - 1), by1 = Math.ceil(Math.max(y0, y1) + r + 1);
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
      const px = x + 0.5 - (x0 + 0.5), py = y + 0.5 - (y0 + 0.5);
      let t = (px * vx + py * vy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = px - t * vx, qy = py - t * vy, d2 = qx * qx + qy * qy;
      if (d2 > r * r + 0.01) continue;
      const s = qx * nx + qy * ny;
      let c = s > r - 0.95 ? C[3] : s < -(r - 0.95) ? C[1] : C[2];
      if (cuffAt != null && t * L > L - cuffAt) c = C[1];
      ab.px(x, y, c);
    }
  }
  function hand(ab, sk, x, y, kind, dir) {
    const [z, s, S, L] = sk;
    switch (kind) {
      case 'hidden': return;
      case 'fist': ab.rect(x - 1, y - 1, 3, 3, S); ab.px(x - 1, y - 1, L); ab.px(x, y - 1, L); ab.rect(x - 1, y + 1, 3, 1, s); ab.px(x + 1, y + 1, z); return;
      case 'palm': ab.rect(x - 1, y - 1, 4, 2, S); ab.rect(x - 1, y - 1, 4, 1, L); ab.px(x + 2, y, s); return;
      case 'flat': ab.rect(x - 2, y - 1, 4, 2, S); ab.rect(x - 2, y - 1, 4, 1, L); ab.px(x + 1, y, s); return;
      case 'pinch': ab.rect(x - 1, y - 1, 2, 2, S); ab.px(x - 1, y - 1, L); return;
      case 'point': {
        ab.rect(x - 1, y - 1, 3, 2, S); ab.px(x - 1, y - 1, L); ab.rect(x - 1, y + 1, 2, 1, s);
        const [dx, dy] = dir || [1, 0];
        for (let i = 2; i <= 3; i++) ab.px(Math.round(x + dx * i), Math.round(y + dy * i), i === 3 ? S : L);
        return;
      }
      default:
        if (kind && kind.startsWith('count')) {
          const n = +kind.slice(5) || 1;
          ab.rect(x - 1, y, 3, 2, S); ab.rect(x - 1, y + 1, 3, 1, s);
          for (let i = 0; i < n; i++) { ab.px(x - 1 + i, y - 1, L); ab.px(x - 1 + i, y - 2, S); }
          return;
        }
        ab.rect(x - 1, y - 1, 3, 2, S); ab.px(x - 1, y - 1, L); ab.px(x + 1, y - 1, s); ab.rect(x, y + 1, 2, 1, s); ab.px(x - 1, y, s);
    }
  }
  // composite an arm layer with its own contour where it lies over the figure
  function withContour(dst, ab, ol) {
    const w = ab.w, h = ab.h, d = ab.d, D = dst.d;
    const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] >= 128;
    const base = P.rgba(ol || '#241c20');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (op(x, y)) continue;
      if (!(op(x + 1, y) || op(x - 1, y) || op(x, y + 1) || op(x, y - 1))) continue;
      const o = (y * w + x) * 4;
      if (D[o + 3] < 128) continue; // outside the figure the silhouette outline does it
      D[o] = base[0] + (D[o] - base[0]) * 0.28; D[o + 1] = base[1] + (D[o + 1] - base[1]) * 0.28; D[o + 2] = base[2] + (D[o + 2] - base[2]) * 0.28; D[o + 3] = 255;
    }
    dst.draw(ab, 0, -TOP);
  }

  // ---- the geometry of one posed arm ----------------------------------------------------------------
  // view 'down' | 'up' (screen arm s 0/1) or 'side' (near/far); returns null for an arm at rest
  function armGeom(g, view, target, s, far, hd, lean) {
    const T = g.t, B = g.bt, F = g.fy;
    const tab = view === 'side' ? SD : DN;
    const fn = tab[target];
    if (!fn) return null;
    const o = fn(T, B, F);
    let E = o.E.slice(), Hh = o.H.slice(), d = o.d ? o.d.slice() : null;
    if (view === 'side' && far) { const f = FAR_OFF[target] || [1, -1]; E[0] += f[0]; Hh[0] += f[0]; E[1] += f[1]; Hh[1] += f[1]; }
    // mirror the screen-right arm of the front/back views
    if (view !== 'side' && s === 1) { E[0] = W - 1 - E[0]; Hh[0] = W - 1 - Hh[0]; if (d) d[0] = -d[0]; }
    // an arm follows the body it hangs from: the elbow with the lean at its row, a face target with the head
    E[0] += leanAt(lean, T, B, E[1]);
    if (o.a === 'f') { Hh[0] += hd.dx; Hh[1] += hd.dy; } else Hh[0] += leanAt(lean, T, B, Hh[1]);
    const S0 = view === 'side' ? [far ? 21 : 20, T + 2] : [s ? W - 1 - 10 : 10, T + 2];
    S0[0] += leanAt(lean, T, B, S0[1]);
    return { S: S0, E, H: Hh, h: o.h, k: o.k, d, target };
  }

  // draw one arm (sleeve and hand) and, between them, a held object
  function drawArm(ab, look, p, g, a, far, propFn) {
    const robe = g.shape === 'robe';
    let C = p.cl, sk = p.sk;
    if (far) { C = C.map((c) => shade(c, -1)); sk = sk.map((c) => shade(c, -1)); }
    const [sx, sy] = a.S, [ex, ey] = a.E, [hx, hy] = a.H;
    seg(ab, sx, sy, ex, ey, 1.5, C);
    seg(ab, ex, ey, hx, hy, robe ? 1.9 : 1.5, C, a.h === 'hidden' ? null : 1.1);
    if (robe && hy <= ey + 1) {
      // a wide sleeve hangs from a raised forearm
      const n = 6;
      for (let i = 2; i <= n - 1; i++) {
        const t = i / n, cx = Math.round(ex + (hx - ex) * t), cy = Math.round(ey + (hy - ey) * t);
        ab.rect(cx, cy + 2, 1, 2 + (i > 2 ? 1 : 0), C[1]); ab.px(cx, cy + 4 + (i > 2 ? 0 : -1), C[0]);
      }
    }
    if (propFn) propFn();
    hand(ab, sk, hx, hy, a.h, a.d);
  }

  // ---- legs: kneeling, sitting -------------------------------------------------------------------------
  function legsKneelFB(b, p, g) {
    const pa = p.pa, lt = Math.max(g.hem, g.low) + 1, sole = g.sole;
    for (let s = 0; s < 2; s++) {
      const x = s ? 21 : 13;
      if (lt <= sole) { b.rect(x, lt, 6, sole - lt + 1, pa[1]); b.rect(s ? x + 5 : x, lt, 1, sole - lt + 1, s ? pa[0] : pa[2]); b.rect(x, sole, 6, 1, pa[0]); b.px(x + 2, Math.max(lt, sole - 2), pa[2]); }
    }
  }
  function legsSitFB(b, p, g) {
    const pa = p.pa, bo = p.bo, lt = g.hem + 1, sole = g.sole;
    if (g.shape !== 'robe' && g.shape !== 'dress') { b.rect(13, lt - 1, 14, 3, pa[1]); b.rect(13, lt - 1, 14, 1, pa[2]); }
    for (let s = 0; s < 2; s++) {
      const x = s ? 21 : 15;
      b.rect(x, Math.min(sole - 2, lt + 2), 4, Math.max(1, sole - lt - 3), pa[1]);
      b.rect(x - (s ? 0 : 1), sole - 1, 5, 2, bo[1]); b.rect(x - (s ? 0 : 1), sole - 1, 5, 1, bo[2]); b.rect(x - (s ? 0 : 1), sole, 5, 1, bo[0]);
    }
  }
  function legsSide2(b, p, g, kind) {
    const pa = p.pa, bo = p.bo, sole = g.sole, lt = g.shape === 'dress' ? g.low + 1 : g.hem + 1;
    const leg = (near) => {
      const c = near ? pa : [shade(pa[0], -1), pa[0], pa[1]], cb = near ? bo : [shade(bo[0], -1), bo[0], bo[1]];
      if (kind === 'sit') {
        const kx = near ? 25 : 24;
        for (let y = lt - 1; y <= lt + 1; y++) { b.rect(15, y, kx - 15, 1, c[1]); b.px(15, y, c[2]); }
        b.rect(15, lt - 1, kx - 15, 1, c[2]);
        b.rect(kx - 3, lt + 1, 4, Math.max(1, sole - lt - 2), c[1]); b.px(kx, lt + 1, c[0]);
        b.rect(kx - 3, sole - 1, 6, 2, cb[1]); b.rect(kx - 3, sole - 1, 6, 1, cb[2]); b.rect(kx - 3, sole, 7, 1, cb[0]);
      } else {
        // kneeling: the near knee on the ground ahead, the shin along the ground behind
        const kx = near ? 24 : 22;
        for (let y = lt; y <= sole - 2; y++) { const k = (y - lt) / Math.max(1, sole - 2 - lt); const x = Math.round(16 + (kx - 16) * k); b.rect(x - 2, y, 5, 1, c[1]); b.px(x - 2, y, c[2]); }
        b.rect(13, sole - 2, kx - 11, 3, c[1]); b.rect(13, sole - 2, kx - 11, 1, c[2]); b.rect(13, sole, kx - 11, 1, c[0]);
        b.rect(10, sole - 2, 4, 3, cb[1]); b.px(10, sole - 2, cb[2]); b.rect(10, sole, 4, 1, cb[0]);
      }
    };
    if (g.shape === 'robe' || g.shape === 'dress') {
      if (kind === 'sit') { const kx = 26; b.rect(kx - 3, sole - 1, 6, 2, bo[1]); b.rect(kx - 3, sole, 7, 1, bo[0]); }
      return;
    }
    leg(false); leg(true);
  }
  // a robe or dress lowered to sit pools forward over the knees in the side view
  function lapSide(b, p, g) {
    if (g.shape !== 'robe' && g.shape !== 'dress' && g.shape !== 'coat') return;
    const C = p.cl, y0 = g.bt + 2, sole = g.sole;
    for (let y = y0; y <= Math.min(sole - 2, y0 + 4); y++) { b.rect(14, y, 13 + (y - y0), 1, C[2]); b.px(26 + (y - y0), y, C[0]); }
    b.rect(14, Math.min(sole - 2, y0 + 4), 17, 1, C[1]);
  }

  // ---- composition ---------------------------------------------------------------------------------------
  // The parts are drawn in their usual order, into layers that a pose can move: the head (with the hair
  // and everything worn on it) by the head offset, the upper body by the lean, each posed arm into its own
  // layer with a contour; arms that lie over the face are drawn after the head.
  function humanoid(b, look, dir, pose) {
    const p = A.palette(look), g = A.geom(look, pose), spec = pose.P, S = spec.S;
    const R = resolve(look, spec);
    g.arms = R.arms; g.posed = {};
    const side = dir === 'left' || dir === 'right', view = side ? 'side' : dir;
    const near = dir === 'right' ? 'R' : 'L', far = near === 'R' ? 'L' : 'R';
    // the lean: forward in a side view (lean); in the front and back views only a weight shift (sway, screen x)
    const hand = A.sideAt(view === 'side' ? 'down' : view, 0) === R.G ? -1 : 1; // screen sense of 'away from the gesturing hand'
    const lean = side ? S.lean || 0 : S.sway || 0;
    // the head: forward/back in a side view; in the front and back views a tilt only where the pose asks
    // for one (fhx, away from the gesturing hand), or the screen offset of a pose without arms (a shake)
    const hx = side ? S.hx || 0 : S.fhx != null ? S.fhx * hand : !S.G && !S.O ? S.hx || 0 : 0;
    const hd = { dx: hx + leanAt(lean, g.t, g.bt, g.fy), dy: S.hy || 0 };
    const blink = pose.blink;
    // geometry of each posed arm
    const plan = [];
    if (side) {
      for (const sd of [far, near]) if (R.arms[sd]) { const a = armGeom(g, 'side', R.arms[sd], 0, sd === far, hd, lean); if (a) { a.side = sd; a.far = sd === far; plan.push(a); } }
    } else {
      for (let s = 0; s < 2; s++) { const sd = A.sideAt(view, s); if (R.arms[sd]) { const a = armGeom(g, view, R.arms[sd], s, false, hd, lean); if (a) { a.side = sd; a.s = s; plan.push(a); } } }
    }
    for (const a of plan) g.posed[a.side] = a;
    // the held object of the pose: at one hand, or between both
    const propFn = (a) => {
      if (!R.prop) return null;
      const fn = PROPS[R.prop];
      if (R.propHand === 'both') {
        const others = plan.filter((q) => q !== a);
        if (others.length && plan.indexOf(a) !== plan.length - 1) return null; // drawn once, with the last hand
        const pts = plan.map((q) => q.H);
        const cx = Math.round(pts.reduce((v, q) => v + q[0], 0) / pts.length), cy = Math.round(pts.reduce((v, q) => v + q[1], 0) / pts.length);
        return () => fn(curAb, cx, cy);
      }
      if (a.side !== R.propHand) return null;
      return () => fn(curAb, a.H[0], a.H[1]);
    };
    let curAb = null;
    const drawPlan = (dst, filter) => {
      const list = plan.filter(filter);
      if (!list.length) return;
      // one layer per arm so that the nearer arm keeps its contour over the other
      for (const a of list) {
        const ab = buf(); curAb = ab;
        drawArm(ab, look, p, g, a, !!a.far, propFn(a));
        withContour(dst, ab, p.ol);
      }
    };
    // the arms that stay at rest, drawn as they are drawn standing (the posed spec hidden meanwhile)
    const restArms = (dst, dx) => {
      const P0 = g.P; g.P = null;
      const rb = buf();
      if (side) { /* drawn per side below */ }
      else A.armsFB(rb, look, p, g, view);
      g.P = P0;
      // keep only the halves whose arm is at rest
      for (let s = 0; s < 2; s++) {
        const sd = A.sideAt(view, s);
        if (R.arms[sd]) for (let y = 0; y < rb.h; y++) for (let x = s ? 20 : 0; x < (s ? W : 20); x++) rb.d[(y * W + x) * 4 + 3] = 0;
      }
      put(dst, rb, dx, 0);
    };
    const headLayer = (fn) => { const hb = buf(); fn(hb); put(b, hb, hd.dx, hd.dy); };
    const legs = (dst) => {
      if (S.legs === 'kneel') { if (side) legsSide2(dst, p, g, 'kneel'); else legsKneelFB(dst, p, g); }
      else if (S.legs === 'sit') { if (side) legsSide2(dst, p, g, 'sit'); else legsSitFB(dst, p, g); }
      else if (side) A.legsSide(dst, look, p, g, near);
      else A.legsFB(dst, look, p, g, view);
    };

    if (view === 'down') {
      A.accs(b, look, p, g, 'down', 'back');
      headLayer((hb) => A.hair(hb, look, p, g, 'down', 'back'));
      const bb = buf();
      legs(bb);
      A.garmentFB(bb, look, p, g, 'down');
      shear(bb, lean, g.t, g.bt);
      put(b, bb, 0, 0);
      restArms(b, leanAt(lean, g.t, g.bt, g.t + 4));
      drawPlan(b, (a) => a.k === 'side' || a.k === 'behind');
      A.accs(b, look, p, g, 'down', 'body');
      drawPlan(b, (a) => a.k === 'front');
      headLayer((hb) => { A.headDown(hb, look, p, g, blink); A.accs(hb, look, p, g, 'down', 'face'); A.hair(hb, look, p, g, 'down', 'front'); A.accs(hb, look, p, g, 'down', 'head'); });
      drawPlan(b, (a) => a.k === 'over');
    } else if (view === 'up') {
      A.accs(b, look, p, g, 'up', 'back');
      drawPlan(b, (a) => UP_BEHIND.has(a.target) || a.k === 'over');
      const bb = buf();
      legs(bb);
      A.garmentFB(bb, look, p, g, 'up');
      shear(bb, lean, g.t, g.bt);
      put(b, bb, 0, 0);
      restArms(b, leanAt(lean, g.t, g.bt, g.t + 4));
      drawPlan(b, (a) => !UP_BEHIND.has(a.target) && a.k !== 'over');
      A.accs(b, look, p, g, 'up', 'body');
      headLayer((hb) => { A.headUp(hb, look, p, g); A.hair(hb, look, p, g, 'up', 'back'); A.hair(hb, look, p, g, 'up', 'front'); A.accs(hb, look, p, g, 'up', 'head'); });
    } else {
      A.accs(b, look, p, g, 'side', 'far', near);
      if (!R.arms[far]) { const P0 = g.P; g.P = null; const fb = buf(); A.armSide(fb, look, p, g, far, false); g.P = P0; put(b, fb, leanAt(lean, g.t, g.bt, g.t + 4), 0); }
      A.accs(b, look, p, g, 'side', 'back', near);
      headLayer((hb) => A.hair(hb, look, p, g, 'side', 'back', near));
      const bb = buf();
      legs(bb);
      A.garmentSide(bb, look, p, g);
      if (S.legs === 'sit' || S.legs === 'kneel') lapSide(bb, p, g);
      A.accs(bb, look, p, g, 'side', 'body', near);
      shear(bb, lean, g.t, g.bt);
      put(b, bb, 0, 0);
      drawPlan(b, (a) => a.far && a.k !== 'over');
      if (!R.arms[near]) { const P0 = g.P; g.P = null; const nb = buf(); A.armSide(nb, look, p, g, near, true); g.P = P0; put(b, nb, leanAt(lean, g.t, g.bt, g.t + 4), 0); }
      drawPlan(b, (a) => !a.far && a.k !== 'over');
      A.accs(b, look, p, g, 'side', 'hand', near);
      headLayer((hb) => { A.headSide(hb, look, p, g, blink); A.accs(hb, look, p, g, 'side', 'face', near); A.hair(hb, look, p, g, 'side', 'front', near); A.accs(hb, look, p, g, 'side', 'head', near); });
      drawPlan(b, (a) => a.k === 'over');
    }
    return p;
  }

  // posed hands for the held accessories (a lamp hangs from the hand that holds it, wherever it is)
  function handsFB(g, view, base) {
    const out = base.slice();
    for (let s = 0; s < 2; s++) {
      const sd = A.sideAt(view, s), a = g.posed && g.posed[sd];
      if (a && a.h !== 'hidden') out[s] = { x: a.H[0] - 1, y: a.H[1] - 1, sw: 0 };
    }
    return out;
  }
  function sideHand(g, side) {
    const a = g.posed && g.posed[side];
    if (!a || a.h === 'hidden') return null;
    return { x: a.H[0] - 1, y: a.H[1] - 1, sw: 0, t: g.t + 1 };
  }

  // ---- the bounded frame cache ------------------------------------------------------------------------
  const LRU = new Map(), ids = new WeakMap();
  let nid = 0, CAP = 900;
  const stats = { built: 0, hits: 0, evicted: 0, buildMs: 0, buildMsMax: 0 };
  function art(small, look, dir, frame, build) {
    let id = ids.get(small);
    if (!id) { id = ++nid; ids.set(small, id); }
    const k = id + '|' + dir + '|' + frame;
    let cv = LRU.get(k);
    if (cv !== undefined) { LRU.delete(k); LRU.set(k, cv); stats.hits++; return cv; }
    const t0 = now();
    cv = build(look, dir, frame);
    const ms = now() - t0;
    stats.built++; stats.buildMs += ms; if (ms > stats.buildMsMax) stats.buildMsMax = ms;
    LRU.set(k, cv);
    while (LRU.size > CAP) { LRU.delete(LRU.keys().next().value); stats.evicted++; }
    return cv;
  }
  function release() { LRU.clear(); }
  if (RB.bus) { RB.bus.on('campaign:changing', release); RB.bus.on('equip:change', () => { /* the player's new look has its own key */ }); }

  SP._pose = {
    parse, humanoid, handsFB, sideHand, art, release, resolve, freeHand, holds,
    POSES, PROPS, PROP_NAMES, DN, SD,
    has: (name) => !!POSES[name],
    hasProp: (name) => !!PROPS[name],
    key(name, o) {
      o = o || {};
      return 'p:' + name + (o.seat && o.seat !== name ? '+' + o.seat : '') + (o.hand ? '.' + o.hand : '') + (o.prop ? '/' + o.prop : '') + (o.gaze ? '~' + o.gaze : '') + (o.breath ? ':1' : '') + (o.blink ? 'b' : '');
    },
    stats: () => Object.assign({ entries: LRU.size, cap: CAP }, stats),
    setCap(n) { CAP = Math.max(50, n | 0); while (LRU.size > CAP) { LRU.delete(LRU.keys().next().value); stats.evicted++; } },
  };
})();
