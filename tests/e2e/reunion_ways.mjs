// RBN-QA-096 (Agnes 6336494089, 6336521164, 6337682714; Local CL-180, CL-181; Cloud CC-108 §3): left apart in the Tidal
// Hollow, you could come back up the way round onto the north side and leave it without the reunion: one step south
// from the landing, or (once ko_root_c reopens the bridge) back round to the south bank and over the bridge, then up to
// the Whispering Hollow or on to the garden. Now the reunion is also a step trigger across the landing's step south and
// in front of both ways off the north side (tests/unit/ko_reunion_reach.test.mjs proves no way round them). In Chromium
// on the built game, with real arrivals (the game's own transitions through the exits) and real key presses:
//  1. up from the way round (from ko.roots3, at (2,4)): nothing on arrival; each step up, right or down plays the
//     reunion; west into the passage plays nothing, and the step back out of it plays it;
//  2. the bridge route: from the south bank over the reopened bridge onto the north side plays nothing; walking on up
//     towards the Whispering Hollow plays it before the way out; walking east towards the garden plays it before the way
//     on;
//  3. coming back from the Whispering Hollow and from the garden (a save that left apart before this change): nothing
//     on arrival; the step straight back out plays nothing; any other step plays it;
//  4. a save loaded at (2,4) while apart: nothing plays on load; the first step up plays it;
//  5. seen before, passed over with the dialogue's own "Skip seen": it ends together, the quest at 6;
//  6. once only: after it, the other trigger tiles play nothing, nor does coming back from the Whispering Hollow;
//  7. for each companion, wherever it plays (the landing's step south, before the way up, before the garden): your
//     companion is the one figure, with you after it and following you; the quest at 6;
//  8. the ordinary way down (never apart; the tide not yet in): from the Whispering Hollow's way down onto the north side
//     nothing plays;
//  9. no page errors.
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const PRE = ['ch1_done', 'ch2_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'departed'];
const KO = PRE.concat(['ko_ch9', 'ko_arrived', 'ko_otoha_met', 'ko_tell_otoha', 'ko_tell_nami', 'ko_tell_hamaji', 'ko_tell_shell', 'tell_ko.t_hall_ok', 'ko_hollow_open', 'ko_roots_seen', 'ko_root_a']);
const APART = KO.concat(['ko_tide_in', 'ko_apart', 'ko_root_b', 'ko_root_c', 'ko_round_seen']);
const KEY = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
const errorsAll = [];

// a journey in the Root Hollows (flags), at (map, x, y), facing dir; the quest at `stage`
async function start(p, { comp = 'mio', flags = APART, map = 'ko.roots2', x, y, dir = 'down', stage = 5, seen = false, skip = false }) {
  await p.evaluate(([comp, flags, map, x, y, dir, stage, seen, skip]) => {
    const f = {}; flags.forEach((k) => (f[k] = true));
    const s = RB.game.debugStart(map, x, y, { dir, edition: RB.edition.forNew(), comp, flags: f });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.state.setQuest(s, 'ko_main', stage);
    if (seen) s.seen['ko.reunion'] = true;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.skipSeen = !!skip;
    RB.game.settings.suzuSpeech = 'standard';
    RB.world.enter(map, x, y, dir, { fresh: true });
  }, [comp, flags, map, x, y, dir, stage, seen, skip]);
  await p.waitForTimeout(800);
}
const look = () => {
  const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(), W = RB.world.W, s = RB.game.s;
  const mine = (a) => a.id === s.comp || (a.def && a.def.char === s.comp);
  return { map: W.map.id, d: d ? (d.who || '') + ': ' + String(d.en || '').slice(0, 50) : null, run: RB.script.isRunning(), pc: [W.player.x, W.player.y],
    comp: W.comp ? [W.comp.x, W.comp.y] : null, figs: W.npcs.concat(W.extras, W.leavers).filter(mine).length,
    apart: !!s.flags.ko_apart, stage: s.quests.ko_main && s.quests.ko_main.stage, mode: RB.game.mode() };
};
// one step in a direction with a real key press (you face that way first, as a held key would turn you). The key is let
// go as soon as the step has begun, not after a fixed hold: a key still down when a step ends walks on, and after a stall
// the frame clock (50 ms a frame at most) credits a new step with time from before it began, so a 130 ms hold could
// outlast a 160 ms step and walk two tiles (the bridge route, 52d2441 on a loaded machine)
async function step(p, dir) {
  const from = await p.evaluate((dir) => { const P = RB.world.W.player; P.dir = dir; return [P.x, P.y]; }, dir);
  await p.keyboard.down(KEY[dir]);
  await p.waitForFunction(([x, y]) => { const P = RB.world.W.player; return !!P.mv || P.x !== x || P.y !== y || RB.game.mode() !== 'world'; },
    from, { polling: 'raf', timeout: 1000 }).catch(() => {});
  await p.keyboard.up(KEY[dir]);
  await p.waitForTimeout(420);
  // a way out: wait for the transition to settle
  for (let i = 0; i < 30 && (await p.evaluate(() => RB.game.mode())) === 'transition'; i++) await p.waitForTimeout(100);
}
// play out whatever scene is running; the lines shown (null when nothing played)
async function play(p) {
  const beats = [];
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(look);
    if (st.d) { if (!beats.length || beats[beats.length - 1].d !== st.d) { beats.push(st); await p.waitForTimeout(120); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); } await p.waitForTimeout(80); continue; }
    if (!st.run && beats.length) break;
    if (!st.run && i > 6) break;
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(500);
  return beats.length ? beats : null;
}
const isReunion = (B) => !!B && B.some((x) => /water at your feet is going down/.test(x.d || ''));
// walk `dirs` one step at a time while nothing plays; returns where it stopped and the scene's lines if one played
async function walk(p, dirs) {
  for (let i = 0; i < dirs.length; i++) {
    await step(p, dirs[i]);
    const st = await p.evaluate(look);
    if (st.run || st.d) return { at: i, st, B: await play(p) };
  }
  return { at: dirs.length, st: await p.evaluate(look), B: null };
}
const rep = (d, n) => Array(n).fill(d);
async function fresh(fn) {
  const { p, errors } = await page(b, url);
  try { await fn(p); } finally { errorsAll.push(...errors); await p.close(); }
}
// arrive at roots2 by the game's own exit from a neighbouring map
async function arriveFrom(p, o, exitDir) {
  await start(p, o);
  await step(p, exitDir);
  await p.waitForTimeout(400);
  return p.evaluate(look);
}

