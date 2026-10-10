/* Inkweaving — combat logic (pure state transitions; UI is src/ui/80_combat.js).
 *
 * Each exchange: every creature telegraphs an intent (in Japanese at the
 * player's level). The player picks a response — an inscription word whose
 * ordinary meaning answers an intent (water cools, light reveals, protect
 * wards…), an Unravel that restores one of a creature's tangled words, or a
 * companion technique — then expresses it in Japanese (ONE language step per
 * round, whatever the number of creatures or adventurers). With a companion,
 * the response is then queued while the companion takes a support turn (a
 * menu, no language step); the player can go back to their own choice at no
 * cost. Then the exchange resolves: the response, the companion's action,
 * and each creature in turn. Nothing is timed and no creature acts while the
 * player reads, writes or chooses. Recognition uncertainty never costs
 * anything; a genuine mistake costs at most 1 resolve per exchange (none in
 * Assisted mode).
 *
 * Several creatures (a group): the state keeps one record per creature in
 * `st.foes` and the current target's index in `st.cur`. The per-creature
 * fields (knots, pattern, intent, heat, shroud, charged…) are also readable
 * and writable on `st` itself: they are accessors to `st.foes[st.cur]`, the
 * creature in focus. Every single-creature rule below works on the creature
 * in focus; `withFoe(st, i, fn)` focuses another for a moment. A battle with
 * one creature is a group of one, and plays exactly as before.
 *
 * Participants (expansion E1; docs/future/work/P04_ENCOUNTERS.md): `st.actors` is the one list of everyone in
 * the encounter, in stage order: the party (you, your companion), the creatures, and from the encounter platform
 * on, guests, neutrals and objects with agendas of their own. `st.foes` (the creatures, in the order they
 * joined), `st.pc` / `st.comp` (the party's resolve) and `st.ward` stay the views every rule below reads, so a
 * battle with only a party and creatures plays exactly as before. Actors join with `addActor`; nothing is ever
 * removed (a creature that settles, or a guest that leaves, stays in the list, marked). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.combatLogic = (function () {
  'use strict';

  // Default intents. `counters` lists word tags that cancel the intent.
  const INTENTS = {
    strike: { icon: '⚔', label: 'Strike', power: 2, counters: ['ward'], target: 'rand' },
    sweep: { icon: '〰', label: 'Sweep', power: 1, counters: ['ward'], target: 'both' },
    heat: { icon: '🔥', label: 'Heat', counters: ['water'], effect: 'heat' },
    shroud: { icon: '☁', label: 'Shroud', counters: ['light', 'wind'], effect: 'shroud' },
    charge: { icon: '⏳', label: 'Gathering', counters: ['bind'], effect: 'charge' },
    gust: { icon: '🌀', label: 'Gust', power: 1, counters: ['anchor'], effect: 'stripWard', target: 'both' },
    mend: { icon: '🧵', label: 'Re-tying', counters: ['bind', 'light'], effect: 'mend' },
    lie: { icon: '🎭', label: 'False promise', counters: ['truth'], effect: 'lie', power: 1, target: 'rand' },
    plea: { icon: '💬', label: 'Plea', counters: ['answer'], effect: 'plea' },
    rest: { icon: '…', label: 'Waiting', counters: [], effect: 'rest' },
    flood: { icon: '🌊', label: 'Flood', power: 2, counters: ['ward', 'stone', 'anchor'], target: 'both' },
    chill: { icon: '❄', label: 'Chill', counters: ['fire', 'warm'], effect: 'chill', power: 1, target: 'rand' },
    silence: { icon: '🔇', label: 'Hush', counters: ['voice', 'bell'], effect: 'silence' },
    mirror: { icon: '🪞', label: 'Mirror', counters: ['truth', 'light'], effect: 'mirror', power: 2, target: 'rand' },
    // the encounter platform's (E2): a creature calls another; a bell calls it off, a rope holds the way shut.
    // `ext`: never listed among what a word answers in an ordinary battle
    call: { icon: '📯', label: 'Calling', counters: ['bell', 'bind'], effect: 'call', ext: true },
  };
  // maxFoes: how many creatures a group placement may bring at this setting
  // (Relaxed: always one; Standard: up to two; Demanding: up to three).
  const DIFF = {
    relaxed: { powerMod: -1, resolve: 14, knotMod: 0, maxFoes: 1 },
    normal: { powerMod: 0, resolve: 12, knotMod: 0, maxFoes: 2 },
    hard: { powerMod: 1, resolve: 10, knotMod: 1, maxFoes: 3 },
  };
  // In a group each creature has fewer knots, so an encounter lasts about as
  // many exchanges as one creature would, while more moves come at you.
  // A creature's knots in a group of n: max(1, round(knots × share[n])).
  // A guardian (boss) keeps all of its knots; its attendants follow the rule.
  // Tuned with the difficulty curve (tests/unit/combat_curve.test.mjs).
  const GROUP = { share: { 2: 0.5, 3: 0.4, 4: 0.35, 5: 0.3 } };
  // Heat: every Heat intent left unanswered raises the level by one, up to
  // `max`; while it lasts, each blow it lands hits `per` harder per level.
  // A water word (or Mio's technique) cools it back to 0. Small and capped.
  const HEAT = { max: 2, per: 1 };
  function heatBonus(st) {
    return Math.min(st.heat || 0, HEAT.max) * HEAT.per;
  }
  // Base damage of a telegraphed blow (before difficulty, heat and wards).
  const BASE_POWER = { strike: 2, lie: 2, mirror: 2, chill: 2, sweep: 1, flood: 1, gust: 1 };
  function basePower(it) {
    return it.power || BASE_POWER[it.kind] || 0;
  }
  // What an unanswered intent of the creature in focus would do to each of
  // you: {per, who: ['pc'|'comp',…]} or null when it deals no damage. The UI's
  // help text uses this, so the numbers it shows are the ones enemyAct applies
  // (a companion's softening this round is included once it is chosen).
  function blowOf(st, it) {
    it = it || st.intent;
    if (!it || !BASE_POWER[it.kind]) return null;
    const who = it.kind === 'sweep' || it.kind === 'flood' ? (st.compId ? ['pc', 'comp'] : ['pc'])
      : it.kind === 'gust' ? ['pc'] : [aimOf(st, it)];
    const f = st.foes && st.foes[st.cur];
    return { per: Math.max(0, basePower(it) + st.diff.powerMod + heatBonus(st) + condPower(st, f) - ((f && f.soften) || 0)), who };
  }
  // what a creature's conditions add to its blows (E4; none unless the encounter has conditions)
  function condPower(st, f) {
    return f && st.rules && st.rules.conditions && RB.conditions ? RB.conditions.power(st, f) : 0;
  }
  // the one a single-target blow lands on (Suzu may have drawn its eye)
  function aimOf(st, it) {
    const f = st.foes && st.foes[st.cur];
    if (f && f.drawn && st.compId && st.comp > 0) return 'comp';
    // a blow aimed at a guest, a neutral or an object (E1, E6), while it is there to be hit
    if (it.target && it.target.indexOf(':') > 0) { const a = actorOf(st, it.target); if (a && !a.left && (a.hp || 0) > 0) return it.target; }
    return it.target === 'comp' && st.compId ? 'comp' : 'pc';
  }
  function actorOf(st, aid) {
    return (st.actors || []).find((a) => a.aid === aid) || null;
  }
  // Coordinated techniques: one per companion, decided by who travels with you.
  // `knots` is how many knots it frees on the target; every technique also
  // cancels the target's telegraphed move and empties Harmony. `group` says
  // what changes when there is more than one creature (single-creature
  // numbers never change).
  const TECHS = {
    nao: { name: 'Read the Opening', knots: 2, effect: 'Nao reads where it is about to move: frees 2 knots at once.', group: 'In a group it is aimed: all of it lands on the one you target.' },
    mio: { name: 'Clearwater Draught', knots: 1, effect: 'Restores you both to full resolve, washes away Heat, mist and Gathering, and frees 1 knot.', group: 'In a group the Heat, mist and Gathering on every creature are washed away.' },
    ren: { name: 'Lantern Ward', knots: 1, effect: 'Raises a 3-point ward in front of each of you and frees 1 knot.', group: 'In a group the wards stand against every creature\'s blows.' },
    suzu: { name: 'Curtain Call', knots: 2, effect: 'Its own move turns back on it: frees 2 knots at once.', group: 'In a group every creature\'s move turns back on it: none of them lands, and each of the others loses a knot too.' },
  };

  // ---- how far a response reaches -------------------------------------------------------------
  // Principle: a response aimed at something is aimed at ONE creature (the
  // target): Unravel, Answer, See through, light, rope. Spreading elements
  // reach every creature: wind carries through all the mist, water cools every
  // Heat. What protects the party stands against every creature's move of
  // that kind: stone against every Gust and Flood, warmth against every Chill,
  // a bell or a voice against every Hush. Heal acts on both of you, a ward on
  // the one you raise it before.
  // 'all': acts on every creature; 'target': on the target only; 'party': on
  // you both, and answers that kind of move from every creature; 'ally': on
  // the one it is raised before.
  const TAG_REACH = { water: 'all', wind: 'all', light: 'target', bind: 'target', anchor: 'party', stone: 'party', warm: 'party', fire: 'party', bell: 'party', voice: 'party', heal: 'party', ward: 'ally' };
  // The creatures a card acts on (indices; all standing ones or the target)
  // and the allies it acts on. For the screen (target labels, previews) and
  // the rules alike.
  function reachOf(st, card) {
    const up = standing(st);
    const T = st.cur;
    const out = { foes: [], allies: [], all: false };
    const both = st.compId ? ['pc', 'comp'] : ['pc'];
    if (!card) return out;
    if (card.kind === 'unravel' || card.kind === 'answer' || card.kind === 'truth') out.foes = [T];
    else if (card.kind === 'tech') {
      out.foes = card.tech === 'suzu' && up.length > 1 ? up : [T];
      if (card.tech === 'mio') { out.allies = both; if (up.length > 1) out.foes = up; }
      if (card.tech === 'ren') out.allies = both;
    } else if (card.kind === 'word') {
      const tags = card.word.tags || [];
      let foesAll = false, foesT = false;
      for (const tg of tags) {
        const r = TAG_REACH[tg];
        if (r === 'all') foesAll = true;
        else if (r === 'target') foesT = true;
        else if (r === 'party') out.allies = both;
        else if (r === 'ally') out.allies = [card.target === 'comp' && st.compId ? 'comp' : card.target && card.target.indexOf(':') > 0 ? card.target : 'pc'];
      }
      out.foes = foesAll ? up : foesT ? [T] : [];
      // what protects you both also answers that move from every creature
      out.party = tags.some((t) => TAG_REACH[t] === 'party' && t !== 'heal');
    }
    out.all = up.length > 1 && out.foes.length === up.length;
    if (card.mod && RB.modifiers) return RB.modifiers.reach(st, card, out);
    return out;
  }
  function standing(st) {
    const out = [];
    for (let i = 0; i < st.foes.length; i++) if (!st.foes[i].settled && st.foes[i].knots > 0) out.push(i);
    return out;
  }
  function isGroup(st) { return !!(st && st.foes && st.foes.length > 1); }

  // The intents a word cancels outright (a ward only cancels a single-target
  // Strike raised in front of its target; against Sweep/Flood it soaks damage).
  function answers(word, withExt) {
    const tags = (word && word.tags) || [];
    const out = [];
    for (const k in INTENTS) {
      if (INTENTS[k].ext && !withExt) continue;
      const c = INTENTS[k].counters;
      if (tags.some((t) => c.indexOf(t) >= 0 && (t !== 'ward' || INTENTS[k].target !== 'both'))) out.push(k);
    }
    return out;
  }

  // ---- the creatures of an encounter ---------------------------------------------------------------
  const FOE_KEYS = ['enemyId', 'knots', 'maxKnots', 'pattern', 'pi', 'phase', 'intent', 'nextIntents', 'heat', 'shroud', 'charged', 'phaseChanged'];
  // make st.<field> read and write the creature in focus (st.foes[st.cur])
  function focusable(st) {
    for (const k of FOE_KEYS) {
      Object.defineProperty(st, k, {
        get() { return this.foes[this.cur][k]; },
        set(v) { this.foes[this.cur][k] = v; },
        enumerable: true, configurable: true,
      });
    }
    return st;
  }
  function makeFoe(enemy, knots) {
    const f = {
      enemyId: enemy.id, knots, maxKnots: knots, pattern: (enemy.pattern || ['strike', 'rest']).slice(), pi: 0, phase: -1,
      intent: null, nextIntents: [], heat: 0, shroud: false, charged: false, phaseChanged: null,
      settled: false, boss: !!enemy.boss, side: 'foe', aid: null,
      // this round only (a companion's support): its blow weaker by n, its single blow drawn to the companion, its move cancelled
      soften: 0, drawn: false, stunned: null,
    };
    // the creature's own definition (patterns, phases, authored intents); not part of any copy
    Object.defineProperty(f, 'def', { value: enemy, writable: true, enumerable: false, configurable: true });
    return f;
  }
  function withFoe(st, i, fn) {
    const c = st.cur;
    st.cur = i;
    try { return fn(st.foes[i]); } finally { st.cur = c; }
  }
  // A copy of the state (for the screen's displayed state): its own creature
  // records, the same accessors. Enemy definitions are not copied.
  function copyActor(a) {
    const g = Object.assign({}, a);
    if (a.cond) g.cond = Object.assign({}, a.cond);
    if ('def' in a) Object.defineProperty(g, 'def', { value: a.def, writable: true, enumerable: false, configurable: true });
    return g;
  }
  function snapshot(x) {
    const o = {};
    for (const k in x) if (FOE_KEYS.indexOf(k) < 0 && k !== 'foes' && k !== 'actors') o[k] = x[k];
    o.ward = Object.assign({}, x.ward);
    if (x.actors) {
      // the copy keeps the same participants in the same order, each its own record; the creatures' view is
      // rebuilt from the copies, so a copied creature is the same object in both lists
      o.actors = x.actors.map((a) => (a.side === 'party' ? Object.assign({}, a) : copyActor(a)));
      const byFoe = new Map();
      x.actors.forEach((a, k) => { if (a.side === 'foe') byFoe.set(a, o.actors[k]); });
      o.foes = x.foes.map((f) => byFoe.get(f) || copyActor(f));
    } else o.foes = x.foes.map(copyActor);
    o.cur = x.cur;
    return focusable(o);
  }
  // ---- participants ----------------------------------------------------------------------------------------------
  // The party's records name who they are; their resolve and wards stay on the state (st.pc, st.comp, st.ward).
  function partyActors(compId) {
    const out = [{ aid: 'pc', side: 'party', role: 'player' }];
    if (compId) out.push({ aid: 'comp', side: 'party', role: 'companion', who: compId });
    return out;
  }
  // Another participant joins (a creature arriving, a guest, a neutral, an object). A creature joins the
  // creatures' view at the end, so every index the rules hold stays valid. Returns the actor.
  function addActor(st, a) {
    if (a.side === 'foe') {
      a.aid = a.aid || 'f' + st.foes.length;
      st.foes.push(a);
    } else a.aid = a.aid || (a.side || 'x') + ':' + st.actors.length;
    st.actors.push(a);
    return a;
  }
  // Everyone in the encounter, optionally only one side ('party' | 'foe' | 'guest' | 'neutral' | 'object').
  function actors(st, side) {
    const all = st.actors || partyActors(st.compId).concat(st.foes);
    return side ? all.filter((a) => a.side === side) : all.slice();
  }
  // Which creatures come to a placement at this difficulty: the lead, then its
  // group for the setting (a group authored for Demanding is used on Standard
  // too, cut to size). place.group: { normal: [ids], hard: [ids] }.
  function groupFor(lead, place, difficulty) {
    const d = DIFF[difficulty] || DIFF.normal;
    const g = (place && place.group) || null;
    let extra = [];
    if (g && d.maxFoes > 1) extra = (difficulty === 'hard' ? g.hard || g.normal : g.normal || g.hard) || [];
    return [lead].concat(extra).slice(0, d.maxFoes);
  }
  function knotsIn(enemy, n, d) {
    const k = Math.max(1, (enemy.knots || 2) + d.knotMod);
    if (n <= 1 || enemy.boss) return k;
    return Math.max(1, Math.round(k * (GROUP.share[n] || GROUP.share[3])));
  }

  // opts.group: the other creatures of the encounter (ids or enemy objects),
  // after the lead `enemy`; cut to the difficulty's maximum.
  function init(enemy, s, opts) {
    opts = opts || {};
    const d = DIFF[s.learn.difficulty] || DIFF.normal;
    const comp = s.comp || null;
    const C = RB.content || {};
    // an authored set piece may hold more creatures than the setting's usual group (E12; up to five), never on
    // Relaxed, which always meets one
    const cap = opts.maxFoes && d !== DIFF.relaxed ? Math.min(5, opts.maxFoes) : d.maxFoes;
    const others = (opts.group || []).map((g) => (typeof g === 'string' ? Object.assign({ id: g }, (C.enemies || {})[g] || {}) : g)).slice(0, Math.max(0, cap - 1));
    const members = [enemy].concat(others);
    const foes = members.map((m) => makeFoe(m, knotsIn(m, members.length, d)));
    // a group takes turns: each creature after the lead starts a step further into
    // its own pattern, so their blows do not all open together
    foes.forEach((f, i) => { if (i) f.pi = i % f.pattern.length; });
    // resolve in battle follows the setting (Relaxed 14, Standard 12, Demanding 10
    // with the campaign's usual 12); it is restored after every encounter
    const dr = (d.resolve || DIFF.normal.resolve) - DIFF.normal.resolve;
    const max = Math.max(4, s.resolve.max + dr);
    const st = {
      foes, cur: 0,
      pc: Math.max(0, Math.min(s.resolve.pc + dr, max)), comp: comp ? Math.max(0, Math.min(s.resolve.comp + dr, max)) : 0, max,
      ward: { pc: 0, comp: 0 }, harmony: 0, harmonyMax: 3,
      silenced: 0,
      compId: comp, misdirectUsed: false, openingBonus: false, compUses: {}, salts: false, share: false,
      round: 0, log: [], over: null, diff: d, mistakeCostThisRound: 0,
      assist: s.learn.assist === 'assist',
      // what this encounter allows beyond an ordinary battle (src/engine/97_encounter.js): none of it by default,
      // so a battle no encounter definition asks for plays exactly as it always has
      rules: Object.assign({}, opts.rules || {}),
    };
    foes.forEach((f, i) => { f.aid = 'f' + i; });
    st.actors = partyActors(comp).concat(foes);
    focusable(st);
    if (comp === 'ren') st.ward.pc = 1, st.ward.comp = 1;
    // Equipped charm effects (small, well-defined sidegrades).
    const charm = s.equip && s.equip.charm && C.items && C.items[s.equip.charm];
    const eff = (charm && charm.effect) || {};
    if (eff.startWard) { st.ward.pc += eff.startWard; if (comp) st.ward.comp += eff.startWard; }
    if (eff.harmonyStart) st.harmony = Math.min(st.harmonyMax, eff.harmonyStart);
    if (eff.resolve) { st.pc += eff.resolve; st.comp += comp ? eff.resolve : 0; st.max += eff.resolve; }
    for (let i = 0; i < foes.length; i++) withFoe(st, i, (f) => { st.intent = drawIntent(f.def, st); });
    st.cur = defaultTarget(st);
    return st;
  }

  function intentDef(enemy, key) {
    const base = INTENTS[key.split(':')[0]] || INTENTS.strike;
    const o = (enemy.intents && enemy.intents[key]) || {};
    return Object.assign({ key, kind: key.split(':')[0] }, base, o);
  }
  function drawIntent(enemy, st) {
    // phase changes
    if (enemy.phases) {
      for (let i = enemy.phases.length - 1; i >= 0; i--) {
        const ph = enemy.phases[i];
        if (st.knots <= ph.at && st.phase < i) {
          st.phase = i;
          st.pattern = ph.pattern.slice();
          st.pi = 0;
          st.phaseChanged = ph;
          break;
        }
      }
    }
    const key = st.pattern[st.pi % st.pattern.length];
    st.pi++;
    const it = intentDef(enemy, key);
    // resolve random targets now so the telegraph can name them (a creature's
    // place in the group varies its choice; the lone or lead creature's is as always)
    if (it.target === 'rand') it.target = st.compId && (st.round * 7 + st.pi * 3 + st.knots + (st.cur || 0) * 5) % 2 ? 'comp' : 'pc';
    if (!st.compId && it.target === 'comp') it.target = 'pc';
    if (st.charged && (it.kind === 'strike' || it.kind === 'sweep')) it.power = (it.power || 2) + 2;
    // a two-move turn (E26; Standard and Demanding, encounters that allow it): both are telegraphed now
    const me = st.foes && st.foes[st.cur];
    if (me) {
      me.intent2 = null;
      if (it.and && st.rules && st.rules.doubles && st.diff !== DIFF.relaxed) {
        const it2 = intentDef(enemy, it.and);
        if (it2.target === 'rand') it2.target = st.compId && (st.round * 5 + st.pi * 7 + st.knots + (st.cur || 0) * 3) % 2 ? 'comp' : 'pc';
        if (!st.compId && it2.target === 'comp') it2.target = 'pc';
        me.intent2 = it2;
      }
    }
    st.nextIntents = [];
    for (let k = 0; k < 2; k++) st.nextIntents.push(intentDef(enemy, st.pattern[(st.pi + k) % st.pattern.length]));
    return it;
  }

  // ---- targets -----------------------------------------------------------------------------------------
  // How much a creature's telegraph threatens right now (damage it would deal,
  // plus what its lasting effects would cost). Used for the default target.
  function threatOf(st, i, knownTags) {
    return withFoe(st, i, (f) => {
      if (f.settled || f.knots <= 0) return -1;
      const it = f.intent;
      if (!it) return 0;
      const b = blowOf(st, it);
      let v = b ? b.per * b.who.length : 0;
      if (it.kind === 'charge') v += 2;
      if (it.kind === 'heat') v += 1.5;
      if (it.kind === 'mend' && f.knots < f.maxKnots) v += 1.5;
      if ((it.kind === 'shroud' || it.kind === 'silence') && (!knownTags || knownTags.has(it.kind === 'shroud' ? 'light' : 'bell') || knownTags.has(it.kind === 'shroud' ? 'wind' : 'voice'))) v += 1;
      if (it.kind === 'gust') v += (st.ward.pc + st.ward.comp) * 0.5;
      return v;
    });
  }
  // The most threatening standing creature (ties: the leftmost).
  function defaultTarget(st, knownTags) {
    let best = -1, bi = 0;
    for (const i of standing(st)) { const v = threatOf(st, i, knownTags); if (v > best + 1e-9) { best = v; bi = i; } }
    return standing(st).length ? bi : 0;
  }
  // Choose whom the next response (or companion action) acts on. Returns false
  // when that creature cannot be targeted (settled or out of range).
  function target(st, i) {
    if (!Number.isInteger(i) || i < 0 || i >= st.foes.length || st.foes[i].settled || st.foes[i].knots <= 0) return false;
    st.cur = i;
    return true;
  }

  // Available response cards (for the current target). words: array of word defs (with id, tags).
  function responses(st, words) {
    const out = [];
    const it = st.intent;
    out.push({ id: 'unravel', kind: 'unravel', icon: '🪢', jp: 'ほどく', en: 'Unravel', desc: 'Restore one of its tangled words — frees a knot.', disabled: st.shroud ? 'Shrouded: you can\'t see the knots. A light or wind word clears it.' : null });
    if (it && it.kind === 'plea') out.push({ id: 'answer', kind: 'answer', icon: '💬', jp: 'こたえる', en: 'Answer', desc: 'Reply to what it is really asking.' });
    if (it && (it.kind === 'lie' || it.kind === 'mirror')) out.push({ id: 'truth', kind: 'truth', icon: '🔍', jp: 'みぬく', en: 'See through', desc: 'Point out what is false in what it said.' });
    // Wait and watch (E9): an action, never idleness. It answers nothing and costs the exchange; in a battle it
    // shows every creature's next two moves; an encounter can author more (a neutral acts, a quarrel runs on).
    if (st.rules && st.rules.wait) out.push({ id: 'wait', kind: 'wait', icon: '…', jp: '{待|ま}つ', en: 'Wait and watch', desc: st.rules.waitDesc || 'Answer nothing this time and watch closely: you see each creature\'s next two moves.' });
    for (const w of words) {
      if (w.tags.indexOf('ward') >= 0) {
        out.push({ id: 'w:' + w.id + ':pc', kind: 'word', word: w, target: 'pc', icon: w.icon || '🛡', jp: w.jp, en: w.en, desc: w.effect + ' (you)' });
        if (st.compId) out.push({ id: 'w:' + w.id + ':comp', kind: 'word', word: w, target: 'comp', icon: w.icon || '🛡', jp: w.jp, en: w.en, desc: w.effect + ' (' + ((RB.content.chars[st.compId] && RB.content.chars[st.compId].name.en) || 'companion') + ')' });
        // a ward can also stand before something the encounter asks you to protect (E6)
        for (const a of st.actors || []) if (a.protectable && !a.left && (a.hp == null || a.hp > 0)) out.push({ id: 'w:' + w.id + ':' + a.aid, kind: 'word', word: w, target: a.aid, icon: w.icon || '🛡', jp: w.jp, en: w.en, desc: w.effect + ' (' + (a.name ? a.name.en : a.aid) + ')' });
      } else {
        out.push({ id: 'w:' + w.id, kind: 'word', word: w, icon: w.icon || '✦', jp: w.jp, en: w.en, desc: w.effect });
      }
    }
    if (st.harmony >= st.harmonyMax && st.compId) {
      const T = TECHS[st.compId];
      // a coordinated technique needs you both: like the companion's own turn (supportActions), it waits while
      // they are out of resolve (Harmony is kept, not spent)
      const nm = (RB.content.chars[st.compId] && RB.content.chars[st.compId].name.en) || 'Your companion';
      out.push({ id: 'tech', kind: 'tech', icon: '✧', jp: 'あわせ', en: T ? T.name : 'Coordinated technique', tech: st.compId,
        desc: (T ? T.effect + ' ' : '') + 'Also cancels its move. Uses up Harmony.' + (T && isGroup(st) && standing(st).length > 1 ? ' ' + T.group : ''),
        disabled: st.comp > 0 ? null : nm + ' is out of resolve. A coordinated technique needs you both; your Harmony is kept.' });
    }
    return out;
  }

  // Apply the player's resolved action to the current target (and, for a
  // response that reaches further, to every creature it reaches).
  // result: {ok, firstTry, mistakes}. Returns {fx, countered (the target's
  // move), answered (per creature: its move is answered), perfect}.
  function playerAct(st, card, result, enemy) {
    const T = st.cur;
    const it = st.intent;
    const fx = [];
    const answered = st.foes.map(() => false);
    const tagged = (o, i) => Object.assign(o, { foe: i == null ? T : i });
    st.mistakeCostThisRound = 0;
    if (result.mistakes > 0 && !st.assist) {
      // small, capped consequence: one point of resolve, once per exchange
      st.mistakeCostThisRound = 1;
      st.pc = Math.max(0, st.pc - 1);
      fx.push({ t: 'cost', en: 'A slip of the brush costs a little resolve (−1).' });
    }
    const perfect = result.ok && result.firstTry !== false;
    const reach = reachOf(st, card);
    if (card.mod && RB.modifiers) {
      // a modifier extends the response's reach (E27): its own rule, one of the authored pairings
      RB.modifiers.act(st, card, answered, fx);
    } else if (card.kind === 'unravel' || card.kind === 'tech') {
      let n = 1;
      if (st.openingBonus && card.kind === 'unravel') { n = 2; st.openingBonus = false; fx.push({ t: 'comp', who: 'nao', en: 'Nao saw the opening — two knots come loose.', foe: T }); }
      if (card.kind === 'tech') n = techUnravel(st);
      // a condition can loosen a creature's knots (water on a creature of flame: E4)
      const fT = st.foes[T];
      if (fT && fT.loose && card.kind === 'unravel') { n += fT.loose; fT.loose = 0; }
      st.knots = Math.max(0, st.knots - n);
      fx.push(tagged({ t: 'unravel', n }));
      if (card.kind === 'tech') { applyTech(st, fx, answered); answered[T] = true; st.harmony = 0; }
      if (it.kind === 'rest') answered[T] = true;
    } else if (card.kind === 'wait') {
      st.watching = st.round + 1;
      fx.push({ t: 'wait', en: st.rules && st.rules.waitSays ? st.rules.waitSays : 'You hold back and watch how they move.' });
    } else if (card.kind === 'answer') {
      if (it.kind === 'plea') { answered[T] = true; st.knots = Math.max(0, st.knots - 1); fx.push(tagged({ t: 'settle', en: 'It listens. One knot loosens on its own.' })); }
    } else if (card.kind === 'truth') {
      if (it.kind === 'lie' || it.kind === 'mirror') { answered[T] = true; fx.push(tagged({ t: 'reveal', en: 'The false promise falls apart.' })); if (it.kind === 'mirror') st.knots = Math.max(0, st.knots - 1); }
    } else if (card.kind === 'word') {
      const tags = card.word.tags;
      if (tags.indexOf('ward') >= 0) {
        // A ward raised in front of the one a Strike aims at blocks that blow
        // (the target's, else the first creature whose Strike aims there);
        // otherwise it lingers (2 points) for later blows.
        const order = [T].concat(standing(st).filter((i) => i !== T));
        const blocker = order.find((i) => withFoe(st, i, (f) => f.intent && f.intent.counters.indexOf('ward') >= 0 && f.intent.target === card.target && f.intent.kind !== 'charge' && !answered[i]));
        if (blocker != null) { answered[blocker] = true; fx.push({ t: 'ward', target: card.target, block: true, foe: blocker }); }
        else { st.ward[card.target] += 2; fx.push({ t: 'ward', target: card.target, n: 2 }); }
      }
      if (tags.indexOf('heal') >= 0) {
        const was = { pc: st.pc, comp: st.comp };
        st.pc = Math.min(st.max, st.pc + 3); if (st.compId) st.comp = Math.min(st.max, st.comp + 3);
        // who it reaches and what each actually recovered (for truthful feedback; battle addendum RBN-04)
        const aim = st.compId ? ['pc', 'comp'] : ['pc'];
        const d = { pc: st.pc - was.pc, comp: st.compId ? st.comp - was.comp : 0 };
        fx.push({ t: 'heal', n: 3, aim, who: aim.filter((w) => d[w] > 0), d, gain: d.pc + d.comp });
      }
      // what it does to each creature it reaches, one creature at a time (in order across the stage)
      const reached = reach.foes.slice().sort((a, b) => a - b);
      const reachTag = (tg, i) => (TAG_REACH[tg] === 'all' ? reached.indexOf(i) >= 0 : TAG_REACH[tg] === 'target' ? i === T : false);
      for (const i of reached) {
        withFoe(st, i, (f) => {
          const has = (tg) => tags.indexOf(tg) >= 0 && reachTag(tg, i);
          if (has('water')) { if (f.heat) fx.push({ t: 'water', foe: i }); f.heat = 0; }
          if (has('light') || has('wind')) { if (f.shroud) fx.push({ t: 'light', foe: i, by: has('wind') ? 'wind' : 'light' }); f.shroud = false; }
          if (has('bind')) { if (f.charged) fx.push({ t: 'bind', foe: i }); f.charged = false; }
        });
      }
      // conditions (E4): what this response does to what each creature (and the place) is, by the rule table
      if (st.rules && st.rules.conditions && RB.conditions) RB.conditions.onResponse(st, card, reached, answered, fx);
      if (tags.indexOf('warm') >= 0 || tags.indexOf('fire') >= 0) fx.push({ t: 'warm' });
      if (tags.indexOf('bell') >= 0 || tags.indexOf('voice') >= 0) { st.silenced = 0; if (st.hushed) st.hushed = {}; fx.push({ t: 'bell' }); }
      // which telegraphed moves it answers: those of the creatures it reaches (party-wide
      // protection reaches every creature's move of that kind)
      for (const i of standing(st)) {
        const f = st.foes[i];
        for (const tg of tags) {
          if (tg === 'ward' || !f.intent || f.intent.counters.indexOf(tg) < 0) continue;
          const r = TAG_REACH[tg];
          if (r === 'all' || r === 'party' || ((r === 'target' || !r) && i === T)) answered[i] = true;
        }
      }
    }
    // the second move of a two-move turn (E26): answered by the same rules, on its own
    const answered2 = st.foes.map(() => false);
    if (st.rules && st.rules.doubles && !card.mod) {
      const tags = card.kind === 'word' ? card.word.tags : [];
      for (const i of standing(st)) {
        const f = st.foes[i], it2 = f.intent2;
        if (!it2) continue;
        if (card.kind === 'tech' && i === T) { answered2[i] = true; continue; }
        if (card.kind === 'truth' && i === T && (it2.kind === 'lie' || it2.kind === 'mirror')) { answered2[i] = true; continue; }
        if (card.kind === 'answer' && i === T && it2.kind === 'plea') { answered2[i] = true; continue; }
        for (const tg of tags) {
          if (it2.counters.indexOf(tg) < 0) continue;
          if (tg === 'ward') { if (it2.target === card.target && it2.target !== 'both' && !fx.some((e) => e.t === 'ward' && e.block)) { answered2[i] = true; fx.push({ t: 'ward', target: card.target, block: true, foe: i, second: true }); } continue; }
          const r = TAG_REACH[tg];
          if (r === 'all' || r === 'party' || ((r === 'target' || !r) && i === T)) answered2[i] = true;
        }
      }
    }
    st.answered2 = answered2;
    const countered = answered[T];
    const any = answered.some(Boolean) || answered2.some(Boolean);
    // harmony builds on clean, meaningful play (a technique spends it: it
    // starts again from 0, so the technique itself adds nothing)
    if (perfect && card.kind !== 'tech' && (any || card.kind === 'unravel')) st.harmony = Math.min(st.harmonyMax, st.harmony + 1);
    st.lastCountered = countered;
    st.lastPlayer = { perfect, ok: !!result.ok, answered: any, kind: card.kind, target: T };
    return { fx, countered, answered, answered2, perfect };
  }
  // E5 (expansion plan; Robin's C-64): what a response would do right now, by the same rule that will run, on a copy
  // of the state (nothing changes, no randomness is drawn). The card's "Here:" line is built from this, so the
  // preview cannot disagree with the result: { fx, answered, healed } as playerAct would return them on a first-try
  // answer.
  function previewAct(st, card) {
    const x = snapshot(st);
    const r = playerAct(x, card, { ok: true, firstTry: true, mistakes: 0 });
    return { fx: r.fx, answered: r.answered, countered: r.countered };
  }
  function techUnravel(st) {
    return (TECHS[st.compId] && TECHS[st.compId].knots) || 1;
  }
  function applyTech(st, fx, answered) {
    const c = st.compId, T = st.cur;
    const others = standing(st).filter((i) => i !== T);
    if (c === 'nao') fx.push({ t: 'tech', who: 'nao', en: 'Read the Opening: you strike where it was about to move.', foe: T });
    if (c === 'mio') {
      st.pc = st.max; st.comp = st.max;
      for (const i of [T].concat(others)) withFoe(st, i, (f) => { f.heat = 0; f.shroud = false; f.charged = false; });
      fx.push({ t: 'tech', who: 'mio', en: 'Clearwater Draught: both of you steady, every lingering effect washed away.', foe: T, all: others.length > 0 });
    }
    if (c === 'ren') { st.ward.pc += 3; st.ward.comp += 3; fx.push({ t: 'tech', who: 'ren', en: 'Lantern Ward: light stands between you and the next blows.', foe: T }); }
    if (c === 'suzu') {
      fx.push({ t: 'tech', who: 'suzu', en: others.length ? 'Curtain Call: every move turns back on the one who made it.' : 'Curtain Call: its own intent turns back on it.', foe: T, all: others.length > 0 });
      // in a group: every creature's move turns back on it, and each of the others loses a knot
      for (const i of others) {
        answered[i] = true;
        withFoe(st, i, (f) => { f.knots = Math.max(0, f.knots - 1); });
        fx.push({ t: 'unravel', n: 1, foe: i, by: 'suzu' });
      }
    }
  }

  // ---- the companion's turn -----------------------------------------------------------------------------
  // A companion is not an inkweaver: a small, identity-based support action
  // each round (content: RB.content.companionActions), chosen from a menu once
  // your response is queued. Unlocked by story beats and quests (`unlock`, a
  // condition for RB.state.test); some can be used once per encounter.
  function compDefs(compId) {
    const C = RB.content || {};
    return ((C.companionActions || {})[compId] || []).slice();
  }
  // The actions on offer this round: [{ def, used (once per encounter and
  // spent), locked }]. With the technique queued the companion is busy with it.
  function compOptions(st, s, queued) {
    if (!st.compId || st.comp <= 0) return [];
    if (queued && queued.kind === 'tech') return [{ def: { id: 'join', name: { en: 'Join the technique', jp: 'あわせる' }, aim: 'none', desc: 'Your companion is part of the technique you queued.' }, used: false, locked: false }];
    const out = [];
    for (const d of compDefs(st.compId)) {
      const locked = !!(d.unlock && s && RB.state && !RB.state.test(s, d.unlock));
      out.push({ def: d, locked, used: !!(d.uses && (st.compUses[d.id] || 0) >= d.uses) });
    }
    return out;
  }
  // What a companion action would act on, for the screen: {foes, allies}
  function compReach(st, def) {
    const up = standing(st);
    const both = st.compId ? ['pc', 'comp'] : ['pc'];
    const aim = def && def.aim;
    if (aim === 'foe') return { foes: [st.cur], allies: [] };
    if (aim === 'foes') return { foes: up, allies: [], all: up.length > 1 };
    if (aim === 'allies') return { foes: [], allies: both };
    if (aim === 'aimed') {
      // the one the target's blow is aimed at (you, when it aims at no one)
      const it = st.intent;
      const who = it && BASE_POWER[it.kind] ? (it.kind === 'sweep' || it.kind === 'flood' || it.kind === 'gust' ? 'pc' : aimOf(st, it)) : 'pc';
      return { foes: [st.cur], allies: [who] };
    }
    if (aim === 'lower') return { foes: [], allies: [st.compId && st.comp < st.pc ? 'comp' : 'pc'] };
    if (aim === 'pc') return { foes: [], allies: ['pc'] };
    return { foes: [], allies: [] };
  }
  // Resolve the companion's action (after your response, before the creatures).
  // P: what your response did (playerAct's result). Returns {fx}.
  function compAct(st, actionId, P) {
    const fx = [];
    if (!st.compId || st.comp <= 0 || !actionId) return { fx };
    const who = st.compId;
    if (actionId === 'join') return { fx };
    const def = compDefs(who).find((d) => d.id === actionId);
    if (!def) return { fx };
    if (def.uses) {
      if ((st.compUses[def.id] || 0) >= def.uses) return { fx };
      st.compUses[def.id] = (st.compUses[def.id] || 0) + 1;
    }
    const e = def.effect || {};
    const T = st.cur;
    const lp = st.lastPlayer || { perfect: false, ok: false, answered: false };
    const answered = (P && P.answered) || st.foes.map(() => false);
    const R = compReach(st, def);
    const say = (en, extra) => fx.push(Object.assign({ t: 'cact', who, id: def.id, en }, extra || {}));
    const n = e.n || 1;
    switch (e.kind) {
      case 'opening':
        if (lp.perfect && lp.answered) { st.openingBonus = true; say('Nao has seen the opening: your next Unravel frees two knots.', { foe: T }); }
        else say('Nao watches for an opening — not this time.', { foe: T, none: true });
        break;
      case 'knot':
        if (lp.perfect && st.knots > 0) { st.knots = Math.max(0, st.knots - n); say('Nao lends a hand — another knot comes loose.', { foe: T }); fx.push({ t: 'unravel', n, foe: T, by: who }); }
        else say('Nao reaches in, but the knot holds.', { foe: T, none: true });
        break;
      case 'soften':
        for (const i of R.foes) withFoe(st, i, (f) => { f.soften = (f.soften || 0) + n; });
        say(def.say || 'Its next blow will land ' + n + ' softer.', { foe: R.foes.length === 1 ? R.foes[0] : null, foes: R.foes.slice(), n });
        for (const i of R.foes) fx.push({ t: 'soften', foe: i, n });
        break;
      case 'heckle':
        withFoe(st, T, (f) => {
          f.soften = (f.soften || 0) + n;
          if (f.intent && f.intent.kind === 'lie' && lp.ok && !answered[T]) { answered[T] = true; f.stunned = 'laugh'; }
        });
        say(st.foes[T].stunned === 'laugh' ? 'Suzu laughs at the promise until it sounds as hollow as it is.' : 'Suzu heckles it off its stroke: its blow lands ' + n + ' softer.', { foe: T, n });
        fx.push({ t: 'soften', foe: T, n });
        break;
      case 'draw':
        st.foes[T].drawn = true;
        say('Suzu steps into the light and waves: its blow will come at her, not you.', { foe: T });
        fx.push({ t: 'draw', foe: T });
        break;
      case 'drawAll':
        // every creature's blow aimed at you this round comes at the companion
        for (const i of R.foes) st.foes[i].drawn = true;
        say(def.say || 'Every eye is drawn away from you.', { foes: R.foes.slice() });
        for (const i of R.foes) fx.push({ t: 'draw', foe: i });
        break;
      case 'share':
        // this round every blow that lands on you is shared (see foeAct)
        st.share = true;
        say(def.say || 'Whatever comes for you this round, they take half.', { allies: ['pc', 'comp'] });
        break;
      case 'stun':
        for (const i of R.foes) { if (!answered[i]) { answered[i] = true; st.foes[i].stunned = who; } }
        say(def.say || 'Its move will come to nothing.', { foe: R.foes.length === 1 ? R.foes[0] : null, foes: R.foes.slice() });
        for (const i of R.foes) fx.push({ t: 'stun', foe: i });
        break;
      case 'ward':
        for (const a of R.allies) { st.ward[a] += n; fx.push({ t: 'ward', target: a, n, by: who }); }
        say(def.say || 'A ward rises.', { allies: R.allies.slice(), n });
        break;
      case 'heal': {
        const was = { pc: st.pc, comp: st.comp };
        for (const a of R.allies) {
          if (a === 'pc' && st.pc > 0) st.pc = Math.min(st.max, st.pc + n);
          if (a === 'comp' && st.comp > 0) st.comp = Math.min(st.max, st.comp + n);
        }
        const d = { pc: st.pc - was.pc, comp: st.comp - was.comp };
        // the authored line names an amount; it is said only when that is what happened
        // (otherwise the display words the actual result: RB.ui.combat, battle addendum RBN-04)
        const full = R.allies.every((a) => d[a] === n);
        say(full ? def.say || 'You breathe easier.' : null, { allies: R.allies.slice(), n, d, heal: true });
        fx.push({ t: 'heal', n, aim: R.allies.slice(), who: R.allies.filter((a) => d[a] > 0), by: who, d, gain: d.pc + d.comp });
        break;
      }
      case 'clear':
        for (const i of R.foes) withFoe(st, i, (f) => {
          const states = e.states || ['heat', 'shroud', 'charge'];
          if (states.indexOf('heat') >= 0 && f.heat) { f.heat = 0; fx.push({ t: 'water', foe: i, by: who }); }
          if (states.indexOf('shroud') >= 0 && f.shroud) { f.shroud = false; fx.push({ t: 'light', foe: i, by: who }); }
          if (states.indexOf('charge') >= 0 && f.charged) { f.charged = false; fx.push({ t: 'bind', foe: i, by: who }); }
          // and the move it is about to make, when it is one of those
          if (e.moves && f.intent && e.moves.indexOf(f.intent.kind) >= 0 && !answered[i]) { answered[i] = true; f.stunned = who; fx.push({ t: 'stun', foe: i }); }
        });
        // (Ren's raised lamps also break the Hush over you)
        if (e.hush && st.silenced) { st.silenced = 0; fx.push({ t: 'bell', by: who }); }
        say(def.say || 'The air clears.', { foe: R.foes.length === 1 ? R.foes[0] : null, foes: R.foes.slice() });
        break;
      case 'harmony':
        if (lp.perfect && st.harmony < st.harmonyMax) { st.harmony = Math.min(st.harmonyMax, st.harmony + n); say(def.say || 'In step: Harmony rises.', {}); fx.push({ t: 'harmony', n: st.harmony, max: st.harmonyMax, by: who }); }
        else say('Not quite in step this time.', { none: true });
        break;
      case 'salts':
        st.salts = true;
        say(def.say || 'Whatever lands this round, neither of you will fall.');
        break;
      default:
        say(def.say || '');
    }
    return { fx, answered };
  }

  // ---- the creatures act -------------------------------------------------------------------------------
  // One creature's telegraphed move (the creature in focus), unless answered.
  function foeAct(st, countered) {
    const it = st.intent;
    const fx = [];
    const f = st.foes[st.cur];
    const soft = (f && f.soften) || 0;
    const dmg = (who, p) => {
      if (who === 'comp' && !st.compId) who = 'pc';
      let power = Math.max(0, p + st.diff.powerMod + heatBonus(st) + condPower(st, f) - soft);
      if (who !== 'pc' && who !== 'comp') { land(who, power); return; }
      // a modifier's lasting ward meets the blow first (E27)
      if (st.mods && RB.modifiers) { power = RB.modifiers.onBlow(st, who, power, it, fx); if (power <= 0) return; }
      if (st.compId === 'suzu' && !st.misdirectUsed && power > 0 && ((who === 'pc' ? st.pc : st.comp) - power <= 2)) {
        st.misdirectUsed = true;
        fx.push({ t: 'comp', who: 'suzu', en: 'Suzu steps into the blow with a flourish — it meets empty air.', missAt: who });
        return;
      }
      // Nao's "take half": a blow that would land on you is shared, the larger half theirs
      if (who === 'pc' && st.share && st.compId && st.comp > 0 && power > 1) {
        const half = Math.ceil(power / 2);
        fx.push({ t: 'comp', who: st.compId, en: 'Nao takes half of it.', share: half });
        land('comp', half);
        land('pc', power - half);
        return;
      }
      land(who, power);
    };
    const land = (who, power) => {
      const w = st.ward[who] || 0;
      const absorbed = Math.min(w, power);
      st.ward[who] = w - absorbed;
      power -= absorbed;
      if (absorbed) fx.push({ t: 'block', who, n: absorbed });
      if (power > 0 && who !== 'pc' && who !== 'comp') {
        // a guest, a neutral or an object takes the blow on its own resolve
        const a = actorOf(st, who);
        if (a) { a.hp = Math.max(0, (a.hp || 0) - power); fx.push({ t: 'hit', who, n: power }); }
        return;
      }
      if (power > 0) {
        const cur = who === 'pc' ? st.pc : st.comp;
        // Mio's smelling salts: this round no blow takes either of you below 1
        const floor = st.salts && cur > 0 ? 1 : 0;
        const next = Math.max(floor, cur - power);
        if (who === 'pc') st.pc = next; else st.comp = next;
        fx.push({ t: 'hit', who, n: power, held: floor && cur - power < 1 ? true : undefined });
      }
    };
    // what a lasting modifier turns away before it happens (the everlasting wind, a soaked creature)
    const stopped = !countered && st.mods && RB.modifiers ? RB.modifiers.stops(st, it) : null;
    if (stopped) { fx.push({ t: 'countered', kind: it.kind, by: 'mod:' + stopped }); return fx; }
    if (!countered) {
      switch (it.kind) {
        case 'strike': case 'lie': case 'mirror': case 'chill':
          dmg(aimOf(st, it), basePower(it)); break;
        case 'sweep': case 'flood':
          dmg('pc', basePower(it)); if (st.compId) dmg('comp', basePower(it)); break;
        case 'gust':
          if (st.mods && RB.modifiers) RB.modifiers.broken(st, it, fx);
          st.ward.pc = 0; st.ward.comp = 0; fx.push({ t: 'stripWard' }); dmg('pc', basePower(it)); break;
        case 'heat': st.heat = Math.min(HEAT.max, st.heat + 1); fx.push({ t: 'heat', n: st.heat, bonus: heatBonus(st) }); break;
        case 'shroud': st.shroud = true; fx.push({ t: 'shroud' }); break;
        case 'charge': st.charged = true; fx.push({ t: 'charge' }); break;
        case 'mend': if (st.knots < st.maxKnots) { st.knots++; fx.push({ t: 'mend' }); } break;
        case 'silence':
          // a Hush on one family of responses, or on the modifiers, for a few exchanges (E26); never on a bell or
          // a voice, which always end it
          if (it.family && it.family !== 'bell' && it.family !== 'voice') { st.hushed = Object.assign({}, st.hushed); st.hushed[it.family] = (it.rounds || 2) + 1; fx.push({ t: 'silence', family: it.family, rounds: it.rounds || 2 }); }
          else { st.silenced = 1; fx.push({ t: 'silence' }); }
          break;
        case 'call': st.calls = (st.calls || []).concat([{ by: st.cur, enemy: it.calls || null }]); fx.push({ t: 'call', en: it.say || 'It calls out: something is coming.' }); break;
        case 'plea': fx.push({ t: 'plea' }); break;
        default: break;
      }
    } else {
      fx.push({ t: 'countered', kind: it.kind, by: f && f.stunned ? f.stunned : undefined, headedOff: it.then ? true : undefined });
      if (it.kind === 'charge') st.charged = false;
      // a plan over two exchanges (E26): answering the first step heads off the second
      if (it.then && f) { f.pi++; f.headedOff = it.then; }
    }
    if (it.kind === 'strike' || it.kind === 'sweep') st.charged = false;
    return fx;
  }
  // Every standing creature acts in turn (left to right as they stand).
  // countered: per creature (an array, e.g. playerAct's `answered`), or one
  // flag for the creature in focus (a lone creature: as always). `act`
  // (optional) resolves one creature's move; by default the current
  // RB.combatLogic.foeAct (which the Atlas may extend during its battles).
  function enemyAct(st, countered, act) {
    const fx = [];
    const arr = Array.isArray(countered) ? countered : null;
    const one = act || ((x, c) => RB.combatLogic.foeAct(x, c));
    const up = standing(st);
    const said = (i) => (arr ? !!arr[i] : i === st.cur ? !!countered : false);
    // group coordination (E26): answering the creature that gives the signal breaks every move cued on it
    const cuedOff = {};
    if (st.rules && st.rules.doubles) {
      for (const i of up) {
        const it = st.foes[i].intent;
        if (!it || !it.signal || !said(i)) continue;
        for (const j of up) { const jt = st.foes[j].intent; if (j !== i && jt && jt.cue) { cuedOff[j] = true; st.foes[j].stunned = st.foes[j].stunned || 'signal'; } }
      }
    }
    for (const i of up) {
      const c = said(i) || !!cuedOff[i];
      const mine = withFoe(st, i, () => one(st, c));
      for (const f of mine) { if (f.foe == null) f.foe = i; fx.push(f); }
      // the second move of a two-move turn, after the first
      const f = st.foes[i];
      if (f.intent2 && st.rules && st.rules.doubles && f.knots > 0) {
        const c2 = !!(st.answered2 && st.answered2[i]) || !!f.stunned;
        const first = f.intent;
        f.intent = f.intent2;
        let m2;
        try { m2 = withFoe(st, i, () => one(st, c2)); } finally { f.intent = first; }
        for (const e of m2) { if (e.foe == null) e.foe = i; e.second = true; fx.push(e); }
      }
    }
    return fx;
  }
  function allSettled(st) { return st.foes.every((f) => f.knots <= 0); }

  function endRound(st, enemy) {
    st.round++;
    st.salts = false;
    st.share = false;
    // a creature whose knots are all free settles and stops acting
    st.justSettled = [];
    for (let i = 0; i < st.foes.length; i++) {
      const f = st.foes[i];
      if (f.knots <= 0 && !f.settled) { f.settled = true; st.justSettled.push(i); }
      f.soften = 0; f.drawn = false; f.stunned = null;
    }
    if (st.rules && st.rules.conditions && RB.conditions) RB.conditions.tick(st);
    if (st.mods && RB.modifiers) RB.modifiers.tick(st);
    // (a Hush of n exchanges is set at n + 1 by the move, so the player meets it for n whole exchanges)
    if (st.hushed) for (const k of Object.keys(st.hushed)) { if (--st.hushed[k] <= 0) delete st.hushed[k]; }
    st.answered2 = null;
    if (allSettled(st)) { st.over = 'win'; return; }
    const partyDown = st.pc <= 0 && (!st.compId || st.comp <= 0);
    if (partyDown || st.pc <= 0) {
      // If the player falls but the companion stands, the companion helps them up once.
      if (st.pc <= 0 && st.compId && st.comp > 0 && !st.revived) {
        st.revived = true;
        st.pc = Math.ceil(st.max / 3);
        st.log.push({ t: 'revive' });
      } else { st.over = 'lose'; return; }
    }
    for (const i of standing(st)) {
      withFoe(st, i, (f) => {
        f.phaseChanged = null;
        st.intent = drawIntent(st.foes.length > 1 ? f.def : (enemy || f.def), st);
      });
    }
    // the target is kept while it stands; otherwise the most threatening one
    if (st.foes[st.cur].settled) st.cur = defaultTarget(st);
  }
  // ---- the order of an exchange (C-70) ------------------------------------------------------------------------------
  // Each standing creature's place in this exchange's order (1, 2, 3… as they act: left to right as they stand) and
  // whom its move is aimed at ('pc', 'comp', 'both', or null for a move that hits no one), from the telegraph.
  function order(st) {
    const out = [];
    let n = 0;
    for (const i of standing(st)) {
      const f = st.foes[i];
      const it = f.intent;
      const b = it ? withFoe(st, i, () => blowOf(st, it)) : null;
      const e = { i, n: ++n, aim: b ? (b.who.length > 1 ? 'both' : b.who[0]) : null };
      if (f.intent2) { const b2 = withFoe(st, i, () => blowOf(st, f.intent2)); e.aim2 = b2 ? (b2.who.length > 1 ? 'both' : b2.who[0]) : null; }
      out.push(e);
    }
    return out;
  }

  return {
    INTENTS, DIFF, HEAT, TECHS, GROUP, TAG_REACH, init, order, condPower, responses, playerAct, compAct, foeAct, enemyAct, endRound, intentDef, heatBonus, basePower, blowOf, answers,
    reachOf, previewAct, compReach, compOptions, compDefs, standing, isGroup, withFoe, target, defaultTarget, threatOf, snapshot, groupFor, knotsIn, aimOf, allSettled, FOE_KEYS,
    makeFoe, addActor, actors, partyActors, actorOf, drawIntent,
  };
})();
