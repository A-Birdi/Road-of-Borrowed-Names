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
  co_restored: true, ch3_done: true, sb_arrived: true, sb_lamp_lit: true, ch4_done: true, sb_path_seen: true, sb_stair_open: true,
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


// ---- Case B: the full route, through the case record's buttons -------------------------------------------
const B_FULL = async (o) => {
  const s = await window.CSSetup(o, 'sg.harbor', 27, 12);
  const out = { drive: [], checks: [] }, K = RB.cases, V = RB.content.caseView;
  window.PICK = ['May I borrow', '^Carry on', 'Close the book', '^Sit and look out', '^Look out'];
  const d1 = await RBDrive.run(['cs.view_window']);
  out.drive.push(Object.assign({ label: 'Saltglass: the sketch in the lighthouse window' }, d1));
  out.checks.push(['sketch lent, backing paper given, case open', !!s.inv.cs_sketch && !!s.flags.cs_view_backing && K.known(s, 'view')]);
  RB.questGuide.follow('cs_view');
  out.checks.push(['concealed before a view is chosen', RB.questGuide.analyse('cs_view', s).how === 'concealed']);
  const d2 = await RBDrive.run(['cs.view_note', 'cs.view_west', 'cs.view_east', 'cs.view_seat']);
  out.drive.push(Object.assign({ label: 'Cinder Orchard guestbook; the three places on the Star Stair' }, d2));
  out.checks.push(['three views observed', ['seat', 'west', 'east'].every((p) => K.observed(s, 'view.' + p))]);
  const orders = ['seat', 'west', 'east'].map((p) => V.order(p).join(','));
  out.checks.push(['the three views differ (' + orders.join(' | ') + ')', new Set(orders).size === 3]);
  const bl = window.CSBacklog();
  out.checks.push(['each view was described in words from the map', ['seat', 'west', 'east'].every((p) => bl.includes(V.words(V.order(p)).en))]);
  // the record, with real clicks on its buttons
  RB.ui.casebook.select('view');
  RB.ui.menu.open('cases');
  await new Promise((r) => setTimeout(r, 200));
  const q = (sel) => document.querySelector('#folio-page ' + sel);
  const click = async (sel) => { const e = q(sel); if (!e) throw new Error('no ' + sel); e.click(); await new Promise((r) => setTimeout(r, 120)); };
  out.checks.push(['the sheet starts as it hung (back)', K.rec(s, 'view').sheet.side === 'back']);
  await click('[data-a="reveal"][data-way="tilt"]');
  out.checks.push(['tilting it to the light shows the pressed mark', K.observed(s, 'view.impression')]);
  await click('[data-a="reveal"][data-way="backing"]');
  await click('[data-a="reveal"][data-way="light"]');
  const seen = K.rec(s, 'view').sheet.seen;
  out.checks.push(['all three ways work and show the same thing', !!seen.tilt && !!seen.backing && !!seen.light]);
  const sheetText = () => (q('.cs-sheet .cs-fig.sheet figcaption') || {}).textContent || '';
  out.checks.push(['the back reads mirrored: ' + sheetText().slice(0, 90), /bare tree, the little shrine, the stair lantern/.test(sheetText())]);
  // choose the seat, confirm while it is still back to front: safe, informative
  const radio = (v) => { const r = q('input[name="cs-hyp-view"][value="' + v + '"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); };
  radio('seat'); await new Promise((r) => setTimeout(r, 150));
  await click('[data-a="confirm"]');
  out.checks.push(['held back to front, the seat view does not match (said so)', K.rec(s, 'view').stage === 'open' && /don.t line up/.test((q('.cs-sheet .note-slip') || {}).textContent || '')]);
  await click('[data-a="turn"]');
  out.checks.push(['Turn over: the front', K.rec(s, 'view').sheet.side === 'front' && /stair lantern, the little shrine, the bare tree/.test(sheetText())]);
  radio('west'); await new Promise((r) => setTimeout(r, 150));
  await click('[data-a="cmpview"]');
  out.checks.push(['Compare shows the chosen view beside the sketch', !!q('.cs-sheet .cs-fig.view')]);
  await click('[data-a="confirm"]');
  out.checks.push(['front + the west stone: no match, still open', K.rec(s, 'view').stage === 'open']);
  await click('[data-a="reset"]');
  out.checks.push(['Reset: back as it hung; evidence kept', K.rec(s, 'view').sheet.side === 'back' && K.observed(s, 'view.impression')]);
  await click('[data-a="turn"]');
  radio('seat'); await new Promise((r) => setTimeout(r, 150));
  q('[data-a="confirm"]').click();
  await new Promise((r) => setTimeout(r, 300));
  await RB.test.idle(60000);
  const r = K.rec(s, 'view');
  out.checks.push(['front + the stone seat: solved (' + r.method + ')', r.stage === 'done' && r.method === 'note']);
  out.checks.push(['keepsake Turning Picture; quest done', !!s.discovery.keepsakes.turning_picture && s.quests.cs_view.done]);
  // leave the sketch at the seat: the framed sketch appears
  window.PICK = ['Leave the sketch here'];
  const d3 = await RBDrive.run([{ scene: 'cs.view_seat', again: true }]);
  out.drive.push(Object.assign({ label: 'leave the sketch at the stone seat' }, d3));
  const fr = RB.world.W.map.props.find((p) => p.p === 'cs_frame' && RB.state.test(s, p.if));
  out.checks.push(['the framed sketch stands by the seat; the sketch left there', !!fr && !s.inv.cs_sketch && !!s.flags.cs_view_framed]);
  return out;
};

// ---- Case B: held up in the world, no note, no mark examined --------------------------------------------------
const B_HOLDUP = async (o) => {
  const s = await window.CSSetup(o, 'sg.harbor', 27, 12);
  const out = { drive: [], checks: [] }, K = RB.cases;
  window.PICK = ['May I borrow', '^Carry on', 'as it hung in the window'];
  const d1 = await RBDrive.run(['cs.view_window', 'cs.view_seat']);
  out.drive.push(Object.assign({ label: 'borrow; hold it up at the seat as it hung' }, d1));
  out.checks.push(['as it hung: no match, nothing lost', K.rec(s, 'view').stage === 'open' && !!s.inv.cs_sketch && /don.t line up/.test(window.CSBacklog())]);
  window.PICK = ['turned over'];
  const d2 = await RBDrive.run([{ scene: 'cs.view_seat', again: true }]);
  out.drive.push(Object.assign({ label: 'hold it up turned over' }, d2));
  const r = K.rec(s, 'view');
  out.checks.push(['solved by comparing the landmarks alone (' + r.method + ')', r.stage === 'done' && r.method === 'compared']);
  out.checks.push(['the evidence named is only what was observed (' + r.evidence.join() + ')', JSON.stringify(r.evidence) === JSON.stringify(['view.sketch', 'view.genzo', 'view.seat'])]);
  return out;
};

// ---- Case B: the strongest help, then the way there ----------------------------------------------------------
const B_HELP = async (o) => {
  const s = await window.CSSetup(o, 'sg.harbor', 27, 12);
  const out = { drive: [], checks: [] }, K = RB.cases;
  window.PICK = ['May I borrow', '^Carry on'];
  const d1 = await RBDrive.run(['cs.view_window']);
  out.drive.push(Object.assign({ label: 'borrow' }, d1));
  for (let i = 0; i < 4; i++) K.askHint(s, 'view');
  RB.questGuide.follow('cs_view');
  const g = RB.questGuide.analyse('cs_view', s);
  out.checks.push(['the answer hint discloses the stone seat to the markers (' + g.targets.map((t) => t.map + '@' + t.x + ',' + t.y).join() + ')', g.targets.length === 1 && g.targets[0].map === 'sb.obs_path' && g.targets[0].x === 10 && g.targets[0].y === 36]);
  window.PICK = ['turned over'];
  const d2 = await RBDrive.run(['cs.view_seat']);
  out.drive.push(Object.assign({ label: 'to the seat, turned over' }, d2));
  const r = K.rec(s, 'view');
  out.checks.push(['solved with help (' + r.method + '), same keepsake', r.stage === 'done' && r.method === 'helped' && !!s.discovery.keepsakes.turning_picture]);
  return out;
};

// ---- after the story: both cases from a postgame save -------------------------------------------------------------
const POST = async (o) => {
  const s = await window.CSSetup(o, 'rw.village', 22, 30);
  const out = { drive: [], checks: [] }, K = RB.cases;
  window.PICK = ['^Take it along', '^Carry on', 'only came', 'May I borrow', 'turned over'];
  const d1 = await RBDrive.run(['cs.parcel_shelf', 'cs.hama_parcel', 'cs.view_window', 'cs.view_seat']);
  out.drive.push(Object.assign({ label: 'postgame: parcel to Hama; sketch to the seat' }, d1));
  out.checks.push(['both solved after the story', K.solved(s, 'parcel') && K.solved(s, 'view')]);
  out.checks.push(['both keepsakes, once each', !!s.discovery.keepsakes.parcel_seal && !!s.discovery.keepsakes.turning_picture && RB.discovery.keepsake(s, 'turning_picture') === false]);
  out.checks.push(['Company topics offered for both (C1)', K.discussable(s) && K.topics(s).length === 2]);
  return out;
};


// ---- the refined sequences and their keepsakes (§14.8, §17.2) --------------------------------------------------
const REFINE = async (o) => {
  const s = await window.CSSetup(o, 'sg.harbor', 27, 12, { sg_boss_done: false, sg_returned: false, sg_main_done: false, ch2_done: false, sg_tide_read: false, sg_tide_low: false, sg_fog_cleared: false });
  const out = { drive: [], checks: [] }, T = RB.test;
  delete s.quests.sg_main;
  RB.state.setQuest(s, 'sg_main', 5);
  s.chapter = 2;
  const later = (id) => { const orig = RB.challenge.run; RB.challenge.run = async (cid, ctx) => (cid === id ? { ok: false, cancelled: true } : orig(cid, ctx)); return () => { RB.challenge.run = orig; }; };
  // Saltglass: step away first (the new feedback), then read the table for real
  window.PICK = ['wait here'];
  let undo = later('sg.c_tidetable');
  await T.go('sg.tidehut', 4, 5, 'up'); await T.talk('shiori');
  undo();
  out.checks.push(['stepping away from the tide table: a pointer to word help, no answer', /no hurry/.test(window.CSBacklog()) && !s.flags.sg_tide_read]);
  await T.talk('shiori');
  out.checks.push(['the tide table read (every correct form still accepted: no auto-answer problem)', !!s.flags.sg_tide_read && !!s.flags.sg_tide_low]);
  await T.go('sg.harbor', 10, 27, 'up'); await T.use(10, 25);
  out.checks.push(['the tide board outside now has the times chalked in', /chalked them in/.test(window.CSBacklog())]);
  const chalk = RB.world.W.map.props.find((q) => q.p === 'cs_tidechalk' && RB.state.test(s, q.if));
  out.checks.push(['… and shows them (the chalk drawn over the board)', !!chalk]);
  // later in the chapter: Shiori's shell button, once
  RB.state.setQuest(s, 'sg_main', 7); s.flags.sg_boss_done = true; s.flags.sg_fog_cleared = true;
  await T.go('sg.tidehut', 4, 5, 'up'); await T.talk('shiori');
  const k1 = !!s.discovery.keepsakes.shell_button;
  const n1 = RB.script.__driveWrapped ? 0 : 0;
  await T.talk('shiori');
  out.checks.push(['Shell Button from Shiori after the milestone; talking again gives nothing more', k1 && Object.keys(s.discovery.keepsakes).filter((k) => k === 'shell_button').length === 1 && s.seen['sg.shiori_after']]);
  // Cinder Orchard: the kiln wall, stepping away, then read; Nobu's swallow after the chapter
  s.vars.co_tablets = 3; s.chapter = 3;
  undo = later('co.c_kiln');
  await T.go('co.kiln', 11, 5, 'up'); await T.use(11, 3);
  undo();
  out.checks.push(['stepping away from the kiln tiles: their own words carry the order', /own words carry their order/.test(window.CSBacklog()) && !s.flags.co_kiln_open]);
  await T.use(11, 3);
  out.checks.push(['the firing steps read', !!s.flags.co_kiln_open]);
  s.flags.ch3_done = true;
  await T.go('co.pottery', 4, 7, 'up'); await T.talk('co_nobu');
  await T.talk('co_nobu');
  out.checks.push(['Clay Swallow from Nobu, once', !!s.discovery.keepsakes.clay_swallow && s.seen['co.nobu_after']]);
  // Snowbell: the observing log, stepping away, then read; the box of paper stars
  s.chapter = 4; s.flags.sb_log_solved = false;
  undo = later('sb.c_log');
  await T.go('sb.obs_charts', 4, 7, 'up'); await T.use(4, 5);
  undo();
  out.checks.push(['stepping away from the log: it stays open, directions by the times', /log stays open/.test(window.CSBacklog()) && !s.flags.sb_log_solved]);
  await T.use(4, 5);
  out.checks.push(['the observing log read', !!s.flags.sb_log_solved]);
  window.PICK = ['^Take one'];
  await T.go('sb.hoshino', 5, 4, 'up'); await T.use(5, 2);
  await T.use(5, 2);
  out.checks.push(['Star Rosette from Hoshino\'s box, once (the second look says one is enough)', !!s.discovery.keepsakes.star_rosette && /One is enough/.test(window.CSBacklog())]);
  // Lanternfall: Tokuji, after the gates and the bell
  s.chapter = 5; s.flags.lf_gate_c = true; s.flags.lf_bell_rung = true;
  await T.go('lf.sluice', 17, 13, 'up'); await T.talk('lf_tokuji');
  await T.talk('lf_tokuji');
  out.checks.push(['Thread Spool from Tokuji, once', !!s.discovery.keepsakes.thread_spool && s.seen['lf.tokuji_after']]);
  // the Still Archive: stepping away from the charter
  undo = later('sa.charter');
  await T.go('sa.conduits', 4, 12, 'down'); await T.use(4, 13);
  undo();
  out.checks.push(['stepping away from the charter: all three texts stay to compare', /still be here to compare/.test(window.CSBacklog()) && !s.flags.sa_promise_done]);
  const kept = Object.keys(s.discovery.keepsakes).sort().join();
  out.checks.push(['four keepsakes, each once: ' + kept, kept === 'clay_swallow,shell_button,star_rosette,thread_spool' && ['shell_button', 'clay_swallow', 'star_rosette', 'thread_spool'].every((k) => RB.discovery.keepsake(s, k) === false)]);
  return out;
};

// ---- an older save, already past every milestone, claims each keepsake once ---------------------------------------
const LEGACY = async (o) => {
  const s = await window.CSSetup(o, 'sg.harbor', 27, 12, { co_kiln_open: true, sb_log_solved: true, lf_gate_c: true, lf_bell_rung: true, sa_promise_done: true });
  const out = { drive: [], checks: [] }, T = RB.test;
  // as saved before the addendum: no discovery, no awarded records
  const old = JSON.parse(JSON.stringify(s));
  delete old.discovery; delete old.awarded; delete old.company; delete old.bookmarks; delete old.creatures;
  const probs = RB.save.validate(old);
  const st = RB.save.migrate(old);
  out.checks.push(['an older save validates and loads (' + probs.join('; ') + ')', probs.length === 0 && !!st.discovery && Object.keys(st.discovery.cases).length === 0]);
  RB.game.s = st;
  window.PICK = ['^Take one'];
  await T.go('sg.tidehut', 4, 5, 'up'); await T.talk('shiori');
  await T.go('co.pottery', 4, 7, 'up'); await T.talk('co_nobu');
  await T.go('sb.hoshino', 5, 4, 'up'); await T.use(5, 2);
  await T.go('lf.sluice', 17, 13, 'up'); await T.talk('lf_tokuji');
  const kept = Object.keys(st.discovery.keepsakes).sort().join();
  out.checks.push(['each milestone\'s keepsake claimed at its known place: ' + kept, kept === 'clay_swallow,shell_button,star_rosette,thread_spool']);
  await T.go('sg.tidehut', 4, 5, 'up'); await T.talk('shiori');
  out.checks.push(['claiming again gives nothing more', Object.keys(st.discovery.keepsakes).length === 4]);
  out.checks.push(['no case invented for the old save', Object.keys(st.discovery.cases).length === 0 && Object.keys(st.discovery.clues).length === 0]);
  return out;
};


// ---- from an object's Inspect view straight to its record, and back to the world -----------------------------------
const PAGE = async (o) => {
  const s = await window.CSSetup(o, 'rw.village', 22, 30);
  const out = { drive: [], checks: [] };
  window.PICK = ['^Take it along', 'Look at the case record'];
  // walk in and look at the shelf (the scene ends by opening the folio, so no waiting for the world here)
  await RB.test.go('rw.warehouse', 6, 3, 'up');
  RB.world.interact();
  const t0 = Date.now();
  while (!RB.ui.menu.isOpen() && Date.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 50));
  await new Promise((r) => setTimeout(r, 300));
  const cur = RB.ui.menu.current();
  const rec = document.querySelector('#folio-page .cs-record');
  out.checks.push(['the folio opened at the parcel\'s record (' + JSON.stringify(cur) + ')', RB.ui.menu.isOpen() && cur.section === 'journey' && cur.journey === 'cases' && rec && rec.dataset.case === 'parcel']);
  RB.ui.menu.close();
  await new Promise((r) => setTimeout(r, 200));
  out.checks.push(['closing it returns to the world (mode ' + RB.game.mode() + ')', RB.game.mode() === 'world' && !RB.script.isRunning()]);
  // and a companion topic opens the same record (C1's "Discuss a discovered case")
  const tp = RB.cases.topics(s)[0];
  tp.open();
  await new Promise((r) => setTimeout(r, 200));
  out.checks.push(['a Company topic opens the record too', RB.ui.menu.isOpen() && RB.ui.menu.current().journey === 'cases']);
  RB.ui.menu.close();
  return out;
};

const { srv, url } = await serve();
const b = await launch();
const FLOWS = [
  ['Case A — thorough order', { comp: 'nao' }, A_THOROUGH],
  ['Case A — clue first, early delivery', { comp: 'suzu' }, A_EARLY],
  ['Case A — strongest help', { comp: 'ren' }, A_HELP],
  ['Case A — evidence kept', { comp: 'mio' }, A_PERSIST],
  ['Case B — full route through the record', { comp: 'mio' }, B_FULL],
  ['Case B — held up in the world', { comp: 'ren' }, B_HOLDUP],
  ['Case B — strongest help', { comp: 'suzu' }, B_HELP],
  ['Both cases after the story', { comp: 'nao', post: true }, POST],
  ['Refined sequences and their keepsakes', { comp: 'mio' }, REFINE],
  ['An older save claims the keepsakes once', { comp: 'ren' }, LEGACY],
  ['From an Inspect view to the record', { comp: 'nao' }, PAGE],
];
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
for (const [name, o, body] of FLOWS) if (!only || name.toLowerCase().includes(only.toLowerCase())) await flow(b, url, name, o, body);
await b.close();
srv.close();
console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
process.exit(fails ? 1 : 0);
