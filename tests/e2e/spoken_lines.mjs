// Robin, 2026-10-19: "every line in-game should have spoken lines with properly highlightable text as well. This goes
// the same for the Records section"; and "the closed door in Reedwake. The Narrator can effectively read that one".
// Against a real voice site built from the current script by tools/voice/voice_site.mjs, with synthetic test tones
// standing in for the recordings (tests/e2e/voice_fixture.mjs); headless Chromium has no Japanese system voice, so a
// line heard here is its recording:
//  - the prologue's captions are spoken as they appear, from their own recordings (scene 'prologue'); the spoken word
//    is marked as it is said; Voice says a caption again; pointing at a word marks its counterpart; leaving stops it;
//  - a Records replay speaks its lines from the scene's recordings;
//  - a shut door's words are the narrator's recording (scene 'code.door'), through the world's own interact();
//  - (2026-10-20, "If something isn't set up to be spoken yet, explain why and find a proper way to resolve it
//    completely") each family wired then, through the game's own code path: a stamp stand, a sealed spot, a layered
//    site's mark, the companion's thought, the New Game+ farewell, the pinned page, the Atlas, a press reader, the
//    case's viewpoint, a kept memory's replay; and the panels: the Weave sheet's look at an animal's place, an action's
//    sheet, fishing, the shiritori table, a letter's acknowledgement (a Voice button, the spoken word marked).
// Usage: node tools/build.mjs && node tests/e2e/spoken_lines.mjs
import fs from 'node:fs';
import os from 'node:os';
import http from 'node:http';
import path from 'node:path';
import { launch, page, root } from './lib.mjs';
import { makeVoiceSite } from './voice_fixture.mjs';

