// The last chapter in a twelve-chapter journey (expansion P14; docs/future/work/P14_INTEGRATION.md), with synthetic
// campaigns only, scenes played through the real scene runner with the dialogue stubbed. What this covers:
//  - the heavier approach: colour drained map by map before the Hush is settled (the Last Lamp Hut kept warm), the
//    name slips drifting on the road and at the camp, the score thinning (the road thinned, then the drone), none of it
//    in a six-chapter journey or once the Hush is settled;
//  - the hushed voice at the gate: once, right after the gate's first sight, with a companion; the name called among
//    look-alikes at every profile; the voice back; never in a six-chapter journey;
//  - the four arcs' endings inside the companion's ending, only in a twelve-chapter journey, each true to what the
//    journey holds (the crossroads kept or not); Nao's forwarding address chosen by the player;
//  - the ending's romance moment: offered only when the bond is close, three answers, the Bond the same whichever;
//  - the New Game+ farewell: each companion's unfinished work, a solo version, the road folding back, the memories.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;

  let lines = [], menus = [], chooser = () => 0, asked = [], answer = () => true;
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async (opts) => { menus.push(opts.map((o) => o.en)); const i = chooser(opts); return i < 0 ? 0 : i; };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.challenge.run = async (id) => { asked.push(id); return { ok: answer(id) }; };
  const songs = [];
  if (RB.audio) { RB.audio.playSong = (id) => { songs.push(id); }; RB.audio.stopSong = () => { songs.push('-'); }; }
  const pickEn = (...words) => (opts) => { for (const w of words) { const i = opts.findIndex((o) => (o.en || '').indexOf(w) >= 0); if (i >= 0) return i; } return 0; };
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: o.edition == null ? 2 : o.edition });
    s.id = 'sa2-test'; s.map = o.map || 'sa.gate'; s.comp = o.comp === undefined ? 'nao' : o.comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    Object.assign(s.flags, { departed: true, cr_done: true, yn_done: true, sa_arrived: true });
    for (const f of o.flags || []) s.flags[f] = true;
    if (o.bond != null) s.company.bond = { test: o.bond };
    RB.game.G.s = s;
    return s;
  };
  const run = async (id, o = {}) => { lines = []; menus = []; asked = []; songs.length = 0; chooser = o.pick || (() => 0); answer = o.answer || (() => true); await RB.script.run(id); return lines; };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const test = (s, c) => S.test(s, c);
  const amb = (id) => C.maps[id].ambient;
  const songOf = (s, id) => RB.world.musicFor(C.maps[id], s);

  // ---- the heavier approach ------------------------------------------------------------------------------------------
  {
    const order = ['sa.road', 'sa.camp', 'sa.gate', 'sa.reading', 'sa.stacks', 'sa.conduits', 'sa.study', 'sa.heart'];
    fresh();
    const lv = order.map((id) => amb(id).drain);
    t.ok(lv.every((v, i) => v > 0 && (i === 0 || v > lv[i - 1])), 'twelve-chapter journey, before the Hush is settled: colour drains map by map up the road and into the Archive (' + lv.join(', ') + ')');
    t.ok(amb('sa.memories').drain > 0 && !amb('sa.hut').drain, 'the Room of Set-Down Memories drained too; the Last Lamp Hut keeps its warmth');
    t.ok(amb('sa.road').weather === 'names' && amb('sa.camp').weather === 'names', 'name slips drifting uphill on the road and at the camp');
    t.eq([songOf(RB.game.G.s, 'sa.road'), songOf(RB.game.G.s, 'sa.gate'), songOf(RB.game.G.s, 'sa.reading')], ['sa_thin', 'sa_drone', 'sa_drone'], 'the score thins: the road\'s tune thinned, then the drone at the gate and in the Reading Room');
    t.ok(RB.audio._.songDefs.sa_thin && RB.audio._.songDefs.sa_drone && RB.audio._.songDefs.sa_drone.motifs.includes('road'), 'the drone keeps the road motif (the main theme) under it');
    const s1 = fresh({ edition: 1 });
    t.ok(order.every((id) => !amb(id).drain) && amb('sa.road').weather === 'pages' && songOf(s1, 'sa.road') === 'sa_road' && songOf(s1, 'sa.gate') === 'still_archive', 'a six-chapter journey: nothing new (no drain, the pages, the Archive road\'s own song)');
    const s3 = fresh({ flags: ['sa_hush_down'] });
    t.ok(order.every((id) => !amb(id).drain) && amb('sa.road').weather === 'motes' && songOf(s3, 'sa.road') === 'sa_road_home', 'once the Hush is settled, the colour is back and the road home plays');
  }

  // ---- the hushed voice ----------------------------------------------------------------------------------------------
  {
    const ev = (s) => (C.maps['sa.gate'].onEnter || []).find((x) => x.scene === 'sa2.hushed');
    const s = fresh({ comp: 'mio' });
    t.ok(ev(s) && !test(s, ev(s).if), 'the hushed voice waits for the gate\'s first sight');
    s.seen['sa.gate_first'] = true;
    t.ok(test(s, ev(s).if), 'then plays at the gate');
    t.ok(!test(Object.assign(fresh({ edition: 1, comp: 'mio' }), {}), ev(s).if), 'never in a six-chapter journey');
    const so = fresh({ comp: null }); so.seen['sa.gate_first'] = true;
    t.ok(!test(so, ev(so).if), 'never without a companion (nobody to hush)');
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
      const sc = fresh({ comp }); sc.seen['sa.gate_first'] = true;
      let tries = 0;
      await run('sa2.hushed', { answer: () => (++tries > 1) });
      t.ok(asked.length === 2 && asked.every((a) => a === 'sa2.name_' + comp) && sc.flags.sa2_voice_back, comp + ': a wrong name is asked again, gently; the right one brings the voice back');
      t.ok(songs[0] === '-' && songs[songs.length - 1] === 'sa_drone' && lines.some((l) => l.who === comp && l.jp === '……') && lines.some((l) => l.who === comp && l.jp.length > 8), comp + ': the music stops, their line is silence, then their own voice again, and the drone returns');
      t.ok(!test(sc, (C.maps['sa.gate'].onEnter || []).find((x) => x.scene === 'sa2.hushed').if), comp + ': once only');
      const ch = C.challenges['sa2.name_' + comp];
      t.ok(['F', 'E', 'I', 'A'].every((p) => ch.tiers[p][0].options.filter((o) => o.ok).length === 1 && ch.tiers[p][0].options.length >= 2), comp + ': the name among look-alikes at every profile, one right');
    }
  }

  // ---- the arcs' endings, inside the companion's ending ---------------------------------------------------------------
  const ending = async (comp, o = {}) => { const s = fresh(Object.assign({ comp, map: 'rw.village' }, o)); await run('end.' + comp + '.c', { pick: o.pick }); return s; };
  {
    let s = await ending('nao', { flags: ['cr_nao_crossroads'], pick: pickEn('Kirishita') });
    t.ok(has(/forwarding address/) && has(/Sakichi told me/) && has(/shelf for me at Sakichi/) && s.company.talk && s.company.talk['d.nao_address'] && s.company.talk['d.nao_address'].v === 'station', 'Nao: a forwarding address, the first; Sakichi\'s word; the player chooses where (Kirishita)');
    s = await ending('nao', { pick: pickEn('Wherever you are') });
    t.ok(!has(/Sakichi told me/) && has(/I know it/) && s.company.talk['d.nao_address'].v === 'you', 'Nao without the Cloudroad crossroads: no Sakichi; "wherever you are"');
    s = await ending('mio', { flags: ['yn_mio_back'] });
    t.ok(has(/copied Kikue's labels/) && has(/one jar with no label/) && has(/I answered it/), 'Mio: honest labels like Kikue\'s, and the jar with none; the oldest scrap answered');
    s = await ending('mio');
    t.ok(!has(/Kikue/) && has(/answer all of them/), 'Mio without Steamhollow\'s night: no Kikue, the answers still to come');
    s = await ending('ren', { flags: ['kr_ren_crossroads'] });
    t.ok(has(/My answer to Hisae/) && has(/keeper who walks the road/) && has(/ask the relay/), 'Ren: the answer to Hisae, a keeper who walks the road; the relay to carry it');
    s = await ending('suzu', { flags: ['yn_suzu_books'] });
    t.ok(has(/letter from Koume/) && has(/Playhouse Row/) && has(/my partner/), 'Suzu: Koume\'s letter, the opening night in Playhouse Row, her partner');
    s = await ending('suzu');
    t.ok(!has(/Koume/) && has(/knows how to laugh/), 'Suzu without the troupe\'s books: no Koume');
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
      await ending(comp, { edition: 1 });
      t.ok(!lines.some((l) => /forwarding address|jar with no label|answer to Hisae|letter to Hisae|opening night|Opening night/.test(l.en)) && !menus.length, comp + ': a six-chapter journey\'s ending is as it was');
    }
  }

  // ---- the romance moment --------------------------------------------------------------------------------------------
  {
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
      await ending(comp, { bond: 2 });
      t.ok(!menus.some((m) => m.includes('A kiss')), comp + ': with the bond not yet close, no romance moment is offered');
      const scores = [];
      for (const [pick, re] of [['Hold hands', /hold hands until the sun/], ['A kiss', /A brief kiss/], ['closest of friends', /Side by side, you watch/]]) {
        const s = await ending(comp, { bond: 8, pick: pickEn(pick, 'Kirishita') });
        t.ok(menus.some((m) => m.length === 3 && m.includes('A kiss')) && has(re), comp + ': close: the moment offered; "' + pick + '" answered warmly');
        scores.push(RB.company.score(s));
      }
      t.ok(scores.every((x) => x === scores[0]), comp + ': the Bond the same whichever is chosen (' + scores.join(', ') + ')');
    }
  }

  // ---- chronology: the last chapter's road opens after Steamhollow in a twelve-chapter journey (S1) ------------------------
  {
    const ex = (C.maps['lf.road'].exits || []).find((x) => x.to === 'sa.road');
    const at = (ed, flags) => { const s = fresh({ edition: ed, flags }); for (const f of ['yn_done', 'cr_done']) if (!flags.includes(f)) delete s.flags[f]; return test(s, ex.if); };
    t.ok(!at(2, ['ch5_done', 'ko_done']) && !at(2, ['ch5_done', 'ko_done', 'cr_done']) && at(2, ['ch5_done', 'ko_done', 'cr_done', 'yn_done']), 'twelve chapters: the road above Lanternfall to the Archive opens only once Steamhollow is done');
    t.ok(at(1, ['ch5_done']), 'six chapters: it opens after Lanternfall, as it always has');
    const north = (C.maps['yn.north'].exits || []).find((x) => x.to === 'sa.road');
    t.ok(north && north.sp === 'from_prev' && C.maps['sa.road'].onEnter.some((x) => x.scene === 'sa.arrive'), 'and from Steamhollow\'s north road the last chapter opens as it always has');
  }

  // ---- the taught tools at the end: the modifier words taught across the chapters, in the last chapter's battles --------
  {
    const taught = ['subete', 'ikutsuka', 'arayuru', 'goto', 'zentai'];
    const s = fresh({ flags: taught.map((m) => 'mod_' + m) });
    const rules = RB.encounter.ordinaryRules(s), k = RB.modifiers.known({ rules }, s);
    t.ok(rules.modifiers && taught.every((m) => k.includes(m)), 'a twelve-chapter journey\'s battles at the end offer every modifier the chapters taught (' + k.join(', ') + ')');
    const s1 = fresh({ edition: 1, flags: taught.map((m) => 'mod_' + m) });
    t.ok(!RB.encounter.ordinaryRules(s1).modifiers, 'a six-chapter journey\'s battles are as they were');
  }

  // ---- return links: every place on the twelve-chapter chart connected again once the story is done --------------------
  {
    const s = fresh({ flags: ['ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_done', 'cr_called', 'yn_called', 'ch6_done', 'postgame', 'sa_hush_down'] });
    const places = Object.keys(C.places).filter((id) => !C.places[id].edition || C.places[id].edition <= 2);
    const adj = {};
    for (const [a, b, o] of C.roads) { if (o && o.edition > 2) continue; if (o && o.if && !test(s, o.if)) continue; (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); }
    const seen = new Set(['reedwake']), st = ['reedwake'];
    while (st.length) { const x = st.pop(); for (const y of adj[x] || []) if (!seen.has(y)) { seen.add(y); st.push(y); } }
    t.eq(places.filter((id) => !seen.has(id)), [], 'after the story every place on the chart (' + places.length + ') is connected to Reedwake by its roads: nothing needs the boat');
  }

  // ---- the New Game+ farewell ----------------------------------------------------------------------------------------
  {
    const F = C.ngFarewell;
    t.ok(['nao', 'mio', 'ren', 'suzu'].every((c) => F[c].length === 4 && F[c].every((l) => l.who === c)), 'four lines each, in the companion\'s own voice');
    t.ok(/letters in the satchel/.test(F.nao[1].en) && /without labels/.test(F.mio[1].en) && /lamps whose names/.test(F.ren[1].en) && /script still isn't finished/.test(F.suzu[1].en), 'each names their own unfinished work (S13)');
    t.ok(F.solo && F.solo.length >= 1 && F.solo.every((l) => l.who === 'narr'), 'a solo version for a journey ended before a companion was chosen');
    const end = [].concat(C.ngFarewellEnd);
    t.ok(/folds back on itself/.test(end[0].en) && /come with you/.test(end[1].en) && /new journey begins/.test(end[2].en), 'then the road folds back to the morning in Reedwake, the memories come along, and a new journey begins');
  }
};
