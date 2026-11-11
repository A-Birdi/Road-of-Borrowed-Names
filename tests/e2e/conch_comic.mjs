// The conches' comics on screen (Kotonoha; Agnes 6550310863 and 6550523690; Local CL-576; Cloud CC-417). In Chromium on
// the built game, the real sheet (the conch hook), every chip and button clicked. For each of the six lines, on a fresh
// sheet with the other five placed right:
//  1. incomplete (only its speaker chosen): "Put it together" stays disabled;
//  2. placed exactly the wrong way its comic describes: the comic, then the clue;
//  3. edited: its judgment is cleared until put together again; another single-field mistake: the clue alone (for c2,
//     Chitose → Yoshi: Agnes's native case);
//  4. wrong in both fields: the clue alone;
//  5. right: ✓, and the reconstruction done;
// before them, the page carries the six tags as agreed (0); after, a1 with its tag missing or malformed (none, null, a
// string, an array, an empty object, both fields, an unknown field, someone not among the people, the right person):
// placed exactly the boatman → Chitose, the clue alone, never the comic; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/conch_comic.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const ID = 'ko.s_first';

async function start(p) {
  await p.evaluate(() => {
    const s = RB.game.debugStart('ko.hall', 7, 8, { edition: RB.edition.forNew(), comp: 'ren' });
    s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false; RB.game.applySettings();
  });
  await p.waitForTimeout(200);
}
const open = async (p) => { await p.evaluate((id) => { window.__sh = null; RB.hooks.shells([id]).then(() => { window.__sh = RB.game.s.vars._shells; }); }, ID); await p.waitForSelector('.sh-sheet .sh-frag'); };
const close = async (p) => { await p.evaluate(() => document.querySelector('.sh-cancel').click()); await p.waitForFunction(() => window.__sh); };
const chip = (p, f, r, who) => p.evaluate(([f, r, who]) => { const el = document.querySelector('.sh-chip[data-f="' + f + '"][data-r="' + r + '"][data-p="' + who + '"]'); if (!el) throw new Error('no chip ' + f + r + who); el.click(); }, [f, r, who]);
const place = async (p, f, who, to) => { await chip(p, f, 'who', who); await chip(p, f, 'to', to); };
const go = (p) => p.evaluate(() => { const g = document.querySelector('.sh-go'); if (!g || g.disabled) return false; g.click(); return true; });
// a line's feedback as the player reads it (the readings over any kanji left out)
const read = (p, f) => p.evaluate((f) => {
  const fr = document.querySelector('.sh-frag[data-f="' + f + '"]');
  const w = fr.querySelector('.sh-why');
  let why = null;
  if (w) { const c = w.cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); why = c.textContent.replace(/\s+/g, ' ').trim(); }
  const g = document.querySelector('.sh-go');
  return { why, ok: !!fr.querySelector('.sh-ok'), done: !!document.querySelector('.sh-done'), goOff: g ? g.disabled : null };
}, f);

const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
await start(p);
const D = await p.evaluate((id) => { const d = RB.content.shells[id]; return { people: d.people.map((x) => x.id), frags: d.frags.map((f) => ({ id: f.id, who: f.who, to: f.to, comic: f.comic.en, cue: f.cue.en.replace(/\{([^|}]+)\|[^}]+\}/g, '$1'), tag: f.comicIf })) }; }, ID);
const has = (why, s) => !!why && why.replace(/\s+/g, '').includes(s.replace(/\s+/g, ''));
// the six tags, as agreed (held here, so the test also runs on a page from before them)
const TAGS = { a1: { who: 'sendo' }, a2: { who: 'sendo' }, b1: { who: 'yoshi' }, b2: { to: 'yoshi' }, c1: { who: 'chitose' }, c2: { to: 'sendo' } };
ok(flat(D.frags.map((f) => [f.id, f.tag])) === flat(Object.entries(TAGS)), '0 the page carries the six tags, as agreed ' + flat(D.frags.map((f) => f.tag)));

