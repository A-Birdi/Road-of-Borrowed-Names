/* Quick travel: where the Map tab's Travel list works, and why it doesn't
 * where it doesn't (docs/CONTENT.md "Quick travel").
 *
 * Travel works from anywhere out in the open — towns, roads, the wilderness,
 * beaches — when nothing is under way (no scene, battle, transition or
 * activity). It does not work on a map with `noTravel: true`, which says
 * what kind of place it is:
 *   - a building: travelKind 'interior' (the chapters' interior() helpers set
 *     it; region 'interior' or def.indoor count as well);
 *   - a dungeon or sealed place: travelKind 'dungeon', with travelPlace
 *     naming the whole place ({ en: 'the Drowned Archive' });
 *   - a map where leaving mid-sequence would break the story (or an
 *     expedition's own flow): noTravelWhy { en, jp? }, the authored reason
 *     (kind 'story', or travelKind 'expedition').
 * travelPlace { en } may also name a building whose own name reads badly in
 * a sentence. A `noTravel` map with no kind is an error (tools/validate.mjs,
 * tests/unit/travel_rules.test.mjs). The way out is found the way people find
 * theirs (RB.world.towards: exits and doors usable now, locks respected). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.travel = (function () {
  'use strict';
  const KINDS = ['interior', 'dungeon', 'story', 'expedition'];
  const NEEDS_WHY = ['story', 'expedition'];

  // 'open' | 'interior' | 'dungeon' | 'story' | 'expedition' | null (a noTravel map with no kind)
  function kindOf(def) {
    if (!def || !def.noTravel) return 'open';
    if (def.travelKind) return def.travelKind;
    if (def.noTravelWhy) return 'story';
    if (def.region === 'interior' || def.indoor) return 'interior';
    return null;
  }
  const opens = (def) => kindOf(def) === 'open';

  // How a sentence names the place you are in: "the Tide-Watch Hut", "Isamu's
  // House", "No. 2 Warehouse", "the Gull"; and a place a way leads to:
  // "Saltglass", "the Mill Road".
  function placeIn(def) {
    if (def && def.travelPlace && def.travelPlace.en) return def.travelPlace.en;
    const en = (def && def.name && def.name.en) || '';
    if (!en) return 'this place';
    if (/^the\s/i.test(en)) return 'the' + en.slice(3);
    if (/['’]s\b|^No\.|^\d/.test(en)) return en;
    return 'the ' + en;
  }
  function placeTo(def) {
    const en = (def && def.name && def.name.en) || 'somewhere';
    return /^the\s/i.test(en) ? 'the' + en.slice(3) : en;
  }

  // The nearest map where travel works, through exits and doors usable now:
  // { to, via, hops, door } (door: this map's only way out leads straight
  // there), or null when there is no way out just now.
  function wayOut(from) {
    const C = RB.content;
    if (!RB.world || !RB.world.towards || !C.maps[from]) return null;
    const dests = Object.keys(C.maps).filter((id) => id !== from && opens(C.maps[id]));
    const hop = RB.world.towards(from, dests);
    if (!hop) return null;
    const links = RB.world.linksOf(from);
    return { to: hop.to, via: hop.via, hops: hop.hops, door: hop.hops === 1 && links.length === 1 };
  }

  // Something under way: the folio opened over a conversation (History), or
  // anything but the world beneath it. null when nothing is.
  function underway() {
    const g = RB.game;
    if (!g || !g.s) return 'busy';
    const modes = ((g.G && g.G.modes) || []).filter((m) => m !== 'menu');
    const scene = RB.script && RB.script.isRunning && RB.script.isRunning();
    if (scene || modes.includes('dialogue')) return 'scene';
    if (g.mode() !== 'menu' || !modes.length || modes.some((m) => m !== 'world')) return 'busy';
    return null;
  }

  // What the Travel list says about the map you are on: { ok, kind, en }.
  function status(mapId) {
    const C = RB.content, s = RB.game && RB.game.s;
    const id = mapId || (s && s.map), def = C.maps[id] || {};
    const kind = kindOf(def);
    if (kind !== 'open') {
      if (def.noTravelWhy && def.noTravelWhy.en) return { ok: false, kind, en: def.noTravelWhy.en };
      const here = placeIn(def), way = wayOut(id), to = way && placeTo(C.maps[way.to]);
      if (kind === 'interior') {
        if (!way) return { ok: false, kind, en: 'You\'re inside ' + here + ', and there\'s no way out just now. Travel works again once you can step outside.' };
        if (way.door) return { ok: false, kind, en: 'You\'re inside ' + here + '. Step out through the door to travel.' };
        return { ok: false, kind, en: 'You\'re inside ' + here + '. Step outside to travel — the nearest way out leads to ' + to + '.' };
      }
      // a dungeon (and, should one ever be left unclassified, any other closed place)
      return { ok: false, kind: kind || 'closed', en: 'You\'re in ' + here + '. Travel works again once you\'re back out in the open' + (way ? ' — the way out leads to ' + to + '.' : '.') };
    }
    const busy = underway();
    if (busy === 'scene') return { ok: false, kind: 'scene', en: 'A conversation is under way. Travel works again once it\'s over.' };
    if (busy) return { ok: false, kind: 'busy', en: 'Something is under way just now. Travel works again once it\'s over.' };
    return { ok: true, kind: 'open', en: '' };
  }

  // Authoring problems of one map's travel fields (tools/validate.mjs, the unit test).
  function problems(id, def) {
    const out = [], k = kindOf(def);
    const travelFields = ['travelKind', 'noTravelWhy', 'travelPlace'].filter((f) => def[f] != null);
    if (def.noTravel && !k) out.push('noTravel without a kind: add travelKind (\'interior\' or \'dungeon\') or an authored noTravelWhy { en }');
    if (k && k !== 'open' && KINDS.indexOf(k) < 0) out.push('unknown travelKind ' + JSON.stringify(k) + ' (one of ' + KINDS.join(', ') + ')');
    if (!def.noTravel && travelFields.length) out.push(travelFields.join(', ') + ' on a map where travel works (it has no noTravel)');
    if (!def.noTravel && (def.region === 'interior' || def.indoor)) out.push('an interior where travel works: add noTravel: true');
    if (NEEDS_WHY.indexOf(k) >= 0 && !(def.noTravelWhy && def.noTravelWhy.en)) out.push(k + ' lock without its reason (noTravelWhy { en })');
    for (const f of ['noTravelWhy', 'travelPlace']) {
      const o = def[f];
      if (o == null) continue;
      if (typeof o !== 'object' || typeof o.en !== 'string' || !o.en.trim()) { out.push(f + ' needs English: { en: \'…\' }'); continue; }
      if (o.jp != null) {
        if (typeof o.jp !== 'string') out.push(f + '.jp is not a string');
        else for (const p of RB.jp.validate(o.jp)) out.push(f + '.jp: ' + (p.msg || p.code) + ' in “' + o.jp.slice(0, 40) + '”');
      }
    }
    return out.map((m) => 'map ' + id + ': ' + m);
  }

  return { KINDS, kindOf, opens, placeIn, placeTo, wayOut, underway, status, problems };
})();
