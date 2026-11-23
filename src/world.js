/* ==========================================================================
   EduVerse — The Moving World Engine
   · open 3D hardback on a desk, canvas-printed NCERT-style pages
   · real page-turn: inextensible curl kinematics, drag-to-turn, gutter + contact shading
   · fold-up pop-up apparatus rising out of the right page
   · draggable 3D handles + clickable parts + orbit camera
   · a navigable chapter "meta world" of floating chapter monoliths
   · precision 2D fallback shares the exact same scene state
   Patterns: folio-book-3d (bend + drag), book.js (flip), 3d-book-reader
   (canvas→mesh page), DevGurav (PDF pages), Q-Learn (gamified hub).
   ========================================================================== */

const WORLD = (function () {
  const PW = 3.55, PD = 4.75;                 // page width / depth
  let renderer, scene, camera, canvas, lastFrame;
  let sceneMats = {};                    /* desk / cover / spine recoloured per theme */
  let auditLog = null;                   /* Atlas tools/uitest.mjs style layout probe */
  let boardText = "detail";             /* "detail" | "big" (30 FT presentation plate) */
  const BT = () => boardText;
  function setBoardText(v) {
    boardText = v === "big" ? "big" : "detail";
    if (typeof EVFSM !== "undefined") EVFSM.observe("boardText", boardText, "world.js:setBoardText");
    repaintPages();
  }
  let repaintQueued = false;
  function queueRepaint() {
    if (repaintQueued) return; repaintQueued = true;
    requestAnimationFrame(() => { repaintQueued = false; if (TH()) repaintPages(); });
  }
  let worldGroup, bookGroup, paperRoot, metaRoot, popupRoot, apparatusRoot, leaf, leftPage, rightPage, leafFront, leafBack, turnShadow;
  /* R6 · the right page is a LIVE WebGLRenderTarget of the real 3D apparatus,
     not a flat drawing. `ultra` lets that same geometry physically rise out
     of the page. `figureMode` falls back to the printed diagram ONLY if the
     GPU cannot create a render target (which the invariant gate then FAILs). */
  let figurePlane = null, figureMode = "3d", ultra = false, figureKey = "", plate2d = false;
  let currentWorld = null, spreadIndex = 0, view = "world", lang = "both";
  let turning = null, popupT = 0, popupTarget = 1, built = null, params = {}, touched = new Set();
  let handleRanges = {}, handleGroups = [], clickTargets = [], handleMeshes = [];
  let orbit = { yaw: 0, pitch: 0, dist: 1, dragging: false, lx: 0, ly: 0, enabled: true };
  let zoomPress = null;
  let drag = null, cb = {}, monoliths = [], hovered = null, demoTimer = null, demoSteps = [], demoIdx = 0;
  let camAnim = null, time = 0, precision = false, quality = 1;
  let shot = "board";
  /* Papers are gently widened in straight-on view so the book uses the stage
     width instead of sitting shrunk in the middle. The 3D apparatus is NOT
     scaled, so atoms, lenses and ray circles stay perfectly round. */
  let wide = 1.34;
  let fitWide = 1.34;
  const WIDE_MIN = 1.14, WIDE_MAX = 2.15;
  /* "board" = projector / straight-on: dead-centre, no yaw, no perspective
     skew, near-orthographic FOV. Text stays upright for the whole classroom. */
  const SHOTS = { explore: { r: 6.4, p: 0.96 }, read: { r: 6.0, p: 1.18 }, board: { r: 10.5, p: 1.553, fov: 30 } };
  let lastFov = 46, lastBoard = null;
  function syncPaperScale(wScale) {
    if (Math.abs(fitWide - wScale) < 0.002 && paperRoot && Math.abs(paperRoot.scale.x - wScale) < 0.002) return;
    fitWide = wScale;
    if (paperRoot) paperRoot.scale.x = fitWide;
    if (popupRoot) popupRoot.position.x = PW * fitWide / 2;
    if (selectionRoot) selectionRoot.position.x = PW * fitWide / 2;
  }
  function boardFit() {
    /* Fit the WHOLE open book across the full stage width & height above the dock
       so zero wasted side margins remain on 16:9, 16:10, 21:9, or 4:3 screens. */
    const h = (canvas && canvas.clientHeight) || 848, w = (canvas && canvas.clientWidth) || 1440;
    const stage = document.getElementById("stage");
    const dock = document.querySelector(".dock");
    const focus = !!(stage && stage.classList.contains("focus"));
    const dockH = focus ? 0 : ((dock && dock.clientHeight) || 40);
    const reserved = Math.min(dockH, Math.max(0, h - 60));
    const usable = Math.max(48, h - reserved - 4);
    const aspect = Math.max(0.25, w / h);
    const usableAspect = Math.max(0.35, w / usable);
    const visH = h < 540 ? 4.92 : 4.82;
    const baseBookW = 7.22;
    const autoW = aspect < 0.92 ? 1.06 : Math.max(WIDE_MIN, Math.min(WIDE_MAX, (0.985 * usableAspect * visH) / baseBookW));
    syncPaperScale(autoW);
    const bookW = baseBookW * fitWide;
    const ve = Math.max(visH * h / usable, (bookW / 0.988) / aspect);
    const d = ve / (2 * Math.tan(SHOTS.board.fov * Math.PI / 360));
    const shift = focus ? 0 : (reserved / 2 + 2) / h * ve;
    const fraction = Math.min(1, bookW / (ve * aspect));
    /* FULL WIDTH: the spread is widened until it spans ~98.5% of the stage width,
       within WIDE_MIN..WIDE_MAX, so the book uses the free horizontal space. */
    return { d: d, shift: shift, dockH: dockH, ve: ve, fraction: fraction, wideFit: fitWide };
  }
  function setWide(v) {
    wide = Math.max(1, Math.min(WIDE_MAX, Number(v) || 1.34));
    if (view === "book" && shot === "board") boardFit();
    else syncPaperScale(wide);
  }
  function boardMetrics() {
    const f = boardFit(), st = document.getElementById("stage");
    return { dockH: f.dockH, ve: +f.ve.toFixed(3), fraction: +f.fraction.toFixed(3),
             wide: +fitWide.toFixed(3), focus: !!(st && st.classList.contains("focus")),
             shot: shot };
  }
  /* In projector view the big paper-craft base plates are hidden, so the
     printed right page (figure + bilingual captions) is fully readable. */
  function tunePopupForBoard(board) {
    if (!popupRoot) return;
    /* R4 · PROJECTOR RULE
       classroom + straight-on board shot = a clean printed two-page plate:
       left = big bilingual text, right = one big declarative diagram.
       Individual meshes cannot simply be hidden: every block's model() sets
       parts back to visible on each frame. Gating the WHOLE pop-up group is
       stable. Read / explore shots and the studio theme restore the 3D model
       untouched — nothing is deleted. */
    const flat = !!(board && TH() && view === "book" && !ultra);
    popupRoot.visible = !flat && !turning;
    [apparatusRoot, popupRoot].forEach(root => {
      if (!root) return;
      root.traverse(o => {
        if (o.userData && o.userData.isTag) {
          if (!o.userData.origRot) { o.userData.origRot = o.rotation.clone(); o.userData.origScale = o.scale.clone(); }
          if (board && !flat) { o.rotation.set(-Math.PI / 2, 0, 0); o.scale.copy(o.userData.origScale).multiplyScalar(0.8); }
          else { o.rotation.copy(o.userData.origRot); o.scale.copy(o.userData.origScale); }
        }
      });
    });
  }

  function syncCam(board) {
    const fov = board ? SHOTS.board.fov : 46;
    if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    if (board && camera.up.z !== -1) camera.up.set(0, 0, -1);
    if (!board && camera.up.y !== 1) camera.up.set(0, 1, 0);
  }
  let raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  /* Prompt 2 · ONE global selection layer + Raycaster bridge. The EVENGINE
     THREE.Group lives here (as a sibling of popupRoot, never cleared by
     clearBuilt() and never hidden by the flat projector plate). EVBIND owns
     its disposal; WORLD only attaches/detaches and resolves picks. */
  let selectionRoot = null, pickTargets = [], pickHandler = null;
  let texCache = {};
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  /* ---------------------------------------------------------- page texture */
  function pageCanvas() {
    const PAGE_SCALE = 1.75;
    const c = document.createElement("canvas");
    c.width = Math.round(900 * PAGE_SCALE);
    c.height = Math.round(1200 * PAGE_SCALE);
    const x = c.getContext("2d");
    x.scale(PAGE_SCALE, PAGE_SCALE);
    if (auditLog) {
      const raw = x.fillText.bind(x);
      x.fillText = function (t, px, py, mw) {
        const run = x.__layoutRun || ++layoutRun;
        auditLog.push({ text: String(t), x: px, y: py, font: x.font, fill: String(x.fillStyle),
                        align: x.textAlign, baseline: x.textBaseline, maxWidth: mw || 0,
                        run: run, lh: x.__layoutRun ? layoutLh : 0 });
        return raw(t, px, py, mw);
      };
    }
    if (TH()) {
      /* projector-safe: pure white, hard dark frame, no grain (grain kills contrast) */
      x.fillStyle = "#ffffff"; x.fillRect(0, 0, 900, 1200);
      x.strokeStyle = "#0b1620"; x.lineWidth = 7; x.strokeRect(30, 30, 840, 1140);
      x.strokeStyle = "#c9d6e2"; x.lineWidth = 2; x.strokeRect(44, 44, 812, 1112);
      return { c, x };
    }
    x.fillStyle = "#f6f0e0"; x.fillRect(0, 0, 900, 1200);
    /* paper grain */
    const rnd = G3.seeded(771);
    for (let i = 0; i < 2200; i++) { x.fillStyle = "rgba(120,105,75," + (rnd() * 0.035).toFixed(3) + ")"; x.fillRect(rnd() * 900, rnd() * 1200, 1.6, 1.6); }
    x.strokeStyle = "rgba(150,132,96,.35)"; x.lineWidth = 1;
    x.strokeRect(48, 48, 804, 1104);
    return { c, x };
  }
  function fontAt(font, size) {
    return String(font).replace(/(\d+(?:\.\d+)?)px/, String(size) + "px");
  }
  /* A wrapped run is one logical paragraph. The audit must ignore overlap
     between its own lines but still catch collisions with other labels. */
  /* R4 classroom palette, studio theme and 1.38x projector type scale.
     Kept here so the page-texture helpers and the theme switch share one
     canonical owner (the IIFE never loses these definitions on repaint). */
  let theme = "classroom";
  function applySceneTheme() {
    const light = TH();
    if (renderer) renderer.setClearColor(light ? 0xeaf0f6 : 0x0c1422, 1);
    if (scene) scene.fog = light ? null : new THREE.FogExp2(0x0c1422, 0.019);
    const M = sceneMats;
    if (M.deskA) M.deskA.color.setHex(light ? 0xd4e1ec : 0x131d2a);
    if (M.deskB) M.deskB.color.setHex(light ? 0xc2d5e6 : 0x1a2939);
    if (M.pool)  M.pool.color.setHex(light ? 0x8eb4d4 : 0x2b4c68);
    if (M.cover) M.cover.color.setHex(light ? 0x3f6f96 : 0x244a68);
    if (M.spine) M.spine.color.setHex(light ? 0x224a6d : 0x183449);
  }
  function setTheme(v) {
    theme = v === "studio" ? "studio" : "classroom";
    if (typeof EVFSM !== "undefined") EVFSM.observe("theme", theme, "world.js:setTheme");
    lastBoard = null;
    applySceneTheme();
    tunePopupForBoard(shot === "board" && view === "book");
    repaintPages();
  }
  const TH = () => theme === "classroom";
  const F = px => Math.round(px * (TH() ? 1.38 : 1));
  const PC = { ink: "#0b1620", hi: "#8a2b0c", accent: "#004f96", rule: "#6e7f90",
               box: "#ffffff", boxline: "#22323f", pale: "#eef4fa", band: "#dce9f6",
               green: "#0b6b43", amber: "#8a4a00" };
  const BI = (en, hiText) => lang === "both" ? en + " / " + hiText :
                             (lang === "hi" ? hiText : en);
  let layoutRun = 0, layoutLh = 0, lastWrap = null;
  /* Launch-day text contract: NO ellipsis, NO clipped copy, NO override.
     Shrink the type and wrap full words until the complete text fits the
     allotted lines. Literal "$" is re-attached to its number/symbol so a
     currency or math sign can never be stranded at a line break. */
  function wrap(x, text, px, py, max, lh, maxLines, font, maxH, minPx) {
    const base = fontPx(font) || 32;
    const floor = Math.min(base, Math.max(12, minPx || 12)), run = ++layoutRun;
    x.__layoutRun = run;
    const clean = String(text == null ? "" : text)
      .replace(/\$\s+(?=[0-9A-Za-z(+\-])/g, "$").trim();
    let size = base, lines = [], actualLh = lh;
    for (; size >= floor; size -= 1) {
      x.font = fontAt(font, size);
      const words = clean.split(/\s+/).filter(Boolean);
      let line = "", arr = [];
      words.forEach(w => {
        const test = line ? line + " " + w : w;
        if (x.measureText(test).width > max && line) { arr.push(line); line = w; }
        else line = test;
      });
      if (line) arr.push(line);
      lines = arr;
      /* maxH = an explicit vertical zone budget. Line height then follows the
         glyph size (1.12x), so large 30 FT type is NOT shrunk just because a
         caller passed a small nominal lh. Without maxH, fit the line budget. */
      const lineH = maxH > 0 ? size * 1.12
                             : Math.max(lh * Math.max(0.62, size / base), size * 1.08);
      const fitsHeight = maxH > 0 ? lines.length * lineH <= maxH
                                  : lines.length * lineH <= maxLines * lh + 0.5;
      actualLh = lineH;
      if (lines.length <= maxLines && fitsHeight &&
          lines.every(v => x.measureText(v).width <= max)) break;
    }
    layoutLh = actualLh;
    lastWrap = { size: Math.max(floor, size + (size < floor ? 1 : 0)), lineH: actualLh,
                 lines: lines.length, height: lines.length * actualLh,
                 end: py + lines.length * actualLh };
    lines.forEach((line, i) => x.fillText(line, px, py + i * actualLh, max));
    x.__layoutRun = 0; layoutLh = 0; x.font = font;
    return lastWrap.end;
  }
  function fittedMetrics(text, maxW, font, maxLines, lh, maxH, minPx) {
    const cx = document.createElement("canvas").getContext("2d");
    const saved = auditLog; auditLog = null;
    const base = fontPx(font) || 24;
    wrap(cx, text, 0, 0, maxW, lh || Math.max(10, base * 0.78),
         maxLines || 1, font, maxH || 0, minPx || 12);
    const m = lastWrap ? Object.assign({}, lastWrap) : null;
    auditLog = saved;
    return m;
  }
  const short = (s, n) => String(s == null ? "" : s);  /* full copy; fitLine() scales it */

  function classroomHead(x, world, sp, side, num) {
    x.textAlign = "left";
    x.fillStyle = PC.accent; x.font = "900 28px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.fillText("SCIVERSE 3D  ·  CLASS " + (world.cls || "IX"), 84, 96);
    x.fillStyle = PC.ink; x.font = "italic 700 27px Georgia, 'Noto Sans Devanagari Embedded', serif";
    drawFitted(x, BI(world.title, world.titleHi), 84, 136, 600, x.font, 1, 0);
    x.textAlign = "right"; x.fillStyle = PC.hi; x.font = "900 26px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.fillText("§ " + sp.section + "  ·  " + side, 816, 96);
    x.textAlign = "left";
    x.strokeStyle = PC.ink; x.lineWidth = 5; x.beginPath(); x.moveTo(84, 158); x.lineTo(816, 158); x.stroke();
  }

  /* One declarative spec -> one big classroom diagram for EVERY chapter.
     Atlas packs carry scene.fig; curated Ch 4 / Ch 9 packs fall back to their
     figure caption split into concept cards. */
  /* One declarative spec -> one big classroom diagram for EVERY chapter.
     Atlas packs carry scene.fig (kind + labels). Curated Ch 4 / Ch 9 packs
     are enriched from their own figure caption, key vocabulary and formula,
     so no lesson ever falls back to an empty grid. This is the Atlas
     `world.js` discipline: the figure is DATA, not hand-drawn per chapter. */
  function diagramSpec(sp) {
    const f = (sp.scene && sp.scene.fig) || {};
    let labels = [], kind = "flow";
    if (f.labels && f.labels.length >= 3) { labels = f.labels.slice(0, 6); kind = f.kind || "flow"; }
    else {
      const bits = String(sp.fig || "").split(/[·→|—,]/).map(v => v.trim()).filter(Boolean);
      const pool = bits.concat((sp.vocab || []).map(v => String(v[0] || "").trim()),
                               [sp.formula && sp.formula.eq, sp.short || sp.title, sp.explain]);
      pool.forEach(t => {
        t = String(t == null ? "" : t).trim();
        if (t && t.length > 2 && labels.indexOf(t) < 0 && labels.length < 6) labels.push(t);
      });
      const s = (sp.title + " " + (f.kind || "") + " " + sp.scene.type + " " + sp.section).toLowerCase();
      if (/cycle|water|nitrogen|carbon cycle|life process|reproduc|photosynth|menstrual/.test(s)) kind = "cycle";
      else if (/graph|motion|distance|speed|velocity|wave|sound|slope|acceleration/.test(s)) kind = "graph";
      else if (/circuit|current|electric|resist|magnet|field|ohm/.test(s)) kind = "circuit";
      else if (/cell|tissue|organ|nucleus|microbe|body/.test(s)) kind = "cell";
      else if (/molecule|atom|bond|compound|acid|salt|metal|reaction|element/.test(s)) kind = "molecule";
      else if (/ray|light|mirror|lens|reflect|refract|eye|image/.test(s)) kind = "rays";
      else if (/layer|earth|atmosphere|soil|rock|strata/.test(s)) kind = "layers";
      else kind = "flow";
    }
    return { kind: kind, labels: labels.length >= 3 ? labels : labels.concat(["NCERT", "OBSERVE", "EXPLAIN"]).slice(0, 3) };
  }
  /* Atlas model.js rule: every arrow, number and highlight comes from the
     pure model, never from the renderer. Slider moves -> new model -> new
     active card + live readout printed on the right page. */
  function liveIndex(sp, n) {
    if (!n) return 0;
    try {
      const m = evalModel(sp, Object.assign({}, params));
      let h = 2166136261;
      JSON.stringify(m, (k, v) => typeof v === "number" && isFinite(v) ? Math.round(v * 100) : v)
        .split("").forEach(ch => { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); });
      return (h >>> 0) % n;
    } catch (e) { return (spreadIndex + 1) % n; }
  }
  function liveReadout(sp) {
    try {
      const m = evalModel(sp, Object.assign({}, params)), r = (m && m.readouts) || [];
      if (r.length) return String(r[0].label) + " " + String(r[0].value) + (r[0].unit ? " " + r[0].unit : "");
      const k = Object.keys(m || {}).find(q => typeof m[q] === "number");
      return k ? k + " " + m[k] : "";
    } catch (e) { return ""; }
  }
  function drawBigDiagram(x, sp, X, Y, W, H) {
    const spec = diagramSpec(sp), L = spec.labels, n = L.length, k = spec.kind;
    const BF = BT() === "big" ? 1.22 : 1, DACT = liveIndex(sp, n);
    let cardNo = 0;
    x.save();
    x.fillStyle = "#ffffff"; x.fillRect(X, Y, W, H);
    x.strokeStyle = PC.boxline; x.lineWidth = 5; x.strokeRect(X + 3, Y + 3, W - 6, H - 6);
    x.fillStyle = PC.band; x.fillRect(X + 8, Y + 8, W - 16, 62);
    x.fillStyle = PC.accent; x.font = "900 " + Math.round(36 * BF) + "px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.textAlign = "left";
    drawFitted(x, "DIAGRAM · " + String(k).toUpperCase(), X + 26, Y + 48, W * 0.52, x.font, 1, 0);
    const live = liveReadout(sp);
    if (live) {
      x.textAlign = "right"; x.font = "900 " + Math.round(21 * BF) + "px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
      drawFitted(x, "● LIVE  " + live, X + W - 22, Y + 34, W * 0.42, x.font,
                 2, 0, 40, 14);
      x.textAlign = "left";
    }
    const cy = Y + 100, ch = H - 132, cx = X + 30, cw = W - 60;
    const card = (lab, px, py, pw, ph, fill) => {
      const on = cardNo++ === DACT;
      x.fillStyle = on ? "#fff2d6" : (fill || "#ffffff"); x.fillRect(px, py, pw, ph);
      x.strokeStyle = on ? PC.hi : PC.boxline; x.lineWidth = on ? 7 : 4;
      x.strokeRect(px, py, pw, ph);
      if (on) { x.fillStyle = PC.hi; x.fillRect(px + 7, py + 7, 15, 15); }
      x.fillStyle = PC.ink; x.textAlign = "center"; x.textBaseline = "middle";
      let size = Math.round(36 * BF);
      x.font = "900 " + size + "px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
      while (x.measureText(String(lab)).width > pw - 18 && size > 22) {
        size -= 2; x.font = "900 " + size + "px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
      }
      drawFitted(x, lab, px + pw / 2, py + ph / 2, pw - 18, x.font, 1, 0);
      x.textBaseline = "alphabetic"; x.textAlign = "left";
    };
    const arrow = (a, b) => {
      x.strokeStyle = PC.ink; x.lineWidth = 5; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      x.beginPath(); x.moveTo(b[0], b[1]);
      x.lineTo(b[0] - 15 * Math.cos(ang - .45), b[1] - 15 * Math.sin(ang - .45));
      x.lineTo(b[0] - 15 * Math.cos(ang + .45), b[1] - 15 * Math.sin(ang + .45));
      x.closePath(); x.fillStyle = PC.ink; x.fill();
    };
    const fills = ["#e3f0fd", "#dff5e9", "#fff2d6", "#f0e8fb", "#ffe6e0", "#e3f0fd"];
    if (k === "cycle" || k === "molecule") {
      const r = Math.min(cw, ch) * .34, ox = cx + cw / 2, oy = cy + ch / 2;
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2 - Math.PI / 2, px = ox + Math.cos(a) * r, py = oy + Math.sin(a) * r * .78;
        if (k === "molecule") {
          x.strokeStyle = PC.ink; x.lineWidth = 6;
          x.beginPath(); x.arc(ox, oy, r * .78, 0, Math.PI * 2); x.stroke();
        }
        card(L[i], px - 88, py - 34, 176, 68, fills[i % fills.length]);
        if (k === "cycle") {
          const a2 = (i + 1) / n * Math.PI * 2 - Math.PI / 2;
          arrow([px + Math.cos(a) * 70, py + Math.sin(a) * 45], [ox + Math.cos(a2) * r - 78 * Math.cos(a2), oy + Math.sin(a2) * r * .78 - 40 * Math.sin(a2)]);
        }
      }
    } else if (k === "bars") {
      const bw = cw / (n * 1.6), gap = (cw - n * bw) / (n + 1);
      for (let i = 0; i < n; i++) {
        const h = ch * (.32 + (i % 4) * .16), px = cx + gap + i * (bw + gap);
        x.fillStyle = fills[i % fills.length]; x.fillRect(px, cy + ch - h, bw, h);
        x.strokeStyle = PC.boxline; x.lineWidth = 4; x.strokeRect(px, cy + ch - h, bw, h);
        x.fillStyle = PC.ink; x.font = "900 24px Arial, sans-serif"; x.textAlign = "center";
        drawFitted(x, L[i], px + bw / 2, cy + ch + 34, bw - 8, x.font, 1, 0); x.textAlign = "left";
      }
    } else if (k === "graph" || k === "wave") {
      x.strokeStyle = PC.ink; x.lineWidth = 5;
      x.beginPath(); x.moveTo(cx, cy + ch); x.lineTo(cx + cw, cy + ch); x.stroke();
      x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx, cy + ch); x.stroke();
      x.strokeStyle = PC.accent; x.lineWidth = 8; x.beginPath();
      for (let i = 0; i <= 80; i++) {
        const px = cx + i / 80 * cw;
        const py = k === "wave" ? cy + ch / 2 + Math.sin(i / 80 * Math.PI * 5) * ch * .3
                                : cy + ch - i / 80 * ch * .82;
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      }
      x.stroke();
      for (let i = 0; i < n; i++) card(L[i], cx + i * (cw / n) + 6, cy + 8, cw / n - 14, 62, fills[i % fills.length]);
    } else if (k === "layers") {
      const bh = ch / n;
      for (let i = 0; i < n; i++) { x.fillStyle = fills[i % fills.length]; x.fillRect(cx, cy + i * bh, cw, bh - 6);
        x.strokeStyle = PC.boxline; x.lineWidth = 4; x.strokeRect(cx, cy + i * bh, cw, bh - 6);
        x.fillStyle = PC.ink; x.font = "900 34px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
        drawFitted(x, L[i], cx + 22, cy + i * bh + bh / 2 + 8, cw - 44, x.font, 1, 0) }
    } else if (k === "rays" || k === "field") {
      const ox = cx + 60, oy = cy + ch / 2;
      for (let i = 0; i < n; i++) arrow([ox, oy], [cx + cw - 40, cy + (i + .5) * ch / n]);
      x.fillStyle = PC.ink; x.beginPath(); x.arc(ox, oy, 16, 0, Math.PI * 2); x.fill();
      for (let i = 0; i < n; i++) card(L[i], cx + cw * .42, cy + (i + .5) * ch / n - 30, cw * .42, 60, fills[i % fills.length]);
    } else if (k === "tree") {
      card(L[0], cx + cw / 2 - 130, cy, 260, 76, fills[0]);
      const cw2 = Math.min(190, (cw - 20) / Math.max(1, n - 1) - 12);
      for (let i = 1; i < n; i++) {
        const px = cx + 10 + (i - 1) * ((cw - 20) / (n - 1)), py = cy + ch * .55;
        arrow([cx + cw / 2, cy + 76], [px + cw2 / 2, py]);
        card(L[i], px, py, cw2, 78, fills[i % fills.length]);
      }
    } else if (k === "circuit" || k === "machine") {
      x.strokeStyle = PC.ink; x.lineWidth = 7; x.strokeRect(cx + 20, cy + 20, cw - 40, ch - 40);
      const bw = Math.min(190, (cw - 80) / n - 12);
      for (let i = 0; i < n; i++) card(L[i], cx + 34 + i * ((cw - 68) / n), cy + ch / 2 - 38, bw, 76, fills[i % fills.length]);
    } else if (k === "cell") {
      x.fillStyle = "#eef8ee"; x.strokeStyle = PC.boxline; x.lineWidth = 7;
      x.beginPath(); x.ellipse(cx + cw / 2, cy + ch / 2, cw * .38, ch * .42, 0, 0, Math.PI * 2); x.fill(); x.stroke();
      x.fillStyle = "#c9b3e8"; x.beginPath(); x.arc(cx + cw / 2, cy + ch / 2, ch * .13, 0, Math.PI * 2); x.fill(); x.stroke();
      for (let i = 0; i < n; i++) card(L[i], cx + 14 + (i % 3) * (cw / 3), cy + 14 + Math.floor(i / 3) * 80, cw / 3 - 24, 66, fills[i % fills.length]);
    } else {
      /* flow / table / default: two rows of big connected cards */
      const rows = n > 4 ? 2 : 1, per = Math.ceil(n / rows);
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / per), cnt = Math.min(per, n - r * per), c = i % per;
        const bw = (cw - (cnt - 1) * 26) / cnt, bh = Math.min(96, (ch - 30) / rows - 20);
        const px = cx + c * (bw + 26), py = cy + 16 + r * (ch / rows);
        card(L[i], px, py, bw, bh, fills[i % fills.length]);
        if (c < cnt - 1) arrow([px + bw + 2, py + bh / 2], [px + bw + 24, py + bh / 2]);
      }
    }
    x.restore();
  }

  /* ======================================================================
     ADDITIVE 2D OPPOSITE-PAGE PLATE · PHASE 1 PILOT (c9_cell)
     ----------------------------------------------------------------------
     One declarative spec per topic/subtopic. The plate is drawn on the SAME
     offscreen 900x1200 page canvas: no second canvas, no new renderer, no
     external image, no CDN, no GLB/GLTF, no OCR. Default remains live 3D.
     Every label is bilingual and fitted with a 14px printed floor.
     ====================================================================== */
  const P2 = (function () {
    const C = { ink: "#0b1620", accent: "#8a4f2c", line: "#1d4f7c", pale: "#eaf3fb",
      green: "#2e7d57", amber: "#b8782f", purple: "#6b4f9e", blue: "#2f7fb8",
      paper: "#ffffff", soft: "#f4f8fc", rule: "#c9d6e2" };
    function grad(x, x0, y0, x1, y1, a, b) {
      try { const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
      catch (e) { return a; }
    }
    function box(x, px, py, w, h, fill, stroke, lw) {
      x.fillStyle = fill || C.soft; x.fillRect(px, py, w, h);
      if (stroke) { x.strokeStyle = stroke; x.lineWidth = lw || 3; x.strokeRect(px, py, w, h); }
    }
    function arrow(x, a, b, color, lw) {
      x.strokeStyle = color || C.accent; x.lineWidth = lw || 4;
      x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), s = 13;
      x.beginPath(); x.moveTo(b[0], b[1]);
      x.lineTo(b[0] - s * Math.cos(ang - .45), b[1] - s * Math.sin(ang - .45));
      x.lineTo(b[0] - s * Math.cos(ang + .45), b[1] - s * Math.sin(ang + .45));
      x.closePath(); x.fillStyle = color || C.accent; x.fill();
    }
    function node(x, cx, cy, rad, fill, stroke) {
      x.beginPath(); x.arc(cx, cy, rad, 0, Math.PI * 2);
      x.fillStyle = fill; x.fill();
      if (stroke) { x.strokeStyle = stroke; x.lineWidth = 4; x.stroke(); }
    }
    function callout(x, en, hi, bx, by, bw, bh, ax, ay, side, zoomed) {
      x.save();
      box(x, bx, by, bw, bh, C.soft, C.line, 3);
      x.strokeStyle = C.accent; x.lineWidth = 3;
      const edge = side === "left" ? [bx + bw, by + bh / 2] : [bx, by + bh / 2];
      x.beginPath(); x.moveTo(edge[0], edge[1]); x.lineTo(ax, ay); x.stroke();
      node(x, ax, ay, 5, C.accent, C.paper);
      x.fillStyle = C.ink; x.textAlign = "center"; x.textBaseline = "alphabetic";
      x.font = "900 20px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
      drawFitted(x, BI(en, hi), bx + bw / 2, zoomed ? by + 22 : by + bh / 2 + 7, bw - 12, x.font, 2, 20, bh - 8, 14);
      x.restore();
    }
    return { C: C, grad: grad, box: box, arrow: arrow, node: node, callout: callout };
  })();

  const P2D = (function () {
    function cell(x, cx, cy, rw, rh, plant) {
      x.save();
      x.beginPath();
      if (plant) { x.moveTo(cx - rw / 2, cy - rh / 2); x.lineTo(cx + rw / 2, cy - rh / 2);
        x.lineTo(cx + rw / 2, cy + rh / 2); x.lineTo(cx - rw / 2, cy + rh / 2); x.closePath(); }
      else x.ellipse(cx, cy, rw / 2, rh / 2, 0, 0, Math.PI * 2);
      x.fillStyle = P2.grad(x, cx - rw / 2, cy - rh / 2, cx + rw / 2, cy + rh / 2, "#eef8ee", "#d9eddf");
      x.fill(); x.strokeStyle = P2.C.green; x.lineWidth = 5; x.stroke();
      x.restore();
    }
    function nucleus(x, cx, cy, rad) {
      x.save(); x.beginPath(); x.arc(cx, cy, rad, 0, Math.PI * 2);
      x.fillStyle = P2.grad(x, cx - rad, cy - rad, cx + rad, cy + rad, "#e7ddf6", "#c9b3e8");
      x.fill(); x.strokeStyle = P2.C.purple; x.lineWidth = 4; x.stroke();
      P2.node(x, cx + rad * .18, cy - rad * .12, rad * .22, "#8a5fb0", "#ffffff");
      x.restore();
    }
    return {
      discovery(x, r) {
        const g = P2.grad(x, r.x, r.y, r.x + r.w, r.y + r.h, "#f7ecd6", "#e4cf9f");
        P2.box(x, r.x + 12, r.y + 44, r.w - 24, r.h - 88, g, P2.C.amber, 4);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
          P2.box(x, r.x + 30 + i * 64, r.y + 62 + j * 74, 52, 58, "#fff8e7", P2.C.amber, 2);
        }
        P2.node(x, r.x + r.w * .74, r.y + r.h * .42, 40, "rgba(255,255,255,.72)", P2.C.blue);
        P2.node(x, r.x + r.w * .74, r.y + r.h * .42, 25, "rgba(120,180,230,.30)", P2.C.blue);
        P2.arrow(x, [r.x + r.w * .52, r.y + r.h * .5], [r.x + r.w * .70, r.y + r.h * .5], P2.C.blue, 5);
        P2.box(x, r.x + r.w * .62, r.y + r.h - 74, r.w * .32, 46, "#fff2d6", P2.C.accent, 3);
      },
      plantAnimal(x, r) {
        cell(x, r.x + r.w * .27, r.y + r.h * .5, r.w * .42, r.h * .62, true);
        cell(x, r.x + r.w * .73, r.y + r.h * .5, r.w * .38, r.h * .54, false);
        nucleus(x, r.x + r.w * .27, r.y + r.h * .48, 24);
        nucleus(x, r.x + r.w * .73, r.y + r.h * .48, 22);
        for (let i = 0; i < 3; i++) P2.node(x, r.x + r.w * .16 + i * 30, r.y + r.h * .30, 11, "#7bc47b", P2.C.green);
        P2.box(x, r.x + r.w * .10, r.y + r.h * .62, 46, 70, "#d8ecfb", P2.C.blue, 3);
        P2.node(x, r.x + r.w * .78, r.y + r.h * .28, 9, P2.C.purple, "#ffffff");
      },
      proEuk(x, r) {
        cell(x, r.x + r.w * .26, r.y + r.h * .58, r.w * .38, r.h * .42, false);
        cell(x, r.x + r.w * .74, r.y + r.h * .58, r.w * .38, r.h * .50, false);
        nucleus(x, r.x + r.w * .74, r.y + r.h * .58, 24);
        P2.arrow(x, [r.x + r.w * .5, r.y + r.h * .20], [r.x + r.w * .26, r.y + r.h * .36], P2.C.line, 4);
        P2.arrow(x, [r.x + r.w * .5, r.y + r.h * .20], [r.x + r.w * .74, r.y + r.h * .36], P2.C.line, 4);
        P2.node(x, r.x + r.w * .5, r.y + r.h * .18, 17, P2.C.blue, "#ffffff");
        P2.box(x, r.x + r.w * .40, r.y + r.h * .04, r.w * .20, 30, P2.C.soft, P2.C.line, 2);
      },
      membrane(x, r) {
        const y0 = r.y + r.h * .34, y1 = r.y + r.h * .64;
        P2.box(x, r.x, y0, r.w, y1 - y0, P2.grad(x, r.x, y0, r.x, y1, "#dff0fc", "#bcd9ee"), P2.C.blue, 3);
        for (let i = 0; i < 9; i++) {
          const px = r.x + 16 + i * (r.w - 32) / 9;
          P2.node(x, px, y0 + 12, 9, "#f0c477", P2.C.amber);
          P2.node(x, px, y1 - 12, 9, "#f0c477", P2.C.amber);
          x.strokeStyle = P2.C.amber; x.lineWidth = 3;
          x.beginPath(); x.moveTo(px, y0 + 20); x.lineTo(px, y1 - 20); x.stroke();
        }
        P2.box(x, r.x + r.w * .43, y0 - 12, r.w * .14, y1 - y0 + 24, "#ffffff", P2.C.purple, 4);
        P2.arrow(x, [r.x + r.w * .16, y0 - 34], [r.x + r.w * .16, y1 + 34], P2.C.green, 4);
        P2.arrow(x, [r.x + r.w * .84, y1 + 34], [r.x + r.w * .84, y0 - 34], P2.C.green, 4);
      },
      wall(x, r) {
        const layers = ["#d9c39a", "#bcd9ee", "#eef8ee", "#c9b3e8"];
        for (let i = 0; i < 4; i++) {
          const h = (r.h - 40) / 4;
          P2.box(x, r.x + 12, r.y + 20 + i * h, r.w - 24, h - 5, layers[i], P2.C.line, 3);
        }
        P2.box(x, r.x + r.w * .60, r.y + r.h * .58, r.w * .28, r.h * .24, "#d8ecfb", P2.C.blue, 3);
      },
      nucleus(x, r) {
        nucleus(x, r.x + r.w * .5, r.y + r.h * .48, Math.min(r.w, r.h) * .30);
        for (let i = 0; i < 4; i++) {
          const a = i / 4 * Math.PI * 2;
          const px = r.x + r.w * .5 + Math.cos(a) * 62, py = r.y + r.h * .48 + Math.sin(a) * 62;
          x.strokeStyle = P2.C.purple; x.lineWidth = 7;
          x.beginPath(); x.moveTo(px - 10, py - 16); x.quadraticCurveTo(px + 12, py, px - 10, py + 16); x.stroke();
        }
        P2.arrow(x, [r.x + r.w * .5, r.y + r.h * .70], [r.x + r.w * .5, r.y + r.h * .56], P2.C.accent, 4);
      },
      organelles(x, r) {
        P2.box(x, r.x + 12, r.y + r.h * .16, r.w * .42, r.h * .34, "#dff5e9", P2.C.green, 4);
        for (let i = 0; i < 5; i++) { x.strokeStyle = P2.C.green; x.lineWidth = 5;
          x.beginPath(); x.moveTo(r.x + 28 + i * 24, r.y + r.h * .20); x.lineTo(r.x + 28 + i * 24, r.y + r.h * .46); x.stroke(); }
        P2.box(x, r.x + r.w * .54, r.y + r.h * .16, r.w * .34, r.h * .34, "#fff2d6", P2.C.amber, 4);
        for (let i = 0; i < 3; i++) P2.node(x, r.x + r.w * .62 + i * 30, r.y + r.h * .30, 12, P2.C.amber, "#ffffff");
        P2.arrow(x, [r.x + r.w * .20, r.y + r.h * .58], [r.x + r.w * .48, r.y + r.h * .58], P2.C.blue, 4);
        P2.arrow(x, [r.x + r.w * .52, r.y + r.h * .58], [r.x + r.w * .80, r.y + r.h * .58], P2.C.green, 4);
        P2.node(x, r.x + r.w * .5, r.y + r.h * .58, 16, P2.C.purple, "#ffffff");
      },
      erGolgi(x, r) {
        for (let i = 0; i < 4; i++) {
          x.strokeStyle = P2.C.blue; x.lineWidth = 6;
          x.beginPath(); x.moveTo(r.x + 20, r.y + 40 + i * 34);
          x.bezierCurveTo(r.x + r.w * .28, r.y + 18 + i * 34, r.x + r.w * .34, r.y + 70 + i * 34, r.x + r.w * .44, r.y + 44 + i * 34); x.stroke();
          if (i < 2) for (let j = 0; j < 6; j++) P2.node(x, r.x + 50 + j * 22, r.y + 40 + i * 34, 4, P2.C.purple, null);
        }
        for (let i = 0; i < 4; i++) P2.box(x, r.x + r.w * .58, r.y + 44 + i * 28, r.w * .30, 18, "#f0e8fb", P2.C.purple, 2);
        P2.node(x, r.x + r.w * .72, r.y + r.h * .76, 18, "#ffe6e0", P2.C.accent);
        P2.arrow(x, [r.x + r.w * .44, r.y + r.h * .46], [r.x + r.w * .58, r.y + r.h * .46], P2.C.accent, 4);
      },
      division(x, r) {
        const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rr = Math.min(r.w, r.h) * .32;
        const pts = [];
        for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2;
          pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .78]); }
        for (let i = 0; i < 5; i++) P2.arrow(x, pts[i], pts[(i + 1) % 5], P2.C.blue, 4);
        const cols = ["#dff5e9", "#e3f0fd", "#fff2d6", "#f0e8fb", "#ffe6e0"];
        pts.forEach((p, i) => P2.node(x, p[0], p[1], 22, cols[i], P2.C.line));
      },
      biomolecules(x, r) {
        const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
        const pos = [[.25,.28],[.75,.28],[.25,.72],[.75,.72]];
        const cols = ["#fff2d6", "#e3f0fd", "#dff5e9", "#f0e8fb"];
        pos.forEach((p, i) => {
          const px = r.x + p[0] * r.w, py = r.y + p[1] * r.h;
          P2.box(x, px - 46, py - 34, 92, 68, cols[i], P2.C.line, 3);
          for (let j = 0; j < 3; j++) P2.node(x, px - 24 + j * 24, py, 9, P2.C.accent, "#ffffff");
        });
        P2.arrow(x, [r.x + r.w * .35, cy], [r.x + r.w * .65, cy], P2.C.blue, 3);
      },
      cancer(x, r) {
        const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rr = Math.min(r.w, r.h) * .30;
        const pts = [];
        for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2;
          pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .78]); }
        for (let i = 0; i < 5; i++) P2.arrow(x, pts[i], pts[(i + 1) % 5], P2.C.accent, 4);
        pts.forEach((p, i) => P2.node(x, p[0], p[1], 20, i === 3 ? "#ffc9bd" : P2.C.soft, P2.C.line));
        P2.node(x, cx, cy, 14, P2.C.purple, "#ffffff");
      }
    };
  })();

  const EVPLATE2D = (function () {
    const S = {};
    function add(section, o) { S["c9_cell:" + section] = o; }
    add("2.1", { kind: "discovery", capEn: "Hooke named cork boxes cells; Leeuwenhoek later saw living cells.",
      capHi: "हुक ने बाक़ के खानों को कोशिका कहा; ल्यूवेनहुक ने जीवित कोशिकाएँ देखीं।",
      labels: [["Cork", "कॉर्क"], ["Lens", "लेंस"], ["Boxes", "खाने"], ["Cell name", "कोशिका नाम"]],
      anchors: [[.22,.35],[.74,.42],[.36,.62],[.78,.84]] });
    add("2.2", { kind: "plantAnimal", capEn: "Plant cells add a wall, chloroplasts and a large vacuole.",
      capHi: "पादप कोशिका में भित्ति, हरितलवक और बड़ी रिक्तिका होती है।",
      labels: [["Wall", "कोशिका भित्ति"], ["Membrane", "झिल्ली"], ["Nucleus", "केन्द्रक"], ["Chloroplast", "हरितलवक"], ["Vacuole", "रिक्तिका"]],
      anchors: [[.10,.24],[.42,.48],[.27,.48],[.20,.32],[.16,.70]] });
    add("2.3", { kind: "proEuk", capEn: "Prokaryotes lack a nuclear membrane; eukaryotes have a true nucleus.",
      capHi: "प्रोकैरियोटी में केन्द्रक झिल्ली नहीं होती; यूकैरियोटी में वास्तविक केन्द्रक होता है।",
      labels: [["Cell", "कोशिका"], ["Prokaryote", "प्रोकैरियोटी"], ["Eukaryote", "यूकैरियोटी"], ["Nucleus", "केन्द्रक"]],
      anchors: [[.50,.18],[.26,.48],[.74,.48],[.74,.56]] });
    add("2.4", { kind: "membrane", capEn: "The lipid bilayer is selectively permeable; channels guide diffusion and osmosis.",
      capHi: "लिपिड द्विपरत चयनात्मक पारगम्य है; चैनल विसरण और परासरण का मार्ग देते हैं।",
      labels: [["Outside", "बाहर"], ["Lipid bilayer", "लिपिड द्विपरत"], ["Channel", "चैनल"], ["Inside", "भीतर"]],
      anchors: [[.16,.18],[.30,.50],[.50,.50],[.84,.82]] });
    add("2.5", { kind: "wall", capEn: "Cellulose wall gives shape; vacuoles store water, salts and waste.",
      capHi: "सेलुलोज भित्ति आकार देती है; रिक्तिका जल, लवण और अपशिष्ट संग्रह करती है।",
      labels: [["Wall", "कोशिका भित्ति"], ["Membrane", "झिल्ली"], ["Cytoplasm", "जीवद्रव्य"], ["Vacuole", "रिक्तिका"]],
      anchors: [[.18,.18],[.18,.40],[.18,.62],[.72,.70]] });
    add("2.6", { kind: "nucleus", capEn: "Chromosomes of DNA inside the nucleus control growth, metabolism and inheritance.",
      capHi: "केन्द्रक के DNA गुणसूत्र वृद्धि, उपापचय और वंशानुक्रम नियंत्रित करते हैं।",
      labels: [["Nucleus", "केन्द्रक"], ["Nuclear membrane", "केन्द्रक झिल्ली"], ["Chromosome", "गुणसूत्र"], ["DNA", "DNA"]],
      anchors: [[.50,.48],[.50,.24],[.34,.48],[.66,.48]] });
    add("2.7", { kind: "organelles", capEn: "Chloroplasts trap light to make sugar; mitochondria release energy as ATP.",
      capHi: "हरितलवक प्रकाश से शर्करा बनाते हैं; माइटोकॉन्ड्रिया ATP के रूप में ऊर्जा देते हैं।",
      labels: [["Light", "प्रकाश"], ["Chloroplast", "हरितलवक"], ["Sugar", "शर्करा"], ["Mitochondrion", "माइटोकॉन्ड्रिया"], ["ATP", "ATP"]],
      anchors: [[.16,.20],[.72,.28],[.50,.58],[.28,.28],[.84,.58]] });
    add("2.8", { kind: "erGolgi", capEn: "ER transports proteins and lipids; Golgi packages them; lysosomes digest worn parts.",
      capHi: "ER प्रोटीन और वसा पहुँचाती है; गॉल्जी पैक करता है; लाइसोसोम पुराने भाग पचाते हैं।",
      labels: [["Rough ER", "खुरदरी ER"], ["Smooth ER", "चिकनी ER"], ["Golgi", "गॉल्जी"], ["Vesicle", "पुटिका"]],
      anchors: [[.20,.28],[.20,.62],[.72,.40],[.72,.76]] });
    add("2.9", { kind: "division", capEn: "Mitosis makes two identical cells; meiosis halves chromosomes for gametes.",
      capHi: "समसूत्री से दो समान कोशिकाएँ; अर्धसूत्री से युग्मक हेतु गुणसूत्र आधे होते हैं।",
      labels: [["Parent", "जनक"], ["Replication", "प्रतिकृति"], ["Mitosis", "समसूत्री"], ["Meiosis", "अर्धसूत्री"], ["Daughter", "संतति"]],
      anchors: [[.50,.12],[.84,.36],[.72,.76],[.28,.76],[.16,.36]] });
    add("2.10", { kind: "biomolecules", capEn: "Carbohydrates, proteins, lipids and nucleic acids build and run the cell.",
      capHi: "कार्बोहाइड्रेट, प्रोटीन, वसा और न्यूक्लिक अम्ल कोशिका बनाते और चलाते हैं।",
      labels: [["Carbohydrate", "कार्बोहाइड्रेट"], ["Protein", "प्रोटीन"], ["Lipid", "वसा"], ["Nucleic acid", "न्यूक्लिक अम्ल"]],
      anchors: [[.25,.28],[.75,.28],[.25,.72],[.75,.72]] });
    add("2.11", { kind: "cancer", capEn: "Checkpoint failure and mutation can turn normal division into a tumour.",
      capHi: "जाँच बिंदु की विफलता और उत्परिवर्तन सामान्य विभाजन को ट्यूमर बना सकते हैं।",
      labels: [["Normal division", "सामान्य विभाजन"], ["Checkpoint", "जाँच बिंदु"], ["Mutation", "उत्परिवर्तन"], ["Tumour", "ट्यूमर"], ["Therapy", "उपचार"]],
      anchors: [[.50,.12],[.84,.36],[.72,.76],[.28,.76],[.16,.36]] });
    return {
      has(w, sp) { return !!(w && sp && S[w.id + ":" + sp.section]); },
      spec(w, sp) { return (w && sp) ? (S[w.id + ":" + sp.section] || null) : null; },
      keys() { return Object.keys(S); }
    };
  })();

  function draw2DPlate(x, sp, X, Y, W, H, zoomed) {
    const spec = EVPLATE2D.spec(currentWorld, sp);
    if (!spec) return drawBigDiagram(x, sp, X, Y, W, H);
    x.save();
    x.fillStyle = P2.C.paper; x.fillRect(X, Y, W, H);
    x.strokeStyle = P2.C.line; x.lineWidth = 5; x.strokeRect(X + 3, Y + 3, W - 6, H - 6);
    x.fillStyle = P2.C.pale; x.fillRect(X + 8, Y + 8, W - 16, 62);
    x.fillStyle = P2.C.accent; x.textAlign = "left";
    x.font = "900 30px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    drawFitted(x, "2D PLATE · " + BI(sp.title, sp.titleHi), X + 26, Y + 48, W * 0.60, x.font, 1, 0, 0, 20);
    x.textAlign = "right"; x.font = "900 20px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    drawFitted(x, "§ " + sp.section + " · CLASS " + (currentWorld.cls || "IX"), X + W - 22, Y + 46, W * 0.34, x.font, 1, 0, 0, 16);
    x.textAlign = "left";
    const r = { x: X + 188, y: Y + 86, w: W - 376, h: H - 186 };
    (P2D[spec.kind] || P2D.discovery)(x, r);
    const n = spec.labels.length, leftN = Math.ceil(n / 2), rows = Math.max(leftN, n - leftN);
    const rowH = Math.min(58, (r.h - 12) / rows - 10);
    for (let i = 0; i < n; i++) {
      const side = i < leftN ? "left" : "right";
      const row = side === "left" ? i : i - leftN;
      const bx = side === "left" ? X + 10 : X + W - 178;
      const by = r.y + 8 + row * (rowH + 10);
      const a = spec.anchors[i] || [.5, .5];
      P2.callout(x, spec.labels[i][0], spec.labels[i][1], bx, by, 168, rowH,
        r.x + a[0] * r.w, r.y + a[1] * r.h, side, zoomed);
    }
    const capY = Y + H - 56;
    x.fillStyle = P2.C.soft; x.fillRect(X + 8, capY - 30, W - 16, 68);
    x.strokeStyle = P2.C.rule; x.lineWidth = 2; x.strokeRect(X + 8, capY - 30, W - 16, 68);
    captionPair(x, capY - 6, spec.capEn, spec.capHi,
      "800 20px Georgia, 'Noto Sans Devanagari Embedded', serif",
      { x0: X + 18, width: W - 36, gap: 16, ink: P2.C.ink, accent: P2.C.accent,
        colLines: 2, fullLines: 2, lh: 14, maxH: 48, minPx: 14 });
    x.restore();
  }

  /* Fit a single line to a pixel width (Devanagari is wider than Latin). */
  function fitLine(x, text, maxW, font) {
    const base = fontPx(font) || 24;
    const t = String(text == null ? "" : text).replace(/\$\s+(?=[0-9A-Za-z(+\-])/g, "$");
    let size = base; x.font = font;
    while (x.measureText(t).width > maxW && size > 6) { size -= 1; x.font = fontAt(font, size); }
    return t;  /* never truncate; drawFitted() uses wrap() for long copy */
  }
  /* Draw full text in its allotted width/height. wrap() adaptively shrinks the
     font and passes maxWidth to fillText so no line can cross the page frame. */
  function drawFitted(x, text, px, py, maxW, font, maxLines, lh, maxH, minPx) {
    const base = fontPx(font) || 24, before = x.font;
    const out = wrap(x, text, px, py, maxW, lh || Math.max(10, base * 0.78),
                     maxLines || 1, font, maxH || 0, minPx || 12);
    x.font = before;
    return out;
  }
  /* Full-copy single line: shrink to the readability floor, then let Canvas
     compress the glyph advance to maxW. This NEVER drops a word or adds an
     ellipsis, and keeps prediction questions clear of the option grid. */
  function drawOneLine(x, text, px, py, maxW, font, minPx) {
    const base = fontPx(font) || 24;
    const floor = Math.min(base, Math.max(12, minPx || 12));
    let size = base;
    const clean = String(text == null ? "" : text)
      .replace(/\$\s+(?=[0-9A-Za-z(+\-])/g, "$").trim();
    x.font = fontAt(font, size);
    while (size > floor && x.measureText(clean).width > maxW) {
      size -= 1; x.font = fontAt(font, size);
    }
    x.fillText(clean, px, py, maxW);
    x.font = font;
    return py + size * 1.12;
  }
  /* Deliberate literal-currency / math-sign contract. Even when the source
     catalogue has no "$" today, a future pack containing "$ 1250" must keep
     the sign attached to its number across a forced line break. */
  function dollarAudit() {
    const saved = auditLog; auditLog = [];
    const { x: cx } = pageCanvas();
    const sample = "Molar cost $ 1250 and ΔH $ -42 kJ · गणित $ x + $ y";
    try {
      wrap(cx, sample, 40, 40, 180, 18, 5, "700 24px Georgia, serif");
      const lines = auditLog.map(r => r.text);
      const joined = lines.join(" ");
      const attached = /\$[0-9A-Za-z(+\-]/.test(joined);
      const stranded = lines.some(v => /\$\s*$/.test(v) || /\$\s+[0-9A-Za-z(+\-]/.test(v));
      return { pass: attached && !stranded && lines.length > 1, sample: sample,
               lines: lines, attached: attached, stranded: stranded };
    } finally { auditLog = saved; }
  }
  /* Launch-day caption flow: EN + HI occupy two NON-OVERLAPPING columns in
     bilingual mode, so full text stays legible instead of being shrunk into a
     single stacked lane. In single-language mode the paragraph owns the full
     width. Every call returns the next free baseline. */
  function captionPair(x, y, en, hiText, font, o) {
    const hi = lang === "hi", both = lang === "both";
    const x0 = o.x0 || 96, fullW = o.width || 708, gap = o.gap || 20;
    const colW = (fullW - gap) / 2;
    let end = y; x.textAlign = "left";
    if (both) {
      x.fillStyle = o.ink; x.font = font;
      end = Math.max(end, drawFitted(x, en, x0, y, colW, font, o.colLines, o.lh,
                                     o.maxH || 0, o.minPx || 6));
      x.fillStyle = o.accent; x.font = font;
      end = Math.max(end, drawFitted(x, hiText, x0 + colW + gap, y, colW, font, o.colLines, o.lh,
                                     o.maxH || 0, o.minPx || 6));
    } else {
      x.fillStyle = hi ? o.accent : o.ink; x.font = font;
      end = drawFitted(x, hi ? hiText : en, x0, y, fullW, font, o.fullLines, o.lh,
                       o.maxH || 0, o.minPx || 6);
    }
    return end;
  }
  const bilingual = (en, hiText) => {
    const hi = lang === "hi", both = lang === "both";
    return both ? (en + (hiText && hiText !== en ? " · " + hiText : ""))
                : (hi ? (hiText || en) : en);
  };
  function zoneLabel(x, txt, y) {
    x.fillStyle = PC.hi; x.font = "900 28px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    drawFitted(x, txt, 84, y, 732, x.font, 1, 0); return y + 44;
  }
  function folio(x, num) {
    x.fillStyle = PC.rule; x.font = "700 26px Arial, sans-serif"; x.textAlign = "center";
    x.fillText("— " + num + " —", 450, 1182); x.textAlign = "left";
  }

  /* ============================ DETAIL PLATE (default classroom) ==========
     Fixed zones. Left = bilingual text, right = live high-contrast diagram.
     Type is deliberately large: primary runs are >= 32px on a 900x1200
     canvas, which is >= 18px on a 1440x900 projector at 30 ft. */
  function classroomLeft(sp, world, num) {
    if (BT() === "big") return bigLeft(sp, world, num);
    const { c, x } = pageCanvas(), hi = lang === "hi", both = lang === "both";
    classroomHead(x, world, sp, "TEXT", num);
    x.textAlign = "left";
    /* the 54px headline cap-height reaches ~44px above its baseline, so the
       section eyebrow must sit higher than the old 208px; 196 + 24 keeps a
       clean gap and no glyph can cross into the title zone. */
    let y = 196;
    y = zoneLabel(x, "§ " + sp.section + "  ·  CBSE 2026-27  ·  " + String(sp.status || "assessed").toUpperCase(), y) + 24;
    x.fillStyle = PC.ink;
    y = wrap(x, both || !hi ? sp.title : sp.titleHi, 84, y, 732, 60, 2,
             "900 54px Georgia, 'Noto Sans Devanagari Embedded', serif");
    if (both) {
      x.fillStyle = PC.hi;
      y = wrap(x, sp.titleHi, 84, y + 10, 732, 50, 2,
               "900 46px Georgia, 'Noto Sans Devanagari Embedded', serif");
    }
    y = Math.min(y + 28, 500);   /* keep the 2-line Hindi title clear of CORE CONCEPT */
    y = zoneLabel(x, both ? "CORE CONCEPT · मुख्य विचार" : (hi ? "मुख्य विचार" : "CORE CONCEPT"), y);
    x.fillStyle = PC.ink;
    if (both || !hi) y = wrap(x, sp.concept, 84, y, 732, 44, 4,
                              "800 38px Georgia, 'Noto Sans Devanagari Embedded', serif");
    if (both || hi) {
      x.strokeStyle = PC.rule; x.lineWidth = 3; x.beginPath(); x.moveTo(84, y - 8); x.lineTo(816, y - 8); x.stroke();
      x.fillStyle = PC.accent;
      y = wrap(x, sp.conceptHi, 84, y + 12, 732, 38, 2,
               "800 32px Georgia, 'Noto Sans Devanagari Embedded', serif");
    }
    y = Math.min(y + 14, 770);
    if (sp.formula) {
      x.fillStyle = PC.pale; x.fillRect(84, y, 732, 104);
      x.strokeStyle = PC.boxline; x.lineWidth = 4; x.strokeRect(84, y, 732, 104);
      x.fillStyle = PC.amber; x.font = "900 23px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
      drawFitted(x, sp.formula.label.toUpperCase(), 102, y + 28, 690, x.font, 1, 0);
      x.fillStyle = PC.ink; x.font = "900 44px Georgia, 'Noto Sans Devanagari Embedded', serif";
      drawFitted(x, sp.formula.eq, 102, y + 66, 690, x.font, 1, 0);
      x.fillStyle = PC.accent; x.font = "700 23px Georgia, 'Noto Sans Devanagari Embedded', serif";
      drawFitted(x, sp.formula.note || "", 102, y + 94, 690, x.font, 1, 0);
    }
    /* KEY TERMS: adaptive band that fills whatever space is left. */
    const bandTop = y + 104 + 16, bandBottom = 878;
    if (bandBottom - bandTop >= 70) {
      const bh = bandBottom - bandTop, v = (VOC(sp) || []).slice(0, 3);
      x.fillStyle = PC.pale; x.fillRect(84, bandTop, 732, bh);
      x.strokeStyle = PC.boxline; x.lineWidth = 3; x.strokeRect(84, bandTop, 732, bh);
      x.fillStyle = PC.hi; x.font = "900 24px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
      x.fillText(both ? "KEY TERMS · मुख्य शब्द" : (hi ? "मुख्य शब्द" : "KEY TERMS"), 102, bandTop + 32);
      const avail = bh - 46, rows = Math.max(1, Math.min(3, Math.floor(avail / 30)));
      const rh = avail / rows, fs = Math.max(20, Math.min(27, Math.round(rh * 0.72)));
      if (rows === 1) {
        x.fillStyle = PC.ink; x.font = "900 " + fs + "px Georgia, 'Noto Sans Devanagari Embedded', serif";
        drawFitted(x, v.map(q => q[0]).join("  ·  "), 102, bandTop + 46 + rh * 0.72, 690, x.font, 1, 0);
      } else v.slice(0, rows).forEach((pair, i) => {
        const yy = bandTop + 46 + i * rh + rh * 0.72;
        x.fillStyle = PC.ink; x.font = "900 " + fs + "px Georgia, 'Noto Sans Devanagari Embedded', serif";
        drawFitted(x, pair[0], 102, yy, 328, x.font, 1, 0);
        x.fillStyle = PC.accent; x.font = "800 " + Math.max(20, fs - 3) + "px Georgia, 'Noto Sans Devanagari Embedded', serif";
        drawFitted(x, pair[1], 452, yy, 350, x.font, 1, 0);
      });
    }
    y = 892;
    const pr = P(sp);
    x.fillStyle = "#ffffff"; x.fillRect(84, y, 732, 152);
    x.strokeStyle = PC.boxline; x.lineWidth = 4; x.strokeRect(84, y, 732, 152);
    x.fillStyle = PC.hi; x.font = "900 24px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.fillText(both ? "PREDICT FIRST · पहले अनुमान" : (hi ? "पहले अनुमान लगाएँ" : "PREDICT FIRST"), 102, y + 28);
    x.fillStyle = PC.ink; x.font = "800 28px Georgia, 'Noto Sans Devanagari Embedded', serif";
    const qEnd = drawOneLine(x, pr.q, 102, y + 60, 690, x.font, 12);
    /* Three full-width options used to be stacked at fixed 25px baselines;
       a wrapped bilingual question then landed on top of option B. Options
       now own three independent columns with their own height budget. */
    const oy = qEnd + 12, colGap = 14, colW = (690 - 2 * colGap) / 3;
    (pr.options || []).slice(0, 3).forEach((o, i) => {
      x.fillStyle = PC.ink; x.font = "800 20px Georgia, 'Noto Sans Devanagari Embedded', serif";
      drawFitted(x, String.fromCharCode(65 + i) + ".  " + o,
                 102 + i * (colW + colGap), oy, colW, x.font, 3, 0, 42, 12);
    });
    y = 1058;
    x.fillStyle = PC.band; x.fillRect(84, y, 732, 94);
    x.strokeStyle = PC.accent; x.lineWidth = 3; x.strokeRect(84, y, 732, 94);
    x.fillStyle = PC.accent; x.font = "900 23px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.fillText(both ? "KEY FACT · मुख्य तथ्य" : (hi ? "मुख्य तथ्य" : "KEY FACT"), 102, y + 28);
    x.fillStyle = PC.ink; x.font = "800 32px Georgia, 'Noto Sans Devanagari Embedded', serif";
    drawFitted(x, both || !hi ? sp.explain : (sp.explainHi || sp.explain), 102, y + 66, 690, x.font, 2, 12);
    folio(x, num);
    return c;
  }
  /* ======================================================================
     R6 · RIGHT PAGE = REAL 3D VIEWPORT
     The rectangle below is NOT painted with a diagram: FIGURE3D renders the
     actual Three.js apparatus into a WebGLRenderTarget and a plane mapped to
     that texture sits on the physical page at exactly this rectangle. What
     remains printed is the frame, the LIVE model readout, the concept chips
     (model-driven active card) and the bilingual captions. Every lesson gets
     it — 26 live chapters, 240 student spreads, no exceptions.
     ====================================================================== */
  function draw3DPlate(x, sp, X, Y, W, H) {
    /* derive the plate text from the SAME declarative spec as the 3D geometry,
       independent of render timing */
    const b3 = (typeof BIO3D !== "undefined") ? BIO3D.spec(currentWorld, sp) : null;
    const spec = diagramSpec(sp);
    /* The printed concept chips must name the SAME anatomical parts as the
       live 3D tags: text and image are aligned, not merely adjacent. */
    const bioL = b3 ? b3.labels.map(d => lang === "hi" ? d.hi : d.en) : null;
    const L = bioL ? bioL.slice(0, 6) : spec.labels, n = L.length;
    const BF = BT() === "big" ? 1.22 : 1, DACT = liveIndex(sp, n);
    /* Six full lesson labels in ONE 100px-wide row forced 6px type. Split
       them into two legible rows (3 wide chips each) and give each chip three
       lines at a hard 14px floor. The 3D viewport shrinks by the exact
       amount reserved, so the frame and chips never overlap. */
    const rows = n > 3 ? 2 : 1, cols = Math.ceil(n / rows);
    const chipH = 76, gap = 8, chipArea = rows * chipH + (rows - 1) * gap + 16;
    const vh = H - 74 - chipArea, vx = X + 8, vy = Y + 74, vw = W - 16;
    x.save();
    x.fillStyle = "#ffffff"; x.fillRect(X, Y, W, H);
    x.strokeStyle = PC.boxline; x.lineWidth = 5; x.strokeRect(X + 3, Y + 3, W - 6, H - 6);
    /* header band: real 3D label + LIVE readout straight from evalModel() */
    x.fillStyle = PC.band; x.fillRect(X + 8, Y + 8, W - 16, 62);
    x.fillStyle = PC.accent; x.textAlign = "left";
    x.font = "900 " + Math.round(34 * BF) + "px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    const head3d = b3 ? ("BIO 3D · " + String(b3.en).toUpperCase()) : ("REAL 3D · " + String(spec.kind).toUpperCase());
    drawFitted(x, head3d, X + 26, Y + 48, W * 0.52, x.font, 1, 0);
    const live = liveReadout(sp);
    if (live) {
      x.textAlign = "right";
      x.font = "900 " + Math.round(21 * BF) + "px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
      drawFitted(x, "● LIVE  " + live, X + W - 22, Y + 46, W * 0.42, x.font, 1, 0);
      x.textAlign = "left";
    }
    /* viewport: light gradient + fine grid. The live 3D plane covers this
       region; the grid remains as a visible, honest fallback if WebGL fails. */
    /* neutral plate in the live 3D clear colour (#eaf0f6): no grid line-art, so a
       page turn never flashes a drawing before the real figure arrives */
    x.fillStyle = "#eaf0f6"; x.fillRect(vx, vy, vw, vh);
    x.strokeStyle = PC.boxline; x.lineWidth = 3; x.strokeRect(vx, vy, vw, vh);
    x.strokeStyle = PC.accent; x.lineWidth = 6;
    [[vx, vy, 1, 1], [vx + vw, vy, -1, 1], [vx, vy + vh, 1, -1], [vx + vw, vy + vh, -1, -1]].forEach(c => {
      x.beginPath(); x.moveTo(c[0] + c[2] * 34, c[1]); x.lineTo(c[0], c[1]); x.lineTo(c[0], c[1] + c[3] * 34); x.stroke();
    });
    /* Student-facing printed pages carry no engine/renderer watermark: the
       live 3D plane and its honest grid fallback are the whole viewport. */
    x.textAlign = "left";
    /* concept chips: the pure model picks the highlighted card. Full part
       names are wrapped, never abbreviated; two rows keep the type >= 14px. */
    const cy0 = vy + vh + 8;
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / cols), col = i % cols;
      const perRow = Math.min(cols, n - row * cols);
      const cw = (vw - gap * (perRow - 1)) / perRow;
      const px = vx + col * (cw + gap), py = cy0 + row * (chipH + gap);
      const on = i === DACT;
      x.fillStyle = on ? "#fff2d6" : "#eef4fa"; x.fillRect(px, py, cw, chipH);
      x.strokeStyle = on ? PC.hi : PC.boxline; x.lineWidth = on ? 5 : 3; x.strokeRect(px, py, cw, chipH);
      if (on) { x.fillStyle = PC.hi; x.fillRect(px + 6, py + 6, 12, 12); }
      x.fillStyle = PC.ink; x.textAlign = "center"; x.textBaseline = "alphabetic";
      x.font = "900 " + Math.round(24 * BF) + "px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
      drawFitted(x, L[i], px + cw / 2, py + 24, cw - 14, x.font, 3, 0, chipH - 8, 14);
      x.textAlign = "left";
    }
    x.restore();
  }
  function figurePlate(x, sp, X, Y, W, H) {
    if (plate2d && EVPLATE2D.has(currentWorld, sp)) draw2DPlate(x, sp, X, Y, W, H);
    else if (plate2d) drawBigDiagram(x, sp, X, Y, W, H); /* honest local fallback underneath draft */
    else if (figureMode === "3d" && FIGURE3D.ready) draw3DPlate(x, sp, X, Y, W, H);
    else drawBigDiagram(x, sp, X, Y, W, H);   /* honest GPU-failure fallback */
  }
  function classroomRight(sp, world, num) {
    if (BT() === "big") return bigRight(sp, world, num);
    const { c, x } = pageCanvas(), hi = lang === "hi", both = lang === "both";
    classroomHead(x, world, sp, "FIGURE", num);
    /* The right page is the IMAGE: one live declarative diagram, always. */
    figurePlate(x, sp, 96, 196, 708, 610);
    let y = 838;
    x.textAlign = "left";
    x.fillStyle = PC.hi; x.font = "900 27px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.fillText(both ? "FIGURE · चित्र" : (hi ? "चित्र" : "FIGURE"), 96, y); y += 36;
    y = captionPair(x, y, sp.fig, sp.figHi || sp.fig,
      "800 30px Georgia, 'Noto Sans Devanagari Embedded', serif",
      { ink: PC.ink, accent: PC.accent, lh: 13, colLines: 3, fullLines: 2 }) + 10;
    x.fillStyle = PC.hi; x.font = "900 27px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.fillText(both ? "TRY THIS · करके देखें" : (hi ? "करके देखें" : "TRY THIS"), 96, y); y += 34;
    y = captionPair(x, y, sp.tryHint, sp.hintHi || sp.tryHint,
      "800 28px Georgia, 'Noto Sans Devanagari Embedded', serif",
      { ink: PC.ink, accent: PC.accent, lh: 13, colLines: 3, fullLines: 2 }) + 10;
    x.fillStyle = PC.rule; x.font = "700 26px Arial, sans-serif";
    const scene = "SCENE · " + (BLOCKS[sp.scene.type] ? BLOCKS[sp.scene.type].label : sp.scene.type).toUpperCase();
    y = drawFitted(x, scene, 96, y, 708, x.font, 1, 0) + 8;
    const remaining = 1110 - y;
    const lines = Math.max(2, Math.min(5, Math.floor(remaining / 11)));
    x.fillStyle = PC.ink; x.font = "900 30px Georgia, 'Noto Sans Devanagari Embedded', serif";
    drawFitted(x, bilingual(sp.explain, sp.explainHi), 96, y, 708, x.font, lines, 11);
    folio(x, num);
    return c;
  }

  /* ================== 30 FT / BIG BOARD PRESENTATION PLATE =================
     One click (◧ 30 FT) removes dense body text and keeps only four very
     large teaching lines + the full-size diagram. Primary type >= 64px on
     the 1200px canvas => >= 30px on screen, readable from the back of a
     classroom. All 227 topics remain in the detail plate and the dock. */
  function bigLeft(sp, world, num) {
    const { c, x } = pageCanvas(), hi = lang === "hi", both = lang === "both";
    classroomHead(x, world, sp, "TEXT · 30 FT", num);
    x.textAlign = "left";
    /* 30 FT plate: one flowing cursor, explicit vertical budgets, EN and HI
       in separate columns, and a hard 16px floor for every teaching line.
       The full explanation remains on the detail plate and on this plate's
       KEY FACT; nothing is abbreviated to make the layout look tidy. */
    let y = 224;
    x.fillStyle = PC.hi; x.font = "900 34px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    y = drawFitted(x, "§ " + sp.section + "  ·  CBSE 2026-27  ·  30 FT / बड़ा बोर्ड",
                   84, y, 732, x.font, 1, 38, 46, 24) + 34;
    x.fillStyle = PC.ink; x.font = "900 56px Georgia, 'Noto Sans Devanagari Embedded', serif";
    y = drawFitted(x, both || !hi ? sp.title : sp.titleHi, 84, y, 732,
                   x.font, 2, 60, 130, 28) + 8;
    if (both) {
      x.fillStyle = PC.hi; x.font = "900 44px Georgia, 'Noto Sans Devanagari Embedded', serif";
      y = drawFitted(x, sp.titleHi, 84, y, 732, x.font, 2, 48, 104, 24) + 12;
    }
    x.fillStyle = PC.hi; x.font = "900 32px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.fillText(both ? "CORE CONCEPT · मुख्य विचार" : (hi ? "मुख्य विचार" : "CORE CONCEPT"), 84, y);
    y += 38;
    y = captionPair(x, y, sp.concept, sp.conceptHi || sp.concept,
      "900 30px Georgia, 'Noto Sans Devanagari Embedded', serif",
      { ink: PC.ink, accent: PC.accent, x0: 84, width: 732, gap: 20,
        lh: 26, colLines: 8, fullLines: 6, maxH: 210, minPx: 16 }) + 10;
    if (sp.formula) {
      const fFont = "900 52px Georgia, 'Noto Sans Devanagari Embedded', serif";
      const fm = fittedMetrics(sp.formula.eq, 690, fFont, 3, 56, 180, 16);
      const boxH = Math.max(76, (fm ? fm.height : 60) + 30);
      x.fillStyle = PC.pale; x.fillRect(84, y, 732, boxH);
      x.strokeStyle = PC.boxline; x.lineWidth = 5; x.strokeRect(84, y, 732, boxH);
      x.fillStyle = PC.ink; x.font = fFont;
      const formulaEnd = drawFitted(x, sp.formula.eq, 102, y + 20 + (fm ? fm.size : 52), 690,
                                    x.font, 3, 56, 180, 16);
      y = Math.max(y + boxH + 10, formulaEnd + 36);
    }
    x.fillStyle = PC.accent; x.font = "900 32px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.fillText(both ? "KEY FACT · मुख्य तथ्य" : (hi ? "मुख्य तथ्य" : "KEY FACT"), 102, y);
    y += 36;
    captionPair(x, y, sp.explain, sp.explainHi || sp.explain,
      "900 26px Georgia, 'Noto Sans Devanagari Embedded', serif",
      { ink: PC.ink, accent: PC.accent, x0: 102, width: 690, gap: 16,
        lh: 22, colLines: 6, fullLines: 5,
        maxH: Math.max(70, Math.min(200, 1130 - y)), minPx: 16 });
    folio(x, num);
    return c;
  }
  function bigRight(sp, world, num) {
    const { c, x } = pageCanvas(), hi = lang === "hi", both = lang === "both";
    classroomHead(x, world, sp, "FIGURE · 30 FT", num);
    figurePlate(x, sp, 96, 196, 708, 610);
    /* The dense explain text belongs to the left 30 FT plate and to the
       detail plate. Here the captions get the reclaimed space so EN/HI can
       stay >= 16px instead of collapsing to 6px. */
    let y = 830;
    x.textAlign = "left";
    x.fillStyle = PC.hi; x.font = "900 36px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.fillText(both ? "FIGURE · चित्र" : (hi ? "चित्र" : "FIGURE"), 96, y); y += 44;
    y = captionPair(x, y, sp.fig, sp.figHi || sp.fig,
      "900 30px Georgia, 'Noto Sans Devanagari Embedded', serif",
      { ink: PC.ink, accent: PC.accent, x0: 96, width: 708, gap: 20,
        lh: 22, colLines: 5, fullLines: 4, maxH: 100, minPx: 16 }) + 14;
    x.fillStyle = PC.hi; x.font = "900 36px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.fillText(both ? "TRY THIS · करके देखें" : (hi ? "करके देखें" : "TRY THIS"), 96, y); y += 44;
    captionPair(x, y, sp.tryHint, sp.hintHi || sp.tryHint,
      "900 28px Georgia, 'Noto Sans Devanagari Embedded', serif",
      { ink: PC.ink, accent: PC.accent, x0: 96, width: 708, gap: 20,
        lh: 22, colLines: 5, fullLines: 4, maxH: 110, minPx: 16 });
    folio(x, num);
    return c;
  }

  function head(x, world, sp, side, num) {
    if (TH()) return classroomHead(x, world, sp, side, num);
    const hi = lang === "hi", both = lang === "both";
    x.fillStyle = "#8b7a5a"; x.font = "600 25px Georgia, 'Noto Sans Devanagari Embedded', serif"; x.textAlign = "left";
    x.fillText("SCIVERSE 3D  ·  " + (world.board || "CBSE / NCERT") + "  ·  CLASS " + (world.cls || "IX"), 84, 94);
    x.fillStyle = "#24303c";
    if (both) {
      x.font = "italic 21px Georgia, 'Noto Sans Devanagari Embedded', serif";
      drawFitted(x, BI(world.title, world.titleHi), 84, 130, 732, x.font, 1, 0);
    } else {
      x.font = "italic 27px Georgia, 'Noto Sans Devanagari Embedded', serif";
      drawFitted(x, hi ? world.titleHi : world.title, 84, 130, 732, x.font, 1, 0);
    }
    x.strokeStyle = "#c3b494"; x.lineWidth = 2; x.beginPath(); x.moveTo(84, 150); x.lineTo(816, 150); x.stroke();
    x.fillStyle = "#9a8a68"; x.font = "23px Georgia, 'Noto Sans Devanagari Embedded', serif"; x.textAlign = "right";
    x.fillText("§ " + sp.section + "   ·   " + side, 816, 94);
    x.textAlign = "center"; x.fillStyle = "#8b7a5a"; x.font = "24px Georgia, 'Noto Sans Devanagari Embedded', serif";
    x.fillText("— " + num + " —", 450, 1166); x.textAlign = "left";
  }
  function drawLeft(sp, world, num) {
    if (TH()) return classroomLeft(sp, world, num);
    const { c, x } = pageCanvas(), hi = lang === "hi", both = lang === "both";
    head(x, world, sp, both ? "TEXT · पाठ" : "TEXT", num);
    x.textAlign = "left";
    let y = 198;
    if (both) {
      x.fillStyle = "#1f2c38"; x.font = "bold 32px Georgia, 'Noto Sans Devanagari Embedded', serif";
      y = wrap(x, sp.title, 84, y, 730, 38, 2, x.font) + 4;
      x.fillStyle = "#8a4f2c"; x.font = "bold 27px Georgia, 'Noto Sans Devanagari Embedded', serif";
      y = wrap(x, sp.titleHi, 84, y, 730, 34, 2, x.font) + 6;
    } else {
      const serif = "bold 44px Georgia, 'Noto Sans Devanagari Embedded', serif";
      x.fillStyle = "#1f2c38";
      y = wrap(x, hi ? sp.titleHi : sp.title, 84, y, 730, 52, 2, serif) + 8;
    }
    x.fillStyle = "#b3573b"; x.font = "600 23px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.fillText(both ? "◆  CORE CONCEPT · मुख्य विचार" : ("◆  " + (hi ? "मुख्य विचार" : "CORE CONCEPT")), 84, y); y += 36;
    if (both) {
      const bf = "bold 18px Georgia, 'Noto Sans Devanagari Embedded', serif";
      x.fillStyle = "#2f3a45";
      y = wrap(x, sp.concept, 84, y, 730, 22, 6, bf) + 4;
      x.strokeStyle = "#c9b98f"; x.lineWidth = 1;
      x.beginPath(); x.moveTo(84, y - 6); x.lineTo(816, y - 6); x.stroke();
      x.fillStyle = "#6b4a2a";
      y = wrap(x, sp.conceptHi, 84, y, 730, 22, 6, bf) + 8;
    } else {
      x.fillStyle = "#2f3a45";
      const body = "bold 27px Georgia, 'Noto Sans Devanagari Embedded', serif";
      y = wrap(x, hi ? sp.conceptHi : sp.concept, 84, y, 730, 32, 8, body) + 12;
    }
    if (sp.formula) {
      x.fillStyle = "#e8dfc6"; x.strokeStyle = "#a89468"; x.lineWidth = 2;
      x.fillRect(84, y, 732, 100); x.strokeRect(84, y, 732, 100);
      x.fillStyle = "#8a6a2f"; x.font = "600 22px Arial, 'Noto Sans Devanagari Embedded', sans-serif"; x.fillText(sp.formula.label.toUpperCase(), 104, y + 26);
      x.fillStyle = "#26333f"; x.font = "bold 33px Georgia, 'Noto Sans Devanagari Embedded', serif";
      drawFitted(x, sp.formula.eq, 104, y + 62, 690, x.font, 1, 0);
      x.fillStyle = "#6b6049"; x.font = "italic 20px Georgia, 'Noto Sans Devanagari Embedded', serif";
      drawFitted(x, sp.formula.note || "", 104, y + 88, 690, x.font, 1, 0);
      y += 126;
    }
    /* printed prediction card (key terms live on the facing page) */
    y = Math.min(y, both ? 748 : 760);
    x.fillStyle = "#fbf7ec"; x.strokeStyle = "#c9b98f"; x.lineWidth = 3;
    x.fillRect(84, y, 732, 214); x.strokeRect(84, y, 732, 214);
    x.fillStyle = "#b3573b"; x.font = "600 23px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
    x.fillText(both ? "PREDICT FIRST · पहले अनुमान" : (hi ? "पहले अनुमान लगाएँ" : "PREDICT FIRST"), 104, y + 32);
    x.fillStyle = "#26333f";
    const pr = P(sp);
    let py;
    if (both) {
      py = wrap(x, pr.q, 104, y + 62, 690, 27, 2, "bold 20px Georgia, 'Noto Sans Devanagari Embedded', serif");
      (pr.options || []).slice(0, 3).forEach((o, i) => {
        x.fillStyle = "#33403a"; x.font = "bold 18px Georgia, 'Noto Sans Devanagari Embedded', serif";
        drawFitted(x, String.fromCharCode(65 + i) + ".  " + String(o), 118, py + 2 + i * 30, 690, x.font, 1, 0);
      });
    } else {
      py = wrap(x, pr.q, 104, y + 64, 690, 32, 2, "bold 25px Georgia, 'Noto Sans Devanagari Embedded', serif");
      (pr.options || []).slice(0, 3).forEach((o, i) => {
        x.fillStyle = "#33403a"; x.font = "bold 23px Georgia, 'Noto Sans Devanagari Embedded', serif";
        drawFitted(x, String.fromCharCode(65 + i) + ".  " + String(o), 118, py + 4 + i * 30, 690, x.font, 1, 0);
      });
    }
    /* flap hint */
    x.setLineDash([9, 8]); x.strokeStyle = "#b8a679"; x.lineWidth = 2;
    x.strokeRect(84, 1002, 732, 92); x.setLineDash([]);
    x.fillStyle = "#8b7a5a"; x.font = "italic 24px Georgia, 'Noto Sans Devanagari Embedded', serif"; x.textAlign = "center";
    x.fillText(both ? "✦  WHY? फ्लैप उठाएँ · lift the flap  ✦" : (hi ? "✦  उत्तर जानने के लिए फ्लैप उठाएँ  ✦" : "✦  lift the flap on screen to reveal WHY  ✦"), 450, 1056);
    x.textAlign = "left";
    return c;
  }
  function drawRight(sp, world, num) {
    if (TH()) return classroomRight(sp, world, num);
    const { c, x } = pageCanvas(), hi = lang === "hi", both = lang === "both";
    head(x, world, sp, both ? "POP-UP · 3D" : "POP-UP", num);
    x.strokeStyle = "#d8ccae";     x.strokeStyle = "#d8ccae"; x.lineWidth = 2; x.setLineDash([7, 9]);
    x.strokeRect(96, 190, 708, 690); x.setLineDash([]);
    x.fillStyle = "#c1b491"; x.font = "italic 26px Georgia, 'Noto Sans Devanagari Embedded', serif"; x.textAlign = "center";
    x.fillText(both ? "यहाँ से 3D मॉडल उठता है · the 3D model rises here" : (hi ? "यहाँ से 3D मॉडल उठता है" : "the 3D model rises from this page"), 450, 550);
    x.strokeStyle = "#cbbf9f"; x.lineWidth = 2;
    for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(150 + i * 100, 250); x.lineTo(150 + i * 100, 830); x.stroke(); }
    for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(120, 250 + i * 95); x.lineTo(780, 250 + i * 95); x.stroke(); }
    x.textAlign = "left";
    if (both) {
      x.fillStyle = "#8a6a2f"; x.font = "600 21px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
      x.fillText("FIGURE · चित्र", 96, 898);
      x.fillStyle = "#37424c"; x.font = "bold 19px Georgia, 'Noto Sans Devanagari Embedded', serif";
      drawFitted(x, sp.fig, 96, 926, 708, x.font, 2, 14);
      x.fillStyle = "#7a4b2a"; x.font = "bold 19px Georgia, 'Noto Sans Devanagari Embedded', serif";
      drawFitted(x, sp.figHi || sp.fig, 96, 956, 708, x.font, 2, 14);
      x.fillStyle = "#b3573b"; x.font = "600 21px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
      x.fillText("TRY THIS · करके देखें", 96, 992);
      x.fillStyle = "#4c5745"; x.font = "bold 18px Georgia, 'Noto Sans Devanagari Embedded', serif";
      drawFitted(x, sp.tryHint, 96, 1018, 708, x.font, 2, 14);
      x.fillStyle = "#6b5a33"; x.font = "bold 18px Georgia, 'Noto Sans Devanagari Embedded', serif";
      drawFitted(x, sp.hintHi || sp.tryHint, 96, 1046, 708, x.font, 2, 14);
      x.fillStyle = "#9a8a68"; x.font = "19px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
      drawFitted(x, "SCENE BLOCK  ·  " + (BLOCKS[sp.scene.type] ? BLOCKS[sp.scene.type].label : sp.scene.type).toUpperCase(), 96, 1084, 708, x.font, 1, 0);
    } else {
      x.fillStyle = "#8a6a2f"; x.font = "600 23px Arial, 'Noto Sans Devanagari Embedded', sans-serif"; x.fillText(hi ? "चित्र" : "FIGURE", 96, 898);
      x.fillStyle = "#37424c";
      drawFitted(x, sp.figHi && hi ? sp.figHi : sp.fig, 96, 930, 708, "bold 25px Georgia, 'Noto Sans Devanagari Embedded', serif", 2, 14);
      x.fillStyle = "#b3573b"; x.font = "600 22px Arial, 'Noto Sans Devanagari Embedded', sans-serif"; x.fillText(hi ? "करके देखें" : "TRY THIS", 96, 986);
      x.fillStyle = "#4c5745";
      drawFitted(x, hi && sp.hintHi ? sp.hintHi : sp.tryHint, 96, 1016, 708, "bold 24px Georgia, 'Noto Sans Devanagari Embedded', serif", 2, 14);
      x.fillStyle = "#9a8a68"; x.font = "21px Arial, 'Noto Sans Devanagari Embedded', sans-serif";
      drawFitted(x, "SCENE BLOCK  ·  " + (BLOCKS[sp.scene.type] ? BLOCKS[sp.scene.type].label : sp.scene.type).toUpperCase(), 96, 1060, 708, x.font, 1, 0);
    }
    return c;
  }
  function tex(c) {
    const t = new THREE.CanvasTexture(c);
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = (renderer && renderer.capabilities && renderer.capabilities.getMaxAnisotropy)
      ? Math.min(16, renderer.capabilities.getMaxAnisotropy()) : 8;
    return t;
  }
  /* canvas (900x1200) -> physical right-page (PW x PD) coordinates.
     u: x/900 ; v: 1-y/1200 (page was built with rotateX(-PI/2)).
     The plane's UVs therefore line up EXACTLY with the printed viewport. */
  function figureChipArea(sp) {
    /* The live plane must cover EXACTLY the printed viewport, not the whole
       3D card. draw3DPlate() reserves two 76px chip rows for 4-6 full labels
       (or one row for <=3), so derive the same geometry here. */
    let n = 6;
    if (sp) {
      const b3 = (typeof BIO3D !== "undefined" && currentWorld) ? BIO3D.spec(currentWorld, sp) : null;
      n = b3 ? Math.min(6, b3.labels.length) : diagramSpec(sp).labels.length;
    }
    const rows = n > 3 ? 2 : 1;
    return rows * 76 + (rows - 1) * 8 + 16;
  }
  function figureRect() {
    /* Detail AND 30 FT both use the same 610px figure card; the two-row
       concept chips shrink its live viewport to 360px. The old static
       464/544px plane painted over the chips and violated the zone table. */
    const sp = currentWorld && currentWorld.spreads[spreadIndex];
    return { x: 104, y: 270, w: 692, h: 610 - 74 - figureChipArea(sp) };
  }
  function rectGeo(r) {
    const x0 = r.x / 900 * PW, x1 = (r.x + r.w) / 900 * PW;
    const z0 = -PD / 2 + r.y / 1200 * PD, z1 = -PD / 2 + (r.y + r.h) / 1200 * PD;
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
    g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    return g;
  }
  function syncFigurePlane() {
    if (!figurePlane) return;
    figurePlane.geometry.dispose(); figurePlane.geometry = rectGeo(figureRect());
    if (FIGURE3D.texture && figurePlane.material.map !== FIGURE3D.texture) {
      figurePlane.material.map = FIGURE3D.texture; figurePlane.material.needsUpdate = true;
    }
  }
  /* Paper geometry. Spine sits at x=0 (right page) or x=PW (left page, spineEnd).
     `gut` is a per-vertex gutter shadow: paper dips into the binding. */
  const SEG = 48;                                    /* columns along the page */
  const LIGHT = new THREE.Vector3(-0.36, 0.66, 0.36).normalize();   /* = key light */
  const CURL_LAG = 0.5;                              /* free edge trails the spine */
  const LAYER = 0.003;                               /* front/back separation, clears z-fighting */
  const curlX = new Float32Array(SEG + 1), curlY = new Float32Array(SEG + 1), curlPsi = new Float32Array(SEG + 1);
  function gutterAt(u) {                             /* u: 0 at spine, 1 at fore-edge */
    const t = Math.min(1, Math.max(0, u / 0.22));
    return 0.8 + 0.2 * t * t * (3 - 2 * t);
  }
  function pageGeo(spineEnd) {
    const g = new THREE.PlaneGeometry(PW, PD, SEG, 4);
    g.translate(PW / 2, 0, 0); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, n = p.count;
    const col = new Uint16Array(n), zs = new Float32Array(n), gut = new Float32Array(n);
    const colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const xx = p.getX(i);
      const c = Math.round(xx / PW * SEG);
      col[i] = c; zs[i] = p.getZ(i);
      gut[i] = gutterAt(spineEnd ? 1 - c / SEG : c / SEG);
      p.setY(i, 0.028 * Math.sin(Math.PI * xx / PW));
      colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = gut[i];
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.userData = { col, zs, gut, spineEnd: !!spineEnd };
    g.computeVertexNormals();
    return g;
  }
  /* Inextensible page kinematics. Walk the sheet from the spine: the tangent
     angle psi(s) starts at the spine angle th and the free edge lags by
     CURL_LAG * sin(th), so the leaf bows like paper instead of a rigid plane.
     Integrated once per frame into curlX/curlY/curlPsi (midpoint rule). */
  function curlTable(th) {
    const k = CURL_LAG * Math.sin(th), h = PW / SEG;
    let x = 0, y = 0;
    for (let i = 0; i <= SEG; i++) {
      const u = i / SEG;
      curlX[i] = x; curlY[i] = y; curlPsi[i] = th * (1 - k * Math.pow(u, 1.5));
      const um = (i + 0.5) / SEG, psiMid = th * (1 - k * Math.pow(um, 1.5));
      x += h * Math.cos(psiMid); y += h * Math.sin(psiMid);
    }
  }
  /* Deform a leaf for turn angle th (0 = flat on the right, PI = flat on the left).
     `layer` lifts the sheet along its own normal so the front stays above the back. */
  function applyCurl(geo, th, layer) {
    curlTable(th);
    const p = geo.attributes.position, c = geo.attributes.color, { col, zs, gut } = geo.userData;
    for (let i = 0; i < p.count; i++) {
      const k = col[i], psi = curlPsi[k];
      const nx = -Math.sin(psi), ny = Math.cos(psi);          /* sheet normal */
      /* the printed bow always bulges UP (the top face), whichever face is up;
         `layer` offsets along the sheet normal: +front / -back, so the top face is never buried */
      const bow = 0.028 * Math.sin(Math.PI * k / SEG);
      p.setXYZ(i, curlX[k] + nx * layer, curlY[k] + ny * layer + bow, zs[i]);
      /* two-sided Lambert from the key light, darkened in the gutter */
      const d = Math.abs(nx * LIGHT.x + ny * LIGHT.y);
      const shade = (0.5 + 0.5 * Math.min(1, d / LIGHT.y)) * gut[i];
      c.setXYZ(i, shade, shade, shade);
    }
    p.needsUpdate = true; c.needsUpdate = true; geo.computeVertexNormals();
  }
  function pageMesh(geo, canvas, mode) {
    /* unlit ink keeps exact print contrast; vertex colour adds only gutter + turn shading */
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      map: tex(canvas), vertexColors: true,
      side: mode === "back" ? THREE.BackSide : THREE.FrontSide
    }));
    m.receiveShadow = false; return m;
  }

  /* ---------------------------------------------------------------- scene */
  function init(el, callbacks) {
    canvas = el; cb = callbacks || {};
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace || renderer.outputColorSpace;
    renderer.setClearColor(0x0c1422, 1);
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c1422, 0.019);
    camera = new THREE.PerspectiveCamera(46, 1, 0.1, 200);
    lastFrame = performance.now();
    FIGURE3D.init(renderer);          /* real-time 3D figure on the right page */
    scene.add(new THREE.AmbientLight(0xb9d4ef, 0.75));
    const key = new THREE.DirectionalLight(0xfff0d0, 1.55); key.position.set(-6, 11, 6); scene.add(key);
    const fill = new THREE.DirectionalLight(0x7fa8e8, 0.65); fill.position.set(7, 5, -6); scene.add(fill);
    const rim = new THREE.PointLight(0x4ad6ff, 0.9, 30); rim.position.set(0, 4, -7); scene.add(rim);
    buildMetaWorld(); buildBook();
    applySceneTheme();
    resize(); setView("world", true);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    animate();
    if (cb.onReady) cb.onReady(true);
  }
  function resize() {
    if (!renderer) return;
    const w = canvas.clientWidth || 800, h = canvas.clientHeight || 600;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  function animate(now) {
    requestAnimationFrame(animate);
    const t = (typeof now === "number" && isFinite(now)) ? now : performance.now();
    const dt = Math.min(0.05, Math.max(0, (t - lastFrame) / 1000));
    lastFrame = t; time += dt;
    const board = shot === "board" && view === "book";
    const bf = board ? boardFit() : null;
    if (board !== lastBoard) { lastBoard = board; tunePopupForBoard(board); }
    syncCam(board);
    /* R6 · the OPPOSITE page is real 3D: update the same pure model, render a
       second Three.js scene into a WebGLRenderTarget, then map it onto the
       physical page. No overlap: only the fixed viewport rectangle is covered. */
    const showFigure = !!(TH() && view === "book" && !turning && !ultra &&
                          figureMode === "3d" && !plate2d && FIGURE3D.ready);
    if (figurePlane) {
      figurePlane.visible = showFigure;
      if (showFigure && figurePlane.material.opacity < 1) figurePlane.material.opacity = Math.min(1, figurePlane.material.opacity + dt * 4);
    }
    if (showFigure && currentWorld) {
      FIGURE3D.update(evalModel(currentWorld.spreads[spreadIndex], params), dt, time);
      FIGURE3D.render(0xeaf0f6);
    }
    if (camAnim) {
      camAnim.t = Math.min(1, camAnim.t + dt / camAnim.dur);
      const e = camAnim.t < 0.5 ? 2 * camAnim.t * camAnim.t : 1 - Math.pow(-2 * camAnim.t + 2, 2) / 2;
      camera.position.lerpVectors(camAnim.from, camAnim.to, e);
      camAnim.look.lerpVectors(camAnim.lookFrom, camAnim.lookTo, e);
      camera.lookAt(camAnim.look);
      if (camAnim.t >= 1) camAnim = null;
    }
    /* page turn */
    if (turning) {
      let th = turning.theta;
      if (!turning.drag) {                           /* scripted turn or settle after release */
        const raw = Math.min(1, (performance.now() - turning.start) / turning.dur);
        const e = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;   /* ease-in-out cubic */
        turning.t = raw;
        th = turning.th0 + (turning.th1 - turning.th0) * e;
        turning.theta = th;
        if (raw >= 1) finishTurn();
      }
      if (turning) {
        applyCurl(leafFront.geometry, th, LAYER); applyCurl(leafBack.geometry, th, -LAYER);
        const tip = leafFront.geometry.attributes.position;
        const tipX = tip.getX(tip.count - 1), lift = Math.sin(th);
        turnShadow.visible = lift > 0.02;
        turnShadow.material.opacity = 0.22 * lift;
        turnShadow.scale.set(Math.max(0.02, Math.abs(tipX)), 1, 1);
        turnShadow.position.x = tipX / 2;
      }
    }
    /* pop-up unfold */
    popupT += (popupTarget - popupT) * Math.min(1, dt * 5.5);
    if (typeof EVFSM !== "undefined") EVFSM.observe("popup",
      ultra ? "ultra" : popupT < 0.02 ? "folded" : popupT < 0.98 ? "unfolding" : "open", "world.js:animate");
    if (popupRoot) {
      const e = popupT;
      /* ULTRA: the real apparatus rises, but stays inside the right-page 3D
         viewport so it can never cover the bilingual captions below it. */
      const us = (ultra && board) ? 0.66 : 1;
      popupRoot.scale.set((0.6 + 0.4 * e) * us, Math.max(0.002, e) * us, (0.6 + 0.4 * e) * us);
      popupRoot.position.y = 0.18 + (1 - e) * 0.02;
      popupRoot.position.z = (ultra && board) ? -0.35 : 0;
      popupRoot.children.forEach((ch, i) => { if (ch.userData.wing) ch.rotation.x = ch.userData.wing * (1 - e) * 1.25; });
    }
    /* world motion */
    if (worldGroup && worldGroup.visible) {
      metaRoot.rotation.y += dt * 0.045;
      monoliths.forEach((m, i) => {
        m.group.position.y = m.baseY + Math.sin(time * 0.9 + i * 0.55) * 0.16;
        m.ring.rotation.z += dt * (i % 2 ? 0.35 : -0.35);
      });
    }
    /* active apparatus */
    if (built && built.update && currentWorld) {
      const m = evalModel(currentWorld.spreads[spreadIndex], params);
      built.update(m, dt, time);
    }
    /* camera orbit when not animating */
    if (!camAnim && orbit.enabled) {
      const target = view === "world" ? V(0, 1.6, 0) : (board ? V(0, 0, bf.shift) : V(0, 0.35, 0));
      const r = (view === "world" ? 16.5 : (board ? bf.d : SHOTS[shot].r)) * orbit.dist;
      const pitch = view === "world" ? 0.34 + orbit.pitch : (board ? SHOTS.board.p : SHOTS[shot].p + orbit.pitch);
      const yaw = board ? 0 : orbit.yaw;
      const want = V(Math.sin(yaw) * Math.cos(pitch) * r, Math.sin(pitch) * r,
                     Math.cos(yaw) * Math.cos(pitch) * r + (board ? bf.shift : 0));
      camera.position.lerp(want, Math.min(1, dt * 10));
      camera.lookAt(target);
    }
    renderer.render(scene, camera);
    if (cb.onFrame) cb.onFrame();
  }
  function flyTo(pos, look, dur) {
    orbit.enabled = false;
    camAnim = { from: camera.position.clone(), to: V(pos[0], pos[1], pos[2]), lookFrom: new THREE.Vector3(0, 1.6, 0), lookTo: V(look[0], look[1], look[2]), look: camera.position.clone(), t: 0, dur: dur || 1.15 };
    setTimeout(() => { orbit.enabled = true; }, (dur || 1.15) * 1000 + 30);
  }

  /* ------------------------------------------------------------- meta world */
  function buildMetaWorld() {
    worldGroup = new THREE.Group(); scene.add(worldGroup);
    metaRoot = new THREE.Group(); worldGroup.add(metaRoot);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ color: 0x101e30, roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -1.6; worldGroup.add(floor);
    const grid = new THREE.GridHelper(52, 52, 0x2b5a7a, 0x18334c); grid.position.y = -1.58; worldGroup.add(grid);
    /* central portal book */
    const portal = new THREE.Group(); worldGroup.add(portal);
    G3.box(portal, 3.2, 0.32, 4.2, G3.mat(0x1b3d5c, { emissive: 0x0b3557, glow: 0.6 }), [0, 0.1, 0]);
    G3.box(portal, 2.9, 0.04, 3.9, G3.mat(0xe8ddc2), [0, 0.29, 0]);
    G3.tag(portal, "SCIVERSE 3D\nCHAPTER WORLDS", 2.6, 1.4, { pos: [0, 0.32, 0], rot: [-Math.PI / 2, 0, 0], size: 58, bg: "#efe6cf" });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 2.2, 8, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x4ad6ff, transparent: true, opacity: 0.055, side: THREE.DoubleSide }));
    beam.position.y = 3.5; portal.add(beam);
    /* chapter monoliths */
    const pack = (typeof CHAPTER_PACKS !== "undefined" && EV.world) ? CHAPTER_PACKS[EV.world.id] : null;
    const list = (pack && pack.groups && pack.groups.length) ? pack.groups : CATALOGUE_ALL;
    list.forEach((c, i) => {
      const a = (i / list.length) * Math.PI * 2 + 0.25, R = 7.8;
      const g = new THREE.Group(); g.position.set(Math.cos(a) * R, 2.5 + (i % 3) * 0.35, Math.sin(a) * R);
      g.rotation.y = -a + Math.PI / 2; metaRoot.add(g);
      const col = new THREE.Color(c.color);
      const body = G3.box(g, 1.9, 2.55, 0.42, G3.mat(col.getHex(), { emissive: col.getHex(), glow: 0.35, metal: 0.25, rough: 0.45 }), [0, 0, 0]);
      body.userData.chapter = c.id;
      G3.box(g, 2.02, 2.68, 0.12, G3.mat(0x0a1a2a, { metal: 0.4 }), [0, 0, -0.27]);
      const face = G3.tag(g, (EV.lang === "hi" && c.hi ? c.hi : c.title) + "\nNCERT CLASS " + (EV.world && EV.world.cls ? EV.world.cls : "X"), 1.7, 2.2, { pos: [0, 0, 0.225], size: 46, bg: "#0d2136", fg: "#eaf6ff", border: "#4ad6ff" });
      face.userData.chapter = c.id; face.userData.spread = c.spread;
      body.userData.spread = c.spread;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.025, 6, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = -1.5; g.add(ring);
      const light = new THREE.PointLight(col.getHex(), 0.5, 5); g.add(light);
      monoliths.push({ group: g, ring: ring, body: body, face: face, baseY: g.position.y, id: c.id, spread: c.spread });
      /* link to centre */
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0.5, 0), V(Math.cos(a) * R, 1.4, Math.sin(a) * R)]),
        new THREE.LineBasicMaterial({ color: col.getHex(), transparent: true, opacity: 0.16 }));
      metaRoot.add(line);
    });
    /* stars */
    const starGeo = new THREE.BufferGeometry(); const pts = []; const rnd = G3.seeded(31337);
    for (let i = 0; i < 420; i++) { const a = rnd() * 6.28, r = 9 + rnd() * 22; pts.push(Math.cos(a) * r, rnd() * 14 - 1, Math.sin(a) * r); }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    worldGroup.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x8fd8ff, size: 0.07, transparent: true, opacity: 0.7 })));
  }

  /* ------------------------------------------------------------------ book */
  function buildBook() {
    bookGroup = new THREE.Group(); scene.add(bookGroup); bookGroup.visible = false;
    /* paperRoot holds every flat/printed part; only this group is widened. */
    paperRoot = new THREE.Group(); paperRoot.scale.x = wide; bookGroup.add(paperRoot);
    /* desk */
    sceneMats.deskA = G3.mat(0x131d2a, { rough: 0.95 });
    sceneMats.deskB = G3.mat(0x1a2939, { rough: 0.88 });
    sceneMats.pool  = new THREE.MeshBasicMaterial({ color: 0x2b4c68, transparent: true, opacity: 0.28, depthWrite: false });
    sceneMats.cover = G3.mat(0x244a68, { rough: 0.7, metal: 0.1 });
    sceneMats.spine = G3.mat(0x183449, { rough: 0.7 });
    G3.box(paperRoot, 22, 0.5, 16, sceneMats.deskA, [0, -0.48, 0]);
    G3.box(paperRoot, 20, 0.02, 14, sceneMats.deskB, [0, -0.22, 0]);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(6.6, 48), sceneMats.pool);
    pool.rotation.x = -Math.PI / 2; pool.position.y = -0.205; paperRoot.add(pool);
    /* cover boards: a solid frame around the white pages */
    const cover = sceneMats.cover;
    G3.box(paperRoot, PW + 0.22, 0.14, PD + 0.28, cover, [-PW / 2 - 0.03, 0.02, 0]);
    G3.box(paperRoot, PW + 0.22, 0.14, PD + 0.28, cover, [PW / 2 + 0.03, 0.02, 0]);
    G3.box(paperRoot, 0.34, 0.16, PD + 0.3, sceneMats.spine, [0, 0.02, 0]);
    /* page blocks */
    G3.box(paperRoot, PW - 0.06, 0.10, PD - 0.1, G3.mat(0xe7dcc0, { rough: 0.98 }), [-PW / 2 - 0.02, 0.095, 0]);
    G3.box(paperRoot, PW - 0.06, 0.10, PD - 0.1, G3.mat(0xe7dcc0, { rough: 0.98 }), [PW / 2 + 0.02, 0.095, 0]);
    /* printed page meshes */
    const gl = pageGeo(true), gr = pageGeo(false);
    leftPage = pageMesh(gl, pageCanvas().c, "front"); leftPage.position.set(-PW, 0.20, 0); paperRoot.add(leftPage);
    rightPage = pageMesh(gr, pageCanvas().c, "front"); rightPage.position.set(0, 0.20, 0); paperRoot.add(rightPage);
    /* an actual textured plane sitting ON the right page: its map is the live
       WebGLRenderTarget of FIGURE3D, refreshed every frame. */
    figurePlane = new THREE.Mesh(rectGeo(figureRect()), new THREE.MeshBasicMaterial({
      map: FIGURE3D.texture || null, side: THREE.FrontSide, toneMapped: false, depthWrite: true
    }));
    figurePlane.position.y = 0.252; figurePlane.renderOrder = 6; figurePlane.visible = false;
    figurePlane.material.transparent = true; figurePlane.material.opacity = 1;
    paperRoot.add(figurePlane);
    /* turning leaf */
    leaf = new THREE.Group(); leaf.position.set(0, 0.20, 0); leaf.visible = false; paperRoot.add(leaf);
    const gf = pageGeo(false), gb = pageGeo(false);
    /* the back face is seen from underneath (BackSide), which mirrors the canvas;
       pre-mirror its UVs so the reverse of the leaf reads exactly like the printed left page */
    const gbUv = gb.attributes.uv;
    for (let i = 0; i < gbUv.count; i++) gbUv.setX(i, 1 - gbUv.getX(i));
    gbUv.needsUpdate = true;
    leafFront = pageMesh(gf, pageCanvas().c, "front"); leaf.add(leafFront);
    leafBack = pageMesh(gb, pageCanvas().c, "back"); leaf.add(leafBack);
    /* contact shadow the lifting leaf throws on the page beneath it */
    const sc = document.createElement("canvas"); sc.width = 128; sc.height = 4;
    const sx = sc.getContext("2d"), sg = sx.createLinearGradient(0, 0, 128, 0);
    sg.addColorStop(0, "rgba(0,0,0,0)"); sg.addColorStop(0.55, "rgba(0,0,0,0.9)"); sg.addColorStop(1, "rgba(0,0,0,0.25)");
    sx.fillStyle = sg; sx.fillRect(0, 0, 128, 4);
    turnShadow = new THREE.Mesh(new THREE.PlaneGeometry(1, PD), new THREE.MeshBasicMaterial({
      map: tex(sc), transparent: true, opacity: 0, depthWrite: false, color: 0x000000
    }));
    turnShadow.rotation.x = -Math.PI / 2; turnShadow.position.y = 0.232; turnShadow.visible = false;
    turnShadow.renderOrder = 4; paperRoot.add(turnShadow);
    /* pop-up root over right page */
    popupRoot = new THREE.Group(); popupRoot.position.set(PW * wide / 2, 0.20, 0); bookGroup.add(popupRoot);
    G3.plate(popupRoot, 3.45, 2.35);
    const wingA = G3.box(popupRoot, 3.45, 0.02, 1.0, G3.mat(0xeee3c9, { rough: 0.95 }), [0, 0.055, 1.05]); wingA.userData.wing = -1;
    const wingB = G3.box(popupRoot, 3.45, 0.02, 1.0, G3.mat(0xeee3c9, { rough: 0.95 }), [0, 0.055, -1.05]); wingB.userData.wing = 1;
    apparatusRoot = new THREE.Group(); popupRoot.add(apparatusRoot);
    /* Prompt 2 · dedicated selection layer. Independent of popupRoot so the
       projector plate and clearBuilt() can never delete or hide it. Hidden
       until EVBIND attaches an EVENGINE group (parts-mode is opt-in). */
    selectionRoot = new THREE.Group();
    selectionRoot.name = 'EVSTATE_SELECTION_ROOT';
    selectionRoot.position.set(PW * wide / 2, 1.02, 0);
    selectionRoot.scale.setScalar(0.82);
    selectionRoot.visible = false;
    bookGroup.add(selectionRoot);
    /* page-corner turn hints */
    const hintMat = new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0.22, side: THREE.DoubleSide });
    [1, -1].forEach(s => {
      const h = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), hintMat);
      h.rotation.x = -Math.PI / 2; h.position.set(s * (PW - 0.35), 0.225, PD / 2 - 0.35); paperRoot.add(h);
    });
  }
  function repaintPages() {
    if (!currentWorld) return;
    const sp = currentWorld.spreads[spreadIndex];
    /* one real 3D apparatus per spread, rebuilt only when the lesson changes;
       slider moves reach it through FIGURE3D.update(evalModel(...)) instead.
       R7: build FIRST, then print the page, so the header and concept chips
       name the CURRENT lesson's anatomy rather than the previous spread. */
    const key = (currentWorld.id || currentWorld.short || "w") + ":" + spreadIndex;
    if (key !== figureKey) { figureKey = key; FIGURE3D.rebuild(sp, params, currentWorld); }
    leftPage.material.map.dispose(); leftPage.material.map = tex(drawLeft(sp, currentWorld, spreadIndex * 2 + 1)); leftPage.material.needsUpdate = true;
    rightPage.material.map.dispose(); rightPage.material.map = tex(drawRight(sp, currentWorld, spreadIndex * 2 + 2)); rightPage.material.needsUpdate = true;
    syncFigurePlane();
  }

  /* ------------------------------------------------------------- apparatus */
  function clearBuilt() {
    while (apparatusRoot.children.length) {
      const c = apparatusRoot.children[0]; apparatusRoot.remove(c);
      c.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { const mm = Array.isArray(o.material) ? o.material : [o.material]; mm.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); }
      });
    }
    built = null;
  }
  function buildApparatus() {
    lastBoard = null; /* re-apply projector plate visibility to the new apparatus */
    clearBuilt(); handleGroups = []; handleMeshes = []; clickTargets = []; handleRanges = {};
    const sp = currentWorld.spreads[spreadIndex];
    const block = BLOCKS[sp.scene.type] || BLOCKS.showcase;
    params = defaultParams(sp);
    const ctx = {
      setHandleRange: function (id, x0, x1, startX) { handleRanges[id] = { x0: x0, x1: x1, startX: startX }; }
    };
    built = block.build(apparatusRoot, sp, ctx);
    handleGroups = (built.handles || []).slice();
    handleMeshes = [];
    handleGroups.forEach(h => h.traverse(o => { if (o.isMesh) { o.userData.controlId = h.userData.controlId; handleMeshes.push(o); } }));
    clickTargets = (built.clickTargets || []).slice();
    /* position handles according to current values */
    const ctrls = blockControls(block, sp);
    ctrls.forEach(c => {
      const h = handleGroups.find(g => g.userData.controlId === c.id);
      const r = handleRanges[c.id];
      if (h && r) h.position.x = r.x0 + (c.value - c.min) / (c.max - c.min) * (r.x1 - r.x0);
    });
    touched = new Set(); popupT = 0.02; popupTarget = 1;
    if (cb.onRebuild) cb.onRebuild(sp, params, blockControls(block, sp));
  }
  function setParam(id, value, source) {
    const sp = currentWorld.spreads[spreadIndex], block = BLOCKS[sp.scene.type] || BLOCKS.showcase;
    const c = blockControls(block, sp).find(k => k.id === id);
    if (!c) return;
    params[id] = Math.round(value / ((c.max - c.min) / 100 || 1)) * ((c.max - c.min) / 100 || 1);
    params[id] = Math.max(c.min, Math.min(c.max, +params[id].toFixed(2)));
    const r = handleRanges[id], h = handleGroups.find(g => g.userData.controlId === id);
    if (r && h) h.position.x = r.x0 + (params[id] - c.min) / (c.max - c.min) * (r.x1 - r.x0);
    if (cb.onParam) cb.onParam(id, params[id], evalModel(sp, params), source);
    /* Atlas model.js discipline: the printed figure is driven by the model,
       so a slider move must repaint the live active card + readout too. */
    queueRepaint();
  }
  function markTouch(id, label) {
    if (!currentWorld) return;
    const wasNew = !touched.has(id);
    touched.add(id);
    if (!wasNew) { if (cb.onTouch) cb.onTouch(id, label, touched, evalModel(currentWorld.spreads[spreadIndex], params), params); return; }
    const sp = currentWorld.spreads[spreadIndex];
    if (/^(step|layer|spec|atom|nucleus|mito|er|golgi|vacuole|membrane|flask|beaker|tube|leaf|lamp|jar|cellBody|particles|oxygen)/.test(id)) {
      const b = BLOCKS[sp.scene.type] || BLOCKS.showcase;
      const ctrls = blockControls(b, sp).map(c => c.id);
      if (ctrls.indexOf("found") >= 0 || sp.scene.type === "cell") params.found = Math.min(6, (params.found || 0) + 1);
      if (sp.scene.type === "flow") params.visited = Math.min((sp.scene.params.steps || []).length || 5, (params.visited || 0) + 1);
      if (sp.scene.type === "stack") params.opened = Math.min((sp.scene.params.levels || []).length || 4, (params.opened || 0) + 1);
      if (sp.scene.type === "showcase") params.found = Math.min(3, (params.found || 0) + 1);
      if (sp.scene.type === "molecule") params.h = Math.min(2, (params.h || 0) + 1);
    }
    if (cb.onTouch) cb.onTouch(id, label, touched, evalModel(sp, params), params);
  }

  /* -------------------------------------------------------------- page turn */
  /* beginTurn prepares both faces of the leaf and returns false when a turn is
     impossible (already turning, no lesson, or past either end of the book).
     drag=true leaves the leaf under pointer control until pointer release. */
  function beginTurn(dir, drag) {
    const to = spreadIndex + dir;
    if (turning || !currentWorld || to < 0 || to >= currentWorld.spreads.length) return false;
    const nextSp = currentWorld.spreads[to];
    /* leaf front = current right page, leaf back = next left page (or current left for reverse) */
    const frontCanvas = dir > 0 ? drawRight(currentWorld.spreads[spreadIndex], currentWorld, spreadIndex * 2 + 2) : drawRight(nextSp, currentWorld, to * 2 + 2);
    const backCanvas = dir > 0 ? drawLeft(nextSp, currentWorld, to * 2 + 1) : drawLeft(currentWorld.spreads[spreadIndex], currentWorld, spreadIndex * 2 + 1);
    leafFront.material.map.dispose(); leafFront.material.map = tex(frontCanvas); leafFront.material.needsUpdate = true;
    leafBack.material.map.dispose(); leafBack.material.map = tex(backCanvas); leafBack.material.needsUpdate = true;
    const th0 = dir > 0 ? 0 : Math.PI, th1 = dir > 0 ? Math.PI : 0;
    leaf.visible = true; leftPage.visible = true; rightPage.visible = true;
    popupRoot.visible = false;
    applyCurl(leafFront.geometry, th0, LAYER); applyCurl(leafBack.geometry, th0, -LAYER);
    turning = { dir, to, t: 0, drag: !!drag, theta: th0, th0, th1, commit: true,
                start: performance.now(), dur: 760, moved: false, x0: 0, y0: 0 };
    return true;
  }
  function startTurn(dir) {
    if (typeof EVFSM !== "undefined") EVFSM.transition("pageTurn", "START", {
      turning: !!turning, world: !!currentWorld, to: spreadIndex + dir,
      count: currentWorld ? currentWorld.spreads.length : 0
    });
    return beginTurn(dir, false);
  }
  /* pointer drag: the leaf follows the pointer across the page; release settles it */
  function dragTurnTo(clientX, clientY) {
    const pt = planePoint(0.2);
    if (!pt || !turning || !turning.drag) return;
    const lp = paperRoot.worldToLocal(pt.clone());
    const d = turning.dir > 0 ? lp.x : -lp.x;      /* signed distance from spine, toward the fore-edge */
    const k = G3.clamp(d, -PW, PW);                 /* fore-edge = 0 rad (forward) or PI (back) */
    turning.theta = turning.dir > 0 ? Math.PI * (PW - k) / (2 * PW) : Math.PI * (PW + k) / (2 * PW);
    if (!turning.moved && Math.hypot(clientX - turning.x0, clientY - turning.y0) > 5) turning.moved = true;
  }
  function releaseTurn() {
    if (!turning || !turning.drag) return;
    const th = turning.theta, prog = turning.dir > 0 ? th / Math.PI : 1 - th / Math.PI;
    /* a tap (no drag) commits; a drag commits past the halfway point */
    turning.commit = !turning.moved || prog > 0.5;
    const endA = turning.dir > 0 ? Math.PI : 0, startA = turning.dir > 0 ? 0 : Math.PI;
    turning.th0 = th; turning.th1 = turning.commit ? endA : startA;
    turning.drag = false; turning.start = performance.now();
    turning.dur = 180 + 560 * Math.abs(turning.th1 - turning.th0) / Math.PI;
  }
  function finishTurn() {
    if (typeof EVFSM !== "undefined") { EVFSM.transition("pageTurn", "FINISH", { t: 1 }); EVFSM.transition("pageTurn", "SETTLE", {}); }
    const d = turning; turning = null;
    leaf.visible = false; leftPage.visible = true; rightPage.visible = true; turnShadow.visible = false;
    popupRoot.visible = !(shot === "board" && view === "book" && TH() && !ultra);
    if (!d.commit) return;                          /* cancelled drag: pages never changed */
    spreadIndex = d.to;
    if (figurePlane) figurePlane.material.opacity = 0;      /* live figure fades in over the new page */
    repaintPages(); buildApparatus();
    if (typeof EVFSM !== "undefined") EVFSM.observe("navigation", currentWorld.id + "::" + spreadIndex, "world.js:finishTurn");
    if (cb.onPage) cb.onPage(spreadIndex, currentWorld.spreads[spreadIndex]);
  }

  function jumpTo(i) {
    if (turning || !currentWorld) return;
    const target = Math.max(0, Math.min(currentWorld.spreads.length - 1, i));
    if (target === spreadIndex) return;
    /* animate a single turn in the nearest direction, then jump */
    const dir = target > spreadIndex ? 1 : -1;
    const immediate = Math.abs(target - spreadIndex) > 1;
    if (immediate) {
      spreadIndex = target; repaintPages(); buildApparatus();
      if (typeof EVFSM !== "undefined") EVFSM.observe("navigation", currentWorld.id + "::" + spreadIndex, "world.js:jumpTo");
      if (cb.onPage) cb.onPage(spreadIndex, currentWorld.spreads[spreadIndex]);
    } else startTurn(dir);
  }

  /* ------------------------------------------------------------------ views */
  function setView(v, instant) {
    view = v;
    const isWorld = v === "world";
    worldGroup.visible = isWorld; bookGroup.visible = !isWorld;
    orbit.yaw = 0; orbit.pitch = 0; orbit.dist = 1;
    if (instant) {
      orbit.enabled = true;
      camera.position.set(0, isWorld ? 7.2 : 8.15, isWorld ? 15.5 : 8.2);
      camera.lookAt(isWorld ? V(0, 1.6, 0) : V(0, 0.35, 0));
    } else { camAnim = null; orbit.enabled = true; } /* smooth orbit-lerp fly-in */
    if (cb.onView) cb.onView(v);
  }
  function setWorld(w, idx) {
    currentWorld = w; spreadIndex = Math.max(0, Math.min(w.spreads.length - 1, idx || 0));
    if (plate2d && !plate2dAvailable(w)) {
      plate2d = false;
      if (typeof EVFSM !== "undefined") EVFSM.observe("figureMode", figureMode, "world.js:setWorld");
    }
    if (typeof EVFSM !== "undefined") EVFSM.observe("navigation", w.id + "::" + spreadIndex, "world.js:setWorld");
    repaintPages(); buildApparatus();
    if (cb.onPage) cb.onPage(spreadIndex, w.spreads[spreadIndex]);
  }
  function setLang(l) { lang = l; if (typeof EVFSM !== "undefined") EVFSM.observe("lang", l, "world.js:setLang"); repaintPages(); }
  function setPrecision(p) { precision = p; if (typeof EVFSM !== "undefined") EVFSM.observe("precision", p ? "on" : "off", "world.js:setPrecision"); if (cb.onPrecision) cb.onPrecision(p); }
  function setShot(s) {
    if (!SHOTS[s]) return;
    shot = s;
    if (typeof EVFSM !== "undefined") EVFSM.observe("shot", s, "world.js:setShot");
    /* snap back to a clean, level alignment whenever a shot changes */
    orbit.yaw = 0; orbit.pitch = 0; orbit.dist = 1; camAnim = null; orbit.enabled = true;
    syncCam(s === "board" && view === "book");
    if (cb.onShot) cb.onShot(s);
  }

  /* -------------------------------------------------------------- interaction */
  function ndc(e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
  }
  function planePoint(y) {
    const out = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -y);
    return raycaster.ray.intersectPlane(plane, out) ? out : null;
  }
  /* ======================================================================
     PROMPT 2 · GLOBAL THREE.Raycaster SELECTION BRIDGE
     EVBIND calls setSelectionGroup(group, meshes) with an EVENGINE group and
     its raycastTargets(). setPickHandler(fn) registers the single consumer.
     onDown intersects these tagged meshes with the SAME shared raycaster;
     pickAt/pickDebug expose the hook for headless QA. No per-engine renderer,
     no second raycaster, no chapter hardcode.
     ====================================================================== */
  function clearSelectionGroup() {
    if (!selectionRoot) return;
    /* Detach only; EVBIND calls EVENGINE.dispose() to release GPU resources. */
    while (selectionRoot.children.length) selectionRoot.remove(selectionRoot.children[0]);
    selectionRoot.visible = false;
    pickTargets = [];
  }
  function setSelectionGroup(group, meshes) {
    clearSelectionGroup();
    if (group && selectionRoot) {
      selectionRoot.add(group);
      selectionRoot.visible = true;
      pickTargets = (meshes || []).filter(Boolean);
    }
  }
  function setPickHandler(fn) { pickHandler = (typeof fn === 'function') ? fn : null; }
  function partIdOf(o) {
    return (o && o.userData && (o.userData.partId || o.userData.rootPartId)) || null;
  }
  function pickAt(clientX, clientY) {
    if (!pickTargets.length || !camera || !canvas) return null;
    ndc({ clientX: clientX, clientY: clientY });
    const hits = raycaster.intersectObjects(pickTargets, false);
    return hits.length ? partIdOf(hits[0].object) : null;
  }
  function pickDebug() {
    if (!canvas || !camera || !pickTargets.length) return [];
    const r = canvas.getBoundingClientRect();
    return pickTargets.map(o => {
      const v = new THREE.Vector3(); o.getWorldPosition(v); v.project(camera);
      return { partId: partIdOf(o),
               x: Math.round((v.x * 0.5 + 0.5) * r.width + r.left),
               y: Math.round((-v.y * 0.5 + 0.5) * r.height + r.top),
               inFront: v.z > -1 && v.z < 1, visible: !!o.visible };
    });
  }
  function plateHit(e) {
    if (!(plate2d || figureMode === "diagram" || !FIGURE3D.ready) || !TH() || ultra || view !== "book" || turning || !rightPage) return false;
    ndc(e);
    const hit = raycaster.intersectObject(rightPage, false)[0];
    if (!hit || !hit.uv) return false;
    const px = hit.uv.x * 900, py = (1 - hit.uv.y) * 1200;
    return px >= 96 && px <= 804 && py >= 196 && py <= 806;
  }
  /* Actual projected corners of the 2D printed illustration on the page. */
  function draftPlateCorners() {
    if (!canvas || !camera || !paperRoot || view !== "book" || turning || !TH() || ultra || !plate2d) return null;
    const stage = document.getElementById("stage"); if (!stage) return null;
    const bounds = canvas.getBoundingClientRect(), sb = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    return [[96,196],[804,196],[804,806],[96,806]].map(p => {
      const pt = new THREE.Vector3(p[0] / 900 * PW, 0.235, -PD / 2 + p[1] / 1200 * PD);
      paperRoot.localToWorld(pt); pt.project(camera);
      return {x:(pt.x + 1) * bounds.width / 2 + bounds.left - sb.left,
              y:(1 - pt.y) * bounds.height / 2 + bounds.top - sb.top, z:pt.z};
    });
  }
  function zoomSnapshot() {
    if (!currentWorld || view !== "book") return null;
    const sp = currentWorld.spreads[spreadIndex];
    if (TH() && !ultra && plate2d && EVPLATE2D.has(currentWorld, sp)) {
      const c = document.createElement("canvas"); c.width = 1416; c.height = 1220;
      const x = c.getContext("2d"); x.scale(2, 2);
      draw2DPlate(x, sp, 0, 0, 708, 610, true);
      return { src: c.toDataURL("image/png"), kind: "2d" };
    }
    if (TH() && !ultra && figureMode === "3d" && FIGURE3D.ready) {
      const src = FIGURE3D.zoomSnapshot();
      return src ? { src: src, kind: "3d" } : null;
    }
    if (TH() && !ultra && rightPage && rightPage.material.map) {
      const c = document.createElement("canvas"); c.width = 708; c.height = 610;
      c.getContext("2d").drawImage(rightPage.material.map.image, 96, 196, 708, 610, 0, 0, 708, 610);
      return { src: c.toDataURL("image/png"), kind: "2d" };
    }
    /* Angled, studio and ultra views show the current scene, not the
       separate classroom figure scene. Capture that visible render honestly. */
    renderer.render(scene, camera);
    return { src: canvas.toDataURL("image/png"), kind: "3d" };
  }
  function onDown(e) {
    if (!canvas || (!worldGroup && !bookGroup)) return;
    if (typeof EVFSM !== "undefined") EVFSM.transition("pointer", "DOWN", {});
    ndc(e); orbit.dragging = false; orbit.lx = e.clientX; orbit.ly = e.clientY;
    zoomPress = null;
    if (e.button === 0 && plateHit(e)) { zoomPress = { x: e.clientX, y: e.clientY }; orbit.dragging = true; return; }
    /* Prompt 2 · 3D -> UI: one shared THREE.Raycaster resolves the clicked
       EVENGINE mesh's userData.partId and hands it to EVBIND (which funnels it
       through the SAME EVSTATE transition as an HTML chip click). Falls through
       to the classic handles / page-corner logic when nothing is hit. */
    if (view !== "world" && pickTargets.length && pickHandler) {
      const ghits = raycaster.intersectObjects(pickTargets, false);
      if (ghits.length) {
        const partId = partIdOf(ghits[0].object);
        if (partId) { pickHandler(partId); return; }
      }
    }
    if (view === "world") {
      const hits = raycaster.intersectObjects(monoliths.flatMap(m => [m.body, m.face]), false);
      if (hits.length) { const o = hits[0].object; const id = o.userData.chapter; if (id && cb.onChapter) cb.onChapter(id, o.userData.spread); return; }
      orbit.dragging = true; return;
    }
    /* book view: handles first */
    if (handleMeshes.length) {
      const hits = raycaster.intersectObjects(handleMeshes, false);
      if (hits.length) {
        const id = hits[0].object.userData.controlId;
        const r = handleRanges[id], c = (blockControls(BLOCKS[currentWorld.spreads[spreadIndex].scene.type] || BLOCKS.showcase, currentWorld.spreads[spreadIndex])).find(k => k.id === id);
        const pt = planePoint(0.34);
        drag = { id: id, x0: pt ? pt.x : 0, v0: params[id], r: r, c: c, moved: false };
        orbit.enabled = false;
        return;
      }
    }
    /* clickable apparatus parts */
    const chits = raycaster.intersectObjects(clickTargets.map(c => c.mesh), false);
    if (chits.length) {
      const found = clickTargets.find(c => c.mesh === chits[0].object);
      if (found) { markTouch(found.id, found.label || found.id); return; }
    }
    /* page corners turn the page */
    const phits = raycaster.intersectObjects([leftPage, rightPage], false);
    if (phits.length) {
      const lp = paperRoot ? paperRoot.worldToLocal(phits[0].point.clone()) : phits[0].point;
      /* grab a corner: the leaf follows the pointer until release (tap = turn) */
      const dir = lp.x > PW - 0.9 && lp.z > 0.6 ? 1 : lp.x < -PW + 0.9 && lp.z > 0.6 ? -1 : 0;
      if (dir && beginTurn(dir, true)) { turning.x0 = e.clientX; turning.y0 = e.clientY; return; }
    }
    orbit.dragging = true;
  }
  function onMove(e) {
    if (!renderer) return;
    ndc(e);
    if (turning && turning.drag) { dragTurnTo(e.clientX, e.clientY); return; }
    if ((drag || orbit.dragging) && typeof EVFSM !== "undefined") EVFSM.transition("pointer", "MOVE", {});
    if (drag) {
      const pt = planePoint(0.34); if (!pt || !drag.r) return;
      const sp = currentWorld.spreads[spreadIndex], c = drag.c;
      const worldX0 = popupRoot.position.x + drag.r.x0, worldX1 = popupRoot.position.x + drag.r.x1;
      /* absolute mapping: handle x follows pointer x */
      const f = Math.max(0, Math.min(1, (pt.x - worldX0) / (worldX1 - worldX0)));
      const v = c.min + f * (c.max - c.min);
      if (Math.abs(v - drag.v0) > 0.5) drag.moved = true;
      setParam(drag.id, v, "3d-drag"); return;
    }
    if (orbit.dragging) {
      const dx = e.clientX - orbit.lx, dy = e.clientY - orbit.ly;
      orbit.lx = e.clientX; orbit.ly = e.clientY;
      /* projector alignment is locked: no yaw / pitch drift on stage drag */
      if (shot === "board" && view === "book") return;
      orbit.yaw = G3.clamp(orbit.yaw - dx * (view === "world" ? 0.005 : 0.0028), view === "world" ? -3.2 : -0.7, view === "world" ? 3.2 : 0.7);
      orbit.pitch = G3.clamp(orbit.pitch + dy * 0.0025, -0.35, 0.45);
      return;
    }
    /* hover highlight */
    if (view === "book" && handleMeshes.length) {
      const hits = raycaster.intersectObjects(handleMeshes, false);
      canvas.style.cursor = hits.length ? "grab" : "default";
    } else if (view === "world") {
      const hits = raycaster.intersectObjects(monoliths.flatMap(m => [m.body, m.face]), false);
      canvas.style.cursor = hits.length ? "pointer" : "grab";
    }
  }
  function onUp(e) {
    if (zoomPress) {
      const z = zoomPress; zoomPress = null;
      if (Math.hypot(e.clientX - z.x, e.clientY - z.y) < 8 && plateHit(e) && cb.onZoom) cb.onZoom();
    }
    if (typeof EVFSM !== "undefined") { EVFSM.transition("pointer", "UP", {}); EVFSM.transition("pointer", "SETTLE", {}); }
    if (drag) { if (!drag.moved) markTouch("handle:" + drag.id, "Handle"); drag = null; orbit.enabled = !camAnim; }
    releaseTurn();
    orbit.dragging = false;
  }
  function onWheel(e) { e.preventDefault(); orbit.dist = G3.clamp(orbit.dist + Math.sign(e.deltaY) * 0.06, 0.62, 1.9); }
  function onKey(e) {
    if (!currentWorld || view !== "book") return;
    if (e.key === "ArrowRight") { e.preventDefault(); startTurn(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); startTurn(-1); }
  }
  function resetExperiment() {
    if (!currentWorld) return;
    params = defaultParams(currentWorld.spreads[spreadIndex]); touched = new Set();
    const sp = currentWorld.spreads[spreadIndex], b = BLOCKS[sp.scene.type] || BLOCKS.showcase;
    blockControls(b, sp).forEach(c => {
      const r = handleRanges[c.id], h = handleGroups.find(g => g.userData.controlId === c.id);
      if (r && h) h.position.x = r.x0 + (c.value - c.min) / (c.max - c.min) * (r.x1 - r.x0);
    });
    if (cb.onReset) cb.onReset(params, evalModel(sp, params));
  }
  function runDemo(steps) {
    stopDemo(); demoSteps = steps || []; demoIdx = 0;
    if (!demoSteps.length) return;
    demoTimer = setInterval(function () {
      if (demoIdx >= demoSteps.length) { stopDemo(); return; }
      const s = demoSteps[demoIdx++];
      const sp = currentWorld.spreads[spreadIndex];
      if (s.control) {
        const c = blockControls(BLOCKS[sp.scene.type] || BLOCKS.showcase, sp).find(k => k.id === s.control);
        if (c) animateParam(s.control, c.min, s.to !== undefined ? s.to : c.max, 1.1);
      }
      if (cb.onDemoStep) cb.onDemoStep(s, demoIdx, demoSteps.length);
    }, 1600);
  }
  function animateParam(id, from, to, dur) {
    const t0 = performance.now();
    (function step() {
      const p = Math.min(1, (performance.now() - t0) / (dur * 1000));
      setParam(id, from + (to - from) * p, "demo");
      if (p < 1) requestAnimationFrame(step);
    })();
  }
  function stopDemo() { if (demoTimer) clearInterval(demoTimer); demoTimer = null; if (cb.onDemoStop) cb.onDemoStop(); }
  function getState() {
    return { world: currentWorld, index: spreadIndex, view: view, params: params, touched: touched, model: currentWorld ? evalModel(currentWorld.spreads[spreadIndex], params) : null, precision: precision };
  }
  /* ======================================================================
     R5 · ZERO-COMPROMISE ARCHITECTURE AUDIT
     Atlas `tools/uitest.mjs` (headless overflow / placement probe) applied to
     EVERY spread, not a screenshot of one. `EVCHECKS` supplies the pure
     verdict; these two functions supply real measurements from the DOM, the
     WebGL clear colour, the canvas draw calls and the pure model.
     ====================================================================== */
  function css(sel, prop) {
    const e = document.querySelector(sel);
    return e ? getComputedStyle(e)[prop] : "rgb(255, 255, 255)";
  }
  function fontPx(f) { const m = String(f).match(/(\d+(?:\.\d+)?)px/); return m ? +m[1] : 0; }
  function zoneOf(y, page, zs) {
    return (zs || EVCHECKS.ZONES).some(z => z.page === page && y >= z.top - 16 && y <= z.bottom + 16);
  }
  function creditText() {
    const e = document.querySelector(".credit");
    return e ? e.textContent.trim() : "";
  }
  function spreadAudit(w, idx) {
    const sp = w && w.spreads[idx];
    if (!sp) return { id: "missing-" + idx, pass: false, failures: ["spread missing"] };
    const d = diagramSpec(sp), b = BLOCKS[sp.scene.type] || BLOCKS.showcase;
    const controls = blockControls(b, sp).length;
    let m = null, modelFinite = true;
    try {
      m = evalModel(sp, defaultParams(sp));
      Object.keys(m || {}).forEach(k => { if (typeof m[k] === "number" && !isFinite(m[k])) modelFinite = false; });
    } catch (e) { modelFinite = false; }
    const readouts = (m && Array.isArray(m.readouts)) ? m.readouts.length
      : Object.keys(m || {}).filter(k => typeof m[k] === "number").length;
    const figLabels = (sp.scene && sp.scene.fig && sp.scene.fig.labels) ? sp.scene.fig.labels.length : d.labels.length;
    const zo = EVCHECKS.zoneOverlaps(EVCHECKS.ZONES);
    return EVCHECKS.spread(sp, idx, {
      diagramLabels: d.labels.length, diagramKind: d.kind,
      controls: controls, readouts: readouts, clickTargets: figLabels,
      modelFinite: modelFinite,
      leftOverlaps: zo.filter(v => v.indexOf("left:") === 0),
      rightOverlaps: zo.filter(v => v.indexOf("right:") === 0),
      credit: creditText()
    });
  }
  function textLayoutAudit(log) {
    const mx = document.createElement("canvas").getContext("2d");
    const boxes = [], overflowSamples = [], overlapSamples = [], truncatedSamples = [];
    let truncated = 0, overflowX = 0, dollarMisaligned = 0, textOverlaps = 0;
    log.forEach((r, i) => {
      mx.font = r.font;
      const measured = mx.measureText(r.text).width;
      const w = r.maxWidth ? Math.min(measured, r.maxWidth) : measured;
      const fs = fontPx(r.font) || 20, h = Math.max(fs, r.lh || 0);
      const align = r.align || "left";
      const left = align === "right" ? r.x - w : align === "center" ? r.x - w / 2 : r.x;
      const top = r.baseline === "middle" ? r.y - h / 2 : r.y - h * 0.80;
      const box = { i: i, left: left, right: left + w, top: top, bottom: top + h * 1.05,
                    text: r.text, run: r.run || 0 };
      if (/…|\.\.\./.test(r.text)) { truncated++; if (truncatedSamples.length < 4) truncatedSamples.push(r.text); }
      if (left < 28 || left + w > 872) {
        overflowX++;
        if (overflowSamples.length < 4) overflowSamples.push({ text: r.text, left: +left.toFixed(1), right: +(left + w).toFixed(1), font: r.font });
      }
      if (/\$/.test(r.text) && (!/\$[0-9A-Za-z(+\-]/.test(r.text) || /\$\s*$/.test(r.text))) dollarMisaligned++;
      boxes.push(box);
    });
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.run && a.run === b.run) continue;   /* lines of ONE wrapped paragraph */
      const iw = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const ih = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (iw <= 6 || ih <= 6) continue;
      const area = Math.min((a.right - a.left) * (a.bottom - a.top),
                            (b.right - b.left) * (b.bottom - b.top));
      if (area > 0 && (iw * ih) / area > 0.18) {
        textOverlaps++;
        if (overlapSamples.length < 5) overlapSamples.push({ a: a.text.slice(0, 60), b: b.text.slice(0, 60), iw: +iw.toFixed(1), ih: +ih.toFixed(1) });
      }
    }
    return { truncated: truncated, overflowX: overflowX, dollarMisaligned: dollarMisaligned,
             textOverlaps: textOverlaps, calls: log.length,
             overflowSamples: overflowSamples, overlapSamples: overlapSamples,
             truncatedSamples: truncatedSamples,
             pass: !truncated && !overflowX && !dollarMisaligned && !textOverlaps };
  }
  function combineLayout(a, b) {
    const out = { calls: a.calls + b.calls };
    ["truncated", "overflowX", "dollarMisaligned", "textOverlaps"].forEach(k => { out[k] = a[k] + b[k]; });
    ["overflowSamples", "overlapSamples", "truncatedSamples"].forEach(k => { out[k] = a[k].concat(b[k]).slice(0, 5); });
    out.pass = a.pass && b.pass;
    return out;
  }
  function boardAudit() {
    if (!currentWorld) return { pass: false, failures: ["no world loaded"] };
    const sp = currentWorld.spreads[spreadIndex], big = BT() === "big";
    const zs = big ? EVCHECKS.BIG_ZONES : EVCHECKS.ZONES;
    /* instrument the ACTUAL draw functions; nothing here is estimated */
    auditLog = []; classroomLeft(sp, currentWorld, spreadIndex * 2 + 1);
    const left = auditLog.slice();
    auditLog = []; classroomRight(sp, currentWorld, spreadIndex * 2 + 2);
    const right = auditLog.slice(); auditLog = null;
    const textLayout = combineLayout(textLayoutAudit(left), textLayoutAudit(right));
    const dollarContract = dollarAudit();
    const precision = document.getElementById("precision2d");
    const fstats = FIGURE3D.stats();
    const p2spec = plate2d ? EVPLATE2D.spec(currentWorld, sp) : null;
    const p2Labels = p2spec ? p2spec.labels.length : 0;
    const figureDuplicate = plate2d ? false : (!!fstats.duplicateFigure ||
      !!(precision && !precision.hidden && figureMode === "3d"));
    const outsideSamples = left.filter(r => !zoneOf(r.y, "left", zs))
      .concat(right.filter(r => !zoneOf(r.y, "right", zs)))
      .map(r => ({ text: String(r.text).slice(0, 80), y: r.y, font: r.font }));
    const outside = outsideSamples.length;
    /* "primary teaching type" = the headline / concept / formula / key-line
       runs that a student at 30 ft actually reads. Section eyebrow labels and
       folio numbers are deliberately excluded from this metric. */
    const primary = left.concat(right).map(r => fontPx(r.font)).filter(px => px >= (big ? 50 : 32));
    const minPrimaryPx = primary.length ? Math.min.apply(null, primary) : 0;
    const f = boardFit(), ch = (canvas && canvas.clientHeight) || 900;
    const scale = (PD / f.ve * ch) / 1200;
    const dock = document.querySelector(".dock");
    const flat = !!(shot === "board" && view === "book" && TH());
    const fr = figureRect(), fca = figureChipArea(sp);
    const figureViewport = {
      rect: fr, chipArea: fca, cardHeight: 610,
      exact: fr.x === 104 && fr.y === 270 && fr.w === 692 &&
             fr.h === 610 - 74 - fca && (fr.h === 360 || fr.h === 444)
    };
    const p = {
      big: big, theme: theme, clearColor: TH() ? "#eaf0f6" : "#0c1422",
      stageBg: css("#stage", "backgroundColor"),
      topbarBg: css(".topbar", "backgroundColor"),
      dockBg: css(".dock", "backgroundColor"),
      pageBg: "#ffffff", ink: PC.ink, accent: PC.accent,
      fraction: boardMetrics().fraction, minScreenPx: minPrimaryPx * scale,
      scale: +scale.toFixed(3), minPrimaryPx: minPrimaryPx,
      bodyScroll: document.body.scrollWidth, viewport: window.innerWidth,
      stageViewport: (canvas && canvas.clientWidth) || window.innerWidth,
      dockScroll: dock ? dock.scrollHeight : 0, dockH: dock ? dock.clientHeight : 0,
      rightImage: (plate2d && p2spec) ? "2d-vector-plate" :
        (flat ? (figureMode === "3d" && FIGURE3D.ready
                 ? (ultra ? "3d-render-rise" : "3d-render") : "printed-diagram") : "3d-model"),
      draftRasterVisible: !!(window.EVRASTER && window.EVRASTER.isVisible()),
      plate2d: !!(plate2d && p2spec), plate2dLabels: p2Labels, plate2dTopics: EVPLATE2D.keys().length,
      figure3d: fstats,
      biology: fstats.bio,
      figureViewport: figureViewport,
      textLayout: textLayout,
      textRuns: left.concat(right), outsideSamples: outsideSamples,
      textTruncated: textLayout.truncated, textOverflowX: textLayout.overflowX,
      dollarMisaligned: textLayout.dollarMisaligned, dollarContract: dollarContract,
      textOverlaps: textLayout.textOverlaps,
      figureViewportFit: !!fstats.viewportFit, orbitRings: fstats.rings,
      orbitRadius: fstats.orbitRadius, figureDuplicate: figureDuplicate,
      diagramLabels: (plate2d && p2spec) ? p2Labels : (FIGURE3D.stats().bio ? FIGURE3D.stats().bio.labels : diagramSpec(sp).labels.length),
      leftTextCalls: left.length, rightTextCalls: right.length,
      zoneOverlaps: EVCHECKS.zoneOverlaps(zs), outside: outside,
      liveReadout: liveReadout(sp), activeCard: liveIndex(sp, diagramSpec(sp).labels.length),
      primaryFonts: [...new Set(primary)].sort((a, b) => a - b),
      printedFonts: [...new Set(left.concat(right).map(r => fontPx(r.font)).filter(v => v > 0))].sort((a, b) => a - b),
      minPrintedPx: Math.min.apply(null, left.concat(right).map(r => fontPx(r.font)).filter(v => v > 0))
    };
    const plate = EVCHECKS.plate(p);
    const spread = spreadAudit(currentWorld, spreadIndex);
    return Object.assign({}, p, {
      theme: theme, shot: shot, view: view, popupVisible: !!(popupRoot && popupRoot.visible),
      spread: spread, plate: plate,
      compromises: plate.failures.concat(spread.failures || []),
      pass: plate.pass && spread.pass && outside === 0
    });
  }

  function setFigureMode(v) {
    figureMode = v === "diagram" ? "diagram" : "3d";
    if (typeof EVFSM !== "undefined") EVFSM.observe("figureMode", figureMode, "world.js:setFigureMode");
    repaintPages(); return figureMode;
  }
  function setPlate2D(v) {
    plate2d = !!v && plate2dAvailable(currentWorld);
    if (figurePlane) figurePlane.visible = false;
    if (typeof EVFSM !== "undefined") {
      EVFSM.observe("figureMode", plate2d ? "plate2d" : figureMode, "world.js:setPlate2D");
    }
    repaintPages();
    return plate2d;
  }
  function vectorPlate2dAvailable(world) {
    return !!world && EVPLATE2D.keys().some(k => k.indexOf(world.id + ":") === 0);
  }
  function plate2dAvailable(world) {
    if (!world) return false;
    const idx = currentWorld && currentWorld.id === world.id ? spreadIndex : 0;
    return vectorPlate2dAvailable(world) || !!(window.EVRASTER && window.EVRASTER.has(world, world.spreads[idx]));
  }
  function plate2dKeys() { return EVPLATE2D.keys(); }
  function setUltra(v) {
    ultra = !!v;
    if (typeof EVFSM !== "undefined") EVFSM.observe("ultra", ultra ? "on" : "off", "world.js:setUltra");
    /* apply the gate NOW, not on the next animation frame: a slow projector
       must never show the risen model after the teacher toggles it off. */
    tunePopupForBoard(shot === "board" && view === "book");
    lastBoard = null;
    repaintPages();                  /* redraw the 3D viewport legend for the mode */
    return ultra;
  }
  return {
    init, resize, setView, setWorld, setLang, setTheme, setPrecision, setParam, markTouch, setShot,
    /* Prompt 2 · global selection / Raycaster bridge */
    setSelectionGroup, clearSelectionGroup, setPickHandler, pickAt, pickDebug,
    pickTargets() { return pickTargets.slice(); },
    get selectionGroupCount() { return selectionRoot ? selectionRoot.children.length : 0; },
    getShot() { return shot; },
    refresh() { repaintPages(); },
    setWide, setBoardText, boardMetrics, boardAudit, spreadAudit, setFigureMode, setUltra,
    setPlate2D, plate2dAvailable, vectorPlate2dAvailable, plate2dKeys, zoomSnapshot, draftPlateCorners,
    figure3d() { return FIGURE3D.stats(); },
    boardScreenCorners() {
      if (!camera || !paperRoot || !canvas) return [];
      paperRoot.updateWorldMatrix(true, false); camera.updateMatrixWorld();
      return [-1,1].flatMap(x=>[-1,1].map(z=>{
        const p=paperRoot.localToWorld(V(x*(PW+0.14),0.2,z*(PD/2+0.16))).project(camera);
        return {x:(p.x+1)*canvas.clientWidth/2,y:(1-p.y)*canvas.clientHeight/2};
      }));
    },
    get figureMode() { return figureMode; }, get ultra() { return ultra; },
    get plate2d() { return plate2d; },
    boardDebug() {
      let total = 0, vis = 0; const types = {};
      [apparatusRoot, popupRoot].forEach(r => r && r.traverse(o => {
        if (!(o.isMesh || o.isLine || o.isLineSegments || o.isPoints || o.isSprite)) return;
        total++; if (o.visible) vis++; types[o.type] = (types[o.type] || 0) + 1;
      }));
      return { theme: theme, shot: shot, view: view, lastBoard: lastBoard,
               flat: !!(shot === "board" && view === "book" && TH()), popupVisible: !!(popupRoot && popupRoot.visible),
               total: total, visible: vis, types: types };
    },
    startTurn, jumpTo, resetExperiment, runDemo, stopDemo, getState, repaintPages,
    get view() { return view; }, get turning() { return !!turning; }, get world() { return currentWorld; },
    get wide() { return wide; },
    get index() { return spreadIndex; }, get controls() { return currentWorld ? blockControls(BLOCKS[currentWorld.spreads[spreadIndex].scene.type] || BLOCKS.showcase, currentWorld.spreads[spreadIndex]) : []; },
    get canvas() { return canvas; }
  };
})();
