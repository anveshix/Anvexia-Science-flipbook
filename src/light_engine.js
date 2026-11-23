/* ==========================================================================
   MASTER ENGINE / PROMPT 3 — O3 LIGHT LAB (EVENGINE DYNAMIC-SEGMENT ROUTING)
   --------------------------------------------------------------------------
   Opt-in companion to the seven shipped Class X Light spreads. The canonical
   O3 grammar and the four pure parametric models live in light_blocks.js; this
   file is ONLY the controller: it converts slider state into a declarative
   EVENGINE spec, attaches the returned THREE.Group to WORLD's SHARED renderer
   (the same selectionRoot/raycaster bridge Prompt 2 introduced), and rebuilds
   dynamic ray segments with EVENGINE.setSegments() on every slider move.

   Strict separation: O3.model() = DATA (JSON), EVENGINE = PRESENTATION
   (THREE.Group). No second WebGLRenderer, no React, no CDN, no GLB/GLTF, no
   chapter hardcode outside the shipped LIGHT_TYPES registry. Parts mode (Prompt
   2) and O3 mode are mutually exclusive because both use selectionRoot.

   Default view is unchanged: the lab is OFF unless the user clicks the O3
   toggle or deep-links with ?o3=1. Perfect unmount disposes the group, clears
   WORLD pick targets/handler, removes the panel listener and resets state.

   Copyright / Developer : Paras Pranav
   ========================================================================== */

