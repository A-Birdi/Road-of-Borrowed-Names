// A quiet give's count (CC-541; Local CL-707, CL-710, CL-711; Cloud CC-561, CC-562; Agnes 6650249477, 6807667580).
// `!give <item> quiet` read `quiet` as the count: NaN, so Kotonoha's leaf was never held as one (and was saved as
// null), Tsuru could not take the letter, and the tea leaves counted one short. Now one reader (RB.state.itemArgs)
// serves the script runner and the quest guide's simulator, and loading repairs exactly the corrupt entries:
//  1. the reader: no count is one; `quiet`; a finite count; both orders; zero; anything else refused. Every give and
//     take in the content reads as it should, and the validator names a bad one by scene and line;
//  2. the runner: quiet gives no slip, an ordinary give one slip with the count read, a refused give or take does
//     nothing (no item, no "new" mark, no slip) and is reported with its scene and line;
//  3. the guide's simulator reads the same commands the same way, and follows nothing a refused one would do;
//  4. loading: only an own entry that is exactly null (a save) or NaN (a running journey), for the three items, from
//     what the journey shows; every other entry and field as it was, the "new" marks as they were; repeated, and
//     through a save and a load, nothing comes back or doubles;
//  5. the scenes themselves, on the real runner (the screen stood in for): the arrival's letter quietly given, held as
//     one, and handed to Tsuru; the tea leaves one, then two after the rush; Kotonoha's leaf quietly given, held as one,
//     Otoha's line about it said and the Wind Stone's "Against" offered, and the leaf sent home once;
//  6. the seven-return boundary: a journey saved with the leaf as null after seven leaves home loads with the leaf held
//     and nothing else (the count of returns and the "Every leaf home" stamp as they were); its one ordinary eighth
//     return then counts once and earns the stamp by its own criterion.
import { load } from '../lib/load.mjs';

