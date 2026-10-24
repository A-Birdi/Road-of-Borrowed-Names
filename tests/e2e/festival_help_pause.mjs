// RBN-QA-169 (Agnes 6379506036, 6379628204; Local CL-263, CL-264; Cloud CC-161 §3): the festival's help said the clock
// stops "while a hint is open", but water-balloon fishing's Hint and ring toss's "What does it say?" stop it for up to
// 2.5 seconds and the clock then runs again with the clue still shown; the other three games have no help that pauses.
// The words now say what the timer does; the timing is unchanged. In Chromium on the built game, a throwaway journey
// with Suzu, the festival's games open:
//  1. the words: the corner's Timed label names the pausing help and its 2.5 seconds in those two games only, and the
//     other three say nothing of a pause; the Pastimes how-to line says the same in both languages; nothing says
//     "while a hint is open";
//  2. water-balloon fishing, timed: Hint stops the clock (shown "stopped"), for about 2.5 s, then it runs again with
//     the clue still shown and the Hint button off (one hint per balloon); a wrong balloon leaves the clue and the
//     clock running; the right one clears it and Hint is on again;
//  3. the pause is balanced: a right balloon inside the 2.5 s resumes the clock once (the count back at 0, never below);
//     leaving inside it, the next timed round starts with the clock running; a round whose clock runs out after a hint
//     keeps its best in the same record shape;
//  4. ring toss, timed: "What does it say?" stops the clock about 2.5 s, then it runs again, the English still shown;
//     one stop at a time (before, every press stopped it again, so pressing held it): pressed again and again during
//     a stop, the English shown again, the stop neither deepened nor lengthened; a ring thrown during it, the clock
//     runs again once at its end; left during it and a new round begun, the old stop's timer never resumes the new
//     round (its own stop runs its full 2.5 s); once a stop is over, another press stops the clock again (allowed);
//  5. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/festival_help_pause.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const fmt = (o) => JSON.stringify(o);
const errorsAll = [];

const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.evaluate(async () => {
  const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'suzu', flags: { departed: true, pt_festival: true } });
  s.edition = 2; s.player.nameJp = 'ハル';
  RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
  RB.save.autosave = async () => {};
  await new Promise((r) => setTimeout(r, 400));
});
const wait = (ms) => p.waitForTimeout(ms);
const open = async (game, seconds) => {
  await p.evaluate(([game, seconds]) => { if (seconds) RB.festival.get(game).seconds = seconds; window.__fv = RB.activity.launch('festival', { source: 'distractions', game }); }, [game, seconds || null]);
  await p.waitForSelector('.fv-folio [data-a="begin"]');
};
// Leave: from a round back to its corner, from the corner out of the festival
const leave = async () => {
  for (let i = 0; i < 3 && (await p.evaluate(() => !!document.querySelector('.fv-folio'))); i++) {
    await p.evaluate(() => { const c = document.querySelector('.fv-folio [data-folio-close]'); if (c) c.click(); });
    await wait(500);
  }
};
const fs = () => p.evaluate(() => RB.ui.festival.state());
const yo = () => p.evaluate(() => JSON.parse(JSON.stringify(RB.ui.festivalGames.yoyo.state())));
const hook = async (right) => {
  const st = await yo();
  const bal = right ? st.tub.find((x) => x.en === st.target.en) : st.tub.find((x) => x.en !== st.target.en);
  await p.evaluate((id) => document.querySelector('.fv-balloon[data-b="' + id + '"]').click(), bal.id);
};
const ui = () => p.evaluate(() => ({ hint: !!document.querySelector('.fv-hint'), hintOff: !!(document.querySelector('[data-y="hint"]') || {}).disabled, clock: (document.querySelector('.fv-clock') || {}).textContent || '', say: (document.querySelector('.fv-say') || {}).textContent || '' }));

