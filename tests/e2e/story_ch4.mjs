// Chapter 4 (Snowbell) story flow in a real browser using RB.test auto mode.
// Usage: node tests/e2e/story_ch4.mjs [profile] [companion] [ending: stay|go|both]
import { serve, launch, page } from './lib.mjs';

const profiles = process.argv[2] ? [process.argv[2]] : ['F', 'A'];
const comps = process.argv[3] ? [process.argv[3]] : ['nao', 'mio', 'ren', 'suzu'];
const endingArg = process.argv[4] || null;
const { srv, url } = await serve();
const b = await launch();
let fails = 0;
let run = 0;
for (const profile of profiles) for (const comp of comps) {
  const ending = endingArg || ['stay', 'go', 'both'][run++ % 3];
  const { p, errors } = await page(b, url);
  const res = await p.evaluate(async ({ profile, comp, ending }) => {
    const T = RB.test;
    const out = { checks: [], lines: 0 };
    const check = (name, ok, extra) => out.checks.push({ name, ok: !!ok, extra });
    let want = null;
    T.enable({
      battle: 'unravel',
      choose: (opts) => {
        if (want) { const i = opts.findIndex((o) => want.test(o.en || '')); if (i >= 0) return i; }
        return 0;
      },
    });
    const origSay = RB.ui.dialogue.say;
    RB.ui.dialogue.say = (l) => { out.lines++; return origSay(l); };
    const s = RB.game.debugStart('sb.road', 2, 13, { profile, comp, dir: 'right', flags: { departed: true, ch3_done: true } });
    s.learn.kanaKnown = profile === 'F' ? 'none' : 'both';
    s.words = ['mamoru', 'mizu', 'hikari', 'iyasu', 'kaze', 'nawa', 'ishi', 'koori', 'tsuchi'];
    const W = () => RB.world.W;
    const tk = async (id) => { try { await T.talk(id); } catch (e) { check('talk ' + id, false, e.message); } };
    const us = async (x, y) => { try { await T.use(x, y); } catch (e) { check('use ' + x + ',' + y, false, e.message); } };
    const at = () => W().map.id;
    await RB.script.run('sb.arrive'); await T.idle();
    check('chapter 4 set', s.chapter === 4);
    T.place(30, 13, 'right'); await T.step('right');
    check('drift blocks the Lanternfall road', at() === 'sb.road' && W().player.x === 30);
    await us(31, 13);
    T.place(18, 1, 'up'); await T.step('up'); await T.idle();
    check('entered hamlet', at() === 'sb.hamlet');
    check('main quest started', s.quests.sb_lamp && s.quests.sb_lamp.stage === 0);
    // the stair is iced over
    T.place(30, 2, 'up'); await T.step('up');
    check('stair blocked before storm', at() === 'sb.hamlet');
    await us(30, 1);
    await T.go('sb.inn', 8, 9, 'up'); await us(13, 3);
    check('stage 1 (see Hoshino)', s.quests.sb_lamp.stage >= 1);
    T.place(2, 2, 'left'); await T.step('left');
    check('stairs locked before storm', at() === 'sb.inn');
    await tk('natsume');
    if (comp !== 'nao') await tk('nao');
    await T.go('sb.hoshino', 5, 7, 'up'); await tk('hoshino');
    check('stage 2 (post shelter)', s.quests.sb_lamp.stage >= 2);
    for (const [x, y] of [[1, 3], [9, 2], [4, 2], [6, 5]]) await us(x, y);
    // --- side quest: goats
    await T.go('sb.hamlet', 8, 29, 'up'); await tk('tetsuji');
    check('goats quest started', !!s.quests.sb_goats);
    await T.go('sb.goatshed', 6, 7, 'up'); await us(6, 2);
    check('goat note read', s.quests.sb_goats.stage >= 2);
    await tk('sb_kid1'); await tk('sb_goat_momo');
    await T.go('sb.hamlet', 8, 29, 'up'); await tk('tetsuji');
    check('goats done + reward', s.quests.sb_goats.done && s.inv.sb_goat_bell === 1);
    // --- side quest: bell-post
    await T.go('sb.fuki', 3, 5, 'up'); want = /Leave it/; await tk('fuki'); want = null;
    check('bell quest started', !!s.quests.sb_bell);
    await us(5, 4);
    check('notebook read', s.quests.sb_bell.stage >= 1);
    await T.go('sb.hamlet', 22, 17, 'up');
    want = /Once/; await us(22, 15); want = null;
    check('wrong count does not advance', s.quests.sb_bell.stage === 1);
    want = /Twice/; await us(22, 15); want = null;
    check('noon bell rung', s.quests.sb_bell.stage >= 2);
    await T.go('sb.fuki', 3, 5, 'up'); await tk('fuki');
    check('bell done + reward', s.quests.sb_bell.done && s.inv.sb_bell_cord === 1);
    // --- side quest: snow sculptures
    await T.go('sb.hamlet', 20, 17, 'up'); await tk('kanta');
    check('snow quest started', !!s.quests.sb_snow);
    await us(18, 20); await us(20, 21); await us(24, 21);
    await tk('kanta');
    check('snow contest judged', s.quests.sb_snow.done && s.inv.sb_scarf === 1);
    for (const id of ['chiyo', 'rokuta', 'sachi', 'denji', 'hayate']) await tk(id);
    for (const [x, y] of [[17, 14], [27, 20], [34, 19], [26, 28], [39, 5], [40, 25], [32, 2]]) await us(x, y);
    // --- post shelter
    await T.go('sb.post', 5, 6, 'up'); await us(7, 3);
    check('letters sorted, Akari bundle ordered', s.flags.sb_letters_done && s.flags.sb_akari_ordered && s.inv.sb_akari_letters === 1);
    check('stage 3', s.quests.sb_lamp.stage >= 3, JSON.stringify(s.quests.sb_lamp));
    for (const [x, y] of [[1, 2], [1, 4], [5, 2]]) await us(x, y);
    // --- Hoshino reads the letters; the storm
    await T.go('sb.hoshino', 5, 7, 'up'); want = /Short strokes/; await tk('hoshino'); want = null;
    await T.idle(30000);
    check('storm began, at inn', s.flags.sb_storm && at() === 'sb.inn');
    check('rang the storm bell', s.flags.sb_rang_storm);
    check('learned honoo', s.words.includes('honoo') && s.flags.sb_hearth_done);
    check('stage 5', s.quests.sb_lamp.stage >= 5);
    for (const id of ['hoshino', 'fuki', 'tetsuji', 'natsume', 'sachi', 'kanta', 'chiyo', 'denji', 'sousuke', 'hayate']) await tk(id);
    await us(13, 3);
    if (comp !== 'nao') await tk('nao');
    T.place(8, 10, 'down'); await T.step('down');
    check('door locked in storm', at() === 'sb.inn');
    // --- the quiet stretch
    T.place(2, 2, 'left'); await T.step('left'); await T.idle(30000);
    check('quiet stretch done, morning', s.flags.sb_quiet_done && s.flags.sb_morning && at() === 'sb.inn_room');
    T.place(6, 6, 'right'); await T.step('right'); await T.idle();
    check('back downstairs', at() === 'sb.inn');
    await tk('hoshino');
    check('observatory key', s.inv.sb_obs_key === 1 && s.flags.sb_obs_open);
    await tk('denji');
    // --- the Star Stair
    await T.go('sb.hamlet', 30, 2, 'up'); await us(30, 1);
    check('stair melted', s.flags.sb_stair_open);
    T.place(30, 1, 'up'); await T.step('up'); await T.idle();
    check('on the Star Stair', at() === 'sb.obs_path');
    for (const [x, y] of [[7, 33], [9, 36], [6, 26], [8, 5], [23, 5]]) await us(x, y);
    // fight one fox (visible foe)
    const fox = W().foes.find((f) => f.id === 'fox1');
    if (fox) { await us(fox.x, fox.y); await T.idle(); }
    check('fox settled', s.flags['foe:sb.obs_path:fox1']);
    T.place(20, 5, 'up'); await T.step('up');
    check('service door locked from outside', at() === 'sb.obs_path');
    T.place(13, 6, 'up'); await T.step('up'); await T.idle();
    check('in the hall', at() === 'sb.obs_hall');
    T.place(10, 2, 'up'); await T.step('up');
    check('inner door sealed', at() === 'sb.obs_hall');
    for (const [x, y] of [[6, 2], [2, 8], [17, 7], [6, 9]]) await us(x, y);
    await us(12, 3);
    check('dial solved', s.flags.sb_dial1 && s.quests.sb_lamp.stage >= 7);
    const ghost = W().foes.find((f) => f.id === 'ghost1');
    if (ghost) { await us(ghost.x, ghost.y); await T.idle(); }
    check('lantern ghost settled', s.flags['foe:sb.obs_hall:ghost1']);
    T.place(10, 2, 'up'); await T.step('up'); await T.idle();
    check('in the chart room', at() === 'sb.obs_charts');
    await us(13, 2);
    check('stove lit (rest point)', s.flags.sb_stove_lit);
    await us(10, 4); await us(7, 2);
    T.place(14, 5, 'right');
    await us(4, 5);
    check('log solved, archive found, sketch', s.flags.sb_log_solved && s.flags.sb_archive_found && s.inv.sb_ushio_sketch === 1);
    if (comp === 'ren') check('Ren part 1', s.flags.sb_ren_ushio1);
    T.place(14, 5, 'right'); await T.step('right'); await T.idle();
    check('in the gallery', at() === 'sb.obs_gallery');
    for (const [x, y] of [[7, 2], [2, 6], [17, 3]]) await us(x, y);
    T.place(18, 11, 'right'); await T.step('right'); await T.idle();
    check('shortcut opened', s.flags.sb_shortcut);
    if (at() !== 'sb.obs_gallery') { await T.go('sb.obs_gallery', 17, 11, 'left'); }
    T.place(11, 4, 'left'); await T.step('left');
    check('hatch locked', at() === 'sb.obs_gallery');
    await us(12, 3);
    check('hatch cranked', s.flags.sb_crank && s.quests.sb_lamp.stage >= 8);
    T.place(11, 4, 'left'); await T.step('left'); await T.idle();
    check('in the dome', at() === 'sb.obs_dome');
    for (const [x, y] of [[2, 2], [10, 8]]) await us(x, y);
    want = ending === 'go' ? /waiting for, not the lamp/ : ending === 'both' ? /leave the lamp/ : /even when no one/;
    T.place(7, 8, 'up'); await T.step('up'); await T.idle(60000); want = null;
    check('boss settled', s.flags.sb_boss_done);
    check('lamp lit', s.flags.sb_lamp_lit && s.flags.sb_name_done);
    check('ending flag ' + ending, s.flags['sb_hoshino_' + (ending === 'stay' ? 'stays' : ending === 'go' ? 'goes' : 'both')]);
    check('reply letter', s.inv.sb_reply_letter === 1);
    check('chapter done', s.flags.ch4_done && s.quests.sb_lamp.done && at() === 'sb.hamlet');
    for (const id of ['hoshino', 'kanta', 'fuki', 'yae', 'tetsuji', 'sousuke']) await tk(id);
    await T.go('sb.sachi', 4, 6, 'up'); await tk('sachi');
    await T.go('sb.inn', 8, 9, 'up'); await T.idle();
    check('evening ends at the inn', !s.flags.sb_evening && s.flags.sb_after);
    await us(13, 3); await tk('natsume'); if (comp !== 'nao') await tk('nao');
    // banter: talk to the companion a few times
    for (let i = 0; i < 6; i++) { RB.game.companionTalk(); await T.idle(); }
    // leave: next morning, road open
    await T.go('sb.road', 18, 1, 'down'); await T.idle();
    check('next day', !s.flags.sb_evening && s.flags.sb_after);
    for (const id of ['hayate']) { if (W().npcs.find((n) => n.id === id)) await tk(id); }
    T.place(34, 13, 'right'); await T.step('right'); await T.idle();
    check('Lanternfall road open', at() !== 'sb.road', at());
    // post-game lines
    s.flags.postgame = true; s.flags.end_archive_library = true; s.flags.end_mem_return = true; s.flags.end_kasane_trial = true;
    await T.go('sb.hamlet', 22, 30, 'up');
    for (const id of ['fuki', 'kanta', 'chiyo', 'rokuta', 'tetsuji', 'sachi', 'denji', 'hayate']) if (W().npcs.find((n) => n.id === id)) await tk(id);
    if (!s.flags.sb_hoshino_goes) await tk('hoshino');
    await T.go('sb.inn', 8, 9, 'up'); await us(13, 3); await tk('natsume'); if (comp !== 'nao') await tk('nao');
    await T.go('sb.post', 5, 6, 'up'); await us(7, 3);
    out.problems = T.problems.slice(0, 20);
    out.log = T.log.filter((l) => l.t === 'battle');
    out.seen = Object.keys(s.seen).filter((k) => k.startsWith('sb.')).length;
    return out;
  }, { profile, comp, ending });
  const bad = res.checks.filter((c) => !c.ok);
  fails += bad.length + (res.problems || []).length + errors.length;
  console.log(`[${profile}/${comp}/${ending}] ${res.checks.length - bad.length}/${res.checks.length} checks ok, ${res.lines} lines shown, ${res.seen} sb scenes seen` + (bad.length ? '\n  FAIL: ' + bad.map((c) => c.name + (c.extra ? ' (' + c.extra + ')' : '')).join('; ') : ''));
  if (res.problems && res.problems.length) console.log('  problems:', JSON.stringify(res.problems));
  console.log('  battles:', JSON.stringify(res.log));
  if (errors.length) console.log('  console errors:', errors.slice(0, 8));
  await p.close();
}
await b.close(); srv.close();
process.exit(fails ? 1 : 0);
