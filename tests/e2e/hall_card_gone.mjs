// RBN-QA-180's card (CC-175 §2; Local CL-288, Agnes 6382498068): on the Sun-Shower Meadow the go-between's stone,
// once its trial is passed, says "The wrong card blows away on the wind", and all four practice cards stayed on their
// posts. In Chromium on the built game, with throwaway journeys in the Hall (a visit begun as the hearth begins one),
// the trial's task stubbed to its result, the tier it is asked at recorded from the challenge's own choice of steps:
//  1. for both of the floor's patterns, each level, on Consolidate and on Grow (16 journeys): passing the trial takes
//     away exactly the card that the tier it was asked at has wrong (pattern 0: card 3; pattern 1: card 4 at F and E,
//     card 3 at I and A), the other three still there, solid and readable; the line said as before, after it is gone
//     (Advanced on Grow is asked the task's own stretch, `stretchA`, with the Advanced cards on the posts: theirs goes);
//  2. put off ("Come back later"): no card gone; then passed at another level: the card of that level's tier;
//  3. a save made after the pass, loaded: the same three cards; a later change of level: the same card still gone;
//  4. the floor's reset: all four cards back;
//  5. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/hall_card_gone.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });

// a journey in the Hall's second wing, on the meadow by the cards: the pattern, the level and the route set; the task
// answered (`res`) without being shown, and the tier it was asked at recorded as the challenge chooses its steps
const begin = (pat, prof, route) => p.evaluate(async ([pat, prof, route]) => {
  const s = RB.game.debugStart('hall.w2f1', 13, 5, { edition: RB.edition.forNew(), comp: null, flags: { hall_w2_f1_seen: true }, dir: 'up' });
  RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {};
  s.learn.profile = prof;
  RB.hall.enter(s, 'w2');
  RB.hall.wrec(s, 'w2').pat = pat;
  RB.hall.setChoice(s, 'w2', { route });
  let quiet = 0;
  for (let i = 0; i < 200 && quiet < 10; i++) {
    if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
    quiet = RB.ui.dialogue.isOpen() || RB.script.isRunning() ? 0 : quiet + 1;
    await new Promise((r) => setTimeout(r, 40));
  }
  window.__served = []; window.__res = { ok: true };
  for (const id of ['hall.w2.counter0', 'hall.w2.counter1']) {
    const ch = RB.content.challenges[id];
    for (const [k, a] of Object.entries(ch.tiers).concat(ch.stretchA ? [['A+', ch.stretchA]] : [])) {
      if (!a.__seen) Object.defineProperty(a, 'map', { value: function (f) { window.__served.push(k); return Array.prototype.map.call(this, f); }, configurable: true }), (a.__seen = true);
    }
  }
  RB.challenge.run = async (id, c) => { if (!(c && c.steps)) RB.tasks.stepsOf(RB.content.challenges[id]); return window.__res; };
}, [pat, prof, route]);
// the trial played to its end with Next: what was said, the tier it was asked at, and the cards at each line
const trial = (res) => p.evaluate(async (res) => {
  window.__res = res; window.__served = [];
  const said = [], say0 = RB.ui.dialogue.say, s = RB.game.s, m = RB.world.W.map;
  const cards = () => m.props.filter((q) => /^hall\.w2\.card\d$/.test(q.scene || '') && (!q.if || RB.state.test(s, q.if))).map((q) => +q.scene.slice(-1));
  RB.ui.dialogue.say = function (l) { said.push([String((l && l.en) || ''), cards().length]); return say0.apply(this, arguments); };
  const run = RB.script.run('hall.w2.t3');
  for (let i = 0; i < 300; i++) {
    if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
    if (!RB.script.isRunning() && !RB.ui.dialogue.isOpen()) break;
    await new Promise((r) => setTimeout(r, 30));
  }
  await run;
  RB.ui.dialogue.say = say0;
  return { said, tier: window.__served[window.__served.length - 1] || null };
}, res);
// the four cards now: which are shown, which block their tile, which read their card's line
const cards = () => p.evaluate(() => {
  const s = RB.game.s, m = RB.world.W.map;
  const all = m.props.filter((q) => /^hall\.w2\.card\d$/.test(q.scene || ''));
  const shown = all.filter((q) => !q.if || RB.state.test(s, q.if));
  return {
    shown: shown.map((q) => +q.scene.slice(-1)),
    solid: shown.every((q) => RB.world.blocked(q.x, q.y, { ignorePlayer: true })),
    freed: all.filter((q) => !shown.includes(q)).every((q) => !RB.world.blocked(q.x, q.y, { ignorePlayer: true })),
    flags: Object.keys(s.flags).filter((k) => /^xp_hall_w2_f0_t3_gone/.test(k) && s.flags[k]).sort(),
    done: !!s.flags.xp_hall_w2_f0_t3,
  };
});
// the card each tier has wrong (1-4), from the content's own table
const WRONG = await p.evaluate(() => Object.fromEntries([0, 1].map((pat) => [pat, Object.fromEntries(['F', 'E', 'I', 'A'].map((t) => [t, RB.content.hallW2Cards[pat][t].findIndex((c) => c[1] === 1) + 1]))])));
ok(J(WRONG) === J({ 0: { F: 3, E: 3, I: 3, A: 3 }, 1: { F: 4, E: 4, I: 3, A: 3 } }), 'the card each tier has wrong, as CC-175 §2 read them (' + J(WRONG) + ')');
const SERVED = { consolidate: { F: 'F', E: 'E', I: 'I', A: 'A' }, grow: { F: 'E', E: 'I', I: 'A', A: 'A+' } };

