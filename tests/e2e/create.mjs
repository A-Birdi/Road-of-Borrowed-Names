// New-campaign creation in the built index.html, with real clicks, keys and
// typing: the four steps (Identity, Appearance, Background, Learning setup)
// into the world; Back keeps every entry and never replays the prologue; the
// accessory limit is kept and announced; Enter in a text field never submits
// the flow; phone compositions at 320/360/390 px (also at 200 % text) and in
// landscape have no horizontal overflow, no clipped labels and ≥44 px
// principal controls; values survive resizes and rotation; an emulated
// software keyboard keeps the field and Next in view (pinch zoom is not
// mistaken for one); Inspect, placement and the New Game+ choice work; the
// campaign starts with exactly what was chosen.
// Usage: node tests/e2e/create.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0, pass = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

async function toCreation(p, slot) {
  await p.click('text=New Game');
  await p.click('.slot[data-slot="' + (slot || 1) + '"] [data-a=start]');
  await p.waitForSelector('text=Skip prologue');
  await p.click('text=Skip prologue');
  await p.waitForSelector('.folio-create #nm');
}
const step = (p) => p.evaluate(() => { const f = document.querySelector('.folio-create'); return f ? f.getAttribute('data-step') : null; });
const checked = (p) => p.evaluate(() => Array.from(document.querySelectorAll('.cr-page input:checked')).map((i) => (i.dataset.set || i.dataset.k || 'acc') + '=' + (i.dataset.v || i.dataset.acc || i.dataset.cp)).sort().join(' '));
// spies: a replayed prologue would play its song and install a new render override
const spy = (p) => p.evaluate(() => {
  window.__cr = { songs: [], overrides: 0 };
  const ps = RB.audio && RB.audio.playSong;
  if (ps) RB.audio.playSong = function (id, o) { __cr.songs.push(id); return ps.call(this, id, o); };
  const so = RB.render.setOverride;
  RB.render.setOverride = function (fn) { if (fn) __cr.overrides++; return so.call(this, fn); };
});
const noReplay = (p) => p.evaluate(() => ({ songs: __cr.songs.filter((s) => s === 'prologue').length, overrides: __cr.overrides, prologue: !!document.querySelector('.cr-prologue'), skip: /Skip prologue/.test(document.body.innerText), top: RB.ui.topLayer() && RB.ui.topLayer().name }));

