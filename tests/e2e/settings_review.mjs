// Settings as a book of the Ledger's family, and the review of a new journey's settings (ST-1; Robin, 2026-10-15:
// "tabs at the top instead of Groups on the left page's pane … option headers should read as a header itself …
// reshape the toggles / radio buttons to feel more like they're on the page … when a new save file is created it
// should prompt the user to review their important settings … voice settings should clearly explain why there may not
// be spoken lines … confirm there's a setting for the new text highlight; it should not be lumped in with Word Help").
//   1. desk: paper tabs across the top (a tablist, the arrow keys move along it), no list of groups; each tab's
//      settings on both pages; every setting's name is a heading with a sentence under it; a choice is circled (the
//      chosen one in ink, the others pencilled), an on/off setting is a tick box, a level a ruled line; the music
//      performance's options have their drawn icons; the changes apply and are kept;
//   2. Sound: why no line may be spoken (no recorded voices yet), and the spoken-word highlight as its own setting,
//      shown with no Japanese voice on the device (headless Chromium has none), apart from Word help;
//   3. phone 390×844 at the largest text: six tabs in one row, one page, nothing wider than the screen;
//   4. a new journey through the title and the setup book (CW-1): its Summary ("Before you set out") is the last look,
//      with no review after it; its More journey settings opens this book over it, with what shapes ordinary play; a
//      change there (the Japanese level, the music's volume, Suzu's speech) is the new journey's, applied when it
//      begins; 4b. a New Game+ journey keeps the review, which begins the story when the player sets out;
//   5. reduced motion: the circle is not drawn in.
// Usage: node tests/e2e/settings_review.mjs
import { serve, launch, page, settled } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const wait = (p, ms) => p.waitForTimeout(ms);
const tabs = (p) => p.evaluate(() => [...document.querySelectorAll('.folio-settings [role=tablist] [role=tab]')].map((t) => ({ id: t.dataset.id, sel: t.getAttribute('aria-selected') === 'true' })));
const sel = async (p, id) => { await p.click('.folio-settings .ptab[data-id="' + id + '"]'); await wait(p, 250); };

