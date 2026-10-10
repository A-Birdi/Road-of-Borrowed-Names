// The Keepers' Road, Chapter 7 (expansion P10; docs/future/work/P10_KEEPERS.md): the chapter in twelve-chapter journeys
// only, between Snowbell and Lanternfall; the tellings' rules (the cave's order is the only one the sources can vouch
// for; the cache and the Fox Bridge each have a best reading, a detour and readings no source supports), their sources
// at all four profiles; the Scriptorium Cave's doors open only by the right telling, and a wrong one leads to a dead end
// that explains itself; the Hundredth Tale is ended by finishing the ninety-ninth, never by Unravel; The Keeper Who
// Stayed's three lasting ends each show their intention first; Ren's night apart never touches Ren's own quest; the
// hall stays shut; the bond events and the memory; the stamps, the music, すべて; and the three more kinds of creature
// in each of Cinder Orchard and Snowbell, met only in twelve-chapter journeys.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter, T = RB.tellings;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const camp = (o = {}) => {
    const s = RB.state.newCampaign({ edition: o.edition == null ? 2 : o.edition });
    s.id = o.id || 'kr-test'; s.comp = o.comp === undefined ? 'ren' : o.comp;
    s.words = (o.words || ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu', 'ishi', 'tsuchi', 'koori', 'honoo']).slice();
    for (const f of o.flags || []) s.flags[f] = true;
    Object.assign(s.quests, o.quests || {});
    RB.game.s = s;
    return s;
  };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const play = (st, s, card) => E.exchange(st, { card, res: OK, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });
  const test = (s, cond) => RB.state.test(s, cond);
  const cmds = (id) => (C.scenes[id] ? C.scenes[id].cmds : []);
  const ops = (id) => cmds(id).map((c) => c.op + ':' + (c.args || []).join(' '));
  const PROF = ['F', 'E', 'I', 'A'];

  // ---- the edition, the chapter's frame ---------------------------------------------------------------------------
  const krMaps = Object.keys(C.maps).filter((id) => /^kr\./.test(id));
  t.ok(krMaps.length >= 15 && krMaps.every((id) => C.maps[id].edition === 2), 'Chapter 7\'s ' + krMaps.length + ' maps are all the twelve-chapter edition\'s');
  t.ok(Object.keys(C.quests).filter((q) => /^kr_/.test(q)).every((q) => C.quests[q].chapter === 'kr'), 'every Chapter 7 quest belongs to kr');
  t.eq(C.quests.kr_main.stages.length, 8, 'the main story has eight steps');
  t.ok(ops('kr.arrive').includes('chapter:kr') && ops('kr.arrive').includes('quest:kr_main 0'), 'arriving at the foot starts Chapter 7');
  t.ok(ops('kr.chapter_end').includes('set:kr_done') && ops('kr.chapter_end').includes('quest:kr_main done'), 'the chapter ends with kr_done and the main story done');
  t.ok(C.maps['kr.descent'].onEnter.some((e) => e.scene === 'kr.chapter_end' && /kr_vigil_done/.test(e.if)), 'it ends on the way down, after the vigil');

  // ---- the seams: Snowbell → the Keepers' Road → Lanternfall, twelve-chapter journeys only --------------------------
  {
    const sbOut = (s) => C.maps['sb.road'].exits.filter((e) => e.x === 35 && test(s, e.if || '')).map((e) => e.to);
    t.eq(sbOut(camp({ edition: 1, flags: ['ch4_done'] })), ['lf.road'], 'six chapters: Snowbell\'s east road goes down to the Lantern Road');
    t.eq(sbOut(camp({ flags: ['ch4_done'] })), ['kr.foot'], 'twelve chapters: it goes up onto the Keepers\' Road');
    t.eq(sbOut(camp({})), [], 'and not before Snowbell\'s chapter is over');
    const lfIn = (s) => C.maps['lf.road'].exits.filter((e) => e.x === 0 && test(s, e.if || '')).map((e) => e.to);
    t.eq(lfIn(camp({ edition: 1 })), ['sb.road'], 'six chapters: the Lantern Road\'s west end leads back to Snowbell');
    t.eq(lfIn(camp({})), ['kr.descent'], 'twelve chapters: it leads back up to the Keepers\' Road');
    const road = (a, b) => C.roads.find((r) => r.includes(a) && r.includes(b));
    t.ok(road('snowbell', 'lanternfall')[2].if === 'ed<2', 'the chart\'s Snowbell–Lanternfall road is the six-chapter journey\'s');
    t.ok(road('snowbell', 'keepers')[2].edition === 2 && road('keepers', 'lanternfall')[2].edition === 2 && road('keepers', 'lanternfall')[2].if === 'kr_done', 'twelve chapters: Snowbell–the Keepers\' Road, then on to Lanternfall once the chapter is done');
    t.ok(C.places.keepers && C.places.keepers.edition === 2, 'the Keepers\' Road is a place on the chart in twelve-chapter journeys');
    const hay = C.maps['sb.road'].npcs.find((n) => n.id === 'hayate');
    const first = (s) => (hay.talk.find((x) => !x.if || test(s, x.if)) || {}).scene;
    t.eq(first(camp({})), 'kr.hayate_road', 'twelve chapters: Hayate tells of the avalanche and the high road');
    t.ok(first(camp({ edition: 1 })) !== 'kr.hayate_road', 'six chapters: Hayate as before');
  }

  // ---- weighing tellings: the rules ---------------------------------------------------------------------------------
  {
    const cave = T.def('kr.t_cave');
    t.eq(T.supportedOrders(cave), [['east', 'spring', 'name', 'bell']], 'the cave: one order is all the vouched sources allow (east, spring, name, bell)');
    const song = T.judge(cave, ['east', 'bell', 'spring', 'name']);
    t.ok(!song.ok && song.broken.length >= 1 && song.broken.every((c) => c.why && c.why.en), 'ringing the bell early breaks a claim that a source can vouch for, and says why');
    t.ok(T.judge(cave, ['east', 'spring', 'name', 'bell']).ok, 'the supported order succeeds');
    t.ok(T.claims(cave).some((c) => !c.vouch && c.rule), 'a source states an order it cannot vouch for (the song keeps time, not order), and it binds nothing');
    const cache = T.def('kr.t_cache');
    const j = (d, id) => T.judge(d, id);
    t.ok(j(cache, 'down').ok && j(cache, 'down').best, 'the cache: down the little path, the best reading');
    t.ok(j(cache, 'every').ok && !j(cache, 'every').best && j(cache, 'every').detour, 'digging under every lantern: supported, but a detour');
    for (const id of ['third', 'hut']) t.ok(!j(cache, id).ok && j(cache, id).missing.length >= 1, 'the cache: "' + id + '" rests on what no source can vouch for');
    const fox = T.def('kr.t_fox');
    t.ok(j(fox, 'both').ok && j(fox, 'both').best, 'the Fox Bridge: the keeper\'s naming, with the fox story as the family\'s, is the best');
    t.ok(j(fox, 'record').ok && j(fox, 'three').ok, 'only the record, or all three side by side: both supported');
    t.ok(!j(fox, 'fox').ok, 'that a fox built the bridge: nothing can vouch for it');
    for (const d of [cave, cache, fox]) {
      const notVouched = T.claims(d).find((c) => !c.vouch), vouched = T.claims(d).find((c) => c.vouch);
      const fb = T.markFeedback(d, { [notVouched.id]: true, [vouched.id]: true });
      t.ok(fb[notVouched.id].right === false && fb[notVouched.id].why && fb[vouched.id].right === true, d.id + ': a mark the other way is told why; marks never gate the reading');
      t.ok(T.judge(d, T.autoReading(d)).ok, d.id + ': the automated runs take a supported reading');
      for (const src of d.sources) {
        t.ok(PROF.every((k) => T.textAt(src, k).jp && src.text[k]), d.id + ' ' + src.id + ': the source reads at all four profiles');
        const ch = C.challenges[src.read];
        t.ok(ch && PROF.every((k) => ch.tiers[k] && ch.tiers[k].length && ch.tiers[k].every((st) => (st.options || []).some((o) => o.ok))), d.id + ' ' + src.id + ': its reading task (' + src.read + ') at every profile');
      }
    }
    const s = camp();
    T.keep(s, 'kr.t_cache', T.judge(cache, 'every'));
    t.ok(s.vars['tell_kr.t_cache'] === 'every' && s.flags['tell_kr.t_cache_ok'] && !s.flags['tell_kr.t_cache_best'], 'what was decided is kept: the reading, supported, not the best');
  }

  // ---- the Scriptorium Cave: the right telling opens the way; a wrong one, a dead end that explains itself ----------
  {
    const reach = (mapId, from, s) => {
      RB.game.s = s; RB.maps.invalidate();
      const m = RB.maps.compile(mapId);
      const seen = new Set([from.join(',')]), q = [from];
      while (q.length) {
        const [x, y] = q.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
          if (seen.has(k) || nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || RB.maps.blockedStatic(m, nx, ny)) continue;
          seen.add(k); q.push([nx, ny]);
        }
      }
      return (x, y) => [[0, 1], [0, -1], [1, 0], [-1, 0], [0, 0]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)));
    };
    const inner = C.maps['kr.cave1'].exits.find((e) => e.to === 'kr.cave2');
    t.ok(!test(camp(), inner.if) && test(camp({ flags: ['kr_rite_done'] }), inner.if), 'the inner door opens only once the lanterns are lit in the supported order');
    const rite = ops('kr.rite');
    t.ok(rite.includes('hook:tellings kr.t_cave') && rite.includes('set:kr_rite_done') && rite.includes('set:kr_cave_wrong'), 'the rite: the tellings decide; the right order opens the door, a wrong one rings the bell too soon');
    t.ok(!reach('kr.cave1', [14, 18], camp())(2, 10) && reach('kr.cave1', [14, 18], camp({ flags: ['kr_cave_wrong'] }))(2, 10), 'a wrong telling slides a shelf aside onto the dead end');
    t.ok(cmds('kr.cave_deadend').filter((c) => c.op === 'say').length >= 2, 'the dead end says why (a carving)');
    const stairs = C.maps['kr.cave2'].props.find((p) => p.p === 'stairs');
    t.ok(stairs.if === 'kr_cave2_open' && C.encounters['kr.shadow_gate'].conclusions.every((c) => c.flags && c.flags.kr_cave2_open), 'the Copying Room\'s stairs: only once the Teller\'s Shadow\'s account is put right');
    t.ok(C.maps['kr.cave2'].props.some((p) => p.p === 'bench' && p.scene), 'a bench to rest on (the checkpoint)');
  }

  // ---- the Hundredth Tale: no Unravel; ended by finishing the ninety-ninth ------------------------------------------
  {
    const enc = C.encounters['kr.hyakuwa'];
    t.ok(enc.kind === 'social' && enc.social.unravelTip, 'the Hundredth Tale: a folklore and social encounter (Unravel only tells you it is no knot)');
    const s = camp();
    const st = E.begin('kr.hyakuwa', s);
    for (let i = 0; i < 6 && !st.over; i++) play(st, s, E.cards(st, s, wordsOf(s)).find((c) => c.kind === 'unravel'));
    t.ok(!st.over, 'Unravel, again and again, never ends it (C-09)');
    const reached = new Set(), seen = new Set();
    // (each turn: a card, with or without the companion's own action alongside it)
    const explore = (plan, depth) => {
      const s2 = camp();
      const x = E.begin('kr.hyakuwa', s2);
      for (const [id, ca] of plan) { if (x.over) break; E.exchange(x, { card: E.cards(x, s2, wordsOf(s2)).find((c) => c.id === id), res: OK, comp: ca ? { act: ca } : null, target: x.cur }, { enemy: x.foes[0] && x.foes[0].def }); }
      if (x.over) { reached.add(x.enc.outcome); return; }
      const key = E.stateKey(x) + x.round + JSON.stringify(x.compUses || {});
      if (seen.has(key) || depth > 8) return;
      seen.add(key);
      const acts = [null].concat((C.encounters['kr.hyakuwa'].social.companion[s2.comp] || []).filter((a) => !(x.compUses || {})[a.id]).map((a) => a.id));
      for (const c of E.cards(x, s2, wordsOf(s2))) if (!c.disabled && c.kind !== 'unravel') for (const ca of acts) explore(plan.concat([[c.id, ca]]), depth + 1);
    };
    explore([], 0);
    t.eq(enc.conclusions.map((c) => c.id).filter((id) => !reached.has(id)), [], 'every end of the vigil is reachable (' + [...reached].join(', ') + ')');
    t.ok(ops('kr.vigil_begin').includes('encounter:kr.hyakuwa') && ops('kr.vigil_begin').includes('set:kr_vigil_done'), 'the vigil ends at dawn whichever way the tale was closed');
    t.eq(RB.audio.battleSong(C.enemies['kr.hyakuwa']), 'boss_keepers', 'its own boss theme');
  }

  // ---- The Keeper Who Stayed: three lasting ends, each shown before it is chosen --------------------------------------
  {
    const sc = C.scenes['kr.hisae_truth'];
    for (const [label, flag] of [['plain', 'kr_hisae_plain'], ['register', 'kr_hisae_register'], ['silent', 'kr_hisae_silent']]) {
      const at = sc.labels[label];
      const lead = sc.cmds.slice(at, at + 3);
      const ch = lead.find((c) => c.op === 'choice');
      t.ok(lead.some((c) => c.op === 'say' && /can't be taken back/.test(c.en)) && ch && ch.opts.length === 2 && ch.opts[1].to === 'end', label + ': the intention is shown, with a way to think again, before it is chosen');
      t.ok(sc.cmds.some((c) => c.op === 'set' && c.args[0] === flag), label + ': it is kept (' + flag + ')');
      t.ok(cmds('kr.hisae_after').some((c) => c.op === 'say' && c.if && c.if.includes(flag) && !c.if.includes('!' + flag)), label + ': Hisae afterwards remembers it');
    }
    t.ok(ops('kr.hisae_truth').includes('quest:kr_hisae done'), 'any end finishes the side story');
    const hisae = C.maps['kr.lodge'].npcs.find((n) => n.id === 'kr_hisae' && Array.isArray(n.talk) && n.talk.some((x) => x.scene === 'kr.hisae_truth'));
    const first = (s) => (hisae.talk.find((x) => !x.if || test(s, x.if)) || {}).scene;
    t.ok(first(camp({ flags: ['kr_vigil_done'], quests: { kr_hisae: { stage: 1 }, kr_inkstone: { stage: 0 } } })) === 'kr.hisae_truth', 'after the vigil, the truth can be told');
    t.ok(ops('kr.dawn').includes('quest:kr_hisae 1'), 'dawn opens the decision (the side story\'s second step)');
  }

  // ---- Ren's crossroads and the others' quarrels; the bond events and the memory ---------------------------------------
  {
    const krScenes = Object.keys(C.scenes).filter((id) => /^kr\./.test(id));
    t.ok(krScenes.every((id) => !cmds(id).some((c) => (c.args || []).join(' ').includes('ren_ushio') || (c.if || '').includes('ren_ushio'))), 'no Chapter 7 scene touches Ren\'s own quest (ren_ushio)');
    const rl = ops('kr.ren_lantern');
    t.ok(rl.includes('unset:kr_apart') && rl.includes('set:kr_ren_crossroads') && rl.includes('hook:co_bond kr:night') && rl.includes('hook:co_remember together kr_ridge'), 'Ren\'s night apart ends at the Ridge Light: the crossroads answered later, a bond event and a kept memory');
    t.ok(['crickets', 'owl', 'shutters'].every((x) => rl.includes('sfx:' + x) && RB.audio._.sfxDefs[x]), 'Ren\'s night has its night sounds: bell crickets, an owl, wind in the shutters');
    t.ok(C.maps['kr.ridge'].npcs.some((n) => n.id === 'kr_ren_n' && n.if === 'kr_apart') && C.maps['kr.foot'].noCompanion === '!kr_apart', 'while Ren is apart, Ren waits on the ridge and walks with no one');
    for (const comp of ['nao', 'mio', 'suzu']) t.ok(cmds('kr.makeup').filter((c) => c.op === 'say' && c.if && c.if.includes('comp=' + comp)).length >= 3, comp + ': a quarrel made up in their own words');
    t.ok(ops('kr.makeup').includes('hook:co_bond kr:makeup'), 'making up is a bond event');
    t.eq([C.company.bondEvents['kr:makeup'], C.company.bondEvents['kr:night']], [1, 1], 'one point each');
    t.ok(C.company.mem.kr_ridge.texts.ren && C.company.mem.kr_ridge.keep.ren, 'the Ridge Light: Ren\'s words, and what Ren keeps of it');
    const s = camp({ comp: 'ren' });
    RB.company.award(s, 'kr:night', 1);
    t.ok(!RB.company.award(s, 'kr:night', 1), 'the bond event happens once');
  }

  // ---- the hall stays shut; すべて; the stamps; the music; the inkstone's reply --------------------------------------
  {
    const hall = C.maps['kr.hall'];
    t.ok(hall.exits.length === 1 && hall.exits[0].to === 'kr.ridge', 'the shuttered hall: no way in, only the way back to the ridge');
    t.ok(cmds('kr.hall_door').every((c) => c.op === 'say'), 'its door only says it is shut ("the hundredth was never told"); the postgame opens it (P15)');
    t.ok(ops('kr.subete').includes('set:mod_subete') && ops('kr.subete').includes('teach:mod_subete'), 'C-74: すべて, Protect covering both, taught in a story scene');
    t.ok(C.stamps['ch.kr'].stand === 'keepers' && test(camp({ flags: ['kr_done'] }), C.stamps['ch.kr'].when) && !test(camp({ edition: 1, flags: ['kr_done'] }), C.stamps['ch.kr'].when), 'the chapter stamp: twelve-chapter journeys, once the chapter is over, at the keepers\' stand');
    t.ok(['kr.shrine1', 'kr.shrine2', 'kr.shrine3'].every((id) => C.stamps[id]), 'the three shrine seals');
    t.eq(RB.audio.zoneOf(C.enemies['kr.wick'], null, 'kr.wick'), 'keepers', 'the road\'s creatures are the keepers\' zone');
    t.eq(RB.audio.battleSong(C.enemies['kr.wick']), 'battle_keepers', 'and fight to its battle theme');
    for (const song of ['keepers', 'kr_cave', 'kr_vigil', 'kr_hall', 'battle_keepers', 'boss_keepers']) t.ok(RB.audio._.songDefs[song] && RB.audio._.songDefs[song].chapter === 7, 'song: ' + song);
    const aya = C.maps['kr.kame'] && C.maps['kr.kame'].npcs.find((n) => n.id === 'kr_aya') || Object.values(C.maps).flatMap((m) => m.npcs || []).find((n) => n.id === 'kr_aya' && Array.isArray(n.talk) && n.talk.some((x) => x.scene === 'kr.inkstone_reply'));
    const ayaFirst = (s) => (aya.talk.find((x) => !x.if || test(s, x.if)) || {}).scene;
    t.ok(ayaFirst(camp({ quests: { kr_inkstone: { stage: 1 } } })) !== 'kr.inkstone_reply' && ayaFirst(camp({ flags: ['kr_done'], quests: { kr_inkstone: { stage: 1 } } })) === 'kr.inkstone_reply', 'Tsuru\'s reply waits at Aya\'s teahouse until the chapter is over');
  }

  // ---- Chapters 5–6 in twelve-chapter journeys: three more kinds each, only there ------------------------------------
  {
    const added = { 'co.shard': 'co.kiln', 'co.mole': 'co.oldworks', 'co.imp': 'co.upper', 'sb.bat': 'sb.obs_gallery', 'sb.hare': 'sb.obs_path', 'sb.starling': 'sb.obs_charts' };
    for (const [id, map] of Object.entries(added)) {
      const f = C.maps[map].foes.find((x) => x.enemy === id);
      t.ok(f && f.if === 'ed>=2' && test(camp({}), f.if) && !test(camp({ edition: 1 }), f.if), id + ': met in ' + map + ', twelve-chapter journeys only');
      t.ok(C.enemies[id].region === C.enemies[map.startsWith('co.') ? 'co.moth' : 'sb.fox'].region, id + ': of its region (its zone\'s music, its region\'s words)');
    }
    // a move is its kind, and the words that answer it when the creature has its own (a shroud only light clears)
    const kinds = (id) => [...new Set(C.enemies[id].pattern.map((k) => { const it = (C.enemies[id].intents || {})[k]; return k.split(':')[0] + (it && it.counters ? '[' + it.counters.join('/') + ']' : ''); }))].sort().join('+');
    const others = Object.keys(C.enemies).filter((id) => !added[id] && !/^atlas\./.test(id));
    for (const id of Object.keys(added)) t.ok(!others.some((o) => kinds(o) === kinds(id)), id + ': a combination of moves no other creature has (' + kinds(id) + ')');
    t.eq(C.enemies['sb.starling'].intents.shroud.counters, ['light'], 'the Starling Wisp\'s shroud clears for light alone');
    for (const scene of ['co2.heita_city', 'sb2.rokuta_city']) {
      const npc = Object.values(C.maps).flatMap((m) => m.npcs || []).find((n) => Array.isArray(n.talk) && n.talk.some((x) => x.scene === scene));
      const entry = npc.talk.find((x) => x.scene === scene);
      t.ok(/ed>=2/.test(entry.if) && !test(camp({ edition: 1, flags: ['mb2_done'] }), entry.if) && test(camp({ flags: ['mb2_done'] }), entry.if), scene + ': a changed-world line, twelve-chapter journeys only, once');
    }
  }
};
