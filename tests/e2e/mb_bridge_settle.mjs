// The Nameless Bridge: freeing its knots is no win, and plays no settle (Agnes 6570338266 and 6570558254; Cloud CC-470,
// CC-471; Local CL-633). In Chromium on the built game, on throwaway journeys (never a real save), at the First Bridge,
// the encounter fought on the battle screen; each response's question answered right first time (the language is not
// what this is about), and the bridge with its last knot left (five already freed):
//  1. the last knot freed by your Unravel (Mio with you): no win; no settle sequence, no "settles" in the log, nothing
//     spoken or said of its settling; the bridge still there to fight, and the procedure's cards on screen; then the
//     three spans and its name: the win, the bridge's settle line said once, the finish played once and never a
//     settle, and mb_bridge_named set;
//  2. the last knot freed by your companion (Nao's "Lend a hand", after a span laid): the same;
//  3. the same as 1 with Reduce motion on;
//  4. the same as 1 with the battle's animations set to Instant;
//  5. the same as 1 with the zero-knot exchange skipped as it plays;
//  no page errors (console errors included).
// (A group's creature freed mid-fight elsewhere still settles: tests/e2e/battle_group.mjs.)
// Usage: node tools/build.mjs && node tests/e2e/mb_bridge_settle.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const SETTLE = /lays its planks back down/;
// the settle beat's own log line ("The Nameless Bridge settles: …"; a span's "The span settles into place" is not it)
const SETTLES = /Bridge settles/;
const SPANS = ['Near bank to the middle', 'Lay it beyond the pillar', 'Ready its name', 'Call it "Musubi Bridge"'];

async function start(p, o) {
  await p.evaluate((o) => {
    const f = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb_under_seen: true, mb_u1_low: true, mb_u2_through: true, mb_u3_down: true, mb_firstbridge_seen: true };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) f['enter:' + m + ':' + ev.scene] = true;
    const s = RB.game.debugStart('mb.firstbridge', 13, 13, { comp: o.comp, flags: f, dir: 'up', edition: 2 });
    s.quests.lf_nao = { stage: 9, done: true, t: 1 }; // Nao's "Lend a hand" (unlocked by her quest)
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduced;
    RB.game.settings.battleAnim = o.anim || 'normal';
    RB.game.applySettings();
    RB.challenge.runStep = async () => ({ ok: true, firstTry: true, mistakes: 0, assisted: false, mode: 'choice' });
    // the bridge with only its last knot left
    const begin = RB.encounter.begin;
    RB.encounter.begin = function (def) { const st = begin.apply(this, arguments); const id = typeof def === 'string' ? def : def && def.id; if (id === 'mb.boss') st.foes[0].knots = 1; return st; };
    window.__seq = []; const run = RB.battleSeq.run; RB.battleSeq.run = function (kind) { window.__seq.push(kind); return run.apply(this, arguments); };
    window.__said = []; const say = RB.ui.dialogue.say; RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
    window.__spoken = []; if (RB.ui.spoken) { const ai = RB.ui.spoken.autoIn; RB.ui.spoken.autoIn = function (el) { window.__spoken.push((el && el.textContent) || ''); return ai.apply(this, arguments); }; }
    window.__res = null; RB.game.startEncounter('mb.boss', {}).then((r) => { window.__res = r || 'done'; });
  }, o);
}
// back to the response cards (dialogue advanced), or the encounter over
async function ready(p) {
  for (let i = 0; i < 900; i++) {
    const s = await p.evaluate(() => ({ res: window.__res, dlg: RB.ui.dialogue.isOpen(), cards: RB.game.mode() === 'combat' && !!document.querySelector('.rcard[data-i]') && !document.querySelector('.ccard') && !document.querySelector('.confirm-scrim') && !RB.battleSeq.busy() }));
    if (s.res) return 'over';
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
    if (s.cards) { await p.waitForTimeout(150); return 'cards'; }
    await p.waitForTimeout(50);
  }
  throw new Error('the battle did not come back to its cards');
}
const cardsShown = (p) => p.evaluate(() => [...document.querySelectorAll('.rcard[data-i]')].map((x) => x.textContent.replace(/\s+/g, ' ')));
// one exchange: a response card by its words; "Do it" where it asks; the companion's action (by its words, or the first)
async function exchange(p, words, comp, o) {
  const ok1 = await p.evaluate((w) => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && x.textContent.replace(/\s+/g, ' ').includes(w)); if (c) c.click(); return !!c; }, words);
  if (!ok1) throw new Error('no card "' + words + '": ' + flat(await cardsShown(p)));
  for (let k = 0; k < 60; k++) {
    const s = await p.evaluate(() => ({ cf: !!document.querySelector('.confirm-scrim'), cc: !!document.querySelector('.ccard'), ph: RB.combat.phase() }));
    if (s.cf) { await p.evaluate(() => { const bt = [...document.querySelectorAll('.confirm-scrim .foot button')].find((x) => /Do it/.test(x.textContent)); if (bt) bt.click(); }); await p.waitForTimeout(120); continue; }
    if (s.cc || s.ph !== 'challenge') break;
    await p.waitForTimeout(50);
  }
  await companionTurn(p, comp ? { match: comp } : {});
  if (o && o.skip) for (let k = 0; k < 80; k++) { const busy = await p.evaluate(() => { if (RB.battleSeq.busy()) { RB.battleSeq.skip(); return true; } return false; }); if (!busy && k > 4) break; await p.waitForTimeout(40); }
}
const marks = (p) => p.evaluate(() => ({ seq: window.__seq.slice(), said: window.__said.slice(), spoken: window.__spoken.slice(), log: (document.querySelector('.clog') || {}).textContent || '', res: window.__res, mode: RB.game.mode(), knots: RB.combat.state() ? RB.combat.state().foes.map((f) => f.knots) : null, named: !!RB.game.s.flags.mb_bridge_named }));

