// Evidence for the animated dialogue portraits (docs/screenshots/portraits/, docs/expressive/PORTRAITS.md §5):
//   eyes_zoom.png       — the eye area before / after the readability fixes, 12 characters × 7 expressions, 4×
//   eyes_real_size.png  — the same portraits as the dialogue shows them at device-pixel-ratio 1 (element
//                         screenshots of the real dialogue: before 116 CSS px, after 96)
//   sizes.png           — before / after at the dialogue's three layout sizes at ratio 1, and the phone at ratio 3
//   stills_desktop.png, stills_phone.png — held still at actual size (1440×900 and 390×844 at ratio 1, the world review's
//                         WR-02 setup), 6 characters × the 12 expressions in use, before / after
//   cues_<companion>.png— each companion's lead-in cue for every tag: the beats (with their ms), then the settled loop
//   idle_npcs.png       — idle-loop frames of the player and a set of NPCs (blink, breath, gaze, tilt, sway, glint, habit)
//   conversation.webm   — real time: the first twelve spoken lines of sa.kasane_meet (Kasane, the player, Nao, Mio, Ren)
//                         through the dialogue, 1.6 s each; conversation_still.png a frame of it (Nao, [angry])
// Usage: node tests/e2e/portrait_shots.mjs [--before path/to/index.before.html] [--no-video]
//   (the before build: `git show eb0cb4b:index.html > /tmp/index.before.html`; without it the before halves are skipped)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const beforeFile = args.includes('--before') ? path.resolve(args[args.indexOf('--before') + 1]) : null;
const out = path.join(root, 'docs', 'screenshots', 'portraits');
fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve();
let bsrv = null, burl = null;
if (beforeFile) {
  bsrv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); fs.createReadStream(beforeFile).pipe(r); });
  await new Promise((res) => bsrv.listen(0, '127.0.0.1', res));
  burl = 'http://127.0.0.1:' + bsrv.address().port + '/';
}
const b = await launch();
const save = (name, dataUrl) => { fs.writeFileSync(path.join(out, name), Buffer.from(dataUrl.split(',')[1], 'base64')); console.log('wrote docs/screenshots/portraits/' + name); };
const IDS = ['nao', 'mio', 'ren', 'suzu', 'omi', 'wataru', 'tsuru', 'hoshino', 'kasane', 'co_tokiwa', 'hana', 'kanta'];
const EXPR = ['neutral', 'think', 'worry', 'sad', 'surprise', 'angry', 'smirk'];

// raw 96×96 stills (RGBA arrays) from a build
async function stills(u) {
  const { p } = await page(b, u);
  const r = await p.evaluate(({ IDS, EXPR }) => {
    const o = {};
    for (const id of IDS) for (const e of EXPR) { const c = document.createElement('canvas'); c.width = c.height = 96; RB.portraits.draw(c, id, e); o[id + '|' + e] = c.toDataURL(); }
    return o;
  }, { IDS, EXPR });
  await p.context().close();
  return r;
}
// element screenshots of the dialogue's portrait, as the dialogue shows it
async function inDialogue(u, list, opts) {
  const { p } = await page(b, u, opts);
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' }); RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = true; });
  await p.waitForTimeout(200);
  const o = {};
  for (const [id, e] of list) {
    await p.evaluate(({ id, e }) => { RB.ui.dialogue.advance(true); RB.ui.dialogue.say({ who: id, expr: e, jp: 'テスト', en: 'A line.' }); }, { id, e });
    await p.waitForTimeout(60);
    const buf = await p.locator('.dlg .portrait').screenshot();
    o[id + '|' + e] = 'data:image/png;base64,' + buf.toString('base64');
  }
  await p.context().close();
  return o;
}
// compose a sheet in a page: cells [{ src, x, y, w, h, crop? }] + labels
async function sheet(name, W, H, cells, labels) {
  const { p } = await page(b, url);
  const d = await p.evaluate(async ({ W, H, cells, labels }) => {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    c.fillStyle = '#efe6d6'; c.fillRect(0, 0, W, H);
    c.imageSmoothingEnabled = false;
    for (const k of cells) {
      const img = new Image(); img.src = k.src; await img.decode();
      if (k.crop) c.drawImage(img, k.crop[0], k.crop[1], k.crop[2], k.crop[3], k.x, k.y, k.w, k.h);
      else c.drawImage(img, k.x, k.y, k.w || img.width, k.h || img.height);
    }
    c.fillStyle = '#2a2018';
    for (const l of labels) { c.font = (l.b ? 'bold ' : '') + (l.s || 12) + 'px sans-serif'; c.fillText(l.t, l.x, l.y); }
    return cv.toDataURL('image/png');
  }, { W, H, cells, labels });
  await p.context().close();
  save(name, d);
}

