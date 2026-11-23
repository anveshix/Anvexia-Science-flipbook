/* ==========================================================================
   EduVerse — 3D Pop-up Scene Block Library
   Every block = pure model(params) + procedural paper-craft 3D builder.
   The model is the single source of truth for readings, prediction answers,
   challenges and quizzes (atlas-of-physics / every-joule-style discipline).
   ========================================================================== */

const G3 = (function () {
  function mat(color, o) {
    o = o || {};
    return new THREE.MeshStandardMaterial({
      color: color, roughness: o.rough === undefined ? 0.72 : o.rough,
      metalness: o.metal === undefined ? 0.04 : o.metal,
      transparent: o.opacity !== undefined, opacity: o.opacity === undefined ? 1 : o.opacity,
      depthWrite: o.opacity === undefined,
      emissive: o.emissive === undefined ? 0x000000 : o.emissive,
      emissiveIntensity: o.glow === undefined ? 0 : o.glow,
      side: o.side || THREE.DoubleSide
    });
  }
  function mesh(parent, geo, material, pos, rot) {
    const m = new THREE.Mesh(geo, material);
    if (pos) m.position.set(pos[0], pos[1], pos[2]);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(m); return m;
  }
  function box(parent, w, h, d, color, pos, o) {
    return mesh(parent, new THREE.BoxGeometry(w, h, d), typeof color === "number" ? mat(color, o) : color, pos);
  }
  function ball(parent, r, color, pos, o) {
    return mesh(parent, new THREE.SphereGeometry(r, (o && o.seg) || 20, 14), typeof color === "number" ? mat(color, o) : color, pos);
  }
  function cyl(parent, r1, r2, h, color, pos, rot, o) {
    return mesh(parent, new THREE.CylinderGeometry(r1, r2, h, (o && o.seg) || 20), typeof color === "number" ? mat(color, o) : color, pos, rot || [0, 0, 0]);
  }
  function capsule(parent, r, len, color, pos, rot, o) {
    return mesh(parent, new THREE.CapsuleGeometry(r, len, 4, 12), typeof color === "number" ? mat(color, o) : color, pos, rot || [0, 0, 0]);
  }
  function torus(parent, r, t, color, pos, rot, o) {
    return mesh(parent, new THREE.TorusGeometry(r, t, 8, 28), typeof color === "number" ? mat(color, o) : color, pos, rot || [0, 0, 0]);
  }
  function tube(parent, pts, radius, color, o) {
    o = o || {};
    const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])));
    const m = mesh(parent, new THREE.TubeGeometry(c, o.seg || 40, radius, o.rad || 8, false), typeof color === "number" ? mat(color, o) : color);
    m.userData.curve = c; return m;
  }
  function tag(parent, text, w, h, o) {
    o = o || {};
    const c = document.createElement("canvas"); c.width = 512; c.height = Math.round(512 * h / w);
    const x = c.getContext("2d");
    x.fillStyle = o.bg || "#f7f1e2"; x.fillRect(0, 0, c.width, c.height);
    x.strokeStyle = o.border || "#8b7a5a"; x.lineWidth = 5; x.strokeRect(3, 3, c.width - 6, c.height - 6);
    x.fillStyle = o.fg || "#24303c"; x.textAlign = "center"; x.textBaseline = "middle";
    let size = o.size || 54;
    /* wrap every logical line to the card width and shrink until all lines fit */
    const fit = () => {
      x.font = "bold " + size + "px Georgia, 'Noto Sans Devanagari Embedded', serif";
      const out = [];
      String(text).split("\n").forEach(ln => {
        const words = ln.split(/\s+/); let cur = "";
        words.forEach(w => {
          const test = cur ? cur + " " + w : w;
          if (x.measureText(test).width > c.width - 34 && cur) { out.push(cur); cur = w; } else cur = test;
        });
        out.push(cur);
      });
      return out;
    };
    let lines = fit();
    while (lines.length * size * 1.18 > c.height - 22 && size > 14) { size -= 3; lines = fit(); }
    lines.forEach((ln, i) => x.fillText(ln, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * size * 1.18));
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    const m = mesh(parent, new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }), o.pos || [0, 0, 0], o.rot);
    m.userData.isTag = true; return m;
  }
  function plate(parent, w, d, color) {
    const p = box(parent, w, 0.065, d, color || 0xe9dfc7, [0, 0.03, 0], { rough: 0.92 });
    box(parent, w + 0.06, 0.02, d + 0.06, 0x8b7a5a, [0, 0.0, 0], { rough: 0.9 });
    return p;
  }
  function handle(parent, id, pos, color) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); parent.add(g);
    const h = ball(g, 0.115, 0xffffff, [0, 0, 0], { emissive: color || 0x38bdf8, glow: 1.6, seg: 16 });
    h.material.color.setHex(color || 0x38bdf8);
    torus(g, 0.16, 0.018, mat(color || 0x38bdf8, { emissive: color || 0x38bdf8, glow: 0.8 }), [0, 0, 0], [Math.PI / 2, 0, 0]);
    g.userData.controlId = id; h.userData.controlId = id;
    return g;
  }
  function rail(parent, x0, x1, y, z, color) {
    const t = tube(parent, [[x0, y, z], [(x0 + x1) / 2, y - 0.012, z], [x1, y, z]], 0.018, color || 0x9c8b6a, { seg: 12, rad: 6 });
    return t;
  }
  function seeded(n) { let s = n || 1; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  return { mat, mesh, box, ball, cyl, capsule, torus, tube, tag, plate, handle, rail, seeded, lerp, clamp };
})();

