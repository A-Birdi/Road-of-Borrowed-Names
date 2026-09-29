// Readings of every kanji the game displays, taken from the game's own
// furigana. Writes src/lang/75_kanjiread.js (RB.kanjiRead).
//
//   node tools/kanjiread.mjs            regenerate
//   node tools/kanjiread.mjs --check    exit 1 if the file is out of date
//
// Sources (nothing outside the repository):
//  1. every ruby group {漢字|かんじ} in the source text the build puts into
//     index.html (comments removed, as in tools/kanjivg/gamekanji.mjs), and
//  2. every lexicon entry with kanji (RB.lex, with the words the content adds),
//     split at its okurigana by RB.jp.rubyize ('守る','まもる' -> {守|まも}る).
// A group of one kanji gives that kanji's reading directly. A group of
// several kanji ({留守|るす}) is split only when exactly one way of dividing
// its reading fits readings already known for each kanji (allowing the usual
// sound changes: rendaku が/ざ/だ/ば/ぱ, and っ for a final つ/ち/く/き); one
// kanji whose reading is still unknown may take the part the others leave.
// Three passes; each distinct word counts once. Readings are listed by how often the game uses them, at most
// four per kanji. A kanji whose reading cannot be derived this way is
// reported, and gets the reading of the whole word it appears in, marked
// with the word (see `w` below) — never an invented reading.
//
// Output: RB.kanjiRead.r = 'kanji' + readings joined by ',' per entry,
// entries joined by ';' (compact); RB.kanjiRead.w = {kanji: 'surface|reading'}
// only for kanji with no lexicon word (an example word from the text).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { load } from '../tests/lib/load.mjs';
import { stripComments, isKanjiChar } from './kanjivg/gamekanji.mjs';
import { allChars } from './kanjivg/chars.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const OUT = path.join(root, 'src', 'lang', '75_kanjiread.js');

const toHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const isKanaStr = (s) => /^[ぁ-ゟー]+$/.test(s);
// A piece of a word's reading, as the kanji's own reading: after the first
// kanji, ぱ-row sounds are the は-row reading after っ/ん (失敗 しっぱい: 敗 はい).
function base0(piece, i) {
  if (!i) return piece;
  const h = { ぱ: 'は', ぴ: 'ひ', ぷ: 'ふ', ぺ: 'へ', ぽ: 'ほ' }[piece[0]];
  return h ? h + piece.slice(1) : piece;
}
const VOICE = { か: 'が', き: 'ぎ', く: 'ぐ', け: 'げ', こ: 'ご', さ: 'ざ', し: 'じ', す: 'ず', せ: 'ぜ', そ: 'ぞ', た: 'だ', ち: 'ぢ', つ: 'づ', て: 'で', と: 'ど', は: 'ば', ひ: 'び', ふ: 'ぶ', へ: 'べ', ほ: 'ぼ' };
const HALF = { は: 'ぱ', ひ: 'ぴ', ふ: 'ぷ', へ: 'ぺ', ほ: 'ぽ' };
// surface forms a reading can take inside a word
function variants(r) {
  const out = new Set([r]);
  const f = r[0];
  if (VOICE[f]) out.add(VOICE[f] + r.slice(1));
  if (HALF[f]) out.add(HALF[f] + r.slice(1));
  if (r.length > 1 && 'つちくき'.includes(r[r.length - 1])) out.add(r.slice(0, -1) + 'っ');
  if (r === 'じ') out.add('ぢ');
  return [...out];
}

async function collect() {
  const { listSources } = await import(pathToFileURL(path.join(root, 'tools', 'build.mjs')).href);
  const groups = []; // [surface, reading]
  for (const f of listSources()) {
    if (/[\\/]src[\\/](recog[\\/]1\d_|lang[\\/]75_kanjiread)/.test(f)) continue;
    const text = stripComments(fs.readFileSync(f, 'utf8'), { dropRegex: true });
    for (const m of text.matchAll(/\{([^{}|\s]+)\|([^{}|\s]+)\}/g)) {
      const base = m[1], rd = toHira(m[2]);
      if (![...base].some(isKanjiChar) || !isKanaStr(rd)) continue;
      groups.push([base, rd, 'text']);
    }
  }
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  for (const e of RB.lex.all()) {
    if (!e.w || !e.r || ![...e.w].some(isKanjiChar)) continue;
    const mk = RB.jp.rubyize(e.w, e.r);
    for (const m of mk.matchAll(/\{([^{}|]+)\|([^{}|]+)\}/g)) {
      const rd = toHira(m[2]);
      if (isKanaStr(rd) && [...m[1]].every(isKanjiChar)) groups.push([m[1], rd, 'lex']);
    }
  }
  return { groups, RB };
}

