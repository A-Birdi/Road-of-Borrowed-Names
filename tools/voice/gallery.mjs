// VA-1: the listening gallery (§13). Writes review.html beside the audition's audio, with everything it shows embedded
// (no JSON fetched, no key, no engine, no network): every case of the frozen corpus, every configuration's cell for it
// in its real state, and a player for whatever audio exists. Cells without audio say why (blocked, not generated);
// nothing is shown as heard unless a person recorded it in the page's score sheet.
//   node tools/voice/gallery.mjs [--out voice-audition/VA1/<revision>] [--results <file>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCorpus, loadCast, anchorsOf } from './audition.mjs';
import { PROVIDERS, ORDER } from './providers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const INVENTORY = path.join(ROOT, 'docs/future/voice/inventory/provider_inventory.json');

export function galleryData(opts = {}) {
  const { corpus, revision } = loadCorpus(opts.corpus);
  const dir = path.resolve(opts.out || path.join(ROOT, 'voice-audition', 'VA1', revision));
  const resF = opts.results || path.join(dir, 'results.json');
  const results = fs.existsSync(resF) ? JSON.parse(fs.readFileSync(resF, 'utf8')).records : [];
  const inv = fs.existsSync(INVENTORY) ? JSON.parse(fs.readFileSync(INVENTORY, 'utf8')) : { configurations: [] };
  const configs = ORDER.map((id) => {
    const i = (inv.configurations || []).find((x) => x.configurationId === id) || {};
    const cast = loadCast(id, opts.castDir ? path.join(opts.castDir, id + '.json') : null);
    return {
      id, label: PROVIDERS[id].label, availability: i.availability || 'not_checked', reason: i.reason || null, model: (cast && cast.pinned && cast.pinned.modelId) || null,
      cast: cast ? Object.fromEntries(Object.entries(cast.roles).map(([r, v]) => [r, { selected: v.selected, candidates: (v.candidates || []).map((x) => ({ label: x.label, why: x.pickedBecause || null })), discarded: v.discarded || [] }])) : {},
    };
  });
  const cases = corpus.cases.map((c) => ({
    id: c.caseId, group: c.group, role: c.castingProfile, delivery: c.deliveryLabel, direction: c.direction, dialect: c.dialectVariant, pair: c.sharedTextGroup,
    control: c.neutralControl, text: c.spokenText, en: c.translationEn, tokens: c.readingTokens, overrides: c.pronunciationOverrides.map((o) => o.surface + ' → ' + o.reading),
    spoiler: c.spoilerLevel, kind: c.sourceKind, situation: c.speechLine.context.situation, listener: c.speechLine.context.listener, identity: c.speakerIdentity, anchor: c.screeningCandidate,
  }));
  const rel = (p) => (p ? path.relative(dir, path.join(dir, p)).split(path.sep).join('/') : null);
  // results are append-only: per take attempt, the latest record with audio (else the latest record) is shown, with
  // how many tries it took; a first take and its repair are two attempts, each with its own audio hash and its own key
  // for scores, the listened mark and a pick, so a repair never inherits the first take's approval
  const byAttempt = new Map();
  for (const r of results) {
    const k = r.configurationId + '|' + r.takeId + '|' + r.attempt;
    const list = byAttempt.get(k) || [];
    list.push(r);
    byAttempt.set(k, list);
  }
  const takes = [...byAttempt.values()].map((list) => {
    const r = list.filter((x) => x.audioOriginalPath).pop() || list[list.length - 1];
    return {
      config: r.configurationId, take: r.takeId, case: r.caseId, takeKind: r.takeKind, kind: r.kind, voice: r.voiceId, attempt: r.attempt, status: r.status, blocked: r.blockedReason,
      key: r.configurationId + '|' + r.takeId + '|a' + r.attempt + '|' + (r.audioSha256 ? r.audioSha256.slice(0, 16) : 'no-audio'), sha: r.audioSha256 || null,
      tries: list.length, model: r.modelId || null, usd: r.usage && r.usage.countedUsd != null ? r.usage.countedUsd : null,
      audio: rel(r.audioOriginalPath), seconds: r.actualDurationSeconds,
      validation: r.requestValidation ? r.requestValidation.status : 'not_run', acceptance: r.providerAcceptance ? r.providerAcceptance.status : 'not_sent',
      tech: r.technicalCheck && { status: r.technicalCheck.status, flags: r.technicalCheck.flags || [], failures: r.technicalCheck.failures || [], readings: r.technicalCheck.readings || [] },
      direction: r.directionChannel, reading: r.readingChannel, notApplied: r.readingsNotApplied || [], unsupported: r.unsupportedControls || [], listened: r.listeningReview, repairOf: r.repairOf, repairReason: r.repairReason,
    };
  });
  const screen = [...new Set(corpus.cases.map((c) => c.castingProfile))].map((r) => ({ role: r, anchors: anchorsOf(corpus, r).map((c) => c.caseId) }));
  return { dir, data: { revision, built: new Date().toISOString(), corpusStatus: corpus.status, accounting: corpus.accounting, configs, cases, takes, screen } };
}

