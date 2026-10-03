// Suzu's Kansai-ben in the built index.html (docs/dialect/suzu_kansai.md), with real clicks in
// fresh browser contexts (no real saves are touched):
//   A. a new campaign: in the Lantern Hall she agrees to come and the choice appears once (two
//      options with a sample line each, a one-sentence explanation, furigana on every kanji);
//      choosing Kansai-ben re-voices her next line at once (Japanese with furigana, and English);
//      word help on a Kansai word says what it is in standard Japanese; the history shows her
//      words as she speaks them while the campaign keeps the standard line; Settings shows the
//      choice and it survives a reload.
//   B. a saved campaign where she already travels with you (no setting yet): loaded from its slot,
//      the choice is offered once after a scene in which she speaks (Escape keeps standard).
//      Company › Suzu, in "Talk with Suzu": the plain Standard / Kansai-ben control (labelled, at
//      least 44 px, keyboard and pointer) switches both ways at once — her thought on the page, the
//      line in the history, Settings — and the in-world row (ask her) does too. A shiritori
//      invitation, a scene line and her Company thought are re-voiced; the campaign save is the
//      same before and after (only the settings record changes); the choice survives a reload.
//   C. a phone (390×844): the Company control and the choice sheet fit; a tap switches.
// (She has no Japanese battle remarks: battle effects are English-only, so there is none to swap.)
// Usage: node tests/e2e/dialect_kansai.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const wait = (p, ms) => p.waitForTimeout(ms);

async function helpers(p) {
  await p.evaluate(() => {
    // visible text of an element without its furigana (rt), whitespace removed
    window.__txt = (el) => {
      if (typeof el === 'string') el = document.querySelector(el);
      if (!el) return null;
      const c = el.cloneNode(true);
      c.querySelectorAll('rt, rp').forEach((x) => x.remove());
      return c.textContent.replace(/\s+/g, '');
    };
    window.__plain = (jp) => RB.jp.plain(jp).replace(/\s+/g, '');
    // kanji shown outside ruby (every displayed kanji needs furigana)
    window.__bare = (sel) => {
      const out = [];
      for (const root of document.querySelectorAll(sel)) {
        const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          if (!/[一-鿿]/.test(n.nodeValue)) continue;
          if (n.parentElement.closest('ruby, rt, .sr-only, [aria-hidden="true"]')) continue;
          out.push(n.nodeValue.trim().slice(0, 20));
        }
      }
      return out;
    };
    window.__kansai = (jp, en) => RB.dialect.find(jp, en);
    window.__start = (map, x, y, o) => {
      const d = RB.content.maps[map] || {};
      const seen = {};
      for (const ev of d.onEnter || []) seen['enter:' + map + ':' + ev.scene] = true;
      const s = RB.game.debugStart(map, x, y, { comp: o.comp || null, flags: Object.assign({}, seen, o.flags || {}) });
      s.chapter = o.chapter || 2;
      RB.company.sync(s, 'live');
      RB.company.refresh(s);
      RB.bus.emit('company:changed', {});
      return s;
    };
    RB.game.settings.textSpeed = 'instant';
  });
}
// the dialogue: { en (main line), jp (the Japanese under it, without furigana), ruby, bare, choices }
const dlg = (p) => p.evaluate(() => {
  const box = document.querySelector('.dlg:not(.hidden)');
  return box ? {
    en: (box.querySelector('.main') || {}).textContent || '', jp: window.__txt(box.querySelector('.sub')), ruby: box.querySelectorAll('.sub ruby').length,
    bare: window.__bare('.dlg:not(.hidden) .sub'), choices: [...document.querySelectorAll('.choices:not(.hidden) .choice')].map((c) => c.textContent.replace(/\s+/g, ' ').trim()),
  } : null;
});
// play lines with Next until a choice, the speech sheet, a matching line, or the end
async function playUntil(p, stop, max) {
  for (let i = 0; i < (max || 60); i++) {
    if (await p.evaluate(() => !!document.querySelector('.speech-sheet'))) return 'sheet';
    const d = await dlg(p);
    if (d && d.choices.length) return 'choice';
    if (d && stop && stop(d)) return 'line';
    if (d) { await p.locator('.dlg .b-next').click(); await wait(p, 90); continue; }
    if (!(await p.evaluate(() => RB.script.isRunning()))) return 'end';
    await wait(p, 100);
  }
  return 'timeout';
}
async function choose(p, re) {
  const d = await dlg(p);
  const i = d.choices.findIndex((c) => re.test(c));
  if (i < 0) throw new Error('no choice ' + re + ' in ' + JSON.stringify(d.choices));
  await wait(p, 180);
  await p.locator('.choices .choice').nth(i).click();
  await wait(p, 150);
}
const finish = async (p) => { await playUntil(p, null, 80); await wait(p, 200); };
// the standard line of a scene by speaker, in order
// (hers: suzu: lines, and companion lines that only Suzu speaks)
const sceneLines = (p, id, who) => p.evaluate(([id, who]) => RB.content.scenes[id].cmds.filter((c) => c.op === 'say' && (c.who === who || (c.who === 'comp' && new RegExp('comp=' + who).test(c.if || '')))).map((c) => ({ jp: c.jp, en: c.en })), [id, who]);

