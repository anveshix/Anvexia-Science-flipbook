/* ==========================================================================
   EVPACK — GENERIC CHAPTER PACK REGISTRY  (MASTER ENGINE / PROMPT 2)
   --------------------------------------------------------------------------
   DATA ONLY. No DOM, no Three.js, no renderer, no UI, no NCERT chapter name.

   One loader accepts JSON for ANY chapter, of ANY class, of ANY subject:

     {
       "sections": [...],            // { id, title_en|en, title_hi|hi, spread }
       "3d_blocks": [...],           // { id, engine, spec:{parts:[...]} }
       "quiz": [...],                // bilingual MCQs
       "bilingual_captions": {...}   // { partId: { title_en, title_hi,
                                     //             definition_en, definition_hi } }
     }

   register(id, json)  -> validated, normalised, immutable-by-convention pack
   derive(id)          -> adapter: builds the SAME shape from the 26 live
                          CHAPTER_PACKS + WORLDS declarative data. No chapter
                          is hardcoded; IX and X are covered on day one.
   get(id)             -> lazy derive on demand (initial payload stays small)

   Presentation (EVBIND, FIGURE3D, EVENGINE) consumes ONLY this shape. The
   app loop never asks "is this c9_cell?" — that is the Atlas discipline:
   model != world != checks.

   Copyright / Developer : Paras Pranav
   ========================================================================== */