// ---- 1. up from the way round ---------------------------------------------------------------------------------------
for (const [dir, plays] of [['up', true], ['right', true], ['down', true], ['left', false]]) {
  await fresh(async (p) => {
    const a = await arriveFrom(p, { map: 'ko.roots3', x: 22, y: 1, dir: 'up' }, 'up');
    const B0 = await play(p);
    const w = await walk(p, [dir]);
    const after = await p.evaluate(look);
    const ok1 = a.map === 'ko.roots2' && a.pc.join() === '2,4' && !B0 && (plays ? isReunion(w.B) && !after.apart && after.stage === 6 : !w.B && after.pc.join() === '1,4' && after.apart);
    ok(ok1, 'up from the way round at (2,4): nothing on arrival; a step ' + dir + (plays ? ' plays the reunion' : ' (west into the passage) plays nothing') + ' (' + JSON.stringify({ arrived: a.pc, onArrival: !!B0, at: w.st.pc, reunion: isReunion(w.B), apart: after.apart }) + ')');
    if (dir === 'left') {
      const back = await walk(p, ['right']);
      ok(isReunion(back.B), 'and the step back out of the passage onto the landing plays it (' + JSON.stringify(back.st.pc) + ')');
    }
  });
}

// ---- 2. the bridge route ---------------------------------------------------------------------------------------------
await fresh(async (p) => {
  // on the south bank, come up from the way round (from ko.roots3's east end), then over the reopened bridge
  const a = await arriveFrom(p, { map: 'ko.roots3', x: 28, y: 18, dir: 'right' }, 'right');
  await play(p);
  await p.evaluate(() => RB.world.enter('ko.roots2', 15, 13, 'up', {}));
  await p.waitForTimeout(500);
  const over = await walk(p, rep('up', 4)); // (15,12) .. (15,9): the bridge and the north bank's edge
  ok(a.map === 'ko.roots2' && a.pc.join() === '1,18' && !over.B && over.st.pc.join() === '15,9' && over.st.apart,
    'the bridge route: over the reopened bridge from the south bank onto the north side plays nothing (' + JSON.stringify({ arrived: a.pc, at: over.st.pc }) + ')');
  const up = await walk(p, rep('up', 8)); // on up towards the Whispering Hollow (15,0)
  ok(isReunion(up.B) && up.st.map === 'ko.roots2' && up.st.pc.join() === '15,2' && !(await p.evaluate(look)).apart,
    'walking on up towards the Whispering Hollow, it plays before the way out, at (15,2) (' + JSON.stringify({ at: up.st.pc, map: up.st.map }) + ')');
});
await fresh(async (p) => {
  await start(p, { map: 'ko.roots2', x: 15, y: 9, dir: 'up' });
  const from = (await p.evaluate(look)).pc;
  const east = await walk(p, rep('up', 5).concat(rep('right', 16))); // up towards row 4, then east along it to the garden
  ok(isReunion(east.B) && east.st.map === 'ko.roots2' && east.st.pc[0] === 29 && [3, 4].includes(east.st.pc[1]) && !(await p.evaluate(look)).apart,
    'walking east towards the garden, it plays before the way on, in front of it (x29, rows 3–4) (' + JSON.stringify({ from, at: east.st.pc, map: east.st.map }) + ')');
});

