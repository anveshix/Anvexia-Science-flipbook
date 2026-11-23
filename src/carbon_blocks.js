/* ==========================================================================
   EduVerse — NCERT Class X · Chapter 4 "Carbon and its Compounds"
   16 dedicated 3D pop-up scene blocks. One block per NCERT section/activity.
   Every block = pure model(params) + procedural 3D paper-craft + draggable
   handles + clickable parts, sharing the exact same numerical state with
   the live readings, precision-2D view, challenge and quiz.
   ========================================================================== */

const CARBON_TYPES = ["covalent", "allotrope", "catenation", "bondorder", "isomer", "functional",
  "homologous", "nomenclature", "combustion", "oxidation", "hydrogenation", "substitution",
  "ethanol", "ethanoic", "ester", "micelle"];

const C3 = (function () {
  const E = {
    C: [0x35424e, 0.205], H: [0xf5f9fc, 0.105], O: [0xd9564f, 0.175],
    Cl: [0x6fbf63, 0.185], Br: [0xb5653c, 0.195], Na: [0xa07fd6, 0.185],
    N: [0x4f8fda, 0.175], S: [0xe3c14d, 0.185], Ni: [0xb9c3c9, 0.165]
  };
  function atom(g, sym, p, s) {
    const d = E[sym] || E.C;
    const m = G3.ball(g, d[1] * (s || 1), d[0], p, { rough: 0.42, metal: 0.06, seg: 14 });
    m.userData.element = sym; return m;
  }
  function link(g, a, b, order, color, radius) {
    const A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]);
    const dir = new THREE.Vector3().subVectors(B, A), len = dir.length();
    const offs = order === 3 ? [-0.085, 0, 0.085] : order === 2 ? [-0.055, 0.055] : [0];
    const out = [];
    offs.forEach(o => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(radius || 0.027, radius || 0.027, len, 8),
        new THREE.MeshStandardMaterial({ color: color || 0x9fb9cf, roughness: 0.58, metalness: 0.12 }));
      m.position.copy(A.clone().add(B).multiplyScalar(0.5)); m.position.z += o;
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      g.add(m); out.push(m);
    });
    return out;
  }
  function plate(g, title) {
    const baseGeo = new THREE.BoxGeometry(3.5, 0.065, 2.4);
    G3.mesh(g, baseGeo, new THREE.MeshBasicMaterial({ color: 0xe6dcc0 }), [0, 0.03, 0]);
    G3.mesh(g, new THREE.BoxGeometry(3.56, 0.02, 2.46), new THREE.MeshBasicMaterial({ color: 0x8b7a5a }), [0, 0.0, 0]);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(baseGeo),
      new THREE.LineBasicMaterial({ color: 0x9c8b6a, transparent: true, opacity: 0.8 }));
    edges.position.set(0, 0.03, 0); g.add(edges);
    G3.tag(g, title, 3.0, 0.42, { pos: [0, 1.82, -0.78], size: 38, bg: "#e9e0c8" });
  }
  function railHandle(g, ctx, id, idx, color, min, max, value) {
    const z = 1.08 - idx * 0.46;
    G3.rail(g, -1.35, 1.35, 0.13, z, 0x9c8b6a);
    const h = G3.handle(g, id, [-1.35 + 2.7 * ((value - min) / (max - min)), 0.16, z], color);
    ctx.setHandleRange(id, -1.35, 1.35, h.position.x);
    return h;
  }
  function dynamicTag(g, w, h, pos, size) {
    const c = document.createElement("canvas"); c.width = 640; c.height = Math.round(640 * h / w);
    const x = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    const m = G3.mesh(g, new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }), pos);
    m.userData.setText = function (text) {
      x.fillStyle = "#f7f1e2"; x.fillRect(0, 0, c.width, c.height);
      x.strokeStyle = "#8b7a5a"; x.lineWidth = 5; x.strokeRect(3, 3, c.width - 6, c.height - 6);
      x.fillStyle = "#24303c"; x.textAlign = "center"; x.textBaseline = "middle";
      let s = size || 52;
      x.font = "bold " + s + "px Georgia, 'Noto Sans Devanagari Embedded', serif";
      while (x.measureText(String(text)).width > c.width - 40 && s > 20) { s -= 3; x.font = "bold " + s + "px Georgia, serif"; }
      x.fillText(String(text), c.width / 2, c.height / 2); tex.needsUpdate = true;
    };
    m.userData.isTag = true;
    m.userData.setText("—"); return m;
  }
  /* carbon skeleton: n carbons in a row, hydrogens, optional multiple bond / branch / group */
  function skeleton(g, n, o) {
    o = o || {};
    const gap = 0.66, x0 = -(n - 1) * gap / 2, y = o.y || 0.82;
    const carbons = [], targets = [], order = o.order || 1;
    const mid = Math.max(0, Math.floor(n / 2) - 1);
    for (let i = 0; i < n; i++) {
      const p = [x0 + i * gap, y, 0];
      const c = atom(g, "C", p); carbons.push(c); targets.push({ id: "C" + (i + 1), mesh: c });
      if (i > 0) {
        const bo = order > 1 && i === mid + 1 ? order : 1;
        link(g, [x0 + (i - 1) * gap, y, 0], p, bo, bo > 1 ? 0xffc46b : 0x9fb9cf);
      }
    }
    const unsat = order > 1 ? [mid, mid + 1] : [];
    for (let i = 0; i < n; i++) {
      const p = [x0 + i * gap, y, 0];
      const hc = (i === 0 || i === n - 1) ? 3 : 2;
      const skip = unsat.indexOf(i) >= 0 ? (order === 3 ? 2 : 1) : 0;
      for (let k = 0; k < hc - skip; k++) {
        const hp = k === 0 ? [p[0], y + 0.43, 0.16] : k === 1 ? [p[0], y - 0.43, 0.16]
          : [p[0] + (i === 0 ? -0.44 : 0.44), y, 0.16];
        const h = atom(g, "H", hp, 0.85);
        link(g, p, hp, 1, 0x6d8597, 0.015);
        targets.push({ id: "H", mesh: h });
      }
    }
    if (o.branch && n >= 3) {
      const p = [x0 + gap, y, 0], bp = [p[0], y + 0.68, 0];
      const c = atom(g, "C", bp); link(g, p, bp, 1, 0x9fb9cf);
      targets.push({ id: "branch", mesh: c });
      [[-0.42, 0.24], [0.42, 0.24], [0, 0.46]].forEach(d => {
        const hp = [bp[0] + d[0], bp[1] + d[1], 0.1];
        const h = atom(g, "H", hp, 0.85); link(g, bp, hp, 1, 0x6d8597, 0.015);
        targets.push({ id: "H", mesh: h });
      });
    }
    if (o.group !== undefined) attachGroup(g, [x0 + (n - 1) * gap + 0.5, y, 0], o.group, targets);
    return { carbons: carbons, targets: targets, x0: x0, gap: gap, y: y };
  }
  const GROUPS = [
    { sym: "Cl", label: "—Cl", parts: [["Cl", [0, 0, 0], 1]] },
    { sym: "OH", label: "—OH", parts: [["O", [0, 0, 0], 1], ["H", [0.34, 0.2, 0], 0.9]] },
    { sym: "CHO", label: "—CHO", parts: [["C", [0, 0, 0], 0.9], ["O", [0, 0.4, 0], 1], ["H", [0.38, 0, 0], 0.9]] },
    { sym: "CO", label: ">C=O", parts: [["C", [0, 0, 0], 0.9], ["O", [0, 0.42, 0], 1]] },
    { sym: "COOH", label: "—COOH", parts: [["C", [0, 0, 0], 0.9], ["O", [0, 0.42, 0], 1], ["O", [0.42, -0.1, 0], 1], ["H", [0.78, 0.02, 0], 0.9]] }
  ];
  function attachGroup(g, base, gi, targets) {
    const gr = GROUPS[gi] || GROUPS[0];
    gr.parts.forEach(pt => {
      const p = [base[0] + pt[1][0], base[1] + pt[1][1], base[2] + pt[1][2]];
      const m = atom(g, pt[0], p, pt[2]); targets.push({ id: gr.sym, mesh: m });
    });
    G3.tag(g, gr.label, 0.9, 0.3, { pos: [base[0] + 0.3, base[1] + 0.78, 0], size: 46, bg: "#f5ead0" });
    return gr;
  }
  function ring(g, n, aromatic) {
    const R = 0.92, y = 0.78, pts = [], targets = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, p = [Math.cos(a) * R, y, Math.sin(a) * R];
      pts.push(p); const c = atom(g, "C", p); targets.push({ id: "C" + (i + 1), mesh: c });
    }
    for (let i = 0; i < n; i++) {
      const bo = aromatic && i % 2 === 0 ? 2 : 1;
      link(g, pts[i], pts[(i + 1) % n], bo, bo > 1 ? 0xffc46b : 0x9fb9cf);
    }
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, hp = [Math.cos(a) * (R + 0.42), y, Math.sin(a) * (R + 0.42)];
      const h = atom(g, "H", hp, 0.85); link(g, pts[i], hp, 1, 0x6d8597, 0.015);
      targets.push({ id: "H", mesh: h });
    }
    return targets;
  }
  function finish(handles, targets, spin, fn) {
    const ts = (targets || []).filter(t => t.mesh && t.mesh.isMesh);
    return {
      handles: handles, clickTargets: ts,
      update(m, dt, time) { if (spin) spin.rotation.y += dt * 0.22; if (fn) fn(m, dt, time); }
    };
  }
  function vial(g, x, color, h) {
    const glass = G3.cyl(g, 0.3, 0.32, 0.82, G3.mat(0x9fc4d8, { opacity: 0.38, rough: 0.12 }), [x, 0.48, 0]);
    const rim = G3.torus(g, 0.3, 0.025, 0xdfeef5, [x, 0.89, 0], [Math.PI / 2, 0, 0]);
    const liquid = G3.cyl(g, 0.27, 0.27, h || 0.36, G3.mat(color, { opacity: 0.92, glow: 0.25, emissive: color }), [x, 0.28, 0]);
    return { glass: glass, liquid: liquid, rim: rim };
  }
  return { atom, link, plate, railHandle, dynamicTag, skeleton, ring, finish, vial, GROUPS };
})();

