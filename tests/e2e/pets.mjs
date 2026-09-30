// Cosmetic pets in the BUILT game (the Living Company addendum §3–6, §23.2), in headless Chromium with
// synthetic campaigns in fresh browser contexts (never a player's save):
// - world: the selected pet follows the trail you walked (floor only, over the bridge, never on water or
//   walls), keeps off your tile and your companion's, never changes the collision grid or what is solid,
//   catches up after a warp and a door, hides with "Show pet in exploration" off and in a scene that asks,
//   and is restored after it;
// - battle: it takes its place between the two of you, reacts to your response (its family) and your
//   companion's action (a short acknowledgement in the same exchange), to the creature's move, cheers the
//   last knot; nothing over the response area; the post-battle Next button is clicked with the mouse;
//   reduced motion holds still poses; no pet, nothing drawn;
// - Company › Pet: cards, Select / Selected / No pet, rename (Japanese, long, markup — escaped), reset,
//   the three looks, the Pat preview, keyboard, 44-px targets, the phone page with Back, 320×640 at 200 %;
// - the vignette, with the keyboard and the mouse: the cause, one ordinary interaction, the meeting, the
//   invitation, naming, the meeting memory once, selection as its own choice; save, reload, still there.
// Captures go to tests/e2e/out/pets/.
// Usage: node tests/e2e/pets.mjs [species,…] [filter]      (default: every species)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root, companionTurn } from './lib.mjs';

const args = process.argv.slice(2);
const SPECIES = (args.find((a) => /^(cat|dog|bird|tanuki)(,|$)/.test(a)) || 'cat,dog,bird,tanuki').split(',');
const only = args.find((a) => !/^(cat|dog|bird|tanuki)(,|$)/.test(a) && !a.startsWith('--'));
const outDir = path.join(root, 'tests/e2e/out/pets');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 240s')), 240000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name); console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1500)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);
const COMPS = { cat: 'mio', dog: 'nao', bird: 'ren', tanuki: 'suzu' };
const shot = (p, name) => p.screenshot({ path: path.join(outDir, name + '.png') });

async function world(p, map, x, y, o) {
  o = o || {};
  await p.evaluate(async ([map, x, y, o]) => {
    const f = Object.assign({ rw_arrived: true, rw_road_lit: true, rw_echo_done: true, departed: true, ch1_done: true }, o.flags || {});
    RB.game.debugStart(map, x, y, { comp: o.comp === undefined ? 'mio' : o.comp, flags: f, dir: o.dir || 'down' });
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    await new Promise((r) => setTimeout(r, 250));
    for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
    if (o.sp) { RB.pets.meet(RB.game.s, o.sp); if (o.look) RB.pets.setLook(RB.game.s, o.sp, o.look); if (o.select !== false) RB.pets.select(RB.game.s, o.sp); }
  }, [map, x, y, o]);
  await wait(p, 400);
}
const pstate = (p) => p.evaluate(() => { const W = RB.world.W, P = RB.petWorld.state(); return Object.assign(P, { px: W.player.x, py: W.player.y, cx: W.comp ? W.comp.x : null, cy: W.comp ? W.comp.y : null, floor: !RB.maps.blockedStatic(W.map, P.x, P.y), map: W.map.id }); });
const blockHash = (p) => p.evaluate(() => { const m = RB.world.W.map; let h = 0; for (let i = 0; i < m.block.length; i++) h = (h * 31 + (m.block[i] ? 1 : 0) + i) | 0; return h; });
async function hold(p, key, ms) { await p.keyboard.down(key); await wait(p, ms); await p.keyboard.up(key); }

