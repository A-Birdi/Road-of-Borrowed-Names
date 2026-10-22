// RBN-QA-093 (Agnes 6334704719, 6334919441, 6335147490; Local CL-176; Cloud CC-096, CC-098): Kihei's leaf, framed in
// Mitsu's lodging house. The frame hung there from the moment you chose to take her the leaf, before she had it, and
// against the back wall though she says she will put it up by the door; Kihei stood on in the tide pools while the
// narration said he was gone; and nothing reminded you that Mitsu was still waiting. Now the frame hangs only once the
// handing-over has played through, by the door (3,7); Kihei leaves with his last word in the Mitsu and wind endings;
// and the Mitsu ending leaves a note to self ("Decided to take Kihei's leaf to Mitsu at the lodging house."). In
// Chromium on the built game:
//  1. the three endings from the real trigger (Kihei in the tide pools): in each, Kihei is there for his last line;
//     in the Mitsu and wind endings he is no longer standing there for the narration that says he has gone, and is
//     gone after; in the kept ending he stays; the note only in the Mitsu ending, once; "Not now" keeps the letter
//     and leaves no note;
//  2. the lodging house after the choice: no frame until the handing-over, nothing at the back wall; Mitsu's talk is
//     the handing-over; after it the frame is drawn at (3,7), it blocks that tile, and it is read from beside it (from
//     the mat facing left, from above it, from its left); the way out from the mat still leads to the village;
//  3. old saves: one from before the handing-over loads with no frame and the handing-over first in Mitsu's talk; one
//     from after it loads with the frame;
//  4. a load in the middle of the handing-over: no frame, the scene not counted as seen; told again, it ends with the
//     frame;
//  5. walked in to Mitsu with your companion behind you: when the frame appears nobody stands on its tile and your
//     companion is beside you (a figure put on (3,7) by hand beforehand is not moved off it: printed as a note, a
//     stated limit; only you are moved off a tile that comes to block);
//  6. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/mitsu_frame.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const KO = { ch1_done: true, ch2_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, departed: true, ko_ch9: true, ko_arrived: true, ko_otoha_met: true, ko_lowtide: true, ko_kihei_met: true };
const NOTE = 'Decided to take Kihei\'s leaf to Mitsu at the lodging house.';
const allErrors = [];

async function start(p, o) {
  await p.evaluate(([KO, o]) => {
    const s = RB.game.debugStart(o.map, o.x, o.y, { dir: o.dir, edition: RB.edition.forNew(), comp: o.comp || 'ren', flags: Object.assign({}, KO, o.flags || {}) });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    s.quests.ko_kihei = o.done ? { stage: 2, done: true, t: Date.now() } : { stage: 2, done: false, t: Date.now() };
    if (o.letter) s.inv.ko_kihei_letter = 1;
    if (o.seen) s.seen['ko.mitsu_letter'] = true;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.suzuSpeech = 'standard';
    RB.world.enter(o.map, o.x, o.y, o.dir, { fresh: true });
  }, [KO, o]);
  await p.waitForTimeout(800);
}
// where you stand and face, then "Look" / "Talk" (the world's own interact)
async function at(p, x, y, dir) {
  await p.evaluate(([x, y, dir]) => { RB.world.enter(RB.world.W.map.id, x, y, dir, {}); }, [x, y, dir]);
  await p.waitForTimeout(400);
}
const look = () => {
  const W = RB.world.W, d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown();
  const k = W.npcs.find((a) => a.id === 'ko_kihei');
  return { d: d ? (d.who || '') + ': ' + String(d.en || '').slice(0, 60) : null, run: RB.script.isRunning(),
    choices: [...document.querySelectorAll('.choices:not(.hidden) .choice')].map((x) => x.textContent),
    kihei: k ? [k.x, k.y] : null, leaving: W.leavers.some((a) => a.id === 'ko_kihei'), map: W.map.id, comp: W.comp ? [W.comp.x, W.comp.y] : null };
};
// a scene from the world's interact, every line read and each choice picked in turn (by its words)
async function play(p, picks = [], onLine) {
  await p.evaluate(() => RB.world.interact());
  const lines = [];
  let k = 0;
  for (let i = 0; i < 500; i++) {
    const st = await p.evaluate(look);
    if (st.choices.length) {
      const re = picks[k++];
      if (!re) break;
      await p.locator('.choices:not(.hidden) .choice').filter({ hasText: re }).first().click();
      await p.waitForTimeout(250);
      continue;
    }
    if (st.d) {
      if (!lines.length || lines[lines.length - 1].d !== st.d) {
        lines.push(st);
        if (onLine && (await onLine(st, lines.length - 1))) return { lines, stopped: true };
        await p.waitForTimeout(150);
        await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance());
      }
      await p.waitForTimeout(80);
      continue;
    }
    if (!st.run && lines.length) break;
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(600);
  return { lines };
}
const notes = (p) => p.evaluate((NOTE) => (RB.game.s.journal || []).filter((n) => n.en === NOTE).map((n) => n.jp), NOTE);
const line = (r, re) => r.lines.find((l) => re.test(l.d || ''));
// the frame: its placement live now, whether its tile blocks, and the drawn paper of the frame on a tile (its pale
// cream under the room's lamplight, about (195,177,146) and (206,191,167); the room's own wood and floor are darker)
const frame = (p) => p.evaluate(() => {
  const W = RB.world.W, M = W.map, s = RB.game.s;
  const live = M.props.filter((q) => q.p === 'ko_frame' && (!q.if || RB.state.test(s, q.if))).map((q) => [q.x, q.y]);
  const cv = document.querySelector('canvas'), g = cv.getContext('2d'), cam = RB.render.cam, v = RB.render.viewSize(), sx = cv.width / v.w, sy = cv.height / v.h;
  const paper = (tx, ty) => {
    const d = g.getImageData(Math.round((tx * 16 - cam.x) * sx), Math.round((ty * 16 - 8 - cam.y) * sy), Math.round(16 * sx), Math.round(24 * sy)).data;
    let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 185 && d[i + 1] > 165 && d[i + 2] > 135 && d[i] - d[i + 2] < 70) n++;
    return Math.round(n / (sx * sy));
  };
  return { map: M.id, live, blocks: RB.maps.blockedStatic(M, 3, 7), paper: paper(3, 7), back: paper(3, 2), seen: !!s.seen['ko.mitsu_letter'] };
});

