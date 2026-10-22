// RBN-QA-109 (Agnes 6342811938; Local CL-201): a reply's row is never squeezed below its own words. The replies are a
// height-limited flex column that scrolls, and its rows could shrink (down to their 52 px minimum) before the list
// scrolled, so with the palanquin's eight bilingual replies each row's second line ran past the row's lower edge into
// the gap and the next row. In Chromium on the built game, under the scene's own question line, at 1180×756 (Agnes's
// view), 1280×800, 390×844 and 844×390 (both with touch), for the palanquin's eight replies (seven stations and "Not
// now"), two replies (one of them a long wrapping line) and eight long wrapping replies; English or Japanese first,
// Word help on and off (the furigana is always drawn; Word help changes its markup), word spacing off, 100% and large
// text:
//  1. every row holds its words: as tall as its content, nothing past its edge, no row over the next;
//  2. nothing is squeezed: a reply's row is as tall among eight as among two, its words the same size;
//  3. the list scrolls where the replies don't fit, and wherever the list is tall enough to hold a reply, the last
//     reply ("Not now") can be scrolled into view and clicked or tapped, which ends the scene where you stand;
//  4. keyboard: Tab takes focus down the replies to the last, which (where the list can hold it) is scrolled into
//     view, and Enter chooses it;
//  5. the only view whose list cannot hold a reply is the landscape phone's, where the list sits beside the dialogue
//     sheet (with large text the sheet leaves it no height at all): a separate layout item, measured and printed here,
//     not changed by this fix;
//  6. no page errors.
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FLAGS = { departed: true, cr_called: true, cr_passed: true };
for (let n = 1; n <= 7; n++) FLAGS['cr_lamp' + n] = true;
const LONG = ['{峠|とうげ} の {上|うえ} の {茶屋|ちゃや} まで 、 {荷物|にもつ} を {全部|ぜんぶ} {持|も}って 、 {一人|ひとり} で {歩|ある}いて {行|い}きます 。 {夕方|ゆうがた} に は {着|つ}く でしょう',
  'I\'ll walk up to the teahouse at the top of the pass alone, carrying all the luggage. I should be there by evening'];
const LINE = 'narr: {駕籠|かご} の {担|かつ}ぎ{手|て} が 、 {待|ま}って いる 。 || The palanquin bearers are waiting.';
const SCENES = `
@scene t.two
${LINE}
!choice
* {追分|おいわけ} へ || To Oiwake -> end
* ${LONG[0]} || ${LONG[1]} -> end

@scene t.eight
${LINE}
!choice
${Array.from({ length: 7 }, () => `* ${LONG[0]} || ${LONG[1]} -> end`).join('\n')}
* やめて おく || Not now -> end
`;
const SETS = [
  { lead: 'en', lightbulb: true, spacing: true }, { lead: 'en', lightbulb: false, spacing: true },
  { lead: 'ja', lightbulb: true, spacing: true }, { lead: 'ja', lightbulb: false, spacing: false },
];

