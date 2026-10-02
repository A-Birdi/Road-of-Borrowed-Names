// Battle-screen clarity, against the built index.html in Chromium: Harmony as
// its own band (not a third resolve bar) with a one-time explanation; keyword
// help for moves and states by hover, keyboard focus and tap; the "New"
// marker on responses; Heat shown as a state and cleared by a real みず
// exchange; multiple-choice questions do not keep the right option in one
// place. Real mouse, keyboard and touch input; answers go through the
// real challenge in multiple-choice mode.
// Usage: node tests/e2e/combat_ui.mjs [filter]
import { serve, launch, page, companionTurn } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 180s')), 180000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String(e && e.message || e).slice(0, 800)); console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 600)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const phone = (w, h) => ({ viewport: { width: w, height: h }, touch: true, mobile: true, dpr: 2 });
const DESK = { viewport: { width: 1280, height: 800 } };

// Start a battle from a fresh campaign; answers are chosen from choices.
async function battle(p, enemy, o) {
  o = o || {};
  await p.evaluate(([enemy, o]) => {
    const s = RB.game.debugStart(o.map || 'rw.millroad', o.x || 10, o.y || 22, o.comp ? { comp: o.comp } : {});
    s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'F';
    s.words = (o.words || ['mamoru', 'mizu', 'hikari']).slice();
    if (o.tips) s.tips = o.tips;
    if (o.won) s.vars.battlesWon = o.won;
    RB.game.settings.input = 'choice';
    // (the telegraph panel's own keywords are tested with Expanded: in Adaptive a routine move is its badge only)
    RB.game.settings.intentDisplay = o.intents || 'adaptive';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    window.__result = null;
    RB.game.startBattle(enemy, {}).then((r) => { window.__result = r; });
  }, [enemy, o]);
  await cards(p);
}
async function cards(p) {
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp[data-i]') }));
    if (st.cards) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  await p.waitForSelector('.resp[data-i]');
  await p.waitForTimeout(150);
}
// Choose a response card by a predicate on its text, answer it correctly, continue.
async function respond(p, match, answer) {
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard')].find((x) => new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, match);
  assert(i != null, 'no response card matching ' + match);
  await p.click('.rcard[data-i="' + i + '"]');
  await p.waitForSelector('.chal .mc .btn');
  await p.evaluate((a) => [...document.querySelectorAll('.chal .mc .btn')].find((x) => x.textContent.trim() === a).click(), answer);
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  // with a companion, their turn comes next (the response is queued)
  await companionTurn(p);
}
async function flee(p) {
  await p.click('[data-flee]');
  await p.waitForSelector('.csheet .pbtn');
  await p.evaluate(() => [...document.querySelectorAll('.csheet .pbtn')].find((x) => /step back/i.test(x.textContent)).click());
  await p.waitForFunction(() => window.__result === 'flee', null, { timeout: 15000 });
  await p.waitForFunction(() => RB.game.mode() === 'world', null, { timeout: 15000 });
}
const rect = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, b: r.bottom, r: r.right }; }, sel);
const cardText = (p) => p.evaluate(() => { const c = document.querySelector('.kwcard'); return c ? c.textContent.replace(/\s+/g, ' ') : null; });

