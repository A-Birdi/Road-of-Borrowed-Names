// FR-1 (Foundations clarity): the opening as a new player meets it, in the built game, through the real interface.
// A fresh profile: New Game, the prologue skipped, creation with real clicks (Foundations, no kana, Demanding tactics,
// mistakes left at the default), "Before you set out", then Reedwake: the road lantern, Tsuru, the town requests in a
// chosen order, the report, the mill road, the gears, the loft lantern and the Mill Echo, played to its end.
// Every lesson page, question, conversation, choice and battle turn goes through the real UI (clicks, a drawn pen
// for handwriting). Travel between places uses the test's placement helper (RB.test.place/transition), never the
// answer-solving auto mode. Answers are chosen by this script from the task it was given (a scripted player, not a
// learner): once wrong on purpose where noted, otherwise right.
// Usage: node tools/build.mjs && node tests/e2e/fr1_opening.mjs [--tag after] [--input choice|hand] [--order ren,nao,mio,suzu,hana]
//          [--out <dir>] [--shots]   (screenshots and the action log go to <dir>)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { serve, launch, page } from './lib.mjs';

const A = process.argv.slice(2);
const opt = (k, d) => { const i = A.indexOf(k); return i >= 0 ? A[i + 1] : d; };
const TAG = opt('--tag', 'run');
const INPUT = opt('--input', 'choice');
const ORDER = opt('--order', 'ren,nao,mio,suzu,hana').split(',');
const OUT = opt('--out', path.join(os.tmpdir(), 'fr1-' + TAG));
const SHOTS = A.includes('--shots');
fs.mkdirSync(OUT, { recursive: true });
const log = [];
const note = (k, d) => { const e = Object.assign({ k, t: log.length }, d || {}); log.push(e); console.log('  ' + k + (d ? ' ' + JSON.stringify(d).slice(0, 300) : '')); };
let shotN = 0;
async function shot(p, name) {
  if (!SHOTS) return;
  const f = path.join(OUT, String(++shotN).padStart(2, '0') + '-' + name + '.jpg');
  await p.screenshot({ path: f, type: 'jpeg', quality: 72 });
  note('shot', { f: path.basename(f) });
}
const wait = (p, ms) => p.waitForTimeout(ms);

const { srv, url } = await serve();
const b = await launch();
const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
p.setDefaultTimeout(8000);
// spies, not game changes: which step a question was given, and every learning record made
await p.evaluate(() => {
  const rs = RB.challenge.runStep;
  window.__steps = [];
  RB.challenge.runStep = function (step, o) { window.__step = step; window.__steps.push({ kind: step.kind, item: step.item, answer: step.answer, prompt: step.prompt && step.prompt.en, copy: !!step.copy, single: !!step.single, template: step.template || null, title: step.title || null }); return rs.apply(this, arguments).then((r) => { window.__steps[window.__steps.length - 1].res = r && { ok: r.ok, assisted: r.assisted, guided: r.guided, mode: r.mode, mistakes: r.mistakes, help: r.help }; return r; }); };
  const rec = RB.learn.record;
  window.__recs = [];
  RB.learn.record = function (item, o) { window.__recs.push({ item, ok: o && o.ok, mode: o && o.mode, assisted: o && o.assisted, ev: o && o.ev, kind: o && o.kind }); return rec.apply(this, arguments); };
});

