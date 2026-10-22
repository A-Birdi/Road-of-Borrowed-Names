// RBN-QA-090 (Agnes 6333542094, 6333547783, 6333579440, 6333673954, 6333706619; Local CL-170, CL-172; Cloud CC-091): in
// the Tidal Hollow the tide comes in over the root bridge and your companion is left on the far bank (ko_apart), but
// the scene refreshed only the people here, not your companion: they went on following you, and Company still talked
// to them; at the reunion they were only brought in as a passing speaker who walked off after, and nobody followed you
// until the next map. Now your companion steps back onto the north bank at the roar, calls across from there, is gone
// with the spray, and is placed with you again at the reunion before turning to you. In Chromium on the built game,
// for each companion, from the real trigger (you walk onto the bridge's last plank):
//  1. the split: on the bridge with you for the roar; on the north bank (15,9) for the look back and their call (before
//     the water is over the bridge); gone for the spray line; you step
//     down after it; then nobody follows you, no one of theirs is left as a passing figure, and asking them in Company
//     shows the reason ("isn't beside you here") on screen and plays nothing;
//  2. a save and load while apart: still apart (no follower, no figure);
//  3. the reunion (from the real trigger, once the hollows are reshaped): your companion is here, the one figure, from
//     the first line, turns to you, and follows you after it; Company talks with them again; the quest goes on; who
//     your companion is, their equipment, resolve and bonds, your pet and your satchel are as before the split;
//  4. both scenes seen before and passed over with the dialogue's own "Skip seen" (Settings: offer to skip, on): the
//     split ends apart (you on the south bank, no follower, no figure, the quest at 5), the reunion ends together (the
//     follower beside you, the quest at 6), the same fields as before the split, and fast-forward off afterwards;
//  5. no page errors.
// Not covered here: a reload in the middle of either scene, a reload after the reunion, saves made before this fix.
// Usage: node tools/build.mjs && node tests/e2e/tide_split.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const PRE = ['ch1_done', 'ch2_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'departed'];
const KO = PRE.concat(['ko_ch9', 'ko_arrived', 'ko_otoha_met', 'ko_tell_otoha', 'ko_tell_nami', 'ko_tell_hamaji', 'ko_tell_shell', 'tell_ko.t_hall_ok', 'ko_hollow_open', 'ko_roots_seen', 'ko_root_a']);

async function step(p, key, n = 1) { for (let i = 0; i < n; i++) { await p.keyboard.down(key); await p.waitForTimeout(130); await p.keyboard.up(key); await p.waitForTimeout(380); } }
const look = () => {
  const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(), W = RB.world.W, s = RB.game.s;
  const mine = (a) => a.id === s.comp || (a.def && a.def.char === s.comp);
  return { d: d ? (d.who || '') + ': ' + String(d.en || '').slice(0, 50) : null, run: RB.script.isRunning(), pc: [W.player.x, W.player.y, W.player.dir],
    comp: W.comp ? [W.comp.x, W.comp.y, W.comp.dir] : null, figs: W.npcs.concat(W.extras, W.leavers).filter(mine).length };
};
async function play(p) {
  const beats = [];
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(look);
    if (st.d) { if (!beats.length || beats[beats.length - 1].d !== st.d) { beats.push(st); await p.waitForTimeout(150); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); } await p.waitForTimeout(90); continue; }
    if (!st.run && beats.length) break;
    await p.waitForTimeout(90);
  }
  await p.waitForTimeout(600);
  return beats;
}
// ask them what's on their mind from Company: a talk, or the reason on screen
async function askCompany(p) {
  await p.evaluate(() => RB.ui.menu.open('company'));
  await p.waitForTimeout(700);
  const r0 = await p.evaluate(() => { const k = document.querySelector('[data-co-act="mind"]'); if (!k) return { button: false }; k.click(); return { button: true }; });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const n = [...document.querySelectorAll('.notice')].find((x) => /isn't beside you here/.test(x.textContent));
    let shown = false;
    // on top at its centre (while a book is open notices take no clicks, body.in-panel: hit-testing is turned on for
    // this check only, so what is found is what is painted there)
    if (n) { const rc = n.getBoundingClientRect(), pe = n.style.pointerEvents; n.style.pointerEvents = 'auto'; const top = document.elementFromPoint(rc.left + rc.width / 2, rc.top + rc.height / 2); n.style.pointerEvents = pe; shown = rc.width > 0 && rc.height > 0 && !!top && (top === n || n.contains(top)); }
    return { notice: !!n, shown, text: n && n.textContent, talk: RB.script.isRunning() || RB.ui.dialogue.isOpen() };
  });
  return Object.assign(r0, r);
}
// what the split and the reunion must leave as they were: who your companion is, equipment, resolve, bonds, your pet,
// your satchel
const kept = () => { const s = RB.game.s; return JSON.stringify({ comp: s.comp, party: RB.state.test(s, 'party'), equip: s.equip, resolve: s.resolve, bond: s.company && s.company.bond, pet: s.company && s.company.pet, inv: s.inv }); };
// a seen scene passed over with the dialogue's own "Skip seen" button at its first line
async function playSkip(p) {
  let skip = null, lines = 0;
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => ({ d: RB.ui.dialogue.isOpen(), run: RB.script.isRunning() }));
    if (st.d) {
      lines++;
      if (!skip) { skip = await p.evaluate(() => { const k = document.querySelector('.dlg .b-skip'); const vis = !!(k && k.offsetParent && !k.classList.contains('hidden')); if (vis) k.click(); return { vis, ff: RB.game.fastForward() }; }); await p.waitForTimeout(150); continue; }
      await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance());
      await p.waitForTimeout(90); continue;
    }
    if (!st.run && skip) break;
    await p.waitForTimeout(90);
  }
  await p.waitForTimeout(600);
  return { skip, lines, ff: await p.evaluate(() => RB.game.fastForward()) };
}
async function closeAll(p) {
  for (let i = 0; i < 80; i++) {
    const st = await p.evaluate(() => ({ run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode() }));
    if (!st.run && !st.dlg && st.mode === 'world') return;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance());
    else if (st.mode === 'menu') await p.evaluate(() => RB.ui.menu.close && RB.ui.menu.close());
    await p.waitForTimeout(150);
  }
}

