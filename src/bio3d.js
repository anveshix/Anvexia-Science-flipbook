/* ==========================================================================
   BIO3D — NCERT-aligned, declarative 3D BIOLOGY ATLAS (R7)
   --------------------------------------------------------------------------
   Why this file exists: a generic "coloured spheres on an orbit" is NOT a
   biology diagram. The figure opposite the text must be anatomically correct,
   neatly ALIGNED with leader lines, bilingual, and driven by the same pure
   model as the rest of the lesson. Nothing here is a screenshot, a CDN asset
   or a GLB. Every organelle is procedural Three.js geometry.

   APPROVED GitHub research actually used (see docs/GITHUB_REPOS_USAGE.md and
   RESEARCH.md for the evidence trail):
     * gogulashashank/cbse-interactive-lab  (CBSE IX-X, 3D + precision 2D on
       ONE scientific state, NCERT section numbers)  -> spec() is pure data;
       build() (3D) and svg2D() (accessible 2D) consume the SAME spec.
     * ujjval93/3D_Notes (Vigyan Darshan, bilingual NCERT IX/X) -> {en, hi}
       are first-class fields on EVERY labelled part, never a translation pass.
     * rudra496/sciencelab3d (MIT, 40+ experiments incl. 10 biology) ->
       biology model catalogue with parts + live state.
     * ksraj20009/biochem-lab (DNA + neuron viewers) -> dna / neuron models.
     * nathanliow/atlas-of-physics -> model != world != checks discipline:
       spec() is data, build() is geometry, EVCHECKS.biology() is the verdict.
     * james123wang5/every-joule-style (subjects.md biology apparatus recipes,
       numeric-consistency checklist) -> subject->model routing + active part.
     * AlphaaCode/Popbook -> validated JSON-only content, no generated code.
     * jesc104.pdf / jesc109.pdf / jesc110.pdf NCERT chapters -> section tags.

   Copyright / Developer : Paras Pranav
   ========================================================================== */

