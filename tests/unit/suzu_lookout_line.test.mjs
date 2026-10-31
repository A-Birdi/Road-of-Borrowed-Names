// The lookout's line about Suzu's dance, after hearing it from her (Agnes 6544235086, 6544575390; Local CL-552; Cloud
// CC-396): at the festival Suzu tells you "The piece I was meant to dance twenty years ago", and then, watching from
// the lookout, the narration said "Later you'll hear it was the piece she was meant to dance twenty years ago". Now,
// once her festival talk is heard, the lookout says only the line's first sentence; otherwise the line is as it was,
// under its own key (its recording kept). On the real runner (tests/e2e/suzu_lookout.mjs plays the lookout itself):
//  1. the two lines: the whole line unchanged, its key as before; the first sentence alone, word for word, its own key;
//  2. her festival talk run, in standard speech and in Kansai: it is seen, and then only the short line holds;
//  3. never heard: only the whole line holds;
//  4. with Suzu as your companion: neither (her own branch, as before);
//  5. her festival talk after the lookout's line: the line already chosen was the whole one, and her talk is as before;
//  6. no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';
import crypto from 'node:crypto';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  let said = [];
  RB.ui.dialogue.say = async (o) => { said.push(o && o.en); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  // (no settings record without the screen: one for the speech choice, which the dialogue box applies when it shows a line)
  if (!RB.game.G.settings) RB.game.G.settings = {};

  const FULL = 'Down on the stage, Suzu is dancing. Later you\'ll hear it was the piece she was meant to dance twenty years ago.';
  const SHORT = 'Down on the stage, Suzu is dancing.';
  const lines = C.scenes['co.reflection'].cmds.filter((c) => c.en === FULL || c.en === SHORT);
  const full = lines.find((c) => c.en === FULL), short = lines.find((c) => c.en === SHORT);
  const key = (c) => 'co.reflection#' + crypto.createHash('sha256').update(String(c.jp)).digest('hex').slice(0, 10);
  // ---- 1. the two lines
  t.ok(lines.length === 2 && full && short && key(full) === 'co.reflection#158b47673e' && full.jp.startsWith(short.jp) && full.jp !== short.jp,
    '1 the whole line, its key as before (co.reflection#158b47673e, recorded), and its first sentence alone (' + (short ? key(short) : '?') + ')');

  const camp = (comp, speech) => {
    const s = S.newCampaign({ edition: 2 }); s.comp = comp; s.map = 'co.festival'; s.x = 24; s.y = 15;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true });
    RB.game.G.s = s; RB.game.s = s;
    RB.game.settings.suzuSpeech = speech || 'standard';
    return s;
  };
  const errors = [];
  const talk = async () => { said = []; try { await RB.script.run('co.fest_suzu_c', { npc: 'suzu' }); } catch (e) { errors.push(String(e && e.message || e)); } return said.slice(); };
  // which of the two lines the lookout would say now (its condition held, as the runner tests it)
  const plays = (s) => lines.filter((c) => S.test(s, c.cond || c.if || '')).map((c) => (c === full ? 'full' : 'short'));
  // ---- 2. her festival talk heard, in standard speech and in Kansai
  for (const speech of ['standard', 'kansai']) {
    const s = camp('nao', speech);
    const heard = await talk();
    t.ok(heard.some((l) => /twenty years ago/.test(l || '')) && s.seen['co.fest_suzu_c'] && JSON.stringify(plays(s)) === '["short"]',
      '2 her festival talk heard (' + speech + '): seen, and the lookout says only "' + SHORT + '" (' + JSON.stringify(plays(s)) + ')');
  }
  // ---- 3. never heard
  { const s = camp('nao'); t.eq(plays(s), ['full'], '3 never heard: the whole line, as before'); }
  // ---- 4. Suzu as your companion
  { const s = camp('suzu'); t.eq(plays(s), [], '4 Suzu as your companion: neither line (her own branch, as before)'); }
  // ---- 5. her festival talk after the lookout's line
  {
    const s = camp('nao');
    const before = plays(s);
    const heard = await talk();
    t.ok(JSON.stringify(before) === '["full"]' && heard.some((l) => /twenty years ago/.test(l || '')) && s.seen['co.fest_suzu_c'],
      '5 her talk after the lookout\'s line: that line was the whole one, and her talk is as before (' + JSON.stringify({ before, heard: heard.length }) + ')');
  }
  // ---- 6. no scene ended on an error
  t.ok(!errors.length, '6 no scene ended on an error from the runner (' + JSON.stringify(errors.slice(0, 3)) + ')');
};
