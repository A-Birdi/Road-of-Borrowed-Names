// Robin's listening page for the whole-game voice batch (Robin, 2026-10-18: "Cloud should provide me a listening page
// for anything needing review"). One HTML file, opened from the batch folder on Robin's PC: the review list
// (REVIEW_LIST.json, schema rbn.voice.review/1) is written into it, and every take plays from its path relative to that
// folder (<speaker>/<id>.opus, superseded/<stamp>/<speaker>/<id>.opus). No audio is embedded and nothing is fetched or
// sent: decisions stay in the browser and come back as text with "Copy my decisions" (or "Save my decisions"), as the
// VA-2 gallery did.
// Each take shows the line as the game writes it (readings above the kanji), the English, the line before it, why it is
// listed, the text the engine was sent where that differs, and a send correction where one is chosen
// (docs/future/voice/production/supplements/SEND_CORRECTIONS.json). Keep / Redo / an earlier take instead, and a note.
// Unmarked takes stand as made, except the open one, which needs a decision.
// Usage: node tools/voice/review_page.mjs [--list <REVIEW_LIST.json>] [--batch <batch folder>] [--out <file.html>]
//   default out: docs/future/voice/production/run/REVIEW_LISTENING.html, or <batch>/REVIEW_LISTENING.html with --batch;
//   --batch also checks that every take the page names is in that folder (missing ones are listed; the page still
//   builds and marks them where they are).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { root } from '../../tests/lib/load.mjs';

const P = (...a) => path.join(root, ...a);
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// the line as the game writes it: {漢字|かんじ} with the reading above, the learner's word spacing removed; anything the
// markup reader does not recognise falls back to the plain spoken text
export function ruby(jp, spoken) {
  const parts = String(jp).split(/(\{[^{}]+\})/);
  let plain = '', html = '';
  for (const part of parts) {
    const m = part.match(/^\{([^|{}]+)\|([^{}]+)\}$/);
    if (m) { plain += m[1]; html += '<ruby>' + esc(m[1]) + '<rt>' + esc(m[2].split('|').join('')) + '</rt></ruby>'; }
    else { const t = part.replace(/\s+/g, ''); plain += t; html += esc(t); }
  }
  return spoken && plain.normalize('NFC') !== String(spoken).normalize('NFC') ? esc(spoken) : html;
}

// what the page needs from the repository: the GO manifest and the supplements for the line's display, the script for
// the English and the line before; each part optional, so the page still builds from the list alone
async function context() {
  const ctx = { entries: new Map(), refs: new Map(), lines: new Map(), chars: {}, corrections: new Map(), retired: new Map(), notes: [] };
  // takes whose line has since left the script (its key no longer resolves): their words as recorded, pinned to the
  // batch's revision, shown marked retired and unused (run/RETIRED_TAKES.json; Agnes 6355139781, Local CL-237)
  try { for (const r of readJson(P('docs/future/voice/production/run/RETIRED_TAKES.json')).retired || []) ctx.retired.set(r.id, r); } catch (e) { /* none */ }
  try {
    const m = JSON.parse(zlib.gunzipSync(fs.readFileSync(P('docs/future/voice/production/manifest/RECORDING_MANIFEST.json.gz'))));
    for (const e of m.entries) ctx.entries.set(e.id, e);
    for (const r of m.references) ctx.refs.set(r.id, r);
  } catch (e) { ctx.notes.push('manifest not read: ' + e.message); }
  const supDir = P('docs/future/voice/production/supplements');
  for (const f of fs.existsSync(supDir) ? fs.readdirSync(supDir).sort() : []) {
    try {
      const s = readJson(path.join(supDir, f));
      for (const e of s.entries || []) ctx.entries.set(e.id, e);
      for (const r of s.references || []) ctx.refs.set(r.id, r);
      for (const c of s.corrections || []) ctx.corrections.set(c.id, c);
    } catch (e) { ctx.notes.push(f + ' not read: ' + e.message); }
  }
  try {
    globalThis.__RB_TEST__ = true;
    const { RB, allLines } = await import('./lines.mjs');
    for (const l of allLines()) ctx.lines.set(l.key, l);
    for (const k in RB.content.chars) { const n = RB.content.chars[k].name; if (n) ctx.chars[k] = { en: n.en || k, jp: n.jp || '' }; }
  } catch (e) { ctx.notes.push('script not read (no English or context lines): ' + e.message); }
  return ctx;
}

