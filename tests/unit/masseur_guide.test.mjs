// The Masseur's Lost Words: where the guide points while the verses are gathered (Agnes 6554356273, 6554439890,
// 6554533740; Local CL-598, CL-600; Cloud CC-433). After the story, Kihachi's geta (the keepsakes' yn.ks_kihachi, given by
// a hook) comes before his verse, and the derived guide could not see that it leads on: with his verse missing it said
// "You can't take this further just yet". Stage 0 now names one person at a time, in Bunkichi's order (Okiyo, Kihachi,
// Oshige while she stands in the lobby), and Bunkichi asks for all three lines. On the real runner and the real guide,
// the dialogue stubbed and the tasks answered:
//  1. every set of missing verses in every phase (before the rooms, rooms settled, Mio's night, Mio back, after the
//     story with and without the geta): the first available speaker is named, and only that one; with only Oshige's
//     verse missing and her away, the guide derives as before (the desk before the rooms; the way Mio's night ends), never
//     her, never "can't take this further"; stage 1 names Bunkichi in every phase;
//  2. a real journey from the call, the rooms not yet given: Okiyo and Kihachi first, then the desk, the rooms, Oshige,
//     Bunkichi and the song, each named in turn and each reached through the talk the world would choose;
//  3. every collection order: each talk gives its verse, the third sets stage 1 and the marker moves to Bunkichi;
//  4. after the story without the geta: Kihachi named; the first talk is the geta (catalogue-only: a keepsake record,
//     once; satchel and equipment unchanged), the marker stays on him; the next talk is his verse; then not again;
//  5. Oshige with her bell talk and her egg talk both pending: named; the bell, then the egg, then her verse, the marker
//     on her throughout;
//  6. Mio's night: Oshige never named while she is away; the dawn scene brings her back and she is named; the footbath
//     the guide points to then is named in the nudge (足湯, "the footbath"), here and in the main story's stage 6;
//  7. a save written as JSON and loaded around each interruption and around the third verse: the same marker;
//  8. Bunkichi at stage 0 (no, one or two verses): the new line, which asks for all three, and no hand-in; at stage 1
//     the song and the quest done; the line's key and the language ledger's entries (new, and the old one kept);
//  9. the static per-stage listing still derives (atIf is live-only);
//  and no scene ended on an error from the runner.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, G = RB.questGuide;
  const flat = (x) => JSON.stringify(x);

  // the real runner, with dialogue collected, choices taken as the first and tasks answered (as tests/unit/yn_ch11)
  let lines = [], asked = [];
  const errors = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors', 'placeCompanion']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.game.transition = async (map) => { RB.game.G.s.map = map; };
  RB.game.rest = async () => {};
  RB.game.startEncounter = async () => ({ result: 'win', outcome: 'done' });
  RB.save.autosave = async () => {};
  RB.challenge.run = async (id) => { asked.push(id); return { ok: true }; };
  if (RB.lessons) RB.lessons.grammarCard = async () => {};
  // (the runner catches a scene's own error and reports it on the console: those are counted too)
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id) => { lines = []; asked = []; try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  // talk as the world does: the first talk option that holds (src/engine/50_world.js talkTo)
  const npc = (map, id) => (C.maps[map].npcs || []).find((n) => n.id === id);
  const optOf = (s, map, id) => { const n = npc(map, id); const tk = typeof n.talk === 'string' ? [{ scene: n.talk }] : n.talk; const e = tk.find((x) => !x.if || S.test(s, x.if)); return e && e.scene; };
  const talk = async (s, map, id) => { const sc = optOf(s, map, id); await run(sc); return sc; };
  const qs = (s) => (s.quests.yn_masseur ? (s.quests.yn_masseur.done ? 'done' : s.quests.yn_masseur.stage) : null);

  const BEFORE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_done', 'cr_called', 'cr_done', 'cr_delivered'];
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: 2 });
    s.id = 'masseur-test'; s.map = 'yn.upper'; s.x = 10; s.y = 18; s.comp = o.comp || 'nao';
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    for (const f of BEFORE) s.flags[f] = true;
    for (const f of o.flags || []) s.flags[f] = true;
    if (o.main != null) s.quests.yn_main = { stage: o.main, done: false, t: 1 };
    if (o.stage != null) s.quests.yn_masseur = { stage: o.stage, done: false, t: 1 };
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const geta = (s) => { s.discovery.keepsakes.ks_yn_geta = { t: 1 }; return s; };
  // where the guide points, and its first nudge
  const where = (x) => x.map + ':' + (x.kind === 'npc' ? x.id : x.kind === 'prop' ? 'prop:' + x.p : x.kind);
  // (the guide's live cache keys on how many flags are set, not which: these states swap one verse for another, so
  // each is asked afresh)
  const guide = (s) => { G.reset(); const r = G.targets('yn_masseur', s); return { how: r.how, t: (r.targets || []).map(where), n: G.nudges('yn_masseur', s).lines[0].map((l) => l.en).join(' | ') }; };
  const WAIT = /can.t take this further/;
  const OKIYO = 'yn.kami:yn_okiyo', KIHACHI = 'yn.upper:yn_kihachi', OSHIGE = 'yn.kami:yn_oshige', BUNKICHI = 'yn.upper:yn_bunkichi';
  const present = (s) => S.test(s, 'yn_rooms_done&!yn_mio_night|yn_mio_back');
  const expect = (s) => !s.flags.yn_verse1 ? OKIYO : !s.flags.yn_verse2 ? KIHACHI : !s.flags.yn_verse3 && present(s) ? OSHIGE : null;

  // ---- 1. every set of missing verses in every phase ------------------------------------------------------------------
  {
    const PHASES = [
      { name: 'before the rooms', comp: 'nao', flags: ['yn_called', 'yn_kami_seen'], main: 2 },
      { name: 'rooms settled', comp: 'nao', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done'], main: 3 },
      { name: 'Mio\'s night', comp: 'mio', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done', 'yn_mio_night'], main: 6 },
      { name: 'Mio back', comp: 'mio', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done', 'yn_mio_night', 'yn_mio_back'], main: 6 },
      { name: 'after the story', comp: 'nao', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done', 'yn_done'], main: null },
      { name: 'after the story, the geta given', comp: 'nao', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done', 'yn_done'], main: null, geta: true },
    ];
    const SETS = [[], [1], [2], [3], [1, 2], [1, 3], [2, 3]];
    const bad = [], fallbacks = [];
    let n = 0;
    for (const ph of PHASES) for (const got of SETS) {
      const s = fresh({ comp: ph.comp, flags: ph.flags.concat(got.map((v) => 'yn_verse' + v)), main: ph.main, stage: 0 });
      if (ph.main == null) s.quests.yn_main = { stage: 7, done: true, t: 1 };
      if (ph.geta) geta(s);
      const g = guide(s), want = expect(s);
      n++;
      if (want) { if (flat(g.t) !== flat([want]) || WAIT.test(g.n)) bad.push([ph.name, got, g]); }
      else { fallbacks.push([ph.name, got, g.t]); if (!g.t.length || g.t.includes(OSHIGE) || WAIT.test(g.n)) bad.push([ph.name, got, g]); }
    }
    t.ok(n === 42 && !bad.length, '1 every set of missing verses in every phase (' + n + ' states): the first available speaker, and only that one, never "can\'t take this further" ' + flat(bad.slice(0, 3)));
    t.ok(fallbacks.length === 2 && fallbacks.every((f) => flat(f[1]) === flat([1, 2])) && fallbacks.some((f) => f[0] === 'before the rooms' && f[2].some((x) => /yn_tokuzo/.test(x))) && fallbacks.some((f) => f[0] === 'Mio\'s night' && f[2].length && f[2].every((x) => /prop:/.test(x))),
      '1 with only Oshige\'s verse missing and her away, derived as before: the desk before the rooms, the way Mio\'s night ends ' + flat(fallbacks));
    const st1 = PHASES.map((ph) => { const s = fresh({ comp: ph.comp, flags: ph.flags.concat(['yn_verse1', 'yn_verse2', 'yn_verse3']), main: ph.main, stage: 1 }); if (ph.geta) geta(s); return guide(s).t; });
    t.ok(st1.every((x) => flat(x) === flat([BUNKICHI])), '1 stage 1 names Bunkichi in every phase ' + flat(st1));
  }

  // ---- 2. a real journey, the rooms not yet given ---------------------------------------------------------------------
  {
    const s = fresh({ comp: 'nao' });
    for (const sc of ['yn.call', 'yn.descent_first', 'yn.arrive', 'yn.rokubei_first', 'yn.kami_first']) await run(sc);
    const pre = { main: s.quests.yn_main && s.quests.yn_main.stage, kami: !!s.flags.yn_kami_seen, rooms: !!s.flags.yn_rooms_done };
    await talk(s, 'yn.upper', 'yn_bunkichi');
    const steps = [{ at: 'begun', g: guide(s).t }];
    await talk(s, 'yn.kami', 'yn_okiyo'); steps.push({ at: 'Okiyo', g: guide(s).t });
    await talk(s, 'yn.upper', 'yn_kihachi'); const afterK = guide(s); steps.push({ at: 'Kihachi', g: afterK.t });
    const desk = await talk(s, 'yn.kami', 'yn_tokuzo'); steps.push({ at: desk, g: guide(s).t, rooms: !!s.flags.yn_rooms_done });
    await talk(s, 'yn.kami', 'yn_oshige'); steps.push({ at: 'Oshige', g: guide(s).t, stage: qs(s) });
    await talk(s, 'yn.upper', 'yn_bunkichi'); steps.push({ at: 'Bunkichi', stage: qs(s), song: asked.includes('yn.masseur_song') });
    t.ok(pre.main === 2 && pre.kami && !pre.rooms && flat(steps[0].g) === flat([OKIYO]) && flat(steps[1].g) === flat([KIHACHI]) &&
      steps[2].g.some((x) => /yn_tokuzo/.test(x)) && !steps[2].g.includes(OSHIGE) && !WAIT.test(afterK.n) && desk === 'yn.rooms_start' && steps[3].rooms &&
      flat(steps[3].g) === flat([OSHIGE]) && steps[4].stage === 1 && flat(steps[4].g) === flat([BUNKICHI]) && steps[5].stage === 'done' && steps[5].song,
      '2 a real journey from the call, the rooms not yet given: Okiyo, Kihachi, then the desk, the rooms, Oshige, Bunkichi and the song ' + flat({ pre, steps }));
  }

  // ---- 3. every collection order ---------------------------------------------------------------------------------------
  {
    const WHO = { 1: ['yn.kami', 'yn_okiyo'], 2: ['yn.upper', 'yn_kihachi'], 3: ['yn.kami', 'yn_oshige'] };
    const ORDERS = [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]];
    const out = [];
    for (const order of ORDERS) {
      const s = fresh({ comp: 'nao', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done'], main: 3, stage: 0 });
      const seq = [];
      for (const v of order) {
        const sc = await talk(s, WHO[v][0], WHO[v][1]);
        seq.push({ sc, flag: !!s.flags['yn_verse' + v], g: guide(s).t, stage: qs(s), want: qs(s) === 1 ? [BUNKICHI] : [expect(s)] });
      }
      out.push([order.join(''), seq.every((x, i) => x.sc === 'yn.verse_' + WHO[order[i]][1].slice(3) && x.flag && flat(x.g) === flat(x.want)) && seq[2].stage === 1 && seq[0].stage === 0 && seq[1].stage === 0]);
    }
    t.ok(out.every((x) => x[1]), '3 every collection order: each talk gives its verse, the next named in turn, the third sets stage 1 and names Bunkichi ' + flat(out));
  }

  // ---- 4. after the story: the geta, then the verse ---------------------------------------------------------------------
  {
    const s = fresh({ comp: 'nao', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done', 'yn_done', 'yn_verse1'], stage: 0 });
    s.quests.yn_main = { stage: 7, done: true, t: 1 };
    const inv0 = flat(s.inv), eq0 = flat(s.equip);
    const g0 = guide(s);
    const a = await talk(s, 'yn.upper', 'yn_kihachi');
    const g1 = guide(s), ks = s.discovery.keepsakes.ks_yn_geta;
    const b = await talk(s, 'yn.upper', 'yn_kihachi');
    const c = await talk(s, 'yn.upper', 'yn_kihachi');
    t.ok(flat(g0.t) === flat([KIHACHI]) && !WAIT.test(g0.n) && a === 'yn.ks_kihachi' && !!ks && flat(g1.t) === flat([KIHACHI]) && b === 'yn.verse_kihachi' && s.flags.yn_verse2 && c === 'yn.kihachi_after',
      '4 after the story without the geta: Kihachi named; the geta first, the marker stays on him; then his verse; then not again ' + flat({ g0: g0.t, a, g1: g1.t, b, c }));
    t.ok(flat(s.inv) === inv0 && flat(s.equip) === eq0 && Object.keys(s.discovery.keepsakes).filter((k) => k === 'ks_yn_geta').length === 1,
      '4 the geta stays catalogue-only: a keepsake record, given once; the satchel and the equipment unchanged');
  }

  // ---- 5. Oshige with her bell talk and her egg talk both pending ---------------------------------------------------------
  {
    const s = fresh({ comp: 'nao', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done', 'yn_verse1', 'yn_verse2', 'lw_yn_bell_rung'], main: 3, stage: 0 });
    S.setQuest(s, 'yn_eggs', 0); s.inv.yn_eggs = 3;
    const seq = [];
    for (let i = 0; i < 3; i++) { const g = guide(s).t; const sc = await talk(s, 'yn.kami', 'yn_oshige'); seq.push({ g, sc }); }
    t.ok(seq.every((x) => flat(x.g) === flat([OSHIGE])) && flat(seq.map((x) => x.sc)) === flat(['yn.lw_oshige_bell_post', 'yn.egg_oshige', 'yn.verse_oshige']) && qs(s) === 1 && flat(guide(s).t) === flat([BUNKICHI]),
      '5 Oshige with her bell and egg talks pending: named throughout; the bell, then the egg, then her verse; then Bunkichi ' + flat(seq));
  }

  // ---- 6. Mio's night --------------------------------------------------------------------------------------------------
  {
    const s = fresh({ comp: 'mio', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done', 'yn_verse1', 'yn_verse2', 'yn_mio_night'], main: 6, stage: 0 });
    const away = guide(s);
    await run('yn.mio_dawn');
    const back = guide(s);
    t.ok(!away.t.includes(OSHIGE) && away.t.length > 0 && !WAIT.test(away.n) && s.flags.yn_mio_back && flat(back.t) === flat([OSHIGE]),
      '6 Mio\'s night: Oshige never named while she is away; after the dawn she is named ' + flat({ away: away.t, back: back.t }));
    // the footbath is named, not "something" (Local CL-600; Agnes 6555073469): here and in the main story's stage 6
    const s2 = fresh({ comp: 'mio', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done', 'yn_verse1', 'yn_verse2', 'yn_mio_night'], main: 6, stage: 0 });
    const n1 = guide(s2).n;
    G.reset();
    const n2 = G.nudges('yn_main', s2).lines[0].map((l) => l.en).join(' | ');
    const jp2 = G.nudges('yn_main', s2).lines[0].map((l) => l.jp).join(' | ');
    t.ok(/the footbath/.test(n1) && /the footbath/.test(n2) && !/something/i.test(n1 + n2) && /{足湯|あしゆ}/.test(jp2),
      '6 the footbath is named in the nudge, not "something": the masseur\'s fallback and the main story\'s stage 6 on Mio\'s night ' + flat({ n1, n2 }));
  }

  // ---- 7. a save around each interruption and around the third verse ------------------------------------------------------
  {
    const reload = (s) => { const st = RB.save.migrate(JSON.parse(JSON.stringify(s))); RB.game.G.s = st; RB.game.s = st; return st; };
    const s = fresh({ comp: 'nao', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done', 'yn_done', 'yn_verse1'], stage: 0 });
    s.quests.yn_main = { stage: 7, done: true, t: 1 };
    const out = [];
    let cur = s;
    out.push(['before', guide(cur).t, guide(reload(cur)).t]);
    cur = RB.game.s; await talk(cur, 'yn.upper', 'yn_kihachi'); out.push(['after the geta', guide(cur).t, guide(reload(cur)).t]);
    cur = RB.game.s; await talk(cur, 'yn.upper', 'yn_kihachi'); out.push(['after his verse', guide(cur).t, guide(reload(cur)).t]);
    cur = RB.game.s; await talk(cur, 'yn.kami', 'yn_oshige'); out.push(['after the third', guide(cur).t, guide(reload(cur)).t, qs(cur), qs(RB.game.s)]);
    t.ok(out.every((x) => flat(x[1]) === flat(x[2])) && flat(out.map((x) => x[1][0])) === flat([KIHACHI, KIHACHI, OSHIGE, BUNKICHI]) && out[3][3] === 1 && out[3][4] === 1,
      '7 a save written as JSON and loaded around each interruption and the third verse: the same marker ' + flat(out));
  }

  // ---- 8. Bunkichi's line ------------------------------------------------------------------------------------------------
  {
    const NEW = { jp: '{三行|さんぎょう} {揃|そろ}ったら 、 {聞|き}かせて おくれ 。 {一行|いちぎょう} ずつ じゃ 、 {節|ふし} に {乗|の}らない 。', en: 'When you have all three lines, let me hear them. One at a time, they won\'t fit the tune.' };
    const OLD = '{一行|いちぎょう} でも 、 {集|あつ}まったら {聞|き}かせて おくれ 。';
    const out = [];
    for (const got of [[], [1], [1, 2]]) {
      const s = fresh({ comp: 'nao', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done'].concat(got.map((v) => 'yn_verse' + v)), main: 3, stage: 0 });
      const l = await talk(s, 'yn.upper', 'yn_bunkichi').then(() => lines);
      out.push(l.length === 1 && l[0].jp === NEW.jp && l[0].en === NEW.en && qs(s) === 0 && !asked.length);
    }
    const s1 = fresh({ comp: 'nao', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done', 'yn_verse1', 'yn_verse2', 'yn_verse3'], main: 3, stage: 1 });
    await talk(s1, 'yn.upper', 'yn_bunkichi');
    t.ok(out.every(Boolean) && qs(s1) === 'done' && asked.includes('yn.masseur_song'), '8 Bunkichi at stage 0 with none, one or two verses: the new line asking for all three, and no hand-in; at stage 1, the song and done ' + flat(out));
    const key = (jp) => 'yn.bunkichi#' + crypto.createHash('sha256').update(jp).digest('hex').slice(0, 10);
    const cmds = C.scenes['yn.bunkichi'].cmds.filter((c) => c.jp);
    const led = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'review', 'language', 'yn.json'), 'utf8'));
    const fnv = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); };
    const nl = led['scene:yn.bunkichi#' + fnv(NEW.jp)], ol = led['scene:yn.bunkichi#' + fnv(OLD)];
    t.ok(key(NEW.jp) === 'yn.bunkichi#068dda40bd' && cmds.some((c) => c.jp === NEW.jp) && !cmds.some((c) => c.jp === OLD) && nl && nl.status === 'self-reviewed' && nl.jp === NEW.jp && ol && ol.jp === OLD,
      '8 the new line\'s key yn.bunkichi#068dda40bd, the old line gone from the scene; the ledger has the new line self-reviewed and keeps the old entry');
  }

  // ---- 9. the static listing still derives ---------------------------------------------------------------------------------
  {
    const s = fresh({ comp: 'nao', flags: ['yn_called', 'yn_kami_seen', 'yn_rooms_done'], main: 3, stage: 0 });
    const st = G.analyse('yn_masseur', s, { static: true, derive: true }).targets.map(where).sort();
    t.ok([OKIYO, KIHACHI, OSHIGE].every((x) => st.includes(x)), '9 the static listing of stage 0 still derives the three speakers (atIf is live-only) ' + flat(st));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
