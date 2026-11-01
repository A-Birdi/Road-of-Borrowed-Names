// Nao's bond talk on the way to the Still Archive, sa.b_nao1 (Agnes 6556069393; Local CL-604, CL-606; Cloud CC-443):
// it said "We gave Umi that letter" whether or not the letter was delivered, and "Think she'll write back?" though,
// once it was, Umi had already written her one line back. It is now offered only once the letter is delivered, and
// its English names the reply still to come, her father's. On the real runner, the screen stood in for:
//  1. the offer: one banter for sa.b_nao1, Nao in sa.*, its condition !sa_met_kasane&quest.lf_nao=done;
//  2. Nao's talk in the Archive's camp, before Kasane is met, for each state of the letter (not started, stage 1,
//     stage 2, delivered): sa.b_nao1 only once it is delivered, and otherwise nothing (it is Nao's only banter here
//     before Kasane); after Kasane, the next banter as before, never this one;
//  3. its lines: the Japanese and voice keys unchanged (sa.b_nao1#8398fe4d96, #3bc3163869), the two English lines
//     clarified, and its closing lines as before;
//  4. repeats and old saves: heard already, the letter delivered: it can still come up (the only banter here); a
//     save that heard it before this change without the delivery: not offered again;
//  5. the camp's rest menu: "Just chat" offered with the letter delivered, and choosing it plays this talk; with the
//     letter not delivered, no "Just chat";
//  6. after the story (Local CL-606), the letter delivered and lf.umi_post heard, Kasane met: not offered;
//  7. Mio's own banter here before Kasane, as before, whatever the letter;
//  and no scene ended on an error from the runner (its own error log watched).
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
  const COND = '!sa_met_kasane&quest.lf_nao=done';
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  // the runner, with the screen stood in for; every scene started, and every line said
  let said = [], runs = [], menus = [], pick = 'Not now';
  RB.ui.dialogue.say = async (o) => { said.push({ who: o && o.who, en: o && o.en, key: o && o.jp ? keyOf(o.sceneId, o.jp) : null }); };
  RB.ui.dialogue.choose = async (opts) => { const en = opts.map((o) => o.en); menus.push(en); const i = en.indexOf(pick); return i < 0 ? en.length - 1 : i; };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors', 'placeCompanion']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.test.enable({});
  if (!RB.game.G.settings) RB.game.G.settings = {};
  const run0 = RB.script.run;
  RB.script.run = function (id) { runs.push(id); return run0.apply(this, arguments); };
  const settle = async () => { for (let i = 0; i < 50 && RB.script.isRunning(); i++) await new Promise((r) => setTimeout(r, 10)); };

  // on the way to the Archive, at its camp: Nao (or o.comp) along, the letter at a stage (null: not started)
  const camp = (o = {}) => {
    const s = S.newCampaign({ edition: 2 }); s.comp = o.comp || 'nao'; s.map = o.map || 'sa.camp'; s.x = 10; s.y = 10;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, lf_bell_rung: true }, o.flags || {});
    if (o.quest != null) S.setQuest(s, 'lf_nao', o.quest);
    if (o.quest === 'done') s.flags.lf_nao_done = true;
    for (const k of o.seen || []) s.seen[k] = true;
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const talk = async () => { runs = []; said = []; RB.game.companionTalk(); await settle(); return runs.slice(); };

  // 1. the offer
  const offers = (C.banter || []).filter((b) => b.scene === 'sa.b_nao1');
  t.ok(offers.length === 1 && offers[0].comp === 'nao' && offers[0].map === 'sa.*' && offers[0].if === COND, '1 one banter for sa.b_nao1, Nao in sa.*, its condition ' + COND + ' ' + flat(offers));

  // 2. Nao's talk, before and after Kasane
  for (const quest of [null, 1, 2, 'done']) {
    camp({ quest });
    const r = await talk();
    t.ok(quest === 'done' ? flat(r) === flat(['sa.b_nao1']) : !r.length, '2 before Kasane, the letter ' + (quest || 'not started') + ': ' + (quest === 'done' ? 'sa.b_nao1' : 'nothing (no banter here before Kasane)') + ' ' + flat(r));
  }
  for (const quest of [null, 'done']) {
    camp({ quest, flags: { sa_met_kasane: true } });
    const r = await talk();
    t.ok(flat(r) === flat(['sa.b_nao2']), '2 after Kasane, the letter ' + (quest || 'not started') + ': the next banter as before, never this one ' + flat(r));
  }

  // 3. its lines
  {
    camp({ quest: 'done' });
    await talk();
    const lines = said.map((x) => [x.who, x.key ? x.key.slice(-10) : null, x.en]);
    t.ok(flat(lines.slice(0, 2)) === flat([
      ['nao', '8398fe4d96', 'We gave Umi that letter in Lanternfall. …Think her father will answer her reply?'],
      ['nao', '3bc3163869', 'It\'s fine if no reply comes. It\'s fine. …Though I only came round to thinking that recently.'],
    ]), '3 its two lines: the Japanese and voice keys unchanged, the English clarified ' + flat(lines.slice(0, 2)));
    t.ok(lines.length === 4 && lines[2][2] === 'You\'ve changed, Nao.' && /^Haven't changed\. I can just read the address now\. My own\.$/.test(lines[3][2] || ''), '3 its closing lines as before ' + flat(lines.slice(2)));
  }

  // 4. repeats and old saves
  {
    camp({ quest: 'done', seen: ['sa.b_nao1'] });
    const again = await talk();
    camp({ quest: 1, seen: ['sa.b_nao1'] });
    const old = await talk();
    t.ok(flat(again) === flat(['sa.b_nao1']) && !old.length, '4 heard already with the letter delivered: it can come up again (the only banter here); a save that heard it without the delivery: not offered ' + flat({ again, old }));
  }

  // 5. the camp's rest menu
  {
    camp({ quest: 'done' });
    menus = []; runs = []; pick = 'Just chat';
    await RB.hooks.co_rest([]); await settle();
    const withIt = { menu: menus[0] || [], runs: runs.slice() };
    camp({ quest: 1 });
    menus = []; runs = []; pick = 'Not now';
    await RB.hooks.co_rest([]); await settle();
    const without = { menu: menus[0] || [], runs: runs.slice() };
    t.ok(withIt.menu.includes('Just chat') && withIt.runs.includes('sa.b_nao1') && !without.menu.includes('Just chat') && !without.runs.includes('sa.b_nao1'),
      '5 the camp\'s rest menu: "Just chat" with the letter delivered, playing this talk; none without ' + flat({ withIt, without }));
    pick = 'Not now';
  }

  // 6. after the story
  {
    camp({ quest: 'done', flags: { postgame: true, sa_met_kasane: true, sa_hush_down: true }, seen: ['lf.umi_post'] });
    const r = await talk();
    t.ok(!r.includes('sa.b_nao1'), '6 after the story, the letter delivered and lf.umi_post heard: not offered ' + flat(r));
  }

  // 7. Mio
  for (const quest of [null, 'done']) {
    camp({ comp: 'mio', quest });
    const r = await talk();
    t.ok(flat(r) === flat(['sa.b_mio1']), '7 Mio before Kasane, the letter ' + (quest || 'not started') + ': her own banter as before ' + flat(r));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
