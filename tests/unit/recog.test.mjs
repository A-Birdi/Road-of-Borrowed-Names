// RB.recog: API, data integrity and behaviour (small kana, diacritics,
// identical shapes, direction, no rotation/reflection invariance, nonsense,
// variants, stroke-order feedback, answer independence).
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';
import { distort, nonsense } from '../../tools/kanjivg/synth.mjs';

const RB = load(['core', 'recog']);
const R = RB.recog;

const HIRA46 = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
const KATA46 = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const VOICED = 'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴ';
const SMALL = 'ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ';
const KANJI = '一二三十人口日月山川木水火土石田力大小上下中名手目雨本入出王門心花';

const BOX = { w: 327, h: 327 };
// Reference drawn at KanjiVG proportions in a 327px pad (3x the 109 box).
const draw = (ch, f = (x, y) => [x * 3, y * 3]) =>
  R.reference(ch).strokes.map((s, si) => s.map((p, k) => { const [x, y] = f(p.x, p.y); return { x, y, t: si * 300 + k * 10 }; }));
const top = (r) => (r.candidates[0] ? r.candidates[0].ch : null);
const chars = (r) => r.candidates.map((c) => c.ch);

export default async (t) => {
  // ---------------------------------------------------------------- API and data
  const sup = R.supported({ kanji: false });
  t.eq(sup.length, 164, 'supported kana count (46+46 basic, 25+26 voiced, 10+10 small, ー)');
  for (const ch of HIRA46 + KATA46 + VOICED + SMALL + 'ー') t.ok(sup.includes(ch), `supported includes ${ch}`);
  t.ok(!sup.some((c) => KANJI.includes(c)), 'no kanji unless enabled');
  const supK = R.supported({ kanji: true });
  t.eq(supK.length, 164 + 33, 'kanji set adds 33 characters (all present in KanjiVG)');
  for (const ch of KANJI) t.ok(supK.includes(ch), `kanji supported when enabled: ${ch}`);
  t.eq(JSON.stringify(R.supported()), JSON.stringify(sup), 'supported() defaults to no kanji');

  const expectCounts = { 'あ': 3, 'き': 4, 'さ': 3, 'そ': 1, 'り': 2, 'ぬ': 2, 'が': 5, 'ぱ': 4, 'ぽ': 5, 'ヴ': 5, 'ー': 1, 'ボ': 6, '門': 8, 'っ': 1 };
  for (const [ch, n] of Object.entries(expectCounts)) t.eq(R.reference(ch).strokes.length, n, `KanjiVG stroke count ${ch}`);
  let intsOk = true;
  for (const ch of supK) {
    const ref = R.reference(ch);
    if (!ref || ref.box !== 109 || !ref.strokes.length) { intsOk = false; t.ok(false, `reference ${ch}`); continue; }
    for (const s of ref.strokes) for (const p of s) if (!Number.isInteger(p.x) || !Number.isInteger(p.y) || p.x < 0 || p.y < 0 || p.x > 108 || p.y > 108 || s.length < 2) intsOk = false;
  }
  t.ok(intsOk, 'all references: integer points in the 109 box, >=2 points per stroke');
  t.eq(R.reference('Z'), null, 'reference(unknown) is null');
  t.eq(R.reference('ゐ'), null, 'unsupported kana has no reference');
  // reference data is real KanjiVG geometry: あ stroke 1 starts near (31,33) per kanji/03042.svg
  const a1 = R.reference('あ').strokes[0][0];
  t.ok(Math.abs(a1.x - 31) <= 1 && Math.abs(a1.y - 33) <= 1, 'あ stroke 1 starts where KanjiVG says');
  const dataFile = path.join(root, 'src', 'recog', '10_strokedata.js');
  const kb = fs.statSync(dataFile).size / 1024;
  t.ok(kb < 200, `stroke data compact (${kb.toFixed(1)} KiB < 200)`);
  t.ok(/KanjiVG/.test(fs.readFileSync(dataFile, 'utf8').slice(0, 800)) && /CC BY-SA 3\.0/.test(fs.readFileSync(dataFile, 'utf8').slice(0, 800)), 'attribution header in stroke data');
  const notice = fs.readFileSync(path.join(root, 'data', 'NOTICE.txt'), 'utf8');
  t.ok(/KanjiVG/.test(notice) && /Ulrich Apel/.test(notice) && /CC BY-SA 3\.0/.test(notice) && !notice.includes('-->'), 'NOTICE.txt carries KanjiVG attribution and no -->');

  // ---------------------------------------------------------------- empty input
  for (const [label, inp] of [['[]', []], ['[[]]', [[]]], ['null', null], ['undefined', undefined], ['NaN points', [[{ x: NaN, y: 1 }, { x: 2, y: NaN }]]]]) {
    const r = R.recognize(inp, { box: BOX });
    t.eq(r.status, 'empty', `empty input ${label}`);
    t.eq(r.candidates.length, 0, `empty input ${label} has no candidates`);
  }

  // ---------------------------------------------------------------- result shape
  const rA = R.recognize(draw('あ'), { box: BOX, script: 'any' });
  t.eq(top(rA), 'あ', 'あ recognized');
  t.eq(rA.status, 'confident', 'clean あ is confident');
  t.ok(rA.candidates.length >= 2 && rA.candidates.length <= 6, 'up to 6 candidates');
  t.ok(rA.candidates.every((c, i, a) => c.score >= 0 && c.score <= 1 && typeof c.dist === 'number' && (!i || (a[i - 1].score >= c.score && a[i - 1].dist <= c.dist))), 'scores in 0..1, best first');
  t.ok(Array.isArray(rA.notes), 'notes array');

  // every reference recognised as itself in its own pad mode (exact size decided by box geometry)
  const selfBad = [];
  for (const ch of sup) {
    const sc = R._internal.scriptOf(ch);
    const r = R.recognize(draw(ch), { box: BOX, script: sc === 'both' ? 'kata' : sc });
    if (top(r) !== ch || r.status !== 'confident') selfBad.push(`${ch}->${top(r)}/${r.status}`);
  }
  t.eq(selfBad, [], 'every KanjiVG kana reference is recognised confidently as itself (sanity, not accuracy)');
  const kBad = [...KANJI].filter((ch) => top(R.recognize(draw(ch), { box: BOX, script: 'kanji' })) !== ch);
  t.eq(kBad, [], 'every kanji reference recognised with script:kanji');

  // ---------------------------------------------------------------- script filter
  const onlyScript = (r, re) => r.candidates.every((c) => re.test(c.ch));
  t.ok(onlyScript(R.recognize(draw('か'), { box: BOX, script: 'hira' }), /^[ぁ-ゟー]$/), "script:'hira' returns only hiragana");
  t.ok(onlyScript(R.recognize(draw('か'), { box: BOX, script: 'kata' }), /^[゠-ヿ]$/), "script:'kata' returns only katakana");
  t.ok(onlyScript(R.recognize(draw('力'), { box: BOX, script: 'kanji' }), /^[一-鿿]$/), "script:'kanji' returns only kanji");
  t.ok(onlyScript(R.recognize(draw('力'), { box: BOX, script: 'any' }), /^[ぁ-ヿ]$/), "script:'any' never returns kanji");
  t.eq(top(R.recognize(draw('力'), { box: BOX, script: 'kata' })), 'カ', '力 drawn in the katakana pad reads as カ');

  // ---------------------------------------------------------------- identical shapes
  for (const [h, k] of [['へ', 'ヘ'], ['べ', 'ベ'], ['ぺ', 'ペ']]) {
    const r = R.recognize(draw(h), { box: BOX, script: 'any' });
    t.ok(chars(r).slice(0, 2).includes(h) && chars(r).slice(0, 2).includes(k), `${h}/${k}: both returned in 'any'`);
    t.ok(r.notes.includes(`identical-shape: ${h}/${k}`), `${h}/${k}: identical-shape note`);
    const rh = R.recognize(draw(h), { box: BOX, script: 'hira' });
    t.ok(top(rh) === h && !chars(rh).includes(k), `${h}: hira pad returns only the hiragana form`);
    const rk = R.recognize(draw(h), { box: BOX, script: 'kata' });
    t.ok(top(rk) === k && !chars(rk).includes(h), `${k}: kata pad returns only the katakana form`);
  }
  const rOne = R.recognize(draw('ー'), { box: BOX, script: 'any', kanji: true });
  t.ok(chars(rOne).slice(0, 2).includes('一') && rOne.notes.includes('identical-shape: ー/一'), 'ー/一 identical-shape when kanji enabled');

  // ---------------------------------------------------------------- small kana (size + toggle)
  // つ at full size, centred
  const big = R.recognize(draw('つ', (x, y) => [40 + (x - 54) * 3.4 + 124, (y - 54) * 3.4 + 164]), { box: BOX, script: 'hira' });
  t.eq(top(big), 'つ', 'つ drawn large -> つ first');
  t.eq(big.sizeHint, 'normal', 'large drawing -> sizeHint normal');
  t.eq(chars(big)[1], 'っ', 'small form offered as second candidate');
  t.ok(big.notes.some((n) => n.startsWith('size-variant: つ/っ')), 'size-variant note');
  // the same shape drawn small in the lower-left of the box
  const small = R.recognize(draw('つ', (x, y) => [60 + x * 1.5, 150 + y * 1.5]), { box: BOX, script: 'hira' });
  t.eq(small.sizeHint, 'small', 'small low drawing -> sizeHint small');
  t.eq(top(small), 'っ', 'つ shape drawn small -> っ first');
  t.eq(chars(small)[1], 'つ', '...with つ as the alternative');
  const toggled = R.recognize(draw('つ', (x, y) => [40 + (x - 54) * 3.4 + 124, (y - 54) * 3.4 + 164]), { box: BOX, script: 'hira', smallToggle: true });
  t.eq(top(toggled), 'っ', 'explicit small toggle puts っ first even when drawn large');
  const nobox = R.recognize(draw('つ'), { script: 'hira' });
  t.eq(nobox.sizeHint, null, 'no box -> sizeHint null');
  t.eq(top(nobox), 'つ', 'no box, no toggle -> large form first');
  for (const [L, S] of [['や', 'ゃ'], ['ヨ', 'ョ'], ['ツ', 'ッ'], ['あ', 'ぁ']]) {
    const sc = R._internal.scriptOf(L);
    const rs = R.recognize(draw(S), { box: BOX, script: sc });
    const rl = R.recognize(draw(L), { box: BOX, script: sc });
    t.ok(top(rs) === S && chars(rs).includes(L), `KanjiVG small ${S} (native size/position) -> ${S} first, ${L} offered`);
    t.ok(top(rl) === L && chars(rl).includes(S), `KanjiVG large ${L} -> ${L} first, ${S} offered`);
  }
  t.ok(!chars(R.recognize(draw('つ'), { box: BOX, script: 'kata' })).includes('っ'), 'kata pad never returns hiragana small forms');

  // ---------------------------------------------------------------- diacritics are not discarded
  const diacPairs = [['か', 'が'], ['は', 'ば'], ['は', 'ぱ'], ['ば', 'ぱ'], ['ふ', 'ぷ'], ['ふ', 'ぶ'], ['ぶ', 'ぷ'], ['ほ', 'ぼ'], ['ほ', 'ぽ'], ['カ', 'ガ'], ['ウ', 'ヴ'], ['ハ', 'バ'], ['ハ', 'パ'], ['バ', 'パ'], ['ヒ', 'ビ'], ['ヒ', 'ピ'], ['そ', 'ぞ'], ['つ', 'づ'], ['シ', 'ジ'], ['ツ', 'ヅ']];
  let diacBad = [];
  for (const pair of diacPairs) for (const ch of pair) {
    const sc = R._internal.scriptOf(ch);
    for (let i = 0; i < 6; i++) {
      const s = distort(R.reference(ch), 'heldout-noise', `diac|${ch}|${i}`, { ch });
      const r = R.recognize(s.strokes, { box: s.box, script: sc });
      if (top(r) !== ch && R._internal.SMALL_OF[ch] !== top(r)) diacBad.push(`${ch}->${top(r)}`);
    }
  }
  t.ok(diacBad.length <= 2, `diacritic pairs held-out (${diacPairs.length * 2 * 6} samples) errors: ${diacBad.join(' ') || 'none'}`);
  // が without its dakuten strokes reads as か; か with the dakuten added reads as が
  const ga = draw('が');
  t.eq(top(R.recognize(ga.slice(0, 3), { box: BOX, script: 'hira' })), 'か', 'が minus dakuten -> か');
  t.eq(top(R.recognize(draw('ぱ').slice(0, 3), { box: BOX, script: 'hira' })), 'は', 'ぱ minus handakuten -> は');
  // handakuten circle drawn from another start point / the other way round is still ゜
  const pa = draw('ぱ');
  const circle = pa[3];
  const rot = circle.slice(5, -1).concat(circle.slice(0, 6)).reverse();
  t.eq(top(R.recognize(pa.slice(0, 3).concat([rot]), { box: BOX, script: 'hira' })), 'ぱ', 'handakuten start point/direction is free');
  // dakuten written as one stroke
  const gaJoined = ga.slice(0, 3).concat([ga[3].concat(ga[4])]);
  t.eq(top(R.recognize(gaJoined, { box: BOX, script: 'hira' })), 'が', 'dakuten written in one movement still reads が');

  // ---------------------------------------------------------------- direction matters (ソ/ン, シ/ツ)
  const revLongest = (strokes) => {
    const i = strokes.map((s, k) => [s.length, k]).sort((a, b) => b[0] - a[0])[0][1];
    return strokes.map((s, k) => (k === i ? s.slice().reverse().map((p, j) => ({ ...p, t: s[j].t })) : s));
  };
  for (const ch of ['ソ', 'ン', 'シ', 'ツ']) {
    const ok = R.recognize(draw(ch), { box: BOX, script: 'kata' });
    t.ok(top(ok) === ch && ok.status === 'confident', `${ch} drawn with standard directions -> ${ch}`);
    const bad = R.recognize(revLongest(draw(ch)), { box: BOX, script: 'kata' });
    // KanjiVG's own ソ/ン and シ/ツ also differ clearly in placement, so a reversed
    // copy may still read as itself, but the reversal must cost something.
    t.ok(bad.candidates.find((c) => c.ch === ch).dist >= 0.03 && bad.notes.some((n) => n.startsWith('reversed-strokes')), `${ch} with its long stroke reversed is penalised and noted`);
  }
  // Where placement is ambiguous, direction decides: the same ソ/ン-like geometry
  // (a dot at the top left and a long stroke at an in-between angle) reads ソ when
  // the long stroke is drawn downward and ン when it is drawn upward.
  const seg = (a, b, n, bend) => Array.from({ length: n }, (_, k) => {
    const u = k / (n - 1), nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny), o = bend * Math.sin(Math.PI * u);
    return { x: (a[0] + (b[0] - a[0]) * u + (nx / l) * o) * 3, y: (a[1] + (b[1] - a[1]) * u + (ny / l) * o) * 3, t: k * 10 };
  });
  const dot = seg([28, 28], [38, 40], 5, 0);
  for (const [A, Z] of [[[82, 22], [30, 88]], [[80, 26], [28, 86]], [[78, 30], [26, 84]]]) {
    t.eq(top(R.recognize([dot, seg(A, Z, 14, 4)], { box: BOX, script: 'kata' })), 'ソ', `in-between stroke drawn downward -> ソ (${A})`);
    t.eq(top(R.recognize([dot, seg(Z, A, 14, -4)], { box: BOX, script: 'kata' })), 'ン', `same stroke drawn upward -> ン (${A})`);
  }
  // lenient: a reversed stroke where direction does not distinguish anything is accepted, with a note
  const noRev = R.recognize(revLongest(draw('の')), { box: BOX, script: 'hira' });
  t.ok(top(noRev) === 'の' && noRev.notes.some((n) => n.startsWith('reversed-strokes')), 'lenient: reversed の still の, noted');
  const strict = R.recognize(revLongest(draw('の')), { box: BOX, script: 'hira', mode: 'strict' });
  t.ok(strict.candidates[0].dist > noRev.candidates[0].dist, 'strict mode penalises reversal more');

  // ---------------------------------------------------------------- no rotation / reflection invariance
  const mirror = (x, y) => [(108 - x) * 3, y * 3];
  const rot90 = (x, y) => [(108 - y) * 3, x * 3];
  const rot180 = (x, y) => [(108 - x) * 3, (108 - y) * 3];
  const transformed = [['し', mirror], ['く', mirror], ['つ', mirror], ['レ', mirror], ['ノ', mirror], ['の', mirror], ['い', rot90], ['こ', rot90], ['く', rot180], ['へ', rot180], ['ー', rot90], ['ン', rot180], ['シ', rot90], ['ハ', rot90]];
  const invBad = [];
  for (const [ch, f] of transformed) {
    const r = R.recognize(draw(ch, f), { box: BOX, script: 'any' });
    if (top(r) === ch && r.status === 'confident') invBad.push(ch);
  }
  t.eq(invBad, [], 'mirrored/rotated characters are not confidently read as the original');
  const r90 = R.recognize(draw('い', rot90), { box: BOX, script: 'hira' });
  t.ok(top(r90) !== 'い', `い rotated 90° is not read as い (got ${top(r90)}/${r90.status})`);

  // ---------------------------------------------------------------- legitimate variants
  const joinAt = (strokes, j) => strokes.slice(0, j).concat([strokes[j].concat(strokes[j + 1])], strokes.slice(j + 2));
  const variantCases = [['き', 2], ['さ', 1], ['り', 0], ['ふ', 0], ['こ', 0], ['い', 0], ['た', 2], ['に', 1]];
  for (const [ch, j] of variantCases) {
    const r = R.recognize(joinAt(draw(ch), j), { box: BOX, script: 'hira' });
    t.eq(top(r), ch, `${ch} with strokes ${j + 1}+${j + 2} joined (${R.reference(ch).strokes.length - 1} strokes)`);
  }
  // そ written in two strokes (separate top stroke): split at the first corner
  const so = draw('そ')[0];
  let ci = 1;
  for (let i = 2; i < so.length - 1; i++) {
    const ax = so[i].x - so[i - 1].x, ay = so[i].y - so[i - 1].y, bx = so[i + 1].x - so[i].x, by = so[i + 1].y - so[i].y;
    if ((ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by) || 1) < 0.5) { ci = i; break; }
  }
  const so2 = [so.slice(0, ci + 1), so.slice(ci)];
  t.eq(so2.length, 2, 'そ split into two strokes');
  t.eq(top(R.recognize(so2, { box: BOX, script: 'hira' })), 'そ', 'そ in 2 strokes');
  // stroke order permuted: still recognised (lenient)
  const perm = draw('た'); [perm[0], perm[3]] = [perm[3], perm[0]];
  t.eq(top(R.recognize(perm, { box: BOX, script: 'hira' })), 'た', 'lenient: permuted stroke order accepted');

  // ---------------------------------------------------------------- nonsense
  for (const kind of ['dot', 'blob', 'zigzag']) {
    let rej = 0;
    for (let i = 0; i < 20; i++) if (R.recognize(nonsense(kind, i), { box: { w: 300, h: 300 } }).status === 'nonsense') rej++;
    t.eq(rej, 20, `${kind}: all rejected as nonsense`);
  }
  const tap = [[{ x: 150, y: 150, t: 0 }]];
  t.eq(R.recognize(tap, { box: { w: 300, h: 300 } }).status, 'nonsense', 'single tap -> nonsense');
  t.eq(R.recognize(tap, {}).status, 'nonsense', 'single tap without a box -> nonsense');
  const many = Array.from({ length: 14 }, (_, i) => [{ x: 10 + i * 20, y: 20, t: i }, { x: 12 + i * 20, y: 280, t: i + 1 }]);
  t.eq(R.recognize(many, { box: { w: 300, h: 300 } }).status, 'nonsense', '14 strokes -> nonsense');
  const rNon = R.recognize(nonsense('blob', 1), { box: { w: 300, h: 300 } });
  t.ok(rNon.candidates.length === 0 && rNon.notes.some((n) => n.startsWith('nonsense:')), 'nonsense has no candidates and a reason note');

  // ---------------------------------------------------------------- uncertainty
  // a stroke halfway between こ and い shapes, or ambiguous ニ/こ, must not be forced to confident when close
  const half = R.recognize(draw('こ', (x, y) => [x * 3, y * 3]).map((s) => s.map((p) => ({ ...p }))), { box: BOX, script: 'any' });
  t.eq(half.status, 'confident', 'clean こ is confident');
  let sawUncertain = false;
  for (let i = 0; i < 40 && !sawUncertain; i++) {
    const s = distort(R.reference('ニ'), 'heldout-mixed', `unc|${i}`, { ch: 'ニ' });
    const r = R.recognize(s.strokes, { box: s.box, script: 'any' });
    if (r.status === 'uncertain' && r.notes.some((n) => n.startsWith('close-alternative') || n === 'weak-match')) sawUncertain = true;
  }
  t.ok(sawUncertain, 'uncertain status with a reason is produced for hard samples');

  // ---------------------------------------------------------------- recognition never sees the answer
  const strokesX = draw('ね');
  const base = JSON.stringify(R.recognize(strokesX, { box: BOX, script: 'hira' }));
  const withAns = JSON.stringify(R.recognize(strokesX, { box: BOX, script: 'hira', expected: 'れ', answer: 'れ', target: 'れ' }));
  t.eq(withAns, base, 'extra answer-like options have no effect on recognition');
  t.ok(!/expected|answer|target/.test(R.recognize.toString()), 'recognize() source does not reference an expected answer');
  t.eq(top(R.recognize(draw('ね'), { box: BOX, script: 'hira' })), 'ね', 'a clearly drawn wrong kana is read as what was drawn');

  // ---------------------------------------------------------------- stroke-order feedback (practice mode)
  const F = R.strokeOrderFeedback;
  const ok = F(draw('た'), 'た');
  t.ok(ok.confident && ok.strokeCountOk && ok.issues.length === 0, 'correct た: confident, no issues');
  const sw = draw('た'); [sw[0], sw[1]] = [sw[1], sw[0]];
  const fsw = F(sw, 'た');
  t.ok(fsw.confident && fsw.issues.filter((i) => i.kind === 'order').map((i) => i.stroke).join() === '0,1', 'swapped strokes 1/2 -> order issues on strokes 1 and 2');
  const rv = draw('ケ'); rv[2] = rv[2].slice().reverse();
  const frv = F(rv, 'ケ');
  t.ok(frv.confident && frv.issues.length === 1 && frv.issues[0].kind === 'direction' && frv.issues[0].stroke === 2 && /reverse/.test(frv.issues[0].en), 'reversed stroke 3 -> direction issue');
  const jn = F(joinAt(draw('き'), 1), 'き');
  t.ok(!jn.strokeCountOk && jn.confident && jn.issues.length === 1 && jn.issues[0].kind === 'count', 'joined strokes -> count issue');
  const splitIn = draw('し');
  const sp = F([splitIn[0].slice(0, 6), splitIn[0].slice(5)], 'し');
  t.ok(!sp.strokeCountOk && sp.issues.every((i) => i.kind === 'count'), 'split stroke -> at most a count issue');
  const wrong = F(draw('お'), 'あ');
  t.ok(!wrong.confident && wrong.issues.length === 0, 'different character -> not confident, no specific issues');
  const n0 = draw('ニ')[0];
  const amb = F([n0.map((p) => ({ ...p, y: 160 })), n0.map((p) => ({ ...p, y: 163 }))], 'ニ');
  t.ok(!amb.confident && amb.issues.length === 0, 'ambiguous stroke mapping -> not confident, no specific issues');
  const two = F([draw('ニ')[0]], 'ニ');
  t.ok(!two.strokeCountOk, 'missing stroke -> strokeCountOk false');
  t.ok(!F([], 'た').confident && !F(draw('た'), 'Z').confident, 'empty input / unsupported char -> not confident');
  const noisy = distort(R.reference('あ'), 'heldout-noise', 'sof', { ch: 'あ' });
  const fn = F(noisy.strokes, 'あ');
  t.ok(fn.confident && fn.issues.length === 0, 'noisy but correctly ordered あ: no false issues');
};
