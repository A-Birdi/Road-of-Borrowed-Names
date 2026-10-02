// A Quiet Cast in the built game (Practice addendum §5–§8, §20, §23.3;
// docs/practice/fishing.md). Synthetic campaigns in fresh browser contexts;
// no player save is touched.
//   1. Yasu's favour: talking to him plays his own postgame line, then asks.
//   2. One complete catch from the world: the station prop, its scene's Cast,
//      the activity, the wait, the bite, the situation, the task — every step
//      with real mouse clicks — the observation page (until dismissed),
//      release, leave; Fishing notes in the Journey.
//   3. A recognition repair without penalty (handwriting: "That is not what I
//      wrote", then the character rewritten; synthetic reference strokes).
//   4. A three-catch survey completion (Discover the waters), the ribbon, Yasu.
//   5. Reload: no duplicate catch, milestone or memory; a cast left in the
//      water is picked up again with the same fish.
//   6. Every companion and every pet species on the stage (captures), and all
//      16 companion × pet pairs (and no pet) through the stage's phases.
//   7. Layouts 320×640, 390×844, 844×390, 1280×800 and 200 % text; keyboard,
//      touch; reduced motion.
// Captures: docs/screenshots/fishing/ (named in its README).
// Usage: node tests/e2e/fishing.mjs [filter]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OUT = path.join(root, 'docs/screenshots/fishing');
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 240s')), 240000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String(e && e.stack || e).slice(0, 900)); console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 600)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const shot = (p, name, sel) => (sel ? p.locator(sel).first().screenshot({ path: path.join(OUT, name + '.png') }) : p.screenshot({ path: path.join(OUT, name + '.png') }));

