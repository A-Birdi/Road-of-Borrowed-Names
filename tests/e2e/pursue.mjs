// Goal-seeking story run through the real world (tests/e2e/drive.mjs pursue):
// from a start map, reach each target flag in turn, each leg limited to one
// chapter's maps. With no start arguments it plays a new campaign through all
// six chapters and one Atlas expedition.
// Usage: node tests/e2e/pursue.mjs [profile] [comp|none] [legs] [startMap x y] [flags] [words]
//   legs: "ch1_done@rw.@rw_mill>ch2_done@sg.@sg_main>…" (flag@mapPrefix@mainQuest)
// From a campaign fixture instead of a new campaign (expansion P08): PURSUE_FROM=<fixture.json> starts there, as the
// save would load (RB.save.migrate), and PURSUE_EDITION=2 plays it in the twelve-chapter edition, e.g.
//   PURSUE_FROM=tests/fixtures/campaign/F-ren-ch2_done.json PURSUE_EDITION=2 node tests/e2e/pursue.mjs F ren 'mb1_done@sg.|mb.@mb_main'
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { install } from './drive.mjs';

// six chapters, then (after the ending returns you to Reedwake) one complete
// Unwritten Atlas expedition, started from the Lantern Hall
const ALL = 'ch1_done@rw.@rw_mill>ch2_done@sg.@sg_main>ch3_done@co.@co_main>ch4_done@sb.@sb_lamp>ch5_done@lf.@lf_main>ch6_done@sa.@sa_main>atlas_restore_1@rw.hall|atlas.@';
const [profile = 'E', comp = 'none', legsArg = ALL, startMap = 'rw.road', sx = '3', sy = '9', flagList = '', wordList = ''] = process.argv.slice(2);
const fromFixture = process.env.PURSUE_FROM ? JSON.parse(fs.readFileSync(path.resolve(root, process.env.PURSUE_FROM), 'utf8')) : null;
const edition = +(process.env.PURSUE_EDITION || 0) || null;
const legs = legsArg.split('>').map((l) => { const [flag, prefix, main] = l.split('@'); return { flag, prefix, main, fullLog: !!process.env.PURSUE_LOG }; });
const { srv, url } = await serve();
const b = await launch();
const { p, errors } = await page(b, url);
const t0 = Date.now();
await p.evaluate(install);
await p.evaluate(async (a) => {
  // A new campaign recruits the companion in the story: prefer choices that
  // name them (e.g. "Set out with Mio"); otherwise the first option.
  const fresh = a.startMap === 'rw.road' && !a.flagList && !a.fixture;
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
  const s = a.fixture ? RB.game.debugStart(a.fixture.map, a.fixture.x, a.fixture.y, {}) : RB.game.debugStart(a.startMap, +a.sx, +a.sy, { comp: fresh || a.comp === 'none' ? null : a.comp, profile: a.profile, flags });
  if (a.fixture) {
    // the fixture's campaign, loaded as its save would be, in place of the session's new one
    const m = RB.save.migrate(JSON.parse(JSON.stringify(a.fixture)));
    for (const k of Object.keys(s)) delete s[k];
    Object.assign(s, m, a.edition ? { edition: a.edition } : {});
    Object.assign(s.flags, flags);
    RB.world.enter(s.map, s.x, s.y, s.dir || 'down');
  }
  s.learn.kanaKnown = a.profile === 'F' ? 'hira' : 'both';
  for (const w of a.wordList.split(',').filter(Boolean)) if (!s.words.includes(w)) s.words.push(w);
  await RB.test.idle(60000);
  RB.game.runEnterEvents();
  await RB.test.idle(60000);
}, { startMap, sx, sy, comp, profile, flagList, wordList, fixture: fromFixture, edition });
const out = [];
let ok = true;
for (const leg of legs) {
  const t1 = Date.now();
  const r = await p.evaluate((leg) => RBDrive.pursue(leg.flag, { prefix: leg.prefix, main: leg.main, max: 900, fullLog: !!leg.fullLog }), leg).catch(async (e) => ({ ok: false, fail: String(e), map: await p.evaluate(() => RB.world.W.map.id).catch(() => null),
    // what was running when the driver stopped: the last scenes and any open activity
    last: await p.evaluate(() => ({ ran: RBDrive.ran.slice(-15), mode: RB.game.mode(), activity: RB.activity && RB.activity.active() ? RB.activity.active().kind : null })).catch(() => null) }));
  out.push({ leg: leg.flag, ok: r.ok, steps: r.steps, seconds: Math.round((Date.now() - t1) / 1000), fail: r.fail, map: r.map, last: r.ok ? undefined : r.log });
  console.log((r.ok ? 'reached ' : 'STUCK   ') + leg.flag + ' in ' + r.steps + ' site visits (' + Math.round((Date.now() - t1) / 1000) + ' s)');
  // S7 (expansion): with PURSUE_FIXTURES=1, the campaign as it stands at each milestone becomes a state fixture
  // (tests/fixtures/campaign/), the real state a player would have there, for tests that start mid-story
  if (r.ok && process.env.PURSUE_FIXTURES) {
    const st = await p.evaluate(() => { const s = JSON.parse(JSON.stringify(RB.game.s)); s.backlog = (s.backlog || []).slice(-20); return s; });
    const dir = path.join(root, 'tests', 'fixtures', 'campaign');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, profile + '-' + comp + '-' + leg.flag + '.json'), JSON.stringify(st));
  }
  if (process.env.PURSUE_LOG && r.log) console.log('  ' + r.log.join('\n  '));
  if (!r.ok) { ok = false; console.log(JSON.stringify(r, null, 1).slice(0, 3000)); break; }
}
const fin = await p.evaluate(() => ({
  comp: RB.game.s.comp, map: RB.world.W.map.id, problems: RB.test.problems.slice(0, 10),
  battles: RB.test.log.filter((l) => l.t === 'battle').map((l) => l.enemy + ':' + l.result),
  // several creatures at once (the last chapter's final stretch and the Atlas, on Standard and Demanding)
  groups: RB.test.log.filter((l) => l.t === 'battle' && l.group && l.group.length).map((l) => [l.enemy].concat(l.group).join('+') + ': ' + l.result + ' in ' + l.rounds),
  difficulty: RB.game.s.learn.difficulty,
  compActs: RB.test.log.filter((l) => l.t === 'battle').reduce((m, l) => { for (const k in l.acts || {}) m[k] = (m[k] || 0) + l.acts[k]; return m; }, {}),
  quests: Object.fromEntries(Object.entries(RB.game.s.quests).map(([k, q]) => [k, q.done ? 'done' : q.stage])),
  flags: ['post', 'postgame', 'ch6_done'].filter((f) => RB.game.s.flags[f]),
  absent: (RB.test.absentSpeakers || []).map((x) => x.who + ' @ ' + x.map + ' (' + (x.scene || '?') + '): ' + x.en),
  nightLeaks: RB.test.nightLeaks || [],
  twice: RB.test.twice || [],
  extras: [...new Set(RB.test.extras || [])],
  departures: [...new Set((RB.test.departures || []).map((d) => (d.arriving ? 'in  ' : 'out ') + d.id + ' @ ' + d.map + ' ' + d.from + ' → ' + (d.exit || '(fades)') + ' toward ' + (d.to || '?') + ' [' + d.reason + ']'))],
}));
// lines spoken by characters who are not on the map (reported, reviewed by hand;
// some are meant — voices through a door, letters, memories)
if (fin.nightLeaks.length) { ok = false; console.log('left a night-only map during its night: ' + fin.nightLeaks.join(', ')); }
// one person, one figure: nobody may be drawn twice at once on a map
if (fin.twice.length) { ok = false; console.log('the same person drawn twice at once: ' + fin.twice.join(', ')); }
if (fin.absent.length) console.log('bodiless speakers (' + fin.absent.length + '):\n  ' + fin.absent.join('\n  '));
fs.mkdirSync(path.join(root, 'tests/e2e/out'), { recursive: true });
if (fin.extras.length) console.log('walked in to speak (' + fin.extras.length + '):\n  ' + fin.extras.join('\n  '));
// comings and goings: where people walked to, and why that way (reviewed by
// hand; "nearest" means no destination was known and the nearest way was used)
const guessed = fin.departures.filter((d) => /\[nearest/.test(d));
console.log('comings and goings: ' + fin.departures.length + ' (' + guessed.length + ' by the nearest way)' + (guessed.length ? ':\n  ' + guessed.join('\n  ') : ''));
fs.writeFileSync(path.join(root, 'tests/e2e/out', 'speakers-' + profile + '-' + comp + '.json'), JSON.stringify({ absent: fin.absent, extras: fin.extras, departures: fin.departures }, null, 1));
console.log('groups met (' + fin.groups.length + ', ' + fin.difficulty + '): ' + fin.groups.join('; '));
console.log('companion actions taken: ' + JSON.stringify(fin.compActs));
// L19: the language interactions this route met, by chapter, place and kind (src/learn/30_meter.js)
console.log('interactions met: ' + JSON.stringify(await p.evaluate(() => RB.meter.report(RB.game.s))));
const lost = fin.battles.filter((x) => !x.endsWith(':win'));
if (comp !== 'none' && fin.comp !== comp) { ok = false; console.log('companion ' + fin.comp + ' is not the requested ' + comp); }
console.log(JSON.stringify({ profile, comp: fin.comp, seconds: Math.round((Date.now() - t0) / 1000), map: fin.map, flags: fin.flags, battles: fin.battles.length, lost, problems: fin.problems, pageErrors: errors.slice(0, 5), quests: fin.quests }, null, 1));
await b.close(); srv.close();
process.exit(ok && !fin.problems.length && !errors.length && !lost.length ? 0 : 1);
