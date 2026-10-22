// RBN-QA-121 (Agnes 6346458503; Cloud CC-126 §7): the Channel's valve, turned from the middle chamber and from the
// small wheel at either end. In Chromium on the built game, with throwaway journeys, at each of the three, each way:
//  1. forward: the end wheels first say what they are (a small wheel, piped to the big valve in the middle chamber);
//     then "You turn the valve. Steam floods the lower passage, and the upper one clears.", never "the big valve";
//     the flag is set and the steam moves (the lower corridor's wall of steam up, the upper one's gone);
//  2. back: "You turn the valve back. …"; the flag is clear and the steam as it was;
//  3. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/valve_line.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const YN = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_done: true, cr_delivered: true, yn_called: true, yn_kami_seen: true, yn_rooms_done: true, yn_shimo_seen: true, yn_shimo_heard: true, yn_quarrel: true, yn_guild_told: true, yn_vents_open: true, yn_vents1_seen: true };
const FWD = 'You turn the valve. Steam floods the lower passage, and the upper one clears.';
const BACK = /^You turn the valve back\. The steam returns to the upper passage, and the lower clears\./;
const END = /^At the end of the passage there's a small valve wheel\. Its pipe runs to the big valve in the middle chamber\./;
const errs = [];

// standing beside each valve, facing it
const AT = [['the middle chamber\'s valve (19,15)', 19, 16, 'up', false], ['the west end\'s wheel (4,18)', 4, 19, 'up', true], ['the east end\'s wheel (29,5)', 28, 5, 'right', true]];
for (const [name, x, y, dir, isEnd] of AT) {
  const { p, errors } = await page(b, url);
  await p.evaluate(([YN, x, y, dir]) => {
    const s = RB.game.debugStart('yn.vents2', x, y, { dir, edition: RB.edition.forNew(), comp: 'mio', flags: Object.assign({}, YN) });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    s.quests.yn_main = { stage: 5, done: false, t: Date.now() };
    RB.game.settings.textSpeed = 'instant';
    RB.world.enter('yn.vents2', x, y, dir, { fresh: true });
  }, [YN, x, y, dir]);
  await p.waitForTimeout(800);
  const turn = async () => {
    await p.evaluate(() => RB.world.interact());
    const lines = [];
    for (let i = 0; i < 120; i++) {
      const st = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return { en: d ? String(d.en || '') : null, run: RB.script.isRunning() }; });
      if (st.en != null) { if (lines[lines.length - 1] !== st.en) { lines.push(st.en); await p.waitForTimeout(120); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); } await p.waitForTimeout(60); continue; }
      if (!st.run && lines.length) break;
      await p.waitForTimeout(60);
    }
    await p.waitForTimeout(400);
    const w = await p.evaluate(() => {
      const s = RB.game.s, M = RB.world.W.map;
      const live = (q) => !q.if || RB.state.test(s, q.if);
      return { flag: !!s.flags.yn_shutter, walls: M.props.filter((q) => q.p === 'yn_steamwall' && live(q)).map((q) => q.x + ',' + q.y) };
    });
    return Object.assign({ lines }, w);
  };
  const f = await turn();
  const fl = f.lines.filter((l) => /^You turn the/.test(l));
  ok((!isEnd || END.test(f.lines[0] || '')) && fl.length === 1 && fl[0] === FWD && !f.lines.some((l) => /big valve\. Steam|You turn the big/.test(l)) && f.flag && f.walls.join() === '9,19', name + ', forward: ' + (isEnd ? 'the small wheel first, then ' : '') + '"' + (fl[0] || '') + '"; the flag set, the steam in the lower corridor (' + JSON.stringify(f) + ')');
  const r = await turn();
  const rl = r.lines.filter((l) => /^You turn the/.test(l));
  ok((!isEnd || END.test(r.lines[0] || '')) && rl.length === 1 && BACK.test(rl[0]) && !r.flag && r.walls.join() === '25,4', name + ', back: "' + (rl[0] || '') + '"; the flag clear, the steam back in the upper corridor (' + JSON.stringify(r) + ')');
  errs.push(...errors);
  await p.close();
}
ok(errs.length === 0, 'no page errors' + (errs.length ? ' (' + errs.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