// a campaign at a station (postgame), with a companion and a pet if asked
async function start(p, o) {
  await p.evaluate((o) => {
    const S = RB.fishing.site(o.site || 'fish.reedwake.current');
    const at = o.at || [S.stand.x, S.stand.y, S.stand.dir];
    const seen = {};
    for (const m of ['rw.village', 'rw.road', 'sg.harbor']) for (const ev of (RB.content.maps[m].onEnter || [])) seen['enter:' + m + ':' + ev.scene] = true;
    const s = RB.game.debugStart(o.map || S.map, at[0], at[1], { dir: at[2], comp: o.comp === undefined ? 'nao' : o.comp, flags: Object.assign({ postgame: true, rw_echo_done: true, departed: true, rw_arrived: true, rw_mill_open: true, rw_road_lit: true, bridge_fixed: true }, seen, o.flags || {}) });
    s.seen = Object.assign(s.seen || {}, { 'rw.village_first': true });
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.input = o.input || 'choice';
    RB.game.settings.reducedMotion = !!o.reduce;
    RB.game.settings.activityChatter = o.quiet ? 'quiet' : 'normal';
    RB.game.settings.fishWait = o.fishWait !== false;
    RB.game.applySettings && RB.game.applySettings();
    s.learn.profile = o.profile || 'E'; s.learn.kanaKnown = 'both';
    if (o.pet) { s.company.pets[o.pet] = { name: o.petName || 'Koma', reading: 'コマ', look: RB.petArt.LOOK_ORDER[o.pet][0], met: { t: Date.now(), map: S.map }, nameAtMeet: 'Koma' }; s.company.pet = o.pet; }
    window.__events = [];
    if (!window.__hooked) { window.__hooked = true; RB.bus.on('fishing:catch', (e) => window.__events.push(e)); RB.bus.on('discovery:resolved', (e) => window.__events.push({ bad: 'discovery:resolved', e })); }
  }, o || {});
  await p.waitForTimeout(450);
}
// a real mouse click (or touch tap) on an element, scrolled into view first
async function click(p, sel, o) {
  const el = p.locator(sel).first();
  await el.waitFor({ state: 'visible', timeout: (o && o.timeout) || 12000 });
  // a mouse left resting where the last click was opens a word's hover card when the panel scrolls a
  // word beneath it (a person moves the pointer on to the next control): park it off the text first
  if (!(o && o.tap)) {
    await p.mouse.move(1, 1);
    await p.waitForFunction(() => !document.querySelector('#overlay > .help'), null, { timeout: 3000 }).catch(() => {});
  }
  await el.scrollIntoViewIfNeeded();
  // where on the control to press: its middle, unless a word sits there — pointing at a word opens
  // the word's help card (by design), which can cover the control; then a plain part of it (the icon,
  // the padding), still inside the control and on top
  const pt = await el.evaluate((t) => {
    const r = t.getBoundingClientRect();
    const xs = [0.5, 0.06, 0.94, 0.25, 0.75], ys = [0.5, 0.2, 0.8];
    for (const fy of ys) for (const fx of xs) {
      const x = r.left + r.width * fx, y = r.top + r.height * fy, e = document.elementFromPoint(x, y);
      if (e && (e === t || t.contains(e)) && !(e.closest && e.closest('.jt'))) return { x, y };
    }
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (o && o.tap) await p.touchscreen.tap(pt.x, pt.y);
  else await p.mouse.click(pt.x, pt.y);
}
const state = (p) => p.evaluate(() => { const F = RB.fishing.st(RB.game.s); return { obs: JSON.parse(JSON.stringify(F.observed)), ms: Object.keys(F.milestones), active: F.active && { seq: F.active.seq, fish: F.active.fish, situation: F.active.situation, profile: F.active.profile }, w: F.lastCommittedCatchSeq, catches: F.catches, mode: RB.game.mode(), open: !!RB.ui.fishing.current(), mem: RB.game.s.company.memories.map((m) => m.id), bond: JSON.stringify(RB.game.s.company.bond), awarded: Object.keys(RB.game.s.awarded || {}).filter((k) => /^fish:/.test(k)) }; });
// answer the open task correctly with real clicks (Choose / pieces), whatever its kind
async function answer(p, o) {
  o = o || {};
  await p.waitForSelector('.chal', { timeout: 10000 });
  const info = await p.evaluate(() => {
    const a = RB.fishing.st(RB.game.s).active, k = RB.fishing.situation(a.situation).tasks[a.profile];
    const plain = (x) => RB.tasks.plain(x).replace(/\s/g, '');
    return { kind: k.kind, ok: k.kind === 'choose' ? k.options.filter((x) => x.ok).map((x) => plain(x.jp)) : k.kind === 'write' ? (k.accept || [k.answer]).map(plain) : k.answer.map(plain), sit: a.situation, prof: a.profile };
  });
  if (info.kind === 'write' && !(await p.evaluate(() => !!document.querySelector('.chal .mc')))) await click(p, '.chal [data-mode=choice]');
  if (info.kind === 'order') {
    for (const piece of info.ok) {
      const i = await p.evaluate((piece) => { const t = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); return c.textContent.replace(/\s/g, ''); }; return [...document.querySelectorAll('.chal .tiles .tile')].findIndex((b) => t(b) === piece); }, piece);
      if (i < 0) throw new Error('no piece ' + piece);
      await click(p, '.chal .tiles .tile >> nth=' + i);
    }
    await click(p, '.chal [data-a=submit]');
  } else {
    if (o.wrongFirst) {
      const wi = await p.evaluate((ok) => { const t = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((x) => x.remove()); return c.textContent.replace(/\s/g, ''); }; return [...document.querySelectorAll('.chal .choice')].findIndex((b) => ok.indexOf(t(b)) < 0); }, info.ok);
      if (wi >= 0) { await click(p, '.chal .choice >> nth=' + wi); await p.waitForTimeout(150); }
    }
    const i = await p.evaluate((ok) => { const t = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((x) => x.remove()); return c.textContent.replace(/\s/g, ''); }; return [...document.querySelectorAll('.chal .choice')].findIndex((b) => ok.indexOf(t(b)) >= 0 && !b.disabled); }, info.ok);
    if (i < 0) throw new Error('no right choice for ' + info.sit + '[' + info.prof + '] among ' + JSON.stringify(info.ok));
    await click(p, '.chal .choice >> nth=' + i);
  }
  await click(p, '.chal [data-a=continue]');
  return info;
}
// one cast from the open preparation panel to the choice after release
async function oneCatch(p, o) {
  o = o || {};
  if (o.how === 'discover') await click(p, '.fish-panel [data-k=discover]');
  if (o.patch) await click(p, '.fish-panel [data-k="patch:' + o.patch + '"]');
  if (o.shots) await shot(p, o.shots + '_prep');
  await click(p, '.fish-panel [data-k=cast]');
  if (o.shots) { await p.waitForTimeout(650); await shot(p, o.shots + '_cast', '.fish-stagebox'); }
  // the wait: skip it when offered (not on the very first cast)
  const t0 = Date.now();
  for (;;) {
    if (await p.evaluate(() => !!document.querySelector('.fish-panel [data-k=take]'))) break;
    if (!o.noSkip && await p.evaluate(() => !!document.querySelector('.fish-panel [data-k=skip]'))) { await click(p, '.fish-panel [data-k=skip]'); continue; }
    if (Date.now() - t0 > 9000) throw new Error('no bite');
    await p.waitForTimeout(120);
  }
  if (o.shots) await shot(p, o.shots + '_bite', '.fish-stagebox');
  await click(p, '.fish-panel [data-k=take]');
  await p.waitForSelector('.fish-panel [data-k=answer]');
  if (o.shots) { await p.waitForTimeout(300); await shot(p, o.shots + '_situation'); }
  const before = await state(p);
  await click(p, '.fish-panel [data-k=answer]');
  if (o.beforeAnswer) await o.beforeAnswer();
  const info = o.answer ? await o.answer() : await answer(p, o);
  if (o.shots) { await p.waitForTimeout(500); await shot(p, o.shots + '_act', '.fish-stagebox'); }
  await p.waitForSelector('.fish-panel [data-k=release]', { timeout: 12000 });
  await p.waitForTimeout(200);
  if (o.shots) await shot(p, o.shots + '_observe');
  const obs = await p.evaluate(() => ({ name: (document.querySelector('.fp-name') || {}).textContent || '', plate: (() => { const c = document.querySelector('.fp-plate canvas'); if (!c) return 0; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; })(), ms: [...document.querySelectorAll('.fp-ms')].map((x) => x.textContent), say: (document.querySelector('.fish-panel .fp-say') || {}).textContent || '' }));
  await click(p, '.fish-panel [data-k=release]');
  if (o.shots) { await p.waitForTimeout(350); await shot(p, o.shots + '_release', '.fish-stagebox'); }
  await p.waitForSelector('.fish-panel [data-k=again]', { timeout: 12000 });
  return { before, info, obs, after: await state(p) };
}
async function launchAt(p, site) {
  await p.evaluate((site) => { window.__launch = RB.activity.launch('fishing', { source: 'world-prop', site }); }, site);
  await p.waitForSelector('.fish-panel [data-k=cast], .fish-panel [data-k=resume]', { timeout: 10000 });
}
async function leave(p, back) {
  await click(p, '.fish-panel [data-k=leave]');
  // back to the world — or, when it was begun from a folio page, back to that page (§3.4)
  await p.waitForFunction((back) => !RB.ui.fishing.current() && RB.game.mode() === (back || 'world'), back || null, { timeout: 8000 });
}

