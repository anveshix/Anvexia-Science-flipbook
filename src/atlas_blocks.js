/* ==========================================================================
   EduVerse — Universal declarative figure engine ("A3")
   One engine, every subject: a spread declares WHAT to draw (fig) and HOW it
   behaves (controls + readouts expressions). The renderer owns no chapter
   names. This is the saxster/atlas "one figure engine for any subject" idea,
   kept offline and projector-safe (everything lies flat in the X-Z plane).

   Pure model ≠ world: atlasModel(params, sp) is the single source of truth for
   the dock readouts, the 3D highlight, precision 2D, challenge and quiz.
   © 2026 Paras Pranav — EduVerse
   ========================================================================== */

const ATLAS_KINDS = ["flow", "cycle", "tree", "bars", "graph", "layers",
  "rays", "circuit", "molecule", "cell", "wave", "field", "machine", "table"];

/* --- tiny safe arithmetic evaluator (no eval, no network) ---------------- */
function A3eval(expr, vars) {
  const src = String(expr || "0");
  const tok = [], re = /\s*(<=|>=|==|[A-Za-z_][A-Za-z_0-9]*|\d+(?:\.\d+)?|[+\-*/^(),<>%])/g;
  let m, pos = 0;
  while ((m = re.exec(src))) {
    if (m.index !== pos) throw new Error("bad expr " + src);
    tok.push(m[1]); pos = re.lastIndex;
  }
  if (pos !== src.length) throw new Error("bad expr " + src);
  let i = 0;
  const peek = () => tok[i], take = () => tok[i++];
  const num = v => (typeof v === "number" ? v : (vars[v] !== undefined ? Number(vars[v]) : 0));
  function primary() {
    const t = take();
    if (t === undefined) return 0;
    if (t === "(") { const v = compare(); if (take() !== ")") throw new Error("paren"); return v; }
    if (t === "-") return -primary();
    if (t === "+") return primary();
    if (/^\d/.test(t)) return parseFloat(t);
    if (tok[i] === "(") {
      take(); const args = [];
      if (peek() !== ")") { args.push(sum()); while (peek() === ",") { take(); args.push(sum()); } }
      if (take() !== ")") throw new Error("call");
      const a = args[0] || 0, b = args[1] || 0;
      if (t === "sqrt") return Math.sqrt(Math.max(0, a));
      if (t === "abs") return Math.abs(a);
      if (t === "min") return Math.min(a, b);
      if (t === "max") return Math.max(a, b);
      if (t === "round") return Math.round(a);
      if (t === "pow") return Math.pow(a, b);
      if (t === "sin") return Math.sin(a);
      if (t === "cos") return Math.cos(a);
      return 0;
    }
    return num(t);
  }
  function power() {
    let v = primary();
    while (peek() === "^") { take(); v = Math.pow(v, power()); }
    return v;
  }
  function product() {
    let v = power();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const o = take(), r = power();
      v = o === "*" ? v * r : (o === "%" ? (r === 0 ? 0 : v % r) : (r === 0 ? 0 : v / r));
    }
    return v;
  }
  function sum() {
    let v = product();
    while (peek() === "+" || peek() === "-") { const o = take(), r = product(); v = o === "+" ? v + r : v - r; }
    return v;
  }
  function compare() {
    let v = sum();
    while (["<", ">", "<=", ">=", "=="].indexOf(peek()) >= 0) {
      const o = take(), r = sum();
      v = o === "<" ? (v < r ? 1 : 0) : o === ">" ? (v > r ? 1 : 0)
        : o === "<=" ? (v <= r ? 1 : 0) : o === ">=" ? (v >= r ? 1 : 0) : (v === r ? 1 : 0);
    }
    return v;
  }
  try { const out = compare(); return isFinite(out) ? out : 0; } catch (e) { return 0; }
}

