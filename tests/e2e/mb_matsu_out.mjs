// Matsu's door: shown out, you are outside, where Sen is waiting (Agnes 6569082815, 6569311618, 6581812054; Local
// CL-629, CL-647; Cloud CC-466, CC-483). Sen is staged with `!enter … here`: placed at her tile as the street is seen,
// fading in there (not walking in from the Tally Exchange; not promised fully drawn by the first frame of the
// narration). In Chromium on the built game, on throwaway journeys (never a real save), in the lock-keeper's house with
// "Chapter 3" at step 5: Matsu talked to through the world's own interact, her conversation ended as the test says
// (its own conclusion's flags, as the encounter leaves them; the conversation itself is tested elsewhere), every line
// played through:
//  1. shown out: on mb.exchange (52, 16), facing down, by the time "Matsu shuts her door" is said; Sen placed at
//     (52, 17) then ("Outside, Sen is waiting"), her entrance made there, not walking in, and still there while she speaks;
//     the companion on an open tile; when the scene is over, no Sen on the street, and no
//     other scene played on the way (mb.exchange_first not again); mb_passage and step 6; then, through the door
//     again, the lockhouse, and its stairs down to the Upper Basin;
//  2. timed out (unresolved): the same, outside, with Sen;
//  3. shown out, then a save and load through the game's own save: still on the street, the scene not played again,
//     and no Sen there;
//  4. shown out with Reduce motion on, and 5. with the scene skipped (fast-forward): the same place, Sen there for her
//     line and gone after;
//  6. the letter, and 7. agreed: still inside the lockhouse, no Sen, Matsu's own lines; the lamp with the letter only;
//  8. `!enter … here` naming someone already on the map (Local CL-647): Sen at her own place in the Tally Exchange is
//     found as before: one figure, her own placement (not a scene's figure, not set down anew), the entrance made at
//     her tile;
//  9. `here` naming someone just walking off (Sen leaving the street after the scene): the same figure turns back, not
//     a second one and not set down anew (no fade, where she was), and walks to the place;
//  10. `here` naming a place that cannot be stood on (a wall by the door): she is placed on a free tile near you
//     instead, and the entrance is recorded as not made, 'blocked';
//  11. the campaign changing while she speaks (a save made before Matsu was spoken to, loaded): the scene goes no
//     further: back in the lockhouse as saved, no Sen anywhere, the passage not open;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/mb_matsu_out.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);

