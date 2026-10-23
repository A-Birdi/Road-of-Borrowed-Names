// RBN-QA-163 (Agnes 6374243437, 6375174827, 6376014281; Local CL-248; Cloud CC-153 §6, CC-154 §4, CC-155 §2): Chapter
// 4's bridge census in the browser, with a throwaway journey (the census open, Blockprint Row known), pressing at the
// Ink Bridge's plaque as a player does (the automated player answering):
//  1. read back: the name noted, the board as the art draws it the same as unread;
//  2. looked at again: the new line, nothing counted again;
//  3. saved, back to the title and loaded, the census still open: the board still blank, the same line;
//  4. once Sen has the names: the board carved, the same as an older plaque read back, and the plaque reads its name;
//  5. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/census_plaques.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const errorsAll = [];
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, mp_arrived: true, mp_sobe_met: true };
const REC = 'The name is in your notebook. The plaque will be cut again once Sen has it.';

const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.evaluate(async (FLAGS) => {
  const s = RB.game.debugStart('mp.blockprint', 22, 21, { dir: 'down', edition: RB.edition.forNew(), flags: FLAGS });
  s.comp = null;
  s.quests.mp_census = { stage: 0, done: false, t: 1 };
  for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
  RB.game.settings.textSpeed = 'instant';
  RB.save.autosave = async () => {};
  RB.test.enable();
  await new Promise((r) => setTimeout(r, 700));
  window.__said = [];
  const say = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
  // the board as the art draws it (draw2, through the art's cache), for this plaque's options or an older plaque's
  window.__board = (o) => {
    const P = RB.props.P.mb_plaque, pal = RB.tiles.PAL[RB.world.W.map.region] || RB.tiles.PAL.reedwake;
    const c = document.createElement('canvas'); c.width = 64; c.height = 96;
    P.draw2(c.getContext('2d'), 16, 48, pal, 0, o);
    return c.toDataURL();
  };
}, FLAGS);
const look = () => p.evaluate(async () => {
  window.__said = [];
  await RB.test.use(21, 21);
  await RB.test.idle();
  return { said: window.__said.slice(), n: RB.game.s.vars.mp_census || 0, noted: !!RB.game.s.flags.mb_pl_sumi };
});
const board = () => p.evaluate(() => {
  const sumi = RB.content.maps['mp.blockprint'].props.find((q) => q.p === 'mb_plaque' && q.o && q.o.bridge === 'sumi').o;
  const s = RB.game.s, had = s.flags.mb_pl_sumi;
  const now = window.__board(sumi);
  delete s.flags.mb_pl_sumi; const unread = window.__board(sumi); if (had) s.flags.mb_pl_sumi = had;
  const hadF = s.flags.mb_pl_fuda; s.flags.mb_pl_fuda = true; const older = window.__board({ bridge: 'fuda' }); if (!hadF) delete s.flags.mb_pl_fuda;
  return { blank: now === unread, likeOlder: now === older };
});

// ---- 1. read back
const r1 = await look();
const b1 = await board();
ok(r1.noted && r1.n === 1 && r1.said[r1.said.length - 1] === 'You note the name down. Once Sen has it, the plaque will be cut again.' && b1.blank && !b1.likeOlder,
  'read back with the census open: the name noted, the board drawn as unread (' + JSON.stringify({ r1, b1 }) + ')');
// ---- 2. again
const r2 = await look();
ok(r2.said.length === 1 && r2.said[0] === REC && r2.n === 1, 'looked at again: the new line, nothing counted again (' + JSON.stringify(r2) + ')');
// ---- 3. saved, to the title, loaded
const ld = await p.evaluate(async () => {
  try { await RB.save.manualSave(3); await RB.game.toTitle(); await RB.game.loadCampaign(3, 'manual'); RB.test.enable(); await new Promise((r) => setTimeout(r, 900)); return RB.world.W.map.id; } catch (e) { return 'failed: ' + e.message; }
});
const b3 = await board();
const r3 = await look();
ok(ld === 'mp.blockprint' && b3.blank && r3.said.length === 1 && r3.said[0] === REC && r3.n === 1 && r3.noted,
  'saved and loaded with the census open: the board still blank, the same line, nothing counted (' + JSON.stringify({ ld, b3, r3 }) + ')');
// ---- 4. Sen has the names
await p.evaluate(() => { RB.game.s.quests.mp_census = { stage: 1, done: true, t: 2 }; });
const b4 = await board();
const r4 = await look();
ok(b4.likeOlder && !b4.blank && r4.said.length === 1 && /^The plaque reads: "Ink Bridge\."$/.test(r4.said[0]) && r4.n === 1,
  'once Sen has the names: the board carved like an older plaque, and the plaque reads its name (' + JSON.stringify({ b4, r4 }) + ')');
errorsAll.push(...errors); await ctx.close();

ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
