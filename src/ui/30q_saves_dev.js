/* Development-only QA save backup and restore (SPECIFICATION §14's one exception: Robin, 2026-10-27, relayed by
 * Agnes 6431800544 and 6431813219). Not reachable in normal play: it exists only on a page opened with ?dev=saves (or
 * when a test set __RB_DEV_SAVES__ = true before the game loaded), where the save module defines RB.save.qa. The Inn
 * Ledger's Load page then offers "Export (QA)…" in an occupied slot's Manage group and "Restore (QA)…" in an empty
 * slot's. Export shows what the file holds (each record's journey, its top-level keys and sizes, the checksum) before
 * Download or Copy. Restore takes a file or pasted text, checks all of it, shows the same preview, and writes only after
 * its own confirmation, into that empty slot only. Not a player feature, a share code or a cloud save.
 *
 *   RB.ui.qaSaves.exportSheet(slot) · restoreSheet(slot) -> Promise, settled when the sheet closes (true if restored) */
var RB = (globalThis.RB = globalThis.RB || {});

if (RB.save && RB.save.qa) RB.ui.qaSaves = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n, t) => RB.ui.folio.icon(n, t);
  const QA = RB.save.qa;
  const KIND = { manual: 'Manual save', auto: 'Autosave', predeparture: 'Before departure', suspend: 'Suspend point' };
  const MAX_FILE = 16 * 1024 * 1024;
  const kb = (n) => (n < 1024 ? n + ' B' : (n / 1024).toFixed(n < 10240 ? 1 : 0) + ' KiB');
  const when = (ts) => { const d = new Date(ts); return isNaN(d) ? String(ts) : d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'; };

  // what a file holds, record by record: the journey as the ledger would show it, then the state's top-level keys
  function previewHtml(previews) {
    return '<ol class="qa-recs">' + previews.map((p) => {
      const m = p.meta || {};
      return '<li><p><strong>' + esc(KIND[p.kind] || p.kind) + '</strong> · saved ' + esc(when(p.savedAt)) + '</p>' +
        '<p>' + esc(m.name || '') + (m.comp ? ' &amp; ' + esc(m.comp) : '') + ' · Chapter ' + esc(String(m.chapter)) + ' · ' + esc(m.place || '') +
        ' · ' + esc(String(Math.floor((m.playtime || 0) / 60))) + ' min played · ' + esc(kb(p.bytes)) + '</p>' +
        '<details><summary>' + p.keys.length + ' top-level keys</summary><p class="qa-keys">' +
        p.keys.map(([k, n]) => '<code>' + esc(k) + '</code> ' + esc(kb(n))).join(', ') + '</p></details></li>';
    }).join('') + '</ol>';
  }
  function errorsHtml(errs) {
    return '<div class="note-slip bad" role="alert">' + I('warn') + ' Not accepted. Nothing was written.<ul>' + errs.map((e) => '<li>' + esc(e) + '</li>').join('') + '</ul></div>';
  }
  // one sheet over the ledger; Back or Escape closes it
  function sheet(title, meta, html, cls) {
    let close;
    const done = new Promise((res) => { close = res; });
    const opener = document.activeElement;
    let layer = null;
    const finish = (v) => {
      if (!layer) return;
      RB.ui.popLayer(layer);
      layer = null;
      if (opener && opener.focus && opener !== document.body && document.contains(opener)) opener.focus({ preventScroll: true });
      close(v);
    };
    const fr = RB.ui.folio.frame({ onClose: () => finish(false), closeLabel: 'Back', closeIcon: 'back', cls: 'folio-sheet folio-qasaves ' + cls });
    fr.setTitle(esc(title), esc(meta));
    fr.box.innerHTML = '<div class="spread"><div class="leaf" tabindex="-1">' + html + '</div></div>';
    layer = { el: fr.scrim, name: 'qa-saves' };
    layer.onCancel = () => finish(false);
    RB.ui.pushLayer(layer);
    return { fr, leaf: fr.box.querySelector('.leaf'), finish, done };
  }
  const intro = '<p class="note-slip warn">' + I('warn') + ' Development only (?dev=saves): a QA backup of one slot, for restoring into an empty slot. Not a player feature.</p>';

  function exportSheet(slot) {
    const sh = sheet('Export slot ' + slot + ' (QA)', 'Development only', intro +
      '<p><label for="qa-label">Label for this backup</label><br><input type="text" id="qa-label" maxlength="80" spellcheck="false" autocomplete="off" class="autofocus"></p>' +
      '<div class="cs-acts"><button class="pbtn primary" data-q="prepare">' + I('look') + '<span>Prepare the file</span></button></div>' +
      '<div data-q="out"></div>', 'qa-export');
    const out = sh.leaf.querySelector('[data-q=out]');
    let text = null;
    sh.leaf.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-q]');
      if (!b) return;
      const q = b.getAttribute('data-q');
      if (q === 'prepare') {
        b.disabled = true;
        try {
          const label = sh.leaf.querySelector('#qa-label').value.trim();
          const r = await QA.exportSlot(slot, label);
          text = r.text;
          sh.leaf.querySelector('#qa-label').disabled = true;
          out.innerHTML = '<h3>What the file holds</h3>' + previewHtml(r.previews) +
            '<p class="small">Payload ' + esc(kb(r.payloadBytes)) + ' · SHA-256 <code class="qa-sha">' + esc(r.sha256) + '</code></p>' +
            '<p class="small muted">Only this slot’s saves are in it: no settings, no other slot, nothing from the browser.</p>' +
            '<div class="cs-acts"><button class="pbtn primary" data-q="download">' + I('save') + '<span>Download</span></button>' +
            '<button class="pbtn" data-q="copy">' + I('copy') + '<span>Copy the text</span></button></div>' +
            '<p class="small" role="status" data-q-status></p>' +
            '<label for="qa-text" class="small">The file’s text</label><textarea id="qa-text" class="qa-text" rows="5" readonly spellcheck="false"></textarea>';
          out.querySelector('#qa-text').value = text;
        } catch (err) {
          b.disabled = false;
          out.innerHTML = errorsHtml([String((err && err.message) || err)]);
        }
      } else if (q === 'download' && text) {
        const label = sh.leaf.querySelector('#qa-label').value.trim().replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
        a.download = 'road-qa-slot' + slot + (label ? '-' + label : '') + '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
        out.querySelector('[data-q-status]').textContent = 'Download started: ' + a.download;
      } else if (q === 'copy' && text) {
        const st = out.querySelector('[data-q-status]'), ta = out.querySelector('#qa-text');
        const select = () => { ta.focus(); ta.select(); st.textContent = 'The text is selected: copy it with Ctrl+C (or the menu).'; };
        try {
          if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('no clipboard');
          await navigator.clipboard.writeText(text);
          st.textContent = 'Copied the text (' + text.length + ' characters).';
        } catch (err) { select(); }
      }
    });
    return sh.done;
  }

  function restoreSheet(slot) {
    const sh = sheet('Restore into slot ' + slot + ' (QA)', 'Development only · an empty slot only', intro +
      '<p><label for="qa-file">A QA save file</label><br><input type="file" id="qa-file" accept=".json,application/json"></p>' +
      '<p><label for="qa-paste">Or paste its text</label><textarea id="qa-paste" class="qa-text" rows="4" spellcheck="false" autocomplete="off"></textarea></p>' +
      '<div class="cs-acts"><button class="pbtn primary" data-q="check">' + I('look') + '<span>Check the file</span></button></div>' +
      '<div data-q="out"></div>', 'qa-restore');
    const out = sh.leaf.querySelector('[data-q=out]');
    let checked = null;
    // a new file or new text needs a new check before anything can be restored
    const stale = () => { checked = null; out.innerHTML = ''; };
    sh.leaf.querySelector('#qa-file').addEventListener('change', stale);
    sh.leaf.querySelector('#qa-paste').addEventListener('input', stale);
    async function source() {
      const f = sh.leaf.querySelector('#qa-file').files[0];
      if (f) {
        if (f.size > MAX_FILE) throw new Error('The file is too large.');
        return f.text();
      }
      return sh.leaf.querySelector('#qa-paste').value;
    }
    sh.leaf.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-q]');
      if (!b) return;
      const q = b.getAttribute('data-q');
      if (q === 'check') {
        b.disabled = true;
        try {
          const text = await source();
          const c = await QA.check(text);
          if (!c.ok) { checked = null; out.innerHTML = errorsHtml(c.errors); return; }
          checked = text;
          const f = c.file;
          out.innerHTML = '<h3>The file passed every check</h3>' +
            '<p class="small">Label “' + esc(f.label) + '” · from slot ' + f.sourceSlot + ' · exported ' + esc(f.exportedAt) + ' · version ' + esc(f.gameVersion) + ' · schema ' + f.saveSchema + '</p>' +
            '<p class="small">SHA-256 <code class="qa-sha">' + esc(f.sha256) + '</code></p>' + previewHtml(c.previews) +
            '<div class="cs-acts"><button class="pbtn primary" data-q="restore">' + I('load') + '<span>Restore into slot ' + slot + '…</span></button></div>';
        } catch (err) {
          checked = null;
          out.innerHTML = errorsHtml([String((err && err.message) || err)]);
        } finally { b.disabled = false; }
      } else if (q === 'restore' && checked != null) {
        const r = await RB.ui.confirm('Restore this file into empty slot ' + slot + '? Nothing else is changed. It loads afterwards through the ledger’s ordinary Load.', ['Restore', 'Cancel']);
        if (r !== 0 || checked == null) return;
        b.disabled = true;
        try {
          const res = await QA.restore(checked, slot);
          RB.ui.notice('Restored into slot ' + slot + (res.idChanged ? ' as an independent copy (its source is in this browser too).' : '.'), 'info');
          sh.finish(true);
        } catch (err) {
          b.disabled = false;
          out.insertAdjacentHTML('afterbegin', errorsHtml([String((err && err.message) || err)]));
        }
      }
    });
    return sh.done;
  }

  return { exportSheet, restoreSheet };
})();
