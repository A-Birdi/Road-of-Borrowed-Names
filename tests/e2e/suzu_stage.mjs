// RBN-QA-088 (Agnes 6333071717, 6333384120, 6333527722, 6333673954; Local CL-163, CL-165–CL-167, CL-171; Cloud CC-089,
// CC-090, CC-091): Suzu's telling on the sea cave's rock stage was played wherever you stood, with Nana (whose encore
// line closes it) walked in beside you only when she spoke. Now the scene brings her in itself (`!enter`): she walks
// in from the way out to the audience behind you before the opening narration, stays the one Nana through her encore
// and walks off when it ends; Suzu takes the rock, paces it while she tells it, and steps down beside you again. In
// Chromium on the built game, from the real trigger (you walk onto the strip in front of the stage):
//  1. before the trigger: no Nana in the cave, going in and out by the real way; she has no place there;
//  2. the trigger (x 13; x 10 and 19 too): Nana walks straight in to (13,10), facing up, before the first line; one
//     Nana, never jumping, from then through her encore; Suzu on the rock (14,6) for "Roll up", pacing 12,6 and 17,6
//     before the narration of it and back at 14,6 for it; the scene's own lines for the panels chosen (three sets);
//     no walk fallbacks, nobody on another's tile; after it Nana walks off and is gone, Suzu beside you follows you,
//     and the strip is spent; a refresh of the people here in mid-scene changes nothing;
//  3. skipping: with skip already on, Nana is placed at once (no walk-in) and all goes as above; the real Skip on the
//     first line: she has walked in, and the rest goes at once;
//  4. a reload mid-scene (a save made then): no Nana, the scene does not replay; an old save with the stage played:
//     no scene, no Nana; a campaign loaded while she is walking in: the old scene's entrance never moves the Nana of
//     the new campaign, and nothing of the old scene is said;
//  5. the safeguards: a walk-in held past its bound (the test-mode wait bypass off) is recorded as not arrived and is
//     not snapped to its place: she walks there on her own after; someone already placed is walked by staging and put
//     back after, never dismissed; the deliberate entrance is not logged as a missing speaker, while a genuinely
//     missing one (a later Nana line without !enter) still is; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/suzu_stage.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const KO = { ch2_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_ch9: true, ko_arrived: true, ko_otoha_met: true, 'tell_ko.t_hall_ok': true, ko_seacave_seen: true, ko_lowtide: true, 'foe:ko.seacave:s1': true, 'foe:ko.seacave:s2': true };
const allErrors = [];