// Words whose reading belongs to the whole word (jukujikun and the special
// readings of the Joyo list's appendix, as far as they occur here): never
// split between their kanji.
export const WHOLE_WORD = new Set(('今日 明日 昨日 今朝 今年 一日 二日 二十日 一人 二人 大人 部屋 風邪 下手 上手 眼鏡 土産 田舎 時計 景色 ' +
  '素人 玄人 紅葉 海苔 七夕 息子 相撲 竹刀 梅雨 迷子 果物 八百屋 真面目 為替 老舗 足袋 太刀 山車 雪崩 吹雪 五月雨 小豆 河原 川原 ' +
  '心地 砂利 清水 白髪 草履 草鞋 凸凹 波止場 博士 若人 日和 行方 木綿 乳母 浴衣 野良 蚊帳 烏賊 伯父 叔父 伯母 叔母 お母さん ' +
  '母さん 父さん 兄さん 姉さん 母屋 母家 眼差し 大和 一昨日 一昨年 明後日 師走 神楽 神主 岩魚 早乙女 雑魚 桟敷 差し支える ' +
  '三味線 数寄屋 数奇屋 相撲 築山 梅雨 名残 雪洞 木霊 寄席 陽炎 東風 案山子 欠伸 胡坐 胡座 煙管 蝋燭 団扇 行灯 灯籠 提灯 ' +
  '稲荷 暖簾 蜻蛉 百足 蝸牛 海老 河豚 秋刀魚 土竜 紫陽花 向日葵 蒲公英 無花果 石榴 胡瓜 西瓜 南瓜 玩具 可笑しい 美味しい ' +
  '大晦日 今宵 昨夜 今際 流石 所謂 一寸 素敵 天晴れ 仕舞う 出汁 風呂 灰汁 生姜 尻尾 硝子 友達 味噌').split(' '));

// Readings checked by hand, for the few kanji whose reading the game's text
// cannot give on its own (they occur only inside whole-word readings such as
// 伯父 おじ, or in compounds the rules above do not split) and one correction
// (先祖 せんぞ gives 祖 a voiced form). Common readings of the kanji as the
// game's words use them.
// Words for the few kanji the game shows only outside furigana: accepted
// kanji spellings of answers (為に for ために, 筈 for はず), a lexicon note
// (草鞋 for わらじ), and 王, one of the first 33 kanji the pad could read.
export const CURATED_WORDS = { 為: '為に|ために', 筈: '筈|はず', 鞋: '草鞋|わらじ', 王: '王|おう' };

export const CURATED = {
  伯: 'はく', 刀: 'かたな,とう', 博: 'はく', 即: 'そく', 友: 'とも,ゆう', 呂: 'ろ', 喫: 'きつ', 営: 'えい', 噌: 'そ', 官: 'かん',
  宵: 'よい', 屓: 'き', 贔: 'ひい', 徳: 'とく', 懸: 'けん,か', 括: 'かつ', 昨: 'さく', 景: 'けい', 為: 'ため', 率: 'そつ,りつ',
  王: 'おう', 硝: 'しょう', 筈: 'はず', 綿: 'わた,めん', 襟: 'えり', 設: 'せつ', 賊: 'ぞく', 隻: 'せき', 鞋: 'あい', 祖: 'そ',
  姜: 'きょう', 尾: 'お,び', 味: 'み,あじ',
};

