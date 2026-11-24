/* ==========================================================================
   EduVerse — NCERT Class X · Chapter 9 "Light – Reflection and Refraction"
   A REUSABLE ray-optics figure engine, in the spirit of nathanliow/atlas-of-physics
   and saxster/atlas: ONE small vocabulary (axis · ray · mirror arc · lens ·
   object/image arrow · normal · focus marker · standing graph) generates seven
   registered scene blocks. Every number comes from a pure model() function;
   the 3D figure, precision-2D panel, live readouts, challenge and quiz all read
   that same state. No apparatus — only the ray diagram, its vectors and graph.
   ========================================================================== */

const LIGHT_TYPES = ["reflection", "mirror", "mirrorformula", "slab", "lens", "lensformula", "lenspower"];

const O3G = (function () {
  const Y = 0.17, K = 0.035;              /* ray plane, cm → world units */
  function seg(g, color, r) {
    return G3.mesh(g, new THREE.CylinderGeometry(r || 0.013, r || 0.013, 1, 8),
      new THREE.MeshBasicMaterial({ color: color === undefined ? 0xffc46b : color }), [0, Y, 0]);
  }
  function set(m, A, B) {
    const a = new THREE.Vector3(A[0], Y, A[1]), b = new THREE.Vector3(B[0], Y, B[1]);
    const d = b.clone().sub(a), len = Math.max(0.001, d.length());
    m.position.copy(a.clone().add(b).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    m.scale.set(1, len, 1);
  }
  function arrow(g, color) {
    const grp = new THREE.Group(); g.add(grp);
    const shaft = G3.mesh(grp, new THREE.CylinderGeometry(0.024, 0.024, 1, 8),
      new THREE.MeshBasicMaterial({ color: color }), [0, Y, 0]);
    const head = G3.mesh(grp, new THREE.ConeGeometry(0.078, 0.17, 10),
      new THREE.MeshBasicMaterial({ color: color }), [0, Y, 0]);
    return { grp: grp, shaft: shaft, head: head };
  }
  function setArrow(a, x, h) {
    const sign = h >= 0 ? 1 : -1, ah = Math.max(0.03, Math.abs(h));
    a.grp.position.set(x, 0, 0);
    a.shaft.rotation.set(Math.PI / 2, 0, 0);
    a.shaft.scale.set(1, ah, 1);
    a.shaft.position.set(0, Y, -sign * ah / 2);
    a.head.rotation.set(sign > 0 ? -Math.PI / 2 : Math.PI / 2, 0, 0);
    a.head.position.set(0, Y, -sign * (ah + 0.05));
  }
  function arc(g, concave) {
    const grp = new THREE.Group(); g.add(grp);
    const pts = [];
    for (let i = 0; i <= 22; i++) {
      const t = -0.52 + 1.04 * i / 22;
      pts.push([(concave ? -1 : 1) * (1 - Math.cos(t)), Y, Math.sin(t)]);
    }
    G3.tube(grp, pts, 0.032, 0x9fb9cf, { seg: 30, rad: 6 });
    return grp;
  }
  function lens(g, convex) {
    const m = G3.mesh(g, new THREE.SphereGeometry(0.78, 24, 16),
      new THREE.MeshStandardMaterial({ color: convex ? 0x8fd3f4 : 0xcbb6e8, transparent: true, opacity: 0.62, roughness: 0.18, metalness: 0.05 }),
      [0, Y, 0]);
    m.scale.set(convex ? 0.23 : 0.13, 0.28, 1);
    return m;
  }
  function marker(g, color) {
    return G3.ball(g, 0.055, color, [0, Y, 0], { emissive: color, glow: 1.1, seg: 12 });
  }
  return { Y: Y, K: K, seg: seg, set: set, arrow: arrow, setArrow: setArrow, arc: arc, lens: lens, marker: marker };
})();

/* --------------------------------------------------------------------------
   Pure physics. New Cartesian sign convention, exactly as NCERT Ch 9:
   mirror  1/v + 1/u = 1/f ,  m = −v/u
   lens    1/v − 1/u = 1/f ,  m =  v/u
   object always left, so u = −|u|. f < 0 for concave mirror / concave lens.
   -------------------------------------------------------------------------- */
function opticsModel(p, cfg) {
  const uMag = clamp(Number(p.u || 25), 6, 60), fMag = clamp(Number(p.f || 15), 8, 30);
  const u = -uMag;
  const convex = cfg.kind === "mirror" ? (Number(p.kind || 0) >= 0.5) : (Number(p.kind || 0) < 0.5);
  const f = cfg.kind === "mirror" ? (convex ? fMag : -fMag) : (convex ? fMag : -fMag);
  const inv = cfg.kind === "mirror" ? (1 / f - 1 / u) : (1 / f + 1 / u);
  const v = Math.abs(inv) < 1e-6 ? 9999 : 1 / inv;
  const m = cfg.kind === "mirror" ? -v / u : v / u;
  const real = cfg.kind === "mirror" ? v < 0 : v > 0;
  const erect = m > 0;
  const nature = (real ? "real" : "virtual") + ", " + (erect ? "erect" : "inverted");
  const region = uMag > 2 * fMag + 2 ? "beyond C" : Math.abs(uMag - 2 * fMag) <= 2 ? "at C" : uMag > fMag ? "between C and F" : "between P and F";
  const P = 100 / f;
  return {
    u: u, uMag: uMag, f: +f.toFixed(1), fMag: fMag, v: +v.toFixed(1), m: +m.toFixed(2),
    real: real, virtual: !real, erect: erect, nature: nature, region: region,
    convex: convex, power: +P.toFixed(2), dioptre: +P.toFixed(2),
    readouts: [
      ro("Object distance u", u, "cm", clamp(uMag / 60 * 100, 0, 100)),
      ro("Focal length f", +f.toFixed(1), "cm", clamp(fMag / 30 * 100, 0, 100)),
      ro("Image distance v", +v.toFixed(1), "cm", clamp(Math.abs(v) / 60 * 100, 0, 100)),
      ro("Magnification m", +m.toFixed(2), nature, clamp(Math.abs(m) * 45, 0, 100))
    ]
  };
}
function reflectionModel(p) {
  const i = clamp(Math.round(Number(p.i || 30)), 0, 75);
  const d = clamp(Math.round(Number(p.d || 20)), 5, 30);
  return {
    i: i, r: i, d: d, law: "∠i = ∠r", image: "virtual, erect, same size",
    virtual: true, lateral: "laterally inverted",
    readouts: [
      ro("Angle of incidence i", i, "°", i / 75 * 100),
      ro("Angle of reflection r", i, "°", i / 75 * 100),
      ro("Object = image distance", d, "cm", d / 30 * 100),
      ro("Size ratio", "+1", "m", 50)
    ]
  };
}
function slabModel(p) {
  const i = clamp(Number(p.i || 35), 0, 75), n = clamp(Number(p.n || 1.5), 1, 2.2);
  const r = Math.asin(Math.min(0.999, Math.sin(i * Math.PI / 180) / n)) * 180 / Math.PI;
  const shift = +(1.1 * Math.sin((i - r) * Math.PI / 180) / Math.max(0.2, Math.cos(r * Math.PI / 180))).toFixed(2);
  const bend = i < 1 ? "no bending · normal incidence" : n > 1 ? "towards the normal" : "away from the normal";
  return {
    i: +i.toFixed(1), n: +n.toFixed(2), r: +r.toFixed(1), shift: shift,
    parallel: "yes", bend: bend, speed: +(3e8 / n / 1e8).toFixed(2),
    readouts: [
      ro("Incidence angle i", +i.toFixed(1), "°", i / 75 * 100),
      ro("Refractive index n", +n.toFixed(2), "", (n - 1) / 1.2 * 100),
      ro("Refraction angle r", +r.toFixed(1), "°", r / 75 * 100),
      ro("Speed in medium", +(3e8 / n / 1e8).toFixed(2), "×10⁸ m/s", 100 / n)
    ]
  };
}
function powerModel(p) {
  const f1 = clamp(Number(p.f1 || 50), 10, 200), f2 = clamp(Number(p.f2 || 50), -200, 200);
  const p1 = 100 / f1, p2 = 100 / (f2 === 0 ? 200 : f2), P = p1 + p2;
  const fEq = Math.abs(P) < 0.01 ? Infinity : 100 / P;
  return {
    f1: f1, f2: f2, p1: +p1.toFixed(2), p2: +p2.toFixed(2),
    power: +P.toFixed(2), dioptre: +P.toFixed(2), fEq: isFinite(fEq) ? +fEq.toFixed(1) : "∞",
    type: P > 0 ? "converging (convex)" : "diverging (concave)",
    readouts: [
      ro("Lens 1 power", +p1.toFixed(2), "D", clamp(Math.abs(p1) * 25, 0, 100)),
      ro("Lens 2 power", +p2.toFixed(2), "D", clamp(Math.abs(p2) * 25, 0, 100)),
      ro("Net power P", +P.toFixed(2), "D", clamp(Math.abs(P) * 25, 0, 100)),
      ro("Equivalent f", isFinite(fEq) ? +fEq.toFixed(1) : "∞", "cm", clamp(Math.abs(P) * 20, 0, 100))
    ]
  };
}
function graphModel(p, cfg) {
  const m = opticsModel(p, cfg);
  m.invU = +(-1 / p.u).toFixed(3);
  m.invV = +(1 / m.v).toFixed(3);
  m.equation = cfg.kind === "mirror" ? "1/v + 1/u = 1/f" : "1/v − 1/u = 1/f";
  return m;
}

/* --------------------------------------------------------------------------
   One builder, seven figures. Everything is drawn in the horizontal X–Z plane
   so the straight projector (top-down) view reads it as a printed ray diagram.
   -------------------------------------------------------------------------- */
function buildOptics(g, sp, ctx, cfg) {
  C3.plate(g, cfg.title);
  const mode = cfg.mode;
  const axis = O3G.seg(g, 0x8b7a5a, 0.011);
  const rays = [], normals = [], slabs = [], curves = [];
  for (let i = 0; i < 8; i++) rays.push(O3G.seg(g, i % 2 ? 0x7fd3ff : 0xffc46b));
  for (let i = 0; i < 2; i++) normals.push(O3G.seg(g, 0x9fb9cf, 0.008));
  for (let i = 0; i < 4; i++) slabs.push(O3G.seg(g, 0x7fb6d6, 0.02));
  for (let i = 0; i < 7; i++) curves.push(O3G.seg(g, 0x6fd3ff, 0.02));
  const obj = O3G.arrow(g, 0xffd166), img = O3G.arrow(g, 0x7ee0b8);
  const arcC = O3G.arc(g, true), arcV = O3G.arc(g, false);
  const lensC = O3G.lens(g, true), lensV = O3G.lens(g, false);
  const lens2 = O3G.lens(g, true);
  const F = O3G.marker(g, 0xffc46b), C = O3G.marker(g, 0x4ad6ff), P2 = O3G.marker(g, 0x7ee0b8);
  const dot = O3G.marker(g, 0xffffff);
  const title = C3.dynamicTag(g, 2.75, 0.4, [0, 1.36, -0.42], 42);
  const note = G3.tag(g, cfg.note, 2.55, 0.6,
    { pos: [0, 0.12, 0.96], rot: [-Math.PI / 2, 0, 0], size: 27, bg: "#e8e0cb" });
  const handles = cfg.controls.map((c, i) => C3.railHandle(g, ctx, c.id, i,
    [0x4ad6ff, 0xffc46b, 0x7ee0b8][i % 3], c.min, c.max, c.value));

  function hide(a) { a.forEach(m => { m.visible = false; }); }
  function show(a) { a.forEach(m => { m.visible = true; }); }
  function update(m) {
    /* defaults: hide everything, then reveal what this figure needs */
    hide(rays); hide(normals); hide(slabs); hide(curves);
    obj.grp.visible = false; img.grp.visible = false;
    arcC.visible = false; arcV.visible = false;
    lensC.visible = false; lensV.visible = false; lens2.visible = false;
    F.visible = false; C.visible = false; P2.visible = false; dot.visible = false;
    O3G.set(axis, [-1.55, 0], [1.55, 0]);
    axis.visible = mode !== "power";

    if (mode === "plane") {
      const xP = 0.3, off = m.d * 0.045, xObj = xP - off, xImg = xP + off;
      const zStart = clamp(Math.tan(m.i * Math.PI / 180) * off, -1.05, 1.05);
      O3G.set(rays[0], [xObj, zStart], [xP, 0]);
      O3G.set(rays[1], [xP, 0], [xObj, -zStart]);
      O3G.set(rays[2], [xP, -1.05], [xP, 1.05]);
      O3G.set(normals[0], [xObj - 0.2, 0], [xImg + 0.2, 0]);
      show([rays[0], rays[1], rays[2], normals[0]]);
      O3G.setArrow(obj, xObj, 0.72); O3G.setArrow(img, xImg, 0.72);
      obj.grp.visible = true; img.grp.visible = true;
      title.userData.setText("i = " + m.i + "°  ·  r = " + m.r + "°  ·  u = v = " + m.d + " cm");
    } else if (mode === "slab") {
      O3G.set(slabs[0], [-0.55, -0.8], [0.55, -0.8]);
      O3G.set(slabs[1], [0.55, -0.8], [0.55, 0.8]);
      O3G.set(slabs[2], [0.55, 0.8], [-0.55, 0.8]);
      O3G.set(slabs[3], [-0.55, 0.8], [-0.55, -0.8]);
      const ti = Math.tan(m.i * Math.PI / 180), tr = Math.tan(m.r * Math.PI / 180);
      const zIn = 0.55, zEnd = zIn - tr * 1.1;
      O3G.set(rays[0], [-1.45, zIn + ti * 0.9], [-0.55, zIn]);
      O3G.set(rays[1], [-0.55, zIn], [0.55, zEnd]);
      O3G.set(rays[2], [0.55, zEnd], [1.45, zEnd - ti * 0.9]);
      O3G.set(normals[0], [-1.15, zIn], [0.1, zIn]);
      O3G.set(normals[1], [0.1, zEnd], [1.2, zEnd]);
      show(slabs); show([rays[0], rays[1], rays[2], normals[0], normals[1]]);
      title.userData.setText("n = " + m.n + "  ·  i = " + m.i + "°  →  r = " + m.r + "°");
    } else if (mode === "power") {
      lensC.visible = true; lensC.position.set(-0.65, O3G.Y, 0);
      lens2.visible = true; lens2.position.set(0.65, O3G.Y, 0);
      lens2.material.color.setHex(m.p2 < 0 ? 0xcbb6e8 : 0x8fd3f4);
      O3G.set(rays[0], [-1.5, 0], [1.5, 0]); rays[0].visible = true;
      title.userData.setText("P₁ " + m.p1 + " D  +  P₂ " + m.p2 + " D  =  " + m.power + " D");
    } else if (mode === "graph") {
      O3G.set(rays[0], [-1.35, 0.78], [-1.35, -0.78]);
      O3G.set(rays[1], [-1.35, -0.78], [1.35, -0.78]);
      show([rays[0], rays[1]]);
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const uu = 8 + i * 7, ff = m.f, uuS = -uu;
        const inv = cfg.kind === "mirror" ? (1 / ff - 1 / uuS) : (1 / ff + 1 / uuS);
        const vv = Math.abs(inv) < 1e-6 ? 999 : 1 / inv;
        pts.push([-1.3 + 2.6 * i / 7, clamp(0.72 - Math.abs(vv) / 60 * 1.3, -0.72, 0.72)]);
      }
      for (let i = 0; i < 7; i++) { O3G.set(curves[i], pts[i], pts[i + 1]); curves[i].visible = true; }
      dot.visible = true; dot.position.set(clamp(-1.3 + 2.6 * (m.uMag - 8) / 49, -1.3, 1.3), O3G.Y, clamp(0.72 - Math.abs(m.v) / 60 * 1.3, -0.72, 0.72));
      title.userData.setText(m.equation + "  ·  v = " + m.v + " cm  ·  m = " + m.m);
    } else {
      /* mirror or lens ray diagram */
      const xO = cfg.kind === "mirror" ? 1.15 : 0;
      const xObj = xO - m.uMag * O3G.K;
      const xF = xO + m.f * O3G.K, xC = xO + 2 * m.f * O3G.K;
      const xImg = xO + m.v * O3G.K;
      const h = 0.72, hImg = 0.72 * m.m;
      O3G.setArrow(obj, xObj, h); O3G.setArrow(img, xImg, hImg);
      obj.grp.visible = true; img.grp.visible = true;
      F.visible = true; F.position.set(xF, O3G.Y, 0);
      C.visible = true; C.position.set(xC, O3G.Y, 0);
      P2.visible = true; P2.position.set(xO, O3G.Y, 0);
      if (cfg.kind === "mirror") {
        const R = Math.abs(2 * m.f * O3G.K);
        const a = m.convex ? arcV : arcC;
        a.visible = true; a.position.set(xO, 0, 0); a.scale.set(R, 1, R);
      } else {
        const L = m.convex ? lensC : lensV;
        L.visible = true; L.position.set(xO, O3G.Y, 0);
      }
      O3G.set(rays[0], [xObj, -h], [xO, -h]);
      O3G.set(rays[1], [xO, -h], [xImg, -hImg]);
      O3G.set(rays[2], [xObj, -h], [xO, 0]);
      O3G.set(rays[3], [xO, 0], [xImg, -hImg]);
      O3G.set(rays[4], [xObj, -h], [xO, 0.42]);
      O3G.set(rays[5], [xO, 0.42], [xImg, -hImg]);
      show([rays[0], rays[1], rays[2], rays[3], rays[4], rays[5]]);
      for (let i = 0; i < 6; i++) rays[i].material.color.setHex(m.real ? 0xffc46b : 0x9fd8ff);
      img.shaft.material.color.setHex(m.real ? 0x7ee0b8 : 0xffb35c);
      img.head.material.color.setHex(m.real ? 0x7ee0b8 : 0xffb35c);
      title.userData.setText("u = " + m.u + "  f = " + m.f + "  v = " + m.v + "  m = " + m.m);
    }
  }
  const targets = [obj.shaft, obj.head, img.shaft, img.head, axis, lensC, lensV, lens2, F, C, P2, dot, note]
    .concat(rays, normals, slabs, curves)
    .map((mesh, i) => ({ id: cfg.mode + "-" + i, mesh: mesh }));
  return C3.finish(handles, targets, null, (m, dt, time) => update(m));
}

