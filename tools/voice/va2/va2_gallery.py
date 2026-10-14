#!/usr/bin/env python3
"""VA-2: the one file Robin listens to. Builds VA2_CASTING_SAMPLES.html from the plan, results.json and the clips, with
every recording embedded (it plays opened on its own, offline, from anywhere: no folder of files beside it).

    python va2_gallery.py --plan <va2_plan.json> --out <work> [--html <file>]

Sections, clearly labelled: 1 · The player's voices (three sets: A-High, A-Low, B-High, B-Low, five moods each);
2 · The narrator (seven candidates, Directed-Neutral and Directed-Energetic); 3 · Every NPC (one line each, with the
engine, voice and settings chosen); 4 · How these were made. Picks, "I dislike this" ticks and notes stay in the
browser (localStorage) and come out as text with "Copy my decisions" or "Save my decisions"; nothing is sent anywhere.
"""
import argparse
import base64
import html
import json
import os
import time

E = html.escape


def jload(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)


REGION = {'rw': 'Reedwake', 'lq': 'Reedwake', 'sg': 'Saltglass', 'mb': 'Manybridge', 'mp': 'Blockprint and Playhouse Rows', 'co': 'Cinder Orchard',
          'co2': 'Cinder Orchard', 'sb': 'Snowbell', 'sb2': 'Snowbell', 'kr': "The Keepers' Road", 'lf': 'Lanternfall', 'lf2': 'Lanternfall',
          'ko': 'Kotonoha and the sea', 'sea': 'Kotonoha and the sea', 'sz': 'Kotonoha and the sea', 'el': 'Kotonoha and the sea',
          'cr': 'The Cloudroad', 'yn': 'Steamhollow', 'sa': 'The Still Archive', 'sa2': 'The Still Archive', 'hall': 'The Hall of a Hundred Tales',
          'gd': 'The old guardians', 'as': 'Ashihara Shinden'}