// Composition checks inside the creation folio (or any open folio scrim).
const layout = (p) => p.evaluate(() => {
  const W = innerWidth, H = innerHeight;
  const out = { doc: document.documentElement.scrollWidth - W, overflow: [], small: [], clipped: [] };
  const all = document.querySelectorAll('.folio-scrim');
  const root = all[all.length - 1];
  if (!root) return Object.assign(out, { missing: true });
  const d = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') + (el.dataset.v ? '[' + el.dataset.v + ']' : '') + (el.dataset.a ? '[' + el.dataset.a + ']' : '');
  const shown = (el) => {
    if (el.closest('.sr,[hidden]')) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.clip !== 'auto') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  for (const el of root.querySelectorAll('*')) {
    if (!shown(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > W + 1 || r.left < -1) out.overflow.push(d(el) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
  }
  const ctl = root.querySelectorAll('.folio-foot .cbtn, .cr-route button:not(:disabled), .cr-page input, .cr-page button, .cr-sheet button, .folio-head .cbtn, .leaf button');
  for (const el of ctl) {
    if (!shown(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 43.5 || r.height < 43.5) out.small.push(d(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  }
  for (const el of root.querySelectorAll('.cr-route .lbl, .cr-route-cur, .cr-sw .nm, .cr-tile .nm, .cr-opt > .face, .cbtn > span, .cr-nm, .cr-entry .t, .cr-entry .d, legend, .folio-head h2, .cr-reg dd, .cr-reg dt')) {
    if (!shown(el)) continue;
    if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible') out.clipped.push(d(el));
    const r = el.getBoundingClientRect(), pr = el.parentElement.getBoundingClientRect();
    if (getComputedStyle(el.parentElement).overflow !== 'visible' && (r.right > pr.right + 1 || r.left < pr.left - 1)) out.clipped.push(d(el) + ' (outside parent)');
  }
  const q = (s) => { const e = root.querySelector(s); if (!e || !shown(e)) return null; const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: r.height, w: r.width }; };
  out.next = q('.folio-foot .cr-primary:not([hidden])');
  out.back = q('.folio-foot .cr-back');
  out.page = q('.cr-page') || q('.leaf');
  out.sheet = q('.cr-sheet');
  out.H = H; out.W = W;
  return out;
});
function judge(tag, L, opts) {
  opts = opts || {};
  ok(!L.missing && L.doc <= 0 && !L.overflow.length, tag + ': nothing wider than the screen' + (L.overflow.length ? ' — ' + L.overflow.slice(0, 5).join('; ') : '') + (L.doc > 0 ? ' doc+' + L.doc : ''));
  ok(!L.small.length, tag + ': principal controls ≥ 44 px' + (L.small.length ? ' — ' + L.small.slice(0, 6).join('; ') : ''));
  ok(!L.clipped.length, tag + ': no clipped labels' + (L.clipped.length ? ' — ' + L.clipped.slice(0, 5).join('; ') : ''));
  if (!opts.noNext) ok(L.next && L.next.bottom <= L.H + 0.5 && L.next.top >= 0, tag + ': Next/Begin is on screen');
  ok(L.page && L.page.h >= (opts.minPage || 150), tag + ': the page keeps room to work (' + (L.page && Math.round(L.page.h)) + ' px)');
  if (opts.maxSheet && L.sheet) ok(L.sheet.h <= opts.maxSheet, tag + ': the traveller slip stays compact (' + Math.round(L.sheet.h) + ' px)');
}

// ---------------------------------------------------------------------------------------------------
// 1. Desktop: the full run with mouse and keyboard; Back keeps everything; no replay
{
  const { p, ctx, errors, requests } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.click('text=New Game');
  await p.click('.slot[data-slot="1"] [data-a=start]');
  await p.waitForSelector('.cr-prologue .slip');
  const cap0 = await p.textContent('.cr-prologue .txt');
  await p.click('.cr-prologue [data-a=next]');
  const cap1 = await p.textContent('.cr-prologue .txt');
  ok(/lantern roads/.test(cap0) && /Hana/.test(cap1), 'prologue caption slip advances with Next');
  await p.click('text=Skip prologue');
  await p.waitForSelector('.folio-create #nm');
  await spy(p);
  ok(await step(p) === 'identity', 'creation opens on Identity');
  ok(await p.evaluate(() => document.activeElement && document.activeElement.id === 'nm'), 'with a keyboard and mouse, the name field has focus');
  ok(await p.evaluate(() => document.querySelector('.cr-route button[data-step="1"]').disabled), 'unvisited steps cannot be jumped to');
  await p.keyboard.type('Aki');
  ok(await p.inputValue('#nj') === 'アキ', 'Japanese name follows the typed name (アキ)');
  await p.keyboard.press('Enter');
  ok(await step(p) === 'identity' && await p.evaluate(() => document.activeElement.id === 'nj'), 'Enter in Name moves to the Japanese name, not the next step');
  await p.keyboard.press('Enter');
  ok(await step(p) === 'identity' && await p.evaluate(() => document.activeElement.dataset.a === 'next'), 'Enter in the last field moves focus to Next without pressing it');
  ok(await p.evaluate(() => /Aki/.test(document.querySelector('.cr-sheet .cr-nm').textContent)), 'the traveller sheet shows the name as typed');
  // custom pronouns: labelled fields appear
  await p.click('[data-set=pron][data-v=custom]');
  ok(await p.isVisible('#cp-they'), 'custom pronouns show labelled fields');
  await p.fill('#cp-they', 'xe'); await p.fill('#cp-them', 'xem'); await p.fill('#cp-their', 'xyr');
  await p.click('.cr-check');
  // Next by mouse
  await p.click('[data-a=next]');
  ok(await step(p) === 'appearance', 'Next goes to Appearance');
  await p.click('[data-set=skin][data-v="4"]');
  await p.click('[data-set=hair][data-v=bun]');
  await p.click('[data-set=hairColor][data-v="3"]');
  await p.click('[data-set=outfit][data-v="2"]');
  await p.click('[data-set=shape][data-v=coat]');
  ok(/Selected: Auburn/.test(await p.textContent('[data-group=hairColor] legend')) && /Selected: Moss green/.test(await p.textContent('[data-group=outfit] legend')), 'colour groups name the selected swatch in words');
  ok(await p.evaluate(() => { const i = document.querySelector('[data-set=hairColor][data-v="3"]'); return getComputedStyle(i.nextElementSibling.querySelector('.cr-tick')).display !== 'none'; }), 'the selected swatch carries a tick, not only a colour');
  // accessories: two at most, announced, never punitive
  ok(await p.isChecked('[data-acc=scarf]') && /1 of 2/.test(await p.textContent('[data-group=acc] legend')), 'accessory count starts at 1 of 2 (scarf)');
  await p.click('[data-acc=glasses]');
  ok(/2 of 2/.test(await p.textContent('[data-group=acc] legend')) && /Glasses added/.test(await p.textContent('.cr-accnote')), 'second accessory added and announced');
  await p.click('[data-acc=hat]');
  const acc = await p.evaluate(() => Array.from(document.querySelectorAll('[data-acc]:checked')).map((x) => x.dataset.acc).join());
  ok(acc === 'glasses,hat', 'a third accessory takes off the first one (limit kept): ' + acc);
  ok(/Hat added; Scarf taken off/.test(await p.textContent('.cr-accnote')) && await p.getAttribute('.cr-accnote', 'aria-live') === 'polite', 'the swap is announced in a live note');
  await p.click('[data-acc=hat]');
  ok(/Hat taken off. 1 of 2/.test(await p.textContent('.cr-accnote')), 'unticking is announced too');
  await p.click('[data-acc=hat]');
  const look2 = await checked(p);
  // Back keeps the identity entries and does not replay anything
  await p.click('[data-a=back]');
  ok(await step(p) === 'identity' && await p.inputValue('#nm') === 'Aki' && await p.inputValue('#nj') === 'アキ', 'Back to Identity keeps both names');
  ok(await p.isChecked('[data-set=pron][data-v=custom]') && await p.inputValue('#cp-them') === 'xem' && !(await p.isChecked('.cr-check input')), 'Back keeps the custom pronouns');
  let nr = await noReplay(p);
  ok(!nr.songs && !nr.overrides && !nr.prologue && !nr.skip && nr.top === 'create', 'Back does not replay the prologue ' + JSON.stringify(nr));
  // the route jumps to a visited step
  await p.click('.cr-route button[data-step="1"]');
  ok(await step(p) === 'appearance' && await checked(p) === look2, 'the route returns to Appearance with every choice kept');
  // keyboard: Enter on the focused Next button
  await p.focus('.cr-next');
  await p.keyboard.press('Enter');
  ok(await step(p) === 'background', 'Enter on Next goes to Background');
  ok(await p.isChecked('[data-set=bg][data-v=courier]'), 'the default background is marked');
  await p.click('[data-set=bg][data-v=student]');
  await p.keyboard.press('Escape');
  ok(await step(p) === 'appearance', 'Escape steps back one page');
  // a double click on Next moves one step only
  await p.dblclick('.cr-next');
  ok(await step(p) === 'background' && await p.isChecked('[data-set=bg][data-v=student]'), 'a double click on Next moves one step; the background choice is kept');
  // Tab moves through the controls (the game binds Tab to its menu elsewhere)
  await p.focus('.cr-next');
  await p.keyboard.press('Tab');
  const t1 = await p.evaluate(() => document.activeElement && (document.activeElement.dataset.a || document.activeElement.dataset.step || document.activeElement.dataset.v || document.activeElement.tagName));
  ok(t1 && t1 !== 'next', 'Tab moves focus on from Next (' + t1 + ')');
  await p.click('[data-a=next]');
  ok(await step(p) === 'learning', 'Next goes to Learning setup');
  ok(await p.isVisible('[data-group=kana]'), 'Foundations shows the kana question');
  await p.click('[data-k=profile][data-v=I]');
  ok(!(await p.isVisible('[data-group=kana]')), 'other levels hide the kana question');
  await p.click('[data-k=assist][data-v=assist]');
  await p.click('[data-k=difficulty][data-v=hard]');
  await p.click('[data-k=input][data-v=choice]');
  const learnSel = await checked(p);
  await p.click('[data-a=back]');
  ok(await step(p) === 'background' && await p.isChecked('[data-set=bg][data-v=student]'), 'Back from Learning keeps the background');
  await p.click('[data-a=next]');
  ok(await checked(p) === learnSel, 'learning choices are kept after going back and forth');
  nr = await noReplay(p);
  ok(!nr.songs && !nr.overrides && !nr.prologue, 'no prologue replay across all steps');
  ok(await p.isHidden('.cr-next') && await p.isVisible('[data-a=go]'), 'the last step offers Begin instead of Next');
  await p.click('[data-a=go]');
  await p.waitForFunction(() => RB.game.G.playing === true && (RB.game.mode() === 'dialogue' || RB.game.mode() === 'world'), null, { timeout: 15000 });
  const s = await p.evaluate(() => ({ player: RB.game.s.player, learn: { profile: RB.game.s.learn.profile, assist: RB.game.s.learn.assist, difficulty: RB.game.s.learn.difficulty, kana: RB.game.s.learn.kanaKnown }, input: RB.game.settings.input, map: RB.game.s.map, layers: document.querySelectorAll('.folio-create').length }));
  const L = s.player.look;
  ok(s.player.name === 'Aki' && s.player.nameJp === 'アキ' && s.player.bg === 'student', 'campaign: name, Japanese name, background ' + JSON.stringify([s.player.name, s.player.nameJp, s.player.bg]));
  ok(JSON.stringify(s.player.pron) === JSON.stringify({ they: 'xe', them: 'xem', their: 'xyr', theirs: 'xyrs', self: 'xemself', plural: false }), 'campaign: custom pronouns ' + JSON.stringify(s.player.pron));
  ok(L.skin === 4 && L.hair === 'bun' && L.hairColor === 3 && L.outfit === 2 && L.shape === 'coat' && L.acc.join() === 'glasses,hat', 'campaign: look ' + JSON.stringify(L));
  ok(s.learn.profile === 'I' && s.learn.assist === 'assist' && s.learn.difficulty === 'hard' && s.learn.kana === 'both' && s.input === 'choice', 'campaign: profile, assist, difficulty, input ' + JSON.stringify(s.learn) + ' ' + s.input);
  ok(s.map === 'rw.road' && s.layers === 0, 'the creation folio is gone and the story has begun');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  ok(!requests.length, 'no network requests ' + requests.join(', '));
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------
// 2. A name is needed: the error is inline, focus returns to the field
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await toCreation(p);
  await p.click('[data-a=next]');
  ok(await step(p) === 'identity' && await p.isVisible('#nm-err') && await p.evaluate(() => document.activeElement.id === 'nm' && document.activeElement.getAttribute('aria-invalid') === 'true'), 'Next without a name stays, shows why and focuses the field');
  await p.keyboard.type('Sora');
  ok(!(await p.isVisible('#nm-err')), 'typing a name clears the message');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------
// 3. Phones, landscape, 200 % text: composition of every step
const VPS = [[320, 640, 1], [360, 800, 1], [390, 844, 1], [320, 640, 2], [360, 800, 2], [390, 844, 2], [844, 390, 1], [1280, 800, 1], [1280, 800, 2]];
for (const [w, h, scale] of VPS) {
  const phone = w < 700;
  const { p, ctx, errors } = await page(b, url, { viewport: { width: w, height: h }, touch: phone, mobile: phone });
  await toCreation(p);
  if (scale !== 1) await p.evaluate((sc) => { RB.game.settings.textScale = sc; RB.game.applySettings(); }, scale);
  await p.click('#nm');
  await p.keyboard.type('Wayfarer Long');
  await p.evaluate(() => document.activeElement.blur());
  const tag = w + 'x' + h + (scale !== 1 ? ' @' + scale * 100 + '%' : '');
  const landscape = w > h && h < 540;
  const opts = { minPage: landscape ? 150 : phone ? (scale > 1 ? 200 : 300) : 300, maxSheet: phone && !landscape ? (scale > 1 ? 130 : 120) : null };
  for (const st of ['identity', 'appearance', 'background', 'learning']) {
    ok(await step(p) === st, tag + ': on ' + st);
    judge(tag + ' ' + st, await layout(p), opts);
    // scroll to the end of the page: the last control is reachable above the foot
    const end = await p.evaluate(() => {
      const pg = document.querySelector('.cr-page');
      const last = Array.from(pg.querySelectorAll('input, button')).filter((x) => x.offsetParent).pop();
      last.scrollIntoView({ block: 'nearest' });
      const r = last.getBoundingClientRect(), pr = pg.getBoundingClientRect(), f = document.querySelector('.folio-foot').getBoundingClientRect();
      // a choice taller than the page (long text at 200 %) is reachable when its top reaches the page
      if (r.height > pr.height) return Math.abs(r.top - pr.top) <= 2 && pr.bottom <= f.top + 1;
      return r.top >= pr.top - 1 && r.bottom <= pr.bottom + 1 && r.bottom <= f.top + 1;
    });
    ok(end, tag + ' ' + st + ': the last control can be scrolled into view inside the page');
    if (st !== 'learning') await p.click('[data-a=next]');
  }
  ok(!errors.length, tag + ': no page errors ' + errors.join('; '));
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------
// 4. Resizing and rotating mid-creation keeps the step and every value
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true });
  await toCreation(p);
  await p.fill('#nm', 'Resize');
  await p.click('[data-a=next]');
  await p.click('[data-set=hair][data-v=curly]');
  await p.click('[data-set=hairColor][data-v="8"]');
  await p.click('[data-acc=earrings]');
  const before = await checked(p);
  for (const [w, h] of [[844, 390], [1280, 800], [360, 800], [390, 844]]) {
    await p.setViewportSize({ width: w, height: h });
    await p.waitForTimeout(150);
    ok(await step(p) === 'appearance' && await checked(p) === before, 'after resizing to ' + w + 'x' + h + ' the step and choices are unchanged');
    judge('resized ' + w + 'x' + h, await layout(p), { minPage: 150 });
  }
  await p.click('[data-a=back]');
  ok(await p.inputValue('#nm') === 'Resize', 'the name survives the resizes');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------
// 5. Software keyboard (emulated through visualViewport) and pinch zoom
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true });
  await toCreation(p);
  await p.tap('#nm');
  await p.keyboard.type('Kei');
  const vvSet = (o) => p.evaluate((o) => {
    const vv = window.visualViewport;
    for (const k of ['height', 'offsetTop', 'scale']) { if (o && k in o) Object.defineProperty(vv, k, { configurable: true, get: () => o[k] }); else delete vv[k]; }
    vv.dispatchEvent(new Event('resize'));
  }, o);
  await vvSet({ height: 380, offsetTop: 0, scale: 1 });
  await p.waitForTimeout(120);
  const kb = await p.evaluate(() => {
    const r = (s) => document.querySelector(s).getBoundingClientRect();
    const f = r('#nm'), n = r('.folio-foot .cr-next');
    return { cls: document.querySelector('.folio-scrim').classList.contains('cr-kb'), field: [f.top, f.bottom], next: [n.top, n.bottom], focus: document.activeElement.id };
  });
  ok(kb.cls && kb.focus === 'nm', 'a keyboard-sized visual viewport fits the folio to the visible area');
  ok(kb.field[0] >= 0 && kb.field[1] <= 380 && kb.next[0] >= 0 && kb.next[1] <= 380, 'the name field and Next stay above the keyboard ' + JSON.stringify(kb));
  await p.keyboard.press('Enter');
  ok(await step(p) === 'identity' && await p.evaluate(() => document.activeElement.id === 'nj'), 'Enter on the software keyboard goes to the next field only');
  await vvSet({ height: 422, offsetTop: 200, scale: 2 });
  await p.waitForTimeout(120);
  ok(!(await p.evaluate(() => document.querySelector('.folio-scrim').classList.contains('cr-kb'))), 'pinch zoom (scale 2) is not mistaken for a keyboard');
  await vvSet(null);
  await p.waitForTimeout(120);
  ok(!(await p.evaluate(() => document.querySelector('.folio-scrim').classList.contains('cr-kb'))), 'the full layout returns when the keyboard closes');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------
// 6. Phone: Inspect shows a larger portrait and figure without leaving the step
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true });
  await toCreation(p);
  await p.fill('#nm', 'Ilo');
  await p.click('[data-a=next]');
  const small = await p.evaluate(() => document.querySelector('.cr-sheet').getBoundingClientRect().height);
  await p.click('[data-a=expand]');
  const big = await p.evaluate(() => ({ exp: document.querySelector('[data-a=expand]').getAttribute('aria-expanded'), sheet: document.querySelector('.cr-sheet').getBoundingClientRect().height, page: document.querySelector('.cr-page').getBoundingClientRect().height, port: document.querySelector('.cr-port canvas').getBoundingClientRect().width, fig: document.querySelector('.cr-fig canvas').getBoundingClientRect().height, H: innerHeight }));
  ok(big.exp === 'true' && big.port >= 140 && big.fig >= 140, 'Inspect enlarges portrait and full figure ' + JSON.stringify(big));
  ok(small <= 110 && big.sheet <= big.H * 0.6 && big.page >= big.H * 0.2, 'the compact slip is small; the inspect view leaves the page usable (' + Math.round(small) + ' → ' + Math.round(big.sheet) + ' px)');
  await p.click('[data-a=turnl]');
  ok(await p.getAttribute('.cr-fig', 'data-dir') === 'left', 'the figure turns to be seen from the side');
  await p.click('[data-a=turnl]');
  ok(await p.getAttribute('.cr-fig', 'data-dir') === 'up', 'and from behind');
  await p.click('[data-set=hair][data-v=braid]');
  ok(await p.getAttribute('[data-a=expand]', 'aria-expanded') === 'true' && await step(p) === 'appearance', 'choosing while inspecting keeps the view and the step');
  await p.click('[data-a=expand]');
  ok(await p.getAttribute('[data-a=expand]', 'aria-expanded') === 'false', 'Close view returns to the compact slip');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------
