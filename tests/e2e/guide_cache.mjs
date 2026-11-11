// The quest guide's cache, in Chromium (CC-541 finding 1; Local CL-708 and CL-711; Agnes 6650249477). The guide kept
// its answers under a signature that counted flags, so gate B's seal (which clears lf_east_open and sets lf_gate_b)
// left plate B marked in the Gate Works; and nothing cleared the cache when another journey was loaded. On the built
// game, on throwaway journeys (never a real save), at lf_main step 7 in the bell tower with gate A done and the Gate
// Works drained, reading the Journey's followed quest (its "Next" lines), the world markers and the guide's targets:
//  1. the seal, played: beside the east door's handle with the door open, the Journey names the Gate Works and plate B
//     is marked; Z on the handle, "Close the door" chosen, the scene played out; then, without a step taken, the
//     Journey names the Drowned Stair and the guide plate C, and plate B is no longer marked;
//  2. two saves that differ only in those two flags (every count the same), loaded one after the other through the
//     game's own load: each journey gets its own answer (plate B, then plate C, then plate B again);
//  3. no page errors, no network.
// Usage: node tools/build.mjs && node tests/e2e/guide_cache.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const BASE = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, lf_arrived: true, lf_town_intro: true, lf_yae_told: true, lf_tokuji_told: true,
  lf_tokuji_boat: true, lf_akari_key: true, lf_stacks_open: true, lf_ledger_seen: true, lf_conduit_seen: true, lf_tower_entered: true,
  lf_gate_a: true, lf_mid_seen: true, lf_shortcut: true, lf_mid_drained: true, lf_plate_b_read: true };
const OPEN = Object.assign({ lf_east_open: true }, BASE), SEALED = Object.assign({ lf_gate_b: true }, BASE);

