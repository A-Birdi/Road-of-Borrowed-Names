// Nao's first narration in the river warehouse says what the English and Nao's art show (RBN-QA-183; Agnes 6402876474,
// 6402904713; Local CL-397; CC-257): an ochre scarf and a bulging satchel, no hat. The Japanese had opened with
// 帽子の下から ("from under a hat"), which neither the English, Nao's brief (docs/STORY.md) nor the art has. In Chromium
// on the built game, `rw.nao_first` played where it plays (the warehouse, talking to Nao, Chapter 1's flags), every
// line read as shown:
//  1. the narration whose English is "An ochre scarf; a bulging satchel. …" is shown, Nao's own lines around it;
//  2. its Japanese, as the dialogue shows it, has no 帽子 and opens with 黄土色 read おうどいろ;
//  3. every kanji shown in it carries its reading (ruby), and its English is unchanged;
//  4. the scene plays to its end with no page error.
// Voice is outside this check: the line's text changes its voice key, so the old recording no longer plays for it
// (the device's voice or none, as for any line without a recording; voice work paused).
// Usage: node tools/build.mjs && node tests/e2e/nao_first_words.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, errors } = await page(b, url);

const r = await p.evaluate(async () => {
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  RB.game.settings.textSpeed = 'instant';
  RB.game.applySettings();
  // Chapter 1, the letters not yet sorted: where the scene plays (tests/e2e/staging_ch12_cases.mjs's fixture)
  const s = RB.game.debugStart('rw.warehouse', 4, 4, { dir: 'right', flags: { rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true } });
  RB.state.setQuest(s, 'rw_labels', 0);
  for (const m in RB.content.maps) for (const f of RB.content.maps[m].foes || []) s.flags['foe:' + m + ':' + f.id] = true;
  RB.save.autosave = async () => {};
  RB.challenge.run = async () => ({ ok: true });
  RB.activities.run = async () => ({ ok: true });
  if (RB.lessons) { RB.lessons.run = async () => {}; RB.lessons.grammarCard = async () => {}; }
  RB.ui.card = async () => {};
  await sleep(300);
  const nao = RB.staging.actor('nao');
  if (nao) RB.world.faceTo(nao, RB.world.W.player.x, RB.world.W.player.y);
  let done = false, err = null, seen = s.backlog.length;
  RB.script.run('rw.nao_first', { npc: (nao || {}).id || 'nao' }).then(() => { done = true; }, (e) => { err = String(e); done = true; });
  const lines = [];
  const t0 = performance.now();
  while (!done && performance.now() - t0 < 30000) {
    await sleep(25);
    const bs = document.querySelectorAll('.choices:not(.hidden) button');
    if (bs.length) { bs[0].click(); await sleep(80); continue; }
    const sh = RB.ui.dialogue.shown();
    if (!sh || !RB.ui.dialogue.isOpen() || s.backlog.length === seen) continue;
    seen = s.backlog.length;
    await sleep(60);
    // the Japanese line as shown, whichever place it takes (with English leading it is the line below; 20_dialogue.js)
    const main = document.querySelector('.dlg .txt .jline');
    // kanji shown outside a ruby base (a reading missing), and the ruby pairs shown
    const bare = [], ruby = [];
    const walk = (n) => {
      if (n.nodeType === 3) { if (!n.parentElement.closest('ruby') && /[一-鿿]/.test(n.textContent)) bare.push(n.textContent.trim()); return; }
      if (n.nodeName === 'RUBY') { const rt = n.querySelector('rt'); const base = Array.from(n.childNodes).filter((c) => c.nodeName !== 'RT' && c.nodeName !== 'RP').map((c) => c.textContent).join(''); ruby.push(base + '|' + (rt ? rt.textContent : '')); return; }
      for (const c of n.childNodes) walk(c);
    };
    if (main) walk(main);
    const cl = main && main.cloneNode(true);
    if (cl) cl.querySelectorAll('rt, rp').forEach((e) => e.remove());
    const shownText = cl ? cl.textContent : '';
    lines.push({ who: sh.who || '', jp: sh.jp || '', en: sh.en || '', shown: shownText.replace(/\s+/g, ''), bare, ruby });
    RB.ui.dialogue.advance(true);
  }
  return { done, err, lines };
});

ok(r.done && !r.err, 'rw.nao_first plays to its end (' + (r.err || r.lines.length + ' lines') + ')');
const i = r.lines.findIndex((l) => /^An ochre scarf; a bulging satchel\./.test(l.en));
const n = r.lines[i];
ok(i > 0 && /floorboard/.test(r.lines[i - 1].en) && r.lines.slice(i + 1).some((l) => /^Nao, courier/.test(l.en)), 'the scarf narration is shown, after Nao\'s floorboard line and before "Nao, courier" (line ' + i + ' of ' + r.lines.length + ')');
if (n) {
  ok(!n.shown.includes('帽子') && !n.jp.includes('帽子'), 'no 帽子 in the narration as shown: ' + n.shown);
  ok(/^黄土色/.test(n.shown) && n.ruby[0] === '黄土色|おうどいろ', 'it opens with 黄土色 read おうどいろ (' + n.ruby.slice(0, 2).join(', ') + ')');
  ok(n.bare.length === 0 && n.ruby.length >= 6, 'every kanji shown has its reading (' + n.ruby.length + ' ruby' + (n.bare.length ? '; bare: ' + n.bare.join(' ') : '') + ')');
  ok(n.en === 'An ochre scarf; a bulging satchel. While talking, their eyes check the back door.', 'the English unchanged: ' + n.en);
}
ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
