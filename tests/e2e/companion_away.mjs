// RBN-QA-103 (Agnes 6338841549, 6338848728; Local CL-186; Cloud CC-114 §3): a companion who stays behind
// (`!hook comp_away`) was taken out of the party but the figure following you was left alive, so at the Mist Barrier
// two Suzus stood in the office: the one waiting on the bench and the one still following you. Coming back
// (`!hook comp_back`) put nobody beside you until the next map. Now the figure following you is the one who stays
// (walking to the bench where there is one, or leaving when the scene ends), and the figure of theirs here is the one
// who follows you again, from where it stands. In Chromium on the built game, sampling every 50 ms how many figures of
// the companion are on the map (following, placed, walked in to speak, or walking off):
//  1. the Barrier surety, with Suzu and with Nao: never two; after it nobody follows you, one figure on the bench, and
//     still nobody follows when you walk; their talk on the bench is their waiting scene; a save and load keeps that;
//  2. the guarantee brought back: never two; the figure on the bench is the one who follows you again; in Nao's
//     journey, Nao then goes down to Kirishita alone (gone, nobody following), and on the porch at night the figure
//     there is the one who follows you after;
//  3. Steamhollow, Nao's quarrel and making up: never two; Nao leaves after the quarrel; at the footbath the Nao who
//     walked in to speak is the one who follows you after;
//  4. Steamhollow, Suzu's night apart and the garden: never two; she leaves after the playhouse; in the garden the
//     Suzu who walked in to speak is the one who follows you after;
//  5. Steamhollow, Mio's night (Agnes 6340911110), both choices and passed over with "Skip seen": you leave by the
//     dispensary's own door to where it opens (yn.lower 8,25, facing down), on nobody's tile; Mio away and unseen; the
//     night's flags set; you walk and nobody follows; a save and load keeps it;
//  6. no page errors.
// The Barrier interview's own challenge is answered by a stub (it is not what this tests).
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const allErrors = [];
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true };
for (let n = 1; n <= 6; n++) Object.assign(DONE, { ['cr_st' + n]: true, ['cr_lamp' + n]: true, ['cr_given' + n]: true, ['cr_plan' + n]: true });

