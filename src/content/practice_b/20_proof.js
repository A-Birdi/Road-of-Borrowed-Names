/* The Proofreader's Tray (Practice addendum §18.2): twelve notices, P01–P12, each with
 * Foundations / Elementary / Intermediate / Advanced adaptations (48 variants), every
 * one laid out on a single sheet with all the evidence needed to check it.
 * Engine: src/engine/79_proof.js; interface: src/ui/91_proof.js.
 *
 * A variant:
 *   purpose     who the notice is for and what it must do
 *   evidence    the tray's evidence (rendered with text equivalents; kinds below)
 *   notice      { title, segs: [{ jp, bad?, options?, ok? }], list? }  the notice, in
 *               selectable portions. A `bad` portion disagrees with the evidence and
 *               carries its replacement `options` ({ jp, en, ok, why? | note? }); a fine
 *               portion may carry `ok` (why it agrees) or `style` (a matter of wording only).
 *   find        optional: a question that replaces picking a portion (an omission or a
 *               vague notice has no wrong word to point at)
 *   insufficient  P12: nothing can be settled from the evidence; the right move is to ask
 *   repair      { kind: 'replace' } (the bad portion's options) | { kind: 'order', tiles,
 *               answer, alts? } | { kind: 'choose', options } | { kind: 'ask', replies }
 *   consequence what the repaired notice now does (shown highlighted)
 *   explain     one explanation (mixed text) · item: the ordinary learning item
 * Evidence kinds: plan (places in a row, each open/closed, with the viewpoint), count
 * (pictured objects + text), slip, rule, steps, seq (sequence diagram), objects (two
 * distinguishable things with descriptions), table (a miniature schedule), note, measure. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  C.practiceB = C.practiceB || {};
  const T = (en, jp) => ({ en, jp });
  const o = (jp, en, ok, why) => (ok ? { jp, en, ok: true, note: why || null } : { jp, en, ok: false, why: { en: why } });
  const ask = (tone, parts, en, x) => Object.assign({ ok: true, tone, parts, en }, x || {});
  const nah = (parts, en, why, x) => Object.assign({ ok: false, parts, en, why: { en: why } }, x || {});

  C.practiceB.proof = [
    // ---- P01 · left/right reversed --------------------------------------------------------------------
    {
      id: 'P01', fn: 'left-right', title: T('Which door?', 'どちら の {戸|と} か'),
      gist: 'A direction notice and a plan of the doors.',
      tiers: {
        F: {
          purpose: T('A sign at the post house: which door visitors use.', '{郵便所|ゆうびんじょ} の {入|い}り{口|ぐち} の {案内|あんない} 。'),
          evidence: [{ k: 'plan', title: T('The doors, seen from the street', '{道|みち} から {見|み}た {戸|と}'),
            cells: [{ label: T('left', '{左|ひだり}'), state: 'closed', name: T('door', '{戸|と}') }, { label: T('right', '{右|みぎ}'), state: 'open', name: T('door', '{戸|と}') }],
            alt: 'Seen from the street: the left door is closed; the right door is open.' }],
          notice: { title: T('The sign', '{案内|あんない}'), segs: [
            { jp: '{入|い}り{口|ぐち} は' },
            { jp: '{左|ひだり}', bad: true, options: [o('{右|みぎ}', 'right', true), o('{左|ひだり}', 'left', false, 'That is what it says now: the closed door.'), o('{上|うえ}', 'up', false, 'There is no door upstairs on the plan.')] },
            { jp: 'です 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Which word belongs here?', 'ここ に {入|はい}る {言葉|ことば} は ？') },
          consequence: T('The sign now sends visitors to the open door.', 'これ で 、 {開|あ}いて いる {戸|と} に {案内|あんない} できます 。'),
          explain: { en: 'On the plan the open door is on the right ({右|みぎ}). The sentence was correct Japanese; the information was wrong.' },
          item: 'v:右',
        },
        E: {
          purpose: T('A notice on the warehouse wall for carters bringing goods.', '{荷|に} を {運|はこ}ぶ {人|ひと} の ため の 、 {倉庫|そうこ} の {張|は}り{紙|がみ} 。'),
          evidence: [{ k: 'plan', title: T('The warehouse front, seen from the street', '{道|みち} から {見|み}た {倉庫|そうこ} の {正面|しょうめん}'),
            cells: [{ label: T('left', '{左|ひだり}'), state: 'closed', name: T('door — under repair', '{扉|とびら} ・ {修理中|しゅうりちゅう}') }, { label: T('right', '{右|みぎ}'), state: 'open', name: T('door', '{扉|とびら}') }],
            alt: 'Seen from the street: the left door is under repair and closed; the right door is open.' }],
          notice: { title: T('The notice', '{張|は}り{紙|がみ}'), segs: [
            { jp: '{修理|しゅうり} の ため 、', ok: 'The left door really is under repair.' },
            { jp: '{左|ひだり}', bad: true, options: [o('{右|みぎ}', 'right', true), o('{右側|みぎがわ}', 'right side', true, 'Also right: "the right side".'), o('{左|ひだり}', 'left', false, 'That is the door under repair.'), o('{正面|しょうめん}', 'front', false, 'The plan shows two doors, not one front door.')] },
            { jp: 'の {扉|とびら} を {使|つか}って ください 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the direction.', '{方向|ほうこう} を {直|なお}しましょう 。') },
          consequence: T('The notice now directs carters to the open door.', 'これ で 、 {開|あ}いて いる {扉|とびら} に {案内|あんない} できます 。'),
          explain: { en: 'The plan is drawn from the street, as carters see it: the working door is on the right. {右|みぎ} and {右側|みぎがわ} say the same thing.' },
          item: 'v:右',
        },
        I: {
          purpose: T('Delivery instructions at No. 2 warehouse.', '{二番|にばん} {倉庫|そうこ} の {荷|に} の {入|い}れ{方|かた} の {案内|あんない} 。'),
          evidence: [{ k: 'plan', title: T('No. 2 warehouse, facing the front', '{正面|しょうめん} から {見|み}た {二番|にばん} {倉庫|そうこ}'),
            cells: [{ label: T('left', '{左|ひだり}'), state: 'closed', name: T('door — bolted', '{扉|とびら} ・ {閂|かんぬき}') }, { label: T('right', '{右|みぎ}'), state: 'open', name: T('door', '{扉|とびら}') }],
            alt: 'Facing the front of No. 2 warehouse: the left door is bolted shut; the right door is open.' }],
          notice: { title: T('Delivery notice', '{荷|に} の {入|い}れ{方|かた}'), segs: [
            { jp: '{正面|しょうめん} から {見|み}て 、' },
            { jp: '{左|ひだり} の {扉|とびら} は {閉|し}めて あります 。', ok: 'Right: the bolted door is on the left.' },
            { jp: '{荷物|にもつ} は' },
            { jp: '{左|ひだり} の {扉|とびら} から', bad: true, options: [o('{右|みぎ} の {扉|とびら} から', 'through the right door', true), o('{右側|みぎがわ} の {扉|とびら} から', 'through the right-hand door', true), o('{開|あ}いて いる {扉|とびら} から', 'through the open door', true, 'Also right: it names the door by what the plan shows.'), o('{左|ひだり} の {扉|とびら} から', 'through the left door', false, 'That is the bolted door.')] },
            { jp: '{入|い}れて ください 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the second instruction.', '{二|ふた}つ {目|め} の {指示|しじ} を {直|なお}しましょう 。') },
          consequence: T('Deliveries now go through the door that is open.', 'これ で 、 {荷物|にもつ} は {開|あ}いて いる {扉|とびら} から {入|はい}ります 。'),
          explain: { en: 'Both instructions say {左|ひだり}, but only the first is true: the left door is the shut one. Proofreading checks each claim against the plan, not the wording.' },
          item: 'v:右',
        },
        A: {
          purpose: T('A formal notice for visitors to the Records Hall during repairs.', '{改修|かいしゅう} {中|ちゅう} の {記録館|きろくかん} を {訪|おとず}れる {人|ひと} へ の {掲示|けいじ} 。'),
          evidence: [{ k: 'plan', title: T('The hall front, as you face it', '{向|む}かって {見|み}た {記録館|きろくかん}'),
            cells: [{ label: T('left (as you face it)', '{向|む}かって {左|ひだり}'), state: 'closed', name: T('entrance — works', '{入口|いりぐち} ・ {工事中|こうじちゅう}') }, { label: T('right (as you face it)', '{向|む}かって {右|みぎ}'), state: 'open', name: T('entrance', '{入口|いりぐち}') }],
            alt: 'As you face the Records Hall: the left entrance is closed for works; the right entrance is open. (Seen from inside the building, the open entrance is on its left.)' }],
          notice: { title: T('Notice', '{掲示|けいじ}'), segs: [
            { jp: '{改修|かいしゅう} {工事|こうじ} の ため 、' },
            { jp: '{当面|とうめん} の {間|あいだ} 、', style: 'A formal "for the time being" — a matter of register, not of fact.' },
            { jp: '{向|む}かって {左|ひだり}', bad: true, options: [o('{向|む}かって {右|みぎ}', 'on the right as you face it', true), o('{正面|しょうめん} から {見|み}て {右|みぎ}', 'on the right seen from the front', true), o('{建物|たてもの} から {見|み}て {左|ひだり}', 'on the left seen from the building', true, 'Accurate — seen from inside, the open entrance is on the left — though visitors read {向|む}かって more easily.'), o('{建物|たてもの} から {見|み}て {右|みぎ}', 'on the right seen from the building', false, 'Seen from the building, the right-hand entrance is the closed one.'), o('{向|む}かって {左|ひだり}', 'on the left as you face it', false, 'That is the entrance closed for works.')] },
            { jp: 'の {入口|いりぐち} より お{入|はい}り ください 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the direction, keeping the notice formal.', '{改|あらた}まった {文体|ぶんたい} の まま 、 {方向|ほうこう} を {直|なお}しましょう 。') },
          consequence: T('Visitors are now sent to the entrance that is open.', 'これ で 、 {来館者|らいかんしゃ} は {開|あ}いて いる {入口|いりぐち} に {向|む}かいます 。'),
          explain: { en: '{向|む}かって{右|みぎ} means "on the right as you face it", the visitor\'s view. Left and right flip with the viewpoint, so a notice has to say whose view it uses.' },
          item: 'v:向かう',
        },
      },
    },

    // ---- P02 · quantity mismatch -----------------------------------------------------------------------
    {
      id: 'P02', fn: 'quantity', title: T('How many?', 'いくつ ？'),
      gist: 'A label or record, and a picture of what is really there.',
      tiers: {
        F: {
          purpose: T('A label on a basket going to the inn.', '{宿|やど} へ {送|おく}る かご の {札|ふだ} 。'),
          evidence: [{ k: 'count', title: T('In the basket', 'かご の {中|なか}'), icon: 'fruit', n: 3, label: T('three persimmons', '{柿|かき} {三|みっ}つ'), alt: 'Three persimmons in the basket.' }],
          notice: { title: T('The label', '{札|ふだ}'), segs: [
            { jp: '{柿|かき} が' },
            { jp: '{二|ふた}つ', bad: true, options: [o('{三|みっ}つ', 'three', true), o('{二|ふた}つ', 'two', false, 'The basket holds three.'), o('{四|よっ}つ', 'four', false, 'Count again: there are three.')] },
            { jp: 'あります 。' },
          ] },
          repair: { kind: 'replace', prompt: T('How many are there?', 'いくつ あります か 。') },
          consequence: T('The label now matches the three persimmons in the basket.', 'これ で 、 {札|ふだ} と かご の {中|なか} が {合|あ}います 。'),
          explain: { en: '{三|みっ}つ is "three (things)". Counting the picture settles it.' },
          item: 'g:counters',
        },
        E: {
          purpose: T('A note packed with Mio\'s medicine order.', 'ミオ の {薬|くすり} の {荷|に} に {入|い}れる {書|か}き{付|つ}け 。'),
          evidence: [{ k: 'count', title: T('Packed in the box', '{箱|はこ} に {入|い}って いる もの'), icon: 'bottle', n: 5, label: T('five bottles of medicine', '{薬|くすり} の {瓶|びん} {五本|ごほん}'), alt: 'Five bottles of medicine are packed in the box.' }],
          notice: { title: T('The note', '{書|か}き{付|つ}け'), segs: [
            { jp: '{薬|くすり} の {瓶|びん} を' },
            { jp: '{六本|ろっぽん}', bad: true, options: [o('{五本|ごほん}', 'five (long things)', true), o('{五|いつ}つ', 'five', true, 'Also right, with the general counter.'), o('{六本|ろっぽん}', 'six', false, 'Only five are packed.'), o('{四本|よんほん}', 'four', false, 'Count again: five.')] },
            { jp: '{送|おく}ります 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the number.', '{数|かず} を {直|なお}しましょう 。') },
          consequence: T('The note now promises the five bottles that are actually packed.', 'これ で 、 {書|か}き{付|つ}け が {本当|ほんとう} に {入|はい}って いる {五本|ごほん} を {伝|つた}えます 。'),
          explain: { en: 'Bottles are counted with {本|ほん}: {五本|ごほん} (gohon). {五|いつ}つ, the general counter, is acceptable too.' },
          item: 'g:counters',
        },
        I: {
          purpose: T('The storeroom record at the harbour office.', '{港|みなと} の {事務所|じむしょ} の {倉庫|そうこ} の {記録|きろく} 。'),
          evidence: [{ k: 'count', title: T('The storeroom shelf today', '{今日|きょう} の {倉庫|そうこ} の {棚|たな}'), icon: 'can', n: 8, label: T('eight cans of lamp oil', '{灯油|とうゆ} {八缶|はちかん}'), alt: 'Eight cans of lamp oil stand on the storeroom shelf, in two rows of four.' }],
          notice: { title: T('Storeroom record', '{倉庫|そうこ} の {記録|きろく}'), segs: [
            { jp: '{倉庫|そうこ} の {灯油|とうゆ} は 、' },
            { jp: '{残|のこ}り' },
            { jp: '{四缶|よんかん}', bad: true, options: [o('{八缶|はちかん}', 'eight cans', true), o('{八缶|はっかん}', 'eight cans', true, 'Also right: はっかん is a common reading.'), o('{四缶|よんかん}', 'four cans', false, 'The shelf holds eight.'), o('{十二缶|じゅうにかん}', 'twelve cans', false, 'Two rows of four make eight.')] },
            { jp: 'です 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the count.', '{数|かず} を {直|なお}しましょう 。') },
          consequence: T('The record now shows the eight cans that are really there, so no one orders oil that isn\'t needed.', 'これ で 、 {本当|ほんとう} に ある {八缶|はちかん} が {記録|きろく} され 、 {要|い}らない {灯油|とうゆ} を {頼|たの}む {人|ひと} も いなく なります 。'),
          explain: { en: 'Cans are counted with {缶|かん}. A wrong count in a record does real harm: someone orders more, or goes without.' },
          item: 'g:counters',
        },
        A: {
          purpose: T('A notice for the festival committee: lanterns for each household.', '{祭|まつ}り の {係|かかり} へ の {通知|つうち} ： {各戸|かっこ} の {提灯|ちょうちん} 。'),
          evidence: [{ k: 'count', title: T('Households on the list', '{名簿|めいぼ} の {家|いえ}'), icon: 'house', n: 6, per: 2, perIcon: 'lantern', label: T('six households, two lanterns each', '{六軒|ろっけん} 、 {各|かく} {二|ふた}つ'), alt: 'Six households are on the list, and each gets two lanterns: twelve in all.' }],
          notice: { title: T('Committee notice', '{係|かかり} へ の {通知|つうち}'), segs: [
            { jp: '{各戸|かっこ} に {二|ふた}つ ずつ 、', ok: 'Right: two for each household.' },
            { jp: '{計|けい}' },
            { jp: '{十個|じゅっこ}', bad: true, options: [o('{十二個|じゅうにこ}', 'twelve', true), o('{十二|じゅうに}', 'twelve', true, 'Also right without the counter.'), o('{十個|じゅっこ}', 'ten', false, 'Ten would leave one household without its pair.'), o('{八個|はっこ}', 'eight', false, 'Six times two is twelve.')] },
            { jp: 'の {提灯|ちょうちん} を {配|くば}ります 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the total.', '{合計|ごうけい} を {直|なお}しましょう 。') },
          consequence: T('Every household now gets its two lanterns; the total no longer leaves one without.', 'これ で 、 どの {家|いえ} に も {二|ふた}つ ずつ {届|とど}き 、 {足|た}りない {家|いえ} が {出|で}ません 。'),
          explain: { en: '{各戸|かっこ}に{二|ふた}つずつ (two per household) is right; the total {計|けい} has to agree with it: six times two is twelve. Only the total is wrong.' },
          item: 'g:counters',
        },
      },
    },

    // ---- P03 · recipient or location confused ------------------------------------------------------------
    {
      id: 'P03', fn: 'recipient', title: T('To whom, and where?', '{誰|だれ} に 、 どこ へ'),
      gist: 'A label or envelope, and the address slip that came with it.',
      tiers: {
        F: {
          purpose: T('A label for a parcel.', '{小包|こづつみ} の {札|ふだ} 。'),
          evidence: [{ k: 'slip', title: T('The address slip', '{宛名|あてな} の {紙|かみ}'), lines: [T('To: Shino, at the post house', 'あて{先|さき} ： {郵便所|ゆうびんじょ} の シノ さん')] }],
          notice: { title: T('The label', '{札|ふだ}'), segs: [
            { jp: '{宿|やど} の', bad: true, options: [o('{郵便所|ゆうびんじょ} の', 'at the post house', true), o('{宿|やど} の', 'at the inn', false, 'Shino is at the post house, not the inn.'), o('{茶屋|ちゃや} の', 'at the teahouse', false, 'The slip says the post house.')] },
            { jp: 'シノ さん へ' },
          ] },
          repair: { kind: 'replace', prompt: T('Where is Shino?', 'シノ さん は どこ ？') },
          consequence: T('The parcel now goes to the post house, where Shino is.', 'これ で 、 {小包|こづつみ} は シノ さん の いる {郵便所|ゆうびんじょ} へ {行|い}きます 。'),
          explain: { en: 'The name was right; the place was not. A label has to agree with the slip on both.' },
          item: 'v:郵便',
        },
        E: {
          purpose: T('An envelope going up to the terraces.', '{段々畑|だんだんばたけ} へ {行|い}く {封筒|ふうとう} 。'),
          evidence: [{ k: 'slip', title: T('The slip from the glass workshop', 'ガラス {工房|こうぼう} から の {紙|かみ}'), lines: [T('From: Isao (glass workshop)', '{差出人|さしだしにん} ： イサオ （ ガラス {工房|こうぼう} ）'), T('To: Ume (the terraces)', '{宛先|あてさき} ： ウメ （ {段々畑|だんだんばたけ} ）')] }],
          notice: { title: T('The envelope', '{封筒|ふうとう}'), segs: [
            { jp: 'ウメ より 、', bad: true, group: 'swap' },
            { jp: 'イサオ へ', bad: true, group: 'swap' },
          ] },
          repair: { kind: 'order', prompt: T('Rearrange the pieces so the envelope matches the slip.', '{紙|かみ} に {合|あ}う よう に 、 {並|なら}べ{直|なお}しましょう 。'),
            tiles: ['ウメ', 'より 、', 'イサオ', 'へ'], answer: ['イサオ', 'より 、', 'ウメ', 'へ'], alts: [['ウメ', 'へ', 'イサオ', 'より 、']] },
          consequence: T('The envelope now goes from Isao to Ume, as the slip says.', 'これ で 、 {紙|かみ} の とおり 、 イサオ さん から ウメ さん へ {届|とど}きます 。'),
          explain: { en: 'より marks who it is from; へ marks who it is to. The two names had swapped places.' },
          item: 'g:prt_he',
        },
        I: {
          purpose: T('Directions written on a parcel for the Chronicle Hall.', '{記録堂|きろくどう} へ の {小包|こづつみ} に {書|か}いた {道案内|みちあんない} 。'),
          evidence: [{ k: 'slip', title: T('The address slip', '{宛名|あてな} の {紙|かみ}'), lines: [T('To: Tokiwa, the Chronicle Hall', '{宛先|あてさき} ： {記録堂|きろくどう} の トキワ さん'), T('North-east of the square, across the channel.', '{広場|ひろば} の {北東|ほくとう} 、 {水路|すいろ} を {渡|わた}った ところ 。')] }],
          notice: { title: T('Written on the parcel', '{小包|こづつみ} の {書|か}き{込|こ}み'), segs: [
            { jp: '{記録堂|きろくどう} の トキワ さん {宛|あて} 。', ok: 'The name and the hall are right.' },
            { jp: '{水路|すいろ} の {手前|てまえ} 、 {西|にし} の', bad: true, options: [
              o('{水路|すいろ} を {渡|わた}った {北東|ほくとう} の', 'the north-eastern one, across the channel', true),
              o('{水路|すいろ} の {向|む}こう 、 {北東|ほくとう} の', 'beyond the channel, to the north-east', true),
              o('{水路|すいろ} の {手前|てまえ} 、 {北東|ほくとう} の', 'this side of the channel, to the north-east', false, 'The hall is across the channel, not on this side.'),
              o('{水路|すいろ} を {渡|わた}った {西|にし} の', 'across the channel, to the west', false, 'The slip says north-east.')] },
            { jp: '{建物|たてもの} です 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair where the hall is.', '{記録堂|きろくどう} の {場所|ばしょ} を {直|なお}しましょう 。') },
          consequence: T('The parcel now goes across the channel to the north-east, where the hall actually is.', 'これ で 、 {小包|こづつみ} は {水路|すいろ} を {渡|わた}って 、 {本当|ほんとう} の {記録堂|きろくどう} へ {向|む}かいます 。'),
          explain: { en: '{手前|てまえ} is "this side of"; {向|む}こう / {渡|わた}った is "across". The recipient was right; the way there was wrong twice over.' },
          item: 'v:手前',
        },
        A: {
          purpose: T('The address on a letter that must reach Councillor Tami in person.', 'タミ {議員|ぎいん} {本人|ほんにん} に {届|とど}けたい {手紙|てがみ} の {宛名|あてな} 。'),
          evidence: [{ k: 'slip', title: T('The sender\'s instruction', '{差出人|さしだしにん} の {指示|しじ}'), lines: [T('For Councillor Tami herself.', 'タミ {議員|ぎいん} {本人|ほんにん} へ 。'), T('Not to be opened at the front counter.', '{受付|うけつけ} で {開|ひら}かない こと 。')] }],
          notice: { title: T('The envelope', '{封筒|ふうとう}'), segs: [
            { jp: '{議会堂|ぎかいどう}', ok: 'Right: she is found at the Council Chamber.' },
            { jp: '{受付|うけつけ} {御中|おんちゅう}', bad: true, options: [
              o('タミ {議員|ぎいん} {様|さま}', 'Councillor Tami (personally)', true),
              o('{議員|ぎいん} タミ {様|さま}', 'Councillor Tami (personally)', true, 'Also right: the title can come first.'),
              o('タミ {議員|ぎいん} {御中|おんちゅう}', 'Councillor Tami, attn. of the office', false, '{御中|おんちゅう} addresses an office or group, never one person.'),
              o('{受付|うけつけ} {御中|おんちゅう}', 'the front counter', false, 'That is the very place it must not be opened.')] },
          ] },
          repair: { kind: 'replace', prompt: T('Address it to the right recipient.', '{正|ただ}しい {宛名|あてな} に {直|なお}しましょう 。') },
          consequence: T('The letter now reaches Councillor Tami herself, not the front counter.', 'これ で 、 {手紙|てがみ} は {受付|うけつけ} で は なく 、 タミ {議員|ぎいん} {本人|ほんにん} に {届|とど}きます 。'),
          explain: { en: '{御中|おんちゅう} addresses an organisation or office; {様|さま} addresses a person. The building was right; the recipient was the counter instead of the councillor.' },
          item: 'v:様',
        },
      },
    },

    // ---- P04 · negation missing or misplaced -------------------------------------------------------------
    {
      id: 'P04', fn: 'negation', title: T('Allowed, or not?', 'いい の か 、 だめ なの か'),
      gist: 'A notice and the rule it is meant to repeat.',
      tiers: {
        F: {
          purpose: T('A notice by the kiln, repeating the workshop rule.', '{窯|かま} の {横|よこ} の {張|は}り{紙|がみ} 。 {工房|こうぼう} の きまり を {書|か}いた もの 。'),
          evidence: [{ k: 'rule', title: T('The workshop rule', '{工房|こうぼう} の きまり'), text: T('Don\'t use fire here.', 'ここ で は {火|ひ} を {使|つか}わないで ください 。') }],
          notice: { title: T('The notice', '{張|は}り{紙|がみ}'), segs: [
            { jp: 'ここ で' },
            { jp: '{火|ひ} を' },
            { jp: '{使|つか}って ください 。', bad: true, options: [o('{使|つか}わないで ください 。', 'please don\'t use', true), o('{使|つか}って ください 。', 'please use', false, 'That invites fire — the rule forbids it.'), o('{使|つか}って も いい です 。', 'you may use', false, 'That permits fire. The rule forbids it.')] },
          ] },
          repair: { kind: 'replace', prompt: T('What should the notice say?', '{何|なん} と {書|か}けば いい ？') },
          consequence: T('The notice now forbids fire, as the rule does.', 'これ で 、 きまり の とおり 、 {火|ひ} を {使|つか}わない よう に {伝|つた}えます 。'),
          explain: { en: '～ないでください means "please don\'t…". Without ない the notice says the opposite of the rule.' },
          item: 'g:v_naide_kudasai',
        },
        E: {
          purpose: T('The sign on the new kiln\'s vent.', '{新|あたら}しい {窯|かま} の {窓|まど} の {札|ふだ} 。'),
          evidence: [{ k: 'rule', title: T('Master Isao\'s rule', 'イサオ の きまり'), text: T('On windy nights, the vent must not be opened.', '{風|かぜ} の {強|つよ}い {夜|よる} は 、 {窓|まど} を {開|あ}けて は いけません 。') }],
          notice: { title: T('The sign', '{札|ふだ}'), segs: [
            { jp: '{風|かぜ} の {強|つよ}い {夜|よる} は 、', ok: 'Right: the rule is about windy nights.' },
            { jp: '{窓|まど} を' },
            { jp: '{開|あ}けて も いい です 。', bad: true, options: [o('{開|あ}けて は いけません 。', 'must not be opened', true), o('{開|あ}けないで ください 。', 'please don\'t open', true, 'Also right: a request not to open it.'), o('{開|あ}けて も いい です 。', 'may be opened', false, 'That permits what the rule forbids.'), o('{開|あ}けて ください 。', 'please open', false, 'That asks for the very thing the rule forbids.')] },
          ] },
          repair: { kind: 'replace', prompt: T('Repair it so it says what the rule says.', 'きまり と {同|おな}じ {意味|いみ} に {直|なお}しましょう 。') },
          consequence: T('The sign now keeps the vent shut on windy nights.', 'これ で 、 {風|かぜ} の {強|つよ}い {夜|よる} に {窓|まど} が {開|あ}けられ なく なります 。'),
          explain: { en: '～てもいい gives permission; ～てはいけません forbids. {開|あ}けないでください is a softer way to forbid the same thing.' },
          item: 'g:v_temo_ii',
        },
        I: {
          purpose: T('A notice at the top of the back path.', '{裏|うら} の {道|みち} の {入|い}り{口|ぐち} の {張|は}り{紙|がみ} 。'),
          evidence: [{ k: 'rule', title: T('The village rule', '{里|さと} の きまり'), text: T('The back path is slippery on rainy days: don\'t use it then. On other days it is open.', '{雨|あめ} の {日|ひ} は {裏|うら} の {道|みち} が {滑|すべ}る ので 、 {通|とお}らない こと 。 それ {以外|いがい} の {日|ひ} は {通|とお}って よい 。') }],
          notice: { title: T('The notice', '{張|は}り{紙|がみ}'), segs: [
            { jp: '{雨|あめ} の {日|ひ} {以外|いがい} は 、', bad: true, options: [o('{雨|あめ} の {日|ひ} は 、', 'on rainy days', true), o('{雨|あめ} が {降|ふ}って いる {日|ひ} は 、', 'on days when it is raining', true, 'Also right, just longer.'), o('{晴|は}れ の {日|ひ} は 、', 'on fine days', false, 'Fine days are when the path is open.'), o('{雨|あめ} の {日|ひ} {以外|いがい} は 、', 'on days other than rainy days', false, 'That closes the path on every day except the dangerous one.')] },
            { jp: '{裏|うら} の {道|みち} を' },
            { jp: '{通|とお}らないで ください 。', ok: 'Right: this is the "don\'t". The trouble is which days it covers.' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair which days the "don\'t" covers.', '「 {通|とお}らないで 」 が どの {日|ひ} の こと か 、 {直|なお}しましょう 。') },
          consequence: T('The back path is now closed only on rainy days, as the rule says — not on every other day.', 'これ で 、 {裏|うら} の {道|みち} は きまり どおり {雨|あめ} の {日|ひ} だけ {通|とお}れなく なります 。'),
          explain: { en: '{以外|いがい} ("other than") flipped the days the prohibition covers. The ないでください itself was right; its scope was wrong.' },
          item: 'g:v_naide_kudasai',
        },
        A: {
          purpose: T('The notice on the door of the archive\'s stacks.', '{書庫|しょこ} の {扉|とびら} の {掲示|けいじ} 。'),
          evidence: [{ k: 'rule', title: T('The archive\'s rule', '{書庫|しょこ} の {規則|きそく}'), text: T('Only the archive staff may enter the stacks.', '{書庫|しょこ} に {入|はい}れる の は 、 {係|かかり} の {者|もの} だけ と する 。') }],
          notice: { title: T('Notice', '{掲示|けいじ}'), segs: [
            { jp: '{係|かかり} の {者|もの} は 、', bad: true, options: [o('{係|かかり} の {者|もの} {以外|いがい} は 、', 'anyone other than the staff', true), o('{関係者|かんけいしゃ} {以外|いがい} は 、', 'anyone not authorised', true, 'Also right: the usual wording on such doors.'), o('{係|かかり} の {者|もの} も 、', 'the staff too', false, 'That shuts out the staff as well as everyone else.'), o('{係|かかり} の {者|もの} は 、', 'the staff', false, 'That forbids exactly the people the rule lets in.')] },
            { jp: '{書庫|しょこ} に' },
            { jp: '{立|た}ち{入|い}らないで ください 。', style: 'A formal "please do not enter". The wording is fine; who it is addressed to is not.' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair whom the prohibition applies to.', '{誰|だれ} に {向|む}けた {禁止|きんし} か を {直|なお}しましょう 。') },
          consequence: T('The stacks are now closed to visitors — and open to the staff who keep them.', 'これ で 、 {書庫|しょこ} は {来館者|らいかんしゃ} に は {閉|と}じ 、 {係|かかり} に は {開|ひら}かれます 。'),
          explain: { en: '"Only staff may enter" becomes "everyone except staff: do not enter" — ～{以外|いがい}は…ないでください. Without {以外|いがい} the notice bans the staff instead.' },
          item: 'g:v_naide_kudasai',
        },
      },
    },

    // ---- P05 · two steps reversed --------------------------------------------------------------------------
    {
      id: 'P05', fn: 'steps', title: T('In what order?', 'どの {順番|じゅんばん} で'),
      gist: 'A list of steps, and why one must come before another.',
      tiers: {
        F: {
          purpose: T('A card by the well.', '{井戸|いど} の {横|よこ} の {札|ふだ} 。'),
          evidence: [{ k: 'steps', title: T('Why', 'わけ'), steps: [T('Boil the water first.', 'まず {水|みず} を わかす 。'), T('Then drink it.', 'それ から {飲|の}む 。')], note: T('The well water is not safe unless it is boiled.', 'わかさない と 、 {井戸|いど} の {水|みず} は あぶない 。') }],
          notice: { title: T('The card', '{札|ふだ}'), list: true, segs: [
            { jp: '{水|みず} を {飲|の}む 。', bad: true },
            { jp: '{水|みず} を わかす 。', bad: true },
          ] },
          repair: { kind: 'order', prompt: T('Put the steps in the right order.', '{正|ただ}しい {順番|じゅんばん} に {並|なら}べましょう 。'), tiles: ['{水|みず} を {飲|の}む 。', '{水|みず} を わかす 。'], answer: ['{水|みず} を わかす 。', '{水|みず} を {飲|の}む 。'] },
          consequence: T('The card now says to boil the water before drinking it.', 'これ で 、 {飲|の}む {前|まえ} に わかす と {書|か}いて あります 。'),
          explain: { en: 'Each step was fine on its own; their order was not. Boiling has to come first.' },
          item: 'v:沸かす',
        },
        E: {
          purpose: T('The steps for closing up the kiln at night.', '{夜|よる} 、 {窯|かま} を {閉|し}める {時|とき} の {手順|てじゅん} 。'),
          evidence: [{ k: 'note', title: T('Master Isao\'s warning', 'イサオ の {注意|ちゅうい}'), text: T('Hot ash can start a fire. Throw it out only once it is cold.', '{熱|あつ}い {灰|はい} は {火事|かじ} の もと 。 {冷|さ}めて から {捨|す}てる こと 。') }],
          notice: { title: T('Closing steps', '{閉|し}める {手順|てじゅん}'), list: true, segs: [
            { jp: '{火|ひ} を {消|け}す 。', ok: 'Right: the fire goes out first.' },
            { jp: '{灰|はい} を {捨|す}てる 。', bad: true },
            { jp: '{灰|はい} が {冷|さ}める まで {待|ま}つ 。', bad: true },
          ] },
          repair: { kind: 'order', prompt: T('Put the steps in a safe order.', '{安全|あんぜん} な {順番|じゅんばん} に {並|なら}べましょう 。'), tiles: ['{火|ひ} を {消|け}す 。', '{灰|はい} を {捨|す}てる 。', '{灰|はい} が {冷|さ}める まで {待|ま}つ 。'], answer: ['{火|ひ} を {消|け}す 。', '{灰|はい} が {冷|さ}める まで {待|ま}つ 。', '{灰|はい} を {捨|す}てる 。'] },
          consequence: T('The ash is now thrown out only after it has cooled.', 'これ で 、 {灰|はい} は {冷|さ}めて から {捨|す}てられます 。'),
          explain: { en: '～まで{待|ま}つ ("wait until…") has to come before the step it protects. The warning sets the order, not the wording.' },
          item: 'g:v_te_kara',
        },
        I: {
          purpose: T('Boarding steps posted at the ferry landing.', '{渡|わた}し{場|ば} に {貼|は}られた {乗|の}り{方|かた} の {手順|てじゅん} 。'),
          evidence: [{ k: 'note', title: T('The ferryman\'s note', '{船頭|せんどう} の {書|か}き{付|つ}け'), text: T('Tickets are sold only on the landing. None are sold on board.', '{切符|きっぷ} は {桟橋|さんばし} で だけ {売|う}る 。 {船|ふね} の {中|なか} で は {売|う}って いない 。') }],
          notice: { title: T('How to board', '{乗|の}り{方|かた}'), list: true, segs: [
            { jp: '{桟橋|さんばし} に {並|なら}ぶ 。' },
            { jp: '{船|ふね} に {乗|の}る 。', bad: true },
            { jp: '{切符|きっぷ} を {買|か}う 。', bad: true },
            { jp: '{席|せき} に {座|すわ}る 。' },
          ] },
          repair: { kind: 'order', prompt: T('Put the steps in an order that works.', '{実際|じっさい} に できる {順番|じゅんばん} に {並|なら}べましょう 。'), tiles: ['{桟橋|さんばし} に {並|なら}ぶ 。', '{船|ふね} に {乗|の}る 。', '{切符|きっぷ} を {買|か}う 。', '{席|せき} に {座|すわ}る 。'], answer: ['{桟橋|さんばし} に {並|なら}ぶ 。', '{切符|きっぷ} を {買|か}う 。', '{船|ふね} に {乗|の}る 。', '{席|せき} に {座|すわ}る 。'], alts: [['{切符|きっぷ} を {買|か}う 。', '{桟橋|さんばし} に {並|なら}ぶ 。', '{船|ふね} に {乗|の}る 。', '{席|せき} に {座|すわ}る 。']] },
          consequence: T('Passengers now buy their tickets on the landing, before boarding.', 'これ で 、 {乗客|じょうきゃく} は {乗|の}る {前|まえ} に {桟橋|さんばし} で {切符|きっぷ} を {買|か}えます 。'),
          explain: { en: 'The note makes buying a ticket depend on being on the landing. Queueing and buying can go either way round, so both orders are accepted.' },
          item: 'g:v_te_kara',
        },
        A: {
          purpose: T('Firing steps copied from the kiln\'s log.', '{窯|かま} の {日誌|にっし} から {写|うつ}した {窯焚|かまだ}き の {手順|てじゅん} 。'),
          evidence: [{ k: 'note', title: T('From the margin of the log', '{日誌|にっし} の {余白|よはく} より'), text: T('Close the vent only once the fire has spread through. Close it early and the fire dies.', '{通風口|つうふうこう} を {閉|と}じる の は 、 {火|ひ} が {回|まわ}って から 。 {先|さき} に {閉|と}じれば 、 {火|ひ} は {消|き}える 。') }],
          notice: { title: T('Firing steps', '{窯焚|かまだ}き の {手順|てじゅん}'), list: true, segs: [
            { jp: '{薪|まき} を {組|く}む 。' },
            { jp: '{火|ひ} を {入|い}れる 。' },
            { jp: '{通風口|つうふうこう} を {半分|はんぶん} {閉|と}じる 。', bad: true },
            { jp: '{火|ひ} が {奥|おく} まで {回|まわ}る の を {待|ま}つ 。', bad: true },
          ] },
          repair: { kind: 'order', prompt: T('Restore the order the margin requires.', '{余白|よはく} の {注意|ちゅうい} に {合|あ}う {順|じゅん} に {戻|もど}しましょう 。'), tiles: ['{薪|まき} を {組|く}む 。', '{火|ひ} を {入|い}れる 。', '{通風口|つうふうこう} を {半分|はんぶん} {閉|と}じる 。', '{火|ひ} が {奥|おく} まで {回|まわ}る の を {待|ま}つ 。'], answer: ['{薪|まき} を {組|く}む 。', '{火|ひ} を {入|い}れる 。', '{火|ひ} が {奥|おく} まで {回|まわ}る の を {待|ま}つ 。', '{通風口|つうふうこう} を {半分|はんぶん} {閉|と}じる 。'] },
          consequence: T('The vent is now closed only after the fire has spread, so the firing no longer smothers itself.', 'これ で 、 {通風口|つうふうこう} は {火|ひ} が {回|まわ}って から {閉|と}じられ 、 {火|ひ} が {消|き}えなく なります 。'),
          explain: { en: '～てから in the margin ({火|ひ}が{回|まわ}ってから) sets a dependency the list had broken. Every line was well written; two of them were in the wrong place.' },
          item: 'g:v_te_kara',
        },
      },
    },

    // ---- P06 · before/after relation reversed ---------------------------------------------------------------
    {
      id: 'P06', fn: 'before-after', title: T('Before, or after?', '{前|まえ} か 、 {後|あと} か'),
      gist: 'A notice and a simple diagram of what comes first.',
      tiers: {
        F: {
          purpose: T('A note on Mio\'s medicine packet.', 'ミオ の {薬|くすり} の ふくろ の メモ 。'),
          evidence: [{ k: 'seq', title: T('When to take it', 'のむ とき'), steps: [T('meal', 'ごはん'), T('medicine', '{薬|くすり}')], alt: 'First the meal, then the medicine.' }],
          notice: { title: T('The note', 'メモ'), segs: [
            { jp: 'ごはん の' },
            { jp: '{前|まえ}', bad: true, options: [o('{後|あと}', 'after', true), o('{前|まえ}', 'before', false, 'The diagram puts the meal first.'), o('{中|なか}', 'during', false, 'The diagram shows one after the other.')] },
            { jp: 'に 、 {薬|くすり} を {飲|の}みます 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Before or after the meal?', 'ごはん の {前|まえ} ？ {後|あと} ？') },
          consequence: T('The note now says to take the medicine after the meal.', 'これ で 、 ごはん の {後|あと} に {飲|の}む と {分|わ}かります 。'),
          explain: { en: '～の{前|まえ}に is "before…", ～の{後|あと}に is "after…". The diagram has the meal first.' },
          item: 'g:mae_ato',
        },
        E: {
          purpose: T('The timetable board at the ferry landing.', '{渡|わた}し{場|ば} の {時刻|じこく} の {板|いた} 。'),
          evidence: [{ k: 'seq', title: T('Noon at the landing', '{渡|わた}し{場|ば} の お{昼|ひる}'), steps: [T('the noon bell', 'お{昼|ひる} の {鐘|かね}'), T('the ferry leaves', '{渡|わた}し{船|ぶね} が {出|で}る')], alt: 'First the noon bell rings, then the ferry leaves.' }],
          notice: { title: T('The board', '{板|いた}'), segs: [
            { jp: '{渡|わた}し{船|ぶね} は 、' },
            { jp: 'お{昼|ひる} の {鐘|かね} の', ok: 'Right: the bell is the moment that matters.' },
            { jp: '{前|まえ} に', bad: true, options: [o('{後|あと} に', 'after', true), o('{後|あと} で', 'after', true, 'Also right.'), o('{前|まえ} に', 'before', false, 'The diagram has the bell first.'), o('{間|あいだ} に', 'during', false, 'The ferry leaves once the bell has rung.')] },
            { jp: '{出|で}ます 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair when the ferry leaves.', '{船|ふね} の {出|で}る {時|とき} を {直|なお}しましょう 。') },
          consequence: T('Passengers now know the ferry leaves after the noon bell, not before it.', 'これ で 、 {船|ふね} は {鐘|かね} の {後|あと} に {出|で}る と {分|わ}かります 。'),
          explain: { en: '{後|あと}に and {後|あと}で both say "after" here. {前|まえ}に would send passengers away before the boat is ready.' },
          item: 'g:mae_ato',
        },
        I: {
          purpose: T('A notice at the foot of the old bridge.', '{古|ふる}い {橋|はし} の たもと の {張|は}り{紙|がみ} 。'),
          evidence: [{ k: 'seq', title: T('An evening at the bridge', '{橋|はし} の {夕方|ゆうがた}'), steps: [T('cross the bridge', '{橋|はし} を {渡|わた}る'), T('sunset', '{日暮|ひぐ}れ'), T('the bridge lanterns go out', '{橋|はし} の {灯|あか}り が {消|き}える')], alt: 'Cross the bridge; then the sun sets; then the bridge lanterns go out.' }],
          notice: { title: T('The notice', '{張|は}り{紙|がみ}'), segs: [
            { jp: '{日暮|ひぐ}れ の' },
            { jp: '{後|あと} に', bad: true, options: [o('{前|まえ} に', 'before', true), o('まで に', 'by', true, 'Also right: "by sunset".'), o('{後|あと} に', 'after', false, 'After sunset the lanterns are out.'), o('{間|あいだ} に', 'during', false, 'Sunset is a moment, and the crossing must come before it.')] },
            { jp: '{橋|はし} を {渡|わた}って ください 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the time words.', '{時|とき} を {表|あらわ}す {言葉|ことば} を {直|なお}しましょう 。') },
          consequence: T('Travellers are now told to cross while the bridge is still lit.', 'これ で 、 {灯|あか}り が ある うち に {渡|わた}る よう {伝|つた}わります 。'),
          explain: { en: '～の{前|まえ}に ("before…") and ～までに ("by…") both put the crossing before sunset. {後|あと}に would send people out onto a dark bridge.' },
          item: 'g:mae_ato',
        },
        A: {
          purpose: T('A notice inviting comments on the council\'s decision.', '{議会|ぎかい} の {決定|けってい} に {意見|いけん} を {求|もと}める {掲示|けいじ} 。'),
          evidence: [{ k: 'seq', title: T('The council\'s calendar', '{議会|ぎかい} の {予定|よてい}'), steps: [T('day 1: the meeting', '{一日目|いちにちめ} ： {会議|かいぎ}'), T('days 2–4: comments accepted', '{二日目|ふつかめ} 〜 {四日目|よっかめ} ： {意見|いけん} を {受|う}け{付|つ}ける'), T('day 5: decision', '{五日目|いつかめ} ： {決定|けってい}')], alt: 'Day 1 the meeting; days 2 to 4 comments are accepted; day 5 the decision.' }],
          notice: { title: T('Notice', '{掲示|けいじ}'), segs: [
            { jp: 'ご{意見|いけん} は 、' },
            { jp: '{会議|かいぎ} の' },
            { jp: '{三日前|みっかまえ}', bad: true, options: [o('{三日後|みっかご}', 'three days after', true), o('{三日|みっか} {後|ご}', 'three days after', true), o('{三日前|みっかまえ}', 'three days before', false, 'Before the meeting no one has heard what was discussed; the calendar takes comments after it.'), o('{当日|とうじつ}', 'the same day', false, 'Comments run for three days after the meeting.')] },
            { jp: 'まで に お{寄|よ}せ ください 。', style: 'A formal "please send by". The wording suits a notice.' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the deadline.', '{締|し}め{切|き}り を {直|なお}しましょう 。') },
          consequence: T('Comments are now invited for three days after the meeting — not cut off before anyone has heard it.', 'これ で 、 {会議|かいぎ} の {後|あと} {三日間|みっかかん} 、 {意見|いけん} を {出|だ}せる よう に なります 。'),
          explain: { en: '{三日前|みっかまえ} ("three days before") and {三日後|みっかご} ("three days after") differ in one character and reverse the whole process.' },
          item: 'g:mae_ato',
        },
      },
    },

    // ---- P07 · a label on the wrong item ----------------------------------------------------------------------
    {
      id: 'P07', fn: 'label', title: T('Which one is which?', 'どれ が どれ'),
      gist: 'Two objects, their descriptions, and a label that names the wrong one.',
      tiers: {
        F: {
          purpose: T('Labels on two jars in Fusa\'s kitchen.', 'フサ の {台所|だいどころ} の びん {二|ふた}つ の {札|ふだ} 。'),
          evidence: [{ k: 'objects', title: T('The two jars', 'びん {二|ふた}つ'), items: [{ shape: 'round', name: T('round jar', 'まるい びん'), desc: T('white, salty', 'しろくて 、 しょっぱい') }, { shape: 'square', name: T('square jar', 'しかくい びん'), desc: T('brown, sweet', 'ちゃいろくて 、 あまい') }] }],
          notice: { title: T('Label on the round jar', 'まるい びん の {札|ふだ}'), segs: [
            { jp: 'さとう', bad: true, options: [o('しお', 'salt', true), o('さとう', 'sugar', false, 'The round jar is the salty one.'), o('こめ', 'rice', false, 'Neither jar holds rice.')] },
          ] },
          repair: { kind: 'replace', prompt: T('What is in the round jar?', 'まるい びん の {中|なか} は ？') },
          consequence: T('The round jar is now labelled salt.', 'これ で 、 まるい びん は 「 しお 」 に なりました 。'),
          explain: { en: 'しょっぱい is "salty", あまい is "sweet". The label belonged on the other jar.' },
          item: 'v:塩',
        },
        E: {
          purpose: T('Tags on the two keys Tamotsu keeps.', 'タモツ の {持|も}って いる {鍵|かぎ} {二本|にほん} の {札|ふだ} 。'),
          evidence: [{ k: 'objects', title: T('The two keys', '{鍵|かぎ} {二本|にほん}'), items: [{ shape: 'long', name: T('long key', '{長|なが}い {鍵|かぎ}'), desc: T('opens the storehouse', '{倉|くら} の {鍵|かぎ}') }, { shape: 'short', name: T('short key', '{短|みじか}い {鍵|かぎ}'), desc: T('opens the water gate', '{水門|すいもん} の {鍵|かぎ}') }] }],
          notice: { title: T('Tag on the short key', '{短|みじか}い {鍵|かぎ} の {札|ふだ}'), segs: [
            { jp: '{倉|くら}', bad: true, options: [o('{水門|すいもん}', 'water gate', true), o('{倉|くら}', 'storehouse', false, 'The storehouse key is the long one.'), o('{家|いえ}', 'house', false, 'Neither key is for a house.')] },
            { jp: 'の {鍵|かぎ}' },
          ] },
          repair: { kind: 'replace', prompt: T('What does the short key open?', '{短|みじか}い {鍵|かぎ} で {何|なに} が {開|あ}く ？') },
          consequence: T('The short key is now tagged for the water gate.', 'これ で 、 {短|みじか}い {鍵|かぎ} に 「 {水門|すいもん} 」 と {書|か}かれました 。'),
          explain: { en: 'The tag said {倉|くら} (storehouse), which is the long key\'s job. The fix is in what it names, not how.' },
          item: 'v:水門',
        },
        I: {
          purpose: T('Labels on two of Mio\'s medicine bottles.', 'ミオ の {薬|くすり} の {瓶|びん} {二本|にほん} の ラベル 。'),
          evidence: [{ k: 'objects', title: T('The two bottles', '{瓶|びん} {二本|にほん}'), items: [{ shape: 'cap', name: T('bottle with a cap', '{蓋|ふた} の {瓶|びん}'), desc: T('for coughs; with warm water', '{咳|せき} の {薬|くすり} 。 {白湯|さゆ} で {飲|の}む') }, { shape: 'cork', name: T('bottle with a cork', 'コルク の {瓶|びん}'), desc: T('for the stomach; after meals', 'お{腹|なか} の {薬|くすり} 。 {食後|しょくご} に {飲|の}む') }] }],
          notice: { title: T('Label on the corked bottle', 'コルク の {瓶|びん} の ラベル'), segs: [
            { jp: '{咳|せき}', bad: true, options: [o('お{腹|なか}', 'stomach', true), o('おなか', 'stomach', true, 'Also right, in kana.'), o('{咳|せき}', 'cough', false, 'The cough medicine is the one with the cap.'), o('{頭|あたま}', 'head', false, 'Neither bottle is for headaches.')] },
            { jp: 'の {薬|くすり} 。' },
            { jp: '{食後|しょくご} に {飲|の}む 。', ok: 'Right: the corked bottle is taken after meals.' },
          ] },
          repair: { kind: 'replace', prompt: T('What is the corked bottle for?', 'コルク の {瓶|びん} は {何|なん} の {薬|くすり} ？') },
          consequence: T('The corked bottle is now labelled as the stomach medicine it is.', 'これ で 、 コルク の {瓶|びん} は {正|ただ}しく お{腹|なか} の {薬|くすり} に なりました 。'),
          explain: { en: 'Half the label (taken after meals) fitted the corked bottle; the other half described the capped one. A label must name one thing throughout.' },
          item: 'v:薬',
        },
        A: {
          purpose: T('Captions on two charts of the causeway at Shiori\'s hut.', 'シオリ の {小屋|こや} に ある 、 {岬|みさき} の {道|みち} の {図|ず} {二枚|にまい} の {説明|せつめい} 。'),
          evidence: [{ k: 'objects', title: T('The two charts', '{図|ず} {二枚|にまい}'), items: [{ shape: 'path', name: T('chart A', '{図|ず} A'), desc: T('the causeway drawn as a path across the sand', '{砂|すな} の {上|うえ} に {道|みち} が {描|か}いて ある') }, { shape: 'nopath', name: T('chart B', '{図|ず} B'), desc: T('only water where the causeway runs', '{道|みち} の ところ が {全部|ぜんぶ} {水|みず}') }] }],
          notice: { title: T('Caption under chart A', '{図|ず} A の {説明|せつめい}'), segs: [
            { jp: '{満潮時|まんちょうじ}', bad: true, options: [o('{干潮時|かんちょうじ}', 'at low tide', true), o('{引|ひ}き{潮|しお} の {時|とき}', 'when the tide is out', true, 'Also right, in plainer words.'), o('{満潮時|まんちょうじ}', 'at high tide', false, 'At high tide the causeway is under water, as chart B shows.'), o('{満|み}ち{潮|しお} の {時|とき}', 'when the tide comes in', false, 'That describes chart B, not A.')] },
            { jp: 'の {図|ず} 。' },
            { jp: '{渡|わた}れる {道|みち} が {描|か}いて ある 。', ok: 'Right: chart A shows the path.' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the caption.', '{説明|せつめい} を {直|なお}しましょう 。') },
          consequence: T('Chart A is now captioned as the low-tide chart, matching the path it shows.', 'これ で 、 {道|みち} の {描|か}かれた {図|ず} A は {干潮|かんちょう} の {図|ず} と {分|わ}かります 。'),
          explain: { en: '{満潮|まんちょう} is high tide and {干潮|かんちょう} is low tide. The caption\'s second sentence (a path you can cross) only fits low tide.' },
          item: 'v:干潮',
        },
      },
    },

    // ---- P08 · date/day transcription -------------------------------------------------------------------------
    {
      id: 'P08', fn: 'date', title: T('Which day?', '{何日|なんにち} ？'),
      gist: 'A notice copied from a small schedule — with one day wrong.',
      tiers: {
        F: {
          purpose: T('A note for the inn\'s door: market day.', '{宿|やど} の {戸|と} の メモ ： {市|いち} の {日|ひ} 。'),
          evidence: [{ k: 'table', title: T('Market schedule', '{市|いち} の {予定|よてい}'), head: [T('what', 'なに'), T('day', '{日|ひ}')], rows: [[T('market', '{市|いち}'), T('Thursday', '{木曜日|もくようび}')]] }],
          notice: { title: T('The note', 'メモ'), segs: [
            { jp: '{市|いち} は' },
            { jp: '{水曜日|すいようび}', bad: true, options: [o('{木曜日|もくようび}', 'Thursday', true), o('{水曜日|すいようび}', 'Wednesday', false, 'The schedule says Thursday.'), o('{金曜日|きんようび}', 'Friday', false, 'The schedule says Thursday.')] },
            { jp: 'です 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Which day is the market?', '{市|いち} は {何曜日|なんようび} ？') },
          consequence: T('The note now gives Thursday, as the schedule does.', 'これ で 、 {予定|よてい} の とおり {木曜日|もくようび} に なりました 。'),
          explain: { en: '{水曜日|すいようび} (Wednesday) and {木曜日|もくようび} (Thursday) are easy to swap when copying. Check every day against the schedule.' },
          item: 'v:木曜日',
        },
        E: {
          purpose: T('A board at the landing listing the ferry days.', '{渡|わた}し{船|ぶね} の {日|ひ} を {書|か}いた {渡|わた}し{場|ば} の {板|いた} 。'),
          evidence: [{ k: 'table', title: T('Ferry schedule', '{渡|わた}し{船|ぶね} の {予定|よてい}'), head: [T('day', '{曜日|ようび}'), T('ferry', '{船|ふね}')], rows: [[T('Mon', '{月|げつ}'), T('runs', '{出|で}る')], [T('Wed', '{水|すい}'), T('runs', '{出|で}る')], [T('Fri', '{金|きん}'), T('runs', '{出|で}る')], [T('other days', 'ほか の {日|ひ}'), T('no ferry', '{出|で}ない')]] }],
          notice: { title: T('The board', '{板|いた}'), segs: [
            { jp: '{渡|わた}し{船|ぶね} は' },
            { jp: '{月曜日|げつようび} 、 {水曜日|すいようび} 、', ok: 'Right: Monday and Wednesday both run.' },
            { jp: '{土曜日|どようび}', bad: true, options: [o('{金曜日|きんようび}', 'Friday', true), o('{土曜日|どようび}', 'Saturday', false, 'No ferry runs on Saturday.'), o('{日曜日|にちようび}', 'Sunday', false, 'The schedule\'s third day is Friday.')] },
            { jp: 'に {出|で}ます 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the third day.', '{三|みっ}つ {目|め} の {日|ひ} を {直|なお}しましょう 。') },
          consequence: T('No one will now wait on Saturday for a ferry that only runs on Friday.', 'これ で 、 {出|で}ない {土曜日|どようび} に {船|ふね} を {待|ま}つ {人|ひと} は いなく なります 。'),
          explain: { en: 'The schedule\'s days are {月|げつ}・{水|すい}・{金|きん}. Copying {金|きん} as {土|ど} sends people on the wrong day.' },
          item: 'v:金曜日',
        },
        I: {
          purpose: T('This month\'s market notice in the square.', '{広場|ひろば} の {今月|こんげつ} の {市|いち} の お{知|し}らせ 。'),
          evidence: [{ k: 'table', title: T('Market days this month', '{今月|こんげつ} の {市|いち} の {日|ひ}'), head: [T('market', '{市|いち}'), T('date', '{日付|ひづけ}')], rows: [[T('first', '{一回目|いっかいめ}'), T('the 5th', '{五日|いつか}')], [T('second', '{二回目|にかいめ}'), T('the 25th', '{二十五日|にじゅうごにち}')]] }],
          notice: { title: T('Notice', 'お{知|し}らせ'), segs: [
            { jp: '{今月|こんげつ} の {市|いち} は 、' },
            { jp: '{五日|いつか} と', ok: 'Right: the first market is on the 5th.' },
            { jp: '{十五日|じゅうごにち}', bad: true, options: [o('{二十五日|にじゅうごにち}', 'the 25th', true), o('{十五日|じゅうごにち}', 'the 15th', false, 'The second market is on the 25th.'), o('{二十日|はつか}', 'the 20th', false, 'The schedule says the 25th.')] },
            { jp: 'です 。' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the second date.', '{二|ふた}つ {目|め} の {日付|ひづけ} を {直|なお}しましょう 。') },
          consequence: T('The second market is now announced for the 25th, the day it is held.', 'これ で 、 {二回目|にかいめ} の {市|いち} は {正|ただ}しく {二十五日|にじゅうごにち} に なりました 。'),
          explain: { en: '{十五日|じゅうごにち} and {二十五日|にじゅうごにち} differ by one character. {二十日|はつか} (the 20th) has its own special reading.' },
          item: 'g:counters',
        },
        A: {
          purpose: T('The notice for the monthly reading of the new chronicle.', '{新|あたら}しい {年代記|ねんだいき} を {読|よ}む {月例|げつれい} の {会|かい} の {告知|こくち} 。'),
          evidence: [{ k: 'table', title: T('The Chronicle Hall\'s calendar', '{記録堂|きろくどう} の {予定表|よていひょう}'), head: [T('event', '{行事|ぎょうじ}'), T('when', '{日時|にちじ}')], rows: [[T('chronicle reading', '{読|よ}む {会|かい}'), T('every month, 2nd Saturday', '{毎月|まいつき} {第二|だいに} {土曜日|どようび}')], [T('hall closed', '{休館|きゅうかん}'), T('every month, 3rd Saturday', '{毎月|まいつき} {第三|だいさん} {土曜日|どようび}')]] }],
          notice: { title: T('Notice', '{告知|こくち}'), segs: [
            { jp: '{年代記|ねんだいき} を {読|よ}む {会|かい} は 、' },
            { jp: '{毎月|まいつき}' },
            { jp: '{第三|だいさん}', bad: true, options: [o('{第二|だいに}', 'second', true), o('{第三|だいさん}', 'third', false, 'The third Saturday is when the hall is closed.'), o('{第一|だいいち}', 'first', false, 'The calendar says the second Saturday.')] },
            { jp: '{土曜日|どようび} に' },
            { jp: '{開|ひら}きます 。', style: '{開|ひら}きます and {開催|かいさい}します are both fine here; the wording is not the problem.' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the week.', '{何週目|なんしゅうめ} か を {直|なお}しましょう 。') },
          consequence: T('Readers will now come on the second Saturday — not on the day the hall is shut.', 'これ で 、 {休館|きゅうかん} の {日|ひ} で は なく 、 {第二|だいに} {土曜日|どようび} に {人|ひと} が {集|あつ}まります 。'),
          explain: { en: '{第二|だいに}{土曜日|どようび} is "the second Saturday". The wrong copy fell on the hall\'s closing day — a worse error than a typo.' },
          item: 'g:counters',
        },
      },
    },

    // ---- P09 · a formal notice too vague for its purpose -------------------------------------------------------
    {
      id: 'P09', fn: 'vague', title: T('Clear enough?', 'これ で {伝|つた}わる ？'),
      gist: 'A correct but vague notice, and what its readers actually need to do.',
      tiers: {
        F: {
          purpose: T('For ferry passengers: wait on the pier until your name is called.', '{船|ふね} の お{客|きゃく} へ ： {名前|なまえ} を よばれる まで 、 {桟橋|さんばし} で まつ 。'),
          evidence: [{ k: 'note', title: T('What the ferryman needs', '{船頭|せんどう} の {頼|たの}み'), text: T('Passengers must wait on the pier until called.', 'お{客|きゃく} は 、 よばれる まで {桟橋|さんばし} で まって ほしい 。') }],
          notice: { title: T('The sign', '{案内|あんない}'), segs: [{ jp: 'まって ください 。' }] },
          find: { prompt: T('What does the sign leave out?', 'この {案内|あんない} に は 、 {何|なに} が {足|た}りない ？'), options: [
            { en: 'Where to wait, and until when', jp: 'どこ で 、 いつ まで', ok: true },
            { en: 'Nothing: it is clear', jp: '{何|なに} も {足|た}りない もの は ない', ok: false, why: { en: 'Passengers could wait anywhere, for ever. The ferryman needs the pier and "until called".' } },
            { en: 'The ferry\'s name', jp: '{船|ふね} の {名前|なまえ}', ok: false, why: { en: 'Passengers don\'t need the boat\'s name to wait in the right place.' } },
          ] },
          repair: { kind: 'choose', prompt: T('Which sign does the job?', 'どの {案内|あんない} が いい ？'), options: [
            o('よばれる まで 、 {桟橋|さんばし} で まって ください 。', 'Please wait on the pier until you are called.', true),
            o('{桟橋|さんばし} で 、 よばれる まで まって ください 。', 'On the pier, please wait until you are called.', true, 'Also right: same information, other order.'),
            o('すこし まって ください 。', 'Please wait a little.', false, 'Still no place, and "a little" isn\'t "until called".'),
            o('{船|ふね} に のって ください 。', 'Please board the ferry.', false, 'That is the opposite of waiting.'),
          ] },
          consequence: T('Passengers now know where to wait, and for how long.', 'これ で 、 どこ で いつ まで まつ か 、 {分|わ}かります 。'),
          explain: { en: 'まってください was correct Japanese but said too little for its purpose. A notice is right when its readers can act on it.' },
          item: 'v:桟橋',
        },
        E: {
          purpose: T('For visitors to the Records Hall with a request.', '{記録館|きろくかん} に {頼|たの}み が ある {人|ひと} へ 。'),
          evidence: [{ k: 'note', title: T('How requests work', '{頼|たの}み の {流|なが}れ'), text: T('Take a number at the counter, then wait in the corridor until it is called.', '{受付|うけつけ} で {番号|ばんごう} を {取|と}り 、 {呼|よ}ばれる まで {廊下|ろうか} で {待|ま}つ 。') }],
          notice: { title: T('The sign', '{案内|あんない}'), segs: [{ jp: '{番号|ばんごう} を {取|と}って 、 お{待|ま}ち ください 。' }] },
          find: { prompt: T('What is missing for a visitor?', '{来|き}た {人|ひと} に は 、 {何|なに} が {足|た}りない ？'), options: [
            { en: 'Where to take the number, and where to wait', jp: 'どこ で {取|と}って 、 どこ で {待|ま}つ か', ok: true },
            { en: 'The opening hours', jp: '{開|あ}いて いる {時間|じかん}', ok: false, why: { en: 'Useful elsewhere, but the sign\'s job is the request procedure: the counter and the corridor.' } },
            { en: 'Nothing', jp: '{何|なに} も ない', ok: false, why: { en: 'A visitor wouldn\'t know where the numbers are, or where to wait.' } },
          ] },
          repair: { kind: 'choose', prompt: T('Which sign does the job?', 'どの {案内|あんない} が いい ？'), options: [
            o('{受付|うけつけ} で {番号|ばんごう} を {取|と}り 、 {廊下|ろうか} で お{待|ま}ち ください 。', 'Take a number at the counter and wait in the corridor.', true),
            o('{番号|ばんごう} は {受付|うけつけ} に あります 。 {呼|よ}ばれる まで {廊下|ろうか} で お{待|ま}ち ください 。', 'Numbers are at the counter. Please wait in the corridor until called.', true, 'Also right, and it adds "until called".'),
            o('{番号|ばんごう} を {取|と}って 、 {少|すこ}し お{待|ま}ち ください 。', 'Take a number and wait a little.', false, 'Still no counter and no corridor.'),
            o('{廊下|ろうか} で お{待|ま}ち ください 。', 'Please wait in the corridor.', false, 'Now the number has gone missing.'),
          ] },
          consequence: T('Visitors now know where to get a number and where to wait.', 'これ で 、 {番号|ばんごう} を {取|と}る {場所|ばしょ} も {待|ま}つ {場所|ばしょ} も {分|わ}かります 。'),
          explain: { en: 'Nothing in the old sign was wrong; it was too vague for its readers. Adding で (where) to each action makes it usable.' },
          item: 'g:prt_de',
        },
        I: {
          purpose: T('For ferry passengers carrying luggage.', '{荷物|にもつ} を {持|も}った {船|ふね} の {客|きゃく} へ 。'),
          evidence: [{ k: 'note', title: T('The ferryman\'s rule', '{船頭|せんどう} の きまり'), text: T('Leave large luggage at the shed before boarding; collect it at the shed on the other side.', '{大|おお}きな {荷物|にもつ} は {乗|の}る {前|まえ} に {小屋|こや} に {預|あず}け 、 {向|む}こう {岸|ぎし} の {小屋|こや} で {受|う}け{取|と}る 。') }],
          notice: { title: T('Notice', 'お{知|し}らせ'), segs: [{ jp: 'お{荷物|にもつ} に ご{注意|ちゅうい} ください 。' }] },
          find: { prompt: T('Why doesn\'t this notice do its job?', 'この お{知|し}らせ は 、 なぜ {役|やく} に {立|た}たない ？'), options: [
            { en: 'It warns, but never says what to do with the luggage', jp: '{注意|ちゅうい} する だけ で 、 {荷物|にもつ} を どう する か {書|か}いて いない', ok: true },
            { en: 'It is too polite', jp: '{丁寧|ていねい} すぎる', ok: false, why: { en: 'The politeness is fine for a public notice. What it lacks is the action.' } },
            { en: 'It should be about tickets', jp: '{切符|きっぷ} の こと を {書|か}く べき', ok: false, why: { en: 'The ferryman\'s rule is about luggage.' } },
          ] },
          repair: { kind: 'choose', prompt: T('Which notice does the job?', 'どの お{知|し}らせ が いい ？'), options: [
            o('{大|おお}きな お{荷物|にもつ} は 、 {乗船|じょうせん} {前|まえ} に {小屋|こや} へ お{預|あず}け ください 。 {向|む}こう {岸|ぎし} の {小屋|こや} で お{返|かえ}し します 。', 'Leave large luggage at the shed before boarding; it is returned at the shed on the far bank.', true),
            o('{乗|の}る {前|まえ} に 、 {大|おお}きな {荷物|にもつ} を {小屋|こや} に {預|あず}けて ください 。 {向|む}こう {岸|ぎし} で {受|う}け{取|と}れます 。', 'Before boarding, leave big luggage at the shed. You can collect it on the far bank.', true, 'Also right, in plainer words.'),
            o('お{荷物|にもつ} から {目|め} を {離|はな}さないで ください 。', 'Don\'t take your eyes off your luggage.', false, 'More vivid, but it still doesn\'t say to leave it at the shed.'),
            o('{荷物|にもつ} を {持|も}って {乗|の}って ください 。', 'Please board with your luggage.', false, 'That contradicts the rule.'),
          ] },
          consequence: T('Passengers now leave their luggage at the shed and know where to get it back.', 'これ で 、 {客|きゃく} は {荷物|にもつ} を {預|あず}け 、 どこ で {受|う}け{取|と}る か {分|わ}かります 。'),
          explain: { en: 'ご{注意|ちゅうい}ください is a common formula, but here it names no action. Proofreading for purpose asks: can the reader do the right thing after reading?' },
          item: 'g:keigo_sonkei',
        },
        A: {
          purpose: T('For villagers who lent things to the festival.', '{祭|まつ}り に {品物|しなもの} を {貸|か}した {里|さと} の {人|ひと} へ 。'),
          evidence: [{ k: 'note', title: T('What the committee decided', '{係|かかり} の {決|き}めた こと'), text: T('Collect lent items at the meeting house by the 10th. After that, they are kept at the post house.', '{貸|か}して もらった {品|しな} は 、 {十日|とおか} まで に {集会所|しゅうかいじょ} で {返|かえ}す 。 {以後|いご} は {郵便所|ゆうびんじょ} で {預|あず}かる 。') }],
          notice: { title: T('Notice', 'お{知|し}らせ'), segs: [{ jp: 'お{貸|か}し いただいた {品|しな} に つきまして は 、 {後日|ごじつ} ご{連絡|れんらく} {申|もう}し{上|あ}げます 。' }] },
          find: { prompt: T('What does the notice fail to tell its readers?', 'この お{知|し}らせ に {欠|か}けて いる の は ？'), options: [
            { en: 'Where and by when to collect their things — and what happens after', jp: 'いつ まで に どこ で {受|う}け{取|と}る か 、 その {後|あと} どう なる か', ok: true },
            { en: 'An apology for the delay', jp: '{遅|おく}れ の お{詫|わ}び', ok: false, why: { en: 'There is no delay to apologise for. The readers need a place and a deadline.' } },
            { en: 'Nothing; "we will contact you" is enough', jp: '{何|なに} も ない', ok: false, why: { en: 'The decision is already made. Promising to "contact you later" withholds it.' } },
          ] },
          repair: { kind: 'choose', prompt: T('Which notice does the job?', 'どの お{知|し}らせ が いい ？'), options: [
            o('お{貸|か}し いただいた {品|しな} は 、 {十日|とおか} まで に {集会所|しゅうかいじょ} にて お{受|う}け{取|と}り ください 。 {以後|いご} は {郵便所|ゆうびんじょ} で お{預|あず}かり いたします 。', 'Please collect lent items at the meeting house by the 10th; after that they will be kept at the post house.', true),
            o('{十日|とおか} まで に 、 {集会所|しゅうかいじょ} で お{貸|か}し いただいた {品|しな} を お{返|かえ}し します 。 {十一日|じゅういちにち} {以降|いこう} は {郵便所|ゆうびんじょ} で お{受|う}け{取|と}り ください 。', 'We will return your items at the meeting house until the 10th; from the 11th collect them at the post house.', true, 'Also right: the same arrangement from the committee\'s side.'),
            o('お{貸|か}し いただいた {品|しな} に つきまして は 、 {近日中|きんじつちゅう} に ご{連絡|れんらく} いたします 。', 'We will contact you about your items shortly.', false, 'More urgent-sounding, but still no place or date.'),
            o('お{貸|か}し いただいた {品|しな} は 、 {郵便所|ゆうびんじょ} へ お{越|こ}し ください 。', 'Please come to the post house about your items.', false, 'Only after the 10th; before that they are at the meeting house.'),
          ] },
          consequence: T('Lenders now know where to collect their things, by when, and where they go afterwards.', 'これ で 、 {貸|か}した {人|ひと} は 、 どこ で いつ まで に {受|う}け{取|と}れる か 、 その {後|あと} どこ に ある か {分|わ}かります 。'),
          explain: { en: '{後日|ごじつ}ご{連絡|れんらく}{申|もう}し{上|あ}げます is impeccably polite and says nothing. When the decision exists, the notice should carry it.' },
          item: 'g:keigo_kenjo',
        },
      },
    },

    // ---- P10 · comparison reversed --------------------------------------------------------------------------------
    {
      id: 'P10', fn: 'comparison', title: T('Which is more?', 'どちら が {上|うえ} ？'),
      gist: 'A comparison, and the measurements that settle it.',
      tiers: {
        F: {
          purpose: T('A tag for Tokuji\'s two ropes.', 'トクジ の {縄|なわ} {二本|にほん} の {札|ふだ} 。'),
          evidence: [{ k: 'measure', title: T('The two ropes', '{縄|なわ} {二本|にほん}'), unit: T('m', 'メートル'), items: [{ name: T('red rope', 'あかい {縄|なわ}'), value: 5 }, { name: T('white rope', 'しろい {縄|なわ}'), value: 3 }], alt: 'The red rope is 5 metres; the white rope is 3 metres.' }],
          notice: { title: T('The tag', '{札|ふだ}'), segs: [
            { jp: 'しろい {縄|なわ} の {方|ほう} が', bad: true, options: [o('あかい {縄|なわ} の {方|ほう} が', 'the red rope', true), o('しろい {縄|なわ} の {方|ほう} が', 'the white rope', false, 'The white rope is the shorter one.')] },
            { jp: 'ながい です 。', bad: true, options: [o('みじかい です 。', 'is shorter', true), o('ながい です 。', 'is longer', false, 'Then the white rope would be longer — it isn\'t.')] },
          ] },
          repair: { kind: 'replace', prompt: T('Make the tag agree with the ropes.', '{縄|なわ} に {合|あ}う よう に {直|なお}しましょう 。') },
          consequence: T('The tag now agrees with the ropes.', 'これ で 、 {札|ふだ} と {縄|なわ} が {合|あ}います 。'),
          explain: { en: 'There are two ways to fix it: change which rope (あかい) or change the word (みじかい). Both are correct.' },
          item: 'g:comp_yori_hou',
        },
        E: {
          purpose: T('A sign at the crossroads: the nearer well.', '{分|わ}かれ{道|みち} の {案内|あんない} ： {近|ちか}い {方|ほう} の {井戸|いど} 。'),
          evidence: [{ k: 'measure', title: T('Distance from the crossroads', '{分|わ}かれ{道|みち} から の {距離|きょり}'), unit: T('m', 'メートル'), items: [{ name: T('east well', '{東|ひがし} の {井戸|いど}'), value: 200 }, { name: T('west well', '{西|にし} の {井戸|いど}'), value: 500 }], alt: 'The east well is 200 metres away; the west well is 500 metres away.' }],
          notice: { title: T('The sign', '{案内|あんない}'), segs: [
            { jp: '{西|にし} の {井戸|いど} の {方|ほう} が', bad: true, options: [o('{東|ひがし} の {井戸|いど} の {方|ほう} が', 'the east well', true), o('{西|にし} の {井戸|いど} の {方|ほう} が', 'the west well', false, 'The west well is the farther one.')] },
            { jp: '{近|ちか}い です 。', bad: true, options: [o('{遠|とお}い です 。', 'is farther', true), o('{近|ちか}い です 。', 'is nearer', false, 'Then the west well would be nearer — it isn\'t.')] },
          ] },
          repair: { kind: 'replace', prompt: T('Make the sign agree with the distances.', '{距離|きょり} に {合|あ}う よう に {直|なお}しましょう 。') },
          consequence: T('Thirsty travellers are now sent the shorter way.', 'これ で 、 {水|みず} を {求|もと}める {人|ひと} は {近|ちか}い {方|ほう} へ {行|い}けます 。'),
          explain: { en: 'In AのほうがB, the item before のほうが is the one that is more B. Swap the item or the adjective; either repair is right.' },
          item: 'g:comp_yori_hou',
        },
        I: {
          purpose: T('A note in the harbour register about two boats.', '{港|みなと} の {帳面|ちょうめん} の 、 {船|ふね} {二|に}{艘|そう} に ついて の {書|か}き{込|こ}み 。'),
          evidence: [{ k: 'measure', title: T('Length of the boats', '{船|ふね} の {長|なが}さ'), unit: T('m', 'メートル'), items: [{ name: T('the ferry', '{渡|わた}し{船|ぶね}'), value: 12 }, { name: T('Tokuji\'s boat', 'トクジ の {舟|ふね}'), value: 6 }], alt: 'The ferry is 12 metres long; Tokuji\'s boat is 6 metres.' }],
          notice: { title: T('Register note', '{帳面|ちょうめん} の {書|か}き{込|こ}み'), segs: [
            { jp: '{渡|わた}し{船|ぶね} は' },
            { jp: 'トクジ さん の {舟|ふね} より' },
            { jp: '{小|ちい}さい 。', bad: true, options: [o('{大|おお}きい 。', 'bigger', true), o('{長|なが}い 。', 'longer', true, 'Also right: the measure given is length.'), o('{小|ちい}さい 。', 'smaller', false, 'The ferry is twice as long.'), o('{同|おな}じ くらい だ 。', 'about the same', false, '12 metres and 6 metres are not the same.')] },
            { jp: '{倍|ばい} ほど ある 。', ok: 'Right: twelve is twice six — which only fits if the ferry is bigger.' },
          ] },
          repair: { kind: 'replace', prompt: T('Repair the comparison.', '{比|くら}べ{方|かた} を {直|なお}しましょう 。') },
          consequence: T('The register now records the ferry as the larger boat — twice the length.', 'これ で 、 {帳面|ちょうめん} に は {渡|わた}し{船|ぶね} の {方|ほう} が {倍|ばい} {大|おお}きい と {記録|きろく} されます 。'),
          explain: { en: 'AはBより{小|ちい}さい says A is smaller. The note\'s own {倍|ばい}ほどある ("about twice as much") already contradicted it.' },
          item: 'g:comp_yori_hou',
        },
        A: {
          purpose: T('Advice posted at the Lanternfall gate for travellers to the Archive.', '{灯落|ひおち} の {門|もん} に {貼|は}られた 、 {書庫|しょこ} へ {行|い}く {旅人|たびびと} へ の {助言|じょげん} 。'),
          evidence: [{ k: 'measure', title: T('Walking time to the Archive', '{書庫|しょこ} まで の {時間|じかん}'), unit: T('hours', '{時間|じかん}'), items: [{ name: T('the lantern road', '{灯|ひ} の {道|みち}'), value: 2 }, { name: T('the mountain path', '{山道|やまみち}'), value: 3 }], alt: 'The lantern road takes 2 hours; the mountain path takes 3 hours.' }],
          notice: { title: T('Advice', '{助言|じょげん}'), segs: [
            { jp: '{山道|やまみち} は' },
            { jp: '{灯|ひ} の {道|みち} ほど' },
            { jp: '{時間|じかん} が かからない 。' },
          ] },
          find: { prompt: T('What is wrong with the advice?', 'この {助言|じょげん} の どこ が {違|ちが}う ？'), options: [
            { en: 'It reverses which route is quicker', jp: 'どちら が {早|はや}い か が {逆|ぎゃく}', ok: true },
            { en: 'ほど cannot be used with a negative', jp: 'ほど は {否定|ひてい} と {使|つか}えない', ok: false, why: { en: 'Aほど…ない ("not as … as A") is correct grammar. The facts are what is reversed.' } },
            { en: 'Nothing; both routes reach the Archive', jp: '{何|なに} も ない', ok: false, why: { en: 'Both arrive, but the mountain path takes an hour longer.' } },
          ] },
          repair: { kind: 'choose', prompt: T('Which advice agrees with the times?', '{時間|じかん} に {合|あ}う {助言|じょげん} は どれ ？'), options: [
            o('{灯|ひ} の {道|みち} は {山道|やまみち} ほど {時間|じかん} が かからない 。', 'The lantern road doesn\'t take as long as the mountain path.', true),
            o('{山道|やまみち} は {灯|ひ} の {道|みち} より {時間|じかん} が かかる 。', 'The mountain path takes longer than the lantern road.', true, 'Also right, put the other way round.'),
            o('{山道|やまみち} の {方|ほう} が {一時間|いちじかん} {早|はや}い 。', 'The mountain path is an hour quicker.', false, 'Still reversed — and now with a number.'),
            o('どちら も {同|おな}じ くらい {時間|じかん} が かかる 。', 'Both take about the same time.', false, 'Two hours and three hours are not the same.'),
          ] },
          consequence: T('Travellers are now advised that the lantern road is the quicker way.', 'これ で 、 {旅人|たびびと} は {灯|ひ} の {道|みち} の {方|ほう} が {早|はや}い と {分|わ}かります 。'),
          explain: { en: 'Aほど…ない means "not as … as A". Every word of the advice was grammatical; the two routes had swapped places.' },
          item: 'g:comp_yori_hou',
        },
      },
    },

    // ---- P11 · a condition dropped -----------------------------------------------------------------------------------
    {
      id: 'P11', fn: 'condition', title: T('Only when?', 'どんな {時|とき} だけ ？'),
      gist: 'An original instruction and a summary that lost its condition.',
      tiers: {
        F: {
          purpose: T('A short version of the path rule for the inn\'s board.', '{宿|やど} の {板|いた} に {書|か}く 、 {道|みち} の きまり を みじかく した もの 。'),
          evidence: [{ k: 'note', title: T('The original rule', 'もと の きまり'), text: T('On rainy days, please use the back path.', 'あめ の {日|ひ} は 、 {裏|うら} の {道|みち} を つかって ください 。') }],
          notice: { title: T('The short version', 'みじかく した もの'), segs: [{ jp: '{裏|うら} の {道|みち} を' }, { jp: 'つかって ください 。' }] },
          find: { prompt: T('What did the short version leave out?', 'みじかく した もの は 、 {何|なに} を {落|お}とした ？'), options: [
            { en: 'When: only on rainy days', jp: 'いつ か ： あめ の {日|ひ} だけ', ok: true },
            { en: 'Which path', jp: 'どの {道|みち} か', ok: false, why: { en: 'It still says the back path.' } },
            { en: 'Nothing', jp: '{何|なに} も ない', ok: false, why: { en: 'Without "on rainy days", it sends everyone round the back every day.' } },
          ] },
          repair: { kind: 'order', prompt: T('Put the condition back: arrange the pieces.', 'じょうけん を もどして 、 ならべましょう 。'), tiles: ['{裏|うら} の {道|みち} を', 'あめ の {日|ひ} は 、', 'つかって ください 。'], answer: ['あめ の {日|ひ} は 、', '{裏|うら} の {道|みち} を', 'つかって ください 。'] },
          consequence: T('The board now sends people round the back only when it rains.', 'これ で 、 あめ の {日|ひ} だけ {裏|うら} の {道|みち} を つかう と {分|わ}かります 。'),
          explain: { en: 'あめの{日|ひ}は ("on rainy days") limits the instruction. A summary can drop words, but not a condition.' },
          item: 'g:prt_wa',
        },
        E: {
          purpose: T('A summary of Tamotsu\'s rule for the water gate.', 'タモツ の {水門|すいもん} の きまり の まとめ 。'),
          evidence: [{ k: 'note', title: T('Tamotsu\'s rule', 'タモツ の きまり'), text: T('If it rains three days running, open the water gate halfway.', '{雨|あめ} が {三日|みっか} {続|つづ}いたら 、 {水門|すいもん} を {半分|はんぶん} {開|あ}けて ください 。') }],
          notice: { title: T('The summary', 'まとめ'), segs: [{ jp: '{水門|すいもん} を' }, { jp: '{半分|はんぶん} {開|あ}けて ください 。' }] },
          find: { prompt: T('What did the summary lose?', 'まとめ で {何|なに} が {消|き}えた ？'), options: [
            { en: 'The condition: after three days of rain', jp: '{条件|じょうけん} ： {雨|あめ} が {三日|みっか} {続|つづ}いたら', ok: true },
            { en: 'How far to open it', jp: 'どの くらい {開|あ}ける か', ok: false, why: { en: '"Halfway" is still there.' } },
            { en: 'Which gate', jp: 'どの {門|もん} か', ok: false, why: { en: 'There is one water gate, and the summary names it.' } },
          ] },
          repair: { kind: 'order', prompt: T('Arrange the pieces to restore the rule.', 'きまり に {戻|もど}る よう に {並|なら}べましょう 。'), tiles: ['{水門|すいもん} を', '{雨|あめ} が {三日|みっか} {続|つづ}いたら 、', '{半分|はんぶん} {開|あ}けて ください 。'], answer: ['{雨|あめ} が {三日|みっか} {続|つづ}いたら 、', '{水門|すいもん} を', '{半分|はんぶん} {開|あ}けて ください 。'] },
          consequence: T('The gate is now opened only after three days of rain, not on a dry afternoon.', 'これ で 、 {水門|すいもん} は {雨|あめ} が {三日|みっか} {続|つづ}いた {時|とき} だけ {開|あ}けられます 。'),
          explain: { en: '～たら ("if/when…") sets the condition. Without it the summary orders the gate opened at any time.' },
          item: 'g:cond_tara',
        },
        I: {
          purpose: T('The short label Mio stuck on a fever remedy.', 'ミオ が {熱|ねつ} の {薬|くすり} に {貼|は}った {短|みじか}い ラベル 。'),
          evidence: [{ k: 'note', title: T('Mio\'s instructions', 'ミオ の {説明|せつめい}'), text: T('Only when there is a fever: take this twice a day.', '{熱|ねつ} が ある {時|とき} だけ 、 この {薬|くすり} を {一日|いちにち} {二回|にかい} {飲|の}んで ください 。') }],
          notice: { title: T('The label', 'ラベル'), segs: [{ jp: 'この {薬|くすり} を' }, { jp: '{一日|いちにち} {二回|にかい}' }, { jp: '{飲|の}んで ください 。' }] },
          find: { prompt: T('What has the label dropped?', 'ラベル から {何|なに} が {抜|ぬ}けた ？'), options: [
            { en: 'Only when there is a fever', jp: '{熱|ねつ} が ある {時|とき} だけ', ok: true },
            { en: 'How many times a day', jp: '{一日|いちにち} {何回|なんかい} か', ok: false, why: { en: '"Twice a day" is still on the label.' } },
            { en: 'Nothing; it is just shorter', jp: '{何|なに} も ない', ok: false, why: { en: 'Shorter, and now it tells a healthy person to take a fever remedy every day.' } },
          ] },
          repair: { kind: 'order', prompt: T('Arrange the pieces to restore the condition.', '{条件|じょうけん} を {戻|もど}す よう に {並|なら}べましょう 。'), tiles: ['この {薬|くすり} を', '{熱|ねつ} が ある {時|とき} だけ 、', '{一日|いちにち} {二回|にかい}', '{飲|の}んで ください 。'], answer: ['{熱|ねつ} が ある {時|とき} だけ 、', 'この {薬|くすり} を', '{一日|いちにち} {二回|にかい}', '{飲|の}んで ください 。'], alts: [['この {薬|くすり} を', '{熱|ねつ} が ある {時|とき} だけ 、', '{一日|いちにち} {二回|にかい}', '{飲|の}んで ください 。']] },
          consequence: T('The label now limits the remedy to days with a fever.', 'これ で 、 {熱|ねつ} が ある {時|とき} だけ {飲|の}む {薬|くすり} だ と {分|わ}かります 。'),
          explain: { en: '～{時|とき}だけ ("only when…") is the condition. With medicine, a dropped condition is the most dangerous kind of error.' },
          item: 'g:toki',
        },
        A: {
          purpose: T('The harbour office\'s summary of Ōmi\'s ruling for the board.', '{港|みなと} の {掲示板|けいじばん} に {載|の}せる 、 オウミ の {決定|けってい} の {要約|ようやく} 。'),
          evidence: [{ k: 'note', title: T('Ōmi\'s ruling', 'オウミ の {決定|けってい}'), text: T('Night sailings are permitted, provided there is no fog.', '{霧|きり} が {出|で}て いない {限|かぎ}り 、 {夜|よる} の {出航|しゅっこう} を {認|みと}める 。') }],
          notice: { title: T('Summary for the board', '{掲示|けいじ} {用|よう} の {要約|ようやく}'), segs: [{ jp: '{夜|よる} の {出航|しゅっこう} を' }, { jp: '{認|みと}める 。' }] },
          find: { prompt: T('What has the summary lost?', '{要約|ようやく} で {失|うしな}われた の は ？'), options: [
            { en: 'The proviso: only while there is no fog', jp: '{但|ただ}し{書|が}き ： {霧|きり} が {出|で}て いない {限|かぎ}り', ok: true },
            { en: 'Who decided it', jp: '{誰|だれ} が {決|き}めた か', ok: false, why: { en: 'Useful, but the board\'s readers act on the rule. The missing proviso changes what the rule allows.' } },
            { en: 'Nothing; summaries leave out detail', jp: '{何|なに} も ない', ok: false, why: { en: 'A detail is optional; a condition is not. Without it, boats may sail into fog.' } },
          ] },
          repair: { kind: 'choose', prompt: T('Which summary keeps the ruling intact?', '{決定|けってい} を {損|そこ}なわない {要約|ようやく} は ？'), options: [
            o('{霧|きり} が ない {限|かぎ}り 、 {夜|よる} の {出航|しゅっこう} を {認|みと}める 。', 'Night sailings permitted, so long as there is no fog.', true),
            o('{夜|よる} の {出航|しゅっこう} は 、 {霧|きり} の ない {時|とき} に {限|かぎ}り {認|みと}める 。', 'Night sailings are permitted only when there is no fog.', true, 'Also right: the proviso moved, not lost.'),
            o('{霧|きり} の {夜|よる} も {出航|しゅっこう} を {認|みと}める 。', 'Sailing is permitted on foggy nights too.', false, 'That reverses the proviso.'),
            o('{夜|よる} の {出航|しゅっこう} は {禁止|きんし} 。', 'Night sailing is forbidden.', false, 'Over-correction: the ruling does permit night sailing.'),
          ] },
          consequence: T('The board now permits night sailing only while there is no fog.', 'これ で 、 {掲示板|けいじばん} は {霧|きり} の ない {夜|よる} だけ {出航|しゅっこう} を {認|みと}めます 。'),
          explain: { en: '～ない{限|かぎ}り ("as long as… not") and ～に{限|かぎ}り ("only when…") carry the proviso. Summarising may shorten wording, never conditions.' },
          item: 'g:cond_ba',
        },
      },
    },

    // ---- P12 · no repair is justified: ask for clarification ---------------------------------------------------------
    {
      id: 'P12', fn: 'insufficient', title: T('Can the tray settle it?', 'この {盆|ぼん} で {決|き}められる ？'),
      gist: 'A delivery slip filled in from a request that doesn\'t say enough.',
      tiers: {
        F: {
          purpose: T('A delivery slip written from Hana\'s request.', 'ハナ の {頼|たの}み から {書|か}いた {配達|はいたつ} の {紙|かみ} 。'),
          evidence: [{ k: 'note', title: T('Hana\'s request', 'ハナ の {頼|たの}み'), text: T('Please deliver the box tomorrow.', 'あした 、 はこ を とどけて ください 。') }],
          insufficient: true,
          notice: { title: T('The delivery slip', '{配達|はいたつ} の {紙|かみ}'), segs: [{ jp: 'あした 、' }, { jp: 'あおい はこ を' }, { jp: '{宿|やど} へ 。' }] },
          repair: { kind: 'ask', prompt: T('Write a question for Hana.', 'ハナ さん に {聞|き}きましょう 。'), replies: [
            ask('which', ['どの はこ です か 。'], 'Which box is it?'),
            ask('where', ['どこ に', 'とどけます か 。'], 'Where should I deliver it?'),
            nah(['あおい はこ を', '{宿|やど} へ とどけます 。'], 'I\'ll deliver the blue box to the inn.', 'That copies the slip\'s guesses back as facts.'),
          ] },
          consequence: T('No word was changed: the slip waits for Hana\'s answer instead of guessing.', '{何|なに} も {書|か}き{換|か}えず 、 ハナ さん の {答|こた}え を {待|ま}ちます 。'),
          explain: { en: 'The request says nothing about a blue box or the inn. Nothing contradicts the slip, and nothing confirms it — so the right move is to ask.' },
          item: 'g:qword_ka_mo',
        },
        E: {
          purpose: T('An order slip filled in from Ume\'s note.', 'ウメ の メモ から {書|か}いた {注文|ちゅうもん} の {紙|かみ} 。'),
          evidence: [{ k: 'note', title: T('Ume\'s note', 'ウメ の メモ'), text: T('Send the usual amount of rope up to the terraces.', 'いつも の {分|ぶん} の {縄|なわ} を 、 {段々畑|だんだんばたけ} へ {送|おく}って おくれ 。') }],
          insufficient: true,
          notice: { title: T('The order slip', '{注文|ちゅうもん} の {紙|かみ}'), segs: [{ jp: '{縄|なわ}' }, { jp: '{十本|じゅっぽん}' }, { jp: '{段々畑|だんだんばたけ} へ' }] },
          repair: { kind: 'ask', prompt: T('Ask Ume what you need to know.', '{知|し}りたい こと を ウメ さん に {聞|き}きましょう 。'), replies: [
            ask('polite', ['「 いつも の {分|ぶん} 」 は', '{何本|なんぼん} です か 。'], 'How many is "the usual amount"?'),
            ask('request', ['いつも の {本数|ほんすう} を', '{教|おし}えて ください 。'], 'Please tell me the usual number.'),
            ask('friendly', ['いつも の {分|ぶん} って', '{何本|なんぼん} ？'], 'How many is the usual?'),
            nah(['{十本|じゅっぽん} で', 'いい です ね 。'], 'Ten is right, isn\'t it?', 'This presents the slip\'s guess as settled and asks her only to agree.'),
            nah(['{縄|なわ} を', '{送|おく}ります 。'], 'I\'ll send the rope.', 'That skips the question you can\'t answer: how many.'),
          ] },
          consequence: T('The slip now waits for the number from Ume rather than a guess of ten.', '{十本|じゅっぽん} と {決|き}めつけず 、 ウメ さん に {本数|ほんすう} を {聞|き}きます 。'),
          explain: { en: '"The usual amount" points to something only Ume knows. The ten on the slip isn\'t wrong — it is unsupported, so it can\'t be confirmed either.' },
          item: 'g:counters',
        },
        I: {
          purpose: T('A ferry booking written from a message left with Shiori.', 'シオリ に {預|あず}けられた {伝言|でんごん} から {書|か}いた {渡|わた}し{船|ぶね} の {予約|よやく} 。'),
          evidence: [{ k: 'note', title: T('The message', '{伝言|でんごん}'), text: T('Two of us want to cross next week. Whichever day is fine.', '{来週|らいしゅう} 、 {二人|ふたり} で {渡|わた}りたい 。 {日|ひ} は いつ でも いい 。') }, { k: 'table', title: T('Ferry days next week', '{来週|らいしゅう} の {渡|わた}し{船|ぶね}'), head: [T('day', '{曜日|ようび}'), T('seats left', '{空|あ}き')], rows: [[T('Mon', '{月|げつ}'), T('2', '{二|ふた}つ')], [T('Wed', '{水|すい}'), T('2', '{二|ふた}つ')], [T('Fri', '{金|きん}'), T('5', '{五|いつ}つ')]] }],
          insufficient: true,
          notice: { title: T('The booking', '{予約|よやく}'), segs: [{ jp: '{月曜日|げつようび} の {船|ふね} 、' }, { jp: '{二人|ふたり} 。' }, { jp: '{名前|なまえ} ： ── 。' }] },
          repair: { kind: 'ask', prompt: T('Write a question back to the sender.', '{伝言|でんごん} の {主|ぬし} に {聞|き}きましょう 。'), replies: [
            ask('polite', ['どの {日|ひ} が', 'よろしい です か 。'], 'Which day would you like?'),
            ask('name', ['お{名前|なまえ} と {日|ひ} を', '{教|おし}えて ください 。'], 'Please tell me your name and the day.'),
            ask('both', ['お{名前|なまえ} は {何|なん} です か 。', '{日|ひ} は {何曜日|なんようび} に します か 。'], 'What is your name? Which day shall it be?', { fixed: true }),
            nah(['{月曜日|げつようび} で', '{予約|よやく} しました 。'], 'I\'ve booked Monday.', 'Nothing on the tray says Monday, and no one knows whose booking it is.'),
            nah(['{金曜日|きんようび} の {方|ほう} が', '{空|あ}いて います 。'], 'Friday has more seats.', 'True, but it doesn\'t ask what you need: who they are and which day.'),
          ] },
          consequence: T('No booking is made in a stranger\'s name; the question goes back to the sender.', '{誰|だれ} の {名前|なまえ} でも {予約|よやく} せず 、 {伝言|でんごん} の {主|ぬし} に {聞|き}き{返|かえ}します 。'),
          explain: { en: '"Any day is fine" makes Monday possible but not settled, and the message carries no name at all. The booking cannot be checked, only guessed.' },
          item: 'g:qword_ka_mo',
        },
        A: {
          purpose: T('A notice drafted from a councillor\'s brief instruction.', '{議員|ぎいん} の {短|みじか}い {指示|しじ} から {作|つく}った {掲示|けいじ} の {案|あん} 。'),
          evidence: [{ k: 'note', title: T('The instruction, as written', '{指示|しじ} の {原文|げんぶん}'), text: T('Put up a notice about the meeting. The usual place; the time as discussed.', '{会合|かいごう} の {掲示|けいじ} を {出|だ}す こと 。 {場所|ばしょ} は {例|れい} の ところ 、 {時刻|じこく} は {先日|せんじつ} {話|はな}した とおり 。') }],
          insufficient: true,
          notice: { title: T('The draft notice', '{掲示|けいじ} の {案|あん}'), segs: [{ jp: '{会合|かいごう} は' }, { jp: '{議会堂|ぎかいどう} にて 、' }, { jp: '{午後|ごご} {三時|さんじ} より {行|おこな}います 。' }] },
          repair: { kind: 'ask', prompt: T('Write the question that would let you finish the notice.', '{掲示|けいじ} を {仕上|しあ}げる ため の {質問|しつもん} を {書|か}きましょう 。'), replies: [
            ask('formal', ['「 {例|れい} の ところ 」 と {時刻|じこく} に つき 、', 'ご{確認|かくにん} いただけます でしょう か 。'], 'Could you confirm "the usual place" and the time?'),
            ask('polite', ['{場所|ばしょ} と {時刻|じこく} を', '{具体的|ぐたいてき} に {教|おし}えて ください 。'], 'Please tell me the place and time specifically.'),
            ask('place-first', ['{例|れい} の ところ は 、', 'どちら です か 。', '{時刻|じこく} も {教|おし}えて ください 。'], 'Where is "the usual place"? Please tell me the time too.', { fixed: true }),
            nah(['{議会堂|ぎかいどう} 、', '{午後|ごご} {三時|さんじ} で', '{間違|まちが}い ありません ね 。'], 'The Council Chamber, three o\'clock — that\'s right, isn\'t it?', 'This asks for a rubber stamp on guesses: nothing on the tray says either.'),
            nah(['{掲示|けいじ} を', '{出|だ}しました 。'], 'I\'ve put up the notice.', 'Publishing guessed details is worse than asking.'),
          ] },
          consequence: T('Nothing is published yet: the place and time go back to the councillor to be stated.', 'まだ {掲示|けいじ} せず 、 {場所|ばしょ} と {時刻|じこく} を {議員|ぎいん} に {確|たし}かめます 。'),
          explain: { en: '{例|れい}のところ and {先日|せんじつ}{話|はな}したとおり refer to knowledge you were never given. With no evidence either way, a proofreader asks — and changes nothing.' },
          item: 'g:keigo_kenjo',
        },
      },
    },
  ];
})(RB.content);
