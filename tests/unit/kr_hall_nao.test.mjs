// Nao at the Shuttered Hall (Agnes 6547089952; Cloud CC-403; Local CL-561; Agnes 6547199277): 「{閉|し}まってる な 。」 is
// "it's closed", but its English read "Shut up.", an order to be quiet. Only the English changes, in the scene and in the
// language ledger's entry for the line. In the loaded game and its ledger (docs/review/language/kr.json):
//  1. Nao's line: the Japanese as before, so its voice key (kr.hall_first#0a5fa5d0a8); the English "It's closed. A
//     building with no address."; only with Nao;
//  2. the ledger's entry for it (scene:kr.hall_first#81iaom): its Japanese and English now the line's own, its status and
//     review note as before; every other entry in the ledger as before (by a fingerprint of the file before this change,
//     less this one English);
//  3. the scene played on the real runner with each companion: Nao's new English; Ren's, Mio's and Suzu's lines and the
//     narration as before (their keys and English, by a fingerprint);
//  no scene ended on an error from the runner.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
  const JP = '{閉|し}まってる な 。 {宛先|あてさき} の ない {建物|たてもの} だ 。';
  const EN = 'It\'s closed. A building with no address.';
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  // 1. Nao's line
  const says = C.scenes['kr.hall_first'].cmds.filter((c) => c.op === 'say');
  const nao = says.filter((c) => c.if === 'comp=nao');
  t.ok(nao.length === 1 && nao[0].jp === JP && keyOf('kr.hall_first', nao[0].jp) === 'kr.hall_first#0a5fa5d0a8' && nao[0].en === EN,
    '1 Nao\'s line: the Japanese and its key as before, the English "It\'s closed." ' + flat(nao));

  // 2. the ledger
  const ledger = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'docs/review/language/kr.json'), 'utf8'));
  const e = ledger['scene:kr.hall_first#81iaom'];
  t.ok(e && e.jp === nao[0].jp && e.en === nao[0].en && e.status === 'self-reviewed' && fp(e.ref) === REF_FP,
    '2 its ledger entry: the line\'s own Japanese and English, the status and review note as before ' + flat({ jp: e && e.jp, en: e && e.en, status: e && e.status, ref: e && fp(e.ref) }));
  const rest = Object.keys(ledger).sort().map((k) => [k, k === 'scene:kr.hall_first#81iaom' ? Object.assign({}, ledger[k], { en: null }) : ledger[k]]);
  t.ok(fp(rest) === LEDGER_FP, '2 every other entry, and this one less its English, as before ' + flat({ n: rest.length, fp: fp(rest) }));

  // 3. the scene with each companion
  let said = [];
  RB.ui.dialogue.say = async (o) => { said.push([o.who, o.jp ? keyOf(o.sceneId, o.jp) : null, o.en || '']); };
  RB.ui.dialogue.hide = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors', 'placeCompanion', 'ensureSpeaker']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  const heard = {};
  for (const comp of ['nao', 'ren', 'mio', 'suzu']) {
    const s = S.newCampaign({ edition: 2 });
    s.comp = comp; s.map = 'kr.hall';
    s.flags.departed = true;
    RB.game.G.s = s; RB.game.s = s;
    said = [];
    try { await RB.script.run('kr.hall_first'); } catch (err) { errors.push(comp + ': ' + err.message); }
    heard[comp] = said.slice();
  }
  const naoSaid = heard.nao.filter((x) => x[0] === 'comp' || x[0] === 'nao');
  t.ok(naoSaid.length === 1 && naoSaid[0][1] === 'kr.hall_first#0a5fa5d0a8' && naoSaid[0][2] === EN && !heard.nao.some((x) => /Shut up/.test(x[2])),
    '3 with Nao: the new English under the same key ' + flat(heard.nao));
  const others = ['ren', 'mio', 'suzu'].map((c) => heard[c]);
  t.ok(fp(others) === OTHERS_FP && others.every((h) => !h.some((x) => x[2] === EN)), '3 with Ren, Mio and Suzu: their lines and the narration as before ' + flat({ fp: fp(others), n: others.map((h) => h.length) }));

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
// before this change (computed on its parent): the review note, the ledger less this English, the other companions' lines
const REF_FP = '2a23edba07f31e84', LEDGER_FP = '217cc1748bd129ac', OTHERS_FP = 'b5f50b9e57104fc6';
