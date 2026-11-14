// Batch 3 Row 1 (Cloud CC-589; Local CL-822; Agnes 6874584737), in Chromium on the built game: each version of Wing 3's
// chores note, Wing 7's letter and Wing 8's evidence board shows its own English. A throwaway journey after the story
// (slot 4 of a fresh browser context, never a player's saves); each scene run by the game's scene runner with the real
// dialogue box (the letter as read once it has been asked about). Each line is read off the box as it shows.
//  1. every state that picks a version (both patterns, F/E/I/A, without and with Grow; 48 runs): with the default
//     settings (English first, the Japanese under it) the box shows the agreed English of the version the level picks,
//     and under it that version's Japanese, its readings as ruby, no brace or bar showing;
//  2. the settings, once per scene: Japanese first (the two swap); the second line on tap ("(tap for translation)"
//     under Japanese, "(tap for Japanese)" under English, the line itself on a tap); the second line off (nothing);
//  3. word pairing: focusing a Japanese word (as the keyboard does) marks its English word: Wing 3 at E, the words for
//     "before" and "after"; Wing 7 at I, "written"; at A, "former"; Wing 8 at I, "morning", "Hisa" and "seems";
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/hall_variant_english.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);

const AGREED = {
  w3: {
    0: { F: 'First draw water; then light the stone lantern; then carry the firewood; last, wake the priest.', E: 'Before waking the priest, carry the firewood. After drawing water, light the stone lantern. After lighting the stone lantern, carry the firewood.', I: 'Waking the priest comes after the firewood has all been carried. The stone lantern is not lit until the water has been drawn. The firewood is carried while the lantern is still bright.', A: 'As soon as the water is drawn, the stone lantern is to be lit. The firewood is carried by the lantern\'s light. Waking the priest comes once everything is in order.' },
    1: { F: 'First light the stone lantern; then draw water; then wake the priest; last, carry the firewood.', E: 'Carrying the firewood comes last. After lighting the stone lantern, draw water. After drawing water, wake the priest.', I: 'Carrying the firewood comes once everything else is done. The water is drawn after the stone lantern is lit. The priest is woken the moment the water has all been drawn.', A: 'As soon as the stone lantern is lit, the water is to be drawn. The priest is woken as soon as the water is ready. The firewood can wait until the priest is up.' },
  },
  w7: {
    0: { F: 'A comb and a flute are put away in the storehouse. I\'d like the comb set before the family altar.', E: 'A comb and a flute are put away in the storehouse. I\'d like the comb offered at the family altar.', I: 'A comb and a flute are put away in the storehouse. I\'d like the one written first offered at the family altar.', A: 'The comb and the flute are laid away in the storehouse. I\'d like the former offered at the family altar.' },
    1: { F: 'A flute and a comb are put away in the storehouse. I\'d like the flute set before the family altar.', E: 'A flute and a comb are put away in the storehouse. I\'d like the flute offered at the family altar.', I: 'A flute and a comb are put away in the storehouse. I\'d like the one written first offered at the family altar.', A: 'The flute and the comb are laid away in the storehouse. I\'d like the former offered at the family altar.' },
  },
  w8: [
    ['Tōsuke was wearing straw boots: Saki saw him.', 'Tōsuke was wearing straw boots. Saki is said to have seen him.', 'This morning, Saki is reported to have seen Tōsuke wearing straw boots.'],
    ['Gonroku seems to be wearing geta. There was a sound in the corridor.', 'Gonroku seems to be wearing geta. There was a clip-clop in the corridor.', 'Geta went clip-clop in the corridor, so it seems Gonroku is in geta.'],
    ['Saki cleared the snow in zōri.', 'Saki is said to have cleared the snow in zōri.', 'According to the landlady, Saki cleared the snow still in zōri.'],
    ['A child\'s straw sandals should be small.', 'A child\'s straw sandals should be small.', 'Hisa is still a child, so the straw-sandal prints must be small.'],
  ],
};
const SCENE = { w3: 'hall.w3.t2_note', w7: 'hall.w7.t6', w8: 'hall.w8.t8_board' };
const NEXT = { F: 'E', E: 'I', I: 'A', A: 'A' };
const shown = (prof, route) => (route === 'grow' ? NEXT[prof] : prof);
const want = (w, pat, tier) => (w === 'w8' ? AGREED.w8.map((r) => r[{ F: 0, E: 1, I: 2, A: 2 }[tier]]) : [AGREED[w][pat][tier]]).map((x) => '"' + x + '"');

