// RV0047 (the register audit; Agnes 6352566901, 6353627618; Local CL-232, CL-233): Nao's fourth Chapter 3 banter
// opened "Heard about the bell? Everyone ran to the channel when it rang", though the bell is an optional side quest
// (it may never have rung), and when it did ring she was there and had said so (co.bell_ring). Now its first line
// branches on co_bell_rung, in Agnes's wording; nothing else changes. In node:
//  1. when the banter plays: as before (after the kiln, before the chapter's end), no other condition;
//  2. exactly one opener plays for each state of co_bell_rung: with it, the ringing remembered; without it, no event
//     claimed;
//  3. the two lines after it are as they were, so either opener leads into 配達もそうだ….
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  // ---- 1.
  const b = C.banter.filter((x) => x.scene === 'co.b_nao4');
  t.eq(b.map((x) => [x.comp, x.map, x.if]), [['nao', 'co.*', 'co_kiln_done&!ch3_done']], 'it plays when it did: Nao, the orchard, after the kiln and before the chapter\'s end');
  // ---- 2.
  const says = C.scenes['co.b_nao4'].cmds.filter((c) => c.op === 'say');
  t.eq(says.length, 4, 'four lines, two of them the openers');
  const opener = (rung) => { const s = { flags: Object.assign({ co_kiln_done: true }, rung ? { co_bell_rung: true } : {}), vars: {}, quests: {}, inv: {} }; return says.slice(0, 2).filter((c) => !c.if || RB.state.test(s, c.if)); };
  const r = opener(true), n = opener(false);
  t.ok(r.length === 1 && r[0].jp.startsWith('{鐘|かね} が {鳴|な}った {時|とき} 、 {皆|みな} 、 {水路|すいろ} へ {走|はし}った な 。') && r[0].en === 'Everyone ran to the channel when the bell rang. Their heads forgot; their feet remembered the way.', 'the bell rang: she remembers it (' + r.map((c) => c.en).join(' / ') + ')');
  t.ok(n.length === 1 && n[0].jp === '{頭|あたま} で {思|おも}い{出|だ}せなくて も 、 {足|あし} が {道|みち} を {覚|おぼ}えてる こと は ある ん だ よ な 。' && n[0].en === 'Sometimes your feet remember the way even when you can\'t call it to mind.', 'it never rang: no ringing is claimed (' + n.map((c) => c.en).join(' / ') + ')');
  t.ok(![...r, ...n].some((c) => /聞いた|って 。|Heard about/.test(c.jp + c.en)), 'neither opener retells it as hearsay');
  // ---- 3.
  t.eq(says.slice(2).map((c) => [c.jp, c.en, c.if || null]), [
    ['{配達|はいたつ} も そう だ 。 {宛名|あてな} が {消|き}えて も 、 {足|あし} が {家|いえ} を {覚|おぼ}えてる こと が ある 。', 'Deliveries are like that. Even when the address fades, your feet sometimes remember the house.', null],
    ['…… {今夜|こんや} の {集|あつ}まり 、 {重|おも}い {荷物|にもつ} に なる な 。 {一緒|いっしょ} に {運|はこ}ぼう 。', '…Tonight\'s gathering is going to be a heavy parcel. Let\'s carry it together.', null],
  ], 'the two lines after it are as they were');
};
