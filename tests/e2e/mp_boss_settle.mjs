// The Lord of the Understage: freeing its knots is no win, and plays no settle (Agnes 6580371549; Cloud CC-484; Local
// CL-648). In Chromium on the built game, on throwaway journeys (never a real save), at the Bottom of the Understage,
// the encounter fought on the battle screen; each response's question answered right first time (the language is not
// what this is about), and the Lord with its last knot left (five already freed):
//  1. the last knot freed by your Unravel (Mio with you): no win; no settle sequence, no "settles" in the log, nothing
//     spoken or said of its settling; the Lord still there to fight, and the procedure's cards on screen; then the
//     lift, the revolve west and the roll: the win, the Lord's settle line said once, the finish played once and never
//     a settle, and mp_under_done set;
//  2. the last knot freed by your companion's own cue (Nao's "Haul on the cue", after the lift): the same;
//  3. the same as 1 with Reduce motion on;
//  4. the same as 1 with the battle's animations set to Instant;
//  5. the same as 1 with the zero-knot exchange skipped as it plays;
//  6. through the Lord's own scene (spoken to at the Bottom): the same, and then mp.boss_won plays: mp_under_done set,
//     and the Lord gone from the Bottom when its first line is said;
//  no page errors (console errors included).
// (A group's creature freed mid-fight elsewhere still settles: tests/e2e/battle_group.mjs.)
// Usage: node tools/build.mjs && node tests/e2e/mp_boss_settle.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
// the Lord's settle line (mp.boss_won's own "The ropes go slack; the wheels stop." is not it)
const SETTLE = /the wheels slow, and the names spiral up/;
// the settle beat's own log line ("The Lord of the Understage settles: …")
const SETTLES = /Understage settles/;
const CUES = ['Bring the lead up on the lift', 'Turn it west', 'Call the roll'];