// 7. Placement from the Learning step
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true });
  await toCreation(p);
  await p.fill('#nm', 'Pla');
  for (let i = 0; i < 3; i++) await p.click('[data-a=next]');
  await p.click('[data-a=place]');
  await p.waitForSelector('.folio-place .pl-opt');
  judge('placement 390x844', await layout(p), { minPage: 300, noNext: true });
  for (const a of ['sakana', 'kitte', 'ranpu']) await p.click('.pl-opt >> text="' + a + '"');
  await p.click('text=I don\'t know this yet');
  await p.click('text=I don\'t know this yet');
  const res = await p.textContent('.cr-place');
  ok(/Suggested level/.test(res) && /Foundations/.test(res) && /skip kana lessons/.test(res), 'placement suggests Foundations, skipping kana lessons');
  await p.click('text=Use this');
  ok(await step(p) === 'learning' && await p.isChecked('[data-k=profile][data-v=F]') && await p.isChecked('[data-k=kana][data-v=both]'), 'Use this sets the level and the kana answer on the Learning page');
  ok(await p.evaluate(() => document.activeElement && document.activeElement.dataset.a === 'place'), 'focus returns to the placement button');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------
// 8. New Game+ choice (a finished campaign exists): Escape does not choose; Start fresh leads to the prologue
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true });
  await p.evaluate(async () => {
    const s = RB.state.newCampaign({ profile: 'E' });
    s.player.name = 'Veteran'; s.comp = 'ren'; s.flags.postgame = true; s.map = 'rw.village'; s.x = 22; s.y = 30;
    await RB.save.writeSlot(1, s, {});
  });
  await p.reload(); await p.waitForFunction(() => window.__RB_READY__ === true);
  await p.click('text=New Game');
  await p.click('.slot[data-slot="2"] [data-a=start]');
  await p.waitForSelector('[role=alertdialog] >> text=New Game+ from slot 1');
  judge('New Game+ 390x844', await layout(p), { minPage: 300, noNext: true });
  await p.keyboard.press('Escape');
  ok(await p.isVisible('[role=alertdialog]'), 'Escape does not pick an option');
  await p.click('[role=alertdialog] >> text=Start fresh');
  await p.waitForSelector('text=Skip prologue');
  ok(true, 'Start fresh continues to the prologue');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await ctx.close();
}

await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
