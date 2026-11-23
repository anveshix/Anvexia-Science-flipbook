#!/usr/bin/env node
/**
 * tools/build_2d_plates.mjs
 * ---------------------------------------------------------------------------
 * Deterministic, code-based generator for all 274 EduVerse 2D high-resolution
 * plates (1408 x 768 JPEG) across all 33 Class IX & X Science chapters.
 *
 * Consumes EduVerse's own declarative 3D + 2D modules directly from src/:
 *   - vendor/three.min.js + vendor/devanagari.woff2
 *   - src/engines/{EngineKit,BioEngine,ChemEngine,PhysEngine}.js
 *   - src/{spec,dictionary,blocks,atlas_blocks,checks,bio3d,fsm,figure3d}.js
 *   - src/{carbon_blocks,carbon_chapter,light_blocks,light_chapter,light_engine,organ3d}.js
 *   - src/{chapters_generated,chapter_packs,app,label_data.json}
 *
 * Respects both EVLABEL rendering contracts in 1408 x 768 space:
 *   1. With anchor_x / anchor_y (70 plates): DOM .ev-label-chip renders the
 *      clickable bilingual pill at (x, y, w, h) with an SVG leader line to
 *      (anchor_x, anchor_y). Plates keep (x, y, w, h) free of competing text
 *      and place visual targets directly at (anchor_x, anchor_y).
 *   2. Without anchor_x (204 plates): DOM .ev-label-hit renders a transparent
 *      interactive outline over (x, y, w, h). Plates bake crisp high-contrast
 *      bilingual callout cards inside exact (x, y, w, h) coordinates with
 *      leader lines to the rendered 3D scientific model and schematic.
 *
 * Usage:
 *   node tools/build_2d_plates.mjs                 # build all 274 plates
 *   node tools/build_2d_plates.mjs --only key1,key2 # build selected plates
 */

import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

const W = 1408;
const H = 768;
const JPEG_QUALITY = 86;

// Register embedded Devanagari font so Hindi shaping is crisp & deterministic
GlobalFonts.registerFromPath(path.join(ROOT, "vendor/devanagari.woff2"), "Noto Sans Devanagari Embedded");
GlobalFonts.registerFromPath(path.join(ROOT, "vendor/devanagari.woff2"), "Noto Sans Devanagari");

const FONT_SANS = '"DejaVu Sans", "Noto Sans Devanagari", sans-serif';
const FONT_SERIF = '"DejaVu Serif", "Noto Sans Devanagari", serif';
const FONT_MONO = '"DejaVu Sans Mono", "Noto Sans Devanagari", monospace';

// Subject palettes
const THEMES = {
  bio: {
    bgTop: "#f3faf6",
    bgBot: "#dbeee4",
    stageTop: "#ffffff",
    stageBot: "#d9efe5",
    ink: "#0b221c",
    muted: "#355c50",
    accent: "#146c54",
    accent2: "#2d936c",
    accentSoft: "#e4f5ee",
    border: "#184e3f",
    cardBg: "#ffffff",
    leader: "#146c54",
    badgeBg: "#124e3f",
    badgeFg: "#ffffff",
    grid: "rgba(20, 90, 68, 0.048)",
    palette: ["#167c5e", "#2b7ec2", "#d97b29", "#7c52b8", "#c94a58", "#238b9c"]
  },
  chem: {
    bgTop: "#f4f8fc",
    bgBot: "#dde8f4",
    stageTop: "#ffffff",
    stageBot: "#d9e7f6",
    ink: "#0b1c2c",
    muted: "#36536e",
    accent: "#1a5286",
    accent2: "#c97626",
    accentSoft: "#e6f0fa",
    border: "#163f68",
    cardBg: "#ffffff",
    leader: "#1a5286",
    badgeBg: "#143b63",
    badgeFg: "#ffffff",
    grid: "rgba(22, 68, 114, 0.048)",
    palette: ["#1d68a8", "#d47828", "#1c8c6e", "#7f54b8", "#c84848", "#2d8ea3"]
  },
  phy: {
    bgTop: "#f4f6fc",
    bgBot: "#dce3f4",
    stageTop: "#ffffff",
    stageBot: "#d8e2f7",
    ink: "#0c182b",
    muted: "#384c6e",
    accent: "#1c4386",
    accent2: "#d06828",
    accentSoft: "#e7eefb",
    border: "#163468",
    cardBg: "#ffffff",
    leader: "#1c4386",
    badgeBg: "#153063",
    badgeFg: "#ffffff",
    grid: "rgba(24, 56, 118, 0.048)",
    palette: ["#2255a4", "#d96b2b", "#188a74", "#7650bc", "#c84658", "#2787a6"]
  }
};

/* ============================================================================
   1. LOAD EDUVERSE RUNTIME MODULES IN SANDBOXED CONTEXT
   ============================================================================ */