/* -------------------------------------------------------------------------- */
const CARBON_BLOCKS = {

  /* 4.1 · electron sharing / covalent bond ---------------------------------- */
  covalent: {
    label: "Covalent bond · electron sharing", icon: "⚛",
    controls: [
      { id: "mol", label: "Molecule (H₂ · O₂ · N₂ · CH₄)", min: 0, max: 3, value: 3, unit: "" },
      { id: "share", label: "Electrons shared", min: 0, max: 100, value: 60, unit: "%" }
    ],
    model(p) {
      const i = clamp(Math.round(p.mol), 0, 3), names = ["H₂", "O₂", "N₂", "CH₄"];
      const pairs = [1, 2, 3, 4], octet = Math.round(p.share);
      const mps = [14, 54, 63, 91], bps = [20, 90, 77, 112];
      const geometry = i === 3 ? "tetrahedral 109.5°" : "linear diatomic";
      return {
        mol: i, molecule: names[i], pairs: pairs[i], octet: octet,
        shell: i === 0 ? "duet (2 e⁻)" : octet >= 100 ? "octet (8 e⁻)" : "incomplete",
        conductor: "poor", mp: mps[i], bp: bps[i], geometry: geometry,
        readouts: [ro("Molecule", names[i], "", 25 + i * 25), ro("Shared pairs", pairs[i], "pairs", pairs[i] * 25),
          ro("Geometry", geometry, "", i === 3 ? 100 : 55), ro("Conductivity", "poor", "", 8)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.1 · COVALENT BOND");
      const spin = new THREE.Group(); g.add(spin);
      const molecules = [], allTargets = [], shared = [];
      const Y = 0.82, R = 0.64;
      /* One chemically correct compact group per molecule; exactly ONE is
         visible at a time. H₂/O₂/N₂ are linear with bond order 1/2/3.
         CH₄ is tetrahedral (109.5°), never a flat square. */
      const diatomic = (sym, order) => {
        const grp = new THREE.Group(); spin.add(grp);
        const a = C3.atom(grp, sym, [-R, Y, 0], 1.35);
        const b = C3.atom(grp, sym, [R, Y, 0], 1.35);
        C3.link(grp, [-R, Y, 0], [R, Y, 0], order,
                order === 3 ? 0xffc46b : order === 2 ? 0xf2b25c : 0x9fb9cf);
        const pair = [];
        const offs = order === 3 ? [-0.13, 0, 0.13] : order === 2 ? [-0.08, 0.08] : [0];
        offs.forEach((o, k) => {
          [-0.055, 0.055].forEach(dx => {
            const e = G3.ball(grp, 0.045, 0xffd166, [dx, Y + o, 0.06],
                              { emissive: 0xffa63d, glow: 1.0, seg: 10 });
            e.userData.pair = k; pair.push(e); shared.push({ mesh: e, molecule: molecules.length, pair: k });
          });
        });
        allTargets.push({ id: sym, mesh: a }, { id: sym, mesh: b });
        pair.forEach((e, j) => allTargets.push({ id: "e⁻", mesh: e }));
        molecules.push(grp);
        return grp;
      };
      diatomic("H", 1); diatomic("O", 2); diatomic("N", 3);
      /* Methane: four C–H sigma bonds toward the vertices of a tetrahedron. */
      const ch4 = new THREE.Group(); spin.add(ch4);
      const c = C3.atom(ch4, "C", [0, Y, 0], 1.55);
      allTargets.push({ id: "C", mesh: c });
      const dirs = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]
        .map(v => new THREE.Vector3(v[0], v[1], v[2]).normalize());
      dirs.forEach((d, k) => {
        const hp = [d.x * 0.92, Y + d.y * 0.92, d.z * 0.92];
        const h = C3.atom(ch4, "H", hp, 1.05);
        C3.link(ch4, [0, Y, 0], hp, 1, 0x9fb9cf);
        allTargets.push({ id: "H", mesh: h });
        [-0.05, 0.05].forEach(dx => {
          const mid = new THREE.Vector3(d.x * 0.46, Y + d.y * 0.46, d.z * 0.46);
          const e = G3.ball(ch4, 0.042, 0xffd166,
                            [mid.x + dx, mid.y, mid.z], { emissive: 0xffa63d, glow: 1.0, seg: 10 });
          e.userData.pair = k; shared.push({ mesh: e, molecule: 3, pair: k });
          allTargets.push({ id: "e⁻", mesh: e });
        });
      });
      molecules.push(ch4);
      const nameTag = C3.dynamicTag(g, 2.7, 0.42, [0, 1.46, -0.42], 46);
      const note = G3.tag(g, "6 protons cannot hold 10 e⁻\n4 e⁻ removed = too much energy\n→ share, do not transfer",
        2.5, 0.72, { pos: [0, 0.12, 0.88], rot: [-Math.PI / 2, 0, 0], size: 28, bg: "#e8e0cb" });
      const h1 = C3.railHandle(g, ctx, "mol", 0, 0x4ad6ff, 0, 3, 3);
      const h2 = C3.railHandle(g, ctx, "share", 1, 0xffc46b, 0, 100, 60);
      return C3.finish([h1, h2], allTargets, spin,
        (m, dt, time) => {
          molecules.forEach((grp, i) => grp.visible = i === m.mol);
          /* The slider reveals completed shared pairs gradually; it never
             changes the correct bond order or the tetrahedral geometry. */
          const shown = Math.max(0, Math.min(m.pairs, Math.round(m.pairs * m.octet / 100)));
          shared.forEach(o => {
            o.mesh.visible = o.molecule === m.mol && o.pair < shown;
            o.mesh.material.opacity = 0.55 + 0.45 * m.octet / 100;
          });
          nameTag.userData.setText(m.molecule + " · " + m.pairs + " shared pair(s) · " + m.geometry);
          note.visible = m.mol === 3;
        });
    }
  },

  /* Allotropes -------------------------------------------------------------- */
  allotrope: {
    label: "Allotropes of carbon", icon: "◇",
    controls: [
      { id: "form", label: "Allotrope (diamond · graphite · C₆₀)", min: 0, max: 2, value: 1, unit: "" },
      { id: "probe", label: "Conductivity probe", min: 0, max: 100, value: 20, unit: "%" }
    ],
    model(p) {
      const f = clamp(Math.round(p.form), 0, 2), names = ["Diamond", "Graphite", "C₆₀ fullerene"];
      const bonds = [4, 3, 3], conduct = f === 1 ? Math.round(p.probe) : f === 2 ? Math.round(p.probe * 0.4) : 0;
      return {
        form: f, allotrope: names[f], bonds: bonds[f], conductivity: conduct,
        hardness: f === 0 ? "hardest known" : f === 1 ? "soft, slippery" : "molecular solid",
        layers: f === 1 ? "hexagonal sheets" : f === 0 ? "rigid 3D network" : "football cage",
        readouts: [ro("Allotrope", names[f], "", 33 + f * 33), ro("Bonds per C", bonds[f], "", bonds[f] * 25),
          ro("Conductivity", conduct, "%", conduct), ro("Structure", f === 0 ? "hardest" : f === 1 ? "layered" : "cage", "", f === 0 ? 100 : f === 1 ? 55 : 30)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.1 · ALLOTROPES");
      const spin = new THREE.Group(); g.add(spin);
      const targets = [];
      /* diamond: tetrahedral network */
      const dia = new THREE.Group(), gra = new THREE.Group(), ful = new THREE.Group();
      spin.add(dia); spin.add(gra); spin.add(ful);
      const dpts = [[0, 0, 0], [0.7, 0.5, 0], [-0.7, 0.5, 0], [0, -0.6, 0.7], [0, -0.6, -0.7], [1.3, 1.0, 0.5], [-1.3, 1.0, -0.5]]
        .map(p => [p[0] * 0.8, 0.85 + p[1] * 0.8, p[2] * 0.8]);
      dpts.forEach(p => { const c = C3.atom(dia, "C", p, 1); targets.push({ id: "C", mesh: c }); });
      [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 6]].forEach(e => C3.link(dia, dpts[e[0]], dpts[e[1]], 1, 0x9fb9cf));
      /* graphite: two hexagonal sheets */
      for (let layer = 0; layer < 2; layer++) {
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * Math.PI * 2, p = [Math.cos(a) * 0.85, 0.55 + layer * 0.62, Math.sin(a) * 0.85];
          const c = C3.atom(gra, "C", p, 1); targets.push({ id: "C", mesh: c });
          const a2 = (i + 1) / 6 * Math.PI * 2, p2 = [Math.cos(a2) * 0.85, 0.55 + layer * 0.62, Math.sin(a2) * 0.85];
          C3.link(gra, p, p2, i % 2 === 0 ? 2 : 1, i % 2 === 0 ? 0xffc46b : 0x9fb9cf);
        }
      }
      /* C60: football cage of carbon atoms */
      for (let i = 0; i < 30; i++) {
        const t = i / 30 * Math.PI * 2, ph = Math.acos(1 - 2 * (i + 0.5) / 30), r = 0.95;
        const p = [Math.sin(ph) * Math.cos(t) * r, 0.85 + Math.cos(ph) * r, Math.sin(ph) * Math.sin(t) * r];
        const c = C3.atom(ful, "C", p, 0.82); targets.push({ id: "C", mesh: c });
      }
      const tag = C3.dynamicTag(g, 2.6, 0.42, [0, 1.36, -0.42], 48);
      const h1 = C3.railHandle(g, ctx, "form", 0, 0x4ad6ff, 0, 2, 1);
      const h2 = C3.railHandle(g, ctx, "probe", 1, 0xffc46b, 0, 100, 20);
      return C3.finish([h1, h2], targets, spin, m => {
        dia.visible = m.form === 0; gra.visible = m.form === 1; ful.visible = m.form === 2;
        tag.userData.setText(m.allotrope + " · " + m.bonds + " bonds / C");
        spin.children.forEach(gr => gr.children.forEach(o => {
          if (o.material && o.material.emissive && o.userData.element === "C")
            o.material.emissive.setHex(m.conductivity > 60 ? 0x1d6f9e : 0x000000);
        }));
      });
    }
  },

  /* 4.2 · catenation / tetravalency ----------------------------------------- */
  catenation: {
    label: "Catenation · carbon chains", icon: "⛓",
    controls: [
      { id: "n", label: "Carbon atoms in the chain", min: 1, max: 8, value: 3, unit: "" },
      { id: "branch", label: "Add a branch", min: 0, max: 1, value: 0, unit: "" }
    ],
    model(p) {
      const n = clamp(Math.round(p.n), 1, 8), branched = Math.round(p.branch) === 1;
      const h = 2 * n + 2, mass = 12 * n + h;
      return {
        n: n, formula: "C" + n + "H" + h, hydrogens: h, mass: mass,
        ccBonds: n - 1, totalBonds: 3 * n + 1, branched: branched,
        name: ["", "Methane", "Ethane", "Propane", "Butane", "Pentane", "Hexane", "Heptane", "Octane"][n],
        readouts: [ro("Carbons", n, "", n * 12.5), ro("Formula", "C" + n + "H" + h, "", n * 12.5),
          ro("Molar mass", mass, "u", mass / 1.3), ro("C–C bonds", n - 1, "", (n - 1) * 14)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.2 · TETRAVALENCY + CATENATION");
      const spin = new THREE.Group(); g.add(spin);
      const tag = C3.dynamicTag(g, 2.6, 0.42, [0, 1.36, -0.42], 48);
      let built = null;
      const h1 = C3.railHandle(g, ctx, "n", 0, 0x4ad6ff, 1, 8, 3);
      const h2 = C3.railHandle(g, ctx, "branch", 1, 0x7ee0b8, 0, 1, 0);
      return C3.finish([h1, h2], [{ id: "chain", mesh: h1.children[0] }], spin, m => {
        /* rebuild chain only when n changes (avoid per-frame allocation) */
        if (!built || built.n !== m.n || built.branch !== m.branched) {
          while (spin.children.length) spin.remove(spin.children[0]);
          const sk = C3.skeleton(spin, m.n, { branch: m.branched, y: 0.82 });
          built = { n: m.n, branch: m.branched, targets: sk.targets };
          tag.userData.setText(m.name + " · " + m.formula);
        }
      });
    }
  },

  /* 4.2.1 · saturated vs unsaturated ---------------------------------------- */
  bondorder: {
    label: "Single · double · triple bond", icon: "≡",
    controls: [
      { id: "order", label: "C–C bond order", min: 1, max: 3, value: 1, unit: "" },
      { id: "reagent", label: "Bromine water test", min: 0, max: 100, value: 20, unit: "%" }
    ],
    model(p) {
      const o = clamp(Math.round(p.order), 1, 3), names = ["", "Ethane (saturated)", "Ethene (unsaturated)", "Ethyne (unsaturated)"];
      const f = ["", "C₂H₆", "C₂H₄", "C₂H₂"], hyd = [0, 6, 4, 2];
      const decolour = o > 1 ? Math.round(p.reagent) : 0;
      return {
        order: o, name: names[o], formula: f[o], hydrogens: hyd[o],
        saturated: o === 1, reactivity: (o - 1) * 50, decolour: decolour,
        readouts: [ro("Bond order", o, "", o * 33), ro("Formula", f[o], "", o * 33),
          ro("H atoms", hyd[o], "", hyd[o] * 16), ro("Br₂ decolourised", decolour, "%", decolour)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.2.1 · SATURATED / UNSATURATED");
      const spin = new THREE.Group(); g.add(spin);
      const v = C3.vial(g, 1.35, 0xc46b3a, 0.34);
      const tag = C3.dynamicTag(g, 2.6, 0.42, [0, 1.36, -0.42], 48);
      let key = "";
      const h1 = C3.railHandle(g, ctx, "order", 0, 0x4ad6ff, 1, 3, 1);
      const h2 = C3.railHandle(g, ctx, "reagent", 1, 0x7ee0b8, 0, 100, 20);
      return C3.finish([h1, h2], [{ id: "vial", mesh: v.glass }], spin, m => {
        if (key !== m.order + "") {
          while (spin.children.length) spin.remove(spin.children[0]);
          C3.skeleton(spin, 2, { order: m.order, y: 0.86 });
          key = m.order + "";
        }
        v.liquid.material.color.setHex(m.decolour > 55 ? 0xdfeef5 : 0xc46b3a);
        v.liquid.material.emissive.setHex(m.decolour > 55 ? 0x22404f : 0x6b2f12);
        tag.userData.setText(m.name + " · " + m.formula);
      });
    }
  },

  /* 4.2.2 · isomers / rings -------------------------------------------------- */
  isomer: {
    label: "Isomers · chains & rings", icon: "⬡",
    controls: [
      { id: "shape", label: "Structure (butane · iso · cyclohexane · benzene)", min: 0, max: 3, value: 0, unit: "" },
      { id: "rotate", label: "Rotate the model", min: 0, max: 100, value: 30, unit: "%" }
    ],
    model(p) {
      const s = clamp(Math.round(p.shape), 0, 3);
      const names = ["n-Butane", "2-Methylpropane", "Cyclohexane", "Benzene"];
      const f = ["C₄H₁₀", "C₄H₁₀", "C₆H₁₂", "C₆H₆"];
      return {
        shape: s, structure: names[s], formula: f[s], isomerPair: s < 2,
        ringAtoms: s >= 2 ? 6 : 0, aromatic: s === 3,
        saturation: s === 3 ? "unsaturated" : "saturated",
        readouts: [ro("Structure", names[s], "", 25 + s * 25), ro("Formula", f[s], "", 25 + s * 25),
          ro("Same formula?", s < 2 ? "yes — C₄H₁₀" : "no", "", s < 2 ? 100 : 20),
          ro("Ring atoms", s >= 2 ? 6 : 0, "", s >= 2 ? 100 : 0)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.2.2 · ISOMERS + RINGS");
      const spin = new THREE.Group(); g.add(spin);
      const tag = C3.dynamicTag(g, 2.6, 0.42, [0, 1.36, -0.42], 46);
      let key = "";
      const h1 = C3.railHandle(g, ctx, "shape", 0, 0x4ad6ff, 0, 3, 0);
      const h2 = C3.railHandle(g, ctx, "rotate", 1, 0xffc46b, 0, 100, 30);
      return C3.finish([h1, h2], [{ id: "ring", mesh: h1.children[0] }], spin, m => {
        if (key !== m.shape + "") {
          while (spin.children.length) spin.remove(spin.children[0]);
          if (m.shape < 2) C3.skeleton(spin, 4, { branch: m.shape === 1, y: 0.84 });
          else C3.ring(spin, 6, m.shape === 3);
          key = m.shape + "";
        }
        tag.userData.setText(m.structure + " · " + m.formula);
      });
    }
  },

  /* 4.2.3 · functional groups ------------------------------------------------ */
  functional: {
    label: "Functional groups · Table 4.3", icon: "⚗",
    controls: [
      { id: "group", label: "Functional group (Cl · OH · CHO · CO · COOH)", min: 0, max: 4, value: 1, unit: "" },
      { id: "chainLen", label: "Carbon chain length", min: 2, max: 4, value: 3, unit: "" }
    ],
    model(p) {
      const gi = clamp(Math.round(p.group), 0, 4), n = clamp(Math.round(p.chainLen), 2, 4);
      const cls = ["Haloalkane", "Alcohol", "Aldehyde", "Ketone", "Carboxylic acid"];
      const hetero = ["Cl / Br", "O", "O", "O", "O"], suf = ["chloro-", "-ol", "-al", "-one", "-oic acid"];
      const stem = ["", "", "eth", "prop", "but"][n];
      const name = gi === 0 ? "Chloro" + stem + "ane" : stem + (gi === 4 ? "anoic acid" : suf[gi]);
      return {
        group: gi, className: cls[gi], hetero: hetero[gi], groupLabel: C3.GROUPS[gi].label,
        suffix: suf[gi], name: name, chain: n,
        readouts: [ro("Heteroatom", hetero[gi], "", 20 + gi * 20), ro("Group", C3.GROUPS[gi].label, "", 20 + gi * 20),
          ro("Class", cls[gi], "", 20 + gi * 20), ro("Example", name, "", n * 25)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.2.3 · FUNCTIONAL GROUPS");
      const spin = new THREE.Group(); g.add(spin);
      const tag = C3.dynamicTag(g, 2.7, 0.42, [0, 1.36, -0.42], 46);
      let key = "";
      const h1 = C3.railHandle(g, ctx, "group", 0, 0x4ad6ff, 0, 4, 1);
      const h2 = C3.railHandle(g, ctx, "chainLen", 1, 0x7ee0b8, 2, 4, 3);
      return C3.finish([h1, h2], [{ id: "group", mesh: h1.children[0] }], spin, m => {
        const k = m.group + ":" + m.chain;
        if (key !== k) {
          while (spin.children.length) spin.remove(spin.children[0]);
          C3.skeleton(spin, m.chain, { group: m.group, y: 0.84 });
          key = k;
        }
        tag.userData.setText(m.groupLabel + " → " + m.className);
      });
    }
  },

  /* 4.2.4 · homologous series ------------------------------------------------ */
  homologous: {
    label: "Homologous series · CH₂ ladder", icon: "≡",
    controls: [
      { id: "n", label: "Member number (n)", min: 1, max: 5, value: 1, unit: "" },
      { id: "series", label: "Series (alkane · alcohol · alkene)", min: 0, max: 2, value: 1, unit: "" }
    ],
    model(p) {
      const n = clamp(Math.round(p.n), 1, 5), s = clamp(Math.round(p.series), 0, 2);
      const names = ["Alkanes", "Alcohols", "Alkenes"];
      const formula = s === 0 ? "C" + n + "H" + (2 * n + 2) : s === 1 ? "C" + n + "H" + (2 * n + 1) + "OH" : "C" + n + "H" + (2 * n);
      const c = n, h = s === 0 ? 2 * n + 2 : s === 1 ? 2 * n + 2 : 2 * n;
      const mass = 12 * c + h + (s === 1 ? 16 : 0);
      return {
        n: n, series: names[s], formula: formula, mass: mass, delta: 14,
        bp: Math.round(64 + (n - 1) * 20 + s * 8),
        readouts: [ro("Member n", n, "", n * 20), ro("Formula", formula, "", n * 20),
          ro("Molar mass", mass, "u", mass / 1.3), ro("Δ per step", 14, "u", 100)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.2.4 · ACTIVITY 4.2");
      const steps = [];
      for (let i = 0; i < 5; i++) {
        const step = G3.box(g, 2.5 - i * 0.12, 0.16, 0.92, 0xe6dcc4, [0, 0.22 + i * 0.28, -0.2 + i * 0.02], { rough: 0.9 });
        const label = G3.tag(g, "CH₃OH · C₂H₅OH · C₃H₇OH · C₄H₉OH · C₅H₁₁OH", 2.0, 0.26, { pos: [0, 0.22 + i * 0.28, 0.28], size: 30, bg: "#efe6cf" });
        label.rotation.x = -Math.PI / 2;
        steps.push({ box: step, label: label });
      }
      const tag = C3.dynamicTag(g, 2.7, 0.42, [0, 1.36, -0.42], 46);
      const h1 = C3.railHandle(g, ctx, "n", 0, 0x4ad6ff, 1, 5, 1);
      const h2 = C3.railHandle(g, ctx, "series", 1, 0x7ee0b8, 0, 2, 1);
      return C3.finish([h1, h2], steps.map((s, i) => ({ id: "step" + (i + 1), mesh: s.box })), null, m => {
        steps.forEach((s, i) => {
          const on = i < m.n;
          s.box.material.color.setHex(on ? 0x7ee0b8 : 0x4a5a68);
          s.box.material.emissive.setHex(on ? 0x1d5f4a : 0x000000);
          s.box.scale.y = on ? 1.5 : 1;
        });
        tag.userData.setText(m.series + " · " + m.formula);
      });
    }
  },

  /* 4.2.5 · nomenclature ----------------------------------------------------- */
  nomenclature: {
    label: "IUPAC naming machine", icon: "Aa",
    controls: [
      { id: "n", label: "Carbon atoms (1–4)", min: 1, max: 4, value: 3, unit: "" },
      { id: "group", label: "Suffix (halo · ol · al · one · oic · ene · yne)", min: 0, max: 6, value: 3, unit: "" },
      { id: "vowelRule", label: "Apply drop-final-'e' rule", min: 0, max: 1, value: 1, unit: "" }
    ],
    model(p) {
      const n = clamp(Math.round(p.n), 1, 4), gi = clamp(Math.round(p.group), 0, 6);
      const stems = ["", "meth", "eth", "prop", "but"];
      const sufs = ["chloro", "ol", "al", "one", "oic acid", "ene", "yne"];
      const vowel = [1, 2, 3, 4].indexOf(gi) >= 0;
      const applied = Math.round(p.vowelRule) === 1;
      const base = stems[n] + "ane";
      const finalName = gi === 0 ? "Chloro" + base : gi >= 5 ? stems[n] + sufs[gi]
        : (vowel && applied ? stems[n] + sufs[gi] : base + sufs[gi]);
      const correct = gi === 0 || gi >= 5 || (vowel ? applied : !applied);
      return {
        n: n, stem: stems[n], suffix: sufs[gi], vowel: vowel, applied: applied,
        name: finalName, correct: correct ? 100 : 0,
        readouts: [ro("Chain", base, "", n * 25), ro("Suffix", "-" + sufs[gi], "", gi * 14),
          ro("Drop final 'e'", vowel ? (applied ? "yes" : "no") : "not needed", "", vowel ? (applied ? 100 : 0) : 100),
          ro("Name", finalName, "", correct ? 100 : 20)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.2.5 · NOMENCLATURE");
      const nameTag = C3.dynamicTag(g, 2.9, 0.62, [0, 1.15, -0.45], 62);
      const rule = G3.tag(g, "propane − e + one = propanone (not propaneone)\n-ene / -yne for double / triple bonds", 2.9, 0.6,
        { pos: [0, 0.12, 0.9], rot: [-Math.PI / 2, 0, 0], size: 28, bg: "#e8e0cb" });
      const spin = new THREE.Group(); g.add(spin);
      C3.skeleton(spin, 3, { y: 0.62 });
      const h1 = C3.railHandle(g, ctx, "n", 0, 0x4ad6ff, 1, 4, 3);
      const h2 = C3.railHandle(g, ctx, "group", 1, 0x7ee0b8, 0, 6, 3);
      const h3 = C3.railHandle(g, ctx, "vowelRule", 2, 0xffc46b, 0, 1, 1);
      return C3.finish([h1, h2, h3], [{ id: "chain", mesh: h1.children[0] }], spin, m => {
        nameTag.userData.setText(m.correct === 100 ? m.name : m.name + "  ✗");
        nameTag.material.color.setHex(m.correct === 100 ? 0xffffff : 0xffb0a0);
      });
    }
  },

  /* 4.3.1 · combustion ------------------------------------------------------- */
  combustion: {
    label: "Combustion · Bunsen flame", icon: "🔥",
    controls: [
      { id: "air", label: "Air / oxygen supply", min: 0, max: 100, value: 30, unit: "%" },
      { id: "fuel", label: "Fuel (0 = saturated, 1 = unsaturated)", min: 0, max: 1, value: 0, unit: "" }
    ],
    model(p) {
      const air = Math.round(p.air), unsat = Math.round(p.fuel) === 1;
      const complete = air >= 60;
      const soot = Math.round(clamp((100 - air) * 0.7 + (unsat ? 40 : 0), 0, 100));
      const clean = clamp(100 - soot, 0, 100);
      return {
        air: air, unsat: unsat, complete: complete, soot: soot, cleanliness: clean,
        flame: soot > 35 ? "yellow, sooty" : "clean blue", co2: Math.round(air / 100 * 100),
        readouts: [ro("Air supply", air, "%", air), ro("Flame", soot > 35 ? "yellow sooty" : "blue clean", "", clean),
          ro("Soot deposit", soot, "%", soot), ro("CO₂ released", Math.round(air / 100 * 100), "%", air)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.3.1 · ACTIVITY 4.3 + 4.4");
      const burner = G3.cyl(g, 0.18, 0.3, 0.75, 0x8b95a0, [0, 0.42, 0]);
      G3.box(g, 0.9, 0.06, 0.9, 0x3a4753, [0, 0.06, 0]);
      const flame = G3.mesh(g, new THREE.ConeGeometry(0.34, 1.1, 18),
        G3.mat(0x4aa8ff, { emissive: 0x1d6f9e, glow: 1.0, opacity: 0.92 }), [0, 1.28, 0]);
      const inner = G3.mesh(g, new THREE.ConeGeometry(0.16, 0.55, 14),
        G3.mat(0xbfe8ff, { emissive: 0x4aa8ff, glow: 1.4, opacity: 0.9 }), [0, 1.05, 0]);
      const sootDots = [];
      for (let i = 0; i < 14; i++) {
        const d = G3.ball(g, 0.035, 0x20242a, [0, 0, 0], { seg: 8 }); d.userData.s = i / 14; sootDots.push(d);
      }
      const plate = G3.box(g, 1.5, 0.04, 0.9, 0xb9c3c9, [0, 1.85, 0]);
      const tag = C3.dynamicTag(g, 2.7, 0.42, [0, 1.5, -0.85], 46);
      const h1 = C3.railHandle(g, ctx, "air", 0, 0x4ad6ff, 0, 100, 30);
      const h2 = C3.railHandle(g, ctx, "fuel", 1, 0xffc46b, 0, 1, 0);
      return C3.finish([h1, h2], [{ id: "burner", mesh: burner }, { id: "flame", mesh: flame }, { id: "plate", mesh: plate }], null,
        (m, dt, time) => {
          const sooty = m.soot > 35;
          flame.material.color.setHex(sooty ? 0xffa63d : 0x4aa8ff);
          flame.material.emissive.setHex(sooty ? 0x9a4b12 : 0x1d6f9e);
          inner.material.color.setHex(sooty ? 0xffe08a : 0xbfe8ff);
          flame.scale.set(1, 0.7 + m.air / 160, 1);
          sootDots.forEach(d => {
            const q = (time * 0.5 + d.userData.s) % 1;
            d.visible = sooty;
            d.position.set(Math.sin(d.userData.s * 22) * 0.28, 1.1 + q * 0.75, Math.cos(d.userData.s * 17) * 0.18);
          });
          plate.material.color.setHex(sooty ? 0x40474e : 0xb9c3c9);
          tag.userData.setText("CH₄ + 2O₂ → CO₂ + 2H₂O  ·  " + m.flame);
        });
    }
  },

  /* 4.3.2 · oxidation -------------------------------------------------------- */
  oxidation: {
    label: "Oxidation · KMnO₄ drops", icon: "◐",
    controls: [
      { id: "drops", label: "Drops of alkaline KMnO₄", min: 0, max: 10, value: 2, unit: "" },
      { id: "heat", label: "Warm the water bath", min: 0, max: 100, value: 40, unit: "%" }
    ],
    model(p) {
      const d = Math.round(p.drops), heat = Math.round(p.heat);
      const conv = clamp(d * 10 * heat / 100, 0, 100);
      const ethanol = +(Math.max(0, 3 - d * 0.3)).toFixed(1);
      return {
        drops: d, heat: heat, acid: Math.round(conv), ethanol: ethanol,
        colour: ethanol > 0 ? "decolourised" : "purple persists",
        oxidant: "alkaline KMnO₄ / acidified K₂Cr₂O₇",
        readouts: [ro("KMnO₄ drops", d, "", d * 10), ro("Ethanol left", ethanol, "mL", ethanol / 3 * 100),
          ro("Ethanoic acid", Math.round(conv), "%", conv), ro("Colour", ethanol > 0 ? "fades" : "persists", "", ethanol > 0 ? 35 : 100)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.3.2 · ACTIVITY 4.5");
      const tube = C3.vial(g, -0.65, 0x7b3fb0, 0.42);
      const dropper = G3.cyl(g, 0.07, 0.07, 0.7, G3.mat(0xdfe8ef, { opacity: 0.5 }), [-0.65, 1.32, 0]);
      const drop = G3.ball(g, 0.07, 0x7b3fb0, [-0.65, 0.92, 0], { emissive: 0x4a1f70, glow: 0.9, seg: 10 });
      const eq = G3.tag(g, "CH₃CH₂OH + 2[O] → CH₃COOH + H₂O\nalkaline KMnO₄ + heat", 2.9, 0.6,
        { pos: [0, 0.12, -0.9], rot: [-Math.PI / 2, 0, 0], size: 28, bg: "#e8e0cb" });
      const tag = C3.dynamicTag(g, 2.7, 0.42, [0, 0.34, 0.95], 46);
      const h1 = C3.railHandle(g, ctx, "drops", 0, 0x9b7fd4, 0, 10, 2);
      const h2 = C3.railHandle(g, ctx, "heat", 1, 0xff9b6b, 0, 100, 40);
      return C3.finish([h1, h2], [{ id: "tube", mesh: tube.glass }, { id: "dropper", mesh: dropper }], null,
        (m, dt, time) => {
          const purple = m.ethanol > 0 ? 0xdfeef5 : 0x7b3fb0;
          tube.liquid.material.color.setHex(purple);
          tube.liquid.material.emissive.setHex(m.ethanol > 0 ? 0x22404f : 0x4a1f70);
          drop.position.y = 0.92 - ((time * 0.7) % 1) * 0.5;
          drop.visible = m.drops > 0;
          tag.userData.setText(m.colour + " · acid " + m.acid + "%");
        });
    }
  },

  /* 4.3.3 · addition / hydrogenation ----------------------------------------- */
  hydrogenation: {
    label: "Addition · hydrogenation", icon: "＋",
    controls: [
      { id: "h2", label: "Hydrogen added", min: 0, max: 100, value: 20, unit: "%" },
      { id: "catalyst", label: "Ni / Pd catalyst", min: 0, max: 1, value: 0, unit: "" }
    ],
    model(p) {
      const cat = Math.round(p.catalyst) === 1;
      const sat = Math.round(cat ? p.h2 : p.h2 * 0.08);
      return {
        h2: Math.round(p.h2), catalyst: cat, saturation: sat,
        hAdded: sat >= 90 ? 2 : sat >= 45 ? 1 : 0,
        doubleBond: sat < 90, product: sat >= 90 ? "C₂H₆ / vanaspati ghee" : "C₂H₄ (oil)",
        readouts: [ro("H₂ supplied", Math.round(p.h2), "%", p.h2), ro("Ni catalyst", cat ? "on" : "off", "", cat ? 100 : 0),
          ro("Saturation", sat, "%", sat), ro("H atoms added", sat >= 90 ? 2 : sat >= 45 ? 1 : 0, "", sat)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.3.3 · HYDROGENATION");
      const spin = new THREE.Group(); g.add(spin);
      const ni = G3.ball(g, 0.16, 0xb9c3c9, [1.25, 0.42, 0.4], { metal: 0.7, rough: 0.3, seg: 14 });
      const oil = C3.vial(g, -1.28, 0xe0c14d, 0.34);
      const ghee = G3.box(g, 0.52, 0.38, 0.52, 0xf2ead4, [1.28, 0.28, -0.35]);
      const tag = C3.dynamicTag(g, 2.8, 0.42, [0, 1.36, -0.42], 46);
      let key = "";
      const h1 = C3.railHandle(g, ctx, "h2", 0, 0x4ad6ff, 0, 100, 20);
      const h2 = C3.railHandle(g, ctx, "catalyst", 1, 0x7ee0b8, 0, 1, 0);
      return C3.finish([h1, h2], [{ id: "Ni", mesh: ni }, { id: "oil", mesh: oil.glass }, { id: "ghee", mesh: ghee }], spin, m => {
        const k = m.doubleBond ? "double" : "single";
        if (key !== k) {
          while (spin.children.length) spin.remove(spin.children[0]);
          C3.skeleton(spin, 2, { order: m.doubleBond ? 2 : 1, y: 0.86 });
          key = k;
        }
        ni.material.emissive.setHex(m.catalyst ? 0x3f8f7f : 0x000000);
        ghee.visible = m.saturation >= 90;
        oil.liquid.visible = m.saturation < 90;
        tag.userData.setText("C₂H₄ + H₂ —Ni→ C₂H₆  ·  " + m.saturation + "%");
      });
    }
  },

  /* 4.3.4 · substitution ----------------------------------------------------- */
  substitution: {
    label: "Substitution · CH₄ + Cl₂", icon: "☀",
    controls: [
      { id: "sunlight", label: "Sunlight", min: 0, max: 100, value: 20, unit: "%" },
      { id: "cl2", label: "Chlorine molecules", min: 0, max: 4, value: 1, unit: "" }
    ],
    model(p) {
      const sun = Math.round(p.sunlight), c = clamp(Math.round(p.cl2), 0, 4);
      const subs = sun >= 50 ? c : 0;
      const prods = ["CH₄", "CH₃Cl", "CH₂Cl₂", "CHCl₃", "CCl₄"];
      return {
        sunlight: sun, cl2: c, substitutions: subs, product: prods[subs], hcl: subs,
        rate: sun >= 50 ? "very fast" : "no reaction",
        readouts: [ro("Sunlight", sun, "%", sun), ro("H replaced", subs, "", subs * 25),
          ro("Product", prods[subs], "", subs * 25), ro("HCl formed", subs, "mol", subs * 25)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.3.4 · SUBSTITUTION");
      const spin = new THREE.Group(); g.add(spin);
      const sun = G3.ball(g, 0.24, 0xffd166, [-1.35, 1.35, -0.4], { emissive: 0xffa63d, glow: 1.4, seg: 14 });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.75, 2.3, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffd88a, transparent: true, opacity: 0.1, side: THREE.DoubleSide }));
      beam.position.set(-0.8, 0.95, 0); beam.rotation.z = -0.7; g.add(beam);
      const tag = C3.dynamicTag(g, 2.8, 0.42, [0, 1.36, -0.42], 46);
      let key = "";
      const h1 = C3.railHandle(g, ctx, "sunlight", 0, 0xffd166, 0, 100, 20);
      const h2 = C3.railHandle(g, ctx, "cl2", 1, 0x6fbf63, 0, 4, 1);
      return C3.finish([h1, h2], [{ id: "sun", mesh: sun }], spin, m => {
        const k = String(m.substitutions);
        if (key !== k) {
          while (spin.children.length) spin.remove(spin.children[0]);
          const c = C3.atom(spin, "C", [0, 0.85, 0], 1.25);
          const dirs = [[0.75, 0, 0], [-0.75, 0, 0], [0, 0.7, 0], [0, -0.7, 0]];
          dirs.forEach((d, i) => {
            const p = [d[0], 0.85 + d[1], d[2]];
            const a = i < m.substitutions ? C3.atom(spin, "Cl", p, 1) : C3.atom(spin, "H", p, 1);
            C3.link(spin, [0, 0.85, 0], p, 1, 0x9fb9cf);
          });
          key = k;
        }
        sun.material.emissiveIntensity = m.sunlight / 100 * 2;
        beam.material.opacity = m.sunlight / 100 * 0.18;
        tag.userData.setText("CH₄ + Cl₂ → " + m.product + " + HCl");
      });
    }
  },

  /* 4.4.1 · ethanol ---------------------------------------------------------- */
  ethanol: {
    label: "Ethanol · sodium & 443 K", icon: "⚗",
    controls: [
      { id: "path", label: "Reaction (Na · 443 K · burn · oxidise)", min: 0, max: 3, value: 0, unit: "" },
      { id: "temp", label: "Temperature", min: 273, max: 500, value: 300, unit: "K" }
    ],
    model(p) {
      const r = clamp(Math.round(p.path), 0, 3), T = Math.round(p.temp);
      const names = ["Sodium + ethanol", "Dehydration", "Combustion", "Oxidation"];
      const products = ["C₂H₅ONa + H₂↑", T >= 443 ? "C₂H₄ + H₂O" : "no ethene yet", "CO₂ + H₂O", "CH₃COOH"];
      const gases = ["H₂", "C₂H₄", "CO₂", "—"];
      return {
        path: r, reaction: names[r], temp: T, product: products[r], gas: gases[r],
        dehydration: r === 1 && T >= 443, hydrogen: r === 0,
        readouts: [ro("Reaction", names[r], "", 25 + r * 25), ro("Temperature", T, "K", (T - 273) / 2.27),
          ro("Product", products[r], "", r * 25 + 25), ro("Gas", gases[r], "", r === 0 ? 100 : r * 30)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.4.1 · ACTIVITY 4.6");
      const tube = C3.vial(g, -0.5, 0x9fd8ff, 0.4);
      const na = G3.ball(g, 0.13, 0xb9c3c9, [0.7, 0.45, 0], { metal: 0.6, seg: 12 });
      const burn = G3.mesh(g, new THREE.ConeGeometry(0.2, 0.6, 12),
        G3.mat(0xffa63d, { emissive: 0x9a4b12, glow: 1.2, opacity: 0.9 }), [0.7, 0.85, 0]);
      const bubbles = [];
      for (let i = 0; i < 10; i++) { const b = G3.ball(g, 0.04, 0xffffff, [0, 0, 0], { emissive: 0x9ef0ff, glow: 0.9, seg: 8 }); b.userData.s = i / 10; bubbles.push(b); }
      const tag = C3.dynamicTag(g, 2.9, 0.42, [0, 1.36, -0.42], 44);
      const h1 = C3.railHandle(g, ctx, "path", 0, 0x4ad6ff, 0, 3, 0);
      const h2 = C3.railHandle(g, ctx, "temp", 1, 0xff9b6b, 273, 500, 300);
      return C3.finish([h1, h2], [{ id: "tube", mesh: tube.glass }, { id: "sodium", mesh: na }], null,
        (m, dt, time) => {
          na.visible = m.path === 0; burn.visible = m.path === 2;
          tube.liquid.material.color.setHex(m.path === 3 ? 0xbfe3d0 : 0x9fd8ff);
          bubbles.forEach(b => {
            const q = (time * 0.6 + b.userData.s) % 1;
            b.visible = m.path === 0 || m.path === 2;
            b.position.set(-0.5 + Math.sin(b.userData.s * 19) * 0.16, 0.12 + q * 0.85, Math.cos(b.userData.s * 14) * 0.12);
          });
          tag.userData.setText(m.reaction + " · " + m.product);
        });
    }
  },

  /* 4.4.2 · ethanoic acid ---------------------------------------------------- */
  ethanoic: {
    label: "Ethanoic acid · weak acid tests", icon: "◑",
    controls: [
      { id: "test", label: "Test (litmus · NaHCO₃ · NaOH · ester)", min: 0, max: 3, value: 1, unit: "" },
      { id: "ph", label: "Indicator pH", min: 0, max: 14, value: 4, unit: "" }
    ],
    model(p) {
      const t = clamp(Math.round(p.test), 0, 3), ph = +p.ph.toFixed(1);
      const names = ["Litmus / universal indicator", "NaHCO₃ / Na₂CO₃", "NaOH (base)", "Esterification"];
      const prods = ["weak acid, blue → red", "CH₃COONa + H₂O + CO₂", "CH₃COONa + H₂O", "CH₃COOC₂H₅ + H₂O"];
      const co2 = t === 1 ? 100 : 0;
      return {
        test: t, testName: names[t], ph: ph, co2: co2, product: prods[t],
        indicator: ph < 7 ? "blue litmus → red" : ph > 7 ? "red litmus → blue" : "neutral",
        strength: "weak acid (partly ionised)",
        readouts: [ro("Test", names[t], "", 25 + t * 25), ro("pH", ph, "", ph / 14 * 100),
          ro("CO₂ evolved", co2, "%", co2), ro("Product", prods[t], "", 25 + t * 25)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.4.2 · ACTIVITY 4.7 + 4.9");
      const tube = C3.vial(g, -0.65, 0xdfe8ef, 0.4);
      const lime = C3.vial(g, 0.85, 0xffffff, 0.34);
      const paper = G3.box(g, 0.1, 0.5, 0.12, 0x4a86d8, [-0.65, 0.95, 0.1]);
      const bubbles = [];
      for (let i = 0; i < 12; i++) { const b = G3.ball(g, 0.038, 0xffffff, [0, 0, 0], { emissive: 0xbfe8ff, glow: 0.8, seg: 8 }); b.userData.s = i / 12; bubbles.push(b); }
      const tag = C3.dynamicTag(g, 2.9, 0.42, [0, 1.36, -0.42], 44);
      const h1 = C3.railHandle(g, ctx, "test", 0, 0x4ad6ff, 0, 3, 1);
      const h2 = C3.railHandle(g, ctx, "ph", 1, 0xff9b8a, 0, 14, 4);
      return C3.finish([h1, h2], [{ id: "tube", mesh: tube.glass }, { id: "lime", mesh: lime.glass }, { id: "litmus", mesh: paper }], null,
        (m, dt, time) => {
          tube.liquid.material.color.setHex(m.ph < 7 ? 0xffc7bd : m.ph > 7 ? 0xbfe3d0 : 0xdfe8ef);
          paper.material.color.setHex(m.ph < 7 ? 0xd9564f : 0x4a86d8);
          lime.liquid.material.color.setHex(m.co2 ? 0xf2f2e8 : 0xdfe8ef);
          bubbles.forEach(b => {
            const q = (time * 0.7 + b.userData.s) % 1;
            b.visible = !!m.co2;
            b.position.set(-0.65 + Math.sin(b.userData.s * 25) * 0.15, 0.12 + q * 0.8, Math.cos(b.userData.s * 15) * 0.1);
          });
          tag.userData.setText(m.testName + " · " + m.product);
        });
    }
  },

  /* Esterification + saponification ------------------------------------------ */
  ester: {
    label: "Esterification · water bath", icon: "✿",
    controls: [
      { id: "heat", label: "Warm in water bath", min: 0, max: 100, value: 20, unit: "%" },
      { id: "acid", label: "Conc. H₂SO₄ catalyst", min: 0, max: 100, value: 30, unit: "%" }
    ],
    model(p) {
      const e = Math.round(p.heat * p.acid / 100), h = Math.round(p.heat);
      return {
        heat: h, catalyst: Math.round(p.acid), ester: e,
        smell: e >= 60 ? "sweet, fruity" : "pungent vinegar",
        water: e >= 60 ? "H₂O formed" : "—",
        saponification: e >= 90 ? "NaOH → ethanol + CH₃COONa (soap)" : "add NaOH to reverse",
        readouts: [ro("Water bath", h, "%", h), ro("H₂SO₄ catalyst", Math.round(p.acid), "%", p.acid),
          ro("Ester yield", e, "%", e), ro("Smell", e >= 60 ? "sweet fruity" : "vinegar", "", e)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.4.2 · ACTIVITY 4.8 / FIG 4.11");
      const bath = G3.cyl(g, 0.95, 0.95, 0.5, G3.mat(0x6fb6d8, { opacity: 0.35, rough: 0.2 }), [0, 0.34, 0]);
      const tube = G3.cyl(g, 0.2, 0.22, 0.8, G3.mat(0xdfe8ef, { opacity: 0.4, rough: 0.15 }), [0, 0.75, 0]);
      const liquid = G3.cyl(g, 0.18, 0.18, 0.34, G3.mat(0xe6d3a3, { emissive: 0x8a6a2f, glow: 0.25 }), [0, 0.52, 0]);
      const tripod = G3.torus(g, 0.72, 0.04, 0x8b95a0, [0, 0.12, 0], [Math.PI / 2, 0, 0]);
      const flame = G3.mesh(g, new THREE.ConeGeometry(0.18, 0.42, 12),
        G3.mat(0xffa63d, { emissive: 0x9a4b12, glow: 1.1 }), [0, 0.02, 0]);
      const aroma = [];
      for (let i = 0; i < 9; i++) { const b = G3.ball(g, 0.045, 0xffd166, [0, 0, 0], { emissive: 0xffa63d, glow: 1, seg: 8 }); b.userData.s = i / 9; aroma.push(b); }
      const tag = C3.dynamicTag(g, 2.9, 0.42, [0, 1.5, -0.7], 44);
      const eq = G3.tag(g, "CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O\n+ NaOH → C₂H₅OH + CH₃COONa (soap)", 3.0, 0.6,
        { pos: [0, 0.12, 0.95], rot: [-Math.PI / 2, 0, 0], size: 26, bg: "#e8e0cb" });
      const h1 = C3.railHandle(g, ctx, "heat", 0, 0xff9b6b, 0, 100, 20);
      const h2 = C3.railHandle(g, ctx, "acid", 1, 0x7ee0b8, 0, 100, 30);
      return C3.finish([h1, h2], [{ id: "bath", mesh: bath }, { id: "tube", mesh: tube }, { id: "ester", mesh: liquid }], null,
        (m, dt, time) => {
          liquid.material.color.setHex(m.ester >= 60 ? 0xf5d98a : 0xe6d3a3);
          flame.visible = m.heat > 10; flame.scale.y = 0.6 + m.heat / 140;
          aroma.forEach(b => {
            const q = (time * 0.45 + b.userData.s) % 1;
            b.visible = m.ester >= 60;
            b.position.set(Math.sin(b.userData.s * 20) * 0.35, 0.95 + q * 0.7, Math.cos(b.userData.s * 13) * 0.3);
          });
          tag.userData.setText(m.smell + " · ester " + m.ester + "%");
        });
    }
  },

  /* 4.5 · micelle / hard water ------------------------------------------------ */
  micelle: {
    label: "Micelle · soap in hard water", icon: "◎",
    controls: [
      { id: "soap", label: "Soap concentration", min: 0, max: 100, value: 40, unit: "%" },
      { id: "hardness", label: "Hard water (Ca²⁺ / Mg²⁺)", min: 0, max: 100, value: 20, unit: "%" },
      { id: "detergent", label: "Use detergent instead", min: 0, max: 1, value: 0, unit: "" }
    ],
    model(p) {
      const s = Math.round(p.soap), h = Math.round(p.hardness), det = Math.round(p.detergent) === 1;
      const micelles = Math.round(s * (det ? 1 : 1 - h / 200));
      const scum = det ? 0 : Math.round(h * s / 100);
      const foam = det ? 92 : Math.max(4, Math.round(92 - h * 0.9 - scum * 0.2));
      const cleaning = Math.round(clamp(micelles * 0.6 + foam * 0.4 - scum * 0.5, 0, 100));
      return {
        soap: s, hardness: h, detergent: det, micelles: micelles, scum: scum,
        foam: foam, cleaning: cleaning,
        readouts: [ro("Soap / detergent", s, "%", s), ro("Micelles", micelles, "%", micelles),
          ro("Foam", foam, "%", foam), ro("Scum", scum, "%", scum)]
      };
    },
    build(g, sp, ctx) {
      C3.plate(g, "§4.5 · ACTIVITY 4.10–4.12");
      const oil = G3.ball(g, 0.52, 0xd9a94a, [0, 0.88, 0], { rough: 0.5, seg: 20 });
      const spin = new THREE.Group(); spin.position.set(0, 0.88, 0); g.add(spin);
      const heads = [], tails = [];
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * Math.PI * 2, ph = (i % 3 - 1) * 0.5;
        const r = 0.62, p = [Math.cos(a) * Math.cos(ph) * r, Math.sin(ph) * r, Math.sin(a) * Math.cos(ph) * r];
        const t = C3.atom(spin, "C", [p[0] * 0.72, p[1] * 0.72, p[2] * 0.72], 0.55);
        const hd = G3.ball(spin, 0.085, 0x4ad6ff, p, { emissive: 0x1d6f9e, glow: 1.1, seg: 10 });
        C3.link(spin, [p[0] * 0.72, p[1] * 0.72, p[2] * 0.72], p, 1, 0x9fb9cf, 0.014);
        heads.push(hd); tails.push(t);
      }
      const ions = [];
      for (let i = 0; i < 8; i++) {
        const b = G3.ball(g, 0.075, 0xb0b8c0, [0, 0, 0], { seg: 8 }); b.userData.s = i / 8; ions.push(b);
      }
      const foamDots = [];
      for (let i = 0; i < 16; i++) { const b = G3.ball(g, 0.05, 0xffffff, [0, 0, 0], { emissive: 0xbfe8ff, glow: 0.6, seg: 8 }); b.userData.s = i / 16; foamDots.push(b); }
      const tag = C3.dynamicTag(g, 2.9, 0.42, [0, 1.5, -0.7], 44);
      const h1 = C3.railHandle(g, ctx, "soap", 0, 0x4ad6ff, 0, 100, 40);
      const h2 = C3.railHandle(g, ctx, "hardness", 1, 0xff9b8a, 0, 100, 20);
      const h3 = C3.railHandle(g, ctx, "detergent", 2, 0x7ee0b8, 0, 1, 0);
      return C3.finish([h1, h2, h3], [{ id: "oil", mesh: oil }].concat(heads.map((h, i) => ({ id: "head" + i, mesh: h }))), spin,
        (m, dt, time) => {
          heads.forEach((h, i) => { h.visible = i / heads.length * 100 < m.micelles; });
          tails.forEach((t, i) => { t.visible = i / tails.length * 100 < m.micelles; });
          ions.forEach(b => {
            const q = (time * 0.3 + b.userData.s) % 1;
            b.visible = m.scum > 15;
            b.position.set(Math.cos(b.userData.s * 12) * (1.1 + q * 0.4), 0.24 + q * 0.5, Math.sin(b.userData.s * 9) * 1.1);
            b.material.color.setHex(m.detergent ? 0x7ee0b8 : 0xb0b8c0);
          });
          foamDots.forEach(b => {
            const q = (time * 0.5 + b.userData.s) % 1;
            b.visible = m.foam > 20;
            b.position.set(Math.cos(b.userData.s * 17) * 1.5, 0.12 + q * 0.35, Math.sin(b.userData.s * 11) * 1.2);
            b.material.opacity = m.foam / 100;
          });
          tag.userData.setText((m.detergent ? "detergent" : "soap") + " · clean " + m.cleaning + "%");
        });
    }
  }
};

Object.assign(BLOCKS, CARBON_BLOCKS);
