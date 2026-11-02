// The press's "Hide the English" (Agnes 6571318983; Local CL-637; Cloud CC-474): the button under Compose hid the English
// of the chosen blocks only, and the blocks offered in an open slot kept theirs. Now one button governs every translation
// in Compose. In Chromium on the built game, on throwaway journeys (never a real save), at the press, for a notice and
// for a story:
//  1. at the start the English is shown, and every block offered has its own;
//  2. hidden with a slot open: the same slot stays open, the same blocks are offered, and none has its English;
//  3. picking while hidden: the block is chosen, the next slot opens, and nothing in Compose has its English;
//  4. switching back to a slot and changing its block while hidden: its offers have none, the block changes;
//  5. shown again: every chosen block and every offer has its own English, and no chosen block has changed; hidden
//     again, none has, and still no chosen block has changed;
//  6. the rest of the page composed while hidden: no English and no bare kanji in Compose;
//  7. the proof: every line, each with its English (the proof is always bilingual, as before);
//  8. printed (ink, press, peel) and posted at the board: the record holds the blocks chosen, as before;
//  9. the next visit: "Your last page" in Japanese only, as before; revising it, the English is shown again at the
//     start (nothing is saved), and hidden, none in Compose;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/press_english.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const tick = (p) => p.waitForTimeout(120);
const click = async (p, sel) => { await p.evaluate((sel) => { const el = document.querySelector(sel); if (!el) throw new Error('missing ' + sel); el.click(); }, sel); await tick(p); };

// a twelve-chapter journey in Chapter 4, at the press (as tests/e2e/manybridge2.mjs)
async function start(p) {
  await p.evaluate(() => {
    const s = RB.game.debugStart('mp.pressroom', 5, 6, { comp: 'ren', flags: { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb_ichi_found: true, mb1_done: true, mp_arrived: true, mp_sobe_met: true, mp_press_open: true } });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
  });
}
// Compose as drawn: the button's label, and each slot's chosen block and offers with their English (null when absent)
const snap = (p) => p.evaluate(() => {
  const sh = document.querySelector('.pr-sheet');
  const en = (el) => { const e = el && el.querySelector('.pr-en'); return e ? e.textContent : null; };
  const button = sh.querySelector('[data-a=en]');
  const slots = [...sh.querySelectorAll('.pr-slot')].map((li) => {
    const cur = li.querySelector('.pr-cur');
    return {
      slot: li.querySelector('[data-a=slot]').dataset.v, open: li.classList.contains('open'),
      chosen: cur && !cur.classList.contains('muted') ? { jp: cur.querySelector('.pr-jp').textContent, en: en(cur) } : null,
      offers: [...li.querySelectorAll('.pr-opt')].map((o) => ({ id: o.dataset.v, on: o.classList.contains('on'), en: en(o) })),
    };
  });
  return { label: button ? button.textContent.trim() : null, slots, en: sh.querySelectorAll('.pr-slots .pr-en').length, open: slots.filter((x) => x.open).map((x) => x.slot) };
});
const english = (p, ids) => p.evaluate((ids) => ids.map((i) => RB.press.block(i).en), ids);
const bareKanji = (p) => p.evaluate(() => {
  const out = [];
  const w = document.createTreeWalker(document.querySelector('.pr-sheet'), NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    if (!/[一-鿿々]/.test(n.nodeValue)) continue;
    const el = n.parentElement;
    if (!el || !el.getClientRects().length || el.closest('.sr, rt, input, textarea, [hidden], [aria-hidden="true"]')) continue;
    if (!el.closest('ruby')) out.push(n.nodeValue.trim().slice(0, 30));
  }
  return out;
});
// every offer in the open slot has its own English
async function offersHaveEnglish(p, v) {
  const o = v.slots.find((x) => x.open);
  if (!o || !o.offers.length) return false;
  const want = await english(p, o.offers.map((x) => x.id));
  return o.offers.every((x, i) => x.en === want[i]);
}
const noOfferEnglish = (v) => { const o = v.slots.find((x) => x.open); return !!o && o.offers.length >= 2 && o.offers.every((x) => x.en === null); };
const chosenJp = (v) => v.slots.map((x) => (x.chosen ? x.chosen.jp : null));