// ---------------------------------------------------------------------------------------------------------
await test('Yasu: his own postgame line, then the favour (once); his routing is kept', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { site: 'fish.reedwake.current', at: [33, 25, 'right'] });
  const yasu = await p.evaluate(() => { const a = RB.world.actorById('yasu'); return a ? [a.x, a.y] : null; });
  assert(yasu && yasu[0] === 34 && yasu[1] === 25, 'Yasu stands on his pier: ' + JSON.stringify(yasu));
  await p.keyboard.press('Enter');
  const lines = [];
  for (let i = 0; i < 20; i++) {
    await p.waitForTimeout(250);
    const d = await p.evaluate(() => ({ open: RB.ui.dialogue.isOpen(), t: (document.querySelector('.dlg:not(.hidden) .en, .dlg:not(.hidden) .tr') || {}).textContent || '' }));
    if (!d.open) break;
    lines.push(d.t.slice(0, 60));
    await p.keyboard.press('Enter');
  }
  const st = await p.evaluate(() => ({ via: (RB.fishing.st(RB.game.s).milestones.intro || {}).via, post: !!RB.game.s.seen['rw.yasu_post'], intro: !!RB.game.s.seen['fish.yasu_intro'] }));
  assert(st.via === 'yasu' && st.post && st.intro, 'the favour was asked after his usual line: ' + JSON.stringify(st) + ' lines ' + JSON.stringify(lines));
  // next time: his ordinary postgame line again (the favour is not repeated)
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  for (let i = 0; i < 8 && await p.evaluate(() => RB.ui.dialogue.isOpen()); i++) { await p.keyboard.press('Enter'); await p.waitForTimeout(200); }
  const again = await p.evaluate(() => RB.game.s.backlog.slice(-3).map((l) => l.en).join(' | '));
  assert(/grandchild/.test(again) && !/favour/.test(again), 'then his ordinary line: ' + again);
  assert(!errors.length && !requests.length, 'errors ' + errors.join('; ') + ' requests ' + requests.join(' '));
  await ctx.close();
});

await test('one complete catch from the world, with real clicks; the observation stays until dismissed; Fishing notes', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { site: 'fish.reedwake.current', comp: 'nao', pet: 'cat' });
  await shot(p, 'world_station_river');
  // the station: Look, then the scene's choices (the signed note first, the first time)
  const fa = await p.evaluate(() => RB.world.frontAction());
  assert(fa && fa.kind === 'prop', 'facing the station: ' + JSON.stringify(fa));
  await p.keyboard.press('Enter');
  for (let i = 0; i < 12; i++) {
    await p.waitForTimeout(250);
    if (await p.evaluate(() => !!document.querySelector('.choices:not(.hidden) .choice'))) break;
    await p.keyboard.press('Enter');
  }
  const note = await p.evaluate(() => ({ via: (RB.fishing.st(RB.game.s).milestones.intro || {}).via, back: RB.game.s.backlog.map((l) => l.en).join(' | ') }));
  assert(note.via === 'note' && /Yasu/.test(note.back), 'the signed note introduces the survey when Yasu has not: ' + JSON.stringify(note).slice(0, 300));
  await shot(p, 'station_menu');
  const castI = await p.evaluate(() => [...document.querySelectorAll('.choices:not(.hidden) .choice')].findIndex((c) => /Cast/.test(c.textContent)));
  assert(castI >= 0, 'the station offers Cast / Fishing notes / Rules / Leave');
  await click(p, '.choices:not(.hidden) .choice >> nth=' + castI);
  await p.waitForSelector('.fish-panel [data-k=cast]', { timeout: 8000 });
  const r = await oneCatch(p, { noSkip: true, shots: 'catch_river_nao_cat' });
  assert(r.before.active && r.after.obs[r.before.active.fish] && r.after.obs[r.before.active.fish].count === 1, 'the catch is recorded once: ' + JSON.stringify(r.after.obs));
  assert(r.after.w === r.before.active.seq && !r.after.active, 'the watermark moved to the cast (' + r.after.w + ')');
  assert(r.obs.plate > 200 && /—/.test(r.obs.name), 'the observation page shows the drawing and the name: ' + r.obs.name + ' (' + r.obs.plate + ' px)');
  assert(r.after.ms.indexOf('first') >= 0 && r.after.mem.indexOf('fish:outing') >= 0 && r.after.bond === '{}', 'first observation milestone, one shared memory, no bond: ' + JSON.stringify(r.after));
  // the observation page waited for Release (it was there when we looked; nothing advanced on its own)
  const ev = await p.evaluate(() => window.__events);
  assert(ev.length === 1 && !ev.some((e) => e.bad), 'one fishing:catch event, never discovery:resolved: ' + JSON.stringify(ev));
  await shot(p, 'after_release');
  await leave(p);
  // Fishing notes in the Journey
  await p.evaluate(() => RB.ui.menu.open('fishing'));
  await p.waitForSelector('.fn-page');
  await click(p, '.fn-cell:not(.unseen)');
  await p.waitForTimeout(200);
  const nt = await p.evaluate(() => ({ t: document.querySelector('.folio').textContent.replace(/\s+/g, ' '), cells: document.querySelectorAll('.fn-cell').length, unseen: document.querySelectorAll('.fn-cell.unseen').length }));
  assert(nt.cells === 9 && nt.unseen === 8 && /1 of 9 recorded/.test(nt.t) && /First seen at Reedwake riverbank/.test(nt.t) && /with Nao and Koma the cat/.test(nt.t), 'Fishing notes: 9 entries, 8 unseen, first observation with who was there: ' + nt.t.slice(0, 400));
  await shot(p, 'notes_first');
  const names = await p.evaluate(() => [...document.querySelectorAll('.fn-cell.unseen')].map((c) => c.textContent).join(''));
  assert(!/[ァ-ヶ]/.test(names), 'unseen cells name nothing: ' + names);
  await p.evaluate(() => RB.ui.menu.close());
  assert(!errors.length && !requests.length, 'errors ' + errors.join('; ') + ' requests ' + requests.join(' '));
  await ctx.close();
});

