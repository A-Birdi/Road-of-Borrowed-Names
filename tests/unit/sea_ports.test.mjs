// Sazanami and East Landing, and the licence's maiden voyage (expansion P11d; docs/future/work/P11_SEA.md), played
// through the real scene runner with the dialogue stubbed (lines collected, choices picked by the test, language
// tasks answered right or wrong by the test). Synthetic campaigns only. What this covers:
//  - the frame: the two places, the ways there on foot (twelve-chapter journeys only), the ports and their dots on
//    the sea chart, the boats at the jetties;
//  - Sazanami: the first sight; the market, the net and the school, each with a wrong answer costing nothing; the
//    stand and its stamp;
//  - the maiden voyage: the mailbag delivered at both ends moves the licence on; Isaku's nets before and after the
//    winter; the island joins the chart; arriving there in your own boat is the first landing and ends the licence;
//  - East Landing over visits: Genroku's terms, the notice, the channel and the jetty each finished only on a later
//    visit, the bell, the port open; nothing here in a six-chapter journey; none of it moves a main story.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, SL = RB.sail;

  let lines = [], chooser = () => 0, answer = () => true, asked = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async (opts) => { const i = chooser(opts); return i < 0 ? 0 : i; };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.game.transition = async () => {};
  RB.challenge.run = async (id) => { asked.push(id); return { ok: answer(id) }; };
  const pickEn = (...words) => (opts) => { for (const w of words) { const i = opts.findIndex((o) => (o.en || '').indexOf(w) >= 0); if (i >= 0) return i; } return 0; };
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: o.edition || 2 });
    s.id = 'sea-ports'; s.map = 'sz.hamlet'; s.comp = o.comp === undefined ? 'nao' : o.comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, mb2_done: true, ch3_done: true }, o.flags || {});
    for (const k in o.quests || {}) s.quests[k] = o.quests[k];
    Object.assign(s.inv, o.inv || {});
    s.vars = Object.assign({}, o.vars || {});
    s.visited = Object.assign({ 'sg.harbor': true, 'mb.pier': true }, o.visited || {});
    RB.game.G.s = s;
    return s;
  };
  const run = async (id, o = {}) => { lines = []; asked = []; chooser = o.pick || (() => 0); answer = o.answer || (() => true); await RB.script.run(id); return lines; };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const qs = (s, id) => (s.quests[id] ? (s.quests[id].done ? 'done' : s.quests[id].stage) : null);
  const npc = (map, id) => (C.maps[map].npcs || []).find((n) => n.id === id);
  const talkTo = (s, map, id) => { const n = npc(map, id); const tk = typeof n.talk === 'string' ? [{ scene: n.talk }] : n.talk; const e = tk.find((x) => !x.if || S.test(s, x.if)); return e && e.scene; };
  const shown = (s, map, id) => { const n = npc(map, id); return !!n && (!n.if || S.test(s, n.if)); };
  const away = () => RB.bus.emit('map:enter', { id: 'sg.harbor' });

  // ---- the frame ---------------------------------------------------------------------------------------------------
  t.ok(C.maps['sz.hamlet'].edition === 2 && C.maps['el.landing'].edition === 2 && C.places.sazanami && C.places.sazanami.edition === 2, 'Sazanami and East Landing: twelve-chapter journeys only');
  t.ok(C.maps['sg.road'].exits.some((e) => e.to === 'sz.hamlet' && e.if === 'ed>=2') && C.maps['sg.harbor'].exits.some((e) => e.to === 'el.landing' && e.if === 'ed>=2'), 'on foot: west up the coast road, and round the east beach');
  t.ok(C.roads.some((r) => r[0] === 'saltglass' && r[1] === 'sazanami'), 'the route chart: Saltglass to Sazanami');
  t.ok(C.ports.sazanami && C.ports.eastlanding && C.ports.eastlanding.if === 'el_done' && C.ports.eastlanding.pos, 'two ports: Sazanami, and East Landing once rebuilt (its own dot on the chart)');
  for (const id of ['sazanami', 'eastlanding']) {
    const P = C.ports[id], m = C.maps[P.dock.map];
    t.ok(m.props.some((p) => p.p === 'boat' && p.scene === 'sea.boat' && p.x === P.boat.x && p.y === P.boat.y && /ed>=2&sea_boat/.test(p.if)), id + ': the boat lies at the jetty once she is yours');
  }
  t.eq((C.scriptErrors || []).filter((e) => /sz\.|el\.|sea\./.test(e)), [], 'the ports\' scenes parse');

  // ---- Sazanami --------------------------------------------------------------------------------------------------
  {
    const s = fresh();
    await run('sz.first');
    t.ok(s.flags.sz_seen && s.travel.sazanami && has(/fishing hamlet/), 'the first sight; Sazanami on the route chart');
    t.eq(talkTo(s, 'sz.hamlet', 'sz_uki'), 'sz.uki_first', 'Uki at the market');
    await run('sz.uki_first', { answer: () => false });
    t.ok(qs(s, 'sz_market') === 0 && asked[0] === 'sz.market' && has(/count again later/), 'the tally wrong: counted again later, nothing lost');
    await run('sz.uki_market');
    t.eq(qs(s, 'sz_market'), 'done', 'the morning catch counted');
    await run('sz.yone_first', { answer: (id) => id !== 'sz.net_knot' });
    t.ok(qs(s, 'sz_nets') === 0 && s.vars.sz_net === 1 && asked.join() === 'sz.net_find,sz.net_knot', 'the torn mesh found; the knot\'s order to come');
    await run('sz.yone_nets');
    t.ok(qs(s, 'sz_nets') === 'done' && asked.join() === 'sz.net_knot', 'asked again, only the knot');
    t.eq(talkTo(s, 'sz.hamlet', 'sz_mina'), 'sz.school_ask', 'the children ask for a teacher');
    await run('sz.school_ask', { answer: () => false });
    t.ok(qs(s, 'sz_school') === 0 && !s.vars.sz_lesson && asked[0] === 'sz.school_1', 'the first lesson, explained wrong: it waits');
    const order = [];
    for (let i = 0; i < 3; i++) { await run(i % 2 ? 'sz.school_lesson' : talkTo(s, 'sz.hamlet', 'sz_riku')); order.push(asked[0]); }
    t.eq(order, ['sz.school_1', 'sz.school_2', 'sz.school_3'], 'three lessons in order, from either child: the dots, counting, the notice');
    t.ok(qs(s, 'sz_school') === 'done' && has(/empty one/), 'the school\'s fee: an empty shell');
    t.ok(C.stamps['side.sz'].when(s) && C.stampStands.sazanami && C.maps['sz.hamlet'].props.some((p) => p.p === 'rb_stampstand' && p.o.stand === 'sazanami'), 'Sazanami\'s stand, and its stamp earned');
  }

  // ---- the maiden voyage ----------------------------------------------------------------------------------------------
  {
    const s = fresh({ quests: { sea_licence: { stage: 6, done: false } }, inv: { sea_mailbag: 1 }, flags: { sea_boat: true } });
    s.sea = { boat: { name: 'かもめ', hull: 'pilot' }, at: 'saltglass' };
    t.eq(talkTo(s, 'sz.hamlet', 'sz_uki'), 'sz.uki_post', 'Sazanami\'s bundle to Uki\'s post box');
    await run('sz.uki_post');
    t.ok(s.flags.sea_post_sz && qs(s, 'sea_licence') === 6 && s.inv.sea_mailbag === 1, 'one end delivered');
    t.eq(talkTo(s, 'el.landing', 'el_genroku'), 'el.genroku_post', 'East Landing\'s one letter, to Genroku');
    await run('el.genroku_post');
    t.ok(s.flags.sea_post_el && qs(s, 'sea_licence') === 7 && !s.inv.sea_mailbag && has(/got here all right/) && qs(s, 'el_rebuild') === 0, 'both ends: the mailbag empty, the licence on to the island; Genroku goes on to the landing\'s story');
    t.eq(talkTo(s, 'sz.hamlet', 'sz_isaku'), 'sz.isaku_winter', 'before the winter is over, nothing strange in the nets');
    await run('sz.isaku_winter');
    t.ok(!s.flags.sea_ko_hint && has(/winter's over/), 'come back after the winter');
    t.ok(SL.destinations(s, 'sazanami').indexOf('kotonoha') < 0, 'the island is not on the chart yet');
    s.flags.ch4_done = true;
    t.eq(talkTo(s, 'sz.hamlet', 'sz_isaku'), 'sz.isaku_leaves', 'after Snowbell\'s winter: the leaves in the nets');
    await run('sz.isaku_leaves');
    t.ok(s.flags.sea_ko_hint && qs(s, 'sea_licence') === 8 && has(/writing/), 'written leaves from out west; the licence\'s last leg');
    t.ok(SL.destinations(s, 'sazanami').indexOf('kotonoha') >= 0, 'the island joins the chart');
    t.ok(SL.plan(s, 'saltglass', 'sazanami').sits[0] === 'first_sz', 'the first voyage up the coast has its own moment');
    SL.begin(s, 'sazanami', 'kotonoha', 'crew');
    lines = [];
    await SL.arrive(s, 'kotonoha');
    t.ok(s.flags.ko_arrived && qs(s, 'sea_licence') === 'done' && /tree bigger than any/.test(lines.map((l) => l.en).join(' ')), 'ashore on the island from your own boat: its first sight, and the licence done');
    t.ok(C.stamps['sea.voyage'] && S.test(s, C.stamps['sea.voyage'].when), 'the voyage\'s stamp');
  }

  // ---- East Landing, over several visits ----------------------------------------------------------------------------
  {
    const s = fresh({ edition: 1 });
    t.ok(!S.test(s, C.maps['sg.harbor'].exits.find((e) => e.to === 'el.landing').if), 'a six-chapter journey: no way round to East Landing');
  }
  const s = fresh();
  await run('el.first');
  t.ok(s.flags.el_seen && has(/silted|shallow/), 'the inlet, the jetty with planks missing, the old man sweeping');
  t.eq(talkTo(s, 'el.landing', 'el_genroku'), 'el.genroku_first', 'Genroku');
  await run('el.genroku_first');
  t.ok(qs(s, 'el_rebuild') === 0 && has(/Seto family's landing/), 'the Seto family\'s landing; nobody touches it without his say');
  await run('el.genroku_terms', { answer: () => false });
  t.ok(qs(s, 'el_rebuild') === 0, 'terms that miss: try again, nothing lost');
  await run('el.genroku_terms');
  t.ok(qs(s, 'el_rebuild') === 1 && asked[0] === 'el.terms', 'the name stays, the bell rings again, the sweeping is his');
  await run('el.board', { answer: () => false });
  t.ok(qs(s, 'el_rebuild') === 1 && has(/who should come, when, or where/), 'a notice that says too little: written again');
  await run('el.board');
  t.ok(qs(s, 'el_rebuild') === 2 && s.flags.el_pending && !shown(s, 'el.landing', 'el_daigo'), 'the notice is up; no one has come yet');
  const enter = C.maps['el.landing'].onEnter.find((e) => e.scene === 'el.progress');
  t.ok(!S.test(s, enter.if), 'not on this visit');
  away();
  t.ok(s.flags.el_away && S.test(s, enter.if), 'gone elsewhere and back: the work of the meantime is done');
  await run('el.progress');
  t.ok(s.flags.el_notice && !s.flags.el_pending && shown(s, 'el.landing', 'el_daigo') && shown(s, 'el.landing', 'el_sota') && shown(s, 'el.landing', 'el_hama'), 'Daigo, Sōta and Hama answered the notice');
  t.eq(talkTo(s, 'el.landing', 'el_daigo'), 'el.channel', 'Daigo: where to dig');
  await run('el.channel');
  t.ok(qs(s, 'el_rebuild') === 3 && s.flags.el_pending && !s.flags.el_channel && talkTo(s, 'el.landing', 'el_hama') === 'el.wait', 'dug by the next visit; meanwhile the work waits');
  away(); await run('el.progress');
  t.ok(s.flags.el_channel && !s.flags.el_pending, 'the channel dug');
  t.eq(talkTo(s, 'el.landing', 'el_hama'), 'el.jetty', 'Hama: the planks');
  await run('el.jetty');
  t.ok(qs(s, 'el_rebuild') === 4 && s.flags.el_pending, 'cut and fitted by the next visit');
  await run('el.genroku_bell');
  t.ok(!s.flags.el_bell && has(/Wait till the planks/), 'the bell waits for the planks');
  away(); await run('el.progress');
  t.ok(s.flags.el_jetty, 'the jetty mended');
  await run('el.genroku_bell');
  t.ok(s.flags.el_bell && s.flags.el_done && qs(s, 'el_rebuild') === 'done' && has(/wavy line/), 'the landing\'s own bell, kept thirty years, hung again');
  t.ok(SL.open(s, 'eastlanding') && SL.reached(s, 'eastlanding') && SL.destinations(s, 'saltglass').indexOf('eastlanding') >= 0, 'East Landing takes boats: on the chart');
  t.ok(S.test(s, C.stamps['el.rebuilt'].when), 'its stamp');
  t.ok(!s.flags.ch4_done && !s.quests.ko_main, 'none of it moved a main story');
};
