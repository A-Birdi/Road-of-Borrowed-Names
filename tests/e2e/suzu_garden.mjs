// RBN-QA-125 (Agnes 6351678399; Local CL-222, CL-226; Cloud CC-128 §7): Suzu's night apart, in the Upper House's back
// garden, illustrated (yn.suzu_garden). In Chromium on the built game, with throwaway journeys, from the lobby with
// Suzu away (out for air after the show) and the room scene run as the stairs run it:
//  1. each reply, at a desktop and a phone size: the garden is up for the first line and stays through her coming back
//     (the line that finds her on her stone); the two of you on her stone for the choice and after it; the world never
//     shows under the pictures until the end; then, in the lobby, Suzu is beside you, once (one figure of hers on the
//     map, following you), the night's flags set, her away cleared;
//  2. Skip seen: the same pictures in passing and the same end, one Suzu;
//  3. reduced motion: the same;
//  4. a journey loaded during the garden: nothing of it left (no picture, no dialogue), the loaded journey as saved
//     (Suzu still away, no figure of hers), and the night then plays to its end with one Suzu;
//  5. no page errors.
// RB_CAPS=<dir> also saves stills of both pictures at each size (for the owner; never committed).
// Usage: node tools/build.mjs && node tests/e2e/suzu_garden.mjs
import path from 'node:path';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const CAPS = process.env.RB_CAPS || null;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const errorsAll = [];
const on = (...ks) => Object.fromEntries(ks.map((k) => [k, true]));
const FLAGS = Object.assign(on('departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_done', 'cr_called', 'cr_done', 'cr_delivered'),
  on('yn_called', 'yn_descent_seen', 'yn_arrived', 'yn_rokubei_met', 'yn_kami_seen', 'yn_oritsu_met', 'yn_rooms_done', 'yn_shimo_seen', 'yn_quarrel', 'yn_guild_told', 'yn_vents_open',
    'yn_kettle_settled', 'yn_kettle_seen_after', 'yn_evening', 'yn_eve_started', 'yn_playhouse_seen', 'yn_suzu_crossroads', 'yn_suzu_night', 'yn_apart'));

