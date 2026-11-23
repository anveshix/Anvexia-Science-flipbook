/* ==========================================================================
   ChemEngine.js — PROMPT 1 / ENGINE FACTORY 2 of 3
   --------------------------------------------------------------------------
   Data-driven chemistry figure factory for BOTH Class IX and Class X Science.
   No hardcoded "water molecule", "methane" or "soap micelle" scene. The JSON
   supplies atoms[], bonds[], particles[], flasks[], reactionArrow and parts[];
   the factory turns them into spheres, multi-order bond cylinders, point
   clouds, lathed glassware and bilingual labels. Every pickable mesh carries
   userData.partId so Prompt 2's global Raycaster can select an atom/bond.

   Approved research applied (no clone, no CDN, no GLB/GLTF):
     * rudra496/sciencelab3d        -> 10 chemistry experiment patterns
     * james123wang5/every-joule-style -> subject -> apparatus recipes, numeric checks
     * gogulashashank/cbse-interactive-lab -> live readings from ONE model
     * ujjval93/3D_Notes            -> bilingual {en, hi} first-class fields
     * AlphaaCode/Popbook           -> validated JSON-only content
     * nathanliow/atlas-of-physics  -> pure model / world / checks separation

   Physics formulas, sliders and dynamic ray computation are deliberately NOT
   here: those belong to Prompt 3. Prompt 2 owns state binding and unmount.

   Copyright / Developer : Paras Pranav
   ========================================================================== */

EVENGINE.register('chem', {
  label_en: 'Chemistry / molecular engine',
  label_hi: 'रसायन / आणविक इंजन',
  subjects: ['chemistry'],
  classes: ['IX', 'X'],
  kinds: ['atom', 'bond', 'particle', 'flask', 'reactionArrow', 'sphere', 'tube', 'lathe', 'points', 'label'],
  create: function (spec, opts) {
    function normalize(s) {
      const parts = [], atomPos = {};
      (s.atoms || []).forEach(a => {
        if (!a || !a.id) return;
        atomPos[a.id] = a.position || [0, 0, 0];
        parts.push(Object.assign({}, a, {
          kind: a.kind || 'atom',
          label_en: a.label_en || a.element || a.id,
          label_hi: a.label_hi || a.label_en || a.element || a.id
        }));
      });
      const at = v => (typeof v === 'string' ? (atomPos[v] || [0, 0, 0]) : (v || [0, 0, 0]));
      (s.bonds || []).forEach((b, i) => {
        if (!b) return;
        parts.push(Object.assign({}, b, {
          id: b.id || ('bond_' + i), kind: 'bond',
          from: at(b.from), to: at(b.to), order: b.order || 1,
          label_en: b.label_en || 'Bond', label_hi: b.label_hi || 'बंध'
        }));
      });
      (s.particles || []).forEach(p => {
        if (!p || !p.id) return;
        parts.push(Object.assign({}, p, {
          kind: p.kind || 'particle',
          label_en: p.label_en || 'Particles', label_hi: p.label_hi || 'कण'
        }));
      });
      (s.flasks || []).forEach(f => {
        if (!f || !f.id) return;
        parts.push(Object.assign({}, f, {
          kind: f.kind || 'flask',
          label_en: f.label_en || 'Flask', label_hi: f.label_hi || 'फ्लास्क'
        }));
      });
      (s.reactionArrows || (s.reactionArrow ? [s.reactionArrow] : [])).forEach(a => {
        if (!a || !a.id) return;
        parts.push(Object.assign({}, a, {
          kind: 'arrow',
          label_en: a.label_en || 'Reaction', label_hi: a.label_hi || 'अभिक्रिया'
        }));
      });
      (s.parts || []).forEach(p => parts.push(p));
      return Object.assign({}, s, { parts: parts, engine: 'chem' });
    }
    const s = normalize(spec);
    const inst = EVENGINE.begin(s, 'chem', opts);
    s.parts.forEach(p => EVENGINE.add(inst, p));
    EVENGINE.finalize(inst);
    const base = inst.update;
    inst.update = function (model, dt, time) {
      const m = model || {};
      /* Domain-friendly aliases. The caller still owns every number. */
      let normalized = m;
      if (m.atoms && !m.parts) normalized = Object.assign({}, normalized, { parts: m.atoms });
      if (m.bonds && !m.segments) normalized = Object.assign({}, normalized, { segments: m.bonds });
      return base(normalized, dt, time);
    };
    if (s.segments && s.segments.length) inst.setSegments(s.segments);
    return inst;
  }
});
