// Too Many Goats: Tetsuji's first talk once the storm has begun, and his line after the lamp (Agnes 6546145159,
// 6546381905; Local CL-559; Cloud CC-401). In Chromium on the built game, on throwaway journeys seeded at his pen gate
// (never a real save), Tetsuji talked to through the world's own interact, what is said recorded as it is said:
//  1. before the storm: "This morning I opened the shed…" and "…before the storm.", as before, and the quest started;
//  2. after the lamp, the quest not begun: "The goats want to look outside.", then "The morning before the storm…" and
//     no deadline, and the quest started;
//  3. after the lamp, the quest done: "The kids want to look outside.", and nothing more;
//  4. the original lines keep their recordings: on a small voice site built from the current script with synthetic
//     test tones standing in for recordings (tests/e2e/voice_fixture.mjs; no voice is generated), each line said plays
//     the file the scene's own index gives its key; before the storm that is the two intro lines' original keys, and
//     after the lamp with the quest done the kids' line's (whether the real recordings play on the hosted voice site
//     is checked there, in a browser that can reach it);
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/goat_intro.mjs
import fs from 'node:fs';
import os from 'node:os';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { launch, page, root } from './lib.mjs';
import { makeVoiceSite } from './voice_fixture.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

// the game, and a small voice site for Tetsuji's scene at /voices-test/
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-goat-'));
const fx = makeVoiceSite(tmp, { scenes: ['sb.tetsuji'] });
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

const L = {
  morning: /^I own ten goats\. This morning I opened the shed/,
  before: /^I own ten goats\. The morning before the storm, I opened the shed/,
  deadline: /^They need returning to their owner before the storm\./,
  noDeadline: /^They need returning to their owner\. But no one's come forward\./,
  kids: /^With the observatory lamp lit, the shed's bright at night\. The kids want to look outside\.$/,
  goats: /^With the observatory lamp lit, the shed's bright at night\. The goats want to look outside\.$/,
};
const KEYS = { morning: 'sb.tetsuji#99e1209fc2', deadline: 'sb.tetsuji#7510b8993c', kids: 'sb.tetsuji#5248c5e78b' };

async function begin(p, o) {
  await p.evaluate(async (o) => {
    const flags = Object.assign({ departed: true, ch1_done: true, ch2_done: true, ch3_done: true }, o.lamp ? { sb_storm: true, sb_morning: true, sb_lamp_lit: true } : {});
    const s = RB.game.debugStart('sb.hamlet', 10, 28, { edition: RB.edition.forNew(), dir: 'up', comp: 'nao', flags });
    if (o.done) RB.state.setQuest(s, 'sb_goats', 'done');
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
const talk = (p) => p.evaluate(async () => {
  window.__said = [];
  const there = RB.world.W.npcs.some((n) => n.id === 'tetsuji');
  if (there) await RB.test.talk('tetsuji');
  const q = RB.game.s.quests.sb_goats;
  return { there, said: window.__said.slice(), quest: q ? (q.done ? 'done' : q.stage) : null };
});
const has = (l, re) => l.some((x) => re.test(x));

// 1: before the storm
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, {});
  const r = await talk(p);
  ok(r.there && has(r.said, L.morning) && has(r.said, L.deadline) && !has(r.said, L.before) && !has(r.said, L.noDeadline) && r.quest === 0,
    '1 before the storm: "This morning…" and "…before the storm.", as before, and the quest started (' + JSON.stringify({ lines: r.said.length, quest: r.quest }) + ')');
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

// 2–3: after the lamp
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { lamp: true });
  const r = await talk(p);
  ok(r.there && L.goats.test(r.said[0] || '') && has(r.said, L.before) && has(r.said, L.noDeadline) && !has(r.said, L.morning) && !has(r.said, L.deadline) && !has(r.said, L.kids) && r.quest === 0,
    '2 after the lamp, not begun: "The goats want to look outside.", then "The morning before the storm…" and no deadline, and the quest started (' + JSON.stringify(r.said.slice(0, 3).map((x) => x.slice(0, 50))) + ')');
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { lamp: true, done: true });
  const r = await talk(p);
  ok(r.there && r.said.length === 1 && L.kids.test(r.said[0] || '') && r.quest === 'done',
    '3 after the lamp, done: "The kids want to look outside.", and nothing more (' + JSON.stringify(r.said) + ')');
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

