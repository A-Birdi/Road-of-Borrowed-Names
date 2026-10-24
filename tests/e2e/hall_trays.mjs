// RBN-QA-181 (Agnes 6382521898, 6382693177; Local CL-289, CL-290): on the Sun-Shower Meadow you carry one gift at a
// time, but picking up a second one put the first down without a word, and the three trays stayed empty tables when
// the narration said each gift was on its tray. In Chromium on the built game, with throwaway journeys, for both of the
// floor's patterns:
//  1. the words: with empty hands, the gift picked up as before ("You pick up a white box.", its line and voice key
//     unchanged), and the first time on the floor only, "You can carry only one at a time."; holding another, every
//     ordered pair: "You put the red bundle back in its place and pick up the white box." and only the new one held;
//     the one already held: "You're already carrying the white box.", nothing else changed; an older save already
//     holding a gift without the note's flag: the swap said, never the empty-hand line;
//  2. the trays: a wrong tray keeps the gift held; the right one takes it, and only then is it gone from the path and
//     on that tray (the gift the tray's pattern sends there); exactly one prop on each tray's tile in every state, its
//     scene and solidity the table's; one delivered, then all three; the table's whole footprint (both of its tiles),
//     bare and with its gift: each tile solid, and Look from in front of it opens that tray;
//  3. how the tray with its gift is drawn: the table, and the gift on it (the white box's pale paper, the bundle's red
//     cloth), in both renderers;
//  4. a save and load with one gift on its tray: still on it, its whole footprint as before; the floor reset: the trays
//     bare again (the whole footprint), the gifts back on the path, the note to be said again;
//  5. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/hall_trays.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
const GIFTS = ['red', 'white', 'chestnut'];
const RIGHT = [{ red: 'groom', white: 'mother', chestnut: 'toku' }, { red: 'toku', white: 'groom', chestnut: 'mother' }];

// (the floor's first visit already seen, so that its opening scene plays no lines; `hold`: what an older save on the
// floor already holds, set once you are there, as a save loaded mid-floor has it)
const begin = (pat, hold) => p.evaluate(async ([pat, hold]) => {
  const s = RB.game.debugStart('hall.w2f1', 17, 13, { edition: RB.edition.forNew(), comp: null, flags: { hall_w2_f1_seen: true }, dir: 'up' });
  RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {};
  RB.hall.wrec(s, 'w2').pat = pat;
  let quiet = 0;
  for (let i = 0; i < 200 && quiet < 10; i++) {
    if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
    quiet = RB.ui.dialogue.isOpen() || RB.script.isRunning() ? 0 : quiet + 1;
    await new Promise((r) => setTimeout(r, 40));
  }
  if (hold) s.flags['xp_hall_w2_f0_hold_' + hold] = true;
}, [pat, hold || null]);
// a scene played to its end with Next; the English of every line said (after the tag's own lines)
const play = (id) => p.evaluate(async (id) => {
  const said = [], say0 = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) { said.push(String((l && l.en) || '')); return say0.apply(this, arguments); };
  const run = RB.script.run(id);
  for (let i = 0; i < 300; i++) {
    if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
    if (!RB.script.isRunning() && !RB.ui.dialogue.isOpen()) break;
    await new Promise((r) => setTimeout(r, 30));
  }
  await run;
  RB.ui.dialogue.say = say0;
  return said.filter((t) => !/with a tag on it|^"From /.test(t));
}, id);
const state = () => p.evaluate(() => {
  const s = RB.game.s, m = RB.world.W.map, G = RB.content.hallW2.GIFTS, T = RB.content.hallW2.TRAYS;
  const shown = (x, y) => m.props.filter((q) => q.x === x && q.y === y && (!q.if || RB.state.test(s, q.if)));
  const held = ['red', 'white', 'chestnut'].filter((g) => s.flags['xp_hall_w2_f0_hold_' + g]);
  const trays = Object.fromEntries(Object.keys(T).map((t) => [t, shown(T[t][0], T[t][1]).map((q) => [q.p, (q.o && q.o.gift) || null, q.scene, !!RB.world.blocked(T[t][0], T[t][1], { ignorePlayer: true })])]));
  const path = Object.fromEntries(Object.keys(G).map((g) => [g, shown(G[g][0], G[g][1]).map((q) => q.p)]));
  return { held, trays, path, told: !!s.flags.xp_hall_w2_f0_carry_told };
});
// each tray's whole footprint, the table's own width: each tile solid, and Look from in front of it (from below, facing
// up) opens that tray's scene (the scene recorded, not played)
const foot = () => p.evaluate(() => {
  const W = RB.world.W, P = W.player, T = RB.content.hallW2.TRAYS, w = RB.props.P.table.w || 1;
  const at = [P.x, P.y, P.dir], run0 = RB.script.run, trays = {};
  let opened = null;
  RB.script.run = (id) => { opened = id; return Promise.resolve(); };
  try {
    for (const t of Object.keys(T)) {
      trays[t] = [];
      for (let i = 0; i < w; i++) {
        const x = T[t][0] + i, y = T[t][1];
        P.x = x; P.y = y + 1; P.fx = P.x; P.fy = P.y; P.dir = 'up'; P.mv = null; opened = null;
        RB.world.interact();
        trays[t].push([!!RB.world.blocked(x, y, { ignorePlayer: true }), opened]);
      }
    }
  } finally { RB.script.run = run0; P.x = at[0]; P.y = at[1]; P.fx = P.x; P.fy = P.y; P.dir = at[2]; }
  return { w, trays };
});
const whole = (f) => f.w === 2 && Object.keys(f.trays).every((t) => f.trays[t].length === f.w && f.trays[t].every(([solid, opened]) => solid && opened === 'hall.w2.tray_' + t));