async function start(p, map, x, y, comp, flags) {
  await p.evaluate(([map, x, y, comp, flags]) => {
    const s = RB.game.debugStart(map, x, y, { dir: 'up', edition: RB.edition.forNew(), comp, flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    if (RB.challenge) RB.challenge.run = async () => ({ ok: true });
    // how many figures of the companion are on the map, every 50 ms
    window.__cid = comp;
    window.__figs = { max: 0, n: 0, at: [] };
    clearInterval(window.__figT);
    window.__figT = setInterval(() => {
      const W = RB.world.W, cid = window.__cid;
      if (!W || !W.map) return;
      const who = (n) => (n === W.comp ? cid : (n.def && (n.def.char || n.def.id)) || n.id);
      const figs = [W.comp].concat(W.npcs, W.extras, W.leavers).filter((n) => n && who(n) === cid && !(n.alpha != null && n.alpha <= 0.05));
      window.__figs.n++;
      if (figs.length > window.__figs.max) { window.__figs.max = figs.length; window.__figs.at.push({ map: W.map.id, figs: figs.map((n) => [n === W.comp ? 'comp' : W.npcs.includes(n) ? 'npc' : W.extras.includes(n) ? 'extra' : 'leaver', n.x, n.y]) }); }
    }, 50);
  }, [map, x, y, comp, Object.assign({}, DONE, flags || {})]);
  await p.waitForTimeout(900);
}
// a scene played through: lines advanced, choices picked by their words (null: the first)
async function play(p, scene, picks) {
  await p.evaluate((sc) => { RB.script.run(sc); }, scene);
  let k = 0, last = null;
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return { d: !!d, en: d ? String(d.en || '') : null, run: RB.script.isRunning(), ch: [...document.querySelectorAll('.choices:not(.hidden) .choice')].map((x) => x.textContent) }; });
    if (st.ch.length) {
      const re = picks && picks[k++];
      const loc = p.locator('.choices:not(.hidden) .choice');
      await (re ? loc.filter({ hasText: re }).first() : loc.first()).click();
      await p.waitForTimeout(250);
      continue;
    }
    if (st.d) {
      if (st.en === last) { await p.waitForTimeout(80); continue; }
      last = st.en;
      await p.waitForTimeout(100); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(80); continue;
    }
    if (!st.run && i > 3) break;
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(2500);
}
const state = (p) => p.evaluate(() => {
  const W = RB.world.W, s = RB.game.s, cid = window.__cid;
  const who = (n) => (n.def && (n.def.char || n.def.id)) || n.id;
  return {
    map: W.map.id, comp: s.comp, away: (s.vars && s.vars._away) || null, follower: W.comp ? [W.comp.x, W.comp.y] : null,
    placed: W.npcs.filter((n) => who(n) === cid).map((n) => [n.x, n.y]), extras: W.extras.filter((n) => who(n) === cid).map((n) => [n.x, n.y]),
    leaving: W.leavers.filter((n) => who(n) === cid && !(n.alpha != null && n.alpha <= 0.05)).length, figs: window.__figs.max, at: window.__figs.at.slice(-2),
    run: RB.script.isRunning(),
  };
});
async function step(p, dir, n) {
  for (let i = 0; i < n; i++) {
    const a = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
    await p.evaluate((d) => { RB.world.W.player.dir = d; }, dir);
    for (let t = 0; t < 4; t++) {
      await p.keyboard.down(dir === 'down' ? 'ArrowDown' : dir === 'up' ? 'ArrowUp' : dir === 'left' ? 'ArrowLeft' : 'ArrowRight');
      await p.waitForTimeout(260);
      await p.keyboard.up(dir === 'down' ? 'ArrowDown' : dir === 'up' ? 'ArrowUp' : dir === 'left' ? 'ArrowLeft' : 'ArrowRight');
      await p.waitForTimeout(250);
      const b2 = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
      if (b2.join() !== a.join()) break;
    }
  }
  await p.waitForTimeout(400);
}
const resetMax = (p) => p.evaluate(() => { window.__figs.max = 0; window.__figs.at = []; });