// ---- 3. coming back from the Whispering Hollow and from the garden -----------------------------------------------------
for (const [from, o, exitDir, back, arrived] of [
  ['the Whispering Hollow', { map: 'ko.roots1', x: 15, y: 22, dir: 'down' }, 'down', 'up', '15,1'],
  ['the garden', { map: 'ko.garden', x: 1, y: 10, dir: 'left' }, 'left', 'right', '30,4'],
]) {
  await fresh(async (p) => {
    const a = await arriveFrom(p, o, exitDir);
    const B0 = await play(p);
    const out = await walk(p, [back]);
    ok(a.map === 'ko.roots2' && a.pc.join() === arrived && !B0 && !out.B && out.st.map === o.map && out.st.apart,
      'back from ' + from + ' at (' + arrived + '): nothing on arrival; the step straight back out plays nothing (' + JSON.stringify({ arrived: a.pc, onArrival: !!B0, then: out.st.map }) + ')');
  });
  const others = from === 'the garden' ? ['left', 'up'] : ['down', 'left', 'right'];
  for (const d of others) {
    await fresh(async (p) => {
      await arriveFrom(p, o, exitDir);
      await play(p);
      const w = await walk(p, [d]);
      ok(isReunion(w.B) && !(await p.evaluate(look)).apart, 'back from ' + from + ', a step ' + d + ' plays it (' + JSON.stringify(w.st.pc) + ')');
    });
  }
}

// ---- 4. a save loaded at (2,4) while apart ------------------------------------------------------------------------------
await fresh(async (p) => {
  await start(p, { x: 2, y: 4, dir: 'right' });
  await p.evaluate(async () => { await RB.save.writeSlot(4, RB.game.s, { force: true }); await RB.game.loadCampaign(4); });
  await p.waitForTimeout(1500);
  const B0 = await play(p);
  const l = await p.evaluate(look);
  const w = await walk(p, ['up']);
  ok(l.map === 'ko.roots2' && l.pc.join() === '2,4' && l.apart && !B0 && isReunion(w.B),
    'a save loaded at (2,4) while apart: nothing plays on load; the first step up plays it (' + JSON.stringify({ loaded: l.pc, apart: l.apart, onLoad: !!B0 }) + ')');
});

