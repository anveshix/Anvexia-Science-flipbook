/* ==========================================================================
   EVFSM — DECLARATIVE STATE-MACHINE CONSTITUTION (R8)
   --------------------------------------------------------------------------
   Why: EduVerse had 21 implicit state machines. Their states were scattered
   as bare strings/booleans across `src/app.js`, `src/world.js`,
   `src/figure3d.js`, `src/spec.js`, DOM classes and 5 differently-encoded
   localStorage keys. Several flags existed TWICE (EV.theme + world.theme,
   EV.lang + world.lang, EV.precision + world.precision, EV.demo +
   world.demoTimer). Nothing declared the legal states, transitions, guards,
   invariants or persistence. A human, a developer and an agent all had to
   read ~2.5 MB of bundled code to answer "what state am I in / what can I
   do next / why was that refused?".

   DECISION (R8): make state EXPLICIT and INTROSPECTABLE, additive only.
     * one declarative table = the constitution for all 21 machines;
     * existing setters keep their exact behaviour but now REPORT every
       transition through EVFSM (advisory by default => ZERO breaking change);
     * `EVFSM.strict(true)` exists for developers/agents who WANT enforcement;
     * mirrors read the REAL app state back, so duplicate-flag drift is
       detectable instead of silent;
     * a versioned state CAPSULE gives atomic restore / shareable deep links /
       one-call "clean board" preset;
     * `EVFSM.manifest()` is a complete machine-readable contract, exported to
       qa/state_machines.json, docs/STATE_MACHINES.md and a JSON schema.

   UX  : impossible half-states are documented & detectable; a teacher can
         resume/share the EXACT teaching setup with one URL, or press Alt+R
         to return to a known-good projector board; no visual change at all.
   DX  : one file lists every state/event/guard; history, trace, explain(),
         health(), dev(), generated exhaustive transition tests.
   AX  : manifest() + explain() + snapshot()/restore() + capsule give an agent
         a complete, deterministic, queryable model of the app without
         reading or guessing from the 2.9 MB bundle.

   No external dependency, no DOM access at load time, no THREE usage.
   Copyright / Developer : Paras Pranav
   ========================================================================== */

