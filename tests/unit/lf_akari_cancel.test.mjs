// Akari's letters (Row A: Agnes 6639438614; Cloud CC-522, CC-525, CC-526; Local CL-693, CL-695; Agnes 6640720415,
// 6641781747). Hoshino's letter was given by itself at the first telling, and "Come back later" on its address, on the
// key or on her own second letter went on to the rest whatever it returned. Now the letter is given only when you
// choose to: before the bell, "Give her Hoshino's letter" or "Not now" at the first telling and at each later talk
// while it waits; after the bell, one informed offer ("Give her Hoshino's letter" or "Go on without giving her
// Hoshino's letter"). akari_offer is 0 fresh at each offer's entry, 1 given, 2 given and left by "Come back later" (set
// only in lf.akari_reply), and a caller ends the talk only on 2. The key and the second letter end on a cancel too. An
// unfinished quest comes ahead of her after-the-ending line. With synthetic campaigns only: the real scene runner (the
// dialogue stubbed), every talk through her own talk list, choices and exercises answered by the test as the runner
// asks for them, saves round-tripped through the save's own migration; the ending is a synthetic postgame flag, not a
// played ending:
//  1. the scenes: the reply's guard sets 2 and ends; each offer resets at its entry; the key's and the second letter's
//     guards; the second letter's request label; the two lines that belong before the bell; the talk list's order;
//  2. before the bell, the first telling: Not now: her story and her apology, the letter kept; then her talk: the
//     offer; given and left: the letter kept; then given: the reading once, the letter gone; then no offer;
//  3. the key: given and left ends the talk (no key); then Not now: the key conversation (a cancel before leaks
//     nothing into Not now); after the key: Not now, her usual lines; given and left, the talk ends; given, the talk
//     ends; then her usual lines only. The key left by "Come back later": no key, step 2; then the key;
//  4. after the bell: the first telling without the ordinary offer, then the informed offer; given and left: the end,
//     step 1, the letter kept; then given: the reading without the two before-the-bell lines, then her news as
//     received; or "Go on without": her news as not received, the letter kept;
//  5. her second letter left by "Come back later": step 2, no departure; then her request only, then done once;
//  6. after the ending (synthetic): a letter put off before the bell; her talk is her unfinished business, not her
//     after-the-ending line; given and left twice; then given, the second letter left, then done; then her
//     after-the-ending line. "Go on without" there too, with the letter kept. A finished quest, and one never started,
//     keep her after-the-ending line;
//  7. a save and load while the letter waits: the offer still there; a stale result both ways;
//  7b. routing in both bell states (Agnes 6645863351): before the bell her own scenes for the main quest's step; after
//     it, her unfinished business; after the ending, a quest at step 0 without the letter resumes too (her news and her
//     letter, not her after-the-ending line; no delivery, item or first-letter reward made up; Local CL-701; Agnes
//     6646216987), while the same quest before the bell keeps her before-the-bell scenes and no news; done, departed and
//     never begun keep her after-the-ending line;
//  7c. no repeated item effects: a cancelled delivery leaves the bag as it was; a delivery takes the letter once and
//     nothing else; Give, left, then Not now at the next talk; then Give and done (Agnes 6645863351);
//  8. the first-time paths line for line as on the parent, with each companion and none: the first telling with the
//     letter given, the key without a letter, her news and second letter after the bell (fingerprints taken on the
//     parent, 49db870); no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);

  // ---- a minimal stage (as tests/unit/lf_side_cancel.test.mjs) ----------------------------------------------------
  let lines = [], cancel = new Set(), asked = [], picks = [], offered = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async (opts) => { offered.push(opts.map((o) => o.en)); return picks.length ? picks.shift() : 0; };
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
  RB.lessons.run = async () => {};
  RB.challenge.run = async (id) => { asked.push(id); if (cancel.has(id)) return { ok: false, cancelled: true }; RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  const DONE = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, lf_arrived: true, lf_town_intro: true };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  // in the clerks' office; the main quest at `main` (1: before the key; 2: the key; 3: after it); Hoshino's letter held
  // unless `noLetter`; her quest at `akari` (undefined: not begun; 'done')
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'lf-akari-cancel-test'; st.map = 'lf.clerks'; st.comp = o.comp === undefined ? 'nao' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, DONE, o.flags || {});
    st.quests.lf_main = { stage: o.main === undefined ? 1 : o.main, done: false, t: 1 };
    if (o.akari !== undefined) st.quests.lf_akari = o.akari === 'done' ? { stage: 2, done: true, t: 1 } : { stage: o.akari, done: false, t: 1 };
    st.inv = Object.assign({}, o.noLetter ? {} : { sb_reply_letter: 1 });
    st.vars = Object.assign({}, o.vars || {});
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, o = {}) => { lines = []; asked = []; offered = []; picks = (o.pick || []).slice(); cancel = new Set(o.cancel || []); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  const talkOf = (map, id) => { const n = (C.maps[map].npcs || []).find((x) => x.id === id && (!x.if || S.test(s, x.if))); return n ? ((Array.isArray(n.talk) ? n.talk : [{ scene: n.talk }]).find((x) => !x.if || S.test(s, x.if)) || {}).scene : null; };
  // her talk: the scene her own list picks, run to its end
  const talk = async (o) => { const sc = talkOf('lf.clerks', 'akari'); await run(sc, o); return sc; };
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));
  const B = {
    story: /Every letter I write comes back "address unknown"/, sorry: /I'm sorry\. Telling a visitor all this/,
    give: /I've brought a letter from your father/, father: /Father's handwriting\. It shakes a little/,
    before: /I can't refuse overtime|I can't say "please give me leave"/,
    hint: /Was it you who copied the ledger/, key: /I haven't said a thing/, usual: /The basement\? I'm sure I know nothing/,
    news: /Listen! This morning I turned down overtime/, got: /Father wrote he'd come|Father says he'll come in spring|Father wrote "there's no need to hurry"/,
    notGot: /I'm going home to Snowbell\. It's been years/, ask2: /Would you check the address with me/, leave: /I'll have to scold him/,
    post: /I got back from leave yesterday/,
  };
  const GIVE = 'Give her Hoshino\'s letter', NOW = 'Not now', GOON = 'Go on without giving her Hoshino\'s letter';
  const count = (re) => lines.filter((l) => re.test(l.en)).length;
  const said = (re) => count(re) > 0;
  const st = () => ({ letter: (s.inv || {}).sb_reply_letter || 0, akari: s.quests.lf_akari ? (s.quests.lf_akari.done ? 'done' : s.quests.lf_akari.stage) : null, got: !!s.flags.lf_akari_got_reply,
    leave: !!s.flags.lf_akari_leave, key: (s.inv || {}).lf_stacks_key || 0, main: s.quests.lf_main.stage, offer: s.vars.akari_offer });

  // 1. the scenes
  {
    const sc = (id) => C.scenes[id].cmds;
    const after = (id, ch) => { const c = sc(id), i = c.findIndex((x) => x.op === 'challenge' && x.args[0] === ch); return [c[i + 1], c[i + 2]].map((x) => x && { op: x.op, args: x.args, if: x.if || null }); };
    const reply = after('lf.akari_reply', 'lf.ch_akari_addr');
    const first = (id) => { const c = sc(id)[0]; return c && c.op === 'var' && c.args.join(' ').replace(/\s+/g, ' '); };
    const key = after('lf.akari_hint', 'lf.ch_akari'), addr2 = after('lf.akari_letter', 'lf.ch_akari_addr2');
    const lt = C.scenes['lf.akari_letter'], ask = lt.labels.ask, look = lt.cmds.findIndex((x, i) => i >= ask && x.op === 'look');
    const bell = sc('lf.akari_reply').filter((x) => x.op === 'say' && /I can't refuse overtime|I can't say "please give me leave"/.test(x.en || '')).map((x) => x.if || null);
    const list = (C.maps['lf.clerks'].npcs.find((n) => n.id === 'akari').talk || []).map((x) => x.scene + (x.if ? '?' + x.if : ''));
    const a = { reply, letters: first('lf.akari_letters'), letter: first('lf.akari_letter'), key, addr2, ask: look === ask, bell, list: list.slice(0, 3) };
    t.ok(flat(reply) === flat([{ op: 'var', args: reply[0] && reply[0].args, if: 'var._res=0' }, { op: 'end', args: reply[1] && reply[1].args, if: 'var._res=0' }]) && /akari_offer\s*=?\s*2/.test(reply[0].args.join(' ')) &&
      /^akari_offer =? ?0$/.test(a.letters) && /^akari_offer =? ?0$/.test(a.letter) && key[0].op === 'end' && key[0].if === 'var._res=0' && addr2[0].op === 'end' && addr2[0].if === 'var._res=0' && a.ask &&
      bell.length === 2 && bell.every((x) => /!lf_bell_rung/.test(x || '')) &&
      list[0] === 'lf.akari_letter?quest.lf_akari>=1&!quest.lf_akari=done' && list[1] === 'lf.akari_after?quest.lf_akari=active&lf_bell_rung' && list[2] === 'lf.akari_post?post',
      '1 the scenes: the reply\'s guard sets 2 and ends; each offer resets at its entry; the key\'s and the second letter\'s guards; her request label; the two before-the-bell lines; the talk list\'s order ' + flat(a));
  }

  // 2. before the bell, the first telling and later talks
  {
    fresh();
    const r0 = await talk({ pick: [1] });
    const a = Object.assign(st(), { r0, offered: offered.slice(), story: said(B.story), sorry: said(B.sorry), give: said(B.give) });
    const r1 = await talk({ pick: [0], cancel: ['lf.ch_akari_addr'] });
    const b = Object.assign(st(), { r1, offered: offered.slice(), give: count(B.give), father: said(B.father), story: said(B.story) });
    await talk({ pick: [0] });
    const c = Object.assign(st(), { father: count(B.father), before: count(B.before) });
    await talk();
    const d = Object.assign(st(), { offered: offered.length });
    t.ok(a.r0 === 'lf.akari' && flat(a.offered) === flat([[GIVE, NOW]]) && a.story && a.sorry && !a.give && a.letter === 1 && a.akari === 0 && !a.got,
      '2a the first telling before the bell, Not now: her story and her apology, the letter kept, her quest begun ' + flat(a));
    t.ok(flat(b.offered) === flat([[GIVE, NOW]]) && b.give === 1 && !b.father && !b.story && b.letter === 1 && b.offer === 2 && !b.got,
      '2b her talk: the offer (no second story); given and left by "Come back later": the letter kept ' + flat(b));
    t.ok(c.father === 1 && c.before === 1 && c.letter === 0 && c.got && c.akari === 0 && d.offered === 0,
      '2c then given: the reading once, with her before-the-bell line, the letter gone; then no offer ' + flat({ c, d }));
  }

  // 3. the key, and after it
  {
    fresh({ main: 2, akari: 0 });
    const r0 = await talk({ pick: [0], cancel: ['lf.ch_akari_addr'] });
    const a = Object.assign(st(), { r0, hint: said(B.hint), give: said(B.give) });
    const r1 = await talk({ pick: [1] });
    const b = Object.assign(st(), { r1, hint: count(B.hint), keyLine: count(B.key), offered: offered.slice() });
    const r2 = await talk({ pick: [1] });
    const c = Object.assign(st(), { r2, usual: said(B.usual) });
    await talk({ pick: [0], cancel: ['lf.ch_akari_addr'] });
    const d = Object.assign(st(), { usual: said(B.usual), give: said(B.give) });
    await talk({ pick: [0] });
    const e = Object.assign(st(), { usual: said(B.usual), father: count(B.father) });
    await talk();
    const f = Object.assign(st(), { usual: said(B.usual), offered: offered.length });
    t.ok(a.r0 === 'lf.akari_hint' && a.give && !a.hint && a.key === 0 && a.main === 2 && a.letter === 1 && a.offer === 2 &&
      b.hint === 1 && b.keyLine === 1 && b.key === 1 && b.main === 3 && b.letter === 1 && b.offer === 0 && flat(b.offered) === flat([[GIVE, NOW]]),
      '3a the key: given and left ends the talk, no key; then Not now: the key conversation (nothing of the cancel before leaks into it) ' + flat({ a, b }));
    t.ok(c.r2 === 'lf.akari_again' && c.usual && c.letter === 1 && !d.usual && d.give && d.letter === 1 && !e.usual && e.father === 1 && e.letter === 0 && f.usual && f.offered === 0,
      '3b after the key: Not now, her usual lines; given and left, the talk ends; given, the talk ends; then her usual lines only ' + flat({ c, d, e, f }));
    fresh({ main: 2, akari: 0, noLetter: true });
    await talk({ cancel: ['lf.ch_akari'] });
    const g = Object.assign(st(), { hint: said(B.hint), keyLine: said(B.key) });
    await talk();
    const h = Object.assign(st(), { hint: count(B.hint), keyLine: count(B.key) });
    t.ok(g.hint && !g.keyLine && g.key === 0 && g.main === 2 && h.hint === 1 && h.keyLine === 1 && h.key === 1 && h.main === 3,
      '3c the key left by "Come back later": no key, step 2; then the conversation again, and the key ' + flat({ g, h }));
  }

  // 4. after the bell
  {
    fresh({ main: 6, flags: { lf_bell_rung: true } });
    const r0 = await talk({ pick: [0], cancel: ['lf.ch_akari_addr'] });
    const a = Object.assign(st(), { r0, offered: offered.slice(), story: said(B.story), sorry: said(B.sorry), give: said(B.give), father: said(B.father), news: said(B.news) });
    const r1 = await talk({ pick: [0] });
    const b = Object.assign(st(), { r1, father: count(B.father), before: count(B.before), news: count(B.news), got: said(B.got), ask2: count(B.ask2) });
    fresh({ main: 6, akari: 1, flags: { lf_bell_rung: true } });
    await talk({ pick: [1] });
    const c = Object.assign(st(), { offered: offered.slice(), news: count(B.news), notGot: said(B.notGot), give: said(B.give), leave: count(B.leave) });
    t.ok(a.r0 === 'lf.akari_after' && a.story && a.sorry && flat(a.offered) === flat([[GIVE, GOON]]) && a.give && !a.father && !a.news && a.akari === 1 && a.letter === 1 && a.offer === 2,
      '4a after the bell: the first telling without the ordinary offer, then the informed one; given and left: the end, step 1, the letter kept ' + flat(a));
    t.ok(b.r1 === 'lf.akari_letter' && b.father === 1 && b.before === 0 && b.news === 1 && b.got && b.ask2 === 1 && b.akari === 'done' && b.letter === 0 && b.leave,
      '4b then given: the reading without the two before-the-bell lines, then her news as received, and her letter ' + flat(b));
    t.ok(flat(c.offered) === flat([[GIVE, GOON]]) && c.news === 1 && c.notGot && !c.give && c.leave === 1 && c.letter === 1 && c.akari === 'done',
      '4c or "Go on without": her news as not received, and her letter; Hoshino\'s letter stays with you ' + flat(c));
  }

  // 5. her second letter left by "Come back later"
  {
    fresh({ main: 6, akari: 1, noLetter: true, flags: { lf_bell_rung: true, lf_akari_got_reply: true } });
    await talk({ cancel: ['lf.ch_akari_addr2'] });
    const a = Object.assign(st(), { news: count(B.news), ask2: count(B.ask2), leaveLine: said(B.leave) });
    const r1 = talkOf('lf.clerks', 'akari');
    await talk();
    const b = Object.assign(st(), { r1, news: count(B.news), ask2: count(B.ask2), leaveLine: count(B.leave) });
    t.ok(a.news === 1 && a.ask2 === 1 && !a.leaveLine && a.akari === 2 && !a.leave && b.r1 === 'lf.akari_letter' && b.news === 0 && b.ask2 === 1 && b.leaveLine === 1 && b.akari === 'done' && b.leave,
      '5 her second letter left: step 2, no departure; then her request only, and done once ' + flat({ a, b }));
  }

  // 6. after the ending (synthetic: the postgame milestone set directly)
  {
    fresh();
    await talk({ pick: [1] }); // the letter put off before the bell
    Object.assign(s.flags, { lf_bell_rung: true, postgame: true });
    s.quests.lf_main = { stage: 9, done: true, t: 1 };
    const r0 = talkOf('lf.clerks', 'akari');
    await talk({ pick: [0], cancel: ['lf.ch_akari_addr'] });
    const a = Object.assign(st(), { r0, offered: offered.slice(), post: said(B.post) });
    const r1 = talkOf('lf.clerks', 'akari');
    await talk({ pick: [0], cancel: ['lf.ch_akari_addr'] });
    const b = Object.assign(st(), { r1, offered: offered.slice() });
    await talk({ pick: [0], cancel: ['lf.ch_akari_addr2'] });
    const c = Object.assign(st(), { father: count(B.father), news: count(B.news) });
    await talk();
    const d = Object.assign(st(), { offered: offered.length, ask2: count(B.ask2), news: count(B.news) });
    const r4 = talkOf('lf.clerks', 'akari');
    t.ok(r0 === 'lf.akari_after' && flat(a.offered) === flat([[GIVE, GOON]]) && !a.post && a.akari === 1 && a.letter === 1 &&
      b.r1 === 'lf.akari_letter' && flat(b.offered) === flat([[GIVE, GOON]]) && b.akari === 1 && b.letter === 1 &&
      c.father === 1 && c.news === 1 && c.akari === 2 && !c.leave && d.offered === 0 && d.ask2 === 1 && d.news === 0 && d.akari === 'done' && d.leave && r4 === 'lf.akari_post',
      '6a after the ending: a letter put off before the bell is her unfinished business, not her after-the-ending line; given and left twice; given, her letter left, then done; then her after-the-ending line ' + flat({ r0, a, b, c, d, r4 }));
    fresh();
    await talk({ pick: [1] });
    Object.assign(s.flags, { lf_bell_rung: true, postgame: true });
    await talk({ pick: [1] });
    const e = Object.assign(st(), { notGot: said(B.notGot), r: talkOf('lf.clerks', 'akari') });
    fresh({ akari: 'done', noLetter: true, flags: { lf_bell_rung: true, postgame: true, lf_akari_leave: true } });
    const f = talkOf('lf.clerks', 'akari');
    fresh({ noLetter: true, flags: { lf_bell_rung: true, postgame: true } });
    const g = talkOf('lf.clerks', 'akari');
    t.ok(e.notGot && e.akari === 'done' && e.letter === 1 && e.r === 'lf.akari_post' && f === 'lf.akari_post' && g === 'lf.akari_post',
      '6b "Go on without" there too: done, the letter kept, then her after-the-ending line; a finished quest, and one never begun, keep it ' + flat({ e, f, g }));
  }

  // 7. a save and load; a stale result
  {
    fresh();
    await talk({ pick: [1] });
    loadSave(saved());
    await talk({ pick: [0] });
    const a = Object.assign(st(), { offered: offered.slice(), father: count(B.father) });
    fresh({ akari: 0, vars: { _res: 0 } });
    await talk({ pick: [0] });
    const b = st();
    fresh({ akari: 0, vars: { _res: 1 } });
    await talk({ pick: [0], cancel: ['lf.ch_akari_addr'] });
    const c = st();
    t.ok(flat(a.offered) === flat([[GIVE, NOW]]) && a.father === 1 && a.letter === 0 && b.letter === 0 && b.got && c.letter === 1 && !c.got && c.offer === 2,
      '7 a save and load while the letter waits: the offer still there; a stale result of 0 before a delivery, and of 1 before a cancel, changes nothing ' + flat({ a, b, c }));
  }

  // 7b. routing in both bell states; a quest at step 0 without the letter after the ending
  {
    const route = (o) => { fresh(o); return talkOf('lf.clerks', 'akari'); };
    const AFTER = { lf_bell_rung: true, postgame: true };
    const r = {
      pre1: route({ akari: 0 }), pre2: route({ main: 2, akari: 0 }), pre3: route({ main: 3, akari: 0, flags: { lf_akari_key: true } }),
      bell0: route({ main: 6, akari: 0, flags: { lf_bell_rung: true } }), bell1: route({ main: 6, akari: 1, flags: { lf_bell_rung: true } }),
      end0: route({ akari: 0, flags: AFTER }), end2: route({ akari: 2, flags: AFTER }), endDone: route({ akari: 'done', noLetter: true, flags: Object.assign({ lf_akari_leave: true }, AFTER) }),
      endNever: route({ noLetter: true, flags: AFTER }),
    };
    const want = { pre1: 'lf.akari', pre2: 'lf.akari_hint', pre3: 'lf.akari_again', bell0: 'lf.akari_after', bell1: 'lf.akari_letter', end0: 'lf.akari_after', end2: 'lf.akari_letter', endDone: 'lf.akari_post', endNever: 'lf.akari_post' };
    // the same quest at step 0 without the letter, before the bell: her before-the-bell scenes, and no news
    const pre = {};
    for (const [k, o] of Object.entries({ p1: { akari: 0, noLetter: true }, p2: { main: 2, akari: 0, noLetter: true }, p3: { main: 3, akari: 0, noLetter: true, flags: { lf_akari_key: true } } })) {
      fresh(o);
      const sc = await talk();
      pre[k] = { sc, news: count(B.news), ask2: count(B.ask2), akari: st().akari };
    }
    fresh({ akari: 0, noLetter: true, flags: AFTER });
    const bag0 = flat(s.inv);
    await talk();
    const a = Object.assign(st(), { offered: offered.length, news: count(B.news), notGot: said(B.notGot), gotLine: said(B.got), give: said(B.give), ask2: count(B.ask2), leaveLine: count(B.leave),
      bag: flat(s.inv) === bag0, asked: asked.slice(), r: talkOf('lf.clerks', 'akari') });
    t.ok(flat(r) === flat(want) && pre.p1.sc === 'lf.akari' && pre.p2.sc === 'lf.akari_hint' && pre.p3.sc === 'lf.akari_again' && ['p1', 'p2', 'p3'].every((k) => pre[k].news === 0 && pre[k].ask2 === 0 && pre[k].akari === 0) &&
      a.offered === 0 && a.news === 1 && a.notGot && !a.gotLine && !a.give && !a.got && a.bag && flat(a.asked) === '["lf.ch_akari_addr2"]' && a.ask2 === 1 && a.leaveLine === 1 && a.akari === 'done' && a.leave && a.r === 'lf.akari_post',
      '7b routing in both bell states; before the bell, a quest at step 0 without the letter keeps her before-the-bell scenes and no news; after the ending it resumes: her news as not received and her letter, no delivery, no item, no first-letter reward; then her after-the-ending line ' + flat({ r, pre, a }));
  }

  // 7c. no repeated item effects; Give, left, then Not now; then Give and done
  {
    fresh({ main: 3, akari: 0, flags: { lf_akari_key: true } });
    s.inv.lf_stacks_key = 1;
    const bag0 = flat(s.inv);
    await talk({ pick: [0], cancel: ['lf.ch_akari_addr'] });
    const a = { same: flat(s.inv) === bag0, offer: s.vars.akari_offer, usual: said(B.usual) };
    await talk({ pick: [1] });
    const b = { same: flat(s.inv) === bag0, offer: s.vars.akari_offer, usual: said(B.usual), offered: offered.slice() };
    await talk({ pick: [0] });
    const c = { bag: Object.assign({}, s.inv), father: count(B.father), usual: said(B.usual), got: !!s.flags.lf_akari_got_reply };
    await talk();
    const d = { bag: Object.assign({}, s.inv), offered: offered.length, usual: said(B.usual) };
    const less = Object.assign(JSON.parse(bag0)); delete less.sb_reply_letter;
    const clean = (x) => { const o = {}; for (const k in x) if (x[k]) o[k] = x[k]; return flat(o); };
    t.ok(a.same && a.offer === 2 && !a.usual && b.same && b.offer === 0 && b.usual && flat(b.offered) === flat([[GIVE, NOW]]) &&
      c.father === 1 && !c.usual && c.got && clean(c.bag) === clean(less) && clean(d.bag) === clean(less) && d.offered === 0 && d.usual,
      '7c after the key: given and left, the bag as it was and the talk ends; then Not now, her usual lines; then given, the letter taken once and nothing else; then her usual lines ' + flat({ a, b, c, d }));
  }

  // 8. the first-time paths, line for line as on the parent
  {
    const got = {};
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const k = String(comp);
      fresh({ comp });
      await talk({ pick: [0] }); const p1 = lines;
      fresh({ comp, main: 2, akari: 0, noLetter: true });
      await talk(); const p2 = lines;
      fresh({ comp, main: 6, akari: 0, noLetter: true, flags: { lf_bell_rung: true } });
      await talk(); const p3 = lines;
      got[k] = [fp(p1), fp(p2), fp(p3)];
    }
    t.ok(fp(got) === FIRST_FP, '8 the first-time paths line for line as on the parent, with each companion and none ' + flat({ fp: fp(got) }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
// computed on the parent (49db870): the first telling with the letter given, the key without a letter, her news and
// second letter after the bell, with each companion and none
const FIRST_FP = '11631ce23d0df3df';
