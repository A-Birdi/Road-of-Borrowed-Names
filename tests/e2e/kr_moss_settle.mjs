// The Moss Lantern: freeing its knots is no win, and plays no settle (Cloud CC-486; Local CL-648, CL-650; Agnes
// 6581849812). In Chromium
// on the built game, on throwaway journeys (never a real save), on the Cedar Steps, the Moss Lantern spoken to and
// fought on the battle screen; each response's question answered right first time (the language is not what this is
// about), and the Moss with its last knot left (two already freed):
//  1. the last knot freed by your Unravel (Mio with you): no win; no settle sequence, no "settles" in the log, nothing
//     spoken or said of its settling; the Moss still there to face, and "Call it by its name" on screen; then its
//     name: the win, its settle line said once, the finish played once and never a settle, kr_moss1_named set, and the
//     creature's own defeat stored as for any creature (foe:kr.steps:moss1); on the steps afterwards the Moss gone and
//     the lit lantern standing in its place; and after a save and load through the game's own save, the same (the
//     Fern Light there, no Moss);
//  2. the last knot freed by your companion (Nao's "Lend a hand", while you wait): the same (without the reload);
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/kr_moss_settle.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const SETTLE = /Named, the lantern settles back onto its base/;
// the settle beat's own log line ("The Moss Lantern settles: …")
const SETTLES = /Lantern settles/;
const NAME = 'Call it by its name';

async function start(p, o) {
  await p.evaluate((o) => {
    const f = { departed: true, ch1_done: true, ch2_done: true };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) f['enter:' + m + ':' + ev.scene] = true;
    const s = RB.game.debugStart('kr.steps', 14, 10, { comp: o.comp, flags: f, dir: 'up', edition: 2 });
    s.quests.lf_nao = { stage: 9, done: true, t: 1 }; // Nao's "Lend a hand" (unlocked by her quest)
    RB.game.settings.textSpeed = 'instant';
    RB.game.applySettings();
    RB.challenge.runStep = async () => ({ ok: true, firstTry: true, mistakes: 0, assisted: false, mode: 'choice' });
    // the Moss with only its last knot left
    const begin = RB.encounter.begin;
    RB.encounter.begin = function (def) { const st = begin.apply(this, arguments); const id = typeof def === 'string' ? def : def && def.id; if (id === 'kr.moss_steps') st.foes[0].knots = 1; return st; };
    window.__seq = []; const run = RB.battleSeq.run; RB.battleSeq.run = function (kind) { window.__seq.push(kind); return run.apply(this, arguments); };
    window.__said = []; const say = RB.ui.dialogue.say; RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
    window.__spoken = []; if (RB.ui.spoken) { const ai = RB.ui.spoken.autoIn; RB.ui.spoken.autoIn = function (el) { window.__spoken.push((el && el.textContent) || ''); return ai.apply(this, arguments); }; }
    setTimeout(() => RB.world.interact(), 400);
  }, o);
}
// back to the response cards (dialogue advanced), or the battle over and the steps back
async function ready(p) {
  for (let i = 0; i < 900; i++) {
    const s = await p.evaluate(() => ({ over: RB.game.mode() === 'world' && window.__seq.includes('finish'), dlg: RB.ui.dialogue.isOpen(), cards: RB.game.mode() === 'combat' && !!document.querySelector('.rcard[data-i]') && !document.querySelector('.ccard') && !document.querySelector('.confirm-scrim') && !RB.battleSeq.busy() }));
    if (s.over) return 'over';
    if (s.cards) { await p.waitForTimeout(150); return 'cards'; }
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
    await p.waitForTimeout(50);
  }
  throw new Error('the battle did not come back to its cards');
}
const cardsShown = (p) => p.evaluate(() => [...document.querySelectorAll('.rcard[data-i]')].map((x) => x.textContent.replace(/\s+/g, ' ')));
// one exchange: a response card by its words; "Do it" (or its own answer) where it asks; the companion's action
async function exchange(p, words, comp) {
  const ok1 = await p.evaluate((w) => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && x.textContent.replace(/\s+/g, ' ').includes(w)); if (c) c.click(); return !!c; }, words);
  if (!ok1) throw new Error('no card "' + words + '": ' + flat(await cardsShown(p)));
  for (let k = 0; k < 60; k++) {
    const s = await p.evaluate(() => ({ cf: !!document.querySelector('.confirm-scrim'), cc: !!document.querySelector('.ccard'), ph: RB.combat.phase() }));
    if (s.cf) { await p.evaluate(() => { const bs = [...document.querySelectorAll('.confirm-scrim .foot button')]; const bt = bs.find((x) => /Do it|^Wait$/.test(x.textContent.trim())); if (bt) bt.click(); }); await p.waitForTimeout(120); continue; }
    if (s.cc || s.ph !== 'challenge') break;
    await p.waitForTimeout(50);
  }
  await companionTurn(p, comp ? { match: comp } : {});
}
const marks = (p) => p.evaluate(() => {
  const W = RB.world.W, st = RB.game.s;
  const lit = (W.map.props || []).some((q) => q.p === 'kr_toro' && q.x === 14 && q.y === 9 && (!q.if || RB.state.test(st, q.if)));
  return { seq: window.__seq.slice(), said: window.__said.slice(), spoken: window.__spoken.slice(), log: (document.querySelector('.clog') || {}).textContent || '', mode: RB.game.mode(), knots: RB.combat.state() ? RB.combat.state().foes.map((f) => f.knots) : null, named: !!st.flags.kr_moss1_named, beaten: !!st.flags['foe:kr.steps:moss1'], moss: (W.foes || []).some((f) => f.def && f.def.id === 'moss1'), lit };
});

