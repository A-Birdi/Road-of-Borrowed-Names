// Ashihara Shinden, the new settlement (expansion P15f; plan 07_REGIONS.md R7, sealed S6; docs/future/work/
// P15_POSTGAME.md), with synthetic campaigns only: the scenes played through the real scene runner with the dialogue
// stubbed (each language task answered by the test, choosing which right answer to give), the two quarrels through
// the real encounter platform.
//  - the way in only after the story in a twelve-chapter journey; a place on the chart;
//  - each part in order: the three ways named (either right name, each one's signpost), the post box, the teacher and
//    her school; the two notices (washing moves where the notice says; the market stall stands where it says, and the
//    pedlar with it); the two quarrels, each settled two ways that change the village differently, and a blunt word
//    that ends one another way; the meeting house; the festival (lanterns where they were planned), the keepsake once,
//    the stamp and the travel volume's page;
//  - routines: every resident in exactly one place at every stage and every slot, the pinned ones kept still while
//    their quarrel waits; every person and every thing to use reachable from the way in, at every stage; buildings
//    that grow block only once they stand;
//  - the tasks: four levels each, two or more right answers where the village gets a choice, every wrong one explained;
//    never money, never upkeep.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, E = RB.encounter;
  const OK = { ok: true, firstTry: true, mistakes: 0 };

  // ---- a minimal stage ----------------------------------------------------------------------------------------------
  let lines = [], encs = [], encRes = () => ({ result: 'win', outcome: null }), forge = {}, choice = 0, asked = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => choice;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.inBattle = () => false;
  RB.game.startEncounter = async (id) => { encs.push(id); return encRes(id); };
  RB.save.autosave = async () => {};
  if (RB.staging) RB.staging.walkTo = async () => {};
  RB.challenge.run = async (id) => { asked.push(id); const s = RB.game.G.s; if (forge[id] !== undefined) s.vars._forge = forge[id]; return { ok: true }; };
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: o.edition || 2 });
    s.id = 'settle-test'; s.map = 'as.village'; s.comp = o.comp === undefined ? 'mio' : o.comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    s.learn.profile = o.profile || 'E';
    if (!o.story) Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, ngp_offered: true });
    s.vars = {};
    RB.game.G.s = s; RB.game.s = s;
    RB.world.W.map = { id: s.map };
    return s;
  };
  const run = async (id, o = {}) => { lines = []; encs = []; asked = []; choice = o.choice || 0; forge = o.forge || {}; if (o.enc) encRes = o.enc; await RB.script.run(id); return lines; };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const V = C.maps['as.village'];
  const shown = (s) => (V.props || []).filter((p) => !p.if || S.test(s, p.if));
  const propAt = (s, kind) => shown(s).filter((p) => p.p === kind).map((p) => p.x + ',' + p.y).sort().join(' ');
  const people = (s) => V.npcs.filter((n) => !n.if || S.test(s, n.if));
  const qs = (s) => (s.quests.as_main ? (s.quests.as_main.done ? 'done' : s.quests.as_main.stage) : null);
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const RES = ['as_mitsue', 'as_yoshizo', 'as_taki', 'as_sho', 'as_natsu', 'as_kotoe', 'as_mohei'];

  // ---- the way in --------------------------------------------------------------------------------------------------------
  {
    const ex = C.maps['rw.road'].exits.find((e) => e.to === 'as.village');
    t.ok(ex && ex.if === 'ed>=2&postgame' && V.exits.some((e) => e.to === 'rw.road'), 'a path off the Lantern Road, only after the story in a twelve-chapter journey, and back');
    t.ok(!S.test(fresh({ edition: 1 }), ex.if) && !S.test(fresh({ story: true }), ex.if) && S.test(fresh(), ex.if), 'closed in a six-chapter journey and during the story; open in the postgame');
    t.ok(C.places.ashihara && C.places.ashihara.edition === 2 && C.roads.some((r) => r[0] === 'reedwake' && r[1] === 'ashihara' && r[2].if === 'postgame'), 'on the chart, from Reedwake, after the story');
    t.ok(V.music && RB.audio._.songDefs.ashihara && RB.audio._.songDefs.as_festival, 'its own music: the village and its festival');
  }

  // ---- the whole story, choosing one set of right answers ------------------------------------------------------------------
  const story = async (o) => {
    const s = fresh({ comp: o.comp });
    await run('as.first');
    t.ok(s.flags.as_arrived && qs(s) === 0 && has(/name is all the village has/), o.tag + ': arriving: a village with only a name');
    // three ways, each named either way
    for (const k of ['main', 'canal', 'hill']) {
      await run('as.way_' + k, { forge: { ['as.name_' + k]: o.ways[k] } });
      t.ok(s.flags['as_nm_' + k] && s.vars['as_way_' + k] === o.ways[k] && propAt(s, 'sign').length && asked[0] === 'as.name_' + k, o.tag + ': the ' + k + ' way named ' + o.ways[k]);
      await run('as.way_' + k);
      t.ok(!asked.length && has(new RegExp(C.asWays[k].names[o.ways[k]][1])), o.tag + ': and its signpost says so');
    }
    t.ok(s.flags.as_streets && qs(s) === 1 && s.flags.as_kotoe && propAt(s, 'mailbox') === '6,9', o.tag + ': all three named: the post box, and the teacher is coming');
    // the notices
    await run('as.board', { forge: { 'as.notice_water': o.wash, 'as.notice_market': o.market } });
    t.ok(s.flags.as_nt_water && s.flags.as_nt_market && s.vars.as_wash === o.wash && s.vars.as_market === o.market && qs(s) === 2, o.tag + ': the notices posted: washing ' + o.wash + ', market by the ' + o.market);
    t.eq(propAt(s, 'laundry'), o.wash === 'stream' ? '13,17' : '4,17', o.tag + ': the washing has moved off the drinking well');
    t.eq(propAt(s, 'counter'), o.market === 'board' ? '10,12' : '25,12', o.tag + ': the market stall stands where the notice put it');
    await run('as.board');
    t.ok(!asked.length && has(o.wash === 'stream' ? /Washing at the stream/ : /Washing on the reed bank/), o.tag + ': the board reads the notices back');
    // the quarrels
    s.flags['as_rota_' + o.rota] = true; // (what the encounter's conclusion sets as it ends; the stub doesn't run it)
    await run('as.yoshizo', { enc: () => ({ result: 'win', outcome: o.rota }) });
    t.ok(encs[0] === 'as.water', o.tag + ': Yoshizō\'s quarrel is the channel\'s water');
    t.ok(s.flags.as_dp_water && s.vars.as_rota === o.rota && propAt(s, 'sign').indexOf('25,9') >= 0, o.tag + ': settled ' + o.rota + ': the rota board by the bridge');
    t.ok(!s.flags.as_hall && qs(s) === 2, o.tag + ': one quarrel to go');
    s.flags['as_forge_' + o.forge] = true;
    await run('as.natsu', { enc: () => ({ result: 'win', outcome: o.forge }) });
    t.ok(s.flags.as_dp_noise && s.vars.as_forge === o.forge, o.tag + ': the forge settled: ' + o.forge);
    t.ok(o.forge === 'moved' ? propAt(s, 'anvil') === '33,8' : propAt(s, 'sign').indexOf('16,8') >= 0, o.tag + ': ' + (o.forge === 'moved' ? 'an anvil and a fire out beyond the paddies' : 'the forge\'s hours on its door'));
    t.ok(s.flags.as_hall && qs(s) === 3, o.tag + ': both settled: the meeting house, and a festival proposed');
    // the festival
    await run('as.mitsue', { forge: { 'as.fest_lanterns': o.lan }, choice: 0 });
    t.ok(['as.fest_lanterns', 'as.fest_food', 'as.fest_order'].every((id) => asked.includes(id)) && s.vars.as_lan === o.lan, o.tag + ': planned: lanterns along the ' + o.lan + ', the food, the order');
    t.ok(s.flags.as_fest_done && qs(s) === 'done' && s.inv.as_kasa === 1 && !s.flags.as_fest_night && has(/From today, a real village/), o.tag + ': the first festival: a real village, and the planting hat');
    t.eq(propAt(s, 'lantern').split(' ').length, o.lan === 'street' ? 5 : o.lan === 'canal' ? 4 : 3, o.tag + ': its lanterns stay up where they were hung');
    t.ok(RB.stampBook.earned(s, 'as.village') && RB.volume.witnessed(s, RB.volume.page('as.festival')), o.tag + ': its stamp earned, its page witnessed');
    await run('as.mitsue');
    t.ok(!asked.length && s.inv.as_kasa === 1, o.tag + ': afterwards, everyday talk; the hat given once');
    return s;
  };
  const a = await story({ tag: 'one way', comp: 'suzu', ways: { main: 'ashinose', canal: 'suiro', hill: 'matsu' }, wash: 'stream', market: 'board', rota: 'time', forge: 'hours', lan: 'street' });
  const b = await story({ tag: 'the other', comp: null, ways: { main: 'hon', canal: 'yoshizo', hill: 'miharashi' }, wash: 'reeds', market: 'bridge', rota: 'days', forge: 'moved', lan: 'canal' });
  t.ok(JSON.stringify(shown(a).map((p) => p.p + p.x + p.y).sort()) !== JSON.stringify(shown(b).map((p) => p.p + p.x + p.y).sort()), 'two journeys making different choices have different villages');
  await run('as.yoshizo');
  t.ok(has(/Yoshizō Lane/), 'and the people remember: a lane named for Yoshizō, he says, is embarrassing but not bad');

  // ---- the quarrels themselves --------------------------------------------------------------------------------------------
  for (const [id, ends] of [['as.water', ['time', 'days', 'left']], ['as.noise', ['hours', 'moved', 'left']]]) {
    const d = C.encounters[id];
    t.ok(d.kind === 'social' && d.social.unravelTip && d.social.actions.every((x) => ['F', 'E', 'I', 'A'].every((p) => x.task[p] && x.task[p].options.filter((q) => q.ok).length === 1 && x.task[p].options.every((q) => q.ok || q.why))), id + ': a conversation, every line at four levels with one right answer, every wrong one explained');
    const reach = (plan) => {
      const s = fresh();
      const st = E.begin(id, s);
      for (const cid of plan) { if (st.over) break; const card = E.cards(st, s, wordsOf(s)).find((c) => c.id === cid && !c.disabled); if (!card) return 'no ' + cid; E.exchange(st, { card, res: OK, comp: null, target: st.cur }, {}); }
      return st.over ? st.enc.outcome : 'open';
    };
    const asks = id === 'as.water' ? ['s:restate', 's:restate', 's:ask_yoshizo', 's:ask_taki'] : ['s:restate', 's:restate', 's:ask_natsu', 's:ask_sho'];
    const got = { [ends[0]]: reach(asks.concat('s:' + ends[0])), [ends[1]]: reach(id === 'as.water' ? asks.concat('s:' + ends[1]) : ['s:restate', 's:move']), left: reach(['s:blunt']) };
    t.eq(got, { [ends[0]]: ends[0], [ends[1]]: ends[1], left: 'left' }, id + ': settled two ways, and a blunt word ends it another way');
    t.ok(d.conclusions.every((c) => c.result !== 'lose'), id + ': no end is a defeat');
    const s = fresh();
    const st = E.begin(id, s);
    t.ok(!E.cards(st, s, wordsOf(s)).some((c) => c.id === 's:' + ends[0] && !c.disabled), id + ': its proposal waits until both sides have been heard');
  }
  {
    // a blunt word: nothing settled, and the quarrel can be taken up again
    const s = fresh();
    s.quests.as_main = { stage: 2, done: false, t: 1 };
    await run('as.yoshizo', { enc: () => ({ result: 'end', outcome: 'left' }) });
    t.ok(!s.flags.as_dp_water && has(/cool down/), 'told bluntly, Yoshizō stamps off; nothing is settled');
    await run('as.yoshizo', { enc: () => ({ result: 'win', outcome: 'time' }) });
    t.ok(encs[0] === 'as.water' && s.flags.as_dp_water, 'and the quarrel can be taken up again');
  }

  // ---- routines, growth and reachability ------------------------------------------------------------------------------------------
  {
    const T = C.towns.ashihara;
    t.ok(T && T.maps[0] === 'as.village' && RES.every((p) => T.residents[p]), 'the village keeps routines for its seven residents');
    // every stage × every pair of slots × the choices: each resident in at most one place, the settled ones always somewhere
    const stages = [
      {}, { as_streets: 1, as_kotoe: 1 }, { as_streets: 1, as_kotoe: 1, as_nt_water: 1, as_nt_market: 1, vars: { as_wash: 'stream', as_market: 'board' } },
      { as_streets: 1, as_kotoe: 1, as_nt_water: 1, as_nt_market: 1, as_dp_water: 1, as_dp_noise: 1, as_hall: 1, vars: { as_wash: 'reeds', as_market: 'bridge', as_rota: 'days', as_forge: 'moved' } },
      { as_streets: 1, as_kotoe: 1, as_nt_water: 1, as_nt_market: 1, as_dp_water: 1, as_dp_noise: 1, as_hall: 1, as_fest_done: 1, vars: { as_wash: 'stream', as_market: 'board', as_rota: 'time', as_forge: 'hours', as_lan: 'hill' } },
    ];
    const bad = [];
    let unreach = [];
    for (const [i, st] of stages.entries()) for (const sl of [1, 2]) {
      const s = fresh();
      for (const k in st) if (k !== 'vars') s.flags[k] = true;
      Object.assign(s.vars, st.vars || {});
      // a tick draws each resident's next place; then every resident is put in slot `sl` (the routine's own record)
      RB.town.tick(s, 'ashihara');
      const tr = RB.town.rec(s).towns.ashihara;
      for (const p of RES) tr.slots[p] = sl;
      const here = people(s);
      for (const p of RES) {
        const n = here.filter((x) => x.id === p).length;
        const should = p === 'as_kotoe' ? !!s.flags.as_kotoe : p === 'as_mohei' ? !!s.vars.as_market && sl === 1 : true;
        if (n > 1 || (should && n !== 1) || (!should && n)) bad.push(i + '/' + sl + ' ' + p + '×' + n);
      }
      // reachable: every person and every thing to use, from the way in
      RB.maps.invalidate();
      const m = RB.maps.compile('as.village');
      const seen = new Set(['1,10']), stack = [[1, 10]];
      const npcAt = new Set(here.map((n) => n.x + ',' + n.y));
      while (stack.length) { const [x, y] = stack.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, key = nx + ',' + ny; if (seen.has(key) || npcAt.has(key) || RB.maps.blockedStatic(m, nx, ny)) continue; seen.add(key); stack.push([nx, ny]); } }
      const near = (x, y, w) => { for (let xx = x; xx < x + (w || 1); xx++) for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) if (seen.has((xx + dx) + ',' + (y + dy))) return true; return false; };
      for (const n of here) if (!near(n.x, n.y) || RB.maps.blockedStatic(m, n.x, n.y)) unreach.push(i + '/' + sl + ' ' + n.id + '@' + n.x + ',' + n.y);
      for (const p of shown(s).filter((q) => q.scene)) if (!near(p.x, p.y, (RB.props.P[p.p] || {}).w)) unreach.push(i + '/' + sl + ' ' + p.scene + '@' + p.x + ',' + p.y);
    }
    t.eq(bad, [], 'every resident in exactly one place at every stage and slot (the teacher once she has come; the pedlar only on market days)');
    t.eq(unreach, [], 'every person and every thing to use reachable from the way in, at every stage');
    // pinned while their quarrel waits
    const s = fresh();
    s.quests.as_main = { stage: 2, done: false, t: 1 };
    RB.town.tick(s, 'ashihara');
    const before = JSON.stringify(RB.town.rec(s).towns.ashihara.slots);
    for (let i = 0; i < 5; i++) RB.town.tick(s, 'ashihara');
    const after = RB.town.rec(s).towns.ashihara.slots;
    t.ok(['as_yoshizo', 'as_taki', 'as_sho', 'as_natsu'].every((p) => S.test(s, T.residents[p].pin) && (after[p] || 1) === (JSON.parse(before)[p] || 1)), 'the four in the quarrels keep still while they wait to be heard');
    s.flags.as_dp_water = true; s.flags.as_dp_noise = true;
    const moved = new Set();
    for (let i = 0; i < 6; i++) { RB.town.tick(s, 'ashihara'); moved.add(RB.town.rec(s).towns.ashihara.slots.as_yoshizo); }
    t.ok(moved.size === 2, 'once heard, they go about their routines again');
  }
  {
    // a building that grows blocks only once it stands
    const s = fresh();
    RB.maps.invalidate();
    let m = RB.maps.compile('as.village');
    t.ok(!RB.maps.blockedStatic(m, 4, 14) && !RB.maps.blockedStatic(m, 14, 14), 'before: the school\'s and the meeting house\'s ground is open');
    s.flags.as_kotoe = true; s.flags.as_hall = true;
    RB.maps.invalidate();
    m = RB.maps.compile('as.village');
    t.ok(RB.maps.blockedStatic(m, 4, 14) && RB.maps.blockedStatic(m, 14, 14), 'after: the school and the meeting house stand there');
  }

  // ---- the tasks ----------------------------------------------------------------------------------------------------------------------
  for (const id of ['as.name_main', 'as.name_canal', 'as.name_hill', 'as.notice_water', 'as.notice_market', 'as.fest_lanterns']) {
    const ch = C.challenges[id];
    t.ok(['F', 'E', 'I', 'A'].every((p) => { const st = ch.tiers[p][0]; const oks = st.families.filter((f) => f.ok); return st.kind === 'forge' && oks.length >= 2 && new Set(oks.map((f) => f.result)).size === oks.length && st.families.some((f) => !f.ok && f.why); }), id + ': four levels, two or more right answers that the village gets, a wrong one that says why');
  }
  t.ok(['F', 'E', 'I', 'A'].every((p) => C.challenges['as.fest_food'].tiers[p][0].options.filter((q) => q.ok).length === 1), 'the food: four levels, one right answer (the A level uses the real old measures 合 and 升)');
  t.ok(['F', 'E', 'I', 'A'].every((p) => { const st = C.challenges['as.fest_order'].tiers[p][0]; return st.kind === 'order' && st.answer.length === 4 && JSON.stringify(st.tiles) !== JSON.stringify(st.answer); }), 'the evening\'s order: four levels, shuffled');
  const all = Object.keys(C.scenes).filter((id) => /^as\./.test(id)).map((id) => JSON.stringify(C.scenes[id].cmds)).join(' ');
  t.ok(!/"op":"shop"/.test(all) && !/"op":"take"/.test(all), 'never money, never upkeep: no shop, nothing taken from you');
  t.ok(C.items.as_kasa.slot === 'cosmetic' && C.stamps['as.village'].hidden && !/Ashihara|Shinden/.test(C.stamps['as.village'].criteria.en), 'the keepsake only changes how you look; the stamp is hidden, its criteria naming no place');
};
