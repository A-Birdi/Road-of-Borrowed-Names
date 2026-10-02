// Rules and presentation invariance (battle addendum §23.1) on the built index.html in Chromium.
// The same scripted encounter — the Mill's Flour Moth (alone, or with one or two more of its kind),
// three exchanges of Unravel answered right, your companion's first offered support each time — is
// played under every combination of the presentation settings, and what the rules hold afterwards
// must be identical within each (companion, creatures) fixture:
//   companion: none, Nao, Mio, Ren, Suzu  ×  creatures: 1, 2, 3  ×  Battle animations: Normal, Fast,
//   Instant  ×  motion: full, reduced  ×  controls: Adaptive, Keep visible  ×  Text speed: Normal,
//   Fast, Instant  = 540 configurations; plus a pet variation (none, cat, each shown or hidden in
//   battle) for one fixture.
// Compared: resolve (you, your companion), every creature's knots, intent, heat / shroud / charge,
// Harmony, wards, support uses, the round, the target, the outcome, the rewards (battles won,
// words), the learning record by its counts (answers recorded, right and wrong, by mode, assisted,
// boxes, the learning clock; which item a task asks about is the learning layer's own choice and
// is listed, not compared), the next decision's phase and its response cards. The rules use no random stream (src/engine/95_combat.js: intents follow each
// creature's pattern, a "random" aim is a function of the state), so any difference is a
// presentation path changing an outcome.
// Synthetic campaigns in fresh profiles; the presentation clock runs ×4 (RB.battleSeq.setTimeScale,
// a virtual clock — cue order and intervals are unchanged; real-speed runs are battle_presentation.mjs).
// Usage: node tests/e2e/battle_invariance.mjs [--quick] [--out tests/e2e/out/battle_invariance.json]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page } from './lib.mjs';

const args = process.argv.slice(2);
const quick = args.includes('--quick');
const outAt = args.indexOf('--out');
const OUT = outAt >= 0 ? args[outAt + 1] : 'tests/e2e/out/battle_invariance.json';
const { srv, url } = await serve();
const b = await launch();

const COMPS = [null, 'nao', 'mio', 'ren', 'suzu'];
const FOES = [1, 2, 3];
const ANIM = ['normal', 'fast', 'instant'];
const MOTION = [false, true];
const CONTROLS = ['adaptive', 'keep'];
const TEXT = ['normal', 'fast', 'instant'];
const configs = [];
for (const comp of quick ? [null, 'mio'] : COMPS) for (const foes of quick ? [1, 3] : FOES) for (const anim of ANIM) for (const reduce of MOTION) for (const controls of CONTROLS) for (const text of quick ? ['normal'] : TEXT) configs.push({ comp, foes, anim, reduce, controls, text });
const pets = [{ pet: null }, { pet: 'cat', petBattle: true }, { pet: 'cat', petBattle: false }, { pet: 'dog', petBattle: true }];
for (const pt of pets) configs.push({ comp: 'mio', foes: 2, anim: 'normal', reduce: false, controls: 'adaptive', text: 'normal', ...pt, petCase: true });

