// RV-1: word help on the spoken lines, checked against what each token actually means in its line.
// For each listed case (a kana token word help explains with the wrong word), counts the lines where the game's own
// lookup (RB.jp.lookup, or RB.dialect.lookupIn on a Kansai line, as the word-help panel does) shows that entry, and
// gives examples. Read-only. Usage: node tools/review/wordhelp_check.mjs --lines <lines.json> [--out <file>]
import fs from 'node:fs';
import { RB } from '../voice/lines.mjs';

const a = process.argv.slice(2), opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const lines = JSON.parse(fs.readFileSync(opt('--lines'), 'utf8'));
// [id, token test, the entry word help shows wrongly, what it is in these lines, kind, optional context test on the line]
const CASES = [
  ['kai', /^かい$/, '回', 'sentence-final question particle かい (a familiar, often older speaker\'s yes/no question)', 'marked'],
  ['tsuku', /^つ(い[てた]|いてる|いてた|いたら|かない|きます|きません|けな)$/, '着く', 'つく as 付く / 点く / 吐く (嘘をつく, 気がつく, 名前がつく, ついて来る, 灯がつく), not "arrive"', 'kana', (l) => /嘘を|気が|名前が|説明が|ついて来|ついてく|火が|灯|灯り|をつけ|気をつけ/.test(l.plain)],
  ['yameru', /^やめ(て|た|ない|れば|ておく|ておきます)?$/, '止む', 'やめる (止める: to quit, to stop doing), not 止む (rain stopping)', 'kana'],
  ['nanda', /^なん(だ|です|だって|でしょう)$/, '何', 'な + explanatory んだ / んです, not 何 "what"', 'contraction'],
  ['okage', /^おかげ$/, '影', 'おかげ (お陰): thanks to', 'kana'],
  ['k_hen', /^へん$/, '変', 'Kansai 〜へん after a て-form (〜てへん = 〜ていない), not 変 "strange"', 'dialect'],
  ['k_ookini', /^おおきに$/, '沖', 'Kansai おおきに: thank you', 'dialect'],
  ['honto', /^ほんと$/, '本', 'ほんと (本当, casual): really', 'contraction'],
  ['furi', /^ふり$/, '降る', 'ふり (振り): pretending (分かったふり)', 'kana'],
  ['ofukuro', /^おふくろ$/, '袋', 'おふくろ: mum (a grown son\'s casual word)', 'marked'],
  ['omae', /^おまえ$/, '前', 'おまえ (お前): you (familiar or rough)', 'marked'],
  ['kujiita', /^くじいた$/, '九時', 'くじいた (挫いた): sprained', 'kana'],
  ['tsumannai', /^つまんない$/, '妻', 'つまんない = つまらない (casual): boring', 'contraction'],
  ['dandan', /^だんだん$/, '段', 'だんだん: gradually', 'kana'],
  ['jarou', /^じゃろう$/, '蝋', 'じゃろう = だろう (older western speech)', 'marked'],
  ['gozaru', /^ござる$/, 'ご', 'ござる: archaic polite "to be" (a deliberately old-fashioned speaker)', 'marked'],
  ['gozaimashite', /^ございまして$/, 'ござ', 'ございまして: polite て-form of ございます', 'marked'],
  ['janken', /^じゃんけん$/, '剣', 'じゃんけん: rock-paper-scissors', 'kana'],
  ['techa', /^ちゃ$/, '茶', '〜ちゃ = 〜ては (casual): if you (do)…', 'contraction'],
  ['gochamaze', /^ごちゃまぜ$/, '茶', 'ごちゃまぜ: a jumble', 'kana'],
  ['shimouta', /^しもうた$/, '霜', 'しもうた = しまった (older western speech)', 'marked'],
  ['tabini', /^たびに$/, '旅', '〜たびに (度に): every time', 'kana'],
  ['omake', /^おまけ$/, '巻く', 'おまけ: an extra, a bonus', 'kana'],
  ['yakeni', /^やけに$/, '焼く', 'やけに: awfully, strangely', 'kana'],
  ['hitotamari', /^ひとたまり$/, '人', 'ひとたまりもない: (would not last) a moment', 'kana'],
  ['mashi', /^ましよ$/, '増す', 'まし: better (of two poor choices)', 'kana'],
  ['okyou', /^おきょう$/, '今日', 'おきょう (お経): sutras', 'kana'],
  ['ainiku', /^あいにく$/, '愛', 'あいにく: unfortunately', 'kana'],
  ['sumanai', /^すまない$/, '住む', 'すまない (済まない): sorry', 'marked'],
  ['tsutta', /^つった$/, '釣る', 'つった (攣った): got a cramp', 'kana'],
  ['nkatta', /^かった$/, '買う', 'a past ending after ん / 悪: 通れんかった, 悪かった, not 買う "buy"', 'contraction'],
  ['zawazawa', /^ざわざわ$/, '技', 'ざわざわ: uneasy stirring (mimetic)', 'kana'],
  ['kakari', /^かかり過ぎてる$/, '係', 'かかり過ぎてる (掛かり過ぎている): costs too much', 'kana'],
];
const hits = Object.fromEntries(CASES.map((c) => [c[0], { id: c[0], shown: c[2], is: c[3], kind: c[4], lines: 0, tokens: 0, speakers: {}, examples: [] }]));
let checked = 0;
for (const l of lines) {
  const variants = [[l.jp, false]];
  if (l.kansai) { const f = RB.dialect.find(l.jp, l.en); if (f && !f.same) variants.push([f.jp, true]); }
  for (const [jp, isK] of variants) {
    const toks = RB.jp.parse(jp);
    const seen = new Set();
    toks.forEach((t, i) => {
      if (t.punct || t.ph) return;
      checked++;
      for (const [id, re, wrong, , , ctx] of CASES) {
        if (!re.test(t.surface || '')) continue;
        let r = isK ? RB.dialect.lookupIn(toks, i) : null;
        if (!r) r = RB.jp.lookup(t);
        if (!r || !r.entry || r.entry.w !== wrong) continue;
        if (ctx && !ctx(l)) continue;
        const h = hits[id];
        h.tokens++;
        if (!seen.has(id)) { h.lines++; seen.add(id); }
        h.speakers[l.speaker] = (h.speakers[l.speaker] || 0) + 1;
        if (h.examples.length < 4) h.examples.push({ key: l.key, speaker: l.speaker, kansai: isK, text: RB.jp.plain(jp).replace(/\s+/g, ''), en: l.en });
      }
    });
  }
}
const out = Object.values(hits).filter((h) => h.tokens).sort((x, y) => y.tokens - x.tokens);
const res = { checkedTokens: checked, lines: lines.length, cases: out };
if (opt('--out')) fs.writeFileSync(opt('--out'), JSON.stringify(res, null, 1));
for (const h of out) console.log(String(h.tokens).padStart(4), h.id.padEnd(14), 'shown ' + h.shown, '| is', h.is.slice(0, 60), '| e.g.', h.examples[0].key);
console.log('tokens checked', checked);