const O3LAB = (function () {
  'use strict';
  const VERSION = '1.0.0';
  const CREDIT = 'Copyright / Developer : Paras Pranav';
  const SCHEMA = 'eduverse.o3-light-lab/v1';

  let installed = false, armed = false, active = false;
  let curChapter = null, curSpread = 0, lang = 'both';
  let sceneType = null, lab = null, lastModel = null, selected = null;
  let engine = null, group = null, meshes = [];
  let panelEl = null, toggleEl = null, panelListener = null, toggleListener = null;
  let rafId = null, rafRunning = false;
  const problems = [];
  const counts = { mounts: 0, unmounts: 0, disposes: 0, scenesBuilt: 0,
                   segmentRoutes: 0, recomputes: 0, picks: 0, raySelections: 0,
                   langSwitches: 0, clears: 0 };
  const hasBridge = () => (typeof WORLD !== 'undefined') &&
    (typeof WORLD.setSelectionGroup === 'function') && (typeof WORLD.setPickHandler === 'function');
  const hasEngine = () => (typeof EVENGINE !== 'undefined') && (typeof O3 !== 'undefined');
  const esc3 = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function ui(en, hi) {
    /* Prompt 4: every O3LAB literal resolves through the canonical dictionary. */
    if (typeof EVDICT !== 'undefined') return EVDICT.literal(en, hi, lang);
    if (lang === 'hi') return hi;
    if (lang === 'both') return en + ' / ' + hi;
    return en;
  }
  function D(en, hi, key) {
    en = String(en == null ? '' : en);
    if (hi == null || hi === '') hi = (typeof EVDICT !== 'undefined' && EVDICT.hiFor) ? EVDICT.hiFor(en) : '';
    hi = String(hi || en);
    const k = key || (typeof EVDICT !== 'undefined' ? EVDICT.auto(en, hi) : '');
    return {
      key: k,
      text: k && typeof EVDICT !== 'undefined' ? EVDICT.get(k, lang)
           : (lang === 'hi' ? hi : lang === 'both' ? en + ' / ' + hi : en),
      attrs: k && typeof EVDICT !== 'undefined' ? EVDICT.attrs(en, hi, k) : ''
    };
  }
  function inBook() {
    const hud = document.getElementById('bookHud');
    return !!(hud && !hud.hidden);
  }
  function currentSpread() {
    if (typeof EV === 'undefined' || !EV.world || typeof WORLD === 'undefined') return null;
    return EV.world.spreads[WORLD.index] || null;
  }
  function isLight(sp) {
    return !!(sp && sp.scene && typeof LIGHT_TYPES !== 'undefined' &&
              LIGHT_TYPES.indexOf(sp.scene.type) >= 0);
  }
  function params() {
    if (typeof WORLD === 'undefined' || !WORLD.getState) return {};
    return Object.assign({}, WORLD.getState().params || {});
  }

  /* ------------------------------------------------------------------- DOM */
  function skeleton() {
    const p = document.createElement('section');
    p.id = 'o3Panel'; p.className = 'o3-panel'; p.hidden = true;
    p.setAttribute('aria-label', 'O3 ray lab');
    p.setAttribute('data-i18n-aria', 'o3.panelAria');
    return p;
  }
  function makeToggle() {
    const b = document.createElement('button');
    b.id = 'btnO3'; b.type = 'button';
    b.className = 'btn ghost tiny o3-toggle';
    return b;
  }
  function paintToggle() {
    if (!toggleEl) return;
    const label = D('O3 rays', 'O3 किरणें', 'o3.rays');
    const title = armed
      ? D('O3 lab ON · click to close', 'O3 प्रयोगशाला चालू · बंद करने के लिए क्लिक करें', 'o3.labOn')
      : D('Open O3 ray lab', 'O3 किरण प्रयोगशाला खोलें', 'o3.open');
    toggleEl.textContent = '◉ ' + label.text;
    toggleEl.title = title.text;
    toggleEl.setAttribute('aria-label', title.text);
    toggleEl.setAttribute('data-i18n-title', title.key);
    toggleEl.setAttribute('data-i18n-aria', title.key);
    toggleEl.setAttribute('data-i18n-label', label.key);
    toggleEl.classList.toggle('active', armed);
    toggleEl.setAttribute('aria-pressed', armed ? 'true' : 'false');
    if (typeof EVDICT !== 'undefined') EVDICT.apply(toggleEl, lang);
  }
  function emptyPanel() {
    if (!panelEl) return;
    const title = D('O3 · Light ray lab', 'O3 · प्रकाश किरण प्रयोगशाला', 'o3.title');
    const sub = D('NCERT Class X · Chapter 9', 'NCERT कक्षा X · अध्याय 9', 'o3.sub');
    const empty = D('Open “Light – Reflection and Refraction” to arm the canonical O3 axis / ray / mirror / lens / arrow grammar.',
      'O3 अक्ष / किरण / दर्पण / लेंस / तीर व्याकरण चालू करने के लिए “प्रकाश – परावर्तन तथा अपवर्तन” खोलें।', 'o3.empty');
    const open = D('Open Class X Light', 'कक्षा X प्रकाश खोलें', 'o3.openLight');
    const hint = D('?o3=1 deep link', '?o3=1 डीप लिंक', 'o3.deeplink');
    const close = D('Close', 'बंद करें', 'o3.close');
    panelEl.innerHTML =
      '<div class="o3-head"><div class="o3-htext">' +
        '<div class="o3-title"' + title.attrs + '>' + esc3(title.text) + '</div>' +
        '<div class="o3-sub"' + sub.attrs + '>' + esc3(sub.text) + '</div>' +
      '</div><button type="button" class="btn icon o3-off" data-o3-close data-i18n-title="' + close.key + '" title="' + esc3(close.text) + '">×</button></div>' +
      '<div class="o3-empty"' + empty.attrs + '>' + esc3(empty.text) + '</div>' +
      '<div class="o3-foot"><button type="button" class="btn primary tiny" data-o3-open' + open.attrs + '>' +
        esc3(open.text) + '</button>' +
        '<span class="o3-hint"' + hint.attrs + '>' + esc3(hint.text) + '</span></div>' +
      '<div class="o3-credit">Copyright / Developer : Paras Pranav</div>';
    if (typeof EVDICT !== 'undefined') EVDICT.apply(panelEl, lang);
  }
  function renderPanel() {
    if (!panelEl) return;
    if (!lastModel) { emptyPanel(); return; }
    const m = lastModel;
    const title = D(m.title_en, m.title_hi);
    const caption = D(m.caption_en, m.caption_hi);
    const hint = D(m.hint_en, m.hint_hi);
    const eq = D(m.equation, m.equation_hi);
    const eqEn = D(m.equation, m.equation);
    const eqHi = D(m.equation_hi, m.equation_hi);
    const sub = D(m.model + ' · ' + m.sceneType + ' · ' + m.rayCount + ' dynamic segments',
                  m.model + ' · ' + m.sceneType + ' · ' + m.rayCount + ' गतिशील किरणें');
    const close = D('Close', 'बंद करें', 'o3.close');
    const eqList = m.equations.map(e => { const d = D(e); return '<li' + d.attrs + '>' + esc3(d.text) + '</li>'; }).join('');
    const rows = m.readouts.map(r => {
      const label = D(r.label), unit = D(r.unit);
      return '<div class="o3-ro"><span' + label.attrs + '>' + esc3(label.text) + '</span><b>' + esc3(r.value) +
        '<small' + unit.attrs + '>' + esc3(unit.text) + '</small></b><i style="width:' + esc3(r.pct) + '%"></i></div>';
    }).join('');
    const rays = m.segments.map((s, i) => {
      const label = D(s.label_en, s.label_hi), rule = D(s.rule);
      return '<button type="button" class="o3-ray' + (selected === s.id ? ' active' : '') +
        '" data-o3-ray="' + esc3(s.id) + '"><span>' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span' + label.attrs + '>' + esc3(label.text) + '</span>' +
        '<em' + rule.attrs + '>' + esc3(rule.text) + '</em></button>';
    }).join('');
    const selLabel = D('Selected in 3D', '3D में चयनित', 'o3.selected');
    const sel = selected ? '<div class="o3-selected"><span' + selLabel.attrs + '>' + esc3(selLabel.text) +
      '</span> · ' + esc3(selected) + '</div>' : '';
    const dynamic = D('Dynamic rays (click to focus)', 'गतिशील किरणें (फ़ोकस हेतु क्लिक करें)', 'o3.dynamic');
    const recompute = D('Recompute', 'पुनर्गणना', 'o3.recompute');
    const clearFocus = D('Clear focus', 'फ़ोकस हटाएँ', 'o3.clearFocus');
    panelEl.innerHTML =
      '<div class="o3-head"><div class="o3-htext">' +
        '<div class="o3-title"' + title.attrs + '>' + esc3(title.text) + '</div>' +
        '<div class="o3-sub"' + sub.attrs + '>' + esc3(sub.text) + '</div>' +
      '</div><button type="button" class="btn icon o3-off" data-o3-close data-i18n-title="' + close.key + '" title="' + esc3(close.text) + '">×</button></div>' +
      '<div class="o3-eq"' + eq.attrs + '>' + esc3(eq.text) + '</div>' +
      '<div class="o3-eq-en"' + eqEn.attrs + '>' + esc3(eqEn.text) + '</div>' +
      '<div class="o3-eq-hi"' + eqHi.attrs + '>' + esc3(eqHi.text) + '</div>' +
      '<div class="o3-cap"' + caption.attrs + '>' + esc3(caption.text) + '</div>' +
      '<ul class="o3-eqs">' + eqList + '</ul>' +
      '<div class="o3-ros">' + rows + '</div>' +
      '<div class="o3-rays-label"' + dynamic.attrs + '>' + esc3(dynamic.text) + '</div>' +
      '<div class="o3-rays">' + rays + '</div>' + sel +
      '<div class="o3-foot">' +
        '<button type="button" class="btn ghost tiny" data-o3-refresh' + recompute.attrs + '>' + esc3(recompute.text) + '</button>' +
        '<button type="button" class="btn ghost tiny" data-o3-clear' + clearFocus.attrs + '>' + esc3(clearFocus.text) + '</button>' +
        '<span class="o3-hint"' + hint.attrs + '>' + esc3(hint.text) + '</span></div>' +
      '<div class="o3-credit">Copyright / Developer : Paras Pranav</div>';
    if (typeof EVDICT !== 'undefined') EVDICT.apply(panelEl, lang);
  }
  function setStageLane(on) {
    if (typeof document === "undefined" || !document.body) return;
    const had = document.body.classList.contains("o3-on");
    document.body.classList.toggle("o3-on", !!on);
    if (had !== !!on && typeof WORLD !== "undefined" && WORLD.resize) {
      requestAnimationFrame(() => { try { WORLD.resize(); } catch (e) {} });
    }
  }
  function paint() {
    if (!panelEl) return;
    const show = active && inBook();
    setStageLane(show);
    panelEl.hidden = !show;
    if (show) renderPanel();
    paintToggle();
  }

  /* --------------------------------------------------------------- install */
  function install() {
    if (installed) return { ok: true, already: true, armed: armed };
    const stage = document.getElementById('stage'), actions = document.querySelector('.top-actions');
    if (!stage || !actions) { problems.push('install(): stage/top-actions missing'); return { ok: false }; }
    panelEl = skeleton(); stage.appendChild(panelEl);
    toggleEl = makeToggle(); actions.insertBefore(toggleEl, actions.firstChild);
    toggleListener = function () {
      const turningOn = !armed;
      setActive(turningOn);
      if (turningOn && !inBook() && typeof setView === 'function') setView('book');
      if (turningOn && typeof toast === 'function') {
        if (typeof EVDICT !== 'undefined') toast(EVDICT.get('o3.labArmed', lang), 'ok');
        else toast(ui('O3 ray lab armed', 'O3 किरण प्रयोगशाला चालू'), 'ok');
      }
    };
    toggleEl.addEventListener('click', toggleListener);
    let q = false;
    try { q = new URLSearchParams(location.search).get('o3') === '1'; } catch (e) {}
    armed = !!q;
    lang = (typeof EV !== 'undefined' && EV.lang) ? EV.lang : 'both';
    installed = true;
    paintToggle();
    return { ok: true, armed: armed };
  }

  /* ------------------------------------------------ EVENGINE segment routing */
  function visibleTargets() {
    if (!engine) return [];
    return engine.raycastTargets().filter(o => {
      let node = o;
      while (node) { if (node.visible === false) return false; node = node.parent; }
      return true;
    });
  }
  function route(model, p) {
    if (!engine || !model) return 0;
    const segs = model.segments.map(s => Object.assign({}, s));
    const routed = engine.setSegments(segs);
    engine.update({
      parts: Object.assign({}, model.parts),
      fields: Object.assign({}, p || {}),
      equations: model.equations.slice(),
      formula: model.equation,
      model: model.model,
      focus: selected || null
    }, 0, 0);
    lastModel = model;
    counts.segmentRoutes++;
    counts.recomputes++;
    /* Hidden grammar parts must never be pickable (THREE.Raycaster does not
       skip invisible meshes itself), and dynamic segments must be registered
       after setSegments() has rebuilt them. */
    meshes = visibleTargets();
    const ids = meshes.map(o => o.userData.partId);
    if (selected && ids.indexOf(selected) < 0) { selected = null; engine.focus(null); }
    if (hasBridge()) WORLD.setSelectionGroup(engine.group, meshes);
    return routed;
  }
  function rebuild() {
    if (!active || !engine || !sceneType || !lab) return null;
    const p = params(), m = O3.model(lab, p, sceneType);
    route(m, p);
    paint();
    return m;
  }
  function clearFocus() {
    selected = null;
    if (engine) engine.focus(null);
    counts.clears++;
    paint();
    return stats();
  }
  function onPick(partId) {
    if (!engine || !partId) return null;
    selected = partId;
    engine.focus(partId);
    counts.picks++;
    paint();
    return selected;
  }
  function onPanelClick(e) {
    const t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('[data-o3-close]')) { setActive(false); return; }
    if (t.closest('[data-o3-open]')) {
      if (typeof openChapter === 'function') openChapter('c10_light');
      return;
    }
    if (t.closest('[data-o3-refresh]')) { rebuild(); if (typeof toast === 'function') toast('O3 · ' + ui('recomputed', 'पुनर्गणना'), 'ok'); return; }
    if (t.closest('[data-o3-clear]')) { clearFocus(); return; }
    const ray = t.closest('[data-o3-ray]');
    if (ray) { onPick(ray.getAttribute('data-o3-ray')); counts.raySelections++; }
  }

  /* -------------------------------------------------------------- lifecycle */
  function mount(id, spread) {
    if (active) unmount();
    if (!installed) install();
    curChapter = id; curSpread = Math.max(0, spread | 0);
    lang = (typeof EV !== 'undefined' && EV.lang) ? EV.lang : lang;
    const sp = currentSpread();
    /* Both Prompt 2 parts-mode and Prompt 3 O3-mode own selectionRoot. */
    if (typeof EVBIND !== 'undefined' && (EVBIND.armed || EVBIND.active)) EVBIND.setActive(false);
    if (typeof EVLAZY !== 'undefined' && EVLAZY.organActive()) EVLAZY.clearOrgan();
    active = true;
    if (!isLight(sp) || !hasEngine() || !hasBridge()) {
      sceneType = sp && sp.scene ? sp.scene.type : null;
      lab = null; lastModel = null; selected = null;
      if (!hasEngine()) problems.push('O3/EVENGINE unavailable');
      if (!hasBridge()) problems.push('WORLD selection bridge unavailable');
    } else {
      sceneType = sp.scene.type;
      lab = O3.labType(sceneType);
      const p = params(), m = O3.model(lab, p, sceneType), s = O3.spec(lab, p, lang, sceneType);
      try {
        engine = EVENGINE.create(s, { lang: lang, defaults: { color: 0x2f6f9f } });
        group = engine.group;
        route(m, p);
        WORLD.setPickHandler(onPick);
        counts.scenesBuilt++;
      } catch (err) {
        problems.push('EVENGINE.create: ' + String(err && err.message || err));
        try { if (engine) engine.dispose(); } catch (e2) {}
        engine = null; group = null; meshes = []; lastModel = null;
      }
    }
    if (panelEl && !panelListener) {
      panelListener = onPanelClick;
      panelEl.addEventListener('click', panelListener);
    }
    paint();
    counts.mounts++;
    return stats();
  }
  function unmount() {
    if (!active) return stats();
    if (panelEl && panelListener) {
      panelEl.removeEventListener('click', panelListener); panelListener = null;
    }
    if (hasBridge()) {
      WORLD.setPickHandler(null);
      WORLD.setSelectionGroup(null);
    }
    if (engine) {
      try { engine.dispose(); counts.disposes++; } catch (e) {}
      engine = null;
    }
    group = null; meshes = []; lastModel = null; selected = null;
    sceneType = null; lab = null;
    if (panelEl) panelEl.hidden = true;
    setStageLane(false);
    active = false;
    counts.unmounts++;
    return stats();
  }
  function setActive(v) {
    const want = !!v;
    if (want === armed && (want === active || (!want && !active))) {
      armed = want; paintToggle(); return stats();
    }
    armed = want;
    if (want) {
      const id = (typeof EV !== 'undefined' && EV.world) ? EV.world.id : curChapter;
      const spread = (typeof WORLD !== 'undefined') ? WORLD.index : curSpread;
      if (id) mount(id, spread);
    } else unmount();
    paintToggle();
    return stats();
  }
  function toggle() { return setActive(!armed); }
  function onChapter(id, spread) {
    curChapter = id; curSpread = Math.max(0, spread | 0);
    if (armed) mount(id, curSpread);
    else if (active) unmount();
    return stats();
  }
  function onSpread(i) {
    curSpread = Math.max(0, i | 0);
    if (!active) return stats();
    return mount(curChapter, curSpread);   /* unmount()+dispose() inside */
  }
  function onParam(id, value, model, source) {
    if (!active || !engine) return stats();
    const p = params(); p[id] = value;
    const m = O3.model(lab, p, sceneType);
    route(m, p);
    paint();
    return stats();
  }
  function onView() { paint(); return stats(); }
  function setLang(l) {
    lang = ['en', 'hi', 'both'].indexOf(l) >= 0 ? l : lang;
    counts.langSwitches++;
    /* Prompt 4: no WebGL recreate — only canonical dictionary text changes. */
    paint();
    if (typeof EVDICT !== 'undefined') EVDICT.apply(document, lang);
    return stats();
  }

  /* ---------------------------------------------------------- introspection */
  function leaked() {
    const bridge = hasBridge();
    const externalOwner = !active && typeof EVBIND !== 'undefined' && EVBIND.active
      ? 'EVBIND' : (!active && typeof EVLAZY !== 'undefined' && EVLAZY.organActive()
      ? 'EVLAZY' : null);   /* Prompt 2 / Prompt 5 may legitimately own selectionRoot */
    return {
      subscribers: 0,                          /* O3LAB never forks EVSTATE */
      rafRunning: !!rafRunning,
      panelListener: !!panelListener,
      toggleListener: !!toggleListener,
      externalOwner: externalOwner,
      pickTargets: bridge ? WORLD.pickTargets().length : -1,
      groupAttached: bridge ? WORLD.selectionGroupCount : -1,
      engineAlive: !!engine && !engine.stats().disposed,
      state: active ? 'mounted' : 'unmounted',
      canvasCount: document.querySelectorAll('canvas').length
    };
  }
  function stats() {
    return {
      version: VERSION, credit: CREDIT, schema: SCHEMA,
      installed: installed, armed: armed, active: active,
      chapter: curChapter, spread: curSpread, sceneType: sceneType, lab: lab,
      lang: lang, selected: selected, model: lastModel ? lastModel.model : null,
      formula: lastModel ? lastModel.equation : null,
      rayCount: lastModel ? lastModel.segments.length : 0,
      engine: engine ? engine.stats() : null,
      pickTargets: hasBridge() ? WORLD.pickTargets().length : -1,
      groupCount: hasBridge() ? WORLD.selectionGroupCount : -1,
      counts: Object.assign({}, counts), problems: problems.slice(),
      leaked: leaked()
    };
  }
  function focusEvidence() {
    const out = { focused: null, selected: selected, targetMeshes: 0, dimmedMeshes: 0,
                  targetOpacity: null, otherOpacity: null, dim: 0.15 };
    if (!engine) return out;
    out.focused = engine.focused || null;
    visibleTargets().forEach(o => {
      const mm = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      mm.forEach(mat => {
        if (typeof mat.opacity !== 'number') return;
        if (o.userData.focusTarget) { out.targetMeshes++; out.targetOpacity = mat.opacity; }
        else if (Math.abs(mat.opacity - 0.15) < 0.02) { out.dimmedMeshes++; out.otherOpacity = mat.opacity; }
      });
    });
    return out;
  }
  function health() {
    const lk = leaked(), hasEngineNow = !!engine;
    const pick = lk.externalOwner ? 0 : lk.pickTargets;
    const groups = lk.externalOwner ? 0 : lk.groupAttached;
    const leakFree = active
      ? (lk.panelListener && !lk.rafRunning &&
         (!hasEngineNow || (pick >= 3 && groups === 1 && lk.engineAlive)))
      : (!lk.panelListener && !lk.rafRunning && pick === 0 &&
         groups === 0 && !lk.engineAlive);
    const invariantOK = !lastModel || !lastModel.invariants ||
      lastModel.invariants.passes !== false;
    const ok = leakFree && invariantOK && problems.length === 0;
    return { ok: ok, active: active, armed: armed, leakFree: leakFree,
             invariantOK: invariantOK, violations: problems.slice(),
             drifts: [], leaked: lk, focus: focusEvidence(),
             canvasCount: lk.canvasCount, rendererCount: 1 };
  }
  /* Headless QA evidence: the ACTUAL EVENGINE dynamic meshes, not just the
     pure model. Stable ids + geometry bounds prove setSegments() rebuilt them. */
  function segmentEvidence() {
    const out = [];
    if (!engine || !engine._segmentMeshes) return out;
    Object.keys(engine._segmentMeshes).forEach(id => {
      const mesh = engine._segmentMeshes[id];
      let box = null;
      try {
        mesh.geometry.computeBoundingBox();
        const b = mesh.geometry.boundingBox;
        box = [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z].map(v => +v.toFixed(4));
      } catch (e) {}
      out.push({ id: id, type: mesh.type || '', box: box,
                 disposed: !!(mesh.geometry && mesh.geometry.userData.disposed) });
    });
    return out.sort((a, b) => a.id.localeCompare(b.id));
  }
  function engineModel() { return engine ? engine.lastModel : null; }
  function engineGroupId() { return (engine && engine.group) ? engine.group.uuid : null; }
  function debug() {
    return { stats: stats(), health: health(), focus: focusEvidence(),
             model: lastModel, engineModel: engineModel(), segmentEvidence: segmentEvidence(),
             engineGroupId: engineGroupId(), contract: contract(), o3: O3.contract() };
  }
  function contract() {
    const c = O3.contract();
    return Object.assign({}, c, {
      schema: SCHEMA, version: VERSION, lab: 'O3LAB', prompt: 3,
      release: 'R8 + Master Engine steps 1-4',
      dictionary: (typeof EVDICT !== 'undefined') ? EVDICT.health() : 'not bundled yet',
      deepLink: '?o3=1', toggle: '#btnO3', panel: '#o3Panel',
      hooks: ['install()', 'onChapter(id,spread)', 'onSpread(i)', 'onParam(id,value,model,source)',
              'onView()', 'setLang(l)', 'setActive(v)', 'unmount()'],
      lifecycle: ['O3.model()', 'O3.spec()', 'EVENGINE.create(phys)',
                  'engine.setSegments(model.segments)', 'engine.update({parts,fields,focus})',
                  'WORLD.setSelectionGroup(group, raycastTargets())', 'engine.dispose()'],
      mutualExclusion: 'EVBIND parts-mode and O3LAB cannot own selectionRoot at the same time',
      cleanup: ['dispose EVENGINE group', 'clear WORLD pick targets', 'clear WORLD pick handler',
                'remove delegated panel listener', 'reset model/selection', 'no rAF'],
      guarantees: c.guarantees.concat([
        'opt-in only: shipped default views unchanged',
        'EN/HI/EN+HI changes DOM text without recreating the WebGL group',
        'Prompt 4 canonical EVDICT drives every O3 chip, tag and label',
        'perfect unmount cleanup and clean re-mount',
        'one shared WORLD WebGLRenderer / canvas'
      ]),
      deferred: {}
    });
  }

  return {
    VERSION: VERSION, CREDIT: CREDIT, SCHEMA: SCHEMA,
    install: install, mount: mount, unmount: unmount, setActive: setActive, toggle: toggle,
    onChapter: onChapter, onSpread: onSpread, onView: onView, onParam: onParam,
    setLang: setLang, refresh: rebuild, clearFocus: clearFocus,
    stats: stats, health: health, debug: debug, focusEvidence: focusEvidence,
    segmentEvidence: segmentEvidence, engineModel: engineModel, engineGroupId: engineGroupId,
    leaked: leaked, contract: contract,
    get active() { return active; }, get armed() { return armed; },
    get problems() { return problems.slice(); }, get model() { return lastModel; }
  };
})();
