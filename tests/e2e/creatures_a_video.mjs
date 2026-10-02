// Creatures A: a real-time, unhurried Normal-speed recording of the Flour Moth proof (battle
// addendum §18.5), with Playwright's recorder — on the mill road (its exterior placement), solo:
// a quiet idle; an unblocked swoop Strike; a fully warded Strike (protect, the seal at the
// contact); a softened hit (one ward point); Shroud applied, persisting through a quiet
// moment, then cleared by light. Responses are chosen and answered with the real mouse. The
// sequencer's timing trace for each move is written beside the video.
// Usage: node tests/e2e/creatures_a_video.mjs [--docs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, root } from './lib.mjs';
import { helpers, cards, idle } from './creatures_a_lib.mjs';

const toDocs = process.argv.includes('--docs');
const outDir = path.join(root, 'tests', 'e2e', 'out', 'battle_creatures_a');
const raw = path.join(outDir, 'raw');
fs.mkdirSync(raw, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: raw, size: { width: 960, height: 540 } } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(url);
await p.waitForFunction(() => window.__RB_READY__ === true);
await helpers(p);
const pause = (ms) => p.waitForTimeout(ms);
const center = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel);
async function clickAt(pt, quick) { await p.mouse.move(pt.x, pt.y, { steps: quick ? 3 : 14 }); await pause(quick ? 40 : 160); await p.mouse.click(pt.x, pt.y); }
await p.evaluate(() => {
  const s = RB.game.debugStart('rw.millroad', 11, 10, {});
  s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'hikari', 'mizu'];
  s.tips = Object.assign({}, ...['strike', 'shroud', 'rest'].map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
  RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'normal';
  if ('battleSpeed' in RB.game.settings) RB.game.settings.battleSpeed = 'normal';
  RB.game.settings.reducedMotion = false; RB.game.applySettings();
  RB.battleSeq.setTimeScale(1);
  const place = RB.content.maps['rw.millroad'].foes.find((f) => f.id === 'f3');
  window.__result = null;
  RB.game.startBattle('rw.dustmoth', { place, where: { map: 'rw.millroad', x: place.x, y: place.y }, foeKey: 'foe:rw.millroad:f3' }).then((r) => { window.__result = r || 'done'; });
});
// the opening line read and clicked away with the mouse
await pause(1200);
for (let i = 0; i < 6 && (await p.evaluate(() => RB.ui.dialogue.isOpen())); i++) { await pause(900); const pt = await center('.dlg:not(.hidden) .b-next'); if (pt) await clickAt(pt); else await p.evaluate(() => RB.ui.dialogue.advance(true)); await pause(300); }
await cards(p);
await p.evaluate(() => { const st = RB.combat.state(); st.knots = st.maxKnots = 8; RB.combat.refresh(); });
await pause(2200); // a quiet idle: the moth hovering, the party at rest
const traces = [];
async function exchange(label, intent, target, card, pre) {
  await p.evaluate(([k, t, pre]) => { CA.setIntent(k, t); const st = RB.combat.state(); if (pre && pre.ward) Object.assign(st.ward, pre.ward); RB.combat.refresh(); }, [intent, target, pre || null]);
  await pause(1400); // reading the telegraph
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, card);
  await clickAt(await center('.rcard[data-i="' + i + '"]'));
  await p.waitForSelector('.chal .mc .btn');
  // (the pointer rests on the task's heading while reading — resting on an option opens its word help)
  const hd = await p.evaluate(() => { const r = document.querySelector('.chal').getBoundingClientRect(); return { x: r.left + 120, y: r.top + 26 }; });
  await p.mouse.move(hd.x, hd.y, { steps: 8 });
  await pause(1100); // reading the task
  // (straight to the answer: lingering over another option opens its word help)
  await clickAt(await p.evaluate(() => CA.right()), true);
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go', { timeout: 15000 }).catch(async (e) => {
    await p.screenshot({ path: path.join(outDir, 'video_failure.png') });
    console.log('state', JSON.stringify(await p.evaluate(() => ({ fb: (document.querySelector('.fbwrap') || {}).outerHTML ? document.querySelector('.fbwrap').getAttribute('data-fb') : null, chal: !!document.querySelector('.chal'), kind: (document.querySelector('.chal') || { getAttribute: () => null }).getAttribute('data-kind') }))));
    throw e;
  });
  await pause(700);
  await clickAt(await center('.fbwrap[data-fb=ok] .fb-go'));
  await idle(p);
  const tr = await p.evaluate(() => RB.battleSeq.trace().filter((r) => r.kind === 'enemy').slice(-1)[0]);
  traces.push({ label, kind: tr.meta.kind, end: tr.meta.end, beats: tr.beats, fired: tr.fired, wallMs: tr.dur, settled: tr.settled });
  await cards(p);
  await pause(900);
}
await exchange('unblocked swoop Strike', 'strike', 'pc', 'unravel');
await exchange('fully warded Strike (protect: the seal at the contact)', 'strike', 'pc', 'protect.*on you');
await exchange('softened hit (one ward point absorbs part)', 'strike', 'pc', 'unravel', { ward: { pc: 1, comp: 0 } });
await exchange('Shroud applied (its powder settles over its knots)', 'shroud', null, 'unravel');
await pause(2600); // the veil persists, quietly
await exchange('light clears the Shroud (the same powder disperses); the creature rests', 'rest', null, 'Shows what is hidden');
await pause(1600);
const video = p.video();
await ctx.close();
const rawPath = await video.path();
const dst = path.join(outDir, 'moth_proof_normal.webm');
fs.copyFileSync(rawPath, dst);
fs.rmSync(raw, { recursive: true, force: true });
const traceOut = { build: 'index.html built from this commit', speed: 'Normal (presentation clock ×1)', viewport: '1280×720 (recorded at 960×540)', moves: traces };
fs.writeFileSync(path.join(outDir, 'moth_proof_trace.json'), JSON.stringify(traceOut, null, 1));
if (toDocs) {
  const dd = path.join(root, 'docs', 'screenshots', 'battle', 'creatures_a');
  fs.mkdirSync(dd, { recursive: true });
  fs.copyFileSync(dst, path.join(dd, 'moth_proof_normal.webm'));
  fs.writeFileSync(path.join(dd, 'moth_proof_trace.json'), JSON.stringify(traceOut, null, 1));
}
for (const t of traces) console.log(t.label + ': ' + t.kind + ', results ' + t.beats.map((x) => x.t + '@' + x.at).join(', ') + '; performance end ' + t.end + ' ms (presentation); wall ' + t.wallMs + ' ms');
console.log('wrote ' + path.relative(root, dst) + ' (' + Math.round(fs.statSync(dst).size / 1024) + ' KiB)' + (errors.length ? '; page errors: ' + errors.join(' | ') : '; no page errors'));
await b.close(); srv.close();
process.exit(errors.length ? 1 : 0);
