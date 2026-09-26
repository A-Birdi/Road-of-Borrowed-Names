// Visual capture of representative states of the built game, for before/after
// comparison and art/layout review. Uses synthetic fixtures only (never real
// player saves). Usage:
//   node tests/e2e/visual.mjs <outDir> [--html file] [--vp 390x844,1280x800] [--only a,b]
// States: title, slots, slots_empty, create_prologue, create, create_err,
// create_kb, create2, create2_acc, create_inspect, create3, create4,
// create_place, create_ngplus, create_x2, create2_x2, create3_x2,
// create4_x2, create2_hc, create2_focus, journey, words, satchel,
// map, settings, dialogue, help, chal, combat, world_rw, world_sg, world_co,
// world_sb, world_lf, world_sa. File names: <state>_<W>x<H>.png
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
      openMenu(names) {
        for (const n of names) { try { RB.ui.menu.open(n); if (RB.ui.menu.isOpen()) return n; } catch (e) { /* try next */ } }
        return null;
      },
    };
  });
}
async function settle(p, ms) { await p.waitForTimeout(ms || 500); }

const STATES = {
  async title(p) { await p.evaluate(async () => { await V.sixSlots(); RB.game.toTitle ? await RB.game.toTitle() : RB.ui.title.show(); }); await settle(p, 900); },
  async slots(p) { await p.evaluate(async () => { await V.sixSlots(); await RB.game.toTitle(); RB.ui.title.slots('load'); }); await settle(p, 900); },
  async slots_empty(p) { await p.evaluate(async () => { await V.sixSlots(true); await RB.game.toTitle(); RB.ui.title.slots('load'); }); await settle(p, 900); },
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
  async satchel(p) { await p.evaluate(() => { V.rich('sg.harbor', 20, 22); V.openMenu(['satchel', 'items']); }); await settle(p); },
  async map(p) { await p.evaluate(() => { V.rich('sg.harbor', 20, 22); V.openMenu(['map']); }); await settle(p); },
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
    if (t) await t.click();
    await settle(p, 500);
  },
  async chal(p) {
    await p.evaluate(() => {
      const s = V.rich('rw.village', 22, 30);
      RB.game.settings.input = 'hand';
      RB.challenge.runStep({ kind: 'write', item: 'v:みず', prompt: { en: 'Write "water" (mizu) to cool the heat.' }, ctx: { jp: '{炉|ろ} が {熱|あつ}く なって いる 。', en: 'The kiln is getting hot.' }, answer: 'みず', accept: ['みず'], mode: 'kana' }, {});
      void s;
    });
    await settle(p, 700);
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
};
const WORLD = { world_rw: ['rw.village', 22, 20], world_sg: ['sg.harbor', 20, 20], world_co: ['co.village', 20, 18], world_sb: ['sb.hamlet', 20, 20], world_lf: ['lf.town', 26, 20], world_sa: ['sa.camp', 10, 10] };
for (const [k, [m, x, y]] of Object.entries(WORLD)) {
  STATES[k] = async (p) => { await p.evaluate((a) => { V.rich(a[0], a[1], a[2]); RB.game.settings.lightbulb = false; }, [m, x, y]); await settle(p, 900); };
}

const report = [];
for (const [w, h] of vps) {
  for (const name of Object.keys(STATES)) {
    if (only && !only.includes(name)) continue;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 700, isMobile: w < 700, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(url);
    await prep(p);
    let err = null;
    try { await STATES[name](p); } catch (e) { err = String(e.message || e).slice(0, 200); }
    const file = path.join(outDir, name + '_' + w + 'x' + h + '.png');
    await p.screenshot({ path: file });
    report.push({ name, vp: w + 'x' + h, file: path.relative(root, file), err, pageErrors: errors.slice(0, 3) });
    console.log((err || errors.length ? 'WARN ' : 'ok   ') + name + ' ' + w + 'x' + h + (err ? ' ' + err : '') + (errors.length ? ' pageerrors: ' + errors[0] : ''));
    await ctx.close();
  }
}
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
await browser.close(); srv.close();
