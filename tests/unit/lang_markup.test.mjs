// RB.jp markup: parse, render, escaping, plain/reading, placeholders, validate.
import { load } from '../lib/load.mjs';

const RB = load(['core', 'lang']);
const J = RB.jp;

export default async (t) => {
  // ---- parse basics
  let tk = J.parse('{食|た}べる');
  t.eq(tk.length, 1, 'one token');
  t.eq(tk[0].surface, '食べる', 'surface');
  t.eq(tk[0].reading, 'たべる', 'reading');
  t.eq(tk[0].segs, [{ t: '食', r: 'た' }, { t: 'べる', r: null }], 'segs');
  t.eq(tk[0].lemma, null, 'no lemma');
  t.eq(tk[0].punct, false, 'word token');

  tk = J.parse('お{茶|ちゃ}を ください。');
  t.eq(tk.map((x) => x.surface), ['お茶を', 'ください', '。'], 'punctuation split off');
  t.ok(tk[2].punct, 'punct token flagged');

  tk = J.parse('「{今日|きょう}は」');
  t.eq(tk.map((x) => x.surface), ['「', '今日は', '」'], 'brackets split both sides');
  t.eq(tk[1].reading, 'きょうは', 'word-level ruby reading');

  // ---- @lemma and =(gloss), gloss with spaces
  tk = J.parse('{食|た}べた@食べる=(ate (just now)) {水|みず}=(water, cold)。');
  t.eq(tk.length, 3, 'tokenizer respects spaces inside =(…)');
  t.eq(tk[0].lemma, '食べる', 'lemma');
  t.eq(tk[0].gloss, 'ate (just now)', 'gloss with nested parentheses');
  t.eq(tk[1].gloss, 'water, cold', 'gloss on second token');
  t.ok(tk[2].punct && tk[2].surface === '。', 'punctuation after gloss split');
  tk = J.parse('はし@箸。');
  t.eq([tk[0].lemma, tk[1].surface], ['箸', '。'], 'punctuation after lemma split');

  // ---- underscore, Latin, placeholders
  t.eq(J.plain('A_B {町|まち}'), 'A B町', 'underscore renders as a space; tokens join without space');
  t.eq(J.plain('$nameさん、こんにちは。', { name: 'アキ' }), 'アキさん、こんにちは。', 'placeholder substitution');
  t.eq(J.parse('$nameさん')[0].ph, 'name', 'placeholder recorded');
  t.eq(J.plain('$comp', {}), '$comp', 'missing var left visible');

  // ---- plain / reading
  t.eq(J.plain('{私|わたし}は {学生|がくせい}です。'), '私は学生です。', 'plain');
  t.eq(J.reading('{私|わたし}は {学生|がくせい}です。'), 'わたしはがくせいです。', 'reading (for TTS)');

  // ---- render
  let r = J.render('{食|た}べる。');
  t.eq(r.html, '<span class="jt" data-i="0" tabindex="0"><ruby>食<rt>た</rt></ruby>べる</span>。', 'render ruby + span; punctuation unwrapped');
  r = J.render('{私|わたし}は {学生|がくせい}です。', { spacing: true });
  t.ok(/<\/span> <span/.test(r.html) && !/ 。/.test(r.html), 'spacing between words, never before punctuation');
  r = J.render('{私|わたし}は {学生|がくせい}です。');
  t.ok(!/<\/span> <span/.test(r.html), 'no spacing by default');
  r = J.render('$nameさん', { vars: { name: '<b>x</b>&' } });
  t.ok(r.html.includes('&lt;b&gt;x&lt;/b&gt;&amp;') && !r.html.includes('<b>'), 'var values are escaped');
  r = J.render('<i>あ</i>');
  t.ok(!r.html.includes('<i>'), 'markup text is escaped');
  r = J.render('{食|た}べる', { furigana: false });
  t.ok(!r.html.includes('<rt>'), 'furigana:false');
  r = J.render('あ。い');
  t.eq(r.tokens.length, 3, 'render returns tokens');
  t.ok(r.html.includes('data-i="2"'), 'data-i indexes the tokens array');
  t.eq(J.render('あ\nい').html.includes('<br>'), true, 'newline → <br>');

  // ---- mixed text (English with ruby)
  t.eq(J.renderMixed('Say {今日|きょう} <b>'), 'Say <ruby>今日<rt>きょう</rt></ruby> &lt;b&gt;', 'renderMixed escapes and rubies');
  t.eq(J.plainMixed('Say {今日|きょう}'), 'Say 今日', 'plainMixed');
  t.ok(J.validateMixed('Bare 漢字 here').length > 0, 'validateMixed catches bare kanji');
  t.eq(J.validateMixed('ok {漢字|かんじ}'), [], 'validateMixed ok');

  // ---- rubyize
  t.eq(J.rubyize('食べる', 'たべる'), '{食|た}べる', 'rubyize okurigana');
  t.eq(J.rubyize('お茶', 'おちゃ'), 'お{茶|ちゃ}', 'rubyize prefix');
  t.eq(J.rubyize('取り戻す', 'とりもどす'), '{取|と}り{戻|もど}す', 'rubyize two groups');
  t.eq(J.rubyize('今日', 'きょう'), '{今日|きょう}', 'rubyize word-level');
  t.eq(J.rubyize('ランプ', 'ランプ'), 'ランプ', 'rubyize kana unchanged');
  t.eq(J.validate(J.rubyize('間に合う', 'まにあう')), [], 'rubyize output validates');

  // ---- validate
  const codes = (line) => J.validate(line).map((p) => p.code);
  t.eq(codes('{食|た}べる'), [], 'valid line');
  t.ok(codes('食べる').includes('kanji_outside_ruby'), 'bare kanji caught');
  t.ok(codes('{食|た}べる 々').includes('kanji_outside_ruby'), 'bare 々 caught');
  t.ok(codes('{食|}べる').includes('empty_reading'), 'empty reading');
  t.ok(codes('{|た}べる').includes('empty_base'), 'empty base');
  t.ok(codes('{食|食}べる').includes('reading_has_kanji'), 'reading with kanji');
  t.ok(codes('{食|ta}べる').includes('reading_not_kana'), 'reading not kana');
  t.ok(codes('{食|た べる').includes('unbalanced_braces'), 'unclosed brace');
  t.ok(codes('食|た}べる').length > 0, 'stray bar / brace');
  t.ok(codes('{食た}べる').includes('missing_bar'), 'missing bar');
  t.ok(codes('あ=(open').includes('unclosed_gloss'), 'unclosed gloss');
  t.ok(codes('あ@').includes('empty_lemma'), 'empty lemma');
  t.ok(codes('$ あ').includes('bad_placeholder'), 'bad placeholder');
  t.ok(codes('あ=(漢字)').includes('kanji_in_gloss'), 'kanji in gloss');
  t.eq(codes('{食|た}べた@食べる=(ate)。'), [], 'lemma may contain kanji (not displayed)');
  t.eq(codes('$nameさん'), [], 'placeholder OK');
};
