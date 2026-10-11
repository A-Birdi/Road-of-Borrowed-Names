// A Quiet Cast's coast in the built game (expansion P15g; F-82; src/content/fishing/70_coast.js). Synthetic
// campaigns in fresh browser contexts; no player save is touched.
//   1. The two coast stations from the world: a twelve-chapter postgame journey standing at Sazanami's rocks and at
//      the One-Pine Islet's jetty is "at the station", the station prop opens its scene, and Cast opens the activity
//      on that station's stage (the rocks; the boat).
//   2. The stage alone at each coast station through every situation there (the rock, the weed, the children's
//      line on the left, the buoys, the birds' ripple): every phase drawn, the situation's text equivalent on the
//      canvas, no errors; captures of each situation and of each of the six fish observed.
//   3. A six-chapter journey keeps three stations: the notes list nine fish and name no coast station.
//   4. The boat's destination after the story: from Saltglass's pier the chart lists the One-Pine Islet; the crew
//      sails her there; the first landing; the islet's stone read and your boat's name carved; and from the islet's
//      jetty the chart lists the way home.
// Captures: tests/e2e/out/fishing_coast/. Usage: node tests/e2e/fishing_coast.mjs [filter]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OUT = path.join(root, 'tests/e2e/out/fishing_coast');
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).find((x) => !x.startsWith('--'));
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 240s')), 240000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 900)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

async function start(p, o) {
  await p.evaluate((o) => {
    const S = RB.fishing.site(o.site);
    const s = RB.game.debugStart(S.map, S.stand.x, S.stand.y, { edition: o.edition || 2, dir: S.stand.dir, comp: o.comp || 'mio', flags: { postgame: true, departed: true, sea_boat: true, sz_seen: true, sea_islet_seen: true } });
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.input = 'choice';
    RB.game.applySettings && RB.game.applySettings();
    s.learn.profile = 'E'; s.learn.kanaKnown = 'both';
    RB.fishing.intro(s, 'yasu');
  }, o);
  await p.waitForTimeout(500);
}

await test('1. the coast stations from the world: at the station, its scene, and Cast opens its stage', async () => {
  for (const site of ['fish.sazanami.rocks', 'fish.boat']) {
    const { p, ctx, errors } = await page(b, url);
    await start(p, { site });
    const here = await p.evaluate(() => RB.fishing.siteHere(RB.game.s));
    assert(here === site, site + ': standing at the stand tile is being at the station (' + here + ')');
    // facing the station, as a person stands there: Enter opens its scene; the line read, then Cast (the first choice)
    const fa = await p.evaluate(() => RB.world.frontAction());
    assert(fa && fa.kind === 'prop', site + ': facing the station: ' + JSON.stringify(fa));
    await p.keyboard.press('Enter');
    for (let i = 0; i < 16 && !(await p.locator('button.choice').first().isVisible().catch(() => false)); i++) { await p.waitForTimeout(250); await p.keyboard.press('Enter'); }
    await p.locator('button.choice').first().click();
    await p.waitForSelector('.fs-stage canvas', { timeout: 15000 });
    await p.waitForTimeout(900);
    const label = await p.evaluate(() => document.querySelector('.fs-stage canvas').getAttribute('aria-label'));
    assert(site === 'fish.boat' ? /stern of the boat/.test(label) : /rocks at Sazanami/.test(label), site + ': the stage is this station\'s (' + label.slice(0, 120) + ')');
    await p.screenshot({ path: path.join(OUT, '1-' + site.replace(/\./g, '_') + '.png') });
    assert(!errors.length, site + ': no errors: ' + errors.join(' | '));
    await ctx.close();
  }
});

