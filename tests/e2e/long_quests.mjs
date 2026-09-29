// The two quest lines that span the journey (docs/STORY.md, "Long roads"):
// lq_fare "A Fare Thirty Years Owed" and lq_road "The Name Nobody Calls",
// played through the real world of the BUILT index.html.
//
// Part 1 — fixtures (a few minutes). From a chapter-5-start campaign the goal
//   driver (tests/e2e/drive.mjs) walks through the real maps and exits to each
//   place and person in turn and triggers them the way the game does: every
//   step of both lines, the side area Koharuno, the ally flags, the rewards,
//   an attentive shortcut, and two old saves (one mid-journey, loaded through
//   the real save slots; one after the ending) that had never heard of the
//   lines. After each run: no one drawn twice (RB.test.twice), no lq line
//   spoken by someone who isn't there, no auto-answer problems, no page errors.
// Part 2 — end to end (about 15 minutes). tests/e2e/pursue.mjs from a new
//   campaign, with both lines as goals between the chapters (lq_ally1 after
//   Snowbell, the fare paid, lq_ally2 and Koharuno before Lanternfall, Kayo
//   home after it), then the rest of the game.
// Usage: node tests/e2e/long_quests.mjs [--fixtures-only | --e2e-only] [--all-companions] [profile]
import { spawn } from 'node:child_process';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { install } from './drive.mjs';

const argv = process.argv.slice(2);
const only = argv.includes('--fixtures-only') ? 'fix' : argv.includes('--e2e-only') ? 'e2e' : null;
const allComps = argv.includes('--all-companions');
const profile = argv.find((a) => /^[FEIA]$/.test(a)) || 'E';
let fails = 0;
const say = (ok, m) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + m); };

// A campaign at the start of chapter 5: every earlier chapter finished, the
// Snowbell road open, the bell in Lanternfall not yet rung.
const FX5 = {
  rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_mill_open: true, rw_echo_done: true, bridge_fixed: true, rw_koji_back: true,
  rw_evening: true, rw_hall_gather: true, departed: true, ch1_done: true,
  sg_arrived: true, sg_harbor_seen: true, sg_boss_done: true, sg_returned: true, sg_main_done: true, sg_road_open_seen: true, ch2_done: true,
  co_restored: true, ch3_done: true, sb_arrived: true, sb_lamp_lit: true, ch4_done: true,
};
const DONE = ['rw_labels', 'rw_mill', 'rw_depart', 'sg_main', 'co_main', 'sb_lamp'];
const WORDS = ['mamoru', 'mizu', 'hikari', 'iyasu', 'kaze', 'nawa', 'ishi', 'koori', 'tsuchi', 'honoo'];