// ---- 1. every pattern, level and route ------------------------------------------------------------------------------------
for (const pat of [0, 1]) for (const route of ['consolidate', 'grow']) {
  const rows = [];
  for (const prof of ['F', 'E', 'I', 'A']) {
    await begin(pat, prof, route);
    const r = await trial({ ok: true });
    const c = await cards();
    const want = WRONG[pat][r.tier === 'A+' ? 'A' : r.tier];
    const line = r.said.find((x) => /blows away/.test(x[0]));
    rows.push({ prof, tier: r.tier, want, shown: c.shown, flags: c.flags, line: line && line[1] });
    ok(r.tier === SERVED[route][prof] && c.done && J(c.shown) === J([1, 2, 3, 4].filter((i) => i !== want)) && J(c.flags) === J(['xp_hall_w2_f0_t3_gone' + want]) && c.solid && c.freed && line && line[1] === 3,
      'pattern ' + pat + ', ' + route + ', level ' + prof + ' (asked at ' + r.tier + '): card ' + want + ' gone as the line is said, the other three there and solid (' + J(rows[rows.length - 1]) + ')');
  }
}
// the three that remain still read their own lines
{
  await begin(1, 'F', 'consolidate');
  await trial({ ok: true });
  const read = await p.evaluate(async () => {
    const out = {};
    for (const i of [1, 2, 3]) {
      const said = [], say0 = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { said.push(String((l && l.en) || '')); return say0.apply(this, arguments); };
      const run = RB.script.run('hall.w2.card' + i);
      for (let k = 0; k < 100; k++) { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); if (!RB.script.isRunning() && !RB.ui.dialogue.isOpen()) break; await new Promise((r) => setTimeout(r, 30)); }
      await run; RB.ui.dialogue.say = say0; out[i] = said;
    }
    return out;
  });
  ok([1, 2, 3].every((i) => read[i].length === 2 && /practice cards/.test(read[i][0]) && read[i][1].length > 5), 'pattern 1 at F, card 4 gone: cards 1-3 each still read their line (' + J(read).slice(0, 300) + ')');
}

// ---- 2. put off, then passed at another level -----------------------------------------------------------------------------
{
  await begin(1, 'F', 'consolidate');
  const off = await trial({ ok: false, cancelled: true });
  const c0 = await cards();
  ok(off.said.some((x) => /come back/.test(x[0])) && J(c0.shown) === '[1,2,3,4]' && !c0.flags.length && !c0.done, 'put off ("Come back later"): all four cards there, nothing set (' + J({ said: off.said.map((x) => x[0]), c0 }) + ')');
  await p.evaluate(() => { RB.game.s.learn.profile = 'I'; });
  const r = await trial({ ok: true });
  const c1 = await cards();
  ok(r.tier === 'I' && J(c1.shown) === '[1,2,4]' && J(c1.flags) === '["xp_hall_w2_f0_t3_gone3"]', 'then passed at level I: card 3 gone, the card of the tier it was asked at, not of the first try (' + J({ tier: r.tier, c1 }) + ')');
}

// ---- 3. saved and loaded; a later change of level ---------------------------------------------------------------------------
{
  await begin(1, 'E', 'consolidate');
  await trial({ ok: true });
  const before = await cards();
  await p.evaluate(async () => { await RB.save.manualSave(1); });
  await p.evaluate(async () => { delete RB.game.s.flags.xp_hall_w2_f0_t3_gone4; await RB.game.loadCampaign(1, 'manual'); });
  await p.waitForTimeout(800);
  const after = await cards();
  ok(J(before.shown) === '[1,2,3]' && J(after.shown) === '[1,2,3]' && J(after.flags) === '["xp_hall_w2_f0_t3_gone4"]', 'saved after the pass (pattern 1 at E, card 4 gone) and loaded: the same three cards (' + J({ before: before.shown, after }) + ')');
  await p.evaluate(() => { RB.game.s.learn.profile = 'A'; });
  const later = await cards();
  ok(J(later.shown) === '[1,2,3]', 'a later change of level (to A, whose wrong card would be 3): card 4 still the one gone (' + J(later) + ')');

  // ---- 4. the floor's reset ---------------------------------------------------------------------------------------------
  await p.evaluate(() => RB.hall.resetFloor(RB.game.s, 'w2', 0));
  const reset = await cards();
  ok(J(reset.shown) === '[1,2,3,4]' && !reset.flags.length && reset.solid, 'the floor reset: all four cards back, and solid (' + J(reset) + ')');
}
ok(!errors.length, 'no page errors (' + J(errors).slice(0, 300) + ')');
await ctx.close(); await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
