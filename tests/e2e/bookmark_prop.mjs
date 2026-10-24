// A prop's own line, kept, is kept with the prop it was read on (a sweep finding; Local CL-314, Agnes 6386782599), and
// its "Hear it" still asks for its recording (Agnes 6387447788, Local CL-319).
// Since every displayed line is spoken (abf574d), a prop's own line is shown under the scene id code.prop, so its
// recording is found; the bookmark took that id for a scene and lost the prop it was read on (its source
// {k:'sc', id:'code.prop'}, its status "removed"). With the prop as its source, the scene id it was shown under is kept
// beside it (sid), and the Kept sentences page's "Hear it" asks the voice for that. In Chromium on the built game, the
// miller's notice in the Old Mill (rw.mill1, the sign at 9,9), read with the action key:
//  1. kept live (K while the line shows): its source the prop, {k:'pr', m:'rw.mill1', x:9, y:9, o:'sign'}, the
//     object a sign, the map and place the Old Mill, its status "ok"; the line shown still under code.prop;
//  2. kept later from the history, after going to another map: the same source (taken when the line was shown);
//  3. a save made with it, loaded: the same;
//     after each of 1-3, a real click on its "Hear it": the voice is asked for code.prop with the notice's Japanese, the
//     key its prepared recording is listed under (code.prop#790660feb5, docs/future/voice/production/supplements/
//     SL1_SUPPLEMENT.json, map rw.mill1); the voice's two entry points are recorded with their exact arguments, the key
//     is the voicebank's own lookup (RB.voicebank._.wanted), and nothing is played (no device voice stands in);
//  4. the village signpost (a prop with a scene) kept as before, {k:'sc', id:'rw.sign_square', o, x, y}; its "Hear it"
//     asks for its scene;
//  5. unchanged: a line shown without a scene id asks for none; a bookmark kept on CC-022 ({k:'sc', id:'code.prop'},
//     no sid) still asks for code.prop; a prop bookmark from before every line had a scene id (no sid) asks for none;
//  6. opening the notice's entry by a real click on its row in Kept sentences: what it was read on and where, intact,
//     and its "Hear it" (no page in the game links to an entry yet: RB.ui.wordsPages.show is their entry point, and
//     the bookmarks suite opens one through it);
//  7. no page errors.
// (tests/unit/bookmarks.test.mjs holds the rest: twin signs, a prop two tiles wide, a hidden prop, a line that is
// not the prop's, a scene's prop, a battle, a door, the scene id kept for each, and an old bookmark left as it is.)
// Usage: node tools/build.mjs && node tests/e2e/bookmark_prop.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const NOTICE = { k: 'pr', m: 'rw.mill1', x: 9, y: 9, o: 'sign' };
// the notice's prepared recording, as the voice production lists it
const SL1 = JSON.parse(fs.readFileSync(path.join(root, 'docs/future/voice/production/supplements/SL1_SUPPLEMENT.json'), 'utf8'));
const TAKE = SL1.entries.flatMap((e) => (e.lines || []).filter((l) => l.scene === 'code.prop' && l.file === 'map rw.mill1').map((l) => ({ key: l.key, display: e.display })));