// ---- 1. the words ---------------------------------------------------------------------------------------------------------
for (const pat of [0, 1]) {
  await begin(pat);
  const first = await play('hall.w2.g_white');
  const s1 = await state();
  ok(J(first) === J(['You pick up a white box.', 'You can carry only one at a time.']) && J(s1.held) === '["white"]' && s1.told,
    'pattern ' + pat + ', hands empty: "You pick up a white box." and, the first time, "You can carry only one at a time." (' + J(first) + ')');
  const again = await play('hall.w2.g_white');
  ok(J(again) === J(['You\'re already carrying the white box.']) && J((await state()).held) === '["white"]', 'the one already held: "You\'re already carrying the white box.", nothing else (' + J(again) + ')');
  // every ordered pair
  const pairs = [];
  for (const h of GIFTS) for (const g of GIFTS) if (h !== g) {
    await p.evaluate(([h]) => { const f = RB.game.s.flags; for (const x of ['red', 'white', 'chestnut']) delete f['xp_hall_w2_f0_hold_' + x]; f['xp_hall_w2_f0_hold_' + h] = true; }, [h]);
    const said = await play('hall.w2.g_' + g);
    pairs.push([h, g, said, (await state()).held]);
  }
  const NAME = { red: 'the red bundle', white: 'the white box', chestnut: 'the basket of chestnuts' };
  ok(pairs.every(([h, g, said, held]) => J(said) === J(['You put ' + NAME[h] + ' back in its place and pick up ' + NAME[g] + '.']) && J(held) === J([g])),
    'holding another, every ordered pair: "You put the … back in its place and pick up the …", only the new one held (' + J(pairs.slice(0, 2)) + ')');
  // empty hands again later: the note is not said twice
  await p.evaluate(() => { const f = RB.game.s.flags; for (const x of ['red', 'white', 'chestnut']) delete f['xp_hall_w2_f0_hold_' + x]; });
  const later = await play('hall.w2.g_red');
  ok(J(later) === J(['You pick up a red bundle.']), 'hands empty again later: picked up, the note not said twice (' + J(later) + ')');
}
// an older save already holding a gift, without the note's flag
{
  await begin(0, 'chestnut');
  const said = await play('hall.w2.g_white');
  const s = await state();
  ok(J(said) === J(['You put the basket of chestnuts back in its place and pick up the white box.']) && J(s.held) === '["white"]',
    'an older save already holding the chestnuts, no note\'s flag: the swap said, never the empty-hand line (' + J(said) + ')');
}

// ---- 2. the trays ---------------------------------------------------------------------------------------------------------
for (const pat of [0, 1]) {
  await begin(pat);
  const one = (t) => (st) => st.trays[t].length === 1;
  const s0 = await state();
  ok(Object.keys(s0.trays).every((t) => one(t)(s0) && s0.trays[t][0][0] === 'table' && s0.trays[t][0][3]), 'pattern ' + pat + ', nothing delivered: each tray its bare table, solid (' + J(s0.trays) + ')');
  const f0 = await foot();
  ok(whole(f0), 'pattern ' + pat + ', nothing delivered: each table\'s two tiles solid, each opening its tray (' + J(f0) + ')');
  const steps = [];
  for (const g of ['white', 'red', 'chestnut']) {
    const right = RIGHT[pat][g], wrong = ['groom', 'mother', 'toku'].find((t) => t !== right);
    await play('hall.w2.g_' + g);
    await play('hall.w2.tray_' + wrong);
    const w = await state();
    await play('hall.w2.tray_' + right);
    const r = await state();
    steps.push({ g, right, wrongHeld: w.held, wrongTray: w.trays[wrong], after: r.trays[right], path: r.path[g], held: r.held });
    ok(J(w.held) === J([g]) && w.trays[wrong].length === 1 && w.path[g].length === 1 && J(r.held) === '[]' && r.path[g].length === 0 &&
      Object.keys(r.trays).every((t) => one(t)(r)) && r.trays[right][0][0] === 'hall_tray' && r.trays[right][0][1] === g && r.trays[right][0][2] === 'hall.w2.tray_' + right && r.trays[right][0][3],
      'pattern ' + pat + ', the ' + g + ' gift: a wrong tray keeps it held; the right one (' + right + ') takes it, gone from the path and on that tray, one prop a tile, same scene, solid (' + J(steps[steps.length - 1]) + ')');
  }
  const f3 = await foot();
  ok(whole(f3), 'pattern ' + pat + ', all three delivered: each tray\'s two tiles still solid, each still opening its tray (' + J(f3) + ')');
}

