// Chapter 6 story flow in a real browser (built index.html), RB.test auto mode.
// Usage: node tests/e2e/story_ch6.mjs [runIndex]
import { serve, launch, page } from './lib.mjs';

const RUNS = [
  { comp: 'ren', profile: 'A', battle: 'smart', prefer: ['Take it back', 'Return them all', 'Open it', 'Come down'], yae: true, prior: 'full' },
  { comp: 'nao', profile: 'F', battle: 'unravel', prefer: ['Leave it here', 'Keep them here', 'Close it', 'Stay and keep'], prior: 'min' },
  { comp: 'mio', profile: 'E', battle: 'unravel', prefer: ["Don't open", 'Return them all', 'Close it', 'Come down'], prior: 'full' },
  { comp: 'suzu', profile: 'I', battle: 'smart', prefer: ["Don't open", 'Keep them here', 'Open it', 'Stay and keep'], prior: 'min', yae: true },
  { comp: 'ren', profile: 'F', battle: 'unravel', prefer: ['Leave it. You already', 'Keep them here', 'Close it', 'Stay and keep'], prior: 'min' },
];
const pick = process.argv[2] != null ? [RUNS[+process.argv[2]]] : RUNS;
const { srv, url } = await serve();
const b = await launch();
let fails = 0;
for (const run of pick) {
  const { p, errors } = await page(b, url);
  let res;
  try {
    res = await p.evaluate(async (run) => {
      const T = RB.test;
      const out = { checks: [], trace: [] };
      const check = (name, ok, extra) => out.checks.push({ name, ok: !!ok, extra });
      const prefer = run.prefer.concat(['Not now', 'Not today', "I'm fine for now"]);
      T.enable({
        battle: run.battle,
        choose: (opts) => {
          for (const w of prefer) { const i = opts.findIndex((o) => (o.en || '').indexOf(w) === 0); if (i >= 0) return i; }
          return 0;
        },
      });
      const flags = { rw_echo_done: true, departed: true, rw_koji_back: true, rw_hall_gather: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true };
      if (run.prior === 'full') Object.assign(flags, { co_restored: true, co_bell_done: true, co_hiro_seat_named: true, sb_hoshino_goes: true, lf_akari_letter: true, sb_letters_done: true });
      const s = RB.game.debugStart('sa.road', 2, 23, { profile: run.profile, comp: run.comp, flags, dir: 'up' });
      s.learn.kanaKnown = run.profile === 'F' ? 'none' : 'both';
      if (run.battle === 'smart') s.words = Object.keys(RB.content.words);
      else s.words = ['mamoru', 'hikari', 'iyasu'].filter((w) => RB.content.words[w]);
      if (run.yae) s.seen['lf.yae_after'] = true;
      if (run.prior === 'full') RB.state.give(s, 'lf_toya_bell', 1);
      const map = () => RB.world.W.map.id;
      try {
      const q = (id) => s.quests[id] ? (s.quests[id].done ? 'done' : s.quests[id].stage) : null;
      await T.idle();
      if (!s.seen['sa.arrive']) { await RB.script.run('sa.arrive'); await T.idle(); }
      check('arrived', s.flags.sa_arrived && q('sa_main') === 0, q('sa_main'));
      // road lanterns (dead) + marker
      await T.use(10, 23);
      // camp
      await T.go('sa.camp', 13, 17, 'up');
      await T.talk('sa_isamu');
      check('isamu quest started', q('sa_isamu') === 0, q('sa_isamu'));
      await T.go('sa.hut', 5, 6, 'up');
      await T.talk('sa_oyone');
      await T.use(2, 2).catch(() => {});
      // gate
      await T.go('sa.gate', 15, 13, 'up');
      check('gate first seen', s.seen['sa.gate_first'], Object.keys(s.seen).filter((k) => k.startsWith('sa.')).join(','));
      await T.use(22, 18);
      if (run.comp === 'ren') check('ushio grave found', s.flags.sa_ushio_found);
      T.place(15, 9, 'up'); await T.step('up');
      check('entered reading room', map() === 'sa.reading', map());
      await T.idle();
      if (!s.seen['sa.kasane_meet']) await T.talk('kasane');
      check('kasane met', s.seen['sa.kasane_meet'] && s.flags.sa_kasane_left, JSON.stringify({ left: s.flags.sa_kasane_left }));
      await T.talk('sa_clerk');
      check('clerk quest started', q('sa_clerk') === 0);
      T.place(26, 9, 'right'); await T.step('right');
      check('shortcut door locked', map() === 'sa.reading');
      await T.use(2, 2);
      check('catalogue done', s.flags.sa_catalogue_done && q('sa_main') >= 2, q('sa_main'));
      T.place(1, 9, 'left'); await T.step('left');
      check('west to stacks', map() === 'sa.stacks', map());
      await T.use(27, 15);
      await T.use(9, 12);
      await T.use(14, 19);
      check('stacks paraphrase done', s.flags.sa_stacks_done && q('sa_main') >= 3, q('sa_main'));
      T.place(14, 20, 'down'); await T.step('down');
      check('stair to conduits', map() === 'sa.conduits', map());
      await T.use(2, 4);
      check('notice taken', s.inv.sa_notice);
      await T.use(4, 13);
      check('charter done', s.flags.sa_promise_done && q('sa_main') >= 4, q('sa_main'));
      await T.go('sa.memories', 21, 9, 'left');
      await T.use(3, 3);
      check('kasane letter', s.inv.sa_letter_kasane);
      await T.use(16, 6);
      check('tae slip', s.inv.sa_tae_slip);
      await T.use(3, 12);
      check('isamu folio', s.inv.sa_folio_isamu && q('sa_isamu') === 1);
      await T.use(4, 6);
      check('ren folio decided', s.flags.sa_ren_decided, JSON.stringify({ took: s.flags.sa_ren_took, left: s.flags.sa_ren_left, carried: s.flags.sa_ren_carried, told: s.flags.sa_ren_told }));
      T.place(11, 1, 'up'); await T.step('up');
      check('north to study', map() === 'sa.study', map());
      await T.use(5, 3);
      check('toya reply', s.inv.sa_toya_reply);
      await T.use(3, 2);
      check('ushio notes', s.inv.sa_ushio_notes && q('sa_clerk') === 1);
      await T.use(0, 6);
      check('shortcut open', s.flags.sa_shortcut);
      // name the clerk via shortcut
      await T.go('sa.reading', 25, 10, 'left');
      await T.talk('sa_clerk');
      check('clerk named', s.flags.sa_clerk_named && q('sa_clerk') === 'done', q('sa_clerk'));
      await T.go('sa.study', 1, 6, 'right');
      T.place(7, 2, 'up'); await T.step('up');
      check('stairs to heart', map() === 'sa.heart', map());
      // approach trigger fires heart_kasane -> battle -> after_battle -> toya_read
      T.place(12, 12, 'up'); await T.step('up');
      await T.idle(60000);
      check('hush down', s.flags.sa_hush_down);
      check('toya read', s.flags.sa_toya_read && q('sa_main') >= 6, q('sa_main'));
      check('letter handed over', !s.inv.sa_letter_kasane);
      await T.go('sa.memories', 11, 14, 'up');
      await T.talk('kasane');
      check('mem choice', s.flags.sa_choice_mem && (s.flags.end_mem_return || s.flags.end_mem_choose));
      await T.go('sa.reading', 14, 10, 'up');
      await T.talk('kasane');
      check('archive choice', s.flags.sa_choice_archive && (s.flags.end_archive_library || s.flags.end_archive_closed));
      T.place(14, 18, 'down'); await T.step('down');
      check('south to gate', map() === 'sa.gate', map());
      await T.talk('kasane');
      check('kasane choice', s.flags.sa_choice_kasane && s.flags.sa_descent && (s.flags.end_kasane_trial || s.flags.end_kasane_keeper));
      if (s.flags.end_kasane_keeper) { await T.talk('kasane'); }
      await T.go('sa.camp', 13, 15, 'down');
      T.place(13, 15, 'down'); await T.step('down');
      await T.idle();
      check('camp descent', s.seen['sa.camp_descent'] && q('sa_isamu') === 'done', q('sa_isamu'));
      if (s.flags.end_kasane_trial) await T.talk('kasane');
      await T.talk('sa_oyone');
      // road down to the bottom trigger
      await T.go('sa.road', 3, 22, 'down');
      T.place(2, 23, 'down'); await T.step('down');
      await T.idle(60000);
      out.afterMap = map();
      check('epilogue done -> rw.hall', map() === 'rw.hall' && s.flags.post && s.flags.ch6_done && s.flags.sa_done && s.flags.postgame, map());
      check('main quest done', q('sa_main') === 'done');
      check('end flags', ['mem', 'archive', 'kasane'].every((k) => Object.keys(s.flags).some((f) => f.startsWith('end_' + k + '_'))));
      out.ends = Object.keys(s.flags).filter((f) => f.startsWith('end_'));
      check('player at hall 5,5', s.x === 5 && s.y === 5, s.x + ',' + s.y);
      await T.wait(1500); await T.idle(30000);
      check('atlas intro ran', s.seen['rw.atlas_intro']);
      // post-game: Archive state after story
      await T.go('sa.gate', 15, 13, 'up');
      out.gateNpcs = RB.world.W.npcs.map((n) => n.id);
      for (const n of RB.world.W.npcs.filter((n) => !n.enemy)) { try { await T.talk(n.id); } catch (e) { out.trace.push('talk ' + n.id + ': ' + e.message); } }
      await T.go('sa.reading', 14, 12, 'up');
      out.readNpcs = RB.world.W.npcs.map((n) => n.id);
      for (const n of RB.world.W.npcs.filter((n) => !n.enemy)) { try { await T.talk(n.id); } catch (e) { out.trace.push('talk ' + n.id + ': ' + e.message); } }
      await T.go('sa.hut', 5, 6, 'up');
      for (const n of RB.world.W.npcs.filter((n) => !n.enemy)) { try { await T.talk(n.id); } catch (e) { out.trace.push('talk ' + n.id + ': ' + e.message); } }
      await T.go('sa.camp', 13, 14, 'up');
      out.campNpcs = RB.world.W.npcs.map((n) => n.id);
      for (const n of RB.world.W.npcs.filter((n) => !n.enemy)) { try { await T.talk(n.id); } catch (e) { out.trace.push('talk ' + n.id + ': ' + e.message); } }
      } catch (e) { check('exception at ' + map(), false, e.message); }
      out.problems = T.problems;
      out.battles = T.log.filter((l) => l.t === 'battle');
      out.choices = T.log.filter((l) => l.t === 'choice').map((c) => c.opts[c.pick]);
      return out;
    }, run);
  } catch (e) {
    res = { checks: [{ name: 'exception', ok: false, extra: e.message.slice(0, 600) }] };
  }
  const bad = res.checks.filter((c) => !c.ok);
  console.log(`\n== ${run.comp}/${run.profile}/${run.battle}: ${res.checks.length - bad.length}/${res.checks.length} checks ok`);
  for (const c of bad) console.log('  FAIL', c.name, c.extra || '');
  if (res.ends) console.log('  ends:', res.ends.join(' '), '| afterMap:', res.afterMap);
  if (res.battles) console.log('  battles:', res.battles.map((x) => `${x.enemy}:${x.result}/${x.rounds}`).join(' '));
  if (res.choices) console.log('  choices:', res.choices.join(' | '));
  if (res.gateNpcs) console.log('  post gate npcs:', res.gateNpcs.join(','), '| reading npcs:', (res.readNpcs||[]).join(','), '| camp npcs:', res.campNpcs.join(','));
  if (res.trace && res.trace.length) console.log('  trace:', res.trace);
  if (res.problems && res.problems.length) console.log('  problems:', JSON.stringify(res.problems).slice(0, 1500));
  if (errors.length) console.log('  ERRORS:', errors.slice(0, 8));
  fails += bad.length + (res.problems ? res.problems.length : 0) + errors.length;
  await p.context().close();
}
await b.close(); srv.close();
console.log(fails ? `\n${fails} failures` : '\nall ok');
process.exit(fails ? 1 : 0);
