// Companion shiritori in the built index.html (Practice addendum §9–§14, §20, §23.4–§23.5):
// synthetic campaigns in fresh browser contexts; the TEST-ONLY fixture bank
// (tests/e2e/wordplay_fixture.mjs) registered by the test as the band it needs — the game
// itself ships no fixture. Everything below is driven by real clicks, typing and pointer
// strokes on the pad (strokes follow KanjiVG references, so they are synthetic, not a
// human's handwriting):
//   - at the Cinder Orchard inn, talking to the companion: Just chat stays first, Play
//     shiritori comes after the existing choices; the preparation sheet's defaults; the
//     demonstration; a full competitive game entered by handwriting, typing and choosing;
//   - an IME Enter during composition plays nothing; a recognised character is not a move;
//     an invalid draft is explained and the turn kept (outside the bank, wrong kana);
//   - the ん warning (focus on Edit; Play anyway commits the loss);
//   - concession versus a real restrictive ending (no playable continuation in the bank);
//   - a cooperative chain; How we played once (rest menu), and never again;
//   - a pending story topic left exactly as it was; Company › Wordplay: Play, the folio
//     closes and comes back to the same page and scroll, focus on the card; Play disabled
//     with a truthful reason elsewhere; Ways to practise;
//   - a different campaign loaded while the table is open: the old session is gone;
//   - keyboard-only and touch play.
// Usage: node tests/e2e/wordplay.mjs [--shots]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { fixtureDef, FIXTURE_ENTRIES } from './wordplay_fixture.mjs';

const OUT = path.join(root, 'tests/e2e/out/wordplay');
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let fail = 0, pass = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else { pass++; console.log('ok   ' + m); } };
const shot = (p, name) => p.screenshot({ path: path.join(OUT, name + '.png') });
// --only=table,company,nothere,keyboard,touch runs some sections (all by default)
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const want = (name) => !ONLY.length || ONLY.includes(name);

