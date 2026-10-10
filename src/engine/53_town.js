/* The living world (expansion P05; docs/future/plan/06_WORLD.md W1–W3, W5, W6; docs/future/work/P05_WORLD.md).
 *
 * Towns change, residents keep routines, people can be asked after, roads hold events, and old places hold promises
 * that later words keep. Everything here is driven by content that only the new chapters carry (RB.content.towns,
 * roadEvents, sealed): a six-chapter campaign meets none of it.
 *
 *   towns[id] = { name, maps: [ids], residents: { <person>: { slots: n, pin: cond } }, care: [flags],
 *                 beats: [{ id, when, en, jp }] }
 *     Change beats (W1): bundles of map edits, people and talk that content adds with conditions on the beat's own
 *     `when` (never rewriting a scene). A beat stays until seen; later beats add, never replace. The Journey names a
 *     town that changed since you were last there, never what changed.
 *     Routine slots (W2): a resident has 1..n places (ordinary placements, exclusive conditions `slot.<person>=k`).
 *     A town's routine ticks when you come back after three or more transitions elsewhere, when a flag it cares
 *     about has been set since your last visit, or after you rest at an inn; never while you are on its maps, never
 *     during a conversation (a tick happens only as a transition begins), and never on loading a save. Each tick
 *     draws each resident's next slot from the campaign's own stream; a resident whose `pin` holds keeps their place.
 *   relations[person] = { knows: { <other>: 'routine' | 'loose' }, friendly: bool }
 *     "Have you seen…?" (W3): a current sighting (the other is on this map or a neighbouring one now), a usual
 *     routine (someone who knows them), an uncertain recollection (a loose acquaintance), or a refusal / not knowing.
 *     Answers become notes, never live markers. Where you last saw someone is kept with the save.
 *   roadEvents[road] = { maps: [ids], unique: { id, scene }, variants: [{ id, scene }], rate, stamp }
 *     Road events (W5): the unique event the first time you come; leaving defers it (it is offered again on the next
 *     visit, recorded as unfinished); once solved, variants on a seeded chance; a stamp for solving them all.
 *   sealed[id] = { map, x, y, needs: <concept id> | cond, hint: { jp, en }, opens: <flag>, scene }
 *     Return keys (W6): visible from the start with an in-world hint; noticed when examined; opened once the word
 *     or mechanic it needs is known. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.town = (function () {
  'use strict';
  const C = () => RB.content;
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  // the campaign's world record (older saves gain it empty on load: the base fill in RB.save.migrate)
  function rec(s) {
    if (!isObj(s.world)) s.world = {};
    const w = s.world;
    for (const k of ['towns', 'beats', 'lastSeen', 'notes', 'roads', 'sealed']) if (!isObj(w[k])) w[k] = {};
    if (typeof w.moves !== 'number') w.moves = 0;
    if (typeof w.rests !== 'number') w.rests = 0;
    return w;
  }
  const towns = () => C().towns || {};
  function townOf(mapId) {
    for (const id in towns()) if ((towns()[id].maps || []).indexOf(mapId) >= 0) return id;
    return null;
  }

  // ---- routines (W2) -------------------------------------------------------------------------------------------
  function townRec(s, id) {
    const R = rec(s);
    if (!isObj(R.towns[id])) R.towns[id] = { tick: 0, slots: {}, leftAt: null, flags: {}, rests: R.rests };
    return R.towns[id];
  }
  function slotOf(s, person) {
    for (const id in towns()) {
      const T = towns()[id];
      if (T.residents && T.residents[person]) { const t = townRec(s, id); return t.slots[person] || 1; }
    }
    return 1;
  }
  // The town's routine moves on: each resident's next slot, drawn from the campaign's stream (never re-rolled by a
  // load: the draw happens here, once, and is saved)
  function tick(s, id, why) {
    const T = towns()[id];
    if (!T) return null;
    const t = townRec(s, id);
    t.tick++;
    for (const p of Object.keys(T.residents || {}).sort()) {
      const r = T.residents[p];
      if (r.pin && RB.state.test(s, r.pin)) continue; // pinned while their quest step needs them
      const n = Math.max(1, r.slots || 1);
      if (n === 1) { t.slots[p] = 1; continue; }
      const d = RB.streams ? RB.streams.next(s, 'routine:' + id) : Math.random();
      let k = 1 + Math.floor(d * n);
      // a new place each time where there is one (a routine, not a reshuffle into the same spot)
      if (k === (t.slots[p] || 1)) k = (k % n) + 1;
      t.slots[p] = k;
    }
    t.why = why || null;
    return t;
  }
  // Before a transition enters mapId: count it, and tick the town it belongs to if one is due.
  function beforeEnter(s, mapId) {
    if (!s) return null;
    const R = rec(s);
    R.moves++;
    const id = townOf(mapId);
    const from = s.map ? townOf(s.map) : null;
    // leaving a town: remember when, and what it cares about as it was
    if (from && from !== id) {
      const t = townRec(s, from);
      t.leftAt = R.moves;
      t.flags = {};
      for (const f of towns()[from].care || []) t.flags[f] = !!s.flags[f];
      t.rests = R.rests;
    }
    if (!id || id === from) return null; // within the town (or nowhere): never a tick while you are here
    const T = towns()[id];
    const t = townRec(s, id);
    let why = null;
    if (t.leftAt != null && R.moves - t.leftAt >= 3) why = 'away';
    if (!why && (T.care || []).some((f) => !!s.flags[f] && !t.flags[f])) why = 'story';
    if (!why && t.leftAt != null && R.rests > t.rests) why = 'rest';
    if (why) tick(s, id, why);
    return why;
  }
  function rested(s) { rec(s).rests++; }

  // ---- change beats (W1) ---------------------------------------------------------------------------------------
  function beats(s, id) {
    const T = towns()[id];
    return T ? (T.beats || []).filter((b) => RB.state.test(s, b.when)) : [];
  }
  // A town whose active beats you have not yet been back to see: [{ town, name }] for the Journey's one-line hints
  function changed(s) {
    const R = rec(s);
    const out = [];
    for (const id in towns()) {
      const seen = R.beats[id] || {};
      if (beats(s, id).some((b) => !seen[b.id])) out.push({ town: id, name: towns()[id].name });
    }
    return out;
  }
  function visited(s, mapId) {
    const id = townOf(mapId);
    if (!id) return;
    const R = rec(s);
    const seen = R.beats[id] || (R.beats[id] = {});
    for (const b of beats(s, id)) seen[b.id] = true;
  }

  // ---- "Have you seen…?" (W3) -----------------------------------------------------------------------------------
  // Where a person is now: the maps whose placements of them hold (RB.world.mapsWith).
  function whereNow(person) {
    try { return RB.world && RB.world.mapsWith ? RB.world.mapsWith(person) : []; } catch (e) { return []; }
  }
  // the maps one step from mapId (exits and doors open now)
  function neighbours(mapId) {
    try { if (RB.world && RB.world.linksOf) return RB.world.linksOf(mapId).map((l) => l.to); } catch (e) { /* the map's own list below */ }
    const m = C().maps[mapId];
    return m ? (m.exits || []).map((e) => e.to).filter(Boolean) : [];
  }
  const placeOf = (m) => { const d = C().maps[m]; return d && d.name ? { en: d.name.en, jp: d.name.jp || null } : { en: String(m), jp: null }; };
  function nameOf(person) {
    const ch = (C().chars || {})[person];
    return ch && ch.name ? { en: ch.name.en, jp: ch.name.jp || null } : { en: person, jp: null };
  }
  // the people anyone can be asked after: town residents and everyone the relations table names
  function findable() {
    const out = new Set();
    for (const id in towns()) for (const p in towns()[id].residents || {}) out.add(p);
    for (const a in C().relations || {}) { out.add(a); for (const b in (C().relations[a].knows || {})) out.add(b); }
    return [...out].filter((p) => (C().chars || {})[p]);
  }
  // The people this asker can be asked about, as the player knows them: someone you have seen (where you last saw
  // them is kept with the save), or someone a quest of yours is looking for (`seek` on its stage). Never the asker
  // or your companion; those a quest seeks first, then the most recently seen.
  function askable(s, asker) {
    const R = rec(s);
    const seek = new Set();
    for (const id in s.quests || {}) {
      const q = s.quests[id], d = (C().quests || {})[id];
      if (!q || q.done || !d || !d.stages) continue;
      const st = d.stages[q.stage];
      for (const p of [].concat((st && st.seek) || [])) seek.add(p);
    }
    return findable().filter((p) => p !== asker && p !== s.comp && (R.lastSeen[p] || seek.has(p)))
      .sort((a, b) => (seek.has(b) - seek.has(a)) || ((R.lastSeen[b] || {}).t || 0) - ((R.lastSeen[a] || {}).t || 0) || (a < b ? -1 : 1));
  }
  // asker asked after target, on mapId: { kind, map?, line: { jp, en }, note? }. Four kinds, kept apart (W3):
  //   sighting   the target is on this map or one beside it now, and the asker knows them
  //   routine    the asker knows the target well: their usual places (authored, or the routine's slots), not where
  //              they are this minute
  //   uncertain  a loose acquaintance: a recollection, said to be unsure
  //   refusal / unknown   an unfriendly asker, or a stranger to the target: no omniscience
  function whereabouts(s, asker, target, mapId) {
    const rels = C().relations || {};
    const rel = rels[asker] || {};
    const who = nameOf(target);
    if (rel.friendly === false) return { kind: 'refusal', target, line: rel.refusal || LINES.refusal() };
    const knows = (rel.knows || {})[target];
    if (!knows) return { kind: 'unknown', target, line: LINES.unknown() };
    const here = whereNow(target);
    const near = [mapId].concat(neighbours(mapId));
    const seenAt = here.find((m) => near.indexOf(m) >= 0);
    if (seenAt) return { kind: 'sighting', target, map: seenAt, line: LINES.sighting(placeOf(seenAt), seenAt === mapId), note: { target, map: seenAt, kind: 'sighting' } };
    if (knows === 'routine') {
      const u = (rels[target] || {}).usual;
      const places = usualPlaces(target);
      const line = u || LINES.routine(who, places);
      return { kind: 'routine', target, line, note: { target, kind: 'routine', line, maps: places.map((p) => p.map) } };
    }
    const guess = here[0] || null;
    return { kind: 'uncertain', target, map: guess, line: LINES.uncertain(who, guess ? placeOf(guess) : null), note: { target, map: guess, kind: 'uncertain' } };
  }
  // a resident's usual places: the maps their routine slots are on, in slot order ([{ map, en, jp }])
  function usualPlaces(person) {
    const out = [];
    for (const id in C().maps) for (const n of C().maps[id].npcs || []) {
      if ((n.char || n.id) !== person || !n.if || !/(^|[&|\s])slot\./.test(n.if)) continue;
      if (!out.some((p) => p.map === id)) out.push(Object.assign({ map: id }, placeOf(id)));
    }
    return out;
  }
  // The answers' words. Japanese is spaced into words with furigana on every kanji, like all the game's Japanese.
  const jpOf = (p) => p.jp || p.en;
  const LINES = {
    sighting: (p, here) => here
      ? { jp: 'さっき 、 この {辺|へん} で {見|み}かけました よ 。', en: 'I saw them around here just now.' }
      : { jp: 'さっき 、 ' + jpOf(p) + ' の {方|ほう} で {見|み}かけました よ 。', en: 'I saw them just now, over by ' + p.en + '.' },
    routine: (who, places) => {
      if (!places.length) return { jp: 'いつも の {場所|ばしょ} に いる と {思|おも}います よ 。', en: 'I\'d think ' + who.en + '\'s in the usual place.' };
      const jp = places.slice(0, 3).map(jpOf).join(' か ');
      const en = places.slice(0, 3).map((p) => p.en).join(places.length > 2 ? ', or ' : ' or ');
      return { jp: 'たいてい 、 ' + jp + ' に います よ 。', en: 'Usually at ' + en + '.' };
    },
    uncertain: (who, p) => p
      ? { jp: 'たしか 、 ' + jpOf(p) + ' の {話|はなし} を して いた ような … 。 よく {分|わ}かりません けど 。', en: 'I think ' + who.en + ' mentioned ' + p.en + '… but I wouldn\'t swear to it.' }
      : { jp: 'どこ か {遠|とお}く へ {行|い}く と {言|い}って いた ような … 。 よく {分|わ}かりません けど 。', en: 'I think ' + who.en + ' said something about going further on… but I wouldn\'t swear to it.' },
    refusal: () => ({ jp: 'さあ ね 。 {人|ひと} の こと は {話|はな}さない よ 。', en: 'Couldn\'t say. I don\'t talk about other people.' }),
    unknown: () => ({ jp: 'その {人|ひと} は {知|し}りません 。 ごめんなさい 。', en: 'I don\'t know them, sorry.' }),
  };
  // what an answer leaves in Known details: a note, never a live marker (and never updated by itself afterwards)
  function note(s, asker, ans) {
    if (!ans || !ans.note) return null;
    const R = rec(s);
    const k = ans.note.target;
    R.notes[k] = Object.assign({ from: asker, t: Date.now() }, ans.note);
    return R.notes[k];
  }
  // where you last saw someone (kept with the save; the world's own record is per session)
  function seen(s, person, mapId) { rec(s).lastSeen[person] = { map: mapId, t: Date.now() }; }

  // ---- road events (W5) ------------------------------------------------------------------------------------------
  function roadOf(mapId) {
    const R = C().roadEvents || {};
    for (const id in R) if ((R[id].maps || []).indexOf(mapId) >= 0) return id;
    return null;
  }
  // Entering a road's map: the scene to run now, if any. The unique event until it is solved (offered again each
  // visit after leaving it); afterwards a variant on the road's chance, drawn from the campaign's stream.
  function roadEventAt(s, mapId) {
    const id = roadOf(mapId);
    if (!id) return null;
    const D = C().roadEvents[id];
    const R = rec(s);
    const r = R.roads[id] || (R.roads[id] = { unique: null, solved: {}, offered: 0 });
    // An event is offered once per visit. The game asks again after every scene on the map (90_game.js afterScene
    // runs the enter events), so a second ask on the same transition is no new visit; nor is walking on to the
    // road's next map.
    if (r.visit === R.moves) return null;
    if (r.visit === R.moves - 1 && r.lastMap && (D.maps || []).indexOf(r.lastMap) >= 0) { r.visit = R.moves; r.lastMap = mapId; return null; }
    r.visit = R.moves; r.lastMap = mapId;
    if (D.unique && !r.solved[D.unique.id]) { r.unique = 'offered'; r.offered++; return D.unique.scene; }
    const open = (D.variants || []).filter((v) => !v.when || RB.state.test(s, v.when));
    if (!open.length || !RB.streams) return null;
    if (RB.streams.next(s, 'road:' + id) >= (D.rate != null ? D.rate : 0.2)) return null;
    const v = open[Math.floor(RB.streams.next(s, 'road:' + id) * open.length)];
    return v.scene;
  }
  // a road event's scene says it is solved (`!hook road_done <road> <id>`)
  function roadDone(s, road, id) {
    const R = rec(s);
    const r = R.roads[road] || (R.roads[road] = { unique: null, solved: {}, offered: 0 });
    r.solved[id] = true;
    const D = (C().roadEvents || {})[road];
    if (D && D.unique && id === D.unique.id) r.unique = 'solved';
    const all = D ? [D.unique].concat(D.variants || []).filter(Boolean).every((e) => r.solved[e.id]) : false;
    if (all && D.stamp && RB.records) RB.records.award(s, 'stamps', D.stamp);
    return all;
  }
  // unfinished unique events, for the Journey
  function unfinished(s) {
    const R = rec(s), out = [];
    for (const id in C().roadEvents || {}) { const r = R.roads[id]; if (r && r.unique === 'offered') out.push(id); }
    return out;
  }

  // ---- return keys (W6) ------------------------------------------------------------------------------------------
  function sealedOn(mapId) {
    const S = C().sealed || {};
    return Object.keys(S).filter((id) => S[id].map === mapId).map((id) => Object.assign({ id }, S[id]));
  }
  function canOpen(s, id) {
    const d = (C().sealed || {})[id];
    if (!d) return false;
    if (RB.phase && RB.phase.concepts && RB.phase.concepts()[d.needs]) return RB.phase.knows(s, d.needs);
    return RB.state.test(s, d.needs);
  }
  // examining a sealed spot: noticed (Known details lists it); opened once what it needs is known
  function examine(s, id) {
    const d = (C().sealed || {})[id];
    if (!d) return null;
    const R = rec(s);
    if (R.sealed[id] === 'open') return { state: 'open' };
    // Known details lists the spot from the first look: barred until opened (src/ui/61_known.js)
    const known = (state, label) => { if (RB.known && d.map) RB.known.note(s, d.map, 'sealed:' + id, { state, label, x: d.x, y: d.y }); };
    if (canOpen(s, id)) {
      R.sealed[id] = 'open';
      if (d.opens) s.flags[d.opens] = true;
      known('opened', d.openedLabel || d.hint || { en: 'Opened' });
      return { state: 'opened', scene: d.scene || null };
    }
    R.sealed[id] = 'noticed';
    known('barred', d.hint || { en: 'Sealed' });
    return { state: 'noticed', hint: d.hint };
  }
  function noticed(s) {
    const R = rec(s);
    return Object.keys(R.sealed).filter((id) => R.sealed[id] === 'noticed').map((id) => Object.assign({ id }, (C().sealed || {})[id]));
  }

  // ---- the conditions content uses -------------------------------------------------------------------------------
  if (RB.state && RB.state.addTerm) {
    // slot.<person>=k : the resident's current routine slot
    RB.state.addTerm('slot', (s, rest, op, val, num, cmp) => cmp(slotOf(s, rest), op || '=', num(val == null ? 1 : val)));
    // beat.<town>.<id> : a town's change beat is active
    RB.state.addTerm('beat', (s, rest) => { const [t, b] = String(rest).split('.'); return beats(s, t).some((x) => x.id === b); });
  }
  // the scene hooks
  RB.hooks = RB.hooks || {};
  RB.hooks.road_done = async (a) => { if (RB.game && RB.game.s) roadDone(RB.game.s, a[0], a[1]); };
  RB.hooks.sealed = async (a) => {
    const s = RB.game && RB.game.s;
    if (!s) return;
    const r = examine(s, a[0]);
    if (r && r.state === 'noticed' && r.hint) await RB.script.runInline([{ who: 'narr', jp: r.hint.jp, en: r.hint.en }]);
    else if (r && r.state === 'opened' && r.scene) await RB.script.run(r.scene);
  };

  return {
    rec, townOf, slotOf, tick, beforeEnter, rested, beats, changed, visited, whereabouts, askable, findable, usualPlaces, note, seen,
    roadOf, roadEventAt, LINES,
    roadDone, unfinished, sealedOn, canOpen, examine, noticed,
  };
})();