// ---- 5. seen before, passed over with "Skip seen" ------------------------------------------------------------------------
await fresh(async (p) => {
  await start(p, { x: 2, y: 4, dir: 'down', seen: true, skip: true });
  await step(p, 'down');
  let skip = null;
  for (let i = 0; i < 300; i++) {
    const st = await p.evaluate(() => ({ d: RB.ui.dialogue.isOpen(), run: RB.script.isRunning() }));
    if (st.d) {
      if (!skip) { skip = await p.evaluate(() => { const k = document.querySelector('.dlg .b-skip'); const vis = !!(k && k.offsetParent && !k.classList.contains('hidden')); if (vis) k.click(); return { vis }; }); await p.waitForTimeout(150); continue; }
      await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(80); continue;
    }
    if (!st.run && skip) break;
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(600);
  const r = await p.evaluate(look);
  ok(skip && skip.vis && !r.run && !r.apart && r.stage === 6 && r.comp && Math.abs(r.comp[0] - r.pc[0]) + Math.abs(r.comp[1] - r.pc[1]) === 1 && r.figs === 0 && !(await p.evaluate(() => RB.game.fastForward())),
    'seen before and passed over with "Skip seen" (the landing\'s step south): it ends together, the quest at 6 (' + JSON.stringify({ skip, r }) + ')');
});

// ---- 6. once only ---------------------------------------------------------------------------------------------------------
await fresh(async (p) => {
  await start(p, { x: 2, y: 4, dir: 'up' });
  const first = await walk(p, ['up']);
  const again = await walk(p, ['down', 'down', 'right', 'up', 'up']); // over the landing's other tiles
  await p.evaluate(() => RB.world.enter('ko.roots2', 15, 3, 'up', {}));
  await p.waitForTimeout(500);
  const north = await walk(p, ['up', 'right', 'down']); // (15,2), (16,2), back down: the way up's tiles
  ok(isReunion(first.B) && !again.B && !north.B, 'once only: after it the landing\'s other tiles and the way up\'s tiles play nothing (' + JSON.stringify({ again: again.st.pc, north: north.st.pc }) + ')');
  // up to the Whispering Hollow (from (16,3): (16,2), (16,1), the way out at (16,0)) and back: nothing
  await walk(p, ['up', 'up', 'up']);
  const there = await p.evaluate(look);
  const back = await walk(p, ['down']);
  const b2 = await walk(p, ['down']);
  ok(there.map === 'ko.roots1' && back.st.map === 'ko.roots2' && !back.B && !b2.B, 'and after going up to the Whispering Hollow and coming back, nothing plays (' + JSON.stringify({ there: there.map, back: back.st.map, at: b2.st.pc }) + ')');
});

// ---- 7. each companion, wherever it plays -----------------------------------------------------------------------------------
const PLACES = [
  ['the landing\'s step south', { x: 2, y: 4, dir: 'down' }, ['down']],
  ['before the way up', { x: 15, y: 4, dir: 'up' }, ['up', 'up']],
  ['before the garden', { x: 27, y: 4, dir: 'right' }, ['right', 'right']],
];
for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
  for (const [where, at, dirs] of PLACES) {
    await fresh(async (p) => {
      await start(p, Object.assign({ comp }, at));
      const before = await p.evaluate(look);
      const w = await walk(p, dirs);
      const lines = (w.B || []).filter((x) => x.d && x.d.startsWith(comp + ':'));
      const r1 = await p.evaluate(look);
      // they follow: two steps on, at your side (a way that is open from where it played)
      const on = where === 'before the garden' ? ['down', 'down'] : ['right', 'right'];
      await walk(p, on);
      const r2 = await p.evaluate(look);
      ok(!before.comp && isReunion(w.B) && w.B.every((x) => x.comp && x.figs === 0) && lines.length >= 2 && !r1.apart && r1.stage === 6 && r1.comp && r2.comp && Math.abs(r2.comp[0] - r2.pc[0]) + Math.abs(r2.comp[1] - r2.pc[1]) === 1 && r2.figs === 0,
        comp + ', ' + where + ': the reunion, your companion the one figure from the first line, their own lines, with you after it and following you; the quest at 6 (' + JSON.stringify({ played: w.st.pc, lines: lines.length, r1: { pc: r1.pc, comp: r1.comp, stage: r1.stage }, r2: { pc: r2.pc, comp: r2.comp } }) + ')');
    });
  }
}

// ---- 8. the ordinary way down ---------------------------------------------------------------------------------------------------
await fresh(async (p) => {
  const a = await arriveFrom(p, { flags: KO, map: 'ko.roots1', x: 15, y: 22, dir: 'down', stage: 4 }, 'down');
  await play(p);
  const w = await walk(p, ['down', 'left', 'down', 'down']); // (15,2) .. onto the north side
  ok(a.map === 'ko.roots2' && a.pc.join() === '15,1' && !w.B && a.comp && w.st.comp, 'the ordinary way down (never apart, the tide not in): onto the north side nothing plays, your companion with you (' + JSON.stringify({ arrived: a.pc, at: w.st.pc, comp: w.st.comp }) + ')');
});

ok(errorsAll.length === 0, 'no page errors' + (errorsAll.length ? ' (' + errorsAll.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
