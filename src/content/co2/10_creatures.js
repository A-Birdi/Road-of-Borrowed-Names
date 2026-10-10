/* Cinder Orchard in twelve-chapter journeys (Chapter 5 there; expansion P10; plan 03_ENCOUNTERS.md E23): three more
 * kinds of creature, met only in a twelve-chapter journey (`ed>=2` on their placements), and one changed-world line.
 *   co.shard  Glass-Shard Wisp, in the kiln: a Mirror (your words reflected back to front) and Heat.
 *   co.mole   Ash Mole, in the old works: a Gathering from below, then the ground heaves (Flood).
 *   co.imp    Persimmon Imp, on the upper terraces: Heat while it ripens, then a False promise ("wait, and the names
 *             will come back on their own").
 * Interim art on existing families with their own palettes (F-36's rule; their own families are P16 art under AC-1,
 * C-82). The six-chapter game's Cinder Orchard is unchanged. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const EN = C.enemies;
  const o = (en, ok, why) => (why ? { en, ok, why: { en: why } } : { en, ok });
  const ch = (x) => Object.assign({ kind: 'choose' }, x);
  const pool = EN['co.moth'] && EN['co.moth'].pool;

  EN['co.shard'] = { setting: 'indoor', name: { en: 'Glass-Shard Wisp', jp: 'ガラス の かけら' }, art: 'echo', artOpts: { col: '#9ad0c0' }, look: { custom: 'wisp', col: '#9ad0c0' },
    region: 'cinder', bg: 'kiln', knots: 2, pool, pattern: ['mirror', 'heat', 'rest'],
    intents: {
      mirror: { power: 2, target: 'rand',
        text: {
          F: { jp: '「 ひ を けさないで 」 …… 「 ひ を けして 」 。', en: '"Don\'t put the fire out." … "Put the fire out."' },
          E: { jp: '「 {窯|かま} の {火|ひ} を {消|け}さないで 」 …… 「 {窯|かま} の {火|ひ} を {消|け}して 」 。', en: '"Don\'t let the kiln fire go out." … "Put the kiln fire out."' },
          I: { jp: '「 {火|ひ} が {強|つよ}すぎたら 、 {灰|はい} を かけて 」 …… 「 {火|ひ} が {弱|よわ}すぎたら 、 {灰|はい} を かけて 」 。', en: '"If the fire gets too strong, bank it with ash." … "If the fire gets too weak, bank it with ash."' },
          A: { jp: '「 {急|いそ}いで {冷|さ}ます と 、 ガラス は {割|わ}れる 」 …… 「 {急|いそ}いで {冷|さ}まさない と 、 ガラス は {割|わ}れる 」 。', en: '"Cool glass in a hurry and it cracks." … "Don\'t cool glass in a hurry and it cracks."' },
        },
        truth: {
          F: ch({ item: 'c:co_shard_f', prompt: { en: 'The shard repeated the words wrong. What did it change?' }, options: [o('"Don\'t put it out" (けさないで) became "put it out" (けして).', true), o('It changed nothing.', false, 'Listen to the ending: ないで became て.')] }),
          E: ch({ item: 'c:co_shard_e', prompt: { en: 'What did the shard change?' }, options: [o('"Don\'t let the kiln fire go out" became "put the kiln fire out".', true), o('"Kiln" became "lamp".', false, 'Both say 窯.'), o('It changed who was speaking.', false, 'The words changed, not the speaker.')] }),
          I: ch({ item: 'c:co_shard_i', prompt: { en: 'What did the shard change, and why does it matter?' }, options: [o('"Too strong" (強すぎたら) became "too weak" (弱すぎたら): banking a weak fire with ash would put it out.', true), o('It changed "ash" into "water".', false, 'Both say 灰をかけて.'), o('It turned a request into a question.', false, 'Both are requests (〜て).')] }),
          A: ch({ item: 'c:co_shard_a', prompt: { en: 'The two sentences end the same way. How does the meaning change?' }, options: [o('The condition flips (冷ますと → 冷まさないと): the true advice is not to cool glass quickly.', true), o('Nothing; both mean "glass cracks".', false, 'The condition flips from 冷ますと to 冷まさないと.'), o('The second is about fire, not glass.', false, 'Both are about glass.')] }),
        } },
    },
    intro: { jp: '{割|わ}れた ガラス の かけら が 、 {窯|かま} の {火|ひ} を {映|うつ}して {浮|う}かんで いる 。 {聞|き}こえた {言葉|ことば} を 、 {逆|さか}さ に {映|うつ}す 。', en: 'A shard of broken glass floats in the air, the kiln fire in it. It reflects the words it hears back to front.' },
    settle: { jp: 'かけら は {床|ゆか} に {落|お}ちて 、 ただ の ガラス に {戻|もど}った 。 {窯|かま} の {火|ひ} が 、 まっすぐ {映|うつ}って いる 。', en: 'The shard drops to the floor and is just glass again. The kiln fire shows in it the right way round.' } };

  EN['co.mole'] = { setting: 'outdoor', name: { en: 'Ash Mole', jp: '{灰|はい}モグラ' }, art: 'golem', artOpts: { col: '#8a8078', core: '#d8a070' }, look: { custom: 'golem', col: '#6a625c' },
    region: 'cinder', bg: 'cinder', knots: 3, pool, pattern: ['charge', 'flood', 'rest', 'strike'],
    intents: {
      charge: { text: {
        F: { jp: 'じめん が すこし ずつ もりあがって くる 。', en: 'The ground is heaving up, little by little.' },
        E: { jp: '{灰|はい} の {下|した} で 、 {地面|じめん} が {少|すこ}し ずつ {盛|も}り{上|あ}がって くる 。', en: 'Under the ash, the ground is heaving up little by little.' },
        I: { jp: '{灰|はい} の {下|した} で 、 {何|なに} か が {力|ちから} を {溜|た}めて いる 。 {縛|しば}る なら {今|いま} だ 。', en: 'Something under the ash is gathering its strength. If you mean to bind it, now is the time.' },
        A: { jp: '{足元|あしもと} の {灰|はい} が 、 {不気味|ぶきみ} な ほど {静|しず}か に なった 。 {下|した} で 、 {力|ちから} が {溜|た}まって いる 。', en: 'The ash underfoot has gone unnervingly still. Below, strength is building.' },
      } },
    },
    intro: { jp: '{灰|はい} の {下|した} から 、 {鼻|はな} だけ が {出|で}て いる 。 {地面|じめん} が 、 ゆっくり {盛|も}り{上|あ}がって くる 。', en: 'Only a nose pokes out from under the ash. The ground is slowly heaving up.' },
    settle: { jp: 'モグラ は {灰|はい} を {一度|いちど} {振|ふ}り{払|はら}って 、 {土|つち} の {中|なか} へ {帰|かえ}って いった 。', en: 'The mole shakes the ash off once and goes back down into the earth.' } };

  EN['co.imp'] = { setting: 'outdoor', name: { en: 'Persimmon Imp', jp: '{柿|かき}{小僧|こぞう}' }, art: 'lantern', artOpts: { col: '#e8803a' }, look: { custom: 'lanternghost', col: '#e8803a' },
    region: 'cinder', bg: 'cinder', knots: 2, pool, pattern: ['heat', 'lie', 'rest'],
    intents: {
      lie: { power: 1, target: 'rand',
        text: {
          F: { jp: 'かき が あまく なる まで まって 。 なまえ は じぶん で もどって くる よ 。', en: 'Wait till the persimmons are sweet. The names will come back by themselves.' },
          E: { jp: '{柿|かき} が {甘|あま}く なる まで {待|ま}って 。 {名前|なまえ} は 、 {自分|じぶん} で {戻|もど}って くる よ 。', en: 'Wait until the persimmons turn sweet. The names will come back on their own.' },
          I: { jp: '{渋|しぶ}い {柿|かき} も 、 {待|ま}てば {甘|あま}く なる 。 {名前|なまえ} も {同|おな}じ さ 。 {何|なに} も しなくて も 、 そのうち {戻|もど}る はず だ 。', en: 'Even bitter persimmons turn sweet if you wait. Names are the same: do nothing, and they\'re bound to come back.' },
          A: { jp: '{熟|う}れる まで {待|ま}つ が いい 。 {名|な} と いう もの は 、 {放|ほう}って おけば おのずと {戻|もど}る もの だ 。', en: 'Best to wait for it to ripen. A name, left alone, comes back of its own accord.' },
        },
        truth: {
          F: ch({ item: 'c:co_imp_f', prompt: { en: 'The imp says the names come back by themselves if you wait. What do you know?' }, options: [o('A name comes back when someone calls it or writes it down.', true), o('It\'s true: just wait.', false, 'Waiting is how the names slipped away.')] }),
          E: ch({ item: 'c:co_imp_e', prompt: { en: 'What is false in what it said?' }, options: [o('"On their own" (自分で): names come back only when someone remembers and calls them.', true), o('"Persimmons turn sweet": they never do.', false, 'Persimmons do sweeten; the lie is about the names.'), o('Nothing.', false, 'You have seen names fade when no one called them.')] }),
          I: ch({ item: 'c:co_imp_i', prompt: { en: 'It says names are "the same" as persimmons (〜も同じ). Where does the comparison fail?' }, options: [o('A persimmon ripens by itself; a name that no one keeps fades.', true), o('Nowhere: names ripen like fruit.', false, 'You have seen names fade when no one called them.'), o('Persimmons are never bitter.', false, 'Some are bitter until they ripen; the comparison fails elsewhere.')] }),
          A: ch({ item: 'c:co_imp_a', prompt: { en: 'It says a name comes back "of its own accord" (おのずと). What is wrong with its counsel?' }, options: [o('It counsels doing nothing: the shijima\'s own answer, dressed up as patience.', true), o('Nothing: patience is always wise.', false, 'Patience with nothing done is how the names were lost.'), o('おのずと means "never".', false, 'おのずと means "naturally, of itself".')] }),
        } },
    },
    intro: { jp: '{枝|えだ} に {残|のこ}った {柿|かき} が {一|ひと}つ 、 {顔|かお} を {持|も}って いる 。 {甘|あま}い {声|こえ} で 、 {待|ま}て と {言|い}う 。', en: 'One persimmon left on the branch has a face. In a sweet voice, it tells you to wait.' },
    settle: { jp: '{柿|かき} は {枝|えだ} から ぽとり と {落|お}ちた 。 {割|わ}って みる と 、 まだ {渋|しぶ}かった 。', en: 'The persimmon drops from the branch with a soft plop. Broken open, it is still bitter.' } };

  Object.assign(C.reviewEnemies = C.reviewEnemies || {}, { 'co.shard': 'co2', 'co.mole': 'co2', 'co.imp': 'co2' });
  if (RB.creaturesA && RB.creaturesA.auditEnemy) {
    const note = 'interim: a twelve-chapter Cinder Orchard creature (P10, E23) drawn on an existing family with its own palette; its own family is P16 art work (AC-1, C-82)';
    RB.creaturesA.auditEnemy('co.shard', 'echo', 'incomplete', note);
    RB.creaturesA.auditEnemy('co.mole', 'golem', 'incomplete', note);
  }

  // ---- placements: twelve-chapter journeys only --------------------------------------------------------------------
  const place = (mapId, f) => { const m = C.maps[mapId]; if (m) (m.foes = m.foes || []).push(Object.assign({ if: 'ed>=2' }, f)); };
  place('co.kiln', { id: 'x1', enemy: 'co.shard', x: 22, y: 6, patrol: 2 });
  place('co.oldworks', { id: 'x2', enemy: 'co.mole', x: 30, y: 21, patrol: 1 });
  place('co.upper', { id: 'x3', enemy: 'co.imp', x: 33, y: 4, patrol: 2 });

  // ---- a changed-world line: the party came up through Manybridge -------------------------------------------------
  const heita = (C.maps['co.village'] && C.maps['co.village'].npcs || []).filter((n) => n.id === 'co_heita');
  for (const n of heita) n.talk = [{ if: 'ed>=2&mb2_done&!co2_heita_city', scene: 'co2.heita_city' }].concat(typeof n.talk === 'string' ? [{ scene: n.talk }] : n.talk);
  RB.script.add(`
@scene co2.heita_city
# Twelve-chapter journeys: Heita has heard of Manybridge's festival.
!faceplayer
co_heita: あ 、 {南|みなみ} から {来|き}た ん っす か 。 {八百橋|やおばし} を {通|とお}って ？ || Oh, you came up from the south? Through Manybridge?
co_heita: {川開|かわびら}き の {花火|はなび} 、 {本当|ほんとう} に {見|み}た ん っす か 。 いい なあ 。 おれ 、 {柿|かき} の {木|き} より {高|たか}い もの 、 {見|み}た こと ない っす よ 。 || You really saw the fireworks at the Opening of the River? Lucky. I've never seen anything taller than a persimmon tree.
!set co2_heita_city
`, 'co2/world');
})(RB.content);
