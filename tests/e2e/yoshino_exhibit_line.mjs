// RBN-QA-085 (Agnes 6332791438, English 6332916876; Local CL-161; Cloud CC-087, CC-088): once the tellings hang in
// the keepers' hall, Yoshino said the children were arguing in front of the panels and quoted a serpent panel and a
// boat, whoever was there and whatever was chosen. Her line is now choice-neutral and looks ahead. In Chromium on the
// built game, talking to Yoshino in the hall during Chapter 9 (her talk as the world resolves it, the scene as played):
//  1. before the exhibition: the blank-panels line, unchanged;
//  2. after it, for several sets of panel choices (the panels themselves showing each choice): the new line, in Japanese
//     and English, once; never the arguing children, the serpent or the boat;
//  3. the same with Ao's side story not taken, at the hall reading (Ao there) and done;
//  4. after the chapter and in the postgame her other talks, unchanged; the line's furigana and its own voice key;
//     no page errors.
// Usage: node tools/build.mjs && node tests/e2e/yoshino_exhibit_line.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, errors } = await page(b, url);
const wait = (ms) => p.waitForTimeout(ms);

const NEW = { jp: 'これ で 、 {子供|こども} たち も {板|いた} の {話|はなし} を {比|くら}べられます 。 {何|なに} に {気付|きづ}く か 、 {楽|たの}しみ です 。 …… いい {授業|じゅぎょう} に なりそう です 。', en: 'Now the children can compare the stories on the panels. I\'m looking forward to seeing what they notice. …It should make a good lesson.' };
const BLANK_EN = 'The panels on the hall\'s walls have been blank for years. The keepers never could agree whose story to hang.';
const OLD = /arguing|serpent|The boat|喧嘩|海蛇/;
const KO = { ch2_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_ch9: true, ko_arrived: true, ko_otoha_met: true };
const SRC = ['otoha', 'nami', 'hamaji', 'shell'];

// talk to Yoshino as the world resolves it, and play that scene to its end
async function talk(flags, o = {}) {
  await p.evaluate(([flags, o]) => {
    const s = RB.game.debugStart('ko.hall', 8, 8, { dir: 'up', edition: RB.edition.forNew(), comp: 'suzu', flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    if (o.ao != null) RB.state.setQuest(s, 'ko_ao', o.ao);
    for (const k in o.vars || {}) s.vars[k] = o.vars[k];
    RB.world.enter('ko.hall', 8, 8, 'up', { fresh: true });
    if (!window.__sayWrapped) {
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { window.__said.push({ who: l.who, jp: l.jp, en: l.en }); return say.apply(this, arguments); };
      window.__sayWrapped = true;
    }
    const n = RB.content.maps['ko.hall'].npcs.find((x) => x.id === 'ko_yoshino');
    const t = n.talk.find((x) => !x.if || RB.state.test(RB.game.s, x.if));
    window.__scene = t.scene; window.__said = []; window.__done = false;
    RB.script.run(t.scene).then(() => { window.__done = true; }, () => { window.__done = true; });
  }, [flags, o]);
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ done: window.__done, dlg: RB.ui.dialogue.isOpen() }));
    if (st.done) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance());
    await wait(60);
  }
  return p.evaluate(() => {
    const s = RB.game.s, hall = RB.content.maps['ko.hall'];
    // the panels standing now (each shows the version chosen for it, or blank)
    const panels = [4, 8, 12].map((x) => (hall.props || []).filter((q) => q.p === 'ko_panel' && q.x === x && (!q.if || RB.state.test(s, q.if))).map((q) => q.o && q.o.v));
    const ao = (hall.npcs || []).some((n) => n.id === 'ko_ao_hall' && (!n.if || RB.state.test(s, n.if)));
    return { done: window.__done, scene: window.__scene, said: window.__said.filter((x) => x.who === 'ko_yoshino'), panels, ao };
  });
}
const brief = (r) => JSON.stringify({ scene: r.scene, panels: r.panels, ao: r.ao, said: r.said.map((x) => x.en) });
const saysNew = (r) => r.said.filter((x) => x.jp === NEW.jp && x.en === NEW.en).length;
const saysOld = (r) => r.said.some((x) => OLD.test(x.en || '') || OLD.test(x.jp || ''));