// a journey in the cave at (x,y), facing up, Suzu behind you; the lines said and the people here sampled as it plays
async function setup(p, o = {}) {
  const { onBeat, ...oo } = o; // (only data goes into the page)
  await p.evaluate(([KO, o]) => {
    const s = RB.game.debugStart(o.map || 'ko.seacave', o.x, o.y, { dir: 'up', edition: RB.edition.forNew(), comp: 'suzu', flags: Object.assign({}, KO, o.flags || {}) });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    s.vars['tell_ko.t_hall_p1'] = o.p1 || 'otoha'; s.vars['tell_ko.t_hall_p3'] = o.p3 || 'nami';
    RB.game.settings.textSpeed = 'instant';
    RB.world.enter(o.map || 'ko.seacave', o.x, o.y, 'up', { fresh: true });
    if (!window.__wrapped) {
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { window.__said.push({ who: l.who, en: l.en, sceneId: l.sceneId }); return say.apply(this, arguments); };
      window.__wrapped = true;
      setInterval(() => {
        const W = RB.world.W;
        if (!W.map || !window.__samp) return;
        const isN = (a) => a.id === 'ko_nana' || (a.def && a.def.char === 'ko_nana');
        const here = W.npcs.concat(W.extras).filter(isN), going = W.leavers.filter(isN);
        const pc = [W.player.x, W.player.y], c = W.comp ? [W.comp.x, W.comp.y] : null;
        const tiles = [pc.join()].concat(c ? [c.join()] : [], here.map((a) => a.x + ',' + a.y));
        window.__samp.push({ t: performance.now() | 0, map: W.map.id, run: RB.script.isRunning(), n: here.length, g: going.length, gr: going.map((a) => (a.route || []).length),
          na: here.map((a) => [a.x, a.y, a.dir, !!(a.route || a.mv), a.alpha]), c, pc, clash: new Set(tiles).size !== tiles.length, pillar: !!c && (c[0] === 10 || c[0] === 19) && c[1] === 4 });
      }, 60);
    }
    window.__said = []; window.__samp = [];
  }, [KO, oo]);
  await p.waitForTimeout(700);
}
async function step(p, key, n = 1) { for (let i = 0; i < n; i++) { await p.keyboard.down(key); await p.waitForTimeout(130); await p.keyboard.up(key); await p.waitForTimeout(380); } }
const look = () => {
  const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(), W = RB.world.W;
  const isN = (a) => a.id === 'ko_nana' || (a.def && a.def.char === 'ko_nana');
  return { t: performance.now() | 0, d: d ? (d.who || '') + ': ' + String(d.en || '').slice(0, 60) : null, run: RB.script.isRunning(),
    n: W.npcs.concat(W.extras).filter(isN).length, na: W.npcs.concat(W.extras).filter(isN).map((a) => [a.x, a.y, a.dir, !!(a.route || a.mv)]),
    c: W.comp ? [W.comp.x, W.comp.y, W.comp.dir] : null };
};
// play the scene to its end, one press per line; onBeat(beat, i) before each press
async function play(p, onBeat) {
  const beats = [];
  for (let i = 0; i < 500; i++) {
    const st = await p.evaluate(look);
    if (st.d) {
      if (!beats.length || beats[beats.length - 1].d !== st.d) { beats.push(st); if (onBeat) await onBeat(st, beats.length - 1); await p.waitForTimeout(150); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); }
      await p.waitForTimeout(90);
      continue;
    }
    if (!st.run && beats.length) break;
    await p.waitForTimeout(90);
  }
  return beats;
}
const samples = (p) => p.evaluate(() => window.__samp.slice());
const fb = (p) => p.evaluate(() => RB.staging.stats().walkFallbacks);
const entrances = (p) => p.evaluate(() => (RB.test.entrances || []).slice());
// the scene's own lines for the panels chosen, in order
const expected = (p) => p.evaluate(() => { const s = RB.game.s; return RB.content.scenes['ko.suzu_stage'].cmds.filter((c) => c.op === 'say' && (!c.if || RB.state.test(s, c.if))).map((c) => c.en); });
const saidHere = (p) => p.evaluate(() => window.__said.filter((l) => l.sceneId === 'ko.suzu_stage').map((l) => l.en));
// Nana never jumps: from one sample to the next she moves at most a tile or two
const jumps = (S) => { const out = []; let prev = null; for (const x of S) { if (x.n !== 1) { prev = null; continue; } const a = x.na[0]; if (prev && Math.abs(a[0] - prev[0]) + Math.abs(a[1] - prev[1]) > 2) out.push([prev.slice(0, 2), a.slice(0, 2)]); prev = a; } return out; };
const beat = (B, re) => B.find((x) => re.test(x.d || ''));

// ---- 1. before the trigger: in and out of the cave by the real way, no Nana ---------------------------------------
{
  const { p, errors } = await page(b, url);
  await setup(p, { x: 3, y: 10 });
  await step(p, 'ArrowRight', 2);
  const a = await p.evaluate(() => ({ map: RB.world.W.map.id, where: RB.world.mapsWith('ko_nana') }));
  // (each way through waits for the change of map to be over, the screen faded back in and the walk yours again, before
  // the next step: a step pressed while it is still going on is not taken)
  const settled = (id) => p.waitForFunction((id) => RB.world.W.map.id === id && RB.game.mode() === 'world' && !RB.script.isRunning(), id, { timeout: 15000 }).then(() => true, () => false);
  await step(p, 'ArrowLeft', 5);
  await settled('ko.shore');
  await p.waitForTimeout(300);
  const shore = await p.evaluate(() => RB.world.W.map.id);
  // (you arrive on the shore facing away from the cave: a press in a new direction turns you first and steps only when
  // still held past the turn, src/engine/50_world.js turnHold, so a short press can be the turn alone; the step back
  // in is pressed until it is taken, at most four times)
  for (let i = 0; i < 4; i++) {
    await step(p, 'ArrowRight', 1);
    await p.waitForFunction(() => RB.game.mode() === 'world' && !RB.script.isRunning(), null, { timeout: 15000 }).catch(() => {});
    if ((await p.evaluate(() => RB.world.W.map.id)) === 'ko.seacave') break;
  }
  await settled('ko.seacave');
  await p.waitForTimeout(300);
  const back = await p.evaluate(() => RB.world.W.map.id);
  const S = await samples(p);
  const inCave = S.filter((x) => x.map === 'ko.seacave');
  ok(a.map === 'ko.seacave' && shore === 'ko.shore' && back === 'ko.seacave' && inCave.length > 10 && inCave.every((x) => x.n === 0 && x.g === 0 && !x.run) && !a.where.includes('ko.seacave'),
    'before the trigger: in the cave, out to the shore and back by the real way, no Nana there and no place of hers there (' + JSON.stringify({ maps: [a.map, shore, back], where: a.where, samples: inCave.length }) + ')');
  allErrors.push(...errors);
  await p.close();
}