async function start(p, o) {
  await p.evaluate((o) => {
    const f = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mp_sobe_met: true, mp_theatre_seen: true };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) f['enter:' + m + ':' + ev.scene] = true;
    RB.game.debugStart('mp.bottom', 13, 12, { comp: o.comp, flags: f, dir: 'up', edition: 2 });
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduced;
    RB.game.settings.battleAnim = o.anim || 'normal';
    RB.game.applySettings();
    RB.challenge.runStep = async () => ({ ok: true, firstTry: true, mistakes: 0, assisted: false, mode: 'choice' });
    // the Lord with only its last knot left
    const begin = RB.encounter.begin;
    RB.encounter.begin = function (def) { const st = begin.apply(this, arguments); const id = typeof def === 'string' ? def : def && def.id; if (id === 'mp.boss') st.foes[0].knots = 1; return st; };
    window.__seq = []; const run = RB.battleSeq.run; RB.battleSeq.run = function (kind) { window.__seq.push(kind); return run.apply(this, arguments); };
    window.__said = []; window.__won = null;
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) {
      if (l) {
        window.__said.push(l.en || '');
        // mp.boss_won's first line: where things stand as it is said
        if (!window.__won && /The ropes go slack; the wheels stop/.test(l.en || '')) { const W = RB.world.W; window.__won = { map: W.map.id, lord: W.npcs.concat(W.extras || []).some((n) => n.id === 'mp_naraku'), done: !!RB.game.s.flags.mp_under_done }; }
      }
      return say.apply(this, arguments);
    };
    window.__spoken = []; if (RB.ui.spoken) { const ai = RB.ui.spoken.autoIn; RB.ui.spoken.autoIn = function (el) { window.__spoken.push((el && el.textContent) || ''); return ai.apply(this, arguments); }; }
    window.__res = null;
    if (o.scene) { RB.test.place(13, 11, 'up'); RB.world.interact(); } else RB.game.startEncounter('mp.boss', {}).then((r) => { window.__res = r || 'done'; });
  }, o);
}
// back to the response cards (dialogue advanced), or the encounter over
async function ready(p) {
  for (let i = 0; i < 900; i++) {
    const s = await p.evaluate(() => ({ res: window.__res || (RB.game.mode() !== 'combat' && window.__seq.includes('finish')), dlg: RB.ui.dialogue.isOpen(), cards: RB.game.mode() === 'combat' && !!document.querySelector('.rcard[data-i]') && !document.querySelector('.ccard') && !document.querySelector('.confirm-scrim') && !RB.battleSeq.busy() }));
    if (s.res) return 'over';
    if (s.cards) { await p.waitForTimeout(150); return 'cards'; }
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
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
const marks = (p) => p.evaluate(() => ({ seq: window.__seq.slice(), said: window.__said.slice(), spoken: window.__spoken.slice(), log: (document.querySelector('.clog') || {}).textContent || '', res: window.__res, mode: RB.game.mode(), knots: RB.combat.state() ? RB.combat.state().foes.map((f) => f.knots) : null, done: !!RB.game.s.flags.mp_under_done, won: window.__won }));

async function scenario(name, o) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, o);
  await ready(p);
  if (o.comp === 'nao') await exchange(p, CUES[0], 'Haul on the cue', o); else await exchange(p, 'Unravel', null, o);
  const at = await ready(p);
  const m0 = await marks(p);
  const shown = at === 'cards' ? await cardsShown(p) : [];
  const nextCue = o.comp === 'nao' ? CUES[1] : CUES[0];
  ok(at === 'cards' && !m0.res && m0.mode === 'combat' && flat(m0.knots) === flat([0]) && !m0.seq.includes('settle') && !m0.seq.includes('finish') && !SETTLES.test(m0.log) &&
    !m0.spoken.some((x) => SETTLE.test(x) || SETTLES.test(x)) && !m0.said.some((x) => SETTLE.test(x)) && shown.some((x) => x.includes(nextCue)) && !m0.done,
    name + ': the last knot freed: no win, no settle played, logged, spoken or said; the procedure\'s cards on screen ' + flat({ at, res: m0.res, knots: m0.knots, seq: m0.seq, settlesLogged: SETTLES.test(m0.log), next: shown.some((x) => x.includes(nextCue)) }));
  // then the cues
  for (const w of CUES.slice(o.comp === 'nao' ? 1 : 0)) { if ((await ready(p)) !== 'cards') break; await exchange(p, w, null, {}); }
  await ready(p);
  if (o.scene) await p.waitForFunction(() => window.__won, null, { timeout: 20000 }).catch(() => {});
  else await p.waitForFunction(() => window.__res, null, { timeout: 20000 }).catch(() => {});
  const m1 = await marks(p);
  const settleSaid = m1.said.filter((x) => SETTLE.test(x)).length;
  ok((o.scene || (m1.res && /win/.test(flat(m1.res)))) && m1.done && settleSaid === 1 && m1.said.some((x) => /Every name back on the stage/.test(x)) && m1.seq.filter((k) => k === 'finish').length === 1 && !m1.seq.includes('settle') && !SETTLES.test(m1.log),
    name + ': then the lift, the revolve west and the roll: the win, its settle line said once, the finish once and never a settle, mp_under_done set ' + flat({ res: m1.res, done: m1.done, settleSaid, finish: m1.seq.filter((k) => k === 'finish').length, settle: m1.seq.filter((k) => k === 'settle').length }));
  if (o.scene) ok(!!m1.won && m1.won.map === 'mp.bottom' && m1.won.done && !m1.won.lord, name + ': mp.boss_won plays: mp_under_done set, and the Lord gone from the Bottom ' + flat(m1.won));
  ok(!errors.length, name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await scenario('1 your Unravel (Mio)', { comp: 'mio' });
await scenario('2 Nao\'s "Haul on the cue"', { comp: 'nao' });
await scenario('3 Reduce motion', { comp: 'mio', reduced: true });
await scenario('4 Instant animations', { comp: 'mio', anim: 'instant' });
await scenario('5 the exchange skipped', { comp: 'mio', skip: true });
await scenario('6 through the Lord\'s own scene', { comp: 'mio', scene: true });

console.log(`\nmp_boss_settle: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
