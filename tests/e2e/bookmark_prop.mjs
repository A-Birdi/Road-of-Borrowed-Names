// A prop's own line, kept, is kept with the prop it was read on (a sweep finding; Local CL-314, Agnes 6386782599).
// Since every displayed line is spoken (abf574d), a prop's own line is shown under the scene id code.prop, so its
// recording is found; the bookmark took that id for a scene and lost the prop it was read on (its source
// {k:'sc', id:'code.prop'}, its status "removed"). In Chromium on the built game, the miller's notice in the Old Mill
// (rw.mill1, the sign at 9,9), read with the action key:
//  1. kept live (K while the line shows): its source the prop, {k:'pr', m:'rw.mill1', x:9, y:9, o:'sign'}, the
//     object a sign, the map and place the Old Mill, its status "ok"; the line shown still under code.prop (the
//     voice's lookup unchanged);
//  2. kept later from the history, after going to another map: the same source (taken when the line was shown);
//  3. a save made with it, loaded: the same;
//  4. the village signpost (a prop with a scene) kept as before: {k:'sc', id:'rw.sign_square', o, x, y};
//  5. no page errors.
// (tests/unit/bookmarks.test.mjs holds the rest: twin signs, a prop two tiles wide, a hidden prop, a line that is
// not the prop's, a scene's prop, a battle, a door, and an old bookmark left as it is.)
// Usage: node tools/build.mjs && node tests/e2e/bookmark_prop.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const NOTICE = { k: 'pr', m: 'rw.mill1', x: 9, y: 9, o: 'sign' };

// a journey in the village, the dialogue at its quickest; every line shown recorded (its scene id: the voice's lookup)
await p.evaluate(() => {
  const s = RB.game.debugStart('rw.village', 23, 22, { edition: RB.edition.forNew(), dir: 'up' });
  s.learn.profile = 'E'; RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
  RB.save.autosave = async () => {};
  window.__shown = [];
  const say0 = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) { window.__shown.push({ jp: l && l.jp, sceneId: l && l.sceneId }); return say0.apply(this, arguments); };
});
await p.waitForTimeout(300);
const closeAll = () => p.evaluate(async () => { for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 50)); } });
// face the notice in the mill and read it
async function readNotice() {
  await p.evaluate(() => { RB.world.enter('rw.mill1', 9, 10, 'up'); });
  await p.waitForTimeout(400);
  await closeAll();
  await p.evaluate(() => { RB.world.W.player.dir = 'up'; });
  await p.keyboard.press('KeyZ');
  await p.waitForFunction(() => RB.ui.dialogue.isOpen() && /flour|粉/.test(document.querySelector('.dlg .main').textContent), null, { timeout: 5000 });
}

// ---- 1. kept live --------------------------------------------------------------------------------------------------
await readNotice();
await p.keyboard.press('KeyK');
await p.waitForTimeout(150);
const live = await p.evaluate(() => {
  const b = RB.game.s.bookmarks.find((x) => x.map === 'rw.mill1');
  const jp = RB.content.maps['rw.mill1'].props.find((q) => q.x === 9 && q.y === 9 && q.text).text.jp;
  const shown = window.__shown.filter((l) => l.jp === jp).pop();
  return { src: b && b.src, obj: b && b.obj, map: b && b.map, place: b && b.place && b.place.en, status: b && RB.bookmarks.status(b), sceneId: shown && shown.sceneId };
});
ok(J(live.src) === J(NOTICE) && live.obj === 'sign' && live.map === 'rw.mill1' && live.place === 'The Old Mill' && live.status === 'ok', "kept live: the miller's notice, kept with the sign it was read on in the Old Mill, its source found (" + J(live) + ')');
ok(live.sceneId === 'code.prop', 'the line shown still under code.prop, so its recording is found as before (' + live.sceneId + ')');
await closeAll();

// ---- 2. kept later from the history, after going to another map ------------------------------------------------------
const later = await p.evaluate(async () => {
  const s = RB.game.s;
  s.bookmarks.length = 0;
  RB.world.enter('rw.village', 23, 22, 'up');
  await new Promise((r) => setTimeout(r, 400));
  for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 50)); }
  const jp = RB.content.maps['rw.mill1'].props.find((q) => q.x === 9 && q.y === 9 && q.text).text.jp;
  const e = [...s.backlog].reverse().find((x) => x.jp === jp);
  const r = RB.bookmarks.keep(s, e);
  return { map: RB.world.W.map.id, ok: r.ok, src: r.b && r.b.src, obj: r.b && r.b.obj, bm: r.b && r.b.map, status: r.b && RB.bookmarks.status(r.b) };
});
ok(later.map === 'rw.village' && later.ok && J(later.src) === J(NOTICE) && later.obj === 'sign' && later.bm === 'rw.mill1' && later.status === 'ok', 'kept from the history after going back to the village: the same source, taken when the line was shown (' + J(later) + ')');

// ---- 3. a save made with it, loaded ---------------------------------------------------------------------------------
await p.evaluate(async () => { await RB.save.manualSave(1); });
await p.evaluate(async () => { RB.game.s.bookmarks.length = 0; await RB.game.loadCampaign(1, 'manual'); });
await p.waitForTimeout(800);
const loaded = await p.evaluate(() => { const b = RB.game.s.bookmarks.find((x) => x.map === 'rw.mill1'); return { src: b && b.src, obj: b && b.obj, status: b && RB.bookmarks.status(b) }; });
ok(J(loaded.src) === J(NOTICE) && loaded.obj === 'sign' && loaded.status === 'ok', 'saved and loaded: the same (' + J(loaded) + ')');

// ---- 4. the village signpost, a prop with a scene, as before ----------------------------------------------------------
await closeAll();
const sign = await p.evaluate(async () => {
  RB.world.enter('rw.village', 23, 22, 'up');
  await new Promise((r) => setTimeout(r, 400));
  for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 50)); }
  RB.world.W.player.dir = 'up';
  return true;
});
await p.keyboard.press('KeyZ');
await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 5000 });
await p.keyboard.press('KeyK');
await p.waitForTimeout(150);
const sp = await p.evaluate(() => { const b = RB.game.s.bookmarks.find((x) => x.src && x.src.id === 'rw.sign_square'); return b && { src: b.src, obj: b.obj, map: b.map }; });
ok(sign && sp && sp.src.k === 'sc' && sp.src.x === 23 && sp.src.y === 21 && sp.obj === 'sign' && sp.map === 'rw.village', 'the village signpost (a prop with a scene): kept as before, with its scene (' + J(sp) + ')');

ok(!errors.length, 'no page errors (' + J(errors).slice(0, 300) + ')');
await ctx.close(); await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
