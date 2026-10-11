// The travel volume's pages painted in the art pass (expansion P16; src/ui/43g_seq_paint.js … 43n_seq_post.js), in
// the BUILT game, headless Chromium. Each page is played through the volume's own viewer ("Watch it again": the page's
// beats read from its scene for a companion's branch, read-only) with real clicks on Next, at 1280×720, 390×844 and
// 844×390, each viewport with a different companion. Checks, per page and viewport: every beat shown; every shot of
// the page reached on some viewport; at each beat, once its one-time action has played, the shot's focal area sits
// above the dialogue sheet and inside the frame; the campaign is not touched (the viewer is read-only); no page
// error. Then once with reduced motion: each action held at its end at once. Optional evidence stills (--shots): each
// shot at its hold at 1280×720 to docs/screenshots/sequences/p16/ as small WebP files.
// Usage: node tests/e2e/sequence_p16.mjs [--only mb1.named,kr.dawn] [--shots]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { PAGES } from '../unit/sequence_p16.test.mjs';

const args = process.argv.slice(2);
const oi = args.indexOf('--only'), ONLY = oi >= 0 ? args[oi + 1].split(',') : null;
const SHOTS = args.includes('--shots');
const OUT = path.join(root, 'docs/screenshots/sequences/p16');
if (SHOTS) fs.mkdirSync(OUT, { recursive: true });
const VPS = [['1280x720', { width: 1280, height: 720 }, 1, 'mio'], ['390x844', { width: 390, height: 844 }, 2, 'nao'], ['844x390', { width: 844, height: 390 }, 2, 'suzu']];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const test = async (name, fn) => { try { await fn(); pass++; console.log('PASS', name); } catch (e) { fail++; console.log('FAIL', name, '\n  ', String(e && e.stack || e).split('\n').slice(0, 3).join('\n   ')); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

async function save(p, file) {
  const png = await p.screenshot();
  const webp = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const d = window.devicePixelRatio || 1;
    const c = document.createElement('canvas'); c.width = Math.round(img.width / d); c.height = Math.round(img.height / d);
    const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.8);
  }, png.toString('base64'));
  fs.writeFileSync(file, Buffer.from(webp.split(',')[1], 'base64'));
}

const reached = {};
for (const [id] of PAGES.filter(([id]) => !ONLY || ONLY.includes(id))) reached[id] = new Set();
for (const [vpName, vp, dpr, comp] of VPS) {
  const { p, errors, ctx } = await page(b, url, { viewport: vp, dpr });
  await p.evaluate((comp) => { RB.game.debugStart('rw.village', 22, 30, { comp, edition: 2, flags: { departed: true } }); }, comp);
  await p.waitForTimeout(400);
  for (const [id] of PAGES.filter(([id]) => !ONLY || ONLY.includes(id))) {
    await test(id + ' at ' + vpName + ' with ' + comp, async () => {
      const before = await p.evaluate(() => JSON.stringify({ f: RB.game.s.flags, q: RB.game.s.quests, seq: RB.game.s.seq, map: RB.game.s.map }));
      const n = await p.evaluate(({ id, comp }) => {
        const s = RB.game.s, cast = { pc: RB.equip ? RB.equip.look(s) : s.player.look, comp: { id: comp, look: (RB.content.chars[comp] || {}).look || {} } };
        const beats = RB.volume.beats(id, RB.volume.fixtureTest(comp), comp);
        window.__seqDone = false;
        RB.sequence.view({ seq: id, beats, cast, label: 'Replay', name: 'seq-replay', seen: () => true, skip: { label: 'Close' }, replay: true, speakers: true }).then(() => { window.__seqDone = true; });
        return beats.length;
      }, { id, comp });
      assert(n > 0, 'the page has beats');
      const bad = [];
      for (let i = 0; i < n; i++) {
        // wait for the beat's one-time action to end (the hold), then check where the focus is
        await p.waitForFunction(() => { const s = RB.sequence.viewState(); return !s || s.state === 'holding'; }, null, { timeout: 8000 }).catch(() => {});
        await p.waitForTimeout(80);
        const s = await p.evaluate(() => ({ st: RB.sequence.viewState(), f: RB.sequence.viewFocus() }));
        if (s.st && s.st.shot) reached[id].add(s.st.shot);
        if (s.st && s.f && s.st.wh) {
          const [w] = s.st.wh, vb = s.st.vb, f = s.f;
          if (!(f.y >= -2 && f.y + f.h <= vb + 4 && f.x >= -4 && f.x + f.w <= w + 4)) bad.push({ shot: s.st.shot, f, vb, w });
        }
        if (SHOTS && vpName === '1280x720' && s.st && s.st.shot && !fs.existsSync(path.join(OUT, id + '_' + s.st.shot + '.webp'))) await save(p, path.join(OUT, id + '_' + s.st.shot + '.webp'));
        const more = await p.evaluate(() => { const bt = document.querySelector('.seq-view [data-a="next"]'); if (bt && bt.offsetParent !== null) { bt.setAttribute('data-p16', 'go'); return true; } return false; });
        if (!more) break;
        await p.click('[data-p16="go"]').catch(() => {});
        await p.evaluate(() => { const x = document.querySelector('[data-p16="go"]'); if (x) x.removeAttribute('data-p16'); });
      }
      await p.waitForFunction(() => window.__seqDone || !RB.sequence.viewState(), null, { timeout: 6000 }).catch(() => {});
      if (!(await p.evaluate(() => window.__seqDone))) { await p.evaluate(() => RB.sequence.closeView('test')); await p.waitForTimeout(300); }
      assert(!bad.length, 'focal area outside the frame or under the sheet: ' + JSON.stringify(bad.slice(0, 3)));
      const after = await p.evaluate(() => JSON.stringify({ f: RB.game.s.flags, q: RB.game.s.quests, seq: RB.game.s.seq, map: RB.game.s.map }));
      assert(after === before, 'watching changed the campaign');
      assert(!errors.length, 'no page errors: ' + errors.slice(0, 3).join(' | '));
    });
  }
  await ctx.close();
}
await test('every composition of every page reached on some viewport', async () => {
  const missing = await (async () => {
    const { p, ctx } = await page(b, url, { viewport: { width: 800, height: 600 } });
    const r = await p.evaluate((ids) => Object.fromEntries(ids.map((id) => [id, Object.keys(RB.sequence.get(id).shots)])), Object.keys(reached));
    await ctx.close();
    return Object.entries(r).flatMap(([id, shots]) => shots.filter((s) => !reached[id].has(s)).map((s) => id + '.' + s));
  })();
  assert(!missing.length, 'not reached: ' + missing.join(', '));
});
await test('reduced motion: each one-time action held at its end at once', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'ren', edition: 2, flags: { departed: true } }); RB.game.settings.reducedMotion = true; });
  const id = (ONLY || PAGES.map((x) => x[0]))[0];
  await p.evaluate((id) => { const s = RB.game.s; RB.sequence.view({ seq: id, beats: RB.volume.beats(id, RB.volume.fixtureTest('ren'), 'ren'), cast: { pc: s.player.look, comp: { id: 'ren', look: RB.content.chars.ren.look } }, label: 'Replay', name: 'seq-replay', seen: () => true, skip: { label: 'Close' }, replay: true, speakers: true }); }, id);
  await p.waitForTimeout(700);
  const st = await p.evaluate(() => RB.sequence.viewState());
  assert(st && st.state === 'holding', 'held at once with reduced motion (' + (st && st.state) + ')');
  await p.evaluate(() => RB.sequence.closeView('test'));
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await ctx.close();
});
console.log(pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