// one encounter, played to the end of three exchanges (or its end), in an open page
async function play(p, c) {
  await p.evaluate((o) => {
    const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: o.comp, flags: { rw_gears: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.difficulty = o.foes > 2 ? 'hard' : 'normal';
    s.words = ['mizu', 'iyasu', 'mamoru'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    for (const w of s.words) s.tips['word:' + w] = 1;
    if (o.pet) { RB.pets.meet(s, o.pet); RB.pets.select(s, o.pet); }
    Object.assign(RB.game.settings, { input: 'choice', battleAnim: o.anim, reducedMotion: o.reduce, battleControls: o.controls, textSpeed: o.text, petBattle: o.petBattle !== false });
    RB.game.applySettings();
    RB.battleSeq.setTimeScale(4);
    const run = RB.challenge.runStep;
    if (!RB.challenge.__inv) { RB.challenge.__inv = true; RB.challenge.runStep = (step, op) => { window.__lastStep = step; return run(step, op); }; }
    const place = RB.content.maps['rw.mill1'].foes.find((f) => f.id === 'm1a');
    window.__result = null; window.__phases = [];
    RB.game.startBattle(place.enemy, { place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'inv', group: o.foes > 1 ? Array(o.foes - 1).fill(place.enemy) : undefined }).then((r) => { window.__result = r || 'done'; });
  }, c);
  const cards = async () => {
    for (let i = 0; i < 1500; i++) {
      const s = await p.evaluate(() => ({ r: window.__result, dlg: RB.ui.dialogue.isOpen(), ok: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() && RB.combat.phase() === 'choose' }));
      if (s.ok || s.r) return s;
      if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
      await p.waitForTimeout(15);
    }
    throw new Error('no decision came');
  };
  const steps = [];
  for (let ex = 0; ex < 3; ex++) {
    const s = await cards();
    if (s.r) break;
    steps.push(await p.evaluate(() => ({ phase: RB.combat.phase(), cur: RB.combat.state().cur, cards: [...document.querySelectorAll('.rcard[data-i]')].map((x) => x.getAttribute('data-cid') + (x.disabled ? '-' : '')).join(',') })));
    await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && /unravel/i.test(x.textContent)); c.click(); });
    await p.waitForSelector('.chal .mc .btn', { timeout: 10000 });
    await p.evaluate(() => {
      const st = window.__lastStep;
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => (o.text != null ? RB.tasks.plain(o.text) : o.en || ''));
      const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
      const bs = [...document.querySelectorAll('.chal .mc .btn')];
      bs[bs.findIndex((x) => right.some((r) => txt(x) === r.replace(/\s+/g, '') || (x.querySelector('.enline') && right.includes(x.querySelector('.enline').textContent.trim()))))].click();
    });
    await p.waitForSelector('.fbwrap .fb-go', { timeout: 10000 });
    await p.evaluate(() => document.querySelector('.fbwrap .fb-go').click());
    if (c.comp) {
      await p.waitForSelector('.ccard[data-a]', { timeout: 8000 });
      await p.waitForTimeout(280); // the companion menu ignores presses in its first 250 ms
      await p.evaluate(() => [...document.querySelectorAll('.ccard[data-a]')].find((x) => !x.disabled).click());
    }
  }
  await cards();
  return p.evaluate((steps) => {
    const s = RB.game.s, st = RB.combat.state();
    const mask = (k, v) => (typeof v === 'number' && v > 1e12 ? 'T' : v);
    const rules = st ? JSON.stringify({ pc: st.pc, comp: st.comp, harmony: st.harmony, round: st.round, cur: st.cur, ward: st.ward, compUses: st.compUses, silenced: st.silenced, foes: st.foes.map((f) => ({ knots: f.knots, kind: f.intent && f.intent.kind, target: f.intent && f.intent.target, heat: f.heat, shroud: f.shroud, charged: f.charged, settled: !!f.settled, pi: f.pi })) }) : null;
    // the learning record by its counts: which item a task asks about is the learning layer's own
    // choice (its own randomness, not the rules'), so the item ids are kept for information only
    const items = Object.values(s.learn.items || {});
    const sum = (k) => items.reduce((m, r) => m + (r[k] || 0), 0);
    const learn = JSON.stringify({ stats: s.learn.stats, clock: s.learn.clock || 0, records: items.length, seen: sum('seen'), ok: sum('ok'), bad: sum('bad'), streak: sum('streak'), modes: ['recog', 'recall', 'hand', 'assisted'].map((m) => items.reduce((n, r) => n + ((r.modes && r.modes[m]) || 0), 0)), boxes: items.map((r) => r.box).sort().join('') });
    void mask;
    return { result: window.__result, rules, phase: RB.combat.phase(), steps, won: s.vars.battlesWon || 0, words: s.words.slice(), learn, itemIds: Object.keys(s.learn.items || {}).sort(), resolve: s.resolve };
  }, steps);
}