async function start(p, end, o) {
  await p.evaluate(({ end, o }) => {
    const f = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb_exchange_seen: true, mb_ev_letter: true };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) f['enter:' + m + ':' + ev.scene] = true;
    const s = RB.game.debugStart('mb.lockhouse', 5, 4, { comp: 'mio', flags: f, dir: 'up', edition: 2 });
    s.quests.mb_main = { stage: 5, done: false, t: 1 };
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduced;
    RB.game.applySettings();
    if (o.skip) RB.game.setFastForward(true);
    // the conversation ends as the test says: its conclusion's own flags, as the encounter leaves them
    const ends = Object.fromEntries(RB.content.encounters['mb.passage'].conclusions.map((c) => [c.id, c]));
    RB.game.startEncounter = async () => { Object.assign(RB.game.s.flags, ends[end].flags || {}); return { result: 'end', outcome: end }; };
    const W = () => RB.world.W;
    const sens = () => W().npcs.concat(W().extras || []).filter((a) => a.id === 'mb_sen').map((a) => [a.x, a.y]);
    window.__said = []; window.__scenes = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) {
      if (l) window.__said.push({ who: l.who || '', en: l.en || '', map: W().map.id, at: [W().player.x, W().player.y, W().player.dir], sen: sens() });
      return say.apply(this, arguments);
    };
    const run = RB.script.run;
    RB.script.run = function (id) { window.__scenes.push(id); return run.apply(this, arguments); };
    window.__sens = sens;
  }, { end, o: o || {} });
  await p.waitForTimeout(500);
}
// play lines through until the world is back (and anyone who walked off has gone); `pick`: the reply to take when a
// choice comes up (by its words)
async function settle(p, pick) {
  for (let i = 0; i < 400; i++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode(), busy: RB.script.isRunning(), leaving: (RB.world.W.leavers || []).length, choice: [...document.querySelectorAll('.choices:not(.hidden) button')].map((b) => b.textContent) }));
    if (pick && s.choice.length) { await p.evaluate((re) => { const b = [...document.querySelectorAll('.choices:not(.hidden) button')].find((x) => new RegExp(re).test(x.textContent)); if (b) b.click(); }, pick); await p.waitForTimeout(120); continue; }
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
    if (s.mode === 'world' && !s.busy && !s.leaving && i > 5) break;
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(300);
}
async function talk(p) {
  await p.evaluate(() => { RB.test.place(5, 4, 'up'); RB.world.interact(); });
  await settle(p);
}
const after = (p) => p.evaluate(() => {
  const W = RB.world.W, s = RB.game.s, c = W.comp;
  const open = (x, y) => { const t = RB.maps.tileAt(W.map, x, y); return !!t && t.walk && !RB.maps.blockedStatic(W.map, x, y); };
  return { map: W.map.id, at: [W.player.x, W.player.y, W.player.dir], comp: c ? [c.x, c.y, open(c.x, c.y)] : null, sen: window.__sens(), entrances: (RB.test && RB.test.entrances || []).slice(), passage: !!s.flags.mb_passage, stage: s.quests.mb_main.stage, lamp: !!s.flags.mb_matsu_lamp, letter: !!s.flags.mb_matsu_letter, said: window.__said.slice(), scenes: window.__scenes.slice() };
});
const outside = (r) => {
  const shut = r.said.find((x) => /Matsu shuts her door/.test(x.en)), sen = r.said.find((x) => x.who === 'mb_sen');
  const ent = (r.entrances || []).filter((e) => e.who === 'mb_sen');
  return { shut: shut && [shut.map, shut.at, shut.sen], sen: sen && [sen.map, sen.sen], ent,
    ok: !!shut && shut.map === 'mb.exchange' && flat(shut.at) === flat([52, 16, 'down']) && flat(shut.sen) === flat([[52, 17]]) && !!sen && flat(sen.sen) === flat([[52, 17]]) &&
      ent.length === 1 && ent[0].ok && flat(ent[0].at) === flat([52, 17]) };
};

async function scenario(name, end, o, more) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, end, o);
  await talk(p);
  const r = await after(p);
  if (end === 'shown_out' || end === 'unresolved') {
    const out = outside(r);
    ok(out.ok && r.map === 'mb.exchange' && flat(r.at) === flat([52, 16, 'down']) && r.comp && r.comp[2] && Math.abs(r.comp[0] - 52) + Math.abs(r.comp[1] - 16) <= 1 && !r.sen.length && r.passage && r.stage === 6 && !r.scenes.includes('mb.exchange_first'),
      name + ': outside on mb.exchange (52, 16) facing down by "Matsu shuts her door"; Sen already at (52, 17) then, her entrance made there, and while she speaks; the companion on an open tile; no Sen after; mb_passage and step 6; no arrival scene ' + flat({ out, at: r.at, comp: r.comp, sen: r.sen, stage: r.stage, scenes: r.scenes }));
  } else {
    ok(r.map === 'mb.lockhouse' && !r.said.some((x) => x.who === 'mb_sen' || /Matsu shuts her door/.test(x.en)) && r.said.some((x) => x.who === 'mb_matsu' && /unlocked it/.test(x.en)) && r.passage && r.lamp === (end === 'letter') && r.letter === (end === 'letter'),
      name + ': still inside the lockhouse, no Sen, Matsu\'s own lines' + (end === 'letter' ? ', and her lamp' : '') + ', as before ' + flat({ map: r.map, lamp: r.lamp, letter: r.letter }));
  }
  if (more) await more(p, r);
  ok(!errors.length, name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// one step through the world's own movement (its exits and triggers), then any lines played through
async function stepUp(p, pick) {
  await p.evaluate(() => { RB.world.W.player.dir = 'up'; RB.world._tryMove('up'); });
  await p.waitForTimeout(400);
  await settle(p, pick);
}
await scenario('1 shown out', 'shown_out', {}, async (p) => {
  // through the door again (from the street), then the stairs down
  const from = await p.evaluate(() => RB.world.W.map.id);
  await stepUp(p);
  const inside = await p.evaluate(() => ({ map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y] }));
  await p.evaluate(() => { RB.test.place(8, 7, 'up'); });
  await stepUp(p, 'Go down');
  const down = await p.evaluate(() => RB.world.W.map.id);
  ok(from === 'mb.exchange' && inside.map === 'mb.lockhouse' && flat(inside.at) === flat([5, 7]) && down === 'mb.under1', '1 then from the street through the door again, into the lockhouse at its door, and down its stairs to the Upper Basin ' + flat({ from, inside, down }));
});
await scenario('2 timed out', 'unresolved', {});
await scenario('3 shown out, then a save and load', 'shown_out', {}, async (p) => {
  const r = await p.evaluate(async () => {
    window.__scenes = [];
    await RB.save.manualSave(1);
    await RB.game.loadCampaign(1, 'manual');
    await new Promise((res) => setTimeout(res, 900));
    const W = RB.world.W;
    return { map: W.map.id, at: [W.player.x, W.player.y], sen: window.__sens(), scenes: window.__scenes.slice() };
  });
  await settle(p);
  ok(r.map === 'mb.exchange' && flat(r.at) === flat([52, 16]) && !r.sen.length && !r.scenes.includes('mb.passage_after'),
    '3 after a save and load: still on the street, the scene not played again, no Sen there ' + flat(r));
});
await scenario('4 shown out, Reduce motion', 'shown_out', { reduced: true });
await scenario('5 shown out, skipped', 'shown_out', { skip: true });
await scenario('6 the letter', 'letter', {});
await scenario('7 agreed', 'agreed', {});