function createEduVerseRuntime() {
  const ctx = {
    console, Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Map, Set, WeakMap,
    Float32Array, Float64Array, Int32Array, Uint32Array, Uint16Array, Uint8Array, Uint8ClampedArray,
    Error, TypeError, RangeError, Symbol, Promise,
    isFinite, isNaN, parseFloat, parseInt, encodeURIComponent, decodeURIComponent,
    performance: { now: () => 1250 },
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {},
    setTimeout, clearTimeout,
    devicePixelRatio: 1,
    innerWidth: W, innerHeight: H,
    location: { search: "", hash: "", href: "http://localhost/" },
    navigator: { userAgent: "node" },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    Image: function () { return {}; },
    document: {
      createElement: (tag) => {
        if (tag === "canvas") {
          const c = createCanvas(256, 256);
          c.style = {};
          return c;
        }
        return {
          style: {},
          classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
          setAttribute() {}, getAttribute() { return null; },
          appendChild() {}, removeChild() {}, addEventListener() {},
          querySelectorAll() { return []; }, querySelector() { return null; }
        };
      },
      createElementNS: () => ({ style: {}, setAttribute() {}, appendChild() {} }),
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      documentElement: { setAttribute() {}, style: {} },
      body: { appendChild() {}, classList: { add() {}, remove() {}, toggle() {} }, style: {} }
    }
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);

  const srcFiles = [
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
  for (const rel of srcFiles) {
    const full = path.join(ROOT, rel);
    vm.runInContext(fs.readFileSync(full, "utf8"), ctx, { filename: rel });
  }

  // Extract EVRASTER assets + views + atomNotes from src/app.js
  const appJs = fs.readFileSync(path.join(ROOT, "src/app.js"), "utf8");
  const assetsRaw = appJs.split("const EVRASTER = (() => {", 2)[1]
    .split("  const assets = ", 2)[1]
    .split("\n};", 2)[0] + "\n}";
  const rasterAssets = JSON.parse(assetsRaw);

  let atomNotes = {};
  const notesMatch = appJs.match(/const atomNotes=(\{[\s\S]*?\n    \});/);
  if (notesMatch) {
    atomNotes = vm.runInNewContext("(" + notesMatch[1] + ")");
  }

  let viewOverrides = {};
  const viewsMatch = appJs.match(/const views=(\{[\s\S]*?\});/);
  if (viewsMatch) {
    viewOverrides = vm.runInNewContext("(" + viewsMatch[1] + ")");
  }

  // Initialize FIGURE3D scene capture hook
  vm.runInContext(`
    globalThis.__CAPTURED = { scene: null, camera: null };
    FIGURE3D.init({
      getClearColor(){}, getClearAlpha(){ return 1; }, setClearColor(){},
      setRenderTarget(){},
      render(sc, cam){ globalThis.__CAPTURED.scene = sc; globalThis.__CAPTURED.camera = cam; },
      getRenderTarget(){ return null; }
    });
  `, ctx);

  function buildSpreadScene(worldId, section, timeSec = 0.85, forceBioModel = null) {
    return vm.runInContext(`
      (function() {
        const w = getWorld(${JSON.stringify(worldId)});
        if (!w) return null;
        const sp = w.spreads.find(s => String(s.section) === ${JSON.stringify(String(section))}) || w.spreads[0];
        if (!sp) return null;
        const params = {};
        const blk = (sp.scene && BLOCKS[sp.scene.type]) || null;
        if (blk && Array.isArray(blk.controls)) {
          for (const c of blk.controls) {
            if (c && c.id !== undefined && c.value !== undefined) params[c.id] = c.value;
          }
        }
        if (sp.scene && sp.scene.params) Object.assign(params, sp.scene.params);
        if (params.share !== undefined && params.share < 100) params.share = 100;
        const forcedBio = ${JSON.stringify(forceBioModel)};
        if (forcedBio && typeof BIO3D !== "undefined" && BIO3D.MODELS[forcedBio]) {
          const origSpec = BIO3D.spec;
          BIO3D.spec = (ww, ss) => {
            const base = origSpec(ww, ss) || {};
            const m = BIO3D.MODELS[forcedBio];
            return Object.assign({}, base, m, { model: forcedBio, parts: m.parts, labels: m.parts });
          };
          try { FIGURE3D.rebuild(sp, params, w); } finally { BIO3D.spec = origSpec; }
        } else {
          FIGURE3D.rebuild(sp, params, w);
        }
        let model = null;
        try { model = evalModel(sp, params); } catch (e) {}
        FIGURE3D.update(model, 0.016, ${Number(timeSec)});
        performance.now = (function(old){ return () => old() + 100; })(performance.now);
        FIGURE3D.render(0xeaf0f6);
        const bioId = forcedBio || ((typeof BIO3D !== "undefined") ? BIO3D.classify(w, sp) : null);
        const bioSpec = bioId ? BIO3D.spec(w, sp) : null;
        return {
          world: w,
          spread: sp,
          model,
          bioId,
          bioSpec,
          stats: FIGURE3D.stats(),
          scene: globalThis.__CAPTURED.scene,
          camera: globalThis.__CAPTURED.camera,
          THREE
        };
      })()
    `, ctx);
  }

  return { ctx, rasterAssets, atomNotes, viewOverrides, buildSpreadScene };
}

/* ============================================================================
   2. Z-BUFFERED PER-PIXEL PHONG + FRESNEL SOFTWARE 3D RASTERIZER
   ============================================================================ */
function isLabelArtifact(obj, isBio) {
  if (!obj.visible) return true;
  if (obj.userData && (obj.userData.isTag || obj.userData.isFigureLabel || obj.userData.handleId)) return true;
  const gType = obj.geometry && obj.geometry.type;
  // Backdrop & floor shadow planes from FIGURE3D root are replaced by crisp native 2D stage
  if (gType === "PlaneGeometry" && obj.position && obj.position.z < -4) return true;
  if (gType === "PlaneGeometry" && obj.material && obj.material.map) return true;
  if (obj.isPoints) return true; // skip dust points for clean textbook plates
  // Hide flat wooden slider base, rails & draggable handle knobs on interactive blocks
  if (obj.userData && obj.userData.controlId) return true;
  if (obj.parent && obj.parent.userData && obj.parent.userData.controlId) return true;
  if (gType === "TubeGeometry" && obj.material && obj.material.color && obj.material.color.getHex() === 0x9c8b6a) {
    const p = obj.geometry.parameters || {};
    if ((p.radius || 0) <= 0.025) return true;
  }
  if (gType === "BoxGeometry" && obj.position && obj.position.y <= 0.14) {
    const p = obj.geometry.parameters || {};
    if ((p.width >= 2.4 && p.height <= 0.12) || (p.width >= 2.2 && p.height <= 0.06 && obj.position.z > 0.45)) {
      return true;
    }
  }
  if ((obj.isLine || obj.isLineSegments) && obj.position && obj.position.y <= 0.06 && obj.geometry && obj.geometry.type === "EdgesGeometry") {
    return true;
  }
  // In BIO3D, all Line / LineSegments children are leader lines to 3D text columns
  if (isBio && (obj.isLine || obj.isLineSegments)) return true;
  if (isBio && gType === "ConeGeometry") return true;
  return false;
}

function renderThreeSceneToCanvas(bundle, vw, vh, opts = {}) {
  const { THREE, scene, bioId } = bundle;
  const isBio = !!bioId;
  const out = createCanvas(vw, vh);
  const octx = out.getContext("2d");

  if (!scene) return out;

  // Locate turntable/content group inside FIGURE3D scene
  let rootGroup = null;
  for (const ch of scene.children) {
    if (ch.type === "Group" && ch.children && ch.children.some(c => c.type === "Group")) {
      rootGroup = ch.children[0]; // content group
      break;
    }
  }
  if (!rootGroup) rootGroup = scene;

  // Reset rootGroup transform so we frame cleanly around actual 3D geometry
  const savedPos = rootGroup.position.clone();
  const savedRot = rootGroup.rotation.clone();
  const parentGroup = rootGroup.parent;
  const savedParentScale = parentGroup ? parentGroup.scale.clone() : null;
  const savedParentRot = parentGroup ? parentGroup.rotation.clone() : null;
  const savedParentPos = parentGroup ? parentGroup.position.clone() : null;

  rootGroup.position.set(0, 0, 0);
  if (parentGroup && parentGroup !== scene) {
    parentGroup.scale.set(1, 1, 1);
    parentGroup.rotation.set(0, opts.yaw !== undefined ? opts.yaw : 0.24, 0);
    parentGroup.position.set(0, 0, 0);
  }
  scene.updateMatrixWorld(true);

  const meshes = [];
  const lines = [];
  const bbox = new THREE.Box3();

  function collect(node) {
    if (!node || !node.visible) return;
    if (isLabelArtifact(node, isBio)) return;
    if (node.isMesh && node.geometry && node.geometry.attributes && node.geometry.attributes.position) {
      const mat = Array.isArray(node.material) ? node.material[0] : node.material;
      if (mat && mat.visible !== false) {
        if (node.isInstancedMesh) {
          const count = node.count || 0;
          const imat = node.matrixWorld.clone();
          for (let i = 0; i < count; i++) {
            node.getMatrixAt(i, imat);
            const worldMat = node.matrixWorld.clone().multiplyMatrices(node.matrixWorld, imat);
            let instColor = null;
            if (node.instanceColor) {
              instColor = new THREE.Color().fromBufferAttribute(node.instanceColor, i);
            }
            meshes.push({ geo: node.geometry, mat, worldMat, instColor });
            if (node.geometry.boundingBox === null) node.geometry.computeBoundingBox();
            if (node.geometry.boundingBox) {
              const b = node.geometry.boundingBox.clone().applyMatrix4(worldMat);
              bbox.union(b);
            }
          }
        } else {
          const worldMat = node.matrixWorld.clone();
          // Skip giant floor plates if larger than 8 units so framing stays tight on apparatus
          if (node.geometry.boundingBox === null) node.geometry.computeBoundingBox();
          const gb = node.geometry.boundingBox ? node.geometry.boundingBox.clone().applyMatrix4(worldMat) : null;
          const gs = gb ? gb.getSize(new THREE.Vector3()) : new THREE.Vector3(1, 1, 1);
          meshes.push({ geo: node.geometry, mat, worldMat, instColor: null, span: Math.max(gs.x, gs.y, gs.z) });
          if (gb && Math.max(gs.x, gs.z) < 6.5) bbox.union(gb);
        }
      }
    } else if ((node.isLine || node.isLineSegments) && node.geometry && node.geometry.attributes.position) {
      const mat = Array.isArray(node.material) ? node.material[0] : node.material;
      lines.push({ geo: node.geometry, mat, worldMat: node.matrixWorld.clone(), segments: !!node.isLineSegments });
      if (node.geometry.boundingBox === null) node.geometry.computeBoundingBox();
      if (node.geometry.boundingBox) {
        const gb = node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld);
        if (gb.getSize(new THREE.Vector3()).length() < 9) bbox.union(gb);
      }
    }
    if (node.children) {
      for (const ch of node.children) collect(ch);
    }
  }
  collect(rootGroup);

  // Restore scene state
  rootGroup.position.copy(savedPos);
  rootGroup.rotation.copy(savedRot);
  if (parentGroup && parentGroup !== scene && savedParentScale) {
    parentGroup.scale.copy(savedParentScale);
    parentGroup.rotation.copy(savedParentRot);
    parentGroup.position.copy(savedParentPos);
  }

  if (bbox.isEmpty() && meshes.length > 0) {
    for (const m of meshes) {
      if (m.geo.boundingBox) bbox.union(m.geo.boundingBox.clone().applyMatrix4(m.worldMat));
    }
  }
  if (bbox.isEmpty()) return out;

  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());
  const maxSpan = Math.max(size.x, size.y, size.z, 0.8);

  const fovDeg = 30;
  const fovRad = (fovDeg * Math.PI) / 180;
  const aspect = vw / vh;
  const radius = Math.max(
    (size.y * 0.56) / Math.tan(fovRad / 2),
    (size.x * 0.56) / (Math.tan(fovRad / 2) * aspect),
    maxSpan * 1.48
  );
  const pitch = opts.pitch !== undefined ? opts.pitch : (size.y < size.z * 0.45 && !isBio ? 0.62 : 0.34);
  const azim = opts.azim !== undefined ? opts.azim : (isBio ? 0.08 : 0.22);

  const cam = new THREE.PerspectiveCamera(fovDeg, aspect, 0.05, Math.max(80, radius * 8));
  cam.position.set(
    center.x + Math.sin(azim) * Math.cos(pitch) * radius,
    center.y + Math.sin(pitch) * radius,
    center.z + Math.cos(azim) * Math.cos(pitch) * radius
  );
  cam.lookAt(center);
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();

  const viewProj = cam.projectionMatrix.clone().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
  const camPos = cam.position;

  // Soft studio floor contact shadow
  octx.save();
  const shGrad = octx.createRadialGradient(vw * 0.5, vh * 0.80, vw * 0.03, vw * 0.5, vh * 0.80, vw * 0.36);
  shGrad.addColorStop(0, "rgba(18, 46, 76, 0.17)");
  shGrad.addColorStop(0.6, "rgba(18, 46, 76, 0.06)");
  shGrad.addColorStop(1, "rgba(18, 46, 76, 0)");
  octx.fillStyle = shGrad;
  octx.beginPath();
  octx.ellipse(vw * 0.5, vh * 0.80, vw * 0.35, vh * 0.085, 0, 0, Math.PI * 2);
  octx.fill();
  octx.restore();

  const imgData = octx.getImageData(0, 0, vw, vh);
  const pix = imgData.data;
  const zbuf = new Float32Array(vw * vh);
  zbuf.fill(1e9);

  // Studio lights (world space normalized)
  const keyDir = norm3(-0.48, 0.74, 0.47);
  const fillDir = norm3(0.62, 0.32, 0.71);
  const rimDir = norm3(0.15, 0.48, -0.86);

  // Extract triangles into opaque vs transparent queues
  const opaqueTris = [];
  const transTris = [];

  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();
  const nA = new THREE.Vector3(), nB = new THREE.Vector3(), nC = new THREE.Vector3();

  for (const item of meshes) {
    const { geo, mat, worldMat, instColor } = item;
    const posAttr = geo.attributes.position;
    if (!posAttr || posAttr.count < 3) continue;
    if (!geo.attributes.normal) {
      try { geo.computeVertexNormals(); } catch (e) {}
    }
    const normAttr = geo.attributes.normal;
    const colAttr = geo.attributes.color;
    const idxAttr = geo.index;

    const baseCol = instColor || (mat.color ? mat.color : new THREE.Color(0x4a80b8));
    let cr = baseCol.r, cg = baseCol.g, cb = baseCol.b;
    if (mat.emissive) {
      const ei = (mat.emissiveIntensity !== undefined ? mat.emissiveIntensity : 0.2) * 0.35;
      cr = Math.min(1, cr + mat.emissive.r * ei);
      cg = Math.min(1, cg + mat.emissive.g * ei);
      cb = Math.min(1, cb + mat.emissive.b * ei);
    }
    const opacity = mat.transparent ? Math.max(0.14, Math.min(0.95, mat.opacity ?? 0.55)) : 1.0;
    const isTrans = opacity < 0.94;
    const rough = mat.roughness !== undefined ? mat.roughness : 0.35;
    const metal = mat.metalness !== undefined ? mat.metalness : 0.12;
    const doubleSided = mat.side === THREE.DoubleSide || isTrans;

    const triCount = idxAttr ? Math.floor(idxAttr.count / 3) : Math.floor(posAttr.count / 3);
    for (let t = 0; t < triCount; t++) {
      const i0 = idxAttr ? idxAttr.getX(t * 3) : t * 3;
      const i1 = idxAttr ? idxAttr.getX(t * 3 + 1) : t * 3 + 1;
      const i2 = idxAttr ? idxAttr.getX(t * 3 + 2) : t * 3 + 2;

      vA.fromBufferAttribute(posAttr, i0).applyMatrix4(worldMat);
      vB.fromBufferAttribute(posAttr, i1).applyMatrix4(worldMat);
      vC.fromBufferAttribute(posAttr, i2).applyMatrix4(worldMat);

      // Project to clip/NDC
      const p0 = projectVec(vA, viewProj, vw, vh);
      const p1 = projectVec(vB, viewProj, vw, vh);
      const p2 = projectVec(vC, viewProj, vw, vh);
      if (!p0 || !p1 || !p2) continue;

      // Screen-space signed area (CCW check)
      const area = (p1.sx - p0.sx) * (p2.sy - p0.sy) - (p2.sx - p0.sx) * (p1.sy - p0.sy);
      if (Math.abs(area) < 0.15) continue;
      if (!doubleSided && area > 0) continue; // backface cull in Y-down screen coords

      if (normAttr) {
        nA.fromBufferAttribute(normAttr, i0).transformDirection(worldMat);
        nB.fromBufferAttribute(normAttr, i1).transformDirection(worldMat);
        nC.fromBufferAttribute(normAttr, i2).transformDirection(worldMat);
      } else {
        const e1x = vB.x - vA.x, e1y = vB.y - vA.y, e1z = vB.z - vA.z;
        const e2x = vC.x - vA.x, e2y = vC.y - vA.y, e2z = vC.z - vA.z;
        const fn = norm3(e1y * e2z - e1z * e2y, e1z * e2x - e1x * e2z, e1x * e2y - e1y * e2x);
        nA.set(fn[0], fn[1], fn[2]); nB.copy(nA); nC.copy(nA);
      }

      let tr = cr, tg = cg, tb = cb;
      if (colAttr) {
        tr *= (colAttr.getX(i0) + colAttr.getX(i1) + colAttr.getX(i2)) / 3;
        tg *= (colAttr.getY(i0) + colAttr.getY(i1) + colAttr.getY(i2)) / 3;
        tb *= (colAttr.getZ(i0) + colAttr.getZ(i1) + colAttr.getZ(i2)) / 3;
      }

      const flip = area > 0 ? -1 : 1;
      const c0 = shadeVertex(vA, nA, flip, camPos, keyDir, fillDir, rimDir, tr, tg, tb, rough, metal, isTrans);
      const c1 = shadeVertex(vB, nB, flip, camPos, keyDir, fillDir, rimDir, tr, tg, tb, rough, metal, isTrans);
      const c2 = shadeVertex(vC, nC, flip, camPos, keyDir, fillDir, rimDir, tr, tg, tb, rough, metal, isTrans);

      const tri = {
        x0: p0.sx, y0: p0.sy, z0: p0.z,
        x1: p1.sx, y1: p1.sy, z1: p1.z,
        x2: p2.sx, y2: p2.sy, z2: p2.z,
        c0, c1, c2, opacity,
        avgZ: (p0.z + p1.z + p2.z) / 3
      };
      if (isTrans) transTris.push(tri);
      else opaqueTris.push(tri);
    }
  }

  for (const tri of opaqueTris) {
    rasterizeTri(tri, pix, zbuf, vw, vh, false);
  }
  transTris.sort((a, b) => b.avgZ - a.avgZ);
  for (const tri of transTris) {
    rasterizeTri(tri, pix, zbuf, vw, vh, true);
  }

  octx.putImageData(imgData, 0, 0);

  // Project and draw crisp 3D lines (rays, bonds, axes, field lines) on top where visible
  for (const ln of lines) {
    const pos = ln.geo.attributes.position;
    if (!pos || pos.count < 2) continue;
    const col = ln.mat && ln.mat.color ? "#" + ln.mat.color.getHexString() : "#1c4d7a";
    octx.save();
    octx.strokeStyle = col;
    octx.lineWidth = 2.4;
    octx.lineCap = "round";
    octx.globalAlpha = ln.mat && ln.mat.transparent ? Math.max(0.45, ln.mat.opacity ?? 0.8) : 0.92;
    const step = ln.segments ? 2 : 1;
    octx.beginPath();
    let penDown = false;
    for (let i = 0; i < pos.count; i += step) {
      if (ln.segments && i + 1 < pos.count) {
        vA.fromBufferAttribute(pos, i).applyMatrix4(ln.worldMat);
        vB.fromBufferAttribute(pos, i + 1).applyMatrix4(ln.worldMat);
        const p0 = projectVec(vA, viewProj, vw, vh);
        const p1 = projectVec(vB, viewProj, vw, vh);
        if (p0 && p1) {
          octx.moveTo(p0.sx, p0.sy);
          octx.lineTo(p1.sx, p1.sy);
        }
      } else if (!ln.segments) {
        vA.fromBufferAttribute(pos, i).applyMatrix4(ln.worldMat);
        const p0 = projectVec(vA, viewProj, vw, vh);
        if (p0) {
          if (!penDown) { octx.moveTo(p0.sx, p0.sy); penDown = true; }
          else octx.lineTo(p0.sx, p0.sy);
        } else penDown = false;
      }
    }
    octx.stroke();
    octx.restore();
  }

  return out;
}