// ---- creation and "Before you set out" -------------------------------------------------------------------------------
await p.click('text=New Game');
await p.click('.slot[data-slot="1"] [data-a=start]');
await p.waitForSelector('text=Skip prologue');
await p.click('text=Skip prologue');
await p.click('.csheet button:has-text("Skip the prologue")');
await p.waitForSelector('.folio-create #nm');
await p.fill('.folio-create #nm', 'Aki');
const next = async () => { await p.click('.folio-foot .cr-primary:not([hidden])'); await wait(p, 300); };
await next();
await shot(p, 'creation-appearance');
const labels = await p.evaluate(() => Array.from(document.querySelectorAll('.cr-tile .nm, .cr-sw .nm')).filter((e) => e.offsetParent).map((e) => ({ t: e.textContent, w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height), lines: Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight || '16')) })).filter((x) => /Headband|Undyed|linen/i.test(x.t)));
note('appearance-labels', { labels });
await next();
await next();
const learnBefore = await p.evaluate(() => ({ step: document.querySelector('.folio-create').getAttribute('data-step'), fields: Array.from(document.querySelectorAll('.cr-learn fieldset[data-field]')).filter((f) => f.offsetParent).map((f) => f.getAttribute('data-field')), checked: Array.from(document.querySelectorAll('.cr-learn input:checked')).map((i) => i.dataset.k + '=' + i.dataset.v) }));
note('learning-step', learnBefore);
await shot(p, 'creation-learning');
// Demanding tactics, the answer mode for this run; mistakes left as they come
await p.evaluate((inp) => {
  const pick = (k, v) => { const i = document.querySelector('.cr-learn input[data-k="' + k + '"][data-v="' + v + '"]'); if (i) { i.closest('label').click(); return true; } return false; };
  const more = document.querySelector('.cr-learn details:not([open]) summary'); if (more) more.click();
  window.__picked = { hard: pick('difficulty', 'hard'), input: pick('input', inp) };
}, INPUT);
note('learning-picked', await p.evaluate(() => Object.assign({}, window.__picked, { checked: Array.from(document.querySelectorAll('.cr-learn input:checked')).map((i) => i.dataset.k + '=' + i.dataset.v) })));
await next();
await p.waitForSelector('.folio-review', { timeout: 15000 });
await wait(p, 400);
const review = await p.evaluate(() => ({ text: document.querySelector('.folio-review .spread').innerText.slice(0, 1600), fields: Array.from(document.querySelectorAll('.folio-review fieldset[data-field]')).map((f) => f.getAttribute('data-field')), learn: Object.assign({}, RB.ui.settings && RB.game.s ? {} : {}) }));
note('review', { fields: review.fields, chars: review.text.length });
await shot(p, 'before-you-set-out');
await p.click('.folio-review [data-review-go]');
await p.waitForFunction(() => !(RB.ui.settings.reviewing && RB.ui.settings.reviewing()), null, { timeout: 8000 });
const learn0 = await p.evaluate(() => { const L = RB.game.s.learn; return { profile: L.profile, assist: L.assist, difficulty: L.difficulty, kanaKnown: L.kanaKnown, input: RB.game.settings.input }; });
note('journey-made', learn0);

