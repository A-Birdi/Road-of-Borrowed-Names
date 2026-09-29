// Character sets for the recognizer. Shared by fetch/convert/fixture/eval tools.
export const HIRA_BASIC = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
export const HIRA_VOICED = 'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ';
export const HIRA_SMALL = 'ぁぃぅぇぉっゃゅょゎ';
export const KATA_BASIC = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
export const KATA_VOICED = 'ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴ';
export const KATA_SMALL = 'ァィゥェォッャュョヮ';
export const KATA_LONG = 'ー';
// The 33 kanji the recognizer first supported (kept as a fixed reference set
// for the older accuracy tests). The recognizer now covers every kanji the
// game displays: see gameKanji() in ./gamekanji.mjs and allChars() below.
export const KANJI = '一二三十人口日月山川木水火土石田力大小上下中名手目雨本入出王門心花';

export const HIRA = [...HIRA_BASIC, ...HIRA_VOICED, ...HIRA_SMALL];
export const KATA = [...KATA_BASIC, ...KATA_VOICED, ...KATA_SMALL, ...KATA_LONG];
export const KANA = [...HIRA, ...KATA];
export const ALL = [...KANA, ...KANJI];

// Every character that gets recognizer data: the kana plus every kanji the
// game displays (derived from the source by ./gamekanji.mjs) and the first 33.
export async function allChars() {
  const { gameKanji } = await import('./gamekanji.mjs');
  const { chars } = await gameKanji();
  const kanji = [...new Set([...chars, ...KANJI])].sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
  return { kana: KANA.slice(), kanji, all: [...KANA, ...kanji] };
}

// KanjiVG file name: 5 lowercase hex digits of the code point.
export const hex5 = (ch) => ch.codePointAt(0).toString(16).padStart(5, '0');

// Pinned upstream revisions so conversions are reproducible.
export const KANJIVG_COMMIT = '422b5538595676da918c288a4230cb5e22a1ee7e';
export const ANIMCJK_COMMIT = 'ec5e17cca76c87587790bcbce5ea0b4d4fb753d6';
export const TOMOE_URL = 'https://downloads.sourceforge.net/project/tomoe/tomoe/tomoe-0.6.0/tomoe-0.6.0.tar.gz';
