// The Chart Room's stove cold until the flame word lights it, sprite and light both (Agnes 6545405253, 6545601642;
// Local CL-556, CL-557; Cloud CC-399). In Chromium on the built game, on a throwaway journey seeded in the Chart Room
// (never a real save; begun as a journey of the current edition, so loading it back does not offer the old-edition
// fresh start), the stove used through the world's own interact:
//  1. the sprite: a stove drawn plain or written lit (o.lit true) is the same picture frame by frame, and it moves;
//     written as unlit (o.lit false) it is one still picture, unlike any lit frame;
//  2. first arrival: one stove there, the cold one; no light from it; the room at its darker level (0.4);
//  3. "Leave it": still cold; out to the hall and back in: still cold; saved and loaded: still cold;
//  4. "Light it": at once, without leaving, the lit stove, its light, the room at 0.2; asked again, still lit; out
//     and back: lit; the page reloaded and the save loaded: lit;
//  5. a battle here (the moth, started as the game starts one at its tile): the stove is in the backdrop (checked
//     first, so a stove culled from view proves nothing), and it gives no light before lighting and one after;
//  6. the guard on its own (a synthetic composition: no battle in the game shows one of the unlit lamps): in the same
//     room's backdrop, the stove's own placement written as unlit, then as lit, then plain, before and after the
//     stove is lit: only the unlit one gives no light;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/chart_stove.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = (x) => JSON.stringify(x);
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, sb_storm: true, sb_morning: true, sb_obs_open: true, sb_stair_open: true };

async function begin(p, flags) {
  await p.evaluate(async (flags) => {
    const s = RB.game.debugStart('sb.obs_charts', 12, 3, { edition: RB.edition.forNew(), dir: 'down', comp: 'nao', flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'mizu', 'hikari', 'honoo'];
    RB.game.settings.textSpeed = 'instant';
    window.__pick = 0;
    RB.test.enable({ choose: () => window.__pick });
    await new Promise((r) => setTimeout(r, 400));
    RB.world.refreshActors();
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
  }, flags);
}
const room = (p) => p.evaluate(() => {
  const m = RB.world.W.map, s = RB.game.s;
  const here = m.props.filter((q) => q.p === 'stove' && q.x === 13 && q.y === 2 && (!q.if || RB.state.test(s, q.if)));
  return { map: m.id, active: here.map((q) => (q.o && q.o.lit === false ? 'cold' : 'lit')), lights: RB.worldLook.emitters(m).filter((e) => e.p.p === 'stove').length, dark: m.def.ambient.dark, flag: !!s.flags.sb_stove_lit };
});
const useStove = (p, pick) => p.evaluate(async (pick) => { window.__pick = pick; window.__said = []; await RB.test.use(13, 2); return window.__said.slice(); }, pick);
const outAndBack = (p) => p.evaluate(async () => { await RB.test.go('sb.obs_hall', 10, 3, 'up'); await RB.test.go('sb.obs_charts', 12, 3, 'down'); });
const COLD = { active: ['cold'], lights: 0, dark: 0.4 }, LIT = { active: ['lit'], lights: 1, dark: 0.2 };
const is = (r, w) => J(r.active) === J(w.active) && r.lights === w.lights && r.dark === w.dark && r.map === 'sb.obs_charts';

// ---- 1. the sprite
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const spr = await p.evaluate(() => {
    const pal = RB.tiles.PAL.snowbell || RB.tiles.PAL.reedwake;
    const hash = (o, t) => {
      const c = document.createElement('canvas'); c.width = 64; c.height = 80;
      const g = c.getContext('2d');
      RB.props.P.stove.draw2(g, 16, 30, pal, t, o);
      const d = g.getImageData(0, 0, 64, 80).data;
      let h = 2166136261 >>> 0;
      for (let i = 0; i < d.length; i++) { h ^= d[i]; h = Math.imul(h, 16777619) >>> 0; }
      return h >>> 0;
    };
    const ts = [0, 110, 220, 330, 440, 550];
    return { plain: ts.map((t) => hash({}, t)), lit: ts.map((t) => hash({ lit: true }, t)), cold: ts.map((t) => hash({ lit: false }, t)) };
  });
  ok(J(spr.plain) === J(spr.lit) && new Set(spr.plain).size >= 2 && new Set(spr.cold).size === 1 && !spr.plain.includes(spr.cold[0]),
    '1 the sprite: plain and lit the same frame by frame, and moving; unlit one still picture, unlike any lit frame (' + J({ litFrames: new Set(spr.plain).size, coldFrames: new Set(spr.cold).size }) + ')');
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

// ---- 2–4. the room
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, FLAGS);
  const first = await room(p);
  ok(is(first, COLD) && !first.flag, '2 first arrival: one stove, the cold one; no light from it; the room at 0.4 (' + J(first) + ')');
  const leave = await useStove(p, 1);
  const afterLeave = await room(p);
  await outAndBack(p);
  const reentered = await room(p);
  await p.evaluate(async () => { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); });
  await p.evaluate(() => RB.test.idle());
  const loaded = await room(p);
  ok(leave.some((x) => /^A cold stove with some wood left inside/.test(x)) && is(afterLeave, COLD) && is(reentered, COLD) && is(loaded, COLD) && !loaded.flag,
    '3 "Leave it": cold; out and back: cold; saved and loaded: cold (' + J({ afterLeave, reentered, loaded }) + ')');
  await p.evaluate(() => { RB.test.enable({ choose: () => window.__pick }); });
  const light = await useStove(p, 0);
  const lit = await room(p);
  const again = await useStove(p, 0);
  const litAgain = await room(p);
  await outAndBack(p);
  const litBack = await room(p);
  ok(light.some((x) => /the wood flares red/.test(x)) && is(lit, LIT) && lit.flag && again.some((x) => /You warm your hands/.test(x)) && !again.some((x) => /flares/.test(x)) && is(litAgain, LIT) && is(litBack, LIT),
    '4 "Light it": at once the lit stove, its light, the room at 0.2; asked again, still lit; out and back, lit (' + J({ lit, litBack }) + ')');
  await p.evaluate(async () => { await RB.save.manualSave(1); });
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true);
  await p.evaluate(async () => { await RB.game.loadCampaign(1, 'manual'); await RB.test.idle(); });
  const reloaded = await room(p);
  ok(is(reloaded, LIT) && reloaded.flag, '4 the page reloaded and the save loaded: lit (' + J(reloaded) + ')');
  ok(!errors.length, '2–4 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

// ---- 5. a battle in the room
async function battleHere(lit) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate((flags) => {
    const place = RB.content.maps['sb.obs_charts'].foes.find((f) => f.id === 'moth1');
    const s = RB.game.debugStart('sb.obs_charts', place.x, place.y + 1, { edition: RB.edition.forNew(), comp: 'nao', flags });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'mizu', 'hikari'];
    RB.game.settings.input = 'choice'; RB.game.settings.reducedMotion = true; RB.game.applySettings();
    RB.game.startBattle(place.enemy, { where: { map: 'sb.obs_charts', x: place.x, y: place.y }, place, foeKey: 'foe:sb.obs_charts:moth1', presentSeed: 7 });
  }, Object.assign({}, FLAGS, lit ? { sb_stove_lit: true } : {}));
  for (let i = 0; i < 100; i++) {
    const ready = await p.evaluate(() => !!(RB.battlePlaces.last() && RB.battlePlaces.last().layerKey));
    if (ready) break;
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const L = RB.battlePlaces.last(); return { stove: L.context.concat(L.landmarks).filter((x) => /stove@13,2/.test(x.from || '')).map((x) => ({ shown: x.shown, from: x.from })), lights: L.lights.filter((l) => l.lit === 'stove').length, all: L.lights.map((l) => l.lit) }; });
  await p.close();
  return { r, errors };
}
{
  const before = await battleHere(false), after = await battleHere(true);
  const shown = (x) => x.r.stove.length === 1 && x.r.stove[0].shown;
  ok(shown(before) && shown(after), '5 the stove is in the battle\'s backdrop, before and after lighting (' + J({ before: before.r.stove, after: after.r.stove }) + ')');
  ok(shown(before) && before.r.lights === 0 && shown(after) && after.r.lights === 1, '5 and it gives no light before lighting and one after (' + J({ before: before.r.all, after: after.r.all }) + ')');
  ok(!before.errors.length && !after.errors.length, '5 no page errors ' + before.errors.concat(after.errors).slice(0, 3).join(' | '));
}