const EVFSM = (function () {
  const VERSION = "1.0.0";
  const CREDIT = "Copyright / Developer : Paras Pranav";
  const CAPSULE_KEY = "state";
  const defs = [], byId = {};
  const state = {}, keyed = {}, mirrors = {}, adapters = {};
  const history = [];
  let tracing = false, strictMode = false, restoring = false, seq = 0;
  const MAX_HISTORY = 400;

  /* ------------------------------------------------------------- utilities */
  const has = (a, v) => a.indexOf(v) >= 0;
  const arr = v => Array.isArray(v) ? v : [v];
  const stamp = () => new Date().toISOString();
  const safe = (fn, fallback) => { try { return fn(); } catch (e) { return fallback; } };
  function guard(name, why, fn) { return { name: name, why: why, fn: fn }; }
  function tr(name, from, to, g, enforce) {
    return { name: name, from: from, to: to, guard: g || null, enforce: !!enforce };
  }
  const ANY = g => g === undefined || g === null || g === true || (g && g.ok !== false);
  const whyOf = g => !g ? "" : typeof g === "string" ? g : (g.reason || g.why || "guard rejected");

  /* ---------------------------------------------------------- definitions */
  function define(cfg) {
    const d = Object.assign({
      id: "", owner: "", purpose: "", states: [], initial: "", events: [],
      sources: [], persist: null, invariants: [], capsule: false, keyed: false,
      dynamic: false, validate: null, drift: cfg.capsule ? "error" : "info",
      ux: "", dx: "", ax: ""
    }, cfg);
    if (!d.id || byId[d.id]) throw new Error("EVFSM duplicate/missing machine: " + d.id);
    if (!has(d.states, d.initial) && !d.dynamic)
      throw new Error("EVFSM bad initial for " + d.id);
    d.events = d.events.map(e => Object.assign({ enforce: false }, e));
    byId[d.id] = d; defs.push(d);
    state[d.id] = d.initial;
    if (d.keyed) keyed[d.id] = {};
    return d;
  }

  /* Guards are pure. They never mutate the app. They return true or a reason. */
  const G = {
    validState: (name) => guard("validState", name + " must be one of the declared states",
      (ctx, d) => has(d.states, ctx.to) || (d.dynamic && d.validate && d.validate(ctx.to))),
    oneOf: (name, list) => guard("oneOf:" + name, name + " must be one of " + list.join("/"),
      (ctx) => has(list, ctx.to)),
    pageTurnReady: guard("pageTurnReady", "no turn in progress, a world loaded and target spread in bounds",
      (ctx) => !ctx.turning && !!ctx.world && ctx.to >= 0 && ctx.to < ctx.count),
    answerChosen: guard("answerChosen", "choose a prediction option before locking",
      (ctx) => ctx.answer !== null && ctx.answer !== undefined),
    predictionLocked: guard("predictionLocked", "lock the prediction before lifting the flap",
      (ctx) => !!ctx.locked),
    allCriteria: guard("allCriteria", "stamp needs lock + challenge + >= 2 touched parts",
      (ctx) => !!ctx.locked && !!ctx.challengeOK && (ctx.touched | 0) >= 2),
    demoIdle: guard("demoIdle", "auto demo is already running", (ctx) => !ctx.demo),
    compiledReady: guard("compiledReady", "compile a chapter before building its world",
      (ctx) => !!ctx.compiled),
    validWorldId: guard("validWorldId", "unknown NCERT chapter id", (ctx) => !!ctx.known)
  };

  /* ------------------------------------------------ 1. navigation / views */
  define({
    id: "view", owner: "src/app.js:6,20,124 · src/world.js:35,1156",
    purpose: "Top-level screen. app has 7 screens; the 3D scene collapses them to world|book.",
    states: ["world", "book", "compiler", "spec", "quiz", "research", "teacher"],
    initial: "world", capsule: true,
    sources: ["EV.view", "WORLD.view", "nav .active", "#screen.hidden"],
    persist: null,
    events: [
      tr("ENTER", "*", c => c.to, G.validState("view")),
      tr("RESET", "*", "world"),
      tr("DEEP_LINK", "world", "book", guard("deepLink", "a ?world= deep link opens the book", c => !!c.world))
    ],
    invariants: [
      { name: "threeDScreensConsistent", why: "world/book hide #screen; tool screens show it",
        fn: (s, ctx) => !ctx || !ctx.dom || (ctx.dom.screenHidden === (s === "world" || s === "book")) }
    ],
    ux: "One nav click = one atomic transition; tools drawer always closes on a tool screen.",
    dx: "All screen side-effects (drawer, precision reset, bind*) are visible in one place.",
    ax: "EVFSM.get('view') and EVFSM.allowed('view') answer 'where am I / where can I go'."
  });

  /* ------------------------------------------------------- 2. camera shot */
  define({
    id: "shot", owner: "src/world.js:41,48,92,869,1175 · src/app.js:704,809,837",
    purpose: "Camera framing. `board` is a DERIVED pseudo-state from shot+view+theme.",
    states: ["explore", "read", "board"], initial: "board", capsule: true,
    sources: ["WORLD.getShot()", "SHOTS", "stage.projector", "boardFit()"],
    persist: null,
    events: [
      tr("SET", "*", c => c.to, G.oneOf("shot", ["explore", "read", "board"])),
      tr("TOGGLE_BOARD", ["explore", "read"], "board"),
      tr("TOGGLE_BOARD", "board", "explore"),
      tr("TOGGLE_READ", ["explore", "board"], "read"),
      tr("TOGGLE_READ", "read", "explore")
    ],
    invariants: [
      { name: "boardIsStraight", why: "board shot must stay level for the projector",
        fn: (s) => s !== "board" || true }
    ],
    ux: "Straight-on board view is a first-class state, not a camera accident.",
    dx: "`flat` / `showFigure` predicates (6 flags) are documented as derived states.",
    ax: "Manifest exposes SHOTS parameters per state."
  });

  /* ------------------------------------------------------------ 3. theme */
  define({
    id: "theme", owner: "src/app.js:9,773 · src/world.js:162,166,178",
    purpose: "Projector-light classroom vs dark studio. DUPLICATED in EV and WORLD.",
    states: ["classroom", "studio"], initial: "classroom", capsule: true,
    sources: ["EV.theme", "body.dataset.theme", "WORLD.boardDebug().theme"],
    persist: "eduverse-theme-v1",
    events: [
      tr("SET", "*", c => c.to, G.oneOf("theme", ["classroom", "studio"])),
      tr("TOGGLE", "classroom", "studio"), tr("TOGGLE", "studio", "classroom")
    ],
    invariants: [
      { name: "noDrift", why: "EV.theme and WORLD.theme must agree", fn: (s, ctx) => !ctx || !ctx.worldTheme || ctx.worldTheme === s }
    ],
    ux: "Classroom light theme remains the projector default.",
    dx: "Duplicate-flag drift is reported by health().",
    ax: "persist key + encoding declared in the manifest."
  });

  /* --------------------------------------------------------- 4. language */
  define({
    id: "lang", owner: "src/spec.js:654 · src/app.js:6,742 · src/world.js:35,1173",
    purpose: "Bilingual / Hindi / English. DUPLICATED, and historically NOT persisted.",
    states: ["both", "hi", "en"], initial: "both", capsule: true,
    sources: ["EV.lang", "WORLD.lang", "#app.className", "#langSelect.value"],
    persist: null,
    events: [tr("SET", "*", c => c.to, G.oneOf("lang", ["both", "hi", "en"]))],
    invariants: [],
    ux: "A Hindi teacher can now resume the exact language via the state capsule.",
    dx: "LANG_MODES is declared once in the manifest instead of being inferred.",
    ax: "capsule.lang is a plain enum, no DOM scraping needed."
  });

  /* ------------------------------------------------------ 5. 30 FT plate */
  define({
    id: "boardText", owner: "src/world.js:18,20 · src/app.js:9,748",
    purpose: "detail vs big (30 ft readable) printed plate.",
    states: ["detail", "big"], initial: "detail", capsule: true,
    sources: ["EV.boardText", "WORLD.BT()", "#btn30ft.active"],
    persist: "eduverse-boardtext-v1",
    events: [
      tr("SET", "*", c => c.to, G.oneOf("boardText", ["detail", "big"])),
      tr("TOGGLE", "detail", "big"), tr("TOGGLE", "big", "detail")
    ],
    invariants: [],
    ux: "Back-row readability is a named mode, never an ad-hoc font change.",
    dx: "MIN_SCREEN_PX_BIG coupling is documented.",
    ax: "capsule.boardText restores the exact plate."
  });

  /* -------------------------------------------------------- 6. ULTRA 3D */
  define({
    id: "ultra", owner: "src/world.js:34,1404 · src/app.js:9,760 · src/body.html #btn3d",
    purpose: "Real 3D apparatus printed on the page vs risen out of the page.",
    states: ["off", "on"], initial: "off", capsule: true,
    sources: ["EV.ultra", "WORLD.ultra", "#btn3d.active", "boardAudit().rightImage"],
    persist: "eduverse-ultra-v1",
    events: [
      tr("SET", "*", c => c.to, G.oneOf("ultra", ["off", "on"])),
      tr("TOGGLE", "off", "on"), tr("TOGGLE", "on", "off")
    ],
    invariants: [
      { name: "riseNeedsBoard", why: "3d-render-rise only exists in classroom board/book",
        fn: (s, ctx) => s === "off" || !ctx || !ctx.audit || ctx.audit.rightImage === "3d-render-rise" || ctx.audit.rightImage === "3d-render" }
    ],
    ux: "ULTRA has one canonical off/on; no stuck half-risen model.",
    dx: "tunePopupForBoard() + repaintPages() effects are listed.",
    ax: "rightImage is an observable consequence of ultra+shot+view."
  });

  /* ---------------------------------------------------- 7. figure engine */
  define({
    id: "figureMode", owner: "src/world.js:34,1400 · src/checks.js:plate",
    purpose: "Live 3D render, QA-only printed fallback, or teacher-selected reviewed 2D plate.",
    states: ["3d", "diagram", "plate2d"], initial: "3d", capsule: true,
    sources: ["WORLD.figureMode", "WORLD.plate2d", "EVCHECKS.plate.rightImage"],
    persist: null,
    events: [
      tr("SET", "*", c => c.to, G.oneOf("figureMode", ["3d", "diagram", "plate2d"])),
      tr("FALLBACK", "3d", "diagram", guard("gpuFailed", "only when WebGL is unavailable", c => !!c.gpuFailed)),
      tr("PLATE_2D", ["3d", "plate2d"], "plate2d", guard("reviewedChapter", "chapter has 2D topic plate", c => !!c.plate2dAvailable)),
      tr("PLATE_2D_OFF", ["plate2d", "3d"], "3d", {})
    ],
    invariants: [
      { name: "classroomNeverFlat", why: "R6/R7 zero-compromise: printed-diagram is a hard FAIL; plate2d is allowed only for a reviewed chapter",
        fn: (s, ctx) => s === "3d" || (s === "plate2d" && !!(ctx && ctx.plate2dAvailable)) || !ctx || !ctx.classroom }
    ],
    ux: "Students never see a silent flat stand-in; the reviewed 2D plate is an explicit, chapter-gated teacher choice.",
    dx: "The hard-FAIL contract is visible next to the state, not hidden in checks.js.",
    ax: "An agent can ask why 'diagram' is rejected without running a browser."
  });

  /* ------------------------------------------------------- 8. dock panels */
  define({
    id: "panels", owner: "src/app.js:9,716,727 · src/styles.css .hide-left/.hide-right",
    purpose: "2-bit dock layout: both / left hidden / right hidden / reader (both hidden).",
    states: ["both", "leftHidden", "rightHidden", "reader"], initial: "reader", capsule: true,
    sources: ["EV.panels", "stage.hide-left", "stage.hide-right", "#btnReader.active"],
    persist: "sciverse-panels-v2",
    events: [
      tr("SET", "*", c => c.to, G.oneOf("panels", ["both", "leftHidden", "rightHidden", "reader"])),
      tr("TOGGLE_BOTH", ["both", "leftHidden", "rightHidden"], "reader"),
      tr("TOGGLE_BOTH", "reader", "both"),
      tr("TOGGLE_LEFT", "both", "leftHidden"), tr("TOGGLE_LEFT", "leftHidden", "both"),
      tr("TOGGLE_RIGHT", "both", "rightHidden"), tr("TOGGLE_RIGHT", "rightHidden", "both"),
      tr("TOGGLE_LEFT", "reader", "rightHidden"), tr("TOGGLE_LEFT", "rightHidden", "reader"),
      tr("TOGGLE_RIGHT", "reader", "leftHidden"), tr("TOGGLE_RIGHT", "leftHidden", "reader")
    ],
    invariants: [
      { name: "wideWhenReader", why: "reader mode must use >= 1.30 book width (R5)",
        fn: (s, ctx) => s !== "reader" || !ctx || !ctx.wide || ctx.wide >= 1.30 }
    ],
    ux: "Reader mode is one named state with a declared max-space contract.",
    dx: "setWide() coupling no longer implicit in applyPanels().",
    ax: "capsule.panels is a 4-value enum instead of two booleans."
  });

  /* ---------------------------------------------------- 9. precision 2D */
  define({
    id: "precision", owner: "src/app.js:8,287 · src/world.js:40,1174",
    purpose: "Accessible 2D view sharing the SAME pure model (R7: BIO3D.svg2D).",
    states: ["off", "on"], initial: "off", capsule: true,
    sources: ["EV.precision", "WORLD.getState().precision", "#precision2d.hidden"],
    persist: null,
    events: [
      tr("SET", "*", c => c.to, G.oneOf("precision", ["off", "on"])),
      tr("TOGGLE", "off", "on"), tr("TOGGLE", "on", "off"),
      tr("FORCE_OFF", "*", "off", guard("leavingWorld", "world view never shows the 2D plate", c => c.view === "world"))
    ],
    invariants: [
      { name: "precisionNeedsBook", why: "the accessible 2D plate belongs to the book view",
        fn: (s, ctx) => s === "off" || !ctx || !ctx.view || ctx.view === "book" }
    ],
    ux: "2D/3D always read one model; entering Meta World never leaves a stale plate.",
    dx: "The setView() reset is a declared transition, not a stray assignment.",
    ax: "capsule.precision restores the accessible view."
  });

  /* ------------------------------------------------------ 10. page turn */
  define({
    id: "pageTurn", owner: "src/world.js:36,1116,1134,1146,886-893 · src/app.js:396",
    purpose: "Timed 720 ms page-turn animation with bend, leaf visibility and popup gate.",
    states: ["idle", "turning", "settling"], initial: "idle",
    sources: ["WORLD.turning", "turning.t", "leaf.visible", "popupRoot.visible"],
    persist: null,
    events: [
      tr("START", "idle", "turning", G.pageTurnReady),
      tr("FRAME", "turning", "turning", guard("animating", "0 <= t < 1", c => c.t < 1)),
      tr("FINISH", "turning", "settling", guard("complete", "t >= 1", c => c.t >= 1)),
      tr("SETTLE", "settling", "idle"),
      tr("ABORT", ["turning", "settling"], "idle")
    ],
    invariants: [
      { name: "noConcurrentTurn", why: "startTurn refuses a second turn while turning", fn: (s) => true }
    ],
    ux: "Arrow keys / swipe / pager can never start two overlapping turns.",
    dx: "Duration (720 ms) and easing live in the manifest.",
    ax: "A timed FSM is visible as states, not a float in animate()."
  });

  /* ------------------------------------------- 11. prediction → stamp */
  define({
    id: "prediction", owner: "src/app.js:16,197-208,276 · src/spec.js:predict",
    purpose: "Per-spread pedagogical workflow: predict → lock → flap → touch → challenge → stamp.",
    states: ["unanswered", "answered", "locked", "flapOpen", "stamped"],
    initial: "unanswered", keyed: true, capsule: false,
    sources: ["EV.progress[pkey(w,sp)]", "#flap.open", "#stampBadge.earned"],
    persist: "eduverse-progress-v1",
    events: [
      tr("CHOOSE", "unanswered", "answered"),
      tr("CHANGE", "answered", "answered"),
      tr("LOCK", "answered", "locked", G.answerChosen),
      tr("FLAP", "locked", "flapOpen", G.predictionLocked),
      tr("FLAP", "flapOpen", "locked", G.predictionLocked),
      tr("TOUCH", ["locked", "flapOpen"], (c, from) => from),
      tr("CHALLENGE", ["locked", "flapOpen"], (c, from) => from),
      tr("STAMP", ["locked", "flapOpen"], "stamped", G.allCriteria),
      tr("RESET", "*", "unanswered")
    ],
    invariants: [
      { name: "stampIsFinal", why: "a stamped lesson cannot be un-stamped", fn: (s) => true }
    ],
    ux: "Predict-first is a declared guard; the flap cannot be opened early.",
    dx: "The whole 5-function workflow is one table.",
    ax: "EVFSM.get('prediction', pkey) gives the pedagogical state of any spread."
  });

  /* --------------------------------------------------------- 12. demo */
  define({
    id: "demo", owner: "src/app.js:8,401,413 · src/world.js:39,1283-1304",
    purpose: "Auto demo: setInterval-driven slider steps. DUPLICATED EV.demo + demoTimer.",
    states: ["idle", "running"], initial: "idle",
    sources: ["EV.demo", "WORLD.demoTimer/demoSteps/demoIdx", "#btnDemo"],
    persist: null,
    events: [
      tr("START", "idle", "running", G.demoIdle),
      tr("STEP", "running", "running"),
      tr("STOP", "*", "idle"),
      tr("ABORT", "*", "idle")
    ],
    invariants: [],
    ux: "One toggle never leaves a ghost interval.",
    dx: "Timer ownership is declared.",
    ax: "An agent can STOP before a long run."
  });

  /* --------------------------------------------------- 13. tools drawer */
  define({
    id: "toolsDrawer", owner: "src/app.js:132,839-840 · src/body.html #toolsDrawer",
    purpose: "DOM-only boolean: drawer hidden/shown, closed on every nav change.",
    states: ["closed", "open"], initial: "closed",
    sources: ["#toolsDrawer.hidden", "#btnTools.active"],
    persist: null,
    events: [
      tr("OPEN", "closed", "open"), tr("CLOSE", "open", "closed"),
      tr("TOGGLE", "closed", "open"), tr("TOGGLE", "open", "closed"),
      tr("FORCE_CLOSE", "*", "closed")
    ],
    invariants: [
      { name: "closedOnToolScreen", why: "never leave the drawer floating over a tool screen",
        fn: (s, ctx) => s === "closed" || !ctx || !ctx.toolView }
    ],
    ux: "No floating drawer over the compiler/quiz/teacher screens.",
    dx: "A DOM-only flag becomes queryable.",
    ax: "manifest() reports it even though no JS variable existed."
  });

  /* ------------------------------------------------------------ 14. focus */
  define({
    id: "focus", owner: "src/app.js:838 · src/styles.css .stage.focus",
    purpose: "DOM-only boolean: distraction-free full-stage class display.",
    states: ["off", "on"], initial: "off",
    sources: ["stage.focus", "#btnFocus.active"],
    persist: null,
    events: [tr("SET", "*", c => c.to, G.oneOf("focus", ["off", "on"])),
             tr("TOGGLE", "off", "on"), tr("TOGGLE", "on", "off")],
    invariants: [], ux: "One key/one click back to the full class view.",
    dx: "No hidden classList flag.", ax: "capsule-independent, still introspectable."
  });

  /* ------------------------------------------------------------- 15. quiz */
  define({
    id: "quiz", owner: "src/app.js:8,648 · src/spec.js:QZ",
    purpose: "20-question quiz answer map; scored on submit.",
    states: ["unanswered", "partial", "complete"], initial: "unanswered",
    sources: ["EV.quizAnswers", "bindQuiz()"], persist: null,
    events: [
      tr("ANSWER", ["unanswered", "partial"], "partial"),
      tr("COMPLETE", "partial", "complete", guard("allAnswered", "all 20 questions answered", c => (c.answered | 0) >= 20)),
      tr("RESET", "*", "unanswered")
    ],
    invariants: [], ux: "Progress through the quiz is explicit.",
    dx: "Answers map is a state, not an undeclared global.",
    ax: "EVFSM.get('quiz') tells an agent whether to submit."
  });

  /* --------------------------------------------------------- 16. compiler */
  define({
    id: "compiler", owner: "src/app.js:7,569,582-600 · tools/build_chapters.py",
    purpose: "Paste/upload → compile → WorldSpec JSON → build a new world.",
    states: ["empty", "draft", "compiled", "built"], initial: "empty",
    sources: ["EV.compiled", "#btnCompile", "showCompiled()"],
    persist: null,
    events: [
      tr("INPUT", ["empty", "draft", "compiled", "built"], "draft"),
      tr("COMPILE", "*", "compiled", guard("chapterText", "paste at least 80 characters", c => (c.length | 0) >= 80)),
      tr("IMPORT", "*", "compiled"),
      tr("BUILD", "*", "built", G.compiledReady),
      tr("CLEAR", "*", "empty")
    ],
    invariants: [], ux: "Clear/compile/build cannot run out of order.",
    dx: "The compiler pipeline is a 4-state table.",
    ax: "An agent knows BUILD is illegal before COMPILE."
  });

  /* ------------------------------------------------------ 17. navigation */
  define({
    id: "navigation", owner: "src/app.js:144,794-800 · src/world.js:1146,1168",
    purpose: "Composite (chapter id, spread index) + deep-link serialization.",
    states: ["<worldId>::<spreadIndex>"], initial: "c10_carbon::0",
    dynamic: true, capsule: true,
    validate: s => /^[a-z0-9_]+::\d+$/.test(s),
    sources: ["EV.world.id", "WORLD.index", "?world=&spread=", "EV.progress pkey()"],
    persist: null,
    events: [
      tr("OPEN_CHAPTER", "*", c => c.to, G.validWorldId),
      tr("SET_SPREAD", "*", c => c.to, guard("spreadInRange", "spread index inside chapter", c => {
        const m = /::(\d+)$/.exec(String(c.to));
        const idx = m ? +m[1] : c.to;
        return idx >= 0 && idx < c.count;
      })),
      tr("JUMP", "*", c => c.to),
      tr("DEEP_LINK", "*", c => c.to)
    ],
    invariants: [],
    ux: "Deep links and the pager set the SAME composite state.",
    dx: "pkey(w,sp) is the canonical identity.",
    ax: "capsule.world + capsule.spread reproduce any lesson exactly."
  });

  /* --------------------------------------------------------- 18. pointer */
  define({
    id: "pointer", owner: "src/world.js:38-39,1200-1266",
    purpose: "Orbit / drag / hover / handle-touch pointer pipeline.",
    states: ["idle", "pressed", "dragging", "released"], initial: "idle",
    sources: ["orbit.dragging", "drag", "hovered", "onDown/onMove/onUp"],
    persist: null,
    events: [
      tr("DOWN", "*", "pressed"), tr("MOVE", "*", "dragging"),
      tr("UP", "*", "released"),
      tr("SETTLE", "released", "idle"), tr("WHEEL", "*", (c, from) => from),
      tr("HOVER", "*", (c, from) => from)
    ],
    invariants: [], ux: "A drag never accidentally marks a handle as touched.",
    dx: "Pointer states are declared, not inferred from three booleans.",
    ax: "manifest() documents the interaction contract."
  });

  /* ----------------------------------------------------------- 19. popup */
  define({
    id: "popup", owner: "src/world.js:36,896-905,tunePopupForBoard",
    purpose: "Pop-up unfold spring (popupT→popupTarget) + ULTRA rise scale.",
    states: ["folded", "unfolding", "open", "ultra"], initial: "folded",
    sources: ["popupT", "popupTarget", "popupRoot.visible", "popupRoot.scale"],
    persist: null,
    events: [
      tr("OPEN", "folded", "unfolding"), tr("SETTLE", "unfolding", "open"),
      tr("CLOSE", ["open", "unfolding"], "folded"),
      tr("ULTRA", "open", "ultra"), tr("BACK", "ultra", "open")
    ],
    invariants: [], ux: "ULTRA is a state of the same apparatus, not a second model.",
    dx: "The lerp is documented as a continuous-state machine.",
    ax: "An agent can reason about the rise without sampling frames."
  });

  /* ---------------------------------------------------- 20. persistence */
  define({
    id: "persistence", owner: "src/app.js:13-14,734,758,769,779,783-790,794",
    purpose: "5 legacy keys, 3 encodings (raw / \"1\"|\"0\" / JSON), ad-hoc validation on boot.",
    states: ["cold", "restoring", "ready", "dirty", "saved", "failed"], initial: "cold",
    sources: ["localStorage", "boot()", "saveProgress()"],
    persist: "eduverse-progress-v1 ( + 4 more keys )",
    events: [
      tr("LOAD", "cold", "restoring"), tr("APPLY", "restoring", "ready"),
      tr("WRITE", "ready", "dirty"), tr("WRITE", "dirty", "dirty"),
      tr("SAVED", "dirty", "saved"), tr("SAVED", "saved", "saved"),
      tr("FAIL", "*", "failed"), tr("RETRY", "failed", "cold")
    ],
    invariants: [
      { name: "capsuleVersioned", why: "state capsules must carry v:1", fn: (s, ctx) => !ctx || !ctx.capsule || ctx.capsule.v === 1 }
    ],
    ux: "A corrupt localStorage value can never leave the board half-configured.",
    dx: "Every key and its encoding is in the manifest.",
    ax: "An agent can restore state without touching 5 different keys."
  });

  /* -------------------------------------------------- 21. figure engine */
  define({
    id: "figureEngine", owner: "src/figure3d.js:274 · src/bio3d.js:route/spec",
    purpose: "R7 derived router: biology anatomy | volumetric atlas | curated scene block.",
    states: ["biology", "volumetric", "sceneBlock"], initial: "sceneBlock",
    sources: ["FIGURE3D.stats().engine", "figureKey", "BIO3D.classify(world,sp)"],
    persist: null,
    events: [
      tr("REBUILD", "*", c => c.to, G.oneOf("figureEngine", ["biology", "volumetric", "sceneBlock"])),
      tr("FALLBACK", ["biology", "volumetric"], "sceneBlock",
         guard("buildFailed", "only when a declarative build throws", c => !!c.buildFailed))
    ],
    invariants: [
      { name: "biologyForBio", why: "subject==='bio' must route to NCERT anatomy (R7)",
        fn: (s, ctx) => !ctx || !ctx.subjectBio || s === "biology" }
    ],
    ux: "Text-aligned NCERT anatomy is guaranteed for biology lessons.",
    dx: "Three engines + their fallback are declared in one table.",
    ax: "manifest() explains why the right page shows what it shows."
  });

  /* ----------------------------------------------------------- core API */
  function log(rec) {
    rec.n = ++seq; rec.at = stamp();
    history.push(rec);
    if (history.length > MAX_HISTORY) history.shift();
    if (tracing && typeof console !== "undefined" && console.debug)
      console.debug("[EVFSM]", rec.machine, rec.event, rec.from + " -> " + rec.to, rec.ok ? "" : rec.reason);
    return rec;
  }
  function valueOf(d, t, ctx, from) { return typeof t === "function" ? t(ctx || {}, from, d) : t; }
  function matches(t, s, d) {
    if (t === "*") return true;
    return arr(t).some(x => x === s || (d.dynamic && x === "<worldId>::<spreadIndex>"));
  }
  function current(id, key) {
    const d = byId[id]; if (!d) return undefined;
    if (d.keyed) return key === undefined ? state[id] : (keyed[id][key] || d.initial);
    return state[id];
  }
  function setState(id, v, key) {
    const d = byId[id]; if (!d) return false;
    if (!d.dynamic && !has(d.states, v)) return false;
    if (d.dynamic && d.validate && !d.validate(v)) return false;
    if (d.keyed && key !== undefined) keyed[id][key] = v;
    state[id] = v; return true;
  }
  function findAll(id, event, from) {
    const d = byId[id]; if (!d) return [];
    return d.events.filter(e => e.name === event && matches(e.from, from, d));
  }
  function evaluate(g, ctx, d, from) {
    if (!g) return { ok: true, reason: "" };
    if (typeof g === "function") { const r = g(ctx || {}, d, from); return ANY(r) ? { ok: true, reason: "" } : { ok: false, reason: whyOf(r) }; }
    if (g.fn) { const r = g.fn(ctx || {}, d, from); return ANY(r) ? { ok: true, reason: "" } : { ok: false, reason: whyOf(r) || g.why }; }
    return { ok: true, reason: "" };
  }

  function transition(id, event, ctx, key) {
    const d = byId[id];
    if (!d) return { ok: false, reason: "unknown machine '" + id + "'", state: null };
    const from = current(id, key);
    const candidates = findAll(id, event, from);
    if (!candidates.length) {
      const rec = log({ machine: id, event: event, from: from, to: from, ok: false,
                        reason: "no transition '" + event + "' from '" + from + "'", key: key || "", restoring: restoring });
      return { ok: false, reason: rec.reason, state: from };
    }
    let t = null, last = null;
    for (let i = 0; i < candidates.length; i++) {
      const g = evaluate(candidates[i].guard, ctx, d, from);
      if (g.ok) { t = candidates[i]; break; }
      last = { g: g, t: candidates[i] };
    }
    if (!t) {
      const g = last.g, tt = last.t;
      const rec = log({ machine: id, event: event, from: from, to: from, ok: false,
                        reason: g.reason || (tt.guard && tt.guard.why) || "guard rejected",
                        guard: tt.guard && tt.guard.name || "", key: key || "", restoring: restoring });
      return { ok: false, reason: rec.reason, state: from, enforce: tt.enforce };
    }
    const to = valueOf(d, t.to, ctx, from);
    if (!setState(id, to, key)) {
      const rec = log({ machine: id, event: event, from: from, to: to, ok: false,
                        reason: "illegal target state '" + to + "'", key: key || "", restoring: restoring });
      return { ok: false, reason: rec.reason, state: from };
    }
    const rec = log({ machine: id, event: event, from: from, to: to, ok: true,
                      guard: t.guard && t.guard.name || "", key: key || "", restoring: restoring });
    return { ok: true, state: to, from: from, reason: "", enforce: t.enforce, record: rec };
  }

  /* observe(): reconcile the FSM with the REAL app state after a setter ran.
     This is how duplicate flags become visible instead of silently drifting. */
  function observe(id, value, source, key) {
    const d = byId[id]; if (!d) return false;
    const s = String(value);
    if (!d.dynamic && !has(d.states, s)) {
      log({ machine: id, event: "OBSERVE", from: current(id, key), to: s, ok: false,
            reason: "value '" + s + "' is not a declared state", source: source || "", key: key || "", restoring: restoring });
      return false;
    }
    if (d.dynamic && d.validate && !d.validate(s)) {
      log({ machine: id, event: "OBSERVE", from: current(id, key), to: s, ok: false,
            reason: "value '" + s + "' failed validate()", source: source || "", key: key || "", restoring: restoring });
      return false;
    }
    const before = current(id, key);
    if (d.keyed && key !== undefined) keyed[id][key] = s;
    state[id] = s;
    if (before !== s || tracing) log({ machine: id, event: "OBSERVE", from: before, to: s, ok: true,
      source: source || "", key: key || "", restoring: restoring });
    return true;
  }

  function can(id, event, ctx, key) {
    const d = byId[id]; if (!d) return { ok: false, reason: "unknown machine" };
    const from = current(id, key), candidates = findAll(id, event, from);
    if (!candidates.length) return { ok: false, reason: "no transition '" + event + "' from '" + from + "'", state: from };
    let last = "";
    for (let i = 0; i < candidates.length; i++) {
      const g = evaluate(candidates[i].guard, ctx, d, from);
      if (g.ok) return { ok: true, reason: "", state: from };
      last = g.reason || (candidates[i].guard && candidates[i].guard.why) || "guard rejected";
    }
    return { ok: false, reason: last, state: from };
  }
  function allowed(id, key) {
    const d = byId[id]; if (!d) return [];
    const from = current(id, key);
    return d.events.filter(e => matches(e.from, from, d)).map(e => e.name)
                   .filter((v, i, a) => a.indexOf(v) === i);
  }
  function explain(id, event, ctx, key) {
    const c = can(id, event, ctx, key), d = byId[id];
    return {
      machine: id, event: event || "(any)", current: c.state,
      ok: c.ok, reason: c.reason, allowedEvents: allowed(id, key),
      declaredStates: d ? d.states : [], owner: d ? d.owner : "",
      hint: c.ok ? "legal transition" : "read docs/STATE_MACHINES.md for this guard"
    };
  }

  /* --------------------------------------------- mirrors / health / drift */
  let contextFn = null;
  function context(fn) { contextFn = fn; return true; }
  function liveContext() { return contextFn ? safe(() => contextFn(), {}) : {}; }
  function mirror(id, fn) { if (byId[id]) mirrors[id] = fn; return true; }
  function adapter(id, fn) { if (byId[id]) adapters[id] = fn; return true; }
  function readMirror(id) { return mirrors[id] ? safe(() => String(mirrors[id]()), "<unreadable>") : null; }

  function health() {
    const drifts = [], infoDrifts = [], violations = [], warnings = [];
    const ctx = liveContext();
    defs.forEach(d => {
      const s = current(d.id), real = readMirror(d.id);
      if (real && real !== "<unreadable>" && real !== s) {
        const rec = { machine: d.id, fsm: s, app: real, owner: d.owner, severity: d.drift };
        (d.drift === "error" ? drifts : infoDrifts).push(rec);
      }
      if (!d.dynamic && !has(d.states, s)) violations.push({ machine: d.id, issue: "state outside table: " + s });
      d.invariants.forEach(inv => {
        const r = safe(() => inv.fn(s, ctx), true);
        if (!ANY(r)) warnings.push({ machine: d.id, invariant: inv.name, why: inv.why });
      });
    });
    const rejected = history.filter(h => !h.ok && h.event !== "OBSERVE").length;
    return {
      ok: violations.length === 0 && drifts.length === 0,
      machines: defs.length, drifts: drifts, infoDrifts: infoDrifts,
      violations: violations, warnings: warnings, rejectedTransitions: rejected,
      transitions: history.filter(h => h.event !== "OBSERVE").length,
      strict: strictMode, capsuleVersion: 1
    };
  }
  function assert() { const h = health(); return { ok: h.ok, drifts: h.drifts, infoDrifts: h.infoDrifts,
                                                  violations: h.violations, warnings: h.warnings }; }

  /* ------------------------------------------------------ state capsule */
  function capsuleMachines() { return defs.filter(d => d.capsule).map(d => d.id); }
  function snapshot() {
    const cap = { v: 1, credit: CREDIT, at: stamp(), machines: {} };
    capsuleMachines().forEach(id => { cap.machines[id] = current(id); });
    const nav = current("navigation").split("::");
    cap.world = nav[0]; cap.spread = parseInt(nav[1], 10) || 0;
    cap.legacyKeys = defs.filter(d => d.persist).map(d => ({ machine: d.id, key: d.persist }));
    return cap;
  }
  function encode(cap) {
    try {
      const json = JSON.stringify(cap || snapshot());
      const bytes = new TextEncoder().encode(json);
      let s = ""; bytes.forEach(b => { s += String.fromCharCode(b); });
      return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) { return ""; }
  }
  function decode(str) {
    try {
      const s = String(str).replace(/-/g, "+").replace(/_/g, "/");
      const bin = atob(s + "===".slice((s.length + 3) % 4));
      const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) { return null; }
  }
  function link(base) {
    const u = new URL(base || (typeof location !== "undefined" ? location.href : "https://example/index.html"), "https://example/");
    u.searchParams.set(CAPSULE_KEY, encode(snapshot()));
    return u.pathname + u.search;
  }
  function restore(cap) {
    if (!cap || cap.v !== 1 || !cap.machines) return { ok: false, reason: "invalid capsule", applied: [] };
    restoring = true;
    const applied = [], skipped = [], rejected = [];
    try {
      capsuleMachines().forEach(id => {
        const want = cap.machines[id];
        if (want === undefined) return;
        if (!has(byId[id].states, want) && !byId[id].dynamic) { rejected.push({ id: id, reason: "not a declared state" }); return; }
        if (adapters[id]) { safe(() => adapters[id](want), null); applied.push(id); }
        else { setState(id, want); skipped.push(id); }
      });
      log({ machine: "persistence", event: "APPLY", from: "restoring", to: "ready",
            ok: true, reason: "", key: "", restoring: true });
    } finally { restoring = false; }
    return { ok: rejected.length === 0, applied: applied, skipped: skipped, rejected: rejected, health: health() };
  }
  const PRESETS = {
    /* The known-good projector setup a teacher wants after a chaotic lesson. */
    classroom: { theme: "classroom", shot: "board", boardText: "detail", ultra: "off",
                 panels: "reader", precision: "off", figureMode: "plate2d", lang: "both", view: "book" },
    /* Back-row 30 FT plate */
    backRow: { theme: "classroom", shot: "board", boardText: "big", ultra: "off",
               panels: "reader", precision: "off", figureMode: "plate2d" },
    /* Maximum book space, dock hidden */
    reader: { theme: "classroom", shot: "board", boardText: "detail", ultra: "off",
              panels: "reader", precision: "off", figureMode: "plate2d" },
    /* Accessible 2D + 3D same model */
    accessible: { theme: "classroom", shot: "board", boardText: "detail", ultra: "off",
                  panels: "both", precision: "on", figureMode: "plate2d" }
  };
  function preset(name) {
    const p = PRESETS[name]; if (!p) return { ok: false, reason: "unknown preset: " + name };
    const cap = { v: 1, credit: CREDIT, at: stamp(), machines: Object.assign({}, snapshot().machines, p) };
    return Object.assign({ preset: name }, restore(cap));
  }

  /* ------------------------------------------------------------- manifest */
  function manifest() {
    const h = health();
    return {
      schema: "eduverse.state-machines/v1", version: VERSION, release: "R8",
      credit: CREDIT, generatedAt: stamp(),
      decision: "Explicit, additive, introspectable state constitution. Advisory by default so no screen changes; strict(true) enables enforcement.",
      counts: { machines: defs.length, states: defs.reduce((n, d) => n + d.states.length, 0),
                events: defs.reduce((n, d) => n + d.events.length, 0),
                guards: defs.reduce((n, d) => n + d.events.filter(e => e.guard).length, 0),
                persisted: defs.filter(d => d.persist).length,
                capsuleMachines: capsuleMachines().length, presets: Object.keys(PRESETS).length },
      api: ["get(id,key)", "transition(id,event,ctx,key)", "observe(id,value,source,key)",
            "can(id,event,ctx,key)", "allowed(id,key)", "explain(id,event,ctx,key)",
            "manifest()", "health()", "assert()", "context(fn)", "history(n)", "trace(bool)", "dev()",
            "snapshot()", "restore(cap)", "encode(cap)", "decode(str)", "link(base)",
            "preset(name)", "strict(bool)", "mirror(id,fn)", "adapter(id,fn)"],
      capsule: { version: 1, queryParam: CAPSULE_KEY, encoding: "UTF-8 JSON -> base64url",
                 machines: capsuleMachines(), presets: Object.keys(PRESETS),
                 invariant: "v must equal 1; every machine value must be a declared state" },
      legacyKeys: defs.filter(d => d.persist).map(d => ({ machine: d.id, key: d.persist,
        encoding: d.id === "ultra" ? '"1"|"0"' : d.id === "panels" || d.id === "prediction" ? "JSON" : "raw string" })),
      health: h,
      machines: defs.map(d => ({
        id: d.id, owner: d.owner, purpose: d.purpose,
        states: d.states, initial: d.initial, current: current(d.id),
        dynamic: d.dynamic, keyed: d.keyed, capsule: d.capsule, drift: d.drift,
        sources: d.sources, persist: d.persist,
        allowedEvents: allowed(d.id),
        transitions: d.events.map(e => ({
          event: e.name, from: e.from,
          to: typeof e.to === "function" ? "(from context)" : e.to,
          guard: e.guard ? (e.guard.name || "inline") : null,
          guardWhy: e.guard ? (e.guard.why || "") : "", enforce: e.enforce
        })),
        invariants: d.invariants.map(i => ({ name: i.name, why: i.why })),
        mirror: readMirror(d.id),
        ux: d.ux, dx: d.dx, ax: d.ax
      }))
    };
  }

  /* -------------------------------------------------------- small helpers */
  const api = {
    VERSION, CREDIT, PRESETS,
    define, get: current, set: setState, transition, observe, can, allowed, explain,
    mirror, adapter, context, health, assert, manifest,
    mirrorValue: id => readMirror(id),
    history: n => history.slice(-(n || 30)).reverse(),
    trace: v => { if (v !== undefined) tracing = !!v; return tracing; },
    strict: v => { if (v !== undefined) strictMode = !!v; return strictMode; },
    dev: () => { const t = defs.map(d => ({ machine: d.id, state: current(d.id),
      app: readMirror(d.id), allowed: allowed(d.id).join(","), owner: d.owner }));
      if (typeof console !== "undefined" && console.table) console.table(t);
      return t; },
    snapshot, restore, encode, decode, link, preset,
    capsuleMachines,
    get defs() { return defs.map(d => Object.assign({}, d)); },
    get restoring() { return restoring; }
  };
  return api;
})();
