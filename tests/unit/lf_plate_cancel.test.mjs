// The bell tower's three gate plates: "Come back later" is not the plate read (QA-191; Cloud CC-610; Agnes 6913897483,
// who decided that a cancel shows neither the rule nor the read flag; Local CL-848). Each plate (lf.plate_a, _b, _c in
// src/content/ch5/24_tower.js) asks its reading challenge and read no result, so a cancel set its _read flag and showed
// its rule, and every later visit went straight to the rule. Now each challenge is followed by `?(var._res=0) !end`.
// With synthetic campaigns only: the real scene runner (the dialogue stubbed, every choice its first option), the
// challenge answered or cancelled by the test as the runner returns it (src/ui/65_challenge.js: a cancel returns
// { ok: false, cancelled: true }), saves round-tripped through the save's own migration. Per plate:
//  1. the scene: a guard straight after its challenge;
//  2. a cancel: the plate's first line only; no _read flag, no rule; the scene marked seen, as any scene that ends early;
//  3. the retry: the challenge again; answered, the flag and the rule, as before;
//  4. read: the rule only, the challenge not asked;
//  5. a cancel, a save and load: the challenge asked again;
//  6. a save already marked read (no migration): the rule only;
//  7. the existing cues, which read the flags, now told the truth after a cancel:
//     plate A, the lower wheel stuck: the narrator's "read it first" and no companion's read commentary (all four
//       companions), and after reading, that companion's commentary and no "read it first";
//     plate B, the west plug stuck: the narrator's "a plate on the north wall", not the recalled first line, and after
//       reading, the recalled line;
//     plate C has no cue that reads its flag: the north plug pulled first plays the same lines after a cancel as after
//       reading;
//  8. the gates work after a cancel and after reading alike: A (close the upper wheel, open the lower), B (open the east
//     door, pull the west plug, close the door), C (the south plug, then the north): the same gate flags either way;
//  no scene ended on an error from the runner. No new text: every line checked here is already in the file.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);

  // ---- a minimal stage (as tests/unit/mp_saku_cancel.test.mjs) ------------------------------------------------------------
  let lines = [], cancel = new Set(), asked = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.inBattle = () => false;
  RB.game.transition = async () => {};
  RB.save.autosave = async () => {};
  if (RB.staging) RB.staging.walkTo = async () => {};
  RB.audio.playSong = () => {};
  RB.challenge.run = async (id) => { asked.push(id); if (cancel.has(id)) return { ok: false, cancelled: true }; RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  const BASE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'lf_arrived', 'lf_town_intro', 'lf_yae_told', 'lf_tokuji_told', 'lf_tokuji_boat', 'lf_akari_key', 'lf_stacks_open', 'lf_ledger_seen',
    'lf_conduit_seen', 'lf_tower_entered'];
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (map, o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'lf-plate-test'; st.map = map; st.comp = o.comp || 'nao';
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    for (const f of BASE) st.flags[f] = true;
    Object.assign(st.flags, o.flags || {});
    st.quests.lf_main = { stage: 7, done: false, t: 1 };
    st.vars = {};
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  // the runner's console is the whole process's (tests/lib/load.mjs gives each file Node's own): put it back whatever
  // happens, so a later test's scene errors still print (CL-860, Agnes 6921074159)
  try {
    const run = async (id, o = {}) => { lines = []; asked = []; cancel = new Set(o.cancel ? [o.cancel] : []); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
    const saveLoad = () => use(RB.save.migrate(JSON.parse(JSON.stringify(s))));
    const said = (re) => lines.some((l) => re.test(l.en));
    const en = () => lines.map((l) => l.en);

    // the plates: scene, challenge, flag, floor, the first line, the rule's lines
    const PLATES = [
      { k: 'A', scene: 'lf.plate_a', ch: 'lf.ch_gate1', flag: 'lf_plate_a_read', map: 'lf.tower_upper', first: /^A bronze plate, engraved with instructions for the gates\.$/,
        rule: [/^"Unless the upper gate is closed, the lower gate will not open\."$/, /^Two wheels: "upper" on the west wall, "lower" on the east wall\.$/] },
      { k: 'B', scene: 'lf.plate_b', ch: 'lf.ch_gate2', flag: 'lf_plate_b_read', map: 'lf.tower_mid', first: /^The second bronze plate\. More writing on this one\.$/,
        rule: [/^"Unless the east door is open, the west plug cannot be pulled\."$/, /^"Once the water has gone down, close the east door\./] },
      { k: 'C', scene: 'lf.plate_c', ch: 'lf.ch_gate3', flag: 'lf_plate_c_read', map: 'lf.tower_low', first: /^The third plate\.$/,
        rule: [/^"Until the south plug is pulled, the north plug must not be touched\."$/] },
    ];
    const ruled = () => PLATES.some((p) => p.rule.some((re) => said(re)));

    for (const P of PLATES) {
      // 1. the scene
      {
        const cmds = C.scenes[P.scene].cmds;
        const i = cmds.findIndex((c) => c.op === 'challenge');
        t.ok(cmds[i].args[0] === P.ch && cmds[i + 1].op === 'end' && cmds[i + 1].if === 'var._res=0' && cmds[i + 2].op === 'set' && cmds[i + 2].args[0] === P.flag,
          P.k + '1 plate ' + P.k + ': a guard straight after its challenge, before the flag is set');
      }
      // 2 and 3. a cancel; the retry
      {
        fresh(P.map);
        await run(P.scene, { cancel: P.ch });
        t.ok(lines.length === 1 && P.first.test(lines[0].en) && flat(asked) === flat([P.ch]) && !s.flags[P.flag] && !ruled() && s.seen[P.scene],
          P.k + '2 plate ' + P.k + ', a cancel: its first line only; no flag, no rule; the scene marked seen ' + flat({ en: en(), asked, flag: !!s.flags[P.flag] }));
        await run(P.scene);
        t.ok(P.first.test(lines[0].en) && flat(asked) === flat([P.ch]) && s.flags[P.flag] && P.rule.every((re) => said(re)),
          P.k + '3 the retry: the challenge again; answered, the flag and the rule ' + flat({ en: en(), asked }));
        // 4. read
        await run(P.scene);
        t.ok(asked.length === 0 && P.rule.every((re) => said(re)) && P.first.test(lines[0].en), P.k + '4 read: the rule only, the challenge not asked ' + flat({ en: en(), asked }));
      }
      // 5. a cancel, a save and load
      {
        fresh(P.map);
        await run(P.scene, { cancel: P.ch });
        saveLoad();
        t.ok(!s.flags[P.flag], P.k + '5 saved and loaded after a cancel: not read');
        await run(P.scene, { cancel: P.ch });
        t.ok(flat(asked) === flat([P.ch]) && !s.flags[P.flag] && !ruled(), P.k + '5 and the plate asks again ' + flat({ en: en(), asked }));
      }
      // 6. a save already marked read
      {
        fresh(P.map, { flags: { [P.flag]: true } });
        saveLoad();
        await run(P.scene);
        t.ok(s.flags[P.flag] && asked.length === 0 && P.rule.every((re) => said(re)), P.k + '6 a save already marked read: the rule only, as before ' + flat({ en: en(), asked }));
      }
    }

    // 7. the existing cues
    const READ_FIRST = /^There's a bronze plate on the wall nearby\. Better read it first\.$/;
    const A_SAYS = { nao: /^"Unless it's closed, it won't open\." Upper first\.$/, mio: /^Didn't the plate say to close the upper one first\?$/, ren: /^We haven't met the plate's condition yet\. The west wheel\.$/, suzu: /^We skipped a step\. Upper first\.$/ };
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
      fresh('lf.tower_upper', { comp });
      await run('lf.plate_a', { cancel: 'lf.ch_gate1' });
      await run('lf.wheel_lower');
      const others = Object.values(A_SAYS).filter((re) => said(re)).length;
      t.ok(said(/^The wheel won't budge\.$/) && said(READ_FIRST) && others === 0 && !s.flags.lf_gate_a,
        'A7 ' + comp + ', plate A cancelled, the lower wheel stuck: the narrator\'s "read it first", no read commentary ' + flat(en()));
      await run('lf.plate_a');
      await run('lf.wheel_lower');
      t.ok(said(A_SAYS[comp]) && !said(READ_FIRST) && Object.values(A_SAYS).filter((re) => said(re)).length === 1,
        'A7 ' + comp + ', then read: ' + comp + '\'s commentary, and no "read it first" ' + flat(en()));
    }
    {
      const NORTH = /^There's a plate on the north wall\.$/, RECALL = /^You recall the plate's first line: "Unless the east door is open, the west plug cannot be pulled\."$/;
      fresh('lf.tower_mid', { flags: { lf_gate_a: true } });
      await run('lf.plate_b', { cancel: 'lf.ch_gate2' });
      await run('lf.west_plug');
      t.ok(said(/^The plug won't move/) && said(NORTH) && !said(RECALL) && !s.flags.lf_mid_drained, 'B7 plate B cancelled, the west plug stuck: "a plate on the north wall", not the recalled line ' + flat(en()));
      await run('lf.plate_b');
      await run('lf.west_plug');
      t.ok(said(RECALL) && !said(NORTH), 'B7 then read: the recalled first line ' + flat(en()));
    }
    {
      const readers = Object.keys(C.scenes).filter((id) => C.scenes[id].cmds.some((c) => (c.if || '').includes('lf_plate_c_read') || ((c.op === 'if') && c.args.join(' ').includes('lf_plate_c_read'))));
      t.ok(flat(readers) === flat(['lf.plate_c']), 'C7 nothing outside plate C reads its flag ' + flat(readers));
      const surge = async (read) => {
        fresh('lf.tower_low', { comp: 'ren', flags: { lf_gate_a: true, lf_gate_b: true } });
        await run('lf.plate_c', read ? {} : { cancel: 'lf.ch_gate3' });
        await run('lf.north_plug');
        return flat(lines);
      };
      const a = await surge(false), b = await surge(true);
      t.ok(a === b && /water spouts up/.test(a), 'C7 the north plug pulled first: the same lines after a cancel as after reading');
    }

    // 8. the gates, after a cancel and after reading
    const GATES = {
      A: { map: 'lf.tower_upper', pre: {}, plate: 'lf.plate_a', ch: 'lf.ch_gate1', steps: ['lf.wheel_upper', 'lf.wheel_lower'], keys: ['lf_up_closed', 'lf_gate_a'] },
      B: { map: 'lf.tower_mid', pre: { lf_gate_a: true }, plate: 'lf.plate_b', ch: 'lf.ch_gate2', steps: ['lf.east_door', 'lf.west_plug', 'lf.east_door'], keys: ['lf_east_open', 'lf_mid_drained', 'lf_gate_b'] },
      C: { map: 'lf.tower_low', pre: { lf_gate_a: true, lf_gate_b: true }, plate: 'lf.plate_c', ch: 'lf.ch_gate3', steps: ['lf.south_plug', 'lf.north_plug'], keys: ['lf_south_pulled', 'lf_gate_c'] },
    };
    for (const k in GATES) {
      const g = GATES[k], out = {};
      for (const how of ['cancelled', 'read']) {
        fresh(g.map, { flags: g.pre });
        await run(g.plate, how === 'cancelled' ? { cancel: g.ch } : {});
        for (const sc of g.steps) await run(sc);
        out[how] = g.keys.map((f) => f + '=' + !!s.flags[f]).join(' ');
      }
      const last = g.keys[g.keys.length - 1];
      t.ok(out.cancelled === out.read && out.read.indexOf(last + '=true') >= 0, k + '8 gate ' + k + ' works after a cancel as after reading ' + flat(out));
    }

    t.ok(!errors.length, 'no scene ended on an error ' + errors.slice(0, 3).join(' | '));
  } finally {
    console.error = cerr;
  }
};