// ---- eyes: zoomed crops and real dialogue size ------------------------------------------------------------------
{
  const after = await stills(url);
  const before = beforeFile ? await stills(burl) : null;
  const Z = 4, CW = 52 * Z, CH = 28 * Z, crop = [22, 30, 52, 28];
  const rows = before ? 2 : 1;
  const cells = [], labels = [{ t: 'Eye area, 4× — ' + (before ? 'before (upper) / after (lower) the readability fixes' : 'after the readability fixes'), x: 8, y: 16, b: 1, s: 14 }];
  EXPR.forEach((e, j) => labels.push({ t: e, x: 110 + j * (CW + 6), y: 36 }));
  IDS.forEach((id, i) => {
    const y = 44 + i * (rows * CH + 12);
    labels.push({ t: id, x: 8, y: y + 20, b: 1 });
    if (before) { labels.push({ t: 'before', x: 8, y: y + 38 }); labels.push({ t: 'after', x: 8, y: y + CH + 38 }); }
    EXPR.forEach((e, j) => {
      const x = 110 + j * (CW + 6);
      if (before) cells.push({ src: before[id + '|' + e], x, y, w: CW, h: CH, crop });
      cells.push({ src: after[id + '|' + e], x, y: y + (before ? CH + 2 : 0), w: CW, h: CH, crop });
    });
  });
  await sheet('eyes_zoom.png', 110 + EXPR.length * (CW + 6), 50 + IDS.length * (rows * CH + 12), cells, labels);

  // real size (device-pixel-ratio 1): the dialogue's own canvas, screenshotted
  const list = []; for (const id of IDS) for (const e of ['neutral', 'worry', 'think', 'surprise']) list.push([id, e]);
  const ra = await inDialogue(url, list);
  const rb = beforeFile ? await inDialogue(burl, list) : null;
  const cells2 = [], labels2 = [{ t: 'As the dialogue shows them at device-pixel-ratio 1 (element screenshots, actual pixels): ' + (rb ? 'before 116 CSS px (1.21×, uneven rows) | after 96 CSS px (1×)' : 'after, 96 CSS px (1×)'), x: 8, y: 16, b: 1, s: 13 }];
  const colW = (rb ? 126 + 108 : 108) + 14;
  ['neutral', 'worry', 'think', 'surprise'].forEach((e, j) => labels2.push({ t: e + (rb ? ' (before | after)' : ''), x: 90 + j * colW, y: 36 }));
  IDS.forEach((id, i) => {
    const y = 44 + i * 132;
    labels2.push({ t: id, x: 8, y: y + 60, b: 1 });
    ['neutral', 'worry', 'think', 'surprise'].forEach((e, j) => {
      const x = 90 + j * colW;
      if (rb) cells2.push({ src: rb[id + '|' + e], x, y });
      cells2.push({ src: ra[id + '|' + e], x: x + (rb ? 132 : 0), y: y + (rb ? 10 : 0) });
    });
  });
  await sheet('eyes_real_size.png', 90 + 4 * colW, 50 + IDS.length * 132, cells2, labels2);

  // the three layout sizes at ratio 1, and a phone at ratio 3
  const L = [['desktop 1280×800', { viewport: { width: 1280, height: 800 } }], ['short landscape 800×400', { viewport: { width: 800, height: 400 } }], ['narrow 560×800', { viewport: { width: 560, height: 800 } }], ['phone 390×844 @3', { viewport: { width: 390, height: 844 }, dpr: 3 }]];
  const sz = [];
  for (const [nm, o] of L) {
    const a1 = await inDialogue(url, [['suzu', 'worry'], ['ren', 'think']], o);
    const b1 = beforeFile ? await inDialogue(burl, [['suzu', 'worry'], ['ren', 'think']], o) : null;
    sz.push({ nm, a1, b1 });
  }
  const cells3 = [], labels3 = [{ t: 'The portrait at each layout size (actual pixels; the phone at device-pixel-ratio 3 is shown at device pixels)', x: 8, y: 16, b: 1, s: 13 }];
  let x = 8;
  for (const s of sz) {
    labels3.push({ t: s.nm, x, y: 38 });
    let y = 48;
    for (const k of ['suzu|worry', 'ren|think']) {
      if (s.b1) { labels3.push({ t: 'before', x, y: y + 12 }); cells3.push({ src: s.b1[k], x, y: y + 16 }); y += 216; }
      labels3.push({ t: 'after', x, y: y + 12 }); cells3.push({ src: s.a1[k], x, y: y + 16 }); y += 216;
    }
    x += 210;
  }
  await sheet('sizes.png', x + 8, 48 + (beforeFile ? 4 : 2) * 216 + 10, cells3, labels3);
}

