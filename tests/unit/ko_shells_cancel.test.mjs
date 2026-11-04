// Kotonoha's conches: "Come back later" on the reading is not the telling heard (Agnes 6639438614, finding 13; Cloud
// CC-522, CC-525; Local CL-689; Agnes 6639995441). Once all three conches were heard, their sheet (who said what, to
// whom) and then the reading ran, and the scene went on to the fourth telling, Chitose's name and the companion's line,
// whatever the reading returned. Now the reading is followed by `!if var._res=0 -> later` (the scene's own "Listen
// again later"), and the sheet, once done, is not asked again (`!if shells_ko.s_first -> reading`: the flag the sheet
// already keeps when it is done, src/engine/72s_shells.js keep()).
// With synthetic campaigns only: the real scene runner (the dialogue stubbed), the conch's own scene as its prop runs
// it, the sheet and the reading answered or cancelled by the test as the game returns them, saves round-tripped
// through the save's own migration:
//  1. the scene: the shortcut on the sheet's own flag, `:reading`, the guard after the reading;
//  2. the sheet left: "Listen again later", no reading asked, nothing set;
//  3. the sheet done, the reading left: "Listen again later", the sheet remembered, no telling, no name;
//  4. a conch again: no sheet, the reading only; done: the telling, Chitose's name, the companion's line;
//  5. then a conch again: nothing more;
//  6. the reading left twice, a save and load, then done: the sheet once, the telling once;
//  7. a result left over from another exercise changes nothing;
//  8. saves from before: one with the telling heard is untouched; one whose sheet was left is asked the sheet again;
//  9. the first-time path, sheet and reading done, line for line as on the parent with each companion and none
//     (fingerprints taken on the parent, 1162db8); no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);

  // ---- a minimal stage (as tests/unit/lf_bell_cancel.test.mjs) -----------------------------------------------------
  let lines = [], cancel = new Set(), asked = [], sheets = [];
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
  // the sheet as the game's own hook ends it (src/ui/89s_shells.js): kept (its flag) when done, nothing when left
  RB.hooks.shells = async (a) => { const id = [].concat(a || [])[0]; sheets.push(id); const ok = !cancel.has('sheet'); RB.shells.keep(RB.game.G.s, id, { ok }); RB.game.G.s.vars._shells = ok ? 'ok' : 'cancel'; };
  RB.challenge.run = async (id) => { asked.push(id); if (cancel.has(id)) return { ok: false, cancelled: true }; RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'ko-shells-cancel-test'; st.map = 'ko.tidepools'; st.comp = o.comp === undefined ? 'nao' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ko_arrived: true, ko_otoha_met: true, ko_tell_otoha: true, ko_tell_nami: true, ko_tell_hamaji: true, ko_shell_a: true, ko_shell_b: true }, o.flags || {});
    st.quests.ko_main = { stage: 3, done: false, t: 1 };
    st.vars = Object.assign({}, o.vars || {});
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  // the conch at 24,11 (ko.shell_c), as its prop runs it: its two lines, then the check of all three
  const run = async (o = {}) => { lines = []; asked = []; sheets = []; cancel = new Set(o.cancel || []); try { await RB.script.run(o.scene || 'ko.shell_c'); } catch (e) { errors.push('ko.shell_c: ' + String((e && e.message) || e)); } return lines; };
  const said = (re) => lines.some((l) => re.test(l.en));
  const count = (re) => lines.filter((l) => re.test(l.en)).length;
  const B = { later: /Listen again later/, name: /Chitose\. The first keeper had a name/, comp: /kept writing letters|it was true\. …I'll remember|Someone who went uncalled|good lines/, who: /Who said what, to whom\?/ };
  const st = () => ({ told: !!s.flags.ko_tell_shell, sorted: !!s.flags['shells_ko.s_first'], chal: !!s.flags['chal:ko.shells_read'] });
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));

  // 1. the scene
  {
    const sc = C.scenes['ko.shells_check'], cmds = sc.cmds;
    const h = cmds.findIndex((c) => c.op === 'hook' && /^shells\b/.test((c.args || []).join(' ')));
    const r = cmds.findIndex((c) => c.op === 'challenge' && c.args[0] === 'ko.shells_read');
    const sk = cmds.findIndex((c) => c.op === 'if' && (c.args || []).join(' ') === 'shells_ko.s_first -> reading');
    const g = cmds[r + 1];
    t.ok(sk >= 0 && sk < h && sc.labels.reading === r && r === h + 2 && g && g.op === 'if' && (g.args || []).join(' ') === 'var._res=0 -> later' && cmds[r + 2].op === 'set' && cmds[r + 2].args[0] === 'ko_tell_shell' && !cmds.some((c) => c.op === 'set' && /shells/.test(c.args[0]) && c.args[0] !== 'ko_tell_shell'),
      '1 the scene: a sheet done (its own flag) goes to the reading; a guard after the reading, before the telling; no new flag ' + flat({ sk, h, reading: sc.labels.reading, r, g }));
  }

  // 2 to 5. the sheet left; the sheet done and the reading left; a conch again; then again
  {
    fresh();
    await run({ cancel: ['sheet'] });
    const a = Object.assign(st(), { sheets: sheets.slice(), asked: asked.slice(), later: said(B.later), name: said(B.name) });
    await run({ cancel: ['ko.shells_read'] });
    const b = Object.assign(st(), { sheets: sheets.slice(), asked: asked.slice(), later: said(B.later), name: said(B.name), comp: said(B.comp) });
    await run({ scene: 'ko.shell_a' });
    const c = Object.assign(st(), { sheets: sheets.slice(), asked: asked.slice(), later: said(B.later), name: said(B.name), comp: said(B.comp), who: said(B.who) });
    await run({ scene: 'ko.shell_b' });
    const d = Object.assign(st(), { sheets: sheets.slice(), asked: asked.slice(), later: said(B.later), name: said(B.name), n: lines.length });
    t.ok(a.sheets.length === 1 && a.asked.length === 0 && a.later && !a.name && !a.told && !a.sorted,
      '2 the sheet left: "Listen again later", no reading asked, nothing set ' + flat(a));
    t.ok(b.sheets.length === 1 && flat(b.asked) === '["ko.shells_read"]' && b.later && !b.name && !b.comp && !b.told && b.sorted && !b.chal,
      '3 the sheet done, the reading left: "Listen again later", the sheet remembered, no telling, no name, no companion\'s line ' + flat(b));
    t.ok(c.sheets.length === 0 && flat(c.asked) === '["ko.shells_read"]' && !c.later && c.name && c.comp && c.told && c.chal,
      '4 a conch again: no sheet, the reading only; done: the telling, Chitose\'s name, the companion\'s line ' + flat(c));
    t.ok(d.sheets.length === 0 && d.asked.length === 0 && !d.later && !d.name && d.told && d.n === 2,
      '5 then a conch again: its own two lines, nothing more ' + flat(d));
  }

  // 6. the reading left twice, a save and load, then done
  {
    fresh();
    let n = 0;
    await run({ cancel: ['ko.shells_read'] }); n += sheets.length;
    await run({ cancel: ['ko.shells_read'] }); n += sheets.length;
    loadSave(saved());
    await run({});
    n += sheets.length;
    const a = Object.assign(st(), { sheets: n, names: count(B.name), asked: asked.slice() });
    t.ok(a.sheets === 1 && a.told && a.names === 1 && flat(a.asked) === '["ko.shells_read"]',
      '6 the reading left twice, a save and load, then done: the sheet once, the telling once ' + flat(a));
  }

  // 7. a result left over from another exercise changes nothing
  {
    fresh({ vars: { _res: 0 } });
    await run({});
    const a = st();
    fresh({ vars: { _res: 1 } });
    await run({ cancel: ['ko.shells_read'] });
    const b = Object.assign(st(), { name: said(B.name) });
    t.ok(a.told && !b.told && !b.name && b.sorted, '7 a stale result of 0 before a reading, and of 1 before a cancel, change nothing ' + flat({ a, b }));
  }

  // 8. saves from before
  {
    fresh({ flags: { ko_tell_shell: true } });
    await run({});
    const a = Object.assign(st(), { sheets: sheets.slice(), asked: asked.slice(), n: lines.length });
    fresh();
    const b0 = st();
    await run({});
    const b = Object.assign(st(), { sheets: sheets.slice(), asked: asked.slice() });
    t.ok(a.sheets.length === 0 && a.asked.length === 0 && a.n === 2 && !b0.sorted && b.sheets.length === 1 && flat(b.asked) === '["ko.shells_read"]' && b.told,
      '8 a save with the telling heard is untouched; one whose sheet was left is asked the sheet again, then the reading ' + flat({ a, b }));
  }

  // 9. the first-time path, sheet and reading done, line for line as before
  {
    const got = {};
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      fresh({ comp });
      await run({});
      got[String(comp)] = fp(lines);
    }
    t.ok(fp(got) === FIRST_FP, '9 the first-time path, sheet and reading done, line for line as on the parent with each companion and none ' + flat({ fp: fp(got) }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
// computed on the parent (1162db8): the first-time path's lines with each companion
const FIRST_FP = '6f7ed53f9c9eab19';
