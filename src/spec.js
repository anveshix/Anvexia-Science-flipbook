/* ==========================================================================
   EduVerse — Chapter → "Moving World" specification layer
   Design informed by real repositories (see RESEARCH.md):
     · AlphaaCode/Popbook        — AI writes ONLY book.json, engine renders it
     · nathanliow/atlas-of-physics — per-chapter model/checks/world/pages/practice
     · every-joule-style         — predict → try → lift-the-flap → challenge → stamp
     · cbse-interactive-lab      — 3D illustrated book + precision 2D view
     · ujjval93/3D_Notes         — bilingual NCERT IX/X scene modules + missions
   ========================================================================== */

const I18N = {
  en: {
    brand: "Anvexia", tagline: "Science, brought to life.",
    world: "Meta World", book: "Open Book", flipbook: "2D Flipbook", search: "Search Science", compiler: "Chapter Compiler", spec: "World Spec", quiz: "Chapter Quiz", research: "Repo Research", teacher: "Teacher Desk",
    enterWorld: "Open book", openChapter: "Open chapter", compile: "Compile chapter", validate: "Validate spec",
    paste: "Paste your NCERT / CBSE chapter text here (Class IX–XII)…", demo: "Load sample chapter", upload: "Upload .txt / .md / .pdf",
    prev: "Previous spread", next: "Next spread", turn: "Turn page", worldView: "Meta World", bookView: "Book",
    predict: "PREDICT FIRST", predictHint: "Commit to an answer before you touch the model.",
    check: "Lock my prediction", flap: "Lift the flap · Why?", flapClosed: "Answer hidden under the flap",
    meters: "LIVE READINGS", yourData: "YOUR DATA", challenge: "CHALLENGE", stamp: "LESSON STAMPED",
    touchHint: "Touch every part of the model", demo: "Auto demo", demoStop: "Stop demo", narrate: "Narrate",
    precision: "Precision 2D", precisionBack: "Back to 3D", reset: "Reset experiment",
    spread: "Spread", of: "of", hints: "Try this", scene: "Scene block",
    validator: "Validator report", passed: "PASS", review: "REVIEW",
    exportSpec: "Download world-spec.json", importSpec: "Import spec JSON", applySpec: "Build this world",
    source: "Source", sections: "sections", chars: "characters", spreads: "spreads",
    compiled: "World compiled", ready: "Ready to build",
    chapterShelf: "ALL CHAPTERS · COMPILER SHELF (26 live chapters)", class9: "Class IX", class10: "Class X", class11: "Class XI", class12: "Class XII",
    keyTerms: "KEY TERMS", chapter4Tag: "Ch 4 · Carbon and its Compounds", otherChapters: "Other catalogue chapters (Tools only)",
    liveChapters: "26 live chapters",
    syllabus2627: "CBSE 2026-27",
    bio: "Biology", chem: "Chemistry", phy: "Physics",
    worldHint: "Click a section monolith to fly to that spread · drag to orbit",
    noWebgl: "WebGL is unavailable — the precision 2D view still works.",
    quizFinish: "See result", quizRetry: "Try again", score: "Score",
    stampHint: "Answer the prediction + touch every interactive part to earn the stamp.",
    langLabel: "हिंदी", flipHint: "Click a page corner, use ← → or swipe to turn",
    chapterQuiz: "Chapter quiz", chapterProgress: "Chapter progress",
    readShot: "Read shot", exploreShot: "Explore shot", focus: "Focus", focusExit: "Show panels",
    reader: "Reader space", panelLeft: "Prediction panel", panelRight: "Readings panel",
    panelsHidden: "Panels hidden - bigger book", panelsShown: "Panels shown",
    board: "Straight projector view · alignment locked", boardExit: "Angled 3D camera",
    teacherTitle: "Teacher Desk", teacherSub: "Progress, exports and textbook-image → AR deep links. Scanning a QR printed on a textbook page opens that exact 3D spread.",
    progressTable: "Spread progress", exportCsv: "Export progress CSV", exportSpecBtn: "Export WorldSpec", qrTitle: "EduAR · textbook page markers",
    qrNote: "Print these markers beside the matching textbook paragraphs. A phone scan opens the moving 3D spread for that concept.",
    arTitle: "Image → AR workflow", arBody: "The seed AR repo recognises a textbook image and overlays a model. Here the same trigger is a printable marker that resolves to a WorldSpec deep link (?world=…&spread=…); the 3D pop-up is the landing experience.",
    locked: "Prediction", touched: "Parts touched", challengeCol: "Challenge", stampCol: "Stamp", scan: "Scan to open spread",
    researchTitle: "Repository research", researchSub: "Real open-source projects studied before designing this engine",
    copied: "Copied", saved: "Saved", worldOf: "WORLD OF"
  },
  hi: {
    brand: "Anvexia", tagline: "विज्ञान को जीवंत देखिए।",
    world: "मेटा वर्ल्ड", book: "खुली किताब", flipbook: "2D फ़्लिपबुक", search: "विज्ञान खोजें", compiler: "चैप्टर कंपाइलर", spec: "वर्ल्ड स्पेक", quiz: "अध्याय प्रश्नोत्तरी", research: "रेपो रिसर्च", teacher: "शिक्षक डेस्क",
    enterWorld: "किताब खोलें", openChapter: "अध्याय खोलें", compile: "अध्याय कंपाइल करें", validate: "स्पेक जाँचें",
    paste: "अपना NCERT / CBSE अध्याय (कक्षा IX–XII) यहाँ पेस्ट करें…", demo: "नमूना अध्याय लोड करें", upload: ".txt / .md / .pdf अपलोड",
    prev: "पिछला स्प्रेड", next: "अगला स्प्रेड", turn: "पन्ना पलटें", worldView: "मेटा वर्ल्ड", bookView: "किताब",
    predict: "पहले अनुमान लगाएँ", predictHint: "मॉडल छूने से पहले उत्तर तय करें।",
    check: "अनुमान पक्का करें", flap: "फ्लैप उठाएँ · क्यों?", flapClosed: "उत्तर फ्लैप के नीचे छिपा है",
    meters: "लाइव रीडिंग", yourData: "आपके आँकड़े", challenge: "चुनौती", stamp: "पाठ पूर्ण · स्टैम्प",
    touchHint: "मॉडल का हर हिस्सा छूएँ", demo: "स्वतः डेमो", demoStop: "डेमो रोकें", narrate: "सुनें",
    precision: "2D सटीक दृश्य", precisionBack: "3D पर लौटें", reset: "प्रयोग रीसेट",
    spread: "स्प्रेड", of: "का", hints: "यह करके देखें", scene: "सीन ब्लॉक",
    validator: "सत्यापन रिपोर्ट", passed: "पास", review: "जाँचें",
    exportSpec: "world-spec.json डाउनलोड", importSpec: "स्पेक JSON लोड", applySpec: "यह दुनिया बनाएँ",
    source: "स्रोत", sections: "अनुभाग", chars: "अक्षर", spreads: "स्प्रेड",
    compiled: "दुनिया तैयार", ready: "बनाने के लिए तैयार",
    chapterShelf: "सभी अध्याय · कंपाइलर शेल्फ (26 लाइव अध्याय)", class9: "कक्षा IX", class10: "कक्षा X", class11: "कक्षा XI", class12: "कक्षा XII",
    keyTerms: "मुख्य शब्द", chapter4Tag: "अध्याय 4 · कार्बन और उसके यौगिक", otherChapters: "अन्य अध्याय (केवल टूल्स)",
    liveChapters: "26 लाइव अध्याय",
    syllabus2627: "सीबीएसई 2026-27",
    bio: "जीव विज्ञान", chem: "रसायन विज्ञान", phy: "भौतिक विज्ञान",
    worldHint: "किसी अनुभाग स्तंभ पर क्लिक करें · घुमाने के लिए खींचें",
    noWebgl: "WebGL उपलब्ध नहीं — 2D सटीक दृश्य चलता है।",
    quizFinish: "परिणाम देखें", quizRetry: "फिर प्रयास", score: "अंक",
    stampHint: "अनुमान + मॉडल के सभी हिस्से छूने पर स्टैम्प मिलता है।",
    langLabel: "English", flipHint: "पन्ने के कोने पर क्लिक करें, ← → या स्वाइप करें",
    chapterQuiz: "अध्याय प्रश्नोत्तरी", chapterProgress: "अध्याय प्रगति",
    readShot: "पढ़ने का कोण", exploreShot: "मॉडल कोण", focus: "केन्द्रित", focusExit: "पैनल दिखाएँ",
    reader: "पाठक स्थान", panelLeft: "अनुमान पैनल", panelRight: "रीडिंग पैनल",
    panelsHidden: "पैनल छुपे - किताब बड़ी", panelsShown: "पैनल दिख रहे हैं",
    board: "सीधा प्रोजेक्टर दृश्य · संरेखण लॉक", boardExit: "तिरछा 3D कैमरा",
    teacherTitle: "शिक्षक डेस्क", teacherSub: "प्रगति, निर्यात और पाठ्यपुस्तक छवि → AR लिंक।",
    progressTable: "स्प्रेड प्रगति", exportCsv: "प्रगति CSV", exportSpecBtn: "WorldSpec निर्यात", qrTitle: "EduAR · पृष्ठ मार्कर",
    qrNote: "इन मार्करों को पाठ्यपुस्तक के अनुच्छेद के पास छापें।",
    arTitle: "छवि → AR प्रवाह", arBody: "मुद्रित मार्कर WorldSpec डीप-लिंक खोलता है।",
    locked: "अनुमान", touched: "छूए गए हिस्से", challengeCol: "चुनौती", stampCol: "स्टैम्प", scan: "स्प्रेड खोलने के लिए स्कैन",
    researchTitle: "रिपॉज़िटरी रिसर्च", researchSub: "इंजन बनाने से पहले पढ़े गए वास्तविक ओपन-सोर्स प्रोजेक्ट",
    copied: "कॉपी हुआ", saved: "सहेजा गया", worldOf: "विश्व"
  }
};

