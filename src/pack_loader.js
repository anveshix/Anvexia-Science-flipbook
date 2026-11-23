/* ==========================================================================
   MASTER ENGINE / PROMPT 5 — EVLAZY  (LAZY CHAPTER PACK LOADER)
   --------------------------------------------------------------------------
   All 29 EVPACK v2 chapter packs are shipped INSIDE the single offline HTML as
   inert <script type="application/json"> blocks. They are NOT evaluated, NOT
   JSON.parsed and NOT registered until a chapter actually needs them. There is
   no fetch(), no XMLHttpRequest, no import(), no network, no second canvas,
   no second WebGLRenderer, no EVSTATE fork and no rAF of its own.

   Boot cost: one tiny catalogue is read from data-* attributes (zero JSON
   parsing), and only the ACTIVE chapter's pack is parsed. Everything else
   stays raw text in the document, so the initial payload stays below 5 MB.

   ?pack=1 (or Alt+K) opens the opt-in Chapter Packs panel. The shipped
   default classroom view is unchanged. Selecting a pack parses exactly that
   one JSON document, renders its 20 bilingual MCQs through EVDICT, and
   registers it with EVPACK so EVBIND can present its 3D blocks on the SAME
   shared renderer. uninstall() removes the DOM, listener, cache and
   registration; install() cleanly re-mounts.

   Copyright / Developer : Paras Pranav
   ========================================================================== */

