// The Cloudroad's everlasting lamps: "Come back later" is not the name said (Agnes 6639438614, findings 14 and 15;
// Cloud CC-522, CC-525; Local CL-689; Agnes 6639995441). Each of the seven lamps (one template,
// src/content/cr/21_scenes_stations.js) ran its naming exercise and went on to light the lamp whatever it returned, so a
// cancel lit it, opened the station's palanquin and let the departure go on. Now the exercise is followed by
// `?(var._res=0) !end`. With synthetic campaigns only: the real scene runner (the dialogue stubbed), each lamp's scene
// as its dark prop runs it, the exercise answered or cancelled by the test as the runner returns it, saves round-tripped
// through the save's own migration:
//  1. the template: in all seven lamp scenes, the guard straight after the exercise, before the lamp is lit;
//  2. each lamp left: not lit, no name called, no light; the dark lamp still there and the lit one not; the station's
//     palanquin not there; its departure (stations 1 to 5) asks for the lamp first; the palanquin elsewhere does not
//     offer it;
//  3. then each lamp named: lit, the name called once, the lit lamp, the palanquin, the departure past the lamp, the
//     palanquin elsewhere offering it (Kumoi once the Barrier is passed, as before);
//  4. left twice, a save and load, then named: lit once;
//  5. a result left over from another exercise changes nothing;
//  6. each lamp's first naming, line for line as on the parent, with Ren (who calls the name) and with Nao (fingerprints
//     taken on the parent, bab26c9); no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const STN = C.cloudroad.STATIONS;
  const NAMES = ['Oiwake', 'Suginoki', 'Sakashita', 'Nakayama', 'Umagaeshi', 'Kirishita', 'Kumoi'];

  // ---- a minimal stage (as tests/unit/lf_bell_cancel.test.mjs) -----------------------------------------------------
  let lines = [], cancel = new Set(), asked = [], offered = [], moved = 0, warps = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async (opts) => { offered.push((opts || []).map((o) => (o && (o.en || o.text)) || '')); return (opts || []).length - 1; };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.world.scriptMove = async () => { moved++; };
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.inBattle = () => false;
  RB.game.transition = async (map) => { warps.push(map); };
  RB.save.autosave = async () => {};
  if (RB.staging) RB.staging.walkTo = async () => {};
  RB.hooks.tellings = async () => { RB.game.G.s.vars._tell = 'cancel'; };
  RB.challenge.run = async (id) => { asked.push(id); if (cancel.has(id)) return { ok: false, cancelled: true }; RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'cr-lamp-cancel-test'; st.map = o.map || STN[0]; st.comp = o.comp === undefined ? 'ren' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true }, o.flags || {});
    st.inv = Object.assign({ cr_ledger: 1 }, o.inv || {});
    st.vars = Object.assign({}, o.vars || {});
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, o = {}) => { lines = []; asked = []; offered = []; moved = 0; warps = []; cancel = new Set(o.cancel || []); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  const said = (re) => lines.some((l) => re.test(l.en));
  const count = (re) => lines.filter((l) => re.test(l.en)).length;
  const LIT = /light comes up in the paper windows/, ASK_LAMP = /give the station's lamp its name back/;
  // what the station's map offers now: its dark lamp, its lit lamp, its palanquin
  const props = (n) => {
    const m = C.maps[STN[n - 1]], live = (m.props || []).filter((p) => !p.if || S.test(s, p.if));
    return { dark: live.some((p) => p.scene === 'cr.lamp' + n), lit: live.some((p) => p.scene === 'cr.lamp_lit'), kago: live.some((p) => p.scene === 'cr.ride') };
  };
  // the palanquin from another lit station: is this one offered?
  const rideOffers = async (n) => { await run('cr.ride'); return (offered[0] || []).some((x) => x === 'To ' + NAMES[n - 1]); };
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));

  // 1. the template
  {
    const bad = [];
    for (let n = 1; n <= 7; n++) {
      const cmds = C.scenes['cr.lamp' + n].cmds, i = cmds.findIndex((c) => c.op === 'challenge' && c.args[0] === 'cr.name' + n);
      if (!(i > 0 && cmds[i + 1].op === 'end' && cmds[i + 1].if === 'var._res=0' && cmds[i + 2].op === 'set' && cmds[i + 2].args[0] === 'cr_lamp' + n)) bad.push(n);
    }
    t.ok(!bad.length, '1 the template: in all seven lamp scenes, the guard straight after the exercise, before the lamp is lit ' + flat({ bad }));
  }

  // 2 and 3. each lamp left, then named
  {
    const left = {}, named = {};
    for (let n = 1; n <= 7; n++) {
      // another station already lit, for the palanquin; Kumoi needs the Barrier passed, as before
      const other = n === 1 ? 2 : 1;
      fresh({ map: STN[n - 1], flags: Object.assign({ ['cr_lamp' + other]: true, cr_passed: true }, n <= 5 ? { ['cr_given' + n]: true } : {}) });
      await run('cr.lamp' + n, { cancel: ['cr.name' + n] });
      const a = Object.assign({ lit: !!s.flags['cr_lamp' + n], asked: asked.slice(), called: said(LIT) }, props(n));
      if (n <= 5) { await run('cr.depart' + n); a.depart = said(ASK_LAMP) && warps.length === 0; }
      a.offered = await rideOffers(n);
      left[n] = a;
      await run('cr.lamp' + n);
      const b = Object.assign({ lit: !!s.flags['cr_lamp' + n], asked: asked.slice(), called: count(LIT) }, props(n));
      if (n <= 5) { await run('cr.depart' + n); b.depart = !said(ASK_LAMP); }
      b.offered = await rideOffers(n);
      named[n] = b;
    }
    const badL = Object.entries(left).filter(([n, a]) => a.lit || a.called || flat(a.asked) !== flat(['cr.name' + n]) || !a.dark || a.lit || a.kago || (+n <= 5 && !a.depart) || a.offered).map(([n]) => n);
    const badN = Object.entries(named).filter(([n, b]) => !b.lit || b.called !== 1 || flat(b.asked) !== flat(['cr.name' + n]) || b.dark || !b.kago || (+n <= 5 && !b.depart) || !b.offered).map(([n]) => n);
    t.ok(!badL.length, '2 each lamp left: not lit, no name called, the dark lamp still there, no palanquin, the departure asks for the lamp first, not offered by the palanquin elsewhere ' + flat({ badL, left: left[1], left7: left[7] }));
    t.ok(!badN.length, '3 then each lamp named: lit, the name called once, the lit lamp, the palanquin, the departure past the lamp, offered by the palanquin elsewhere ' + flat({ badN, named: named[1], named7: named[7] }));
  }

  // 4. left twice, a save and load, then named
  {
    fresh({ map: STN[2] });
    let calls = 0;
    await run('cr.lamp3', { cancel: ['cr.name3'] }); calls += count(LIT);
    await run('cr.lamp3', { cancel: ['cr.name3'] }); calls += count(LIT);
    loadSave(saved());
    await run('cr.lamp3'); calls += count(LIT);
    t.ok(calls === 1 && s.flags.cr_lamp3 && props(3).kago, '4 left twice, a save and load, then named: lit once ' + flat({ calls, lit: !!s.flags.cr_lamp3 }));
  }

  // 5. a result left over from another exercise changes nothing
  {
    fresh({ map: STN[0], vars: { _res: 0 } });
    await run('cr.lamp1');
    const a = { lit: !!s.flags.cr_lamp1 };
    fresh({ map: STN[0], vars: { _res: 1 } });
    await run('cr.lamp1', { cancel: ['cr.name1'] });
    const b = { lit: !!s.flags.cr_lamp1, called: said(LIT) };
    t.ok(a.lit && !b.lit && !b.called, '5 a stale result of 0 before a naming, and of 1 before a cancel, change nothing ' + flat({ a, b }));
  }

  // 6. each lamp's first naming, line for line as before
  {
    const got = {};
    for (let n = 1; n <= 7; n++) for (const comp of ['ren', 'nao']) {
      fresh({ map: STN[n - 1], comp });
      await run('cr.lamp' + n);
      got[n + ':' + comp] = fp(lines);
    }
    t.ok(fp(got) === FIRST_FP, '6 each lamp\'s first naming, line for line as on the parent, with Ren and with Nao ' + flat({ fp: fp(got) }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
// computed on the parent (bab26c9): each lamp's first naming, with Ren and with Nao
const FIRST_FP = '1af9aca05d413c26';
