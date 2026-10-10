// Kotonoha's side stories and companions (expansion P11f; docs/future/work/P11_SEA.md), played through the real scene
// runner with the dialogue stubbed (lines collected, choices picked by the test, language tasks answered right or
// wrong by the test). Synthetic campaigns only. What this covers:
//  - the five side stories end to end: Ao's three lessons and the leaf he reads in the hall; Kihei's letter, Hatsu,
//    and each of its three lasting ends (each shown before it is chosen, "think again" always possible, and the world
//    after each); the leaf with your name for each background, answered from the Wind Stone; the census; the tide
//    calendar and the night the leaves rise; a wrong answer never loses progress;
//  - the companions' moments: each once, each adds Bond once (ko:beat); Ren's three lanterns relit only by Ren; Suzu's
//    stage told the way the exhibition hangs;
//  - the island's rumour on the mainland: where, when, once; Nami's answer only after hearing one;
//  - the records: the island's stamps and stand; none of it gates the main story.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;

  // ---- a minimal stage: the real runner, with dialogue collected, choices picked and tasks answered ----------------
  let lines = [], menus = [], chooser = () => 0, answer = () => true, asked = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async (opts) => { menus.push(opts.map((o) => o.en)); const i = chooser(opts); return i < 0 ? 0 : i; };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.challenge.run = async (id) => { asked.push(id); return { ok: answer(id) }; };
  const pickEn = (...words) => (opts) => { for (const w of words) { const i = opts.findIndex((o) => (o.en || '').indexOf(w) >= 0); if (i >= 0) return i; } return 0; };
  const seq = (...fns) => { let k = 0; return (opts) => (fns[Math.min(k++, fns.length - 1)])(opts); };
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: 2 });
    s.id = 'ko-side'; s.map = 'ko.village'; s.comp = o.comp === undefined ? 'ren' : o.comp;
    s.player.bg = o.bg || 'courier'; s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_arrived: true, ko_ch9: true, ko_otoha_met: true }, o.flags || {});
    s.quests.ko_main = { stage: o.main == null ? 3 : o.main, done: false };
    Object.assign(s.inv, o.inv || {});
    s.vars = Object.assign({}, o.vars || {});
    RB.game.G.s = s;
    return s;
  };
  const run = async (id, o = {}) => { lines = []; menus = []; asked = []; chooser = o.pick || (() => 0); answer = o.answer || (() => true); await RB.script.run(id); return lines; };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const test = (s, cond) => S.test(s, cond);
  const qs = (s, id) => (s.quests[id] ? (s.quests[id].done ? 'done' : s.quests[id].stage) : null);
  const npc = (map, id) => (C.maps[map].npcs || []).find((n) => n.id === id);
  // whom a talk resolves to, as the world does: the first entry whose condition holds
  const talkTo = (s, map, id) => { const n = npc(map, id); const tk = typeof n.talk === 'string' ? [{ scene: n.talk }] : n.talk; const e = tk.find((x) => !x.if || test(s, x.if)); return e && e.scene; };
  const shown = (s, map, id) => { const n = npc(map, id); return !!n && (!n.if || test(s, n.if)); };
  const bonds = (s) => Object.keys((s.company && s.company.bond) || {}).filter((k) => /^ko:/.test(k));
  const sideScenes = Object.keys(C.scenes).filter((id) => /^ko\.(ao_ask|ao_lesson|ao_reads|kihei_|mitsu_hatsu|mitsu_letter|myname_|census_|basket_|tide_(?!split)|moon_|nao_letter|mio_labels|toro_|ren_toro|suzu_|rumour)/.test(id));

  // ---- the frame ---------------------------------------------------------------------------------------------------
  const side = ['ko_ao', 'ko_kihei', 'ko_myname', 'ko_census', 'ko_tide'];
  t.ok(side.every((q) => C.quests[q] && C.quests[q].chapter === 'ko' && !C.quests[q].main), 'five side stories on the island, none of them the main story');
  t.ok(sideScenes.length >= 30 && sideScenes.every((id) => C.scenes[id].cmds.every((c) => !(c.op === 'quest' && c.args[0] === 'ko_main'))), 'no side story moves the main story (' + sideScenes.length + ' scenes)');
  t.eq((C.scriptErrors || []).filter((e) => /ko\/|ko\./.test(e)), [], 'the island\'s scenes parse');

  // ---- The Apprentice Who Cannot Read ------------------------------------------------------------------------------
  {
    const s = fresh({ flags: { ko_ao_helped: true } });
    t.eq(talkTo(s, 'ko.village', 'ko_ao'), 'ko.ao_ask', 'Ao asks once the Leafling is chased off his basket');
    await run('ko.ao_ask');
    t.eq(qs(s, 'ko_ao'), 0, 'the lessons begin');
    await run('ko.ao_lesson', { answer: () => false });
    t.ok(qs(s, 'ko_ao') === 0 && !s.vars.ko_ao_l && has(/That'll do for today/), 'a wrong explanation costs nothing: the lesson waits');
    const order = [];
    for (let i = 0; i < 3; i++) { t.eq(talkTo(s, 'ko.village', 'ko_ao'), 'ko.ao_lesson', 'lesson ' + (i + 1) + ' by his basket'); await run('ko.ao_lesson'); order.push(asked[0]); }
    t.eq(order, ['ko.ao_teach1', 'ko.ao_teach2', 'ko.ao_teach3'], 'three lessons in order: ね and れ, は said わ, the small letters');
    t.eq(qs(s, 'ko_ao'), 1, 'then he means to read in the hall');
    t.ok(!shown(s, 'ko.village', 'ko_ao') && shown(s, 'ko.hall', 'ko_ao_hall'), 'Ao waits in the hall, not on the path');
    await run('ko.ao_reads');
    t.ok(qs(s, 'ko_ao') === 'done' && s.flags.ko_ao_reads && has(/my name/), 'he reads the leaf: his own name');
    t.ok(shown(s, 'ko.village', 'ko_ao') && !shown(s, 'ko.hall', 'ko_ao_hall'), 'and is back by his basket');
    s.flags.ko_done = true;
    await run('ko.yoshino_after');
    t.ok(has(/very back and reads louder/) && !has(/outside the window/), 'afterwards Yoshino says he sits at the back');
    const s2 = fresh({ flags: { ko_done: true } });
    await run('ko.yoshino_after');
    t.ok(has(/outside the window/), 'without the lessons he still listens from outside');
    void s2;
  }

  // ---- The Sailor's Last Letter ------------------------------------------------------------------------------------
  {
    const s = fresh({ flags: { ko_kihei_met: true, ko_lowtide: true } });
    t.ok(shown(s, 'ko.tidepools', 'ko_kihei') && talkTo(s, 'ko.tidepools', 'ko_kihei') === 'ko.kihei_ask', 'Kihei waits at the tide pools once met');
    await run('ko.kihei_ask');
    t.eq(qs(s, 'ko_kihei'), 0, 'he asks after his letter');
    const leaf = C.maps['ko.seacave'].props.find((p) => p.scene === 'ko.kihei_letter');
    t.ok(leaf && test(s, leaf.if), 'the letter lies in the sea cave (reached at low tide)');
    await run('ko.kihei_letter', { answer: () => false });
    t.ok(qs(s, 'ko_kihei') === 0 && !s.inv.ko_kihei_letter, 'misread, it stays where it is, to read again');
    await run('ko.kihei_letter');
    t.ok(qs(s, 'ko_kihei') === 1 && s.inv.ko_kihei_letter && !test(s, leaf.if), 'read right: who wrote it, to whom; it is taken');
    t.eq(talkTo(s, 'ko.lodge', 'ko_mitsu'), 'ko.mitsu_hatsu', 'Mitsu knows the name');
    await run('ko.mitsu_hatsu');
    t.ok(qs(s, 'ko_kihei') === 2 && has(/grandmother/) && has(/never once shut/), 'Hatsu was her grandmother, who kept the door open');
    const base = JSON.stringify(s);
    const ends = { mitsu: ['Give it to Mitsu', 'Give it to her', 'ko_kihei_mitsu'], wind: ['Send it on the wind', 'Send it.', 'ko_kihei_wind'], kept: ['Give it back to Kihei', 'Give it back.', 'ko_kihei_kept'] };
    for (const [k, [first, confirm, flag]] of Object.entries(ends)) {
      const st = RB.save.migrate(JSON.parse(base)); RB.game.G.s = st;
      // the end is shown, and can be taken back, before it is chosen
      await run('ko.kihei_choose', { pick: seq(pickEn(first), pickEn('Think again'), pickEn('Not now')) });
      t.ok(qs(st, 'ko_kihei') === 2 && st.inv.ko_kihei_letter && Object.values(ends).every((e) => !st.flags[e[2]]), k + ': shown, then "think again": nothing changes');
      t.ok(lines.some((l) => /^\(/.test(l.en)), k + ': the lasting end is described before it is chosen');
      await run('ko.kihei_choose', { pick: seq(pickEn(first), pickEn(confirm)) });
      t.ok(qs(st, 'ko_kihei') === 'done' && st.flags[flag] && !st.inv.ko_kihei_letter && Object.values(ends).filter((e) => st.flags[e[2]]).length === 1, k + ': chosen, it lasts, and it is the only end');
      t.eq(shown(st, 'ko.tidepools', 'ko_kihei'), k === 'kept', k + ': Kihei ' + (k === 'kept' ? 'stays by the pools' : 'is gone'));
      const frame = C.maps['ko.lodge'].props.find((p) => p.p === 'ko_frame');
      t.eq(test(st, frame.if), k === 'mitsu', k + ': the letter ' + (k === 'mitsu' ? 'hangs by Mitsu\'s door' : 'is not at the lodge'));
      if (k === 'mitsu') { t.eq(talkTo(st, 'ko.lodge', 'ko_mitsu'), 'ko.mitsu_letter', 'Mitsu reads it'); await run('ko.mitsu_letter'); t.ok(talkTo(st, 'ko.lodge', 'ko_mitsu') !== 'ko.mitsu_letter', 'once'); }
      st.flags.ko_done = true;
      await run('ko.mitsu_after');
      t.eq(has(/dreamt my grandmother/), k === 'wind', k + ': Mitsu ' + (k === 'wind' ? 'dreams of her grandmother laughing' : 'has no dream to tell'));
    }
    RB.game.G.s = s;
    await run('ko.kihei_choose', { pick: pickEn('Not now') });
    t.ok(qs(s, 'ko_kihei') === 2 && s.inv.ko_kihei_letter, 'not now: the letter stays with you');
  }

  // ---- The Leaf That Is Your Name ------------------------------------------------------------------------------------
  for (const bg of ['courier', 'craft', 'student']) {
    const s = fresh({ bg, vars: { ko_ret: 2 } });
    s.lang = 'en';
    t.eq(talkTo(s, 'ko.village', 'ko_tokio'), 'ko.myname_start', bg + ': Tokio has a leaf with your name once two leaves are home');
    await run('ko.myname_start', { answer: () => false });
    t.ok(s.inv.ko_myleaf && qs(s, 'ko_myname') === 0 && asked[0] === 'ko.myname_' + bg, bg + ': the leaf, read by your own background\'s task');
    t.ok(lines.some((l) => /\$name|Haru/.test(l.en)), bg + ': it carries your name');
    t.eq(talkTo(s, 'ko.village', 'ko_tokio'), 'ko.myname_read', bg + ': misread, you can read it again');
    await run('ko.myname_read');
    t.eq(qs(s, 'ko_myname'), 1, bg + ': read: who wrote it and when');
    const ws = C.scenes['ko.windstone'].cmds.find((c) => c.op === 'choice');
    t.ok(ws.opts.some((o) => o.if === 'quest.ko_myname=1' && o.to === 'myname'), bg + ': the Wind Stone takes your answer');
    await run('ko.windstone', { pick: pickEn('Your own answer') });
    t.ok(qs(s, 'ko_myname') === 'done' && s.inv.ko_myleaf && asked.includes('ko.myname_reply'), bg + ': answered; the leaf with your name is kept');
  }

  // ---- The Keepers' Census -----------------------------------------------------------------------------------------
  {
    const s = fresh();
    await run('ko.tokio_ch9');
    t.eq(talkTo(s, 'ko.village', 'ko_tokio'), 'ko.census_ask', 'Tokio asks for help after telling you how far behind he is');
    await run('ko.census_ask');
    const a = C.maps['ko.terraces'].props.find((p) => p.scene === 'ko.basket_a'), b = C.maps['ko.shore'].props.find((p) => p.scene === 'ko.basket_b');
    t.ok(a && b, 'two baskets to count: Ao\'s on the terraces, the shore\'s');
    await run('ko.basket_a', { answer: () => false });
    t.ok(!s.flags.ko_cn_a && has(/Count again/), 'a miscount: count again');
    await run('ko.basket_a'); await run('ko.basket_b');
    t.ok(s.flags.ko_cn_a && s.flags.ko_cn_b && talkTo(s, 'ko.village', 'ko_tokio') === 'ko.census_report', 'both counted: back to Tokio');
    await run('ko.census_report');
    t.ok(qs(s, 'ko_census') === 'done' && s.flags.ko_census_done && asked.includes('ko.census_c'), 'the trend read together; done');
    await run('ko.census_board');
    t.ok(has(/Helped: (\$name|Haru), (\$comp|Ren)/), 'the board names the two who helped');
    await run('ko.basket_a');
    t.ok(!asked.length && has(/heaped with written leaves/), 'afterwards a basket is only a basket');
  }

  // ---- The Tide Calendar --------------------------------------------------------------------------------------------
  {
    const s = fresh({ flags: { ko_lowtide: true } });
    t.eq(talkTo(s, 'ko.tidepools', 'ko_koyomi'), 'ko.tide_ask', 'Koyomi asks once the calendar has been read');
    await run('ko.tide_ask');
    const stones = Object.values(C.maps).flatMap((m) => (m.props || []).filter((p) => p.p === 'ko_moonstone').map((p) => Object.assign({ map: m }, p)));
    t.eq(stones.length, 4, 'four moon stones on four maps');
    t.ok(stones.every((p) => test(s, p.if)), 'all four lying where the wind left them');
    for (const p of stones) await run(p.scene);
    t.ok(s.vars.ko_moons === 4 && stones.every((p) => !test(s, p.if)) && has(/Take them to Koyomi/), 'all four gathered');
    await run('ko.tide_back');
    t.eq(qs(s, 'ko_tide'), 1, 'set them in the ring');
    await run('ko.tidestone', { answer: (id) => id !== 'ko.tide_ring' });
    t.ok(qs(s, 'ko_tide') === 1 && asked[0] === 'ko.tide_ring' && has(/order seems wrong/), 'a wrong order: the stones wait');
    await run('ko.tidestone', { answer: (id) => id !== 'ko.tide_next' });
    t.ok(qs(s, 'ko_tide') === 2 && asked.join() === 'ko.tide_ring,ko.tide_next', 'the ring whole; the next tide misread: read again later');
    await run('ko.tidestone');
    t.ok(qs(s, 'ko_tide') === 'done' && s.flags.ko_tide_night && asked.join() === 'ko.tide_next' && has(/leaves on the beach lift/), 'read right: the night the leaves rise');
  }

  // ---- the companions -----------------------------------------------------------------------------------------------
  {
    const at = (map, scene) => (C.maps[map].onEnter || []).find((e) => e.scene === scene);
    const nao = fresh({ comp: 'nao' });
    t.ok(test(nao, at('ko.shore', 'ko.nao_letter').if), 'Nao: the shore, once the island\'s legend is being gathered');
    await run('ko.nao_letter', { pick: pickEn('listening') });
    t.ok(nao.flags.ko_nao_letter && has(/shopping list/) && bonds(nao).join() === 'ko:beat', 'Nao reads it alone, says nothing yet; Bond once');
    t.ok(!test(nao, at('ko.shore', 'ko.nao_letter').if), 'and only once');
    const mio = fresh({ comp: 'mio' });
    const mo = C.maps['ko.otoha'].onEnter.find((e) => e.scene === 'ko.mio_labels');
    t.ok(mo && test(mio, mo.if) && mo.once !== false, 'Mio: Otoha\'s pressed leaves, once');
    await run('ko.mio_labels');
    t.ok(has(/no bottles/) && has(/haven't answered/) && bonds(mio).join() === 'ko:beat', 'labels without bottles; her own unanswered letter, unnamed; Bond once');
    const ren = fresh({ comp: 'ren' }), other = fresh({ comp: 'suzu' });
    RB.game.G.s = other;
    await run('ko.toro_shore1');
    t.ok(!other.flags.ko_l_shore1 && !asked.length && has(/too old to read/), 'without Ren the old lanterns cannot be read');
    RB.game.G.s = ren;
    for (const id of ['shore1', 'shore2', 'pools']) await run('ko.toro_' + id);
    t.ok(ren.flags.ko_l_shore1 && ren.flags.ko_l_shore2 && ren.flags.ko_l_pools && ren.vars.ko_toro === 3, 'Ren reads all three by name, and they are lit');
    t.ok(has(/older than the lanterns on the Keepers' Road/) && bonds(ren).join() === 'ko:beat', 'the third: older than the Keepers\' Road; Bond once');
    const lit = C.maps['ko.shore'].props.filter((p) => p.p === 'ko_sandtoro' && test(ren, p.if));
    t.ok(lit.length === 2 && lit.every((p) => p.o && p.o.lit), 'the shore\'s two lanterns burn');
    for (const tk of ['ko.toro_1', 'ko.toro_2', 'ko.toro_3']) t.ok(['F', 'E', 'I', 'A'].some((k) => /real/.test(JSON.stringify(C.challenges[tk].tiers[k]))), tk + ': the old spelling is labelled real');
    const suzu = fresh({ comp: 'suzu' });
    await run('ko.suzu_leaf');
    t.ok(has(/Koume/) && has(/still can't/) && bonds(suzu).join() === 'ko:beat', 'Suzu\'s half-written reply to Koume; Bond once');
    const trig = C.maps['ko.seacave'].triggers.find((x) => x.scene === 'ko.suzu_stage');
    t.ok(!test(suzu, trig.if), 'the stage waits for the exhibition');
    Object.assign(suzu.flags, { 'tell_ko.t_hall_ok': true }); Object.assign(suzu.vars, { 'tell_ko.t_hall_p1': 'hamaji', 'tell_ko.t_hall_p3': 'shell' });
    t.ok(test(suzu, trig.if), 'then the rock stage calls');
    await run('ko.suzu_stage');
    t.ok(has(/serpent/) && has(/belong only to the one who wrote them/) && !has(/planted a seed in the middle of the sea/), 'told the way the panels hang');
    t.ok(has(/second act without a partner/) && suzu.flags.ko_suzu_stage && bonds(suzu).length === 1, 'and an encore needs a partner; no second Bond');
  }

  // ---- the rumour, told several ways ---------------------------------------------------------------------------------
  {
    const tetsu = npc('sg.harbor', 'tetsu');
    const ix = (sc) => tetsu.talk.findIndex((e) => e.scene === sc);
    t.ok(ix('ko.rumour_tetsu') >= 0 && ix('ko.rumour_tetsu') === ix('mb.ferry_tetsu_again') - 1, 'Tetsu tells the sailors\' version just before his ferry board');
    const s = fresh({ flags: { mb_arrived: true } });
    for (const f of ['ch5_done', 'ko_arrived', 'ko_ch9', 'kr_done']) delete s.flags[f];
    t.eq(talkTo(s, 'sg.harbor', 'tetsu'), 'ko.rumour_tetsu', 'once Manybridge is reached');
    t.ok(C.scenes['ko.rumour_tetsu'].cmds.some((c) => c.op === 'call' && c.args[0] === 'mb.ferry_tetsu_again'), 'and goes on to the board');
    s.seen = Object.assign(s.seen || {}, { 'ko.rumour_tetsu': 1 });
    t.ok(talkTo(s, 'sg.harbor', 'tetsu') !== 'ko.rumour_tetsu', 'once');
    const sh = npc('mp.tenement', 'mp_shinobu');
    t.ok(sh.talk[0].scene === 'ko.rumour_shinobu' && /quest\.mp_ghost=done/.test(sh.talk[0].if), 'Shinobu tells hers once her play is her own');
    const n = fresh();
    t.ok(talkTo(n, 'ko.village', 'ko_nami') !== 'ko.rumours', 'Nami answers nothing unasked');
    n.seen = Object.assign(n.seen || {}, { 'ko.rumour_shinobu': 1 });
    t.eq(talkTo(n, 'ko.village', 'ko_nami'), 'ko.rumours', 'after hearing a version, Nami answers it');
    await run('ko.rumours');
    t.ok(has(/tree's real/) && has(/half true/) && !has(/dead answer/), 'the tree is real, the flowers are not: each version partly true');
  }

  // ---- records ----------------------------------------------------------------------------------------------------------
  {
    const st = C.stampStands.kotonoha;
    t.ok(st && st.map === 'ko.shore' && C.maps['ko.shore'].props.some((p) => p.p === 'rb_stampstand' && p.x === st.x && p.y === st.y), 'the island\'s stamp stand stands on the shore');
    t.ok(['ch.ko', 'side.ko', 'ko.leaves', 'ko.exhibit'].every((id) => C.stamps[id] && C.stamps[id].chapter === 'ko' && C.stamps[id].hidden), 'four stamps, hidden until earned');
    t.eq(C.company.bondEvents['ko:beat'], 1, 'one Bond event for the island');
  }
};