await test('a recognition repair costs nothing: "That is not what I wrote", rewrite, same fish, no mistake recorded', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { site: 'fish.reedwake.current', comp: 'mio', input: 'hand' });
  await p.evaluate(() => {
    window.__ink = (ch, seed) => { const ref = RB.recog.reference(ch); const r = RB.util.rng((seed || 7) * 31 + ch.charCodeAt(0)); return ref.strokes.map((st) => st.map((pt, i) => ({ x: (pt.x / ref.box) * 0.8 + 0.1 + (r() - 0.5) * 0.02, y: (pt.y / ref.box) * 0.8 + 0.1 + (r() - 0.5) * 0.02, t: 1000 + i * 16 }))); };
  });
  await launchAt(p, 'fish.reedwake.current');
  // cast until the situation's task is a writing one (letting the others go costs nothing)
  let info = null;
  for (let tries = 0; tries < 12 && !info; tries++) {
    await click(p, '.fish-panel [data-k=cast]');
    await p.waitForSelector('.fish-panel [data-k=take]', { timeout: 9000 });
    const k = await p.evaluate(() => { const a = RB.fishing.st(RB.game.s).active, t = RB.fishing.situation(a.situation).tasks[a.profile]; return t.kind === 'write' ? { seq: a.seq, fish: a.fish, sit: a.situation, answer: RB.tasks.plain(t.answer), item: t.item } : null; });
    if (k) { info = k; break; }
    await click(p, '.fish-panel [data-k=leave]');
    await p.waitForFunction(() => !RB.ui.fishing.current());
    await p.waitForTimeout(300);
    await launchAt(p, 'fish.reedwake.current');
  }
  assert(info, 'a writing task came up');
  await click(p, '.fish-panel [data-k=take]');
  await click(p, '.fish-panel [data-k=answer]');
  await p.waitForSelector('.chal .pad-ink');
  const chars = Array.from(info.answer);
  // the first character right, the last one "misread": write a different kana in its place
  const wrong = { 'ぎ': 'き', 'つ': 'う', 'り': 'い', 'る': 'ろ', 'け': 'は', 'こ': 'に', 'く': 'し', 'せ': 'ぜ', 'だ': 'た', 'ぐ': 'く' }[chars[chars.length - 1]] || 'の';
  // write one character; when it is meant to be read right and the pad offers a twin first (ぁ for あ:
  // the same shape), pick the meant one among its readings, as a person would before confirming
  const writeChar = async (ch, meant) => {
    await p.evaluate(async (ch) => { RB.pad.__last._inject(__ink(ch)); await new Promise((r) => setTimeout(r, 80)); }, ch);
    if (meant) {
      const top = await p.evaluate(() => { const P = RB.pad.__last._state; return P.pick || (P.list && P.list[0] ? P.list[0].ch : null); });
      if (top !== meant) {
        const i = await p.evaluate((c) => [...document.querySelectorAll('.chal .cand')].findIndex((x) => { const g = x.cloneNode(true); g.querySelectorAll('.cap,rt').forEach((y) => y.remove()); return g.textContent.trim() === c; }), meant);
        assert(i >= 0, 'the pad read ' + top + ' for ' + meant + ' and does not offer ' + meant);
        await click(p, '.chal .cand >> nth=' + i);
      }
    }
    await click(p, '.chal [data-a=confirm]');
  };
  for (let i = 0; i < chars.length; i++) await writeChar(i === chars.length - 1 ? wrong : chars[i], i === chars.length - 1 ? null : chars[i]);
  await click(p, '.chal [data-a=submit]');
  await p.waitForSelector('.chal [data-a=misread]', { timeout: 6000 });
  await shot(p, 'repair_wrong_read');
  await click(p, '.chal [data-a=misread]');
  const fb = await p.evaluate(() => document.querySelector('.chal .fbwrap').getAttribute('data-fb'));
  assert(fb === 'unsure', 'the misread is answered as the pad\'s uncertainty, not a Japanese mistake: ' + fb);
  await shot(p, 'repair_misread_report');
  // tap the misread character in the answer strip and write it again
  // (the strip's insertion gaps are cells too: count only the written characters)
  await click(p, '.chal .strip .cell:not(.ins) >> nth=' + (chars.length - 1));
  assert(await p.evaluate(() => { const c = document.querySelector('.chal .strip .cell.cur:not(.ins)'); return !!c; }), 'the misread character is selected for rewriting');
  await writeChar(chars[chars.length - 1], chars[chars.length - 1]);
  const strip = await p.evaluate(() => [...document.querySelectorAll('.chal .strip .cell:not(.ins)')].map((c) => c.textContent.trim()).join(''));
  assert(strip === info.answer, 'the answer strip now reads ' + strip + ' (' + info.answer + ')');
  await click(p, '.chal [data-a=submit]');
  await click(p, '.chal [data-a=continue]');
  await p.waitForSelector('.fish-panel [data-k=release]', { timeout: 12000 });
  const rec = await p.evaluate((info) => { const F = RB.fishing.st(RB.game.s); const at = F.recentAttempts[F.recentAttempts.length - 1]; const it = RB.game.s.learn.items[[].concat(info.item)[0]] || null; return { at, obs: F.observed[info.fish], bad: it ? it.bad : 0 }; }, info);
  assert(rec.at.fish === info.fish && rec.at.recognitionRepair && rec.at.mistakes === 0 && rec.at.firstTry === true && rec.bad === 0, 'same fish, recognition repair recorded, no mistake, no wrong answer in mastery: ' + JSON.stringify(rec));
  assert(rec.obs && rec.obs.count === 1, 'the survey credit is the ordinary one');
  await click(p, '.fish-panel [data-k=release]');
  await p.waitForSelector('.fish-panel [data-k=again]');
  await leave(p);
  assert(!errors.length, 'errors ' + errors.join('; '));
  await ctx.close();
});