/* --------------------------------------------------------------------------
   Seven registered blocks. Each is a thin config over the SAME figure engine —
   this is the "one figure engine for every topic" pattern from saxster/atlas.
   -------------------------------------------------------------------------- */
function LIGHT(cfg) {
  return {
    label: cfg.label, icon: cfg.icon, controls: cfg.controls,
    model(p) {
      if (cfg.mode === "plane") return reflectionModel(p);
      if (cfg.mode === "slab") return slabModel(p);
      if (cfg.mode === "power") return powerModel(p);
      if (cfg.mode === "graph") return graphModel(p, cfg);
      return opticsModel(p, cfg);
    },
    build(g, sp, ctx) { return buildOptics(g, sp, ctx, cfg); }
  };
}
const U = { id: "u", label: "Object distance |u|", min: 6, max: 60, value: 25, unit: "cm" };
const F = { id: "f", label: "Focal length |f|", min: 8, max: 30, value: 15, unit: "cm" };
const KIND = { id: "kind", label: "Surface (0 = concave, 1 = convex)", min: 0, max: 1, value: 0, unit: "" };
const LIGHT_BLOCKS = {
  reflection: LIGHT({
    mode: "plane", kind: "mirror", icon: "◑", label: "Laws of reflection · plane mirror",
    title: "9.1 · LAWS OF REFLECTION", note: "∠i = ∠r  ·  incident ray, normal and reflected ray lie in one plane",
    controls: [
      { id: "i", label: "Angle of incidence i", min: 0, max: 75, value: 35, unit: "°" },
      { id: "d", label: "Object distance from mirror", min: 5, max: 30, value: 20, unit: "cm" }
    ]
  }),
  mirror: LIGHT({
    mode: "optic", kind: "mirror", icon: "◐", label: "Spherical mirror · image formation",
    title: "9.2 · SPHERICAL MIRROR", note: "R = 2f  ·  ray parallel to axis → focus  ·  ray through C returns",
    controls: [U, F, KIND]
  }),
  mirrorformula: LIGHT({
    mode: "graph", kind: "mirror", icon: "∫", label: "Mirror formula & magnification",
    title: "9.2.4 · MIRROR FORMULA", note: "1/v + 1/u = 1/f   ·   m = −v/u   ·   R = 2f",
    controls: [U, F, KIND]
  }),
  slab: LIGHT({
    mode: "slab", kind: "lens", icon: "▭", label: "Refraction · rectangular glass slab",
    title: "9.3.1 · GLASS SLAB", note: "n₁ sin i = n₂ sin r  ·  emergent ray ∥ incident ray  ·  lateral shift",
    controls: [
      { id: "i", label: "Angle of incidence i", min: 0, max: 75, value: 35, unit: "°" },
      { id: "n", label: "Refractive index of glass", min: 1, max: 2.2, value: 1.5, unit: "" }
    ]
  }),
  lens: LIGHT({
    mode: "optic", kind: "lens", icon: "◍", label: "Spherical lens · image formation",
    title: "9.3.3 · SPHERICAL LENS", note: "ray ∥ axis → focus  ·  ray through optical centre goes straight",
    controls: [U, F, KIND]
  }),
  lensformula: LIGHT({
    mode: "graph", kind: "lens", icon: "∑", label: "Lens formula & magnification",
    title: "9.3.7 · LENS FORMULA", note: "1/v − 1/u = 1/f   ·   m = v/u   ·   P = 1/f(m)",
    controls: [U, F, KIND]
  }),
  lenspower: LIGHT({
    mode: "power", kind: "lens", icon: "D", label: "Power of a lens · dioptre",
    title: "9.3.8 · POWER OF A LENS", note: "P = 1/f (metre)  ·  P = P₁ + P₂ + ⋯  ·  unit: dioptre (D)",
    controls: [
      { id: "f1", label: "Lens 1 focal length", min: 10, max: 200, value: 50, unit: "cm" },
      { id: "f2", label: "Lens 2 focal length (+/−)", min: -200, max: 200, value: 50, unit: "cm" }
    ]
  })
};
Object.assign(BLOCKS, LIGHT_BLOCKS);

