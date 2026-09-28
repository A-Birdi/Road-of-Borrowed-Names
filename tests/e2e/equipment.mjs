// Equipment: keepsakes change how the player looks everywhere the player is
// drawn (world sprite, on screen and straight after equipping; the battle
// party; the dialogue portrait), compared in rendered pixels; every
// keepsake is visible on the 40×58 road sprite in each view (a one-sided one in the
// side view that faces it) and on the battle figure, also over the same
// kind of accessory chosen at character creation; worn things are marked in
// the Satchel by a tag (not colour alone) and every equippable item in every
// chapter and the Atlas shows keyword tags that the Key explains; the tool
// and charm effects do what their tags say; keyboard, touch, Japanese
// labels (with furigana) and no overflow at 320 px, including 200 % text.
// Usage: node tests/e2e/equipment.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const frames = (p, n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n || 3);
// in-page helpers: pixel comparison and a campaign carrying every equippable item
const helpers = (p) => p.evaluate(() => {
  window.EQT = {
    data(cv, x, y, w, h) { return cv.getContext('2d').getImageData(x || 0, y || 0, w || cv.width, h || cv.height).data; },
    diff(a, c) { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - c[i]) + Math.abs(a[i + 1] - c[i + 1]) + Math.abs(a[i + 2] - c[i + 2]) + Math.abs(a[i + 3] - c[i + 3]) > 24) n++; return n; },
    wearables() { return Object.keys(RB.content.items).filter((k) => RB.content.items[k].slot); },
    start(opts) {
      const s = RB.game.debugStart('sg.harbor', 20, 22, Object.assign({ comp: 'mio', flags: { departed: true, ch1_done: true, sg_arrived: true } }, opts || {}));
      s.player.look = { skin: 2, hair: 'short', hairColor: 1, outfit: 0, shape: 'tunic', acc: ['scarf'] }; // the creation default wears a scarf
      RB.world.W.player.look = RB.equip.look(s);
      for (const id of ['rw_letter'].concat(EQT.wearables())) RB.state.give(s, id, 1);
      return s;
    },
    // the player's sprite box on the world canvas, in canvas pixels
    playerBox() {
      const P = RB.world.W.player, cv = document.getElementById('world'), dpr = cv.width / cv.clientWidth;
      const a = RB.render.tileToCss(P.fx, P.fy), c = RB.render.tileToCss(P.fx + 1, P.fy + 1);
      const tw = c.x - a.x, th = c.y - a.y;
      return [Math.round(a.x * dpr), Math.round((a.y - th / 2) * dpr), Math.round(tw * dpr), Math.round(th * 1.5 * dpr)];
    },
    // hold the world still for a pixel comparison: no blinks, and no idle breathing, glances or swaying crowns
    still() { const W = RB.world.W; for (const x of [W.player, W.comp].concat(W.npcs)) if (x) x.blinkT = 1e9; if (!RB.game.settings.reducedMotion) { RB.game.settings.reducedMotion = true; RB.game.applySettings(); } },
  };
});