await test('three different fish complete Yasu\'s survey (Discover the waters): the ribbon, the Words entry, Yasu\'s thanks', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { site: 'fish.reedwake.current', comp: 'ren', pet: 'bird' });
  // Words › Ways to practise: Begin here at the station (fishing does not need the companion beside you)
  await p.evaluate(() => RB.ui.menu.open('practice'));
  await p.waitForSelector('[data-pr-begin=fishing]');
  const icons = await p.evaluate(() => [...document.querySelectorAll('.pr-index svg')].map((x) => Math.round(x.getBoundingClientRect().width)));
  assert(icons.length && icons.every((w) => w > 0 && w < 40), 'the entry\'s icons are text-sized: ' + icons.join(','));
  await shot(p, 'words_ways_to_practise');
  await click(p, '[data-pr-begin=fishing]');
  await p.waitForSelector('.fish-panel [data-k=cast]', { timeout: 8000 });
  const got = [];
  for (let i = 0; i < 3; i++) {
    const r = await oneCatch(p, { how: 'discover', shots: i === 2 ? 'survey_ren_bird' : null });
    got.push(r.before.active.fish);
    if (i === 2) {
      assert(r.obs.ms.some((m) => /survey is complete/.test(m)) && r.after.ms.indexOf('survey') >= 0, 'the survey completes on the third different fish: ' + JSON.stringify(r.obs.ms));
      assert(/Ren/.test(r.obs.say), 'Ren\'s survey remark: ' + r.obs.say);
    }
    if (i < 2) await click(p, '.fish-panel [data-k=again]');
  }
  assert(new Set(got).size === 3, 'three different fish from three discovery catches: ' + got.join(','));
  const st = await p.evaluate(() => ({ ribbon: RB.fishing.ribbon(RB.game.s), onStage: RB.ui.fishing.current().ui.stage.state().ribbon, remarks: RB.ui.fishing.current().remarks, log: RB.ui.fishing.current().remarkLog }));
  assert(st.ribbon && st.onStage, 'the rod ribbon is tied on, and drawn on the rod in this same outing: ' + JSON.stringify(st));
  assert(st.log.filter((k) => k === 'wait').length <= 2, 'at most two ambient remarks in a three-cast session: ' + JSON.stringify(st.log));
  await click(p, '.fish-panel [data-k=again]');
  await p.waitForSelector('.fish-panel [data-k=cast]');
  await p.waitForTimeout(300);
  await shot(p, 'ribbon_on_rod', '.fish-stagebox');
  await leave(p, 'menu');
  const back = await p.evaluate(() => ({ open: RB.ui.menu.isOpen(), page: RB.ui.menu.current() }));
  assert(back.open && back.page.section === 'words' && back.page.words === 'practice', 'begun from Words › Ways to practise, it returns there: ' + JSON.stringify(back));
  await p.evaluate(() => RB.ui.menu.close());
  // Yasu's thanks, once
  // (his scene waits for the player to read each line: Enter advances it, as a person would)
  await p.evaluate(() => { window.__thanks = false; RB.script.run('fish.yasu_thanks').then(() => { window.__thanks = true; }); });
  for (let i = 0; i < 12 && !(await p.evaluate(() => window.__thanks)); i++) { await p.waitForTimeout(250); await p.keyboard.press('Enter'); }
  assert(await p.evaluate(() => window.__thanks && !RB.script.isRunning()), 'Yasu\'s thanks scene ended');
  const th = await p.evaluate(() => RB.game.s.backlog.slice(-2).map((l) => l.en).join(' | '));
  assert(/three kinds/i.test(th), 'Yasu thanks you: ' + th);
  const yasuNext = await p.evaluate(() => { const y = RB.content.maps['rw.village'].npcs.find((n) => n.id === 'yasu'); const s = RB.game.s; return y.talk.find((o) => !o.if || RB.state.test(s, o.if)).scene; });
  assert(yasuNext === 'rw.yasu_post', 'and then his ordinary line again: ' + yasuNext);
  assert(!errors.length, 'errors ' + errors.join('; '));
  await ctx.close();
});