// ---- 1, 2: the book at a desk -----------------------------------------------------------------------------------
{
  const { p, errors, requests } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'suzu' }); });
  await wait(p, 600);
  await p.evaluate(() => RB.ui.menu.open('journey'));
  await wait(p, 400);
  await p.click('.folio [data-util="settings"]');
  await p.waitForSelector('.folio-settings .ptab');
  await wait(p, 300);
  const t = await tabs(p);
  assert(t.map((x) => x.id).join() === 'reading,learning,play,audio,display,controls' && t[0].sel, 'six paper tabs across the top, Reading first: ' + JSON.stringify(t));
  const look = await p.evaluate(() => ({ book: !!document.querySelector('.folio-settings.book'), index: !!document.querySelector('.folio-settings .index, .folio-settings [data-grp=""]'), two: !!document.querySelector('.folio-settings .spread.two'),
    leaves: [...document.querySelectorAll('.folio-settings .spread > .leaf')].map((l) => l.querySelectorAll('.sx-field').length), panel: document.querySelector('.folio-settings [role=tabpanel]').getAttribute('aria-labelledby') }));
  assert(look.book && !look.index && look.two && look.leaves[0] > 2 && look.leaves[1] > 2 && look.panel === 'tab-reading', 'a book like the Ledger: no list of groups, the tab\'s settings on both pages: ' + JSON.stringify(look));
  // the arrow keys move along the tabs
  await p.focus('.folio-settings .ptab[aria-selected="true"]');
  await p.keyboard.press('ArrowRight');
  await wait(p, 250);
  assert((await tabs(p)).find((x) => x.sel).id === 'learning' && await p.evaluate(() => !!document.querySelector('.folio-settings input[data-set="profile"]')), 'ArrowRight opens Learning, with this journey\'s level');
  // headings and sentences
  for (const id of ['reading', 'learning', 'play', 'audio', 'display']) {
    await sel(p, id);
    const h = await p.evaluate(() => {
      const fields = [...document.querySelectorAll('.folio-settings .spread .sx-field')];
      const body = parseFloat(getComputedStyle(document.querySelector('.folio-settings .leaf')).fontSize);
      const heads = fields.map((f) => f.querySelector('.sx-h')).filter(Boolean);
      return { n: fields.length, heads: heads.length, bigger: heads.every((x) => parseFloat(getComputedStyle(x).fontSize) > body), font: heads[0] && getComputedStyle(heads[0]).fontWeight, whys: fields.filter((f) => f.querySelector('.sx-why')).length };
    });
    assert(h.n && h.heads === h.n && h.bigger && +h.font >= 600 && h.whys >= h.n * 0.75, id + ': every setting is named by a heading, larger than the text, most with a sentence under it: ' + JSON.stringify(h));
  }
  // marks on the page: a circled choice
  await sel(p, 'reading');
  const ring = (v) => p.evaluate((v) => { const i = document.querySelector('input[data-set="textSpeed"][value="' + v + '"]'); const r = i.closest('.sx-opt').querySelector('.sx-ring'); const cs = getComputedStyle(r); return { checked: i.checked, op: +cs.opacity, dash: cs.strokeDasharray }; }, v);
  const r0 = [await ring('normal'), await ring('fast')];
  assert(r0[0].checked && r0[0].op === 1 && r0[0].dash === 'none' && !r0[1].checked && r0[1].op < 0.6 && r0[1].dash !== 'none', 'the chosen option is circled in ink, the others pencilled: ' + JSON.stringify(r0));
  await p.click('label.opt:has(input[data-set="textSpeed"][value="fast"])');
  await wait(p, 300);
  const r1 = [await ring('normal'), await ring('fast')];
  assert(r1[1].checked && r1[1].op === 1 && !r1[0].checked && await p.evaluate(() => RB.game.settings.textSpeed === 'fast'), 'clicking a word circles it and applies it: ' + JSON.stringify(r1));
  const anim = await p.evaluate(() => document.querySelector('input[data-set="textSpeed"][value="fast"]').closest('.sx-opt').querySelector('.sx-ring').getAnimations().length);
  assert(anim > 0, 'the new circle is drawn in (' + anim + ' animation)');
  // a tick box
  const tick = () => p.evaluate(() => { const i = document.querySelector('[data-sw="spacing"]'); const tk = i.closest('.sx-tick').querySelector('.tk'); return { on: i.checked, role: i.getAttribute('role'), tick: +getComputedStyle(tk).opacity, state: i.closest('.sx-tick').querySelector('.state').textContent, set: RB.game.settings.spacing }; });
  const k0 = await tick();
  await p.click('label.switch:has([data-sw="spacing"])');
  await wait(p, 300);
  const k1 = await tick();
  assert(k0.role === 'switch' && k0.on !== k1.on && k1.set === k1.on && k1.tick === (k1.on ? 1 : 0) && k1.state === (k1.on ? 'On' : 'Off'), 'an on/off setting is a tick box (a switch to assistive technology): ' + JSON.stringify([k0, k1]));
  // Sound: a ruled line, the music performance's icons, the voices, the highlight
  await sel(p, 'audio');
  const vol = await p.evaluate(() => { const r = document.querySelector('[data-range="vol.music"]'); r.value = '0.3'; r.dispatchEvent(new Event('input', { bubbles: true })); return { v: RB.game.settings.vol.music, fill: r.parentNode.style.getPropertyValue('--v'), out: r.parentNode.querySelector('output').textContent }; });
  assert(vol.v === 0.3 && /^30(\.0)?%$/.test(vol.fill) && vol.out === '30%', 'a level is a ruled line; its ink follows the seal: ' + JSON.stringify(vol));
  const mp = await p.evaluate(() => [...document.querySelectorAll('input[data-set="musicPerformance"]')].map((i) => { const l = i.closest('.sx-opt'); return { v: i.value, icon: !!l.querySelector('svg.sx-ic path, svg.sx-ic ellipse'), word: l.querySelector('.sx-en').textContent, line: (l.querySelector('.sx-d') || {}).textContent || '' }; }));
  assert(mp.length === 2 && mp.every((x) => x.icon && x.line) && mp.map((x) => x.word).join() === 'Original,Ensemble', 'Music performance: Original and Ensemble, each with its drawn icon and a line: ' + JSON.stringify(mp));
  const voice = await p.evaluate(() => {
    const leaf = document.querySelector('.folio-settings .spread');
    const hl = document.querySelector('[data-voicehl]');
    const f = hl && hl.closest('.sx-field');
    return { voices: RB.voice && RB.voice.japaneseVoices ? RB.voice.japaneseVoices().length : -1, note: /No recorded voices yet/.test(leaf.textContent) && /being recorded/.test(leaf.textContent) && [...leaf.querySelectorAll('input[data-set="mode"][data-obj="voice"]')].map((i) => i.value).join() === 'prepared,device,none',
      hl: !!hl, visible: !!(hl && hl.closest('.sx-tick').offsetParent), head: f && f.querySelector('.sx-h').textContent, notBulb: !!(f && !f.querySelector('[data-sw="lightbulb"]')), bulbHere: !!leaf.querySelector('[data-sw="lightbulb"]'), on: hl && hl.checked };
  });
  assert(voice.voices === 0 && voice.note, 'Sound says why no line is spoken (no recorded voices yet, none on this device) and offers who speaks: ' + JSON.stringify(voice));
  assert(voice.hl && voice.visible && voice.head === 'Highlight each word as it is spoken' && voice.notBulb && !voice.bulbHere && voice.on, 'the spoken-word highlight is its own setting, shown without a device voice, on a different tab from Word help: ' + JSON.stringify(voice));
  await p.click('label.switch:has([data-voicehl])');
  await wait(p, 300);
  assert(await p.evaluate(() => RB.game.settings.voice.highlight === false), 'and it turns off');
  await p.click('label.switch:has([data-voicehl])');
  await wait(p, 200);
  // closing and opening again keeps the tab; the changes were kept
  await p.click('.folio-settings [data-folio-close]');
  await wait(p, 300);
  const kept = await p.evaluate(async () => { const s = await RB.save.loadSettings(); return { speed: s.textSpeed, music: s.vol.music, hl: s.voice.highlight, menu: RB.ui.menu.isOpen(), open: RB.ui.settings.isOpen() }; });
  assert(kept.speed === 'fast' && kept.music === 0.3 && kept.hl === true && kept.menu && !kept.open, 'Back returns to the Ledger; the changes were saved: ' + JSON.stringify(kept));
  assert(!errors.length && !requests.length, 'no page errors, nothing fetched: ' + errors.concat(requests).join('; '));
  await p.context().close();
}

