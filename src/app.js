/* ==========================================================================
   EduVerse — Application controller
   Views: Meta World · Book · Chapter Compiler · World Spec · Quiz · Research
   ========================================================================== */

const EV = {
  lang: "both", view: "world", world: null, compiled: null, extraChapters: [],
  progress: {}, quizAnswers: {}, demo: false, precision: false, locked: {},
  panels: { left: false, right: false }, theme: "classroom", boardText: "detail", ultra: false, prefer2d: true,
  lastTouched: 0, lastModel: null, toastTimer: null
};
const $ = id => document.getElementById(id);
/* Launch audit: only https: links may become hrefs; javascript:/data: are inert. */
function safeHref(u) {
  try {
    const p = new URL(String(u || ""), location.href);
    return p.protocol === "https:" ? p.href : "#";
  } catch (e) { return "#"; }
}
function loadProgress() {
  EVFSM.transition("persistence", "LOAD", {});
  try { EV.progress = JSON.parse(localStorage.getItem("eduverse-progress-v1") || "{}"); }
  catch (e) { EV.progress = {}; EVFSM.transition("persistence", "FAIL", {}); }
}
function saveProgress() {
  EVFSM.transition("persistence", "WRITE", {});
  try { localStorage.setItem("eduverse-progress-v1", JSON.stringify(EV.progress)); EVFSM.transition("persistence", "SAVED", {}); }
  catch (e) { EVFSM.transition("persistence", "FAIL", {}); }
}
function pkey(w, sp) { return (w ? w.id : "none") + "::" + (sp ? sp.id : "0"); }
function pget(w, sp) { const k = pkey(w, sp); return EV.progress[k] || (EV.progress[k] = { locked: false, answer: null, flap: false, stamped: false, touched: 0 }); }
/* R8: the dock's two booleans are ONE four-valued state in EVFSM. */
function panelState() {
  return !EV.panels.left && !EV.panels.right ? "reader"
       : !EV.panels.left ? "leftHidden" : !EV.panels.right ? "rightHidden" : "both";
}
function predictionState(pg) {
  return pg.stamped ? "stamped" : pg.flap ? "flapOpen" : pg.locked ? "locked"
       : (pg.answer !== null && pg.answer !== undefined) ? "answered" : "unanswered";
}
function html(el, s) {
  if (!el) return;
  el.innerHTML = s;
  /* Prompt 4: every dynamic HTML island is re-keyed from the canonical dictionary. */
  if (typeof EVDICT !== "undefined") EVDICT.apply(el, EV.lang);
}
function uiTxt(k, legacy) {
  return (typeof EVDICT !== "undefined") ? EVDICT.get(k, EV.lang, legacy) : legacy;
}
function toastKey(k, legacy, kind) { toast(uiTxt(k, legacy), kind); }
/* A keyed inline span for hidden tool screens and the help modal. html() and
   setLanguage() both call EVDICT.apply(), so the text follows EN/HI/EN+HI. */
function keyedSpan(k, legacy) {
  return `<span data-i18n="${esc(k)}">${esc(uiTxt(k, legacy))}</span>`;
}

/* ------------------------------------------------------------------ chrome */
const NAV = [
  { id: "world", icon: "◎" }, { id: "book", icon: "▤" }, { id: "compiler", icon: "⚙" },
  { id: "spec", icon: "{}" }, { id: "quiz", icon: "✓" }, { id: "research", icon: "⌕" }, { id: "teacher", icon: "▦" }
];
function renderNav() {
  html($("nav"), NAV.map(n => `<button class="nav-item ${EV.view === n.id ? "active" : ""}" data-view="${n.id}"><span>${n.icon}</span>${t(n.id)}</button>`).join(""));
  document.querySelectorAll(".nav-item").forEach(b => b.onclick = () => setView(b.dataset.view));
}
function renderChapterSelect() {
  const sel = $("chapterSelect"); if (!sel) return;
  const cur = EV.world ? EV.world.id : "";
  const list = CATALOGUE_ALL.filter(c => STUDENT_CHAPTERS.indexOf(c.id) >= 0);
  const opt = c => `<option value="${esc(c.id)}" ${cur === c.id ? "selected" : ""}>${esc(BI(c.title, c.hi))}</option>`;
  const grp = (cls, label) => {
    const rows = list.filter(c => c.cls === cls);
    return rows.length ? `<optgroup label="${esc(label)}">` + rows.map(opt).join("") + `</optgroup>` : "";
  };
  /* CBSE 2026-27: NCERT Exploration IX (13) + rationalised NCERT X (13). */
  let opts = grp("IX", `${uiTxt("ui.class")} IX · ${t("syllabus2627")} · 13`) +
             grp("X", `${uiTxt("ui.class")} X · ${t("syllabus2627")} · 13`);
  /* a deep link / Tools shelf may open an undeveloped chapter — keep it visible in the picker */
  const extra = CATALOGUE_ALL.filter(c => !STUDENT_CHAPTERS.includes(c.id) && c.id === cur);
  if (extra.length) opts += `<optgroup label="${esc(t("otherChapters"))}">` + extra.map(opt).join("") + `</optgroup>`;
  if (EV.extraChapters.length) opts += `<optgroup label="${esc(t("compiled"))}">` + EV.extraChapters.map(c => `<option value="extra:${esc(c.id)}" ${cur === c.id ? "selected" : ""}>✦ ${esc(c.title)}</option>`).join("") + `</optgroup>`;
  html(sel, opts);
  sel.onchange = () => {
    const v = sel.value;
    if (v.indexOf("extra:") === 0) {
      const c = EV.extraChapters.find(x => x.id === v.slice(6));
      if (c) { EV.world = c.world; WORLD.setWorld(c.world, 0); renderTop(); renderChapterList(); setView("book"); }
    } else openChapter(v);
  };
}
/* Section navigator: every live chapter's NCERT sections are one click away.
   Chapters are looked up in CHAPTER_PACKS, so no chapter name is hardcoded. */
function renderSectionSelect() {
  const sel = $("sectionSelect");
  const pack = (typeof CHAPTER_PACKS !== "undefined" && EV.world) ? CHAPTER_PACKS[EV.world.id] : null;
  const sections = pack && pack.sections && pack.sections.length ? pack.sections : null;
  if (!sel || !sections) { if (sel) sel.hidden = true; return; }
  sel.hidden = false;
  const idx = WORLD.index;
  let active = 0;
  sections.forEach((sec, i) => { if (Math.abs(sec.spread - idx) < Math.abs(sections[active].spread - idx)) active = i; });
  html(sel, sections.map((sec, i) =>
    `<option value="${sec.spread}" ${i === active ? "selected" : ""}>${esc(BI(sec.en, sec.hi))}</option>`).join(""));
  sel.onchange = () => WORLD.jumpTo(+sel.value);
}
function renderChapterList() {
  const groups = [{ label: t("class9"), cls: "IX" }, { label: t("class10"), cls: "X" }];
  let s = "";
  groups.forEach(g => {
    s += `<div class="chapter-group"><div class="cg-label">${esc(g.label)}</div>`;
    CATALOGUE_ALL.filter(c => c.cls === g.cls).forEach(c => {
      const active = EV.world && EV.world.chapter === c.id;
      const thumb = (typeof EVRASTER !== "undefined" && EVRASTER.firstThumb) ? EVRASTER.firstThumb(c.id) : "";
      s += `<button class="chapter-item ${active ? "active" : ""}" data-ch="${c.id}">
        ${thumb ? `<img class="ci-thumb" src="${esc(thumb)}" alt="" loading="lazy">` : `<span class="ci-dot" style="background:${c.color}"></span>`}
        <span class="ci-text"><b>${esc(BI(c.title, c.hi))}</b><small>${t(c.subject)} · ${c.cls}</small></span></button>`;
    });
    s += `</div>`;
  });
  if (EV.extraChapters.length) {
    s += `<div class="chapter-group"><div class="cg-label">${esc(t("compiled"))}</div>`;
    EV.extraChapters.forEach(c => {
      s += `<button class="chapter-item ${EV.world && EV.world.id === c.id ? "active" : ""}" data-extra="${esc(c.id)}"><span class="ci-dot" style="background:${c.color}"></span><span class="ci-text"><b>${esc(c.title)}</b><small>${esc(c.source)}</small></span></button>`;
    });
    s += `</div>`;
  }
  html($("chapterList"), s);
  renderChapterSelect();
  document.querySelectorAll("[data-ch]").forEach(b => b.onclick = () => openChapter(b.dataset.ch));
  document.querySelectorAll("[data-extra]").forEach(b => b.onclick = () => {
    const c = EV.extraChapters.find(x => x.id === b.dataset.extra);
    if (c) { EV.world = c.world; WORLD.setWorld(c.world, 0); syncTopicVisual(); renderTop(); renderChapterList(); setView("book"); }
  });
}
function renderTop() {
  const w = EV.world;
  $("topTitle").textContent = w ? BI(w.title, w.titleHi) : t("world");
  $("topMeta").textContent = w ? `${w.board} · ${uiTxt("ui.class")} ${w.cls} · ${w.spreads.length} ${t("spreads")} · ${w.source}` : t("tagline");
  $("statSpreads").textContent = w ? w.spreads.length : "—";
  $("statStamps").textContent = stampsFor(w);
  if ($("langSelect")) $("langSelect").value = EV.lang;
  syncBoardUI();
  $("railHeading").textContent = t("chapterShelf");
  $("worldTip").textContent = t("worldHint");
  /* Meta-world title follows the active chapter (26 chapters, no hardcoded Ch4). */
  const pack = w ? CHAPTER_PACKS[w.id] : null;
  if ($("worldEyebrow")) $("worldEyebrow").textContent = w
    ? `CBSE 2026-27 · NCERT SCIENCE · ${uiTxt("ui.classUpper")} ${w.cls} · ${w.source}` : t("ui.worldEyebrow");
  if ($("worldH1")) $("worldH1").textContent = w ? BI(w.title, w.titleHi) : t("ui.worldH1");
  if ($("worldSub")) $("worldSub").textContent = w
    ? `${w.spreads.length} ${t("spreads")} · ${t("ui.worldSpreads")} ${t(w.subject)}`
    : t("ui.worldSub");
  if ($("worldChips")) {
    const chips = (pack && pack.sections ? pack.sections.slice(0, 5) : []);
    $("worldChips").innerHTML = chips.map(sec => {
      const en = sec.en || "", hi = sec.hi || sec.title_hi || en;
      const key = (typeof EVDICT !== "undefined") ? EVDICT.auto(en, hi) : "";
      return `<span${key ? ` data-i18n="${esc(key)}" data-i18n-en="${esc(en)}" data-i18n-hi="${esc(hi)}"` : ""}>${esc(key ? EVDICT.get(key, EV.lang) : BI(en, hi))}</span>`;
    }).join("");
  }
  $("brand").querySelector(".brand-name").textContent = t("brand");
  if ($("btnCompileTop")) $("btnCompileTop").textContent = t("compile");
  if ($("btnEnter")) $("btnEnter").textContent = (typeof EV_2D_ONLY !== "undefined" && EV_2D_ONLY ? BI("Open book", "पुस्तक खोलें") : t("enterWorld")) + " " + uiTxt("ui.enterArrow");
  if ($("btnHome")) $("btnHome").classList.toggle("active", EV.view === "world");
  if ($("btnBookTop")) $("btnBookTop").classList.toggle("active", EV.view === "book");
  if ($("langSelect")) $("langSelect").value = EV.lang;
  /* Prompt 4: dynamic chrome is re-keyed after every render. */
  if (typeof EVDICT !== "undefined") EVDICT.apply(document, EV.lang);
}
function stampsFor(w) { if (!w) return 0; return w.spreads.filter(sp => (EV.progress[pkey(w, sp)] || {}).stamped).length; }
/* MODE: 2D is the product. The realistic 2D plates are the only reading
   surface; the Three.js world is never started unless a developer explicitly
   asks for the 3D book with ?mode=3d (QA escape hatch). This also guarantees
   that a stale WebGL/ULTRA state can never hide the 2D illustration. */
const EV_2D_ONLY = (() => {
  try {
    const q = new URLSearchParams(location.search).get("mode");
    if (q === "3d") return false;       /* explicit QA/developer override */
    return true;                        /* 2D-only, always */
  } catch (e) { return true; }
})();
window.EV_2D_ONLY = EV_2D_ONLY;
function setView(v) {
  if (EV_2D_ONLY && v === "book") {
    const w = EV.world || getWorld("c10_carbon");
    if (window.SCIVERSE) SCIVERSE.openFlipbook(w.id, WORLD.index || 0, w);
    if (EV.view === "world") return;
    v = "world";
  }
  EVFSM.transition("view", "ENTER", { to: v });
  EV.view = v;
  const three = v === "world" || v === "book";
  $("screen").hidden = three;
  $("worldHud").hidden = v !== "world";
  $("bookHud").hidden = v !== "book";
  /* Academic library: a class drawer never survives a view change. */
  if (window.EVLIB && v !== "world") EVLIB.close();
  $("stage").classList.toggle("screen-mode", !three);
  const toolView = ["compiler", "spec", "research", "teacher"].includes(v);
  /* tool screens are full-screen: never leave the drawer floating over them */
  if ($("toolsDrawer")) $("toolsDrawer").hidden = true;
  EVFSM.observe("toolsDrawer", "closed", "app.js:setView");
  if (v === "world") { WORLD.setView("world", false); EV.precision = false; applyPrecision();
    EVFSM.transition("precision", "FORCE_OFF", { view: "world" }); }
  if (v === "book") { if (!EV.world) openChapter("c10_carbon"); syncTopicVisual(); WORLD.setView("book", false); renderLesson(); renderMeters(); renderPageBar(); }
  if (!three) html($("screenInner"), renderScreen(v));
  renderNav(); renderTop(); renderChapterList();
  if (typeof EVBIND !== "undefined") EVBIND.onView();
  if (typeof O3LAB !== "undefined") O3LAB.onView();
  if (typeof EVPROJ !== "undefined") EVPROJ.onView();
  if ($("btnTools")) $("btnTools").classList.remove("active");
  if (v === "compiler") bindCompiler();
  if (v === "spec") bindSpec();
  if (v === "quiz") bindQuiz();
  if (v === "teacher") bindTeacher();
}
/* Universal Home: return to the Class IX/X dashboard from any view, any
   full-screen tool screen and from the preserved 3D shelf. The original
   setView / HUD / EV.view contracts are untouched. */
function goHome() {
  /* projector has no top bar; leave it first so its chrome is restored */
  if (typeof EVPROJ !== 'undefined' && EVPROJ.active) EVPROJ.setActive(false);
  /* a help / about modal covers the top bar; dismiss it on the way Home */
  document.querySelectorAll('.modal').forEach(n => n.remove());
  if (window.EVLIB) { EVLIB.close(); EVLIB.setLibrary(true); }
  setView("world");
}
function syncTopicVisual() {
  const w = EV.world, sp = w && w.spreads[WORLD.index];
  /* 2D is the only reading mode: never let a stale preference or a saved
     ULTRA/precision view keep the realistic illustration hidden. */
  if (EV_2D_ONLY) {
    EV.prefer2d = true;
    if (EV.ultra) applyUltra(false);
    if (EV.precision) { EV.precision = false; applyPrecision(); }
  }
  const want2d = !!EV.prefer2d && !!w && WORLD.plate2dAvailable(w);
  if (want2d) {
    if (EVRASTER.has(w, sp)) EVRASTER.activate();
    if (!WORLD.plate2d) WORLD.setPlate2D(true);
    EVFSM.observe("figureMode", "plate2d", "app.js:syncTopicVisual");
  } else {
    if (WORLD.plate2d) WORLD.setPlate2D(false);
    EVRASTER.deactivate();
    EVFSM.observe("figureMode", WORLD.figureMode, "app.js:syncTopicVisual");
  }
  EVRASTER.frame();
}
function openChapter(id) {
  EVFSM.transition("navigation", "OPEN_CHAPTER", { to: id + "::0", known: CATALOGUE_ALL.some(c => c.id === id) });
  /* Prompt 5 · parse only THIS chapter's inert JSON pack on demand. */
  if (typeof EVLAZY !== "undefined") EVLAZY.onChapter(id);
  EV.world = getWorld(id);
  WORLD.setWorld(EV.world, 0);
  syncTopicVisual();
  /* Prompt 2 · a chapter change is an UNMOUNT + fresh MOUNT of the shared
     selection state (perfect cleanup of the previous chapter's 3D group). */
  if (typeof EVBIND !== "undefined") EVBIND.onChapter(id, 0);
  if (typeof O3LAB !== "undefined") O3LAB.onChapter(id, 0);
  renderTop(); renderChapterList(); setView("book");
  EVRASTER.frame();
  flash();
}
function flash() { const f = $("flash"); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go"); }
function toast(msg, kind) {
  const el = $("toast"); el.textContent = msg; el.className = "toast show " + (kind || "");
  clearTimeout(EV.toastTimer); EV.toastTimer = setTimeout(() => el.className = "toast", 2600);
}
function download(name, text) {
  const b = new Blob([text], { type: "application/json" }), u = URL.createObjectURL(b);
  const a = document.createElement("a"); a.href = u; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1500);
}