await test('reload: no duplicate catch, milestone or memory; a cast left in the water comes back with the same fish', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { site: 'fish.saltglass.harbor', comp: 'suzu', pet: 'tanuki' });
  await p.evaluate(() => RB.save.setCurrent(6, 0));
  await launchAt(p, 'fish.saltglass.harbor');
  const r = await oneCatch(p, { how: 'discover' });
  // a cast left in the water: begin one, then save and reload mid-cast
  await click(p, '.fish-panel [data-k=again]');
  await p.waitForSelector('.fish-panel [data-k=cast]');
  await click(p, '.fish-panel [data-k=cast]');
  await p.waitForSelector('.fish-panel [data-k=take]', { timeout: 9000 });
  const mid = await state(p);
  await p.evaluate(async () => { await RB.save.writeSlot(6, RB.game.s, { force: true }); });
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true);
  const ok = await p.evaluate(async () => { RB.ui.title.hide(); const r = await RB.game.loadCampaign(6); RB.game.settings.textSpeed = 'instant'; return r; });
  await p.waitForTimeout(400);
  const back = await state(p);
  // (loading also lets the companion system record its own retroactive story memories, e.g. story:recruit
  // for a debug-started campaign: only the fishing memories are compared, and they must be identical)
  const fishMem = (x) => x.mem.filter((m) => /^fish:/.test(m)).join();
  assert(ok && JSON.stringify(back.obs) === JSON.stringify(mid.obs) && back.ms.join() === mid.ms.join() && fishMem(back) === fishMem(mid) && back.awarded.join() === mid.awarded.join(), 'after a reload the records are exactly as saved: ' + JSON.stringify({ ok, back, mid }).slice(0, 1200));
  // the same commit, called again (as a resumed promise would): refused
  const dup = await p.evaluate((seq) => RB.fishing.commitCatch(RB.game.s, seq, { result: { ok: true } }), r.before.active.seq);
  assert(!dup.ok && dup.dup, 'a repeated commit of a done cast is refused');
  assert(back.active && back.active.fish === mid.active.fish && back.active.seq === mid.active.seq, 'the cast in the water was kept: ' + JSON.stringify(back.active));
  await p.evaluate(() => { window.__events = []; RB.bus.on('fishing:catch', (e) => window.__events.push(e)); });
  await launchAt(p, 'fish.saltglass.harbor');
  await shot(p, 'resume_prompt');
  await click(p, '.fish-panel [data-k=resume]');
  await p.waitForSelector('.fish-panel [data-k=take]');
  await click(p, '.fish-panel [data-k=take]');
  await click(p, '.fish-panel [data-k=answer]');
  await answer(p);
  await p.waitForSelector('.fish-panel [data-k=release]', { timeout: 12000 });
  await click(p, '.fish-panel [data-k=release]');
  await p.waitForSelector('.fish-panel [data-k=again]');
  const fin = await state(p);
  const n0 = (mid.obs[mid.active.fish] || { count: 0 }).count;
  assert(fin.obs[mid.active.fish].count === n0 + 1 && fin.mem.filter((m) => m === 'fish:outing').length === 1 && fin.bond === '{}', 'the same fish, counted once more; one outing memory; no bond: ' + JSON.stringify(fin));
  await leave(p);
  assert(!errors.length, 'errors ' + errors.join('; '));
  await ctx.close();
});