// ---------------------------------------------------------------------------------------------------------------
for (const sp of SPECIES) {
  await test(sp + ': world — follows your trail on floor, never solid, clear of you both, catches up; hidden by setting and scene', async () => {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await world(p, 'rw.village', 22, 22, { sp, comp: COMPS[sp], dir: 'up' });
    const h0 = await blockHash(p);
    const samples = [];
    const route = [['ArrowUp', 900], ['ArrowLeft', 1100], ['ArrowDown', 700], ['ArrowRight', 1500], ['ArrowUp', 500]];
    for (const [k, ms] of route) {
      await p.keyboard.down(k);
      const t0 = Date.now();
      while (Date.now() - t0 < ms) { samples.push(await pstate(p)); await wait(p, 60); }
      await p.keyboard.up(k);
    }
    await wait(p, 1500);
    const settled = await pstate(p);
    assert(samples.every((q) => q.floor), 'the pet only ever stood on floor');
    assert(samples.some((q) => q.moving), 'it walked');
    assert(settled.shown && settled.alpha === 1, 'it is shown');
    assert(!(settled.x === settled.px && settled.y === settled.py) && !(settled.x === settled.cx && settled.y === settled.cy), 'settled clear of you and your companion: ' + JSON.stringify(settled));
    assert(Math.abs(settled.x - settled.px) + Math.abs(settled.y - settled.py) <= 4, 'it stays close: ' + JSON.stringify(settled));
    assert(h0 === await blockHash(p), 'the collision grid is unchanged');
    const solid = await p.evaluate(() => { const P = RB.petWorld.state(); return RB.world.blocked(P.x, P.y, {}) !== RB.maps.blockedStatic(RB.world.W.map, P.x, P.y) && !RB.world.W.npcs.some((n) => n.x === P.x && n.y === P.y); });
    assert(!solid, 'its tile is not solid because of it');
    await shot(p, sp + '_world_follow');
    // the bridge: over the planks and never on the water
    await world(p, 'rw.village', 32, 17, { sp, comp: COMPS[sp], dir: 'right', flags: { bridge_fixed: true } });
    const over = [];
    await p.keyboard.down('ArrowRight');
    for (let i = 0; i < 30; i++) { over.push(await pstate(p)); await wait(p, 60); }
    await p.keyboard.up('ArrowRight');
    await wait(p, 800);
    over.push(await pstate(p));
    assert(over.every((q) => q.floor), 'over the bridge on the planks only: ' + JSON.stringify(over.filter((q) => !q.floor)[0] || {}));
    assert(over[over.length - 1].px >= 40 && over.some((q) => q.x >= 36 && q.x <= 40), 'it crossed the bridge behind you');
    await shot(p, sp + '_world_bridge');
    // a door: inside, it appears behind the two of you
    await p.evaluate(() => RB.game.transition('rw.tea', 4, 7, 'up'));
    await wait(p, 900);
    const inside = await pstate(p);
    assert(inside.map === 'rw.tea' && inside.floor && inside.shown, 'through the door it came too: ' + JSON.stringify(inside));
    await shot(p, sp + '_world_inside');
    // a warp (a scene moving you): a discreet catch-up beside you
    const c0 = inside.stats.catchups;
    await p.evaluate(() => RB.game.transition('rw.village', 5, 30, 'right', { inScript: true }));
    await wait(p, 900);
    const warped = await pstate(p);
    assert(warped.map === 'rw.village' && Math.abs(warped.x - warped.px) + Math.abs(warped.y - warped.py) <= 3 && warped.floor, 'after the warp it is beside you: ' + JSON.stringify(warped));
    void c0;
    // the setting: hidden, then back
    const d0 = (await pstate(p)).drawn;
    await p.evaluate(() => { RB.game.settings.petWorld = false; });
    await wait(p, 300);
    const off = await pstate(p);
    await wait(p, 300);
    const off2 = await pstate(p);
    assert(!off.shown && off2.drawn === off.drawn, 'Show pet in exploration off: not drawn');
    await p.evaluate(() => { RB.game.settings.petWorld = true; });
    await wait(p, 300);
    assert((await pstate(p)).drawn > off2.drawn && d0 > 0, 'on again: drawn');
    // a scene that cannot stage it: hidden while it runs, restored after
    const during = await p.evaluate(async () => {
      RB.script.add('@scene pets.test.hide\n!hook pet_hide\nnarr: {静|しず}か 。 || Quiet.\n', 'test');
      const run = RB.script.run('pets.test.hide');
      await new Promise((r) => setTimeout(r, 300));
      const inScene = RB.petWorld.state().shown;
      for (let i = 0; i < 20 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 50)); }
      await run;
      await new Promise((r) => setTimeout(r, 200));
      return { inScene, after: RB.petWorld.state().shown };
    });
    assert(during.inScene === false && during.after === true, 'hidden during the scene, restored after: ' + JSON.stringify(during));
    assert(!errors.length, 'no page errors: ' + errors.join(' | '));
    await ctx.close();
  });

  await test(sp + ': battle — its place between you, reactions to response, companion, creature and the last knot; Next clicked; reduced motion; no pet', async () => {
    for (const reduce of [false, true]) {
      const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
      await p.evaluate(([sp, comp, reduce]) => {
        const s = RB.game.debugStart('rw.millroad', 10, 22, { comp });
        s.learn.profile = 'E'; s.learn.kanaKnown = 'both'; s.words = ['mamoru', 'mizu', 'hikari'];
        s.tips = Object.assign({ harmony: 1, harmonyFull: 1 }, ...['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge'].map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
        RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'normal';
        RB.game.settings.reducedMotion = reduce; RB.game.applySettings();
        RB.pets.meet(s, sp); RB.pets.select(s, sp);
        const run = RB.challenge.runStep; RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
        window.__res = null;
        window.__pb = null;
        RB.bus.on('present:scene', (e) => { if (e.phase === 'victory' || e.phase === 'calm') setTimeout(() => { const st = RB.battlePets.stats(); if (st.on) window.__pb = st; }, 0); });
        RB.bus.on('present:action', () => setTimeout(() => { const st = RB.battlePets.stats(); if (st.on) window.__pb = st; }, 0));
        RB.game.startBattle('rw.dustmoth', {}).then((r) => { window.__res = r; });
      }, [sp, COMPS[sp], reduce]);
      const cards = async () => { for (let i = 0; i < 300; i++) { const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), c: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy(), res: window.__res })); if (st.c || st.res) return st; if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true)); await wait(p, 50); } };
      await cards();
      await p.evaluate(() => { const st = RB.combat.state(); st.knots = st.maxKnots = 2; st.foes[0].knots = st.foes[0].maxKnots = 2; RB.combat.refresh(); });
      await wait(p, 600);
      const calm = await p.evaluate(() => RB.battlePets.stats());
      assert(calm.on && calm.sp === sp && calm.base === 'calm', 'in battle, calm while you choose: ' + JSON.stringify(calm).slice(0, 200));
      // nothing over the response area, the task, or the companion's cards
      const clash = await p.evaluate(() => {
        const bx = RB.battlePets.stats().box; if (!bx) return 'no box';
        const hit = (r) => !(bx.x + bx.w <= r.left || r.right <= bx.x || bx.y + bx.h <= r.top || r.bottom <= bx.y);
        const els = [...document.querySelectorAll('.cb-dock, .rcards, .rcard, .cb-slips, .cb-party, .cb-tele, .dlg:not(.hidden)')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.height; });
        const bad = els.filter((e) => hit(e.getBoundingClientRect())).map((e) => e.className);
        return bad.length ? bad.join(',') : null;
      });
      assert(!clash, 'the pet overlaps interface: ' + clash);
      if (!reduce) await shot(p, sp + '_battle_calm');
      const stillPose = reduce ? await p.evaluate(async () => { const a = JSON.stringify(RB.battlePets.stats().pose); await new Promise((r) => setTimeout(r, 900)); return a === JSON.stringify(RB.battlePets.stats().pose); }) : true;
      assert(stillPose, 'reduced motion: still while you choose');
      // a response (Unravel), answered with the mouse; the companion's action
      for (let round = 0; round < 3; round++) {
        const st = await cards();
        if (st.res || await p.evaluate(() => RB.ui.dialogue.isOpen())) break;
        // a telegraphed Strike each round (no mist), so Unravel is always open
        await p.evaluate(() => { const st = RB.combat.state(); st.intent = Object.assign(RB.combatLogic.intentDef({}, 'strike'), { target: 'pc' }); st.foes[0].intent = st.intent; st.shroud = false; st.foes[0].shroud = false; RB.combat.refresh(); });
        await wait(p, 150);
        const c = await p.evaluate(() => { const e = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && /Unravel/.test(x.textContent)); e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        await p.mouse.click(c.x, c.y);
        await p.waitForSelector('.chal');
        if (await p.$('.chal .mc .btn')) {
          const r = await p.evaluate(() => { const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')]; const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); }; const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : ''); const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o))); const q = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())).getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
          await p.mouse.click(r.x, r.y);
        } else { await p.click('.chal [data-a=reveal]'); }
        await p.waitForSelector('.fbwrap .fb-go');
        await p.click('.fbwrap .fb-go');
        await companionTurn(p, {});
        // during the exchange: capture the pet mid-reaction
        if (!reduce && round === 0) { await wait(p, 700); await shot(p, sp + '_battle_react'); }
        for (let i = 0; i < 200; i++) { const s2 = await p.evaluate(() => ({ busy: RB.battleSeq.busy(), ph: RB.combat.phase(), dlg: RB.ui.dialogue.isOpen(), res: window.__res })); if ((!s2.busy && s2.ph === 'choose') || s2.dlg || s2.res) break; await wait(p, 50); }
      }
      const after = await p.evaluate(() => (RB.battlePets.stats().on ? RB.battlePets.stats() : window.__pb));
      const fams = after.trace.filter((r) => r.kind === 'react');
      assert(fams.length >= 1 && fams[0].family === 'unravel' && !fams[0].secondary, 'your Unravel got the unravel reaction: ' + JSON.stringify(after.trace));
      assert(fams.some((r) => r.actor === 'comp' && r.secondary), 'your companion\'s action got a short acknowledgement in the same exchange: ' + JSON.stringify(after.trace));
      assert(after.trace.some((r) => r.kind === 'impact') || after.trace.some((r) => r.kind === 'victory'), 'the creature\'s move (or the last knot) got a reaction: ' + JSON.stringify(after.trace));
      // the last knot: the settle line's Next, clicked with the mouse
      for (let i = 0; i < 200 && !(await p.evaluate(() => RB.ui.dialogue.isOpen() || !!window.__res)); i++) await wait(p, 50);
      await wait(p, 100);
      const v = await p.evaluate(() => (RB.battlePets.stats().on ? RB.battlePets.stats() : window.__pb));
      assert(v.trace.some((r) => r.kind === 'victory') && v.base === 'victory', 'the settled-victory gesture with your cheer: ' + JSON.stringify(v.trace.slice(-3)) + ' ' + v.base);
      if (!reduce) await shot(p, sp + '_battle_victory');
      for (let i = 0; i < 12 && await p.evaluate(() => RB.ui.dialogue.isOpen()); i++) {
        const nb = await p.evaluate(() => { const e = document.querySelector('.dlg:not(.hidden) .b-next'); if (!e) return null; const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { x: r.left + r.width / 2, y: r.top + r.height / 2, mine: !!(top && top.closest('.b-next')) }; });
        assert(nb && nb.mine, 'the Next button is on top (nothing intercepts it)');
        await wait(p, 350);
        await p.mouse.click(nb.x, nb.y);
        await wait(p, 300);
      }
      await p.waitForFunction(() => RB.game.mode() === 'world', null, { timeout: 15000 });
      assert((await p.evaluate(() => RB.battlePets.stats())).on === false, 'gone with the battle (nothing left behind)');
      assert(await p.evaluate(() => RB.battleSeq.stats().timers === 0 && !document.querySelector('.cb-fx')), 'no timers or layers left');
      assert(!errors.length, 'no page errors: ' + errors.join(' | '));
      await ctx.close();
    }
    // no pet: nothing drawn, no slot
    const { p, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await p.evaluate(() => { const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: 'mio' }); s.learn.profile = 'E'; RB.game.settings.textSpeed = 'instant'; RB.game.startBattle('rw.dustmoth', {}); });
    await wait(p, 1500);
    const none = await p.evaluate(() => ({ pet: RB.battlePets.stats(), slot: RB.battleStage.lay() && RB.battleStage.lay().pet }));
    assert(none.pet.on === false && !none.slot, 'no pet: no slot, nothing drawn');
    await ctx.close();
  });

  await test(sp + ': Company › Pet — cards, select / no pet, rename (Japanese, long, markup), reset, looks, pat, keyboard, phone', async () => {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await world(p, 'rw.village', 20, 18, { sp, comp: COMPS[sp] });
    const others = ['cat', 'dog', 'bird', 'tanuki'].filter((x) => x !== sp);
    await p.evaluate((o) => { RB.pets.meet(RB.game.s, o); }, others[0]);
    await p.evaluate(() => RB.ui.menu.open('pet'));
    await wait(p, 500);
    const pg = await p.evaluate(() => ({ cards: [...document.querySelectorAll('[data-pet-sel]')].map((e) => e.dataset.petSel), cos: /Cosmetic companion — no battle or puzzle effects/.test(document.body.textContent), meter: /happiness meter|health:|bond level:/i.test(document.querySelector('#folio-page').textContent), pair: document.querySelector('.co-pair').textContent }));
    assert(pg.cards.length === 2 && pg.cos, 'two met animals, and the cosmetic note: ' + JSON.stringify(pg));
    assert(await p.evaluate(() => !document.querySelector('[data-pet-sel="' + ['cat', 'dog', 'bird', 'tanuki'].find((x) => !RB.pets.record(RB.game.s, x)) + '"]')), 'no card (or silhouette) for an animal not met');
    await shot(p, sp + '_company_wide');
    // No pet, then this one again (with the keyboard)
    await p.click('[data-pet-choose=""]');
    assert(await p.evaluate(() => RB.pets.active(RB.game.s) === null && document.activeElement && document.activeElement.matches('[data-pet-choose=""]')), 'No pet selected; focus stays on the control');
    await p.focus('[data-pet-choose="' + sp + '"]');
    await p.keyboard.press('Enter');
    assert(await p.evaluate(() => !!RB.pets.active(RB.game.s)), 'selected with Enter');
    // rename: markup stays text; long refused; Japanese kept
    await p.evaluate((sp) => { const b = document.querySelector('[data-pet-sel="' + sp + '"]'); b.click(); }, sp);
    await wait(p, 200);
    await p.click('[data-pet-rename]');
    await p.fill('#pet-name', '<img src=x onerror=a>');
    await p.click('[data-pet-save]');
    await wait(p, 300);
    const esc = await p.evaluate((sp) => ({ name: RB.pets.record(RB.game.s, sp).name, img: !!document.querySelector('#folio-page img, .co-pair img, img[onerror]'), shown: [...document.querySelectorAll('.pet-name')].map((e) => e.textContent) }), sp);
    assert(esc.name === '<img src=x onerror=a>' && !esc.img && esc.shown.some((t) => t === '<img src=x onerror=a>'), 'an HTML-looking name is shown as plain text: ' + JSON.stringify(esc));
    await p.click('[data-pet-rename]');
    await p.fill('#pet-name', '{猫|ねこ} $name');
    await p.click('[data-pet-save]');
    await wait(p, 300);
    const esc2 = await p.evaluate((sp) => ({ name: RB.pets.record(RB.game.s, sp).name, ruby: !!document.querySelector('.pet-name ruby, .co-pair ruby'), shown: [...document.querySelectorAll('.pet-name')].map((e) => e.textContent), pair: document.querySelector('.co-pair').textContent }), sp);
    assert(esc2.name === '{猫|ねこ} $name' && !esc2.ruby && esc2.shown.some((t) => t === '{猫|ねこ} $name') && esc2.pair.includes('{猫|ねこ} $name'), 'furigana markup and a variable in a name stay plain text: ' + JSON.stringify(esc2));
    await p.click('[data-pet-rename]');
    await p.fill('#pet-name', 'と'.repeat(25));
    await p.click('[data-pet-save]');
    await wait(p, 250);
    const long = await p.evaluate(() => ({ err: (document.querySelector('.pet-err') || {}).textContent, open: !!document.querySelector('#pet-name') }));
    assert(/up to 24/.test(long.err) && long.open, '25 characters refused with a reason: ' + JSON.stringify(long));
    await p.fill('#pet-name', '');
    await p.click('[data-pet-save]');
    await wait(p, 200);
    assert(/at least one/.test(await p.evaluate(() => document.querySelector('.pet-err').textContent)), 'empty refused');
    await p.fill('#pet-name', 'ぽんぽこ丸');
    await p.fill('#pet-reading', 'ぽんぽこまる');
    await p.keyboard.press('Enter');
    await wait(p, 250);
    assert(await p.evaluate((sp) => RB.pets.record(RB.game.s, sp).name === 'ぽんぽこ丸' && RB.pets.record(RB.game.s, sp).reading === 'ぽんぽこまる', sp), 'a Japanese name and reading saved (Enter)');
    assert(await p.evaluate(() => /ぽんぽこ丸/.test(document.querySelector('.co-pair').textContent)), 'the summary at the top shows the new name');
    // looks
    for (const lk of await p.evaluate((sp) => RB.petArt.LOOK_ORDER[sp], sp)) {
      await p.click('[data-pet-look="' + lk + '"]', { force: true });
      await wait(p, 120);
      assert(await p.evaluate(([sp, lk]) => RB.pets.record(RB.game.s, sp).look === lk && !!document.querySelector('.pet-look.on input[value="' + lk + '"]'), [sp, lk]), 'look ' + lk + ' chosen and marked (not by colour alone: “(chosen)”)');
    }
    await p.click('[data-pet-reset]');
    assert(await p.evaluate((sp) => RB.pets.record(RB.game.s, sp).name === RB.pets.species(sp).name, sp), 'Reset to default');
    // pat: the preview animates, nothing is gained
    const before = await p.evaluate(() => JSON.stringify(RB.game.s.company.bond) + JSON.stringify(RB.game.s.inv) + JSON.stringify(RB.game.s.awarded));
    const f0 = await p.evaluate(() => +document.querySelector('[data-pet-live]').dataset.frame);
    await p.click('[data-pet-pat]');
    await wait(p, 700);
    await shot(p, sp + '_company_pat');
    assert(await p.evaluate(() => +document.querySelector('[data-pet-live]').dataset.frame) > f0, 'the preview is live');
    assert(before === await p.evaluate(() => JSON.stringify(RB.game.s.company.bond) + JSON.stringify(RB.game.s.inv) + JSON.stringify(RB.game.s.awarded)), 'patting gives nothing');
    // targets
    const small = await p.evaluate(() => [...document.querySelectorAll('#folio-page .pet-detail button, #folio-page .pet-card button, #folio-page .pet-look')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.height < 44 || r.width < 44); }).map((e) => e.textContent.trim().slice(0, 20)));
    assert(!small.length, 'every control is at least 44 px: ' + small.join(' | '));
    assert(!errors.length, 'no page errors: ' + errors.join(' | '));
    await ctx.close();
    // the phone: one page, a detail with Back; 320×640 at 200 % text without sideways scrolling
    for (const [vp, scale] of [[{ width: 390, height: 844 }, 1], [{ width: 320, height: 640 }, 2]]) {
      const { p: q, ctx: c2 } = await page(b, url, { viewport: vp, touch: true, mobile: true });
      await world(q, 'rw.village', 20, 18, { sp, comp: COMPS[sp] });
      await q.evaluate((k) => { RB.game.settings.textScale = k; RB.game.applySettings(); RB.ui.menu.open('pet'); }, scale === 2 ? 1.5 : 1);
      await q.evaluate((k) => { if (k === 2) document.documentElement.style.setProperty('--text-scale', '2'); }, scale);
      await wait(q, 400);
      assert(await q.evaluate(() => !!document.querySelector('[data-pet-sel]') && !document.querySelector('.pet-detail')), vp.width + ': the list first');
      await q.click('[data-pet-sel]');
      await wait(q, 300);
      assert(await q.evaluate(() => !!document.querySelector('.pet-detail [data-pet-back]')), vp.width + ': a detail page with Back');
      const ov = await q.evaluate(() => { const l = document.querySelector('#folio-page .leaf'); return { sw: l.scrollWidth, cw: l.clientWidth, doc: document.documentElement.scrollWidth, vw: innerWidth }; });
      assert(ov.sw <= ov.cw + 2 && ov.doc <= ov.vw + 2, vp.width + ': no sideways scrolling ' + JSON.stringify(ov));
      await shot(q, sp + '_company_' + vp.width + (scale === 2 ? '_200' : ''));
      await q.keyboard.press('Escape');
      await wait(q, 250);
      assert(await q.evaluate(() => RB.ui.menu.isOpen() && !document.querySelector('.pet-detail')), vp.width + ': Back leaves the detail first');
      await c2.close();
    }
  });
}