// 1. before the exhibition
{
  const r = await talk(KO);
  ok(r.done && r.scene === 'ko.yoshino_ch9' && r.said.length === 1 && r.said[0].en === BLANK_EN && saysNew(r) === 0 && r.panels.every((v) => v.length === 1 && v[0] === 0), 'before the exhibition: the blank-panels line, unchanged; the panels blank (' + brief(r) + ')');
}
// 2. after it, for several sets of choices
for (const pick of [['shell', 'nami', 'shell'], ['otoha', 'nami', 'hamaji'], ['hamaji', 'hamaji', 'hamaji'], ['shell', 'shell', 'shell']]) {
  const vars = {}; pick.forEach((src, i) => { vars['tell_ko.t_hall_p' + (i + 1)] = src; });
  const r = await talk(Object.assign({ 'tell_ko.t_hall_ok': true }, KO), { vars });
  const shows = r.panels.every((v, i) => v.length === 1 && v[0] === SRC.indexOf(pick[i]) + 1);
  ok(r.done && r.scene === 'ko.yoshino_ch9' && saysNew(r) === 1 && r.said.length === 1 && !saysOld(r) && shows, 'panels ' + pick.join('/') + ': the panels show those choices; Yoshino says the new line once, no arguing children, serpent or boat (' + brief(r) + ')');
}
// 3. Ao's side story: not taken, at the hall reading (Ao there), done
for (const [ao, label] of [[null, 'not taken'], [1, 'at the hall reading'], ['done', 'done']]) {
  const r = await talk(Object.assign({ 'tell_ko.t_hall_ok': true }, KO), { ao, vars: { 'tell_ko.t_hall_p1': 'otoha', 'tell_ko.t_hall_p2': 'shell', 'tell_ko.t_hall_p3': 'nami' } });
  ok(r.done && saysNew(r) === 1 && !saysOld(r) && r.ao === (ao === 1), 'Ao\'s side story ' + label + ': the same new line (Ao in the hall: ' + r.ao + ') (' + brief(r) + ')');
}
// 4. after the chapter and in the postgame: her other talks, unchanged; the line itself
{
  const r1 = await talk(Object.assign({ 'tell_ko.t_hall_ok': true, ko_done: true }, KO));
  ok(r1.scene === 'ko.yoshino_after' && saysNew(r1) === 0, 'after the chapter: her own talk (ko.yoshino_after), not this line (' + brief(r1) + ')');
  const r2 = await talk(Object.assign({ 'tell_ko.t_hall_ok': true, ko_done: true, postgame: true }, KO));
  ok(r2.scene === 'ko.yoshino_post' && saysNew(r2) === 0, 'in the postgame: ko.yoshino_post, not this line (' + brief(r2) + ')');
  const r = await p.evaluate((NEW) => {
    const c = RB.content.scenes['ko.yoshino_ch9'].cmds.filter((x) => x.jp === NEW.jp);
    const bare = NEW.jp.replace(/\{[^}]*\}/g, '').match(/[一-鿿]/g) || [];
    return { n: c.length, if: c.map((x) => x.if), en: c.map((x) => x.en), bare, key: RB.voicebank.keyOf('ko.yoshino_ch9', NEW.jp) };
  }, NEW);
  ok(r.n === 1 && r.en[0] === NEW.en && r.bare.length === 0, 'the scene holds the line once, with its English, after the exhibition only, every kanji with furigana (' + JSON.stringify(r) + ')');
  ok(r.key === 'ko.yoshino_ch9#21962b0a35' && r.key !== 'ko.yoshino_ch9#c80ba6fab1', 'the new text has its own voice key, not the old recording\'s (' + r.key + ')');
}

ok(!errors.length, 'no page errors ' + errors.slice(0, 3).join(' | '));
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
