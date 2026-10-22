// RBN-QA-122 (Agnes 6346849640, 6347484032; Cloud CC-127 §6): the Kettle Below's win said the same thing three times
// in a row: the encounter's ending, the creature's victory outro and the story's narration over the illustrated
// aftermath each had it sink and breathe out warm steam, "just right". Now each layer says its own:
//  1. the narration over the aftermath is unchanged (the line, its place after the encounter, the sequence around it);
//  2. the outro is short and stands alone (it also plays in a review battle, after nothing): 「釜の主の蓋が、鳴り止んだ。」
//     / "The Kettle's lid stops rattling.", answering its intro's rattling lid; no "just right", no sinking;
//  3. each ending says what its own route did: 'settled' (reached only through the promise) names the promise;
//     'heard' no longer sinks it (the narration does); 'dozes' is unchanged, uneasy; no other ending speaks of a promise;
//  4. played through: each ending is reached and its text and flags are what the encounter gives; the promise flag
//     only on 'settled'; every ending a win (none a defeat), as before;
//  5. nothing else in the encounter or the creature changed: the conditions, results and flags, the cards, the intro;
//  6. the language ledger holds the new outro, self-reviewed for this change, and no longer the old one.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, E = RB.encounter;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const d = C.encounters['yn.kettle'], foe = C.enemies['yn.kettle'];
  const OUTRO = '{釜|かま}の{主|ぬし} の {蓋|ふた} が 、 {鳴|な}り{止|や}んだ 。';
  const h = (x) => { let v = 2166136261 >>> 0; for (let i = 0; i < x.length; i++) { v ^= x.charCodeAt(i); v = Math.imul(v, 16777619) >>> 0; } return v.toString(36); };
  // 1. the narration
  const cmds = C.scenes['yn.kettle'].cmds;
  const enc = cmds.findIndex((c) => c.op === 'encounter' && (c.args || [])[0] === 'yn.kettle');
  const narr = cmds.find((c, i) => i > enc && c.op === 'say' && c.who === 'narr' && /The bubbles fade one by one/.test(c.en || ''));
  t.ok(enc >= 0 && narr && narr.en === 'The bubbles fade one by one. The Kettle sinks to the bottom and quietly breathes out steam: warm steam, just right.' && h(JSON.stringify(cmds.map((c) => [c.op, c.who || '', c.jp || '', c.en || '', (c.args || []).join(' ')]))) === 'gxra9h', 'the narration over the aftermath and the whole scene around it unchanged (' + h(JSON.stringify(cmds.map((c) => [c.op, c.who || '', c.jp || '', c.en || '', (c.args || []).join(' ')]))) + ')');
  // 2. the outro
  t.ok(foe.settle && foe.settle.jp === OUTRO && foe.settle.en === 'The Kettle\'s lid stops rattling.' && /rattles its lid/.test(foe.intro.en), 'the outro: the lid stops rattling, answering the intro\'s rattling lid: ' + (foe.settle && foe.settle.en));
  t.ok(!/just right|sinks|steam/.test(foe.settle.en) && !/ちょうど|沈/.test(foe.settle.jp), 'the outro says nothing the ending or the narration says (no sinking, no steam, no "just right")');
  t.ok(C.reviewEnemies && C.reviewEnemies['yn.kettle'] === 'yn', 'and it is the review battle\'s outro too, where it plays after nothing, so it stands alone');
  // 3. the endings
  const end = (id) => d.conclusions.find((c) => c.id === id);
  t.ok(end('settled').text.en === 'The Kettle has your promise: tomorrow the town will talk, without shouting.' && JSON.stringify(end('settled').when) === JSON.stringify({ all: [{ flag: 'promised' }, { understanding: 3 }] }), '\'settled\', reached only through the promise, names it: ' + end('settled').text.en);
  t.ok(end('heard').text.en === 'The Kettle has been heard, and that is most of what it needed.', '\'heard\' no longer sinks it (the narration does): ' + end('heard').text.en);
  t.ok(end('dozes').text.en === 'Worn out with shaking, the Kettle sinks and dozes, uneasy but quiet. It will listen for the town tomorrow.', '\'dozes\' unchanged, uneasy');
  t.ok(d.conclusions.filter((c) => /promise/i.test(c.text.en)).map((c) => c.id).join() === 'settled' && !d.conclusions.some((c) => /just right/.test(c.text.en)), 'only \'settled\' speaks of the promise; no ending says "just right"');
  // 4. played through to each ending
  const fresh = () => {
    const s = S.newCampaign({ edition: 2 });
    s.comp = 'nao';
    s.words = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu', 'ishi', 'tsuchi', 'koori', 'honoo', 'suzu', 'koe'];
    Object.assign(s.flags, { departed: true, ko_done: true, cr_done: true, yn_called: true, yn_float_found: true });
    RB.game.G.s = s;
    return s;
  };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const found = {}, seen = new Set();
  const explore = (plan, depth) => {
    const s = fresh(), x = E.begin('yn.kettle', s);
    for (const [cid, ca] of plan) { if (x.over) break; const card = E.cards(x, s, wordsOf(s)).find((c) => c.id === cid); if (!card) return; E.exchange(x, { card, res: OK, comp: ca ? { act: ca } : null, target: x.cur }, { enemy: x.foes[0] && x.foes[0].def }); }
    if (x.over) { if (!found[x.enc.outcome]) found[x.enc.outcome] = plan; return; }
    const key = E.stateKey(x) + x.round + JSON.stringify(x.compUses || {});
    if (seen.has(key) || depth > 10) return;
    seen.add(key);
    const acts = [null].concat(((d.social.companion || {})[s.comp] || []).filter((a) => !(x.compUses || {})[a.id]).map((a) => a.id));
    for (const c of E.cards(x, s, wordsOf(s))) if (!c.disabled) for (const ca of acts) explore(plan.concat([[c.id, ca]]), depth + 1);
  };
  explore([], 0);
  const got = {};
  for (const [id, plan] of Object.entries(found)) {
    const s = fresh(), x = E.begin('yn.kettle', s);
    for (const [cid, ca] of plan) { const card = E.cards(x, s, wordsOf(s)).find((c) => c.id === cid); E.exchange(x, { card, res: OK, comp: ca ? { act: ca } : null, target: x.cur }, { enemy: x.foes[0] && x.foes[0].def }); }
    const fin = E.finishEncounter(x, s, x.over);
    got[id] = { text: fin && fin.text && fin.text.en, flags: fin && fin.flags, result: x.over && x.over.result };
  }
  t.ok(['settled', 'heard', 'dozes'].every((id) => got[id] && got[id].text === end(id).text.en && got[id].result !== 'lose'), 'played through, each ending is reached and gives its own text, none a defeat (' + JSON.stringify(got) + ')');
  t.ok(got.settled && got.settled.flags && got.settled.flags.yn_kettle_promised === true && !(got.heard.flags || {}).yn_kettle_promised && !(got.dozes.flags || {}).yn_kettle_promised, 'the promise is recorded only on \'settled\'');
  // 5. nothing else changed (fingerprints of 05196f0)
  const fp = {
    conclusions: h(JSON.stringify(d.conclusions.map((c) => ({ id: c.id, when: c.when, result: c.result, flags: c.flags || null })))),
    social: h(JSON.stringify(d.social)), intro: h(JSON.stringify(foe.intro)), rest: h(JSON.stringify(Object.assign({}, foe, { settle: null }))),
  };
  t.ok(JSON.stringify(fp) === JSON.stringify({ conclusions: 'ezez9g', social: '1t8m2o1', intro: 'fpiiq5', rest: '14rzj9o' }), 'the conditions, results and flags, the cards, the intro and the rest of the creature unchanged ' + JSON.stringify(fp));
  // 6. the ledger
  const led = JSON.parse(fs.readFileSync(path.join(root, 'docs/review/language/yn.json'), 'utf8'));
  const has = (jp) => Object.values(led).find((e) => e && e.jp === jp);
  t.ok(has(OUTRO) && has(OUTRO).status === 'self-reviewed' && /^RBN-QA-122 self-review/.test(has(OUTRO).ref) && !Object.values(led).some((e) => e && e.jp === '{釜|かま}の{主|ぬし} は {湯|ゆ} の {底|そこ} に {沈|しず}み 、 ちょうど いい {温|あたた}かい {湯気|ゆげ} を {吐|は}いた 。'), 'the ledger holds the new outro, self-reviewed for this change, and no longer the old one');
};
