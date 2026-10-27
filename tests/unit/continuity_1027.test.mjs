// Four continuity findings from native play (Agnes 6437885007, 6438233048, 6438541589, 6438761372; Local CL-480,
// CL-482, CL-483; CC-344, CC-345):
//  - the night on the pier (sg.ch2_end): Nao says north only where the north road is the way on, and east where it is
//    Tetsu's ferry (the scene's own journal route, ed>=2&!mb2_done): exactly one of the two in every state, the same
//    way as the journal; the north line is unchanged, so it keeps its voice key;
//  - How We Travel (co.reflect_travel_nao) opens on ch2_done, in Saltglass itself before leaving too: the opening
//    before Chapter 4 names no place; the one after Chapter 4 looks back to Saltglass, as before;
//  - the letters from home (lq.letters_home): either letter may come alone, so the courier says "Post" and neither
//    letter is introduced as one of two, in each of the three states the scene is reached in; the quests, the stamp
//    and the note as before;
//  - the table outside Reedwake's teahouse (rw.teatable): one view of the bridge, the right one, in each of its three
//    states: not across yet; across, by day (as before); across, on the evening before you set out (a new line).
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, test = RB.state.test;
  const bare = (jp) => jp.replace(/\{[^|}]+\|[^}]+\}/g, '');
  const kanji = /[㐀-鿿]/;
  // a line's voice key, as src/audio/52_voicebank.js keyOf makes it (the scene and the Japanese only)
  const key = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp), 'utf8').digest('hex').slice(0, 10);
  // the lines a scene shows in a state: a dry walk through its commands, following its !if jumps and applying its
  // quest, flag, item and note steps to the state on the way (nothing else runs)
  function walk(id, s) {
    const sc = C.scenes[id], says = [], ops = [];
    for (let pc = 0; pc < sc.cmds.length; pc++) {
      const c = sc.cmds[pc];
      if (c.if && !test(s, c.if)) continue;
      if (c.op === 'if') {
        if (!test(s, c.args[0])) continue;
        if (!(c.args[2] in sc.labels)) break; // -> end
        pc = sc.labels[c.args[2]] - 1;
        continue;
      }
      if (c.op === 'say') { says.push(c); continue; }
      ops.push(c.op + ':' + (c.args || []).join(','));
      if (c.op === 'quest') RB.state.setQuest(s, c.args[0], c.args[1]);
      if (c.op === 'set') for (const f of c.args) s.flags[f] = true;
    }
    return { says, ops };
  }
  const fresh = (o) => { const s = RB.state.newCampaign(); s.id = 'continuity'; s.player.name = 'Aki'; return Object.assign(s, o || {}); };

  // ---- the night on the pier ------------------------------------------------------------------------------------------
  const pier = C.scenes['sg.ch2_end'];
  const dir = pier.cmds.filter((c) => c.op === 'say' && /{明日\|あした} は {(北\|きた|東\|ひがし)} だ/.test(c.jp));
  const north = '{今|いま} の 、 {忘|わす}れて いい から 。 {明日|あした} は {北|きた} だ 。 {早|はや}く {寝|ね}ろ 。';
  const east = '{今|いま} の 、 {忘|わす}れて いい から 。 {明日|あした} は {東|ひがし} だ 。 {早|はや}く {寝|ね}ろ 。';
  t.eq(dir.map((c) => [c.who, c.expr, c.jp, c.en]), [['comp', 'smirk', north, 'You can forget I said that. North tomorrow. Get some sleep.'], ['comp', 'smirk', east, 'You can forget I said that. East tomorrow. Get some sleep.']],
    'Nao\'s two lines: north as it was, east as agreed (CL-480)');
  t.eq([key('sg.ch2_end', north), key('sg.ch2_end', east)], ['sg.ch2_end#238b9fd5c6', 'sg.ch2_end#04aea0321c'], 'the north line keeps its voice key; the east line has its own');
  const journal = pier.cmds.filter((c) => c.op === 'journal');
  t.ok(journal.length === 2, 'the scene\'s two journal routes');
  for (const ed of [1, 2]) for (const mb2 of [false, true]) for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
    const s = fresh({ edition: ed, comp });
    if (mb2) s.flags.mb2_done = true;
    const shown = dir.filter((c) => test(s, c.if));
    const way = journal.filter((c) => !c.if || test(s, c.if));
    const tag = 'edition ' + ed + (mb2 ? ', Manybridge done' : '') + ', ' + comp;
    if (comp !== 'nao') { t.eq(shown.length, 0, tag + ': no direction line'); continue; }
    const wantEast = ed >= 2 && !mb2;
    t.ok(shown.length === 1 && shown[0].jp === (wantEast ? east : north), tag + ': exactly one line, ' + (wantEast ? 'east' : 'north'));
    t.ok(way.length === 1 && /{東\|ひがし}/.test(way[0].jp) === wantEast && /{北\|きた}/.test(way[0].jp) === !wantEast, tag + ': the same way as the journal');
  }

  // ---- How We Travel ---------------------------------------------------------------------------------------------------
  const rt = C.scenes['co.reflect_travel_nao'];
  const open = rt.cmds.filter((c) => c.op === 'say' && /ch4_done/.test(c.if || ''));
  const before = 'ここ まで {一緒|いっしょ} に {歩|ある}いて きて 、 {分|わ}かった こと が ある 。 {少|すこ}し {話|はな}して いい か ？';
  t.eq(open.map((c) => [c.if, c.jp, c.en]), [
    ['!ch4_done', before, 'Walking this far together, I\'ve worked something out. Mind if I say it?'],
    ['ch4_done', '{潮硝子|しおがらす} の {頃|ころ} から 、 {言|い}おう と {思|おも}ってた こと が ある 。 {遅|おそ}く なった けど 、 {今|いま} いい か ？', 'There\'s something I\'ve meant to say since Saltglass. It\'s late, but can I say it now?'],
  ], 'the opening before Chapter 4 as agreed (CL-480); the one after it as it was');
  t.ok(!/潮硝子|Saltglass/.test(open[0].jp + open[0].en) && !kanji.test(bare(open[0].jp)), 'the opening before Chapter 4 names no place, and every kanji has its reading');
  t.eq(key('co.reflect_travel_nao', before), 'co.reflect_travel_nao#fb2a3455ab', 'its voice key (a new line: the old recording is not played for it)');
  // the early Gull: Chapter 2 done, still in Saltglass, not yet left: How We Travel is what Nao has to say, and it opens
  // with the line that names no place
  const g = fresh({ comp: 'nao', map: 'sg.inn', x: 6, y: 7 });
  Object.assign(g.flags, { ch2_done: true, sg_ferry_running: true });
  RB.company.refresh(g);
  const pend = RB.company.pending(g);
  t.ok(pend && pend.id === 'reflect:travel' && pend.scene === 'co.reflect_travel_nao', 'in the Gull after Chapter 2, How We Travel is pending: ' + JSON.stringify(pend));
  const first = walk('co.reflect_travel_nao', g).says[0];
  t.ok(first && first.jp === before, 'and it opens with the line that names no place');

  // ---- the letters from home -------------------------------------------------------------------------------------------
  const when = C.maps['sg.harbor'].onEnter.find((e) => e.scene === 'lq.letters_home').if;
  const courier = { jp: '{道|みち} の {向|む}こう から {配達人|はいたつにん} が {走|はし}って きて 、 $name の {名前|なまえ} を {呼|よ}んだ 。 「 {葦|あし}ノ{瀬|せ} から 、 {手紙|てがみ} です よ ！ 」', en: 'A courier comes running up the road, calling your name. "Post from Reedwake!"' };
  const koji = { jp: 'コウジ から の {手紙|てがみ} 。 {不器用|ぶきよう} な {字|じ} だ 。', en: 'A letter from Kōji, in a clumsy hand.' };
  const tsuru = { jp: 'ツル から の {短|みじか}い {手紙|てがみ} 。', en: 'A short letter from Tsuru.' };
  t.eq(key('lq.letters_home', courier.jp), 'lq.letters_home#1a779e57f1', 'the courier\'s Japanese is as it was (its key unchanged; only the English says "Post")');
  t.eq([key('lq.letters_home', koji.jp), key('lq.letters_home', tsuru.jp)], ['lq.letters_home#9d095ed887', 'lq.letters_home#1076c92b57'], 'the two introductions\' new keys');
  const narr = (r) => r.says.filter((c) => c.who === 'narr');
  const has = (r, x) => narr(r).filter((c) => c.jp === x.jp && c.en === x.en).length;
  for (const [tag, known, want] of [
    ['neither line heard of', {}, { koji: 1, tsuru: 1, ops: ['give:lq_stamp', 'note:lq_farebook', 'quest:lq_fare,1', 'quest:lq_road,1'] }],
    ['Kōji\'s line already heard of (Agnes\'s run)', { lq_fare: 2 }, { koji: 0, tsuru: 1, ops: ['quest:lq_road,1'] }],
    ['Tsuru\'s line already heard of', { lq_road: 2 }, { koji: 1, tsuru: 0, ops: ['give:lq_stamp', 'note:lq_farebook', 'quest:lq_fare,1'] }],
  ]) {
    const s = fresh({ comp: 'mio' });
    s.flags.ch2_done = true;
    for (const q in known) RB.state.setQuest(s, q, known[q]);
    t.ok(test(s, when), tag + ': the letters reach the next town');
    const r = walk('lq.letters_home', s);
    t.ok(has(r, courier) === 1 && narr(r)[0].jp === courier.jp, tag + ': the courier, first');
    t.eq([has(r, koji), has(r, tsuru)], [want.koji, want.tsuru], tag + ': ' + (want.koji ? 'Kōji\'s letter' : '') + (want.koji && want.tsuru ? ' and ' : '') + (want.tsuru ? 'Tsuru\'s' : '') + ', each introduced once');
    t.ok(!narr(r).some((c) => /一通|もう/.test(bare(c.jp)) || /\b(One is|The other|Letters from)\b/.test(c.en)), tag + ': no letter is introduced as one of two');
    t.eq(r.ops.filter((o) => /^(give|note|quest):/.test(o)).sort(), want.ops.slice().sort(), tag + ': the quests, the stamp and the note as before');
  }
  const both = fresh(); both.flags.ch2_done = true; RB.state.setQuest(both, 'lq_fare', 1); RB.state.setQuest(both, 'lq_road', 1);
  t.ok(!test(both, when), 'with both lines heard of, no letters come');
  t.ok([koji, tsuru].every((x) => !kanji.test(bare(x.jp))) && RB.lex.get('手紙', 'てがみ') && RB.lex.get('不器用', 'ぶきよう') && RB.lex.get('短い', 'みじかい'), 'every kanji in the introductions has its reading, and their words are in the lexicon');

  // ---- the table outside the teahouse ----------------------------------------------------------------------------------
  const broken = { jp: '{茶屋|ちゃや} の {外|そと} の {卓|たく} 。 {川|かわ} と {橋|はし} が よく {見|み}える 。 {向|む}こう{岸|ぎし} まで {届|とど}かない {橋|はし} が 。', en: 'The table outside the teahouse has a good view of the river and the bridge. The bridge that doesn\'t reach the far bank.', key: 'rw.teatable#fbda9e255a' };
  const day = { jp: '{橋|はし} は {向|む}こう{岸|ぎし} まで {届|とど}いて いる 。 {朝|あさ} の {光|ひかり} が {板|いた} の {上|うえ} で {光|ひか}って いる 。', en: 'The bridge reaches the far bank. Morning light glints on the planks.', key: 'rw.teatable#a37391e407' };
  const night = { jp: '{橋|はし} は {向|む}こう{岸|ぎし} まで {届|とど}いて いる 。 {灯|あか}り が {板|いた} の {上|うえ} に {映|うつ}って いる 。', en: 'The bridge reaches the far bank. Lantern light lies on the planks.', key: 'rw.teatable#7329ab7013' };
  t.eq([broken, day, night].map((x) => key('rw.teatable', x.jp)), [broken.key, day.key, night.key], 'the two lines as they were keep their keys (and recordings); the night line has its own');
  t.ok(!kanji.test(bare(night.jp)) && RB.lex.get('灯り', 'あかり') && RB.lex.get('映る', 'うつる'), 'the night line: every kanji has its reading, and its words are in the lexicon');
  for (const [tag, flags, want] of [['the bridge not yet fixed', {}, broken], ['fixed, by day', { bridge_fixed: true }, day], ['fixed, on the evening before you set out', { bridge_fixed: true, rw_night: true, rw_evening: true }, night]]) {
    const s = fresh({ map: 'rw.village' });
    Object.assign(s.flags, flags);
    const says = walk('rw.teatable', s).says;
    t.ok(says.length === 1 && says[0].who === 'narr' && says[0].jp === want.jp && says[0].en === want.en, tag + ': one view, the right one: ' + says.map((c) => c.en).join(' | '));
  }
};