await test('2. the stage alone through every coast situation; the six fish observed', async () => {
  const { p, ctx, errors } = await page(b, url);
  await start(p, { site: 'fish.sazanami.rocks' });
  const runs = [['fish.sazanami.rocks', 'mejina', ['R01', 'R02', 'R03', 'R04', 'R05', 'R06']], ['fish.boat', 'saba', ['B01', 'B02', 'B03', 'B04', 'B05', 'B06']]];
  for (const [site, f, sits] of runs) {
    for (const sit of sits) {
      const out = await p.evaluate(async ({ site, f, sit }) => {
        const host = document.createElement('div'); host.id = 'cov'; host.style.cssText = 'position:fixed;left:0;top:0;width:640px;height:420px;z-index:9999;background:#000'; document.body.appendChild(host);
        const st = RB.fishStage.create(host, { site, comp: 'mio', look: RB.equip.look(RB.game.s) });
        const S = RB.fishing.situation(sit);
        st.set({ patch: RB.fishing.site(site).patches[0].id, fish: f, situation: sit, labels: S.tasks.E.labels || null });
        for (const ph of ['prep', 'cast', 'wait', 'bite', 'situation']) { st.go(ph, { intent: S.intent }); await new Promise((r) => setTimeout(r, 160)); }
        await new Promise((r) => setTimeout(r, 300));
        return { label: host.querySelector('canvas').getAttribute('aria-label'), phases: Object.keys(st.stats().phases).length };
      }, { site, f, sit });
      assert(out.label.includes(await p.evaluate((sit) => RB.fishing.situation(sit).scene.en, sit)), sit + ': the situation\'s text equivalent is on the canvas');
      await p.locator('#cov').screenshot({ path: path.join(OUT, '2-' + sit + '.png') });
      await p.evaluate(() => { document.getElementById('cov').remove(); });
    }
  }
  for (const [site, f] of [['fish.sazanami.rocks', 'mejina'], ['fish.sazanami.rocks', 'kasago'], ['fish.sazanami.rocks', 'kyusen'], ['fish.boat', 'saba'], ['fish.boat', 'isaki'], ['fish.boat', 'madai']]) {
    await p.evaluate(async ({ site, f }) => {
      const host = document.createElement('div'); host.id = 'cov'; host.style.cssText = 'position:fixed;left:0;top:0;width:640px;height:420px;z-index:9999;background:#000'; document.body.appendChild(host);
      const st = RB.fishStage.create(host, { site, comp: null, look: RB.equip.look(RB.game.s) });
      st.set({ patch: RB.fishing.site(site).patches[0].id, fish: f, situation: null });
      for (const ph of ['land', 'observe']) { st.go(ph, {}); await new Promise((r) => setTimeout(r, 700)); }
    }, { site, f });
    await p.locator('#cov').screenshot({ path: path.join(OUT, '2-fish-' + f + '.png') });
    await p.evaluate(() => { document.getElementById('cov').remove(); });
  }
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('3. a six-chapter journey keeps its three stations and nine fish', async () => {
  const { p, ctx, errors } = await page(b, url);
  await start(p, { site: 'fish.reedwake.current', edition: 1 });
  const r = await p.evaluate(() => { const s = RB.game.s; return { ed: RB.edition.of(s), stations: RB.fishing.stationList(s), total: RB.fishing.counts(s).total, html: RB.ui.fishingNotes.html(s) }; });
  assert(r.ed === 1 && r.total === 9 && !/Sazanami|One-Pine/.test(r.stations) && !/Sazanami|One-Pine/.test(r.html), 'nine fish, three stations, no coast: ' + r.stations);
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('4. the boat to the One-Pine Islet after the story: the chart, the crew, the landing, the stone, the way home', async () => {
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await p.evaluate(async () => {
    const s = RB.game.debugStart('sg.harbor', 35, 33, { edition: 2, comp: 'ren', flags: { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, postgame: true } });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    s.visited['sg.harbor'] = true;
    await RB.hooks.sail_boat(['chidori', 'ちどり']);
    s.vars.sea_hull = 'chidori';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings(); RB.world.refreshActors();
  });
  const toChoice = async (ms = 8000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (await p.$('.choices:not(.hidden) .choice')) return p.$$eval('.choices:not(.hidden) .choice', (xs) => xs.map((x) => x.textContent));
      await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); });
      await p.waitForTimeout(60);
    }
    return null;
  };
  const pick = (re) => p.locator('.choices:not(.hidden) .choice').filter({ hasText: re }).first().click();
  const until = async (fn, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(fn)) return true; await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); }); await p.waitForTimeout(60); } throw new Error('timed out: ' + String(fn).slice(0, 100)); };
  const boat = await p.evaluate(() => RB.content.maps['sg.harbor'].props.find((q) => q.scene === 'sea.boat'));
  await p.evaluate((b) => { RB.sail.plan = () => ({ sits: [], wind: 'up' }); RB.script.run('sea.boat', { prop: b }); }, boat);
  await toChoice();
  await pick(/Open the chart/);
  await p.waitForSelector('.sea-folio .sea-dest');
  const dests = await p.$$eval('.sea-dest', (xs) => xs.map((x) => x.dataset.to));
  assert(dests.includes('islet'), 'after the story the chart lists the One-Pine Islet: ' + dests.join());
  await p.screenshot({ path: path.join(OUT, '4-chart.png') });
  await p.click('.sea-dest[data-to=islet]');
  await p.click('.sea-mode[data-mode=crew]');
  await until(() => RB.world.W.map && RB.world.W.map.id === 'sea.islet');
  await until(() => RB.game.s.flags.sea_islet_seen);
  await until(() => RB.game.mode() === 'world' && !RB.ui.dialogue.isOpen() && !RB.script.isRunning());
  const at = await p.evaluate(() => ({ at: RB.game.s.sea.at, seen: !!RB.game.s.flags.sea_islet_seen, x: RB.world.W.player.x, y: RB.world.W.player.y }));
  assert(at.at === 'islet' && at.seen, 'arrived at the islet, the first landing seen: ' + JSON.stringify(at));
  await p.screenshot({ path: path.join(OUT, '4-islet.png') });
  // the stone: read it (the reading answered in the real task screen, choosing the right reading), then carve
  await p.evaluate(() => { window.__done = false; RB.script.run('sea.islet_stone').then(() => { window.__done = true; }); });
  const right = await p.evaluate(() => { const k = RB.content.challenges['sea.islet_stone'].tiers.E[0]; return k.options.find((o) => o.ok).en; });
  let carved = false;
  for (let i = 0; i < 400 && !(await p.evaluate(() => window.__done)); i++) {
    const st = await p.evaluate(() => ({ chal: !!document.querySelector('.chal'), ok: !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'),
      choices: [...document.querySelectorAll('button.choice')].filter((x) => x.getClientRects().length && !x.closest('.chal')).map((x) => x.textContent.trim()), open: RB.ui.dialogue.isOpen() }));
    if (st.ok) { await p.click('.fbwrap[data-fb=ok] .fb-go'); continue; }
    if (st.choices.length) { const k = st.choices.findIndex((t) => /Carve your boat/.test(t)); assert(k >= 0, 'after the reading, the choice to carve: ' + st.choices); carved = true; await p.evaluate((k) => [...document.querySelectorAll('button.choice')].filter((x) => x.getClientRects().length && !x.closest('.chal'))[k].click(), k); await p.waitForTimeout(120); continue; }
    if (st.chal) {
      await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
      await p.evaluate((right) => { const x = [...document.querySelectorAll('.chal .mc .btn')].find((b) => b.textContent.includes(right.slice(0, 24))); if (x && !x.disabled) x.click(); }, right);
      await p.waitForTimeout(120);
      continue;
    }
    if (st.open) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(40);
  }
  assert(carved, 'the reading answered and the name carved');
  await until(() => RB.game.s.flags.sea_islet_stone);
  await until(() => RB.game.mode() === 'world' && !RB.ui.dialogue.isOpen() && !RB.script.isRunning());
  const back = await p.evaluate(() => RB.game.s.backlog.slice(-3).map((l) => l.en).join(' | '));
  assert(/Beside the Chidori-maru/.test(back), 'carved beside the Chidori-maru: ' + back);
  // the way home from the islet's jetty
  const iboat = await p.evaluate(() => RB.content.maps['sea.islet'].props.find((q) => q.scene === 'sea.boat'));
  assert(iboat && await p.evaluate((b) => RB.state.test(RB.game.s, b.if), iboat), 'the boat at the islet\'s jetty');
  await p.evaluate((b) => { RB.script.run('sea.boat', { prop: b }); }, iboat);
  await toChoice();
  await pick(/Open the chart/);
  await p.waitForSelector('.sea-folio .sea-dest');
  const home = await p.$$eval('.sea-dest', (xs) => xs.map((x) => x.dataset.to));
  assert(home.includes('saltglass') && !home.includes('islet'), 'from the islet the chart lists the way home: ' + home.join());
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
