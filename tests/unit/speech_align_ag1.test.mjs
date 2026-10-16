// AG-1 (Robin's review packet of 2026-10-16, RBN_Word_Highlight_AG1): the hover pairs' grammar, case by case.
// Cases S01–S26 and O01–O08 are the packet's reviewer-authored sentences and expectations, unchanged (the packet runs
// them against the core dictionary alone; here they run against the whole game's dictionary). The C… cases are this
// repository's neighbouring controls for the six constructions the packet left open: a positive case beside each, and
// a negative one where a look-alike must not be read as the construction. All are illustrative sentences, not game
// lines; real lines are sampled by tools/review/align_coverage.mjs.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const S = RB.jp.speech;
  const has = (tier, jp, en, n = 0) => ({ tier, jp, en, n, kind: 'has' });
  const empty = (tier, jp, n = 0) => ({ tier, jp, n, kind: 'empty' });
  const not = (tier, jp, en, n = 0) => ({ tier, jp, en, n, kind: 'not' });
  const fn = (jp, f, n = 0) => ({ jp, f, n, kind: 'note' }); // a grammar note (word help), no English
  const grp = (f, members, en) => ({ f, members, en, kind: 'group' }); // a relation with these Japanese words and this English
  const w = 'map', g = 'gmap';
  const cases = [
    ['S01-locative-de', 'ここ で {見|み}ます 。', 'I will look here.', [has(w, '見ます', 'look')]],
    ['S02-full-stop', '{待|ま}って 。 {見|み}て 。', 'Wait. Look.', [has(w, '待って', 'Wait'), has(w, '見て', 'Look')]],
    ['S03-noun-naka', '{箱|はこ} の {中|なか} に あります 。', 'It is inside the box.', [has(w, '中', 'inside'), empty(g, '中')]],
    ['S04-cross-sentence-content', '{私|わたし} は {行|い}く 。 {彼|かれ} は {来|く}る 。', 'I will leave. He will go there.', [not(w, '行く', 'go')]],
    ['S05-quoted-to', '{猫|ねこ} と {犬|いぬ} が いる と {聞|き}いた 。', 'I heard there are cats and dogs.', [empty(g, 'と', 1), fn('と', 'quote', 1)]],
    ['S06-final-ka', 'お{茶|ちゃ} か {水|みず} です か 。', 'Is it tea or water?', [empty(g, 'か', 1), fn('か', 'question', 1)]],
    ['S07-cross-sentence-grammar', '{水|みず} です か 。 それとも お{茶|ちゃ} です か 。', 'Is it water? Or is it tea?', [empty(g, 'か', 0)]],
    ['S08-adjective-desu', '{暑|あつ}い です 。', "It's hot.", [empty(g, 'です'), has(w, '暑い', 'hot'), fn('です', 'polite_desu')]],
    ['S09-discourse-ja', 'じゃ 、 {元気|げんき} です か 。', 'Well then, are you well?', [empty(g, 'じゃ'), fn('じゃ', 'ja_disc')]],
    ['S10-pronoun-contraction', '{彼|かれ} の {名前|なまえ} は レン です 。', "He's called Ren.", [not(g, 'の', "He's")]],
    ['S11-subject-ga', '{雨|あめ} が {降|ふ}る が 、 {私|わたし} は {行|い}く 。', 'It rains, but I will go.', [empty(g, 'が', 0), has(g, 'が', 'but', 1)]],
    ['S12-te-try', '{食|た}べて みます 。', "I'll try eating.", [has(w, '食べて', 'eating'), has(g, 'みます', 'try')]],
    ['S13-te-please', '{飲|の}んで ください 。', 'Please drink.', [has(w, '飲んで', 'drink'), has(g, 'ください', 'Please')]],
    ['S14-te-progressive', '{食|た}べて いる 。', 'I am eating.', [has(w, '食べて', 'eating'), empty(w, 'いる'), fn('いる', 'aspect')]],
    ['S15-single-negative', '{明日|あした} は {行|い}かない 。', "I won't go tomorrow.", [has(w, '行かない', 'go'), has(g, '行かない', "won't")]],
    ['S16-volitional', '{行|い}きましょう 。', "Let's go.", [has(w, '行きましょう', 'go'), has(g, '行きましょう', "Let's")]],
    ['S17-nominal-copula', 'レン です 。', "I'm Ren.", [has(w, 'レン', 'Ren'), has(g, 'です', "I'm")]],
    ['S18-pronoun-possessive', 'これ は {私|わたし} の {本|ほん} だ 。', 'This is my book.', [has(w, '私', 'my'), has(g, 'の', 'my'), has(g, 'だ', 'is')]],
    ['S19-name-possessive', 'レン の {本|ほん} だ 。', "It is Ren's book.", [has(g, 'の', "Ren's")]],
    ['S20-comitative-to', '{友達|ともだち} と {話|はな}します 。', 'I talk with my friend.', [has(g, 'と', 'with')]],
    ['S21-desire', '{魚|さかな} を {食|た}べたい 。', 'I want to eat fish.', [has(w, '食べたい', 'eat'), has(g, '食べたい', 'want'), empty(g, 'を'), fn('を', 'object')]],
    ['S22-maybe', '{来|く}る かもしれない 。', 'He might come.', [has(g, 'かもしれない', 'might'), not(g, 'かもしれない', 'not')]],
    ['S23-polite-blank', '{食|た}べます 。', 'I eat.', [has(w, '食べます', 'eat'), empty(g, '食べます'), fn('食べます', 'polite')]],
    ['S24-nominalizer-no', '{彼|かれ} が {行|い}く の は {嫌|いや} です 。', 'I do not like the idea of him going.', [empty(g, 'の'), fn('の', 'nominal')]],
    ['S25-unknown', 'あばばば 。', 'Something unknown.', []],
    ['S26-empty', '', '', []],
    ['O01-coordinate-to', '{猫|ねこ} と {犬|いぬ} が いる と {聞|き}いた 。', 'I heard there are cats and dogs.', [has(g, 'と', 'and', 0)]],
    ['O02-coordinate-ka', 'お{茶|ちゃ} か {水|みず} です か 。', 'Is it tea or water?', [has(g, 'か', 'or', 0)]],
    ['O03-shared-contraction', '{私|わたし} は レン です 。', "I'm Ren.", [has(w, '私', "I'm"), has(g, 'です', "I'm")]],
    ['O04-negative-desire', '{食|た}べたくない 。', 'I do not want to eat.', [has(g, '食べたくない', 'not'), has(g, '食べたくない', 'want')]],
    ['O05-obligation', '{行|い}かなければ ならない 。', 'I must go.', [has(g, '行かなければ', 'must'), grp('must', ['行かなければ', 'ならない'], ['must'])]],
    ['O06-restrictive-negative', '{水|みず} しか {飲|の}まない 。', 'I drink only water.', [has(g, 'しか', 'only'), grp('only', ['しか', '飲まない'], ['only'])]],
    ['O07-merged-predicate', '{雨|あめ} が {降|ふ}る 。', 'It rains.', [has(w, '雨', 'rains'), has(w, '降る', 'rains')]],
    ['O08-no-obligation', '{行|い}かなくても いい 。', 'You do not have to go.', [has(g, '行かなくても', 'not'), has(g, '行かなくても', 'have'), has(g, '行かなくても', 'to')]],
    // ---- neighbouring controls (this repository)
    // shared contractions: a pronoun and the copula share a contraction part by part; politeness claims nothing
    ['C03a-he-is', '{彼|かれ} は {学生|がくせい} です 。', "He's a student.", [has(w, '彼', "He's"), has(g, 'です', "He's")]],
    ['C03b-polite-future', '{私|わたし} は {行|い}きます 。', "I'll go.", [has(w, '私', "I'll"), empty(g, '行きます'), fn('行きます', 'polite')]],
    // more than one ending on one word; do-support goes with the negative
    ['C04a-dont-want', '{食|た}べたくない 。', "I don't want to eat.", [has(g, '食べたくない', "don't"), has(g, '食べたくない', 'want')]],
    ['C04b-do-not', '{食|た}べない 。', 'I do not eat.', [has(g, '食べない', 'not'), has(g, '食べない', 'do')]],
    ['C04c-no-wish-word', '{食|た}べたくない 。', "I'd rather not eat.", [has(g, '食べたくない', 'not'), not(g, '食べたくない', "I'd")]],
    // obligation in its other shapes; なければ without its ending is a condition, not an obligation
    ['C05a-casual-must', '{行|い}かなきゃ 。', 'I have to go.', [has(g, '行かなきゃ', 'have'), has(g, '行かなきゃ', 'to')]],
    ['C05b-naito-ikenai', '{帰|かえ}らない と いけない 。', 'I need to go home.', [has(g, '帰らない', 'need'), grp('must', ['帰らない', 'と', 'いけない'], ['need', 'to'])]],
    ['C05c-condition', '{急|いそ}がなければ 、 {間|ま}に{合|あ}わない 。', "If we don't hurry, we won't make it.", [has(g, '急がなければ', 'If'), not(g, '急がなければ', 'must')]],
    ['C05d-prohibition', 'ここ で {遊|あそ}んでは いけない 。', 'You must not play here.', [has(g, '遊んでは', 'must'), has(g, '遊んでは', 'not'), has(g, 'いけない', 'not')]],
    // しか…ない and its neighbours: だけ says "only" alone; the plain negative is "not"
    ['C06a-dake', '{水|みず} だけ {飲|の}む 。', 'I drink only water.', [has(g, 'だけ', 'only')]],
    ['C06b-nothing-but', '{水|みず} しか {飲|の}まない 。', 'I drink nothing but water.', [has(g, 'しか', 'nothing'), has(g, 'しか', 'but'), grp('only', ['しか', '飲まない'], ['nothing', 'but'])]],
    ['C06c-plain-negative', '{水|みず} は {飲|の}まない 。', "I don't drink water.", [has(g, '飲まない', "don't")]],
    // noun + verb said as one English word; the noun alone keeps its own word
    ['C07a-snow', '{雪|ゆき} が {降|ふ}る 。', 'It snows.', [has(w, '雪', 'snows'), has(w, '降る', 'snows')]],
    ['C07b-rain-alone', '{雨|あめ} が {好|す}き だ 。', 'I like rain.', [has(w, '雨', 'rain'), empty(g, 'が'), fn('が', 'subject')]],
    // permission, and its look-alikes: ても alone is "even if"
    ['C08a-permission', '{食|た}べても いい 。', 'You can eat.', [has(g, '食べても', 'can'), has(g, 'いい', 'can')]],
    ['C08b-neednt', '{行|い}かなくても いい 。', "You needn't go.", [has(g, '行かなくても', "needn't")]],
    ['C08c-even-if', '{雨|あめ} が {降|ふ}っても {行|い}く 。', "Even if it rains, I'll go.", [has(g, '降っても', 'Even'), has(g, '降っても', 'if'), not(g, '降っても', 'can')]],
    // invitations and literal negative questions; explanations; naming
    ['C09a-invitation', '{一緒|いっしょ} に {行|い}きませんか 。', "Won't you come with me?", [has(g, '行きませんか', "Won't")]],
    ['C09b-explain', '{行|い}く ん です 。', "I'm going.", [empty(g, 'です'), fn('ん', 'explain'), fn('です', 'explain')]],
    ['C09c-naming', 'レン と {申|もう}します 。', "I'm Ren.", [has(w, '申します', "I'm"), grp('naming', ['と', '申します'], ["I'm"])]],
    ['C09d-naming-name-is', '{私|わたし} の {名前|なまえ} は ミオ と いいます 。', 'My name is Mio.', [has(w, '名前', 'name'), has(w, 'いいます', 'is'), has(g, 'の', 'My')]],
    ['C09e-topic', '{私|わたし} は {学生|がくせい} です 。', "I'm a student.", [empty(g, 'は'), fn('は', 'topic'), has(g, 'です', "I'm")]],
  ];
  let pass = 0;
  const failed = [];
  for (const [id, jp, en, expect] of cases) {
    const tokens = RB.jp.parse(jp);
    const before = JSON.stringify(tokens);
    const a = S.align(tokens, en, { authored: false });
    const at = (s, n) => tokens.map((x, i) => (x.surface === s ? i : -1)).filter((i) => i >= 0)[n || 0];
    const txt = (ks) => ks.map((k) => a.words[k].text);
    const res = expect.map((ex) => {
      if (ex.kind === 'note') { const i = at(ex.jp, ex.n); return i != null && a.notes[i].some((n) => n.fn === ex.f && n.kind === 'function'); }
      if (ex.kind === 'group') {
        const r = a.rels.find((r) => r.fn === ex.f);
        return !!r && ex.members.every((m) => r.jp.includes(at(m))) && ex.en.every((e) => txt(r.en).includes(e));
      }
      const i = at(ex.jp, ex.n);
      if (i == null) return false;
      const actual = txt(a[ex.tier][i]);
      return ex.kind === 'has' ? actual.includes(ex.en) : ex.kind === 'not' ? !actual.includes(ex.en) : actual.length === 0;
    });
    const shape = a.map.length === tokens.length && a.gmap.length === tokens.length && a.notes.length === tokens.length;
    const safe = S.collisions(a).length === 0 && before === JSON.stringify(tokens) && (id !== 'S25-unknown' || !a.map.flat().length && !a.gmap.flat().length);
    if (res.every(Boolean) && shape && safe) pass++;
    else failed.push(id + ' ' + JSON.stringify(tokens.map((x, i) => x.surface + (a.map[i].length ? '=' + txt(a.map[i]) : '') + (a.gmap[i].length ? '~' + txt(a.gmap[i]) : '') + (a.notes[i].length ? '[' + a.notes[i].map((n) => n.fn).join(',') + ']' : ''))));
  }
  t.ok(failed.length === 0, 'AG-1 cases and controls: ' + pass + ' / ' + cases.length + (failed.length ? '; failing: ' + failed.join(' | ') : ''));
  // the estimate of when words are spoken is untouched by the alignment work
  const tl = S.timeline(RB.jp.parse('{魚|さかな} を {食|た}べた 。'), 1);
  t.ok(tl.items.length === 3 && tl.items[0].at === 0, 'the spoken-word estimate is unchanged');
  // three outcomes: a relation, a grammar note with no English, or unresolved; never an empty status for a word
  const a = S.align(RB.jp.parse('{猫|ねこ} と {犬|いぬ} が いる と {聞|き}いた 。'), 'I heard there are cats and dogs.', { authored: false });
  t.ok(a.status.every((s, i) => (RB.jp.parse('{猫|ねこ} と {犬|いぬ} が いる と {聞|き}いた 。')[i].punct ? s === null : /^(linked|function|unresolved)$/.test(s))), 'each word is linked, explained or unresolved: ' + a.status.join(','));
};
