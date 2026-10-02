// The pets' development playback and coverage gallery, in the BUILT game (headless Chromium, session-only debug
// campaigns, no player saves):
// - not reachable in normal play: without ?dev=pets there is no panel and every dev entry point refuses;
// - the dev page (?dev=pets) has the controls (species, look, family, actor, result, target count, viewport, motion);
// - the coverage matrix: every species × every response family, the creature's move (hit / soft / status), the
//   settled victory, every calm idle, the ready idle and the stances; three full-motion moments and the
//   reduced-motion hold per cell; every cell drawn; every family moves in full motion and holds one still pose
//   with reduced motion; sheets for the first look and for the other looks (tests/e2e/out/pets/gallery_*.png);
// - playback on the real stage: a dev encounter; families played for you, your companion, the creature (hit and
//   warded), a status, several targets, reduced motion — the real observer reacts, the battle is left untouched (still choosing);
//   at 1280×800, 390×844 and 844×390, clear of the interface; the dev panel folds away on small screens; a
//   resize and a hidden tab mid-reaction leave nothing held;
// - quiet sounds: the four synthesized effects render, soft and clean, and nothing plays with the setting off.
// Usage: node tests/e2e/pets_gallery.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const outDir = path.join(root, 'tests/e2e/out/pets');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 240s')), 240000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + ': ' + e.message); console.log('FAIL ' + name + ': ' + (e.stack || e.message)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);
const devUrl = url + (url.includes('?') ? '&' : '?') + 'dev=pets';

