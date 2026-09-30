// Visual capture of representative states of the built game, for before/after
// comparison and art/layout review. Uses synthetic fixtures only (never real
// player saves). Usage:
//   node tests/e2e/visual.mjs <outDir> [--html file] [--vp 390x844,1280x800] [--only a,b] [--lang ja] [--check]
// States: title, slots, slots_empty, create_prologue, create, create_err,
// create_kb, create2, create2_acc, create_inspect, create3, create4,
// create_place, create_ngplus, create_x2, create2_x2, create3_x2,
// create4_x2, create2_hc, create2_focus, journey, words, satchel,
// map, settings, dialogue, help, chal, chal_ime, chal_choose, chal_order,
// chal_unsure, chal_wrong, teach, lesson, activity, activity_letters, combat,
// combat_f, combat_step, world_rw, world_sg, world_co, world_sb, world_lf,
// world_sa; company, company_pet, company_mem, keepsakes, cases, known,
// bookmarks, creatures, weave (the addendum's pages); title_nosave, title_session, title_details, title_big,
// slots_states, slots_new, slots_save, slots_readonly, slots_error,
// slots_big. File names: <state>_<W>x<H>.png
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, root } from './lib.mjs';

const args = process.argv.slice(2);
const outDir = path.resolve(args[0] || path.join(root, 'tests/e2e/out/visual'));
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const htmlPath = path.resolve(opt('--html', path.join(root, 'index.html')));
const vps = opt('--vp', '390x844,1280x800').split(',').map((s) => s.split('x').map(Number));
const only = opt('--only', '') ? opt('--only', '').split(',') : null;
const lang = opt('--lang', ''); // e.g. ja: capture with Japanese interface labels
fs.mkdirSync(outDir, { recursive: true });
const html = fs.readFileSync(htmlPath, 'utf8');
const srv = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(html); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + srv.address().port + '/';
const browser = await chromium.launch();