// ---- 1. the three endings, and "Not now", from the real trigger ---------------------------------------------------
for (const [end, picks, comp] of [
  ['Mitsu', [/Give it to Mitsu/, /Give it to her/], 'mio'],
  ['wind', [/on the wind/, /Send it\./], 'nao'],
  ['kept', [/Give it back to Kihei/, /Give it back\./], 'suzu'],
  ['not now', [/Not now/], 'ren'],
]) {
  const { p, errors } = await page(b, url);
  await start(p, { map: 'ko.tidepools', x: 10, y: 19, dir: 'left', comp, letter: true });
  const r = await play(p, picks);
  await p.waitForTimeout(3500);
  const after = await p.evaluate(look), n = await notes(p), letter = await p.evaluate(() => RB.game.s.inv.ko_kihei_letter || 0);
  if (end === 'Mitsu' || end === 'wind') {
    const last = line(r, end === 'Mitsu' ? /^ko_kihei: …Please/ : /^ko_kihei: …I'm late, Hatsu/), gone = line(r, end === 'Mitsu' ? /footprints were gone/ : /Kihei was gone too/);
    ok(last && last.kihei && last.kihei.join() === '9,19' && gone && !gone.kihei && !after.kihei && !after.leaving,
      end + ' ending: Kihei stands there for his last line; for the line that says he has gone he is no longer standing there, and after it he is gone (' + JSON.stringify({ last: last && last.kihei, gone: gone && { kihei: gone.kihei, leaving: gone.leaving }, after: { kihei: after.kihei, leaving: after.leaving } }) + ')');
  } else if (end === 'kept') {
    const last = line(r, /^ko_kihei: …I should have said it myself/);
    ok(last && last.kihei && after.kihei && after.kihei.join() === '9,19' && !after.leaving, 'kept ending: Kihei stays by the pools (' + JSON.stringify({ last: last && last.kihei, after: after.kihei }) + ')');
  } else {
    ok(letter === 1 && after.kihei && after.kihei.join() === '9,19', 'Not now: the letter stays with you and Kihei waits (' + JSON.stringify({ letter, kihei: after.kihei }) + ')');
  }
  ok(end === 'Mitsu' ? n.length === 1 && n[0] === '{宿|やど} の ミツ さん に 、 キヘイ の {葉|は} を {届|とど}ける こと に した 。' : n.length === 0,
    end + ': ' + (end === 'Mitsu' ? 'one note to self, word for word' : 'no note about Mitsu') + ' (' + JSON.stringify(n) + ')');
  if (end === 'Mitsu') {
    // the note where notes are shown: the Journey's "Notes to self"
    await p.evaluate(() => RB.ui.menu.open('journal'));
    await p.waitForTimeout(800);
    const shown = await p.evaluate((NOTE) => document.body.innerText.includes(NOTE) || [...document.querySelectorAll('*')].some((e) => e.childElementCount === 0 && (e.textContent || '').includes('Decided to take Kihei')), NOTE);
    ok(shown, 'Mitsu ending: the note is shown in the Journey\'s notes to self');
    await p.evaluate(() => RB.ui.menu.close && RB.ui.menu.close());
  }
  allErrors.push(...errors); await p.close();
}

// ---- 2. the lodging house after the choice --------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, { map: 'ko.lodge', x: 7, y: 4, dir: 'up', done: true, flags: { ko_kihei_mitsu: true } });
  const f0 = await frame(p);
  const statics = await p.evaluate(() => { const M = RB.world.W.map; return { frames: M.props.filter((q) => q.p === 'ko_frame').map((q) => [q.x, q.y]), here: M.props.filter((q) => q.x === 3 && q.y === 7).map((q) => q.p), exit: M.exits.map((e) => [e.x, e.y]), mat: M.props.filter((q) => q.p === 'exitmat').map((q) => [q.x, q.y]) }; });
  ok(!f0.live.length && !f0.blocks && f0.paper < 4 && !f0.seen, 'after the choice, before the handing-over: no frame, nothing drawn by the door or at the back wall (' + JSON.stringify(f0) + ')');
  ok(statics.frames.length === 1 && statics.frames[0].join() === '3,7' && statics.here.join() === 'ko_frame' && statics.mat[0].join() === '4,7' && statics.exit[0].join() === '4,8',
    'the frame\'s one place is (3,7), beside the mat (4,7), inside the door (4,8), on a tile of its own (' + JSON.stringify(statics) + ')');
  const r = await play(p);
  const f1 = await frame(p);
  ok(r.lines[0] && /You give Mitsu Kihei's leaf/.test(r.lines[0].d) && f1.seen && f1.live.length === 1 && f1.live[0].join() === '3,7' && f1.blocks && f1.paper >= 12 && f1.back === f0.back,
    'Mitsu\'s talk is the handing-over; after it the frame is drawn at (3,7) and stands there, nothing at the back wall (' + JSON.stringify({ first: r.lines[0] && r.lines[0].d, f1 }) + ')');
  // read from beside it
  const reads = [];
  for (const [x, y, dir] of [[4, 7, 'left'], [3, 6, 'down'], [2, 7, 'right']]) {
    await at(p, x, y, dir);
    const rr = await play(p);
    reads.push([x + ',' + y + ' ' + dir, !!(rr.lines[0] && /leaf in the frame|frame/i.test(rr.lines[0].d)), rr.lines[0] && rr.lines[0].d]);
  }
  ok(reads.every((x) => x[1]), 'it is read from beside it: from the mat facing left, from above it, from its left (' + JSON.stringify(reads) + ')');
  // the way out from the mat (a press in a new direction turns you first: pressed until the map changes, at most four times)
  await at(p, 4, 7, 'up');
  for (let i = 0; i < 4 && (await p.evaluate(() => RB.world.W.map.id)) === 'ko.lodge'; i++) {
    await p.keyboard.down('ArrowDown'); await p.waitForTimeout(130); await p.keyboard.up('ArrowDown'); await p.waitForTimeout(900);
  }
  await p.waitForFunction(() => RB.game.mode() === 'world' && !RB.script.isRunning(), null, { timeout: 10000 }).catch(() => {});
  const out = await p.evaluate(() => RB.world.W.map.id);
  ok(out === 'ko.village', 'and the way out from the mat still leads to the village (' + out + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 3. old saves; 4. a load in the middle of the handing-over --------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, { map: 'ko.lodge', x: 7, y: 4, dir: 'up', done: true, flags: { ko_kihei_mitsu: true } });
  await p.evaluate(async () => { await RB.save.writeSlot(3, RB.game.s, { force: true }); });
  await start(p, { map: 'ko.lodge', x: 7, y: 4, dir: 'up', done: true, seen: true, flags: { ko_kihei_mitsu: true } });
  await p.evaluate(async () => { await RB.save.writeSlot(4, RB.game.s, { force: true }); });
  // a save from after the handing-over
  await p.evaluate(async () => { await RB.game.loadCampaign(4); });
  await p.waitForTimeout(1200);
  const fa = await frame(p);
  ok(fa.map === 'ko.lodge' && fa.seen && fa.live.length === 1 && fa.blocks && fa.paper >= 12, 'a save from after the handing-over loads with the frame by the door (' + JSON.stringify(fa) + ')');
  // a save from before it, and a load while it is told
  await p.evaluate(async () => { await RB.game.loadCampaign(3); });
  await p.waitForTimeout(1200);
  const fb = await frame(p);
  ok(fb.map === 'ko.lodge' && !fb.seen && !fb.live.length && !fb.blocks && fb.paper < 4, 'a save from before the handing-over loads with no frame (' + JSON.stringify(fb) + ')');
  await at(p, 7, 4, 'up');
  const r = await play(p, [], async (l, i) => {
    if (i !== 0) return false;
    await p.evaluate(async () => { await RB.game.loadCampaign(3); });
    await p.waitForTimeout(1200);
    return true;
  });
  const fm = await frame(p), mid = await p.evaluate(() => ({ run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen() }));
  ok(r.stopped && /You give Mitsu Kihei's leaf/.test(r.lines[0].d) && !mid.run && !mid.dlg && !fm.seen && !fm.live.length && !fm.blocks, 'a load in the middle of the handing-over: no frame, and the scene not counted as seen (' + JSON.stringify({ mid, fm }) + ')');
  await at(p, 7, 4, 'up');
  const r2 = await play(p);
  const f2 = await frame(p);
  ok(/You give Mitsu Kihei's leaf/.test((r2.lines[0] || {}).d || '') && f2.seen && f2.live.length === 1 && f2.paper >= 12, 'told again, it ends with the frame by the door (' + JSON.stringify(f2) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 5. your companion when the handing-over ends --------------------------------------------------------------------
{
  // walked in from the door to Mitsu (your companion one step behind you), then the handing-over: nobody is on the
  // frame's tile when it appears, and your companion is beside you
  const { p, errors } = await page(b, url);
  await start(p, { map: 'ko.lodge', x: 4, y: 7, dir: 'up', done: true, comp: 'mio', flags: { ko_kihei_mitsu: true } });
  await p.evaluate(() => RB.world.tapTile(7, 4));
  await p.waitForFunction(() => RB.world.W.player.x === 7 && RB.world.W.player.y === 4 && !RB.world.W.player.mv, null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(600);
  const before = await p.evaluate(() => ({ pc: [RB.world.W.player.x, RB.world.W.player.y], comp: RB.world.W.comp && [RB.world.W.comp.x, RB.world.W.comp.y] }));
  await p.evaluate(() => { RB.world.W.player.dir = 'up'; });
  await play(p);
  const f = await frame(p);
  const after = await p.evaluate(() => { const W = RB.world.W; const on = W.npcs.concat(W.extras).filter((a) => a.x === 3 && a.y === 7).map((a) => a.id); return { pc: [W.player.x, W.player.y], comp: W.comp && [W.comp.x, W.comp.y], on }; });
  const near = after.comp && Math.abs(after.comp[0] - after.pc[0]) + Math.abs(after.comp[1] - after.pc[1]) <= 1;
  ok(before.pc.join() === '7,4' && f.live.length === 1 && after.comp && after.comp.join() !== '3,7' && after.pc.join() !== '3,7' && !after.on.length && near,
    'walked in to Mitsu with your companion behind you: when the frame appears nobody stands on its tile, your companion beside you (' + JSON.stringify({ before, after }) + ')');
  // (a stated limit, not a check: a figure put on (3,7) by hand before the frame appears is not moved off it by the
  // game, which moves only you off a tile that has come to block, 50_world.js unstick; ordinary following cannot put
  // your companion there, seven steps from Mitsu)
  await start(p, { map: 'ko.lodge', x: 7, y: 4, dir: 'up', done: true, comp: 'mio', flags: { ko_kihei_mitsu: true } });
  await p.evaluate(() => { const c = RB.world.W.comp; c.x = 3; c.y = 7; c.fx = 3; c.fy = 7; c.mv = null; c.route = null; });
  await play(p);
  await p.waitForTimeout(800);
  console.log('note companion put on (3,7) by hand, after the handing-over: ' + JSON.stringify(await p.evaluate(() => RB.world.W.comp && [RB.world.W.comp.x, RB.world.W.comp.y])));
  allErrors.push(...errors); await p.close();
}

ok(!allErrors.length, 'no page errors ' + allErrors.slice(0, 3).join(' | '));
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
