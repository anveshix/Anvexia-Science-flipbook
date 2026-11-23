/* EduVerse offline image adapter — CANDIDATE ONLY, not wired into WORLD.
 *
 * Mount in a dedicated right-page DOM container, with an onModeChange callback
 * supplied by the host. The host must align the container to the current page,
 * coordinate the existing page-bar/FSM, and render/restore the real 3D scene.
 * Never draw a local file image into WebGL or an export canvas: Chromium file://
 * images taint canvases. This adapter displays an <img> directly instead.
 *
 * Not a release claim: subject review, anchored labels, full accessibility and
 * mode/layout regression, and actual integration remain pending.
 */
(function (global) {
  'use strict';
  function createOfflineFigure(options) {
    const root = options && options.root;
    const onModeChange = options && options.onModeChange;
    if (!root || typeof onModeChange !== 'function') throw new TypeError('root and onModeChange are required');
    const doc = root.ownerDocument;
    let mode = '3d', imageReady = false, destroyed = false, generation = 0, returnFocus = null;
    let record = null;
    const el = (tag, cls) => { const n = doc.createElement(tag); if (cls) n.className = cls; return n; };
    const group = el('div', 'ev-offline-controls');
    group.setAttribute('role', 'group'); group.setAttribute('aria-label', 'Figure mode / चित्र मोड');
    const two = el('button', 'ev-offline-mode'), three = el('button', 'ev-offline-mode');
    two.type = three.type = 'button'; two.textContent = '2D'; three.textContent = '3D';
    group.append(two, three);
    const status = el('p', 'ev-offline-status'); status.setAttribute('role', 'status');
    const figure = el('figure', 'ev-offline-figure'); figure.hidden = true;
    const open = el('button', 'ev-offline-image-button'); open.type = 'button';
    open.setAttribute('aria-label', 'Enlarge illustration / चित्र बड़ा करें');
    const img = el('img', 'ev-offline-image'); open.append(img);
    const caption = el('figcaption', 'ev-offline-caption');
    figure.append(open, caption);
    const dialog = el('dialog', 'ev-offline-dialog'); dialog.setAttribute('aria-label', 'Enlarged illustration / बड़ा चित्र');
    const close = el('button', 'ev-offline-close'); close.type = 'button'; close.textContent = '×';
    close.setAttribute('aria-label', 'Close enlarged image / बड़ा चित्र बंद करें');
    const large = el('img', 'ev-offline-large');
    const modalCaption = el('p', 'ev-offline-modal-caption');
    dialog.append(close, large, modalCaption);
    root.append(group, status, figure, dialog);

    function paint() {
      two.setAttribute('aria-pressed', String(mode === '2d'));
      three.setAttribute('aria-pressed', String(mode === '3d'));
      two.disabled = !imageReady; figure.hidden = mode !== '2d';
    }
    /* Only a simple package-relative image name/path is accepted. No absolute,
       URL, query, encoded path or parent traversal may be supplied. */
    function localPath(value) {
      return typeof value === 'string' && /^(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:jpg|jpeg|png)$/i.test(value);
    }
    function use3D() {
      if (destroyed || mode === '3d') return;
      try { onModeChange('3d'); } catch (e) { status.textContent = 'Unable to restore 3D / 3D वापस नहीं आया'; return; }
      if (dialog.open) dialog.close();
      mode = '3d'; status.textContent = ''; paint();
    }
    function use2D() {
      if (destroyed || !imageReady || mode === '2d') return;
      try { onModeChange('2d'); } catch (e) { status.textContent = 'Unable to open 2D / 2D नहीं खुला'; return; }
      mode = '2d'; status.textContent = ''; paint();
    }
    function setAsset(next) {
      const token = ++generation;
      if (mode === '2d') use3D();
      if (destroyed || mode !== '3d') return;
      record = next || null; imageReady = false; img.removeAttribute('src');
      caption.textContent = ''; status.textContent = ''; paint();
      if (!record || !localPath(record.path)) {
        status.textContent = '2D image unavailable / 2D चित्र उपलब्ध नहीं'; return;
      }
      const probe = new Image();
      probe.onload = function () {
        if (destroyed || token !== generation) return;
        img.src = record.path;
        img.alt = [record.title_en || '', record.title_hi || ''].filter(Boolean).join(' / ');
        caption.textContent = img.alt; imageReady = true; status.textContent = ''; paint();
      };
      probe.onerror = function () {
        if (destroyed || token !== generation) return;
        imageReady = false; status.textContent = '2D image unavailable / 2D चित्र उपलब्ध नहीं'; paint();
      };
      probe.src = record.path;
    }
    two.addEventListener('click', use2D); three.addEventListener('click', use3D);
    open.addEventListener('click', function () {
      if (mode !== '2d' || !imageReady) return;
      returnFocus = open; large.src = img.src; large.alt = img.alt; modalCaption.textContent = caption.textContent;
      dialog.showModal(); close.focus();
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () { large.removeAttribute('src'); if (returnFocus && returnFocus.isConnected) returnFocus.focus(); });
    paint();
    return {
      setAsset, getMode: () => mode,
      destroy() {
        if (destroyed) return;
        use3D();
        if (mode !== '3d') return; /* host failed to restore; leave visible */
        destroyed = true; generation++; if (dialog.open) dialog.close();
        group.remove(); status.remove(); figure.remove(); dialog.remove();
      }
    };
  }
  global.EduVerseOfflineFigure = { create: createOfflineFigure };
})(window);