// ---- 1 and 2. the Barrier surety and the guarantee brought back --------------------------------------------------------
for (const comp of ['suzu', 'nao']) {
  const { p, errors } = await page(b, url);
  await start(p, 'cr.barrier_office', 6, 4, comp, { cr_seals_checked: true });
  await play(p, 'cr.ujie', [/back soon/]);
  const away = await state(p);
  ok(away.figs === 1 && away.comp === null && away.away === comp && !away.follower && away.placed.length === 1 && away.placed[0].join() === '2,4' && !away.extras.length,
    comp + ': the surety: never two of them; nobody follows you; one figure, on the bench (' + JSON.stringify(away) + ')');
  await resetMax(p);
  // (sideways, along the office: its door is in the bottom wall, at 6,8)
  const from = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
  await step(p, 'right', 2);
  const walked = await state(p), to = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
  ok(walked.map === 'cr.barrier_office' && to.join() !== from.join() && walked.figs === 1 && !walked.follower && walked.placed.length === 1, comp + ': you walk away inside the office: still nobody following, one figure on the bench (' + JSON.stringify({ from, to, walked }) + ')');
  // their talk on the bench is their waiting scene
  const talk = await p.evaluate(async (comp) => { const n = RB.world.W.npcs.find((q) => q.id === comp); return n && n.def && n.def.talk; }, comp);
  ok(talk === 'cr.wait_' + comp, comp + ': on the bench, their talk is their waiting scene (' + talk + ')');
  // a save and load in the middle of it
  await p.evaluate(async () => { await RB.save.writeSlot(4, RB.game.s, { force: true }); await RB.game.loadCampaign(4); });
  await p.waitForTimeout(1500);
  await resetMax(p);
  await p.waitForTimeout(600);
  const loaded = await state(p);
  ok(loaded.figs === 1 && !loaded.follower && loaded.placed.length === 1 && loaded.placed[0].join() === '2,4', comp + ': a save and load while away: one figure, on the bench, nobody following (' + JSON.stringify(loaded) + ')');
  // the guarantee brought back
  await resetMax(p);
  const bench = loaded.placed[0];
  await p.evaluate(() => {
    RB.state.give(RB.game.s, 'cr_proof');
    // where the follower first stands once they are back
    window.__firstAt = null;
    const iv = setInterval(() => { const W = RB.world.W; if (W.comp) { window.__firstAt = [W.comp.x, W.comp.y]; clearInterval(iv); } }, 20);
    setTimeout(() => clearInterval(iv), 30000);
  });
  await play(p, 'cr.barrier_back', null);
  const firstAt = await p.evaluate(() => window.__firstAt);
  const back = await state(p);
  const near = firstAt && Math.abs(firstAt[0] - bench[0]) + Math.abs(firstAt[1] - bench[1]) <= 1;
  if (comp === 'suzu') {
    ok(back.figs === 1 && back.comp === comp && !!back.follower && !back.placed.length && !back.extras.length && near,
      comp + ': the guarantee brought back: never two; the figure from the bench follows you again, from where it sat (' + JSON.stringify({ back, firstAt, bench }) + ')');
    await step(p, 'down', 2);
    const after = await state(p);
    ok(after.figs === 1 && !!after.follower, comp + ': and follows you when you walk (' + JSON.stringify(after) + ')');
  } else {
    // Nao: back from the bench, then goes down to Kirishita alone (cr.nao_decides)
    ok(back.figs === 1 && back.comp === null && back.away === 'nao' && !back.follower && near,
      'nao: the guarantee brought back: never two; Nao from the bench, then off down the mountain alone, nobody following (' + JSON.stringify({ back, firstAt, bench }) + ')');
    // the porch at Kirishita that night
    await p.evaluate(() => { RB.world.enter('cr.kirishita', 9, 14, 'up', {}); });
    await p.waitForTimeout(1200);
    await resetMax(p);
    const porch = await state(p);
    await play(p, 'cr.porch_nao', null);
    const night = await state(p);
    ok(porch.placed.length === 1 && porch.placed[0].join() === '9,12' && night.figs === 1 && night.comp === 'nao' && !!night.follower && !night.placed.length && !night.extras.length,
      'nao: on the porch at night, the Nao sitting there is the one who follows you after; never two (' + JSON.stringify({ porch, night }) + ')');
  }
  allErrors.push(...errors); await p.close();
}

