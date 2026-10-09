// The book preview's type specimen (expansion U02; playbook UI-09): the five roles in their embedded faces, set
// with real strings from the game through the game's own renderer (ruby, word spacing), at the normal and the largest
// text setting. Japanese examples come only from Chapter 1 (Reedwake) scenes and from what Robin's Ledger already
// shows at the end of Chapter 2, so nothing later in the story appears.
//
// Checks reported (and failing the run if broken): every embedded face loaded from the page's own bytes; nothing
// fetched; no furigana overlapping another furigana on the same line.
//
// Usage: node tests/e2e/type_specimen.mjs [outDir] [--compare <BIZ UDMincho subset .woff2>]
//   (default outDir docs/screenshots/book/u02). --compare adds the Mincho reading option beside the learning face,
//   labelled as a comparison: that face is not in the game.
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const ci = args.indexOf('--compare');
const compare = ci >= 0 ? fs.readFileSync(args[ci + 1]).toString('base64') : null;
const outDir = path.resolve(root, args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--compare') || 'docs/screenshots/book/u02');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let failed = 0;

// what Robin's Ledger shows at the end of Chapter 2 (the U01 fixture), and the Ledger's own words
const LEDGER = {
  heads: [['{旅路|たびじ}', 'Journey'], ['{道連|みちづ}れ', 'Company'], ['{食|く}い{違|ちが}う ラベル', 'Labels That Disagree'], ['スズ', 'Suzu'], ['{海|うみ} ガラス の {名札|なふだ}', 'A Nameplate of Sea Glass']],
  body: [
    ['「{返送|へんそう}」 された {名前|なまえ} が どこ へ {行|い}く の か {突|つ}き{止|と}めよう 。', 'Find out where the "returned" names are taken — go deeper into the archive.'],
    ['{港|みなと} の {客|きゃく} は {厳|きび}しい の 。 {天気|てんき} の {話|はなし} に しか {拍手|はくしゅ} しない 。', 'Harbour audiences are harsh. They only clap for the weather.'],
    ['{一緒|いっしょ} に {歩|ある}き{始|はじ}めた ところ 。', 'You have set out together; the road is still new to you both.'],
  ],
  mixed: ['つぎ : {沈|しず}んだ{書庫|しょこ} ・ {返送窓口|へんそうまどぐち} の {潮|しお} の {書記|しょき} 。', 'Next: The Tide Clerk, in Drowned Archive — Returns Counter — no way there from here just now.'],
};

async function specimen(scale, file) {
  const { p, ctx, errors, requests } = await page(b, url, { viewport: { width: 1180, height: 900 } });
  const loaded = await p.evaluate(async (scale) => {
    RB.game.settings.ledgerStyle = 'book'; RB.game.settings.textScale = scale; RB.game.applySettings();
    return RB.bookType.install();
  }, scale);
  if (compare) {
    await p.evaluate(async (b64) => {
      const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
      const f = new FontFace('Compare UD Mincho', u.buffer); document.fonts.add(f); await f.loaded;
    }, compare);
  }
  const report = await p.evaluate(({ L, scale, compare }) => {
    const j = (line) => RB.ui.jhtml(line);
    const esc = RB.util.esc;
    // Chapter 1 lines that show the hard cases: handakuten, small kana, the small tsu, the long vowel mark, dense kanji
    const say = [];
    for (const id of Object.keys(RB.content.scenes)) {
      if (!/^rw\./.test(id)) continue;
      for (const c of RB.content.scenes[id].cmds || []) if (c.op === 'say' && c.jp && c.en && !/\$|\{\{/.test(c.jp + c.en)) say.push({ id, jp: c.jp, en: c.en });
    }
    const plain = (s) => s.replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
    const kanji = (s) => (plain(s).match(/\p{Script=Han}/gu) || []).length;
    const pick = (re, used) => say.find((x) => re.test(plain(x.jp)) && !used.has(x) && plain(x.jp).length < 46) || say.find((x) => re.test(plain(x.jp)) && !used.has(x));
    const used = new Set();
    const cases = [];
    for (const [label, re] of [['handakuten (ぱ ぴ ぷ ぺ ぽ)', /[ぱぴぷぺぽパピプペポ]/], ['dakuten (が ざ だ ば)', /[がぎぐげござじずぜぞだでどばびぶべぼ]/], ['small kana (ゃ ゅ ょ)', /[ゃゅょャュョ]/], ['the small tsu (っ)', /[っッ]/], ['the long vowel mark (ー)', /ー/]]) {
      const x = pick(re, used); if (x) { used.add(x); cases.push([label, x]); }
    }
    const dense = say.filter((x) => !used.has(x) && plain(x.jp).length < 46).sort((a, c) => kanji(c.jp) / plain(c.jp).length - kanji(a.jp) / plain(a.jp).length)[0];
    if (dense) { used.add(dense); cases.push(['dense kanji', dense]); }
    const long = say.filter((x) => !used.has(x)).sort((a, c) => plain(c.jp).length - plain(a.jp).length)[0];
    if (long) cases.push(['a long line', long]);

    const st = document.createElement('style');
    st.textContent = `
      html, body { overflow: auto !important; height: auto !important; }
      body > *:not(.spec) { display: none !important; }
      .spec { --ink: #2a2118; --ink-2: #5b4a36; --ink-3: #8a7558; background: #f3e8cf; color: var(--ink); padding: 2em 2.4em 3em; width: 1100px; box-sizing: border-box; font-family: var(--type-ui); }
      .spec { font-variant-numeric: lining-nums; word-spacing: 0.06em; } .spec .jline { word-spacing: normal; } /* as the book sets them (90_book.css) */
      .spec h1 { font-family: var(--type-latin-display); font-weight: 600; font-size: 2em; margin: 0 0 0.2em; }
      .spec .meta { font-family: var(--type-ui); color: var(--ink-2); font-size: 0.85em; margin: 0 0 1.4em; }
      .spec section { border-top: 1px solid rgba(80, 60, 30, 0.25); padding: 1em 0 1.2em; }
      .spec .role { font-family: var(--type-ui); font-size: 0.78em; letter-spacing: 0.08em; text-transform: uppercase; color: #8a5a14; margin: 0 0 0.6em; }
      .spec .role b { letter-spacing: 0; text-transform: none; color: var(--ink-2); font-weight: 400; margin-left: 0.6em; }
      .spec .disp { font-family: var(--type-latin-display); font-size: 1.5em; margin: 0.1em 0; }
      .spec .disp i { color: var(--ink-2); }
      .spec .sc { font-family: var(--type-latin-display); font-variant: small-caps; letter-spacing: 0.06em; font-weight: 600; font-size: 1.1em; color: var(--ink-2); margin: 0.2em 0; }
      .spec .read { font-family: var(--type-latin-reading); font-size: 1.05em; line-height: 1.6; max-width: 40em; margin: 0.25em 0; }
      .spec .jh { font-family: var(--type-jp-heading); font-size: 1.75em; font-weight: 600; margin: 0.15em 1.2em 0.15em 0; display: inline-block; }
      .spec .jh .jline, .spec .jh :lang(ja) { font-family: var(--type-jp-heading); }
      .spec .jb { font-family: var(--type-jp-body); font-size: 1.12em; margin: 0.35em 0 0; }
      .spec .jb .jline, .spec .jb :lang(ja) { font-family: var(--type-jp-body); }
      .spec .cmp .jline, .spec .cmp :lang(ja) { font-family: "Compare UD Mincho", var(--type-jp-body); }
      .spec .en { font-family: var(--type-latin-reading); color: var(--ink-2); font-size: 0.95em; }
      .spec .src { font-family: var(--type-ui); font-size: 0.72em; color: var(--ink-3); margin-left: 0.4em; }
      .spec .row { display: flex; flex-wrap: wrap; gap: 0.6em; align-items: center; margin: 0.4em 0; }
      .spec .btn { font-family: var(--type-ui); border: 1px solid var(--ink-3); border-radius: 2px; padding: 0.5em 0.9em; background: transparent; color: var(--ink); font-size: 0.95em; }
      .spec .btn.on { background: #e9c98a; border-color: #b8862e; font-weight: 700; }
      .spec .tabs { font-family: var(--type-ui); font-weight: 700; }
      .spec .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 2.5em; }
      .spec .k { font-family: var(--type-ui); font-size: 0.75em; color: var(--ink-3); }
      .spec .fallback { font-size: 1.6em; }
      .spec rt { color: #6b5a44; }`;
    document.head.appendChild(st);
    const S = document.createElement('main');
    S.className = 'spec';
    const roleTitle = (r, f) => '<p class="role">' + esc(r) + '<b>' + esc(f) + '</b></p>';
    const jb = (line, src) => '<div class="jb">' + j(line.jp || line[0]) + (src ? '<span class="src">' + esc(src) + '</span>' : '') + '</div><div class="en">' + esc(line.en || line[1]) + '</div>';
    let h = '<h1>The Wayfarer\'s Ledger · type specimen</h1>' +
      '<p class="meta">Text size ' + Math.round(scale * 100) + '% · every face embedded in the game (nothing fetched) · Japanese examples from Chapter 1 and from the Ledger at the end of Chapter 2</p>';
    h += '<section>' + roleTitle('Latin display', 'Vollkorn, semibold, italic and small capitals') +
      '<p class="disp">Journey · <i>Company</i> · Words · Satchel · Map</p>' +
      '<p class="disp">Labels That Disagree · <i>A Nameplate of Sea Glass</i></p>' +
      '<p class="sc">What to do now · On Suzu\'s mind · Talks at a rest stop · Robin &amp; Suzu · 3:27</p></section>';
    h += '<section>' + roleTitle('Latin reading', 'Vollkorn, regular and italic') +
      L.body.map((x) => '<p class="read">' + esc(x[1]) + '</p>').join('') +
      '<p class="read"><i>Harbour audiences are harsh. They only clap for the weather.</i></p>' +
      '<p class="read">Il1 · O0 · Kōji · ‘single’ “double” — dash … ellipsis · 1 of 3 · 12,345 · 3:27</p>' +
      '<p class="read" style="font-variant-numeric: oldstyle-nums">Il1 · 1 of 3 · 12,345 <span class="src">(Vollkorn\'s own old-style figures, which the book does not use: the 1 reads as an I)</span></p></section>';
    h += '<section>' + roleTitle('Controls', 'BIZ UDPGothic, regular and bold (its kanji are BIZ UDGothic\'s)') +
      '<div class="row tabs"><span>Journey</span><span>Words</span><span>Satchel</span><span>Map</span><span>Company</span></div>' +
      '<div class="row"><span class="btn on">Following</span><span class="btn">Show a nudge <span class="k">1 of 3</span></span><span class="btn">Save &amp; Load</span><span class="btn">Settings</span><span class="btn">Close</span></div>' +
      '<div class="row"><span class="btn on">Standard Japanese ' + j('{標準語|ひょうじゅんご}') + '</span><span class="btn">Kansai-ben ' + j('{関西弁|かんさいべん}') + '</span></div>' +
      '<p class="read" style="font-family: var(--type-ui); font-size: 0.95em">Kansai-ben is a regional dialect (Osaka, Kyoto). Word help explains it; if it is hard to follow, switch back any time.</p></section>';
    h += '<section>' + roleTitle('Japanese headings', 'Shippori Mincho, semibold') +
      L.heads.map((x) => '<span class="jh">' + j(x[0]) + '</span>').join('') + '</section>';
    h += '<section>' + roleTitle('Japanese learning text, body and furigana', 'BIZ UDGothic, regular (fixed width: each character one square)') +
      L.body.map((x) => jb(x)).join('') + jb(L.mixed) +
      cases.map(([label, x]) => '<div class="k" style="margin-top:0.9em">' + esc(label) + '</div>' + jb(x, x.id)).join('') + '</section>';
    if (compare) {
      h += '<section class="cmp">' + roleTitle('Comparison only: the Mincho reading option', 'BIZ UDMincho, regular — not in the game') +
        '<div class="grid"><div><div class="k">BIZ UDGothic (chosen)</div>' + L.body.slice(0, 2).map((x) => '<div class="jb" style="font-family: var(--type-jp-body)">' + j(x[0]).replace('class="jline"', 'class="jline" style="font-family: var(--type-jp-body)"') + '</div>').join('') + '</div>' +
        '<div><div class="k">BIZ UDMincho (option)</div>' + L.body.slice(0, 2).map((x) => '<div class="jb">' + j(x[0]) + '</div>').join('') + '</div></div></section>';
    }
    h += '<section>' + roleTitle('Fallback', 'a kanji the subsets lack still draws, in the system\'s own Japanese font') +
      '<p class="jb fallback"><span lang="ja">鬱 · 𠮟</span> <span class="src">(not used by the game; shown to check the fallback)</span></p></section>';
    S.innerHTML = h;
    // in the comparison grid, the chosen column keeps the learning face
    if (compare) S.querySelectorAll('.cmp .grid > div:first-child .jline, .cmp .grid > div:first-child :lang(ja)').forEach((e) => { e.style.fontFamily = 'var(--type-jp-body)'; });
    document.body.appendChild(S);
    return { cases: cases.map(([label, x]) => label + ': ' + x.id) };
  }, { L: LEDGER, scale, compare: !!compare });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  // furigana collisions: two readings on one line that overlap
  const ruby = await p.evaluate(() => {
    const rts = [...document.querySelectorAll('.spec rt')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0);
    let overlaps = 0;
    for (let i = 0; i < rts.length; i++) for (let k = i + 1; k < rts.length; k++) {
      const a = rts[i], c = rts[k];
      const ov = Math.min(a.right, c.right) - Math.max(a.left, c.left), vo = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
      if (ov > 0.5 && vo > 0.5) overlaps++;
    }
    return { readings: rts.length, overlaps };
  });
  const faces = await p.evaluate(() => [...document.fonts].filter((f) => /^"?RB /.test(f.family)).map((f) => f.family.replace(/"/g, '') + ' ' + f.weight + ' ' + f.style + ' ' + f.status));
  const png = await p.screenshot({ fullPage: true });
  const data = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.9);
  }, png.toString('base64'));
  fs.writeFileSync(path.join(outDir, file), Buffer.from(data.split(',')[1], 'base64'));
  const ok = loaded === 7 && faces.length === 7 && faces.every((f) => / loaded$/.test(f)) && !requests.length && !errors.length && ruby.overlaps === 0;
  if (!ok) failed++;
  console.log((ok ? 'ok   ' : 'FAIL ') + file + ': ' + loaded + ' faces loaded; ' + ruby.readings + ' furigana, ' + ruby.overlaps + ' overlapping; ' + requests.length + ' requests; ' + errors.length + ' errors');
  console.log('      examples: ' + report.cases.join(' · '));
  if (!ok) console.log('      ' + faces.join('; ') + ' ' + errors.join('; ') + ' ' + requests.join('; '));
  await ctx.close();
}

await specimen(1, 'specimen_normal.webp');
await specimen(1.4, 'specimen_large.webp');
await b.close();
srv.close();
process.exit(failed ? 1 : 0);