// =========================================================================================== A. joining
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const { p, errors, requests } = await page(b, url, { context: ctx });
  await helpers(p);
  assert(await p.evaluate(() => !('suzuSpeech' in RB.game.settings) && RB.dialect.choice() === 'standard'), 'a fresh game has no setting: Suzu speaks standard Japanese');
  await p.evaluate(() => window.__start('rw.hall', 6, 5, { flags: { rw_echo_done: true, rw_evening: true, rw_hall_gather: true, rw_koji_back: true, bridge_fixed: true } }));
  await wait(p, 200);
  const hall = await sceneLines(p, 'rw.hall_suzu', 'suzu');
  await p.evaluate(() => { RB.script.run('rw.hall_suzu'); });
  await wait(p, 300);
  const first = await dlg(p);
  assert(first && first.jp === (await p.evaluate((l) => window.__plain(l.jp), hall[0])), 'before choosing, her lines are standard (' + (first && first.jp.slice(0, 16)) + ')');
  assert((await playUntil(p)) === 'choice', 'the recruitment choice');
  await choose(p, /come with me/i);
  assert((await playUntil(p)) === 'sheet', 'agreeing to come: the speech choice appears');
  const sheet = await p.evaluate(() => {
    const el = document.querySelector('.speech-sheet');
    const opts = [...el.querySelectorAll('.speech-opt')].map((o) => ({ v: o.dataset.sp, h: Math.round(o.getBoundingClientRect().height), pressed: o.getAttribute('aria-pressed'), text: window.__txt(o) }));
    return { title: el.querySelector('h3').textContent.trim(), text: el.textContent.replace(/\s+/g, ' '), opts, ruby: el.querySelectorAll('ruby').length, bare: window.__bare('.speech-sheet'), modal: el.getAttribute('aria-modal'), focus: document.activeElement && document.activeElement.dataset.sp };
  });
  assert(/How should Suzu speak/.test(sheet.title) && sheet.modal === 'true', 'a short, clear question: ' + sheet.title);
  assert(/regional dialect of Osaka and Kyoto/.test(sheet.text) && /switch back any time/.test(sheet.text), 'one-sentence explanation and how to switch back');
  assert(sheet.opts.length === 2 && sheet.opts.every((o) => o.h >= 44), 'two options, each at least 44 px tall (' + sheet.opts.map((o) => o.v + ' ' + o.h).join(', ') + ')');
  assert(sheet.opts[0].pressed === 'true' && sheet.focus === 'standard', 'Standard is the current choice and has focus');
  assert(sheet.ruby > 0 && !sheet.bare.length, 'the sample lines carry furigana on every kanji (' + sheet.ruby + ' ruby; bare: ' + sheet.bare.join('|') + ')');
  const smp = await p.evaluate(() => ({ std: window.__plain(RB.ui.suzuSpeech.sample('standard').jp), k: window.__plain(RB.ui.suzuSpeech.sample('kansai').jp) }));
  assert(smp.k !== smp.std && sheet.opts[0].text.indexOf(smp.std) >= 0 && sheet.opts[1].text.indexOf(smp.k) >= 0, 'each option shows her line as she would say it (' + smp.k + ')');
  await p.locator('.speech-opt[data-sp="kansai"]').click();
  await wait(p, 300);
  assert(await p.evaluate(() => !document.querySelector('.speech-sheet') && RB.game.settings.suzuSpeech === 'kansai'), 'choosing Kansai-ben closes the sheet and sets the choice');
  // her next line, re-voiced
  const glad = hall.find((l) => /喜|よろこ/.test(l.jp));
  const k = await p.evaluate((l) => window.__kansai(l.jp, l.en), glad);
  assert(k && (await playUntil(p, (d) => d.en.trim() === k.en)) === 'line', 'the scene goes on');
  const d1 = await dlg(p);
  assert(k && d1.jp === (await p.evaluate((jp) => window.__plain(jp), k.jp)), 'her next line is in Kansai-ben (' + d1.jp.slice(0, 24) + '…)');
  assert(d1.en.trim() === k.en && d1.en.trim() !== glad.en, 'and its English is re-voiced (' + d1.en.slice(0, 40) + '…)');
  assert(d1.ruby > 0 && !d1.bare.length, 'furigana on every kanji of the Kansai line (' + d1.ruby + ' ruby)');
  // word help on a Kansai word (a real click on a word of the line)
  const n = await p.evaluate(() => document.querySelectorAll('.dlg .sub .jt').length);
  let help = null;
  for (let i = 0; i < n && !help; i++) {
    await p.locator('.dlg .sub .jt').nth(i).click();
    await wait(p, 160);
    help = await p.evaluate(() => { const h = document.querySelector('.help .note.dia'); return h ? { text: h.textContent.replace(/\s+/g, ' '), ruby: h.querySelectorAll('ruby').length, bare: window.__bare('.help .note.dia'), word: document.querySelector('.help').textContent.slice(0, 30) } : null; });
    if (!help) await p.evaluate(() => RB.ui.help.hide(true));
  }
  assert(help && /Kansai dialect/.test(help.text) && /In standard Japanese/.test(help.text), 'word help explains a Kansai word: ' + (help && help.text.slice(0, 120)));
  assert(help && help.ruby > 0 && !help.bare.length, 'the help note shows its Japanese with furigana');
  await p.evaluate(() => RB.ui.help.hide(true));
  await finish(p);
  const keep = await p.evaluate((jp) => { const s = RB.game.s; const l = s.backlog.filter((x) => x.who === 'suzu').pop(); return { jp: l && l.jp, comp: s.comp || s.provisional, std: jp }; }, glad.jp);
  assert(keep.jp === keep.std, 'the campaign keeps her standard line in its history (the swap is only shown)');
  await p.evaluate(() => RB.ui.menu.open('history'));
  await p.waitForSelector('.folio');
  await wait(p, 200);
  const hist = await p.evaluate(() => window.__txt('.folio'));
  assert(hist.indexOf(await p.evaluate((jp) => window.__plain(jp), k.jp)) >= 0, 'History shows her line as she said it, in Kansai-ben');
  assert(!(await p.evaluate(() => window.__bare('.folio .entry')).then((x) => x.length)), 'History: furigana on every kanji');
  await p.evaluate(() => RB.ui.menu.close());
  // Settings shows the choice
  await p.evaluate(() => RB.ui.menu.open('settings'));
  await p.waitForSelector('[data-grp=reading]');
  await p.click('[data-grp=reading]');
  await wait(p, 200);
  assert(await p.isChecked('input[data-suzu-speech][value="kansai"]'), 'Settings › Reading & Language: "Suzu\'s speech" reads Kansai');
  const legend = await p.evaluate(() => { const f = document.querySelector('[data-speech-field]'); return f ? f.textContent.replace(/\s+/g, ' ') : ''; });
  assert(/Suzu's speech/.test(legend) && /Standard/.test(legend) && /Kansai \(Kansai-ben\)/.test(legend), 'the Settings row: ' + legend.slice(0, 60));
  await p.evaluate(() => { RB.ui.settings.close(); RB.ui.menu.close(); });
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__);
  await wait(p, 300);
  assert(await p.evaluate(() => RB.game.settings.suzuSpeech === 'kansai'), 'the choice survives a reload');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  assert(!requests.length, 'no network requests: ' + requests.join(' | '));
  await ctx.close();
}