/* --------------------------------------------------------------- lesson card */
function renderLesson() {
  const w = EV.world, sp = w && w.spreads[WORLD.index]; if (!w || !sp) return;
  const hi = EV.lang === "hi", pg = pget(w, sp);
  const pr = P(sp), raw = sp.predict || { q: "", options: [], a: 0 }, rawHi = sp.predictHi;
  const title = BI(sp.title, sp.titleHi), concept = BI(sp.concept, sp.conceptHi), explain = BI(sp.explain, sp.explainHi);
  const opts = pr.options.map((o, i) => {
    let cls = "popt";
    if (pg.locked) { cls += i === pr.a ? " correct" : (i === pg.answer ? " wrong" : " dim"); }
    else if (pg.answer === i) cls += " picked";
    const label = EV.lang === "both" && rawHi ? BX(raw.options[i], rawHi.options[i]) : esc(o);
    return `<button class="${cls}" data-opt="${i}" ${pg.locked ? "disabled" : ""}><b>${String.fromCharCode(65 + i)}</b><span>${label}</span></button>`;
  }).join("");
  const eqHtml = sp.formula ? ((typeof SCIVERSE !== "undefined" && SCIVERSE.formatFormulaHtml) ? SCIVERSE.formatFormulaHtml(sp.formula.eq) : esc(sp.formula.eq)) : "";
  const formula = sp.formula ? `<div class="lc-formula"><span>${esc(sp.formula.label)}</span><strong>${eqHtml}</strong>${sp.formula.note ? `<small>${esc(sp.formula.note)}</small>` : ""}</div>` : "";
  const rawV = sp.vocab || [], rawVHi = sp.vocabHi || [];
  /* Key terms list words only. build_chapters.py used to copy concept[:58] as
     if it were a definition; a clipped sentence is noise, not a definition. */
  const terms = VOC(sp).slice(0, 3).map((v, i) => `<span><b>${EV.lang === "both" && rawVHi.length ? BX(rawV[i] && rawV[i][0], rawVHi[i] && rawVHi[i][0]) : esc(v[0])}</b></span>`).join(" · ");
  html($("lessonCard"), `
    <div class="lc-head"><span>${esc(sp.section)} · ${esc(t("predict"))}</span>
      <span><button class="btn ghost tiny" id="btnNarrate" title="${esc(t("narrate"))}" data-i18n-title="narrate" data-i18n-aria="narrate">◖</button>
      <span class="stamp ${pg.stamped ? "earned" : ""}" id="stampBadge">${pg.stamped ? "★ " + esc(t("stamp")) : "☆"}</span></span></div>
    <h2>${EV.lang === "both" ? BX(sp.title, sp.titleHi) : esc(title)}</h2>
    <div class="lc-terms"><small>${esc(t("keyTerms"))}:</small> ${terms}</div>
    <p class="lc-concept">${esc(concept)}</p>
    ${formula}
    <div class="predict">
      <div class="predict-q">${EV.lang === "both" && rawHi ? BX(raw.q, rawHi.q) : esc(pr.q)}</div>
      <div class="predict-opts">${opts}</div>
      <div class="predict-foot">
        <button class="btn small ${pg.locked ? "done" : "primary"}" id="lockPredict" ${pg.locked ? "disabled" : ""}>${pg.locked ? "✓ " + esc(t("check")) : esc(t("check"))}</button>
        <small>${esc(t("predictHint"))}</small>
      </div>
      <div class="flap ${pg.flap ? "open" : ""}" id="flap">
        <div class="flap-under"><b>${esc(t("flap"))}</b><p>${EV.lang === "both" ? BX(sp.explain, sp.explainHi) : esc(explain)}</p></div>
        <div class="flap-front">✦ &nbsp; ${esc(t("flapClosed"))}</div>
      </div>
    </div>`);
  document.querySelectorAll("[data-opt]").forEach(b => b.onclick = () => {
    if (pg.locked) return;
    pg.answer = +b.dataset.opt; EVFSM.transition("prediction", pg.answer !== null ? "CHOOSE" : "CHANGE", {}, pkey(w, sp));
    EVFSM.observe("prediction", predictionState(pg), "app.js:renderLesson", pkey(w, sp));
    saveProgress(); renderLesson();
  });
  $("lockPredict").onclick = () => {
    if (pg.answer === null) { toastKey("toast.choose", "Choose an option first", "warn"); return; }
    const lr = EVFSM.transition("prediction", "LOCK", { answer: pg.answer }, pkey(w, sp));
    if (EVFSM.strict() && !lr.ok) { toast(lr.reason, "warn"); return; }
    pg.locked = true; EVFSM.observe("prediction", "locked", "app.js:lockPredict", pkey(w, sp));
    saveProgress(); renderLesson(); renderMeters();
    toastKey(pg.answer === P(sp).a ? "toast.good" : "toast.locked",
      pg.answer === P(sp).a ? "Correct answer. Now read the explanation." : "Answer recorded. Now read the explanation.", "ok");
  };
  $("flap").onclick = () => {
    if (!pg.locked) { toastKey("toast.lockFirst", "Answer the question first, then open the explanation", "warn"); return; }
    const fr = EVFSM.transition("prediction", "FLAP", { locked: pg.locked }, pkey(w, sp));
    if (EVFSM.strict() && !fr.ok) { toast(fr.reason, "warn"); return; }
    pg.flap = !pg.flap; EVFSM.observe("prediction", predictionState(pg), "app.js:flap", pkey(w, sp));
    saveProgress(); $("flap").classList.toggle("open", pg.flap);
  };
  if ($("btnNarrate")) $("btnNarrate").onclick = () => narrate(title + ". " + concept + ". " + explain);
}
function narrate(text) {
  if (!("speechSynthesis" in window)) { toastKey("toast.speechOff", "Speech synthesis unavailable in this browser", "warn"); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = EV.lang === "en" ? "en-IN" : "hi-IN"; u.rate = 0.92;
  speechSynthesis.speak(u); toastKey("toast.narrating", "Narrating…");
}

/* --------------------------------------------------------------- meter card */
function renderMeters() {
  const w = EV.world, sp = w && w.spreads[WORLD.index]; if (!w || !sp) return;
  const block = BLOCKS[sp.scene.type] || BLOCKS.showcase, ctrls = blockControls(block, sp);
  const st = WORLD.getState(), model = evalModel(sp, st.params), pg = pget(w, sp);
  EV.lastModel = model;
  const meters = (model.readouts || []).map((r, i) => `
    <div class="meter"><div class="meter-track"><div class="meter-fill" data-ro="${i}" style="height:${clampPct(r.pct)}%"></div></div>
    <div class="meter-label">${esc(r.label)}</div><div class="meter-value" data-rv="${i}">${esc(r.value)}<small>${esc(r.unit)}</small></div></div>`).join("");
  const sliders = ctrls.map(c => `
    <div class="ctrl"><label for="c_${esc(c.id)}">${esc(c.label)} <b id="cv_${esc(c.id)}">${esc(st.params[c.id])}</b> ${esc(c.unit)}</label>
    <input type="range" id="c_${esc(c.id)}" min="${c.min}" max="${c.max}" step="${(c.max - c.min) / 100}" value="${st.params[c.id]}" data-cid="${esc(c.id)}"></div>`).join("");
  const ch = sp.challenge;
  const chText = ch ? BI(ch.text, ch.textHi) : uiTxt("ui.challengeDefault");
  const done = ch ? checkChallenge(sp, model, pg) : (st.touched.size >= 2 && pg.locked);
  html($("meterCard"), `
    <div class="mc-head"><span>${esc(t("meters"))}</span><small>${esc(block.label)}</small></div>
    <div class="meters">${meters}</div>
    <div class="controls">${sliders}</div>
    <div class="challenge ${done ? "done" : ""}" id="challengeBox"><span>${esc(t("challenge"))}</span><b>${esc(chText)}</b><em>${done ? "✓" : "○"}</em></div>
    <div class="mc-progress"><span>${esc(t("touchHint"))}</span><div class="touch-dots" id="touchDots"></div></div>
    <div class="mc-actions">
      <button class="btn ghost small" id="btnPrecision">${esc(t("precision"))}</button>
      <button class="btn ghost small" id="btnReset">${esc(t("reset"))}</button>
      <button class="btn primary small" id="btnDemo">▶ ${esc(t("demo"))}</button>
    </div>`);
  document.querySelectorAll("[data-cid]").forEach(inp => inp.oninput = () => WORLD.setParam(inp.dataset.cid, +inp.value, "slider"));
  $("btnPrecision").onclick = () => { EV.precision = !EV.precision; applyPrecision(); renderMeters(); };
  $("btnReset").onclick = () => { WORLD.resetExperiment(); toastKey("toast.reset", "Experiment reset"); renderMeters(); };
  $("btnDemo").onclick = toggleDemo;
  renderTouchDots(); updateReadouts(model);
}
function clampPct(v) { return Math.max(2, Math.min(100, Number(v) || 2)); }
function renderTouchDots() {
  const st = WORLD.getState(), n = Math.min(6, Math.max(3, st.touched.size));
  const dots = []; for (let i = 0; i < 6; i++) dots.push(`<i class="${i < st.touched.size ? "on" : ""}"></i>`);
  const el = $("touchDots"); if (el) html(el, dots.join(""));
}
function updateReadouts(model) {
  (model.readouts || []).forEach((r, i) => {
    const f = document.querySelector(`[data-ro="${i}"]`), v = document.querySelector(`[data-rv="${i}"]`);
    if (f) f.style.height = clampPct(r.pct) + "%";
    if (v) v.innerHTML = esc(r.value) + `<small>${esc(r.unit)}</small>`;
  });
  const st = WORLD.getState(), sp = EV.world.spreads[WORLD.index];
  const chBox = $("challengeBox");
  if (chBox) {
    const done = sp.challenge ? checkChallenge(sp, model, pget(EV.world, sp)) : (st.touched.size >= 2 && pget(EV.world, sp).locked);
    chBox.classList.toggle("done", done);
    const em = chBox.querySelector("em"); if (em) em.textContent = done ? "✓" : "○";
  }
  Object.keys(st.params).forEach(k => { const b = $("cv_" + k); if (b) b.textContent = st.params[k]; });
  if (EV.precision) renderPrecision(model, sp);
  maybeStamp(model);
}
function maybeStamp(model) {
  const w = EV.world, sp = w && w.spreads[WORLD.index]; if (!sp) return;
  const pg = pget(w, sp), st = WORLD.getState();
  const challengeOK = sp.challenge ? checkChallenge(sp, model, pg) : (st.touched.size >= 2 && pg.locked);
  const all = pg.locked && challengeOK && st.touched.size >= 2;
  if (all && !pg.stamped) {
    EVFSM.transition("prediction", "STAMP", { locked: pg.locked, challengeOK: challengeOK, touched: st.touched.size }, pkey(w, sp));
    EVFSM.observe("prediction", "stamped", "app.js:maybeStamp", pkey(w, sp));
    pg.stamped = true; saveProgress();
    const badge = $("stampBadge");
    if (badge) { badge.className = "stamp earned"; badge.textContent = "★ " + t("stamp"); }
    renderTop(); toast("★ " + uiTxt("toast.stamped"), "ok");
    flash();
    if (typeof SCIVERSE !== "undefined" && SCIVERSE.celebrate) SCIVERSE.celebrate("stamp");
    if (cbVoice()) { /* small confirmation only */ }
  }
}
function cbVoice() { return false; }
function applyPrecision() {
  EVFSM.observe("precision", EV.precision ? "on" : "off", "app.js:applyPrecision");
  $("precision2d").hidden = !EV.precision;
  $("btnPrecision") && ($("btnPrecision").textContent = EV.precision ? t("precisionBack") : t("precision"));
  if (EV.precision) { const st = WORLD.getState(); renderPrecision(st.model || evalModel(EV.world.spreads[WORLD.index], st.params), EV.world.spreads[WORLD.index]); }
  else WORLD.resize();
}
function renderPrecision(model, sp) {
  const W = 900, H = 560;
  const bars = (model.readouts || []).map((r, i) => {
    const y = 60 + i * 58, pct = clampPct(r.pct);
    return `<text x="30" y="${y + 4}" class="pl">${esc(r.label)}</text>
      <rect x="250" y="${y - 15}" width="480" height="26" rx="13" fill="#1d3550"/>
      <rect x="250" y="${y - 15}" width="${480 * pct / 100}" height="26" rx="13" fill="${["#4ad6ff", "#7ee0b8", "#ffc46b", "#ff9b8a"][i % 4]}"/>
      <text x="742" y="${y + 4}" class="pv">${esc(r.value)} ${esc(r.unit)}</text>`;
  }).join("");
  let schematic = "";
  const type = sp.scene.type;
  /* cbse-interactive-lab discipline: the accessible 2D plate and the live 3D
     opposite page are rendered from ONE declarative biology spec. */
  const bioSpec = (typeof BIO3D !== "undefined") ? BIO3D.spec(EV.world, sp) : null;
  if (bioSpec) {
    schematic = BIO3D.svg2D(bioSpec, model, esc);
  } else if (type === "particles" || type === "diffusion") {
    const n = Math.round(12 + (Number(model.temp || model.mixing || 20) / 100) * 40), pts = [];
    const rnd = G3.seeded(55);
    for (let i = 0; i < n; i++) pts.push(`<circle cx="${(430 + rnd() * 420).toFixed(0)}" cy="${(300 + rnd() * 200).toFixed(0)}" r="6" fill="#4ad6ff" opacity=".8"/>`);
    schematic = `<rect x="415" y="285" width="450" height="230" rx="10" fill="none" stroke="#4ad6ff" stroke-width="2"/>${pts.join("")}`;
  } else if (type === "ph") {
    const px = 30 + Number(model.pH) / 14 * 840;
    schematic = `<defs><linearGradient id="phg"><stop offset="0" stop-color="#e4584f"/><stop offset=".5" stop-color="#62d6b0"/><stop offset="1" stop-color="#4d7ad6"/></linearGradient></defs>
      <rect x="30" y="430" width="840" height="34" rx="17" fill="url(#phg)"/>
      <polygon points="${px},420 ${px - 12},398 ${px + 12},398" fill="#fff"/><text x="${px}" y="490" text-anchor="middle" class="pv">pH ${esc(model.pH)}</text>`;
  } else if (type === "plot") {
    const d = []; for (let i = 0; i <= 60; i++) { const x = 30 + i * 14; const y = 500 - (100 / (1 + Math.exp(-(i * 1.67 - 50) / 12))) * 3.4; d.push(`${i ? "L" : "M"}${x},${y}`); }
    schematic = `<path d="${d.join(" ")}" fill="none" stroke="#4ad6ff" stroke-width="3"/><circle cx="${30 + Number(model.x) / 100 * 840}" cy="${500 - Number(model.y) / 100 * 340}" r="10" fill="#ffc46b"/>`;
  } else if (type === "cell") {
    schematic = `<circle cx="660" cy="400" r="120" fill="none" stroke="#7ee0b8" stroke-width="3"/><circle cx="660" cy="400" r="46" fill="#a47ad0" opacity=".8"/>
      ${[[590, 350, 18], [730, 350, 18], [620, 470, 16], [710, 460, 16]].map(o => `<circle cx="${o[0]}" cy="${o[1]}" r="${o[2]}" fill="#ffc46b"/>`).join("")}
      <text x="660" y="540" text-anchor="middle" class="pl">${esc(model.found || 0)} / 6 ${esc(uiTxt("ui.partsIdentified"))}</text>`;
  } else if (typeof LIGHT_TYPES !== "undefined" && LIGHT_TYPES.indexOf(type) >= 0) {
    /* Different visual grammar: a flat ray diagram, not a carbon chain. */
    const v = Number(model.v || (model.power !== undefined ? model.power * 8 : 0));
    const m = Number(model.m || 0), i = Number(model.i || 0), n = Number(model.n || 1);
    const px = clamp(430 + v * 7, 70, 830), py = clamp(400 - m * 90, 120, 520);
    const virtual = px > 430 && (model.virtual === true || (model.real === false && type !== "slab"));
    schematic = `<line x1="60" y1="400" x2="860" y2="400" stroke="#9fb9cf" stroke-width="2"/>
      <rect x="424" y="245" width="12" height="310" rx="5" fill="#4ad6ff" opacity=".65"/>
      <line x1="120" y1="290" x2="430" y2="290" stroke="#ffc46b" stroke-width="3"/>
      <line x1="430" y1="290" x2="${px.toFixed(0)}" y2="${py.toFixed(0)}" stroke="${virtual ? "#9fd8ff" : "#7ee0b8"}" stroke-width="3" ${virtual ? 'stroke-dasharray="9 7"' : ""}/>
      <line x1="120" y1="290" x2="430" y2="400" stroke="#ffc46b" stroke-width="3"/>
      <line x1="430" y1="400" x2="${px.toFixed(0)}" y2="${py.toFixed(0)}" stroke="${virtual ? "#9fd8ff" : "#7ee0b8"}" stroke-width="3" ${virtual ? 'stroke-dasharray="9 7"' : ""}/>
      <circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="11" fill="#ffc46b"/>
      <text x="460" y="205" class="pl">${esc(type === "slab" ? "i " + i + "°  →  r " + (model.r || 0) + "°  ·  n " + n : type === "lenspower" ? "P = " + (model.power || 0) + " D" : "v = " + (model.v || 0) + " cm  ·  m = " + m)}</text>
      <text x="460" y="545" class="pl">${esc(virtual ? uiTxt("ui.virtualImage") : uiTxt("ui.realImage"))}</text>`;
  } else if (typeof CARBON_TYPES !== "undefined" && CARBON_TYPES.indexOf(type) >= 0) {
    const n = clamp(Math.round(Number(model.n || model.carbons || model.ringAtoms || 3)), 1, 8);
    const pts = [], bonds = [];
    for (let i = 0; i < n; i++) {
      const x = 470 + i * (400 / Math.max(1, n - 1)), y = 400;
      pts.push(`<circle cx="${x.toFixed(0)}" cy="${y}" r="22" fill="#35424e" stroke="#4ad6ff" stroke-width="3"/><text x="${x.toFixed(0)}" y="${y + 7}" text-anchor="middle" fill="#eaf6ff" font-size="18" font-weight="bold">C</text>`);
      if (i) bonds.push(`<line x1="${(x - 400 / Math.max(1, n - 1)).toFixed(0)}" y1="${y}" x2="${x.toFixed(0)}" y2="${y}" stroke="#9fb9cf" stroke-width="5"/>`);
    }
    schematic = bonds.join("") + pts.join("") +
      `<text x="670" y="480" text-anchor="middle" class="pl">${esc(model.formula || "C" + n)}</text>` +
      `<text x="670" y="515" text-anchor="middle" class="pl">${esc(model.name || model.product || model.allotrope || uiTxt("ui.carbonChain"))}</text>`;
  } else if (type === "atlas") {
    /* Same declarative spec as the 3D pop-up, drawn as an accessible 2D plate. */
    const fig = sp.scene.fig || {}, L = (fig.labels || []).slice(0, 8), n = Math.max(1, L.length);
    const cyc = ["#4ad6ff", "#7ee0b8", "#ffc46b", "#5d8ad6", "#a878c8", "#ff9b8a"];
    let parts = "";
    L.forEach((lab, i) => {
      const x = 440 + (i - (n - 1) / 2) * (420 / Math.max(1, n - 1));
      parts += `<rect x="${(x - 48).toFixed(0)}" y="330" width="96" height="76" rx="12" fill="${cyc[i % cyc.length]}" opacity="${i === Math.round(Number(model.active || 0)) ? ".95" : ".55"}"/>`;
      parts += `<text x="${x.toFixed(0)}" y="374" text-anchor="middle" class="pl">${esc(String(lab))}</text>`;
      if (i) parts += `<line x1="${(x - 420 / Math.max(1, n - 1) + 48).toFixed(0)}" y1="368" x2="${(x - 48).toFixed(0)}" y2="368" stroke="#9fb9cf" stroke-width="3"/>`;
    });
    schematic = `<text x="440" y="285" class="pl">${esc(fig.kind || uiTxt("ui.diagram"))} · ${esc(sp.figHi || sp.fig || "")}</text>${parts}
      <text x="440" y="470" class="pl">${esc((sp.scene.readouts || []).map(r => r.label).join("  ·  "))}</text>`;
  } else {
    schematic = `<rect x="430" y="360" width="130" height="140" rx="8" fill="#4ad6ff" opacity=".55"/>
      <rect x="590" y="300" width="130" height="200" rx="8" fill="#7ee0b8" opacity=".55"/>
      <rect x="750" y="390" width="110" height="110" rx="8" fill="#ffc46b" opacity=".55"/>`;
  }
  html($("precision2d"), `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
    <style>.pl{fill:#a9c7e0;font:18px Georgia,serif}.pv{fill:#eaf6ff;font:bold 20px Georgia,serif}</style>
    <rect width="${W}" height="${H}" fill="#0e1d30" rx="18"/>
    <text x="30" y="36" fill="#4ad6ff" font-family="Georgia" font-size="22" font-weight="bold">${esc(t("precision"))} · ${esc((BLOCKS[type] || BLOCKS.showcase).label)}</text>
    ${bars}${schematic}
    <text x="30" y="545" fill="#7090ad" font-family="Georgia" font-size="15">${esc(bioSpec ? uiTxt("ui.precisionBio") : uiTxt("ui.precisionNote"))}</text>
  </svg>`);
}

/* --------------------------------------------------------------- page bar */
/* Teacher-selected 2D / 3D: an explicit alternative, never a GPU fallback.
   2D is the only product mode; ?mode=3d keeps the old 3D book for QA. */
function setPlateView(v) {
  /* 2D-only: an explicit 3D request is ignored so a stale control can never
     replace the realistic illustration with the 3D model. */
  const on = EV_2D_ONLY ? true : v === "2d";
  if (on && !WORLD.plate2dAvailable(EV.world)) {
    toastKey("plate2d.soon", "This 2D chapter is in a later phase.");
    return;
  }
  /* An explicit 2D selection must actually reveal the illustration, even if
     the user previously enabled the raised 3D or precision diagram view. */
  if (on && EV.ultra) applyUltra(false);
  if (on && EV.precision) { EV.precision = false; applyPrecision(); }
  if (on) WORLD.retryRaster(); // allow an explicit retry after a failed image request
  EV.prefer2d = on;
  /* Idempotent: clicking the already-selected segment must not create a
     rejected FSM transition. The adapter and WORLD setter stay authoritative. */
  if (WORLD.plate2d === on) {
    if (on && EVRASTER.has(EV.world, EV.world && EV.world.spreads[WORLD.index])) EVRASTER.activate();
    if (!on) EVRASTER.deactivate();
    EVRASTER.frame();
    renderPageBar();
    return;
  }
  if (on && EVRASTER.has(EV.world, EV.world && EV.world.spreads[WORLD.index])) EVRASTER.activate();
  if (!on) EVRASTER.deactivate();
  EVFSM.transition("figureMode", on ? "PLATE_2D" : "PLATE_2D_OFF",
    { plate2dAvailable: WORLD.plate2dAvailable(EV.world), classroom: EV.theme === "classroom" });
  WORLD.setPlate2D(on);
  EVRASTER.frame(); // synchronously sync topic illustration plate
  EVFSM.observe("figureMode", WORLD.plate2d ? "plate2d" : "3d", "app.js:setPlateView");
  renderPageBar();
  toastKey(on ? "plate2d.on" : "plate2d.off",
    on ? "Realistic topic illustration active" : "Live 3D model active");
}
/* Approved local realistic raster plate. This is an HTML image
   layered over the 2D page: never sample file:// pixels into the WebGL canvas. */
/* Image label information: authored positions, no guessed hotspots. */
const EV_LABEL_DATA=__EV_LABEL_DATA__;
const EVLABEL=(()=>{
  const active=new WeakMap(); let serial=0;
  function destroy(host){const old=host&&active.get(host);if(!old)return;old.ro.disconnect();old.layer.remove();active.delete(host)}
  /* shrink-to-fit: long bilingual names never clip inside their chip */
  function fitChips(layer){layer.querySelectorAll('.ev-label-chip').forEach(ch=>{ch.style.fontSize='';if(!ch.clientHeight)return;let fs=parseFloat(getComputedStyle(ch).fontSize)||12;let guard=24;while(guard--&&fs>6.5&&(ch.scrollHeight>ch.clientHeight+1||ch.scrollWidth>ch.clientWidth+1)){fs-=0.5;ch.style.fontSize=fs+'px'}})}
  function render(host,key){
    if(!host)return; destroy(host);
    const specs=EV_LABEL_DATA[key]; const img=host.querySelector('img');
    if(!specs||!img)return;
    const layer=document.createElement('div');layer.className='ev-label-layer';
    // Some illustrations have no baked-in text. Render authored bilingual
    // chips with leader lines instead of invisible boxes over their subjects.
    if(specs.some(s=>s.anchor_x!=null&&s.anchor_y!=null)){
      const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
      svg.setAttribute('viewBox','0 0 1408 768');svg.setAttribute('preserveAspectRatio','none');svg.classList.add('ev-label-leaders');
      specs.filter(s=>s.anchor_x!=null&&s.anchor_y!=null).forEach(s=>{
        const line=document.createElementNS(ns,'line');line.setAttribute('x1',s.x+s.w/2);line.setAttribute('y1',s.y+s.h);
        line.setAttribute('x2',s.anchor_x);line.setAttribute('y2',s.anchor_y);svg.append(line);
        const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',s.anchor_x);dot.setAttribute('cy',s.anchor_y);dot.setAttribute('r','8');svg.append(dot);
      });layer.append(svg);
    }
    const info=document.createElement('div');info.className='ev-label-pop';info.id='evLabelInfo'+(++serial);info.hidden=true;info.setAttribute('role','region');info.setAttribute('aria-live','polite');info.tabIndex=0;
    const heading=document.createElement('strong'),body=document.createElement('span'),close=document.createElement('button');
    close.type='button';close.className='ev-label-close';close.textContent='×';close.setAttribute('aria-label',BI('Close information','जानकारी बंद करें'));
    // Find the largest vertical band clear of all label buttons; some labels
    // are low in the picture, so simply placing info below the last one fails.
    const occupied=specs.map(s=>[Math.max(0,s.y/768*100-1),Math.min(100,(s.y+s.h)/768*100+1)]).sort((a,b)=>a[0]-b[0]);
    let cursor=1,best=[1,1];
    for(const [a,b] of occupied){if(a-cursor>best[1]-best[0])best=[cursor,a];cursor=Math.max(cursor,b)}
    if(99-cursor>best[1]-best[0])best=[cursor,99];
    info.style.top=best[0]+'%';info.style.maxHeight=(best[1]-best[0])+'%';
    info.append(heading,body,close); let selected=null; const buttons=[];
    function closeInfo(){info.hidden=true;if(selected){selected.setAttribute('aria-expanded','false');selected=null}}
    close.addEventListener('click',e=>{e.stopPropagation();const prior=selected;closeInfo();if(prior)prior.focus({preventScroll:true})});
    info.addEventListener('click',e=>e.stopPropagation());
    specs.forEach((spec,i)=>{
      const hit=document.createElement('button');hit.type='button';hit.className='ev-label-hit';hit.dataset.labelIndex=String(i);
      if(spec.anchor_x!=null&&spec.anchor_y!=null){hit.classList.add('ev-label-chip');hit.textContent=BI(spec.en,spec.hi);hit.dataset.n=String(specs.indexOf(spec)+1)}
      let right=spec.x+spec.w;
      for(const other of specs)if(other!==spec&&other.x>spec.x&&other.x<right&&other.y<spec.y+spec.h&&spec.y<other.y+other.h)right=other.x-2;
      hit.style.left=(spec.x/1408*100)+'%';hit.style.top=(spec.y/768*100)+'%';hit.style.width=((right-spec.x)/1408*100)+'%';hit.style.height=(spec.h/768*100)+'%';
      hit.setAttribute('aria-label',BI(spec.en,spec.hi)+' · '+BI('more information','और जानकारी'));hit.setAttribute('aria-controls',info.id);hit.setAttribute('aria-expanded','false');
      hit.addEventListener('click',e=>{e.stopPropagation();if(selected===hit&&!info.hidden){closeInfo();return}closeInfo();selected=hit;hit.setAttribute('aria-expanded','true');heading.textContent=BI(spec.en,spec.hi);body.textContent=BI(spec.info_en,spec.info_hi);info.hidden=false});
      layer.append(hit);buttons.push(hit);
    });
    layer.append(info);host.append(layer);
    function size(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const ar=(img.naturalWidth&&img.naturalHeight)?img.naturalWidth/img.naturalHeight:1408/768;const iw=Math.min(w,h*ar),ih=iw/ar;layer.style.width=iw+'px';layer.style.height=ih+'px';layer.style.left=(w-iw)/2+'px';layer.style.top=(h-ih)/2+'px';layer.style.setProperty('--ev-chip-font',Math.max(8,Math.min(16,iw/40))+'px');layer.classList.toggle('ev-compact',iw<560);if(iw>=560)fitChips(layer)}
    const ro=new ResizeObserver(size);ro.observe(host);img.addEventListener('load',size,{once:true});size();active.set(host,{ro,layer,closeInfo});
  }
  function closeOpen(host){const item=host&&active.get(host);if(!item)return false;const p=item.layer.querySelector('.ev-label-pop');if(!p||p.hidden)return false;item.closeInfo();return true}
  return {render,destroy,closeOpen,has:key=>!!EV_LABEL_DATA[key]};
})();

const EVRASTER = (() => {
  const assets = {
  "c9_cell": {
    "2.1": [
      "2-01-discovery.jpg"
    ],
    "2.2": [
      "2-02-plant-animal.jpg"
    ],
    "2.3": [
      "2-03-prokaryote-eukaryote.jpg"
    ],
    "2.4": [
      "2-04-membrane.jpg"
    ],
    "2.5": [
      "2-05-wall-vacuole.jpg"
    ],
    "2.6": [
      "2-06-nucleus.jpg"
    ],
    "2.7": [
      "2-07-mitochondria-chloroplast.jpg"
    ],
    "2.8": [
      "2-08-er-golgi-lysosomes.jpg"
    ],
    "2.9": [
      "2-09-cell-division.jpg",
      "2-09-meiosis-supplement.jpg"
    ],
    "2.10": [
      "2-10-biomolecules.jpg",
      "2-10-biomolecules-supplement.jpg"
    ],
    "2.11": [
      "2-11-division-cancer.jpg"
    ]
  },
  "c9_tissues": {
    "3.1": [
      "3-01-what-tissue.jpg"
    ],
    "3.2": [
      "3-02-organisation.jpg"
    ],
    "3.3": [
      "3-03-meristem.jpg"
    ],
    "3.4": [
      "3-04-simple-plant-tissues.jpg"
    ],
    "3.5": [
      "3-05-xylem.jpg"
    ],
    "3.6": [
      "3-06-phloem.jpg"
    ],
    "3.7": [
      "3-07-epithelial.jpg"
    ],
    "3.8": [
      "3-08-connective.jpg"
    ],
    "3.9": [
      "3-09-muscle-nervous.jpg"
    ],
    "3.10": [
      "3-10-musculoskeletal.jpg"
    ],
    "3.11": [
      "3-11-care.jpg"
    ]
  },
  "c9_motion": {
    "4.1": [
      "4-01-reference-frame.jpg"
    ],
    "4.2": [
      "4-02-distance-displacement.jpg"
    ],
    "4.3": [
      "4-03-speed.jpg"
    ],
    "4.4": [
      "4-04-velocity.jpg"
    ],
    "4.5": [
      "4-05-acceleration.jpg"
    ],
    "4.6": [
      "4-06-distance-time.jpg"
    ],
    "4.7": [
      "4-07-velocity-time.jpg"
    ],
    "4.8": [
      "4-08-equations.jpg"
    ],
    "4.9": [
      "4-09-circular-motion.jpg"
    ]
  },
  "c9_mixtures": {
    "5.1": [
      "5-01-homogeneous.jpg"
    ],
    "5.2": [
      "5-02-solutions.jpg"
    ],
    "5.3": [
      "5-03-suspensions.jpg"
    ],
    "5.4": [
      "5-04-colloids.jpg"
    ],
    "5.5": [
      "5-05-mass-percent.jpg"
    ],
    "5.6": [
      "5-06-concentration.jpg"
    ],
    "5.7": [
      "5-07-separation.jpg"
    ],
    "5.8": [
      "5-08-distillation.jpg"
    ],
    "5.9": [
      "5-09-chromatography.jpg"
    ],
    "5.10": [
      "5-10-centrifuge.jpg"
    ]
  },
  "c9_forces": {
    "6.1": [
      "6-01-push-pull.jpg"
    ],
    "6.2": [
      "6-02-effects.jpg"
    ],
    "6.3": [
      "6-03-balanced.jpg"
    ],
    "6.4": [
      "6-04-unbalanced.jpg"
    ],
    "6.5": [
      "6-05-friction.jpg"
    ],
    "6.6": [
      "6-06-inertia.jpg"
    ],
    "6.7": [
      "6-07-momentum.jpg"
    ],
    "6.8": [
      "6-08-third-law.jpg"
    ],
    "6.9": [
      "6-09-momentum-conservation.jpg"
    ]
  },
  "c9_work_energy": {
    "7.1": [
      "7-01-constant-force.jpg"
    ],
    "7.2": [
      "7-02-work-signs.jpg"
    ],
    "7.3": [
      "7-03-kinetic-energy.jpg"
    ],
    "7.4": [
      "7-04-potential-energy.jpg"
    ],
    "7.5": [
      "7-05-work-energy.jpg"
    ],
    "7.6": [
      "7-06-conservation.jpg"
    ],
    "7.7": [
      "7-07-power.jpg"
    ],
    "7.8": [
      "7-08-mechanical-advantage.jpg"
    ],
    "7.9": [
      "7-09-lever.jpg",
      "7-09-second-class-supplement.jpg",
      "7-09-third-class-supplement.jpg",
      "7-09-pulley-supplement.jpg",
      "7-09-movable-pulley-supplement.jpg",
      "7-09-incline-supplement.jpg"
    ]
  },
  "c9_atom": {
    "8.1": [
      "8-01-element-atoms.jpg"
    ],
    "8.2": [
      "8-02-electron-discovery.jpg"
    ],
    "8.3": [
      "8-03-proton-neutron.jpg"
    ],
    "8.4": [
      "8-04-thomson-model.jpg"
    ],
    "8.5": [
      "8-05-rutherford-scattering.jpg"
    ],
    "8.6": [
      "8-06-bohr-shells.jpg"
    ],
    "8.7": [
      "8-07-electron-distribution.jpg"
    ],
    "8.8": [
      "8-08-atomic-mass-number.jpg"
    ],
    "8.9": [
      "8-09-isotopes-isobars.jpg"
    ],
    "8.10": [
      "8-10-methane-valency.jpg",
      "8-10-water-supplement.jpg"
    ],
    "8.11": [
      "8-11-element-symbols.jpg"
    ],
    "8.12": [
      "8-12-magnesium-chloride-formula.jpg"
    ]
  },
  "c9_atomic_foundations": {
    "9.1": [
      "9-01-mass-conservation.jpg"
    ],
    "9.2": [
      "9-02-constant-proportions.jpg"
    ],
    "9.3": [
      "9-03-dalton-theory.jpg"
    ],
    "9.4": [
      "9-04-oxygen-element-molecule.jpg"
    ],
    "9.5": [
      "9-05-water-compound-molecule.jpg"
    ],
    "9.6": [
      "9-06-ions-ionic-compounds.jpg"
    ],
    "9.7": [
      "9-07-writing-chemical-formulae.jpg"
    ],
    "9.8": [
      "9-08-molecular-mass-water.jpg"
    ],
    "9.9": [
      "9-09-formula-unit-mass-nacl.jpg"
    ]
  },
  "c9_sound": {
    "10.1": [
      "10-01-sound-vibration-tuning-fork.jpg"
    ],
    "10.2": [
      "10-02-sound-medium-bell-jar.jpg"
    ],
    "10.3": [
      "10-03-longitudinal-compressions.jpg"
    ],
    "10.4": [
      "10-04-sound-pressure-time-graph.jpg"
    ],
    "10.5": [
      "10-05-wavelength-frequency-period.jpg"
    ],
    "10.6": [
      "10-06-amplitude-intensity-speed.jpg"
    ],
    "10.7": [
      "10-07-wave-speed-frequency-wavelength.jpg"
    ],
    "10.8": [
      "10-08-sound-media.jpg"
    ],
    "10.9": [
      "10-09-echo-reverberation.jpg"
    ],
    "10.10": [
      "10-10-pitch-loudness-echolocation.jpg"
    ]
  },
  "c9_reproduction9": {
    "11.1": [
      "11-01-asexual-budding-yeast.jpg"
    ],
    "11.2": [
      "11-02-budding-fragmentation-spores.jpg"
    ],
    "11.3": [
      "11-03-vegetative-potato.jpg"
    ],
    "11.4": [
      "11-04-flower-parts.jpg"
    ],
    "11.5": [
      "11-05-pollination-fertilisation.jpg"
    ],
    "11.6": [
      "11-06-seed-dispersal-germination.jpg"
    ],
    "11.7": [
      "11-07-human-reproductive-systems.jpg"
    ],
    "11.8": [
      "11-08-cycle-pregnancy.jpg"
    ],
    "11.9": [
      "11-09-reproductive-health.jpg"
    ]
  },
  "c9_diversity": {
    "12.1": [
      "12-01-why-classify.jpg"
    ],
    "12.2": [
      "12-02-five-kingdoms.jpg"
    ],
    "12.3": [
      "12-03-monera-protista-fungi.jpg"
    ],
    "12.4": [
      "12-04-plant-divisions.jpg"
    ],
    "12.5": [
      "12-05-animal-divisions.jpg"
    ],
    "12.6": [
      "12-06-binomial-nomenclature.jpg"
    ],
    "12.7": [
      "12-07-taxonomic-hierarchy.jpg"
    ],
    "12.8": [
      "12-08-virus-acellular.jpg"
    ]
  },
  "c9_earth": {
    "13.1": [
      "13-01-earth-interconnected.jpg"
    ],
    "13.2": [
      "13-02-solar-radiation-spectrum.jpg"
    ],
    "13.3": [
      "13-03-differential-heating.jpg"
    ],
    "13.4": [
      "13-04-winds-sea-breeze.jpg"
    ],
    "13.5": [
      "13-05-water-cycle.jpg"
    ],
    "13.6": [
      "13-06-carbon-cycle.jpg"
    ],
    "13.7": [
      "13-07-nitrogen-cycle.jpg"
    ],
    "13.8": [
      "13-08-oxygen-cycle.jpg"
    ],
    "13.9": [
      "13-09-human-impact.jpg"
    ]
  },
  "c10_reactions": {
    "1.1": [
      "1-01-chemical-change-evidence.jpg"
    ],
    "1.2": [
      "1-02-balancing-equations.jpg"
    ],
    "1.3": [
      "1-03-combination-reaction.jpg"
    ],
    "1.4": [
      "1-04-decomposition.jpg"
    ],
    "1.5": [
      "1-05-displacement.jpg"
    ],
    "1.6": [
      "1-06-precipitation.jpg"
    ],
    "1.7": [
      "1-07-oxidation-reduction.jpg"
    ],
    "1.8": [
      "1-08-exothermic-endothermic.jpg"
    ],
    "1.9": [
      "1-09-corrosion-rancidity.jpg"
    ]
  },
  "c10_acids": {
    "2.1": [
      "2-01-acids-bases-properties.jpg"
    ],
    "2.2": [
      "2-02-acid-base-ions.jpg"
    ],
    "2.3": [
      "2-03-indicators.jpg"
    ],
    "2.4": [
      "2-04-neutralisation.jpg"
    ],
    "2.5": [
      "2-05-ph-scale.jpg"
    ],
    "2.6": [
      "2-06-ph-everyday.jpg"
    ],
    "2.7": [
      "2-07-salt-chloralkali.jpg"
    ],
    "2.8": [
      "2-08-bleach-baking-washing.jpg"
    ],
    "2.9": [
      "2-09-plaster-gypsum.jpg"
    ]
  },
  "c10_metals": {
    "3.1": [
      "3-01-metal-nonmetal-properties.jpg"
    ],
    "3.2": [
      "3-02-metal-chemical-properties.jpg"
    ],
    "3.3": [
      "3-03-amphoteric-reactivity.jpg"
    ],
    "3.4": [
      "3-04-ionic-compounds.jpg"
    ],
    "3.5": [
      "3-05-metal-extraction.jpg"
    ],
    "3.6": [
      "3-06-electrolytic-refining.jpg"
    ],
    "3.7": [
      "3-07-corrosion-prevention.jpg"
    ],
    "3.8": [
      "3-08-alloys.jpg"
    ]
  },
  "c10_life": {
    "5.1": [
      "5-01-autotrophic-nutrition.jpg"
    ],
    "5.2": [
      "5-02-photosynthesis.jpg"
    ],
    "5.3": [
      "5-03-heterotrophic-nutrition.jpg"
    ],
    "5.4": [
      "5-04-human-digestion.jpg"
    ],
    "5.5": [
      "5-05-cellular-respiration.jpg"
    ],
    "5.6": [
      "5-06-respiratory-system.jpg"
    ],
    "5.7": [
      "5-07-plant-transport.jpg"
    ],
    "5.8": [
      "5-08-circulation.jpg"
    ],
    "5.9": [
      "5-09-excretion.jpg"
    ]
  },
  "c10_control": {
    "6.1": [
      "6-01-tropism.jpg"
    ],
    "6.2": [
      "6-02-plant-hormones.jpg"
    ],
    "6.3": [
      "6-03-neuron.jpg"
    ],
    "6.4": [
      "6-04-reflex.jpg"
    ],
    "6.5": [
      "6-05-brain.jpg"
    ],
    "6.6": [
      "6-06-actions.jpg"
    ],
    "6.7": [
      "6-07-endocrine.jpg"
    ],
    "6.8": [
      "6-08-feedback.jpg"
    ]
  },
  "c10_heredity": {
    "8.1": [
      "8-01-inheritance-variation.jpg"
    ],
    "8.2": [
      "8-02-mendel-peas.jpg"
    ],
    "8.3": [
      "8-03-monohybrid-cross.jpg"
    ],
    "8.4": [
      "8-04-dihybrid-cross.jpg"
    ],
    "8.5": [
      "8-05-dominance.jpg"
    ],
    "8.6": [
      "8-06-sex-chromosomes.jpg"
    ],
    "8.7": [
      "8-07-evolution.jpg"
    ]
  },
  "c10_env": {
    "13.1": [
      "13-01-ecosystem.jpg"
    ],
    "13.2": [
      "13-02-food-chains-webs.jpg"
    ],
    "13.3": [
      "13-03-energy-transfer.jpg"
    ],
    "13.4": [
      "13-04-biomagnification.jpg"
    ],
    "13.5": [
      "13-05-ozone.jpg"
    ],
    "13.6": [
      "13-06-waste.jpg"
    ],
    "13.7": [
      "13-07-reduce-reuse-recycle.jpg"
    ]
  },
  "c10_sustainable": {
    "M.1": [
      "M-01-resources.jpg"
    ],
    "M.2": [
      "M-02-forest.jpg"
    ],
    "M.3": [
      "M-03-rainwater.jpg"
    ],
    "M.4": [
      "M-04-resource-reuse.jpg"
    ]
  },
  "c10_sources": {
    "S.1": [
      "S-01-energy-sources.jpg"
    ],
    "S.2": [
      "S-02-solar.jpg"
    ],
    "S.3": [
      "S-03-wind-water.jpg"
    ],
    "S.4": [
      "S-04-biogas.jpg"
    ]
  },
  "c9_exploration": {
    "1.1": [
      "1-01-observation.jpg"
    ],
    "1.2": [
      "1-02-question.jpg"
    ],
    "1.3": [
      "1-03-measurement.jpg"
    ],
    "1.4": [
      "1-04-experiment.jpg"
    ],
    "1.5": [
      "1-05-model.jpg"
    ],
    "1.6": [
      "1-06-society.jpg"
    ]
  },
  "c9_matter": {
    "1.1": [
      "1-01-particles.jpg"
    ],
    "1.2": [
      "1-02-diffusion.jpg"
    ],
    "1.3": [
      "1-03-states.jpg"
    ],
    "1.4": [
      "1-04-evaporation.jpg"
    ]
  },
  "c10_repro": {
    "7.1": [
      "7-01-variation.jpg"
    ],
    "7.2": [
      "7-02-asexual.jpg"
    ],
    "7.3": [
      "7-03-vegetative.jpg"
    ],
    "7.4": [
      "7-04-flowering-plants.jpg"
    ],
    "7.5": [
      "7-05-male-reproductive.jpg"
    ],
    "7.6": [
      "7-06-female-reproductive.jpg"
    ],
    "7.7": [
      "7-07-fertilisation.jpg"
    ],
    "7.8": [
      "7-08-reproductive-health.jpg"
    ],
    "7.9": [
      "7-09-hiv-health.jpg"
    ]
  },
  "c10_carbon": {
    "4.1": [
      "4-01-covalent.jpg"
    ],
    "4.1b": [
      "4-01b-allotropes.jpg"
    ],
    "4.2": [
      "4-02-versatility.jpg"
    ],
    "4.2.1": [
      "4-02-1-bond-types.jpg"
    ],
    "4.2.2": [
      "4-02-2-chains.jpg"
    ],
    "4.2.3": [
      "4-02-3-functional-groups.jpg"
    ],
    "4.2.4": [
      "4-02-4-homologous.jpg"
    ],
    "4.2.5": [
      "4-02-5-naming.jpg"
    ],
    "4.3.1": [
      "4-03-1-combustion.jpg"
    ],
    "4.3.2": [
      "4-03-2-oxidation.jpg"
    ],
    "4.3.3": [
      "4-03-3-addition.jpg"
    ],
    "4.3.4": [
      "4-03-4-substitution.jpg"
    ],
    "4.4.1": [
      "4-04-1-ethanol.jpg"
    ],
    "4.4.2": [
      "4-04-2-ethanoic-acid.jpg"
    ],
    "4.4.2b": [
      "4-04-2b-esters.jpg"
    ],
    "4.5": [
      "4-05-soap-micelles.jpg"
    ]
  },
  "c10_periodic": {
    "P.1": [
      "P-01-triads.jpg"
    ],
    "P.2": [
      "P-02-octaves.jpg"
    ],
    "P.3": [
      "P-03-mendeleev.jpg"
    ],
    "P.4": [
      "P-04-modern-law.jpg"
    ],
    "P.5": [
      "P-05-trends.jpg"
    ]
  },
  "c10_light": {
    "9.1": [
      "9-01-reflection-laws.jpg"
    ],
    "9.2": [
      "9-02-spherical-mirrors.jpg"
    ],
    "9.2.1": [
      "9-02-1-concave-image.jpg"
    ],
    "9.2.2": [
      "9-02-2-convex-image.jpg"
    ],
    "9.2.4": [
      "9-02-4-mirror-formula.jpg"
    ],
    "9.3": [
      "9-03-refraction.jpg"
    ],
    "9.3.1": [
      "9-03-1-glass-slab.jpg"
    ],
    "9.3.3": [
      "9-03-3-lens-types.jpg"
    ],
    "9.3.7": [
      "9-03-7-lens-formula.jpg"
    ],
    "9.3.8": [
      "9-03-8-lens-power.jpg"
    ]
  },
  "c10_eye": {
    "10.1": [
      "10-01-eye-structure.jpg"
    ],
    "10.2": [
      "10-02-accommodation.jpg"
    ],
    "10.3": [
      "10-03-myopia.jpg"
    ],
    "10.4": [
      "10-04-hypermetropia.jpg"
    ],
    "10.5": [
      "10-05-prism.jpg"
    ],
    "10.6": [
      "10-06-dispersion.jpg"
    ],
    "10.7": [
      "10-07-scattering.jpg"
    ],
    "10.8": [
      "10-08-atmospheric-refraction.jpg"
    ]
  },
  "c10_electricity": {
    "11.1": [
      "11-01-current-voltage.jpg"
    ],
    "11.2": [
      "11-02-circuit-symbols.jpg"
    ],
    "11.3": [
      "11-03-ohms-law.jpg"
    ],
    "11.4": [
      "11-04-resistivity.jpg"
    ],
    "11.5": [
      "11-05-series.jpg"
    ],
    "11.6": [
      "11-06-parallel.jpg"
    ],
    "11.7": [
      "11-07-joule-heating.jpg"
    ],
    "11.8": [
      "11-08-power-energy.jpg"
    ],
    "11.9": [
      "11-09-domestic-safety.jpg"
    ]
  },
  "c10_magnetism": {
    "12.1": [
      "12-01-field-lines.jpg"
    ],
    "12.2": [
      "12-02-straight-wire.jpg"
    ],
    "12.3": [
      "12-03-thumb-rule.jpg"
    ],
    "12.4": [
      "12-04-coil-solenoid.jpg"
    ],
    "12.5": [
      "12-05-force.jpg"
    ],
    "12.6": [
      "12-06-left-hand-rule.jpg"
    ],
    "12.7": [
      "12-07-ac-dc.jpg"
    ],
    "12.8": [
      "12-08-domestic-safety.jpg"
    ],
    "12.9": [
      "12-09-motor-generator.jpg"
    ]
  },
  "c9_pure": {
    "1": [
      "1-01-pure-mixture.jpg"
    ],
    "2": [
      "1-02-solution-suspension.jpg"
    ],
    "3": [
      "1-03-separation.jpg"
    ]
  },
  "c9_atoms": {
    "1": [
      "1-01-atoms-molecules.jpg"
    ],
    "2": [
      "1-02-formula.jpg"
    ],
    "3": [
      "1-03-conservation.jpg"
    ]
  },
  "c9_disease": {
    "1": [
      "1-01-health-disease.jpg"
    ],
    "2": [
      "1-02-infection-spread.jpg"
    ],
    "3": [
      "1-03-prevention.jpg"
    ]
  }
};
  /* Realistic plates imported from anveshix/ifinite-horizon (tools/import_realistic_plates.py):
     shown FIRST for each mapped section; the generated composite stays as the next image. */
  const realistic = __EV_REALISTIC_ASSETS__;
  Object.keys(realistic).forEach(wid => {
    const g = assets[wid] || (assets[wid] = {});
    Object.keys(realistic[wid]).forEach(sec => {
      const rx = realistic[wid][sec], old = (g[sec] || []).filter(f => rx.indexOf(f) < 0);
      g[sec] = rx.concat(old);
    });
  });
  let enabled = true, identity = '', imageIndex = 0, token = 0, ready = false;
  let currentFiles = [];
  /* Only the realistic 2D plates are shown. The generated composite JPEGs
     (line diagrams) are never offered as a reading image, so a stale cycle
     index can never bring the old diagram back. */
  function filesFor(wid, sec) {
    const g = assets[wid] && assets[wid][sec];
    return g ? g.filter(f => String(f).indexOf("rx/") === 0) : [];
  }
  function has(world, sp) { return !!(world && sp && filesFor(world.id, sp.section).length); }
  function validContext() {
    return enabled && EV.view === 'book' && EV.world && has(EV.world,EV.world.spreads[WORLD.index]) &&
      WORLD.plate2d && !WORLD.turning && !EV.precision && !EV.ultra;
  }
  function hide() { const el=$('aiDraftPlate'); if (el) el.hidden=true; }
  function load() {
    const number=++token, el=$('aiDraftPlate'), img=$('aiDraftImage');
    ready=false; if(el) el.hidden=true;
    EVLABEL.destroy(document.querySelector('.ai-draft-visual'));
    const file=currentFiles[imageIndex]; if(!file || !img) return;
    const views={
      '7-09-lever.jpg':['First-class lever','प्रथम श्रेणी उत्तोलक'],
      '7-09-second-class-supplement.jpg':['Second-class lever','द्वितीय श्रेणी उत्तोलक'],
      '7-09-third-class-supplement.jpg':['Third-class lever','तृतीय श्रेणी उत्तोलक'],
      '7-09-pulley-supplement.jpg':['Fixed pulley','स्थिर घिरनी'],
      '7-09-movable-pulley-supplement.jpg':['Movable pulley','चल घिरनी'],
      '7-09-incline-supplement.jpg':['Inclined plane','आनत तल'],
      '8-10-methane-valency.jpg':['Methane: carbon valency 4, hydrogen valency 1','मीथेन: कार्बन की संयोजकता 4, हाइड्रोजन की 1'],
      '8-10-water-supplement.jpg':['Water: oxygen valency 2, hydrogen valency 1','पानी: ऑक्सीजन की संयोजकता 2, हाइड्रोजन की 1']
    };
    const v=views[file], sp=EV.world.spreads[WORLD.index];
    const description=v ? BI(v[0],v[1]) : BI(sp.title,sp.titleHi);
    const atomNotes={
      "1-01-pure-mixture.jpg": ["A pure substance has a fixed composition; it may be an element or a compound. A mixture contains two or more substances with variable proportions. PROPOSED topic for a generic placeholder; original curriculum mapping unverified. AI scene and static comparison are illustrative.", "शुद्ध पदार्थ का संघटन निश्चित होता है; वह तत्व या यौगिक हो सकता है। मिश्रण में दो या अधिक पदार्थ बदलते अनुपात में होते हैं। यह सामान्य पृष्ठ के लिए प्रस्तावित विषय है; मूल पाठ्यक्रम मिलान असत्यापित है। एआई दृश्य सांकेतिक है।"],
      "1-02-solution-suspension.jpg": ["A solution is homogeneous; dissolved particles do not settle on standing. A suspension is heterogeneous; suspended particles can settle and may be separated by filtration. PROPOSED topic for a generic placeholder; original curriculum mapping unverified. AI scene and static comparison are illustrative.", "विलयन समांगी होता है; घुले कण रखने पर नहीं बैठते। निलंबन विषमांगी होता है; कण बैठ सकते हैं और छनन से अलग हो सकते हैं। यह सामान्य पृष्ठ के लिए प्रस्तावित विषय है; मूल पाठ्यक्रम मिलान असत्यापित है। एआई दृश्य सांकेतिक है।"],
      "1-03-separation.jpg": ["Choose a separation method based on differences in physical properties. Filtration can separate an insoluble solid from a liquid; evaporation can recover a dissolved solid. PROPOSED topic for a generic placeholder; original curriculum mapping unverified. AI scene and static comparison are illustrative.", "भौतिक गुणों के अंतर के आधार पर पृथक्करण विधि चुनते हैं। छनन अघुलनशील ठोस को द्रव से अलग कर सकता है; वाष्पीकरण से घुला ठोस मिल सकता है। यह सामान्य पृष्ठ के लिए प्रस्तावित विषय है; मूल पाठ्यक्रम मिलान असत्यापित है। एआई दृश्य सांकेतिक है।"],
      "1-01-atoms-molecules.jpg": ["An atom is the smallest unit of an element retaining its chemical identity. A molecule consists of two or more atoms bonded together, such as oxygen O₂. PROPOSED topic for a generic placeholder; original curriculum mapping unverified. AI scene and static comparison are illustrative.", "परमाणु किसी तत्व की रासायनिक पहचान रखने वाली सबसे छोटी इकाई है। अणु में दो या अधिक परमाणु जुड़े होते हैं, जैसे ऑक्सीजन O₂। यह सामान्य पृष्ठ के लिए प्रस्तावित विषय है; मूल पाठ्यक्रम मिलान असत्यापित है। एआई दृश्य सांकेतिक है।"],
      "1-02-formula.jpg": ["A chemical formula identifies the elements and their proportions in a substance. In a water molecule H₂O, two hydrogen atoms combine with one oxygen atom. PROPOSED topic for a generic placeholder; original curriculum mapping unverified. AI scene and static comparison are illustrative.", "रासायनिक सूत्र पदार्थ में तत्वों और उनके अनुपात को बताता है। जल के अणु H₂O में दो हाइड्रोजन और एक ऑक्सीजन परमाणु होते हैं। यह सामान्य पृष्ठ के लिए प्रस्तावित विषय है; मूल पाठ्यक्रम मिलान असत्यापित है। एआई दृश्य सांकेतिक है।"],
      "1-03-conservation.jpg": ["In an ordinary chemical reaction, total mass is conserved in a closed system. A balanced equation has the same number of each kind of atom on both sides. PROPOSED topic for a generic placeholder; original curriculum mapping unverified. AI scene and static comparison are illustrative.", "सामान्य रासायनिक अभिक्रिया में बंद निकाय का कुल द्रव्यमान संरक्षित रहता है। संतुलित समीकरण के दोनों ओर प्रत्येक प्रकार के परमाणुओं की संख्या समान होती है। यह सामान्य पृष्ठ के लिए प्रस्तावित विषय है; मूल पाठ्यक्रम मिलान असत्यापित है। एआई दृश्य सांकेतिक है।"],
      "1-01-health-disease.jpg": ["Health includes physical, mental and social well-being, not just absence of disease. Diseases can have infectious or non-infectious causes. PROPOSED topic for a generic placeholder; original curriculum mapping unverified. AI scene and static comparison are illustrative.", "स्वास्थ्य में शारीरिक, मानसिक और सामाजिक कुशलता शामिल है, केवल रोग का अभाव नहीं। रोगों के कारण संक्रामक या असंक्रामक हो सकते हैं। यह सामान्य पृष्ठ के लिए प्रस्तावित विषय है; मूल पाठ्यक्रम मिलान असत्यापित है। एआई दृश्य सांकेतिक है।"],
      "1-02-infection-spread.jpg": ["Infectious diseases may spread through air, contaminated food or water, contact, or vectors, depending on the disease. Not every infection spreads by every route; seek qualified advice for symptoms. PROPOSED topic for a generic placeholder; original curriculum mapping unverified. AI scene and static comparison are illustrative.", "रोग के अनुसार संक्रमण वायु, दूषित भोजन या जल, संपर्क या वाहक से फैल सकता है। हर संक्रमण हर मार्ग से नहीं फैलता; लक्षण होने पर योग्य सलाह लें। यह सामान्य पृष्ठ के लिए प्रस्तावित विषय है; मूल पाठ्यक्रम मिलान असत्यापित है। एआई दृश्य सांकेतिक है।"],
      "1-03-prevention.jpg": ["Hand hygiene, safe water, ventilation and recommended vaccination reduce risks of specific infections. Prevention depends on the disease; contact a qualified health professional when needed. PROPOSED topic for a generic placeholder; original curriculum mapping unverified. AI scene and static comparison are illustrative.", "हाथों की स्वच्छता, सुरक्षित जल, वेंटिलेशन और अनुशंसित टीके विशिष्ट संक्रमणों का जोखिम घटाते हैं। रोकथाम रोग पर निर्भर है; जरूरत पर योग्य स्वास्थ्यकर्मी से संपर्क करें। यह सामान्य पृष्ठ के लिए प्रस्तावित विषय है; मूल पाठ्यक्रम मिलान असत्यापित है। एआई दृश्य सांकेतिक है।"],

      "12-01-field-lines.jpg": ["Magnetic field describes the magnetic influence at each point. Outside a bar magnet, field lines go from north to south; inside they return to form closed loops. Closer lines indicate a stronger field; field lines do not intersect. Field lines are conceptual; the AI props do not show a measured field. Static, not slider-driven.", "चुंबकीय क्षेत्र प्रत्येक बिंदु पर चुंबकीय प्रभाव बताता है। दंड चुंबक के बाहर क्षेत्र रेखाएँ उत्तर से दक्षिण और अंदर लौटकर बंद वक्र बनाती हैं। अधिक पास रेखाएँ अधिक प्रबल क्षेत्र दर्शाती हैं; क्षेत्र रेखाएँ नहीं काटतीं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "12-02-straight-wire.jpg": ["A current-carrying straight conductor produces concentric magnetic field lines. For a long straight wire, field strength increases with current and decreases with distance. A dot represents current coming out of the page in this diagram. A cross-section is schematic and not a field measurement. Static, not slider-driven.", "धारावाही सीधे चालक के चारों ओर संकेंद्री चुंबकीय क्षेत्र रेखाएँ बनती हैं। लंबे सीधे तार के लिए क्षेत्र धारा बढ़ने पर बढ़ता और दूरी बढ़ने पर घटता है। इस चित्र में बिंदु पृष्ठ से बाहर आती धारा दर्शाता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "12-03-thumb-rule.jpg": ["Point the right thumb along conventional current in a straight conductor. Curled fingers show the direction of magnetic field lines around the wire. For current out of the page, the field circles anticlockwise as viewed. Cross-section demonstrates the rule; no hand anatomy is depicted. Static, not slider-driven.", "सीधे चालक में दाएँ हाथ का अंगूठा परंपरागत धारा की दिशा में रखें। मुड़ी उँगलियाँ तार के चारों ओर चुंबकीय क्षेत्र की दिशा बताती हैं। पृष्ठ से बाहर धारा के लिए देखा गया क्षेत्र वामावर्त घूमता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "12-04-coil-solenoid.jpg": ["A current loop produces a magnetic field, including a field through its centre. A solenoid has many turns; its interior field can be approximately uniform away from the ends. The field depends on current, turns and geometry. Loop and solenoid are schematic; winding directions are not specified. Static, not slider-driven.", "धारावाही वृत्ताकार कुंडली केंद्र से होकर जाने वाला चुंबकीय क्षेत्र बनाती है। परिनालिका में अनेक फेरे होते हैं; सिरों से दूर अंदर क्षेत्र लगभग एकसमान हो सकता है। क्षेत्र धारा, फेरों और आकार पर निर्भर करता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "12-05-force.jpg": ["A conductor carrying current can experience force in a magnetic field. For current perpendicular to the field, force is perpendicular to both directions. Reversing current or field reverses the force direction. The direction sketch is idealised; no measured force is shown. Static, not slider-driven.", "चुंबकीय क्षेत्र में धारावाही चालक पर बल लग सकता है। धारा क्षेत्र के लंबवत हो तो बल दोनों दिशाओं के लंबवत होता है। धारा या क्षेत्र की दिशा उलटने से बल की दिशा उलटती है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "12-06-left-hand-rule.jpg": ["For perpendicular field and current, use the left hand with three mutually perpendicular digits. Forefinger: magnetic field; middle finger: conventional current; thumb: force or motion. This direction rule applies to a motor effect, not to choosing a current direction for induction. The schematic illustrates perpendicular directions; no hand anatomy is depicted. Static, not slider-driven.", "परस्पर लंबवत क्षेत्र और धारा के लिए बाएँ हाथ की तीन परस्पर लंबवत उँगलियाँ लें। तर्जनी: चुंबकीय क्षेत्र; मध्यमा: परंपरागत धारा; अंगूठा: बल या गति। यह दिशा नियम मोटर प्रभाव के लिए है, प्रेरण में धारा चुनने के लिए नहीं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "12-07-ac-dc.jpg": ["Direct current has one direction; its magnitude can be steady or vary. Alternating current reverses direction periodically. The curves illustrate idealised examples, not measured supply. Waveforms are illustrative; electrical supply must not be probed without proper training. Static, not slider-driven.", "दिष्ट धारा की दिशा एक रहती है; उसका परिमाण स्थिर या बदलता हो सकता है। प्रत्यावर्ती धारा समय-समय पर दिशा बदलती है। वक्र आदर्श उदाहरण हैं, मापी हुई आपूर्ति नहीं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "12-08-domestic-safety.jpg": ["Fuses and circuit breakers are selected to interrupt excessive current. Protective earthing can reduce shock risk for appropriate equipment. Mains electricity is dangerous; use a qualified electrician for installation or repair. Safety descriptions are conceptual, not wiring instructions or certification. Static, not slider-driven.", "फ्यूज और सर्किट ब्रेकर अत्यधिक धारा रोकने के लिए चुने जाते हैं। सुरक्षात्मक अर्थिंग उपयुक्त उपकरणों में झटके का जोखिम घटा सकती है। मुख्य बिजली खतरनाक है; स्थापना या मरम्मत योग्य बिजलीकर्मी से कराएँ। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "12-09-motor-generator.jpg": ["An electric motor converts electrical energy to mechanical energy. Changing magnetic flux can induce an emf; a generator converts mechanical energy to electrical energy. The energy-flow boxes do not show device construction. Energy flow is schematic; internal parts and induction process are not pictured. Static, not slider-driven.", "विद्युत मोटर विद्युत ऊर्जा को यांत्रिक ऊर्जा में बदलती है। बदलता चुंबकीय फ्लक्स विद्युत वाहक बल प्रेरित कर सकता है; जनित्र यांत्रिक ऊर्जा को विद्युत ऊर्जा में बदलता है। ऊर्जा-प्रवाह बक्से उपकरणों की बनावट नहीं दिखाते। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],

      "11-01-current-voltage.jpg": ["Current I = Q/t is the rate of flow of electric charge. Potential difference V = W/Q is energy transferred per unit charge. Current is measured in amperes and potential difference in volts. Equations illustrate definitions; the AI circuit is not a verified measurement. Static, not slider-driven.", "धारा I = Q/t विद्युत आवेश प्रवाह की दर है। विभवांतर V = W/Q प्रति इकाई आवेश स्थानांतरित ऊर्जा है। धारा ऐम्पियर में और विभवांतर वोल्ट में मापा जाता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "11-02-circuit-symbols.jpg": ["Circuit diagrams use standard symbols to represent electrical components. An ammeter is connected in series; a voltmeter is connected across a component. The drawing is schematic; never work on live mains circuits. Meter symbols are schematic; AI equipment connections are unverified. Static, not slider-driven.", "परिपथ आरेख विद्युत घटकों को मानक संकेतों से दर्शाते हैं। ऐमीटर श्रेणीक्रम में और वोल्टमीटर घटक के समानांतर जोड़ा जाता है। चित्र सांकेतिक है; चालू मुख्य विद्युत परिपथ पर काम न करें। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "11-03-ohms-law.jpg": ["For an ohmic conductor at constant temperature, V is proportional to I. V = IR; on a V-versus-I graph the slope is resistance R. Not every component obeys Ohm’s law under all conditions. Graph is idealised; no experimental readings are shown. Static, not slider-driven.", "नियत ताप पर ओमीय चालक के लिए V, I के समानुपाती है। V = IR; V बनाम I ग्राफ की ढाल प्रतिरोध R है। हर घटक सभी परिस्थितियों में ओम के नियम का पालन नहीं करता। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "11-04-resistivity.jpg": ["For a uniform conductor R = ρL/A. Resistance increases with length L and decreases with cross-sectional area A. Resistivity ρ depends on material and temperature; its SI unit is ohm metre. Wire model is schematic, not a measured specimen. Static, not slider-driven.", "एकसमान चालक के लिए R = ρL/A है। प्रतिरोध लंबाई L बढ़ने पर बढ़ता और अनुप्रस्थ क्षेत्रफल A बढ़ने पर घटता है। प्रतिरोधकता ρ पदार्थ और ताप पर निर्भर है; SI इकाई ओम मीटर है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "11-05-series.jpg": ["Series components form one path, so the same current flows through each. For resistors in series, Rₑq = R₁ + R₂. The supply voltage is shared across the resistors. The circuit is an idealised diagram; background wiring is not verified. Static, not slider-driven.", "श्रेणीक्रम घटक एक पथ बनाते हैं, इसलिए प्रत्येक में समान धारा बहती है। श्रेणीक्रम प्रतिरोधों के लिए Rₑq = R₁ + R₂ है। आपूर्ति विभवांतर प्रतिरोधों के बीच बँटता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "11-06-parallel.jpg": ["Parallel resistors are connected across the same two nodes. Each branch has the same voltage; currents can differ and add at a junction. For two resistors: 1/Rₑq = 1/R₁ + 1/R₂. Parallel paths are idealised; the AI circuit is not a tested connection. Static, not slider-driven.", "समांतर प्रतिरोध समान दो बिंदुओं के बीच जुड़े होते हैं। हर शाखा का विभवांतर समान है; धाराएँ अलग हो सकती हैं और संधि पर जुड़ती हैं। दो प्रतिरोधों के लिए: 1/Rₑq = 1/R₁ + 1/R₂। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "11-07-joule-heating.jpg": ["For a resistor with constant current, electrical energy converted to heat is H = I²Rt. Heating is useful in appliances but unwanted heating can damage wiring. Use correctly rated protective devices; never experiment with mains wiring. Formula panel is schematic; background does not demonstrate heating. Static, not slider-driven.", "नियत धारा वाले प्रतिरोध में ऊष्मा में बदली ऊर्जा H = I²Rt है। ऊष्मा उपकरणों में उपयोगी है, लेकिन अवांछित ऊष्मा तारों को क्षति पहुँचा सकती है। सही रेटिंग वाले सुरक्षा उपकरण उपयोग करें; मुख्य तारों पर प्रयोग न करें। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "11-08-power-energy.jpg": ["Power P = VI is the rate of electrical energy transfer. For a resistor P = I²R = V²/R; energy E = Pt for constant power. One kilowatt-hour is 3.6 million joules. Equations are illustrative; no consumption reading is measured. Static, not slider-driven.", "शक्ति P = VI विद्युत ऊर्जा स्थानांतरण की दर है। प्रतिरोध के लिए P = I²R = V²/R; नियत शक्ति पर ऊर्जा E = Pt। एक किलोवाट-घंटा 36 लाख जूल होता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "11-09-domestic-safety.jpg": ["Domestic appliances are connected in parallel so each receives the supply voltage. Proper fuses or circuit breakers interrupt excessive current; earthing reduces shock risk for suitable equipment. Mains electricity is dangerous. Use a qualified electrician for installation or repair. Safety icons are conceptual, not wiring instructions or a certified installation. Static, not slider-driven.", "घरेलू उपकरण समांतर जुड़ते हैं ताकि प्रत्येक को आपूर्ति विभवांतर मिले। उचित फ्यूज या ब्रेकर अत्यधिक धारा रोकते हैं; अर्थिंग उपयुक्त उपकरणों में झटके का जोखिम घटाती है। मुख्य बिजली खतरनाक है। स्थापना या मरम्मत के लिए योग्य बिजलीकर्मी बुलाएँ। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],

      "10-01-eye-structure.jpg": ["Light enters through the cornea; the iris controls pupil size. The eye lens helps focus light on the light-sensitive retina. The optic nerve carries signals from the retina to the brain. Cross-section is simplified; AI model is not a verified anatomy reference. Static, not slider-driven.", "प्रकाश कॉर्निया से प्रवेश करता है; परितारिका पुतली का आकार नियंत्रित करती है। नेत्र लेंस प्रकाश-संवेदी दृष्टिपटल पर प्रकाश केंद्रित करने में मदद करता है। दृष्टि तंत्रिका दृष्टिपटल से मस्तिष्क तक संकेत ले जाती है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "10-02-accommodation.jpg": ["Accommodation changes the eye lens shape so near or distant objects can be focused. For near objects the lens is more curved; for distant objects it is less curved. About 25 cm is a textbook near point for a young normal eye; it varies by age and person. Lens-shape comparison is schematic, not to scale or a clinical measurement. Static, not slider-driven.", "समंजन नेत्र लेंस का आकार बदलकर पास या दूर की वस्तुओं को फोकस करने में मदद करता है। निकट वस्तु के लिए लेंस अधिक वक्र और दूर की वस्तु के लिए कम वक्र होता है। युवा सामान्य नेत्र का पाठ्यपुस्तक निकट बिंदु लगभग 25 सेमी है; व्यक्ति और आयु के अनुसार बदलता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "10-03-myopia.jpg": ["In myopia, distant objects are blurred; the uncorrected focus lies in front of the retina. A suitable concave lens diverges incoming rays so the eye can focus them on the retina. An eye-care professional determines the appropriate correction. Focus sketches are simplified; not a diagnosis or prescription. Static, not slider-driven.", "निकट दृष्टिदोष में दूर की वस्तुएँ धुंधली होती हैं; बिना सुधार फोकस दृष्टिपटल के आगे बनता है। उपयुक्त अवतल लेंस किरणों को अपसारित कर दृष्टिपटल पर फोकस बनाने में मदद करता है। उपयुक्त सुधार नेत्र-देखभाल विशेषज्ञ निर्धारित करते हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "10-04-hypermetropia.jpg": ["In hypermetropia, a near object may focus behind the retina without correction. A suitable convex lens can help bring near-object focus onto the retina. Presbyopia is age-related loss of accommodation; correction depends on the person. Focus sketches are simplified; age-related presbyopia is described, not a medical diagnosis. Static, not slider-driven.", "दूर दृष्टिदोष में बिना सुधार निकट वस्तु का फोकस दृष्टिपटल के पीछे बन सकता है। उपयुक्त उत्तल लेंस निकट वस्तु का फोकस दृष्टिपटल पर लाने में मदद कर सकता है। जरादृष्टि उम्र से जुड़ी समंजन क्षमता की कमी है; सुधार व्यक्ति पर निर्भर करता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "10-05-prism.jpg": ["A prism has refracting surfaces inclined to each other. A ray refracts at entry and exit; its overall direction is deviated. The amount depends on prism angle, material and wavelength. Prism ray is schematic, not a measured angle of deviation. Static, not slider-driven.", "प्रिज्म की अपवर्तक सतहें एक-दूसरे से झुकी होती हैं। किरण प्रवेश और निर्गमन दोनों पर अपवर्तित होती है; कुल मिलाकर दिशा बदलती है। विचलन प्रिज्म कोण, पदार्थ और तरंगदैर्ध्य पर निर्भर करता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "10-06-dispersion.jpg": ["A prism disperses white light because its refractive index varies with wavelength. In ordinary glass, violet bends more than red in the visible spectrum. The displayed bands are schematic; a real spectrum is continuous. Schematic coloured rays are not a measured spectrum. Static, not slider-driven.", "प्रिज्म श्वेत प्रकाश को फैलाता है क्योंकि उसका अपवर्तनांक तरंगदैर्ध्य के साथ बदलता है। सामान्य काँच में दृश्य वर्णक्रम का बैंगनी प्रकाश लाल से अधिक मुड़ता है। दिखाई पट्टियाँ सांकेतिक हैं; वास्तविक वर्णक्रम सतत होता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "10-07-scattering.jpg": ["Air molecules scatter shorter visible wavelengths more strongly than longer ones. Scattered sunlight contributes to the blue sky; a long atmospheric path can redden the Sun. Colloidal particles can make a light beam visible through scattering: the Tyndall effect. Scattering diagram is conceptual; particle sizes and wavelengths are not to scale. Static, not slider-driven.", "वायु अणु छोटी दृश्य तरंगदैर्ध्यों को लंबी तरंगदैर्ध्यों से अधिक प्रकीर्णित करते हैं। प्रकीर्णित सूर्यप्रकाश नीले आकाश में योगदान देता है; लंबा वायुमंडलीय पथ सूर्य को लाल बना सकता है। कोलॉइडी कण प्रकीर्णन से प्रकाश किरण दिखा सकते हैं: यह टिंडल प्रभाव है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "10-08-atmospheric-refraction.jpg": ["Changing air layers refract starlight, changing its apparent position and brightness. Distant stars behave approximately as point sources and commonly twinkle. Planets are extended sources, so variations average out more; they usually twinkle less. Atmospheric layers and light path are schematic; no observation is recorded. Static, not slider-driven.", "बदलती वायु परतें तारों के प्रकाश को अपवर्तित कर उनकी आभासी स्थिति और चमक बदलती हैं। दूर के तारे लगभग बिंदु स्रोत जैसे दिखते हैं और सामान्यतः टिमटिमाते हैं। ग्रह विस्तृत स्रोत हैं, इसलिए बदलाव अधिक औसत होते हैं; वे आम तौर पर कम टिमटिमाते हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],

      "9-03-refraction.jpg": ["A transmitted ray bends when its speed changes, except at normal incidence. Snell’s law: n₁ sin i = n₂ sin r; angles are measured from the normal. The refractive index n = c/v for a medium at a given wavelength. Ray sketch is idealised; the AI bench does not measure refractive index. Static, not slider-driven.", "संचारित किरण चाल बदलने पर मुड़ती है, लंबवत आपतन को छोड़कर। स्नेल का नियम: n₁ sin i = n₂ sin r; कोण अभिलंब से मापे जाते हैं। किसी तरंगदैर्ध्य पर माध्यम का अपवर्तनांक n = c/v है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "9-03-1-glass-slab.jpg": ["A ray bends towards the normal on entering glass from air and away on leaving. With parallel faces and air on both sides, the emergent ray is parallel to the incident ray. It is laterally displaced from the straight-line continuation of the incident ray. Idealised path; lateral shift is shown qualitatively, not measured. Static, not slider-driven.", "वायु से काँच में प्रवेश पर किरण अभिलंब की ओर और निकलते समय दूर मुड़ती है। समांतर सतहों और दोनों ओर वायु होने पर निर्गत किरण आपतित किरण के समांतर होती है। यह आपतित किरण के सीधे बढ़ाए पथ से पार्श्व में विस्थापित होती है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "9-03-3-lens-types.jpg": ["In air, a convex lens converges paraxial rays parallel to the principal axis. In air, a concave lens diverges these rays; their backward extensions meet at a virtual focus. The behaviour depends on the lens and surrounding medium. Thin-lens diagrams are schematic; no experimental lens is verified. Static, not slider-driven.", "वायु में उत्तल लेंस मुख्य अक्ष के समानांतर निकट-अक्षीय किरणें अभिसरित करता है। वायु में अवतल लेंस इन्हें अपसारित करता है; पीछे बढ़ाए भाग आभासी फोकस पर मिलते हैं। व्यवहार लेंस और आसपास के माध्यम पर निर्भर करता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "9-03-7-lens-formula.jpg": ["For a thin spherical lens: 1/v − 1/u = 1/f. Lens magnification m = image height / object height = v/u. Use Cartesian signed distances from the optical centre. Equations are schematic; signs depend on the Cartesian convention. Static, not slider-driven.", "पतले गोलीय लेंस के लिए: 1/v − 1/u = 1/f। लेंस का आवर्धन m = प्रतिबिंब ऊँचाई / वस्तु ऊँचाई = v/u है। प्रकाशिक केंद्र से कार्तीय चिह्नयुक्त दूरियाँ लें। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "9-03-8-lens-power.jpg": ["Power P = 1/f, with focal length f in metres; the unit is dioptre (D). In air a converging lens has positive power and a diverging lens has negative power. Thin lenses in contact have total power approximately P₁ + P₂. Formula panel is schematic; lens combinations are not physically demonstrated. Static, not slider-driven.", "क्षमता P = 1/f, जहाँ फोकस दूरी f मीटर में है; इकाई डायोप्टर (D) है। वायु में अभिसारी लेंस की क्षमता धनात्मक और अपसारी लेंस की ऋणात्मक होती है। संपर्क में रखे पतले लेंसों की कुल क्षमता लगभग P₁ + P₂ होती है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],

      "9-01-reflection-laws.jpg": ["The incident ray, reflected ray and normal lie in the same plane. The angle of incidence equals the angle of reflection; both are measured from the normal. The ray diagram is schematic, not a measured beam. Ray sketch is schematic; AI bench does not show a measured reflection. Static, not slider-driven.", "आपतित किरण, परावर्तित किरण और अभिलंब एक ही तल में होते हैं। आपतन कोण परावर्तन कोण के बराबर है; दोनों अभिलंब से मापे जाते हैं। किरण आरेख सांकेतिक है, मापी हुई किरण नहीं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "9-02-spherical-mirrors.jpg": ["The pole P is the midpoint of the reflecting surface; C is its centre of curvature. For paraxial rays of a spherical mirror, the focus F lies approximately midway between P and C. The focal length is about half the radius: |R| ≈ 2|f|. Spherical-mirror geometry is idealised and applies to paraxial rays; AI equipment is unverified. Static, not slider-driven.", "ध्रुव P परावर्तक सतह का मध्य बिंदु है; C वक्रता केंद्र है। गोलीय दर्पण की निकट-अक्षीय किरणों के लिए फोकस F लगभग P और C के मध्य होता है। इसलिए फोकस दूरी का परिमाण वक्रता त्रिज्या का लगभग आधा है: |R| ≈ 2|f|। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "9-02-1-concave-image.jpg": ["When an object is beyond C, a concave mirror forms a real, inverted, diminished image between C and F. The diagram shows one idealised paraxial case; actual reflected rays meet at the image. Other object positions produce different images; the complete image table is not shown. One idealised ray case only; the full image-formation table is not pictured. Static, not slider-driven.", "वस्तु C से परे हो तो अवतल दर्पण C और F के बीच वास्तविक, उलटा और छोटा प्रतिबिंब बनाता है। आरेख एक आदर्श निकट-अक्षीय स्थिति दिखाता है; परावर्तित किरणें प्रतिबिंब पर मिलती हैं। वस्तु की अन्य स्थितियों पर अलग प्रतिबिंब बनते हैं; पूरी प्रतिबिंब सारणी नहीं दिखाई गई है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "9-02-2-convex-image.jpg": ["For a real object, a convex mirror forms a virtual, upright and diminished image behind the mirror. Dashed back-extensions of reflected rays appear to meet at the virtual image. Convex rear-view mirrors can show a wider field of view than comparable plane mirrors. Ray construction is a schematic paraxial model; field of view is described, not measured. Static, not slider-driven.", "वास्तविक वस्तु के लिए उत्तल दर्पण के पीछे आभासी, सीधा और छोटा प्रतिबिंब बनता है। परावर्तित किरणों के बिंदीदार पीछे बढ़ाए भाग आभासी प्रतिबिंब पर मिलते प्रतीत होते हैं। उत्तल पीछे देखने वाले दर्पण समान आकार के समतल दर्पण से अधिक दृश्य क्षेत्र दिखा सकते हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "9-02-4-mirror-formula.jpg": ["For a spherical mirror: 1/f = 1/v + 1/u. Magnification m = image height / object height = −v/u. Use the Cartesian sign convention: distances along incident light are positive. Equations are schematic, not a measured optical experiment; signs depend on convention. Static, not slider-driven.", "गोलीय दर्पण के लिए: 1/f = 1/v + 1/u। आवर्धन m = प्रतिबिंब ऊँचाई / वस्तु ऊँचाई = −v/u। कार्तीय चिह्न परिपाटी अपनाएँ: आपतित प्रकाश की दिशा में दूरियाँ धनात्मक हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],

      "P-01-triads.jpg": ["Some groups of three elements had similar chemical properties. For Li, Na and K, sodium’s atomic mass is close to the mean of lithium and potassium. Only some elements fit triads; masses shown are modern rounded values. Historical scene is AI-generated; chart is a schematic with modern rounded atomic masses. Static, not slider-driven.", "कुछ तीन-तत्व समूहों के रासायनिक गुण समान थे। Li, Na और K में सोडियम का परमाणु द्रव्यमान लिथियम और पोटैशियम के औसत के निकट है। केवल कुछ तत्व त्रिक में फिट होते हैं; द्रव्यमान आधुनिक निकटमान हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "P-02-octaves.jpg": ["Newlands arranged known elements approximately by increasing atomic mass. He noticed recurring similarities: Li and Na are an example of the inclusive eighth position. The pattern worked mainly for lighter elements and did not fit all later discoveries. Illustrative sequence only; it is not a facsimile of Newlands’ original table. Static, not slider-driven.", "न्यूलैंड ने ज्ञात तत्वों को लगभग बढ़ते परमाणु द्रव्यमान के क्रम में रखा। उन्होंने गुणों की पुनरावृत्ति देखी: Li और Na आठवें स्थान का उदाहरण हैं, दोनों सिरे गिनकर। यह क्रम मुख्यतः हल्के तत्वों पर लागू हुआ और बाद की सभी खोजों में ठीक नहीं बैठा। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "P-03-mendeleev.jpg": ["Mendeleev organised elements largely by atomic mass and recurring chemical properties. He left gaps and predicted properties of undiscovered elements. Eka-silicon was later identified with germanium; the comparison is schematic. Comparison is schematic, not Mendeleev’s original table or a verified historical photograph. Static, not slider-driven.", "मेंडेलीफ़ ने तत्वों को मुख्यतः परमाणु द्रव्यमान और आवर्ती रासायनिक गुणों से व्यवस्थित किया। उन्होंने अज्ञात तत्वों के लिए रिक्त स्थान छोड़े और उनके गुणों का पूर्वानुमान किया। एका-सिलिकॉन की पहचान बाद में जर्मेनियम से हुई; तुलना सांकेतिक है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "P-04-modern-law.jpg": ["Element properties recur periodically when elements are ordered by atomic number. Groups are columns and periods are rows; atomic number is the number of protons. The chart shows the first three periods only; groups 3–12 are omitted. Partial table is schematic; AI sample identities are not verified. Static, not slider-driven.", "तत्वों को परमाणु संख्या से क्रमित करने पर उनके गुण आवर्ती रूप से दोहराते हैं। समूह स्तंभ और आवर्त पंक्तियाँ हैं; परमाणु संख्या प्रोटॉनों की संख्या है। चार्ट केवल पहले तीन आवर्त दिखाता है; समूह 3–12 छोड़े गए हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "P-05-trends.jpg": ["Atomic radius generally decreases across a period and generally increases down a group. Metallic character generally decreases across a period and increases down a group. These are broad trends with exceptions; radii depend on how they are defined. Trend arrows are schematic; no atomic radii are measured and exceptions occur. Static, not slider-driven.", "परमाणु त्रिज्या सामान्यतः आवर्त में घटती और समूह में नीचे बढ़ती है। धात्विक गुण सामान्यतः आवर्त में घटता और समूह में नीचे बढ़ता है। ये व्यापक प्रवृत्तियाँ हैं जिनमें अपवाद हैं; त्रिज्या की परिभाषा महत्त्वपूर्ण है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],

      "4-03-1-combustion.jpg": ["Complete combustion of methane: CH₄ + 2O₂ → CO₂ + 2H₂O. Insufficient oxygen can produce carbon monoxide or soot; conditions matter. The candle is illustrative; its fuel and combustion products are not measured. AI candle is illustrative, not methane identification or measured flame chemistry. Static, not slider-driven.", "मीथेन का पूर्ण दहन: CH₄ + 2O₂ → CO₂ + 2H₂O। अपर्याप्त ऑक्सीजन से कार्बन मोनोऑक्साइड या कालिख बन सकती है; दशाएँ महत्त्वपूर्ण हैं। मोमबत्ती सांकेतिक है; इसके ईंधन और दहन उत्पाद मापे नहीं गए हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-03-2-oxidation.jpg": ["Ethanol can be oxidised to ethanoic acid with a suitable oxidising agent. A simplified equation is CH₃CH₂OH + 2[O] → CH₃COOH + H₂O. The lab props do not show a reaction; do not treat them as experiment instructions. AI lab contents and reaction are unverified; formulas are schematic. Static, not slider-driven.", "उपयुक्त ऑक्सीकारक से एथेनॉल का ऑक्सीकरण एथेनोइक अम्ल में हो सकता है। सरल समीकरण है CH₃CH₂OH + 2[O] → CH₃COOH + H₂O। प्रयोगशाला की वस्तुएँ अभिक्रिया नहीं दिखातीं; इन्हें प्रयोग निर्देश न मानें। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-03-3-addition.jpg": ["In hydrogenation, hydrogen adds across an unsaturated carbon–carbon bond. Ethene + hydrogen gives ethane with a suitable catalyst: C₂H₄ + H₂ → C₂H₆. The equation is a symbolic example, not a demonstration of reaction conditions. AI lab scene does not demonstrate hydrogenation; structures are schematic. Static, not slider-driven.", "हाइड्रोजनीकरण में हाइड्रोजन असंतृप्त कार्बन–कार्बन बंध पर जुड़ता है। उपयुक्त उत्प्रेरक से एथीन + हाइड्रोजन से एथेन बनता है: C₂H₄ + H₂ → C₂H₆। समीकरण सांकेतिक उदाहरण है, अभिक्रिया दशाओं का प्रदर्शन नहीं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-03-4-substitution.jpg": ["A substitution replaces an atom or group in a molecule with another. One example: CH₄ + Cl₂ → CH₃Cl + HCl, in the presence of light. Further substitution can occur; the still is not a lab procedure. AI lab objects and contents are unverified; no chlorine reaction is depicted. Static, not slider-driven.", "प्रतिस्थापन में अणु का एक परमाणु या समूह दूसरे से बदलता है। एक उदाहरण: प्रकाश की उपस्थिति में CH₄ + Cl₂ → CH₃Cl + HCl। आगे भी प्रतिस्थापन हो सकता है; स्थिर चित्र प्रयोग विधि नहीं है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-04-1-ethanol.jpg": ["Ethanol reacts with sodium to form sodium ethoxide and hydrogen gas. Ethanol can also be dehydrated to ethene under appropriate acidic conditions. Reaction conditions require professional safety controls; this is not an experiment guide. AI lab bottles do not identify their contents or demonstrate reactions; no experiment instructions. Static, not slider-driven.", "एथेनॉल सोडियम से अभिक्रिया कर सोडियम एथॉक्साइड और हाइड्रोजन गैस बनाता है। उपयुक्त अम्लीय दशाओं में एथेनॉल का निर्जलीकरण कर एथीन भी बनता है। अभिक्रिया दशाओं में पेशेवर सुरक्षा आवश्यक है; यह प्रयोग निर्देश नहीं है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-04-2-ethanoic-acid.jpg": ["Ethanoic acid CH₃COOH is a weak acid; vinegar is a dilute aqueous solution. It reacts with a base to form a salt and water. It also reacts with carbonate or hydrogencarbonate, releasing carbon dioxide. AI lab props are unverified; neutralisation and gas evolution are not demonstrated. Static, not slider-driven.", "एथेनोइक अम्ल CH₃COOH दुर्बल अम्ल है; सिरका इसका तनु जलीय विलयन है। यह क्षार से अभिक्रिया कर लवण और जल बनाता है। यह कार्बोनेट या हाइड्रोजनकार्बोनेट से भी अभिक्रिया कर कार्बन डाइऑक्साइड छोड़ता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-04-2b-esters.jpg": ["Ethanoic acid and ethanol can form ethyl ethanoate and water in an acid-catalysed reaction. Alkaline hydrolysis of fats or oils can produce soap and glycerol. The props do not prove product identity or scent. Formulae are symbolic; AI lab image does not demonstrate ester formation or soap production. Static, not slider-driven.", "अम्ल उत्प्रेरण में एथेनोइक अम्ल और एथेनॉल से एथिल एथेनोएट तथा जल बन सकते हैं। वसा या तेल के क्षारीय जल अपघटन से साबुन और ग्लिसरॉल बन सकते हैं। इन वस्तुओं से उत्पाद की पहचान या गंध सिद्ध नहीं होती। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-05-soap-micelles.jpg": ["Soap molecules have a water-attracting ionic head and an oil-attracting hydrocarbon tail. In water, tails can surround oily dirt while heads face the water. The schematic is not to scale; actual soap and liquids are not verified in the photo. Micelle is a schematic, not microscopy; AI scene does not demonstrate cleaning. Static, not slider-driven.", "साबुन अणु में जल आकर्षित करने वाला आयनिक सिर और तेल आकर्षित करने वाली हाइड्रोकार्बन पूँछ होती है। जल में पूँछें चिकने मैल को घेर सकती हैं और सिर जल की ओर होते हैं। सांकेतिक चित्र वास्तविक अनुपात में नहीं है; फोटो में साबुन व द्रव सत्यापित नहीं हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],

      "4-01-covalent.jpg": ["A covalent bond involves a shared pair of electrons between atoms. Carbon commonly forms four covalent bonds; hydrogen commonly forms one. These molecular formulae are schematic; the loose kit pieces are not actual molecules. Molecule depictions are schematic; the AI-generated kit is illustrative, not a micrograph. Static, not slider-driven.", "सहसंयोजक बंध में परमाणुओं के बीच इलेक्ट्रॉनों की एक जोड़ी साझा होती है। कार्बन सामान्यतः चार सहसंयोजक बंध और हाइड्रोजन एक बंध बनाता है। ये अणु सूत्र सांकेतिक हैं; बिखरे मॉडल के टुकड़े वास्तविक अणु नहीं हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-01b-allotropes.jpg": ["Diamond, graphite and fullerene are different forms of the element carbon. Different carbon bonding and structures lead to different properties. Graphite has layered structure; diamond has a three-dimensional bonded network. AI specimens are unverified; internal structures and fullerene are not visible. Static, not slider-driven.", "हीरा, ग्रेफाइट और फुलरीन कार्बन तत्व के अलग रूप हैं। कार्बन के अलग बंध और संरचनाओं से अलग गुण मिलते हैं। ग्रेफाइट की संरचना परतदार है; हीरे में त्रिविमीय बंधित जाल होता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-02-versatility.jpg": ["Catenation is the ability to form bonds with atoms of the same element. Carbon forms stable chains and commonly has valency four. The examples illustrate these ideas; they are not to scale. The chemical notation is schematic; AI kit is not a microscopic observation. Static, not slider-driven.", "श्रृंखलन समान तत्व के परमाणुओं से बंध बनाने की क्षमता है। कार्बन स्थिर शृंखलाएँ बनाता है और उसकी संयोजकता सामान्यतः चार होती है। ये उदाहरण इन विचारों को दर्शाते हैं; ये वास्तविक अनुपात में नहीं हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-02-1-bond-types.jpg": ["Single, double and triple covalent bonds share one, two and three electron pairs respectively. Ethane is saturated; ethene and ethyne contain multiple carbon bonds. Ethyne example: HC≡CH. Lines represent bonds, not actual rods. Structures are symbolic; triple-bond example appears in text, not as a model. Static, not slider-driven.", "एकल, द्वि और त्रि सहसंयोजक बंध क्रमशः एक, दो और तीन इलेक्ट्रॉन जोड़ियाँ साझा करते हैं। एथेन संतृप्त है; एथीन और एथाइन में बहु कार्बन बंध हैं। एथाइन का उदाहरण HC≡CH है। रेखाएँ बंध हैं, वास्तविक छड़ें नहीं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-02-2-chains.jpg": ["Carbon skeletons can be straight, branched or cyclic. Butane and 2-methylpropane both have the formula C₄H₁₀ but different connections. A ring example is cyclobutane, C₄H₈; it is not drawn here. Condensed structures are schematic; a carbon ring is described but not pictured. Static, not slider-driven.", "कार्बन कंकाल सीधे, शाखित या चक्रीय हो सकते हैं। ब्यूटेन और 2-मेथिलप्रोपेन दोनों का सूत्र C₄H₁₀ है पर जुड़ाव अलग हैं। चक्रीय उदाहरण साइक्लोब्यूटेन C₄H₈ है; यह यहाँ नहीं बनाया गया है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-02-3-functional-groups.jpg": ["A functional group is an atom or group that contributes characteristic reactions. Alcohols contain –OH; carboxylic acids contain –COOH. Other functional groups include aldehyde and ketone groups. Formulae are schematic; the pictured kit is illustrative and substances are not identified. Static, not slider-driven.", "क्रियात्मक समूह वह परमाणु या समूह है जो विशिष्ट अभिक्रियाओं में योगदान देता है। ऐल्कोहॉल में –OH तथा कार्बोक्सिलिक अम्लों में –COOH समूह होते हैं। अन्य क्रियात्मक समूहों में ऐल्डिहाइड और कीटोन समूह शामिल हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-02-4-homologous.jpg": ["A homologous series has the same functional group and a regular structural pattern. Successive homologues differ by a –CH₂– unit and 14 u in molecular mass. Methane CH₄, ethane C₂H₆ and propane C₃H₈ are consecutive alkanes. Condensed formulae show an example, not a complete series or measured property. Static, not slider-driven.", "समजातीय श्रेणी में समान क्रियात्मक समूह और नियमित संरचनात्मक क्रम होता है। क्रमागत समजातों में –CH₂– इकाई और अणु द्रव्यमान में 14 u का अंतर होता है। मीथेन CH₄, एथेन C₂H₆ और प्रोपेन C₃H₈ क्रमागत ऐल्केन हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "4-02-5-naming.jpg": ["Choose the longest suitable carbon chain and identify its functional group. The prefix describes carbon count; a suffix can identify a functional group. Ethanol has two carbons and an –OH group; naming rules have further details. Teaching fragments combine to show ethanol CH₃CH₂OH; naming is a simplified example. Static, not slider-driven.", "उपयुक्त सबसे लंबी कार्बन शृंखला चुनें और क्रियात्मक समूह पहचानें। उपसर्ग कार्बन संख्या बताता है; प्रत्यय क्रियात्मक समूह बता सकता है। एथेनॉल में दो कार्बन और –OH समूह हैं; नामकरण के अन्य नियम भी हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],

      "7-01-variation.jpg": ["Reproduction produces new individuals; it is not required for an individual to stay alive. DNA copying and sexual reproduction can produce variation among offspring. Variation may affect survival in changing environments; these seeds have no verified parentage. AI seeds and seedling are illustrative; species, heredity and variation are not verified. Static, not slider-driven.", "जनन से नए जीव बनते हैं; किसी व्यक्ति के जीवित रहने के लिए जनन आवश्यक नहीं है। DNA प्रतिलिपि और लैंगिक जनन संतति में विभिन्नता उत्पन्न कर सकते हैं। बदलते परिवेश में विभिन्नता जीवित रहने को प्रभावित कर सकती है; इन बीजों की वंशावली सत्यापित नहीं है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "7-02-asexual.jpg": ["One organism can produce offspring without fusion of gametes. Yeast may reproduce by budding; binary fission, fragmentation and regeneration differ. The still is a teaching prop and does not show actual cell division. AI cell props are illustrative, not microscopy; fission and regeneration are not shown. Static, not slider-driven.", "एक जीव युग्मकों के संलयन के बिना संतति बना सकता है। यीस्ट मुकुलन से जनन कर सकता है; द्विखंडन, खंडन और पुनर्जनन अलग हैं। स्थिर चित्र शिक्षण मॉडल है और वास्तविक कोशिका विभाजन नहीं दिखाता। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "7-03-vegetative.jpg": ["A new plant may grow from a stem, root or leaf of a parent plant. A potato tuber is a modified stem whose eyes contain buds. Tissue culture grows plant material in sterile nutrient conditions; it is not pictured here. AI plant identity and growth are unverified; tissue culture is not shown. Static, not slider-driven.", "नया पौधा जनक पौधे के तने, जड़ या पत्ती से बन सकता है। आलू का कंद रूपांतरित तना है; उसकी आँखों में कलियाँ होती हैं। ऊतक संवर्धन में पौध ऊतक निर्जीवाणु पोषक दशाओं में बढ़ता है; वह यहाँ नहीं दिखता। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "7-04-flowering-plants.jpg": ["Anthers produce pollen; the stigma receives pollen during pollination. A pollen tube can grow toward an ovule; fertilisation is fusion of gametes. After fertilisation the ovule develops into a seed; the ovary generally becomes a fruit. AI flower anatomy and species are unverified; ovules, pollen tubes and fertilisation are not directly shown. Static, not slider-driven.", "परागकोष पराग बनाते हैं; परागण में वर्तिकाग्र पराग ग्रहण करता है। पराग नलिका बीजांड की ओर बढ़ सकती है; निषेचन युग्मकों का संलयन है। निषेचन के बाद बीजांड बीज बनता है; अंडाशय सामान्यतः फल बनता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "7-05-male-reproductive.jpg": ["Testes produce sperm and testosterone; sperm mature and are transported through ducts. Seminal glands add fluid; the urethra carries semen out of the body. This AI teaching model is not an anatomical reference; connections require verification. AI anatomical model is unverified; ducts, glands and relative positions may be wrong. Do not use as a medical reference. Static, not slider-driven.", "वृषण शुक्राणु और टेस्टोस्टेरोन बनाते हैं; शुक्राणु परिपक्व होते हैं और नलिकाओं से जाते हैं। वीर्य ग्रंथियाँ द्रव मिलाती हैं; मूत्रमार्ग वीर्य को शरीर से बाहर ले जाता है। यह एआई शिक्षण मॉडल शारीरिक संदर्भ नहीं है; जुड़ाव सत्यापित करने होंगे। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "7-06-female-reproductive.jpg": ["Ovaries release eggs and produce hormones; oviducts connect toward the uterus. The uterus is where an embryo may implant; the cervix connects the uterus to the vagina. This AI model is not an anatomical reference; details need expert review. AI anatomy and connections are unverified; the internal shapes are not a medical reference. Static, not slider-driven.", "अंडाशय अंड छोड़ते और हार्मोन बनाते हैं; अंडवाहिनियाँ गर्भाशय की ओर जुड़ती हैं। गर्भाशय में भ्रूण आरोपित हो सकता है; गर्भाशय ग्रीवा इसे योनि से जोड़ती है। यह एआई मॉडल शारीरिक संदर्भ नहीं है; विवरण की विशेषज्ञ समीक्षा आवश्यक है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "7-07-fertilisation.jpg": ["Fertilisation usually occurs in an oviduct; the resulting embryo may implant in the uterus. If pregnancy does not occur, uterine lining is shed during menstruation in a typical cycle. Cycle lengths and ovulation timing vary; fertilisation and an embryo are not pictured. AI model is anatomically unverified and partly cropped; no fertilisation, embryo or cycle is depicted. Static, not slider-driven.", "निषेचन सामान्यतः अंडवाहिनी में होता है; बना भ्रूण गर्भाशय में आरोपित हो सकता है। गर्भावस्था न होने पर सामान्य चक्र में गर्भाशय की परत मासिक धर्म के दौरान झड़ती है। चक्र की अवधि व अंडोत्सर्जन का समय अलग होता है; निषेचन या भ्रूण चित्र में नहीं हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "7-08-reproductive-health.jpg": ["Accurate information, respectful care and hygiene support reproductive health. Contraception methods differ; condoms used correctly reduce pregnancy and many STI risks. A qualified health professional can discuss suitable methods and symptoms. AI consultation is illustrative; no particular contraception method or medical advice is depicted. Static, not slider-driven.", "सही जानकारी, सम्मानजनक देखभाल और स्वच्छता जनन स्वास्थ्य में सहायक हैं। गर्भनिरोध विधियाँ अलग हैं; सही उपयोग पर कंडोम गर्भावस्था और कई संक्रमणों का जोखिम घटाते हैं। योग्य स्वास्थ्यकर्मी उपयुक्त विधियों और लक्षणों पर चर्चा कर सकते हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "7-09-hiv-health.jpg": ["HIV affects the immune system; untreated HIV can progress to AIDS. HIV is not spread by ordinary contact such as hugging, handshakes or sharing food. Testing, prevention and antiretroviral treatment are available through qualified healthcare. AI consultation is illustrative; no person’s HIV status is implied or depicted. Not a diagnostic image. Static, not slider-driven.", "HIV प्रतिरक्षा तंत्र को प्रभावित करता है; अनुपचारित HIV से AIDS हो सकता है। HIV सामान्य संपर्क जैसे गले मिलने, हाथ मिलाने या भोजन साझा करने से नहीं फैलता। जाँच, रोकथाम और एंटीरेट्रोवायरल उपचार योग्य स्वास्थ्य सेवाओं में उपलब्ध हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],

      "8-07-electron-distribution.jpg": ["A neutral argon atom has 18 protons and 18 electrons. For argon, shell distribution is 2, 8, 8 in K, L and M. The general shell maximum is 2n²; these rings are a teaching model, not electron paths. Replacement candidate for rejected draft: synthetic teaching model, not a photograph of an atom; shells not to scale, no slider changes; review pending. Static, not slider-driven.", "उदासीन आर्गन परमाणु में 18 प्रोटॉन और 18 इलेक्ट्रॉन होते हैं। आर्गन का कोश वितरण K, L और M में 2, 8, 8 है। कोश की सामान्य अधिकतम क्षमता 2n² है; ये वलय शिक्षण मॉडल हैं, इलेक्ट्रॉन पथ नहीं। एआई और डिजिटल मॉडल सांकेतिक हैं; चित्र स्लाइडर से नहीं बदलता।"],
      "8-08-atomic-mass-number.jpg": ["Sodium-23 has Z = 11 protons; A = 23 protons plus neutrons. Neutrons = A − Z = 23 − 11 = 12. A neutral sodium atom has 11 electrons; electrons are not shown in this nucleus model. Replacement candidate: synthetic 11-proton/12-neutron nucleus model; position, sizes and spacing are not realistic; no electrons shown; review pending. Static, not slider-driven.", "सोडियम-23 में Z = 11 प्रोटॉन हैं; A = 23 प्रोटॉन और न्यूट्रॉन का योग है। न्यूट्रॉन = A − Z = 23 − 11 = 12। उदासीन सोडियम में 11 इलेक्ट्रॉन हैं; इस नाभिक मॉडल में इलेक्ट्रॉन नहीं दिखाए गए। एआई और डिजिटल मॉडल सांकेतिक हैं; चित्र स्लाइडर से नहीं बदलता।"],
      "1-01-particles.jpg": ["Matter consists of particles that have spaces between them and are in motion. Sugar dissolving in water is consistent with particles mixing; individual molecules cannot be seen here. The sample and outcome in this AI scene are not verified. AI scene is illustrative; sample identity, dissolution and microscopic particles are not verified. Static, not slider-driven.", "पदार्थ कणों से बना है जिनके बीच स्थान है और जो गतिशील हैं। पानी में चीनी का घुलना कणों के मिश्रण से संगत है; व्यक्तिगत अणु यहाँ नहीं दिखते। इस एआई दृश्य का नमूना और परिणाम सत्यापित नहीं हैं। एआई और डिजिटल मॉडल सांकेतिक हैं; चित्र स्लाइडर से नहीं बदलता।"],
      "1-02-diffusion.jpg": ["Diffusion is net spreading of particles from higher to lower concentration due to random motion. Dye spreading in water can illustrate mixing; currents can also move visible colour. Temperature and the medium influence the rate; this still is not a measured experiment. AI illustration only: plume may involve flow as well as diffusion; no rate was measured. Static, not slider-driven.", "यादृच्छिक गति से कणों का अधिक सांद्रता से कम सांद्रता की ओर शुद्ध फैलाव विसरण है। जल में रंग का फैलना मिश्रण समझा सकता है; धाराएँ भी रंग को बहा सकती हैं। तापमान व माध्यम दर को प्रभावित करते हैं; यह स्थिर चित्र मापा गया प्रयोग नहीं है। एआई और डिजिटल मॉडल सांकेतिक हैं; चित्र स्लाइडर से नहीं बदलता।"],
      "1-03-states.jpg": ["A solid keeps its shape; a liquid has definite volume but takes the container shape. A gas spreads to fill its container; water vapour is not directly visible here. Melting and evaporation change physical state, not the identity of water molecules. AI examples are illustrative; gas, changes of state and microscopic arrangement are not shown. Static, not slider-driven.", "ठोस अपना आकार रखता है; द्रव का आयतन निश्चित होता है पर वह पात्र का आकार लेता है। गैस पात्र में फैलकर उसे भरती है; जलवाष्प यहाँ सीधे दिखाई नहीं देती। पिघलने और वाष्पीकरण से भौतिक अवस्था बदलती है, जल अणु की पहचान नहीं। एआई और डिजिटल मॉडल सांकेतिक हैं; चित्र स्लाइडर से नहीं बदलता।"],
      "1-04-evaporation.jpg": ["Evaporation is vaporisation from the surface and can occur below the boiling point. Higher surface area and airflow generally increase evaporation; high humidity can slow it. Evaporation can cool the remaining liquid or surface; the image does not measure cooling. AI still is illustrative; moisture, airflow, evaporation rate and temperature change are not measured. Static, not slider-driven.", "वाष्पीकरण सतह से वाष्प में बदलना है और यह क्वथनांक से नीचे भी हो सकता है। अधिक सतह क्षेत्र और वायु प्रवाह सामान्यतः वाष्पीकरण बढ़ाते हैं; अधिक आर्द्रता इसे धीमा कर सकती है। वाष्पीकरण शेष द्रव या सतह को ठंडा कर सकता है; चित्र शीतलता मापता नहीं। एआई और डिजिटल मॉडल सांकेतिक हैं; चित्र स्लाइडर से नहीं बदलता।"],

      "1-01-observation.jpg": ["Observe carefully using senses and suitable tools; record what is actually seen. A magnifier helps reveal details of a leaf; observation is different from an inference. An observation can lead to a testable question. AI scene is illustrative; the specimen and observations are not verified. Static, not slider-driven.", "इंद्रियों और उपयुक्त साधनों से ध्यानपूर्वक देखें; जो वास्तव में देखा है उसे लिखें। आवर्धक पत्ती का विवरण देखने में मदद करता है; प्रेक्षण अनुमान से अलग है। प्रेक्षण से जाँच योग्य प्रश्न बन सकता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "1-02-question.jpg": ["Example question: how does light affect seedling growth? Compare a chosen light condition while keeping other conditions as similar as possible. Use repeated trials and measurements; this picture alone supplies no results. AI plants are illustrative; light conditions and growth were not measured. Static, not slider-driven.", "उदाहरण प्रश्न: प्रकाश पौध की वृद्धि को कैसे प्रभावित करता है? प्रकाश की चुनी दशा की तुलना करें और अन्य दशाएँ यथासंभव समान रखें। पुनरावृत्ति और माप करें; यह चित्र अपने आप कोई परिणाम नहीं देता। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "1-03-measurement.jpg": ["Describe observations clearly and distinguish a measurement from an opinion. Report a measured quantity with its unit and appropriate precision. Record the measurement, unit and uncertainty where appropriate. AI notebook is illustrative; no actual observation or measurement is recorded. Static, not slider-driven.", "प्रेक्षण स्पष्ट बताएँ और माप को राय से अलग रखें। मापी गई राशि को उसकी इकाई और उचित परिशुद्धता के साथ लिखें। माप, इकाई और जहाँ उचित हो अनिश्चितता दर्ज करें। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "1-04-experiment.jpg": ["A fair comparison changes a selected variable and controls relevant conditions. Measure outcomes, record results and repeat trials where practical. Evidence may support or challenge an explanation; a still image is not experimental data. AI apparatus is illustrative; no variable or result is demonstrated. Static, not slider-driven.", "निष्पक्ष तुलना में चयनित चर बदला जाता है और संबंधित दशाएँ नियंत्रित रखी जाती हैं। परिणाम मापें, दर्ज करें और जहाँ संभव हो परीक्षण दोहराएँ। प्रमाण किसी व्याख्या का समर्थन या विरोध कर सकते हैं; स्थिर चित्र प्रयोग का डेटा नहीं है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "1-05-model.jpg": ["A model represents selected features of an object or system. A globe can represent Earth’s overall shape, but cannot show every detail at true scale. Models are revised when new evidence requires it. AI globe is illustrative; geography, proportions and map markings are not verified. Static, not slider-driven.", "प्रतिरूप वस्तु या तंत्र की कुछ चुनी विशेषताओं को दर्शाता है। ग्लोब पृथ्वी के समग्र आकार को दर्शा सकता है, पर हर विवरण वास्तविक अनुपात में नहीं दिखा सकता। नए प्रमाण की आवश्यकता पर प्रतिरूप बदले जाते हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "1-06-society.jpg": ["Science builds explanations from evidence; technology applies knowledge to practical goals. Mathematics helps measure, model and compare outcomes. A solar panel illustrates a technology; cost, reliability and environmental effects also matter. AI scene is illustrative; generation, efficiency and impacts are not measured. Static, not slider-driven.", "विज्ञान प्रमाण से व्याख्या बनाता है; तकनीक ज्ञान को व्यावहारिक उद्देश्यों में लगाती है। गणित परिणाम मापने, मॉडल बनाने और तुलना करने में मदद करता है। सौर पैनल एक तकनीक का उदाहरण है; लागत, विश्वसनीयता और पर्यावरणीय प्रभाव भी महत्वपूर्ण हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],

      "6-08-feedback.jpg": ["When blood glucose rises, pancreatic beta cells release more insulin. Insulin helps cells take up glucose and supports its storage; blood glucose tends to fall. As glucose falls, insulin secretion generally decreases: negative feedback. AI teaching model is unverified; insulin, glucose and feedback are not directly observed. Not medical advice. Static, not slider-driven.", "रक्त ग्लूकोज़ बढ़ने पर अग्न्याशय की बीटा कोशिकाएँ अधिक इंसुलिन छोड़ती हैं। इंसुलिन कोशिकाओं में ग्लूकोज़ ग्रहण और उसके भंडारण में मदद करता है; रक्त ग्लूकोज़ घटता है। ग्लूकोज़ घटने पर इंसुलिन स्राव सामान्यतः घटता है: यह नकारात्मक प्रतिपुष्टि है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "8-06-bohr-shells.jpg": ["A historical Bohr model assigns an electron to allowed energy levels. Ground-state hydrogen has one proton and one electron at the lowest level, n = 1. A transition changes energy by the difference between levels; this model is not a literal electron path. Replacement for user-rejected 8.6: AI physical model, not a photograph of an atom; outer rings are partly cropped. Not to scale or slider-driven; user, science and teacher review pending. Static, not slider-driven.", "ऐतिहासिक बोहर प्रतिरूप इलेक्ट्रॉन को अनुमत ऊर्जा स्तरों में रखता है। मूल अवस्था के हाइड्रोजन में एक प्रोटॉन और सबसे निचले स्तर n = 1 में एक इलेक्ट्रॉन है। स्तरों के बीच संक्रमण में ऊर्जा का अंतर होता है; यह मॉडल वास्तविक इलेक्ट्रॉन पथ नहीं है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "M-01-resources.jpg": ["Sustainable management considers present needs, future generations and ecological limits. Water, soil and forests support communities and biodiversity; local participation matters. Renewable resources can still be depleted when use exceeds recovery. AI landscape is illustrative; resource condition, recovery and local impacts are not measured. Static, not slider-driven.", "सतत प्रबंधन वर्तमान आवश्यकताओं, भविष्य की पीढ़ियों और पारिस्थितिक सीमाओं पर विचार करता है। जल, मिट्टी और वन समुदायों व जैव विविधता को सहारा देते हैं; स्थानीय भागीदारी महत्वपूर्ण है। उपयोग पुनर्भरण से अधिक हो तो नवीकरणीय संसाधन भी घट सकते हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "M-02-forest.jpg": ["Forests provide habitats and support biodiversity, soil and water cycles. Conservation protects habitats and species while involving local communities and their rights. Restoration should use locally appropriate approaches; one planted species is not a whole forest. AI forest and animal are unverified; species, habitat condition and conservation results are not established. Static, not slider-driven.", "वन आवास देते हैं और जैव विविधता, मिट्टी और जल चक्रों को सहारा देते हैं। संरक्षण स्थानीय समुदायों और उनके अधिकारों को शामिल करते हुए आवास और प्रजातियों की रक्षा करता है। पुनर्स्थापन में स्थानीय उपयुक्त विधियाँ हों; एक वृक्ष प्रजाति पूरा वन नहीं है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "M-03-rainwater.jpg": ["Roof runoff can be collected in covered storage or directed to suitable recharge structures. Watershed management also protects soil, vegetation and local drainage. Treatment and maintenance depend on intended use; collected rainwater is not automatically safe to drink. AI apparatus is illustrative, not a verified working installation; water quality and groundwater recharge are not shown. Static, not slider-driven.", "छत से बहा जल ढके भंडारण में रखा या उपयुक्त भूजल पुनर्भरण संरचना में भेजा जा सकता है। जलग्रहण प्रबंधन मिट्टी, वनस्पति और स्थानीय जल निकासी का भी संरक्षण करता है। उपचार व रखरखाव उपयोग पर निर्भर हैं; संग्रहित वर्षाजल स्वतः पीने योग्य नहीं है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "M-04-resource-reuse.jpg": ["Coal and petroleum are non-renewable on human timescales; burning fossil fuels releases greenhouse gases. Reduce unnecessary use, reuse suitable products and recycle through local systems. Durability, safety and local facilities affect the best choice. AI props are illustrative; coal, petroleum extraction and actual recycling are not depicted. Static, not slider-driven.", "कोयला और पेट्रोलियम मानव समय-मान पर अनवीकरणीय हैं; इनके दहन से ग्रीनहाउस गैसें निकलती हैं। अनावश्यक उपयोग घटाएँ, उपयुक्त वस्तुओं को पुनः उपयोग करें और स्थानीय व्यवस्था से पुनर्चक्रण करें। टिकाऊपन, सुरक्षा और स्थानीय सुविधाएँ सर्वोत्तम विकल्प को प्रभावित करती हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "S-01-energy-sources.jpg": ["Coal, petroleum and gas are exhaustible fossil fuels; sunlight and wind are replenished naturally. Energy choices involve reliability, cost, land, emissions and environmental impacts. Conventional and non-conventional classifications depend on context and time. AI power station is unidentified; its fuel, emissions and electricity output are not measured. Static, not slider-driven.", "कोयला, पेट्रोलियम और गैस क्षयशील जीवाश्म ईंधन हैं; सूर्यप्रकाश और पवन प्राकृतिक रूप से उपलब्ध होते हैं। ऊर्जा विकल्पों में विश्वसनीयता, लागत, भूमि, उत्सर्जन और पर्यावरणीय प्रभाव शामिल हैं। परंपरागत और अपरंपरागत वर्गीकरण संदर्भ और समय पर निर्भर करते हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "S-02-solar.jpg": ["Photovoltaic cells convert sunlight directly into electricity. A solar cooker uses sunlight for heating; it is different from a photovoltaic panel. Output depends on sunlight and system design; energy storage may be needed. AI devices are illustrative; solar cooker design and electrical output are unverified. Static, not slider-driven.", "फोटोवोल्टाइक सेल सूर्यप्रकाश को सीधे विद्युत में बदलते हैं। सौर कुकर सूर्यप्रकाश से ऊष्मा देता है; यह फोटोवोल्टाइक पैनल से भिन्न है। उत्पादन सूर्यप्रकाश और प्रणाली की बनावट पर निर्भर है; ऊर्जा भंडारण आवश्यक हो सकता है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "S-03-wind-water.jpg": ["A wind turbine converts moving air energy into electricity through a generator. Hydropower uses flowing or falling water; tidal systems use tidal water movement. Availability and ecological impacts vary with site and technology. AI scene is illustrative; it does not show a hydroelectric or tidal power plant or measure output. Static, not slider-driven.", "पवन टरबाइन जनित्र द्वारा गतिशील वायु की ऊर्जा को विद्युत में बदलता है। जलविद्युत बहते या गिरते जल की ऊर्जा लेती है; ज्वारीय प्रणालियाँ ज्वारीय जल गति का उपयोग करती हैं। उपलब्धता और पारिस्थितिक प्रभाव स्थान व तकनीक से बदलते हैं। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],
      "S-04-biogas.jpg": ["Biogas forms when suitable organic material decomposes without oxygen; methane is a major component. Biomass renewability depends on sourcing and use; burning it can cause air pollution. Nuclear fission releases energy but requires radiation protection and waste management. AI biogas apparatus is unverified and not a construction guide; nuclear processes are not depicted. Static, not slider-driven.", "उपयुक्त जैव पदार्थ ऑक्सीजन के बिना विघटित होने पर बायोगैस बनती है; मीथेन प्रमुख घटक है। जैवभार की नवीकरणीयता स्रोत व उपयोग पर निर्भर है; दहन से वायु प्रदूषण हो सकता है। नाभिकीय विखंडन ऊर्जा देता है पर विकिरण सुरक्षा और अपशिष्ट प्रबंधन आवश्यक है। एआई चित्र सांकेतिक और असत्यापित है। चित्र स्लाइडर से नहीं बदलता।"],

      "6-01-tropism.jpg": ["A shoot often grows towards light; roots usually grow with gravity. A tropism is directional growth in response to a stimulus. The AI seedling is illustrative; this still does not demonstrate growth over time or prove a light response. Static, not slider-driven.", "प्ररोह प्रायः प्रकाश की ओर और जड़ें सामान्यतः गुरुत्व की ओर बढ़ती हैं। अनुवर्तन उद्दीपन के प्रति दिशात्मक वृद्धि है। एआई चित्र सांकेतिक और असत्यापित है। यह स्लाइडर से नहीं बदलता।"],
      "6-02-plant-hormones.jpg": ["Auxin helps regulate growth; unequal distribution can contribute to shoot bending. Gibberellins and cytokinins promote aspects of growth; abscisic acid can inhibit growth and promote dormancy. AI plant anatomy and root tip are unverified; hormones and their distribution are not visible. Static, not slider-driven.", "ऑक्सिन वृद्धि नियंत्रित करने में मदद करता है; असमान वितरण से प्ररोह मुड़ सकता है। जिबरेलिन और साइटोकाइनिन वृद्धि के पहलुओं को बढ़ाते हैं; एब्सिसिक अम्ल वृद्धि रोक और प्रसुप्ति बढ़ा सकता है। एआई चित्र सांकेतिक और असत्यापित है। यह स्लाइडर से नहीं बदलता।"],
      "6-03-neuron.jpg": ["A neuron receives signals, integrates them and transmits electrical impulses along its axon. At many synapses, chemical messengers carry signals to the next cell. AI neuron is a conceptual teaching model; detailed anatomy and the direction of signalling require review. Static, not slider-driven.", "न्यूरॉन संकेत प्राप्त करता है, उनका समन्वय करता है और अक्षतंतु से विद्युत आवेग भेजता है। कई अन्तर्ग्रथनों पर रासायनिक संदेशवाहक अगली कोशिका तक संकेत पहुँचाते हैं। एआई चित्र सांकेतिक और असत्यापित है। यह स्लाइडर से नहीं बदलता।"],
      "6-04-reflex.jpg": ["A withdrawal reflex is a rapid involuntary response to a harmful stimulus. A simplified spinal arc: receptor → sensory neuron → spinal cord → motor neuron → muscle. Signals also reach the brain; do not touch hot objects. AI illustration is a still; it does not show nerves, the spinal arc or movement. Do not try this. Static, not slider-driven.", "वापसी प्रतिवर्त हानिकारक उद्दीपन के प्रति तेज अनैच्छिक प्रतिक्रिया है। सरल मेरुरज्जु चाप: ग्राही → संवेदी न्यूरॉन → मेरुरज्जु → प्रेरक न्यूरॉन → पेशी। संकेत मस्तिष्क तक भी पहुँचते हैं; गर्म वस्तु न छुएँ। एआई चित्र सांकेतिक और असत्यापित है। यह स्लाइडर से नहीं बदलता।"],
      "6-05-brain.jpg": ["The cerebrum supports thinking, sensory interpretation and voluntary actions. The cerebellum helps coordinate balance; brainstem regions regulate vital automatic functions. AI brain model is conceptual, not a medical reference; anatomy and label placement require review. Static, not slider-driven.", "प्रमस्तिष्क सोच, संवेदना की व्याख्या और ऐच्छिक क्रियाओं में सहायक है। अनुमस्तिष्क संतुलन समन्वय में मदद करता है; मस्तिष्क तने के भाग महत्त्वपूर्ण स्वतः क्रियाओं को नियंत्रित करते हैं। एआई चित्र सांकेतिक और असत्यापित है। यह स्लाइडर से नहीं बदलता।"],
      "6-06-actions.jpg": ["Walking can involve voluntary control and coordinated automatic patterns. Heartbeat is regulated automatically; a reflex is an automatic response to a particular stimulus. AI scene is a still; internal autonomic pathways and heartbeat are not shown. Static, not slider-driven.", "चलने में ऐच्छिक नियंत्रण तथा समन्वित स्वतः प्रतिरूप दोनों शामिल हो सकते हैं। हृदय गति स्वतः नियंत्रित होती है; प्रतिवर्त किसी विशेष उद्दीपन की स्वतः प्रतिक्रिया है। एआई चित्र सांकेतिक और असत्यापित है। यह स्लाइडर से नहीं बदलता।"],
      "6-07-endocrine.jpg": ["Endocrine glands release hormones into blood; target cells respond through suitable receptors. Thyroid hormones regulate aspects of metabolism; pancreatic insulin helps regulate blood glucose. AI anatomical model is unverified, especially organ position and surrounding anatomy. Not medical guidance. Static, not slider-driven.", "अंतःस्रावी ग्रंथियाँ हार्मोन रक्त में छोड़ती हैं; लक्ष्य कोशिकाएँ उपयुक्त ग्राही से प्रतिक्रिया देती हैं। थायरॉइड हार्मोन उपापचय के पहलू नियंत्रित करते हैं; अग्न्याशयी इंसुलिन रक्त ग्लूकोज़ नियंत्रित करता है। एआई चित्र सांकेतिक और असत्यापित है। यह स्लाइडर से नहीं बदलता।"],

      '8-01-element-atoms.jpg':['Conceptual copper lattice; atomic inset is not to scale or a micrograph.','ताँबे की जालक संरचना का काल्पनिक चित्र; परमाणु का बड़ा रूप न वास्तविक अनुपात में है, न सूक्ष्मचित्र है।'],
      '8-02-electron-discovery.jpg':['Conceptual discharge tube, not Thomson’s exact apparatus. This image alone does not demonstrate electron charge or beam deflection.','विसर्जन नली का कल्पनात्मक चित्र, थॉमसन का वास्तविक उपकरण नहीं। यह अकेला चित्र इलेक्ट्रॉन के आवेश या किरण के विक्षेप को प्रदर्शित नहीं करता।'],
      '8-03-proton-neutron.jpg':['Conceptual nucleus; sphere colors are not an assigned proton/neutron key, and particle counts are not verified.','नाभिक का कल्पनात्मक चित्र; गोलों के रंग प्रोटॉन या न्यूट्रॉन की निश्चित पहचान नहीं हैं और कणों की संख्या सत्यापित नहीं है।'],
      '8-04-thomson-model.jpg':['Historical Thomson model, since superseded; not the modern nuclear model.','थॉमसन का ऐतिहासिक मॉडल, जिसे बाद में बदला गया; यह आधुनिक नाभिकीय मॉडल नहीं है।'],
      '8-05-rutherford-scattering.jpg':['Conceptual reconstruction with provisional labels for alpha source, gold foil and detector screen; not the original apparatus. Most alpha particles passed through the foil; a few were deflected, very rarely backwards. The still does not show scattering results.','ऐल्फ़ा स्रोत, सोने की पन्नी और संसूचक पर्दे के असत्यापित लेबल वाला कल्पनात्मक पुनर्निर्माण, मूल उपकरण नहीं। अधिकांश ऐल्फ़ा कण पन्नी से निकल गए; कुछ मुड़े और बहुत कम वापस लौटे। स्थिर चित्र प्रकीर्णन के परिणाम नहीं दिखाता।'],
      '8-09-isotopes-isobars.jpg':['Conceptual static nucleus models: carbon-12 has 6 protons and 6 neutrons; carbon-14 has 6 protons and 8 neutrons; nitrogen-14 has 7 protons and 7 neutrons. Carbon-12 and carbon-14 are isotopes; carbon-14 and nitrogen-14 are isobars. Models are not photographs of atoms and do not follow the sliders.','स्थिर सांकेतिक नाभिक मॉडल: कार्बन-12 में 6 प्रोटॉन और 6 न्यूट्रॉन, कार्बन-14 में 6 प्रोटॉन और 8 न्यूट्रॉन, नाइट्रोजन-14 में 7 प्रोटॉन और 7 न्यूट्रॉन हैं। कार्बन-12 और कार्बन-14 समस्थानिक हैं; कार्बन-14 और नाइट्रोजन-14 समभारिक हैं। मॉडल परमाणुओं की तस्वीरें नहीं हैं और स्लाइडर से नहीं बदलते।'],
      '8-10-methane-valency.jpg':['Conceptual physical teaching model of methane: one carbon and four hydrogen atoms joined by four single covalent bonds. Carbon has valency four and hydrogen one in this example. Static illustration; not a photograph of a molecule and does not follow the sliders.','मीथेन का सांकेतिक शिक्षण मॉडल: एक कार्बन और चार हाइड्रोजन परमाणु चार एकल सहसंयोजक बंधों से जुड़े हैं। इस उदाहरण में कार्बन की संयोजकता चार और हाइड्रोजन की एक है। यह स्थिर चित्र अणु का फ़ोटो नहीं है और स्लाइडर से नहीं बदलता।'],
      '8-10-water-supplement.jpg':['Conceptual physical teaching model of water: one oxygen and two hydrogen atoms joined by two single covalent bonds. Oxygen has valency two and hydrogen one in this example. Static illustration; not a photograph of a molecule and does not follow the sliders.','पानी का सांकेतिक शिक्षण मॉडल: एक ऑक्सीजन और दो हाइड्रोजन परमाणु दो एकल सहसंयोजक बंधों से जुड़े हैं। इस उदाहरण में ऑक्सीजन की संयोजकता दो और हाइड्रोजन की एक है। यह स्थिर चित्र अणु का फ़ोटो नहीं है और स्लाइडर से नहीं बदलता।'],
      '8-11-element-symbols.jpg':['AI-generated illustrative samples: copper Cu, iron Fe and gold Au. The symbols derive from Latin cuprum, ferrum and aurum. First letter uppercase; second letter, when present, lowercase. Sample purity is unverified; the still does not follow the sliders.','कृत्रिम बुद्धिमत्ता से बने सांकेतिक नमूने: ताँबा Cu, लोहा Fe और सोना Au। इनके प्रतीक लैटिन cuprum, ferrum और aurum से हैं। पहला अक्षर बड़ा और दूसरा, यदि हो, छोटा होता है। नमूनों की शुद्धता सत्यापित नहीं है; चित्र स्लाइडर के अनुसार नहीं बदलता।'],
      '8-12-magnesium-chloride-formula.jpg':['Worked ionic formula example: magnesium ion Mg 2 plus has valency 2, chloride ion Cl minus has valency 1. Crossing gives MgCl2, with magnesium to chloride ratio 1 to 2 and zero total charge. An ionic formula unit is a ratio, not a discrete molecule. The crystal image is AI-generated; identity and purity are not verified. The still does not follow the sliders.','आयनिक सूत्र का उदाहरण: मैग्नीशियम आयन Mg 2 धन की संयोजकता 2 और क्लोराइड आयन Cl ऋण की संयोजकता 1 है। बदलने पर MgCl2 मिलता है; मैग्नीशियम और क्लोराइड का अनुपात 1 से 2 और कुल आवेश शून्य है। आयनिक सूत्र इकाई अनुपात दर्शाती है, अलग अणु नहीं। क्रिस्टल चित्र कृत्रिम बुद्धिमत्ता से बना है; पहचान और शुद्धता सत्यापित नहीं हैं। स्थिर चित्र स्लाइडर के अनुसार नहीं बदलता।'],
      '9-01-mass-conservation.jpg':['AI conceptual sealed flask on a balance. In a closed system matter does not escape and total mass remains the same. Illustrative example: 4.00 g calcium carbonate plus 2.92 g hydrochloric acid gives 4.44 g calcium chloride, 0.72 g water and 1.76 g carbon dioxide: 6.92 g before and after. The calculation excludes flask and solvent; it is not a measured balance reading or experiment instructions. Static image does not follow sliders.','तुला पर बंद फ्लास्क का कृत्रिम बुद्धिमत्ता से बना सांकेतिक चित्र। बंद तंत्र में पदार्थ बाहर नहीं निकलता और कुल द्रव्यमान समान रहता है। उदाहरण: 4.00 ग्राम कैल्शियम कार्बोनेट और 2.92 ग्राम हाइड्रोक्लोरिक अम्ल से 4.44 ग्राम कैल्शियम क्लोराइड, 0.72 ग्राम पानी और 1.76 ग्राम कार्बन डाइऑक्साइड: पहले और बाद में 6.92 ग्राम। गणना में फ्लास्क और विलायक शामिल नहीं; यह तुला की माप या प्रयोग निर्देश नहीं है। स्थिर चित्र स्लाइडर के अनुसार नहीं बदलता।'],
      '9-02-constant-proportions.jpg':['AI-generated illustrative water sample and schematic water model. One water molecule has two hydrogen atoms and one oxygen atom. Using rounded atomic masses, hydrogen to oxygen mass ratio is approximately 1 to 8; in 18 grams of water the element contributions are approximately 2 grams hydrogen and 16 grams oxygen. Isotopic composition can cause small deviations. This is not a measurement or photograph of molecules and does not follow sliders.','एआई से निर्मित जल का सांकेतिक नमूना और जल का मॉडल। पानी के एक अणु में दो हाइड्रोजन और एक ऑक्सीजन परमाणु हैं। गोल परमाणु द्रव्यमान से हाइड्रोजन और ऑक्सीजन का द्रव्यमान अनुपात लगभग 1 से 8 है; 18 ग्राम पानी में लगभग 2 ग्राम हाइड्रोजन और 16 ग्राम ऑक्सीजन है। समस्थानिक संरचना से थोड़ा अंतर हो सकता है। यह माप या अणुओं का फोटो नहीं है और स्लाइडर के अनुसार नहीं बदलता।'],
      '9-03-dalton-theory.jpg':['Dalton proposed matter is made of atoms, that compounds combine atoms in simple whole-number ratios, and that chemical reactions rearrange atoms. He also proposed indivisible atoms and identical masses for atoms of an element. Modern correction: atoms contain smaller particles and isotopes of an element can have different masses. AI-generated solid-sphere teaching props are not real atoms; colors do not identify elements. The static illustration does not follow sliders.','डाल्टन ने प्रस्ताव दिया कि पदार्थ परमाणुओं से बना है, यौगिकों में परमाणु सरल पूर्णांक अनुपात में मिलते हैं और रासायनिक अभिक्रियाओं में परमाणु पुनर्व्यवस्थित होते हैं। उन्होंने परमाणुओं को अविभाज्य तथा एक तत्व के परमाणुओं का द्रव्यमान समान भी माना। आधुनिक सुधार: परमाणु में छोटे कण होते हैं और एक तत्व के समस्थानिकों के द्रव्यमान अलग हो सकते हैं। एआई से बने ठोस गोलों के मॉडल वास्तविक परमाणु नहीं हैं; रंग किसी तत्व की पहचान नहीं हैं। स्थिर चित्र स्लाइडर के अनुसार नहीं बदलता।'],
      '9-04-oxygen-element-molecule.jpg':['AI-generated physical teaching prop: oxygen O2 is an elemental molecule of two oxygen atoms joined by a double covalent bond, with two shared electron pairs. The illustration is not a photograph of a molecule or to scale; it does not follow sliders and does not cover all elemental molecules.','एआई से बना शिक्षण मॉडल: ऑक्सीजन O2 एक तत्व का अणु है जिसमें दो ऑक्सीजन परमाणु दोहरे सहसंयोजक बंध से जुड़े हैं और इलेक्ट्रॉनों के दो युग्म साझा होते हैं। यह अणु का फ़ोटो या वास्तविक अनुपात नहीं है; स्लाइडर से नहीं बदलता और सभी तत्व अणुओं को नहीं दिखाता।'],
      '9-05-water-compound-molecule.jpg':['AI-generated physical teaching prop: a water H2O molecule contains one oxygen atom and two hydrogen atoms of different elements, connected by two single covalent bonds. Its bent model has illustrative proportions and is not a molecule photograph; it does not follow sliders or cover every compound.','एआई से बना शिक्षण मॉडल: पानी H2O का अणु अलग तत्वों के एक ऑक्सीजन और दो हाइड्रोजन परमाणुओं से बना है, जिनमें दो एकल सहसंयोजक बंध हैं। मुड़ा मॉडल सांकेतिक अनुपात में है, अणु का फ़ोटो नहीं; यह स्लाइडर से नहीं बदलता और हर यौगिक नहीं दिखाता।'],
      '9-06-ions-ionic-compounds.jpg':['Ions are charged atoms or groups. The schematic NaCl lattice has alternating sodium cations and chloride anions in a 1 to 1 ratio; the compound is neutral overall. The AI-generated salt-like sample has unverified identity and purity. The lattice is a 2D schematic, not an image of ions; static, not slider-driven.','आयन आवेशित परमाणु या समूह हैं। NaCl के सांकेतिक जालक में सोडियम धनायन और क्लोराइड ऋणायन 1 से 1 के अनुपात में बदल-बदलकर हैं; यौगिक समग्र उदासीन है। एआई से बने लवण-जैसे नमूने की पहचान और शुद्धता असत्यापित हैं। जालक 2D चित्र है, आयनों का फ़ोटो नहीं; स्लाइडर से नहीं बदलता।'],
      '9-07-writing-chemical-formulae.jpg':['Worked ionic examples: Mg2+ with Cl minus gives MgCl2; Mg2+ with O2 minus gives MgO after reducing the crossed subscripts. Formulae express the simplest ion ratio, not individual molecules. Sample props are AI-generated, identity unverified; static, not slider-driven.','आयनिक सूत्र उदाहरण: Mg2 धन और Cl ऋण से MgCl2; Mg2 धन और O2 ऋण से संयोजकता बदलकर अनुपात सरल करने पर MgO। सूत्र सरलतम आयन अनुपात बताते हैं, अलग अणु नहीं। एआई नमूनों की पहचान असत्यापित है; चित्र स्लाइडर से नहीं बदलता।'],
      '9-08-molecular-mass-water.jpg':['Water molecule H2O has two hydrogen atoms and one oxygen atom. Using rounded atomic masses, 2 times 1 u plus 16 u equals approximately 18 u. The AI-generated model is not a photograph of a molecule or a measured mass; static, not slider-driven.','जल के H2O अणु में दो हाइड्रोजन और एक ऑक्सीजन परमाणु हैं। गोल परमाणु द्रव्यमान से 2 गुणा 1 u और 16 u का योग लगभग 18 u है। एआई मॉडल अणु का फ़ोटो या मापा द्रव्यमान नहीं; चित्र स्लाइडर से नहीं बदलता।'],
      '9-09-formula-unit-mass-nacl.jpg':['For sodium chloride NaCl, rounded atomic masses 23 u plus 35.5 u give an approximate formula unit mass of 58.5 u. NaCl gives an ionic ratio, not a separate molecule. AI salt-like samples have unverified identity and purity; static, not slider-driven.','सोडियम क्लोराइड NaCl में गोल परमाणु द्रव्यमान 23 u और 35.5 u से सूत्र इकाई द्रव्यमान लगभग 58.5 u है। NaCl आयन अनुपात बताता है, अलग अणु नहीं। एआई नमूनों की पहचान और शुद्धता असत्यापित हैं; चित्र स्लाइडर से नहीं बदलता।'],
      '10-01-sound-vibration-tuning-fork.jpg':['A tuning fork produces sound when its prongs vibrate and disturb surrounding air. Arrows indicate motion schematically. AI-generated equipment is not an actual vibration measurement; static, not slider-driven.','स्वरित्र की भुजाओं के कम्पन से आसपास की हवा में विक्षोभ उत्पन्न होता है और ध्वनि पैदा होती है। तीर गति का सांकेतिक संकेत हैं। एआई उपकरण वास्तविक कम्पन की माप नहीं है; चित्र स्लाइडर से नहीं बदलता।'],
      '10-02-sound-medium-bell-jar.jpg':['Sound needs a material medium and cannot propagate through a vacuum. Airborne sound from a ringing bell becomes fainter as air is removed; supports may still transmit vibration. AI-generated bell jar reconstruction has unverified seal, power and hose connections and does not show an experimental result. Static, not slider-driven.','ध्वनि को पदार्थ माध्यम चाहिए और वह निर्वात में नहीं चलती। हवा निकालने पर घंटी से हवा द्वारा आने वाली ध्वनि मंद होती है; सहारों से कम्पन पहुँच सकता है। एआई घंटी-जार में सील, विद्युत और नली कनेक्शन असत्यापित हैं तथा चित्र प्रयोग परिणाम नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।'],
      '10-03-longitudinal-compressions.jpg':['Longitudinal sound: air particles oscillate parallel to wave travel, forming compressions and rarefactions. AI-generated slinky apparatus and particle sketch are illustrative, not a measured wave; static, not slider-driven.','अनुदैर्घ्य ध्वनि में वायु कण तरंग दिशा के समानांतर दोलन करते हैं, जिससे संपीडन और विरलन बनते हैं। एआई स्प्रिंग और कण चित्र सांकेतिक हैं, मापी तरंग नहीं; चित्र स्लाइडर से नहीं बदलता।'],
      '10-04-sound-pressure-time-graph.jpg':['A qualitative pressure deviation versus time graph at one location has positive compression peaks and negative rarefaction troughs. The curve is not the path of particles or a measured trace; AI-generated oscilloscope wiring is unverified. Static, not slider-driven.','एक स्थान पर दाब परिवर्तन बनाम समय के सांकेतिक आलेख में धनात्मक शिखर संपीडन और ऋणात्मक गर्त विरलन दर्शाते हैं। वक्र कणों का रास्ता या मापा ट्रेस नहीं है; एआई उपकरण के कनेक्शन असत्यापित हैं। चित्र स्लाइडर से नहीं बदलता।'],
      '10-05-wavelength-frequency-period.jpg':['Wavelength is spatial distance between successive matching phases; period is time for one cycle at one point. Frequency f is reciprocal of period T. Separate spatial and time plots are schematic, not measured. AI equipment is illustrative; static, not slider-driven.','तरंगदैर्घ्य समान अवस्था वाले बिंदुओं के बीच दूरी है; आवर्तकाल एक स्थान पर एक चक्र का समय है। आवृत्ति f, आवर्तकाल T का व्युत्क्रम है। स्थिति और समय के आलेख सांकेतिक हैं, माप नहीं। एआई उपकरण सांकेतिक; चित्र स्लाइडर से नहीं बदलता।'],
      '10-06-amplitude-intensity-speed.jpg':['Pressure-amplitude comparison at equal frequency: for plane travelling waves in the same medium, intensity is proportional to squared pressure amplitude; loudness is subjective and speed depends on the medium and conditions. AI equipment and curves are illustrative, not measured. Static, not slider-driven.','समान आवृत्ति पर दाब आयाम की तुलना: समान माध्यम की समतल चलती तरंग में तीव्रता दाब आयाम के वर्ग के समानुपाती है; प्रबलता का अनुभव व्यक्तिपरक है और चाल माध्यम तथा दशाओं पर निर्भर है। एआई उपकरण व वक्र सांकेतिक हैं, माप नहीं। चित्र स्लाइडर से नहीं बदलता।'],
      '10-07-wave-speed-frequency-wavelength.jpg':['Wave speed equals frequency times wavelength. Example 170 hertz times 2 metres equals 340 metres per second. Values are assumed, not measured from the AI-generated speaker and ruler; the graph is schematic. Static, not slider-driven.','तरंग चाल आवृत्ति और तरंगदैर्घ्य का गुणनफल है। उदाहरण: 170 हर्ट्ज़ गुणा 2 मीटर बराबर 340 मीटर प्रति सेकंड। मान कल्पित हैं, एआई स्पीकर और पैमाने से मापे नहीं; आलेख सांकेतिक है। चित्र स्लाइडर से नहीं बदलता।'],
      '10-08-sound-media.jpg':['Example speeds in steel, water and air differ; the order is not universal and depends on wave type, material and conditions. AI material samples are unverified and speeds are not measured; static, not slider-driven.','इस्पात, जल और वायु के उदाहरणों में चाल अलग है; क्रम सार्वत्रिक नहीं, तरंग, पदार्थ और दशाओं पर निर्भर है। एआई नमूने असत्यापित और चाल मापी नहीं; चित्र स्लाइडर से नहीं बदलता।'],
      '10-09-echo-reverberation.jpg':['A distinct echo is a separate reflected sound; reverberation is lingering sound from overlapping reflections. With source and listener together, distance is speed times round-trip time divided by two. AI scene is not a measured echo; static, not slider-driven.','स्पष्ट प्रतिध्वनि अलग सुनाई देने वाली परावर्तित ध्वनि है; अनुरणन अनेक परावर्तनों से ध्वनि का बना रहना है। स्रोत और श्रोता साथ हों तो दूरी चाल और आने-जाने के समय के गुणनफल का आधा है। एआई दृश्य मापी प्रतिध्वनि नहीं; स्लाइडर से नहीं बदलता।'],
      '10-10-pitch-loudness-echolocation.jpg':['Frequency relates to perceived pitch and intensity to loudness; perception varies. Dolphins and bats use echoes, while ultrasound above 20,000 hertz has medical uses. AI scene is not evidence of an observed echo; static, not slider-driven.','आवृत्ति का संबंध तारत्व से और तीव्रता का प्रबलता से है; अनुभव बदलता है। डॉल्फ़िन व चमगादड़ प्रतिध्वनि का प्रयोग करते हैं, 20,000 हर्ट्ज़ से ऊपर की पराश्रव्य ध्वनि चिकित्सा में उपयोगी है। एआई दृश्य देखी गई प्रतिध्वनि का प्रमाण नहीं; स्लाइडर से नहीं बदलता।'],
      '11-01-asexual-budding-yeast.jpg':['Asexual reproduction involves one parent without fusion of gametes. Yeast buds from the parent; offspring are usually genetically similar, with possible mutations. AI microscopy-style model is not a real micrograph; static, not slider-driven.','अलैंगिक जनन में एक जनक और युग्मकों का संलयन नहीं होता। यीस्ट में जनक पर मुकुल बनता है; संतति सामान्यतः आनुवंशिक रूप से समान, पर उत्परिवर्तन संभव है। एआई सूक्ष्मदर्शी-शैली मॉडल वास्तविक सूक्ष्मचित्र नहीं; स्लाइडर से नहीं बदलता।'],
      '11-02-budding-fragmentation-spores.jpg':['Yeast budding, Spirogyra fragmentation and fungal spores are represented by simplified schematic diagrams. AI laboratory equipment and sample are illustrative, not micrographs; static, not slider-driven.','यीस्ट मुकुलन, स्पाइरोगाइरा खंडन और कवक बीजाणु सरल सांकेतिक चित्रों से दिखाए गए हैं। एआई उपकरण और नमूना सांकेतिक हैं, सूक्ष्मचित्र नहीं; स्लाइडर से नहीं बदलता।'],
      '11-03-vegetative-potato.jpg':['Vegetative propagation produces plants from vegetative parts. Potato is a stem tuber with buds in eyes; a bud can produce a shoot. Other methods are not shown. AI scene has unverified species and eye anatomy and does not demonstrate growth; static, not slider-driven.','वानस्पतिक प्रवर्धन में वानस्पतिक भागों से पौधे बनते हैं। आलू तने का कंद है; आँख के मुकुल से प्ररोह बन सकता है। अन्य विधियाँ नहीं दिखीं। एआई दृश्य में प्रजाति और आँख की संरचना असत्यापित है और वृद्धि नहीं दिखती; स्लाइडर से नहीं बदलता।'],
      '11-04-flower-parts.jpg':['A generalised schematic flower identifies stigma, style, ovary, ovules, anther, filament, petal and sepal. The AI flower is not a dissection and its anatomy is unverified; static, not slider-driven.','सांकेतिक पुष्प चित्र वर्तिकाग्र, वर्तिका, अंडाशय, बीजांड, परागकोश, तंतु, दल और बाह्यदल दिखाता है। एआई पुष्प विच्छेदन नहीं और उसकी शारीरिक संरचना असत्यापित है; चित्र स्लाइडर से नहीं बदलता।'],
      '11-05-pollination-fertilisation.jpg':['Pollen moves from anther to stigma; a compatible pollen tube grows toward an ovule. In double fertilisation one male gamete fuses with the egg and another with the central cell. AI bee scene is not observed pollination and diagram is schematic; static, not slider-driven.','पराग परागकोश से वर्तिकाग्र पहुँचता है; उपयुक्त पराग नलिका बीजांड की ओर बढ़ती है। द्वि-निषेचन में एक नर युग्मक अंड से और दूसरा केंद्रीय कोशिका से मिलता है। एआई मधुमक्खी दृश्य देखा गया परागण नहीं, चित्र सांकेतिक है; स्लाइडर से नहीं बदलता।'],
      '11-06-seed-dispersal-germination.jpg':['Seeds can disperse by wind, water, animals or bursting fruits. Germination usually needs water, oxygen and suitable temperature. AI seedling identity is unverified; dispersal and growth sequence are not shown; static, not slider-driven.','बीज हवा, जल, जन्तु या फटते फलों से फैल सकते हैं। अंकुरण में सामान्यतः जल, ऑक्सीजन और उपयुक्त तापमान चाहिए। एआई अंकुर की पहचान असत्यापित है; फैलने व वृद्धि का क्रम नहीं दिखता; स्लाइडर से नहीं बदलता।'],
      '11-07-human-reproductive-systems.jpg':['Testes produce sperm and hormones; ovaries produce egg cells, and the uterus supports development. Fertilisation usually occurs in an oviduct and implantation in the uterine lining. The female organ drawing and male sperm pathway are simplified; complete male anatomy is not shown. AI pelvis is unverified; static, not slider-driven.','वृषण शुक्राणु व हॉर्मोन बनाते हैं; अंडाशय अंड कोशिकाएँ और गर्भाशय विकास को सहारा देता है। निषेचन सामान्यतः अंडवाहिनी में और आरोपण गर्भाशय की परत में होता है। मादा अंग चित्र और नर शुक्राणु पथ सरल हैं; पूरा नर तंत्र नहीं दिखता। एआई श्रोणि असत्यापित; स्लाइडर से नहीं बदलता।'],
      '11-08-cycle-pregnancy.jpg':['Menstrual cycle length and ovulation timing vary; not every cycle has ovulation. Fertilisation may be followed by embryo implantation; the placenta exchanges oxygen, nutrients and wastes. The uterus diagram is schematic, placenta not pictured; AI calendar is not a medical image; static, not slider-driven.','मासिक चक्र और अंडोत्सर्जन का समय बदलता है; हर चक्र में अंडोत्सर्जन नहीं होता। निषेचन के बाद भ्रूण का आरोपण हो सकता है; अपरा ऑक्सीजन, पोषण और अपशिष्ट का आदान-प्रदान करती है। गर्भाशय चित्र सांकेतिक है, अपरा नहीं दिखी; एआई कैलेंडर चिकित्सीय चित्र नहीं; स्लाइडर से नहीं बदलता।'],
      '11-09-reproductive-health.jpg':['Clean external hygiene and access to qualified care support health. Correct, consistent condom use reduces pregnancy and many STI risks; hormonal methods do not protect against STIs. AI packet and tablets are unverified props, not use instructions; static, not slider-driven.','बाहरी स्वच्छता और योग्य देखभाल स्वास्थ्य में सहायक है। कंडोम के सही नियमित उपयोग से गर्भावस्था व कई यौन-संचारित संक्रमणों का जोखिम घटता है; हॉर्मोनल विधियाँ संक्रमण से नहीं बचातीं। एआई पैकेट और गोलियाँ असत्यापित सामग्री हैं, उपयोग निर्देश नहीं; स्लाइडर से नहीं बदलता।'],
      '12-01-why-classify.jpg':['Classification groups organisms by shared traits, helping study biodiversity; modern classification also considers evolutionary evidence. AI specimens are unverified and their arrangement is not evidence of relationships; static, not slider-driven.','वर्गीकरण साझा लक्षणों के आधार पर जीवों के समूह बनाता है; आधुनिक वर्गीकरण विकासात्मक प्रमाण भी देखता है। एआई नमूने असत्यापित हैं और उनकी व्यवस्था संबंधों का प्रमाण नहीं; स्लाइडर से नहीं बदलता।'],
      '12-02-five-kingdoms.jpg':['Whittaker’s historical five-kingdom model uses cell structure, organisation and nutrition. Modern three-domain systems separate Bacteria and Archaea. AI organisms are unverified and do not depict all kingdoms; static, not slider-driven.','व्हिटेकर का ऐतिहासिक पाँच-जगत मॉडल कोशिका संरचना, संगठन व पोषण को देखता है। आधुनिक तीन-डोमेन प्रणाली Bacteria और Archaea अलग करती है। एआई जीव असत्यापित हैं और सभी जगत नहीं दिखते; स्लाइडर से नहीं बदलता।'],
      '12-03-monera-protista-fungi.jpg':['Historical Monera groups prokaryotes; many protists are single-celled eukaryotes. Fungi absorb nutrients and may be decomposers, parasites or mutualists. Cyanobacteria are bacteria, not true algae. AI lab and schematic models are not micrographs; static, not slider-driven.','ऐतिहासिक मोनेरा में प्रोकैरियोट आते हैं; कई प्रोटिस्ट एककोशिकीय यूकैरियोट हैं। कवक अवशोषी होते हैं और अपघटक, परजीवी या सहजीवी हो सकते हैं। सायनोबैक्टीरिया जीवाणु हैं, सच्चे शैवाल नहीं। एआई प्रयोगशाला और चित्र सूक्ष्मचित्र नहीं; स्लाइडर से नहीं बदलता।'],
      '12-04-plant-divisions.jpg':['Traditional teaching groups include bryophytes, ferns, gymnosperms and flowering plants; thallophytes do not match modern evolutionary groups. AI fern and conifer-like scene is unverified and does not picture all groups; static, not slider-driven.','परंपरागत समूहों में ब्रायोफाइट, फर्न, जिम्नोस्पर्म और पुष्पी पादप हैं; थैलोफाइट आधुनिक विकासात्मक समूह से मेल नहीं खाते। एआई फर्न व शंकु दृश्य असत्यापित है और सभी समूह नहीं दिखाता; स्लाइडर से नहीं बदलता।'],
      '12-05-animal-divisions.jpg':['Animals can be compared by symmetry, segmentation, body cavity and notochord. Butterfly and fish are illustrative invertebrate and vertebrate examples; AI models are unverified and do not show all groups or internal anatomy; static, not slider-driven.','प्राणियों की तुलना सममिति, खंडीभवन, देहगुहा और नोटोकॉर्ड से होती है। तितली व मछली अकशेरुकी व कशेरुकी उदाहरण हैं; एआई मॉडल असत्यापित हैं और सभी समूह या आंतरिक अंग नहीं दिखाते; स्लाइडर से नहीं बदलता।'],
      '12-06-binomial-nomenclature.jpg':['A species name has genus and specific epithet; genus begins uppercase, epithet lowercase and both are italicised in print. Mangifera indica is the mango example; the AI fruit is unverified. Static, not slider-driven.','जाति के द्विनाम में वंश का पहला अक्षर बड़ा, जाति-विशेषण का छोटा और मुद्रण में दोनों तिरछे होते हैं। Mangifera indica आम का उदाहरण है; एआई फल असत्यापित है। चित्र स्लाइडर से नहीं बदलता।'],
      '12-07-taxonomic-hierarchy.jpg':['Kingdom, phylum, class, order, family, genus and species are common ranks; domain is broader than kingdom. The example is Panthera tigris. AI animal is an unverified illustration, not an identified specimen; static, not slider-driven.','जगत, संघ, वर्ग, गण, कुल, वंश और जाति सामान्य श्रेणियाँ हैं; डोमेन जगत से व्यापक है। उदाहरण Panthera tigris है। एआई प्राणी असत्यापित चित्र है, पहचाना हुआ नमूना नहीं; स्लाइडर से नहीं बदलता।'],
      '12-08-virus-acellular.jpg':['Viruses are acellular and use host-cell machinery to replicate. Many have DNA or RNA protected by a protein capsid, and some have an envelope. AI generic cutaway is not a real micrograph or a particular virus and does not show replication; static, not slider-driven.','विषाणु अकोशिकीय हैं और प्रतिकृति के लिए परपोषी कोशिका की मशीनरी उपयोग करते हैं। कई में DNA या RNA को प्रोटीन कैप्सिड ढकता है, कुछ में आवरण होता है। एआई मॉडल वास्तविक सूक्ष्मचित्र या विशेष विषाणु नहीं, प्रतिकृति भी नहीं दिखाता; स्लाइडर से नहीं बदलता।'],
      '13-01-earth-interconnected.jpg':['Atmosphere, hydrosphere, geosphere and biosphere exchange matter and energy; water moves among them. AI landscape is illustrative, not a measured or actual location; exchanges are not shown dynamically. Static, not slider-driven.','वायुमंडल, जलमंडल, स्थलमंडल और जैवमंडल पदार्थ व ऊर्जा का आदान-प्रदान करते हैं; जल इनके बीच चलता है। एआई दृश्य सांकेतिक है, मापा या वास्तविक स्थान नहीं; गतिशील आदान-प्रदान नहीं दिखता। चित्र स्लाइडर से नहीं बदलता।'],
      '13-02-solar-radiation-spectrum.jpg':['Solar energy arriving at Earth includes visible light, infrared and ultraviolet. Electromagnetic waves travel at about 3 × 10⁸ m/s in vacuum. The electromagnetic spectrum is schematic and not to scale; AI prism apparatus is unverified and shows no measured dispersion. Static, not slider-driven.','पृथ्वी तक आने वाली सौर ऊर्जा में दृश्य प्रकाश, अवरक्त और पराबैंगनी शामिल हैं। विद्युतचुम्बकीय तरंगों की निर्वात में चाल लगभग 3 × 10⁸ m/s है। वर्णक्रम सांकेतिक है, वास्तविक अनुपात में नहीं; एआई प्रिज़्म उपकरण असत्यापित है और मापा विक्षेपण नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।'],
      "13-03-differential-heating.jpg":["Land surfaces often warm and cool faster than nearby water. Actual temperatures depend on conditions. Albedo is the fraction of incoming sunlight reflected. Clouds, latitude and surface properties influence heating. Land–sea contrasts contribute to monsoons, alongside seasonal circulation and other factors. AI coast is not a real observed location; no temperature or albedo measurement is shown. The monsoon involves more than one driver. Static, not slider-driven.","भूमि की सतह प्रायः निकट के जल से जल्दी गर्म और ठंडी होती है। वास्तविक तापमान परिस्थितियों पर निर्भर है। ऐल्बीडो आने वाले सूर्यप्रकाश का परावर्तित अंश है। बादल, अक्षांश और सतह के गुण तापन को प्रभावित करते हैं। स्थल–समुद्र का अंतर मानसून में योगदान देता है; मौसमी परिसंचरण और अन्य कारक भी महत्त्वपूर्ण हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-04-winds-sea-breeze.jpg":["During a typical daytime sea breeze, land warms faster than the sea; air over land warms and rises. Near the surface, cooler marine air can flow from sea toward land; a return flow occurs aloft. Pressure differences help drive wind. Terrain and large-scale weather also affect its direction. AI coast and tree are illustrative; no actual wind direction or measured pressure is established. A sea breeze is not the same as a monsoon. Static, not slider-driven.","सामान्य दिन की समुद्री समीर में भूमि समुद्र से जल्दी गर्म होती है; भूमि के ऊपर वायु गर्म होकर उठती है। सतह के निकट ठंडी समुद्री वायु भूमि की ओर जा सकती है; ऊपर वापसी प्रवाह होता है। दाब का अंतर पवन चलाने में मदद करता है। भूभाग और व्यापक मौसम भी दिशा प्रभावित करते हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-05-water-cycle.jpg":["Evaporation: liquid water → water vapour; plants add vapour through transpiration. Condensation forms cloud droplets; precipitation can fall as rain or snow. Water can flow as runoff, collect in lakes or infiltrate soil to become groundwater. AI lake scene is illustrative; evaporation, transpiration, rain and infiltration are not visibly demonstrated. The cycle has many pathways. Static, not slider-driven.","वाष्पन: तरल जल → जलवाष्प; पौधे वाष्पोत्सर्जन से जलवाष्प जोड़ते हैं। संघनन से बादल की बूंदें बनती हैं; वर्षण वर्षा या हिम के रूप में गिर सकता है। जल सतही बहाव से चल सकता है, झील में जमा हो सकता है या मिट्टी में रिसकर भूजल बन सकता है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-06-carbon-cycle.jpg":["Photosynthesis takes up atmospheric CO₂ into organic matter; feeding transfers carbon through food webs. Respiration, decay and combustion release CO₂. Oceans and rocks also store and exchange carbon. Burning fossil fuels adds carbon to the atmosphere faster than it can be fully absorbed by natural sinks. AI forest and chimney are unverified; no gas concentration, flux or chemical process is measured. Oceans and rocks are not pictured. Static, not slider-driven.","प्रकाश-संश्लेषण वायुमंडलीय CO₂ को कार्बनिक पदार्थ में लेता है; भोजन से कार्बन खाद्य जाल में स्थानांतरित होता है। श्वसन, अपघटन और दहन CO₂ छोड़ते हैं। महासागर व चट्टानें भी कार्बन संग्रहित करती और उसका आदान-प्रदान करती हैं। जीवाश्म ईंधन का दहन वायुमंडल में कार्बन जोड़ता है; प्राकृतिक अवशोषक सारा अतिरिक्त कार्बन तुरंत नहीं सोखते। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-07-nitrogen-cycle.jpg":["Some bacteria fix atmospheric N₂ into ammonia; in soil it can occur as ammonium (NH₄⁺). Nitrifying microbes convert ammonium through nitrite to nitrate. Plants take up nitrate or ammonium; animals get nitrogen in food. Decomposition returns nitrogen compounds; denitrifying microbes can return N₂ to the air. AI root and nodule-like forms are not verified specimens. Fixation and nitrification are distinct steps; the existing source compresses them and remains unchanged. Static, not slider-driven.","कुछ जीवाणु वायुमंडलीय N₂ से अमोनिया बनाते हैं; मिट्टी में यह अमोनियम (NH₄⁺) के रूप में हो सकता है। नाइट्रीकारी सूक्ष्मजीव अमोनियम को नाइट्राइट से नाइट्रेट में बदलते हैं। पौधे नाइट्रेट या अमोनियम सोखते हैं; जन्तु भोजन से नाइट्रोजन पाते हैं। अपघटन से नाइट्रोजन यौगिक लौटते हैं; विनाइट्रीकारी सूक्ष्मजीव N₂ वायु में वापस पहुँचा सकते हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-08-oxygen-cycle.jpg":["Oxygenic photosynthesis releases O₂; respiration and combustion consume O₂ in many processes. Oxygen is also stored in water, rocks and organisms; chemical oxidation moves it among compounds. Stratospheric ozone absorbs much harmful ultraviolet radiation; ground-level ozone is a pollutant. AI woodland and stream are illustrative, not measurements of oxygen, ozone or photosynthesis. The reservoirs and ozone layer are not all depicted. Static, not slider-driven.","ऑक्सीजनयुक्त प्रकाश-संश्लेषण O₂ छोड़ता है; श्वसन और दहन जैसी कई प्रक्रियाएँ O₂ का उपयोग करती हैं। ऑक्सीजन जल, चट्टानों और जीवों में भी होती है; रासायनिक ऑक्सीकरण इसे यौगिकों में स्थानांतरित करता है। समतापमंडलीय ओज़ोन हानिकारक पराबैंगनी का बहुत भाग सोखती है; धरातलीय ओज़ोन प्रदूषक है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-09-human-impact.jpg":["Burning fossil fuels adds greenhouse gases; deforestation and pollution can disrupt ecosystems and cycles. Cutting emissions, protecting forests and restoring suitable habitats can reduce pressures on Earth systems. Restoration takes time and must fit local ecosystems; effects depend on the action and context. AI landscape and industry are illustrative; the picture does not measure emissions, quantify impacts or prove ecosystem recovery. Static, not slider-driven.","जीवाश्म ईंधन के दहन से हरितगृह गैसें बढ़ती हैं; वनोन्मूलन और प्रदूषण पारितंत्र व चक्रों को प्रभावित कर सकते हैं। उत्सर्जन घटाना, वनों की रक्षा और उपयुक्त आवासों की बहाली पृथ्वी तंत्र पर दबाव कम कर सकती है। बहाली में समय लगता है और वह स्थानीय पारितंत्र के अनुकूल होनी चाहिए; प्रभाव उपाय और परिस्थिति पर निर्भर है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "1-01-chemical-change-evidence.jpg":["A chemical reaction forms new substances. Colour change, gas, precipitate or temperature change can be clues, but none alone proves a reaction. Example: iron in copper sulfate solution can produce copper and iron(II) sulfate. Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)  ·  conceptual equation AI beaker, liquid and object are unverified. This still does not show the before–after change, products or a measured result; it is not an experiment protocol. Static, not slider-driven.","रासायनिक अभिक्रिया में नए पदार्थ बनते हैं। रंग परिवर्तन, गैस, अवक्षेप या ताप परिवर्तन संकेत हो सकते हैं; कोई एक संकेत अकेला प्रमाण नहीं। उदाहरण: कॉपर सल्फेट विलयन में लोहा कॉपर और आयरन(II) सल्फेट बना सकता है। सांकेतिक समीकरण · केवल प्रशिक्षित पर्यवेक्षण में सुरक्षित प्रयोग करें। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "1-02-balancing-equations.jpg":["A balanced equation has the same number of atoms of every element on both sides. 2 H₂ + O₂ → 2 H₂O Change coefficients in front of formulas, not subscripts inside them. States can be added when known. AI ball models have unverified bonding and do not constitute the balanced equation shown; the atom count is a separate symbolic example, not a molecular photograph. Static, not slider-driven.","संतुलित समीकरण के दोनों ओर हर तत्व के परमाणुओं की संख्या बराबर होती है। बाएँ: H = 4, O = 2  ·  दाएँ: H = 4, O = 2 सूत्रों के आगे गुणांक बदलें, सूत्र के भीतर अधोलिखित अंक नहीं। ज्ञात होने पर भौतिक अवस्थाएँ जोड़ें। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "1-03-combination-reaction.jpg":["Two or more reactants combine to form a single product. Some combinations are exothermic, but not all. CaO + H₂O → Ca(OH)₂ + heat This reaction can be vigorous and releases heat. It requires trained supervision and proper protective equipment. AI lab scene does not establish what is in the vessel or dish, does not show a reaction or temperature change, and is not an experiment protocol. Static, not slider-driven.","दो या अधिक अभिकारक मिलकर एक उत्पाद बनाते हैं। कुछ संयोजन ऊष्माक्षेपी होते हैं, पर सभी नहीं। कैल्शियम ऑक्साइड + जल → कैल्शियम हाइड्रॉक्साइड + ऊष्मा यह अभिक्रिया तीव्र और ऊष्माक्षेपी हो सकती है। प्रशिक्षित पर्यवेक्षण और उचित सुरक्षा उपकरण आवश्यक हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "1-04-decomposition.jpg":["One compound breaks down into two or more simpler substances. Energy can be supplied as heat, light or electricity. Thermal example: CaCO₃(s) → CaO(s) + CO₂(g)  [heat] Other examples include photodecomposition and electrolysis; reaction conditions differ. AI samples are unverified and not proof of limestone or quicklime. No heating, gas or reaction is demonstrated; not an experimental protocol. Static, not slider-driven.","एक यौगिक टूटकर दो या अधिक सरल पदार्थ बनाता है। ऊर्जा ऊष्मा, प्रकाश या विद्युत से दी जा सकती है। तापीय उदाहरण: कैल्शियम कार्बोनेट → कैल्शियम ऑक्साइड + कार्बन डाइऑक्साइड अन्य उदाहरणों में प्रकाश से विघटन और विद्युत-अपघटन हैं; परिस्थितियाँ अलग होती हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "1-05-displacement.jpg":["In single displacement a more reactive element can replace a less reactive element from a compound. Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s) In double displacement, ions exchange partners. Some such reactions form a precipitate. AI beaker and metals are unverified; the still does not show before-and-after change, copper coating or ion exchange. Static, not slider-driven.","एकल विस्थापन में अधिक क्रियाशील तत्व किसी यौगिक से कम क्रियाशील तत्व को हटा सकता है। लोहे से कॉपर सल्फेट का विस्थापन · संतुलित उदाहरण द्वि-विस्थापन में आयन साथी बदलते हैं। इनमें से कुछ अभिक्रियाओं में अवक्षेप बनता है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "1-06-precipitation.jpg":["When certain aqueous ions combine, a sparingly soluble solid can form and separate from solution: a precipitate. BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s)↓ + 2 NaCl(aq) Many other causes can make a liquid cloudy. Verify identity with appropriate tests and laboratory supervision. AI cloudy beaker is not an identified BaSO₄ sample and does not prove a precipitate formed; not a lab protocol. Static, not slider-driven.","कुछ जलीय आयन मिलकर कम विलेय ठोस बना सकते हैं जो विलयन से अलग होता है: अवक्षेप। बेरियम सल्फेट का सफेद अवक्षेप · संतुलित उदाहरण अन्य कारणों से भी द्रव मटमैला हो सकता है। उपयुक्त परीक्षण और प्रयोगशाला पर्यवेक्षण से पहचान सत्यापित करें। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "1-07-oxidation-reduction.jpg":["In the oxygen-transfer view, gaining oxygen is oxidation; losing oxygen is reduction. Both can occur in one reaction. CuO + H₂ → Cu + H₂O  [heat] A broader definition uses electron transfer or oxidation-state changes. AI sample identities are unverified; neither hydrogen nor a redox process is shown. No experiment instructions are implied. Static, not slider-driven.","ऑक्सीजन स्थानांतरण के अनुसार ऑक्सीजन ग्रहण ऑक्सीकरण और उसका त्याग अपचयन है। दोनों एक अभिक्रिया में हो सकते हैं। कॉपर ऑक्साइड से ऑक्सीजन हटती है: अपचयन। हाइड्रोजन ऑक्सीजन पाता है: ऑक्सीकरण। विस्तृत परिभाषा इलेक्ट्रॉन स्थानांतरण या ऑक्सीकरण-अवस्था परिवर्तन पर आधारित है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "1-08-exothermic-endothermic.jpg":["Exothermic reactions release heat to surroundings; endothermic reactions absorb heat from surroundings. Example: respiration releases energy; thermal decomposition of calcium carbonate requires heat. A temperature change alone does not identify the reaction; conditions and measurement matter. AI thermometer and beaker are unverified; no numerical reading, temperature change or chemical reaction is shown. Static, not slider-driven.","ऊष्माक्षेपी अभिक्रियाएँ परिवेश को ऊष्मा देती हैं; ऊष्माशोषी अभिक्रियाएँ परिवेश से ऊष्मा लेती हैं। उदाहरण: श्वसन ऊर्जा मुक्त करता है; कैल्शियम कार्बोनेट का तापीय विघटन ऊष्मा माँगता है। केवल ताप परिवर्तन से अभिक्रिया की पहचान नहीं होती; परिस्थितियाँ व मापन महत्त्वपूर्ण हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "1-09-corrosion-rancidity.jpg":["Rusting of iron needs oxygen and water. Coatings and galvanising can slow corrosion by protecting the surface. Oxidation of fats and oils can cause rancidity, changing smell and taste. Airtight or nitrogen-flushed packaging and antioxidants can slow oxidation, not guarantee indefinite freshness. AI nails and unmarked packet are illustrative; materials, packaging gas, rusting rate and food quality are not verified. Static, not slider-driven.","लोहे में जंग लगने के लिए ऑक्सीजन और जल आवश्यक हैं। लेप और गैल्वनीकरण सतह की रक्षा कर संक्षारण धीमा कर सकते हैं। वसा और तेल का ऑक्सीकरण विकृतगंधिता से गंध व स्वाद बदल सकता है। वायुरोधी या नाइट्रोजन-भरी पैकिंग और एंटीऑक्सीडेंट ऑक्सीकरण धीमा कर सकते हैं; अनंत ताजगी की गारंटी नहीं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "2-01-acids-bases-properties.jpg":["In aqueous solution, acids turn blue litmus red; bases turn red litmus blue. Soluble bases are called alkalis. Lemon juice is acidic; soap solutions are commonly basic, but composition matters. Never taste or touch unknown chemicals to identify them. Use appropriate indicators with trained supervision. AI lemon, soap and paper are unverified props. No indicator change is demonstrated; never taste laboratory chemicals. Static, not slider-driven.","जलीय विलयन में अम्ल नीले लिटमस को लाल और क्षार लाल लिटमस को नीला करते हैं। जल में घुलनशील क्षार अल्कली कहलाते हैं। नींबू का रस अम्लीय होता है; साबुन के विलयन सामान्यतः क्षारीय होते हैं, पर संघटन महत्त्वपूर्ण है। अज्ञात रसायनों की पहचान के लिए उन्हें कभी चखें या छुएँ नहीं। प्रशिक्षित पर्यवेक्षण में उचित सूचक उपयोग करें। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "2-02-acid-base-ions.jpg":["In water, hydrochloric acid transfers a proton to water: HCl + H₂O → H₃O⁺(aq) + Cl⁻(aq) Dissolved NaOH supplies Na⁺ and OH⁻. Aqueous H⁺ is shorthand for hydrated protons, not bare free protons. AI liquid is unidentified; ions are described symbolically, not visible in the scene or observed microscopically. Static, not slider-driven.","जल में हाइड्रोक्लोरिक अम्ल जल को प्रोटॉन देता है: हाइड्रोनियम आयन और क्लोराइड आयन बनते हैं। घुला NaOH, Na⁺ और OH⁻ देता है। जलीय H⁺ जलयोजित प्रोटॉन का संक्षेप है, स्वतंत्र नग्न प्रोटॉन नहीं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "2-03-indicators.jpg":["Indicative colours in acidic and basic solutions: Litmus: acid red · base blue Phenolphthalein: acid colourless · base pink Methyl orange: acid red · base yellow AI tube contents and pH are unidentified. The table is schematic; indicator transitions occur over pH ranges. Static, not slider-driven.","अम्लीय और क्षारीय विलयन में सांकेतिक रंग: लिटमस: अम्ल में लाल · क्षार में नीला फिनॉल्फ्थेलीन: अम्ल में रंगहीन · क्षार में गुलाबी मिथाइल ऑरेंज: अम्ल में लाल · क्षार में पीला एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "2-04-neutralisation.jpg":["In this strong acid–strong base example, acid and base react to form a salt and water. HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) Net ionic: H₃O⁺ + OH⁻ → 2H₂O. Heat is released; final pH depends on amounts and acid/base strength. AI liquids and containers are not identified; mixing, heat and resulting pH are not demonstrated. Never mix unknown chemicals. Static, not slider-driven.","इस प्रबल अम्ल–प्रबल क्षार उदाहरण में अम्ल और क्षार से लवण तथा जल बनते हैं। हाइड्रोक्लोरिक अम्ल + सोडियम हाइड्रॉक्साइड → सोडियम क्लोराइड + जल शुद्ध आयनिक: H₃O⁺ + OH⁻ → 2H₂O। ऊष्मा निकलती है; अंतिम pH मात्रा और अम्ल–क्षार की शक्ति पर निर्भर है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "2-05-ph-scale.jpg":["pH indicates hydrogen-ion activity in aqueous solution. At 25°C, pH 7 is neutral; below 7 is acidic, above 7 is basic. A change of one pH unit corresponds to a tenfold change in hydrogen-ion activity. Values outside 0–14 are possible; neutrality depends on temperature. AI tube contents and pH are unidentified; the pH strip is a schematic reference, not a measured reading. Same source scene also supports 2.3. Static, not slider-driven.","pH जलीय विलयन में हाइड्रोजन आयन की सक्रियता बताता है। 25°C पर pH 7 उदासीन, उससे कम अम्लीय और अधिक क्षारीय है। pH की एक इकाई का अंतर हाइड्रोजन आयन सक्रियता में दस गुना अंतर दर्शाता है। 0–14 से बाहर मान भी संभव हैं; उदासीन pH तापमान पर निर्भर करता है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "2-06-ph-everyday.jpg":["Lemon juice is acidic. Soil pH affects nutrient availability, so suitable crops and treatment depend on conditions. Stomach acid aids digestion; antacids can relieve excess acidity. Follow medical advice for persistent symptoms. Enamel can demineralise in acidic conditions; a commonly quoted critical pH is near 5.5 but varies with saliva and conditions. AI props are unverified; the scene does not show soil, stomach or teeth, nor any pH measurement. Same source scene also supports 2.1. Static, not slider-driven.","नींबू का रस अम्लीय है। मिट्टी का pH पोषक उपलब्धता को प्रभावित करता है; उचित फसल व उपचार परिस्थिति पर निर्भर हैं। आमाशय अम्ल पाचन में मदद करता है; एंटासिड अतिरिक्त अम्लता से राहत दे सकता है। लगातार लक्षणों पर चिकित्सकीय सलाह लें। अम्लीय दशा में इनेमल का विखनिजीकरण हो सकता है; प्रचलित सीमा लगभग 5.5 है, पर लार और परिस्थितियों से बदलती है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "2-07-salt-chloralkali.jpg":["Sodium chloride is obtained from seawater or salt deposits. Brine is an aqueous solution of sodium chloride. Industrial electrolysis of brine produces chlorine, hydrogen and sodium hydroxide. 2 NaCl(aq) + 2 H₂O(l) → 2 NaOH(aq) + Cl₂(g) + H₂(g) AI crystal and liquid identities are unverified; no electrolysis, apparatus or product separation is shown. Industrial process, not an experiment protocol. Static, not slider-driven.","सोडियम क्लोराइड समुद्री जल या नमक निक्षेप से मिलता है। नमकीन जल सोडियम क्लोराइड का जलीय विलयन है। नमकीन जल के औद्योगिक विद्युत-अपघटन से क्लोरीन, हाइड्रोजन और सोडियम हाइड्रॉक्साइड बनते हैं। क्लोरीन और हाइड्रोजन खतरनाक गैसें हैं; यह प्रयोग करने का निर्देश नहीं है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "2-08-bleach-baking-washing.jpg":["Baking soda: sodium hydrogen carbonate, NaHCO₃. Baking powder combines it with an edible acid. Washing soda: sodium carbonate decahydrate, Na₂CO₃·10H₂O. It is used in cleaning. Bleaching powder is an industrial disinfectant/bleach; composition is mixed, often simplified as CaOCl₂ in school texts. AI white powders cannot be identified by appearance; dishes are not assigned to the chemicals. Never taste or mix unknown powders. Static, not slider-driven.","खाने का सोडा: सोडियम हाइड्रोजन कार्बोनेट, NaHCO₃। बेकिंग पाउडर में इसे खाद्य अम्ल के साथ मिलाते हैं। धोने का सोडा: सोडियम कार्बोनेट डेकाहाइड्रेट, Na₂CO₃·10H₂O। यह सफाई में उपयोग होता है। विरंजक चूर्ण औद्योगिक कीटाणुनाशक/ब्लीच है; इसका मिश्रित संघटन पुस्तकों में प्रायः CaOCl₂ से सरल किया जाता है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "2-09-plaster-gypsum.jpg":["Gypsum is CaSO₄·2H₂O; plaster of Paris is calcium sulfate hemihydrate, CaSO₄·½H₂O. Heating gypsum under suitable conditions removes water; plaster sets by reacting with water to form gypsum. Water of crystallisation is associated with the crystal structure; ½ means one H₂O per two CaSO₄ units. AI rock, powder and block are unverified. Dehydration and setting are not demonstrated; heating temperature and duration require controlled conditions. Static, not slider-driven.","जिप्सम CaSO₄·2H₂O है; प्लास्टर ऑफ़ पेरिस कैल्शियम सल्फेट हेमीहाइड्रेट CaSO₄·½H₂O है। उपयुक्त दशाओं में जिप्सम गर्म करने से जल निकलता है; प्लास्टर जल से अभिक्रिया करके जिप्सम बनकर जमता है। क्रिस्टलन जल क्रिस्टल संरचना से जुड़ा है; ½ का अर्थ दो CaSO₄ इकाइयों पर एक H₂O है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "3-01-metal-nonmetal-properties.jpg":["Many metals are lustrous, malleable, ductile and conduct heat and electricity. Solid non-metals are often brittle and poor conductors. These are trends, not universal rules: mercury is liquid at room temperature; graphite conducts electricity. Appearance alone does not establish a sample’s identity or conductivity. AI samples are illustrative and unidentified. No measurement establishes malleability or conductivity; charcoal-like material is not verified graphite. Static, not slider-driven.","कई धातुएँ चमकीली, आघातवर्धनीय, तन्य तथा ऊष्मा और विद्युत की सुचालक होती हैं। ठोस अधातु प्रायः भंगुर और कुचालक होते हैं। ये सामान्य प्रवृत्तियाँ हैं, सार्वभौमिक नियम नहीं: पारा कमरे के ताप पर द्रव है; ग्रेफाइट विद्युत चलाता है। केवल दिखावट से नमूने की पहचान या चालकता सिद्ध नहीं होती। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "3-02-metal-chemical-properties.jpg":["Many metals react with oxygen to form oxides; some react with water or dilute acids to produce hydrogen. Reactivity differs widely. Metal oxides are often basic, but aluminium and zinc oxides are amphoteric. 2 Mg + O₂ → 2 MgO  ·  example AI beakers and strip are unidentified. Neither oxygen, acids, hydrogen nor reactions are demonstrated. Some metals react dangerously; not instructions. Static, not slider-driven.","कई धातुएँ ऑक्सीजन से ऑक्साइड बनाती हैं; कुछ जल या तनु अम्ल से हाइड्रोजन देती हैं। क्रियाशीलता बहुत अलग होती है। धातु ऑक्साइड प्रायः क्षारीय होते हैं, पर ऐलुमिनियम और जिंक के ऑक्साइड उभयधर्मी हैं। मैग्नीशियम + ऑक्सीजन → मैग्नीशियम ऑक्साइड · उदाहरण एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "3-03-amphoteric-reactivity.jpg":["Al₂O₃ and ZnO can react with both acids and bases; they are amphoteric oxides. Selected reactivity series, generally decreasing: K > Na > Ca > Mg > Al > Zn > Fe > Cu > Ag > Au A more reactive metal can displace a less reactive one from a suitable salt solution; conditions and surface films matter. AI metal-like props are unidentified and do not demonstrate reactivity or amphoteric behavior. The series is a simplified selection. Static, not slider-driven.","Al₂O₃ और ZnO अम्ल तथा क्षार दोनों से अभिक्रिया कर सकते हैं; ये उभयधर्मी ऑक्साइड हैं। चयनित क्रियाशीलता क्रम, सामान्यतः घटते क्रम में: अधिक क्रियाशील → कम क्रियाशील अधिक क्रियाशील धातु उपयुक्त लवण विलयन से कम क्रियाशील धातु को हटा सकती है; दशाएँ और सतही परतें महत्त्वपूर्ण हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "3-04-ionic-compounds.jpg":["Positive and negative ions in an ionic solid are held in a lattice by electrostatic attraction. Ionic solids generally have high melting points. Ions are fixed in a solid, but mobile when molten or dissolved if soluble. Mobile ions allow electric current; a dry solid crystal generally does not conduct. AI crystals and probe are unidentified; circuit is not verified and no conductivity or lattice measurement is shown. Static, not slider-driven.","आयनिक ठोस में धनायन और ऋणायन स्थिरवैद्युत आकर्षण से जालक में बंधे होते हैं। आयनिक ठोसों के गलनांक सामान्यतः ऊँचे होते हैं। ठोस में आयन बंधे रहते हैं, पर पिघलने या घुलने पर चल सकते हैं। चलायमान आयन विद्युत धारा ले जाते हैं; सूखा ठोस क्रिस्टल सामान्यतः विद्युत नहीं चलाता। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "3-05-metal-extraction.jpg":["Some metals occur native; many occur as compounds in ores. Extraction methods depend on the ore and metal reactivity. Sulphide ores may be roasted in excess air; carbonate ores may be calcined with limited or no air. Metal compounds can then be reduced; highly reactive metals often require electrolytic extraction. AI rock, bar and furnace model are unidentified; no extraction sequence, purity or actual industrial process is demonstrated. Static, not slider-driven.","कुछ धातुएँ स्वतंत्र अवस्था में, कई अयस्कों में यौगिक के रूप में मिलती हैं। निष्कर्षण अयस्क व धातु की क्रियाशीलता पर निर्भर है। सल्फाइड अयस्कों का वायु में भर्जन; कार्बोनेट अयस्कों का सीमित या बिना वायु निस्तापन हो सकता है। इसके बाद धातु यौगिकों का अपचयन हो सकता है; अत्यधिक क्रियाशील धातुओं में प्रायः विद्युत निष्कर्षण आवश्यक है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "3-06-electrolytic-refining.jpg":["In copper refining, an impure copper anode loses copper ions; copper deposits on a pure copper cathode. Anode (+): Cu → Cu²⁺ + 2e⁻ Cathode (−): Cu²⁺ + 2e⁻ → Cu A copper salt solution acts as electrolyte; insoluble impurities can collect as anode mud. AI cell is unconnected and its contents are unidentified; generated background wiring or diagram is not verified. No deposition or measurement is shown. Static, not slider-driven.","ताँबे के परिष्करण में अशुद्ध ताँबा एनोड से आयन देता है; शुद्ध ताँबा कैथोड पर जमता है। एनोड (+): ताँबा ऑक्सीकृत होता है। कैथोड (−): ताँबा आयन अपचयित होते हैं। ताँबे के लवण का विलयन विद्युत-अपघट्य होता है; अविलेय अशुद्धियाँ एनोड पंक बन सकती हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "3-07-corrosion-prevention.jpg":["Iron rusts when oxygen and water are present. Rust is not the only type of metal corrosion. Paint, oil or suitable coatings can isolate the surface; galvanising coats iron with zinc. Protection depends on conditions and whether the coating stays intact; corrosion-resistant alloys are another option. AI nails are unverified and no coating or corrosion test is demonstrated. Scene is reused from Reactions 1.9 with a distinct lesson. Static, not slider-driven.","लोहा ऑक्सीजन और जल की उपस्थिति में जंग खाता है। जंग धातु संक्षारण का केवल एक प्रकार है। पेंट, तेल या उपयुक्त लेप सतह को अलग कर सकते हैं; गैल्वनीकरण में लोहे पर जिंक चढ़ाते हैं। सुरक्षा परिस्थितियों और लेप की अखंडता पर निर्भर करती है; संक्षारण-रोधी मिश्रधातु अन्य विकल्प हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "3-08-alloys.jpg":["An alloy is a mixture of a metal with other element(s), often tailored for properties such as strength or corrosion resistance. Brass contains copper and zinc. Stainless steels are iron-based alloys containing chromium; many also contain nickel. Composition varies by grade; appearance cannot identify an alloy. AI spoon and samples are unverified; appearance is not evidence of stainless steel, brass or a measured alloy composition. Static, not slider-driven.","मिश्रधातु धातु का अन्य तत्वों के साथ मिश्रण है, जिसे मजबूती या संक्षारण-रोध जैसे गुणों के लिए बनाया जा सकता है। पीतल में ताँबा और जिंक हैं। स्टेनलेस स्टील लौह-आधारित मिश्रधातुएँ हैं जिनमें क्रोमियम होता है; कई में निकेल भी होता है। संघटन ग्रेड के अनुसार बदलता है; दिखावट से मिश्रधातु की पहचान नहीं होती। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "5-01-autotrophic-nutrition.jpg":["Life processes such as nutrition, respiration, transport and excretion maintain an organism. Green plants use light energy to build sugars from carbon dioxide and water. Roots absorb water and minerals; leaves are major photosynthetic organs. Not all autotrophs use light. AI-generated plant and roots are conceptual, not a verified botanical specimen; neither uptake nor sugar formation is observed. Static, not slider-driven.","पोषण, श्वसन, परिवहन और उत्सर्जन जैसे जीवन प्रक्रम जीव का रखरखाव करते हैं। हरे पौधे प्रकाश ऊर्जा से कार्बन डाइऑक्साइड और जल द्वारा शर्करा बनाते हैं। जड़ें जल व खनिज सोखती हैं; पत्तियाँ प्रमुख प्रकाश-संश्लेषी अंग हैं। सभी स्वपोषी प्रकाश का प्रयोग नहीं करते। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "5-02-photosynthesis.jpg":["Chlorophyll absorbs light energy; plants use CO₂ and water to build carbohydrates and release oxygen. 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂ Stomata allow gas exchange; guard cells regulate their opening. Photosynthesis consists of multiple reactions. AI-generated leaf is illustrative; chloroplasts and stomata are not resolved here. No exchange or chemical reaction is directly observed. Static, not slider-driven.","क्लोरोफ़िल प्रकाश ऊर्जा सोखता है; पौधे CO₂ और जल से कार्बोहाइड्रेट बनाते तथा ऑक्सीजन छोड़ते हैं। प्रकाश और क्लोरोफ़िल की उपस्थिति में · समग्र सरल समीकरण रंध्र गैसों का आदान-प्रदान करते हैं; द्वार कोशिकाएँ उनका खुलना नियंत्रित करती हैं। यह कई अभिक्रियाओं की प्रक्रिया है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "5-03-heterotrophic-nutrition.jpg":["Heterotrophs obtain organic nutrients from other organisms or organic matter. Animals ingest food. Many decomposer fungi digest organic matter outside their bodies and absorb nutrients. Parasites obtain nutrients from a living host; not all fungi are decomposers. AI-generated nature scene is an illustration, not a photograph or identified fungal specimen. Absorption and decomposition are not directly shown. Static, not slider-driven.","विषमपोषी अन्य जीवों या कार्बनिक पदार्थ से पोषक कार्बनिक पदार्थ पाते हैं। जन्तु भोजन ग्रहण करते हैं। कई अपघटक कवक शरीर के बाहर कार्बनिक पदार्थ पचाकर पोषक पदार्थ सोखते हैं। परजीवी जीवित पोषक से पोषण लेते हैं; सभी कवक अपघटक नहीं होते। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "5-04-human-digestion.jpg":["Food passes from mouth through oesophagus to stomach, small intestine and large intestine. Digestive enzymes break food into smaller molecules. Bile helps emulsify fats; bile is not an enzyme. Most digested nutrients are absorbed in the small intestine; villi increase its surface area. AI-generated anatomical model is schematic and unverified; mouth and villi are not depicted. It is not a medical reference. Static, not slider-driven.","भोजन मुँह से ग्रासनली, आमाशय, छोटी आँत और बड़ी आँत से गुजरता है। पाचक एंजाइम भोजन को छोटे अणुओं में तोड़ते हैं। पित्त वसा का पायसीकरण करता है; पित्त एंजाइम नहीं है। अधिकांश पचे पोषक पदार्थ छोटी आँत में अवशोषित होते हैं; रसांकुर उसका सतह क्षेत्र बढ़ाते हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "5-05-cellular-respiration.jpg":["Aerobic cellular respiration uses oxygen to release energy from glucose; carbon dioxide and water are products. Yeast can ferment sugar to ethanol and carbon dioxide without oxygen; human muscle can form lactate when oxygen supply is limited. ATP yield depends on conditions; fixed values such as 38 are simplified estimates, not universal. AI cutaway is a conceptual model, not a micrograph. Glycolysis and fermentation occur in cytoplasm; yeast fermentation is not pictured. Static, not slider-driven.","वायवीय कोशिकीय श्वसन में ग्लूकोज़ से ऊर्जा मुक्त करने में ऑक्सीजन का उपयोग होता है; CO₂ और जल बनते हैं। यीस्ट ऑक्सीजन के बिना शर्करा से एथेनॉल और CO₂ बना सकता है; सीमित ऑक्सीजन पर मानव मांसपेशी लैक्टेट बना सकती है। ATP की मात्रा दशाओं पर निर्भर है; 38 जैसे निश्चित मान सरल अनुमान हैं, सार्वभौमिक नहीं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "5-06-respiratory-system.jpg":["Air passes through nose, trachea and bronchi into smaller airways and alveoli in the lungs. Across thin alveolar surfaces, oxygen diffuses into blood and carbon dioxide diffuses out. The diaphragm contracts and flattens during inhalation; breathing is not the same as cellular respiration. AI model proportions and airway anatomy are unverified; alveoli and diffusion are not visible. It is not a medical reference. Static, not slider-driven.","वायु नाक, श्वासनली और श्वसनी से छोटे वायुमार्गों और फेफड़ों की वायुकोष्ठिकाओं तक जाती है। पतली वायुकोष्ठिका सतह से ऑक्सीजन रक्त में और कार्बन डाइऑक्साइड बाहर विसरित होती है। श्वास लेने पर मध्यपट संकुचित होकर चपटा होता है; साँस लेना कोशिकीय श्वसन के समान नहीं है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "5-07-plant-transport.jpg":["Xylem transports water and dissolved minerals from roots to shoots; transpiration pull is a major driver. Phloem transports sugars from sources, such as mature leaves, to sinks, such as growing or storage tissues. The direction of phloem transport depends on source and sink; it is not always downward. AI-generated plant and roots are illustrative. Xylem and phloem cannot be distinguished in this image; no actual flow is measured. Static, not slider-driven.","जाइलम जड़ों से प्ररोह तक जल और घुले खनिज पहुँचाता है; वाष्पोत्सर्जन खिंचाव इसका प्रमुख चालक है। फ्लोएम परिपक्व पत्तियों जैसे स्रोतों से बढ़ते या संग्रहण ऊतकों जैसे उपभोग स्थलों तक शर्करा पहुँचाता है। फ्लोएम में परिवहन की दिशा स्रोत और उपभोग स्थल पर निर्भर करती है; यह हमेशा नीचे नहीं होता। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "5-08-circulation.jpg":["The heart pumps blood through pulmonary and systemic circuits: heart → lungs → heart → body → heart. In a normal four-chambered heart, the right side pumps blood to lungs and the left side to the body. Arteries carry blood away from the heart; veins carry it toward the heart. Capillaries allow exchange. AI heart model is unverified; internal chambers, blood flow and lungs are not visible. Vessel color is schematic, not a medical reference. Static, not slider-driven.","हृदय रक्त को फुफ्फुसीय और दैहिक परिपथों में भेजता है: हृदय → फेफड़े → हृदय → शरीर → हृदय। सामान्य चार-कक्षीय हृदय में दायाँ भाग रक्त फेफड़ों को और बायाँ भाग शरीर को भेजता है। धमनियाँ रक्त हृदय से दूर और शिराएँ हृदय की ओर ले जाती हैं। केशिकाएँ पदार्थों का आदान-प्रदान करती हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "5-09-excretion.jpg":["Kidneys filter blood. Nephrons form urine through filtration, selective reabsorption and secretion. Urine flows through ureters to the bladder, then leaves through the urethra. Plants can store some wastes in leaves or bark, release gases, or secrete substances such as resins. AI urinary model is unverified; nephron and plant excretion are not shown. Background bottle labels were obscured. Not medical guidance. Static, not slider-driven.","वृक्क रक्त को छानते हैं। नेफ्रॉन निस्यंदन, चयनात्मक पुनरवशोषण और स्रवण से मूत्र बनाते हैं। मूत्र मूत्रवाहिनियों से मूत्राशय तक आता है, फिर मूत्रमार्ग से बाहर जाता है। पादप कुछ अपशिष्ट पत्तियों या छाल में रख सकते हैं, गैसें छोड़ सकते हैं या रेज़िन जैसे पदार्थ स्रावित कर सकते हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "8-01-inheritance-variation.jpg":["Genes are DNA sequences with biological functions; chromosomes contain long DNA molecules and associated proteins. Offspring inherit genetic material from parents; differences arise through inheritance and other processes. Many traits also depend on environment and multiple genes. AI-generated teaching model and plant are not observations; model base pairing and species are unverified. Static, not slider-driven.","जीन जैविक कार्य वाले DNA अनुक्रम हैं; गुणसूत्रों में लंबे DNA अणु और संबंधित प्रोटीन होते हैं। संतति जनकों से आनुवंशिक पदार्थ पाती है; वंशागति तथा अन्य प्रक्रियाओं से विभिन्नताएँ आती हैं। कई लक्षण पर्यावरण और अनेक जीनों पर भी निर्भर करते हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "8-02-mendel-peas.jpg":["Mendel studied contrasting inherited traits in garden peas using controlled crosses and counted offspring. For a simple height example, pure tall TT crossed with pure dwarf tt gives F₁ Tt. Tall T is dominant to t in this example; individual results can vary. AI pea-like plants are illustrative; their genotype, exact species and breeding histories are not verified. No actual cross is shown. Static, not slider-driven.","मेंडेल ने नियंत्रित संकरण और संतति की गणना से मटर के विपरीत वंशागत लक्षणों का अध्ययन किया। सरल ऊँचाई उदाहरण में शुद्ध लंबा TT और शुद्ध बौना tt संकरण से F₁ Tt मिलते हैं। इस उदाहरण में लंबा T, t पर प्रभावी है; अलग नमूनों में परिणाम बदल सकते हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "8-03-monohybrid-cross.jpg":["During gamete formation, the alleles T and t segregate; each gamete gets one allele. For Tt × Tt the expected genotype ratio is 1 TT : 2 Tt : 1 tt; the phenotype ratio is 3 tall : 1 dwarf. The ratio is a probability prediction, not a guarantee for every four offspring. The Punnett square is a calculated schematic; AI plants are not verified parents or experimental results. Static, not slider-driven.","युग्मक बनते समय T और t एलील पृथक होते हैं; प्रत्येक युग्मक को एक एलील मिलता है। Tt × Tt में अपेक्षित जीनप्ररूप अनुपात 1 TT : 2 Tt : 1 tt और लक्षण अनुपात 3 लंबा : 1 बौना है। यह अनुपात संभाव्यता का अनुमान है; हर चार संतानों में इसकी गारंटी नहीं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "8-04-dihybrid-cross.jpg":["For independently assorting alleles R/r and Y/y, each parent can form RY, Ry, rY or ry gametes. R = round, r = wrinkled; Y = yellow, y = green. Complete dominance predicts 9 : 3 : 3 : 1. Genes far apart on one chromosome can also approximately assort independently; linkage can change the ratio. Seed samples are AI-generated and have no verified genotypes. The Punnett square assumes independent assortment and complete dominance. Static, not slider-driven.","स्वतंत्र अपव्यूहित R/r और Y/y एलीलों में प्रत्येक जनक RY, Ry, rY या ry युग्मक बना सकता है। R = गोल, r = झुर्रीदार; Y = पीला, y = हरा। पूर्ण प्रभाविता में अनुपात 9 : 3 : 3 : 1 अपेक्षित है। एक गुणसूत्र पर दूर स्थित जीन भी लगभग स्वतंत्र हो सकते हैं; सहलग्नता अनुपात बदल सकती है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "8-05-dominance.jpg":["In Mendel’s simple height example TT and Tt are tall; tt is dwarf. Dominant means the allele’s phenotype appears in a heterozygote; it does not mean more common or better. Dominance depends on the trait and context; not every trait follows a simple dominant–recessive pattern. AI plants have unknown genotypes; the scene does not establish dominance or a controlled experiment. Static, not slider-driven.","मेंडेल के सरल ऊँचाई उदाहरण में TT और Tt लंबे हैं; tt बौना है। प्रभावी का अर्थ विषमयुग्मजी में लक्षण का दिखना है; इसका अर्थ अधिक सामान्य या बेहतर होना नहीं है। प्रभाविता लक्षण और संदर्भ पर निर्भर है; हर लक्षण सरल प्रभावी–अप्रभावी क्रम नहीं मानता। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "8-06-sex-chromosomes.jpg":["In a common human XX–XY pattern, eggs carry X and sperm carry X or Y. Fertilisation can produce XX or XY; each outcome is approximately equally likely in this simple model. Biological sex development is more complex, with natural variations; no parent chooses or is to blame. AI chromosome toys are schematic, not actual chromosomes; simple XX–XY model does not describe all sex-development variations. Static, not slider-driven.","मानव में सामान्य XX–XY प्रतिरूप में अंडाणु X और शुक्राणु X या Y ले जाते हैं। निषेचन से XX या XY बन सकता है; इस सरल मॉडल में दोनों की संभावना लगभग समान है। जैविक लिंग विकास अधिक जटिल है और प्राकृतिक विविधताएँ हैं; किसी जनक का चुनाव या दोष नहीं होता। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "8-07-evolution.jpg":["Heritable variation in populations can change across generations through selection, drift and other processes. Natural selection can increase heritable traits associated with reproductive success in a particular environment. Fossils are one source of evidence; speciation can occur when populations diverge and reproductive isolation develops. AI fossil-like objects and specimen identity are unverified. One still cannot demonstrate ancestry or evolutionary change. Static, not slider-driven.","जनसंख्या में वंशागत विभिन्नता पीढ़ियों में चयन, आनुवंशिक विचलन और अन्य प्रक्रियाओं से बदल सकती है। प्राकृतिक चयन किसी वातावरण में प्रजनन सफलता से जुड़े वंशागत लक्षणों को बढ़ा सकता है। जीवाश्म प्रमाण का एक स्रोत हैं; जनसंख्याओं में अंतर और प्रजनन अलगाव से जाति-निर्माण हो सकता है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-01-ecosystem.jpg":["An ecosystem includes organisms and non-living surroundings interacting in a place. Producers, consumers and decomposers interact with water, air, soil and sunlight. Decomposers help return nutrients to the environment; energy and matter follow different paths. AI-generated pond is illustrative; organisms, interactions, nutrient cycling and energy flow are not directly measured. Static, not slider-driven.","किसी स्थान पर जीवों और निर्जीव परिवेश की अंतःक्रियाओं से पारितंत्र बनता है। उत्पादक, उपभोक्ता और अपघटक जल, वायु, मिट्टी और सूर्यप्रकाश के साथ अंतःक्रिया करते हैं। अपघटक पोषक पदार्थ पर्यावरण में लौटाने में मदद करते हैं; ऊर्जा और पदार्थ के मार्ग अलग हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-02-food-chains-webs.jpg":["A food-chain arrow points from food to the organism that eats it: grass → grasshopper → frog → snake. Each feeding position is a trophic level. A food web connects many overlapping chains. Actual diets depend on species, habitat and life stage; decomposers act on material from many levels. AI animals and their diets are unverified; a still cannot prove feeding interactions. The listed chain is a simplified example. Static, not slider-driven.","आहार श्रृंखला में तीर भोजन से उसे खाने वाले की ओर होता है: घास → टिड्डा → मेंढक → साँप। हर पोषण स्थिति एक पोषी स्तर है। आहार जाल कई जुड़ी हुई श्रृंखलाएँ दिखाता है। वास्तविक भोजन प्रजाति, आवास और जीवन अवस्था पर निर्भर है; अपघटक कई स्तरों के पदार्थ पर कार्य करते हैं। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-03-energy-transfer.jpg":["Energy enters many ecosystems as sunlight, captured by producers, then transfers through feeding. The 10 percent rule is a rough teaching approximation, not a fixed efficiency for all systems. Much energy is used in life processes or dissipated as heat; energy is not recycled like nutrients. AI scene does not measure energy or transfer. Bars are an illustrative calculation, not real measured values. Static, not slider-driven.","अनेक पारितंत्रों में सूर्यप्रकाश की ऊर्जा उत्पादक ग्रहण करते हैं और भोजन द्वारा आगे पहुँचती है। 10 प्रतिशत नियम केवल लगभग शिक्षण अनुमान है; सभी तंत्रों में दक्षता स्थिर नहीं होती। बहुत ऊर्जा जीवन प्रक्रमों में उपयोग या ऊष्मा के रूप में बिखरती है; ऊर्जा पोषक तत्वों की तरह पुनःचक्रित नहीं होती। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-04-biomagnification.jpg":["Some persistent chemicals can build up in organisms and increase in concentration across a food chain. A predator may consume many contaminated prey; concentration depends on the chemical and food web. Not all pollutants biomagnify, and this image does not measure contamination. AI-generated fish and assumed feeding relationships are unverified; no pollutant identity or concentration is measured. Static, not slider-driven.","कुछ स्थायी रसायन जीवों में जमा हो सकते हैं और आहार श्रृंखला में उनकी सांद्रता बढ़ सकती है। परभक्षी कई संदूषित शिकार खा सकता है; सांद्रता रसायन और आहार जाल पर निर्भर करती है। सभी प्रदूषकों का जैव आवर्धन नहीं होता; यह चित्र संदूषण का मापन नहीं है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-05-ozone.jpg":["Stratospheric ozone absorbs much UV-B; atmospheric ozone and oxygen block UV-C. Chlorine released from certain ozone-depleting substances catalyses ozone destruction. The Montreal Protocol controls many ozone-depleting substances; recovery takes time. AI Earth image is not satellite data. The ozone layer, UV absorption and depletion are not directly visible or measured. Static, not slider-driven.","समतापमंडलीय ओज़ोन बहुत सा UV-B सोखती है; वायुमंडलीय ओज़ोन और ऑक्सीजन UV-C रोकते हैं। कुछ ओज़ोन-क्षयकारी पदार्थों से निकला क्लोरीन ओज़ोन के विघटन को उत्प्रेरित करता है। मॉन्ट्रियल प्रोटोकॉल अनेक ओज़ोन-क्षयकारी पदार्थों को नियंत्रित करता है; पुनर्प्राप्ति में समय लगता है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-06-waste.jpg":["Biodegradable materials can be broken down by biological processes under suitable conditions. Food scraps can be composted where suitable; conventional plastics and metals often persist and require appropriate disposal. Segregate waste according to local collection rules; not every waste item can be recycled. AI waste props are unverified; color codes and recyclable items depend on local rules. Scene does not prove decomposition. Static, not slider-driven.","जैव-अपघटनीय पदार्थ उपयुक्त दशाओं में जैव प्रक्रियाओं से टूट सकते हैं। उपयुक्त दशाओं में खाद्य अवशेषों की खाद बन सकती है; सामान्य प्लास्टिक व धातु टिक सकते हैं और उचित निपटान चाहिए। स्थानीय संग्रह नियमों के अनुसार अपशिष्ट अलग करें; हर वस्तु पुनर्चक्रित नहीं होती। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"],
      "13-07-reduce-reuse-recycle.jpg":["Reduce avoidable purchases and waste; reuse or repair suitable items when safe. Recycle suitable materials through local collection; compost appropriate organic waste where facilities exist. The best option depends on durability, transport, hygiene and local systems. AI bin scene is illustrative; it does not show actual reuse, repair or recycling. Local rules and hygiene requirements vary. Static, not slider-driven.","अनावश्यक खरीद और अपशिष्ट घटाएँ; सुरक्षित होने पर वस्तुओं का पुनः उपयोग या मरम्मत करें। स्थानीय संग्रह से उपयुक्त सामग्री पुनर्चक्रित करें; सुविधा होने पर उचित जैविक अपशिष्ट की खाद बनाएँ। सर्वोत्तम विकल्प टिकाऊपन, परिवहन, स्वच्छता और स्थानीय व्यवस्था पर निर्भर है। एआई दृश्य सांकेतिक और असत्यापित है; यह प्रक्रिया या माप नहीं दिखाता। चित्र स्लाइडर से नहीं बदलता।"]
    };
    const note=(EV.world.id==='c9_atom' || EV.world.id==='c9_atomic_foundations' || EV.world.id==='c9_sound' || EV.world.id==='c9_reproduction9' || EV.world.id==='c9_diversity' || EV.world.id==='c9_earth' || EV.world.id==='c10_reactions' || EV.world.id==='c10_acids' || EV.world.id==='c10_metals' || EV.world.id==='c10_life' || EV.world.id==='c10_heredity' || EV.world.id==='c10_env' || EV.world.id==='c10_control' || EV.world.id==='c10_sources' || EV.world.id==='c10_sustainable' || EV.world.id==='c9_exploration' || EV.world.id==='c9_matter' || EV.world.id==='c10_repro' || EV.world.id==='c10_carbon' || EV.world.id==='c10_periodic' || EV.world.id==='c10_light' || EV.world.id==='c10_eye' || EV.world.id==='c10_electricity' || EV.world.id==='c10_magnetism' || EV.world.id==='c9_pure' || EV.world.id==='c9_atoms' || EV.world.id==='c9_disease') && atomNotes[file];
    $('aiDraftTitle').textContent=description; img.alt=description+(note ? ' — '+BI(note[0],note[1]) : '');
    const src=EVPLATE_SRC(EV.world.id,file), probe=new Image();
    const failed = () => {
      if(number!==token || !validContext()) return;
      ready=false; hide();
      if(!WORLD.vectorPlate2dAvailable(EV.world)) {
        setPlateView('3d');
        toast('Image unavailable; live 3D restored / चित्र उपलब्ध नहीं, 3D बहाल', 'warn');
      } else {
        toast('Image unavailable; diagram shown. Select 2D to retry / चित्र उपलब्ध नहीं; पुनः प्रयास के लिए 2D दबाएँ', 'warn');
      }
    };
    probe.onload=() => {
      if(number!==token || !validContext()) return;
      img.onload=() => { if(number===token) {ready=true; EVLABEL.render(document.querySelector('.ai-draft-visual'),EVPLATE_KEY(EV.world.id,file)); EVZOOM.refreshDraft();} };
      img.onerror=failed;
      img.src=src;
      if(img.complete && img.naturalWidth) {ready=true; EVLABEL.render(document.querySelector('.ai-draft-visual'),EVPLATE_KEY(EV.world.id,file)); EVZOOM.refreshDraft();}
    };
    probe.onerror=failed;
    probe.src=src;
    const next=$('aiDraftNext'); if(next) { next.hidden=currentFiles.length<2; next.textContent=(imageIndex+1)+' / '+currentFiles.length; }
  }
  /* Map the 708 x 610 CSS rectangle exactly onto the perspective-projected
     four corners of the existing printed page, without a second renderer. */
  function matrix(p) {
    if(!p || p.length!==4 || p.some(q=>!Number.isFinite(q.x)||!Number.isFinite(q.y)||q.z < -1 || q.z > 1)) return null;
    const [p0,p1,p2,p3]=p, dx1=p1.x-p2.x, dx2=p3.x-p2.x, dx3=p0.x-p1.x+p2.x-p3.x;
    const dy1=p1.y-p2.y, dy2=p3.y-p2.y, dy3=p0.y-p1.y+p2.y-p3.y;
    let g=0,h=0; const det=dx1*dy2-dx2*dy1;
    if(Math.abs(dx3)+Math.abs(dy3)>1e-7) { if(Math.abs(det)<1e-7) return null; g=(dx3*dy2-dx2*dy3)/det; h=(dx1*dy3-dx3*dy1)/det; }
    const a=p1.x-p0.x+g*p1.x, b=p3.x-p0.x+h*p3.x;
    const d=p1.y-p0.y+g*p1.y, e=p3.y-p0.y+h*p3.y;
    return 'matrix3d('+[a/708,d/708,0,g/708,b/610,e/610,0,h/610,0,0,1,0,p0.x,p0.y,0,1].join(',')+')';
  }
  function frame() {
    const el=$('aiDraftPlate'); if(!el || !validContext()){
      if(identity) {identity=''; token++; ready=false;}
      hide(); return;
    }
    const sp=EV.world.spreads[WORLD.index], key=EV.world.id+':'+sp.section+':'+EV.lang;
    if(key!==identity) {
      identity=key; imageIndex=0; currentFiles=filesFor(EV.world.id,sp.section);
      $('aiDraftTitle').textContent=BI(sp.title,sp.titleHi);
      $('aiDraftImage').alt=BI(sp.title,sp.titleHi);
      load();
    }
    const transform=matrix(WORLD.draftPlateCorners());
    if(!ready || !transform){el.hidden=true;return;}
    el.style.transform=transform; el.hidden=false;
  }
  function toggle() {
    /* 2D-only: the realistic illustration cannot be switched off. */
    enabled = EV_2D_ONLY ? true : !enabled;
    EV.prefer2d=enabled; identity=''; token++; ready=false; hide();
    if(enabled && !WORLD.plate2d) setPlateView('2d');
    else if(!enabled && WORLD.plate2d && !WORLD.vectorPlate2dAvailable(EV.world)) setPlateView('3d');
    renderPageBar(); frame();
  }
  function install() {
    $('aiDraftOpen').onclick=()=>EVZOOM.open();
    $('aiDraftNext').onclick=next;
    $('aiDraftPlate').addEventListener('keydown',e=>{if(e.key==='Escape'&&EVLABEL.closeOpen(document.querySelector('.ai-draft-visual'))){e.preventDefault();e.stopPropagation();}});
  }
  function next() { if(currentFiles.length>1){imageIndex=(imageIndex+1)%currentFiles.length;load();WORLD.repaintPages();} }
  function zoomSource(allowHidden) {
    const el=$('aiDraftPlate'),img=$('aiDraftImage');
    return el && (allowHidden || !el.hidden) && ready && validContext() && img && img.complete && img.naturalWidth ? {src:img.src,kind:'draft2d',alt:img.alt,key:EVPLATE_KEY(EV.world.id,currentFiles[imageIndex])} : null;
  }
  function pageCounter() { return (imageIndex+1)+' / '+currentFiles.length; }
  function activate() { enabled=true; identity=''; }
  function deactivate() { enabled=false; identity=''; token++; ready=false; hide(); }
  /* the file the 3D page texture must paint: the overlay's current choice for
     the spread on screen, otherwise the section's first plate */
  function fileFor(wid, sec) {
    const f = filesFor(wid, sec); if (!f.length) return '';
    const onScreen = EV.world && EV.world.id === wid && EV.world.spreads[WORLD.index] && EV.world.spreads[WORLD.index].section === sec;
    return onScreen && identity && f[imageIndex] ? f[imageIndex] : f[0];
  }
  function firstThumb(wid) {
    const g = assets[wid]; if (!g) return '';
    const k = Object.keys(g)[0]; const f = k ? filesFor(wid, k) : [];
    return f.length ? EVPLATE_SRC(wid, f[0]) : '';
  }
  return {frame,toggle,install,zoomSource,has,filesFor,fileFor,firstThumb,activate,deactivate,next,pageCounter,get multiple(){return currentFiles.length>1;},get enabled(){return enabled;},isVisible(){const el=$('aiDraftPlate');return !!el && !el.hidden;}};
})();
window.EVRASTER = EVRASTER;

/* Enlarged figure: 2D plates are redrawn at 2x; 3D is a one-shot
   high-resolution render using the shared renderer, not a new live canvas. */
const EVZOOM = (() => {
  let overlay = null, returnFocus = null;
  function close() {
    if (!overlay) return;
    const node = overlay; overlay = null; EVLABEL.destroy(node.querySelector('.evzoom-picture')); node.remove();
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }
  function open() {
    if (overlay || EV.view !== "book" || WORLD.turning) return;
    let snapshot;
    try {
      const precision = document.querySelector("#precision2d:not([hidden]) svg");
      snapshot = precision ? { svg: precision.cloneNode(true), kind: "svg" } : (EVRASTER.zoomSource() || WORLD.zoomSnapshot());
    } catch (e) { snapshot = null; }
    if (!snapshot) { toast(uiTxt("zoom.unavailable")); return; }
    returnFocus = document.activeElement;
    overlay = document.createElement("div"); overlay.className = "evzoom"; overlay.dataset.kind=snapshot.kind;
    overlay.innerHTML = `<section class="evzoom-dialog" role="dialog" aria-modal="true" aria-labelledby="zoomTitle"><div class="evzoom-head"><h2 id="zoomTitle" data-i18n="zoom.title"></h2>${snapshot.kind === "draft2d" && EVRASTER.multiple ? `<button type="button" class="evzoom-next" data-i18n-aria="draft.next" data-i18n-title="draft.next">${esc(EVRASTER.pageCounter())} ›</button>` : ""}<button type="button" class="evzoom-close" data-i18n-aria="ui.close" data-i18n-title="ui.close">×</button></div><div class="evzoom-content"><img class="evzoom-image" alt=""></div>${snapshot.kind === "draft2d" ? `<p class="evzoom-caption" aria-live="polite"></p>` : ""}<p class="evzoom-note" data-i18n="${snapshot.kind === "draft2d" ? "draft.labels" : "zoom.snapshot"}" ${snapshot.kind !== "3d" && snapshot.kind !== "draft2d" ? "hidden" : ""}></p></section>`;
    const image = overlay.querySelector("img");
    if (snapshot.svg) { snapshot.svg.classList.add("evzoom-image"); image.replaceWith(snapshot.svg); }
    else { image.src = snapshot.src; image.alt = snapshot.alt || uiTxt("zoom.title"); if(snapshot.kind === "draft2d"){const host=document.createElement("div");host.className="evzoom-picture";image.replaceWith(host);host.append(image);} }
    const caption=overlay.querySelector(".evzoom-caption"); if(caption) { caption.textContent=snapshot.alt || ""; caption.tabIndex=0; }
    if(snapshot.kind === "draft2d"){const hint=document.createElement("p");hint.className="ev-label-hint";hint.hidden=!EVLABEL.has(snapshot.key);hint.textContent=BI("Select an outlined label for brief information.","संक्षिप्त जानकारी के लिए घिरे लेबल को चुनें।");caption.before(hint);}
    document.body.appendChild(overlay);
    if(snapshot.kind === "draft2d") EVLABEL.render(overlay.querySelector(".evzoom-picture"),snapshot.key);
    EVDICT.apply(overlay, EV.lang);
    overlay.querySelector(".evzoom-close").onclick = close;
    const nextButton=overlay.querySelector(".evzoom-next"); if(nextButton) nextButton.onclick=()=>EVRASTER.next();
    overlay.addEventListener("click", e => { if (e.target === overlay || e.target.classList.contains("evzoom-content")) close(); });
    overlay.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if(!EVLABEL.closeOpen(overlay.querySelector(".evzoom-picture"))) close(); }
      if (e.key === "Tab") {
        const controls=[...overlay.querySelectorAll('button:not([disabled]),.ev-label-pop[tabindex],.evzoom-caption[tabindex]')].filter(el=>el.getClientRects().length);
        const i=controls.indexOf(document.activeElement);
        if (controls.length && ((!e.shiftKey && i===controls.length-1) || (e.shiftKey && i===0) || i<0)) {
          e.preventDefault(); controls[e.shiftKey ? controls.length-1 : 0].focus();
        }
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.stopPropagation();
    });
    overlay.querySelector(".evzoom-close").focus({ preventScroll: true });
  }
  function refreshDraft() {
    if (!overlay || overlay.dataset.kind !== "draft2d") return;
    const data=EVRASTER.zoomSource(true), image=overlay.querySelector(".evzoom-image"), next=overlay.querySelector(".evzoom-next");
    if (!data || !image) return;
    image.src=data.src; image.alt=data.alt;
    EVLABEL.render(overlay.querySelector(".evzoom-picture"),data.key);
    const hint=overlay.querySelector(".ev-label-hint"); if(hint) hint.hidden=!EVLABEL.has(data.key);
    const caption=overlay.querySelector(".evzoom-caption"); if(caption) caption.textContent=data.alt;
    if(next) next.textContent=EVRASTER.pageCounter()+" ›";
  }
  function openImg(src, alt, key) {
    if (overlay) close();
    returnFocus = document.activeElement;
    overlay = document.createElement("div"); overlay.className = "evzoom"; overlay.dataset.kind = "draft2d";
    overlay.innerHTML = `<section class="evzoom-dialog" role="dialog" aria-modal="true" aria-labelledby="zoomTitle"><div class="evzoom-head"><h2 id="zoomTitle">${esc(alt || uiTxt("zoom.title"))}</h2><button type="button" class="evzoom-close" aria-label="Close">×</button></div><div class="evzoom-content"><div class="evzoom-picture"><img class="evzoom-image" alt="${esc(alt || "")}"></div></div><p class="evzoom-caption" tabindex="0">${esc(alt || "")}</p></section>`;
    overlay.querySelector("img").src = src;
    document.body.appendChild(overlay);
    if (key) EVLABEL.render(overlay.querySelector(".evzoom-picture"), key);
    overlay.querySelector(".evzoom-close").onclick = close;
    overlay.addEventListener("click", e => { if (e.target === overlay || e.target.classList.contains("evzoom-content")) close(); });
    overlay.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); } });
    overlay.querySelector(".evzoom-close").focus({ preventScroll: true });
  }
  return { open, openImg, close, refreshDraft };
})();

function renderPageBar() {
  const w = EV.world; if (!w) return;
  const idx = WORLD.index, n = w.spreads.length;
  const dots = w.spreads.map((s, i) => `<button class="pdot ${i === idx ? "on" : ""} ${(EV.progress[pkey(w, s)] || {}).stamped ? "stamped" : ""}" data-jump="${i}" title="${esc(s.title)}">${i + 1}</button>`).join("");
  html($("pageBar"), `
    <button class="btn ghost" id="btnPrev" ${idx === 0 ? "disabled" : ""}>←</button>
    <div class="pdots">${dots}</div>
    <div class="pb-center"><b>${esc(t("spread"))} ${idx + 1} ${esc(t("of"))} ${n}</b><small>${esc(w.spreads[idx].section)} · ${esc(w.spreads[idx].short)}</small></div>
    <button class="btn primary" id="btnNext" ${idx === n - 1 ? "disabled" : ""}>→</button>
    <div class="plate-view" role="group" aria-label="${esc(uiTxt("plate2d.toggle"))}" data-i18n-aria="plate2d.toggle">
      ${EV_2D_ONLY
        ? `<span class="btn ghost tiny active" aria-pressed="true" title="${esc(uiTxt("plate2d.label"))}" data-i18n-title="plate2d.label">2D</span>`
        : `<button class="btn ghost tiny ${WORLD.plate2d ? "active" : ""}" id="plate2d" data-plate="2d" title="${esc(uiTxt("plate2d.label"))}" data-i18n-title="plate2d.label" data-i18n-aria="plate2d.label" ${WORLD.plate2dAvailable(w) ? "" : "disabled"}>2D</button>
      <button class="btn ghost tiny ${WORLD.plate2d ? "" : "active"}" id="plate3d" data-plate="3d" title="${esc(uiTxt("plate3d.label"))}" data-i18n-title="plate3d.label" data-i18n-aria="plate3d.label">3D</button>`}
    </div>
    <div class="pager-tools">
      <button class="btn ghost tiny sv-page-flip-btn" id="btnPageFlipbook" type="button" title="${esc(uiTxt("sv.flipbookSub"))}" data-i18n="sv.flipbookBtn">${esc(uiTxt("sv.flipbookBtn"))}</button>
      ${EVRASTER.has(w,w.spreads[idx]) ? `<button class="btn ghost tiny ${EVRASTER.enabled ? 'active' : ''}" id="btnAIDraft" type="button" aria-pressed="${EVRASTER.enabled}" data-i18n="draft.button" data-i18n-title="draft.toggle" data-i18n-aria="draft.toggle">${esc(uiTxt("draft.button"))}</button>` : ''}
      <button class="btn ghost tiny" id="btnZoomFigure" type="button" title="${esc(uiTxt("zoom.open"))}" data-i18n-title="zoom.open" data-i18n-aria="zoom.open" data-i18n="zoom.short">${esc(uiTxt("zoom.short"))}</button>
      <button class="btn ghost tiny ${EV.panels.left ? "active" : ""}" data-panel="left" title="${esc(t("panelLeft"))}" data-i18n-title="panelLeft" data-i18n-aria="panelLeft">◧ ${esc(BI("Question", "प्रश्न"))}</button>
      <button class="btn ghost tiny ${EV.panels.right ? "active" : ""}" data-panel="right" title="${esc(t("panelRight"))}" data-i18n-title="panelRight" data-i18n-aria="panelRight">◨ ${esc(BI("Controls", "प्रयोग"))}</button>
      <button class="btn ghost tiny ${(!EV.panels.left && !EV.panels.right) ? "active" : ""}" data-panel="both" title="${esc(t("reader"))}" data-i18n-title="reader" data-i18n-aria="reader">⤢ ${esc(BI("Full Book", "पूरी किताब"))}</button>
    </div>`);
  document.querySelectorAll("[data-jump]").forEach(b => b.onclick = () => WORLD.jumpTo(+b.dataset.jump));
  if ($("btnPageFlipbook")) $("btnPageFlipbook").onclick = () => { if (typeof SCIVERSE !== "undefined") SCIVERSE.openFlipbook(w.id, idx, w); };
  if ($("btnAIDraft")) $("btnAIDraft").onclick = EVRASTER.toggle;
  if ($("btnZoomFigure")) $("btnZoomFigure").onclick = EVZOOM.open;
  const bp = $("btnPrev"), bn = $("btnNext");
  if (bp) bp.onclick = () => WORLD.startTurn(-1);
  if (bn) bn.onclick = () => WORLD.startTurn(1);
  renderSectionSelect();
}
function toggleDemo() {
  const w = EV.world, sp = w && w.spreads[WORLD.index]; if (!sp) return;
  if (EV.demo) { WORLD.stopDemo(); return; }
  const ctrls = blockControls(BLOCKS[sp.scene.type] || BLOCKS.showcase, sp);
  const steps = ctrls.slice(0, 2).flatMap(c => [
    { control: c.id, to: c.max, caption: uiTxt("ui.demoPrefix") + c.label + " → " + uiTxt("ui.maximum") },
    { control: c.id, to: c.min, caption: uiTxt("ui.demoPrefix") + c.label + " → " + uiTxt("ui.minimum") }
  ]);
  EVFSM.transition("demo", "START", { demo: EV.demo });
  WORLD.runDemo(steps);                 /* its initial stopDemo() fires onDemoStop */
  EV.demo = true; $("btnDemo").textContent = "■ " + t("demoStop");
  $("demoCaption").hidden = false;
  EVFSM.observe("demo", "running", "app.js:toggleDemo");
}
function demoStopped() { EVFSM.transition("demo", "STOP", {}); EV.demo = false; const b = $("btnDemo"); if (b) b.textContent = "▶ " + t("demo"); const c = $("demoCaption"); if (c) c.hidden = true; }

/* --------------------------------------------------------------- screens */
function renderScreen(v) {
  if (v === "compiler") return screenCompiler();
  if (v === "spec") return screenSpec();
  if (v === "quiz") return screenQuiz();
  if (v === "research") return screenResearch();
  if (v === "teacher") return screenTeacher();
  return "";
}
function screenHead(title, sub, right, titleKey, subKey) {
  return `<div class="screen-head"><div><div class="eyebrow" data-i18n="ui.eyebrow">${esc(uiTxt("ui.eyebrow"))}</div><h1${titleKey ? ` data-i18n="${esc(titleKey)}"` : ""}>${esc(title)}</h1><p${subKey ? ` data-i18n="${esc(subKey)}"` : ""}>${esc(sub)}</p></div>${right || ""}</div>`;
}
function screenCompiler() {
  const sample = `Matter in Our Surroundings\n\nAnything that has mass and occupies space is called matter. Matter is made up of very small particles. These particles are continuously moving and there are spaces between them.\n\nThe particles of matter attract each other. In solids the forces of attraction are strongest and the particles are closely packed. In liquids they are less closely packed and can flow. In gases the particles are far apart and move randomly at high speed.\n\nDiffusion is the spontaneous intermixing of particles of two different types of matter. The rate of diffusion increases with temperature because particles gain kinetic energy.\n\nEvaporation is a surface phenomenon. Particles at the surface with higher kinetic energy escape into the air, taking latent heat from the remaining liquid, which therefore cools.\n\nChange of state occurs when energy is supplied or removed. Latent heat of fusion and latent heat of vaporisation are absorbed without a change in temperature.`;
  return screenHead(t("compiler"), uiTxt("ui.compilerSub"),
    `<button class="btn ghost" id="btnLoadSample" data-i18n="demo">${esc(t("demo"))}</button>`, "compiler", "ui.compilerSub") + `
  <div class="grid2">
    <div class="card"><div class="card-head"><b>01 · <span data-i18n="source">${esc(t("source"))}</span></b><label class="upload"><span data-i18n="upload">${esc(t("upload"))}</span><input type="file" id="fileInput" accept=".txt,.md,.pdf,.json"></label></div>
      <textarea id="compileText" spellcheck="false" placeholder="${esc(t("paste"))}" data-i18n-placeholder="paste"></textarea>
      <div class="row"><input class="inp" id="compileTitle" placeholder="${esc(uiTxt("ui.chapterTitleOptional"))}" data-i18n-placeholder="ui.chapterTitleOptional">
        <select class="inp" id="compileCls"><option value="IX" data-i18n="ui.classIX">${esc(uiTxt("ui.classIX"))}</option><option value="X" data-i18n="ui.classX">${esc(uiTxt("ui.classX"))}</option><option value="XI" data-i18n="ui.classXI">${esc(uiTxt("ui.classXI"))}</option><option value="XII" data-i18n="ui.classXII">${esc(uiTxt("ui.classXII"))}</option></select>
        <select class="inp" id="compileSubject"><option value="chem" data-i18n="ui.chemistry">${esc(uiTxt("ui.chemistry"))}</option><option value="bio" data-i18n="ui.biology">${esc(uiTxt("ui.biology"))}</option><option value="phy" data-i18n="ui.physics">${esc(uiTxt("ui.physics"))}</option></select></div>
      <div class="row"><button class="btn primary" id="btnCompile" data-i18n="compile">⚙ ${esc(t("compile"))}</button><button class="btn ghost" id="btnClearCompile" data-i18n="ui.clear">${esc(uiTxt("ui.clear"))}</button></div>
      <div class="hint" data-i18n="ui.pdfHint">${esc(uiTxt("ui.pdfHint"))}</div>
    </div>
    <div class="card"><div class="card-head"><b>02 · <span data-i18n="validator">${esc(t("validator"))}</span></b><span id="compileCount">—</span></div>
      <div id="compileReport" class="report muted"><span data-i18n="ready">${esc(t("ready"))}</span>.</div>
      <div class="card-head"><b>03 · <span data-i18n="ui.generatedWorldSpec">${esc(uiTxt("ui.generatedWorldSpec"))}</span></b><button class="btn ghost small" id="btnCopySpec" data-i18n="ui.copyJson">${esc(uiTxt("ui.copyJson"))}</button></div>
      <pre id="compileJson" class="json" data-i18n="ui.compiledPlaceholder">${esc(uiTxt("ui.compiledPlaceholder"))}</pre>
      <button class="btn primary wide" id="btnBuildWorld" data-i18n="applySpec" disabled>✦ ${esc(t("applySpec"))}</button>
    </div>
  </div>`;
}
function screenSpec() {
  const w = EV.world || getWorld("c9_matter");
  return screenHead(t("spec"), uiTxt("ui.specSub"),
    `<button class="btn ghost" id="btnPrompt" data-i18n="ui.copyPrompt">${esc(uiTxt("ui.copyPrompt"))}</button>`, "spec", "ui.specSub") + `
  <div class="grid2">
    <div class="card"><div class="card-head"><b>WorldSpec · ${esc(w.title)}</b><span>${w.spreads.length} <span data-i18n="ui.spreadsLabel">${esc(uiTxt("ui.spreadsLabel"))}</span></span></div>
      <textarea id="specText" class="json-edit" spellcheck="false">${esc(JSON.stringify(w, null, 2))}</textarea>
      <div class="row"><button class="btn primary" id="btnValidateSpec" data-i18n="validate">✓ ${esc(t("validate"))}</button>
        <button class="btn ghost" id="btnDownloadSpec" data-i18n="exportSpec">${esc(t("exportSpec"))}</button>
        <label class="upload"><span data-i18n="importSpec">${esc(t("importSpec"))}</span><input type="file" id="specFile" accept=".json"></label></div>
      <div id="specReport" class="report">—</div>
      <button class="btn primary wide" id="btnApplySpec" data-i18n="applySpec">✦ ${esc(t("applySpec"))}</button>
    </div>
    <div class="card"><div class="card-head"><b data-i18n="ui.schemaContract">${esc(uiTxt("ui.schemaContract"))}</b></div>
      <pre class="schema">${esc(`{
  title, titleHi, cls, subject, board, source, color,
  spreads: [{
    id, short, section, title, titleHi,
    concept, conceptHi,
    formula: { label, eq, note },
    vocab: [[term, def], …],
    predict: { q, options[3], a },
    explain, explainHi, fig, tryHint,
    scene: {
      type: particles | diffusion | molecule |
            reaction | ph | cell | osmosis |
            photosynthesis | flow | stack |
            plot | race | showcase,
      params: {},
      challenge: { text, target: {
        key, value, op: gte|lte|near|eq, tol
      }}
    },
    quiz: { q, options, a, why }
  }]
}`)}</pre>
      <div class="card-head"><b data-i18n="ui.productionPrompt">${esc(uiTxt("ui.productionPrompt"))}</b></div>
      <pre class="schema prompt" id="promptBox">${esc(GEMINI_PROMPT)}</pre>
    </div>
  </div>`;
}
function screenQuiz() {
  const w = EV.world || getWorld("c10_carbon"), qs = QZ(w);
  return screenHead(t("chapterQuiz"), `${BI(w.title, w.titleHi)} · ${qs.length} ${uiTxt("ui.questions")} · ${uiTxt("ui.quizSub")}`,
    `<div class="score-badge" id="scoreBadge">—</div>`, "chapterQuiz") + `
  <div class="quiz-list">${qs.map((q, i) => `
    <div class="quiz-item" data-qi="${i}"><div class="qi-num">${String(i + 1).padStart(2, "0")}</div>
      <div><h3>${esc(q.q)}</h3>
      <div class="qi-opts">${q.options.map((o, j) => `<label><input type="radio" name="q${i}" value="${j}"><span>${String.fromCharCode(65 + j)}. ${esc(o)}</span></label>`).join("")}</div>
      <div class="qi-why" id="why${i}" hidden></div></div></div>`).join("")}
  </div>
  <div class="row"><button class="btn primary" id="btnQuizSubmit" data-i18n="quizFinish">${esc(t("quizFinish"))}</button><button class="btn ghost" id="btnQuizRetry" data-i18n="quizRetry">${esc(t("quizRetry"))}</button><span id="quizResult"></span></div>`;
}
function screenResearch() {
  const rows = REPOS.map((r, i) => `<tr class="tier-${r.tier.toLowerCase()}">
    <td><span class="tier ${r.tier.toLowerCase()}">${esc(r.tier)}</span></td>
    <td><a href="${safeHref(r.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${esc(r.repo)}</a><small>${esc(r.lang)} · ${esc(r.lic)} · ★${r.stars}</small></td>
    <td>${esc(r.use)}</td><td class="adopt">${esc(r.adopt)}</td></tr>`).join("");
  return screenHead(t("researchTitle"), t("researchSub") + " — " + uiTxt("ui.researchSubExtra"), "", "researchTitle") + `
  <div class="arch-banner"><div class="eyebrow" data-i18n="ui.archBanner">${esc(uiTxt("ui.archBanner"))}</div>
    <p><b data-i18n="ui.notModuleGallery">${esc(uiTxt("ui.notModuleGallery"))}</b> <span data-i18n="ui.archParagraph">${esc(uiTxt("ui.archParagraph"))}</span></p>
  </div>
  <div class="card table-card"><table class="repo-table"><thead><tr><th data-i18n="ui.tier">${esc(uiTxt("ui.tier"))}</th><th data-i18n="ui.repository">${esc(uiTxt("ui.repository"))}</th><th data-i18n="ui.whatItDoes">${esc(uiTxt("ui.whatItDoes"))}</th><th data-i18n="ui.adopted">${esc(uiTxt("ui.adopted"))}</th></tr></thead><tbody>${rows}</tbody></table></div>
  <div class="card"><div class="card-head"><b data-i18n="ui.designRules">${esc(uiTxt("ui.designRules"))}</b></div><div class="rules">
    <div><b data-i18n="ui.rule1">${esc(uiTxt("ui.rule1"))}</b></div>
    <div><b data-i18n="ui.rule2">${esc(uiTxt("ui.rule2"))}</b></div>
    <div><b data-i18n="ui.rule3">${esc(uiTxt("ui.rule3"))}</b></div>
    <div><b data-i18n="ui.rule4">${esc(uiTxt("ui.rule4"))}</b></div>
    <div><b data-i18n="ui.rule5">${esc(uiTxt("ui.rule5"))}</b></div>
    <div><b data-i18n="ui.rule6">${esc(uiTxt("ui.rule6"))}</b></div>
    <div><b data-i18n="ui.rule7">${esc(uiTxt("ui.rule7"))}</b></div>
  </div></div>`;
}

/* ------------------------------------------------------------ teacher desk */
/* ------------------------------------------------------------ teacher desk */
function deepUrl(worldId, i) {
  return location.href.split("?")[0].split("#")[0] + "?world=" + encodeURIComponent(worldId) + "&spread=" + i;
}
function qrSvg(text) {
  try {
    const q = qrcode(0, "M"); q.addData(text); q.make();
    return q.createSvgTag({ cellSize: 4, margin: 2 }).replace("<svg", '<svg width="112" height="112"');
  } catch (e) { return `<div class="muted" data-i18n="ui.qrUnavailable">${esc(uiTxt("ui.qrUnavailable"))}</div>`; }
}
function screenTeacher() {
  const w = EV.world || getWorld("c9_matter");
  const rows = w.spreads.map((sp, i) => {
    const p = EV.progress[pkey(w, sp)] || {};
    return `<tr><td>${i + 1}</td><td><b>${esc(sp.title)}</b><small>${esc(sp.section)} · ${esc(sp.scene.type)}</small></td>
      <td class="ctr">${p.locked ? "✓" : "—"}</td><td class="ctr">${p.touched || 0}</td>
      <td class="ctr">${p.challengeOK ? "✓" : "—"}</td><td class="ctr">${p.stamped ? "★" : "—"}</td></tr>`;
  }).join("");
  const qrs = w.spreads.map((sp, i) => `<div class="qr-card"><div class="qr-svg">${qrSvg(deepUrl(w.id, i))}</div>
    <b>${i + 1}. ${esc(sp.short)}</b><small data-i18n="scan">${esc(t("scan"))}</small><code>${esc(deepUrl(w.id, i).split("?")[1])}</code></div>`).join("");
  return screenHead(t("teacherTitle"), t("teacherSub"),
    `<button class="btn ghost" id="btnExportCsv" data-i18n="exportCsv">${esc(t("exportCsv"))}</button>`, "teacherTitle", "teacherSub") + `
  <div class="grid2">
    <div class="card"><div class="card-head"><b data-i18n="progressTable">${esc(t("progressTable"))}</b><span>${stampsFor(w)} / ${w.spreads.length} ${esc(t("stamp"))}</span></div>
      <table class="progress-table"><thead><tr><th>#</th><th data-i18n="spread">${esc(t("spread"))}</th><th data-i18n="locked">${esc(t("locked"))}</th><th data-i18n="touched">${esc(t("touched"))}</th><th data-i18n="challengeCol">${esc(t("challengeCol"))}</th><th data-i18n="stampCol">${esc(t("stampCol"))}</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="row"><button class="btn ghost" id="btnExportSpec2" data-i18n="exportSpecBtn">${esc(t("exportSpecBtn"))}</button><span class="hint" data-i18n="ui.progressLocal">${esc(uiTxt("ui.progressLocal"))}</span></div>
    </div>
    <div class="card"><div class="card-head"><b data-i18n="arTitle">${esc(t("arTitle"))}</b></div>
      <p class="hint" style="font-size:11.5px" data-i18n="arBody">${esc(t("arBody"))}</p>
      <div class="arch-mini"><span data-i18n="ui.workflow">${esc(uiTxt("ui.workflow"))}</span></div>
    </div>
  </div>
  <div class="card"><div class="card-head"><b data-i18n="qrTitle">${esc(t("qrTitle"))}</b><span>${w.spreads.length} <span data-i18n="ui.markers">${esc(uiTxt("ui.markers"))}</span></span></div>
    <div class="qr-grid">${qrs}</div><p class="hint" data-i18n="qrNote">${esc(t("qrNote"))}</p></div>`;
}

function bindTeacher() {
  const w = EV.world || getWorld("c9_matter");
  const csv = ["spread,section,title,scene,prediction_locked,parts_touched,challenge_met,stamped"].concat(
    w.spreads.map((sp, i) => {
      const p = EV.progress[pkey(w, sp)] || {};
      return [i + 1, sp.section, '"' + String(sp.title).replace(/"/g, '""') + '"', sp.scene.type,
        p.locked ? 1 : 0, p.touched || 0, p.challengeOK ? 1 : 0, p.stamped ? 1 : 0].join(",");
    })).join("\n");
  $("btnExportCsv").onclick = () => {
    const b = new Blob([csv], { type: "text/csv" }), u = URL.createObjectURL(b);
    const a = document.createElement("a"); a.href = u; a.download = "eduverse-progress.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1500); toast(t("saved"));
  };
  $("btnExportSpec2").onclick = () => download("world-spec.json", JSON.stringify(w, null, 2));
}

function bindCompiler() {
  const ta = $("compileText");
  ta.addEventListener("input", () => EVFSM.transition("compiler", "INPUT", {}));
  $("btnLoadSample").onclick = () => { EVFSM.transition("compiler", "INPUT", {});
    const s = `Carbon and its Compounds — NCERT Science Class X, Chapter 4\n\nCarbon has atomic number 6 and electronic configuration 2,4. It cannot gain or lose four electrons, so it shares four valence electrons to form covalent bonds. Covalent compounds have low melting and boiling points and are poor conductors of electricity.\n\nTetravalency and catenation give rise to millions of carbon compounds. Saturated hydrocarbons contain only single bonds, while unsaturated hydrocarbons contain double or triple bonds. Chains may be straight, branched or arranged in rings, giving structural isomers.\n\nA homologous series has the same functional group and successive members differ by a CH2 unit of 14 u. Functional groups such as alcohol, aldehyde, ketone and carboxylic acid decide the chemical properties.\n\nCarbon compounds burn in oxygen to give carbon dioxide, water, heat and light. Ethanol is oxidised to ethanoic acid by alkaline potassium permanganate. Unsaturated hydrocarbons add hydrogen in the presence of nickel catalyst, while methane and chlorine undergo substitution in sunlight.\n\nEthanoic acid reacts with sodium carbonate to release carbon dioxide. It reacts with ethanol in the presence of an acid catalyst to form a sweet smelling ester. Soap molecules form micelles with hydrophobic tails and hydrophilic heads, but hard water forms scum while detergents remain effective.`;
    ta.value = s; toastKey("toast.sample", "Sample chapter loaded");
  };
  $("btnClearCompile").onclick = () => { EVFSM.transition("compiler", "CLEAR", {}); ta.value = ""; html($("compileReport"), `<span class="muted" data-i18n="ready">${esc(t("ready"))}</span>.`); html($("compileJson"), `<span data-i18n="ui.compiledPlaceholder">${esc(uiTxt("ui.compiledPlaceholder"))}</span>`); $("btnBuildWorld").disabled = true; };
  $("fileInput").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    if (/\.pdf$/i.test(f.name)) { const buf = await f.arrayBuffer(); ta.value = extractPdfText(buf); toastKey("toast.pdf", "PDF text extracted locally (best effort)"); }
    else if (/\.json$/i.test(f.name)) { try { EVFSM.transition("compiler", "IMPORT", {}); EV.compiled = normalizeWorld(JSON.parse(await f.text())); showCompiled(EV.compiled); toastKey("toast.worldspec", "WorldSpec imported"); } catch (err) { toast(uiTxt("toast.invalidJson") + err.message, "warn"); } }
    else { ta.value = await f.text(); toast(f.name + " " + uiTxt("toast.fileLoaded")); }
  };
  $("btnCompile").onclick = () => {
    const text = ta.value.trim();
    if (text.length < 80) { toastKey("toast.chars", "Paste at least 80 characters of chapter text", "warn"); return; }
    EVFSM.transition("compiler", "COMPILE", { length: text.length });
    EV.compiled = compileChapter(text, {
      title: $("compileTitle").value.trim() || undefined, cls: $("compileCls").value,
      subject: $("compileSubject").value, source: "Uploaded textbook chapter"
    });
    showCompiled(EV.compiled);
  };
  $("btnCopySpec").onclick = () => { if (EV.compiled) { navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(EV.compiled, null, 2)); toast(t("copied")); } };
  $("btnBuildWorld").onclick = () => {
    if (!EV.compiled) return;
    EVFSM.transition("compiler", "BUILD", { compiled: !!EV.compiled });
    EV.world = EV.compiled;
    EV.extraChapters = EV.extraChapters.filter(c => c.id !== EV.world.id);
    EV.extraChapters.push({ id: EV.world.id, title: EV.world.title, color: EV.world.color, source: "compiled", world: EV.world });
    WORLD.setWorld(EV.world, 0); renderTop(); renderChapterList(); setView("book"); flash();
    toast(t("compiled") + " · " + EV.world.spreads.length + " " + t("spreads"), "ok");
  };
  if (EV.compiled) showCompiled(EV.compiled);
}
function showCompiled(w) {
  const rep = validateWorld(w);
  const rows = rep.map(r => `<div class="rep-row ${r.status}"><b>${r.status === "pass" ? "✓" : "!"}</b><span>${esc(r.name)}</span><small>${esc(r.msg)}</small></div>`).join("");
  html($("compileReport"), rows);
  $("compileCount").textContent = `${w.stats.characters} ${t("chars")} · ${w.spreads.length} ${t("spreads")} · ${esc(w.stats.detectedChapter || "generic")}`;
  /* `<pre data-i18n="ui.compiledPlaceholder">` is translated on first render.
     Once real WorldSpec JSON exists, drop that key: EVDICT.apply() would
     otherwise overwrite the entire generated spec with the placeholder. */
  const jsonNode = $("compileJson");
  if (jsonNode) {
    jsonNode.removeAttribute("data-i18n");
    jsonNode.textContent = JSON.stringify(w, null, 2);
  }
  $("btnBuildWorld").disabled = false;
  toast(`${t("compiled")}: ${w.spreads.length} ${t("spreads")}`, "ok");
}
function extractPdfText(buf) {
  const bytes = new Uint8Array(buf);
  let raw = ""; for (let i = 0; i < bytes.length; i++) raw += String.fromCharCode(bytes[i]);
  const out = [];
  const re = /\(((?:\\.|[^\\)])*)\)\s*Tj|\[((?:[^\]]|\\.)*)\]\s*TJ/g;
  let m;
  while ((m = re.exec(raw)) !== null && out.length < 900) {
    if (m[1] !== undefined) out.push(m[1]);
    else { const parts = m[2].match(/\(((?:\\.|[^\\)])*)\)/g) || []; parts.forEach(p => out.push(p.slice(1, -1))); }
  }
  let text = out.join(" ").replace(/\\[nrt]/g, " ").replace(/\\(\d{3})/g, (a, b) => String.fromCharCode(parseInt(b, 8))).replace(/[^\x20-\x7E\u0900-\u097F\n]/g, " ").replace(/\s+/g, " ").trim();
  if (text.length < 120) {
    text = (raw.match(/[A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F ,.;:'"()\-]{18,}/g) || []).slice(0, 400).join(" ");
  }
  return text.slice(0, 60000);
}
function bindSpec() {
  $("btnDownloadSpec").onclick = () => download("world-spec.json", $("specText").value);
  $("btnPrompt").onclick = () => { navigator.clipboard && navigator.clipboard.writeText(GEMINI_PROMPT); toast(t("copied")); };
  $("specFile").onchange = async e => { const f = e.target.files[0]; if (f) { $("specText").value = await f.text(); toastKey("toast.specLoaded", "Spec loaded"); } };
  $("btnValidateSpec").onclick = () => validateSpecUI();
  $("btnApplySpec").onclick = () => {
    let w; try { w = normalizeWorld(JSON.parse($("specText").value)); } catch (e) { toast(uiTxt("toast.jsonError") + e.message, "warn"); return; }
    const rep = validateWorld(w), bad = rep.filter(r => r.status === "review");
    if (bad.length && !confirm(`${bad.length} validator notes:\n` + bad.map(r => "• " + r.name + " — " + r.msg).join("\n") + "\n\nBuild anyway?")) return;
    EV.world = w; WORLD.setWorld(w, 0); renderTop(); renderChapterList(); setView("book"); flash();
    toast(t("compiled"), "ok");
  };
  validateSpecUI();
}
function validateSpecUI() {
  let rep;
  try { rep = validateWorld(normalizeWorld(JSON.parse($("specText").value))); }
  catch (e) { html($("specReport"), `<div class="rep-row review"><b>!</b><span data-i18n="toast.jsonError">${esc(uiTxt("toast.jsonError"))}</span><small>${esc(e.message)}</small></div>`); return; }
  html($("specReport"), rep.map(r => `<div class="rep-row ${r.status}"><b>${r.status === "pass" ? "✓" : "!"}</b><span>${esc(r.name)}</span><small>${esc(r.msg)}</small></div>`).join(""));
  toast(rep.every(r => r.status === "pass") ? t("passed") + " · " + rep.length + " " + uiTxt("ui.checks") : t("review") + " · " + rep.filter(r => r.status === "review").length + " " + uiTxt("ui.notes"));
}
function bindQuiz() {
  document.querySelectorAll(".qi-opts input").forEach(i => i.addEventListener("change", () =>
    EVFSM.transition("quiz", "ANSWER", {})));
  $("btnQuizSubmit").onclick = () => {
    const w = EV.world || getWorld("c10_carbon"), qs = QZ(w); let score = 0;
    qs.forEach((q, i) => {
      const sel = document.querySelector(`input[name="q${i}"]:checked`), v = sel ? +sel.value : -1;
      const why = $("why" + i);
      if (why) { why.hidden = false; why.className = "qi-why " + (v === q.a ? "ok" : "no"); why.innerHTML = `<b>${v === q.a ? "✓" : "✗"}</b> ${esc(q.why)}`; }
      if (v === q.a) score++;
    });
    EVFSM.transition("quiz", "COMPLETE", { answered: document.querySelectorAll(".qi-opts input:checked").length });
    $("scoreBadge").textContent = score + " / " + qs.length;
    $("quizResult").innerHTML = `<b>${esc(t("score"))}: ${score} / ${qs.length}</b>`;
    if (qs.length && score / qs.length >= 0.8 && typeof SCIVERSE !== "undefined" && SCIVERSE.celebrate) SCIVERSE.celebrate("quiz");
    if (score === qs.length) toastKey("toast.perfect", "Perfect score ★", "ok"); else toast(`${score} / ${qs.length}`);
  };
  $("btnQuizRetry").onclick = () => {
    EVFSM.transition("quiz", "RESET", {});
    document.querySelectorAll(".qi-opts input").forEach(i => i.checked = false);
    document.querySelectorAll(".qi-why").forEach(d => { d.hidden = true; d.textContent = ""; });
    $("scoreBadge").textContent = "—"; $("quizResult").textContent = "";
  };
}

/* ----------------------------------------------------------------- WORLD glue */
const callbacks = {
  onReady() { /* keep the printed header clear on a classroom projector */ },
  onFrame() { EVRASTER.frame(); },
  onZoom() { EVZOOM.open(); },
  onView(v) { },
  onChapter(id, spread) {
    if (String(id).indexOf("sec:") === 0) {
      if (!EV.world || EV.world.id !== "c10_carbon") openChapter("c10_carbon");
      if (spread != null) WORLD.jumpTo(spread);
      return;
    }
    openChapter(id);
  },
  onPage(index, sp) {
    syncTopicVisual();
    renderLesson(); renderMeters(); renderPageBar(); renderTop();
    if (typeof EVBIND !== "undefined") EVBIND.onSpread(index);
    if (typeof O3LAB !== "undefined") O3LAB.onSpread(index);
    if (typeof EVPROJ !== "undefined") EVPROJ.onSpread(index); },
  onRebuild(sp, params, ctrls) { renderMeters(); renderPageBar(); },
  onParam(id, value, model, source) {
    EV.lastModel = model; updateReadouts(model);
    if (typeof O3LAB !== "undefined") O3LAB.onParam(id, value, model, source);
    const inp = document.querySelector(`[data-cid="${id}"]`);
    if (inp && source !== "slider") inp.value = value;
    const w = EV.world, sp = w.spreads[WORLD.index], pg = pget(w, sp);
    if (!pg.locked && source !== "demo") { /* predict-first hint stays visible */ }
  },
  onTouch(id, label, touched, model, params) {
    EV.lastTouched = touched.size;
    pget(EV.world, EV.world.spreads[WORLD.index]).touched = touched.size;
    renderTouchDots(); updateReadouts(model);
    toast("✦ " + (label || id) + uiTxt("toast.inspected", EV.lang === "hi" ? " · जानकारी दर्ज" : " · inspected"), "ok");
    const st = WORLD.getState();
    Object.keys(st.params).forEach(k => { const inp = document.querySelector(`[data-cid="${k}"]`); if (inp) inp.value = st.params[k]; });
  },
  onReset(params, model) { renderMeters(); },
  onDemoStep(s, i, n) { const c = $("demoCaption"); if (c) { c.hidden = false; c.innerHTML = `<b>${i}/${n}</b> ${esc(s.caption || "")}`; } },
  onDemoStop: demoStopped,
  onPrecision() { },
  onShot() { syncBoardUI(); }
};

/* ------------------------------------------------------- language + projector */
function syncBoardUI() {
  const on = WORLD.getShot && WORLD.getShot() === "board";
  const stage = $("stage"); if (stage) stage.classList.toggle("projector", on);
  const b = $("btnBoard");
  if (b) {
    const key = on ? "board" : "boardExit", label = t(key);
    b.classList.toggle("active", !!on);
    b.title = label; b.setAttribute("aria-label", label);
    b.setAttribute("data-i18n-title", key); b.setAttribute("data-i18n-aria", key);
    if (typeof EVDICT !== "undefined") EVDICT.apply(b, EV.lang);
  }
}
/* ------------------------------------------------ collapsible dock panels
   Left = prediction card, right = live readings. Hiding both leaves only the
   40 px pager strip; boardFit() then expands the book automatically. */
function applyPanels() {
  const st = $("stage"); if (!st) return;
  const bothHidden = !EV.panels.left && !EV.panels.right;
  st.classList.toggle("hide-left", !EV.panels.left);
  st.classList.toggle("hide-right", !EV.panels.right);
  /* R4: use the vacant stage margins - a wider straight-on book. */
  if (typeof WORLD !== "undefined" && WORLD.setWide)
    WORLD.setWide(EV.theme === "classroom" ? (bothHidden ? 1.34 : 1.30) : (bothHidden ? 1.30 : 1.22));
  if ($("btnReader")) $("btnReader").classList.toggle("active", bothHidden);
  EVFSM.observe("panels", panelState(), "app.js:applyPanels");
  document.querySelectorAll("[data-panel]").forEach(b => {
    const k = b.dataset.panel;
    b.classList.toggle("active", k === "both" ? bothHidden : !!EV.panels[k]);
  });
  if (typeof WORLD !== "undefined" && WORLD.resize) WORLD.resize();
}
function togglePanel(which) {
  EVFSM.transition("panels", which === "both" ? "TOGGLE_BOTH" : which === "left" ? "TOGGLE_LEFT" : "TOGGLE_RIGHT", {});
  if (which === "both") {
    const show = !EV.panels.left && !EV.panels.right;
    EV.panels.left = EV.panels.right = show;
  } else if (which === "left" || which === "right") {
    EV.panels[which] = !EV.panels[which];
  } else return;
  try { localStorage.setItem("sciverse-panels-v2", JSON.stringify(EV.panels)); } catch (e) {}
  applyPanels();
  toast(!EV.panels.left && !EV.panels.right ? t("panelsHidden") : t("panelsShown"));
}
function setLanguage(mode) {
  if (LANG_MODES.indexOf(mode) < 0) return;
  EVFSM.transition("lang", "SET", { to: mode });
  EV.lang = mode;
  /* Preserve Prompt-4 body/app classes while switching only the lang-* class. */
  const appEl = $("app");
  appEl.classList.remove("lang-en", "lang-hi", "lang-both");
  appEl.classList.add("lang-" + mode);
  WORLD.setLang(mode);
  renderNav(); renderTop(); renderChapterList();
  if (window.EVLIB) EVLIB.render();
  renderLesson(); renderMeters(); renderPageBar(); renderSectionSelect();
  if (typeof EVBIND !== "undefined") EVBIND.setLang(mode);
  if (typeof O3LAB !== "undefined") O3LAB.setLang(mode);
  if (typeof EVPROJ !== "undefined") EVPROJ.onLang(mode);
  if (typeof EVLAZY !== "undefined") EVLAZY.onLang(mode);
  if (EV.view !== "world" && EV.view !== "book") { html($("screenInner"), renderScreen(EV.view)); rebindScreen(); }
  if (typeof EVDICT !== "undefined") EVDICT.apply(document, mode);
  const msg = (typeof EVDICT !== "undefined")
    ? EVDICT.get(mode === "hi" ? "toast.hiEnabled" : mode === "en" ? "toast.enEnabled" : "toast.bothEnabled", mode)
    : (mode === "hi" ? "हिंदी सक्षम" : mode === "en" ? "English enabled" : "द्विभाषी · EN + हिंदी");
  toast(msg);
}

/* ------------------------------------------------------------------- boot */
function applyBoardText(v) {
  EVFSM.transition("boardText", "SET", { to: v === "big" ? "big" : "detail" });
  EV.boardText = v === "big" ? "big" : "detail";
  if (typeof WORLD !== "undefined" && WORLD.setBoardText) WORLD.setBoardText(EV.boardText);
  const b = $("btn30ft");
  if (b) {
    b.classList.toggle("active", EV.boardText === "big");
    const key = EV.boardText === "big" ? "ui.bigBoardOn" : "ui.bigBoardOff";
    b.title = uiTxt(key); b.setAttribute("aria-label", b.title);
    b.setAttribute("data-i18n-title", key); b.setAttribute("data-i18n-aria", key);
    if (typeof EVDICT !== "undefined") EVDICT.apply(b, EV.lang);
  }
  try { localStorage.setItem("eduverse-boardtext-v1", EV.boardText); } catch (e) {}
}
function applyUltra(v) {
  /* 2D-only: the raised 3D model is never allowed to cover the plate. */
  if (typeof EV_2D_ONLY !== "undefined" && EV_2D_ONLY) v = false;
  EVFSM.transition("ultra", "SET", { to: !!v ? "on" : "off" });
  EV.ultra = !!v;
  if (typeof WORLD !== "undefined" && WORLD.setUltra) WORLD.setUltra(EV.ultra);
  const b = $("btn3d");
  if (b) {
    b.classList.toggle("active", EV.ultra);
    const key = EV.ultra ? "ui.ultraOn" : "ui.ultraOff";
    b.title = uiTxt(key); b.setAttribute("aria-label", b.title);
    b.setAttribute("data-i18n-title", key); b.setAttribute("data-i18n-aria", key);
    if (typeof EVDICT !== "undefined") EVDICT.apply(b, EV.lang);
  }
  try { localStorage.setItem("eduverse-ultra-v1", EV.ultra ? "1" : "0"); } catch (e) {}
}
function applyTheme(v) {
  EVFSM.transition("theme", "SET", { to: v === "studio" ? "studio" : "classroom" });
  EV.theme = v === "studio" ? "studio" : "classroom";
  document.body.dataset.theme = EV.theme;
  if (typeof WORLD !== "undefined" && WORLD.setTheme) WORLD.setTheme(EV.theme);
  if (typeof WORLD !== "undefined" && WORLD.setWide) WORLD.setWide(EV.theme === "classroom" ? 1.30 : 1.22);
  const b = $("btnTheme");
  if (b) { b.classList.toggle("active", EV.theme === "classroom"); b.textContent = EV.theme === "classroom" ? "◐" : "◑";
    const key = EV.theme === "classroom" ? "ui.highContrast" : "ui.studioTheme";
    b.title = uiTxt(key); b.setAttribute("aria-label", b.title);
    b.setAttribute("data-i18n-title", key); b.setAttribute("data-i18n-aria", key);
    if (typeof EVDICT !== "undefined") EVDICT.apply(b, EV.lang); }
  try { localStorage.setItem("eduverse-theme-v1", EV.theme); } catch (e) {}
}
function boot() {
  loadProgress();
  try { const th = localStorage.getItem("eduverse-theme-v1"); if (th === "studio") EV.theme = "studio"; } catch (e) {}
  applyTheme(EV.theme);
  try { const bt = localStorage.getItem("eduverse-boardtext-v1"); if (bt === "big") EV.boardText = "big"; } catch (e) {}
  applyBoardText(EV.boardText);
  /* 2D-only: a previously saved ULTRA 3D preference must never hide the
     realistic 2D illustration again. Clear it for good. */
  EV.ultra = false;
  try { localStorage.removeItem("eduverse-ultra-v1"); } catch (e) {}
  applyUltra(false);
  try {
    const saved = JSON.parse(localStorage.getItem("sciverse-panels-v2") || "null");
    if (saved && typeof saved.left === "boolean" && typeof saved.right === "boolean") EV.panels = saved;
  } catch (e) {}
  EV.world = getWorld("c10_carbon");
  const qs = new URLSearchParams(location.search);
  const deepWorld = qs.get("world"), deepSpread = parseInt(qs.get("spread") || "0", 10) || 0;
  if (deepWorld && CATALOGUE_ALL.some(c => c.id === deepWorld)) EV.world = getWorld(deepWorld);
  WORLD.init($("gl"), EV_2D_ONLY ? Object.assign({}, callbacks, { no3d: true }) : callbacks);
  if (EV_2D_ONLY) document.body.classList.add("mode-2d");
  EVRASTER.install();
  $("precision2d").addEventListener("click", e => { if (e.target.closest("svg")) EVZOOM.open(); });
  WORLD.setLang(EV.lang);
  applyPanels();
  { const a = $("app"); a.classList.remove("lang-en", "lang-hi", "lang-both"); a.classList.add("lang-" + EV.lang); }
  WORLD.setWorld(EV.world, Math.max(0, Math.min(EV.world.spreads.length - 1, deepSpread)));
  syncTopicVisual();
  /* Additive student dashboard: two class cards -> class drawer -> flipbook. */
  if (window.EVLIB) EVLIB.install();
  if (window.SCIVERSE) SCIVERSE.install();
  renderNav(); renderTop(); renderChapterList();
  renderLesson(); renderMeters(); renderPageBar(); renderSectionSelect();
  setView(qs.has("world") ? "book" : "world");
  $("langSelect").onchange = e => setLanguage(e.target.value);
  $("pageBar").addEventListener("click", e => {
    const v = e.target.closest && e.target.closest("[data-plate]");
    if (v && !v.disabled) { e.preventDefault(); e.stopPropagation(); setPlateView(v.dataset.plate); return; }
    const b = e.target.closest && e.target.closest("[data-panel]");
    if (b) { e.preventDefault(); e.stopPropagation(); togglePanel(b.dataset.panel); }
  });
  $("btnReader").onclick = () => togglePanel("both");
  $("btnBoard").onclick = () => {
    const on = WORLD.getShot() !== "board";
    EVFSM.transition("shot", "TOGGLE_BOARD", { to: on ? "board" : "explore" });
    WORLD.setShot(on ? "board" : "explore");
    syncBoardUI();
    toastKey(on ? "toast.boardOn" : "toast.boardOff",
      on ? "Straight projector view · alignment locked" : "Angled 3D view");
  };
  /* canvas text needs the embedded Devanagari font to be loaded first */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { WORLD.refresh(); });
  syncBoardUI();
  /* Prompt 2 · install the generic pack / state / UI<->3D binding. Parts mode
     is opt-in (?parts=1, the ◈ Parts toggle, or a shared EVSTATE link), so the
     shipped R3-R8 default view is byte-for-byte unchanged in behaviour. */
  if (typeof EVBIND !== "undefined") {
    EVBIND.install();
    EVBIND.onChapter(EV.world.id, WORLD.index);
  }
  /* Prompt 3 · canonical O3 ray lab. Opt-in (?o3=1 or the ◉ O3 toggle), so
     the shipped R3-R8 default view is unchanged. It uses the SAME WORLD
     selectionRoot / shared WebGLRenderer as Prompt 2, never a second canvas. */
  if (typeof O3LAB !== "undefined") {
    O3LAB.install();
    O3LAB.onChapter(EV.world.id, WORLD.index);
  }
  /* Prompt 4 · Projector Mode + canonical dictionary. Opt-in (?projector=1,
     the ▦ toggle or Alt+P), OFF by default. It only changes DOM/CSS state and
     never creates another WebGLRenderer, canvas, rAF or state-machine fork. */
  if (typeof EVPROJ !== "undefined") {
    EVPROJ.install();
    EVPROJ.onLang(EV.lang);
  }
  /* Prompt 5 · all 29 chapter packs stay inert JSON until a chapter needs them.
     ?pack=1 / Alt+K opens the opt-in panel; default classroom view unchanged. */
  if (typeof EVLAZY !== "undefined") {
    EVLAZY.install();
    EVLAZY.onChapter(EV.world.id);
  }
  if (typeof EVDICT !== "undefined") EVDICT.apply(document, EV.lang);
  if ($("btnTheme")) $("btnTheme").onclick = () => {
    applyTheme(EV.theme === "classroom" ? "studio" : "classroom");
  };
  if ($("btn3d")) $("btn3d").onclick = () => {
    applyUltra(!EV.ultra);
    toastKey(EV.ultra ? "toast.ultraOn" : "toast.ultraOff",
      EV.ultra ? "ULTRA 3D चालू — मॉडल पन्ने से ऊपर उठा" : "3D मॉडल पन्ने पर · live render on the page");
  };
  $("btn30ft").onclick = () => {
    applyBoardText(EV.boardText === "big" ? "detail" : "big");
    toastKey(EV.boardText === "big" ? "toast.bigOn" : "toast.bigOff",
      EV.boardText === "big" ? "30 FT / बड़ा बोर्ड चालू — पिछली पंक्ति से पढ़ें" : "विस्तृत पाठ · detail plate");
  };
  /* Far-read (#btnFar, from branch ccr-c832c1ee-2alkrc): full screen + 30 ft type +
     high-contrast pages + bottom panels collapsed. Off restores theme, type and panels. */
  let farPrev = null;
  function setFarRead(on) {
    on = !!on;
    if (on && !farPrev) {
      farPrev = { panels: JSON.parse(JSON.stringify(EV.panels)), boardText: EV.boardText, theme: EV.theme };
      applyBoardText("big"); applyTheme("classroom");
      EV.panels.left = EV.panels.right = false; applyPanels();
    } else if (!on && farPrev) {
      applyBoardText(farPrev.boardText); applyTheme(farPrev.theme);
      EV.panels = farPrev.panels; applyPanels(); farPrev = null;
    }
    document.body.classList.toggle("far-read", on);
    const fb = $("btnFar");
    if (fb) { fb.classList.toggle("active", on); fb.setAttribute("aria-pressed", String(on)); }
    try {
      if (on && !document.fullscreenElement && document.documentElement.requestFullscreen)
        document.documentElement.requestFullscreen().catch(() => {});
      if (!on && document.fullscreenElement && document.exitFullscreen)
        document.exitFullscreen().catch(() => {});
    } catch (e) {}
  }
  if ($("btnFar")) $("btnFar").onclick = () => setFarRead(!farPrev);
  if (new URLSearchParams(location.search).get("far") === "1") setFarRead(true);
  if ($("btnCompileTop")) $("btnCompileTop").onclick = () => setView("compiler");
  const enterBook = () => { if (!EV.world) EV.world = getWorld("c10_carbon"); setView("book"); };
  if ($("btnEnter")) $("btnEnter").onclick = enterBook;
  if ($("btnEnterShelf")) $("btnEnterShelf").onclick = enterBook;
  $("btnHelp").onclick = showHelp;
  $("btnHome").onclick = goHome;
  if ($("btnHomeFloat")) $("btnHomeFloat").onclick = goHome;
  if ($("brand")) $("brand").onclick = goHome;
  document.addEventListener("keydown", e => {
    if (e.altKey && (e.key === "h" || e.key === "H")) { e.preventDefault(); goHome(); }
  });
  $("btnBookTop").onclick = () => setView("book");
  $("btnQuizTop").onclick = () => setView("quiz");
  $("btnShotTop").onclick = () => { const n = WORLD.getShot() === "read" ? "explore" : "read";
    EVFSM.transition("shot", "TOGGLE_READ", { to: n }); WORLD.setShot(n); toast(n === "read" ? t("readShot") : t("exploreShot")); };
  $("btnFocus").onclick = () => { $("stage").classList.toggle("focus");
    EVFSM.observe("focus", $("stage").classList.contains("focus") ? "on" : "off", "app.js:btnFocus"); $("btnFocus").classList.toggle("active", $("stage").classList.contains("focus")); };
  $("btnTools").onclick = () => { const d = $("toolsDrawer"); d.hidden = !d.hidden;
    EVFSM.observe("toolsDrawer", d.hidden ? "closed" : "open", "app.js:btnTools"); $("btnTools").classList.toggle("active", !d.hidden); };
  $("btnCloseTools").onclick = () => { $("toolsDrawer").hidden = true;
    EVFSM.observe("toolsDrawer", "closed", "app.js:btnCloseTools"); $("btnTools").classList.remove("active"); };
  /* R8 · live mirrors, atomic-restore adapters and the state capsule -------- */
  EVFSM.mirror("view", () => EV.view);
  EVFSM.mirror("shot", () => WORLD.getShot());
  EVFSM.mirror("theme", () => EV.theme);
  EVFSM.mirror("lang", () => EV.lang);
  EVFSM.mirror("boardText", () => EV.boardText);
  EVFSM.mirror("ultra", () => EV.ultra ? "on" : "off");
  EVFSM.mirror("figureMode", () => WORLD.plate2d ? "plate2d" : WORLD.figureMode);
  EVFSM.mirror("panels", () => panelState());
  EVFSM.mirror("precision", () => EV.precision ? "on" : "off");
  EVFSM.mirror("navigation", () => (EV.world ? EV.world.id : "c10_carbon") + "::" + WORLD.index);
  EVFSM.mirror("demo", () => EV.demo ? "running" : "idle");
  EVFSM.mirror("toolsDrawer", () => $("toolsDrawer") && $("toolsDrawer").hidden ? "closed" : "open");
  EVFSM.mirror("focus", () => $("stage") && $("stage").classList.contains("focus") ? "on" : "off");
  EVFSM.mirror("pageTurn", () => WORLD.turning ? "turning" : "idle");
  EVFSM.context(() => ({
    view: EV.view, dom: { screenHidden: $("screen") ? $("screen").hidden : null },
    toolView: ["compiler", "spec", "quiz", "research", "teacher"].indexOf(EV.view) >= 0,
    worldTheme: EV.theme, classroom: EV.theme === "classroom",
    plate2dAvailable: !!(EV.world && WORLD.plate2dAvailable(EV.world)),
    wide: (typeof WORLD !== "undefined" && WORLD.wide) || 1.30,
    audit: WORLD.boardAudit ? WORLD.boardAudit() : null,
    subjectBio: !!(EV.world && (EV.world.subject === "bio" || EV.world.subject === "Biology")),
    known: !!(EV.world && CATALOGUE_ALL.some(c => c.id === EV.world.id)),
    count: EV.world ? EV.world.spreads.length : 0,
    capsule: null, drifts: []
  }));
  EVFSM.adapter("view", v => setView(v));
  EVFSM.adapter("shot", v => WORLD.setShot(v));
  EVFSM.adapter("theme", v => applyTheme(v));
  EVFSM.adapter("lang", v => setLanguage(v));
  EVFSM.adapter("boardText", v => applyBoardText(v));
  EVFSM.adapter("ultra", v => applyUltra(v === "on"));
  EVFSM.adapter("figureMode", v => {
    if (v === "plate2d" && EV.world && WORLD.plate2dAvailable(EV.world)) {
      WORLD.setPlate2D(true);
      EVFSM.observe("figureMode", "plate2d", "app.js:figureModeAdapter");
    } else {
      WORLD.setPlate2D(false);
      WORLD.setFigureMode(v === "plate2d" ? "3d" : v);
    }
  });
  EVFSM.adapter("panels", v => {
    EV.panels.left = v !== "reader" && v !== "leftHidden";
    EV.panels.right = v !== "reader" && v !== "rightHidden";
    try { localStorage.setItem("sciverse-panels-v2", JSON.stringify(EV.panels)); } catch (e) {}
    applyPanels();
  });
  EVFSM.adapter("precision", v => { EV.precision = (v === "on"); applyPrecision(); });
  EVFSM.adapter("navigation", v => {
    const parts = String(v).split("::"), id = parts[0], idx = parseInt(parts[1], 10) || 0;
    if (!EV.world || EV.world.id !== id) {
      if (!CATALOGUE_ALL.some(c => c.id === id)) return;
      EV.world = getWorld(id); WORLD.setWorld(EV.world, idx);
      renderTop(); renderChapterList();
    } else WORLD.jumpTo(idx);
  });
  /* The exact teaching setup can be shared as one URL param. */
  const capsule = qs.get("state");
  ["view", "shot", "theme", "lang", "boardText", "ultra", "figureMode", "panels", "precision", "navigation"]
    .forEach(id => EVFSM.observe(id, EVFSM.mirrorValue ? EVFSM.mirrorValue(id) : ({
      view: EV.view, shot: WORLD.getShot(), theme: EV.theme, lang: EV.lang,
      boardText: EV.boardText, ultra: EV.ultra ? "on" : "off",
      figureMode: WORLD.plate2d ? "plate2d" : WORLD.figureMode, panels: panelState(),
      precision: EV.precision ? "on" : "off",
      navigation: (EV.world ? EV.world.id : "c10_carbon") + "::" + WORLD.index
    })[id], "app.js:boot"));
  EVFSM.transition("persistence", "APPLY", {});
  if (capsule) {
    const cap = EVFSM.decode(capsule);
    const rr = EVFSM.restore(cap);
    /* A reviewed 2D chapter may arrive AFTER navigation in a shared capsule. */
    if (cap && cap.machines && cap.machines.figureMode === "plate2d" &&
        WORLD.plate2dAvailable(EV.world)) {
      WORLD.setPlate2D(true);
      EVFSM.observe("figureMode", "plate2d", "app.js:capsulePlate2D");
      renderPageBar();
    }
    if (rr.ok) toastKey("toast.restore", "Shared board setup restored", "ok");
  }
  /* Alt+R = known-good projector preset; Alt+S = copy a shareable state link. */
  window.addEventListener("keydown", e => {
    if (!e.altKey) return;
    if (e.key === "r" || e.key === "R") { e.preventDefault(); EVFSM.preset("classroom");
      toastKey("toast.preset", "Classroom projector preset applied", "ok"); }
    if (e.key === "s" || e.key === "S") { e.preventDefault();
      const url = location.origin + EVFSM.link(location.href);
      if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
      toastKey("toast.share", "Shareable board link copied", "ok"); }
  });
  window.addEventListener("resize", () => WORLD.resize());
  /* swipe to turn pages */
  let sx = null;
  $("gl").addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
  $("gl").addEventListener("touchend", e => {
    if (sx === null || EV.view !== "book") return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 70) WORLD.startTurn(dx < 0 ? 1 : -1);
  }, { passive: true });
}
function rebindScreen() { if (EV.view === "compiler") bindCompiler(); if (EV.view === "spec") bindSpec(); if (EV.view === "quiz") bindQuiz(); if (EV.view === "teacher") bindTeacher(); }
function showHelp() {
  const K = k => `<span data-i18n="${esc(k)}">${esc(uiTxt(k))}</span>`;
  const box = document.createElement("div");
  box.className = "modal"; box.innerHTML = `<div class="modal-inner"><button class="modal-close" title="${esc(uiTxt("ui.close"))}" data-i18n-title="ui.close" data-i18n-aria="ui.close">×</button>
    <div class="eyebrow">${K("ui.helpEyebrow")}</div><h2>${K("ui.helpTitle")}</h2>
    <ol><li><b>${K("ui.helpMetaWorld")}</b> — ${K("ui.help1")}</li>
    <li><b>${K("ui.helpRealBook")}</b> — ${K("ui.help2")}</li>
    <li><b>${K("ui.helpPopUp")}</b> — ${K("ui.help3")}</li>
    <li><b>${K("ui.helpPredictFirst")}</b> — ${K("ui.help4")}</li>
    <li><b>${K("ui.helpExperiment")}</b> — ${K("ui.help5")}</li>
    <li><b>${K("ui.helpChallengeStamp")}</b> — ${K("ui.help6")}</li>
    <li><b>${K("ui.helpCompiler")}</b> — ${K("ui.help7")}</li></ol>
    <p class="muted">${K("ui.helpSyllabus")}</p>
    <p class="muted"><b data-i18n="ui.credit">${esc(uiTxt("ui.credit"))}</b> · ${K("ui.helpCredit")}</p>
    <p class="muted"><b>▣ ${K("ui.straightView")}</b> — ${K("ui.helpProjector")}</p>
    <p class="muted"><b>${K("ui.langBoth")} / ${K("ui.langHi")} / ${K("ui.langEn")}</b> — ${K("ui.helpLanguage")}</p></div>`;
  document.body.appendChild(box);
  if (typeof EVDICT !== "undefined") EVDICT.apply(box, EV.lang);
  box.querySelector(".modal-close").onclick = () => box.remove();
  box.onclick = e => { if (e.target === box) box.remove(); };
}

/* ==========================================================================
   EVLIB — ACADEMIC LIBRARY DASHBOARD (additive, world view only)
   --------------------------------------------------------------------------
   Two separately clickable Class IX / Class X textbook cards built from the
   existing CATALOGUE_ALL + STUDENT_CHAPTERS data. A class opens that class's
   chapter drawer; a chapter calls the ORIGINAL openChapter(), so the flipbook,
   page-turn physics, 3D scenes and every QA contract are untouched.
   No new script block, no network, no image/font/GLB asset, no new renderer.
   Copyright / Developer : Paras Pranav
   ========================================================================== */
const EVLIB = (function () {
  'use strict';
  const KEYS = [
    ["lib.eyebrow", "ANVEXIA · CBSE / NCERT SCIENCE", "अन्वेक्सिया · सीबीएसई / NCERT विज्ञान", "ANVEXIA · CBSE / NCERT SCIENCE"],
    ["lib.title", "Anvexia", "Anvexia", "Anvexia"],
    ["lib.sub", "Class IX–X Science mastery · extensible to Class XI–XII. Choose a textbook or launch any learning mode below.",
      "कक्षा IX–X विज्ञान दक्षता · कक्षा XI–XII तक विस्तार योग्य। नीचे पाठ्यपुस्तक या शिक्षण मोड चुनें।",
      "Class IX–X Science · XI–XII Ready / कक्षा IX–X विज्ञान · द्विभाषी"],
    ["lib.textbook", "TEXTBOOK · NCERT EXPLORATION", "पाठ्यपुस्तक · NCERT अन्वेषण", "TEXTBOOK · NCERT EXPLORATION IX"],
    ["lib.textbookX", "TEXTBOOK · NCERT SCIENCE", "पाठ्यपुस्तक · NCERT विज्ञान", "TEXTBOOK · NCERT SCIENCE X"],
    ["lib.classIX", "Class IX", "कक्षा IX", "Class IX"],
    ["lib.classX", "Class X", "कक्षा X", "Class X"],
    ["lib.classIXHi", "Science · NCERT Exploration IX", "विज्ञान · NCERT अन्वेषण IX", "कक्षा IX · विज्ञान · NCERT अन्वेषण"],
    ["lib.classXHi", "Science · NCERT Rationalised X", "विज्ञान · NCERT परिमार्जित X", "कक्षा X · विज्ञान · NCERT"],
    ["lib.inside", "INSIDE THIS BOOK", "इस किताब के अंदर", "INSIDE THIS BOOK / इस किताब के अंदर"],
    ["lib.open", "Open Class IX", "कक्षा IX खोलें", "Open Class IX / कक्षा IX खोलें"],
    ["lib.openX", "Open Class X", "कक्षा X खोलें", "Open Class X / कक्षा X खोलें"],
    ["lib.openIX", "Open the Class IX chapter list", "कक्षा IX की अध्याय सूची खोलें", "Open Class IX chapters / कक्षा IX के अध्याय"],
    ["lib.openXAria", "Open the Class X chapter list", "कक्षा X की अध्याय सूची खोलें", "Open Class X chapters / कक्षा X के अध्याय"],
    ["lib.note", "2D Flipbooks • 3D Models • Interactive Experiments • Hindi–English Learning — Pick a class to begin.",
      "2D फ़्लिपबुक • 3D मॉडल • इंटरैक्टिव प्रयोग • हिंदी–अंग्रेज़ी शिक्षण — शुरू करने के लिए कक्षा चुनें।",
      "2D Flipbooks • 3D Models • Interactive Experiments • Hindi–English"],
    ["lib.resume", "Open book →", "पुस्तक खोलें →", "Open book →"],
    ["lib.chooseClass", "Choose a class", "अपनी कक्षा चुनें", "Choose a class / अपनी कक्षा चुनें"],
    ["lib.searchShort", "Search", "खोजें", "Search / खोजें"],
    ["lib.back", "← All classes", "← सभी कक्षाएँ", "← All classes / सभी कक्षाएँ"],
    ["lib.backShelf", "← Library dashboard", "← पुस्तकालय डैशबोर्ड", "← Library / पुस्तकालय"],
    ["lib.close", "Close chapter list", "अध्याय सूची बंद करें", "Close / बंद करें"],
    ["lib.drawerIX", "Class IX · Chapters", "कक्षा IX · अध्याय", "Class IX · Chapters / कक्षा IX · अध्याय"],
    ["lib.drawerX", "Class X · Chapters", "कक्षा X · अध्याय", "Class X · Chapters / कक्षा X · अध्याय"],
    ["lib.drawerEyebrow", "NCERT SCIENCE · CHOOSE A CHAPTER", "NCERT विज्ञान · अध्याय चुनें", "NCERT SCIENCE · CHOOSE A CHAPTER"],
    ["lib.statClasses", "Classes", "कक्षाएँ", "Classes"],
    ["lib.statChapters", "Chapters", "अध्याय", "Chapters"],
    ["lib.statSpreads", "Spreads", "स्प्रेड", "Spreads"],
    ["lib.chapters", "chapters", "अध्याय", "chapters"],
    ["lib.spreads", "spreads", "स्प्रेड", "spreads"],
    ["lib.bilingualLabel", "Bilingual EN + Hindi", "द्विभाषी EN + हिंदी", "EN + हिंदी"],
    ["lib.footReady", "chapters ready · click any row to open the flipbook",
      "अध्याय तैयार · फ़्लिपबुक खोलने के लिए किसी पंक्ति पर क्लिक करें",
      "chapters ready · click a row to open the flipbook"]
  ];
  const SUBJ = {
    chem: ["Chemistry", "रसायन विज्ञान"], bio: ["Biology", "जीव विज्ञान"],
    phy: ["Physics", "भौतिक विज्ञान"], science: ["Science", "विज्ञान"],
    earth: ["Earth", "पृथ्वी"]
  };
  let cls = null;
  let installed = false;

  if (typeof EVDICT !== "undefined") KEYS.forEach(k => EVDICT.register(k[0], k[1], k[2], k[3]));

  const A = (en, hi) => 'data-i18n="' + esc((typeof EVDICT !== "undefined") ? EVDICT.auto(en, hi) : String(en)) + '"';
  const text = (en, hi) => (typeof EVDICT !== "undefined") ? EVDICT.get(EVDICT.auto(en, hi), EV.lang) : BI(en, hi);
  const rowsFor = c => CATALOGUE_ALL.filter(x => x.cls === c && STUDENT_CHAPTERS.indexOf(x.id) >= 0);
  const nSpreads = c => (typeof WORLDS !== "undefined" && WORLDS[c.id]) ? WORLDS[c.id].length : 0;
  const subj = c => SUBJ[c.subject] || SUBJ.science;

  function pill(en, hi, tone) {
    return '<span class="lp-pill ' + (tone || '') + '" ' + A(en, hi) + '>' + esc(text(en, hi)) + '</span>';
  }
  function render() {
    if (!installed) return;
    const ix = rowsFor("IX"), x = rowsFor("X");
    [["IX", ix], ["X", x]].forEach(pair => {
      const c = pair[0], rows = pair[1];
      const spreads = rows.reduce((n, r) => n + nSpreads(r), 0);
      const subjects = {};
      rows.forEach(r => { subjects[r.subject] = 1; });
      let meta = pill(String(rows.length) + " chapters", String(rows.length) + " अध्याय", "") +
                 pill(String(spreads) + " spreads", String(spreads) + " स्प्रेड", "amber");
      const seen = {};
      Object.keys(subjects).forEach(sk => {
        const s = SUBJ[sk] || SUBJ.science;
        if (seen[s[1]]) return;
        seen[s[1]] = 1;
        meta += pill(s[0], s[1], sk === "chem" ? "" : sk === "phy" ? "amber" : "green");
      });
      html($("libMeta" + c), meta);
      html($("libPreview" + c), rows.slice(0, 3).map(r =>
        '<span ' + A(r.title, r.hi) + '>' + esc(BI(r.title, r.hi)) + '</span>').join(""));
    });
    if (cls) renderDrawer(cls);
  }
  function renderDrawer(c) {
    const rows = rowsFor(c);
    const total = rows.reduce((n, r) => n + nSpreads(r), 0);
    $("ldEyebrow").setAttribute("data-i18n", "lib.drawerEyebrow");
    $("ldTitle").setAttribute("data-i18n", c === "IX" ? "lib.drawerIX" : "lib.drawerX");
    const G = k => (typeof EVDICT !== "undefined") ? EVDICT.get(k, EV.lang) : k;
    $("ldSub").textContent = rows.length + " " + G("lib.chapters") + " · " +
      total + " " + G("lib.spreads") + " · " + G("lib.bilingualLabel");
    $("ldFoot").textContent = rows.length + " " + G("lib.footReady");
    html($("ldList"), rows.map((r, i) => {
      const s = subj(r);
      const active = EV.world && EV.world.id === r.id;
      const detail = s[0] + " · " + nSpreads(r) + " spreads";
      const detailHi = s[1] + " · " + nSpreads(r) + " स्प्रेड";
      const thumb = (typeof EVRASTER !== "undefined" && EVRASTER.firstThumb) ? EVRASTER.firstThumb(r.id) : "";
      return '<button type="button" class="ld-row' + (active ? ' active' : '') + '" data-ch="' + esc(r.id) + '">' +
        '<span class="ld-num">' + (i + 1) + '</span>' +
        (thumb ? '<img class="ld-thumb" src="' + esc(thumb) + '" alt="" loading="lazy">' : '') +
        '<span class="ld-body"><b ' + A(r.title, r.hi) + '>' + esc(BI(r.title, r.hi)) + '</b>' +
        '<small ' + A(detail, detailHi) + '>' + esc(text(detail, detailHi)) + '</small></span>' +
        '<span class="ld-tag ' + esc(r.subject) + '" ' + A(s[0], s[1]) + '>' + esc(text(s[0], s[1])) + '</span>' +
        '<span class="ld-arrow" aria-hidden="true">→</span></button>';
    }).join(""));
    $("ldList").querySelectorAll("[data-ch]").forEach(b => b.onclick = () => {
      const id = b.dataset.ch;
      close();
      openChapter(id);               /* ORIGINAL controller -> setView("book") */
    });
    if (typeof EVDICT !== "undefined") EVDICT.apply($("libDrawer"), EV.lang);
  }
  function open(c) {
    if (c !== "IX" && c !== "X") return;
    setLibrary(true);
    cls = c;
    renderDrawer(c);
    $("libDrawer").hidden = false;
    try { $("ldClose").focus({ preventScroll: true }); } catch (e) {}
  }
  function close() {
    cls = null;
    if ($("libDrawer")) $("libDrawer").hidden = true;
  }
  function setLibrary(on) {
    const hud = $("worldHud"); if (!hud) return;
    hud.classList.toggle("library-mode", !!on);
    hud.classList.toggle("shelf-mode", !on);
    if (!on) close();
  }
  function install() {
    if (installed) return;
    installed = true;
    const qs = new URLSearchParams(location.search);
    setLibrary(qs.get("shelf") !== "1");
    render();
    $("classCardIX").onclick = () => open("IX");
    $("classCardX").onclick = () => open("X");
    $("shelfBack").onclick = () => setLibrary(true);
    $("ldClose").onclick = close;
    $("ldBack").onclick = close;
    $("libDrawer").querySelectorAll("[data-lib-close]").forEach(n => n.onclick = close);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && $("libDrawer") && !$("libDrawer").hidden) close();
    });
  }
  return { install, render, open, close, setLibrary,
           get class() { return cls; },
           get library() { return $("worldHud") ? $("worldHud").classList.contains("library-mode") : false; } };
})();
window.EVLIB = EVLIB;

document.addEventListener("DOMContentLoaded", boot);
