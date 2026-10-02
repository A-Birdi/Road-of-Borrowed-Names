/* A Quiet Cast — the eighteen authored situations (Practice addendum §6.2),
 * six per site, each in four profile adaptations (§6.3) = 72 task variants.
 *
 * A situation: { id, site, intent (what the line/rod/water then does), title,
 *   scene: { en } (the text equivalent of what the stage draws), rule: { jp, en }
 *   (Yasu's note: the rule is always on screen), misread: { en } (the
 *   misinterpretation the task explains), stage: { … } (what the stage draws),
 *   tasks: { F, E, I, A } }.
 * A task is an ordinary challenge step (kind write | choose | order) plus:
 *   meaning { en }  what the expected response means here
 *   reading         the contextual reading of the expected response
 *   note { jp, en } the Japanese note the I/A task reads (shown as its context)
 *   others [{ forms, en }]  real Japanese for another fishing action: explained as
 *                   "this activity doesn't support that here", never as a grammar error
 *   teach           a card shown first (Foundations; and where a word is new)
 *   labels          readable tags the stage overlays (signs, markers), per profile
 * F: a taught expression, 1–3 kana or one accessible choice. E: a familiar
 * short word. I: a condition / sequence / contrast in context. A: implication,
 * scope or nuance, answered by a short supported choice.
 *
 * Provenance: authored for this game in plain textbook Japanese; the
 * vocabulary is in the lexicon (src/content/fishing/00_lex.js and earlier
 * chapters). Not reviewed by a native speaker (docs/practice/fishing.md). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (F) {
  'use strict';
  const W = (o) => Object.assign({ kind: 'write', mode: 'reading', script: 'hira' }, o);
  const CH = (o) => Object.assign({ kind: 'choose' }, o);
  const OR = (o) => Object.assign({ kind: 'order' }, o);
  const no = (en) => ({ en });
  // accepted forms: kana, kanji, polite, with the particle of direction
  const RIGHT = ['みぎ', '{右|みぎ}', 'みぎへ', '{右|みぎ}へ', 'みぎに', '{右|みぎ}に', 'みぎがわ', '{右側|みぎがわ}', 'みぎがわへ', '{右側|みぎがわ}へ'];
  const LEFT = ['ひだり', '{左|ひだり}', 'ひだりへ', '{左|ひだり}へ', 'ひだりに', '{左|ひだり}に', 'ひだりがわ', '{左側|ひだりがわ}', 'ひだりがわへ', '{左側|ひだりがわ}へ'];
  const WAIT = ['まつ', '{待|ま}つ', 'まって', '{待|ま}って', 'まちます', '{待|ま}ちます', 'まだまつ', 'まだ{待|ま}つ'];
  const LIFT = ['あげる', '{上|あ}げる', 'あげます', '{上|あ}げます', 'そっとあげる', 'そっと{上|あ}げる'];
  const CLOSER = ['よせる', '{寄|よ}せる', 'よせます', '{寄|よ}せます', 'ゆっくりよせる', 'ゆっくり{寄|よ}せる'];
  const SLACK = ['ゆるめる', '{緩|ゆる}める', 'ゆるめます', '{緩|ゆる}めます'];
  const SIDE = ['よこ', '{横|よこ}', 'よこへ', '{横|よこ}へ', 'よこに', '{横|よこ}に', 'よこから', '{横|よこ}から'];
  const TUB = ['おけ', '{桶|おけ}', 'おけへ', '{桶|おけ}へ', 'おけに', '{桶|おけ}に'];
  const WIND = ['まく', '{巻|ま}く', 'まきます', '{巻|ま}きます'];
  const SLOW = ['ゆっくり', 'ゆっくりと'];
  // other real actions, explained as unsupported here (not as mistakes in Japanese)
  const O = {
    wait: { forms: WAIT, en: 'まつ (wait) is good Japanese, but waiting is not what this moment needs.' },
    lift: { forms: LIFT, en: 'あげる (lift) is good Japanese, but lifting is not what this moment needs.' },
    right: { forms: RIGHT, en: 'みぎ (right) is good Japanese, but look again at which side is clear.' },
    left: { forms: LEFT, en: 'ひだり (left) is good Japanese, but look again at which side is clear.' },
    pull: { forms: ['ひく', '{引|ひ}く', 'ひっぱる', '{引|ひ}っ{張|ぱ}る'], en: 'ひく / ひっぱる (pull) is good Japanese, but this game does not support pulling hard here: the note asks for something gentler.' },
    closer: { forms: CLOSER, en: 'よせる (bring closer) is good Japanese, but that is not this moment\'s step.' },
  };
  const S = (o) => F.addSituation(o);

  // ===================================================================================================
  // The current (fish.reedwake.current)
  // ===================================================================================================
  S({ id: 'C01', site: 'fish.reedwake.current', intent: 'wait', title: { jp: '{横|よこ} に {流|なが}れる {浮|う}き', en: 'A drifting float' },
    scene: { en: 'The float is carried sideways by the current. It has not gone under.' },
    rule: { jp: '{浮|う}き が {沈|しず}む まで 、 {待|ま}つ 。 {横|よこ} に {動|うご}く だけ なら 、 まだ {合図|あいず} で は ない 。', en: 'Wait until the float sinks. If it only moves sideways, that is not the signal yet.' },
    misread: { en: 'Sideways movement alone is not the signal in this encounter.' },
    stage: { drift: true },
    tasks: {
      F: W({ item: 'v:待つ', answer: 'まつ', accept: WAIT, reading: 'まつ', meaning: { en: 'wait' },
        teach: { title: 'まつ — to wait', jp: 'まつ', en: 'まつ (matsu) means “to wait”. Yasu\'s note says: wait until the float sinks.' },
        prompt: { en: 'The float only drifts sideways — the note says that is not the signal. Write “wait”.' },
        others: [O.lift, O.pull], explain: { jp: '{浮|う}き が {沈|しず}む まで 、 まつ 。', en: 'Wait until the float sinks; drifting sideways is not the signal.' } }),
      E: W({ item: 'v:待つ', answer: 'まつ', accept: WAIT, reading: 'まつ', meaning: { en: 'wait' },
        prompt: { en: 'The float drifts sideways but has not sunk. What does Yasu\'s note tell you to do now? Write one verb in Japanese.' },
        others: [O.lift, O.pull], explain: { jp: '{待|ま}つ ＝ to wait', en: 'Moving sideways is the current, not a fish: you wait for the float to sink.' } }),
      I: CH({ item: 'g:prt_kara_made', reading: 'まだ まつ', meaning: { en: 'keep waiting' },
        note: { jp: 'メモ ： 「{浮|う}き が {沈|しず}む まで 、 {待|ま}つ 。」 ／ いま 、 {浮|う}き は {横|よこ} に {流|なが}れて いる が 、 {沈|しず}んで は いない 。', en: 'Note: "Wait until the float sinks." / Now the float is drifting sideways, but it has not sunk.' },
        prompt: { en: 'What do you do now?' },
        options: [
          { jp: 'まだ {待|ま}つ 。', ok: true },
          { jp: 'すぐ {竿|さお} を {上|あ}げる 。', ok: false, why: no('まで: you wait UNTIL it sinks. It has only drifted sideways.') },
          { jp: '{糸|いと} を {横|よこ} に {引|ひ}く 。', ok: false, why: no('The note asks you to wait, not to move the line.') },
        ], explain: { jp: '〜 まで ＝ until …', en: 'まで marks how long the waiting lasts: until the float sinks.' } }),
      A: CH({ item: 'g:adv_wake_dewa_nai', reading: 'しずむ まで まつ', meaning: { en: 'it may not be a bite, so wait until it sinks' },
        note: { jp: 'メモ ： 「{浮|う}き が {横|よこ} に {動|うご}いた から と いって 、 {魚|さかな} が {食|く}いついた わけ で は ない 。 {沈|しず}む まで {待|ま}つ こと 。」', en: 'Note: "Just because the float moved sideways does not mean a fish has bitten. Wait until it sinks."' },
        prompt: { en: 'The float is moving sideways. Which reading of the note is right, and what follows?' },
        options: [
          { jp: '{食|く}いついた と は {限|かぎ}らない ので 、 {沈|しず}む まで {待|ま}つ 。', ok: true },
          { jp: '{魚|さかな} は {絶対|ぜったい} に いない ので 、 {竿|さお} を {片付|かたづ}ける 。', ok: false, why: no('わけではない says it does not NECESSARILY mean a bite; it does not say there is certainly no fish.') },
          { jp: '{横|よこ} に {動|うご}いた の だ から 、 すぐ {上|あ}げる 。', ok: false, why: no('That is exactly the reading the note warns against.') },
        ], explain: { jp: '〜 から と いって 〜 わけ で は ない', en: '“Just because …, it doesn\'t mean …”: the movement is not proof of a bite.' } }),
    } });

  S({ id: 'C02', site: 'fish.reedwake.current', intent: 'right', title: { jp: '{左|ひだり} の {葦|あし}', en: 'Reeds on the left' },
    scene: { en: 'A clump of reeds crowds the water on the left of your line. To the right, the water is open.' },
    rule: { jp: '{葦|あし} の ある ほう へ は {寄|よ}せない 。 {開|ひら}けた {水面|すいめん} の ほう へ {動|うご}かす 。', en: 'Don\'t bring it toward the reeds. Move it toward the open water.' },
    misread: { en: 'Pulling left follows the line into the marked obstruction.' },
    stage: { obstacle: 'reeds', side: 'left' },
    tasks: {
      F: W({ item: 'v:右', answer: 'みぎ', accept: RIGHT, reading: 'みぎ', meaning: { en: 'right' },
        teach: { title: 'みぎ / ひだり — right / left', jp: 'みぎ ・ ひだり', en: 'みぎ (migi) is “right”; ひだり (hidari) is “left”.' },
        prompt: { en: 'Reeds are on the left; the right is open water. Write “right”.' },
        others: [O.left, O.wait], explain: { jp: 'みぎ へ', en: 'Toward the open water on the right, away from the reeds.' } }),
      E: W({ item: 'v:右', answer: 'みぎ', accept: RIGHT, reading: 'みぎ', meaning: { en: 'right' },
        prompt: { en: 'Reeds crowd the left of your line; the right is open. Which way do you guide the line? Write the direction in Japanese.' },
        others: [O.left, O.wait, O.pull], explain: { jp: '{右|みぎ} へ ＝ to the right', en: 'The open water is on the right.' } }),
      I: CH({ item: 'g:v_nai', reading: 'みぎ へ', meaning: { en: 'to the right (away from the reeds)' },
        note: { jp: 'メモ ： 「{葦|あし} の ある ほう へ は {寄|よ}せない 。」 ／ いま 、 {葦|あし} は {左|ひだり} に あり 、 {右|みぎ} は {開|ひら}けて いる 。', en: 'Note: "Don\'t bring it toward the reeds." / Now the reeds are on the left and the right is open.' },
        prompt: { en: 'Which way do you guide the line?' },
        options: [
          { jp: '{右|みぎ} へ', ok: true },
          { jp: '{左|ひだり} へ', ok: false, why: no('寄せない is negative: not toward the reeds — and they are on the left.') },
          { jp: '{葦|あし} の {中|なか} へ', ok: false, why: no('That is straight into what the note rules out.') },
        ], explain: { jp: '〜 ない ＝ not …', en: 'The note forbids one side; the other side is the way.' } }),
      A: CH({ item: 'g:v_you_to_suru', reading: 'みぎ から まわす', meaning: { en: 'don\'t force it through on the left; bring it round to the right' },
        note: { jp: 'メモ ： 「{左|ひだり} は {葦|あし} が {邪魔|じゃま} を して いる 。 {無理|むり} に {通|とお}そう と せず 、 {右|みぎ} から {回|まわ}す こと 。」', en: 'Note: "The reeds are in the way on the left. Don\'t try to force it through — bring it round from the right."' },
        prompt: { en: 'What does the note ask you to do?' },
        options: [
          { jp: '{左|ひだり} を {通|とお}そう と しないで 、 {右|みぎ} へ {回|まわ}す 。', ok: true },
          { jp: '{力|ちから} を {入|い}れて 、 {左|ひだり} を {通|とお}す 。', ok: false, why: no('That is 無理に通す — forcing it through, which the note rules out.') },
          { jp: '{右|みぎ} へ {回|まわ}して から 、 {左|ひだり} へ {戻|もど}す 。', ok: false, why: no('Nothing in the note sends it back to the reeds.') },
        ], explain: { jp: '〜 よう と せず ＝ without trying to …', en: '通そうとせず: don\'t (even) try to push it through; go round instead.' } }),
    } });

  S({ id: 'C03', site: 'fish.reedwake.current', intent: 'left', title: { jp: '{右|みぎ} の {枝|えだ}', en: 'A branch on the right' },
    scene: { en: 'A willow branch trails in the water on the right of your line. The water on the left is clear.' },
    rule: { jp: '{枝|えだ} に {糸|いと} が {絡|から}む と 、 {魚|さかな} を {逃|に}がす 。 {枝|えだ} の ない ほう へ 。', en: 'If the line tangles in the branch, the fish gets away. Go to the side without the branch.' },
    misread: { en: 'This is not C02 again: here the right is the blocked side. Don\'t learn “right is always correct”.' },
    stage: { obstacle: 'branch', side: 'right' },
    tasks: {
      F: W({ item: 'v:左', answer: 'ひだり', accept: LEFT, reading: 'ひだり', meaning: { en: 'left' },
        teach: { title: 'ひだり — left', jp: 'ひだり', en: 'ひだり (hidari) means “left”.' },
        prompt: { en: 'A branch is in the water on the right; the left is clear. Write “left”.' },
        others: [O.right, O.wait], explain: { jp: 'ひだり へ', en: 'Away from the branch, toward the clear water on the left.' } }),
      E: W({ item: 'v:左', answer: 'ひだり', accept: LEFT, reading: 'ひだり', meaning: { en: 'left' },
        prompt: { en: 'A branch trails in the water on the right of your line. Which way do you guide it? Write the direction in Japanese.' },
        others: [O.right, O.wait, O.pull], explain: { jp: '{左|ひだり} へ ＝ to the left', en: 'This time the branch is on the right, so the clear way is left.' } }),
      I: CH({ item: 'g:cond_to', reading: 'ひだり へ', meaning: { en: 'to the left (away from the branch)' },
        note: { jp: 'メモ ： 「{枝|えだ} の ほう へ {寄|よ}せる と 、 {糸|いと} が {絡|から}む 。」 ／ {枝|えだ} は {右|みぎ} に ある 。', en: 'Note: "If you bring it toward the branch, the line tangles." / The branch is on the right.' },
        prompt: { en: 'Which way do you guide the line?' },
        options: [
          { jp: '{左|ひだり} へ', ok: true },
          { jp: '{右|みぎ} へ', ok: false, why: no('と: whenever you go toward the branch, the line tangles — and the branch is on the right.') },
          { jp: '{枝|えだ} の {下|した} へ', ok: false, why: no('Under the branch is still toward it.') },
        ], explain: { jp: '〜 と 〜 ＝ when / whenever …', en: 'と states a reliable result: toward the branch means a tangle.' } }),
      A: CH({ item: 'g:cond_ba', reading: 'ひだり へ よせる', meaning: { en: 'the further right, the greater the risk: bring it left' },
        note: { jp: 'メモ ： 「{右|みぎ} へ {寄|よ}せれば {寄|よ}せる ほど 、 {枝|えだ} に {絡|から}む おそれ が {増|ま}す 。」', en: 'Note: "The further right you bring it, the greater the risk of tangling in the branch."' },
        prompt: { en: 'What follows from the note?' },
        options: [
          { jp: '{左|ひだり} へ {寄|よ}せる ほう が {安全|あんぜん} だ 。', ok: true },
          { jp: '{少|すこ}し だけ なら 、 {右|みぎ} も {必|かなら}ず {安全|あんぜん} だ 。', ok: false, why: no('ば…ほど says the risk grows the further right you go; it never promises a little is always safe.') },
          { jp: '{枝|えだ} は {魚|さかな} を {集|あつ}める ので 、 {右|みぎ} へ {寄|よ}せる 。', ok: false, why: no('The note says nothing about attracting fish; it warns of tangling.') },
        ], explain: { jp: '〜 ば 〜 ほど ＝ the more …, the more …', en: 'A sliding scale: further right, more risk. The safe side is left.' } }),
    } });

  S({ id: 'C04', site: 'fish.reedwake.current', intent: 'lift', title: { jp: '{沈|しず}んだ まま の {浮|う}き', en: 'The float stays under' },
    scene: { en: 'The float has gone under and is staying under.' },
    rule: { jp: '{浮|う}き が {沈|しず}んだ まま に なったら 、 そっと {上|あ}げる 。', en: 'Once the float stays under, lift gently.' },
    misread: { en: 'The condition has now been met, so waiting forever is not required.' },
    stage: { float: 'under' },
    tasks: {
      F: W({ item: 'v:上げる', answer: 'あげる', accept: LIFT, reading: 'あげる', meaning: { en: 'lift' },
        teach: { title: 'あげる — to lift', jp: 'そっと あげる', en: 'あげる (ageru) means “to lift, raise”. そっと means “gently”.' },
        prompt: { en: 'The float is staying under, as the note describes. Write “lift”.' },
        template: { before: 'そっと ', after: '' },
        others: [O.wait, O.pull], explain: { jp: 'そっと あげる', en: 'The float stays under: lift gently.' } }),
      E: W({ item: 'v:上げる', answer: 'あげる', accept: LIFT, reading: 'あげる', meaning: { en: 'lift' },
        prompt: { en: 'The float has gone under and is staying under, just as the note says. What do you do with the rod? Write one verb.' },
        others: [O.wait, O.pull], explain: { jp: '{上|あ}げる ＝ to lift', en: 'The condition in the note is met, so you lift — gently.' } }),
      I: CH({ item: 'g:cond_tara', reading: 'そっと あげる', meaning: { en: 'lift gently (the condition is met)' },
        note: { jp: 'メモ ： 「{浮|う}き が {沈|しず}んだ まま に なったら 、 そっと {上|あ}げる 。」 ／ {浮|う}き は もう {沈|しず}んだ まま だ 。', en: 'Note: "Once the float stays under, lift gently." / The float is now staying under.' },
        prompt: { en: 'What do you do now?' },
        options: [
          { jp: 'そっと {上|あ}げる 。', ok: true },
          { jp: 'もっと {待|ま}つ 。', ok: false, why: no('〜たら: once it stays under — and it now does. Waiting longer is not what the note asks.') },
          { jp: '{強|つよ}く {引|ひ}く 。', ok: false, why: no('The note says そっと — gently.') },
        ], explain: { jp: '〜 たら ＝ once / when …', en: 'たら sets the moment; that moment has come.' } }),
      A: CH({ item: 'g:cond_nara', reading: 'まよわず あげる', meaning: { en: 'it stays under: lift without hesitating' },
        note: { jp: 'メモ ： 「{沈|しず}んだ か と {思|おも}って も 、 すぐ {浮|う}いて くる なら {待|ま}つ 。 {沈|しず}んだ まま なら 、 {迷|まよ}わず {上|あ}げる 。」 ／ {浮|う}き は {沈|しず}んで 、 {浮|う}いて こない 。', en: 'Note: "Even if you think it has sunk, if it soon comes back up, wait. If it stays under, lift without hesitating." / The float has sunk and is not coming back up.' },
        prompt: { en: 'Which case is this, and what do you do?' },
        options: [
          { jp: '{迷|まよ}わず 、 そっと {上|あ}げる 。', ok: true },
          { jp: '{念|ねん} の ため 、 もう {少|すこ}し {待|ま}つ 。', ok: false, why: no('迷わず: once it stays under, the note says not to hesitate.') },
          { jp: '{浮|う}いて くる まで {待|ま}つ 。', ok: false, why: no('That is the other case in the note — the float is not coming back up.') },
        ], explain: { jp: '〜 なら 〜 ＝ if that is the case …', en: 'Two cases, two actions; this is the “stays under” case.' } }),
    } });

  S({ id: 'C05', site: 'fish.reedwake.current', intent: 'slack', title: { jp: '{小枝|こえだ} に {引|ひ}っかかった {糸|いと}', en: 'Caught on a twig' },
    scene: { en: 'The line has caught round a loose twig floating at the edge. Nothing is pulling on it.' },
    rule: { jp: '{小枝|こえだ} に {引|ひ}っかかったら 、 {引|ひ}っ{張|ぱ}らないで 、 {糸|いと} を {緩|ゆる}める 。', en: 'If the line catches on a twig, don\'t pull — give it slack.' },
    misread: { en: 'Forceful pulling does not solve this pictured snag.' },
    stage: { snag: 'twig' },
    tasks: {
      F: CH({ item: 'v:緩める', reading: 'いと を ゆるめる', meaning: { en: 'give the line slack' },
        teach: { title: 'ゆるめる / ひっぱる', jp: 'いと を ゆるめる ・ いと を ひっぱる', en: 'ゆるめる (yurumeru): to loosen, give slack. ひっぱる (hipparu): to pull hard. The note says: don\'t pull — loosen.' },
        prompt: { en: 'The line is caught on a twig. Which does the note ask you to do?' },
        options: [
          { jp: 'いと を ゆるめる', ok: true },
          { jp: 'いと を ひっぱる', ok: false, why: no('ひっぱる is pulling — the note says not to.') },
        ], explain: { jp: 'ひっぱらないで 、 ゆるめる', en: 'Don\'t pull; give slack, and the twig slips free.' } }),
      E: W({ item: 'v:緩める', answer: 'ゆるめる', accept: SLACK, reading: 'ゆるめる', meaning: { en: 'loosen, give slack' },
        teach: { title: 'ゆるめる — to loosen', jp: '{糸|いと} を {緩|ゆる}める', en: 'ゆるめる (yurumeru): to loosen, to give a line slack.' },
        prompt: { en: 'Pulling would only tighten the snag. Complete the note\'s action: give the line slack.' },
        template: { before: '{糸|いと} を ', after: '' },
        others: [O.pull, O.lift], explain: { jp: '{緩|ゆる}める ＝ to loosen', en: 'Slack lets the current lift the twig off.' } }),
      I: CH({ item: 'g:v_naide_kudasai', reading: 'ひっぱらないで ゆるめる', meaning: { en: 'loosen it without pulling' },
        note: { jp: 'メモ ： 「{小枝|こえだ} に {引|ひ}っかかったら 、 {引|ひ}っ{張|ぱ}らないで 、 {糸|いと} を {緩|ゆる}める 。」 ／ いま 、 {糸|いと} が {小枝|こえだ} に {引|ひ}っかかって いる 。', en: 'Note: "If it catches on a twig, loosen the line without pulling." / Now the line is caught on a twig.' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: '{引|ひ}っ{張|ぱ}らないで 、 {緩|ゆる}める 。', ok: true },
          { jp: '{強|つよ}く {引|ひ}っ{張|ぱ}って 、 {外|はず}す 。', ok: false, why: no('〜ないで: WITHOUT pulling. Pulling is what the note rules out.') },
          { jp: '{竿|さお} を {水|みず} に {入|い}れる 。', ok: false, why: no('The note doesn\'t ask for that.') },
        ], explain: { jp: '〜 ないで ＝ without …ing', en: 'ないで joins “not pulling” to the action: loosen, without pulling.' } }),
      A: CH({ item: 'g:causative', reading: 'ゆるめて ながれ に まかせる', meaning: { en: 'loosen it and let the current free it' },
        note: { jp: 'メモ ： 「{力|ちから} {任|まか}せ に {引|ひ}けば {引|ひ}く ほど 、 {絡|から}みつく 。 いったん {緩|ゆる}めて 、 {流|なが}れ に {外|はず}させる こと 。」', en: 'Note: "The harder you pull by force, the more it tangles. Loosen it for a moment and let the current take it off."' },
        prompt: { en: 'What does the note ask you to do?' },
        options: [
          { jp: '{糸|いと} を {緩|ゆる}めて 、 {流|なが}れ に {任|まか}せる 。', ok: true },
          { jp: 'もっと {強|つよ}く {引|ひ}く 。', ok: false, why: no('ば…ほど: the harder you pull, the more it tangles.') },
          { jp: '{糸|いと} を {切|き}って 、 {新|あたら}しく する 。', ok: false, why: no('外させる: the current is made to free it; nothing is cut.') },
        ], explain: { jp: '〜 させる ＝ let / have … do', en: '流れに外させる: let the current do the work of freeing it.' } }),
    } });

  S({ id: 'C06', site: 'fish.reedwake.current', intent: 'lane', title: { jp: '{速|はや}い {筋|すじ} と {遅|おそ}い {筋|すじ}', en: 'Two lanes' },
    scene: { en: 'Two lanes of water run past the bank, each marked by a small sign on a stick.' },
    rule: { jp: 'この {記録|きろく} は 、 {流|なが}れ の {遅|おそ}い ほう で とる 。', en: 'For this record, fish where the current is slow.' },
    misread: { en: 'Position, not fish rarity, is what is being asked here.' },
    stage: { lanes: true },
    tasks: {
      F: CH({ item: 'v:遅い', reading: 'おそい', meaning: { en: 'slow' }, labels: { fast: 'はやい', slow: 'おそい' },
        teach: { title: 'はやい / おそい — fast / slow', jp: 'はやい ・ おそい', en: 'はやい (hayai): fast. おそい (osoi): slow. The note asks for the slow lane.' },
        prompt: { en: 'The note asks for the calm, slow lane. Which sign marks it?' },
        options: [
          { jp: 'おそい', ok: true },
          { jp: 'はやい', ok: false, why: no('はやい means fast.') },
        ], explain: { jp: 'おそい ＝ slow', en: 'The slow lane is the calm edge the note asks for.' } }),
      E: CH({ item: 'v:遅い', reading: 'おそい ほう', meaning: { en: 'the slow side' }, labels: { fast: '{速|はや}い', slow: '{遅|おそ}い' },
        prompt: { en: 'The note asks you to fish where the current is slow. Which lane do you choose?' },
        options: [
          { jp: '{流|なが}れ が {遅|おそ}い ほう', ok: true },
          { jp: '{流|なが}れ が {速|はや}い ほう', ok: false, why: no('速い is fast. The note asks for 遅い, slow.') },
        ], explain: { jp: '{遅|おそ}い ＝ slow ・ {速|はや}い ＝ fast', en: 'Read the signs, not the colour of the sticks.' } }),
      I: CH({ item: 'g:v_yasui_nikui', reading: 'おそい ほう で つる', meaning: { en: 'fish the slow lane, where the fish is easier to observe' }, labels: { fast: '{速|はや}い', slow: '{遅|おそ}い' },
        note: { jp: 'メモ ： 「{流|なが}れ が {速|はや}い ところ で は 、 {魚|さかな} が {見|み}えにくい ので 、 {遅|おそ}い ほう で {釣|つ}る 。」', en: 'Note: "In fast water the fish is hard to see, so fish the slow side."' },
        prompt: { en: 'Where do you cast?' },
        options: [
          { jp: '{遅|おそ}い ほう で {釣|つ}る 。', ok: true },
          { jp: '{速|はや}い ほう で {釣|つ}る 。', ok: false, why: no('にくい: the fast lane is where the fish is hard to see.') },
          { jp: '{珍|めずら}しい {魚|さかな} が いる ほう で {釣|つ}る 。', ok: false, why: no('The note is about where you can observe, not which fish is rarer.') },
        ], explain: { jp: '〜 にくい ＝ hard to …', en: 'The reason (ので) points to the slow lane.' } }),
      A: CH({ item: 'g:adv_to_wa_ie', reading: 'ゆるい すじ を えらぶ', meaning: { en: 'choose the calm lane even though the fast one has more fish' }, labels: { fast: '{速|はや}い {筋|すじ}', slow: '{緩|ゆる}い {筋|すじ}' },
        note: { jp: 'メモ ： 「{速|はや}い {筋|すじ} は {魚|さかな} が {多|おお}い と は いえ 、 {今回|こんかい} は {落|お}ち{着|つ}いて {観察|かんさつ} できる {緩|ゆる}い {筋|すじ} を {選|えら}ぶ こと 。」', en: 'Note: "The fast lane may have more fish, but this time choose the gentle lane, where you can observe calmly."' },
        prompt: { en: 'Which lane does the note choose, and why?' },
        options: [
          { jp: '{落|お}ち{着|つ}いて {観察|かんさつ} できる ので 、 {緩|ゆる}い {筋|すじ} 。', ok: true },
          { jp: '{魚|さかな} が {多|おお}い ので 、 {速|はや}い {筋|すじ} 。', ok: false, why: no('とはいえ concedes the fast lane has more fish, then chooses the calm one anyway.') },
          { jp: 'どちら で も いい 。', ok: false, why: no('こと at the end is an instruction: it asks for one lane.') },
        ], explain: { jp: '〜 と は いえ ＝ that said / even so', en: 'A concession, then the real choice: the gentle lane.' } }),
    } });

  // ===================================================================================================
  // Quiet water (fish.reedwake.quiet)
  // ===================================================================================================
  S({ id: 'Q01', site: 'fish.reedwake.quiet', intent: 'wait', title: { jp: '{小|ちい}さな {波紋|はもん}', en: 'A small ripple' },
    scene: { en: 'A small ripple spreads across the water near the float. The float itself is still on the surface.' },
    rule: { jp: '{波紋|はもん} は {合図|あいず} で は ない 。 {浮|う}き が {水|みず} の {下|した} に {入|はい}ったら 、 {合図|あいず} だ 。', en: 'A ripple is not the signal. The float going under the water is the signal.' },
    misread: { en: 'A ripple is not the taught signal.' },
    stage: { ripple: true },
    tasks: {
      F: CH({ item: 'v:待つ', reading: 'まつ', meaning: { en: 'wait' },
        teach: { title: 'まつ / あげる — wait / lift', jp: 'まつ ・ あげる', en: 'まつ (matsu): to wait. あげる (ageru): to lift. A ripple is not the signal.' },
        prompt: { en: 'Only a ripple — the float is still on the surface. Which do you do?' },
        options: [
          { jp: 'まつ', ok: true },
          { jp: 'あげる', ok: false, why: no('あげる is lifting. The float has not gone under yet.') },
        ], explain: { jp: 'まだ まつ', en: 'Keep waiting: the ripple is not the signal.' } }),
      E: W({ item: 'v:待つ', answer: 'まつ', accept: WAIT, reading: 'まつ', meaning: { en: 'wait' },
        prompt: { en: 'A ripple spreads near the float, but the float has not gone under. What do you do? Write one verb in Japanese.' },
        others: [O.lift, O.pull], explain: { jp: '{待|ま}つ ＝ to wait', en: 'Only the float going under is the signal.' } }),
      I: CH({ item: 'g:cond_tara', reading: 'まだ まつ', meaning: { en: 'keep waiting' },
        note: { jp: 'メモ ： 「{浮|う}き が {水|みず} の {下|した} に {入|はい}ったら {合図|あいず} だ 。 {波紋|はもん} は {合図|あいず} で は ない 。」 ／ いま 、 {浮|う}き の {近|ちか}く に {波紋|はもん} が {広|ひろ}がった 。 {浮|う}き は {水|みず} の {上|うえ} に ある 。', en: 'Note: "When the float goes under the water, that is the signal. A ripple is not." / Now a ripple has spread near the float. The float is on the surface.' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: 'まだ {待|ま}つ 。', ok: true },
          { jp: '{合図|あいず} だ から 、 {上|あ}げる 。', ok: false, why: no('The note separates a ripple from the float going under; only the second is the signal.') },
          { jp: '{波紋|はもん} の ほう へ {糸|いと} を {投|な}げる 。', ok: false, why: no('Nothing in the note sends the line after a ripple.') },
        ], explain: { jp: '〜 たら ＝ when …', en: 'たら names the signal; a ripple is not it.' } }),
      A: CH({ item: 'g:kamo', reading: 'ちかい かも しれない が まだ まつ', meaning: { en: 'a fish may be near, but it hasn\'t bitten: keep waiting' },
        note: { jp: 'メモ ： 「{波紋|はもん} は 、 {魚|さかな} が {近|ちか}く に いる しるし かも しれない が 、 {食|く}いついた しるし に は ならない 。」', en: 'Note: "A ripple may be a sign that a fish is near, but it is not a sign that one has bitten."' },
        prompt: { en: 'A ripple has just spread by the float. What follows from the note?' },
        options: [
          { jp: '{魚|さかな} は {近|ちか}い かも しれない が 、 まだ {待|ま}つ 。', ok: true },
          { jp: '{食|く}いついた の だ から 、 すぐ {上|あ}げる 。', ok: false, why: no('The note says a ripple is NOT a sign of a bite.') },
          { jp: '{魚|さかな} は もう どこ に も いない 。', ok: false, why: no('かもしれない allows that a fish may be near; the note doesn\'t say none is.') },
        ], explain: { jp: '〜 かも しれない ＝ may / might', en: 'Possibility (かもしれない) versus what counts as the signal.' } }),
    } });

  S({ id: 'Q02', site: 'fish.reedwake.quiet', intent: 'close', title: { jp: '{二回|にかい} {沈|しず}んで {止|と}まる', en: 'Two dips, then still' },
    scene: { en: 'The float dipped twice, and now it is holding still, a little low in the water.' },
    rule: { jp: '{浮|う}き が {二回|にかい} {沈|しず}んで 、 {止|と}まったら 、 ゆっくり {寄|よ}せる 。', en: 'When the float has dipped twice and then holds still, bring the fish in slowly.' },
    misread: { en: 'Count and sequence matter here, not a quick reaction.' },
    stage: { dips: 2 },
    tasks: {
      F: W({ item: 'v:寄せる', answer: 'よせる', accept: CLOSER, reading: 'よせる', meaning: { en: 'bring closer' },
        teach: { title: 'よせる — to bring closer', jp: 'ゆっくり よせる', en: 'よせる (yoseru): to bring something closer. ゆっくり: slowly.' },
        prompt: { en: 'Two dips, and now it holds — the note\'s moment. Write “bring closer”.' },
        template: { before: 'ゆっくり ', after: '' },
        others: [O.wait, O.lift, O.pull], explain: { jp: 'ゆっくり よせる', en: 'Two dips and a hold: bring it in slowly.' } }),
      E: W({ item: 'v:寄せる', answer: 'よせる', accept: CLOSER, reading: 'よせる', meaning: { en: 'bring closer' },
        teach: { title: 'よせる — to bring closer', jp: '{寄|よ}せる', en: 'よせる (yoseru): to bring something closer to you.' },
        prompt: { en: 'The float has dipped twice and now holds still — exactly the note\'s moment. What does the note tell you to do? Write the verb.' },
        template: { before: 'ゆっくり ', after: '' },
        others: [O.wait, O.lift, O.pull], explain: { jp: '{寄|よ}せる ＝ to bring closer', en: 'The count (two) and the hold are both there: bring it in slowly.' } }),
      I: CH({ item: 'g:cond_tara', reading: 'ゆっくり よせる', meaning: { en: 'bring it in slowly (both dips and the hold have happened)' },
        note: { jp: 'メモ ： 「{浮|う}き が {二回|にかい} {沈|しず}んで 、 {止|と}まったら 、 ゆっくり {寄|よ}せる 。」 ／ {浮|う}き は {二回|にかい} {沈|しず}んで 、 いま {止|と}まって いる 。', en: 'Note: "When the float has dipped twice and holds still, bring it in slowly." / The float has dipped twice and is now holding still.' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: 'ゆっくり {寄|よ}せる 。', ok: true },
          { jp: 'もう {一回|いっかい} {沈|しず}む まで {待|ま}つ 。', ok: false, why: no('It has already dipped twice and is holding: the condition is complete.') },
          { jp: 'すばやく {引|ひ}く 。', ok: false, why: no('The note says ゆっくり — slowly.') },
        ], explain: { jp: '〜 て 、 〜 たら ＝ … and then, once …', en: 'A sequence (dip, dip, hold), then the action.' } }),
      A: OR({ item: 'g:v_te_kara', reading: 'にかい しずんで とまって から よせる', meaning: { en: 'two dips, the float settles, and only then bring it in' },
        note: { jp: 'メモ ： 「{一度|いちど} {沈|しず}んだ だけ で {寄|よ}せる と 、 {魚|さかな} は {離|はな}れて しまう こと が {多|おお}い 。」', en: 'Note: "If you bring it in after only one dip, the fish often lets go."' },
        prompt: { en: 'Put Yasu\'s procedure for this situation in order.' },
        tiles: ['{浮|う}き が {二回|にかい} {沈|しず}んで', '{止|と}まって から', 'ゆっくり {寄|よ}せる'],
        answer: ['{浮|う}き が {二回|にかい} {沈|しず}んで', '{止|と}まって から', 'ゆっくり {寄|よ}せる'],
        orderHint: { en: 'First what happens to the float (two dips), then the moment (てから: after it holds), then the action last.' },
        explain: { jp: '〜 て から ＝ after …', en: 'てから fixes the order: the hold comes before you bring it in.' } }),
    } });

  S({ id: 'Q03', site: 'fish.reedwake.quiet', intent: 'side', title: { jp: '{上|うえ} の {枝|えだ}', en: 'A branch overhead' },
    scene: { en: 'A branch hangs low over the water above your line. To the side, between two reed stems, there is a clear gap.' },
    rule: { jp: '{上|うえ} に {枝|えだ} が ある とき は 、 {高|たか}く {上|あ}げないで 、 {横|よこ} の すきま から {出|だ}す 。', en: 'When there is a branch overhead, don\'t lift high — bring it out through the gap at the side.' },
    misread: { en: 'The drawing rules out lifting straight up.' },
    stage: { branchOver: true, gap: 'right' },
    tasks: {
      F: W({ item: 'v:横', answer: 'よこ', accept: SIDE, reading: 'よこ', meaning: { en: 'side, sideways' },
        teach: { title: 'よこ — the side', jp: 'よこ', en: 'よこ (yoko): the side; sideways.' },
        prompt: { en: 'A branch hangs overhead; the gap is at the side. Write “side”.' },
        others: [O.lift, O.wait], explain: { jp: 'よこ から', en: 'Out through the side, not up into the branch.' } }),
      E: W({ item: 'v:横', answer: 'よこ', accept: SIDE, reading: 'よこ', meaning: { en: 'side, sideways' },
        prompt: { en: 'A branch hangs low over the line, so you can\'t lift high. Which way do you bring the fish out? Write it in Japanese.' },
        others: [O.lift, O.wait], explain: { jp: '{横|よこ} ＝ side', en: 'Through the gap at the side.' } }),
      I: CH({ item: 'g:toki', reading: 'よこ の すきま から だす', meaning: { en: 'out through the gap at the side' },
        note: { jp: 'メモ ： 「{上|うえ} に {枝|えだ} が ある とき は 、 {高|たか}く {上|あ}げないで 、 {横|よこ} の すきま から {出|だ}す 。」', en: 'Note: "When there is a branch overhead, bring it out through the gap at the side without lifting high."' },
        prompt: { en: 'There is a branch above the line. What do you do?' },
        options: [
          { jp: '{横|よこ} の すきま から {出|だ}す 。', ok: true },
          { jp: '{高|たか}く {上|あ}げる 。', ok: false, why: no('とき: when there is a branch overhead — and there is. The note rules out lifting high.') },
          { jp: '{枝|えだ} の {上|うえ} を {通|とお}す 。', ok: false, why: no('Over the branch is still lifting high.') },
        ], explain: { jp: '〜 とき ＝ when …', en: 'とき names the circumstance that applies now.' } }),
      A: CH({ item: 'g:cond_ba', reading: 'ねかせて よこ へ ぬく', meaning: { en: 'keep the rod low and draw it out sideways' },
        note: { jp: 'メモ ： 「{竿|さお} を {立|た}てれば {枝|えだ} に {当|あ}たる 。 {立|た}てずに 、 {寝|ね}かせた まま {横|よこ} へ {抜|ぬ}く こと 。」', en: 'Note: "Raise the rod and it hits the branch. Keep it low, without raising it, and draw out to the side."' },
        prompt: { en: 'What does the note ask you to do?' },
        options: [
          { jp: '{竿|さお} を {寝|ね}かせて 、 {横|よこ} へ {抜|ぬ}く 。', ok: true },
          { jp: '{竿|さお} を まっすぐ {立|た}てて {上|あ}げる 。', ok: false, why: no('That is what 立てずに rules out.') },
          { jp: '{枝|えだ} を {折|お}って から {上|あ}げる 。', ok: false, why: no('Nothing in the note asks you to break the branch.') },
        ], explain: { jp: '〜 ずに ＝ without …ing', en: '立てずに: without raising it; 寝かせたまま: keeping it low.' } }),
    } });

  S({ id: 'Q04', site: 'fish.reedwake.quiet', intent: 'left', title: { jp: '{葦|あし} で は ない ほう', en: 'Not the reed side' },
    scene: { en: 'Reeds stand on the right of the float. The left side is open.' },
    rule: { jp: '{葦|あし} の ほう で は なく 、 {反対|はんたい} {側|がわ} へ 。', en: 'Not toward the reeds — to the other side.' },
    misread: { en: 'Keep the negation: “not the reed side”.' },
    stage: { obstacle: 'reeds', side: 'right', notice: true },
    tasks: {
      F: CH({ item: 'v:左', reading: 'ひだり', meaning: { en: 'left' },
        teach: { title: 'みぎ / ひだり — right / left', jp: 'みぎ ・ ひだり', en: 'みぎ (migi): right. ひだり (hidari): left. The note says: NOT the reed side.' },
        prompt: { en: 'The note says “not the reed side”. The reeds are on the right. Which way?' },
        options: [
          { jp: 'ひだり', ok: true },
          { jp: 'みぎ', ok: false, why: no('みぎ is right — that is where the reeds are.') },
        ], explain: { jp: 'あし で は ない ほう ＝ ひだり', en: 'Not the reeds: the other side, left.' } }),
      E: W({ item: 'v:左', answer: 'ひだり', accept: LEFT, reading: 'ひだり', meaning: { en: 'left' },
        prompt: { en: 'The notice says “not the reed side”. The reeds are on the right. Which way do you guide the fish? Write the direction in Japanese.' },
        others: [O.right, O.wait], explain: { jp: '{反対|はんたい} {側|がわ} ＝ the other side', en: 'The negation points away from the reeds: left.' } }),
      I: CH({ item: 'g:v_nai', reading: 'ひだり へ', meaning: { en: 'to the left (not the reed side)' },
        note: { jp: 'メモ ： 「{葦|あし} の ほう へ は {行|い}かせない 。」 ／ {葦|あし} は {右|みぎ} に ある 。', en: 'Note: "Don\'t let it go toward the reeds." / The reeds are on the right.' },
        prompt: { en: 'Which way do you guide the fish?' },
        options: [
          { jp: '{左|ひだり} へ', ok: true },
          { jp: '{右|みぎ} へ', ok: false, why: no('行かせない is negative: not toward the reeds, which are on the right.') },
          { jp: 'どちら で も いい', ok: false, why: no('The note rules out one side.') },
        ], explain: { jp: '〜 ない ＝ not …', en: 'Keep the negation in mind.' } }),
      A: CH({ item: 'g:v_temo_ii', reading: 'あし の がわ いがい なら いい', meaning: { en: 'anywhere but the reed side: left or toward you' },
        note: { jp: 'メモ ： 「{葦|あし} の {側|がわ} {以外|いがい} なら 、 どこ へ {寄|よ}せて も かまわない 。」 ／ {葦|あし} は {右|みぎ} に ある 。', en: 'Note: "Anywhere except the reed side is fine." / The reeds are on the right.' },
        prompt: { en: 'Which of these follows the note? (More than one may.)' },
        options: [
          { jp: '{左|ひだり} へ {寄|よ}せる 。', ok: true },
          { jp: '{手前|てまえ} へ {寄|よ}せる 。', ok: true },
          { jp: '{右|みぎ} へ {寄|よ}せる 。', ok: false, why: no('以外: everywhere EXCEPT the reed side — and the reeds are on the right.') },
        ], explain: { jp: '〜 {以外|いがい} なら 〜 て も かまわない', en: 'Everything except one side is allowed: left and toward you both fit.' } }),
    } });

  S({ id: 'Q05', site: 'fish.reedwake.quiet', intent: 'tray', title: { jp: '{水|みず} の {入|はい}った おけ', en: 'The observation tub' },
    scene: { en: 'On the bank to your left a shallow tub of water waits. To your right is bare, dry ground.' },
    rule: { jp: '{見|み}る {魚|さかな} は 、 {水|みず} を {入|い}れた おけ に {入|い}れる 。 {地面|じめん} に は {置|お}かない 。', en: 'A fish to be observed goes into the tub of water — never onto the ground.' },
    misread: { en: 'Use the stated observation place, not an unrelated spot.' },
    stage: { tub: 'left', dry: 'right' },
    tasks: {
      F: W({ item: 'v:桶', answer: 'おけ', accept: TUB, reading: 'おけ', meaning: { en: 'tub' },
        teach: { title: 'おけ — a tub', jp: 'おけ', en: 'おけ (oke): a tub or bucket. The note says the fish goes in the tub of water.' },
        prompt: { en: 'Where does the fish go? Write “tub”.' },
        others: [O.wait], explain: { jp: 'おけ に いれる', en: 'Into the tub of water, never onto the ground.' } }),
      E: W({ item: 'v:桶', answer: 'おけ', accept: TUB, reading: 'おけ', meaning: { en: 'tub' },
        prompt: { en: 'The note says where an observed fish must go. Where do you bring it? Write it in Japanese.' },
        others: [O.wait, O.lift], explain: { jp: '{桶|おけ} ＝ tub', en: 'The tub with water in it — not the dry ground.' } }),
      I: CH({ item: 'g:prt_ni', reading: 'おけ へ はこぶ', meaning: { en: 'carry it to the tub of water' },
        note: { jp: 'メモ ： 「{見|み}る {魚|さかな} は 、 {水|みず} を {入|い}れた おけ に {入|い}れる 。 {地面|じめん} に は {置|お}かない 。」', en: 'Note: "A fish to be observed goes in the tub with water. Never put it on the ground."' },
        prompt: { en: 'You are bringing the fish in. Where to?' },
        options: [
          { jp: '{水|みず} の ある おけ へ {運|はこ}ぶ 。', ok: true },
          { jp: '{乾|かわ}いた {地面|じめん} に {置|お}く 。', ok: false, why: no('The note says 地面には置かない.') },
          { jp: '{池|いけ} の {真|ま}ん{中|なか} へ {戻|もど}す 。', ok: false, why: no('You release it afterwards — first the note asks for the tub.') },
        ], explain: { jp: '〜 に {入|い}れる ・ 〜 に は {置|お}かない', en: 'に marks where it goes; は with the negative contrasts the place it must not go.' } }),
      A: CH({ item: 'g:prt_kara_made', reading: 'すぐ おけ へ うつす', meaning: { en: 'move it straight into the tub of water' },
        note: { jp: 'メモ ： 「{観察|かんさつ} が {済|す}む まで 、 {魚|さかな} を {水|みず} から {出|だ}した まま に しない こと 。」', en: 'Note: "Until the observation is done, never leave the fish out of the water."' },
        prompt: { en: 'What does the note mean for where you bring the fish?' },
        options: [
          { jp: 'すぐ {水|みず} の {入|はい}った おけ へ {移|うつ}す 。', ok: true },
          { jp: '{乾|かわ}いた {地面|じめん} で {観察|かんさつ} して から 、 おけ に {入|い}れる 。', ok: false, why: no('まま: the note rules out keeping it out of the water while you observe.') },
          { jp: '{観察|かんさつ} は しないで 、 すぐ {放|はな}す 。', ok: false, why: no('The note assumes an observation; it is about where it happens, not whether.') },
        ], explain: { jp: '〜 まで ・ 〜 まま に しない', en: 'Until the observation is over, not left as it is (out of the water).' } }),
    } });

  S({ id: 'Q06', site: 'fish.reedwake.quiet', intent: 'slow', title: { jp: '{岸|きし} の すぐ {下|した}', en: 'Alongside the bank' },
    scene: { en: 'The fish is already alongside the bank, just below the edge. The line is short.' },
    rule: { jp: '{岸|きし} まで {来|き}たら 、 {急|いそ}がない 。 ゆっくり {寄|よ}せる 。', en: 'Once it reaches the bank, don\'t hurry. Ease it closer slowly.' },
    misread: { en: 'Speed is not the goal of this situation.' },
    stage: { near: true },
    tasks: {
      F: CH({ item: 'v:ゆっくり', reading: 'ゆっくり', meaning: { en: 'slowly' },
        teach: { title: 'ゆっくり / はやく — slowly / quickly', jp: 'ゆっくり ・ はやく', en: 'ゆっくり (yukkuri): slowly. はやく (hayaku): quickly. The note says: don\'t hurry.' },
        prompt: { en: 'The fish is right by the bank. How does the note say to bring it the last bit?' },
        options: [
          { jp: 'ゆっくり', ok: true },
          { jp: 'はやく', ok: false, why: no('はやく means quickly — the note says not to hurry.') },
        ], explain: { jp: 'ゆっくり よせる', en: 'The last bit, slowly.' } }),
      E: W({ item: 'v:ゆっくり', answer: 'ゆっくり', accept: SLOW, reading: 'ゆっくり', meaning: { en: 'slowly' },
        prompt: { en: 'The fish is already by the bank. How do you bring it the last bit? Complete the note\'s instruction.' },
        template: { before: '', after: ' {寄|よ}せる' },
        others: [O.wait], explain: { jp: 'ゆっくり ＝ slowly', en: 'No hurry now: slowly.' } }),
      I: CH({ item: 'g:comp_yori_hou', reading: 'ゆっくり よせる', meaning: { en: 'ease it in slowly (quiet matters more than speed)' },
        note: { jp: 'メモ ： 「{岸|きし} に {着|つ}いて から は 、 {速|はや}さ より {静|しず}けさ を {大切|たいせつ} に する 。」', en: 'Note: "Once it reaches the bank, quietness matters more than speed."' },
        prompt: { en: 'The fish is alongside the bank. What do you do?' },
        options: [
          { jp: 'ゆっくり {寄|よ}せる 。', ok: true },
          { jp: '{一気|いっき} に {引|ひ}き{上|あ}げる 。', ok: false, why: no('より compares: quietness matters more than speed now.') },
          { jp: 'もう {一度|いちど} {沖|おき} へ {出|だ}す 。', ok: false, why: no('Nothing in the note sends it back out.') },
        ], explain: { jp: 'A より B ＝ B rather than A', en: 'より ranks speed below quiet.' } }),
      A: CH({ item: 'g:comp_yori_hou', reading: 'じかん を かけて よせる', meaning: { en: 'take your time rather than rush it' },
        note: { jp: 'メモ ： 「ここ まで {来|く}れば 、 {急|いそ}ぐ {理由|りゆう} は もう ない 。 {焦|あせ}って あばれさせる くらい なら 、 {時間|じかん} を かけた ほう が いい 。」', en: 'Note: "Once it is this far, there is no reason to hurry. Rather than rush and make it thrash, it\'s better to take your time."' },
        prompt: { en: 'What does the note ask?' },
        options: [
          { jp: '{時間|じかん} を かけて 、 ゆっくり {寄|よ}せる 。', ok: true },
          { jp: 'あばれる {前|まえ} に 、 {急|いそ}いで {引|ひ}き{上|あ}げる 。', ok: false, why: no('くらいなら: rather than rush and make it thrash, take your time.') },
          { jp: '{理由|りゆう} が ない ので 、 {糸|いと} を {切|き}る 。', ok: false, why: no('The note says there is no reason to HURRY — not to cut the line.') },
        ], explain: { jp: '〜 くらい なら 〜 ほう が いい', en: 'Rather than X, better to Y.' } }),
    } });

  // ===================================================================================================
  // The harbour (fish.saltglass.harbor)
  // ===================================================================================================
  S({ id: 'H01', site: 'fish.saltglass.harbor', intent: 'recover', title: { jp: '{一度|いちど} {引|ひ}いて 、 たるんだ {糸|いと}', en: 'A tug, then slack' },
    scene: { en: 'There was one brief tug — now the line hangs slack in a loose curve.' },
    rule: { jp: '{一度|いちど} {引|ひ}き が あって 、 {糸|いと} が たるんだら 、 {少|すこ}し {待|ま}って から {糸|いと} を {巻|ま}く 。', en: 'If there is one tug and then the line goes slack, wait a moment, then wind the line in.' },
    misread: { en: 'Not every tug is the same state: this one has gone slack.' },
    stage: { slack: true },
    tasks: {
      F: W({ item: 'v:巻く', answer: 'まく', accept: WIND, reading: 'まく', meaning: { en: 'wind (the line) in' },
        teach: { title: 'まく — to wind', jp: 'いと を まく', en: 'まく (maku): to wind, to reel in. The note says: wait a moment, then wind the line in.' },
        prompt: { en: 'The line went slack after a tug. After a moment, wind it in. Write “wind”.' },
        template: { before: 'いと を ', after: '' },
        others: [O.pull, O.lift], explain: { jp: 'まって から 、 いと を まく', en: 'Wait a moment, then take up the slack.' } }),
      E: W({ item: 'v:巻く', answer: 'まく', accept: WIND, reading: 'まく', meaning: { en: 'wind in' },
        teach: { title: 'まく — to wind', jp: '{糸|いと} を {巻|ま}く', en: 'まく (maku): to wind; 糸を巻く, to wind the line in.' },
        prompt: { en: 'One tug, then slack. You have waited a moment. Complete the note: wind the line in.' },
        template: { before: '{糸|いと} を ', after: '' },
        others: [O.pull, O.lift], explain: { jp: '{巻|ま}く ＝ to wind', en: 'The slack is taken up by winding in.' } }),
      I: CH({ item: 'g:v_te_kara', reading: 'まって から まく', meaning: { en: 'wait a moment, then wind in' },
        note: { jp: 'メモ ： 「{一度|いちど} {引|ひ}き が あって 、 {糸|いと} が たるんだら 、 {少|すこ}し {待|ま}って から {糸|いと} を {巻|ま}く 。」 ／ いま 、 {糸|いと} が たるんで いる 。', en: 'Note: "If there is one tug and the line goes slack, wait a moment, then wind it in." / The line is slack now.' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: '{少|すこ}し {待|ま}って から 、 {糸|いと} を {巻|ま}く 。', ok: true },
          { jp: 'すぐ {強|つよ}く {引|ひ}く 。', ok: false, why: no('The tug has passed and the line is slack: the note asks you to wait first.') },
          { jp: 'たるんだ まま 、 {何|なに} も しない 。', ok: false, why: no('てから: after waiting, you DO wind in.') },
        ], explain: { jp: '〜 て から ＝ after …', en: 'Two steps in order: wait, then wind.' } }),
      A: CH({ item: 'g:v_nagara', reading: 'ようす を みながら たるみ を とる', meaning: { en: 'take up the slack while watching' },
        note: { jp: 'メモ ： 「{引|ひ}き が {一度|いちど} きり で 、 その {後|あと} {糸|いと} が たるんだ なら 、 {慌|あわ}てる {必要|ひつよう} は ない 。 たるみ を {取|と}りながら 、 {様子|ようす} を {見|み}る こと 。」', en: 'Note: "If there was just one tug and then the line went slack, there is no need to rush. Take up the slack while you watch."' },
        prompt: { en: 'What does the note ask?' },
        options: [
          { jp: '{様子|ようす} を {見|み}ながら 、 たるみ を {取|と}る 。', ok: true },
          { jp: '{慌|あわ}てて {竿|さお} を {上|あ}げる 。', ok: false, why: no('慌てる必要はない: no need to rush.') },
          { jp: '{引|ひ}き が {止|と}まった ので 、 {帰|かえ}る 。', ok: false, why: no('The note asks you to keep watching while taking up the slack.') },
        ], explain: { jp: '〜 ながら ＝ while …', en: 'Two things at once: take up the slack, keep watching.' } }),
    } });

  S({ id: 'H02', site: 'fish.saltglass.harbor', intent: 'right', title: { jp: '{左|ひだり} の {杭|くい}', en: 'A post on the left' },
    scene: { en: 'A mooring post stands in the water to the left of your line. To the right, the harbour is open.' },
    rule: { jp: '{杭|くい} の {近|ちか}く に {寄|よ}せる と 、 {糸|いと} が {巻|ま}きつく 。 {杭|くい} の ない ほう へ 。', en: 'Bring it near the post and the line wraps round it. Go to the side without the post.' },
    misread: { en: 'Follow the unobstructed route.' },
    stage: { obstacle: 'post', side: 'left' },
    tasks: {
      F: W({ item: 'v:右', answer: 'みぎ', accept: RIGHT, reading: 'みぎ', meaning: { en: 'right' },
        teach: { title: 'みぎ — right', jp: 'みぎ', en: 'みぎ (migi): right.' },
        prompt: { en: 'The post is on the left; the right is open. Write “right”.' },
        others: [O.left, O.wait], explain: { jp: 'くい の ない みぎ へ', en: 'To the open side, away from the post.' } }),
      E: W({ item: 'v:右', answer: 'みぎ', accept: RIGHT, reading: 'みぎ', meaning: { en: 'right' },
        prompt: { en: 'A mooring post stands to the left of your line. Which way do you guide it? Write the direction in Japanese.' },
        others: [O.left, O.wait, O.pull], explain: { jp: '{右|みぎ} ＝ right', en: 'The open harbour is on the right.' } }),
      I: CH({ item: 'g:cond_to', reading: 'みぎ へ', meaning: { en: 'to the right (away from the post)' },
        note: { jp: 'メモ ： 「{杭|くい} の {近|ちか}く に {寄|よ}せる と 、 {糸|いと} が {巻|ま}きつく 。」 ／ {杭|くい} は {左|ひだり} 、 {右|みぎ} は {港|みなと} が {開|ひら}けて いる 。', en: 'Note: "Bring it near the post and the line wraps round." / The post is on the left; on the right the harbour is open.' },
        prompt: { en: 'Which way do you guide the line?' },
        options: [
          { jp: '{右|みぎ} へ', ok: true },
          { jp: '{左|ひだり} へ', ok: false, why: no('と: near the post, the line wraps — and the post is on the left.') },
          { jp: '{杭|くい} に {糸|いと} を {結|むす}ぶ', ok: false, why: no('Nothing in the note ties the line to the post.') },
        ], explain: { jp: '〜 と ＝ when / if …', en: 'A reliable consequence keeps you off the post side.' } }),
      A: CH({ item: 'g:v_yasui_nikui', reading: 'ひらけた みぎ へ みちびく', meaning: { en: 'lead it into the open water on the right' },
        note: { jp: 'メモ ： 「{杭|くい} の {周|まわ}り は {糸|いと} が {絡|から}みやすい 。 {港|みなと} の {開|ひら}けた ほう へ {導|みちび}けば 、 {魚|さかな} も あばれずに {済|す}む 。」', en: 'Note: "Lines tangle easily around the post. Lead it toward the open harbour and the fish won\'t need to thrash either."' },
        prompt: { en: 'What does the note ask?' },
        options: [
          { jp: '{開|ひら}けた {右|みぎ} へ {導|みちび}く 。', ok: true },
          { jp: '{杭|くい} を {使|つか}って {魚|さかな} を {止|と}める 。', ok: false, why: no('絡みやすい: around the post is where lines tangle.') },
          { jp: '{魚|さかな} を あばれさせて 、 {疲|つか}れさせる 。', ok: false, why: no('The note says leading it to open water spares it from thrashing (あばれずに済む).') },
        ], explain: { jp: '〜 やすい ・ 〜 ずに {済|す}む', en: '“Easy to tangle” there; “spared from thrashing” here.' } }),
    } });

  S({ id: 'H03', site: 'fish.saltglass.harbor', intent: 'left', title: { jp: '{右|みぎ} に {隣|となり} の {糸|いと}', en: 'A neighbour\'s line' },
    scene: { en: 'Another line from along the quay enters the water just to your right. The water on the left is clear.' },
    rule: { jp: '{隣|となり} の {糸|いと} と {絡|から}ませない 。', en: 'Don\'t tangle with the neighbouring line.' },
    misread: { en: 'Read this encounter instead of repeating H02.' },
    stage: { neighbour: 'right' },
    tasks: {
      F: W({ item: 'v:左', answer: 'ひだり', accept: LEFT, reading: 'ひだり', meaning: { en: 'left' },
        teach: { title: 'ひだり — left', jp: 'ひだり', en: 'ひだり (hidari): left.' },
        prompt: { en: 'The other line is on the right. Write “left”.' },
        others: [O.right, O.wait], explain: { jp: 'となり の いと から はなれて 、 ひだり へ', en: 'Away from the other line: left.' } }),
      E: W({ item: 'v:左', answer: 'ひだり', accept: LEFT, reading: 'ひだり', meaning: { en: 'left' },
        prompt: { en: 'A neighbouring line is in the water on your right. Which way do you guide yours? Write the direction in Japanese.' },
        others: [O.right, O.wait, O.pull], explain: { jp: '{左|ひだり} ＝ left', en: 'Not H02\'s answer this time: the clear side is left.' } }),
      I: CH({ item: 'g:v_naide_kudasai', reading: 'ひだり へ', meaning: { en: 'to the left (please don\'t go toward the neighbour)' },
        note: { jp: 'はり{紙|がみ} ： 「{隣|となり} の {糸|いと} が ある ほう へ は 、 {寄|よ}せないで ください 。」 ／ {隣|となり} の {糸|いと} は {右|みぎ} に ある 。', en: 'Notice: "Please don\'t bring your line toward a neighbouring line." / The neighbouring line is on the right.' },
        prompt: { en: 'Which way do you guide your line?' },
        options: [
          { jp: '{左|ひだり} へ', ok: true },
          { jp: '{右|みぎ} へ', ok: false, why: no('ないでください: please don\'t — toward the neighbour, who is on the right.') },
          { jp: '{隣|となり} の {糸|いと} に {結|むす}ぶ', ok: false, why: no('The notice asks you to keep clear, not to join the lines.') },
        ], explain: { jp: '〜 ないで ください ＝ please don\'t …', en: 'A polite prohibition: keep to the left.' } }),
      A: CH({ item: 'g:counters', reading: 'ひだり へ よせて あいだ を あける', meaning: { en: 'move left and leave at least a rod\'s length' },
        note: { jp: 'はり{紙|がみ} ： 「{隣|となり} と の {間|あいだ} は 、 {竿|さお} {一本|いっぽん} {分|ぶん} {以上|いじょう} {空|あ}ける こと 。」 ／ {右|みぎ} の {糸|いと} まで 、 {竿|さお} {一本|いっぽん} {分|ぶん} も ない 。', en: 'Notice: "Leave at least a rod\'s length between you and your neighbour." / The line on the right is less than a rod\'s length away.' },
        prompt: { en: 'What does the notice mean for you now?' },
        options: [
          { jp: '{左|ひだり} へ {寄|よ}せて 、 {間|あいだ} を {空|あ}ける 。', ok: true },
          { jp: '{右|みぎ} へ {寄|よ}せる 。', ok: false, why: no('以上空ける: at least a rod\'s length — the right is already closer than that.') },
          { jp: '{竿|さお} を もう {一本|いっぽん} {出|だ}す 。', ok: false, why: no('竿一本分 is a measure of distance (one rod\'s length), not a number of rods.') },
        ], explain: { jp: '〜 {分|ぶん} ・ 〜 {以上|いじょう}', en: '一本分: the length of one rod; 以上: or more.' } }),
    } });

  S({ id: 'H04', site: 'fish.saltglass.harbor', intent: 'patch', title: { jp: '{二|ふた}つ の {目印|めじるし}', en: 'Two floating markers' },
    scene: { en: 'Two floating markers bob in the harbour, both painted the same red. Each carries a small tag.' },
    rule: { jp: 'この {記録|きろく} は 、 {波|なみ} の {静|しず}か な ところ で とる 。', en: 'Take this record where the water is calm.' },
    misread: { en: 'The marker\'s meaning, not its colour alone, identifies the patch.' },
    stage: { markers: true },
    tasks: {
      F: CH({ item: 'v:静か', reading: 'なみ しずか', meaning: { en: 'calm water' }, labels: { a: 'なみ しずか', b: 'なみ たかい' },
        teach: { title: 'しずか / たかい — calm / high', jp: 'なみ しずか ・ なみ たかい', en: 'なみ (nami): waves. しずか (shizuka): calm, quiet. たかい (takai): high. Both markers are red: read the tags.' },
        prompt: { en: 'The note asks for calm water. Both markers are red. Which tag marks the place?' },
        options: [
          { jp: 'なみ しずか', ok: true },
          { jp: 'なみ たかい', ok: false, why: no('たかい means high — high waves.') },
        ], explain: { jp: 'しずか ＝ calm', en: 'The tag, not the colour, tells you.' } }),
      E: CH({ item: 'v:静か', reading: 'なみ が しずか', meaning: { en: 'where the waves are calm' }, labels: { a: '{波|なみ} {静|しず}か', b: '{波|なみ} {高|たか}い' },
        prompt: { en: 'The note asks for calm water. Both markers are the same red. Which marker do you cast to?' },
        options: [
          { jp: '「{波|なみ} {静|しず}か」 の {目印|めじるし}', ok: true },
          { jp: '「{波|なみ} {高|たか}い」 の {目印|めじるし}', ok: false, why: no('高い: high. That tag marks rough water.') },
          { jp: '{赤|あか}い {目印|めじるし}', ok: false, why: no('Both are red: colour can\'t tell them apart.') },
        ], explain: { jp: '{静|しず}か ＝ calm', en: 'Same colour, different tags: read the tag.' } }),
      I: CH({ item: 'g:v_yasui_nikui', reading: 'しずか と かかれた ほう', meaning: { en: 'the marker tagged “calm”' }, labels: { a: '{静|しず}か', b: '{波|なみ} {高|たか}い' },
        note: { jp: 'メモ ： 「{波|なみ} が {高|たか}い ところ で は {浮|う}き が {見|み}えにくい ので 、 {静|しず}か な ほう を {使|つか}う 。」', en: 'Note: "Where the waves are high the float is hard to see, so use the calm side."' },
        prompt: { en: 'Both markers are red. Which do you use?' },
        options: [
          { jp: '「{静|しず}か」 と {書|か}かれた {目印|めじるし} の ほう', ok: true },
          { jp: '{赤|あか}い {目印|めじるし} の ほう', ok: false, why: no('Both markers are red: colour alone can\'t tell them apart. Read the tags.') },
          { jp: '「{波|なみ} {高|たか}い」 の ほう', ok: false, why: no('見えにくい: high waves make the float hard to see.') },
        ], explain: { jp: '〜 にくい ＝ hard to …', en: 'The reason points to the calm tag.' } }),
      A: CH({ item: 'g:comp_yori_hou', reading: 'うちがわ の めじるし', meaning: { en: 'the marker tagged “inside”: calmer than the outside' }, labels: { a: '{内側|うちがわ}', b: '{外側|そとがわ}' },
        note: { jp: 'メモ ： 「{桟橋|さんばし} の {内側|うちがわ} は 、 {外側|そとがわ} より {波|なみ} が {穏|おだ}やか だ 。 {穏|おだ}やか な ほう で {記録|きろく} を とる こと 。」', en: 'Note: "Between the piers the waves are gentler than outside them. Take the record on the gentle side."' },
        prompt: { en: 'The two red markers are tagged 内側 and 外側. Which do you use?' },
        options: [
          { jp: '「{内側|うちがわ}」 の {目印|めじるし}', ok: true },
          { jp: '「{外側|そとがわ}」 の {目印|めじるし}', ok: false, why: no('より: the inside is gentler THAN the outside.') },
          { jp: 'どちら も {赤|あか}い ので 、 {同|おな}じ だ 。', ok: false, why: no('The colour is the same; what the tags mean is not.') },
        ], explain: { jp: 'A は B より 〜', en: 'A comparison: inside is calmer than outside.' } }),
    } });

  S({ id: 'H05', site: 'fish.saltglass.harbor', intent: 'lift', title: { jp: 'まっすぐ に なった {糸|いと}', en: 'The line goes straight' },
    scene: { en: 'The line runs taut and straight from the rod tip down into the water.' },
    rule: { jp: '{糸|いと} が まっすぐ に なったら 、 そっと {上|あ}げる 。', en: 'Once the line goes straight, lift gently.' },
    misread: { en: 'Read the condition and the present state together.' },
    stage: { taut: true },
    tasks: {
      F: CH({ item: 'v:上げる', reading: 'あげる', meaning: { en: 'lift' },
        teach: { title: 'あげる / まつ — lift / wait', jp: 'あげる ・ まつ', en: 'あげる (ageru): to lift. まつ (matsu): to wait. The note: once the line is straight, lift.' },
        prompt: { en: 'The line is straight now. Which do you do?' },
        options: [
          { jp: 'あげる', ok: true },
          { jp: 'まつ', ok: false, why: no('The line is already straight: the note\'s moment has come.') },
        ], explain: { jp: 'そっと あげる', en: 'Straight line: lift gently.' } }),
      E: CH({ item: 'v:上げる', reading: 'はい 、 あげます', meaning: { en: 'yes — lift' },
        prompt: { en: 'The note says: once the line goes straight, lift gently. Look at the line. Is it time?' },
        options: [
          { jp: 'はい 、 もう まっすぐ です 。 {上|あ}げます 。', ok: true },
          { jp: 'いいえ 、 まだ です 。 {待|ま}ちます 。', ok: false, why: no('The line is already straight: it is time.') },
        ], explain: { jp: 'まっすぐ ＝ straight', en: 'The condition and the scene match.' } }),
      I: CH({ item: 'g:prt_kara_made', reading: 'そっと あげる', meaning: { en: 'lift gently now' },
        note: { jp: 'メモ ： 「{糸|いと} が まっすぐ に なる まで は {上|あ}げない 。」 ／ {糸|いと} は いま まっすぐ だ 。', en: 'Note: "Don\'t lift until the line goes straight." / The line is straight now.' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: 'そっと {上|あ}げる 。', ok: true },
          { jp: 'まだ {上|あ}げない 。', ok: false, why: no('まで: not UNTIL it straightens — and it now has.') },
          { jp: '{糸|いと} を {緩|ゆる}める 。', ok: false, why: no('Slackening would undo the straight line the note waits for.') },
        ], explain: { jp: '〜 まで は 〜 ない ＝ not until …', en: 'The “until” has arrived.' } }),
      A: CH({ item: 'g:temo', reading: 'いま あげる', meaning: { en: 'it is no longer slack: lift now' },
        note: { jp: 'メモ ： 「{糸|いと} が たるんで いる うち は 、 {上|あ}げて も {意味|いみ} が ない 。」 ／ {糸|いと} は もう まっすぐ に {張|は}って いる 。', en: 'Note: "While the line is slack, there is no point lifting." / The line is now drawn straight.' },
        prompt: { en: 'What follows?' },
        options: [
          { jp: 'もう たるんで いない ので 、 {今|いま} {上|あ}げる 。', ok: true },
          { jp: 'たるんで いる うち に 、 {急|いそ}いで {上|あ}げる 。', ok: false, why: no('うちは…ても意味がない: lifting while slack is pointless — and it isn\'t slack now anyway.') },
          { jp: '{意味|いみ} が ない ので 、 {釣|つ}り を やめる 。', ok: false, why: no('The note only says lifting WHILE SLACK is pointless.') },
        ], explain: { jp: '〜 うち は 〜 て も {意味|いみ} が ない', en: 'While X, doing Y is pointless — X is over.' } }),
    } });

  S({ id: 'H06', site: 'fish.saltglass.harbor', intent: 'closefirst', title: { jp: 'まだ {遠|とお}い {魚|さかな}', en: 'Still far out' },
    scene: { en: 'The fish is still out in the harbour, some way from the quay.' },
    rule: { jp: '「{寄|よ}せる」 は {近|ちか}く へ {連|つ}れて くる こと 。 「{上|あ}げる」 は {水|みず} から {出|だ}す こと 。 {寄|よ}せて から {上|あ}げる 。', en: '“Yoseru” is bringing it near; “ageru” is lifting it out of the water. Bring it near, then lift.' },
    misread: { en: 'The sequence has an intermediate step.' },
    stage: { far: true },
    tasks: {
      F: CH({ item: 'v:寄せる', reading: 'よせる', meaning: { en: 'bring closer' },
        teach: { title: 'よせる / あげる', jp: 'よせる ・ あげる', en: 'よせる (yoseru): bring it near. あげる (ageru): lift it out. First よせる, then あげる.' },
        prompt: { en: 'The fish is still far out. Which comes first?' },
        options: [
          { jp: 'よせる', ok: true },
          { jp: 'あげる', ok: false, why: no('あげる comes second — the fish is still far away.') },
        ], explain: { jp: 'よせて から あげる', en: 'Near first, then up.' } }),
      E: OR({ item: 'g:v_te_kara', reading: 'まず よせて から あげる', meaning: { en: 'first bring it near, then lift' },
        prompt: { en: 'Put the steps in order: first bring it near, then lift it out.' },
        tiles: ['まず', '{寄|よ}せて', 'から', '{上|あ}げる'],
        answer: ['まず', '{寄|よ}せて', 'から', '{上|あ}げる'],
        orderHint: { en: 'まず (first), the て-form, then から, and the final verb last.' },
        explain: { jp: '〜 て から ＝ after …', en: 'まず寄せてから上げる: bring it near first, then lift.' } }),
      I: CH({ item: 'g:v_te_kara', reading: 'まず よせる', meaning: { en: 'bring it closer first' },
        note: { jp: 'メモ ： 「{寄|よ}せて から {上|あ}げる 。」 ／ {魚|さかな} は まだ {波止場|はとば} から {遠|とお}い 。', en: 'Note: "Bring it near, then lift." / The fish is still far from the quay.' },
        prompt: { en: 'What do you do now?' },
        options: [
          { jp: 'まず {寄|よ}せる 。', ok: true },
          { jp: 'すぐ {上|あ}げる 。', ok: false, why: no('てから: lifting comes AFTER bringing it near — it is still far.') },
          { jp: '{寄|よ}せずに {待|ま}つ 。', ok: false, why: no('The note\'s first step is to bring it near.') },
        ], explain: { jp: '〜 て から', en: 'Step one now; step two later.' } }),
      A: CH({ item: 'g:adv_kanenai', reading: 'さき に よせて から あげる', meaning: { en: 'bring it near first; lifting from far out could snap the line' },
        note: { jp: 'メモ ： 「{遠|とお}く から {無理|むり} に {抜|ぬ}き{上|あ}げよう と する と 、 {糸|いと} が {切|き}れかねない 。」', en: 'Note: "Trying to force it up and out from far away could well snap the line."' },
        prompt: { en: 'What follows from the note?' },
        options: [
          { jp: '{先|さき} に {近|ちか}く へ {寄|よ}せて から 、 {上|あ}げる 。', ok: true },
          { jp: '{遠|とお}く から {一気|いっき} に {抜|ぬ}き{上|あ}げる 。', ok: false, why: no('かねない: that could well snap the line.') },
          { jp: '{糸|いと} は {切|き}れない ので 、 どちら で も いい 。', ok: false, why: no('かねない warns it COULD happen; it is not a reassurance.') },
        ], explain: { jp: '〜 かねない ＝ could well …', en: 'A warning of a likely bad outcome.' } }),
    } });
})(RB.fishing);
