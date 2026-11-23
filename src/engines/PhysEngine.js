/* ==========================================================================
   PhysEngine.js — PROMPT 1 / ENGINE FACTORY 3 of 3
   --------------------------------------------------------------------------
   Data-driven physics figure factory for BOTH Class IX and Class X Science.
   No hardcoded "concave mirror" or "series circuit" scene, and NO hardcoded
   ray paths. The JSON supplies rays[], optics[], circuit[], vectors[], graphs,
   arrows[], fields[] and parts[]; the factory maps them to generic tubes,
   lathes, torus arcs, arrows, line graphs, wires, resistors and batteries.
   Dynamic ray segments are rebuilt from model.segments inside update().

   Approved research applied (no clone, no CDN, no GLB/GLTF):
     * nathanliow/atlas-of-physics       -> ONE engine, model != world != checks
     * gogulashashank/cbse-interactive-lab -> NCERT IX-X optics, 3D + 2D one state
     * 123bruke/3d_labs                  -> measurement-driven validation
     * james123wang5/every-joule-style   -> force/vector apparatus recipes
     * ujjval93/3D_Notes                 -> bilingual {en, hi} first-class fields
     * AlphaaCode/Popbook                -> validated declarative JSON only
     * tmsteph/3dvr-portal#3381          -> predict -> experiment -> observe

   SHIPPED BY LATER STEPS (this file remains pure presentation):
     * Prompt 2: global state manager, UI chips, global Raycaster, unmount.
     * Prompt 3: O3.axis()/ray()/mirror()/lens()/arrow() grammar,
       raymirror/raylens/rayslab/raygraph parametric models and dynamic rays.
     * Prompt 4: EVDICT/EVPROJ Projector Mode and language toggle without
       WebGL recreate. Prompts 1-5 are all shipped.

   Copyright / Developer : Paras Pranav
   ========================================================================== */

EVENGINE.register('phys', {
  label_en: 'Physics / ray + circuit engine',
  label_hi: 'भौतिकी / किरण + परिपथ इंजन',
  subjects: ['physics'],
  classes: ['IX', 'X'],
  kinds: ['ray', 'axis', 'mirror', 'lens', 'slab', 'arrow', 'objectArrow', 'imageArrow', 'vector', 'graph', 'wire', 'resistor', 'battery', 'tube', 'line', 'label'],
  create: function (spec, opts) {
    function normalize(s) {
      const parts = [], dynamic = (s.segments || []).slice();
      const push = (list, defKind) => (list || []).forEach(o => {
        if (!o || !o.id) return;
        if (o.dynamic) { dynamic.push(Object.assign({}, o, { partId: o.partId || o.id })); return; }
        parts.push(Object.assign({}, o, {
          kind: o.kind || defKind,
          label_en: o.label_en || o.title_en || o.id,
          label_hi: o.label_hi || o.title_hi || o.label_en || o.id
        }));
      });
      push(s.optics, 'mirror');
      push(s.circuit, 'wire');
      push(s.vectors, 'vector');
      push(s.arrows, 'arrow');
      push(s.rays, 'ray');
      (s.graphs || (s.graph ? [s.graph] : [])).forEach(g => {
        if (!g || !g.id) return;
        parts.push(Object.assign({}, g, {
          kind: g.kind || 'graph',
          label_en: g.label_en || 'Graph', label_hi: g.label_hi || 'आरेख'
        }));
      });
      (s.parts || []).forEach(p => parts.push(p));
      return Object.assign({}, s, { parts: parts, segments: dynamic, engine: 'phys' });
    }
    const s = normalize(spec);
    const inst = EVENGINE.begin(s, 'phys', opts);
    inst.fields = (s.fields || []).slice();  /* slider metadata ONLY; Prompt 3 computes */
    s.parts.forEach(p => EVENGINE.add(inst, p));
    EVENGINE.finalize(inst);
    const base = inst.update;
    inst.update = function (model, dt, time) {
      let m = model || {};
      let parts = m.parts ? Object.assign({}, m.parts) : null;
      ['optics', 'circuit', 'vectors', 'arrows'].forEach(k => {
        if (!m[k]) return;
        parts = parts || {};
        Object.keys(m[k]).forEach(id => { parts[id] = m[k][id]; });
      });
      if (parts) m = Object.assign({}, m, { parts: parts });
      if (m.rays && !m.segments) m = Object.assign({}, m, { segments: m.rays });
      return base(m, dt, time);
    };
    if (s.segments && s.segments.length) inst.setSegments(s.segments);
    return inst;
  }
});
