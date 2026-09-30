// Contact sheets: every species with every companion — in the world (following after a short walk), in battle
// (calm, in its place between the two of you) and in Company (the pair and the Pet page) — from the BUILT game in
// headless Chromium with session-only debug campaigns. Each species uses a different look per companion, so the
// looks are covered too. Checks while it goes: the pet is drawn in each place, on floor in the world, clear of the
// battle interface. Writes tests/e2e/out/pets/sheet_{world,battle,company}.png.
// Usage: node tests/e2e/pets_sheets.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const outDir = path.join(root, 'tests/e2e/out/pets');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const SP = ['cat', 'dog', 'bird', 'tanuki'], CO = ['nao', 'mio', 'ren', 'suzu'];
const shots = { world: [], battle: [], company: [] };
const problems = [];
const wait = (p, ms) => p.waitForTimeout(ms);

for (const sp of SP) {
  for (const [ci, comp] of CO.entries()) {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    try {
      const lk = await p.evaluate(([sp, ci]) => RB.petArt.LOOK_ORDER[sp][ci % 3], [sp, ci]);
      // ---- world: walk three steps, let it follow and settle
      await p.evaluate(async ([sp, comp, lk]) => {
        RB.game.debugStart('rw.village', 20, 20, { comp, flags: { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, departed: true, ch1_done: true }, dir: 'left' });
        RB.game.settings.textSpeed = 'instant';
        await new Promise((r) => setTimeout(r, 250));
        for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
        const s = RB.game.s; RB.pets.meet(s, sp); RB.pets.setLook(s, sp, lk); RB.pets.select(s, sp);
      }, [sp, comp, lk]);
      await wait(p, 400);
      for (const k of ['ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowDown']) { await p.keyboard.down(k); await wait(p, 230); await p.keyboard.up(k); await wait(p, 80); }
      await wait(p, 2200);
      const w = await p.evaluate(() => { const P = RB.petWorld.state(); return { shown: P.shown, drawn: P.drawn, floor: !RB.maps.blockedStatic(RB.world.W.map, P.x, P.y), onYou: P.x === RB.world.W.player.x && P.y === RB.world.W.player.y }; });
      if (!w.shown || !w.floor || w.onYou) problems.push(sp + '/' + comp + ' world: ' + JSON.stringify(w));
      const fw = path.join(outDir, 'sh_world_' + sp + '_' + comp + '.png');
      await p.screenshot({ path: fw, clip: { x: 440, y: 250, width: 400, height: 260 } });
      shots.world.push({ f: fw, label: comp + ' × ' + sp + ' (' + lk + ')' });
      // ---- Company: the pair and the Pet page
      await p.evaluate(() => RB.ui.menu.open('pet'));
      await p.waitForSelector('.pet-detail, [data-pet-sel]');
      await wait(p, 600);
      const fc = path.join(outDir, 'sh_company_' + sp + '_' + comp + '.png');
      await p.screenshot({ path: fc });
      shots.company.push({ f: fc, label: comp + ' × ' + sp + ' (' + lk + ')' });
      await p.keyboard.press('Escape'); await wait(p, 200);
      if (await p.evaluate(() => RB.ui.menu.isOpen())) { await p.keyboard.press('Escape'); await wait(p, 200); }
      // ---- battle: calm, while you choose
      await p.evaluate(() => { const s = RB.game.s; s.learn.profile = 'E'; RB.game.startBattle('rw.dustmoth', {}); });
      for (let i = 0; i < 300; i++) { const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), c: !!document.querySelector('.rcard[data-i]') && !RB.battleSeq.busy() })); if (st.c) break; if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true)); await wait(p, 50); }
      await wait(p, 900);
      const bs = await p.evaluate(() => RB.battlePets.stats());
      if (!bs.on || !bs.box) problems.push(sp + '/' + comp + ' battle: not drawn');
      const fb = path.join(outDir, 'sh_battle_' + sp + '_' + comp + '.png');
      await p.screenshot({ path: fb, clip: { x: 40, y: 380, width: 420, height: 280 } });
      shots.battle.push({ f: fb, label: comp + ' × ' + sp + ' (' + lk + ')' });
      if (errors.length) problems.push(sp + '/' + comp + ' errors: ' + errors.join(' | '));
    } catch (e) { problems.push(sp + '/' + comp + ': ' + e.message); }
    await ctx.close();
    console.log('done ' + sp + ' × ' + comp);
  }
}

const pg = await b.newPage();
for (const kind of ['world', 'battle', 'company']) {
  const list = shots[kind].map((q) => ({ label: q.label, d: 'data:image/png;base64,' + fs.readFileSync(q.f).toString('base64') }));
  const data = await pg.evaluate(async ([list, kind]) => {
    const imgs = [];
    for (const q of list) { const im = new Image(); im.src = q.d; await im.decode(); imgs.push(im); }
    const sc = kind === 'company' ? 0.5 : 1;
    const W = Math.round(imgs[0].width * sc), H = Math.round(imgs[0].height * sc), cols = 4;
    const cv = document.createElement('canvas'); cv.width = cols * (W + 6); cv.height = Math.ceil(imgs.length / cols) * (H + 24);
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = kind === 'company'; c.fillStyle = '#1c2530'; c.fillRect(0, 0, cv.width, cv.height);
    c.font = '14px sans-serif'; c.fillStyle = '#eee';
    imgs.forEach((im, i) => { const x = (i % cols) * (W + 6), y = Math.floor(i / cols) * (H + 24); c.fillText(list[i].label, x + 4, y + 16); c.drawImage(im, x, y + 22, W, H); });
    return cv.toDataURL('image/png');
  }, [list, kind]);
  fs.writeFileSync(path.join(outDir, 'sheet_' + kind + '.png'), Buffer.from(data.split(',')[1], 'base64'));
  console.log('wrote sheet_' + kind + '.png (' + list.length + ')');
}
await pg.close();
console.log(problems.length ? 'PROBLEMS\n' + problems.join('\n') : 'no problems: ' + (shots.world.length) + ' combinations in the world, battle and Company');
await b.close(); srv.close();
process.exit(problems.length ? 1 : 0);
