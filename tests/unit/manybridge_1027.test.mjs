// Two Manybridge first-visit findings from native play (Agnes 6440215796, 6440796491, 6441198377; Local CL-486, CL-487;
// CC-347), each a line that assumed an optional visit:
//  - after the tally dispute (mb.dispute_after), Nao recalls what the postbox said only if you read the postbox
//    (seen.mb.mailbox); otherwise Nao says the same from a courier's own knowledge. Sen's next line names the
//    dead-letter office either way; the other companions are as before;
//  - Matsu's "You again?" (mb.matsu_negotiate) only if you met her before (seen.mb.matsu_first, an optional meeting);
//    otherwise the same refusal as a first meeting. Who she is reached through, the encounter and what follows are as
//    before. The original lines keep their voice keys (and recordings); the new ones have their own.
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
  const fresh = (o) => { const s = RB.state.newCampaign(); s.id = 'manybridge'; s.player.name = 'Aki'; return Object.assign(s, o || {}); };

  // ---- the postbox, after the tally dispute ------------------------------------------------------------------------------
  const da = C.scenes['mb.dispute_after'];
  const recall = { jp: '{名前|なまえ} の {分|わ}からない {宛先|あてさき} か 。 …… そういう {手紙|てがみ} が {集|あつ}まる {場所|ばしょ} 、 さっき {郵便箱|ゆうびんばこ} に {書|か}いて あった な 。', en: 'An address nobody can read. …There was a place for letters like that, the postbox said.' };
  const known = { jp: '{名前|なまえ} の {分|わ}からない {宛先|あてさき} か 。 …… そういう {手紙|てがみ} は 、 どこ の {町|まち} でも {一|ひと}つ の {場所|ばしょ} に {集|あつ}まる 。', en: 'An address nobody can read. …Letters like that end up in one place, in any town.' };
  const naoLines = da.cmds.filter((c) => c.op === 'say' && c.who === 'comp' && /{宛先\|あてさき}/.test(c.jp));
  t.eq(naoLines.map((c) => [c.if, c.expr, c.jp, c.en]), [['comp=nao&seen.mb.mailbox', 'think', recall.jp, recall.en], ['comp=nao&!seen.mb.mailbox', 'think', known.jp, known.en]],
    'Nao\'s two lines: the recall as it was, for a player who read the postbox; a courier\'s own knowledge otherwise (CL-486)');
  t.eq([key('mb.dispute_after', recall.jp), key('mb.dispute_after', known.jp)], ['mb.dispute_after#267e38076e', 'mb.dispute_after#d6ee0941f1'], 'the recall keeps its voice key; the new line has its own');
  const sen = da.cmds.findIndex((c) => c.op === 'say' && c.who === 'mb_sen' && /{宛先不明\|あてさきふめい}/.test(c.jp));
  t.ok(sen > da.cmds.indexOf(naoLines[1]) && !da.cmds[sen].if, 'Sen then names the dead-letter office, for everyone, as before');
  for (const comp of ['nao', 'mio', 'ren', 'suzu']) for (const read of [false, true]) {
    const s = fresh({ comp });
    if (read) s.seen['mb.mailbox'] = true;
    const shown = da.cmds.filter((c) => c.op === 'say' && c.who === 'comp' && (!c.if || test(s, c.if)));
    const tag = comp + (read ? ', the postbox read' : ', the postbox not read');
    if (comp === 'nao') t.ok(shown.length === 1 && shown[0].jp === (read ? recall.jp : known.jp), tag + ': one line, ' + (read ? 'the recall' : 'from a courier\'s own knowledge'));
    else t.ok(shown.length === 1 && !/{宛先\|あてさき}/.test(shown[0].jp), tag + ': their own line, as before');
  }

  // ---- Matsu ---------------------------------------------------------------------------------------------------------------
  const mn = C.scenes['mb.matsu_negotiate'];
  const again = { jp: 'また {来|き}た の かい 。 {下|した} に {行|い}きたい ？ {無理|むり} だ ね 。', en: 'You again? You want to go down? Out of the question.' };
  const first = { jp: '{何|なん} の {用|よう} だい 。 {下|した} に {行|い}きたい ？ {無理|むり} だ ね 。', en: 'What do you want? To go down? Out of the question.' };
  const says = mn.cmds.filter((c) => c.op === 'say');
  t.eq(says.map((c) => [c.who, c.if, c.jp, c.en]), [['mb_matsu', 'seen.mb.matsu_first', again.jp, again.en], ['mb_matsu', '!seen.mb.matsu_first', first.jp, first.en]], 'Matsu\'s two openings (CL-487)');
  t.eq([key('mb.matsu_negotiate', again.jp), key('mb.matsu_negotiate', first.jp)], ['mb.matsu_negotiate#0f1731dfbe', 'mb.matsu_negotiate#c289cea06e'], '"You again?" keeps its voice key; the first-meeting line has its own');
  t.eq(mn.cmds.filter((c) => c.op !== 'say').map((c) => c.op + ':' + (c.args || []).join(',')), ['faceplayer:', 'encounter:mb.passage', 'call:mb.passage_after'], 'then the encounter and what follows it, as before');
  const talk = C.maps['mb.lock'] ? C.maps['mb.lock'].npcs.find((n) => n.id === 'mb_matsu').talk : Object.values(C.maps).flatMap((m) => m.npcs || []).find((n) => n.id === 'mb_matsu').talk;
  // (the festival's invitation, added in front by a later chapter, src/content/mp, comes after Manybridge is done)
  t.eq(talk.map((x) => [x.if || null, x.scene]), [['mb2_done&mp_inv_matsu', 'mp.fest_matsu'], ['mb1_done', 'mb.matsu_after'], ['mb_passage', 'mb.matsu_passage'], ['quest.mb_main>=5', 'mb.matsu_negotiate'], [null, 'mb.matsu_first']], 'who she is reached through, as before');
  for (const met of [false, true]) {
    const s = fresh();
    RB.state.setQuest(s, 'mb_main', 5);
    if (met) s.seen['mb.matsu_first'] = true;
    const route = talk.find((x) => !x.if || test(s, x.if));
    const shown = says.filter((c) => test(s, c.if));
    const tag = met ? 'having met her before' : 'meeting her first here';
    t.ok(route.scene === 'mb.matsu_negotiate' && shown.length === 1 && shown[0].jp === (met ? again.jp : first.jp), tag + ': the negotiation, opening with ' + (met ? '"You again?"' : '"What do you want?"'));
  }
  t.ok([known, first].every((x) => !kanji.test(bare(x.jp))) && RB.lex.get('宛先', 'あてさき') && RB.lex.get('集まる', 'あつまる') && RB.lex.get('場所', 'ばしょ') && RB.lex.get('用', 'よう'),
    'every kanji in the new lines has its reading, and their words are in the lexicon');
};