/* helper: standard readout list */
function ro(label, value, unit, pct) { return { label: label, value: value, unit: unit || "", pct: pct === undefined ? clamp(Number(value) || 0, 0, 100) : pct }; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

const BLOCKS = {
  /* ------------------------------------------------------------------ */
  particles: {
    label: "Particle chamber", icon: "◍",
    controls: [{ id: "temp", label: "Temperature", min: 0, max: 100, value: 22, unit: "°C" }],
    model(p) {
      const T = p.temp, state = T < 25 ? "solid" : T < 72 ? "liquid" : "gas";
      return { state: state, temp: T, speed: +(0.2 + T / 45).toFixed(2), pressure: +(1 + T / 50).toFixed(2), collisions: Math.round(4 + T * 0.6),
        readouts: [ro("Temperature", T, "°C", T), ro("Particle speed", (0.2 + T / 45).toFixed(2), "u/s", T), ro("Wall collisions", Math.round(4 + T * 0.6), "/s", T), ro("State", state.toUpperCase(), "", T)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      const boxGeo = new THREE.BoxGeometry(2.6, 1.25, 1.6);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), new THREE.LineBasicMaterial({ color: 0x7fb6d6, transparent: true, opacity: 0.9 }));
      edges.position.set(0, 0.7, 0); g.add(edges);
      const chamber = G3.mesh(g, new THREE.PlaneGeometry(2.5, 1.5), new THREE.MeshBasicMaterial({ color: 0x6fd3ff, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false }), [0, 0.09, 0], [-Math.PI / 2, 0, 0]);
      const rnd = G3.seeded(4242), dots = [];
      const n = (sp.scene.params && sp.scene.params.count) || 60;
      for (let i = 0; i < n; i++) {
        const d = G3.ball(g, 0.052, 0xffd166, [0, 0, 0], { emissive: 0xff9b3d, glow: 0.8, seg: 10 });
        d.userData.base = [rnd() * 2.4 - 1.2, rnd() * 1.1 + 0.12, rnd() * 1.4 - 0.7];
        d.userData.phase = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
        dots.push(d);
      }
      G3.tag(g, "PARTICLE CHAMBER", 1.7, 0.34, { pos: [0, 1.62, -0.72], size: 44, bg: "#e9e0c8" });
      G3.rail(g, -1.35, 1.35, 0.13, 1.05, 0x9c8b6a);
      const h = G3.handle(g, "temp", [-0.35, 0.16, 1.05], 0xff9b3d);
      ctx.setHandleRange("temp", -1.35, 1.35, h.position.x);
      return {
        handles: [h], clickTargets: dots.map(d => ({ id: "particles", mesh: d })),
        update(m, dt, time) {
          const sp2 = Math.max(0.1, m.temp / 40);
          dots.forEach(d => {
            const b = d.userData.base, ph = d.userData.phase;
            d.position.set(
              G3.clamp(b[0] + Math.sin(time * sp2 + ph[0]) * 0.06 * sp2, -1.2, 1.2),
              G3.clamp(b[1] + Math.cos(time * sp2 * 1.3 + ph[1]) * 0.06 * sp2, 0.1, 1.28),
              G3.clamp(b[2] + Math.sin(time * sp2 * 0.8 + ph[2]) * 0.05 * sp2, -0.7, 0.7)
            );
            const c = m.state === "solid" ? 0x9fd8ff : m.state === "liquid" ? 0x7fe3c0 : 0xffb35c;
            d.material.color.setHex(c); d.material.emissive.setHex(c);
          });
          chamber.material.opacity = 0.025 + m.temp / 3000;
        }
      };
    }
  },
  /* ------------------------------------------------------------------ */
  diffusion: {
    label: "Diffusion chambers", icon: "⇄",
    controls: [{ id: "divider", label: "Remove divider", min: 0, max: 100, value: 0, unit: "%" }, { id: "time", label: "Time", min: 0, max: 100, value: 20, unit: "s" }],
    model(p) {
      const mixing = Math.round(Math.min(100, p.divider / 100 * (p.time * 1.25)));
      return { mixing: mixing, divider: p.divider, time: p.time,
        readouts: [ro("Divider open", p.divider, "%", p.divider), ro("Time", p.time, "s", p.time), ro("Mixing", mixing, "%", mixing)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      const boxGeo = new THREE.BoxGeometry(2.9, 1.2, 1.5);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), new THREE.LineBasicMaterial({ color: 0x7fb6d6, transparent: true, opacity: 0.85 }));
      edges.position.set(0, 0.68, 0); g.add(edges);
      const wall = G3.box(g, 0.055, 1.2, 1.5, 0xd6c8a2, [0, 0.68, 0]);
      const rnd = G3.seeded(99), dots = [];
      for (let i = 0; i < 44; i++) {
        const left = i < 22;
        const d = G3.ball(g, 0.058, left ? 0x6fd3ff : 0xffa96b, [0, 0, 0], { emissive: left ? 0x2b8fc0 : 0xb35b1b, glow: 0.7, seg: 10 });
        d.userData.start = [left ? -1.3 + rnd() * 1.2 : 0.1 + rnd() * 1.2, 0.16 + rnd() * 1.0, rnd() * 1.3 - 0.65];
        d.userData.ph = rnd() * 6.28; dots.push(d);
      }
      G3.tag(g, "TWO CHAMBERS", 1.7, 0.34, { pos: [0, 1.58, -0.7], size: 46 });
      G3.rail(g, -1.35, 0.0, 0.13, 1.02); const h1 = G3.handle(g, "divider", [-1.1, 0.16, 1.02], 0x6fd3ff);
      G3.rail(g, 0.15, 1.35, 0.13, 1.02); const h2 = G3.handle(g, "time", [0.35, 0.16, 1.02], 0xffa96b);
      ctx.setHandleRange("divider", -1.35, 0.0, h1.position.x);
      ctx.setHandleRange("time", 0.15, 1.35, h2.position.x);
      return { handles: [h1, h2], clickTargets: dots.map(d => ({ id: "particles", mesh: d })),
        update(m, dt, time) {
          wall.scale.y = Math.max(0.001, 1 - m.divider / 100);
          wall.position.y = 0.68 * (1 - m.divider / 100);
          const mix = m.mixing / 100;
          dots.forEach(d => {
            const s = d.userData.start;
            const tx = mix > 0.4 ? (s[0] < 0 ? 0.15 + (s[0] + 1.3) * 0.9 : -1.3 + (s[0] - 0.1) * 0.9) : s[0];
            d.position.set(G3.lerp(s[0], tx, mix) + Math.sin(time * 1.6 + d.userData.ph) * 0.045,
              s[1] + Math.cos(time * 1.3 + d.userData.ph) * 0.05, s[2]);
          });
        }
      };
    }
  },
  /* ------------------------------------------------------------------ */
  molecule: {
    label: "Molecule builder", icon: "⚛",
    controls: [{ id: "h", label: "H atoms placed", min: 0, max: 2, value: 0, unit: "" }],
    model(p) {
      const h = Math.round(p.h), formula = h === 2 ? "H₂O" : h === 1 ? "HO" : "O";
      return { formula: formula, h: h, bonds: h,
        readouts: [ro("O atoms", 1, "", 100), ro("H atoms", h, "", h * 50), ro("Bonds formed", h, "", h * 50), ro("Formula", formula, "", h === 2 ? 100 : h * 40)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      const O = G3.ball(g, 0.36, 0xf26d5b, [0, 0.62, 0], { emissive: 0x8a2418, glow: 0.5, seg: 28 });
      G3.tag(g, "O", 0.42, 0.42, { pos: [0, 0.62, 0.37], size: 90, bg: "#f7f1e2", border: "#b04b3b" });
      const slots = [[-0.62, 0.98, 0], [0.62, 0.98, 0]];
      const rings = [], atoms = [];
      slots.forEach((s, i) => {
        const r = G3.torus(g, 0.16, 0.026, G3.mat(0x8b7a5a, { glow: 0.2 }), s, [0, 0, 0]);
        rings.push(r);
        G3.tube(g, [[0, 0.62, 0], s], 0.035, 0x9c8b6a, { seg: 10, rad: 6 });
        const a = G3.ball(g, 0.22, 0xf2f0e8, s, { emissive: 0x2a6f9e, glow: 0.35, seg: 20 });
        a.visible = false; atoms.push(a);
        G3.tag(g, "H", 0.28, 0.28, { pos: [s[0], s[1], 0.23], size: 80, bg: "#f7f1e2" });
      });
      G3.tag(g, "BUILD " + ((sp.scene.params && sp.scene.params.targetFormula) || "H₂O"), 1.9, 0.36, { pos: [0, 1.55, -0.65], size: 48 });
      G3.rail(g, -1.3, 1.3, 0.13, 1.02); const h = G3.handle(g, "h", [-1.3, 0.16, 1.02], 0x6fd3ff);
      ctx.setHandleRange("h", -1.3, 1.3, h.position.x);
      return { handles: [h], clickTargets: atoms.map((a, i) => ({ id: "atom" + i, mesh: a })).concat([{ id: "oxygen", mesh: O }]),
        update(m) { atoms.forEach((a, i) => { a.visible = i < m.h; }); rings.forEach((r, i) => { r.material.emissiveIntensity = i < m.h ? 0.9 : 0.1; }); }
      };
    }
  },
  /* ------------------------------------------------------------------ */
  reaction: {
    label: "Reaction flask", icon: "⚗",
    controls: [{ id: "coef", label: "Coefficient before H₂", min: 1, max: 4, value: 1, unit: "" }],
    model(p) {
      const c = Math.round(p.coef), bal = c === 2 ? 100 : Math.max(0, 100 - Math.abs(c - 2) * 40);
      return { balance: bal, coef: c, product: c === 2 ? "2H₂O" : "unbalanced",
        readouts: [ro("H₂ left", c * 2, "atoms", c * 25), ro("O₂ left", 2, "atoms", 100), ro("H₂O right needs", 4, "H atoms", 100), ro("Balance score", bal, "%", bal)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      const jar = G3.cyl(g, 0.52, 0.62, 0.9, G3.mat(0xb9dcea, { opacity: 0.28, rough: 0.1 }), [0, 0.55, 0]);
      const liquid = G3.cyl(g, 0.5, 0.5, 0.42, G3.mat(0x6fd3ff, { opacity: 0.75, emissive: 0x1d6f9e, glow: 0.3 }), [0, 0.28, 0]);
      const bubbles = [];
      for (let i = 0; i < 16; i++) { const b = G3.ball(g, 0.045, 0xffffff, [0, 0, 0], { emissive: 0x9ef0ff, glow: 1, seg: 8 }); b.userData.s = i / 16; bubbles.push(b); }
      const flasks = [];
      [-1.25, 1.25].forEach((x, i) => {
        const f = G3.cyl(g, 0.22, 0.3, 0.55, G3.mat(i ? 0xff9b6b : 0x8fd3ff, { opacity: 0.8, glow: 0.25, emissive: i ? 0x8a3a12 : 0x1d5f8a }), [x, 0.35, 0]);
        flasks.push(f);
        G3.tube(g, [[x, 0.62, 0], [x * 0.6, 0.9, 0], [x * 0.2, 0.82, 0]], 0.035, 0x9c8b6a, { seg: 14, rad: 6 });
      });
      const eqTag = G3.tag(g, (sp.scene.params && sp.scene.params.equation) || "H₂ + O₂ → H₂O", 2.7, 0.42, { pos: [0, 1.55, -0.62], size: 50 });
      G3.rail(g, -1.3, 1.3, 0.13, 1.02); const h = G3.handle(g, "coef", [-1.3, 0.16, 1.02], 0xffa96b);
      ctx.setHandleRange("coef", -1.3, 1.3, h.position.x);
      return { handles: [h], clickTargets: flasks.map((f, i) => ({ id: "flask" + i, mesh: f })).concat([{ id: "beaker", mesh: jar }]),
        update(m, dt, time) {
          const c = m.balance === 100 ? 0x62d6b0 : 0x6fd3ff;
          liquid.material.color.setHex(c); liquid.material.emissive.setHex(m.balance === 100 ? 0x1c7a58 : 0x1d6f9e);
          bubbles.forEach(b => { const q = (time * 0.35 + b.userData.s) % 1; b.position.set(Math.sin(b.userData.s * 20) * 0.38, 0.1 + q * 0.85, Math.cos(b.userData.s * 17) * 0.32); b.material.opacity = 0.7 * (1 - q); });
          eqTag.visible = true;
        }
      };
    }
  },
  /* ------------------------------------------------------------------ */
  ph: {
    label: "pH / neutralisation", icon: "◐",
    controls: [{ id: "acid", label: "Acid added", min: 0, max: 10, value: 8, unit: "mL" }, { id: "base", label: "Base added", min: 0, max: 10, value: 1, unit: "mL" }],
    model(p) {
      const pH = +(G3.clamp(7 + (p.base - p.acid) * 0.7, 0, 14)).toFixed(1);
      const colour = pH < 5 ? "RED" : pH < 7 ? "ORANGE" : pH > 9 ? "BLUE" : pH > 7.5 ? "GREEN-BLUE" : "GREEN";
      return { pH: pH, colour: colour, acid: p.acid, base: p.base,
        readouts: [ro("Acid added", p.acid, "mL", p.acid * 10), ro("Base added", p.base, "mL", p.base * 10), ro("pH", pH, "", pH / 14 * 100), ro("Indicator", colour, "", pH / 14 * 100)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      const tube = G3.cyl(g, 0.34, 0.34, 1.55, G3.mat(0xc8e2ef, { opacity: 0.3 }), [0, 0.85, 0]);
      const fluid = G3.cyl(g, 0.31, 0.31, 1.35, G3.mat(0x62d6b0, { opacity: 0.85, emissive: 0x1c7a58, glow: 0.4 }), [0, 0.78, 0]);
      for (let i = 0; i <= 14; i++) G3.tag(g, String(i), 0.2, 0.16, { pos: [0.46, 0.18 + i * 0.1, 0], size: 70, bg: "#f7f1e2", border: "#b9ad90" });
      G3.tag(g, "pH SCALE", 1.2, 0.3, { pos: [-1.15, 1.72, -0.5], size: 48 });
      G3.rail(g, -1.35, -0.1, 0.13, 1.04); const h1 = G3.handle(g, "acid", [-1.2, 0.16, 1.04], 0xff8a6b);
      G3.rail(g, 0.1, 1.35, 0.13, 1.04); const h2 = G3.handle(g, "base", [0.25, 0.16, 1.04], 0x6fd3ff);
      ctx.setHandleRange("acid", -1.35, -0.1, h1.position.x);
      ctx.setHandleRange("base", 0.1, 1.35, h2.position.x);
      return { handles: [h1, h2], clickTargets: [{ id: "tube", mesh: tube }],
        update(m) {
          const c = m.pH < 5 ? 0xe4584f : m.pH < 7 ? 0xf2a24c : m.pH > 9 ? 0x4d7ad6 : m.pH > 7.5 ? 0x4bb59a : 0x62d6b0;
          fluid.material.color.setHex(c); fluid.material.emissive.setHex(c);
          fluid.scale.y = 0.55 + m.pH / 14 * 0.45;
        }
      };
    }
  },
  /* ------------------------------------------------------------------ */
  cell: {
    label: "Pop-up cell", icon: "◉",
    controls: [{ id: "spin", label: "Rotate specimen", min: 0, max: 100, value: 0, unit: "°" }],
    model(p) {
      const found = Math.round(p.found || 0), spin = Math.round(p.spin);
      return { found: found, spin: spin,
        readouts: [ro("Organelles found", found, "/6", found / 6 * 100), ro("Specimen rotation", spin, "°", spin), ro("Membrane", "selectively permeable", "", 100)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      const rig = new THREE.Group(); rig.position.y = 0.85; g.add(rig);
      const neuron = sp.scene.params && sp.scene.params.mode === "neuron";
      const shell = G3.ball(rig, 0.95, 0xbfe0c8, [0, 0, 0], { opacity: 0.28, rough: 0.35, seg: 30 });
      const parts = [
        { id: "nucleus", p: [0, 0.1, 0.28], r: 0.3, c: 0xa47ad0, name: neuron ? "Cyton" : "Nucleus" },
        { id: "mito", p: [-0.55, -0.28, 0.3], r: 0.18, c: 0xf09a5b, name: neuron ? "Dendrites" : "Mitochondria" },
        { id: "er", p: [0.55, -0.25, 0.28], r: 0.2, c: 0xe2c46c, name: neuron ? "Axon" : "Endoplasmic reticulum" },
        { id: "golgi", p: [0.02, -0.6, 0.35], r: 0.17, c: 0x6bb7d8, name: neuron ? "Myelin" : "Golgi apparatus" },
        { id: "vacuole", p: [-0.15, 0.6, 0.2], r: 0.19, c: 0x8fd8c0, name: neuron ? "Node of Ranvier" : "Vacuole" },
        { id: "membrane", p: [0.68, 0.48, 0.05], r: 0.16, c: 0x7fc4a0, name: neuron ? "Synapse" : "Plasma membrane" }
      ];
      const meshes = [];
      parts.forEach(pt => {
        const m = G3.ball(rig, pt.r, pt.c, pt.p, { emissive: pt.c, glow: 0.35, seg: 20 });
        m.userData.partId = pt.id; m.userData.partName = pt.name; meshes.push(m);
      });
      G3.tag(g, neuron ? "NEURON · TOUCH 6 PARTS" : "ANIMAL CELL · TOUCH 6 PARTS", 2.5, 0.34, { pos: [0, 1.95, -0.62], size: 42 });
      G3.rail(g, -1.3, 1.3, 0.13, 1.04); const h = G3.handle(g, "spin", [-1.3, 0.16, 1.04], 0x8fd8c0);
      ctx.setHandleRange("spin", -1.3, 1.3, h.position.x);
      return { handles: [h], clickTargets: meshes.map(m => ({ id: m.userData.partId, mesh: m, label: m.userData.partName })).concat([{ id: "cellBody", mesh: shell, label: "Cytoplasm" }]),
        update(m) { rig.rotation.y = m.spin / 100 * Math.PI * 2; }
      };
    }
  },
  /* ------------------------------------------------------------------ */
  osmosis: {
    label: "Osmosis U-tube", icon: "∪",
    controls: [{ id: "conc", label: "Solute concentration", min: 0, max: 10, value: 0, unit: "g" }],
    model(p) {
      const c = p.conc, left = +(0.5 + c * 0.15).toFixed(2), right = +(2.0 - c * 0.15).toFixed(2);
      const diff = +Math.abs(left - right).toFixed(2);
      return { difference: diff, left: left, right: right, conc: c,
        readouts: [ro("Left level", left, "cm", left / 2.2 * 100), ro("Right level", right, "cm", right / 2.2 * 100), ro("Level difference", diff, "cm", diff / 1.5 * 100)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      G3.tube(g, [[-0.8, 1.5, 0], [-0.8, 0.35, 0], [-0.5, 0.12, 0], [0.5, 0.12, 0], [0.8, 0.35, 0], [0.8, 1.5, 0]], 0.13, G3.mat(0xb9dcea, { opacity: 0.28 }), { seg: 48, rad: 12 });
      const L = G3.cyl(g, 0.115, 0.115, 1, G3.mat(0x6fd3ff, { emissive: 0x1d6f9e, glow: 0.35, opacity: 0.85 }), [-0.8, 0.6, 0]);
      const R = G3.cyl(g, 0.115, 0.115, 1, G3.mat(0xffb27a, { emissive: 0x8a4a12, glow: 0.35, opacity: 0.85 }), [0.8, 0.6, 0]);
      const membrane = G3.box(g, 0.06, 0.36, 0.36, G3.mat(0xe3d6b4, { opacity: 0.9 }), [0, 0.22, 0]);
      G3.tag(g, "SEMI-PERMEABLE MEMBRANE", 2.3, 0.3, { pos: [0, 1.85, -0.6], size: 38 });
      G3.rail(g, -1.3, 1.3, 0.13, 1.04); const h = G3.handle(g, "conc", [-1.3, 0.16, 1.04], 0x6fd3ff);
      ctx.setHandleRange("conc", -1.3, 1.3, h.position.x);
      return { handles: [h], clickTargets: [{ id: "membrane", mesh: membrane, label: "Membrane" }, { id: "left", mesh: L, label: "Dilute side" }],
        update(m) {
          L.scale.y = m.left / 2; L.position.y = 0.12 + m.left / 2 * 0.5;
          R.scale.y = m.right / 2; R.position.y = 0.12 + m.right / 2 * 0.5;
        }
      };
    }
  },
  /* ------------------------------------------------------------------ */
  photosynthesis: {
    label: "Leaf & lamp", icon: "☀",
    controls: [{ id: "light", label: "Light intensity", min: 0, max: 100, value: 10, unit: "%" }],
    model(p) {
      const rate = Math.round(100 * (1 - Math.exp(-p.light / 28)));
      return { rate: rate, light: p.light, bubbles: Math.round(rate / 8),
        readouts: [ro("Light", p.light, "%", p.light), ro("O₂ bubbles", Math.round(rate / 8), "/s", rate), ro("Photosynthesis rate", rate, "%", rate)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      const leaf = G3.ball(g, 0.75, 0x62b56a, [0, 0.55, 0], { rough: 0.8, seg: 24 });
      leaf.scale.set(1.35, 0.16, 0.8);
      G3.tube(g, [[-0.95, 0.55, 0], [0, 0.57, 0], [0.95, 0.55, 0]], 0.025, 0x2f6b3a, { seg: 12, rad: 6 });
      const lamp = G3.ball(g, 0.28, 0xffe08a, [0, 1.7, -0.3], { emissive: 0xffc23c, glow: 2, seg: 20 });
      const light = new THREE.PointLight(0xffd27a, 1.6, 8); light.position.set(0, 1.7, 0); g.add(light);
      G3.tube(g, [[0, 1.5, -0.3], [0, 2.1, -0.3], [-0.5, 2.1, -0.3]], 0.035, 0x9c8b6a, { seg: 14, rad: 6 });
      const bubbles = [];
      for (let i = 0; i < 22; i++) { const b = G3.ball(g, 0.05, 0xffffff, [0, 0, 0], { emissive: 0x9ef0ff, glow: 1, seg: 8 }); b.userData.s = i / 22; bubbles.push(b); }
      G3.tag(g, "LIGHT SATURATION", 1.9, 0.34, { pos: [0, 2.35, -0.6], size: 44 });
      G3.rail(g, -1.3, 1.3, 0.13, 1.04); const h = G3.handle(g, "light", [-1.1, 0.16, 1.04], 0xffc23c);
      ctx.setHandleRange("light", -1.3, 1.3, h.position.x);
      return { handles: [h], clickTargets: [{ id: "leaf", mesh: leaf, label: "Leaf / chloroplast" }, { id: "lamp", mesh: lamp, label: "Light source" }],
        update(m, dt, time) {
          lamp.material.emissiveIntensity = 0.5 + m.light / 45; light.intensity = 0.4 + m.light / 40;
          lamp.position.y = 1.9 - m.light / 100 * 0.55;
          bubbles.forEach(b => { const q = (time * (0.2 + m.rate / 150) + b.userData.s) % 1; b.visible = b.userData.s < m.rate / 100; b.position.set(Math.sin(b.userData.s * 30) * 0.7, 0.6 + q * 1.2, Math.cos(b.userData.s * 24) * 0.4); });
        }
      };
    }
  },
  /* ------------------------------------------------------------------ */
  flow: {
    label: "Process pipeline", icon: "→",
    controls: [{ id: "speed", label: "Signal speed", min: 0, max: 100, value: 45, unit: "%" }],
    model(p) {
      const visited = Math.round(p.visited || 0), pos = Math.round(p.tokenPos || 0);
      return { visited: visited, token: pos, speed: Math.round(p.speed),
        readouts: [ro("Token position", pos, "%", pos), ro("Stations visited", visited, "/5", visited / 5 * 100), ro("Signal speed", Math.round(p.speed), "%", p.speed)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      const steps = (sp.scene.params && sp.scene.params.steps) || ["Receptor", "Sensory neuron", "Interneuron", "Motor neuron", "Effector"];
      const n = steps.length, nodes = [], xs = [];
      for (let i = 0; i < n; i++) {
        const x = -1.45 + i * (2.9 / Math.max(1, n - 1)); xs.push(x);
        const base = G3.cyl(g, 0.28, 0.28, 0.09, G3.mat(0xe3d6b4, { rough: 0.9 }), [x, 0.14, 0]);
        base.userData.stepId = i; nodes.push(base);
        G3.tag(g, steps[i], 0.85, 0.28, { pos: [x, 0.5, 0.05], size: 44 });
      }
      const path = [];
      for (let i = 0; i < n - 1; i++) { path.push([xs[i], 0.3, -0.25]); path.push([(xs[i] + xs[i + 1]) / 2, 0.55, -0.25]); path.push([xs[i + 1], 0.3, -0.25]); }
      const curveMesh = G3.tube(g, path.length ? path : [[-1, 0.3, 0], [1, 0.3, 0]], 0.035, 0x9c8b6a, { seg: 60, rad: 8 });
      const token = G3.ball(g, 0.13, 0xffffff, [xs[0], 0.42, -0.25], { emissive: 0x7ef7ff, glow: 2, seg: 14 });
      G3.tag(g, "PROCESS PIPELINE", 2.1, 0.34, { pos: [0, 1.5, -0.65], size: 46 });
      G3.rail(g, -1.3, 1.3, 0.13, 1.04); const h = G3.handle(g, "speed", [-0.4, 0.16, 1.04], 0x7ef7ff);
      ctx.setHandleRange("speed", -1.3, 1.3, h.position.x);
      const cv = curveMesh.userData.curve;
      return { handles: [h], clickTargets: nodes.map((b, i) => ({ id: "step" + i, mesh: b, label: steps[i] })),
        update(m, dt, time) {
          const u = (time * (0.05 + m.speed / 400)) % 1;
          const pt = cv.getPointAt(Math.min(0.999, u)); token.position.copy(pt); token.position.y += 0.1;
          nodes.forEach((b, i) => { b.material.emissive.setHex(i <= Math.floor(u * n) ? 0x2b8fc0 : 0x000000); b.material.emissiveIntensity = i <= Math.floor(u * n) ? 0.7 : 0; });
        }
      };
    }
  },
  /* ------------------------------------------------------------------ */
  stack: {
    label: "Folded layers", icon: "▤",
    controls: [{ id: "open", label: "Open layers", min: 0, max: 100, value: 0, unit: "%" }],
    model(p) {
      const lv = (p.levelsCount || 4), opened = Math.round(p.opened || p.open / 100 * lv);
      return { opened: opened, open: Math.round(p.open),
        readouts: [ro("Layers opened", opened, "/" + lv, opened / lv * 100), ro("Fold progress", Math.round(p.open), "%", p.open)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      const levels = (sp.scene.params && sp.scene.params.levels) || ["CELL", "TISSUE", "ORGAN", "SYSTEM"];
      const panels = [];
      levels.forEach((lv, i) => {
        const grp = new THREE.Group(); grp.position.set(0, 0.1 + i * 0.12, -0.45 + i * 0.28); g.add(grp);
        const p = G3.box(grp, 2.3, 0.055, 0.75, G3.mat(i % 2 ? 0xd9e6c8 : 0xe8ddc2, { rough: 0.92 }), [0, 0, 0]);
        p.userData.layerId = i; panels.push(grp);
        G3.tag(grp, lv, 1.5, 0.4, { pos: [0, 0.04, 0], rot: [-Math.PI / 2, 0, 0], size: 60 });
      });
      G3.tag(g, "LEVELS OF ORGANISATION", 2.4, 0.34, { pos: [0, 1.6, -0.65], size: 42 });
      G3.rail(g, -1.3, 1.3, 0.13, 1.04); const h = G3.handle(g, "open", [-1.3, 0.16, 1.04], 0x8fd8c0);
      ctx.setHandleRange("open", -1.3, 1.3, h.position.x);
      return { handles: [h], clickTargets: panels.map((p, i) => ({ id: "layer" + i, mesh: p.children[0], label: levels[i] })),
        update(m) {
          const f = m.open / 100;
          panels.forEach((p, i) => { p.rotation.x = -f * (i % 2 ? -0.9 : 0.9); p.position.y = 0.1 + i * 0.12 + f * i * 0.18; });
        }
      };
    }
  },
  /* ------------------------------------------------------------------ */
  plot: {
    label: "Standing graph", icon: "∿",
    controls: [{ id: "x", label: (sp) => "X value", min: 0, max: 100, value: 30, unit: "" }],
    model(p) {
      const x = Math.round(p.x), y = Math.round(100 / (1 + Math.exp(-(x - 50) / 12)));
      return { rate: x, x: x, y: y,
        readouts: [ro("X (drag)", x, "", x), ro("Curve value", y, "%", y), ro("Model rate", x, "%", x)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      const panel = G3.box(g, 2.6, 1.55, 0.07, G3.mat(0xf4eedc, { rough: 0.95 }), [0, 0.9, -0.45]);
      panel.rotation.x = -0.1;
      for (let i = 1; i < 6; i++) G3.box(g, 2.55, 0.008, 0.075, 0xd8cdb2, [0, 0.16 + i * 0.25, -0.4]);
      const pts = [];
      for (let i = 0; i <= 40; i++) { const x = -1.2 + i * 0.06; const y = 0.18 + (100 / (1 + Math.exp(-(i * 2.5 - 50) / 12))) / 100 * 1.35; pts.push([x, y, -0.38]); }
      G3.tube(g, pts, 0.025, 0x2f7fb8, { seg: 80, rad: 6 });
      const marker = G3.ball(g, 0.09, 0xffffff, [-0.5, 0.6, -0.32], { emissive: 0xff9b3d, glow: 1.5, seg: 14 });
      G3.tag(g, (sp.scene.params && sp.scene.params.yLabel) || "RATE", 1.4, 0.3, { pos: [-0.85, 1.78, -0.5], size: 46 });
      G3.rail(g, -1.3, 1.3, 0.13, 1.04); const h = G3.handle(g, "x", [-0.75, 0.16, 1.04], 0xff9b3d);
      ctx.setHandleRange("x", -1.3, 1.3, h.position.x);
      return { handles: [h], clickTargets: [{ id: "curve", mesh: panel, label: "Graph panel" }],
        update(m) { marker.position.set(-1.2 + m.x / 100 * 2.4, 0.18 + m.y / 100 * 1.35, -0.32); }
      };
    }
  },
  /* ------------------------------------------------------------------ */
  race: {
    label: "Comparison jars", icon: "⇅",
    controls: [{ id: "time", label: "Clock", min: 0, max: 100, value: 0, unit: "s" }],
    model(p) {
      const a = Math.round(p.time), b = Math.round(p.time * 0.55);
      return { progress: a, jarA: a, jarB: b,
        readouts: [ro("Clock", a, "s", a), ro("Jar A (gas)", a, "%", a), ro("Jar B (liquid)", b, "%", b)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      const jars = [];
      [-0.75, 0.75].forEach((x, i) => {
        G3.cyl(g, 0.42, 0.42, 1.2, G3.mat(0xb9dcea, { opacity: 0.25 }), [x, 0.72, 0]);
        const f = G3.cyl(g, 0.39, 0.39, 1, G3.mat(i ? 0x6fd3ff : 0xffb27a, { opacity: 0.8, emissive: i ? 0x1d6f9e : 0x8a4a12, glow: 0.3 }), [x, 0.42, 0]);
        jars.push(f);
        G3.tag(g, i ? "GAS" : "LIQUID", 0.9, 0.28, { pos: [x, 1.55, -0.3], size: 52 });
      });
      G3.rail(g, -1.3, 1.3, 0.13, 1.04); const h = G3.handle(g, "time", [-1.3, 0.16, 1.04], 0xff9b3d);
      ctx.setHandleRange("time", -1.3, 1.3, h.position.x);
      return { handles: [h], clickTargets: jars.map((j, i) => ({ id: "jar" + i, mesh: j, label: i ? "Gas jar" : "Liquid jar" })),
        update(m) {
          jars[0].scale.y = Math.max(0.001, m.jarA / 100); jars[0].position.y = 0.12 + m.jarA / 200;
          jars[1].scale.y = Math.max(0.001, m.jarB / 100); jars[1].position.y = 0.12 + m.jarB / 200;
        }
      };
    }
  },
  /* ------------------------------------------------------------------ */
  showcase: {
    label: "Specimen turntable", icon: "◈",
    controls: [{ id: "spin", label: "Rotate specimens", min: 0, max: 100, value: 10, unit: "°" }],
    model(p) {
      const found = Math.round(p.found || 0);
      return { found: found, spin: Math.round(p.spin),
        readouts: [ro("Specimens inspected", found, "/3", found / 3 * 100), ro("Turntable", Math.round(p.spin), "°", p.spin)] };
    },
    build(g, sp, ctx) {
      G3.plate(g, 3.5, 2.4);
      const rig = new THREE.Group(); rig.position.y = 0.5; g.add(rig);
      const shapes = [];
      [-1, 0, 1].forEach((x, i) => {
        const grp = new THREE.Group(); grp.position.set(x * 0.95, 0, 0); rig.add(grp);
        let m;
        if (i === 0) m = G3.ball(grp, 0.32, 0x6fd3ff, [0, 0.35, 0], { emissive: 0x1d6f9e, glow: 0.5, seg: 24 });
        else if (i === 1) { m = G3.cyl(grp, 0.26, 0.26, 0.7, 0xffb27a, [0, 0.4, 0]); }
        else { m = G3.box(grp, 0.5, 0.5, 0.5, 0xa47ad0, [0, 0.35, 0]); }
        m.userData.specId = i; shapes.push(m);
        G3.cyl(grp, 0.38, 0.38, 0.07, 0xd9cbaa, [0, 0.04, 0]);
      });
      G3.tag(g, "SPECIMENS · CLICK TO INSPECT", 2.6, 0.34, { pos: [0, 1.5, -0.65], size: 40 });
      G3.rail(g, -1.3, 1.3, 0.13, 1.04); const h = G3.handle(g, "spin", [-0.4, 0.16, 1.04], 0xa47ad0);
      ctx.setHandleRange("spin", -1.3, 1.3, h.position.x);
      return { handles: [h], clickTargets: shapes.map((m, i) => ({ id: "spec" + i, mesh: m, label: "Specimen " + (i + 1) })),
        update(m, dt, time) { rig.rotation.y = m.spin / 100 * Math.PI * 2 + Math.sin(time * 0.3) * 0.08; }
      };
    }
  }
};

function blockControls(block, sp) {
  /* A block may declare static controls OR a pure function of the spread.
     The generated CBSE 2026-27 chapter packs each carry their own lab controls. */
  const defs = typeof block.controls === "function" ? block.controls(sp)
    : (block.controls || []);
  return defs.map(c => Object.assign({}, c, {
    label: typeof c.label === "function" ? c.label(sp) : c.label,
    id: c.id
  }));
}
function defaultParams(sp) {
  const b = BLOCKS[sp.scene.type] || BLOCKS.showcase, out = { found: 0, visited: 0, opened: 0, levelsCount: (sp.scene.params && sp.scene.params.levels ? sp.scene.params.levels.length : 4), tokenPos: 0 };
  blockControls(b, sp).forEach(c => { out[c.id] = c.value; });
  return out;
}
function evalModel(sp, params) {
  const b = BLOCKS[sp.scene.type] || BLOCKS.showcase;
  /* second argument is the spread; legacy models simply ignore it */
  return b.model(Object.assign({}, params), sp);
}
function checkChallenge(sp, m, stamps) {
  const ch = sp.challenge;
  if (!ch || !ch.target) return false;
  const tg = ch.target, v = m[tg.key];
  if (v === undefined) return false;
  switch (tg.op) {
    case "gte": return Number(v) >= Number(tg.value);
    case "lte": return Number(v) <= Number(tg.value);
    case "near": return Math.abs(Number(v) - Number(tg.value)) <= (tg.tol || 0.3);
    case "eq": return String(v) === String(tg.value);
    default: return String(v) === String(tg.value);
  }
}
