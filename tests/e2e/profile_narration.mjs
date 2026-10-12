// P18 Plan B (Robin's C-89): the narration that depends on the Japanese level, rendered in the built index.html by the
// game's own dialogue (RB.ui.dialogue.say, the call the scene runner makes for a `say`), at the level that line is
// shown at. The lines are those tests/unit/profile_narration.test.mjs selects (tests/lib/narration.mjs, from the
// compiled scenes; it checks which level sees which variant); this checks how they look:
//  - every line, at the two hardest sizes: an upright phone 320×640 and a landscape phone 844×390, at 200 % text;
//  - the longest lines of each level (six each), at the eight sizes of the battle addendum's §22.2 (320×640, 390×844,
//    412×915, 844×390, 768×1024, 1366×768, 1440×900, 1920×1080), at 100 % and 200 % text, English-led and
//    Japanese-led;
//  - each time: the page does not scroll sideways; the dialogue is on screen with its Next button (≥ 44 px tall);
//    every line of its text reaches its box's width and none is cut off sideways; text taller than the box can be
//    scrolled to (its box scrolls); every {漢字|かな} group has its furigana; a blank to fill (［　］) stays on one
//    line; no page errors.
// It does not judge whether the Japanese is natural (C-26), or the lines' places in their scenes (the scenes' suites).
// Usage: node tests/e2e/profile_narration.mjs
import { serve, launch, page } from './lib.mjs';
import { load } from '../lib/load.mjs';
import { narration, LV } from '../lib/narration.mjs';

// the lines and the levels they are shown at, from the source this page was built from
const RBn = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
const N = narration(RBn);
const scenes = {};
for (const id in RBn.content.scenes) scenes[id] = RBn.content.scenes[id].cmds || [];
const an = N.analyse(scenes);
const lines = [];
for (const st of an.sets) for (const l of st.lines) {
  // the first level (Grow off, then on) at which this line is the one shown
  const ctx = [...new Set(String(l.if).split('|').flatMap((cj) => cj.split('&')).filter((a) => !/^!?prof\b/.test(a) && !/\.route=grow$/.test(a)))].sort().join('&');
  const wing = (String(l.if).match(/hall\.(w\d+)\.route=grow/) || [])[1] || null;
  let at = null;
  for (const g of [false, true]) for (const P of LV) if (!at && RBn.state.test(N.stateFor(ctx, P, g, wing), l.if)) at = P;
  lines.push({ scene: st.scene, i: l.i, level: at || 'E', size: RBn.jp.plain(l.jp || '').length + String(l.en || '').length });
}
const VIEWS = [[320, 640], [390, 844], [412, 915], [844, 390], [768, 1024], [1366, 768], [1440, 900], [1920, 1080]];
const longest = [];
for (const P of LV) longest.push(...lines.filter((l) => l.level === P).sort((a, b) => b.size - a.size).slice(0, 6));

