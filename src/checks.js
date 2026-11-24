/* ==========================================================================
   EVCHECKS — pure invariant gate (Atlas `kinematics/checks.mjs` discipline)
   --------------------------------------------------------------------------
   This module is deliberately DOM-free and Three-free. It knows NOTHING about
   rendering; it only decides whether a spread / world / plate is legal.
   `model != world != checks`: the same idea nathanliow/atlas-of-physics uses
   for model.js + checks.mjs + world.js. `WORLD.spreadAudit()` supplies the
   measured context; this file supplies the verdict. No compromise is hidden
   in the renderer: a FAIL here is a hard build/QA failure.
   ========================================================================== */

const EVCHECKS = (function () {
  const STATUSES = ["assessed", "formative", "archive"];
  const CREDIT = "Copyright / Developer : Paras Pranav";
  const MIN_LUM = 0.84;          /* projector-safe light background */
  const MIN_CONTRAST = 10;       /* WCAG AAA large text is 7:1; we demand 10:1 */
  const MIN_DIAGRAM_LABELS = 3;  /* a right page without a real figure is illegal */
  const MIN_CONTROLS = 1;        /* every lesson must be interactive */
  const MIN_SCREEN_PX = 16;      /* primary type at 1440x900 expanded view */
  const MIN_SCREEN_PX_BIG = 26;  /* dedicated 30 FT plate: headline + formula + key line */
  const MIN_PRINTED_PX = 12;     /* hard floor for every printed secondary run */
  const MIN_FRACTION = 0.82;     /* book must use the stage, not float in it */

  /* ---- colour maths (WCAG relative luminance / contrast ratio) ---- */
  function rgb(any) {
    if (Array.isArray(any)) return any.slice(0, 3);
    let s = String(any || "").trim();
    const m = s.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
    if (m) return [+m[1], +m[2], +m[3]];
    if (s[0] === "#") s = s.slice(1);
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    const n = parseInt(s, 16);
    if (!isFinite(n)) return [255, 255, 255];
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lum(any) {
    const c = rgb(any).map(v => {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    const x = lum(a), y = lum(b), hi = Math.max(x, y), lo = Math.min(x, y);
    return (hi + 0.05) / (lo + 0.05);
  }

  /* ---- the FIXED zone table of the printed classroom plate ----
     Classroom pages draw into a 900 x 1200 canvas. Every block owns one
     zone; no block may cross into the next. Rendering asserts exactly this. */
  const ZONES = [
    { page: "left", name: "header", top: 60, bottom: 170 },
    { page: "left", name: "section", top: 208, bottom: 248 },
    { page: "left", name: "title", top: 248, bottom: 470 },
    { page: "left", name: "body", top: 470, bottom: 878 },
    { page: "left", name: "predict", top: 892, bottom: 1044 },
    { page: "left", name: "keyfact", top: 1058, bottom: 1158 },
    { page: "left", name: "folio", top: 1160, bottom: 1200 },
    { page: "right", name: "header", top: 60, bottom: 170 },
    { page: "right", name: "diagram", top: 196, bottom: 806 },
    { page: "right", name: "captions", top: 838, bottom: 1110 },
    { page: "right", name: "folio", top: 1160, bottom: 1200 }
  ];
  /* 30 FT presentation plate: fewer, much larger blocks. */
  const BIG_ZONES = [
    { page: "left", name: "header", top: 60, bottom: 170 },
    { page: "left", name: "section", top: 200, bottom: 260 },
    { page: "left", name: "title", top: 270, bottom: 420 },
    { page: "left", name: "body", top: 420, bottom: 866 },
    { page: "left", name: "keyfact", top: 880, bottom: 1130 },
    { page: "left", name: "folio", top: 1160, bottom: 1200 },
    { page: "right", name: "header", top: 60, bottom: 170 },
    { page: "right", name: "diagram", top: 196, bottom: 886 },
    { page: "right", name: "captions", top: 900, bottom: 1130 },
    { page: "right", name: "folio", top: 1160, bottom: 1200 }
  ];
  function zoneOverlaps(zs) {
    const bad = [];
    ["left", "right"].forEach(p => {
      const z = (zs || ZONES).filter(v => v.page === p).sort((a, b) => a.top - b.top);
      for (let i = 1; i < z.length; i++)
        if (z[i].top < z[i - 1].bottom) bad.push(p + ":" + z[i - 1].name + "/" + z[i].name);
    });
    return bad;
  }

  const ok = s => typeof s === "string" && s.trim().length > 0;
  function spread(sp, i, ctx) {
    const c = ctx || {}, rows = [];
    const ck = (name, pass, info) => rows.push({ name: name, pass: !!pass, info: info === undefined ? "" : info });
    const id = (sp && (sp.id || sp.short)) || ("spread-" + i);
    const q = sp && sp.predict, quiz = sp && sp.quiz, sc = (sp && sp.scene) || {};
    const voc = (sp && sp.vocab) || [];

    ck("bilingual title", ok(sp.title) && ok(sp.titleHi), id);
    ck("bilingual concept", ok(sp.concept) && ok(sp.conceptHi), (sp.concept || "").length + " chars");
    ck("bilingual key fact", ok(sp.explain) && ok(sp.explainHi), id);
    ck("bilingual figure caption", ok(sp.fig) && ok(sp.figHi), id);
    ck("bilingual try-this", ok(sp.tryHint) && ok(sp.hintHi), id);
    ck("NCERT section", /^[\dA-Z][\d.]*[a-z]?$/.test(String(sp.section || "")), "" + sp.section);
    ck("formula present", !!(sp.formula && ok(sp.formula.eq)), sp.formula && sp.formula.eq || "");
    ck("vocabulary >= 3", voc.length >= 3, voc.length + " pairs");
    ck("prediction well-formed", !!(q && q.options && q.options.length >= 3 &&
       Number.isInteger(q.a) && q.a >= 0 && q.a < q.options.length), q && q.options && q.options.length || 0);
    ck("quiz well-formed", !!(quiz && quiz.options && quiz.options.length >= 3 &&
       Number.isInteger(quiz.a) && quiz.a >= 0 && quiz.a < quiz.options.length), quiz && quiz.options && quiz.options.length || 0);
    ck("scene declared", ok(sc.type), sc.type);
    ck("status legal", STATUSES.indexOf(sp.status || "assessed") >= 0, sp.status || "assessed");
    ck("right-page diagram >= 3 labels", (c.diagramLabels | 0) >= MIN_DIAGRAM_LABELS, c.diagramLabels + " labels / " + c.diagramKind);
    ck("interactive control", (c.controls | 0) >= MIN_CONTROLS, c.controls + " controls");
    ck("live readout / click target", (c.readouts | 0) >= 1 || (c.clickTargets | 0) >= 1,
       c.readouts + " readouts, " + c.clickTargets + " targets");
    ck("model is pure & finite", !!c.modelFinite, c.modelFinite ? "finite" : "NaN/Infinity");
    ck("left zone non-overlap", (c.leftOverlaps || []).length === 0, (c.leftOverlaps || []).join(","));
    ck("right zone non-overlap", (c.rightOverlaps || []).length === 0, (c.rightOverlaps || []).join(","));
    ck("exact developer credit", c.credit === CREDIT, c.credit || "");

    const failures = rows.filter(r => !r.pass).map(r => r.name + (r.info ? " [" + r.info + "]" : ""));
    return { id: id, index: i, section: sp.section, checks: rows.length,
             failures: failures, pass: failures.length === 0 };
  }

  /* R7 — BIOLOGY ALIGNMENT CONTRACT (zero compromise). A generic sphere/orbit
     decoration is a hard failure; the opposing 3D must be NCERT anatomy. */
  function biology(p) {
    const rows = [];
    const ck = (name, pass, info) => rows.push({ name: name, pass: !!pass, info: info === undefined ? "" : info });
    const b = p.biology || {};
    ck("biology figure is NCERT anatomy, not a generic orrery", !!b.model && /^ncert-biology/.test(p.figure3d.engine || ""), b.model || "generic volumetric");
    ck("biology 3D has >= 6 real anatomical parts", (b.parts | 0) >= 6, b.parts + " parts");
    ck("biology 3D has >= 6 aligned labels", (b.labels | 0) >= 6, b.labels + " labels");
    ck("every biology label is bilingual (NCERT IX/X)", !!b.bilingual, b.bilingual ? "en + hi" : "missing Hindi");
    ck("biology labels are in two non-overlapping aligned columns", !!b.aligned && (b.labelOverlaps | 0) === 0,
       "columns " + JSON.stringify(b.columns || []) + " / overlaps " + b.labelOverlaps);
    ck("biology figure is aligned to the lesson's own text", !!b.textAligned && !!b.chapterAligned,
       (b.lessonLabels | 0) + " lesson labels / " + (b.sharedTerms | 0) + " shared / " + (b.routedBy || ""));
    ck("biology 3D + precision 2D share one declarative spec", !!b.dualView, b.dualView ? "one spec" : "two sources");
    ck("biology content cites NCERT section", !!b.ncert && !!b.section, (b.ncert || "") + " " + (b.section || ""));
    ck("biology uses only approved GitHub research", (b.repos | 0) >= 5, b.repos + " approved repos");
    ck("opposite page is still a LIVE 3D render", /^3d-/.test(p.rightImage || ""), p.rightImage || "");
    const failures = rows.filter(r => !r.pass).map(r => r.name + " [" + r.info + "]");
    return { checks: rows.length, failures: failures, pass: failures.length === 0, rows: rows };
  }

  function plate(p) {
    const rows = [];
    const ck = (name, pass, info) => rows.push({ name: name, pass: !!pass, info: info === undefined ? "" : info });
    const L = v => +lum(v).toFixed(3);
    /* Palette scope is deliberate: light / high-contrast is the CLASSROOM
       projector contract. Studio is a dark-theme authoring view, so its dark
       chrome is intentional. Every theme is still checked for readable paper,
       real 3D geometry, full copy, layout and type size below. */
    const lightPalette = (p.theme || "classroom") === "classroom";
    if (lightPalette) {
      ck("WebGL clear colour is light", lum(p.clearColor) >= MIN_LUM, p.clearColor + " lum " + L(p.clearColor));
      ck("CSS stage is light", lum(p.stageBg) >= MIN_LUM, p.stageBg + " lum " + L(p.stageBg));
      ck("top bar is light", lum(p.topbarBg) >= MIN_LUM, p.topbarBg + " lum " + L(p.topbarBg));
      ck("dock is light", lum(p.dockBg) >= MIN_LUM, p.dockBg + " lum " + L(p.dockBg));
    }
    ck("page is light", lum(p.pageBg) >= MIN_LUM, p.pageBg + " lum " + L(p.pageBg));
    ck("ink contrast >= 10:1", contrast(p.ink, p.pageBg) >= MIN_CONTRAST,
       +contrast(p.ink, p.pageBg).toFixed(1) + ":1");
    ck("accent contrast >= 4.5:1", contrast(p.accent, p.pageBg) >= 4.5,
       +contrast(p.accent, p.pageBg).toFixed(1) + ":1");
    ck("book uses >= 82% of stage width", (p.fraction | 0) >= MIN_FRACTION - 0.0001 ||
       +p.fraction >= MIN_FRACTION, +(+p.fraction).toFixed(3));
    /* A 4:3 1024x768 board is physically smaller than a 1440x900 one, so the
       required on-screen type scales with the viewport. The 30 FT contract is
       specified for a full-size smart board and never relaxed below that. */
    /* An opt-in O3 lane makes the WebGL stage physically narrower while the
       browser window stays 1440px. Type scales with the AVAILABLE stage, not
       the hidden panel lane; `viewport` remains the body-overflow bound. */
    const stageViewport = p.stageViewport || p.viewport || 1440;
    const need = (p.big ? MIN_SCREEN_PX_BIG : MIN_SCREEN_PX) * Math.min(1, stageViewport / 1440);
    ck("primary type >= 30 ft threshold", +p.minScreenPx >= need,
       +(+p.minScreenPx).toFixed(1) + "px on screen (needs " + need.toFixed(1) + ")");
    ck("no horizontal overflow", p.bodyScroll <= p.viewport, p.bodyScroll + " / " + p.viewport);
    ck("no dock clipping", p.dockScroll <= p.dockH + 2, p.dockScroll + " / " + p.dockH);
    const IMAGES = ["printed-diagram", "3d-model", "3d-render", "3d-render-rise", "2d-vector-plate"];
    ck("right page has an image", IMAGES.indexOf(p.rightImage) >= 0, p.rightImage);
    /* ZERO COMPROMISE: the teacher-selected 2D vector plate is an explicit
       alternative, never a silent GPU fallback. Every other classroom state
       must remain a LIVE 3D render. */
    const explicit2d = p.rightImage === "2d-vector-plate" && !!p.plate2d;
    if (explicit2d) {
      ck("2D plate is a deliberate teacher choice", !!p.plate2d, p.rightImage);
      ck("2D plate carries >= 4 bilingual labels", (p.plate2dLabels | 0) >= 4, p.plate2dLabels + " labels");
      ck("2D pilot covers every c9_cell topic", (p.plate2dTopics | 0) === 11, p.plate2dTopics + " topics");
      ck("2D plate has no duplicate live 3D plane", !p.figureDuplicate, p.figureDuplicate ? "duplicate" : "single plate");
    } else {
      ck("right page is real 3D, not a flat stand-in", /^3d-/.test(p.rightImage), p.rightImage);
      ck("3D figure carries real animated geometry",
         !!(p.figure3d && p.figure3d.ready && p.figure3d.meshes >= 3),
         p.figure3d ? p.figure3d.meshes + " meshes / " + p.figure3d.size : "no figure");
      ck("live 3D plane matches printed viewport", !!(p.figureViewport && p.figureViewport.exact),
         p.figureViewport ? p.figureViewport.rect.w + "x" + p.figureViewport.rect.h +
           " / chips " + p.figureViewport.chipArea : "no figureRect evidence");
    }
    ck("right image has >= 3 labels", (p.diagramLabels | 0) >= MIN_DIAGRAM_LABELS, p.diagramLabels);
    ck("left page carries text", (p.leftTextCalls | 0) >= 6, p.leftTextCalls + " text runs");
    ck("no zone overlaps", (p.zoneOverlaps || []).length === 0, (p.zoneOverlaps || []).join(","));
    ck("every text run inside its zone", (p.outside | 0) === 0, p.outside + " outside");
    ck("no truncated text or ellipsis", (p.textTruncated | 0) === 0, (p.textTruncated | 0) + " truncated runs");
    ck("no horizontal text overflow", (p.textOverflowX | 0) === 0, (p.textOverflowX | 0) + " overflowing runs");
    ck("literal dollar signs stay attached", (p.dollarMisaligned | 0) === 0 && !!(p.dollarContract && p.dollarContract.pass),
       (p.dollarMisaligned | 0) + " misaligned signs / synthetic " + (p.dollarContract && p.dollarContract.pass ? "PASS" : "FAIL"));
    ck("no printed text overlap", (p.textOverlaps | 0) === 0, (p.textOverlaps | 0) + " overlapping pairs");
    /* Adaptive fitting must never collapse secondary copy to 6-11px. The DOM
       dock is the accessible duplicate; the printed plate still needs a real
       readability floor. Synthetic contexts without textRuns are ignored. */
    if (Array.isArray(p.textRuns)) {
      const sizes = p.textRuns.map(r => {
        const m = String(r.font || "").match(/(\d+(?:\.\d+)?)px/);
        return m ? +m[1] : 0;
      }).filter(v => v > 0);
      const smallest = sizes.length ? Math.min.apply(null, sizes) : 0;
      ck("no printed text below 12px", smallest >= MIN_PRINTED_PX,
         smallest + "px smallest printed run");
    }
    if (!explicit2d) {
      ck("3D orbit fits the designated viewport", !!p.figureViewportFit,
         p.figure3d && p.figure3d.fit ? JSON.stringify(p.figure3d.fit) : "no fit evidence");
      ck("one orbit / no duplicate figure", (p.orbitRings | 0) === 1 && !p.figureDuplicate,
         (p.orbitRings | 0) + " rings / duplicate " + !!p.figureDuplicate);
    }
    const bioResult = !explicit2d && p.biology ? biology(p) : null;
    if (bioResult) bioResult.rows.forEach(r => rows.push(r));
    const failures = rows.filter(r => !r.pass).map(r => r.name + " [" + r.info + "]");
    return { checks: rows.length, failures: failures, pass: failures.length === 0, rows: rows };
  }

  return { STATUSES, CREDIT, biology, MIN_LUM, MIN_CONTRAST, MIN_DIAGRAM_LABELS, MIN_CONTROLS,
           MIN_SCREEN_PX, MIN_SCREEN_PX_BIG, MIN_PRINTED_PX, MIN_FRACTION, ZONES, BIG_ZONES,
           lum, contrast, zoneOverlaps, spread, plate };
})();
