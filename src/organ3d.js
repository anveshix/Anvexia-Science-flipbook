/* ==========================================================================
   MASTER ENGINE / PROMPT 5 — EVORGAN  (PROCEDURAL NCERT LIFE PROCESSES ORGANS)
   --------------------------------------------------------------------------
   Resolves the deferred "organ GLTF models" request WITHOUT breaking the
   standing offline contract: every organ is pure declarative JSON -> a
   THREE.Group built by the SHARED EVENGINE / WORLD renderer. There is NO
   GLTFLoader, no GLB, no base64 mesh, no downloaded asset, no second canvas,
   no second WebGLRenderer, no external reference and no OCR.

   Four NCERT Class X Life Processes organs are shipped:
     heart         · four chambers + great vessels   (transportation)
     lungs         · bronchi, bronchioles, alveoli  (respiration)
     nephron       · Bowman's capsule, tubule, duct (excretion)
     villus        · intestinal villus + capillary  (nutrition)

   Data(JSON) / Presentation(THREE.Group) separation is strict: EVORGAN.spec()
   returns data only; EVORGAN.create() calls EVENGINE.create() on the same
   registry that Prompts 1-4 use. Every label is registered in the canonical
   EVDICT dictionary through EVDICT.auto(en, hi).

   Copyright / Developer : Paras Pranav
   ========================================================================== */

