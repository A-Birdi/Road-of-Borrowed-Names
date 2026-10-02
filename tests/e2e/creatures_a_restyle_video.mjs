// Creatures A restyle: real-time Normal-speed recordings of the two proof items' key actions, with
// Playwright's recorder, at 1280 × 720 (recorded at full size, so each art pixel stays sharp):
//   moth — inside the mill (its interior placement), solo: a quiet idle; the swoop Strike unblocked;
//          a fully warded Strike (the seal at the contact); a softened hit; Shroud applied,
//          persisting, then cleared by light;
//   echo — The Mill Echo (Chapter 1 boss) in the mill: idle (its pulse waves); the shard-volley
//          Strike; Mirror (its shards lock into a pane); Heat (its rings warm and quicken); Plea.
// Responses are chosen and answered with the real mouse; synthetic campaigns in fresh contexts
// (never a player's save). The sequencer's trace of each move is written beside each clip.
// Usage: node tests/e2e/creatures_a_restyle_video.mjs [moth|echo] [--docs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, root } from './lib.mjs';
import { helpers, cards, idle } from './creatures_a_lib.mjs';

const args = process.argv.slice(2);
const toDocs = args.includes('--docs');
const only = args.find((a) => !a.startsWith('--'));
const outDir = path.join(root, 'tests', 'e2e', 'out', 'creatures_a_restyle');
const docDir = path.join(root, 'docs', 'screenshots', 'battle', 'creatures_a_restyle');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let failed = 0;

async function record(name, enemy, plan, opts) {
  const raw = path.join(outDir, 'raw_' + name);
  fs.mkdirSync(raw, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: raw, size: { width: 1280, height: 720 } } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(url);
  await p.waitForFunction(() => window.__RB_READY__ === true);
  await helpers(p);
  const pause = (ms) => p.waitForTimeout(ms);
  const center = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel);
  async function clickAt(pt, quick) { await p.mouse.move(pt.x, pt.y, { steps: quick ? 3 : 12 }); await pause(quick ? 40 : 140); await p.mouse.click(pt.x, pt.y); }
  await p.evaluate(([enemy, o]) => {
    const s = RB.game.debugStart('rw.mill1', 7, 8, { flags: { rw_gears: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'hikari', 'mizu'];
    s.tips = Object.assign({}, ...['strike', 'shroud', 'rest', 'mirror', 'heat', 'plea'].map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
    RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'normal';
    if ('battleAnim' in RB.game.settings) RB.game.settings.battleAnim = 'normal';
    RB.game.settings.reducedMotion = false; RB.game.applySettings();
    RB.battleSeq.setTimeScale(1);
    window.__result = null;
    const place = o.foe ? RB.content.maps['rw.mill1'].foes.find((f) => f.id === o.foe) : null;
    RB.game.startBattle(enemy, place ? { place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'foe:rw.mill1:' + place.id } : {}).then((r) => { window.__result = r || 'done'; });
  }, [enemy, opts || {}]);
  await pause(1000);
  for (let i = 0; i < 8 && (await p.evaluate(() => RB.ui.dialogue.isOpen())); i++) { await pause(500); await p.evaluate(() => RB.ui.dialogue.advance(true)); await pause(200); }
  await cards(p);
  await p.evaluate(() => { const st = RB.combat.state(); st.knots = st.maxKnots = 8; RB.combat.refresh(); });
  await pause(2000); // a quiet idle
  const traces = [];
  for (const [label, intent, target, card, pre, after] of plan) {
    await p.evaluate(([k, t, pre]) => { CA.setIntent(k, t); const st = RB.combat.state(); if (pre && pre.ward) Object.assign(st.ward, pre.ward); RB.combat.refresh(); }, [intent, target, pre || null]);
    await pause(900);
    const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, card);
    await clickAt(await center('.rcard[data-i="' + i + '"]'));
    await p.waitForSelector('.chal .mc .btn');
    const hd = await p.evaluate(() => { const r = document.querySelector('.chal').getBoundingClientRect(); return { x: r.left + 120, y: r.top + 26 }; });
    await p.mouse.move(hd.x, hd.y, { steps: 6 });
    await pause(600);
    await clickAt(await p.evaluate(() => CA.right()), true);
    await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go', { timeout: 15000 });
    await pause(400);
    await clickAt(await center('.fbwrap[data-fb=ok] .fb-go'));
    await idle(p);
    const tr = await p.evaluate(() => RB.battleSeq.trace().filter((r) => r.kind === 'enemy').slice(-1)[0]);
    if (tr) traces.push({ label, kind: tr.meta.kind, end: tr.meta.end, beats: tr.beats, wallMs: tr.dur });
    await cards(p);
    await pause(after || 700);
  }
  const video = p.video();
  await ctx.close();
  const dst = path.join(outDir, name + '_normal.webm');
  fs.copyFileSync(await video.path(), dst);
  fs.rmSync(raw, { recursive: true, force: true });
  const trace = { speed: 'Normal (presentation clock ×1)', viewport: '1280×720 (recorded at 1280×720)', moves: traces };
  fs.writeFileSync(path.join(outDir, name + '_trace.json'), JSON.stringify(trace, null, 1));
  if (toDocs) { fs.mkdirSync(docDir, { recursive: true }); fs.copyFileSync(dst, path.join(docDir, name + '_normal.webm')); fs.writeFileSync(path.join(docDir, name + '_trace.json'), JSON.stringify(trace, null, 1)); }
  for (const t of traces) console.log(name + ' — ' + t.label + ': ' + t.kind + ', results ' + t.beats.map((x) => x.t + '@' + x.at).join(', ') + '; end ' + t.end + ' ms; wall ' + t.wallMs + ' ms');
  console.log('wrote ' + path.relative(root, dst) + ' (' + Math.round(fs.statSync(dst).size / 1024) + ' KiB)' + (errors.length ? '; page errors: ' + errors.join(' | ') : '; no page errors'));
  if (errors.length) failed++;
}

if (!only || only === 'moth') await record('moth_proof', 'rw.dustmoth', [
  ['unblocked swoop Strike', 'strike', 'pc', 'unravel'],
  ['fully warded Strike (the seal at the contact)', 'strike', 'pc', 'protect.*on you'],
  ['softened hit (one ward point)', 'strike', 'pc', 'unravel', { ward: { pc: 1, comp: 0 } }],
  ['Shroud applied (flour over its knots)', 'shroud', null, 'unravel', null, 2000],
  ['light clears the Shroud', 'rest', null, 'Shows what is hidden', null, 1200],
], { foe: 'm1a' });
if (!only || only === 'echo') await record('echo_proof', 'rw.mill_echo', [
  ['shard-volley Strike', 'strike', 'pc', 'unravel'],
  ['Mirror (the shards lock into a pane)', 'mirror', 'pc', 'unravel'],
  ['Heat (its rings warm and quicken)', 'heat', null, 'unravel'],
  ['Plea', 'plea', null, 'unravel', null, 1200],
]);
await b.close(); srv.close();
process.exit(failed ? 1 : 0);