const results = [];
let pg = null;
const t0 = Date.now();
for (let k = 0; k < configs.length; k++) {
  const c = configs[k];
  if (!pg || k % 30 === 0) { if (pg) await pg.ctx.close(); pg = await page(b, url, { viewport: { width: 1280, height: 800 } }); }
  try {
    const r = await play(pg.p, c);
    // leave the encounter if it is still on (Step back), so the next configuration starts in the world
    if (!r.result) {
      await pg.p.evaluate(() => { const f = document.querySelector('.cb-dock [data-flee]'); if (f) f.click(); });
      await pg.p.waitForSelector('.modal button, .confirm button, .dlg-choice button, [data-confirm] button', { timeout: 3000 }).catch(() => null);
      await pg.p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter((x) => /^\s*Step back\s*$/.test(x.textContent)); if (bs.length) bs[bs.length - 1].click(); });
      for (let i = 0; i < 200 && !(await pg.p.evaluate(() => !!window.__result)); i++) await pg.p.waitForTimeout(20);
    }
    if (!(await pg.p.evaluate(() => !!window.__result))) { await pg.ctx.close(); pg = null; }
    results.push({ ...c, ...r, errors: pg ? pg.errors.splice(0) : [] });
  } catch (e) {
    results.push({ ...c, error: String((e && e.message) || e).slice(0, 300) });
    if (pg) { await pg.ctx.close(); pg = null; }
  }
  if ((k + 1) % 20 === 0) console.log(`${k + 1}/${configs.length} (${Math.round((Date.now() - t0) / 1000)} s)`);
}
if (pg) await pg.ctx.close();

// within each fixture every presentation variant must agree
const key = (r) => (r.petCase ? 'pet ' : '') + (r.comp || 'alone') + ' ×' + r.foes;
const groups = new Map();
for (const r of results) { const k = key(r); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
let bad = 0;
const summary = [];
for (const [k, rs] of groups) {
  const errs = rs.filter((r) => r.error || (r.errors && r.errors.length));
  const sig = (r) => JSON.stringify([r.result, r.rules, r.phase, r.steps, r.won, r.words, r.learn]);
  const sigs = new Map();
  for (const r of rs.filter((x) => !x.error)) { const s = sig(r); sigs.set(s, (sigs.get(s) || []).concat([`${r.anim}/${r.reduce ? 'reduced' : 'full'}/${r.controls}/text-${r.text}${r.pet ? '/pet-' + r.pet + (r.petBattle ? '-shown' : '-hidden') : ''}`])); }
  const ok = sigs.size === 1 && !errs.length;
  if (!ok) bad++;
  summary.push({ fixture: k, configs: rs.length, distinct: sigs.size, errors: errs.map((r) => r.error || r.errors.join('; ')).slice(0, 3), outcome: rs[0].result || 'three exchanges', variants: sigs.size > 1 ? [...sigs.values()].map((v) => v.slice(0, 4)) : undefined });
  console.log((ok ? 'same ' : 'DIFFERENT ') + k + ': ' + rs.length + ' configurations, ' + sigs.size + ' outcome(s)' + (errs.length ? ', ' + errs.length + ' error(s): ' + (errs[0].error || errs[0].errors[0]) : ''));
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), browser: 'Chromium (Playwright, headless)', clock: 'presentation ×4 (setTimeScale)', configurations: results.length, excluded: 'none: every combination of the listed values is valid for this fixture (three creatures use Demanding difficulty, which allows them; one and two use Standard)', summary, results }, null, 1));
console.log(`\n${results.length} configurations in ${Math.round((Date.now() - t0) / 1000)} s; ${groups.size} fixtures; ${bad ? bad + ' fixture(s) differ or failed' : 'every fixture identical across its presentation settings'}`);
await b.close();
srv.close();
process.exit(bad ? 1 : 0);