function derive(groups, kanji) {
  const count = {}; // kanji -> {reading: number of distinct words using it}
  const add = (k, r, n = 1) => { (count[k] = count[k] || {})[r] = (count[k][r] || 0) + n; };
  const multi = [];
  const seenGroup = new Set();
  for (const [base, rd] of groups) {
    // each distinct word counts once, however often the story repeats it
    if (seenGroup.has(base + '|' + rd)) continue;
    seenGroup.add(base + '|' + rd);
    const ks = [...base];
    if (!ks.every(isKanjiChar)) continue; // mixed groups are rare; skipped
    if (ks.length === 1) add(ks[0], rd);
    else if (!WHOLE_WORD.has(base)) multi.push([ks, rd]);
  }
  // 々 repeats the kanji before it: its reading is that kanji's (with sound change)
  const passes = (n, w0) => { for (let pass = 0; pass < n; pass++) splitPass(pass, w0); };
  const heur = {};
  function splitPass(pass, w0) {
    const found = [];
    for (const [ks, rd] of multi) {
      const known = ks.map((k, i) => {
        const src = k === '々' && i ? ks[i - 1] : k;
        return count[src] ? Object.keys(count[src]) : [];
      });
      // at most one kanji of the word may have no known reading yet: it takes
      // the part of the word's reading the others leave (1 to 4 kana)
      const unknownN = known.filter((k) => !k.length).length;
      if (unknownN > 1) continue;
      const sols = [];
      const walk = (i, pos, acc) => {
        if (sols.length > 1) return;
        if (i === ks.length) { if (pos === rd.length) sols.push(acc.slice()); return; }
        if (!known[i].length) {
          for (let n = 1; n <= 4 && pos + n <= rd.length; n++) {
            const piece = rd.slice(pos, pos + n);
            if (/^[ゃゅょっんー]/.test(piece)) continue; // a reading never starts with these
            acc.push(base0(piece, i)); walk(i + 1, pos + n, acc); acc.pop();
          }
          return;
        }
        const seen = new Set();
        for (const r of known[i]) for (const v of variants(r)) {
          if (seen.has(v) || !rd.startsWith(v, pos)) continue;
          seen.add(v);
          acc.push(r); walk(i + 1, pos + v.length, acc); acc.pop();
        }
      };
      walk(0, 0, []);
      if (sols.length === 1) found.push([ks, sols[0]]);
    }
    // a piece ending in っ stands for つ/く/ち/き: which one is not known, so it is not recorded
    for (const [ks, sol] of found) ks.forEach((k, i) => { if (k !== '々' && !/っ$/.test(sol[i]) && !(count[k] && count[k][sol[i]] && pass)) add(k, sol[i], (pass ? 0.5 : 1) * w0); });
  }
  passes(3, 1);
  // Last resort, for kanji still without a reading (they occur only in
  // compounds whose other kanji are read differently elsewhere): split the
  // word the way Sino-Japanese (on) readings are shaped — every kanji one
  // mora, or one mora and then い/う/ん/き/く/ち/つ (or っ for a doubled
  // consonant) — when exactly one such split exists (勉強 べん+きょう,
  // 学校 がっ+こう; 小刀 こがたな has none and is left alone). Only kanji
  // without a reading take it; weighted low; reported.
  const morae = (r) => r.match(/.[ゃゅょぁぃぅぇぉゎ]?/g) || [];
  const onSplit = (ks, rd) => {
    const m = morae(rd);
    const sols = [];
    const walk = (i, j, acc) => {
      if (sols.length > 1) return;
      if (i === ks.length) { if (j === m.length) sols.push(acc.slice()); return; }
      if (j >= m.length || /^[っんーぁぃぅぇぉゃゅょ]/.test(m[j])) return;
      acc.push(m[j]); walk(i + 1, j + 1, acc); acc.pop();
      if (j + 1 < m.length && /^[いうんきくちつっ]$/.test(m[j + 1])) { acc.push(m[j] + m[j + 1]); walk(i + 1, j + 2, acc); acc.pop(); }
    };
    walk(0, 0, []);
    return sols.length === 1 ? sols[0] : null;
  };
  for (const [ks, rd] of multi) {
    if (ks.length > 3 || ks.includes('々') || !ks.some((k) => !count[k])) continue;
    const parts = onSplit(ks, rd);
    if (!parts) continue;
    ks.forEach((k, i) => {
      const p = base0(parts[i], i);
      if (!count[k] && !/っ$/.test(p)) { heur[k] = (heur[k] || []).concat([ks.join('') + ' ' + rd]); add(k, p, 0.25); }
    });
  }
  passes(2, 0.5);
  const out = {};
  const none = [];
  for (const k of kanji) {
    const c = count[k];
    if (!c && !CURATED[k]) { none.push(k); continue; }
    const list = c ? Object.entries(c).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([r]) => r) : [];
    // curated readings lead (and replace a derived voiced form they correct)
    const cur = CURATED[k] ? CURATED[k].split(',') : [];
    const vo = new Set(cur.flatMap((r) => variants(r)));
    out[k] = cur.concat(list.filter((r) => !cur.includes(r) && !(cur.length && vo.has(r)))).slice(0, 4);
  }
  return { out, none, multi, heur };
}

