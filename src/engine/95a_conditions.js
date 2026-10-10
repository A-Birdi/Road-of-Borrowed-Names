/* Conditions (expansion E4; docs/future/plan/03_ENCOUNTERS.md; docs/future/work/P04_ENCOUNTERS.md "Conditions").
 *
 * A condition is something you can see and name on a creature (or the place): burning, wet, frozen, airborne,
 * made of flame, made of paper, made of glass, rooted. "Misted" is the creature's Shroud, as it has always been:
 * light clears the target's, wind every creature's. What a response does to a condition comes from one table,
 * condition × response family, never from the species, so learning one creature teaches the world. Correct
 * Japanese with an unsuitable result (wind on a burning creature) is a tactical result, never a language mistake.
 *
 * Only encounters whose rules turn conditions on use any of this (st.rules.conditions); an ordinary battle of
 * the six-chapter game never does.
 *
 * Bounded: a fire spreads at most once per response, to one neighbour that was not itself a target, and a spread
 * never spreads again. Every timed condition has a start (a response, a move, the place), a length in exchanges,
 * what ends it early, and what it becomes (frozen thaws to wet; wet and burning simply end). Conditions belong to
 * the encounter: stepping back, losing or winning ends them all. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.conditions = (function () {
  'use strict';
  const L = () => RB.combatLogic;
  // lasts: exchanges (counted at each close); material: what the creature is made of (never ends)
  const DEFS = {
    burning: { jp: '{燃|も}えている', en: 'Burning', icon: 'flame', lasts: 3,
      what: 'It is on fire: its blows land 1 harder while it burns, for three exchanges.', ends: 'Water or earth puts it out. Wind fans it, and it spreads.' },
    flame: { jp: '{炎|ほのお}の{体|からだ}', en: 'Made of flame', icon: 'flame', material: true,
      what: 'Its body is fire. Water weakens it, so a knot comes loose more easily; earth buries it for a moment.', ends: 'Wind and flame feed it: its blows land harder.' },
    wet: { jp: '{濡|ぬ}れている', en: 'Wet', icon: 'drop', lasts: 3,
      what: 'Soaked through, for three exchanges. Ice freezes something wet solid.', ends: 'Wind or flame dries it.' },
    frozen: { jp: '{凍|こお}っている', en: 'Frozen', icon: 'snow', lasts: 1,
      what: 'Frozen solid: it cannot move this exchange. Then it thaws and is wet.', ends: 'A stone cracks it (a knot comes loose). Flame thaws it at once.' },
    airborne: { jp: '{宙|ちゅう}に{浮|う}いている', en: 'Airborne', icon: 'wind',
      what: 'It flies. A gust of wind blows it off course, so it misses its move.', ends: 'Rope pulls it down for good.' },
    paper: { jp: '{紙|かみ}でできている', en: 'Made of paper', icon: 'note', material: true,
      what: 'Made of paper: water makes it soggy, wind scatters it, rope bundles it, and flame catches.', ends: 'Fire frees a knot but burns: anything of paper nearby is in danger.' },
    glass: { jp: 'ガラスでできている', en: 'Made of glass', icon: 'mirror', material: true,
      what: 'Made of glass: a stone cracks it, and light splits in it and shows every creature\'s knots.', ends: '' },
    rooted: { jp: '{根|ね}を{張|は}っている', en: 'Rooted', icon: 'leaf', material: true,
      what: 'Rooted where it stands: no wind can move it.', ends: '' },
  };
  // the place (an encounter's `field`)
  const FIELD = {
    rain: { jp: '{雨|あめ}', en: 'Rain', what: 'Rain: every creature is wet, and nothing can catch fire.' },
    mist: { jp: '{霧|きり}', en: 'Mist', what: 'Mist: every creature starts hidden in it.' },
  };
  // A response's family: the word's own `family`, else its tags (flame before light: ほのお is fire first).
  const BY_TAG = [['fire', 'flame'], ['water', 'water'], ['wind', 'wind'], ['stone', 'stone'], ['anchor', 'stone'], ['bind', 'rope'], ['light', 'light']];
  function familyOf(card) {
    if (!card || card.kind !== 'word' || !card.word) return null;
    if (card.word.family) return card.word.family;
    const tags = card.word.tags || [];
    for (const [t, f] of BY_TAG) if (tags.indexOf(t) >= 0) return f;
    return null;
  }
  // which creatures a family's condition rules reach: spreading elements every creature, the rest the target
  const REACH = { water: 'all', ice: 'all', wind: 'all', stone: 'target', flame: 'target', light: 'target', rope: 'target' };
  // condition × family -> the effect, and what the preview says (`$` is the creature's name)
  const RULES = {
    burning: {
      water: { fx: 'out', en: 'puts out the fire on $' },
      stone: { fx: 'out', en: 'smothers the fire on $' },
      wind: { fx: 'flare', en: 'fans the fire on $: its blows land 1 harder, and the fire spreads' },
      ice: { fx: 'steam', en: 'meets the fire on $ in a burst of steam: every creature is hidden in it' },
      flame: { fx: 'none', en: '$ is already burning: no change' },
    },
    flame: {
      water: { fx: 'weaken', en: 'quenches part of $: your next Unravel on it frees one more knot' },
      wind: { fx: 'bold', en: 'feeds $: its blows land 1 harder this exchange' },
      flame: { fx: 'bold', en: 'feeds $: its blows land 1 harder this exchange' },
      stone: { fx: 'bury', en: 'buries $ for a moment: it misses its move' },
      ice: { fx: 'steam', en: 'melts against $ in a burst of steam: every creature is hidden in it' },
    },
    wet: {
      wind: { fx: 'dry', en: 'dries $' },
      flame: { fx: 'steam', en: 'boils the water on $ into steam: every creature is hidden in it' },
      ice: { fx: 'freeze', en: 'freezes $ solid: it misses its move' },
    },
    paper: {
      water: { fx: 'soggy', en: 'soaks $: its blows land 1 softer for the rest of the encounter' },
      wind: { fx: 'scatter', en: 'scatters $: it misses its move' },
      flame: { fx: 'catch', en: 'sets $ alight: a knot burns loose, but it burns, and paper nearby is in danger' },
      rope: { fx: 'bundle', en: 'bundles $ up: it cannot gather force' },
    },
    airborne: {
      wind: { fx: 'skip', en: 'blows $ off course: it misses its move' },
      rope: { fx: 'ground', en: 'pulls $ down: it cannot fly again' },
    },
    frozen: {
      stone: { fx: 'crack', en: 'cracks $: a knot comes loose' },
      flame: { fx: 'thaw', en: 'thaws $: it is wet again' },
    },
    glass: {
      stone: { fx: 'crack', en: 'cracks $: a knot comes loose' },
      light: { fx: 'refract', en: 'splits in $ into every colour: the mist on every creature clears' },
    },
    rooted: {
      wind: { fx: 'none', en: '$ is rooted: the wind cannot move it' },
    },
  };
  // the order conditions are looked at on one creature (a creature can be several things at once)
  const ORDER = ['frozen', 'burning', 'wet', 'flame', 'paper', 'glass', 'airborne', 'rooted'];

  const has = (f, c) => !!(f && f.cond && f.cond[c] != null && f.cond[c] !== 0);
  function set(st, f, c, n) {
    if (c === 'burning' && st.field && st.field.rain) return false; // nothing catches fire in the rain
    f.cond = f.cond || {};
    f.cond[c] = n != null ? n : DEFS[c].material ? -1 : DEFS[c].lasts || -1;
    return true;
  }
  const clear = (f, c) => { if (f.cond) delete f.cond[c]; };

  // ---- the encounter begins: what the creatures are, and the place -----------------------------------------------
  function begin(st, field) {
    st.field = {};
    for (const k of field || []) if (FIELD[k]) st.field[k] = true;
    for (const f of st.foes) {
      const own = (f.def && f.def.conditions) || [];
      for (const c of own) if (DEFS[c]) set(st, f, c, -1);
      if (st.field.rain) set(st, f, 'wet', -1);
      if (st.field.mist) f.shroud = true;
    }
  }

  // ---- a response meets the conditions --------------------------------------------------------------------------
  // reached: the creatures the response itself reaches (by its tags); answered: per creature, its move answered.
  function onResponse(st, card, reached, answered, fx) {
    const fam = familyOf(card);
    if (!fam) return;
    const up = L().standing(st);
    const targets = REACH[fam] === 'all' ? up.slice() : up.indexOf(st.cur) >= 0 ? [st.cur] : [];
    const nameOf = (i) => '$' + i;
    let steamed = false, spread = false;
    for (const i of targets) {
      const f = st.foes[i];
      for (const c of ORDER) {
        if (!has(f, c)) continue;
        const r = RULES[c] && RULES[c][fam];
        if (!r) continue;
        const e = { t: 'cond', cond: c, change: r.fx, foe: i, fam, en: r.en.replace(/\$/g, nameOf(i)) };
        switch (r.fx) {
          case 'none': e.none = true; break;
          case 'out': clear(f, 'burning'); break;
          case 'flare': {
            f.bold = (f.bold || 0) + 1;
            if (!spread) {
              // one neighbour on the stage that is not already burning and was not a target itself
              const near = [i - 1, i + 1].filter((j) => up.indexOf(j) >= 0 && targets.indexOf(j) < 0 && !has(st.foes[j], 'burning') && !has(st.foes[j], 'flame'));
              if (near.length && set(st, st.foes[near[0]], 'burning')) { e.spread = near[0]; spread = true; }
            }
            break;
          }
          case 'steam':
            if (!steamed) { for (const j of up) st.foes[j].shroud = true; steamed = true; } else e.again = true;
            break;
          case 'weaken': f.loose = 1; break;
          case 'bold': f.bold = (f.bold || 0) + 1; break;
          case 'bury': case 'scatter': case 'skip':
            if (!answered[i]) { answered[i] = true; f.stunned = 'cond'; }
            break;
          case 'freeze':
            clear(f, 'wet'); set(st, f, 'frozen');
            if (!answered[i]) { answered[i] = true; f.stunned = 'cond'; }
            break;
          case 'dry': clear(f, 'wet'); break;
          case 'soggy': f.soggy = true; break;
          case 'catch': {
            f.knots = Math.max(0, f.knots - 1);
            if (!set(st, f, 'burning')) e.rained = true;
            // anything made of paper the party is protecting is singed
            for (const a of st.actors || []) {
              if (a.side === 'object' && has(a, 'paper') && (a.hp || 0) > 0) { a.hp = Math.max(0, a.hp - 1); fx.push({ t: 'cond', change: 'scorch', aid: a.aid, en: 'The sparks catch ' + (a.name ? a.name.en : 'it') + ' (−1).' }); }
            }
            break;
          }
          case 'bundle':
            if (f.charged) f.charged = false;
            if (f.intent && f.intent.kind === 'charge' && !answered[i]) answered[i] = true;
            break;
          case 'ground':
            clear(f, 'airborne');
            break;
          case 'crack': f.knots = Math.max(0, f.knots - 1); break;
          case 'thaw': clear(f, 'frozen'); set(st, f, 'wet'); break;
          case 'refract': for (const j of up) st.foes[j].shroud = false; break;
          default: break;
        }
        fx.push(e);
      }
    }
  }
  // what a creature's conditions add to its blows this exchange
  function power(st, f) {
    let p = 0;
    if (has(f, 'burning') && !has(f, 'flame')) p += 1;
    p += f.bold || 0;
    if (f.soggy) p -= 1;
    return p;
  }
  // ---- the close of an exchange: what lasts a time counts down --------------------------------------------------
  function tick(st) {
    for (const f of st.foes) {
      f.bold = 0;
      if (!f.cond) continue;
      for (const c of Object.keys(f.cond)) {
        const n = f.cond[c];
        if (n < 0) continue;
        if (n - 1 > 0) { f.cond[c] = n - 1; continue; }
        delete f.cond[c];
        if (c === 'frozen') set(st, f, 'wet');
      }
      if (st.field && st.field.rain && !has(f, 'wet') && !has(f, 'frozen')) set(st, f, 'wet', -1);
    }
  }
  // the conditions on a creature, for its slip: [{ id, jp, en, icon, left }]
  function list(f) {
    const out = [];
    for (const c of ORDER) if (has(f, c)) out.push({ id: c, jp: DEFS[c].jp, en: DEFS[c].en, icon: DEFS[c].icon, left: f.cond[c] > 0 ? f.cond[c] : null });
    return out;
  }
  // the rule a family would apply to a condition (for help notes and the validator)
  const rule = (c, fam) => (RULES[c] && RULES[c][fam]) || null;

  return { DEFS, FIELD, RULES, REACH, ORDER, familyOf, begin, onResponse, power, tick, list, rule, has, set };
})();
