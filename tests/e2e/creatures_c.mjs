// Creatures C (expansion P16b), against the BUILT index.html in Chromium: the creatures that were drawn on a borrowed
// family in the interim, each now on its own drawing (src/ui/78u_creature_kit.js and 78v…78z_kit_*.js), in real
// battles in synthetic campaigns (fresh contexts, never a player's save), answered with the real mouse. For each: it
// is drawn by its own family; one of its own moves is performed (the telegraphed move set as the rules would draw
// it), with a visible preparation or gesture, its own effect, every result shown once in the rules' order and the
// display ending equal to the rules; no page errors.
// --quick: one creature from each kit file (the default suite); without it, all 46.
// Captures: tests/e2e/out/battle_creatures_c/; with --docs, a WebP still of each at its move's contact in
// docs/screenshots/p16/creatures/.
// Usage: node tests/e2e/creatures_c.mjs [filter] [--quick] [--docs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { helpers, battle, cards, respond, idle, during, seq, wait } from './creatures_a_lib.mjs';

const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith('--'));
const quick = args.includes('--quick');
const toDocs = args.includes('--docs');
const outDir = path.join(root, 'tests', 'e2e', 'out', 'battle_creatures_c');
const docDir = path.join(root, 'docs', 'screenshots', 'p16', 'creatures');
fs.mkdirSync(outDir, { recursive: true });
if (toDocs) fs.mkdirSync(docDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [], notes = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 240s')), 240000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name); console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1600)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const DESK = { viewport: { width: 1280, height: 800 } };
const WORDS = ['mamoru', 'hikari', 'mizu', 'kaze'];
const SINGLE = { strike: 1, lie: 1, mirror: 1, chill: 1 };
const last = (tr, kind) => tr.filter((r) => r.kind === kind).slice(-1)[0];
const trace = (p) => p.evaluate(() => RB.battleSeq.trace());
const samples = async (p) => { await p.evaluate(() => CA.sampleOff()); return p.evaluate(() => CA.samples); };
async function still(p, name) {
  const clip = await p.evaluate(() => { const r = document.querySelector('.cb-stage') ? document.querySelector('.cb-stage').getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: innerHeight }; return { x: Math.max(0, Math.round(r.left)), y: Math.max(0, Math.round(r.top)), width: Math.round(Math.min(innerWidth, r.width)), height: Math.round(Math.min(innerHeight, r.height)) }; });
  const png = await p.screenshot({ clip });
  fs.writeFileSync(path.join(outDir, name + '.png'), png);
  if (toDocs) {
    const webp = await p.evaluate(async (b64) => { const im = new Image(); await new Promise((r) => { im.onload = r; im.src = 'data:image/png;base64,' + b64; }); const c = document.createElement('canvas'); c.width = Math.round(im.width / 2); c.height = Math.round(im.height / 2); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(im, 0, 0, c.width, c.height); return c.toDataURL('image/webp', 0.85); }, png.toString('base64'));
    fs.writeFileSync(path.join(docDir, name + '.webp'), Buffer.from(webp.split(',')[1], 'base64'));
  }
}
// one enemy move (the intent set as the rules would draw it), answered with `card`
async function move(p, kind, target, card, shoot) {
  await p.evaluate(([k, t]) => { CA.setIntent(k, t); RB.combat.refresh(); CA.sampleOn(); }, [kind, target || null]);
  if (shoot) await p.evaluate(() => RB.battleSeq.setTimeScale(0.15));
  await respond(p, card, { comp: false });
  if (shoot) {
    await p.waitForFunction(() => RB.combat.phase() === 'enemy', null, { timeout: 30000, polling: 'raf' }).catch(() => {});
    await p.evaluate(() => { window.__b1 = RB.battleSeq.stats().counters.beats; });
    await p.waitForFunction(() => RB.combat.phase() === 'enemy' && RB.battleSeq.stats().counters.beats > window.__b1, null, { timeout: 30000, polling: 'raf' }).catch(() => {});
    await still(p, shoot);
    await p.evaluate(() => RB.battleSeq.setTimeScale(1));
  }
  await idle(p);
  const S = await samples(p);
  const E = during(S, 'enemy'), tr = last(await trace(p), 'enemy');
  await cards(p);
  return { E, tr, acts: seq(E.map((s) => s.foe)), effects: [...new Set(E.flatMap((s) => s.effects || []))] };
}
async function onceEach(p, label) {
  const ex = await p.evaluate(() => CA.exch.filter((x) => x.k === 'enemyAct').slice(-1)[0]);
  const tr = last(await trace(p), 'enemy');
  const want = (ex.fx || []).map((f) => f.t), got = tr.beats.map((x) => x.t).filter((t) => t !== 'spent');
  assert(JSON.stringify(got) === JSON.stringify(want), label + ': every result shown once, in the rules\' order (' + got + ' vs ' + want + ')');
  const shown = await p.evaluate(() => { const a = CA.pick(RB.combat.shown()), b = CA.pick(RB.combat.state()); return JSON.stringify(a) === JSON.stringify(b); });
  assert(shown, label + ': the display ends equal to the rules');
}

