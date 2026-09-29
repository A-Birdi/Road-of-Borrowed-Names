// Quest guidance in the built game (src/engine/56_questguide.js,
// 62_questmarks.js, the Journey and Map pages, Settings › Quest guidance):
// - the derived next step for representative stages in every chapter;
// - the marker above the right person on this map, the edge pointer when the
//   target is off-screen, and the arrow over the way out on another map
//   (rw.road → the village square; the village → Kiku's door);
// - the Journey: the followed quest first and marked, "Next: …" in words,
//   nudges revealed one at a time and never recorded as mistakes, "Show on
//   the map" following the quest and marking its place on the chart;
//   follow and unfollow;
// - hidden during dialogue and battles; the three settings modes; reduced
//   motion stops the bob; Japanese labels; a phone with touch controls
//   (edge pointers stay above them); 320×640 at 200 % text; no page errors.
// Screenshots: tests/e2e/out/quest_guide/ (WebP copies: docs/screenshots/quest_guide/).
// Usage: node tests/e2e/quest_guide.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OUT = path.join(root, 'tests/e2e/out/quest_guide');
const DOCS = path.join(root, 'docs/screenshots/quest_guide');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(DOCS, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const shots = [];
async function shot(p, name, half) {
  const f = path.join(OUT, name + '.png');
  await p.evaluate(() => document.querySelectorAll('.notice').forEach((n) => n.remove())); // passing notices
  await p.screenshot({ path: f });
  shots.push({ f, name, half });
}

const RW = { rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_met_ren: true, rw_letters_done: true, rw_bottles_done: true };
async function start(p, map, x, y, flags, quests, extra) {
  await p.evaluate(async ([map, x, y, flags, quests, extra]) => {
    const s = RB.game.debugStart(map, x, y, Object.assign({ dir: 'up', flags }, extra || {}));
    // this map's arrival scenes have already happened at this point of the story
    for (const ev of RB.content.maps[map].onEnter || []) s.flags['enter:' + map + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    let t = Date.now() - 100000;
    for (const [q, v] of quests) { RB.state.setQuest(s, q, v); s.quests[q].t = (t += 1000); }
    if (extra && extra.travel) s.travel = extra.travel;
    RB.questMarks.refresh();
    await new Promise((r) => setTimeout(r, 1300)); // past the map's settling-in moment
  }, [map, x, y, flags, quests, extra || null]);
}
const marks = (p) => p.evaluate(() => RB.questMarks.marks());
const learnSnap = (p) => p.evaluate(() => JSON.stringify({ stats: RB.game.s.learn.stats, items: RB.game.s.learn.items }));
async function openJourney(p) {
  await p.evaluate(() => { if (RB.ui.menu.isOpen()) RB.ui.menu.close(); RB.ui.menu.open('journal'); });
  await p.waitForSelector('.qguide', { timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(150);
}
async function closeMenu(p) { await p.evaluate(() => { RB.ui.menu.close(); }); await p.waitForTimeout(400); }

// ---- 1. desktop: Chapter 1, the square -------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'rw.village', 21, 16, RW, [['rw_tools', 0], ['rw_labels', 1]]);
  const tg = await p.evaluate(() => RB.questGuide.targets('rw_labels').targets.map((t) => t.map + ':' + (t.id || t.p) + (t.kind === 'prop' ? '@' + t.x + ',' + t.y : '')).sort());
  assert(JSON.stringify(tg) === JSON.stringify(['rw.tea:hana', 'rw.village:deadlantern@20,22', 'rw.village:deadlantern@32,18', 'rw.village:suzu']),
    'rw_labels half done: next step = those not yet helped: ' + tg.join(', '));
  const m = await marks(p);
  assert(m.qid === 'rw_labels', 'the main road is followed by default: ' + m.qid);
  // the marker over Suzu: centred on her, just above her head
  // (a standing person's head reaches about 24 art px above their tile's top; 1 art px = scale / 2 CSS px)
  const suzu = await p.evaluate(() => { const a = RB.world.W.npcs.find((n) => n.id === 'suzu'); const c = RB.render.tileToCss(a.fx, a.fy); const k = RB.render.viewSize().scale; return { x: c.x + 8 * k, top: c.y - 12 * k, art: k / 2 }; });
  const ms = m.marks.find((x) => x.id === 'suzu');
  assert(ms && !ms.edge && Math.abs(ms.cssX - suzu.x) <= 4 && ms.cssY <= suzu.top && ms.cssY >= suzu.top - 12 * suzu.art, 'a marker sits just above Suzu’s head (' + JSON.stringify(ms) + ' vs head ' + JSON.stringify(suzu) + ')');
  const west = m.marks.find((x) => x.tx === 20 && x.ty === 22);
  assert(west && !west.edge, 'the south lantern on screen carries a marker');
  const east = m.marks.find((x) => x.tx === 32 && x.ty === 18);
  const vw = await p.evaluate(() => innerWidth);
  assert(east && east.edge && east.dir === 'right' && east.cssX <= vw - 4 && east.cssX >= vw - 60, 'the east lantern is off-screen: an edge pointer at the right edge (' + JSON.stringify(east) + ')');
  assert(!m.marks.some((x) => x.id === 'tsuru'), 'Tsuru (whose report is not ready yet) is not marked');
  await shot(p, 'world_markers_1280x800');

  // hidden during dialogue
  await p.evaluate(() => { RB.script.runInline([{ who: 'narr', jp: 'ここ で は {好|す}きな だけ {時間|じかん} を かけて いい 。', en: 'Take as long as you like.' }]); });
  await p.waitForTimeout(400);
  let m2 = await marks(p);
  assert(m2.marks.length === 0, 'no markers while dialogue is on screen');
  await p.evaluate(() => RB.ui.dialogue.advance(true));
  await p.waitForTimeout(500);
  m2 = await marks(p);
  assert(m2.marks.length > 0, 'markers back after the dialogue');

  // reduced motion: no bob; otherwise it bobs
  const ys = async () => { const out = new Set(); for (let i = 0; i < 12; i++) { const mm = await marks(p); const s = mm.marks.find((x) => x.id === 'suzu'); if (s) out.add(s.cssY); await p.waitForTimeout(90); } return out; };
  // the recorded anchor is fixed; the bob is in the drawing: compare the pixels over Suzu instead
  const px = async () => p.evaluate(() => { const mm = RB.questMarks.marks().marks.find((x) => x.id === 'suzu'); const cv = document.getElementById('world'); const d = devicePixelRatio; const c = document.createElement('canvas'); c.width = 1; c.height = 60; const g = c.getContext('2d'); g.drawImage(cv, Math.round(mm.cssX * d), Math.round((mm.cssY - 50) * d), 1, 60, 0, 0, 1, 60); const a = g.getImageData(0, 0, 1, 60).data; let first = -1; for (let i = 0; i < 60; i++) { const r = a[i * 4], gg = a[i * 4 + 1], bb = a[i * 4 + 2]; if (r > 200 && gg > 150 && gg < 200 && bb < 90) { first = i; break; } } return first; });
  const moving = new Set(); for (let i = 0; i < 14; i++) { moving.add(await px()); await p.waitForTimeout(110); }
  await p.evaluate(() => { RB.game.settings.reducedMotion = true; RB.game.applySettings(); });
  await p.waitForTimeout(200);
  const still = new Set(); for (let i = 0; i < 14; i++) { still.add(await px()); await p.waitForTimeout(110); }
  await p.evaluate(() => { RB.game.settings.reducedMotion = false; RB.game.applySettings(); });
  assert(moving.size >= 2 && !moving.has(-1), 'the marker bobs gently (' + [...moving].join(',') + ')');
  assert(still.size === 1 && !still.has(-1), 'with reduced motion it holds still (' + [...still].join(',') + ')');
  await ys();

  // ---- the Journey: followed first, "Next:", nudges ----
  const before = await learnSnap(p);
  await openJourney(p);
  const j = await p.evaluate(() => {
    const rows = [...document.querySelectorAll('.leaf button.entry[data-q]')].map((e) => e.dataset.q);
    const fol = document.querySelector('button.entry.followed');
    const btn = document.querySelector('[data-follow="rw_labels"]');
    return { rows, fol: fol && fol.dataset.q, folText: fol && fol.textContent, pressed: btn && btn.getAttribute('aria-pressed'), next: [...document.querySelectorAll('.qnext .nline')].map((e) => e.textContent) };
  });
  assert(j.rows[0] === 'rw_labels' && j.fol === 'rw_labels' && /Following/.test(j.folText), 'the followed quest is first and marked "Following": ' + j.rows.join(', '));
  assert(j.pressed === 'true', 'its Follow button is pressed');
  assert(j.next.length === 4 && j.next.some((t) => /Next: Suzu, in Reedwake — (south-west|west|south) of you/.test(t)) && j.next.some((t) => /Hana, in Hana's Teahouse — head \w+(-\w+)? first/.test(t)),
    'the words for the markers: ' + j.next.join(' | '));
  await shot(p, 'journey_follow_1280x800');
  // nudges, one at a time
  const nudgeState = () => p.evaluate(() => ({ shown: document.querySelectorAll('.nudges li').length, btn: (document.querySelector('[data-nudge]') || {}).textContent || null, texts: [...document.querySelectorAll('.nudges li')].map((e) => e.textContent) }));
  let n0 = await nudgeState();
  assert(n0.shown === 0 && /Show a nudge\s*1 of 3/.test(n0.btn), 'no nudge shown until asked: ' + n0.btn);
  await p.click('[data-nudge]');
  let n1 = await nudgeState();
  assert(n1.shown === 1 && /Look for Suzu in Reedwake/.test(n1.texts[0]) && /Another nudge\s*2 of 3/.test(n1.btn), 'nudge 1: where and who (' + n1.texts[0].slice(0, 120) + ')');
  const focused = await p.evaluate(() => document.activeElement && (document.activeElement.dataset.nudge || document.activeElement.tagName));
  assert(focused === 'rw_labels', 'focus stays on the nudge button');
  await p.click('[data-nudge]');
  let n2 = await nudgeState();
  assert(n2.shown === 2 && /Talk to Suzu in Reedwake/.test(n2.texts[1]) && /Show on the map\s*3 of 3/.test(n2.btn), 'nudge 2: what to do and which way; then "Show on the map"');
  await p.evaluate(() => { const l = document.querySelectorAll('.leaf')[1]; l.scrollTop = l.scrollHeight; });
  await shot(p, 'journey_nudges_1280x800');
  await p.click('[data-nudge]');
  await p.waitForTimeout(300);
  const mp = await p.evaluate(() => ({ sec: RB.ui.menu.current().section, mark: !!document.querySelector('.chart .next-mark'), label: document.querySelector('.chart').getAttribute('aria-label'), note: (document.querySelector('.next-note') || {}).textContent, follow: RB.game.s.follow, here: !!document.querySelector('.chart path[fill="#a83e27"]') }));
  assert(mp.sec === 'map' && mp.mark && /next step of the followed quest is in Reedwake/.test(mp.label) && mp.here, 'nudge 3 shows the chart: the next step marked in Reedwake, "you are here" kept (' + mp.label + ')');
  assert(mp.follow === 'rw_labels', 'and follows the quest');
  await shot(p, 'map_chart_1280x800');
  const after = await learnSnap(p);
  assert(before === after, 'asking for nudges records nothing: learning stats and mastery unchanged');

  // follow a side quest: the list reorders, markers point to Kiku's door
  await p.evaluate(() => RB.ui.menu.open('journal'));
  await p.waitForTimeout(200);
  await p.click('.leaf button.entry[data-q="rw_tools"]');
  await p.waitForTimeout(200);
  await p.click('[data-follow="rw_tools"]');
  await p.waitForTimeout(200);
  const f2 = await p.evaluate(() => ({ follow: RB.game.s.follow, rows: [...document.querySelectorAll('.leaf button.entry[data-q]')].map((e) => e.dataset.q), pressed: document.querySelector('[data-follow="rw_tools"]').getAttribute('aria-pressed'), focus: document.activeElement && document.activeElement.dataset.follow, heading: document.querySelector('.leaf h3 .count').textContent }));
  assert(f2.follow === 'rw_tools' && f2.rows[0] === 'rw_tools' && f2.pressed === 'true' && f2.focus === 'rw_tools', 'follow a side quest: it moves first, pressed, focus kept (' + f2.rows.join(', ') + ')');
  assert(/followed, then the main road/.test(f2.heading), 'the heading says so: ' + f2.heading);
  await closeMenu(p);
  await p.waitForTimeout(500);
  const m3 = await marks(p);
  const door = m3.marks.find((x) => x.kind === 'exit');
  assert(m3.qid === 'rw_tools' && door && door.tx === 17 && door.ty === 28 && door.to === 'rw.house2', 'rw_tools (Kiku, in her house): the arrow over the way there — her door (' + JSON.stringify(door) + ')');
  await shot(p, 'world_exit_door_1280x800');
  // unfollow: back to the main road
  await p.evaluate(() => RB.ui.menu.open('journal'));
  await p.waitForTimeout(200);
  await p.click('.leaf button.entry[data-q="rw_tools"]');
  await p.waitForTimeout(150);
  await p.click('[data-follow="rw_tools"]');
  await p.waitForTimeout(150);
  const f3 = await p.evaluate(() => ({ follow: RB.game.s.follow, fq: RB.questGuide.followed() }));
  assert(f3.follow === undefined && f3.fq === 'rw_labels', 'unfollow the side quest: the main road again');
  await closeMenu(p);

  // battles hide the markers
  await p.evaluate(() => { RB.game.s.learn.kanaKnown = 'both'; RB.game.startBattle('rw.reedling', { foeKey: 'foe:test:x' }).then((r) => { window.__res = r; }); });
  await p.waitForTimeout(1500);
  const mb = await marks(p);
  assert(mb.marks.length === 0 && (await p.evaluate(() => RB.game.mode())) !== 'world', 'no markers during a battle');
  // step back from the encounter (as in systems.mjs)
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), flee: !!document.querySelector('[data-flee]'), res: window.__res }));
    if (st.res) break;
    if (st.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); continue; }
    if (st.flee) {
      await p.click('[data-flee]');
      await p.waitForSelector('[role=alertdialog] .foot button', { timeout: 5000 });
      await p.click('[role=alertdialog] .foot button >> nth=0');
      await p.waitForFunction(() => window.__res, null, { timeout: 10000 }).catch(() => {});
      break;
    }
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(500);
  const back = await p.evaluate(() => ({ res: window.__res, mode: RB.game.mode() }));
  assert(back.res === 'flee' && back.mode === 'world' && (await marks(p)).marks.length > 0, 'after stepping back from it, the markers return');

  // settings modes, through Settings › Learning & Challenge
  await p.evaluate(() => { RB.ui.menu.open('settings'); });
  await p.waitForTimeout(300);
  await p.click('[data-grp="learning"]').catch(() => {});
  await p.waitForTimeout(200);
  await p.click('input[data-set="questGuide"][value="hints"] >> xpath=..');
  await p.waitForTimeout(200);
  const sv = await p.evaluate(() => ({ v: RB.game.settings.questGuide, label: [...document.querySelectorAll('fieldset legend')].map((l) => l.textContent).includes('Quest guidance') }));
  assert(sv.v === 'hints' && sv.label, 'Settings › Quest guidance → Hints only');
  await shot(p, 'settings_guidance_1280x800');
  await p.evaluate(() => { RB.ui.settings.close(); RB.ui.menu.close(); });
  await p.waitForTimeout(500);
  const mh = await marks(p);
  assert(mh.marks.length === 0, 'Hints only: no markers in the world');
  await openJourney(p);
  const hj = await p.evaluate(() => ({ follow: !!document.querySelector('[data-follow]'), next: !!document.querySelector('.qnext'), btn: (document.querySelector('[data-nudge]') || {}).textContent, tag: !!document.querySelector('.ftag') }));
  assert(!hj.follow && !hj.next && !hj.tag && /1 of 2/.test(hj.btn), 'Hints only: no Follow, no "Next", two nudges (' + hj.btn + ')');
  const chartH = await p.evaluate(() => { RB.ui.menu.open('map'); return !!document.querySelector('.chart .next-mark'); });
  assert(!chartH, 'Hints only: nothing marked on the chart');
  await p.evaluate(() => { RB.game.settings.questGuide = 'off'; RB.ui.menu.open('journal'); });
  await p.waitForTimeout(200);
  const off = await p.evaluate(() => ({ g: !!document.querySelector('.qguide'), obj: !!document.querySelector('.qdetail .obj') }));
  assert(!off.g && off.obj, 'Off: objectives only');
  await p.evaluate(() => { RB.game.settings.questGuide = 'full'; RB.game.settings.uiLang = 'ja'; RB.ui.menu.open('journal'); });
  await p.waitForTimeout(200);
  const ja = await p.evaluate(() => { const b = document.querySelector('[data-follow]'); const h = [...document.querySelectorAll('.qguide .ph')].map((e) => e.innerHTML).join(''); return { b: b && b.innerHTML, h }; });
  assert(ja.b && /<ruby>追/.test(ja.b) && /class="sr"/.test(ja.b) && /<ruby>手/.test(ja.h), 'Japanese labels: 追う / 手がかり with furigana, English kept for screen readers');
  await shot(p, 'journey_ja_1280x800');
  await p.evaluate(() => { RB.game.settings.uiLang = 'en'; RB.ui.menu.close(); });

  // ---- the lantern road: the arrow toward the village square ----
  await start(p, 'rw.road', 3, 9, RW, [['rw_labels', 1]]);
  let mr = await marks(p);
  let ex = mr.marks.find((x) => x.kind === 'exit');
  const exitOk = await p.evaluate((ex) => ex && RB.world.W.map.exits.some((e) => e.to === 'rw.village' && ex.tx >= e.x && ex.tx < e.x + e.w && ex.ty >= e.y && ex.ty < e.y + e.h), ex);
  assert(ex && ex.edge && ex.dir === 'right' && exitOk && ex.to === 'rw.village', 'rw.road: the way to the square is off-screen to the east — an edge pointer toward that exit (' + JSON.stringify(ex) + ')');
  await shot(p, 'world_road_edge_1280x800');
  await p.evaluate(async () => { RB.world.enter('rw.road', 24, 9, 'right'); RB.questMarks.refresh(); await new Promise((r) => setTimeout(r, 1300)); });
  mr = await marks(p);
  ex = mr.marks.find((x) => x.kind === 'exit');
  assert(ex && !ex.edge && ex.dir === 'right' && ex.tx === 31 && ex.to === 'rw.village', 'near it: the arrow over the exit to the village, pointing out (' + JSON.stringify(ex) + ')');
  await shot(p, 'world_road_exit_1280x800');

  // ---- derived next steps across the chapters (live, in the page) ----
  const probe = async (map, x, y, flags, quests, qid, extra) => {
    await start(p, map, x, y, flags, quests, extra);
    return p.evaluate((qid) => { const r = RB.questGuide.targets(qid); return { how: r.how, t: r.targets.map((t) => t.map + ':' + (t.id || t.p || t.kind)).sort() }; }, qid);
  };
  let r = await probe('sg.harbor', 20, 22, { ch1_done: true, departed: true, sg_arrived: true }, [['sg_main', 3]], 'sg_main', { comp: 'mio', travel: { reedwake: true, saltglass: true } });
  assert(JSON.stringify(r.t) === JSON.stringify(['sg.glass:asahi', 'sg.harbor:kiyo', 'sg.lighthouse:genzo']), 'Ch2 sg_main 3: ' + r.t.join(', '));
  r = await probe('co.village', 20, 18, { ch2_done: true, departed: true, co_arrived: true, co_met_sayo: true, co_suspect: true, co_chronicle_read: true }, [['co_main', 3]], 'co_main', { comp: 'nao' });
  assert(JSON.stringify(r.t) === JSON.stringify(['co.glass:co_isao', 'co.terraces:co_ume', 'co.village:co_goro']), 'Ch3 co_main 3: ' + r.t.join(', '));
  const goro = (await marks(p)).marks.find((x) => x.id === 'co_goro');
  assert(goro, 'Ch3: Gorō in the square is marked');
  await shot(p, 'world_co_1280x800');
  r = await probe('sb.hamlet', 22, 30, { ch3_done: true, departed: true, sb_hamlet_seen: true }, [['sb_lamp', 0]], 'sb_lamp', { comp: 'ren' });
  assert(JSON.stringify(r.t) === JSON.stringify(['sb.inn:yae']), 'Ch4 sb_lamp 0: ' + r.t.join(', '));
  const inn = (await marks(p)).marks.find((x) => x.kind === 'exit');
  assert(inn && inn.to === 'sb.inn', 'Ch4: the arrow leads to the inn (' + JSON.stringify(inn) + ')');
  r = await probe('lf.town', 26, 20, { ch4_done: true, departed: true, lf_arrived: true, lf_town_intro: true }, [['lf_main', 0]], 'lf_main', { comp: 'suzu' });
  assert(JSON.stringify(r.t) === JSON.stringify(['lf.records:lf_tadashi']), 'Ch5 lf_main 0: ' + r.t.join(', '));
  r = await probe('lf.town', 26, 20, { ch4_done: true, departed: true, lf_arrived: true, lf_town_intro: true }, [['lf_main', 3], ['lf_akari', 0]], 'lf_akari', { comp: 'suzu' });
  assert(r.how === 'waiting' && !r.t.length, 'Ch5 lf_akari 0 waits on the main road: nothing marked');
  await p.evaluate(() => { RB.questGuide.follow('lf_akari'); RB.ui.menu.open('journal'); });
  await p.waitForTimeout(200);
  await p.click('.leaf button.entry[data-q="lf_akari"]').catch(() => {});
  await p.waitForTimeout(150);
  await p.click('[data-nudge]').catch(() => {});
  const wt = await p.evaluate(() => (document.querySelector('.nudges li') || {}).textContent || '');
  assert(/can’t take this further just yet/.test(wt), 'its nudge says so: ' + wt.slice(0, 90));
  await p.evaluate(() => RB.ui.menu.close());
  r = await probe('sa.gate', 12, 18, { ch5_done: true, departed: true, sa_arrived: true, sa_toya_read: true, sa_choice_mem: true, sa_choice_archive: true }, [['sa_main', 8]], 'sa_main', { comp: 'suzu' });
  assert(JSON.stringify(r.t) === JSON.stringify(['sa.gate:kasane']), 'Ch6 sa_main 8: ' + r.t.join(', '));
  assert(!errors.length, 'no page errors (desktop): ' + errors.join('; '));
  await p.context().close();
}

