// Company › Companion and Shared memories, and the companion's presence in the world
// (addendum §6.2, §6.4, §6.5, §7.4, §8, §19; tests §23.3), against the built index.html with
// synthetic campaigns in isolated browser contexts (no real saves are touched):
// - no companion, provisional, committed; bond in words only (and the highest stage's border);
//   thoughts; the real support actions; spoiler-safe personal quest status;
// - an invitation: the world note and the HUD button appear, Not now defers it (quietly), solving
//   the situation first replaces it with a result-aware follow-up, and another expires unsolved;
// - a conversation opened from Company plays through the normal dialogue runner and returns to the
//   same tab, page and scroll; unsafe places say it can wait;
// - How We Travel and What We Keep with real clicks: one bond event each, never again;
// - a rest stop: talking to the companion offers the ritual and a rest topic; nothing is awarded;
// - Shared memories: filters, a recollection that changes nothing;
// - keyboard focus order, 320×640 at 200 % text, Japanese labels.
// Captures: tests/e2e/out/company/ (a curated set goes to docs/screenshots/company/ with --docs).
// Usage: node tests/e2e/company.mjs [--docs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const DOCS = process.argv.includes('--docs');
const OUT = path.join(root, 'tests/e2e/out/company');
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const shots = [];
const shot = async (p, name) => { const f = path.join(OUT, name + '.png'); await p.screenshot({ path: f }); shots.push(f); return f; };

