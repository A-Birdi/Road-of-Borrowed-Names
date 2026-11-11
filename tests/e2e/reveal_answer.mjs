// RBN-QA-194 on screen, in Chromium on the built game (Agnes 6714836104, native instances in Wings 2, 6, 7, 9 and 10;
// Local CL-714, CL-770; Cloud CC-544; Agnes 6803414018): pressing "I don't know" on a choose or listen step showed a
// Japanese answer as its {kanji|reading} source, while the same option's button showed it with readings over the
// kanji. With the real buttons ("I don't know", Continue, Step away), each task opened as its owner opens it:
//  1. the four mediation answers of Wing 9 and of Wing 10, at the two-option and the three-option tiers: the answer as
//     its button shows it (the same rendering), readings over the kanji, no markup; Continue: the result is right,
//     assisted and revealed, recorded once as assisted;
//  2. outside the Hall, Hisae's questions (the Keepers' Road): the same;
//  3. the field decides: a listening answer in English holding Japanese ("kite · come"), a bilingual option, an
//     English-only answer: each its English as text; an empty English: the Japanese, rendered;
//  4. literal markup, in English and in Japanese: shown as text, nothing made bold;
//  5. with no Japanese renderer (the fallback): the Japanese without readings, no markup;
//  6. the written, ordered and forged answers: shown as before (the plain answer, the pieces in order, the reading);
//  7. grading as before: right at once (not assisted), wrong then right (not first try), wrong then "I don't know"
//     (not first try, assisted), each recorded once;
//  8. Step away after "I don't know": nothing recorded; offered again, "I don't know" is there again and shows the same;
//  9. in the conversations themselves (Wing 9 Yosaku and Otoku; Wing 10 Soan and Kohaku), with the real cards:
//     "I don't know" shows the answer rendered; "Choose something else" goes back with nothing done; the same card again,
//     "I don't know", Continue: the move is made (in the record and the conversation's state), recorded as assisted with
//     the encounter's tag, and the conversation stands as it does after the same card answered right at once;
//  no page errors throughout.
// Usage: node tools/build.mjs && node tests/e2e/reveal_answer.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);

