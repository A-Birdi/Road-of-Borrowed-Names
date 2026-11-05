// Councillor Tami's flood count and her revisit, in Chromium (one row, the checks kept distinct: Cloud CC-411, CC-414
// and CC-539; Local CL-570, CL-573 and CL-706; Agnes 6549001897 and 6549667967). On the built game, on throwaway
// journeys (never a real save): Tami talked to through the world's own interact, the minutes' exercise answered by the
// test helper; a save made and loaded through the game's own save and load:
//  The flood count:
//  1. edition 2, with Mio: the minutes; "Many people in the lower quarter fled to high ground" and "Tōya didn't come
//     back." once each, in order; "Everyone…" and "Only Tōya…" never; the exercise; step 5; the Tōya note given, its
//     English the agreed one;
//  2. edition 1, with no companion: the same lines;
//  The revisit:
//  3. edition 2, with Suzu: the council and the letter; then Tami again at once: "The council is still in session…",
//     "Rest in town before you set off…"; no "Day three", not the mountain line, not the letter; a save and load,
//     then again: the same;
//  4. edition 1, with Ren: the council; then again: the new first line and the mountain line; not "set off";
//  5. edition 2, with Nao, after the Cloudroad (cr_done), and after yn_done: the same as 3;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/lf_tami_lines.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const BASE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'lf_arrived', 'lf_town_intro'];

async function at(p, o) {
  await p.evaluate(async ({ BASE, o }) => {
    const f = {};
    for (const k of BASE.concat(o.flags || [])) f[k] = true;
    const s = RB.game.debugStart('lf.council', 7, 8, { comp: o.comp, dir: 'up', edition: o.ed, flags: f });
    s.quests.lf_main = { stage: o.main, done: !!o.mainDone, t: 1 };
    for (const [k, v] of Object.entries(o.inv || {})) s.inv[k] = v;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.test.enable({});
    window.__runs = [];
    const run = RB.challenge.run;
    RB.challenge.run = async function (id) { const r = await run.apply(this, arguments); window.__runs.push([id, !!(r && r.ok)]); return r; };
    await new Promise((r) => setTimeout(r, 900));
    RB.world.refreshActors();
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push([l.who || 'narr', l.en || '']); return say.apply(this, arguments); };
  }, { BASE, o });
}
const act = (p) => p.evaluate(async () => {
  window.__said = []; window.__runs = [];
  await RB.test.idle();
  await RB.test.talk('lf_yae');
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  return { said: window.__said.slice(), runs: window.__runs.slice(), mode: RB.game.mode(), map: RB.world.W.map.id };
});
const state = (p) => p.evaluate(() => {
  const s = RB.game.s, q = (id) => (s.quests[id] ? (s.quests[id].done ? 'done' : s.quests[id].stage) : '-');
  return { main: q('lf_main'), ko: q('ko_main'), ch5: !!s.flags.ch5_done, called: !!s.flags.ko_called, toya: s.notebook.filter((e) => e.id === 'lf_toya').length, noteEn: (RB.content.notes.lf_toya || {}).en };
});
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
const count = (said, re, who) => said.filter(([w, en]) => re.test(en) && (!who || w === who)).length;
const idx = (said, re) => said.findIndex(([, en]) => re.test(en));
const R = {
  many: /^That night Tōya took the bell tower key and ran to the tower\. The bell rang\. Many people in the lower quarter fled to high ground\. Me included\.$/,
  toya: /^Tōya didn't come back\.$/, everyone: /Everyone in the lower quarter/, only: /Only Tōya/,
  l755: /^The council is still in session\. Nobody agrees on anything\. Marvellous\.$/, day3: /Day three/,
  ed1: /^Rest in town before you go up the mountain\. The inn can say "full" now, so book early\.$/,
  ed2: /^Rest in town before you set off\. The inn can say "full" now, so book early\.$/,
  letter: /^"Leaves with writing on them are washing up/, order: /^Order! …Not that anyone's quieting down/,
};
const NOTE = 'Kasane\'s younger brother, a messenger. He ran to the tower to ring the warning bell. Many people in the lower quarter got out in time; Tōya did not come back. His last conversation with Kasane was an argument about that message.';
const flood = (t) => ({ many: count(t.said, R.many, 'lf_yae'), toya: count(t.said, R.toya, 'lf_yae'), everyone: count(t.said, R.everyone), only: count(t.said, R.only), order: idx(t.said, R.many) < idx(t.said, R.toya), runs: t.runs, mode: t.mode });
const later = (t) => ({ l755: count(t.said, R.l755, 'lf_yae'), ed1: count(t.said, R.ed1, 'lf_yae'), ed2: count(t.said, R.ed2, 'lf_yae'), day3: count(t.said, R.day3), letter: count(t.said, R.letter), order: count(t.said, R.order), n: t.said.length, mode: t.mode });
const isLater = (v, ed) => v.l755 === 1 && v.day3 === 0 && v.letter === 0 && v.order === 0 && v.n === 2 && v.mode === 'world' && (ed === 1 ? v.ed1 === 1 && v.ed2 === 0 : v.ed1 === 0 && v.ed2 === 1);