// ---- 3: a phone at the largest text ----------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, mobile: true, touch: true });
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' }); RB.ui.settings.open(); });
  await wait(p, 600);
  const row = await p.evaluate(() => { const w = document.querySelector('.folio-settings .tabrail-wrap'); const ts = [...w.querySelectorAll('.ptab')].map((x) => x.getBoundingClientRect()); return { over: w.classList.contains('overflowing'), top: Math.max(...ts.map((r) => r.top)) - Math.min(...ts.map((r) => r.top)), right: Math.max(...ts.map((r) => r.right)) }; });
  assert(!row.over && row.top < 8 && row.right <= 390, 'the six tabs in one row (the open one raised), none under a scroll arrow: ' + JSON.stringify(row));
  await p.evaluate(() => { RB.game.settings.textScale = 1.5; RB.game.applySettings(); });
  for (const id of ['reading', 'learning', 'play', 'audio', 'display', 'controls']) {
    await p.evaluate((id) => RB.ui.settings.tab(id), id);
    await wait(p, 200);
    const o = await p.evaluate(() => { const L = document.querySelector('.folio-settings .spread > .leaf'); const wide = [...L.querySelectorAll('.sx-field, .sx-opt, .sx-tick, .sx-slider, .sx-mix')].filter((e) => e.getBoundingClientRect().right > L.getBoundingClientRect().right + 1).length; return { page: document.documentElement.scrollWidth <= innerWidth, leaf: L.scrollWidth <= L.clientWidth + 1, wide, one: !document.querySelector('.folio-settings .spread.two') }; });
    assert(o.page && o.leaf && !o.wide && o.one, 'phone, largest text, ' + id + ': one page, nothing wider than it: ' + JSON.stringify(o));
  }
  assert(!errors.length, 'no page errors: ' + errors.join('; '));
  await p.context().close();
}