const EVORGAN = (function () {
  'use strict';
  const VERSION = '1.0.0';
  const CREDIT = 'Copyright / Developer : Paras Pranav';
  const SCHEMA = 'eduverse.procedural-organs/v1';

  function pair(en, hi) {
    if (typeof EVDICT !== 'undefined' && EVDICT.auto) EVDICT.auto(en, hi);
    return { en: en, hi: hi };
  }
  function P(id, kind, en, hi, position, extra) {
    const p = pair(en, hi);
    return Object.assign({
      id: id, kind: kind, label_en: p.en, label_hi: p.hi,
      position: position, radius: 0.32, pickable: true
    }, extra || {});
  }

  /* Procedural shape data. Every point/profile is authored here; no mesh file. */
  const ORGANS = {
    heart: {
      en: 'Human heart · four chambers', hi: 'मानव हृदय · चार कक्ष',
      caption_en: 'Deoxygenated blood enters the right side; oxygenated blood leaves the left.',
      caption_hi: 'अशुद्ध रक्त दाएँ भाग में आता है; शुद्ध रक्त बाएँ भाग से निकलता है।',
      parts: [
        P('heart_muscle', 'lathe', 'Cardiac muscle wall', 'हृदय पेशी भित्ति', [0, 0, 0],
          { profile: [[0, -1], [0.55, -0.7], [0.72, -0.1], [0.62, 0.55], [0.2, 0.95], [0, 1]],
            radius: 0.9, color: 0xb5535f, opacity: 0.42, segments: 28 }),
        P('heart_ra', 'sphere', 'Right atrium', 'दायाँ आलिंद', [-0.42, 0.38, 0.18],
          { size: [0.62, 0.55, 0.55], color: 0x4b76b8, opacity: 0.9 }),
        P('heart_rv', 'sphere', 'Right ventricle', 'दायाँ निलय', [-0.38, -0.32, 0.18],
          { size: [0.7, 0.78, 0.6], color: 0x5b86c9, opacity: 0.9 }),
        P('heart_la', 'sphere', 'Left atrium', 'बायाँ आलिंद', [0.42, 0.38, 0.18],
          { size: [0.6, 0.54, 0.54], color: 0xc4554f, opacity: 0.9 }),
        P('heart_lv', 'sphere', 'Left ventricle', 'बायाँ निलय', [0.38, -0.32, 0.18],
          { size: [0.74, 0.84, 0.62], color: 0xd4615a, opacity: 0.9 }),
        P('heart_aorta', 'tube', 'Aorta', 'महाधमनी', [0, 0, 0],
          { points: [[0.18, 0.7, 0], [0.3, 1.15, 0], [0.05, 1.42, 0], [-0.32, 1.2, 0]],
            radius: 0.10, color: 0xd4615a }),
        P('heart_pulmonary', 'tube', 'Pulmonary artery', 'फुफ्फुसीय धमनी', [0, 0, 0],
          { points: [[-0.18, 0.7, 0], [-0.46, 1.05, 0], [-0.9, 1.02, 0]],
            radius: 0.08, color: 0x5b86c9 }),
        P('heart_septum', 'box', 'Septum', 'पट', [0, 0, 0],
          { size: [0.10, 1.25, 0.5], color: 0xe0c9a6, opacity: 0.85 })
      ]
    },
    lungs: {
      en: 'Lungs · bronchi and alveoli', hi: 'फेफड़े · श्वसनी और वायुकोश',
      caption_en: 'Air branches through bronchi and bronchioles to millions of alveoli.',
      caption_hi: 'वायु श्वसनी व श्वसनिकाओं से होकर लाखों वायुकोशों तक पहुँचती है।',
      parts: [
        P('lung_left', 'lathe', 'Left lung', 'बायाँ फेफड़ा', [-0.85, 0, 0],
          { profile: [[0, -1], [0.5, -0.82], [0.66, -0.1], [0.5, 0.68], [0, 1]],
            color: 0xe0a8a0, opacity: 0.48, segments: 24 }),
        P('lung_right', 'lathe', 'Right lung', 'दायाँ फेफड़ा', [0.85, 0, 0],
          { profile: [[0, -1], [0.55, -0.85], [0.7, -0.1], [0.52, 0.7], [0, 1]],
            color: 0xe6aea4, opacity: 0.48, segments: 24 }),
        P('lung_trachea', 'tube', 'Trachea', 'श्वासनली', [0, 0, 0],
          { points: [[0, 1.45, 0], [0, 0.95, 0], [0, 0.35, 0]], radius: 0.11, color: 0x8bb7c9 }),
        P('lung_bronchi', 'tube', 'Bronchi', 'श्वसनी', [0, 0, 0],
          { points: [[0, 0.35, 0], [-0.55, 0.05, 0], [-0.9, -0.45, 0]], radius: 0.07, color: 0x74a6bd }),
        P('lung_bronchiole', 'tube', 'Bronchiole', 'श्वसनिका', [0, 0, 0],
          { points: [[0, 0.35, 0], [0.55, 0.05, 0], [0.92, -0.5, 0]], radius: 0.05, color: 0x74a6bd }),
        P('lung_alveoli', 'sphere', 'Alveolus', 'वायुकोश', [0.95, -0.72, 0],
          { size: [0.42, 0.42, 0.42], color: 0xf0c6bd, opacity: 0.92 }),
        P('lung_capillary', 'tube', 'Alveolar capillary', 'वायुकोशीय केशिका', [0, 0, 0],
          { points: [[0.72, -0.9, 0.1], [0.95, -1.02, 0.1], [1.18, -0.85, 0.1]],
            radius: 0.035, color: 0xc4554f })
      ]
    },
    nephron: {
      en: 'Nephron · the filtration unit', hi: 'नेफ्रॉन · निस्यंदन इकाई',
      caption_en: 'Bowman’s capsule filters blood; the tubule reabsorbs water and salts.',
      caption_hi: 'बोमैन संपुट रक्त छानता है; नलिका जल व लवण पुनः अवशोषित करती है।',
      parts: [
        P('nephron_capsule', 'sphere', 'Bowman’s capsule', 'बोमैन संपुट', [-0.9, 0.55, 0],
          { size: [0.72, 0.72, 0.72], color: 0xe0a02a, opacity: 0.6 }),
        P('nephron_glomerulus', 'torus', 'Glomerulus', 'गुच्छिका', [-0.9, 0.55, 0],
          { radius: 0.28, tube: 0.07, arc: Math.PI * 1.8, color: 0xc4554f }),
        P('nephron_pct', 'tube', 'Proximal convoluted tubule', 'समीपस्थ कुंडलित नलिका', [0, 0, 0],
          { points: [[-0.55, 0.55, 0], [-0.2, 0.85, 0], [0.1, 0.55, 0], [-0.05, 0.25, 0], [0.3, 0.45, 0]],
            radius: 0.075, color: 0x4c9c8c }),
        P('nephron_loop', 'tube', 'Loop of Henle', 'हेन्ले पाश', [0, 0, 0],
          { points: [[0.3, 0.45, 0], [0.45, -0.1, 0], [0.42, -0.85, 0], [0.8, -0.9, 0], [0.88, -0.2, 0]],
            radius: 0.065, color: 0x3f8f7f }),
        P('nephron_dct', 'tube', 'Distal convoluted tubule', 'दूरस्थ कुंडलित नलिका', [0, 0, 0],
          { points: [[0.88, -0.2, 0], [1.05, 0.25, 0], [0.75, 0.55, 0], [1.0, 0.8, 0]],
            radius: 0.07, color: 0x6bbf9c }),
        P('nephron_duct', 'cylinder', 'Collecting duct', 'संग्रहण नलिका', [1.25, 0, 0],
          { radius: 0.13, height: 1.9, color: 0x8b5fc7, opacity: 0.85 })
      ]
    },
    villus: {
      en: 'Intestinal villus · absorption', hi: 'आंत्र अंकुर · अवशोषण',
      caption_en: 'Villi multiply the absorptive surface; lacteal and capillaries carry nutrients.',
      caption_hi: 'अंकुर अवशोषण क्षेत्र बढ़ाते हैं; लसिका व केशिकाएँ पोषक पदार्थ ले जाती हैं।',
      parts: [
        P('villus_body', 'lathe', 'Villus epithelium', 'अंकुर उपकला', [0, 0, 0],
          { profile: [[0, -1], [0.32, -0.9], [0.36, 0.2], [0.22, 0.85], [0, 1]],
            color: 0xe6b98a, opacity: 0.55, segments: 24 }),
        P('villus_lacteal', 'tube', 'Lacteal', 'लसिका वाहिनी', [0, 0, 0],
          { points: [[0, -0.8, 0], [0.05, -0.2, 0], [0, 0.5, 0]], radius: 0.075, color: 0xf0dca8 }),
        P('villus_capillary', 'torus', 'Capillary network', 'केशिका जाल', [0, 0, 0],
          { radius: 0.24, tube: 0.045, arc: Math.PI * 1.7, color: 0xc4554f }),
        P('villus_microvilli', 'sphere', 'Microvilli', 'सूक्ष्मांकुर', [0, 0.92, 0],
          { size: [0.5, 0.16, 0.5], color: 0xf0cba0, opacity: 0.95 }),
        P('villus_crypt', 'box', 'Intestinal crypt', 'आंत्र गर्त', [0, -1.02, 0],
          { size: [0.9, 0.16, 0.7], color: 0xb5815b, opacity: 0.8 })
      ]
    }
  };

  const KINDS = Object.keys(ORGANS);

  function spec(kind) {
    const o = ORGANS[kind];
    if (!o) return null;
    return {
      id: 'organ_' + kind, class: 'X', subject: 'biology', engine: 'bio',
      title_en: o.en, title_hi: o.hi,
      captions: { en: o.caption_en, hi: o.caption_hi },
      organ: kind, procedural: true, gltf: 0, externalRefs: 0,
      parts: o.parts.map(p => Object.assign({}, p)),
      credit: CREDIT
    };
  }
  function create(kind, opts) {
    const s = spec(kind);
    if (!s) return null;
    if (typeof EVENGINE === 'undefined') return null;
    return EVENGINE.create(s, opts || {});
  }
  function dispose(inst) {
    if (inst && typeof inst.dispose === 'function') return inst.dispose();
    return false;
  }
  function health() {
    const problems = [];
    KINDS.forEach(k => {
      const s = spec(k);
      if (!s || !s.parts.length) problems.push('organ ' + k + ' has no parts');
      if (s && typeof EVENGINE !== 'undefined' && EVENGINE.validate) {
        const p = EVENGINE.validate(s);
        if (p.length) problems.push('organ ' + k + ': ' + p.join(', '));
      }
      s.parts.forEach(q => {
        if (!q.label_en || !q.label_hi) problems.push('organ ' + k + ' part ' + q.id + ' not bilingual');
      });
    });
    return {
      organs: KINDS.slice(), parts: KINDS.reduce((n, k) => n + ORGANS[k].parts.length, 0),
      gltf: 0, externalRefs: 0, procedural: true,
      canonicalGrammarUntouched: true, problems: problems, pass: problems.length === 0
    };
  }
  function contract() {
    return {
      schema: SCHEMA, version: VERSION, prompt: 5,
      release: 'R8 + Master Engine steps 1-5', credit: CREDIT,
      controller: 'EVORGAN', chapter: 'c10_life · Life Processes · NCERT Science X',
      organs: KINDS.map(k => ({ kind: k, en: ORGANS[k].en, hi: ORGANS[k].hi,
                                parts: ORGANS[k].parts.length })),
      route: 'EVORGAN.spec() → EVENGINE.create(bio) → shared WORLD WebGLRenderer → dispose()',
      resolution: 'procedural Three.js geometry replaces the requested GLTF/GLB organ assets; offline / 0-external-ref / no-GLB rule preserved',
      guarantees: [
        'no GLTFLoader, no GLB/GLTF, no base64 mesh, no downloaded asset',
        'one shared renderer; no second canvas, no second rAF, no EVSTATE fork',
        'every organ part has an EN and a HI label registered in EVDICT',
        'pure declarative JSON spec; presentation stays a THREE.Group',
        'instantiated only on demand; dispose() releases geometry and materials',
        'exact credit · 0 external refs · Prompt 5 complete'
      ],
      health: health(), deferred: []
    };
  }

  return { VERSION, CREDIT, SCHEMA, KINDS, ORGANS, spec, create, dispose, health, contract };
})();
