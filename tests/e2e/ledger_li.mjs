// The Ledger and award round of 2026-10-16 (LI-3 to LI-9), in the built game:
//   1. LI-3: a received item's slip shows its drawn icon and name, plays one sound, can be closed at once, and puts a
//      glowing "new" mark on the Ledger's button; a recorded moment has its own slip and sound; slips slide in with a
//      gold flare round them;
//   2. LI-4 / LI-9: the dialogue strip rises into place; pointing at a Japanese word marks its English counterpart (and
//      the other way), and with the Highlight setting off nothing is marked;
//   3. LI-5: Journey's pages are coloured ribbons on the cover by the left page (the page's own buttons, one each);
//      pointing draws one out with its name; a press turns to that page, which the running head names; the keyboard
//      turns them too and keeps its place; Save & Load is beside Settings and opens a slip of three choices (Escape
//      closes it back to its button); Words has no empty "Contents" heading over its sections, and says "Practice";
//   4. LI-6: the Route chart marks where you are with a pulsing ring, zooms with its buttons and moves when dragged;
//      every place keeps its name in the chart, and no name shown runs past the chart's edge;
//   5. LI-7: Known details: the pin's note is dark ink while typed; People notes run across the page and say where in
//      the town; the key has its three groups;
//   6. a phone: the pages are ribbon tags in a row, nothing wider than the screen;
//   7. reduced motion: no slide, no flare, no rising strip, the ring still.
// Usage: node tests/e2e/ledger_li.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const wait = (p, ms) => p.waitForTimeout(ms);
const start = (p, map, x, y) => p.evaluate(([map, x, y]) => {
  const s = RB.game.debugStart(map, x, y, { comp: 'mio', flags: { departed: true } });
  s.edition = 2;
  return true;
}, [map, x, y]);