// ---- 1b. the surety told while the office is still appearing (Agnes 6344263706) -----------------------------------------------
// The office entered afresh and the surety played at once: its lines advanced as fast as they show, the questions answered
// by the stub, "Thank you. I'll be back soon." chosen as soon as it shows. Suzu stays behind inside the office's first
// 900 ms, when people with a new place are "simply already there": still one Suzu, the one who was following you,
// walking to the bench.
{
  const { p, errors } = await page(b, url);
  await start(p, 'cr.barrier_office', 6, 4, 'suzu', { cr_seals_checked: true });
  await p.evaluate(() => {
    const stays = RB.world.companionStays;
    window.__ageAtAway = null;
    RB.world.companionStays = function () { window.__ageAtAway = RB.world.W.time - RB.world.W.enteredAt; return stays.apply(this, arguments); };
    RB.world.enter('cr.barrier_office', 6, 4, 'up', {});
    window.__figs.max = 0; window.__figs.at = [];
    RB.script.run('cr.ujie');
    window.__fast = setInterval(() => {
      const rows = [...document.querySelectorAll('.choices:not(.hidden) .choice')];
      const go = rows.find((r) => /back soon/.test(r.textContent));
      if (go) go.click();
      else if (!rows.length && RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance();
      if (!RB.script.isRunning()) clearInterval(window.__fast);
    }, 16);
  });
  await p.waitForFunction(() => !RB.script.isRunning(), null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(2500);
  const age = await p.evaluate(() => window.__ageAtAway);
  const quick = await state(p);
  ok(age != null && age <= 900, 'suzu, the surety told at once: she stays behind inside the office\'s first 900 ms (' + Math.round(age) + ' ms after it appeared)');
  ok(quick.figs === 1 && quick.comp === null && quick.away === 'suzu' && !quick.follower && quick.placed.length === 1 && quick.placed[0].join() === '2,4' && !quick.extras.length && !quick.leaving,
    'suzu, the surety told at once: never two of her; the one who was following you is the one on the bench (' + JSON.stringify(quick) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 3. Steamhollow: Nao's quarrel and making up at the footbath -----------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, 'yn.lower', 20, 16, 'nao', { cr_done: true, ch10_done: true, yn_evening: true, yn_eve_started: true });
  await play(p, 'yn.nao_evening', null);
  const q = await state(p);
  ok(q.figs === 1 && q.comp === null && !q.follower && !q.placed.length && !q.extras.length,
    'nao, the quarrel: never two; Nao goes out, nobody following (' + JSON.stringify(q) + ')');
  await resetMax(p);
  await play(p, 'yn.nao_footbath', null);
  const m = await state(p);
  ok(m.figs === 1 && m.comp === 'nao' && !!m.follower && !m.extras.length && !m.leaving,
    'nao, making up at the footbath: never two; the Nao who walked in to speak is the one who follows you after (' + JSON.stringify(m) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 4. Steamhollow: Suzu's night apart and the garden ---------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, 'yn.lower', 20, 16, 'suzu', { cr_done: true, ch10_done: true, yn_evening: true, yn_eve_started: true });
  await play(p, 'yn.suzu_evening', null);
  const q = await state(p);
  ok(q.figs === 1 && q.comp === null && !q.follower && !q.placed.length && !q.extras.length,
    'suzu, the night apart: never two; she goes out after the playhouse, nobody following (' + JSON.stringify(q) + ')');
  await p.evaluate(() => { RB.world.enter('yn.lower', 20, 16, 'up', {}); });
  await p.waitForTimeout(1200);
  await resetMax(p);
  await play(p, 'yn.suzu_garden', null);
  const g = await state(p);
  ok(g.figs === 1 && g.comp === 'suzu' && !!g.follower && !g.extras.length && !g.leaving,
    'suzu, the garden: never two; the Suzu who walked in to speak is the one who follows you after (' + JSON.stringify(g) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 5. Steamhollow: Mio's night (Agnes 6340911110): you leave by the dispensary's own door ------------------------------
// both choices, and passed over with "Skip seen": after the scene you stand outside the dispensary, where its door opens
// (yn.lower 8,25, facing down), on nobody's tile; Mio is away, unseen (no figure of hers outside), the night's flags set;
// you walk; a save and load keeps all of it
const mioAfter = (p) => p.evaluate(() => {
  const W = RB.world.W, s = RB.game.s, P = W.player;
  const who = (n) => (n.def && (n.def.char || n.def.id)) || n.id;
  const others = [W.comp].concat(W.npcs, W.extras, W.leavers).filter((n) => n && n !== P && n.x === P.x && n.y === P.y && !(n.alpha != null && n.alpha <= 0.05)).map(who);
  const mio = [W.comp].concat(W.npcs, W.extras, W.leavers).filter((n) => n && (n === W.comp || who(n) === 'mio') && !(n.alpha != null && n.alpha <= 0.05)).length;
  return { map: W.map.id, at: [P.x, P.y], dir: P.dir, others, mio, comp: s.comp, away: (s.vars && s.vars._away) || null, night: !!s.flags.yn_mio_night, apart: !!s.flags.yn_apart, run: RB.script.isRunning(), mode: RB.game.mode() };
});
for (const pick of [/waiting/, /Call me/, 'skip']) {
  const { p, errors } = await page(b, url);
  await start(p, 'yn.lower', 20, 16, 'mio', { cr_done: true, ch10_done: true, yn_evening: true, yn_eve_started: true });
  // where you are when "The dispensary door closes quietly behind you" is shown: already outside it (Local CL-200)
  await p.evaluate(() => {
    const say = RB.ui.dialogue.say;
    window.__doorLine = null;
    RB.ui.dialogue.say = function (l) {
      if (!window.__doorLine && /dispensary door closes/.test((l && l.en) || '')) { const W = RB.world.W; window.__doorLine = { map: W.map.id, at: [W.player.x, W.player.y] }; }
      return say.apply(this, arguments);
    };
  });
  if (pick === 'skip') {
    await p.evaluate(() => { RB.game.s.seen['yn.mio_evening'] = true; RB.game.settings.skipSeen = true; RB.game.applySettings(); RB.script.run('yn.mio_evening'); });
    let skipped = false;
    for (let i = 0; i < 300; i++) {
      const st = await p.evaluate(() => { const k = document.querySelector('.dlg .b-skip'); return { k: !!(k && k.offsetParent && !k.classList.contains('hidden')), d: RB.ui.dialogue.isOpen(), run: RB.script.isRunning(), ch: [...document.querySelectorAll('.choices:not(.hidden) .choice')].length }; });
      if (st.k && !skipped) { skipped = true; await p.evaluate(() => document.querySelector('.dlg .b-skip').click()); await p.waitForTimeout(200); continue; }
      if (st.ch) { await p.locator('.choices:not(.hidden) .choice').first().click(); await p.waitForTimeout(200); continue; }
      if (st.d) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(80); continue; }
      if (!st.run && i > 3) break;
      await p.waitForTimeout(80);
    }
    await p.waitForTimeout(2500);
    ok(skipped, 'mio\'s night seen before: "Skip seen" offered and taken');
  } else await play(p, 'yn.mio_evening', [pick]);
  const a = await mioAfter(p);
  const door = await p.evaluate(() => window.__doorLine);
  if (pick !== 'skip' || door) ok(!!door && door.map === 'yn.lower' && door.at.join() === '8,25', 'mio\'s night, ' + (pick === 'skip' ? 'skipped' : String(pick)) + ': the door closing is told with you already outside it, at (8,25) (' + JSON.stringify(door) + ')');
  const label = pick === 'skip' ? 'passed over with Skip seen' : 'chose "' + pick.source + '"';
  ok(a.map === 'yn.lower' && a.at.join() === '8,25' && a.dir === 'down' && !a.others.length && a.mio === 0 && a.comp === null && a.away === 'mio' && a.night && a.apart && !a.run && a.mode === 'world',
    'mio\'s night, ' + label + ': you stand outside the dispensary\'s door (8,25, facing down) on nobody\'s tile; Mio away and unseen; the night\'s flags set (' + JSON.stringify(a) + ')');
  await step(p, 'down', 1);
  const w = await mioAfter(p);
  ok(w.at.join() !== '8,25' && w.mio === 0, 'mio\'s night, ' + label + ': you walk, and nobody follows (' + JSON.stringify(w) + ')');
  if (pick !== 'skip') {
    await p.evaluate(async () => { await RB.save.manualSave(1); });
    await p.reload();
    await p.waitForFunction(() => window.RB && RB.game && RB.save, null, { timeout: 30000 });
    await p.evaluate(async () => { await RB.game.loadCampaign(1, 'manual'); });
    await p.waitForTimeout(1500);
    const l = await mioAfter(p);
    ok(l.map === 'yn.lower' && l.mio === 0 && l.comp === null && l.away === 'mio' && l.night && l.apart, 'mio\'s night, ' + label + ': a save and load keeps it: Mio away and unseen (' + JSON.stringify(l) + ')');
  }
  allErrors.push(...errors); await p.close();
}

ok(allErrors.length === 0, 'no page errors' + (allErrors.length ? ' (' + allErrors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
