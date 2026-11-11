// Snowbell, Hoshino after the lamp (Agnes 6549868683; Local CL-575 (b); Cloud CC-416; Agnes 6549981602): his reminder
// about the letter ("That letter was written under the lamp. I'm counting on you…") is for before it has been delivered
// and answered. Once it has (lf_akari_letter), the living world's reply plays once first (lf.lw_sb_akari_hoshino), and
// after that a talk with him is his choice line alone. Synthetic journeys, each with a choice he can really have made
// (sb_lamp_lit is set only with one of the three: src/content/ch4/34_scenes_end.js); no choice is invented or migrated.
// In node, with the real scene runner and the dialogue stubbed:
//  1. before the letter is answered, each of the three choices: the reminder, then his choice line, as before;
//  2. after it is answered, each of the three: his choice line alone, without the reminder;
//  3. the talk list at the observatory: the living world's reply first, once; after it, the scene of section 2;
//  4. after the story, the scene still says nothing (its own guard, unchanged).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;

  let lines = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};

  const BASE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, sb_hamlet_seen: true, sb_letters_done: true, sb_lamp_lit: true };
  const journey = (choice, flags) => {
    const s = S.newCampaign({ edition: 2 }); s.comp = 'ren'; s.map = 'sb.hoshino'; s.x = 4; s.y = 5;
    Object.assign(s.flags, BASE, { [choice]: true }, flags || {});
    s.vars = {};
    RB.game.G.s = s; RB.game.s = s;
    RB.world.W.map = { id: s.map };
    return s;
  };
  const run = async (id) => { lines = []; await RB.script.run(id); return lines.slice(); };
  const REMIND = /written under the lamp/;
  const OWN = { sb_hoshino_goes: /Come spring, I'll go down too/, sb_hoshino_both: /greedy old man/, sb_hoshino_stays: /I climb up every night/ };
  const CHOICES = Object.keys(OWN);

  // the observatory's Hoshino and the scene his talk list picks first
  const npc = (C.maps['sb.hoshino'].npcs || []).find((n) => n.id === 'hoshino');
  const pick = (s) => (npc.talk.find((o) => !o.if || S.test(s, o.if)) || {}).scene;
  t.ok(npc && Array.isArray(npc.talk), 'Hoshino at the observatory has a talk list');

  // ---- 1. before the letter is answered: the reminder, then his choice line, as before
  for (const c of CHOICES) {
    journey(c);
    const l = await run('sb.hoshino_after');
    t.ok(l.length === 2 && REMIND.test(l[0].en) && OWN[c].test(l[1].en) && l.every((x) => x.who === 'hoshino'), '1 ' + c + ', letter not yet answered: his reminder, then his own line');
  }

  // ---- 2. after it is answered: his choice line alone
  for (const c of CHOICES) {
    journey(c, { lf_akari_letter: true });
    const l = await run('sb.hoshino_after');
    t.ok(l.length === 1 && OWN[c].test(l[0].en) && l[0].who === 'hoshino' && !l.some((x) => REMIND.test(x.en)), '2 ' + c + ', letter answered: his own line alone, no reminder');
  }

  // ---- 3. the talk list: the living world's reply once, then section 2's scene
  {
    const s = journey('sb_hoshino_stays', { lf_akari_letter: true });
    t.eq(pick(s), 'lf.lw_sb_akari_hoshino', '3 letter answered: the first talk is the living world\'s reply');
    const reply = await run('lf.lw_sb_akari_hoshino');
    t.ok(reply.length && /A letter came from Lanternfall/.test(reply[0].en) && s.seen['lf.lw_sb_akari_hoshino'], '3 the reply plays and is marked seen');
    t.eq(pick(s), 'sb.hoshino_after', '3 the next talk is the scene after the lamp');
    const l = await run(pick(s));
    t.ok(l.length === 1 && OWN.sb_hoshino_stays.test(l[0].en), '3 and it is his own line alone');
    const before = journey('sb_hoshino_stays');
    t.eq(pick(before), 'sb.hoshino_after', '3 letter not answered: the scene after the lamp, as before');
  }

  // ---- 4. after the story: nothing, as before
  for (const c of CHOICES) {
    for (const answered of [false, true]) {
      journey(c, Object.assign({ postgame: true }, answered ? { lf_akari_letter: true } : {}));
      const l = await run('sb.hoshino_after');
      t.eq(l.length, 0, '4 ' + c + (answered ? ', letter answered' : '') + ', after the story: the scene says nothing');
    }
  }
};
