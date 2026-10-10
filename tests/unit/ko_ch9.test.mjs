// Kotonoha, Chapter 9 (expansion P11; docs/future/work/P11_SEA.md): Lanternfall's end in a twelve-chapter journey
// (the Archive's road in mist until Steamhollow, a letter from Saltglass instead; the six-chapter game unchanged);
// Tetsu's ferry west; the chapter beginning on the jetty whoever arrives first; leaf returning (every leaf has a place
// it was lost, a task at four profiles that asks where, and a line back on the mainland once it is home); the
// exhibition's panels (no wrong version, each pick explained) and the shells' who-said-what-to-whom; the Root Hollows,
// where restoring the leaves' words reshapes the passages and the tide separates you from your companion (and the way
// round always comes back); the Gardener, ended by sorting the leaves, never by Unravel; the island's music; and its
// creatures, met only in twelve-chapter journeys.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter, T = RB.tellings, H = RB.shells;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const camp = (o = {}) => {
    const s = RB.state.newCampaign({ edition: o.edition == null ? 2 : o.edition });
    s.id = o.id || 'ko-test'; s.comp = o.comp === undefined ? 'ren' : o.comp;
    s.words = (o.words || ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu', 'ishi', 'tsuchi', 'koori', 'honoo', 'suzu', 'koe']).slice();
    for (const f of o.flags || []) s.flags[f] = true;
    Object.assign(s.quests, o.quests || {});
    Object.assign(s.inv, o.inv || {});
    s.vars = Object.assign({}, o.vars || {});
    RB.game.s = s;
    return s;
  };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const test = (s, cond) => RB.state.test(s, cond);
  const cmds = (id) => (C.scenes[id] ? C.scenes[id].cmds : []);
  const ops = (id) => cmds(id).map((c) => c.op + ':' + (c.args || []).join(' '));
  const PROF = ['F', 'E', 'I', 'A'];

  // ---- the chapter's frame ----------------------------------------------------------------------------------------
  const koMaps = Object.keys(C.maps).filter((id) => /^ko\./.test(id));
  t.ok(koMaps.length >= 13 && koMaps.every((id) => C.maps[id].edition === 2), 'Chapter 9\'s ' + koMaps.length + ' maps are all the twelve-chapter edition\'s');
  t.eq(C.quests.ko_main.stages.length, 8, 'the main story has eight steps');
  t.ok(C.quests.ko_main.chapter === 'ko' && C.places.kotonoha.edition === 2, 'the main story is Chapter 9\'s; the island is on the twelve-chapter chart only');
  t.ok(ops('ko.begin').includes('chapter:ko') && ops('ko.begin').includes('quest:ko_main 1') && ops('ko.begin').includes('set:ko_ch9'), 'the chapter begins on the jetty (ko.begin)');
  t.ok(ops('ko.end').includes('set:ko_done') && ops('ko.end').includes('quest:ko_main done'), 'and ends with ko_done');
  t.ok(ops('ko.arayuru').includes('set:mod_arayuru') && ops('ko.arayuru').includes('teach:mod_arayuru') && ops('ko.otoha_tellings').includes('call:ko.arayuru'), 'C-74: あらゆる, Protect against any kind of move, taught in a story scene before the Root Hollows');

  // ---- Lanternfall's end: twelve chapters go to sea, six go up the mountain ------------------------------------------
  {
    const yae = cmds('lf.yae_after');
    t.ok(yae.some((c) => c.op === 'call' && c.args[0] === 'ko.call' && c.if === 'ed>=2'), 'twelve chapters: the council ends with the letter from Saltglass');
    t.ok(yae.some((c) => c.op === 'toast' && c.if === 'ed<2') && yae.some((c) => c.op === 'journal' && c.if === 'ed<2'), 'six chapters: the Archive road\'s journal and notice, as before');
    t.ok(ops('ko.call').includes('quest:ko_main 0') && ops('ko.call').includes('give:ko_leaf_lf quiet'), 'the letter starts Chapter 9\'s quest and brings the はんたい leaf');
    const north = (s) => C.maps['lf.road'].exits.filter((e) => e.to === 'sa.road' && test(s, e.if || '')).length;
    t.eq(north(camp({ edition: 1, flags: ['ch5_done'] })), 1, 'six chapters: the north fork opens at Lanternfall\'s end');
    t.eq(north(camp({ flags: ['ch5_done'] })), 0, 'twelve chapters: not yet');
    t.eq(north(camp({ flags: ['ch5_done', 'yn_done'] })), 1, 'twelve chapters: once Steamhollow is behind the party');
    const trig = (s) => C.maps['lf.road'].triggers.filter((x) => x.y === 1 && test(s, x.if || '')).map((x) => x.scene);
    t.eq(trig(camp({ edition: 1 })), ['lf.road_north_locked'], 'six chapters: the old mist before the council');
    t.eq(trig(camp({ edition: 1, flags: ['ch5_done'] })), [], 'six chapters: nothing after');
    t.eq(trig(camp({ flags: ['ch5_done'] })), ['lf2.road_north_mist'], 'twelve chapters: the mist stays above the fork');
  }

  // ---- the crossing: Tetsu's board, the jetty, the beginning whoever arrives first ------------------------------------
  {
    const tetsu = C.maps['sg.harbor'].npcs.find((n) => n.id === 'tetsu');
    const first = (s) => (tetsu.talk.find((x) => !x.if || test(s, x.if)) || {}).scene;
    t.eq(first(camp({ flags: ['ch2_done', 'mb_arrived', 'ch5_done'] })), 'ko.ferry_tetsu', 'after Lanternfall, Tetsu has the island\'s news first');
    t.eq(first(camp({ flags: ['ch2_done', 'mb_arrived', 'ch5_done', 'ko_arrived'] })), 'ko.ferry_tetsu_again', 'then the choice of boats');
    t.eq(first(camp({ edition: 1, flags: ['ch2_done', 'ch5_done'] })), 'sg.tetsu_ferry', 'six chapters: Tetsu as before');
    t.ok(ops('ko.ferry_tetsu_again').includes('call:ko.ferry_out') && ops('ko.ferry_tetsu_again').includes('call:mb.ferry_east'), 'the island or Manybridge');
    const out = cmds('ko.ferry_out');
    t.ok(out.some((c) => c.op === 'call' && c.args[0] === 'ko.begin' && c.if === 'ch5_done&!ko_ch9'), 'the ferry begins the chapter on arrival, once');
    t.ok(C.maps['ko.shore'].onEnter.some((e) => e.scene === 'ko.shore_enter' && e.if === 'ch5_done&!ko_ch9') && ops('ko.shore_enter').includes('call:ko.begin'), 'any other landing after Lanternfall begins it too');
    const road = C.roads.find((r) => r.includes('saltglass') && r.includes('kotonoha'));
    t.ok(road && road[2].sea && road[2].edition === 2 && road[2].ferry.every((id) => C.scenes[id]), 'a sea route on the chart, its scenes real');
  }

  // ---- leaf returning ---------------------------------------------------------------------------------------------------
  const LEAVES = ['rw', 'sg', 'mb', 'mp', 'co', 'sb', 'kr', 'lf'];
  {
    const ws = C.scenes['ko.windstone'];
    for (const k of LEAVES) {
      t.ok(C.items['ko_leaf_' + k] && C.items['ko_leaf_' + k].key, k + ': a leaf to carry');
      const ch = C.challenges['ko.ret_' + k];
      t.ok(ch && PROF.every((p) => ch.tiers[p] && ch.tiers[p].length), k + ': where was it lost, at all four profiles');
      for (const p of PROF) for (const step of ch.tiers[p]) if (step.kind === 'choose') t.ok(step.options.filter((x) => x.ok).length === 1 && step.options.filter((x) => !x.ok).every((x) => x.why), k + ' ' + p + ': one right place, every other one explained');
      t.ok(ws.cmds.some((c) => c.op === 'choice' && c.opts.some((o) => o.if === 'item.ko_leaf_' + k && o.to === k)), k + ': offered at the Wind Stone only while carried');
      t.ok(ops('ko.sent_' + k).includes('take:ko_leaf_' + k) && ops('ko.sent_' + k).includes('set:ko_ret_' + k), k + ': sent home, kept');
      // the place lost it, and gets it back: someone there says so, once (first, after a press reaction that is
      // waiting to be heard: src/content/zzz_press_first.js)
      const lead = (n) => n.talk.find((x) => !/^mp\.rx_/.test(x.scene || ''));
      const back = Object.values(C.maps).some((m) => (m.npcs || []).some((n) => Array.isArray(n.talk) && lead(n) && lead(n).scene === 'ko.back_' + k && lead(n).if === 'ko_ret_' + k + '&!seen.ko.back_' + k));
      t.ok(back && C.scenes['ko.back_' + k], k + ': back on the mainland, someone notices (once)');
    }
    // where each is found: a leaf is never offered twice, nor after it has gone home
    const finds = { rw: 'ko.leaf_rw', sg: 'ko.leaf_sg', co: 'ko.leaf_co', sb: 'ko.leaf_sb', kr: 'ko.leaf_kr' };
    for (const [k, sc] of Object.entries(finds)) {
      const site = Object.values(C.maps).flatMap((m) => m.props || []).find((p) => p.scene === sc);
      t.ok(site && /!item\.ko_leaf_/.test(site.if) && /!ko_ret_/.test(site.if), k + ': found once (' + site.if + ')');
    }
    t.ok(ops('ko.ao_leaf').includes('give:ko_leaf_mb') && ops('ko.otoha_first').includes('give:ko_leaf_mp'), 'Ao gives one; Otoha gives one');
    // three home in Chapter 9 moves the story on
    t.ok(cmds('ko.windstone').some((c) => c.op === 'call' && c.args[0] === 'ko.three_home' && /var\.ko_ret>=3/.test(c.if)) && ops('ko.three_home').includes('quest:ko_main 3'), 'the third leaf home brings the island\'s legend');
    // a wrong guess keeps the leaf
    t.ok(cmds('ko.windstone').slice(ws.labels.miss, ws.labels.after).every((c) => c.op !== 'take'), 'a wrong place keeps the leaf in hand, to try again');
  }

  // ---- the exhibition: no wrong version, each pick explained ----------------------------------------------------------
  {
    const d = C.tellings['ko.t_hall'];
    t.eq(d.answer.kind, 'panels', 'the hall\'s exhibition is panels');
    t.eq(d.sources.map((x) => x.id), ['otoha', 'nami', 'hamaji', 'shell'], 'four tellings: the keepers\', the boat-keepers\', the fishers\', the shells\'');
    for (const src of d.sources) t.ok(PROF.every((p) => src.text[p] || src.text.F) && C.challenges[src.read], src.id + ': its text and its reading task');
    t.ok(d.sources.find((x) => x.id === 'otoha').text.A.gloss && /Kokinshū|古今/.test(JSON.stringify(d.sources.find((x) => x.id === 'otoha').text.A)), 'the Kokinshū preface, quoted at A, glossed and labelled real');
    let combos = 0, okAll = true;
    const pick = (i, acc) => {
      if (i === d.answer.panels.length) { combos++; const r = T.judge(d, acc); if (!(r.ok && r.best)) okAll = false; return; }
      for (const k of d.answer.panels[i].picks) pick(i + 1, Object.assign({}, acc, { [d.answer.panels[i].id]: k.source }));
    };
    pick(0, {});
    t.ok(okAll && combos === 27, 'every one of the ' + combos + ' ways to hang the panels is accepted');
    t.ok(!T.judge(d, { p1: 'otoha' }).ok, 'only a full set is hung');
    t.ok(d.answer.panels.every((pn) => pn.picks.every((k) => k.why && k.why.en)), 'each pick says what showing it means');
    const s = camp();
    const r = T.judge(d, { p1: 'shell', p2: 'nami', p3: 'shell' });
    T.keep(s, 'ko.t_hall', r);
    t.ok(s.vars['tell_ko.t_hall_p1'] === 'shell' && s.vars['tell_ko.t_hall_p3'] === 'shell' && s.flags['tell_ko.t_hall_ok'], 'each panel\'s pick is kept');
    const panels = C.maps['ko.hall'].props.filter((p) => p.p === 'ko_panel' && p.x === 4);
    t.eq(panels.filter((p) => test(s, p.if)).map((p) => p.o.v), [4], 'the hall shows the chosen version on its panel');
    t.ok(cmds('ko.otoha_tellings').some((c) => c.if === 'var.tell_ko.t_hall_p3=shell'), 'Otoha notices whose words are on the third panel');
  }

  // ---- the shells: who said what, to whom ------------------------------------------------------------------------------
  {
    const d = C.shells['ko.s_first'];
    t.eq(d.frags.length, 6, 'three conches, six lines');
    t.ok(H.judge(d, H.autoPlaced(d)).ok, 'placed right, the reconstruction is done');
    const wrong = H.autoPlaced(d);
    wrong.b1 = { who: 'yoshi', to: 'chitose' };
    const r = H.judge(d, wrong);
    t.ok(!r.ok && !r.frags.b1.ok && r.frags.a1.ok, 'a wrong placing is caught line by line, the rest kept');
    t.ok(d.frags.every((f) => f.cue && f.cue.en && f.comic && f.comic.en), 'every line has its clue and its wrong-way reading');
    t.ok(d.frags.some((f) => f.to === 'ano') && d.people.some((p) => p.id === 'ano'), 'one line is to someone who was never there');
    t.ok(C.challenges[d.read] && PROF.every((p) => C.challenges[d.read].tiers[p]), 'and a reading task about the same lines (the evidence)');
    t.ok(['ko.shell_a', 'ko.shell_b', 'ko.shell_c'].every((id) => ops(id).includes('call:ko.shells_check')), 'each conch can be heard, read and listened to on its own');
    t.ok(ops('ko.shells_check').includes('hook:shells ko.s_first') && ops('ko.shells_check').includes('set:ko_tell_shell'), 'all three heard: put it together; the fourth telling');
  }

  // ---- the Root Hollows: words as keys, the separation, the way round -------------------------------------------------
  {
    t.ok(ops('ko.otoha_tellings').includes('set:ko_hollow_open') && ops('ko.otoha_tellings').includes('quest:ko_main 4'), 'Otoha opens the hollow once the exhibition hangs');
    const crownExit = C.maps['ko.crown'].exits.find((e) => e.to === 'ko.roots1');
    t.eq(crownExit.if, 'ko_hollow_open', 'the hollow opens only then');
    for (const [k, sc] of [['a', 'ko.root_leaf_a'], ['b', 'ko.root_leaf_b'], ['c', 'ko.root_leaf_c']]) {
      t.ok(ops(sc).includes('challenge:ko.root_' + k) && ops(sc).includes('set:ko_root_' + k), k + ': an unsaid word restored, the roots move');
      t.ok(PROF.every((p) => C.challenges['ko.root_' + k].tiers[p]), k + ': at all four profiles');
    }
    const r1 = C.maps['ko.roots1'];
    t.ok(r1.exits.find((e) => e.to === 'ko.roots2').if === 'ko_root_a' && r1.props.some((p) => p.p === 'ko_rootarch' && p.if === '!ko_root_a'), 'the first word opens the way down');
    t.ok(r1.props.some((p) => p.p === 'bench' && p.scene === 'ko.roots_rest') && ops('ko.roots_rest').includes('checkpoint:'), 'a place to rest (the checkpoint)');
    const r2 = C.maps['ko.roots2'];
    const split = r2.triggers.find((x) => x.scene === 'ko.tide_split');
    t.ok(split && split.if === 'ko_ch9&!ko_tide_in', 'the tide comes in once, in Chapter 9');
    t.ok(ops('ko.tide_split').includes('set:ko_apart') && ops('ko.tide_split').includes('quest:ko_main 5'), 'it leaves your companion on the far bank');
    t.ok(r2.noCompanion === '!ko_apart' && C.maps['ko.roots3'].noCompanion === '!ko_apart', 'while apart, you go on alone');
    const flooded = r2.props.filter((p) => p.p === 'water');
    t.ok(flooded.length === 6 && flooded.every((p) => p.if === 'ko_tide_in&!ko_root_c'), 'the bridge stays under water until the hollows are reshaped');
    // the way round: from the south bank, only west; it always leads back
    const s = camp({ flags: ['ko_ch9', 'ko_tide_in', 'ko_apart'] });
    const out2 = r2.exits.filter((e) => test(s, e.if || '')).map((e) => e.to + ':' + e.y);
    t.ok(out2.includes('ko.roots3:18'), 'the way round opens to the west');
    const back = C.maps['ko.roots3'].exits.find((e) => e.sp === 'from_round');
    t.eq(back.if, 'ko_root_c', 'the long way round comes back up once its last word is restored');
    t.ok(r2.exits.find((e) => e.to === 'ko.garden').if === 'ko_root_c' && r2.props.some((p) => p.p === 'ko_rootarch' && p.if === '!ko_root_c'), 'the same word parts the roots before the garden (connected)');
    const reunion = r2.triggers.find((x) => x.scene === 'ko.reunion');
    t.ok(reunion && reunion.if === 'ko_apart&ko_root_c' && ops('ko.reunion').includes('unset:ko_apart') && ops('ko.reunion').includes('quest:ko_main 6'), 'the reunion, on the far bank');
    for (const c of ['nao', 'mio', 'ren', 'suzu']) {
      t.ok(cmds('ko.tide_split').some((x) => x.op === 'say' && x.if === 'comp=' + c), c + ': a line across the water');
      t.ok(cmds('ko.reunion').filter((x) => x.op === 'say' && x.if === 'comp=' + c).length >= 2, c + ': their own reunion');
    }
    t.ok(!cmds('ko.tide_split').some((x) => x.op === 'say' && /warning|danger|careful|fail/i.test(x.en || '')), 'calm lines, never a warning');
  }

  // ---- the Gardener: ended by sorting the leaves, never by Unravel ----------------------------------------------------
  {
    const enc = C.encounters['ko.gardener'];
    t.ok(enc.kind === 'social' && enc.social.unravelTip && enc.lead.enemy === 'ko.gardener', 'a social and folklore encounter');
    const s = camp();
    const st = E.begin('ko.gardener', s);
    for (let i = 0; i < 6 && !st.over; i++) E.exchange(st, { card: E.cards(st, s, wordsOf(s)).find((c) => c.kind === 'unravel'), res: OK, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });
    t.ok(!st.over, 'Unravel, again and again, never ends it (C-09)');
    const reached = new Set(), seen = new Set();
    const explore = (plan, depth) => {
      const s2 = camp();
      const x = E.begin('ko.gardener', s2);
      for (const [id, ca] of plan) { if (x.over) break; E.exchange(x, { card: E.cards(x, s2, wordsOf(s2)).find((c) => c.id === id), res: OK, comp: ca ? { act: ca } : null, target: x.cur }, { enemy: x.foes[0] && x.foes[0].def }); }
      if (x.over) { reached.add(x.enc.outcome); return; }
      const key = E.stateKey(x) + x.round + JSON.stringify(x.compUses || {});
      if (seen.has(key) || depth > 9) return;
      seen.add(key);
      const acts = [null].concat((enc.social.companion[s2.comp] || []).filter((a) => !(x.compUses || {})[a.id]).map((a) => a.id));
      for (const c of E.cards(x, s2, wordsOf(s2))) if (!c.disabled && c.kind !== 'unravel') for (const ca of acts) explore(plan.concat([[c.id, ca]]), depth + 1);
    };
    explore([], 0);
    t.eq(enc.conclusions.map((c) => c.id).filter((id) => !reached.has(id)), [], 'every end of the garden is reachable (' + [...reached].join(', ') + ')');
    t.ok(ops('ko.gardener').includes('encounter:ko.gardener') && ops('ko.gardener').includes('quest:ko_main 7'), 'after it, Otoha');
    t.eq(RB.audio.battleSong(C.enemies['ko.gardener']), 'boss_ko', 'its own boss theme');
  }

  // ---- the island's three phases: nobody talks about what hasn't happened yet ------------------------------------------
  {
    const village = C.maps['ko.village'];
    for (const n of village.npcs) {
      const lines = n.talk.map((x) => x.scene);
      t.ok(lines.some((sc) => /_post$/.test(sc)) && lines.some((sc) => /_early$/.test(sc)), n.id + ': an early visit\'s lines and the postgame\'s');
    }
    const early = camp({ flags: ['ch4_done', 'ko_arrived'] });
    for (const n of village.npcs) {
      if (n.if && !test(early, n.if)) continue;
      const sc = (n.talk.find((x) => !x.if || test(early, x.if)) || {}).scene;
      t.ok(/_early$/.test(sc), n.id + ': in an early visit, the early lines (' + sc + ')');
    }
    t.ok(C.maps['ko.terraces'].exits.find((e) => e.to === 'ko.crown').if === 'ko_ch9|post' && C.maps['ko.terraces'].triggers.some((x) => x.scene === 'ko.rope_early'), 'an early visit stops at the lower terraces (Otoha opens the crown)');
  }

  // ---- music and creatures ---------------------------------------------------------------------------------------------
  {
    for (const song of ['kotonoha', 'ko_roots', 'ko_garden', 'battle_ko', 'boss_ko']) t.ok(RB.audio._.songDefs[song] && RB.audio._.songDefs[song].chapter === 9, song + ': Chapter 9\'s');
    t.eq(RB.audio.zoneOf(C.enemies['ko.leafling'], null, 'ko.leafling'), 'kotonoha', 'the island\'s creatures are the island\'s zone');
    const kinds = ['ko.leafling', 'ko.jelly', 'ko.mirror', 'ko.echo', 'ko.sandlantern'];
    for (const id of kinds) t.ok(C.enemies[id] && Object.values(C.maps).some((m) => /^ko\./.test(m.id || '') || true) && Object.entries(C.maps).some(([mid, m]) => /^ko\./.test(mid) && (m.foes || []).some((f) => f.enemy === id)), id + ': met on the island');
    const sig = kinds.map((id) => (C.enemies[id].pattern || []).slice().sort().join('+'));
    t.eq(new Set(sig).size, kinds.length, 'five kinds, five different ways to fight');
    for (const w of ['ko.wander_ao', 'ko.wander_kihei']) t.ok(C.encounters[w] && C.encounters[w].actors.some((a) => a.side === 'guest'), w + ': a wanderer who stands with you (E3)');
  }
};
