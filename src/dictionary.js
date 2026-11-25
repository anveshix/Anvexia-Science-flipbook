/* ==========================================================================
   EVDICT — CANONICAL BILINGUAL DICTIONARY  (MASTER ENGINE / PROMPT 4)
   --------------------------------------------------------------------------
   ONE source of truth for every chrome string, chip, tag, tooltip, aria-label,
   toast and projector control. The shipped I18N object remains the compatibility
   source; this module adds the missing static / dynamic keys and routes t(),
   BI(), EVPACK.uiText(), EVBIND and O3LAB through the same canonical registry.

   Data-only: no DOM creation, no THREE, no WebGL, no network, no second canvas.
   Prompt 4 canonical registry; Prompt 5 adds the pack.* vocabulary.

   Copyright / Developer : Paras Pranav
   ========================================================================== */

const EVDICT = (function () {
  'use strict';
  const VERSION = '1.0.0';
  const CREDIT = 'Copyright / Developer : Paras Pranav';
  const SCHEMA = 'eduverse.canonical-dictionary/v1';
  const MODES = ['en', 'hi', 'both'];
  const RELEASE = 'R8 + Master Engine steps 1-5';

  /* Keys omitted from the R3 I18N tables, plus the new projector vocabulary.
     `both` is explicit where a compact bilingual label is better than a join. */
  const EXTRA = {
    "langLabel": { en: "Hindi", hi: "English", both: "EN + हिंदी" },
    "ui.chapter": { en: "Chapter", hi: "अध्याय" },
    "ui.section": { en: "NCERT section", hi: "NCERT अनुभाग" },
    "ui.metaWorld": { en: "Meta World", hi: "मेटा वर्ल्ड" },
    "ui.home": { en: "Home · Class IX/X library", hi: "मुख्य पृष्ठ · कक्षा IX/X पुस्तकालय", both: "Home · कक्षा IX/X पुस्तकालय" },
    "plate2d.label": { en: "2D plate", hi: "2D चित्र", both: "2D plate / 2D चित्र" },
    "plate3d.label": { en: "3D model", hi: "3D मॉडल", both: "3D model / 3D मॉडल" },
    "plate2d.toggle": { en: "Choose a labelled 2D plate or the live 3D model", hi: "लेबल वाला 2D चित्र या लाइव 3D मॉडल चुनें", both: "2D plate / 2D चित्र · 3D model / 3D मॉडल" },
    "plate2d.soon": { en: "Labelled 2D plates are rolling out chapter by chapter; this chapter is in a later phase.", hi: "लेबल वाले 2D चित्र अध्याय-दर-अध्याय जोड़े जा रहे हैं; यह अध्याय अगले चरण में है।", both: "2D plates roll out chapter by chapter · अध्याय-दर-अध्याय 2D चित्र" },
    "plate2d.on": { en: "Labelled 2D plate selected", hi: "लेबल वाला 2D चित्र चुना गया", both: "2D plate selected / 2D चित्र चुना गया" },
    "plate2d.off": { en: "Live 3D model restored", hi: "लाइव 3D मॉडल बहाल", both: "3D restored / 3D बहाल" },
    "ui.openBook": { en: "Open Book", hi: "किताब खोलें" },
    "ui.cameraAngle": { en: "Camera angle", hi: "कैमरा कोण" },
    "ui.full3d": { en: "Full 3D view", hi: "पूर्ण 3D दृश्य" },
    "ui.quickCheck": { en: "Quick check", hi: "त्वरित जाँच" },
    "ui.straightView": { en: "Straight projector view · alignment locked", hi: "सीधा प्रोजेक्टर दृश्य · संरेखण लॉक" },
    "ui.highContrast": { en: "Classroom high contrast · readable from 30 ft", hi: "कक्षा उच्च-कॉन्ट्रास्ट · 30 फ़ुट से पढ़ने योग्य" },
    "ui.studioTheme": { en: "Studio dark theme (click for classroom high contrast)", hi: "स्टूडियो गहरी थीम (कक्षा उच्च-कॉन्ट्रास्ट के लिए क्लिक करें)" },
    "ui.bigBoardOn": { en: "30 FT mode ON · click for full detail", hi: "30 FT मोड चालू · विस्तृत पाठ के लिए क्लिक करें" },
    "ui.bigBoardOff": { en: "30 FT / big board · very large type for the back row", hi: "30 FT / बड़ा बोर्ड · पिछली पंक्ति के लिए बड़े अक्षर" },
    "ui.ultraOn": { en: "ULTRA 3D ON · click to place the model back in the page", hi: "ULTRA 3D चालू · मॉडल पन्ने पर लौटाने के लिए क्लिक करें" },
    "ui.ultraOff": { en: "ULTRA 3D · let the real 3D model rise out of the page", hi: "ULTRA 3D · वास्तविक 3D मॉडल पन्ने से ऊपर उठाएँ" },
    "ui.bigBoard": { en: "30 FT / big board · very large type for the back row", hi: "30 FT / बड़ा बोर्ड · पिछली पंक्ति के लिए बड़े अक्षर" },
    "ui.ultra3d": { en: "ULTRA 3D · let the real 3D model rise out of the page", hi: "ULTRA 3D · वास्तविक 3D मॉडल पन्ने से ऊपर उठाएँ" },
    "ui.readerSpace": { en: "Reader space · collapse both bottom panels", hi: "पाठक स्थान · नीचे के दोनों पैनल समेटें" },
    "ui.language": { en: "Language", hi: "भाषा", both: "Language / भाषा" },
    "ui.langBoth": { en: "English + Hindi", hi: "अंग्रेज़ी + हिंदी", both: "EN + हिंदी" },
    "ui.langHi": { en: "Hindi", hi: "हिंदी", both: "हिंदी" },
    "ui.langEn": { en: "English", hi: "English", both: "English" },
    "ui.toolsButton": { en: "⚙ Tools", hi: "⚙ टूल्स" },
    "ui.help": { en: "How to use", hi: "उपयोग कैसे करें" },
    "ui.toolsHeading": { en: "TOOLS · TEACHER / AUTHOR", hi: "टूल्स · शिक्षक / लेखक" },
    "ui.closeTools": { en: "Close tools", hi: "टूल्स बंद करें" },
    "ui.chooseChapter": { en: "Choose a chapter", hi: "अध्याय चुनें" },
    "ui.thirtyFt": { en: "30ft", hi: "30ft", both: "30ft" },
    "ui.spreadsLabel": { en: "spreads", hi: "स्प्रेड" },
    "ui.stampsLabel": { en: "sections done", hi: "पूर्ण खंड" },
    "ui.blocksLabel": { en: "3D blocks", hi: "3D ब्लॉक" },
    "ui.worldEyebrow": { en: "CBSE 2026-27 · NCERT SCIENCE · CLASS IX + X", hi: "सीबीएसई 2026-27 · NCERT विज्ञान · कक्षा IX + X" },
    "ui.worldH1": { en: "26 complete chapters in one 3D textbook.", hi: "एक 3D पाठ्यपुस्तक में 26 पूर्ण अध्याय।" },
    "ui.worldSub": { en: "Every topic and subtopic · bilingual · one spread each", hi: "हर विषय और उपविषय · द्विभाषी · एक-एक स्प्रेड" },
    "ui.worldSpreads": { en: "every topic and subtopic · bilingual ·", hi: "हर विषय और उपविषय · द्विभाषी ·" },
    "ui.enterArrow": { en: "→", hi: "→", both: "→" },
    "ui.close": { en: "Close", hi: "बंद करें" },
    "zoom.open": { en: "Enlarge figure", hi: "चित्र बड़ा करें" },
    "zoom.short": { en: "Zoom", hi: "ज़ूम", both: "Zoom" },
    "zoom.title": { en: "Enlarged figure", hi: "बड़ा चित्र" },
    "zoom.snapshot": { en: "3D snapshot · close to interact", hi: "3D चित्र · बातचीत के लिए बंद करें" },
    "zoom.unavailable": { en: "Figure is not available for zoom", hi: "चित्र ज़ूम के लिए उपलब्ध नहीं है" },
    "draft.button": { en: "HD Image", hi: "HD चित्र", both: "HD चित्र" },
    "draft.toggle": { en: "Toggle realistic topic illustration", hi: "सचित्र विषय चित्र चालू/बंद करें" },
    "draft.badge": { en: "APPROVED 2D PLATE", hi: "स्वीकृत 2D पटल" },
    "draft.labels": { en: "Labels verified · Click a label for bilingual notes · Click image to zoom", hi: "लेबल सत्यापित · विवरण हेतु लेबल चुनें · बड़ा देखने हेतु चित्र चुनें" },
    "draft.next": { en: "Next topic illustration", hi: "अगला विषय चित्र" },
    "ui.credit": { en: "Copyright / Developer : Paras Pranav", hi: "Copyright / Developer : Paras Pranav", both: "Copyright / Developer : Paras Pranav" },
    "ui.eyebrow": { en: "ANVEXIA · SCIENCE, BROUGHT TO LIFE.", hi: "अन्वेक्सिया · विज्ञान को जीवंत देखिए।" },
    "ui.class": { en: "Class", hi: "कक्षा" },
    "ui.classUpper": { en: "CLASS", hi: "कक्षा" },
    "ui.classIX": { en: "Class IX", hi: "कक्षा IX" },
    "ui.classX": { en: "Class X", hi: "कक्षा X" },
    "ui.classXI": { en: "Class XI (Higher Secondary)", hi: "कक्षा XI (उच्च माध्यमिक)" },
    "ui.classXII": { en: "Class XII (Higher Secondary)", hi: "कक्षा XII (उच्च माध्यमिक)" },
    "sv.tagline": { en: "Science, brought to life.", hi: "विज्ञान को जीवंत देखिए।", both: "Science, brought to life. · विज्ञान को जीवंत देखिए।" },
    "sv.pillar1": { en: "2D Flipbooks", hi: "2D फ़्लिपबुक", both: "2D Flipbooks · फ़्लिपबुक" },
    "sv.pillar2": { en: "3D Models", hi: "3D मॉडल", both: "3D Models · 3D मॉडल" },
    "sv.pillar3": { en: "Interactive Experiments", hi: "इंटरैक्टिव प्रयोग", both: "Interactive Experiments · प्रयोग" },
    "sv.pillar4": { en: "Hindi–English Learning", hi: "हिंदी–अंग्रेज़ी शिक्षण", both: "Hindi–English · द्विभाषी" },
    "sv.searchBtn": { en: "Search concepts, formulas, experiments (Ctrl+K)", hi: "अवधारणाएँ, सूत्र, प्रयोग खोजें (Ctrl+K)", both: "Search · विज्ञान खोजें (Ctrl+K)" },
    "sv.searchPlaceholder": { en: "Search 266 concepts, formulas, experiments in English or हिंदी…", hi: "अंग्रेज़ी या हिंदी में 266 अवधारणाएँ, सूत्र, प्रयोग खोजें…" },
    "sv.flipbookBtn": { en: "2D Flipbook", hi: "2D फ़्लिपबुक", both: "2D Flipbook · फ़्लिपबुक" },
    "sv.flipbookSub": { en: "Interactive two-page illustrated Science Flipbook · synced with 3D model", hi: "इंटरैक्टिव द्वि-पृष्ठ सचित्र विज्ञान फ़्लिपबुक · 3D मॉडल से जुड़ा" },
    "sv.open3d": { en: "Launch 3D Experiment ↗", hi: "3D प्रयोग खोलें ↗", both: "3D Experiment · 3D प्रयोग ↗" },
    "sv.higherBadge": { en: "EXPANDABLE · CLASS XI & XII", hi: "विस्तार योग्य · कक्षा XI व XII", both: "EXPANDABLE · CLASS XI–XII" },
    "sv.higherTitle": { en: "Higher Classes · Class XI & XII", hi: "उच्च कक्षाएँ · कक्षा XI व XII", both: "Class XI & XII · उच्च कक्षाएँ" },
    "sv.higherSub": { en: "Physics · Chemistry · Biology Studio", hi: "भौतिकी · रसायन · जीव विज्ञान स्टूडियो", both: "PCM / PCB · भौतिकी · रसायन · जीव विज्ञान" },
    "sv.higherOpen": { en: "Explore XI–XII Studio", hi: "XI–XII स्टूडियो खोलें", both: "Explore XI–XII · खोलें" },
    "ui.chemistry": { en: "Chemistry", hi: "रसायन विज्ञान" },
    "ui.biology": { en: "Biology", hi: "जीव विज्ञान" },
    "ui.physics": { en: "Physics", hi: "भौतिक विज्ञान" },
    "ui.clear": { en: "Clear", hi: "साफ़ करें" },
    "ui.chapterTitleOptional": { en: "Chapter title (optional)", hi: "अध्याय शीर्षक (वैकल्पिक)" },
    "ui.pdfHint": { en: "PDF text is extracted locally (best effort). For scanned pages, paste the text or use the World Spec view with an AI-generated JSON.", hi: "PDF पाठ स्थानीय रूप से निकाला जाता है (यथासंभव)। स्कैन पृष्ठों के लिए पाठ पेस्ट करें या World Spec में AI-निर्मित JSON का उपयोग करें।" },
    "ui.generatedWorldSpec": { en: "Generated WorldSpec", hi: "निर्मित WorldSpec" },
    "ui.copyJson": { en: "Copy JSON", hi: "JSON कॉपी करें" },
    "ui.compiledPlaceholder": { en: "// compiled WorldSpec will appear here", hi: "// निर्मित WorldSpec यहाँ दिखेगा" },
    "ui.copyPrompt": { en: "Copy production prompt", hi: "प्रोडक्शन प्रॉम्प्ट कॉपी करें" },
    "ui.schemaContract": { en: "Schema contract", hi: "स्कीमा अनुबंध" },
    "ui.productionPrompt": { en: "Production prompt (AI → JSON only)", hi: "प्रोडक्शन प्रॉम्प्ट (AI → केवल JSON)" },
    "ui.questions": { en: "questions", hi: "प्रश्न" },
    "ui.checks": { en: "checks", hi: "जाँचें" },
    "ui.notes": { en: "notes", hi: "नोट्स" },
    "ui.markers": { en: "markers", hi: "मार्कर" },
    "ui.quizSub": { en: "Answers are checked against the same model used by the pop-up apparatus.", hi: "उत्तर उसी मॉडल से जाँचे जाते हैं जो पॉप-अप उपकरण चलाता है।" },
    "ui.compilerSub": { en: "Paste or upload any CBSE / NCERT Science chapter. The deterministic compiler cuts it into printed spreads, routes each idea to a 3D pop-up scene block, generates prediction cards, live models, challenges and a quiz, then builds the world. No AI key is required; the JSON contract is also Gemini-ready.", hi: "कोई भी CBSE / NCERT विज्ञान अध्याय पेस्ट या अपलोड करें। नियतात्मक कंपाइलर उसे मुद्रित स्प्रेडों में बाँटता है, हर विचार को 3D पॉप-अप दृश्य से जोड़ता है, अनुमान कार्ड, लाइव मॉडल, चुनौती और क्विज़ बनाता है, फिर विश्व तैयार करता है। AI कुंजी आवश्यक नहीं; JSON अनुबंध Gemini-तैयार है।" },
    "ui.specSub": { en: "The engine is data-driven: an AI (or a teacher) writes ONLY this JSON. It never writes 3D code. Edit, validate, then build the world, or hand the prompt below to Gemini / Claude / Ollama.", hi: "इंजन डेटा-संचालित है: AI (या शिक्षक) केवल यह JSON लिखता है, 3D कोड कभी नहीं। संपादित करें, सत्यापित करें, विश्व बनाएँ या नीचे का प्रॉम्प्ट Gemini / Claude / Ollama को दें।" },
    "ui.researchSubExtra": { en: "19 projects, independently found and ranked; the four you supplied were treated as seeds, not as the whole universe.", hi: "स्वतंत्र रूप से खोजे और क्रमांकित 19 प्रोजेक्ट; आपके दिए चार प्रोजेक्ट बीज थे, संपूर्ण सूची नहीं।" },
    "ui.archBanner": { en: "MASTER ARCHITECTURE · THINK 1000×", hi: "मुख्य वास्तुशिल्प · 1000× सोचें" },
    "ui.notModuleGallery": { en: "Not a 3D module gallery.", hi: "यह 3D मॉड्यूल गैलरी नहीं है।" },
    "ui.archParagraph": { en: "A chapter compiler: textbook/PDF → concept graph → WorldSpec → 3D book renderer + pop-up scenes + draggable experiment engine + prediction/quiz state + progress/teacher layer.", hi: "एक अध्याय कंपाइलर: पाठ्यपुस्तक/PDF → अवधारणा ग्राफ़ → WorldSpec → 3D पुस्तक + पॉप-अप दृश्य + खींचने योग्य प्रयोग इंजन + अनुमान/क्विज़ + प्रगति/शिक्षक परत।" },
    "ui.tier": { en: "Tier", hi: "श्रेणी" },
    "ui.repository": { en: "Repository", hi: "रिपॉज़िटरी" },
    "ui.whatItDoes": { en: "What it does", hi: "यह क्या करता है" },
    "ui.adopted": { en: "What we adopted", hi: "हमने क्या अपनाया" },
    "ui.designRules": { en: "Design rules extracted", hi: "निकाले गए डिज़ाइन नियम" },
    "ui.rule1": { en: "1 · AI writes JSON, not code. PopBook: the model produces one strict book.json; a hand-written engine renders any valid book.", hi: "1 · AI कोड नहीं, JSON लिखता है। PopBook: मॉडल एक कड़ा book.json बनाता है; हस्तलिखित इंजन कोई भी वैध पुस्तक दिखाता है।" },
    "ui.rule2": { en: "2 · Model ≠ world. Atlas of Physics: model.js owns every number; checks.mjs asserts invariants; world.js only draws.", hi: "2 · मॉडल ≠ विश्व। Atlas of Physics: हर संख्या model.js में, अचरता checks.mjs में, केवल चित्रण world.js में।" },
    "ui.rule3": { en: "3 · Predict → try → observe → explain → stamp. Every Joule / PopBook / 3dvr-portal #3381: the prediction is locked before touching the apparatus.", hi: "3 · अनुमान → प्रयोग → अवलोकन → स्पष्टीकरण → स्टैम्प। उपकरण छूने से पहले अनुमान पक्का किया जाता है।" },
    "ui.rule4": { en: "4 · Numbers must agree. Text, readings, challenge, prediction and quiz all read from the same pure model function.", hi: "4 · संख्याएँ मेल खाएँ। पाठ, रीडिंग, चुनौती, अनुमान और क्विज़ एक ही शुद्ध मॉडल से पढ़ते हैं।" },
    "ui.rule5": { en: "5 · Two views, one state. CBSE Interactive Lab: a precision 2D accessible view shares the exact scientific state with the 3D book.", hi: "5 · दो दृश्य, एक अवस्था। सटीक 2D दृश्य और 3D पुस्तक एक ही वैज्ञानिक अवस्था साझा करते हैं।" },
    "ui.rule6": { en: "6 · Bilingual by construction. 3D_Notes: Hindi + English are first-class fields, not a translation pass.", hi: "6 · निर्माण से ही द्विभाषी। 3D_Notes: हिंदी + अंग्रेज़ी प्रथम-श्रेणी फ़ील्ड हैं, बाद की अनुवाद परत नहीं।" },
    "ui.rule7": { en: "7 · Offline single file. ChemLab 3D / 3D_Notes / digital-lab: no CDN, no account, works on a school network.", hi: "7 · ऑफ़लाइन एकल फ़ाइल। कोई CDN या खाता नहीं; स्कूल नेटवर्क पर चलता है।" },
    "ui.qrUnavailable": { en: "QR unavailable", hi: "QR उपलब्ध नहीं" },
    "ui.progressLocal": { en: "Progress is stored locally in the browser — no account, no server.", hi: "प्रगति ब्राउज़र में स्थानीय रूप से सहेजी जाती है — कोई खाता या सर्वर नहीं।" },
    "ui.workflow": { en: "textbook image / marker → QR deep link → WorldSpec spread → 3D pop-up + prediction + challenge", hi: "पाठ्यपुस्तक छवि / मार्कर → QR डीप लिंक → WorldSpec स्प्रेड → 3D पॉप-अप + अनुमान + चुनौती" },
    "ui.precisionBio": { en: "NCERT BIOLOGY · 3D + 2D share one declarative spec · bilingual aligned labels", hi: "NCERT जीव विज्ञान · 3D + 2D एक ही घोषणात्मक स्पेक साझा करते हैं · संरेखित द्विभाषी लेबल" },
    "ui.precisionNote": { en: "2D accessible view shares the exact same model + live readings as the 3D pop-up.", hi: "सुलभ 2D दृश्य 3D पॉप-अप का exactly वही मॉडल और लाइव रीडिंग साझा करता है।" },
    "ui.partsIdentified": { en: "parts identified", hi: "अंग पहचाने गए" },
    "ui.virtualImage": { en: "virtual image · backward ray extensions", hi: "आभासी प्रतिबिम्ब · पीछे की ओर किरण विस्तार" },
    "ui.realImage": { en: "real image · rays meet", hi: "वास्तविक प्रतिबिम्ब · किरणें मिलती हैं" },
    "ui.carbonChain": { en: "carbon chain", hi: "कार्बन श्रृंखला" },
    "ui.diagram": { en: "diagram", hi: "आरेख" },
    "ui.demoPrefix": { en: "Auto demo: ", hi: "स्वतः डेमो: " },
    "ui.maximum": { en: "maximum", hi: "अधिकतम" },
    "ui.minimum": { en: "minimum", hi: "न्यूनतम" },
    "ui.challengeDefault": { en: "Explore every labelled part and move a handle freely", hi: "हर अंकित भाग देखें और हैंडल घुमाएँ" },
    "ui.helpEyebrow": { en: "ANVEXIA · HOW IT WORKS", hi: "अन्वेक्सिया · यह कैसे काम करता है" },
    "ui.helpTitle": { en: "Science, brought to life.", hi: "विज्ञान को जीवंत देखिए।" },
    "ui.helpMetaWorld": { en: "Chapter shelf", hi: "अध्याय सूची" },
    "ui.helpRealBook": { en: "Book", hi: "पुस्तक" },
    "ui.helpPopUp": { en: "3D figure", hi: "3D चित्र" },
    "ui.helpPredictFirst": { en: "Check your understanding", hi: "जाँच" },
    "ui.helpExperiment": { en: "Experiment", hi: "प्रयोग" },
    "ui.helpChallengeStamp": { en: "Activity + section complete", hi: "क्रियाकलाप + खंड पूर्ण" },
    "ui.helpCompiler": { en: "Compiler", hi: "कंपाइलर" },
    "ui.help1": { en: "Pick a chapter from the shelf to open its book.", hi: "सूची से अध्याय चुनकर उसकी पुस्तक खोलें।" },
    "ui.help2": { en: "Printed canvas pages, bending page-turn physics (click a page corner, ← → or swipe).", hi: "मुद्रित कैनवास पृष्ठ, मुड़ता पन्ना (कोने पर क्लिक, ← → या स्वाइप)।" },
    "ui.help3": { en: "The right page folds open into a 3D apparatus that rises out of the paper.", hi: "दायाँ पृष्ठ खुलकर कागज़ से ऊपर उठता 3D उपकरण बन जाता है।" },
    "ui.help4": { en: "Answer the question, then open the explanation and check it against the figure.", hi: "प्रश्न का उत्तर दें, फिर व्याख्या खोलकर चित्र से मिलाएँ।" },
    "ui.help5": { en: "Drag the glowing 3D handles or use the sliders; every reading comes from one pure numerical model. Touch every part.", hi: "चमकते 3D हैंडल या स्लाइडर चलाएँ; हर रीडिंग एक शुद्ध संख्यात्मक मॉडल से आती है। हर हिस्सा छूएँ।" },
    "ui.help6": { en: "Answer the question and view every labelled part to complete a section; progress is saved locally.", hi: "प्रश्न का उत्तर दें और हर अंकित भाग देखें — खंड पूरा हो जाता है; प्रगति स्थानीय रूप से सहेजी जाती है।" },
    "ui.help7": { en: "Paste any textbook chapter → WorldSpec JSON → a brand new world. No AI key needed offline.", hi: "कोई अध्याय पेस्ट करें → WorldSpec JSON → नया विश्व। ऑफ़लाइन AI कुंजी आवश्यक नहीं।" },
    "ui.helpSyllabus": { en: "You are studying CBSE 2026-27 · NCERT Science, Class IX (Exploration, 13 chapters) and Class X (13 rationalised chapters) — 26 live chapters, one 3D spread for every topic and subtopic. Use the section picker to jump straight to any NCERT sub-section.", hi: "आप CBSE 2026-27 · NCERT विज्ञान, कक्षा IX (13 अध्याय) और कक्षा X (13 अध्याय) पढ़ रहे हैं — 26 लाइव अध्याय, हर विषय/उपविषय के लिए एक 3D स्प्रेड। किसी भी NCERT उप-अनुभाग पर जाने के लिए अनुभाग चयनक का उपयोग करें।" },
    "ui.helpCredit": { en: "Anvexia is an independent offline bilingual visual study platform for Class IX–X Science with extensible Class XI–XII chapter compilation. NCERT textbook content belongs to NCERT; third-party notices are in CREDITS.md.", hi: "अन्वेक्सिया कक्षा IX–X विज्ञान (तथा कक्षा XI–XII विस्तार) के लिए एक स्वतंत्र ऑफ़लाइन द्विभाषी दृश्य अध्ययन मंच है। NCERT पाठ्यपुस्तक सामग्री NCERT की है; तृतीय-पक्ष सूचनाएँ CREDITS.md में हैं।" },
    "ui.helpProjector": { en: "The book is centred, level and frontal so every student sees it straight; dragging cannot tilt it. Press ◉ for the angled 3D read/explore views.", hi: "पुस्तक केन्द्रित, समतल और सामने है ताकि हर विद्यार्थी उसे सीधा देखे; खींचने पर वह टेढ़ी नहीं होती। तिरछे 3D दृश्यों के लिए ◉ दबाएँ।" },
    "ui.helpLanguage": { en: "The top-bar language selector changes the printed 3D pages, prediction, key terms, quiz and narration. Bilingual mode shows both languages together on the same page.", hi: "ऊपरी भाषा चयनक मुद्रित 3D पृष्ठ, अनुमान, मुख्य शब्द, क्विज़ और वाचन बदलता है। द्विभाषी मोड दोनों भाषाएँ एक ही पृष्ठ पर दिखाता है।" },
    "toast.hiEnabled": { en: "Hindi enabled", hi: "हिंदी सक्षम" },
    "toast.enEnabled": { en: "English enabled", hi: "English enabled", both: "English enabled" },
    "toast.bothEnabled": { en: "Bilingual · English + Hindi", hi: "द्विभाषी · अंग्रेज़ी + हिंदी", both: "Bilingual · EN + हिंदी" },
    "toast.boardOn": { en: "Straight-on view", hi: "सीधा दृश्य" },
    "toast.boardOff": { en: "Angled view", hi: "तिरछा दृश्य" },
    "toast.ultraOn": { en: "3D figure on the page", hi: "3D चित्र पन्ने पर" },
    "toast.ultraOff": { en: "Figure on the page", hi: "चित्र पन्ने पर" },
    "toast.bigOn": { en: "Large print — readable from the back row", hi: "बड़ा अक्षर — पिछली पंक्ति से पढ़ें" },
    "toast.bigOff": { en: "Detailed text", hi: "विस्तृत पाठ" },
    "toast.preset": { en: "Classroom projector preset applied", hi: "क्लासरूम प्रोजेक्टर प्रीसेट लागू" },
    "toast.share": { en: "Shareable board link copied", hi: "शेयर लिंक कॉपी हुआ" },
    "toast.restore": { en: "Shared board setup restored", hi: "सेव किया गया बोर्ड सेटअप लोड हुआ" },
    "toast.inspected": { en: " · inspected", hi: " · जानकारी दर्ज" },
    "toast.choose": { en: "Choose an option first", hi: "पहले एक विकल्प चुनें" },
    "toast.good": { en: "Correct answer. Now read the explanation.", hi: "सही उत्तर। अब व्याख्या पढ़ें।" },
    "toast.locked": { en: "Answer recorded — now read the explanation.", hi: "उत्तर दर्ज — अब व्याख्या पढ़ें।" },
    "toast.lockFirst": { en: "Answer the question first, then open the explanation", hi: "पहले प्रश्न का उत्तर दें, फिर व्याख्या खोलें" },
    "toast.speechOff": { en: "Speech synthesis unavailable in this browser", hi: "इस ब्राउज़र में वाचन उपलब्ध नहीं" },
    "toast.narrating": { en: "Narrating…", hi: "सुनाना शुरू" },
    "toast.reset": { en: "Experiment reset", hi: "प्रयोग रीसेट" },
    "toast.stamped": { en: "Section complete.", hi: "खंड पूर्ण।" },
    "toast.sample": { en: "Sample chapter loaded", hi: "नमूना अध्याय लोड हुआ" },
    "toast.pdf": { en: "PDF text extracted locally (best effort)", hi: "PDF पाठ स्थानीय रूप से निकाला गया" },
    "toast.worldspec": { en: "WorldSpec imported", hi: "WorldSpec आयात हुआ" },
    "toast.chars": { en: "Paste at least 80 characters of chapter text", hi: "कम से कम 80 अक्षर पेस्ट करें" },
    "toast.specLoaded": { en: "Spec loaded", hi: "स्पेक लोड हुआ" },
    "toast.perfect": { en: "Perfect score ★", hi: "पूर्ण अंक ★" },
    "toast.invalidJson": { en: "Invalid JSON: ", hi: "अमान्य JSON: " },
    "toast.jsonError": { en: "JSON error: ", hi: "JSON त्रुटि: " },
    "toast.fileLoaded": { en: "loaded", hi: "लोड हुआ" },
    "p4.title": { en: "PROJECTOR", hi: "प्रोजेक्टर" },
    "p4.subtitle": { en: "Classroom presentation", hi: "कक्षा प्रस्तुति" },
    "p4.on": { en: "Projector Mode ON", hi: "प्रोजेक्टर मोड चालू" },
    "p4.off": { en: "Projector Mode", hi: "प्रोजेक्टर मोड" },
    "p4.enter": { en: "Enter Projector Mode", hi: "प्रोजेक्टर मोड खोलें" },
    "p4.exit": { en: "Exit", hi: "बाहर निकलें" },
    "p4.prev": { en: "Previous", hi: "पिछला" },
    "p4.next": { en: "Next", hi: "अगला" },
    "p4.lang": { en: "Language", hi: "भाषा" },
    "p4.highContrast": { en: "High contrast", hi: "उच्च कॉन्ट्रास्ट" },
    "p4.canvas": { en: "95% canvas", hi: "95% कैनवास" },
    "p4.sharedRenderer": { en: "One shared WebGL renderer", hi: "एक साझा WebGL रेंडरर" },
    "p4.noRecreate": { en: "No WebGL recreate", hi: "WebGL पुनर्निर्माण नहीं" },
    "p4.deeplink": { en: "?projector=1", hi: "?projector=1", both: "?projector=1" },
    "p4.hint": { en: "Alt+P toggles · ← → turn pages · Esc exits", hi: "Alt+P टॉगल · ← → पन्ने · Esc बाहर" },
    "p4.toastOn": { en: "Projector Mode · high contrast · 95% canvas", hi: "प्रोजेक्टर मोड · उच्च कॉन्ट्रास्ट · 95% कैनवास" },
    "p4.toastOff": { en: "Classroom view restored", hi: "कक्षा दृश्य बहाल" },
    "p4.clean": { en: "Perfect cleanup", hi: "पूर्ण सफ़ाई" },
    "p4.bilingual": { en: "English / Hindi / English + Hindi", hi: "EN / हिंदी / EN + हिंदी", both: "EN / हिंदी / EN + हिंदी" },
    "pack.parts": { en: "Parts", hi: "अंग" },
    "pack.scenes": { en: "3D scenes", hi: "3D दृश्य" },
    "pack.clear": { en: "Clear", hi: "साफ़ करें" },
    "pack.definition": { en: "Definition", hi: "परिभाषा" },
    "pack.pickHint": { en: "Click a chip or a 3D part", hi: "चिप या 3D अंग पर क्लिक करें" },
    "pack.empty": { en: "No part selected", hi: "कोई अंग नहीं चुना" },
    "pack.chapter": { en: "Chapter", hi: "अध्याय" },
    "pack.scene": { en: "Scene", hi: "दृश्य" },
    "pack.close": { en: "Clear selection", hi: "चयन हटाएँ" },
    "pack.fromUI": { en: "Selected from text", hi: "पाठ से चुना" },
    "pack.from3D": { en: "Selected in 3D", hi: "3D से चुना" },
    "pack.off": { en: "Parts mode off", hi: "अंग मोड बंद" },
    "pack.on": { en: "Parts mode on", hi: "अंग मोड चालू" },
    "pack.panelAria": { en: "Chapter parts", hi: "अध्याय के अंग" },
    "o3.rays": { en: "O3 rays", hi: "O3 किरणें" },
    "o3.labOn": { en: "O3 lab ON · click to close", hi: "O3 प्रयोगशाला चालू · बंद करने के लिए क्लिक करें" },
    "o3.open": { en: "Open O3 ray lab", hi: "O3 किरण प्रयोगशाला खोलें" },
    "o3.title": { en: "O3 · Light ray lab", hi: "O3 · प्रकाश किरण प्रयोगशाला" },
    "o3.sub": { en: "NCERT Class X · Chapter 9", hi: "NCERT कक्षा X · अध्याय 9" },
    "o3.empty": { en: "Open “Light – Reflection and Refraction” to arm the canonical O3 axis / ray / mirror / lens / arrow grammar.", hi: "O3 अक्ष / किरण / दर्पण / लेंस / तीर व्याकरण चालू करने के लिए “प्रकाश – परावर्तन तथा अपवर्तन” खोलें।" },
    "o3.openLight": { en: "Open Class X Light", hi: "कक्षा X प्रकाश खोलें" },
    "o3.deeplink": { en: "?o3=1 deep link", hi: "?o3=1 डीप लिंक" },
    "o3.selected": { en: "Selected in 3D", hi: "3D में चयनित" },
    "o3.dynamic": { en: "Dynamic rays (click to focus)", hi: "गतिशील किरणें (फ़ोकस हेतु क्लिक करें)" },
    "o3.recompute": { en: "Recompute", hi: "पुनर्गणना" },
    "o3.clearFocus": { en: "Clear focus", hi: "फ़ोकस हटाएँ" },
    "o3.recomputed": { en: "recomputed", hi: "पुनर्गणना" },
    "o3.close": { en: "Close", hi: "बंद करें" },
    "o3.panelAria": { en: "O3 ray lab", hi: "O3 किरण प्रयोगशाला" },
    "o3.labArmed": { en: "O3 ray lab armed", hi: "O3 किरण प्रयोगशाला चालू" },
    "pack.title": { en: "Chapter packs", hi: "अध्याय पैक" },
    "pack.subtitle": { en: "29 NCERT IX/X chapter packs · 20 bilingual MCQs each · parsed only when opened", hi: "29 NCERT IX/X अध्याय पैक · प्रत्येक में 20 द्विभाषी प्रश्न · खोलने पर ही पढ़े जाते हैं" },
    "pack.panelAria": { en: "Lazy chapter packs", hi: "लेज़ी अध्याय पैक" },
    "pack.close": { en: "Close chapter packs", hi: "अध्याय पैक बंद करें" },
    "pack.loaded": { en: "Loaded", hi: "लोड" },
    "pack.inert": { en: "inert", hi: "निष्क्रिय" },
    "pack.inertData": { en: "inert JSON", hi: "निष्क्रिय JSON" },
    "pack.sections": { en: "sections", hi: "अनुभाग" },
    "pack.mcqs": { en: "MCQs", hi: "बहुविकल्पी प्रश्न" },
    "pack.toggle": { en: "Chapter packs", hi: "अध्याय पैक" },
    "pack.hint": { en: "Alt+K", hi: "Alt+K" },
    "pack.deeplink": { en: "?pack=1", hi: "?pack=1" },
    "pack.organs": { en: "Procedural Life Processes organs · no GLTF", hi: "प्रक्रियात्मक जीवन प्रक्रम अंग · बिना GLTF" },
    "pack.electric": { en: "Data primitives · Electricity", hi: "डेटा प्रिमिटिव · विद्युत" },
    "pack.clearOrgan": { en: "Clear organ", hi: "अंग हटाएँ" },
    "pack.organHint": { en: "Select an organ to build it on the shared renderer", hi: "साझा रेंडरर पर बनाने के लिए अंग चुनें" },
    "pack.organStatus": { en: "pickable parts · shared WORLD renderer", hi: "चयन भाग · साझा WORLD रेंडरर" },
    "pack.series": { en: "Ohm series", hi: "ओम श्रेणी" },
    "pack.parallel": { en: "Ohm parallel", hi: "ओम समान्तर" },
    "pack.ohm": { en: "V = I R", hi: "V = I R" },
    "pack.wire": { en: "Connecting wire", hi: "संयोजक तार" },
    "pack.resistor": { en: "Resistor R", hi: "प्रतिरोधक R" },
    "pack.battery": { en: "Cell / battery V", hi: "सेल / बैटरी V" },
    "toast.packOn": { en: "Chapter packs opened", hi: "अध्याय पैक खुले" },
    "toast.packOff": { en: "Chapter packs closed", hi: "अध्याय पैक बंद" }
  };
  /* Data-driven O3 model strings are English in the pure JSON layer.
     This lookup supplies their canonical Hindi counterparts before
     EVDICT.auto() registers each pair. Math-only strings stay as-is. */
  const O3_HI = {
    "Angle of incidence i": "आपतन कोण i",
    "Angle of reflection r": "परावर्तन कोण r",
    "Incidence angle i": "आपतन कोण i",
    "Refraction angle r": "अपवर्तन कोण r",
    "Refractive index n": "अपवर्तनांक n",
    "Object = image distance": "वस्तु दूरी = प्रतिबिम्ब दूरी",
    "Size ratio": "आकार अनुपात",
    "Object distance u": "वस्तु दूरी u",
    "Focal length f": "फोकस दूरी f",
    "Image distance v": "प्रतिबिम्ब दूरी v",
    "Magnification m": "आवर्धन m",
    "Lateral shift": "पार्श्व विस्थापन",
    "Lens 1 power": "लेंस 1 की क्षमता",
    "Lens 2 power": "लेंस 2 की क्षमता",
    "Net power P": "कुल क्षमता P",
    "Equivalent f": "तुल्य फोकस दूरी f",
    "real, erect": "वास्तविक, सीधा",
    "real, inverted": "वास्तविक, उल्टा",
    "virtual, erect": "आभासी, सीधा",
    "virtual, inverted": "आभासी, उल्टा",
    "virtual, erect, same size": "आभासी, सीधा, समान आकार",
    "incident": "आपतित",
    "straight-line": "सरल रेखा",
    "parametric-curve": "प्राचल वक्र",
    "reflected ∠i=∠r": "परावर्तित ∠i=∠r",
    "virtual-image extension": "आभासी प्रतिबिम्ब विस्तार",
    "parallel to principal axis": "मुख्य अक्ष के समांतर",
    "through / from focus F": "फोकस F से / की ओर",
    "incident at pole": "ध्रुव पर आपतित",
    "reflected at pole": "ध्रुव पर परावर्तित",
    "focus construction": "फोकस रचना",
    "refracts through focus F": "फोकस F से अपवर्तित",
    "through optical centre, undeviated": "प्रकाशिक केन्द्र से अविचलित",
    "incident / Snell": "आपतन / स्नेल",
    "towards / away from normal": "अभिलंब की ओर / से दूर",
    "emergent ∥ incident": "निर्गत ∥ आपतित",
    "normal at first face": "पहली सतह पर अभिलंब",
    "normal at second face": "दूसरी सतह पर अभिलंब",
    "operating point": "वर्तमान बिंदु",
    "New Cartesian sign convention · pole/optical centre is origin · object on the left gives u < 0": "न्यू कार्तीय चिह्न परिपाटी · ध्रुव/प्रकाशिक केन्द्र मूल बिंदु · बाईं ओर वस्तु के लिए u < 0",
    "emergent ray ∥ incident ray · lateral shift": "निर्गत किरण ∥ आपतित किरण · पार्श्व विस्थापन"
  };
  function hiFor(en) { return O3_HI[String(en == null ? "" : en)] || ""; }
  function pairHi(en, hi) { return auto(en, hi || hiFor(en) || en); }


  const base = (typeof I18N !== 'undefined') ? I18N : { en: {}, hi: {}, both: {} };
  const entries = {};
  const baseKeys = [], extraKeys = [], autoKeys = [];
  const pairKeys = new Map();

  function normMode(m) { return MODES.indexOf(m) >= 0 ? m : 'both'; }
  function currentMode() {
    if (typeof EV !== 'undefined' && EV && MODES.indexOf(EV.lang) >= 0) return EV.lang;
    return 'both';
  }
  function bothOf(en, hi) {
    if (!hi || hi === en) return en;
    return (en.length + hi.length <= 42) ? en + ' · ' + hi : en + ' / ' + hi;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function add(key, en, hi, both, bucket) {
    en = String(en == null ? key : en);
    hi = String(hi == null || hi === '' ? en : hi);
    entries[key] = { en: en, hi: hi, both: String(both == null || both === '' ? bothOf(en, hi) : both) };
    bucket.push(key);
  }
  Object.keys(base.en || {}).forEach(k => {
    add(k, base.en[k], (base.hi || {})[k], (base.both || {})[k], baseKeys);
  });
  Object.keys(EXTRA).forEach(k => {
    const e = EXTRA[k];
    add(k, e.en, e.hi, e.both, extraKeys);
  });

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
  }
  function auto(en, hi) {
    en = String(en == null ? '' : en);
    hi = String(hi == null || hi === '' ? en : hi);
    const sig = en + '\u0000' + hi;
    if (pairKeys.has(sig)) return pairKeys.get(sig);
    const key = 'auto.' + hash(sig);
    entries[key] = { en: en, hi: hi, both: en === hi ? en : en + ' / ' + hi };
    pairKeys.set(sig, key); autoKeys.push(key);
    return key;
  }
  /* Register the complete O3 data vocabulary up front, so the canonical
     manifest is deterministic even before a given ray model is displayed. */
  Object.keys(O3_HI).forEach(en => auto(en, O3_HI[en]));
  function get(key, mode, fallback) {
    const m = normMode(mode || currentMode());
    const e = entries[key];
    if (e && e[m] !== undefined && e[m] !== '') return e[m];
    if (fallback) {
      if (typeof fallback === 'string') return fallback;
      if (fallback[m] !== undefined && fallback[m] !== '') return fallback[m];
      if (fallback.en) return fallback.en;
    }
    return key;
  }
  function bi(en, hi, sep, mode) {
    const m = normMode(mode || currentMode());
    en = en == null ? '' : String(en); hi = hi == null ? '' : String(hi);
    if (m === 'hi') return hi || en;
    if (m === 'both' && hi && hi !== en) return en + (sep === undefined ? ' · ' : sep) + hi;
    return en || hi;
  }
  function literal(en, hi, mode) { return get(auto(en, hi), mode || currentMode()); }
  function attrs(en, hi, key) {
    en = String(en == null ? '' : en); hi = String(hi == null || hi === '' ? en : hi);
    const k = key || auto(en, hi);
    return ' data-i18n="' + esc(k) + '" data-i18n-en="' + esc(en) +
           '" data-i18n-hi="' + esc(hi) + '"';
  }
  function register(key, en, hi, both) {
    if (!entries[key]) { add(key, en, hi, both, extraKeys); return key; }
    return key;
  }

  function apply(root, mode) {
    root = root || document;
    const m = normMode(mode || currentMode());
    const out = { nodes: 0, titles: 0, aria: 0, placeholders: 0, missing: [] };
    const nodes = sel => {
      const list = root.querySelectorAll ? Array.prototype.slice.call(root.querySelectorAll(sel)) : [];
      if (root.matches && root.matches(sel)) list.unshift(root);
      return list;
    };
    const resolve = el => {
      let key = el.getAttribute('data-i18n') || '';
      const en = el.getAttribute('data-i18n-en'), hi = el.getAttribute('data-i18n-hi');
      if (!entries[key] && en !== null) { key = auto(en, hi || en); el.setAttribute('data-i18n', key); }
      if (!entries[key]) { out.missing.push(key || '(empty)'); return null; }
      return key;
    };
    nodes('[data-i18n]').forEach(el => {
      if (el.children && el.children.length) return;   /* preserve nested markup */
      const key = resolve(el); if (!key) return;
      el.textContent = get(key, m); out.nodes++;
    });
    nodes('[data-i18n-title]').forEach(el => {
      let key = el.getAttribute('data-i18n-title');
      const en = el.getAttribute('data-i18n-en'), hi = el.getAttribute('data-i18n-hi');
      if (!entries[key] && en !== null) { key = auto(en, hi || en); el.setAttribute('data-i18n-title', key); }
      if (!entries[key]) { out.missing.push(key); return; }
      el.setAttribute('title', get(key, m)); out.titles++;
    });
    nodes('[data-i18n-aria]').forEach(el => {
      let key = el.getAttribute('data-i18n-aria');
      if (!entries[key]) { out.missing.push(key); return; }
      el.setAttribute('aria-label', get(key, m)); out.aria++;
    });
    nodes('[data-i18n-placeholder]').forEach(el => {
      let key = el.getAttribute('data-i18n-placeholder');
      if (!entries[key]) { out.missing.push(key); return; }
      el.setAttribute('placeholder', get(key, m)); out.placeholders++;
    });
    return out;
  }

  function health() {
    const missing = [];
    Object.keys(entries).forEach(k => {
      const e = entries[k];
      MODES.forEach(m => { if (typeof e[m] !== 'string' || !e[m]) missing.push(k + ':' + m); });
    });
    return { keyCount: Object.keys(entries).length, baseKeys: baseKeys.length,
             extraKeys: extraKeys.length, autoKeys: autoKeys.length,
             missingPairs: missing.length, missing: missing.slice(0, 20),
             modes: MODES.slice(), pass: missing.length === 0 };
  }
  function manifest() {
    return {
      schema: SCHEMA, version: VERSION, prompt: 4, release: RELEASE, credit: CREDIT,
      languages: MODES.slice(), keyCount: Object.keys(entries).length,
      baseKeys: baseKeys.length, extraKeys: extraKeys.length, autoKeys: autoKeys.length,
      health: health(), entries: JSON.parse(JSON.stringify(entries)),
      guarantees: [
        'one canonical registry for EN / HI / EN+HI',
        'every key has a non-empty en, hi and both value',
        't(), BI(), EVPACK.uiText(), EVBIND and O3LAB all route through EVDICT',
        'data-i18n / data-i18n-title / data-i18n-aria / data-i18n-placeholder apply without WebGL recreate',
        'auto.* keys register data-driven bilingual pairs deterministically',
        'zero external refs · zero network · zero React · zero GLB/GLTF'
      ],
      deferred: []
    };
  }

  return {
    VERSION, CREDIT, SCHEMA, MODES, EXTRA,
    get, bi, literal, auto, attrs, apply, register, esc, health, manifest, hiFor, pairHi,
    normMode, currentMode,
    get entries() { return JSON.parse(JSON.stringify(entries)); }
  };
})();
