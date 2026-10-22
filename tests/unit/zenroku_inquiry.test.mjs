// RBN-QA-115 (Agnes 6345961972, 6346428273, 6346676788; Local CL-209; Cloud CC-125 §7, CC-126 §2): Zenroku's complaint
// offered him "the Upper House's Plum room from tomorrow", a booking nobody had made. Now it is a genuine inquiry that
// Kane takes over, with no room or date promised:
//  1. the offer: 「上の湯に、いつから部屋が空くか、聞いてみます。」, the から lesson kept honestly; its near miss asks until
//     when a room stays free (いつまで…空いているか), and its feedback says so; the third, the floor, as before;
//  2. what follows: Kane takes the asking over herself, and sits with the people next door tonight;
//  3. the end it reaches: 'asked', setting yn_zenroku_asked, saying what Kane will ask and that she sits with them;
//     played through, it is the end the encounter reaches; nothing named 'moved' is left, and nothing reads the old flag;
//  4. Kane's line after it, under var._enc=asked: she will ask the Upper House herself;
//  5. nowhere in the complaint or Kane's reply to it: Plum, 梅, 明日, "tomorrow";
//  6. the stay, blunt, walked and heard branches exactly as they were (fingerprints of the task head 05196f0);
//  7. the language ledger holds the three new lines, self-reviewed for this change.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter;
  const d = C.encounters['yn.complaint'];
  const A = (id) => d.social.actions.find((a) => a.id === id);
  const OFFER = '{上|かみ}の{湯|ゆ} に 、 いつ から {部屋|へや} が {空|あ}く か 、 {聞|き}いて みます 。';
  const UNTIL = '{上|かみ}の{湯|ゆ} に 、 いつ まで {部屋|へや} が {空|あ}いて いる か 、 {聞|き}いて みます 。';
  const KANE = '{上|かみ}の{湯|ゆ} に は 、 {私|わたし} から {聞|き}いて みる わ 。 …… {客|きゃく} の こと で {向|む}こう に {相談|そうだん} する なんて 、 {何年|なんねん} ぶり かしら 。';
  // 1. the offer
  const mv = A('move');
  t.ok(mv && mv.label.jp === OFFER && mv.label.en === 'Offer to ask the Upper House when a room will come free', 'the offer: ' + (mv && mv.label.en));
  const low = mv.task.F, high = mv.task.A;
  const ok = (x) => x.options.find((o) => o.ok);
  const near = (x) => x.options.find((o) => o.jp === UNTIL);
  t.ok(low.item === 'g:prt_kara_made' && ok(low).jp === OFFER && ok(high).jp === OFFER && near(low) && near(high) && low.options.length === 2 && high.options.length === 3, 'the から lesson: いつから is the answer, いつまで…空いているか its near miss at every profile, the floor a third for I and A');
  t.ok(/until when a room stays free/.test(near(low).why.en) && /not when one comes free/.test(near(low).why.en), 'the near miss says it asks until when a room stays free: ' + near(low).why.en);
  t.ok(high.options.some((o) => o.jp === '{下|しも}の{湯|ゆ} の {土間|どま} が 、 {今夜|こんや} {空|あ}きます 。' && o.why.en === 'The floor is no place for him, and not what you mean.'), 'the third, the floor, as before');
  // 2. what follows
  t.ok(mv.effect.flag === 'asked' && /Leave the asking to me\. I'll ask the Upper House myself when a room will come free\./.test(mv.says.en) && /tonight I'll sit with the people next door/.test(mv.says.en), 'Kane takes the asking over, and sits with the people next door tonight');
  // 3. the end
  const end = d.conclusions.find((c) => c.id === 'asked');
  t.ok(end && end.when.flag === 'asked' && end.result === 'win' && end.flags.yn_zenroku_asked === true && !('yn_zenroku_moved' in end.flags) && end.text.en === 'Kane will ask the Upper House when a room comes free for Zenroku. Tonight she sits with the people next door.', 'the end: ' + (end && end.text.en));
  t.ok(!d.conclusions.some((c) => c.id === 'moved') && !d.social.actions.some((a) => a.effect && a.effect.flag === 'moved'), 'nothing named \'moved\' is left in the complaint');
  const readers = [];
  for (const [id, sc] of Object.entries(C.scenes)) if (JSON.stringify(sc.cmds).includes('yn_zenroku_moved')) readers.push(id);
  t.ok(!readers.length, 'nothing reads the old flag' + (readers.length ? ': ' + readers.join(', ') : ''));
  // played: reveal what he cannot say, then offer to ask
  const s = RB.state.newCampaign({ difficulty: 'normal' });
  s.comp = null; s.words = ['mamoru', 'mizu', 'hikari'];
  const words = s.words.map((w) => C.words[w]).filter(Boolean);
  const st = E.begin('yn.complaint', s);
  const play = (id) => { const card = E.cards(st, s, words).find((c) => c.id === 's:' + id); if (card && !card.disabled) E.exchange(st, { card, res: { ok: true, firstTry: true, mistakes: 0 }, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def }); return !!card; };
  play('read_noise'); play('ask_why');
  const offered = play('move');
  const fin = st.over ? E.finishEncounter(st, s, st.over) : null;
  t.ok(offered && fin && fin.outcome === 'asked' && fin.flags && fin.flags.yn_zenroku_asked === true && !('yn_zenroku_moved' in fin.flags), 'played through: the end it reaches is \'asked\', which sets yn_zenroku_asked (' + JSON.stringify(fin && { outcome: fin.outcome, flags: fin.flags }) + ')');
  // 4. Kane after it
  const cmds = C.scenes['yn.complaint_start'].cmds;
  const kane = cmds.filter((c) => c.op === 'say' && c.who === 'yn_kane' && JSON.stringify(c).includes('_enc=asked'));
  t.ok(kane.length === 1 && kane[0].jp === KANE && kane[0].en === 'I\'ll ask the Upper House myself. …Going to them about a guest. How many years has it been?', 'Kane after it: ' + (kane[0] && kane[0].en));
  t.ok(!cmds.some((c) => JSON.stringify(c).includes('_enc=moved')), 'no line waits on an end named \'moved\'');
  // 5. nothing left of the booking
  const text = JSON.stringify(d) + JSON.stringify(cmds);
  const left = ['Plum', '{梅|うめ}', '明日', 'omorrow'].filter((w) => text.includes(w));
  t.ok(!left.length, 'nothing in the complaint or Kane\'s reply says Plum, 梅, 明日 or tomorrow' + (left.length ? ': ' + left.join(', ') : ''));
  // 6. the other branches as they were
  const h = (x) => { let v = 2166136261 >>> 0; for (let i = 0; i < x.length; i++) { v ^= x.charCodeAt(i); v = Math.imul(v, 16777619) >>> 0; } return v.toString(36); };
  const fp = { stay: h(JSON.stringify(A('stay'))), blunt: h(JSON.stringify(A('blunt'))), stayed: h(JSON.stringify(d.conclusions.find((c) => c.id === 'stayed'))), walked: h(JSON.stringify(d.conclusions.find((c) => c.id === 'walked'))), heard: h(JSON.stringify(d.conclusions.find((c) => c.id === 'heard'))) };
  t.ok(JSON.stringify(fp) === JSON.stringify({ stay: '1vvvmg7', blunt: 'nnuuka', stayed: '1q5rijk', walked: '121n77q', heard: '1qubneh' }), 'the stay, blunt, walked and heard branches exactly as on the task head ' + JSON.stringify(fp));
  // 7. the ledger
  const led = JSON.parse(fs.readFileSync(path.join(root, 'docs/review/language/yn.json'), 'utf8'));
  const has = (jp) => Object.values(led).some((e) => e && e.jp === jp && e.status === 'self-reviewed' && /^RBN-QA-115 self-review/.test(e.ref));
  t.ok(has(OFFER) && has(UNTIL) && has(KANE), 'the ledger holds the three new lines, self-reviewed for this change');
};
