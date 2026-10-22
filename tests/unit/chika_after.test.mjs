// RBN-QA-131 (Agnes 6350324790, 6350682819; Local CL-219, CL-221): after the Cloudroad, Chika said every label on her
// medicine chest could now be read, with one jar honestly marked 「不明」, on every journey; only Mio rewrites the
// labels (cr.chika, `?(comp=mio) !set cr_mio_labels`), and Ginji's parcel writes one dosage label, not the chest's.
// Now that line is kept for the journey where Mio did it, and every other journey hears a neutral line about the
// busier road:
//  1. what cr.chika_after says, run as the game runs it, for each companion (the one with you now and the one who was
//     there before are different things): with cr_mio_labels, the labels line, unchanged; without it, the new line;
//     without it but with the parcel delivered (cr_parcel_done), the new line (the powder does not relabel the chest);
//  2. the choice reads the outcome flag only, never the current companion;
//  3. her talk order is unchanged: the parcel first while you carry it, then the after-chapter scene, then her first;
//  4. the new line has its ledger entry (self-reviewed under RBN-QA-131) and every kanji its reading; the labels
//     line's ledger entry and its voice key (scene + text) are unchanged, so its recording still plays.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const NEW = '{雲路|くもじ} を {通|とお}る {人|ひと} が {増|ふ}えて 、 {頭痛|ずつう} の {相談|そうだん} も {増|ふ}えた わ 。 {頭|あたま} が {痛|いた}く なったら 、 {無理|むり} を しないで 、 ここ で {休|やす}んで いって ね 。';
  const LABELS = '{薬箱|くすりばこ} の ラベル 、 {全部|ぜんぶ} {読|よ}める よう に なった わ 。 「{不明|ふめい}」 の {瓶|びん} も {一|ひと}つ ある けど 、 それ も {正直|しょうじき} で いい わ ね 。';
  const sc = C.scenes['cr.chika_after'];
  // the scene's lines for a state, followed as the script does (an !if jumps to its label, !end stops)
  const run = (s) => {
    const out = [];
    for (let i = 0; i < sc.cmds.length; i++) {
      const c = sc.cmds[i];
      if (c.if && !RB.state.test(s, c.if)) continue;
      if (c.op === 'end') break;
      if (c.op === 'if') {
        const a = c.args || [], arrow = a.indexOf('->');
        if (RB.state.test(s, a.slice(0, arrow).join(' '))) { i = sc.labels[a[arrow + 1]] - 1; }
        continue;
      }
      if (c.op === 'say') out.push(c.jp);
    }
    return out;
  };
  const mk = (flags, comp) => { const s = RB.state.newCampaign(); RB.game.s = s; s.comp = comp; Object.assign(s.flags, { cr_called: true, cr_done: true }, flags); return s; };
  const bad = [];
  for (const comp of [null, 'nao', 'mio', 'ren', 'suzu']) {
    for (const [name, flags, want] of [['labels rewritten with Mio', { cr_mio_labels: true }, LABELS], ['not rewritten', {}, NEW], ['not rewritten, the parcel delivered', { cr_parcel_done: true }, NEW], ['rewritten and the parcel delivered', { cr_mio_labels: true, cr_parcel_done: true }, LABELS]]) {
      const got = run(mk(flags, comp));
      if (got.length !== 1 || got[0] !== want) bad.push((comp || 'none') + ', ' + name + ': ' + JSON.stringify(got));
    }
  }
  t.eq(bad, [], 'what she says: the labels line only where Mio rewrote them, the new line otherwise (the parcel too), with each companion now');
  // 2. the outcome flag only
  const conds = sc.cmds.map((c) => (c.op === 'if' ? (c.args || []).join(' ') : '') + ' ' + (c.if || '')).join(' ');
  t.ok(/cr_mio_labels/.test(conds) && !/comp|party/.test(conds), 'the choice reads cr_mio_labels and never the current companion');
  t.ok(sc.cmds.filter((c) => c.op === 'say').every((c) => c.who === 'cr_chika'), 'only Chika speaks in it');
  // 3. her talk order
  const chika = (C.maps['cr.umagaeshi'].npcs || []).find((a) => a.id === 'cr_chika');
  t.ok(chika && chika.talk.length === 3 && chika.talk[0].scene === 'cr.parcel' && chika.talk[0].if === 'item.cr_parcel'
    && chika.talk[1].scene === 'cr.chika_after' && chika.talk[1].if === 'cr_done' && chika.talk[2].scene === 'cr.chika' && !chika.talk[2].if,
    'her talk: the parcel first while carried, then after the chapter, then her first scene (' + JSON.stringify(chika && chika.talk) + ')');
  const parcel = C.scenes['cr.parcel'];
  t.ok(!JSON.stringify(parcel.cmds).includes('cr_mio_labels'), 'the parcel scene does not set or read the chest\'s relabelling');
  // 4. ledger, readings, voice key
  const ledger = JSON.parse(fs.readFileSync(path.join(root, 'docs/review/language/cr.json'), 'utf8'));
  const mine = Object.entries(ledger).filter(([k]) => k.startsWith('scene:cr.chika_after#'));
  const nw = mine.find(([, e]) => e.jp === NEW), lb = mine.find(([, e]) => e.jp === LABELS);
  t.ok(nw && nw[1].status === 'self-reviewed' && /RBN-QA-131/.test(nw[1].ref), 'the new line\'s ledger entry, self-reviewed under RBN-QA-131');
  t.ok(lb && lb[1].status === 'self-reviewed' && !/RBN-QA-131/.test(lb[1].ref), 'the labels line\'s entry is as it was');
  t.ok(!RB.jp.plain(NEW.replace(/\{[^}]*\}/g, '')).match(/[一-鿿々]/), 'every kanji in the new line carries its reading');
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp), 'utf8').digest('hex').slice(0, 10);
  t.eq(keyOf('cr.chika_after', LABELS), 'cr.chika_after#0aebd1fc23', 'the labels line keeps its voice key (its recording still plays)');
  t.ok(keyOf('cr.chika_after', NEW) !== keyOf('cr.chika_after', LABELS), 'the new line has its own key: ' + keyOf('cr.chika_after', NEW));
};
