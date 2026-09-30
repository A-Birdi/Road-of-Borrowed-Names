// The two deduction cases (addendum §15, §16) in the BUILT index.html, played
// through the real world with the goal driver (tests/e2e/drive.mjs): each
// scene is reached by walking real maps and exits and started the way the
// game starts it; choices are picked by their English text.
//  A. A Parcel for a Place That Moved: the thorough order; clues found before
//     the case is known (the harbour record first); a correct early delivery
//     (the acknowledgement names only what was observed); wrong deliveries
//     are safe and recorded; the strongest help completes it; markers stay
//     concealed until a destination is chosen, then point to that choice.
//  B. The View on the Other Side: every reveal route, Turn over / Compare /
//     Reset from the keyboard, wrong confirmations are safe, the right one
//     resolves; holding the sketch up in the world; the note route; help.
//  Both: a postgame start; evidence kept beyond the 120-line history and
//  through a save/load; keepsakes awarded once; no page errors.
// Usage: node tests/e2e/cases.mjs [--quick]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { install } from './drive.mjs';

const OUT = path.join(root, 'tests/e2e/out/cases');
fs.mkdirSync(OUT, { recursive: true });
let fails = 0;
const say = (ok, m) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + m); };

const FX = {
  rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_mill_open: true, rw_echo_done: true, bridge_fixed: true, rw_koji_back: true,
  rw_evening: true, rw_hall_gather: true, departed: true, ch1_done: true, rw_letters_done: true,
  sg_arrived: true, sg_harbor_seen: true, sg_boss_done: true, sg_returned: true, sg_main_done: true, sg_road_open_seen: true, ch2_done: true,
  sg_tide_read: true, sg_tide_low: true, sg_fog_cleared: true,
  co_restored: true, ch3_done: true, sb_arrived: true, sb_lamp_lit: true, ch4_done: true, sb_path_seen: true,
};
const DONE = ['rw_labels', 'rw_mill', 'rw_depart', 'sg_main', 'co_main', 'sb_lamp'];
const WORDS = ['mamoru', 'mizu', 'hikari', 'iyasu', 'kaze', 'nawa', 'ishi', 'koori', 'tsuchi', 'honoo'];

