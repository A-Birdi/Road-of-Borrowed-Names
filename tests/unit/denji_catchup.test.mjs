// Denji's three things the morning after the storm, heard at the inn or not (Agnes 6545296917, 6545425537; Local
// CL-554, CL-555; Cloud CC-398): his night talk at the inn is optional, but his morning line and Hoshino's took it as
// heard. Now, on the real runner, the screen stood in for, every line said recorded with its voice key:
//  1. heard last night: Denji's morning lines as before ("…the three things I told you last night", then Hoshino), on
//     a repeat too; Hoshino's "Denji told you, didn't he";
//  2. missed, Denji first: the night's four lines, told now (the night scene's own lines and keys), then his line
//     about Hoshino, never "last night"; a repeat gives only the line about Hoshino; then Hoshino's "Denji told you";
//  3. missed, Hoshino first: "…ask Denji", then Denji tells it; Hoshino run again (his morning talk does not repeat
//     in play: the scene sets sb_obs_open and he goes; this is the scene's own semantics) now says "Denji told you";
//  4. an old save, heard (seen, no catch-up flag): as 1;
//  5. a catch-up cut off part-way (the dialogue stops on the night's second line) and then asked again: told again in
//     full, never "last night"; cut off after it was told: only the line about Hoshino;
//  6. the outdoor callback ("As I told you at the inn.") stays unreachable, as before: the inn and its upstairs are
//     no-travel interiors, the inn's door is locked through the storm night, outdoor Denji is not there in the
//     morning, and once the lamp is lit his scene takes its after-lamp branch;
//  7. every line keeps its voice key (the night's in the night scene's own name); one new key, Hoshino's "ask Denji";
//  and no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);

  // the runner, with the screen stood in for: each line said, by its English and its voice key
  let log = [], stopAt = null;
  RB.ui.dialogue.say = async (o) => {
    if (stopAt && o && o.en && stopAt.test(o.en)) { stopAt = null; throw new Error('cut off'); }
    log.push({ en: o && o.en, key: o && o.jp ? keyOf(o.sceneId, o.jp) : null });
  };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.test.enable({});

  // the morning after the storm at the inn (or the storm night itself), with the night talk heard or not
  const camp = (o = {}) => {
    const s = S.newCampaign(); s.comp = 'nao'; s.map = 'sb.inn'; s.x = 8; s.y = 8;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, sb_storm: true }, o.night ? {} : { sb_morning: true }, o.flags || {});
    if (o.heard) s.seen['sb.storm_denji'] = true;
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const errors = [];
  const run = async (scene, quiet) => {
    log = [];
    const e0 = console.error;
    if (quiet) console.error = () => {};
    try { await RB.script.run(scene, {}); } catch (e) { errors.push(scene + ': ' + String((e && e.message) || e)); } finally { console.error = e0; }
    return log.slice();
  };
  const en = (l) => l.map((x) => x.en);
  const NIGHT = C.scenes['sb.storm_denji'].cmds.filter((c) => c.jp).map((c) => c.en);
  const LAST_NIGHT = /Don't forget the three things I told you last night\./;
  const HOSHINO_TOO = /^And look after Hoshino for me\./;
  const TOLD = /As for inside… Denji told you, didn't he\./, ASK = /As for inside… ask Denji\./;
  const AT_INN = /^As I told you at the inn\./;
  const has = (l, re) => en(l).some((x) => re.test(x));
  const only = (l, re) => l.length === 1 && re.test(l[0].en);
  const told = (l) => flat(en(l).slice(0, NIGHT.length)) === flat(NIGHT) && HOSHINO_TOO.test(en(l)[NIGHT.length] || '') && l.length === NIGHT.length + 1;

  // ---- 1. heard last night
  {
    const s = camp({ heard: true });
    const d1 = await run('sb.denji_morning'), d2 = await run('sb.denji_morning'), h = await run('sb.morning_hoshino');
    t.ok(d1.length === 2 && LAST_NIGHT.test(d1[0].en) && HOSHINO_TOO.test(d1[1].en) && flat(en(d2)) === flat(en(d1)) && has(h, TOLD) && !has(h, ASK) && !s.flags.sb_denji_catchup,
      '1 heard last night: Denji\'s "last night" and the line about Hoshino, the same on a repeat; Hoshino\'s "Denji told you" (' + flat({ d1: en(d1), d2: en(d2).length }) + ')');
  }

  // ---- 2. missed, Denji first
  {
    const s = camp();
    const d1 = await run('sb.denji_morning');
    const flag = !!s.flags.sb_denji_catchup, seen = !!s.seen['sb.storm_denji'];
    const d2 = await run('sb.denji_morning'), h = await run('sb.morning_hoshino');
    t.ok(told(d1) && !has(d1, LAST_NIGHT) && flag && seen, '2 missed, Denji first: the night\'s four lines told now, then the line about Hoshino, no "last night"; the catch-up flag set, the night talk counted heard (' + flat({ d1: en(d1), flag, seen }) + ')');
    t.ok(only(d2, HOSHINO_TOO) && has(h, TOLD) && !has(h, ASK), '2 a repeat: only the line about Hoshino; then Hoshino\'s "Denji told you" (' + flat({ d2: en(d2) }) + ')');
  }

  // ---- 3. missed, Hoshino first
  {
    camp();
    const h1 = await run('sb.morning_hoshino'), d = await run('sb.denji_morning'), h2 = await run('sb.morning_hoshino');
    t.ok(has(h1, ASK) && !has(h1, TOLD) && told(d) && has(h2, TOLD) && !has(h2, ASK),
      '3 missed, Hoshino first: "…ask Denji", then Denji tells it; Hoshino\'s scene run again says "Denji told you" (' + flat({ h1: en(h1).filter((x) => /inside/.test(x)), d: en(d).length, h2: en(h2).filter((x) => /inside/.test(x)) }) + ')');
  }

  // ---- 4. an old save, heard: seen and no catch-up flag
  {
    const s = camp({ heard: true });
    const d = await run('sb.denji_morning');
    t.ok(d.length === 2 && LAST_NIGHT.test(d[0].en) && !s.flags.sb_denji_catchup, '4 an old save that heard it: as before (' + flat(en(d)) + ')');
  }

  // ---- 5. a catch-up cut off part-way, and then asked again
  {
    const s = camp();
    stopAt = new RegExp('^' + NIGHT[1].slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const d0 = await run('sb.denji_morning', true);
    const mid = { flag: !!s.flags.sb_denji_catchup, seen: !!s.seen['sb.storm_denji'] };
    const d1 = await run('sb.denji_morning'), d2 = await run('sb.denji_morning');
    t.ok(d0.length === 1 && d0[0].en === NIGHT[0] && mid.flag && !mid.seen && told(d1) && !has(d1, LAST_NIGHT) && only(d2, HOSHINO_TOO),
      '5 cut off on the night\'s second line: not counted heard; asked again, told in full, no "last night"; then only the line about Hoshino (' + flat({ d0: en(d0), mid, d1: en(d1).length, d2: en(d2) }) + ')');
    const s2 = camp();
    stopAt = HOSHINO_TOO;
    const e0 = await run('sb.denji_morning', true);
    const e1 = await run('sb.denji_morning');
    t.ok(flat(en(e0)) === flat(NIGHT) && s2.flags.sb_denji_catchup && s2.seen['sb.storm_denji'] && only(e1, HOSHINO_TOO),
      '5 cut off after the night\'s lines were told: asked again, only the line about Hoshino, no "last night" (' + flat({ e0: en(e0).length, e1: en(e1) }) + ')');
    errors.splice(0);
  }

  // ---- 6. the outdoor callback, still unreachable
  {
    const inn = C.maps['sb.inn'], up = C.maps['sb.inn_room'];
    const door = inn.exits.find((e) => e.to === 'sb.hamlet');
    const denji = C.maps['sb.hamlet'].npcs.find((n) => n.id === 'denji');
    const night = camp({ night: true }), morning = camp(), lit = camp({ flags: { sb_lamp_lit: true } });
    const doorShut = (s) => !!door.locked && !S.test(s, door.unlock);
    camp({ flags: { sb_lamp_lit: true } });
    const after = await run('sb.denji');
    camp({ flags: { sb_storm: false, sb_morning: false } });
    const before = await run('sb.denji');
    t.ok(inn.noTravel && up.noTravel && doorShut(night) && !doorShut(morning) && !S.test(morning, denji.if) && S.test(lit, denji.if) && !has(after, AT_INN) && !has(before, AT_INN),
      '6 "As I told you at the inn." stays unreachable: no travel from the inn or upstairs, the door locked on the storm night (open in the morning), outdoor Denji not there that morning, and once the lamp is lit (or before the storm) his scene does not say it (' + flat({ after: en(after).length, before: en(before).length }) + ')');
  }

  // ---- 7. the voice keys
  {
    const keys = {};
    camp({ heard: true });
    for (const x of (await run('sb.denji_morning')).concat(await run('sb.morning_hoshino'))) keys[x.en] = x.key;
    camp();
    for (const x of (await run('sb.morning_hoshino')).concat(await run('sb.denji_morning'))) keys[x.en] = x.key;
    const k = (re) => Object.entries(keys).filter(([e]) => re.test(e)).map(([, v]) => v);
    const night = NIGHT.map((e) => keys[e]);
    t.ok(flat(k(LAST_NIGHT)) === flat(['sb.denji_morning#b830a06824']) && flat(k(HOSHINO_TOO)) === flat(['sb.denji_morning#185678e59d'])
      && flat(k(TOLD)) === flat(['sb.morning_hoshino#1a08cafe07']) && flat(k(ASK)) === flat(['sb.morning_hoshino#403c24acf0'])
      && flat(night) === flat(['sb.storm_denji#55bd7bbfc2', 'sb.storm_denji#d72fc7f836', 'sb.storm_denji#843ce4b33b', 'sb.storm_denji#15d99dbb6c']),
      '7 every line keeps its key, the night\'s under the night scene\'s own name; one new key, Hoshino\'s "ask Denji" (' + flat({ ask: k(ASK), night }) + ')');
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner: ' + errors.join(' | '));
};