/* Third UI language: EN + HI together. Compact bilingual chrome, full bilingual
   content (the content itself is assembled by BI()/BX() below). */
I18N.both = {};
Object.keys(I18N.en).forEach(k => {
  const en = I18N.en[k], hi = I18N.hi[k];
  I18N.both[k] = (hi && en !== hi && (en.length + hi.length) <= 30) ? en + " · " + hi : en;
});
Object.assign(I18N.both, {
  brand: "Anvexia", tagline: "Science, brought to life. · विज्ञान को जीवंत देखिए।",
  flipbook: "2D Flipbook · फ़्लिपबुक", search: "Search · खोजें",
  langLabel: "EN + हिंदी", predict: "PREDICT · अनुमान", meters: "READINGS · रीडिंग",
  challenge: "CHALLENGE · चुनौती", keyTerms: "KEY TERMS · शब्द", check: "Lock · पक्का",
  quiz: "Quiz · प्रश्नोत्तरी", spread: "Spread", of: "of",
  enterWorld: "Open book · किताब खोलें",
  liveChapters: "26 · लाइव अध्याय",
  syllabus2627: "CBSE 2026-27",
  chapterShelf: "सभी अध्याय · 26 लाइव", chapterQuiz: "Quiz · प्रश्नोत्तरी",
  readShot: "Read · पढ़ें", exploreShot: "3D · घूमें", focus: "Focus · केन्द्रित",
  precision: "2D · सटीक", reset: "Reset · रीसेट", demo: "Demo · डेमो",
  narrate: "Read aloud · सुनें", world: "Meta World · मेटा", book: "Book · किताब",
  flap: "Why? · क्यों?", stamp: "STAMPED · पूर्ण", hints: "TRY THIS · करके देखें",
  board: "सीधा दृश्य · Projector", boardExit: "3D कोण · Angled 3D",
  reader: "Reader · पाठक", panelsHidden: "पैनल छुपे · बड़ी किताब", panelsShown: "पैनल दिख रहे हैं"
});

/* --------------------------------------------------------------------------
   CBSE Class IX / X Science chapter catalogue (Biology + Chemistry focus)
   -------------------------------------------------------------------------- */
const CATALOGUE = [
  { id: "c9_matter", cls: "IX", subject: "chem", title: "Matter in Our Surroundings", hi: "हमारे आस-पास के पदार्थ", source: "NCERT Science IX · Ch 1", color: "#2f7fb8" },
  { id: "c9_pure", cls: "IX", subject: "chem", title: "Is Matter Around Us Pure", hi: "क्या हमारे आस-पास के पदार्थ शुद्ध हैं", source: "NCERT Science IX · Ch 2", color: "#3f8f7f" },
  { id: "c9_atoms", cls: "IX", subject: "chem", title: "Atoms and Molecules", hi: "परमाणु एवं अणु", source: "NCERT Science IX · Ch 3", color: "#8a6fd0" },
  { id: "c9_cell", cls: "IX", subject: "bio", title: "The Fundamental Unit of Life", hi: "जीवन की मूलभूत इकाई", source: "NCERT Science IX · Ch 5", color: "#3aa981" },
  { id: "c9_tissues", cls: "IX", subject: "bio", title: "Tissues", hi: "ऊतक", source: "NCERT Science IX · Ch 6", color: "#4f9c6b" },
  { id: "c9_disease", cls: "IX", subject: "bio", title: "Why Do We Fall Ill", hi: "हम बीमार क्यों होते हैं", source: "NCERT Science IX · Ch 13", color: "#c06a74" },
  { id: "c10_reactions", cls: "X", subject: "chem", title: "Chemical Reactions and Equations", hi: "रासायनिक अभिक्रियाएँ एवं समीकरण", source: "NCERT Science X · Ch 1", color: "#c2763c" },
  { id: "c10_acids", cls: "X", subject: "chem", title: "Acids, Bases and Salts", hi: "अम्ल, क्षार एवं लवण", source: "NCERT Science X · Ch 2", color: "#b5537f" },
  { id: "c10_metals", cls: "X", subject: "chem", title: "Metals and Non-metals", hi: "धातु एवं अधातु", source: "NCERT Science X · Ch 3", color: "#7a7fa8" },
  { id: "c10_carbon", cls: "X", subject: "chem", title: "Carbon and its Compounds", hi: "कार्बन और उसके यौगिक", source: "NCERT Science X · Ch 4", color: "#4c7fa8" },
  { id: "c10_heredity", cls: "X", subject: "bio", title: "Heredity and Evolution", hi: "आनुवंशिकी तथा विकास", source: "NCERT Science X · Heredity", color: "#a878c8" },
  { id: "c10_light", cls: "X", subject: "phy", title: "Light – Reflection and Refraction", hi: "प्रकाश – परावर्तन तथा अपवर्तन", source: "NCERT Science X · Ch 9", color: "#4ad6ff" },
  { id: "c10_eye", cls: "X", subject: "phy", title: "The Human Eye and the Colourful World", hi: "मानव नेत्र तथा रंगीन संसार", source: "NCERT Science X · Ch 10", color: "#d9a441" },
  { id: "c10_electricity", cls: "X", subject: "phy", title: "Electricity", hi: "विद्युत", source: "NCERT Science X · Ch 11", color: "#e0664f" },
  { id: "c10_magnetism", cls: "X", subject: "phy", title: "Magnetic Effects of Electric Current", hi: "विद्युत धारा के चुम्बकीय प्रभाव", source: "NCERT Science X · Ch 12", color: "#5d8ad6" },
  { id: "c10_life", cls: "X", subject: "bio", title: "Life Processes", hi: "जीवन प्रक्रम", source: "NCERT Science X · Ch 5", color: "#3f9e7c" },
  { id: "c10_control", cls: "X", subject: "bio", title: "Control and Coordination", hi: "नियंत्रण एवं समन्वय", source: "NCERT Science X · Ch 6", color: "#6d78c8" },
  { id: "c10_repro", cls: "X", subject: "bio", title: "How do Organisms Reproduce", hi: "जीव जनन कैसे करते हैं", source: "NCERT Science X · Ch 7", color: "#b2749c" },
  { id: "c10_env", cls: "X", subject: "bio", title: "Our Environment", hi: "हमारा पर्यावरण", source: "NCERT Science X · Ch 13", color: "#4f8a5b" }
];

/* --------------------------------------------------------------------------
   Curated chapter worlds. Compact shorthand → normalised WorldSpec.
   Each spread: one printed page (left) + one 3D pop-up apparatus (right).
   -------------------------------------------------------------------------- */
function S(type, title, hiTitle, section, o) {
  return {
    id: o.id || (type + "_" + title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 26)),
    kind: "lesson", short: o.short || title, section: section,
    title: title, titleHi: hiTitle,
    concept: o.c, conceptHi: o.ch || o.c,
    formula: o.f ? { label: o.f[0], eq: o.f[1], note: o.f[2] || "" } : null,
    vocab: o.v || [],
    predict: { q: o.p[0], options: o.p[1], a: o.p[2] },
    explain: o.e, explainHi: o.eh || o.e,
    fig: o.fig || "", tryHint: o.hint || "",
    scene: Object.assign({ type: type }, o.sc || {}),
    quiz: o.q ? { q: o.q[0], options: o.q[1], a: o.q[2], why: o.q[3] || o.e } : null,
    challenge: o.chal || null
  };
}