// ---- 4: a new journey: its Summary ("Before you set out", CW-1) and the Settings book over it ----------------------
{
  const { p, errors, requests } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.click('text=New Game');
  await p.click('.slot[data-slot="1"] [data-a=start]');
  await p.click('text=Skip prologue');
  await p.click('.csheet button:has-text("Skip the prologue")');
  await p.fill('#nm', 'Kit');
  for (let i = 0; i < 3; i++) await p.click('[data-a=next]');
  await p.click('[data-k=profile][data-v=E]');
  await p.click('[data-a=next]');
  await settled(p);
  await p.waitForSelector('.folio-create[data-step=summary] .cr-sumpage');
  // the Summary: what is set in ruled rows with Edit, the sound with its own button, every other setting one press away
  const sum = await p.evaluate(() => { const f = document.querySelector('.cr-sumpage'); return { text: f.innerText, sound: !!f.querySelector('[data-a=sound]'), more: !!f.querySelector('[data-a=more]'), go: !!document.querySelector('.folio-create [data-a=go]:not([hidden])'), review: !!document.querySelector('.folio-review'), playing: RB.game.G.playing }; });
  assert(/Elementary/.test(sum.text) && /Assisted: no learning-error battle cost/.test(sum.text) && /Tactical challenge\s*Standard/i.test(sum.text) && sum.sound && sum.more && sum.go && !sum.review && !sum.playing,
    'the Summary: level, mistakes, tactics, sound (with its button), More journey settings and Begin; no review, nothing begun: ' + JSON.stringify(Object.assign({}, sum, { text: sum.text.slice(0, 300) })));
  await p.click('.cr-sumpage [data-a=more]');
  await p.waitForSelector('.folio-draft .ptab');
  await wait(p, 300);
  const seen = new Set();
  let miss = [];
  for (const id of ['reading', 'learning', 'play', 'audio', 'display', 'controls']) {
    await p.evaluate((id) => RB.ui.settings.tab(id), id);
    await wait(p, 150);
    (await p.evaluate(() => { const f = document.querySelector('.folio-draft'); return ['input[data-set="profile"]', 'input[data-set="assist"]', 'input[data-set="difficulty"]', 'input[data-set="questGuide"]', 'input[data-set="lead"]', 'input[data-set="secondary"]', '[data-sw="spacing"]', '[data-sw="lightbulb"]',
      'input[data-set="textSpeed"]', '[data-range="vol.master"]', '[data-range="vol.music"]', '[data-range="vol.sfx"]', 'input[data-set="musicPerformance"]', 'input[data-suzu-speech]', 'input[data-set="outcomeView"]',
      'input[data-set="bathScenes"]', 'input[data-set="battleAnim"]', '[data-voicehl]'].filter((x) => !!f.querySelector(x)); })).forEach((x) => seen.add(x));
  }
  const r = await p.evaluate(() => ({ top: RB.ui.topLayer().name, playing: RB.game.G.playing, story: RB.script.isRunning(), tabs: [...document.querySelectorAll('.folio-draft .ptab')].map((x) => x.dataset.id).join(), level: (document.querySelector('.folio-draft input[data-set="profile"]:checked') || {}).value }));
  await p.evaluate(() => RB.ui.settings.tab('learning'));
  await wait(p, 150);
  const level = await p.evaluate(() => (document.querySelector('.folio-draft input[data-set="profile"]:checked') || {}).value);
  miss = ['input[data-set="profile"]', 'input[data-set="assist"]', 'input[data-set="difficulty"]', 'input[data-set="questGuide"]', 'input[data-set="lead"]', 'input[data-set="secondary"]', '[data-sw="spacing"]', '[data-sw="lightbulb"]', 'input[data-set="textSpeed"]', '[data-range="vol.master"]', '[data-range="vol.music"]', '[data-range="vol.sfx"]', 'input[data-set="musicPerformance"]', 'input[data-suzu-speech]', 'input[data-set="outcomeView"]', 'input[data-set="bathScenes"]', 'input[data-set="battleAnim"]', '[data-voicehl]'].filter((x) => !seen.has(x));
  assert(r.top === 'settings-draft' && !r.playing && !r.story && /^reading,learning,play,audio,display,controls$/.test(r.tabs), 'More journey settings opens the Settings book over the Summary, before the story: ' + JSON.stringify(r));
  assert(!miss.length && level === 'E', 'it holds what shapes ordinary play (level as chosen: ' + level + '; missing: ' + miss.join(', ') + ')');
  // a change there is the new journey's, kept in the setup until it begins
  await p.click('.folio-draft label.opt:has(input[data-set="profile"][value="A"])');
  await wait(p, 250);
  await p.evaluate(() => RB.ui.settings.tab('audio'));
  await wait(p, 150);
  await p.evaluate(() => { const x = document.querySelector('.folio-draft [data-range="vol.music"]'); x.value = '0.25'; x.dispatchEvent(new Event('input', { bubbles: true })); });
  await p.evaluate(() => RB.ui.settings.tab('reading'));
  await wait(p, 150);
  await p.click('.folio-draft label.opt:has(input[data-suzu-speech][value="kansai"])');
  await wait(p, 300);
  const mid = await p.evaluate(async () => ({ shown: !!document.querySelector('.folio-draft input[data-suzu-speech][value="kansai"]:checked'), suzu: RB.game.settings.suzuSpeech || 'standard', saved: ((await RB.save.loadSettings()) || {}).suzuSpeech || 'standard', music: RB.game.settings.vol.music }));
  assert(mid.shown && mid.suzu === 'standard' && mid.saved === 'standard' && mid.music === 0.25, 'Suzu\'s speech chosen here waits for Begin; the music\'s volume is heard at once: ' + JSON.stringify(mid));
  await p.keyboard.press('Escape');
  await p.waitForFunction(() => !RB.ui.settings.isOpen());
  assert(await p.evaluate(() => document.querySelector('.folio-create').getAttribute('data-step') === 'summary' && /Advanced/.test(document.querySelector('.cr-sumpage').innerText) && !RB.game.G.playing), 'Escape returns to the Summary, which shows Advanced; nothing has begun');
  await p.click('.folio-create [data-a=go]');
  await p.waitForFunction(() => RB.game.G.playing === true && !RB.ui.settings.isOpen(), null, { timeout: 15000 });
  await wait(p, 800);
  const s = await p.evaluate(async () => ({ level: RB.game.s.learn.profile, name: RB.game.s.player.name, music: RB.game.settings.vol.music, saved: (await RB.save.loadSettings()).vol.music, suzu: (await RB.save.loadSettings()).suzuSpeech, mode: RB.game.mode(), map: RB.game.s.map,
    auto: await (async () => { const r = await RB.save.read(1, 'auto').catch(() => null); return r && r.state && r.state.learn.profile; })() }));
  assert(s.level === 'A' && s.name === 'Kit' && s.music === 0.25 && s.saved === 0.25 && s.suzu === 'kansai', 'Begin: the journey begins with the level chosen in the editor, the volume and Suzu\'s speech kept: ' + JSON.stringify(s));
  assert(s.auto === 'A' && (s.mode === 'dialogue' || s.mode === 'world') && s.map === 'rw.road', 'the first autosave has it, and the story has begun: ' + JSON.stringify(s));
  assert(!errors.length && !requests.length, 'no page errors, nothing fetched: ' + errors.concat(requests).join('; '));
  await p.context().close();
}