// one scene, run in the page with the real dialogue box; each line's box read as it shows (and, on request, after a tap
// on the second line, and with one of its Japanese words focused)
async function play(p, o) {
  return p.evaluate(async (o) => {
    const s = RB.game.s;
    s.learn.profile = o.prof;
    RB.hall.wrec(s, o.w).pat = o.pat;
    RB.hall.setChoice(s, o.w, { route: o.route });
    if (o.w === 'w7') s.flags.xp_hall_w7_f1_asked = true; else delete s.flags.xp_hall_w7_f1_asked;
    Object.assign(RB.game.settings, { lead: o.lead || 'en', secondary: o.secondary || 'always' });
    RB.game.applySettings();
    const read = () => {
      const el = (sel) => document.querySelector(sel);
      const box = (e) => {
        if (!e) return null;
        const c = e.cloneNode(true);
        c.querySelectorAll('rt').forEach((r) => r.remove());
        return { text: e.textContent.trim(), base: c.textContent.replace(/\s/g, ''), ruby: e.querySelectorAll('ruby').length, cls: e.className };
      };
      return { main: box(el('.dlg .main')), sub: box(el('.dlg .sub')) };
    };
    const reading = (t) => [...t.childNodes].map((n) => (n.nodeName === 'RUBY' ? (n.querySelector('rt') || {}).textContent || '' : n.textContent)).join('').replace(/\s/g, '');
    const say = RB.ui.dialogue.say;
    const snaps = [];
    RB.ui.dialogue.say = function (l) {
      const out = say.apply(this, arguments);
      const q = /^「/.test(l.jp || '');
      const snap = { jp: l.jp || '', en: l.en || '', q };
      snaps.push(snap);
      setTimeout(() => {
        snap.box = read();
        if (q && o.tap) { const sub = document.querySelector('.dlg .sub'); snap.tapText = sub ? sub.textContent.trim() : null; if (sub) sub.click(); snap.after = read(); }
        if (q && o.focus) {
          snap.pairs = {};
          for (const f of o.focus) {
            const tok = [...document.querySelectorAll('.dlg .jline[data-src] .jt[data-i]')].find((t) => reading(t) === f);
            if (!tok) { snap.pairs[f] = null; continue; }
            tok.focus();
            snap.pairs[f] = { word: [...document.querySelectorAll('.dlg .ew.hov')].map((e) => e.textContent), grammar: [...document.querySelectorAll('.dlg .ew.hov2')].map((e) => e.textContent) };
            tok.blur();
          }
        }
        snap.read = true;
      }, 120);
      return out;
    };
    let done = false;
    RB.script.run(o.scene).then(() => { done = true; }, () => { done = true; });
    for (let i = 0; i < 400 && !done; i++) {
      await new Promise((r) => setTimeout(r, 60));
      const last = snaps[snaps.length - 1];
      if (RB.ui.dialogue.isOpen() && last && last.read && !last.adv) { last.adv = true; RB.ui.dialogue.advance(true); }
    }
    RB.ui.dialogue.say = say;
    return { done, snaps: snaps.map((x) => ({ jp: x.jp, en: x.en, q: x.q, box: x.box, tapText: x.tapText, after: x.after, pairs: x.pairs })) };
  }, o);
}
const baseOf = (jp) => jp.replace(/\{([^|}]*)\|[^}]*\}/g, '$1').replace(/\s/g, '');
const braces = (jp) => (jp.match(/\{[^|}]*\|[^}]*\}/g) || []).length;

const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
await p.evaluate(() => {
  const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true, hall_foyer_seen: true, ngp_offered: true };
  const s = RB.game.debugStart('hall.foyer', 40, 14, { comp: 'mio', flags: done });
  s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both';
  RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice';
  RB.game.applySettings();
  RB.save.setCurrent(4, 0);
});

// 1. every state, the default settings
const bad = [];
let runs = 0, lines = 0, rubyLines = 0;
for (const w of ['w3', 'w7', 'w8']) for (const pat of [0, 1]) for (const prof of ['F', 'E', 'I', 'A']) for (const route of ['consolidate', 'grow']) {
  const r = await play(p, { w, pat, prof, route, scene: SCENE[w] });
  runs++;
  const q = r.snaps.filter((x) => x.q);
  const exp = want(w, pat, shown(prof, route));
  const shownEn = q.map((x) => x.box && x.box.main && x.box.main.text);
  const subOk = q.every((x) => x.box && x.box.sub && x.box.sub.base === baseOf(x.jp) && !/[{}|]/.test(x.box.sub.text) && (braces(x.jp) ? x.box.sub.ruby > 0 : true));
  lines += q.length; rubyLines += q.filter((x) => braces(x.jp)).length;
  if (!r.done || flat(shownEn) !== flat(exp) || !subOk) bad.push({ w, pat, prof, route, done: r.done, shownEn, exp, sub: q.map((x) => x.box && x.box.sub && x.box.sub.base) });
}
ok(runs === 48 && !bad.length, '1 every state (48 runs): the box shows the agreed English of the version the level picks, and under it that version\'s Japanese with its readings as ruby, no brace or bar ' + flat({ runs, lines, rubyLines, bad: bad.slice(0, 2) }));