// a journey in the village, the dialogue at its quickest; every line shown recorded (its scene id: the voice's lookup)
await p.evaluate(() => {
  const s = RB.game.debugStart('rw.village', 23, 22, { edition: RB.edition.forNew(), dir: 'up' });
  s.learn.profile = 'E'; RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
  RB.save.autosave = async () => {};
  window.__shown = [];
  const say0 = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) { window.__shown.push({ jp: l && l.jp, sceneId: l && l.sceneId }); return say0.apply(this, arguments); };
  // "Hear it": while window.__hear is set, the voice's two entry points record their arguments exactly (and the key the
  // prepared recordings are looked up by, the voicebank's own), the button is offered, and nothing is played
  window.__hear = null;
  const can0 = RB.voice.canSayLine, sayv0 = RB.voice.sayLine;
  const rec = (f, display, source) => { const w = RB.voicebank._.wanted(display, source); return { f, sceneId: source ? source.sceneId : undefined, jp: source && source.jp, who: source && source.who, key: (w && w.key) || null }; };
  RB.voice.canSayLine = function (display, source) { if (!window.__hear) return can0.apply(this, arguments); window.__hear.push(rec('can', display, source)); return true; };
  RB.voice.sayLine = function (display, source) { if (!window.__hear) return sayv0.apply(this, arguments); window.__hear.push(rec('say', display, source)); return Promise.resolve(true); };
});
await p.waitForTimeout(300);
const closeAll = () => p.evaluate(async () => { for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 50)); } });
const noticeJp = await p.evaluate(() => RB.content.maps['rw.mill1'].props.find((q) => q.x === 9 && q.y === 9 && q.text).text.jp);
ok(TAKE.length === 1 && TAKE[0].display === noticeJp, "the notice's prepared recording, as the production lists it: " + J(TAKE));
const KEY = TAKE[0] && TAKE[0].key;
// face the notice in the mill and read it
async function readNotice() {
  await p.evaluate(() => { RB.world.enter('rw.mill1', 9, 10, 'up'); });
  await p.waitForTimeout(400);
  await closeAll();
  await p.evaluate(() => { RB.world.W.player.dir = 'up'; });
  await p.keyboard.press('KeyZ');
  await p.waitForFunction(() => RB.ui.dialogue.isOpen() && /flour|粉/.test(document.querySelector('.dlg .main').textContent), null, { timeout: 5000 });
}
// a kept sentence's "Hear it", clicked on its page: what the voice was asked for
async function hear(id, open) {
  await closeAll();
  await p.evaluate(([id, byRow]) => { window.__hear = []; RB.ui.menu.close(); if (!byRow) RB.ui.wordsPages.show('bookmarks', id); }, [id, !!open]);
  if (open) await open();
  const sel = '[data-bm-hear="' + id + '"]';
  await p.waitForSelector(sel, { timeout: 5000 });
  await p.click(sel);
  await p.waitForTimeout(150);
  const h = await p.evaluate(() => { const h = window.__hear || []; window.__hear = null; RB.ui.menu.close(); return h; });
  const say = h.filter((x) => x.f === 'say');
  return { can: h.filter((x) => x.f === 'can').pop() || null, say: say.length === 1 ? say[0] : say };
}
const asksTake = (r) => r.say && r.say.sceneId === 'code.prop' && r.say.jp === noticeJp && r.say.who === 'narr' && r.say.key === KEY && r.can && r.can.sceneId === 'code.prop' && r.can.key === KEY;

// ---- 1. kept live --------------------------------------------------------------------------------------------------
await readNotice();
await p.keyboard.press('KeyK');
await p.waitForTimeout(150);
const live = await p.evaluate((jp) => {
  const b = RB.game.s.bookmarks.find((x) => x.map === 'rw.mill1');
  const shown = window.__shown.filter((l) => l.jp === jp).pop();
  return { id: b && b.id, src: b && b.src, obj: b && b.obj, map: b && b.map, place: b && b.place && b.place.en, status: b && RB.bookmarks.status(b), sceneId: shown && shown.sceneId };
}, noticeJp);
ok(J(live.src) === J(NOTICE) && live.obj === 'sign' && live.map === 'rw.mill1' && live.place === 'The Old Mill' && live.status === 'ok', "kept live: the miller's notice, kept with the sign it was read on in the Old Mill, its source found (" + J(live) + ')');
ok(live.sceneId === 'code.prop', 'the line shown still under code.prop, so its recording is found as before (' + live.sceneId + ')');
const h1 = await hear(live.id);
ok(asksTake(h1), 'kept live, "Hear it" clicked: the voice asked for code.prop with the notice\'s Japanese, its recording\'s key ' + KEY + ' (' + J(h1) + ')');

// ---- 2. kept later from the history, after going to another map ------------------------------------------------------
const later = await p.evaluate(async (jp) => {
  const s = RB.game.s;
  s.bookmarks.length = 0;
  RB.world.enter('rw.village', 23, 22, 'up');
  await new Promise((r) => setTimeout(r, 400));
  for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 50)); }
  const e = [...s.backlog].reverse().find((x) => x.jp === jp);
  const r = RB.bookmarks.keep(s, e);
  return { map: RB.world.W.map.id, ok: r.ok, id: r.b && r.b.id, src: r.b && r.b.src, obj: r.b && r.b.obj, bm: r.b && r.b.map, status: r.b && RB.bookmarks.status(r.b) };
}, noticeJp);
ok(later.map === 'rw.village' && later.ok && J(later.src) === J(NOTICE) && later.obj === 'sign' && later.bm === 'rw.mill1' && later.status === 'ok', 'kept from the history after going back to the village: the same source, taken when the line was shown (' + J(later) + ')');
const h2 = await hear(later.id);
ok(asksTake(h2), 'kept from the history, "Hear it" clicked: the same recording asked for (' + J(h2) + ')');