// the scene played to its replies: its line shown, then advanced
async function toChoices(p, scene) {
  await p.evaluate((sc) => { RB.script.run(sc); }, scene); // (started, not awaited: the scene waits on its reply)
  for (let i = 0; i < 80; i++) {
    const st = await p.evaluate(() => ({ ch: document.querySelectorAll('.choices:not(.hidden) .choice').length, d: RB.ui.dialogue.isOpen() && !!RB.ui.dialogue.shown() }));
    if (st.ch) break;
    if (st.d) await p.evaluate(() => RB.ui.dialogue.advance());
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(600); // the sheet settled, the list placed beside it
}
const measure = (p) => p.evaluate(() => {
  const box = document.querySelector('.choices:not(.hidden)');
  if (!box) return null;
  const rows = [...box.querySelectorAll('.choice')];
  const rr = rows.map((x) => {
    const r = x.getBoundingClientRect(), cs = getComputedStyle(x), c = x.querySelector('.c').getBoundingClientRect();
    const inner = r.bottom - parseFloat(cs.paddingBottom) - parseFloat(cs.borderBottomWidth);
    const jp = x.querySelector('ruby, .jline, .en');
    return { t: x.textContent.trim().slice(0, 24), h: +r.height.toFixed(1), top: r.top, bottom: r.bottom, over: +(c.bottom - inner).toFixed(1), spill: x.scrollHeight - x.clientHeight, fs: jp ? getComputedStyle(jp).fontSize : null };
  });
  const bx = box.getBoundingClientRect();
  return { rows: rr, n: rr.length, boxH: Math.round(bx.height), room: box.clientHeight >= rows[rows.length - 1].offsetHeight, scroll: box.scrollHeight - box.clientHeight, overlap: rr.slice(1).filter((x, i) => x.top < rr[i].bottom - 0.5).length };
});
// the last reply scrolled to and clicked (or tapped): the scene ends, nothing warped
async function lastReply(p, touch) {
  const at = await p.evaluate(() => {
    const box = document.querySelector('.choices:not(.hidden)'), last = [...box.querySelectorAll('.choice')].pop();
    box.scrollTop = box.scrollHeight;
    const r = last.getBoundingClientRect(), bx = box.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, inside: r.top >= bx.top - 0.5 && r.bottom <= bx.bottom + 0.5 };
  });
  await p.waitForTimeout(150);
  if (touch) await p.touchscreen.tap(at.x, at.y); else await p.mouse.click(at.x, at.y);
  await p.waitForTimeout(400);
  const after = await p.evaluate(() => ({ map: RB.world.W.map.id, run: RB.script.isRunning(), shown: !!document.querySelector('.choices:not(.hidden) .choice') }));
  await settle(p);
  return { inside: at.inside, ended: !after.run && !after.shown && after.map === 'cr.oiwake' };
}
// whatever happened, the scene is ended before the next menu: its last reply chosen through the page if still shown
async function settle(p) {
  for (let i = 0; i < 20; i++) {
    const st = await p.evaluate(() => {
      const rows = [...document.querySelectorAll('.choices:not(.hidden) .choice')];
      if (rows.length) rows[rows.length - 1].click();
      else if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance();
      return RB.script.isRunning();
    });
    if (!st) return;
    await p.waitForTimeout(150);
  }
}