await test('every companion and every pet species on the stage (captures); all 16 pairs and no pet through the stage\'s phases', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const pairs = [['nao', 'cat', 'fish.reedwake.current'], ['mio', 'dog', 'fish.reedwake.quiet'], ['ren', 'bird', 'fish.saltglass.harbor'], ['suzu', 'tanuki', 'fish.reedwake.current']];
  for (const [comp, pet, site] of pairs) {
    await start(p, { site, comp, pet });
    await launchAt(p, site);
    const r = await oneCatch(p, { how: 'discover', shots: 'stage_' + comp + '_' + pet });
    const st = await p.evaluate(() => RB.ui.fishing.current().ui.stage.stats());
    assert(r.after.catches === 1, comp + '+' + pet + ': a catch');
    const behaviours = Object.keys(st.comp).map((k) => k.split(':')[1]);
    assert(['settle', 'notes', 'watch', 'splash', 'lean'].every((x) => behaviours.indexOf(x) >= 0), comp + ': settle, notes, watch, splash and lean were drawn: ' + behaviours.join(','));
    const reactions = Object.keys(st.pet).map((k) => k.split(':')[1]);
    assert(reactions.length >= 2, pet + ': reacted (' + reactions.join(',') + ')');
    await leave(p);
  }
  // the stage alone, for all 16 pairs and no pet: every phase drawn, behaviours and reactions as expected
  const cov = await p.evaluate(async () => {
    const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:0;top:0;width:640px;height:440px'; document.body.appendChild(host);
    const box = document.createElement('div'); box.style.cssText = 'position:absolute;inset:0'; host.appendChild(box);
    const out = {};
    const s = RB.game.s;
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) for (const pet of ['cat', 'dog', 'bird', 'tanuki', null]) {
      const st = RB.fishStage.create(box, { site: 'fish.reedwake.current', comp, pet: pet ? { species: pet, look: RB.petArt.LOOK_ORDER[pet][0] } : null, look: RB.equip.look(s) });
      st.set({ patch: 'open', fish: 'oikawa', situation: 'C04' });
      for (const ph of ['prep', 'cast', 'wait', 'bite', 'situation', 'act', 'land', 'observe', 'release', 'after']) { const pr = st.go(ph, { intent: 'lift' }); await new Promise((r) => setTimeout(r, 140)); if (ph === 'situation') st.event('remark'); void pr; }
      await new Promise((r) => setTimeout(r, 200));
      const x = st.stats();
      out[comp + '+' + (pet || 'none')] = { comp: Object.keys(x.comp).map((k) => k.split(':')[1]).sort(), pet: Object.keys(x.pet).map((k) => k.split(':')[1]).sort(), phases: Object.keys(x.phases).length };
      st.destroy();
    }
    host.remove();
    return out;
  });
  for (const k in cov) {
    const c = cov[k];
    assert(c.phases >= 9, k + ': every phase drawn (' + c.phases + ')');
    assert(c.comp.length >= 5, k + ': companion behaviours ' + c.comp.join(','));
    if (/none$/.test(k)) assert(!c.pet.length, k + ': no pet drawn');
    else assert(c.pet.length >= 2, k + ': pet reactions ' + c.pet.join(','));
  }
  assert(Object.keys(cov).length === 20, '16 pairs and 4 no-pet runs: ' + Object.keys(cov).length);
  // the hand the rod hangs from is the rig's own hand point (the projection constant is right)
  const hand = await p.evaluate(() => { const look = RB.equip.look(RB.game.s); const f = RB.battlers._.frameFor(look, { pose: 'ready', t: 0, reduce: true }); const ps = RB.battlers._.poseAt(look, 'ready', 'direct', 0, 0, 'pc', true); const { J } = RB.battlers._.render(look, ps); const m = RB.fishStage.proj(J.handR); return { rig: f.pts.hand, mine: m }; });
  assert(Math.abs(hand.rig.x - hand.mine.x) < 0.01 && Math.abs(hand.rig.y - hand.mine.y) < 0.01, 'the rod is attached at the rig\'s hand: ' + JSON.stringify(hand));
  fs.writeFileSync(path.join(OUT, 'coverage_pairs.json'), JSON.stringify(cov, null, 1));
  assert(!errors.length, 'errors ' + errors.join('; '));
  await ctx.close();
});