// ---- 3. a save made with it, loaded ---------------------------------------------------------------------------------
await p.evaluate(async () => { await RB.save.manualSave(1); });
await p.evaluate(async () => { RB.game.s.bookmarks.length = 0; await RB.game.loadCampaign(1, 'manual'); });
await p.waitForTimeout(800);
const loaded = await p.evaluate(() => { const b = RB.game.s.bookmarks.find((x) => x.map === 'rw.mill1'); return { id: b && b.id, src: b && b.src, obj: b && b.obj, status: b && RB.bookmarks.status(b) }; });
ok(J(loaded.src) === J(NOTICE) && loaded.obj === 'sign' && loaded.status === 'ok', 'saved and loaded: the same (' + J(loaded) + ')');
const h3 = await hear(loaded.id);
ok(asksTake(h3), 'saved and loaded, "Hear it" clicked: the same recording asked for (' + J(h3) + ')');

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
const sp = await p.evaluate(() => { const b = RB.game.s.bookmarks.find((x) => x.src && x.src.id === 'rw.sign_square'); return b && { id: b.id, src: b.src, obj: b.obj, map: b.map, key: RB.voicebank.keyOf('rw.sign_square', b.jp) }; });
ok(sign && sp && sp.src.k === 'sc' && sp.src.x === 23 && sp.src.y === 21 && sp.obj === 'sign' && sp.map === 'rw.village', 'the village signpost (a prop with a scene): kept as before, with its scene (' + J(sp) + ')');
const h4 = sp ? await hear(sp.id) : {};
ok(h4.say && h4.say.sceneId === 'rw.sign_square' && h4.say.key === sp.key, 'its "Hear it": its scene asked for, as before (' + J(h4) + ')');

// ---- 5. unchanged: no scene id, and bookmarks kept before -------------------------------------------------------------
const ctl = await p.evaluate((jp) => {
  const s = RB.game.s;
  // a line shown without a scene id
  const e = { who: 'narr', jp: '{風|かぜ} が {吹|ふ}く 。', en: 'The wind blows.' };
  s.backlog.push(e); RB.bookmarks.capture({ who: 'narr', jp: e.jp, en: e.en }, e, s);
  const plain = RB.bookmarks.keep(s, e).b;
  // as a save from CC-022 holds the notice (its source the scene id alone), and a prop bookmark from before every line
  // had a scene id
  const base = { t: 1, jp, en: 'x', who: 'narr', map: 'rw.mill1', title: '', note: '' };
  s.bookmarks.push(Object.assign({ id: 'bm_cc022', key: 'k1', src: { k: 'sc', id: 'code.prop' } }, base));
  s.bookmarks.push(Object.assign({ id: 'bm_older', key: 'k2', src: { k: 'pr', m: 'rw.mill1', x: 9, y: 9, o: 'sign' }, obj: 'sign' }, base));
  return { plain: plain && plain.id, src: plain && plain.src, sid: plain && plain.sid };
}, noticeJp);
const h5 = await hear(ctl.plain);
ok(J(ctl.src) === J({ k: 'ln' }) && ctl.sid === undefined && h5.say && h5.say.sceneId === null && h5.say.key === null, 'a line shown without a scene id: none kept, none asked for (' + J({ ctl, h5 }) + ')');
const h6 = await hear('bm_cc022');
ok(asksTake(h6), 'a bookmark kept on CC-022 (its source code.prop alone, no sid): its recording still asked for (' + J(h6) + ')');
const h7 = await hear('bm_older');
ok(h7.say && h7.say.sceneId === null && h7.say.key === null, 'a prop bookmark from before every line had a scene id (no sid): none asked for, as before; nothing guessed (' + J(h7) + ')');

// ---- 6. the notice's entry opened by a click on its row ---------------------------------------------------------------
const nid = loaded.id;
const h8 = await hear(nid, async () => {
  await p.evaluate(() => RB.ui.menu.open('bookmarks'));
  const row = '[data-bm-open="' + nid + '"]';
  await p.waitForSelector(row, { timeout: 5000 });
  await p.click(row);
  await p.waitForSelector('.bm-detail', { timeout: 5000 });
  const d = await p.evaluate((id) => ({ open: document.querySelector('[data-bm-open="' + id + '"]').getAttribute('aria-expanded'), meta: document.querySelector('.bm-meta').textContent.replace(/\s+/g, ' '), ex: document.querySelectorAll('.bm-excerpt').length }), nid);
  ok(d.open === 'true' && /Read on/.test(d.meta) && /Sign/.test(d.meta) && /The Old Mill/.test(d.meta) && !d.ex, "the notice's entry opened by a click on its row: read on a sign in the Old Mill, no saved-excerpt slip (" + J(d) + ')');
});
ok(asksTake(h8), 'and its "Hear it" there: the same recording asked for (' + J(h8) + ')');

ok(!errors.length, 'no page errors (' + J(errors).slice(0, 300) + ')');
await ctx.close(); await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
