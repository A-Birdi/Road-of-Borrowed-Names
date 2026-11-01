// Denji's three things the morning after the storm, heard at the inn or not (Agnes 6545296917, 6545425537; Local
// CL-554, CL-555; Cloud CC-398). In Chromium on the built game, on throwaway journeys seeded at Yukimiya Inn (never a
// real save), the talks through the world's own interact (and the door through the real movement code), what is said
// recorded as it is said:
//  1. the storm night: the inn's door holds ("…the number one rule in Snowbell!"), and you stay inside;
//  2. the night talk heard, then the morning (seeded: the night's sleep is its own scene): Denji's "…the three things
//     I told you last night" and his line about Hoshino; Hoshino's "Denji told you, didn't he";
//  3. missed, Denji first: the night's four lines told now, then the line about Hoshino, never "last night"; asked
//     again, only the line about Hoshino; then Hoshino's "Denji told you";
//  4. missed, Hoshino first: "…ask Denji", then Denji tells it;
//  5. the night's lines, told in the morning, play their own recordings: on a small voice site built from the current
//     script with synthetic test tones standing in for recordings (tests/e2e/voice_fixture.mjs; no voice is
//     generated), each of the four plays the file the night scene's own index gives it (whether the real recordings
//     play on the hosted voice site is checked there, in a browser that can reach it);
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/denji_catchup.mjs
import fs from 'node:fs';
import os from 'node:os';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { launch, page, root } from './lib.mjs';
import { makeVoiceSite } from './voice_fixture.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

