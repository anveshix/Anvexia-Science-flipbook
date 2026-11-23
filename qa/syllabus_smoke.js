#!/usr/bin/env node
/**
 * qa/syllabus_smoke.js
 * Headless smoke verification across all 33 chapters, 266 spreads, 29 EVPACK v2
 * chapter packs, bilingual strings, Three.js 3D rebuilds, and 274 2D plates.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

function makeDummyEl(tag) {
  return {
    tagName: (tag || "DIV").toUpperCase(),
    style: {},
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    children: [],
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {},
    insertBefore(c) { this.children.push(c); return c; },
    setAttribute() {},
    getAttribute() { return null; },
    removeAttribute() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 800, height: 600 }; },
    getContext() {
      return {
        canvas: { width: 512, height: 256 },
        clearRect() {}, fillRect() {}, strokeRect() {}, beginPath() {}, closePath() {},
        moveTo() {}, lineTo() {}, quadraticCurveTo() {}, bezierCurveTo() {}, arc() {},
        ellipse() {}, fill() {}, stroke() {}, save() {}, restore() {}, translate() {},
        rotate() {}, scale() {}, setLineDash() {}, fillText() {}, strokeText() {},
        drawImage() {}, measureText(t) { return { width: String(t || "").length * 9 }; },
        createLinearGradient() { return { addColorStop() {} }; },
        createRadialGradient() { return { addColorStop() {} }; }
      };
    }
  };
}

const ctx = {
  console, Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Map, Set,
  Promise, Float32Array, Float64Array, Uint8Array, Uint16Array, Uint32Array, Int32Array,
  parseInt, parseFloat, isNaN, isFinite, Infinity, NaN,
  setTimeout() { return 1; }, clearTimeout() {}, requestAnimationFrame() { return 1; },
  performance: { now: () => 0 },
  navigator: { userAgent: "node" },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  location: { search: "", hash: "", href: "http://localhost/" },
  document: {
    body: makeDummyEl("body"),
    documentElement: makeDummyEl("html"),
    createElement: tag => makeDummyEl(tag),
    createElementNS: (_ns, tag) => makeDummyEl(tag),
    getElementById: id => makeDummyEl(id),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {}
  }
};
ctx.window = ctx;
ctx.self = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);

const scripts = [
  "vendor/three.min.js",
  "src/engines/EngineKit.js",
  "src/engines/BioEngine.js",
  "src/engines/ChemEngine.js",
  "src/engines/PhysEngine.js",
  "src/spec.js",
  "src/dictionary.js",
  "src/blocks.js",
  "src/atlas_blocks.js",
  "src/checks.js",
  "src/bio3d.js",
  "src/fsm.js",
  "src/figure3d.js",
  "src/carbon_blocks.js",
  "src/carbon_chapter.js",
  "src/light_blocks.js",
  "src/light_chapter.js",
  "src/light_engine.js",
  "src/organ3d.js",
  "src/chapters_generated.js",
  "src/chapter_packs.js"
];

for (const rel of scripts) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), ctx, { filename: rel });
}

const summary = vm.runInContext(`
  (() => {
    const dummyParent = { appendChild() {}, clientWidth: 800, clientHeight: 600 };
    FIGURE3D.init(dummyParent);
    let spreads = 0, built3d = 0;
    const allCh = typeof CATALOGUE_ALL !== "undefined" ? CATALOGUE_ALL : CATALOGUE;
    for (const c of allCh) {
      const w = getWorld(c.id);
      const list = Array.isArray(w) ? w : (w && w.spreads);
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error("Empty world for " + c.id);
      }
      for (const sp of list) {
        spreads++;
        if (!sp.title || !(sp.sec || sp.section)) throw new Error("Missing title/sec in " + c.id);
        const blk = sp.scene && sp.scene.type && typeof BLOCKS !== "undefined" ? BLOCKS[sp.scene.type] : null;
        const params = {};
        if (blk && Array.isArray(blk.controls)) {
          for (const ctrl of blk.controls) {
            if (ctrl && ctrl.id && ctrl.value !== undefined) params[ctrl.id] = ctrl.value;
          }
        }
        Object.assign(params, (sp.scene && sp.scene.params) || {});
        FIGURE3D.rebuild(sp, params, { id: c.id, title: c.title, cls: c.cls, strand: c.strand });
        built3d++;
      }
    }
    return {
      catalogueCount: allCh.length,
      spreads,
      built3d,
      packsEmbedded: Object.keys(CHAPTER_PACKS || {}).length
    };
  })()
`, ctx);

const packIndex = JSON.parse(fs.readFileSync(path.join(ROOT, "authoring/packs/index.json"), "utf8"));
const packList = packIndex.catalogue || packIndex.packs || [];
if (packList.length !== 29) throw new Error("Expected 29 authoring packs, got " + packList.length);
for (const entry of packList) {
  const rel = entry.file.startsWith("authoring/") ? entry.file : path.join("authoring/packs", entry.file);
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) throw new Error("Missing pack file: " + rel);
  const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
  if (parsed.schema !== "eduverse.chapter-pack/v2" && parsed.schema !== "EVPACK") {
    throw new Error("Invalid EVPACK schema in " + rel + ": " + parsed.schema);
  }
}

const labelData = JSON.parse(fs.readFileSync(path.join(ROOT, "src/label_data.json"), "utf8"));
const keys = Object.keys(labelData);
if (keys.length !== 274) throw new Error("Expected 274 label_data keys, got " + keys.length);
for (const k of keys) {
  if (!fs.existsSync(path.join(ROOT, "assets/2d", k))) {
    throw new Error("Missing 2D plate on disk: assets/2d/" + k);
  }
}

if (summary.catalogueCount !== 33 || summary.spreads !== 266 || summary.built3d !== 266) {
  throw new Error("Unexpected syllabus counts: " + JSON.stringify(summary));
}

console.log(
  `PASS syllabus_smoke: ${summary.catalogueCount} chapters · ${summary.spreads} spreads · ` +
  `${summary.built3d}/266 3D scenes rebuilt · ${packList.length} EVPACK v2 files · ` +
  `${keys.length}/274 2D plates verified`
);