// ---- in-page helpers (serialised into the page) ---------------------------------
async function prep(p) {
  await p.waitForFunction(() => window.__RB_READY__);
  await p.evaluate(() => {
    window.V = {
      // a rich mid-game campaign built from real content ids
      rich(map, x, y, extra) {
        const s = RB.game.debugStart(map, x, y, Object.assign({ comp: 'mio', profile: 'E', flags: { departed: true, ch1_done: true, rw_echo_done: true, sg_arrived: true } }, extra || {}));
        s.player.name = 'Robin'; s.player.nameJp = 'ロビン';
        s.learn.kanaKnown = 'both';
        s.words = ['mamoru', 'mizu', 'hikari', 'iyasu', 'kaze', 'nawa'];
        const Q = RB.state.setQuest;
        for (const [q, st] of [['rw_labels', 'done'], ['rw_mill', 'done'], ['rw_tools', 'done'], ['rw_mochi', 'done'], ['sg_main', 3], ['sg_lighthouse', 1], ['sg_cove', 2], ['sg_seaglass', 0]]) if (RB.content.quests[q]) Q(s, q, st);
        s.journal = [{ jp: '{潮硝子|しおがらす} に {着|つ}いた 。 {荷札|にふだ} が {読|よ}めない 。', en: 'Arrived in Saltglass. The cargo tags cannot be read.' }];
        for (const id of ['rw_catbell', 'rw_letter']) if (RB.content.items[id]) RB.state.give(s, id, 1);
        for (const id of Object.keys(RB.content.items).filter((k) => k.startsWith('sg_')).slice(0, 5)) RB.state.give(s, id, 1);
        s.notebook.push({ kind: 'word', surface: '荷札', reading: 'にふだ', m: 'cargo tag, luggage label' }, { kind: 'word', surface: '灯台', reading: 'とうだい', m: 'lighthouse' }, { kind: 'word', surface: '潮', reading: 'しお', m: 'tide' });
        for (const id of Object.keys(RB.content.notes).slice(0, 3)) s.notebook.push({ kind: 'lore', id });
        for (const k of ['あ', 'い', 'う', 'か', 'き', 'し', 'み', 'ず']) RB.learn.record('k:' + k, { ok: true, mode: 'hand' });
        s.travel = { reedwake: true, saltglass: true };
        s.playtime = 3 * 3600 + 1234;
        s.backlog = [
          { who: 'tsuru', jp: 'ここ で は {好|す}きな だけ {時間|じかん} を かけて いい 。', en: 'Take as long as you like in here.' },
          { who: 'mio', jp: '{一緒|いっしょ} に {行|い}こう 。', en: "Let's go together." },
        ];
        return s;
      },
      async sixSlots(emptyOne) {
        const maps = [['rw.village', 22, 30, 'nao'], ['sg.harbor', 20, 22, 'mio'], ['co.village', 20, 18, 'ren'], ['sb.hamlet', 20, 20, 'suzu'], ['lf.town', 26, 20, 'mio'], ['sa.camp', 10, 10, 'ren']];
        for (let i = 0; i < 6; i++) {
          if (emptyOne && i === 5) continue;
          const [m, x, y, c] = maps[i];
          const s = V.rich(m, x, y, { comp: c });
          s.player.name = ['Robin', 'Aki', 'Wayfarer with a rather long name', 'Hana', 'Sora', 'Kei'][i];
          s.chapter = i + 1; s.playtime = 1800 * (i + 1) + 77;
          await new Promise((r) => setTimeout(r, 120));
          await RB.save.writeSlot(i + 1, s, { force: true, thumb: RB.render.thumbnail() });
        }
      },
      // the rich campaign plus the addendum's records: a cat met and chosen, the companion's verified
      // milestones, two keepsakes, a case with two clues, a kept sentence and a creature met
      company() {
        const s = V.rich('sg.harbor', 20, 22);
        RB.pets.meet(s, 'cat', { map: 'rw.village' }); RB.pets.select(s, 'cat');
        RB.company.sync(s, 'live'); RB.company.refresh(s);
        for (const id of Object.keys(RB.content.keepsakes).slice(0, 2)) RB.discovery.keepsake(s, id, { how: 'visual fixture' });
        for (const c of Object.keys(RB.content.clues).filter((k) => k.startsWith('parcel.')).slice(0, 2)) RB.cases.observe(s, c);
        RB.bookmarks.keep(s, s.backlog[0]);
        RB.creatures.meet(s, ['rw.dustmoth'], { where: { map: 'rw.millroad' } });
        return s;
      },
      openMenu(names) {
        for (const n of names) { try { RB.ui.menu.open(n); if (RB.ui.menu.isOpen()) return n; } catch (e) { /* try next */ } }
        return null;
      },
    };
  });
  if (lang) await p.evaluate((l) => { RB.game.settings.uiLang = l; RB.game.applySettings(); }, lang);
}
async function settle(p, ms) { await p.waitForTimeout(ms || 500); }
// settle, then clear the brief "found" notices the fixture's records raised (they fade after 4.8 s in
// play; the audit is about the page underneath)
async function quiet(p) { await p.waitForTimeout(1400); await p.evaluate(() => document.querySelectorAll('#overlay .notices > *').forEach((n) => n.remove())); await p.waitForTimeout(100); }
// learning states: real reference strokes (with a little seeded jitter) for the pad
async function learnPrep(p) {
  await p.evaluate(() => {
    window.__wait = (ms) => new Promise((r) => setTimeout(r, ms));
    window.__ink = (ch, seed, j) => {
      const ref = RB.recog.reference(ch);
      const r = RB.util.rng((seed || 7) * 31 + ch.charCodeAt(0));
      const jj = j == null ? 0.02 : j;
      return ref.strokes.map((st) => st.map((pt, i) => ({ x: (pt.x / ref.box) * 0.8 + 0.1 + (r() - 0.5) * jj, y: (pt.y / ref.box) * 0.8 + 0.1 + (r() - 0.5) * jj, t: 1000 + i * 16 })));
    };
  });
}

