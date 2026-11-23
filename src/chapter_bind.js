/* ==========================================================================
   EVBIND — UI <-> 3D BINDING CONTROLLER   (MASTER ENGINE / PROMPT 2)
   --------------------------------------------------------------------------
   PRESENTATION ONLY. It reads the canonical JSON pack from EVPACK, builds the
   ONE 3D figure through EVENGINE (never a second WebGLRenderer), and renders
   the HTML chips + English/Hindi definition panel from the bilingual
   dictionary. It contains ZERO chapter names, ZERO hardcoded part labels and
   ZERO hardcoded scenes: everything comes from data.

   The whole two-way binding is ONE shared state machine (EVSTATE):

       HTML chip click  --\
                           >-- EVSTATE.transition(SET_PART) --> subscribers
       3D Raycaster pick --/                                      |
                                                                 v
       EVENGINE.focus(partId)  (highlight + pulse, dim others 15%)  +  panel repaint

   'origin' (ui | 3d) is only RECORDED for the badge; it never forks state.
   Both directions call the SAME function, so UI and 3D can never drift.

   Lifecycle: install() once; mount() per chapter; unmount() disposes the
   THREE.Group, cancels requestAnimationFrame, unsubscribes, removes the DOM
   listener, clears WORLD pick targets/handler and resets EVSTATE. Re-mount is
   clean. When parts-mode is OFF nothing is added to the scene and no panel is
   shown, so every shipped R3-R8 visual/QA gate is untouched by default.

   Copyright / Developer : Paras Pranav
   ========================================================================== */