const WORLDS = {
  c9_matter: [
    S("particles", "Matter is made of particles", "पदार्थ कणों से बना है", "1.1", {
      c: "Everything that has mass and occupies space is made of tiny particles. Those particles are always moving and there are spaces between them.",
      ch: "जिस वस्तु में द्रव्यमान है और जो स्थान घेरती है, वह अत्यंत सूक्ष्म कणों से बनी है। ये कण सदा गतिशील हैं और इनके बीच रिक्त स्थान होता है।",
      f: ["IDEA", "particles ⟷ spaces ⟷ motion", "Continuous motion is why smells travel."],
      v: [["Matter", "Has mass and occupies space."], ["Particle", "The tiny unit everything is made of."], ["Interparticle space", "The gap between particles."]],
      p: ["If you heat a sealed box of gas, what happens to the particles?", ["They stop moving", "They move faster and hit the walls more often", "They become bigger"], 1],
      e: "Heating adds kinetic energy. Particles move faster, collide with the walls more often, and the pressure rises. Particle size does not change.",
      eh: "गर्म करने से गतिज ऊर्जा बढ़ती है। कण तेज़ चलते हैं, दीवारों से अधिक टकराते हैं और दाब बढ़ता है। कणों का आकार नहीं बदलता।",
      fig: "Fig. 1 — A chamber of particles you can heat.", hint: "Drag the temperature handle and watch the particles.",
      sc: { params: { count: 70 }, challenge: { text: "Make the particles reach the GAS state.", target: { key: "state", value: "gas" } } },
      q: ["Which statement about particles is correct?", ["They are stationary in solids", "There are spaces between them", "They shrink when heated"], 1, "Particles always move; interparticle space exists in every state."]
    }),
    S("diffusion", "Diffusion and intermingling", "विसरण और मिश्रण", "1.2", {
      c: "Particles of two substances mix on their own because they are in constant random motion. Higher temperature makes diffusion faster.",
      ch: "दो पदार्थों के कण अपनी अनियमित गति के कारण स्वतः मिल जाते हैं। ताप बढ़ाने पर विसरण तेज़ होता है।",
      f: ["RULE", "higher T ⟶ faster diffusion", "Random motion, not a stirring force."],
      v: [["Diffusion", "Spontaneous mixing of particles."], ["Concentration", "Amount of substance per volume."], ["Random motion", "Zig-zag movement of particles."]],
      p: ["You open a perfume bottle in one corner. What happens first?", ["Nothing until the air is stirred", "Perfume particles spread into the air", "Air particles vanish"], 1],
      e: "Perfume particles move randomly and slip into the spaces between air particles. The smell reaches you without any stirring.",
      fig: "Fig. 2 — Two chambers with a removable partition.", hint: "Drag the divider and the time handle.",
      sc: { params: { count: 60 }, challenge: { text: "Reach 90% mixing.", target: { key: "mixing", value: 90, op: "gte" } } },
      q: ["Diffusion is fastest in:", ["Solids", "Liquids", "Gases"], 2, "Gas particles have the greatest speed and the largest spaces."]
    }),
    S("plot", "Evaporation and cooling", "वाष्पीकरण और शीतलता", "1.4", {
      c: "The fastest surface particles escape as vapour, taking latent heat from the remaining liquid. That is why evaporation cools.",
      ch: "सबसे तेज़ सतही कण वाष्प बनकर उड़ते हैं और शेष द्रव से गुप्त ऊष्मा ले जाते हैं। इसी से वाष्पीकरण ठंडा करता है।",
      f: ["LATENT HEAT", "energy absorbed = m × L", "L is the specific latent heat of vaporisation."],
      v: [["Evaporation", "Surface phenomenon at any temperature."], ["Latent heat", "Hidden heat used to change state."], ["Cooling", "Energy loss of the remaining liquid."]],
      p: ["Why does sweat cool your skin?", ["Sweat is colder than skin", "Evaporation takes heat from the skin", "Sweat blocks sunlight"], 1],
      e: "Only the highest-energy particles leave. They carry away heat, so the average kinetic energy — and temperature — of what remains falls.",
      fig: "Fig. 3 — A standing graph of escaping particles.", hint: "Drag surface area and temperature on the curve.",
      sc: { params: { xLabel: "Temperature (°C)", yLabel: "Evaporation rate" }, challenge: { text: "Push the rate above 80.", target: { key: "rate", value: 80, op: "gte" } } },
      q: ["Evaporation is a:", ["Bulk phenomenon", "Surface phenomenon", "Nuclear change"], 1, "Only surface particles escape."]
    }),
    S("race", "States of matter compared", "पदार्थ की अवस्थाएँ", "1.3", {
      c: "Solid, liquid and gas differ in particle spacing, forces of attraction and freedom of movement — not in the particles themselves.",
      ch: "ठोस, द्रव और गैस में कणों की दूरी, आकर्षण बल और गति की स्वतंत्रता अलग होती है — कण स्वयं वही रहते हैं।",
      f: ["ORDER", "solid < liquid < gas", "Ordering by interparticle space."],
      v: [["Rigidity", "Fixed shape of a solid."], ["Fluidity", "Ability to flow."], ["Compressibility", "Large in gases."]],
      p: ["Which state is most compressible?", ["Solid", "Liquid", "Gas"], 2],
      e: "Gas particles are far apart, so an applied pressure can push them much closer together.",
      fig: "Fig. 4 — Three jars fill at different rates.", hint: "Drag time and compare the jars.",
      sc: { params: {}, challenge: { text: "Run the clock to 100%.", target: { key: "progress", value: 100, op: "gte" } } },
      q: ["A substance with fixed shape and volume is a:", ["Solid", "Liquid", "Gas"], 0, "Strong forces lock particles in place."]
    })
  ],
  c9_cell: [
    S("cell", "The cell is the basic unit of life", "कोशिका जीवन की मूल इकाई है", "5.1", {
      c: "Every living organism is built from cells. A cell has a plasma membrane, cytoplasm and a nucleus; each organelle does a specific job.",
      ch: "हर जीव कोशिकाओं से बना है। इसमें जीवद्रव्य झिल्ली, कोशिकाद्रव्य और केंद्रक होते हैं; हर कोशिकांग का अपना कार्य है।",
      f: ["DISCOVERY", "Hooke (1665) → Leeuwenhoek → Schleiden & Schwann", "Cell theory: all organisms are made of cells."],
      v: [["Plasma membrane", "Selectively permeable outer boundary."], ["Nucleus", "Control centre with DNA."], ["Organelle", "A specialised sub-cellular structure."]],
      p: ["Which structure controls what enters and leaves a cell?", ["Nucleus", "Plasma membrane", "Vacuole"], 1],
      e: "The plasma membrane is selectively permeable. The nucleus directs activities, but the membrane decides traffic.",
      fig: "Fig. 1 — A pop-up animal cell. Touch every organelle.", hint: "Click the organelles to read their jobs.",
      sc: { params: {}, challenge: { text: "Identify all 6 organelles.", target: { key: "found", value: 6, op: "gte" } } },
      q: ["The control centre of a cell is the:", ["Mitochondrion", "Nucleus", "Ribosome"], 1, "The nucleus contains the genetic material."]
    }),
    S("osmosis", "Osmosis across the membrane", "झिल्ली से होकर परासरण", "5.2", {
      c: "Water moves through a selectively permeable membrane from a dilute solution toward a concentrated one. This is osmosis.",
      ch: "जल अर्धपारगम्य झिल्ली से होकर तनु विलयन से सांद्र विलयन की ओर जाता है। इसे परासरण कहते हैं।",
      f: ["LAW", "water: dilute ⟶ concentrated", "Movement is along the water concentration gradient."],
      v: [["Osmosis", "Movement of water across a membrane."], ["Hypertonic", "More concentrated outside the cell."], ["Plasmolysis", "Shrinking of cell contents in a hypertonic solution."]],
      p: ["A cell is placed in a very salty solution. What happens?", ["It swells", "It loses water and shrinks", "Nothing changes"], 1],
      e: "The outside solution is hypertonic, so water leaves the cell by osmosis and the protoplast pulls away from the wall.",
      fig: "Fig. 2 — A U-tube with a membrane in the middle.", hint: "Drag the concentration handle and watch the levels.",
      sc: { params: {}, challenge: { text: "Balance both liquid levels.", target: { key: "difference", value: 0.05, op: "lte" } } },
      q: ["Osmosis is the movement of:", ["Solute", "Water", "Air"], 1, "Only the solvent (water) crosses the membrane."]
    }),
    S("stack", "From cell to organ system", "कोशिका से अंग तंत्र तक", "5.4", {
      c: "Cells with the same job form a tissue; tissues form organs; organs work together as systems; systems make an organism.",
      ch: "समान कार्य वाली कोशिकाएँ ऊतक बनाती हैं, ऊतक अंग, अंग मिलकर तंत्र और तंत्र मिलकर जीव बनाते हैं।",
      f: ["HIERARCHY", "cell → tissue → organ → system", "Division of labour at every level."],
      v: [["Tissue", "Group of similar cells."], ["Organ", "Group of tissues doing one job."], ["System", "Organs working together."]],
      p: ["A group of similar cells doing one job is a:", ["Organ", "Tissue", "System"], 1],
      e: "A tissue is the first level of organisation above the cell — a group of similar cells with a common function.",
      fig: "Fig. 3 — Four folded layers rise from the page.", hint: "Click each layer to reveal its role.",
      sc: { params: { levels: ["CELL", "TISSUE", "ORGAN", "SYSTEM"] }, challenge: { text: "Open all 4 layers.", target: { key: "opened", value: 4, op: "gte" } } },
      q: ["The correct order is:", ["organ → cell → tissue", "cell → tissue → organ", "tissue → organ → cell"], 1, "Organisation builds upward from the cell."]
    }),
    S("photosynthesis", "Chloroplasts capture light", "लवक प्रकाश पकड़ते हैं", "5.3 · preview", {
      c: "Chloroplasts contain chlorophyll, which traps light energy to make food. More light (up to a point) raises the rate of photosynthesis.",
      ch: "हरितलवक में क्लोरोफिल प्रकाश ऊर्जा पकड़कर भोजन बनाता है। एक सीमा तक प्रकाश बढ़ाने से प्रकाश-संश्लेषण की दर बढ़ती है।",
      f: ["EQUATION", "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂", "In the presence of light and chlorophyll."],
      v: [["Chloroplast", "Site of photosynthesis."], ["Chlorophyll", "Green light-trapping pigment."], ["Light saturation", "Rate stops rising beyond a light level."]],
      p: ["Move the lamp closer and closer. What happens to oxygen output?", ["It rises forever", "It rises then levels off", "It falls to zero"], 1],
      e: "Light is limiting at first, but another factor becomes limiting — so the curve flattens. That plateau is the light saturation point.",
      fig: "Fig. 4 — A leaf under a movable lamp.", hint: "Drag the lamp handle and count the bubbles.",
      sc: { params: {}, challenge: { text: "Find the light saturation point (rate ≥ 95).", target: { key: "rate", value: 95, op: "gte" } } },
      q: ["The green pigment that traps light is:", ["Haemoglobin", "Chlorophyll", "Melanin"], 1, "Chlorophyll absorbs light for photosynthesis."]
    })
  ],
  c10_reactions: [
    S("reaction", "Chemical equations must balance", "रासायनिक समीकरण संतुलित होने चाहिए", "1.1", {
      c: "Atoms are neither created nor destroyed in a reaction. A balanced equation has equal numbers of each atom on both sides.",
      ch: "अभिक्रिया में परमाणु न बनते हैं न नष्ट होते हैं। संतुलित समीकरण में दोनों ओर प्रत्येक परमाणु की संख्या समान होती है।",
      f: ["LAW", "conservation of mass", "Lavoisier: mass is conserved in a chemical reaction."],
      v: [["Reactant", "Substance consumed in a reaction."], ["Product", "Substance formed."], ["Coefficient", "Number placed before a formula to balance."]],
      p: ["In H₂ + O₂ → H₂O, is the equation balanced?", ["Yes", "No — oxygen is short on the right", "No — hydrogen is short"], 1],
      e: "Left has 2 O atoms, right has 1. Balanced form: 2H₂ + O₂ → 2H₂O. Only coefficients change, never subscripts.",
      fig: "Fig. 1 — Drag reagents into the flask and balance the equation.", hint: "Drag the coefficient handle untilboth sides match.",
      sc: { params: { equation: "H₂ + O₂ → H₂O", balanced: "2H₂ + O₂ → 2H₂O" }, challenge: { text: "Balance the equation (score = 100).", target: { key: "balance", value: 100, op: "gte" } } },
      q: ["To balance an equation you change:", ["Subscripts", "Coefficients", "Element symbols"], 1, "Changing a subscript changes the substance itself."]
    }),
    S("molecule", "Atoms combine into molecules", "परमाणु मिलकर अणु बनाते हैं", "1.2 · preview", {
      c: "Atoms join in fixed whole-number ratios to form molecules. The formula records the ratio and valency decides how many bonds form.",
      ch: "परमाणु निश्चित पूर्णांक अनुपात में जुड़कर अणु बनाते हैं। सूत्र अनुपात बताता है और संयोजकता बंधों की संख्या तय करती है।",
      f: ["FORMULA", "H₂O = 2 H : 1 O", "Valency: H = 1, O = 2, C = 4."],
      v: [["Molecule", "Group of atoms bonded together."], ["Valency", "Combining capacity of an atom."], ["Formula", "Symbolic ratio of atoms."]],
      p: ["How many hydrogen atoms bond to one oxygen in water?", ["One", "Two", "Three"], 1],
      e: "Oxygen has valency 2 and hydrogen valency 1, so two H atoms satisfy one O atom — H₂O.",
      fig: "Fig. 2 — Drag atoms onto the bonding slots.", hint: "Drag H atoms to the two slots around O.",
      sc: { params: { targetFormula: "H₂O" }, challenge: { text: "Build H₂O exactly.", target: { key: "formula", value: "H₂O" } } },
      q: ["The formula of water shows a ratio of:", ["1:1", "2:1", "1:2"], 1, "Two hydrogen atoms to one oxygen atom."]
    }),
    S("flow", "Types of chemical reactions", "रासायनिक अभिक्रियाओं के प्रकार", "1.3", {
      c: "Combination, decomposition, displacement and double displacement are recognised by how reactants rearrange into products.",
      ch: "संयोजन, अपघटन, विस्थापन और द्वि-विस्थापन अभिक्रियाएँ अभिकारकों के पुनर्विन्यास से पहचानी जाती हैं।",
      f: ["PATTERN", "A + B → AB  (combination)", "AB → A + B is decomposition."],
      v: [["Combination", "Two or more substances form one product."], ["Decomposition", "One reactant breaks into simpler products."], ["Displacement", "A more reactive element replaces another."]],
      p: ["2FeSO₄ → Fe₂O₃ + SO₂ + SO₃ is which type?", ["Combination", "Decomposition", "Displacement"], 1],
      e: "A single compound splits into three products on heating — a thermal decomposition reaction.",
      fig: "Fig. 3 — A glowing token travels through the reaction pipeline.", hint: "Drag the token speed and click each step.",
      sc: { params: { steps: ["Reactants", "Bond breaking", "Rearrangement", "Bond forming", "Products"] }, challenge: { text: "Visit all 5 steps.", target: { key: "visited", value: 5, op: "gte" } } },
      q: ["CaO + H₂O → Ca(OH)₂ is a:", ["Decomposition", "Combination", "Redox"], 1, "Two reactants form a single product."]
    }),
    S("ph", "Neutralisation and pH", "उदासीनीकरण और pH", "preview · Ch 2", {
      c: "Acids give H⁺ ions, bases give OH⁻ ions. When they react, H⁺ + OH⁻ → H₂O and the pH moves toward 7.",
      ch: "अम्ल H⁺ और क्षार OH⁻ देते हैं। क्रिया में H⁺ + OH⁻ → H₂O बनता है और pH 7 की ओर जाता है।",
      f: ["SCALE", "pH < 7 acid · 7 neutral · > 7 base", "Universal indicator shows the colour."],
      v: [["Acid", "Sour, gives H⁺ in water."], ["Base", "Bitter, gives OH⁻ in water."], ["Neutralisation", "Acid + base → salt + water."]],
      p: ["You slowly add acid to a basic solution. The pH will:", ["Rise", "Fall toward 7", "Stay the same"], 1],
      e: "Each added H⁺ removes an OH⁻ as water. The solution becomes less basic, so pH falls toward 7.",
      fig: "Fig. 4 — A standing pH tube with a movable indicator.", hint: "Drag acid and base handles to find pH 7.",
      sc: { params: {}, challenge: { text: "Reach exactly pH 7 (±0.3).", target: { key: "pH", value: 7, op: "near", tol: 0.3 } } },
      q: ["A solution of pH 3 is:", ["Strongly acidic", "Neutral", "Basic"], 0, "Below 7 is acidic; lower means more acidic."]
    })
  ],
  c10_control: [
    S("flow", "The reflex arc", "प्रतिवर्ती चाप", "7.2", {
      c: "A reflex is a rapid automatic response integrated in the spinal cord: receptor → sensory neuron → interneuron → motor neuron → effector.",
      ch: "प्रतिवर्त तेज़, स्वतः प्रतिक्रिया है जो मेरु रज्जु में तय होती है: ग्राही → संवेदी न्यूरॉन → अंतर्न्यूरॉन → चालक न्यूरॉन → प्रभावक।",
      f: ["ARC", "5 components · spinal integration", "Conscious pain uses a SEPARATE ascending tract."],
      v: [["Receptor", "Detects the stimulus."], ["Effector", "Muscle or gland that responds."], ["Interneuron", "Relay inside the spinal cord."]],
      p: ["Which organ integrates a withdrawal reflex?", ["Brain", "Spinal cord", "Pancreas"], 1],
      e: "The spinal cord completes the arc before the brain perceives pain. The pain signal ascends by a different tract.",
      fig: "Fig. 1 — A signal token travels the five-step arc.", hint: "Run the pipeline and click every step.",
      sc: { params: { steps: ["Receptor", "Sensory neuron", "Interneuron", "Motor neuron", "Effector"] }, challenge: { text: "Light all 5 stations.", target: { key: "visited", value: 5, op: "gte" } } },
      q: ["Conscious pain perception travels by:", ["The same motor neuron", "A separate ascending tract", "A hormone"], 1, "Scientific accuracy: the pathways are distinct."]
    }),
    S("cell", "Neuron structure", "न्यूरॉन की संरचना", "7.1", {
      c: "A neuron has dendrites, a cell body, a long myelinated axon and terminal boutons. The impulse travels one way across synapses.",
      ch: "न्यूरॉन में डेंड्राइट, कोशिका काय, लंबा मायलिनी अक्षतंतु और टर्मिनल होते हैं। आवेग सिनैप्स से एक ही दिशा में जाता है।",
      f: ["DIRECTION", "dendrite → cyton → axon → terminal", "Myelin enables saltatory conduction."],
      v: [["Dendrite", "Receives the signal."], ["Myelin sheath", "Insulates the axon."], ["Synapse", "Chemical junction between neurons."]],
      p: ["Gaps in the myelin sheath are called:", ["Synapses", "Nodes of Ranvier", "Axon terminals"], 1],
      e: "At the nodes of Ranvier the action potential is regenerated, so the impulse jumps along the axon.",
      fig: "Fig. 2 — A pop-up neuron. Touch each labelled part.", hint: "Click the dendrites, soma, axon and terminals.",
      sc: { params: { mode: "neuron" }, challenge: { text: "Identify all 6 parts.", target: { key: "found", value: 6, op: "gte" } } },
      q: ["The insulating layer of an axon is:", ["Myelin", "Cytoplasm", "Dendrite"], 0, "Myelin speeds up conduction."]
    }),
    S("plot", "Hormonal feedback", "हार्मोनी पुनर्निवेश", "7.3", {
      c: "Insulin lowers blood glucose and glucagon raises it. Their antagonistic action keeps glucose near a set point by negative feedback.",
      ch: "इंसुलिन रक्त ग्लूकोज़ घटाता है और ग्लूकागॉन बढ़ाता है। इनकी विरोधी क्रिया ऋणात्मक पुनर्निवेश से स्तर स्थिर रखती है।",
      f: ["FEEDBACK", "deviation ⟶ opposite response", "The response reverses the change."],
      v: [["Insulin", "β-cells → glucose uptake + glycogen."], ["Glucagon", "α-cells → glycogen breakdown."], ["Homeostasis", "Stable internal conditions."]],
      p: ["After a meal, blood glucose rises. What is released?", ["Glucagon", "Insulin", "Adrenaline"], 1],
      e: "β-cells of the pancreatic islets sense high glucose and secrete insulin; uptake and glycogenesis restore the set point.",
      fig: "Fig. 3 — A standing homeostasis curve.", hint: "Drag the glucose handle across the set point.",
      sc: { params: { xLabel: "Blood glucose", yLabel: "Hormone release" }, challenge: { text: "Return glucose to the set point (50 ± 5).", target: { key: "rate", value: 50, op: "near", tol: 5 } } },
      q: ["Insulin and glucagon are:", ["Synergistic", "Antagonistic", "Identical"], 1, "They act in opposite directions."]
    }),
    S("stack", "Nervous + endocrine coordination", "तंत्रिका व अंतःस्रावी समन्वय", "7.4", {
      c: "The nervous system gives fast, short-lived electrical control; the endocrine system gives slower, longer-lasting chemical control.",
      ch: "तंत्रिका तंत्र तेज़, अल्पकालिक विद्युत नियंत्रण देता है; अंतःस्रावी तंत्र धीमा पर दीर्घकालिक रासायनिक नियंत्रण।",
      f: ["COMPARE", "fast / electrical ⟷ slow / chemical", "Both maintain coordination."],
      v: [["Nerve impulse", "Electrical, milliseconds."], ["Hormone", "Chemical, carried in blood."], ["Target cell", "Cell with the matching receptor."]],
      p: ["Which control is usually faster?", ["Hormonal", "Nervous", "Both equal"], 1],
      e: "Nerve impulses travel along axons in milliseconds; hormones must circulate in blood to reach target cells.",
      fig: "Fig. 4 — Three folded comparison layers.", hint: "Open each layer to compare.",
      sc: { params: { levels: ["STIMULUS", "SIGNAL", "RESPONSE"] }, challenge: { text: "Open all 3 layers.", target: { key: "opened", value: 3, op: "gte" } } },
      q: ["Hormones are transported by:", ["Axons", "Blood", "Synapses"], 1, "Endocrine glands are ductless and secrete into blood."]
    })
  ],
  c9_disease: [
    S("cell", "Health, disease & infectious agents", "स्वास्थ्य, रोग तथा संक्रामक कारक", "1", {
      c: "Health is complete physical, mental and social well-being. Acute diseases last briefly while chronic ones persist; infectious agents include viruses, bacteria, fungi, protozoa and helminths.",
      ch: "स्वास्थ्य शारीरिक, मानसिक व सामाजिक सुस्थिति है। तीव्र रोग अल्पकालिक और दीर्घकालिक रोग लंबे चलते हैं; विषाणु, जीवाणु, कवक व प्रोटोज़ोआ संक्रामक कारक हैं।",
      f: ["PATHOGENS", "Viruses · Bacteria · Fungi · Protozoa", "Antibiotics block bacterial cell-wall synthesis, not viruses."],
      v: [["Acute vs chronic", "Short-lived cold vs long-term elephantiasis/TB."], ["Pathogen", "Disease-causing microbe or parasite."], ["Antibiotic", "Blocks bacterial biochemical pathways."]],
      p: ["Why do antibiotics fail against the common cold?", ["Cold is too mild", "Viruses lack bacterial cell-wall pathways", "Antibiotics evaporate"], 1],
      e: "Penicillin inhibits bacterial cell-wall synthesis; viruses use host-cell machinery and build no peptidoglycan wall.",
      fig: "Fig. 1 — Pathogen structure and cellular target.", hint: "Inspect each structural part of the microbe and host target.",
      sc: { params: { mode: "animal" }, challenge: { text: "Identify all 5 cellular structures.", target: { key: "found", value: 5, op: "gte" } } },
      q: ["Kala-azar is caused by the protozoan:", ["Staphylococcus", "Leishmania", "SARS virus"], 1, "Leishmania is a flagellated protozoan parasite."]
    }),
    S("flow", "Means of spread of infectious diseases", "संक्रामक रोगों के संचरण के माध्यम", "2", {
      c: "Communicable diseases spread from an infected person to a healthy host via airborne droplets, contaminated water or food, direct contact, or biological vectors such as female Anopheles and Aedes mosquitoes.",
      ch: "संक्रामक रोग वायु-बूंदों, दूषित जल व भोजन, प्रत्यक्ष संपर्क अथवा मादा एनोफ़िलीज़ व एडीज़ मच्छर जैसे रोगवाहकों द्वारा स्वस्थ व्यक्ति तक फैलते हैं।",
      f: ["ROUTES", "Air · Water/Food · Contact · Vector", "Breaking the transmission link stops an outbreak."],
      v: [["Droplet nuclei", "Tiny respiratory particles carrying TB/flu microbes."], ["Waterborne", "Cholera and hepatitis spread via contaminated water."], ["Vector", "Organism carrying pathogens between hosts (e.g. mosquito)."]],
      p: ["Malaria and dengue spread primarily through:", ["Airborne dust", "Mosquito vectors", "Genetic inheritance"], 1],
      e: "Female mosquitoes require blood protein to mature eggs and transfer Plasmodium or dengue virus between human hosts.",
      fig: "Fig. 2 — Four pathways of communicable transmission.", hint: "Advance through each transmission stage to trace and block spread.",
      sc: { params: { stages: ["SOURCE", "PATHWAY", "VECTOR", "HOST"] }, challenge: { text: "Trace all 4 transmission stages.", target: { key: "stage", value: 3, op: "gte" } } },
      q: ["Cholera is predominantly transmitted through:", ["Contaminated water", "Mosquito bite", "Loud sound"], 0, "Vibrio cholerae spreads via faecal contamination of drinking water."]
    }),
    S("stack", "Treatment, prevention & immunisation", "उपचार, निवारण एवं टीकाकरण", "3", {
      c: "Treatment reduces symptoms and eliminates microbes; prevention combines public hygiene, safe water and vector control with specific immunisation, where vaccines train memory lymphocytes to neutralise future infection rapidly.",
      ch: "उपचार लक्षण घटाकर रोगाणु नष्ट करता है; निवारण में स्वच्छ जल, मच्छर नियंत्रण तथा टीकाकरण शामिल हैं, जहाँ टीके स्मृति कोशिकाएँ बनाकर भविष्य के संक्रमण से बचाते हैं।",
      f: ["IMMUNITY", "Vaccine antigen ⟶ Memory cells ⟶ Rapid antibodies", "Prevention is safer and broader than cure."],
      v: [["Inflammation", "Immune recruitment causing local swelling and fever."], ["Immunisation", "Priming immune memory using weakened/killed antigen."], ["Antibody", "Specific Y-shaped protein neutralising a pathogen."]],
      p: ["A vaccine protects against future infection mainly by:", ["Heating blood", "Creating immune memory cells", "Dissolving skin"], 1],
      e: "First exposure to harmless vaccine antigen builds memory B and T cells that respond swiftly upon real exposure.",
      fig: "Fig. 3 — Layered lines of public and immune defence.", hint: "Open each defence layer from hygiene to specific immunity.",
      sc: { params: { levels: ["HYGIENE", "ANTIBODIES", "MEMORY"] }, challenge: { text: "Open all 3 defence layers.", target: { key: "opened", value: 3, op: "gte" } } },
      q: ["Who pioneered the first smallpox vaccine?", ["Edward Jenner", "Isaac Newton", "Gregor Mendel"], 0, "Edward Jenner used cowpox (vacca) exposure to protect against smallpox."]
    })
  ]
};

