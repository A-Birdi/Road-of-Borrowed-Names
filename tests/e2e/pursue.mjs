// Goal-seeking story run through the real world (tests/e2e/drive.mjs pursue):
// from a start map, reach each target flag in turn, each leg limited to one
// chapter's maps. With no start arguments it plays a new campaign through all
// six chapters and one Atlas expedition.
// Usage: node tests/e2e/pursue.mjs [profile] [comp|none] [legs] [startMap x y] [flags] [words]
//   legs: "ch1_done@rw.@rw_mill>ch2_done@sg.@sg_main>…" (flag@mapPrefix@mainQuest)
import { serve, launch, page } from './lib.mjs';
import { install } from './drive.mjs';

// six chapters, then (after the ending returns you to Reedwake) one complete
// Unwritten Atlas expedition, started from the Lantern Hall
const ALL = 'ch1_done@rw.@rw_mill>ch2_done@sg.@sg_main>ch3_done@co.@co_main>ch4_done@sb.@sb_lamp>ch5_done@lf.@lf_main>ch6_done@sa.@sa_main>atlas_restore_1@rw.hall|atlas.@';
const [profile = 'E', comp = 'none', legsArg = ALL, startMap = 'rw.road', sx = '3', sy = '9', flagList = '', wordList = ''] = process.argv.slice(2);
const legs = legsArg.split('>').map((l) => { const [flag, prefix, main] = l.split('@'); return { flag, prefix, main, fullLog: !!process.env.PURSUE_LOG }; });
const { srv, url } = await serve();
const b = await launch();
const { p, errors } = await page(b, url);
const t0 = Date.now();
await p.evaluate(install);
await p.evaluate(async (a) => {
  // A new campaign recruits the companion in the story: prefer choices that
  // name them (e.g. "Set out with Mio"); otherwise the first option.
  const fresh = a.startMap === 'rw.road' && !a.flagList;
  const want = a.comp !== 'none' && RB.content.chars[a.comp] ? RB.content.chars[a.comp].name.en : null;
  const names = ['nao', 'mio', 'ren', 'suzu'].map((c) => RB.content.chars[c].name.en);
  RB.test.enable({ battle: 'unravel', choose: (opts) => {
    if (fresh && want && !RB.game.s.comp) {
      const txt = opts.map((o) => RB.script.enVars(o.en || ''));
      const mine = txt.findIndex((t) => t.includes(want));
      if (mine >= 0) return mine;
      // an option naming someone else would recruit them: take one naming nobody
      if (txt.some((t) => names.some((n) => t.includes(n)))) { const i = txt.findIndex((t) => !names.some((n) => t.includes(n))); if (i >= 0) return i; }
    }
    return 0;
  } });
  const flags = {};
  for (const f of a.flagList.split(',').filter(Boolean)) flags[f] = true;
  const s = RB.game.debugStart(a.startMap, +a.sx, +a.sy, { comp: fresh || a.comp === 'none' ? null : a.comp, profile: a.profile, flags });
  s.learn.kanaKnown = a.profile === 'F' ? 'hira' : 'both';
  for (const w of a.wordList.split(',').filter(Boolean)) if (!s.words.includes(w)) s.words.push(w);
  await RB.test.idle(60000);
  RB.game.runEnterEvents();
  await RB.test.idle(60000);
}, { startMap, sx, sy, comp, profile, flagList, wordList });
const out = [];
let ok = true;
for (const leg of legs) {
  const t1 = Date.now();
  const r = await p.evaluate((leg) => RBDrive.pursue(leg.flag, { prefix: leg.prefix, main: leg.main, max: 900, fullLog: !!leg.fullLog }), leg).catch((e) => ({ ok: false, fail: String(e) }));
  out.push({ leg: leg.flag, ok: r.ok, steps: r.steps, seconds: Math.round((Date.now() - t1) / 1000), fail: r.fail, map: r.map, last: r.ok ? undefined : r.log });
  console.log((r.ok ? 'reached ' : 'STUCK   ') + leg.flag + ' in ' + r.steps + ' site visits (' + Math.round((Date.now() - t1) / 1000) + ' s)');
  if (process.env.PURSUE_LOG && r.log) console.log('  ' + r.log.join('\n  '));
  if (!r.ok) { ok = false; console.log(JSON.stringify(r, null, 1).slice(0, 3000)); break; }
}
const fin = await p.evaluate(() => ({
  comp: RB.game.s.comp, map: RB.world.W.map.id, problems: RB.test.problems.slice(0, 10),
  battles: RB.test.log.filter((l) => l.t === 'battle').map((l) => l.enemy + ':' + l.result),
  quests: Object.fromEntries(Object.entries(RB.game.s.quests).map(([k, q]) => [k, q.done ? 'done' : q.stage])),
  flags: ['post', 'postgame', 'ch6_done'].filter((f) => RB.game.s.flags[f]),
}));
const lost = fin.battles.filter((x) => !x.endsWith(':win'));
if (comp !== 'none' && fin.comp !== comp) { ok = false; console.log('companion ' + fin.comp + ' is not the requested ' + comp); }
console.log(JSON.stringify({ profile, comp: fin.comp, seconds: Math.round((Date.now() - t0) / 1000), map: fin.map, flags: fin.flags, battles: fin.battles.length, lost, problems: fin.problems, pageErrors: errors.slice(0, 5), quests: fin.quests }, null, 1));
await b.close(); srv.close();
process.exit(ok && !fin.problems.length && !errors.length && !lost.length ? 0 : 1);
