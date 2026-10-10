// In-play interface: the dialogue sheet (one Next, distinct controls, long
// lines), word help (tapping a word never advances; the sheet/card closes
// before anything underneath acts), replies (a scroll never selects), the HUD
// (one Menu entry, hidden under panels), touch controls (context label, Run,
// sliding move pad, hidden during dialogue/menus), gesture suppression only
// on the canvas/pad, Tab inside the folio, and the camera staying put when
// the dialogue opens (the sheet never covers the player; see world_view.mjs).
// Usage: node tests/e2e/play_ui.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const LONG = { who: 'tsuru', jp: 'ここ で は {好|す}きな だけ {時間|じかん} を かけて いい 。 {話|はな}して 、 {迷|まよ}って 、 {決|き}め{直|なお}して いい 。 でも 、 あの {灯|あか}り が {敷居|しきい} を {越|こ}えたら 、 {旅|たび} の {終|お}わり まで 、 その {二|ふた}つ の {名前|なまえ} を {運|はこ}ぶ 。', en: 'Take as long as you like in here. Talk, waver, change your mind. But once that lantern crosses the threshold, it carries those two names to the end of the journey.' };
// place the player next to a talkable NPC, facing it
const faceNpc = (p) => p.evaluate(() => {
  const W = RB.world.W;
  for (const n of W.npcs) {
    if (!n.def.talk) continue;
    for (const [dx, dy, dir] of [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']]) {
      const x = n.x + dx, y = n.y + dy;
      if (x < 0 || y < 0 || x >= W.map.w || y >= W.map.h || RB.world.blocked(x, y, { except: W.player, ignorePlayer: true })) continue;
      Object.assign(W.player, { x, y, fx: x, fy: y, dir, mv: null });
      return n.id;
    }
  }
  return null;
});

// ---- phone portrait, touch ----------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 });
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' }); RB.game.settings.lightbulb = true; RB.ui.hud.refresh(); });
  await p.waitForTimeout(300);
  const ta = await p.evaluate(() => {
    const none = [];
    for (const e of document.querySelectorAll('*')) if (getComputedStyle(e).touchAction === 'none' && e.getClientRects().length) none.push(e.id || e.className);
    return { none, app: getComputedStyle(document.getElementById('app')).touchAction, body: getComputedStyle(document.body).touchAction };
  });
  assert(ta.app !== 'none' && ta.body !== 'none', 'no gesture suppression on #app/body (' + ta.app + ')');
  assert(ta.none.every((n) => /world|tp-move|tp-run|tp-act/.test(String(n))), 'touch-action:none only on the world canvas and touch controls: ' + JSON.stringify(ta.none));
  const hud = await p.evaluate(() => ({
    // (the HUD's button has been "Ledger" since C-58: the Wayfarer's Ledger is the menu)
    menus: Array.from(document.querySelectorAll('button')).filter((x) => x.offsetParent && /menu|ledger/i.test(x.textContent + ' ' + (x.getAttribute('aria-label') || ''))).length,
    tp: !!document.querySelector('.touchpad .tp-move') && getComputedStyle(document.querySelector('.touchpad')).display !== 'none',
    bulb: document.querySelector('.hud .bulb').getAttribute('aria-pressed'),
  }));
  assert(hud.menus === 1, 'exactly one visible Menu entry point (' + hud.menus + ')');
  assert(hud.tp, 'touch controls shown in the world on a touch screen');
  assert(hud.bulb === 'true', 'word-help switch reports its state (aria-pressed)');
  // context label
  const npc = await faceNpc(p);
  await p.waitForTimeout(350);
  const lab = await p.evaluate(() => document.querySelector('.tp-act .l').textContent);
  assert(npc && lab === 'Talk', 'Action button reads "Talk" when facing ' + npc + ' (' + lab + ')');
  // Run (hold)
  const rb = await p.locator('.tp-run').boundingBox();
  const cdp = await ctx.newCDPSession(p);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  await touch('touchStart', [{ x: rb.x + rb.width / 2, y: rb.y + rb.height / 2, id: 1 }]);
  await p.waitForTimeout(60);
  const running = await p.evaluate(() => RB.input.running());
  await touch('touchEnd', []);
  await p.waitForTimeout(60);
  assert(running && !(await p.evaluate(() => RB.input.running())), 'Run is held while pressed and released after');
  // sliding move pad: press left of centre, slide to the right → direction follows the thumb
  const mb = await p.locator('.tp-move').boundingBox();
  const cx = mb.x + mb.width / 2, cy = mb.y + mb.height / 2;
  await touch('touchStart', [{ x: cx - mb.width * 0.35, y: cy, id: 2 }]);
  await p.waitForTimeout(40);
  const d1 = await p.evaluate(() => RB.input.dir());
  await touch('touchMove', [{ x: cx + mb.width * 0.35, y: cy, id: 2 }]);
  await p.waitForTimeout(40);
  const d2 = await p.evaluate(() => RB.input.dir());
  await touch('touchEnd', []);
  await p.waitForTimeout(40);
  const d3 = await p.evaluate(() => RB.input.dir());
  assert(d1 === 'left' && d2 === 'right' && d3 === null, `move pad follows a sliding thumb (${d1} → ${d2} → ${d3})`);
  // dialogue (first let the step the move pad started finish: the camera
  // follows a walking player, and that is not what this checks)
  await p.waitForFunction(() => !RB.world.W.player.mv);
  await p.waitForTimeout(300);
  const cam0 = await p.evaluate(() => [RB.render.cam.x, RB.render.cam.y].join());
  await p.evaluate((L) => { RB.game.settings.textSpeed = 'instant'; window.__done = false; RB.script.runInline([L, { who: 'mio', jp: '{行|い}こう 。', en: "Let's go." }]).then(() => { window.__done = true; }); }, LONG);
  await p.waitForTimeout(400);
  const dl = await p.evaluate(() => ({
    nexts: document.querySelectorAll('.dlg .b-next').length,
    hudHidden: getComputedStyle(document.querySelector('.hud')).display === 'none',
    tpHidden: getComputedStyle(document.querySelector('.touchpad')).display === 'none',
    labels: Array.from(document.querySelectorAll('.dlg .aux .dbtn')).filter((x) => x.offsetParent).map((x) => x.textContent.trim()),
    small: Array.from(document.querySelectorAll('.dlg button')).filter((x) => x.offsetParent && (x.getBoundingClientRect().height < 43.5 || x.getBoundingClientRect().width < 43.5)).length,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  }));
  assert(dl.nexts === 1, 'one Next control');
  assert(dl.hudHidden && dl.tpHidden, 'HUD and touch controls hidden during dialogue');
  assert(dl.labels.includes('Word help') && dl.labels.includes('History'), 'separate, labelled dialogue controls: ' + dl.labels.join(', '));
  assert(!dl.small && !dl.overflow, 'dialogue controls ≥44px and nothing wider than the screen');
  // the camera stays put (the touch controls' band is kept while they hide) and the sheet does not cover the player
  const cam = await p.evaluate(() => {
    const P = RB.world.W.player, a = RB.render.tileToCss(P.fx, P.fy - 0.5), z = RB.render.tileToCss(P.fx + 1, P.fy + 1);
    const r = document.querySelector('.dlg').getBoundingClientRect();
    return { at: [RB.render.cam.x, RB.render.cam.y].join(), covered: z.x > r.left && a.x < r.right && z.y > r.top && a.y < r.bottom };
  });
  assert(cam.at === cam0, `the camera does not move when the dialogue opens (${cam0} → ${cam.at})`);
  assert(!cam.covered, 'the dialogue sheet does not cover the player');
  // a tap on a word opens help and does NOT advance
  const line0 = await p.evaluate(() => document.querySelector('.dlg .main').textContent);
  await p.locator('.dlg .jt >> nth=4').tap();
  await p.waitForTimeout(150);
  const h1 = await p.evaluate(() => { const h = document.querySelector('.help'); if (!h) return null; const r = h.getBoundingClientRect(); const c = h.querySelector('.hclose').getBoundingClientRect(); return { sheet: h.classList.contains('sheet'), inView: r.left >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1, close: c.top >= r.top && c.bottom <= innerHeight && c.height >= 43.5, line: document.querySelector('.dlg .main').textContent }; });
  assert(h1 && h1.sheet && h1.inView && h1.close, 'tapping a word opens a bottom sheet with its Close in view');
  assert(h1 && h1.line === line0, 'tapping a word did not advance the dialogue');
  // tapping the line (which would normally advance) while the sheet is up only closes the sheet
  const nb = await p.evaluate(() => { const r = document.querySelector('.dlg .main').getBoundingClientRect(); return { x: r.left + 20, y: r.top + 12 }; });
  await p.touchscreen.tap(nb.x, nb.y);
  await p.waitForTimeout(150);
  const h2 = await p.evaluate(() => ({ help: !!document.querySelector('.help'), line: document.querySelector('.dlg .main').textContent }));
  assert(!h2.help && h2.line === line0, 'a tap outside the sheet closes it without also advancing');
  // an open sheet survives a resize to a wide window as a card beside its word, fully on screen
  await p.locator('.dlg .jt >> nth=3').tap();
  await p.waitForTimeout(120);
  await p.setViewportSize({ width: 1024, height: 700 });
  await p.waitForTimeout(250);
  const rz = await p.evaluate(() => { const h = document.querySelector('.help'); if (!h) return null; const r = h.getBoundingClientRect(); return { sheet: h.classList.contains('sheet'), on: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight }; });
  assert(rz && !rz.sheet && rz.on, 'resizing phone → wide re-places the open help as an on-screen card ' + JSON.stringify(rz));
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(250);
  const rz2 = await p.evaluate(() => { const h = document.querySelector('.help'); return h ? h.classList.contains('sheet') : null; });
  assert(rz2 !== false, 'and back to a phone width it is a sheet again (or closed)');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(100);
  // Escape closes help first
  await p.locator('.dlg .jt >> nth=2').tap();
  await p.waitForTimeout(120);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(100);
  const h3 = await p.evaluate(() => ({ help: !!document.querySelector('.help'), open: RB.ui.dialogue.isOpen() }));
  assert(!h3.help && h3.open, 'Escape closes the help sheet first; dialogue stays');
  // Next advances (possibly after showing the rest of a long line)
  for (let i = 0; i < 3; i++) {
    await p.locator('.dlg .b-next').tap();
    await p.waitForTimeout(250);
    if ((await p.evaluate(() => document.querySelector('.dlg .main').textContent)) !== line0) break;
  }
  assert((await p.evaluate(() => document.querySelector('.dlg .main').textContent)) !== line0, 'Next advances to the next line');
  await p.locator('.dlg .b-next').tap();
  await p.waitForTimeout(250);
  const endSt = await p.evaluate(() => ({ done: window.__done, open: RB.ui.dialogue.isOpen(), line: document.querySelector('.dlg .main').textContent, mode: RB.game.mode() }));
  assert(endSt.done, 'the conversation ends ' + JSON.stringify(endSt));
  if (endSt.open) { await p.evaluate(async () => { for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 60)); } }); } // a map trigger may start its own scene here
  // replies: a touch scroll across them never selects one
  await p.evaluate(() => { window.__pick = null; RB.ui.dialogue.choose(Array.from({ length: 9 }, (_, i) => ({ en: 'Reply number ' + (i + 1) + ' — a fairly long answer so the list needs to scroll on a phone', jp: '{答|こた}え ' + (i + 1) }))).then((i) => { window.__pick = i; }); });
  await p.waitForTimeout(250);
  const cb = await p.locator('.choices .choice >> nth=2').boundingBox();
  await touch('touchStart', [{ x: cb.x + cb.width / 2, y: cb.y + cb.height / 2, id: 3 }]);
  for (let k = 1; k <= 6; k++) { await touch('touchMove', [{ x: cb.x + cb.width / 2, y: cb.y + cb.height / 2 - k * 25, id: 3 }]); await p.waitForTimeout(16); }
  await touch('touchEnd', []);
  await p.waitForTimeout(250);
  const scrolled = await p.evaluate(() => ({ pick: window.__pick, top: document.querySelector('.choices').scrollTop }));
  assert(scrolled.pick === null, 'scrolling over a reply did not choose it (scrolled ' + scrolled.top + 'px)');
  await p.locator('.choices .choice >> nth=1').tap();
  await p.waitForTimeout(150);
  assert((await p.evaluate(() => window.__pick)) === 1, 'a plain tap chooses the reply');
  assert(!errors.length, 'no page errors (phone) ' + errors.join('; '));
  await ctx.close();
}