const { srv, url } = await serve();
const b = await launch();
const { p, errors, ctx } = await page(b, url, { viewport: { width: 320, height: 640 } });
await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'mio', flags: { departed: true } }); RB.game.settings.textSpeed = 'instant'; });
await p.waitForTimeout(600);
let renders = 0;
const problems = [];
async function render(l, o) {
  if (o.view) await p.setViewportSize({ width: o.view[0], height: o.view[1] });
  const r = await p.evaluate(async ([l, o]) => {
    const st = RB.game.settings;
    if (st.textScale !== o.scale || st.lead !== o.lead) { st.textScale = o.scale; st.lead = o.lead; RB.game.applySettings(); }
    RB.game.s.learn.profile = l.level;
    const c = RB.content.scenes[l.scene].cmds[l.i];
    RB.ui.dialogue.say({ who: c.who, expr: c.expr, jp: c.jp, en: c.en, sceneId: l.scene, line: c.line });
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    await new Promise((res) => setTimeout(res, 30));
    const vw = innerWidth, vh = innerHeight;
    const dlg = document.querySelector('.dlg'), txt = document.querySelector('.dlg .txt'), next = document.querySelector('.dlg .b-next');
    const out = [];
    if (!dlg || !txt) return ['no dialogue'];
    if (document.documentElement.scrollWidth > vw + 1) out.push('the page scrolls sideways (' + document.documentElement.scrollWidth + ' > ' + vw + ')');
    const d = dlg.getBoundingClientRect();
    if (d.left < -1 || d.right > vw + 1 || d.top < -1 || d.bottom > vh + 1) out.push('the dialogue is off screen ' + JSON.stringify([Math.round(d.left), Math.round(d.top), Math.round(d.right), Math.round(d.bottom)]));
    const n = next && next.getBoundingClientRect();
    if (!n || n.height < 44 || n.top < -1 || n.bottom > vh + 1 || n.right > vw + 1) out.push('Next is not on screen at 44 px: ' + (n ? JSON.stringify([Math.round(n.top), Math.round(n.bottom), Math.round(n.height)]) : 'none'));
    const t = txt.getBoundingClientRect();
    for (const ln of txt.querySelectorAll('.jline, .enline')) { const b = ln.getBoundingClientRect(); if (b.width && b.right > t.right + 1) out.push('a line runs past its box (' + Math.round(b.right) + ' > ' + Math.round(t.right) + ')'); }
    const ov = getComputedStyle(txt).overflowY;
    if (txt.scrollHeight > txt.clientHeight + 1 && !(ov === 'auto' || ov === 'scroll')) out.push('text taller than its box, which does not scroll');
    const groups = ((c.jp || '').match(/\{[^|}]+\|[^}]+\}/g) || []).length;
    const ruby = [...txt.querySelectorAll('ruby')].filter((rb) => { const rt = rb.querySelector('rt'); return rt && rt.textContent.trim(); }).length;
    if (ruby < groups) out.push('furigana on ' + ruby + ' of ' + groups + ' groups');
    // a blank to fill (［　］) stays on one line
    if (/［/.test(c.jp || '')) for (const bl of txt.querySelectorAll('.jline')) { const k = bl.querySelector('.jblank'); if (!k) out.push('the blank is not kept together'); else if (new Set([...k.getClientRects()].map((q) => Math.round(q.top / 4))).size !== 1) out.push('the blank is split across lines'); }
    RB.ui.dialogue.advance(true);
    await new Promise((res) => setTimeout(res, 20));
    return out;
  }, [l, o]);
  renders++;
  for (const x of r) problems.push(l.scene + '#' + l.i + ' (' + l.level + ') at ' + (o.view || ['same']).join('×') + ', ' + o.scale * 100 + '% ' + o.lead + '-led: ' + x);
}
// every line at the two hardest sizes, 200 % text
for (const view of [[320, 640], [844, 390]]) {
  await p.setViewportSize({ width: view[0], height: view[1] });
  for (const l of lines) await render(l, { scale: 2, lead: 'en' });
}
const allRenders = renders;
// the longest lines of each level at the eight sizes, 100 % and 200 %, English- and Japanese-led
for (const view of VIEWS) {
  await p.setViewportSize({ width: view[0], height: view[1] });
  for (const scale of [1, 2]) for (const lead of ['en', 'ja']) for (const l of longest) await render(l, { scale, lead });
}
await ctx.close(); await b.close(); srv.close();
console.log('level-dependent lines: ' + lines.length + ' (' + LV.map((P) => P + ' ' + lines.filter((l) => l.level === P).length).join(', ') + ' by the first level that sees them)');
console.log('renders: ' + allRenders + ' (every line at 320×640 and 844×390, 200 % text) + ' + (renders - allRenders) + ' (the ' + longest.length + ' longest at 8 sizes × 2 text sizes × 2 leads)');
for (const x of problems.slice(0, 30)) console.log('FAIL ' + x);
if (errors.length) console.log('FAIL page errors: ' + errors.slice(0, 3).join(' | '));
const fail = problems.length + (errors.length ? 1 : 0);
console.log(fail ? problems.length + ' problems' : 'all ok');
process.exit(fail ? 1 : 0);