// ---- 1. every keepsake is visible on the sprite and portrait, in every view ---------------------------
{
  const { p, errors } = await page(b, url);
  await helpers(p);
  const r = await p.evaluate(() => {
    const ids = Object.keys(RB.content.items).filter((k) => RB.content.items[k].slot === 'cosmetic');
    const bases = [
      { skin: 2, hair: 'short', hairColor: 1, outfit: 0, shape: 'tunic', acc: ['scarf'] },
      { skin: 4, hair: 'long', hairColor: 0, outfit: 3, shape: 'robe', acc: ['hat', 'earrings'] },
      { skin: 1, hair: 'bob', hairColor: 4, outfit: 2, shape: 'coat', acc: ['flower', 'cape'] },
      { skin: 3, hair: 'wavy', hairColor: 6, outfit: 1, shape: 'dress', acc: ['satchel', 'glasses'] },
    ];
    const px = (cv) => EQT.data(cv);
    const weak = [], noAcc = [];
    let min = { down: 1e9, up: 1e9, side: 1e9, face: 1e9, battle: 1e9 };
    for (const id of ids) {
      if (!RB.content.items[id].acc) { noAcc.push(id); continue; }
      let battleSeen = 0;
      for (const base of bases) {
        const worn = RB.equip.lookWith(base, id);
        for (const d of ['down', 'up']) {
          const n = EQT.diff(px(RB.sprites.getArt(base, d, 0)), px(RB.sprites.getArt(worn, d, 0)));
          min[d] = Math.min(min[d], n);
          if (n < 16) weak.push(id + ' ' + d + ' on ' + base.hair + '/' + base.acc.join('+') + ': ' + n + ' px');
        }
        // side views: a keepsake worn on one side of the head (a ribbon, a leaf) is drawn in front
        // in the view that faces that side, and may hide behind the head in the other; so the side
        // that faces it must show it
        const side = Math.max(...['left', 'right'].map((d) => EQT.diff(px(RB.sprites.getArt(base, d, 0)), px(RB.sprites.getArt(worn, d, 0)))));
        min.side = Math.min(min.side, side);
        if (side < 8) weak.push(id + ' side on ' + base.hair + '/' + base.acc.join('+') + ': ' + side + ' px');
        const n = EQT.diff(px(RB.portraits.playerImage(base, 'neutral')), px(RB.portraits.playerImage(worn, 'neutral')));
        min.face = Math.min(min.face, n);
        if (n < 40) weak.push(id + ' portrait on ' + base.hair + '/' + base.acc.join('+') + ': ' + n + ' px');
        // the battle figure (seen from behind): shows it too, unless a hat covers a flower on the far side of the head
        const bn = EQT.diff(px(RB.battlers.preview(base, 'ready', null, 0, { reduce: true })), px(RB.battlers.preview(worn, 'ready', null, 0, { reduce: true })));
        min.battle = Math.min(min.battle, bn);
        if (bn >= 8) battleSeen++;
      }
      if (battleSeen < 3) weak.push(id + ' battle figure: visible on only ' + battleSeen + ' of 4 looks');
    }
    // the base look is never changed by wearing something
    const b0 = { skin: 2, hair: 'short', hairColor: 1, outfit: 0, acc: ['hat'] };
    const w0 = RB.equip.lookWith(b0, 'lf_ferry_cap');
    return { n: ids.length, weak, noAcc, min, untouched: JSON.stringify(b0.acc) === '["hat"]', replaced: w0.acc.join() === 'cap' && w0.capCol === RB.content.items.lf_ferry_cap.wear.capCol };
  });
  assert(r.n >= 14 && !r.noAcc.length, `${r.n} keepsakes, each with an accessory to draw` + (r.noAcc.length ? ' missing: ' + r.noAcc : ''));
  assert(!r.weak.length, 'every keepsake visibly changes the 40×58 road sprite (front/back ≥16 px, the side view facing it ≥8 px), the portrait (≥40 px) and the battle figure (≥8 px on at least 3 of the 4 looks), on four looks including the same accessory from creation; least change ' + JSON.stringify(r.min) + (r.weak.length ? '\n     ' + r.weak.slice(0, 12).join('\n     ') : ''));
  assert(r.untouched && r.replaced, 'wearing a cap takes the place of the hat chosen at creation, in its own colour, without changing the saved look');
  assert(!errors.length, 'no page errors (sprites) ' + errors.join('; '));
  await p.context().close();
}

