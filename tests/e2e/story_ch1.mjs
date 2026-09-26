// Chapter 1 story flow in a real browser (built index.html), using RB.test
// auto mode: real scenes, flags, maps, transitions; answers/battles solved by
// the harness. Runs once per companion and profile.
// Usage: node tests/e2e/story_ch1.mjs [profile] [companion]
import { serve, launch, page } from './lib.mjs';

const profiles = process.argv[2] ? [process.argv[2]] : ['F', 'A'];
const comps = process.argv[3] ? [process.argv[3]] : ['nao', 'mio', 'ren', 'suzu'];
const { srv, url } = await serve();
const b = await launch();
let fails = 0;

for (const profile of profiles) for (const comp of comps) {
  const { p, errors } = await page(b, url);
  const res = await p.evaluate(async ({ profile, comp }) => {
    const T = RB.test;
    const out = { checks: [] };
    const check = (name, ok, extra) => out.checks.push({ name, ok: !!ok, extra });
    // choice policy: prefer the option that leads to a named "ask/help/yes/go/clear/fix/tell/sing/rest" label
    let want = null;
    T.enable({
      battle: 'unravel',
      choose: (opts) => {
        if (want) { const i = opts.findIndex((o) => want.test(o.en || '')); if (i >= 0) return i; }
        return 0;
      },
    });
    const s = RB.game.debugStart('rw.road', 3, 9, { profile, dir: 'right' });
    s.learn.kanaKnown = profile === 'F' ? 'none' : 'both';
    await RB.script.run('rw.arrive');
    await T.idle();
    // east exit is locked by mist until the lantern is relit
    T.place(30, 9, 'right');
    await T.step('right');
    check('mist blocks east before lantern', RB.world.W.map.id === 'rw.road');
    await T.use(14, 8);
    check('road lantern lit', s.flags.rw_road_lit);
    if (profile === 'F') check('first kana group taught', Object.keys(s.learn.taught || {}).length >= 5);
    T.place(30, 9, 'right');
    await T.step('right');
    await T.idle();
    check('entered village', RB.world.W.map.id === 'rw.village');
    await T.talk('tsuru');
    check('quest 1 started', s.quests.rw_labels && !s.quests.rw_labels.done);
    check('word mamoru', s.words.includes('mamoru'));
    await T.go('rw.apoth', 4, 6, 'up'); await T.talk('mio');
    check('bottles done', s.flags.rw_bottles_done && s.words.includes('iyasu'));
    await T.go('rw.warehouse', 5, 6, 'up'); await T.talk('nao');
    check('letters done', s.flags.rw_letters_done);
    await T.go('rw.village', 30, 20, 'up'); await T.talk('ren');
    await T.use(20, 22); await T.use(32, 18);
    check('lanterns done', s.flags.rw_lanterns_done && s.words.includes('hikari'));
    await T.talk('suzu');
    await T.go('rw.tea', 4, 6, 'up'); await T.talk('hana');
    await T.go('rw.village', 22, 17, 'up'); await T.talk('tsuru');
    check('quest 1 done, mill open', s.quests.rw_labels.done && s.flags.rw_mill_open);
    // mill road
    await T.go('rw.millroad', 10, 24, 'up');
    await T.talk('mio');
    check('gear pin from Sae', s.inv.rw_wheel_pin === 1);
    await T.use(7, 17);
    check('millroad lantern', s.flags.rw_mr_ren);
    want = /clear/i; await T.talk('nao'); want = null;
    check('shortcut opened', s.flags.rw_mr_nao);
    await T.talk('suzu');
    check('narrows sung open', s.flags.rw_mr_suzu);
    await T.go('rw.mill1', 7, 10, 'up');
    await T.use(10, 2);
    check('gears fixed', s.flags.rw_gears);
    await T.use(2, 2);
    check('in loft', RB.world.W.map.id === 'rw.mill2');
    await T.use(4, 4); await T.use(9, 3); await T.use(9, 6); await T.use(11, 7);
    await T.use(6, 2);
    check('loft lantern', s.flags.rw_loft_done);
    await T.go('rw.mill1', 7, 8, 'up');
    T.place(6, 7, 'up');
    await RB.script.run('rw.m1_boss');
    await T.idle(30000);
    check('echo settled, bridge fixed', s.flags.rw_echo_done && s.flags.bridge_fixed);
    check('koji back', s.flags.rw_koji_back);
    check('word mizu', s.words.includes('mizu'));
    // Lantern Hall: provisional choice, switch, then commit
    await T.go('rw.hall', 5, 8, 'up');
    await T.idle();
    check('gathered', s.flags.rw_hall_gather);
    const other = comp === 'mio' ? 'nao' : 'mio';
    want = /come with me/i; await T.talk(other); want = null;
    check('provisional first pick', s.provisional === other);
    want = /come with me/i; await T.talk(comp); want = null;
    check('switched provisional', s.provisional === comp && !s.comp);
    want = /Set out/i; await T.use(4, 2); want = null;
    await T.idle(30000);
    check('committed companion', s.comp === comp && !s.provisional && s.flags.departed);
    check('chapter 1 done', s.flags.ch1_done);
    check('on the road', RB.world.W.map.id === 'rw.road');
    check('companion follows', !!RB.world.W.comp && RB.world.W.comp.id === comp);
    // Lock: going back cannot recruit a third
    await T.go('rw.hall', 5, 8, 'up');
    check('candidates gone from hall', !RB.world.W.npcs.some((n) => ['nao', 'mio', 'ren', 'suzu'].includes(n.id)));
    await RB.game.recruit(other);
    check('recruit ignored after departure', s.comp === comp && !s.provisional);
    // party size never exceeds two
    check('exactly one companion actor', RB.world.W.comp && RB.world.W.npcs.every((n) => n.id !== comp));
    out.problems = T.problems;
    out.battles = T.log.filter((l) => l.t === 'battle');
    return out;
  }, { profile, comp }).catch((e) => ({ error: String(e && e.stack || e) }));
  const failed = (res.checks || []).filter((c) => !c.ok);
  const probs = res.problems || [];
  const ok = !res.error && !failed.length && !probs.length && !errors.length;
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ch1 profile=${profile} comp=${comp}: ${(res.checks || []).length} checks` +
    (res.error ? '\n  error: ' + res.error : '') +
    (failed.length ? '\n  failed: ' + failed.map((c) => c.name).join(', ') : '') +
    (probs.length ? '\n  problems: ' + JSON.stringify(probs).slice(0, 800) : '') +
    (errors.length ? '\n  page errors: ' + errors.slice(0, 5).join(' | ') : '') +
    (res.battles ? '\n  battles: ' + res.battles.map((x) => x.enemy + ':' + x.result + '/' + x.rounds).join(' ') : ''));
  await p.context().close();
}
await b.close(); srv.close();
process.exit(fails ? 1 : 0);