const errorsAll = [];
for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
  const { p, errors } = await page(b, url);
  await p.evaluate(([comp, KO]) => {
    const flags = {}; KO.forEach((f) => (flags[f] = true));
    const s = RB.game.debugStart('ko.roots2', 15, 10, { dir: 'down', edition: RB.edition.forNew(), comp, flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.state.setQuest(s, 'ko_main', 4);
    RB.game.settings.textSpeed = 'instant';
    // (how Suzu speaks is settled beforehand: a campaign loaded from a save, as below, asks it once after a scene in
    // which she speaks, src/ui/56_suzu_speech.js; that question is not this test's)
    RB.game.settings.suzuSpeech = 'standard';
    RB.world.enter('ko.roots2', 15, 10, 'down', { fresh: true });
    // (the bond milestones this journey's flags already earn, ch2_done to ch5_done, are awarded as after any scene,
    // 58_companion.js sync on story:settled, so that what is compared below starts from them)
    RB.bus.emit('story:settled', { mode: 'world' });
  }, [comp, KO]);
  await p.waitForTimeout(800);
  const start = await p.evaluate(look), keep0 = await p.evaluate(kept);
  // 1. the split, from the real trigger
  await step(p, 'ArrowDown', 2);
  const B = await play(p);
  const roar = B.find((x) => /low roar/.test(x.d)), back = B.find((x) => /look back/.test(x.d)), call = B.find((x) => /^(nao|mio|ren|suzu):/.test(x.d)), spray = B.find((x) => /spray/.test(x.d));
  const bank = (x) => x && x.comp && x.comp.join() === '15,9,down';
  ok(start.comp && roar && back && call && roar.comp && roar.comp[1] >= 10 && bank(back) && bank(call) && call.figs === 0, comp + ': with you on the bridge for the roar, then on the north bank (15,9) for the look back and their call across, the one figure (' + JSON.stringify({ start: start.comp, roar: roar && roar.comp, back: back && back.comp, call: call && call.comp }) + ')');
  ok(spray && !spray.comp && spray.figs === 0 && spray.pc[1] === 12, comp + ': gone for the spray line, before you step down (' + JSON.stringify(spray && { comp: spray.comp, pc: spray.pc }) + ')');
  const after = await p.evaluate(() => ({ pc: [RB.world.W.player.x, RB.world.W.player.y], apart: !!RB.game.s.flags.ko_apart, stage: RB.game.s.quests.ko_main.stage, here: RB.world.companionHere(RB.game.s, RB.world.W.map.def) }));
  await step(p, 'ArrowLeft', 2); await step(p, 'ArrowDown', 1);
  const walked = await p.evaluate(look);
  ok(after.pc.join() === '15,13' && after.apart && after.stage === 5 && !after.here && !walked.comp && walked.figs === 0 && walked.pc.join() !== '15,13,down',
    comp + ': you step down; then nobody follows you about and none of theirs is left standing here (' + JSON.stringify({ after, walked: { pc: walked.pc, comp: walked.comp, figs: walked.figs } }) + ')');
  const ask = await askCompany(p);
  ok(ask.button && ask.notice && ask.shown && !ask.talk, comp + ': Company, "Ask what\'s on their mind": the reason is shown on screen, and nothing is played (' + JSON.stringify(ask) + ')');
  await closeAll(p);
  // 2. a save and load while apart
  await p.evaluate(async () => { await RB.save.writeSlot(4, RB.game.s, { force: true }); await RB.game.loadCampaign(4); });
  await p.waitForTimeout(1200);
  const loaded = await p.evaluate(look);
  ok(!loaded.comp && loaded.figs === 0 && !loaded.run, comp + ': saved and loaded while apart: still apart (' + JSON.stringify(loaded) + ')');
  // 3. the reunion, once the hollows are reshaped
  await p.evaluate(() => { const s = RB.game.s; s.flags.ko_root_b = true; s.flags.ko_root_c = true; s.flags.ko_round_seen = true; RB.world.enter('ko.roots2', 3, 6, 'up', { fresh: true }); });
  await p.waitForTimeout(800);
  const before = await p.evaluate(look);
  await step(p, 'ArrowUp', 2);
  const R = await play(p);
  const lines = R.filter((x) => x.d && x.d.startsWith(comp + ':'));
  const faces = (x) => { const dx = x.pc[0] - x.comp[0], dy = x.pc[1] - x.comp[1]; return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); };
  ok(!before.comp && R.length && R.every((x) => x.comp && x.figs === 0) && lines.length >= 2 && faces(lines[0]) === lines[0].comp[2],
    comp + ': the reunion: your companion is here from the first line, the one figure (never a passing one), turned to you (' + JSON.stringify({ before: before.comp, first: R[0] && R[0].comp, line: lines[0] && { pc: lines[0].pc, comp: lines[0].comp } }) + ')');
  const r1 = await p.evaluate(() => ({ pc: [RB.world.W.player.x, RB.world.W.player.y], comp: RB.world.W.comp && [RB.world.W.comp.x, RB.world.W.comp.y], apart: !!RB.game.s.flags.ko_apart, stage: RB.game.s.quests.ko_main.stage, modes: RB.game.G.modes.slice(), run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen() }));
  // (you face up after the reunion: a press in a new direction turns you first and steps only when still held past the
  // turn, src/engine/50_world.js turnHold, so a short press can be the turn alone; east is pressed until you have gone
  // two tiles, at most five times)
  for (let i = 0; i < 5 && (await p.evaluate(() => RB.world.W.player.x)) < r1.pc[0] + 2; i++) await step(p, 'ArrowRight', 1);
  await p.waitForTimeout(400);
  const r2 = await p.evaluate(look);
  ok(r1.comp && !r1.apart && r1.stage === 6 && r2.comp && Math.abs(r2.comp[0] - r2.pc[0]) + Math.abs(r2.comp[1] - r2.pc[1]) === 1 && r2.pc[0] === r1.pc[0] + 2 && r2.figs === 0,
    comp + ': after it they follow you (two steps east, they are at your side), and the quest goes on (' + JSON.stringify({ r1, r2: { pc: r2.pc, comp: r2.comp } }) + ')');
  const ask2 = await askCompany(p);
  ok(ask2.button && !ask2.notice && ask2.talk, comp + ': Company talks with them again (' + JSON.stringify(ask2) + ')');
  await closeAll(p);
  const keep1 = await p.evaluate(kept);
  ok(keep1 === keep0, comp + ': who your companion is, their equipment, resolve and bonds, your pet and satchel as before the split (' + keep1 + ')');
  errorsAll.push(...errors);
  await p.close();
}