function atlasModel(params, sp) {
  const scene = (sp && sp.scene) || {}, controls = scene.controls || [], specs = scene.readouts || [];
  const vars = Object.assign({}, params);
  const maxVars = Object.assign({}, params);
  controls.forEach(c => { maxVars[c.id] = c.max; });
  const labels = (scene.fig && scene.fig.labels) || [];
  const readouts = specs.map((r, k) => {
    const v = A3eval(r.expr, vars), mx = Math.abs(A3eval(r.expr, maxVars)) || 1;
    const pct = Math.max(2, Math.min(100, Math.abs(v) / mx * 100));
    const dec = Math.abs(v) < 10 && Math.abs(v % 1) > 0.001 ? 2 : (Math.abs(v) < 100 ? 1 : 0);
    const lab = r.labelHi && typeof BI === "function" ? BI(r.label, r.labelHi) : r.label;
    return { label: lab, value: String(+v.toFixed(dec)), unit: r.unit || "", pct: pct };
  });
  const out = { readouts: readouts, labels: labels, kind: (scene.fig || {}).kind || "flow" };
  readouts.forEach((r, k) => { out["r" + k] = parseFloat(r.value) || 0; });
  const first = controls[0];
  out.active = first && labels.length ? Math.round((Number(params[first.id]) - first.min) /
    (first.max - first.min || 1) * (labels.length - 1)) : 0;
  out.active = Math.max(0, Math.min(labels.length - 1, out.active));
  out.t = first ? (Number(params[first.id]) - first.min) / (first.max - first.min || 1) : 0.5;
  out.k = labels.length || 1;
  return out;
}

