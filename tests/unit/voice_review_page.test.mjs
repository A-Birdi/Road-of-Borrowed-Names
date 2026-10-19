// Robin, 2026-10-18 (relayed by the local worker): reconcile Wataru's line, and a listening page for the takes to review.
//   - a send correction keeps the recording's id: the line, its display and its spoken text are the GO manifest's; only
//     the text the engine is given changes, and its words are the line's own: each as written or as the reading the line
//     gives it (hiragana or katakana), only a silent opening 「……」 or a comma left out (VOICE_DELIVERY.md §7, step 8);
//     a reference reading's correction keeps its key, word and reading the same way;
//   - the listening page is the committed review list written into one HTML file: every take by a relative path in the
//     batch folder, no audio inside it, nothing fetched, and it is current with the list it was built from.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { root } from '../lib/load.mjs';

export default async (t) => {
  const P = (...a) => path.join(root, ...a);
  const man = JSON.parse(zlib.gunzipSync(fs.readFileSync(P('docs/future/voice/production/manifest/RECORDING_MANIFEST.json.gz'))));
  const byId = new Map(man.entries.map((e) => [e.id, e]));
  const byRef = new Map(man.references.map((r) => [r.id, r]));
  const sc = JSON.parse(fs.readFileSync(P('docs/future/voice/production/supplements/SEND_CORRECTIONS.json'), 'utf8'));
  t.eq(sc.schema, 'rbn.voice.send-correction/1', 'send corrections: schema');
  t.eq(sc.after.goScriptContentHash, man.contentHash, 'send corrections are against the GO manifest');
  const SMALL = 'ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ';
  const morae = (s) => [...s].filter((ch) => /[ぁ-ー]/.test(ch) && !SMALL.includes(ch)).length;
  const hira = (s) => s.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  // what a send may be, read from the display: each word as written or as its reading, an opening 「……」 or a comma optional
  const allowed = (display) => {
    const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const d = display.replace(/ /g, '');
    const lead = (d.match(/^…+/) || [''])[0];
    const body = d.slice(lead.length).split(/(\{[^{}|]+\|[^{}|]+\}|、)/).map((p) => {
      const g = p.match(/^\{([^{}|]+)\|([^{}|]+)\}$/);
      return g ? '(?:' + esc(g[1]) + '|' + esc(g[2]) + ')' : p === '、' ? '、?' : esc(p);
    }).join('');
    return new RegExp('^' + (lead ? '(?:' + lead + ')?' : '') + body + '$');
  };
  for (const c of sc.corrections) {
    t.ok(c.send !== c.sendWas, c.ref + ': the send is corrected');
    if (c.kind === 'reference') {
      // a reference reading: the word and its reading, no line
      const r = byRef.get(c.id);
      t.ok(!!r, c.ref + ': its id is a reference reading in the GO manifest');
      if (!r) continue;
      t.eq([c.speaker, c.delivery, c.key, c.written, c.reading, c.spoken, c.sendWas], [r.speaker, r.delivery, r.key, r.written, r.reading, r.spoken, r.spoken], c.ref + ': the reference is unchanged (same id and key)');
      t.ok(allowed('{' + r.written + '|' + hira(r.reading) + '}').test(hira(c.send)), c.ref + ': the send is the word as written or its reading, in kana');
      t.eq([c.sendMorae, morae(c.send)], [r.morae, r.morae], c.ref + ': its morae are the word\'s own, every one in the send');
    } else {
      const e = byId.get(c.id);
      t.ok(!!e, c.ref + ': its id is in the GO manifest');
      if (!e) continue;
      t.eq([c.speaker, c.delivery, c.dialect, c.display, c.spoken, c.sendWas], [e.speaker, e.delivery, e.dialect, e.display, e.spoken, e.send], c.ref + ': the line is unchanged (same id)');
      t.eq(c.lines.map((l) => l.key), e.lines.map((l) => l.key), c.ref + ': the same line keys');
      t.ok(allowed(hira(e.display)).test(hira(c.send)), c.ref + ': the send keeps the line\'s words (each as written or as its reading in kana; only an opening 「……」 or a comma left out)');
      t.eq(c.sendMorae, morae(e.kana.replace(/^…+/, '')), c.ref + ': its morae are the line\'s own');
    }
    const [lo, hi] = c.lengthFit.windowSeconds;
    t.ok(lo < c.lengthFit.targetSeconds && c.lengthFit.targetSeconds < hi, c.ref + ': the length target sits in its window');
  }
  const sc1 = sc.corrections.find((c) => c.ref === 'SC1');
  t.eq([sc1 && sc1.id, sc1 && sc1.send], ['r1-6ab18b4d8dcef181', 'やめさせないんですか。'], 'SC1 is Wataru\'s 「……辞めさせないんですか。」, sent as 「やめさせないんですか。」');
  const sc2 = sc.corrections.find((c) => c.ref === 'SC2'), sc3 = sc.corrections.find((c) => c.ref === 'SC3');
  t.eq([sc2 && sc2.id, sc2 && sc2.send], ['r1-6843cbc80ebf3837', '「潮硝子」のふだを拾った。'], 'SC2 is the narrator\'s 「「潮硝子」の札を拾った。」, 札 sent as ふだ');
  t.eq([sc3 && sc3.id, sc3 && sc3.send], ['r1-2d3ac586bb0e7209', '言われた通りにしか行かない舟か。……正直な奴だ。'], 'SC3 is Nao\'s line, the comma before か left out');
  const sc4 = sc.corrections.find((c) => c.ref === 'SC4');
  t.eq([sc4 && sc4.id, sc4 && sc4.key, sc4 && sc4.send], ['r1-ref-e5bf48bf7ab94ff8', 'word:潮止まり|しおどまり', 'シオドマリ'], 'SC4 is the narrator\'s reading of 潮止まり, sent in katakana');
  // SC5–SC9 (Robin's final listening round, 2026-10-19): one word each, sent in the kana of its own furigana
  t.eq(sc.corrections.filter((c) => /^SC[5-9]$/.test(c.ref)).map((c) => [c.id, c.changes.join()]), [
    ['r1-af31602b66d327ad', '頁 sent as its reading, ページ'], ['r1-139fcb0057e03467', '灯守 sent as its reading, ひもり'],
    ['r1-4a729bf0784c69a1', '台詞 sent as its reading, せりふ'], ['r1-42001e24d9d659f1', '台詞 sent as its reading, せりふ'],
    ['r1-f39bfbb362a57021', '釉 sent as its reading, くすり']], 'SC5–SC9: Kohaku\'s 頁, Hisae\'s 灯守, Mio\'s and Nao\'s 台詞, Nao\'s 釉');
  t.ok(sc.corrections.filter((c) => /^SC[5-9]$/.test(c.ref)).every((c) => { const [k, r] = c.changes[0].match(/^(\S+) sent as its reading, (\S+)$/).slice(1); return c.sendWas.replace(k, r) === c.send && c.display.includes('{' + k + '|' + r + '}'); }),
    'SC5–SC9: the old send with that one word replaced by the reading the display gives it');
  t.eq(sc.corrections.map((c) => c.ref), sc.corrections.map((c, i) => 'SC' + (i + 1)), 'send corrections are numbered in order (append-only)');
  // the rule turns away what it should: a changed word, a dropped mid-line beat
  t.ok(!allowed('{言|い}われた {通|とお}り 、 か 。 …… {奴|やつ} だ 。').test('言われた通りか。……やつだな。'), 'rule: a changed ending is not a send correction');
  t.ok(!allowed('{言|い}われた {通|とお}り 、 か 。 …… {奴|やつ} だ 。').test('言われた通り、か。やつだ。'), 'rule: a mid-line 「……」 stays');
  t.ok(allowed('…… {辞|や}めさせない 、 か 。').test('やめさせないか。'), 'rule: an opening 「……」 and a comma may go');
  t.ok(allowed('{潮止|しおど}まり').test(hira('シオドマリ')) && !allowed('{潮止|しおど}まり').test(hira('ショドマリ')), 'rule: the reading in katakana is the reading; a different sound is not');

  // the listening page
  const { build, ruby } = await import('../../tools/voice/review_page.mjs');
  t.eq(ruby('…… {辞|や}めさせない ん です か 。', '……辞めさせないんですか。'), '……<ruby>辞<rt>や</rt></ruby>めさせないんですか。', 'ruby: the reading above the kanji, the spacing gone');
  t.eq(ruby('{今|いま} {朝|あさ}', '今朝'), '<ruby>今<rt>いま</rt></ruby><ruby>朝<rt>あさ</rt></ruby>', 'ruby: one group per word');
  t.eq(ruby('{a|b} <x>', 'zz'), 'zz', 'ruby: markup it cannot match falls back to the spoken text');
  const listPath = P('docs/future/voice/production/run/REVIEW_LIST.json');
  const list = JSON.parse(fs.readFileSync(listPath, 'utf8'));
  const { html, files, total, recordings } = await build(listPath);
  t.eq(total, list.groups.reduce((n, g) => n + g.items.length, 0), 'page: every listing of the review list');
  t.eq(recordings, new Set(list.groups.flatMap((g) => g.items.map((i) => i.id))).size, 'page: one decision per recording (151 for 160 listings)');
  const named = new Set(list.groups.flatMap((g) => g.items.flatMap((i) => [i.file].concat((i.earlierTakes || []).map((x) => x.file)))));
  t.eq(files.slice().sort(), [...named].sort(), 'page: every current and earlier take, each once');
  t.ok(files.every((f) => /^(superseded\/\d{8}T\d{6}\/)?[a-z0-9_]+\/r1-(ref-)?[0-9a-f]{16}\.opus$/.test(f)), 'page: takes are relative paths in the batch folder');
  t.ok(!/data:audio|base64,|https?:\/\/|file:\/\/|[A-Za-z]:\\\\|\/home\/|\/Users\//.test(html), 'page: no audio inside it, no address and no local path');
  t.ok(!/fetch\(|XMLHttpRequest|navigator\.sendBeacon|<link /.test(html), 'page: nothing fetched or sent');
  const data = JSON.parse(html.match(/<script type="application\/json" id="list">([\s\S]*?)<\/script>/)[1]);
  t.eq(data.batch, list.batch, 'page: the batch it reviews');
  const w = data.groups.find((g) => g.key === 'open').items[0];
  // (the list moves on as takes are recorded: whether SC1 is recorded, and how many earlier takes there are, come from it)
  const wl = list.groups.find((g) => g.key === 'open').items.find((i) => i.id === 'r1-6ab18b4d8dcef181');
  t.eq([w.id, w.sc && w.sc.send, w.sc && w.sc.recorded, w.earlier.length], ['r1-6ab18b4d8dcef181', 'やめさせないんですか。', wl.sent === 'やめさせないんですか。', (wl.earlierTakes || []).length],
    'page: Wataru\'s card carries SC1, recorded as the list says (' + (wl.sent === 'やめさせないんですか。') + '), with every earlier take (' + (wl.earlierTakes || []).length + ')');
  t.ok(data.groups.every((g) => g.items.every((i) => i.jp && !/\{[^}]*\|/.test(i.jp))), 'page: every card has its line, readings drawn, no markup left');
  t.ok(data.groups.flatMap((g) => g.items).filter((i) => i.also.length).length === 2 * (total - recordings), 'page: a recording in two groups shows the other reason on both cards');
  t.eq(fs.readFileSync(P('docs/future/voice/production/run/REVIEW_LISTENING.html'), 'utf8'), html, 'the committed page is current with the list (node tools/voice/review_page.mjs)');
};