const DELIVERY = { neutral: '', citation: 'reference reading', reading: 'read plainly' };
function speakerOf(it, ctx, ref) {
  if (ref || it.id.startsWith('r1-ref-')) return { en: 'Narrator', sub: 'reference reading' };
  if (it.speaker === 'narrator') return { en: 'Narrator' };
  if (it.speaker === 'pc') return { en: 'The player', sub: 'Voice ' + it.voice + ' · ' + (it.pitch === 'high' ? 'High' : 'Low') };
  const c = ctx.chars[it.speaker];
  return c ? { en: c.en, jp: c.jp ? ruby(c.jp) : '' } : { en: it.speaker || '—' };
}

// one item of the list, made ready for the page (plain data; the page's script draws it)
function prepare(it, group, ctx) {
  const e = ctx.entries.get(it.id), ref = ctx.refs.get(it.id);
  const line = (it.lineKeys || []).map((k) => ctx.lines.get(k)).find(Boolean) || null;
  const who = speakerOf(it, ctx, ref);
  let jp, en = '', prev = null, retired = null;
  if (ref) {
    jp = esc(ref.written || ref.spoken) + (ref.reading && ref.reading !== ref.written ? ' <span class="rd">' + esc(ref.reading) + '</span>' : '');
    en = ({ kana: 'Kana', kanji: 'Kanji and its readings', word: 'Word', phrase: 'Phrase' })[ref.kind] || '';
  } else {
    const display = (e && e.display) || (line && line.jp) || it.spoken || '';
    jp = ruby(display, it.spoken || (e && e.spoken));
    if (line) {
      en = line.en;
      if (line.prev) prev = { who: ({ narr: 'Narrator', comp: 'A companion', pc: 'You' })[line.prev.who] || (ctx.chars[line.prev.who] || { en: line.prev.who }).en, jp: line.prev.plain, en: line.prev.en };
    } else if (ctx.retired.has(it.id)) {
      const r = ctx.retired.get(it.id);
      en = r.en || ''; prev = r.prev || null;
      retired = { rev: String(r.sourceRevision || '').slice(0, 7), by: r.retiredBy || '' };
    }
  }
  const spoken = it.spoken || (ref && ref.spoken) || (e && e.spoken) || '';
  const sent = it.sent || (ref && ref.spoken) || (e && e.send) || '';
  const sc = ctx.corrections.get(it.id);
  return {
    id: it.id, g: group.key, who, delivery: it.delivery && !(it.delivery in DELIVERY) ? it.delivery : (DELIVERY[it.delivery] || ''),
    jp, en, prev, retired, why: it.why || '', sent: sent && sent !== spoken ? sent : '',
    sc: sc ? { ref: sc.ref, send: sc.send, recorded: sent === sc.send, target: sc.lengthFit && sc.lengthFit.targetSeconds } : null,
    more: Math.max(0, (it.lineKeys || []).length - 1),
    take: { file: it.file, s: it.seconds },
    earlier: (it.earlierTakes || []).map((t) => ({ file: t.file, s: t.seconds, stamp: (t.file.match(/^superseded\/([^/]+)\//) || [])[1] || '' })),
  };
}

const CSS = `
:root{--bg:#f5f1e8;--fg:#2a2420;--mute:#6b6158;--line:#dcd2c2;--card:#fffdf8;--acc:#8a3a2a;--acc-ink:#fff;--flag:#9a5a00;--keep:#2f6b3a;--redo:#a3302a;--prior:#2d5a86;--chip:#efe8db}
@media (prefers-color-scheme:dark){:root{--bg:#1c1916;--fg:#ece4d8;--mute:#a59a8c;--line:#3a332c;--card:#25211e;--acc:#e0866e;--acc-ink:#1c1916;--flag:#e0a040;--keep:#7cc48a;--redo:#f08a80;--prior:#8ab8e8;--chip:#2e2925;color-scheme:dark}}
*{box-sizing:border-box}html{scroll-padding-top:110px}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 system-ui,-apple-system,'Segoe UI','Hiragino Sans','Yu Gothic UI','Meiryo',sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 120px}
h1{font-size:1.55rem;margin:.1rem 0 .2rem;text-wrap:balance}h2{font-size:1.2rem;margin:2.2rem 0 .3rem;border-bottom:2px solid var(--acc);padding-bottom:.25rem;text-wrap:balance}
.mute{color:var(--mute)}.small{font-size:.86rem}a{color:var(--acc)}
.ids{font:12px/1.4 ui-monospace,'Cascadia Mono',Consolas,monospace;color:var(--mute);word-break:break-all}
nav{position:sticky;top:0;z-index:3;background:var(--bg);border-bottom:1px solid var(--line);padding:8px 0;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center}
nav a{font-weight:600;text-decoration:none;white-space:nowrap}nav a .n{font-weight:400;color:var(--mute);font-variant-numeric:tabular-nums}
nav label{font-size:.86rem;color:var(--mute);display:flex;gap:5px;align-items:center}nav .sp{flex:1}
.intro{max-width:72ch}.warn{border-left:4px solid var(--flag);padding:6px 12px;background:var(--card);margin:10px 0}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px 14px;margin:10px 0;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:8px 18px}
.card.d-keep{border-left:5px solid var(--keep)}.card.d-redo{border-left:5px solid var(--redo)}.card.d-prior{border-left:5px solid var(--prior)}
.card.playing{outline:2px solid var(--acc);outline-offset:1px}
.card>div{min-width:0}.head{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline}
.head b{font-size:1.02rem}.chip{font-size:.75rem;border-radius:10px;padding:0 8px;background:var(--chip);color:var(--mute)}
.jp{font-size:1.2rem;line-height:2.1}.jp rt,.jpn rt{font-size:.55em;color:var(--mute)}.rd{font-size:.9rem;color:var(--mute);margin-left:.4em}
.en{color:var(--mute)}.prev{font-size:.84rem;color:var(--mute);border-left:2px solid var(--line);padding-left:8px;margin-top:4px}
.why{font-size:.86rem;margin-top:6px}.why b{color:var(--flag);font-weight:600}.sent{font-size:.86rem;margin-top:4px}
.sc{font-size:.86rem;margin-top:6px;border:1px dashed var(--prior);border-radius:6px;padding:5px 8px}
.take{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin:4px 0}.take .lab{font-size:.8rem;color:var(--mute);min-width:7.5em;font-variant-numeric:tabular-nums}
audio{height:34px;width:100%;max-width:300px}.miss{font-size:.8rem;color:var(--redo)}
button{font:inherit;font-size:.82rem;padding:3px 10px;border-radius:6px;border:1px solid var(--acc);background:transparent;color:var(--acc);cursor:pointer}
button.main{background:var(--acc);color:var(--acc-ink);font-size:.95rem;padding:6px 14px}
fieldset{border:0;padding:0;margin:8px 0 4px;display:flex;flex-wrap:wrap;gap:4px 14px}legend{font-size:.8rem;color:var(--mute);padding:0;margin-bottom:2px;width:100%}
fieldset label{display:flex;gap:5px;align-items:center;cursor:pointer}
textarea{width:100%;min-height:2.3em;font:inherit;font-size:.9rem;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:5px 8px;resize:vertical}
.stale{font-size:.8rem;color:var(--flag)}
.bar{position:fixed;left:0;right:0;bottom:0;z-index:4;background:var(--card);border-top:1px solid var(--line);padding:10px 16px;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:center}
.bar .count{font-size:.86rem;color:var(--mute);font-variant-numeric:tabular-nums}#out{width:min(900px,100%);min-height:8em}
.about{max-width:76ch}.about dt{font-weight:600;margin-top:.6rem}.about dd{margin:0 0 0 1rem}
body.only-open .card.decided{display:none}
@media (max-width:760px){.card{grid-template-columns:1fr}audio{max-width:100%}html{scroll-padding-top:150px}}
`;

// the page's own script: draws the cards, keeps the decisions (per batch, in this browser), plays through, exports
const SCRIPT = String.raw`
const L=JSON.parse(document.getElementById('list').textContent);
const KEY='rbn-voice-review-'+L.batchKey;
let st={};try{st=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
const $=(s,el)=>(el||document).querySelector(s);
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const src=(f)=>f.split('/').map(encodeURIComponent).join('/');
const secs=(s)=>s==null?'':(Math.round(s*100)/100).toFixed(2)+' s';
const missing=new Set();
const uniq=new Map(),groupsOf={};
for(const g of L.groups)for(const it of g.items){if(!uniq.has(it.id))uniq.set(it.id,it);(groupsOf[it.id]=groupsOf[it.id]||[]).push(g.key)}
const SHORT={open:'Open',redone:'Redone',mw1:'MW-1',edges:'Edges',fxNear:'Supernatural'};
function decisionOf(it){const d=st[it.id];if(!d)return null;if(d.cur!==it.take.file+'@'+it.take.s)return Object.assign({stale:true},d);return d}
const marked=(it)=>{const d=decisionOf(it);return !!(d&&!d.stale&&d.d)};
function audio(it,file,label,s,extra){return '<div class="take"><span class="lab">'+esc(label)+(s!=null?' · '+secs(s):'')+'</span><audio controls preload="metadata" data-file="'+esc(file)+'" src="'+esc(src(file))+'"></audio>'+(extra||'')+'<span class="miss" hidden>not found beside this page: '+esc(file)+'</span></div>'}
function card(it,gi){
  const el=document.createElement('section');el.className='card';el.id='t-'+it.g+'-'+it.id;el.dataset.id=it.id;el.dataset.g=it.g;
  const who=it.who,nm='d-'+it.g+'-'+it.id;
  let h='<div class="head"><b>'+esc(who.en)+'</b>'+(who.jp?'<span lang="ja" class="mute jpn">'+who.jp+'</span>':'')+(who.sub?'<span class="chip">'+esc(who.sub)+'</span>':'')+(it.delivery?'<span class="chip">'+esc(it.delivery)+'</span>':'')+'<span class="ids">'+esc(it.id)+'</span></div>';
  h+='<div><div class="jp" lang="ja">'+it.jp+'</div>'+(it.en?'<div class="en">'+esc(it.en)+'</div>':'');
  if(it.retired)h+='<div class="why"><span class="chip">Retired · unused</span> This line has since left the game ('+esc(it.retired.by)+'). Shown with the words it was recorded with, as of revision '+esc(it.retired.rev)+'.</div>';
  if(it.prev)h+='<div class="prev">Before this: <b>'+esc(it.prev.who)+'</b> <span lang="ja">'+esc(it.prev.jp)+'</span>'+(it.prev.en?' · '+esc(it.prev.en):'')+'</div>';
  if(it.why)h+='<div class="why"><b>Why it is here:</b> '+esc(it.why)+'</div>';
  it.also.forEach((x)=>{h+='<div class="why small">Also under <a href="#t-'+esc(x.g)+'-'+esc(it.id)+'">'+esc(SHORT[x.g]||x.g)+'</a>: '+esc(x.why)+' (one decision for both)</div>'});
  if(it.sent)h+='<div class="sent mute">Sent to the engine as <span lang="ja">'+esc(it.sent)+'</span></div>';
  if(it.more)h+='<div class="small mute">The same recording serves '+it.more+' more line'+(it.more>1?'s':'')+'.</div>';
  if(it.sc)h+='<div class="sc">'+(it.sc.recorded?'Recorded with the corrected send ('+esc(it.sc.ref)+'): <span lang="ja">「'+esc(it.sc.send)+'」</span>.':'A corrected send is chosen ('+esc(it.sc.ref)+'): <span lang="ja">「'+esc(it.sc.send)+'」</span>, aiming at about '+esc(it.sc.target)+' s. Its take is still to be recorded; until it is in, these are the takes made with the old send.')+'</div>';
  const edge=it.g==='edges'||it.also.some((x)=>x.g==='edges');
  h+='</div><div>'+audio(it,it.take.file,'Current take',it.take.s,edge?'<button type="button" data-part="start">Hear the start</button><button type="button" data-part="end">Hear the end</button>':'');
  it.earlier.forEach((t,i)=>{h+=audio(it,t.file,'Earlier take '+(i+1),t.s)});
  h+='<fieldset><legend>Your decision'+(it.g==='open'?' (needed)':' (unmarked stands as made)')+'</legend><label><input type="radio" name="'+esc(nm)+'" value="keep"> Keep</label><label><input type="radio" name="'+esc(nm)+'" value="redo"> Redo</label>';
  it.earlier.forEach((t,i)=>{h+='<label><input type="radio" name="'+esc(nm)+'" value="prior:'+i+'"> Earlier take '+(i+1)+' instead</label>'});
  h+='</fieldset><div class="stale" hidden>Your earlier decision was made on a different take; listen again.</div><textarea aria-label="Note" placeholder="Note (optional): what is wrong, or what to keep"></textarea></div>';
  el.innerHTML=h;
  el.querySelectorAll('input[type=radio]').forEach((r)=>{r.addEventListener('change',()=>{set(it,{d:r.value})})});
  const ta=$('textarea',el);ta.addEventListener('input',()=>{set(it,{note:ta.value})});
  el.querySelectorAll('audio').forEach((a)=>{a.addEventListener('error',()=>{missing.add(a.dataset.file);a.hidden=true;a.parentNode.querySelector('.miss').hidden=false;count()})});
  el.querySelectorAll('button[data-part]').forEach((b)=>{b.addEventListener('click',()=>part($('audio',el),b.dataset.part))});
  return el;
}
// every card of one recording shows the same decision (a recording listed in two groups has one)
function refresh(it){const d=decisionOf(it);document.querySelectorAll('.card[data-id="'+it.id+'"]').forEach((el)=>{
  el.querySelectorAll('input[type=radio]').forEach((r)=>{r.checked=!!(d&&!d.stale&&d.d===r.value)});
  const ta=$('textarea',el);if(ta!==document.activeElement)ta.value=(d&&d.note)||'';
  $('.stale',el).hidden=!(d&&d.stale);
  el.classList.remove('d-keep','d-redo','d-prior','decided');if(d&&!d.stale&&d.d)el.classList.add(d.d==='keep'?'d-keep':d.d==='redo'?'d-redo':'d-prior','decided')})}
function set(it,patch){const cur=it.take.file+'@'+it.take.s;const o=st[it.id]&&st[it.id].cur===cur?st[it.id]:{cur};Object.assign(o,patch,{cur});if(!o.d&&!o.note)delete st[it.id];else st[it.id]=o;save();refresh(it);count()}
let stopAt=null;
function part(a,which){if(!a||a.hidden)return;const go=()=>{if(which==='start'){a.currentTime=0;stopAt=Math.min(0.8,a.duration||0.8)}else{a.currentTime=Math.max(0,(a.duration||0)-0.8);stopAt=null}a.play()};if(a.readyState<1){a.addEventListener('loadedmetadata',go,{once:true});a.load()}else go()}
document.addEventListener('timeupdate',(e)=>{if(stopAt!=null&&e.target.currentTime>=stopAt){e.target.pause();stopAt=null}},true);
document.addEventListener('play',(e)=>{document.querySelectorAll('audio').forEach((a)=>{if(a!==e.target)a.pause()});document.querySelectorAll('.card.playing').forEach((c)=>c.classList.remove('playing'));const c=e.target.closest('.card');if(c)c.classList.add('playing')},true);
document.addEventListener('ended',(e)=>{if(!$('#auto').checked)return;const c=e.target.closest('.card');if(!c||e.target!==$('audio',c))return;let n=c.nextElementSibling;while(n&&(!n.classList.contains('card')||getComputedStyle(n).display==='none'))n=n.nextElementSibling;if(n){const a=$('audio',n);if(a&&!a.hidden){n.scrollIntoView({block:'center',behavior:'smooth'});a.currentTime=0;a.play()}}},true);
function count(){let done=0;for(const it of uniq.values())if(marked(it))done++;
  for(const g of L.groups){const a=$('#nav-'+g.key+' .n');if(a)a.textContent=' '+g.items.filter(marked).length+'/'+g.items.length}
  $('#count').textContent=done+' of '+uniq.size+' recordings marked'+(missing.size?' · '+missing.size+' file'+(missing.size>1?'s':'')+' not found beside this page':'')}
function text(){
  const by={redo:[],prior:[],notes:[],keep:[],open:[],stale:[]};
  for(const it of uniq.values()){const d=decisionOf(it);const gs=groupsOf[it.id];const tag=it.id+' · '+it.who.en+(it.who.sub?' ('+it.who.sub+')':'')+' · '+gs.join('+');
    if(d&&d.stale){by.stale.push(tag);continue}
    const note=d&&d.note?' · note: '+d.note:'';
    if(!d||!d.d){if(gs.includes('open'))by.open.push(tag+note);else if(note)by.notes.push(tag+' (unmarked)'+note);continue}
    if(d.d==='redo')by.redo.push(tag+note);else if(d.d.startsWith('prior:')){const t=it.earlier[+d.d.slice(6)];by.prior.push(tag+' · use '+(t?t.file:'?')+note)}else if(note)by.notes.push(tag+' (keep)'+note);else by.keep.push(it.id)}
  const out=['Voice batch review: Robin\'s decisions','List: '+L.schema+' · '+uniq.size+' recordings ('+L.total+' listings) · batch '+L.batch.sourceRevision.slice(0,12)+' · manifest '+L.batch.manifestSha256.slice(0,12)+' · list '+L.listSha256.slice(0,12)];
  const sec=(t,a)=>{out.push('',t+' ('+a.length+')'+(a.length?':':''));a.forEach((x)=>out.push('  '+x))};
  sec('Redo',by.redo);sec('Use an earlier take instead',by.prior);sec('Notes',by.notes);
  out.push('','Marked keep ('+by.keep.length+')'+(by.keep.length?': '+by.keep.join(', '):''));
  if(by.open.length)sec('Still open, no decision yet',by.open);if(by.stale.length)sec('Decided on a different take (not counted)',by.stale);
  if(missing.size)sec('Files not found beside the page',[...missing]);
  out.push('','Everything not marked stands as made.');
  const json={schema:'rbn.voice.review-decisions/1',listSha256:L.listSha256,batch:L.batch,decisions:{}};
  for(const it of uniq.values()){const d=decisionOf(it);if(d&&!d.stale&&(d.d||d.note)){const pr=d.d&&d.d.startsWith('prior:');json.decisions[it.id]={decision:d.d?(pr?'earlier':d.d):null,take:pr?(it.earlier[+d.d.slice(6)]||{}).file:it.take.file,note:d.note||''}}}
  out.push('','JSON '+JSON.stringify(json));return out.join('\n')}
const main=$('#takes');
for(const g of L.groups){const h=document.createElement('h2');h.id='g-'+g.key;h.innerHTML=esc(g.title)+' <span class="mute small">('+g.items.length+')</span>';main.appendChild(h);
  if(g.note){const p=document.createElement('p');p.className='small mute intro';p.textContent=g.note;main.appendChild(p)}
  for(const it of g.items)main.appendChild(card(it,g))}
for(const it of uniq.values())refresh(it);
$('#only').addEventListener('change',(e)=>{document.body.classList.toggle('only-open',e.target.checked)});
$('#copy').onclick=async()=>{const t=text();try{await navigator.clipboard.writeText(t);$('#msg').textContent='Copied. Paste it into the chat.'}catch(e){const o=$('#out');o.value=t;o.hidden=false;o.select();$('#msg').textContent='Select all and copy from the box.'}};
$('#dl').onclick=()=>{const b=new Blob([text()],{type:'text/plain'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='VOICE_REVIEW_decisions.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)};
count();
`;

const GROUP_NOTES = {
  open: 'Every seed gave this line about a second. Its 10 morae at Wataru\'s own pace come to about 1.7 s, so the takes may be rushed rather than missing words: listen. If the words are all there, Keep (or pick the best take); if not, Redo, and the corrected send below is used.',
  redone: 'Each was made again because the first take ran far longer than its text, or stopped short. The replaced take is there to compare.',
  mw1: 'The Old Mill lines added by MW-1 after the batch (same narrator, delivery and encoding), and the どすん reading.',
  edges: 'The clean-ending check still found 0.2 to 0.35 s of sound before or after the voice. "Hear the start" and "Hear the end" play just those parts.',
  fxNear: 'The three supernatural voices whose clean reference came out close to, but not exactly, the approved take. Check that each still sounds like the voice you chose.',
};

export async function build(listPath) {
  const raw = fs.readFileSync(listPath);
  const list = JSON.parse(raw);
  if (list.schema !== 'rbn.voice.review/1') throw new Error('unknown review list schema: ' + list.schema);
  const ctx = await context();
  const groups = list.groups.map((g) => ({ key: g.key, title: g.title, note: GROUP_NOTES[g.key] || '', items: g.items.map((it) => prepare(it, g, ctx)) }));
  // a recording listed in two groups (an edge flag and a near-repeat voice, say) shows both reasons, with one decision
  const where = {};
  for (const g of groups) for (const it of g.items) (where[it.id] = where[it.id] || []).push({ g: g.key, why: it.why });
  for (const g of groups) for (const it of g.items) it.also = where[it.id].filter((x) => x.g !== g.key);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const recordings = new Set(groups.flatMap((g) => g.items.map((it) => it.id))).size;
  const data = { schema: list.schema, batch: list.batch, batchKey: (list.batch.manifestSha256 || '').slice(0, 16), listSha256: sha(raw), total, groups };
  const files = groups.flatMap((g) => g.items.flatMap((it) => [it.take.file].concat(it.earlier.map((t) => t.file))));
  const nfr = list.notForReview || {};
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Voice Batch Review</title><style>' + CSS + '</style></head><body><main>' +
    '<h1>Voice batch · listening review</h1>' +
    '<p class="mute small">The Road of Borrowed Names · the whole-game batch (' + esc(list.batch.sourceRevision.slice(0, 12)) + ', manifest ' + esc(list.batch.manifestSha256.slice(0, 12)) + ') · ' + recordings + ' recordings, ' + total + ' listings in ' + groups.length + ' groups (' + (total - recordings) + ' recordings are in two groups and have one decision)</p>' +
    '<div class="intro"><p>Each card is one recording the game will play: the line as the game writes it, the English, the line before it, and why it is listed. ' +
    'Play the current take (and any earlier takes beside it), then mark <b>Keep</b>, <b>Redo</b> or an earlier take, with a note if you like. ' +
    'Anything you leave unmarked stands as made, except the open line at the top. Your marks stay in this browser; <b>Copy my decisions</b> gives them back as text.</p>' +
    '<p class="small mute">Open this page from the batch folder: the takes play from beside it (' + new Set(files).size + ' files). A take that is not there says so on its card. ' +
    'Chrome, Edge and Firefox play these Opus files.</p></div>' +
    (ctx.notes.length ? '<p class="warn small">Built without part of its context: ' + esc(ctx.notes.join('; ')) + '</p>' : '') +
    '<nav>' + groups.map((g) => '<a id="nav-' + esc(g.key) + '" href="#g-' + esc(g.key) + '">' + esc(({ open: 'Open', redone: 'Redone', mw1: 'MW-1', edges: 'Edges', fxNear: 'Supernatural' })[g.key] || g.key) + '<span class="n"></span></a>').join('') +
    '<span class="sp"></span><label><input type="checkbox" id="auto"> Play the next take when one ends</label><label><input type="checkbox" id="only"> Hide marked takes</label></nav>' +
    '<div id="takes"></div>' +
    '<h2 id="about">About this list</h2><dl class="about small">' +
    '<dt>Where it comes from</dt><dd>docs/future/voice/production/run/REVIEW_LIST.json (' + esc(list.schema) + ', list SHA-256 ' + esc(data.listSha256.slice(0, 16)) + '…), written into this page by tools/voice/review_page.mjs. The audio stays on this PC; nothing on this page is sent anywhere.</dd>' +
    (nfr.quietPeakLimited ? '<dt>Not listed for review</dt><dd>' + esc(nfr.quietPeakLimited.count) + ' takes ' + esc(nfr.quietPeakLimited.note) + '.</dd>' : '') +
    '<dt>A redo</dt><dd>The take is made again with the same voice; where a corrected send is chosen (SEND_CORRECTIONS.json), with that. Its id, and the line it plays on, do not change.</dd>' +
    '<dt>An earlier take instead</dt><dd>The earlier file goes back in place of the current one; nothing is deleted either way.</dd></dl>' +
    '</main><div class="bar"><button class="main" id="copy" type="button">Copy my decisions</button><button id="dl" type="button">Save my decisions</button><span class="count" id="count"></span><span class="mute small" id="msg"></span><textarea id="out" hidden></textarea></div>' +
    '<script type="application/json" id="list">' + JSON.stringify(data).replace(/</g, '\\u003c') + '</script><script>' + SCRIPT + '</script></body></html>';
  return { html, files: [...new Set(files)], total, recordings, notes: ctx.notes };
}

// run as a command (on Windows too: a file URL is file:///C:/…, never 'file://' + the path the shell gave)
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const a = process.argv.slice(2), opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  const listPath = path.resolve(opt('--list') || P('docs/future/voice/production/run/REVIEW_LIST.json'));
  const batch = opt('--batch') ? path.resolve(opt('--batch')) : null;
  const out = path.resolve(opt('--out') || (batch ? path.join(batch, 'REVIEW_LISTENING.html') : P('docs/future/voice/production/run/REVIEW_LISTENING.html')));
  const { html, files, total, recordings, notes } = await build(listPath);
  fs.writeFileSync(out, html);
  console.log('wrote ' + out + ' (' + recordings + ' recordings in ' + total + ' listings, ' + files.length + ' files named, ' + html.length + ' bytes)');
  for (const n of notes) console.log('note: ' + n);
  if (batch) {
    const miss = files.filter((f) => !fs.existsSync(path.join(batch, f)));
    console.log(miss.length ? miss.length + ' named file(s) not in ' + batch + ':\n  ' + miss.join('\n  ') : 'every named file is in the batch folder');
  }
}
