// RBN-QA-117 (Agnes 6345492041, 6345823982, 6345967079): Steamhollow's Journey and guide at two steps, in Chromium on
// the built game, with throwaway journeys:
//  1. stage 3, after Tahei: the Journey's "What to do now" names the red bridge in the lower town (before Tahei, as it
//     was); the "Next" line and its bearing from Tahei's spot, the Lower House's door and the upper town's street are
//     recorded, and from the lower town west of the bridge they point east;
//  2. stage 5, the grille shut: the "Next" line names Aki in the lower town; open, and in a journey restored from
//     that state elsewhere in the valley, not;
//  3. each companion: the same lines;
//  4. no page errors.
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BEFORE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_done', 'cr_called', 'cr_done', 'cr_delivered', 'yn_called', 'yn_kami_seen', 'yn_rooms_done', 'yn_shimo_seen'];
async function at(p, map, x, y, comp, stage, flags) {
  await p.evaluate(async ([map, x, y, comp, stage, flags, BEFORE]) => {
    const f = Object.assign({}, flags);
    for (const k of BEFORE) f[k] = true;
    const s = RB.game.debugStart(map, x, y, { comp, dir: 'down', edition: RB.edition.forNew(), flags: f });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    s.quests.yn_main = { stage, done: false, t: 1 };
    RB.questGuide.follow && RB.questGuide.follow('yn_main');
    await new Promise((r) => setTimeout(r, 900));
  }, [map, x, y, comp, stage, flags || {}, BEFORE]);
}
async function journey(p) {
  await p.evaluate(() => { if (RB.ui.menu.isOpen()) RB.ui.menu.close(); RB.ui.menu.open('journal'); });
  await p.waitForTimeout(300);
  await p.evaluate(() => { const e = document.querySelector('.leaf button.entry[data-q="yn_main"]'); if (e) e.click(); });
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({ obj: (document.querySelector('.qdetail .obj') || {}).textContent || '', next: [...document.querySelectorAll('.qnext .nline')].map((e) => e.textContent) }));
  await p.evaluate(() => RB.ui.menu.close());
  await p.waitForTimeout(200);
  return r;
}
const errs = [];
const bearings = [];
for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  // 1. stage 3
  await at(p, 'yn.shimo', 3, 3, comp, 3, {});
  const before = await journey(p);
  ok(/Hear the Lower House/.test(before.obj), comp + ': stage 3 before Tahei: "' + before.obj.slice(-60) + '"');
  for (const [where, map, x, y] of [['Tahei\'s spot', 'yn.shimo', 3, 3], ['the Lower House\'s door', 'yn.shimo', 6, 8], ['the upper town\'s street', 'yn.upper', 20, 26], ['the lower town, west of the bridge', 'yn.lower', 12, 16]]) {
    await at(p, map, x, y, comp, 3, { yn_shimo_heard: true });
    const j = await journey(p);
    if (where === 'Tahei\'s spot') ok(/red bridge in the lower town/.test(j.obj) && !/Hear the Lower House/.test(j.obj), comp + ': stage 3 after Tahei: "' + j.obj.slice(-70) + '"');
    if (comp === 'nao') bearings.push(where + ': ' + j.next.join(' | '));
    if (where === 'the lower town, west of the bridge') ok(j.next.some((t) => /east/i.test(t)), comp + ': from the lower town west of the bridge, the bearing points east: ' + j.next.join(' | '));
  }
  // 2. stage 5
  await at(p, 'yn.lower', 12, 16, comp, 5, { yn_shimo_heard: true, yn_quarrel: true, yn_guild_told: true });
  const shut = await journey(p);
  ok(shut.next.some((t) => /Aki/.test(t)), comp + ': stage 5, the grille shut: "Next" names Aki: ' + shut.next.join(' | '));
  await at(p, 'yn.lower', 12, 16, comp, 5, { yn_shimo_heard: true, yn_quarrel: true, yn_guild_told: true, yn_vents_open: true });
  const open = await journey(p);
  ok(!open.next.some((t) => /Aki/.test(t)), comp + ': the grille open: "Next" no longer names Aki: ' + open.next.join(' | '));
  // (a journey started afresh from the same state: what a load restores is the journey's flags and stage)
  await at(p, 'yn.upper', 20, 20, comp, 5, { yn_shimo_heard: true, yn_quarrel: true, yn_guild_told: true, yn_vents_open: true });
  const after = await journey(p);
  ok(!after.next.some((t) => /Aki/.test(t)), comp + ': and in a journey restored with the grille open, elsewhere in the valley: ' + after.next.join(' | '));
  errs.push(...errors);
  await p.close();
}
console.log('bearings (Nao): ' + bearings.join(' || '));
ok(errs.length === 0, 'no page errors' + (errs.length ? ' (' + errs.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