// =========================================================================================== B. an existing campaign
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const { p, errors, requests } = await page(b, url, { context: ctx });
  await helpers(p);
  // a campaign where Suzu already travels with you, saved before this choice existed
  await p.evaluate(async () => {
    const s = window.__start('co.inn', 6, 8, { comp: 'suzu', flags: { departed: true, ch1_done: true, rw_echo_done: true, rw_hall_gather: true } });
    s.player.name = 'Kei';
    RB.save.setCurrent(1, 0);
    await RB.save.writeSlot(1, s, { force: true });
  });
  await p.evaluate(async () => { await RB.game.loadCampaign(1); });
  await wait(p, 900);
  for (let i = 0; i < 40 && (await p.evaluate(() => RB.script.isRunning() || RB.ui.dialogue.isOpen())); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await wait(p, 80); }
  assert(await p.evaluate(() => RB.game.s.comp === 'suzu' && !('suzuSpeech' in RB.game.settings)), 'loaded: Suzu travels with you; no speech setting yet');
  // a scene in which she speaks: afterwards the choice is offered once
  await p.evaluate(() => { RB.script.run('co.suzu_speech_standard'); });
  await wait(p, 200);
  const r0 = await playUntil(p, null, 20);
  await wait(p, 900);
  const asked = await p.evaluate(() => { const el = document.querySelector('.speech-sheet'); return el ? el.textContent.replace(/\s+/g, ' ') : null; });
  assert(r0 !== 'timeout' && asked && /New: Suzu can now speak Kansai-ben/.test(asked), 'a saved campaign with Suzu: offered once after a scene in which she speaks');
  await p.keyboard.press('Escape');
  await wait(p, 300);
  assert(await p.evaluate(() => !document.querySelector('.speech-sheet') && RB.game.settings.suzuSpeech === 'standard'), 'Escape keeps standard Japanese (and it is not asked again)');
  // the campaign as saved, to compare after switching
  const before = await p.evaluate(() => JSON.stringify(RB.game.s));
  // ---- Company › Suzu: Talk with Suzu
  await p.evaluate(() => RB.ui.menu.open('company'));
  await p.waitForSelector('.co-page');
  await wait(p, 200);
  const th = await p.evaluate(() => { const t = RB.company.thought(RB.game.s); return t && t.text; });
  const thK = await p.evaluate((t) => window.__kansai(t.jp, t.en), th);
  const ctl = await p.evaluate(() => {
    const sec = document.querySelector('.co-speech');
    if (!sec) return null;
    const talkH = [...document.querySelectorAll('.co-page h4')].find((h) => /Talk with Suzu/.test(h.textContent));
    const after = talkH && (talkH.compareDocumentPosition(sec) & Node.DOCUMENT_POSITION_FOLLOWING);
    const btns = [...sec.querySelectorAll('[data-suzu-speech-set]')].map((x) => ({ v: x.dataset.suzuSpeechSet, role: x.getAttribute('role'), checked: x.getAttribute('aria-checked'), h: Math.round(x.getBoundingClientRect().height), w: Math.round(x.getBoundingClientRect().width), text: window.__txt(x) }));
    return { label: sec.querySelector('h5').textContent, group: sec.querySelector('[role=radiogroup]').getAttribute('aria-labelledby'), text: sec.textContent.replace(/\s+/g, ' '), btns, inTalk: !!after, bare: window.__bare('.co-speech'), row: !!document.querySelector('[data-co-act="speech"]') };
  });
  assert(ctl && ctl.inTalk && ctl.row, 'Company › Suzu: the control sits in "Talk with Suzu", with the in-world row');
  assert(ctl && /How Suzu speaks/.test(ctl.label) && ctl.group === 'co-speech-h', 'labelled: ' + (ctl && ctl.label));
  assert(ctl && ctl.btns.length === 2 && ctl.btns.every((x) => x.role === 'radio' && x.h >= 44 && x.w >= 44), 'two radio buttons, each at least 44 px (' + (ctl && ctl.btns.map((x) => x.v + ' ' + x.w + '×' + x.h).join(', ')) + ')');
  assert(ctl && ctl.btns[0].checked === 'true' && ctl.btns[1].checked === 'false', 'the current choice is shown (Standard)');
  assert(ctl && /regional dialect/.test(ctl.text) && /switch back any time/.test(ctl.text), 'one plain sentence for learners');
  assert(ctl && !ctl.bare.length, 'its Japanese labels carry furigana');
  const thoughtStd = await p.evaluate(() => window.__txt('.co-thought'));
  assert(thoughtStd.indexOf(await p.evaluate((jp) => window.__plain(jp), th.jp)) >= 0, 'her thought on the page, standard');
  // switch with a real click
  await p.locator('[data-suzu-speech-set="kansai"]').click();
  await wait(p, 300);
  const on = await p.evaluate(() => ({ v: RB.game.settings.suzuSpeech, checked: [...document.querySelectorAll('[data-suzu-speech-set]')].map((x) => x.getAttribute('aria-checked')), thought: window.__txt('.co-thought'), focus: document.activeElement && document.activeElement.dataset.suzuSpeechSet, bare: window.__bare('.co-thought') }));
  assert(on.v === 'kansai' && on.checked.join() === 'false,true', 'one click: Kansai-ben, applied at once');
  assert(thK && on.thought.indexOf(await p.evaluate((jp) => window.__plain(jp), thK.jp)) >= 0, 'her thought on the Company page is now in Kansai-ben');
  assert(!on.bare.length, 'furigana on every kanji of her thought');
  // keyboard: back to standard with Enter on the focused option
  await p.focus('[data-suzu-speech-set="standard"]');
  await p.keyboard.press('Enter');
  await wait(p, 300);
  const off = await p.evaluate(() => ({ v: RB.game.settings.suzuSpeech, thought: window.__txt('.co-thought') }));
  assert(off.v === 'standard' && off.thought === thoughtStd, 'keyboard: Enter on Standard switches back; her thought is standard again');
  // Settings reflects the Company page (one setting)
  await p.locator('[data-suzu-speech-set="kansai"]').click();
  await wait(p, 250);
  await p.evaluate(() => RB.ui.menu.open('settings'));
  await p.waitForSelector('[data-grp=reading]');
  await p.click('[data-grp=reading]');
  await wait(p, 200);
  assert(await p.isChecked('input[data-suzu-speech][value="kansai"]'), 'Settings reflects the change made on the Company page');
  await p.click('label.opt:has(input[data-suzu-speech][value="standard"])');
  await wait(p, 250);
  assert(await p.evaluate(() => RB.game.settings.suzuSpeech === 'standard'), 'and Settings switches it back');
  await p.evaluate(() => { RB.ui.settings.close(); RB.ui.menu.open('company'); });
  await p.waitForSelector('.co-speech');
  await wait(p, 200);
  assert(await p.evaluate(() => document.querySelector('[data-suzu-speech-set="standard"]').getAttribute('aria-checked') === 'true'), 'the Company page shows the choice made in Settings');
  // the in-world way: ask her (the conversation plays, then the page comes back)
  await p.locator('[data-co-act="speech"]').click();
  await wait(p, 400);
  const askLine = await playUntil(p, (d) => /Backstage/i.test(d.en));
  const d2 = await dlg(p);
  assert(askLine === 'line' && (await p.evaluate(() => RB.game.settings.suzuSpeech)) === 'kansai', 'asking her in the world switches to Kansai-ben: ' + (d2 && d2.en.slice(0, 50)));
  await finish(p);
  await wait(p, 400);
  // ---- other systems while Kansai: a scene line, the history, a shiritori invitation
  await p.evaluate(() => RB.ui.menu.isOpen() && RB.ui.menu.close());
  await wait(p, 200);
  const view = await sceneLines(p, 'cs.talk_view', 'suzu');
  if (view.length) {
    await p.evaluate(() => { RB.script.run('cs.talk_view'); });
    await wait(p, 300);
    const want = await p.evaluate((l) => window.__kansai(l.jp, l.en), view[0]);
    const got = await playUntil(p, (d) => d.en.trim() === want.en, 40);
    const d3 = await dlg(p);
    assert(got === 'line' && d3.jp === (await p.evaluate((jp) => window.__plain(jp), want.jp)) && d3.ruby > 0 && !d3.bare.length, 'a case scene: her line in Kansai-ben with furigana (' + (d3 && d3.jp.slice(0, 20)) + ')');
    await finish(p);
  }
  await p.evaluate(() => RB.ui.menu.open('history'));
  await p.waitForSelector('.folio');
  await wait(p, 200);
  const histK = await p.evaluate(() => window.__txt('.folio'));
  const lastStd = await p.evaluate(() => { const l = RB.game.s.backlog.filter((x) => x.who === 'suzu').pop(); return l; });
  const lastK = await p.evaluate((l) => window.__kansai(l.jp, l.en), lastStd);
  const keptStd = await p.evaluate((jp) => RB.dialect.table('kansai').has(RB.dialect.norm(jp)), lastStd.jp);
  assert(lastK && histK.indexOf(await p.evaluate((jp) => window.__plain(jp), lastK.jp)) >= 0 && keptStd, 'History shows her lines in Kansai-ben; the campaign keeps them standard');
  await p.evaluate(() => RB.ui.menu.close());
  await wait(p, 200);
  // shiritori: her invitation at the table (Company › Wordplay › Play, at the inn)
  await p.evaluate(() => { const r = RB.wordplay.rec(RB.game.s); if (r && r.firsts) r.firsts.invited = 0; RB.ui.menu.open('company'); });
  await p.waitForSelector('.co-page');
  await wait(p, 200);
  const playBtn = await p.evaluate(() => { const b = document.querySelector('[data-co-sec="wordplay"][data-wp-act="play"]:not([disabled])'); if (b) b.scrollIntoView(); return !!b; });
  if (playBtn) {
    await p.locator('[data-co-sec="wordplay"][data-wp-act="play"]').click();
    await p.waitForSelector('.wp-prep', { timeout: 8000 });
    await wait(p, 300);
    const inv = await p.evaluate(() => { const l = RB.content.wordplay.lines.find((x) => x.comp === 'suzu' && /invite/.test(x.id)); const k = window.__kansai(l.jp, l.en); const say = document.querySelector('.wp-prep .wp-say'); return { got: say && window.__txt(say.querySelector('.jp')), want: k && window.__plain(k.jp), en: say && say.querySelector('.en').textContent, wantEn: k && k.en, bare: window.__bare('.wp-prep .wp-say') }; });
    assert(inv.got === inv.want && inv.en === inv.wantEn && !inv.bare.length, 'shiritori: her invitation in Kansai-ben (' + inv.got + ' / ' + inv.en + ')');
    await p.locator('.wp-prep [data-wp="leave"]').click().catch(() => {});
    await wait(p, 400);
  } else assert(false, 'Company › Wordplay offers Play at the inn');
  await p.evaluate(() => RB.ui.menu.isOpen() && RB.ui.menu.close());
  await wait(p, 200);
  // the campaign is unchanged by all the switching (only the scenes played add to the history)
  const after = await p.evaluate(() => JSON.parse(JSON.stringify(RB.game.s)));
  const was = JSON.parse(before);
  const kansaiText = await p.evaluate(() => { const out = []; for (const [, e] of RB.dialect.table('kansai')) if (!e.same && !e.sameJp) out.push(RB.jp.plain(e.jp)); return out; });
  const ser = JSON.stringify(after);
  const leaked = kansaiText.filter((t) => t.length > 8 && ser.indexOf(t) >= 0).slice(0, 3);
  assert(!leaked.length, 'no Kansai text was written into the campaign (' + leaked.join(' | ') + ')');
  assert(!('suzuSpeech' in after) && !JSON.stringify(after.flags || {}).includes('speech') && JSON.stringify(after.learn) === JSON.stringify(was.learn), 'the campaign carries no speech setting; learning records untouched');
  await p.evaluate(async () => { await RB.save.writeSlot(1, RB.game.s, { force: true }); });
  const sv = await p.evaluate(async () => { const r = await RB.save.read(1); const st = await RB.save.loadSettings(); return { comp: r.state.comp, has: JSON.stringify(r.state).includes('suzuSpeech'), setting: st && st.suzuSpeech }; });
  assert(sv.comp === 'suzu' && !sv.has && sv.setting === 'kansai', 'the slot holds no trace of the setting; the settings record holds suzuSpeech = kansai');
  // reload: the choice persists, the Company page shows it
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__);
  await helpers(p);
  await p.evaluate(async () => { await RB.game.loadCampaign(1); });
  await wait(p, 900);
  for (let i = 0; i < 40 && (await p.evaluate(() => RB.script.isRunning() || RB.ui.dialogue.isOpen())); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await wait(p, 80); }
  await p.evaluate(() => RB.ui.menu.open('company'));
  await p.waitForSelector('.co-speech');
  await wait(p, 200);
  const re = await p.evaluate(() => ({ v: RB.game.settings.suzuSpeech, checked: document.querySelector('[data-suzu-speech-set="kansai"]').getAttribute('aria-checked'), sheet: !!document.querySelector('.speech-sheet') }));
  assert(re.v === 'kansai' && re.checked === 'true' && !re.sheet, 'after a reload: still Kansai-ben, shown on the Company page, and not asked again');
  // and off again from the Company page: standard
  await p.locator('[data-suzu-speech-set="standard"]').click();
  await wait(p, 300);
  assert(await p.evaluate(() => RB.game.settings.suzuSpeech === 'standard' && window.__txt('.co-thought').length > 0), 'turned off on the Company page: standard again');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  assert(!requests.length, 'no network requests: ' + requests.join(' | '));
  await ctx.close();
}