const PAGE = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VA-1 Audition Gallery</title>
<style>
:root{--bg:#f6f1e7;--paper:#fffdf8;--ink:#2a2420;--muted:#6d6257;--line:#ddd2c2;--accent:#8a3b2a;--ok:#2f6b3e;--warn:#9a6a12;--bad:#a1322a;--chip:#efe6d6;--focus:#c2662f;
--jp:"Hiragino Mincho ProN","Yu Mincho","YuMincho","Noto Serif JP","Noto Serif CJK JP",serif;--ui:system-ui,-apple-system,"Segoe UI",Roboto,"Hiragino Sans","Noto Sans JP",sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#1d1916;--paper:#26211d;--ink:#ece3d6;--muted:#a99c8c;--line:#3d352e;--accent:#e08d6f;--ok:#7fc08f;--warn:#e0b25a;--bad:#f08a80;--chip:#332c26;--focus:#f0a070;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#1d1916;--paper:#26211d;--ink:#ece3d6;--muted:#a99c8c;--line:#3d352e;--accent:#e08d6f;--ok:#7fc08f;--warn:#e0b25a;--bad:#f08a80;--chip:#332c26;--focus:#f0a070;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 var(--ui)}
.wrap{max-width:980px;margin:0 auto;padding-inline:16px;padding-block:18px 80px}
h1{font:600 1.5rem/1.2 var(--ui);margin:0 0 4px;text-wrap:balance}
h2{font:600 1.15rem/1.3 var(--ui);margin:32px 0 10px;padding-top:10px;border-top:2px solid var(--line);text-wrap:balance}
.lede{color:var(--muted);max-width:68ch;margin:0 0 12px}
.bar{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:8px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
button,select,input,textarea{font:inherit;color:inherit}
button,select{background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:5px 10px;min-height:34px;cursor:pointer}
button:hover{border-color:var(--accent)}
:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.now{font-size:.9rem;color:var(--muted);flex:1 1 220px;min-width:0}
.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:12px 0}
.summary div{background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:8px 10px}
.summary b{display:block;font-size:1.25rem;font-variant-numeric:tabular-nums}
.summary span{font-size:.8rem;color:var(--muted)}
.cfgs{display:grid;gap:6px;margin:8px 0 0;padding:0;list-style:none}
.cfgs li{background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:.9rem}
.card{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:10px 0;scroll-margin-top:64px}
.card:focus{outline:2px solid var(--focus)}
.head{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:baseline}
.id{font:600 .85rem/1 var(--ui);letter-spacing:.04em;color:var(--accent)}
.delivery{font-weight:600}
.chip{display:inline-block;background:var(--chip);border-radius:999px;padding:1px 8px;font-size:.75rem;color:var(--muted)}
.jp{font:1.3rem/2.1 var(--jp);margin:6px 0 2px;overflow-wrap:anywhere}
.jp rt{font-size:.5em;color:var(--muted)}
.en{color:var(--muted);margin:0 0 6px}
.dir{font-size:.9rem;margin:0 0 6px}
.dir em{font-style:normal;color:var(--muted)}
.cells{display:grid;gap:6px;margin-top:8px}
.cell{display:grid;grid-template-columns:minmax(0,11rem) minmax(0,1fr);gap:4px 10px;border-top:1px dashed var(--line);padding-top:6px;font-size:.88rem}
.cell .who{font-weight:600;min-width:0;overflow-wrap:anywhere}
.cell .what{min-width:0}
.states{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:3px}
.st{border:1px solid var(--line);border-radius:4px;padding:0 6px;font-size:.75rem;white-space:nowrap}
.st.ok{color:var(--ok);border-color:currentColor}.st.warn{color:var(--warn);border-color:currentColor}.st.bad{color:var(--bad);border-color:currentColor}.st.off{color:var(--muted)}
.note{color:var(--muted);font-size:.82rem;overflow-wrap:anywhere}
.flags{color:var(--warn);font-size:.82rem;margin:2px 0 0;padding-left:18px}
.spoil{border:1px dashed var(--line);border-radius:8px;padding:10px;color:var(--muted)}
details.score{margin-top:4px}
details.score summary{cursor:pointer;color:var(--accent);font-size:.85rem}
.grid5{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px;margin:6px 0}
.grid5 label{display:flex;flex-direction:column;font-size:.8rem;color:var(--muted)}
textarea{width:100%;min-height:3em;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:4px}
.reel{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0 4px;font-size:.9rem}
.reel label{display:flex;gap:4px;align-items:center;min-width:0;max-width:100%}
.reel select,.bar select{max-width:100%;min-width:0}
.hidden{display:none!important}
@media (max-width:560px){.cell{grid-template-columns:minmax(0,1fr)}.jp{font-size:1.15rem}}
</style>
</head>
<body>
<div class="wrap">
<h1>VA-1 Audition Gallery</h1>
<p class="lede" id="lede"></p>
<div class="bar" role="toolbar" aria-label="Player">
  <button id="stop" title="Stop (Esc)">■ Stop</button>
  <button id="replay" title="Replay (r)">↺ Replay</button>
  <button id="prev" title="Previous case (p)">↑ Prev case</button>
  <button id="next" title="Next case (n)">↓ Next case</button>
  <label><select id="filter" aria-label="Show"><option value="all">All cells</option><option value="audio">Cells with audio</option><option value="incomplete">Incomplete cells</option><option value="flagged">Flagged or failed</option></select></label>
  <label><input type="checkbox" id="blind"> Blind labels</label>
  <span class="now" id="now" aria-live="polite">Nothing playing.</span>
</div>
<div class="summary" id="summary"></div>
<h2 id="h-configs">Configurations</h2>
<ul class="cfgs" id="configs"></ul>
<div id="sections"></div>
<h2 id="h-scores">Score sheet</h2>
<p class="lede">Scores stay in this browser until you export them. They are audition notes, not a game save. Fill a dimension only after listening; leave it empty if you could not judge it. The total appears only when all five are filled.</p>
<div class="reel"><label>Reviewer <input id="reviewer" size="14" autocomplete="off"></label><label>Japanese review level <select id="level"><option value="unassessed">unassessed</option><option value="learner">learner</option><option value="fluent">fluent, non-native</option><option value="native">native speaker</option></select></label></div>
<div class="reel"><button id="export">Export scores (CSV)</button><button id="copy">Copy CSV</button><span class="note" id="scoreNote"></span></div>
<textarea id="csvOut" class="hidden" rows="6" aria-label="Scores CSV"></textarea>
</div>
<script id="data" type="application/json">__DATA__</script>
<script>
(function(){
var D=JSON.parse(document.getElementById('data').textContent);
var $=function(s,r){return (r||document).querySelector(s)}, el=function(t,a,h){var e=document.createElement(t);if(a)for(var k in a){if(k==='class')e.className=a[k];else e.setAttribute(k,a[k]);}if(h!=null)e.innerHTML=h;return e;};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
var WEIGHTS={pronunciation:.30,prosody:.25,identityFit:.20,delivery:.15,cleanliness:.10};
var store={get:function(){try{return JSON.parse(localStorage.getItem('rbn-va1-scores-'+D.revision)||'{}');}catch(e){return {};}},set:function(v){try{localStorage.setItem('rbn-va1-scores-'+D.revision,JSON.stringify(v));}catch(e){}}};
var scores=store.get();var meta=scores._meta||{};delete scores._meta;
function save(){var o={};for(var k in scores)o[k]=scores[k];o._meta=meta;store.set(o);}
var cfgBy={};D.configs.forEach(function(c,i){c.blind='Take '+String.fromCharCode(65+i);cfgBy[c.id]=c;});
var revealed={};
function ruby(text,tokens){var out='',i=0,toks=(tokens||[]).slice();var used=[];
  while(i<text.length){var hit=null;for(var k=0;k<toks.length;k++){var t=toks[k];if(used[k])continue;if(text.substr(i,t.surface.length)===t.surface){hit=k;break;}}
    if(hit!=null){used[hit]=1;var t2=toks[hit];out+='<ruby>'+esc(t2.surface)+'<rt>'+esc(t2.reading)+'</rt></ruby>';i+=t2.surface.length;}else{out+=esc(text[i]);i++;}}
  return out;}
function takesFor(caseId,kind){return D.takes.filter(function(t){return t.case===caseId&&(!kind||t.kind===kind);});}
function cfgName(id){return $('#blind').checked?cfgBy[id].blind:cfgBy[id].label;}
function stateChips(t,cfg){var h='';
  var access=t?(/^blocked/.test(t.status)?['bad','Blocked: '+(t.status==='blocked_rights'?'rights':'access')]:['ok','Access']):(cfg.availability==='available'?['off','Not run']:['bad','Blocked: access']);
  h+='<span class="st '+access[0]+'">'+access[1]+'</span>';
  // four kinds of evidence, never merged: the request checked, the provider's answer, measurements, a person listening
  var rv=t?({passed:['ok','Request valid'],failed:['bad','Request invalid']}[t.validation]||['off','Request not checked']):['off','Request not built'];h+='<span class="st '+rv[0]+'">'+rv[1]+'</span>';
  var pa=t?({accepted:['ok','Provider accepted'],rejected:['bad','Provider rejected'],no_audio:['bad','No audio returned'],transport_error:['bad','Transport error'],not_sent:['off','Not sent']}[t.acceptance]||['off',t.acceptance]):['off','Not sent'];h+='<span class="st '+pa[0]+'">'+pa[1]+'</span>';
  var ts=t&&t.tech?t.tech.status:'not_checked';var tc={no_anomaly_found:['ok','Measured: no anomaly'],anomaly_flagged:['warn','Measured: anomaly flagged'],unusable:['bad','Measured: unusable'],not_checked:['off','Not measured']}[ts]||['off',ts];
  h+='<span class="st '+tc[0]+'" title="Measurements can flag anomalies; they cannot show the words are right">'+tc[1]+'</span>';
  h+='<span class="st off" title="No speech recogniser: the words are checked only by listening">Words not checked</span>';
  var key=t&&t.audio?t.key:null, sc=key?scores[key]:null;
  var heard=(t&&t.audio&&t.listened&&t.listened.status!=='not_listened')||(sc&&sc.listened);h+='<span class="st '+(heard?'ok':'off')+'"'+(key?' data-heard="'+esc(key)+'"':'')+'>'+(heard?'Listened':'Not listened')+'</span>';
  return '<div class="states">'+h+'</div>';}
function cellHtml(c,cfg,t,label){var h='<div class="who">'+esc(cfgName(cfg.id))+(label?' · '+esc(label):'')+'</div><div class="what">'+stateChips(t,cfg);
  if(t&&t.audio){h+='<button class="play" data-src="'+esc(t.audio)+'" data-label="'+esc(c.id+' · '+(label||'')+' · ')+'" data-cfg="'+cfg.id+'">▶ Play'+(t.seconds?' ('+t.seconds.toFixed(1)+' s)':'')+'</button> ';}
  var blind=$('#blind').checked;
  if(t&&t.blocked)h+='<div class="note">'+(blind?'(reason hidden in blind mode)':esc(t.blocked))+'</div>';else if(!t)h+='<div class="note">'+(blind?'Not generated.':esc(cfg.reason||'Not generated.'))+'</div>';
  if(t&&t.audio&&!$('#blind').checked){h+='<div class="note">Direction channel: '+esc(t.direction||'—')+(t.reading?' · Readings: '+esc(t.reading):'')+(t.unsupported&&t.unsupported.length?' · Not supported: '+esc(t.unsupported.join('; ')):'')+(t.repairOf?' · Repair of '+esc(t.repairOf)+': '+esc(t.repairReason):'')+' · Attempt '+t.attempt+(t.tries>1?' ('+t.tries+' tries)':'')+' · audio '+esc((t.sha||'').slice(0,12))+(t.model?' · '+esc(t.model):'')+(t.usd!=null?' · US$'+t.usd.toFixed(5):'')+'</div>';}
  if(t&&t.tech&&(t.tech.flags.length||t.tech.failures.length))h+='<ul class="flags">'+t.tech.failures.concat(t.tech.flags).map(function(f){return '<li>'+esc(f)+'</li>';}).join('')+'</ul>';
  if(t&&t.audio)h+=scoreHtml(c,cfg,t);
  return h+'</div>';}
function scoreHtml(c,cfg,t){var key=t.key,s=scores[key]||{};var sel=function(n){var o='<option value="">—</option>';for(var i=1;i<=5;i++)o+='<option'+(String(s[n])===String(i)?' selected':'')+'>'+i+'</option>';return '<select data-k="'+key+'" data-f="'+n+'">'+o+'</select>';};
  return '<details class="score"><summary>Score this take (attempt '+t.attempt+(t.attempt>1?', the repair':'')+'; audio '+esc((t.sha||'').slice(0,8))+')</summary><div class="grid5">'+
  '<label>Pronunciation (30%)'+sel('pronunciation')+'</label><label>Phrasing (25%)'+sel('prosody')+'</label><label>Voice and role fit (20%)'+sel('identityFit')+'</label><label>Delivery (15%)'+sel('delivery')+'</label><label>Cleanliness (10%)'+sel('cleanliness')+'</label>'+
  '<label><span><input type="checkbox" data-k="'+key+'" data-f="listened"'+(s.listened?' checked':'')+'> I listened</span></label><label><span><input type="checkbox" data-k="'+key+'" data-f="hard"'+(s.hard?' checked':'')+'> Hard failure</span></label><label><span><input type="checkbox" data-k="'+key+'" data-f="pick"'+(s.pick?' checked':'')+'> Robin\'s pick</span></label></div>'+
  '<textarea data-k="'+key+'" data-f="notes" placeholder="Notes (what you heard)">'+esc(s.notes||'')+'</textarea></details>';}
function caseCard(c,opt){var card=el('section',{class:'card',tabindex:'-1',id:'case-'+c.id,'data-case':c.id});
  var hidden=(c.spoiler==='later'||c.spoiler==='sealed')&&!revealed[c.id];
  var head='<div class="head"><span class="id">'+esc(c.id)+'</span><span class="delivery">'+esc(c.delivery)+'</span>'+(c.control?'<span class="chip">with neutral control</span>':'')+(c.dialect!=='standard'?'<span class="chip">Kansai</span>':'')+(c.kind!=='game_line'?'<span class="chip">audition fixture, not in the game</span>':'')+(c.anchor?'<span class="chip">casting anchor</span>':'')+'<span class="chip">spoiler: '+esc(c.spoiler)+'</span></div>';
  if(hidden){card.innerHTML=head+'<div class="spoil">This line comes from '+(c.spoiler==='sealed'?'a sealed part of the story':'later in the story')+'. Its text, context and audio are hidden. <button class="reveal" data-case="'+esc(c.id)+'">Reveal</button></div>';return card;}
  var h=head+'<div class="jp" lang="ja">'+ruby(c.text,c.tokens)+'</div><p class="en">'+esc(c.en)+'</p><p class="dir"><em>Intended:</em> '+esc(c.direction)+'<br><em>Context:</em> '+esc(c.situation||'—')+(c.listener?' <em>Listener:</em> '+esc(c.listener):'')+(c.overrides.length?'<br><em>Reading overrides:</em> '+esc(c.overrides.join(', ')):'')+'</p><div class="cells">';
  var f=$('#filter').value;
  D.configs.forEach(function(cfg){var ts=takesFor(c.id,opt&&opt.kind).filter(function(t){return t.config===cfg.id&&(!opt||!opt.voice||t.voice===opt.voice);});
    var kinds=opt&&opt.kind==='smoke'?['directed','neutral_control']:(c.control?['directed','neutral_control']:['directed']);
    if(!ts.length){if(f==='audio'||f==='flagged')return;h+='<div class="cell">'+cellHtml(c,cfg,null,kinds.map(function(k){return k.replace('_',' ');}).join(' + '))+'</div>';return;}
    kinds.forEach(function(k){var list=k?ts.filter(function(t){return t.takeKind===k;}):ts;if(!list.length)list=[null];
      list.forEach(function(t){
        if(f==='audio'&&!(t&&t.audio))return;if(f==='incomplete'&&t&&t.audio&&t.tech&&t.tech.status==='no_anomaly_found')return;if(f==='flagged'&&!(t&&t.tech&&(t.tech.status==='anomaly_flagged'||t.tech.status==='unusable')))return;
        var label=(t?t.voice+' · ':'')+(k==='neutral_control'?'neutral control':k==='directed'?'directed':(t?t.take.split('.')[2]:''))+(t&&t.attempt>1?' · repair':'');
        h+='<div class="cell">'+cellHtml(c,cfg,t,label)+'</div>';});});});
  card.innerHTML=h+'</div>';return card;}
var GROUPS=[['narrator','Narrator (female storyteller)'],['companion','Companions'],['dialect','Suzu in Kansai (same voice, matched to SUZU01\u201305)'],['player','Player Voice A and Voice B'],['npc','NPC profiles'],['stress','Language and prosody stress tests']];
function render(){var S=$('#sections');S.innerHTML='';
  var smoke=D.takes.filter(function(t){return t.kind==='smoke';});
  if(smoke.length){S.appendChild(el('h2',{id:'h-smoke'},'Smoke checks (one line with and without its direction, before casting)'));
    var ids=[];smoke.forEach(function(t){if(ids.indexOf(t.case)<0)ids.push(t.case);});ids.forEach(function(id){var c=D.cases.find(function(x){return x.id===id;});if(c)S.appendChild(caseCard(c,{kind:'smoke'}));});}
  var groups={};D.cases.forEach(function(c){(groups[c.group]=groups[c.group]||[]).push(c);});
  Object.keys(groups).forEach(function(g){if(!GROUPS.some(function(x){return x[0]===g;}))GROUPS.push([g,g]);});
  GROUPS.forEach(function(G){var list=groups[G[0]];if(!list)return;S.appendChild(el('h2',{id:'h-'+G[0]},esc(G[1])));
    var roles=[];list.forEach(function(c){if(roles.indexOf(c.role)<0)roles.push(c.role);});
    roles.forEach(function(r){var bar=el('div',{class:'reel'});var rg=esc(r)+'" data-group="'+esc(G[0]);bar.innerHTML='<strong>'+esc(r.replace('_',' '))+'</strong> <label>Reel: <select class="reelcfg" data-role="'+rg+'">'+D.configs.map(function(c){return '<option value="'+c.id+'">'+esc(cfgName(c.id))+'</option>';}).join('')+'</select></label> <label>Takes: <select class="reeltake" data-role="'+rg+'"><option value="first">first takes</option><option value="repair">repairs where made</option></select></label> <button class="reelgo" data-role="'+rg+'">▶ Play reel</button>';S.appendChild(bar);
      list.filter(function(c){return c.role===r;}).forEach(function(c){S.appendChild(caseCard(c,{kind:'matrix'}));});});});
  S.appendChild(el('h2',{id:'h-screen'},'Casting screen (up to three voices per role, two anchor lines)'));
  D.screen.forEach(function(s){var p=el('div',{class:'card'});var h='<div class="head"><span class="id">'+esc(s.role)+'</span><span class="note">anchors '+esc(s.anchors.join(', '))+'</span></div>';
    D.configs.forEach(function(cfg){var cand=(cfg.cast[s.role]||{}).candidates||[];var ts=D.takes.filter(function(t){return t.config===cfg.id&&t.kind==='screen'&&t.take.indexOf('screen.'+s.role+'.')===0;});
      if(!cand.length&&!ts.length){if($('#filter').value==='audio'||$('#filter').value==='flagged')return;h+='<div class="cell"><div class="who">'+esc(cfgName(cfg.id))+'</div><div class="what">'+stateChips(null,cfg)+'<div class="note">No candidates listed yet'+(cfg.reason&&!$('#blind').checked?' · '+esc(cfg.reason):'')+'</div></div></div>';return;}
      cand.forEach(function(v){s.anchors.forEach(function(a){var t=ts.find(function(x){return x.take==='screen.'+s.role+'.'+v.label+'.'+a;});var c=D.cases.find(function(x){return x.id===a;});
        var f=$('#filter').value;if(f==='audio'&&!(t&&t.audio))return;if(f==='flagged'&&!(t&&t.tech&&(t.tech.status==='anomaly_flagged'||t.tech.status==='unusable')))return;if(f==='incomplete'&&t&&t.audio&&t.tech&&t.tech.status==='no_anomaly_found')return;
        if((c.spoiler==='later'||c.spoiler==='sealed')&&!revealed[c.id]){h+='<div class="cell"><div class="who">'+esc(cfgName(cfg.id))+' · '+esc(v.label+' · '+a)+'</div><div class="what"><div class="note">A '+esc(c.spoiler)+' line: reveal '+esc(a)+' in its section to play it here.</div></div></div>';return;}
        h+='<div class="cell">'+cellHtml(c,cfg,t||null,v.label+' · '+a)+'</div>';});});});
    p.innerHTML=h;$('#sections').appendChild(p);});
  // the summary
  var gen=D.takes.filter(function(t){return t.audio;}).length,passed=D.takes.filter(function(t){return t.tech&&t.tech.status==='no_anomaly_found';}).length,flag=D.takes.filter(function(t){return t.tech&&(t.tech.status==='anomaly_flagged'||t.tech.status==='unusable');}).length;
  var heard=Object.keys(scores).filter(function(k){return scores[k].listened;}).length;
  $('#summary').innerHTML=[[D.cases.length,'cases'],[D.accounting.plannedTakesPerConfiguration*D.configs.length,'planned takes (7 configurations)'],[gen,'takes generated'],[passed,'measured without anomaly (not a word check)'],[flag,'anomaly flagged or unusable'],[heard,'marked listened here']].map(function(x){return '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>';}).join('');
  var blind=$('#blind').checked;
  $('#configs').innerHTML=D.configs.map(function(c){var made=D.takes.filter(function(t){return t.config===c.id&&t.audio;}).length;return '<li><strong>'+esc(cfgName(c.id))+'</strong> · '+made+' takes with audio'+(blind?'':' · '+esc(c.model||'model not pinned yet')+' · access from the development environment: '+esc(c.availability.replace(/_/g,' '))+(c.reason?'<div class="note">'+esc(c.reason)+'</div>':''))+'</li>';}).join('')+(blind?'<li class="note">Blind mode: configurations are lettered and their details hidden until you turn it off.</li>':'');}
// one recording at a time; nothing plays until the listener acts
var audio=new Audio(),last=null,reel=null;
function play(btn){if(!btn)return;stopAll(true);last=btn;audio.src=btn.getAttribute('data-src');$('#now').textContent='Playing '+btn.getAttribute('data-label')+cfgName(btn.getAttribute('data-cfg'));
  var p=audio.play();if(p&&p.catch)p.catch(function(){$('#now').textContent='The browser did not start playback; press Play again.';});}
function stopAll(keepReel){audio.pause();try{audio.currentTime=0;}catch(e){}if(!keepReel)reel=null;$('#now').textContent='Nothing playing.';}
audio.addEventListener('ended',function(){if(reel){reel.i++;nextReel();}else $('#now').textContent='Finished.';});
audio.addEventListener('error',function(){$('#now').textContent='This recording could not be played (missing or unsupported file).';reel=null;});
function nextReel(){if(!reel)return;if(reel.i>=reel.items.length){$('#now').textContent='Reel finished ('+reel.items.length+' takes).';reel=null;return;}
  var it=reel.items[reel.i];if(!it.t||!it.t.audio){var why=$('#blind').checked?'':(it.t&&it.t.blocked?' ('+it.t.blocked+')':(cfgBy[reel.cfg].reason?' ('+cfgBy[reel.cfg].reason+')':''));$('#now').textContent='Reel stopped at '+it.c.id+': no audio for '+cfgName(reel.cfg)+why+'.';reel=null;return;}
  last=null;audio.src=it.t.audio;$('#now').textContent='Reel '+(reel.i+1)+'/'+reel.items.length+': '+it.c.id+' · '+(it.t.attempt>1?'repair':'first take')+' · '+cfgName(reel.cfg);var p=audio.play();if(p&&p.catch)p.catch(function(){$('#now').textContent='The browser did not start playback; press the reel again.';reel=null;});}
document.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  if(b.classList.contains('play'))play(b);
  else if(b.classList.contains('reveal')){revealed[b.getAttribute('data-case')]=1;var id=b.getAttribute('data-case');render();var c=document.getElementById('case-'+id);if(c)c.focus();}
  else if(b.classList.contains('reelgo')){var r=b.getAttribute('data-role'),g=b.getAttribute('data-group'),sel='[data-role="'+r+'"][data-group="'+g+'"]',cfg=$('.reelcfg'+sel).value,which=$('.reeltake'+sel).value;var items=[];
    // the reel names which attempt it plays: first takes only, or each case's repair where one was made
    D.cases.filter(function(c){return c.role===r&&c.group===g&&!((c.spoiler==='later'||c.spoiler==='sealed')&&!revealed[c.id]);}).forEach(function(c){var mine=D.takes.filter(function(x){return x.config===cfg&&x.case===c.id&&x.takeKind==='directed'&&x.kind!=='screen'&&x.kind!=='smoke';});
      var first=mine.find(function(x){return x.attempt===1;}),rep=mine.find(function(x){return x.attempt===2&&x.audio;});items.push({c:c,t:which==='repair'&&rep?rep:first});});
    stopAll();reel={items:items,i:0,cfg:cfg,which:which};nextReel();}
  else if(b.id==='stop')stopAll();else if(b.id==='replay'){if(last)play(last);}
  else if(b.id==='next'||b.id==='prev')move(b.id==='next'?1:-1);
  else if(b.id==='export'||b.id==='copy')exportCsv(b.id==='copy');});
function move(d){var cards=[].slice.call(document.querySelectorAll('.card[data-case]'));var cur=document.activeElement&&document.activeElement.closest?document.activeElement.closest('.card[data-case]'):null;var i=cur?cards.indexOf(cur):-1;var n=cards[Math.max(0,Math.min(cards.length-1,i+d))];if(n){n.focus();n.scrollIntoView({block:'start'});}}
document.addEventListener('keydown',function(e){if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='Escape')stopAll();else if(e.key==='n')move(1);else if(e.key==='p')move(-1);else if(e.key==='r'&&last)play(last);});
document.addEventListener('change',function(e){var k=e.target.getAttribute('data-k'),f=e.target.getAttribute('data-f');if(k){scores[k]=scores[k]||{};scores[k][f]=e.target.type==='checkbox'?e.target.checked:e.target.value;save();if(f==='listened')heardChanged(k);return;}
  if(e.target.id==='filter'||e.target.id==='blind')render();});
