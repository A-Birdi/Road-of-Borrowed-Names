/* "Things I Can Do" (expansion L5, A58): abilities, not scores. Each statement names the learning items whose evidence
 * shows it (src/learn/40_evidence.js); it is "shown" once those were used successfully, without counting help, in two
 * or more kinds of place, "begun" after one. Grouped as the Hall of a Hundred Tales' ten themes. Inspired by the can-do
 * descriptions of Japanese teaching (the Japan Foundation's approach), named as inspiration only: never a
 * certification, never a JLPT level (spec line 170). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (id, en, jp) => ({ id, en, jp });
  C.canDoThemes = [
    T('ways', 'Directions, signs and asking again', '{道|みち} と {張|は}り{紙|がみ}'),
    T('giving', 'Who gives what to whom', 'あげる ・ もらう'),
    T('time', 'Sequence and timing', '{順番|じゅんばん} と {時|とき}'),
    T('asking', 'Requests, permission and intention', 'お{願|ねが}い'),
    T('reasons', 'Reasons and contrasts', '{理由|りゆう}'),
    T('conditions', 'Conditions and exceptions', 'もし'),
    T('reference', 'What is meant, without saying it', '{省略|しょうりゃく}'),
    T('reports', 'Reports, evidence and uncertainty', '{伝|つた}える'),
    T('register', 'Register and relationship', '{丁寧|ていねい}さ'),
    T('everyday', 'Everyday things', '{毎日|まいにち}'),
  ];
  const S = (id, theme, en, items) => ({ id, theme, en, items });
  C.canDo = [
    // directions, signs, asking again
    S('read_signs', 'ways', 'I can read simple signs and labels', ['v:入口', 'v:出口', 'v:右', 'v:左', 'g:prt_ni', 'g:prt_he']),
    S('follow_dir', 'ways', 'I can follow simple directions', ['v:右', 'v:左', 'v:まっすぐ', 'g:v_te', 'g:prt_wo']),
    S('give_dir', 'ways', 'I can tell someone which way to go', ['g:v_te_kudasai', 'v:右', 'v:左', 'g:prt_ni']),
    S('ask_again', 'ways', 'I can ask someone to say it again, slower or more simply', ['c:ask_back']),
    S('notice_simple', 'ways', 'I can explain a notice in simpler words', ['c:ws_paraphrase', 'v:入口', 'g:prt_kara_made']),
    S('where_is', 'ways', 'I can ask where something is', ['g:exist_aru_iru', 'g:qword_ka_mo', 'g:kosoado']),
    // giving
    S('send', 'giving', 'I can say who sends something to whom', ['g:prt_ni', 'g:prt_wo', 'g:prt_ga']),
    S('receive', 'giving', 'I can say what I or someone else received', ['g:giving']),
    S('favour', 'giving', 'I can thank someone for a favour done for me', ['g:te_giving']),
    S('gift', 'giving', 'I can offer a small gift and say why', ['g:giving', 'g:conj_kara']),
    S('borrow', 'giving', 'I can ask to borrow something and promise to return it', ['g:v_temo_ii', 'g:giving']),
    S('deliver', 'giving', 'I can hand something over with the right words', ['g:v_te_kudasai', 'g:giving']),
    // time
    S('order_events', 'time', 'I can tell what happened first and next', ['g:v_te_kara', 'g:mae_ato']),
    S('when', 'time', 'I can say when something happens', ['g:toki', 'g:prt_ni']),
    S('until', 'time', 'I can say from when and until when', ['g:prt_kara_made']),
    S('while', 'time', 'I can say two things happen at once', ['g:v_nagara']),
    S('already', 'time', 'I can say something is already done, or done ahead', ['g:te_shimau', 'g:te_oku']),
    S('plans', 'time', 'I can talk about plans and intentions', ['g:tsumori', 'g:v_volitional']),
    // asking
    S('request', 'asking', 'I can ask someone to do something politely', ['g:v_te_kudasai']),
    S('dont', 'asking', 'I can ask someone not to do something', ['g:v_naide_kudasai']),
    S('may_i', 'asking', 'I can ask permission', ['g:v_temo_ii']),
    S('suggest', 'asking', 'I can suggest doing something together', ['g:v_mashou', 'g:v_volitional']),
    S('want', 'asking', 'I can say what I want to do', ['g:v_tai']),
    S('must', 'asking', 'I can say what has to be done', ['g:v_nakereba']),
    // reasons
    S('because', 'reasons', 'I can give a reason', ['g:conj_kara', 'g:conj_node']),
    S('but', 'reasons', 'I can set two things against each other', ['g:conj_kedo_ga']),
    S('even_though', 'reasons', 'I can say something happened in spite of something else', ['g:noni', 'g:temo']),
    S('reasons_add', 'reasons', 'I can give more than one reason', ['g:prt_shi']),
    S('compare', 'reasons', 'I can compare two things', ['g:comp_yori_hou']),
    S('purpose', 'reasons', 'I can say what something is for', ['g:tame']),
    // conditions
    S('if', 'conditions', 'I can say what happens if', ['g:cond_tara', 'g:cond_ba', 'g:cond_to']),
    S('if_so', 'conditions', 'I can pick up what someone said with "if that\'s so"', ['g:cond_nara']),
    S('only', 'conditions', 'I can say "only" and "nothing but"', ['g:prt_dake_shika']),
    S('even', 'conditions', 'I can say "even" for something unexpected', ['g:prt_sae', 'g:prt_mo']),
    S('decide', 'conditions', 'I can say what was decided', ['g:koto_ni_suru', 'g:koto_ni_naru']),
    S('change', 'conditions', 'I can say how something came to be', ['g:you_ni_naru', 'g:adj_naru']),
    // reference
    S('this_that', 'reference', 'I can point to things near and far', ['g:kosoado']),
    S('left_out', 'reference', 'I can follow who is meant when it isn\'t said', ['c:ws_reference']),
    S('the_one', 'reference', 'I can describe a person or thing with a whole clause', ['g:relative_clause']),
    S('nominal', 'reference', 'I can turn an action into a thing to talk about', ['g:nominalizer']),
    S('explain_n', 'reference', 'I can explain or ask about a situation', ['g:n_desu']),
    S('topic', 'reference', 'I can mark what I am talking about', ['g:prt_wa', 'g:prt_ga']),
    // reports
    S('hearsay', 'reports', 'I can pass on something I heard', ['g:sou_hear']),
    S('seems', 'reports', 'I can say how something looks to me', ['g:sou_look', 'g:you_mitai']),
    S('rumour', 'reports', 'I can pass on a rumour as a rumour', ['g:rashii']),
    S('should_be', 'reports', 'I can say what should be so', ['g:hazu']),
    S('maybe', 'reports', 'I can say what might be so', ['g:kamo', 'g:deshou']),
    S('quote', 'reports', 'I can say what someone said', ['g:prt_tte']),
    // register
    S('polite_plain', 'register', 'I can speak politely or plainly, as fits', ['g:register_polite_plain']),
    S('humble', 'register', 'I can make a very polite request', ['g:keigo_kenjo']),
    S('respect', 'register', 'I can understand respectful speech about others', ['g:keigo_sonkei']),
    S('soft_no', 'register', 'I can refuse politely without saying no outright', ['g:indirectness']),
    S('casual', 'register', 'I can follow casual, contracted speech', ['g:casual_contractions']),
    S('endings', 'register', 'I can hear what sentence endings add', ['g:sentence_final', 'g:prt_yo_ne']),
    // everyday
    S('numbers', 'everyday', 'I can count things and pay', ['g:counters']),
    S('describe', 'everyday', 'I can describe things', ['g:adj_i', 'g:adj_na', 'g:adj_te']),
    S('can_do', 'everyday', 'I can say what I can and can\'t do', ['g:v_potential']),
    S('experience', 'everyday', 'I can say what I have done before', ['g:v_koto_ga_aru']),
    S('too_much', 'everyday', 'I can say something is too much, or easy or hard to do', ['g:v_sugiru', 'g:v_yasui_nikui']),
    S('try', 'everyday', 'I can say I\'ll try something', ['g:te_miru']),
  ];
})(RB.content);