const EVBIND = (function () {
  const VERSION = '1.0.0';
  const CREDIT = 'Copyright / Developer : Paras Pranav';
  const SCHEMA = 'eduverse.chapter-binding/v1';

  let installed = false, armed = false, active = false;
  let curChapter = null, curSpread = 0, lang = 'both';
  let pack = null, engine = null, group = null, meshes = [];
  let panelEl = null, toggleEl = null;
  let panelListener = null, toggleListener = null, unsub = null;
  let rafId = null, rafRunning = false, lastTick = 0;
  const problems = [];
  const counts = { mounts: 0, unmounts: 0, disposes: 0, scenesBuilt: 0,
                   uiSelections: 0, pickSelections: 0, clears: 0, langSwitches: 0 };
  const clone = o => JSON.parse(JSON.stringify(o));
  const hasWorldBridge = () => (typeof WORLD !== 'undefined') && (typeof WORLD.setSelectionGroup === 'function');

  function ui(key) {
    if (typeof EVDICT !== 'undefined') return EVDICT.get('pack.' + key, lang, EVPACK.uiText(key, lang));
    return EVPACK.uiText(key, lang);
  }
  function attrs(en, hi, key) { return (typeof EVDICT !== 'undefined') ? EVDICT.attrs(en, hi, key) : ''; }
  function inBook() {
    const hud = document.getElementById('bookHud');
    return !!(hud && !hud.hidden);
  }
  function setTxt(sel, s) { const n = panelEl && panelEl.querySelector(sel); if (n) n.textContent = s; }

  /* -------------------------------------------------------------- DOM skeleton
     Built ONCE. The delegated click listener lives on the persistent panel,
     so re-filling the chip containers never creates or leaks listeners. */
  function skeleton() {
    const p = document.createElement('section');
    p.id = 'evbPanel'; p.className = 'evb-panel'; p.hidden = true;
    p.setAttribute('aria-label', 'Chapter parts');
    p.setAttribute('data-i18n-aria', 'pack.panelAria');
    p.innerHTML =
      '<div class="evb-head">' +
        '<div class="evb-htext"><div class="evb-title" data-evb-title></div>' +
        '<div class="evb-sub" data-evb-sub></div></div>' +
        '<button class="btn icon evb-off" data-evb-off data-i18n-title="pack.close" title="Clear selection">×</button>' +
      '</div>' +
      '<div class="evb-sec"><div class="evb-label" data-evb-scenes-label data-i18n="pack.scenes"></div>' +
        '<div class="evb-chips evb-scenes" data-evb-scenes></div></div>' +
      '<div class="evb-sec"><div class="evb-label" data-evb-parts-label data-i18n="pack.parts"></div>' +
        '<div class="evb-chips evb-parts" data-evb-parts></div></div>' +
      '<div class="evb-def">' +
        '<div class="evb-empty" data-evb-empty data-i18n="pack.empty"></div>' +
        '<div class="evb-body" data-evb-body hidden>' +
          '<div class="evb-def-h" data-evb-h></div>' +
          '<div class="evb-def-en" data-evb-en></div>' +
          '<div class="evb-def-hi" data-evb-hi></div>' +
          '<div class="evb-origin" data-evb-origin></div>' +
        '</div>' +
      '</div>' +
      '<div class="evb-foot">' +
        '<button class="btn ghost tiny evb-clear" data-evb-clear data-i18n="pack.clear"></button>' +
        '<span class="evb-hint" data-evb-hint data-i18n="pack.pickHint"></span>' +
      '</div>' +
      '<div class="evb-credit">Copyright / Developer : Paras Pranav</div>';
    return p;
  }

  function makeToggle() {
    const b = document.createElement('button');
    b.id = 'btnParts'; b.type = 'button';
    b.className = 'btn ghost tiny evb-toggle';
    return b;
  }
  function paintToggle() {
    if (!toggleEl) return;
    toggleEl.textContent = '◈ ' + ui('parts');
    const titleKey = armed ? 'pack.on' : 'pack.off';
    toggleEl.title = ui(armed ? 'on' : 'off');
    toggleEl.setAttribute('aria-label', toggleEl.title);
    toggleEl.setAttribute('data-i18n-title', titleKey);
    toggleEl.setAttribute('data-i18n-aria', titleKey);
    toggleEl.classList.toggle('active', armed);
    toggleEl.setAttribute('aria-pressed', armed ? 'true' : 'false');
    if (typeof EVDICT !== 'undefined') EVDICT.apply(toggleEl, lang);
  }

  /* ---------------------------------------------------------------- install */
  function install() {
    if (installed) return { ok: true, already: true };
    const stage = document.getElementById('stage');
    const actions = document.querySelector('.top-actions');
    if (!stage || !actions) { problems.push('install(): stage/top-actions missing'); return { ok: false }; }
    panelEl = skeleton();
    stage.appendChild(panelEl);
    toggleEl = makeToggle();
    actions.insertBefore(toggleEl, actions.firstChild);
    toggleListener = function () { setActive(!armed); };
    toggleEl.addEventListener('click', toggleListener);
    paintToggle();
    /* One shared health mirror: the machine can detect drift from what the
       panel actually shows. It never forks a second source of truth. */
    if (typeof EVSTATE !== 'undefined') EVSTATE.mirror(() => ({
      activePartId: (panelEl.querySelector('[data-evb-part].active') || {}).getAttribute
        ? panelEl.querySelector('[data-evb-part].active').getAttribute('data-evb-part') : null,
      activeSceneId: typeof EVSTATE !== 'undefined' ? EVSTATE.activeSceneId : null
    }));
    installed = true;
    const q = (typeof EVSTATE !== 'undefined') ? EVSTATE.fromURL() : { parts: false };
    armed = !!q.parts;                 /* deep link ?parts=1 turns it on */
    paintToggle();
    return { ok: true, armed: armed };
  }

  /* ----------------------------------------------------------- 3D scene build */
  function currentPartIds() {
    const st = EVSTATE.get();
    const blk = st.activeSceneId ? EVPACK.block(curChapter, st.activeSceneId) : null;
    return (blk && blk.spec && Array.isArray(blk.spec.parts)) ? blk.spec.parts.map(p => p.id) : [];
  }
  function buildScene(sceneId) {
    /* Always dispose the previous group first: no GPU or JS leak on spread,
       scene or chapter change. */
    if (engine) { try { engine.dispose(); counts.disposes++; } catch (e) {} engine = null; }
    group = null; meshes = [];
    if (hasWorldBridge()) WORLD.setSelectionGroup(null);
    if (!pack || !sceneId) return null;
    const blk = EVPACK.block(curChapter, sceneId) ||
                (EVPACK.blocksFor(curChapter, EVSTATE.get().spreadIndex)[0]);
    if (!blk || !blk.spec || !Array.isArray(blk.spec.parts) || !blk.spec.parts.length) return null;
    /* EVENGINE only targets IX/X; keep the author's class in the DATA layer,
       coerce JUST for the presentation call. */
    const es = Object.assign({}, blk.spec, {
      class: String(blk.spec.class).toUpperCase() === 'X' ? 'X' : 'IX'
    });
    try {
      engine = EVENGINE.create(es, { lang: lang, defaults: { color: 0x2f6f9f } });
      group = engine.group;
      meshes = engine.raycastTargets();
      if (hasWorldBridge()) WORLD.setSelectionGroup(group, meshes);
      counts.scenesBuilt++;
      return engine.stats();
    } catch (e) {
      problems.push('EVENGINE.create: ' + String(e && e.message || e));
      try { if (engine) engine.dispose(); } catch (e2) {}
      engine = null; group = null; meshes = [];
      return null;
    }
  }

  /* ------------------------------------------------------------- pulse driver */
  function startRaf() {
    stopRaf();
    lastTick = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const tick = now => {
      if (!active) { rafRunning = false; return; }
      const dt = Math.min(0.05, Math.max(0, (now - lastTick) / 1000)); lastTick = now;
      if (engine) { try { engine.update({}, dt, now / 1000); } catch (e) {} }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick); rafRunning = true;
  }
  function stopRaf() { if (rafId) cancelAnimationFrame(rafId); rafId = null; rafRunning = false; }

  /* ------------------------------------------------------------- UI painting */
  function buildChips() {
    if (!panelEl) return;
    const scenesEl = panelEl.querySelector('[data-evb-scenes]');
    const partsEl = panelEl.querySelector('[data-evb-parts]');
    const scenes = pack ? pack['3d_blocks'] : [];
    const st = EVSTATE.get();
    const chip = (en, hi, attr, id) => {
      const key = (typeof EVDICT !== 'undefined') ? EVDICT.auto(en, hi) : '';
      const text = key ? EVDICT.get(key, lang) : (lang === 'hi' ? hi || en : lang === 'both' ? en + ' · ' + (hi || en) : en);
      return '<button type="button" class="evb-chip" ' + attr + '="' + esc(id) + '">' +
        '<span' + attrs(en, hi, key) + '>' + esc(text) + '</span></button>';
    };
    if (scenesEl) scenesEl.innerHTML = scenes.length ? scenes.map(b =>
      chip(b.title_en || b.id, b.title_hi || b.title_en || b.id, 'data-evb-scene', b.id)).join('')
      : '<span class="evb-none"' + attrs('No part selected', 'कोई अंग नहीं चुना') + '>' + esc(ui('empty')) + '</span>';
    const blk = st.activeSceneId ? EVPACK.block(curChapter, st.activeSceneId) : null;
    const parts = (blk && blk.spec) ? blk.spec.parts : [];
    if (partsEl) partsEl.innerHTML = parts.length ? parts.map(p =>
      chip(p.label_en || p.id, p.label_hi || p.label_en || p.id, 'data-evb-part', p.id)).join('')
      : '<span class="evb-none"' + attrs('No part selected', 'कोई अंग नहीं चुना') + '>' + esc(ui('empty')) + '</span>';
  }
  function paint() {
    if (!panelEl) return;
    setTxt('[data-evb-scenes-label]', ui('scenes'));
    setTxt('[data-evb-parts-label]', ui('parts'));
    setTxt('[data-evb-clear]', ui('clear'));
    setTxt('[data-evb-hint]', ui('pickHint'));
    setTxt('[data-evb-empty]', ui('empty'));
    const off = panelEl.querySelector('[data-evb-off]');
    if (off) off.title = ui('close');
    const st = EVSTATE.get();
    setTxt('[data-evb-title]', pack
      ? (lang === 'en' ? pack.title_en : lang === 'hi' ? pack.title_hi : pack.title_en + ' · ' + pack.title_hi)
      : ui('chapter'));
    setTxt('[data-evb-sub]', ui('scene') + ' · ' + (st.activeSceneId || '—'));

    panelEl.querySelectorAll('[data-evb-part]').forEach(b =>
      b.classList.toggle('active', b.getAttribute('data-evb-part') === st.activePartId));
    panelEl.querySelectorAll('[data-evb-scene]').forEach(b =>
      b.classList.toggle('active', b.getAttribute('data-evb-scene') === st.activeSceneId));

    const body = panelEl.querySelector('[data-evb-body]');
    const empty = panelEl.querySelector('[data-evb-empty]');
    const cap = st.activePartId ? EVPACK.caption(curChapter, st.activePartId) : null;
    if (cap && body && empty) {
      empty.hidden = true; body.hidden = false;
      setTxt('[data-evb-h]', lang === 'en' ? cap.title_en : lang === 'hi' ? cap.title_hi
        : cap.title_en + ' · ' + cap.title_hi);
      setTxt('[data-evb-en]', cap.definition_en || '');
      setTxt('[data-evb-hi]', cap.definition_hi || cap.definition_en || '');
      const en = panelEl.querySelector('[data-evb-en]'), hi = panelEl.querySelector('[data-evb-hi]');
      if (en) en.hidden = lang === 'hi';
      if (hi) hi.hidden = lang === 'en';
      setTxt('[data-evb-origin]', ui(st.origin === '3d' ? 'from3D' : 'fromUI'));
    } else if (body && empty) {
      body.hidden = true; empty.hidden = false;
    }
    panelEl.hidden = !(active && inBook());
    /* Prompt 4: every label / chip / tag on this panel is dictionary-driven. */
    if (typeof EVDICT !== 'undefined') EVDICT.apply(panelEl, lang);
  }
  function renderPanel() { buildChips(); paint(); }

  /* ----------------------------------------------------------- state -> view */
  function onState(next, event) {
    /* THE single convergence point: both UI and 3D arrive here. */
    if (engine) { try { engine.focus(next.activePartId || null); } catch (e) {} }
    if (event === 'SET_PART' && next.origin === '3d') counts.pickSelections++;
    if (event === 'SET_PART' && next.origin === 'ui') counts.uiSelections++;
    if (event === 'CLEAR_PART') counts.clears++;
    if (event === 'SET_SCENE' || event === 'SET_SPREAD') { buildScene(next.activeSceneId); renderPanel(); return; }
    paint();
  }
  function onPick(partId) {
    const st = EVSTATE.get();
    EVSTATE.setPart(partId, '3d', st.activeSceneId, currentPartIds());
  }
  function onPanelClick(e) {
    if (!e.target || !e.target.closest) return;
    const part = e.target.closest('[data-evb-part]');
    if (part) { EVSTATE.setPart(part.getAttribute('data-evb-part'), 'ui',
                   EVSTATE.get().activeSceneId, currentPartIds()); return; }
    const scene = e.target.closest('[data-evb-scene]');
    if (scene) { EVSTATE.setScene(scene.getAttribute('data-evb-scene'),
                   EVSTATE.get().spreadIndex, 'ui'); return; }
    if (e.target.closest('[data-evb-clear]')) { EVSTATE.clearPart(); return; }
    if (e.target.closest('[data-evb-off]')) { setActive(false); return; }
  }

  /* --------------------------------------------------------------- lifecycle */
  function mount(id, spread) {
    if (active) unmount();
    if (!installed) install();
    curChapter = id; curSpread = Math.max(0, spread | 0);
    pack = EVPACK.get(id);
    if (!pack) problems.push('EVPACK.get(' + id + ') returned null');
    lang = (typeof EV !== 'undefined' && EV.lang) ? EV.lang : 'both';
    EVSTATE.mount(id, curSpread, id, lang);
    const blocks = pack ? EVPACK.blocksFor(id, curSpread) : [];
    const sceneId = blocks.length ? blocks[0].id : null;
    if (sceneId) EVSTATE.setScene(sceneId, curSpread, 'system');
    unsub = EVSTATE.subscribe(onState);
    if (hasWorldBridge()) WORLD.setPickHandler(onPick);
    buildScene(sceneId);
    active = true;
    if (panelEl && !panelListener) {
      panelListener = onPanelClick;
      panelEl.addEventListener('click', panelListener);
    }
    renderPanel();
    startRaf();
    counts.mounts++;
    return stats();
  }
  function unmount() {
    if (!active) { /* still clear EVSTATE if a stray mount left it on */
      if (typeof EVSTATE !== 'undefined' && EVSTATE.state !== 'unmounted') EVSTATE.unmount();
      return stats();
    }
    stopRaf();
    if (panelEl && panelListener) { panelEl.removeEventListener('click', panelListener); panelListener = null; }
    if (unsub) { try { unsub(); } catch (e) {} unsub = null; }
    if (hasWorldBridge()) { WORLD.setPickHandler(null); WORLD.setSelectionGroup(null); }
    if (engine) { try { engine.dispose(); counts.disposes++; } catch (e) {} engine = null; }
    group = null; meshes = []; pack = null;
    EVSTATE.unmount();                 /* activePartId + activeSceneId -> null */
    if (panelEl) {
      const sc = panelEl.querySelector('[data-evb-scenes]'), pt = panelEl.querySelector('[data-evb-parts]');
      if (sc) sc.innerHTML = ''; if (pt) pt.innerHTML = '';
      panelEl.hidden = true;
    }
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
    /* Prompt 3 · both parts-mode and O3-mode own WORLD.selectionRoot. */
    if (armed && typeof O3LAB !== 'undefined' && (O3LAB.armed || O3LAB.active)) O3LAB.setActive(false);
    if (armed && typeof EVLAZY !== 'undefined' && EVLAZY.organActive()) EVLAZY.clearOrgan();
    if (armed) {
      if (curChapter) mount(curChapter, curSpread);
      else if (typeof EV !== 'undefined' && EV.world) { curChapter = EV.world.id; curSpread = WORLD.index; mount(curChapter, curSpread); }
    } else {
      unmount();
    }
    paintToggle();
    return stats();
  }
  function toggle() { return setActive(!armed); }

  /* ------------------------------------------------------------- app hooks */
  function onChapter(id, spread) {
    curChapter = id; curSpread = Math.max(0, spread | 0);
    if (armed) mount(id, curSpread);       /* unmount() is inside mount(): clean */
    else if (typeof EVSTATE !== 'undefined' && EVSTATE.state !== 'unmounted') EVSTATE.unmount();
    return stats();
  }
  function onSpread(i) {
    curSpread = Math.max(0, i | 0);
    if (!active) return stats();
    EVSTATE.setSpread(curSpread);
    const blocks = pack ? EVPACK.blocksFor(curChapter, curSpread) : [];
    const sceneId = blocks.length ? blocks[0].id : null;
    if (sceneId) EVSTATE.setScene(sceneId, curSpread, 'system');
    renderPanel();
    return stats();
  }
  function onView() { paint(); return stats(); }
  function setLang(l) {
    lang = ['en', 'hi', 'both'].indexOf(l) >= 0 ? l : lang;
    if (active) EVSTATE.setLang(lang);
    paintToggle();
    if (active) paint();
    if (typeof EVDICT !== 'undefined') EVDICT.apply(document, lang);
    counts.langSwitches++;
    return stats();
  }

  /* ------------------------------------------------------------ introspection */
  function focusEvidence() {
    const out = { focused: null, selected: null, targetMeshes: 0, dimmedMeshes: 0,
                  targetOpacity: null, otherOpacity: null, dim: 0.15 };
    if (!engine) return out;
    const sel = EVSTATE.activePartId;
    out.focused = engine.focused || null; out.selected = sel;
    engine.raycastTargets().forEach(o => {
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m || typeof m.opacity !== 'number') return;
      if (sel && o.userData.partId === sel) {
        out.targetMeshes++;
        if (out.targetOpacity === null || m.opacity > out.targetOpacity) out.targetOpacity = +m.opacity.toFixed(3);
      } else if (sel) {
        out.dimmedMeshes++;
        if (out.otherOpacity === null) out.otherOpacity = +m.opacity.toFixed(3);
      }
    });
    return out;
  }
  function leaked() {
    /* Prompt 3 · when EVBIND is unmounted but O3LAB legitimately owns the
       shared selectionRoot, those WORLD targets are NOT EVBIND leaks. */
    const externalOwner = !active && typeof O3LAB !== 'undefined' && O3LAB.active
      ? 'O3LAB' : (!active && typeof EVLAZY !== 'undefined' && EVLAZY.organActive()
      ? 'EVLAZY' : null);
    return {
      subscribers: (typeof EVSTATE !== 'undefined') ? EVSTATE.subscribers : -1,
      rafRunning: rafRunning,
      panelListener: !!panelListener,
      externalOwner: externalOwner,
      pickHandler: (hasWorldBridge() && WORLD.pickTargets().length) || 0,
      pickTargets: hasWorldBridge() ? WORLD.pickTargets().length : -1,
      groupAttached: hasWorldBridge() ? WORLD.selectionGroupCount : -1,
      engineAlive: !!engine,
      state: (typeof EVSTATE !== 'undefined') ? EVSTATE.state : 'missing'
    };
  }
  function stats() {
    return {
      version: VERSION, credit: CREDIT, installed: installed, armed: armed, active: active,
      chapterId: curChapter, spreadIndex: curSpread, sceneId: EVSTATE.get().activeSceneId,
      partId: EVSTATE.get().activePartId, lang: lang, origin: EVSTATE.get().origin,
      packSchema: pack ? pack.schema : null,
      scenes: pack ? pack['3d_blocks'].length : 0,
      parts: currentPartIds().length,
      engine: engine ? engine.stats() : null,
      raycastTargets: meshes.length,
      subscribers: EVSTATE.subscribers, rafRunning: rafRunning,
      pickTargets: hasWorldBridge() ? WORLD.pickTargets().length : -1,
      counts: clone(counts), problems: problems.slice()
    };
  }
  function health() {
    const lk = leaked(), st = (typeof EVSTATE !== 'undefined') ? EVSTATE.health()
      : { ok: false, violations: ['EVSTATE missing'], drifts: [] };
    const pick = lk.externalOwner ? 0 : lk.pickTargets;
    const groups = lk.externalOwner ? 0 : lk.groupAttached;
    const leakFree = active ? (lk.subscribers >= 1 && lk.panelListener)
                            : (lk.subscribers === 0 && !lk.rafRunning && !lk.panelListener &&
                               pick === 0 && groups === 0 && !lk.engineAlive &&
                               lk.state === 'unmounted');
    const ok = st.ok && leakFree && problems.length === 0;
    return { ok: ok, state: st.state, violations: st.violations, drifts: st.drifts,
             leakFree: leakFree, leaked: lk, problems: problems.slice(),
             active: active, armed: armed };
  }
  function debug() {
    return { stats: stats(), health: health(), focus: focusEvidence(),
             pick: hasWorldBridge() ? WORLD.pickDebug() : [],
             contractBundled: (typeof EVPACK !== 'undefined') && (typeof EVSTATE !== 'undefined') &&
                              (typeof EVENGINE !== 'undefined'),
             worldBridge: hasWorldBridge() };
  }
  function contract() {
    return {
      schema: SCHEMA, version: VERSION, prompt: 2, credit: CREDIT,
      release: 'R8 + master-engine steps 1-4', classes: ['IX', 'X'],
      dictionary: (typeof EVDICT !== 'undefined') ? EVDICT.health() : 'not bundled yet',
      modules: ['src/chapter_packs.js', 'src/state_manager.js', 'src/chapter_bind.js'],
      dataShape: ['sections', '3d_blocks', 'quiz', 'bilingual_captions'],
      stateTracked: ['activePartId', 'activeSceneId'],
      stateEvents: ['MOUNT', 'SET_SCENE', 'SET_PART', 'CLEAR_PART', 'SET_SPREAD', 'SET_LANG', 'UNMOUNT'],
      engines: (typeof EVENGINE !== 'undefined') ? EVENGINE.engines().map(e => e.id) : [],
      packContract: (typeof EVPACK !== 'undefined') ? EVPACK.contract() : null,
      stateContract: (typeof EVSTATE !== 'undefined') ? EVSTATE.contract() : null,
      guarantees: [
        'generic JSON pack for ANY chapter / ANY class / ANY subject',
        'ONE shared state machine owns activePartId + activeSceneId',
        'UI chip click and 3D Raycaster pick converge on one transition',
        'HTML chips + English/Hindi definition panel are 100% data + dictionary driven',
        'EVENGINE.focus() highlights/pulses the selected mesh and dims others to 15%',
        'global THREE.Raycaster hook in WORLD.onDown resolves mesh.userData.partId',
        'strict two-way UI <-> 3D binding with a drift-detecting mirror',
        'no dead buttons; every chip, scene tab, clear and toggle performs a real transition',
        'perfect cleanup on chapter unmount: dispose group, cancel rAF, unsubscribe, remove listeners, reset state',
        '0 own WebGLRenderer (shared WORLD/FIGURE3D), 0 React, 0 CDN, 0 GLTF/GLB',
        'R8 EVFSM 21-machine constitution and R7 biology gates untouched',
        'parts-mode is opt-in (?parts=1 or the toggle): default R3-R8 views are unchanged'
      ],
      deferred: {}
    };
  }

  return {
    VERSION, CREDIT, SCHEMA,
    install, mount, unmount, setActive, toggle,
    onChapter, onSpread, onView, setLang,
    registerPack: (id, json) => EVPACK.register(id, json),
    stats, health, debug, contract, focusEvidence, leaked,
    get active() { return active; },
    get armed() { return armed; },
    get problems() { return problems.slice(); }
  };
})();