// 8. `!enter … here` naming someone already on the map
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await p.evaluate(async () => {
    const f = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb_exchange_seen: true };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) f['enter:' + m + ':' + ev.scene] = true;
    RB.game.debugStart('mb.tally', 8, 9, { comp: 'mio', flags: f, dir: 'up', edition: 2 });
    RB.game.settings.textSpeed = 'instant';
    RB.game.applySettings();
    await new Promise((res) => setTimeout(res, 500));
    const W = RB.world.W, sens = () => W.npcs.concat(W.extras).filter((a) => a.id === 'mb_sen');
    const before = sens()[0];
    RB.script.add('@scene test.enter_here\n!enter mb_sen 8 2 down here\n', 'test');
    RB.test.entrances = [];
    await RB.script.run('test.enter_here');
    const after = sens();
    return { n: after.length, same: after[0] === before, placed: W.npcs.includes(before), extra: W.extras.includes(before), arrive: (before && before.def && before.def.arrive) || null, at: before && [before.x, before.y], ent: RB.test.entrances.slice() };
  });
  ok(r.n === 1 && r.same && r.placed && !r.extra && !r.arrive && flat(r.at) === flat([8, 2]) && r.ent.length === 1 && r.ent[0].ok && flat(r.ent[0].at) === flat([8, 2]),
    '8 `!enter … here` naming someone already on the map (Sen in the Tally Exchange): found as before, one figure, her own placement, not set down anew; the entrance made at her tile ' + flat(r));
  ok(!errors.length, '8 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 9. `here` naming someone just walking off
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'shown_out', {});
  await p.evaluate(() => { RB.test.place(5, 4, 'up'); RB.world.interact(); });
  // the lines played through until the scene is over, while Sen is still walking off
  for (let i = 0; i < 400; i++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), busy: RB.script.isRunning(), mode: RB.game.mode() }));
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
    if (!s.busy && s.mode === 'world' && i > 5) break;
    await p.waitForTimeout(60);
  }
  const r = await p.evaluate(async () => {
    const W = RB.world.W;
    const going = W.leavers.find((a) => a.id === 'mb_sen');
    const at0 = going ? [going.x, going.y] : null;
    let got = null;
    const es = RB.world.ensureSpeaker;
    RB.world.ensureSpeaker = function () { const a = es.apply(this, arguments); got = a ? { x: a.x, y: a.y, alpha: a.alpha, same: a === going } : null; return a; };
    RB.script.add('@scene test.enter_back\n!enter mb_sen 52 17 up here\n', 'test');
    RB.test.entrances = [];
    await RB.script.run('test.enter_back');
    RB.world.ensureSpeaker = es;
    const all = W.npcs.concat(W.extras, W.leavers).filter((a) => a.id === 'mb_sen');
    return { going: !!going, at0, got, n: all.length, arrive: (going && going.def && going.def.arrive) || null, ent: RB.test.entrances.slice() };
  });
  const near = r.got && r.at0 && Math.abs(r.got.x - r.at0[0]) + Math.abs(r.got.y - r.at0[1]) <= 1;
  // (her own arrive: 'here' is the scene's, from when she was first staged; she is the same figure, not made again)
  ok(r.going && r.got && r.got.same && near && r.got.alpha === 1 && r.n === 1 && r.ent.length === 1 && r.ent[0].ok && flat(r.ent[0].at) === flat([52, 17]),
    '9 `here` naming Sen just walking off: the same figure, where she was and not faded in anew, one Sen, walked to (52, 17) ' + flat(r));
  ok(!errors.length, '9 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 10. `here` naming a place that cannot be stood on
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'shown_out', {});
  await talk(p);
  const r = await p.evaluate(async () => {
    const W = RB.world.W, m = W.map, pl = W.player;
    let wall = null;
    for (let d = 1; d <= 3 && !wall; d++) for (let dy = -d; dy <= d && !wall; dy++) for (let dx = -d; dx <= d && !wall; dx++) {
      const x = pl.x + dx, y = pl.y + dy, tl = RB.maps.tileAt(m, x, y);
      if (tl && (!tl.walk || RB.maps.blockedStatic(m, x, y)) && !RB.maps.exitAt(m, x, y)) wall = [x, y];
    }
    RB.script.add('@scene test.enter_wall\n!enter mb_sen ' + wall[0] + ' ' + wall[1] + ' up here\n', 'test');
    RB.test.entrances = [];
    let got = null;
    const es = RB.world.ensureSpeaker;
    RB.world.ensureSpeaker = function () { const a = es.apply(this, arguments); got = a ? { x: a.x, y: a.y, arrive: (a.def && a.def.arrive) || null } : null; return a; };
    await RB.script.run('test.enter_wall');
    RB.world.ensureSpeaker = es;
    const open = got && RB.maps.tileAt(m, got.x, got.y).walk && !RB.maps.blockedStatic(m, got.x, got.y);
    return { wall, got, open, ent: RB.test.entrances.slice() };
  });
  ok(!!r.wall && r.got && r.open && flat([r.got.x, r.got.y]) !== flat(r.wall) && r.got.arrive === 'here' && r.ent.length === 1 && !r.ent[0].ok && r.ent[0].why === 'blocked',
    '10 `here` naming a wall: placed on a free tile near you instead, and the entrance recorded as not made, blocked ' + flat(r));
  await settle(p);
  ok(!errors.length, '10 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 11. the campaign changing while she speaks
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'shown_out', {});
  await p.evaluate(async () => {
    await RB.save.manualSave(1);
    window.__loaded = false;
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) {
      if (l && l.who === 'mb_sen' && !window.__loaded) { window.__loaded = true; setTimeout(() => RB.game.loadCampaign(1, 'manual'), 0); }
      return say.apply(this, arguments);
    };
  });
  await talk(p);
  await p.waitForTimeout(900);
  await settle(p);
  const r = await p.evaluate(() => { const W = RB.world.W; return { loaded: window.__loaded, map: W.map.id, at: [W.player.x, W.player.y], sen: W.npcs.concat(W.extras, W.leavers).filter((a) => a.id === 'mb_sen').length, passage: !!RB.game.s.flags.mb_passage, running: RB.script.isRunning() }; });
  ok(r.loaded && r.map === 'mb.lockhouse' && r.sen === 0 && !r.passage && !r.running,
    '11 a save loaded while Sen speaks: the scene goes no further; back in the lockhouse as saved, no Sen, the passage not open ' + flat(r));
  ok(!errors.length, '11 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

console.log(`\nmb_matsu_out: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