// ---- the player ---------------------------------------------------------------------------------------------------
const POLICY = { wrongOnce: new Set(), want: null };
let lessonN = 0;
async function answerChallenge(st) {
  const step = await p.evaluate(() => (RB.challenge.current && RB.challenge.current()) || window.__step);
  const wrong = POLICY.wrongOnce.has(st.title) || POLICY.wrongOnce.has(step.item) || (POLICY.wrongFirstPractice && /practice/i.test(st.title || ''));
  if (wrong) { POLICY.wrongOnce.delete(st.title); POLICY.wrongOnce.delete(step.item); POLICY.wrongFirstPractice = false; }
  const plain = await p.evaluate((a) => (Array.isArray(a) ? a.map((x) => RB.tasks.plain(x)) : RB.tasks.plain(a || '')), step.answer);
  const kind = step.kind;
  note('question', { title: st.title, kind, item: step.item, answer: plain, prompt: step.prompt && step.prompt.en, copy: !!step.copy, template: step.template });
  if (st.firstShot) await shot(p, 'q-' + String([].concat(step.item || kind)[0]).replace(/[^\w]+/g, '_'));
  if (kind === 'order') {
    for (const piece of plain) {
      await p.evaluate((pc) => { const t = Array.from(document.querySelectorAll('.chal .tiles .tile')).find((x) => RB.tasks.plain(x.textContent).replace(/\(.*?\)/g, '').replace(/\s+/g, '') === pc.replace(/=.*$/, '').replace(/\(.*?\)/g, '').replace(/\s+/g, '')); if (t) t.click(); else window.__miss = pc; }, piece);
      await wait(p, 120);
    }
    await p.click('.chal [data-a=submit]');
  } else if (kind === 'choose' || kind === 'listen') {
    const ok = await p.evaluate(() => { const s = (RB.challenge.current && RB.challenge.current()) || window.__step; const o = s.options.find((x) => x.ok); return o.en || RB.tasks.plain(o.jp || ''); });
    await p.evaluate(([ok, wrong]) => { const bs = Array.from(document.querySelectorAll('.chal .mc .btn')); const b2 = wrong ? bs.find((x) => !x.textContent.includes(ok)) : bs.find((x) => x.textContent.replace(/\s+/g, '').includes(ok.replace(/\s+/g, ''))); (b2 || bs[0]).click(); }, [ok, wrong]);
  } else {
    // write: in the chosen mode (choices or the pen)
    const mode = await p.evaluate(() => { const t = document.querySelector('.chal .ptab[aria-selected="true"]'); return t ? t.getAttribute('data-id') : null; });
    if (INPUT === 'choice' && mode !== 'choice') { await p.click('.chal .ptab[data-id="choice"]'); await wait(p, 200); }
    if (INPUT === 'hand' && mode !== 'hand') { await p.click('.chal .ptab[data-id="hand"]'); await wait(p, 200); }
    const target = typeof plain === 'string' ? plain : plain.join('');
    if (INPUT === 'choice') {
      if (wrong) {
        await p.evaluate((ans) => { const bs = Array.from(document.querySelectorAll('.chal .mc .btn')); const w = bs.find((x) => RB.tasks.plain(x.textContent).trim() !== ans); if (w) w.click(); }, target);
        await wait(p, 350);
        const fb = await p.evaluate(() => { const f = document.querySelector('.chal .fbwrap'); return f ? f.innerText : null; });
        note('feedback-wrong', { fb, options: await p.evaluate(() => Array.from(document.querySelectorAll('.chal .mc .btn')).map((x) => x.textContent.trim())) });
        await shot(p, 'feedback-wrong');
        const again = await p.$('.chal .fbwrap .fb-go, .chal [data-a=retry]');
        if (again) await again.click().catch(() => {});
        await wait(p, 200);
      }
      const opts = await p.evaluate(() => Array.from(document.querySelectorAll('.chal .mc .btn')).map((x) => x.textContent.trim()));
      note('options', { opts });
      await p.evaluate((ans) => { const bs = Array.from(document.querySelectorAll('.chal .mc .btn')).filter((x) => !x.disabled); const r = bs.find((x) => RB.tasks.plain(x.textContent).trim() === ans); (r || bs[0]).click(); }, target);
    } else {
      for (const ch of Array.from(target)) {
        await drawChar(ch);
        await wait(p, 250);
        if (POLICY.submitBeforeConfirm) {
          POLICY.submitBeforeConfirm = false;
          await p.click('.chal [data-a=submit]').catch(() => {});
          await wait(p, 300);
          const warn = await p.evaluate(() => { const f = document.querySelector('.chal .fbwrap, .chal .pad-warn, .chal [role=alert]'); return f ? f.innerText : document.querySelector('.chal').innerText.slice(0, 400); });
          note('submit-before-confirm', { warn, buttons: await p.evaluate(() => Array.from(document.querySelectorAll('.chal button')).filter((x) => x.offsetParent).map((x) => x.textContent.trim()).filter(Boolean)) });
          await shot(p, 'submit-before-confirm');
        }
        await p.click('.chal [data-a=confirm]');
        await wait(p, 200);
      }
      await p.click('.chal [data-a=submit]');
    }
  }
  await wait(p, 400);
  const res = await p.evaluate(() => { const f = document.querySelector('.chal .fbwrap'); return f ? { fb: f.getAttribute('data-fb'), text: f.innerText.slice(0, 300) } : null; });
  note('answered', res);
  if (res && res.fb === 'ok') {
    if (st.firstShot) await shot(p, 'ok-' + String([].concat(step.item || kind)[0]).replace(/[^\w]+/g, '_'));
    await p.click('.chal .fbwrap .fb-go');
  } else {
    // not right: one more go with the right answer (the script's own mistakes are not the learner's)
    const go = await p.$('.chal .fbwrap .fb-go'); if (go) await go.click().catch(() => {});
  }
  await wait(p, 250);
}
async function drawChar(ch) {
  const box = await p.evaluate(() => { const r = document.querySelector('.chal .pad-ink').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const strokes = await p.evaluate((ch) => { const ref = RB.recog.reference(ch); return ref.strokes.map((s) => s.map((q) => ({ x: (q.x / ref.box) * 0.8 + 0.1, y: (q.y / ref.box) * 0.8 + 0.1 }))); }, ch);
  for (const s of strokes) {
    await p.mouse.move(box.x + s[0].x * box.w, box.y + s[0].y * box.h);
    await p.mouse.down();
    for (const q of s.slice(1)) await p.mouse.move(box.x + q.x * box.w, box.y + q.y * box.h, { steps: 2 });
    await p.mouse.up();
    await wait(p, 50);
  }
}
const STATE = () => p.evaluate(() => {
  const vis = (s) => { const e = document.querySelector(s); return !!(e && e.offsetParent); };
  const top = RB.ui.topLayer && RB.ui.topLayer();
  return {
    mode: RB.game.mode(), running: RB.script.isRunning(), top: top && top.name,
    lesson: vis('.lesson [data-a=next]'), lessonTitle: (document.querySelector('.lesson .folio-head h2, .folio-head h2') || {}).textContent || '',
    chal: vis('.chal'), chalTitle: (document.querySelector('.chal .chal-title') || {}).textContent || '',
    choices: vis('.choices:not(.hidden) .choice') ? Array.from(document.querySelectorAll('.choices .choice')).map((x) => x.textContent.trim()) : null,
    dlg: RB.ui.dialogue.isOpen(), next: vis('.dlg .b-next'),
    letters: vis('.recips [data-to]'), cards: vis('.rcard[data-i]'), busy: RB.battleSeq ? RB.battleSeq.busy() : false,
    go: vis('[data-review-go]'), toastGo: vis('.toast .go, .cardsheet .go, .folio-card .go'),
  };
});
const seenQ = new Set();
async function drive(until, maxMs, label) {
  const t0 = Date.now();
  let idleN = 0;
  while (Date.now() - t0 < (maxMs || 120000)) {
    const st = await STATE();
    if (st.lesson) {
      lessonN++;
      const kana = await p.evaluate(() => Array.from(document.querySelectorAll('.lesson-row li')).map((x) => x.textContent).join(''));
      note('lesson', { n: lessonN, title: st.lessonTitle, kana });
      await shot(p, 'lesson-' + lessonN);
      for (let i = 0; i < 12; i++) { const ok = await p.$('.lesson [data-a=next]'); if (!ok) break; await ok.click(); await wait(p, 160); }
      continue;
    }
    if (st.top === 'teach') {
      note('teach', { title: st.lessonTitle, text: await p.evaluate(() => { const l = Array.from(document.querySelectorAll('.leaf')).pop(); return l ? l.innerText.slice(0, 400) : null; }) });
      await shot(p, 'teach-' + (++lessonN));
      await p.evaluate(() => { const b = Array.from(document.querySelectorAll('.folio-foot [data-ok]')).filter((x) => x.offsetParent).pop(); if (b) b.click(); });
      await wait(p, 250);
      continue;
    }
    if (st.chal) { const key = st.chalTitle + '|' + (await p.evaluate(() => window.__steps.length)); const first = !seenQ.has(st.chalTitle); seenQ.add(st.chalTitle); await answerChallenge({ title: st.chalTitle, firstShot: first }); continue; }
    if (st.letters) { await deliverLetter(); continue; }
    if (st.cards && !st.busy) { await battleTurn(); continue; }
    if (st.choices) {
      const i = POLICY.want ? Math.max(0, st.choices.findIndex((c) => POLICY.want.test(c))) : 0;
      note('choice', { options: st.choices, picked: st.choices[i] });
      await p.locator('.choices .choice').nth(i).click();
      await wait(p, 250);
      continue;
    }
    if (st.dlg && st.next) { await p.click('.dlg .b-next', { timeout: 1500 }).catch(() => p.evaluate(() => RB.ui.dialogue.advance(true))); await wait(p, 90); continue; }
    if (st.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await wait(p, 90); continue; }
    if (st.toastGo) { await p.evaluate(() => { const e = document.querySelector('.toast .go, .cardsheet .go, .folio-card .go'); if (e) e.click(); }); await wait(p, 150); continue; }
    if (until(st)) { if (++idleN > 3) return st; } else idleN = 0;
    await wait(p, 120);
  }
  note('drive-timeout', { label, st: await STATE() });
  throw new Error('drive timeout: ' + label);
}
const worldIdle = (st) => !st.running && st.mode === 'world';
async function deliverLetter() {
  const to = await p.evaluate(() => {
    const a = RB.content.activities['rw.a_letters'];
    const jp = RB.tasks.plain(document.querySelector('.letter .letter-jp').textContent).replace(/\s+/g, '');
    const L = a.letters.find((x) => Object.values(x.text).some((t) => RB.tasks.plain(RB.jp.plain(t.jp)).replace(/\s+/g, '') === jp));
    return L ? L.to : null;
  });
  const en = await p.evaluate(() => { const e = document.querySelector('.letter .act-en'); return e ? e.textContent : null; });
  note('letter', { to, englishShown: !!en });
  if (!seenQ.has('letters')) { seenQ.add('letters'); await shot(p, 'letters'); }
  await p.click('.recips [data-to="' + to + '"]');
  await wait(p, 250);
  await p.click('[data-next]');
  await wait(p, 250);
}
let turn = 0;
async function battleTurn() {
  const st = await p.evaluate(() => { const s = RB.combat.state(); const it = s && s.intent; return s ? { intent: it && it.kind, pow: it && it.pow, knots: s.knots, pc: s.pc, phase: s.phase || null, cards: Array.from(document.querySelectorAll('.rcard[data-i]')).map((c) => c.textContent.replace(/\s+/g, ' ').trim().slice(0, 90)) } : null; });
  turn++;
  note('battle-turn', Object.assign({ turn }, st));
  if (turn === 1 || turn === 7) await shot(p, 'battle-turn-' + turn);
  const want = st && /strike|heavy|attack/i.test(st.intent || '') ? /protect/i : st && st.intent === 'mirror' ? /truth|unravel/i : /unravel/i;
  const i = await p.evaluate((src) => { const re = new RegExp(src, 'i'); const cs = Array.from(document.querySelectorAll('.rcard[data-i]')); const c = cs.find((x) => re.test(x.textContent)) || cs.find((x) => /unravel/i.test(x.textContent)) || cs[0]; return c.getAttribute('data-i'); }, want.source);
  await p.click('.rcard[data-i="' + i + '"]');
  await wait(p, 300);
}
// where the player stands to use a thing, then the real interact key
async function use(fn) { await p.evaluate(fn); await p.evaluate(() => RB.world.interact()); await wait(p, 200); }
const talk = (id) => use(new Function('return (function(){ const n = RB.world.W.npcs.find((a) => a.id === ' + JSON.stringify(id) + '); const W = RB.world.W; for (const [dx, dy, dir] of [[0,1,"up"],[-1,0,"right"],[1,0,"left"],[0,-1,"down"]]) { const x = n.x + dx, y = n.y + dy; if (!RB.maps.blockedStatic(W.map, x, y) && !W.npcs.some((m) => m.x === x && m.y === y)) { RB.test.place(x, y, dir); return; } } })()'));
const at = (x, y) => use(new Function('return (function(){ const W = RB.world.W; const pr = W.map.props.find((q) => q.x === ' + x + ' && q.y === ' + y + '); const pd = pr ? (RB.props.P[pr.p] || {}) : {}; const w = (pr && (pr.w || pd.w)) || 1, h = (pr && (pr.h || pd.h)) || 1; for (let yy = ' + y + '; yy < ' + y + ' + h; yy++) for (let xx = ' + x + '; xx < ' + x + ' + w; xx++) for (const [dx, dy, dir] of [[0,1,"up"],[-1,0,"right"],[1,0,"left"],[0,-1,"down"]]) { const nx = xx + dx, ny = yy + dy; if (!RB.maps.blockedStatic(W.map, nx, ny) && !W.npcs.some((m) => m.x === nx && m.y === ny)) { RB.test.place(nx, ny, dir); return; } } })()'));
const go = async (map, x, y, dir) => { await p.evaluate(([m, x, y, d]) => RB.game.transition(m, x, y, d), [map, x, y, dir || 'down']); await drive(worldIdle, 30000, 'go ' + map); };
async function journal(name) {
  await p.evaluate(() => RB.ui.menu.open('journal'));
  await wait(p, 500);
  const j = await p.evaluate(() => { const sp = document.querySelector('.spread'); return sp ? sp.innerText.slice(0, 900) : null; });
  note('journal', { at: name, text: j });
  await shot(p, 'journal-' + name);
  await p.evaluate(() => RB.ui.menu.close());
  await wait(p, 300);
}

// ---- the route ----------------------------------------------------------------------------------------------------
try {
  await drive(worldIdle, 60000, 'arrival');
  await shot(p, 'arrival');
  await journal('arrival');
  POLICY.wrongFirstPractice = true; // one wrong answer in the first practice, to see the feedback a slip gets
  await at(14, 8);
  await drive(worldIdle, 120000, 'road lantern');
  note('after-lantern', await p.evaluate(() => ({ lit: !!RB.game.s.flags.rw_road_lit, taught: Object.keys(RB.game.s.learn.taught || {}).join(''), pc: RB.game.s.resolve && RB.game.s.resolve.pc })));
  await p.evaluate(() => RB.test.place(30, 9, 'right'));
  await p.evaluate(() => { RB.world.W.player.dir = 'right'; RB.world._tryMove('right'); });
  await drive(worldIdle, 30000, 'to the village');
  await journal('village-before-tsuru');
  await talk('tsuru');
  await drive(worldIdle, 60000, 'tsuru');
  await journal('after-tsuru');
  const doReq = {
    ren: async () => { await go('rw.village', 30, 20, 'up'); await talk('ren'); await drive(worldIdle, 90000, 'ren'); await at(20, 22); await drive(worldIdle, 60000, 'lantern s'); await at(32, 18); await drive(worldIdle, 60000, 'lantern b'); },
    nao: async () => { await go('rw.warehouse', 5, 6, 'up'); await talk('nao'); await drive(worldIdle, 120000, 'nao'); },
    mio: async () => { await go('rw.apoth', 4, 6, 'up'); await talk('mio'); await drive(worldIdle, 120000, 'mio'); },
    suzu: async () => { await go('rw.village', 30, 20, 'up'); await talk('suzu'); await drive(worldIdle, 60000, 'suzu'); },
    hana: async () => { await go('rw.tea', 4, 6, 'up'); await talk('hana'); await drive(worldIdle, 60000, 'hana'); },
  };
  for (const who of ORDER) { await doReq[who](); note('request-done', { who, flags: await p.evaluate(() => Object.keys(RB.game.s.flags).filter((f) => /^rw_/.test(f)).join(' ')) }); }
  await go('rw.village', 22, 17, 'up');
  await journal('requests-done');
  await talk('tsuru');
  await drive(worldIdle, 90000, 'report');
  await journal('after-report');
  await go('rw.millroad', 10, 24, 'up');
  await talk('mio'); await drive(worldIdle, 60000, 'mr mio');
  await at(7, 17); await drive(worldIdle, 90000, 'mr lantern');
  POLICY.want = /clear/i; await talk('nao'); await drive(worldIdle, 60000, 'mr nao'); POLICY.want = null;
  await talk('suzu'); await drive(worldIdle, 60000, 'mr suzu');
  await go('rw.mill1', 7, 10, 'up');
  await at(10, 2); await drive(worldIdle, 120000, 'gears');
  await at(2, 2); await drive(worldIdle, 30000, 'ladder');
  for (const [x, y] of [[4, 4], [9, 3], [9, 6], [11, 7]]) { await at(x, y); await drive(worldIdle, 30000, 'loft ' + x + ',' + y); }
  if (INPUT === 'hand') POLICY.submitBeforeConfirm = true;
  await at(6, 2); await drive(worldIdle, 120000, 'loft lantern');
  await go('rw.mill1', 7, 8, 'up');
  await p.evaluate(() => { RB.test.place(6, 7, 'up'); RB.script.run('rw.m1_boss'); });
  await wait(p, 300);
  await drive((st) => worldIdle(st) && !st.cards, 300000, 'mill echo');
  const after = await p.evaluate(() => { const s = RB.game.s; return { echo: !!s.flags.rw_echo_done, pc: s.resolve && s.resolve.pc, taught: Object.keys(s.learn.taught || {}).join(''), group: s.learn.kanaGroup }; });
  note('after-boss', after);
  await shot(p, 'after-boss');
} catch (e) {
  note('error', { e: String(e && e.message || e) });
  await shot(p, 'error');
}
const steps = await p.evaluate(() => window.__steps);
const recs = await p.evaluate(() => window.__recs);
fs.writeFileSync(path.join(OUT, 'log.json'), JSON.stringify({ tag: TAG, input: INPUT, order: ORDER, learn0, log, steps, recs, errors }, null, 1));
console.log('fr1_opening ' + TAG + ': ' + log.filter((x) => x.k === 'question').length + ' questions, ' + log.filter((x) => x.k === 'lesson').length + ' lessons, ' + turn + ' battle turns; errors: ' + errors.length + '; log ' + path.join(OUT, 'log.json'));
await b.close();
srv.close();
process.exit(log.some((x) => x.k === 'error') ? 1 : 0);