// ---- 2. phone, touch: edge pointers stay clear of the touch controls ------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 });
  await p.evaluate(() => { RB.game.settings.touch = 'on'; RB.game.applySettings(); });
  await start(p, 'rw.village', 21, 16, RW, [['rw_labels', 1]]);
  await p.waitForTimeout(400);
  const m = await marks(p);
  const pad = await p.evaluate(() => { let top = innerHeight; document.querySelectorAll('.touchpad .tp-move, .touchpad .tp-act, .touchpad button').forEach((e) => { const r = e.getBoundingClientRect(); if (r.height && e.offsetParent) top = Math.min(top, r.top); }); const h = document.querySelector('.hud').getBoundingClientRect(); return { top, hud: h.bottom }; });
  const edges = m.marks.filter((x) => x.edge);
  assert(m.marks.length >= 2, 'phone: markers shown (' + m.marks.length + ')');
  assert(edges.length >= 1 && edges.every((x) => x.cssY < pad.top - 4 && x.cssY - 18 > pad.hud), 'phone: edge pointers stay between the HUD and the touch controls (' + JSON.stringify(edges.map((e) => [e.cssX, e.cssY])) + ', pad top ' + pad.top + ', hud ' + pad.hud + ')');
  await shot(p, 'world_markers_390x844', true);
  await openJourney(p);
  await p.click('.leaf button.entry[data-q="rw_labels"]');
  await p.waitForTimeout(200);
  await p.click('[data-nudge]');
  await p.waitForTimeout(150);
  const sizes = await p.evaluate(() => [...document.querySelectorAll('.qguide button')].filter((e) => e.offsetParent).map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
  assert(sizes.length >= 2 && sizes.every(([w, h]) => w >= 44 && h >= 44), 'phone: guidance buttons are at least 44 px (' + JSON.stringify(sizes) + ')');
  await p.evaluate(() => { const e = document.querySelector('.qguide'); e.scrollIntoView({ block: 'start' }); });
  await shot(p, 'journey_390x844', true);
  assert(!errors.length, 'no page errors (phone): ' + errors.join('; '));
  await p.context().close();
}

