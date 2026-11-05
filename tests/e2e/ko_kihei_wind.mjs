// Kihei's leaf on the wind, in Chromium (editorial row 3: Cloud CC-523 note 3 and CC-525, option (a); the text agreed
// in Agnes 6640417567 and Local CL-690). On the built game, on throwaway journeys (never a real save): Kihei talked to
// through the world's own interact at the tide pools; each choice picked as listed; a save made and loaded through the
// game's own save and load:
//  1. with Mio, a save and load, then Kihei: the menu offers "Send it on the wind, towards the Wind Stone."; the
//     preview, "Think again", the wind again, "Send it.": the new ending once, not the old; his last word; the quest
//     done; you are still at the tide pools, where you stood; Kihei gone; the world's controls back;
//  2. with Nao, the Mitsu end: as before (her reading, his last word, gone);
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/ko_kihei_wind.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'ch5_done', 'ko_ch9', 'ko_otoha_met', 'ko_kihei_met'];

async function at(p, comp) {
  await p.evaluate(async ({ DONE, comp }) => {
    const f = {};
    for (const k of DONE) f[k] = true;
    const s = RB.game.debugStart('ko.tidepools', 12, 19, { comp, dir: 'up', edition: 2, flags: f });
    s.quests.ko_main = { stage: 4, done: false, t: 1 };
    s.quests.ko_kihei = { stage: 2, done: false, t: 1 };
    s.inv = Object.assign(s.inv || {}, { ko_kihei_letter: 1 });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    window.__picks = [];
    window.__offered = [];
    RB.test.enable({ choose: (o) => { window.__offered.push(o.map((x) => x.en)); return window.__picks.length ? window.__picks.shift() : 0; } });
    await new Promise((r) => setTimeout(r, 900));
    RB.world.refreshActors();
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push([l.who || 'narr', l.en || '']); return say.apply(this, arguments); };
  }, { DONE, comp });
}
const act = (p, who, picks) => p.evaluate(async ({ who, picks }) => {
  window.__said = []; window.__offered = []; window.__picks = picks.slice();
  await RB.test.idle();
  await RB.test.talk(who);
  const pc0 = [RB.world.W.player.x, RB.world.W.player.y];
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  const pc = RB.world.W.player;
  return { said: window.__said.slice(), offered: window.__offered.slice(), mode: RB.game.mode(), map: RB.world.W.map.id, pc0, pc: [pc.x, pc.y], kihei: RB.world.W.npcs.some((n) => n.id === who) };
}, { who, picks });
const state = (p) => p.evaluate(() => { const s = RB.game.s; return { quest: s.quests.ko_kihei.done ? 'done' : s.quests.ko_kihei.stage, wind: !!s.flags.ko_kihei_wind, mitsu: !!s.flags.ko_kihei_mitsu, letter: (s.inv || {}).ko_kihei_letter || 0 }; });
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
const count = (said, re) => said.filter(([, en]) => re.test(en)).length;
const CHOICE = 'Send it on the wind, towards the Wind Stone.';
const B = { end: /^At the tide pools, you give the leaf to the wind\. It flies off towards the village's Wind Stone\. Kihei takes off his cap and watches it go\.$/, old: /^You walk up to the village's Wind Stone/,
  late: /^…I'm late, Hatsu\.$/, gone: /^When the leaf was out of sight, Kihei was gone too\.$/, please: /^…Please\. If it's read in that house, that's enough\.$/, footprints: /^When the wave drew back, Kihei's footprints were gone\.$/ };

// 1. with Mio: a save and load; Think again once; then the wind
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'mio');
  const m = await saveLoad(p);
  const t = await act(p, 'ko_kihei', [1, 1, 1, 0]);
  const s = await state(p);
  ok(m === 'ko.tidepools' && t.offered.length === 4 && t.offered[0][1] === CHOICE && t.offered[2][1] === CHOICE && count(t.said, B.end) === 1 && count(t.said, B.old) === 0 && count(t.said, B.late) === 1 && count(t.said, B.gone) === 1 &&
    s.quest === 'done' && s.wind && s.letter === 0 && t.map === 'ko.tidepools' && flat(t.pc) === flat(t.pc0) && !t.kihei && t.mode === 'world',
    '1 a save and load; the new choice, Think again, then the wind: the new ending once, his last word, gone; the quest done; still where you stood at the tide pools; the controls back ' +
    flat({ m, offered: t.offered.map((o) => o[1]), s, map: t.map, pc: [t.pc0, t.pc], kihei: t.kihei, mode: t.mode }));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 2. with Nao: the Mitsu end, as before
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'nao');
  const t = await act(p, 'ko_kihei', [0, 0]);
  const s = await state(p);
  ok(count(t.said, B.please) === 1 && count(t.said, B.footprints) === 1 && count(t.said, B.end) === 0 && s.quest === 'done' && s.mitsu && !s.wind && s.letter === 0 && !t.kihei,
    '2 the Mitsu end, as before: his last word, his footprints gone; the quest done ' + flat({ s, kihei: t.kihei }));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\nko_kihei_wind: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