/* --------------------------------------------------------------------------
   Keyword → scene-block router + chapter hints (offline compiler)
   -------------------------------------------------------------------------- */
const ROUTER = [
  { re: /particle|state of matter|solid|liquid|gas|evaporat|latent|sublim|kinetic/i, type: "particles" },
  { re: /diffus|osmosis|concentration|permeab|membrane/i, type: "diffusion" },
  { re: /atom|molecule|valenc|formula|bond|mole concept/i, type: "molecule" },
  { re: /reaction|equation|balance|precipitat|displacement|oxidat|reduc|corros/i, type: "reaction" },
  { re: /acid|base|alkali|ph |salt|neutralis|indicator/i, type: "ph" },
  { re: /cell|organelle|nucleus|mitochond|chloroplast|tissue/i, type: "cell" },
  { re: /photosynth|chlorophyll|light|stomata|glucose/i, type: "photosynthesis" },
  { re: /neuron|reflex|nerve|hormone|insulin|glucagon|brain|coordination|feedback/i, type: "flow" },
  { re: /hierarch|levels|layers|organisation|system|classification/i, type: "stack" },
  { re: /rate|graph|curve|increase|decrease|temperature effect/i, type: "plot" },
  { re: /compare|versus|difference between|more than|less than/i, type: "race" },
  { re: /reproduc|heredity|evolution|environment|food chain|cycle|process|steps|pathway/i, type: "flow" }
];
const HINTS = {
  c9_matter: ["matter in our surroundings", "states of matter", "evaporation", "latent heat", "sublimation", "हमारे आस-पास"],
  c9_pure: ["is matter around us pure", "solution", "suspension", "colloid", "mixture", "शुद्ध"],
  c9_atoms: ["atoms and molecules", "valency", "mole concept", "chemical formula", "परमाणु"],
  c9_cell: ["fundamental unit of life", "cell", "plasma membrane", "organelle", "कोशिका"],
  c9_tissues: ["tissues", "meristematic", "epithelial", "ऊतक"],
  c9_disease: ["why do we fall ill", "disease", "immunity", "pathogen", "बीमार"],
  c10_reactions: ["chemical reactions and equations", "balanced equation", "combination reaction", "अभिक्रिया"],
  c10_acids: ["acids bases and salts", "ph scale", "neutralisation", "अम्ल"],
  c10_metals: ["metals and non-metals", "reactivity series", "धातु"],
  c10_carbon: ["carbon and its compounds", "hydrocarbon", "functional group", "कार्बन"],
  c10_life: ["life processes", "nutrition", "respiration", "transportation", "excretion", "जीवन प्रक्रम"],
  c10_control: ["control and coordination", "reflex action", "neuron", "hormone", "नियंत्रण"],
  c10_repro: ["how do organisms reproduce", "fission", "pollination", "जनन"],
  c10_env: ["our environment", "food chain", "ecosystem", "ozone", "पर्यावरण"]
};

