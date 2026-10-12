// Goal-seeking story run through the real world (tests/e2e/drive.mjs pursue):
// from a start map, reach each target flag in turn, each leg limited to one
// chapter's maps. With no start arguments it plays a new campaign through all
// six chapters and one Atlas expedition.
// Usage: node tests/e2e/pursue.mjs [profile] [comp|none] [legs] [startMap x y] [flags] [words]
//   legs: "ch1_done@rw.@rw_mill>ch2_done@sg.@sg_main>…" (flag@mapPrefix@mainQuest)
// The twelve chapters chained from a new journey (expansion P14, XP79): PURSUE_EDITION=2 with the legs of
// LEGS12 below, e.g.  PURSUE_EDITION=2 node tests/e2e/pursue.mjs F ren twelve; since the edition shipped (C-84),
// PURSUE_EDITION=new takes the edition the build gives a new journey instead of naming one. 'twelve' with
// PURSUE_EDITION=new is P18's launcher (matrix.mjs --twelve): it asserts the edition and the milestone order.
// Every run starts from RB.game.debugStart, not from the title screen: the title, creation and prologue have their
// own suites (title_ledger.mjs, create.mjs, prologue.mjs)
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
// the twelve-chapter edition's chapters in order (each leg's map prefixes are where that chapter's story goes)
const LEGS12 = ['ch1_done@rw.@rw_mill', 'ch2_done@sg.@sg_main', 'mb1_done@sg.|mb.@mb_main', 'mb2_done@mb.|mp.@mp_main',
  'ch3_done@rw.|sg.|mb.|mp.|co.@co_main', 'ch4_done@co.|sb.@sb_lamp', 'kr_done@sb.|kr.@kr_main', 'ch5_done@kr.|lf.|lf2.@lf_main',
  'ko_done@lf.|lf2.|sg.|ko.@ko_main', 'cr_called@ko.|sg.|lf.|lf2.@cr_main', 'cr_passed@sg.|lf.|lf2.|cr.@cr_main', 'cr_done@sg.|lf.|lf2.|cr.@cr_main',
  'yn_called@cr.|lf.|lf2.|sg.@yn_main', 'yn_vents_open@cr.|yn.@yn_main', 'yn_kettle_settled@cr.|yn.@yn_main', 'yn_done@cr.|yn.@yn_main',
  // the Archive's own sites only: with Steamhollow's still open, the driver kept going back to its baths and valves
  // (repeatable scenes it counts as unseen) and never left; from yn_done the Archive's sites alone reach the end
  'ch6_done@sa.@sa_main'].join('>');
