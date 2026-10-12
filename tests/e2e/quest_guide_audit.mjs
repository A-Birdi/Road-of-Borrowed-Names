// Quest guidance, whole-game audit: the goal-directed driver
// (tests/e2e/drive.mjs, as in pursue.mjs) plays a new campaign through all
// six chapters, following the main road as the guidance does by default.
// Before every scene that starts in the world, the guidance is asked where
// the followed quest's next step is (fresh, from the live state); when that
// scene moves the quest on, the audit records whether the scene was one the
// guidance pointed at (a hit), or not (a miss, listed for review). The move
// is put down to the scene that was running when it happened, so a person's
// own conversation run inside "Have you seen…?" (wb.ask) is the one judged
// (logged "… (in wb.ask)"), and a person's conversation must be that person's.
// The hook and its rules: tests/e2e/guide_audit_hook.mjs; the case it was
// made for, with a negative control: tests/e2e/quest_guide_wrapped.mjs.
// Usage: node tests/e2e/quest_guide_audit.mjs [profile] [comp]
// Not part of run.mjs (it takes as long as a whole-game run).
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { install } from './drive.mjs';
import { installAudit } from './guide_audit_hook.mjs';

const LEGS = 'ch1_done@rw.@rw_mill>ch2_done@sg.@sg_main>ch3_done@co.@co_main>ch4_done@sb.@sb_lamp>ch5_done@lf.@lf_main>ch6_done@sa.@sa_main';
const [profile = 'E', comp = 'nao'] = process.argv.slice(2);
const legs = LEGS.split('>').map((l) => { const [flag, prefix, main] = l.split('@'); return { flag, prefix, main }; });
const { srv, url } = await serve();
const b = await launch();
const { p, errors } = await page(b, url);
await p.evaluate(install);
// the audit's hook: around every scene started from the world (tests/e2e/guide_audit_hook.mjs)
await p.evaluate(installAudit, {});
await p.evaluate(async (a) => {
  const want = RB.content.chars[a.comp] ? RB.content.chars[a.comp].name.en : null;
  const names = ['nao', 'mio', 'ren', 'suzu'].map((c) => RB.content.chars[c].name.en);
  RB.test.enable({ battle: 'unravel', choose: (opts) => {
    if (want && !RB.game.s.comp) {
      const txt = opts.map((o) => RB.script.enVars(o.en || ''));
      const mine = txt.findIndex((t) => t.includes(want));
      if (mine >= 0) return mine;
      if (txt.some((t) => names.some((n) => t.includes(n)))) { const i = txt.findIndex((t) => !names.some((n) => t.includes(n))); if (i >= 0) return i; }
    }
    return 0;
  } });
  const s = RB.game.debugStart('rw.road', 3, 9, { comp: null, profile: a.profile, flags: {} });
  s.learn.kanaKnown = a.profile === 'F' ? 'hira' : 'both';
  await RB.test.idle(60000);
  RB.game.runEnterEvents();
  await RB.test.idle(60000);
}, { profile, comp });
let ok = true;
for (const leg of legs) {
  const t1 = Date.now();
  const r = await p.evaluate((leg) => RBDrive.pursue(leg.flag, { prefix: leg.prefix, main: leg.main, max: 900 }), leg).catch((e) => ({ ok: false, fail: String(e) }));
  console.log((r.ok ? 'reached ' : 'STUCK   ') + leg.flag + ' in ' + r.steps + ' site visits (' + Math.round((Date.now() - t1) / 1000) + ' s)');
  if (!r.ok) { ok = false; console.log(JSON.stringify(r, null, 1).slice(0, 2000)); break; }
}
const log = await p.evaluate(() => window.__qgAudit);
const adv = log.filter((x) => !x.none);
const hits = adv.filter((x) => x.hit);
const ms = log.map((x) => x.ms).sort((a, b) => a - b);
console.log('\nscenes started in the world while a quest was followed: ' + log.length + ' (analysis time: median ' + ms[Math.floor(ms.length / 2)] + ' ms, 95th ' + ms[Math.floor(ms.length * 0.95)] + ' ms, max ' + ms[ms.length - 1] + ' ms)');
const byDesign = adv.filter((x) => !x.hit && (x.how === 'many' || x.quiet));
console.log('scenes that moved the followed quest on: ' + adv.length + '; pointed at beforehand: ' + hits.length + '; not marked by design (more than six places, or a quiet bookkeeping update while the real steps were marked): ' + byDesign.length + '; misses: ' + (adv.length - hits.length - byDesign.length));
for (const x of adv) console.log((x.hit ? '  hit  ' : byDesign.includes(x) ? '  (by design) ' : '  MISS ') + x.q + ' ' + x.from + '→' + (x.to === 999 ? 'done' : x.to) + ' by ' + x.scene + (x.quiet ? ' (quiet)' : '') + ' @ ' + x.map + ' [' + x.how + ': ' + x.way.join(', ') + ']');
fs.mkdirSync(path.join(root, 'tests/e2e/out'), { recursive: true });
fs.writeFileSync(path.join(root, 'tests/e2e/out/quest_guide_audit-' + profile + '-' + comp + '.json'), JSON.stringify(log, null, 1));
if (errors.length) { ok = false; console.log('page errors: ' + errors.join('; ')); }
await b.close();
srv.close();
process.exit(ok ? 0 : 1);