const STATES = {
  async title(p) { await p.evaluate(async () => { await V.sixSlots(); RB.game.toTitle ? await RB.game.toTitle() : RB.ui.title.show(); }); await settle(p, 900); },
  async slots(p) { await p.evaluate(async () => { await V.sixSlots(); await RB.game.toTitle(); RB.ui.title.slots('load'); }); await settle(p, 900); },
  async slots_empty(p) { await p.evaluate(async () => { await V.sixSlots(true); await RB.game.toTitle(); RB.ui.title.slots('load'); }); await settle(p, 900); },
  // title / ledger variants (synthetic fixtures only)
  async title_nosave(p) { await p.evaluate(async () => { await RB.game.toTitle(); }); await settle(p, 900); },
  async title_session(p) {
    // display-only stand-in for a browser that refuses storage (the real refusal is tested in ui.mjs / title_ledger.mjs)
    await p.evaluate(async () => { const real = RB.save.status; RB.save.status = () => Object.assign(real(), { mode: 'session' }); await RB.game.toTitle(); });
    await settle(p, 900);
  },
  async title_details(p) { await p.evaluate(async () => { await V.sixSlots(); await RB.game.toTitle(); }); await p.click('.title [data-a=storage]'); await settle(p, 600); },
  async title_big(p) { await p.evaluate(async () => { await V.sixSlots(); await RB.game.toTitle(); RB.game.settings.textScale = 2; RB.game.applySettings(); }); await settle(p, 900); },
  async slots_states(p) {
    await p.evaluate(async () => {
      await V.sixSlots(true);
      const s1 = V.rich('sg.harbor', 20, 22, { comp: 'mio' }); s1.player.name = 'Robin'; s1.playtime += 900;
      await RB.save.writeRecovery(1, s1, 'auto', RB.render.thumbnail());
      const s2 = V.rich('rw.hall', 5, 6, { comp: null }); s2.comp = null; s2.provisional = 'ren'; s2.player.name = 'Aki';
      await RB.save.writeRecovery(2, s2, 'predeparture', RB.render.thumbnail());
      const bad = V.rich('co.village', 20, 18, { comp: 'ren' }); bad.player.name = 'Hana'; bad.map = 'no.such.map';
      await RB.save.writeSlot(4, bad, { force: true, thumb: null });
      await RB.save.del(5);
      const s5 = V.rich('lf.town', 26, 20, { comp: 'suzu' }); s5.player.name = 'Sora';
      await RB.save.writeRecovery(5, s5, 'auto', RB.render.thumbnail());
      await RB.game.toTitle(); RB.ui.title.slots('load');
    });
    await settle(p, 900);
    await p.click('.rec[data-slot="2"] [data-a=manage]');
    await settle(p, 300);
  },
  async slots_new(p) { await p.evaluate(async () => { await V.sixSlots(); await RB.game.toTitle(); RB.ui.title.slots('new'); }); await settle(p, 900); },
  async slots_save(p) {
    await p.evaluate(async () => { await V.sixSlots(true); V.rich('sg.harbor', 20, 22); RB.save.setCurrent(2, 1); RB.ui.menu.open('save'); RB.ui.title.slots('save', true); });
    await settle(p, 900);
  },
  async slots_readonly(p) {
    // this tab lost ownership of the current campaign to another tab (the real two-tab flow is tested in ui.mjs)
    await p.evaluate(async () => { await V.sixSlots(true); V.rich('sg.harbor', 20, 22); RB.save.setCurrent(2, 1); RB.save.setReadOnly(true); RB.ui.menu.open('save'); RB.ui.title.slots('save', true); });
    await settle(p, 900);
  },
  async slots_error(p) {
    // display-only stand-in for a storage read failure
    await p.evaluate(async () => { await V.sixSlots(true); await RB.game.toTitle(); RB.save.list = async () => { throw new Error('The operation failed for reasons unrelated to the database itself'); }; RB.ui.title.slots('load'); });
    await settle(p, 900);
  },
  async slots_big(p) { await p.evaluate(async () => { await V.sixSlots(); await RB.game.toTitle(); RB.game.settings.textScale = 2; RB.game.applySettings(); RB.ui.title.slots('load'); }); await settle(p, 900); },
  // ---- new campaign (creation area) ----
  async create_prologue(p) {
    await p.click('text=New Game');
    await p.click('[data-slot="1"] [data-a=start]');
    await p.waitForSelector('text=Skip prologue');
    await settle(p, 1400);
  },
  async create(p) {
    await p.click('text=New Game');
    await p.click('[data-slot="1"] [data-a=start]');
    await p.click('text=Skip prologue');
    await p.waitForSelector('#nm');
    await p.fill('#nm', 'Robin');
    await settle(p, 400);
  },
  async create_err(p) {
    await p.click('text=New Game');
    await p.click('[data-slot="1"] [data-a=start]');
    await p.click('text=Skip prologue');
    await p.waitForSelector('#nm');
    await p.click('[data-a=next]');
    await settle(p, 300);
  },
  async create_kb(p) {
    await STATES.create(p);
    // an emulated software keyboard: the visual viewport shrinks to 55 %
    await p.focus('#nm');
    await p.evaluate(() => {
      const vv = window.visualViewport, h = Math.round(innerHeight * 0.55);
      Object.defineProperty(vv, 'height', { configurable: true, get: () => h });
      vv.dispatchEvent(new Event('resize'));
    });
    await settle(p, 300);
  },
  async create2(p) {
    await STATES.create(p);
    await p.click('[data-a=next]');
    await settle(p, 400);
  },
  async create2_acc(p) {
    await STATES.create2(p);
    await p.click('[data-set=hair][data-v=bun]');
    await p.click('[data-acc=glasses]');
    await p.click('[data-acc=hat]');
    await p.evaluate(() => document.querySelector('[data-group=acc]').scrollIntoView({ block: 'end' }));
    await settle(p, 300);
  },
  async create_inspect(p) {
    await STATES.create2(p);
    const b = await p.$('[data-a=expand]');
    if (b && await b.isVisible()) await b.click();
    await settle(p, 300);
  },
  async create3(p) {
    await STATES.create2(p);
    await p.click('[data-a=next]');
    await settle(p, 400);
  },
  async create4(p) {
    await STATES.create3(p);
    await p.click('[data-a=next]');
    await settle(p, 400);
  },
  async create_place(p) {
    await STATES.create4(p);
    await p.click('[data-a=place]');
    await settle(p, 400);
  },
  // the same steps at 200 % text
  async create_x2(p) { await STATES.create(p); await p.evaluate(() => { RB.game.settings.textScale = 2; RB.game.applySettings(); }); await settle(p, 300); },
  async create2_x2(p) { await STATES.create_x2(p); await p.click('[data-a=next]'); await settle(p, 400); },
  async create3_x2(p) { await STATES.create2_x2(p); await p.click('[data-a=next]'); await settle(p, 400); },
  async create4_x2(p) { await STATES.create3_x2(p); await p.click('[data-a=next]'); await settle(p, 400); },
  // high contrast, and keyboard focus on a swatch (focus is drawn apart from selection)
  async create2_hc(p) { await STATES.create(p); await p.evaluate(() => { RB.game.settings.contrast = 'high'; RB.game.applySettings(); }); await p.click('[data-a=next]'); await settle(p, 400); },
  async create2_focus(p) {
    await STATES.create2(p);
    await p.focus('[data-set=skin][data-v="2"]');
    await p.keyboard.press('ArrowRight');
    await settle(p, 300);
  },
  async create_ngplus(p) {
    await p.evaluate(async () => {
      const s = V.rich('lf.town', 26, 20, { comp: 'ren' });
      s.player.name = 'Veteran'; s.flags.postgame = true; s.chapter = 6;
      await RB.save.writeSlot(1, s, { force: true, thumb: RB.render.thumbnail() });
      await RB.game.toTitle();
    });
    await p.click('text=New Game');
    await p.click('[data-slot="2"] [data-a=start]');
    await p.waitForSelector('[role=alertdialog]');
    await settle(p, 400);
  },
  async journey(p) { await p.evaluate(() => { V.rich('sg.harbor', 20, 22); V.openMenu(['journey', 'journal']); }); await settle(p); },
  async words(p) { await p.evaluate(() => { V.rich('sg.harbor', 20, 22); V.openMenu(['words', 'notebook']); }); await settle(p); },
  async satchel(p) { await p.evaluate(() => { const s = V.rich('sg.harbor', 20, 22); for (const id of ['rw_mill_charm', 'rw_boots_good', 'atlas_charm_tide']) RB.state.give(s, id, 1); if (RB.equip) { RB.equip.equip(s, 'rw_mill_charm'); RB.equip.equip(s, 'rw_catbell'); } V.openMenu(['satchel', 'items']); }); await settle(p); },
  async map(p) { await p.evaluate(() => { V.rich('sg.harbor', 20, 22); V.openMenu(['map']); }); await settle(p); },
  // the addendum's pages (a committed companion, a cat met and chosen, real records made through each system's API)
  async company(p) { await p.evaluate(() => { V.company(); V.openMenu(['companion']); }); await quiet(p); },
  async company_pet(p) { await p.evaluate(() => { V.company(); V.openMenu(['pet']); }); await quiet(p); },
  async company_mem(p) { await p.evaluate(() => { V.company(); V.openMenu(['memories']); }); await quiet(p); },
  async keepsakes(p) { await p.evaluate(() => { V.company(); V.openMenu(['keepsakes']); }); await quiet(p); },
  async cases(p) { await p.evaluate(() => { V.company(); V.openMenu(['cases']); }); await quiet(p); },
  async known(p) { await p.evaluate(() => { V.company(); V.openMenu(['known']); }); await quiet(p); },
  async bookmarks(p) { await p.evaluate(() => { V.company(); V.openMenu(['bookmarks']); }); await quiet(p); },
  async creatures(p) { await p.evaluate(() => { V.company(); V.openMenu(['creatures']); }); await quiet(p); },
  async weave(p) {
    await p.evaluate(async () => {
      const s = V.rich('rw.village', 33, 24, { dir: 'up' });
      RB.game.settings.input = 'choice';
      await new Promise((r) => setTimeout(r, 400));
      RB.weave.open();
    });
    await settle(p, 700);
  },
  // quest guidance: the followed quest's detail with "Next" and two nudges shown; Settings › Learning & Challenge
  async journey_guide(p) {
    await p.evaluate(() => { V.rich('sg.harbor', 20, 22); V.openMenu(['journey', 'journal']); });
    await settle(p);
    const inline = await p.evaluate(() => !document.querySelector('.leaf-b .qguide') || !document.querySelector('.leaf-b').offsetParent);
    if (inline) { await p.click('.leaf button.entry[data-q="sg_main"]'); await settle(p, 150); }
    for (let i = 0; i < 2; i++) { await p.click('.qguide [data-nudge] >> visible=true'); await settle(p, 120); }
    await p.evaluate(() => { const e = [...document.querySelectorAll('.qguide')].find((x) => x.offsetParent); if (e) e.scrollIntoView({ block: 'start' }); });
    await settle(p, 150);
  },
  async settings_guide(p) {
    await p.evaluate(() => { V.rich('sg.harbor', 20, 22); V.openMenu(['settings']); });
    await settle(p);
    await p.click('[data-grp="learning"] >> visible=true');
    await p.evaluate(() => { const e = document.querySelector('input[data-set="questGuide"]'); if (e) e.closest('fieldset').scrollIntoView({ block: 'center' }); });
    await settle(p, 150);
  },
  async settings(p) { await p.evaluate(() => { V.rich('sg.harbor', 20, 22); V.openMenu(['settings']); if (RB.ui.menu.settings) RB.ui.menu.settings(); }); await settle(p); },
  async dialogue(p) {
    await p.evaluate(() => {
      V.rich('rw.hall', 5, 6, { flags: { rw_echo_done: true, rw_hall_gather: true } });
      RB.game.settings.textSpeed = 'instant';
      RB.script.runInline([{ who: 'tsuru', jp: 'ここ で は {好|す}きな だけ {時間|じかん} を かけて いい 。 {話|はな}して 、 {迷|まよ}って 、 {決|き}め{直|なお}して いい 。 でも 、 あの {灯|あか}り が {敷居|しきい} を {越|こ}えたら 、 {旅|たび} の {終|お}わり まで 、 その {二|ふた}つ の {名前|なまえ} を {運|はこ}ぶ 。', en: 'Take as long as you like in here. Talk, waver, change your mind. But once that lantern crosses the threshold, it carries those two names to the end of the journey.' }]);
    });
    await settle(p, 800);
  },
  async help(p) {
    await STATES.dialogue(p);
    await p.evaluate(() => { RB.game.settings.lightbulb = true; });
    const t = await p.$('.dlg .jt >> nth=3');
    if (t) { try { await t.tap({ timeout: 3000 }); } catch (e) { await t.click(); } } // a finger on phones, the mouse elsewhere
    await settle(p, 500);
  },
  // ---- learning & combat (challenge runner, pad, lessons, activities, combat) ----
  // Real content only: authored challenges, generated kana steps, activities.
  async chal(p) {
    await learnPrep(p);
    await p.evaluate(async () => {
      V.rich('co.village', 20, 18);
      RB.game.settings.input = 'hand';
      const ch = RB.content.challenges['co.c_koori'];
      const step = RB.tasks.stepsOf(ch)[0];
      step.title = ch.title.en;
      RB.challenge.runStep(step, {});
      await __wait(250);
      RB.pad.__last._inject(__ink('こ')); await __wait(80);
      document.querySelector('[data-a=confirm]').click();
      RB.pad.__last._inject(__ink('お', 3, 0.03)); await __wait(80);
    });
    await settle(p, 600);
  },
  async chal_ime(p) {
    await learnPrep(p);
    await p.evaluate(async () => {
      V.rich('co.village', 20, 18);
      RB.game.settings.input = 'ime';
      const ch = RB.content.challenges['co.c_koori'];
      const step = RB.tasks.stepsOf(ch)[0];
      step.title = ch.title.en;
      RB.challenge.runStep(step, {});
      await __wait(250);
    });
    await p.fill('#ime-in', 'こおり');
    await settle(p, 400);
  },
  async chal_choose(p) {
    await learnPrep(p);
    await p.evaluate(async () => {
      V.rich('co.village', 20, 18);
      const ch = RB.content.challenges['co.c_chronicle'];
      const step = RB.tasks.stepsOf(ch)[0];
      step.title = ch.title.en;
      RB.challenge.runStep(step, {});
    });
    await settle(p, 500);
  },
  async chal_order(p) {
    await learnPrep(p);
    await p.evaluate(async () => {
      V.rich('co.village', 20, 18);
      RB.activities.run('co.a_hist_ume');
      await __wait(400);
      document.querySelector('.chal [data-add]').click();
      await __wait(60);
      document.querySelector('.chal [data-add]').click();
    });
    await settle(p, 500);
  },
  async chal_unsure(p) {
    await learnPrep(p);
    await p.evaluate(async () => {
      V.rich('rw.village', 22, 30);
      RB.game.settings.input = 'hand';
      const step = RB.tasks.kanaStep('ろ', { bare: true });
      step.title = 'Practice 2 / 5 (optional)';
      RB.challenge.runStep(step, {});
      await __wait(250);
      RB.pad.__last._inject(__ink('る', 1, 0.08)); await __wait(80);
      document.querySelector('[data-a=confirm]').click();
      document.querySelector('[data-a=submit]').click();
    });
    await settle(p, 500);
  },
  async chal_wrong(p) {
    await learnPrep(p);
    await p.evaluate(async () => {
      V.rich('rw.village', 22, 30);
      RB.game.settings.input = 'hand';
      const step = RB.tasks.kanaStep('ぬ', { bare: true });
      step.title = 'New kana practice';
      RB.challenge.runStep(step, {});
      await __wait(250);
      RB.pad.__last._inject(__ink('め')); await __wait(80);
      document.querySelector('[data-a=confirm]').click();
      document.querySelector('[data-a=submit]').click();
    });
    await settle(p, 500);
  },
  async teach(p) {
    await p.evaluate(() => {
      V.rich('co.village', 20, 18);
      const t = RB.content.challenges['co.c_ishi'].tiers.E[0].teach;
      RB.challenge.teachCard(t);
    });
    await settle(p, 400);
  },
  async lesson(p) {
    await p.evaluate(() => {
      const s = V.rich('rw.village', 22, 30, { profile: 'F' });
      s.learn.profile = 'F'; s.learn.kanaKnown = 'none'; s.learn.taught = {};
      RB.lessons.run('kana');
    });
    await settle(p, 700);
  },
  async activity(p) {
    await p.evaluate(async () => {
      V.rich('co.village', 20, 18);
      RB.activities.run('co.a_orders');
      await new Promise((r) => setTimeout(r, 300));
      const add = document.querySelectorAll('[data-add]');
      if (add[2]) { add[2].click(); }
    });
    await settle(p, 500);
  },
  async activity_letters(p) {
    await p.evaluate(() => { V.rich('co.village', 20, 18); RB.activities.run('co.a_letters'); });
    await settle(p, 500);
  },
  async combat(p) {
    await p.evaluate(() => {
      const s = V.rich('rw.millroad', 10, 22);
      RB.game.settings.input = 'choice';
      RB.game.startBattle('rw.reedling', {});
      void s;
    });
    for (let i = 0; i < 40; i++) {
      const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp, [data-card], .cards button') }));
      if (st.cards) break;
      if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
      await p.waitForTimeout(80);
    }
    await settle(p, 500);
  },
  async combat_f(p) {
    // Foundations profile: the English of the telegraph is shown, so its target is marked
    await p.evaluate(() => {
      const s = V.rich('rw.millroad', 10, 22, { profile: 'F' });
      s.learn.profile = 'F';
      RB.game.startBattle('rw.reedling', {});
    });
    for (let i = 0; i < 40; i++) {
      const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp') }));
      if (st.cards) break;
      if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
      await p.waitForTimeout(80);
    }
    await settle(p, 500);
  },
  async combat_step(p) {
    await STATES.combat(p);
    await p.evaluate(() => { const b = [...document.querySelectorAll('.resp[data-i]')].find((x) => /まもる/.test(x.textContent)) || document.querySelector('.resp[data-i]'); b.click(); });
    await settle(p, 600);
  },
};
const WORLD = { world_rw: ['rw.village', 22, 20], world_sg: ['sg.harbor', 20, 20], world_co: ['co.village', 20, 18], world_sb: ['sb.hamlet', 20, 20], world_lf: ['lf.town', 26, 20], world_sa: ['sa.camp', 10, 10] };
for (const [k, [m, x, y]] of Object.entries(WORLD)) {
  STATES[k] = async (p) => { await p.evaluate((a) => { V.rich(a[0], a[1], a[2]); RB.game.settings.lightbulb = false; }, [m, x, y]); await settle(p, 900); };
}

