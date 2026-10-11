// The letters activities (src/ui/75_activities.js `letters`: Reedwake's soaked letters, Saltglass's letters without
// addresses, the Cinder Orchard's festival invitations, Snowbell's letters with no names), against the built
// index.html in Chromium with a synthetic campaign (never a real save). Authors list the letters and their recipients
// in step, so where the right recipient sits must never give the answer away (Robin's report: "letter 1 is option 1,
// letter 2 is option 2"). For each activity, two sittings, every letter delivered with the real mouse:
//  - every letter and every recipient is offered (nothing lost or doubled);
//  - the right recipient does not walk down the list with the letters, and the list is dealt again for each letter;
//  - showing the translation redraws the letter without dealing the list again;
//  - a second sitting comes in a different order; the activity ends delivered, with no page error.
// Usage: node tests/e2e/letters_order.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 120s')), 120000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 900)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const ACTS = [['rw.a_letters', 'rw.village', 22, 30], ['sg.a_post', 'sg.harbor', 20, 22], ['co.a_letters', 'co.village', 20, 18], ['sb.a_letters', 'sb.hamlet', 20, 17]];

// one sitting: for each letter, the recipients as shown and where the right one sits; the translation shown on the
// first letter (the list must not be dealt again); every letter delivered by clicking its recipient
async function sitting(p, id) {
  await p.evaluate((id) => { window.__done = null; RB.activities.run(id).then((r) => { window.__done = r; }); }, id);
  const seen = [];
  for (let n = 0; n < 12; n++) {
    await p.waitForSelector('.recips [data-to]');
    const shown = await p.evaluate((id) => {
      const a = RB.content.activities[id];
      const text = document.querySelector('.letter-jp').textContent.replace(/\s+/g, '');
      const plain = (jp) => { const d = document.createElement('div'); d.innerHTML = RB.ui.jhtml(jp); return d.textContent.replace(/\s+/g, ''); };
      const tierOf = (L) => { for (const k of ['F', 'E', 'I', 'A']) if (L.text[k] && plain(L.text[k].jp) === text) return true; return L.text.jp && plain(L.text.jp) === text; };
      const L = a.letters.find(tierOf);
      return { to: L ? L.to : null, index: L ? a.letters.indexOf(L) : -1, recips: [...document.querySelectorAll('.recips [data-to]')].map((x) => x.getAttribute('data-to')) };
    }, id);
    assert(shown.to, id + ': the letter on screen is one of the activity\'s letters');
    if (n === 0 && await p.$('[data-tr]')) {
      await p.click('[data-tr]');
      await p.waitForTimeout(100);
      const again = await p.evaluate(() => [...document.querySelectorAll('.recips [data-to]')].map((x) => x.getAttribute('data-to')));
      assert(JSON.stringify(again) === JSON.stringify(shown.recips), id + ': showing the translation dealt the list again: ' + again + ' vs ' + shown.recips);
    }
    seen.push(Object.assign(shown, { at: shown.recips.indexOf(shown.to) }));
    await p.click('.recips [data-to="' + shown.to + '"]');
    await p.waitForSelector('[data-next]');
    const last = await p.evaluate(() => /Done/.test(document.querySelector('[data-next]').textContent));
    await p.click('[data-next]');
    if (last) break;
  }
  await p.waitForFunction(() => window.__done, null, { timeout: 5000 });
  return { seen, done: await p.evaluate(() => window.__done) };
}

for (const [id, map, x, y] of ACTS) {
  await test(id + ': letters and recipients dealt, not in their written order; two sittings differ', async () => {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await p.evaluate(([map, x, y]) => { RB.game.debugStart(map, x, y, { comp: 'nao', flags: { departed: true } }); RB.game.settings.lead = 'en'; }, [map, x, y]);
    const authored = await p.evaluate((id) => { const a = RB.content.activities[id]; return { letters: a.letters.map((L) => L.to), recips: a.recipients.map((r) => r.id) }; }, id);
    const one = await sitting(p, id), two = await sitting(p, id);
    for (const [k, S] of [['first', one], ['second', two]]) {
      assert(S.done && S.done.ok, id + ' ' + k + ': the sitting ended delivered: ' + JSON.stringify(S.done));
      assert(JSON.stringify(S.seen.map((s) => s.to).sort()) === JSON.stringify(authored.letters.slice().sort()), id + ' ' + k + ': every letter once: ' + S.seen.map((s) => s.to));
      for (const s of S.seen) assert(JSON.stringify(s.recips.slice().sort()) === JSON.stringify(authored.recips.slice().sort()), id + ' ' + k + ': every recipient offered once: ' + s.recips);
      // the right recipient does not walk down the list as the letters go by
      const walk = S.seen.every((s, n) => s.at === n);
      assert(!walk, id + ' ' + k + ': the right recipient sat at row n for letter n: ' + S.seen.map((s) => s.at));
      assert(new Set(S.seen.map((s) => s.recips.join(','))).size > 1, id + ' ' + k + ': the list is dealt again for each letter');
    }
    const order = (S) => S.seen.map((s) => s.to + ':' + s.recips.join(',')).join('|');
    assert(order(one) !== order(two), id + ': the second sitting came in the same order as the first');
    console.log('  ' + id + ': right recipient at rows ' + one.seen.map((s) => s.at + 1).join(',') + ' then ' + two.seen.map((s) => s.at + 1).join(',') + '; letters in order ' + one.seen.map((s) => s.index + 1).join(',') + ' then ' + two.seen.map((s) => s.index + 1).join(','));
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  });
}

console.log(pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
