// Roadside Keepsakes on the whole twelve-chapter road (KS-1, C-94; Robin 2026-10-14: "there are only 6 Keepsakes
// still?"). Synthetic campaigns only.
//  - no item that calls itself a keepsake is missing from the catalogue (the fault Robin found: the expansion's were
//    satchel items only), and each is the item of exactly one entry;
//  - every entry is complete (name with reading, description, where or how, two hints, a known region) and its art
//    draws inside its 32 × 32 grid;
//  - every region of the twelve-chapter road has at least two (the Hall and Ashihara Shinden one); a six-chapter journey neither shows nor counts the
//    twelve-chapter regions and entries;
//  - giving the item records the keepsake for the journey being played (scenes, quest rewards, battle rewards all go
//    through RB.state.give), and never for a copy (the quest guide's simulations);
//  - a journey from before that already holds such an item shows it as found, without loading ever writing into a save;
//  - each chapter's own keepsakes (ks_*) are given by a scene that records them, placed where a journey already past
//    the chapter can still find them, and the scene really records them when played.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, K = C.keepsakes, I = C.items, S = RB.state;
  const UIK = RB.ui.keepsakes;
  const REG = UIK.regions;

  // ---- nothing that calls itself a keepsake is left out ------------------------------------------------------------------
  const called = Object.keys(I).filter((id) => /\bkeepsake\b/i.test(JSON.stringify(I[id].desc || '')));
  const byItem = {};
  for (const id in K) if (K[id].item) (byItem[K[id].item] = byItem[K[id].item] || []).push(id);
  const missing = called.filter((id) => !byItem[id]);
  t.ok(missing.length === 0, 'every item described as a keepsake is in the catalogue (missing: ' + missing.join(', ') + ')');
  t.ok(Object.values(byItem).every((a) => a.length === 1), 'each item belongs to one catalogue entry');
  t.ok(Object.keys(byItem).every((id) => I[id]), 'every entry\'s item exists');
  t.ok(called.length >= 22, 'the 22 keepsake items known on 2026-10-14 are all there (' + called.length + ')');

  // ---- every entry is complete and its art stays on its grid ---------------------------------------------------------------
  const furi = (jp) => !/[一-鿿]/.test(String(jp).replace(/\{[^|}]+\|[^}]+\}/g, ''));
  const stub = () => {
    const rec = { rects: 0, out: 0 };
    const g = new Proxy({}, { get: (o, k) => {
      if (k === 'fillRect') return (x, y, w, h) => { rec.rects++; if (x < -0.5 || y < -0.5 || x + w > 32.5 || y + h > 32.5) rec.out++; };
      if (k in o) return o[k];
      return typeof k === 'string' && /^(fill|stroke|beginPath|moveTo|lineTo|arc|ellipse|closePath|rect|save|restore|translate|rotate|scale|quadraticCurveTo|bezierCurveTo|setTransform|clearRect|drawImage|putImageData)$/.test(k) ? () => { if (k === 'fill') rec.rects++; } : (k === 'getImageData' ? () => ({ data: new Uint8ClampedArray(32 * 32 * 4) }) : undefined);
    }, set: (o, k, v) => { o[k] = v; return true; } });
    return { g, rec };
  };
  const road = Object.keys(K).filter((id) => K[id].category !== 'shared');
  for (const id of road) {
    const k = K[id];
    const ok = k.name && k.name.jp && k.name.en && furi(k.name.jp) && k.desc && k.desc.en && (k.how || k.source) && k.hint && k.hint.broad && k.hint.specific &&
      [].concat(k.region || []).every((r) => REG.some((x) => x.id === r));
    t.ok(ok, id + ': name with reading, description, where/how, two hints, a known region');
    const { g, rec } = stub();
    try { k.art(g, { width: 32, height: 32 }); } catch (e) { rec.err = e.message; }
    t.ok(!rec.err && rec.rects >= 5 && rec.out === 0, id + ': its art draws on the 32 × 32 grid (' + rec.rects + ' marks, ' + rec.out + ' outside' + (rec.err ? ', ' + rec.err : '') + ')');
  }

  // ---- every region has at least two; a six-chapter journey sees only its own ----------------------------------------------
  const s2 = S.newCampaign({ edition: 2 }), s1 = S.newCampaign({ edition: 1 });
  // the twelve chapters' regions at least two each; the Hall and Ashihara Shinden (after the story) at least one
  const SMALL = ['hall', 'ashihara'];
  for (const r of REG) {
    const here = road.filter((id) => [].concat(K[id].region || []).includes(r.id));
    const need = SMALL.includes(r.id) ? 1 : 2;
    t.ok(here.length >= need, r.en + ': at least ' + need + ' keepsake' + (need > 1 ? 's' : '') + ' (' + here.length + ')');
  }
  t.ok(REG.length >= 14, 'the page knows the twelve-chapter road, the Hall and Ashihara Shinden (' + REG.length + ' regions)');
  const c2 = UIK.counts(s2), c1 = UIK.counts(s1);
  t.eq([c2.total, c2.regionTotal], [road.length, REG.length], 'a twelve-chapter journey counts every entry and region');
  t.eq([c1.total, c1.regionTotal], [road.filter((id) => !K[id].ed).length, REG.filter((r) => !r.ed).length], 'a six-chapter journey counts only its own');
  t.eq(c1.regionTotal, 6, 'a six-chapter journey has its six regions');

  // ---- giving the item records it, for the journey being played only -------------------------------------------------------
  const events = [];
  RB.bus.on('keepsake:found', (e) => events.push(e.id));
  const live = S.newCampaign({ edition: 2 });
  RB.game.G.s = live;
  S.give(live, 'gd_rw_keepsake');
  t.ok(live.discovery.keepsakes.gd_rw_keepsake && live.discovery.keepsakes.gd_rw_keepsake.how.kind === 'item', 'a guardian\'s gift is recorded when given');
  t.eq(events, ['gd_rw_keepsake'], 'with its notice, once');
  S.give(live, 'gd_rw_keepsake');
  t.eq(events.length, 1, 'giving it again records nothing more');
  S.give(live, 'sg_glass_earrings', 1); // a quest reward goes through the same give
  t.ok(!!live.discovery.keepsakes.sg_glass_earrings, 'a quest reward\'s keepsake is recorded');
  const copy = JSON.parse(JSON.stringify(live));
  S.give(copy, 'as_kasa');
  t.ok(!copy.discovery.keepsakes.as_kasa && !live.discovery.keepsakes.as_kasa, 'a copy (the quest guide\'s simulation) records nothing');
  S.give(live, 'rw_ribbon', -1);
  t.ok(!live.discovery.keepsakes.rw_ribbon, 'taking an item away records nothing');

  // ---- a journey from before that already holds one shows it as found, and loading never writes into the save ----------
  const old = S.newCampaign({ edition: 2 });
  old.inv.lw_iroha_print = 1; old.inv.hall_lantern = 1; old.equip = Object.assign(old.equip || {}, { cosmetic: 'gd_yn_keepsake' });
  const was = JSON.stringify(old);
  const m = RB.save.migrate(JSON.parse(was));
  t.ok(!Object.keys(m.discovery.keepsakes).length, 'loading records nothing (a save is never written into on load)');
  t.ok(['lw_iroha_print', 'hall_lantern', 'gd_yn_keepsake'].every((id) => UIK.found(m, id)), 'held and worn keepsake items show as found');
  t.ok(!UIK.found(m, 'as_kasa'), 'an item not held does not');
  t.eq(UIK.counts(m).found, 3, 'and they are counted');
  const six = S.newCampaign({ edition: 1 });
  six.inv.rw_ribbon = 1;
  const six0 = JSON.stringify(six.discovery) + JSON.stringify(six.awarded || {});
  const m6 = RB.save.migrate(six);
  t.eq(JSON.stringify(m6.discovery) + JSON.stringify(m6.awarded || {}), six0, 'a six-chapter save is left exactly as it was written');
  // New Game+ keeps the catalogue's found record (C-66), held keepsake items included
  {
    const ng = RB.ngplus.carry(m, { edition: 2 });
    t.ok(['lw_iroha_print', 'hall_lantern', 'gd_yn_keepsake'].every((id) => ng.records && ng.records.found && ng.records.found[id]), 'New Game+ carries them in the found record');
  }

  // ---- each chapter's own keepsakes: given by a scene, findable after the chapter, recorded when played -----------------------
  const own = road.filter((id) => /^ks_/.test(id));
  const sceneOf = {};
  for (const sid in C.scenes) for (const cmd of C.scenes[sid].cmds || []) {
    if (cmd.op === 'hook' && cmd.args && cmd.args[0] === 'cs_keepsake' && cmd.args[1]) (sceneOf[cmd.args[1]] = sceneOf[cmd.args[1]] || []).push(sid);
  }
  const placed = (sid) => {
    for (const mid in C.maps) {
      const mp = C.maps[mid];
      for (const n of mp.npcs || []) for (const o of [].concat(n.talk || [])) if (o && o.scene === sid) return { map: mid, cond: o.if || '', who: n.id };
      for (const p of mp.props || []) if (p.scene === sid) return { map: mid, cond: p.if || '', prop: p.p };
    }
    return null;
  };
  const NEW = ['manybridge', 'blockprint', 'keepers_road', 'kotonoha', 'cloudroad', 'steamhollow'];
  for (const r of NEW) t.ok(own.filter((id) => [].concat(K[id].region).includes(r)).length >= 2, r + ': two keepsakes of its own');
  for (const id of own) {
    const scenes = sceneOf[id] || [];
    t.ok(scenes.length >= 1, id + ': a scene records it');
    const where = scenes.map(placed).find(Boolean);
    t.ok(!!where, id + ': the scene is placed on a map (' + (where ? where.map : 'nowhere') + ')');
    // offered only until found: either the placement's own condition says so, or the scene branches on it (a place
    // that otherwise just describes itself)
    const guard = new RegExp('!keepsake\\.' + id + '\\b');
    const inScene = scenes.some((sid) => (C.scenes[sid].cmds || []).some((c) => c.op === 'if' && guard.test(String(c.args && c.args[0]))));
    t.ok(where && (guard.test(where.cond) || inScene), id + ': offered only until it is found');
    t.ok(K[id].ed === 2, id + ': twelve-chapter only');
  }

  // play each chapter keepsake's scene with a stubbed stage and check it records the keepsake
  RB.ui.dialogue.say = async () => {}; RB.ui.dialogue.choose = async () => 0; RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {}; RB.ui.notice = () => {}; RB.ui.shake = () => {}; RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {}; RB.world.emote = () => {}; RB.game.afterScene = () => {}; RB.world.W = RB.world.W || {};
  RB.game.inBattle = () => false; RB.save.autosave = async () => {}; RB.challenge.run = async () => ({ ok: true });
  RB.game.startEncounter = async () => ({ result: 'win', outcome: 'settled' });
  for (const id of own) {
    const sid = (sceneOf[id] || [])[0];
    if (!sid) continue;
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const s = S.newCampaign({ edition: 2 });
      s.comp = comp; s.player.name = 'Haru'; s.player.nameJp = 'ハル';
      Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, sa_done: true, post: true, postgame: true });
      const where = placed(sid);
      s.map = where ? where.map : 'rw.square';
      RB.game.G.s = s; RB.world.W.map = { id: s.map };
      let err = null;
      try { await RB.script.run(sid); } catch (e) { err = e.message; }
      t.ok(!err && !!s.discovery.keepsakes[id], id + ' (' + (comp || 'alone') + '): playing its scene records it' + (err ? ' — ' + err : ''));
    }
  }
};