// ---- 1, 2: slips and the dialogue strip --------------------------------------------------------------------------
{
  const { p, errors, requests } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'rw.village', 22, 30);
  await wait(p, 500);
  const got = await p.evaluate(async () => {
    const calls = [];
    const was = RB.audio.sfx;
    RB.audio.sfx = function (id) { calls.push(id); return was.apply(this, arguments); };
    RB.state.give(RB.game.s, 'rw_letter');
    RB.ui.toast({ kind: 'item', id: 'rw_letter', jp: RB.content.items.rw_letter.name.jp, en: RB.content.items.rw_letter.name.en });
    await new Promise((r) => setTimeout(r, 120));
    RB.audio.sfx = was;
    const n = document.querySelector('.toast.award.aw-item');
    const dot = document.querySelector('.hbtn.menu-b .new-dot');
    return {
      slip: !!n, icon: !!(n && n.querySelector('.aw-art img.it-ic')), name: n ? n.querySelector('.aw-name').textContent : '', close: !!(n && n.querySelector('.aw-x')),
      slide: !!(n && n.classList.contains('aw-in')), flare: !!(n && n.querySelector('.aw-flair')), sounds: calls,
      dot: !!dot, glow: dot ? getComputedStyle(dot).animationName : '',
    };
  });
  assert(got.slip && got.icon && /Letter of introduction/.test(got.name) && got.close, 'LI-3: the slip shows the item\'s drawn icon and name, with a close button: ' + JSON.stringify(got));
  assert(got.sounds.filter((x) => x === 'item_get').length === 1 && got.sounds.length === 1, 'LI-3: one sound for one item: ' + JSON.stringify(got.sounds));
  assert(got.slide && got.flare, 'LI-3: it slides in with its gold flare');
  assert(got.dot && got.glow === 'new-glow', 'LI-3: the Ledger\'s button has the glowing "new" mark');
  await p.click('.toast.award.aw-item .aw-x');
  await wait(p, 300);
  assert(await p.evaluate(() => !document.querySelector('.toast.award.aw-item')), 'LI-3: the close button takes the slip away at once');
  const moment = await p.evaluate(async () => {
    const calls = [];
    const was = RB.audio.sfx;
    RB.audio.sfx = function (id) { calls.push(id); return was.apply(this, arguments); };
    RB.ui.award({ kind: 'moment', jp: '{序章|じょしょう}', en: 'Prologue' });
    await new Promise((r) => setTimeout(r, 120));
    RB.audio.sfx = was;
    const n = document.querySelector('.toast.award.aw-moment');
    return { slip: !!n, kind: n ? n.querySelector('.kind').textContent : '', sounds: calls };
  });
  assert(moment.slip && /Moment recorded/.test(moment.kind) && moment.sounds.join() === 'moment', 'LI-3: a recorded moment has its own slip and its own sound: ' + JSON.stringify(moment));
  await p.evaluate(() => document.querySelectorAll('.toast.award').forEach((n) => n.remove()));

  // the dialogue strip, and pointing at a word
  await p.evaluate(() => {
    const st = RB.game.settings; st.lead = 'ja'; st.secondary = 'always'; st.textSpeed = 'instant'; RB.game.applySettings();
    RB.ui.dialogue.say({ sceneId: 'test.li9', who: 'tsuru', jp: '{川|かわ} の {水|みず} は {冷|つめ}たい ね 。', en: 'The river water is cold.' });
  });
  await p.waitForSelector('.dlg .main .jline[data-src] .jt[data-i]');
  const rose = await p.evaluate(() => { const d = document.querySelector('.dlg'); return d.classList.contains('dlg-in') || !!d.querySelector('.dlg-in') || getComputedStyle(d).animationName; });
  assert(!!rose && rose !== 'none', 'LI-4: the strip rises into place as it opens: ' + rose);
  await wait(p, 500);
  const at = (sel, txt) => p.evaluate(([sel, txt]) => { const e = [...document.querySelectorAll(sel)].find((x) => x.textContent.replace(/\s/g, '').startsWith(txt)); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, [sel, txt]);
  let pt = await at('.dlg .main .jline .jt[data-i]', '川');
  await p.mouse.move(pt.x, pt.y);
  await wait(p, 150);
  const hov = await p.evaluate(() => ({ jp: [...document.querySelectorAll('.dlg .jt.hov')].map((e) => e.textContent), en: [...document.querySelectorAll('.dlg .ew.hov')].map((e) => e.textContent) }));
  assert(hov.jp.some((t) => /川/.test(t)) && hov.en.some((t) => /river/i.test(t)), 'LI-9: pointing at 川 marks "river": ' + JSON.stringify(hov));
  pt = await at('.dlg .enline .ew', 'water');
  await p.mouse.move(pt.x, pt.y);
  await wait(p, 150);
  const back = await p.evaluate(() => ({ jp: [...document.querySelectorAll('.dlg .jt.hov')].map((e) => e.textContent), en: [...document.querySelectorAll('.dlg .ew.hov')].map((e) => e.textContent) }));
  assert(back.en.some((t) => /water/.test(t)) && back.jp.some((t) => /水/.test(t)), 'LI-9: and pointing at "water" marks 水: ' + JSON.stringify(back));
  await p.evaluate(() => { RB.game.settings.voice.highlight = false; });
  await p.mouse.move(2, 2);
  pt = await at('.dlg .main .jline .jt[data-i]', '川');
  await p.mouse.move(pt.x, pt.y);
  await wait(p, 150);
  assert(await p.evaluate(() => !document.querySelector('.dlg .hov')), 'LI-9: with Highlight off, nothing is marked');
  await p.evaluate(() => { RB.game.settings.voice.highlight = true; });
  assert(!errors.length && !requests.length, 'no page errors or network requests: ' + errors.concat(requests).join(' | '));
  await p.context().close();
}

