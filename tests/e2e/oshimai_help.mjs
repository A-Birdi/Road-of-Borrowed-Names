// おしまい in word help (Agnes 6547670899, 6548029795; Local CL-562, CL-563; Cloud CC-404, CC-406). In Chromium on the
// built game, on throwaway journeys (never a real save):
//  1. word help on a real line (Suzu's company reply, shown in the dialogue strip): pressing おしまい shows one word,
//     "the end; that's all", oshimai, with no parts and no "sisters"; "Add to notebook" notes w:おしまい|おしまい;
//  2. an older save with the card the bug wrote (and a genuine 姉妹 card), written to a test slot and loaded through
//     the game's own load: "Words you noted" shows おしまい as "the end; that's all", and "sisters" only for 姉妹;
//  3. an older save with that card and a Kansai card for おしまい: one おしまい entry in "Words you noted", the Kansai
//     one, and the count beside the page agrees;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/oshimai_help.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const END = "the end; that's all";
const flat = (x) => JSON.stringify(x);

async function begin() {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => {
    RB.game.debugStart('sb.hamlet', 10, 28, { edition: RB.edition.forNew(), comp: 'suzu' });
    const st = RB.game.settings; st.lead = 'ja'; st.secondary = 'always'; st.textSpeed = 'instant'; RB.game.applySettings();
    RB.save.autosave = async () => {};
  });
  return { p, errors };
}

// 1: word help on a real line
{
  const { p, errors } = await begin();
  await p.evaluate(() => {
    const r = RB.content.company.mem.lq1.reply.suzu;
    RB.ui.dialogue.say({ sceneId: 'test.oshimai', who: 'suzu', jp: r.jp, en: r.en });
  });
  await p.waitForFunction(() => [...document.querySelectorAll('.dlg .main .jline .jt[data-i]')].some((e) => e.textContent.trim() === 'おしまい'));
  await new Promise((r) => setTimeout(r, 400));
  const box = await p.evaluate(() => { const e = [...document.querySelectorAll('.dlg .main .jline .jt[data-i]')].find((x) => x.textContent.trim() === 'おしまい'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.mouse.click(box.x, box.y);
  await p.waitForSelector('#overlay .help', { timeout: 3000 }).catch(() => {});
  const card = await p.evaluate(() => { const h = document.querySelector('#overlay .help'); return h ? { hw: (h.querySelector('.hw') || {}).textContent || '', rom: (h.querySelector('.rom') || {}).textContent || '', text: h.textContent } : null; });
  ok(!!card && card.hw === 'おしまい' && card.rom === 'oshimai' && card.text.includes(END) && !/sisters|姉妹|Parts:/.test(card.text),
    '1 word help on Suzu\'s line: おしまい, oshimai, "the end; that\'s all", no parts and no "sisters" ' + flat(card && { hw: card.hw, rom: card.rom, text: card.text.slice(0, 160) }));
  await p.click('#overlay .help [data-a="note"]');
  const nb = await p.evaluate(() => RB.game.s.notebook.filter((n) => n.kind === 'word').map((n) => ({ id: n.id, m: n.m, dia: n.dia || null })));
  ok(flat(nb) === flat([{ id: 'w:おしまい|おしまい', m: END, dia: null }]), '1 "Add to notebook" notes w:おしまい|おしまい, "the end; that\'s all" ' + flat(nb));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2–3: older saves, loaded through the game's own load, and "Words you noted"
const BUG = { kind: 'word', id: 'w:姉妹|おしまい', surface: 'おしまい', reading: 'おしまい', m: 'sisters', t: 1700000000000 };
const SIS = { kind: 'word', id: 'w:姉妹|しまい', surface: '姉妹', reading: 'しまい', m: 'sisters', t: 1700000000700 };
const KAN = { kind: 'word', id: 'w:おしまい|おしまい', surface: 'おしまい', reading: 'おしまい', m: END, t: 1700000000600, dia: 'kansai' };
async function loadWith(p, nb) {
  return p.evaluate(async (nb) => {
    const s = RB.util.deepClone(RB.game.s);
    s.notebook = nb;
    RB.save.setCurrent(6, 0);
    await RB.save.writeSlot(6, s, { force: true });
    await RB.game.loadCampaign(6, 'manual');
    await new Promise((r) => setTimeout(r, 400));
    RB.ui.menu.open('words');
    await new Promise((r) => setTimeout(r, 200));
    const sub = document.querySelector('.folio [data-sub="noted"]');
    if (sub) sub.click();
    await new Promise((r) => setTimeout(r, 300));
    const entries = [...document.querySelectorAll('.folio .entries.notes .entry')].map((e) => ({ w: ((e.querySelector('.written') || {}).textContent || '').replace(/\s/g, ''), t: (e.querySelector('.t') || {}).textContent || '' }));
    const count = ((sub && sub.textContent) || '').match(/\d+/);
    return { sub: !!sub, entries, count: count ? +count[0] : null, nb: RB.game.s.notebook.map((n) => ({ id: n.id, kind: n.kind, m: n.m })) };
  }, nb);
}
{
  const { p, errors } = await begin();
  const r = await loadWith(p, [BUG, SIS]);
  const osh = r.entries.filter((e) => e.w === 'おしまい'), sis = r.entries.filter((e) => /^姉妹/.test(e.w));
  ok(r.sub && osh.length === 1 && osh[0].t === END && sis.length === 1 && sis[0].t === 'sisters' && r.entries.filter((e) => e.t === 'sisters').length === 1,
    '2 an older save with the bugged card, loaded: "Words you noted" shows おしまい as "the end; that\'s all", and "sisters" only for 姉妹 ' + flat(r));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}
{
  const { p, errors } = await begin();
  const r = await loadWith(p, [BUG, SIS, KAN]);
  const osh = r.entries.filter((e) => e.w === 'おしまい');
  ok(r.sub && osh.length === 1 && osh[0].t === END && r.entries.length === 2 && r.count === 2 && r.nb.filter((n) => n.kind === 'word-retired').length === 1,
    '3 an older save with the bugged card and a Kansai card: one おしまい entry, the count beside the page agrees, the old card retired in place ' + flat(r));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\noshimai_help: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