// 4: the recordings (the automated player moves on after 5 ms, before a scene's index can arrive: here each line is
// held a moment, then moved on, as a person would)
const shard = JSON.parse(fs.readFileSync(path.join(fx.lang, fx.index.scenes['sb.tetsuji']), 'utf8'));
const fileOf = (key) => ((shard.lines[key] || [])[0] || {}).f || null;
for (const c of [{ name: 'before the storm', o: {}, keep: ['morning', 'deadline'] }, { name: 'after the lamp, done', o: { lamp: true, done: true }, keep: ['kids'] }]) {
  const context = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const { p, errors } = await page(b, url, { context, voiceSite: true });
  const reqs = [];
  p.on('request', (r) => { if (/\/voices-test\//.test(r.url())) reqs.push(r.url().replace(/^.*\/voices-test\/ja-JP\//, '')); });
  await begin(p, Object.assign({ voices: true }, c.o));
  const run = await p.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const S = RB.voicebank._.S, plays = () => S.log.filter((x) => x.k === 'play').map((x) => x.f);
    RB.test.talk('tetsuji').catch(() => {});
    RB.test.disable();
    await wait(300);
    const shown = [];
    let last = null; // (the last line stays shown a moment after it is moved on from: a line seen again at once is the same one)
    for (let i = 0; i < 12 && RB.script.isRunning(); i++) {
      const cur = RB.ui.dialogue.shown();
      if (!cur || (last && cur.en === last.en && cur.jp === last.jp)) { await wait(100); continue; }
      last = cur;
      await wait(1200);
      shown.push({ en: cur.en, jp: cur.jp });
      RB.ui.dialogue.advance();
      await wait(250);
    }
    return { shown, plays: plays(), running: RB.script.isRunning() };
  });
  // each line shown, its key from its Japanese as the scene has it, and the file the scene's index gives that key
  const cmds = await p.evaluate(() => RB.content.scenes['sb.tetsuji'].cmds.filter((x) => x.jp).map((x) => ({ en: x.en, jp: x.jp })));
  const keyOfEn = (en) => { const m = cmds.find((x) => x.en === en); return m ? 'sb.tetsuji#' + crypto.createHash('sha256').update(m.jp).digest('hex').slice(0, 10) : null; };
  const keys = run.shown.map((x) => keyOfEn(x.en));
  const expect = keys.map(fileOf);
  const kept = c.keep.map((k) => ({ k, said: run.shown.some((x) => L[k].test(x.en || '')), key: keys[run.shown.findIndex((x) => L[k].test(x.en || ''))] || null }));
  const idx = reqs.some((r) => /^idx\/s\/sb\.tetsuji\./.test(r));
  ok(!run.running && idx && expect.every(Boolean) && JSON.stringify(run.plays) === JSON.stringify(expect) && kept.every((x) => x.said && x.key === KEYS[x.k]),
    '4 ' + c.name + ': each line plays the file its key is given in the scene\'s own index (synthetic site), the original lines under their own keys: ' + JSON.stringify({ idx, kept, plays: run.plays.length, shown: run.shown.length }) + (JSON.stringify(run.plays) === JSON.stringify(expect) ? '' : ' ' + JSON.stringify({ shown: run.shown.map((x) => (x.en || '').slice(0, 40)), keys, plays: run.plays, expect })));
  ok(!errors.filter((e) => !/Failed to load resource/.test(e)).length, '4 ' + c.name + ': no page errors ' + errors.slice(0, 3).join(' | '));
  await context.close();
}

console.log(`\ngoat_intro: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); fs.rmSync(tmp, { recursive: true, force: true }); process.exit(fail ? 1 : 0);