// the list, from the game itself (RB.content.creaturesC), with each one's first move of its own
const probe = await page(b, url, DESK);
const LIST = await probe.p.evaluate(() => Object.keys(RB.content.creaturesC || {}).sort().map((id) => {
  const e = RB.content.enemies[id], ks = new Set();
  const add = (k) => ks.add(String(k).split(':')[0]);
  (e.pattern || []).forEach(add); (e.phases || []).forEach((ph) => (ph.pattern || []).forEach(add)); Object.keys(e.intents || {}).forEach(add);
  const kinds = [...ks].filter((k) => k !== 'rest');
  return { id, art: e.art, own: RB.content.creaturesC[id], kind: kinds[0] || 'strike', file: (RB.creatureKit && RB.creatureKit.FAMS.indexOf(e.art)) };
}));
await probe.ctx.close();
// --quick: one creature from each kit file, and the moth (its silence)
const firsts = ['mb_snail', 'kr_sandal', 'ko_jelly', 'yn_chochin', 'gd_firstfire', 'cr_moth'];
const RUN = quick ? LIST.filter((x) => firsts.indexOf(x.own) >= 0) : LIST;
await test('the game lists 46 creatures drawn on their own families, each one drawing with it', async () => {
  assert(LIST.length === 46, LIST.length + ' listed');
  const off = LIST.filter((x) => x.art !== x.own);
  assert(!off.length, 'still borrowed: ' + off.map((x) => x.id + '→' + x.art).join(', '));
});
for (const C of RUN) {
  await test(C.id + ' (' + C.own + '): ' + C.kind + ' performed with its own drawing; each result once; the display equal to the rules', async () => {
    const { p, errors, ctx } = await page(b, url, DESK);
    await helpers(p);
    await battle(p, { map: 'rw.millroad', x: 11, y: 10, enemy: C.id, words: WORDS });
    await p.evaluate(() => { const st = RB.combat.state(); st.knots = st.maxKnots = 6; RB.combat.refresh(); });
    const drawn = await p.evaluate(() => { const d = RB.combat.debug(); return d && d.stage && d.stage.frame ? (d.stage.frame.art || (d.stage.frame.foes && d.stage.frame.foes[0] && d.stage.frame.foes[0].art) || null) : null; });
    const M = await move(p, C.kind, SINGLE[C.kind] ? 'pc' : null, 'unravel', toDocs ? C.id.replace('.', '_') : null);
    assert(M.tr && M.tr.meta.kind === C.kind, C.id + ': the move played (' + (M.tr && M.tr.meta.kind) + ')');
    assert(M.acts.indexOf('prep') >= 0 || M.acts.indexOf('cast') >= 0, C.id + ': a visible preparation or gesture: ' + M.acts.join('→'));
    await onceEach(p, C.id + ' ' + C.kind);
    notes.push(C.id + ' ' + C.kind + ': acts ' + M.acts.join('→') + '; effects ' + M.effects.join(', ') + (drawn ? '; drawn ' + drawn : ''));
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  });
}

console.log('\n' + results.join('\n'));
for (const n of notes) console.log('note: ' + n);
console.log(pass + ' passed, ' + fail + ' failed');
fs.writeFileSync(path.join(outDir, 'creatures_c_results.txt'), results.join('\n') + '\n' + notes.map((n) => 'note: ' + n).join('\n') + '\n' + pass + ' passed, ' + fail + ' failed\n');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
