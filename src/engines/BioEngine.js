/* ==========================================================================
   BioEngine.js — PROMPT 1 / ENGINE FACTORY 1 of 3
   --------------------------------------------------------------------------
   Data-driven biology figure factory for BOTH Class IX and Class X Science.
   It does NOT know "animal cell", "neuron" or "leaf" as hardcoded scenes. It
   reads a validated declarative block: organelles[], layers[], vessels[],
   fibers[], crossSections[], parts[] — each carrying {en, hi} labels — and
   produces a THREE.Group with userData.partId on every pickable mesh.

   Approved research applied (no clone, no CDN, no GLB/GLTF):
     * ujjval93/3D_Notes          -> bilingual first-class fields on every part
     * gogulashashank/cbse-interactive-lab -> 3D + precision 2D on ONE state
     * rudra496/sciencelab3d      -> biology experiment part catalogue
     * ksraj20009/biochem-lab      -> DNA / neuron style part decomposition
     * nathanliow/atlas-of-physics -> model != world != checks
     * AlphaaCode/Popbook          -> validated declarative content only

   Prompt 2 binds activePartId; Prompt 4 now switches language through
   EVDICT/EVPROJ without recreating the WebGL context. This file intentionally contains NO UI, NO
   global state manager, NO raycaster and NO NCERT chapter hardcode.

   Copyright / Developer : Paras Pranav
   ========================================================================== */

EVENGINE.register('bio', {
  label_en: 'Biology / anatomy engine',
  label_hi: 'जीवविज्ञान / शरीर-रचना इंजन',
  subjects: ['biology'],
  classes: ['IX', 'X'],
  kinds: ['membrane', 'organelle', 'cell', 'layer', 'crossSection', 'vessel', 'fiber', 'capsule', 'sphere', 'lathe', 'tube', 'label'],
  create: function (spec, opts) {
    function normalize(s) {
      const parts = [];
      const push = (list, defKind) => (list || []).forEach(o => {
        if (!o || !o.id) return;
        parts.push(Object.assign({}, o, {
          kind: o.kind || defKind,
          label_en: o.label_en || o.title_en || o.id,
          label_hi: o.label_hi || o.title_hi || o.label_en || o.id
        }));
      });
      push(s.organelles, 'organelle');
      push(s.layers, 'layer');
      push(s.vessels, 'vessel');
      push(s.fibers, 'fiber');
      push(s.crossSections, 'crossSection');
      push(s.parts, 'part');
      return Object.assign({}, s, { parts: parts, engine: 'bio' });
    }
    const s = normalize(spec);
    const inst = EVENGINE.begin(s, 'bio', opts);
    s.parts.forEach(p => EVENGINE.add(inst, p));
    EVENGINE.finalize(inst);
    const base = inst.update;
    inst.update = function (model, dt, time) {
      const m = model || {};
      /* Accept either generic m.parts or the biology-friendly m.organelles alias.
         Still a pure model: no numbers are invented here. */
      if (m.organelles && !m.parts) return base(Object.assign({}, m, { parts: m.organelles }), dt, time);
      return base(m, dt, time);
    };
    if (s.segments && s.segments.length) inst.setSegments(s.segments);
    return inst;
  }
});