// ---- landscape phone: a long line shows "More" before advancing ------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 640, height: 320 }, touch: true, mobile: true });
  await p.evaluate((L) => { RB.game.debugStart('rw.hall', 5, 6, { comp: 'mio' }); RB.game.settings.textSpeed = 'instant'; RB.game.settings.textScale = 1.3; RB.game.applySettings(); RB.script.runInline([L, { who: 'mio', jp: '{行|い}こう 。', en: "Let's go." }]); }, LONG);
  await p.waitForTimeout(500);
  const st = await p.evaluate(() => ({ more: document.querySelector('.dlg').classList.contains('more'), label: document.querySelector('.dlg .b-next').textContent.trim(), line: document.querySelector('.dlg .main').textContent }));
  if (st.more) {
    assert(st.label === 'More', 'an overflowing line labels the button "More"');
    await p.locator('.dlg .b-next').tap();
    await p.waitForTimeout(600);
    const after = await p.evaluate(() => ({ line: document.querySelector('.dlg .main').textContent, top: document.querySelector('.dlg .txt').scrollTop }));
    assert(after.line === st.line && after.top > 0, 'the first press shows the rest of the line instead of skipping it');
  } else console.log('note: the long line fit at 640x320 @130%; "More" path not exercised here');
  assert(!errors.length, 'no page errors (landscape) ' + errors.join('; '));
  await ctx.close();
}

