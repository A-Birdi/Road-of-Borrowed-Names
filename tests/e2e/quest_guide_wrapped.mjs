// The Quest Guide audit around "Have you seen…?" (Robin's review): a focused reproduction of the one miss the
// whole-game audit listed, sb_lamp 2→3 at Snowbell's post hut, and its controls. In the built index.html.
// The way there is played, not set: Cinder Orchard's end (tests/fixtures/campaign/F-ren-ch3_done.json, continued
// from the title) → the test driver plays Snowbell until sb_lamp reaches stage 1 (Yae at the inn) → the player talks
// to Sōsuke once (his greeting: his own conversation has then been seen, and a person who can be asked after others
// answers through "Have you seen…?" from then on, src/engine/50_world.js talkTo) → the driver on until stage 2
// (Hoshino sends you to Sōsuke). That state starts every case, each in its own fresh browser context; the player is
// put beside Sōsuke by the test (the map and the tile), and the talk itself is the Enter key.
// The audit's own hook (tests/e2e/guide_audit_hook.mjs) records each case:
//  A. Talk chosen: the sequence written out (the guidance's target, the person talked to, the wrapper, the menu and
//     what was chosen, every scene run inside it with the quest's stage before and after, the transition); the move
//     must be put down to Sōsuke's own conversation, sb.sousuke, and judged a hit;
//  B. the negative control: the guidance's answer replaced by a target elsewhere (Hoshino at the observatory house),
//     the same Talk: the same move must be a miss;
//  C. "Have you seen…?" chosen instead: Sōsuke's conversation does not run, the quest does not move, nothing is
//     credited to the conversation the wrapper was handed but did not run;
//  D. the verdict on records made up for it (a logic check, labelled as such): the right person's conversation a hit;
//     the same scene from another person, a move inside the wrapper itself, and the right person on another map, misses.
// Usage: node tests/e2e/quest_guide_wrapped.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { install } from './drive.mjs';
import { installAudit } from './guide_audit_hook.mjs';

const FX = 'tests/fixtures/campaign/F-ren-ch3_done.json';
const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const wait = (p, ms) => p.waitForTimeout(ms);

