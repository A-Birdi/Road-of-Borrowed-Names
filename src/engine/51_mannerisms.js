/* Mannerism profiles: who a person is, in body language (docs/expressive/GESTURES.md §3–§7; the paired
 * addendum's §4–§5 and §11 reuse policy).
 *
 * One profile per person is the single source that the overworld idle scheduler (RB.staging), the
 * scene cues and, later, the dialogue portraits read, so a person moves like the same person idle in
 * town, in conversation and in a staged scene. Three tiers:
 *   core library   the gestures and habits of RB.gestures, shared by everyone;
 *   class overlay  rates, resting stance, preferred habits and conversation gestures for a kind of
 *                  person (CLASSES: official, scholar, clerk, host, craft, elder, child, keeper,
 *                  traveller, performer, non-human, and 'town' for anyone without a closer fit);
 *   bespoke        authored habits, tells and stronger reactions for the player, the four companions
 *                  and the important recurring characters (src/content/mannerisms/*.js).
 * A person without a profile of their own gets one derived from their look and the station props
 * around where they stand (a desk, a counter, a stove, a lamp …), so every overworld NPC has one.
 *
 * Profile (all fields optional except class):
 *   { class, tier, rest: pose, every: [minS, maxS], idle: [[habit, weight, { at, prop, gaze }]],
 *     route: [[habit, weight]], tells: { surprise, worry, sad, angry, shy, happy, think }: gesture ids,
 *     props: [...], talk: [primitive numbers], strong: [{ beat, gesture }], avoid: [...],
 *     portrait: { idle: [...], cues: { tag: cue } }, states: [{ if, rest, idle, every }], social: 0..1,
 *     maps: { mapId: { rest, restProp, idle } } (their own workplace: the glassblower at his bench) }
 * API: RB.mannerisms.add(id, profile), .of(id), .forActor(actor), .classOf(look, stations), .CLASSES,
 *      .profiles(), .BESPOKE (the ids authored as bespoke), .stationsAt(map, x, y) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.mannerisms = (function () {
  'use strict';
  const P = {};
  // ---- class overlays (GESTURES.md §5) ---------------------------------------------------------------
  // every: seconds between habits (one habit at a time); idle: preferred habits and weights; talk: the
  // conversation primitives by preference; social: how readily they turn to a neighbour (0–1)
  const CLASSES = {
    official: { every: [16, 28], rest: 'behind', idle: [['shift', 2], ['glance', 2], ['lookroad', 1], ['write', 3, { at: 'desk' }], ['tidy', 1, { at: 'surface' }]], route: [['lookroad', 2], ['handsbehind', 1]], talk: [1, 24, 9, 11], social: 0.4, tells: { surprise: 'listen', worry: 'aside', sad: 'lowered', angry: 'emphatic', think: 'chin' } },
    scholar: { every: [12, 22], idle: [['readidle', 3], ['glasses', 2], ['chin', 2], ['glance', 1], ['write', 2, { at: 'desk' }]], route: [['lookroad', 1], ['readidle', 1]], talk: [5, 7, 16, 3], social: 0.4, tells: { surprise: 'listen', worry: 'aside', sad: 'lowered', think: 'chin' } },
    clerk: { every: [10, 20], idle: [['sort', 3, { at: 'surface' }], ['stamp', 2, { at: 'surface' }], ['write', 2, { at: 'desk' }], ['glance', 1], ['check', 1, { prop: 'tags' }]], route: [['check', 1, { prop: 'letter' }], ['lookroad', 1]], talk: [13, 19, 9], social: 0.5, tells: { surprise: 'recoil', worry: 'fidget', sad: 'lowered', think: 'chin' } },
    host: { every: [9, 18], idle: [['tidy', 3, { at: 'surface' }], ['polish', 2], ['pour', 1, { at: 'tea' }], ['stir', 2, { at: 'hearth' }], ['glance', 2]], route: [['lookroad', 1], ['glance', 1]], talk: [9, 13, 31, 32], social: 0.8, tells: { surprise: 'recoil', worry: 'guard', sad: 'lowered', happy: 'laugh', think: 'chin' } },
    craft: { every: [9, 18], idle: [['hammer', 3, { at: 'bench' }], ['brow', 2], ['stretch', 1], ['jiggle', 1, { at: 'nets' }], ['fold', 1], ['shift', 1]], route: [['stretch', 1], ['lookroad', 1], ['brow', 1]], talk: [11, 22, 10], social: 0.6, tells: { surprise: 'listen', worry: 'aside', sad: 'lowered', angry: 'folded', think: 'chin' } },
    elder: { every: [16, 30], idle: [['glance', 2], ['lookroad', 2], ['shift', 1], ['doze', 1], ['rubhands', 1]], route: [['lookroad', 2], ['glance', 1]], talk: [2, 20, 3], social: 0.5, tells: { surprise: 'listen', worry: 'shake', sad: 'lowered', think: 'chin' } },
    child: { every: [5, 11], idle: [['bounce', 3], ['peek', 2], ['crouch', 1], ['glance', 2], ['heeltap', 1]], route: [['bounce', 2], ['peek', 1], ['glance', 1]], talk: [10, 31, 18], social: 0.7, tells: { surprise: 'recoil', worry: 'fidget', sad: 'duck', happy: 'celebrate', think: 'aside' } },
    keeper: { every: [12, 22], idle: [['tendlamp', 3], ['tendlight', 2, { at: 'light' }], ['lookroad', 2], ['glance', 1]], route: [['lookroad', 2], ['tendlamp', 1]], talk: [4, 10, 2], social: 0.4, tells: { surprise: 'listen', worry: 'aside', sad: 'lowered', think: 'chin' } },
    traveller: { every: [10, 20], idle: [['strap', 2], ['lookroad', 3], ['shift', 1], ['check', 1, { prop: 'letter' }]], route: [['lookroad', 2], ['strap', 1]], talk: [3, 10, 14], social: 0.6, tells: { surprise: 'listen', worry: 'aside', sad: 'lowered', think: 'chin' } },
    performer: { every: [8, 16], rest: 'hip', idle: [['hum', 2], ['touchhair', 2], ['shift', 2], ['heeltap', 1]], route: [['hum', 1], ['lookroad', 1]], talk: [9, 11, 31, 32], social: 0.9, tells: { surprise: 'recoil', worry: 'aside', sad: 'lowered', happy: 'laugh', think: 'chin' } },
    nonhuman: { every: [18, 30], idle: [['stiff', 1]], route: [['stiff', 1]], talk: [2], social: 0, tells: {} },
    town: { every: [12, 24], idle: [['shift', 2], ['glance', 2], ['lookroad', 2], ['stretch', 1], ['touchhair', 1]], route: [['lookroad', 2], ['stretch', 1], ['glance', 1]], talk: [9, 2, 10], social: 0.6, tells: { surprise: 'listen', worry: 'aside', sad: 'lowered', think: 'chin' } },
  };
  const BESPOKE = [];
  function add(id, prof) {
    P[id] = Object.assign({ id }, prof);
    if (prof.tier === 'bespoke' && !BESPOKE.includes(id)) BESPOKE.push(id);
    return P[id];
  }

  // ---- stations: what a person stands at (props within a tile and a half) -------------------------
  const STATION = [
    [/desk/, ['desk', 'surface']], [/counter|stall|register/, ['surface']], [/teaset|table/, ['surface', 'tea']],
    [/stove|pot|irori|kettle|hearth|furnace|kiln|oven/, ['hearth']], [/campfire|brazier|fire/, ['fire']],
    [/anvil|workbench|wheel|loom|sawhorse/, ['bench']], [/laundry|wash/, ['laundry']], [/net/, ['nets']],
    [/lantern|lamppost|lamp|bellpost/, ['light']], [/shelf|bookpile|crate|barrel/, ['store']], [/sign|board|notice/, ['sign']],
  ];
  function stationsAt(m, x, y) {
    const out = new Set();
    if (!m || !m.props) return out;
    for (const p of m.props) {
      if (p.apron) continue;
      const pd = RB.props && RB.props.P[p.p];
      const w = p.w || (pd && pd.w) || 1, h = p.h || (pd && pd.h) || 1;
      const dx = Math.max(p.x - x, 0, x - (p.x + w - 1)), dy = Math.max(p.y - y, 0, y - (p.y + h - 1));
      if (dx > 1 || dy > 1) continue;
      for (const [re, kinds] of STATION) if (re.test(p.p)) kinds.forEach((k) => out.add(k));
    }
    return out;
  }
  // ---- deriving a class from a look and a station ------------------------------------------------------
  // A person without an authored profile is placed by what they do, not by how they look: the station
  // they stand at (a desk, a counter, a hearth, a bench, a light) and a tool in hand (a lamp, a book, a
  // tool belt). Glasses, age, dress, gender and skin tone never choose a personality (the world review,
  // WR-01); a child-sized figure stays a child (the cast's children are written as children).
  function classOf(look, st) {
    look = look || {};
    st = st || new Set();
    const acc = look.acc || [];
    if (look.custom || look.pet) return 'nonhuman';
    if (look.size === 'child') return 'child';
    if (acc.includes('lamp')) return 'keeper';
    if (st.has('desk')) return 'clerk';
    if (acc.includes('book')) return 'scholar';
    if (st.has('hearth') || st.has('tea') || st.has('surface')) return 'host';
    if (acc.includes('toolbelt') || st.has('bench') || st.has('nets') || st.has('laundry')) return 'craft';
    return 'town';
  }
  function merge(base, prof) {
    const out = Object.assign({}, base, prof);
    out.tells = Object.assign({}, base.tells || {}, (prof && prof.tells) || {});
    out.idle = (prof && prof.idle) || base.idle || [];
    out.route = (prof && prof.route) || base.route || [];
    out.talk = (prof && prof.talk) || base.talk || [];
    out.every = (prof && prof.every) || base.every || [12, 24];
    return out;
  }
  // the profile of a character id ('pc', a companion id, an npc or char id), resolved through its class
  function of(id, look, st) {
    const prof = P[id];
    if (prof) return merge(CLASSES[prof.class] || CLASSES.town, prof);
    const cls = classOf(look || (RB.content && RB.content.chars[id] && RB.content.chars[id].look), st);
    return merge(CLASSES[cls], { id, class: cls, tier: 'derived' });
  }
  // the profile of an actor on the map (its state-dependent variant applied)
  function forActor(a) {
    const W = RB.world && RB.world.W;
    const id = a === (W && W.player) ? 'pc' : (a.def && (a.def.char || a.def.id)) || a.id;
    const st = W && W.map ? stationsAt(W.map, a.home ? a.home[0] : a.x, a.home ? a.home[1] : a.y) : new Set();
    let prof = of(id, a.look, st);
    const s = RB.game && RB.game.s;
    // at their own workplace a person can have their own stance and work (maps: { mapId: overrides })
    if (prof.maps && W && W.map && prof.maps[W.map.id]) prof = Object.assign({}, prof, prof.maps[W.map.id]);
    // and their stance changes with the story (states: [{ if, … }], the last that holds wins)
    for (const v of prof.states || []) if (s && RB.state.test(s, v.if)) prof = Object.assign({}, prof, v);
    return { prof, stations: st };
  }
  return { add, of, forActor, classOf, stationsAt, CLASSES, BESPOKE, profiles: () => P };
})();