// ---- desktop: HUD hidden under the folio; Tab moves focus inside it ---------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' }); });
  await p.waitForTimeout(200);
  assert(await p.evaluate(() => getComputedStyle(document.querySelector('.touchpad')).display === 'none'), 'no touch controls with a mouse');
  await p.click('.hud .menu-b');
  await p.waitForTimeout(150);
  const s1 = await p.evaluate(() => ({ open: RB.ui.menu.isOpen(), hud: getComputedStyle(document.querySelector('.hud')).display, focus: document.activeElement && document.activeElement.dataset.id }));
  assert(s1.open && s1.hud === 'none', 'HUD Menu opens the folio and the HUD hides under it');
  await p.keyboard.press('Tab');
  await p.waitForTimeout(80);
  const s2 = await p.evaluate(() => ({ open: RB.ui.menu.isOpen(), cls: document.activeElement && (document.activeElement.className || document.activeElement.tagName) }));
  assert(s2.open && !/ptab/.test(s2.cls), 'Tab moves focus from the tab into the page; the folio stays open (' + s2.cls + ')');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(80);
  assert(await p.evaluate(() => !RB.ui.menu.isOpen() && getComputedStyle(document.querySelector('.hud')).display !== 'none'), 'closing the folio brings the HUD back');
  // mouse hover shows a card beside the word; moving to Next and clicking is not blocked
  await p.evaluate(() => { RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = true; RB.ui.hud.refresh(); window.__d2 = false; RB.script.runInline([{ who: 'tsuru', jp: 'ここ で {待|ま}って いて 。', en: 'Wait here.' }]).then(() => { window.__d2 = true; }); });
  await p.waitForTimeout(250);
  await p.hover('.dlg .jt >> nth=0');
  await p.waitForTimeout(150);
  const card = await p.evaluate(() => { const h = document.querySelector('.help'); return h && !h.classList.contains('sheet'); });
  assert(card, 'hovering a word shows a note card beside it');
  await p.click('.dlg .b-next');
  await p.waitForTimeout(200);
  assert(await p.evaluate(() => window.__d2), 'with a hover card showing, one click on Next still advances');
  assert(!errors.length, 'no page errors (desktop) ' + errors.join('; '));
  await ctx.close();
}

await b.close(); srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
