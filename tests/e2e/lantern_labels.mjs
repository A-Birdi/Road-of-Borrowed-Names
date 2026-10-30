// The things an encounter asks you to protect, named as themselves on the battle screen (Agnes 6532997433, 6533320027;
// Local CL-526; Cloud CC-376 §1): at the third waystation the Wick Moths go for the two lanterns, but a Protect card aimed
// at a lantern, its exercise slip and its queued line said "on you", the moths' telegraph named you in Japanese and in
// English, the ward was narrated as yours, and an unwarded blow on a lantern was narrated as yours and taken off your bar
// while the exchange played. In Chromium on the built game, with the real buttons (kr.wick_ridge, Nao along):
//  1. the Protect cards: "on the east lantern", "on the west lantern", and still "on you", "on Nao"; the healing word
//     still "on you both";
//  2. the telegraph of the move on the east lantern names it, in English and in Japanese (東 の 灯籠 with its readings),
//     never you;
//  3. Protect on the east lantern: its exercise slip and its queued line say "on the east lantern"; the ward is narrated
//     for the east lantern, never for you;
//  4. the telegraph of the move on the west lantern names it (西 の 灯籠); left unwarded (you protect yourself), the
//     blow is narrated as the west lantern struck, and on that beat the west lantern's own count is down by the blow
//     while yours and Nao's are as they were, and neither of your bars dips at any point of the exchange; after it the
//     slip agrees with the rules;
//  5. the other three encounters with something to protect (the letter, your travel papers, your towel): each Protect
//     card by its own name;
//  6. Ren's Lamp ward, which goes before the one the moth aims at: its card says "before the east lantern", and its ward
//     is narrated there;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/lantern_labels.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const WORDS = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'honoo', 'suzu', 'koe'];