// ---- page helpers ------------------------------------------------------------------------------------------
async function helpers(p) {
  await p.evaluate(() => {
    window.__wait = (ms) => new Promise((r) => setTimeout(r, ms));
    // a synthetic campaign on a rest map, arrival scenes already seen
    window.__start = (map, x, y, o) => {
      const d = RB.content.maps[map] || {};
      const seen = {};
      for (const ev of d.onEnter || []) seen['enter:' + map + ':' + ev.scene] = true;
      const s = RB.game.debugStart(map, x, y, { comp: o.comp === undefined ? 'nao' : o.comp, flags: Object.assign({ departed: !!o.comp || o.comp === undefined, ch1_done: true }, seen, o.flags || {}) });
      s.chapter = o.chapter || 2;
      RB.company.sync(s, 'live');
      RB.company.refresh(s);
      return s.id;
    };
    window.__wp = () => {
      const s = RB.game.s, sh = s && s.practice && s.practice.shiritori;
      const a = sh && sh.active;
      const r = sh && sh.byCompanion[s.comp];
      return {
        active: a ? { next: a.st.next, req: a.st.required, n: a.st.history.length, over: a.st.over, cpu: !!a.cpuMove, flags: a.flags, first: a.first, format: a.format, starter: a.starter, susp: a.susp } : null,
        recent: r ? r.recent.map((t) => ({ id: t.id, result: t.result, support: t.support, moves: t.moves.length })) : [],
        stages: r ? Object.keys(r.stages).filter((k) => r.stages[k].first) : [],
        played: r ? Object.keys(r.stages) : [],
        coop: r ? r.cooperative : null, reflection: r ? r.reflection : null, together: r ? r.together : null,
        bond: Object.keys(s.company.bond).filter((k) => k.startsWith('activity:')), score: RB.company.score(s),
        mode: RB.game.mode(), activity: !!RB.activity.active(), menu: RB.ui.menu.isOpen(), pending: s.company.talk._pending || null,
        mems: s.company.memories.filter((m) => m.id.startsWith('wordplay:')).map((m) => m.id),
      };
    };
    // the test player's decision: a word that leaves the companion no reply when there is one
    // (a real trap), otherwise the first safe word by reading; `avoid` keeps some words out
    window.__pick = (o) => {
      o = o || {};
      const L = RB.wordplay.live(RB.game.s), a = L.active, bk = L.bank;
      const safe = RB.shiritori.safeReplies(a.st, bk).filter((e) => !(o.avoid || []).includes(e.entry)).filter((e) => !o.plain || /^[ぁ-ゖ]+$/.test(e.reading) && !/[ぁぃぅぇぉっゃゅょゎ]/.test(e.reading));
      const sorted = safe.slice().sort((x, y) => (x.reading < y.reading ? -1 : 1));
      const isTrap = (e) => { const u = Object.assign({}, a.st.used); u[e.group] = true; return !(bk.byHead[e.tail] || []).some((x) => !u[x.group] && !x.terminal); };
      const trap = sorted.find(isTrap);
      // notrap: keep the game open — the word whose ending leaves the most replies
      const open = (e) => { const u = Object.assign({}, a.st.used); u[e.group] = true; return (bk.byHead[e.tail] || []).filter((x) => !u[x.group] && !x.terminal).length; };
      const e = (o.win && trap) || (o.notrap && sorted.slice().sort((x, y) => open(y) - open(x))[0]) || sorted[0];
      return e ? { id: e.entry, reading: e.reading, form: bk.entryById[e.entry].forms[0], tail: e.tail } : null;
    };
    // TEST-ONLY opponent for the scripted checks: the safe word that leaves the player the most
    // safe replies (deterministic, keeps the game open). The real provisional opponent plays the
    // full games; this wrapper is removed again with __opponent(false).
    window.__real = window.__real || RB.shiritori.chooseMove;
    window.__opponent = (friendly) => {
      if (!friendly) { RB.shiritori.chooseMove = window.__real; return; }
      RB.shiritori.chooseMove = async (state, bk) => {
        const safe = RB.shiritori.safeReplies(state, bk);
        const score = (e) => { const u = Object.assign({}, state.used); u[e.group] = true; return (bk.byHead[e.tail] || []).filter((x) => !u[x.group] && !x.terminal).length; };
        const e = safe.slice().sort((x, y) => score(y) - score(x) || (x.id < y.id ? -1 : 1))[0] || null;
        return { edge: e, level: 'test', depth: 0, exact: false, nodes: 0, fallback: false, provisional: true };
      };
    };
    // a word for the required kana that ends in ん, if the bank has one unused
    window.__nword = () => {
      const L = RB.wordplay.live(RB.game.s), a = L.active, bk = L.bank;
      const e = RB.shiritori.legalEdges(a.st, bk).find((x) => x.terminal);
      return e ? e.reading : null;
    };
  });
}
async function newPage(o) {
  const pg = await page(b, url, o || { viewport: { width: 1280, height: 800 } });
  await helpers(pg.p);
  return pg;
}
const reg = (p, id, o) => p.evaluate(([def]) => { RB.shiritori.addBank(def); }, [fixtureDef(id, o)]);
const st = (p) => p.evaluate(() => window.__wp());
const until = async (p, fn, arg, ms) => { const t0 = Date.now(); for (;;) { if (await p.evaluate(fn, arg)) return true; if (Date.now() - t0 > (ms || 6000)) return false; await p.waitForTimeout(40); } };
// play a dialogue: click the reply matching `pick` (a RegExp source), Next otherwise
async function talk(p, picks) {
  picks = [].concat(picks || []);
  const seen = [];
  for (let i = 0; i < 60; i++) {
    const s = await p.evaluate(() => ({ choices: Array.from(document.querySelectorAll('.choices:not(.hidden) .choice')).map((c) => c.textContent.replace(/\s+/g, ' ').trim()), dlg: !!document.querySelector('.dlg:not(.hidden)'), running: RB.script.isRunning(), line: (document.querySelector('.dlg:not(.hidden) .main') || {}).textContent || '' }));
    if (s.choices.length) {
      seen.push(s.choices.map((c, k) => k + ':' + c).join(' | '));
      if (!picks.length) return { seen, choices: s.choices };
      const want = picks.shift();
      const idx = s.choices.findIndex((c) => new RegExp(want, 'i').test(c));
      if (idx < 0) throw new Error('no choice ' + want + ' in ' + JSON.stringify(s.choices));
      await p.waitForTimeout(180);
      await p.locator('.choices .choice').nth(idx).click();
      await p.waitForTimeout(120);
      continue;
    }
    if (s.dlg) { seen.push(s.line.slice(0, 120)); await p.locator('.dlg .b-next').click(); await p.waitForTimeout(90); continue; }
    if (!s.running) return { seen };
    await p.waitForTimeout(80);
  }
  throw new Error('dialogue did not finish: ' + seen.slice(-3).join(' / '));
}
const clickWp = (p, act) => p.locator('.wp-leaf [data-wp="' + act + '"]').first().click();
async function waitTurn(p) { return until(p, () => { const a = window.__wp().active; return !a || (a.next === 'pc' && !document.querySelector('[data-wp=play]').disabled) || !!document.querySelector('.wp-result') || (a.next === 'pc' && !!document.querySelector('.wp-turn b')); }, null, 8000); }
// ---- the three ways to enter a word -------------------------------------------------------------------------
async function typeWord(p, word) {
  await p.locator('[data-wp-tab="ime"]').click();
  const inp = p.locator('#wp-ime');
  await inp.fill(word);
  await p.waitForTimeout(60);
}
async function chooseWord(p, id) {
  await p.locator('[data-wp-tab="select"]').click();
  await p.waitForTimeout(60);
  const btn = p.locator('[data-wp-pick="' + id + '"]');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await p.waitForTimeout(60);
}
// pointer strokes along each kana's KanjiVG reference (synthetic), Confirm per character;
// a misread is repaired with "That is not what I wrote" and the reading the player meant
async function writeWord(p, word) {
  await p.locator('[data-wp-tab="hand"]').click();
  await p.waitForTimeout(120);
  const log = { repaired: 0 };
  for (const ch of Array.from(word)) {
    const ink = p.locator('.wp-pane .pad-ink');
    await ink.scrollIntoViewIfNeeded();
    const box = await ink.boundingBox();
    const strokes = await p.evaluate((c) => { const r = RB.recog.reference(c); return r.strokes.map((st) => st.map((q) => [q.x / r.box, q.y / r.box])); }, ch);
    for (const st0 of strokes) {
      const pts = st0.map(([x, y]) => [box.x + (0.1 + 0.8 * x) * box.width, box.y + (0.1 + 0.8 * y) * box.height]);
      await p.mouse.move(pts[0][0], pts[0][1]);
      await p.mouse.down();
      for (const q of pts.slice(1)) await p.mouse.move(q[0], q[1], { steps: 2 });
      await p.mouse.up();
      await p.waitForTimeout(30);
    }
    await p.waitForTimeout(320);
    const read = await p.evaluate(() => { const big = document.querySelector('.wp-pane .readas .big'); return big ? big.textContent.trim().charAt(0) : ''; });
    if (read !== ch) {
      // the reader saw something else: tell it, then pick what was written from its other readings
      await p.locator('[data-wp="notwrote"]').click();
      await p.waitForTimeout(80);
      const cand = p.locator('.wp-pane .cands .cand', { hasText: ch }).first();
      if (await cand.count()) { await cand.click(); log.repaired++; }
      else { await p.locator('.wp-pane [data-a="clear"]').click(); return Object.assign(log, { failed: ch, read }); }
    }
    await p.locator('.wp-pane [data-a="confirm"]').click();
    await p.waitForTimeout(80);
  }
  return log;
}
async function playWord(p) { await p.locator('.wp-leaf [data-wp="play"]').click(); await p.waitForTimeout(80); }
// one player turn by a given input route; returns what was played
async function turn(p, how, o) {
  const w = await p.evaluate((o) => window.__pick(o), Object.assign({ plain: how === 'hand' }, o || {}));
  if (!w) return null;
  const before = (await st(p)).active.n;
  let log = null;
  if (how === 'hand') {
    log = await writeWord(p, w.reading);
    if (log.failed) { await typeWord(p, w.reading); how = 'ime(after a handwriting miss)'; }
  } else if (how === 'select') await chooseWord(p, w.id);
  else await typeWord(p, w.form);
  // a form with two approved readings (工場) asks which reading: choose the one meant
  if (await p.locator('.wp-dpick [data-wp-reading]').count()) { await p.locator('.wp-dpick [data-wp-reading="' + w.reading + '"]').click(); await p.waitForTimeout(60); }
  if (how === 'ime') await p.locator('#wp-ime').press('Enter');
  else await playWord(p);
  await until(p, (n) => { const a = window.__wp().active; return !a || a.n > n; }, before, 4000);
  return Object.assign({ how, log }, w);
}
async function toTable(p) {
  // from the preparation sheet (demo already seen or skipped) to the table
  await p.waitForSelector('.wp-prep [data-wp="start"]:not([disabled])');
  await clickWp(p, 'start');
  const offer = await until(p, () => !!document.querySelector('.wp-demo-offer') || !!document.querySelector('.wp-table'), null, 4000);
  if (await p.evaluate(() => !!document.querySelector('.wp-demo-offer'))) { await clickWp(p, 'skip'); }
  await p.waitForSelector('.wp-table');
  await p.waitForTimeout(150);
  return offer;
}
async function openFromRest(p) {
  await p.evaluate(() => RB.game.companionTalk());
  await p.waitForTimeout(200);
  const r = await talk(p, []);
  return r.choices || [];
}
async function finishGame(p, plan, o) {
  o = o || {};
  const played = [];
  if (o.friendlyUntil) await p.evaluate(() => window.__opponent(true));
  const cap = o.maxMoves || 10;
  for (let k = 0; k < 40; k++) {
    if (o.friendlyUntil && played.length >= o.friendlyUntil) await p.evaluate(() => window.__opponent(false));
    await waitTurn(p);
    if (await p.evaluate(() => !!document.querySelector('.wp-result'))) break;
    const a = (await st(p)).active;
    if (!a) break;
    if (played.length >= cap) {
      // a long game (the fixture is roomy): end it through the table, as a player would
      if (a.format === 'cooperative') { await p.locator('[data-wp="stuck"]').click(); await clickWp(p, 'endchain'); }
      else { await p.locator('[data-wp="stuck"]').click(); await clickWp(p, 'concede'); await p.waitForSelector('.csheet'); await p.locator('.csheet .pbtn', { hasText: 'Concede' }).click(); }
      break;
    }
    const how = plan[played.length % plan.length];
    // the test player keeps the game open while asked to, then takes a real trap when one exists
    const early = o.keepOpen || (o.friendlyUntil && played.length < o.friendlyUntil);
    const r = await turn(p, how.via || how, Object.assign({}, how.o, early ? { notrap: true } : { win: true }));
    if (!r) break;
    played.push(r);
  }
  await p.waitForSelector('.wp-result', { timeout: 15000 });
  return played;
}

