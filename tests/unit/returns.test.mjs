// The returns after the story (expansion P15g; plan 10_STORY.md §10, sealed S8 and S14's "Postgame"), with synthetic
// campaigns only: the scenes played through the real scene runner with the dialogue stubbed (each language task
// answered by the test, choosing which right answer to give).
//  - every return only after the story in a twelve-chapter journey: in a six-chapter journey, and during the story,
//    every person and every thing says what it said before;
//  - Kotonoha's deepest grove (what fills it follows the Archive's ending; a leaf read, a leaf of your own left);
//    Cinder Orchard's yearly festival (a night of its own, real ways out, Hiro's count of Suzu's festivals); the
//    Snowbell rota and Akari's letter; Lanternfall's printed objections; Sanpei's last editions; the teahouse at the
//    Mist Barrier;
//  - the companions' beats, each only with its companion: the double act for the troupe; Sakichi's letter and one of
//    yours down the relay, the reply waiting when you come again; Kikue's jar; Ren and Hisae's walk;
//  - every new person and thing reachable; every task at four levels with every wrong answer explained.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;

  // ---- a minimal stage ----------------------------------------------------------------------------------------------
  let lines = [], forge = {}, choice = 0, asked = [], warps = [], fail = {};
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
  RB.game.transition = async (map, x, y, dir) => { warps.push([map, x, y, dir].join(' ')); };
  RB.save.autosave = async () => {};
  if (RB.staging) RB.staging.walkTo = async () => {};
  RB.challenge.run = async (id) => { asked.push(id); const s = RB.game.G.s; if (forge[id] !== undefined) s.vars._forge = forge[id]; return { ok: !fail[id] }; };
  const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, mp_sobe_met: true };
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: o.edition || 2 });
    s.id = 'returns-test'; s.map = 'co.village'; s.comp = o.comp === undefined ? 'mio' : o.comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    s.learn.profile = o.profile || 'E';
    Object.assign(s.flags, DONE, o.story ? {} : { postgame: true, ngp_offered: true }, o.flags || {});
    if (o.story) delete s.flags.ch6_done;
    s.vars = {};
    RB.game.G.s = s; RB.game.s = s;
    RB.world.W.map = { id: s.map };
    return s;
  };
  const run = async (id, o = {}) => { lines = []; asked = []; warps = []; choice = o.choice || 0; forge = o.forge || {}; fail = o.fail || {}; await RB.script.run(id); return lines; };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const pick = (s, talk) => (typeof talk === 'string' ? talk : ((talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene);
  const here = (s, map) => (C.maps[map].npcs || []).filter((n) => !n.if || S.test(s, n.if));
  const talkOf = (s, map, id) => { const n = here(s, map).find((x) => x.id === id || x.char === id); return n ? pick(s, n.talk) : null; };
  const propsOf = (s, map) => (C.maps[map].props || []).filter((p) => !p.if || S.test(s, p.if));
  const isRt = (sc) => typeof sc === 'string' && sc.startsWith('rt.');

  // ---- only after the story, only in a twelve-chapter journey --------------------------------------------------------------
  {
    const hooks = [
      ['co.village', 'hiro', 'rt.hiro_ask', {}],
      ['sb.post', 'sousuke', 'rt.akari_letter', {}],
      ['lf.council', 'lf_yae', 'rt.yae_objections', { rt_lf_read: true }],
      ['mp.pressroom', 'mp_sanpei', 'rt.sanpei_last', {}],
      ['cr.barrier', 'cr_gonza', 'rt.teahouse', {}],
      ['cr.barrier_office', 'cr_ujie', 'rt.ujie_tea', {}],
      ['mp.festhall', 'mp_tomi', 'rt.tomi_post', {}],
      ['ko.village', 'ko_otoha', 'rt.otoha_grove', { rt_grove_seen: true }],
      ['cr.kirishita', 'cr_sakichi', 'rt.nao_sakichi', {}, 'nao'],
      ['kr.lodge', 'kr_hisae', 'rt.ren_walk', {}, 'ren'],
      ['mp.festhall', 'yn_koume', 'rt.troupe', {}, 'suzu'],
      ['mp.festhall', 'yn_kikue', 'rt.kikue_jar', {}, 'mio'],
    ];
    const bad = [];
    for (const [map, id, scene, flags, comp] of hooks) {
      if (talkOf(fresh({ flags, comp }), map, id) !== scene) bad.push('post ' + id + ' ' + talkOf(fresh({ flags, comp }), map, id));
      if (isRt(talkOf(fresh({ flags, comp, story: true }), map, id))) bad.push('story ' + id);
      if (isRt(talkOf(fresh({ flags, comp, edition: 1 }), map, id))) bad.push('six ' + id);
    }
    t.eq(bad, [], 'every return\'s person speaks of it only after the story, in a twelve-chapter journey');
    const things = [['ko.garden', 'rt.grove_arch'], ['lf.town', 'rt.lf_objections'], ['cr.barrier', 'rt.teahouse']];
    t.ok(things.every(([m, sc]) => propsOf(fresh(), m).some((p) => p.scene === sc) && !propsOf(fresh({ story: true }), m).some((p) => p.scene === sc) && !propsOf(fresh({ edition: 1 }), m).some((p) => p.scene === sc)),
      'and every new thing stands only then (the grove\'s arch, the objections board, the teahouse)');
    t.ok(here(fresh({ story: true }), 'cr.barrier').some((n) => n.id === 'cr_gonza') && !here(fresh(), 'cr.barrier').some((n) => n.id === 'cr_gonza') && here(fresh(), 'cr.barrier').filter((n) => (n.char || n.id) === 'cr_gonza').length === 1,
      'the barrier\'s officer at the gate during the story, behind the teahouse counter after it: one of him at a time');
    // the Snowbell board: unchanged in a six-chapter journey, the rota added after the story in a twelve-chapter one
    fresh({ edition: 1 });
    const a = (await run('sb.hamlet_board')).map((l) => l.jp).join('|');
    const b = (await run('rt.sb_board')).map((l) => l.jp).join('|');
    t.ok(a.length && a === b, 'the Snowbell notice board reads exactly as before in a six-chapter journey');
    fresh({ flags: { sb_hoshino_goes: true } });
    await run('rt.sb_board');
    t.ok(has(/Hoshino, watching from afar/) && !has(/Kanta, Fuki, Sachi\. In turn\."$/), 'after the story the rota on it follows Hoshino\'s choice');
    fresh({ story: true });
    await run('rt.sb_board');
    t.ok(!has(/whose night it is/), 'and not during the story');
  }

  // ---- Kotonoha's deepest grove ----------------------------------------------------------------------------------------------
  {
    let s = fresh({ comp: 'ren' });
    await run('rt.grove_arch');
    t.ok(warps[0] === 'ko.grove 7 10 up' && has(/grove has grown/), 'the second root arch opens onto the deepest grove (the companion notices it has grown)');
    const g = C.maps['ko.grove'];
    t.ok(g.edition === 2 && g.exits.some((e) => e.to === 'ko.garden') && RB.travel.kindOf(g) === 'dungeon' && !RB.travel.problems('ko.grove', g).length, 'the grove: twelve-chapter only, under the roots as the garden is (no quick travel from there), the way back up through them');
    for (const [k, re] of [['end_archive_library', /copy out each unclaimed name/], ['end_archive_closed', /drifted here by themselves/], [null, /a few at a time/]]) {
      s = fresh({ flags: k ? { [k]: true } : {} });
      await run('rt.grove_tree');
      t.ok(has(re) && s.flags.rt_grove_seen, 'what fills the grove follows the Archive\'s ending: ' + (k || 'neither'));
    }
    await run('rt.grove_tree');
    t.ok(has(/a few more leaves/), 'and the tree a second time');
    await run('rt.grove_leaf');
    t.ok(asked.includes('rt.grove_leaf'), 'a leaf to read');
    for (const r of ['home', 'road', 'future']) {
      s = fresh();
      await run('rt.grove_write', { forge: { 'rt.grove_write': r } });
      t.ok(s.flags.rt_grove_leaf && s.vars.rt_leaf_to === r, 'a leaf of your own, to whom you choose: ' + r);
      await run('rt.grove_write');
      t.ok(asked.length === 0 && has(r === 'home' ? /back home/ : r === 'road' ? /met on the road/ : /haven't met yet/), 'and it is still there, to the one you chose');
    }
    s = fresh();
    await run('rt.grove_write', { fail: { 'rt.grove_write': true } });
    t.ok(!s.flags.rt_grove_leaf && has(/write your leaf later/), 'a leaf not written waits for later');
    s = fresh({ flags: { rt_grove_seen: true, rt_grove_leaf: true } });
    await run('rt.otoha_grove');
    t.ok(has(/youngest tree/) && has(/I saw your leaf/), 'Otoha has a word about the grove afterwards');
  }

  // ---- Cinder Orchard's yearly festival -------------------------------------------------------------------------------------
  {
    let s = fresh({ comp: 'suzu' });
    await run('rt.hiro_ask', { choice: 0 });
    t.ok(warps.includes('co.festival_yearly 23 17 down'), 'Hiro asks whether you are coming to this year\'s, and the square fills again');
    await run('rt.hiro_ask', { choice: 1 });
    t.ok(!warps.length && has(/No hurry/), 'or not yet');
    const Y = C.maps['co.festival_yearly'], F0 = C.maps['co.festival'];
    t.ok(Y.edition === 2 && Y.exits.length === 2 && Y.exits.every((e) => e.to === 'co.village') && !Y.triggers.length, 'a night of its own, with real ways out');
    t.ok(F0.exits.length === 0 && F0.triggers.some((x) => x.scene === 'co.fest_stay'), 'the story\'s festival night is unchanged');
    const seq = [];
    for (let n = 1; n <= 5; n++) {
      await run('rt.fest_enter');
      await run('rt.fest_hiro');
      seq.push(has(/Nineteen to go/) ? 'first' : has(/Another one paid back/) ? 'again' : has(/stopped counting/) ? 'counting' : '?');
    }
    t.eq(seq, ['first', 'again', 'again', 'again', 'counting'], 'with Suzu, every night is one more of her twenty festivals paid back, and Hiro keeps count');
    t.ok(s.vars.rt_fest_n === 5 && s.vars.rt_fest_suzu === 5, 'every night counted');
    s = fresh({ comp: 'nao' });
    await run('rt.fest_enter');
    await run('rt.fest_hiro');
    t.ok(s.vars.rt_fest_n === 1 && !s.vars.rt_fest_suzu && has(/one more still owing/), 'without her, one more still owing in his book');
    t.ok(here(fresh({ comp: 'nao' }), 'co.festival_yearly').some((n) => n.id === 'suzu') && !here(fresh({ comp: 'suzu' }), 'co.festival_yearly').some((n) => n.id === 'suzu'), 'Suzu in the crowd when she is not with you');
    const booths = Y.props.filter((p) => p.p === 'mp_booth');
    t.ok(booths.length === 3 && booths.every((p) => C.scenes[p.scene]), 'three of the festival games\' stalls');
  }

  // ---- Snowbell, Lanternfall, the broadsheet, the teahouse ---------------------------------------------------------------------
  {
    let s = fresh();
    await run('rt.akari_letter');
    t.ok(asked.includes('rt.akari_letter') && s.flags.rt_akari_read, 'Akari\'s letter to whoever keeps the lamp, read at Sousuke\'s');
    s = fresh();
    await run('rt.akari_letter', { fail: { 'rt.akari_letter': true } });
    t.ok(!s.flags.rt_akari_read && has(/Another time/), 'and kept for another time');
    s = fresh();
    await run('rt.lf_objections');
    t.ok(s.flags.rt_lf_read && talkOf(s, 'lf.council', 'lf_yae') === 'rt.yae_objections', 'Manybridge\'s printed objections, then the councillor on importing them');
    s.seen['rt.yae_objections'] = true;
    t.ok(talkOf(s, 'lf.council', 'lf_yae') !== 'rt.yae_objections', 'once');
    for (const [k, re] of [['hall.w10', /hundred lights back/], ['as_fest_done', /first festival/], ['gd.mb', /name recut/], ['end_archive_library', /thousand readers/], ['end_archive_closed', /doors stay shut/]]) {
      const s1 = fresh({ flags: { [k]: true } });
      if (k === 'hall.w10') s1.hall = { v: 1, wings: { w10: { done: true } }, visit: null }; // the Hall keeps its own record
      await run('rt.sanpei_last');
      t.ok(has(re), 'Sanpei\'s last editions report what you did: ' + k);
    }
    fresh();
    await run('rt.sanpei_last');
    t.ok(!has(/hundred lights back|first festival|name recut|thousand readers|doors stay shut/) && asked.includes('rt.headline'), 'and nothing you did not');
    s = fresh({ comp: 'nao' });
    await run('rt.teahouse');
    t.ok(s.flags.rt_tea_had && has(/Once you got stopped here/), 'tea at the old barrier');
  }

  // ---- the companions' beats ----------------------------------------------------------------------------------------------------
  {
    // the festival hall: each visitor only with the companion whose beat it is, never two on one spot
    const who = (comp) => here(fresh({ comp }), 'mp.festhall').map((n) => n.id).sort().join(' ');
    t.eq(['suzu', 'mio', 'nao', 'ren'].map(who), ['mp_tomi_h yn_koume yn_shinza', 'mp_tomi_h yn_kikue', 'mp_tomi_h', 'mp_tomi_h'], 'the troupe with Suzu, Kikue with Mio, in the festival hall');
    t.ok(['suzu', 'mio', 'nao'].every((c) => { const ns = here(fresh({ comp: c }), 'mp.festhall'); return new Set(ns.map((n) => n.x + ',' + n.y)).size === ns.length; }), 'nobody standing on anybody');
    t.ok(!here(fresh({ comp: 'suzu', story: true }), 'mp.festhall').some((n) => n.id === 'yn_koume'), 'not during the story');

    // Suzu: the double act
    let s = fresh({ comp: 'suzu' });
    await run('rt.troupe', { choice: 1 });
    t.ok(!s.flags.rt_troupe_seen && asked.length === 0 && has(/used to waiting/), 'the troupe can wait (tonight)');
    await run('rt.troupe', { choice: 0 });
    t.eq(asked, ['rt.troupe_1', 'rt.troupe_2', 'rt.troupe_3'], 'the double act for the troupe: three bits, you as the straight one');
    t.ok(has(/Koume laughs first/) && has(/good partner/) && s.flags.rt_troupe_seen, 'Koume laughs first; in the morning they go on ahead');
    t.ok(!here(s, 'mp.festhall').some((n) => n.id === 'yn_koume') && talkOf(s, 'mp.festhall', 'mp_tomi') === 'rt.tomi_post', 'and are gone');
    await run('rt.tomi_post');
    t.ok(has(/travelling troupe stopped by/), 'Tomi remembers the summer');
    fresh({ comp: 'mio' });
    await run('rt.tomi_post');
    t.ok(!has(/travelling troupe/), '(only if they came)');

    // Nao: the letter of the week, and one of yours
    s = fresh({ comp: 'nao' });
    await run('rt.nao_sakichi', { choice: 0, forge: { 'rt.nao_send': 'hiro' } });
    t.ok(asked[0] === 'rt.nao_letter' && asked[1] === 'rt.nao_send' && has(/opens it then and there/), 'Sakichi\'s letter of the week, opened there and then; then one of yours for the relay');
    t.ok(s.flags.rt_nao_read && s.flags.rt_nao_sent && s.vars.rt_nao_to === 'hiro', 'to whom you chose');
    t.eq(talkOf(s, 'cr.kirishita', 'cr_sakichi'), 'cr.sakichi_after', 'no reply while you are still standing there');
    const due = C.maps['cr.kirishita'].onEnter.find((x) => x.scene === 'rt.nao_due');
    t.ok(due && S.test(s, due.if), 'come again, and it is due');
    await run('rt.nao_due');
    t.eq(talkOf(s, 'cr.kirishita', 'cr_sakichi'), 'rt.nao_reply', 'and Sakichi has it');
    await run('rt.nao_reply');
    t.ok(has(/From Hiro/) && has(/Six days/) && s.flags.rt_nao_told && !has(/came to collect it/), 'the reply from the one you wrote to');
    for (const r of ['tsuru', 'hisae']) {
      s = fresh({ comp: 'nao' });
      await run('rt.nao_sakichi', { choice: 0, forge: { 'rt.nao_send': r } });
      await run('rt.nao_due');
      await run('rt.nao_reply');
      t.ok(has(r === 'tsuru' ? /From Tsuru/ : /From Hisae/), 'or from ' + r);
    }
    s = fresh({ comp: 'nao' });
    await RB.hooks.co_note(['nao_address', 'station']);
    await run('rt.nao_sakichi', { choice: 0, forge: { 'rt.nao_send': 'hiro' } });
    await run('rt.nao_due');
    await run('rt.nao_reply');
    t.ok(has(/came to collect it/), 'with their forwarding address at Kirishita, Nao collects their own too');
    s = fresh({ comp: 'nao' });
    await run('rt.nao_sakichi', { choice: 1 });
    t.ok(s.flags.rt_nao_read && !s.flags.rt_nao_sent && talkOf(s, 'cr.kirishita', 'cr_sakichi') === 'rt.nao_write', 'nothing to send yet: Nao asks again next time');
    t.eq(talkOf(fresh({ comp: 'mio' }), 'cr.kirishita', 'cr_sakichi'), 'cr.sakichi_after', 'only with Nao');

    // Mio: Kikue's jar
    s = fresh({ comp: 'mio' });
    await run('rt.kikue_jar');
    t.ok(asked[0] === 'rt.kikue_label' && has(/You put a label on it/) && has(/without a label/) && s.flags.rt_kikue_seen, 'Kikue\'s jar of her own, labelled undecided; Mio keeps hers without');
    t.ok(!here(s, 'mp.festhall').some((n) => n.id === 'yn_kikue'), 'and she goes home pleased');

    // Ren: the walk on the night the lamps are lit
    s = fresh({ comp: 'ren' });
    await run('rt.ren_walk', { choice: 1 });
    t.ok(!s.flags.rt_ren_walk && has(/won't run away/), 'another time');
    await run('rt.ren_walk', { choice: 0 });
    t.ok(asked[0] === 'rt.ren_saying' && has(/Welcoming Light, the Cedar Light/) && has(/without getting lost/) && s.flags.rt_ren_walk, 'Ren and Hisae walk the Keepers\' Road on the night its lamps are lit; the night\'s saying');
    t.eq(talkOf(s, 'kr.lodge', 'kr_hisae'), pick(fresh({ comp: 'ren', flags: { rt_ren_walk: true } }), here(fresh({ comp: 'ren' }), 'kr.lodge').find((n) => n.id === 'kr_hisae').talk), 'once');
  }

  // ---- reachable ----------------------------------------------------------------------------------------------------------------
  {
    const unreach = [];
    for (const [map, comp] of [['ko.grove', 'mio'], ['co.festival_yearly', 'nao'], ['co.festival_yearly', 'suzu'], ['mp.festhall', 'suzu'], ['mp.festhall', 'mio'], ['cr.barrier', 'nao'], ['lf.town', 'nao'], ['ko.garden', 'nao']]) {
      const s = fresh({ comp });
      RB.maps.invalidate();
      const m = RB.maps.compile(map), def = C.maps[map];
      const sp = def.spawn.default;
      const ppl = here(s, map), npcAt = new Set(ppl.map((n) => n.x + ',' + n.y));
      const seen = new Set([sp[0] + ',' + sp[1]]), stack = [[sp[0], sp[1]]];
      while (stack.length) { const [x, y] = stack.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, key = nx + ',' + ny; if (seen.has(key) || npcAt.has(key) || RB.maps.blockedStatic(m, nx, ny)) continue; seen.add(key); stack.push([nx, ny]); } }
      const near = (x, y, w, h) => { for (let yy = y; yy < y + (h || 1); yy++) for (let xx = x; xx < x + (w || 1); xx++) for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) if (seen.has((xx + dx) + ',' + (yy + dy))) return true; return false; };
      for (const n of ppl) if (!near(n.x, n.y) || RB.maps.blockedStatic(m, n.x, n.y)) unreach.push(map + ' ' + n.id);
      for (const p of propsOf(s, map).filter((q) => q.scene && (q.scene.startsWith('rt.') || map === 'ko.grove' || map === 'co.festival_yearly'))) { const P = RB.props.P[p.p] || {}; if (!near(p.x, p.y, P.w, P.h)) unreach.push(map + ' ' + p.scene + '@' + p.x + ',' + p.y); }
      for (const e of def.exits || []) { let ok = false; for (let yy = e.y; yy < e.y + (e.h || 1); yy++) for (let xx = e.x; xx < e.x + (e.w || 1); xx++) if (seen.has(xx + ',' + yy)) ok = true; if (!ok && map !== 'cr.barrier' && map !== 'lf.town') unreach.push(map + ' exit ' + e.to); }
    }
    t.eq(unreach, [], 'every new person, thing and way out reachable');
  }

  // ---- the tasks ----------------------------------------------------------------------------------------------------------------
  {
    const ids = Object.keys(C.challenges).filter((id) => id.startsWith('rt.'));
    const bad = [];
    for (const id of ids) {
      const tiers = C.challenges[id].tiers;
      for (const p of ['F', 'E', 'I', 'A']) {
        const st = tiers[p] && tiers[p][0];
        if (!st) { bad.push(id + ' ' + p + ' missing'); continue; }
        if (st.kind === 'choose') {
          if (st.options.filter((q) => q.ok).length !== 1) bad.push(id + ' ' + p + ' right answers');
          if (st.options.some((q) => !q.ok && !(q.why && q.why.en))) bad.push(id + ' ' + p + ' unexplained');
          if (st.options.length < 2) bad.push(id + ' ' + p + ' options');
        } else if (st.kind === 'forge') {
          const oks = st.families.filter((f) => f.ok);
          if (oks.length < 2 || new Set(oks.map((f) => f.result)).size !== oks.length) bad.push(id + ' ' + p + ' choices');
          if (st.families.some((f) => !f.ok && !(f.why && f.why.en))) bad.push(id + ' ' + p + ' unexplained');
        } else bad.push(id + ' ' + p + ' kind ' + st.kind);
      }
    }
    t.ok(ids.length >= 12, 'the returns\' tasks (' + ids.length + ')');
    t.eq(bad, [], 'four levels each; one right answer, or two or more where you choose; every wrong one explained');
  }
};