function norm3(x, y, z) {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}

function projectVec(v, m, vw, vh) {
  const e = m.elements;
  const x = v.x, y = v.y, z = v.z;
  const cw = e[3] * x + e[7] * y + e[11] * z + e[15];
  if (cw <= 0.02) return null;
  const cx = (e[0] * x + e[4] * y + e[8] * z + e[12]) / cw;
  const cy = (e[1] * x + e[5] * y + e[9] * z + e[13]) / cw;
  const cz = (e[2] * x + e[6] * y + e[10] * z + e[14]) / cw;
  if (cx < -1.5 || cx > 1.5 || cy < -1.5 || cy > 1.5) return null;
  return {
    sx: (cx * 0.5 + 0.5) * vw,
    sy: (-cy * 0.5 + 0.5) * vh,
    z: cz
  };
}

function shadeVertex(pos, n, flip, camPos, keyDir, fillDir, rimDir, cr, cg, cb, rough, metal, isTrans) {
  const nx = n.x * flip, ny = n.y * flip, nz = n.z * flip;
  const vx0 = camPos.x - pos.x, vy0 = camPos.y - pos.y, vz0 = camPos.z - pos.z;
  const vl = Math.hypot(vx0, vy0, vz0) || 1;
  const vx = vx0 / vl, vy = vy0 / vl, vz = vz0 / vl;

  const ndotl = Math.max(0, nx * keyDir[0] + ny * keyDir[1] + nz * keyDir[2]);
  const ndotf = Math.max(0, nx * fillDir[0] + ny * fillDir[1] + nz * fillDir[2]);
  const ndotr = Math.max(0, nx * rimDir[0] + ny * rimDir[1] + nz * rimDir[2]);
  const ndotv = Math.max(0, nx * vx + ny * vy + nz * vz);

  // Hemisphere ambient (sky warm white, ground cool blue-grey)
  const hemi = 0.5 * ny + 0.5;
  const ambR = 0.34 * hemi + 0.22 * (1 - hemi);
  const ambG = 0.36 * hemi + 0.25 * (1 - hemi);
  const ambB = 0.40 * hemi + 0.30 * (1 - hemi);

  // Blinn-Phong specular from key light
  const hx0 = keyDir[0] + vx, hy0 = keyDir[1] + vy, hz0 = keyDir[2] + vz;
  const hl = Math.hypot(hx0, hy0, hz0) || 1;
  const ndoth = Math.max(0, (nx * hx0 + ny * hy0 + nz * hz0) / hl);
  const shininess = Math.max(12, (1 - rough) * 72);
  const spec = Math.pow(ndoth, shininess) * (0.28 + (1 - rough) * 0.42 + metal * 0.25);

  // Fresnel rim glow
  const fresnel = Math.pow(1 - ndotv, 2.6) * (isTrans ? 0.55 : 0.20 + ndotr * 0.25);

  const diffR = ambR + ndotl * 0.72 + ndotf * 0.22;
  const diffG = ambG + ndotl * 0.70 + ndotf * 0.25;
  const diffB = ambB + ndotl * 0.66 + ndotf * 0.30;

  const r = Math.min(255, Math.round((cr * diffR + spec + fresnel * 0.75) * 255));
  const g = Math.min(255, Math.round((cg * diffG + spec * 0.98 + fresnel * 0.88) * 255));
  const b = Math.min(255, Math.round((cb * diffB + spec * 0.95 + fresnel * 1.0) * 255));
  return [r, g, b];
}