// ---- held still at actual display size (the world review's WR-02 setup: 1440×900 and 390×844, ratio 1) ----------------
{
  const WHO = ['nao', 'mio', 'ren', 'suzu', 'wataru', 'omi'];
  const EX = ['neutral', 'think', 'angry', 'surprise', 'smile', 'worry', 'sad', 'closed', 'shy', 'smirk', 'laugh', 'tired'];
  const list = []; for (const id of WHO) for (const e of EX) list.push([id, e]);
  for (const [nm, vp, file] of [['desktop 1440×900', { width: 1440, height: 900 }, 'stills_desktop.png'], ['phone 390×844', { width: 390, height: 844 }, 'stills_phone.png']]) {
    const ra = await inDialogue(url, list, { viewport: vp });
    const rb = beforeFile ? await inDialogue(burl, list, { viewport: vp }) : null;
    const cell = nm.startsWith('desktop') ? 130 : 78;
    const cells = [], labels = [{ t: 'Held still, as the dialogue shows them (element screenshots, actual CSS pixels, device-pixel-ratio 1), ' + nm + (rb ? ': before (upper) / after (lower) in each row' : ''), x: 8, y: 16, b: 1, s: 13 }];
    EX.forEach((e, j) => labels.push({ t: e, x: 70 + j * cell, y: 36 }));
    WHO.forEach((id, i) => {
      const y = 44 + i * (rb ? 2 * cell + 8 : cell);
      labels.push({ t: id, x: 6, y: y + cell / 2, b: 1 });
      if (rb) { labels.push({ t: 'before', x: 6, y: y + cell / 2 + 14 }); labels.push({ t: 'after', x: 6, y: y + cell + cell / 2 + 14 }); }
      EX.forEach((e, j) => {
        if (rb) cells.push({ src: rb[id + '|' + e], x: 70 + j * cell, y });
        cells.push({ src: ra[id + '|' + e], x: 70 + j * cell, y: y + (rb ? cell : 0) });
      });
    });
    await sheet(file, 80 + EX.length * cell, 50 + WHO.length * (rb ? 2 * cell + 8 : cell), cells, labels);
  }
}

