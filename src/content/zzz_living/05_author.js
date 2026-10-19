/* Authoring the Living World across the journey (C-87, LW-03 to LW-06; docs/future/work/LW1_ROLLOUT.md). The
 * engines are src/engine/53_town.js (towns, routines, change beats, "Have you seen…?", road events, return keys) and
 * src/ui/53w_whereabouts.js. Each region's file in this folder uses these helpers on real people and real maps, and
 * every scene it adds is ordinary script (Japanese spaced into words, furigana on every kanji).
 *
 *   L.town(id, { name, maps, care, after })
 *     A town: its maps (moving among them is being in the town: no routine moves while you are there), the story
 *     flags it cares about (one set elsewhere since your last visit moves its routine on), and `after`, the flag from
 *     which its routines run (the region's own story first: before it, everyone is where the story puts them).
 *   L.routine(town, person, { base: 'map:id' (or 'map:id@x,y'), pin, slots: [{ map, x, y, dir, perform, line: [jp, en] }] })
 *     A resident's places. Slot 1 is their placement `base` (it gains "slot 1, or before `after`"); each further slot
 *     is a new placement with the same condition, "slot k and after `after`", the same talk list, and a first line
 *     of its own said once (then what they always say: the usual_talk hook, so the story's next step is never held
 *     back). Scene ids carry the region (`rw.lw_sl_oto_r2`), so the phase rule reads them as that chapter's.
 *     `pin`: while it holds, the routine leaves them where they are (a quest step that needs them).
 *   L.away(town, person, { map, x, y, p, line: [jp, en] })
 *     A clue at someone's usual place while their routine has them elsewhere (a note on the door, a closed stall).
 *   L.knows(asker, { person: 'routine' | 'loose' }), L.cold(asker, [jp, en]), L.usual(person, [jp, en]),
 *   L.asks(person, maps?) — who knows whom (W3), an unfriendly asker, how someone's usual place is described by
 *     those who know them, and the people who can be asked after others (every placement of them, on maps given).
 *   L.beat(town, { id, when, en, jp }) — a change beat (W1); its content is conditioned on `beat.<town>.<id>` or on
 *     its own `when`.
 *   L.road(id, { maps, unique, variants, rate, stamp, when }) — road events (W5; none until `when` holds). Each event
 *     ({ id, scene, when }) stands on the road with `at: { map, who: [{ char, x, y, dir, id }], props: [{ p, x, y, meet }] }`:
 *     its people (talking to any of them runs its scene; `id` defaults to the char, so a scene's gestures find a
 *     named speaker) and its things (`meet: true` on one examined to run the scene; the rest are only there), while
 *     `roadev.<road>.<event>` holds (src/engine/53_town.js). `map` defaults to the road's first. L.seal(id, { map, x, y, p, needs, hint,
 *     opens, scene, openedLabel, after: { p, scene, o } }) — a return key (W6): a prop with the hint, examined
 *     through `!hook sealed`; `after` is what stands there once it is open (the sealed prop then goes).
 *   L.talk('map:id', [{ if, scene }]) — new talk at the head of a placement's list (in place: every routine slot of
 *     that person shares the list).
 *   L.scenes(text) — scene script for the above (added once every region file has run: 99_end.js).
 *   L.and(a, b) — two conditions joined (conditions have no brackets: '|' binds looser than '&'). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.living = (function (C) {
  'use strict';
  C.towns = C.towns || {};
  C.relations = C.relations || {};
  C.roadEvents = C.roadEvents || {};
  C.sealed = C.sealed || {};
  C.living = C.living || { routines: [], away: [], beats: [], roads: [], seals: [], askers: [] };
  const T = (en, jp) => ({ en, jp });
  // a & b, written out as alternatives of conjunctions
  function and(a, b) {
    if (!a) return b || undefined;
    if (!b) return a;
    const A = String(a).split('|'), B = String(b).split('|'), out = [];
    for (const x of A) for (const y of B) out.push(x.trim() + '&' + y.trim());
    return out.join('|');
  }
  const mapOf = (id) => { const m = C.maps[id]; if (!m) throw new Error('living: no map ' + id); m.npcs = m.npcs || []; m.props = m.props || []; return m; };
  const nameOfMap = (id) => (C.maps[id] && C.maps[id].name) || T(id, id);
  function town(id, o) {
    C.towns[id] = Object.assign(C.towns[id] || {}, { name: o.name || nameOfMap(o.maps[0]), maps: o.maps.slice(), care: (o.care || []).slice(), residents: {}, beats: [], after: o.after || null });
    return C.towns[id];
  }
  let script = '';
  const esc = (s) => String(s).replace(/\n/g, ' ');
  function scenes(text) { script += '\n' + text + '\n'; }
  // 'map:id', or 'map:id@x,y' for one of several placements sharing an id on that map (before and after a story beat)
  function placement(ref) {
    const [map, rest] = ref.split(':');
    const [id, at] = rest.split('@');
    const xy = at ? at.split(',').map(Number) : null;
    const n = mapOf(map).npcs.find((x) => x.id === id && (!xy || (x.x === xy[0] && x.y === xy[1])));
    if (!n) throw new Error('living: no placement ' + ref);
    return { map, n };
  }
  function routine(townId, person, o) {
    const t = C.towns[townId];
    if (!t) throw new Error('living: no town ' + townId);
    const after = t.after;
    if (after && /[|&!=]/.test(after)) throw new Error('living: a town\'s `after` is one flag: ' + after);
    const base = placement(o.base);
    const n = 1 + o.slots.length, baseIf = base.n.if || null;
    if (typeof base.n.talk === 'string') base.n.talk = [{ scene: base.n.talk }]; // one list, shared by every slot
    base.n.if = and(baseIf, after ? 'slot.' + person + '=1|!' + after : 'slot.' + person + '=1');
    const region = base.map.split('.')[0];
    o.slots.forEach((sl, i) => {
      // (the scene's id carries the region, so the phase rule checks it names nothing from a later chapter)
      const k = i + 2, id = person + '_r' + k, sc = region + '.lw_sl_' + id;
      const cond = and(baseIf, after ? 'slot.' + person + '=' + k + '&' + after : 'slot.' + person + '=' + k);
      // the same talk list as the usual place (one list: anything later content puts at its head is here too); the
      // place's own first line is said once before it (src/engine/50_world.js talkTo, the usual_talk hook)
      const n2 = { id, char: person, x: sl.x, y: sl.y, dir: sl.dir || 'down', if: and(o.when || null, cond), talk: base.n.talk, slotScene: sc };
      if (sl.perform) {
        n2.perform = sl.perform;
        // the work manifest (00_work.js) lists every performer in a journey
        C.work = C.work || [];
        if (!C.work.some((w) => w.map === sl.map && w.id === id)) C.work.push({ map: sl.map, id, char: person, act: typeof sl.perform === 'string' ? sl.perform : sl.perform.act, why: 'routine: ' + sl.line[1] });
      }
      if (sl.wander) n2.wander = sl.wander;
      mapOf(sl.map).npcs.push(n2);
      scenes('@scene ' + sc + '\n' + person + ': ' + esc(sl.line[0]) + ' || ' + esc(sl.line[1]) + '\n!hook usual_talk');
    });
    t.residents[person] = { slots: n };
    if (o.pin) t.residents[person].pin = o.pin;
    C.living.routines.push({ town: townId, person, base: o.base, slots: [{ map: base.map, x: base.n.x, y: base.n.y }].concat(o.slots.map((sl) => ({ map: sl.map, x: sl.x, y: sl.y, perform: sl.perform || null }))) });
  }
  function away(townId, person, o) {
    const t = C.towns[townId], id = o.map.split('.')[0] + '.lw_away_' + person;
    mapOf(o.map).props.push({ p: o.p || 'sign', x: o.x, y: o.y, scene: id, if: and(t.after, '!slot.' + person + '=1') });
    scenes('@scene ' + id + '\nnarr: ' + esc(o.line[0]) + ' || ' + esc(o.line[1]));
    C.living.away.push({ town: townId, person, map: o.map, x: o.x, y: o.y });
  }
  const rel = (p) => C.relations[p] || (C.relations[p] = { knows: {} });
  function knows(asker, map) { Object.assign(rel(asker).knows, map); }
  function cold(asker, line) { rel(asker).friendly = false; if (line) rel(asker).refusal = T(line[1], line[0]); }
  function usual(person, line) { rel(person).usual = T(line[1], line[0]); }
  function asks(person, maps) {
    let k = 0;
    for (const id in C.maps) {
      if (maps && maps.indexOf(id) < 0) continue;
      for (const n of C.maps[id].npcs || []) if ((n.char || n.id) === person && !/dev_/.test(n.if || '')) { n.asks = true; k++; }
    }
    if (!k) throw new Error('living: nobody called ' + person + ' to ask');
    C.living.askers.push(person);
  }
  function beat(townId, b) { C.towns[townId].beats.push(b); C.living.beats.push(Object.assign({ town: townId }, b)); }
  // a road's events; its stamp (family 'road') is pressed once every event on it has been solved (53_town roadDone);
  // its title names the road, its criteria name none (a hidden stamp's criteria name no later place)
  function road(id, o) {
    const D = Object.assign({ rate: 0.2 }, o);
    if (o.stamp) {
      const sid = 'road.' + id;
      C.stamps = C.stamps || {};
      C.stamps[sid] = { id: sid, family: 'road', title: T(o.stamp.title[1], o.stamp.title[0]), criteria: T('Every event on one road seen through.', '{一|ひと}つ の {道|みち} の {出来事|できごと} を すべて {見|み}た'), hidden: true,
        when: (s) => { const r = s.world && s.world.roads && s.world.roads[id]; return !!(r && [D.unique].concat(D.variants || []).filter(Boolean).every((e) => r.solved[e.id])); },
        design: { shape: 'round', motif: o.stamp.motif || 'path', ink: o.stamp.ink || '#5a4a2a' } };
      D.stamp = sid;
    }
    C.roadEvents[id] = D;
    C.living.roads.push(id);
    // each event's people and things, there while it stands on the road (RE-1)
    for (const e of [D.unique].concat(D.variants || []).filter(Boolean)) {
      if (!e.at) continue;
      const map = e.at.map || D.maps[0], cond = 'roadev.' + id + '.' + e.id;
      if (D.maps.indexOf(map) < 0) throw new Error('living: road event ' + id + '.' + e.id + ' placed off its road: ' + map);
      for (const w of e.at.who || []) {
        mapOf(map).npcs.push(Object.assign({ id: w.id || w.char, char: w.char, x: w.x, y: w.y, dir: w.dir || 'down', if: cond, talk: [{ scene: e.scene }], roadEvent: id + '.' + e.id },
          w.perform ? { perform: w.perform } : {}, w.wander ? { wander: w.wander } : {}));
      }
      for (const pr of e.at.props || []) {
        const q = Object.assign({}, pr, { if: cond, roadEvent: id + '.' + e.id });
        delete q.meet;
        if (pr.meet) q.scene = e.scene;
        mapOf(map).props.push(q);
      }
      C.living.roadPlaces = C.living.roadPlaces || [];
      C.living.roadPlaces.push({ road: id, id: e.id, map });
    }
  }
  // new talk at the head of a placement's list (a change beat's new line, a road event's follow-up), kept in order
  function talk(ref, entries) {
    const { n } = placement(ref);
    if (typeof n.talk === 'string') n.talk = [{ scene: n.talk }];
    n.talk = n.talk || [];
    n.talk.unshift(...entries);
  }
  function seal(id, o) {
    C.sealed[id] = { map: o.map, x: o.x, y: o.y, needs: o.needs, hint: T(o.hint[1], o.hint[0]), opens: o.opens || null, scene: o.scene || null, openedLabel: o.openedLabel ? T(o.openedLabel[1], o.openedLabel[0]) : null };
    const sc = o.map.split('.')[0] + '.lw_seal_' + id;
    // o.after = { p, scene, o }: what stands there once it is open (the sealed prop then goes; without it, the prop
    // stays and examining it again says nothing more)
    mapOf(o.map).props.push(Object.assign({ p: o.p || 'sign', x: o.x, y: o.y, scene: sc, if: o.after && o.opens ? and(o.if || null, '!' + o.opens) : o.if || undefined }, o.o ? { o: o.o } : {}));
    if (o.after && o.opens) mapOf(o.map).props.push(Object.assign({ p: o.after.p || o.p || 'sign', x: o.x, y: o.y, scene: o.after.scene, if: and(o.if || null, o.opens) }, o.after.o ? { o: o.after.o } : {}));
    scenes('@scene ' + sc + '\n!hook sealed ' + id);
    C.living.seals.push(id);
  }
  // the scene script gathered by the region files, added once they have all run (zzz_living/99_end.js)
  // A named person a road event stands on its map (Kumazō on the steps, Jūzō at the stele) is there already in their
  // usual place: while the event waits, the usual one steps aside, so only one of them is ever seen and the scene's
  // gestures find the one you are talking to. (Once the event is seen through, the usual placement returns, and the
  // same id walks back to it: src/engine/50_world.js refreshActors.)
  function asides() {
    for (const id in C.maps) {
      const npcs = C.maps[id].npcs || [], ev = {};
      for (const n of npcs) if (n.roadEvent) (ev[n.id] = ev[n.id] || []).push('!roadev.' + n.roadEvent);
      for (const n of npcs) {
        if (n.roadEvent || !ev[n.id] || n.asideFor) continue;
        n.if = and(n.if, ev[n.id].join('&'));
        n.asideFor = ev[n.id].slice();
      }
    }
  }
  function flush() { asides(); if (script.trim()) RB.script.add(script, 'src/content/zzz_living/05_author.js'); script = ''; } // (scenes written out by these helpers: their source is this file)
  return { T, and, town, routine, away, knows, cold, usual, asks, beat, road, seal, talk, scenes, flush };
})(RB.content);