function rasterizeTri(t, pix, zbuf, vw, vh, blend) {
  const minX = Math.max(0, Math.floor(Math.min(t.x0, t.x1, t.x2)));
  const maxX = Math.min(vw - 1, Math.ceil(Math.max(t.x0, t.x1, t.x2)));
  const minY = Math.max(0, Math.floor(Math.min(t.y0, t.y1, t.y2)));
  const maxY = Math.min(vh - 1, Math.ceil(Math.max(t.y0, t.y1, t.y2)));
  if (minX > maxX || minY > maxY) return;

  const denom = (t.y1 - t.y2) * (t.x0 - t.x2) + (t.x2 - t.x1) * (t.y0 - t.y2);
  if (Math.abs(denom) < 1e-6) return;
  const invD = 1 / denom;

  const a12y = (t.y1 - t.y2) * invD, b21x = (t.x2 - t.x1) * invD;
  const a20y = (t.y2 - t.y0) * invD, b02x = (t.x0 - t.x2) * invD;
  const c0 = t.c0, c1 = t.c1, c2 = t.c2;
  const alpha = t.opacity;

  for (let py = minY; py <= maxY; py++) {
    const dy = py + 0.5 - t.y2;
    const rowOff = py * vw;
    for (let px = minX; px <= maxX; px++) {
      const dx = px + 0.5 - t.x2;
      const w0 = a12y * dx + b21x * dy;
      if (w0 < -0.0005) continue;
      const w1 = a20y * dx + b02x * dy;
      if (w1 < -0.0005) continue;
      const w2 = 1 - w0 - w1;
      if (w2 < -0.0005) continue;

      const z = w0 * t.z0 + w1 * t.z1 + w2 * t.z2;
      const idx = rowOff + px;
      if (z > zbuf[idx]) continue;

      const r = w0 * c0[0] + w1 * c1[0] + w2 * c2[0];
      const g = w0 * c0[1] + w1 * c1[1] + w2 * c2[1];
      const b = w0 * c0[2] + w1 * c1[2] + w2 * c2[2];
      const p4 = idx * 4;

      if (!blend) {
        zbuf[idx] = z;
        pix[p4] = r;
        pix[p4 + 1] = g;
        pix[p4 + 2] = b;
        pix[p4 + 3] = 255;
      } else {
        const dstA = pix[p4 + 3] / 255;
        const outA = alpha + dstA * (1 - alpha);
        if (outA > 0.001) {
          pix[p4] = (r * alpha + pix[p4] * dstA * (1 - alpha)) / outA;
          pix[p4 + 1] = (g * alpha + pix[p4 + 1] * dstA * (1 - alpha)) / outA;
          pix[p4 + 2] = (b * alpha + pix[p4 + 2] * dstA * (1 - alpha)) / outA;
          pix[p4 + 3] = Math.min(255, outA * 255);
        }
      }
    }
  }
}

/* ============================================================================
   3. 2D SCIENTIFIC VECTOR SCHEMATICS & TYPOGRAPHY HELPERS
   ============================================================================ */
function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function fitTextLine(ctx, text, maxW, maxPx, minPx = 12, weight = "700", family = FONT_SANS) {
  let px = maxPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > minPx && ctx.measureText(text).width > maxW) {
    px -= 1;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  let out = text;
  if (ctx.measureText(out).width > maxW) {
    while (out.length > 4 && ctx.measureText(out + "…").width > maxW) {
      out = out.slice(0, -1);
    }
    out += "…";
  }
  return { px, font: `${weight} ${px}px ${family}`, text: out };
}