// ---- cues per companion, idle frames of NPCs -----------------------------------------------------------------------
{
  const { p } = await page(b, url);
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' }); });
  const TAGS = ['surprise', 'laugh', 'smile', 'smirk', 'think', 'worry', 'sad', 'closed', 'angry', 'shy', 'tired'];
  for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
    const d = await p.evaluate(({ comp, TAGS }) => {
      const Z = 2, F = 96 * Z, G = 8;
      const rows = TAGS.map((tag) => {
        const tl = RB.portraitAnim.timeline(comp, tag, { ms: 6000, scene: 'shots.' + comp });
        const beats = tl.frames.filter((f) => f.t < tl.cueEnd);
        let settled = beats[beats.length - 1]; for (const f of tl.frames) if (f.t <= tl.cueEnd) settled = f;
        const blink = tl.frames.find((f) => f.t > tl.cueEnd && f.fr.lids === 'closed');
        return { tag, beats, settled, blink, end: tl.cueEnd };
      });
      const cols = Math.max(...rows.map((r) => r.beats.length)) + 2;
      const cv = document.createElement('canvas'); cv.width = 90 + cols * (F + G); cv.height = 40 + rows.length * (F + 26);
      const c = cv.getContext('2d'); c.fillStyle = '#efe6d6'; c.fillRect(0, 0, cv.width, cv.height); c.imageSmoothingEnabled = false;
      c.fillStyle = '#2a2018'; c.font = 'bold 14px sans-serif';
      c.fillText(RB.content.chars[comp].name.en + ' — lead-in cue per expression tag (beats with their start ms), then the settled loop frame and a blink of that loop; 2×', 8, 18);
      const sj = RB.portraits.subject(comp);
      const t = document.createElement('canvas'); t.width = t.height = 96;
      rows.forEach((r, i) => {
        const y = 32 + i * (F + 26);
        c.fillStyle = '#2a2018'; c.font = 'bold 13px sans-serif'; c.fillText(r.tag, 8, y + F / 2);
        c.font = '11px sans-serif'; c.fillText(Math.round(r.end) + ' ms', 8, y + F / 2 + 16);
        const cells = r.beats.map((f) => [f.fr, f.t + ' ms']).concat([[r.settled.fr, 'settled loop'], [r.blink ? r.blink.fr : null, r.blink ? 'loop: blink' : '(eyes closed: no blink)']]);
        cells.forEach(([fr, lab], j) => {
          const x = 90 + j * (F + G);
          if (fr === null && /no blink/.test(lab)) { c.fillStyle = '#2a2018'; c.fillText(lab, x + 4, y + F / 2); return; }
          RB.portraits.paintFrame(t, sj, r.tag, fr);
          c.drawImage(t, x, y, F, F);
          c.fillStyle = '#2a2018'; c.font = '11px sans-serif'; c.fillText(lab, x + 2, y + F + 13);
        });
      });
      return cv.toDataURL('image/png');
    }, { comp, TAGS });
    save('cues_' + comp + '.png', d);
  }
  const d = await p.evaluate(() => {
    const ids = ['pc', 'omi', 'wataru', 'tsuru', 'kasane', 'hoshino', 'hana', 'co_tokiwa', 'genzo', 'kanta', 'lf_yae', 'mochi', 'sa_clerk'];
    const Z = 2, F = 96 * Z, G = 8, COLS = 7;
    const cv = document.createElement('canvas'); cv.width = 110 + COLS * (F + G); cv.height = 40 + ids.length * (F + 26);
    const c = cv.getContext('2d'); c.fillStyle = '#efe6d6'; c.fillRect(0, 0, cv.width, cv.height); c.imageSmoothingEnabled = false;
    c.fillStyle = '#2a2018'; c.font = 'bold 14px sans-serif';
    c.fillText('Idle loops (no tag): the rest frame, a blink, a breath and each other kind of motion in the first minute (ms on the idle clock); 2×', 8, 18);
    const t = document.createElement('canvas'); t.width = t.height = 96;
    ids.forEach((id, i) => {
      const tl = RB.portraitAnim.timeline(id, null, { ms: 60000 });
      // the rest frame, a blink, a breath, then each other kind of motion once (gaze, tilt, sway, glint, habit …)
      const kindOf = (fr) => {
        if (fr.lids === 'closed') return 'blink';
        if (fr.lids === 'half') return null;
        const ks = Object.keys(fr).filter((k) => !((k === 'head' || k === 'body') && fr[k][0] === 0 && fr[k][1] === -1));
        if (!ks.length) return fr.body ? 'breath' : null;
        return ks.sort().join('+') + (fr.head && fr.head[0] ? 'x' : '') + (fr.head && fr.head[1] > 0 ? 'nod' : '');
      };
      const pick = [tl.frames[0]];
      const kinds = new Set();
      for (const f of tl.frames) {
        const k = f.k && kindOf(f.fr);
        if (!k || kinds.has(k) || pick.length >= COLS) continue;
        kinds.add(k); pick.push(f);
      }
      const y = 32 + i * (F + 26);
      c.fillStyle = '#2a2018'; c.font = 'bold 13px sans-serif'; c.fillText(id, 8, y + F / 2);
      c.font = '11px sans-serif'; c.fillText(tl.profile.cls, 8, y + F / 2 + 16);
      const sj = RB.portraits.subject(id, id === 'pc' ? RB.equip.look(RB.game.s) : null);
      pick.forEach((f, j) => {
        const x = 110 + j * (F + G);
        RB.portraits.paintFrame(t, sj, 'neutral', f.fr);
        c.drawImage(t, x, y, F, F);
        const lab = f.k ? Object.entries(f.fr).map(([k, v]) => k + ' ' + (Array.isArray(v) ? v.join(',') : v)).join('; ') : 'rest';
        c.fillStyle = '#2a2018'; c.fillText((j ? f.t + ' ms: ' : '') + lab, x + 2, y + F + 13);
      });
    });
    return cv.toDataURL('image/png');
  });
  save('idle_npcs.png', d);
  await p.context().close();
}