// ---- 3. 320×640 at 200 % text --------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 320, height: 640 }, touch: true, mobile: true, dpr: 2 });
  await p.evaluate(() => { RB.game.settings.textScale = 2; RB.game.applySettings(); });
  await start(p, 'rw.village', 21, 16, RW, [['rw_labels', 1]]);
  await openJourney(p);
  await p.click('.leaf button.entry[data-q="rw_labels"]');
  await p.waitForTimeout(200);
  await p.click('[data-nudge]');
  await p.waitForTimeout(150);
  await p.click('[data-nudge]');
  await p.waitForTimeout(150);
  const o = await p.evaluate(() => {
    const leaf = document.querySelector('.leaf');
    const over = [...document.querySelectorAll('.qguide, .qguide *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).map((e) => e.className || e.tagName);
    return { sw: leaf.scrollWidth, cw: leaf.clientWidth, doc: document.documentElement.scrollWidth, over };
  });
  assert(o.sw <= o.cw + 1 && o.doc <= 321 && !o.over.length, '320 px at 200 % text: no sideways overflow (' + JSON.stringify(o) + ')');
  await p.evaluate(() => { const e = document.querySelector('.qguide'); e.scrollIntoView({ block: 'start' }); });
  await shot(p, 'journey_320x640_200pct', true);
  assert(!errors.length, 'no page errors (320): ' + errors.join('; '));
  await p.context().close();
}

// ---- Chapter 1's last main step closes when Chapter 2 begins; an older save that still holds it open reads it as completed
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'sg.road', 20, 20, Object.assign({}, RW, { departed: true, ch1_done: true, sg_arrived: true }), [['rw_depart', 1], ['sg_main', 0]], { chapter: 2 });
  await p.evaluate(() => { RB.game.s.chapter = 2; });
  await openJourney(p);
  const r = await p.evaluate(() => {
    const e = document.querySelector('.entry[data-q="rw_depart"]');
    return { cls: e ? e.className : null, kind: e ? e.querySelector('.kind').textContent : null, open: RB.game.s.quests.rw_depart.done || false, now: document.querySelector('.entry.current') && document.querySelector('.entry.current').dataset.q };
  });
  assert(r.cls && /\bdone\b/.test(r.cls) && /Completed/.test(r.kind), 'an older Chapter 2 save: Two Names reads as completed in the Journey (' + JSON.stringify(r) + ')');
  assert(r.open === false, 'the save itself is not changed by showing it');
  assert(r.now === 'sg_main', 'Chapter 2: the main road shown is sg_main (' + r.now + ')');
  await closeMenu(p);
  // a new journey: the first scene of Chapter 2 closes it
  const done = await p.evaluate(async () => {
    const s = RB.game.debugStart('sg.road', 20, 20, { dir: 'up', flags: { departed: true, ch1_done: true } });
    RB.game.settings.textSpeed = 'instant';
    RB.state.setQuest(s, 'rw_depart', 1);
    RB.test = RB.test || {}; const auto = RB.test.auto; RB.test.auto = true; // lines advance by themselves
    let end = false; RB.script.run('sg.arrive').then(() => { end = true; });
    for (let i = 0; i < 400 && !end; i++) await new Promise((r) => setTimeout(r, 25));
    RB.test.auto = auto;
    return !!(s.quests.rw_depart && s.quests.rw_depart.done);
  });
  assert(done, 'the arrival scene of Chapter 2 marks Two Names completed');
  assert(!errors.length, 'no page errors (older save): ' + errors.join('; '));
  await p.context().close();
}

// ---- WebP copies for docs/screenshots/quest_guide ------------------------------------------------------------------
{
  const p = await (await b.newContext()).newPage();
  for (const s of shots) {
    const data = 'data:image/png;base64,' + fs.readFileSync(s.f).toString('base64');
    const b64 = await p.evaluate(async ([data, half]) => {
      const img = new Image(); img.src = data; await img.decode();
      const k = half ? 0.5 : 1;
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d'); g.imageSmoothingEnabled = half; g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.9).split(',')[1];
    }, [data, !!s.half]);
    fs.writeFileSync(path.join(DOCS, s.name + '.webp'), Buffer.from(b64, 'base64'));
  }
  await p.context().close();
}
await b.close();
srv.close();
console.log(fail ? fail + ' FAILED' : 'all quest guidance checks passed');
process.exit(fail ? 1 : 0);