// every line: the picture up (its shot and state), whether the world shows, Suzu's figures on the map, the line
const hook = () => {
  window.__L = []; window.__cap = null;
  if (window.__sgWrap) return;
  window.__sgWrap = true;
  const say = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) {
    const q = RB.sequence.state(), W = RB.world.W;
    const suzus = W.npcs.concat(W.extras || [], W.leavers || []).filter((n) => n.id === 'suzu' || (n.def && (n.def.char || n.def.id) === 'suzu')).length + (W.comp && W.comp.id === 'suzu' ? 1 : 0);
    window.__L.push({ en: String((l && l.en) || '').slice(0, 40), who: l && l.who, seq: q ? q.id : null, shot: q ? q.shot : null, hides: RB.sequence.hidesWorld(), map: W.map.id, suzus });
    const prev = window.__L[window.__L.length - 2];
    if (q && (!prev || prev.shot !== q.shot)) window.__cap = q.shot;
    return say.apply(this, arguments);
  };
};
async function drive(p, tag, pick) {
  const shots = [];
  for (let i = 0; i < 900; i++) {
    const st = await p.evaluate(() => ({ d: RB.ui.dialogue.isOpen(), run: RB.script.isRunning(), ch: [...document.querySelectorAll('.choices:not(.hidden) .choice')].map((e) => e.textContent), cap: window.__cap, q: RB.sequence.state() }));
    if (st.cap) { await p.evaluate(() => { window.__cap = null; }); await p.waitForTimeout(1600); if (CAPS && tag) await p.screenshot({ path: path.join(CAPS, tag + '_' + st.cap + '.png') }); continue; }
    if (st.ch.length) {
      shots.push(st.q ? st.q.shot : null);
      const k = Math.max(0, st.ch.findIndex((t) => (pick || /./).test(t)));
      await p.locator('.choices:not(.hidden) .choice').nth(k).click(); await p.waitForTimeout(150); continue;
    }
    if (st.d) { await p.waitForTimeout(60); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(60); continue; }
    if (!st.run && i > 30) break;
    await p.waitForTimeout(100);
  }
  return { choiceShots: shots };
}
async function begin(p, o) {
  await p.evaluate(async (o) => {
    const s = RB.game.debugStart('yn.kami', 5, 3, { comp: 'suzu', dir: 'up', edition: RB.edition.forNew(), flags: o.flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    // Suzu out for air since the show (yn.suzu_evening's comp_away night): who she is kept, nobody following
    s.vars._away = 'suzu'; s.vars._away_why = 'night'; s.comp = null;
    RB.world.placeCompanion(); RB.world.refreshActors();
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.skipSeen = !!o.skip;
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    RB.save.autosave = async () => {};
    await new Promise((r) => setTimeout(r, 900));
  }, o);
  await p.evaluate(hook);
}
const after = (p) => p.evaluate(async () => {
  await new Promise((r) => setTimeout(r, 1500));
  const W = RB.world.W, s = RB.game.s;
  const figs = W.npcs.concat(W.extras || [], W.leavers || []).filter((n) => n.id === 'suzu' || (n.def && (n.def.char || n.def.id) === 'suzu')).length;
  return { map: W.map.id, comp: W.comp ? W.comp.id : null, figs, sComp: s.comp, away: s.vars._away || null, apart: !!s.flags.yn_apart, back: !!s.flags.yn_suzu_back, eve: !!s.flags.yn_eve_done,
    seq: RB.sequence.state(), hides: RB.sequence.hidesWorld(), run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen() };
});
const G = (L) => L.filter((l) => l.seq === 'yn.suzu_garden');
const fmt = (L) => JSON.stringify(L.map((l) => [l.shot || '-', l.hides ? 'pic' : 'WORLD', l.en.slice(0, 18)]));
// the picture checks: the garden from the first line through the line that finds her on her stone; the stone from the choice
function pictures(L, r, label) {
  const i0 = L.findIndex((l) => /Unable to sleep/.test(l.en)), i1 = L.findIndex((l) => /sitting on a garden stone/.test(l.en)), iEnd = L.findIndex((l) => /In the morning/.test(l.en));
  ok(i0 >= 0 && i1 > i0 && L.slice(i0, i1 + 1).every((l) => l.shot === 'garden' && l.hides), label + ': the garden is up for the first line and stays through her coming back (' + fmt(L.slice(i0, i1 + 1)) + ')');
  ok(r.choiceShots.length === 1 && r.choiceShots[0] === 'stone' && iEnd > i1 && L.slice(L.findIndex((l, i) => i > i1 && l.shot === 'stone'), iEnd + 1).every((l) => l.shot === 'stone' && l.hides), label + ': the two of you on her stone for the choice and after it (' + JSON.stringify(r.choiceShots) + ' ' + fmt(L.slice(i1 + 1, iEnd + 1)) + ')');
  ok(L.every((l) => l.map === 'yn.kami'), label + ': nobody went anywhere: the lobby under the pictures throughout');
}
function end(a, label) {
  ok(a.map === 'yn.kami' && a.comp === 'suzu' && a.sComp === 'suzu' && a.figs === 0 && !a.away && !a.apart && a.back && a.eve && !a.seq && !a.hides && !a.run && !a.dlg,
    label + ': afterwards, in the lobby, Suzu beside you once (following you, no other figure of hers), the night\'s flags set, nothing left of the pictures (' + JSON.stringify(a) + ')');
}

// ---- 1. each reply, at a desktop and a phone size ---------------------------------------------------------------------------
for (const [w, h] of [[1180, 756], [390, 844]]) {
  for (const [pick, name] of [[/saying no/, 'no'], [/go back/, 'free']]) {
    const { p, ctx, errors } = await page(b, url, { viewport: { width: w, height: h } });
    await begin(p, { flags: FLAGS });
    await p.evaluate(() => { RB.script.run('yn.kami_room'); });
    const r = await drive(p, name === 'no' ? w + 'x' + h : null, pick);
    const L = await p.evaluate(() => window.__L.slice());
    pictures(L, r, `${w}x${h} ${name}`);
    end(await after(p), `${w}x${h} ${name}`);
    errorsAll.push(...errors);
    await ctx.close();
  }
}

// ---- 2. Skip seen; 3. reduced motion ------------------------------------------------------------------------------------------
for (const [o, label] of [[{ skip: true }, 'Skip seen'], [{ reduce: true }, 'reduced motion']]) {
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 756 } });
  await begin(p, Object.assign({ flags: FLAGS }, o));
  await p.evaluate((skip) => { if (skip) { RB.game.s.seen['yn.suzu_garden'] = true; RB.game.s.seen['yn.kami_room'] = true; RB.game.setFastForward(true); } RB.script.run('yn.kami_room'); }, !!o.skip);
  const r = await drive(p, null, /saying no/);
  await p.evaluate(() => RB.game.setFastForward(false));
  const L = await p.evaluate(() => window.__L.slice());
  ok(G(L).length >= 8 && G(L).every((l) => l.hides) && r.choiceShots[0] === 'stone', label + ': the pictures over every line of the night (' + G(L).length + ' lines), the stone for the choice');
  end(await after(p), label);
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 4. a journey loaded during the garden --------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 756 } });
  await begin(p, { flags: FLAGS });
  await p.evaluate(async () => { await RB.save.manualSave(3); });
  await p.evaluate(() => { RB.game.settings.textSpeed = 'normal'; RB.script.run('yn.kami_room'); });
  await p.waitForFunction(() => { const q = RB.sequence.state(); return !!(q && q.shot === 'garden' && RB.ui.dialogue.isOpen()); }, null, { timeout: 8000 }).catch(() => {});
  const mid = await p.evaluate(() => { const q = RB.sequence.state(); return q ? q.shot : null; });
  const ld = await p.evaluate(async () => { try { await RB.game.loadCampaign(3, 'manual'); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
  await p.waitForTimeout(1500);
  const g = await p.evaluate(() => { const W = RB.world.W, s = RB.game.s; return { map: W.map.id, seq: RB.sequence.state(), hides: RB.sequence.hidesWorld(), run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen(), comp: W.comp ? W.comp.id : null, sComp: s.comp, away: s.vars._away || null, apart: !!s.flags.yn_apart, back: !!s.flags.yn_suzu_back,
    figs: W.npcs.concat(W.extras || [], W.leavers || []).filter((n) => n.id === 'suzu' || (n.def && (n.def.char || n.def.id) === 'suzu')).length }; });
  ok(ld === 'loaded' && mid === 'garden' && g.map === 'yn.kami' && !g.seq && !g.hides && !g.run && !g.dlg && !g.comp && !g.sComp && g.away === 'suzu' && g.apart && !g.back && !g.figs,
    'a journey loaded during the garden: nothing of it left, the loaded journey as saved (Suzu still away, no figure of hers) (' + JSON.stringify({ ld, mid, g }) + ')');
  await p.evaluate(() => { window.__L = []; RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {}; RB.script.run('yn.kami_room'); });
  const r = await drive(p, null, /go back/);
  pictures(await p.evaluate(() => window.__L.slice()), r, 'then the night again');
  end(await after(p), 'then the night again');
  errorsAll.push(...errors);
  await ctx.close();
}

ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