async function generate() {
  const { kanji } = await allChars(); // every kanji the recognizer reads
  const { groups, RB } = await collect();
  const { out, none, multi, heur } = derive(groups, kanji);
  // kanji with no lexicon word: an example word from the text (and, if its
  // reading could not be split, the whole word stands in for it)
  const lexWords = {};
  for (const e of RB.lex.all()) for (const c of [...(e.w || '')]) if (isKanjiChar(c)) lexWords[c] = 1;
  const w = {};
  for (const k of kanji) {
    if (lexWords[k]) continue;
    const g = groups.find(([b]) => b.includes(k));
    if (g) w[k] = g[0] + '|' + g[1];
    else if (CURATED_WORDS[k]) w[k] = CURATED_WORDS[k];
  }
  const stillNone = none.filter((k) => !w[k]);
  const lines = [];
  lines.push('/* GENERATED by tools/kanjiread.mjs — do not edit by hand.');
  lines.push(' *');
  lines.push(' * Readings of every kanji the game displays, taken from the game\'s own');
  lines.push(' * furigana ({漢字|かんじ} groups in the text) and lexicon (see the tool for how');
  lines.push(' * a word\'s reading is split between its kanji). Most used first, at most four.');
  lines.push(' * r: entries joined by ";", each the kanji then its readings joined by ",".');
  lines.push(' * w: an example word from the text for kanji with no lexicon word. */');
  lines.push('var RB = (globalThis.RB = globalThis.RB || {});');
  lines.push('');
  lines.push('RB.kanjiRead = {');
  const entries = kanji.filter((k) => out[k]).map((k) => k + out[k].join(','));
  // wrap the long string over lines of ~40 entries for readable diffs
  lines.push('  r: ' + chunk(entries, 40).map((c) => "'" + c.join(';') + ";'").join(' +\n    ') + ',');
  lines.push('  w: {');
  for (const k of Object.keys(w)) lines.push(`    '${k}': '${w[k]}',`);
  lines.push('  },');
  lines.push('};');
  lines.push('');
  return { js: lines.join('\n'), kanji, out, none, w, stillNone, multi, groups, heur };
}
function chunk(a, n) { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; }

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const g = await generate();
  const rel = path.relative(root, OUT);
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (cur !== g.js) { console.log(`${rel} is out of date: run node tools/kanjiread.mjs`); process.exit(1); }
    console.log(`${rel} is up to date`);
  } else {
    fs.writeFileSync(OUT, g.js);
    const withR = g.kanji.filter((k) => g.out[k]).length;
    console.log(`wrote ${rel}: ${(Buffer.byteLength(g.js) / 1024).toFixed(1)} KiB; ${withR}/${g.kanji.length} kanji with readings from ${g.groups.length} ruby groups and lexicon words`);
    console.log(`  example words from the text for kanji with no lexicon word (${Object.keys(g.w).length}): ${Object.entries(g.w).map(([k, v]) => k + ' ' + v).join('  ')}`);
    if (g.stillNone.length) console.log(`  NO READING (${g.stillNone.length}): ${g.stillNone.join('')}`);
    if (g.none.length) console.log(`  no reading of their own (${g.none.length}): ${g.none.join('')}`);
    const hk = Object.keys(g.heur);
    console.log(`  split by morae (${hk.length}): ${hk.map((k) => k + '=' + (g.out[k] || []).join(',') + ' [' + g.heur[k][0] + ']').join('  ')}`);
  }
}
export { generate, derive, variants };