// ---- 2. the world sprite changes on screen as soon as a keepsake is equipped from the Satchel ---------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  await p.evaluate(() => EQT.start());
  await p.waitForTimeout(300);
  const shot = () => p.evaluate(() => { EQT.still(); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => { const [x, y, w, h] = EQT.playerBox(); r(Array.from(EQT.data(document.getElementById('world'), x, y, w, h))); }))); });
  const before = await shot();
  await p.evaluate(() => RB.ui.menu.open('satchel'));
  await p.waitForSelector('[data-it="co_straw_hat"]');
  await p.click('[data-it="co_straw_hat"]');
  await p.click('.leaf-b [data-equip="co_straw_hat"]');
  const look = await p.evaluate(() => ({ w: JSON.stringify(RB.world.W.player.look), e: JSON.stringify(RB.equip.look(RB.game.s)), acc: RB.world.W.player.look.acc }));
  assert(look.w === look.e && look.acc.includes('hat'), 'equipping updates the look the world draws at once (no map change): ' + look.acc.join());
  await p.keyboard.press('Escape');
  await p.waitForTimeout(150);
  const after = await shot();
  await p.evaluate(() => RB.equip.unequip(RB.game.s, 'cosmetic'));
  const again = await shot();
  const dOn = await p.evaluate(([a, c]) => EQT.diff(a, c), [before, after]);
  const dOff = await p.evaluate(([a, c]) => EQT.diff(a, c), [before, again]);
  assert(dOn > 150 && dOff < dOn / 10, `on screen, the player's sprite changes when the straw hat goes on (${dOn} px) and changes back when it comes off (${dOff} px left)`);
  assert(!errors.length, 'no page errors (world) ' + errors.join('; '));
  await p.context().close();
}

// ---- 3. battle party and dialogue portrait -----------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  await p.evaluate(() => { RB.game.settings.reducedMotion = true; RB.game.settings.textSpeed = 'instant'; RB.game.applySettings(); const s = EQT.start(); s.learn.kanaKnown = 'both'; s.words.push('mamoru', 'mizu', 'hikari'); });
  // dialogue: the player's portrait is drawn wearing the keepsake
  const face = async () => {
    await p.evaluate(() => { window.__said = false; RB.script.runInline([{ who: 'pc', jp: 'はい 。', en: 'Yes.' }]).then(() => { window.__said = true; }); });
    await p.waitForFunction(() => RB.ui.dialogue.isOpen());
    await frames(p, 2);
    const d = await p.evaluate(() => Array.from(EQT.data(document.querySelector('.dlg .portrait, .portrait'))));
    await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForFunction(() => window.__said);
    return d;
  };
  const f0 = await face();
  await p.evaluate(() => RB.equip.equip(RB.game.s, 'rw_catbell'));
  const f1 = await face();
  const fd = await p.evaluate(([a, c]) => EQT.diff(a, c), [f0, f1]);
  assert(fd > 60, `the dialogue portrait shows the equipped keepsake (Mochi's bell: ${fd} px changed)`);
  await p.evaluate(() => RB.equip.unequip(RB.game.s, 'cosmetic'));
  // battle: the party (seen from behind) wears it too
  await p.evaluate(() => { window.__res = null; RB.game.startBattle('rw.reedling', { foeKey: 'foe:test:eq' }).then((r) => { window.__res = r || 'done'; }); });
  let up = false;
  for (let i = 0; i < 200 && !up; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), flee: !!document.querySelector('[data-flee]') }));
    if (st.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); continue; }
    if (st.flee) up = true; else await p.waitForTimeout(100);
  }
  assert(up, 'battle screen reached');
  await p.waitForTimeout(400);
  const cap = async () => { await frames(p, 3); return p.evaluate(() => { const cv = document.getElementById('world'); return { d: Array.from(EQT.data(cv)), w: cv.width }; }); };
  const b0 = await cap();
  const b0b = await cap();
  await p.evaluate(() => RB.equip.equip(RB.game.s, 'co_straw_hat'));
  const b1 = await cap();
  await p.evaluate(() => RB.equip.unequip(RB.game.s, 'cosmetic'));
  const b2 = await cap();
  const res = await p.evaluate(([a, a2, c, e, w]) => {
    let n = 0, minX = 1e9, maxX = -1;
    for (let i = 0; i < a.length; i += 4) {
      if (Math.abs(a[i] - c[i]) + Math.abs(a[i + 1] - c[i + 1]) + Math.abs(a[i + 2] - c[i + 2]) > 24) { n++; const x = (i / 4) % w; minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
    }
    return { still: EQT.diff(a, a2), n, back: EQT.diff(a, e), minX, maxX };
  }, [b0.d, b0b.d, b1.d, b2.d, b0.w]);
  assert(res.still < 50, `the battle scene is still under Reduce motion (${res.still} px between frames), so the comparison is fair`);
  assert(res.n > 150 && res.maxX < b0.w * 0.6 && res.back < res.n / 10, `in battle the party wears the straw hat: ${res.n} px change, all on the party's side (x ${res.minX}–${res.maxX} of ${b0.w}), gone again when taken off (${res.back} px)`);
  // leave the battle
  await p.click('[data-flee]').catch(() => {});
  await p.waitForSelector('[role=alertdialog] .foot button', { timeout: 5000 }).catch(() => {});
  await p.click('[role=alertdialog] .foot button >> nth=0').catch(() => {});
  assert(!errors.length, 'no page errors (battle, dialogue) ' + errors.join('; '));
  await p.context().close();
}