const VIEWS = [[1180, 756], [1280, 800], [390, 844, true], [844, 390, true]];
const bad = [], squeeze = [], reach = [], keys = [], noRoom = [];
let runs = 0, scrolled = 0;
const allErrors = [];
for (const [w, h, touch] of VIEWS) {
  const { p, errors: e } = await page(b, url, { viewport: { width: w, height: h }, touch: !!touch, mobile: !!touch });
  await p.evaluate(([flags, src]) => {
    const s = RB.game.debugStart('cr.oiwake', 17, 13, { comp: 'nao', dir: 'down', flags });
    // the maps' arrival scenes taken as seen, so a scene ending here starts nothing else
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.script.add(src, 't');
  }, [FLAGS, SCENES]);
  await p.waitForTimeout(900);
  for (const set of SETS) for (const scale of [1, 1.4]) {
    await p.evaluate(([set, scale]) => { Object.assign(RB.game.settings, set, { textScale: scale }); RB.game.applySettings(); }, [set, scale]);
    const tag = `${w}x${h} ${set.lead}${set.lightbulb ? '' : ' no-help'}${set.spacing ? '' : ' no-spacing'} ${scale * 100}%`;
    const got = {};
    for (const sc of ['cr.ride', 't.two', 't.eight']) {
      await toChoices(p, sc);
      const m = await measure(p);
      runs++;
      if (!m) { bad.push(tag + ' ' + sc + ': no replies'); continue; }
      got[sc] = m;
      if (m.n !== (sc === 't.two' ? 2 : 8)) bad.push(`${tag} ${sc}: ${m.n} replies, not this scene's`);
      if (!m.room) noRoom.push(`${tag} ${sc}: list ${m.boxH} px, its last reply ${m.rows[m.n - 1].h} px`);
      const off = m.rows.filter((x) => x.over > 1 || x.spill > 1);
      if (off.length || m.overlap) bad.push(`${tag} ${sc}: ${off.length} rows past their edge (worst ${Math.max(0, ...off.map((x) => x.over))} px), ${m.overlap} over the next (${m.rows.map((x) => x.h).join('/')})`);
      if (m.scroll > 0) scrolled++;
      if (sc === 'cr.ride' && scale === 1 && set.lightbulb && set.spacing) {
        // the keyboard: Tab down to the last reply; it is scrolled into view; Enter chooses it
        let k = 0, onLast = false;
        for (; k < 300 && !onLast; k++) {
          await p.keyboard.press('Tab');
          onLast = await p.evaluate(() => { const rows = [...document.querySelectorAll('.choices:not(.hidden) .choice')]; return document.activeElement === rows[rows.length - 1]; });
        }
        const seen = await p.evaluate(() => { const box = document.querySelector('.choices:not(.hidden)'), r = document.activeElement.getBoundingClientRect(), bx = box.getBoundingClientRect(); return r.top >= bx.top - 0.5 && r.bottom <= bx.bottom + 0.5; });
        await p.keyboard.press('Enter');
        await p.waitForTimeout(400);
        const done = await p.evaluate(() => !RB.script.isRunning() && !document.querySelector('.choices:not(.hidden) .choice') && RB.world.W.map.id === 'cr.oiwake');
        await settle(p);
        if (!(onLast && (seen || !m.room) && done)) keys.push({ tag, onLast, presses: k, seen, room: m.room, done });
        continue;
      }
      const r = await lastReply(p, touch);
      if (m.room && !(r.inside && r.ended)) reach.push({ tag, sc, ...r });
    }
    // the same reply among eight and among two: the same height, its words the same size
    const a = got['cr.ride'] && got['cr.ride'].rows[0], c = got['t.two'] && got['t.two'].rows[0];
    const la = got['t.eight'] && got['t.eight'].rows[0], lc = got['t.two'] && got['t.two'].rows[1];
    if (!a || !c || Math.abs(a.h - c.h) > 1 || a.fs !== c.fs || !la || !lc || Math.abs(la.h - lc.h) > 1 || la.fs !== lc.fs) squeeze.push({ tag, short: [a && a.h, c && c.h], long: [la && la.h, lc && lc.h], fs: [a && a.fs, c && c.fs] });
  }
  allErrors.push(...e);
  await p.close();
}
ok(runs === VIEWS.length * SETS.length * 2 * 3 && !bad.length, `every row holds its words: as tall as its content, nothing past its edge, none over the next (${runs} menus${bad.length ? '; ' + bad.slice(0, 6).join(' | ') : ''})`);
ok(!squeeze.length, 'nothing is squeezed: a reply is as tall among eight as among two, its words the same size' + (squeeze.length ? ' (' + JSON.stringify(squeeze.slice(0, 4)) + ')' : ''));
ok(scrolled > 0 && !reach.length, `where the replies don't fit the list scrolls (${scrolled} menus), and the last reply can be scrolled to and clicked or tapped, ending the scene where you stand` + (reach.length ? ' (' + JSON.stringify(reach.slice(0, 4)) + ')' : ''));
ok(!keys.length, 'keyboard: Tab takes focus down to the last reply, which is in view, and Enter chooses it, at each view' + (keys.length ? ' (' + JSON.stringify(keys) + ')' : ''));
console.log('the lists that cannot hold a reply (' + noRoom.length + '): ' + noRoom.slice(0, 8).join(' | '));
ok(noRoom.every((x) => x.startsWith('844x390 ')), 'the only view whose list cannot hold a reply is the landscape phone\'s, beside the dialogue sheet (a separate layout item)');
ok(allErrors.length === 0, 'no page errors' + (allErrors.length ? ' (' + allErrors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