// =========================================================================================== 1280×800
if (want('table')) {
  const { p, errors, requests } = await newPage();
  await reg(p, 'pocket');
  await p.evaluate(() => window.__start('co.inn', 6, 8, { comp: 'nao' }));
  await p.waitForTimeout(300);

  // ---- the rest menu: Just chat first, Play shiritori after the existing choices ---------------------------
  let choices = await openFromRest(p);
  const iChat = choices.findIndex((c) => /Just chat/.test(c)), iPlay = choices.findIndex((c) => /Play shiritori/.test(c)), iNot = choices.findIndex((c) => /Not now/.test(c));
  assert(iChat === 0 && iPlay > 0 && iNot === choices.length - 1 && iPlay < iNot, 'at an inn: Just chat is still first; Play shiritori comes after the existing choices (' + choices.join(' | ') + ')');
  await talk(p, ['Play shiritori']);
  await p.waitForSelector('.wp-prep');
  let s0 = await st(p);
  assert(s0.activity && s0.mode === 'activity' && !s0.menu, 'the activity owns the screen (mode activity; the world is paused)');
  const defaults = await p.evaluate(() => ['format', 'band', 'level', 'support'].map((n) => (document.querySelector('input[name="' + n + '"]:checked') || {}).value));
  assert(JSON.stringify(defaults) === '["competitive","pocket","casual","open"]', 'defaults: Competitive, Pocket words, Casual, Open-book (' + defaults.join(',') + ')');
  const invite = await p.evaluate(() => document.querySelector('.wp-prep .wp-say') && document.querySelector('.wp-prep .wp-say').textContent);
  assert(/how about shiritori/.test(invite || ''), 'the first invitation is Nao\'s own line');
  const prov = await p.evaluate(() => !!document.querySelector('.wp-prov'));
  assert(prov === /^provisional/.test(await p.evaluate(() => RB.wordplay.strategyVersion())), 'a provisional opponent is said so on the sheet when it is provisional');
  await shot(p, 'prep_1280x800');
  // ---- first time: the demonstration, then the table
  await clickWp(p, 'start');
  await p.waitForSelector('.wp-demo-offer');
  await clickWp(p, 'demo');
  await p.waitForSelector('.wp-demo');
  const demo = await p.evaluate(() => document.querySelector('.wp-demo').textContent);
  assert(/The starter:/.test(demo) && /Play word/.test(demo), 'the demonstration walks a real opening from the bank');
  await clickWp(p, 'go');
  await p.waitForSelector('.wp-table');
  await p.waitForTimeout(200);
  s0 = await st(p);
  assert(s0.active && s0.active.first === 'pc' && s0.active.n === 1, 'the table: a certified starter is out and you respond first');
  const ui = await p.evaluate(() => ({ req: document.querySelector('.wp-req').textContent, turn: document.querySelector('.wp-turn').textContent, chain: document.querySelectorAll('.wp-chain li').length, furi: !!document.querySelector('.wp-chain li rt') || !/[一-鿿]/.test(document.querySelector('.wp-chain').textContent.replace(/<rt>.*?<\/rt>/g, '')) }));
  assert(/Next word begins with/.test(ui.req) && /Your turn/.test(ui.turn) && ui.chain === 1 && ui.furi, 'the required kana, whose turn, and the chain with readings (furigana on its kanji)');
  await shot(p, 'table_nao_1280x800');
  await p.evaluate(() => window.__opponent(true)); // the scripted checks below need the game to stay open

  // ---- an invalid draft is explained and the turn kept ----------------------------------------------------------
  await typeWord(p, 'ぞう');
  let msg = await p.evaluate(() => document.querySelector('.wp-dmsg').textContent);
  assert(/outside this match's word bank/.test(msg) && !/not Japanese/i.test(msg), 'a real word outside the bank: "outside this match\'s word bank", never "not Japanese"');
  await p.locator('#wp-ime').press('Enter');
  await p.waitForTimeout(200);
  assert((await st(p)).active.n === 1 && (await st(p)).active.next === 'pc', 'pressing Play on it plays nothing; the turn is kept');
  const wrong = await p.evaluate(() => { const L = RB.wordplay.live(RB.game.s); const e = L.bank.edges.find((x) => x.head !== L.active.st.required && !x.terminal && !L.active.st.used[x.group]); return e.reading; });
  await typeWord(p, wrong);
  msg = await p.evaluate(() => document.querySelector('.wp-dmsg').textContent);
  await playWord(p);
  assert(/needs to begin with/.test(msg) && (await st(p)).active.n === 1, 'a word with the wrong kana: explained, no move (' + wrong + ')');
  // ---- an IME Enter during composition plays nothing --------------------------------------------------------------
  const w0 = await p.evaluate(() => window.__pick({ notrap: true }));
  await p.locator('[data-wp-tab="ime"]').click();
  const imeComp = await p.evaluate(async (word) => {
    const inp = document.getElementById('wp-ime');
    inp.focus();
    inp.dispatchEvent(new CompositionEvent('compositionstart', { data: '' }));
    inp.value = word; inp.dispatchEvent(new InputEvent('input', { data: word, isComposing: true }));
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 229, isComposing: true, bubbles: true }));
    await window.__wait(150);
    const during = window.__wp().active.n;
    inp.dispatchEvent(new CompositionEvent('compositionend', { data: word }));
    await window.__wait(30);
    return { during, draft: document.querySelector('.wp-dline').textContent };
  }, w0.reading);
  assert(imeComp.during === 1 && imeComp.draft.indexOf(w0.reading) >= 0, 'Enter while the IME is composing only finishes the composition: no move');
  await p.locator('#wp-ime').press('Enter');
  await until(p, () => window.__wp().active.n > 1, null, 3000);
  assert((await st(p)).active.n >= 2, 'after the composition, Enter plays the word (' + w0.reading + ')');
  await waitTurn(p);
  // ---- a recognised character is not a move -------------------------------------------------------------------------
  const wh = await p.evaluate(() => window.__pick({ plain: true }));
  await p.locator('[data-wp-tab="hand"]').click();
  await p.waitForTimeout(120);
  const nBefore = (await st(p)).active.n;
  const box = await p.locator('.wp-pane .pad-ink').boundingBox();
  const strokes = await p.evaluate((c) => { const r = RB.recog.reference(c); return r.strokes.map((st) => st.map((q) => [q.x / r.box, q.y / r.box])); }, wh.reading[0]);
  for (const st0 of strokes) { const pts = st0.map(([x, y]) => [box.x + (0.1 + 0.8 * x) * box.width, box.y + (0.1 + 0.8 * y) * box.height]); await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down(); for (const q of pts.slice(1)) await p.mouse.move(q[0], q[1], { steps: 2 }); await p.mouse.up(); }
  await p.waitForTimeout(350);
  await playWord(p);
  msg = await p.evaluate(() => document.querySelector('.wp-dmsg').textContent);
  assert((await st(p)).active.n === nBefore && /Confirm or clear the character/.test(msg), 'a recognised character before Play word: no move, no record, no opponent turn');
  // "That is not what I wrote" with a confident read: free, the turn kept, input assistance only
  await p.locator('[data-wp="notwrote"]').click();
  await p.waitForTimeout(80);
  let f = (await st(p)).active.flags;
  assert(f.inputAssist === true && f.suggested === true && (await st(p)).active.n === nBefore, 'That is not what I wrote: costs no turn; recorded as input assistance (Open-book was already a shown bank)');
  await p.locator('.wp-pane [data-a="clear"]').click();
  // ---- the rest of the game: handwriting, choosing, typing, against the real (provisional) opponent -------------------
  // (the game stays open for three of your words; then the real provisional opponent decides the end)
  const played = await finishGame(p, [{ via: 'hand' }, { via: 'select' }, { via: 'ime' }], { friendlyUntil: 3 });
  await p.evaluate(() => window.__opponent(false));
  const g1 = await st(p);
  const res1 = g1.recent[g1.recent.length - 1];
  const vias = played.map((x) => x.how);
  assert(res1 && (res1.result.winner === 'pc' || res1.result.winner === 'cpu') && res1.result.pmoves >= 3, 'a full competitive game played to a real result (' + res1.result.winner + ', ' + res1.result.reason + ', ' + res1.result.pmoves + ' player words; ' + vias.join(' ') + '; ' + (await p.evaluate(() => RB.game.s.practice.shiritori.byCompanion.nao.recent.slice(-1)[0].moves.map((m) => m.a + ':' + m.r).join(' '))) + ')');
  assert(vias.some((v) => v === 'hand') && vias.includes('select') && vias.includes('ime'), 'the game used handwriting, choosing and typing');
  assert(JSON.stringify(res1.support.inputs) === '["hand","ime","select"]', 'mixed input recorded on the transcript (' + res1.support.inputs + ')');
  const rtext = await p.evaluate(() => document.querySelector('.wp-result').textContent.replace(/\s+/g, ' '));
  assert(/Rematch/.test(rtext) && /Change setup/.test(rtext) && /Look back at the chain/.test(rtext) && /Leave/.test(rtext) && /(Recorded|saved|no save slot)/.test(rtext), 'the result offers Rematch, Change setup, Look back and Leave, and says how it was recorded');
  assert(g1.bond.join() === 'activity:shiritori:together' && /shared memories|Shared memories/i.test(rtext), 'the first substantial game: the together event, said truthfully on the result');
  assert(!(await p.evaluate(() => document.activeElement && document.activeElement.matches('[data-wp=rematch],[data-wp=change],[data-wp=leave]'))), 'nothing is focused to be triggered by a held key');
  await shot(p, 'result_1280x800');
  // look back
  await clickWp(p, 'look');
  await p.waitForSelector('.wp-review');
  const rv = await p.evaluate(() => ({ n: document.querySelectorAll('.wp-review-chain li').length, info: document.querySelector('.wp-turninfo').textContent, note: document.querySelector('.wp-review').textContent }));
  assert(rv.n === res1.moves && /Already used before this word|The starter|Required kana/.test(rv.info) && /changes nothing/.test(rv.note), 'Look back: the exact chain, the required kana at the selected turn, used words; it changes nothing');
  await p.locator('.wp-turnbtn').nth(2).click();
  await p.waitForTimeout(60);
  assert(/Turn 2/.test(await p.evaluate(() => document.querySelector('.wp-turninfo').textContent)), 'any turn can be selected');
  const bondBefore = (await st(p)).bond.slice();
  await clickWp(p, 'back');
  await p.waitForSelector('.wp-result');
  assert(JSON.stringify((await st(p)).bond) === JSON.stringify(bondBefore), 'reviewing awards nothing');

  // ---- Rematch: the other responder, a different certified starter; concession while replies remain --------------------
  const prevStarter = await p.evaluate(() => RB.game.s.practice.shiritori.byCompanion.nao.recent.slice(-1)[0].moves[0].e);
  await p.evaluate(() => window.__opponent(true));
  await clickWp(p, 'rematch');
  await p.waitForSelector('.wp-table');
  await waitTurn(p);
  const a2 = (await st(p)).active;
  assert(a2.first === 'cpu' && a2.starter !== prevStarter && a2.n === 2, 'Rematch: the companion responds first this time, from a different certified starter (' + prevStarter + ' → ' + a2.starter + ')');
  await p.locator('[data-wp="stuck"]').click();
  await p.waitForSelector('.wp-stuckbox:not([hidden])');
  const stuck = await p.evaluate(() => document.querySelector('.wp-stuckbox').textContent);
  assert(/Find a word/.test(stuck) && /Keep thinking/.test(stuck) && /Concede this game/.test(stuck) && /no timer/i.test(stuck), 'stuck: Find a word, Keep thinking, Concede — no timer');
  await clickWp(p, 'keep');
  assert(await p.evaluate(() => document.querySelector('.wp-stuckbox').hidden && window.__wp().active.n === 2), 'Keep thinking: nothing happens, no clock');
  await p.locator('[data-wp="stuck"]').click();
  await clickWp(p, 'concede');
  await p.waitForSelector('.csheet');
  await p.locator('.csheet .pbtn', { hasText: 'Concede' }).click();
  await p.waitForSelector('.wp-result');
  const g3 = await st(p);
  const r3 = g3.recent[g3.recent.length - 1].result;
  const why3 = await p.evaluate(() => document.querySelector('.wp-reason').textContent);
  assert(r3.reason === 'human-concession' && r3.winner === 'cpu' && /You conceded/.test(why3) && /still in the bank/.test(why3), 'concession: a loss, distinct from exhaustion; the review names words still unused in the bank (' + why3.slice(0, 90) + ')');
  assert(g3.bond.length === 1, 'repeated games add no further bond');
  await p.evaluate(() => window.__opponent(false));

  // ---- the ん warning: Change setup → Everyday words (an opening on み, you first) -----------------------------------------
  await reg(p, 'everyday', { starters: ['mimi'] });
  await p.evaluate(() => { RB.game.s.practice.shiritori.byCompanion.nao.lastFirst = 'cpu'; });
  await clickWp(p, 'change');
  await p.waitForSelector('.wp-prep');
  await p.locator('input[name="band"][value="everyday"]').check();
  await p.waitForSelector('input[name="band"][value="everyday"]:checked');
  await toTable(p);
  await waitTurn(p);
  const nw = await p.evaluate(() => window.__nword());
  assert(nw === 'みかん', 'you face み; the bank has みかん');
  await typeWord(p, 'みかん');
  await p.locator('#wp-ime').press('Enter');
  await p.waitForSelector('.wp-warn:not([hidden])');
  await p.waitForTimeout(60);
  const warn = await p.evaluate(() => ({ text: document.querySelector('.wp-warn').textContent, focus: document.activeElement && document.activeElement.dataset.wp }));
  assert(/This ends in ん, so playing it ends the game as your loss/.test(warn.text) && warn.focus === 'edit', 'the ん warning, with focus on Edit');
  await shot(p, 'warning_n_1280x800');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(120);
  assert(!(await st(p)).active.over && (await p.evaluate(() => document.querySelector('.wp-warn').hidden)) && (await st(p)).active.n === 1, 'Edit (by keyboard): nothing is played');
  await typeWord(p, 'みかん');
  await playWord(p);
  await p.waitForSelector('.wp-warn:not([hidden])');
  await clickWp(p, 'anyway');
  await p.waitForSelector('.wp-result');
  const g2 = await st(p);
  const r2 = g2.recent[g2.recent.length - 1].result;
  assert(r2.winner === 'cpu' && r2.reason === 'terminal-n' && r2.pmoves === 0, 'Play anyway commits the loss: terminal ん (a deliberate ん word is not counted as a player word)');
  assert(/ends in ん/.test(await p.evaluate(() => document.querySelector('.wp-reason').textContent)), 'and the result says why, plainly');
  await clickWp(p, 'leave');
  await until(p, () => !RB.activity.active() && RB.game.mode() === 'world', null, 3000);
  s0 = await st(p);
  assert(!s0.activity && s0.mode === 'world', 'Leave: back to the world, nothing left open');

  // ---- How we played, once, from the rest menu --------------------------------------------------------------------------------
  choices = await openFromRest(p);
  const iRef = choices.findIndex((c) => /How we played/.test(c));
  assert(choices[0] && /Just chat/.test(choices[0]) && iRef > 0, 'the reflection is offered at the rest stop, after Just chat (' + choices.join(' | ') + ')');
  const scoreBefore = (await st(p)).score;
  const heard = await talk(p, ['How we played', 'watching which endings']);
  const afterRef = await st(p);
  assert(afterRef.bond.includes('activity:shiritori:reflection') && afterRef.score === scoreBefore + 1 && afterRef.reflection.st === 'completed' && afterRef.mems.includes('wordplay:reflection'), 'How we played: +1 once, a memory with the reply');
  assert(heard.seen.some((l) => /exits|map/i.test(l)), 'Nao answers in Nao\'s own terms');
  choices = await openFromRest(p);
  assert(!choices.some((c) => /How we played/.test(c)) && /Just chat/.test(choices[0]), 'and it is not offered again');
  await talk(p, ['Not now']);

  // ---- a real restrictive ending: no playable continuation in this bank (§26.2) -------------------------------------------------
  await p.evaluate(([entries]) => {
    const keep = ['koma', 'mado', 'makura', 'rakuda', 'daikon', 'neko', 'kodomo', 'mori', 'risu', 'suika', 'kasa', 'sakana'];
    RB.shiritori.addBank({ id: 'extended', version: 1, entries: JSON.parse(JSON.stringify(entries.filter((e) => keep.includes(e.id)))), starters: ['koma'] });
    RB.game.s.practice.shiritori.byCompanion.nao.lastFirst = 'cpu'; // the player responds first in the next game
  }, [FIXTURE_ENTRIES]);
  await p.evaluate(() => { RB.ui.wordplay.launch({ source: 'words' }); }); // (not awaited: the session lasts until Leave)
  await p.waitForSelector('.wp-prep');
  await p.locator('input[name="band"][value="extended"]').check();
  await p.waitForSelector('input[name="band"][value="extended"]:checked');
  await toTable(p);
  await typeWord(p, 'まど');
  await p.locator('#wp-ime').press('Enter');
  await p.waitForSelector('.wp-result');
  const g4 = await st(p);
  const r4 = g4.recent[g4.recent.length - 1].result;
  const why4 = await p.evaluate(() => document.querySelector('.wp-result').textContent.replace(/\s+/g, ' '));
  assert(r4.winner === 'pc' && r4.reason === 'no-safe-reply' && r4.stage === 'extended:casual' && g4.stages.includes('extended:casual'), 'a restrictive ending wins: Extended · Casual cleared after one player word');
  assert(/No playable continuation remained in this match's bank for ど/.test(why4) && !/Japanese has no/i.test(why4), 'said as a fact about this match\'s bank, never about Japanese');
  assert(/Stage won for the first time/.test(why4) && g4.bond.length === 2, 'a first stage clear is acknowledged; a one-word win adds no bond');
  assert(g4.mems.includes('wordplay:first-clear'), 'the first stage victory is a memory');
  await shot(p, 'result_stage_1280x800');
  await clickWp(p, 'change');
  await p.waitForSelector('.wp-prep');
  // ---- a cooperative chain ---------------------------------------------------------------------------------------------------
  await p.locator('input[name="format"][value="cooperative"]').check();
  await p.waitForSelector('input[name="goal"]');
  await p.locator('input[name="band"][value="pocket"]').check();
  await p.waitForSelector('input[name="band"][value="pocket"]:checked');
  await p.locator('input[name="goal"][value="6"]').check();
  await p.waitForSelector('input[name="goal"][value="6"]:checked');
  await toTable(p);
  const stagesBefore = JSON.stringify((await st(p)).played.sort());
  const coopPlayed = await finishGame(p, [{ via: 'select' }], { keepOpen: true });
  const g5 = await st(p);
  const r5 = g5.recent[g5.recent.length - 1].result;
  assert((r5.reason === 'cooperative-goal' && r5.winner === null && g5.coop.goals['6'].done === 1) || (r5.reason !== 'cooperative-goal' && r5.winner === null), 'a cooperative chain: completed as a shared chain, never a competitive win or loss (' + r5.reason + ', ' + r5.cmoves + ')');
  assert(JSON.stringify(g5.played.sort()) === stagesBefore && !g5.played.some((k) => /partner/.test(k)), 'and no stage record (' + coopPlayed.length + ' player words)');
  await shot(p, 'result_coop_1280x800');
  await clickWp(p, 'leave');
  await until(p, () => !RB.activity.active(), null, 3000);
  assert(!errors.length, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');
  assert(!requests.length, 'no external requests (' + requests.slice(0, 2).join(' ') + ')');
  await p.context().close();
}

