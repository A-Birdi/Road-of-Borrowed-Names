// The Atlas, Nao's own parcel tag found on an expedition (Agnes 6556292010; Local CL-607; Cloud CC-444): Nao's reaction
// said {私|わたし}, where Nao says {俺|おれ} everywhere else, the Atlas included. Only that pronoun changes. In the
// loaded game:
//  1. the reaction: 「…… これ 、 {俺|おれ} が {書|か}いた {荷札|にふだ} だ 。 …」, its English and its stored expression
//     as before;
//  2. its nine words all known to the game, and the line valid;
//  3. the recording list: Nao's line listed under its new key (code.atlas#245cb8826e) with the expression it is shown
//     with (think), the old key (#6f07dc42ff) listed nowhere, and the other companions' lines for the tag (the general
//     reaction each falls back to) under their own keys as before;
//  4. every other relic reaction as before (37 lines, by a fingerprint of the table before this change), Mio's and
//     Ren's own {私|わたし} kept.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const flat = (x) => JSON.stringify(x);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
  const L = RB.atlas.compLines, R = L.RELIC_REACT;
  const NEW = '…… これ 、 {俺|おれ} が {書|か}いた {荷札|にふだ} だ 。 {配|くば}り{損|そこ}ねた {分|ぶん} か 。';

  // 1. the reaction
  const nao = R.tag_nao.nao;
  t.ok(nao.jp === NEW && nao.en === '…This is a tag I wrote. One of the ones I never delivered.' && nao.expr === 'surprise',
    '1 Nao\'s reaction to the tag: 俺, its English and stored expression as before ' + flat(nao));

  // 2. the words
  const toks = RB.jp.parse(nao.jp).filter((x) => !x.punct);
  const unknown = toks.filter((x) => RB.jp.lookup(x).unknown).map((x) => x.surface);
  const problems = RB.jp.validate(nao.jp);
  t.ok(toks.length === 9 && !unknown.length && !problems.length && toks.some((x) => x.surface === '俺') && !toks.some((x) => x.surface === '私'),
    '2 its nine words all known, the line valid ' + flat({ n: toks.length, unknown, problems }));

  // 3. the recording list
  const listed = [].concat(...(RB.content.spokenSources || []).map((f) => f())).filter((l) => l.scene === 'code.atlas');
  const tag = listed.filter((l) => /relic tag_nao$/.test(l.file || '')).map((l) => [l.who, keyOf(l.scene, l.jp).slice(-10), l.expr]);
  t.ok(flat(tag) === flat([['narr', '8b0bd4f07e', null], ['nao', '245cb8826e', 'think'], ['mio', '8921edecec', 'think'], ['ren', '2809810bd7', 'think'], ['suzu', '1a55502016', 'think']]),
    '3 the recording list for the tag: Nao under the new key with "think", the others as before ' + flat(tag));
  t.ok(!listed.some((l) => keyOf(l.scene, l.jp) === 'code.atlas#6f07dc42ff'), '3 the old key is listed nowhere');

  // 4. every other relic reaction
  const rest = [];
  for (const k of Object.keys(R).sort()) for (const c of Object.keys(R[k]).sort()) if (!(k === 'tag_nao' && c === 'nao')) rest.push([k, c, R[k][c].jp, R[k][c].en, R[k][c].expr || null]);
  const fp = crypto.createHash('sha256').update(JSON.stringify(rest)).digest('hex').slice(0, 16);
  t.ok(rest.length === 37 && fp === '2fb606b004a83833', '4 every other relic reaction as before (37 lines, fingerprint of the table before) ' + flat({ n: rest.length, fp }));
  t.ok(/\{私\|わたし\}/.test(R.vial_mio.mio.jp) && /\{私\|わたし\}/.test(R.compass.ren.jp), '4 Mio\'s and Ren\'s own 私 kept');
};
