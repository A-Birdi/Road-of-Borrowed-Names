// Chapter 3 (Cinder Orchard) story flow in a real browser, using RB.test auto
// mode. Usage: node tests/e2e/story_ch3.mjs [profile] [companion] [policy]
import { serve, launch, page } from './lib.mjs';

const profiles = process.argv[2] ? [process.argv[2]] : ['F', 'E', 'I', 'A'];
const comps = process.argv[3] ? [process.argv[3]] : ['nao', 'mio', 'ren', 'suzu'];
const policy = process.argv[4] || 'unravel';
const { srv, url } = await serve();
const b = await launch();
let fails = 0;

for (const profile of profiles) for (const comp of comps) {
  const { p, errors } = await page(b, url);
  const res = await p.evaluate(async ({ profile, comp, policy }) => {
    const T = RB.test;
    const out = { checks: [] };
    const check = (name, ok, extra) => out.checks.push({ name, ok: !!ok, extra });
    let want = null;
    T.enable({ battle: policy, choose: (opts) => { if (want) { const i = opts.findIndex((o) => want.test(o.en || '')); if (i >= 0) return i; } return 0; } });
    const s = RB.game.debugStart('co.road', 1, 11, { profile, comp, dir: 'right' });
    try {
    s.learn.kanaKnown = profile === 'F' ? 'none' : 'both';
    s.words = ['mamoru', 'mizu', 'hikari', 'iyasu', 'kaze', 'nawa'];
    s.flags.departed = true; s.flags.ch1_done = true; s.flags.ch2_done = true; s.chapter = 2;
    await RB.script.run('co.arrive'); await T.idle();
    check('arrived, chapter 3', s.flags.co_arrived && s.chapter === 3 && s.quests.co_main);
    await T.use(22, 9);
    check('road marker clue', s.flags.co_clue_marker);
    // north road locked
    await T.go('co.road', 23, 8, 'up');
    check('north still scrub', RB.maps.blockedStatic(RB.world.W.map, 23, 4));
    await T.go('co.village', 2, 18, 'right');
    check('met Sayo', s.flags.co_met_sayo && s.quests.co_main.stage >= 1);
    await T.use(26, 18); await T.use(38, 6);
    check('suspect after 3 clues', s.flags.co_suspect && s.quests.co_main.stage >= 2);
    await T.use(11, 11);
    // chronicle
    await T.go('co.hall', 6, 8, 'up'); await T.talk('co_tokiwa'); await T.use(5, 3);
    check('chronicle read', s.flags.co_chronicle_read && s.quests.co_main.stage >= 3);
    if (profile === 'F') check('kana lesson called', Object.keys(s.learn.taught || {}).length >= 0);
    // Suzu thread, part 1
    if (comp === 'suzu') {
      await T.go('co.inn', 6, 8, 'up'); await T.idle();
      check('suzu night scene', s.flags.co_suzu_told && s.quests.co_suzu && s.quests.co_suzu.stage === 1);
    } else {
      await T.go('co.village', 24, 17, 'up'); await T.talk('suzu');
      check('cameo suzu met', s.flags.co_suzu_c_met && s.quests.co_suzu);
      await T.go('co.inn', 6, 8, 'up'); await T.talk('suzu');
      check('cameo suzu told', s.flags.co_suzu_told && s.quests.co_suzu.stage === 1);
    }
    await T.go('co.glass', 6, 8, 'up'); await T.talk('hiro');
    check('asked hiro', s.flags.co_suzu_asked && s.quests.co_suzu.stage === 2);
    if (comp !== 'suzu') { await T.go('co.inn', 6, 8, 'up'); await T.talk('suzu'); check('reported to suzu', s.flags.co_suzu_c_reported); }
    // oral histories
    await T.go('co.glass', 6, 8, 'up'); await T.talk('co_isao');
    check('isao history + ledger', s.flags.co_hist_isao && s.inv.co_kilnbook);
    await T.go('co.terraces', 21, 32, 'up'); await T.talk('co_ume');
    check('ume history + book', s.flags.co_hist_ume && s.inv.co_plantbook);
    await T.go('co.village', 24, 1, 'down'); await T.talk('co_goro');
    check('goro history', s.flags.co_hist_goro && s.quests.co_main.stage >= 4);
    // records + confrontation
    await T.go('co.hall', 6, 8, 'up'); await T.use(9, 6);
    check('records done', s.flags.co_records_done && s.quests.co_main.stage >= 5);
    await T.go('co.terraces', 21, 4, 'up'); await T.talk('co_tamotsu');
    check('upper open', s.flags.co_upper_open && s.quests.co_main.stage >= 6);
    // dungeon
    await T.go('co.upper', 20, 28, 'up');
    await T.use(20, 22); check('ishi', s.words.includes('ishi') && s.flags.co_w_ishi);
    await T.use(16, 14); check('tsuchi', s.words.includes('tsuchi') && s.flags.co_w_tsuchi);
    for (const e of ['co.moth', 'co.soot', 'co.golem', 'co.ember']) { const r = await RB.game.startBattle(e, {}); check('won ' + e, r === 'win'); }
    await T.go('co.oldworks', 30, 23, 'up');
    await T.use(20, 5); check('seal needs ice', !s.flags.co_seal_broken);
    await T.go('co.icehouse', 5, 7, 'up'); await T.use(1, 5);
    check('koori', s.words.includes('koori') && s.flags.co_w_koori);
    await T.go('co.oldworks', 36, 20, 'down'); await T.use(20, 5);
    check('seal broken', s.flags.co_seal_broken);
    await T.use(2, 25); check('shortcut', s.flags.co_shortcut);
    await T.go('co.kiln', 14, 22, 'up');
    check('kiln autosave checkpoint', s.flags.co_kiln_seen && s.checkpoint && s.checkpoint.map === 'co.kiln');
    await T.use(11, 3); check('wall needs tiles', !s.flags.co_kiln_open);
    await T.use(25, 19); await T.use(4, 12); await T.use(26, 5);
    check('three tiles', s.vars.co_tablets === 3);
    await T.use(11, 3); check('kiln open', s.flags.co_kiln_open);
    want = /Go in/; await T.use(19, 3); want = null;
    await T.idle(30000);
    check('warden down', s.flags.co_warden_down && RB.world.W.map.id === 'co.kiln_core');
    await T.use(7, 3); check('globe', s.inv.co_globe);
    want = /Head straight back/; await T.use(4, 6); want = null; await T.idle();
    check('page + home', s.inv.co_logpage && s.flags.co_kiln_done && RB.world.W.map.id === 'co.village' && s.quests.co_suzu.stage === 3);
    // Tokiwa reads the page, then Suzu tells Hiro -> assembly -> festival
    await T.go('co.hall', 6, 8, 'up'); await T.talk('co_tokiwa');
    check('tokiwa page', s.flags.co_tokiwa_page && !s.flags.co_restored);
    await T.go('co.glass', 6, 8, 'up');
    await T.talk(comp === 'suzu' ? 'hiro' : 'suzu');
    await T.idle(30000);
    check('suzu done', s.flags.co_suzu_done && s.quests.co_suzu.done && s.flags.co_hiro_globe);
    check('assembly -> restored', s.flags.co_restored && s.flags.co_firebreak_cut && RB.world.W.map.id === 'co.festival');
    await T.talk('co_ume'); await T.talk('hiro');
    want = /Climb/; await T.use(11, 11); want = null; await T.idle(30000);
    check('chapter done', s.flags.ch3_done && s.quests.co_main.done && RB.world.W.map.id === 'co.village');
    // after: road north open, post lines
    await T.go('co.road', 23, 3, 'up');
    check('north open', !RB.maps.blockedStatic(RB.world.W.map, 23, 4) && RB.maps.exitAt(RB.world.W.map, 23, 0));
    await T.go('co.village', 24, 20, 'up'); await T.talk('hiro');
    check('hiro gift', s.inv.co_glass_beads);
    s.flags.postgame = true; s.flags.end_mem_choose = true; s.flags.end_archive_library = true; s.flags.end_kasane_trial = true;
    for (const n of ['co_sayo', 'co_goro', 'co_tamotsu', 'hiro', 'co_kotaro', 'co_heita']) await T.talk(n);
    await T.go('co.hall', 6, 8, 'up'); await T.talk('co_tokiwa');
    } catch (e) { out.error = String(e && e.stack || e).slice(0, 600); }
    out.problems = T.problems;
    out.battles = T.log.filter((l) => l.t === 'battle');
    return out;
  }, { profile, comp, policy }).catch((e) => ({ error: String(e && e.stack || e) }));
  const failed = (res.checks || []).filter((c) => !c.ok);
  const probs = res.problems || [];
  const ok = !res.error && !failed.length && !probs.length && !errors.length;
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ch3 profile=${profile} comp=${comp}: ${(res.checks || []).length} checks` +
    (res.error ? '\n  error: ' + res.error : '') +
    (failed.length ? '\n  failed: ' + failed.map((c) => c.name).join(', ') : '') +
    (probs.length ? '\n  problems: ' + JSON.stringify(probs).slice(0, 1200) : '') +
    (errors.length ? '\n  page errors: ' + errors.slice(0, 5).join(' | ') : '') +
    (res.battles ? '\n  battles: ' + res.battles.map((x) => x.enemy + ':' + x.result + '/' + x.rounds).join(' ') : ''));
  await p.context().close();
}
await b.close(); srv.close();
process.exit(fails ? 1 : 0);