async function scenario(name, o) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, o);
  await ready(p);
  if (o.comp === 'nao') await exchange(p, SPANS[0], 'Lend a hand', o); else await exchange(p, 'Unravel', null, o);
  const at = await ready(p);
  const m0 = await marks(p);
  const shown = at === 'cards' ? await cardsShown(p) : [];
  const nextSpan = o.comp === 'nao' ? SPANS[1] : SPANS[0];
  ok(at === 'cards' && !m0.res && m0.mode === 'combat' && flat(m0.knots) === flat([0]) && !m0.seq.includes('settle') && !m0.seq.includes('finish') && !SETTLES.test(m0.log) &&
    !m0.spoken.some((x) => SETTLE.test(x) || SETTLES.test(x)) && !m0.said.some((x) => SETTLE.test(x)) && shown.some((x) => x.includes(nextSpan)) && !m0.named,
    name + ': the last knot freed: no win, no settle played, logged, spoken or said; the procedure\'s cards on screen ' + flat({ at, res: m0.res, knots: m0.knots, seq: m0.seq, settlesLogged: SETTLES.test(m0.log), next: shown.some((x) => x.includes(nextSpan)) }));
  // then the spans and the name
  for (const w of SPANS.slice(o.comp === 'nao' ? 1 : 0)) { if ((await ready(p)) !== 'cards') break; await exchange(p, w, null, {}); }
  await ready(p);
  await p.waitForFunction(() => window.__res, null, { timeout: 20000 }).catch(() => {});
  const m1 = await marks(p);
  const settleSaid = m1.said.filter((x) => SETTLE.test(x)).length;
  ok(m1.res && /win/.test(flat(m1.res)) && m1.named && settleSaid === 1 && m1.said.some((x) => /The bridge has its name: Musubi Bridge/.test(x)) && m1.seq.filter((k) => k === 'finish').length === 1 && !m1.seq.includes('settle') && !SETTLES.test(m1.log),
    name + ': then the three spans and the name: the win, its settle line said once, the finish once and never a settle, mb_bridge_named set ' + flat({ res: m1.res, named: m1.named, settleSaid, finish: m1.seq.filter((k) => k === 'finish').length, settle: m1.seq.filter((k) => k === 'settle').length }));
  ok(!errors.length, name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await scenario('1 your Unravel (Mio)', { comp: 'mio' });
await scenario('2 Nao\'s "Lend a hand"', { comp: 'nao' });
await scenario('3 Reduce motion', { comp: 'mio', reduced: true });
await scenario('4 Instant animations', { comp: 'mio', anim: 'instant' });
await scenario('5 the exchange skipped', { comp: 'mio', skip: true });

console.log(`\nmb_bridge_settle: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