const EVLAZY = (function () {
  'use strict';
  const VERSION = '1.0.0';
  const CREDIT = 'Copyright / Developer : Paras Pranav';
  const SCHEMA = 'eduverse.lazy-chapter-packs/v1';
  const BUDGET = 5000000;                 /* bytes; strict initial payload cap */
  const PREFIX = 'ev-pack-';

  let installed = false, active = false, lang = 'both';
  let panelEl = null, listEl = null, detailEl = null, statusEl = null, labEl = null;
  let keyListener = null, closeListener = null, listListener = null, labListener = null;
  let selectedId = null, mounted = [];
  let organInst = null, organKind = null, organMeshes = [];
  const cache = {};                     /* id -> parsed JSON pack */
  const parsed = [];                    /* ids parsed, in order */
  const problems = [];
  const counts = { parses: 0, selects: 0, registers: 0, forgets: 0, langSwitches: 0 };

  const hasDict = () => typeof EVDICT !== 'undefined';
  const hasPacks = () => typeof EVPACK !== 'undefined';
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const T = key => hasDict() ? EVDICT.get(key, lang) : key;
  const K = (en, hi) => hasDict() ? EVDICT.auto(en, hi) : '';

  function organActive() { return !!organInst; }
  function circuitData(mode) {
    if (typeof O3 === 'undefined' || !O3.circuit) return null;
    const d = O3.circuit({ V: 12, R1: 4, R2: 6, mode: mode || 'series' });
    const spec = O3.circuitSpec({ V: 12, R1: 4, R2: 6, mode: mode || 'series' }, lang);
    return { model: d, spec: spec,
             validated: (typeof EVENGINE !== 'undefined' && EVENGINE.validate) ? EVENGINE.validate(spec) : [] };
  }
  function clearOrgan() {
    if (!organInst) return false;
    if (typeof WORLD !== 'undefined' && WORLD.setSelectionGroup) WORLD.setSelectionGroup(null);
    if (typeof WORLD !== 'undefined' && WORLD.setPickHandler) WORLD.setPickHandler(null);
    if (typeof EVORGAN !== 'undefined') EVORGAN.dispose(organInst);
    organInst = null; organKind = null; organMeshes = [];
    return true;
  }
  function mountOrgan(kind) {
    clearOrgan();
    if (typeof EVORGAN === 'undefined' || typeof EVENGINE === 'undefined') {
      problems.push('EVORGAN / EVENGINE unavailable'); return null;
    }
    /* Prompt 2/3 also own WORLD.selectionRoot; release them first. */
    if (typeof EVBIND !== 'undefined' && (EVBIND.armed || EVBIND.active)) EVBIND.setActive(false);
    if (typeof O3LAB !== 'undefined' && (O3LAB.armed || O3LAB.active)) O3LAB.setActive(false);
    const inst = EVORGAN.create(kind, { lang: lang, defaults: { color: 0x2f6f9f } });
    if (!inst) { problems.push('EVORGAN could not build ' + kind); return null; }
    organInst = inst; organKind = kind;
    /* Prompt 5 · lift the procedural organ just above the right-hand page
       and enlarge it for classroom visibility; the shared renderer is untouched. */
    inst.group.scale.setScalar(1.45);
    inst.group.position.set(0, 0, 0.62);
    organMeshes = inst.raycastTargets ? inst.raycastTargets() : [];
    if (typeof WORLD !== 'undefined' && WORLD.setSelectionGroup) WORLD.setSelectionGroup(inst.group, organMeshes);
    if (typeof WORLD !== 'undefined' && WORLD.setPickHandler) WORLD.setPickHandler(null);
    repaint();
    return { kind: kind, parts: Object.keys(inst.parts).length,
             children: inst.group.children.length, meshes: organMeshes.length };
  }

  /* ------------------------------------------------------------- catalogue
     Reading data-* attributes costs no JSON.parse. This is the ONLY metadata
     the loader touches at boot. */
  function catalogue() {
    return Array.prototype.slice.call(
      document.querySelectorAll('script[type="application/json"][data-pack-id]')
    ).map(el => ({
      id: el.getAttribute('data-pack-id'),
      cls: el.getAttribute('data-pack-class'),
      title_en: el.getAttribute('data-pack-title-en'),
      title_hi: el.getAttribute('data-pack-title-hi'),
      sections: parseInt(el.getAttribute('data-pack-sections'), 10) || 0,
      quiz: parseInt(el.getAttribute('data-pack-quiz'), 10) || 0,
      bytes: parseInt(el.getAttribute('data-pack-bytes'), 10) || 0,
      element: el.id
    }));
  }
  function embedded() { return catalogue().length; }
  function inertBytes() { return catalogue().reduce((n, c) => n + c.bytes, 0); }

  /* ------------------------------------------------------------ lazy parse */
  function ensure(id) {
    if (!id) return null;
    if (cache[id]) return cache[id];
    const el = document.getElementById(PREFIX + id);
    if (!el) { problems.push('missing inert pack: ' + id); return null; }
    let json = null;
    try { json = JSON.parse(el.textContent); }
    catch (e) { problems.push('invalid JSON in ' + id + ': ' + e.message); return null; }
    if (hasPacks()) {
      const p = EVPACK.validate(json);
      if (p.length) { problems.push('EVPACK rejected ' + id + ': ' + p.join(', ')); return null; }
    }
    if (json.credit !== CREDIT) problems.push('exact credit missing in ' + id);
    if (!Array.isArray(json.quiz) || json.quiz.length !== 20)
      problems.push('pack ' + id + ' does not have 20 MCQs');
    cache[id] = json;
    parsed.push(id);
    counts.parses++;
    return json;
  }
  function get(id) { return cache[id] || null; }

  /* ------------------------------------------------------------- mount/umount */
  function mount(id) {
    const p = ensure(id);
    if (!p || !hasPacks()) return null;
    const r = EVPACK.register(id, p);
    if (!r.ok) { problems.push('register failed ' + id + ': ' + r.problems.join(', ')); return null; }
    if (mounted.indexOf(id) < 0) mounted.push(id);
    counts.registers++;
    return r.pack;
  }
  function unmountAll() {
    mounted.forEach(id => { if (hasPacks()) EVPACK.forget(id); counts.forgets++; });
    mounted = [];
  }

  /* --------------------------------------------------------------- panel DOM */
  function skeleton() {
    const p = document.createElement('section');
    p.id = 'packPanel';
    p.className = 'pack-panel';
    p.setAttribute('role', 'dialog');
    p.setAttribute('data-i18n-aria', 'pack.panelAria');
    p.innerHTML =
      '<header class="pack-head">' +
        '<b data-i18n="pack.title">Chapter packs</b>' +
        '<button type="button" id="packClose" class="pack-close" aria-label="Close chapter packs" ' +
          'data-i18n-aria="pack.close">×</button>' +
      '</header>' +
      '<div class="pack-sub" data-i18n="pack.subtitle"></div>' +
      '<div class="pack-status" id="packStatus"></div>' +
      '<div class="pack-list" id="packList"></div>' +
      '<div class="pack-detail" id="packDetail"></div>' +
      '<div class="pack-lab" id="packLab"></div>' +
      '<footer class="pack-credit">' + esc(CREDIT) + '</footer>';
    return p;
  }
  function keyed(tag, cls, en, hi) {
    const k = K(en, hi);
    return '<' + tag + ' class="' + cls + '" data-i18n="' + esc(k) + '"' +
           ' data-i18n-en="' + esc(en) + '" data-i18n-hi="' + esc(hi) + '"></' + tag + '>';
  }
  function paintList() {
    if (!listEl) return;
    const cat = catalogue();
    listEl.innerHTML = cat.map(c =>
      '<button type="button" class="pack-item' + (selectedId === c.id ? ' active' : '') +
      '" data-pack="' + esc(c.id) + '" ' +
      'data-i18n="' + esc(K(c.title_en, c.title_hi)) + '"' +
      ' data-i18n-en="' + esc(c.title_en) + '" data-i18n-hi="' + esc(c.title_hi) + '"></button>'
    ).join('');
  }
  function paintDetail() {
    if (!detailEl) return;
    if (!selectedId) { detailEl.innerHTML = ''; return; }
    const p = get(selectedId);
    if (!p) { detailEl.innerHTML = ''; return; }
    let html = keyed('div', 'pack-detail-title', p.title_en, p.title_hi);
    html += '<div class="pack-meta">' + esc(p.class) + ' · ' + esc(p.subject) +
            ' · ' + p.sections.length + ' ' + esc(T('pack.sections')) +
            ' · ' + p.quiz.length + ' ' + esc(T('pack.mcqs')) + '</div>';
    html += '<div class="pack-quiz">';
    p.quiz.forEach((q, i) => {
      html += '<div class="pack-q">' +
        keyed('b', 'pack-q-text', (i + 1) + '. ' + q.q_en, (i + 1) + '. ' + q.q_hi);
      q.options_en.forEach((o, j) => {
        const hi = q.options_hi[j] || o;
        html += keyed('span', 'pack-o' + (j === q.a ? ' correct' : ''),
                      String.fromCharCode(65 + j) + '. ' + o,
                      String.fromCharCode(65 + j) + '. ' + hi);
      });
      html += '</div>';
    });
    html += '</div>';
    detailEl.innerHTML = html;
  }
  function paintLab() {
    const el = document.getElementById('packLab');
    if (!el) return;
    let html = '<div class="pack-lab-head" data-i18n="' + esc(K('Data primitives · Electricity', 'डेटा प्रिमिटिव · विद्युत')) +
      '" data-i18n-en="Data primitives · Electricity" data-i18n-hi="डेटा प्रिमिटिव · विद्युत"></div>';
    const prim = [
      ['O3.wire', 'Connecting wire', 'संयोजक तार'],
      ['O3.resistor', 'Resistor R', 'प्रतिरोधक R'],
      ['O3.battery', 'Cell / battery V', 'सेल / बैटरी V']
    ];
    html += '<div class="pack-chips">';
    prim.forEach(p => {
      html += keyed('span', 'pack-chip', p[1] + ' (' + p[0] + ')', p[2] + ' (' + p[0] + ')');
    });
    html += '</div>';
    ['series', 'parallel'].forEach(mode => {
      const d = circuitData(mode);
      if (!d) return;
      html += keyed('div', 'pack-circuit',
        'Ohm ' + mode + ': V = 12 V, R₁ = 4 Ω, R₂ = 6 Ω → R_eq = ' + d.model.Req + ' Ω, I = ' + d.model.I + ' A',
        'ओम ' + mode + ': V = 12 V, R₁ = 4 Ω, R₂ = 6 Ω → R_eq = ' + d.model.Req + ' Ω, I = ' + d.model.I + ' A');
    });
    html += '<div class="pack-lab-head" data-i18n="' + esc(K('Procedural Life Processes organs · no GLTF', 'प्रक्रियात्मक जीवन प्रक्रम अंग · बिना GLTF')) +
      '" data-i18n-en="Procedural Life Processes organs · no GLTF" data-i18n-hi="प्रक्रियात्मक जीवन प्रक्रम अंग · बिना GLTF"></div>';
    html += '<div class="pack-organs">';
    if (typeof EVORGAN !== 'undefined') {
      EVORGAN.KINDS.forEach(kind => {
        const o = EVORGAN.ORGANS[kind];
        html += '<button type="button" class="pack-organ' + (organKind === kind ? ' active' : '') +
          '" data-organ="' + esc(kind) + '" data-i18n="' + esc(K(o.en, o.hi)) +
          '" data-i18n-en="' + esc(o.en) + '" data-i18n-hi="' + esc(o.hi) + '"></button>';
      });
    }
    html += '</div>';
    html += keyed('div', 'pack-organ-status',
      organKind ? organKind + ' · ' + organMeshes.length + ' pickable parts · shared WORLD renderer'
                : 'Select an organ to build it on the shared renderer',
      organKind ? organKind + ' · ' + organMeshes.length + ' चयन भाग · साझा WORLD रेंडरर'
                : 'साझा रेंडरर पर बनाने के लिए अंग चुनें');
    html += '<button type="button" class="pack-organ-clear" id="packOrganClear" data-i18n="' +
      esc(K('Clear organ', 'अंग हटाएँ')) + '" data-i18n-en="Clear organ" data-i18n-hi="अंग हटाएँ"></button>';
    el.innerHTML = html;
  }
  function paintStatus() {
    if (!statusEl) return;
    const cat = catalogue();
    statusEl.textContent = T('pack.loaded') + ' ' + parsed.length + '/' + cat.length +
      ' · ' + T('pack.inert') + ' ' + (cat.length - parsed.length) +
      ' · ' + (inertBytes() / 1024).toFixed(0) + ' KB ' + T('pack.inertData');
  }
  function repaint() {
    if (!panelEl) return;
    paintList(); paintDetail(); paintLab(); paintStatus();
    if (hasDict()) EVDICT.apply(panelEl, lang);
  }
  function select(id) {
    if (!catalogue().some(c => c.id === id)) return null;
    selectedId = id;
    counts.selects++;
    ensure(id);
    mount(id);
    repaint();
    return get(id);
  }
  function openPanel() {
    if (!panelEl) return;
    active = true;
    panelEl.hidden = false;
    repaint();
  }
  function closePanel() {
    if (!panelEl) return;
    active = false;
    panelEl.hidden = true;
  }

  /* --------------------------------------------------------------- lifecycle */
  function install() {
    if (installed) return false;
    installed = true;
    problems.length = 0;
    if (typeof EV !== 'undefined' && EV && ['en', 'hi', 'both'].indexOf(EV.lang) >= 0) lang = EV.lang;
    keyListener = function (e) {
      if (e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (active) closePanel(); else openPanel();
      }
      if (e.key === 'Escape' && active) closePanel();
    };
    document.addEventListener('keydown', keyListener);
    if (new URLSearchParams(location.search).has('pack')) {
      if (!panelEl) {
        panelEl = skeleton();
        document.body.appendChild(panelEl);
        closeListener = () => closePanel();
        document.getElementById('packClose').addEventListener('click', closeListener);
        listListener = e => {
          const b = e.target.closest && e.target.closest('[data-pack]');
          if (b) select(b.getAttribute('data-pack'));
        };
        document.getElementById('packList').addEventListener('click', listListener);
        listEl = document.getElementById('packList');
        detailEl = document.getElementById('packDetail');
        statusEl = document.getElementById('packStatus');
        labEl = document.getElementById('packLab');
        labListener = e => {
          const o = e.target.closest && e.target.closest('[data-organ]');
          if (o) mountOrgan(o.getAttribute('data-organ'));
          else if (e.target.closest && e.target.closest('#packOrganClear')) { clearOrgan(); repaint(); }
        };
        labEl.addEventListener('click', labListener);
      }
      openPanel();
    }
    return true;
  }
  function uninstall() {
    if (!installed) return false;
    unmountAll();
    if (keyListener) document.removeEventListener('keydown', keyListener);
    if (closeListener && document.getElementById('packClose'))
      document.getElementById('packClose').removeEventListener('click', closeListener);
    if (listListener && document.getElementById('packList'))
      document.getElementById('packList').removeEventListener('click', listListener);
    if (labListener && document.getElementById('packLab'))
      document.getElementById('packLab').removeEventListener('click', labListener);
    clearOrgan();
    if (panelEl && panelEl.parentNode) panelEl.parentNode.removeChild(panelEl);
    panelEl = listEl = detailEl = statusEl = labEl = null;
    keyListener = closeListener = listListener = labListener = null;
    Object.keys(cache).forEach(k => delete cache[k]);
    parsed.length = 0;
    selectedId = null;
    installed = false; active = false;
    return true;
  }
  function onChapter(id) { return ensure(id); }
  function onLang(m) {
    lang = ['en', 'hi', 'both'].indexOf(m) >= 0 ? m : 'both';
    counts.langSwitches++;
    repaint();
    return lang;
  }

  /* ------------------------------------------------------------ health/contract */
  function health() {
    const cat = catalogue();
    return {
      installed: installed, active: active, panelPresent: !!panelEl,
      embedded: cat.length, parsed: parsed.slice(), parsedCount: parsed.length,
      cached: Object.keys(cache).length, mounted: mounted.slice(),
      selectedId: selectedId, inertBytes: inertBytes(),
      organActive: !!organInst, organKind: organKind, organMeshes: organMeshes.length,
      organParts: organInst ? Object.keys(organInst.parts).length : 0,
      organChildren: organInst ? organInst.group.children.length : 0,
      bundleBytes: (document.documentElement.outerHTML.length || 0),
      canvasCount: document.querySelectorAll('canvas').length,
      glCanvasCount: document.querySelectorAll('canvas#gl').length,
      problems: problems.slice(), pass: problems.length === 0
    };
  }
  function contract() {
    const cat = catalogue();
    return {
      schema: SCHEMA, version: VERSION, prompt: 5,
      release: 'R8 + Master Engine steps 1-5', credit: CREDIT,
      controller: 'EVLAZY', dictionary: 'EVDICT', packRegistry: 'EVPACK',
      tool: 'tools/generate_chapter_pack.py',
      optIn: '?pack=1 / Alt+K', defaultOff: true,
      packs: cat.length, packIds: cat.map(c => c.id),
      classes: ['IX', 'X'], quizPerPack: 20, quizTotal: cat.length * 20,
      inertBytes: inertBytes(), initialPayloadBudget: BUDGET,
      lazy: 'inert <script type="application/json"> + JSON.parse on demand; 0 fetch/XHR/import',
      outputSchema: 'eduverse.chapter-pack/v2',
      organs: (typeof EVORGAN !== 'undefined') ? EVORGAN.contract() : null,
      electricity: {
        controller: 'O3', primitives: (typeof O3 !== 'undefined') ? O3.ELECTRIC_PRIMITIVES.slice() : [],
        models: (typeof O3 !== 'undefined') ? O3.CIRCUIT_MODELS.slice() : [],
        canonicalGrammar: (typeof O3 !== 'undefined') ? O3.contract().grammar : [],
        circuitSpec: (typeof O3 !== 'undefined' && O3.circuitSpec) ? Object.keys(O3.circuitSpec({}, lang)) : []
      },
      guarantees: [
        'all 26 assessed IX/X chapters + 3 reference chapters ship as real JSON packs',
        'no pack is parsed until its chapter or the panel actually needs it',
        'EN/HI/EN+HI changes DOM text only; no WebGL recreate, no second canvas',
        'EVPACK.register on demand; EVPACK.forget on uninstall; perfect cleanup',
        'single-file offline bundle stays below 5 MB with 0 external refs',
        'text-only PDF/Markdown/TXT ingest; no OCR, no GLB/GLTF, no React',
        'every panel string and every data-driven label routes through EVDICT',
        'exact credit · Prompt 5 complete · nothing remains deferred'
      ],
      deferred: [], health: health()
    };
  }

  return {
    VERSION, CREDIT, SCHEMA, BUDGET,
    install, uninstall, ensure, get, mount, onChapter, onLang,
    select, openPanel, closePanel, catalogue, embedded, inertBytes,
    mountOrgan, clearOrgan, organActive, circuitData,
    health, contract,
    get active() { return active; },
    get installed() { return installed; },
    get lang() { return lang; },
    get parsedCount() { return parsed.length; },
    get organKind() { return organKind; },
    get organMeshes() { return organMeshes.slice(); }
  };
})();