await test('layouts (320×640, 390×844, 844×390, 1280×800, 200 % text): no sideways overflow, 44 px targets, the stage and the panel both visible', async () => {
  const sizes = [[320, 640, true], [390, 844, true], [844, 390, true], [1280, 800, false]];
  for (const [w, h, touch] of sizes) for (const scale of [1, 2]) {
    if (scale === 2 && w !== 390 && w !== 1280) continue;
    const { p, errors, ctx } = await page(b, url, { viewport: { width: w, height: h }, touch, mobile: touch, dpr: touch ? 2 : 1 });
    await start(p, { site: 'fish.reedwake.quiet', comp: 'mio', pet: 'dog' });
    await p.evaluate((k) => { RB.game.settings.textScale = k; RB.game.applySettings(); }, scale);
    await launchAt(p, 'fish.reedwake.quiet');
    await p.waitForTimeout(400);
    const tag = w + 'x' + h + (scale === 2 ? '_text200' : '');
    await shot(p, 'layout_' + tag);
    const audit = await p.evaluate(() => {
      const W = innerWidth, out = { over: [], small: [], stage: null, panel: null };
      if (document.documentElement.scrollWidth > W + 1) out.over.push('page ' + document.documentElement.scrollWidth);
      for (const el of document.querySelectorAll('.fish-wrap *')) {
        if (el.closest('.fs-labels') || el.matches('rt, rt *')) continue;
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        if (r.right > W + 1 || r.left < -1) out.over.push((el.className || el.tagName) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
      }
      for (const btn of document.querySelectorAll('.fish-panel button')) { const r = btn.getBoundingClientRect(); if (r.width && (r.width < 43.5 || r.height < 43.5)) out.small.push(btn.textContent.trim().slice(0, 20) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
      const sb = document.querySelector('.fish-stagebox').getBoundingClientRect(), pn = document.querySelector('.fish-panel').getBoundingClientRect();
      out.stage = [Math.round(sb.width), Math.round(sb.height)]; out.panel = [Math.round(pn.width), Math.round(pn.height)];
      return out;
    });
    assert(!audit.over.length, tag + ': sideways overflow ' + audit.over.slice(0, 5).join('; '));
    assert(!audit.small.length, tag + ': targets under 44 px ' + audit.small.slice(0, 5).join('; '));
    assert(audit.stage[0] > 120 && audit.stage[1] > 80 && audit.panel[1] > 100, tag + ': stage ' + audit.stage + ' panel ' + audit.panel);
    // the Cast button is reachable (scrolling the panel if needed) and works by touch or click
    const r = await oneCatch(p, { how: 'discover' }).catch((e) => ({ err: String(e) }));
    assert(!r.err, tag + ': a catch at this size: ' + r.err);
    await shot(p, 'layout_' + tag + '_after');
    await leave(p);
    assert(!errors.length, tag + ': errors ' + errors.join('; '));
    await ctx.close();
  }
});

await test('keyboard alone: Cast, the bite, the answer, release and Escape to leave; touch taps on a phone', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { site: 'fish.reedwake.current', comp: null, fishWait: false });
  await launchAt(p, 'fish.reedwake.current');
  // focus starts on Cast
  const f0 = await p.evaluate(() => document.activeElement && document.activeElement.dataset.k);
  assert(f0 === 'cast', 'focus starts on Cast: ' + f0);
  await p.keyboard.press('Enter');
  await p.waitForSelector('.fish-panel [data-k=take]', { timeout: 9000 });
  await p.waitForTimeout(100);
  await p.keyboard.press('Enter');
  await p.waitForSelector('.fish-panel [data-k=answer]');
  await p.waitForTimeout(100);
  await p.keyboard.press('Enter');
  await p.waitForSelector('.chal');
  // the answer by keyboard: choose mode, Tab to the right option, Enter
  const info = await p.evaluate(() => { const a = RB.fishing.st(RB.game.s).active, k = RB.fishing.situation(a.situation).tasks[a.profile]; return k.kind; });
  if (info === 'order') await answer(p); // pieces by keyboard are covered by the challenge's own tests
  else {
    if (info === 'write') await click(p, '.chal [data-mode=choice]');
    const ok = await p.evaluate(() => { const a = RB.fishing.st(RB.game.s).active, k = RB.fishing.situation(a.situation).tasks[a.profile]; const plain = (x) => RB.tasks.plain(x).replace(/\s/g, ''); return k.kind === 'choose' ? k.options.filter((x) => x.ok).map((x) => plain(x.jp)) : (k.accept || [k.answer]).map(plain); });
    for (let i = 0; i < 30; i++) {
      await p.keyboard.press('Tab');
      const t = await p.evaluate(() => { const e = document.activeElement; if (!e || !e.classList.contains('choice')) return null; const c = e.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((x) => x.remove()); return c.textContent.replace(/\s/g, ''); });
      if (t && ok.indexOf(t) >= 0) break;
    }
    await p.keyboard.press('Enter');
    await p.waitForSelector('.chal [data-a=continue]');
    await p.keyboard.press('Enter');
  }
  await p.waitForSelector('.fish-panel [data-k=release]', { timeout: 12000 });
  await p.waitForTimeout(150);
  await p.keyboard.press('Enter');
  await p.waitForSelector('.fish-panel [data-k=again]', { timeout: 12000 });
  await p.keyboard.press('Escape');
  await p.waitForFunction(() => !RB.ui.fishing.current() && RB.game.mode() === 'world', null, { timeout: 8000 });
  const st = await state(p);
  assert(st.catches === 1, 'a whole catch by keyboard; Escape leaves');
  // leaving mid-cast: the cast is let go, earlier records stay
  await launchAt(p, 'fish.reedwake.current');
  await p.keyboard.press('Enter');
  await p.waitForSelector('.fish-panel [data-k=take]', { timeout: 9000 });
  await p.keyboard.press('Escape');
  await p.waitForFunction(() => !RB.ui.fishing.current(), null, { timeout: 8000 });
  const st2 = await state(p);
  assert(!st2.active && st2.catches === 1 && JSON.stringify(st2.obs) === JSON.stringify(st.obs), 'Escape mid-cast lets the cast go; nothing else changes');
  assert(!errors.length, 'errors ' + errors.join('; '));
  await ctx.close();
  // touch
  const t = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 });
  await start(t.p, { site: 'fish.reedwake.quiet', comp: 'suzu', pet: 'tanuki' });
  await launchAt(t.p, 'fish.reedwake.quiet');
  for (const k of ['cast']) await click(t.p, '.fish-panel [data-k=' + k + ']', { tap: true });
  await t.p.waitForSelector('.fish-panel [data-k=take]', { timeout: 9000 });
  await click(t.p, '.fish-panel [data-k=take]', { tap: true });
  await click(t.p, '.fish-panel [data-k=answer]', { tap: true });
  await t.p.waitForSelector('.chal');
  await shot(t.p, 'touch_task_390');
  await answer(t.p);
  await t.p.waitForSelector('.fish-panel [data-k=release]', { timeout: 12000 });
  await shot(t.p, 'touch_observe_390');
  await click(t.p, '.fish-panel [data-k=release]', { tap: true });
  await t.p.waitForSelector('.fish-panel [data-k=again]', { timeout: 12000 });
  assert((await state(t.p)).catches === 1, 'a catch by touch on a phone');
  assert(!t.errors.length, 'touch errors ' + t.errors.join('; '));
  await t.ctx.close();
});

await test('reduced motion: still poses and a brief dissolve; the same catch and records; Quiet chatter drops remarks', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { site: 'fish.reedwake.current', comp: 'nao', pet: 'dog', reduce: true, quiet: true });
  await launchAt(p, 'fish.reedwake.current');
  await p.waitForTimeout(600);
  const f0 = await p.evaluate(() => RB.ui.fishing.current().ui.stage.stats().frames);
  await p.waitForTimeout(1200);
  const f1 = await p.evaluate(() => RB.ui.fishing.current().ui.stage.stats().frames);
  assert(f1 - f0 <= 2, 'no continuous animation while nothing changes (' + (f1 - f0) + ' frames in 1.2 s)');
  const r = await oneCatch(p, { how: 'discover', shots: 'reduced_motion' });
  assert(r.after.catches === 1 && r.after.ms.indexOf('first') >= 0, 'the catch and its record are the same');
  const log = await p.evaluate(() => RB.ui.fishing.current().remarkLog || []);
  assert(!log.length && !r.obs.say, 'Quiet chatter: no remarks (' + JSON.stringify(log) + ')');
  await leave(p);
  assert(!errors.length, 'errors ' + errors.join('; '));
  await ctx.close();
});

console.log('\n' + results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