// =========================================================================================== C. a phone (390×844)
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const { p, errors } = await page(b, url, { context: ctx });
  await helpers(p);
  await p.evaluate(() => window.__start('co.inn', 6, 8, { comp: 'suzu', flags: { departed: true, ch1_done: true } }));
  await p.evaluate(() => RB.ui.menu.open('company'));
  await p.waitForSelector('.co-speech');
  await p.evaluate(() => document.querySelector('.co-speech').scrollIntoView());
  await wait(p, 250);
  const ph = await p.evaluate(() => ({
    btns: [...document.querySelectorAll('[data-suzu-speech-set]')].map((x) => { const r = x.getBoundingClientRect(); return { h: Math.round(r.height), l: Math.round(r.left), r: Math.round(r.right) }; }),
    over: document.documentElement.scrollWidth > innerWidth + 1,
  }));
  assert(ph.btns.length === 2 && ph.btns.every((x) => x.h >= 44 && x.l >= 0 && x.r <= 390), 'phone: the Company control fits the width, each button at least 44 px (' + JSON.stringify(ph.btns) + ')');
  assert(!ph.over, 'phone: no horizontal scrolling');
  await p.locator('[data-suzu-speech-set="kansai"]').tap();
  await wait(p, 250);
  assert(await p.evaluate(() => RB.game.settings.suzuSpeech === 'kansai'), 'phone: a tap switches to Kansai-ben');
  await p.evaluate(() => { RB.ui.menu.close(); RB.ui.suzuSpeech.ask({ reason: 'existing' }); });
  await p.waitForSelector('.speech-sheet');
  await wait(p, 200);
  const sh = await p.evaluate(() => { const r = document.querySelector('.speech-sheet').getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), opts: [...document.querySelectorAll('.speech-opt')].map((o) => Math.round(o.getBoundingClientRect().height)) }; });
  assert(sh.l >= 0 && sh.r <= 390 && sh.opts.every((h) => h >= 44), 'phone: the choice sheet fits the screen (' + JSON.stringify(sh) + ')');
  await p.keyboard.press('Escape');
  await wait(p, 250);
  assert(await p.evaluate(() => !document.querySelector('.speech-sheet') && RB.game.settings.suzuSpeech === 'kansai'), 'phone: Escape closes the sheet and keeps the current choice');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await ctx.close();
}

await b.close();
srv.close();
console.log(fail ? fail + ' FAILED' : 'all passed');
process.exit(fail ? 1 : 0);