// ---- 3, 4, 5: the Ledger at a desk --------------------------------------------------------------------------------
{
  const { p, errors, requests } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'rw.village', 22, 30);
  await p.evaluate(() => {
    const s = RB.game.s, R = RB.town.rec(s), t = Date.now();
    R.lastSeen.oto = { map: 'rw.village', t: t - 1000, x: 29, y: 17 };
    R.lastSeen.mame = { map: 'rw.village', t: t - 9000 };
    RB.ui.menu.open('journey');
  });
  await wait(p, 1200);
  const rail = await p.evaluate(() => {
    const ms = [...document.querySelectorAll('.folio.book .bk-marks .bm')];
    return { n: ms.length, ids: ms.map((m) => m.dataset.jv), inks: new Set(ms.map((m) => m.style.getPropertyValue('--bm'))).size, onPage: !!document.querySelector('.folio.book .leaf .subnav:not(.sub2)'),
      dup: document.querySelectorAll('.folio [data-jv="history"]').length, room: document.querySelector('.folio.book').classList.contains('bm-room') };
  });
  assert(rail.n >= 3 && rail.inks === rail.n && !rail.onPage && rail.dup === 1 && rail.room, 'LI-5: Journey\'s pages are coloured ribbons on the cover, one button each: ' + JSON.stringify(rail));
  const lbl = async () => p.evaluate(() => { const l = document.querySelector('.bk-marks .bm[data-jv="history"] .bm-label'); return getComputedStyle(l).clipPath; });
  const before = await lbl();
  await p.hover('.bk-marks .bm[data-jv="history"]');
  await wait(p, 260);
  const after = await lbl();
  assert(/inset\(0px 100%/.test(before) && /inset\(0px\)|inset\(0px 0px/.test(after), 'LI-5: pointing draws the ribbon out with its name (' + before + ' → ' + after + ')');
  await p.click('.bk-marks .bm[data-jv="history"]');
  await wait(p, 300);
  const turned = await p.evaluate(() => ({ view: RB.ui.menu.current().journey, head: (document.querySelector('.bk-runhead .bk-subp') || {}).textContent, on: document.querySelector('.bk-marks .bm[aria-pressed="true"]').dataset.jv, curl: !!document.querySelector('.bk-marks .bm.curl') }));
  assert(turned.view === 'history' && turned.head === 'Dialogue history' && turned.on === 'history' && turned.curl, 'LI-5: a press turns to the page; the running head names it; the ribbon curls on: ' + JSON.stringify(turned));
  await p.focus('.bk-marks .bm[data-jv="quests"]');
  await p.keyboard.press('Enter');
  await wait(p, 300);
  const key = await p.evaluate(() => ({ view: RB.ui.menu.current().journey, focus: document.activeElement && document.activeElement.dataset.jv }));
  assert(key.view === 'quests' && key.focus === 'quests', 'LI-5: the keyboard turns the pages too and keeps its place: ' + JSON.stringify(key));

  // Save & Load
  const foot = await p.evaluate(() => { const f = document.querySelector('.folio.book .folio-foot'); return !!(f && f.offsetParent); });
  await p.click('.folio [data-util="save"]');
  await wait(p, 200);
  const slip = await p.evaluate(() => ({ opts: [...document.querySelectorAll('.sv-slip .sv-opt')].map((o) => o.dataset.a), focus: document.activeElement && document.activeElement.dataset.a, exp: document.querySelector('[data-util="save"]').getAttribute('aria-expanded') }));
  assert(!foot && slip.opts.join() === 'save,load,title' && slip.focus === 'save' && slip.exp === 'true', 'LI-5: Save & Load sits on the cover and opens a slip of its three choices: ' + JSON.stringify({ foot, slip }));
  await p.keyboard.press('ArrowDown');
  assert(await p.evaluate(() => document.activeElement && document.activeElement.dataset.a) === 'load', 'LI-5: the arrow keys move along the slip');
  await p.keyboard.press('Escape');
  await wait(p, 150);
  const shut = await p.evaluate(() => ({ slip: !!document.querySelector('.sv-slip'), open: RB.ui.menu.isOpen(), focus: document.activeElement && document.activeElement.dataset.util }));
  assert(!shut.slip && shut.open && shut.focus === 'save', 'LI-5: Escape closes the slip back to its button: ' + JSON.stringify(shut));

  // Words
  await p.evaluate(() => RB.ui.menu.open('words'));
  await wait(p, 500);
  const words = await p.evaluate(() => { const A = document.querySelector('.folio.book .leaf'); return { contents: [...A.querySelectorAll('h3')].some((h) => /^Contents$/.test(h.textContent.trim())), secs: A.querySelectorAll('h4.index-sec').length, text: document.querySelector('#folio-page').textContent }; });
  assert(!words.contents && words.secs === 3, 'LI-5: Words has its three sections and no empty "Contents" heading: ' + JSON.stringify({ contents: words.contents, secs: words.secs }));
  assert(!/practis/i.test(words.text) && /Practice/.test(words.text), 'LI-5: "Practice", spelt so');

  // the Route chart
  await p.evaluate(() => { const s = RB.game.s; for (const id of Object.keys(RB.content.places)) s.travel[id] = true; RB.ui.menu.open('map'); });
  await wait(p, 600);
  const vb = () => p.evaluate(() => document.querySelector('.chart').getAttribute('viewBox').split(' ').map(Number));
  const c0 = await p.evaluate(() => {
    const svg = document.querySelector('.chart'), r = svg.getBoundingClientRect();
    const names = [...svg.querySelectorAll('text')].map((t) => t.textContent);
    const out = [...svg.querySelectorAll('.pl:not(.quiet) text')].filter((t) => { const b = t.getBoundingClientRect(); return b.left < r.left - 1 || b.right > r.right + 1 || b.top < r.top - 1 || b.bottom > r.bottom + 1; }).map((t) => t.textContent);
    return { pulse: !!svg.querySelector('.here .here-pulse'), anim: getComputedStyle(svg.querySelector('.here-pulse')).animationName, here: (svg.querySelector('.here text') || {}).textContent,
      names, places: Object.keys(RB.content.places).length, out, outDisabled: document.querySelector('[data-cz="out"]').disabled };
  });
  assert(c0.pulse && c0.anim === 'here-pulse' && c0.here === 'Reedwake', 'LI-6: where you are is a pulsing ring with its name: ' + JSON.stringify({ pulse: c0.pulse, anim: c0.anim, here: c0.here }));
  assert(c0.names.length === c0.places && !c0.out.length && c0.outDisabled, 'LI-6: every place has its name, none shown runs past the edge, and the whole chart is in view: ' + JSON.stringify({ n: c0.names.length, of: c0.places, out: c0.out }));
  const v0 = await vb();
  await p.click('[data-cz="in"]');
  await p.click('[data-cz="in"]');
  await wait(p, 150);
  const v1 = await vb();
  const bb = await (await p.$('.chartbox')).boundingBox();
  await p.mouse.move(bb.x + bb.width * 0.6, bb.y + bb.height * 0.6);
  await p.mouse.down();
  await p.mouse.move(bb.x + bb.width * 0.3, bb.y + bb.height * 0.4, { steps: 6 });
  await p.mouse.up();
  await wait(p, 150);
  const v2 = await vb();
  const out2 = await p.evaluate(() => { const svg = document.querySelector('.chart'), r = svg.getBoundingClientRect(); return [...svg.querySelectorAll('.pl:not(.quiet) text')].filter((t) => { const b = t.getBoundingClientRect(); const inView = b.right > r.left && b.left < r.right && b.bottom > r.top && b.top < r.bottom; return inView && (b.left < r.left - 1 || b.right > r.right + 1); }).map((t) => t.textContent); });
  assert(v1[2] < v0[2] * 0.5 && (v2[0] !== v1[0] || v2[1] !== v1[1]), 'LI-6: the buttons zoom in and a drag moves the chart: ' + JSON.stringify({ v0, v1, v2 }));
  assert(!out2.length, 'LI-6: zoomed in, the names in view keep inside it: ' + out2.join(', '));

  // Known details
  await p.evaluate(() => { const b = document.querySelector('[data-mv="known"]'); b.click(); });
  await wait(p, 400);
  await p.evaluate(() => document.querySelector('[data-k="new"]').click());
  await wait(p, 200);
  await p.fill('#kd-note', 'Come back with a lantern');
  const kd = await p.evaluate(() => {
    const ta = document.querySelector('#kd-note'), c = getComputedStyle(ta).color.match(/\d+/g).map(Number);
    const lum = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
    const oto = [...document.querySelectorAll('.kd-people li')].find((li) => /Oto/.test(li.textContent));
    const line = oto && oto.querySelector('.small');
    return { lum, text: line ? line.textContent : '', wide: line ? line.getBoundingClientRect().width : 0, high: line ? line.getBoundingClientRect().height : 0,
      groups: document.querySelectorAll('.kd-key .kd-key-g').length, mame: ([...document.querySelectorAll('.kd-people li')].find((li) => /Mame/.test(li.textContent)) || {}).textContent || '' };
  });
  assert(kd.lum < 0.35, 'LI-7: the note is dark ink while typed (luminance ' + kd.lum.toFixed(2) + ')');
  assert(/outside Hana's Teahouse, in Reedwake/.test(kd.text) && kd.wide > 200 && kd.high < 60, 'LI-7: a person\'s note runs across the page and says where in the town: ' + JSON.stringify(kd));
  assert(/You last saw them at Reedwake/.test(kd.mame) && kd.groups === 3, 'LI-7: an older note still names the town; the key has its three groups');
  assert(!errors.length && !requests.length, 'no page errors or network requests: ' + errors.concat(requests).join(' | '));
  await p.context().close();
}

// ---- 6: a phone -------------------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true });
  await start(p, 'rw.village', 22, 30);
  await p.evaluate(() => RB.ui.menu.open('journey'));
  await wait(p, 1200);
  const ph = await p.evaluate(() => ({ chips: document.querySelectorAll('.folio.book .subnav.bm-chips > .subbtn').length, rail: !!document.querySelector('.bk-marks'), wide: document.scrollingElement.scrollWidth }));
  assert(ph.chips >= 3 && !ph.rail && ph.wide <= 390, 'a phone: the pages are ribbon tags in a row, nothing wider than the screen: ' + JSON.stringify(ph));
  assert(!errors.length, 'no page errors on the phone: ' + errors.join(' | '));
  await p.context().close();
}