const BIO3D = (function () {
  const REPOS = [
    "gogulashashank/cbse-interactive-lab (3D + 2D, one model, NCERT IX-X)",
    "ujjval93/3D_Notes (bilingual Hindi/English NCERT IX + X)",
    "rudra496/sciencelab3d (MIT, biology experiment catalogue)",
    "ksraj20009/biochem-lab (DNA + neuron viewers)",
    "nathanliow/atlas-of-physics (pure model / checks / world separation)",
    "james123wang5/every-joule-style (biology apparatus recipes)",
    "AlphaaCode/Popbook (validated declarative content)"
  ];
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const C = {
    membrane: 0x59b6a0, cytoplasm: 0xdfc264, nucleus: 0x9b6bd0, nucleolus: 0x6f3fa8,
    chromosome: 0xd45c9a, mitochondrion: 0xda7f2f, er: 0xcda43a, golgi: 0x4a74c4,
    ribosome: 0x39566d, lysosome: 0xd4594f, vacuole: 0x8fd8c0, wall: 0x9c7a41,
    chloroplast: 0x3f9e5a, neuron: 0xc75b8e, axon: 0x6d78c8, myelin: 0xd09a34,
    backboneA: 0x2f8fd8, backboneB: 0xd18b1f, at: 0xc23b32, gc: 0x3f9e7c,
    sclera: 0xe2eaf4, iris: 0x4a7fb5, lens: 0x8fd0f0, retina: 0xe4a07a,
    bloodO: 0xc23b32, bloodD: 0x3f6fc0, lung: 0xdb7a9c, nephron: 0x59b6a0,
    petal: 0xc74b8c, sepal: 0x3f9e5a, anther: 0xd18b1f, microbe: 0x5f9a4a
  };

  /* ---------------------------------------------------------------- routing */
  const RULES = [
    /* NCERT IX Ch 13 "Why do we fall ill" is a pathogen / immunity chapter:
       keep it ahead of the heredity rule so a stray word "genetic" cannot
       put a DNA helix opposite a lesson about infectious disease. */
    [/bacteri|virus|microbe|pathogen|immune|vaccin|infection|disease|illness|health|antibod|जीवाणु|विषाणु|रोगजनक|प्रतिरक्षा|संक्रमण|रोग|बीमार|स्वास्थ्य/, "microbe"],
    [/neuron|nerve cell|reflex|synapse|dendrit|axon|myelin|तंत्रिका|न्यूरॉन|सिनैप्स|तंत्रिका/, "neuron"],
    [/double helix|\bdna\b|heredity|chromosom|genetic|gamete|allele|डीएनए|गुणसूत्र|आनुवंशिक|जीन|द्विकुंडलिनी/, "dna"],
    [/chloroplast|photosynth|stomata|guard cell|mesophyll|प्रकाश संश्लेषण|क्लोरोप्लास्ट|रंध्र|द्वार कोशिका/, "leaf"],
    [/heart|blood|circulat|artery|vein|capillar|हृदय|रक्त|परिसंचरण|धमनी/, "heart"],
    [/lung|alveol|breath|respirat|trachea|फेफड़ा|श्वसन|वायुकोश|श्वासनली/, "lung"],
    [/kidney|nephron|excret|urine|bowman|वृक्क|नेफ्रॉन|उत्सर्जन|बोमैन/, "nephron"],
    [/retina|cornea|iris|optic nerve|human eye|नेत्र|रेटिना|कॉर्निया|दृष्टि/, "eye"],
    [/flower|pollin|stamen|pistil|ovule|embryo|fertilis|seed|पुष्प|परागण|बीज|भ्रूण|पुंकेसर/, "flower"],
    [/food chain|food web|ecosystem|trophic|ozone|bio.?diversity|आहार शृंखला|पारितंत्र|जैव विविधता/, "food_chain"],
    [/tissue|epithel|meristem|xylem|phloem|muscle tissue|ऊतक|एपिथीलियम|विभज्योतक/, "tissue"],
    [/cell wall|plant cell|central vacuole|कोशिका भित्ति|पादप कोशिका|केन्द्रीय रिक्तिका/, "plant_cell"]
  ];
  const DEFAULTS = {
    c9_cell: "animal_cell", c9_tissues: "tissue", c9_disease: "microbe",
    c10_life: "animal_cell", c10_control: "neuron", c10_repro: "flower",
    c10_heredity: "dna", c10_env: "food_chain", c10_eye: "eye",
    c10_sustainable: "waste"
  };
  function hay(world, sp) {
    const f = (sp.scene && sp.scene.fig) || {};
    /* Routing uses ONLY spread-authoritative text. The generated `vocab`
       arrays shuffle chapter-level terms into unrelated lessons (e.g. a
       "Xylem" spread lists "Neuron"), so they must never pick the anatomy.
       The title is repeated because it is the strongest alignment signal. */
    return [sp.title, sp.title, sp.titleHi, sp.concept, sp.conceptHi,
            sp.fig, sp.figHi, sp.short, (f.labels || []).join(" "),
            world && world.title, sp.section].join(" ").toLowerCase();
  }
  /* Chapter-scoped disambiguation. NCERT chapters reuse the same words:
     "chromosome" appears in BOTH Heredity and Reproduction, so the chapter
     must decide which anatomy is opposite the text. */
  const CHAPTER_FIRST = {
    c9_cell: [
      [/mitosis|meiosis|division|cancer|checkpoint|mutation|विभाजन/, "cell_division"],
      [/chloroplast|cell wall|vacuole|prokaryot|wall →|कोशिका भित्ति/, "plant_cell"],
      [/nucleus|chromosom|\bdna\b|nuclear membrane|organelle|mitochond/, "animal_cell"],
      [/./, "animal_cell"]
    ],
    c9_tissues: [
      [/nervous tissue|neuron|dendrite|axon|synapse/, "neuron"],
      [/./, "tissue"]
    ],
    c9_disease: [[/./, "microbe"]],
    c9_diversity: [
      [/virus|acellular|विषाणु/, "microbe"],
      [/./, "diversity"]
    ],
    c10_life: [
      [/excret|kidney|nephron|urine|filtration/, "nephron"],
      [/human respiratory|trachea|bronchi|alveoli|nose →/, "lung"],
      [/aerobic|anaerobic|atp|cellular respiration/, "respiration"],
      [/circulat|heart →|arteries|capillaries|veins/, "heart"],
      [/transport in plants|xylem|phloem/, "leaf"],
      [/photosynth|chlorophyll|autotroph|co2|glucose/, "leaf"],
      [/digestion|mouth →|stomach|villi|enzyme|heterotroph|holozoic|saprophyt/, "digestive"],
      [/./, "digestive"]
    ],
    c10_control: [
      [/nervous system|neuron|dendrite|axon|synapse/, "neuron"],
      [/reflex action|reflex arc|receptor|spinal cord/, "neuron"],
      [/human brain|cerebrum|midbrain|cerebellum|medulla/, "neuron"],
      [/voluntary|involuntary|autonomic/, "neuron"],
      [/tropic|phototrop|auxin|bending|shoot/, "hormone"],
      [/plant hormones|gibberellin|cytokinin|\baba\b/, "hormone"],
      [/endocrine|pituitary|thyroid|adrenal|feedback|hormone/, "hormone"],
      [/./, "neuron"]
    ],
    c10_repro: [
      [/hiv|aids|infection|screening|women.s health|rights/, "microbe"],
      [/flowering plant|pollen|stigma|ovule|stamen|pistil|seed →/, "flower"],
      [/male reproductive|testes|vas deferens|seminal|urethra|sperm/, "human_repro"],
      [/female reproductive|ovary|fallopian|uterus|ovum|egg →|menstrual|fertilis|implant|placenta|embryo|contraception|iucd/, "human_repro"],
      [/fission|budding|regenerat|asexual|vegetative|tissue culture|spores/, "cell_division"],
      [/flowering plant|pollen|stigma|ovule|seed/, "flower"],
      [/variation|copying|adaptation|need for reproduction/, "cell_division"],
      [/./, "flower"]
    ],
    c10_heredity: [
      [/evolution|fossil|selection|speciation|विकास|जीवाश्म/, "evolution"],
      [/mendel|monohybrid|dihybrid|dominant|recessive|trait|phenotype|cross|allele|sex determination|\btt\b|\bxx\b|\bxy\b|inherit|chromosom|gene|variation/, "genetics"],
      [/./, "genetics"]
    ],
    c10_env: [
      [/ozone|\buv\b|\bo3\b|\bcfc\b|depletion|ओज़ोन/, "ozone"],
      [/waste|biodegrad|plastic|reduce|reuse|recycl|kitchen|paper|metal|compost/, "waste"],
      [/magnification|plankton|fish|bird|food chain|trophic|ten percent|producer|consumer|decomposer|grass|ecosystem/, "food_chain"],
      [/./, "food_chain"]
    ],
    /* Archive / sustainable-management chapter: route to the NCERT 3R+waste
       anatomy or the ecosystem model instead of the generic animal cell. */
    c10_sustainable: [
      [/present.*future|equity|equitable|intergeneration|management plan|सतत प्रबंधन क्यों/, "resource_plan"],
      [/forest|wildlife|biodiversity|chipko|afforest|community participation/, "forest_conservation"],
      [/water|watershed|rainwater|check dam|percolation|rooftop|groundwater|stepwell|tank/, "water_harvest"],
      [/coal|petroleum|3r|reduce|reuse|recycl|conserve|replenish|participate|waste|plastic|compost|cleaner fuel/, "fossil_3r"],
      [/./, "waste"]
    ]
  };
  function route(world, sp) {
    if (!world || !sp) return null;
    const bio = world.subject === "bio" || world.chapter === "c10_eye" || world.id === "c10_eye";
    if (!bio) return null;
    const h = hay(world, sp);
    const first = CHAPTER_FIRST[world.id] || CHAPTER_FIRST[world.chapter];
    if (first) for (let i = 0; i < first.length; i++)
      if (first[i][0].test(h)) return { model: first[i][1], by: "chapter-text:" + first[i][1], hay: h };
    for (let i = 0; i < RULES.length; i++)
      if (RULES[i][0].test(h)) return { model: RULES[i][1], by: "text:" + RULES[i][1], hay: h };
    if (/cell|organelle|nucleus|membrane|cytoplasm|mitochond|ribosom|golgi|plasma|कोशिका|केंद्रक|झिल्ली|कोशिकाद्रव्य/.test(h))
      return { model: "animal_cell", by: "text:cell", hay: h };
    return { model: DEFAULTS[world.id] || DEFAULTS[world.chapter] || "animal_cell",
             by: "chapter:" + (world.id || world.chapter), hay: h };
  }
  function classify(world, sp) { const r = route(world, sp); return r ? r.model : null; }

  /* ------------------------------------------------------------ part data */
  const P = (id, en, hi, shape, size, pos, color, o) =>
    Object.assign({ id: id, en: en, hi: hi, shape: shape, size: size, pos: pos, color: color, label: true }, o || {});
  function dots(id, en, hi, points, r, color, o) {
    return Object.assign({ id: id, en: en, hi: hi, shape: "dots", points: points, size: [r], pos: [0, 0, 0], color: color, label: true }, o || {});
  }
  function tube(id, en, hi, pts, r, color, o) {
    return Object.assign({ id: id, en: en, hi: hi, shape: "tube", pts: pts, size: [r], pos: [0, 0, 0], color: color, label: true }, o || {});
  }
  const ring = (n, r, y, z) => Array.from({ length: n }, (_, i) => {
    const a = i / n * Math.PI * 2; return [Math.cos(a) * r, y, Math.sin(a) * r + (z || 0)];
  });

  const MODELS = {
    animal_cell: {
      en: "Animal cell", hi: "जंतु कोशिका", ncert: "NCERT Science IX · Ch 5",
      parts: [
        P("membrane", "Plasma membrane", "प्लाज़मा झिल्ली", "sphere", [1.02], [0, 0, 0], C.membrane, { opacity: 0.24, anim: "breathe", label: true }),
        P("cytoplasm", "Cytoplasm", "कोशिकाद्रव्य", "sphere", [0.90], [0, 0, 0], C.cytoplasm, { opacity: 0.44 }),
        P("nucleus", "Nucleus", "केंद्रक", "sphere", [0.37], [-0.20, 0.10, 0.30], C.nucleus, { opacity: 0.86, anim: "pulse" }),
        P("nuclear_membrane", "Nuclear membrane", "केंद्रकीय झिल्ली", "torus", [0.39, 0.025], [-0.20, 0.10, 0.30], C.nucleolus, { rot: [Math.PI / 2, 0, 0] }),
        P("nucleolus", "Nucleolus", "केंद्रिका", "sphere", [0.13], [-0.20, 0.10, 0.34], C.nucleolus),
        P("chromosomes", "Chromosomes", "गुणसूत्र", "chromosome", [0.055, 0.20], [-0.20, 0.10, 0.32], C.chromosome),
        P("mitochondria", "Mitochondria", "माइटोकॉन्ड्रिया", "mitochondrion", [0.13, 0.34], [0.54, -0.40, 0.18], C.mitochondrion, { rot: [0, 0, 0.7], anim: "drift" }),
        P("mitochondria2", "Cristae", "क्रिस्टा", "cristae", [0.10, 0.30], [-0.58, 0.44, -0.18], C.mitochondrion, { rot: [0, 0, -0.6] }),
        P("er", "Endoplasmic reticulum", "अंतःप्रद्रव्यी जालिका", "er", [0.03], [-0.52, -0.05, -0.32], C.er),
        P("golgi", "Golgi apparatus", "गॉल्जी उपकरण", "golgi", [0.30], [0.36, 0.52, -0.30], C.golgi),
        dots("ribosomes", "Ribosomes", "राइबोसोम", [[0.62, 0.18, 0.42], [0.30, -0.62, 0.38], [-0.72, -0.30, 0.30], [0.10, 0.72, 0.20], [-0.40, -0.68, -0.20], [0.72, -0.08, -0.28]], 0.045, C.ribosome),
        P("lysosome", "Lysosome", "लाइसोसोम", "sphere", [0.12], [0.70, 0.30, -0.10], C.lysosome),
        P("vacuole", "Vacuole", "रिक्तिका", "sphere", [0.17], [-0.30, -0.56, -0.18], C.vacuole, { opacity: 0.6 })
      ]
    },
    plant_cell: {
      en: "Plant cell", hi: "पादप कोशिका", ncert: "NCERT Science IX · Ch 5",
      parts: [
        P("wall", "Cell wall", "कोशिका भित्ति", "box", [2.05, 1.55, 0.75], [0, 0, 0], C.wall, { opacity: 0.30, anim: "breathe" }),
        P("membrane", "Plasma membrane", "प्लाज़मा झिल्ली", "box", [1.92, 1.42, 0.68], [0, 0, 0], C.membrane, { opacity: 0.26 }),
        P("vacuole", "Central vacuole", "केन्द्रीय रिक्तिका", "ellipsoid", [0.72, 0.46, 0.26], [0.05, -0.02, 0.02], C.vacuole, { opacity: 0.55 }),
        P("nucleus", "Nucleus", "केंद्रक", "sphere", [0.28], [-0.66, 0.38, 0.16], C.nucleus),
        P("chloroplast1", "Chloroplast", "क्लोरोप्लास्ट", "chloroplast", [0.22, 0.11, 0.10], [0.62, 0.42, 0.14], C.chloroplast, { anim: "drift" }),
        P("chloroplast2", "Grana", "ग्रैना", "grana", [0.09], [-0.58, -0.42, 0.14], 0x2f7f45),
        P("chloroplast3", "Starch grain", "स्टार्च कण", "sphere", [0.09], [0.42, -0.46, 0.16], 0xe8d47a),
        P("mitochondria", "Mitochondria", "माइटोकॉन्ड्रिया", "mitochondrion", [0.10, 0.26], [-0.18, 0.60, 0.14], C.mitochondrion),
        P("ribosomes", "Ribosomes", "राइबोसोम", "dots", [0.035], [0, 0, 0], C.ribosome, { points: [[0.2, 0.1, 0.3], [-0.3, -0.2, 0.3], [0.5, -0.3, 0.3]] }),
        P("cytoplasm", "Cytoplasm", "कोशिकाद्रव्य", "box", [1.86, 1.36, 0.60], [0, 0, 0], C.cytoplasm, { opacity: 0.18, label: false })
      ]
    },
    neuron: {
      en: "Neuron", hi: "तंत्रिका कोशिका", ncert: "NCERT Science X · Ch 6",
      parts: [
        P("soma", "Cell body (soma)", "कोशिका काय", "sphere", [0.52], [-0.95, 0.15, 0], C.neuron, { anim: "pulse" }),
        P("nucleus", "Nucleus", "केंद्रक", "sphere", [0.14], [-0.95, 0.15, 0.06], C.nucleus),
        P("dendrites", "Dendrites", "देंड्राइट", "branches", [0.035], [-0.95, 0.15, 0], 0xd47aa0, {
          lines: [[[-0.95, 0.15, 0], [-1.45, 0.65, 0.10], [-1.75, 0.90, 0.18]],
                  [[-0.95, 0.15, 0], [-1.50, 0.05, -0.10], [-1.85, -0.10, -0.20]],
                  [[-0.95, 0.15, 0], [-1.40, -0.40, 0.12], [-1.70, -0.70, 0.22]],
                  [[-0.95, 0.15, 0], [-1.30, 0.55, -0.25], [-1.55, 0.80, -0.40]]]
        }),
        tube("axon", "Axon", "ऐक्सॉन", [[-0.60, 0.15, 0], [0.20, 0.15, 0], [1.25, 0.15, 0], [1.75, 0.15, 0]], 0.075, C.axon),
        P("myelin", "Myelin sheath", "मायलिन आवरण", "myelin", [0.115, 0.26], [0.35, 0.15, 0], C.myelin, {
          segments: [[-0.28, 0.15, 0], [0.28, 0.15, 0], [0.84, 0.15, 0], [1.40, 0.15, 0]]
        }),
        P("nodes", "Node of Ranvier", "रैनवियर पर्व", "dots", [0.055], [0, 0, 0], 0xd47aa0, {
          points: [[0.0, 0.15, 0], [0.56, 0.15, 0], [1.12, 0.15, 0]]
        }),
        P("terminals", "Axon terminals", "ऐक्सॉन अंतिम शाखाएँ", "branches", [0.045], [1.75, 0.15, 0], C.axon, {
          lines: [[[1.75, 0.15, 0], [2.05, 0.50, 0], [2.25, 0.62, 0]],
                  [[1.75, 0.15, 0], [2.12, 0.05, 0], [2.34, 0.02, 0]],
                  [[1.75, 0.15, 0], [2.02, -0.35, 0], [2.22, -0.48, 0]]]
        }),
        P("synapse", "Synaptic knobs", "सिनैप्टिक गाँठ", "dots", [0.085], [0, 0, 0], 0xe0a02a, {
          points: [[2.25, 0.62, 0], [2.34, 0.02, 0], [2.22, -0.48, 0]]
        }),
        P("impulse", "Nerve impulse", "तंत्रिका आवेग", "arrows", [0.07], [-0.4, 0.15, 0], 0xffd166, { to: [1.7, 0.15, 0], count: 4, anim: "flow" })
      ]
    },
    dna: {
      en: "DNA double helix", hi: "DNA द्विकुंडलिनी", ncert: "NCERT Science X · Heredity",
      parts: [
        P("helix", "Double helix", "द्विकुंडलिनी", "helix", [0.52, 2.10, 2.4, 0.045], [0, 0, 0], C.backboneA, { anim: "helix" }),
        P("backbone", "Sugar-phosphate backbone", "शर्करा-फॉस्फेट आधार", "helix", [0.52, 2.10, 2.4, 0.032], [0, 0, 0], C.backboneB, { phase: Math.PI, anim: "helix" }),
        P("basepairs", "Base pairs (A-T, G-C)", "क्षार युग्म", "rungs", [0.52, 2.10, 2.4], [0, 0, 0], C.at, { anim: "helix" }),
        P("nucleotide", "Nucleotides", "न्यूक्लियोटाइड", "dots", [0.07], [0, 0, 0], 0xffffff, {
          points: ring(8, 0.52, 0.0, 0), anim: "helix"
        }),
        P("gene", "Gene (DNA segment)", "जीन", "box", [0.38, 0.20, 0.14], [0.0, 0.42, 0.58], 0x9b6bd0, { opacity: 0.9 }),
        P("chromosome", "Chromosome", "गुणसूत्र", "chromosome", [0.07, 0.30], [0.95, -0.42, -0.15], C.chromosome),
        P("histone", "Histone protein", "हिस्टोन प्रोटीन", "sphere", [0.16], [-0.92, -0.38, 0.16], 0x5d8ad6),
        P("replication", "Replication fork", "प्रतिकृति द्विभुज", "branches", [0.035], [0, -1.05, 0], 0x2f8fd8, {
          lines: [[[0, -1.05, 0], [-0.35, -1.30, 0], [-0.62, -1.48, 0]],
                  [[0, -1.05, 0], [0.35, -1.30, 0], [0.62, -1.48, 0]]]
        })
      ]
    },
    leaf: {
      en: "Leaf / photosynthesis", hi: "पत्ती / प्रकाश संश्लेषण", ncert: "NCERT Science X · Ch 5",
      parts: [
        P("blade", "Leaf blade", "पत्ती का फलक", "ellipsoid", [1.20, 0.10, 0.72], [0, 0, 0], 0x4fae63, { anim: "breathe" }),
        tube("midrib", "Midrib", "मध्यशिरा", [[-1.15, 0.12, 0], [0, 0.14, 0], [1.15, 0.12, 0]], 0.035, 0x2f7f45),
        P("veins", "Veins (xylem + phloem)", "शिराएँ (जाइलम + फ्लोएम)", "branches", [0.022], [0, 0.13, 0], 0x2f7f45, {
          lines: [[[-0.7, 0.13, 0], [-0.45, 0.14, 0.5], [-0.25, 0.14, 0.66]],
                  [[0.1, 0.13, 0], [0.35, 0.14, 0.5], [0.55, 0.14, 0.66]],
                  [[-0.7, 0.13, 0], [-0.45, 0.14, -0.5], [-0.25, 0.14, -0.66]],
                  [[0.1, 0.13, 0], [0.35, 0.14, -0.5], [0.55, 0.14, -0.66]]]
        }),
        P("chloroplast", "Chloroplast", "क्लोरोप्लास्ट", "chloroplast", [0.18, 0.085, 0.075], [-0.42, 0.26, 0.22], C.chloroplast, { anim: "drift" }),
        P("grana", "Grana (thylakoids)", "ग्रैना (थाइलाकॉइड)", "grana", [0.08], [0.46, 0.26, 0.22], 0x2f7f45),
        P("stoma", "Stoma", "रंध्र", "torus", [0.13, 0.035], [0.05, 0.22, -0.36], 0x2f7f45, { rot: [Math.PI / 2, 0, 0] }),
        P("guard", "Guard cells", "द्वार कोशिकाएँ", "ellipsoid", [0.13, 0.035, 0.06], [-0.02, 0.22, -0.36], 0x6cc47a),
        P("sun", "Sunlight", "सूर्यप्रकाश", "arrows", [0.075], [-0.90, 1.05, 0], 0xffd166, { to: [-0.35, 0.28, 0], count: 3, anim: "flow" }),
        P("co2", "CO₂ + H₂O → glucose + O₂", "CO₂ + H₂O → ग्लूकोज़ + O₂", "box", [0.62, 0.14, 0.10], [0.0, 0.62, -0.62], 0xe0a02a, { label: true })
      ]
    },
    heart: {
      en: "Human heart", hi: "मानव हृदय", ncert: "NCERT Science X · Ch 5",
      parts: [
        P("ra", "Right atrium", "दायाँ आलिंद", "ellipsoid", [0.38, 0.34, 0.30], [-0.42, 0.42, 0], C.bloodD, { anim: "beat" }),
        P("rv", "Right ventricle", "दायाँ निलय", "ellipsoid", [0.40, 0.46, 0.32], [-0.44, -0.36, 0], C.bloodD, { anim: "beat" }),
        P("la", "Left atrium", "बायाँ आलिंद", "ellipsoid", [0.38, 0.34, 0.30], [0.42, 0.42, 0], C.bloodO, { anim: "beat" }),
        P("lv", "Left ventricle", "बायाँ निलय", "ellipsoid", [0.42, 0.52, 0.34], [0.44, -0.40, 0], C.bloodO, { anim: "beat" }),
        P("septum", "Septum", "पट", "box", [0.09, 1.30, 0.30], [0, 0, 0], 0xe8d8b8),
        tube("aorta", "Aorta", "महाधमनी", [[0.45, 0.70, 0], [0.55, 1.10, 0], [0.30, 1.35, 0], [0.0, 1.30, 0]], 0.085, C.bloodO),
        tube("pulmonary", "Pulmonary artery", "फुफ्फुसीय धमनी", [[-0.30, 0.70, 0], [-0.55, 1.05, 0], [-0.85, 1.15, 0]], 0.075, C.bloodD),
        tube("venacava", "Vena cava", "महाशिरा", [[-0.55, 0.55, -0.1], [-0.70, 0.95, -0.1], [-0.70, 1.30, -0.1]], 0.075, C.bloodD),
        P("valves", "Valves", "वाल्व", "torus", [0.16, 0.035], [0, 0.02, 0.32], 0xf0e2b8, { rot: [Math.PI / 2, 0, 0] }),
        P("flow", "Blood flow", "रक्त प्रवाह", "arrows", [0.06], [-0.44, 0.05, 0.36], 0xffd166, { to: [0.44, -0.35, 0.36], count: 3, anim: "flow" })
      ]
    },
    lung: {
      en: "Respiratory system", hi: "श्वसन तंत्र", ncert: "NCERT Science X · Ch 5",
      parts: [
        tube("trachea", "Trachea", "श्वासनली", [[0, 1.15, 0], [0, 0.60, 0], [0, 0.25, 0]], 0.10, 0xd8c98a),
        P("bronchi", "Bronchi", "श्वसनी", "branches", [0.065], [0, 0.25, 0], 0xd8c98a, {
          lines: [[[0, 0.25, 0], [-0.38, 0.05, 0], [-0.55, -0.20, 0]],
                  [[0, 0.25, 0], [0.38, 0.05, 0], [0.55, -0.20, 0]]]
        }),
        P("leftlung", "Left lung", "बायाँ फेफड़ा", "ellipsoid", [0.48, 0.76, 0.38], [-0.62, -0.30, 0], C.lung, { anim: "breathe" }),
        P("rightlung", "Right lung", "दायाँ फेफड़ा", "ellipsoid", [0.50, 0.78, 0.38], [0.62, -0.30, 0], C.lung, { anim: "breathe" }),
        dots("alveoli", "Alveoli", "वायुकोश", ring(9, 0.26, -0.80, 0.30).concat(ring(7, 0.20, -0.55, -0.30)), 0.075, 0xf0b8c8),
        P("diaphragm", "Diaphragm", "डायाफ्राम", "ellipsoid", [1.10, 0.10, 0.40], [0, -1.08, 0], 0xd47aa0),
        P("exchange", "O₂ / CO₂ exchange", "O₂ / CO₂ विनिमय", "arrows", [0.055], [-0.9, -0.62, 0.42], 0x59b6a0, { to: [0.9, -0.62, 0.42], count: 3, anim: "flow" })
      ]
    },
    nephron: {
      en: "Nephron", hi: "नेफ्रॉन", ncert: "NCERT Science X · Ch 5",
      parts: [
        P("bowman", "Bowman's capsule", "बोमैन संपुट", "sphere", [0.34], [-0.85, 0.52, 0], 0xe8d8b8, { opacity: 0.55 }),
        P("glomerulus", "Glomerulus", "ग्लोमेरुलस", "glomerulus", [0.22], [-0.85, 0.52, 0], C.bloodO, { anim: "pulse" }),
        tube("pct", "Proximal tubule", "समीपस्थ नलिका", [[-0.60, 0.35, 0], [-0.15, 0.15, 0], [0.20, 0.35, 0], [0.25, 0.05, 0], [0.55, -0.10, 0]], 0.055, C.nephron),
        tube("henle", "Loop of Henle", "हेनले का लूप", [[0.55, -0.10, 0], [0.72, -0.55, 0], [0.55, -0.92, 0], [0.20, -0.80, 0], [0.05, -0.40, 0]], 0.05, 0x2f8fd8),
        tube("dct", "Distal tubule", "दूरस्थ नलिका", [[0.05, -0.40, 0], [-0.05, 0.10, 0], [-0.30, 0.30, 0], [-0.45, 0.62, 0]], 0.05, C.nephron),
        tube("duct", "Collecting duct", "संग्रहणी नलिका", [[0.95, 0.60, 0], [0.95, 0.0, 0], [0.95, -0.85, 0]], 0.085, 0xe0a02a),
        P("capillaries", "Capillary network", "केशिका जाल", "branches", [0.028], [0.2, -0.35, 0], C.bloodD, {
          lines: [[[0.2, -0.35, 0], [0.5, -0.45, 0.2], [0.8, -0.35, 0.2]],
                  [[0.2, -0.35, 0], [0.4, -0.70, 0.2], [0.7, -0.80, 0.2]]]
        }),
        P("urine", "Urine formation", "मूत्र निर्माण", "arrows", [0.055], [0.95, -0.85, 0], 0xffd166, { to: [0.95, -1.25, 0], count: 2, anim: "flow" })
      ]
    },
    eye: {
      en: "Human eye", hi: "मानव नेत्र", ncert: "NCERT Science X · Ch 10",
      parts: [
        P("sclera", "Sclera", "श्वेतपटल", "sphere", [0.92], [0, 0, 0], C.sclera, { opacity: 0.72 }),
        P("cornea", "Cornea", "कॉर्निया", "ellipsoid", [0.30, 0.44, 0.44], [0.82, 0, 0], C.lens, { opacity: 0.65 }),
        P("iris", "Iris", "परितारिका", "torus", [0.30, 0.075], [0.58, 0, 0], C.iris, { rot: [0, Math.PI / 2, 0] }),
        P("pupil", "Pupil", "पुतली", "sphere", [0.11], [0.62, 0, 0], 0x101820),
        P("lens", "Eye lens", "नेत्र लेंस", "ellipsoid", [0.16, 0.30, 0.30], [0.42, 0, 0], C.lens, { opacity: 0.8, anim: "pulse" }),
        P("retina", "Retina", "दृष्टिपटल", "sphere", [0.80], [-0.06, 0, 0], C.retina, { opacity: 0.35 }),
        tube("optic", "Optic nerve", "दृक् तंत्रिका", [[-0.85, -0.10, 0], [-1.15, -0.18, 0], [-1.45, -0.20, 0]], 0.10, 0xd8c98a),
        P("rays", "Light rays", "प्रकाश किरणें", "arrows", [0.045], [1.55, 0.22, 0], 0xffd166, { to: [0.82, 0.05, 0], count: 3, anim: "flow" }),
        P("image", "Inverted image on retina", "दृष्टिपटल पर उल्टा प्रतिबिंब", "box", [0.06, 0.24, 0.20], [-0.78, 0, 0], 0xd4594f)
      ]
    },
    flower: {
      en: "Flower / reproduction", hi: "पुष्प / जनन", ncert: "NCERT Science X · Ch 7",
      parts: [
        P("petals", "Petals", "पंखुड़ियाँ", "petals", [0.42, 0.10, 0.20], [0, 0.10, 0], C.petal, { count: 6, anim: "breathe" }),
        P("sepals", "Sepals", "बाह्यदल", "petals", [0.30, 0.06, 0.14], [0, -0.10, 0], C.sepal, { count: 5, phase: 0.5 }),
        P("stamen", "Stamen (anther + filament)", "पुंकेसर (परागकोश + तंतु)", "stamen", [0.05, 0.60], [0, 0.30, 0], C.anther, { count: 5 }),
        P("pistil", "Pistil (stigma, style, ovary)", "स्त्रीकेसर (वर्तिकाग्र, वर्तिका, अंडाशय)", "pistil", [0.13, 0.80], [0, 0.35, 0], 0x9b6bd0),
        P("ovule", "Ovule", "बीजांड", "sphere", [0.12], [0, -0.18, 0.14], 0xe8d47a),
        P("pollen", "Pollen grains", "पराग कण", "dots", [0.045], [0, 0, 0], C.anther, { points: ring(8, 0.62, 0.72, 0) }),
        P("pollination", "Pollination", "परागण", "arrows", [0.05], [-1.10, 0.88, 0], 0xffd166, { to: [-0.15, 0.55, 0], count: 3, anim: "flow" })
      ]
    },
    microbe: {
      en: "Microbe / pathogen", hi: "सूक्ष्मजीव / रोगजनक", ncert: "NCERT Science IX · Ch 13",
      parts: [
        P("capsid", "Capsid / cell body", "कैप्सिड / कोशिका काय", "sphere", [0.62], [0, 0, 0], C.microbe, { anim: "pulse" }),
        P("wall", "Cell wall", "कोशिका भित्ति", "sphere", [0.70], [0, 0, 0], 0x99c47a, { opacity: 0.28 }),
        P("nucleoid", "Nucleoid (DNA)", "न्यूक्लियॉइड (DNA)", "helix", [0.18, 0.62, 1.4, 0.025], [0.05, 0.02, 0.10], 0x9b6bd0, { anim: "helix" }),
        P("spikes", "Surface spikes", "सतही कंटक", "dots", [0.07], [0, 0, 0], 0xd4594f, { points: ring(10, 0.66, 0.0, 0).concat(ring(6, 0.42, 0.52, 0)) }),
        P("flagella", "Flagella", "कशाभिका", "branches", [0.025], [-0.60, -0.10, 0], 0x2f8fd8, {
          lines: [[[-0.60, -0.10, 0], [-1.00, -0.32, 0], [-1.35, -0.10, 0], [-1.60, -0.34, 0]],
                  [[-0.55, 0.15, 0.1], [-0.95, 0.35, 0.1], [-1.30, 0.18, 0.1]]]
        }),
        P("ribosomes", "Ribosomes", "राइबोसोम", "dots", [0.045], [0, 0, 0], 0x39566d, { points: ring(7, 0.40, -0.12, 0.30) }),
        P("antigen", "Antigen", "प्रतिजन", "dots", [0.085], [0, 0, 0], 0xffd166, { points: ring(5, 0.72, 0.22, 0) })
      ]
    },
    tissue: {
      en: "Tissue", hi: "ऊतक", ncert: "NCERT Science IX · Ch 6",
      parts: [
        P("layer1", "Epithelial layer", "एपिथीलियमी परत", "cells", [0.28, 0.30], [0, 0.52, 0], 0x59b6a0, { rows: 1, count: 6 }),
        P("layer2", "Muscle / meristem cells", "पेशी / विभज्योतक कोशिकाएँ", "cells", [0.28, 0.30], [0, 0.08, 0], 0xd47aa0, { rows: 1, count: 6 }),
        P("layer3", "Basement membrane", "आधार झिल्ली", "box", [1.90, 0.06, 0.34], [0, -0.20, 0], 0xe8d8b8),
        P("layer4", "Connective tissue", "संयोजी ऊतक", "cells", [0.28, 0.30], [0, -0.56, 0], 0x5d8ad6, { rows: 1, count: 6 }),
        P("nuclei", "Nuclei", "केंद्रक", "dots", [0.055], [0, 0, 0], C.nucleus, { points: ring(9, 0.72, 0.12, 0.20) }),
        P("xylem", "Xylem vessel", "जाइलम वाहिनी", "tube", [0.075], [-1.25, 0.0, 0.1], 0xb99a63, { pts: [[-1.25, -0.85, 0.1], [-1.25, 0, 0.1], [-1.25, 0.85, 0.1]] }),
        P("phloem", "Phloem", "फ्लोएम", "tube", [0.060], [1.25, 0.0, 0.1], 0xe0a02a, { pts: [[1.25, -0.85, 0.1], [1.25, 0, 0.1], [1.25, 0.85, 0.1]] }),
        P("division", "Cell division", "कोशिका विभाजन", "arrows", [0.05], [-0.90, 0.08, 0.40], 0xffd166, { to: [0.90, 0.08, 0.40], count: 3, anim: "flow" })
      ]
    },
    food_chain: {
      en: "Ecosystem / food chain", hi: "पारितंत्र / आहार शृंखला", ncert: "NCERT Science X · Ch 13",
      parts: [
        P("producer", "Producers (plants)", "उत्पादक (पौधे)", "tier", [1.55, 0.30], [0, -0.72, 0], 0x3f9e5a),
        P("primary", "Primary consumers", "प्राथमिक उपभोक्ता", "tier", [1.20, 0.30], [0, -0.24, 0], 0x7fb069),
        P("secondary", "Secondary consumers", "द्वितीयक उपभोक्ता", "tier", [0.88, 0.30], [0, 0.24, 0], 0xe0a02a),
        P("tertiary", "Tertiary consumers", "तृतीयक उपभोक्ता", "tier", [0.56, 0.30], [0, 0.72, 0], 0xd4594f),
        P("decomposer", "Decomposers", "अपघटक", "dots", [0.075], [0, 0, 0], 0x9b6bd0, { points: ring(9, 0.95, -1.02, 0.2) }),
        P("sun", "Sun (energy source)", "सूर्य (ऊर्जा स्रोत)", "sphere", [0.22], [-1.30, 1.05, 0], 0xffd166, { anim: "pulse" }),
        P("energy", "Energy flow (10% law)", "ऊर्जा प्रवाह (10% नियम)", "arrows", [0.055], [-0.75, -0.72, 0.42], 0xffd166, { to: [0.55, 0.72, 0.42], count: 4, anim: "flow" }),
        P("nutrients", "Nutrient cycling", "पोषक चक्रण", "torus", [0.98, 0.035], [0, -0.20, -0.30], 0x59b6a0, { rot: [Math.PI / 2, 0, 0] })
      ]
    },
    cell_division: {
      en: "Cell division", hi: "कोशिका विभाजन", ncert: "NCERT Science IX · Ch 5 / X · Ch 7",
      parts: [
        P("parent", "Parent cell", "जनक कोशिका", "sphere", [1.00], [0, 0, 0], C.membrane, { opacity: 0.34, anim: "breathe" }),
        P("nucleus", "Nucleus", "केंद्रक", "sphere", [0.34], [0, 0.15, 0.28], C.nucleus, { anim: "pulse" }),
        P("chromosomes", "Chromosomes", "गुणसूत्र", "chromosome", [0.055, 0.22], [0, 0.15, 0.30], C.chromosome),
        P("replication", "DNA replication", "DNA प्रतिकृति", "helix", [0.14, 0.48, 1.4, 0.022], [-0.62, 0.45, -0.28], 0x9b6bd0, { anim: "helix" }),
        P("spindle", "Spindle fibres", "तर्कु तंतु", "branches", [0.022], [0, 0.15, 0], 0x5d8ad6, {
          lines: [[[0, 0.15, 0], [-0.62, 0.62, 0], [-0.85, 0.80, 0]],
                  [[0, 0.15, 0], [0.62, 0.62, 0], [0.85, 0.80, 0]],
                  [[0, 0.15, 0], [-0.62, -0.40, 0]], [[0, 0.15, 0], [0.62, -0.40, 0]]]
        }),
        P("furrow", "Cleavage furrow", "विदलन खाँच", "torus", [0.92, 0.035], [0, 0, 0], 0xd4594f, { rot: [Math.PI / 2, 0, 0] }),
        P("daughter1", "Daughter cell 1", "संतति कोशिका १", "sphere", [0.30], [-0.82, -0.42, 0.16], 0x7ee0b8, { opacity: 0.75 }),
        P("daughter2", "Daughter cell 2", "संतति कोशिका २", "sphere", [0.30], [0.82, -0.42, 0.16], 0x7ee0b8, { opacity: 0.75 }),
        P("stages", "Division stages", "विभाजन अवस्थाएँ", "arrows", [0.055], [-0.85, -0.92, 0.30], 0xffd166, { to: [0.85, -0.92, 0.30], count: 4, anim: "flow" })
      ]
    },
    hormone: {
      en: "Hormones / tropism", hi: "हार्मोन / अनुवर्तन", ncert: "NCERT Science X · Ch 6",
      parts: [
        P("shoot", "Shoot tip", "प्ररोह शीर्ष", "cone", [0.20, 0.34], [0, 0.92, 0], 0x3f9e5a),
        P("coleoptile", "Coleoptile / stem", "बीजपत्रांकुर / तना", "cylinder", [0.16, 0.20, 1.10], [0, 0.10, 0], 0x7fb069, { anim: "breathe" }),
        P("lit", "Auxin on lit side (less)", "प्रकाश ओर ऑक्सिन (कम)", "dots", [0.055], [0, 0, 0], 0xffd166, { points: [[0.18, 0.60, 0.16], [0.18, 0.30, 0.16], [0.18, 0.02, 0.16]] }),
        P("shade", "Auxin on shaded side (more)", "छाया ओर ऑक्सिन (अधिक)", "dots", [0.075], [0, 0, 0], 0xd4594f, { points: [[-0.18, 0.60, 0.16], [-0.18, 0.30, 0.16], [-0.18, 0.02, 0.16], [-0.16, -0.24, 0.16], [-0.16, -0.50, 0.16]] }),
        P("elongation", "Cell elongation", "कोशिका दीर्घीकरण", "cells", [0.11, 0.24], [-0.22, -0.10, 0.20], 0x59b6a0, { count: 4 }),
        P("light", "Unidirectional light", "एकदिश प्रकाश", "arrows", [0.065], [1.35, 0.95, 0], 0xffd166, { to: [0.35, 0.55, 0], count: 3, anim: "flow" }),
        P("bend", "Phototropic curvature", "प्रकाशानुवर्ती वक्रता", "tube", [0.055], [0, 0.5, 0], 0x3f9e5a, { pts: [[0, 0.78, 0], [0.10, 0.95, 0], [0.38, 1.06, 0], [0.62, 1.02, 0]] }),
        P("gland", "Endocrine gland", "अंतःस्रावी ग्रंथि", "sphere", [0.24], [-1.05, -0.62, 0], 0x9b6bd0, { anim: "pulse" }),
        P("hormones", "Hormone molecules", "हार्मोन अणु", "dots", [0.05], [0, 0, 0], 0xe0a02a, { points: ring(7, 0.38, -0.62, 0.20) })
      ]
    },
    evolution: {
      en: "Heredity & evolution", hi: "आनुवंशिकी तथा विकास", ncert: "NCERT Science X · Heredity & Evolution",
      parts: [
        tube("ancestor", "Common ancestor", "सामान्य पूर्वज", [[0, -1.05, 0], [0, -0.65, 0], [0, -0.20, 0]], 0.085, 0xb99a63),
        P("branches", "Divergent evolution", "अपसारी विकास", "branches", [0.055], [0, -0.20, 0], 0x3f9e5a, {
          lines: [[[0, -0.20, 0], [-0.65, 0.20, 0], [-1.05, 0.72, 0]],
                  [[0, -0.20, 0], [0, 0.40, 0], [0, 1.05, 0]],
                  [[0, -0.20, 0], [0.65, 0.20, 0], [1.05, 0.72, 0]]]
        }),
        dots("species", "Species", "जातियाँ", [[-1.05, 0.80, 0], [0, 1.12, 0], [1.05, 0.80, 0], [-0.72, 0.42, 0.3], [0.72, 0.42, 0.3]], 0.13, 0x7fb069),
        P("variation", "Variations", "विविधताएँ", "dots", [0.06], [0, 0, 0], 0xd45c9a, { points: ring(8, 0.52, 0.30, 0.20) }),
        P("fossils", "Fossils", "जीवाश्म", "box", [0.30, 0.10, 0.24], [-1.05, -0.70, 0.20], 0xb99a63),
        P("isolation", "Geographic isolation", "भौगोलिक विलगन", "box", [0.26, 0.34, 0.22], [1.02, -0.66, 0.20], 0x5d8ad6),
        P("selection", "Natural selection", "प्राकृतिक वरण", "arrows", [0.055], [-0.90, 1.12, 0.20], 0xffd166, { to: [0.90, 1.12, 0.20], count: 3, anim: "flow" }),
        P("time", "Geological time", "भूवैज्ञानिक समय", "arrows", [0.05], [0.90, -1.00, 0.20], 0x9b6bd0, { to: [0.90, 0.90, 0.20], count: 3 })
      ]
    },
    ozone: {
      en: "Ozone layer / environment", hi: "ओज़ोन परत / पर्यावरण", ncert: "NCERT Science X · Ch 13",
      parts: [
        P("strato", "Stratosphere", "समताप मंडल", "tier", [2.20, 0.18], [0, 0.62, 0], 0x5d8ad6, { opacity: 0.55 }),
        P("earth", "Earth", "पृथ्वी", "sphere", [0.70], [0, -0.92, 0], 0x3f9e5a, { anim: "breathe" }),
        dots("ozone", "O₃ molecules", "O₃ अणु", ring(11, 1.02, 0.30, 0), 0.085, 0x59b6a0),
        P("shield", "Ozone shield", "ओज़ोन परत", "torus", [1.05, 0.045], [0, 0.30, 0], 0x59b6a0, { rot: [Math.PI / 2, 0, 0] }),
        P("hole", "Ozone hole", "ओज़ोन छिद्र", "torus", [0.30, 0.055], [0.55, 0.30, 0.10], 0xd4594f, { rot: [Math.PI / 2, 0, 0] }),
        P("uv", "UV radiation", "पराबैंगनी विकिरण", "arrows", [0.06], [-0.90, 1.25, 0.10], 0x9b6bd0, { to: [-0.55, 0.36, 0.10], count: 3, anim: "flow" }),
        dots("cfc", "CFC molecules", "CFC अणु", [[0.75, 0.90, 0.2], [1.05, 0.66, 0.2], [0.35, 0.98, 0.2]], 0.09, 0xe0a02a),
        P("life", "Living organisms", "जीव", "box", [0.44, 0.14, 0.20], [0, -1.55, 0.25], 0xd45c9a),
        P("decompose", "O₃ depletion", "O₃ क्षय", "arrows", [0.05], [-1.20, 0.20, 0.20], 0xd4594f, { to: [-0.35, 0.20, 0.20], count: 2 })
      ]
    },
    digestive: {
      en: "Human digestive system", hi: "मानव पाचन तंत्र", ncert: "NCERT Science X · Ch 5",
      parts: [
        P("mouth", "Mouth / buccal cavity", "मुख / मुखगुहा", "sphere", [0.22], [-0.95, 0.95, 0], 0xd45c9a),
        tube("oesophagus", "Oesophagus", "ग्रासनली", [[-0.85, 0.78, 0], [-0.70, 0.40, 0], [-0.62, 0.10, 0]], 0.055, 0xe0a02a),
        P("stomach", "Stomach", "आमाशय", "ellipsoid", [0.36, 0.30, 0.26], [-0.45, -0.12, 0], 0xd4594f, { anim: "pulse" }),
        P("liver", "Liver", "यकृत", "ellipsoid", [0.34, 0.18, 0.22], [0.10, 0.42, -0.10], 0xb99a63),
        P("pancreas", "Pancreas", "अग्न्याशय", "ellipsoid", [0.28, 0.09, 0.15], [-0.10, -0.40, -0.12], 0xe2c46c),
        P("intestine", "Small intestine", "छोटी आँत", "coil", [0.055], [0.18, -0.62, 0], C.golgi),
        P("villi", "Villi (absorption)", "अंकुर (अवशोषण)", "dots", [0.045], [0, 0, 0], 0x7ee0b8, { points: ring(9, 0.32, -0.62, 0.24) }),
        tube("large", "Large intestine", "बड़ी आँत", [[-0.80, -0.85, -0.12], [-0.80, -0.35, -0.12], [-0.55, -0.20, -0.12], [0.85, -0.35, -0.12], [0.85, -0.95, -0.12]], 0.09, 0xb99a63),
        P("enzymes", "Digestive enzymes", "पाचक एंजाइम", "arrows", [0.05], [-0.95, -0.05, 0.32], 0xffd166, { to: [0.85, -0.05, 0.32], count: 3, anim: "flow" })
      ]
    },
    genetics: {
      en: "Mendelian inheritance", hi: "मेंडेली वंशागति", ncert: "NCERT Science X · Heredity",
      parts: [
        P("homologous", "Homologous chromosomes", "समजात गुणसूत्र", "chromosome", [0.07, 0.44], [-0.55, 0.42, 0], 0x9b6bd0),
        P("locus", "Gene locus", "जीन स्थान", "torus", [0.14, 0.035], [-0.55, 0.42, 0.12], 0xffd166, { rot: [Math.PI / 2, 0, 0] }),
        P("dominant", "Dominant allele (T)", "प्रभावी युग्मविकल्पी (T)", "sphere", [0.16], [0.42, 0.62, 0.10], 0xd4594f, { anim: "pulse" }),
        P("recessive", "Recessive allele (t)", "अप्रभावी युग्मविकल्पी (t)", "sphere", [0.16], [0.42, 0.20, 0.10], 0x5d8ad6),
        dots("gametes", "Gametes (T / t)", "युग्मक (T / t)", [[-0.92, -0.12, 0.2], [-0.62, -0.12, 0.2], [0.62, -0.12, 0.2], [0.92, -0.12, 0.2]], 0.10, 0x7ee0b8),
        P("punnett", "Punnett square", "पुनेट वर्ग", "grid", [0.50], [0, -0.62, 0], 0x2f8fd8),
        P("f1", "F₁ generation", "F₁ पीढ़ी", "tier", [0.62, 0.16], [-0.72, 0.92, -0.15], 0x7fb069),
        P("f2", "F₂ ratio 3 : 1", "F₂ अनुपात 3 : 1", "tier", [0.62, 0.16], [0.72, 0.92, -0.15], 0xe0a02a),
        P("segregation", "Law of segregation", "पृथक्करण का नियम", "arrows", [0.05], [-1.15, 0.30, 0.30], 0xffd166, { to: [1.15, 0.30, 0.30], count: 3, anim: "flow" }),
        P("traits", "Phenotype (tall / dwarf)", "लक्षणप्ररूपी (लंबा / बौना)", "cells", [0.15, 0.22], [0, -1.05, 0.18], 0x3f9e5a, { count: 3 })
      ]
    },
    human_repro: {
      en: "Human reproductive system", hi: "मानव जनन तंत्र", ncert: "NCERT Science X · Ch 7",
      parts: [
        P("testis", "Testes", "वृषण", "ellipsoid", [0.24, 0.18, 0.20], [-1.02, 0.40, 0], 0x5d8ad6, { anim: "pulse" }),
        P("vas", "Vas deferens", "शुक्रवाहिनी", "tube", [0.045], [-1.02, 0.40, 0], 0x2f8fd8, { pts: [[-1.02, 0.30, 0], [-0.88, 0.02, 0], [-0.62, -0.16, 0], [-0.40, -0.20, 0]] }),
        P("prostate", "Prostate / seminal vesicle", "प्रॉस्टेट / शुक्राशय", "sphere", [0.15], [-0.55, -0.28, 0.10], 0x9b6bd0),
        dots("sperm", "Sperm", "शुक्राणु", [[-1.22, 0.10, 0.22], [-1.05, -0.02, 0.22], [-0.86, -0.14, 0.22]], 0.065, 0xffd166),
        P("ovary", "Ovaries", "अंडाशय", "ellipsoid", [0.20, 0.15, 0.18], [0.95, 0.52, 0], 0xd45c9a, { anim: "pulse" }),
        P("egg", "Ovum (egg)", "अंडाणु", "sphere", [0.13], [1.20, 0.26, 0.16], 0xff9b8a),
        tube("fallopian", "Fallopian tube", "अंडवाहिनी", [[1.02, 0.38, 0], [0.72, 0.22, 0], [0.35, 0.10, 0]], 0.05, 0xd45c9a),
        P("uterus", "Uterus", "गर्भाशय", "ellipsoid", [0.34, 0.38, 0.26], [0.10, -0.12, 0], 0xe8a0b8, { anim: "breathe" }),
        tube("cervix", "Cervix & vagina", "ग्रीवा एवं योनि", [[0.10, -0.45, 0], [0.10, -0.75, 0], [0.10, -1.02, 0]], 0.075, 0xd47aa0),
        P("embryo", "Embryo / foetus", "भ्रूण", "sphere", [0.16], [0.10, -0.12, 0.18], 0xffffff),
        P("placenta", "Placenta", "अपरा", "torus", [0.24, 0.045], [0.10, -0.12, -0.10], 0xd4594f, { rot: [Math.PI / 2, 0, 0] }),
        P("fertilisation", "Fertilisation", "निषेचन", "arrows", [0.05], [-0.42, 0.86, 0.28], 0xffd166, { to: [0.95, 0.40, 0.28], count: 3, anim: "flow" })
      ]
    },
    waste: {
      en: "Waste & 3R", hi: "अपशिष्ट एवं 3R", ncert: "NCERT Science X · Ch 13",
      parts: [
        P("bio", "Biodegradable waste", "जैव-अपघटनीय कचरा", "box", [0.52, 0.52, 0.38], [-0.62, -0.12, 0], 0x3f9e5a, { anim: "breathe" }),
        P("nonbio", "Non-biodegradable waste", "अजैव-अपघटनीय कचरा", "box", [0.52, 0.52, 0.38], [0.62, -0.12, 0], 0x5d8ad6, { anim: "breathe" }),
        dots("kitchen", "Kitchen / paper waste", "रसोई / कागज़ कचरा", ring(6, 0.20, -0.12, 0.24).map(v => [v[0] - 0.62, v[1], v[2]]), 0.055, 0x7fb069),
        dots("plastic", "Plastic / metal", "प्लास्टिक / धातु", ring(6, 0.20, -0.12, 0.24).map(v => [v[0] + 0.62, v[1], v[2]]), 0.055, 0xe0a02a),
        dots("decomposers", "Decomposer microbes", "अपघटक सूक्ष्मजीव", ring(9, 0.42, -0.62, -0.18), 0.05, 0x9b6bd0),
        P("compost", "Compost / manure", "खाद / कंपोस्ट", "box", [0.34, 0.16, 0.26], [-0.62, -0.92, 0], 0xb99a63),
        P("reduce", "Reduce", "कम करें", "tier", [0.42, 0.16], [-0.86, 0.70, 0], 0x7fb069),
        P("reuse", "Reuse / repair", "पुनः उपयोग / मरम्मत", "tier", [0.42, 0.16], [0, 0.70, 0], 0xe0a02a),
        P("recycle", "Recycle", "पुनर्चक्रण", "tier", [0.42, 0.16], [0.86, 0.70, 0], 0x2f8fd8),
        P("segregation", "Segregation at source", "स्रोत पर पृथक्करण", "arrows", [0.05], [-1.15, 0.30, 0.34], 0xd4594f, { to: [1.15, 0.30, 0.34], count: 3, anim: "flow" })
      ]
    },
    /* Class X Ch 13 archive: each NCERT management lesson gets its OWN
       anatomy. Reusing waste / food-chain parts for water harvesting or
       intergenerational equity was semantically wrong even though the
       string-alignment gate passed. */
    resource_plan: {
      en: "Sustainable resource plan", hi: "सतत संसाधन योजना", ncert: "NCERT Science X · Ch 13",
      parts: [
        P("present", "Present needs", "वर्तमान आवश्यकताएँ", "tier", [0.76, 0.22], [-0.82, 0.72, 0], 0x5d8ad6),
        P("future", "Future generations", "भावी पीढ़ियाँ", "tier", [0.76, 0.22], [0.82, 0.72, 0], 0x3f9e5a),
        P("equity", "Equity in distribution", "वितरण में समानता", "sphere", [0.25], [-0.34, 0.12, 0.26], 0xe0a02a, { anim: "pulse" }),
        P("plan", "Plan for management", "प्रबंधन योजना", "box", [0.62, 0.26, 0.30], [0.62, 0.12, 0], 0x2f8fd8, { anim: "breathe" }),
        P("resources", "Shared resources", "साझा संसाधन", "torus", [0.92, 0.045], [0, -0.18, -0.22], 0x59b6a0, { rot: [Math.PI / 2, 0, 0] }),
        P("conserved", "Conserved units", "संरक्षित इकाइयाँ", "box", [0.50, 0.20, 0.28], [-1.05, -0.62, 0], 0x7fb069),
        P("participation", "Participation", "भागीदारी", "sphere", [0.19], [0.88, -0.62, 0.24], 0x9b6bd0, { anim: "pulse" }),
        P("sustainability", "Sustainability flow", "सततता प्रवाह", "arrows", [0.05], [-1.10, -0.02, 0.42], 0xffd166, { to: [1.10, 0.52, 0.42], count: 4, anim: "flow" })
      ]
    },
    forest_conservation: {
      en: "Forest & wildlife conservation", hi: "वन एवं वन्यजीव संरक्षण", ncert: "NCERT Science X · Ch 13",
      parts: [
        P("forest", "Forest cover", "वन आवरण", "tier", [1.30, 0.28], [0, -0.76, 0], 0x3f9e5a),
        P("community", "Community participation", "सामुदायिक भागीदारी", "box", [0.52, 0.24, 0.30], [-1.02, 0.18, 0], 0x5d8ad6),
        P("wildlife", "Wildlife habitat", "वन्यजीव आवास", "sphere", [0.28], [0.28, 0.42, 0.24], 0xe0a02a, { anim: "pulse" }),
        P("protection", "Protection zone", "संरक्षित क्षेत्र", "torus", [0.72, 0.045], [0.10, 0.18, -0.18], 0x2f8fd8, { rot: [Math.PI / 2, 0, 0] }),
        P("afforestation", "Afforestation", "वृक्षारोपण", "dots", [0.075], [0, 0, 0], 0x7fb069, { points: ring(7, 0.92, -0.20, 0.18) }),
        P("biodiversity", "Biodiversity", "जैव विविधता", "sphere", [0.22], [1.04, -0.36, 0.20], 0x9b6bd0, { anim: "breathe" }),
        P("chipko", "Chipko movement", "चिपको आंदोलन", "box", [0.52, 0.20, 0.28], [0.86, 0.76, 0], 0xb99a63),
        P("conservation", "Conservation flow", "संरक्षण प्रवाह", "arrows", [0.05], [-1.15, -0.02, 0.42], 0xffd166, { to: [1.10, 0.62, 0.42], count: 4, anim: "flow" })
      ]
    },
    water_harvest: {
      en: "Water harvesting & watershed", hi: "जल संचयन एवं जलग्रहण", ncert: "NCERT Science X · Ch 13",
      parts: [
        P("rain", "Rainfall", "वर्षा", "dots", [0.06], [0, 0, 0], 0x5d8ad6, { points: ring(9, 1.10, 0.82, 0.24) }),
        P("rooftop", "Rooftop harvesting", "छत जल संचयन", "box", [0.54, 0.22, 0.30], [-0.92, 0.42, 0], 0x2f8fd8),
        P("check_dam", "Check dam", "चेक डैम", "tier", [0.68, 0.24], [0.04, 0.04, 0], 0xb99a63),
        P("percolation", "Percolation tank", "रिसाव टैंक", "box", [0.48, 0.22, 0.30], [0.98, 0.38, 0], 0x59b6a0),
        P("recharge", "Groundwater recharge", "भूजल पुनर्भरण", "torus", [0.86, 0.045], [0, -0.40, -0.20], 0x3f9e5a, { rot: [Math.PI / 2, 0, 0] }),
        P("well", "Recharged well", "पुनर्भरित कुआँ", "cylinder", [0.22, 0.22, 0.46], [-0.88, -0.68, 0.14], 0x7fb069, { anim: "breathe" }),
        P("watershed", "Watershed management", "जलग्रहण प्रबंधन", "sphere", [0.24], [0.92, -0.62, 0.20], 0x9b6bd0, { anim: "pulse" }),
        P("flow", "Rain to well flow", "वर्षा से कुआँ प्रवाह", "arrows", [0.05], [-1.12, 0.72, 0.44], 0xffd166, { to: [1.05, -0.58, 0.44], count: 4, anim: "flow" })
      ]
    },
    fossil_3r: {
      en: "Fossil fuels & the 3Rs", hi: "जीवाश्म ईंधन एवं तीन R", ncert: "NCERT Science X · Ch 13",
      parts: [
        P("coal", "Coal reserve", "कोयला भंडार", "box", [0.46, 0.34, 0.30], [-1.00, 0.48, 0], 0x3f4a58),
        P("petroleum", "Petroleum reserve", "पेट्रोलियम भंडार", "box", [0.46, 0.34, 0.30], [1.00, 0.48, 0], 0x5d8ad6),
        P("judicious", "Judicious use", "विवेकपूर्ण उपयोग", "sphere", [0.22], [-0.92, -0.08, 0.20], 0x59b6a0, { anim: "pulse" }),
        P("cleaner", "Cleaner fuels", "स्वच्छ ईंधन", "sphere", [0.22], [0.92, -0.08, 0.20], 0x7fb069, { anim: "breathe" }),
        P("reduce", "Reduce", "कम करें", "tier", [0.42, 0.18], [-0.86, -0.68, 0], 0x3f9e5a),
        P("reuse", "Reuse", "पुनः उपयोग", "tier", [0.42, 0.18], [0, -0.68, 0], 0xe0a02a),
        P("recycle", "Recycle", "पुनर्चक्रण", "tier", [0.42, 0.18], [0.86, -0.68, 0], 0x2f8fd8),
        P("mining", "Less mining", "कम खनन", "arrows", [0.05], [-1.12, 0.18, 0.42], 0xffd166, { to: [1.12, 0.18, 0.42], count: 4, anim: "flow" })
      ]
    },
    diversity: {
      en: "Diversity & classification", hi: "जैव विविधता एवं वर्गीकरण", ncert: "NCERT Science IX · Ch 7",
      parts: [
        tube("trunk", "Classification", "वर्गीकरण", [[0, -1.05, 0], [0, -0.55, 0], [0, -0.10, 0]], 0.085, 0x9c7a41),
        P("branches", "Phylogenetic branches", "जातिवृत्तीय शाखाएँ", "branches", [0.055], [0, -0.10, 0], 0x3f9e5a, {
          lines: [[[0, -0.10, 0], [-0.95, 0.25, 0], [-1.25, 0.72, 0]],
                  [[0, -0.10, 0], [-0.48, 0.40, 0], [-0.58, 0.95, 0]],
                  [[0, -0.10, 0], [0, 0.55, 0], [0, 1.05, 0]],
                  [[0, -0.10, 0], [0.48, 0.40, 0], [0.58, 0.95, 0]],
                  [[0, -0.10, 0], [0.95, 0.25, 0], [1.25, 0.72, 0]]]
        }),
        dots("kingdoms", "Five kingdoms", "पाँच जगत", [[-1.25, 0.78, 0], [-0.58, 1.00, 0], [0, 1.10, 0], [0.58, 1.00, 0], [1.25, 0.78, 0]], 0.14, 0x5f9a4a),
        P("monera", "Monera", "मोनेरा", "sphere", [0.16], [-1.25, 0.78, 0.16], 0x59b6a0, { anim: "pulse" }),
        P("protista", "Protista", "प्रोटिस्टा", "sphere", [0.16], [-0.58, 1.00, 0.16], 0x4a74c4),
        P("fungi", "Fungi", "कवक", "sphere", [0.16], [0, 1.10, 0.16], 0xc23b32),
        P("plantae", "Plantae", "पादप", "sphere", [0.16], [0.58, 1.00, 0.16], 0x3f9e5a),
        P("animalia", "Animalia", "प्राणी", "sphere", [0.16], [1.25, 0.78, 0.16], 0xd18b1f),
        P("ranks", "Taxonomic ranks", "वर्गिकी श्रेणियाँ", "tier", [1.60, 0.14], [0, -0.62, -0.16], 0x9b6bd0),
        P("binomial", "Binomial nomenclature", "द्विपद नामपद्धति", "box", [0.52, 0.18, 0.16], [0, -0.92, 0.18], 0xe0a02a),
        dots("virus", "Viruses (acellular)", "विषाणु (अकोशिकीय)", ring(6, 0.30, -1.28, 0.20), 0.065, 0xd4594f)
      ]
    },
    respiration: {
      en: "Cellular respiration", hi: "कोशिकीय श्वसन", ncert: "NCERT Science X · Ch 5",
      parts: [
        P("cytoplasm", "Cytoplasm (glycolysis)", "कोशिकाद्रव्य (ग्लाइकोलिसिस)", "sphere", [0.98], [0, 0, 0], 0xf3e7bf, { opacity: 0.22, anim: "breathe" }),
        P("mito", "Mitochondrion", "माइटोकॉन्ड्रिया", "mitochondrion", [0.22, 0.52], [0.10, 0.10, 0.18], C.mitochondrion, { rot: [0, 0, 0.35], anim: "pulse" }),
        P("glucose", "Glucose (C₆H₁₂O₆)", "ग्लूकोज़", "sphere", [0.20], [-0.78, 0.58, 0.16], 0x7fb069),
        dots("oxygen", "Oxygen (O₂)", "ऑक्सीजन", ring(5, 0.20, 0.62, 0.26).map(v => [v[0] - 0.35, v[1], v[2]]), 0.065, 0x2f8fd8),
        dots("atp", "38 ATP (aerobic)", "38 ATP (वायवीय)", ring(7, 0.34, 0.30, 0.30).map(v => [v[0] + 0.25, v[1], v[2]]), 0.065, 0xffd166),
        dots("co2", "Carbon dioxide (CO₂)", "कार्बन डाइऑक्साइड", ring(5, 0.22, -0.48, 0.24), 0.07, 0xd4594f),
        dots("water", "Water (H₂O)", "जल", ring(4, 0.18, -0.72, -0.20), 0.06, 0x5d8ad6),
        P("anaerobic", "Anaerobic: 2 ATP + lactic acid", "अवायवीय: 2 ATP + लैक्टिक अम्ल", "box", [0.62, 0.18, 0.18], [0.72, -0.62, 0.20], 0x9b6bd0),
        P("energy", "Energy release", "ऊर्जा मुक्ति", "arrows", [0.055], [-0.75, -0.02, 0.42], 0xffd166, { to: [0.75, -0.02, 0.42], count: 3, anim: "flow" })
      ]
    }
  };

  /* --------------------------------------------------------------- spec() */
  function spec(world, sp) {
    const id = classify(world, sp);
    if (!id) return null;
    const m = MODELS[id] || MODELS.animal_cell;
    const f = (sp.scene && sp.scene.fig) || {};
    /* The lesson's own NCERT figure labels are FIRST-CLASS: when they name a
       real part, the 3D label uses the lesson's wording, so text and image are
       aligned in meaning as well as in position. */
    const ownText = [sp.fig, sp.figHi, sp.concept, sp.conceptHi, sp.title, sp.titleHi,
      sp.explain, sp.explainHi, sp.tryHint, sp.hintHi,
      sp.formula && sp.formula.eq, sp.formula && sp.formula.note]
      .filter(Boolean).join(" · ");
    const bits = ownText.split(/[·→|—,;:.()]+/).map(v => String(v).trim()).filter(Boolean);
    const words = ownText.split(/\s+/).map(v => v.replace(/[^\w\u0900-\u097F₋⁺⁻]/g, ""))
      .filter(v => v.length > 3);
    const vocab = (sp.vocab || []).map(v => String((v || [])[0] || "").trim()).filter(Boolean);
    const figLabels = (f.labels || []).map(v => String(v).trim()).filter(Boolean);
    /* Lesson wording is ALWAYS included. Earlier versions used only fig.labels
       when present, so archive chapters with abstract atlas labels could never
       share a term with their NCERT anatomical model. */
    const lessonLabels = [...new Set(figLabels.concat(bits, vocab, words))]
      .filter(v => v.length > 1).slice(0, 16);
    const low = lessonLabels.map(v => v.toLowerCase());
    let shared = 0;
    const parts = m.parts.map(p => {
      const b = p.en.toLowerCase(), key = b.split(" ")[0];
      let hit = null;
      low.forEach((a, i) => {
        if (!hit && a.length > 2 && (b.indexOf(a) >= 0 || a.indexOf(key) >= 0 ||
            p.hi.indexOf(lessonLabels[i]) >= 0)) hit = lessonLabels[i];
      });
      if (hit) shared++;
      /* NEVER overwrite an NCERT-anatomical name with a vague lesson word:
         "Cell wall" stays "Cell wall". The lesson term is recorded as an
         alignment link instead (biology correctness outranks string matching). */
      return Object.assign({}, p, { alignedTo: hit || "" });
    });
    const rt = route(world, sp);
    return {
      model: id, en: m.en, hi: m.hi, ncert: m.ncert,
      section: "" + (sp.section || ""), cls: (world && world.cls) || "IX",
      subject: (world && world.subject) || "bio",
      caption: String(sp.fig || ""), captionHi: String(sp.figHi || sp.fig || ""),
      routedBy: rt.by, shared: shared,
      parts: parts, labels: parts.filter(p => p.label !== false),
      lessonLabels: lessonLabels, repos: REPOS.slice(),
      source: (world && world.source) || "CBSE / NCERT"
    };
  }

  /* ------------------------------------------------------------- geometry */
  function material(d) {
    const op = d.opacity === undefined ? 1 : d.opacity;
    /* Projector-safe: the studio lights are bright, so anatomy must be
       inked DARKER than the page. Pastel organelles disappear on a white
       smart board; this is a contrast fix, not a decorative restyle. */
    const ink = new THREE.Color(d.color).multiplyScalar(0.66);
    return new THREE.MeshStandardMaterial({
      color: ink, roughness: d.rough === undefined ? 0.48 : d.rough,
      metalness: d.metal === undefined ? 0.06 : d.metal,
      transparent: op < 1, opacity: op, depthWrite: op >= 1,
      emissive: ink, emissiveIntensity: 0.28, side: THREE.DoubleSide
    });
  }
  function tubeGeo(pts, r, seg) {
    const curve = new THREE.CatmullRomCurve3(pts.map(p => V(p[0], p[1], p[2])));
    return new THREE.TubeGeometry(curve, Math.min(seg || 28, 18), r, 6, false);
  }
  function shapeMesh(parent, d) {
    const g = new THREE.Group();
    g.position.set(d.pos[0], d.pos[1], d.pos[2]);
    if (d.rot) g.rotation.set(d.rot[0], d.rot[1], d.rot[2]);
    parent.add(g);
    const m = material(d), s = d.size || [0.2], add = geo => g.add(new THREE.Mesh(geo, m));
    /* Thin tubes / dots would vanish at 30 ft; thicken the anatomy itself
       (leader lines and labels are untouched). */
    const R = s[0] * (d.shape === "tube" || d.shape === "branches" ? 1.70
                    : d.shape === "dots" || d.shape === "arrows" ? 1.35 : 1);
    switch (d.shape) {
      case "sphere": add(new THREE.SphereGeometry(R, 16, 12)); break;
      case "ellipsoid": { const q = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), m); q.scale.set(s[0], s[1], s[2]); g.add(q); break; }
      case "box": add(new THREE.BoxGeometry(s[0], s[1], s[2])); break;
      case "capsule": add(new THREE.CapsuleGeometry(s[0], s[1], 3, 8)); break;
      case "cylinder": add(new THREE.CylinderGeometry(s[0], s[1] === undefined ? s[0] : s[1], s[2], 12)); break;
      case "cone": add(new THREE.ConeGeometry(s[0], s[1], 16)); break;
      case "torus": { const t = new THREE.Mesh(new THREE.TorusGeometry(s[0], s[1], 6, 24), m); g.add(t); break; }
      case "tube": add(tubeGeo(d.pts || [[-0.4, 0, 0], [0.4, 0, 0]], R)); break;
      case "dots": (d.points || []).forEach(p => { const q = new THREE.Mesh(new THREE.SphereGeometry(R, 8, 6), m); q.position.set(p[0], p[1], p[2]); g.add(q); }); break;
      case "branches": (d.lines || []).forEach(l => g.add(new THREE.Mesh(tubeGeo(l, R, 14), m))); break;
      case "arrows": {
        const a = d.pos, b = d.to || [a[0] + 0.6, a[1], a[2]], n = d.count || 3;
        for (let i = 0; i < n; i++) {
          const t = i / Math.max(1, n - 1);
          const q = new THREE.Mesh(new THREE.ConeGeometry(R, R * 2.6, 8), m);
          q.position.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
          q.rotation.z = -Math.PI / 2 + Math.atan2(b[1] - a[1], b[0] - a[0]);
          g.add(q);
        }
        break;
      }
      case "chromosome": {
        [0.6, -0.6].forEach(r => { const q = new THREE.Mesh(new THREE.CapsuleGeometry(s[0], s[1], 3, 8), m); q.rotation.z = r; g.add(q); });
        break;
      }
      case "mitochondrion": {
        const q = new THREE.Mesh(new THREE.CapsuleGeometry(s[0], s[1], 3, 8), m); q.rotation.z = Math.PI / 2; g.add(q);
        const mat2 = material(Object.assign({}, d, { color: 0xffffff, opacity: 0.6 }));
        for (let i = -2; i <= 2; i++) {
          const w = new THREE.Mesh(new THREE.TorusGeometry(s[0] * 0.72, 0.012, 4, 12, Math.PI), mat2);
          w.position.x = i * s[1] * 0.22; w.rotation.y = Math.PI / 2; g.add(w);
        }
        break;
      }
      case "cristae": {
        const q = new THREE.Mesh(new THREE.CapsuleGeometry(s[0], s[1], 3, 8), m); q.rotation.z = Math.PI / 2; g.add(q);
        break;
      }
      case "er": {
        for (let i = 0; i < 4; i++) {
          const y = -0.18 + i * 0.12;
          g.add(new THREE.Mesh(tubeGeo([[-0.32, y, 0], [-0.10, y + 0.10, 0], [0.12, y - 0.08, 0], [0.34, y + 0.06, 0]], s[0], 24), m));
        }
        break;
      }
      case "golgi": {
        for (let i = 0; i < 5; i++) {
          const q = new THREE.Mesh(new THREE.CylinderGeometry(s[0] * (1 - i * 0.09), s[0] * (1 - i * 0.09), 0.035, 14), m);
          q.position.y = -0.18 + i * 0.09; g.add(q);
        }
        break;
      }
      case "chloroplast": {
        const q = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), m); q.scale.set(s[0], s[1], s[2]); g.add(q);
        const m2 = material(Object.assign({}, d, { color: 0x2f7f45 }));
        for (let i = -1; i <= 1; i++) for (let j = 0; j < 3; j++) {
          const d2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8), m2);
          d2.position.set(i * 0.10, 0, j * 0.035 - 0.035); g.add(d2);
        }
        break;
      }
      case "grana": {
        for (let i = 0; i < 5; i++) {
          const q = new THREE.Mesh(new THREE.CylinderGeometry(s[0], s[0], 0.016, 10), m);
          q.position.y = i * 0.035; g.add(q);
        }
        break;
      }
      case "myelin": {
        (d.segments || []).forEach(p => {
          const q = new THREE.Mesh(new THREE.CylinderGeometry(s[0], s[0], s[1], 12), m);
          q.position.set(p[0], p[1], p[2]); q.rotation.z = Math.PI / 2; g.add(q);
        });
        break;
      }
      case "helix": {
        const r = s[0], h = s[1], turns = s[2], thick = s[3] || 0.035, ph = d.phase || 0;
        const pts = [];
        for (let i = 0; i <= 90; i++) {
          const t = i / 90, a = t * turns * Math.PI * 2 + ph;
          pts.push([Math.cos(a) * r, (t - 0.5) * h, Math.sin(a) * r]);
        }
        g.add(new THREE.Mesh(tubeGeo(pts, thick, 48), m));
        break;
      }
      case "rungs": {
        const r = s[0], h = s[1], turns = s[2];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20, a = t * turns * Math.PI * 2;
          const x = Math.cos(a) * r, z = Math.sin(a) * r, y = (t - 0.5) * h;
          const mat2 = material(Object.assign({}, d, { color: i % 3 ? C.gc : C.at }));
          const q = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, r * 2, 6), mat2);
          q.position.set(0, y, 0); q.rotation.z = Math.PI / 2; q.rotation.y = -a; g.add(q);
        }
        break;
      }
      case "glomerulus": {
        for (let i = 0; i < 5; i++) {
          const a = i / 5 * Math.PI * 2;
          g.add(new THREE.Mesh(tubeGeo([[0, -0.2, 0], [Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22],
                                        [Math.cos(a + 1) * 0.18, 0.2, Math.sin(a + 1) * 0.18]], 0.028, 20), m));
        }
        break;
      }
      case "petals": {
        const n = d.count || 6;
        for (let i = 0; i < n; i++) {
          const a = i / n * Math.PI * 2 + (d.phase || 0);
          const q = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), m);
          q.scale.set(s[0], s[1], s[2]); q.position.set(Math.cos(a) * 0.50, 0, Math.sin(a) * 0.50);
          q.rotation.z = -a; g.add(q);
        }
        break;
      }
      case "stamen": {
        const n = d.count || 5;
        for (let i = 0; i < n; i++) {
          const a = i / n * Math.PI * 2;
          const f = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, s[1], 6), m);
          f.position.set(Math.cos(a) * 0.26, s[1] / 2, Math.sin(a) * 0.26); g.add(f);
          const an = new THREE.Mesh(new THREE.SphereGeometry(s[0], 10, 8), m);
          an.position.set(Math.cos(a) * 0.26, s[1], Math.sin(a) * 0.26); g.add(an);
        }
        break;
      }
      case "pistil": {
        const st = new THREE.Mesh(new THREE.CylinderGeometry(s[0] * 0.28, s[0] * 0.34, s[1], 10), m);
        st.position.y = s[1] / 2; g.add(st);
        const sg = new THREE.Mesh(new THREE.SphereGeometry(s[0] * 0.62, 14, 10), m);
        sg.position.y = s[1] + 0.06; g.add(sg);
        const ov = new THREE.Mesh(new THREE.SphereGeometry(s[0] * 1.1, 16, 12), m);
        ov.position.y = -0.14; g.add(ov);
        break;
      }
      case "cells": {
        const n = d.count || 6;
        for (let i = 0; i < n; i++) {
          const q = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), m);
          q.scale.set(s[0], s[1], 0.22); q.position.set((i - (n - 1) / 2) * (s[0] * 1.7), 0, 0); g.add(q);
        }
        break;
      }
      case "tier": {
        const q = new THREE.Mesh(new THREE.BoxGeometry(s[0], s[1], 0.34), m);
        g.add(q); break;
      }
      case "grid": {
        const w = s[0];
        for (let i = 0; i < 4; i++) {
          const q = new THREE.Mesh(new THREE.BoxGeometry(w * 0.44, w * 0.42, 0.05), m);
          q.position.set((i % 2 ? 1 : -1) * w * 0.24, (i < 2 ? 1 : -1) * w * 0.23, 0);
          g.add(q);
        }
        break;
      }
      case "coil": {
        for (let i = 0; i < 4; i++) {
          const pts = [];
          for (let k = 0; k <= 24; k++) {
            const a = k / 24 * Math.PI * 2;
            pts.push([Math.cos(a) * (0.44 + i * 0.10), -0.12 + i * 0.20, Math.sin(a) * 0.26]);
          }
          g.add(new THREE.Mesh(tubeGeo(pts, s[0], 24), m));
        }
        break;
      }
      default: add(new THREE.SphereGeometry(s[0], 12, 9));
    }
    g.userData.anchor = V(d.pos[0], d.pos[1], d.pos[2]);
    g.userData.anim = d.anim || "";
    g.userData.baseScale = g.scale.clone();
    return g;
  }

  /* -------------------------------------------------- ALIGNED label columns */
  function build(parent, specObj) {
    const root = new THREE.Group(); parent.add(root);
    /* the specimen occupies the centre; the two label columns stay fixed.
       Scaling ONLY the anatomy keeps the leader-line endpoints honest. */
    const specimen = new THREE.Group(); root.add(specimen);
    const partMeshes = [], tags = [], leaders = [], boxes = [];
    specObj.parts.forEach(d => {
      const g = shapeMesh(specimen, d);
      partMeshes.push({ data: d, group: g });
    });
    /* Every NCERT specimen is fitted to the SAME central window. A neuron is
       long and thin, a cell is round — both must be fully visible between the
       two aligned label columns instead of being clipped by the frame. */
    specimen.updateMatrixWorld(true);
    let bx = null; try { bx = new THREE.Box3().setFromObject(specimen); } catch (e) {}
    const sz = bx && !bx.isEmpty() ? bx.getSize(V(0, 0, 0)) : V(2, 2, 2);
    /* Long horizontal specimens (a neuron's axon, a leaf blade) would hide
       behind the two label columns. Textbook anatomy draws a neuron upright:
       rotate ONLY wide specimens so the whole structure stays in the clear
       central window. Round cells / DNA helices keep their true orientation. */
    const WIDE = sz.x > sz.y * 1.30, ROTZ = WIDE ? Math.PI / 2 : 0;
    const w2 = WIDE ? sz.y : sz.x, h2 = WIDE ? sz.x : sz.y;
    const K = Math.max(0.42, Math.min(1.45,
      2.55 / Math.max(w2, 0.1), 2.30 / Math.max(h2, 0.1)));
    specimen.rotation.z = ROTZ; specimen.scale.setScalar(K); specimen.position.set(0, 0, 0);
    specimen.updateMatrixWorld(true);
    let b2 = null; try { b2 = new THREE.Box3().setFromObject(specimen); } catch (e) {}
    const c2 = b2 && !b2.isEmpty() ? b2.getCenter(V(0, 0, 0)) : V(0, 0, 0);
    specimen.position.set(-c2.x, -c2.y, -c2.z);
    const anchorOf = d => V(d.pos[0], d.pos[1], d.pos[2])
      .applyAxisAngle(V(0, 0, 1), ROTZ).multiplyScalar(K).sub(c2);
    /* A classroom plate must be READABLE at 30 ft. Ten aligned labels is the
       physical maximum for two 5-row columns; the remaining parts are still
       rendered as real 3D anatomy and appear in the accessible 2D plate. */
    const all = specObj.labels.slice();
    all.sort((a, b) => (b.alignedTo ? 1 : 0) - (a.alignedTo ? 1 : 0));
    const labelled = all.slice(0, 8);
    const left = [], right = [];
    labelled.forEach((d, i) => (i % 2 ? right : left).push(d));
    const yFor = (i, n) => 1.20 - i * (2.40 / Math.max(1, n - 1));
    const place = (d, i, list, side) => {
      const x = side * 2.08, y = yFor(i, list.length), z = 0.86;
      const anchor = anchorOf(d);
      const en = String(d.en).replace(/\s*\(.*?\)/g, "");
      const hi = String(d.hi);
      const t = G3.tag(root, en + "\n" + hi, 1.44, 0.50, {
        pos: [x, y, z], size: 46, bg: "#ffffff", border: "#1c4d7a", fg: "#0b1620"
      });
      /* uniform slight tilt toward the projector camera — NOT per-tag
         billboarding, which skews the two columns out of alignment */
      t.rotation.x = -0.30;
      t.userData.isFigureLabel = true; tags.push(t);
      const edgeX = side < 0 ? x + 0.72 : x - 0.72;
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([anchor, V(edgeX, y, z)]),
        new THREE.LineBasicMaterial({ color: 0x3a7ab5, transparent: true, opacity: 0.55 }));
      root.add(line); leaders.push(line);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0x1c4d7a }));
      dot.position.copy(anchor); root.add(dot);
      boxes.push({ side: side, x: x, y: y, h: 0.50, id: d.id });
    };
    left.forEach((d, i) => place(d, i, left, -1));
    right.forEach((d, i) => place(d, i, right, 1));
    let overlaps = 0;
    ["-1", "1"].forEach(side => {
      const b = boxes.filter(v => String(v.side) === side).sort((a, c) => a.y - c.y);
      for (let i = 1; i < b.length; i++) if (Math.abs(b[i].y - b[i - 1].y) < 0.52) overlaps++;
    });
    const aligned = overlaps === 0 && boxes.every(b => Math.abs(Math.abs(b.x) - 2.08) < 0.001);
    const motion = { v: 0 };
    return {
      spec: specObj, parts: partMeshes, tags: tags, leaders: leaders, boxes: boxes, motion: motion,
      labelCount: labelled.length,
      aligned: aligned, labelOverlaps: overlaps, columns: [left.length, right.length],
      update(model, dt, time, camera) {
        let act = 0;
        try { act = Math.abs(Math.round(Number(model && model.active) || 0)) % Math.max(1, labelled.length); } catch (e) {}
        partMeshes.forEach((pm, i) => {
          const g = pm.group, a = g.userData.anim, s = 1;
          if (a === "breathe") g.scale.setScalar(1 + Math.sin(time * 1.4) * 0.022);
          else if (a === "pulse" || i === act) g.scale.setScalar(1 + Math.sin(time * 2.8) * 0.055);
          else if (a === "beat") g.scale.setScalar(1 + Math.sin(time * 3.4) * 0.05);
          else if (a === "drift") { g.position.y = pm.data.pos[1] + Math.sin(time * 0.9 + i) * 0.035; }
          else if (a === "spin" || a === "helix") g.rotation.y += dt * 0.42;
          else if (a === "flow") { g.children.forEach((c, k) => { c.position.x = pm.data.pos[0] + Math.sin(time * 1.6 + k) * 0.06; }); }
          else g.scale.setScalar(s);
        });
        motion.v = partMeshes.length ? partMeshes[act % partMeshes.length].group.scale.x : 0;
        /* billboard only the labels: the two aligned columns stay put, so a
           biology plate reads like a textbook, not like a spinning toy. */
        if (camera) tags.forEach(t => { t.rotation.x = -0.30; t.rotation.y = 0; });
      }
    };
  }

  /* --------------------------------------- precision 2D from the SAME spec */
  function svg2D(specObj, model, esc) {
    const L = specObj.labels, half = Math.max(1, Math.ceil(L.length / 2));
    const yFor = k => 100 + k * (330 / Math.max(1, half - 1));
    const E = esc || (s => String(s));
    let svg = `<text x="450" y="60" class="pl" style="font-size:22px">${E(specObj.en)} · ${E(specObj.hi)}</text>`;
    svg += `<ellipse cx="450" cy="300" rx="150" ry="140" fill="none" stroke="#4ad6ff" stroke-width="2" opacity=".55"/>`;
    /* central schematic: concentric anatomy rings from the same part list */
    L.forEach((p, i) => {
      const a = i / L.length * Math.PI * 2 - Math.PI / 2;
      const cx = 450 + Math.cos(a) * 112, cy = 300 + Math.sin(a) * 96;
      svg += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="24" fill="#${Number(p.color || 0x5d8ad6).toString(16).padStart(6, "0")}" opacity="${i === Math.abs(Math.round(Number(model && model.active) || 0)) % L.length ? ".95" : ".62"}"/>`;
      svg += `<line x1="450" y1="300" x2="${cx.toFixed(0)}" y2="${cy.toFixed(0)}" stroke="#9fb9cf" stroke-width="2"/>`;
    });
    L.forEach((p, i) => {
      const side = i % 2 ? 1 : -1, x = side < 0 ? 30 : 690, y = yFor(Math.floor(i / 2));
      svg += `<rect x="${x}" y="${y - 22}" width="180" height="40" rx="7" fill="#1d3550" stroke="#4ad6ff" stroke-width="1.5"/>`;
      svg += `<text x="${x + 8}" y="${y + 2}" class="pl" style="font-size:14px">${E(String(p.en))}</text>`;
      svg += `<text x="${x + 8}" y="${y + 16}" class="pl" style="font-size:12px;fill:#7ee0b8">${E(String(p.hi))}</text>`;
      svg += `<line x1="${side < 0 ? x + 180 : x}" y1="${y}" x2="${side < 0 ? 330 : 570}" y2="300" stroke="#4ad6ff" stroke-width="1.5" opacity=".7"/>`;
    });
    svg += `<text x="450" y="528" class="pl" style="font-size:14px">${E(specObj.ncert)} · ${E(specObj.section)} · 3D + 2D share one declarative spec</text>`;
    return svg;
  }

  return { REPOS, MODELS, RULES, classify, spec, build, svg2D };
})();