ORDER = ['Reedwake', 'Saltglass', 'Manybridge', 'Blockprint and Playhouse Rows', 'Cinder Orchard', 'Snowbell', "The Keepers' Road", 'Lanternfall',
         'Kotonoha and the sea', 'The Cloudroad', 'Steamhollow', 'The Still Archive', 'The Hall of a Hundred Tales', 'The old guardians', 'Ashihara Shinden']


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--plan', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--html')
    a = ap.parse_args()
    plan = jload(a.plan)
    res = jload(os.path.join(a.out, 'results.json'))
    T = res.get('takes', {})
    mock = any(r.get('mock') for r in T.values())
    lines = plan['lines']

    def audio(tid, label=''):
        r = T.get(tid)
        if not r:
            return '<span class="missing">not made</span>'
        with open(os.path.join(a.out, r['file']), 'rb') as f:
            b64 = base64.b64encode(f.read()).decode('ascii')
        f = r.get('final') or {}
        bad = (f.get('pre') or 0) > 0.20 or (f.get('tail') or 0) > 0.18
        flag = ' <span class="flag" title="after trimming, this take still has sound before the voice or an unvoiced tail">⚑</span>' if bad else ''
        return ('<div class="clip"><audio controls preload="none" src="data:audio/ogg;base64,' + b64 + '"></audio>' +
                ('<span class="lab">' + E(label) + '</span>' if label else '') + flag + '</div>')

    def jp(line):
        return '<div class="jp" lang="ja">' + E(line['text']) + '</div><div class="en">' + E(line['en']) + '</div>'

    def settings(r, spec):
        if not r:
            return ''
        v = r.get('voice') or {}
        if r['engine'] == 'qwen_design':
            s = 'Qwen3-TTS VoiceDesign · seed ' + str(v.get('seed'))
        else:
            s = ('AivisSpeech' if r['engine'] == 'aivis' else 'VOICEVOX Nemo') + ' · ' + ' / '.join(str(x) for x in [v.get('modelName'), v.get('speakerName')] if x) + \
                ' · style ' + str(v.get('styleWanted', '')) + (' (fell back to normal)' if v.get('styleFellBack') else '')
            p = (r.get('kept') or {}).get('params') or {}
            if p:
                s += ' · ' + ', '.join('%s %s' % (k, p[k]) for k in sorted(p))
        if r.get('fx'):
            s += ' · fx ' + r['fx']
        return s

    css = """
:root{--bg:#f6f2ea;--fg:#2a2420;--mute:#6b6158;--line:#d9cfc0;--card:#fffdf8;--acc:#8a3a2a;--flag:#b06a00}
@media (prefers-color-scheme:dark){:root{--bg:#1d1a17;--fg:#ece4d8;--mute:#a59a8c;--line:#3a332c;--card:#262220;--acc:#e0866e;--flag:#e0a040;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,'Segoe UI','Hiragino Sans','Yu Gothic UI',sans-serif}
main{max-width:1180px;margin:0 auto;padding:24px 16px 80px}h1{font-size:1.6rem;margin:.2rem 0}h2{margin-top:2.4rem;border-bottom:2px solid var(--acc);padding-bottom:.3rem}
h3{margin:1.6rem 0 .4rem}.mute,.en{color:var(--mute)}.jp{font-size:1.05rem}.small{font-size:.85rem}
nav{position:sticky;top:0;background:var(--bg);padding:8px 0;border-bottom:1px solid var(--line);z-index:2;display:flex;gap:14px;flex-wrap:wrap}
nav a{color:var(--acc);text-decoration:none;font-weight:600}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px 14px;margin:10px 0}
table{border-collapse:collapse;width:100%}td,th{border-top:1px solid var(--line);padding:8px 6px;vertical-align:top;text-align:left}
.wrap{overflow-x:auto}.clip{display:flex;align-items:center;gap:6px;flex-wrap:wrap}audio{height:32px;max-width:260px}
.lab{font-size:.8rem;color:var(--mute)}td audio{width:100%;max-width:210px;min-width:150px}td:first-child{min-width:170px}a{color:var(--acc)}.flag{color:var(--flag)}.missing{color:var(--flag);font-size:.85rem}
.pick{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:.5rem 0}textarea{width:100%;min-height:2.2em;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:6px}
.npc{display:grid;grid-template-columns:minmax(150px,1.1fr) minmax(220px,2fr) minmax(200px,1.4fr);gap:10px;border-top:1px solid var(--line);padding:10px 0}
.npc>div{min-width:0}.npc .who b{display:block}.tag{display:inline-block;font-size:.75rem;border:1px solid var(--line);border-radius:10px;padding:0 7px;margin:2px 4px 0 0;color:var(--mute)}
.dis{display:flex;gap:6px;align-items:center;margin-top:4px}.bar{position:fixed;bottom:0;left:0;right:0;background:var(--card);border-top:1px solid var(--line);padding:10px 16px;display:flex;gap:10px;justify-content:center;z-index:3;flex-wrap:wrap}
button{font:inherit;padding:6px 14px;border-radius:6px;border:1px solid var(--acc);background:var(--acc);color:#fff;cursor:pointer}button.q{background:transparent;color:var(--acc)}
.mockwarn{background:var(--flag);color:#000;padding:8px 12px;border-radius:6px;font-weight:700}
@media (max-width:760px){.npc{grid-template-columns:1fr}audio{max-width:100%}}
"""
    h = ['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
         '<title>VA-2 Casting Samples</title><style>' + css + '</style></head><body><main>']
    h.append('<h1>VA-2 · Casting samples</h1><p class="mute">The Road of Borrowed Names · for Robin\'s choices (C-93, 2026-10-14). '
             'Nothing here is a final cast or game audio. Every line is one the game really says. Made ' + E(res.get('lastRun', {}).get('at', '')) + '.</p>')
    if mock:
        h.append('<p class="mockwarn">TEST BUILD: these are synthetic tones from the job\'s self-test, not voices. Do not review.</p>')
    c = plan['counts']
    h.append('<p>' + str(c['player']) + ' player takes · ' + str(c['narrator']) + ' narrator takes · ' + str(c['npc']) + ' NPC takes. '
             'Pick a player set and a narrator; in the NPC list tick <b>I dislike this</b> where a choice is wrong, with a note if you like: '
             'anything you leave unticked will be used as it is. Your picks are kept in this browser; <b>Copy my decisions</b> gives them back as text.</p>')
    h.append('<nav><a href="#player">1 · Player voices</a><a href="#narrator">2 · Narrator</a><a href="#npcs">3 · NPCs</a><a href="#method">4 · How these were made</a></nav>')

    # ---- 1. player ------------------------------------------------------------------------------------------------
    P = plan['sections']['player']
    h.append('<h2 id="player">1 · The player\'s voices</h2><p>Three sets. In each, Voice A is the lighter, brighter adult voice and Voice B the lower, '
             'warmer one; neither is tied to the traveller\'s sex or pronouns. High and Low are the same take moved ' +
             E(str(P['pitchSemitones']['high'])) + ' semitones up or down with the voice\'s character kept. Five moods, one line each.</p>')
    for s in P['sets']:
        h.append('<div class="card"><h3>' + E(s['label']) + '</h3><p class="small"><b>A:</b> ' + E(s['A']) + '<br><b>B:</b> ' + E(s['B']) + '</p><div class="wrap"><table>'
                 '<tr><th>Mood and line</th><th>A-High</th><th>A-Low</th><th>B-High</th><th>B-Low</th></tr>')
        for t in P['texts']:
            row = '<tr><td><b>' + E(t['mood'].capitalize()) + '</b>' + jp(lines[t['key']]) + '</td>'
            for v, p in (('A', 'high'), ('A', 'low'), ('B', 'high'), ('B', 'low')):
                row += '<td>' + audio('P%d%s-%s-%s' % (s['set'], v, t['mood'], p)) + '</td>'
            h.append(row + '</tr>')
        h.append('</table></div><div class="pick"><label><input type="radio" name="playerSet" value="' + str(s['set']) + '"> This set</label>'
                 '<label><input type="checkbox" data-k="playerA' + str(s['set']) + '"> its Voice A only</label><label><input type="checkbox" data-k="playerB' + str(s['set']) + '"> its Voice B only</label></div>'
                 '<textarea data-k="playerNote' + str(s['set']) + '" placeholder="Notes on set ' + str(s['set']) + ' (High or Low preferred, anything off…)"></textarea></div>')

    # ---- 2. narrator ----------------------------------------------------------------------------------------------
    N = plan['sections']['narrator']
    h.append('<h2 id="narrator">2 · The narrator</h2><p>Seven AivisSpeech voices, each reading the same line two ways: <b>Directed-Neutral</b> '
             '(' + E(N['deliveries']['neutral']['note']) + ') and <b>Directed-Energetic</b> (' + E(N['deliveries']['energetic']['note']) + ').</p>')
    if N.get('text'):
        h.append('<div class="card">' + jp(lines[N['text']['key']]) + '</div>')
    for n in N['candidates']:
        r = T.get(n + '-neutral') or {}
        v = r.get('voice') or {}
        h.append('<div class="card"><h3>' + E(n) + ' · ' + E(str(v.get('modelName') or '—')) + (' / ' + E(str(v.get('speakerName'))) if v.get('speakerName') else '') + '</h3>'
                 '<p class="small mute">Licence: ' + E(str(v.get('licence') or 'not recorded')) + ((' · credit: ' + E(str(v.get('credit')))) if v.get('credit') else '') + '</p>'
                 '<div class="pick">' + audio(n + '-neutral', 'Directed-Neutral') + audio(n + '-energetic', 'Directed-Energetic' + (' (neutral style, stronger inflection)' if (T.get(n + '-energetic') or {}).get('voice', {}).get('styleFellBack') else '')) +
                 '<label><input type="radio" name="narrator" value="' + E(n) + '"> My narrator</label></div><textarea data-k="narrNote' + E(n) + '" placeholder="Notes on ' + E(n) + '"></textarea></div>')

    # ---- 3. NPCs ----------------------------------------------------------------------------------------------------
    S = plan['sections']['npc']
    takes = {t['npc']: t for t in S['takes']}
    groups = {}
    for n in S['npcs']:
        reg = REGION.get((n.get('regions') or ['?'])[0], 'Elsewhere')
        groups.setdefault(reg, []).append(n)
    h.append('<h2 id="npcs">3 · Every NPC who speaks</h2><p>One line each, read neutrally unless the character is never neutral (a child who is always excited, '
             'say). The engine and settings are the lead\'s choice from your rules: Qwen3-TTS for most, AivisSpeech for bubbly, high-energy feminine voices, '
             'VOICEVOX Nemo only for middle-aged men; supernatural speakers have a treatment. <b>Tick what you dislike</b>; the rest stands.</p>')
    h.append('<p class="small">Jump to: ' + ' · '.join('<a href="#r-%d">%s</a>' % (i, E(g)) for i, g in enumerate(ORDER + ['Elsewhere']) if g in groups) + '</p>')
    for i, g in enumerate(ORDER + ['Elsewhere']):
        if g not in groups:
            continue
        h.append('<h3 id="r-%d">%s <span class="mute small">(%d)</span></h3>' % (i, E(g), len(groups[g])))
        for n in groups[g]:
            t = takes.get(n['id'])
            r = T.get('NPC-' + n['id'])
            pr = n.get('profile') or {}
            tags = [pr.get('age'), pr.get('presentation'), pr.get('occupation'), pr.get('register')]
            h.append('<div class="npc"><div class="who"><b>' + E(n['name'].get('en', n['id'])) + ' <span lang="ja">' + E(n['name'].get('jp', '')) + '</span></b>' +
                     ''.join('<span class="tag">' + E(str(x)) + '</span>' for x in tags if x) +
                     ('<span class="tag">' + E(n['delivery']) + '</span>' if n.get('delivery') and n['delivery'] != 'neutral' else '') + '</div>'
                     '<div>' + (jp(lines[t['line']]) if t else '') + audio('NPC-' + n['id']) + '</div>'
                     '<div class="small"><div>' + E(settings(r, t and t['voiceSpec'])) + '</div>' +
                     ('<div class="mute">' + E(t['voiceSpec'].get('description', '')) + '</div>' if t and t['voiceSpec'].get('description') else '') +
                     ('<div class="mute">fx: ' + E(n.get('fxWhy') or '') + '</div>' if n.get('fx') else '') +
                     '<div class="mute">Why: ' + E(n.get('why') or '') + '</div>'
                     '<label class="dis"><input type="checkbox" data-dis="' + E(n['id']) + '"> I dislike this</label>'
                     '<textarea data-k="npcNote_' + E(n['id']) + '" placeholder="What is wrong (optional)"></textarea></div></div>')

    # ---- 4. method ------------------------------------------------------------------------------------------------
    h.append('<h2 id="method">4 · How these were made</h2><div class="card small"><p><b>Clean endings:</b> ' + E(plan['clean']['check']) + ' A ⚑ marks a take the check still flagged.</p>'
             '<p><b>Loudness:</b> ' + E(plan['loudness']) + '</p><p><b>Treatments for supernatural speakers:</b></p><ul>' +
             ''.join('<li><b>' + E(k) + '</b>: ' + E(v) + '</li>' for k, v in plan['fx'].items()) + '</ul>'
             '<p><b>Engines:</b> ' + E(json.dumps(res.get('engines', {}), ensure_ascii=False)) + '</p><p><b>Names</b> are spoken from the game\'s own furigana. '
             'None of these lines says the traveller\'s name.</p><p class="mute">Plan ' + E(json.dumps(plan['builtFrom'])) + '</p></div>')

    script = """
const KEY='va2-decisions-'+%s;let st={};try{st=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
document.querySelectorAll('input[type=radio]').forEach(r=>{if(st[r.name]===r.value)r.checked=true;r.addEventListener('change',()=>{st[r.name]=r.value;save()})});
document.querySelectorAll('input[data-k],textarea[data-k]').forEach(el=>{const k=el.dataset.k;if(el.type==='checkbox'){el.checked=!!st[k];el.addEventListener('change',()=>{st[k]=el.checked;save()})}else{el.value=st[k]||'';el.addEventListener('input',()=>{st[k]=el.value;save()})}});
document.querySelectorAll('input[data-dis]').forEach(el=>{const k='dis_'+el.dataset.dis;el.checked=!!st[k];el.addEventListener('change',()=>{st[k]=el.checked;save()})});
document.addEventListener('play',e=>{document.querySelectorAll('audio').forEach(a=>{if(a!==e.target)a.pause()})},true);
function text(){const L=['VA-2 decisions'];L.push('Player set: '+(st.playerSet||'(none picked)'));for(const s of [1,2,3]){if(st['playerA'+s])L.push('  Voice A from set '+s);if(st['playerB'+s])L.push('  Voice B from set '+s);if(st['playerNote'+s])L.push('  Set '+s+' note: '+st['playerNote'+s])}
L.push('Narrator: '+(st.narrator||'(none picked)'));for(const k in st)if(k.startsWith('narrNote')&&st[k])L.push('  '+k.slice(8)+' note: '+st[k]);
const dis=Object.keys(st).filter(k=>k.startsWith('dis_')&&st[k]).map(k=>k.slice(4));L.push('NPCs disliked ('+dis.length+'): '+(dis.join(', ')||'none'));
for(const k in st)if(k.startsWith('npcNote_')&&st[k])L.push('  '+k.slice(8)+': '+st[k]);L.push('Everything not disliked stands as made.');return L.join('\\n')}
document.getElementById('copy').onclick=async()=>{const t=text();try{await navigator.clipboard.writeText(t);document.getElementById('msg').textContent='Copied.'}catch(e){document.getElementById('out').value=t;document.getElementById('out').hidden=false;document.getElementById('out').select()}};
document.getElementById('dl').onclick=()=>{const b=new Blob([text()],{type:'text/plain'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='VA2_decisions.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)};
""" % json.dumps(plan['builtFrom'].get('commit', '')[:12])
    h.append('</main><div class="bar"><button id="copy">Copy my decisions</button><button class="q" id="dl">Save my decisions</button><span id="msg" class="mute"></span>'
             '<textarea id="out" hidden></textarea></div><script>' + script + '</script></body></html>')
    out = a.html or os.path.join(a.out, 'VA2_CASTING_SAMPLES.html')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(''.join(h))
    print('wrote', out, round(os.path.getsize(out) / 1e6, 1), 'MB', time.strftime('%H:%M:%S'))


if __name__ == '__main__':
    main()
