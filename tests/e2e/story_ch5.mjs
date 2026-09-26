// Chapter 5 (Lanternfall) main path in a real browser, driven through the
// world (NPCs, props, exits) by tests/e2e/drive.mjs with RB.test auto mode.
// Usage: node tests/e2e/story_ch5.mjs [profile] [companion] [battle policy]
import { serve, launch, page } from './lib.mjs';
import { install } from './drive.mjs';

const profiles = process.argv[2] ? [process.argv[2]] : ['F', 'I'];
const comps = process.argv[3] ? [process.argv[3]] : ['nao', 'mio', 'ren', 'suzu'];
const policy = process.argv[4] || 'unravel';
const { srv, url } = await serve();
const b = await launch();
let fails = 0;
for (const profile of profiles) for (const comp of comps) {
  const { p, errors } = await page(b, url);
  const steps = [
    'lf.arrive', 'lf.town_intro',
    ...(comp === 'mio' ? ['lf.mio_start'] : []),
    'lf.tadashi', 'lf.records_ledger', 'lf.akari_hint', // after the ledger, Akari's hint scene (it includes her introduction)
    'lf.stacks_door', 'lf.stacks_enter', 'lf.minutes_chest', 'lf.conduit',
    'lf.yae_minutes', // with the minutes in hand, Councillor Tami's scene covers the introduction
    ...(comp === 'nao' ? ['lf.nao_umi_first'] : []),
    ...(comp === 'mio' ? ['lf.mio_refuse'] : []),
    { scene: 'lf.tokuji_early', optional: true }, 'lf.tokuji_story',
    { word: 'suzu' },
    'lf.boat_to_tower', 'lf.tower_arrive',
    // gate A: close the upper gate, then open the lower one
    'lf.plate_a', 'lf.wheel_upper', 'lf.wheel_lower', { flag: 'lf_gate_a' },
    'lf.mid_enter', 'lf.junction', { word: 'koe' },
    // gate B: open the east door, pull the west plug, close the east door
    'lf.plate_b', 'lf.east_door', 'lf.west_plug', { flag: 'lf_mid_drained' }, { scene: 'lf.east_door', again: true }, { flag: 'lf_gate_b' },
    'lf.low_enter', 'lf.plate_c', 'lf.south_plug', 'lf.north_plug', { flag: 'lf_gate_c' },
    'lf.waterline', 'lf.tower_key', 'lf.boss_intro', { flag: 'lf_boss_done' },
    'lf.bell_touch', { flag: 'lf_bell_rung' },
    'lf.after_town',
    ...(comp === 'nao' ? ['lf.nao_deliver'] : []),
    { scene: 'lf.akari_after', optional: true }, 'lf.yae_after', { flag: 'ch5_done' },
    { questDone: 'lf_main' },
  ];
  await p.evaluate(install);
  const res = await p.evaluate(async ({ profile, comp, policy }) => {
    RB.test.enable({ battle: policy, choose: () => 0 });
    const s = RB.game.debugStart('lf.road', 2, 13, { profile, comp, dir: 'right',
      flags: { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, sb_hoshino_goes: true } });
    s.learn.kanaKnown = profile === 'F' ? 'hira' : 'both';
    s.words = ['mamoru', 'mizu', 'hikari', 'iyasu', 'kaze', 'nawa', 'ishi', 'koori', 'tsuchi', 'honoo'];
    s.chapter = 4;
    await RB.test.idle(60000);
    RB.game.runEnterEvents();
    return true;
  }, { profile, comp, policy });
  const r = await p.evaluate((steps) => RBDrive.run(steps), steps).catch((e) => ({ ok: false, fail: String(e) }));
  const extra = await p.evaluate(() => ({ problems: RB.test.problems, battles: RB.test.log.filter((l) => l.t === 'battle').map((l) => l.enemy + ':' + l.result + '/' + l.rounds) }));
  const ok = r.ok && !extra.problems.length && !errors.length;
  if (!ok) fails++;
  console.log((ok ? 'PASS' : 'FAIL') + ` ch5 profile=${profile} comp=${comp}: ${r.log ? r.log.length : 0} steps`);
  console.log('  battles: ' + extra.battles.join(' '));
  if (!ok) console.log(JSON.stringify({ fail: r.fail, map: r.map, sites: r.sites, ran: r.ran, problems: extra.problems.slice(0, 5), errors: errors.slice(0, 5), last: (r.log || []).slice(-4) }, null, 1));
  await p.context().close();
}
await b.close(); srv.close();
process.exit(fails ? 1 : 0);