// ---- 4b: New Game+ keeps its review ("Before you set out" in the Settings book, ST-1b) ------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(async () => {
    const s = RB.state.newCampaign({ profile: 'I', edition: RB.edition.forNew() });
    s.player.name = 'Veteran'; s.comp = 'ren'; s.flags.postgame = true; s.map = 'rw.village'; s.x = 22; s.y = 30;
    await RB.save.writeSlot(1, s, {});
  });
  await p.reload(); await p.waitForFunction(() => window.__RB_READY__ === true);
  await p.click('text=New Game');
  await p.click('.slot[data-slot="2"] [data-a=start]');
  await p.click('[role=alertdialog] >> text=New Game+ from slot 1');
  for (let i = 0; i < 400 && !(await p.evaluate(() => RB.ui.settings.reviewing())); i++) {
    if (await p.evaluate(() => RB.ui.dialogue.isOpen())) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(50);
  }
  const ng = await p.evaluate(() => ({ reviewing: RB.ui.settings.reviewing(), create: !!document.querySelector('.folio-create'), playing: RB.game.G.playing, start: !!document.querySelector('.folio-review .ptab[data-id="start"]') }));
  assert(ng.reviewing && !ng.create && !ng.playing && ng.start, 'a New Game+ journey still opens its review, with no setup book: ' + JSON.stringify(ng));
  await p.click('.folio-review [data-review-go]');
  await p.waitForFunction(() => RB.game.G.playing === true, null, { timeout: 15000 });
  assert(await p.evaluate(() => RB.game.s.ngplus === 1 && RB.game.s.player.name === 'Veteran'), 'Set out begins the New Game+ journey');
  assert(!errors.length, 'no page errors: ' + errors.join('; '));
  await p.context().close();
}

// ---- 5: reduced motion ----------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, {}); RB.game.settings.reducedMotion = true; RB.game.applySettings(); RB.ui.settings.open('play'); });
  await wait(p, 500);
  await p.click('label.opt:has(input[data-set="battleAnim"][value="fast"])');
  await wait(p, 250);
  const a = await p.evaluate(() => ({ set: RB.game.settings.battleAnim, anims: document.querySelector('input[data-set="battleAnim"][value="fast"]').closest('.sx-opt').querySelector('.sx-ring').getAnimations().length, tab: RB.ui.settings.current() }));
  assert(a.set === 'fast' && a.anims === 0 && a.tab === 'play', 'reduced motion: the choice applies, nothing is drawn in; open(\'play\') opened Play: ' + JSON.stringify(a));
  assert(!errors.length, 'no page errors: ' + errors.join('; '));
  await p.context().close();
}

await b.close(); srv.close();
console.log(fail ? fail + ' failed' : 'all settings-review checks passed');
process.exit(fail ? 1 : 0);