// ---------------------------------------------------------------------------
await test('Harmony is its own band above the party (not a resolve bar), names the technique, and is absent without a companion', async () => {
  for (const opts of [DESK, phone(390, 844), phone(320, 640)]) {
    const { p, errors, ctx } = await page(b, url, opts);
    await battle(p, 'rw.reedling', { comp: 'mio' });
    const r = await p.evaluate(() => {
      const party = document.querySelector('.cb-party'), band = party.querySelector('.cb-harmony'), list = party.querySelector('.pm-list');
      const bb = band.getBoundingClientRect(), pm = list.querySelector('.pm').getBoundingClientRect();
      return {
        order: band.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING,
        above: bb.bottom <= pm.top + 1, h: bb.height, w: bb.width,
        text: band.textContent.replace(/\s+/g, ' '),
        // what a screen reader hears for the level (the visual "/" is aria-hidden)
        level: [...band.querySelector('.hm-v').childNodes].filter((n) => !(n.nodeType === 1 && n.getAttribute('aria-hidden') === 'true')).map((n) => n.textContent).join(''),
        members: [...party.querySelectorAll('.pm .pm-n')].map((x) => x.textContent),
        harmonyBars: [...party.querySelectorAll('[role=meter]')].filter((x) => /harmony/i.test(x.getAttribute('aria-label') || '')).length,
        pips: band.querySelectorAll('.hp').length,
        bandBg: getComputedStyle(band).backgroundColor, partyBg: getComputedStyle(party).backgroundColor,
        isButton: band.tagName === 'BUTTON' && band.getAttribute('aria-controls') === 'kwcard',
      };
    });
    const tag = opts.viewport.width + ': ';
    assert(r.order && r.above, tag + 'band sits above the members ' + JSON.stringify(r));
    assert(!r.members.some((m) => /harmony/i.test(m)) && r.harmonyBars === 0, tag + 'Harmony is not listed as a party member or a resolve meter');
    assert(/Harmony/.test(r.text) && r.level === '0 of 3' && /Clearwater Draught/.test(r.text) && r.pips === 3, tag + 'band names Harmony, its level and the technique: ' + r.text + ' | ' + r.level);
    assert(r.bandBg !== r.partyBg, tag + 'band is a different material from the resolve slip');
    assert(r.isButton && r.h >= 44 && r.w >= 44, tag + 'band is a labelled control at least 44px: ' + r.h);
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
  const { p, errors, ctx } = await page(b, url, DESK);
  await battle(p, 'rw.reedling', {});
  assert(!(await p.$('.cb-harmony')), 'no Harmony band without a companion');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('Harmony is explained once, fills from a real clean answer, and its technique is offered by name when full', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  const seenMoves = { 'intent:strike': 1, 'intent:rest': 1, 'intent:sweep': 1 };
  await battle(p, 'rw.reedling', { comp: 'mio', tips: Object.assign({}, seenMoves) });
  let coach = await p.evaluate(() => { const c = document.querySelector('.cb-coach'); return c ? c.textContent.replace(/\s+/g, ' ') : ''; });
  assert(/Harmony/.test(coach) && /first time/.test(coach) && /Unravel/.test(coach) && /Clearwater Draught/.test(coach), 'first battle with a companion explains Harmony: ' + coach);
  assert(await p.evaluate(() => RB.game.s.tips.harmony === 1), 'the note is recorded with the campaign (s.tips)');
  await p.click('.cb-coach [data-coach-ok]');
  assert(!(await p.$('.cb-coach')), 'Got it dismisses the note');
  // one short of full, then a clean ward in front of the aimed target
  await p.evaluate(() => { RB.combat.state().harmony = 2; RB.combat.refresh(); });
  const target = await p.evaluate(() => RB.combat.state().intent.target);
  await respond(p, 'protect.*on ' + (target === 'comp' ? 'mio' : 'you'), 'まもる');
  await p.waitForFunction(() => /Harmony/.test((document.querySelector('.clog') || {}).textContent || ''), null, { timeout: 15000 });
  await cards(p);
  const full = await p.evaluate(() => ({
    h: RB.combat.state().harmony, band: document.querySelector('.cb-harmony').textContent.replace(/\s+/g, ' '),
    tech: (document.querySelector('.rcard.tech') || {}).textContent || '',
    coach: (document.querySelector('.cb-coach') || {}).textContent || '',
  }));
  assert(full.h === 3 && /Ready/.test(full.band), 'a clean counter filled Harmony: ' + JSON.stringify(full));
  assert(/Clearwater Draught/.test(full.tech) && /Restores you both/.test(full.tech) && /cancels its move/.test(full.tech), 'the technique card names Mio\'s technique and its effect: ' + full.tech);
  assert(/Clearwater Draught is ready/.test(full.coach), 'a one-time note says the technique is ready: ' + full.coach);
  // hover explains what it is, how it fills, and that each companion has one technique
  await p.hover('.cb-harmony');
  await p.waitForSelector('.kwcard');
  const t = await cardText(p);
  assert(/How it fills/.test(t) && /first time/.test(t) && /Each companion has one technique/.test(t) && /Clearwater Draught/.test(t), 'Harmony card: ' + t);
  await p.mouse.move(640, 5);
  await flee(p);
  // next encounter: the Harmony introduction does not come back
  await p.evaluate(() => { window.__result = null; RB.game.startBattle('rw.reedling', {}).then((r) => { window.__result = r; }); });
  await cards(p);
  coach = await p.evaluate(() => (document.querySelector('.cb-coach') || {}).textContent || '');
  assert(!/Harmony/.test(coach), 'the Harmony note is not shown again: ' + coach);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('keyword help: hover and keyboard focus explain the move and the states, with the real numbers (the telegraph with Expanded; the badge card with Adaptive)', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await battle(p, 'rw.mill_echo', { map: 'rw.mill1', x: 6, y: 6, comp: 'mio', tips: { harmony: 1, 'intent:strike': 1 }, intents: 'expanded' });
  await p.evaluate(() => { const st = RB.combat.state(); st.heat = 1; st.ward.comp = 2; RB.combat.refresh(); });
  // the telegraph: a single blow, 2 + 1 from Heat, never covering the line being read
  await p.hover('.intent .kw.it-kind');
  await p.waitForSelector('.kwcard');
  let t = await cardText(p);
  assert(/Strike/.test(t) && /one of you/.test(t) && /for 3 \(\+1 from Heat\)/.test(t) && /ward/i.test(t), 'Strike card: ' + t);
  const ov = await p.evaluate(() => { const a = document.querySelector('.kwcard').getBoundingClientRect(), c = document.querySelector('.intent .it-jp').getBoundingClientRect(); return a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom; });
  assert(!ov, 'the card does not cover the telegraph line');
  assert(/3 to one of you/.test(await p.textContent('.intent .kw.it-kind')), 'the telegraph shows who it hits and how hard');
  await p.mouse.move(640, 790);
  await p.waitForFunction(() => !document.querySelector('.kwcard'), null, { timeout: 3000 });
  // a state: Heat on the foe's slip
  await p.hover('.cb-foe .kw[data-kw=heat]');
  await p.waitForSelector('.kwcard');
  t = await cardText(p);
  assert(/Heat 1 of 2/.test(t) && /\+1 harder/.test(t) && /みず/.test(t), 'Heat card says what it does and what answers it: ' + t);
  await p.mouse.move(640, 790);
  await p.waitForTimeout(400);
  // a ward
  await p.hover('.cb-party .kw[data-kw="ward:comp"]');
  await p.waitForSelector('.kwcard');
  t = await cardText(p);
  assert(/Ward 2/.test(t) && /Mio/.test(t) && /blocks that Strike/.test(t), 'Ward card: ' + t);
  await p.mouse.move(640, 790);
  await p.waitForTimeout(400);
  // Sweep says it is a group attack on both of you
  await p.evaluate(() => { const st = RB.combat.state(); st.intent = RB.combatLogic.intentDef({}, 'sweep'); RB.combat.refresh(); });
  await p.hover('.intent .kw.it-kind');
  await p.waitForSelector('.kwcard');
  t = await cardText(p);
  assert(/group attack/.test(t) && /both of you/.test(t), 'Sweep card: ' + t);
  assert(/to each of you/.test(await p.textContent('.intent .kw.it-kind')), 'the Sweep telegraph says it hits each of you');
  await p.mouse.move(640, 790);
  await p.waitForTimeout(400);
  // keyboard: Tab from the responses reaches the keywords; focus opens the card; Escape closes it
  let got = null;
  for (let i = 0; i < 40 && !got; i++) {
    await p.keyboard.press('Tab');
    got = await p.evaluate(() => { const a = document.activeElement; return a && a.matches('.kw[data-kw=heat]') ? true : null; });
  }
  assert(got, 'Tab reaches the Heat keyword');
  await p.waitForSelector('.kwcard');
  assert(await p.evaluate(() => document.activeElement.getAttribute('aria-expanded') === 'true'), 'focus opens its card (aria-expanded)');
  await p.keyboard.press('Escape');
  await p.waitForFunction(() => !document.querySelector('.kwcard'));
  const after = await p.evaluate(() => ({ focus: document.activeElement.matches('.kw[data-kw=heat]'), cards: !!document.querySelector('.resp[data-i]'), mode: RB.game.mode() }));
  assert(after.focus && after.cards && after.mode === 'combat', 'Escape closes only the card: ' + JSON.stringify(after));
  // Enter on a focused keyword opens it too
  await p.keyboard.press('Enter');
  await p.waitForSelector('.kwcard');
  await p.keyboard.press('Escape');
  // every keyword is a 44 px target
  const small = await p.evaluate(() => [...document.querySelectorAll('.combat-ui .kw')].map((e) => { const r = e.getBoundingClientRect(); return [e.getAttribute('data-kw'), Math.round(r.width), Math.round(r.height)]; }).filter(([, w, h]) => w < 44 || h < 44));
  assert(!small.length, 'keywords under 44px: ' + JSON.stringify(small));
  // Adaptive: no telegraph panel for a routine move (the Sweep set above, with Heat 1); its badge's card
  // says what the telegraph said, with the real numbers
  await p.evaluate(() => { RB.game.settings.intentDisplay = 'adaptive'; RB.combat.refresh(); });
  await p.mouse.move(2, 2);
  await p.waitForTimeout(300);
  const panel = await p.evaluate(() => getComputedStyle(document.querySelector('.combat-ui .intent')).display);
  assert(panel === 'none', 'Adaptive: no telegraph panel for a routine Sweep (' + panel + ')');
  const bd = await p.evaluate(() => { const b = RB.battleIntents.state().badges[0]; return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; });
  await p.mouse.click(bd.x, bd.y);
  await p.waitForSelector('#cb-icard .ic-more');
  const ct = await p.evaluate(() => document.querySelector('#cb-icard').textContent.replace(/\s+/g, ' '));
  assert(/Sweep/.test(ct) && /to each of you/.test(ct) && /2 each \(\+1 from Heat\)/.test(ct), 'the badge card: ' + ct);
  await p.click('#cb-icard .ic-more');
  await p.waitForSelector('.kwcard');
  t = await cardText(p);
  assert(/Sweep/.test(t) && /\+1 from Heat/.test(t), 'its note has the real numbers: ' + t);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('keyword help by tap: a sheet on phones, a tap outside only closes it; fits 320px at 200% text', async () => {
  {
    const { p, errors, ctx } = await page(b, url, phone(390, 844));
    await battle(p, 'rw.mill_echo', { map: 'rw.mill1', x: 6, y: 6, comp: 'mio', tips: { harmony: 1, 'intent:strike': 1 }, intents: 'expanded' });
    await p.evaluate(() => { const st = RB.combat.state(); st.heat = 2; RB.combat.refresh(); });
    await p.tap('.cb-foe .kw[data-kw=heat]');
    await p.waitForSelector('.kwcard.sheet');
    const t = await cardText(p);
    assert(/Heat 2 of 2/.test(t) && /\+2 harder/.test(t), 'Heat 2 card: ' + t);
    const sh = await rect(p, '.kwcard');
    // a sheet across the phone, rising from the top of the party slip so Resolve and Harmony stay in view (battle addendum §16.1)
    const ps = await rect(p, '.cb-party');
    assert(sh.x <= 1 && sh.r >= 389 && Math.abs(sh.b - ps.y) <= 8 && sh.b <= ps.y + 1, 'a sheet on a phone, above the party slip: ' + JSON.stringify({ sh, ps }));
    const x = await rect(p, '.kwcard .kw-x');
    assert(x.w >= 44 && x.h >= 44, 'Close is at least 44px');
    // a tap outside (on the telegraph) only closes the card
    const it = await rect(p, '.intent .it-jp');
    await p.touchscreen.tap(it.x + it.w / 2, it.y + it.h / 2);
    await p.waitForFunction(() => !document.querySelector('.kwcard'));
    // tapping the same keyword twice opens and closes it
    await p.tap('.cb-foe .kw[data-kw=heat]');
    await p.waitForSelector('.kwcard');
    await p.tap('.cb-foe .kw[data-kw=heat]');
    await p.waitForFunction(() => !document.querySelector('.kwcard'));
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
  {
    // mouse click opens it as a pinned card: the next click elsewhere only closes it
    const { p, errors, ctx } = await page(b, url, DESK);
    await battle(p, 'rw.mill_echo', { map: 'rw.mill1', x: 6, y: 6, comp: 'mio', tips: { harmony: 1, 'intent:strike': 1 } });
    await p.evaluate(() => { RB.combat.state().heat = 1; RB.combat.refresh(); });
    await p.click('.cb-foe .kw[data-kw=heat]');
    await p.waitForSelector('.kwcard');
    await p.click('.rcard[data-i="0"]');
    await p.waitForTimeout(250);
    const s1 = await p.evaluate(() => ({ card: !!document.querySelector('.kwcard'), chal: !!document.querySelector('.chal'), cards: !!document.querySelector('.resp[data-i]') }));
    assert(!s1.card && !s1.chal && s1.cards, 'the click only closed the card: ' + JSON.stringify(s1));
    await p.click('.rcard[data-i="0"]');
    await p.waitForSelector('.chal');
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
  {
    const { p, errors, ctx } = await page(b, url, phone(320, 640));
    await p.evaluate(() => { RB.game.settings.textScale = 2; RB.game.applySettings(); });
    await battle(p, 'rw.mill_echo', { map: 'rw.mill1', x: 6, y: 6, comp: 'mio' });
    await p.evaluate(() => { const st = RB.combat.state(); st.heat = 1; st.ward.pc = 2; st.harmony = 3; RB.combat.refresh(); });
    await p.waitForTimeout(200);
    const over = await p.evaluate(() => {
      const W = innerWidth, out = [];
      if (document.documentElement.scrollWidth > W + 1) out.push('page ' + document.documentElement.scrollWidth);
      for (const e of document.querySelectorAll('.combat-ui *')) {
        if (e.closest('.sr') || e.matches('rt, rt *') || !e.getClientRects().length) continue;
        const r = e.getBoundingClientRect();
        if (r.width && (r.right > W + 1 || r.left < -1)) out.push((e.className && e.className.baseVal == null ? e.className : e.tagName) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
      }
      return out.slice(0, 6);
    });
    assert(!over.length, 'horizontal overflow at 320px / 200%: ' + over.join('; '));
    await p.evaluate(() => document.querySelector('.cb-foe .kw[data-kw=heat]').scrollIntoView({ block: 'center' }));
    await p.tap('.cb-foe .kw[data-kw=heat]');
    await p.waitForSelector('.kwcard');
    const c = await rect(p, '.kwcard');
    assert(c.x >= -1 && c.r <= 321 && c.h > 40, 'the card fits the screen at 200%: ' + JSON.stringify(c));
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
});

// ---------------------------------------------------------------------------
await test('a response used for the first time is marked New with what it answers, once; older saves are not flooded', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await battle(p, 'rw.reedling', { comp: 'mio', words: ['mamoru', 'mizu'], tips: { harmony: 1, 'intent:strike': 1 } });
  const first = await p.evaluate(() => [...document.querySelectorAll('.rcard')].map((c) => ({ t: c.textContent.replace(/\s+/g, ' '), fresh: c.classList.contains('fresh'), badge: (c.querySelector('.rc-new') || {}).textContent || '' })));
  const mizu = first.find((c) => /water/.test(c.t));
  assert(mizu && mizu.fresh && /New/.test(mizu.badge) && /Answers: Heat/.test(mizu.t) && /clears Heat/.test(mizu.t), 'みず is New and says it answers Heat: ' + JSON.stringify(mizu));
  assert(first.filter((c) => /protect/.test(c.t)).every((c) => c.fresh && /Answers: Strike/.test(c.t)), 'まもる is New and says it answers a Strike');
  assert(!first.find((c) => /Unravel/.test(c.t)).fresh, 'Unravel is not a word and is never New');
  await flee(p);
  await p.evaluate(() => { window.__result = null; RB.game.startBattle('rw.reedling', {}).then((r) => { window.__result = r; }); });
  await cards(p);
  const again = await p.evaluate(() => document.querySelectorAll('.rcard.fresh, .rcard .rc-new').length);
  assert(again === 0, 'not New the second time (' + again + ')');
  assert(await p.evaluate(() => RB.game.s.tips['word:mizu'] === 1), 'recorded with the campaign');
  await ctx.close();
  // a campaign from before these notes (battles won, no record): its words are not New
  const q = await page(b, url, DESK);
  await battle(q.p, 'rw.reedling', { comp: 'mio', won: 4 });
  const old = await q.p.evaluate(() => ({ fresh: document.querySelectorAll('.rcard.fresh').length, coach: (document.querySelector('.cb-coach') || {}).textContent || '' }));
  assert(old.fresh === 0 && !/Harmony/.test(old.coach), 'older campaign: no New words and no Harmony introduction: ' + JSON.stringify(old));
  assert(!errors.length && !q.errors.length, errors.concat(q.errors).join('; '));
  await q.ctx.close();
});

// ---------------------------------------------------------------------------
await test('Heat is shown as a state and a real みず exchange clears it; the first Heat move is introduced', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await battle(p, 'rw.mill_echo', { map: 'rw.mill1', x: 6, y: 6, comp: 'mio', reduce: true, intents: 'expanded' });
  // the first move of a new campaign is introduced by a one-time note (no animation with Reduce motion)
  const note = await p.evaluate(() => { const c = document.querySelector('.cb-coach'); return c ? { t: c.textContent, anim: getComputedStyle(c).animationName } : null; });
  assert(note && /New move: Strike/.test(note.t) && note.anim === 'none', 'first Strike introduced, no animation: ' + JSON.stringify(note));
  await p.evaluate(() => { RB.combat.state().heat = 1; RB.combat.refresh(); });
  assert(/Heat 1/.test(await p.textContent('.cb-foe')), 'Heat shows on the creature\'s plate');
  await respond(p, 'water', 'みず');
  await p.waitForFunction(() => /Heat cleared/.test((document.querySelector('.clog') || {}).textContent || ''), null, { timeout: 15000 });
  await cards(p);
  const st = await p.evaluate(() => ({ heat: RB.combat.state().heat, chip: !!document.querySelector('.cb-foe .kw[data-kw=heat]'), kind: RB.combat.state().intent.kind, coach: (document.querySelector('.cb-coach') || {}).textContent || '' }));
  assert(st.heat === 0 && !st.chip, 'みず cleared Heat: ' + JSON.stringify(st));
  // the Echo's next move is its Heat: introduced once, saying what water does
  assert(st.kind === 'heat' && /New move: Heat/.test(st.coach) && /Heat rises to 1/.test(st.coach) && /みず/.test(st.coach), 'the first Heat move is taught: ' + JSON.stringify(st));
  assert(/Heat\s*rises by 1 unless cooled/.test(await p.textContent('.intent .kw.it-kind')), 'the Heat telegraph says what it will do');
  // left unanswered (resolved through the rules): Heat 1, and the next Strike is telegraphed 1 harder
  await p.evaluate(() => { const L = RB.combatLogic, st = RB.combat.state(); L.enemyAct(st, false); L.endRound(st, Object.assign({ id: 'rw.mill_echo' }, RB.content.enemies['rw.mill_echo'])); RB.combat.refresh(); });
  const next = await p.evaluate(() => ({ kind: RB.combat.state().intent.kind, foe: document.querySelector('.cb-foe').textContent, tele: document.querySelector('.intent .kw.it-kind').textContent }));
  assert(next.kind === 'strike' && /Heat 1/.test(next.foe) && /3 to one of you/.test(next.tele), 'Heat 1 makes the next Strike 2 + 1: ' + JSON.stringify(next));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('multiple-choice questions in battle: the right option is not always in the same place', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  // note the step each question is built from (the battle asks through RB.challenge.runStep)
  await p.evaluate(() => { const run = RB.challenge.runStep; RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); }; });
  const seen = [];
  // one learner across the battles: the review clock carries on, as it does in play
  let clock = 0;
  for (let n = 0; n < 20 && seen.filter((x) => x.kind === 'choose').length < 16; n++) {
    await battle(p, 'rw.reedling', { profile: 'E' });
    await p.evaluate((c) => { RB.game.s.learn.clock = c; }, clock);
    for (let r = 0; r < 6 && !(await p.evaluate(() => window.__result)); r++) {
      const i = await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard')].find((x) => /unravel/i.test(x.textContent) && !x.disabled); return c ? c.getAttribute('data-i') : null; });
      assert(i != null, 'no Unravel card');
      await p.click('.rcard[data-i="' + i + '"]');
      await p.waitForSelector('.chal .mc .btn');
      // where the right option is on screen, found by its own text (nothing in the page marks it)
      const q = await p.evaluate(() => {
        const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
        const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
        const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
        const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
        const at = bs.findIndex((b) => right.includes(b.textContent.replace(/\s+/g, ' ').trim()));
        if (at >= 0) bs[at].click();
        return { kind: st.kind, at, n: bs.length, item: st.item, clock: RB.learn.clock() };
      });
      assert(q.at >= 0, 'the right option is on screen: ' + JSON.stringify(q));
      seen.push(q);
      await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
      await p.click('.fbwrap[data-fb=ok] .fb-go');
      await companionTurn(p);
      for (let k = 0; k < 200; k++) {
        const st = await p.evaluate(() => ({ done: !!window.__result, dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]:not([disabled])') && !document.querySelector('.chal') }));
        if (st.done || st.cards) break;
        if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
        await p.waitForTimeout(60);
      }
    }
    clock = await p.evaluate(() => RB.learn.clock());
    await p.waitForFunction(() => RB.game.mode() === 'world' || !!document.querySelector('.rcard[data-i]'), null, { timeout: 20000 });
    if (!(await p.evaluate(() => window.__result))) await flee(p);
    else await p.waitForFunction(() => RB.game.mode() === 'world', null, { timeout: 20000 }).catch(() => {});
  }
  const choose = seen.filter((x) => x.kind === 'choose');
  const places = choose.map((x) => x.at);
  console.log('  battle questions: ' + seen.length + ' (' + choose.length + ' meaning questions); right option at ' + places.join(','));
  console.log('  asked (item@clock): ' + choose.map((x) => x.item + '@' + x.clock + '→' + x.at).join(' '));
  assert(choose.length >= 8 && new Set(choose.map((x) => x.item + '@' + x.clock)).size >= 8, 'enough different meaning questions asked in battle: ' + choose.length);
  assert(new Set(places).size >= 2 && places.filter((i) => i === 0).length < places.length * 0.75, 'the right option moves between places: ' + places.join(','));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await b.close(); srv.close();
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