// ---- 4. effects do what their tags say -----------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await helpers(p);
  const r = await p.evaluate(() => {
    const s = EQT.start();
    const W = RB.world.W, P = W.player;
    // Sturdy boots [Quicker stride]: a step takes less time
    const step = () => {
      for (const d of ['right', 'left', 'up', 'down']) {
        const [dx, dy] = RB.world.DIRS[d];
        if (RB.world.blocked(P.x + dx, P.y + dy, { except: P, ignorePlayer: true, ignoreComp: true })) continue;
        P.mv = null; P.dir = d; W.turnHold = 0; W.path = null;
        RB.world._tryMove(d);
        const dur = P.mv && P.mv.dur;
        if (P.mv) { P.x = P.mv.sx; P.y = P.mv.sy; P.fx = P.x; P.fy = P.y; P.mv = null; }
        return dur;
      }
      return null;
    };
    const plain = step();
    RB.equip.equip(s, 'rw_boots_good');
    const booted = step();
    RB.equip.unequip(s, 'tool');
    // charms: what a battle begins with
    const foe = RB.content.enemies['rw.reedling'];
    const init = (id) => { s.equip.charm = id || null; const st = RB.combatLogic.init(Object.assign({ id: 'rw.reedling' }, foe), s); s.equip.charm = null; return { wp: st.ward.pc, wc: st.ward.comp, h: st.harmony, hm: st.harmonyMax, pc: st.pc, max: st.max }; };
    const out = { plain, booted, none: init(null) };
    for (const id of ['rw_reed_charm', 'sg_float_charm', 'rw_mill_charm', 'sg_lens_charm', 'sb_bell_cord', 'sb_goat_bell', 'sa_bookmark', 'lf_bell_shard']) out[id] = init(id);
    RB.atlas.combat.install();
    try { out.atlas_charm_reed = init('atlas_charm_reed'); } finally { RB.atlas.combat.uninstall(); }
    out.tags = {};
    for (const id of Object.keys(out)) if (RB.content.items[id]) out.tags[id] = RB.equip.tags(id).map((t) => t.id);
    return out;
  });
  assert(r.plain && r.booted && r.booted < r.plain, `Sturdy boots [Quicker stride]: a step takes ${r.booted} ms instead of ${r.plain} ms`);
  const n = r.none;
  for (const id of ['rw_reed_charm', 'sg_float_charm']) assert(r[id].wp === n.wp + 1 && r[id].wc === n.wc + 1 && r.tags[id].includes('ward1'), `${id} [Battle start: ward +1]: battles begin with a ward before you and your companion`);
  for (const id of ['rw_mill_charm', 'sg_lens_charm', 'sb_bell_cord']) assert(r[id].h === 1 && n.h === 0 && r.tags[id].includes('harmony1'), `${id} [Battle start: harmony +1]: battles begin with 1 harmony`);
  assert(r.sb_goat_bell.max === n.max + 1 && r.sb_goat_bell.pc === n.pc + 1 && r.tags.sb_goat_bell.includes('resolve1'), 'Goat bell [Resolve +1]: resolve and its maximum are 1 higher');
  for (const id of ['sa_bookmark', 'lf_bell_shard']) assert(JSON.stringify(r[id]) === JSON.stringify(n) && r.tags[id].join() === 'nobattle', `${id} [No battle effect]: nothing changes, and the tag says so`);
  assert(r.atlas_charm_reed.wp === n.wp + 1 && r.atlas_charm_reed.wc === n.wc && r.atlas_charm_reed.hm === 4 && r.tags.atlas_charm_reed.join() === 'atlas_reed,atlas_reed_cost', 'Atlas Reed Knot: ward +1 for you only, techniques need 4 harmony, and both are tagged');
  // receiving something wearable says so
  const toast = await p.evaluate(async () => {
    RB.script.add('@scene t.eq_give\n!give rw_mill_charm\n', 'equipment-test');
    await RB.script.run('t.eq_give');
    const t = Array.from(document.querySelectorAll('.toast .tnote')).map((e) => e.textContent);
    return t.join(' | ');
  });
  assert(/charm/.test(toast) && /harmony/.test(toast) && /Satchel/.test(toast), 'the "Received" note says it can be worn, what it does and where to equip it: ' + toast);
  assert(!errors.length, 'no page errors (effects) ' + errors.join('; '));
  await p.context().close();
}