// ---- 6. the guard on its own (synthetic composition)
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const rows = [];
  for (const [label, o] of [['written as unlit', { lit: false }], ['written as lit', { lit: true }], ['plain', null]]) {
    for (const lit of [false, true]) {
      const n = await p.evaluate(async ([o, flags]) => {
        // the room's own placements, with the stove placement's options replaced for this one composition
        const def = RB.content.maps['sb.obs_charts'];
        const keep = def.props;
        def.props = keep.map((q) => (q.p === 'stove' ? Object.assign({}, q, { o: o || undefined }) : q));
        if (!o) for (const q of def.props) if (q.p === 'stove') delete q.o;
        RB.maps.forget && RB.maps.forget('sb.obs_charts');
        try {
          const place = def.foes.find((f) => f.id === 'moth1');
          const s = RB.game.debugStart('sb.obs_charts', place.x, place.y + 1, { edition: RB.edition.forNew(), comp: 'nao', flags });
          s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'mizu', 'hikari'];
          RB.game.settings.input = 'choice'; RB.game.settings.reducedMotion = true; RB.game.applySettings();
          RB.game.startBattle(place.enemy, { where: { map: 'sb.obs_charts', x: place.x, y: place.y }, place, foeKey: 'foe:sb.obs_charts:moth1', presentSeed: 7 });
          for (let i = 0; i < 100 && !(RB.battlePlaces.last() && RB.battlePlaces.last().layerKey); i++) await new Promise((r) => setTimeout(r, 100));
          await new Promise((r) => setTimeout(r, 300));
          const L = RB.battlePlaces.last();
          return { shown: L.context.concat(L.landmarks).filter((x) => /stove@13,2/.test(x.from || '') && x.shown).length, lights: L.lights.filter((l) => l.lit === 'stove').length };
        } finally { def.props = keep; RB.maps.forget && RB.maps.forget('sb.obs_charts'); }
      }, [o, Object.assign({}, FLAGS, lit ? { sb_stove_lit: true } : {})]);
      rows.push({ label, lit, n });
      await p.reload();
      await p.waitForFunction(() => window.__RB_READY__ === true);
    }
  }
  const want = (r) => (r.label === 'written as unlit' ? 0 : 1);
  ok(rows.every((r) => r.n.shown >= 1 && r.n.lights === want(r)), '6 (synthetic) only a placement written as unlit gives no light: unlit, lit, plain, before and after the flag (' + J(rows.map((r) => r.label + (r.lit ? '+lit' : '') + ':' + r.n.shown + '/' + r.n.lights)) + ')');
  ok(!errors.length, '6 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

console.log(`\nchart_stove: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