// --check: a layout audit of each captured state. Reports anything wider than
// the screen (outside horizontal scrollers), text clipped by its own box
// (ellipsis or hidden overflow), and — on touch viewports — principal
// controls smaller than 44 px (inline word tokens excepted).
const check = args.includes('--check');
const audit = (p, touch) => p.evaluate((touch) => {
  const vw = document.documentElement.clientWidth;
  const vis = (e) => { const r = e.getBoundingClientRect(); if (r.width <= 1 || r.height <= 1) return false; /* also skips visually-hidden (sr-only) text */ const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0 && !e.closest('.hidden'); };
  const scroller = (e) => { for (let a = e.parentElement; a; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox === 'auto' || ox === 'scroll') return true; } return false; };
  const name = (e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + ' "' + (e.textContent || '').trim().slice(0, 24) + '"';
  const wide = [], clipped = [], small = [];
  for (const e of document.querySelectorAll('#ui *, #overlay *')) {
    if (!vis(e)) continue;
    const r = e.getBoundingClientRect();
    if ((r.right > vw + 1 || r.left < -1) && !scroller(e) && e.tagName !== 'CANVAS') wide.push(name(e));
    const cs = getComputedStyle(e);
    if (!e.closest('.sr') && e.children.length === 0 && (e.textContent || '').trim() && (cs.textOverflow === 'ellipsis' || cs.overflowX === 'hidden' || cs.overflow === 'hidden') && e.scrollWidth > e.clientWidth + 1) clipped.push(name(e));
    // (controls that let taps pass through to a larger target, like the move pad's arrow glyphs, are not targets themselves)
    if (touch && e.matches('button, [role=button], [role=tab], a[href], input:not([type=hidden]), select, label.opt, label.switch') && !e.closest('.jline') && !e.classList.contains('jt') && cs.pointerEvents !== 'none') {
      const t = e.matches('input[type=radio], input[type=checkbox]') ? (e.closest('label') || e) : e;
      const tr = t.getBoundingClientRect();
      const min = e.matches('.strip .cell.ins') ? 23.5 : 43.5; // insertion points between 44-px character cells: WCAG 2.5.8 minimum
      if (tr.width < min || tr.height < min) small.push(name(e) + ' ' + Math.round(tr.width) + 'x' + Math.round(tr.height));
    }
  }
  // furigana contrast: each visible reading against the nearest opaque paint
  // behind it (an ancestor's background or its ::before face, as the paper
  // tabs draw theirs); readings over the world canvas are skipped
  const rgb = (c) => { const m = c.match(/[\d.]+/g); return m ? m.map(Number) : null; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const opaque = (cs) => { const c = rgb(cs.backgroundColor); return c && (c.length < 4 || c[3] > 0.85) ? c : null; };
  const paint = (e) => {
    for (let a = e; a && a !== document.documentElement; a = a.parentElement) {
      const own = opaque(getComputedStyle(a));
      if (own) return own;
      // a ::before counts only when it is a face laid under the whole element
      const pb = getComputedStyle(a, '::before');
      if (pb.content !== 'none' && pb.content !== 'normal' && pb.position === 'absolute' && parseFloat(pb.width) >= 0.8 * a.getBoundingClientRect().width && opaque(pb)) return opaque(pb);
    }
    return null;
  };
  const faint = [];
  for (const e of document.querySelectorAll('#ui rt, #overlay rt')) {
    if (!vis(e) || !e.textContent.trim()) continue;
    const bg = paint(e), fg = rgb(getComputedStyle(e).color);
    if (!bg || !fg) continue;
    const r = ratio(fg, bg);
    if (r < 4.5) faint.push(name(e.closest('ruby') || e) + ' ' + r.toFixed(1) + ':1');
  }
  const uniq = (a) => [...new Set(a)];
  return { docOverflow: document.documentElement.scrollWidth > vw + 1, wide: uniq(wide).slice(0, 8), clipped: uniq(clipped).slice(0, 8), small: uniq(small).slice(0, 8), faint: uniq(faint).slice(0, 8) };
}, touch);

const report = [];
for (const [w, h] of vps) {
  for (const name of Object.keys(STATES)) {
    if (only && !only.includes(name)) continue;
    const mobile = w < 700 || h < 500; // phones in portrait or landscape
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(url);
    await prep(p);
    let err = null;
    try { await STATES[name](p); } catch (e) { err = String(e.message || e).slice(0, 200); }
    const file = path.join(outDir, name + '_' + w + 'x' + h + '.png');
    await p.screenshot({ path: file });
    const a = check ? await audit(p, mobile) : null;
    const issues = a ? [a.docOverflow ? 'page wider than screen' : null, a.wide.length ? 'wide: ' + a.wide.join(' | ') : null, a.clipped.length ? 'clipped: ' + a.clipped.join(' | ') : null, a.small.length ? 'small: ' + a.small.join(' | ') : null, a.faint.length ? 'faint furigana: ' + a.faint.join(' | ') : null].filter(Boolean) : [];
    report.push({ name, vp: w + 'x' + h, file: path.relative(root, file), err, pageErrors: errors.slice(0, 3), audit: a });
    console.log((err || errors.length || issues.length ? 'WARN ' : 'ok   ') + name + ' ' + w + 'x' + h + (err ? ' ' + err : '') + (errors.length ? ' pageerrors: ' + errors[0] : '') + (issues.length ? '\n     ' + issues.join('\n     ') : ''));
    await ctx.close();
  }
}
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
await browser.close(); srv.close();
