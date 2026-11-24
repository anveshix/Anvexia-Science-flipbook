/* ==========================================================================
   Anvexia — Experience & Discovery Layer
   "Science, brought to life."
   Pillars:
     1. 2D Flipbooks           — Tactile hardcover illustrated flipbook (StPageFlip)
     2. 3D Models              — Synchronized bridge to shared Three.js r187 world
     3. Interactive Experiments — Temml native MathML formulas + Confetti/TWEEN feedback
     4. Hindi–English Learning — Instant bilingual MiniSearch + live EN/HI switching
     + Higher Classes Studio   — Class XI & XII PCM/PCB blueprints & bridge modules
   ========================================================================== */

const SCIVERSE = (function () {
  "use strict";

  const SUB_MAP = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "-", "ₙ": "n", "ₘ": "m", "ₓ": "x", "ₐ": "a", "ₑ": "e", "ₒ": "o" };
  const SUP_MAP = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-" };

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* ------------------------------------------------ 1. Temml MathML Engine */
  function asciiFormulaToLatex(raw) {
    let s = String(raw || "").trim();
    if (!s) return "";
    // Convert Unicode subscripts & superscripts into LaTeX _{...} and ^{...}
    s = s.replace(/[₀₁₂₃₄₅₆₇₈₉₊₋ₙₘₓₐₑₒ]+/g, m => "_{" + m.split("").map(c => SUB_MAP[c] || c).join("") + "}");
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, m => "^{" + m.split("").map(c => SUP_MAP[c] || c).join("") + "}");
    s = s
      .replace(/½/g, "\\frac{1}{2}")
      .replace(/¼/g, "\\frac{1}{4}")
      .replace(/¾/g, "\\frac{3}{4}")
      .replace(/⇌|↔/g, " \\rightleftharpoons ")
      .replace(/→/g, " \\rightarrow ")
      .replace(/↑/g, " \\uparrow ")
      .replace(/↓/g, " \\downarrow ")
      .replace(/×/g, " \\times ")
      .replace(/÷/g, " \\div ")
      .replace(/±/g, " \\pm ")
      .replace(/≤/g, " \\le ")
      .replace(/≥/g, " \\ge ")
      .replace(/≠/g, " \\ne ")
      .replace(/≈/g, " \\approx ")
      .replace(/∝/g, " \\propto ")
      .replace(/∞/g, "\\infty ")
      .replace(/Δ/g, "\\Delta ")
      .replace(/θ/g, "\\theta ")
      .replace(/λ/g, "\\lambda ")
      .replace(/μ/g, "\\mu ")
      .replace(/ρ/g, "\\rho ")
      .replace(/σ/g, "\\sigma ")
      .replace(/ω/g, "\\omega ")
      .replace(/Ω/g, "\\Omega ")
      .replace(/α/g, "\\alpha ")
      .replace(/β/g, "\\beta ")
      .replace(/γ/g, "\\gamma ")
      .replace(/π/g, "\\pi ")
      .replace(/·/g, " \\cdot ");
    // Convert clean numeric/variable fractions like 1/v, 1/u, 1/f, V/R, sin i / sin r
    s = s.replace(/\b(1|[A-Za-z0-9]+)\s*\/\s*([A-Za-z0-9]+)\b/g, "\\frac{$1}{$2}");
    return s;
  }

  /* A formula line mixes maths with words ("P = 1/f · f in metres, P in dioptres",
     "CH₄ mp 90 K · bp 111 K"). Typeset each " · " segment on its own: only a
     segment that is maths (an operator and no running words) goes to Temml;
     the rest stays upright text with proper sub/superscripts. */
  const MATH_WORDS = /^(sin|cos|tan|log|ln|exp|lim|max|min|mod)$/;
  function isMathSegment(seg) {
    if (!/[=+*/→⇌²³⁴₁₂₃₄ΔθρλΩ½∝×÷≈≤≥]/.test(seg)) return false;
    const words = seg.match(/\b[a-z]{2,}\b/g) || [];
    return !words.some(w => !MATH_WORDS.test(w));
  }
  function formatFormulaHtml(eq) {
    const raw = String(eq || "").trim();
    if (!raw) return "";
    if (raw.indexOf(" · ") > 0) return raw.split(" · ").map(formatFormulaHtml).join(' <span class="svf-fsep">·</span> ');
    if (/\b[a-z]{2,}\b/.test(raw) && !isMathSegment(raw) && !/^[A-Za-z][A-Za-z\s\-→↔,]*$/.test(raw)) {
      return esc(raw)
        .replace(/[₀₁₂₃₄₅₆₇₈₉₊₋ₙₘₓₐₑₒ]+/g, m => "<sub>" + m.split("").map(c => SUB_MAP[c] || c).join("") + "</sub>")
        .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, m => "<sup>" + m.split("").map(c => SUP_MAP[c] || c).join("") + "</sup>");
    }
    // Prose-heavy notes (4+ consecutive long English words without operators) stay crisp HTML
    const proseWords = (raw.match(/[A-Za-z]{5,}/g) || []).length;
    const hasMathOps = /[=+\-*/→⇌²³⁴₁₂₃₄ΔθρλΩ½]/.test(raw);
    /* a chain of words ("Cell → Tissue → Organ") is prose, not maths: keep it
       upright HTML so it wraps on narrow pages */
    const wordChain = /^[A-Za-z][A-Za-z\s\-→↔,]*$/.test(raw) && /→|↔/.test(raw);
    if (typeof window.temml !== "undefined" && hasMathOps && proseWords <= 5 && !wordChain) {
      try {
        const latex = asciiFormulaToLatex(raw);
        const out = window.temml.renderToString(latex, {
          displayMode: false,
          throwOnError: true,
          trust: false
        });
        if (!/ParseError|temml-error/.test(out)) return out;
      } catch (_err) {
        /* graceful fallback below */
      }
    }
    return esc(raw)
      .replace(/[₀₁₂₃₄₅₆₇₈₉₊₋ₙₘₓₐₑₒ]+/g, m => "<sub>" + m.split("").map(c => SUB_MAP[c] || c).join("") + "</sub>")
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, m => "<sup>" + m.split("").map(c => SUP_MAP[c] || c).join("") + "</sup>");
  }

  /* ------------------------------------- 2. TWEEN + Confetti Mastery Layer */
  let tweenLooping = false;
  function stepTweens(now) {
    if (typeof window.TWEEN === "undefined") { tweenLooping = false; return; }
    window.TWEEN.update(now);
    if (window.TWEEN.getAll && window.TWEEN.getAll().length > 0) {
      requestAnimationFrame(stepTweens);
    } else {
      tweenLooping = false;
    }
  }

  function animateScalePulse(el) {
    if (!el || reducedMotion() || typeof window.TWEEN === "undefined") return;
    const state = { s: 0.92 };
    new window.TWEEN.Tween(state)
      .to({ s: 1 }, 420)
      .easing(window.TWEEN.Easing.Back.Out)
      .onUpdate(() => { el.style.transform = `scale(${state.s.toFixed(3)})`; })
      .onComplete(() => { el.style.transform = ""; })
      .start();
    if (!tweenLooping) {
      tweenLooping = true;
      requestAnimationFrame(stepTweens);
    }
  }

  function celebrate(kind) {
    if (reducedMotion() || typeof window.confetti !== "function") return;
    try {
      const count = kind === "quiz" ? 85 : 52;
      window.confetti({
        particleCount: count,
        spread: kind === "quiz" ? 78 : 62,
        origin: { y: 0.68 },
        colors: ["#38e8ff", "#f7c96f", "#7ee0b8", "#8b5cf6", "#ff9b8a"],
        disableForReducedMotion: true,
        useWorker: false
      });
    } catch (_e) {}
  }

  /* ------------------------------ 3. Tactile 2D Flipbook (StPageFlip 2.0.7) */
  let flipInst = null;
  let flipWorld = null;
  let flipPlateIdx = {}; // spreadIndex -> current supplement image index
  /* Page parity (showCover:true pairs pages (1,2),(3,4),...): cover=0, contents=1,
     overview=2, then every NCERT section is ONE spread: concept on the left
     page (3+2i) and its 2D plate on the right page (4+2i). Back cover=3+2n. */
  const FIRST_SPREAD_PAGE = 3;
  const spreadPage = i => FIRST_SPREAD_PAGE + i * 2;
  const plateSrc = (wid, file) => EVPLATE_SRC(wid, file);
  /* Only realistic 2D plates are shown in the flipbook. The generated
     composite JPEGs are line diagrams; they are never offered as a page
     image, so the old diagram can never reappear through the ↻ cycle. */
  const plateFiles = (w, sp) => {
    const all = (typeof EVRASTER !== "undefined" && EVRASTER.filesFor) ? EVRASTER.filesFor(w.id, sp.section) : [];
    return all.filter(f => String(f).indexOf("rx/") === 0);
  };
  const decoded = new Map(); // src -> Promise, keeps decoded bitmaps warm for page turns
  function warmImage(src) {
    if (!src || decoded.has(src)) return decoded.get(src);
    const im = new Image();
    im.decoding = "async";
    im.src = src;
    const pr = (im.decode ? im.decode() : new Promise((ok, no) => { im.onload = ok; im.onerror = no; })).catch(() => {});
    decoded.set(src, pr);
    return pr;
  }
  function warmChapter(w, around) {
    /* decode the visible spread first, then neighbours, then the rest */
    const order = w.spreads.map((_, i) => i).sort((a, b) => Math.abs(a - around) - Math.abs(b - around));
    order.forEach(i => { const sp = w.spreads[i]; const f = plateFiles(w, sp)[flipPlateIdx[i] || 0]; warmImage(plateSrc(w.id, f)); });
  }

  function isFlipOpen() {
    const m = $("svFlipbookModal");
    return !!(m && !m.hidden);
  }

  function destroyFlipInstance() {
    const book = $("svFlipBook");
    if (book) {
      book.querySelectorAll(".svf-plate-host").forEach(h => {
        if (typeof EVLABEL !== "undefined") EVLABEL.destroy(h);
      });
    }
    if (flipInst) {
      try { flipInst.destroy(); } catch (_e) {}
      flipInst = null;
    }
    /* StPageFlip.destroy() REMOVES its root element. Hard-reset: always leave a
       fresh, empty #svFlipBook in the wrap so the next open can mount again. */
    const live = $("svFlipBook");
    if (live) { live.innerHTML = ""; if (live.style) live.style.cssText = ""; live.className = "sv-flip-book"; }
    else {
      const wrap = $("svFlipWrap");
      if (wrap) { const el = document.createElement("div"); el.id = "svFlipBook"; el.className = "sv-flip-book"; wrap.appendChild(el); }
    }
  }

  function stopFlipDragPropagation(root) {
    if (!root) return;
    root.querySelectorAll(".svf-interactive").forEach(el => {
      ["pointerdown", "mousedown", "touchstart"].forEach(evName => {
        el.addEventListener(evName, e => e.stopPropagation(), { passive: true });
      });
    });
    // Scrollable pages must accept touch/pointer gestures without starting a
    // page turn. The class is set later by fitting and can change after answers.
    root.querySelectorAll(".svf-page-inner").forEach(el => {
      ["pointerdown", "mousedown", "touchstart"].forEach(evName => {
        el.addEventListener(evName, e => { if (el.classList.contains("svf-scrollable")) e.stopPropagation(); }, { passive: true });
      });
    });
  }

  /* A click on a page corner must always turn the page, even when the page
     content is scrollable or a hotspot sits under the corner. StPageFlip's own
     click path is swallowed by scrollable pages, and its touch path only flips
     after a 250ms hold, so the corners get explicit, always-live targets.
     The handlers are delegated from the book because PageFlip clones pages for
     its turn animation and clones do not carry per-element listeners. */
  function addPageCorners(book) {
    if (!book) return;
    Array.from(book.querySelectorAll(".svf-page")).forEach((pg, i) => {
      if (pg.querySelector(".svf-corner")) return;
      /* Landscape: the whole left page turns back, the whole right page turns
         forward. Portrait shows one page, so the click position decides. */
      const back = pg.classList.contains("svf-back");
      const left = pg.classList.contains("svf-left-page");
      const right = pg.classList.contains("svf-right-page");
      const side = back || left ? "prev" : right ? "next" : (i % 2 ? "prev" : "next");
      ["tl", "tr", "bl", "br"].forEach(pos => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "svf-corner " + pos;
        btn.dataset.svfCorner = side;
        btn.tabIndex = -1;
        btn.setAttribute("aria-label", side === "next" ? BI("Next page", "अगला पृष्ठ") : BI("Previous page", "पिछला पृष्ठ"));
        pg.appendChild(btn);
      });
    });
    if (book.dataset.svfCorners === "1") return;
    book.dataset.svfCorners = "1";
    const cornerOf = e => (e.target && e.target.closest && e.target.closest(".svf-corner")) || null;
    ["pointerdown", "mousedown", "touchstart", "mousemove", "pointermove"].forEach(evName => {
      book.addEventListener(evName, e => { if (cornerOf(e)) e.stopPropagation(); }, { capture: true, passive: true });
    });
    book.addEventListener("click", e => {
      const btn = cornerOf(e);
      if (!btn || !flipInst || !flipWorld) return;
      e.preventDefault();
      e.stopPropagation();
      const p = flipInst.getCurrentPageIndex ? flipInst.getCurrentPageIndex() : 0;
      const total = flipWorld.spreads.length;
      const last = spreadPage(total);
      const portrait = !!(flipInst.getOrientation && flipInst.getOrientation() === "portrait");
      let side = btn.dataset.svfCorner;
      if (portrait) {
        const pg = btn.closest(".svf-page");
        const r = pg && pg.getBoundingClientRect();
        if (r) side = (e.clientX - r.left) < r.width / 2 ? "prev" : "next";
      }
      /* Ignore a corner click while a turn is already animating; PageFlip's
         state machine cannot start a second turn from mid-animation. */
      const state = flipInst.getState ? flipInst.getState() : "read";
      if (state === "flipping" || state === "user_fold") return;
      if (side === "next") {
        if (p >= last) return;
        if (portrait) { flipInst.flip(p + 1); updateFlipHud(p + 1); return; }
        if (p < FIRST_SPREAD_PAGE) { flipInst.flipNext(); return; }
        const target = Math.min(last, p + (p % 2 === 1 ? 2 : 1));
        if (target > p) { flipInst.flip(target); updateFlipHud(target); }
      } else {
        if (p <= 0) return;
        if (portrait) { flipInst.flip(p - 1); updateFlipHud(p - 1); return; }
        if (p <= FIRST_SPREAD_PAGE) return;
        const target = p % 2 === 0 ? p - 1 : p - 2;
        /* flipToPage() to the first spread leaves PageFlip folded; its own
           flipPrev() is the reliable way back to the start page. */
        if (target === FIRST_SPREAD_PAGE) { flipInst.flipPrev(); updateFlipHud(FIRST_SPREAD_PAGE); }
        else { flipInst.flip(target); updateFlipHud(target); }
      }
    }, { capture: true });
  }

  function currentFlipSpreadIndex(pageIndex) {
    if (!flipInst || !flipWorld) return 0;
    const p = typeof pageIndex === "number" ? pageIndex : (flipInst.getCurrentPageIndex ? flipInst.getCurrentPageIndex() : 0);
    if (p < FIRST_SPREAD_PAGE) return 0;
    const idx = Math.floor((p - FIRST_SPREAD_PAGE) / 2);
    return Math.max(0, Math.min(flipWorld.spreads.length - 1, idx));
  }

  function updateFlipHud(pageIndex) {
    if (!flipWorld) return;
    const total = flipWorld.spreads.length;
    const p = typeof pageIndex === "number" ? pageIndex : (flipInst && flipInst.getCurrentPageIndex ? flipInst.getCurrentPageIndex() : 0);
    const counter = $("svFlipCounter");
    if (counter) {
      if (p < FIRST_SPREAD_PAGE) {
        counter.textContent = BI("Cover & Contents", "मुखपृष्ठ व सूची") + ` · ${total} ${BI("spreads", "स्प्रेड")}`;
      } else if (p >= spreadPage(total)) {
        counter.textContent = BI("Chapter Summary", "अध्याय सारांश");
      } else {
        const sIdx = currentFlipSpreadIndex(p);
        const sp = flipWorld.spreads[sIdx];
        counter.textContent = `${sp.section} · ${BI("Spread", "स्प्रेड")} ${sIdx + 1} / ${total}`;
      }
    }
    const activeIdx = p < FIRST_SPREAD_PAGE ? -1 : (p >= spreadPage(total) ? total : currentFlipSpreadIndex(p));
    const dots = $("svFlipDots");
    if (dots) {
      dots.querySelectorAll("[data-svf-jump]").forEach(btn => {
        const j = +btn.dataset.svfJump;
        btn.classList.toggle("on", j === activeIdx);
      });
    }
  }

  function mountPlateLabels(root, w) {
    if (!root || typeof EVLABEL === "undefined" || typeof EVRASTER === "undefined") return;
    root.querySelectorAll(".svf-plate-host[data-svf-sp]").forEach(host => {
      const sIdx = +host.dataset.svfSp;
      const sp = w.spreads[sIdx];
      if (!sp) return;
      const files = plateFiles(w, sp);
      const fIdx = flipPlateIdx[sIdx] || 0;
      const file = files[fIdx];
      if (file) {
        EVLABEL.render(host, EVPLATE_KEY(w.id, file));
      }
    });
  }

  function buildFlipbookPagesHtml(w) {
    const subjLabel = w.subject === "phy" ? BI("Physics", "भौतिक विज्ञान")
      : w.subject === "chem" ? BI("Chemistry", "रसायन विज्ञान")
      : BI("Biology", "जीव विज्ञान");
    const stamps = stampsFor(w);
    const heroFile = w.spreads.length ? plateFiles(w, w.spreads[0])[0] : "";
    const heroSrc = plateSrc(w.id, heroFile);
    const tocItems = w.spreads.map((sp, i) => {
      const stamped = (EV.progress[pkey(w, sp)] || {}).stamped;
      return `<button type="button" class="svf-toc-row svf-interactive" data-svf-goto="${i}">
        <span class="svf-toc-sec">${esc(sp.section)}</span>
        <span class="svf-toc-ttl">${EV.lang === "both" ? BX(sp.title, sp.titleHi) : esc(BI(sp.title, sp.titleHi))}</span>
        <span class="svf-toc-st">${stamped ? "★" : "→"}</span>
      </button>`;
    }).join("");

    // Page 0: Hard Front Cover
    let pages = `
      <div class="svf-page svf-cover svf-hard" data-density="hard">
        <div class="svf-cover-inner">
          <div class="svf-cover-kicker">ANVEXIA · ${esc(BI("CLASS", "कक्षा"))} ${esc(w.cls || "X")} · ${esc(subjLabel.toUpperCase())}</div>
          <div class="svf-cover-ornament" aria-hidden="true">⚛</div>
          <h2 class="svf-cover-title">${EV.lang === "both" ? BX(w.title, w.titleHi) : esc(BI(w.title, w.titleHi))}</h2>
          <p class="svf-cover-tag">${esc(BI("Science, brought to life.", "विज्ञान को जीवंत देखिए।"))}</p>
          <div class="svf-cover-pills">
            <span>${w.spreads.length} ${esc(BI("Illustrated Spreads", "सचित्र स्प्रेड"))}</span>
            <span>★ ${stamps}/${w.spreads.length} ${esc(BI("Stamped", "पूर्ण"))}</span>
          </div>
          <div class="svf-cover-foot">${esc(BI("Peel corner or click Next → to open flipbook", "पन्ना पलटने के लिए कोना खींचें या आगे दबाएँ →"))}</div>
        </div>
      </div>
      <div class="svf-page svf-toc-page">
        <div class="svf-page-inner">
          <div class="svf-phead"><span>${esc(BI("Contents", "विषय-सूची"))}</span><span>${w.spreads.length} ${esc(BI("sections", "खंड"))}</span></div>
          <div class="svf-toc-list">${tocItems}</div>
        </div>
      </div>
      <div class="svf-page svf-overview-page">
        <div class="svf-page-inner">
          <div class="svf-phead"><span>${esc(BI("Chapter overview", "अध्याय परिचय"))}</span><span>${esc(subjLabel)}</span></div>
          ${heroSrc ? `<figure class="svf-hero"><img src="${heroSrc}" alt="${esc(BI(w.title, w.titleHi))}" decoding="async" draggable="false"></figure>` : ""}
          <h3 class="svf-title">${EV.lang === "both" ? BX(w.title, w.titleHi) : esc(BI(w.title, w.titleHi))}</h3>
          <p class="svf-concept">${esc(BI("Each spread pairs one NCERT section (left) with its illustrated 2D plate (right). Tap labels on a plate for bilingual notes, predict, then turn the page.", "हर स्प्रेड में बाईं ओर NCERT खंड और दाईं ओर उसका 2D चित्र है। द्विभाषी नोट्स के लिए लेबल दबाएँ, अनुमान लगाएँ, फिर पन्ना पलटें।"))}</p>
          <div class="svf-pnum">2</div>
        </div>
      </div>`;

    // Spreads: 2 pages per NCERT section (Left = Bilingual Concept/Formula/Predict, Right = 2D Plate + Hotspots)
    w.spreads.forEach((sp, i) => {
      const pg = pget(w, sp);
      const pr = P(sp), raw = sp.predict || { q: "", options: [], a: 0 }, rawHi = sp.predictHi;
      const files = plateFiles(w, sp);
      const curIdx = Math.min(files.length - 1, Math.max(0, flipPlateIdx[i] || 0));
      const curFile = files[curIdx] || "";
      const imgSrc = plateSrc(w.id, curFile);

      const formulaHtml = sp.formula
        ? `<div class="svf-formula">
             <span class="svf-flabel">${esc(sp.formula.label)}</span>
             <div class="svf-feq">${formatFormulaHtml(sp.formula.eq)}</div>
             ${sp.formula.note ? `<small>${esc(sp.formula.note)}</small>` : ""}
           </div>`
        : "";

      /* Key terms: a definition that is only a clipped copy of the concept
         sentence adds noise, so such terms are shown without it. */
      const rawV = sp.vocab || [], rawVHi = sp.vocabHi || [];
      const conceptAll = (sp.concept || "") + " " + (sp.conceptHi || "");
      const isEcho = d => { const k = String(d || "").trim().replace(/[.……]+$/, ""); return !k || (k.length > 12 && conceptAll.indexOf(k.slice(0, Math.min(40, k.length))) >= 0); };
      const termsHtml = VOC(sp).slice(0, 4).map((v, vi) => {
        const term = EV.lang === "both" && rawVHi[vi] ? BX(rawV[vi] && rawV[vi][0], rawVHi[vi][0]) : esc(v[0]);
        const def = isEcho(rawV[vi] && rawV[vi][1]) ? "" : esc(v[1]);
        return `<div class="svf-term"><dt>${term}</dt>${def ? `<dd>${def}</dd>` : ""}</div>`;
      }).join("");
      const fig = `${esc(BI("Figure", "चित्र"))} ${esc(sp.section)}`;

      const optsHtml = (pr.options || []).map((o, oi) => {
        let cls = "svf-opt svf-interactive";
        if (pg.locked) cls += oi === pr.a ? " correct" : (oi === pg.answer ? " wrong" : " dim");
        else if (pg.answer === oi) cls += " picked";
        const lbl = EV.lang === "both" && rawHi && rawHi.options ? BX(raw.options[oi], rawHi.options[oi]) : esc(o);
        return `<button type="button" class="${cls}" data-svf-sp="${i}" data-svf-opt="${oi}" ${pg.locked ? "disabled" : ""}><b>${String.fromCharCode(65 + oi)}</b><span>${lbl}</span></button>`;
      }).join("");

      pages += `
      <div class="svf-page svf-left-page" data-spread="${i}">
        <div class="svf-page-inner">
          <div class="svf-phead">
            <span class="svf-sec">${esc(sp.section)}</span>
            <span class="svf-stamp ${pg.stamped ? "earned" : ""}">${pg.stamped ? "★ " + esc(t("stamp")) : esc(BI("Section", "खंड")) + " " + (i + 1) + " / " + w.spreads.length}</span>
          </div>
          <h3 class="svf-title">${EV.lang === "both" ? BX(sp.title, sp.titleHi) : esc(BI(sp.title, sp.titleHi))}</h3>
          <p class="svf-concept">${EV.lang === "both" ? BX(sp.concept, sp.conceptHi) : esc(BI(sp.concept, sp.conceptHi))}</p>
          ${formulaHtml}
          <div class="svf-predict" data-svf-predict="${i}">
            <div class="svf-pq"><span class="svf-pq-tag">${esc(t("predict"))}</span>${EV.lang === "both" && rawHi ? BX(raw.q, rawHi.q) : esc(pr.q)}</div>
            <div class="svf-popts">${optsHtml}</div>
            ${pg.locked ? `<div class="svf-explain">${EV.lang === "both" ? BX(sp.explain, sp.explainHi) : esc(BI(sp.explain, sp.explainHi))}</div>` : ""}
          </div>
          <div class="svf-pnum">${spreadPage(i)}</div>
        </div>
      </div>
      <div class="svf-page svf-right-page" data-spread="${i}">
        <div class="svf-page-inner">
          <div class="svf-phead">
            <span class="svf-sec">${fig}</span>
            ${files.length > 1 ? `<button type="button" class="svf-cycle svf-interactive" data-svf-cycle="${i}" aria-label="${esc(BI("Next illustration", "अगला चित्र"))}">${curIdx + 1} / ${files.length} ↻</button>` : ""}
          </div>
          ${imgSrc ? `
            <figure class="svf-plate-wrap svf-interactive">
              <div class="svf-plate-host" data-svf-sp="${i}">
                <img src="${imgSrc}" alt="${esc(BI(sp.title, sp.titleHi))}" decoding="async" draggable="false" width="1408" height="768">
              </div>
              <figcaption class="svf-caption">
                <span class="svf-caption-text"><b>${fig}</b> ${EV.lang === "both" ? BX(sp.title, sp.titleHi) : esc(BI(sp.title, sp.titleHi))}</span>
                <button type="button" class="svf-zoom svf-interactive" data-svf-zoom="${i}">${esc(BI("Enlarge", "बड़ा करें"))}</button>
              </figcaption>
            </figure>
          ` : `
            <div class="svf-plate-fallback">
              <p>${esc(BI("The illustration for this section is not available yet. Read the concept on the facing page.", "इस खंड का चित्र अभी उपलब्ध नहीं है। सामने के पृष्ठ पर अवधारणा पढ़ें।"))}</p>
            </div>
          `}
          ${termsHtml ? `<dl class="svf-terms"><div class="svf-terms-h">${esc(BI("Key terms", "मुख्य शब्द"))}</div>${termsHtml}</dl>` : ""}
          <div class="svf-pnum">${spreadPage(i) + 1}</div>
        </div>
      </div>`;
    });

    // Hard Back Cover
    pages += `
      <div class="svf-page svf-cover svf-back svf-hard" data-density="hard">
        <div class="svf-cover-inner">
          <div class="svf-cover-kicker">ANVEXIA · CHAPTER COMPLETE</div>
          <h2 class="svf-cover-title">${esc(BI("Ready to Test Your Mastery?", "अपनी समझ जाँचने के लिए तैयार?"))}</h2>
          <p class="svf-cover-tag">★ ${stamps} / ${w.spreads.length} ${esc(BI("Discovery Stamps Earned", "डिस्कवरी स्टैम्प अर्जित"))}</p>
          <div class="svf-back-actions svf-interactive">
            <button type="button" class="btn primary" id="svfStartQuiz">${esc(BI("Take Chapter Quiz →", "अध्याय प्रश्नोत्तरी दें →"))}</button>
          </div>
        </div>
      </div>`;
    return pages;
  }

  function populateFlipChapterSelect(activeId) {
    const sel = $("svFlipChapter");
    if (!sel || typeof CATALOGUE_ALL === "undefined") return;
    sel.innerHTML = CATALOGUE_ALL.map(c =>
      `<option value="${esc(c.id)}" ${c.id === activeId ? "selected" : ""}>[${esc(c.cls)}] ${esc(BI(c.title, c.hi))}</option>`
    ).join("");
    if (flipWorld && !CATALOGUE_ALL.some(c => c.id === flipWorld.id)) {
      sel.insertAdjacentHTML("afterbegin", `<option value="${esc(flipWorld.id)}" selected>[${esc(flipWorld.cls || "XI")}] ${esc(BI(flipWorld.title, flipWorld.titleHi))}</option>`);
    }
  }

  function wireFlipInnerActions(book, w) {
    stopFlipDragPropagation(book);
    mountPlateLabels(book, w);

    book.querySelectorAll("[data-svf-goto]").forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        const sIdx = +btn.dataset.svfGoto;
        if (flipInst) flipInst.flip(spreadPage(sIdx));
      };
    });

    book.querySelectorAll("[data-svf-opt]").forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        const sIdx = +btn.dataset.svfSp;
        const optIdx = +btn.dataset.svfOpt;
        const sp = w.spreads[sIdx];
        if (!sp) return;
        const pg = pget(w, sp);
        if (pg.locked) return;
        pg.answer = optIdx;
        pg.locked = true;
        pg.flap = true;
        saveProgress();
        if (EV.world && EV.world.id === w.id && WORLD.index === sIdx) {
          renderLesson(); renderMeters();
        }
        const ok = optIdx === P(sp).a;
        /* update in place: never rebuild the book (no flicker, no page reset) */
        const box = book.querySelector(`[data-svf-predict="${sIdx}"]`);
        if (box) {
          box.querySelectorAll("[data-svf-opt]").forEach(b => {
            const oi = +b.dataset.svfOpt;
            b.classList.remove("picked");
            b.classList.add(oi === P(sp).a ? "correct" : (oi === optIdx ? "wrong" : "dim"));
            b.disabled = true;
          });
          if (!box.querySelector(".svf-explain")) {
            box.insertAdjacentHTML("beforeend", `<div class="svf-explain">${EV.lang === "both" ? BX(sp.explain, sp.explainHi) : esc(BI(sp.explain, sp.explainHi))}</div>`);
          }
          fitLive(box.closest(".svf-page"));
        }
        if (ok) celebrate("stamp");
        toast(ok ? BI("Correct prediction! Study the plate to confirm why.", "सही अनुमान! कारण समझने के लिए चित्र देखें।")
                 : BI("Prediction locked — read the explanation below.", "अनुमान दर्ज — नीचे स्पष्टीकरण पढ़ें।"), "ok");
      };
    });

    book.querySelectorAll("[data-svf-cycle]").forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        const sIdx = +btn.dataset.svfCycle;
        const sp = w.spreads[sIdx];
        const files = plateFiles(w, sp);
        if (files.length > 1) {
          const n = ((flipPlateIdx[sIdx] || 0) + 1) % files.length;
          flipPlateIdx[sIdx] = n;
          const host = book.querySelector(`.svf-plate-host[data-svf-sp="${sIdx}"]`);
          const img = host && host.querySelector("img");
          const src = plateSrc(w.id, files[n]);
          btn.textContent = `${n + 1} / ${files.length} ↻`;
          if (img && host) {
            Promise.resolve(warmImage(src)).then(() => {
              if ((flipPlateIdx[sIdx] || 0) !== n) return;
              if (typeof EVLABEL !== "undefined") EVLABEL.destroy(host);
              img.src = src;
              if (typeof EVLABEL !== "undefined") EVLABEL.render(host, EVPLATE_KEY(w.id, files[n]));
            });
          }
        }
      };
    });

    book.querySelectorAll("[data-svf-zoom]").forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        const sIdx = +btn.dataset.svfZoom;
        const sp = w.spreads[sIdx];
        const host = book.querySelector(`.svf-plate-host[data-svf-sp="${sIdx}"]`);
        const img = host && host.querySelector("img");
        const files = plateFiles(w, sp);
        const file = files[flipPlateIdx[sIdx] || 0];
        if (img && typeof EVZOOM !== "undefined" && EVZOOM.openImg) {
          EVZOOM.openImg(img.src, BI(sp.title, sp.titleHi), file ? EVPLATE_KEY(w.id, file) : "");
        } else if (img) {
          window.open(img.src, "_blank", "noopener");
        }
      };
    });

    const qBtn = $("svfStartQuiz");
    if (qBtn) qBtn.onclick = e => {
      e.stopPropagation();
      closeFlipbook();
      EV.world = w;
      setView("quiz");
    };
    /* a missing plate degrades to a text panel instead of a broken image */
    book.querySelectorAll(".svf-plate-host img, .svf-hero img").forEach(img => {
      img.addEventListener("error", () => {
        const wrap = img.closest(".svf-plate-wrap, .svf-hero");
        if (wrap) wrap.classList.add("svf-missing");
      }, { once: true });
    });
  }

  /* Prefer fitting, but never hide content that still exceeds the minimum font
     scale. Such pages become keyboard- and touch-scrollable instead. */
  function setPageScrollable(inner, on) {
    if (!inner) return;
    inner.classList.toggle("svf-scrollable", on);
    if (on) {
      inner.setAttribute("tabindex", "0");
      inner.setAttribute("role", "region");
      inner.setAttribute("aria-label", BI("Scrollable page. Scroll to read more.", "स्क्रॉल करने योग्य पृष्ठ। और पढ़ने के लिए नीचे स्क्रॉल करें।"));
    } else {
      inner.removeAttribute("tabindex");
      inner.removeAttribute("role");
      inner.removeAttribute("aria-label");
    }
  }

  function fitPages(book) {
    if (!flipInst || typeof document === "undefined" || !document.body || !document.body.appendChild) return true;
    let r = null;
    try { r = flipInst.getBoundsRect && flipInst.getBoundsRect(); } catch (_e) {}
    const shown = Array.from(book.querySelectorAll(".svf-page")).find(x => x.offsetWidth && x.offsetHeight);
    const pw = (shown && shown.offsetWidth) || (r && r.pageWidth);
    const ph = (shown && shown.offsetHeight) || (r && r.height);
    if (!pw || !ph) return false;
    const box = document.createElement("div");
    box.className = "sv-flip-book svf-measure";
    box.style.cssText = "position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none;width:" + pw + "px";
    document.body.appendChild(box);
    book.querySelectorAll(".svf-page").forEach(pg => {
      if (pg.classList.contains("svf-cover")) return;
      const c = pg.cloneNode(true);
      c.style.cssText = "display:block;position:relative;width:" + pw + "px;height:" + ph + "px";
      box.appendChild(c);
      const inner = c.querySelector(".svf-page-inner");
      let fs = 1;
      while (inner && fs > 0.72 && (inner.scrollHeight > inner.clientHeight + 1 || inner.scrollWidth > inner.clientWidth + 1)) {
        fs = Math.round((fs - 0.04) * 100) / 100;
        inner.style.setProperty("--fs", fs);
      }
      /* on the inner element: StPageFlip rewrites the page's own style attribute */
      const live = pg.querySelector(".svf-page-inner");
      if (live) {
        live.style.setProperty("--fs", fs);
        setPageScrollable(live, !!inner && inner.scrollHeight > inner.clientHeight + 1);
      }
      c.remove();
    });
    box.remove();
    return true;
  }

  function fitLive(pg) {
    const inner = pg && pg.querySelector(".svf-page-inner");
    if (!inner || !inner.clientHeight) return;
    let fs = parseFloat(inner.style.getPropertyValue("--fs")) || 1;
    while (fs > 0.72 && (inner.scrollHeight > inner.clientHeight + 1 || inner.scrollWidth > inner.clientWidth + 1)) {
      fs = Math.round((fs - 0.04) * 100) / 100;
      inner.style.setProperty("--fs", fs);
    }
    setPageScrollable(inner, inner.scrollHeight > inner.clientHeight + 1);
  }

  function openFlipbook(chapterId, spreadIdx, customWorld) {
    const modal = $("svFlipbookModal"), wrap = $("svFlipWrap");
    let book = $("svFlipBook");
    if (!modal || !wrap) return;
    if (!book) { destroyFlipInstance(); book = $("svFlipBook"); }

    const w = customWorld || (chapterId ? getWorld(chapterId) : (EV.world || getWorld("c10_carbon")));
    // A fresh open always starts on the realistic 2D plate (index 0). Only a
    // rebuild while the book is already open (language switch, resize) keeps
    // the current illustration cycle; never carry an index across chapters.
    if (!isFlipOpen() || (flipWorld && flipWorld.id !== w.id)) flipPlateIdx = {};
    flipWorld = w;
    const targetSpread = typeof spreadIdx === "number" ? Math.max(0, Math.min(w.spreads.length - 1, spreadIdx))
      : (EV.world && EV.world.id === w.id ? (WORLD.index || 0) : 0);

    modal.hidden = false;
    destroyFlipInstance();
    book = $("svFlipBook");
    populateFlipChapterSelect(w.id);
    book.innerHTML = buildFlipbookPagesHtml(w);
    addPageCorners(book);

    const dots = $("svFlipDots");
    if (dots) {
      dots.innerHTML = `<button type="button" class="pdot" data-svf-jump="-1" title="Cover">C</button>` +
        w.spreads.map((s, idx) => {
          const st = (EV.progress[pkey(w, s)] || {}).stamped ? "stamped" : "";
          return `<button type="button" class="pdot ${st}" data-svf-jump="${idx}" title="${esc(s.section)} ${esc(s.title)}">${idx + 1}</button>`;
        }).join("");
      dots.querySelectorAll("[data-svf-jump]").forEach(b => {
        b.onclick = () => {
          const j = +b.dataset.svfJump;
          if (!flipInst) return;
          flipInst.flip(j < 0 ? 0 : spreadPage(j));
        };
      });
    }

    const startPage = typeof spreadIdx === "number" || (EV.world && EV.world.id === w.id) ? spreadPage(targetSpread) : 0;
    warmChapter(w, targetSpread);
    const rect = wrap.getBoundingClientRect();
    const availW = Math.max(320, rect.width || (window.innerWidth - 12));
    const availH = Math.max(360, rect.height || (window.innerHeight - 96));
    const portrait = availW < 900 || availW / availH < 1.15;
    const pageW = portrait ? Math.max(300, Math.floor(availW - 8)) : Math.max(360, Math.floor((availW - 12) / 2));
    const pageH = Math.max(360, Math.floor(availH - 6));

    const pageEls = book.querySelectorAll(".svf-page");
    if (typeof window.PageFlip === "function" && pageEls.length > 0) {
      flipInst = new window.PageFlip(book, {
        width: pageW,
        height: pageH,
        size: "stretch",
        minWidth: portrait ? pageW : 280,   /* StPageFlip goes single-page only below 2×minWidth */
        maxWidth: 2600,
        minHeight: 340,
        maxHeight: 1900,
        maxShadowOpacity: 0.42,
        showCover: true,
        usePortrait: portrait,
        mobileScrollSupport: false,
        startPage: startPage,
        flippingTime: reducedMotion() ? 90 : 540
      });
      /* fit once the book has real page sizes (StPageFlip lays out asynchronously) */
      const inst = flipInst;
      let tries = 0;
      const fitWhenReady = () => {
        if (flipInst !== inst) return;               /* book was rebuilt meanwhile */
        if (!fitPages(book) && ++tries < 30) requestAnimationFrame(fitWhenReady);
      };
      flipInst.loadFromHTML(pageEls);
      requestAnimationFrame(fitWhenReady);
      flipInst.on("flip", e => {
        const p = e && typeof e.data === "number" ? e.data : undefined;
        updateFlipHud(p);
        const sIdx = currentFlipSpreadIndex(p);
        warmChapter(w, sIdx);
        try { localStorage.setItem("sciverse-flip-pos-v1", JSON.stringify({ id: w.id, s: sIdx })); } catch (_e) {}
        if (window.EV_2D_ONLY) { if (EV.world && EV.world.id === w.id) EV.flipSpread = sIdx; return; }
        if (EV.world && EV.world.id === w.id && EV.view === "book") {
          WORLD.jumpTo(sIdx);
          renderLesson(); renderMeters(); renderPageBar();
        }
      });
    }

    wireFlipInnerActions(book, w);
    updateFlipHud();
    animateScalePulse(modal.querySelector(".sv-flip-shell"));
  }

  function closeFlipbook() {
    const modal = $("svFlipbookModal");
    if (!modal || modal.hidden) return;
    destroyFlipInstance();
    modal.hidden = true;
  }

  /* ---------------------- 4. Instant Bilingual Search (MiniSearch 7.2.0) */
  let searchEngine = null;
  let allDocs = [];
  let activeFilter = "all";
  let selectedHitIdx = 0;
  let currentHits = [];

  function ensureSearchIndex() {
    if (searchEngine || typeof window.MiniSearch !== "function") return;
    const tokenize = str => String(str || "")
      .toLowerCase()
      .split(/[\s,.;:!?()[\]{}"'\/\\·—–\-+<>|=]+/)
      .filter(Boolean);

    searchEngine = new window.MiniSearch({
      fields: ["title", "titleHi", "concept", "conceptHi", "formula", "vocab", "chapterTitle", "chapterHi", "section"],
      storeFields: ["chapterId", "spreadIdx", "section", "title", "titleHi", "chapterTitle", "chapterHi", "cls", "subject", "formula"],
      tokenize,
      searchOptions: {
        boost: { title: 3.5, titleHi: 3.5, formula: 2.6, vocab: 2.2, concept: 1.4, conceptHi: 1.4, chapterTitle: 1.2 },
        prefix: true,
        fuzzy: 0.2
      }
    });

    allDocs = [];
    const catList = typeof CATALOGUE_ALL !== "undefined" ? CATALOGUE_ALL : CATALOGUE;
    catList.forEach(c => {
      const spreads = (typeof WORLDS !== "undefined" && WORLDS[c.id]) || [];
      spreads.forEach((sp, sIdx) => {
        const doc = {
          id: `${c.id}__${sIdx}`,
          chapterId: c.id,
          spreadIdx: sIdx,
          cls: c.cls,
          subject: c.subject,
          chapterTitle: c.title || "",
          chapterHi: c.hi || "",
          section: sp.section || String(sIdx + 1),
          title: sp.title || "",
          titleHi: sp.titleHi || "",
          concept: sp.concept || "",
          conceptHi: sp.conceptHi || "",
          formula: sp.formula ? `${sp.formula.label || ""} ${sp.formula.eq || ""}` : "",
          vocab: (sp.vocab || []).map(v => v.join(" ")).join(" ") + " " + ((sp.vocabHi || []).map(v => v.join(" ")).join(" "))
        };
        allDocs.push(doc);
      });
    });
    searchEngine.addAll(allDocs);
  }

  function renderSearchResults() {
    ensureSearchIndex();
    const inp = $("svSearchInput"), box = $("svSearchResults");
    if (!box) return;
    const q = inp ? inp.value.trim() : "";
    let list = q && searchEngine ? searchEngine.search(q) : allDocs.slice(0, 40);
    if (activeFilter !== "all") {
      list = list.filter(d => d.cls === activeFilter || d.subject === activeFilter);
    }
    currentHits = list.slice(0, 32);
    if (selectedHitIdx >= currentHits.length) selectedHitIdx = 0;

    if (!currentHits.length) {
      box.innerHTML = `<div class="sv-search-empty">${esc(BI("No matching concepts found. Try English or हिंदी keywords (e.g., lens, कोशिका, Ohm, कार्बन, Bohr).", "कोई परिणाम नहीं मिला। अंग्रेज़ी या हिंदी शब्द लिखें (जैसे lens, कोशिका, Ohm, कार्बन)।"))}</div>`;
      return;
    }

    const subjBadge = s => s === "phy" ? "Physics · भौतिकी" : s === "chem" ? "Chemistry · रसायन" : "Biology · जीव";
    box.innerHTML = currentHits.map((h, idx) => {
      const files = (typeof EVRASTER !== "undefined" && EVRASTER.filesFor) ? EVRASTER.filesFor(h.chapterId, h.section).filter(f => String(f).indexOf("rx/") === 0) : [];
      const thumb = files.length ? EVPLATE_SRC(h.chapterId, files[0]) : "";
      return `
      <div class="sv-hit ${idx === selectedHitIdx ? "sel" : ""}" data-hit-idx="${idx}">
        ${thumb ? `<img class="sv-hit-thumb" src="${esc(thumb)}" alt="" loading="lazy" data-hit-3d="${idx}">` : ""}
        <div class="sv-hit-main" data-hit-3d="${idx}">
          <div class="sv-hit-meta">
            <span class="sv-hit-cls">Class ${esc(h.cls)}</span>
            <span class="sv-hit-subj ${esc(h.subject)}">${esc(subjBadge(h.subject))}</span>
            <span class="sv-hit-ch" data-section="${esc(h.section)}">${esc(BI(h.chapterTitle, h.chapterHi))} · ${esc(h.section)}</span>
          </div>
          <div class="sv-hit-title">${EV.lang === "both" ? BX(h.title, h.titleHi) : esc(BI(h.title, h.titleHi))}</div>
          ${h.formula ? `<div class="sv-hit-eq">${esc(h.formula)}</div>` : ""}
        </div>
        <div class="sv-hit-btns">
          <button type="button" class="btn ghost tiny" data-hit-2d="${idx}" title="Open in 2D Flipbook">2D</button>
          <button type="button" class="btn primary tiny" data-hit-3d="${idx}" title="Open in Book">Open</button>
        </div>
      </div>
    `;}).join("");

    box.querySelectorAll("[data-hit-3d]").forEach(el => {
      el.onclick = () => activateSearchHit(+el.getAttribute("data-hit-3d"), false);
    });
    box.querySelectorAll("[data-hit-2d]").forEach(el => {
      el.onclick = e => { e.stopPropagation(); activateSearchHit(+el.getAttribute("data-hit-2d"), true); };
    });
  }

  function activateSearchHit(idx, asFlipbook) {
    const h = currentHits[idx];
    if (!h) return;
    closeSearch();
    if (asFlipbook || window.EV_2D_ONLY) {
      openFlipbook(h.chapterId, h.spreadIdx);
    } else {
      openChapter(h.chapterId);
      WORLD.jumpTo(h.spreadIdx);
      renderLesson(); renderMeters(); renderPageBar(); renderSectionSelect();
    }
  }

  function openSearch(prefill) {
    const modal = $("svSearchModal"), inp = $("svSearchInput");
    if (!modal) return;
    closeFlipbook();
    modal.hidden = false;
    selectedHitIdx = 0;
    if (inp) {
      if (typeof prefill === "string") inp.value = prefill;
      inp.placeholder = BI("Search 266 concepts, formulas, experiments in English or हिंदी…", "अंग्रेज़ी या हिंदी में 266 अवधारणाएँ, सूत्र, प्रयोग खोजें…");
      setTimeout(() => inp.focus(), 20);
    }
    renderSearchResults();
  }

  function closeSearch() {
    const modal = $("svSearchModal");
    if (modal) modal.hidden = true;
  }

  /* -------------- 5. Higher Classes Expansion Studio (Class XI & XII) */
  const HIGHER_BLUEPRINTS = [
    {
      id: "c11_phy_mechanics",
      cls: "XI",
      subject: "phy",
      title: "Laws of Motion, Work-Energy & Rotational Equilibrium",
      hi: "गति के नियम, कार्य-ऊर्जा एवं घूर्णी संतुलन",
      text: `Laws of Motion and Work-Energy Theorem (NCERT Class XI Physics)

Newton's second law states that the net external force acting on a body equals the rate of change of linear momentum, F = dp/dt = m a. Impulse J = F Δt equals the change in momentum during collisions.

Friction on an inclined plane resolves weight mg into mg sin θ parallel to the incline and mg cos θ normal to the surface. Static friction prevents relative motion up to μs N while kinetic friction opposes sliding.

Work-Energy Theorem states that work done by the net force equals change in kinetic energy: W = ΔK = ½mv² - ½mu². Potential energy stored in an elastic spring obeys U = ½kx² where k is the spring constant.

Conservation of Mechanical Energy and Power: In conservative force fields, total mechanical energy E = K + U remains constant. Instantaneous mechanical power delivered by a force is P = F · v.`
    },
    {
      id: "c11_chem_bonding",
      cls: "XI",
      subject: "chem",
      title: "Chemical Bonding, VSEPR Geometry & Thermodynamics",
      hi: "रासायनिक आबंधन, VSEPR ज्यामिति एवं ऊष्मागतिकी",
      text: `Chemical Bonding and Molecular Structure (NCERT Class XI Chemistry)

Covalent bonding and VSEPR theory predict 3D molecular geometry from electron-pair repulsion: linear BeCl2 (180°), trigonal planar BF3 (120°), tetrahedral CH4 (109.5°), and pyramidal NH3 (107°).

Hybridisation mixes atomic orbitals into equivalent sp, sp2, and sp3 hybrid orbitals. Sigma bonds form by head-on overlap along the internuclear axis while pi bonds arise from lateral p-orbital overlap.

Chemical Thermodynamics and Enthalpy: The first law of thermodynamics states ΔU = q + w. Exothermic reactions release heat (ΔH < 0) while endothermic reactions absorb thermal energy (ΔH > 0).

Gibbs Free Energy and Chemical Equilibrium: Spontaneity is governed by ΔG = ΔH - TΔS. A reaction is spontaneous when ΔG < 0 and reaches dynamic equilibrium when ΔG = 0.`
    },
    {
      id: "c11_bio_cellcycle",
      cls: "XI",
      subject: "bio",
      title: "Cell Cycle, Mitosis, Biomolecules & Enzyme Kinetics",
      hi: "कोशिका चक्र, समसूत्री विभाजन, जैव-अणु एवं एंज़ाइम गतिकी",
      text: `Cell Cycle, Cell Division and Biomolecules (NCERT Class XI Biology)

Eukaryotic cell cycle progresses through Interphase (G1 growth, S phase DNA replication doubling DNA from 2C to 4C, and G2 preparation) followed by M phase mitosis and cytokinesis.

Mitosis stages — Prophase, Metaphase, Anaphase, and Telophase — align chromosomes on the equatorial metaphase plate and segregate sister chromatids equally to preserve chromosome number.

Biomolecules and Enzyme Catalysis: Enzymes are biological protein catalysts that lower activation energy Ea by forming a transient enzyme-substrate complex ES → E + P.

Factors Affecting Enzyme Activity: Reaction velocity rises with substrate concentration up to Vmax saturation (Michaelis-Menten kinetics) and exhibits optimal temperature and pH sensitivity.`
    },
    {
      id: "c12_phy_optics_em",
      cls: "XII",
      subject: "phy",
      title: "Electrostatics, Kirchhoff Circuits & Wave-Ray Optics",
      hi: "स्थिरवैद्युतिकी, किरचॉफ परिपथ एवं किरण-तरंग प्रकाशिकी",
      text: `Electrostatics, Current Electricity and Ray Optics (NCERT Class XII Physics)

Coulomb's Law and Electric Field: Force between two point charges is F = k q1 q2 / r². Electric field lines radiate outward from positive charge and electric flux obeys Gauss's law Φ = q / ε0.

Drift Velocity and Kirchhoff's Circuit Laws: Electric current I = n e A vd relates microscopic electron drift to macroscopic Ohm's law, while Kirchhoff's junction and loop rules govern multi-branch networks.

Refraction at Spherical Surfaces and Lensmaker's Formula: Thin lenses obey 1/f = (n - 1)(1/R1 - 1/R2) and 1/v - 1/u = 1/f, enabling compound microscopes and astronomical telescopes.`
    }
  ];

  function openHigherStudio() {
    const drawer = $("libDrawer"), listEl = $("ldList");
    if (!drawer || !listEl) return;
    if (window.EVLIB) EVLIB.setLibrary(true);

    $("ldEyebrow").textContent = BI("ANVEXIA · CLASS XI & XII EXPANSION STUDIO", "अन्वेक्सिया · कक्षा XI व XII विस्तार स्टूडियो");
    $("ldTitle").textContent = BI("Higher Classes · Class XI & XII Science", "उच्च कक्षाएँ · कक्षा XI व XII विज्ञान");
    $("ldSub").textContent = BI(
      "4 instant Class XI–XII PCM/PCB blueprints + 7 bridge chapters + full custom NCERT XI–XII compiler",
      "4 त्वरित कक्षा XI–XII मॉड्यूल + 7 सेतु अध्याय + पूर्ण कस्टम NCERT XI–XII कंपाइलर"
    );
    $("ldFoot").textContent = BI(
      "Click any XI–XII blueprint to compile & open its 3D World + 2D Flipbook immediately",
      "किसी भी XI–XII मॉड्यूल पर क्लिक कर तुरंत 3D विश्व व 2D फ़्लिपबुक खोलें"
    );

    const bridgeRows = CATALOGUE_ALL.filter(c => STUDENT_CHAPTERS.indexOf(c.id) < 0);
    const bpHtml = HIGHER_BLUEPRINTS.map((bp, i) => {
      const sLabel = bp.subject === "phy" ? BI("Physics", "भौतिकी") : bp.subject === "chem" ? BI("Chemistry", "रसायन") : BI("Biology", "जीव विज्ञान");
      return `<button type="button" class="ld-row sv-bp-row" data-sv-bp="${esc(bp.id)}">
        <span class="ld-num">${esc(bp.cls)}</span>
        <span class="ld-body">
          <b>${EV.lang === "both" ? BX(bp.title, bp.hi) : esc(BI(bp.title, bp.hi))}</b>
          <small>${esc(sLabel)} · ${esc(BI("Instant 3D World + 2D Flipbook Blueprint", "त्वरित 3D विश्व + 2D फ़्लिपबुक मॉड्यूल"))}</small>
        </span>
        <span class="ld-tag ${esc(bp.subject)}">Class ${esc(bp.cls)}</span>
        <span class="ld-arrow" aria-hidden="true">✦</span>
      </button>`;
    }).join("");

    const bridgeHtml = bridgeRows.map((r, i) => {
      const nSp = (typeof WORLDS !== "undefined" && WORLDS[r.id]) ? WORLDS[r.id].length : 0;
      return `<button type="button" class="ld-row" data-sv-ch="${esc(r.id)}">
        <span class="ld-num">B${i + 1}</span>
        <span class="ld-body">
          <b>${EV.lang === "both" ? BX(r.title, r.hi) : esc(BI(r.title, r.hi))}</b>
          <small>${esc(BI("Foundation Bridge Chapter", "आधार सेतु अध्याय"))} · ${nSp} ${esc(BI("spreads + 2D plates", "स्प्रेड + 2D चित्र"))}</small>
        </span>
        <span class="ld-tag ${esc(r.subject)}">${esc(r.cls)}→XI</span>
        <span class="ld-arrow" aria-hidden="true">→</span>
      </button>`;
    }).join("");

    const customBtnHtml = `
      <div class="sv-higher-compiler-cta">
        <div>
          <strong>⚙ ${esc(BI("Paste Any Class XI or XII NCERT Chapter", "कोई भी कक्षा XI या XII का अध्याय पेस्ट करें"))}</strong>
          <small>${esc(BI("Deterministic offline compiler builds interactive 3D spreads, predictions & quizzes.", "ऑफ़लाइन कंपाइलर तुरंत 3D स्प्रेड, अनुमान और प्रश्नोत्तरी बनाता है।"))}</small>
        </div>
        <button type="button" class="btn primary small" id="svOpenCompilerXI">${esc(BI("Open XI–XII Compiler →", "XI–XII कंपाइलर खोलें →"))}</button>
      </div>`;

    listEl.innerHTML = customBtnHtml +
      `<div class="sv-drawer-sec">${esc(BI("CLASS XI & XII STARTER MODULES (PCM / PCB)", "कक्षा XI व XII प्रारंभिक मॉड्यूल (PCM / PCB)"))}</div>` +
      bpHtml +
      `<div class="sv-drawer-sec">${esc(BI("BRIDGE & FOUNDATION CHAPTERS (WITH FULL 2D PLATES)", "सेतु एवं आधार अध्याय (पूर्ण 2D चित्रों सहित)"))}</div>` +
      bridgeHtml;

    listEl.querySelectorAll("[data-sv-bp]").forEach(btn => {
      btn.onclick = () => {
        const bp = HIGHER_BLUEPRINTS.find(x => x.id === btn.dataset.svBp);
        if (!bp) return;
        drawer.hidden = true;
        const w = compileChapter(bp.text, {
          title: bp.title,
          cls: bp.cls,
          subject: bp.subject,
          source: `Anvexia · Class ${bp.cls} Blueprint`
        });
        w.id = bp.id;
        w.titleHi = bp.hi;
        EV.world = w;
        setView("book");
        toast(`✦ Class ${bp.cls}: ${BI(bp.title, bp.hi)}`, "ok");
      };
    });

    listEl.querySelectorAll("[data-sv-ch]").forEach(btn => {
      btn.onclick = () => {
        const chId = btn.dataset.svCh;
        drawer.hidden = true;
        openChapter(chId);
      };
    });

    const compBtn = $("svOpenCompilerXI");
    if (compBtn) {
      compBtn.onclick = () => {
        drawer.hidden = true;
        setView("compiler");
        setTimeout(() => {
          const clsSel = $("compileCls");
          if (clsSel) clsSel.value = "XI";
          const txt = $("compileText");
          if (txt && !txt.value.trim()) {
            txt.value = HIGHER_BLUEPRINTS[0].text;
            if ($("compileTitle")) $("compileTitle").value = HIGHER_BLUEPRINTS[0].title;
            if ($("compileSubject")) $("compileSubject").value = "phy";
          }
        }, 30);
      };
    }

    drawer.hidden = false;
  }

  /* -------------------------------------------- 6. Global Event Wiring */
  function cycleLanguage() {
    const order = ["both", "hi", "en"];
    const next = order[(order.indexOf(EV.lang) + 1) % order.length];
    const sel = $("langSelect");
    if (sel) {
      sel.value = next;
      sel.dispatchEvent(new Event("change"));
    }
    if (isFlipOpen() && flipWorld) {
      openFlipbook(flipWorld.id, currentFlipSpreadIndex(), flipWorld);
    }
  }

  function install() {
    // Topbar & Library triggers
    if ($("btnFlipbookTop")) $("btnFlipbookTop").onclick = () => openFlipbook();
    if ($("btnSearchTop")) $("btnSearchTop").onclick = () => openSearch();
    if ($("svLibSearchBtn")) $("svLibSearchBtn").onclick = () => openSearch();

    // 2D Flipbook modal controls
    if ($("svFlipClose")) $("svFlipClose").onclick = closeFlipbook;
    document.querySelectorAll("[data-sv-flip-close]").forEach(el => { el.onclick = closeFlipbook; });
    if ($("svFlipPrev")) $("svFlipPrev").onclick = () => { if (flipInst) flipInst.flipPrev(); };
    if ($("svFlipNext")) $("svFlipNext").onclick = () => { if (flipInst) flipInst.flipNext(); };
    if ($("svFlipLangBtn")) $("svFlipLangBtn").onclick = cycleLanguage;
    if ($("svFlipOpen3D")) $("svFlipOpen3D").onclick = () => {
      if (!flipWorld || window.EV_2D_ONLY) return;
      const sIdx = currentFlipSpreadIndex();
      const w = flipWorld;
      closeFlipbook();
      if (WORLDS[w.id] || CATALOGUE_ALL.some(c => c.id === w.id)) openChapter(w.id);
      else { EV.world = w; setView("book"); }
      WORLD.jumpTo(sIdx);
      renderLesson(); renderMeters(); renderPageBar();
    };
    if ($("svFlipChapter")) $("svFlipChapter").onchange = e => {
      openFlipbook(e.target.value, 0);
    };

    // Search modal controls
    if ($("svSearchClose")) $("svSearchClose").onclick = closeSearch;
    document.querySelectorAll("[data-sv-search-close]").forEach(el => { el.onclick = closeSearch; });
    if ($("svSearchInput")) {
      $("svSearchInput").oninput = () => { selectedHitIdx = 0; renderSearchResults(); };
      $("svSearchInput").onkeydown = e => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          selectedHitIdx = Math.min(currentHits.length - 1, selectedHitIdx + 1);
          renderSearchResults();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          selectedHitIdx = Math.max(0, selectedHitIdx - 1);
          renderSearchResults();
        } else if (e.key === "Enter") {
          e.preventDefault();
          activateSearchHit(selectedHitIdx, e.shiftKey);
        } else if (e.key === "Escape") {
          e.preventDefault();
          closeSearch();
        }
      };
    }
    document.querySelectorAll("[data-sv-filter]").forEach(chip => {
      chip.onclick = () => {
        activeFilter = chip.dataset.svFilter || "all";
        document.querySelectorAll("[data-sv-filter]").forEach(c => c.classList.toggle("on", c === chip));
        selectedHitIdx = 0;
        renderSearchResults();
      };
    });

    // Global keyboard shortcuts (Ctrl+K / Cmd+K for search, Escape & arrows for Flipbook)
    document.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const sm = $("svSearchModal");
        if (sm && !sm.hidden) closeSearch(); else openSearch();
        return;
      }
      const sm = $("svSearchModal");
      if (sm && !sm.hidden) {
        if (e.key === "Escape") { e.preventDefault(); closeSearch(); }
        return;
      }
      if (isFlipOpen()) {
        if (e.key === "Escape") { e.preventDefault(); closeFlipbook(); }
        else if (e.key === "ArrowRight" && flipInst) { e.preventDefault(); flipInst.flipNext(); }
        else if (e.key === "ArrowLeft" && flipInst) { e.preventDefault(); flipInst.flipPrev(); }
      }
    });

    let flipResizeTimer = null;
    window.addEventListener("resize", () => {
      if (!isFlipOpen() || !flipWorld) return;
      clearTimeout(flipResizeTimer);
      flipResizeTimer = setTimeout(() => {
        if (isFlipOpen() && flipWorld) openFlipbook(flipWorld.id, currentFlipSpreadIndex(), flipWorld);
      }, 160);
    });
  }

  return {
    install,
    formatFormulaHtml,
    celebrate,
    animateScalePulse,
    openFlipbook,
    closeFlipbook,
    isFlipOpen,
    flipState: () => flipInst && flipInst.getState ? flipInst.getState() : null,
    openSearch,
    closeSearch,
    openHigherStudio
  };
})();
window.SCIVERSE = SCIVERSE;