for (const kind of ['notice', 'story']) {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p);
  await p.evaluate(() => { window.__done = null; RB.activity.launch('press', { source: 'world-prop', kind: null }).then((r) => { window.__done = r || {}; }); });
  await p.waitForSelector('.pr-sheet [data-a=kind]');
  await click(p, '.pr-sheet [data-a=kind][data-v=' + kind + ']');
  await p.waitForSelector('.pr-sheet .pr-slots');
  const slots = await p.evaluate((kind) => RB.press.kind(kind).slots, kind);
  const picks = {};
  const slotBtn = (s) => '.pr-sheet [data-a=slot][data-v="' + s + '"]';
  const pick = async (id) => { await click(p, '.pr-sheet .pr-opt[data-v="' + id + '"]'); const blk = await p.evaluate((id) => RB.press.block(id).slot, id); picks[blk] = id; };

  // 1. at the start
  await click(p, slotBtn(slots[0]));
  const v1 = await snap(p);
  ok(v1.label === 'Hide the English' && flat(v1.open) === flat([slots[0]]) && v1.slots[0].offers.length >= 2 && (await offersHaveEnglish(p, v1)),
    '1 ' + kind + ', at the start: "Hide the English", and every block offered has its own English ' + flat({ label: v1.label, open: v1.open, n: v1.slots[0].offers.length }));

  // 2. hidden with a slot open
  await click(p, '.pr-sheet [data-a=en]');
  const v2 = await snap(p);
  ok(v2.label === 'Show the English' && flat(v2.open) === flat([slots[0]]) && flat(v2.slots[0].offers.map((x) => x.id)) === flat(v1.slots[0].offers.map((x) => x.id)) && noOfferEnglish(v2) && v2.en === 0,
    '2 ' + kind + ', hidden with a slot open: the same slot open, the same blocks offered, none with its English ' + flat({ label: v2.label, open: v2.open, en: v2.en }));

  // 3. picking while hidden
  await pick(v2.slots[0].offers[0].id);
  const v3a = await snap(p);
  await pick(v3a.slots[1].offers[1].id);
  const v3 = await snap(p);
  ok(!!v3a.slots[0].chosen && v3a.slots[0].chosen.en === null && flat(v3a.open) === flat([slots[1]]) && noOfferEnglish(v3a) && v3a.en === 0 &&
    !!v3.slots[1].chosen && flat(v3.open) === flat([slots[2]]) && noOfferEnglish(v3) && v3.en === 0,
    '3 ' + kind + ', two blocks picked while hidden: each chosen, the next slot opens, and nothing in Compose has its English ' + flat({ open: [v3a.open, v3.open], en: [v3a.en, v3.en] }));

  // 4. back to the first slot, and its block changed, while hidden
  await click(p, slotBtn(slots[0]));
  const v4a = await snap(p);
  const was = picks[slots[0]];
  const other = v4a.slots[0].offers.find((x) => x.id !== was);
  const before = v4a.slots[0].chosen && v4a.slots[0].chosen.jp;
  await pick(other.id);
  const v4 = await snap(p);
  ok(flat(v4a.open) === flat([slots[0]]) && noOfferEnglish(v4a) && flat(v4a.slots[0].offers.filter((x) => x.on).map((x) => x.id)) === flat([was]) &&
    !!v4.slots[0].chosen && v4.slots[0].chosen.jp !== before && v4.slots[0].chosen.en === null && v4.en === 0,
    '4 ' + kind + ', back to the first slot while hidden: its offers have no English, and its block changes ' + flat({ open: v4a.open, was, now: other.id, en: v4.en }));

  // 5. shown again, then hidden again: no chosen block changes
  const kept = chosenJp(v4);
  await click(p, '.pr-sheet [data-a=en]');
  const v5 = await snap(p);
  const ids = slots.filter((s) => picks[s]);
  const want = await english(p, ids.map((s) => picks[s]));
  const chosenEn = ids.map((s) => v5.slots[slots.indexOf(s)].chosen.en);
  await click(p, '.pr-sheet [data-a=en]');
  const v5b = await snap(p);
  ok(v5.label === 'Hide the English' && flat(chosenJp(v5)) === flat(kept) && flat(chosenEn) === flat(want) && v5.open.length === 1 && (await offersHaveEnglish(p, v5)) &&
    v5b.label === 'Show the English' && flat(chosenJp(v5b)) === flat(kept) && v5b.en === 0,
    '5 ' + kind + ', shown again: every chosen block and offer has its English and none changed; hidden again: none has, and none changed ' + flat({ labels: [v5.label, v5b.label], chosenEn, en: v5b.en }));

  // 6. the rest composed while hidden
  let enSeen = 0, kanji = [];
  for (let i = 0; i < slots.length + 2; i++) {
    const ready = await p.evaluate(() => { const x = document.querySelector('.pr-sheet [data-a=proof]'); return !!x && !x.disabled; });
    if (ready) break;
    let v = await snap(p);
    if (!v.open.length) { await click(p, slotBtn(v.slots.find((x) => !x.chosen).slot)); v = await snap(p); }
    enSeen += v.en;
    kanji = kanji.concat(await bareKanji(p));
    await pick(v.slots.find((x) => x.open).offers[0].id);
  }
  const v6 = await snap(p);
  enSeen += v6.en;
  ok(slots.every((s) => picks[s]) && v6.slots.every((x) => x.chosen && x.chosen.en === null) && enSeen === 0 && kanji.length === 0,
    '6 ' + kind + ', the rest composed while hidden: no English and no bare kanji in Compose ' + flat({ picks, enSeen, kanji: kanji.slice(0, 3) }));

  // 7. the proof
  await click(p, '.pr-sheet [data-a=proof]');
  await p.waitForSelector('.pr-sheet .pr-paper');
  const proof = await p.evaluate(() => [...document.querySelectorAll('.pr-sheet .pr-paper .pr-page li')].map((li) => { const e = li.querySelector('.pr-en'); return e ? e.textContent : null; }));
  const all = await english(p, slots.map((s) => picks[s]));
  ok(flat(proof) === flat(all),
    '7 ' + kind + ', the proof: every line, each with its English, as before ' + flat({ lines: proof.length }));

  // 8. printed and posted
  await click(p, '.pr-sheet [data-a=print]');
  for (const step of ['ink', 'press', 'peel']) { await p.waitForSelector('.pr-sheet [data-a=' + step + ']'); await click(p, '.pr-sheet [data-a=' + step + ']'); }
  await p.waitForSelector('.pr-sheet [data-a=where][data-v=board]');
  await click(p, '.pr-sheet [data-a=where][data-v=board]');
  await p.waitForSelector('.pr-sheet .pr-readers');
  const rec = await p.evaluate(() => { const r = RB.press.of(RB.game.s); return r && { kind: r.kind, blocks: r.blocks, version: r.version }; });
  ok(rec && rec.kind === kind && rec.version === 1 && flat(slots.map((s) => rec.blocks[s])) === flat(slots.map((s) => picks[s])),
    '8 ' + kind + ', printed and posted: the record holds the blocks chosen, as before ' + flat({ rec }));

  // 9. the next visit
  await click(p, '.pr-sheet [data-a=again]');
  await p.waitForSelector('.pr-sheet [data-a=revise]');
  const last = await p.evaluate(() => ({ lines: document.querySelectorAll('.pr-sheet .pr-last li').length, en: document.querySelectorAll('.pr-sheet .pr-last .pr-en').length }));
  await click(p, '.pr-sheet [data-a=revise]');
  await p.waitForSelector('.pr-sheet .pr-slots');
  await click(p, slotBtn(slots[0]));
  const v9 = await snap(p);
  const revEn = v9.slots.map((x) => x.chosen && x.chosen.en);
  await click(p, '.pr-sheet [data-a=en]');
  const v9b = await snap(p);
  ok(last.lines === slots.length && last.en === 0 && v9.label === 'Hide the English' && flat(revEn) === flat(all) && (await offersHaveEnglish(p, v9)) && v9b.label === 'Show the English' && v9b.en === 0 && noOfferEnglish(v9b),
    '9 ' + kind + ', the next visit: "Your last page" in Japanese only; revising it, the English shown at the start, and hidden, none in Compose ' + flat({ last, labels: [v9.label, v9b.label], en: v9b.en }));

  ok(!errors.length, kind + ', no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

console.log(`\npress_english: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