// a synthetic campaign on a map (flags, companion, chapter); the companion's verified milestones synced
async function start(p, map, x, y, o) {
  await p.evaluate(([map, x, y, o]) => {
    // (arrival scenes of the synthetic map are marked as already seen: this test is about Company)
    const def = RB.content.maps[map] || {};
    const seenEnter = {};
    for (const ev of def.onEnter || []) seenEnter['enter:' + map + ':' + ev.scene] = true;
    const s = RB.game.debugStart(map, x, y, { comp: o.comp || null, flags: Object.assign({ departed: !!o.comp, ch1_done: !!o.comp }, seenEnter, o.flags || {}) });
    if (o.prov) s.provisional = o.prov;
    s.chapter = o.chapter || 2;
    Object.assign(s.quests, o.quests || {});
    RB.company.sync(s, 'live');
    RB.company.refresh(s);
    RB.bus.emit('company:changed', {});
  }, [map, x, y, o || {}]);
  await p.waitForTimeout(120);
}
const openCompany = async (p, page) => { await p.evaluate((pg) => RB.ui.menu.open(pg || 'company'), page); await p.waitForSelector('.co-page'); await p.waitForTimeout(60); };
const closeMenu = (p) => p.evaluate(() => RB.ui.menu.close());
const text = (p, sel) => p.evaluate((sel) => { const e = document.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, sel);
// play a dialogue through with real clicks: Next on lines, the reply whose text matches `pick` on choices
async function talk(p, picks, maxSteps) {
  picks = [].concat(picks || []);
  const seen = [];
  for (let i = 0; i < (maxSteps || 80); i++) {
    const st = await p.evaluate(() => ({
      choices: Array.from(document.querySelectorAll('.choices:not(.hidden) .choice')).map((c) => c.textContent.replace(/\s+/g, ' ').trim()),
      dlg: !!document.querySelector('.dlg:not(.hidden)'), mode: RB.game.mode(), running: RB.script.isRunning(),
      line: (document.querySelector('.dlg:not(.hidden) .main') || {}).textContent || '',
    }));
    if (st.choices.length) {
      const want = picks.length ? picks.shift() : null;
      let idx = want ? st.choices.findIndex((c) => new RegExp(want, 'i').test(c)) : 0;
      if (idx < 0) throw new Error('no reply matching ' + want + ' in ' + JSON.stringify(st.choices));
      seen.push('> ' + st.choices[idx]);
      await p.waitForTimeout(180);
      await p.locator('.choices .choice').nth(idx).click();
      await p.waitForTimeout(120);
      continue;
    }
    if (st.dlg) {
      seen.push(st.line.slice(0, 240));
      await p.locator('.dlg .b-next').click();
      await p.waitForTimeout(90);
      continue;
    }
    if (!st.running && st.mode !== 'dialogue') { await p.waitForTimeout(150); if (!(await p.evaluate(() => RB.script.isRunning() || !!document.querySelector('.dlg:not(.hidden)')))) return seen; }
    else await p.waitForTimeout(100);
  }
  throw new Error('dialogue did not finish: ' + seen.slice(-5).join(' | '));
}
const state = (p) => p.evaluate(() => JSON.parse(JSON.stringify(RB.game.s)));

// =============================================================== wide: 1280×800
{
  const { p, errors, requests } = await page(b, url, { viewport: { width: 1280, height: 800 } });

  // ---- no companion; provisional; committed -------------------------------------------------------------------
  await start(p, 'rw.village', 20, 20, {});
  await openCompany(p);
  let t = await text(p, '.co-page');
  assert(/No one travels with you yet/.test(t) && !/Bond/.test(t), 'no companion: an honest short line, no bond, no placeholder party member');
  await closeMenu(p);
  await start(p, 'rw.hall', 5, 6, { prov: 'mio' });
  await openCompany(p);
  t = await text(p, '.co-page');
  assert(/Mio is travelling with you for now/.test(t) && /Nothing is decided/.test(t) && !/Bond/.test(t) && !/refuse|useful to everyone/.test(t), 'provisional: the real state, no bond claim, no unchosen personal story');
  await shot(p, 'provisional_1280x800');
  await closeMenu(p);

  await start(p, 'sg.harbor', 20, 22, { comp: 'nao', chapter: 3, flags: { sg_arrived: true, ch2_done: true } });
  await openCompany(p);
  t = await p.evaluate(() => document.querySelector('.folio').textContent.replace(/\s+/g, ' '));
  const acts = await p.evaluate(() => {
    const open = RB.content.companionActions.nao.filter((a) => !a.unlock || RB.state.test(RB.game.s, a.unlock)).map((a) => a.name.en);
    const shown = Array.from(document.querySelectorAll('.co-support .entry .t .en')).map((e) => e.textContent);
    return { open, shown };
  });
  assert(/Bond Walking Together/.test(t) && !/\bBond:? ?\d/.test(t) && !/score|points|affection/i.test(t), 'committed: the bond as words only (Walking Together), no number or score');
  assert(JSON.stringify(acts.open) === JSON.stringify(acts.shown) && acts.shown.length === 2, 'support actions are the real combat data, unlocked by the real conditions (' + acts.shown.join(', ') + ')');
  assert(/On Nao's mind/.test(t) && /ferry board tells the truth/.test(t), 'a current thought about this place after Saltglass is resolved');
  assert(!/Nao's own road/.test(t), 'the personal quest is not advertised before it is discovered');
  const portrait = await p.evaluate(() => { const c = document.querySelector('.co-portrait'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
  assert(portrait > 5000, 'the portrait is drawn (' + portrait + ' px)');
  await shot(p, 'companion_1280x800');
  await closeMenu(p);
  // the highest stage: a quiet border and the same words-only descriptor; a known personal quest
  await start(p, 'lf.town', 20, 20, { comp: 'nao', chapter: 5, flags: { ch2_done: true, ch3_done: true, ch4_done: true, lq_ally1: true }, quests: { lf_nao: { stage: 1, done: false, t: 1 } } });
  await p.evaluate(() => { for (const id of ['puzzle:a', 'puzzle:b', 'reflect:travel', 'reflect:keep', 'ending', 'project:1']) RB.company.award(RB.game.s, id, id === 'ending' ? 2 : 1); });
  await openCompany(p);
  t = await text(p, '.co-page');
  assert(/A Lasting Bond/.test(t) && await p.evaluate(() => !!document.querySelector('.co-id.lasting')), 'the highest stage: A Lasting Bond, with a decorative border');
  assert(/Nao's own road/.test(t) && /in progress/.test(t), 'a discovered personal quest shows its status');
  await p.click('[data-co-act=quest]');
  await p.waitForTimeout(80);
  t = await text(p, '.co-detail');
  assert(t && /Umi|letter/i.test(t) && !/I read it/.test(t), 'personal quest details: only the stages reached, nothing ahead');
  assert(/letter/.test(await text(p, '.co-thought')), 'the thought follows the quest in progress');
  await shot(p, 'companion_lasting_1280x800');
  await closeMenu(p);

  // ---- an invitation: appears, deferred, solved first → follow-up; another expires ---------------------------
  await start(p, 'sg.harbor', 20, 22, { comp: 'mio', chapter: 2, flags: { sg_arrived: true }, quests: { sg_main: { stage: 3, done: false, t: 1 } } });
  await p.waitForTimeout(400);
  let inv = await p.evaluate(() => ({ pend: RB.company.pending(RB.game.s), note: RB.company.indicatorShown(), hud: (() => { const h = document.querySelector('.hud .co-topic'); return h && !h.hidden ? h.getAttribute('aria-label') : null; })() }));
  assert(inv.pend && inv.pend.id === 'inv.sg_hands' && inv.note && /Mio has something to ask you/.test(inv.hud || ''), 'the Saltglass question: a note over Mio in the world and a labelled HUD button');
  await shot(p, 'world_invitation_1280x800');
  await p.click('.hud .co-topic');
  await p.waitForTimeout(150);
  const heard = await talk(p, ['Not now']);
  inv = await p.evaluate(() => ({ pend: RB.company.pending(RB.game.s), note: RB.company.indicatorShown(), hud: !!(document.querySelector('.hud .co-topic') && !document.querySelector('.hud .co-topic').hidden), bond: RB.company.score(RB.game.s) }));
  await p.waitForTimeout(300);
  inv.note = await p.evaluate(() => RB.company.indicatorShown());
  assert(heard.some((l) => /by hand/.test(l)) && inv.pend && inv.pend.quiet && !inv.note && !inv.hud && inv.bond === 0, 'Not now: the topic stays quietly (no note, no button), nothing is lost');
  await p.evaluate(() => { RB.game.s.flags.sg_wataru_confessed = true; RB.bus.emit('story:settled', {}); });
  await p.waitForTimeout(300);
  inv = await p.evaluate(() => ({ pend: RB.company.pending(RB.game.s), note: RB.company.indicatorShown() }));
  assert(inv.pend && inv.pend.st === 'after' && inv.pend.scene === 'co.inv_sg_hands_after' && inv.note, 'solved first: the question is replaced by a result-aware follow-up (the note is back)');
  await openCompany(p);
  assert(/Mio has something to ask you/.test(await text(p, '.co-pending')), 'Company says a topic is waiting');
  await p.click('[data-co-act=mind]');
  await p.waitForTimeout(200);
  const after = await talk(p, []);
  await p.waitForTimeout(250);
  inv = await p.evaluate(() => ({ pend: RB.company.pending(RB.game.s), open: RB.ui.menu.isOpen(), cur: RB.ui.menu.current() }));
  assert(after.some((l) => /too heavy|told them/i.test(l)), 'the follow-up speaks to what actually happened (we told the harbourmaster)');
  assert(!inv.pend && inv.open && inv.cur.section === 'company' && inv.cur.company === 'companion', 'the conversation ends and the folio comes back to Company › Companion');
  await closeMenu(p);
  await start(p, 'lf.town', 20, 20, { comp: 'ren', chapter: 5, flags: { ch2_done: true, ch3_done: true, ch4_done: true }, quests: { lf_main: { stage: 2, done: false, t: 1 } } });
  await p.evaluate(() => { const t = RB.game.s.company.talk; for (const id of ['reflect:travel', 'reflect:keep']) t[id] = { st: 'done' }; RB.company.refresh(RB.game.s); });
  inv = await p.evaluate(() => RB.company.pending(RB.game.s));
  await p.evaluate(() => { RB.game.s.flags.ch5_done = true; RB.bus.emit('story:settled', {}); });
  await p.waitForTimeout(200);
  const exp = await p.evaluate(() => ({ pend: RB.company.pending(RB.game.s), rec: RB.game.s.company.talk['inv.lf_word'], score: RB.company.score(RB.game.s) }));
  assert(inv && inv.id === 'inv.lf_word' && !exp.pend && exp.rec.st === 'expired', 'a question whose moment passes unsolved expires quietly');

  // ---- a conversation from Company: back to the same tab, page and scroll; unsafe here → it can wait -------------
  await p.setViewportSize({ width: 800, height: 560 });
  await start(p, 'co.village', 20, 20, { comp: 'suzu', chapter: 3, flags: { ch2_done: true, ch3_done: true }, quests: { co_suzu: { stage: 3, done: true, t: 1 } } });
  await p.evaluate(() => { const t = RB.game.s.company.talk; t['reflect:travel'] = { st: 'done' }; RB.company.refresh(RB.game.s); });
  await openCompany(p);
  const scrolled = await p.evaluate(() => { const B = document.querySelectorAll('#folio-page .leaf')[1]; B.scrollTop = 140; B.dispatchEvent(new Event('scroll')); return { top: B.scrollTop, max: B.scrollHeight - B.clientHeight }; });
  // (clicked from script: a pointer click would first scroll the button into view)
  await p.evaluate(() => document.querySelector('[data-co-act=place]').click());
  await p.waitForTimeout(200);
  const placeLines = await talk(p, []);
  await p.waitForTimeout(250);
  const back = await p.evaluate(() => ({ open: RB.ui.menu.isOpen(), cur: RB.ui.menu.current(), top: document.querySelectorAll('#folio-page .leaf')[1].scrollTop }));
  assert(placeLines.length >= 1 && back.open && back.cur.section === 'company' && back.cur.company === 'companion' && Math.abs(back.top - scrolled.top) <= 2 && scrolled.top > 0,
    'Talk about this place: the folio closes, the lines play, and it returns to the same tab, page and scroll (' + scrolled.top + '→' + back.top + ')');
  await closeMenu(p);
  await p.setViewportSize({ width: 1280, height: 800 });
  await start(p, 'rw.millroad', 12, 10, { comp: 'suzu', chapter: 3, flags: { ch2_done: true } });
  const unsafe = await p.evaluate(async () => {
    const W = RB.world.W; const f = W.foes[0]; if (f) { f.x = W.player.x + 2; f.y = W.player.y; }
    RB.ui.menu.open('company'); await new Promise((r) => setTimeout(r, 80));
    document.querySelector('[data-co-act=mind]').click(); await new Promise((r) => setTimeout(r, 120));
    return { open: RB.ui.menu.isOpen(), running: RB.script.isRunning(), notice: Array.from(document.querySelectorAll('.notice')).map((n) => n.textContent).join(' | '), foes: W.foes.length };
  });
  assert(unsafe.foes === 0 || (unsafe.open && !unsafe.running && /can wait/.test(unsafe.notice)), 'with a creature close by, nothing plays: it can wait for a safe pause');
  await closeMenu(p);

  // ---- the two journey reflections, with real clicks -----------------------------------------------------------------------
  await start(p, 'sb.inn_room', 5, 5, { comp: 'ren', chapter: 4, flags: { ch2_done: true, ch3_done: true, ch4_done: true, lq_ally2: true, sb_ren_ushio1: true } });
  let pend = await p.evaluate(() => RB.company.pending(RB.game.s));
  assert(pend && pend.id === 'reflect:travel', 'late journey: How We Travel is still offered (retrospective wording)');
  await p.evaluate(() => RB.game.companionTalk());
  await p.waitForTimeout(150);
  const travel = await talk(p, ['Go ahead', 'get lost together']);
  let st = await state(p);
  assert(travel.some((l) => /meaning to check since Saltglass/.test(l)) && travel.some((l) => /promise I made/.test(l)), 'How We Travel: retrospective opening, and a reply to the answer given');
  assert(st.company.bond['reflect:travel'] === 1 && st.company.memories.some((m) => m.id === 'story:reflect_travel' && m.kind === 'reflections' && m.lines.some((l) => l.choice)), 'one bond event, and the conversation kept as a Reflections memory with the reply');
  pend = await p.evaluate(() => RB.company.pending(RB.game.s));
  await p.evaluate(() => RB.game.companionTalk());
  await p.waitForTimeout(150);
  const keep = await talk(p, ['Go on', 'same day']);
  st = await state(p);
  assert(pend && pend.id === 'reflect:keep' && keep.some((l) => /Koharuno/.test(l)), 'What We Keep names a moment this journey recorded (the Koharuno shade)');
  assert(st.company.bond['reflect:keep'] === 1 && st.company.talk['reflect:keep'].moment === 'story:lq2', 'its one bond event; the moment it named is kept');
  const b1 = st.company.bond;
  // replay from the rest topics: companionship, not points
  await openCompany(p);
  await p.click('[data-co-topic="reflect.travel.ren"]');
  await p.waitForTimeout(150);
  await talk(p, ['Go ahead', 'lanterns']);
  st = await state(p);
  assert(JSON.stringify(st.company.bond) === JSON.stringify(b1), 'hearing a reflection again awards nothing');
  await closeMenu(p);

  // ---- a rest stop: the ritual and a rest topic ---------------------------------------------------------------------------------
  const before = await state(p);
  await p.evaluate(() => RB.game.companionTalk());
  await p.waitForTimeout(150);
  let menu = await p.evaluate(() => Array.from(document.querySelectorAll('.choices .choice')).map((c) => c.textContent.replace(/\s+/g, ' ').trim()));
  assert(menu.some((c) => /Tend the lamp together/.test(c)) && menu.some((c) => /Talk: /.test(c)) && menu.some((c) => /Not now/.test(c)), 'at a rest setting, talking to Ren offers a small ritual, a rest topic and Not now (' + menu.length + ' choices)');
  await shot(p, 'rest_menu_1280x800');
  const rit = await talk(p, ['Tend the lamp']);
  assert(rit.some((l) => /trims the wick|wick/i.test(l)), 'the ritual: Ren trims the travelling lantern\'s wick');
  await p.evaluate(() => RB.game.companionTalk());
  await p.waitForTimeout(150);
  const top = await talk(p, ['Talk: ', 'How far']);
  st = await state(p);
  assert(top.some((l) => /stars|lanterns to count/.test(l)) && st.company.talk['t:t.ren.stars'], 'a rest topic plays and is marked as heard');
  assert(JSON.stringify(st.company.bond) === JSON.stringify(before.company.bond) && JSON.stringify(st.inv) === JSON.stringify(before.inv) && st.resolve.pc === before.resolve.pc, 'rituals and rest topics award nothing (bond, items, resolve unchanged)');

  // ---- a solved puzzle (the contract's discovery:resolved): one short remark, a memory, a filed thought ------------
  await p.evaluate(() => RB.company.addReactions([{ id: 'c1_test_ren', comp: 'ren', event: 'puzzle:c1_sign', facts: { method: 'sheltered' },
    lines: [{ jp: '{字|じ} が {読|よ}める 。', en: 'The writing can be read now.' }], thought: { jp: '{元|もと} の {字|じ} が {残|のこ}って いる 。', en: 'The original lettering is still there to compare.' } }]));
  await p.evaluate(() => RB.bus.emit('discovery:resolved', { kind: 'puzzle', id: 'c1_sign', region: 'snowbell', method: 'sheltered', title: { jp: '{看板|かんばん}', en: 'The flapping sign' } }));
  await p.waitForTimeout(250);
  const remark = await talk(p, []);
  st = await state(p);
  const disc = st.company.memories.find((m) => m.id === 'disc:puzzle:c1_sign');
  const th = await p.evaluate(() => RB.company.thought(RB.game.s));
  // (counted in the dialogue history: the capture above may see one line twice while its text is revealed)
  assert(remark.some((l) => /can be read now/.test(l)) && st.backlog.filter((l) => /can be read now/.test(l.en || '')).length === 1 && disc && disc.kind === 'discoveries' && /can be read/.test(disc.reply.en) && st.company.bond['puzzle:snowbell'] === 1,
    'a solved puzzle: one short remark, a Discoveries memory with it, one bond event for the region (' + JSON.stringify({ remark, disc: disc && disc.reply, bond: st.company.bond }) + ')');
  assert(th.kind === 'recent' && /original lettering/.test(th.text.en), 'the longer thought is filed for Company, not spoken');
  await p.evaluate(() => RB.bus.emit('discovery:resolved', { kind: 'puzzle', id: 'c1_sign', region: 'snowbell', method: 'secured' }));
  await p.waitForTimeout(250);
  const again = await p.evaluate(() => ({ dlg: !!document.querySelector('.dlg:not(.hidden)'), bond: RB.game.s.company.bond['puzzle:snowbell'], mem: RB.game.s.company.memories.filter((m) => m.id === 'disc:puzzle:c1_sign').length }));
  assert(!again.dlg && again.bond === 1 && again.mem === 1, 'the same resolution again: no second remark, award or memory');

  // ---- Shared memories: filters, recollection changes nothing ---------------------------------------------------------------------
  await openCompany(p, 'memories');
  const mem0 = await state(p);
  const chips = await p.evaluate(() => Array.from(document.querySelectorAll('.co-filters .chip')).map((c) => c.textContent.replace(/\s+/g, ' ').trim()));
  await p.click('[data-co-filter=reflections]');
  await p.waitForTimeout(60);
  const refl = await p.evaluate(() => Array.from(document.querySelectorAll('.co-mem')).map((e) => e.dataset.kind));
  await p.click('.co-mem [data-co-recall]');
  await p.waitForTimeout(80);
  const recall = await text(p, '.co-recall');
  await p.click('[data-co-filter=all]');
  await p.waitForTimeout(60);
  const all = await p.evaluate(() => Array.from(document.querySelectorAll('.co-mem .en')).map((e) => e.textContent).slice(0, 40).join(' | '));
  const mem1 = await state(p);
  assert(chips.length === 5 && refl.length === 2 && refl.every((k) => k === 'reflections'), 'filters: All, Together, Pets, Discoveries, Reflections (' + chips.join(', ') + ')');
  assert(/Reading it changes nothing/.test(recall) && /your reply/.test(recall), 'the recollection is a labelled transcript with what you said');
  assert(/Two names on the lantern/.test(all) && /The rain of letters/.test(all), 'chronological: setting out first, then the chapters');
  mem1.playtime = mem0.playtime;
  assert(JSON.stringify(mem1) === JSON.stringify(mem0), 'reading and filtering memories changes nothing in the campaign');
  await shot(p, 'memories_1280x800');
  await closeMenu(p);

  // ---- keyboard: focus order through the Companion page ---------------------------------------------------------------------------------
  await openCompany(p, 'companion');
  await p.focus('.ptab[data-id=company]');
  const order = [];
  for (let i = 0; i < 160 && order.length < 14; i++) {
    await p.keyboard.press('Tab');
    const o = await p.evaluate(() => { const a = document.activeElement; return a ? (a.dataset.cp || a.dataset.coAct || a.dataset.coTopic || (a.classList.contains('leaf') ? 'leaf' : a.classList.contains('jt') ? 'jt' : a.className || a.tagName)) : null; });
    if (o !== 'jt') order.push(o); // (Japanese words are focusable for word help, in reading order)
  }
  const want = ['companion', 'pet', 'memories'];
  const idx = want.map((w) => order.indexOf(w));
  const a2 = ['mind', 'rest', 'memories'].map((w) => order.lastIndexOf(w));
  assert(idx.every((x, i) => x >= 0 && (i === 0 || x > idx[i - 1])) && a2.every((x, i) => x >= 0 && (i === 0 || x > a2[i - 1])) && a2[0] > idx[2], 'Tab order: the Company pages, then the actions in reading order (' + order.join(' → ') + ')');
  const names = await p.evaluate(() => Array.from(document.querySelectorAll('.folio button')).filter((x) => x.offsetParent).filter((x) => !(x.getAttribute('aria-label') || x.textContent.trim())).length);
  assert(names === 0, 'every button has an accessible name');
  await closeMenu(p);

  // ---- Japanese labels ------------------------------------------------------------------------------------------------------------------
  await p.evaluate(() => { RB.game.settings.uiLang = 'ja'; RB.game.applySettings(); });
  await openCompany(p, 'companion');
  const ja = await p.evaluate(() => ({ acts: Array.from(document.querySelectorAll('.co-act')).map((b) => b.querySelector('.jline') ? b.querySelector('.jline').textContent : ''), bond: (document.querySelector('.co-bond .k') || {}).textContent, sr: document.querySelectorAll('.co-act .sr').length }));
  assert(ja.acts.length >= 3 && ja.acts.every((x) => /[぀-ヿ一-鿿]/.test(x)) && /絆/.test(ja.bond) && ja.sr === ja.acts.length, 'Japanese interface: the actions and the bond label in Japanese, English kept for screen readers');
  await shot(p, 'companion_ja_1280x800');
  await closeMenu(p);
  await p.evaluate(() => { RB.game.settings.uiLang = 'en'; RB.game.applySettings(); });

  // ---- a real case (RB.cases): its resolution emits discovery:resolved and its scene calls the case's reaction
  //      hook; between them exactly one remark. Company › Discuss a discovered case lists the real records.
  await start(p, 'sg.harbor', 20, 22, { comp: 'mio', chapter: 3, flags: { sg_arrived: true, ch2_done: true } });
  await openCompany(p);
  const noCase = await p.evaluate(() => !!document.querySelector('[data-co-act=case]'));
  await closeMenu(p);
  await p.evaluate(() => {
    RB.cases.open(RB.game.s, 'parcel');
    RB.script.add('@scene c1.case_test\n!hook case_resolve parcel reasoned\n!hook case_react parcel\n', 'c1.case_test');
    RB.script.run('c1.case_test');
  });
  await p.waitForTimeout(150);
  const caseLines = await talk(p, []);
  await p.waitForTimeout(400);
  st = await state(p);
  const caseMem = st.company.memories.find((m) => m.id === 'disc:case:parcel');
  const caseOnce = st.backlog.filter((l) => /checked each thing in turn/.test(l.en || '')).length;
  const quiet = await p.evaluate(() => !document.querySelector('.dlg:not(.hidden)') && !RB.script.isRunning());
  assert(!noCase && caseLines.some((l) => /checked each thing in turn/.test(l)) && caseOnce === 1 && quiet && !st.company.talk._remark,
    'a resolved case: the discovery listener and the case\'s own reaction hook say one remark between them (' + caseOnce + ' in the history; none offered before a case was known)');
  assert(caseMem && caseMem.title.en === 'A Parcel for a Place That Moved' && caseMem.ref && caseMem.ref.kind === 'case' && /checked each thing/.test(caseMem.reply.en) &&
    st.company.react['case:parcel:done'] && !st.company.react['case:parcel'] && st.company.bond['puzzle:saltglass'] === 1,
    'the Discoveries memory is named from the case record, the reaction is chosen once under the contract\'s id, one bond event for Saltglass');
  await openCompany(p);
  await p.click('[data-co-act=case]');
  await p.waitForTimeout(80);
  const caseList = await p.evaluate(() => ({ items: Array.from(document.querySelectorAll('.co-cases .entry .t .en')).map((e) => e.textContent), talk: !!document.querySelector('[data-co-case-talk="case:parcel"]'), exp: document.querySelector('[data-co-act=case]').getAttribute('aria-expanded') }));
  assert(caseList.items.length === 1 && caseList.items[0] === 'A Parcel for a Place That Moved' && caseList.talk && caseList.exp === 'true', 'Discuss a discovered case lists the real record (RB.cases.topics) with Talk it over and Open the record');
  await shot(p, 'case_detail_1280x800');
  await p.evaluate(() => document.querySelector('[data-co-case-talk="case:parcel"]').click());
  await p.waitForTimeout(200);
  const over = await talk(p, []);
  await p.waitForTimeout(250);
  const backCase = await p.evaluate(() => ({ open: RB.ui.menu.isOpen(), cur: RB.ui.menu.current() }));
  assert(over.some((l) => /call bell must sound lovely/.test(l)) && backCase.open && backCase.cur.company === 'companion', 'Talk it over plays the case\'s own conversation (solved wording) and returns to Company');
  // (the page may come back with the list still open: it returns as it was left)
  if (!(await p.$('[data-co-case-open="case:parcel"]'))) { await p.click('[data-co-act=case]'); await p.waitForTimeout(80); }
  await p.click('[data-co-case-open="case:parcel"]');
  await p.waitForTimeout(250);
  const rec = await p.evaluate(() => { const r = document.querySelector('#folio-page .cs-record'); return { open: RB.ui.menu.isOpen(), cur: RB.ui.menu.current(), rec: r && r.dataset.case }; });
  assert(rec.open && rec.cur.journey === 'cases' && rec.rec === 'parcel', 'Open the record goes to the case\'s record in Journey');
  await closeMenu(p);
  await openCompany(p, 'memories');
  await p.click('[data-co-filter=discoveries]');
  await p.waitForTimeout(60);
  const discs = await p.evaluate(() => Array.from(document.querySelectorAll('.co-mem')).map((e) => ({ k: e.dataset.kind, t: e.textContent.replace(/\s+/g, ' ') })));
  await p.click('.co-mem [data-co-ref=cases]');
  await p.waitForTimeout(250);
  const rec2 = await p.evaluate(() => { const r = document.querySelector('#folio-page .cs-record'); return { cur: RB.ui.menu.current(), rec: r && r.dataset.case }; });
  assert(discs.length === 1 && /A Parcel for a Place That Moved/.test(discs[0].t) && rec2.cur.journey === 'cases' && rec2.rec === 'parcel', 'Shared memories › Discoveries holds the case, and its link opens the record');
  await closeMenu(p);

  // ---- The Pages We Keep (RB.pages): a conversation it has waiting is what "Ask what's on their mind" plays,
  //      the same one talking to the companion in the world would play first
  if (await p.evaluate(() => !!(RB.pages && RB.pages.pending))) {
    await start(p, 'rw.hall', 5, 6, { comp: 'nao', chapter: 6, flags: { ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, ch6_done: true, postgame: true } });
    const pd = await p.evaluate(() => RB.pages.pending(RB.game.s));
    await openCompany(p, 'companion');
    const note = await p.evaluate(() => { const b = document.querySelector('[data-co-act=mind]'); return b && b.parentElement.textContent.replace(/\s+/g, ' '); });
    await p.evaluate(() => document.querySelector('[data-co-act=mind]').click());
    await p.waitForTimeout(200);
    const owed = await talk(p, []);
    await p.waitForTimeout(250);
    const after = await p.evaluate(() => ({ seen: !!RB.game.s.seen['pages.retro'], open: RB.ui.menu.isOpen(), panel: !!document.querySelector('.pages-shared'), mem: RB.game.s.company.memories.map((m) => m.id) }));
    assert(pd && pd.id === 'retro' && note && note.includes(pd.en) && owed.length > 0 && after.seen && after.open,
      'a waiting Pages conversation shows on "Ask what\'s on their mind" and plays from Company, then the page returns (' + (pd && pd.id) + ', ' + owed.length + ' lines)');
    await closeMenu(p);
  }

  assert(!errors.length, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');
  assert(!requests.length, 'no external requests');
  await p.context().close();
}

// =============================================================== phone: 320×640 at 200 % text, and 390×844
for (const vp of [{ width: 320, height: 640, scale: 2 }, { width: 390, height: 844, scale: 1 }]) {
  const { p, errors } = await page(b, url, { viewport: { width: vp.width, height: vp.height }, touch: true, mobile: true });
  await p.evaluate((sc) => { RB.game.settings.textScale = sc; RB.game.applySettings(); }, vp.scale);
  await start(p, 'lq.koharu', 12, 12, { comp: 'mio', chapter: 5, flags: { ch2_done: true, ch3_done: true, ch4_done: true, lq_ally2: true } });
  await openCompany(p, 'companion');
  const tag = vp.width + 'x' + vp.height + (vp.scale > 1 ? '_200' : '');
  const lay = await p.evaluate(() => {
    const pg = document.getElementById('folio-page');
    const over = Array.from(document.querySelectorAll('#folio-page .leaf, .co-page, .co-page *')).filter((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX !== 'visible').map((e) => e.className).slice(0, 5);
    const small = Array.from(document.querySelectorAll('.co-act, .chip, .co-page .pbtn')).filter((x) => x.offsetParent).filter((x) => { const r = x.getBoundingClientRect(); return r.height < 43.5; }).length;
    return { hscroll: document.documentElement.scrollWidth > innerWidth + 1 || pg.scrollWidth > pg.clientWidth + 2, over, small };
  });
  assert(!lay.hscroll && !lay.over.length && lay.small === 0, tag + ': Companion page fits with no horizontal scroll, comfortable targets (' + JSON.stringify(lay) + ')');
  await shot(p, 'companion_' + tag);
  // a known case on a phone: its list is a page of its own with Back, and it fits
  if (await p.evaluate(() => !!(RB.cases && RB.cases.open))) {
    await p.evaluate(() => { RB.cases.open(RB.game.s, 'parcel'); RB.ui.menu.open('companion'); });
    await p.waitForTimeout(80);
    await p.click('[data-co-act=case]');
    await p.waitForTimeout(80);
    const cl = await p.evaluate(() => {
      const over = Array.from(document.querySelectorAll('#folio-page .leaf, .co-page, .co-page *')).filter((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX !== 'visible').map((e) => e.className).slice(0, 5);
      return { list: document.querySelectorAll('.co-cases .entry').length, back: !!document.querySelector('[data-co-back]'), acts: !!document.querySelector('.co-acts'), over, hscroll: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    assert(cl.list === 1 && cl.back && !cl.acts && !cl.over.length && !cl.hscroll, tag + ': Discuss a discovered case is its own page with Back, no sideways scroll (' + JSON.stringify(cl) + ')');
    await p.click('[data-co-back]');
    await p.waitForTimeout(60);
  }
  await p.click('[data-co-act=quest]').catch(() => {});
  await p.evaluate(() => RB.ui.menu.open('memories'));
  await p.waitForTimeout(80);
  await p.locator('.co-mem [data-co-recall]').first().click();
  await p.waitForTimeout(80);
  const det = await p.evaluate(() => ({ recall: !!document.querySelector('.co-recall'), back: !!document.querySelector('[data-co-back]'), list: !!document.querySelector('.co-mems') }));
  assert(det.recall && det.back && !det.list, tag + ': on a phone the recollection is its own page with a Back button');
  await shot(p, 'recollection_' + tag);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(80);
  const afterBack = await p.evaluate(() => ({ open: RB.ui.menu.isOpen(), list: !!document.querySelector('.co-mems') }));
  assert(afterBack.open && afterBack.list, tag + ': Back leaves the recollection first, keeping the folio open');
  await closeMenu(p);
  assert(!errors.length, tag + ': no page errors (' + errors.slice(0, 3).join(' | ') + ')');
  await p.context().close();
}

// curated captures for docs/screenshots/company/ (WebP)
if (DOCS) {
  const dir = path.join(root, 'docs/screenshots/company');
  fs.mkdirSync(dir, { recursive: true });
  const ctx = await b.newContext();
  const pg = await ctx.newPage();
  for (const f of shots) {
    const data = 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
    const b64 = await pg.evaluate(async (data) => {
      const img = new Image(); img.src = data; await img.decode();
      const k = img.width > 900 ? 0.5 : 1;
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.88).split(',')[1];
    }, data);
    fs.writeFileSync(path.join(dir, path.basename(f, '.png') + '.webp'), Buffer.from(b64, 'base64'));
  }
  await ctx.close();
  console.log('docs captures: ' + shots.length);
}

await b.close();
srv.close();
console.log(fail ? `\n${fail} FAILED` : '\nall passed');
process.exit(fail ? 1 : 0);
