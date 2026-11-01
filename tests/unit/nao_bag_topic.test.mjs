// Nao's road topic on packing the bag (Agnes 6558179644; Local CL-614; Cloud CC-451). Its third line, for Trusted
// Company, said 「{鞄|かばん} の {中身|なかみ} を {人|ひと} に {話|はな}す の は 、 {初|はじ}めて だ 。」 "First time I've told
// anyone what's in the bag", which is not so: Nao has told it at the Atlas camp (src/atlas/60_scenes.js 179) and shown
// Snowbell's tin (src/content/ch4/32_scenes_quiet.js 116–119). Only that line changes, to keeping how Nao packs it
// between you. With synthetic campaigns only, the real scene runner and the real "Talk about this road" hook (the
// dialogue stubbed, choices picked by the test):
//  1. the topic's three lines: the first two and their keys as before; the third the new line under its new key
//     (road.nao.h3#157475c882), with the smirk and the trust gate; the old key (#893af51a4d) nowhere in any scene;
//  2. its seventeen words all known, the line valid;
//  3. at an Atlas camp, its second visit, in the camp's own scene: Nao's camp thought on the bag, then "Talk about
//     this road" plays this topic; Trusted, the new line third; below Trusted, the first two only; never the old line;
//  4. at home, through the homecoming's own topic: the same, Trusted and below;
//  5. after Snowbell's tin, and in a journey with neither the tin nor the camp's bag line: the same; and after a save's
//     round trip;
//  6. every other Nao topic as before (by a fingerprint of their lines before this change);
//  no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, PG = RB.pages, K = RB.company;
  const flat = (x) => JSON.stringify(x);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
  const NEW = '{鞄|かばん} の {詰|つ}め{方|かた} は 、 ほか の {人|ひと} に は {話|はな}す な よ 。 {配達人|はいたつにん} の {秘密|ひみつ} だ ぞ 。';
  const NEW_EN = 'Keep how I pack it between us. That\'s a courier secret, mind.';
  const OLD_EN = /First time I've told anyone/;

  // ---- a minimal stage (as tests/unit/pages_project.test.mjs): the real runner, dialogue collected -----------------
  let lines = [], chooser = () => 0;
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '', key: l.jp ? keyOf(l.sceneId, l.jp) : null }); };
  RB.ui.dialogue.choose = async (opts) => chooser(opts);
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.world.ensureSpeaker = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.dismissExtras = () => {};
  RB.world.refreshActors = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.hooks.atlas_camp = async () => {};
  RB.hooks.atlas_extract = async () => {};
  // the runner's own error log (src/engine/70_script.js logs a scene that ends on an error), and anything thrown
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, pick) => { lines = []; chooser = pick || (() => 0); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  const byEn = (...words) => (opts) => { for (const w of words) { const i = opts.findIndex((o) => (o.en || '').indexOf(w) >= 0); if (i >= 0) return i; } return 0; };

  // a journey after the story with Nao and the project at its third page, every Nao topic before h3 already heard
  const BEFORE = ['h1', 'r1', 'o1', 'h2', 'r2', 'o2'];
  const journey = async (o = {}) => {
    const s = S.newCampaign({});
    s.map = 'rw.hall'; s.comp = 'nao';
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, lf_bell_rung: true, postgame: true, post: true });
    s.seen['rw.atlas_intro'] = true; s.atlas.unlocked = true;
    s.quests.lf_nao = { stage: 99, done: true };
    K.memory(s, { id: 'ending:nao', kind: 'reflections', title: { jp: '{橋|はし}', en: 'x' }, pq: true, comp: 'nao' });
    if (o.tin) s.seen['sb.quiet_nao'] = true;
    RB.game.G.s = s;
    await run('pages.offer', () => 0); // the project begun the game's own way (as tests/unit/pages_project.test.mjs)
    // the bond set after it, so the offer's own award can't move it: 6 is Trusted Company, 5 is just below
    s.company.bond = {};
    for (let i = 0; i < (o.bond == null ? 6 : o.bond); i++) s.company.bond['t' + i] = 1;
    Object.assign(PG.state(s), { stage: 3, caption: 0, theme: Object.keys(PG.PROJECT.nao.themes)[0], ev: { run: 'x', id: 'y', kind: 'inscription', desc: { jp: '', en: '' }, title: { jp: '', en: '' }, ret: 'early' } });
    for (const sl of BEFORE) s.company.talk['road:nao.' + sl] = { t: 1, variant: 'base', variants: ['base'] };
    return s;
  };
  let seq = 0;
  const startRun = (s) => { s.atlas.run = { id: 'r' + (++seq), mods: [], path: ['t'] }; s.map = 'atlas.' + s.atlas.run.id + '.c'; return s; };
  const h3 = () => lines.filter((l) => l.key && l.key.indexOf('road.nao.h3#') === 0);
  const sayH3 = C.scenes['road.nao.h3'].cmds.filter((c) => c.op === 'say');

  // 1. the topic's three lines
  t.ok(sayH3.length === 3 &&
    keyOf('road.nao.h3', sayH3[0].jp) === 'road.nao.h3#970d718322' && sayH3[0].en === 'There\'s an order to packing the bag. Urgent letters on top, heavy things against your back.' && !sayH3[0].if &&
    keyOf('road.nao.h3', sayH3[1].jp) === 'road.nao.h3#1b6f2164e9' && sayH3[1].en === 'The bundle of labels goes… at the very bottom. It\'s the heaviest. Don\'t ask what I mean by heavy.' && !sayH3[1].if,
  '1 the first two lines and their keys as before ' + flat(sayH3.slice(0, 2).map((c) => keyOf('road.nao.h3', c.jp))));
  t.ok(sayH3[2].jp === NEW && sayH3[2].en === NEW_EN && sayH3[2].who === 'nao' && sayH3[2].expr === 'smirk' && sayH3[2].if === 'bond>=trusted' && keyOf('road.nao.h3', sayH3[2].jp) === 'road.nao.h3#157475c882',
    '1 the third: the new line under road.nao.h3#157475c882, with the smirk and the trust gate ' + flat(sayH3[2]));
  const everyKey = [];
  for (const id in C.scenes) for (const c of C.scenes[id].cmds) if (c.op === 'say' && c.jp) everyKey.push(keyOf(id, c.jp));
  t.ok(everyKey.length > 1000 && !everyKey.includes('road.nao.h3#893af51a4d'), '1 the old key is in no scene (' + everyKey.length + ' lines)');

  // 2. the words
  const toks = RB.jp.parse(NEW).filter((x) => !x.punct);
  const unknown = toks.filter((x) => RB.jp.lookup(x).unknown).map((x) => x.surface);
  t.ok(toks.length === 17 && !unknown.length && !RB.jp.validate(NEW).length, '2 its seventeen words all known, the line valid ' + flat({ n: toks.length, unknown, problems: RB.jp.validate(NEW) }));

  // 3. at an Atlas camp, its second visit: the camp's own scene, then "Talk about this road"
  const camp = async (o) => {
    const s = startRun(await journey(o));
    s.vars.atlas_camp_i = 1;
    let asked = 0;
    await run('atlas.camp', (opts) => (asked++ === 0 ? byEn('Talk about this road')(opts) : byEn('Head home')(opts)));
    return { s, all: lines.slice(), h3: h3() };
  };
  for (const [bond, trusted] of [[6, true], [5, false]]) {
    const r = await camp({ bond, tin: true });
    const bag = r.all.findIndex((l) => /This bag's heavy, right\?/.test(l.en));
    const first = r.all.findIndex((l) => l.key && l.key.indexOf('road.nao.h3#') === 0);
    t.ok(bag >= 0 && first > bag && r.h3.length === (trusted ? 3 : 2) && (trusted ? r.h3[2].key === 'road.nao.h3#157475c882' && r.h3[2].en === NEW_EN : true) && !r.all.some((l) => OLD_EN.test(l.en)) && r.s.company.talk['road:nao.h3'],
      '3 at a camp, its second visit: the bag line, then this topic; ' + (trusted ? 'Trusted, the new line third' : 'below Trusted, the first two only') + ' ' + flat({ bag, first, h3: r.h3.map((l) => l.key) }));
  }

  // 4. at home, through the homecoming's own topic
  for (const [bond, trusted] of [[6, true], [5, false]]) {
    await journey({ bond });
    await run('pages.road.home');
    const r = h3();
    t.ok(r.length === (trusted ? 3 : 2) && (trusted ? r[2].key === 'road.nao.h3#157475c882' : true) && !lines.some((l) => OLD_EN.test(l.en)),
      '4 at home: ' + (trusted ? 'Trusted, the new line third' : 'below Trusted, the first two only') + ' ' + flat(r.map((l) => l.key)));
  }

  // 5. after Snowbell's tin, with neither, and after a save's round trip
  {
    const a = await camp({ tin: true });
    const s0 = startRun(await journey({}));
    s0.vars.atlas_camp_i = 0; // the first visit's thought, not the bag
    let asked = 0;
    await run('atlas.camp', (opts) => (asked++ === 0 ? byEn('Talk about this road')(opts) : byEn('Head home')(opts)));
    const b = { all: lines.slice(), h3: h3() };
    const s1 = await journey({});
    const st = RB.save.migrate(JSON.parse(JSON.stringify(s1)));
    RB.game.G.s = st;
    await run('pages.road.home');
    const c = h3();
    const same = (x) => flat(x.map((l) => [l.key, l.en]));
    t.ok(a.s.seen['sb.quiet_nao'] && !b.all.some((l) => /This bag's heavy/.test(l.en)) && same(a.h3) === same(b.h3) && same(b.h3) === same(c) && c.length === 3,
      '5 after Snowbell\'s tin, with neither the tin nor the camp\'s bag line, and after a save\'s round trip: the same three lines ' + same(c));
  }

  // 6. every other Nao topic as before
  const rest = [];
  for (const id of Object.keys(C.scenes).filter((x) => /^road\.nao\./.test(x)).sort()) {
    C.scenes[id].cmds.forEach((c, i) => { if (!(id === 'road.nao.h3' && c.op === 'say' && c.if === 'bond>=trusted')) rest.push([id, i, c.op, c.who || null, c.expr || null, c.jp || null, c.en || null, c.if || null]); });
  }
  const fp = crypto.createHash('sha256').update(JSON.stringify(rest)).digest('hex').slice(0, 16);
  t.ok(fp === 'ea66088918f90b87', '6 every other Nao topic as before (a fingerprint of their lines before this change) ' + flat({ n: rest.length, fp }));

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