// ---- the vignettes: the ordinary route with keys and the mouse, naming, memory once, selection separate, reload ----
const VIG = {
  cat: { map: 'rw.village', flags: { rw_echo_done: true }, comp: 'mio', start: [17, 24], steps: [{ at: [17, 23], dir: 'left', say: /creeping/ }, { at: [14, 24], dir: 'up', pick: /Tie the cord/ }, { at: [15, 24], dir: 'up', pick: /Offer a hand/ }], invite: /Invite/ },
  bird: { map: 'sg.harbor', chapter: 2, quests: { sg_main: 1 }, comp: 'ren', start: [45, 28], steps: [{ at: [44, 27], dir: 'up', say: /flees to the sand/ }, { at: [43, 27], dir: 'up', pick: /Wind the ribbon/ }, { at: [44, 27], dir: 'up', pick: /open palm/ }], invite: /Invite/ },
  dog: { map: 'co.village', chapter: 3, flags: { co_arrived: true, co_met_sayo: true }, comp: 'nao', start: [30, 25], steps: [{ at: [33, 25], dir: 'down', say: /fawn dog/ }, { at: [31, 25], dir: 'down', pick: /latch loop/ }, { at: [33, 25], dir: 'down', pick: /Crouch/ }], invite: /Invite/, permission: /take him/ },
  tanuki: { map: 'co.road', chapter: 3, flags: { co_arrived: true }, comp: 'suzu', start: [10, 5], steps: [{ at: [7, 3], dir: 'left', say: /hollow at the foot/ }, { at: [6, 4], dir: 'left', pick: /flat stone/ }, { at: [7, 3], dir: 'left', pick: /Sit at the edge/ }], invite: /Invite/ },
};
for (const sp of SPECIES) {
  const V = VIG[sp];
  if (!V) continue;
  await test(sp + ': vignette — cause, one interaction, meeting, invitation, naming, memory once, selection, save and reload', async () => {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await p.evaluate(async (V) => {
      const st = RB.state.newCampaign({ profile: 'E' });
      Object.assign(st, { chapter: V.chapter || 2, comp: V.comp, map: V.map, x: V.start[0], y: V.start[1], dir: 'left' });
      for (const q in V.quests || {}) st.quests[q] = { stage: V.quests[q] };
      Object.assign(st.flags, { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true }, V.flags);
      for (const id in RB.content.maps) for (const ev of RB.content.maps[id].onEnter || []) if (!/^pets\./.test(ev.scene)) st.flags['enter:' + id + ':' + ev.scene] = true;
      await RB.save.writeSlot(1, st, { force: true });
      RB.ui.title.hide();
      await RB.game.loadCampaign(1);
      RB.game.settings.textSpeed = 'instant';
    }, V);
    await wait(p, 800);
    // lines are advanced with the mouse on Next (a choice, when it comes, is chosen with the mouse too)
    const seen = [];
    let nearShot = false;
    const drain = async () => {
      for (let i = 0; i < 80; i++) {
        const o = await p.evaluate(() => { const nb = document.querySelector('.dlg:not(.hidden) .b-next'); if (!RB.ui.dialogue.isOpen() || document.querySelector('.choices:not(.hidden) button.choice') || !nb) return null; const r = nb.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: document.querySelector('.dlg').textContent }; });
        if (!o) break;
        if (seen[seen.length - 1] !== o.text) seen.push(o.text);
        if (!nearShot) {
          const el = await p.evaluate(() => (RB.pets.staged && RB.pets.staged.name === 'near' ? performance.now() - RB.pets.staged.t : -1));
          if (el >= 0) { await wait(p, Math.max(0, 1300 - el)); await shot(p, sp + '_vignette_near'); nearShot = true; }
        }
        await wait(p, 120);
        if (await p.evaluate(() => !!document.querySelector('.choices:not(.hidden) button.choice'))) break;
        await p.mouse.click(o.x, o.y);
        await wait(p, 120);
      }
    };
    const idleWorld = () => p.waitForFunction(() => RB.game.mode() === 'world' && !RB.script.isRunning(), null, { timeout: 10000 });
    await drain(); // the companion's one-time notice on arrival
    await shot(p, sp + '_vignette_cause');
    for (const st of V.steps) {
      await p.evaluate(([x, y, dir]) => { const W = RB.world.W; Object.assign(W.player, { x, y, fx: x, fy: y, dir, mv: null }); RB.game.s.x = x; RB.game.s.y = y; RB.petWorld.place(); }, [st.at[0], st.at[1], st.dir]);
      await idleWorld();
      await wait(p, 200);
      await p.keyboard.press('z');
      await wait(p, 300);
      if (st.say) assert(st.say.test(await p.evaluate(() => document.querySelector('.dlg').textContent)), 'the cause is described: ' + st.say);
      await drain();
      if (st.pick) {
        await p.waitForSelector('.choices:not(.hidden) button.choice');
        const pt = await p.evaluate((re) => { const b = [...document.querySelectorAll('.choices:not(.hidden) button.choice')].find((x) => new RegExp(re).test(x.textContent)); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, st.pick.source);
        await p.mouse.click(pt.x, pt.y);
        await wait(p, 300);
        await drain();
      }
      if (st !== V.steps[V.steps.length - 1]) { await drain(); await idleWorld(); }
    }
    await shot(p, sp + '_vignette_meet');
    await p.waitForSelector('.choices:not(.hidden) button.choice');
    const nn = await p.evaluate(() => [...document.querySelectorAll('.choices:not(.hidden) button.choice')].map((b) => b.textContent));
    assert(nn.some((t) => /Not now/.test(t)), 'the invitation offers Not now: ' + nn.join(' | '));
    if (V.permission) assert(seen.some((t) => V.permission.test(t)), 'the caretaker gives permission before the invitation: ' + seen.slice(-4).join(' | '));
    const inv = await p.evaluate((re) => { const b = [...document.querySelectorAll('.choices:not(.hidden) button.choice')].find((x) => new RegExp(re).test(x.textContent)); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, V.invite.source);
    await p.mouse.click(inv.x, inv.y);
    await p.waitForSelector('#pn-name');
    await shot(p, sp + '_vignette_name');
    await p.fill('#pn-name', '  ちゃちゃ\n丸 ');
    await p.keyboard.press('Enter');
    await p.waitForSelector('.csheet button');
    const q = await p.evaluate(() => document.querySelector('.csheet .q').textContent);
    assert(/Travel with ちゃちゃ 丸 now/.test(q), 'selection is asked separately, with the new name (trimmed, line break collapsed): ' + q);
    await p.evaluate(() => [...document.querySelectorAll('.csheet button')].find((x) => /Travel together/.test(x.textContent)).click());
    await wait(p, 900);
    await drain();
    const rec = await p.evaluate((sp) => ({ r: RB.pets.record(RB.game.s, sp), act: RB.pets.active(RB.game.s), mem: RB.game.s.company.memories.filter((m) => m.id === 'pet:met:' + sp), once: RB.game.s.awarded['pet:met:' + sp] }), sp);
    assert(rec.r && rec.r.name === 'ちゃちゃ 丸' && rec.r.nameAtMeet === 'ちゃちゃ 丸' && rec.act === sp && rec.mem.length === 1 && rec.mem[0].pet.name === 'ちゃちゃ 丸' && rec.mem[0].reply && rec.once, 'met, named, the memory (with the name then and the companion\'s reply), selected: ' + JSON.stringify(rec).slice(0, 400));
    // it cannot happen twice (the hook again, as a replay would)
    await p.evaluate(async (sp) => { await RB.hooks.pet_meet([sp]); }, sp);
    assert(await p.evaluate((sp) => RB.game.s.company.memories.filter((m) => m.id === 'pet:met:' + sp).length === 1 && !document.querySelector('#pn-name'), sp), 'no second acquisition, memory or naming');
    await wait(p, 600);
    await shot(p, sp + '_vignette_after');
    // save, reload, load: the record, the name, the look, and it follows
    await p.evaluate(async () => { await RB.save.writeSlot(1, RB.game.s, { force: true }); });
    await p.reload();
    await p.waitForFunction(() => window.__RB_READY__ === true);
    await p.evaluate(async () => { RB.ui.title.hide(); await RB.game.loadCampaign(1); });
    await wait(p, 900);
    const back = await p.evaluate((sp) => ({ r: RB.pets.record(RB.game.s, sp), act: RB.pets.active(RB.game.s), pw: RB.petWorld.state() }), sp);
    assert(back.r.name === 'ちゃちゃ 丸' && back.act === sp && back.pw.shown && back.pw.sp === sp, 'after reloading: still there, still named, following: ' + JSON.stringify(back).slice(0, 300));
    assert(!errors.length, 'no page errors: ' + errors.join(' | '));
    await ctx.close();
  });
}

console.log('\n' + results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
