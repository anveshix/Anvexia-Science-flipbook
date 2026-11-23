/* ==========================================================================
   EVPROJ — PROJECTOR MODE CONTROLLER  (MASTER ENGINE / PROMPT 4)
   --------------------------------------------------------------------------
   Opt-in classroom presentation mode: high contrast, straight board shot, 30 FT
   plate, hidden chrome, one canvas covering >=95% of the viewport, and a small
   dictionary-driven control strip. EN / HI / EN+HI changes ONLY DOM text: the
   existing WORLD WebGLRenderer, its canvas, its WebGL context and every mounted
   EVENGINE / O3LAB / EVBIND group survive untouched.

   No second WebGLRenderer, no second canvas, no rAF loop, no EVSTATE/EVFSM fork,
   no React, no CDN, no GLB/GLTF, no backend, no external refs. Prompt 5 remains
   deferred.

   Copyright / Developer : Paras Pranav
   ========================================================================== */

const EVPROJ = (function () {
  'use strict';
  const VERSION = '1.0.0';
  const CREDIT = 'Copyright / Developer : Paras Pranav';
  const SCHEMA = 'eduverse.projector-mode/v1';
  const RELEASE = 'R8 + Master Engine steps 1-4';
  const BODY_CLASS = 'p4-on';

  let installed = false, active = false, deepLink = false, lang = 'both';
  let barEl = null, toggleEl = null, langEl = null;
  let toggleListener = null, keyListener = null, langListener = null, barClickListener = null;
  let snapshot = null, lastApply = null;
  const problems = [];
  const counts = { installs: 0, uninstalls: 0, enters: 0, exits: 0,
                   langSwitches: 0, pageTurns: 0, applies: 0 };

  function hasDict() { return typeof EVDICT !== 'undefined'; }
  function txt(key) { return hasDict() ? EVDICT.get(key, lang) : key; }
  function esc(s) { return hasDict() ? EVDICT.esc(s) : String(s == null ? '' : s); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function app() { return document.getElementById('app'); }
  function stage() { return document.getElementById('stage'); }
  function canvas() {
    return (typeof WORLD !== 'undefined' && WORLD.canvas) ? WORLD.canvas : document.getElementById('gl');
  }
  function inModes(v) { return ['en', 'hi', 'both'].indexOf(v) >= 0; }

  /* --------------------------------------------------------------------- DOM */
  function makeToggle() {
    const b = document.createElement('button');
    b.id = 'btnProjector'; b.type = 'button';
    b.className = 'btn icon p4-toggle';
    b.setAttribute('aria-pressed', 'false');
    return b;
  }
  function paintToggle() {
    if (!toggleEl) return;
    const onKey = active ? 'p4.on' : 'p4.off', titleKey = active ? 'p4.on' : 'p4.enter';
    toggleEl.textContent = '▦';
    toggleEl.classList.toggle('active', active);
    toggleEl.setAttribute('aria-pressed', active ? 'true' : 'false');
    toggleEl.setAttribute('title', txt(titleKey));
    toggleEl.setAttribute('aria-label', txt(titleKey));
    toggleEl.setAttribute('data-i18n-title', titleKey);
    toggleEl.setAttribute('data-i18n-aria', titleKey);
    toggleEl.setAttribute('data-i18n-active', onKey);
    if (hasDict()) EVDICT.apply(toggleEl, lang);
  }
  function makeBar() {
    const b = document.createElement('aside');
    b.id = 'p4Bar'; b.className = 'p4-bar'; b.hidden = true;
    b.setAttribute('role', 'toolbar');
    b.innerHTML =
      '<div class="p4-head">' +
        '<span class="p4-eyebrow" data-i18n="p4.title"></span>' +
        '<span class="p4-sub" data-i18n="p4.subtitle"></span>' +
        '<span class="p4-chip" data-i18n="p4.highContrast"></span>' +
        '<span class="p4-chip" data-i18n="p4.canvas"></span>' +
        '<span class="p4-chip" data-i18n="p4.sharedRenderer"></span>' +
        '<span class="p4-chip" data-i18n="p4.noRecreate"></span>' +
      '</div>' +
      '<div class="p4-controls">' +
        '<label class="p4-label" for="p4Lang" data-i18n="p4.lang"></label>' +
        '<select class="p4-lang" id="p4Lang" aria-label="Language" data-i18n-aria="ui.language">' +
          '<option value="both" data-i18n="ui.langBoth"></option>' +
          '<option value="hi" data-i18n="ui.langHi"></option>' +
          '<option value="en" data-i18n="ui.langEn"></option>' +
        '</select>' +
        '<button type="button" class="p4-btn" id="p4Prev" data-i18n="p4.prev"></button>' +
        '<button type="button" class="p4-btn" id="p4Next" data-i18n="p4.next"></button>' +
        '<button type="button" class="p4-btn p4-view" id="p4Two" data-i18n-aria="plate2d.label" aria-pressed="false">2D</button>' +
        '<button type="button" class="p4-btn p4-view" id="p4Three" data-i18n-aria="plate3d.label" aria-pressed="true">3D</button>' +
        '<button type="button" class="p4-btn" id="p4Zoom" data-i18n="zoom.short" data-i18n-aria="zoom.open"></button>' +
        '<button type="button" class="p4-btn p4-exit" id="p4Exit" data-i18n="p4.exit"></button>' +
      '</div>' +
      '<div class="p4-foot">' +
        '<span class="p4-hint" data-i18n="p4.hint"></span>' +
        '<span class="p4-chip p4-bilingual" data-i18n="p4.bilingual"></span>' +
        '<span class="p4-deeplink" data-i18n="p4.deeplink"></span>' +
        '<span class="p4-credit" data-i18n="ui.credit">' + CREDIT + '</span>' +
      '</div>';
    return b;
  }
  function paintBar() {
    if (!barEl) return;
    if (langEl) langEl.value = lang;
    if (hasDict()) { lastApply = EVDICT.apply(barEl, lang); counts.applies++; }
    const two = barEl.querySelector('#p4Two'), three = barEl.querySelector('#p4Three');
    const is2d = typeof WORLD !== 'undefined' && !!WORLD.plate2d;
    if (two) { two.setAttribute('aria-pressed', String(is2d)); two.disabled = !(typeof EV !== 'undefined' && EV.world && WORLD.plate2dAvailable(EV.world)); }
    if (three) three.setAttribute('aria-pressed', String(!is2d));
    barEl.hidden = !active;
    barEl.setAttribute('aria-hidden', active ? 'false' : 'true');
    barEl.setAttribute('data-mode', lang);
    barEl.setAttribute('data-prompt', '4');
  }

  /* --------------------------------------------------------------- state */
  function capture() {
    return {
      view: (typeof EV !== 'undefined') ? EV.view : 'book',
      theme: (typeof EV !== 'undefined') ? EV.theme : 'classroom',
      shot: (typeof WORLD !== 'undefined' && WORLD.getShot) ? WORLD.getShot() : 'board',
      boardText: (typeof EV !== 'undefined') ? EV.boardText : 'detail',
      panels: (typeof EV !== 'undefined') ? clone(EV.panels) : { left: true, right: true },
      precision: (typeof EV !== 'undefined') ? !!EV.precision : false,
      ultra: (typeof EV !== 'undefined') ? !!EV.ultra : false,
      figureMode: (typeof WORLD !== 'undefined' && WORLD.figureMode) ? WORLD.figureMode : '3d',
      toolsOpen: (() => { const d = document.getElementById('toolsDrawer'); return !!(d && !d.hidden); })()
    };
  }
  function restore() {
    if (!snapshot) return;
    const s = snapshot;
    if (typeof setView === 'function') setView(s.view);
    if (typeof applyTheme === 'function') applyTheme(s.theme);
    if (typeof WORLD !== 'undefined' && WORLD.setShot) { WORLD.setShot(s.shot); if (typeof syncBoardUI === 'function') syncBoardUI(); }
    if (typeof applyBoardText === 'function') applyBoardText(s.boardText);
    if (typeof applyUltra === 'function') applyUltra(s.ultra);
    if (typeof WORLD !== 'undefined' && WORLD.setFigureMode) WORLD.setFigureMode(s.figureMode);
    if (typeof EV !== 'undefined') {
      EV.panels = clone(s.panels);
      EV.precision = !!s.precision;
    }
    if (typeof applyPanels === 'function') applyPanels();
    if (typeof applyPrecision === 'function') applyPrecision();
    const d = document.getElementById('toolsDrawer');
    if (d) d.hidden = !s.toolsOpen;
    snapshot = null;
  }
  function applyCanvasSizing() {
    if (typeof WORLD !== 'undefined' && WORLD.resize) {
      try { WORLD.resize(); } catch (e) { problems.push('WORLD.resize: ' + String(e && e.message || e)); }
    }
  }
  function setActive(v) {
    const want = !!v;
    if (want === active) { paintToggle(); paintBar(); return stats(); }
    if (!installed && want) return { ok: false, reason: 'not installed' };
    if (want) {
      snapshot = capture();
      active = true; counts.enters++;
      if (typeof setView === 'function') setView('book');
      if (typeof applyTheme === 'function') applyTheme('classroom');
      if (typeof WORLD !== 'undefined' && WORLD.setShot) {
        WORLD.setShot('board');
        if (typeof syncBoardUI === 'function') syncBoardUI();
      }
      if (typeof applyBoardText === 'function') applyBoardText('big');
      if (typeof EV !== 'undefined') {
        EV.panels.left = false; EV.panels.right = false; EV.precision = false;
      }
      if (typeof applyPanels === 'function') applyPanels();
      if (typeof applyPrecision === 'function') applyPrecision();
      const d = document.getElementById('toolsDrawer'); if (d) d.hidden = true;
      document.body.classList.add(BODY_CLASS);
      document.documentElement.setAttribute('data-projector', 'on');
      if (typeof toast === 'function') toast(txt('p4.toastOn'), 'ok');
    } else {
      document.body.classList.remove(BODY_CLASS);
      document.documentElement.setAttribute('data-projector', 'off');
      active = false; counts.exits++;
      restore();
      if (typeof toast === 'function') toast(txt('p4.toastOff'), 'ok');
    }
    paintToggle(); paintBar(); applyCanvasSizing();
    if (hasDict()) { lastApply = EVDICT.apply(document, lang); counts.applies++; }
    return stats();
  }
  function toggle() { return setActive(!active); }

  /* ---------------------------------------------------------- interaction */
  function onKey(e) {
    if (e.altKey && (e.key === 'p' || e.key === 'P' || e.code === 'KeyP')) {
      e.preventDefault(); toggle(); return;
    }
    if (!active) return;
    if (e.key === 'Escape') { e.preventDefault(); setActive(false); return; }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (typeof WORLD !== 'undefined' && WORLD.startTurn) {
        WORLD.startTurn(e.key === 'ArrowRight' ? 1 : -1); counts.pageTurns++;
      }
    }
  }
  function onLangChange(e) {
    const v = e && e.target ? e.target.value : 'both';
    if (typeof setLanguage === 'function') setLanguage(v);
    else { lang = inModes(v) ? v : 'both'; paintToggle(); paintBar(); }
  }
  function onBarClick(e) {
    const t = e.target;
    if (!t || !t.id) return;
    if (t.id === 'p4Exit') { setActive(false); return; }
    if ((t.id === 'p4Two' || t.id === 'p4Three') && typeof setPlateView === 'function') {
      setPlateView(t.id === 'p4Two' ? '2d' : '3d'); paintBar(); return;
    }
    if (t.id === 'p4Zoom' && typeof EVZOOM !== 'undefined') { EVZOOM.open(); return; }
    if ((t.id === 'p4Prev' || t.id === 'p4Next') && typeof WORLD !== 'undefined' && WORLD.startTurn) {
      WORLD.startTurn(t.id === 'p4Next' ? 1 : -1); counts.pageTurns++;
    }
  }

  /* ------------------------------------------------------------ lifecycle */
  function install() {
    if (installed) return { ok: true, already: true, active: active };
    const actions = document.querySelector('.top-actions');
    if (!actions) { problems.push('install(): .top-actions missing'); return { ok: false }; }
    if (!hasDict()) { problems.push('install(): EVDICT missing'); return { ok: false }; }
    lang = (typeof EV !== 'undefined' && inModes(EV.lang)) ? EV.lang : 'both';

    toggleEl = makeToggle();
    actions.insertBefore(toggleEl, document.getElementById('langSelect') || null);
    toggleListener = () => toggle();
    toggleEl.addEventListener('click', toggleListener);

    barEl = makeBar();
    document.body.appendChild(barEl);
    langEl = barEl.querySelector('#p4Lang');
    langListener = onLangChange;
    keyListener = onKey;
    barClickListener = onBarClick;
    if (langEl) langEl.addEventListener('change', langListener);
    barEl.addEventListener('click', barClickListener);
    window.addEventListener('keydown', keyListener);

    try { deepLink = new URLSearchParams(location.search).get('projector') === '1'; } catch (e) { deepLink = false; }
    installed = true; counts.installs++;
    paintToggle(); paintBar();
    if (hasDict()) { lastApply = EVDICT.apply(document, lang); counts.applies++; }
    if (deepLink) setActive(true);
    return { ok: true, active: active, deepLink: deepLink };
  }
  function uninstall() {
    if (!installed) return health();
    if (active) setActive(false);
    if (toggleEl && toggleListener) toggleEl.removeEventListener('click', toggleListener);
    if (langEl && langListener) langEl.removeEventListener('change', langListener);
    if (barEl && barClickListener) barEl.removeEventListener('click', barClickListener);
    if (keyListener) window.removeEventListener('keydown', keyListener);
    if (toggleEl && toggleEl.parentNode) toggleEl.parentNode.removeChild(toggleEl);
    if (barEl && barEl.parentNode) barEl.parentNode.removeChild(barEl);
    toggleEl = barEl = langEl = null;
    toggleListener = keyListener = langListener = barClickListener = null;
    document.body.classList.remove(BODY_CLASS);
    document.documentElement.setAttribute('data-projector', 'off');
    snapshot = null; installed = false; active = false; deepLink = false;
    counts.uninstalls++;
    return health();
  }
  function onLang(v) {
    if (inModes(v)) lang = v;
    counts.langSwitches++;
    document.documentElement.lang = lang === 'en' ? 'en' : 'hi';
    paintToggle(); paintBar();
    if (hasDict()) { lastApply = EVDICT.apply(document, lang); counts.applies++; }
    return stats();
  }
  function refresh() {
    paintToggle(); paintBar();
    if (hasDict()) { lastApply = EVDICT.apply(document, lang); counts.applies++; }
    return stats();
  }
  function onView() { return refresh(); }
  function onSpread() { return refresh(); }

  /* ---------------------------------------------------------- introspection */
  function canvasFraction() {
    const c = canvas(); if (!c) return 0;
    const r = c.getBoundingClientRect();
    const vw = window.innerWidth || 1, vh = window.innerHeight || 1;
    return +((Math.max(0, r.width) * Math.max(0, r.height)) / (vw * vh)).toFixed(4);
  }
  function identity() {
    const c = canvas();
    let ctx = null;
    if (c) {
      try { ctx = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'); } catch (e) {}
      if (c && !c.dataset.evP4Canvas) c.dataset.evP4Canvas = 'world-shared-canvas';
      if (ctx && !ctx.evP4Id) { try { ctx.evP4Id = 'world-shared-gl'; } catch (e) {} }
    }
    return {
      canvasCount: document.querySelectorAll('canvas').length,
      glCanvasCount: document.querySelectorAll('#gl').length,
      canvasId: c ? (c.dataset.evP4Canvas || null) : null,
      contextId: ctx ? (ctx.evP4Id || null) : null,
      o3GroupUuid: (typeof O3LAB !== 'undefined' && O3LAB.engineGroupId) ? O3LAB.engineGroupId() : null,
      selectionGroupCount: (typeof WORLD !== 'undefined' && WORLD.selectionGroupCount !== undefined) ? WORLD.selectionGroupCount : null
    };
  }
  function stats() {
    return {
      installed, active, deepLink, lang, counts: clone(counts),
      snapshot: snapshot ? clone(snapshot) : null,
      lastApply: lastApply ? clone(lastApply) : null,
      problems: problems.slice(), identity: identity(),
      canvasFraction: canvasFraction()
    };
  }
  function health() {
    const id = identity(), cssOn = document.body.classList.contains(BODY_CLASS);
    const topbar = document.querySelector('.topbar');
    const dock = document.querySelector('.dock');
    return {
      installed, active, deepLink, lang, bodyClass: cssOn,
      barPresent: !!barEl, barVisible: !!(barEl && !barEl.hidden),
      togglePresent: !!toggleEl, toggleActive: !!(toggleEl && toggleEl.classList.contains('active')),
      topbarHidden: !!topbar && getComputedStyle(topbar).display === 'none',
      dockHidden: !!dock && getComputedStyle(dock).display === 'none',
      canvasCount: id.canvasCount, glCanvasCount: id.glCanvasCount,
      canvasFraction: canvasFraction(), identity: id,
      theme: (typeof EV !== 'undefined') ? EV.theme : null,
      shot: (typeof WORLD !== 'undefined' && WORLD.getShot) ? WORLD.getShot() : null,
      boardText: (typeof EV !== 'undefined') ? EV.boardText : null,
      panels: (typeof EV !== 'undefined') ? clone(EV.panels) : null,
      listeners: {
        toggle: !!toggleListener, key: !!keyListener,
        lang: !!langListener, bar: !!barClickListener
      },
      subscribers: 0, rafRunning: false,
      dictionary: hasDict() ? EVDICT.health() : null,
      snapshot: snapshot ? clone(snapshot) : null,
      lastApply: lastApply ? clone(lastApply) : null,
      problems: problems.slice()
    };
  }
  function leaked() {
    return { installed, active, listeners: health().listeners, subscribers: 0,
             rafRunning: false, canvasCount: identity().canvasCount,
             barPresent: !!barEl, togglePresent: !!toggleEl,
             bodyClass: document.body.classList.contains(BODY_CLASS) };
  }
  function contract() {
    return {
      schema: SCHEMA, version: VERSION, prompt: 4, release: RELEASE, credit: CREDIT,
      controller: 'EVPROJ', dictionary: 'EVDICT', deepLink: '?projector=1',
      toggle: '#btnProjector', panel: '#p4Bar', langSelect: '#p4Lang',
      modes: ['en', 'hi', 'both'], keyboard: ['Alt+P', 'Escape', 'ArrowLeft', 'ArrowRight'],
      canvas: 'one shared WORLD / FIGURE3D WebGLRenderer; >=95% viewport',
      contrast: 'pure black ink on pure white opaque controls',
      hooks: ['install()', 'setActive(v)', 'toggle()', 'onLang(mode)', 'onView()', 'onSpread()', 'refresh()', 'uninstall()'],
      guarantees: [
        'opt-in only: shipped R3-R8 default views unchanged',
        'canonical EVDICT drives every chip, tag, label, title and aria-label',
        'EN / HI / EN+HI toggle changes DOM text only; no WebGL recreate',
        'one canvas, one WebGL context, one renderer, zero second rAF',
        'high contrast + 30 FT plate + straight board shot + hidden chrome',
        'canvas covers at least 95% of the viewport in projector mode',
        'EVENGINE / EVBIND / O3LAB groups keep their uuid through language changes',
        'perfect unmount cleanup: all listeners removed, DOM removed, state restored',
        'exact credit · 0 external refs · 0 React · 0 GLB/GLTF · 0 console errors'
      ],
      defaultParity: 'OFF unless ?projector=1, #btnProjector or Alt+P',
      deferred: []
    };
  }
  function debug() { return { contract: contract(), health: health(), stats: stats(), leaked: leaked() }; }

  return {
    VERSION, CREDIT, SCHEMA,
    install, uninstall, setActive, toggle, onLang, setLang: onLang,
    onView, onSpread, refresh, health, stats, leaked, identity,
    canvasFraction, contract, debug,
    get active() { return active; }, get armed() { return active; },
    get installed() { return installed; }, get deepLink() { return deepLink; },
    get problems() { return problems.slice(); }
  };
})();
