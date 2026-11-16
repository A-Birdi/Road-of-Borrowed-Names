// B1, the Company panel while a companion is away (Agnes 6552476316, 6552577628, 6912326373; Local CL-582, CL-846;
// Cloud CC-422, CC-608): RB.ui.company.away(), the summary pair and the Companion page's text, without a browser.
// Row numbers are CC-608's acceptance matrix.
//  1-3. the real hooks (`!hook comp_away surety|night|quarrel`), each companion its callers use: the reason's words,
//       with the name, in the summary and on the page; the portrait's label names them (16);
//  4.   synthetic: an unknown reason ('' , 'again', or a property-like one such as 'constructor') gets the neutral
//       words and names no place;
//  5.   synthetic: a stale `_away` beside an active companion claims no absence;
//  6.   synthetic: away beats provisional;
//  7.   invalid identity (absent, '', unknown, property-like, not a string, a real character who is not a companion):
//       no away claim, and exactly today's provisional or empty text;
//  8.   the pet half of the summary is the same with and without an absence;
//  11.  the page offers nothing to do with them: no actions, topics, sections, cases, speech set, bond or first words;
//       an open detail left from an active companion is closed (view state only);
//  13.  coming back (`!hook comp_back`): no away claim;
//  15.  nothing is written to the journey: its JSON is the same after every call (the folio's view state is not the
//       journey, and only `detail` changes there). Any Japanese drawn on any page already fills in the sailing
//       defaults once (RB.ui.jhtml -> jpVars -> boatName -> src/engine/72v_sail.js `of`, which adds `s.sea`); that is
//       the game's own, before this row, so it is done once before the journey is compared.
// The Companion page's no-companion path is rendered into a stand-in leaf: it needs no DOM. Japanese text and a spoken
// line are drawn with running numbers (data-src, data-say), which differ from one drawing to the next: they are set
// aside when two drawings are compared.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const S = RB.state, CO = RB.ui.company, CH = RB.content.chars;
  const COMPS = ['nao', 'mio', 'ren', 'suzu'];
  const plain = (h) => String(h).replace(/<rt>[^<]*<\/rt>/g, '').replace(/<[^>]+>/g, ' ').replace(/&#39;|&#x27;/g, '\'').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const SUM = { surety: 'waiting at the Mist Barrier while you fetch Shizu\'s guarantee from Kumoi', night: 'apart tonight', other: 'away for now' };
  const PAGE = {
    surety: (n) => n + ' is waiting at the Mist Barrier while you go up to Kumoi for the letter of guarantee from Shizu, the headwoman. Until you\'re back together, you travel and fight alone.',
    night: (n) => n + ' is spending tonight apart from you. Until you\'re back together, you travel and fight alone.',
    other: (n) => n + ' is away for now. Until you\'re back together, you travel and fight alone.',
  };
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: 2 });
    s.id = 'away-test';
    s.comp = o.comp === undefined ? null : o.comp;
    if (o.prov) s.provisional = o.prov;
    s.vars = Object.assign({}, o.vars || {});
    if (o.pet) { s.company.pets[o.pet] = { name: 'Tama' }; s.company.pet = o.pet; }
    RB.game.G.s = s;
    return s;
  };
  // the Companion page's no-companion path, into a stand-in leaf; a detail left open from an active companion
  const page = (s) => {
    const A = { innerHTML: '', querySelector: () => null }, B = { innerHTML: '' };
    const view = { page: 'companion', detail: 'quest' };
    CO.pages.companion.render(A, B, false, { s, view, render() {}, remember() {} });
    return { html: A.innerHTML, text: plain(A.innerHTML), view };
  };
  const pair = (s) => { const h = CO.summary(s); const parts = h.split('<div class="co-who">'); return { who: plain(parts[1] || ''), pet: plain(parts[2] || '') }; };
  const CONTROLS = /data-co-act|data-co-topic|data-co-sec|data-co-case-talk|data-co-case-open|data-suzu-speech-set|co-said|co-bond|co-support/;
  const json = (s) => JSON.stringify(s);
  const norm = (h) => String(h).replace(/data-src="\d+"/g, 'data-src="#"').replace(/data-say="sl\d+"/g, 'data-say="sl#"');

  t.ok(typeof CO.away === 'function', 'the Company exposes away()');

  // ---- 1-3: the real hooks, each companion their callers use --------------------------------------------------------
  const CASES = [['surety', 'nao'], ['surety', 'mio'], ['surety', 'ren'], ['surety', 'suzu'], ['night', 'nao'], ['night', 'mio'], ['night', 'suzu'], ['quarrel', 'nao'], ['quarrel', 'ren']];
  for (const [why, id] of CASES) {
    const s = fresh({ comp: id });
    RB.hooks.comp_away([why]);
    const n = CH[id].name.en, k = why === 'quarrel' ? 'other' : why;
    RB.ui.jhtml(CH[id].name.jp);
    const before = json(s);
    const aw = CO.away(s), pr = pair(s), pg = page(s);
    t.ok(s.comp === null && aw && aw.id === id, why + ', ' + id + ': away() names ' + id);
    t.eq(pr.who, n + ' ' + SUM[k], why + ', ' + id + ': the summary says who and why');
    t.ok(pg.text.indexOf(PAGE[k](n)) >= 0 && !/No one travels with you yet|travelling with you for now/.test(pg.text), why + ', ' + id + ': the page says who and where, and nothing of no one or of a provisional companion');
    t.ok(pg.html.indexOf('aria-label="Portrait of ' + n + '"') >= 0, why + ', ' + id + ': the portrait is labelled with their name (16)');
    t.ok(!CONTROLS.test(pg.html) && !/Bond/.test(pg.text), why + ', ' + id + ': nothing to do with them, no bond, no first words (11)');
    t.ok(pg.view.detail === null && pg.view.page === 'companion', why + ', ' + id + ': an open detail is closed; the page choice is kept (11)');
    t.eq(json(s), before, why + ', ' + id + ': nothing in the journey changes (15)');
    // 13: coming back
    RB.hooks.comp_back();
    t.ok(s.comp === id && CO.away(s) === null && pair(s).who.indexOf(SUM[k]) < 0, why + ', ' + id + ': back together, no away claim (13)');
  }

  // ---- 4: synthetic, an unknown reason --------------------------------------------------------------------------------
  for (const why of ['', 'again', 'constructor', '__proto__', 'toString', 'hasOwnProperty', undefined, null, 7]) {
    const s = fresh({ vars: { _away: 'mio', _away_why: why } });
    const pr = pair(s), pg = page(s), n = CH.mio.name.en;
    t.eq(pr.who, n + ' ' + SUM.other, 'synthetic, reason ' + JSON.stringify(why) + ': the neutral words in the summary');
    t.ok(pg.text.indexOf(PAGE.other(n)) >= 0 && !/Mist Barrier|Kumoi|tonight/.test(pg.text), 'synthetic, reason ' + JSON.stringify(why) + ': the neutral words on the page, no place named');
  }

  // ---- 5: synthetic, a stale `_away` beside an active companion ------------------------------------------------------
  {
    const s = fresh({ comp: 'nao', vars: { _away: 'mio', _away_why: 'surety' } });
    const pr = pair(s);
    t.ok(CO.away(s) === null && pr.who.indexOf(CH.nao.name.en) === 0 && !/waiting|away|apart/.test(pr.who) && pr.who.indexOf(CH.mio.name.en) < 0, 'synthetic, stale away beside an active companion: the active one, no absence (' + pr.who + ')');
  }

  // ---- 6: synthetic, away and provisional at once -------------------------------------------------------------------
  {
    const s = fresh({ prov: 'ren', vars: { _away: 'suzu', _away_why: 'night' } });
    const pr = pair(s), pg = page(s);
    t.eq(pr.who, CH.suzu.name.en + ' ' + SUM.night, 'synthetic, away and provisional: away wins in the summary');
    t.ok(pg.text.indexOf(PAGE.night(CH.suzu.name.en)) >= 0 && !/travelling with you for now/.test(pg.text), 'synthetic, away and provisional: away wins on the page');
  }

  // ---- 7: invalid identity -------------------------------------------------------------------------------------------
  const other = Object.keys(CH).find((k) => COMPS.indexOf(k) < 0 && CH[k] && CH[k].name);
  t.ok(!!other, 'a real character who is not a companion: ' + other);
  for (const prov of [null, 'mio']) {
    const base = fresh({ prov });
    const want = { sum: CO.summary(base), page: norm(page(base).html) };
    for (const id of [undefined, '', 'zzz', 'constructor', '__proto__', 'hasOwnProperty', 1, {}, ['nao'], other]) {
      const s = fresh({ prov, vars: id === undefined ? {} : { _away: id, _away_why: 'surety' } });
      t.ok(CO.away(s) === null, 'invalid ' + JSON.stringify(id) + (prov ? ', provisional' : '') + ': no away claim');
      t.ok(CO.summary(s) === want.sum && norm(page(s).html) === want.page, 'invalid ' + JSON.stringify(id) + (prov ? ', provisional' : '') + ': exactly today\'s text');
    }
  }

  // ---- 8: the pet half -----------------------------------------------------------------------------------------------
  {
    const a = fresh({ pet: 'cat', vars: { _away: 'nao', _away_why: 'night' } }), b = fresh({ pet: 'cat' });
    const c = fresh({ vars: { _away: 'nao', _away_why: 'night' } }), d = fresh({});
    t.ok(pair(a).pet === pair(b).pet && /Tama/.test(pair(a).pet), 'with a pet: the pet half is the same while away (' + pair(a).pet + ')');
    t.ok(pair(c).pet === pair(d).pet && /No pet/.test(pair(c).pet), 'without a pet: "No pet" while away too');
  }
};