/* ==========================================================================
   MASTER ENGINE / PROMPT 3 — CANONICAL O3 LIGHT GRAMMAR
   --------------------------------------------------------------------------
   The seven shipped LIGHT_BLOCKS above are preserved verbatim (their private
   drawing helper is now O3G). This is the NEW public vocabulary required by
   step 3: O3.axis / O3.ray / O3.mirror / O3.lens / O3.arrow, plus four PURE,
   JSON-only parametric models raymirror / raylens / rayslab / raygraph.

   All distances use the NCERT New Cartesian sign convention. The object is
   always on the left, so u = −|u|. The mirror equation is literally
   1/v + 1/u = 1/f; the lens equation is 1/v − 1/u = 1/f. No THREE, no DOM,
   no renderer and no mutable scene state lives in this module: model() returns
   declarative parts + dynamic segments, and EVENGINE routes those segments.

   Copyright / Developer : Paras Pranav
   ========================================================================== */
const O3 = (function () {
  'use strict';
  const VERSION = '3.0.0';
  const CREDIT = 'Copyright / Developer : Paras Pranav';
  const SCHEMA = 'eduverse.o3-light/v1';
  const GRAMMAR = ['axis', 'ray', 'mirror', 'lens', 'arrow'];
  const MODELS = ['raymirror', 'raylens', 'rayslab', 'raygraph'];
  const FORMULAS = Object.freeze({
    cartesian: 'New Cartesian sign convention · pole/optical centre is origin · object on the left gives u < 0',
    mirror: '1/v + 1/u = 1/f',
    mirrorMagnification: 'm = −v/u = h′/h',
    lens: '1/v − 1/u = 1/f',
    lensMagnification: 'm = v/u = h′/h',
    radius: 'R = 2f',
    power: 'P = 1/f(m) = 100/f(cm) · 1 D = 1 m⁻¹',
    powerSum: 'P = P₁ + P₂ + ⋯',
    reflection: '∠i = ∠r',
    snell: 'n₁ sin i = n₂ sin r',
    slab: 'emergent ray ∥ incident ray · lateral shift'
  });
  const SIGNS = Object.freeze({
    object: 'u = −|u| (object left of pole / optical centre)',
    concaveMirror: 'f < 0, R < 0', convexMirror: 'f > 0, R > 0',
    convexLens: 'f > 0, P > 0', concaveLens: 'f < 0, P < 0',
    realMirrorImage: 'v < 0, m < 0', realLensImage: 'v > 0, m < 0',
    virtualErect: 'm > 0'
  });
  const K = 0.035;       /* cm -> world X */
  const H = 0.72;        /* canonical object-arrow height */
  const X = 2.35;        /* principal-axis half span */
  const C = Object.freeze({
    axis: 0x8b7a5a, ray: 0xffc46b, rayVirtual: 0x9fd8ff, rayGreen: 0x7ee0b8,
    object: 0xffd166, image: 0x7ee0b8, focus: 0xffc46b, center: 0x4ad6ff,
    pole: 0xffffff, mirror: 0x9fb9cf, lensConvex: 0x8fd3f4, lensConcave: 0xcbb6e8,
    slab: 0x7fb6d6, graph: 0x0b6b43, dot: 0xff9b8a, normal: 0x9fb9cf
  });
  const n = (v, d) => (typeof v === 'number' && isFinite(v)) ? v : d;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (v, d) => { const p = Math.pow(10, d === undefined ? 2 : d); return Math.round(v * p) / p; };
  const finite = (v, d) => { const q = Number(v); return isFinite(q) ? q : d; };
  const deg = d => d * Math.PI / 180;
  const safeInv = x => Math.abs(x) < 1e-6 ? (x < 0 ? -1e-6 : 1e-6) : x;
  const vFrom = inv => 1 / safeInv(inv);
  const mirrorV = (f, u) => vFrom(1 / f - 1 / u);
  const lensV = (f, u) => vFrom(1 / f + 1 / u);
  const readout = (label, value, unit, pct) => ({ label: label, value: value, unit: unit, pct: cl(Number(pct) || 0, 2, 100) });
  const bi = (en, hi) => ({ en: en, hi: hi });
  const text = (pair, lang) => lang === 'hi' ? pair.hi : lang === 'both' ? pair.en + ' / ' + pair.hi : pair.en;

  /* ----------------------------------------------------- exact five grammar */
  function axis(o) {
    o = o || {};
    const half = cl(n(o.half, X), 1, 3.2), y = n(o.y, 0), z = n(o.z, 0);
    return {
      id: o.id || 'axis', kind: 'axis', shape: 'line',
      label_en: o.label_en || 'Principal axis', label_hi: o.label_hi || 'मुख्य अक्ष',
      points: [[-half, y, z], [half, y, z]], color: n(o.color, C.axis),
      grammar: 'axis', formula: 'y = 0', visible: true
    };
  }
  function mirror(o) {
    o = o || {};
    const id = o.id || 'mirror';
    const surface = o.surface || (n(o.kind, 0) >= 0.5 ? 'convex' : 'concave');
    if (surface === 'plane') {
      const d = cl(n(o.d, 20), 5, 30), i = cl(n(o.i, 35), 0, 75);
      return {
        id: id, grammar: 'mirror', surface: 'plane', u: -d, v: d, uMag: d,
        f: '∞', R: '∞', fMag: 0, m: 1, real: false, erect: true,
        nature: 'virtual, erect, same size', equation: FORMULAS.reflection,
        i: i, r: i, d: d,
        part: {
          id: id, kind: 'mirror', shape: 'line',
          label_en: 'Plane mirror', label_hi: 'समतल दर्पण',
          points: [[0.35, -1.05, 0], [0.35, 1.05, 0]], color: C.mirror,
          grammar: 'mirror', visible: false
        }
      };
    }
    const uMag = cl(n(o.u, 25), 6, 60), fMag = cl(n(o.f, 15), 8, 30);
    const u = -uMag, f = surface === 'convex' ? fMag : -fMag, R = 2 * f;
    const v = mirrorV(f, u), m = -v / u, real = v < 0, erect = m > 0;
    return {
      id: id, grammar: 'mirror', surface: surface, u: u, uMag: uMag,
      f: f, fMag: fMag, R: R, v: v, m: m, real: real, erect: erect,
      nature: (real ? 'real' : 'virtual') + ', ' + (erect ? 'erect' : 'inverted'),
      equation: FORMULAS.mirror, xF: f * K, xC: R * K,
      part: {
        id: id, kind: 'mirror', shape: 'torus',
        label_en: surface === 'convex' ? 'Convex mirror' : 'Concave mirror',
        label_hi: surface === 'convex' ? 'उत्तल दर्पण' : 'अवतल दर्पण',
        radius: 1.0, tube: 0.055, arc: Math.PI * 1.15,
        rotation: [0, 0, surface === 'convex' ? Math.PI * 0.575 : -Math.PI * 0.575],
        position: [0, 0, 0], color: C.mirror, opacity: 0.92,
        grammar: 'mirror', visible: false
      }
    };
  }
  function lens(o) {
    o = o || {};
    const id = o.id || 'lens';
    /* shipped slider semantics: kind 0 = convex/converging, 1 = concave/diverging */
    const surface = o.surface || (n(o.kind, 0) < 0.5 ? 'convex' : 'concave');
    const uMag = cl(n(o.u, 25), 6, 60), fMag = cl(n(o.f, 15), 8, 30);
    const u = -uMag, f = surface === 'convex' ? fMag : -fMag;
    const v = lensV(f, u), m = v / u, real = v > 0, erect = m > 0;
    const profile = surface === 'convex'
      ? [[0, -0.78], [0.17, -0.52], [0.24, 0], [0.17, 0.52], [0, 0.78]]
      : [[0.09, -0.78], [0.15, -0.52], [0.055, 0], [0.15, 0.52], [0.09, 0.78]];
    return {
      id: id, grammar: 'lens', surface: surface, u: u, uMag: uMag,
      f: f, fMag: fMag, v: v, m: m, real: real, erect: erect,
      nature: (real ? 'real' : 'virtual') + ', ' + (erect ? 'erect' : 'inverted'),
      power: 100 / f, equation: FORMULAS.lens, xF: f * K, xC: 2 * f * K,
      part: {
        id: id, kind: 'lens', shape: 'lathe', profile: profile,
        label_en: surface === 'convex' ? 'Convex lens' : 'Concave lens',
        label_hi: surface === 'convex' ? 'उत्तल लेंस' : 'अवतल लेंस',
        rotation: [0, 0, Math.PI / 2], position: [0, 0, 0],
        color: surface === 'convex' ? C.lensConvex : C.lensConcave,
        opacity: 0.68, transparent: true, grammar: 'lens', visible: false
      }
    };
  }
  function arrow(o) {
    o = o || {};
    const id = o.id || 'arrow', x = n(o.x, 0), h = n(o.height, H), z = n(o.z, 0);
    const kind = o.kind || 'objectArrow';
    return {
      id: id, kind: kind, shape: 'arrow',
      label_en: o.label_en || (kind === 'imageArrow' ? 'Image' : 'Object'),
      label_hi: o.label_hi || (kind === 'imageArrow' ? 'प्रतिबिम्ब' : 'वस्तु'),
      from: [x, 0, z], to: [x, h, z], headLength: 0.16, headRadius: 0.085,
      radius: 0.028, headColor: o.color, color: n(o.color, kind === 'imageArrow' ? C.image : C.object),
      grammar: 'arrow', visible: false
    };
  }
  function ray(o) {
    o = o || {};
    const id = o.id || ('ray_' + Math.random().toString(36).slice(2, 7));
    const A = o.from || [-1, 0, 0], B = o.to || [1, 0, 0];
    const pts = o.points || [A].concat(o.via || [[(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2]], [B]);
    const via = pts.slice(1, -1);
    return {
      id: id, partId: id, kind: o.kind || 'ray', grammar: 'ray',
      label_en: o.label_en || 'Light ray', label_hi: o.label_hi || 'प्रकाश किरण',
      from: A, via: via, to: B, points: pts,
      color: n(o.color, C.ray), opacity: cl(n(o.opacity, 1), 0.25, 1),
      radius: n(o.radius, 0.026), rule: o.rule || 'straight-line',
      equation: o.equation || FORMULAS.reflection, dynamic: true,
      pickable: true, tubularSegments: 18
    };
  }

  /* ------------------------------------------------------- static part data */
  function partDefs() {
    return [
      axis({ id: 'axis' }),
      mirror({ id: 'mirror_concave', surface: 'concave' }).part,
      mirror({ id: 'mirror_convex', surface: 'convex' }).part,
      mirror({ id: 'mirror_plane', surface: 'plane' }).part,
      lens({ id: 'lens_convex', surface: 'convex' }).part,
      lens({ id: 'lens_concave', surface: 'concave' }).part,
      lens({ id: 'power_lens1', surface: 'convex' }).part,
      lens({ id: 'power_lens2', surface: 'convex' }).part,
      arrow({ id: 'object', kind: 'objectArrow', color: C.object }),
      arrow({ id: 'image', kind: 'imageArrow', color: C.image }),
      { id: 'focus', kind: 'marker', shape: 'sphere', label_en: 'Focus F', label_hi: 'फोकस F', radius: 0.055, position: [0, 0, 0], color: C.focus, visible: false },
      { id: 'center', kind: 'marker', shape: 'sphere', label_en: 'Centre C / 2F', label_hi: 'केन्द्र C / 2F', radius: 0.055, position: [0, 0, 0], color: C.center, visible: false },
      { id: 'pole', kind: 'marker', shape: 'sphere', label_en: 'Pole / optical centre', label_hi: 'ध्रुव / प्रकाशिक केन्द्र', radius: 0.055, position: [0, 0, 0], color: C.pole, visible: false },
      { id: 'slab', kind: 'slab', shape: 'box', label_en: 'Rectangular glass slab', label_hi: 'आयताकार काँच की पट्टी', size: [1.10, 1.55, 0.12], position: [0, 0, -0.04], color: C.slab, opacity: 0.30, transparent: true, visible: false },
      { id: 'graph_x', kind: 'graph', shape: 'line', label_en: 'u axis', label_hi: 'u अक्ष', points: [[-1.35, -0.72, 0], [1.35, -0.72, 0]], color: C.axis, visible: false },
      { id: 'graph_y', kind: 'graph', shape: 'line', label_en: 'v axis', label_hi: 'v अक्ष', points: [[-1.35, -0.72, 0], [-1.35, 0.72, 0]], color: C.axis, visible: false },
      { id: 'graph_dot', kind: 'marker', shape: 'sphere', label_en: 'Operating point', label_hi: 'वर्तमान बिंदु', radius: 0.075, position: [0, 0, 0], color: C.dot, visible: false },
      { id: 'normal', kind: 'normal', shape: 'line', label_en: 'Normal', label_hi: 'अभिलंब', points: [[-1.1, 0, 0], [1.1, 0, 0]], color: C.normal, visible: false }
    ];
  }
  const PART_DEFS = partDefs();
  const PART_IDS = PART_DEFS.map(p => p.id);
  function hiddenParts() {
    const out = {};
    PART_IDS.forEach(id => { out[id] = { visible: false }; });
    out.axis = { visible: true };
    return out;
  }
  function graphSegments(points, prefix, color) {
    const segs = [];
    for (let i = 0; i < points.length - 1; i++) {
      segs.push(ray({
        id: prefix + '_' + i, kind: 'graph', rule: 'parametric-curve',
        from: points[i], to: points[i + 1], via: [], points: [points[i], points[i + 1]],
        color: color || C.graph, opacity: 0.95, radius: 0.02,
        label_en: 'v–u curve segment ' + (i + 1), label_hi: 'v–u वक्र खंड ' + (i + 1),
        equation: FORMULAS.mirror
      }));
    }
    return segs;
  }

  /* -------------------------------------------------- pure parametric model */
  function raymirror(p, sceneType) {
    p = p || {};
    if (sceneType === 'reflection') {
      const d = mirror({ surface: 'plane', d: p.d, i: p.i });
      const xP = 0.35, off = d.d * 0.045, xObj = xP - off, xImg = xP + off;
      const yStart = cl(Math.tan(deg(d.i)) * off, -1.0, 1.0);
      const parts = hiddenParts();
      parts.mirror_plane = { visible: true };
      parts.normal = { visible: true, position: [xP, 0, 0] };
      parts.object = { visible: true, position: [xObj, 0, 0], scale: [1, 1, 1] };
      parts.image = { visible: true, position: [xImg, 0, 0], scale: [1, 1, 1] };
      parts.pole = { visible: true, position: [xP, 0, 0] };
      const segments = [
        ray({ id: 'ray_incident', from: [xObj, yStart, 0], to: [xP, 0, 0], rule: 'incident', equation: FORMULAS.reflection, label_en: 'Incident ray', label_hi: 'आपतित किरण' }),
        ray({ id: 'ray_reflected', from: [xP, 0, 0], to: [xObj, -yStart, 0], rule: 'reflected ∠i=∠r', equation: FORMULAS.reflection, color: C.rayVirtual, label_en: 'Reflected ray', label_hi: 'परावर्तित किरण' }),
        ray({ id: 'ray_virtual_extension', from: [xP, 0, 0], to: [xImg, 0, 0], rule: 'virtual-image extension', equation: FORMULAS.reflection, color: C.rayGreen, opacity: 0.55, label_en: 'Virtual image extension', label_hi: 'आभासी प्रतिबिम्ब विस्तार' })
      ];
      return {
        title_en: 'O3 · plane mirror / laws of reflection', title_hi: 'O3 · समतल दर्पण / परावर्तन के नियम',
        caption_en: 'The normal is the reference: ∠i = ∠r; the image is virtual, erect, same-sized and as far behind the mirror as the object is in front.',
        caption_hi: 'अभिलंब ही संदर्भ है: ∠i = ∠r; प्रतिबिम्ब आभासी, सीधा, समान आकार का और दर्पण के पीछे उतनी ही दूर।',
        hint_en: 'Move the incidence-angle and distance sliders; both angles stay equal.',
        hint_hi: 'आपतन कोण व दूरी स्लाइडर चलाएँ; दोनों कोण बराबर रहते हैं।',
        equation: FORMULAS.reflection, equation_hi: 'आपतन कोण = परावर्तन कोण',
        equations: [FORMULAS.reflection, FORMULAS.cartesian, 'u = −d · v = +d · f = ∞'],
        signed: { u: d.u, v: d.v, f: '∞', R: '∞', m: 1, i: d.i, r: d.r, d: d.d },
        invariants: { reflectionResidual: 0, formula: FORMULAS.reflection },
        readouts: [
          readout('Angle of incidence i', d.i, '°', d.i / 75 * 100),
          readout('Angle of reflection r', d.r, '°', d.r / 75 * 100),
          readout('Object = image distance', d.d, 'cm', d.d / 30 * 100),
          readout('Size ratio', '+1', 'm', 50)
        ],
        parts: parts, segments: segments, rayCount: segments.length
      };
    }
    const d = mirror({ u: p.u, f: p.f, kind: p.kind, surface: p.surface });
    const xO = -d.uMag * K, xImg = cl(d.v * K, -X, X), hImg = cl(d.m * H, -1.35, 1.35);
    const F = [d.xF, 0, 0], Cc = [d.xC, 0, 0];
    const parts = hiddenParts();
    parts[d.surface === 'convex' ? 'mirror_convex' : 'mirror_concave'] = {
      visible: true, scale: [cl(d.fMag / 15, 0.65, 1.45), 1, 1]
    };
    parts.object = { visible: true, position: [xO, 0, 0], scale: [1, 1, 1] };
    parts.image = { visible: true, position: [xImg, 0, 0], scale: [1, hImg / H, 1], color: d.real ? C.image : 0xffb35c };
    parts.focus = { visible: true, position: F };
    parts.center = { visible: true, position: Cc };
    parts.pole = { visible: true, position: [0, 0, 0] };
    const col = d.real ? C.ray : C.rayVirtual, op = d.real ? 1 : 0.62;
    const segments = [
      ray({ id: 'ray_parallel_in', from: [xO, H, 0], to: [0, H, 0], rule: 'parallel to principal axis', equation: FORMULAS.mirror, color: col, opacity: op, label_en: 'Parallel incident ray', label_hi: 'अक्ष के समांतर आपतित किरण' }),
      ray({ id: 'ray_parallel_out', from: [0, H, 0], to: [xImg, hImg, 0], rule: 'through / from focus F', equation: FORMULAS.mirror, color: col, opacity: op, label_en: 'Reflected ray via F', label_hi: 'F से होकर परावर्तित किरण' }),
      ray({ id: 'ray_pole_in', from: [xO, H, 0], to: [0, 0, 0], rule: 'incident at pole', equation: FORMULAS.reflection, color: C.rayGreen, opacity: op, label_en: 'Ray to pole', label_hi: 'ध्रुव पर आपतित किरण' }),
      ray({ id: 'ray_pole_out', from: [0, 0, 0], to: [xImg, hImg, 0], rule: 'reflected at pole', equation: FORMULAS.reflection, color: C.rayGreen, opacity: op, label_en: 'Reflected ray to image', label_hi: 'प्रतिबिम्ब तक परावर्तित किरण' }),
      ray({ id: 'ray_focus_line', from: [0, H, 0], to: F, rule: 'focus construction', equation: FORMULAS.radius, color: C.center, opacity: 0.55, label_en: 'F construction', label_hi: 'F रचना' })
    ];
    const residual = rnd(1 / d.v + 1 / d.u - 1 / d.f, 10);
    return {
      title_en: 'O3 · spherical mirror / raymirror', title_hi: 'O3 · गोलीय दर्पण / raymirror',
      caption_en: 'NCERT 9.2: R = 2f. Two rays locate the image top; the signed mirror formula predicts v and m.',
      caption_hi: 'NCERT 9.2: R = 2f। दो किरणें प्रतिबिम्ब का शीर्ष ढूँढती हैं; चिह्नित दर्पण सूत्र v व m बताता है।',
      hint_en: 'Drag u and f: F, C, the image arrow and every ray segment are recomputed.',
      hint_hi: 'u व f खींचें: F, C, प्रतिबिम्ब तीर और हर किरण खंड फिर से गणना होते हैं।',
      equation: FORMULAS.mirror, equation_hi: 'दर्पण सूत्र · 1/v + 1/u = 1/f',
      equations: [FORMULAS.mirror, FORMULAS.mirrorMagnification, FORMULAS.radius, FORMULAS.cartesian],
      signed: { u: d.u, f: d.f, v: rnd(d.v, 3), R: d.R, m: rnd(d.m, 3), real: d.real, erect: d.erect, nature: d.nature, surface: d.surface },
      invariants: { mirrorResidual: residual, formula: FORMULAS.mirror, passes: Math.abs(residual) < 1e-6 },
      readouts: [
        readout('Object distance u', d.u, 'cm', d.uMag / 60 * 100),
        readout('Focal length f', d.f, 'cm', d.fMag / 30 * 100),
        readout('Image distance v', rnd(d.v, 1), 'cm', Math.abs(d.v) / 60 * 100),
        readout('Magnification m', rnd(d.m, 2), d.nature, Math.abs(d.m) * 45)
      ],
      parts: parts, segments: segments, rayCount: segments.length
    };
  }
  function raylens(p) {
    p = p || {};
    const d = lens({ u: p.u, f: p.f, kind: p.kind, surface: p.surface });
    const xO = -d.uMag * K, xImg = cl(d.v * K, -X, X), hImg = cl(d.m * H, -1.35, 1.35);
    const F = [d.xF, 0, 0], Cc = [d.xC, 0, 0];
    const parts = hiddenParts();
    parts[d.surface === 'convex' ? 'lens_convex' : 'lens_concave'] = {
      visible: true, scale: [cl(d.fMag / 15, 0.75, 1.35), 1, 1]
    };
    parts.object = { visible: true, position: [xO, 0, 0], scale: [1, 1, 1] };
    parts.image = { visible: true, position: [xImg, 0, 0], scale: [1, hImg / H, 1], color: d.real ? C.image : 0xffb35c };
    parts.focus = { visible: true, position: F };
    parts.center = { visible: true, position: Cc };
    parts.pole = { visible: true, position: [0, 0, 0] };
    const col = d.real ? C.ray : C.rayVirtual, op = d.real ? 1 : 0.62;
    const segments = [
      ray({ id: 'ray_parallel_in', from: [xO, H, 0], to: [0, H, 0], rule: 'parallel to principal axis', equation: FORMULAS.lens, color: col, opacity: op, label_en: 'Parallel incident ray', label_hi: 'अक्ष के समांतर आपतित किरण' }),
      ray({ id: 'ray_parallel_out', from: [0, H, 0], to: [xImg, hImg, 0], rule: 'refracts through focus F', equation: FORMULAS.lens, color: col, opacity: op, label_en: 'Refracted ray via F', label_hi: 'F से होकर अपवर्तित किरण' }),
      ray({ id: 'ray_centre', from: [xO, H, 0], to: [xImg, hImg, 0], via: [[0, 0, 0]], rule: 'through optical centre, undeviated', equation: FORMULAS.lens, color: C.rayGreen, opacity: op, label_en: 'Optical-centre ray', label_hi: 'प्रकाशिक केन्द्र से किरण' }),
      ray({ id: 'ray_focus_line', from: [0, H, 0], to: F, rule: 'focus construction', equation: FORMULAS.power, color: C.center, opacity: 0.55, label_en: 'F construction', label_hi: 'F रचना' })
    ];
    const residual = rnd(1 / d.v - 1 / d.u - 1 / d.f, 10);
    return {
      title_en: 'O3 · spherical lens / raylens', title_hi: 'O3 · गोलीय लेंस / raylens',
      caption_en: 'NCERT 9.3: a parallel ray refracts through F; a ray through the optical centre is undeviated. P = 1/f(m).',
      caption_hi: 'NCERT 9.3: समांतर किरण F से होकर अपवर्तित; प्रकाशिक केन्द्र से किरण अविचलित। P = 1/f(m)।',
      hint_en: 'Drag u and f: the lens formula recomputes v, m, power and every dynamic segment.',
      hint_hi: 'u व f खींचें: लेंस सूत्र v, m, क्षमता और हर गतिशील खंड फिर से गणना करता है।',
      equation: FORMULAS.lens, equation_hi: 'लेंस सूत्र · 1/v − 1/u = 1/f',
      equations: [FORMULAS.lens, FORMULAS.lensMagnification, FORMULAS.power, FORMULAS.cartesian],
      signed: { u: d.u, f: d.f, v: rnd(d.v, 3), m: rnd(d.m, 3), P: rnd(d.power, 2), real: d.real, erect: d.erect, nature: d.nature, surface: d.surface },
      invariants: { lensResidual: residual, formula: FORMULAS.lens, passes: Math.abs(residual) < 1e-6 },
      readouts: [
        readout('Object distance u', d.u, 'cm', d.uMag / 60 * 100),
        readout('Focal length f', d.f, 'cm', d.fMag / 30 * 100),
        readout('Image distance v', rnd(d.v, 1), 'cm', Math.abs(d.v) / 60 * 100),
        readout('Magnification m', rnd(d.m, 2), d.nature, Math.abs(d.m) * 45)
      ],
      parts: parts, segments: segments, rayCount: segments.length
    };
  }
  function rayslab(p) {
    p = p || {};
    const i = cl(n(p.i, 35), 0, 75), nn = cl(n(p.n, 1.5), 1, 2.2);
    const rr = Math.asin(cl(Math.sin(deg(i)) / nn, -0.999, 0.999)) * 180 / Math.PI;
    const tanI = cl(Math.tan(deg(i)), 0, 1.8), tanR = cl(Math.tan(deg(rr)), 0, 1.8);
    const yIn = 0.55, yOut = yIn - tanR * 0.38, yStart = yIn + tanI * 0.50, yEnd = yOut - tanI * 0.50;
    const shift = rnd(1.1 * Math.sin(deg(i - rr)) / Math.max(0.2, Math.cos(deg(rr))), 2);
    const parts = hiddenParts();
    parts.slab = { visible: true };
    parts.normal = { visible: true, position: [0, 0, 0] };
    parts.graph_dot = { visible: false };
    const segments = [
      ray({ id: 'ray_incident', from: [-2.0, yStart, 0], to: [-0.55, yIn, 0], rule: 'incident / Snell', equation: FORMULAS.snell, label_en: 'Incident ray', label_hi: 'आपतित किरण' }),
      ray({ id: 'ray_refracted', from: [-0.55, yIn, 0], to: [0.55, yOut, 0], rule: 'towards / away from normal', equation: FORMULAS.snell, color: C.rayGreen, label_en: 'Refracted ray', label_hi: 'अपवर्तित किरण' }),
      ray({ id: 'ray_emergent', from: [0.55, yOut, 0], to: [2.0, yEnd, 0], rule: 'emergent ∥ incident', equation: FORMULAS.slab, color: C.rayVirtual, label_en: 'Emergent ray', label_hi: 'निर्गत किरण' }),
      ray({ id: 'ray_normal_in', from: [-0.55, -0.9, 0], to: [-0.55, 0.9, 0], kind: 'line', rule: 'normal at first face', equation: FORMULAS.snell, color: C.normal, opacity: 0.6, label_en: 'Normal N₁', label_hi: 'अभिलंब N₁' }),
      ray({ id: 'ray_normal_out', from: [0.55, -0.9, 0], to: [0.55, 0.9, 0], kind: 'line', rule: 'normal at second face', equation: FORMULAS.snell, color: C.normal, opacity: 0.6, label_en: 'Normal N₂', label_hi: 'अभिलंब N₂' })
    ];
    const sinResidual = i < 0.5 ? 0 : rnd(Math.sin(deg(i)) / Math.sin(deg(rr)) - nn, 6);
    return {
      title_en: 'O3 · rectangular glass slab / rayslab', title_hi: 'O3 · आयताकार काँच की पट्टी / rayslab',
      caption_en: 'NCERT 9.3.1: n₁ sin i = n₂ sin r. The emergent ray is parallel to the incident ray with a lateral shift.',
      caption_hi: 'NCERT 9.3.1: n₁ sin i = n₂ sin r। निर्गत किरण आपतित किरण के समांतर, पार्श्व विस्थापन सहित।',
      hint_en: 'Set i = 0 for normal incidence: the ray passes straight through with zero shift.',
      hint_hi: 'i = 0 करें: अभिलंब आपतन पर किरण बिना मुड़े, शून्य विस्थापन से निकलती है।',
      equation: FORMULAS.snell, equation_hi: 'स्नेल का नियम · n₁ sin i = n₂ sin r',
      equations: [FORMULAS.snell, FORMULAS.slab, 'v_medium = c / n'],
      signed: { i: rnd(i, 1), r: rnd(rr, 1), n: rnd(nn, 2), shift: shift, speed: rnd(3 / nn, 2), parallel: true },
      invariants: { snellResidual: sinResidual, formula: FORMULAS.snell, passes: Math.abs(sinResidual) < 1e-4 },
      readouts: [
        readout('Incidence angle i', rnd(i, 1), '°', i / 75 * 100),
        readout('Refractive index n', rnd(nn, 2), '', (nn - 1) / 1.2 * 100),
        readout('Refraction angle r', rnd(rr, 1), '°', rr / 75 * 100),
        readout('Lateral shift', shift, 'cm', Math.abs(shift) * 40)
      ],
      parts: parts, segments: segments, rayCount: segments.length
    };
  }
  function raygraph(p, sceneType) {
    p = p || {};
    const parts = hiddenParts();
    parts.graph_x = { visible: true }; parts.graph_y = { visible: true };
    if (sceneType === 'lenspower') {
      const f1 = cl(n(p.f1, 50), 10, 200), f2raw = cl(n(p.f2, 50), -200, 200);
      const f2 = Math.abs(f2raw) < 1 ? (f2raw < 0 ? -1 : 1) : f2raw;
      const P1 = 100 / f1, P2 = 100 / f2, P = P1 + P2;
      const fEq = Math.abs(P) < 0.01 ? '∞' : 100 / P;
      const pts = [];
      for (let i = 0; i < 8; i++) {
        let ff = -175 + i * 50; if (Math.abs(ff) < 25) ff = ff < 0 ? -25 : 25;
        const Pi = P1 + 100 / ff;
        pts.push([-1.3 + 2.6 * i / 7, cl(Pi / 4, -0.72, 0.72), 0]);
      }
      const xOp = cl((f2 + 200) / 400 * 2.6 - 1.3, -1.3, 1.3), yOp = cl(P / 4, -0.72, 0.72);
      parts.power_lens1 = { visible: true, position: [-0.65, 0, 0], scale: [0.72, 0.72, 0.72] };
      parts.power_lens2 = { visible: true, position: [0.65, 0, 0], scale: [0.72, 0.72, 0.72], color: P2 < 0 ? C.lensConcave : C.lensConvex };
      parts.graph_dot = { visible: true, position: [xOp, yOp, 0] };
      const segments = graphSegments(pts, 'graph_power', C.graph).concat([
        ray({ id: 'graph_operating', from: [xOp, yOp, 0], to: [xOp + 0.001, yOp + 0.001, 0], radius: 0.07, color: C.dot, rule: 'operating point', equation: FORMULAS.powerSum, label_en: 'Net power point', label_hi: 'कुल क्षमता बिंदु' })
      ]);
      return {
        title_en: 'O3 · power of a lens / raygraph', title_hi: 'O3 · लेंस की क्षमता / raygraph',
        caption_en: 'NCERT 9.3.8: P = 1/f(m); thin lenses in contact add algebraically. One dioptre is one inverse metre.',
        caption_hi: 'NCERT 9.3.8: P = 1/f(m); संपर्क के पतले लेंसों की क्षमता बीजीय रूप से जुड़ती है।',
        hint_en: 'Combine +2.0 D and +0.25 D and read +2.25 D; make P zero for f = ∞.',
        hint_hi: '+2.0 D व +0.25 D जोड़ें और +2.25 D पढ़ें; P = 0 पर f = ∞।',
        equation: FORMULAS.power, equation_hi: 'क्षमता · P = 1/f(m)',
        equations: [FORMULAS.power, FORMULAS.powerSum, '1 D = 1 m⁻¹'],
        signed: { f1: f1, f2: f2, P1: rnd(P1, 2), P2: rnd(P2, 2), P: rnd(P, 2), fEq: fEq === '∞' ? '∞' : rnd(fEq, 1), type: P > 0 ? 'converging' : P < 0 ? 'diverging' : 'afocal' },
        invariants: { powerResidual: rnd(P - P1 - P2, 10), formula: FORMULAS.powerSum, passes: Math.abs(P - P1 - P2) < 1e-9 },
        readouts: [
          readout('Lens 1 power', rnd(P1, 2), 'D', Math.abs(P1) * 25),
          readout('Lens 2 power', rnd(P2, 2), 'D', Math.abs(P2) * 25),
          readout('Net power P', rnd(P, 2), 'D', Math.abs(P) * 25),
          readout('Equivalent f', fEq === '∞' ? '∞' : rnd(fEq, 1), 'cm', Math.abs(P) * 20)
        ],
        parts: parts, segments: segments, rayCount: segments.length
      };
    }
    const isMirror = sceneType === 'mirrorformula' || p.mirror === true;
    const d = isMirror
      ? mirror({ u: p.u, f: p.f, kind: p.kind, surface: p.surface })
      : lens({ u: p.u, f: p.f, kind: p.kind, surface: p.surface });
    const f = d.f, u = d.u;
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const uu = -(8 + i * 7);
      const vv = isMirror ? mirrorV(f, uu) : lensV(f, uu);
      pts.push([-1.3 + 2.6 * i / 7, cl(vv / 60 * 1.3, -0.72, 0.72), 0]);
    }
    const xOp = cl((d.uMag - 8) / 49 * 2.6 - 1.3, -1.3, 1.3);
    const yOp = cl(d.v / 60 * 1.3, -0.72, 0.72);
    parts.graph_dot = { visible: true, position: [xOp, yOp, 0] };
    const equation = isMirror ? FORMULAS.mirror : FORMULAS.lens;
    const residual = isMirror ? rnd(1 / d.v + 1 / u - 1 / f, 10) : rnd(1 / d.v - 1 / u - 1 / f, 10);
    const segments = graphSegments(pts, 'graph_vu', C.graph).concat([
      ray({ id: 'graph_operating', from: [xOp, yOp, 0], to: [xOp + 0.001, yOp + 0.001, 0], radius: 0.07, color: C.dot, rule: 'operating point', equation: equation, label_en: 'Current u,v point', label_hi: 'वर्तमान u,v बिंदु' })
    ]);
    return {
      title_en: (isMirror ? 'O3 · mirror formula' : 'O3 · lens formula') + ' / raygraph',
      title_hi: (isMirror ? 'O3 · दर्पण सूत्र' : 'O3 · लेंस सूत्र') + ' / raygraph',
      caption_en: 'The standing v–u curve is generated from the signed formula; the glowing dot is the slider operating point.',
      caption_hi: 'स्थायी v–u वक्र चिह्नित सूत्र से बना है; चमकता बिंदु स्लाइडर का वर्तमान बिंदु है।',
      hint_en: 'Slide u across F/2F: the operating point crosses the asymptote and m changes sign.',
      hint_hi: 'u को F/2F के आर-पार खींचें: बिंदु अनंत के पास से गुजरता है और m का चिह्न बदलता है।',
      equation: equation, equation_hi: isMirror ? 'दर्पण सूत्र · 1/v + 1/u = 1/f' : 'लेंस सूत्र · 1/v − 1/u = 1/f',
      equations: [equation, isMirror ? FORMULAS.mirrorMagnification : FORMULAS.lensMagnification, FORMULAS.cartesian],
      signed: { u: u, f: f, v: rnd(d.v, 3), m: rnd(d.m, 3), invU: rnd(1 / u, 4), invV: rnd(1 / d.v, 4) },
      invariants: { formulaResidual: residual, formula: equation, passes: Math.abs(residual) < 1e-6 },
      readouts: [
        readout('Object distance u', u, 'cm', d.uMag / 60 * 100),
        readout('Focal length f', f, 'cm', d.fMag / 30 * 100),
        readout('Image distance v', rnd(d.v, 1), 'cm', Math.abs(d.v) / 60 * 100),
        readout('Magnification m', rnd(d.m, 2), d.nature, Math.abs(d.m) * 45)
      ],
      parts: parts, segments: segments, rayCount: segments.length
    };
  }

  function labType(sceneType) {
    if (sceneType === 'reflection' || sceneType === 'mirror') return 'raymirror';
    if (sceneType === 'slab') return 'rayslab';
    if (sceneType === 'mirrorformula' || sceneType === 'lensformula' || sceneType === 'lenspower') return 'raygraph';
    return 'raylens';
  }
  function model(name, p, sceneType) {
    const key = MODELS.indexOf(name) >= 0 ? name : labType(sceneType);
    const fn = key === 'raymirror' ? raymirror : key === 'raylens' ? raylens : key === 'rayslab' ? rayslab : raygraph;
    const m = fn(p || {}, sceneType || '');
    return Object.assign({
      schema: SCHEMA, version: VERSION, prompt: 3, credit: CREDIT,
      model: key, sceneType: sceneType || key, grammar: GRAMMAR.slice(),
      routedBy: 'EVENGINE.setSegments(model.segments) → dynamic Group → shared WORLD renderer'
    }, m);
  }
  function spec(name, p, lang, sceneType) {
    const m = model(name, p, sceneType);
    return {
      id: 'o3_' + m.model + '_' + String(m.sceneType).replace(/[^a-z0-9_]/gi, '_'),
      class: 'X', subject: 'physics', engine: 'phys',
      title_en: m.title_en, title_hi: m.title_hi,
      captions: { en: m.caption_en, hi: m.caption_hi },
      parts: PART_DEFS.map(d => Object.assign({}, d)),
      segments: m.segments.map(s => Object.assign({}, s)),
      fields: [],                    /* PhysEngine expects slider metadata as an array */
      grammar: GRAMMAR.slice(), model: m.model, formula: m.equation,
      lang: ['en', 'hi', 'both'].indexOf(lang) >= 0 ? lang : 'both',
      credit: CREDIT
    };
  }
  /* ------------------------------------------------- PROMPT 5 electricity
     ADDITIVE circuit grammar. The canonical five-name optics GRAMMAR and the
     four pure optics MODELS are HARD contracts from step 3 and stay byte-for-
     byte unchanged: this extension is exposed separately as
     O3.ELECTRIC_PRIMITIVES / O3.CIRCUIT_MODELS / O3.circuit() / O3.circuitSpec().
     Everything here is DATA (JSON). No THREE, no DOM, no renderer, no GLTF. */
  const ELECTRIC_PRIMITIVES = ['wire', 'resistor', 'battery'];
  const CIRCUIT_MODELS = ['ohmSeries', 'ohmParallel'];
  const CIRCUIT_FORMULAS = Object.freeze({
    ohm: 'V = I R', series: 'R_eq = R₁ + R₂',
    parallel: '1/R_eq = 1/R₁ + 1/R₂', power: 'P = V I = I² R = V² / R'
  });
  function bilingual(en, hi) {
    /* Prompt 4: every data-driven label is registered in the canonical dict. */
    if (typeof EVDICT !== 'undefined' && EVDICT.auto) EVDICT.auto(en, hi);
    return { label_en: en, label_hi: hi };
  }
  function wire(o) {
    o = o || {};
    const t = bilingual('Connecting wire', 'संयोजक तार');
    return {
      id: o.id || 'wire_loop', kind: 'wire', grammar: 'wire', shape: 'tube',
      label_en: t.label_en, label_hi: t.label_hi,
      points: o.points || [[-1.6, 0.8, 0], [1.6, 0.8, 0], [1.6, -0.8, 0], [-1.6, -0.8, 0], [-1.6, 0.8, 0]],
      radius: n(o.radius, 0.035), color: n(o.color, 0x2c93a8),
      formula: CIRCUIT_FORMULAS.ohm, visible: true, pickable: true
    };
  }
  function resistor(o) {
    o = o || {};
    const t = bilingual('Resistor R', 'प्रतिरोधक R');
    return {
      id: o.id || 'resistor', kind: 'resistor', grammar: 'resistor', shape: 'box',
      label_en: t.label_en, label_hi: t.label_hi,
      resistance: Math.max(1e-6, n(o.resistance, 4)),
      position: o.position || [0, 0.8, 0],
      size: o.size || [0.62, 0.20, 0.20], color: n(o.color, 0xe0a02a),
      formula: CIRCUIT_FORMULAS.ohm, pickable: true
    };
  }
  function battery(o) {
    o = o || {};
    const t = bilingual('Cell / battery V', 'सेल / बैटरी V');
    return {
      id: o.id || 'battery', kind: 'battery', grammar: 'battery', shape: 'battery',
      label_en: t.label_en, label_hi: t.label_hi,
      voltage: n(o.voltage, 12), position: o.position || [-1.6, 0, 0],
      width: n(o.width, 0.9), height: n(o.height, 0.42), depth: n(o.depth, 0.34),
      color: n(o.color, 0x254a68), formula: CIRCUIT_FORMULAS.ohm, pickable: true
    };
  }
  function circuit(p) {
    p = p || {};
    const V = finite(p.V, 12);
    const R1 = Math.max(1e-6, finite(p.R1, 4));
    const R2 = Math.max(1e-6, finite(p.R2, 6));
    const mode = p.mode === 'parallel' ? 'parallel' : 'series';
    const Req = mode === 'series' ? R1 + R2 : 1 / (1 / R1 + 1 / R2);
    const I = V / Req;
    const I1 = mode === 'series' ? I : V / R1;
    const I2 = mode === 'series' ? I : V / R2;
    const residual = mode === 'series' ? Math.abs(V - I * Req) : Math.abs(I - (I1 + I2));
    return {
      schema: SCHEMA, version: VERSION, prompt: 5, credit: CREDIT,
      model: mode === 'series' ? 'ohmSeries' : 'ohmParallel',
      grammar: GRAMMAR.slice(), electric: ELECTRIC_PRIMITIVES.slice(),
      V: V, R1: R1, R2: R2, Req: rnd(Req, 4), I: rnd(I, 4),
      I1: rnd(I1, 4), I2: rnd(I2, 4), P: rnd(V * I, 4),
      equations: [CIRCUIT_FORMULAS.ohm, mode === 'series' ? CIRCUIT_FORMULAS.series : CIRCUIT_FORMULAS.parallel,
                  CIRCUIT_FORMULAS.power],
      formula: CIRCUIT_FORMULAS.ohm,
      invariants: { ohmResidual: residual, kirchhoffResidual: residual, passes: residual < 1e-9 },
      readouts: [
        readout('Potential difference V', V, 'V', 60),
        readout('Equivalent resistance', rnd(Req, 2), 'Ω', 55),
        readout('Current I', rnd(I, 2), 'A', 48),
        readout('Power P', rnd(V * I, 1), 'W', 40)
      ]
    };
  }
  function circuitSpec(p, lang) {
    const m = circuit(p);
    const q = circuit(p);
    const parts = [
      wire({ id: 'o3_wire' }),
      resistor({ id: 'o3_r1', resistance: q.R1, position: [-0.6, 0.8, 0] }),
      resistor({ id: 'o3_r2', resistance: q.R2, position: [0.6, 0.8, 0] }),
      battery({ id: 'o3_cell', voltage: q.V, position: [-1.6, 0, 0] })
    ];
    return {
      id: 'o3_' + m.model, class: 'X', subject: 'physics', engine: 'phys',
      title_en: "O3 · Ohm's law circuit", title_hi: 'O3 · ओम का नियम परिपथ',
      captions: { en: 'Series and parallel resistance computed in pure data.',
                  hi: 'श्रेणी व समान्तर प्रतिरोध की गणना केवल डेटा में होती है।' },
      parts: parts, fields: [],
      grammar: GRAMMAR.slice(), electric: ELECTRIC_PRIMITIVES.slice(),
      model: m.model, formula: m.formula, equations: m.equations.slice(),
      signed: { V: m.V, R1: m.R1, R2: m.R2, Req: m.Req, I: m.I, P: m.P },
      invariants: Object.assign({}, m.invariants), readouts: m.readouts.slice(),
      lang: ['en', 'hi', 'both'].indexOf(lang) >= 0 ? lang : 'both',
      credit: CREDIT
    };
  }

  function contract() {
    return {
      schema: SCHEMA, version: VERSION, prompt: 3, release: 'R8 + Master Engine steps 1-5',
      credit: CREDIT, grammar: GRAMMAR.slice(), models: MODELS.slice(),
      formulas: Object.assign({}, FORMULAS), signs: Object.assign({}, SIGNS),
      electric: {
        primitives: ELECTRIC_PRIMITIVES.slice(), models: CIRCUIT_MODELS.slice(),
        formulas: Object.assign({}, CIRCUIT_FORMULAS),
        note: 'additive Prompt-5 circuit grammar; canonical five-name optics GRAMMAR unchanged',
        routing: 'O3.circuit() → O3.circuitSpec() → EVENGINE.create(phys) → shared WORLD renderer'
      },
      dataShape: ['parts[]', 'segments[]', 'readouts[]', 'equations[]', 'signed{}', 'invariants{}'],
      routing: 'pure O3.model() → O3.spec() → EVENGINE.create(phys) → setSegments() → update() → shared WORLD WebGLRenderer',
      guarantees: [
        'NCERT New Cartesian signs; u = −|u|; mirror 1/v + 1/u = 1/f; lens 1/v − 1/u = 1/f',
        'pure parametric models: no THREE, no DOM, no renderer, no mutable scene state',
        'slider-driven dynamic ray segments with stable ids rebuilt by EVENGINE',
        '0 external refs · 0 GLB/GLTF · 0 React · 1 shared WebGLRenderer',
        'the seven shipped LIGHT_BLOCKS and qa/light_smoke.js remain unchanged',
        'Prompt 5 adds O3.wire/resistor/battery + pure Ohm law models without changing the canonical grammar'
      ],
      lifecycle: ['model(name,p,sceneType)', 'spec(name,p,lang,sceneType)', 'EVENGINE.create', 'setSegments', 'update', 'focus', 'dispose'],
      deferred: {}
    };
  }
  return {
    VERSION: VERSION, CREDIT: CREDIT, SCHEMA: SCHEMA,
    GRAMMAR: GRAMMAR.slice(), MODELS: MODELS.slice(),
    FORMULAS: Object.assign({}, FORMULAS), SIGNS: Object.assign({}, SIGNS),
    axis: axis, ray: ray, mirror: mirror, lens: lens, arrow: arrow,
    wire: wire, resistor: resistor, battery: battery,
    ELECTRIC_PRIMITIVES: ELECTRIC_PRIMITIVES.slice(),
    CIRCUIT_MODELS: CIRCUIT_MODELS.slice(),
    CIRCUIT_FORMULAS: Object.assign({}, CIRCUIT_FORMULAS),
    circuit: circuit, circuitSpec: circuitSpec,
    raymirror: raymirror, raylens: raylens, rayslab: rayslab, raygraph: raygraph,
    labType: labType, model: model, spec: spec, partDefs: () => PART_DEFS.map(d => Object.assign({}, d)),
    contract: contract, text: text, bi: bi
  };
})();