// ---- 3. how the tray with its gift is drawn --------------------------------------------------------------------------------
{
  const D = await p.evaluate(() => {
    const P = RB.props.P, pal = RB.tiles.PAL.hall_w2;
    const px = (id, o) => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 96; const c = cv.getContext('2d'); P[id].draw2(c, 16, 48, pal, 0, o || {}); return c.getImageData(0, 0, 64, 96).data; };
    const base = px('table');
    // what the tray adds to the bare table: the pixels that differ from it, and how many of them are the gift's paper
    // (pale) or cloth (red)
    const look = (id, o) => {
      if (!P[id]) return { missing: id }; // (a build without the tray: the check fails, it does not throw)
      const d = px(id, o);
      let pale = 0, red = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] === base[i] && d[i + 1] === base[i + 1] && d[i + 2] === base[i + 2] && d[i + 3] === base[i + 3]) continue;
        if (d[i + 3] < 250) continue;
        n++; if (d[i] > 200 && d[i + 1] > 200 && d[i + 2] > 190) pale++; if (d[i] > d[i + 1] + 50 && d[i] > d[i + 2] + 50) red++;
      }
      const fills = [];
      const fc = new Proxy({ fillStyle: '' }, { get: (o2, k) => (k === 'fillRect' ? (x, y, w, h) => fills.push(String(o2.fillStyle).toLowerCase()) : k in o2 ? o2[k] : () => {}), set: (o2, k, v) => { o2[k] = v; return true; } });
      P[id].draw(fc, 0, 0, pal, 0, o || {});
      return { n, pale, red, flat: fills.length, paleFlat: fills.filter((f) => f === '#e4e2dc').length };
    };
    return { table: look('table'), white: look('hall_tray', { gift: 'white' }), red: look('hall_tray', { gift: 'red' }), chestnut: look('hall_tray', { gift: 'chestnut' }) };
  });
  ok(!D.white.missing && D.table.n === 0 && D.white.n > 150 && D.white.pale / D.white.n > 0.3 && D.red.n > 150 && D.red.red / D.red.n > 0.5 && D.chestnut.n > 150 && D.white.flat > D.table.flat && D.white.paleFlat > 0,
    'the tray with its gift: the table and the gift on it (the white box\'s paper, the bundle\'s cloth, the basket), drawn and flat (' + J(D) + ')');
}

// ---- 4. a save and load; the floor reset ------------------------------------------------------------------------------------
{
  await begin(0);
  await play('hall.w2.g_white'); await play('hall.w2.tray_mother');
  await p.evaluate(async () => { await RB.save.manualSave(1); });
  await p.evaluate(async () => { RB.game.s.flags.xp_hall_w2_f0_put_white = false; delete RB.game.s.flags.xp_hall_w2_f0_put_white; await RB.game.loadCampaign(1, 'manual'); });
  await p.waitForTimeout(800);
  const L = await state();
  ok(L.trays.mother.length === 1 && L.trays.mother[0][0] === 'hall_tray' && L.trays.mother[0][1] === 'white' && L.path.white.length === 0, 'saved and loaded with the white box on its tray: still on it (' + J(L.trays.mother) + ')');
  const fl = await foot();
  ok(whole(fl), 'and its whole footprint after the load: each tray\'s two tiles solid, each opening its tray (' + J(fl) + ')');
  await p.evaluate(() => RB.hall.resetFloor(RB.game.s, 'w2', 0));
  const R = await state();
  const fr = await foot();
  ok(whole(fr), 'the floor reset: each tray\'s two tiles solid, each opening its tray (' + J(fr) + ')');
  ok(Object.values(R.trays).every((x) => x.length === 1 && x[0][0] === 'table') && GIFTS.every((g) => R.path[g].length === 1) && !R.told && !R.held.length,
    'the floor reset: the trays bare, the gifts back on the path, nothing held, the note to be said again (' + J(R) + ')');
}
ok(!errors.length, 'no page errors (' + J(errors).slice(0, 300) + ')');
await ctx.close(); await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