// ---- a real-time clip of a conversation ------------------------------------------------------------------------------
if (!args.includes('--no-video')) {
  const vdir = path.join(root, 'tests', 'e2e', '.video_tmp');
  fs.rmSync(vdir, { recursive: true, force: true });
  const ctx = await b.newContext({ viewport: { width: 640, height: 360 }, recordVideo: { dir: vdir, size: { width: 640, height: 360 } } });
  const p = await ctx.newPage();
  await p.goto(url);
  await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 15000 });
  const n = await p.evaluate(() => {
    RB.game.debugStart('sa.camp', 16, 17, { comp: 'suzu' });
    RB.game.settings.textSpeed = 'fast';
    // the lines of a real scene (Kasane meets the four companions), in order, with their tags
    const sc = RB.content.scenes['sa.kasane_meet'];
    window.__lines = sc.cmds.filter((c) => c.op === 'say' && c.who !== 'narr').slice(0, 12).map((c) => ({ who: c.who, expr: c.expr, jp: c.jp, en: c.en, sceneId: 'sa.kasane_meet' }));
    return window.__lines.length;
  });
  await p.waitForTimeout(600);
  for (let i = 0; i < n; i++) {
    await p.evaluate((i) => { RB.ui.dialogue.advance(true); RB.ui.dialogue.say(window.__lines[i]); }, i);
    if (i === 5) { await p.waitForTimeout(900); fs.writeFileSync(path.join(out, 'conversation_still.png'), await p.screenshot()); console.log('wrote docs/screenshots/portraits/conversation_still.png'); await p.waitForTimeout(700); }
    else await p.waitForTimeout(1600);
  }
  await p.waitForTimeout(400);
  const v = p.video();
  await ctx.close();
  const src = await v.path();
  fs.copyFileSync(src, path.join(out, 'conversation.webm'));
  fs.rmSync(vdir, { recursive: true, force: true });
  console.log('wrote docs/screenshots/portraits/conversation.webm (' + (fs.statSync(path.join(out, 'conversation.webm')).size / 1024).toFixed(0) + ' KiB, ' + n + ' lines)');
}

await b.close();
srv.close();
if (bsrv) bsrv.close();
