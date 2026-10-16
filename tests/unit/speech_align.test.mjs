// Spoken-word highlighting (PT-1c, src/lang/88_speech_align.js): every spoken line's words can be found in what a
// voice says (so a voice's position always names a word), the estimate moves forward through the words, and the
// English counterparts are the right ones on known lines; particles, the copula and endings pair in their own tier
// (LI-12).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const S = RB.jp.speech;
  t.ok(S && typeof S.align === 'function' && typeof S.offsets === 'function', 'RB.jp.speech exists');
  const vars = { name: 'ロビン' };
  const render = (jp) => RB.jp.render(jp, { vars, spacing: true, furigana: true }).tokens;

  // ---- every spoken line: each word's reading in order in the spoken text; positions name words in order
  let lines = 0, missing = 0, backwards = 0;
  for (const id in RB.content.scenes) {
    for (const c of RB.content.scenes[id].cmds || []) {
      if (c.op !== 'say' || !c.jp) continue;
      lines++;
      const toks = render(c.jp);
      const spoken = RB.jp.reading(c.jp, vars);
      const offs = S.offsets(toks, spoken);
      const words = toks.filter((x) => !x.punct && String(x.reading || x.surface || '').trim()).length;
      if (offs.length !== words) missing++;
      let last = -1;
      for (const o of offs) { const i = S.tokenAt(offs, o.start); if (i !== o.i || i < last) backwards++; last = i; }
    }
  }
  t.ok(lines > 13000, 'spoken lines checked: ' + lines);
  t.ok(missing === 0, 'every word of every spoken line is found in what the voice says (' + missing + ' lines short)');
  t.ok(backwards === 0, 'a position inside a word names that word, in order (' + backwards + ' disagreements)');

  // ---- the estimate: words in order, each after the last, punctuation adds a pause
  const tk = render('{旅|たび} の {人|ひと} 。 {泥|どろ} だらけ だ ね 。');
  const tl = S.timeline(tk, 1);
  t.ok(tl.items.length >= 6 && tl.items.every((x, k) => k === 0 || x.at > tl.items[k - 1].at), 'the estimate moves forward word by word');
  const slow = S.timeline(tk, 0.5);
  t.ok(Math.abs(slow.total - tl.total * 2) < 0.6, 'a slower voice stretches the estimate (' + tl.total.toFixed(2) + ' s → ' + slow.total.toFixed(2) + ' s)');

  // ---- English counterparts on known lines
  const pairs = (jp, en) => {
    const toks = render(jp);
    const a = S.align(toks, en, { name: 'Robin' });
    const out = {};
    toks.forEach((x, i) => { if (a.map[i].length) out[x.surface] = a.map[i].map((k) => a.words[k].text.toLowerCase().replace(/[^a-z']/g, '')).join(' '); });
    return out;
  };
  const p1 = pairs('{旅芸人|たびげいにん} は {井戸|いど} の {近|ちか}く で {歌|うた}って る 。', 'The performer is singing by the well.');
  t.ok(p1['井戸'] === 'well', 'well ← 井戸: ' + JSON.stringify(p1));
  t.ok(!p1['は'] && !p1['の'] && !p1['で'], 'particles are not content words (they have the grammar tier): ' + JSON.stringify(p1));
  const p2 = pairs('…… {鞄|かばん} の {底|そこ} に 、 {届|とど}けて ない {手紙|てがみ} が {一通|いっつう} ある 。', '…At the bottom of my satchel there\'s one letter I haven\'t delivered.');
  t.ok(p2['鞄'] === 'satchel' && p2['手紙'] === 'letter' && p2['底'] === 'bottom', 'satchel, letter, bottom: ' + JSON.stringify(p2));
  // one English word is used once; where two could match, the nearer in the sentence wins
  const p3 = pairs('…… じゃ 、 {次|つぎ} の {便|びん} が ある から 。 {右|みぎ} の {桟橋|さんばし} は {歩|ある}く な よ 。', '…Right. Got the next run. Stay off the right-hand pier.');
  t.ok(p3['右'] === 'righthand' && p3['次'] === 'next', 'the right-hand pier, not "Right." at the start: ' + JSON.stringify(p3));
  // the player's name, as the English shows it
  const p4 = pairs('$name 、 {鐘|かね} の {決|き}まり 、 {覚|おぼ}えてる よね ？', 'Robin, you remember the bell rules, right?');
  t.ok(p4['鐘'] === 'bell' && /robin/.test(Object.values(p4).join(' ')), 'the bell, and the name: ' + JSON.stringify(p4));

  // ---- LI-12 (Robin, 2026-10-16): verbs, keigo and the copula pair too; particles and endings in their own tier
  const both = (jp, en) => {
    const toks = render(jp);
    const a = S.align(toks, en, { name: 'Robin' });
    const w = {}, g = {};
    const txt = (k) => a.words[k].text.toLowerCase().replace(/[^a-z']/g, '').replace(/\u2019/g, "'");
    toks.forEach((x, i) => {
      if (a.map[i].length) w[x.surface] = a.map[i].map(txt).join(' ');
      if (a.gmap[i].length) g[x.surface] = a.gmap[i].map(txt).join(' ');
    });
    return { w, g, a, toks };
  };
  const k1 = both('レン と {申|もう}します 。 ミオ さん の {友達|ともだち} です 。', "I'm Ren. I'm a friend of Mio's.");
  t.ok(k1.w['申します'] === "i'm" && k1.w['レン'] === 'ren', '申します (humble "to be called") ← "I\'m": ' + JSON.stringify(k1));
  t.ok(k1.g['です'] === "i'm", 'the copula です ← the second sentence\'s "I\'m": ' + JSON.stringify(k1.g));
  t.ok(k1.g['の'] === 'of' || k1.g['の'] === "mio's", 'の ← "of" or the noun\'s "\'s": ' + JSON.stringify(k1.g));
  // (AG-1: と quoting the name belongs to the naming construction X と申します, with 申します, never alone)
  const naming = k1.a.rels.find((r) => r.fn === 'naming');
  t.ok(naming && naming.jp.length === 2 && !k1.g['と'], 'と quoting a name is part of the naming construction, not a grammar word of its own: ' + JSON.stringify(naming));
  const k2 = both('{明日|あした} は {行|い}かない 。 {一緒|いっしょ} に {行|い}きましょう か ？', "I won't go tomorrow. Shall we go together?");
  t.ok(k2.w['行かない'] === 'go' && k2.g['行かない'] === "won't", '行かない: "go" (word) and "won\'t" (its negative ending): ' + JSON.stringify(k2));
  t.ok(k2.w['行きましょう'] === 'go' && k2.g['行きましょう'] === 'shall', '行きましょう: "go" and "Shall" (its volitional ending): ' + JSON.stringify(k2));
  t.ok(k2.w['行かない'] !== k2.w['行きましょう'] || k2.a.map[2][0] !== k2.a.map[7][0], 'the two 行く each take their own "go"');
  const k3 = both('{旅芸人|たびげいにん} は {井戸|いど} の {近|ちか}く で {歌|うた}って る 。', 'The performer is singing by the well.');
  t.ok(k3.g['で'] === 'by' && !k3.g['は'], 'で ← "by"; は (the topic) has no English: ' + JSON.stringify(k3.g));
  const k4 = both('これ は {私|わたし} の {本|ほん} だ 。', 'This is my book.');
  t.ok(k4.w['私'] === 'my' && k4.g['の'] === 'my' && k4.g['だ'] === 'is', '私 の ← "my" (の with it), だ ← "is": ' + JSON.stringify(k4));
  const k5 = both('{魚|さかな} を {食|た}べたい 。', 'I want to eat fish.');
  t.ok(k5.w['食べたい'] === 'eat' && k5.g['食べたい'] === 'want' && !k5.g['を'], '食べたい: "eat" and "want" (～たい); を has none: ' + JSON.stringify(k5));

  // ---- coverage over the game: most lines get at least one pair; no English word is marked twice in a line
  let withPair = 0, total = 0, twice = 0, gtwice = 0, withGram = 0;
  for (const id in RB.content.scenes) {
    for (const c of RB.content.scenes[id].cmds || []) {
      if (c.op !== 'say' || !c.jp || !c.en || (c.who || 'narr') === 'narr') continue;
      total++;
      const toks = render(c.jp);
      const a = S.align(toks, c.en.replace(/\$name/g, 'Robin'), { name: 'Robin' });
      if (a.map.flat().length) withPair++;
      if (a.gmap.flat().length) withGram++;
      // AG-1: an English word may be shared, but only part by part ("I'm" is I + be; "my" is I + 's) or within one
      // relation (a construction, a noun + verb said as one word): no part of a word is claimed twice
      twice += S.collisions(a).length;
      const parts = new Map();
      for (const r of a.rels) for (const [k, p] of r.claims) parts.set(k, (parts.get(k) || new Set()).add(r.id));
      for (const [k, ids] of parts) if (ids.size > 1 && a.words[k].parts.length < 2) gtwice++;
    }
  }
  t.ok(withPair / total > 0.9, 'lines with at least one Japanese–English pair: ' + withPair + ' / ' + total);
  t.ok(twice === 0, 'no part of an English word is claimed by two relations (' + twice + ')');
  t.ok(gtwice === 0, 'an English word shared by two relations is always one with parts, each relation its own part (' + gtwice + ')');
  t.ok(withGram / total > 0.5, 'lines with at least one grammar pair: ' + withGram + ' / ' + total);
};