// ---- 7: reduced motion ----------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'rw.village', 22, 30);
  await p.evaluate(() => { RB.game.settings.reducedMotion = true; RB.game.applySettings && RB.game.applySettings(); document.body.classList.add('reduced-motion'); });
  await wait(p, 200);
  const rm = await p.evaluate(async () => {
    RB.ui.toast({ kind: 'item', id: 'rw_letter', en: RB.content.items.rw_letter.name.en });
    await new Promise((r) => setTimeout(r, 120));
    const n = document.querySelector('.toast.award');
    const flare = n && n.querySelector('.aw-flair');
    return { slide: n ? n.classList.contains('aw-in') : null, flare: !!(flare && getComputedStyle(flare).display !== 'none') };
  });
  await p.evaluate(() => { document.querySelectorAll('.toast.award').forEach((n) => n.remove()); RB.ui.menu.open('map'); });
  await wait(p, 600);
  const ring = await p.evaluate(() => getComputedStyle(document.querySelector('.here-pulse')).animationName);
  assert(rm.slide === false && !rm.flare && ring === 'none', 'reduced motion: no slide, no flare, the ring still: ' + JSON.stringify({ rm, ring }));
  assert(!errors.length, 'no page errors with reduced motion: ' + errors.join(' | '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(fail ? fail + ' failed' : 'all Ledger and award checks passed');
process.exit(fail ? 1 : 0);
