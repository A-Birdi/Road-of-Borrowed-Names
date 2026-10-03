// Suzu's Kansai-ben (docs/dialect/suzu_kansai.md; src/lang/85_dialect.js, src/content/dialect/*).
// The inventory of every line Suzu speaks (tools/suzu_inventory.mjs: scenes by flow analysis, every
// data table of her words, and a source scan as a safety net) is kept here as a test: each line has a
// Kansai version (or an explicit "same"), with furigana on every kanji and a lexicon entry for every
// word. Then the mechanism: the swap happens only for Suzu and only when chosen, the standard line
// stays behind it, templates fill in, and Kansai forms stay out of the standard vocabulary.
import { load, root } from '../lib/load.mjs';
import { suzuInventory, checkDialect, norm } from '../../tools/suzu_inventory.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const D = RB.dialect;
  t.ok(!!D, 'RB.dialect is loaded');

  // ---- the inventory and its coverage ---------------------------------------------------------------
  const inv = suzuInventory(RB, { root });
  const res = checkDialect(RB, inv);
  t.eq(res.errors.slice(0, 8), [], 'every Suzu line has a Kansai version with furigana and lexicon entries (' + res.errors.length + ' problems)');
  t.eq(res.warnings.slice(0, 5), [], 'no stale Kansai entries (' + res.warnings.length + ')');
  t.eq(inv.scan.slice(0, 5).map((x) => x.file + ':' + x.line + ' ' + x.jp), [], 'the source scan finds no Suzu Japanese outside the inventory (' + inv.scan.length + ')');
  t.ok(res.stats.unique > 800, 'the inventory lists her lines (' + res.stats.unique + ' unique of ' + res.stats.lines + ')');
  t.eq(res.stats.kansai + res.stats.same, res.stats.unique, 'every unique line is either Kansai or explicitly the same');
  t.ok(res.stats.same <= 12, 'only a handful are explicitly the same in Kansai (' + res.stats.same + ')');
  const bySys = {};
  for (const l of inv.lines) bySys[l.sys] = (bySys[l.sys] || 0) + 1;
  t.log('inventory by system: ' + JSON.stringify(bySys) + '; labels (not speech): ' + inv.labels.length);
  for (const sys of ['scene', 'company', 'cases', 'discovery', 'wordplay', 'fishing', 'pets', 'pages', 'atlas']) t.ok(bySys[sys] > 0, 'the inventory covers ' + sys);
  t.ok(bySys.scene > 600, 'scene lines (suzu: and comp lines that can be hers): ' + bySys.scene);
  // labels (her name, menu labels, the player's replies, narration) are not her speech
  t.ok(inv.labels.some((l) => l.where === 'chars.suzu.name'), 'her name is a label, not a line');
  for (const l of inv.labels) t.ok(!D.table('kansai').has(norm(l.jp)) || inv.byKey.has(norm(l.jp)), 'a label has no Kansai version: ' + l.where);

  // no caricature: the stock stage-Osaka words are not in her lines
  const CARICATURE = ['さかい', 'まんねん', 'でんがな', 'まっせ', 'でっせ', 'おまっ', 'わて'];
  let okini = 0;
  for (const [, e] of D.table('kansai')) {
    const plain = RB.jp.plain(e.jp);
    for (const w of CARICATURE) t.ok(plain.indexOf(w) < 0, 'no caricature form ' + w + ' in ' + e.where);
    if (plain.indexOf('おおきに') >= 0) okini++;
  }
  t.ok(okini <= 2, 'おおきに is rare (' + okini + ')');

  // ---- the switch ----------------------------------------------------------------------------------------
  // (RB.game.settings is read-only outside a running game: give this context its own record)
  const ST = RB.game.defaultSettings();
  Object.defineProperty(RB.game, 'settings', { get: () => ST, configurable: true });
  t.ok(!('suzuSpeech' in RB.game.settings), 'the setting is additive: default settings do not carry it');
  t.eq(D.choice(), 'standard', 'absent setting = standard');
  const s = RB.state.newCampaign({});
  s.comp = 'suzu';
  RB.game.s = s;
  const STD = { who: 'suzu', jp: '{開幕|かいまく} ！ …… ふふ 、 {一度|いちど} {言|い}って みたかった の 。', en: 'Curtain up! …Heh. I always wanted to say that.' };
  t.ok(D.line('suzu', STD) === STD, 'standard choice: her line is shown as authored');
  RB.game.settings.suzuSpeech = 'kansai';
  t.eq(D.choice(), 'kansai', 'Kansai chosen');
  const K = D.line('suzu', STD);
  t.ok(K !== STD && K.dia === 'kansai', 'Kansai choice: her line is swapped');
  t.ok(K.jp !== STD.jp && K.en !== STD.en, 'both the Japanese and the English are re-voiced: ' + RB.jp.plain(K.jp) + ' / ' + K.en);
  t.eq(K.std, { jp: STD.jp, en: STD.en }, 'the standard line stays behind the shown one');
  t.eq(D.std(K).jp, STD.jp, 'std() gives back the standard line (what a save keeps)');
  t.ok(D.isKansai(K.jp), 'the shown line is known as Kansai (word help reads it with the Kansai lexicon)');
  t.ok(D.line('nao', STD) === STD && D.line('mio', STD) === STD, 'other speakers are never swapped');
  t.ok(D.line('comp', STD).dia === 'kansai', "'comp' resolves to Suzu when she is the companion");
  s.comp = 'nao';
  t.ok(D.line('comp', STD) === STD, "'comp' is not swapped when the companion is someone else");
  s.comp = 'suzu';
  t.ok(D.line('suzu', { jp: 'これ は {誰|だれ} も {言|い}わない {文|ぶん} 。', en: 'x' }).dia === undefined, 'a line not in the table is shown as authored');
  // a template: What We Keep frames a memory title (%T)
  const frame = RB.content.company.keep.frame.suzu;
  const filled = { jp: frame.jp.replace('%T', '{雪鈴|ゆきすず} の {夜|よる}'), en: frame.en.replace('%T', 'The Snowbell night') };
  const KF = D.line('suzu', filled);
  t.ok(KF.dia === 'kansai' && KF.jp.indexOf('{雪鈴|ゆきすず} の {夜|よる}') >= 0 && KF.en.indexOf('The Snowbell night') >= 0, 'a template keeps its filled-in title in both languages');
  // several lines joined (a discovery memory)
  const parts = [STD, { jp: '{了解|りょうかい} 。', en: 'Understood.' }];
  const J = D.joined('suzu', { jp: parts.map((p) => p.jp).join(' '), en: 'x' }, parts);
  t.ok(J.dia === 'kansai', 'joined lines are swapped part by part');
  RB.game.settings.suzuSpeech = 'standard';
  t.ok(D.line('suzu', STD) === STD, 'switching back shows the standard line again');

  // ---- word help for Kansai words and forms ------------------------------------------------------------
  RB.game.settings.suzuSpeech = 'kansai';
  const help = (jp, surface) => {
    const toks = RB.jp.parse(jp);
    const i = toks.findIndex((x) => x.surface === surface);
    return i < 0 ? null : D.lookupIn(toks, i);
  };
  const h1 = help('ほんま に ええ {天気|てんき} や な 。', 'ほんま');
  t.ok(h1 && h1.dia && h1.dia.std === '本当', 'ほんま is explained as Kansai for 本当');
  t.ok(/Kansai dialect/.test(D.note(h1)), 'its note says it is Kansai: ' + D.note(h1));
  const h2 = help('ほんま に ええ {天気|てんき} や な 。', 'や');
  t.ok(h2 && h2.dia && /だ/.test(h2.dia.std), 'や is the Kansai copula (= だ)');
  const h3 = help('{分|わ}からへん 。', '分からへん');
  t.ok(h3 && h3.dia && /分からない/.test(h3.dia.std), '〜へん is explained through the standard negative: ' + (h3 && h3.dia.std));
  const h4 = help('しりとり せえへん ？', 'せえへん');
  t.ok(h4 && h4.dia && h4.dia.std === 'しない', 'せえへん = しない');
  const h5 = help('{行|い}かな あかん 。', 'あかん');
  t.ok(h5 && h5.dia, 'あかん is a Kansai word');
  const h6 = help('{行|い}かな あかん 。', '行かな');
  t.ok(h6 && h6.dia && /行かない/.test(h6.dia.std), '〜な あかん explains the 〜な as 〜ない');
  // context: the particle で mid-sentence stays the standard particle; at the end it is Kansai
  t.ok(help('{駅|えき} で {待|ま}つ で 。', 'で') === null, 'で mid-sentence is the standard particle');
  const toks = RB.jp.parse('{駅|えき} で {待|ま}つ で 。');
  t.ok(D.lookupIn(toks, toks.length - 2) && D.lookupIn(toks, toks.length - 2).dia, 'sentence-final で is the Kansai particle');
  t.ok(help('{旅|たび} の うち や で 。', 'うち') === null, '〜の うち ("part of") is not Kansai うち ("I")');
  t.ok(help('うち は {平気|へいき} や 。', 'うち').dia, 'うち at the start is Kansai "I"');
  t.ok(help('{名前|なまえ} 、 なし 。', 'なし') && D.note(help('{名前|なまえ} 、 なし 。', 'なし')) === '', 'a plain word read rightly (なし = none) has no Kansai note');
  // every Kansai lexicon entry is well formed and gives its standard equivalent
  t.eq(D.lexProblems(), [], 'the Kansai lexicon has no problems');
  for (const e of D.lexAll()) {
    t.ok(e.std && e.dia === 'kansai' && e.m, 'Kansai entry ' + e.w + ' has a meaning and a standard equivalent');
    // word help shows the standard equivalent with furigana on every kanji
    t.eq(RB.jp.validate(D.stdMarkup(e.std)).map((p) => p.msg), [], 'the standard equivalent of ' + e.w + ' has furigana: ' + D.stdMarkup(e.std));
  }
  t.eq(h3.dia.mk, '{分|わ}からない', 'a Kansai form keeps furigana on its standard form');
  t.ok(D.note(h1, (plain, mk) => mk).indexOf('{本当|ほんとう}') >= 0 && D.note(h1, (plain, mk) => mk).indexOf('{関西弁|かんさいべん}') >= 0, 'the note passes its Japanese with furigana to word help');

  // ---- Kansai forms stay out of the standard vocabulary --------------------------------------------------
  const kansaiOnly = ['ほんま', 'めっちゃ', 'あかん', 'せや', 'ちゃう', 'おもろい', 'かまへん', 'しゃあない', 'ほな', 'やねん'];
  for (const w of kansaiOnly) t.ok(!RB.lex.bySurface(w).length, w + ' is not in the standard lexicon');
  t.ok(!RB.lex.all().some((e) => e.dia), 'no standard lexicon entry is a dialect entry');
  const kw = RB.tasks.kanaWordIndex();
  t.ok(kw.length > 0 && !kw.some((e) => e.dia || kansaiOnly.indexOf(e.w) >= 0), 'the kana-practice word index has no Kansai forms');
  // a noted Kansai word is kept in the notebook but never becomes writing-desk practice
  const s2 = RB.state.newCampaign({});
  s2.notebook = [
    { kind: 'word', id: 'w:ほんま|ほんま', surface: 'ほんま', reading: 'ほんま', m: 'true; real', t: 1, dia: 'kansai' },
    { kind: 'word', id: 'w:気ぃ|きぃ', surface: '気ぃ', reading: 'きぃ', m: 'feeling', t: 2, dia: 'kansai' },
  ];
  t.eq(RB.practiceDesk.notebookCards(s2), [], 'noted Kansai words are not writing-desk cards');
  t.ok(!RB.kanjiInfo.met(s2).has('気'), 'a noted Kansai form does not count as a kanji met');

  // ---- nothing Kansai in the standard content ----------------------------------------------------------
  // the standard scene text is unchanged: the table only ever holds Kansai text beside its standard key
  const sceneJp = new Set();
  for (const id in RB.content.scenes) for (const c of RB.content.scenes[id].cmds || []) if (c.jp) sceneJp.add(norm(c.jp));
  let leaked = 0;
  for (const [k, e] of D.table('kansai')) if (!e.same && !e.sameJp && norm(e.jp) !== k && sceneJp.has(norm(e.jp)) && !/^co\.suzu_speech/.test(e.at || '')) leaked++;
  t.eq(leaked, 0, 'no Kansai line was written into a standard scene');
};