// 1, 2. the flood count: edition 2 with Mio, edition 1 with no companion
for (const [n, ed, comp] of [[1, 2, 'mio'], [2, 1, null]]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { ed, comp, main: 4, inv: { lf_minutes: 1 } });
  const t = await act(p);
  const v = flood(t), s = await state(p);
  ok(v.many === 1 && v.toya === 1 && v.everyone === 0 && v.only === 0 && v.order && flat(v.runs) === flat([['lf.ch_minutes', true]]) && v.mode === 'world' && s.main === 5 && s.toya === 1 && s.noteEn === NOTE,
    n + ' edition ' + ed + ', ' + (comp || 'no companion') + ': the minutes, the two new lines once each in order, the old never; the exercise; step 5; the Tōya note ' + flat({ v, s: { main: s.main, toya: s.toya, note: s.noteEn === NOTE } }));
  ok(!errors.length, n + ' no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 3. edition 2, with Suzu: the council and the letter; again at once; a save and load; again
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { ed: 2, comp: 'suzu', main: 7, flags: ['lf_bell_rung', 'lf_after_town'] });
  const first = await act(p);
  const s1 = await state(p);
  const v1 = later(await act(p));
  const m = await saveLoad(p);
  const v2 = later(await act(p));
  const s2 = await state(p);
  ok(count(first.said, R.order) === 1 && count(first.said, R.letter) === 1 && s1.ch5 && s1.called && s1.ko === 0 && isLater(v1, 2),
    '3 edition 2, Suzu: the council and the letter; then Tami at once: the new 755 and "set off"; no "Day three", not the mountain line, not the letter ' + flat({ letter: count(first.said, R.letter), s1, v1 }));
  ok(m === 'lf.council' && isLater(v2, 2) && s2.ko === 0, '3 a save and load, then again: the same ' + flat({ m, v2, ko: s2.ko }));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 4. edition 1, with Ren
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { ed: 1, comp: 'ren', main: 7, flags: ['lf_bell_rung', 'lf_after_town'] });
  const first = await act(p);
  const s1 = await state(p);
  const v = later(await act(p));
  ok(count(first.said, R.order) === 1 && count(first.said, R.letter) === 0 && s1.ch5 && !s1.called && isLater(v, 1),
    '4 edition 1, Ren: the council (no letter); then again: the new 755 and the mountain line; not "set off" ' + flat({ s1: { ch5: s1.ch5, called: s1.called }, v }));
  ok(!errors.length, '4 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 5. edition 2, with Nao, after the Cloudroad, and after yn_done
{
  const got = {};
  let errs = [];
  for (const [k, extra] of [['cr_done', ['ko_done', 'cr_yae_told', 'cr_done']], ['yn_done', ['ko_done', 'cr_yae_told', 'cr_done', 'yn_done']]]) {
    const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await at(p, { ed: 2, comp: 'nao', main: 7, mainDone: true, flags: ['lf_bell_rung', 'lf_after_town', 'ch5_done', 'ko_called'].concat(extra) });
    got[k] = later(await act(p));
    errs = errs.concat(errors);
    await p.context().close();
  }
  ok(isLater(got.cr_done, 2) && isLater(got.yn_done, 2), '5 edition 2, Nao, after the Cloudroad and after yn_done: the new 755 and "set off" ' + flat(got));
  ok(!errs.length, '5 no page errors ' + errs.slice(0, 2).join(' | '));
}

await b.close();
srv.close();
console.log(`\nlf_tami_lines: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