function wrapText(ctx, text, maxW, maxLines) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let cur = words[0];
  for (let i = 1; i < words.length; i++) {
    const cand = cur + " " + words[i];
    if (ctx.measureText(cand).width <= maxW) {
      cur = cand;
    } else {
      lines.push(cur);
      cur = words[i];
      if (lines.length >= maxLines - 1) {
        for (let j = i + 1; j < words.length; j++) {
          if (ctx.measureText(cur + " " + words[j]).width <= maxW) cur += " " + words[j];
          else { cur += "…"; break; }
        }
        break;
      }
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  return lines;
}

function drawBackdrop(ctx, theme) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, theme.bgTop);
  g.addColorStop(1, theme.bgBot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Subtle textbook engineering grid
  ctx.save();
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  for (let x = 32; x < W; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 32; y < H; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  // Crisp outer plate border
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 3;
  roundRect(ctx, 8, 8, W - 16, H - 16, 14);
  ctx.stroke();
  ctx.restore();
}

function drawStageCard(ctx, x, y, w, h, theme) {
  ctx.save();
  ctx.shadowColor = "rgba(12, 32, 56, 0.10)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 5;
  const g = ctx.createRadialGradient(x + w * 0.5, y + h * 0.44, w * 0.06, x + w * 0.5, y + h * 0.5, Math.max(w, h) * 0.68);
  g.addColorStop(0, theme.stageTop);
  g.addColorStop(1, theme.stageBot);
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(22, 62, 98, 0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawCalloutCard(ctx, spec, idx, theme) {
  const { x, y, w, h, en, hi, info_en, info_hi } = spec;
  const accent = theme.palette[idx % theme.palette.length];

  ctx.save();
  ctx.shadowColor = "rgba(11, 24, 42, 0.16)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#0d2844";
  ctx.lineWidth = 2.4;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();

  // Left color stripe
  ctx.save();
  roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 9);
  ctx.clip();
  ctx.fillStyle = accent;
  ctx.fillRect(x, y, 8, h);
  ctx.restore();

  const innerX = x + 16;
  const innerW = w - 24;

  if (h <= 62) {
    // Compact single/dual-line callout (typical h=52)
    const combined = `${en} · ${hi}`;
    ctx.font = `700 18px ${FONT_SANS}`;
    if (ctx.measureText(combined).width <= innerW) {
      const f = fitTextLine(ctx, combined, innerW, 19, 13, "700", FONT_SANS);
      ctx.font = f.font;
      ctx.fillStyle = "#0b1a2a";
      ctx.textBaseline = "middle";
      ctx.fillText(f.text, innerX, y + h * 0.51);
    } else {
      const fEn = fitTextLine(ctx, en, innerW, 16, 12, "800", FONT_SANS);
      ctx.font = fEn.font;
      ctx.fillStyle = "#0b1a2a";
      ctx.textBaseline = "middle";
      ctx.fillText(fEn.text, innerX, y + h * 0.33);

      const fHi = fitTextLine(ctx, hi, innerW, 15, 11, "700", FONT_SANS);
      ctx.font = fHi.font;
      ctx.fillStyle = accent;
      ctx.fillText(fHi.text, innerX, y + h * 0.72);
    }
  } else if (h < 96) {
    // Medium two-line callout (h=65..92)
    const fEn = fitTextLine(ctx, en, innerW, 20, 14, "800", FONT_SANS);
    ctx.font = fEn.font;
    ctx.fillStyle = "#0b1a2a";
    ctx.textBaseline = "middle";
    ctx.fillText(fEn.text, innerX, y + h * 0.34);

    const fHi = fitTextLine(ctx, hi, innerW, 18, 13, "700", FONT_SANS);
    ctx.font = fHi.font;
    ctx.fillStyle = accent;
    ctx.fillText(fHi.text, innerX, y + h * 0.70);
  } else {
    // Tall teaching card (h=96..195): bilingual header + concise scientific summary
    const fEn = fitTextLine(ctx, `${en} · ${hi}`, innerW, 19, 13, "800", FONT_SANS);
    ctx.font = fEn.font;
    ctx.fillStyle = "#0b1a2a";
    ctx.textBaseline = "top";
    ctx.fillText(fEn.text, innerX, y + 10);

    ctx.strokeStyle = "rgba(13, 40, 68, 0.16)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(innerX, y + 36);
    ctx.lineTo(x + w - 10, y + 36);
    ctx.stroke();

    const summary = String(info_en || "").split(/(?<=\.)\s+/)[0] || "";
    ctx.font = `600 14px ${FONT_SANS}`;
    ctx.fillStyle = "#243b53";
    const availH = h - 44;
    const maxL = Math.max(1, Math.min(4, Math.floor(availH / 19)));
    const lines = wrapText(ctx, summary, innerW, maxL);
    lines.forEach((ln, li) => {
      ctx.fillText(ln, innerX, y + 42 + li * 19);
    });
    if (availH - lines.length * 19 >= 20 && info_hi) {
      const hiSummary = String(info_hi).split(/[।.]\s*/)[0] || "";
      const fHiS = fitTextLine(ctx, hiSummary, innerW, 13, 11, "600", FONT_SANS);
      ctx.font = fHiS.font;
      ctx.fillStyle = accent;
      ctx.fillText(fHiS.text, innerX, y + 44 + lines.length * 19);
    }
  }
  ctx.restore();
}

function drawLeaderCurve(ctx, fromX, fromY, toX, toY, color, routeChannelY = null) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const strokePath = () => {
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    if (routeChannelY !== null) {
      const turnX = Math.min(fromX - 24, 700);
      ctx.lineTo(fromX, routeChannelY);
      ctx.lineTo(turnX, routeChannelY);
      ctx.bezierCurveTo(turnX - 60, routeChannelY, toX + 80, toY, toX, toY);
    } else {
      const midX = fromX + (toX - fromX) * 0.45;
      ctx.bezierCurveTo(midX, fromY, midX, toY, toX, toY);
    }
    ctx.stroke();
  };

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 5.2;
  strokePath();

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  strokePath();

  ctx.fillStyle = color;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(toX, toY, 6.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function findModelTargets(figCanvas, offX, offY, count) {
  const fw = figCanvas.width, fh = figCanvas.height;
  const data = figCanvas.getContext("2d").getImageData(0, 0, fw, fh).data;
  const pts = [];
  const n = Math.max(1, count);
  for (let b = 0; b < n; b++) {
    const y0 = Math.floor((fh * (0.12 + (0.72 * b) / n)));
    const y1 = Math.floor((fh * (0.12 + (0.72 * (b + 1)) / n)));
    let sumX = 0, sumY = 0, wSum = 0;
    for (let y = y0; y < y1; y += 3) {
      for (let x = Math.floor(fw * 0.14); x < Math.floor(fw * 0.88); x += 3) {
        const i = (y * fw + x) * 4;
        const a = data[i + 3];
        if (a > 210) {
          // Prefer saturated/non-shadow pixels over floor shadow
          const maxC = Math.max(data[i], data[i + 1], data[i + 2]);
          const minC = Math.min(data[i], data[i + 1], data[i + 2]);
          const wt = 1 + (maxC - minC) * 0.08 + (x / fw) * 0.6;
          sumX += x * wt;
          sumY += y * wt;
          wSum += wt;
        }
      }
    }
    if (wSum > 10) {
      const avgX = sumX / wSum, avgY = sumY / wSum;
      // Snap to nearest guaranteed-opaque pixel in this band so symmetric shapes (e.g. two lungs) never land in a gap
      let bestX = avgX, bestY = avgY, bestDist = 1e9;
      for (let y = y0; y < y1; y += 3) {
        for (let x = Math.floor(fw * 0.16); x < Math.floor(fw * 0.88); x += 3) {
          const i = (y * fw + x) * 4;
          if (data[i + 3] > 235) {
            const d = Math.hypot(x - avgX, y - avgY) - (x > fw * 0.5 ? 8 : 0);
            if (d < bestDist) { bestDist = d; bestX = x; bestY = y; }
          }
        }
      }
      pts.push([offX + bestX, offY + bestY]);
    } else {
      pts.push([offX + fw * 0.55, offY + fh * (0.30 + 0.40 * (b / Math.max(1, n - 1)))]);
    }
  }
  return pts;
}

/* ============================================================================
   4. BESPOKE SCIENTIFIC DIAGRAMS FOR SUPPLEMENTS & SCHEMATIC PANELS
   ============================================================================ */
function drawBespokeSupplement(ctx, fileName, rect, theme, sp, specs = []) {
  const { x, y, w, h } = rect;
  const cx = x + w / 2, cy = y + h / 2;

  if (fileName.startsWith("7-09-")) {
    // Simple machines 6-plate suite: Class 1/2/3 levers, fixed/movable pulleys, inclined plane
    ctx.save();
    const a0 = specs[0] && specs[0].anchor_x ? [specs[0].anchor_x, specs[0].anchor_y] : [cx - 180, cy];
    const a1 = specs[1] && specs[1].anchor_x ? [specs[1].anchor_x, specs[1].anchor_y] : [cx + 180, cy];

    if (fileName.includes("pulley")) {
      const movable = fileName.includes("movable");
      const wheelX = a0[0], wheelY = a0[1];
      // Support beam
      ctx.fillStyle = "#344e68";
      roundRect(ctx, Math.min(wheelX, a1[0]) - 150, y + 32, Math.abs(a1[0] - wheelX) + 300, 20, 6);
      ctx.fill();
      // Hanger
      ctx.strokeStyle = "#1c4386"; ctx.lineWidth = 7;
      ctx.beginPath();
      if (!movable) { ctx.moveTo(wheelX, y + 52); ctx.lineTo(wheelX, wheelY); }
      else { ctx.moveTo(wheelX - 56, y + 52); ctx.lineTo(wheelX - 56, wheelY); }
      ctx.stroke();
      // Rope
      ctx.strokeStyle = "#b86b28"; ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(wheelX - 56, wheelY); ctx.lineTo(wheelX - 56, movable ? y + 52 : wheelY + 150);
      ctx.moveTo(wheelX + 56, wheelY); ctx.lineTo(a1[0], a1[1]);
      ctx.stroke();
      // Grooved Pulley Wheel
      ctx.fillStyle = "#dce7f5"; ctx.strokeStyle = "#163468"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(wheelX, wheelY, 56, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#163468"; ctx.beginPath(); ctx.arc(wheelX, wheelY, 12, 0, Math.PI * 2); ctx.fill();
      // Load mass
      const lx = movable ? wheelX - 48 : wheelX - 100;
      const ly = movable ? wheelY + 68 : wheelY + 148;
      ctx.fillStyle = "#d96b2b"; roundRect(ctx, lx, ly, 96, 70, 9); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = `800 18px ${FONT_SANS}`; ctx.textAlign = "center";
      ctx.fillText("LOAD · भार", lx + 48, ly + 42);
      drawVectorArrow(ctx, a1[0], a1[1] + (movable ? 85 : -85), a1[0], a1[1], "#188a74", "EFFORT · आयास");
      ctx.restore();
      return true;
    }
    if (fileName.includes("incline")) {
      const bx0 = Math.min(a0[0], a1[0]) - 130, by0 = y + h - 56;
      const bx1 = Math.max(a0[0], a1[0]) + 150, by1 = Math.min(a0[1], a1[1]) - 40;
      ctx.fillStyle = "#d8e4f4"; ctx.strokeStyle = "#163468"; ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx1, by0); ctx.lineTo(bx1, by1); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#163468"; ctx.font = `800 18px ${FONT_SANS}`;
      ctx.fillText("h", bx1 + 18, (by0 + by1) / 2);
      ctx.fillText("MA = L / h  (Inclined Plane · आनत तल)", (bx0 + bx1) / 2 - 140, by0 + 34);
      const ang = Math.atan2(by1 - by0, bx1 - bx0);
      ctx.save();
      ctx.translate(a0[0], a0[1]);
      ctx.rotate(ang);
      ctx.fillStyle = "#d96b2b"; roundRect(ctx, -52, -58, 104, 56, 8); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = `800 16px ${FONT_SANS}`; ctx.textAlign = "center";
      ctx.fillText("Load W", 0, -24);
      drawVectorArrow(ctx, 56, -30, 175, -30, "#188a74", "Effort F < W");
      ctx.restore();
      ctx.restore();
      return true;
    }
    // Levers: Class 1, Class 2, Class 3 — aligned to anchor points
    const cls = fileName.includes("second-class") ? 2 : fileName.includes("third-class") ? 3 : 1;
    const beamY = Math.max(cy + 30, Math.max(a0[1], a1[1]) + 42);
    const beamX0 = Math.min(a0[0], a1[0], cx - 280) - 70;
    const beamX1 = Math.max(a0[0], a1[0], cx + 280) + 70;
    ctx.fillStyle = "#2b558c";
    roundRect(ctx, beamX0, beamY - 12, beamX1 - beamX0, 24, 9);
    ctx.fill();

    const fulX = cls === 1 ? (a0[0] + a1[0]) / 2 : a0[0];
    const loadX = cls === 1 ? a0[0] : cls === 2 ? a1[0] : beamX1 - 95;
    const effX = cls === 1 ? a1[0] : cls === 2 ? beamX1 - 95 : a1[0];

    // Fulcrum triangle
    ctx.fillStyle = "#188a74"; ctx.beginPath();
    ctx.moveTo(fulX, beamY + 12); ctx.lineTo(fulX - 36, beamY + 76); ctx.lineTo(fulX + 36, beamY + 76);
    ctx.closePath(); ctx.fill();
    drawPillTag(ctx, fulX, beamY + 98, "Fulcrum · आलंब", "#188a74");

    // Load block
    ctx.fillStyle = "#d96b2b"; roundRect(ctx, loadX - 54, beamY - 90, 108, 76, 10); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.font = `800 18px ${FONT_SANS}`; ctx.textAlign = "center";
    ctx.fillText("Load · भार", loadX, beamY - 46);

    // Effort vector arrow
    const up = cls !== 1;
    drawVectorArrow(ctx, effX, up ? beamY - 16 : beamY - 130, effX, up ? beamY - 130 : beamY - 16, "#2255a4", "Effort · आयास");
    ctx.restore();
    return true;
  }

  if (fileName === "8-05-rutherford-scattering.jpg") {
    ctx.save();
    // Alpha emitter box -> gold foil -> circular ZnS screen
    ctx.fillStyle = "#334e68"; roundRect(ctx, x + 40, cy - 38, 120, 76, 10); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.font = `800 16px ${FONT_SANS}`; ctx.textAlign = "center";
    ctx.fillText("α Source", x + 100, cy + 5);
    // Circular ZnS screen arc
    ctx.strokeStyle = "#1c8c6e"; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(cx + 80, cy, 185, -Math.PI * 0.78, Math.PI * 0.78); ctx.stroke();
    // Gold foil strip
    ctx.fillStyle = "#e0a82e"; ctx.strokeStyle = "#9c6d10"; ctx.lineWidth = 3;
    roundRect(ctx, cx + 70, cy - 115, 20, 230, 5); ctx.fill(); ctx.stroke();
    // Alpha rays (most straight, few deflected, 1 rebound)
    const rays = [
      [[x + 160, cy - 22], [cx + 80, cy - 22], [cx + 262, cy - 22]],
      [[x + 160, cy + 22], [cx + 80, cy + 22], [cx + 262, cy + 22]],
      [[x + 160, cy - 8], [cx + 80, cy - 8], [cx + 220, cy - 120]],
      [[x + 160, cy + 8], [cx + 80, cy + 8], [cx + 205, cy + 135]],
      [[x + 160, cy], [cx + 76, cy], [x + 230, cy - 95]]
    ];
    ctx.strokeStyle = "#d94848"; ctx.lineWidth = 3.2;
    for (const r of rays) {
      ctx.beginPath(); ctx.moveTo(r[0][0], r[0][1]); ctx.lineTo(r[1][0], r[1][1]); ctx.lineTo(r[2][0], r[2][1]); ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  if (fileName === "8-09-isotopes-isobars.jpg") {
    ctx.save();
    const cols = [
      { cx: 340, sym: "¹²₆C", sub: "6 p⁺  +  6 n⁰", col: "#1d68a8" },
      { cx: 700, sym: "¹⁴₆C", sub: "6 p⁺  +  8 n⁰ (Isotope)", col: "#1c8c6e" },
      { cx: 1070, sym: "¹⁴₇N", sub: "7 p⁺  +  7 n⁰ (Isobar)", col: "#d47828" }
    ];
    for (const c of cols) {
      const ny = y + h * 0.50;
      ctx.strokeStyle = "rgba(26,82,134,0.28)"; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(c.cx, ny, 92, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(c.cx, ny, 56, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = c.col;
      ctx.beginPath(); ctx.arc(c.cx, ny, 34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = `800 20px ${FONT_SANS}`; ctx.textAlign = "center";
      ctx.fillText(c.sym, c.cx, ny + 7);
      ctx.fillStyle = "#0b1c2c"; ctx.font = `700 17px ${FONT_SANS}`;
      ctx.fillText(c.sub, c.cx, ny + 125);
    }
    ctx.restore();
    return true;
  }

  if (fileName === "8-10-methane-valency.jpg" || fileName === "8-10-water-supplement.jpg") {
    ctx.save();
    const isMethane = fileName.includes("methane");
    const ox = cx, oy = cy;
    // Shared electron rings
    ctx.strokeStyle = "#1a5286"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(ox, oy, 108, 0, Math.PI * 2); ctx.stroke();
    const hDirs = isMethane
      ? [[0, -138], [138, 0], [0, 138], [-138, 0]]
      : [[-128, 68], [128, 68]];
    for (const [dx, dy] of hDirs) {
      ctx.strokeStyle = "#1c8c6e"; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.arc(ox + dx, oy + dy, 58, 0, Math.PI * 2); ctx.stroke();
      // Shared pair dots
      const mx = ox + dx * 0.62, my = oy + dy * 0.62;
      ctx.fillStyle = "#1a5286"; ctx.beginPath(); ctx.arc(mx - 6, my - 5, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#d47828"; ctx.beginPath(); ctx.arc(mx + 6, my + 5, 5.5, 0, Math.PI * 2); ctx.fill();
      // H nucleus
      ctx.fillStyle = "#1c8c6e"; ctx.beginPath(); ctx.arc(ox + dx, oy + dy, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = `800 18px ${FONT_SANS}`; ctx.textAlign = "center";
      ctx.fillText("H", ox + dx, oy + dy + 6);
    }
    // Central C or O atom
    ctx.fillStyle = isMethane ? "#263849" : "#c84848";
    ctx.beginPath(); ctx.arc(ox, oy, 40, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.font = `800 24px ${FONT_SANS}`; ctx.textAlign = "center";
    ctx.fillText(isMethane ? "C" : "O", ox, oy + 8);
    ctx.restore();
    return true;
  }

  return false;
}

function drawPillTag(ctx, cx, cy, label, borderCol) {
  ctx.save();
  ctx.font = `800 15px ${FONT_SANS}`;
  const tw = ctx.measureText(label).width + 24;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = borderCol;
  ctx.lineWidth = 2;
  roundRect(ctx, cx - tw / 2, cy - 15, tw, 30, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#0b1a2a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy);
  ctx.restore();
}

function drawVectorArrow(ctx, x0, y0, x1, y1, color, label) {
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 5.5;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - 16 * Math.cos(a - 0.45), y1 - 16 * Math.sin(a - 0.45));
  ctx.lineTo(x1 - 16 * Math.cos(a + 0.45), y1 - 16 * Math.sin(a + 0.45));
  ctx.closePath(); ctx.fill();
  if (label) {
    drawPillTag(ctx, (x0 + x1) / 2, Math.min(y0, y1) - 22, label, color);
  }
  ctx.restore();
}

function drawConceptSchematicCard(ctx, rect, sp, world, theme, notePair) {
  const { x, y, w, h } = rect;
  if (w < 180 || h < 110) return;

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.90)";
  ctx.strokeStyle = "rgba(22, 62, 98, 0.22)";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();

  let curY = y + 14;
  const padX = x + 16;
  const innerW = w - 32;

  // Header pill: NCERT Section + Bilingual Title
  const secBadge = `NCERT ${world.cls || "IX"} · § ${sp.section}`;
  ctx.fillStyle = theme.badgeBg;
  const badgeW = Math.min(innerW, Math.max(128, secBadge.length * 9.5 + 20));
  roundRect(ctx, padX, curY, badgeW, 26, 6);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 13px ${FONT_SANS}`;
  ctx.textBaseline = "middle";
  ctx.fillText(secBadge, padX + 10, curY + 13);
  curY += 36;

  // Bilingual spread title
  const tEn = fitTextLine(ctx, sp.title || "", innerW, 21, 14, "800", FONT_SANS);
  ctx.font = tEn.font;
  ctx.fillStyle = theme.ink;
  ctx.textBaseline = "top";
  ctx.fillText(tEn.text, padX, curY);
  curY += tEn.px + 5;

  if (sp.titleHi && curY + 22 < y + h - 10) {
    const tHi = fitTextLine(ctx, sp.titleHi, innerW, 18, 13, "700", FONT_SANS);
    ctx.font = tHi.font;
    ctx.fillStyle = theme.accent;
    ctx.fillText(tHi.text, padX, curY);
    curY += tHi.px + 10;
  }

  // Formula / Key Principle Ribbon if space permits
  const eqText = (sp.formula && sp.formula.eq)
    ? `${sp.formula.label ? sp.formula.label + ": " : ""}${sp.formula.eq}`
    : null;
  if (eqText && curY + 42 < y + h - 12) {
    ctx.fillStyle = theme.accentSoft;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.6;
    roundRect(ctx, padX, curY, innerW, 36, 8);
    ctx.fill();
    ctx.stroke();
    const fEq = fitTextLine(ctx, eqText, innerW - 20, 17, 12, "800", FONT_MONO);
    ctx.font = fEq.font;
    ctx.fillStyle = theme.ink;
    ctx.textBaseline = "middle";
    ctx.fillText(fEq.text, padX + 10, curY + 18);
    curY += 46;
  }

  // Diagram labels flow / nodes if space permits
  const figLabels = (sp.scene && sp.scene.fig && Array.isArray(sp.scene.fig.labels))
    ? sp.scene.fig.labels.slice(0, 4)
    : (Array.isArray(sp.vocab) ? sp.vocab.slice(0, 3).map(v => v[0]) : []);

  if (figLabels.length >= 2 && curY + 52 < y + h - 14) {
    const n = figLabels.length;
    const gap = 12;
    const bw = Math.floor((innerW - gap * (n - 1)) / n);
    for (let i = 0; i < n; i++) {
      const bx = padX + i * (bw + gap);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = theme.palette[i % theme.palette.length];
      ctx.lineWidth = 2;
      roundRect(ctx, bx, curY, bw, 38, 7);
      ctx.fill();
      ctx.stroke();
      const fl = fitTextLine(ctx, String(figLabels[i]), bw - 12, 14, 10, "700", FONT_SANS);
      ctx.font = fl.font;
      ctx.fillStyle = theme.ink;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(fl.text, bx + bw / 2, curY + 19);
      ctx.textAlign = "left";
      if (i < n - 1) {
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + bw + 2, curY + 19);
        ctx.lineTo(bx + bw + gap - 2, curY + 19);
        ctx.stroke();
      }
    }
    curY += 48;
  }

  // Concise bilingual scientific takeaway
  const remH = (y + h - 14) - curY;
  if (remH >= 26) {
    const conceptEn = (notePair && notePair[0]) ? notePair[0].split(/(?<=\.)\s+/)[0] : (sp.concept || "");
    ctx.font = `600 14px ${FONT_SANS}`;
    ctx.fillStyle = theme.muted;
    ctx.textBaseline = "top";
    const maxL = Math.min(3, Math.floor(remH / 19));
    const lines = wrapText(ctx, conceptEn, innerW, maxL);
    lines.forEach((ln, idx) => {
      ctx.fillText(ln, padX, curY + idx * 19);
    });
    curY += lines.length * 19 + 12;
  }

  // Rich NCERT Key Terms & Schematic Sub-panel when vertical space remains
  const subH = (y + h - 14) - curY;
  if (subH >= 105) {
    ctx.fillStyle = theme.bgTop;
    ctx.strokeStyle = "rgba(22, 62, 98, 0.16)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, padX, curY, innerW, subH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme.accent;
    ctx.font = `800 12px ${FONT_SANS}`;
    ctx.textBaseline = "top";
    ctx.fillText("KEY CONCEPTS & OBSERVATIONS · मुख्य बिंदु एवं अवलोकन", padX + 14, curY + 10);

    const vocab = Array.isArray(sp.vocab) ? sp.vocab.slice(0, 3) : [];
    let vy = curY + 32;
    if (vocab.length > 0) {
      for (let i = 0; i < vocab.length; i++) {
        if (vy + 34 > curY + subH - 8) break;
        const [term, def] = vocab[i];
        const col = theme.palette[i % theme.palette.length];
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(padX + 20, vy + 9, 4.5, 0, Math.PI * 2); ctx.fill();
        const cleanDef = String(def || "").trim().replace(/\s+\S{1,4}$/, m => (/[.!?)]$/.test(m) ? m : "…"));
        const lineStr = `${term}: ${cleanDef}`;
        const fV = fitTextLine(ctx, lineStr, innerW - 44, 13.5, 11, "600", FONT_SANS);
        ctx.font = fV.font;
        ctx.fillStyle = theme.ink;
        ctx.fillText(fV.text, padX + 32, vy);
        vy += 26;
      }
    }
    if (notePair && notePair[1] && vy + 24 <= curY + subH - 8) {
      const hiTakeaway = String(notePair[1]).split(/[।.]\s*/)[0] || "";
      const fHi = fitTextLine(ctx, "हिंदी सार: " + hiTakeaway, innerW - 28, 14, 11, "700", FONT_SANS);
      ctx.font = fHi.font;
      ctx.fillStyle = theme.accent;
      ctx.fillText(fHi.text, padX + 14, vy + 4);
      vy += 26;
    }
    // Try-hint / exam check bar at bottom of schematic sub-panel
    const hintStr = sp.tryHint || (sp.formula && sp.formula.note) || "";
    if (hintStr && curY + subH - vy >= 34) {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = theme.accent2;
      ctx.lineWidth = 1.4;
      roundRect(ctx, padX + 12, curY + subH - 36, innerW - 24, 26, 6);
      ctx.fill();
      ctx.stroke();
      const fH = fitTextLine(ctx, "⚡ " + hintStr, innerW - 44, 12.5, 10, "700", FONT_SANS);
      ctx.font = fH.font;
      ctx.fillStyle = theme.ink;
      ctx.textBaseline = "middle";
      ctx.fillText(fH.text, padX + 22, curY + subH - 23);
    }
  }

  ctx.restore();
}

/* ============================================================================
   5. FIND LARGEST CLEAR RECTANGLE AVOIDING CALLOUT HOTSPOTS
   ============================================================================ */
function findLargestClearBand(bounds, obstacles, pad = 12) {
  const { x, y, w, h } = bounds;
  // Candidate horizontal Y-intervals that don't intersect obstacles within [x, x+w]
  const cuts = new Set([y, y + h]);
  for (const ob of obstacles) {
    const ox0 = ob.x - pad, ox1 = ob.x + ob.w + pad;
    if (ox1 <= x || ox0 >= x + w) continue;
    const oy0 = Math.max(y, Math.min(y + h, ob.y - pad));
    const oy1 = Math.max(y, Math.min(y + h, ob.y + ob.h + pad));
    cuts.add(oy0);
    cuts.add(oy1);
  }
  const ys = Array.from(cuts).sort((a, b) => a - b);
  let best = { x, y, w, h: 0 };
  for (let i = 0; i < ys.length; i++) {
    for (let j = i + 1; j < ys.length; j++) {
      const y0 = ys[i], y1 = ys[j];
      if (y1 - y0 <= best.h) continue;
      let blocked = false;
      for (const ob of obstacles) {
        const ox0 = ob.x - pad, ox1 = ob.x + ob.w + pad;
        const oy0 = ob.y - pad, oy1 = ob.y + ob.h + pad;
        if (ox1 > x && ox0 < x + w && oy1 > y0 && oy0 < y1) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        best = { x, y: y0, w, h: y1 - y0 };
      }
    }
  }
  return best;
}

/* ============================================================================
   6. MASTER PLATE COMPOSITOR (WITH-ANCHOR & WITHOUT-ANCHOR MODES)
   ============================================================================ */
function renderPlate(runtime, key, specs, meta) {
  const { wid, sec, idxInSec, fileName } = meta;
  const bundle = runtime.buildSpreadScene(wid, sec, 0.85 + idxInSec * 0.55);
  const world = bundle ? bundle.world : { id: wid, cls: wid.startsWith("c9") ? "IX" : "X", subject: "chem", title: wid };
  const sp = bundle ? bundle.spread : { section: sec, title: fileName, titleHi: "", concept: "" };
  const subj = String(world.subject || "chem").slice(0, 4);
  const theme = subj.startsWith("bio") ? THEMES.bio : subj.startsWith("phy") ? THEMES.phy : THEMES.chem;
  const viewOv = runtime.viewOverrides[fileName];
  const displaySp = viewOv ? Object.assign({}, sp, { title: viewOv[0], titleHi: viewOv[1] }) : sp;
  const notePair = runtime.atomNotes[fileName] || null;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBackdrop(ctx, theme);

  const hasAnchor = specs.some(s => typeof s.anchor_x === "number" && typeof s.anchor_y === "number");

  if (hasAnchor) {
    // -------------------------------------------------------------------------
    // MODE A: WITH ANCHOR_X / ANCHOR_Y (70 PLATES)
    // EVLABEL renders .ev-label-chip buttons at (30,20,540,100) & (838,20,540,100)
    // and SVG leader lines down to (anchor_x, anchor_y).
    // -------------------------------------------------------------------------
    for (const s of specs) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.52)";
      ctx.strokeStyle = "rgba(13, 40, 68, 0.14)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, s.x, s.y, s.w, s.h, 14);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Center badge right in the clear gap x=588..820 between the two chips
    ctx.save();
    ctx.fillStyle = theme.badgeBg;
    roundRect(ctx, 592, 34, 224, 56, 12);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 15px ${FONT_SANS}`;
    ctx.fillText(`CLASS ${world.cls || "IX"} · § ${sp.section}`, 704, 53);
    const shortSub = fitTextLine(ctx, world.title || wid, 204, 12, 10, "600", FONT_SANS);
    ctx.font = shortSub.font;
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.fillText(shortSub.text, 704, 74);
    ctx.restore();

    // Main scientific stage y = 132 .. 684
    const stageRect = { x: 28, y: 132, w: W - 56, h: 552 };
    drawStageCard(ctx, stageRect.x, stageRect.y, stageRect.w, stageRect.h, theme);

    const drewBespoke = drawBespokeSupplement(ctx, fileName, stageRect, theme, displaySp, specs);
    if (!drewBespoke && bundle) {
      const compBioPairs = {
        "2-02-plant-animal.jpg": ["plant_cell", "animal_cell"],
        "2-03-prokaryote-eukaryote.jpg": ["microbe", "animal_cell"],
        "2-07-mitochondria-chloroplast.jpg": ["leaf", "respiration"]
      };
      if (specs.length >= 2 && Math.abs(specs[0].anchor_x - specs[1].anchor_x) >= 300) {
        const pair = compBioPairs[fileName];
        const bLeft = pair ? runtime.buildSpreadScene(wid, sec, 0.7, pair[0]) : bundle;
        const leftImg = renderThreeSceneToCanvas(bLeft, 620, 520, { azim: -0.24, pitch: 0.30 });
        const bRight = pair ? runtime.buildSpreadScene(wid, sec, 1.3, pair[1]) : bundle;
        const rightImg = renderThreeSceneToCanvas(bRight, 620, 520, { azim: 0.36, pitch: 0.36 });
        const lx = Math.max(36, Math.min(740, specs[0].anchor_x - 310));
        const rx = Math.max(660, Math.min(W - 656, specs[1].anchor_x - 310));
        ctx.drawImage(leftImg, lx, 146);
        ctx.drawImage(rightImg, rx, 146);
        // Subtle divider
        ctx.save();
        ctx.strokeStyle = "rgba(22, 62, 98, 0.15)";
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(W / 2, 152); ctx.lineTo(W / 2, 664); ctx.stroke();
        ctx.restore();
      } else {
        const avgAx = specs.reduce((a, s) => a + (s.anchor_x || W / 2), 0) / specs.length;
        const figImg = renderThreeSceneToCanvas(bundle, 960, 536, { azim: 0.20 });
        const fx = Math.max(36, Math.min(W - 996, avgAx - 480));
        ctx.drawImage(figImg, fx, 140);
      }
    }

    // Subtle concentric target halos right at (anchor_x, anchor_y)
    specs.forEach((s, i) => {
      if (typeof s.anchor_x !== "number") return;
      const col = theme.palette[i % theme.palette.length];
      ctx.save();
      const rg = ctx.createRadialGradient(s.anchor_x, s.anchor_y, 4, s.anchor_x, s.anchor_y, 34);
      rg.addColorStop(0, col + "44");
      rg.addColorStop(1, col + "00");
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(s.anchor_x, s.anchor_y, 34, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(s.anchor_x, s.anchor_y, 13, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });

    // Bottom bilingual title & formula bar y = 694 .. 752
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    roundRect(ctx, 28, 694, W - 56, 56, 10);
    ctx.fill();
    ctx.stroke();

    const fullTitle = displaySp.titleHi ? `${displaySp.title}  ·  ${displaySp.titleHi}` : displaySp.title;
    const eqStr = (sp.formula && sp.formula.eq) ? sp.formula.eq : "";
    const titleMaxW = eqStr ? W - 440 : W - 96;
    const fTitle = fitTextLine(ctx, fullTitle, titleMaxW, 20, 14, "800", FONT_SANS);
    ctx.font = fTitle.font;
    ctx.fillStyle = theme.ink;
    ctx.textBaseline = "middle";
    ctx.fillText(fTitle.text, 48, 722);

    if (eqStr) {
      const fEq = fitTextLine(ctx, eqStr, 330, 17, 12, "800", FONT_MONO);
      ctx.font = fEq.font;
      ctx.fillStyle = theme.accent;
      ctx.textAlign = "right";
      ctx.fillText(fEq.text, W - 48, 722);
    }
    ctx.restore();
  } else {
    // -------------------------------------------------------------------------
    // MODE B: WITHOUT ANCHOR_X (204 PLATES)
    // EVLABEL renders transparent .ev-label-hit outlines over (x, y, w, h).
    // We bake crisp high-contrast bilingual callout cards inside exact (x,y,w,h).
    // -------------------------------------------------------------------------
    const minSpecX = specs.length ? Math.min(...specs.map(s => s.x)) : 750;

    if (minSpecX >= 680) {
      // Split Left-3D Stage (x=24..692) + Right Schematic & Callout Stage (x=708..1384)
      const leftRect = { x: 24, y: 24, w: 668, h: H - 48 };
      drawStageCard(ctx, leftRect.x, leftRect.y, leftRect.w, leftRect.h, theme);

      // Left stage top header banner
      ctx.save();
      ctx.fillStyle = theme.badgeBg;
      roundRect(ctx, leftRect.x + 14, leftRect.y + 14, leftRect.w - 28, 52, 10);
      ctx.fill();
      const headLeft = fitTextLine(
        ctx,
        `§ ${sp.section} · ${displaySp.title}`,
        leftRect.w - 52,
        18,
        13,
        "800",
        FONT_SANS
      );
      ctx.font = headLeft.font;
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.fillText(headLeft.text, leftRect.x + 28, leftRect.y + 40);
      ctx.restore();

      let modelTargets = [];
      if (bundle) {
        const figImg = renderThreeSceneToCanvas(bundle, 644, 576, { azim: 0.22 });
        ctx.drawImage(figImg, leftRect.x + 12, leftRect.y + 74);
        modelTargets = findModelTargets(figImg, leftRect.x + 12, leftRect.y + 74, specs.length);
      }

      // Left stage bottom Hindi title / formula strip
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.strokeStyle = "rgba(22, 62, 98, 0.20)";
      ctx.lineWidth = 1.6;
      roundRect(ctx, leftRect.x + 14, leftRect.y + leftRect.h - 60, leftRect.w - 28, 46, 9);
      ctx.fill();
      ctx.stroke();
      const subLine = displaySp.titleHi
        ? `${displaySp.titleHi}${(sp.formula && sp.formula.eq) ? "   |   " + sp.formula.eq : ""}`
        : ((sp.formula && sp.formula.eq) || world.title || "");
      const fSub = fitTextLine(ctx, subLine, leftRect.w - 52, 17, 12, "700", FONT_SANS);
      ctx.font = fSub.font;
      ctx.fillStyle = theme.accent;
      ctx.textBaseline = "middle";
      ctx.fillText(fSub.text, leftRect.x + 28, leftRect.y + leftRect.h - 37);
      ctx.restore();

      // Right side: find largest clear vertical band for Concept Schematic Card
      const rightBounds = { x: 716, y: 24, w: 664, h: H - 48 };
      const clearBand = findLargestClearBand(rightBounds, specs, 14);
      drawConceptSchematicCard(ctx, clearBand, displaySp, world, theme, notePair);

      // Leader lines from each callout card onto real rendered 3D geometry targets (zero text crossings!)
      specs.forEach((s, i) => {
        const col = theme.palette[i % theme.palette.length];
        const [targetX, targetY] = modelTargets[i] || [leftRect.x + leftRect.w * 0.56, leftRect.y + 220 + i * 120];
        const hasLeftNeighbor = specs.some((o, j) => j !== i && o.x + o.w <= s.x + 10 && Math.abs(o.y - s.y) < 50);
        if (hasLeftNeighbor || s.x >= 980) {
          // Route cleanly via top or bottom margin channel so we NEVER cross adjacent cards or schematic text
          const topRoute = s.y < H * 0.45;
          const fromX = s.x + Math.min(60, s.w * 0.25);
          const fromY = topRoute ? s.y : s.y + s.h;
          const chanY = topRoute ? 13 : H - 13;
          drawLeaderCurve(ctx, fromX, fromY, targetX, targetY, col, chanY);
        } else {
          drawLeaderCurve(ctx, s.x, s.y + s.h / 2, targetX, targetY, col, null);
        }
      });
    } else {
      // Full-width composition (callouts span top/bottom/columns)
      const fullBounds = { x: 28, y: 24, w: W - 56, h: H - 48 };
      const clearBand = findLargestClearBand(fullBounds, specs, 14);
      const stageRect = clearBand.h >= 220 ? clearBand : { x: 48, y: 150, w: W - 96, h: 468 };
      drawStageCard(ctx, stageRect.x, stageRect.y, stageRect.w, stageRect.h, theme);

      const drewBespoke = drawBespokeSupplement(ctx, fileName, stageRect, theme, displaySp, specs);
      let fullTargets = null;
      if (fileName === "8-10-methane-valency.jpg" || fileName === "8-10-water-supplement.jpg") {
        const scx = stageRect.x + stageRect.w / 2, scy = stageRect.y + stageRect.h / 2;
        const isM = fileName.includes("methane");
        fullTargets = isM
          ? [[scx - 18, scy - 18], [scx + 138, scy], [scx - 86, scy], [scx + 76, scy + 76]]
          : [[scx - 18, scy - 18], [scx + 128, scy + 68], [scx - 80, scy + 42], [scx + 76, scy + 76]];
      } else if (fileName === "8-05-rutherford-scattering.jpg") {
        const scx = stageRect.x + stageRect.w / 2, scy = stageRect.y + stageRect.h / 2;
        fullTargets = [[stageRect.x + 100, scy - 38], [scx + 80, scy - 80], [scx + 225, scy - 110]];
      }
      if (!drewBespoke && bundle) {
        const figW = Math.min(760, Math.floor(stageRect.w * 0.56));
        const figImg = renderThreeSceneToCanvas(bundle, figW, stageRect.h - 16, { azim: 0.24 });
        ctx.drawImage(figImg, stageRect.x + 12, stageRect.y + 8);
        fullTargets = findModelTargets(figImg, stageRect.x + 12, stageRect.y + 8, specs.length);
        const cardRect = {
          x: stageRect.x + figW + 24,
          y: stageRect.y + 18,
          w: stageRect.w - figW - 40,
          h: stageRect.h - 36
        };
        drawConceptSchematicCard(ctx, cardRect, displaySp, world, theme, notePair);
      }

      specs.forEach((s, i) => {
        const col = theme.palette[i % theme.palette.length];
        const cxCard = s.x + s.w / 2;
        const cyCard = s.y < H / 2 ? s.y + s.h : s.y;
        const [tx, ty] = (fullTargets && fullTargets[i])
          ? fullTargets[i]
          : [Math.max(stageRect.x + 80, Math.min(stageRect.x + stageRect.w - 80, cxCard)), stageRect.y + stageRect.h * (s.y < H / 2 ? 0.36 : 0.66)];
        drawLeaderCurve(ctx, cxCard, cyCard, tx, ty, col);
      });
    }

    // Finally render every bilingual callout card inside its exact (x, y, w, h) box
    specs.forEach((s, i) => drawCalloutCard(ctx, s, i, theme));
  }

  return canvas.toBuffer("image/jpeg", JPEG_QUALITY);
}

/* ============================================================================
   7. CLI ENTRY POINT
   ============================================================================ */
function main() {
  const args = process.argv.slice(2);
  let onlySet = null;
  const onlyIdx = args.indexOf("--only");
  if (onlyIdx >= 0 && args[onlyIdx + 1]) {
    onlySet = new Set(args[onlyIdx + 1].split(",").map(s => s.trim()).filter(Boolean));
  }

  const t0 = Date.now();
  const runtime = createEduVerseRuntime();
  const labelData = JSON.parse(fs.readFileSync(path.join(ROOT, "src/label_data.json"), "utf8"));

  // Map every asset key "<wid>/<file>" -> { wid, sec, idxInSec, fileName }
  const keyToMeta = new Map();
  for (const [wid, secMap] of Object.entries(runtime.rasterAssets)) {
    for (const [sec, files] of Object.entries(secMap)) {
      const arr = Array.isArray(files) ? files : [files];
      arr.forEach((fileName, idxInSec) => {
        keyToMeta.set(`${wid}/${fileName}`, { wid, sec, idxInSec, fileName });
      });
    }
  }

  // Ensure any key in label_data.json is covered
  for (const key of Object.keys(labelData)) {
    if (!keyToMeta.has(key)) {
      const [wid, fileName] = key.split("/");
      keyToMeta.set(key, { wid, sec: "1", idxInSec: 0, fileName });
    }
  }

  /* GUARD: never overwrite an authored/realistic plate. A file whose SHA-256
     matches DRAFT_MANIFEST.json (the reviewed realistic originals) is kept
     unless --force is passed explicitly. */
  const protectedHashes = new Set();
  try {
    const man = JSON.parse(fs.readFileSync(path.join(ROOT, "DRAFT_MANIFEST.json"), "utf8"));
    for (const r of man.records || []) {
      if (r.sha256) protectedHashes.add(r.sha256);
      for (const s of r.supplements || []) if (s && s.sha256) protectedHashes.add(s.sha256);
    }
  } catch (_e) {}
  const force = process.argv.includes("--force");
  const isProtected = outPath => {
    if (force || !fs.existsSync(outPath)) return false;
    const h = crypto.createHash("sha256").update(fs.readFileSync(outPath)).digest("hex");
    return protectedHashes.has(h);
  };
  let skipped = 0;

  const keys = Array.from(keyToMeta.keys()).filter(k => !onlySet || onlySet.has(k));
  let totalBytes = 0;
  let builtCount = 0;

  for (const key of keys) {
    const meta = keyToMeta.get(key);
    const specs = labelData[key] || [];
    const outPath = path.join(ROOT, "assets/2d", key);
    if (isProtected(outPath)) { skipped++; continue; }
    const buf = renderPlate(runtime, key, specs, meta);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    totalBytes += buf.length;
    builtCount++;
    if (builtCount % 25 === 0 || builtCount === keys.length) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`[${builtCount}/${keys.length}] built${skipped ? ` · ${skipped} protected originals kept` : ""} (${(totalBytes / 1048576).toFixed(2)} MiB, ${elapsed}s) — latest: ${key}`);
    }
  }
}

main();