async function runFlow(b, url, name, comp, body) {
  const t0 = Date.now();
  const { p, ctx, errors } = await page(b, url);
  await p.evaluate(install);
  await p.evaluate(installSetup);
  let r;
  try { r = await p.evaluate(body, { comp, profile, FX5, DONE, WORDS }); } catch (e) { r = { error: String(e).slice(0, 800) }; }
  const fin = await p.evaluate(() => ({
    twice: RB.test.twice || [], problems: RB.test.problems || [],
    absent: (RB.test.absentSpeakers || []).filter((x) => (x.scene || '').startsWith('lq.')).map((x) => x.who + ' @ ' + x.map + ' (' + x.scene + ')'),
  })).catch(() => ({ twice: [], problems: [], absent: [] }));
  const s = Math.round((Date.now() - t0) / 1000);
  console.log('\n== ' + name + ' [' + comp + '] (' + s + ' s)');
  if (r && r.error) say(false, 'error: ' + r.error);
  if (r && r.drive) for (const d of r.drive) { say(d.ok, 'steps ' + d.label + (d.ok ? ': ' + d.log.length + ' steps' : ': ' + d.fail + ' ' + JSON.stringify(d.sites || d.ran || '').slice(0, 400))); if (process.env.LQ_LOG) console.log('     ' + d.log.join('\n     ')); }
  for (const [m, ok] of (r && r.checks) || []) say(ok, m);
  say(!fin.twice.length, 'nobody drawn twice' + (fin.twice.length ? ': ' + fin.twice.join(', ') : ''));
  say(!fin.absent.length, 'every lq speaker is present' + (fin.absent.length ? ': ' + fin.absent.join(', ') : ''));
  say(!fin.problems.length, 'no auto-answer problems' + (fin.problems.length ? ': ' + JSON.stringify(fin.problems).slice(0, 400) : ''));
  say(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await ctx.close();
  return s;
}

// ---- in-page flows (each runs inside the page; the shared setup is installed
// on the page first as window.LQSetup — the game's CSP forbids eval) ----
function installSetup() {
  window.LQSetup = async function (o, map, x, y, extra) {
    RB.test.enable({ battle: 'unravel', choose: () => 0 });
    const flags = Object.assign({}, o.FX5, extra || {});
    const s = RB.game.debugStart(map, x, y, { comp: o.comp, profile: o.profile, flags });
    s.learn.kanaKnown = 'both';
    s.chapter = 5;
    s.words = o.WORDS.slice();
    for (const q of o.DONE) s.quests[q] = { stage: 0, done: true, t: Date.now() };
    for (const pl in RB.content.places) s.travel[pl] = true;
    // the earlier chapters' arrival scenes have already played in such a campaign
    for (const id in RB.content.maps) for (const ev of RB.content.maps[id].onEnter || []) if (!ev.scene.startsWith('lq.')) s.flags['enter:' + id + ':' + ev.scene] = true;
    await RB.test.idle(60000);
    return s;
  };
}

const LINE_A = async (o) => {
  const s = await window.LQSetup(o, 'rw.village', 22, 30);
  const out = { drive: [], checks: [] }, C = RB.content;
  const stage = () => (s.quests.lq_fare ? (s.quests.lq_fare.done ? 'done' : s.quests.lq_fare.stage) : '-');
  const at = (map) => (C.maps[map].npcs || []).filter((n) => (n.char || n.id) === 'lq_chigusa' && (!n.if || RB.state.test(s, n.if))).length;
  const d1 = await RBDrive.run(['lq.fare_koji', 'lq.fare_book', 'lq.fare_tamae', 'lq.fare_fusa']);
  out.drive.push(Object.assign({ label: 'Reedwake → Saltglass → Cinder Orchard' }, d1));
  out.checks.push(['stage 3 after Fusa (' + stage() + ')', stage() === 3], ['stamp in the satchel', !!s.inv.lq_stamp]);
  out.checks.push(['Chigusa only at her stall before she is found', at('sb.road') === 1 && at('rw.tea') + at('sg.inn') === 0]);
  const d2 = await RBDrive.run(['lq.fare_chigusa', { flag: 'lq_ally1' }, { flag: 'lq_fare_found' }]);
  out.drive.push(Object.assign({ label: 'the Snowbell road' }, d2));
  out.checks.push(['stage 4 at the stall (' + stage() + ')', stage() === 4], ['Chigusa now at Hana\'s teahouse only', at('rw.tea') === 1 && at('sb.road') + at('sg.inn') === 0]);
  const d3 = await RBDrive.run(['lq.fare_pay', { flag: 'lq_fare_paid' }]);
  out.drive.push(Object.assign({ label: 'back to Reedwake' }, d3));
  out.checks.push(['stage 5 after paying (' + stage() + ')', stage() === 5], ['Chigusa now at the Gull only', at('sg.inn') === 1 && at('sb.road') + at('rw.tea') === 0]);
  const d4 = await RBDrive.run(['lq.fare_gull', { questDone: 'lq_fare' }, { flag: 'lq_fare_done' }, 'lq.fare_koji_after', 'lq.fare_tamae_after', 'lq.chigusa_after']);
  out.drive.push(Object.assign({ label: 'back to Saltglass, then the after-lines' }, d4));
  out.checks.push(['reward: the kept cup (charm, +1 resolve)', s.inv.lq_kept_cup === 1 && C.items.lq_kept_cup.slot === 'charm'], ['Chigusa back at her stall only', at('sb.road') === 1 && at('rw.tea') + at('sg.inn') === 0]);
  out.checks.push(['fare book says who paid', RB.content.scenes['lq.fare_book'] && s.flags.lq_fare_paid]);
  return out;
};

const LINE_A_ATTENTIVE = async (o) => {
  const s = await window.LQSetup(o, 'sb.road', 3, 13);
  s.quests.lq_fare = { stage: 2, done: false, t: Date.now() }; // Tamae told of the strong tea; Fusa not yet asked
  s.inv.lq_stamp = 1;
  const out = { drive: [], checks: [] };
  const d = await RBDrive.run(['lq.fare_chigusa']);
  out.drive.push(Object.assign({ label: 'recognised by her tea, before asking Fusa' }, d));
  out.checks.push(['stage 4 without Fusa', s.quests.lq_fare.stage === 4 && s.flags.lq_ally1]);
  return out;
};

const LINE_B = async (o) => {
  const s = await window.LQSetup(o, 'rw.village', 22, 30);
  const out = { drive: [], checks: [] }, C = RB.content;
  const stage = () => (s.quests.lq_road ? (s.quests.lq_road.done ? 'done' : s.quests.lq_road.stage) : '-');
  const yasuAt = () => (C.maps['rw.village'].npcs || []).filter((n) => (n.char || n.id) === 'yasu' && (!n.if || RB.state.test(s, n.if))).map((n) => n.id).join(',');
  // the road east of the ferry house forgets itself until the name is back
  const d0 = await RBDrive.run(['lq.road_loops']);
  out.drive.push(Object.assign({ label: 'the looping path' }, d0));
  out.checks.push(['the path turned you back', RB.world.W.map.id === 'rw.village' && stage() === 0]);
  const d1 = await RBDrive.run(['lq.road_lantern', 'lq.road_yasu1', 'lq.road_tetsu', 'lq.road_ume']);
  out.drive.push(Object.assign({ label: 'Reedwake → Saltglass → Cinder Orchard' }, d1));
  out.checks.push(['stage 3 after Ume (' + stage() + ')', stage() === 3], ['Koharu dried persimmon in the satchel', !!s.inv.lq_koharu_fruit]);
  const d2 = await RBDrive.run(['lq.road_yasu2']);
  out.drive.push(Object.assign({ label: 'back to Old Yasu' }, d2));
  out.checks.push(['stage 4, Yasu waits by the lantern (' + yasuAt() + ')', stage() === 4 && yasuAt() === 'yasu_bank']);
  const d3 = await RBDrive.run([{ scene: 'lq.road_lantern', again: true }, { flag: 'lq_road_open' }, { flag: 'lq_ally2' }]);
  out.drive.push(Object.assign({ label: 'the name written on the lantern' }, d3));
  out.checks.push(['stage 5, Yasu back on the pier (' + yasuAt() + ')', stage() === 5 && yasuAt() === 'yasu']);
  const d4 = await RBDrive.run(['lq.kh_arrive', 'lq.kh_tree', 'lq.kh_chest', 'lq.kh_book', 'lq.kh_stone']);
  out.drive.push(Object.assign({ label: 'Koharuno (the side area)' }, d4));
  out.checks.push(['stage 6 after the tree (' + stage() + ')', stage() === 6], ['found in Koharuno: persimmon-dyed cloth', !!s.inv.lq_tenugui], ['walked into Koharuno through the new exit', !!s.visited['lq.koharu'] && !!s.visited['lq.koharu_hut']]);
  const d5 = await RBDrive.run(['lq.road_kayo_certainly']);
  out.drive.push(Object.assign({ label: 'Lanternfall before the bell' }, d5));
  out.checks.push(['her "certainly" is not an answer', stage() === 6 && !s.flags.lq_kayo_going]);
  s.flags.lf_bell_rung = true; // the main story rings the bell
  const d6 = await RBDrive.run(['lq.road_kayo', 'lq.road_home', { questDone: 'lq_road' }, { flag: 'lq_road_done' }, 'lq.road_yasu_after']);
  out.drive.push(Object.assign({ label: 'after the bell: Kayo goes home' }, d6));
  out.checks.push(['reward: persimmon-seed charm', s.inv.lq_kaki_seed === 1 && C.items.lq_kaki_seed.slot === 'charm'], ['Kayo lives in Koharuno now', (C.maps['lq.koharu'].npcs || []).some((n) => n.id === 'lq_kayo' && RB.state.test(s, n.if)) && !(C.maps['lf.gardens'].npcs || []).some((n) => n.id === 'lq_kayo' && RB.state.test(s, n.if))]);
  return out;
};

// A save from before these lines existed, mid-journey: chapter 3 begun, on the
// Orchard Road. It is written to slot 1 and loaded through the real save code.
const OLD_SAVE = async (o) => {
  RB.test.enable({ battle: 'unravel', choose: () => 0 });
  const st = RB.state.newCampaign({ profile: o.profile });
  const flags = {};
  for (const k in o.FX5) if (/^(rw_|departed|ch1_done|sg_|ch2_done)/.test(k)) flags[k] = true;
  Object.assign(st, { chapter: 3, comp: o.comp, map: 'co.road', x: 3, y: 11, dir: 'right', flags, words: o.WORDS.slice(0, 6) });
  st.player.name = 'Old save'; st.learn.kanaKnown = 'both';
  for (const q of ['rw_labels', 'rw_mill', 'rw_depart', 'sg_main']) st.quests[q] = { stage: 0, done: true, t: 1 };
  for (const pl of ['reedwake', 'saltglass']) st.travel[pl] = true;
  for (const id in RB.content.maps) if (/^(rw|sg)\./.test(id)) for (const ev of RB.content.maps[id].onEnter || []) if (!ev.scene.startsWith('lq.')) st.flags['enter:' + id + ':' + ev.scene] = true;
  const out = { drive: [], checks: [] };
  out.checks.push(['the old save knows nothing of the lines', !Object.keys(st.quests).some((q) => q.startsWith('lq')) && !Object.keys(st.flags).some((f) => f.startsWith('lq'))]);
  await RB.save.writeSlot(1, JSON.parse(JSON.stringify(st)), { force: true });
  await RB.game.loadCampaign(1);
  await RB.test.idle(60000);
  const s = RB.game.s;
  // walk into Cinder Orchard: the letters from home catch up
  const d1 = await RBDrive.run(['lq.letters_home']);
  out.drive.push(Object.assign({ label: 'letters from home on reaching the next town' }, d1));
  out.checks.push(['both lines offered at their second step', s.quests.lq_fare && s.quests.lq_fare.stage === 1 && s.quests.lq_road && s.quests.lq_road.stage === 1], ['Kōji\'s letter carries the stamp', !!s.inv.lq_stamp]);
  // and each goes on from there (back to Saltglass on foot)
  const d2 = await RBDrive.run(['lq.fare_tamae', 'lq.road_tetsu']);
  out.drive.push(Object.assign({ label: 'the next step of each line' }, d2));
  out.checks.push(['lq_fare stage 2, lq_road stage 2', s.quests.lq_fare.stage === 2 && s.quests.lq_road.stage === 2]);
  return out;
};

// A save made after the ending (post-game) that never heard of the lines.
const POST_SAVE = async (o) => {
  const s = await window.LQSetup(o, 'rw.village', 22, 30, { ch5_done: true, lf_bell_rung: true, ch6_done: true, postgame: true, lq_letters: true });
  const out = { drive: [], checks: [] };
  const d = await RBDrive.run(['lq.fare_koji', 'lq.road_lantern', 'lq.road_yasu1']);
  out.drive.push(Object.assign({ label: 'post-game Reedwake: Kōji and the lantern' }, d));
  out.checks.push(['Kōji said his post-game piece first', !!s.seen['rw.koji_post']], ['both lines started after the ending', s.quests.lq_fare && s.quests.lq_fare.stage === 0 && s.quests.lq_road && s.quests.lq_road.stage === 1]);
  return out;
};

const { srv, url } = await serve();
const b = await launch();
const t0 = Date.now();
if (only !== 'e2e') {
  const combos = allComps ? ['nao', 'mio', 'ren', 'suzu'] : null;
  for (const comp of combos || ['nao', 'mio']) await runFlow(b, url, 'Line A — A Fare Thirty Years Owed', comp, LINE_A);
  await runFlow(b, url, 'Line A — attentive shortcut', 'suzu', LINE_A_ATTENTIVE);
  for (const comp of combos || ['ren', 'suzu']) await runFlow(b, url, 'Line B — The Name Nobody Calls', comp, LINE_B);
  await runFlow(b, url, 'Old save (chapter 3, before these lines existed)', 'mio', OLD_SAVE);
  await runFlow(b, url, 'Old save (after the ending)', 'nao', POST_SAVE);
  console.log('\nfixtures: ' + Math.round((Date.now() - t0) / 1000) + ' s');
}
await b.close(); srv.close();

if (only !== 'fix') {
  // Part 2: the whole game from a new campaign, with the two lines as goals
  const legs = [
    'ch1_done@rw.@rw_mill', 'ch2_done@sg.@sg_main', 'ch3_done@co.@co_main', 'ch4_done@sb.@sb_lamp',
    'lq_ally1@rw.|sg.|co.|sb.@lq_fare', 'lq_fare_done@rw.|sg.|co.|sb.@lq_fare',
    'lq_ally2@rw.|sg.|co.|lq.@lq_road', 'ch5_done@lf.@lf_main', 'lq_road_done@rw.|lf.|lq.@lq_road',
    'ch6_done@sa.@sa_main',
  ].join('>');
  const comp = argv.find((a) => ['nao', 'mio', 'ren', 'suzu'].includes(a)) || 'suzu';
  console.log('\n== end to end: tests/e2e/pursue.mjs ' + profile + ' ' + comp + ' (both lines as goals)');
  const t1 = Date.now();
  const code = await new Promise((res) => {
    const ch = spawn(process.execPath, [path.join(root, 'tests/e2e/pursue.mjs'), profile, comp, legs], { stdio: 'inherit' });
    ch.on('close', res);
  });
  say(code === 0, 'whole game with both lines (' + Math.round((Date.now() - t1) / 1000) + ' s)');
}
console.log('\n' + (fails ? fails + ' FAILED' : 'all long-quest checks passed') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)');
process.exit(fails ? 1 : 0);
