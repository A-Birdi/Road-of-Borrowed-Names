// Hana's teahouse rush at any hour (Agnes 6433779782; CC-332, CC-333; Local CL-464 to CL-466): rw.hana_rush is offered
// once Kōji is back, with no time of day, so what is said and shown in that moment names none: Hana's first line, the
// quest's title (its "New quest" notice follows the line at once) and the orders' title, each with every kanji given
// its reading. The rest is as it was: the route, the quest starting on that line, the orders, the quest done and the
// tea leaves given (their "morning tea" names a kind of tea, and stays).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const timeJp = /朝|昼|夕|晩|夜/, timeEn = /\b(morning|noon|afternoon|evening|night|tonight)\b/i;
  const bare = (jp) => jp.replace(/\{[^|}]+\|[^}]+\}/g, '');
  const kanji = /[㐀-鿿]/;

  const sc = C.scenes['rw.hana_rush'];
  const says = sc.cmds.filter((c) => c.op === 'say');
  const first = says[0];
  t.ok(first.who === 'hana' && !timeJp.test(first.jp) && !timeEn.test(first.en), 'Hana\'s first line names no time of day: ' + first.en);
  t.eq([first.jp, first.en], ['いらっしゃい ！ …… ごめん なさい 、 {今|いま} {混|こ}んで いて 。 コウジ が {戻|もど}った って {聞|き}いて 、 みんな {見|み}に {来|く}る の よ 。 {手伝|てつだ}って くれる ？',
    'Welcome! …Sorry, it\'s a rush right now. Everyone heard Kōji\'s back and came to look. Would you help?'], 'the agreed wording (CL-464)');
  t.ok(!kanji.test(bare(first.jp)), 'every kanji in it has its reading');

  for (const [what, title] of [['the quest', C.quests.rw_teahouse.title], ['the orders', C.activities['rw.a_orders'].title]]) {
    t.eq([title.jp, title.en], ['{忙|いそが}しい {茶屋|ちゃや}', 'The Teahouse Rush'], what + '\'s title (CC-333 option a)');
    t.ok(!timeJp.test(title.jp) && !timeEn.test(title.en) && !kanji.test(bare(title.jp)), what + '\'s title names no time of day, and every kanji has its reading');
  }
  t.ok(RB.lex.get('茶屋', 'ちゃや') && RB.lex.get('忙しい', 'いそがしい') && RB.lex.get('混む', 'こむ'), 'the words of the titles and of Hana\'s new clause are in the lexicon (no new word)');

  // the scene as it was: the quest starts on the line, then the choice, the orders, the quest done, the leaves
  const ops = sc.cmds.map((c) => c.op + (c.args && c.args.length ? ':' + c.args.join(',') : ''));
  const at = (o) => ops.indexOf(o);
  t.ok(ops[at('say') + 1] === 'quest:rw_teahouse,start', 'the quest starts on that line: ' + ops.slice(0, 6).join(' '));
  t.ok(at('quest:rw_teahouse,start') < at('choice') && at('choice') < at('activity:rw.a_orders') && at('activity:rw.a_orders') < at('quest:rw_teahouse,done') && at('quest:rw_teahouse,done') < at('give:rw_tea_leaves'),
    'then the choice, the orders, the quest done and the tea leaves, in that order: ' + ops.join(' '));
  t.ok(says.length === 2 && /morning tea leaves/.test(says[1].en), 'the thanks still gives her morning tea leaves (a kind of tea)');

  // the route: Hana in the teahouse offers it once Kōji is back, with no time condition, until the quest is done
  const hana = C.maps['rw.tea'].npcs.find((n) => n.id === 'hana');
  const i = hana.talk.findIndex((x) => x.scene === 'rw.hana_rush');
  t.ok(i > 0 && hana.talk[i].if === 'rw_koji_back' && hana.talk[i - 1].scene === 'rw.hana_after2' && hana.talk[i - 1].if === 'rw_koji_back&quest.rw_teahouse=done', 'the route is unchanged: on rw_koji_back, until the quest is done');
};
