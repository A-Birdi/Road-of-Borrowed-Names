// Practice addendum §23.2 (first two invariants), source side: no story, battle,
// puzzle, conversation or non-fishing activity acquires a clock, and none is on
// by default. The pace clock is created only by RB.pace.attempt (src/ui/69_pace.js);
// only fishing calls attempt(); the challenge runner and the pad act on pace hooks
// only when attempt() passes them. tests/e2e/pace.mjs checks the same at run time
// (ordinary challenges create no clock and show no Pace bar).
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  const files = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.js')) files.push(p); });
  walk(path.join(root, 'src'));
  const rel = (f) => path.relative(root, f).split(path.sep).join('/');
  // code only: comments may mention the pace without using it
  const strip = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/.*$/gm, '$1');
  const src = Object.fromEntries(files.map((f) => [rel(f), strip(fs.readFileSync(f, 'utf8'))]));
  const PACE = new Set(['src/ui/69_pace.js', 'src/engine/76_pace.js']);
  const FISHING = (f) => /^src\/(engine\/75_fishing|ui\/86_fishing|content\/fishing\/)/.test(f);

  const coreUsers = Object.keys(src).filter((f) => !PACE.has(f) && /paceCore/.test(src[f]));
  t.eq(coreUsers, [], 'nothing outside the pace module uses the pace core (no clock elsewhere)');
  const clockMakers = Object.keys(src).filter((f) => /\bC\.clock\(|paceCore\.clock\(/.test(src[f]));
  t.eq(clockMakers, ['src/ui/69_pace.js'], 'one place creates a pace clock: the fishing attempt');
  const callers = Object.keys(src).filter((f) => !PACE.has(f) && /RB\.pace\.attempt\(/.test(src[f]));
  t.ok(callers.every(FISHING), 'only fishing calls RB.pace.attempt (' + (callers.join(', ') || 'none in this checkout') + ')');
  // fishing's own `pace:` keys are its options to RB.pace.attempt, its cast record and a label;
  // it is checked separately below for the runner
  const paceOpts = Object.keys(src).filter((f) => !PACE.has(f) && !FISHING(f) && /\bpace\s*:/.test(src[f]));
  t.eq(paceOpts, ['src/ui/65_challenge.js'], 'no caller passes a pace option to the challenge runner; the runner only hands its own hooks to the pad');
  const fishRunner = Object.keys(src).filter((f) => FISHING(f) && (/RB\.challenge\.runStep\(/.test(src[f]) || /runOpts\s*:\s*\{[^}]*\bpace\s*:/.test(src[f])));
  t.eq(fishRunner, [], 'fishing never calls the challenge runner itself and puts no pace option in runOpts (only RB.pace.attempt does)');
  t.ok(/const PH = opts\.pace \|\| null;/.test(src['src/ui/65_challenge.js']) && /const PH = opts\.pace \|\| null;/.test(src['src/ui/60_pad.js']), 'the runner and the pad have hooks only when given');
  t.ok(/pace: PH,/.test(src['src/ui/65_challenge.js']), 'the runner passes the pad only its own (possibly null) hooks');
  const run = src['src/ui/65_challenge.js'];
  const runFn = run.slice(run.indexOf('async function run('), run.indexOf('function teachCard'));
  const practiceFn = run.slice(run.indexOf('async function practice('));
  t.ok(!/pace/.test(runFn) && !/pace/.test(practiceFn), 'authored challenges and notebook practice run without pace');
  // every PH use in the shared files is guarded, so nothing changes without a pace attempt
  const GUARD = /if \(PH(\s*&&[^)]*)?\)|PH &&|&& PH\b|PH \?/;
  for (const f of ['src/ui/65_challenge.js', 'src/ui/60_pad.js']) {
    const lines = src[f].split('\n');
    // a use is guarded on its own line or by the `if (PH …) {` block a few lines above it
    const bad = lines.map((l, i) => [l, i]).filter(([l, i]) => /\bPH\./.test(l) && !lines.slice(Math.max(0, i - 7), i + 1).some((x) => GUARD.test(x))).map(([l]) => l.trim());
    t.eq(bad, [], f + ': every pace hook is guarded by its presence');
  }

  // run-time defaults: Off, and the API keeps the foundation's contract
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const s = RB.state.newCampaign({});
  t.eq(RB.practice.settings(s).fishingPace, 'off', 'fishing pace is Off by default');
  t.ok(['attempt', 'budgets', 'available', 'setupHtml', 'wireSetup', 'openSetup', 'summary', 'settingsChanged', 'current'].every((k) => typeof RB.pace[k] === 'function') && RB.pace.provisional === false, 'RB.pace keeps the contract and is no longer provisional');
  const b = RB.pace.budgets(s, {});
  t.ok(['gentle', 'brisk', 'samples', 'needed', 'reason'].every((k) => k in b) && b.gentle === null && b.needed === 12, 'budgets() keeps its shape: { gentle, brisk, samples, needed, reason }');
  const step = { kind: 'write', answer: 'みぎ', accept: ['みぎ', '{右|みぎ}'], mode: 'kana' };
  t.eq([RB.pace.budgets(s, { step, inputMode: 'hand', pointerClass: 'mouse', representation: 'kana' }).reason, RB.pace.budgets(s, { step, inputMode: 'ime', representation: 'mixed' }).reason], ['collecting', 'collecting'], 'budgets for a step say Gentle/Brisk are still being prepared');
  t.ok(RB.pace.available(s, {}) && RB.pace.available(s, { step }), 'a pace can be offered (Custom at least) for a short answer');
  t.ok(!RB.pace.available(s, { step: { kind: 'write', answer: 'ゆっくりひきよせる', accept: ['ゆっくりひきよせる'], mode: 'kana' } }), 'but not for an answer too long to time');
  t.ok(/Pace/.test(RB.pace.setupHtml(s)) && /Off — A Quiet Cast/.test(RB.pace.setupHtml(s)) && /value="off" checked/.test(RB.pace.setupHtml(s)), 'the Pace control starts on Off — A Quiet Cast');
  t.ok(!/[一-鿿]/.test(RB.pace.setupHtml(s) + RB.pace.EXPIRY), 'the pace interface shows no kanji (so nothing needs furigana)');
  t.eq(RB.pace.EXPIRY, 'The line is loosening. Continue at your own pace, or let this one go.', 'the expiry message is the addendum\'s, word for word');
};