// ================================================================== Company: Ledger entry and return; pending topic
if (want('company')) {
  const { p, errors, requests } = await newPage({ viewport: { width: 800, height: 560 } });
  await reg(p, 'pocket');
  await p.evaluate(() => window.__start('co.inn', 6, 8, { comp: 'mio', flags: { ch2_done: true }, chapter: 3 }));
  await p.waitForTimeout(250);
  const pend0 = await p.evaluate(() => ({ p: RB.game.s.company.talk._pending, pending: RB.company.pending(RB.game.s) }));
  assert(pend0.p === 'reflect:travel' && pend0.pending, 'a story topic is waiting (How We Travel)');
  // Company › Companion › Wordplay
  await p.evaluate(() => RB.ui.menu.open('companion'));
  await p.waitForSelector('.wp-card');
  const card0 = await p.evaluate(() => document.querySelector('.wp-card').textContent.replace(/\s+/g, ' '));
  assert(/No matches recorded/.test(card0) && /Not played/.test(card0) && (await p.evaluate(() => document.querySelectorAll('.wp-cell').length)) === 9, 'the Wordplay card before any game: nine Not played cells, "No matches recorded"');
  await shot(p, 'company_card_empty_800x560');
  const scrolled = await p.evaluate(() => { const B = document.querySelectorAll('#folio-page .leaf')[1] || document.querySelector('#folio-page .leaf'); B.scrollTop = 200; return B.scrollTop; });
  await p.evaluate(() => document.querySelector('[data-co-sec="wordplay"][data-wp-act="play"]').click());
  await p.waitForSelector('.wp-prep');
  let s1 = await st(p);
  assert(!s1.menu && s1.activity, 'Play shiritori from Company: the folio closes before play');
  await toTable(p);
  // three of your words, then concede: a finished game, so How we played becomes available
  // (if the opening closes sooner, a rematch, as a player would)
  await finishGame(p, [{ via: 'select' }], { friendlyUntil: 3, maxMoves: 3 });
  for (let k = 0; k < 3 && !(await st(p)).together; k++) {
    await clickWp(p, 'rematch'); await p.waitForSelector('.wp-table');
    await finishGame(p, [{ via: 'select' }], { friendlyUntil: 3, maxMoves: 3 });
  }
  s1 = await st(p);
  assert(!!s1.together, 'a substantial game was finished (' + JSON.stringify(s1.recent.map((r) => r.result.reason + '/' + r.result.pmoves)) + ')');
  assert(s1.pending === 'reflect:travel' && JSON.stringify(await p.evaluate(() => RB.company.pending(RB.game.s))) === JSON.stringify(pend0.pending), 'the story topic and talk._pending are untouched by the game');
  await clickWp(p, 'leave');
  await until(p, () => RB.ui.menu.isOpen(), null, 3000);
  await p.waitForTimeout(450);
  const back = await p.evaluate(() => ({ cur: RB.ui.menu.current(), top: (document.querySelectorAll('#folio-page .leaf')[1] || document.querySelector('#folio-page .leaf')).scrollTop, focus: document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.wpAct : null }));
  assert(back.cur.section === 'company' && back.cur.company === 'companion' && Math.abs(back.top - scrolled) <= 4, 'the folio comes back to Company › Companion at the same scroll (' + scrolled + '→' + back.top + ')');
  assert(back.focus === 'play', 'and focus returns to the Wordplay card');
  const card1 = await p.evaluate(() => document.querySelector('.wp-card').textContent.replace(/\s+/g, ' '));
  assert(/Played|Won/.test(card1) && /conversation is available/.test(card1), 'the card shows the record and that How we played is available (' + card1.slice(0, 160) + ')');
  await shot(p, 'company_card_800x560');
  await p.evaluate(() => RB.ui.menu.close());
  // normal talk priority: the waiting story topic still comes first
  await p.evaluate(() => RB.game.companionTalk());
  await p.waitForTimeout(250);
  const first = await talk(p, ['Not now']);
  assert(first.seen.some((l) => /practising not hurrying|Shall we rest|meant to ask/i.test(l)) || first.seen.some((l) => /Of course/.test(l)), 'talking to Mio still plays the waiting story topic first (' + first.seen[0] + ')');
  // suspend from the table, resume from Company
  await p.evaluate(() => RB.ui.menu.open('companion'));
  await p.waitForSelector('.wp-card');
  await p.evaluate(() => document.querySelector('[data-co-sec="wordplay"][data-wp-act="play"]').click());
  await toTable(p);
  await waitTurn(p);
  await typeWord(p, 'ねずみ');
  await clickWp(p, 'leave');
  await p.waitForSelector('.csheet');
  await p.locator('.csheet .pbtn', { hasText: 'Keep it for later' }).click();
  await until(p, () => RB.ui.menu.isOpen(), null, 3000);
  await p.waitForTimeout(400);
  s1 = await st(p);
  assert(s1.active && s1.active.susp && s1.active.susp.draft && s1.active.susp.draft.text === 'ねずみ', 'Keep it for later: the match is kept at a confirmed word, the draft beside it (never played)');
  assert(await p.evaluate(() => !!document.querySelector('[data-co-sec="wordplay"][data-wp-act="resume"]')), 'the card offers Resume match');
  await p.evaluate(() => document.querySelector('[data-co-sec="wordplay"][data-wp-act="resume"]').click());
  await p.waitForSelector('.wp-table');
  await p.waitForTimeout(250);
  const resumed = await p.evaluate(() => ({ say: (document.querySelector('.wp-say') || {}).textContent || '', draft: document.getElementById('wp-ime').value, n: window.__wp().active.n }));
  assert(resumed.draft === 'ねずみ' && resumed.n === s1.active.n && resumed.say.length > 0, 'Resume: the same match, the draft handed back as a draft, Mio picks it up');
  // a different campaign while the table is open: the old session is gone, nothing leaks
  const oldId = await p.evaluate(() => RB.game.s.id);
  await p.evaluate(() => window.__start('rw.village', 22, 30, { comp: 'ren' }));
  await p.waitForTimeout(300);
  const after = await p.evaluate(() => ({ id: RB.game.s.id, layer: !!document.querySelector('.wp-folio'), act: !!RB.activity.active(), sh: JSON.stringify(RB.game.s.practice.shiritori.byCompanion), mode: RB.game.mode() }));
  assert(after.id !== oldId && !after.layer && !after.act && after.sh === '{}' && after.mode === 'world', 'a campaign change disposes the table; the new campaign has no records of the old');
  assert(!errors.length, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');
  assert(!requests.length, 'no external requests');
  await p.context().close();
}

// =================================================================== not here: truthful reasons, records readable
if (want('nothere')) {
  const { p, errors } = await newPage();
  await reg(p, 'pocket');
  await p.evaluate(() => window.__start('rw.village', 22, 30, { comp: 'suzu' }));
  await p.waitForTimeout(200);
  await p.evaluate(() => RB.ui.menu.open('companion'));
  await p.waitForSelector('.wp-card');
  let c = await p.evaluate(() => ({ dis: document.querySelector('[data-co-sec="wordplay"][data-wp-act="play"]').disabled, why: (document.getElementById('wp-why') || {}).textContent, cells: document.querySelectorAll('.wp-cell').length }));
  assert(c.dis && /rest stop/.test(c.why) && c.cells === 9, 'away from a rest stop: Play disabled with the reason; the records are readable');
  await p.evaluate(() => RB.ui.menu.open('practice'));
  await p.waitForTimeout(120);
  const idx = await p.evaluate(() => { const e = document.querySelector('[data-pr="shiritori"]'); return e ? { text: e.textContent, begin: !!e.querySelector('[data-pr-begin]') } : null; });
  assert(idx && /Shiritori/.test(idx.text) && !idx.begin && /rest stop/.test(idx.text), 'Words › Ways to practise: where it is offered, no remote launch');
  await p.evaluate(() => RB.ui.menu.close());
  // a creature close by (a real one of the Mill Road, moved beside you): Play disabled, said plainly
  await p.evaluate(() => window.__start('rw.millroad', 12, 10, { comp: 'suzu' }));
  await p.waitForTimeout(200);
  const foe = await p.evaluate(() => { const W = RB.world.W; const f = (W.foes || [])[0]; if (f) { f.x = W.player.x + 2; f.y = W.player.y; } return !!f; });
  await p.evaluate(() => RB.ui.menu.open('companion'));
  await p.waitForSelector('.wp-card');
  c = await p.evaluate(() => ({ dis: document.querySelector('[data-co-sec="wordplay"][data-wp-act="play"]').disabled, why: (document.getElementById('wp-why') || {}).textContent, cells: document.querySelectorAll('.wp-cell').length }));
  assert(foe && c.dis && /creature/.test(c.why) && c.cells === 9, 'a creature close by: Play disabled, said plainly; the records stay readable (' + c.why + ')');
  const launched = await p.evaluate(() => RB.activity.launch('shiritori', { source: 'company' }));
  assert(!launched.ok, 'and launching anyway is refused at the moment of launch');
  await p.evaluate(() => { if (RB.ui.menu.isOpen()) RB.ui.menu.close(); });
  await p.evaluate(() => window.__start('co.inn', 6, 8, { comp: 'suzu' }));
  await p.waitForTimeout(200);
  // Ways to practise at the rest stop: Begin here
  await p.evaluate(() => RB.ui.menu.open('practice'));
  await p.waitForTimeout(150);
  const here = await p.evaluate(() => !!document.querySelector('[data-pr="shiritori"] [data-pr-begin]'));
  assert(here, 'at the rest stop: Begin here');
  await p.locator('[data-pr="shiritori"] [data-pr-begin]').click();
  await p.waitForSelector('.wp-prep');
  // the provisional companion is no loophole
  await p.evaluate(() => { RB.activity._dispose(); });
  await p.evaluate(() => { window.__start('co.inn', 6, 8, { comp: null }); RB.game.s.provisional = 'suzu'; });
  await p.waitForTimeout(150);
  assert(!(await p.evaluate(() => RB.wordplay.eligible(RB.game.s).ok)), 'a provisional companion: no table');
  assert(!errors.length, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');
  await p.context().close();
}

// ======================================================================== keyboard only, and touch
if (want('keyboard')) {
  const { p, errors } = await newPage({ viewport: { width: 1024, height: 768 } });
  await reg(p, 'pocket');
  await p.evaluate(() => window.__start('co.inn', 6, 8, { comp: 'ren' }));
  await p.waitForTimeout(200);
  await p.evaluate(() => { RB.practice.set(RB.game.s, 'demoSeen', true); RB.ui.wordplay.launch({ source: 'words' }); });
  await p.waitForSelector('.wp-prep');
  // reach Start by Tab, press Enter
  let reached = false;
  for (let i = 0; i < 40 && !reached; i++) { await p.keyboard.press('Tab'); reached = await p.evaluate(() => document.activeElement && document.activeElement.dataset.wp === 'start'); }
  assert(reached, 'keyboard: Tab reaches Start');
  await p.keyboard.press('Enter');
  await p.waitForSelector('.wp-table');
  await waitTurn(p);
  const tabTo = async (sel) => { for (let i = 0; i < 80; i++) { if (await p.evaluate((q) => document.activeElement && document.activeElement.matches(q), sel)) return true; await p.keyboard.press('Tab'); } return false; };
  // reading disambiguation by keyboard alone: type 工場 (two approved readings), Enter asks which
  // reading with focus on the choice; choosing one moves focus to Play word. No move is made.
  assert(await tabTo('[data-wp-tab="ime"]'), 'keyboard: the Type tab is reachable');
  await p.keyboard.press('Enter');
  await until(p, () => document.activeElement && document.activeElement.id === 'wp-ime', null, 3000);
  const n0 = (await st(p)).active.n;
  await p.keyboard.insertText('工場');
  await p.keyboard.press('Enter');
  await until(p, () => document.activeElement && !!document.activeElement.dataset.wpReading, null, 3000);
  const kr = await p.evaluate(() => ({ focus: document.activeElement.dataset.wpReading, all: Array.from(document.querySelectorAll('.wp-dpick [data-wp-reading]')).map((b) => b.dataset.wpReading).join(','), msg: document.querySelector('.wp-dmsg').textContent }));
  assert(kr.focus === 'こうじょう' && kr.all === 'こうじょう,こうば' && /Which reading/.test(kr.msg), 'keyboard: a word with two approved readings asks which, focus on the choice (' + JSON.stringify(kr) + ')');
  assert(await tabTo('[data-wp-reading="こうば"]'), 'keyboard: the second reading is reachable');
  await p.keyboard.press('Enter');
  await until(p, () => document.activeElement && document.activeElement.dataset.wp === 'play', null, 3000);
  const kr2 = await p.evaluate(() => ({ focus: document.activeElement.dataset.wp, pressed: (document.querySelector('.wp-dpick [data-wp-reading="こうば"]') || {}).getAttribute && document.querySelector('.wp-dpick [data-wp-reading="こうば"]').getAttribute('aria-pressed'), line: document.querySelector('.wp-dmsg').textContent }));
  assert(kr2.focus === 'play' && kr2.pressed === 'true' && /こうば/.test(kr2.line) && (await st(p)).active.n === n0, 'keyboard: choosing a reading moves focus to Play word and makes no move (' + JSON.stringify(kr2) + ')');
  // Tab to the Choose tab and a word, Enter on each (and on its reading if it has two), then Play word
  const w = await p.evaluate(() => window.__pick({}));
  assert(await tabTo('[data-wp-tab="select"]'), 'keyboard: the Choose tab is reachable');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(80);
  assert(await tabTo('[data-wp-pick="' + w.id + '"]'), 'keyboard: a word in the bank is reachable');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(80);
  if (await p.evaluate((id) => RB.shiritori.readingsOf(RB.wordplay.live(RB.game.s).bank.entryById[id]).length > 1, w.id)) {
    await until(p, () => document.activeElement && !!document.activeElement.dataset.wpReading, null, 3000);
    assert(await tabTo('[data-wp-reading="' + w.reading + '"]'), 'keyboard: the chosen word asks for its reading first');
    await p.keyboard.press('Enter');
  }
  await until(p, () => document.activeElement && document.activeElement.dataset.wp === 'play', null, 3000);
  const focusPlay = await p.evaluate(() => document.activeElement && document.activeElement.dataset.wp);
  await p.keyboard.press('Enter');
  await until(p, () => window.__wp().active && window.__wp().active.n > 1, null, 6000);
  const kst = await st(p);
  const kdiag = await p.evaluate(() => ({ ae: document.activeElement && (document.activeElement.dataset.wp || document.activeElement.tagName), top: RB.ui.topLayer() && RB.ui.topLayer().name, mode: RB.game.mode(), msg: (document.querySelector('.wp-dmsg') || {}).textContent, play: (document.querySelector('[data-wp=play]') || {}).disabled }));
  assert(focusPlay === 'play' && (!kst.active || kst.active.n > 1) && kst.recent.length + (kst.active ? 1 : 0) >= 1, 'keyboard: choosing a word moves focus to Play word; Enter plays it (' + focusPlay + ', ' + (kst.active ? kst.active.n : 'game over') + ', ' + JSON.stringify(kdiag) + ')');
  // Escape opens Leave (keep / end / keep playing), safe choice focused
  await waitTurn(p);
  await p.keyboard.press('Escape');
  await p.waitForSelector('.csheet');
  const safeFocus = await p.evaluate(() => document.activeElement && document.activeElement.textContent);
  assert(/Keep playing/.test(safeFocus || ''), 'Escape asks before leaving, with Keep playing focused');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(100);
  assert(!!(await st(p)).active && (await st(p)).activity, 'and Keep playing keeps the table');
  assert(!errors.length, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');
  await p.context().close();
}
if (want('touch')) {
  const { p, errors } = await newPage({ viewport: { width: 390, height: 844 }, touch: true, mobile: true });
  await reg(p, 'pocket');
  await p.evaluate(() => window.__start('co.inn', 6, 8, { comp: 'suzu' }));
  await p.waitForTimeout(200);
  await p.evaluate(() => { RB.practice.set(RB.game.s, 'demoSeen', true); RB.ui.wordplay.launch({ source: 'words' }); });
  await p.waitForSelector('.wp-prep');
  await p.locator('.wp-leaf [data-wp="start"]').tap();
  await p.waitForSelector('.wp-table');
  await waitTurn(p);
  const w = await p.evaluate(() => window.__pick({}));
  await p.locator('[data-wp-tab="select"]').tap();
  await p.locator('[data-wp-pick="' + w.id + '"]').scrollIntoViewIfNeeded();
  await p.locator('[data-wp-pick="' + w.id + '"]').tap();
  // a word with two approved readings (工場) asks which first: tap the one meant
  if (await p.locator('.wp-dpick [data-wp-reading]').count()) await p.locator('.wp-dpick [data-wp-reading="' + w.reading + '"]').tap();
  await until(p, (r) => (document.querySelector('.wp-dline').textContent + document.querySelector('.wp-dmsg').textContent).indexOf(r) >= 0, w.reading, 4000);
  await p.locator('.wp-leaf [data-wp="play"]').tap();
  await until(p, () => !window.__wp().active || window.__wp().active.n > 1, null, 6000);
  const ts = await p.evaluate(() => ({ n: window.__wp().active ? window.__wp().active.n : 'over', line: document.querySelector('.wp-dline') ? document.querySelector('.wp-dline').textContent : '', msg: document.querySelector('.wp-dmsg') ? document.querySelector('.wp-dmsg').textContent : '' }));
  assert(ts.n === 'over' || ts.n > 1, 'touch: tap Choose, a word and Play word (' + JSON.stringify(ts) + ')');
  await shot(p, 'table_suzu_touch_390x844');
  assert(!errors.length, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');
  await p.context().close();
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