// ---- 5. Satchel: tags for every equippable item, the Equipped mark, the Key, keyboard -----------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  await p.evaluate(() => { EQT.start(); RB.equip.equip(RB.game.s, 'sb_scarf'); RB.ui.menu.open('satchel'); });
  await p.waitForSelector('.eq-slots');
  const r = await p.evaluate(() => {
    const ids = EQT.wearables();
    const missing = [], wrong = [];
    for (const id of ids) {
      const row = document.querySelector('[data-it="' + id + '"]');
      if (!row) { missing.push(id); continue; }
      const got = Array.from(row.querySelectorAll('.etags .etag')).map((e) => e.dataset.tag);
      const want = RB.equip.tags(id).map((t) => t.id);
      if (!got.length || got.join() !== want.join()) wrong.push(id + ': ' + got.join() + ' ≠ ' + want.join());
    }
    const special = ids.filter((id) => RB.equip.tags(id).some((t) => t.id === 'special'));
    const keyIds = Array.from(document.querySelectorAll('.tag-key .etag')).map((e) => e.dataset.tag);
    const shown = new Set(Array.from(document.querySelectorAll('.item-row .etag')).map((e) => e.dataset.tag));
    const unexplained = [...shown].filter((t) => !keyIds.includes(t));
    const chapters = new Set(ids.map((id) => id.split('_')[0]));
    const worn = document.querySelector('[data-it="sb_scarf"]');
    const plain = document.querySelector('[data-it="sb_goat_bell"]');
    return {
      n: ids.length, chapters: [...chapters].join(), missing, wrong, special, unexplained,
      keyHasWorn: !!document.querySelector('.tag-key .worn-tag'),
      wornRow: worn.classList.contains('worn') && /Equipped/i.test((worn.querySelector('.worn-tag') || {}).textContent || ''),
      plainRow: !plain.classList.contains('worn') && !plain.querySelector('.worn-tag') && /can be worn/i.test(plain.textContent),
      tint: getComputedStyle(worn).backgroundColor !== getComputedStyle(plain).backgroundColor,
      slot: (() => { const li = document.querySelector('.eq-slot[data-slot="cosmetic"]'); return li.classList.contains('worn') && /Hand-knitted scarf/.test(li.textContent) && !!li.querySelector('[data-unequip="cosmetic"]') && !!li.querySelector('.etag[data-tag="look"]'); })(),
      empty: /Empty/.test(document.querySelector('.eq-slot[data-slot="charm"]').textContent),
      count: document.querySelector('.leaf h3 .count').textContent,
    };
  });
  assert(r.n >= 20 && ['rw', 'sg', 'co', 'sb', 'lf', 'sa', 'atlas'].every((c) => r.chapters.split(',').includes(c)), `${r.n} equippable items from every chapter and the Atlas (${r.chapters})`);
  assert(!r.missing.length && !r.wrong.length, 'every equippable item\'s row shows keyword tags derived from its data' + (r.missing.length ? ' missing rows: ' + r.missing : '') + (r.wrong.length ? ' wrong: ' + r.wrong.join('; ') : ''));
  assert(!r.special.length, 'every effect kind has its own keyword (none falls back to "Special effect") ' + r.special);
  assert(!r.unexplained.length && r.keyHasWorn, 'the Key explains every tag shown and the Equipped mark' + (r.unexplained.length ? ' unexplained: ' + r.unexplained : ''));
  assert(r.wornRow && r.plainRow && r.tint, 'the equipped item is marked with an "Equipped" tag on a tinted row; others say they can be worn, untinted');
  assert(r.slot && r.empty && /1 of 3/.test(r.count), 'the slot summary shows what is worn, its tags and Take off, and empty slots (' + r.count + ')');
  // contrast of text on the tinted row and of the tag on its chip
  const c = await p.evaluate(() => {
    const rgb = (s) => s.match(/[\d.]+/g).map(Number);
    const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const ratio = (a, b) => { const x = lum(rgb(a)), y = lum(rgb(b)); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const row = document.querySelector('[data-it="sb_scarf"]'), chip = row.querySelector('.worn-tag'), kind = row.querySelector('.slotline > span:last-child');
    return { chip: ratio(getComputedStyle(chip).color, getComputedStyle(chip).backgroundColor), kind: ratio(getComputedStyle(kind).color, getComputedStyle(row).backgroundColor) };
  });
  assert(c.chip >= 4.5 && c.kind >= 4.5, `text contrast: Equipped tag ${c.chip.toFixed(1)}:1, label on the tinted row ${c.kind.toFixed(1)}:1 (≥ 4.5)`);
  // keyboard: Equip from the detail page; focus stays on the same control, now "Take it off"
  await p.click('[data-it="sb_goat_bell"]');
  await p.focus('.leaf-b [data-equip="sb_goat_bell"]');
  await p.keyboard.press('Enter');
  let k = await p.evaluate(() => ({ eq: RB.game.s.equip.charm, focus: document.activeElement && document.activeElement.getAttribute('data-unequip'), live: document.querySelector('.eq-live').textContent, worn: document.querySelector('[data-it="sb_goat_bell"]').classList.contains('worn') }));
  assert(k.eq === 'sb_goat_bell' && k.focus === 'charm' && k.worn && /Equipped: Goat bell/.test(k.live), 'Enter on Equip wears it, marks the row, announces it, and keeps focus on the button (now Take it off)');
  await p.keyboard.press('Enter');
  k = await p.evaluate(() => ({ eq: RB.game.s.equip.charm, focus: document.activeElement && document.activeElement.getAttribute('data-equip') }));
  assert(k.eq === null && k.focus === 'sb_goat_bell', 'Enter again takes it off; focus returns to Equip');
  // a keepsake's detail shows how it looks (drawn previews, front/side/back and portrait)
  await p.click('[data-it="lf_ferry_cap"]');
  const pv = await p.evaluate(() => {
    const cvs = Array.from(document.querySelectorAll('.leaf-b canvas[data-prev]'));
    const bt = cvs.find((cv) => cv.dataset.dir === 'battle');
    return { n: cvs.length, drawn: cvs.every((cv) => Array.from(EQT.data(cv)).some((v, i) => i % 4 === 3 && v > 0)), note: document.querySelector('.leaf-b .wear-prev').textContent,
      battle: !!bt && Math.abs(bt.getBoundingClientRect().width - bt.width * 2) <= 2 && bt.height > 60, bw: bt && [bt.width, bt.getBoundingClientRect().width] };
  });
  assert(pv.n === 4 && pv.drawn && pv.battle, 'a keepsake\'s detail previews the player wearing it (front, side, the battle figure seen from behind at the same 2 px per art px, portrait) ' + JSON.stringify(pv.bw));
  assert(!errors.length, 'no page errors (Satchel) ' + errors.join('; '));
  await p.context().close();
}