const argv = process.argv.slice(2);
// the twelve-chapter route (P18's launcher, matrix.mjs --twelve): its edition must be the twelve-chapter one, the one
// the shipped build gives a new journey, and its milestones must come in this order (checked below)
const TWELVE_ROUTE = argv[2] === 'twelve';
if (TWELVE_ROUTE) argv[2] = LEGS12;
const [profile = 'E', comp = 'none', legsArg = ALL, startMap = 'rw.road', sx = '3', sy = '9', flagList = '', wordList = ''] = argv;
const fromFixture = process.env.PURSUE_FROM ? JSON.parse(fs.readFileSync(path.resolve(root, process.env.PURSUE_FROM), 'utf8')) : null;
// PURSUE_EDITION=new: the edition this build gives a new journey (RB.edition.forNew(), as the creation wizard does)
const edition = process.env.PURSUE_EDITION === 'new' ? 'new' : +(process.env.PURSUE_EDITION || 0) || null;
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
  // (with no fixture: a new journey placed by RB.game.debugStart on the road at the prologue's end, with the edition
  // asked for; the title screen, the creation wizard and the prologue are not played here: title_ledger.mjs,
  // create.mjs and prologue.mjs play those through the real interface)
  const s = a.fixture ? RB.game.debugStart(a.fixture.map, a.fixture.x, a.fixture.y, {}) : RB.game.debugStart(a.startMap, +a.sx, +a.sy, Object.assign({ comp: fresh || a.comp === 'none' ? null : a.comp, profile: a.profile, flags }, a.edition ? { edition: a.edition === 'new' ? RB.edition.forNew() : a.edition } : {}));
  if (a.fixture) {
    // the fixture's campaign, loaded as its save would be, in place of the session's new one
    const m = RB.save.migrate(JSON.parse(JSON.stringify(a.fixture)));
    for (const k of Object.keys(s)) delete s[k];
    Object.assign(s, m, a.edition ? { edition: a.edition === 'new' ? RB.edition.forNew() : a.edition } : {});
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
// the edition this journey actually got (asserted for the twelve-chapter route: PURSUE_EDITION=new must resolve to
// the twelve-chapter edition the shipped build gives a new journey, and the journey must carry it)
const ed = await p.evaluate(() => ({ journey: RB.game.s.edition, forNew: RB.edition.forNew(), twelve: RB.edition.TWELVE }));
console.log('edition: journey ' + ed.journey + ', a new journey gets ' + ed.forNew + ' (twelve-chapter = ' + ed.twelve + ')');
if (TWELVE_ROUTE && !(ed.journey === ed.twelve && ed.forNew === ed.twelve && edition === 'new')) {
  console.log('NOT THE SHIPPED TWELVE-CHAPTER EDITION: the twelve-chapter route needs PURSUE_EDITION=new on a build that gives new journeys the twelve-chapter edition');
  ok = false;
}
// the route is a whole campaign from its start: a fixture would begin it part-way through
if (TWELVE_ROUTE && fromFixture) { console.log('NOT A WHOLE CAMPAIGN: the twelve-chapter route starts a new journey, not PURSUE_FROM'); ok = false; }
const order = [];
// the order the milestones are first set in, recorded as the game sets them (the journey's flags behind a recording
// proxy; the game copies state as JSON, so nothing else notices it). A later milestone may follow an earlier one within
// the same leg (the Cloudroad's end, then Steamhollow's call at the next station), but never come before it. A
// milestone already set at the start (a preset flag, a fixture) counts as set first.
await p.evaluate((ms) => {
  const s = RB.game.s, want = new Set(ms);
  const seq = (window.__milestones = ms.filter((f) => s.flags[f]));
  const note = (t, k, v) => { if (v && !t[k] && want.has(k) && seq.indexOf(k) < 0) seq.push(k); };
  s.flags = new Proxy(s.flags, { set(t, k, v) { note(t, k, v); t[k] = v; return true; }, defineProperty(t, k, d) { note(t, k, d.value); return Reflect.defineProperty(t, k, d); } });
}, legs.map((l) => l.flag));
const milestonesSet = () => p.evaluate(() => (window.__milestones || []).slice());
for (const leg of ok ? legs : []) {
  const t1 = Date.now();
  const r = await p.evaluate((leg) => RBDrive.pursue(leg.flag, { prefix: leg.prefix, main: leg.main, max: 900, fullLog: !!leg.fullLog }), leg).catch(async (e) => ({ ok: false, fail: String(e), map: await p.evaluate(() => RB.world.W.map.id).catch(() => null),
    // what was running when the driver stopped: the last scenes and any open activity
    last: await p.evaluate(() => ({ ran: RBDrive.ran.slice(-15), mode: RB.game.mode(), activity: RB.activity && RB.activity.active() ? RB.activity.active().kind : null })).catch(() => null) }));
  out.push({ leg: leg.flag, ok: r.ok, steps: r.steps, seconds: Math.round((Date.now() - t1) / 1000), fail: r.fail, map: r.map, last: r.ok ? undefined : r.log });
  console.log((r.ok ? 'reached ' : 'STUCK   ') + leg.flag + ' in ' + r.steps + ' site visits (' + Math.round((Date.now() - t1) / 1000) + ' s)');
  // the milestone sequence: on reaching a leg, the milestones set so far are the route's own, first to last, in the
  // order they were set (nothing out of order, nothing skipped), and this leg's is among them
  if (r.ok) {
    const seq = await milestonesSet();
    order.push(leg.flag);
    if (!seq.every((f, i) => legs[i] && f === legs[i].flag)) { ok = false; console.log('OUT OF ORDER: on reaching ' + leg.flag + ', the milestones were set in the order ' + seq.join(' > ')); }
    else if (seq.indexOf(leg.flag) < 0) { ok = false; console.log('NOT SEEN SET: ' + leg.flag + ' holds but the recorder did not see it set'); }
  }
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
  edition: RB.game.s.edition,
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
const setSeq = await milestonesSet().catch(() => []);
if (order.length !== legs.length || setSeq.length !== legs.length) ok = false;
console.log('milestones reached in order: ' + order.length + '/' + legs.length + (order.length ? ' (' + order.join(' > ') + ')' : ''));
console.log('milestones in the order the game set them: ' + setSeq.length + '/' + legs.length + (setSeq.length ? ' (' + setSeq.join(' > ') + ')' : ''));
console.log(JSON.stringify({ profile, comp: fin.comp, seconds: Math.round((Date.now() - t0) / 1000), map: fin.map, flags: fin.flags, battles: fin.battles.length, lost, problems: fin.problems, pageErrors: errors.slice(0, 5), quests: fin.quests }, null, 1));
await b.close(); srv.close();
process.exit(ok && !fin.problems.length && !errors.length && !lost.length ? 0 : 1);