// ---- 1. the words
{
  const labels = {};
  for (const g of ['yoyo', 'wanage', 'katanuki', 'kuji', 'taiko']) {
    await open(g);
    labels[g] = await p.evaluate(() => (document.querySelector('input[name="fv-mode"][value="timed"]').closest('label') || {}).textContent || '');
    await leave();
  }
  const pauseIn = (t) => /clock stops|2\.5 seconds/.test(t);
  ok(/up to 2\.5 seconds when you press Hint, then runs again; the clue stays shown/.test(labels.yoyo) && /up to 2\.5 seconds when you press "What does it say\?", then runs again; its English stays shown/.test(labels.wanage) &&
    !pauseIn(labels.katanuki) && !pauseIn(labels.kuji) && !pauseIn(labels.taiko) && !Object.values(labels).some((t) => /while a hint is open/.test(t)),
    'the corner\'s Timed label: the pausing help and its 2.5 seconds in water-balloon fishing and ring toss only (' + fmt(labels) + ')');
  const how = await p.evaluate(() => { const d = RB.pastimes && RB.pastimes.get ? RB.pastimes.get('festival') : null; return d ? d.howto.map((h) => ({ en: h.en, jp: h.jp })) : null; });
  ok(how && how.some((h) => /water-balloon fishing or ring toss, Hint or "What does it say\?" stops the clock for up to 2\.5 seconds, then it runs again\. The clue can stay on screen after that\./.test(h.en) && /ヨーヨー/.test(h.jp) && /What does it say\?/.test(h.jp)) &&
    !how.some((h) => /while a hint is open/.test(h.en)), 'the Pastimes how-to line says the same in both languages (' + fmt(how) + ')');
}
// ---- 2. water-balloon fishing, timed
{
  await open('yoyo', 60);
  await p.click('input[name="fv-mode"][value="timed"]');
  await p.click('[data-a="begin"]');
  await p.waitForSelector('.fv-clock');
  await wait(400);
  await p.click('[data-y="hint"]');
  await wait(300); // (the clock's text is drawn every 200 ms)
  const a = await fs(), ua = await ui();
  await wait(1000);
  const m = await fs();
  await wait(1900);
  const z = await fs(), uz = await ui();
  await wait(800);
  const z2 = await fs();
  ok(a.paused === 1 && /stopped/.test(ua.clock) && Math.abs(m.left - a.left) < 300 && z.paused === 0 && z2.left < z.left - 400 && uz.hint && uz.hintOff,
    'Hint: the clock stopped (shown so) about 2.5 s, then running again with the clue still shown and Hint off (' + fmt({ a: [a.paused, a.left, ua.clock], m: m.left, z: [z.paused, z.left], z2: z2.left, uz }) + ')');
  await hook(false);
  await wait(300);
  const w = await fs(), uw = await ui();
  await hook(true);
  await wait(300);
  const r = await fs(), ur = await ui();
  ok(w.paused === 0 && uw.hint && r.paused === 0 && !ur.hint && !ur.hintOff, 'a wrong balloon leaves the clue and the clock running; the right one clears it, Hint on again (' + fmt({ w: w.paused, uw, r: r.paused, ur }) + ')');
  // ---- 3. balanced: hooked inside the pause
  await p.click('[data-y="hint"]');
  await wait(300);
  const h = await fs();
  await hook(true);
  await wait(200);
  const h2 = await fs();
  await wait(2800);
  const h3 = await fs();
  ok(h.paused === 1 && h2.paused === 0 && h3.paused === 0, 'the right balloon inside the 2.5 s: the clock runs again at once, and only once (' + fmt([h.paused, h2.paused, h3.paused]) + ')');
  // leaving inside the pause
  await p.click('[data-y="hint"]');
  await wait(300);
  await leave();
  await open('yoyo', 60);
  await p.click('input[name="fv-mode"][value="timed"]');
  await p.click('[data-a="begin"]');
  await p.waitForSelector('.fv-clock');
  const n0 = await fs();
  await wait(3200);
  const n1 = await fs();
  ok(n0.paused === 0 && n1.paused === 0 && n1.left < n0.left - 2500, 'left during the pause: the next timed round starts with the clock running, and nothing from the last stops it (' + fmt({ n0, n1 }) + ')');
  await leave();
  await leave();
}
// ---- 4. ring toss, timed
{
  await open('wanage', 60);
  await p.click('input[name="fv-mode"][value="timed"]');
  await p.click('[data-a="begin"]');
  await p.waitForSelector('.fv-clock');
  await wait(400);
  await p.click('[data-w="en"]');
  const a = await fs(), ua = await ui();
  await wait(1200);
  const m = await fs();
  await wait(2000);
  const z = await fs(), uz = await ui();
  await wait(800);
  const z2 = await fs();
  ok(a.paused === 1 && Math.abs(m.left - a.left) < 300 && z.paused === 0 && z2.left < z.left - 400 && uz.say && uz.say === ua.say,
    '"What does it say?": the clock stopped about 2.5 s, then running again, the English still shown (' + fmt({ a: [a.paused, a.left], m: m.left, z: [z.paused, z.left], z2: z2.left, say: uz.say }) + ')');
  await leave();
}
// ---- 4b. ring toss: one stop at a time, its timer the round's own
{
  const press = () => p.evaluate(() => document.querySelector('[data-w="en"]').click());
  const timedWanage = async () => { await p.click('input[name="fv-mode"][value="timed"]'); await p.click('[data-a="begin"]'); await p.waitForSelector('.fv-clock'); await wait(400); };
  await open('wanage', 60);
  await timedWanage();
  // pressed again and again during one stop
  await press();
  const r0 = await fs();
  const depths = [];
  for (let i = 0; i < 5; i++) { await wait(200); await press(); depths.push((await fs()).paused); }
  await wait(1700); // (about 2.9 s after the first press)
  const r1 = await fs();
  await wait(600);
  const r2 = await fs();
  ok(r0.paused === 1 && depths.every((d) => d === 1) && r1.paused === 0 && r2.left < r1.left - 300,
    'pressed again and again during a stop: never deeper than one, and the clock runs again at the first press\'s 2.5 s, not later (' + fmt({ depths, r0: r0.paused, r1: r1.paused, left: [r1.left, r2.left] }) + ')');
  // a ring thrown during the stop
  await press();
  await wait(300);
  const st = await p.evaluate(() => RB.ui.festivalGames.wanage.state());
  await p.evaluate((i) => document.querySelector('.fv-peg[data-w="' + i + '"]').click(), st.row.indexOf(st.target));
  await wait(1000);
  const t1 = await fs();
  await wait(1700);
  const t2 = await fs();
  ok(t1.paused === 1 && t2.paused === 0, 'a ring thrown during the stop: the clock runs again once at the stop\'s end (' + fmt([t1.paused, t2.paused]) + ')');
  // left during a stop, a new round begun: the old timer does not resume the new round
  await press();
  await wait(300);
  await p.evaluate(() => { const c = document.querySelector('.fv-folio [data-folio-close]'); if (c) c.click(); }); // (back to the corner)
  await wait(300);
  await timedWanage(); // (about 1.0 s after the old press)
  const n0 = await fs();
  await press();
  await wait(1900); // (the old press's 2.5 s has passed; the new press's has not)
  const n1 = await fs();
  await wait(1000);
  const n2 = await fs();
  ok(n0.paused === 0 && n1.paused === 1 && n2.paused === 0, 'left during a stop and a new round begun: the old timer leaves the new round alone; the new stop runs its own 2.5 s (' + fmt([n0.paused, n1.paused, n2.paused]) + ')');
  // once a stop is over, another press stops the clock again
  await press();
  await wait(300);
  const a1 = await fs();
  await wait(2600);
  const a2 = await fs();
  ok(a1.paused === 1 && a2.paused === 0, 'once a stop is over, another press stops the clock again for its 2.5 s (allowed: one at a time, not one per prize) (' + fmt([a1.paused, a2.paused]) + ')');
  await leave();
}
// ---- 3, last: a round run out after a hint keeps its best in the same shape
{
  // a round run out after a hint keeps its best in the same shape
  await open('yoyo', 4);
  await p.click('input[name="fv-mode"][value="timed"]');
  await p.click('[data-a="begin"]');
  await p.waitForSelector('.fv-clock');
  await hook(true);
  await p.click('[data-y="hint"]');
  await p.waitForSelector('.fv-over', { timeout: 20000 }).catch(() => {});
  const rec = await p.evaluate(() => JSON.parse(JSON.stringify((RB.game.s.practice.festival.games || {}).yoyo || null)));
  ok(rec && Object.keys(rec).sort().join() === 'best,bestStreak,last,timed' && rec.best >= 1, 'a round run out after a hint keeps its best, the record in its usual shape (' + fmt(rec) + ')');
  await leave();
}
errorsAll.push(...errors);
ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await ctx.close();
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