// ---- 2. the trigger, and the scene as played ---------------------------------------------------------------------
async function trigger(o) {
  const { p, errors } = await page(b, url);
  await setup(p, o);
  const fb0 = await fb(p);
  await step(p, 'ArrowUp', 2);
  const B = await play(p, o.onBeat ? (st, i) => o.onBeat(p, st, i) : null);
  const end = await p.evaluate(() => performance.now() | 0);
  await p.waitForTimeout(6500);
  const S = await samples(p);
  const r = { p, errors, B, S, end, fb: (await fb(p)) - fb0, ent: await entrances(p), want: await expected(p), said: await saidHere(p) };
  return r;
}
function staged(tag, r, o = {}) {
  const { B, S } = r;
  const first = B[0], roll = beat(B, /Roll up/), pace = beat(B, /children hold their breath/), encore = beat(B, /^ko_nana:/), last = B[B.length - 1];
  const t0 = S.findIndex((x) => x.run);
  const before = S.slice(0, t0), during = S.filter((x) => x.run && first && x.t >= first.t), after = S.filter((x) => x.t > r.end);
  ok(before.length > 3 && before.every((x) => x.n === 0 && x.g === 0), tag + ': before the trigger, no Nana in the cave');
  ok(first && /Suzu stops in front of the rock stage/.test(first.d) && first.n === 1 && first.na[0].join() === '13,10,up,false' && r.ent.length && r.ent[r.ent.length - 1].ok,
    tag + ': the opening narration, with Nana arrived at (13,10) facing up behind you; the entrance recorded as made (' + JSON.stringify({ first: first && first.na, ent: r.ent.slice(-1) }) + ')');
  ok(during.length > 10 && during.every((x) => x.n === 1 && x.g === 0 && x.na[0][0] === 13 && x.na[0][1] === 10) && B.every((x) => x.n === 1) && !jumps(S).length,
    tag + ': one Nana, at her place, from then through her encore, never jumping (' + JSON.stringify({ samples: during.length, odd: during.filter((x) => x.n !== 1).length, jumps: jumps(S) }) + ')');
  ok(encore && encore.n === 1 && encore.na[0].join() === '13,10,up,false', tag + ': "Again! Again!" is hers, from the audience, with no second figure');
  ok(roll && roll.c && roll.c.join() === '14,6,down', tag + ': Suzu on the rock (14,6), facing the audience, for "Roll up" (' + JSON.stringify(roll && roll.c) + ')');
  const paced = S.filter((x) => roll && pace && x.t > roll.t && x.t < pace.t).map((x) => x.c && x.c.join());
  ok(pace && pace.c && pace.c.join() === '14,6,down' && paced.includes('12,6') && paced.includes('17,6'), tag + ': she paces the rock (12,6 and 17,6) before the narration of it, and is back at 14,6 for it');
  ok(JSON.stringify(r.said) === JSON.stringify(r.want) && r.want.length >= 8, tag + ': the scene\'s own lines for these panels, in order (' + r.said.length + ' lines)');
  ok(r.fb === 0 && !S.some((x) => x.run && (x.clash || x.pillar)), tag + ': no walk fallbacks; nobody on another\'s tile or on a pillar (' + JSON.stringify({ fallbacks: r.fb }) + ')');
  const leaving = after.filter((x) => x.g > 0), gone = after.slice(-5);
  ok(leaving.length && leaving.some((x) => x.gr.some((n) => n > 0)) && gone.every((x) => x.n === 0 && x.g === 0), tag + ': at the end Nana walks off by the way out and is gone (' + JSON.stringify({ leaving: leaving.length }) + ')');
  ok(last && last.c && Math.abs(gone[0].c[0] - gone[0].pc[0]) + Math.abs(gone[0].c[1] - gone[0].pc[1]) === 1, tag + ': Suzu has stepped down beside you (' + JSON.stringify({ comp: gone[0].c, pc: gone[0].pc }) + ')');
}
{
  const r = await trigger({ x: 13, y: 10 });
  staged('x 13, panels otoha/nami', r);
  // after: she follows you, and the strip is spent
  const pc0 = await r.p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
  // (a press in a new direction turns you first and steps only when still held past the turn, src/engine/50_world.js
  // turnHold: west is pressed until you have stepped, at most four times)
  for (let i = 0; i < 4 && (await r.p.evaluate(() => RB.world.W.player.x)) === pc0[0]; i++) await step(r.p, 'ArrowLeft', 1);
  await r.p.waitForTimeout(600);
  const a = await r.p.evaluate(() => ({ pc: [RB.world.W.player.x, RB.world.W.player.y], c: [RB.world.W.comp.x, RB.world.W.comp.y], run: RB.script.isRunning(), flag: !!RB.game.s.flags.ko_suzu_stage, nana: RB.world.W.npcs.concat(RB.world.W.extras, RB.world.W.leavers).filter((n) => n.id === 'ko_nana').length }));
  ok(a.pc.join() !== pc0.join() && a.c.join() === pc0.join() && !a.run && a.flag && a.nana === 0, 'x 13: Suzu follows you again (into the tile you left), and walking the strip again starts nothing (' + JSON.stringify(a) + ')');
  allErrors.push(...r.errors); await r.p.close();
}
{
  const r = await trigger({ x: 10, y: 10, p1: 'hamaji', p3: 'otoha' });
  staged('x 10, panels hamaji/otoha', r);
  allErrors.push(...r.errors); await r.p.close();
}
{
  // and a refresh of the people here in mid-scene (what `!refresh` does) at "Roll up"
  let after = null;
  const r = await trigger({ x: 19, y: 10, p1: 'shell', p3: 'shell', onBeat: async (p, st) => { if (/Roll up/.test(st.d)) { await p.evaluate(() => RB.world.refreshActors()); await p.waitForTimeout(300); after = await p.evaluate(look); } } });
  staged('x 19, panels shell/shell, a refresh mid-scene', r);
  ok(after && after.n === 1 && after.na[0].join() === '13,10,up,false', 'x 19: after a refresh of the people here in mid-scene, still the one Nana at her place (' + JSON.stringify(after && after.na) + ')');
  allErrors.push(...r.errors); await r.p.close();
}

