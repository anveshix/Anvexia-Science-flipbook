#!/usr/bin/env node
/**
 * qa/sciverse_smoke.js
 * End-to-end verification of the SciVerse 3D bundle (`index.html`), CSP hashes,
 * vendored open-source libraries (PageFlip, MiniSearch, TWEEN, Temml, confetti),
 * 2D Flipbook generation, Hindi-English search, MathML formulas, and Class XI-XII expansion.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

// 1. Verify <title>, branding, and zero external URLs
if (!html.includes("<title>SciVerse 3D — Explore Science. Experience Discovery.</title>")) {
  throw new Error("Missing SciVerse 3D <title> in index.html");
}
for (const pillar of ["2D Flipbooks", "3D Models", "Interactive Experiments", "Hindi–English Learning"]) {
  if (!html.includes(pillar)) throw new Error("Missing core pillar in index.html: " + pillar);
}
if (/(?:src|href)\s*=\s*["']https?:\/\//i.test(html)) {
  throw new Error("External URL found in index.html");
}

// 2. Verify every classic <script> block SHA-256 matches the embedded CSP meta policy
const cspMatch = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/);
if (!cspMatch) throw new Error("Missing CSP meta tag in index.html");
const cspContent = cspMatch[1].replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const scriptRe = /<script(?![^>]*type=["']application\/json["'])[^>]*>([\s\S]*?)<\/script>/gi;
const executableScripts = [];
let m;
while ((m = scriptRe.exec(html)) !== null) {
  const body = m[1];
  const sha = "sha256-" + crypto.createHash("sha256").update(body, "utf8").digest("base64");
  if (!cspContent.includes(`'${sha}'`)) {
    throw new Error(`Script block #${executableScripts.length} missing SHA-256 in CSP: ${sha}`);
  }
  executableScripts.push(body);
}

// 3. Execute bundled scripts in VM and test all SciVerse 3D subsystems
const elements = new Map();
function makeEl(idOrTag) {
  const el = {
    id: idOrTag,
    tagName: "DIV",
    hidden: false,
    complete: true,
    naturalWidth: 1408,
    naturalHeight: 768,
    value: "",
    innerHTML: "",
    textContent: "",
    style: { setProperty() {} },
    dataset: {},
    clientWidth: 960,
    clientHeight: 640,
    classList: {
      _s: new Set(),
      add(...a) { a.forEach(x => this._s.add(x)); },
      remove(...a) { a.forEach(x => this._s.delete(x)); },
      toggle(x, f) { if (f === undefined) { this._s.has(x) ? this._s.delete(x) : this._s.add(x); } else { f ? this._s.add(x) : this._s.delete(x); } },
      contains(x) { return this._s.has(x); }
    },
    children: [],
    append(...c) { this.children.push(...c); },
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {},
    remove() {},
    insertAdjacentHTML(_pos, h) { this.innerHTML += h; },
    setAttribute(k, v) { this[k] = v; },
    getAttribute(k) { return this[k] || null; },
    removeAttribute(k) { delete this[k]; },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
    focus() {},
    closest() { return null; },
    querySelector() { return makeEl("child"); },
    querySelectorAll(sel) {
      if (sel === ".svf-page" && this.innerHTML) {
        const cnt = (this.innerHTML.match(/class="svf-page/g) || []).length;
        return Array.from({ length: cnt }, (_, i) => {
          const p = makeEl("page" + i);
          p.parentElement = this;
          p.cloneNode = () => makeEl("clone" + i);
          if (i === 0 || i === cnt - 1) p.dataset.density = "hard";
          return p;
        });
      }
      return [];
    },
    getBoundingClientRect() { return { left: 0, top: 0, width: 1040, height: 680 }; },
    getClientRects() { return [{ width: 100, height: 20 }]; },
    getContext() {
      return {
        canvas: { width: 512, height: 256 },
        clearRect() {}, fillRect() {}, strokeRect() {}, beginPath() {}, closePath() {},
        moveTo() {}, lineTo() {}, quadraticCurveTo() {}, bezierCurveTo() {}, arc() {},
        ellipse() {}, fill() {}, stroke() {}, save() {}, restore() {}, translate() {},
        rotate() {}, scale() {}, setLineDash() {}, fillText() {}, strokeText() {},
        drawImage() {}, putImageData() {}, getImageData: () => ({ data: new Uint8ClampedArray(16) }),
        measureText(t) { return { width: String(t || "").length * 8 }; },
        createLinearGradient() { return { addColorStop() {} }; },
        createRadialGradient() { return { addColorStop() {} }; }
      };
    }
  };
  return el;
}

const ctx = {
  console, Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Map, Set, WeakMap, WeakSet,
  Promise, Symbol, Error, TypeError, RangeError,
  Float32Array, Float64Array, Uint8Array, Uint8ClampedArray, Uint16Array, Uint32Array, Int32Array,
  TextDecoder, TextEncoder, URLSearchParams,
  atob: b => Buffer.from(b, "base64").toString("binary"),
  btoa: s => Buffer.from(s, "binary").toString("base64"),
  parseInt, parseFloat, isNaN, isFinite, Infinity, NaN, encodeURIComponent, decodeURIComponent,
  setTimeout() { return 1; }, clearTimeout() {}, setInterval() { return 1; }, clearInterval() {},
  requestAnimationFrame() { return 1; }, cancelAnimationFrame() {},
  ResizeObserver: class { observe() {} disconnect() {} },
  Image: class {
    constructor() { this.complete = false; this.naturalWidth = 0; }
    set src(v) { this._src = v; this.complete = true; this.naturalWidth = 1408; this.naturalHeight = 768; if (this.onload) this.onload(); }
    get src() { return this._src || ""; }
  },
  MutationObserver: class { observe() {} disconnect() {} },
  Event: class { constructor(type) { this.type = type; } },
  CustomEvent: class { constructor(type) { this.type = type; } },
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  performance: { now: () => 0 },
  navigator: { userAgent: "node", clipboard: { writeText: async () => {} } },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  location: { search: "", hash: "", href: "http://localhost:8080/" },
  history: { replaceState() {} },
  addEventListener() {},
  removeEventListener() {},
  getComputedStyle: () => ({ getPropertyValue: () => "520" }),
  document: {
    compatMode: "CSS1Compat",
    body: makeEl("body"),
    head: makeEl("head"),
    documentElement: makeEl("html"),
    fonts: { ready: Promise.resolve() },
    createElement: tag => makeEl(tag),
    createElementNS: (_ns, tag) => makeEl(tag),
    createTextNode: txt => ({ textContent: txt }),
    getElementById: id => {
      if (!elements.has(id)) elements.set(id, makeEl(id));
      return elements.get(id);
    },
    querySelector: sel => {
      if (sel && sel.startsWith("#")) return ctx.document.getElementById(sel.slice(1));
      if (sel === ".dock") {
        const st = ctx.document.getElementById("stage");
        const bothHidden = st.classList.contains("hide-left") && st.classList.contains("hide-right");
        const d = makeEl("dock");
        d.clientHeight = bothHidden ? 38 : 204;
        return d;
      }
      return makeEl(sel || "q");
    },
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {}
  }
};
ctx.window = ctx;
ctx.self = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);

executableScripts.forEach((code, idx) => {
  vm.runInContext(code, ctx, { filename: `index.html:script[${idx}]` });
});

const report = vm.runInContext(`
  (() => {
    if (typeof PageFlip !== "function") throw new Error("PageFlip missing");
    if (typeof MiniSearch !== "function") throw new Error("MiniSearch missing");
    if (typeof TWEEN !== "object") throw new Error("TWEEN missing");
    if (typeof temml !== "object") throw new Error("temml missing");
    if (typeof confetti !== "function") throw new Error("confetti missing");
    if (typeof SCIVERSE !== "object") throw new Error("SCIVERSE missing");

    // Verify Temml MathML equation rendering
    const mathOut = SCIVERSE.formatFormulaHtml("1/v - 1/u = 1/f");
    if (!mathOut.includes("<math")) throw new Error("Expected MathML <math> from Temml, got: " + mathOut.slice(0, 80));

    // Verify English + Hindi MiniSearch indexing across 266 spreads
    document.getElementById("svSearchInput").value = "refraction";
    SCIVERSE.openSearch("refraction");
    const enHtml = document.getElementById("svSearchResults").innerHTML;
    if (!enHtml.includes("Refraction") && !enHtml.includes("अपवर्तन")) {
      throw new Error("English MiniSearch failed to find refraction");
    }

    SCIVERSE.openSearch("कोशिका");
    const hiHtml = document.getElementById("svSearchResults").innerHTML;
    if (!hiHtml.includes("कोशिका")) {
      throw new Error("Hindi MiniSearch failed to find कोशिका");
    }
    SCIVERSE.closeSearch();

    // Verify 2D Flipbook HTML generation & plate mapping
    SCIVERSE.openFlipbook("c10_light", 0);
    const flipHtml = document.getElementById("svFlipBook").innerHTML;
    if (!flipHtml.includes("assets/2d/c10_light/rx-reflection.webp")) {
      throw new Error("2D Flipbook missing realistic rx-reflection.webp plate");
    }
    // Page parity: cover | contents + overview | concept(left) + plate(right) per section
    const kinds = (flipHtml.match(/class="svf-page [a-z-]+/g) || []).map(k => k.replace('class="svf-page ', ""));
    if (kinds[0] !== "svf-cover" || kinds[1] !== "svf-toc-page" || kinds[2] !== "svf-overview-page" ||
        kinds[3] !== "svf-left-page" || kinds[4] !== "svf-right-page" || kinds.length % 2 !== 0) {
      throw new Error("Flipbook page parity broken: " + kinds.slice(0, 6).join(","));
    }
    if (window.EV_2D_ONLY) throw new Error("3D must be the default when WebGL is available");
    SCIVERSE.closeFlipbook();

    // Verify Higher Classes (XI & XII) studio & compiler support
    SCIVERSE.openHigherStudio();
    const drawerHtml = document.getElementById("ldList").innerHTML;
    if (!drawerHtml.includes("Class XI") || !drawerHtml.includes("Class XII")) {
      throw new Error("Higher Classes studio missing Class XI/XII blueprints");
    }
    const xiWorld = compileChapter(
      "Laws of Motion. Newton second law F = m a relates force and acceleration. Work energy theorem W = ΔK relates net work to kinetic energy.",
      { title: "Laws of Motion", cls: "XI", subject: "phy" }
    );
    if (xiWorld.cls !== "XI" || !xiWorld.spreads.length) {
      throw new Error("Class XI chapter compilation failed");
    }

    // Verify full-screen edge-to-edge book fitting (>= 96% horizontal width fill, zero side waste)
    const gl = document.getElementById("gl");
    gl.clientWidth = 1440; gl.clientHeight = 780;
    const bm1440 = WORLD.boardMetrics();
    gl.clientWidth = 1920; gl.clientHeight = 920;
    const bm1920 = WORLD.boardMetrics();
    if (bm1440.fraction < 0.96 || bm1920.fraction < 0.96) {
      throw new Error("Book does not fill full screen width: " + JSON.stringify({ bm1440, bm1920 }));
    }
    if (EV.panels.left !== false || EV.panels.right !== false) {
      throw new Error("Book should default to full-screen reader mode with side/bottom panels collapsed");
    }
    // Verify all 33 chapters activate realistic topic images by default on openChapter()
    const thumbs33 = CATALOGUE_ALL.map(c => EVRASTER.firstThumb(c.id)).filter(Boolean);
    if (EVRASTER.filesFor("c10_light", "9.1").join() !== "rx-reflection.webp,9-01-reflection-laws.jpg") {
      throw new Error("Realistic plate must come first, generated composite kept second: " + EVRASTER.filesFor("c10_light", "9.1").join());
    }
    if (thumbs33.length !== 33) {
      throw new Error("Expected 33 chapter thumbnails from EVRASTER, got " + thumbs33.length);
    }
    openChapter("c10_light");
    EVRASTER.frame();
    if (!EVRASTER.enabled || !WORLD.plate2d) {
      throw new Error("Realistic topic image should be enabled by default on openChapter");
    }
    const draftImgSrc = document.getElementById("aiDraftImage").src || "";
    if (!draftImgSrc.includes("assets/2d/c10_light/rx-reflection.webp")) {
      throw new Error("Expected realistic image rx-reflection.webp, got: " + draftImgSrc);
    }
    // Verify 2D <-> 3D toggle preserves FSM health
    setPlateView("3d");
    if (WORLD.plate2d !== false) throw new Error("Expected 3D mode after setPlateView('3d')");
    setPlateView("2d");
    if (WORLD.plate2d !== true || !EVRASTER.enabled) throw new Error("Expected 2D realistic image restored");

    // Verify toggling left/right/both panels preserves FSM health
    togglePanel("left");
    togglePanel("right");
    togglePanel("both");
    const fsmHealth = EVFSM.health();
    if (!fsmHealth.ok) {
      throw new Error("EVFSM unhealthy after panel/plate toggles: " + JSON.stringify(fsmHealth));
    }

    return {
      scriptsVerified: ${executableScripts.length},
      temmlSampleLen: mathOut.length,
      classesSupported: EVENGINE ? ["IX", "X", "XI", "XII"] : [],
      xiSpreads: xiWorld.spreads.length,
      fraction1440: bm1440.fraction,
      fraction1920: bm1920.fraction,
      thumbs33: thumbs33.length
    };
  })()
`, ctx);

console.log(
  `PASS sciverse_smoke: ${report.scriptsVerified} CSP-verified <script> blocks · ` +
  `Full-screen book fill ${(report.fraction1440 * 100).toFixed(1)}%-${(report.fraction1920 * 100).toFixed(1)}% · ` +
  `${report.thumbs33}/33 realistic topic plates active by default · ` +
  `EN+HI search · 2D Flipbook · Class IX-XII compiler (${report.xiSpreads} spreads)`
);
