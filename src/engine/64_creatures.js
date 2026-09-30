/* Creatures Met (addendum §20.2): an observation notebook of the creatures
 * the player has actually encountered, kept in the campaign (s.creatures).
 *
 * A creature is registered when an encounter with it begins (never when its
 * definition loads). The record keeps the species apart from its placements:
 *   s.creatures[enemyId] = {
 *     t, name: {en, jp},                      first met; its name then
 *     maps: { placeKey: { t, set: 'indoor'|'outdoor'|null, name, near,
 *                         intro?: {jp, en, who}, settle?: {jp, en}, with? } },
 *     notes: { key: { t, m, line? } },         observations, once each
 *     settled: { t, m } | undefined            a settled observation (a win)
 *   }
 * placeKey is the map id (every Unwritten Atlas room is 'atlas'). Places are
 * bounded (MAX_PLACES); notes are bounded by what the rules can produce
 * (a move kind × what answered it), so repeated encounters add nothing new.
 *
 * Notes, only after they genuinely happen on screen:
 *   i:<kind>            its move was telegraphed (Strike, Heat, …)
 *   s:<effect>          a move took effect (heat, shroud, charge, silence, stripWard, mend)
 *   a:<kind>:<how>      its move was answered (how: a word id, unravel, answer, truth,
 *                       tech:<comp>, comp:<comp>)
 *   c:<state>:<how>     a state of its was cleared (heat, shroud, charge)
 *   w:<kind>            a standing ward soaked some of its blow
 *   p:<n>               it changed its ways (a phase that has begun), with the line shown
 * There are no counts: no wins, no defeats, nothing to farm, nothing to
 * capture, and nothing here changes a battle. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.creatures = (function () {
  'use strict';
  const MAX_PLACES = 24;
  const tierOf = (x) => {
    if (!x) return null;
    if (x.jp != null || x.en != null) return x;
    const t = RB.activities && RB.activities.tier ? RB.activities.tier(x) : null;
    return t && (t.jp != null || t.en != null) ? t : x.F || x.E || x.I || x.A || null;
  };
  const line = (x, who) => { const t = tierOf(x); return t && (t.jp || t.en) ? Object.assign({ jp: t.jp || '', en: t.en || '' }, who ? { who } : {}) : null; };
  const book = (s) => (s.creatures && typeof s.creatures === 'object' && !Array.isArray(s.creatures) ? s.creatures : (s.creatures = {}));
  const placeKey = (mapId) => (!mapId ? null : /^atlas\./.test(mapId) ? 'atlas' : mapId);
  function nearOf(mapId) {
    if (!mapId || /^atlas\./.test(mapId) || !RB.questGuide || !RB.questGuide.placeOf) return null;
    let p = null;
    try { p = RB.questGuide.placeOf(mapId); } catch (e) { p = null; }
    const P = p && RB.content.places[p];
    return P && P.name ? { en: P.name.en, jp: P.name.jp || '' } : null;
  }
  function rec(s, id, when) {
    const d = RB.content.enemies[id];
    const B = book(s);
    if (!B[id]) {
      if (!d) return null;
      B[id] = { t: when || Date.now(), name: { en: d.name ? d.name.en : id, jp: d.name ? d.name.jp || '' : '' }, maps: {}, notes: {} };
    }
    const c = B[id];
    if (!c.maps || typeof c.maps !== 'object') c.maps = {};
    if (!c.notes || typeof c.notes !== 'object') c.notes = {};
    return c;
  }
  function note(c, key, m, extra) {
    if (!c || c.notes[key]) return false;
    c.notes[key] = Object.assign({ t: Date.now(), m: m || null }, extra || {});
    return true;
  }
  const curPlace = (s) => { const W = RB.world && RB.world.W; return placeKey((W && W.map && W.map.id) || s.map); };

  // An encounter begins: ids are its creatures (the lead first), opts the
  // battle's options ({ where, place } as RB.game.startBattle passes them).
  // The lead's opening line is kept as the first sighting at that place when
  // the encounter shows it (not in automated test battles, which show nothing).
  function meet(s, ids, opts) {
    if (!s || !ids || !ids.length) return [];
    opts = opts || {};
    const W = RB.world && RB.world.W;
    const mapId = (opts.where && opts.where.map) || (W && W.map && W.map.id) || s.map || null;
    const live = W && W.map && W.map.id === mapId ? W.map : null;
    const set = live && RB.render && RB.render.enclosed ? (RB.render.enclosed(live) ? 'indoor' : 'outdoor') : null;
    const pk = placeKey(mapId);
    const shown = !(RB.test && RB.test.auto);
    const now = Date.now();
    const out = [];
    ids.forEach((id, i) => {
      const c = rec(s, id, now);
      if (!c) return;
      out.push(id);
      if (!pk) return;
      let p = c.maps[pk];
      if (!p) {
        if (Object.keys(c.maps).length >= MAX_PLACES) return;
        p = c.maps[pk] = { t: now, set, name: RB.bookmarks.placeName(mapId), near: nearOf(mapId) };
      } else if (!p.set && set) p.set = set;
      if (i > 0 && !p.with) p.with = ids[0];
      if (i === 0 && shown && !p.intro) {
        const d = RB.content.enemies[id];
        const pl = opts.place || {};
        const l = line(pl.intro != null ? pl.intro : d.intro, pl.introWho || d.introWho || 'narr');
        if (l) p.intro = l;
      }
    });
    return out;
  }

  // What the screen has just shown. Without `ex`: the telegraphs now on
  // screen (and a new phase just announced). With ex = { fx, card, answered,
  // comp }: the results of your response and your companion's action; with
  // ex = { fx, enemy: true }: the creatures' moves as they landed.
  // members: the encounter's creatures by the rules' index.
  function saw(s, st, members, ex) {
    if (!s || !st || !st.foes) return;
    const pk = curPlace(s);
    const idOf = (i) => (members && members[i] && members[i].id) || (st.foes[i] && st.foes[i].enemyId);
    const recOf = (i) => { const id = idOf(i); return id && book(s)[id] ? book(s)[id] : null; };
    const kindOf = (i) => { const f = st.foes[i]; return f && f.intent ? f.intent.kind : null; };
    if (!ex) {
      st.foes.forEach((f, i) => {
        if (f.settled || f.knots <= 0) return;
        const c = recOf(i);
        if (!c) return;
        if (f.intent) note(c, 'i:' + f.intent.kind, pk);
        if (f.phase >= 0) {
          const d = (members && members[i]) || f.def || RB.content.enemies[idOf(i)] || {};
          const ph = (d.phases || [])[f.phase];
          note(c, 'p:' + f.phase, pk, ph && ph.line ? { line: line(ph.line, ph.who || 'narr') } : null);
        }
      });
      return;
    }
    const compId = st.compId || null;
    const card = ex.card || null;
    const howCard = () => {
      if (!card) return null;
      if (card.kind === 'word') return card.word && card.word.id ? card.word.id : 'word';
      if (card.kind === 'tech') return 'tech:' + (card.tech || compId || '');
      return card.kind; // unravel | answer | truth
    };
    const byComp = (by) => by && RB.content.chars[by] ? 'comp:' + by : null;
    for (const f of ex.fx || []) {
      const i = f.foe != null ? f.foe : st.cur;
      const c = recOf(i);
      if (!c) continue;
      if (ex.enemy) {
        if (f.t === 'heat' || f.t === 'shroud' || f.t === 'charge' || f.t === 'silence' || f.t === 'stripWard' || f.t === 'mend') note(c, 's:' + f.t, pk);
        if (f.t === 'block' && kindOf(i)) note(c, 'w:' + kindOf(i), pk);
        continue;
      }
      const how = byComp(f.by) || (f.by === 'wind' || f.by === 'light' || !f.by ? howCard() : null);
      if (!how) continue;
      if (f.t === 'water') note(c, 'c:heat:' + how, pk);
      if (f.t === 'light') note(c, 'c:shroud:' + how, pk);
      if (f.t === 'bind') note(c, 'c:charge:' + how, pk);
    }
    if (!ex.enemy && ex.answered) {
      ex.answered.forEach((yes, i) => {
        const k = kindOf(i);
        if (!yes || !k || k === 'rest') return;
        const c = recOf(i);
        if (!c) return;
        const f = st.foes[i];
        const how = f && f.stunned && compId ? 'comp:' + compId : howCard();
        if (how) note(c, 'a:' + k + ':' + how, pk);
      });
    }
  }

  // A win: every creature of the encounter settled. The lines the screen showed
  // as they settled are kept with the place (the lead's settle line was said;
  // the others' were written in the exchange log).
  function settle(s, members, lead) {
    if (!s || !members) return;
    const pk = curPlace(s);
    const shown = !(RB.test && RB.test.auto);
    members.forEach((m, i) => {
      const c = m && book(s)[m.id];
      if (!c) return;
      if (!c.settled) c.settled = { t: Date.now(), m: pk };
      const p = pk && c.maps[pk];
      if (shown && p && !p.settle) {
        const src = i === 0 && lead ? lead.settle : m.settle;
        const l = line(src, i === 0 && lead ? lead.settleWho || 'narr' : 'narr');
        if (l) p.settle = l;
      }
    });
  }

  // ---- reading the notebook -----------------------------------------------------------------------
  // The notes grouped by the move they concern, in the order first seen.
  const EFFECT_MOVE = { heat: 'heat', shroud: 'shroud', charge: 'charge', silence: 'silence', stripWard: 'gust', mend: 'mend' };
  function moves(c) {
    const by = {};
    const add = (kind, key, n) => { (by[kind] = by[kind] || { kind, t: Infinity, notes: [] }); by[kind].notes.push(Object.assign({ key }, n)); by[kind].t = Math.min(by[kind].t, n.t || 0); };
    for (const key in (c && c.notes) || {}) {
      const n = c.notes[key], p = key.split(':');
      if (p[0] === 'i') add(p[1], key, n);
      else if (p[0] === 's') add(EFFECT_MOVE[p[1]] || p[1], key, n);
      else if (p[0] === 'a' || p[0] === 'w') add(p[1], key, n);
      else if (p[0] === 'c') add(p[1] === 'charge' ? 'charge' : p[1], key, n);
    }
    const out = Object.values(by).sort((a, b) => a.t - b.t);
    // (a move is listed once it was telegraphed; results without a telegraph are kept under it too)
    for (const m of out) m.notes.sort((a, b) => (a.key[0] === 'i' ? -1 : b.key[0] === 'i' ? 1 : a.t - b.t));
    return out;
  }
  function phases(c) {
    const out = [];
    for (const key in (c && c.notes) || {}) if (key.startsWith('p:')) out.push(Object.assign({ n: +key.slice(2) }, c.notes[key]));
    return out.sort((a, b) => a.n - b.n);
  }
  function met(s) {
    const B = (s && s.creatures) || {};
    return Object.keys(B).filter((id) => B[id] && typeof B[id] === 'object').sort((a, b) => (B[a].t || 0) - (B[b].t || 0));
  }

  // ---- load-time normalisation (registered from src/content/words) ----------------------------------
  // Keeps every record (an unknown id from a content change stays, and the page
  // shows its stored name); only repairs the shape.
  function migrate(st) {
    if (!st.creatures || typeof st.creatures !== 'object' || Array.isArray(st.creatures)) return;
    for (const id in st.creatures) {
      const c = st.creatures[id];
      if (!c || typeof c !== 'object') continue;
      if (!c.maps || typeof c.maps !== 'object') c.maps = {};
      if (!c.notes || typeof c.notes !== 'object') c.notes = {};
    }
  }

  // the battle calls these (src/ui/80_combat.js): a notebook fault must never disturb a battle
  const guard = (f, name) => function () { try { return f.apply(null, arguments); } catch (err) { console.error('creatures.' + name, err); return null; } };
  return { meet: guard(meet, 'meet'), saw: guard(saw, 'saw'), settle: guard(settle, 'settle'), moves, phases, met, migrate, placeKey, MAX_PLACES, _tierOf: tierOf };
})();