function storage() {
  const m = new Map();
  return {
    get length() { return m.size; }, key: (i) => (i < m.size ? [...m.keys()][i] : null),
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); }, _m: m,
  };
}
// a copy and a comparison that keep what JSON loses (undefined, NaN, Infinity, own properties that are not enumerable)
const tag = (x) => Object.prototype.toString.call(x);
function copyOf(v, seen = new Map()) {
  if (!v || typeof v !== 'object') return v;
  if (seen.has(v)) return seen.get(v);
  const o = Array.isArray(v) ? [] : {};
  seen.set(v, o);
  for (const k of Reflect.ownKeys(v)) { const d = Object.getOwnPropertyDescriptor(v, k); if ('value' in d) d.value = copyOf(d.value, seen); Object.defineProperty(o, k, d); }
  return o;
}
function diff(a, b, p = '', out = []) {
  if (out.length >= 6 || Object.is(a, b)) return out;
  const show = (x) => (x === undefined ? 'undefined' : typeof x === 'number' && !isFinite(x) ? String(x) : JSON.stringify(x));
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || tag(a) !== tag(b)) { out.push((p || '.') + ': ' + show(a) + ' → ' + show(b)); return out; }
  for (const k of Reflect.ownKeys(a)) if (!Object.prototype.hasOwnProperty.call(b, k)) out.push(p + '.' + String(k) + ': present → absent');
  for (const k of Reflect.ownKeys(b)) if (!Object.prototype.hasOwnProperty.call(a, k)) out.push(p + '.' + String(k) + ': absent → present');
  for (const k of Reflect.ownKeys(a)) if (Object.prototype.hasOwnProperty.call(b, k)) diff(a[k], b[k], p + '.' + String(k), out);
  return out;
}

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const LS = storage();
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true, localStorage: LS });
  const C = RB.content, S = RB.state, G = RB.questGuide;
  const flat = (x) => JSON.stringify(x);
  // (on the parent, for the control, neither of the two exists: each check below then fails on its own)
  const itemArgs = S.itemArgs || (() => ({ ok: null, n: null, quiet: null }));
  const repair = S.repairQuietGives || ((s) => s);

  // ---- 1. the reader -----------------------------------------------------------------------------------------------
  {
    const read = (...x) => { const r = itemArgs(['it'].concat(x)); return [r.ok, r.n, r.quiet]; };
    t.eq([read(), read('quiet'), read('3'), read('3', 'quiet'), read('quiet', '3'), read('0')],
      [[true, 1, false], [true, 1, true], [true, 3, false], [true, 3, true], [true, 3, true], [true, 0, false]],
      '1 no count is one; quiet; a count; a count and quiet in either order; zero');
    t.eq(['bogus', ['3', '4'], 'NaN', 'Infinity', '-Infinity', '', ['quiet', 'loud']].map((x) => itemArgs(['it'].concat(x)).ok), [false, false, false, false, false, false, false],
      '1 refused: an unknown word, a second count, NaN, Infinity, an empty argument, quiet with another word');
    const cmds = [];
    for (const id in C.scenes) for (const c of C.scenes[id].cmds || []) if (c.op === 'give' || c.op === 'take') cmds.push({ id, op: c.op, args: c.args, line: c.line });
    const read2 = cmds.map((c) => ({ c, r: itemArgs(c.args) }));
    const counted = read2.filter((x) => x.r.n !== 1).map((x) => x.c.op + ' ' + x.c.args.join(' '));
    const quiet = read2.filter((x) => x.r.quiet).map((x) => x.c.args[0]).sort();
    t.ok(read2.length > 100 && read2.every((x) => x.r.ok), '1 every give and take in the content reads (' + read2.length + ')');
    t.eq([counted.sort(), quiet], [['give yn_eggs 3', 'take sg_seaglass 3'], ['ko_leaf_lf', 'rw_letter', 'rw_tea_leaves']], '1 two with a count (the eggs, the sea glass), three quiet (the leaf, the letter, the tea leaves)');
  }

  // ---- 2. the runner, and 3. the guide's simulator ----------------------------------------------------------------
  {
    const slips = [], warns = [], calls = [];
    RB.ui.toast = async (o) => { if (o && o.kind === 'item') slips.push(o.id + ' ' + o.n); };
    RB.ui.dialogue.say = async () => {}; RB.ui.dialogue.choose = async () => 0; RB.ui.dialogue.hide = () => {};
    RB.ui.fade = async () => {};
    for (const k of ['dismissExtras', 'refreshActors', 'placeCompanion', 'ensureSpeaker']) RB.world[k] = () => {};
    RB.world.scriptMove = async () => {}; RB.game.afterScene = () => {}; RB.save.autosave = async () => {};
    const cw = console.warn;
    console.warn = (...a) => { if (/not a count or quiet/.test(String(a[0]))) warns.push(String(a[0])); else cw(...a); };
    let live = null;
    const Sg = S.give, St = S.take;
    S.give = (st, id, n) => { calls.push((st === live ? 'run' : 'sim') + ' give ' + id + ' ' + n); return Sg(st, id, n); };
    S.take = (st, id, n) => { calls.push((st === live ? 'run' : 'sim') + ' take ' + id + ' ' + n); return St(st, id, n); };
    RB.script.add([
      '@scene zz.qg_give',
      '!give rw_letter quiet',
      '!give yn_eggs 3',
      '!give sg_seaglass 2 quiet',
      '!give rw_tea_leaves quiet 2',
      '!give ko_leaf_lf bogus',
      '!take yn_eggs 1 2',
      '!take sg_seaglass quiet',
      '!quest zz_qg done',
    ].join('\n'), 'zz_quiet_give.rbs');
    C.quests.zz_qg = { title: { en: 'probe', jp: 'probe' }, stages: [{ en: 'probe', jp: 'probe' }] };
    C.maps['rw.village'].npcs.push({ id: 'zz_qg', x: 20, y: 28, talk: 'zz.qg_give' });
    const s = S.newCampaign({ edition: 2 }); s.id = 'quiet-give'; s.map = 'rw.village'; [s.x, s.y] = C.maps['rw.village'].spawn.default;
    s.quests.zz_qg = { stage: 0 };
    RB.game.G.s = s; RB.game.s = s; live = s;
    // the simulator first (the journey not yet changed)
    G.reset(); G.targets('zz_qg', s);
    const sim = calls.filter((x) => x.startsWith('sim')).map((x) => x.slice(4));
    calls.length = 0;
    await RB.script.run('zz.qg_give');
    const run = calls.filter((x) => x.startsWith('run')).map((x) => x.slice(4));
    t.eq(run, ['give rw_letter 1', 'give yn_eggs 3', 'give sg_seaglass 2', 'give rw_tea_leaves 2', 'take sg_seaglass 1'], '2 the runner gives and takes what the commands say; the refused two do nothing');
    t.eq({ inv: ['rw_letter', 'yn_eggs', 'sg_seaglass', 'rw_tea_leaves', 'ko_leaf_lf'].map((k) => s.inv[k]), marks: Object.keys(s.newItems || {}).sort() },
      { inv: [1, 3, 1, 2, undefined], marks: ['rw_letter', 'rw_tea_leaves', 'sg_seaglass', 'yn_eggs'] },
      '2 the Satchel: the letter, three eggs, one sea glass (two given, one taken), two tea leaves; marked new as gifts are; no leaf');
    t.eq(slips, ['yn_eggs 3'], '2 one slip, for the one gift not quiet, with the count read');
    t.ok(warns.length === 2 && /give ko_leaf_lf: not a count or quiet: bogus \(zz\.qg_give line \d+\)/.test(warns[0]) && /take yn_eggs: not a count or quiet: 2 \(zz\.qg_give line \d+\)/.test(warns[1]),
      '2 the two refused are reported with their scene and line ' + flat(warns));
    t.ok(sim.length >= 5 && flat([...new Set(sim)].sort()) === flat([...new Set(run)].sort()) && !sim.some((x) => /ko_leaf_lf|take yn_eggs/.test(x)),
      '3 the guide follows the scene with the same gives and takes, and nothing for the refused two ' + flat(sim));
    // zero, the count as read: nothing held, nothing marked
    {
      const z = S.newCampaign({ edition: 2 }); z.map = 'rw.village'; [z.x, z.y] = C.maps['rw.village'].spawn.default;
      RB.script.add('@scene zz.qg_zero\n!give yn_eggs 0', 'zz_quiet_give_zero.rbs');
      RB.game.G.s = z; RB.game.s = z; live = z; slips.length = 0;
      await RB.script.run('zz.qg_zero');
      t.ok(!('yn_eggs' in z.inv) && !(z.newItems || {}).yn_eggs, '2 a count of zero: nothing held and nothing marked new ' + flat({ inv: z.inv.yn_eggs, marks: z.newItems, slips }));
    }
    console.warn = cw; S.give = Sg; S.take = St; live = null;
    C.maps['rw.village'].npcs = C.maps['rw.village'].npcs.filter((n) => n.id !== 'zz_qg');
    delete C.quests.zz_qg; G.reset();
  }

  // ---- 4. loading -------------------------------------------------------------------------------------------------
  {
    const journey = (inv, flags, marks) => {
      const s = S.newCampaign({ edition: 2 }); s.id = 'quiet-load'; s.map = 'rw.village'; [s.x, s.y] = C.maps['rw.village'].spawn.default;
      Object.assign(s.inv, { sg_plate: 1, yn_eggs: 3 }, inv); Object.assign(s.flags, flags || {});
      if (marks) s.newItems = Object.assign({}, marks);
      return s;
    };
    const cases = [
      ['the leaf held (not sent home)', { ko_leaf_lf: null }, {}, { ko_leaf_lf: 1 }],
      ['the leaf sent home (ko_ret_lf)', { ko_leaf_lf: null }, { ko_ret_lf: true }, { ko_leaf_lf: undefined }],
      ['the letter not yet given to Tsuru', { rw_letter: null }, {}, { rw_letter: 1 }],
      ['the letter given to Tsuru (rw_met_tsuru)', { rw_letter: null }, { rw_met_tsuru: true }, { rw_letter: undefined }],
      ['the tea leaves', { rw_tea_leaves: null }, {}, { rw_tea_leaves: 1 }],
      ['all three at once', { ko_leaf_lf: null, rw_letter: null, rw_tea_leaves: null }, { rw_met_tsuru: true }, { ko_leaf_lf: 1, rw_letter: undefined, rw_tea_leaves: 1 }],
    ];
    for (const [name, inv, flags, want] of cases) {
      for (const how of ['a save (null, through JSON)', 'a running journey (NaN)']) {
        const s = journey(how.startsWith('a save') ? inv : Object.fromEntries(Object.entries(inv).map(([k]) => [k, NaN])), flags, { sg_plate: true });
        const before = copyOf(s);
        const m = how.startsWith('a save') ? RB.save.migrate(JSON.parse(JSON.stringify(s))) : repair(s);
        const once = copyOf(m);
        const again = how.startsWith('a save') ? RB.save.migrate(JSON.parse(JSON.stringify(m))) : repair(m);
        const exp = copyOf(before);
        for (const k in want) { if (want[k] === undefined) delete exp.inv[k]; else exp.inv[k] = want[k]; }
        const dInv = diff(exp.inv, m.inv), dMarks = diff(before.newItems, m.newItems), dFlags = diff(before.flags, m.flags);
        const dAgain = how.startsWith('a save') ? diff(JSON.parse(JSON.stringify(once)), JSON.parse(JSON.stringify(again))) : diff(once, again);
        t.ok(!dInv.length && !dMarks.length && !dFlags.length && !dAgain.length,
          '4 ' + name + ', from ' + how + ': ' + flat(want) + '; the other items, the flags and the "new" marks as they were; again, the same ' + flat({ dInv, dMarks, dFlags, dAgain }));
      }
    }
    // left as they are: what is not exactly null or NaN, and other items
    {
      const odd = { ko_leaf_lf: undefined, rw_letter: '1', rw_tea_leaves: Infinity };
      const others = [
        ['undefined, a numeric string, Infinity', odd],
        ['an object, true, zero', { ko_leaf_lf: {}, rw_letter: true, rw_tea_leaves: 0 }],
        ['finite counts (2, 1, 2)', { ko_leaf_lf: 2, rw_letter: 1, rw_tea_leaves: 2 }],
        ['absent', {}],
        ['another item null, and another NaN', { sg_plate: null, yn_eggs: NaN }],
      ];
      for (const [name, inv] of others) {
        const s = journey(inv, {}, null);
        const before = copyOf(s);
        repair(s);
        const d = diff(before, s);
        t.ok(!d.length, '4 left as they are: ' + name + ' ' + flat(d));
      }
      const s = journey({}, {}, null);
      const before = copyOf(s);
      RB.save.migrate(s);
      const d = diff(before.inv, s.inv);
      t.ok(!('ko_leaf_lf' in s.inv) && !('rw_letter' in s.inv) && !('rw_tea_leaves' in s.inv) && !d.length, '4 loading a journey without the three: none of them is granted, every item as it was ' + flat(d));
    }
    // through the save layer, saved and loaded again and again: nothing comes back or doubles
    {
      t.eq(await RB.save.detect(), 'local', '4 the save layer runs on the stand-in localStorage');
      const s = journey({ ko_leaf_lf: null, rw_letter: null, rw_tea_leaves: null }, { rw_met_tsuru: true }, {});
      await RB.save.writeSlot(1, s);
      const seen = [];
      for (let i = 0; i < 3; i++) {
        const r = (await RB.save.read(1, 'manual')).state;
        seen.push([r.inv.ko_leaf_lf, r.inv.rw_letter, r.inv.rw_tea_leaves, flat(r.newItems || {})]);
        await RB.save.writeSlot(1, r);
      }
      t.eq(seen, [[1, undefined, 1, '{}'], [1, undefined, 1, '{}'], [1, undefined, 1, '{}']], '4 saved and loaded three times: the leaf one, the letter gone, the tea leaves one, no "new" mark, each time');
    }
  }

  // ---- 5. the scenes, and 6. the seven-return boundary ----------------------------------------------------------------
  {
    const said = [], offered = [], slips = [], errors = [];
    RB.ui.dialogue.say = async (l) => { if (l) said.push(l.en || ''); };
    RB.ui.dialogue.choose = async (o) => { offered.push((o || []).map((x) => x.en || '')); return 0; };
    RB.ui.toast = async (o) => { if (o && o.kind === 'item') slips.push(o.id + ' ' + o.n); };
    RB.ui.card = async () => {};
    const ce = console.error;
    console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else ce(...a); };
    if (RB.test && RB.test.enable) RB.test.enable();
    const s = S.newCampaign({ edition: 2 }); s.id = 'quiet-scenes'; s.comp = 'nao'; s.map = 'rw.village'; [s.x, s.y] = C.maps['rw.village'].spawn.default;
    RB.game.G.s = s; RB.game.s = s;
    const play = async (id) => { said.length = 0; offered.length = 0; slips.length = 0; await RB.script.run(id); return { said: said.slice(), offered: offered.slice(), slips: slips.slice() }; };
    let r = await play('rw.arrive');
    t.ok(s.inv.rw_letter === 1 && !r.slips.length && S.test(s, 'item.rw_letter'), '5 the arrival: the letter quietly given (no slip), held as one ' + flat({ letter: s.inv.rw_letter, slips: r.slips }));
    r = await play('rw.tsuru_first');
    t.ok(!('rw_letter' in s.inv) && s.flags.rw_met_tsuru && r.offered[0] && r.offered[0][0] === 'Hand over the letter.', '5 Tsuru: "Hand over the letter." offered and chosen; the letter taken, gone from the Satchel ' + flat({ letter: s.inv.rw_letter, offered: r.offered[0] }));
    r = await play('rw.hana_first');
    t.ok(s.inv.rw_tea_leaves === 1 && !r.slips.length, '5 Hana: the tea leaves quietly given, one ' + flat({ tea: s.inv.rw_tea_leaves, slips: r.slips }));
    r = await play('rw.hana_rush');
    t.ok(s.inv.rw_tea_leaves === 2 && flat(r.slips) === flat(['rw_tea_leaves 1']), '5 the rush: one more, with its slip; two ' + flat({ tea: s.inv.rw_tea_leaves, slips: r.slips }));
    r = await play('ko.call');
    t.ok(s.inv.ko_leaf_lf === 1 && !r.slips.length && S.test(s, 'item.ko_leaf_lf'), '5 Kotonoha\'s call: the leaf quietly given (no slip), held as one ' + flat({ leaf: s.inv.ko_leaf_lf, slips: r.slips }));
    r = await play('ko.otoha_first');
    t.ok(r.said.some((x) => /And the leaf in that letter/.test(x)), '5 Otoha: her line about the leaf in the letter is said');
    const before = s.vars.ko_ret || 0;
    r = await play('ko.windstone');
    t.ok(r.offered[0] && r.offered[0][0] === '"Against"' && !('ko_leaf_lf' in s.inv) && s.flags.ko_ret_lf && (s.vars.ko_ret || 0) === before + 1,
      '5 the Wind Stone: "Against" offered and chosen; the leaf sent home, gone, and counted once ' + flat({ offered: r.offered[0], leaf: s.inv.ko_leaf_lf, ret: s.vars.ko_ret }));
    // 6. seven home already, the leaf saved as null
    {
      const L = S.newCampaign({ edition: 2 }); L.id = 'quiet-seven'; L.comp = 'nao'; L.map = 'ko.village'; [L.x, L.y] = (C.maps['ko.village'].spawn && C.maps['ko.village'].spawn.default) || [10, 10];
      Object.assign(L.flags, { ko_otoha_met: true, ko_ret_rw: true, ko_ret_sg: true, ko_ret_mb: true, ko_ret_mp: true, ko_ret_co: true, ko_ret_sb: true, ko_ret_kr: true });
      L.vars.ko_ret = 7; L.inv.ko_leaf_lf = null;
      const earnedNow = (x) => !!(RB.stampBook && RB.stampBook.earned && RB.stampBook.earned(x, 'ko.leaves'));
      const m = RB.save.migrate(JSON.parse(JSON.stringify(L)));
      t.ok(m.inv.ko_leaf_lf === 1 && m.vars.ko_ret === 7 && !earnedNow(m) && !m.flags.ko_ret_lf, '6 loaded: the leaf held as one; seven returns still, "Every leaf home" not earned, nothing sent ' + flat({ leaf: m.inv.ko_leaf_lf, ret: m.vars.ko_ret, earned: earnedNow(m) }));
      RB.game.G.s = m; RB.game.s = m;
      offered.length = 0;
      await RB.script.run('ko.windstone');
      t.ok(offered[0] && offered[0][0] === '"Against"' && m.vars.ko_ret === 8 && m.flags.ko_ret_lf && !('ko_leaf_lf' in m.inv) && earnedNow(m),
        '6 the eighth return: "Against" offered, counted once (eight), the leaf gone, and "Every leaf home" earned by its own criterion ' + flat({ offered: offered[0], ret: m.vars.ko_ret, earned: earnedNow(m) }));
    }
    t.eq(errors, [], '5 no scene ended on an error');
    console.error = ce;
  }
};