/* --- flat paper-craft vocabulary ------------------------------------------ */
const A3 = (function () {
  const Y = 0.17;
  const C = { ink: 0x26333f, paper: 0xe9dfc5, cyan: 0x4ad6ff, green: 0x7ee0b8,
    amber: 0xffc46b, red: 0xff9b8a, blue: 0x5d8ad6, purple: 0xa878c8, white: 0xf7f1e2 };
  const palette = [C.cyan, C.green, C.amber, C.blue, C.purple, C.red];
  const col = i => palette[i % palette.length];

  function slab(parent, w, d, color, x, z, h) {
    return G3.box(parent, w, h || 0.045, d, G3.mat(color, { rough: 0.92 }), [x, Y, z]);
  }
  function disc(parent, r, color, x, z, h) {
    return G3.cyl(parent, r, r, h || 0.06, G3.mat(color, { rough: 0.85 }), [x, Y, z]);
  }
  function ball(parent, r, color, x, z) {
    return G3.ball(parent, r, G3.mat(color, { rough: 0.6 }), [x, Y + r * 0.2, z]);
  }
  function line(parent, a, b, color, w) {
    return G3.tube(parent, [[a[0], Y + 0.012, a[1]], [b[0], Y + 0.012, b[1]]],
      w || 0.018, G3.mat(color, { rough: 0.7 }), { seg: 2, rad: 5 });
  }
  function arrow(parent, a, b, color) {
    line(parent, a, b, color, 0.02);
    ball(parent, 0.045, color, b[0], b[1]);
  }
  function tag(parent, text, x, z, w, h, i) {
    return G3.tag(parent, String(text), w || 0.92, h || 0.34, {
      pos: [x, Y + 0.035, z], rot: [-Math.PI / 2, 0, 0], size: 44,
      bg: "#f7f1e2", border: "#8b7a5a", fg: "#24303c"
    });
  }
  function active(model, i) { return model && model.active === i; }

  function build(parent, sp, ctx) {
    const scene = sp.scene || {}, fig = scene.fig || {};
    const kind = ATLAS_KINDS.indexOf(fig.kind) >= 0 ? fig.kind : "flow";
    const L = (fig.labels || ["Step 1", "Step 2", "Step 3"]).slice(0, 8);
    const E = fig.edges || [];
    const model = atlasModel(defaultParams(sp), sp);
    const clickTargets = [], handles = [];
    const controls = scene.controls || [];

    /* paper backdrop (hidden in board shot by tunePopupForBoard) */
    slab(parent, 3.2, 2.15, 0xd9ceb2, 0, 0, 0.02);

    const n = L.length;
    const xs = i => (i - (n - 1) / 2) * (2.7 / Math.max(1, n - 1));
    const row = (i, rows) => {
      const perRow = Math.ceil(n / rows), r = Math.floor(i / perRow), c = i % perRow;
      const cnt = Math.min(perRow, n - r * perRow);
      return [(c - (cnt - 1) / 2) * (2.7 / Math.max(1, cnt - 1)), (r - (rows - 1) / 2) * 0.78];
    };

    if (kind === "flow" || kind === "table") {
      const rows = n > 4 ? 2 : 1;
      L.forEach((lab, i) => {
        const [x, z] = n > 4 ? row(i, rows) : [xs(i), 0];
        slab(parent, 0.92, 0.5, active(model, i) ? C.amber : col(i), x, z, 0.075);
        tag(parent, lab, x, z, 0.92, 0.34, i);
        if (i && kind === "flow" && n <= 4) {
          const [px] = [xs(i - 1)]; arrow(parent, [px + 0.5, 0], [x - 0.5, 0], C.ink);
        }
      });
    } else if (kind === "cycle") {
      L.forEach((lab, i) => {
        const a = i / n * Math.PI * 2 - Math.PI / 2, x = Math.cos(a) * 1.15, z = Math.sin(a) * 0.78;
        disc(parent, 0.42, active(model, i) ? C.amber : col(i), x, z);
        tag(parent, lab, x, z, 0.86, 0.3, i);
        const a2 = (i + 1) / n * Math.PI * 2 - Math.PI / 2;
        arrow(parent, [x, z], [Math.cos(a2) * 1.15, Math.sin(a2) * 0.78], C.ink);
      });
    } else if (kind === "tree") {
      const [rx, rz] = [0, -0.72];
      slab(parent, 1.25, 0.42, C.cyan, rx, rz, 0.075); tag(parent, L[0], rx, rz, 1.25, 0.34, 0);
      L.slice(1).forEach((lab, j) => {
        const x = (j - (n - 2) / 2) * (2.6 / Math.max(1, n - 2)), z = 0.62;
        slab(parent, 0.82, 0.42, active(model, j + 1) ? C.amber : col(j + 1), x, z, 0.07);
        tag(parent, lab, x, z, 0.82, 0.32, j + 1);
        line(parent, [rx, rz + 0.22], [x, z - 0.22], C.ink);
      });
    } else if (kind === "bars" || kind === "graph") {
      line(parent, [-1.45, 0.82], [-1.45, -0.82], C.ink, 0.022);
      line(parent, [-1.45, 0.82], [1.45, 0.82], C.ink, 0.022);
      if (kind === "bars") {
        L.forEach((lab, i) => {
          const x = xs(i), h = 0.28 + (i % 3) * 0.22 + model.t * 0.42;
          slab(parent, 0.34, h, active(model, i) ? C.amber : col(i), x, 0.82 - h / 2, 0.06);
          tag(parent, lab, x, 1.0, 0.8, 0.28, i);
        });
      } else {
        const pts = [];
        for (let i = 0; i < n; i++) pts.push([xs(i), 0.72 - (0.25 + (i / Math.max(1, n - 1)) * 1.1) * (0.5 + model.t)]);
        for (let i = 1; i < pts.length; i++) line(parent, pts[i - 1], pts[i], C.cyan, 0.028);
        pts.forEach((p, i) => { ball(parent, 0.06, active(model, i) ? C.amber : C.cyan, p[0], p[1]); tag(parent, L[i], p[0], 1.0, 0.8, 0.26, i); });
      }
    } else if (kind === "layers" || kind === "wave" || kind === "field" || kind === "rays") {
      if (kind === "layers") {
        L.forEach((lab, i) => {
          const z = -0.8 + i * (1.6 / Math.max(1, n - 1));
          slab(parent, 2.7, 1.6 / n * 0.82, active(model, i) ? C.amber : col(i), 0, z, 0.06);
          tag(parent, lab, 0, z, 1.35, 0.26, i);
        });
      } else if (kind === "wave") {
        line(parent, [-1.45, 0], [1.45, 0], C.ink, 0.02);
        const pts = [], amp = 0.22 + model.t * 0.5, freq = 2 + model.t * 3;
        for (let i = 0; i <= 48; i++) { const x = -1.4 + i * 2.8 / 48; pts.push([x, Math.sin(x * freq) * amp]); }
        for (let i = 1; i < pts.length; i++) line(parent, pts[i - 1], pts[i], C.cyan, 0.026);
        L.forEach((lab, i) => tag(parent, lab, xs(i), -0.95, 0.85, 0.28, i));
      } else if (kind === "field") {
        for (let r = -1; r <= 1; r++) for (let c = -1; c <= 1; c++) {
          arrow(parent, [c * 0.82 - 0.12, r * 0.55], [c * 0.82 + 0.3, r * 0.55], col(r + c + 4));
        }
        L.forEach((lab, i) => tag(parent, lab, xs(i), 1.02, 0.85, 0.26, i));
      } else {
        line(parent, [-1.45, 0], [1.45, 0], C.ink, 0.022);
        L.forEach((lab, i) => {
          const a = (i - (n - 1) / 2) * 0.34;
          arrow(parent, [-1.2, 0], [1.2, Math.tan(a) * 1.2], active(model, i) ? C.amber : col(i));
          tag(parent, lab, 0.15 + i * 0.06, Math.tan(a) * 0.9, 0.8, 0.25, i);
        });
        disc(parent, 0.13, C.white, -1.2, 0);
      }
    } else if (kind === "circuit" || kind === "machine") {
      if (kind === "circuit") {
        const pts = [[-1.25, -0.72], [1.25, -0.72], [1.25, 0.72], [-1.25, 0.72], [-1.25, -0.72]];
        for (let i = 1; i < pts.length; i++) line(parent, pts[i - 1], pts[i], C.ink, 0.028);
        slab(parent, 0.5, 0.22, C.amber, 0, -0.72, 0.08);
        slab(parent, 0.42, 0.3, C.blue, 0, 0.72, 0.08);
        disc(parent, 0.16, C.white, 1.25, 0);
        L.forEach((lab, i) => tag(parent, lab, xs(i), i % 2 ? 0.3 : -0.3, 0.9, 0.28, i));
      } else {
        slab(parent, 2.6, 0.12, C.ink, 0, 0.25, 0.07);
        disc(parent, 0.16, C.amber, 0, 0.25);
        slab(parent, 0.6, 0.32, C.blue, -1.0, 0.1, 0.08);
        slab(parent, 0.6, 0.32, C.green, 1.0, 0.1, 0.08);
        L.forEach((lab, i) => tag(parent, lab, xs(i), -0.62, 0.85, 0.26, i));
      }
    } else if (kind === "molecule" || kind === "cell") {
      if (kind === "cell") {
        disc(parent, 0.95, 0xd9e9c9, 0, 0, 0.05);
        disc(parent, 0.3, C.purple, 0, 0, 0.08);
        [0.55, -0.5, 0.2].forEach((x, i) => disc(parent, 0.13, col(i + 2), x, i % 2 ? 0.35 : -0.35, 0.09));
        L.forEach((lab, i) => tag(parent, lab, xs(i), -1.0, 0.85, 0.26, i));
      } else {
        L.forEach((lab, i) => {
          const a = i / n * Math.PI * 2, x = Math.cos(a) * 0.85, z = Math.sin(a) * 0.62;
          ball(parent, 0.24, active(model, i) ? C.amber : col(i), x, z);
          tag(parent, lab, x, z + 0.38, 0.8, 0.26, i);
        });
        for (let i = 1; i < n; i++) {
          const a = (i - 1) / n * Math.PI * 2, b = i / n * Math.PI * 2;
          line(parent, [Math.cos(a) * 0.85, Math.sin(a) * 0.62], [Math.cos(b) * 0.85, Math.sin(b) * 0.62], C.ink);
        }
      }
    }

    /* explicit edges from the declarative spec (used by flow/tree/cycle too) */
    E.forEach(e => {
      const a = Number(e[0]), b = Number(e[1]);
      if (isFinite(a) && isFinite(b) && L[a] && L[b]) {
        const ax = xs(a), bx = xs(b);
        arrow(parent, [ax + 0.48, 0.05], [bx - 0.48, 0.05], C.ink);
      }
    });

    /* Every label card is a touch target: two touches + locked prediction +
       challenge are required for the lesson stamp (atlas discipline). */
    parent.traverse(o => {
      if (o.userData && o.userData.isTag) {
        const i = clickTargets.length;
        clickTargets.push({ id: "node" + i, label: (L[i] || ("Part " + (i + 1))), mesh: o });
      }
    });

    /* one draggable handle per control (dock sliders work too) */
    controls.slice(0, 2).forEach((c, i) => {
      const h = G3.handle(parent, c.id, [-1.35, Y + 0.07 + i * 0.02, 1.0 - i * 0.22], col(i));
      handles.push(h);
      if (ctx && ctx.setHandleRange) ctx.setHandleRange(c.id, -1.35, 1.35, -1.35);
    });
    return { handles: handles, clickTargets: clickTargets.filter(c => !!c.mesh) };
  }
  return { build: build, kinds: ATLAS_KINDS, eval: A3eval };
})();

BLOCKS.atlas = {
  label: "Atlas figure",
  controls: function (sp) { return (sp.scene && sp.scene.controls) || []; },
  model: function (params, sp) { return atlasModel(params, sp); },
  build: function (root, sp, ctx) { return A3.build(root, sp, ctx); }
};