let pass = 0, fail = 0;
async function test(name, fn) {
  if (process.env.ONLY && !name.includes(process.env.ONLY)) return; // (ONLY=<part of a name>: run just those)
  const t0 = Date.now();
  try { await fn(); pass++; console.log('PASS', name, `(${((Date.now() - t0) / 1000).toFixed(0)} s)`); }
  catch (e) { fail++; console.log('FAIL', name + ':', e.message.split('\n')[0]); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

const { RB: RBN } = await import('../../tools/voice/lines.mjs');
const REPLAY = 'ch1.bridge';
const replayScene = RBN.sequence.get(REPLAY).scene;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-spoken-'));
const MEMORY = 'ch2.notice', memoryScene = RBN.sequence.get(MEMORY).scene;
const fx = makeVoiceSite(tmp, {
  scenes: ['prologue', replayScene, 'code.door', 'code.fw', 'code.history', 'code.battle', 'code.wb', 'code.stamp', 'code.town', 'code.verbs', 'code.comp',
    'code.ngplus', 'code.pages', 'code.atlas', 'mp.press_react', 'cs.view_seat', memoryScene, 'code.weave', 'code.fish', 'code.play', 'code.letters', 'ws.ask'],
  refs: [], tones: 24,
});
const TYPES = { '.html': 'text/html; charset=utf-8', '.opus': 'audio/ogg', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const f = p.startsWith('/voices-test/') ? path.join(fx.site, p.slice('/voices-test/'.length)) : path.join(root, p === '/' ? process.env.RB_PAGE || 'index.html' : p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${srv.address().port}/`;
const b = await launch();

async function open() {
  const pg = await page(b, url, { voiceSite: true });
  await pg.p.evaluate(() => {
    RB.voicebank.configure({ base: './voices-test/ja-JP/' });
    const st = RB.game.settings; st.voice.mode = 'prepared'; st.voice.autoRec = true; st.voice.highlight = true; st.prologueSeen = true;
    window.__vb = () => { const S = RB.voicebank._.S; return { plays: S.log.filter((x) => x.k === 'play').map((x) => x.f), playing: !!(S.el && !S.el.paused && S.el.currentTime > 0.03) }; };
  });
  return pg;
}
const vb = (p) => p.evaluate(() => window.__vb());
const played = (p, n) => p.waitForFunction((n) => window.__vb().plays.length >= n && window.__vb().playing, n, { timeout: 8000, polling: 50 });

await test('the prologue speaks each caption from its own recording, marks the spoken word, and stops when left', async () => {
  const pg = await open(), p = pg.p;
  await p.evaluate(() => { RB.ui.create.prologue(); });
  await p.waitForSelector('.seq-view .txt .main .jline[data-src]');
  await played(p, 1);
  let s = await vb(p);
  assert(/^rec\/narrator\//.test(s.plays[0]), 'the first caption is the narrator\'s recording: ' + s.plays.join(','));
  const shape = await p.evaluate(() => ({ jp: !!document.querySelector('.seq-view .txt .main .jline[data-src]'), en: !!document.querySelector('.seq-view .txt .sub .enline'), voice: (() => { const v = document.querySelector('.seq-view [data-a=voice]'); return !!v && !v.hidden; })() }));
  assert(shape.jp && shape.en && shape.voice, 'the caption is a spoken line: Japanese, its English, a Voice button: ' + JSON.stringify(shape));
  await p.waitForSelector('.seq-view .txt .main .jt.spk', { timeout: 4000 });
  // Next: the next caption, its own recording
  await p.evaluate(() => { const n = document.querySelector('.seq-view [data-a=next]'); n.click(); n.click(); });
  await p.waitForFunction(() => window.__vb().plays.length >= 2 && window.__vb().plays[window.__vb().plays.length - 1] !== window.__vb().plays[0], null, { timeout: 8000, polling: 50 });
  s = await vb(p);
  assert(s.plays.length >= 2 && /^rec\/narrator\//.test(s.plays[s.plays.length - 1]) && s.plays[s.plays.length - 1] !== s.plays[0], 'the second caption, another recording: ' + s.plays.join(','));
  // Voice says it again
  const n0 = s.plays.length;
  await p.evaluate(() => { RB.voice.cancel(); document.querySelector('.seq-view [data-a=voice]').click(); });
  await played(p, n0 + 1);
  // pointing at a word marks its counterpart (once the voice is quiet: the spoken mark has the line while it speaks)
  await p.evaluate(() => { RB.voice.cancel(); RB.ui.speechMark.stop(); });
  const tok = await p.evaluate(() => { const t = [...document.querySelectorAll('.seq-view .txt .main .jt[data-i]')].find((e) => /茶屋/.test(e.textContent)); if (!t) return null; t.setAttribute('data-probe', '1'); return t.textContent; });
  assert(tok, 'the caption has the word 茶屋');
  await p.hover('.seq-view [data-probe="1"]');
  await p.waitForSelector('.seq-view .txt .sub .ew.hov', { timeout: 3000 });
  const hov = await p.evaluate(() => [...document.querySelectorAll('.seq-view .txt .sub .ew.hov')].map((e) => e.textContent).join(' '));
  assert(/teahouse/i.test(hov), 'pointing at 茶屋 marks "teahouse": ' + hov);
  // leaving: nothing goes on speaking
  await p.evaluate(() => document.querySelector('.seq-view [data-a=voice]').click());
  await played(p, n0 + 2);
  await p.evaluate(() => document.querySelector('.seq-view [data-a=skip]').click());
  await p.waitForFunction(() => !document.querySelector('.seq-view'), null, { timeout: 5000 });
  await p.waitForTimeout(300);
  s = await vb(p);
  assert(!s.playing && !(await p.evaluate(() => RB.ui.speechMark.active())), 'nothing speaks once the prologue is left');
  assert(!pg.errors.length, pg.errors.join(' | '));
  await p.context().close();
});

await test('a Records replay speaks its lines from the scene\'s recordings', async () => {
  const pg = await open(), p = pg.p;
  const st = await p.evaluate((seq) => {
    const beats = RB.volume.beats(seq, RB.volume.fixtureTest('ren'), 'ren');
    RB.sequence.view({ seq, beats, label: 'Replay', name: 'seq-replay', seen: () => true, skip: { label: 'Close' }, replay: true, speakers: true });
    return { n: beats.length, scene: beats[0] && beats[0].line.sceneId, who: beats[0] && beats[0].line.who };
  }, REPLAY);
  assert(st.n > 0 && st.scene === replayScene, 'the beats name their scene: ' + JSON.stringify(st));
  await played(p, 1);
  const s = await vb(p);
  assert(/^rec\/[a-z0-9_]+\//.test(s.plays[0]), 'the replay\'s first line plays its recording: ' + s.plays.join(','));
  await p.waitForSelector('.seq-view .txt .main .jt.spk', { timeout: 4000 });
  assert(!pg.errors.length, pg.errors.join(' | '));
  await p.context().close();
});

await test('a shut door\'s words are the narrator\'s recording', async () => {
  const pg = await open(), p = pg.p;
  const at = await p.evaluate(() => {
    for (const id of Object.keys(RB.content.maps)) {
      const m = RB.maps.compile(id);
      const d = (m.shut || []).find((x) => !x.if && !x.text && !RB.maps.blockedStatic(m, x.x, x.y + 1));
      if (d) return { id, x: d.x, y: d.y };
    }
    return null;
  });
  assert(at, 'a map with a shut door');
  await p.evaluate((at) => { RB.game.debugStart(at.id, at.x, at.y + 1, {}); RB.game.settings.textSpeed = 'instant'; RB.game.applySettings(); }, at);
  await p.waitForTimeout(300);
  await p.evaluate(() => { RB.world.W.player.dir = 'up'; RB.world.interact(); });
  await played(p, 1);
  const s = await vb(p);
  const line = await p.evaluate(() => { const l = RB.ui.dialogue.shown(); return l ? l.jp : ''; });
  assert(/^rec\/narrator\//.test(s.plays[0]) && /閉/.test(line), 'the door says it is shut, in the narrator\'s recording: ' + s.plays.join(',') + ' / ' + line);
  assert(!pg.errors.length, pg.errors.join(' | '));
  await p.context().close();
});

// Robin, 2026-10-19: "The swinging board between Old Yasu and Ren in Reedwake, along with its clamp - no Narrator
// speaking. Old Yasu's story, when listening, has not begun being spoken."
await test('the swinging screen and its clamp (a field puzzle) say what you see in the narrator\'s recording', async () => {
  for (const key of ['screen', 'clamp']) {
    const pg = await open(), p = pg.p;
    await p.evaluate(() => { RB.game.debugStart('rw.village', 20, 20, {}); RB.game.settings.textSpeed = 'instant'; RB.game.applySettings(); });
    await p.waitForTimeout(300);
    // what the object's inspection scene says first (!hook fw_look f1 <key>: src/content/discovery/30_scenes.js)
    await p.evaluate((key) => { RB.hooks.fw_look(['f1', key]); }, key);
    await played(p, 1);
    const s = await vb(p);
    const line = await p.evaluate(() => { const l = RB.ui.dialogue.shown(); return l ? l.jp : ''; });
    assert(/^rec\/narrator\//.test(s.plays[0]) && /衝|留/.test(line), key + ': the narrator\'s recording of what you see: ' + s.plays.join(',') + ' / ' + line);
    assert(!pg.errors.length, pg.errors.join(' | '));
    await p.context().close();
  }
});

await test('Old Yasu tells his story of Reedwake in his own recordings', async () => {
  const pg = await open(), p = pg.p;
  await p.evaluate(() => { RB.game.debugStart('rw.village', 20, 20, {}); RB.game.settings.textSpeed = 'instant'; RB.game.applySettings(); RB.activities.run('rw.a_history'); });
  await played(p, 1);
  const s = await vb(p);
  const line = await p.evaluate(() => { const l = RB.ui.dialogue.shown(); return l ? { who: l.who, jp: l.jp } : null; });
  assert(/^rec\/yasu\//.test(s.plays[0]) && line && line.who === 'yasu', 'the first fragment is Yasu\'s recording: ' + s.plays.join(',') + ' / ' + JSON.stringify(line));
  assert(!pg.errors.length, pg.errors.join(' | '));
  await p.context().close();
});

// Robin, 2026-10-19: "After defeating an enemy, the Narrator does not voice the dialogue given." A battle's lines (its
// intro, a phase, the line once the creature is settled) are said through one function, under one scene id: the intro
// here, in the narrator's recording.
await test('a battle\'s lines are the narrator\'s recordings (the intro; the settled line goes the same way)', async () => {
  const pg = await open(), p = pg.p;
  await p.evaluate(() => { RB.game.debugStart('rw.road', 14, 9, {}); RB.game.settings.textSpeed = 'instant'; RB.game.applySettings(); });
  await p.waitForTimeout(300);
  await p.evaluate(() => { RB.game.startBattle('rw.reedling', {}); });
  await played(p, 1);
  const s = await vb(p);
  const line = await p.evaluate(() => { const l = RB.ui.dialogue.shown(); return l ? l.jp : ''; });
  assert(/^rec\/narrator\//.test(s.plays[0]) && /光/.test(line), 'the intro is the narrator\'s recording: ' + s.plays.join(',') + ' / ' + line);
  assert(!pg.errors.length, pg.errors.join(' | '));
  await p.context().close();
});

// Robin, 2026-10-19: "The 'have you seen' dialogue interactions have no voiced lines from either the player nor the NPC
// I've talked to - tried with Bunta and Tomo." Asked after Hana, Tomo's answer is Tomo's recording, and your question is
// shown under the same scene id (your own voice's recording when one is made).
await test('"Have you seen…?": the question and Tomo\'s answer are spoken lines', async () => {
  const pg = await open(), p = pg.p;
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.village', 8, 24, { flags: { departed: true, ch1_done: true, sg_arrived: true } });
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.town.seen(s, 'hana', 'rw.tea');
    const tomo = RB.world.W.npcs.find((n) => n.id === 'tomo');
    const o = tomo.def.talk.find((x) => !x.if || RB.state.test(s, x.if));
    s.seen[o.scene] = true;
    RB.test.place(tomo.x + 1, tomo.y, 'left');
    tomo.def.wander = 0;
    RB.world.interact();
  });
  const state = () => p.evaluate(() => ({ choices: [...document.querySelectorAll('.choice')].map((c) => c.textContent.trim()), line: RB.ui.dialogue.isOpen() ? RB.ui.dialogue.shown() : null, mode: RB.game.mode(), plays: window.__vb().plays }));
  // wait for a condition on the page, reporting what was there if it never comes
  const until = async (what, fn, arg) => { try { await p.waitForFunction(fn, arg, { timeout: 10000, polling: 100 }); } catch (e) { throw new Error(what + ' never came: ' + JSON.stringify(await state())); } };
  const pick = async (src) => {
    await until('a choice ' + src, (src) => [...document.querySelectorAll('.choice')].some((c) => new RegExp(src).test(c.textContent)), src);
    await p.evaluate((src) => [...document.querySelectorAll('.choice')].find((c) => new RegExp(src).test(c.textContent)).click(), src);
  };
  await pick('Have you seen');
  await pick('Hana');
  await until('your question', () => { const l = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return !!(l && l.who === 'pc' && /Hana/.test(l.en)); });
  await p.waitForTimeout(400);
  await p.evaluate(() => RB.ui.dialogue.advance(true));
  await until('Tomo\'s answer', () => { const l = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return !!(l && l.who === 'tomo'); });
  await until('Tomo\'s recording', () => window.__vb().plays.some((f) => /^rec\/tomo\//.test(f)));
  assert(!pg.errors.length, pg.errors.join(' | '));
  await p.context().close();
});

// ---- 2026-10-20: the families wired then, each through the game's own code -------------------------------------------
// a recording of this speaker was played, the last one for this scene (RB.voicebank's own record of what it played)
const heard = async (p, speaker, scene, what) => {
  try {
    await p.waitForFunction(([sp, sc]) => { const S = RB.voicebank._.S; return S.log.some((x) => x.k === 'play' && x.f.startsWith('rec/' + sp + '/')) && S.lastScene === sc; }, [speaker, scene], { timeout: 10000, polling: 50 });
  } catch (e) {
    const st = await p.evaluate(() => ({ plays: window.__vb().plays, last: RB.voicebank._.S.lastScene, line: RB.ui.dialogue.isOpen() ? RB.ui.dialogue.shown() : null }));
    throw new Error(what + ': no recording of ' + speaker + ' for ' + scene + ' — ' + JSON.stringify(st));
  }
};
// a journey on a map, with its arrival scenes already seen (nothing else speaks first)
async function at(p, map, x, y, o) {
  await p.evaluate(([map, x, y, o]) => {
    const seen = {};
    for (const ev of (RB.content.maps[map].onEnter || [])) seen['enter:' + map + ':' + ev.scene] = true;
    RB.game.debugStart(map, x, y, Object.assign({ edition: RB.edition.forNew() }, o, { flags: Object.assign(seen, o.flags || {}) }));
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
  }, [map, x, y, o || {}]);
  await p.waitForTimeout(300);
}
const done = async (pg) => { assert(!pg.errors.length, pg.errors.join(' | ')); await pg.p.context().close(); };

await test('a stamp stand with nothing to press says so in the narrator\'s recording (code.stamp)', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'rw.village', 20, 20);
  await p.evaluate(() => { RB.hooks.rb_stand(['reedwake'], {}); });
  await heard(p, 'narrator', 'code.stamp', 'the stand');
  assert(/判/.test(await p.evaluate(() => RB.ui.dialogue.shown().jp)), 'the stand\'s line is shown');
  await done(pg);
});
await test('a sealed spot, examined, says its hint in the narrator\'s recording (code.town)', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'rw.village', 20, 20);
  await p.evaluate(() => { RB.hooks.sealed([Object.keys(RB.content.sealed)[0]]); });
  await heard(p, 'narrator', 'code.town', 'the hint');
  await done(pg);
});
await test('a layered site\'s mark, reached, is the narrator\'s recording (code.verbs)', async () => {
  const pg = await open(), p = pg.p;
  const spec = await p.evaluate(() => { const sp = RB.verbs.list('layers').find((x) => !x.fixture); return { id: sp.id, map: sp.map, mark: sp.plan.marks[0].id }; });
  await at(p, spec.map, 5, 5);
  await p.evaluate((spec) => { RB.hooks.vb_mark([], { trigger: { vb: spec.id, mark: spec.mark } }); }, spec);
  await heard(p, 'narrator', 'code.verbs', 'the mark');
  await done(pg);
});
await test('the companion\'s thought ("What\'s on your mind?") is the companion\'s recording (code.comp)', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'rw.village', 20, 20, { comp: 'mio', flags: { departed: true } });
  await p.evaluate(() => { RB.script.run('co.mind'); });
  await heard(p, 'mio', 'code.comp', 'Mio\'s thought');
  await done(pg);
});
await test('the New Game+ farewell is the ending journey\'s companion\'s recording (code.ngplus)', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'rw.village', 20, 20, { comp: 'ren' });
  await p.evaluate(() => { const from = JSON.parse(JSON.stringify(RB.game.s)); from.comp = 'ren'; RB.ui.ngplus.farewell(from); });
  await heard(p, 'ren', 'code.ngplus', 'Ren\'s goodbye');
  await done(pg);
});
await test('the finished page, looked at, is the narrator\'s recording (code.pages)', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'rw.hall', 10, 10, { comp: 'nao' });
  await p.evaluate(() => {
    const s = RB.game.s, [desc, title] = RB.pages.describe({ kind: 'lanterns' });
    s.company.project = { v: 1, comp: 'nao', stage: 3, theme: 'next', caption: 0, ev: { run: 'r1', id: 'o_x', kind: 'lanterns', desc, title }, road: {} };
    RB.hooks.pages_display();
  });
  await heard(p, 'narrator', 'code.pages', 'the pinned page');
  await done(pg);
});
await test('the Atlas, before the story is finished, says so in the narrator\'s recording (code.atlas)', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'rw.hall', 10, 10);
  await p.evaluate(() => { RB.hooks.atlas_start([], {}); });
  await heard(p, 'narrator', 'code.atlas', 'the Atlas');
  await done(pg);
});
await test('a press reader\'s reaction is the reader\'s own recording (mp.press_react)', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'rw.village', 20, 20);
  const who = await p.evaluate(() => {
    const s = RB.game.s, r = RB.content.press.readers.find((x) => RB.content.chars[x.who || x.id]);
    const pr = RB.practice.of(s);
    pr.press = { v: 1, version: 1, printed: { story: 1, notice: 0 }, heard: {}, rx: { [r.id]: 0 } };
    s.flags['press_rx_' + r.id] = true;
    RB.hooks.press_react([r.id]);
    return r.who || r.id;
  });
  await heard(p, who, 'mp.press_react', 'the reader');
  await done(pg);
});
await test('the view from the case\'s viewpoint is the narrator\'s recording (cs.view_seat)', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'sb.obs_path', 10, 37);
  await p.evaluate(() => { RB.hooks.cs_look(['seat']); });
  await heard(p, 'narrator', 'cs.view_seat', 'the view');
  await done(pg);
});
await test('a kept memory (Company › Shared memories), replayed, speaks its lines from their scene\'s recordings', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'rw.village', 20, 20, { comp: 'mio' });
  const st = await p.evaluate((seq) => {
    const def = RB.sequence.get(seq), sc = RB.content.scenes[def.scene], shot = Object.keys(def.shots)[0];
    const says = sc.cmds.filter((c) => c.op === 'say').slice(0, 2);
    const ref = { kind: 'seq', seq, beats: says.map((c) => [shot, 0, def.scene, c.line, RB.sequence.lineHash(c)]), cast: { comp: { id: 'mio' } } };
    const beats = RB.sequence.beatsOf(ref);
    RB.sequence.replay(ref);
    return { n: beats.length, scene: beats[0] && beats[0].line.sceneId, who: beats[0] && beats[0].line.who };
  }, MEMORY);
  assert(st.n === 2 && st.scene === memoryScene, 'the replayed beats name their scene: ' + JSON.stringify(st));
  await heard(p, st.who === 'narr' ? 'narrator' : st.who, memoryScene, 'the memory\'s first line');
  await p.waitForSelector('.seq-view .txt .main .jt.spk', { timeout: 4000 });
  await done(pg);
});
await test('the Weave sheet\'s look at an animal\'s place has a Voice button: the narrator\'s recording (code.weave)', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'rw.village', 14, 24, { flags: { rw_echo_done: true } });
  const opened = await p.evaluate(() => { RB.game.s.words = Object.keys(RB.content.words).slice(0, 3); return RB.weave.open({ pz: null, key: 'pet:cat' }); });
  assert(opened !== false, 'the Weave sheet opens by the loose reed screen');
  await p.waitForSelector('.weave-sheet .wv-look .say-line [data-say-voice]', { timeout: 4000 });
  await p.click('.weave-sheet .wv-look .say-line [data-say-voice]');
  await heard(p, 'narrator', 'code.weave', 'the look');
  await p.waitForSelector('.weave-sheet .wv-look .say-line .jt.spk', { timeout: 4000 });
  await done(pg);
});
await test('an action\'s sheet says what was done (as it appears, and Voice): the field puzzles\' recording (code.fw)', async () => {
  const pg = await open(), p = pg.p;
  const sp = await p.evaluate(() => { const x = RB.verbs.get('kr_hall_lamp'); return { map: x.map, x: x.x, y: x.y }; });
  await at(p, sp.map, sp.x, sp.y + 1, { flags: { postgame: true } });
  await p.evaluate(() => { RB.verbSheets.open('kr_hall_lamp'); });
  await p.waitForSelector('.verb-sheet [data-a=inspect]');
  await p.click('.verb-sheet [data-a=inspect]');
  await heard(p, 'narrator', 'code.fw', 'what you see of the lamp');
  await p.waitForSelector('.verb-sheet .vb-said .say-line [data-say-voice]', { timeout: 4000 });
  await p.waitForSelector('.verb-sheet .vb-said .say-line .jt.spk', { timeout: 4000 });
  await done(pg);
});
await test('fishing: the companion\'s remark over the stage is the companion\'s recording (code.fish)', async () => {
  const pg = await open(), p = pg.p;
  const S = await p.evaluate(() => { const S = RB.fishing.site('fish.reedwake.current'); return { map: S.map, x: S.stand.x, y: S.stand.y, dir: S.stand.dir }; });
  await at(p, S.map, S.x, S.y, { comp: 'mio', dir: S.dir, flags: { postgame: true, rw_echo_done: true, departed: true, rw_arrived: true, rw_mill_open: true, rw_road_lit: true, bridge_fixed: true } });
  await p.evaluate(() => { RB.game.settings.activityChatter = 'normal'; RB.game.s.seen['rw.village_first'] = true; RB.activity.launch('fishing', { source: 'world-prop', site: 'fish.reedwake.current' }); });
  await p.waitForSelector('.fish-wrap .fs-say .say-line', { timeout: 10000 });
  await heard(p, 'mio', 'code.fish', 'Mio\'s first remark');
  await done(pg);
});
await test('shiritori: the companion\'s invitation at the table is the companion\'s recording, the spoken word marked (code.play)', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'co.inn', 6, 8, { comp: 'nao', flags: { departed: true, ch1_done: true } });
  await p.evaluate(() => { const s = RB.game.s; s.chapter = 2; RB.practice.set(s, 'demoSeen', true); RB.company.sync(s, 'live'); RB.ui.wordplay.launch({ source: 'words' }); });
  await p.waitForSelector('.wp-prep .wp-say.say-line', { timeout: 10000 });
  await heard(p, 'nao', 'code.play', 'Nao\'s invitation');
  await p.waitForSelector('.wp-prep .say-line .jt.spk', { timeout: 4000 });
  await done(pg);
});

await test('a letter answered: the villager\'s acknowledgement is their recording, said as it appears (code.letters)', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'co.post', 6, 5, { comp: 'nao', dir: 'right', flags: { postgame: true, ch2_done: true } });
  // (Hana's letter comes once you have met her)
  await p.evaluate(() => { const s = RB.game.s; s.seen['rw.hana_first'] = true; s.learn.profile = 'E'; s.learn.kanaKnown = 'both'; RB.game.settings.input = 'hand'; RB.activity.launch('letters', { source: 'words' }); });
  await p.waitForSelector('[data-pb-letter="L01"]', { timeout: 8000 });
  await p.evaluate(() => document.querySelector('[data-pb-letter="L01"]').click());
  await p.waitForSelector('.pb-letter .pb-pieces', { timeout: 8000 });
  const tile = await p.evaluate(() => {
    const plain = (e) => { const c = e.cloneNode(true); c.querySelectorAll('rt, .sr, .en, .enline').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
    const t = [...document.querySelectorAll('.pb-pieces .tile')].find((e) => plain(e) === '届きました。');
    if (t) t.click();
    return !!t;
  });
  assert(tile, 'the reply piece "届きました。"');
  await p.waitForSelector('[data-pb-send]:not([disabled])', { timeout: 8000 });
  await p.evaluate(() => document.querySelector('[data-pb-send]').click());
  await p.waitForSelector('.pb-close .pb-ack .say-line', { timeout: 8000 });
  await heard(p, 'hana', 'code.letters', 'Hana\'s acknowledgement');
  await done(pg);
});

await test('asking back "more simply": the speaker\'s simpler version is said from its own recording', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'rw.village', 20, 20);
  await p.evaluate(() => { RB.script.run('ws.ask'); });
  await p.waitForFunction(() => { const l = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); if (l && l.who === 'narr') RB.ui.dialogue.advance(true); return !!(l && l.who === 'koji'); }, null, { timeout: 10000, polling: 200 });
  await heard(p, 'koji', 'ws.ask', 'Kōji\'s line');
  const first = await p.evaluate(() => window.__vb().plays.slice(-1)[0]);
  await p.evaluate(() => { RB.voice.cancel(); document.querySelector('.dlg .b-ask').click(); });
  await p.waitForSelector('.dlg-ask [data-ask="2"]');
  await p.click('.dlg-ask [data-ask="2"]');
  await p.waitForFunction((f) => { const pl = window.__vb().plays; const last = pl[pl.length - 1]; return last && last !== f && last.startsWith('rec/koji/') && RB.voicebank._.S.lastScene === 'ws.ask'; }, first, { timeout: 8000, polling: 50 });
  assert(/水/.test(await p.evaluate(() => RB.ui.dialogue.shown().jp)), 'the simpler version is shown');
  await done(pg);
});

await test('Company: what is on the companion\'s mind has a Voice button, the companion\'s recording (code.comp)', async () => {
  const pg = await open(), p = pg.p;
  await at(p, 'rw.village', 20, 20, { comp: 'mio', flags: { departed: true } });
  await p.evaluate(() => RB.ui.menu.open('company'));
  await p.waitForSelector('.co-thought .say-line [data-say-voice]', { timeout: 8000 });
  await p.click('.co-thought .say-line [data-say-voice]');
  await heard(p, 'mio', 'code.comp', 'Mio\'s thought on the page');
  await p.waitForSelector('.co-thought .say-line .jt.spk', { timeout: 4000 });
  await done(pg);
});

await b.close();
srv.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`spoken_lines: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
