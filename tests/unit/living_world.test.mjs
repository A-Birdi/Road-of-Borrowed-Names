// The Living World across the journey (C-87, LW-03 to LW-09; docs/future/work/LW1_ROLLOUT.md), on the real content
// in a throwaway context: no synthetic towns, people or events. Reedwake is driven end to end (its routine moving
// real people after real transitions, its askers' four kinds of answer, its road's first event and a variant, a
// return key noticed then opened, its change beats); every region's registrations are then checked for what the
// plan asks (routines, askers, beats, road events, return keys) and for being well-formed (places free and
// reachable, scenes and challenges present, people real).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, T = RB.town, L = C.living;
  const camp = (flags) => { const s = RB.state.newCampaign({ edition: 2 }); s.id = 'lw-test'; Object.assign(s.flags, flags || {}); s.map = 'rw.village'; RB.game.s = s; return s; };
  const go = (s, map) => { const why = T.beforeEnter(s, map); s.map = map; T.visited(s, map); return why; };
  const where = (p) => RB.world.mapsWith(p);

  // ---- Reedwake's routines (W2), on its real people --------------------------------------------------------------------
  {
    t.eq(T.townOf('rw.tea'), 'reedwake', 'the teahouse is Reedwake');
    t.eq(T.townOf('rw.road'), null, 'the road is not');
    const s = camp();
    t.eq([where('oto'), where('kiku'), where('mame')], [['rw.house1'], ['rw.house2'], ['rw.village']], 'before setting out, everyone where the story puts them');
    s.world = s.world || {}; T.rec(s); s.world.towns.reedwake = { tick: 1, slots: { oto: 2, kiku: 3, mame: 2 }, leftAt: null, flags: {}, rests: 0 };
    t.eq([where('oto'), where('kiku')], [['rw.house1'], ['rw.house2']], 'a routine does not run before the town\'s own story is done (`departed`)');
    s.flags.departed = true;
    t.eq([where('oto'), where('kiku'), where('mame')], [['rw.village'], ['rw.hall'], ['rw.village']], 'after it, each in the place their routine has them: one person, one place');
    const s2 = camp({ departed: true, ch1_done: true });
    for (const m of ['rw.tea', 'rw.village', 'rw.hall', 'rw.village']) t.eq(go(s2, m), null, 'within the town, never a tick: ' + m);
    const before = JSON.stringify(T.rec(s2).towns.reedwake ? T.rec(s2).towns.reedwake.slots : {});
    go(s2, 'rw.road'); go(s2, 'sg.road'); go(s2, 'sg.harbor'); go(s2, 'sg.road');
    t.eq(go(s2, 'rw.village'), 'away', 'three transitions away and back: the routine moves on');
    const after = T.rec(s2).towns.reedwake.slots;
    t.ok(JSON.stringify(after) !== before && ['oto', 'kiku', 'mame'].every((p) => after[p] >= 1 && after[p] <= 3), 'each resident has a slot of their own: ' + JSON.stringify(after));
    for (const p of ['oto', 'kiku', 'mame']) t.eq(where(p).length, 1, p + ' is in exactly one place: ' + where(p));
    // the slot's own first line, once, then what they always say (the same talk list)
    for (const r of L.routines.filter((r) => r.town === 'reedwake')) {
      for (const id in C.maps) for (const n of C.maps[id].npcs || []) {
        if ((n.char || n.id) !== r.person || !n.slotScene) continue;
        t.ok(!!C.scenes[n.slotScene], 'the slot line exists: ' + n.slotScene);
        t.ok(C.scenes[n.slotScene].cmds.some((c) => c.op === 'hook' && /usual_talk/.test(JSON.stringify(c))), 'and goes on to the usual talk: ' + n.slotScene);
        const base = C.maps[r.base.split(':')[0]].npcs.find((x) => x.id === r.base.split(':')[1]);
        t.ok(n.talk === base.talk, 'the same talk list as the usual place: ' + n.id);
      }
    }
  }

  // ---- "Have you seen…?" (W3), Reedwake's askers ---------------------------------------------------------------------
  {
    const s = camp({ departed: true });
    T.rec(s).towns.reedwake = { tick: 1, slots: { oto: 3, kiku: 1, mame: 1 }, leftAt: null, flags: {}, rests: 0 };
    const a1 = T.whereabouts(s, 'hana', 'oto', 'rw.village');
    t.eq([a1.kind, a1.map], ['sighting', 'rw.tea'], 'Hana, asked in the square about Oto, who is in her teahouse next door: a sighting');
    const a2 = T.whereabouts(s, 'hana', 'kiku', 'rw.tea');
    t.eq(a2.kind, 'routine', 'about Kiku, at home two maps away, whom she knows well: her usual places');
    t.ok(/Kiku|Lantern|Reedwake/.test(a2.line.en) || a2.note.maps.length >= 2, 'naming them: ' + a2.line.en);
    const a3 = T.whereabouts(s, 'tomo', 'tsuru', 'rw.village');
    t.eq(a3.kind, 'unknown', 'Tomo does not know Tsuru\'s comings and goings: she does not pretend to');
    const a4 = T.whereabouts(s, 'bunta', 'oto', 'rw.carpenter');
    t.eq(a4.kind, 'refusal', 'Bunta will not say');
    const a5 = T.whereabouts(s, 'tomo', 'yasu', 'rw.tea');
    t.ok(a5.kind === 'uncertain' || a5.kind === 'sighting', 'a loose acquaintance is unsure (or saw him): ' + a5.kind);
    t.ok(T.askable(s, 'hana').length === 0, 'nobody to ask about before you have seen anyone');
    T.seen(s, 'oto', 'rw.house1');
    t.eq(T.askable(s, 'hana'), ['oto'], 'someone you have seen can be asked after');
    const n = T.note(s, 'hana', a2);
    t.ok(n && n.kind === 'routine' && n.from === 'hana', 'the answer is a note of what was said, by whom');
    for (const p of L.askers) t.ok(Object.keys((C.relations[p] || {}).knows || {}).length > 0 || (C.relations[p] || {}).friendly === false, 'every asker knows someone, or refuses: ' + p);
  }

  // ---- the Reedwake road (W5) ----------------------------------------------------------------------------------------
  {
    const s = camp({ departed: true });
    t.eq(T.roadOf('rw.road'), 'rw_road', 'the road has its events');
    T.beforeEnter(s, 'rw.road'); s.map = 'rw.road';
    t.eq(T.roadEventAt(s, 'rw.road'), 'sg.lw_road_rw_cart', 'the first time you walk onto it: the pedlar\'s cart');
    t.eq(T.roadEventAt(s, 'rw.road'), null, 'once a visit');
    t.eq(T.unfinished(s), ['rw_road'], 'leaving it unsolved: unfinished in the Journey');
    go(s, 'rw.village'); go(s, 'rw.road');
    t.eq(T.roadEventAt(s, 'rw.road'), 'sg.lw_road_rw_cart', 'offered again on the next visit: never lost');
    go(s, 'rw.village'); go(s, 'rw.road'); T.storyOnArrival('rw.road');
    t.eq(T.roadEventAt(s, 'rw.road'), null, 'an arrival the map\'s own story met (a chapter\'s arrival scene): the road\'s event waits');
    go(s, 'rw.village'); go(s, 'rw.road');
    t.eq(T.roadEventAt(s, 'rw.road'), 'sg.lw_road_rw_cart', 'and is there on the next walk');
    const s2 = camp({ departed: true }); s2.map = 'rw.road';
    t.eq(T.roadEventAt(s2, 'rw.road'), null, 'a load or a start on the road is no arrival: nothing');
    T.roadDone(s, 'rw_road', 'cart');
    t.eq(T.unfinished(s), [], 'solved: no longer unfinished');
    let v = 0;
    for (let i = 0; i < 60; i++) { go(s, 'rw.village'); go(s, 'rw.road'); if (T.roadEventAt(s, 'rw.road')) v++; }
    t.ok(v > 2 && v < 30, 'then a variant now and then (about one visit in five): ' + v + ' of 60');
    for (const id of ['cart', 'marker', 'letter', 'geese']) T.roadDone(s, 'rw_road', id);
    t.ok(RB.stampBook && RB.stampBook.earned(s, 'road.rw_road'), 'every event on the road seen through: its stamp is earned');
  }

  // ---- return keys (W6) ------------------------------------------------------------------------------------------------
  {
    const s = camp({ departed: true });
    t.eq(T.examine(s, 'rw_jars').state, 'noticed', 'the unlabelled jars: noticed, with a hint, until the word is known');
    t.eq(T.noticed(s).map((x) => x.id), ['rw_jars'], 'and listed as noticed');
    s.flags.mod_sorezore = true;
    const r = T.examine(s, 'rw_jars');
    t.eq([r.state, r.scene, !!s.flags.lw_rw_jars_open], ['opened', 'mb.lw_rw_jars_open', true], 'once それぞれ is learned (Manybridge), it opens');
    t.ok(C.maps['rw.warehouse'].props.some((p) => p.scene === 'mb.lw_rw_jars_after' && RB.state.test(s, p.if)) && !C.maps['rw.warehouse'].props.some((p) => p.scene === 'rw.lw_seal_rw_jars' && RB.state.test(s, p.if)), 'and what stands there changes');
    t.eq(T.examine(s, 'rw_floodstone').state, 'noticed', 'the flood stone waits for waiting');
    s.flags.learn_wait = true;
    t.eq(T.examine(s, 'rw_floodstone').state, 'opened', 'and opens once you know how to wait');
  }

  // ---- change beats (W1) -----------------------------------------------------------------------------------------------
  {
    const s = camp({ departed: true, ch1_done: true });
    const rw = () => T.changed(s).map((c) => c.town).filter((t) => t === 'reedwake');
    s.flags.mb2_done = true;
    t.eq(rw(), [], 'a town you have never been to has not "changed"');
    delete s.flags.mb2_done;
    T.visited(s, 'rw.village');
    t.eq(rw(), [], 'nothing changed yet');
    s.flags.ch2_done = true; s.flags.mb2_done = true;
    t.eq(rw(), ['reedwake'], 'after Saltglass and the festival elsewhere: Reedwake has changed');
    t.ok(C.maps['rw.village'].props.some((p) => p.scene === 'mp.lw_rw_press_sheet' && RB.state.test(s, p.if)), 'the printed sheet is up by the teahouse');
    T.visited(s, 'rw.village');
    t.eq(rw(), [], 'seen on a visit: no longer a hint');
    s.flags.ko_done = true;
    t.eq(rw(), ['reedwake'], 'a later beat adds a new hint (the timetable)');
  }

  // ---- every region (the plan's minimums; well-formed) ------------------------------------------------------------------
  {
    const D = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    const reach = {};
    const open = (mid) => {
      if (reach[mid]) return reach[mid];
      const m = RB.maps.compile(mid), free = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && !RB.maps.blockedStatic(m, x, y);
      const seen = new Set(), q = [];
      for (const e of m.exits) for (let y = e.y; y < e.y + (e.h || 1); y++) for (let x = e.x; x < e.x + (e.w || 1); x++) if (free(x, y)) { seen.add(x + ',' + y); q.push([x, y]); }
      while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of D) { const k = (x + dx) + ',' + (y + dy); if (!seen.has(k) && free(x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy]); } } }
      return (reach[mid] = seen);
    };
    const bad = [];
    for (const r of L.routines) {
      if (!C.chars[r.person]) bad.push('no person ' + r.person);
      r.slots.slice(1).forEach((sl, i) => { if (!open(sl.map).has(sl.x + ',' + sl.y)) bad.push(r.person + ' slot ' + (i + 2) + ' at ' + sl.map + ' ' + sl.x + ',' + sl.y + ' is not open floor'); if (!C.towns[r.town].maps.includes(sl.map)) bad.push(r.person + ': ' + sl.map + ' is not ' + r.town + '\'s'); });
    }
    for (const id in C.towns) { const tw = C.towns[id]; for (const m of tw.maps) if (!C.maps[m]) bad.push(id + ': no map ' + m); for (const b of tw.beats || []) if (!b.id || !b.when) bad.push(id + ': a beat without id or condition'); }
    for (const a in C.relations) { if (!C.chars[a]) bad.push('relations: ' + a); for (const b in C.relations[a].knows || {}) if (!C.chars[b]) bad.push('relations: ' + a + ' → ' + b); }
    for (const id in C.roadEvents) {
      const R = C.roadEvents[id];
      for (const m of R.maps) if (!C.maps[m]) bad.push('road ' + id + ': no map ' + m);
      for (const e of [R.unique].concat(R.variants || []).filter(Boolean)) {
        if (!C.scenes[e.scene]) { bad.push('road ' + id + ': no scene ' + e.scene); continue; }
        if (!C.scenes[e.scene].cmds.some((c) => c.op === 'hook' && JSON.stringify(c).indexOf('road_done') >= 0)) bad.push('road ' + id + ': ' + e.scene + ' never says it is solved');
        for (const c of C.scenes[e.scene].cmds) if (c.op === 'challenge') { const ch = C.challenges[c.args ? c.args[0] : null] || C.challenges[(JSON.stringify(c).match(/"([a-z0-9_]+\.[a-z0-9_.]+)"/) || [])[1]]; if (!ch) bad.push('road ' + id + ': ' + e.scene + ' runs a missing challenge'); else if (!['F', 'E', 'I', 'A'].every((k) => ch.tiers && ch.tiers[k])) bad.push('road ' + id + ': a challenge without all four tiers'); }
      }
    }
    for (const id in C.sealed) { const d = C.sealed[id]; if (!C.maps[d.map]) bad.push('seal ' + id + ': no map'); if (!d.hint || !d.hint.jp) bad.push('seal ' + id + ': no hint'); if (!d.needs) bad.push('seal ' + id + ': needs nothing'); if (d.scene && !C.scenes[d.scene]) bad.push('seal ' + id + ': no scene ' + d.scene); }
    t.eq(bad, [], 'every registration is well-formed');
    t.ok(Object.keys(C.towns).length >= 2, 'towns registered: ' + Object.keys(C.towns).join(', '));
  }
};