async function journey(st) {
  const r = await page(b, url);
  const { p } = r;
  await p.evaluate(async (st) => { await RB.save.writeSlot(1, st, { force: true }); }, st);
  await p.reload(); await p.waitForFunction(() => window.__RB_READY__ === true);
  await p.waitForSelector('.title [data-a=continue]:not(.hidden)');
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => RB.game.mode() === 'world' && !document.querySelector('.title'), null, { timeout: 20000 });
  await p.evaluate(() => { RB.game.settings.textSpeed = 'instant'; });
  for (let i = 0; i < 30 && await p.evaluate(() => RB.ui.dialogue.isOpen() || RB.game.mode() !== 'world'); i++) { await p.keyboard.press('Enter'); await wait(p, 100); }
  return r;
}
// beside Sōsuke in the post hut, facing him (the test's placement: next to him, or across the counter he stands
// behind), then Enter; the first place from which Enter starts a conversation
async function talkToSousuke(p) {
  const spots = await p.evaluate(async () => {
    if (RB.world.W.map.id !== 'sb.post') await RB.test.go('sb.post', 7, 5, 'up');
    const W = RB.world.W, n = W.npcs.find((a) => a.id === 'sousuke');
    if (!n) return null;
    const free = (x, y) => !RB.maps.blockedStatic(W.map, x, y) && !RB.maps.exitAt(W.map, x, y) && !W.npcs.some((a) => a.x === x && a.y === y);
    const out = [];
    for (const k of [1, 2]) for (const [dx, dy, dir] of [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down']]) {
      const x = n.x + dx * k, y = n.y + dy * k;
      if (free(x, y)) out.push({ x, y, dir, across: k === 2 });
    }
    return { npc: [n.x, n.y], out };
  });
  if (!spots || !spots.out.length) throw new Error('cannot stand by Sōsuke: ' + JSON.stringify(spots));
  // (a scene started counts, even one over before it is looked at: an automated conversation can end in milliseconds)
  await p.evaluate(() => {
    if (window.__starts != null) return;
    window.__starts = 0;
    const o = RB.script.run;
    RB.script.run = function (id, c) { if (!RB.script.isRunning()) window.__starts++; return o.call(this, id, c); };
  });
  for (const at of spots.out) {
    const n0 = await p.evaluate((at) => { RB.test.place(at.x, at.y, at.dir); return window.__starts; }, at);
    await p.keyboard.press('Enter');
    await wait(p, 300);
    if (await p.evaluate((n0) => window.__starts > n0, n0)) {
      await p.evaluate(() => RB.test.idle(60000));
      return Object.assign({ npc: spots.npc }, at);
    }
  }
  throw new Error('Enter started nothing from beside Sōsuke: ' + JSON.stringify(spots));
}

// ---- the way there, played
const start = JSON.parse(fs.readFileSync(path.join(root, FX), 'utf8'));
let st2;
{
  const { p, ctx, errors } = await journey(start);
  await p.evaluate(install);
  const one = await p.evaluate(async () => {
    RB.test.enable({ battle: 'unravel', choose: () => 0 });
    const r = await RBDrive.pursue('-', { prefix: 'sb.', main: 'sb_lamp', until: 'quest.sb_lamp>=1', max: 300 });
    await RB.test.idle(60000);
    return { ok: r.ok, steps: r.steps, stage: RB.game.s.quests.sb_lamp && RB.game.s.quests.sb_lamp.stage, seen: !!RB.game.s.seen['sb.sousuke'], map: RB.world.W.map.id };
  });
  if (!one.ok || one.stage !== 1) throw new Error('the driver did not stop at sb_lamp 1: ' + JSON.stringify(one));
  if (!one.seen) await talkToSousuke(p);
  const two = await p.evaluate(async () => {
    const r = await RBDrive.pursue('-', { prefix: 'sb.', main: 'sb_lamp', until: 'quest.sb_lamp>=2', max: 300 });
    await RB.test.idle(60000);
    RB.test.disable();
    const s = RB.game.s;
    return { ok: r.ok, steps: r.steps, stage: s.quests.sb_lamp.stage, seen: !!s.seen['sb.sousuke'], followed: RB.questGuide.followed(s), map: RB.world.W.map.id, state: JSON.parse(JSON.stringify(s)) };
  });
  ok(two.ok && two.stage === 2 && two.seen && two.followed === 'sb_lamp', 'played to sb_lamp stage 2 with Sōsuke met once (' + JSON.stringify({ firstLeg: one.steps, secondLeg: two.steps, stage: two.stage, seenSousuke: two.seen, followed: two.followed, map: two.map }) + ')');
  ok(!errors.length, 'no page errors on the way');
  st2 = two.state;
  await ctx.close();
  if (fail) { await b.close(); srv.close(); process.exit(1); }
}

// ---- a case: the start state in a fresh context, the audit's hook, a choice rule for menus, Enter beside Sōsuke
async function scene(label, hookOpts, pick) {
  const { p, ctx, errors } = await journey(st2);
  await p.evaluate(installAudit, hookOpts || {});
  await p.evaluate((pick) => {
    window.__menus = [];
    RB.test.enable({ battle: 'unravel', choose: (opts) => {
      const en = opts.map((o) => o.en);
      let i = 0;
      if (en.includes('Have you seen…?')) i = Math.max(0, en.indexOf(pick));
      window.__menus.push({ options: en, chose: en[i] });
      return i;
    } });
  }, pick);
  const before = await p.evaluate(() => ({ stage: RB.game.s.quests.sb_lamp.stage, target: RB.questGuide.targets('sb_lamp', RB.game.s).targets.map((t) => t.map + ':' + t.kind + ':' + (t.id || t.p) + ' ' + (t.opts || []).map((o) => o.scene).join('/')) }));
  const at = await talkToSousuke(p);
  const out = await p.evaluate(() => ({ audit: window.__qgAudit, menus: window.__menus, stage: RB.game.s.quests.sb_lamp.stage }));
  console.log('-- ' + label + ': guidance before ' + JSON.stringify(before.target) + '; stood at ' + JSON.stringify(at) + '; menus ' + JSON.stringify(out.menus));
  for (const r of out.audit) console.log('   record: ' + JSON.stringify({ started: r.started, npc: r.npc, talk: r.talk, runs: r.runs, move: r.none ? 'none' : r.from + '→' + r.to, at: r.at, hit: r.hit, targets: r.targets }));
  await ctx.close();
  return { before, out, errors };
}

// A. Talk
{
  const { before, out, errors } = await scene('A, Talk', {}, 'Talk');
  const r = out.audit.find((x) => x.started === 'wb.ask');
  ok(before.stage === 2 && before.target.some((t) => t.startsWith('sb.post:npc:sousuke ') && t.includes('sb.sousuke')), 'A: the guidance points at Sōsuke in the post hut, his conversation sb.sousuke (' + before.target.join('; ') + ')');
  ok(r && r.npc === 'sousuke' && r.talk === 'sb.sousuke', 'A: talking to him started the wrapper wb.ask for Sōsuke, handed sb.sousuke');
  ok(out.menus.some((m) => m.options.join('|') === 'Talk|Have you seen…?|Never mind' && m.chose === 'Talk'), 'A: the wrapper offered Talk, Have you seen…?, Never mind; Talk was chosen');
  ok(r && r.runs.length === 1 && r.runs[0].scene === 'sb.sousuke' && r.runs[0].npc === 'sousuke' && r.runs[0].from === 2 && r.runs[0].to === 3, 'A: inside it, Sōsuke\'s own conversation ran and moved sb_lamp 2→3 (' + JSON.stringify(r && r.runs) + ')');
  ok(r && !r.none && r.from === 2 && r.to === 3 && r.at.scene === 'sb.sousuke' && r.at.npc === 'sousuke' && r.at.via === 'wb.ask' && out.stage === 3, 'A: the move is put down to that conversation');
  ok(r && r.hit === true, 'A: judged a hit');
  ok(!errors.length, 'A: no page errors');
}
// B. the negative control: the same move, the guidance pointing elsewhere
{
  const { out, errors } = await scene('B, control', { wrongAt: { map: 'sb.hoshino', kind: 'npc', id: 'hoshino', scene: 'sb.hoshino' } }, 'Talk');
  const r = out.audit.find((x) => x.started === 'wb.ask');
  ok(r && r.from === 2 && r.to === 3 && r.at.scene === 'sb.sousuke' && r.hit === false, 'B: with the guidance pointing at Hoshino instead, the same move is a miss');
  ok(!errors.length, 'B: no page errors');
}
// C. Have you seen…? instead of Talk
{
  const { out, errors } = await scene('C, Have you seen…?', {}, 'Have you seen…?');
  const r = out.audit.find((x) => x.started === 'wb.ask');
  ok(out.menus.some((m) => m.chose === 'Have you seen…?'), 'C: Have you seen…? was chosen');
  ok(r && r.none && !r.runs.some((x) => x.scene === 'sb.sousuke') && out.stage === 2, 'C: Sōsuke\'s conversation did not run, the quest did not move, nothing credited (' + JSON.stringify(r && { runs: r.runs, none: r.none }) + ')');
  ok(!errors.length, 'C: no page errors');
}
// D. the verdict on made-up records
{
  const { p, ctx } = await page(b, url);
  await p.evaluate(installAudit, {});
  const v = await p.evaluate(() => {
    const J = window.__qgJudge, T = [{ map: 'sb.post', kind: 'npc', id: 'sousuke', scenes: ['sb.sousuke'] }], sc = ['sb.sousuke'];
    return {
      right: J({ at: { scene: 'sb.sousuke', npc: 'sousuke' }, scenes: sc, targets: T, map: 'sb.post' }),
      otherPerson: J({ at: { scene: 'sb.sousuke', npc: 'denji' }, scenes: sc, targets: T, map: 'sb.post' }),
      wrapperItself: J({ at: { scene: 'wb.ask', npc: 'sousuke' }, scenes: sc, targets: T, map: 'sb.post' }),
      otherMap: J({ at: { scene: 'sb.sousuke', npc: 'sousuke' }, scenes: sc, targets: T, map: 'sb.inn' }),
    };
  });
  ok(v.right === true && v.otherPerson === false && v.wrapperItself === false && v.otherMap === false, 'D (logic, made-up records): the right person\'s conversation a hit; another person, the wrapper itself, another map: misses (' + JSON.stringify(v) + ')');
  await ctx.close();
}
await b.close(); srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