// the game, and a small voice site for the three scenes at /voices-test/
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-denji-'));
const fx = makeVoiceSite(tmp, { scenes: ['sb.denji_morning', 'sb.storm_denji', 'sb.morning_hoshino'] });
const TYPES = { '.html': 'text/html; charset=utf-8', '.opus': 'audio/ogg', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const f = p.startsWith('/voices-test/') ? path.join(fx.site, p.slice('/voices-test/'.length)) : path.join(root, p === '/' ? 'index.html' : p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${srv.address().port}/`;
const b = await launch();

const NIGHT_FIRST = 'If you\'re going up to the observatory, listen.';
const LAST_NIGHT = /Don't forget the three things I told you last night\./, HOSHINO_TOO = /^And look after Hoshino for me\./;
const TOLD = /As for inside… Denji told you, didn't he\./, ASK = /As for inside… ask Denji\./, RULE = /number one rule in Snowbell/;

async function begin(p, o) {
  await p.evaluate(async (o) => {
    const flags = Object.assign({ departed: true, ch1_done: true, ch2_done: true, ch3_done: true, sb_storm: true }, o.night ? {} : { sb_morning: true });
    const s = RB.game.debugStart('sb.inn', 8, 9, { dir: 'down', flags });
    s.comp = 'nao';
    if (o.heard) s.seen['sb.storm_denji'] = true;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    if (o.voices) RB.voicebank.configure({ base: './voices-test/ja-JP/' });
    RB.test.enable({});
    await new Promise((r) => setTimeout(r, 600));
    RB.world.refreshActors();
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
  }, o);
}
const talk = (p, id) => p.evaluate(async (id) => {
  window.__said = [];
  const there = RB.world.W.npcs.some((n) => n.id === id);
  if (there) await RB.test.talk(id);
  return { there, said: window.__said.slice() };
}, id);
const has = (l, re) => l.some((x) => re.test(x));
const told = (l) => l[0] === NIGHT_FIRST && l.length === 5 && HOSHINO_TOO.test(l[4]) && !has(l, LAST_NIGHT);

// 1–2: the storm night, then the morning
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { night: true });
  const door = await p.evaluate(async () => {
    window.__said = [];
    RB.test.place(8, 10, 'down');
    await RB.test.step('down');
    return { said: window.__said.slice(), map: RB.world.W.map.id };
  });
  ok(door.map === 'sb.inn' && has(door.said, RULE), '1 the storm night: the inn\'s door holds, and you stay inside (' + JSON.stringify(door) + ')');
  const night = await talk(p, 'denji');
  await p.evaluate(() => { RB.game.s.flags.sb_morning = true; RB.world.refreshActors(); });
  const d = await talk(p, 'denji'), h = await talk(p, 'hoshino');
  ok(night.there && night.said[0] === NIGHT_FIRST && d.said.length === 2 && LAST_NIGHT.test(d.said[0]) && HOSHINO_TOO.test(d.said[1]) && has(h.said, TOLD) && !has(h.said, ASK),
    '2 heard at night, then the morning: Denji\'s "last night" and the line about Hoshino; Hoshino\'s "Denji told you" (' + JSON.stringify({ night: night.said.length, d: d.said }) + ')');
  ok(!errors.length, '1–2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

// 3: missed, Denji first
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, {});
  const d1 = await talk(p, 'denji'), d2 = await talk(p, 'denji'), h = await talk(p, 'hoshino');
  const st = await p.evaluate(() => ({ flag: !!RB.game.s.flags.sb_denji_catchup, seen: !!RB.game.s.seen['sb.storm_denji'] }));
  ok(told(d1.said) && st.flag && st.seen, '3 missed, Denji first: the night\'s four lines told now, then the line about Hoshino, no "last night" (' + JSON.stringify({ d1: d1.said.map((x) => x.slice(0, 30)), st }) + ')');
  ok(d2.said.length === 1 && HOSHINO_TOO.test(d2.said[0]) && has(h.said, TOLD) && !has(h.said, ASK), '3 asked again: only the line about Hoshino; then Hoshino\'s "Denji told you" (' + JSON.stringify({ d2: d2.said }) + ')');
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

// 4: missed, Hoshino first
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, {});
  const h = await talk(p, 'hoshino'), d = await talk(p, 'denji');
  ok(has(h.said, ASK) && !has(h.said, TOLD) && told(d.said), '4 missed, Hoshino first: "…ask Denji", then Denji tells it (' + JSON.stringify({ h: h.said.filter((x) => /inside/.test(x)), d: d.said.length }) + ')');
  ok(!errors.length, '4 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

// 5: the night's lines play their own recordings (the automated player moves on after 5 ms, before a scene's index
// can arrive: here each line is held a moment, then moved on, as a person would)
{
  const context = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const { p, errors } = await page(b, url, { context, voiceSite: true });
  const reqs = [];
  p.on('request', (r) => { if (/\/voices-test\//.test(r.url())) reqs.push(r.url().replace(/^.*\/voices-test\/ja-JP\//, '')); });
  await begin(p, { voices: true });
  const run = await p.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const S = RB.voicebank._.S, plays = () => S.log.filter((x) => x.k === 'play').map((x) => x.f);
    RB.test.talk('denji').catch(() => {});
    RB.test.disable();
    await wait(300);
    // each line held long enough for its recording to start (it starts as the line shows), then moved on
    const shown = [];
    for (let i = 0; i < 10 && RB.script.isRunning(); i++) {
      const cur = RB.ui.dialogue.shown();
      if (!cur) { await wait(100); continue; }
      await wait(1200);
      shown.push(cur.en);
      RB.ui.dialogue.advance();
      await wait(250);
    }
    return { shown, plays: plays(), running: RB.script.isRunning() };
  });
  // the night scene's recordings, as the site files them (its own scene index, keyed by the night scene's name)
  const shard = JSON.parse(fs.readFileSync(path.join(fx.lang, fx.index.scenes['sb.storm_denji']), 'utf8'));
  const nightCmds = await p.evaluate(() => RB.content.scenes['sb.storm_denji'].cmds.filter((c) => c.jp).map((c) => c.jp));
  const files = nightCmds.map((jp) => ((shard.lines['sb.storm_denji#' + crypto.createHash('sha256').update(jp).digest('hex').slice(0, 10)] || [])[0] || {}).f || null);
  const idx = reqs.some((r) => /^idx\/s\/sb\.storm_denji\./.test(r));
  const played = run.plays.slice(0, 4);
  ok(told(run.shown) && !run.running && idx && files.every(Boolean) && run.plays.length === run.shown.length && JSON.stringify(played) === JSON.stringify(files),
    '5 told in the morning, each of the night\'s four lines plays its own recording from the night scene\'s own index (synthetic site): ' + JSON.stringify({ idx, played, files }));
  ok(!errors.filter((e) => !/Failed to load resource/.test(e)).length, '5 no page errors ' + errors.slice(0, 3).join(' | '));
  await context.close();
}

console.log(`\ndenji_catchup: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); fs.rmSync(tmp, { recursive: true, force: true }); process.exit(fail ? 1 : 0);