function installSetup() {
  // choices: the first option whose English matches one of window.PICK (regexps, in order), else the first
  window.PICK = [];
  window.CSSetup = async function (o, map, x, y, extra) {
    RB.test.enable({ battle: 'unravel', choose: (opts) => { for (const re of window.PICK) { const i = opts.findIndex((q) => new RegExp(re, 'i').test(q.en)); if (i >= 0) return i; } return 0; } });
    const flags = Object.assign({}, o.FX, extra || {});
    const s = RB.game.debugStart(map, x, y, { comp: o.comp, profile: 'E', flags });
    s.learn.kanaKnown = 'both';
    s.chapter = o.post ? 6 : 5;
    if (o.post) s.flags.postgame = true;
    s.words = o.WORDS.slice();
    for (const q of o.DONE) s.quests[q] = { stage: 0, done: true, t: Date.now() };
    for (const pl in RB.content.places) s.travel[pl] = true;
    for (const id in RB.content.maps) for (const ev of RB.content.maps[id].onEnter || []) if (!ev.scene.startsWith('cs.')) s.flags['enter:' + id + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    await RB.test.idle(60000);
    return s;
  };
  window.CSBacklog = () => RB.game.s.backlog.map((l) => l.en).join(' | ');
}

async function flow(b, url, name, o, body) {
  const t0 = Date.now();
  const { p, ctx, errors } = await page(b, url);
  await p.evaluate(install);
  await p.evaluate(installSetup);
  let r;
  try { r = await p.evaluate(body, Object.assign({ FX, DONE, WORDS }, o)); } catch (e) { r = { error: String(e).slice(0, 900) }; }
  console.log('\n== ' + name + ' [' + (o.comp || 'none') + '] (' + Math.round((Date.now() - t0) / 1000) + ' s)');
  if (r && r.error) say(false, 'error: ' + r.error);
  for (const d of (r && r.drive) || []) say(d.ok, 'steps ' + d.label + (d.ok ? ': ' + d.log.length + ' steps' : ': ' + d.fail + ' ' + JSON.stringify(d.sites || d.ran || '').slice(0, 400)));
  for (const [m, ok] of (r && r.checks) || []) say(ok, m);
  const probs = await p.evaluate(() => RB.test.problems || []).catch(() => []);
  say(!probs.length, 'no auto-answer problems' + (probs.length ? ': ' + JSON.stringify(probs).slice(0, 300) : ''));
  say(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  if (o.after) await o.after(p);
  await ctx.close();
}

// ---- Case A: the thorough order ------------------------------------------------------------------------------
const A_THOROUGH = async (o) => {
  const s = await window.CSSetup(o, 'rw.village', 22, 30);
  const out = { drive: [], checks: [] }, K = RB.cases;
  window.PICK = ['^Take it along', '^Carry on', 'Leave the parcel here', '^Tell her', 'Close the ledger'];
  const d1 = await RBDrive.run(['cs.parcel_shelf']);
  out.drive.push(Object.assign({ label: 'Reedwake: the shelf of unclaimed parcels' }, d1));
  out.checks.push(['the parcel taken; the case known; its quest started', !!s.inv.cs_parcel && K.known(s, 'parcel') && !!s.quests.cs_parcel]);
  out.checks.push(['address and seal observed', K.observed(s, 'parcel.address') && K.observed(s, 'parcel.seal')]);
  // markers: nothing chosen yet → concealed (the derived answer is not marked)
  RB.questGuide.follow('cs_parcel');
  let g = RB.questGuide.analyse('cs_parcel', s);
  out.checks.push(['before any choice the next step is concealed (' + g.how + ')', g.how === 'concealed' && g.targets.length === 0]);
  const d2 = await RBDrive.run(['cs.parcel_record', 'cs.parcel_oldsite']);
  out.drive.push(Object.assign({ label: 'Saltglass: the record, the old footing (left there?)' }, d2));
  out.checks.push(['leaving it at the footing is refused and recorded as tried', !!s.inv.cs_parcel && !!K.rec(s, 'parcel').tried.oldsite]);
  // the family house: the crest (door), then Seto, who keeps it sealed
  await RB.test.go('sg.harbor', 51, 5, 'up');
  RB.script.run('cs.seto_door'); await RB.test.idle(60000);
  const d3 = await RBDrive.run(['cs.seto_parcel']);
  out.drive.push(Object.assign({ label: 'Seto up the hill (a look-alike crest)' }, d3));
  out.checks.push(['Seto keeps it sealed; tried: family; the parcel still yours', !!s.inv.cs_parcel && !!K.rec(s, 'parcel').tried.family]);
  // choose the family house as a hypothesis: markers now point there (navigation to a chosen place)
  K.choose(s, 'parcel', 'family');
  g = RB.questGuide.analyse('cs_parcel', s);
  out.checks.push(['a chosen destination is what the markers show (' + g.targets.map((t) => t.id).join() + ')', g.how === 'authored' && g.targets.length === 1 && g.targets[0].id === 'cs_seto']);
  const d4 = await RBDrive.run(['cs.parcel_marks', 'cs.hama_bench', 'cs.hama_bell']);
  out.drive.push(Object.assign({ label: 'Cinder Orchard: the record of marks; back to the quay: bench, bell' }, d4));
  K.choose(s, 'parcel', 'keeper');
  g = RB.questGuide.analyse('cs_parcel', s);
  out.checks.push(['choosing the keeper moves the marker to Hama', g.targets.length === 1 && g.targets[0].id === 'cs_hama']);
  out.checks.push(['the evidence is sufficient now', K.sufficient(s, 'parcel')]);
  const got = [];
  const off = RB.bus.on('discovery:resolved', (e) => got.push(e));
  const d5 = await RBDrive.run(['cs.hama_parcel']);
  off();
  out.drive.push(Object.assign({ label: 'the delivery to Hama' }, d5));
  const r = K.rec(s, 'parcel');
  out.checks.push(['solved, method reasoned (' + r.method + ')', r.stage === 'done' && r.method === 'reasoned']);
  out.checks.push(['quest done; parcel handed over', s.quests.cs_parcel.done && !s.inv.cs_parcel]);
  out.checks.push(['keepsake Parcel Seal recorded once', !!s.discovery.keepsakes.parcel_seal && RB.discovery.keepsake(s, 'parcel_seal') === false]);
  out.checks.push(['discovery:resolved emitted once (' + JSON.stringify(got) + ')', got.length === 1 && got[0].kind === 'case' && got[0].id === 'parcel' && got[0].method === 'reasoned']);
  out.checks.push(['resolving again changes nothing', K.resolve(s, 'parcel') === false]);
  const bl = window.CSBacklog();
  out.checks.push(['the acknowledgement names the record, the post house and the bench', /harbour record said/.test(bl) && /post house book/.test(bl) && /notched bench/.test(bl)]);
  out.checks.push(['a companion reaction was chosen and kept', !o.comp || !!s.company.react['case:parcel:done']]);
  // the world shows it: the label over the bench, Hama's new lines
  const lbl = RB.world.W.map.props.find((q) => q.p === 'cs_workbench' && q.o && q.o.label && RB.state.test(s, q.if));
  out.checks.push(['the address label is pinned over the bench now', !!lbl]);
  const d6 = await RBDrive.run(['cs.hama_after']);
  out.drive.push(Object.assign({ label: 'Hama afterwards' }, d6));
  g = RB.questGuide.analyse('cs_parcel', s);
  out.checks.push(['no marker once solved', g.targets.length === 0]);
  return out;
};

// ---- Case A: a clue before the case; an early correct delivery -----------------------------------------------
const A_EARLY = async (o) => {
  const s = await window.CSSetup(o, 'sg.harbor', 27, 12);
  const out = { drive: [], checks: [] }, K = RB.cases;
  window.PICK = ['^Take it along', '^Carry on', '^Tell her'];
  const d1 = await RBDrive.run(['cs.hama_bell']);
  out.drive.push(Object.assign({ label: 'the bell seen before there is any case' }, d1));
  out.checks.push(['the clue is kept though no case is known', K.observed(s, 'parcel.bell') && !K.known(s, 'parcel') && s.discovery.clues['parcel.bell'].case === null]);
  const d2 = await RBDrive.run(['cs.parcel_shelf']);
  out.drive.push(Object.assign({ label: 'Reedwake: the parcel' }, d2));
  out.checks.push(['the earlier clue is tied to the case now, marked as noticed early', s.discovery.clues['parcel.bell'].case === 'parcel' && s.discovery.clues['parcel.bell'].early === true]);
  out.checks.push(['not sufficient yet (no record, no note)', !K.sufficient(s, 'parcel')]);
  const d3 = await RBDrive.run(['cs.hama_parcel']);
  out.drive.push(Object.assign({ label: 'straight to Hama' }, d3));
  const r = K.rec(s, 'parcel');
  out.checks.push(['solved early (' + r.method + ')', r.stage === 'done' && r.method === 'early']);
  const bl = window.CSBacklog();
  out.checks.push(['the acknowledgement claims no record and no post-house note', !/harbour record said/.test(bl) && !/post house book/.test(bl) && /same mark/.test(bl)]);
  out.checks.push(['evidence recorded is only what was observed', JSON.stringify(r.evidence) === JSON.stringify(['parcel.address', 'parcel.seal', 'parcel.bell'])]);
  return out;
};

// ---- Case A: the strongest help completes it ------------------------------------------------------------
const A_HELP = async (o) => {
  const s = await window.CSSetup(o, 'rw.village', 22, 30);
  const out = { drive: [], checks: [] }, K = RB.cases;
  window.PICK = ['^Take it along', '^Carry on', 'only came to deliver'];
  const d1 = await RBDrive.run(['cs.parcel_shelf']);
  out.drive.push(Object.assign({ label: 'the parcel' }, d1));
  const lv = [];
  for (let i = 0; i < 4; i++) { const h = K.askHint(s, 'parcel'); lv.push(h && h.kind); }
  out.checks.push(['four levels, labelled: ' + lv.join(', '), lv.join() === 'nudge,compare,step,solution']);
  out.checks.push(['no fifth level', K.askHint(s, 'parcel') === null]);
  RB.questGuide.follow('cs_parcel');
  const g = RB.questGuide.analyse('cs_parcel', s);
  out.checks.push(['the solution hint discloses Hama to the markers', g.targets.length === 1 && g.targets[0].id === 'cs_hama']);
  const d2 = await RBDrive.run(['cs.hama_parcel']);
  out.drive.push(Object.assign({ label: 'the delivery with help' }, d2));
  const r = K.rec(s, 'parcel');
  out.checks.push(['solved with help, same keepsake (' + r.method + ')', r.stage === 'done' && r.method === 'helped' && !!s.discovery.keepsakes.parcel_seal]);
  return out;
};

// ---- Evidence survives history and save/load ------------------------------------------------------------------
const A_PERSIST = async (o) => {
  const s = await window.CSSetup(o, 'rw.village', 22, 30);
  const out = { drive: [], checks: [] }, K = RB.cases;
  window.PICK = ['^Take it along', '^Carry on', 'Close the ledger'];
  const d1 = await RBDrive.run(['cs.parcel_shelf', 'cs.parcel_record']);
  out.drive.push(Object.assign({ label: 'parcel and record' }, d1));
  K.choose(s, 'parcel', 'oldsite');
  K.setNote(s, 'parcel', 'check the <b>quay</b> first');
  K.askHint(s, 'parcel');
  for (let i = 0; i < 250; i++) s.backlog.push({ who: 'narr', jp: 'あ', en: 'filler ' + i });
  s.backlog = s.backlog.slice(-120);
  const json = JSON.parse(JSON.stringify(s));
  const probs = RB.save.validate(json);
  const back = RB.save.migrate(json);
  out.checks.push(['the history no longer holds the record line', !s.backlog.some((l) => /Landings/.test(l.en))]);
  out.checks.push(['the save validates (' + probs.join('; ') + ')', probs.length === 0]);
  out.checks.push(['after a save/load: clues, hypothesis, note (plain), hint level all kept',
    !!back.discovery.clues['parcel.record'] && back.discovery.cases.parcel.hypothesis === 'oldsite' && back.discovery.cases.parcel.note === 'check the <b>quay</b> first' && back.discovery.hints['case:parcel'] === 1]);
  return out;
};

const { srv, url } = await serve();
const b = await launch();
const comps = ['nao', 'mio', 'ren', 'suzu'];
await flow(b, url, 'Case A — thorough order', { comp: 'nao' }, A_THOROUGH);
await flow(b, url, 'Case A — clue first, early delivery', { comp: 'suzu' }, A_EARLY);
await flow(b, url, 'Case A — strongest help', { comp: 'ren' }, A_HELP);
await flow(b, url, 'Case A — evidence kept', { comp: 'mio' }, A_PERSIST);
await b.close();
srv.close();
console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
process.exit(fails ? 1 : 0);