// ---- 4. both scenes seen before and passed over with "Skip seen" -------------------------------------------------
for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
  const { p, errors } = await page(b, url);
  await p.evaluate(([comp, KO]) => {
    const flags = {}; KO.forEach((f) => (flags[f] = true));
    const s = RB.game.debugStart('ko.roots2', 15, 10, { dir: 'down', edition: RB.edition.forNew(), comp, flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.state.setQuest(s, 'ko_main', 4);
    s.seen['ko.tide_split'] = true; s.seen['ko.reunion'] = true;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.skipSeen = true;
    RB.game.settings.suzuSpeech = 'standard';
    RB.world.enter('ko.roots2', 15, 10, 'down', { fresh: true });
    // (the bond milestones this journey's flags already earn, ch2_done to ch5_done, are awarded as after any scene,
    // 58_companion.js sync on story:settled, so that what is compared below starts from them)
    RB.bus.emit('story:settled', { mode: 'world' });
  }, [comp, KO]);
  await p.waitForTimeout(800);
  const keep0 = await p.evaluate(kept);
  await step(p, 'ArrowDown', 2);
  const A = await playSkip(p);
  const a = await p.evaluate(() => ({ pc: [RB.world.W.player.x, RB.world.W.player.y], comp: RB.world.W.comp && [RB.world.W.comp.x, RB.world.W.comp.y], apart: !!RB.game.s.flags.ko_apart, tideIn: !!RB.game.s.flags.ko_tide_in, stage: RB.game.s.quests.ko_main.stage, here: RB.world.companionHere(RB.game.s, RB.world.W.map.def), run: RB.script.isRunning() }));
  const af = await p.evaluate(look), keepA = await p.evaluate(kept);
  ok(A.skip && A.skip.vis && A.skip.ff && !A.ff && !a.run && a.pc.join() === '15,13' && a.apart && a.tideIn && a.stage === 5 && !a.here && !a.comp && af.figs === 0 && keepA === keep0,
    comp + ', the split skipped: it ends apart (you on the south bank, no follower, no figure, the quest at 5), the rest as before, fast-forward off (' + JSON.stringify({ skip: A.skip, ff: A.ff, a, figs: af.figs, kept: keepA === keep0 }) + ')');
  await p.evaluate(() => { const s = RB.game.s; s.flags.ko_root_b = true; s.flags.ko_root_c = true; s.flags.ko_round_seen = true; RB.world.enter('ko.roots2', 3, 6, 'up', { fresh: true }); });
  await p.waitForTimeout(800);
  await step(p, 'ArrowUp', 2);
  const R = await playSkip(p);
  const r1 = await p.evaluate(() => ({ pc: [RB.world.W.player.x, RB.world.W.player.y], comp: RB.world.W.comp && [RB.world.W.comp.x, RB.world.W.comp.y], apart: !!RB.game.s.flags.ko_apart, stage: RB.game.s.quests.ko_main.stage, run: RB.script.isRunning() }));
  const rf = await p.evaluate(look), keepR = await p.evaluate(kept);
  ok(R.skip && R.skip.vis && R.skip.ff && !R.ff && !r1.run && r1.comp && Math.abs(r1.comp[0] - r1.pc[0]) + Math.abs(r1.comp[1] - r1.pc[1]) === 1 && !r1.apart && r1.stage === 6 && rf.figs === 0 && keepR === keep0,
    comp + ', the reunion skipped: it ends together (the follower beside you, the one figure, the quest at 6), the rest as before the split, fast-forward off (' + JSON.stringify({ skip: R.skip, ff: R.ff, r1, figs: rf.figs, kept: keepR === keep0 }) + ')');
  for (let i = 0; i < 5 && (await p.evaluate(() => RB.world.W.player.x)) < r1.pc[0] + 2; i++) await step(p, 'ArrowRight', 1);
  await p.waitForTimeout(400);
  const r2 = await p.evaluate(look);
  ok(r2.comp && Math.abs(r2.comp[0] - r2.pc[0]) + Math.abs(r2.comp[1] - r2.pc[1]) === 1 && r2.pc[0] === r1.pc[0] + 2 && r2.figs === 0,
    comp + ', after the skipped reunion they follow you (two steps east, at your side) (' + JSON.stringify({ pc: r2.pc, comp: r2.comp }) + ')');
  errorsAll.push(...errors);
  await p.close();
}

ok(!errorsAll.length, 'no page errors ' + errorsAll.slice(0, 3).join(' | '));
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