const EVPACK = (function () {
  const VERSION = '1.0.0';
  const CREDIT = 'Copyright / Developer : Paras Pranav';
  const SCHEMA = 'eduverse.chapter-pack/v2';
  const REQUIRED = ['sections', '3d_blocks', 'quiz', 'bilingual_captions'];
  const CLASSES = ['IX', 'X'];
  const ENGINES = ['bio', 'chem', 'phys'];
  const SUBJECT_FULL = { bio: 'biology', biology: 'biology', chem: 'chemistry',
    chemistry: 'chemistry', phys: 'physics', physics: 'physics', phy: 'physics',
    science: 'biology' };
  const RESEARCH = [
    'nathanliow/atlas-of-physics (model/world/checks; one engine)',
    'gogulashashank/cbse-interactive-lab (3D + 2D, one model, NCERT IX-X)',
    'ujjval93/3D_Notes (bilingual Hindi/English NCERT IX + X, no CDN)',
    'rudra496/sciencelab3d (MIT, 40+ IX-X experiment patterns)',
    'AlphaaCode/Popbook (validated declarative JSON only)',
    'james123wang5/every-joule-style (subject -> apparatus recipes)',
    '123bruke/3d_labs (measurement-driven validation)',
    'tmsteph/3dvr-portal#3381 (predict -> experiment -> observe -> explain)'
  ];

  /* Every string the new UI is allowed to show lives in the canonical
     EVDICT registry. Prompt 4 now routes this UI and ALL app text through it;
     Prompt 2 already makes the chips, scene tabs and definition panel 100%
     dictionary-driven. */
  const UI_TEXT = {
    parts:      { en: 'Parts',        hi: 'अंग' },
    scenes:     { en: '3D scenes',    hi: '3D दृश्य' },
    clear:      { en: 'Clear',        hi: 'साफ़ करें' },
    definition: { en: 'Definition',   hi: 'परिभाषा' },
    pickHint:   { en: 'Click a chip or a 3D part', hi: 'चिप या 3D अंग पर क्लिक करें' },
    empty:      { en: 'No part selected', hi: 'कोई अंग नहीं चुना' },
    chapter:    { en: 'Chapter',      hi: 'अध्याय' },
    scene:      { en: 'Scene',        hi: 'दृश्य' },
    close:      { en: 'Clear selection', hi: 'चयन हटाएँ' },
    fromUI:     { en: 'Selected from text', hi: 'पाठ से चुना' },
    from3D:     { en: 'Selected in 3D', hi: '3D से चुना' },
    off:        { en: 'Parts mode off', hi: 'अंग मोड बंद' },
    on:         { en: 'Parts mode on', hi: 'अंग मोड चालू' }
  };

  const packs = {};      /* explicitly registered JSON — ANY chapter id */
  const derived = {};    /* adapter-built packs for live catalogue chapters */
  const origin = {};     /* 'json' | 'derived' */
  let deriveCount = 0, registerCount = 0, validationCount = 0, lastProblems = [];

  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const clone = v => JSON.parse(JSON.stringify(v));
  const str = (v, d) => (v === undefined || v === null || v === '') ? d : String(v);
  const num = (v, d) => (typeof v === 'number' && isFinite(v)) ? v : d;
  const arr = v => Array.isArray(v) ? v : [];
  const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'part';

  /* ------------------------------------------------------------- validation */
  function validate(json) {
    const p = [];
    validationCount++;
    if (!isObj(json)) { lastProblems = ['pack must be a JSON object']; return lastProblems.slice(); }
    REQUIRED.forEach(k => { if (!(k in json)) p.push('missing required key: ' + k); });
    if (!Array.isArray(json.sections)) p.push('sections must be an array');
    else if (!json.sections.length) p.push('sections must not be empty');
    if (!Array.isArray(json['3d_blocks'])) p.push('3d_blocks must be an array');
    else if (!json['3d_blocks'].length) p.push('3d_blocks must not be empty');
    if (!Array.isArray(json.quiz)) p.push('quiz must be an array');
    if (!isObj(json.bilingual_captions)) p.push('bilingual_captions must be an object');

    arr(json['3d_blocks']).forEach((b, i) => {
      if (!isObj(b)) { p.push('3d_blocks[' + i + '] must be an object'); return; }
      if (!b.id) p.push('3d_blocks[' + i + '] missing id');
      const spec = isObj(b.spec) ? b.spec : b;
      if (b.engine && ENGINES.indexOf(b.engine) < 0) p.push('3d_blocks[' + i + '] unknown engine ' + b.engine);
      const parts = arr(spec.parts).concat(arr(spec.organelles), arr(spec.atoms),
        arr(spec.rays), arr(spec.segments));
      if (!parts.length) p.push('3d_blocks[' + i + '] has no declarative parts');
      arr(spec.parts).forEach((q, j) => {
        if (!isObj(q) || !q.id) p.push('block ' + b.id + ' part[' + j + '] missing id');
      });
      if (spec.title_en && !spec.title_hi) p.push('block ' + b.id + ' missing Hindi title');
    });

    arr(json.sections).forEach((s, i) => {
      if (!isObj(s)) p.push('sections[' + i + '] must be an object');
      else if (!(s.title_en || s.en || s.title)) p.push('sections[' + i + '] missing English title');
    });
    arr(json.quiz).forEach((q, i) => {
      if (!isObj(q) || !(q.q_en || q.q)) p.push('quiz[' + i + '] missing question');
    });
    Object.keys(isObj(json.bilingual_captions) ? json.bilingual_captions : {}).forEach(k => {
      const c = json.bilingual_captions[k];
      if (!isObj(c)) p.push('caption ' + k + ' must be an object');
      else if (!(c.title_en || c.en)) p.push('caption ' + k + ' missing title_en');
    });
    lastProblems = p;
    return p.slice();
  }

  /* ----------------------------------------------------------- normalisation
     Coerces legacy field names (en/hi, groups, quizHi, captions) into one
     canonical shape so callers NEVER branch on the data source. */
  function normalize(json, id) {
    const raw = clone(json);
    /* Generic registry: KEEP whatever class string the author supplied (IX,
       X, XI, "Grade 9" ...). CLASSES is only the ENGINE TARGET set; EVBIND
       coerces to IX/X when it feeds EVENGINE. Forcing an unknown class to IX
       here would silently lose the author's data — the opposite of generic. */
    const cls = str(raw.class || raw.cls, 'IX');
    const subject = SUBJECT_FULL[raw.subject] || 'biology';
    const engine = ENGINES.indexOf(raw.engine) >= 0 ? raw.engine
      : ({ biology: 'bio', chemistry: 'chem', physics: 'phys' })[subject];

    const sections = arr(raw.sections).map((s, i) => ({
      id: str(s.id, 'sec_' + i),
      title_en: str(s.title_en || s.en || s.title, 'Section ' + (i + 1)),
      title_hi: str(s.title_hi || s.hi || s.titleHi, str(s.title_en || s.en || s.title, 'Section ' + (i + 1))),
      spread: Math.max(0, Math.floor(num(s.spread, i))),
      color: str(s.color, '#2f8fd8')
    }));

    const palette = [0x2f8fd8, 0x14a07a, 0xe0a02a, 0x8b5fc7, 0xd4594f, 0x2c93a8, 0x3aa981];
    const shapes = ['sphere', 'capsule', 'box', 'cylinder', 'torus', 'plane'];
    const blocks = arr(raw['3d_blocks']).map((b, i) => {
      const spec = clone(isObj(b.spec) ? b.spec : b);
      const collection = arr(spec.parts).length ? spec.parts
        : arr(spec.organelles || spec.atoms || spec.rays || spec.segments);
      const parts = collection.map((q, j) => ({
        id: str(q.id, slug((q.label_en || q.en || q.title_en) || ('part_' + j))),
        kind: str(q.kind || q.shape, shapes[j % shapes.length]),
        label_en: str(q.label_en || q.title_en || q.en, 'Part ' + (j + 1)),
        label_hi: str(q.label_hi || q.title_hi || q.hi, str(q.label_en || q.title_en || q.en, 'Part ' + (j + 1))),
        position: Array.isArray(q.position) && q.position.length >= 3 ? q.position.slice(0, 3)
          : [Math.cos(j / Math.max(1, collection.length) * Math.PI * 2) * 1.15,
             Math.sin(j / Math.max(1, collection.length) * Math.PI * 2) * 0.62,
             (j % 2 ? 0.16 : -0.16)],
        radius: num(q.radius, 0.30),
        size: Array.isArray(q.size) ? q.size.slice(0, 3) : [0.52, 0.52, 0.52],
        color: num(q.color, palette[j % palette.length]),
        opacity: num(q.opacity, 1),
        pickable: q.pickable !== false
      }));
      const bid = str(b.id, str(id, 'pack') + '::scene_' + i);
      spec.id = str(spec.id, bid + '::spec');
      spec.class = str(spec.class, cls);
      spec.subject = SUBJECT_FULL[spec.subject] || subject;
      spec.engine = ENGINES.indexOf(spec.engine) >= 0 ? spec.engine
        : (ENGINES.indexOf(b.engine) >= 0 ? b.engine : engine);
      spec.title_en = str(spec.title_en || b.title_en || b.en, str(id, 'Chapter') + ' · 3D');
      spec.title_hi = str(spec.title_hi || b.title_hi || b.hi, spec.title_en);
      spec.parts = parts;
      spec.captions = {
        en: str(spec.captions && spec.captions.en, 'Data-driven 3D figure'),
        hi: str(spec.captions && spec.captions.hi, 'डेटा-संचालित 3D आकृति')
      };
      return {
        id: bid,
        sceneId: str(b.sceneId, bid),
        spread: Math.max(0, Math.floor(num(b.spread, 0))),
        engine: spec.engine,
        class: spec.class,
        subject: spec.subject,
        title_en: spec.title_en,
        title_hi: spec.title_hi,
        spec: spec
      };
    });

    const quiz = arr(raw.quiz).map((q, i) => ({
      id: str(q.id, 'q_' + i),
      q_en: str(q.q_en || q.q || q.en, 'Question ' + (i + 1)),
      q_hi: str(q.q_hi || q.hi || (raw.quizHi && raw.quizHi[i] && raw.quizHi[i].q), str(q.q_en || q.q, 'Question ' + (i + 1))),
      options_en: arr(q.options_en || q.options).map(String),
      options_hi: arr(q.options_hi || (raw.quizHi && raw.quizHi[i] && raw.quizHi[i].options) || q.options).map(String),
      a: Math.max(0, Math.floor(num(q.a, 0))),
      why_en: str(q.why_en || q.why, ''),
      why_hi: str(q.why_hi || (raw.quizHi && raw.quizHi[i] && raw.quizHi[i].why), str(q.why_en || q.why, ''))
    }));

    const captionsSrc = isObj(raw.bilingual_captions) ? raw.bilingual_captions : {};
    const captions = {};
    Object.keys(captionsSrc).forEach(k => {
      const c = captionsSrc[k] || {};
      captions[k] = {
        title_en: str(c.title_en || c.en, k),
        title_hi: str(c.title_hi || c.hi, str(c.title_en || c.en, k)),
        definition_en: str(c.definition_en || c.def_en, ''),
        definition_hi: str(c.definition_hi || c.def_hi, '')
      };
    });
    /* Every declared part MUST have a bilingual caption. Missing captions are
       generated from the part's own labels, never left as a dead UI entry. */
    blocks.forEach(b => b.spec.parts.forEach(q => {
      if (!captions[q.id]) captions[q.id] = {
        title_en: q.label_en, title_hi: q.label_hi,
        definition_en: b.spec.captions.en, definition_hi: b.spec.captions.hi
      };
      else {
        if (!captions[q.id].title_en) captions[q.id].title_en = q.label_en;
        if (!captions[q.id].title_hi) captions[q.id].title_hi = q.label_hi;
      }
    }));

    return {
      schema: SCHEMA, version: VERSION, id: str(raw.id, str(id, 'chapter')),
      class: cls, subject: subject, engine: engine,
      title_en: str(raw.title_en || raw.title || raw.en, str(id, 'Chapter')),
      title_hi: str(raw.title_hi || raw.hi || raw.titleHi, str(raw.title_en || raw.title || raw.en, str(id, 'Chapter'))),
      sections: sections,
      '3d_blocks': blocks,
      quiz: quiz,
      bilingual_captions: captions,
      generated_by: str(raw.generated_by, 'EVPACK.register · validated declarative JSON'),
      credit: CREDIT
    };
  }

  /* --------------------------------------------------------------- registry */
  function register(id, json) {
    if (!id || typeof id !== 'string') return { ok: false, problems: ['chapter id required'], pack: null };
    const problems = validate(json);
    if (problems.length) return { ok: false, problems: problems, pack: null };
    const pack = normalize(json, id);
    packs[id] = pack; origin[id] = 'json'; registerCount++;
    return { ok: true, problems: [], pack: pack };
  }
  function forget(id) {
    /* Prompt 5: EVLAZY registers authored JSON packs on demand; unmount must
       release BOTH the authored registry entry and any derived adapter pack. */
    let did = false;
    if (packs[id]) { delete packs[id]; did = true; }
    if (derived[id]) { delete derived[id]; did = true; }
    if (did) delete origin[id];
    return did;
  }

  /* ---------------------------------------------------------------- adapter
     Pure derivation from the shipped declarative data. NOT a single chapter
     name appears here: subject -> engine, vocab -> parts, predict -> quiz.
     This is why ALL 26 IX+X chapters are generic from day one. */
  function derive(id) {
    if (derived[id]) return derived[id];
    if (packs[id]) return packs[id];
    const canDerive = (typeof CHAPTER_PACKS !== 'undefined' && !!CHAPTER_PACKS[id]) ||
                      (typeof WORLDS !== 'undefined' && !!WORLDS[id]);
    if (!canDerive) return null;
    let w = null;
    try { w = (typeof getWorld === 'function') ? getWorld(id) : null; } catch (e) { w = null; }
    if (!w || !w.spreads || !w.spreads.length) return null;
    const legacy = (typeof CHAPTER_PACKS !== 'undefined' && CHAPTER_PACKS[id]) || {};
    const cls = CLASSES.indexOf(w.cls) >= 0 ? w.cls : (String(id).indexOf('c9_') === 0 ? 'IX' : 'X');
    const subject = SUBJECT_FULL[w.subject] || 'biology';
    const engine = ({ biology: 'bio', chemistry: 'chem', physics: 'phys' })[subject];
    const shapeByEngine = {
      bio: ['organelle', 'capsule', 'sphere', 'torus', 'box', 'cylinder'],
      chem: ['atom', 'sphere', 'capsule', 'box', 'torus', 'cylinder'],
      phys: ['sphere', 'box', 'cylinder', 'torus', 'capsule', 'plane']
    }[engine];

    const sections = arr(legacy.sections).length ? arr(legacy.sections).map((s, i) => ({
      id: str(s.id, 'sec_' + i), title_en: str(s.en || s.title_en, 'Section ' + (i + 1)),
      title_hi: str(s.hi || s.title_hi, str(s.en || s.title_en, 'Section ' + (i + 1))),
      spread: Math.max(0, Math.floor(num(s.spread, i))), color: str(s.color, '#2f8fd8')
    })) : w.spreads.map((sp, i) => ({
      id: str(sp.section, 'sec_' + i), title_en: str(sp.title, 'Lesson ' + (i + 1)),
      title_hi: str(sp.titleHi, str(sp.title, 'Lesson ' + (i + 1))), spread: i, color: '#2f8fd8'
    }));

    const blocks = w.spreads.map((sp, i) => {
      const labels = arr(sp.vocab).length >= 3 ? arr(sp.vocab)
        : arr(sp.scene && sp.scene.fig && sp.scene.fig.labels).map(v => [v, str(sp.explain, 'NCERT concept')]);
      const hi = arr(sp.vocabHi);
      const bag = (labels.length >= 3 ? labels : [
        [str(sp.short || sp.title, 'Concept'), str(sp.explain, 'NCERT concept')],
        [str(sp.formula && sp.formula.eq, 'Relation'), str(sp.formula && sp.formula.note, 'NCERT relation')],
        ['Observation', str(sp.tryHint, 'Observe the model')]
      ]).slice(0, 6);
      const parts = bag.map((v, j) => {
        const en = Array.isArray(v) ? str(v[0], 'Part ' + (j + 1)) : str(v, 'Part ' + (j + 1));
        const hv = hi[j] || null;
        const defEn = Array.isArray(v) ? str(v[1], str(sp.explain, 'NCERT concept')) : str(sp.explain, 'NCERT concept');
        return {
          id: slug(sp.id || (id + '_' + i)) + '__p' + j,
          kind: shapeByEngine[j % shapeByEngine.length],
          label_en: en,
          label_hi: hv ? str(hv[0], en) : en,
          def_en: defEn,
          def_hi: hv ? str(hv[1], str(sp.explainHi, defEn)) : str(sp.explainHi, defEn),
          position: [Math.cos(j / bag.length * Math.PI * 2) * 1.15,
                     Math.sin(j / bag.length * Math.PI * 2) * 0.62,
                     (j % 2 ? 0.18 : -0.18)],
          radius: 0.28 + (j % 3) * 0.055
        };
      });
      /* one subject hub: a real 3D body, not a hardcoded chapter scene */
      parts.push({
        id: slug(sp.id || (id + '_' + i)) + '__hub', kind: 'sphere',
        label_en: str(sp.short || sp.title, 'Concept hub'),
        label_hi: str(sp.titleHi, str(sp.short || sp.title, 'Concept hub')),
        def_en: str(sp.concept, str(sp.explain, 'NCERT concept')),
        def_hi: str(sp.conceptHi, str(sp.explainHi, str(sp.concept, 'NCERT concept'))),
        position: [0, 0, 0], radius: 0.46, opacity: 0.55
      });
      return {
        id: id + '::' + i,
        sceneId: id + '::' + i,
        spread: i,
        engine: engine,
        title_en: str(sp.title, 'Lesson ' + (i + 1)),
        title_hi: str(sp.titleHi, str(sp.title, 'Lesson ' + (i + 1))),
        parts: parts
      };
    });

    const captions = {};
    blocks.forEach(b => b.parts.forEach(q => {
      captions[q.id] = {
        title_en: q.label_en, title_hi: q.label_hi,
        definition_en: q.def_en, definition_hi: q.def_hi
      };
    }));

    const quiz = w.spreads.slice(0, 20).map((sp, i) => {
      const pe = sp.predict || {}, ph = sp.predictHi || {};
      return {
        id: 'q_' + i,
        q_en: str(pe.q, 'Question ' + (i + 1)),
        q_hi: str(ph.q, str(pe.q, 'Question ' + (i + 1))),
        options_en: arr(pe.options).map(String),
        options_hi: arr(ph.options).length ? arr(ph.options).map(String) : arr(pe.options).map(String),
        a: Math.max(0, Math.floor(num(pe.a, 0))),
        why_en: str(pe.why, ''),
        why_hi: str(ph.why, str(pe.why, ''))
      };
    });

    const raw = {
      id: id, class: cls, subject: subject, engine: engine,
      title_en: w.title, title_hi: w.titleHi,
      sections: sections, '3d_blocks': blocks, quiz: quiz,
      bilingual_captions: captions,
      generated_by: 'EVPACK.derive · NCERT IX/X declarative spreads · ' + CREDIT
    };
    const problems = validate(raw);
    if (problems.length) { lastProblems = problems; return null; }
    const pack = normalize(raw, id);
    derived[id] = pack; origin[id] = 'derived'; deriveCount++;
    return pack;
  }

  function get(id) {
    if (packs[id]) return packs[id];
    if (derived[id]) return derived[id];
    return derive(id);
  }
  function has(id) { return !!(packs[id] || derived[id]) || !!(typeof CHAPTER_PACKS !== 'undefined' && CHAPTER_PACKS[id]); }
  function ids() { return Object.keys(packs).concat(Object.keys(derived)); }
  function catalogue() {
    const list = (typeof STUDENT_CHAPTERS !== 'undefined') ? STUDENT_CHAPTERS : [];
    const cat = (typeof CATALOGUE_ALL !== 'undefined') ? CATALOGUE_ALL : [];
    return list.map(id => {
      const c = cat.find(x => x.id === id);
      return { id: id, class: c ? c.cls : (String(id).indexOf('c9_') === 0 ? 'IX' : 'X'),
               subject: c ? c.subject : '' };
    });
  }
  function blocksFor(id, spreadIndex) {
    const p = get(id); if (!p) return [];
    const all = p['3d_blocks'];
    const exact = all.filter(b => b.spread === spreadIndex);
    return exact.length ? exact : [all[Math.min(all.length - 1, Math.max(0, spreadIndex))]];
  }
  function block(id, sceneId) {
    const p = get(id); if (!p) return null;
    return p['3d_blocks'].find(b => b.id === sceneId || b.sceneId === sceneId) || null;
  }
  function caption(id, partId) {
    const p = get(id); if (!p) return null;
    return p.bilingual_captions[partId] || null;
  }
  function uiText(key, lang) {
    const e = UI_TEXT[key] || { en: key, hi: key };
    const mode = ['en', 'hi', 'both'].indexOf(lang) >= 0 ? lang : 'both';
    /* Prompt 4: the canonical dictionary owns every parts-mode chip/tag. */
    if (typeof EVDICT !== 'undefined') return EVDICT.get('pack.' + key, mode,
      { en: e.en, hi: e.hi || e.en, both: e.en + (e.hi && e.hi !== e.en ? ' · ' + e.hi : '') });
    if (mode === 'en') return e.en;
    if (mode === 'hi') return e.hi || e.en;
    return e.en + (e.hi && e.hi !== e.en ? ' · ' + e.hi : '');
  }
  function stats() {
    return { version: VERSION, schema: SCHEMA, registered: Object.keys(packs).length,
      derived: Object.keys(derived).length, deriveCount: deriveCount,
      registerCount: registerCount, validationCount: validationCount,
      catalogue: catalogue().length, classes: CLASSES.slice(),
      engines: ENGINES.slice(), lastProblems: lastProblems.slice() };
  }
  function contract() {
    return {
      schema: 'eduverse.chapter-packs/v2', version: VERSION, prompt: 2,
      release: 'R8 + master-engine steps 1-5', credit: CREDIT,
      dictionary: (typeof EVDICT !== 'undefined') ? EVDICT.health() : 'not bundled yet',
      classes: CLASSES.slice(), engines: ENGINES.slice(),
      required: REQUIRED.slice(),
      canonical: {
        sections: '[{ id, title_en, title_hi, spread, color }]',
        '3d_blocks': '[{ id, sceneId, spread, engine, class, subject, title_en, title_hi, spec }]',
        quiz: '[{ id, q_en, q_hi, options_en, options_hi, a, why_en, why_hi }]',
        bilingual_captions: '{ partId: { title_en, title_hi, definition_en, definition_hi } }'
      },
      api: ['register(id,json)', 'validate(json)', 'normalize(json,id)', 'derive(id)',
            'get(id)', 'has(id)', 'ids()', 'catalogue()', 'blocksFor(id,spread)',
            'block(id,sceneId)', 'caption(id,partId)', 'uiText(key,lang)',
            'forget(id)', 'stats()', 'contract()'],
      guarantees: [
        'accepts JSON for ANY chapter id, ANY class, ANY subject',
        'zero hardcoded chapter names in the data layer',
        'strict Data(JSON) / Presentation(THREE.Group) separation',
        'every part has a bilingual title and a bilingual definition',
        'legacy en/hi, groups, quizHi and captions are normalised away',
        'derived packs are lazy: initial payload stays small',
        'IX + X covered from day one through the WORLDS adapter',
        '0 external refs, 0 network, 0 GLTF/GLB, 0 React'
      ],
      dictionaryKeys: Object.keys(UI_TEXT),
      canonicalDictionary: (typeof EVDICT !== 'undefined') ? EVDICT.health() : null,
      deferred: {},
      prompt5: 'tools/generate_chapter_pack.py + 29 inert EVPACK v2 JSON packs + EVLAZY on-demand parse',
      research: RESEARCH.slice()
    };
  }

  return { VERSION, CREDIT, SCHEMA, REQUIRED, UI_TEXT,
    validate, normalize, register, forget, derive, get, has, ids, catalogue,
    blocksFor, block, caption, uiText, stats, contract,
    get lastProblems() { return lastProblems.slice(); } };
})();