async function begin(p) {
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { edition: RB.edition.forNew(), comp: 'ren' });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    RB.game.settings.input = 'choice'; RB.game.settings.reducedMotion = true; RB.game.settings.textSpeed = 'instant';
    RB.game.settings.battleAnim = 'instant'; RB.game.settings.compPlan = 'ask';
    RB.game.applySettings();
    const rec = RB.learn.record;
    window.__recs = [];
    RB.learn.record = (id, r) => { window.__recs.push({ ids: [].concat(id), ok: r.ok, assisted: !!r.assisted, help: r.help || null, ctx: r.ctx || null }); return rec(id, r); };
    const C = RB.content;
    const pick = (o) => RB.util.deepClone(o);
    window.__mk = {
      social: (enc, act, tier) => { const t = pick(C.encounters[enc].social.actions.find((a) => a.id === act).task[tier]); t.title = t.title || 'Say it'; return RB.tasks.prepare(t); },
      ch: (id, tier, i) => RB.tasks.prepare(pick(C.challenges[id].tiers[tier][i])),
      stretch: (id, i) => RB.tasks.prepare(pick(C.challenges[id].stretchA[i])),
      raw: (o) => RB.tasks.prepare(o),
    };
  });
  await p.waitForTimeout(200);
}
// open a task as its owner does (src/ui/80s_encounter.js stepFor; an activity's own step), not awaited
async function open(p, how) {
  await p.evaluate((how) => {
    window.__res = null;
    RB.game.pushMode('challenge');
    const st = window.__mk[how[0]](...how.slice(1));
    window.__item = [].concat(st.item)[0];
    RB.challenge.runStep(st, { ctxTag: 'qa194' }).then((r) => { RB.game.popMode('challenge'); window.__res = r; });
  }, how);
  await p.waitForSelector('.chal [data-a=reveal]', { timeout: 8000 });
  await p.waitForTimeout(80);
}
// press "I don't know" and read what it shows, beside the buttons (as the player sees them)
async function reveal(p) {
  await p.click('.chal [data-a=reveal]');
  await p.waitForSelector('.chal .fbwrap[data-fb=reveal] .jp.big', { timeout: 5000 });
  return p.evaluate(() => {
    const a = document.querySelector('.chal .fbwrap[data-fb=reveal] .fb-b .jp.big');
    const c = a.cloneNode(true);
    c.querySelectorAll('rt').forEach((x) => x.remove());
    const read = c.textContent.replace(/\s+/g, '');
    const norm = (h) => h.replace(/ data-src="[^"]*"/g, '');
    const st = RB.challenge.current();
    const okOpt = (st && st.options || []).find((o) => o.ok) || {};
    const btns = [...document.querySelectorAll('.chal .mc .btn')];
    return {
      text: a.textContent, read, ruby: a.querySelectorAll('ruby').length, tags: a.querySelectorAll('b, i').length,
      raw: /[{}|]/.test(read), sameBtn: btns.some((bn) => norm(bn.innerHTML) === norm(a.innerHTML)),
      plain: okOpt.jp ? RB.jp.plain(okOpt.jp).replace(/\s+/g, '') : null, en: okOpt.en || null, kind: st && st.kind,
      want: st ? (st.kind === 'write' ? RB.tasks.plain(st.answer) : st.kind === 'order' ? st.answer.map(RB.tasks.plain).join(' ') : st.kind === 'forge' ? st.answerReading : null) : null,
      hidden: document.querySelector('.chal [data-a=reveal]').hidden,
    };
  });
}
async function cont(p) {
  await p.click('.chal .fbwrap [data-a=continue]');
  await p.waitForFunction(() => window.__res, null, { timeout: 5000 });
  return p.evaluate(() => ({ res: window.__res, recs: window.__recs.filter((r) => r.ids.includes(window.__item)) }));
}
const clean = (p) => p.evaluate(() => { window.__recs.length = 0; });
const assisted = (o) => o.res.ok && o.res.assisted && o.res.revealed && !o.res.cancelled && o.res.mistakes === 0 && o.recs.length === 1 && o.recs[0].ok && o.recs[0].assisted && o.recs[0].help === 'supplied';
// rendered as its button: readings over the kanji, no markup, the same text; and "I don't know" put away once used
const rendered = (r) => r.ruby > 0 && !r.raw && r.read === r.plain && r.sameBtn && !r.tags && r.hidden === true;