// a throwaway journey at step 7, the east door opened earlier through its own scene (lf.east_door seen)
async function at(p, x, y, dir, flags) {
  await p.evaluate(async ([x, y, dir, flags]) => {
    const s = RB.game.debugStart('lf.tower_mid', x, y, { edition: 2, comp: 'nao', dir, flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.state.setQuest(s, 'lf_main', 7);
    s.seen['lf.east_door'] = true;
    for (const q in s.quests) s.quests[q].t = 1;
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.questGuide.reset(); RB.questMarks.refresh();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
  }, [x, y, dir, flags]);
}
// the Journey's followed quest ("Next" lines), the markers on this map and the guide's targets (as the tower's test)
async function journey(p) {
  await p.evaluate(() => { if (RB.ui.menu.isOpen()) RB.ui.menu.close(); RB.ui.menu.open('journal'); });
  await p.waitForSelector('.qguide', { timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(150);
  const j = await p.evaluate(() => ({
    fol: (document.querySelector('button.entry.followed') || {}).dataset ? document.querySelector('button.entry.followed').dataset.q : null,
    next: [...document.querySelectorAll('.qnext .nline')].map((e) => e.textContent.trim()),
  }));
  await p.evaluate(() => RB.ui.menu.close());
  await p.waitForTimeout(400);
  Object.assign(j, await p.evaluate(() => ({
    marks: RB.questMarks.marks().marks.map((m) => m.kind + ':' + (m.id || m.target || '') + (m.tx != null ? '@' + m.tx + ',' + m.ty : '')),
    targets: RB.questGuide.targets('lf_main').targets.map((t) => t.map + ':' + (t.id || t.p || t.kind) + (t.x != null ? '@' + t.x + ',' + t.y : '')),
    map: RB.world.W.map.id, pc: [RB.world.W.player.x, RB.world.W.player.y],
  })));
  return j;
}
const B = (j) => j.next.some((l) => /in Gate Works/.test(l)) && flat(j.targets) === flat(['lf.tower_mid:lf_plate@9,3']) && j.marks.some((m) => /^target:lf_plate/.test(m));
const C = (j) => j.next.some((l) => /in Drowned Stair/.test(l)) && flat(j.targets) === flat(['lf.tower_low:lf_plate@3,2']) && !j.marks.some((m) => /^target:lf_plate/.test(m));
const show = (j) => flat({ map: j.map, pc: j.pc, next: j.next, marks: j.marks, targets: j.targets });
const look = () => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return { d: d ? String(d.en || '') : null, run: RB.script.isRunning(), mode: RB.game.mode(),
  choices: [...document.querySelectorAll('.choices:not(.hidden) button.choice')].map((e) => e.textContent.trim()) }; };
// play out the scene: each line advanced; at a reply, the one asked for clicked. The lines and replies shown.
async function play(p, reply) {
  const seen = [];
  for (let i = 0; i < 300; i++) {
    const st = await p.evaluate(look);
    if (st.choices.length) {
      seen.push('[' + st.choices.join(' / ') + ']');
      await p.evaluate((reply) => { const bt = [...document.querySelectorAll('.choices:not(.hidden) button.choice')].find((e) => e.textContent.includes(reply)); if (bt) bt.click(); }, reply);
      await p.waitForTimeout(250);
      continue;
    }
    if (st.d) { if (seen[seen.length - 1] !== st.d) { seen.push(st.d); await p.waitForTimeout(100); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); } await p.waitForTimeout(80); continue; }
    if (!st.run && st.mode === 'world' && (seen.length || i > 6)) break;
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(500);
  return seen;
}

const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });

// 1. the seal, played
await at(p, 19, 8, 'right', OPEN);
const j1 = await journey(p);
ok(j1.fol === 'lf_main' && B(j1), '1 beside the east door\'s handle, the door open: the Gate Works named, plate B marked ' + show(j1));
await p.evaluate(() => { RB.world.W.player.dir = 'right'; });
await p.keyboard.press('KeyZ');
await p.waitForTimeout(300);
const lines = await play(p, 'Close the door');
const fl = await p.evaluate(() => ({ open: !!RB.game.s.flags.lf_east_open, b: !!RB.game.s.flags.lf_gate_b }));
const j2 = await journey(p);
ok(!fl.open && fl.b && lines.some((l) => /heavy bar drops into place/.test(l)) && j2.map === 'lf.tower_mid' && flat(j2.pc) === '[19,8]' && C(j2),
  '1 Z on the handle, "Close the door", the scene played out; not a step taken: the Drowned Stair named, the guide on plate C, plate B no longer marked ' +
  flat({ lines, flags: fl, after: show(j2) }));

// 2. two saves differing only in those two flags, loaded one after the other
const keyOf = () => {
  const s = RB.game.s, on = (o) => Object.keys(o).filter((k) => o[k]);
  return { map: s.map, quests: s.quests, flags: on(s.flags).length, seen: on(s.seen).sort(), words: s.words, inv: s.inv, vars: s.vars, comp: s.comp, ch: s.chapter, prof: s.learn && s.learn.profile };
};
await at(p, 10, 4, 'down', SEALED);
const k2 = await p.evaluate(keyOf);
await p.evaluate(async () => { await RB.test.idle(); await RB.save.manualSave(2); });
await at(p, 10, 4, 'down', OPEN);
const k1 = await p.evaluate(keyOf);
await p.evaluate(async () => { await RB.test.idle(); await RB.save.manualSave(1); });
ok(flat(k1) === flat(k2), '2 the two saves: the same map, quests, number of flags set, scenes seen, words, items, vars, companion, chapter and profile ' + flat({ flags: [k1.flags, k2.flags], same: flat(k1) === flat(k2) }));
const loadSlot = (p, slot) => p.evaluate(async (slot) => {
  await RB.test.idle();
  await RB.game.loadCampaign(slot, 'manual');
  await new Promise((r) => setTimeout(r, 900));
  await RB.test.idle();
  RB.questMarks.refresh();
  return { open: !!RB.game.s.flags.lf_east_open, b: !!RB.game.s.flags.lf_gate_b };
}, slot);
const l1 = await loadSlot(p, 1);
const s1 = await journey(p);
const l2 = await loadSlot(p, 2);
const s2 = await journey(p);
const l3 = await loadSlot(p, 1);
const s3 = await journey(p);
ok(l1.open && !l1.b && B(s1), '2 the save with the door open, loaded: plate B ' + show(s1));
ok(!l2.open && l2.b && C(s2), '2 then the sealed save, loaded: plate C, the Drowned Stair named ' + show(s2));
ok(l3.open && !l3.b && B(s3), '2 then the open one again: plate B ' + show(s3));

ok(!errors.length && !requests.length, '3 no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : '') + (requests.length ? ' ' + requests.slice(0, 2).join(' | ') : ''));
await ctx.close();
console.log(`\nguide_cache: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
