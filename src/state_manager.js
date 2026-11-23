/* ==========================================================================
   EVSTATE — GLOBAL SELECTION STATE MACHINE  (MASTER ENGINE / PROMPT 2)
   --------------------------------------------------------------------------
   ONE shared state machine owns BOTH activePartId and activeSceneId. UI chips,
   the 3D Raycaster, the engine focus hook and the bilingual side panel are all
   SUBSCRIBERS: nobody keeps a private copy of the selection. That is what
   makes UI -> 3D and 3D -> UI a strict two-way binding with no feedback loop.

   States   : unmounted | idle | partSelected | unmounting
   Events   : MOUNT, SET_SCENE, SET_PART, CLEAR_PART, SET_SPREAD, SET_LANG,
              UNMOUNT
   Guards   : SET_PART requires a real partId and a mounted scene
   Origin   : 'ui' | '3d' | 'deep-link' — recorded, never used to fork state

   Additive to R8's EVFSM (21 machines, untouched): EVSTATE is the domain
   machine for selection and publishes its snapshot into EVFSM.context() so
   the existing constitution can see it without changing its own manifest.

   Copyright / Developer : Paras Pranav
   ========================================================================== */

const EVSTATE = (function () {
  const VERSION = '1.0.0';
  const CREDIT = 'Copyright / Developer : Paras Pranav';
  const SCHEMA = 'eduverse.selection-state/v1';
  const STATES = ['unmounted', 'idle', 'partSelected', 'unmounting'];
  const ORIGINS = ['ui', '3d', 'deep-link', 'system'];

  let s = {
    state: 'unmounted', chapterId: null, packId: null, spreadIndex: 0,
    activeSceneId: null, activePartId: null, lang: 'both',
    origin: null, revision: 0
  };
  const subs = new Set();
  const history = [];
  let mirrorFn = null, strict = false, seq = 0, lastReason = '';
  const MAX_HISTORY = 300;

  const copy = o => JSON.parse(JSON.stringify(o));
  function snapshot() { return copy(s); }

  /* ------------------------------------------------------------- guards */
  function gPart(p, cur) {
    if (!p || !p.partId) return 'SET_PART needs a partId';
    if (cur.activeSceneId === null && !p.sceneId) return 'select a scene before a part';
    if (Array.isArray(p.allowedParts) && p.allowedParts.indexOf(p.partId) < 0)
      return 'partId "' + p.partId + '" is not in the active scene';
    if (p.origin && ORIGINS.indexOf(p.origin) < 0) return 'unknown selection origin';
    return true;
  }
  function gScene(p) { return (p && p.sceneId) ? true : 'SET_SCENE needs a sceneId'; }
  function gMounted(p, cur) {
    return cur.state === 'unmounted' ? 'selection is not mounted' : true;
  }

  const EVENTS = {
    MOUNT:      { from: ['unmounted', 'idle', 'partSelected', 'unmounting'], to: 'idle' },
    SET_SCENE:  { from: ['idle', 'partSelected'], to: 'idle', guard: gScene },
    SET_PART:   { from: ['idle', 'partSelected'], to: 'partSelected', guard: gPart },
    CLEAR_PART: { from: ['idle', 'partSelected'], to: 'idle', guard: gMounted },
    SET_SPREAD: { from: ['idle', 'partSelected'], to: 'idle', guard: gMounted },
    SET_LANG:   { from: ['idle', 'partSelected'], to: null, guard: gMounted },
    UNMOUNT:    { from: ['*'], to: 'unmounted' }
  };

  function apply(event, p) {
    switch (event) {
      case 'MOUNT':
        s.chapterId = p.chapterId || null; s.packId = p.packId || p.chapterId || null;
        s.spreadIndex = Math.max(0, p.spreadIndex | 0);
        s.activeSceneId = null; s.activePartId = null; s.origin = 'system';
        s.lang = p.lang || s.lang; break;
      case 'SET_SCENE':
        s.activeSceneId = p.sceneId; s.activePartId = null;
        s.spreadIndex = p.spreadIndex === undefined ? s.spreadIndex : Math.max(0, p.spreadIndex | 0);
        s.origin = p.origin || 'system'; break;
      case 'SET_PART':
        if (p.sceneId) s.activeSceneId = p.sceneId;
        s.activePartId = p.partId; s.origin = p.origin || 'ui'; break;
      case 'CLEAR_PART':
        s.activePartId = null; s.origin = 'system'; break;
      case 'SET_SPREAD':
        s.spreadIndex = Math.max(0, p.spreadIndex | 0);
        s.activeSceneId = null; s.activePartId = null; s.origin = 'system'; break;
      case 'SET_LANG':
        s.lang = ['en', 'hi', 'both'].indexOf(p.lang) >= 0 ? p.lang : s.lang; break;
      case 'UNMOUNT':
        s.chapterId = null; s.packId = null; s.spreadIndex = 0;
        s.activeSceneId = null; s.activePartId = null;
        s.origin = 'system'; break;
    }
  }

  function log(rec) {
    rec.n = ++seq;
    history.push(rec);
    if (history.length > MAX_HISTORY) history.shift();
    return rec;
  }

  function transition(event, payload) {
    const p = payload || {}, def = EVENTS[event], from = s.state;
    if (!def) { lastReason = 'unknown event ' + event; return reject(event, from, lastReason); }
    if (def.from.indexOf('*') < 0 && def.from.indexOf(from) < 0) {
      lastReason = 'no transition ' + event + ' from ' + from;
      return reject(event, from, lastReason);
    }
    if (def.guard) {
      const g = def.guard(p, s);
      if (g !== true) { lastReason = String(g); return reject(event, from, lastReason); }
    }
    const prev = snapshot();
    apply(event, p);
    s.state = def.to === null ? from : def.to;
    s.revision++;
    log({ event: event, from: from, to: s.state, ok: true,
          partId: s.activePartId, sceneId: s.activeSceneId, origin: s.origin,
          revision: s.revision });
    notify(event, prev);
    lastReason = '';
    return { ok: true, event: event, from: from, state: s.state,
             revision: s.revision, snapshot: snapshot() };
  }
  function reject(event, from, reason) {
    log({ event: event, from: from, to: from, ok: false, reason: reason, revision: s.revision });
    if (strict) throw new Error('EVSTATE strict: ' + reason);
    return { ok: false, event: event, from: from, state: from, reason: reason, snapshot: snapshot() };
  }
  function notify(event, prev) {
    const next = snapshot();
    subs.forEach(fn => { try { fn(next, event, prev); } catch (e) {
      log({ event: 'SUBSCRIBER_ERROR', from: prev.state, to: next.state, ok: false,
            reason: String(e && e.message || e) });
    } });
  }

  /* --------------------------------------------------------------- facade */
  function subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    subs.add(fn);
    return function unsubscribe() { subs.delete(fn); };
  }
  function mount(chapterId, spreadIndex, packId, lang) {
    return transition('MOUNT', { chapterId: chapterId, packId: packId,
      spreadIndex: spreadIndex || 0, lang: lang });
  }
  function setScene(sceneId, spreadIndex, origin) {
    return transition('SET_SCENE', { sceneId: sceneId, spreadIndex: spreadIndex, origin: origin });
  }
  function setPart(partId, origin, sceneId, allowedParts) {
    return transition('SET_PART', { partId: partId, origin: origin,
      sceneId: sceneId, allowedParts: allowedParts });
  }
  function clearPart() { return transition('CLEAR_PART', {}); }
  function setSpread(i) { return transition('SET_SPREAD', { spreadIndex: i }); }
  function setLang(l) { return transition('SET_LANG', { lang: l }); }
  function unmount() { return transition('UNMOUNT', {}); }

  /* mirror: read the REAL UI/engine selection to detect drift */
  function mirror(fn) { mirrorFn = typeof fn === 'function' ? fn : null; return !!mirrorFn; }
  function health() {
    const violations = [], drifts = [];
    if (s.state === 'partSelected' && (!s.activePartId || !s.activeSceneId))
      violations.push('partSelected without both ids');
    if (s.state === 'unmounted' && (s.activePartId || s.activeSceneId))
      violations.push('unmounted with a live selection');
    if (s.state !== 'unmounted' && !s.chapterId)
      violations.push('mounted without chapterId');
    if (mirrorFn) {
      let real = null;
      try { real = mirrorFn() || {}; } catch (e) { real = null; }
      if (real) {
        if (real.activePartId !== s.activePartId)
          drifts.push({ field: 'activePartId', fsm: s.activePartId, app: real.activePartId });
        if (real.activeSceneId !== s.activeSceneId)
          drifts.push({ field: 'activeSceneId', fsm: s.activeSceneId, app: real.activeSceneId });
      }
    }
    const rejected = history.filter(h => h.ok === false && h.event !== 'SUBSCRIBER_ERROR').length;
    return { ok: violations.length === 0 && drifts.length === 0,
      state: s.state, machines: 1, violations: violations, drifts: drifts,
      rejected: rejected, subscribers: subs.size, revision: s.revision,
      strict: strict, snapshot: snapshot() };
  }
  function assert() { const h = health(); return { ok: h.ok, violations: h.violations, drifts: h.drifts }; }
  function can(event, payload) {
    const def = EVENTS[event]; if (!def) return { ok: false, reason: 'unknown event' };
    if (def.from.indexOf('*') < 0 && def.from.indexOf(s.state) < 0)
      return { ok: false, reason: 'not allowed from ' + s.state };
    if (def.guard) { const g = def.guard(payload || {}, s); if (g !== true) return { ok: false, reason: String(g) }; }
    return { ok: true, reason: '' };
  }
  function allowed() { return Object.keys(EVENTS).filter(e => can(e, {}).ok); }
  function explain(event) {
    const c = can(event, {});
    return { event: event, current: s.state, ok: c.ok, reason: c.reason,
             allowedEvents: allowed(), declaredStates: STATES.slice(),
             hint: c.ok ? 'legal transition' : 'read docs/CHAPTER_PACKS.md' };
  }

  /* deep link: one reproducible selection capsule, separate from R8 ?state= */
  function encode(sel) {
    const o = sel || snapshot();
    const q = { parts: '1' };
    if (o.chapterId) q.world = o.chapterId;
    if (o.spreadIndex) q.spread = String(o.spreadIndex);
    if (o.activeSceneId) q.scene = o.activeSceneId;
    if (o.activePartId) q.part = o.activePartId;
    return q;
  }
  function link(base) {
    const q = encode();
    try {
      const u = new URL(base || location.href, location.href);
      Object.keys(q).forEach(k => u.searchParams.set(k, q[k]));
      return u.toString();
    } catch (e) { return null; }
  }
  function fromURL(search) {
    const q = new URLSearchParams(search === undefined ? location.search : search);
    return { parts: q.get('parts') === '1', chapterId: q.get('world'),
      spreadIndex: parseInt(q.get('spread') || '0', 10) || 0,
      sceneId: q.get('scene'), partId: q.get('part') };
  }

  function manifest() {
    return {
      schema: SCHEMA, version: VERSION, release: 'R8 + master-engine steps 1-4',
      credit: CREDIT, states: STATES.slice(), current: s.state,
      tracked: ['activePartId', 'activeSceneId'], snapshot: snapshot(),
      events: Object.keys(EVENTS).map(name => ({ event: name,
        from: EVENTS[name].from.slice(), to: EVENTS[name].to,
        guard: EVENTS[name].guard ? EVENTS[name].guard.name || 'inline' : null })),
      api: ['get()', 'transition()', 'mount()', 'setScene()', 'setPart()',
            'clearPart()', 'setSpread()', 'setLang()', 'unmount()',
            'subscribe()', 'mirror()', 'health()', 'assert()', 'can()',
            'allowed()', 'explain()', 'manifest()', 'history()', 'trace()',
            'strict()', 'link()', 'encode()', 'fromURL()'],
      health: health(), history: history.slice(-8)
    };
  }
  function contract() {
    return {
      schema: 'eduverse.selection-contract/v1', version: VERSION, prompt: 2,
      credit: CREDIT, states: STATES.slice(), origins: ORIGINS.slice(),
      tracked: ['activePartId', 'activeSceneId', 'chapterId', 'spreadIndex', 'lang'],
      events: Object.keys(EVENTS),
      guarantees: [
        'ONE state machine owns activePartId + activeSceneId',
        'UI chips and 3D Raycaster write through the SAME transition',
        'origin is recorded, never forked into a second state',
        'subscribers are notified atomically after each transition',
        'mirror() detects drift between state and rendered selection',
        'UNMOUNT clears both ids and the chapter reference',
        '0 own renderer, 0 DOM, 0 chapter hardcode',
        'R8 EVFSM 21-machine manifest remains untouched'
      ],
      deferred: {}
    };
  }

  return {
    VERSION, CREDIT, SCHEMA, STATES,
    get: snapshot, transition, mount, setScene, setPart, clearPart, setSpread,
    setLang, unmount, subscribe, mirror, health, assert, can, allowed, explain,
    manifest, contract, encode, link, fromURL,
    history: n => history.slice(-(n || 30)).reverse(),
    trace: () => history.slice(),
    strict: v => { if (v !== undefined) strict = !!v; return strict; },
    get subscribers() { return subs.size; },
    get state() { return s.state; },
    get activePartId() { return s.activePartId; },
    get activeSceneId() { return s.activeSceneId; },
    get lastReason() { return lastReason; }
  };
})();