// ---- 1 and 2. Wings 9 and 10, every answer, both option counts; then Hisae ----------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p);
  for (const [wing, enc] of [['Wing 9', 'hall.w9.quarrel'], ['Wing 10', 'hall.w10.vigil']]) {
    for (const act of ['calm', 'ask', 'together', 'blunt']) {
      for (const tier of ['E', 'I']) {
        await clean(p);
        await open(p, ['social', enc, act, tier]);
        const r = await reveal(p);
        const o = await cont(p);
        ok(rendered(r) && assisted(o), '1 ' + wing + ' ' + act + ' (' + (tier === 'E' ? 'two' : 'three') + ' options): as its button shows it, readings over the kanji, no markup; Continue: right, assisted, recorded once ' +
          flat({ ruby: r.ruby, raw: r.raw, sameBtn: r.sameBtn, read: r.read === r.plain, res: { ok: o.res.ok, assisted: o.res.assisted, revealed: o.res.revealed }, recs: o.recs }));
      }
    }
  }
  for (const tier of ['E', 'I']) {
    await clean(p);
    await open(p, ['social', 'kr.hisae', 'ask_mean', tier]);
    const r = await reveal(p);
    const o = await cont(p);
    ok(rendered(r) && assisted(o), '2 Hisae (Keepers\' Road), "what she means by call", ' + tier + ': as its button shows it, no markup; assisted ' + flat({ ruby: r.ruby, raw: r.raw, sameBtn: r.sameBtn }));
  }
  ok(!errors.length, '1-2 no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- 3 to 6. the field, markup, the fallback, and the other kinds ----------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p);
  const one = async (how, check, m) => { await clean(p); await open(p, how); const r = await reveal(p); const o = await cont(p); ok(check(r) && assisted(o), m + ' ' + flat({ text: r.text.slice(0, 60), ruby: r.ruby, raw: r.raw, tags: r.tags, recs: o.recs.length })); };
  await one(['ch', 'ws.L16', 'E', 0], (r) => r.kind === 'listen' && r.text === 'きて · come' && r.en === r.text && !r.ruby, '3 a listening answer in English holding Japanese (ws.L16): its English as text');
  await one(['ch', 'sg.c_crates', 'E', 0], (r) => r.text === 'to the lighthouse' && !r.ruby, '3 a bilingual option (sg.c_crates): its English');
  await one(['stretch', 'hall.w9.riddle', 0], (r) => r.en && r.text === r.en && !r.ruby, '3 an English-only answer (the riddle stone\'s saying): its English');
  await one(['raw', { kind: 'choose', item: 'v:qa194_empty', prompt: { en: 'Which?' }, options: [{ en: '', jp: '{傘|かさ} を {返|かえ}す', ok: true }, { jp: 'いいえ', ok: false }] }],
    (r) => r.ruby > 0 && !r.raw && r.read === '傘を返す' && r.sameBtn, '3 an empty English: the Japanese, rendered as its button');
  await one(['raw', { kind: 'choose', item: 'v:qa194_en_html', prompt: { en: 'Which?' }, options: [{ en: '<b>bold</b> & "quoted" {傘|かさ}', ok: true }, { en: 'no', ok: false }] }],
    (r) => r.text === '<b>bold</b> & "quoted" {傘|かさ}' && !r.tags && !r.ruby, '4 English with markup and {kanji|reading}: shown as written, nothing made bold');
  await one(['raw', { kind: 'choose', item: 'v:qa194_jp_html', prompt: { en: 'Which?' }, options: [{ jp: '<b>x</b> {傘|かさ} を', ok: true }, { jp: 'いいえ', ok: false }] }],
    (r) => !r.tags && /<b>x<\/b>/.test(r.text) && r.ruby > 0 && r.sameBtn, '4 Japanese with markup: shown as text, readings over the kanji');
  // the renderer's fallback (RB.jp.render absent): the task and its answer both drawn without it
  await p.evaluate(() => { window.__keepR = RB.jp.render; RB.jp.render = null; });
  await one(['social', 'hall.w9.quarrel', 'calm', 'E'], (r) => !r.ruby && !r.raw && r.read === r.plain && r.sameBtn, '5 with no renderer: the Japanese without its readings, no markup, as its button');
  await p.evaluate(() => { RB.jp.render = window.__keepR; });
  await one(['raw', { kind: 'write', item: 'v:qa194_write', prompt: { en: 'Write the word for "umbrella".' }, answer: '{傘|かさ}', accept: ['かさ', '傘'], mode: 'reading' }],
    (r) => r.kind === 'write' && r.text === r.want && r.want && !r.ruby, '6 a written answer: its plain answer, as before');
  await one(['ch', 'lq.c_note', 'E', 0], (r) => r.kind === 'order' && r.text === r.want && r.want && !r.ruby, '6 an ordered answer (lq.c_note): the pieces in order, as before');
  await one(['ch', 'mb.noodle_masa', 'F', 0], (r) => r.kind === 'forge' && r.text === r.want && r.want && !r.ruby, '6 a forged answer (mb.noodle_masa): its reading, as before');
  ok(!errors.length, '3-6 no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- 7 and 8. grading, Step away and a second offer -----------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p);
  // press an option's button: the right one, or the first wrong one
  const press = (right) => p.evaluate((right) => {
    const st = RB.challenge.current();
    const norm = (h) => h.replace(/ data-src="[^"]*"/g, '');
    const want = st.options.filter((o) => !!o.ok === right).map((o) => norm(RB.ui.jhtml(o.jp)));
    const bn = [...document.querySelectorAll('.chal .mc .btn')].find((x) => !x.disabled && want.includes(norm(x.innerHTML)));
    if (bn) bn.click();
    return !!bn;
  }, right);
  await clean(p);
  await open(p, ['social', 'hall.w9.quarrel', 'calm', 'I']);
  await press(true);
  await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
  const a = await cont(p);
  ok(a.res.ok && a.res.firstTry === true && !a.res.assisted && a.recs.length === 1 && a.recs[0].ok && !a.recs[0].assisted, '7 right at once: right, first try, not assisted, recorded once ' + flat(a.recs));
  await clean(p);
  await open(p, ['social', 'hall.w9.quarrel', 'calm', 'I']);
  await press(false);
  await p.waitForSelector('.chal .fbwrap[data-fb=no]');
  const why = await p.evaluate(() => document.querySelector('.chal .fbwrap .fb-why').textContent);
  await press(true);
  await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
  const c = await cont(p);
  ok(why.length > 10 && c.res.ok && c.res.firstTry === false && c.res.mistakes === 1 && !c.res.assisted && c.recs.length === 1 && !c.recs[0].ok && !c.recs[0].assisted, '7 wrong, then right: its reason shown; not first try, not assisted, recorded once ' + flat({ why: why.slice(0, 40), recs: c.recs }));
  await clean(p);
  await open(p, ['social', 'hall.w9.quarrel', 'calm', 'I']);
  await press(false);
  await p.waitForSelector('.chal .fbwrap[data-fb=no]');
  const r3 = await reveal(p);
  const d = await cont(p);
  ok(rendered(r3) && d.res.ok && d.res.firstTry === false && d.res.assisted && d.recs.length === 1 && !d.recs[0].ok && d.recs[0].assisted, '7 wrong, then "I don\'t know": the answer rendered; not first try, assisted, recorded once ' + flat(d.recs));
  // 8. Step away after the reveal, then the same task offered again
  await clean(p);
  await open(p, ['social', 'hall.w10.vigil', 'blunt', 'I']);
  const r4 = await reveal(p);
  await p.click('.chal [data-a=leave]');
  await p.waitForFunction(() => window.__res, null, { timeout: 5000 });
  const e = await p.evaluate(() => ({ res: window.__res, recs: window.__recs.filter((r) => r.ids.includes(window.__item)) }));
  await open(p, ['social', 'hall.w10.vigil', 'blunt', 'I']);
  const again = await p.evaluate(() => ({ hidden: document.querySelector('.chal [data-a=reveal]').hidden, fb: (document.querySelector('.chal .fbwrap') || {}).getAttribute('data-fb') }));
  const r5 = await reveal(p);
  const f = await cont(p);
  ok(rendered(r4) && e.res.cancelled && !e.recs.length, '8 Step away after "I don\'t know": nothing recorded ' + flat({ cancelled: e.res.cancelled, recs: e.recs }));
  ok(!again.hidden && !again.fb && rendered(r5) && r5.text === r4.text && assisted(f), '8 offered again: "I don\'t know" is there, shows the same, rendered; Continue: assisted, recorded once ' + flat({ again, recs: f.recs }));
  ok(!errors.length, '7-8 no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- 9. in the conversations themselves ----------------------------------------------------------------------------------------
// one conversation, its restating card ('calm') played once: by "I don't know" (after a "Choose something else"), or
// answered right at once; what the move did is read from the conversation's own state (stances, understanding, used)
async function conversation(enc, how) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p);
  await p.evaluate((enc) => { RB.game.startEncounter(enc, {}); }, enc);
  const cards = async () => {
    for (let i = 0; i < 200; i++) {
      const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.enc-card'), conf: !!document.querySelector('.csheet'), chal: !!document.querySelector('.chal') }));
      if (st.cards && !st.conf && !st.chal) break;
      if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
      await p.waitForTimeout(60);
    }
    await p.waitForSelector('.enc-card');
    await p.waitForTimeout(150);
  };
  const state = () => p.evaluate(() => {
    const S = RB.encScreen.current().st.enc.social;
    return { soc: JSON.stringify({ stance: S.stance, understanding: S.understanding, used: S.used }), log: [...document.querySelectorAll('.enc-log li')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()) };
  });
  const label = await p.evaluate((enc) => RB.content.encounters[enc].social.actions.find((a) => a.id === 'calm').label.en, enc);
  const press = () => p.evaluate((label) => { const c = [...document.querySelectorAll('.enc-card:not([disabled])')].find((x) => ((x.querySelector('.rc-en') || {}).textContent || '').trim() === label); if (c) c.click(); return !!c; }, label);
  await cards();
  await p.evaluate(() => { window.__recs.length = 0; window.__item = null; });
  const out = { label, s0: await state() };
  if (how === 'reveal') {
    out.pressed1 = await press();
    await p.waitForSelector('.chal [data-a=reveal]');
    out.r1 = await reveal(p);
    await p.click('.chal [data-a=leave]');
    await cards();
    out.s1 = await state();
    out.recs1 = await p.evaluate(() => window.__recs.length);
    out.pressed2 = await press();
    await p.waitForSelector('.chal [data-a=reveal]');
    out.r2 = await reveal(p);
    await p.click('.chal .fbwrap [data-a=continue]');
  } else {
    out.pressed2 = await press();
    await p.waitForSelector('.chal .mc .btn');
    await p.evaluate(() => {
      const st = RB.challenge.current();
      const norm = (h) => h.replace(/ data-src="[^"]*"/g, '');
      const want = norm(RB.ui.jhtml(st.options.find((o) => o.ok).jp));
      [...document.querySelectorAll('.chal .mc .btn')].find((x) => norm(x.innerHTML) === want).click();
    });
    await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
    await p.click('.chal .fbwrap [data-a=continue]');
  }
  // the companion's turn may ask (compPlan 'ask'): "Nothing this time", so the move measured is the player's
  for (let k = 0; k < 40; k++) {
    if (await p.evaluate(() => !!document.querySelector('.csheet .pbtn'))) { await p.evaluate(() => { const bt = [...document.querySelectorAll('.csheet .pbtn')].find((x) => /Nothing this time/i.test(x.textContent)); if (bt) bt.click(); }); break; }
    if (await p.evaluate(() => !!document.querySelector('.enc-card') && !document.querySelector('.chal'))) break;
    await p.waitForTimeout(100);
  }
  await cards();
  out.s2 = await state();
  out.recs = await p.evaluate(() => window.__recs.slice());
  out.errors = errors.slice();
  await p.context().close();
  return out;
}
for (const [wing, enc] of [['Wing 9', 'hall.w9.quarrel'], ['Wing 10', 'hall.w10.vigil']]) {
  const v = await conversation(enc, 'reveal');
  const w = await conversation(enc, 'right');
  ok(v.pressed1 && rendered(v.r1) && v.s1.soc === v.s0.soc && v.s1.log.length === v.s0.log.length && v.recs1 === 0,
    '9 ' + wing + ', "' + v.label + '": "I don\'t know" shows the answer rendered; "Choose something else": back to the cards, nothing done or recorded ' + flat({ ruby: v.r1.ruby, raw: v.r1.raw, sameBtn: v.r1.sameBtn }));
  ok(v.pressed2 && rendered(v.r2) && v.s2.soc !== v.s1.soc && v.s2.log.some((l) => l.indexOf(v.label) >= 0) && v.recs.length === 1 && v.recs[0].assisted && v.recs[0].ok && v.recs[0].ctx === 'encounter:' + enc,
    '9 ' + wing + ', the same card again, "I don\'t know", Continue: the move made (in the record and the conversation\'s state), recorded once as assisted ' + flat({ recs: v.recs, soc: v.s2.soc }));
  ok(w.pressed2 && v.s2.soc === w.s2.soc && w.recs.length === 1 && w.recs[0].ok && !w.recs[0].assisted,
    '9 ' + wing + ': the move made through "I don\'t know" leaves the conversation as a right answer does (stances, understanding, used); only the record differs (assisted) ' + flat({ right: w.s2.soc, recs: w.recs }));
  ok(!v.errors.length && !w.errors.length, '9 ' + wing + ' no page errors ' + v.errors.concat(w.errors).join('; '));
}

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
