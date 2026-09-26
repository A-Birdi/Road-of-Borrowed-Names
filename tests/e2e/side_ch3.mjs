import { serve, launch, page } from './lib.mjs';
const { srv, url } = await serve();
const b = await launch();
let sideFails = 0;
for (const [profile, comp] of [['E', 'nao'], ['A', 'suzu'], ['F', 'ren']]) {
  const { p, errors } = await page(b, url);
  const res = await p.evaluate(async ({ profile, comp }) => {
    const T = RB.test; const out = { checks: [] }; const check = (n, ok) => out.checks.push({ n, ok: !!ok });
    let want = null;
    T.enable({ battle: 'unravel', choose: (opts) => { if (want) { const i = opts.findIndex((o) => want.test(o.en || '')); if (i >= 0) return i; } return 0; } });
    const s = RB.game.debugStart('co.village', 24, 17, { profile, comp });
    s.learn.kanaKnown = profile === 'F' ? 'none' : 'both';
    Object.assign(s.flags, { co_arrived: true, co_met_sayo: true, co_suspect: true, co_chronicle_read: true });
    try {
      // counting side quest
      await T.go('co.pottery', 5, 7, 'up'); want = /ask Sayo/; await T.talk('co_nobu'); want = null;
      check('count started', s.quests.co_count && s.quests.co_count.stage === 0);
      await T.go('co.village', 24, 17, 'up'); await T.talk('co_sayo');
      check('count stage 1', s.quests.co_count.stage === 1);
      await T.talk('co_kotaro'); check('count stage 2', s.quests.co_count.stage === 2);
      await T.go('co.pottery', 5, 7, 'up'); await T.talk('co_nobu');
      check('count done', s.quests.co_count.done && s.inv.co_ash_cup && s.flags.co_count_done);
      // bell side quest
      await T.go('co.village', 12, 16, 'up');
      s.flags.co_hist_goro = true; // skip history for this test
      want = /find one/; await T.talk('co_goro'); want = null;
      check('bell started', s.quests.co_bell && s.quests.co_bell.stage === 0);
      await T.talk('co_tamotsu'); check('rope', s.inv.co_rope && s.quests.co_bell.stage === 1);
      await T.talk('co_goro'); check('bell done', s.quests.co_bell.done && s.flags.co_bell_rung && !s.inv.co_rope);
      await T.talk('co_kotaro');
      // signposts
      await T.go('co.terraces', 21, 32, 'up'); await T.talk('co_asa');
      check('signs started', s.quests.co_signs);
      await T.use(18, 17); check('signs fixed', s.flags.co_signs_done);
      await T.talk('co_asa'); check('signs done + hat', s.quests.co_signs.done && s.inv.co_straw_hat);
      await T.talk('co_goat');
      // letters + orders
      await T.go('co.post', 4, 6, 'up'); await T.talk('co_shino'); check('letters', s.flags.co_letters_done);
      if (comp !== 'nao') { await T.talk('nao'); check('nao cameo', s.flags.co_nao_cameo); }
      await T.go('co.inn', 6, 8, 'up'); if (comp === 'suzu') await T.idle();
      want = /Help out/; await T.talk('co_fusa'); want = null; check('orders', s.flags.co_orders_done && s.inv.co_hoshigaki);
      want = /Rest/; await T.talk('co_fusa'); want = null;
      // banter
      for (let i = 0; i < 3; i++) { RB.game.companionTalk(); await T.idle(); }
      check('banter seen', Object.keys(s.seen).some((k) => k.startsWith('co.b_')));
    } catch (e) { out.error = String(e && e.stack || e).slice(0, 500); }
    out.problems = T.problems; return out;
  }, { profile, comp });
  const failed = res.checks.filter((c) => !c.ok);
  if (failed.length || res.error || res.problems.length || errors.length) sideFails++;
  console.log((failed.length || res.error || res.problems.length || errors.length ? 'FAIL' : 'PASS') + ' side ' + profile + ' ' + comp + ' ' + res.checks.length + ' checks' + (res.error ? ' ERR ' + res.error : '') + (failed.length ? ' failed: ' + failed.map((c) => c.n).join(', ') : '') + (res.problems.length ? ' problems ' + JSON.stringify(res.problems).slice(0, 600) : '') + (errors.length ? ' page errors ' + errors.join('|').slice(0, 400) : ''));
  await p.context().close();
}
await b.close(); srv.close();
process.exit(sideFails ? 1 : 0);