// ---- 6. phones: touch, no overflow at 320 px (also 200 % text), Japanese labels with furigana ----------
for (const [w, h, scale, lang] of [[320, 640, 1, 'en'], [320, 640, 2, 'en'], [390, 844, 1, 'ja'], [320, 640, 2, 'ja']]) {
  const tag = `${w}x${h}${scale !== 1 ? ' @' + scale * 100 + '% text' : ''}${lang === 'ja' ? ' ja' : ''}`;
  const { p, errors } = await page(b, url, { viewport: { width: w, height: h }, touch: true, mobile: true, dpr: 2 });
  await helpers(p);
  await p.evaluate(([sc, lang]) => { RB.game.settings.textScale = sc; RB.game.settings.uiLang = lang; RB.game.applySettings(); const s = EQT.start(); RB.equip.equip(s, 'rw_reed_charm'); RB.equip.equip(s, 'atlas_cos_sash'); RB.ui.menu.open('satchel'); }, [scale, lang]);
  await p.waitForSelector('.eq-slots');
  await p.waitForTimeout(150);
  // open a charm's detail inline and equip it by touch
  const tapOn = async (sel) => {
    const box = await p.evaluate((sel) => { const e = document.querySelector(sel); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
    await p.touchscreen.tap(box.x, box.y);
    await p.waitForTimeout(120);
  };
  await tapOn('[data-it="sg_lens_charm"]');
  await tapOn('.inline-detail [data-equip="sg_lens_charm"]');
  const m = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const over = [];
    for (const e of document.querySelectorAll('.folio .leaf *')) {
      const r = e.getBoundingClientRect();
      if (!r.width || getComputedStyle(e).visibility === 'hidden' || e.closest('.sr')) continue;
      if (r.right > vw + 1 || r.left < -1) over.push(e.tagName + '.' + e.className + ' "' + (e.textContent || '').slice(0, 20) + '"');
    }
    // every tag and mark sits inside its row
    const spill = Array.from(document.querySelectorAll('.etag, .worn-tag')).filter((e) => { const r = e.getBoundingClientRect(), row = e.closest('.entry, li, .idetail').getBoundingClientRect(); return r.width && (r.right > row.right + 1 || r.left < row.left - 1); }).map((e) => e.textContent.slice(0, 20));
    const small = Array.from(document.querySelectorAll('.folio .leaf .pbtn, .folio .leaf button.entry')).filter((e) => e.offsetParent && (e.getBoundingClientRect().height < 43.5 || e.getBoundingClientRect().width < 43.5)).map((e) => e.textContent.trim().slice(0, 20));
    // Japanese labels: every kanji inside a ruby base (furigana), with English for screen readers
    const bare = [];
    for (const e of document.querySelectorAll('.folio .leaf .worn-tag, .folio .leaf .etag, .folio .leaf .eq-slot .kind, .folio .leaf h3')) {
      const c = e.cloneNode(true);
      c.querySelectorAll('ruby, .sr').forEach((x) => x.remove());
      if (/[一-鿿]/.test(c.textContent)) bare.push(c.textContent.trim().slice(0, 20));
    }
    return {
      doc: document.documentElement.scrollWidth > vw + 1, over: over.slice(0, 5), spill: spill.slice(0, 5), small: small.slice(0, 5), bare: bare.slice(0, 5),
      ruby: document.querySelectorAll('.folio .leaf .worn-tag ruby rt, .folio .leaf .etag ruby rt').length,
      eq: RB.game.s.equip.charm, worn: document.querySelector('[data-it="sg_lens_charm"]').classList.contains('worn'),
      inlineWorn: !!document.querySelector('.inline-detail .worn-tag'),
    };
  });
  assert(m.eq === 'sg_lens_charm' && m.worn && m.inlineWorn, `${tag}: tapping a charm and then Equip wears it and marks it`);
  assert(!m.doc && !m.over.length && !m.spill.length, `${tag}: nothing wider than the screen, every tag inside its row` + (m.over.length ? ' over: ' + m.over.join(', ') : '') + (m.spill.length ? ' spill: ' + m.spill.join(', ') : ''));
  assert(!m.small.length, `${tag}: Satchel controls at least 44 px` + (m.small.length ? ' ' + JSON.stringify(m.small) : ''));
  if (lang === 'ja') assert(m.ruby > 10 && !m.bare.length, `${tag}: Japanese labels on tags, marks and slots carry furigana (${m.ruby} readings)` + (m.bare.length ? ' bare kanji: ' + m.bare.join(', ') : ''));
  assert(!errors.length, `${tag}: no page errors ` + errors.join('; '));
  await p.context().close();
}

await b.close(); srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