document.addEventListener('input',function(e){if(e.target.tagName==='TEXTAREA'&&e.target.getAttribute('data-k')){var k=e.target.getAttribute('data-k');scores[k]=scores[k]||{};scores[k].notes=e.target.value;save();}});
// a listened mark changes its badges and the count in place (re-rendering would close the open score panel)
function heardChanged(k){var on=!!(scores[k]&&scores[k].listened);[].forEach.call(document.querySelectorAll('[data-heard]'),function(e){if(e.getAttribute('data-heard')!==k)return;e.className='st '+(on?'ok':'off');e.textContent=on?'Listened':'Not listened';});
  var tiles=document.querySelectorAll('#summary b');if(tiles.length)tiles[tiles.length-1].textContent=Object.keys(scores).filter(function(x){return scores[x].listened;}).length;}
function total(s){var dims=Object.keys(WEIGHTS);if(dims.some(function(d){return !s[d];}))return '';return (dims.reduce(function(n,d){return n+WEIGHTS[d]*(+s[d]-1)/4;},0)*100).toFixed(1);}
function exportCsv(copy){var head='caseId,configurationId,takeKind,takeId,attempt,audioSha256,reviewer,listened,japanese_review_level,pronunciation_1to5,prosody_1to5,identity_fit_1to5,delivery_1to5,cleanliness_1to5,weighted_total,hard_failure,notes,robin_pick';
  var q=function(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
  var rows=Object.keys(scores).map(function(k){var s=scores[k],t=D.takes.find(function(x){return x.key===k;})||{},parts=k.split('|');
    return [t.case,parts[0],t.takeKind,parts[1],t.attempt,t.sha||'',meta.reviewer||'',s.listened?'yes':'no',meta.level||'unassessed',s.pronunciation||'',s.prosody||'',s.identityFit||'',s.delivery||'',s.cleanliness||'',total(s),s.hard?'yes':'',s.notes||'',s.pick?'yes':''].map(q).join(',');});
  var csv=head+'\n'+rows.join('\n')+'\n';var ta=$('#csvOut');ta.value=csv;ta.classList.remove('hidden');
  if(copy){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(csv).then(function(){$('#scoreNote').textContent='Copied.';},function(){ta.select();$('#scoreNote').textContent='Select the text below and copy it.';});else{ta.select();}return;}
  try{var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='scores_'+D.revision+'.csv';document.body.appendChild(a);a.click();a.remove();$('#scoreNote').textContent='Saved (or copy from the box below).';}catch(e){ta.select();$('#scoreNote').textContent='Copy from the box below.';}}
$('#reviewer').value=meta.reviewer||'';$('#level').value=meta.level||'unassessed';
$('#reviewer').addEventListener('input',function(){meta.reviewer=this.value;save();});$('#level').addEventListener('change',function(){meta.level=this.value;save();});
$('#lede').textContent='Corpus '+D.revision+' ('+D.corpusStatus.replace(/_/g,' ')+'), built '+D.built.slice(0,16).replace('T',' ')+' UTC. Each case shows the exact Japanese, its meaning, the intended delivery and every configuration’s cell in its real state. Generated, technically checked and listened are separate: a technical check measures the file and does not hear it. Comparison labels C01/C02 are candidate voices, not the player’s Voice A/B. Scores, the listened mark and picks belong to one attempt and its audio: a repair starts unscored.';
render();
})();
</script>
</body>
</html>
`;

export function writeGallery(opts = {}) {
  const { dir, data } = galleryData(opts);
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, 'review.html');
  fs.writeFileSync(f, PAGE.replace('__DATA__', () => json));
  return { file: f, takes: data.takes.length, withAudio: data.takes.filter((t) => t.audio).length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const opt = (k) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : undefined; };
  const r = writeGallery({ out: opt('out'), results: opt('results') });
  console.log(JSON.stringify({ file: path.relative(ROOT, r.file), takes: r.takes, withAudio: r.withAudio }));
}
