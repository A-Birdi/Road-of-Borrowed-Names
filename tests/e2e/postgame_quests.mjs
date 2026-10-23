// RBN-QA-161 and RBN-QA-162 (Agnes 6373640071, 6373739758; Local CL-243 to CL-245; Cloud CC-150 §1): after the story,
// an open side quest of Snowbell's comes to the person it belongs to before their news. In Chromium on the built game,
// with throwaway journeys as the story leaves Snowbell (the storm and the morning after it over, the lamp lit), talking
// as a player does (pressed at the person, the automated player answering):
//  1. the Bell-Post stuck at stage 2, Fuki's news already heard: she takes the report (its first line where she
//     stands), the cord once, the signals note once, the quest done; saved and loaded, then talked to again: her news,
//     nothing twice;
//  2. the snow-sculpture contest open with all three looked at: Kanta judges; Chiyo's observatory wins; the scarf once,
//     the contest done; talked to again: his news, nothing twice;
//  3. before the story's end in her house, the Bell-Post's report is as before;
//  4. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/postgame_quests.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const errorsAll = [];
const POST = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, sb_storm: true, sb_morning: true, sb_lamp_lit: true, sb_hamlet_seen: true, sb_evening_seen: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, postgame: true };

async function begin(p, o) {
  await p.evaluate(async (o) => {
    const s = RB.game.debugStart(o.map || 'sb.hamlet', o.x || 22, o.y || 22, { dir: 'up', edition: RB.edition.forNew(), flags: o.flags });
    s.comp = null;
    Object.assign(s.quests, o.quests || {});
    Object.assign(s.seen, o.seen || {});
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    RB.test.enable();
    await new Promise((r) => setTimeout(r, 800));
    RB.world.refreshActors();
    // every line said, by whom
    window.__said = [];
    if (!window.__sayWrap) {
      window.__sayWrap = true;
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { if (l) window.__said.push((l.who || '') + ': ' + (l.en || '')); return say.apply(this, arguments); };
    }
  }, o);
}
const talk = (p, id) => p.evaluate(async (id) => { window.__said = []; await RB.test.talk(id); await RB.test.idle(); return window.__said.slice(); }, id);
const state = (p) => p.evaluate(() => { const s = RB.game.s; return { bell: s.quests.sb_bell || null, snow: s.quests.sb_snow || null, cord: s.inv.sb_bell_cord || 0, scarf: s.inv.sb_scarf || 0, notes: s.notebook.filter((e) => e.id === 'sb_bell_signals').length }; });

// ---- 1. the Bell-Post -----------------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { flags: POST, quests: { sb_bell: { stage: 2, done: false, t: 1 } }, seen: { 'sb.fuki_post': true } });
  const L = await talk(p, 'fuki');
  const a = await state(p);
  ok(/^fuki: I heard it\. The noon bell\. Two strokes, clean\. Fifty years of ringing it, and the first time I've listened from down here\.$/.test(L[0] || '') && !L.some((x) => /from my bed/.test(x)) && a.cord === 1 && a.notes === 1 && a.bell && a.bell.done,
    'the Bell-Post stuck at stage 2 after the story: Fuki takes the report where she stands; the cord, the note, the quest done (' + JSON.stringify({ first: L[0], n: L.length, a }) + ')');
  await p.evaluate(async () => { await RB.save.manualSave(3); });
  const ld = await p.evaluate(async () => { try { await RB.game.loadCampaign(3, 'manual'); await new Promise((r) => setTimeout(r, 900)); RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {}; RB.test.enable(); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
  const L2 = await talk(p, 'fuki');
  const a2 = await state(p);
  ok(ld === 'loaded' && L2.length >= 1 && !L2.some((x) => /I heard it|Take this/.test(x)) && a2.cord === 1 && a2.notes === 1 && a2.bell.done, 'saved, loaded and talked to again: her news, nothing twice (' + JSON.stringify({ ld, L2, a2 }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 2. the snow-sculpture contest ----------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { flags: POST, quests: { sb_snow: { stage: 0, done: false, t: 1 } }, seen: { 'sb.sculpt_goat': true, 'sb.sculpt_obs': true, 'sb.sculpt_fox': true } });
  const L = await talk(p, 'kanta');
  const a = await state(p);
  ok(L.some((x) => /^kanta: Decided\? Which one wins\?/.test(x)) && L.some((x) => /Chiyo's observatory!/.test(x)) && a.scarf === 1 && a.snow && a.snow.done, 'the contest open, all three looked at: Kanta judges, Chiyo\'s observatory wins, the scarf, the contest done (' + JSON.stringify({ L: L.map((x) => x.slice(0, 50)), a }) + ')');
  const L2 = await talk(p, 'kanta');
  const a2 = await state(p);
  ok(L2.length >= 1 && !L2.some((x) => /Decided\?/.test(x)) && a2.scarf === 1, 'talked to again: his news, nothing twice (' + JSON.stringify({ L2, a2 }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 3. before the story's end, in her house ----------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { map: 'sb.fuki', x: 4, y: 4, flags: { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, sb_hamlet_seen: true }, quests: { sb_bell: { stage: 2, done: false, t: 1 } } });
  const L = await talk(p, 'fuki');
  const a = await state(p);
  ok(/^fuki: I heard it\. The noon bell\. Two strokes, clean\. First time in fifty years I've heard the bell from my bed\.$/.test(L[0] || '') && a.cord === 1 && a.bell.done, 'in her house before the chapter\'s end: the report as before (' + JSON.stringify({ first: L[0], a }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