async function scenario(name, o) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, o);
  await ready(p);
  if (o.comp === 'nao') await exchange(p, 'Wait', 'Lend a hand'); else await exchange(p, 'Unravel', null);
  const at = await ready(p);
  const m0 = await marks(p);
  const shown = at === 'cards' ? await cardsShown(p) : [];
  ok(at === 'cards' && m0.mode === 'combat' && flat(m0.knots) === flat([0]) && !m0.seq.includes('settle') && !m0.seq.includes('finish') && !SETTLES.test(m0.log) &&
    !m0.spoken.some((x) => SETTLE.test(x) || SETTLES.test(x)) && !m0.said.some((x) => SETTLE.test(x)) && shown.some((x) => x.includes(NAME)) && !m0.named,
    name + ': the last knot freed: no win, no settle played, logged, spoken or said; "Call it by its name" on screen ' + flat({ at, knots: m0.knots, seq: m0.seq, settlesLogged: SETTLES.test(m0.log), name: shown.some((x) => x.includes(NAME)) }));
  // then its name
  if (at === 'cards') await exchange(p, NAME, null);
  await ready(p);
  await p.waitForTimeout(800);
  const m1 = await marks(p);
  const settleSaid = m1.said.filter((x) => SETTLE.test(x)).length;
  ok(m1.mode === 'world' && m1.named && m1.beaten && settleSaid === 1 && m1.seq.filter((k) => k === 'finish').length === 1 && !m1.seq.includes('settle') && !m1.moss && m1.lit,
    name + ': then its name: the win, its settle line said once, the finish once and never a settle, kr_moss1_named and its defeat stored; the Moss gone and the lit lantern there ' + flat({ mode: m1.mode, named: m1.named, beaten: m1.beaten, settleSaid, finish: m1.seq.filter((k) => k === 'finish').length, settle: m1.seq.filter((k) => k === 'settle').length, moss: m1.moss, lit: m1.lit }));
  if (o.reload) {
    await p.evaluate(async () => { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); });
    await p.waitForTimeout(900);
    const m2 = await marks(p);
    ok(m2.mode === 'world' && m2.named && m2.beaten && !m2.moss && m2.lit,
      name + ': after a save and load: the Fern Light there and no Moss, the flag and the defeat kept ' + flat({ mode: m2.mode, named: m2.named, beaten: m2.beaten, moss: m2.moss, lit: m2.lit }));
  }
  ok(!errors.length, name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await scenario('1 your Unravel (Mio)', { comp: 'mio', reload: true });
await scenario('2 Nao\'s "Lend a hand"', { comp: 'nao' });

console.log(`\nkr_moss_settle: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