/* --------------------------------------------------------------------------
   The compiler: any chapter text → a valid WorldSpec
   -------------------------------------------------------------------------- */
function detectChapter(text) {
  const low = text.toLowerCase(); let best = null, score = 0;
  Object.keys(HINTS).forEach(id => {
    const hits = HINTS[id].filter(k => low.includes(k.toLowerCase())).length;
    if (hits > score) { score = hits; best = id; }
  });
  return { id: best, score: score };
}
function routeScene(text) {
  for (const r of ROUTER) if (r.re.test(text)) return r.type;
  return "showcase";
}
function sentences(text) {
  return text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 25);
}
function titleFrom(s, i) {
  const words = s.replace(/[^\w\s\-–:,]/g, " ").split(/\s+/).slice(0, 7).join(" ");
  return (words.charAt(0).toUpperCase() + words.slice(1)) || ("Concept " + (i + 1));
}
function extractVocab(s) {
  const stop = new Set(["The", "This", "These", "When", "Some", "Many", "Every", "Because", "However", "Also", "There", "Which", "Such", "During", "After", "Before"]);
  const found = [];
  (s.match(/[A-Z][a-z]{3,}/g) || []).forEach(w => { if (!stop.has(w) && !found.includes(w)) found.push(w); });
  return found.slice(0, 3).map(w => [w, "Key term from the source chapter."]);
}
function genericPredict(type, s) {
  const bank = {
    particles: ["If the particles move faster, what must have changed?", ["They were cooled", "Energy was supplied", "They became larger"], 1],
    diffusion: ["What makes two gases mix without stirring?", ["Gravity", "Random particle motion", "A chemical reaction"], 1],
    molecule: ["What fixes the ratio of atoms in a compound?", ["Temperature", "Valency", "Colour"], 1],
    reaction: ["What is conserved in a chemical reaction?", ["Mass and atoms", "Only temperature", "Only volume"], 0],
    ph: ["Adding a base to an acid moves pH:", ["Toward 7", "Toward 1", "Nowhere"], 0],
    cell: ["Which part is the control centre of a cell?", ["Membrane", "Nucleus", "Vacuole"], 1],
    photosynthesis: ["Beyond the light saturation point, the rate:", ["Keeps rising", "Levels off", "Becomes zero"], 1],
    flow: ["In a sequence, the signal travels:", ["Backwards", "Step by step", "Randomly"], 1],
    stack: ["Levels of organisation build:", ["Downward", "Upward from the cell", "Sideways"], 1],
    plot: ["On a rising curve, increasing x usually:", ["Increases y", "Decreases y", "Has no effect"], 0],
    race: ["To compare two cases fairly, keep:", ["Everything different", "One variable different", "Nothing fixed"], 1],
    showcase: ["What is the best way to study a 3D specimen?", ["Only read about it", "Rotate it and inspect parts", "Memorise its name"], 1]
  };
  return bank[type] || bank.showcase;
}
function compileChapter(text, meta) {
  meta = meta || {};
  const det = detectChapter(text);
  const base = CATALOGUE.find(c => c.id === det.id);
  const srcSentences = sentences(text);
  let spreads;
  if (base && WORLDS[base.id] && det.score >= 2) {
    /* curated world, with concept sentences pulled from the uploaded text */
    spreads = WORLDS[base.id].map((sp, i) => {
      const copy = JSON.parse(JSON.stringify(sp));
      const match = srcSentences.find(s => new RegExp(copy.title.split(" ")[0], "i").test(s));
      if (match) { copy.concept = match; copy.sourceLine = match; }
      return copy;
    });
    /* extra spread for source material that the curated set does not cover */
    if (srcSentences.length > 8) {
      const extra = srcSentences.slice(-3).join(" ");
      spreads.push(S(routeScene(extra), "From your chapter: key idea", "आपके अध्याय से मुख्य विचार", "source", {
        c: extra, p: genericPredict(routeScene(extra)), e: "Trace the model on the right page to see this relationship in motion.", fig: "Generated from the uploaded chapter text.", hint: "Drag a handle and watch the readings change."
      }));
    }
  } else {
    /* fully generic: chunk the chapter into 4–6 teachable spreads */
    const sents = srcSentences.length ? srcSentences : [text];
    const n = clamp(Math.ceil(sents.length / 3), 3, 6);
    const per = Math.ceil(sents.length / n);
    spreads = [];
    for (let i = 0; i < n; i++) {
      const chunk = sents.slice(i * per, (i + 1) * per).join(" ");
      const type = routeScene(chunk);
      const title = titleFrom(sents[i * per] || chunk, i);
      spreads.push(S(type, title, title, String(i + 1), {
        c: chunk || "Idea from the uploaded chapter.",
        v: extractVocab(chunk), p: genericPredict(type, chunk),
        e: "The apparatus on the right page makes this relationship visible: change one quantity and watch the reading respond.",
        fig: "Auto-generated pop-up from the chapter text.", hint: "Drag a handle, then check the live readings.",
        q: [title + " — which idea does the model show?", ["A fixed fact", "A change in one quantity causes a change in another", "Nothing measurable"], 1, "The apparatus is a relationship, not a picture."]
      }));
    }
  }
  const chapter = base || { id: "uploaded", cls: meta.cls || "IX", subject: meta.subject || "chem", title: meta.title || "Uploaded Chapter", hi: meta.titleHi || "अपलोड किया गया अध्याय", source: meta.source || "Uploaded text", color: "#2f7fb8" };
  return normalizeWorld({
    id: "compiled_" + (base ? base.id : "generic") + "_" + Math.random().toString(36).slice(2, 7),
    chapter: chapter.id, title: chapter.title, titleHi: chapter.hi,
    cls: chapter.cls, subject: chapter.subject, board: "CBSE / NCERT",
    source: meta.source || chapter.source, color: chapter.color,
    lang: "en", generated_by: "EduVerse Compiler v1 (offline deterministic)",
    stats: { characters: text.length, sections: (text.match(/\n\s*\n/g) || []).length + 1, detectedChapter: det.id, confidence: det.score },
    spreads: spreads
  });
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

/* --------------------------------------------------------------------------
   Popbook `lib/validate.js` pattern: the compiler may emit partial spreads;
   the VIEWER repairs them deterministically before they can reach a page.
   No lesson is allowed to render without bilingual captions, a key relation,
   three vocabulary pairs and a legal section label — including the legacy
   Tools-only / archive chapters kept for the authoring shelf.
   -------------------------------------------------------------------------- */
function repairSpread(s, i) {
  const hi = s.titleHi || s.title || "अध्याय";
  const full = (v) => String(v == null ? "" : v).trim();
  const cut = full;   /* legacy name retained; NEVER truncate lesson copy */
  s.fig = s.fig || ("Fig — " + cut(s.title, 64));
  s.figHi = s.figHi || ("चित्र — " + cut(hi, 44) + " : " + cut(s.conceptHi || s.concept, 54));
  s.hintHi = s.hintHi || ("करके देखें — " + cut(hi, 40) + " के मॉडल में नियंत्रण खींचें और मीटर पढ़ें।");
  s.tryHint = s.tryHint || "Drag a handle and watch the live readings change.";
  if (!s.formula || !s.formula.eq) {
    s.formula = { label: "KEY IDEA · मुख्य संबंध", eq: cut(s.short || s.title, 42),
                  note: cut(s.explain || s.concept, 72) };
  }
  const seeds = [
    [cut(s.short || s.title, 26), cut(s.conceptHi || s.concept, 58)],
    ["NCERT " + s.section, cut(hi, 48)],
    ["OBSERVE · प्रेक्षण", "Move the control and read the live meters."]
  ];
  const v = (s.vocab || []).slice();
  for (let k = 0; v.length < 3 && k < seeds.length + 3; k++) {
    const q = seeds[k % seeds.length];
    if (!v.some(z => z && z[0] === q[0])) v.push(q);
  }
  s.vocab = v;
  const vh = (s.vocabHi || []).slice();
  while (vh.length < v.length) {
    const j = vh.length;
    vh.push(["शब्द " + (j + 1) + " · " + cut(v[j][0], 20), cut(s.conceptHi || s.concept, 58)]);
  }
  s.vocabHi = vh;
  s.status = s.status || "assessed";
  return s;
}
function normalizeWorld(w) {
  w.spreads = (w.spreads || []).map((s, i) => {
    s.id = s.id || ("spread_" + (i + 1));
    s.short = s.short || s.title;
    s.section = s.section || String(i + 1);
    s.conceptHi = s.conceptHi || s.concept;
    s.explainHi = s.explainHi || s.explain;
    s.vocab = s.vocab || [];
    s.tryHint = s.tryHint || "Drag a handle and watch the readings change.";
    s.scene = s.scene || { type: "showcase" };
    s.scene.params = s.scene.params || {};
    s.predict = s.predict || genericPredict(s.scene.type, s.concept);
    s.quiz = s.quiz || { q: s.predict.q, options: s.predict.options, a: s.predict.a, why: s.explain };
    s.challenge = s.challenge || s.scene.challenge || null;
    s.index = i;
    return repairSpread(s, i);
  });
  w.quiz = w.quiz || w.spreads.filter(s => s.quiz).map(s => s.quiz);
  return w;
}

/* --------------------------------------------------------------------------
   Validator — mirrors atlas-of-physics checks.mjs + Popbook's final checklist
   -------------------------------------------------------------------------- */
function validateWorld(w) {
  const out = [];
  const ok = (name, cond, msg) => out.push({ name: name, status: cond ? "pass" : "review", msg: msg });
  const known = Object.keys(BLOCKS);
  ok("Structure", !!w.title && w.spreads.length >= 3, w.spreads.length + " spreads, title present (minimum 3).");
  let complete = true, ansOK = true, budget = true, sceneOK = true, challengeOK = true;
  w.spreads.forEach((s, i) => {
    if (!s.title || !s.concept || !s.explain || !s.predict || !s.scene) complete = false;
    if (!s.predict || !Array.isArray(s.predict.options) || s.predict.a < 0 || s.predict.a >= s.predict.options.length) ansOK = false;
    if ((s.concept || "").length > 420 || (s.title || "").length > 62 || (s.explain || "").length > 360) budget = false;
    if (!known.includes(s.scene.type)) sceneOK = false;
    if (s.challenge && (!s.challenge.target || !s.challenge.target.key)) challengeOK = false;
  });
  ok("Every spread complete", complete, "title · concept · predict · explain · scene on each spread.");
  ok("Prediction answer index", ansOK, "Each prediction has a valid option index.");
  ok("Printed-page budget", budget, "Concept ≤420, title ≤62, explanation ≤360 characters (6-line printed page).");
  ok("Scene block catalogue", sceneOK, "All scene types resolve to a registered 3D block.");
  ok("Challenge targets", challengeOK, "Every challenge names a readable model output.");
  ok("Bilingual content", w.spreads.every(s => !!s.titleHi && !!s.conceptHi), "Hindi + English titles and concepts.");
  ok("Assessment", (w.quiz || []).length >= 3, (w.quiz || []).length + " chapter quiz items.");
  ok("Source fidelity", !!w.source && !!w.stats, "Source and compilation statistics recorded.");
  return out;
}

/* Production prompt: the AI writes ONLY WorldSpec JSON, never 3D code. */
const GEMINI_PROMPT = `You are the Anvexia chapter compiler for CBSE / NCERT Science (Classes IX–X, extensible to XI–XII).
The 3D book + 2D Flipbook engine is already written. You DO NOT write code. You write ONE JSON object
(WorldSpec) that the engine renders as an interactive 3D textbook world and 2D Flipbook.

WORLDSPEC SHAPE
{ "title": "...", "titleHi": "...", "cls": "IX"|"X"|"XI"|"XII", "subject": "bio"|"chem"|"phy",
  "board": "CBSE / NCERT", "source": "...", "color": "#2f7fb8",
  "spreads": [ {
    "id":"slug", "short":"≤22 chars", "section":"1.1",
    "title":"≤60 chars", "titleHi":"...",
    "concept":"≤260 chars", "conceptHi":"...",
    "formula":{"label":"≤14","eq":"≤70","note":"≤120"},
    "vocab":[["term","definition"],["term","definition"],["term","definition"]],
    "predict":{"q":"≤150","options":["≤55","≤55","≤55"],"a":1},
    "explain":"≤330","explainHi":"...",
    "fig":"≤110","tryHint":"≤110",
    "scene":{"type":"particles|diffusion|molecule|reaction|ph|cell|osmosis|photosynthesis|flow|stack|plot|race|showcase","params":{},"challenge":{"text":"...","target":{"key":"...","value":...,"op":"gte|lte|near|eq","tol":0.3}}},
    "quiz":{"q":"...","options":["..."],"a":0,"why":"..."}
  } ] }

RULES
1. Group 1–3 textbook paragraphs teaching ONE idea into one spread. 4–8 spreads per chapter.
2. Choose the scene block whose INTERACTION IS the idea (Popbook principle). Vary blocks.
3. Prediction must target a common misconception, BEFORE the learner touches the model.
   The correct answer must be visible in the apparatus readings.
4. Every number in prose, readings, prediction, explanation and quiz must agree with the
   block's pure model function. Use exact values at key moments, never frame-integrated drift.
5. Every spread needs ≥1 draggable/clickable part, live readings, a challenge with a
   target value, and a completion stamp condition (prediction answered + all parts touched).
6. Never invent facts absent from the source; flag standard additions in formula.note.
7. Write Hindi and English. Keep technical NCERT terminology.
8. Return ONLY the JSON. No prose, no Markdown fences.`;

/* Research data surfaced in the in-app Research view */
const REPOS = [
  { repo: "Nodlik/StPageFlip", stars: 1650, lic: "MIT", lang: "TypeScript", use: "Tactile HTML5 2D Flipbook engine with realistic page-curl geometry, spine shadows, corner peel, and hardcover spreads", adopt: "Vendored (page-flip@2.0.7) for Pillar 1: interactive 2D Science Flipbooks synced with 3D spreads", url: "https://github.com/Nodlik/StPageFlip", tier: "CORE" },
  { repo: "lucaong/minisearch", stars: 5100, lic: "MIT", lang: "TypeScript", use: "Zero-dependency client-side full-text & fuzzy search engine with prefix matching and field boosting", adopt: "Vendored (minisearch@7.2.0) for instant offline Hindi–English concept, formula & experiment search", url: "https://github.com/lucaong/minisearch", tier: "CORE" },
  { repo: "ronkok/Temml", stars: 620, lic: "MIT", lang: "JavaScript", use: "Lightweight LaTeX-to-native-MathML compiler rendering textbook math & chemical reactions with ~9 KB font footprint", adopt: "Vendored (temml@0.14.0) for crisp physics equations & chemical stoichiometry in Class IX–XII", url: "https://github.com/ronkok/Temml", tier: "CORE" },
  { repo: "tweenjs/tween.js", stars: 9800, lic: "MIT", lang: "TypeScript", use: "Smooth JavaScript/TypeScript animation & easing engine for Three.js and UI state transitions", adopt: "Vendored (@tweenjs/tween.js@25.0.0) for smooth camera, apparatus & UI motion easing", url: "https://github.com/tweenjs/tween.js", tier: "CORE" },
  { repo: "catdad/canvas-confetti", stars: 11200, lic: "ISC", lang: "JavaScript", use: "High-performance particle burst animations with reduced-motion support and zero worker requirement", adopt: "Vendored (canvas-confetti@1.9.4) for Discovery Stamp & quiz mastery celebration", url: "https://github.com/catdad/canvas-confetti", tier: "SUPPORT" },
  { repo: "AlphaaCode/Popbook", stars: 11, lic: "MIT", lang: "JavaScript", use: "PDF → 3D pop-up book; AI writes ONLY book.json; scene-block catalogue; predict + lift-the-flap + stamp", adopt: "AI-writes-JSON-only contract, spread schema, block router, completion stamp", url: "https://github.com/AlphaaCode/Popbook", tier: "CORE" },
  { repo: "nathanliow/atlas-of-physics", stars: 378, lic: "MIT", lang: "JavaScript", use: "Interactive 3D textbook; each chapter = model.js / checks.mjs / world.js / pages.js / practice.js", adopt: "Per-chapter purity: model separate from world; invariant checks; deep links to spreads", url: "https://github.com/nathanliow/atlas-of-physics", tier: "CORE" },
  { repo: "james123wang5/moving-physics-book", stars: 0, lic: "MIT", lang: "JavaScript", use: "Pop-up 3D physics textbook with page turning, draggable experiments, prediction cards, quizzes (5 lessons)", adopt: "The target product shape: real book + pop-up + drag + predict + quiz", url: "https://github.com/james123wang5/moving-physics-book", tier: "USER" },
  { repo: "james123wang5/every-joule-style", stars: 2, lic: "PolyForm NC", lang: "JavaScript", use: "AI skill that turns any content into an ink-drawn moving book; subject recipes for chemistry/biology; metre rack, paper tags, challenges, stamps", adopt: "Predict→Try→Flap→Challenge→Stamp flow, subject apparatus recipes, numeric-consistency checklist", url: "https://github.com/james123wang5/every-joule-style", tier: "CORE" },
  { repo: "gogulashashank/cbse-interactive-lab", stars: 1, lic: "—", lang: "TypeScript", use: "CBSE IX–X illustrated 3D book: pop-out optical bench, hinged explanation flap, precision 2D accessible view sharing one model", adopt: "CBSE alignment + 3D/2D dual view on ONE scientific state", url: "https://github.com/gogulashashank/cbse-interactive-lab", tier: "CORE" },
  { repo: "ujjval93/3D_Notes", stars: 0, lic: "—", lang: "JavaScript", use: "Vigyan Darshan — bilingual Hindi/English NCERT Class 9 & 10, 44 scene modules, 12–13 science chapters, missions + live guidance + quick checks", adopt: "Bilingual NCERT chapter schema, missions, per-scene guidance", url: "https://github.com/ujjval93/3D_Notes", tier: "CORE" },
  { repo: "rudra496/sciencelab3d", stars: 25, lic: "MIT", lang: "TypeScript", use: "40+ browser 3D experiments across physics, chemistry, biology with real-time controls", adopt: "Experiment library breadth; chemistry/biology model catalogue", url: "https://github.com/rudra496/sciencelab3d", tier: "CORE" },
  { repo: "Ham12-3/chemist", stars: 0, lic: "—", lang: "HTML", use: "ChemLab 3D: single-file Three.js lab, data-driven SUBSTANCES/REACTIONS engine, guided experiments, step checks, notebook, quizzes, offline build", adopt: "Data-driven chemistry engine + guided step validation + offline bundle", url: "https://github.com/Ham12-3/chemist", tier: "CORE" },
  { repo: "maya00912/maya00912.github.io", stars: 0, lic: "—", lang: "JavaScript", use: "3D orbitals, crystals and reactions with draggable lab tools, drop zones and a lab notebook", adopt: "Drag-tool → drop-zone interaction + recorded notebook", url: "https://github.com/maya00912/maya00912.github.io", tier: "SUPPORT" },
  { repo: "123bruke/3d_labs", stars: 0, lic: "—", lang: "TypeScript", use: "Movable 3D lab equipment, tare/volume/density experiments with guided validation", adopt: "Movable apparatus + measurement-driven validation", url: "https://github.com/123bruke/3d_labs", tier: "SUPPORT" },
  { repo: "justkamal07/folio-book-3d", stars: 1, lic: "—", lang: "TypeScript", use: "SkinnedMesh bone-chain page bending, drag physics, procedurally synthesised paper audio", adopt: "Real page-bending + drag-without-rerender + paper sound", url: "https://github.com/justkamal07/folio-book-3d", tier: "SUPPORT" },
  { repo: "HousamKak/book.js", stars: 0, lic: "MIT", lang: "TypeScript", use: "Realistic 3D page-flip shader with accessible HTML fallback", adopt: "Page-flip shader + reduced-motion/HTML fallback", url: "https://github.com/HousamKak/book.js", tier: "SUPPORT" },
  { repo: "DevGurav/3d-book-reader", stars: 1, lic: "MIT", lang: "JavaScript", use: "PDF → 3D book with pdf.js, high-DPI canvas-to-mesh page textures, reflow mode", adopt: "Canvas-to-mesh page textures and reflow/accessibility", url: "https://github.com/DevGurav/3d-book-reader", tier: "SUPPORT" },
  { repo: "devsmaj/smaj-3d-lab", stars: 0, lic: "—", lang: "TypeScript", use: "React/TS/Supabase 3D science models, webcam hand gestures, voice tutor, server AI", adopt: "AI tutor + gesture interaction (production roadmap)", url: "https://github.com/devsmaj/smaj-3d-lab", tier: "USER" },
  { repo: "sarthak98765/Q-Learn-3D-Learning-Platform", stars: 0, lic: "—", lang: "CSS", use: "3D gamified rooms, quizzes, chat, multiplayer, rewards", adopt: "Gamified meta-world navigation + rewards", url: "https://github.com/sarthak98765/Q-Learn-3D-Learning-Platform", tier: "USER" },
  { repo: "BETTY187source/AR-Based-Education-App", stars: 0, lic: "—", lang: "Python", use: "Textbook image recognition → AR 3D models, animations, teacher uploads (small prototype)", adopt: "Textbook-image → AR scene trigger", url: "https://github.com/BETTY187source/AR-Based-Education-App", tier: "USER" },
  { repo: "sumitkumarkucheria/Graviton_academy", stars: 0, lic: "—", lang: "HTML", use: "CBSE 9–12 3D diagrams, atom explorer, molecule builder, DNA helix, labs", adopt: "CBSE chapter-to-3D mapping", url: "https://github.com/sumitkumarkucheria/Graviton_academy", tier: "SUPPORT" },
  { repo: "Innovatoramaizn/digital-lab", stars: 0, lic: "—", lang: "—", use: "Offline PWA; each experiment = manifest.json + simulation.js + scene.js + assessment.js", adopt: "Per-experiment manifest folder contract", url: "https://github.com/Innovatoramaizn/digital-lab", tier: "SUPPORT" },
  { repo: "tmsteph/3dvr-portal#3381", stars: 1, lic: "GPL-3.0", lang: "JavaScript", use: "Open spec for a reusable mobile-first 3D textbook engine: predict → experiment → observe → explain, reusable lesson schema", adopt: "Validates the exact learning loop and reusable schema requirement", url: "https://github.com/tmsteph/3dvr-portal/issues/3381", tier: "SPEC" }
];

/* ---------------------------------------------------------------- utilities */
function t(k) {
  const d = I18N[EV.lang];
  const legacy = d[k] !== undefined ? d[k] : (I18N.en[k] || k);
  /* Prompt 4: all UI keys resolve through the ONE canonical dictionary. */
  return (typeof EVDICT !== "undefined") ? EVDICT.get(k, EV.lang, legacy) : legacy;
}
function L(o) { return (o && typeof o === "object" && !Array.isArray(o)) ? (o[EV.lang] !== undefined ? o[EV.lang] : o.en) : o; }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function cat(id) { return CATALOGUE.find(c => c.id === id) || CATALOGUE[0]; }
function getWorld(id) {
  const c = cat(id);
  const pack = (typeof CHAPTER_PACKS !== "undefined") ? CHAPTER_PACKS[id] : null;
  const spreads = WORLDS[id] ? JSON.parse(JSON.stringify(WORLDS[id])) : compileChapter(c.title + ". " + c.hi, { source: c.source }).spreads;
  return normalizeWorld({
    id: id, chapter: c.id, title: c.title, titleHi: c.hi, cls: c.cls, subject: c.subject,
    board: "CBSE / NCERT", source: c.source, color: c.color, lang: "en",
    generated_by: pack ? pack.generated_by : "EduVerse curated chapter pack",
    quiz: pack ? pack.quiz : undefined,
    quizHi: pack ? pack.quizHi : undefined,
    stats: { characters: 0, sections: spreads.length, detectedChapter: id, confidence: 9,
      activities: pack ? pack.activities : 0, exercises: pack ? pack.exercises : 0 },
    spreads: spreads
  });
}
const CATALOGUE_ALL = CATALOGUE;
/* Live student chapters. Everything else stays in the Tools shelf for the
   compiler only. Add a row to CATALOGUE + one CHAPTER_PACKS entry to go live. */
const STUDENT_CHAPTERS = ["c10_carbon", "c10_light"];
/* --------------------------------------------------------------------------
   Bilingual resolvers. Language modes: "both" (default) | "hi" | "en".
   BI() = plain text (canvas, quiz, narration); BX() = escaped HTML with a
   styled Hindi span, used in the compact student dock.
   -------------------------------------------------------------------------- */
const LANG_MODES = ["both", "hi", "en"];
function BI(en, hi, sep) {
  en = en == null ? "" : String(en); hi = hi == null ? "" : String(hi);
  /* Prompt 4: chapter data and dynamic bilingual pairs share EVDICT. */
  if (typeof EVDICT !== "undefined") return EVDICT.bi(en, hi, sep, EV.lang);
  if (EV.lang === "hi") return hi || en;
  if (EV.lang === "both" && hi && hi !== en) return en + (sep === undefined ? " · " : sep) + hi;
  return en || hi;
}
/* 2D plate paths: "rx/<id>.webp" lives ONCE in the shared store assets/2d/rx/
   (used by several chapters); any other file is per chapter. The label key
   follows the same rule, so a shared image carries one set of labels. */
function EVPLATE_SRC(wid, file) { return file ? "assets/2d/" + (String(file).indexOf("rx/") === 0 ? file : wid + "/" + file) : ""; }
function EVPLATE_KEY(wid, file) { return String(file).indexOf("rx/") === 0 ? file : wid + "/" + file; }
function BX(en, hi) {
  if (EV.lang !== "both" || !hi || hi === en) return esc(BI(en, hi));
  return '<span class="bi-en">' + esc(en) + '</span><span class="bi-hi">' + esc(hi) + '</span>';
}
function P(sp) {
  const en = sp.predict || { q: "", options: [], a: 0 }, hi = sp.predictHi;
  if (EV.lang === "hi" && hi) return { q: hi.q, options: hi.options, a: en.a };
  if (EV.lang === "both" && hi) return {
    q: BI(en.q, hi.q), options: en.options.map((o, i) => BI(o, hi.options && hi.options[i], " / ")), a: en.a
  };
  return en;
}
function VOC(sp) {
  const en = sp.vocab || [], hi = sp.vocabHi || [];
  if (EV.lang === "hi" && hi.length) return hi;
  if (EV.lang === "both" && hi.length) return en.map((v, i) => [
    BI(v[0], hi[i] && hi[i][0]), BI(v[1], hi[i] && hi[i][1])
  ]);
  return en;
}
function QZ(w) {
  const en = (w && w.quiz) || [], hi = (w && w.quizHi) || [];
  if (EV.lang === "hi" && hi.length) return hi;
  if (EV.lang === "both" && hi.length) return en.map((q, i) => Object.assign({}, q, {
    q: BI(q.q, hi[i] && hi[i].q),
    options: (q.options || []).map((o, j) => BI(o, hi[i] && hi[i].options && hi[i].options[j], " / ")),
    why: BI(q.why, hi[i] && hi[i].why)
  }));
  return en;
}