await test('normal play: no dev panel, and every dev entry point refuses', async () => {
  const { p, errors, ctx } = await page(b, url);
  await wait(p, 400);
  const r = await p.evaluate(async () => ({ panel: !!document.getElementById('pets-dev'), allowed: RB.pets.dev.allowed(), play: RB.pets.dev.play({ family: 'unravel' }), sheet: RB.pets.dev.sheet(), panel2: RB.pets.dev.panel(), battle: await RB.pets.dev.battle({ species: 'cat' }), mode: RB.game.mode() }));
  assert(!r.panel && !r.allowed && r.play === false && r.sheet === null && r.panel2 === null && r.battle === false && r.mode !== 'battle', 'refused: ' + JSON.stringify(r));
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('the dev page: controls for species, look, family, actor, result, targets, viewport and motion', async () => {
  const { p, errors, ctx } = await page(b, devUrl);
  await p.waitForSelector('#pets-dev');
  const c = await p.evaluate(() => {
    const el = document.getElementById('pets-dev');
    const opts = (id) => [...el.querySelectorAll('#pd-' + id + ' option')].map((o) => o.textContent);
    return { sp: opts('sp'), look: opts('look'), fam: opts('fam'), actor: opts('actor'), result: opts('result'), n: opts('n'), motion: opts('motion'), vp: [...el.querySelectorAll('[data-vp]')].map((x) => x.dataset.vp) };
  });
  assert(c.sp.join() === 'cat,dog,bird,tanuki' && c.look.length === 3 && c.fam.length >= 19 && c.actor.join() === 'pc,comp,foe' && c.result.length === 4 && c.n.join() === '1,2,3' && c.motion.join() === 'full,reduced' && c.vp.join() === 'wide,phone,small', 'the controls: ' + JSON.stringify(c));
  await p.selectOption('#pd-sp', 'bird');
  assert((await p.evaluate(() => [...document.querySelectorAll('#pd-look option')].map((o) => o.textContent).join())) === 'brown,gray,cream', 'the looks follow the species');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('coverage matrix: 4 species × every family, impacts, victory, idles and stances; full and reduced motion', async () => {
  const { p, errors, ctx } = await page(b, devUrl, { viewport: { width: 1280, height: 800 } });
  const r = await p.evaluate(() => {
    const cells = RB.pets.dev.cells();
    const out = { missing: [], still: [], moving: [], rows: {}, empty: [] };
    for (const sp in cells) {
      out.rows[sp] = cells[sp].length;
      for (const f of RB.families.LIST) if (!cells[sp].some((c) => c.kind === 'react' && c.name === f)) out.missing.push(sp + ':' + f);
      const stance = RB.battlePets.sampleAny(sp, 'ready', null, null, {});
      for (const c of cells[sp]) {
        if (c.kind === 'stance') continue;
        const full = c.keys.slice(0, 3), red = c.keys[3];
        // full motion: it moves (the moments differ from each other or from the stance it starts from)
        const from = JSON.stringify(RB.battlePets.sampleAny(sp, c.kind === 'calm' ? 'calm' : c.kind === 'victory' ? 'calm' : 'ready', null, null, {}).po) + '|0';
        if (new Set(full.concat([from])).size < 2) out.still.push(sp + ':' + c.label);
        // reduced motion: react / impact / victory rows hold a visible pose (not the plain stance)
        if ((c.kind === 'react' || c.kind === 'impact') && red === JSON.stringify(stance.po) + '|0') out.moving.push(sp + ':' + c.label);
      }
    }
    // every cell drawn (pixels in each cell of the sheet)
    const cv = RB.pets.dev.sheet();
    const g = cv.getContext('2d');
    const cols = RB.pets.dev.MOMENTS.length + 1;
    RB.pets.ORDER.forEach((sp) => {
      const n = cells[sp].length;
      for (let ri = 0; ri < n; ri++) for (let ci = 0; ci < cols; ci++) {
        const q = RB.pets.dev.cellRect(RB.pets.ORDER, sp, cells[sp][ri].label, ci);
        const d = g.getImageData(q.x + 4, q.y + 4, q.w - 8, q.h - 8).data;
        let lit = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 3 * 90 && Math.abs(d[i] - d[i + 2]) > 6) lit++;
        if (lit < 30) out.empty.push(sp + ':' + cells[sp][ri].label + ':' + ci);
      }
    });
    out.png = cv.toDataURL('image/png');
    const looks = {}; for (const sp of RB.pets.ORDER) looks[sp] = RB.petArt.LOOK_ORDER[sp][1];
    out.png2 = RB.pets.dev.sheet({ looks }).toDataURL('image/png');
    const looks3 = {}; for (const sp of RB.pets.ORDER) looks3[sp] = RB.petArt.LOOK_ORDER[sp][2];
    out.png3 = RB.pets.dev.sheet({ looks: looks3 }).toDataURL('image/png');
    out.cache = RB.petArt.cacheStats ? RB.petArt.cacheStats() : null;
    return out;
  });
  fs.writeFileSync(path.join(outDir, 'gallery_look1.png'), Buffer.from(r.png.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outDir, 'gallery_look2.png'), Buffer.from(r.png2.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outDir, 'gallery_look3.png'), Buffer.from(r.png3.split(',')[1], 'base64'));
  console.log('   rows per species ' + JSON.stringify(r.rows) + '; frame cache ' + JSON.stringify(r.cache));
  assert(!r.missing.length, 'every family has a row for every species: missing ' + r.missing.join(', '));
  assert(!r.still.length, 'every timeline moves in full motion: still ' + r.still.join(', '));
  assert(!r.moving.length, 'reduced motion holds a visible key pose for every reaction: plain ' + r.moving.join(', '));
  assert(!r.empty.length, 'every cell drawn: empty ' + r.empty.slice(0, 12).join(', '));
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('quiet sounds: four synthesized effects (no files), heard but soft, never clipping; none with "Quiet pet sounds" off', async () => {
  const { p, errors, ctx } = await page(b, url);
  const r = await p.evaluate(async () => {
    const out = { list: RB.audio.sfxList().filter((x) => /^pet_/.test(x)).sort(), fx: {} };
    for (const id of out.list.concat(['confirm'])) { const q = await RB.audio.renderOffline('sfx:' + id, 1.2); out.fx[id] = { peak: q.peak, rms: q.rms, nan: q.nan, clipped: q.clipped }; }
    RB.game.settings.petSounds = false;
    out.off = ['cat', 'dog', 'bird', 'tanuki'].map((sp) => RB.pets.sound(sp, 'pat'));
    return out;
  });
  assert(r.list.join() === 'pet_bird,pet_cat,pet_dog,pet_tanuki', 'the four: ' + r.list.join());
  for (const id of r.list) assert(!r.fx[id].nan && r.fx[id].peak > 0.01 && r.fx[id].peak < r.fx.confirm.peak && !r.fx[id].clipped, id + ' soft (quieter than a menu confirm) and clean: ' + JSON.stringify(r.fx[id]));
  assert(r.off.every((x) => x === false), 'nothing plays with the setting off');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await ctx.close();
});

for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  await test('playback on the real stage at ' + vp.width + '×' + vp.height + ': player, companion, creature (hit, warded, status), several targets, reduced motion; nothing left over', async () => {
    const { p, errors, ctx } = await page(b, devUrl, { viewport: vp, touch: vp.width < 500, mobile: vp.width < 500 });
    await p.evaluate(() => RB.pets.dev.battle({ species: 'tanuki', look: 'dark', comp: 'suzu' }));
    const choose = async () => { for (let i = 0; i < 300; i++) { const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), c: !!document.querySelector('.rcard[data-i]') && !RB.battleSeq.busy() })); if (st.c) return true; if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true)); await wait(p, 50); } return false; };
    assert(await choose(), 'the dev encounter reaches the choice');
    await wait(p, 800);
    // its place: clear of the response area, the task, the slips, the party panel and the lines
    const clash = await p.evaluate(() => {
      const bx = RB.battlePets.stats().box; if (!bx) return 'no box';
      const hit = (r) => !(bx.x + bx.w <= r.left || r.right <= bx.x || bx.y + bx.h <= r.top || r.bottom <= bx.y);
      const els = [...document.querySelectorAll('.cb-dock, .rcards, .rcard, .cb-slips, .cb-party, .cb-tele, .dlg:not(.hidden)')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.height; });
      const bad = els.filter((e) => hit(e.getBoundingClientRect())).map((e) => e.className);
      return bad.length ? bad.join(',') + ' ' + JSON.stringify(bx) : null;
    });
    assert(!clash, 'the pet overlaps interface at ' + vp.width + '×' + vp.height + ': ' + clash);
    // the panel folds to one button (folded already on a short screen), leaving the stage in view
    if (vp.width < 900) {
      const folded = await p.evaluate(() => { const el = document.getElementById('pets-dev'); if (!el.classList.contains('min')) el.querySelector('#pd-toggle').click(); const r = el.getBoundingClientRect(); return { min: el.classList.contains('min'), h: r.height }; });
      assert(folded.min && folded.h < 60, 'the dev panel folds away: ' + JSON.stringify(folded));
    }
    if (vp.width === 844) await p.screenshot({ path: path.join(outDir, 'dev_play_landscape.png') });
    const plays = [
      { family: 'fire', actor: 'pc' }, { family: 'heal', actor: 'comp' }, { kind: 'impact', actor: 'foe', result: 'hit' },
      { kind: 'impact', actor: 'foe', result: 'blocked' }, { kind: 'impact', actor: 'foe', result: 'status' }, { family: 'wind', actor: 'pc', targets: 3 }, { family: 'technique', actor: 'comp' },
      { family: 'bell', actor: 'pc', reduce: true },
    ];
    const seen = [];
    for (const [i, o] of plays.entries()) {
      await p.evaluate((o) => RB.pets.dev.play(o), o);
      await wait(p, 450);
      if (vp.width === 1280 && i === 0) await p.screenshot({ path: path.join(outDir, 'dev_play_wide.png') });
      if (vp.width < 500 && i === 5) await p.screenshot({ path: path.join(outDir, 'dev_play_phone.png') });
      await wait(p, 900);
      // (a creature's move is now traced as a brace, the move's own reaction and a settle: the move's own is the one compared)
      seen.push(await p.evaluate(() => { const st = RB.battlePets.stats(); const tr = st.trace.filter((x) => x.impact !== 'prep' && x.impact !== 'settle'); return { t: tr[tr.length - 1], reduce: RB.game.reducedMotion(), q: st.queued }; }));
    }
    const fam = seen.map((x) => x.t && (x.t.family || x.t.outcome));
    assert(fam.join() === 'fire,heal,hit,blocked,status,wind,technique,bell', 'the observer saw each played event: ' + JSON.stringify(seen));
    assert(seen[7].reduce === true, 'reduced motion switched on for the last');
    await wait(p, 1200); // the held key pose has ended: back to its stance
    const still = await p.evaluate(async () => { const a = JSON.stringify(RB.battlePets.stats().pose); const n = RB.battlePets.stats().stats.drawn; await new Promise((r) => setTimeout(r, 700)); const st = RB.battlePets.stats(); return { same: a === JSON.stringify(st.pose), a, b: JSON.stringify(st.pose), drawn: st.stats.drawn - n, base: st.base }; });
    assert(still.same && still.drawn > 0, 'reduced motion: still afterwards (and still drawn): ' + JSON.stringify(still));
    const after = await p.evaluate(() => ({ phase: RB.combat.phase(), busy: RB.battleSeq.busy(), cards: document.querySelectorAll('.rcard[data-i]').length }));
    assert(after.phase === 'choose' && !after.busy && after.cards > 0, 'the battle is untouched (still choosing, no sequence stuck): ' + JSON.stringify(after));
    if (vp.width === 1280) {
      // mid-reaction, the window is resized and the tab is hidden and shown again: nothing waits on the pet
      await p.evaluate(() => { RB.game.settings.reducedMotion = false; RB.game.applySettings(); RB.pets.dev.play({ family: 'unravel', actor: 'pc' }); });
      await wait(p, 150);
      await p.setViewportSize({ width: 1024, height: 700 });
      await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
      await wait(p, 600);
      await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
      await p.setViewportSize({ width: 1280, height: 800 });
      await wait(p, 1500);
      const back = await p.evaluate(() => ({ phase: RB.combat.phase(), busy: RB.battleSeq.busy(), cards: document.querySelectorAll('.rcard[data-i]').length, pet: RB.battlePets.stats().on, box: RB.battlePets.stats().box }));
      assert(back.phase === 'choose' && !back.busy && back.cards > 0 && back.pet && back.box, 'after a resize and a hidden tab mid-reaction: still choosing, nothing held, the pet still in its place: ' + JSON.stringify(back));
    }
    assert(!errors.length, 'no page errors: ' + errors.join(' | '));
    await ctx.close();
  });
}

console.log('\n' + results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