async function begin(p, o) {
  await p.evaluate(([o, WORDS]) => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, o.comp ? { comp: o.comp } : {});
    s.learn.kanaKnown = 'both'; s.learn.profile = 'F'; s.learn.difficulty = 'normal';
    s.words = WORDS.slice();
    RB.game.settings.input = 'choice'; RB.game.settings.battleAnim = 'instant'; RB.game.settings.intentDisplay = 'expanded'; RB.game.settings.compPlan = 'ask';
    RB.game.applySettings();
    window.__res = null;
    RB.game.startEncounter(o.enc, {}).then((r) => { window.__res = r || { result: null }; });
  }, [o, WORDS]);
}
// on to your next choice (dialogue advanced, notes closed, the companion's turn taken with its first move), or the end
async function toChoose(p) {
  for (let i = 0; i < 400; i++) {
    const v = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), ph: RB.combat.phase(), cards: !!document.querySelector('.rcard[data-i]:not([disabled])'), coach: !!document.querySelector('[data-coach-ok]'), ccard: !!document.querySelector('.ccard'), res: window.__res }));
    if (v.res) return v;
    if (v.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
    if (v.coach) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]').catch(() => {}); continue; }
    if (v.ccard) { await p.mouse.move(2, 2); await companionTurn(p).catch(() => {}); continue; }
    if (v.ph === 'choose' && v.cards) { await p.waitForTimeout(250); return v; }
    await p.waitForTimeout(80);
  }
  return null;
}
const cardsNow = (p) => p.evaluate(() => [...document.querySelectorAll('.rcard[data-i]')].map((x) => ({ i: x.getAttribute('data-i'), en: ((x.querySelector('.rc-en') || {}).textContent || '').trim(), tgt: ((x.querySelector('.rc-tgt') || {}).textContent || '').trim() })));
// the telegraph shown: its English, its Japanese as read (readings left out) and each word with a reading
const telegraph = (p) => p.evaluate(() => {
  const el = document.querySelector('.intent');
  const jp = el && el.querySelector('.it-jp');
  const bare = (n) => { const c = n.cloneNode(true); c.querySelectorAll('rt').forEach((r) => r.remove()); return c.textContent.replace(/\s+/g, ''); };
  return { en: ((el && el.querySelector('.it-en')) || {}).textContent || '', jp: jp ? bare(jp) : '', all: jp ? jp.textContent : '', ruby: jp ? [...jp.querySelectorAll('ruby')].map((r) => [bare(r), ((r.querySelector('rt') || {}).textContent || '').trim()]) : [] };
});
const pressCard = async (p, pick) => {
  for (let k = 0; k < 8; k++) {
    await p.evaluate((i) => { const c = document.querySelector('.rcard[data-i="' + i + '"]'); if (c) c.click(); }, pick.i);
    await p.waitForTimeout(250);
    if (await p.evaluate(() => RB.combat.phase() !== 'choose' || !!document.querySelector('.chal, .csheet .pbtn'))) return;
  }
};
// the open language step answered right, in choice mode
async function answerRight(p) {
  await p.waitForSelector('.chal', { timeout: 15000 });
  await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
  await p.waitForSelector('.chal .mc .btn');
  const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
  for (let k = 0; k < n; k++) {
    await p.evaluate((k) => { const x = [...document.querySelectorAll('.chal .mc .btn')][k]; if (x && !x.disabled) x.click(); }, k);
    await p.waitForTimeout(100);
    if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
    await p.evaluate(() => { const g = document.querySelector('.fbwrap:not([data-fb=ok]) .fb-go, .fbwrap:not([data-fb=ok]) [data-a=retry]'); if (g) g.click(); });
    await p.waitForTimeout(100);
  }
  await p.click('.fbwrap[data-fb=ok] .fb-go');
}
// the party's slip: each member's name and resolve, as shown
const partyNow = (p) => p.evaluate(() => Object.fromEntries([...document.querySelectorAll('.cb-party .pm')].map((m) => [((m.querySelector('.pm-n') || {}).textContent || '').trim(), +((((m.querySelector('.pm-v') || {}).textContent || '').match(/(\d+)\s*\//) || [])[1])])));

// ---- the Wick Moths, with Nao
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { enc: 'kr.wick_ridge', comp: 'nao' });
  await toChoose(p);
  const me = await p.evaluate(() => ({ en: RB.game.s.player.name, jp: RB.game.s.player.nameJp || '' }));
  // 1. the Protect cards
  const cs = await cardsNow(p);
  const prot = cs.filter((c) => /protect/i.test(c.en)).map((c) => c.tgt);
  const heal = cs.filter((c) => /heal/i.test(c.en)).map((c) => c.tgt);
  ok(['on the east lantern', 'on the west lantern', 'on you', 'on Nao'].every((t) => prot.includes(t)) && heal.includes('on you both'),
    '1 the Protect cards name each lantern, you and Nao; the healing word is on you both (' + JSON.stringify({ prot, heal }) + ')');
  // 2. the telegraph on the east lantern
  const t1 = await telegraph(p);
  const named = (t, side, kanji, kana) => new RegExp('the ' + side + ' lantern', 'i').test(t.en) && t.jp.indexOf(kanji + 'の灯籠') >= 0 &&
    t.ruby.some((r) => r[0] === kanji && r[1] === kana) && t.ruby.some((r) => r[0] === '灯籠' && r[1] === 'とうろう') && !/[{}|]/.test(t.all) &&
    t.en.indexOf(me.en) < 0 && !/\byou\b/i.test(t.en) && (!me.jp || t.jp.indexOf(me.jp) < 0);
  ok(named(t1, 'east', '東', 'ひがし'), '2 the telegraph names the east lantern in English and Japanese, never you (' + JSON.stringify(t1) + ')');
  // 3. Protect on the east lantern
  // (by its label; failing that, by its place: the Protect cards come you, Nao, the east lantern, the west lantern)
  const protects = cs.filter((c) => /protect/i.test(c.en));
  const east = protects.find((c) => c.tgt === 'on the east lantern') || protects[2];
  await pressCard(p, east);
  await p.waitForSelector('.chal', { timeout: 15000 });
  const situ = await p.evaluate(() => ((document.querySelector('.cb-situ') || {}).textContent || '').replace(/\s+/g, ' '));
  await answerRight(p);
  await p.waitForSelector('.ccard', { timeout: 15000 });
  const queued = await p.evaluate(() => ((document.querySelector('.cb-queued') || {}).textContent || '').replace(/\s+/g, ' '));
  await p.mouse.move(2, 2);
  await companionTurn(p).catch(() => {});
  await toChoose(p);
  const log1 = await p.evaluate(() => (document.querySelector('.clog') || {}).textContent || '');
  ok(/on the east lantern/.test(situ) && /on the east lantern/.test(queued) && !/on you\b/.test(situ + ' ' + queued),
    '3 the exercise slip and the queued line say "on the east lantern" (' + JSON.stringify({ situ: situ.slice(0, 200), queued: queued.slice(0, 160) }) + ')');
  ok(/(A ward rises before|The ward catches the blow meant for) the east lantern/.test(log1) && log1.indexOf('meant for ' + me.en) < 0 && log1.indexOf('rises before ' + me.en) < 0,
    '3 the ward is narrated for the east lantern, not for you (' + JSON.stringify(log1.slice(-400)) + ')');
  // 4. on to the move on the west lantern (Protect on you through the rest between; there is no Wait here), then
  // Protect on you again: the blow on the west lantern lands unwarded
  const waitOnce = async () => {
    const c = (await cardsNow(p)).filter((x) => /protect/i.test(x.en))[0];
    await pressCard(p, c);
    await answerRight(p);
  };
  let t2 = null;
  for (let r = 0; r < 4 && !t2; r++) {
    const intent = await p.evaluate(() => (RB.combat.state().foes.find((f) => f.intent && f.intent.target === 'o:west') || {}).intent || null);
    if (intent) { t2 = await telegraph(p); break; }
    await waitOnce();
    await toChoose(p);
  }
  ok(t2 && named(t2, 'west', '西', 'にし'), '4 the telegraph names the west lantern in English and Japanese, never you (' + JSON.stringify(t2) + ')');
  // what the screen shows on each change while the exchange plays: the slip and the log together
  await p.evaluate(() => {
    window.__tl = [];
    const snap = () => ({ party: Object.fromEntries([...document.querySelectorAll('.cb-party .pm')].map((m) => [((m.querySelector('.pm-n') || {}).textContent || '').trim(), +((((m.querySelector('.pm-v') || {}).textContent || '').match(/(\d+)\s*\//) || [])[1])])), log: (document.querySelector('.clog') || {}).textContent || '' });
    window.__tl.push(snap());
    window.__mo = new MutationObserver(() => window.__tl.push(snap()));
    window.__mo.observe(document.querySelector('.combat-ui') || document.body, { childList: true, subtree: true, characterData: true });
  });
  const before = await partyNow(p);
  await waitOnce();
  await toChoose(p);
  const tl = await p.evaluate(() => { window.__mo.disconnect(); return window.__tl; });
  const rules = await p.evaluate(() => { const st = RB.combat.state(); return st ? { pc: st.pc, comp: st.comp, east: (st.actors.find((a) => a.aid === 'o:east') || {}).hp, west: (st.actors.find((a) => a.aid === 'o:west') || {}).hp } : null; });
  const struck = /(The west lantern is struck|strikes the west lantern) \(−(\d+)/;
  const at = tl.findIndex((x) => struck.test(x.log));
  const beat = at >= 0 ? tl[at] : null;
  const hitN = beat ? +beat.log.match(struck)[2] : 0;
  const prev = at > 0 ? tl[at - 1].party : before;
  ok(beat && hitN > 0 && beat.party['the west lantern'] === before['the west lantern'] - hitN && beat.party[me.en] === prev[me.en] && beat.party.Nao === prev.Nao,
    '4 the unwarded blow: narrated as the west lantern struck; on that beat its own count is down by ' + hitN + ', yours and Nao\'s as they were (' + JSON.stringify({ before, prev, beat: beat && beat.party, line: beat && (beat.log.match(/[^.]*west lantern[^.]*\./g) || []).slice(-2) }) + ')');
  // and through the whole exchange: where the rules leave you and Nao as you were, neither bar ever dips on screen
  const low = (k) => Math.min(...tl.map((x) => (x.party[k] == null ? Infinity : x.party[k])));
  const lows = { you: low(me.en), nao: low('Nao') };
  ok(rules && rules.pc === before[me.en] && rules.comp === before.Nao && lows.you === before[me.en] && lows.nao === before.Nao,
    '4 neither your bar nor Nao\'s dips while the exchange plays, as the rules took nothing from either (' + JSON.stringify({ before, lows, rules, updates: tl.length }) + ')');
  const after = await partyNow(p);
  ok(rules && after[me.en] === rules.pc && after.Nao === rules.comp && after['the east lantern'] === rules.east && after['the west lantern'] === rules.west,
    '4 after the exchange the slip agrees with the rules (' + JSON.stringify({ after, rules }) + ')');
  ok(!errors.length, 'the Wick Moths: no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

// ---- 5. every other encounter with something to protect: its Protect card by its own name (no guest is protectable or
// aimed at: the guests are named on the party's slip as before)
for (const [enc, thing] of [['fx.protect', 'the letter'], ['cr.fog_papers', 'your travel papers'], ['yn.towel', 'your towel']]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { enc, comp: null });
  await toChoose(p);
  const prot = (await cardsNow(p)).filter((c) => /protect/i.test(c.en)).map((c) => c.tgt);
  ok(prot.includes('on ' + thing) && prot.includes('on you'), '5 ' + enc + ': the Protect cards name ' + thing + ' and you (' + JSON.stringify(prot) + ')');
  ok(!errors.length, enc + ': no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

// ---- 6. the companion's own card: Ren's Lamp ward goes before the one the moth aims at (Local CL-526)
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { enc: 'kr.wick_ridge', comp: 'ren' });
  await toChoose(p);
  const me = await p.evaluate(() => RB.game.s.player.name);
  const you = (await cardsNow(p)).filter((x) => /protect/i.test(x.en))[0];
  await pressCard(p, you);
  await answerRight(p);
  await p.waitForSelector('.ccard', { timeout: 15000 });
  const lamp = await p.evaluate(() => { const c = [...document.querySelectorAll('.ccard')].find((x) => /Lamp ward/.test(x.textContent)); return c ? ((c.querySelector('.rc-tgt') || {}).textContent || '').trim() : null; });
  await p.mouse.move(2, 2);
  await companionTurn(p, { match: 'Lamp ward' }).catch(() => {});
  await toChoose(p);
  const log = await p.evaluate(() => (document.querySelector('.clog') || {}).textContent || '');
  ok(lamp === 'before the east lantern' && /A ward rises before the east lantern/.test(log) && log.indexOf('rises before ' + me + ' (') < 0,
    '6 Ren\'s Lamp ward: its card says "before the east lantern", and its ward is narrated there (' + JSON.stringify({ lamp, log: log.slice(-360) }) + ')');
  ok(!errors.length, 'Ren: no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

console.log(`\nlantern_labels: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