for (const f of D.frags) {
  const tag = TAGS[f.id], k = Object.keys(tag)[0], other = k === 'who' ? 'to' : 'who';
  const exact = { [k]: tag[k], [other]: f[other] };
  // another single-field mistake in the tagged field, not a line to oneself (c2: Chitose → Yoshi), and one wrong in
  // both fields
  const alt = f.id === 'c2' ? 'yoshi' : (D.people.find((x) => x !== f[k] && x !== tag[k] && x !== f[other]) || D.people.find((x) => x !== f[k] && x !== tag[k]));
  const single = { [k]: alt, [other]: f[other] };
  const both = { who: D.people.find((x) => x !== f.who), to: D.people.find((x) => x !== f.to && x !== D.people.find((y) => y !== f.who)) || D.people.find((x) => x !== f.to) };
  if (both.who === f.who || both.to === f.to) both.to = D.people.find((x) => x !== f.to && x !== f.who && x !== both.who) || both.to;
  await open(p);
  for (const g of D.frags) if (g.id !== f.id) await place(p, g.id, g.who, g.to);
  // 1. incomplete
  await chip(p, f.id, 'who', exact.who);
  const inc = await read(p, f.id);
  // 2. the exact pair
  await chip(p, f.id, 'to', exact.to);
  const went = await go(p);
  const ex = await read(p, f.id);
  // 3. edited: cleared until put together; another single-field mistake
  await place(p, f.id, single.who, single.to);
  const cleared = await read(p, f.id);
  await go(p);
  const si = await read(p, f.id);
  // 4. both wrong
  await place(p, f.id, both.who, both.to);
  await go(p);
  const bo = await read(p, f.id);
  // 5. right
  await place(p, f.id, f.who, f.to);
  await go(p);
  const ri = await read(p, f.id);
  await close(p);
  ok(inc.goOff === true && !inc.why && !inc.ok, f.id + ' 1 incomplete: nothing to put together yet ' + flat(inc));
  ok(went && has(ex.why, f.comic) && has(ex.why, f.cue) && ex.why.indexOf(f.comic.slice(0, 20)) === 0 && !ex.done, f.id + ' 2 placed ' + exact.who + ' → ' + exact.to + ' (its comic\'s placing): the comic, then the clue ' + flat({ why: ex.why }));
  ok(!cleared.why && !cleared.ok && cleared.goOff === false, f.id + ' 3 edited: its judgment cleared until put together again ' + flat(cleared));
  ok(si.why && !has(si.why, f.comic) && has(si.why, f.cue), f.id + ' 3 ' + single.who + ' → ' + single.to + ': the clue alone ' + flat({ why: si.why }));
  ok(bo.why && !has(bo.why, f.comic) && has(bo.why, f.cue) && both.who !== f.who && both.to !== f.to, f.id + ' 4 ' + both.who + ' → ' + both.to + ' (both wrong): the clue alone ' + flat({ why: bo.why }));
  ok(ri.ok && !ri.why && ri.done, f.id + ' 5 right: ✓, and the reconstruction done ' + flat(ri));
}

// ---- a1's tag missing or malformed
const BAD = [['no comicIf', '__delete'], ['null', null], ['a string', 'sendo'], ['an array', ['who', 'sendo']], ['an empty object', {}], ['both fields', { who: 'sendo', to: 'chitose' }],
  ['an unknown field', { by: 'sendo' }], ['someone not among the people', { who: 'tanaka' }], ['the right person', { who: 'yoshi' }]];
const a1 = D.frags.find((f) => f.id === 'a1');
for (const [what, tag] of BAD) {
  await p.evaluate(([id, tag]) => { const f = RB.content.shells[id].frags.find((x) => x.id === 'a1'); window.__keepTag = window.__keepTag || f.comicIf; if (tag === '__delete') delete f.comicIf; else f.comicIf = tag; }, [ID, tag]);
  await open(p);
  for (const g of D.frags) if (g.id !== 'a1') await place(p, g.id, g.who, g.to);
  await place(p, 'a1', 'sendo', 'chitose');
  await go(p);
  const r = await read(p, 'a1');
  await close(p);
  ok(r.why && !has(r.why, a1.comic) && has(r.why, a1.cue), 'a1 with ' + what + ' as its tag, placed the boatman → Chitose: the clue alone ' + flat({ why: r.why }));
}
await p.evaluate((id) => { RB.content.shells[id].frags.find((x) => x.id === 'a1').comicIf = window.__keepTag; }, ID);
ok(!errors.length, 'no page errors ' + errors.join('; '));
await p.context().close();

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