// ---- 3. skipping ---------------------------------------------------------------------------------------------------
{
  // skip already on (the scene seen before; what the Skip button sets): she is placed at once, no walk-in
  const { p, errors } = await page(b, url);
  await setup(p, { x: 13, y: 10 });
  const fb0 = await fb(p);
  await p.evaluate(() => { RB.game.s.seen['ko.suzu_stage'] = true; RB.game.setFastForward(true); });
  await step(p, 'ArrowUp', 2);
  const B = await play(p);
  await p.waitForTimeout(6500);
  const S = await samples(p), ent = await entrances(p), f = (await fb(p)) - fb0;
  const seenN = S.filter((x) => x.run && x.n);
  ok(seenN.length && seenN.every((x) => x.na[0][0] === 13 && x.na[0][1] === 10) && ent[ent.length - 1].ok && f === 0 && !S.some((x) => x.n > 1),
    'skip on: Nana is there at once at (13,10) (no walk-in), one Nana, the entrance made, no fallbacks (' + JSON.stringify({ samples: seenN.length, first: seenN[0] && seenN[0].na, fallbacks: f, beats: B.length }) + ')');
  const last = S.slice(-3);
  ok(last.every((x) => x.n === 0 && x.g === 0 && x.c && Math.abs(x.c[0] - x.pc[0]) + Math.abs(x.c[1] - x.pc[1]) === 1 && !x.run), 'skip on: after it, Nana gone and Suzu beside you');
  allErrors.push(...errors); await p.close();
}
{
  // the real Skip on the first line
  const { p, errors } = await page(b, url);
  await setup(p, { x: 13, y: 10 });
  const fb0 = await fb(p);
  await p.evaluate(() => { RB.game.s.seen['ko.suzu_stage'] = true; RB.game.settings.skipSeen = true; });
  await step(p, 'ArrowUp', 2);
  let first = null, clicked = false;
  for (let i = 0; i < 200 && !clicked; i++) {
    first = await p.evaluate(look);
    if (first.d) { await p.waitForTimeout(200); clicked = await p.evaluate(() => { const k = document.querySelector('.dlg .b-skip'); if (!k || k.classList.contains('hidden')) return false; k.click(); return true; }); }
    else await p.waitForTimeout(90);
  }
  const B = await play(p);
  await p.waitForTimeout(6500);
  const S = await samples(p), f = (await fb(p)) - fb0, end = S.slice(-3);
  ok(clicked && first.n === 1 && first.na[0].join() === '13,10,up,false' && f === 0 && !S.some((x) => x.n > 1) && end.every((x) => x.n === 0 && x.g === 0 && !x.run),
    'the real Skip on the first line: Nana had walked in to (13,10); the rest goes at once; one Nana; no fallbacks; she leaves after (' + JSON.stringify({ clicked, first: first && first.na, rest: B.length, fallbacks: f }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 4. reload, an old save, another campaign loaded while she walks in --------------------------------------------
{
  const { p, errors } = await page(b, url);
  await setup(p, { x: 13, y: 10 });
  await step(p, 'ArrowUp', 2);
  await play(p, async (st) => { if (/Roll up/.test(st.d)) await p.evaluate(async () => { await RB.save.writeSlot(3, RB.game.s, { force: true }); }); });
  await p.reload();
  await p.waitForFunction(() => window.RB && RB.game && RB.save, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  await p.evaluate(async () => { await RB.game.loadCampaign(3); });
  await p.waitForTimeout(1500);
  const a = await p.evaluate(() => { const W = RB.world.W; return { map: W.map.id, flag: !!RB.game.s.flags.ko_suzu_stage, run: RB.script.isRunning(), nana: W.npcs.concat(W.extras, W.leavers).filter((n) => n.id === 'ko_nana').length, comp: !!W.comp }; });
  // off the strip and back onto it (a press in a new direction turns you first: each way is pressed until you have
  // stepped, at most four times)
  const y0 = await p.evaluate(() => RB.world.W.player.y);
  for (let i = 0; i < 4 && (await p.evaluate(() => RB.world.W.player.y)) === y0; i++) await step(p, 'ArrowDown', 1);
  const off = await p.evaluate(() => RB.world.W.player.y);
  for (let i = 0; i < 4 && (await p.evaluate(() => RB.world.W.player.y)) !== y0; i++) await step(p, 'ArrowUp', 1);
  await p.waitForTimeout(800);
  const c = await p.evaluate(() => ({ run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen(), nana: RB.world.W.npcs.concat(RB.world.W.extras).filter((n) => n.id === 'ko_nana').length, y: RB.world.W.player.y }));
  c.walked = off !== y0 && c.y === y0;
  ok(a.map === 'ko.seacave' && a.flag && !a.run && a.nana === 0 && a.comp && c.walked && !c.run && !c.dlg && c.nana === 0, 'a reload with a save made mid-scene: the cave, no Nana, Suzu with you; off the strip and back onto it, the scene does not play again (' + JSON.stringify({ a, c }) +')');
  allErrors.push(...errors); await p.close();
}
{
  const { p, errors } = await page(b, url);
  await setup(p, { x: 13, y: 10, flags: { ko_suzu_stage: true } });
  await step(p, 'ArrowUp', 2);
  await p.waitForTimeout(1500);
  const S = await samples(p);
  ok(S.every((x) => !x.run && x.n === 0 && x.g === 0), 'an old save with the stage already played: walking onto the strip starts nothing, and no Nana');
  allErrors.push(...errors); await p.close();
}
{
  // a campaign in the keepers' village (Nana by the well) is loaded while she walks into the cave
  const { p, errors } = await page(b, url);
  await setup(p, { map: 'ko.village', x: 20, y: 20 });
  await p.evaluate(async () => { await RB.save.writeSlot(2, RB.game.s, { force: true }); });
  await setup(p, { x: 13, y: 10 });
  await step(p, 'ArrowUp', 2);
  await p.waitForTimeout(400);
  const mid = await p.evaluate(look);
  const e0 = (await entrances(p)).length;
  await p.evaluate(async () => { await RB.game.loadCampaign(2); });
  await p.waitForTimeout(600);
  const v0 = await p.evaluate(() => { const W = RB.world.W; const n = W.npcs.find((a) => a.id === 'ko_nana' || (a.def && a.def.char === 'ko_nana')); return { map: W.map.id, at: n && [n.x, n.y], said: window.__said.length, walks: RB.staging.stats().walks }; });
  await p.waitForTimeout(9500); // past the entrance's bound
  const v1 = await p.evaluate(() => { const W = RB.world.W; const ns = W.npcs.concat(W.extras).filter((a) => a.id === 'ko_nana' || (a.def && a.def.char === 'ko_nana')); return { map: W.map.id, n: ns.length, at: ns[0] && [ns[0].x, ns[0].y], said: window.__said.length, run: RB.script.isRunning(), walks: RB.staging.stats().walks }; });
  const e1 = (await entrances(p)).length;
  ok(mid.run && mid.n === 1 && v0.map === 'ko.village' && v1.map === 'ko.village' && v1.n === 1 && v0.at && !(v1.at[0] === 13 && v1.at[1] === 10) && v1.walks === v0.walks && e1 === e0 && v1.said === v0.said && !v1.run,
    'another campaign loaded while she walks in: its own Nana is never walked by the old scene\'s entrance, nothing is recorded for it, and nothing of the old scene is said (' + JSON.stringify({ mid: mid.na, v0, v1, entrances: [e0, e1] }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 5. the safeguards ---------------------------------------------------------------------------------------------
{
  // her walk-in held past its bound (the test-mode wait bypass off): recorded as not arrived, never snapped
  const { p, errors } = await page(b, url);
  await setup(p, { x: 13, y: 10 });
  await p.evaluate(() => {
    const es = RB.world.ensureSpeaker;
    // (the test holds her at the way in for 11 s: the entrance's own bound is 8 s)
    RB.world.ensureSpeaker = function (who, sid, o) { const a = es.apply(this, arguments); if (o && o.staged && a && a.route && !window.__held) { a.wait = 11000; window.__held = true; } return a; };
  });
  const tr = await p.evaluate(() => performance.now() | 0);
  await step(p, 'ArrowUp', 2);
  const B = await play(p);
  await p.waitForTimeout(6500);
  const S = await samples(p), ent = await entrances(p);
  const first = B[0], encore = beat(B, /^ko_nana:/);
  ok(!(await p.evaluate(() => !!(RB.test && RB.test.auto))) && first && first.t - tr > 7500 && first.na.length === 1 && first.na[0][0] <= 1 && ent[ent.length - 1].ok === false && ent[ent.length - 1].why === 'not arrived',
    'a walk-in held past its bound: the scene goes on after the bound, she is still at the way in (not snapped to her place), and the entrance is recorded as not arrived (' + JSON.stringify({ after: first && first.t - tr, at: first && first.na, ent: ent.slice(-1) }) + ')');
  ok(encore && encore.na[0].join() === '13,10,up,false' && !jumps(S).length && !S.some((x) => x.n > 1), 'and she walks there on her own after (no jump), in place for her encore; one Nana throughout (' + JSON.stringify({ encore: encore && encore.na, jumps: jumps(S) }) + ')');
  ok(S.slice(-3).every((x) => x.n === 0 && x.g === 0), 'and leaves at the end as the scene\'s own');
  allErrors.push(...errors); await p.close();
}
{
  // someone already placed: walked by staging, put back after, never dismissed
  const { p, errors } = await page(b, url);
  await setup(p, { map: 'ko.village', x: 20, y: 20 });
  const r0 = await p.evaluate(() => {
    const W = RB.world.W, n = W.npcs.find((a) => a.id === 'ko_nana');
    const free = (x, y) => !RB.maps.blockedStatic(W.map, x, y) && !W.npcs.concat(W.extras).some((a) => a.x === x && a.y === y) && !(W.player.x === x && W.player.y === y) && !(W.comp && W.comp.x === x && W.comp.y === y);
    const to = [[2, 0], [-2, 0], [0, 2], [0, -2], [2, 1], [-2, 1]].map(([dx, dy]) => [n.x + dx, n.y + dy]).find(([x, y]) => free(x, y));
    RB.script.add('@scene zz.enter_placed\n!enter ko_nana ' + to[0] + ' ' + to[1] + ' down\nnarr: テスト || A test line.\n', 'suzu_stage test');
    window.__samp = [];
    RB.script.run('zz.enter_placed');
    return { home: [n.x, n.y], to };
  });
  const B = await play(p);
  await p.waitForTimeout(4000);
  const a = await p.evaluate(() => { const W = RB.world.W; const isN = (x) => x.id === 'ko_nana'; return { npcs: W.npcs.filter(isN).map((n) => [n.x, n.y]), extras: W.extras.filter(isN).length, leaving: W.leavers.filter(isN).length }; });
  const ent = await entrances(p);
  ok(B[0] && B[0].n === 1 && B[0].na[0][0] === r0.to[0] && B[0].na[0][1] === r0.to[1] && B[0].na[0][2] === 'down' && ent[ent.length - 1].ok, 'someone already placed (Nana in the village): walked to the named place, one figure, the entrance made (' + JSON.stringify({ to: r0.to, at: B[0] && B[0].na }) + ')');
  ok(a.npcs.length === 1 && a.npcs[0].join() === r0.home.join() && !a.extras && !a.leaving, 'and put back at her own place after, still a resident, never sent off as a scene\'s extra (' + JSON.stringify({ home: r0.home, a }) + ')');
  allErrors.push(...errors); await p.close();
}
{
  // the audit: the deliberate entrance is not a missing speaker; a genuinely missing one still is
  const { p, errors } = await page(b, url);
  await setup(p, { x: 13, y: 10 });
  await p.evaluate(() => { RB.test.extras = []; RB.test.enable({}); });
  await step(p, 'ArrowUp', 2);
  for (let i = 0; i < 100 && !(await p.evaluate(() => !!RB.game.s.flags.ko_suzu_stage && !RB.script.isRunning())); i++) await p.waitForTimeout(100);
  await p.waitForTimeout(7000);
  const a = await p.evaluate(() => ({ extras: (RB.test.extras || []).slice(), ent: (RB.test.entrances || []).slice(-1), nana: RB.world.W.npcs.concat(RB.world.W.extras, RB.world.W.leavers).filter((n) => n.id === 'ko_nana').length }));
  await p.evaluate(() => { RB.script.add('@scene zz.missing_nana\nko_nana: テスト || A test line.\n', 'suzu_stage test'); return RB.script.run('zz.missing_nana'); });
  await p.waitForTimeout(800);
  const c = await p.evaluate(() => { const r = (RB.test.extras || []).slice(); RB.test.disable(); return r; });
  ok(!a.extras.some((x) => /ko_nana/.test(x)) && a.ent[0] && a.ent[0].ok && a.nana === 0, 'the audit: the scene\'s deliberate entrance is not logged as a missing speaker (the entrance has its own record) (' + JSON.stringify(a) + ')');
  ok(c.includes('ko_nana @ ko.seacave (zz.missing_nana)'), 'and a genuinely missing speaker still is: a later Nana line with no !enter (' + JSON.stringify(c) + ')');
  allErrors.push(...errors); await p.close();
}

ok(!allErrors.length, 'no page errors ' + allErrors.slice(0, 3).join(' | '));
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