// 2. the settings, once per scene (pattern 1, level E, without Grow)
for (const w of ['w3', 'w7', 'w8']) {
  const exp = want(w, 1, 'E');
  let r = await play(p, { w, pat: 1, prof: 'E', route: 'consolidate', scene: SCENE[w], lead: 'ja' });
  let q = r.snaps.filter((x) => x.q);
  ok(q.length === exp.length && q.every((x, i) => x.box.main.base === baseOf(x.jp) && x.box.main.ruby > 0 && x.box.sub.text === exp[i]),
    '2 ' + w + ', Japanese first: the Japanese (with ruby) above, the agreed English under it ' + flat(q.map((x) => x.box.sub.text)));
  r = await play(p, { w, pat: 1, prof: 'E', route: 'consolidate', scene: SCENE[w], lead: 'ja', secondary: 'tap', tap: true });
  q = r.snaps.filter((x) => x.q);
  ok(q.length === exp.length && q.every((x, i) => x.tapText === '(tap for translation)' && x.after.sub.text === exp[i]),
    '2 ' + w + ', Japanese first, second line on tap: "(tap for translation)", then the agreed English on a tap ' + flat(q.map((x) => [x.tapText, x.after && x.after.sub.text])));
  r = await play(p, { w, pat: 1, prof: 'E', route: 'consolidate', scene: SCENE[w], lead: 'en', secondary: 'tap', tap: true });
  q = r.snaps.filter((x) => x.q);
  ok(q.length === exp.length && q.every((x, i) => x.box.main.text === exp[i] && x.tapText === '(tap for Japanese)' && x.after.sub.base === baseOf(x.jp)),
    '2 ' + w + ', English first, second line on tap: the agreed English, "(tap for Japanese)", then the Japanese on a tap ' + flat(q.map((x) => [x.tapText, x.after && x.after.sub.base])));
  r = await play(p, { w, pat: 1, prof: 'E', route: 'consolidate', scene: SCENE[w], lead: 'en', secondary: 'off' });
  q = r.snaps.filter((x) => x.q);
  ok(q.length === exp.length && q.every((x, i) => x.box.main.text === exp[i] && x.box.sub.text === ''),
    '2 ' + w + ', English first, second line off: the agreed English and nothing under it ' + flat(q.map((x) => x.box.sub.text)));
}

// 3. word pairing (Japanese first, the English under it; a word focused as the keyboard does)
const pairs = async (o, focus) => { const r = await play(p, Object.assign({ lead: 'ja', focus }, o)); return r.snaps.filter((x) => x.q).map((x) => x.pairs); };
let pr = await pairs({ w: 'w3', pat: 0, prof: 'E', route: 'consolidate', scene: SCENE.w3 }, ['まえ', 'あと']);
ok(pr[0] && pr[0]['まえ'] && pr[0]['まえ'].word.includes('Before') && pr[0]['あと'] && pr[0]['あと'].word.includes('After'), '3 Wing 3 at E: the word for "before" marks "Before", the one for "after" marks "After" ' + flat(pr));
pr = await pairs({ w: 'w7', pat: 0, prof: 'I', route: 'consolidate', scene: SCENE.w7 }, ['かいた']);
ok(pr[0] && pr[0]['かいた'] && pr[0]['かいた'].word.includes('written'), '3 Wing 7 at I: "wrote" marks "written" ' + flat(pr));
pr = await pairs({ w: 'w7', pat: 0, prof: 'A', route: 'consolidate', scene: SCENE.w7 }, ['ぜんしゃ']);
ok(pr[0] && pr[0]['ぜんしゃ'] && pr[0]['ぜんしゃ'].word.includes('former'), '3 Wing 7 at A: "the former" marks "former" ' + flat(pr));
pr = await pairs({ w: 'w8', pat: 0, prof: 'I', route: 'consolidate', scene: SCENE.w8 }, ['けさ', 'ヒサ', 'よう']);
ok(pr[0] && pr[0]['けさ'] && pr[0]['けさ'].word.includes('morning') && pr[1] && pr[1]['よう'] && pr[1]['よう'].word.includes('seems') && pr[3] && pr[3]['ヒサ'] && pr[3]['ヒサ'].word.includes('Hisa'),
  '3 Wing 8 at I: "this morning" marks "morning"; Gonroku\'s "it seems" marks "seems"; "Hisa" marks "Hisa" ' + flat([pr[0] && pr[0]['けさ'], pr[1] && pr[1]['よう'], pr[3] && pr[3]['ヒサ']]));

ok(errors.length === 0, 'no page errors (console errors included): ' + errors.join(' | '));
await p.close();
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
