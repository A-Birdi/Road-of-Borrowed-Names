// RBN-QA-133 (Agnes 6353387631, 6353618099; Local CL-232, CL-233): Tōya's note 「必要なら開ける」 / "If needed,
// open." was called "four words" (四語) though its English has three and Japanese segmentation makes any count
// arguable. Every reference to the original quotation is now count-neutral (書き置き, 言葉, 一行, 一語残らず;
// "the note", "the words"), while the quote, the four-tile ordering task, its answer, the ids and the art stay. In node:
//  1. no displayed text in the game says "four words" or 四語;
//  2. the six spoken lines, the notebook note and the sequence's title and memo read as agreed;
//  3. the quote and the four-tile task are as they were;
//  4. Word Help reads 一語 as "one word" (not "1 × language") and 書き置き as a note.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  // ---- 1. nowhere in what the game shows
  const hits = [];
  const walk = (where, o, seen) => {
    if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === 'string' && (/four[- ]words?/i.test(v) || v.includes('四語'))) hits.push(where + '.' + k);
      else if (v && typeof v === 'object') walk(where, v, seen);
    }
  };
  for (const kind of ['scenes', 'notes', 'challenges', 'quests', 'items', 'enemies', 'maps']) for (const id in C[kind] || {}) walk(kind + ':' + id, C[kind][id], new Set());
  for (const id of RB.sequence.ids()) walk('sequence:' + id, RB.sequence.get(id), new Set());
  t.eq(hits, [], 'no scene, note, challenge, quest, item, map or sequence says "four words" or 四語');
  // ---- 2. as agreed
  const say = (id) => C.scenes[id].cmds.filter((c) => c.op === 'say');
  const has = (id, jp, en) => say(id).some((c) => c.jp.includes(jp) && c.en.includes(en));
  const want = [
    ['sa.study_desk', '{急|いそ}いだ {若|わか}い {字|じ} で 、 {短|みじか}い {書|か}き{置|お}き 。', 'a short note in a hurried young hand'],
    ['sa.study_desk', '{書|か}き{置|お}き の {面|めん} は 、 {何度|なんど} も {触|さわ}られて {柔|やわ}らかい 。', 'The side with the note has gone soft from handling.'],
    ['sa.heart_kasane', '{何|なん} と でも {取|と}れる {一行|いちぎょう} 。', 'A line that could mean anything.'],
    ['sa.after_battle', '{思|おも}い{出|だ}せる の は 、 {次|つぎ} の {朝|あさ} {机|つくえ} に あった 、 あの {書|か}き{置|お}き だけ 。', 'All I remember is the note on my desk the next morning.'],
    ['sa.toya_read', 'わたし に {返事|へんじ} を した の です ね 。 {同|おな}じ {言葉|ことば} で 。', 'In the same words.'],
    ['sa.toya_read', '{約束|やくそく} を {守|まも}った の です 。 {一語|いちご} {残|のこ}らず 。', 'He kept his promise. Every word of it.'],
  ];
  t.eq(want.filter(([id, jp, en]) => !has(id, jp, en)).map((w) => w[0] + ': ' + w[2]), [], 'the six spoken lines read count-neutrally, each with its whole clause');
  const note = C.notes.sa_toya;
  t.ok(note.jp.startsWith('{高瀬|たかせ} の {返事|へんじ} と {同|おな}じ {言葉|ことば} 。') && note.en.startsWith('The same words as Takase\'s reply'), 'the notebook note: the same words as Takase\'s reply');
  const sq = RB.sequence.ids().map((id) => RB.sequence.get(id)).find((d) => d && d.scene === 'sa.toya_read');
  t.ok(sq.title.en === 'Tōya\'s note' && sq.title.jp === 'トウヤ の {書|か}き{置|お}き' && /read Tōya's note in context at last/.test(sq.memo.en), 'the sequence\'s title and memo: Tōya\'s note (' + sq.title.en + ')');
  // ---- 3. the quote and the task
  t.ok(say('sa.study_desk').some((c) => /^「 {必要|ひつよう}なら {開|あ}ける 。」$/.test(c.jp.trim()) && c.en === '"If needed, open."') && note.title.jp === '「{必要|ひつよう}なら {開|あ}ける」', 'the quote is as it was: 「必要なら開ける」 / "If needed, open."');
  const order = [];
  walk2(C.challenges['sa.toya'], (o) => { if (o && o.kind === 'order' && Array.isArray(o.tiles)) order.push(o); });
  t.ok(order.some((o) => o.tiles.join(' ') === '{必要|ひつよう}なら {僕|ぼく}が {塔|とう}を {開|あ}ける' && o.tiles.length === 4), 'the four-tile ordering task keeps its four tiles (' + order.map((o) => o.tiles.length).join(',') + ')');
  // ---- 4. Word Help
  const at = (jp, w) => { const tk = RB.jp.render(jp, { spacing: true, vars: {}, furigana: true }).tokens; return RB.jp.lookup(tk.find((x) => x.surface === w)); };
  const a = at('{一語|いちご} {残|のこ}らず 。', '一語'), b = at('{短|みじか}い {書|か}き{置|お}き 。', '書き置き');
  t.ok(a.entry && a.entry.m === 'one word' && b.entry && /note/.test(b.entry.m), `Word Help: 一語 "${a.entry && a.entry.m}", 書き置き "${b.entry && b.entry.m}"`);
};

function walk2(o, f, seen = new Set()) {
  if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o); f(o);
  for (const k of Object.keys(o)) walk2(o[k], f, seen);
}
