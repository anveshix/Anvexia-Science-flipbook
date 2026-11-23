/* ==========================================================================
   EduVerse — NCERT Class X Science Chapter 4 · "Carbon and its Compounds"
   Deep curated WorldSpec: 16 spreads, one per NCERT section / activity.
   Every spread carries EN + HI title, concept, explanation, key terms,
   prediction, lift-the-flap answer, printed formula, figure caption,
   a draggable 3D experiment, a challenge and a quiz item.
   ========================================================================== */

const CARBON_SECTIONS = [
  { id: "4.1", en: "4.1 Bonding in carbon · covalent bond", hi: "4.1 कार्बन में बंधन · सहसंयोजी बंध", spread: 0, color: "#4c7fa8" },
  { id: "4.1b", en: "Allotropes · diamond, graphite, C₆₀", hi: "अपररूप · हीरा, ग्रेफाइट, C₆₀", spread: 1, color: "#6f8fb8" },
  { id: "4.2", en: "4.2 Versatile nature · catenation", hi: "4.2 कार्बन की बहुमुखता · शृंखलन", spread: 2, color: "#3f8f7f" },
  { id: "4.2.1", en: "4.2.1 Saturated / unsaturated", hi: "4.2.1 संतृप्त / असंतृप्त", spread: 3, color: "#4fa88f" },
  { id: "4.2.2", en: "4.2.2 Chains, branches, rings", hi: "4.2.2 शृंखला, शाखाएँ, वलय", spread: 4, color: "#8a6fd0" },
  { id: "4.2.3", en: "4.2.3 Functional groups", hi: "4.2.3 क्रियात्मक समूह", spread: 5, color: "#b07f4a" },
  { id: "4.2.4", en: "4.2.4 Homologous series", hi: "4.2.4 समजात श्रेणी", spread: 6, color: "#c2763c" },
  { id: "4.2.5", en: "4.2.5 Nomenclature", hi: "4.2.5 नामकरण", spread: 7, color: "#b5537f" },
  { id: "4.3.1", en: "4.3.1 Combustion", hi: "4.3.1 दहन", spread: 8, color: "#d07a48" },
  { id: "4.3.2", en: "4.3.2 Oxidation", hi: "4.3.2 ऑक्सीकरण", spread: 9, color: "#9b7fd4" },
  { id: "4.3.3", en: "4.3.3 Addition · hydrogenation", hi: "4.3.3 योग · हाइड्रोजनीकरण", spread: 10, color: "#4a9c8c" },
  { id: "4.3.4", en: "4.3.4 Substitution", hi: "4.3.4 प्रतिस्थापन", spread: 11, color: "#6fbf63" },
  { id: "4.4.1", en: "4.4.1 Ethanol", hi: "4.4.1 एथेनॉल", spread: 12, color: "#4c8fb8" },
  { id: "4.4.2", en: "4.4.2 Ethanoic acid", hi: "4.4.2 एथेनोइक अम्ल", spread: 13, color: "#d9564f" },
  { id: "4.4.2b", en: "Esterification & saponification", hi: "एस्टरीकरण व साबुनीकरण", spread: 14, color: "#c9a24a" },
  { id: "4.5", en: "4.5 Soaps & detergents", hi: "4.5 साबुन व अपमार्जक", spread: 15, color: "#4ad6ff" }
];

/* shorthand that adds Hindi vocabulary + Hindi prediction to the base S() */
function CS(type, title, hiTitle, section, o) {
  const s = S(type, title, hiTitle, section, o);
  if (o.vh) s.vocabHi = o.vh;
  if (o.ph) s.predictHi = { q: o.ph[0], options: o.ph[1], a: o.p[2] };
  return s;
}

WORLDS.c10_carbon = [

  CS("covalent", "Carbon shares, it does not swap electrons", "कार्बन इलेक्ट्रॉन साझा करता है, बदलता नहीं", "4.1", {
    short: "The covalent bond", c: "Carbon (Z = 6, configuration 2,4) cannot gain four electrons — six protons cannot hold ten — nor lose four, which needs enormous energy. It shares four valence electrons instead. Covalent molecules have strong internal bonds but weak forces between molecules, so carbon compounds have low melting/boiling points and do not conduct electricity.",
    ch: "कार्बन (Z = 6, विन्यास 2,4) न चार इलेक्ट्रॉन ले सकता है — छह प्रोटॉन दस इलेक्ट्रॉन नहीं रोक सकते — और न चार खो सकता है, जिसमें बहुत ऊर्जा लगेगी। अतः वह चार संयोजकता इलेक्ट्रॉन साझा करता है। अणुओं के भीतर बंधन प्रबल परंतु अंतर-आणविक बल दुर्बल हैं, इसलिए गलनांक/क्वथनांक कम हैं और विद्युत चालन नहीं होता।",
    f: ["TABLE 4.1", "CH₄ mp 90 K · bp 111 K", "Acetic acid 290/391 K · ethanol 156/351 K · chloroform 209/334 K."],
    v: [["Covalent bond", "Bond formed by sharing an electron pair."], ["Tetravalency", "Carbon forms four covalent bonds."], ["Intermolecular force", "Weak attraction between molecules."]],
    vh: [["सहसंयोजी बंध", "इलेक्ट्रॉन युग्म साझा करने से बना बंध।"], ["चतुःसंयोजकता", "कार्बन चार बंध बनाता है।"], ["अंतर-आणविक बल", "अणुओं के बीच दुर्बल आकर्षण।"]],
    p: ["Why can carbon not form C⁴⁺ or C⁴⁻ ions?", ["Six protons cannot hold ten electrons", "Removing four electrons needs far too much energy", "Both reasons are correct"], 2],
    ph: ["कार्बन C⁴⁺ या C⁴⁻ आयन क्यों नहीं बनाता?", ["छह प्रोटॉन दस इलेक्ट्रॉन नहीं रोक सकते", "चार इलेक्ट्रॉन निकालने में बहुत ऊर्जा लगेगी", "दोनों कारण सही हैं"], 2],
    e: "Both routes fail. Sharing four pairs gives carbon a stable octet of eight valence electrons without forming ions. No free ions means poor conductivity; weak intermolecular forces mean low melting and boiling points — compare methane (111 K) with an ionic solid.",
    eh: "दोनों रास्ते असंभव हैं। चार युग्म साझा करने से बिना आयन बने कार्बन को आठ संयोजकता इलेक्ट्रॉनों का स्थायी अष्टक मिलता है। मुक्त आयन न होने से विद्युत चालन नहीं, और दुर्बल अंतर-आणविक बल से गलनांक/क्वथनांक कम — मेथेन 111 K की तुलना आयनिक ठोस से करें।",
    fig: "Fig 4.1–4.5 — H₂ single, O₂ double, N₂ triple, CH₄ tetrahedral (109.5°) electron-dot structure.", hint: "Pick a molecule; compare bond order, linear diatomic geometry and methane's tetrahedral 109.5° angle.",
    sc: { params: {}, challenge: { text: "Complete carbon's octet: sharing = 100%.", target: { key: "octet", value: 100, op: "gte" } } },
    q: ["Ethane, C₂H₆, has how many covalent bonds?", ["6", "7", "8", "9"], 1, "Six C–H bonds plus one C–C bond = seven covalent bonds."]
  }),

  CS("allotrope", "One element, three structures", "एक तत्व, तीन संरचनाएँ", "4.1b", {
    short: "Allotropes of carbon", c: "Diamond, graphite and C-60 are all pure carbon. In diamond each C bonds to four others in a rigid 3D network — the hardest substance known. In graphite each C bonds to three others in flat hexagonal layers that slide over one another; delocalised electrons make it a good conductor. C-60 fullerene is a football-shaped cage.",
    ch: "हीरा, ग्रेफाइट और C-60 — तीनों शुद्ध कार्बन हैं। हीरे में प्रत्येक C चार अन्य C से दृढ़ त्रिविम जाल में जुड़ा है, अतः यह कठोरतम पदार्थ है। ग्रेफाइट में प्रत्येक C तीन अन्य से षट्कोणीय परतों में जुड़ा है जो सरकती हैं; मुक्त इलेक्ट्रॉन इसे सुचालक बनाते हैं। C-60 फुटबॉल आकार का फुलरीन है।",
    f: ["ALLOTROPES", "C₄ network · C₃ layers · C₆₀ cage", "Same chemical properties, very different physical properties."],
    v: [["Diamond", "Rigid 3D network, hardest substance."], ["Graphite", "Hexagonal layers, soft and conducting."], ["Fullerene", "C-60, football-shaped carbon cage."]],
    vh: [["हीरा", "दृढ़ त्रिविम जाल, कठोरतम पदार्थ।"], ["ग्रेफाइट", "षट्कोणीय परतें, मुलायम व सुचालक।"], ["फुलरीन", "C-60, फुटबॉल आकार का पिंजरा।"]],
    p: ["Why does graphite conduct electricity but diamond does not?", ["Diamond has free electrons", "Graphite has delocalised electrons between its layers", "Graphite contains metal ions"], 1],
    ph: ["ग्रेफाइट विद्युत का चालक है पर हीरा नहीं, क्यों?", ["हीरे में मुक्त इलेक्ट्रॉन हैं", "ग्रेफाइट की परतों के बीच विस्थानित इलेक्ट्रॉन हैं", "ग्रेफाइट में धातु आयन हैं"], 1],
    e: "In graphite each carbon uses only three of its four valence electrons for bonds; the fourth is delocalised across the hexagonal sheet and can carry charge. In diamond all four electrons are locked in covalent bonds, so there are no mobile charges.",
    eh: "ग्रेफाइट में प्रत्येक कार्बन अपने चार में से केवल तीन इलेक्ट्रॉन बंध में लगाता है; चौथा षट्कोणीय परत में विस्थानित होकर आवेश ले जाता है। हीरे में चारों इलेक्ट्रॉन सहसंयोजी बंधों में बँधे हैं, अतः गतिशील आवेश नहीं।",
    fig: "NCERT p.61 — structures of diamond, graphite and Buckminsterfullerene.", hint: "Switch the allotrope and run the conductivity probe above 80%.",
    sc: { params: {}, challenge: { text: "Show graphite conducting: probe ≥ 80%.", target: { key: "conductivity", value: 80, op: "gte" } } },
    q: ["Which allotrope of carbon conducts electricity?", ["Diamond", "Graphite", "C-60 fullerene"], 1, "Graphite has delocalised electrons between its hexagonal layers."]
  }),

  CS("catenation", "Why carbon makes millions of compounds", "कार्बन लाखों यौगिक क्यों बनाता है", "4.2", {
    short: "Catenation", c: "Two properties explain the millions of carbon compounds: tetravalency (four bonds) and catenation — carbon bonding to carbon in long chains, branches and rings. The C–C bond is exceptionally strong because carbon is small, so its nucleus holds shared pairs tightly. Silicon manages chains of only seven or eight atoms, and those are very reactive.",
    ch: "करोड़ों कार्बन यौगिकों के दो कारण हैं: चतुःसंयोजकता (चार बंध) और शृंखलन — कार्बन का कार्बन से लंबी शृंखलाओं, शाखाओं व वलयों में जुड़ना। कार्बन छोटा होने से C–C बंध अत्यंत प्रबल है, नाभिक साझा युग्म को कसकर पकड़ता है। सिलिकॉन केवल 7–8 परमाणुओं की शृंखला बना पाता है और वे बहुत क्रियाशील हैं।",
    f: ["TABLE 4.2", "CₙH₂ₙ₊₂ · CH₄ → C₆H₁₄", "Each step adds one –CH₂– unit; total bonds = 3n + 1."],
    v: [["Catenation", "Self-linking of carbon atoms into chains."], ["Tetravalency", "Four bonds per carbon atom."], ["Hydrocarbon", "Compound of carbon and hydrogen only."]],
    vh: [["शृंखलन", "कार्बन परमाणुओं का आपस में शृंखला बनाना।"], ["चतुःसंयोजकता", "प्रत्येक कार्बन के चार बंध।"], ["हाइड्रोकार्बन", "केवल कार्बन व हाइड्रोजन का यौगिक।"]],
    p: ["Which two properties give carbon its huge number of compounds?", ["Catenation and tetravalency", "High melting point and conductivity", "Ionic bonding and radioactivity"], 0],
    ph: ["कार्बन के लाखों यौगिकों के लिए कौन-से दो गुण उत्तरदायी हैं?", ["शृंखलन व चतुःसंयोजकता", "उच्च गलनांक व चालकता", "आयनिक बंध व रेडियोधर्मिता"], 0],
    e: "Tetravalency lets one carbon attach four atoms; catenation lets carbons attach to each other indefinitely. The small carbon atom makes the C–C bond strong and stable, so chains of almost any length exist — the backbone of organic chemistry.",
    eh: "चतुःसंयोजकता एक कार्बन को चार परमाणु जोड़ने देती है; शृंखलन कार्बन को अन्य कार्बन से असीमित जोड़ने देता है। छोटे आकार के कारण C–C बंध प्रबल व स्थायी है, इसलिए लगभग किसी भी लंबाई की शृंखला संभव है — कार्बनिक रसायन का आधार।",
    fig: "Table 4.2 — methane, ethane, propane, butane, pentane, hexane.", hint: "Grow the chain to six carbons and watch the formula and molar mass change.",
    sc: { params: {}, challenge: { text: "Build a chain of at least 6 carbon atoms.", target: { key: "n", value: 6, op: "gte" } } },
    q: ["The two properties of carbon leading to a huge number of compounds are:", ["Catenation and tetravalency", "Isomerism and allotropy", "Ionisation and reduction"], 0, "NCERT §4.2: tetravalency plus self-linking (catenation)."]
  }),

  CS("bondorder", "Single, double and triple bonds", "एकल, द्वि और त्रि बंध", "4.2.1", {
    short: "Saturated / unsaturated", c: "Build a structure stepwise: join the carbons with a single bond, then satisfy the remaining valencies with hydrogen. Ethane C₂H₆ has only single bonds and is saturated, normally not very reactive. Ethene C₂H₄ needs a C=C double bond and ethyne C₂H₂ a C≡C triple bond; these unsaturated compounds are more reactive.",
    ch: "संरचना चरणबद्ध बनाएँ: पहले कार्बनों को एकल बंध से जोड़ें, फिर शेष संयोजकता हाइड्रोजन से पूरी करें। एथेन C₂H₆ में केवल एकल बंध हैं — संतृप्त, सामान्यतः कम क्रियाशील। एथीन C₂H₄ में C=C द्वि-बंध और एथाइन C₂H₂ में C≡C त्रि-बंध होता है; ये असंतृप्त यौगिक अधिक क्रियाशील हैं।",
    f: ["FORMULAE", "C₂H₆ · C₂H₄ · C₂H₂", "Alkanes CnH2n+2 · alkenes CnH2n · alkynes CnH2n−2."],
    v: [["Saturated", "Only C–C single bonds."], ["Unsaturated", "Has a C=C or C≡C bond."], ["Valency", "Number of bonds an atom forms."]],
    vh: [["संतृप्त", "केवल C–C एकल बंध।"], ["असंतृप्त", "C=C या C≡C बंध उपस्थित।"], ["संयोजकता", "परमाणु द्वारा बनाए गए बंधों की संख्या।"]],
    p: ["How many bonds link the two carbon atoms in ethyne?", ["One", "Two", "Three"], 2],
    ph: ["एथाइन में दो कार्बनों के बीच कितने बंध हैं?", ["एक", "दो", "तीन"], 2],
    e: "Two carbons sharing three pairs give H–C≡C–H. Each carbon then shares one more pair with hydrogen, so both reach an octet. The triple bond is the reason ethyne is unsaturated and reactive.",
    eh: "दो कार्बन तीन युग्म साझा करके H–C≡C–H बनाते हैं। प्रत्येक कार्बन एक युग्म हाइड्रोजन के साथ साझा कर अष्टक पूरा करता है। त्रि-बंध के कारण एथाइन असंतृप्त व क्रियाशील है।",
    fig: "Fig 4.6 / 4.7 — stepwise structures of ethane and ethene.", hint: "Change the bond order, then use bromine water to test for unsaturation.",
    sc: { params: {}, challenge: { text: "Decolourise bromine water ≥ 90% with an unsaturated compound.", target: { key: "decolour", value: 90, op: "gte" } } },
    q: ["Which of these undergo addition reactions?", ["C₂H₆ and CH₄", "C₃H₆ and C₂H₂", "C₃H₈ only"], 1, "Only unsaturated hydrocarbons (alkenes/alkynes) add hydrogen across the multiple bond."]
  }),

  CS("isomer", "Chains, branches and rings", "शृंखला, शाखाएँ और वलय", "4.2.2", {
    short: "Structural isomers", c: "C₄H₁₀ has two structures: straight-chain n-butane and branched 2-methylpropane. Compounds with the same molecular formula but different structures are structural isomers. Carbon chains can also close into rings — cyclohexane C₆H₁₂ is saturated, while benzene C₆H₆ has alternating single and double bonds and is unsaturated.",
    ch: "C₄H₁₀ की दो संरचनाएँ हैं: सीधी शृंखला वाला n-ब्यूटेन और शाखित 2-मेथिलप्रोपेन। समान अणुसूत्र परंतु भिन्न संरचना वाले यौगिक संरचनात्मक समावयवी कहलाते हैं। शृंखलाएँ वलय भी बना सकती हैं — साइक्लोहेक्सेन C₆H₁₂ संतृप्त है, जबकि बेंजीन C₆H₆ में एकांतर एकल व द्वि-बंध हैं और वह असंतृप्त है।",
    f: ["ISOMERS + RINGS", "C₄H₁₀ → 2 structures", "Cyclohexane C₆H₁₂ · benzene C₆H₆."],
    v: [["Structural isomer", "Same formula, different structure."], ["Ring", "Carbon chain closed into a loop."], ["Benzene", "C₆H₆ with alternating double bonds."]],
    vh: [["संरचनात्मक समावयवी", "समान सूत्र, भिन्न संरचना।"], ["वलय", "बंद हुई कार्बन शृंखला।"], ["बेंजीन", "एकांतर द्वि-बंधों वाला C₆H₆।"]],
    p: ["Two compounds with the same molecular formula but different structures are:", ["Homologues", "Structural isomers", "Allotropes"], 1],
    ph: ["समान अणुसूत्र परंतु भिन्न संरचना वाले यौगिक कहलाते हैं:", ["समजात", "संरचनात्मक समावयवी", "अपररूप"], 1],
    e: "The four-carbon skeleton can be drawn in two ways; filling the remaining valencies with hydrogen gives two different molecules, both C₄H₁₀. Allotropes are different forms of an element; homologues differ by a CH₂ unit — neither fits here.",
    eh: "चार कार्बन का कंकाल दो प्रकार से बनता है; शेष संयोजकताएँ H से भरने पर दो भिन्न अणु मिलते हैं, दोनों C₄H₁₀। अपररूप किसी तत्व के भिन्न रूप हैं और समजात CH₂ से भिन्न होते हैं — यहाँ दोनों नहीं।",
    fig: "Fig 4.8–4.10 — butane isomers, cyclohexane and benzene.", hint: "Switch from the two butanes to the six-membered benzene ring.",
    sc: { params: {}, challenge: { text: "Reach a structure with 6 ring atoms.", target: { key: "ringAtoms", value: 6, op: "gte" } } },
    q: ["How many structural isomers are possible for butane C₄H₁₀?", ["1", "2", "3", "4"], 1, "Straight-chain n-butane and branched 2-methylpropane (NCERT §4.2.2)."]
  }),

  CS("functional", "A functional group changes everything", "क्रियात्मक समूह सब बदल देता है", "4.2.3", {
    short: "Functional groups", c: "Replace one hydrogen of a hydrocarbon chain by a heteroatom (Cl, Br, O, N, S) or a group of atoms and you get a functional group: –Cl (haloalkane), –OH (alcohol), –CHO (aldehyde), >C=O (ketone), –COOH (carboxylic acid). It confers characteristic chemical properties regardless of the chain length.",
    ch: "हाइड्रोकार्बन शृंखला के एक H को विषम परमाणु (Cl, Br, O, N, S) या परमाणु-समूह से बदलने पर क्रियात्मक समूह मिलता है: –Cl (हैलोएल्केन), –OH (एल्कोहॉल), –CHO (एल्डिहाइड), >C=O (कीटोन), –COOH (कार्बोक्सिलिक अम्ल)। शृंखला की लंबाई चाहे जो हो, यही समूह रासायनिक गुण तय करता है।",
    f: ["TABLE 4.3", "–OH · –CHO · >C=O · –COOH", "Free valency attaches the group to the carbon chain."],
    v: [["Heteroatom", "Atom other than C or H replacing hydrogen."], ["Functional group", "Group deciding chemical behaviour."], ["Free valency", "The single line where the group attaches."]],
    vh: [["विषम परमाणु", "H को बदलने वाला C/H से भिन्न परमाणु।"], ["क्रियात्मक समूह", "रासायनिक व्यवहार तय करने वाला समूह।"], ["मुक्त संयोजकता", "जहाँ समूह शृंखला से जुड़ता है।"]],
    p: ["Which group makes a compound a carboxylic acid?", ["–OH", "–CHO", "–COOH"], 2],
    ph: ["कौन-सा समूह यौगिक को कार्बोक्सिलिक अम्ल बनाता है?", ["–OH", "–CHO", "–COOH"], 2],
    e: "–COOH contains both a carbonyl >C=O and a hydroxyl –OH on the same carbon. It is the group that gives ethanoic acid its acidic nature; –OH alone gives an alcohol, –CHO an aldehyde.",
    eh: "–COOH में एक ही कार्बन पर >C=O और –OH दोनों होते हैं। यही समूह एथेनोइक अम्ल को अम्लीय बनाता है; केवल –OH एल्कोहॉल और –CHO एल्डिहाइड देता है।",
    fig: "Table 4.3 — some functional groups in carbon compounds.", hint: "Attach each group in turn and read the class and name it produces.",
    sc: { params: {}, challenge: { text: "Attach the –COOH carboxylic acid group.", target: { key: "group", value: 4, op: "gte" } } },
    q: ["Butanone is a four-carbon compound with which functional group?", ["Carboxylic acid", "Aldehyde", "Ketone", "Alcohol"], 2, "The suffix -one denotes the ketone >C=O group (NCERT exercise Q2)."]
  }),

  CS("homologous", "The CH₂ ladder", "CH₂ की सीढ़ी", "4.2.4", {
    short: "Homologous series", c: "CH₃OH, C₂H₅OH, C₃H₇OH and C₄H₉OH form a homologous series: the same functional group on chains of different lengths. Successive members differ by –CH₂–, so molecular mass rises by 14 u (12 + 2). Melting point, boiling point and solubility change gradually, but chemical properties stay similar because the functional group controls them.",
    ch: "CH₃OH, C₂H₅OH, C₃H₇OH व C₄H₉OH एक समजात श्रेणी बनाते हैं: भिन्न लंबाई की शृंखलाओं पर एक ही क्रियात्मक समूह। क्रमागत सदस्य –CH₂– से भिन्न होते हैं, अतः अणुभार 14 u (12 + 2) बढ़ता है। गलनांक, क्वथनांक व विलेयता क्रमशः बदलते हैं, परंतु क्रियात्मक समूह के कारण रासायनिक गुण समान रहते हैं।",
    f: ["ACTIVITY 4.2", "Δ = –CH₂– = 14 u", "Alkanes CnH2n+2 · alkenes CnH2n · alcohols CnH2n+1OH."],
    v: [["Homologous series", "Same group, successive CH₂ difference."], ["Gradation", "Gradual change in physical properties."], ["14 u", "Mass added by one –CH₂– unit."]],
    vh: [["समजात श्रेणी", "समान समूह, क्रमागत CH₂ अंतर।"], ["क्रमिक परिवर्तन", "भौतिक गुणों में धीरा बदलाव।"], ["14 u", "एक –CH₂– से बढ़ने वाला भार।"]],
    p: ["Successive members of a homologous series differ by:", ["CH₃ (15 u)", "CH₂ (14 u)", "C₂H₄ (28 u)"], 1],
    ph: ["समजात श्रेणी के क्रमागत सदस्य किससे भिन्न होते हैं?", ["CH₃ (15 u)", "CH₂ (14 u)", "C₂H₄ (28 u)"], 1],
    e: "One carbon (12 u) plus two hydrogens (2 × 1 u) equals 14 u. Because the functional group is unchanged, all members react similarly; the growing chain only changes physical properties such as boiling point.",
    eh: "एक कार्बन (12 u) + दो हाइड्रोजन (2 × 1 u) = 14 u। क्रियात्मक समूह समान होने से सभी सदस्य समान अभिक्रिया करते हैं; बढ़ती शृंखला केवल क्वथनांक जैसे भौतिक गुण बदलती है।",
    fig: "Activity 4.2 — arrange the alcohols into a family.", hint: "Climb to the 4th member and compare formula, mass and boiling point.",
    sc: { params: {}, challenge: { text: "Reach the 4th member of the series.", target: { key: "n", value: 4, op: "gte" } } },
    q: ["What is a homologous series? Choose the correct statement.", ["Same formula, different group", "Same functional group, successive members differ by CH₂", "Different elements, same mass"], 1, "NCERT exercise Q6: same functional group, –CH₂– difference, gradation in physical properties."]
  }),

  CS("nomenclature", "Naming a carbon compound", "कार्बन यौगिक का नामकरण", "4.2.5", {
    short: "IUPAC nomenclature", c: "Four rules: (i) count carbons — meth-, eth-, prop-, but-; (ii) add the functional group's prefix/suffix from Table 4.4; (iii) if a suffix begins with a vowel (a, e, i, o, u), delete the final 'e' of the chain name; (iv) replace 'ane' with 'ene' or 'yne' for double/triple bonds. Propane − e + one = propanone, never 'propaneone'.",
    ch: "चार नियम: (i) कार्बन गिनें — meth-, eth-, prop-, but-; (ii) तालिका 4.4 से उपसर्ग/प्रत्यय जोड़ें; (iii) यदि प्रत्यय स्वर (a, e, i, o, u) से शुरू हो तो शृंखला के नाम का अंतिम 'e' हटाएँ; (iv) द्वि/त्रि-बंध के लिए 'ane' को 'ene' या 'yne' करें। propane − e + one = propanone, 'propaneone' नहीं।",
    f: ["TABLE 4.4", "propane − e + one = propanone", "Propene (C=C) · propyne (C≡C) · propanol (–OH)."],
    v: [["Prefix / suffix", "Marks the functional group in the name."], ["Vowel rule", "Drop final 'e' before -ol, -al, -one, -oic acid."], ["Stem", "meth / eth / prop / but = 1 / 2 / 3 / 4 C."]],
    vh: [["उपसर्ग / प्रत्यय", "नाम में क्रियात्मक समूह दर्शाता है।"], ["स्वर नियम", "-ol, -al, -one से पहले अंतिम 'e' हटाएँ।"], ["मूल शब्द", "meth/eth/prop/but = 1/2/3/4 कार्बन।"]],
    p: ["A three-carbon compound with a ketone group is named:", ["Propaneone", "Propanone", "Propanol"], 1],
    ph: ["तीन कार्बन वाले कीटोन का नाम है:", ["Propaneone", "Propanone", "Propanol"], 1],
    e: "The suffix 'one' starts with the vowel 'o', so the final 'e' of propane is dropped: propane − e = propan, then propan + one = propanone. Propanol ends in –OH (alcohol) and 'propaneone' breaks rule (iii).",
    eh: "प्रत्यय 'one' स्वर 'o' से शुरू होता है, अतः propane का अंतिम 'e' हटता है: propan + one = propanone। Propanol में –OH (एल्कोहॉल) है और 'propaneone' नियम (iii) तोड़ता है।",
    fig: "Table 4.4 — nomenclature of organic compounds.", hint: "Name propanone correctly by applying the drop-final-'e' rule.",
    sc: { params: {}, challenge: { text: "Name a 3-carbon ketone correctly (score 100).", target: { key: "correct", value: 100, op: "eq" } } },
    q: ["CH₃–CH₂–Br is named:", ["Bromoethane", "Ethyl bromide acid", "Ethanol"], 0, "Two carbons = ethane; bromo- is a prefix → bromoethane (NCERT in-text Q5)."]
  }),

  CS("combustion", "Clean blue flame or sooty yellow?", "नीली ज्वाला या कालिख वाली पीली?", "4.3.1", {
    short: "Combustion", c: "Carbon and its compounds burn in oxygen to give CO₂, H₂O, heat and light. Plenty of air gives a clean blue flame; limiting the air causes incomplete combustion, a yellow sooty flame and a black deposit on a metal plate (Activities 4.3/4.4). Saturated hydrocarbons generally burn clean, unsaturated ones burn sooty. Coal and petroleum are fossil fuels; their S and N give polluting oxides.",
    ch: "कार्बन व उसके यौगिक O₂ में जलकर CO₂, H₂O, ऊष्मा व प्रकाश देते हैं। पर्याप्त वायु से स्वच्छ नीली ज्वाला; वायु कम होने पर अपूर्ण दहन, पीली कालिख वाली ज्वाला और धातु की प्लेट पर काला जमाव (गतिविधि 4.3/4.4)। संतृप्त हाइड्रोकार्बन सामान्यतः स्वच्छ, असंतृप्त धुँआदार जलते हैं। कोयला व पेट्रोलियम जीवाश्म ईंधन हैं; इनके S व N प्रदूषक ऑक्साइड देते हैं।",
    f: ["EQUATION", "CH₄ + 2O₂ → CO₂ + 2H₂O + heat", "C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O."],
    v: [["Complete combustion", "Enough O₂ → CO₂ + H₂O, blue flame."], ["Incomplete combustion", "Limited O₂ → soot / CO, yellow flame."], ["Fossil fuel", "Coal and petroleum from ancient biomass."]],
    vh: [["पूर्ण दहन", "पर्याप्त O₂ → CO₂ + H₂O, नीली ज्वाला।"], ["अपूर्ण दहन", "सीमित O₂ → कालिख / CO, पीली ज्वाला।"], ["जीवाश्म ईंधन", "प्राचीन जैव-पदार्थ से कोयला व पेट्रोलियम।"]],
    p: ["While cooking, the bottom of a vessel blackens. This means:", ["Food is not cooked", "Fuel is not burning completely", "Fuel is wet"], 1],
    ph: ["खाना बनाते समय बर्तन का पेंदा काला हो जाए तो इसका अर्थ है:", ["भोजन अधपका है", "ईंधन का अपूर्ण दहन हो रहा है", "ईंधन गीला है"], 1],
    e: "Blocked air holes starve the flame of oxygen, so carbon particles do not burn fully and deposit as soot. It is wasted fuel, not wet fuel or undercooked food (NCERT exercise Q3).",
    eh: "वायु-छिद्र बंद होने से ज्वाला को पर्याप्त O₂ नहीं मिलता; कार्बन के कण पूरे नहीं जलते और कालिख जम जाती है। यह ईंधन की बर्बादी है, गीला ईंधन या अधपका भोजन नहीं (NCERT प्रश्न 3)।",
    fig: "Activity 4.3/4.4 — burner, air hole and soot on a metal plate.", hint: "Open the air supply until the flame turns clean blue (cleanliness ≥ 90).",
    sc: { params: {}, challenge: { text: "Get a clean blue flame: cleanliness ≥ 90.", target: { key: "cleanliness", value: 90, op: "gte" } } },
    q: ["Why are carbon and its compounds used as fuels?", ["They burn releasing a large amount of heat and light", "They are ionic and conduct electricity", "They do not need oxygen"], 0, "NCERT exercise Q9: combustion gives CO₂, H₂O and a large amount of heat/light with a clean flame."]
  }),

  CS("oxidation", "Ethanol becomes ethanoic acid", "एथेनॉल से एथेनोइक अम्ल", "4.3.2", {
    short: "Oxidation", c: "Warm about 3 mL of ethanol in a water bath and add 5% alkaline KMnO₄ drop by drop (Activity 4.5). The purple colour disappears while ethanol remains, because permanganate is consumed oxidising ethanol to ethanoic acid. Once all ethanol is converted, extra KMnO₄ keeps its purple colour. Alkaline KMnO₄ and acidified K₂Cr₂O₇ are oxidising agents.",
    ch: "लगभग 3 mL एथेनॉल को जल-स्नान में गरम करें और 5% क्षारीय KMnO₄ बूंद-बूंद कर मिलाएँ (गतिविधि 4.5)। जब तक एथेनॉल शेष है बैंगनी रंग गायब हो जाता है, क्योंकि परमैंगनेट एथेनॉल को एथेनोइक अम्ल में ऑक्सीकृत करते हुए खर्च हो जाता है। सारा एथेनॉल बदल जाने पर अतिरिक्त KMnO₄ का बैंगनी रंग बना रहता है। क्षारीय KMnO₄ व अम्लीय K₂Cr₂O₇ ऑक्सीकारक हैं।",
    f: ["OXIDATION", "CH₃CH₂OH + 2[O] → CH₃COOH + H₂O", "Gain of oxygen / loss of hydrogen = oxidation."],
    v: [["Oxidising agent", "Adds oxygen or removes hydrogen."], ["Alkaline KMnO₄", "Purple oxidant used in Activity 4.5."], ["Carboxylic acid", "Product of oxidising a primary alcohol."]],
    vh: [["ऑक्सीकारक", "ऑक्सीजन जोड़ता या हाइड्रोजन हटाता है।"], ["क्षारीय KMnO₄", "गतिविधि 4.5 का बैंगनी ऑक्सीकारक।"], ["कार्बोक्सिलिक अम्ल", "प्राथमिक एल्कोहॉल के ऑक्सीकरण का उत्पाद।"]],
    p: ["Why is ethanol → ethanoic acid an oxidation reaction?", ["Oxygen is added / hydrogen removed", "Hydrogen is added", "It is only a combustion"], 0],
    ph: ["एथेनॉल → एथेनोइक अम्ल ऑक्सीकरण क्यों है?", ["ऑक्सीजन जुड़ती / हाइड्रोजन हटती है", "हाइड्रोजन जुड़ती है", "यह केवल दहन है"], 0],
    e: "CH₃CH₂OH gains one oxygen and loses two hydrogens to become CH₃COOH. By the school definition — addition of oxygen or removal of hydrogen — this is oxidation, and the oxidising agent supplies the oxygen.",
    eh: "CH₃CH₂OH एक ऑक्सीजन ग्रहण करता और दो हाइड्रोजन खोकर CH₃COOH बनता है। विद्यालयी परिभाषा — ऑक्सीजन का जुड़ना या हाइड्रोजन का हटना — के अनुसार यह ऑक्सीकरण है; ऑक्सीकारक ऑक्सीजन देता है।",
    fig: "Activity 4.5 — dropper, warm ethanol, fading purple colour.", hint: "Add KMnO₄ drops and heat until 90% of ethanol becomes ethanoic acid.",
    sc: { params: {}, challenge: { text: "Convert ≥ 90% of ethanol into ethanoic acid.", target: { key: "acid", value: 90, op: "gte" } } },
    q: ["What are oxidising agents?", ["Substances that add oxygen or remove hydrogen", "Substances that add hydrogen", "Substances that only absorb heat"], 0, "NCERT in-text Q2: alkaline KMnO₄ / acidified K₂Cr₂O₇ oxidise alcohols to acids."]
  }),

  CS("hydrogenation", "Addition across the double bond", "द्वि-बंध पर योग अभिक्रिया", "4.3.3", {
    short: "Addition / hydrogenation", c: "Unsaturated hydrocarbons add hydrogen in the presence of nickel or palladium catalysts to become saturated: CH₂=CH₂ + H₂ → CH₃–CH₃. This is hydrogenation, used industrially to convert liquid vegetable oils (long unsaturated chains) into solid vanaspati ghee. A catalyst changes the rate of a reaction without itself being changed.",
    ch: "असंतृप्त हाइड्रोकार्बन निकेल या पैलेडियम उत्प्रेरक की उपस्थिति में H₂ जोड़कर संतृप्त हो जाते हैं: CH₂=CH₂ + H₂ → CH₃–CH₃। इसे हाइड्रोजनीकरण कहते हैं; उद्योग में तरल वनस्पति तेल (लंबी असंतृप्त शृंखलाएँ) को ठोस वनस्पति घी में बदलने के लिए प्रयोग होता है। उत्प्रेरक अभिक्रिया की गति बदलता है, स्वयं नहीं बदलता।",
    f: ["HYDROGENATION", "C₂H₄ + H₂ —Ni→ C₂H₆", "Vegetable oil + H₂ → vanaspati ghee (Ni, heat)."],
    v: [["Addition reaction", "Atoms add across a C=C or C≡C bond."], ["Catalyst", "Changes rate, remains unchanged."], ["Hydrogenation", "Industrial hardening of vegetable oils."]],
    vh: [["योग अभिक्रिया", "C=C/C≡C पर परमाणु जुड़ना।"], ["उत्प्रेरक", "गति बदलता है, स्वयं अपरिवर्तित।"], ["हाइड्रोजनीकरण", "वनस्पति तेल का ठोस घी में बदलना।"]],
    p: ["Hydrogenation of vegetable oil needs:", ["Sunlight", "Ni or Pd catalyst", "Alkaline KMnO₄"], 1],
    ph: ["वनस्पति तेल के हाइड्रोजनीकरण के लिए चाहिए:", ["सूर्य का प्रकाश", "Ni या Pd उत्प्रेरक", "क्षारीय KMnO₄"], 1],
    e: "Nickel (or palladium) adsorbs H₂ and lets the two hydrogen atoms add across the double bond, converting C=C into C–C. Without the catalyst the reaction is far too slow at ordinary temperature.",
    eh: "निकेल (या पैलेडियम) H₂ को सोखता है और दो H परमाणुओं को द्वि-बंध पर जोड़ने देता है, जिससे C=C → C–C हो जाता है। उत्प्रेरक के बिना सामान्य ताप पर अभिक्रिया बहुत धीमी होती है।",
    fig: "NCERT §4.3.3 — R–C=C–R becoming R–C–C–R on a Ni surface.", hint: "Switch on the Ni catalyst and supply H₂ until saturation reaches 90%.",
    sc: { params: {}, challenge: { text: "Saturate the oil: reach 90% hydrogenation.", target: { key: "saturation", value: 90, op: "gte" } } },
    q: ["What is hydrogenation and its industrial application?", ["Adding H₂ to unsaturated oils with Ni to make vanaspati ghee", "Adding O₂ to alcohols", "Replacing H by Cl in sunlight"], 0, "NCERT exercise Q12: unsaturated fatty acids are hardened using a nickel catalyst."]
  }),

  CS("substitution", "Chlorine replaces hydrogen", "क्लोरीन हाइड्रोजन को हटाता है", "4.3.4", {
    short: "Substitution reaction", c: "Saturated hydrocarbons are fairly unreactive and inert to most reagents, yet in sunlight chlorine reacts very fast, replacing hydrogen atoms one by one: CH₄ + Cl₂ → CH₃Cl + HCl. This is a substitution reaction — one atom or group takes the place of another. Higher alkanes give a mixture of products (CH₂Cl₂, CHCl₃, CCl₄).",
    ch: "संतृप्त हाइड्रोकार्बन काफ़ी अक्रियाशील हैं और अधिकांश अभिकर्मकों से नहीं बदलते, परंतु सूर्य के प्रकाश में क्लोरीन बहुत तेज़ी से H को एक-एक कर प्रतिस्थापित करता है: CH₄ + Cl₂ → CH₃Cl + HCl। यह प्रतिस्थापन अभिक्रिया है — एक परमाणु/समूह दूसरे का स्थान लेता है। उच्च एल्केन मिश्रित उत्पाद देते हैं (CH₂Cl₂, CHCl₃, CCl₄)।",
    f: ["SUBSTITUTION", "CH₄ + Cl₂ —sunlight→ CH₃Cl + HCl", "Further steps: CH₂Cl₂, CHCl₃, CCl₄."],
    v: [["Substitution", "One atom replaces another."], ["Photochemical", "Reaction driven by sunlight."], ["Chloromethane", "CH₃Cl, the first product."]],
    vh: [["प्रतिस्थापन", "एक परमाणु दूसरे का स्थान लेता है।"], ["प्रकाश-रासायनिक", "सूर्य के प्रकाश से चलने वाली अभिक्रिया।"], ["क्लोरोमेथेन", "CH₃Cl, प्रथम उत्पाद।"]],
    p: ["Which reaction needs sunlight?", ["Addition (hydrogenation)", "Substitution of methane by chlorine", "Esterification"], 1],
    ph: ["किस अभिक्रिया के लिए सूर्य का प्रकाश आवश्यक है?", ["योग (हाइड्रोजनीकरण)", "मेथेन का क्लोरीन द्वारा प्रतिस्थापन", "एस्टरीकरण"], 1],
    e: "Sunlight supplies the energy to split Cl₂ into reactive chlorine atoms, which then displace H from methane one at a time, forming HCl each time. Addition needs a catalyst instead; esterification needs an acid catalyst and warmth.",
    eh: "सूर्य का प्रकाश Cl₂ को क्रियाशील Cl परमाणुओं में तोड़ने की ऊर्जा देता है, जो मेथेन के H को एक-एक कर हटाते हैं और हर बार HCl बनता है। योग के लिए उत्प्रेरक, एस्टरीकरण के लिए अम्ल उत्प्रेरक व गरमाहट चाहिए।",
    fig: "NCERT §4.3.4 — methane + chlorine in sunlight.", hint: "Raise sunlight above 50% and add chlorine to replace a hydrogen.",
    sc: { params: {}, challenge: { text: "Substitute at least one H by Cl in sunlight.", target: { key: "substitutions", value: 1, op: "gte" } } },
    q: ["CH₄ + Cl₂ in sunlight gives:", ["C₂H₆", "CH₃Cl + HCl", "CH₃COOH"], 1, "It is a substitution reaction; chlorine replaces one hydrogen at a time."]
  }),

  CS("ethanol", "Ethanol: two reactions to know", "एथेनॉल: दो मुख्य अभिक्रियाएँ", "4.4.1", {
    short: "Properties of ethanol", c: "Ethanol is a liquid at room temperature, a good solvent used in tincture iodine and cough syrups, and miscible with water in all proportions. With sodium it liberates hydrogen: 2Na + 2C₂H₅OH → 2C₂H₅ONa + H₂ (Activity 4.6). Heated at 443 K with excess conc. H₂SO₄ it dehydrates to ethene. Denatured alcohol contains poisonous methanol and a blue dye.",
    ch: "एथेनॉल कमरे के ताप पर द्रव है, टिंक्चर आयोडीन व कफ सिरप में अच्छा विलायक है और जल में सभी अनुपातों में घुलता है। सोडियम से H₂ देता है: 2Na + 2C₂H₅OH → 2C₂H₅ONa + H₂ (गतिविधि 4.6)। 443 K पर अधिक सांद्र H₂SO₄ के साथ गरम करने पर निर्जलीकरण होकर एथीन बनता है। विकृत मद्य में विषैला मेथनॉल व नीला रंग होता है।",
    f: ["DEHYDRATION", "C₂H₅OH —443 K / H₂SO₄→ C₂H₄ + H₂O", "Conc. H₂SO₄ is the dehydrating agent."],
    v: [["Sodium ethoxide", "C₂H₅ONa, formed with sodium."], ["Dehydration", "Removal of water at 443 K."], ["Denatured alcohol", "Ethanol + methanol + blue dye, unfit to drink."]],
    vh: [["सोडियम एथॉक्साइड", "सोडियम से बनने वाला C₂H₅ONa।"], ["निर्जलीकरण", "443 K पर जल का निकलना।"], ["विकृत मद्य", "एथेनॉल + मेथनॉल + नीला रंग, पीने योग्य नहीं।"]],
    p: ["Heating ethanol at 443 K with excess conc. H₂SO₄ gives:", ["Ethane", "Ethene", "Ethanoic acid"], 1],
    ph: ["एथेनॉल को 443 K पर अधिक सांद्र H₂SO₄ के साथ गरम करने पर मिलता है:", ["एथेन", "एथीन", "एथेनोइक अम्ल"], 1],
    e: "Concentrated sulphuric acid removes the elements of water from ethanol (dehydrating agent), leaving a C=C double bond: ethene. Sodium instead attacks the –OH hydrogen and releases H₂ gas, which burns with a pop.",
    eh: "सांद्र सल्फ्यूरिक अम्ल एथेनॉल से जल के तत्व हटाता है (निर्जलीकारक), जिससे C=C द्वि-बंध वाला एथीन बचता है। सोडियम –OH के H से क्रिया कर H₂ गैस देता है जो 'पॉप' से जलती है।",
    fig: "Activity 4.6 + NCERT §4.4.1 — sodium in absolute alcohol, 443 K dehydration.", hint: "Choose the dehydration path and raise the temperature to 443 K.",
    sc: { params: {}, challenge: { text: "Reach 443 K to dehydrate ethanol to ethene.", target: { key: "temp", value: 443, op: "gte" } } },
    q: ["What is the role of conc. H₂SO₄ in making ethene from ethanol at 443 K?", ["Oxidising agent", "Dehydrating agent / catalyst", "Reducing agent"], 1, "It removes water from ethanol; NCERT §4.4.1 / Exemplar Q39."]
  }),

  CS("ethanoic", "Weak acid, four tests", "दुर्बल अम्ल, चार परीक्षण", "4.4.2", {
    short: "Ethanoic acid", c: "Ethanoic acid (acetic acid) is 5–8% in vinegar, used as a preservative. Pure acid melts at 290 K and freezes in winter — glacial acetic acid. It is a weak acid: blue litmus turns red, but universal indicator shows it is weaker than HCl (Activity 4.7). With Na₂CO₃/NaHCO₃ it gives brisk CO₂ that turns lime water milky (Activity 4.9); with NaOH it gives sodium ethanoate.",
    ch: "एथेनोइक अम्ल (एसिटिक अम्ल) सिरके में 5–8% होता है और परिरक्षक है। शुद्ध अम्ल 290 K पर पिघलता है व सर्दी में जम जाता है — ग्लेशियल एसिटिक अम्ल। यह दुर्बल अम्ल है: नीला लिटमस लाल, परंतु सार्वत्रिक सूचक HCl से कमज़ोर दिखाता है (गतिविधि 4.7)। Na₂CO₃/NaHCO₃ से तेज़ CO₂ देता है जो चूने के पानी को दूधिया करता है (4.9); NaOH से सोडियम एथेनोएट बनता है।",
    f: ["WITH CARBONATE", "2CH₃COOH + Na₂CO₃ → 2CH₃COONa + H₂O + CO₂", "CO₂ + lime water → milky CaCO₃."],
    v: [["Glacial acetic acid", "Pure acid freezing near 290 K."], ["Weak acid", "Only partly ionised in water."], ["Ester", "Sweet-smelling product with an alcohol."]],
    vh: [["ग्लेशियल एसिटिक अम्ल", "290 K के near जमने वाला शुद्ध अम्ल।"], ["दुर्बल अम्ल", "जल में आंशिक आयनित।"], ["एस्टर", "एल्कोहॉल से बनने वाला मीठा गंध वाला उत्पाद।"]],
    p: ["A gas that turns lime water milky comes from ethanoic acid + ?", ["NaOH", "NaHCO₃", "NaCl"], 1],
    ph: ["चूने के पानी को दूधिया करने वाली गैस एथेनोइक अम्ल + किससे मिलती है?", ["NaOH", "NaHCO₃", "NaCl"], 1],
    e: "Carbonates and hydrogencarbonates react with the acid to release CO₂; passing it through freshly prepared lime water gives a milky precipitate of calcium carbonate. NaOH only neutralises the acid to sodium ethanoate and water, with no gas.",
    eh: "कार्बोनेट/हाइड्रोजनकार्बोनेट अम्ल से क्रिया कर CO₂ देते हैं; ताज़ा चूने के पानी में डालने पर CaCO₃ का दूधिया अवक्षेप बनता है। NaOH केवल उदासीन कर सोडियम एथेनोएट व जल देता है, गैस नहीं।",
    fig: "Activity 4.7 + 4.9 — litmus, universal indicator, lime water.", hint: "Select the NaHCO₃ test to evolve CO₂ and turn lime water milky.",
    sc: { params: {}, challenge: { text: "Evolve CO₂ in the carbonate test.", target: { key: "co2", value: 100, op: "gte" } } },
    q: ["How can ethanol and ethanoic acid be distinguished experimentally?", ["Both turn blue litmus red", "Only the acid turns blue litmus red and gives CO₂ with NaHCO₃", "Both give H₂ with sodium"], 1, "NCERT exercise Q7: acid → litmus red + brisk effervescence with NaHCO₃; ethanol does neither."]
  }),

  CS("ester", "Sweet-smelling esters and soap", "मीठी गंध वाले एस्टर और साबुन", "4.4.2b", {
    short: "Esterification", c: "Take 1 mL ethanol + 1 mL glacial acetic acid + a few drops of conc. H₂SO₄, warm in a water bath for five minutes, then pour into water (Activity 4.8): a sweet fruity smell confirms the ester. CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O. With NaOH the ester reverts to ethanol + sodium ethanoate — saponification, the soap-making reaction.",
    ch: "1 mL एथेनॉल + 1 mL ग्लेशियल एसिटिक अम्ल + सांद्र H₂SO₄ की कुछ बूँदें लेकर जल-स्नान में पाँच मिनट गरम करें, फिर जल में डालें (गतिविधि 4.8): मीठी फल-सी गंध एस्टर की पुष्टि करती है। CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O। NaOH से एस्टर पुनः एथेनॉल + सोडियम एथेनोएट देता है — साबुनीकरण, साबुन बनाने की अभिक्रिया।",
    f: ["ESTERIFICATION", "CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O", "Saponification: ester + NaOH → C₂H₅OH + CH₃COONa."],
    v: [["Ester", "Sweet-smelling compound from acid + alcohol."], ["Acid catalyst", "Conc. H₂SO₄, also a dehydrating agent."], ["Saponification", "Alkaline hydrolysis of an ester → soap."]],
    vh: [["एस्टर", "अम्ल + एल्कोहॉल से बना मीठा गंध वाला यौगिक।"], ["अम्ल उत्प्रेरक", "सांद्र H₂SO₄, निर्जलीकारक भी।"], ["साबुनीकरण", "एस्टर का क्षारीय जल-अपघटन → साबुन।"]],
    p: ["The sweet smell in Activity 4.8 is due to:", ["Ethanol", "An ester", "Acetic acid"], 1],
    ph: ["गतिविधि 4.8 में मीठी गंध किसके कारण है?", ["एथेनॉल", "एक एस्टर", "एसिटिक अम्ल"], 1],
    e: "The acid catalyst and warmth drive the reversible esterification forward; ethyl ethanoate has a characteristic fruity odour used in perfumes and flavourings. Adding NaOH hydrolyses the ester back, giving the sodium salt of the acid — a soap molecule when the chain is long.",
    eh: "अम्ल उत्प्रेरक व गरमाहट उत्क्रमणीय एस्टरीकरण को आगे बढ़ाते हैं; एथिल एथनोएट की फल-सी गंध इत्र व स्वाद में काम आती है। NaOH डालने पर एस्टर टूटकर अम्ल का सोडियम लवण देता है — लंबी शृंखला हो तो साबुन अणु।",
    fig: "Fig 4.11 — test tube in a water bath on a tripod, poured into a beaker.", hint: "Heat the bath and add catalyst until the ester yield passes 80%.",
    sc: { params: {}, challenge: { text: "Produce the sweet ester: yield ≥ 80%.", target: { key: "ester", value: 80, op: "gte" } } },
    q: ["Soaps are:", ["Sodium/potassium salts of long-chain carboxylic acids", "Esters of short-chain alcohols", "Calcium salts of sulphonic acids"], 0, "NCERT §4.4.2: saponification of an ester with NaOH gives the salt used as soap."]
  }),

  CS("micelle", "How soap lifts oily dirt", "साबुन चिकना मैल कैसे उठाता है", "4.5", {
    short: "Soaps & detergents", c: "A soap molecule is the sodium or potassium salt of a long-chain carboxylic acid: an ionic hydrophilic head and a hydrophobic hydrocarbon tail. In water the tails point into the oil droplet and the heads face outward, forming a micelle that emulsifies dirt (Fig 4.12). Hard water Ca²⁺/Mg²⁺ ions form insoluble scum with soap (Activity 4.11); detergents do not precipitate and keep lathering (4.12).",
    ch: "साबुन अणु लंबी शृंखला वाले कार्बोक्सिलिक अम्ल का सोडियम/पोटैशियम लवण है: एक आयनिक जल-स्नेही सिर और जल-विरोधी हाइड्रोकार्बन पूँछ। जल में पूँछें तेल की बूँद के भीतर और सिर बाहर की ओर होते हैं — मिसेल बनता है जो मैल का पायस बनाता है (चित्र 4.12)। कठोर जल के Ca²⁺/Mg²⁺ साबुन से अघुलनशील झाग-गाद (scum) बनाते हैं (4.11); अपमार्जक अवक्षेप नहीं बनाते और झाग देते रहते हैं (4.12)।",
    f: ["MICELLE", "tail → oil · ionic head → water", "Scum = insoluble Ca/Mg salt; detergents stay effective."],
    v: [["Hydrophilic head", "Ionic end that interacts with water."], ["Hydrophobic tail", "Hydrocarbon chain that interacts with oil."], ["Scum", "Curdy precipitate in hard water."]],
    vh: [["जल-स्नेही सिर", "जल से जुड़ने वाला आयनिक सिरा।"], ["जल-विरोधी पूँछ", "तेल से जुड़ने वाली हाइड्रोकार्बन शृंखला।"], ["गाद (scum)", "कठोर जल में दही-सा अवक्षेप।"]],
    p: ["In hard water, soap forms:", ["More foam", "An insoluble curdy precipitate (scum)", "No micelle at all"], 1],
    ph: ["कठोर जल में साबुन बनाता है:", ["अधिक झाग", "अघुलनशील दही-सा अवक्षेप (गाद)", "कोई मिसेल ही नहीं"], 1],
    e: "Calcium and magnesium ions replace sodium in the soap molecule, giving an insoluble calcium/magnesium carboxylate — the white curdy scum. Detergents are sodium salts of sulphonic acids whose charged end does not form insoluble salts with Ca²⁺/Mg²⁺, so foam persists.",
    eh: "कैल्शियम व मैग्नीशियम आयन साबुन के सोडियम को हटाकर अघुलनशील कैल्शियम/मैग्नीशियम कार्बोक्सिलेट बनाते हैं — सफ़ेद दही-सी गाद। अपमार्जक सल्फ़ोनिक अम्ल के सोडियम लवण हैं जिनका आवेशित सिरा Ca²⁺/Mg²⁺ से अघुलनशील लवण नहीं बनाता, इसलिए झाग बना रहता है।",
    fig: "Activity 4.10–4.12 / Fig 4.12–4.13 — micelle, oil droplet, scum.", hint: "Make hard water, then switch to detergent to restore cleaning above 85%.",
    sc: { params: {}, challenge: { text: "Clean in hard water: reach 85% cleaning.", target: { key: "cleaning", value: 85, op: "gte" } } },
    q: ["Why are detergents better than soaps in hard water?", ["They are cheaper", "Their charged ends do not form insoluble precipitates with Ca²⁺/Mg²⁺", "They contain no hydrocarbon chain"], 1, "NCERT §4.5 / exercise Q10: no scum, so lather and cleaning continue."]
  })
];

/* ---------------------------------------------------------------- quiz ---- */
/* 15 NCERT end exercises + 5 in-text / Exemplar questions. Same answers used
   by the teacher CSV / progress layer; whys are shown after submission. */
const CARBON_QUIZ = [
  { q: "1. Ethane, C₂H₆, has how many covalent bonds?", options: ["6", "7", "8", "9"], a: 1, why: "Six C–H bonds + one C–C bond = 7. The C–C bond is the one usually forgotten." },
  { q: "2. Butanone is a four-carbon compound with which functional group?", options: ["Carboxylic acid", "Aldehyde", "Ketone", "Alcohol"], a: 2, why: "The suffix -one denotes >C=O, a ketone." },
  { q: "3. While cooking, if the bottom of the vessel blackens, it means:", options: ["Food is not cooked", "Fuel is not burning completely", "Fuel is wet", "Fuel is burning completely"], a: 1, why: "Blocked air holes cause incomplete combustion and a soot deposit." },
  { q: "4. Explain the covalent bond in CH₃Cl: carbon shares", options: ["one electron pair with each of 4 atoms", "all four electrons with chlorine", "no electrons, it is ionic", "two pairs with each hydrogen"], a: 0, why: "Carbon shares one pair each with 3 H and 1 Cl → four single covalent bonds." },
  { q: "5. Which molecule has a triple bond?", options: ["F₂", "H₂S", "Ethanoic acid", "N₂ / ethyne C₂H₂"], a: 3, why: "N₂ and ethyne share three electron pairs; F₂, H₂S and ethanoic acid have single bonds (plus C=O in the acid)." },
  { q: "6. What is a homologous series?", options: ["Same formula, different group", "Same functional group, successive members differ by –CH₂– (14 u)", "Compounds of different elements", "Only ring compounds"], a: 1, why: "Same functional group, 14 u mass difference, gradation in physical properties." },
  { q: "7. Which test distinguishes ethanol from ethanoic acid?", options: ["Both turn blue litmus red", "Only ethanoic acid turns blue litmus red and gives CO₂ with NaHCO₃", "Both give H₂ with sodium", "Neither dissolves in water"], a: 1, why: "Ethanoic acid is acidic and effervesces with NaHCO₃; ethanol does neither." },
  { q: "8. Why does micelle formation take place when soap is added to water?", options: ["Soap dissolves completely", "Hydrophobic tails hide inside the cluster, ionic heads face water", "Water repels the ionic heads", "Soap reacts with water to form acid"], a: 1, why: "The two-ended molecule orients around oily dirt; the colloid stays suspended." },
  { q: "9. Why are carbon compounds used as fuels?", options: ["They burn with a clean flame releasing much heat and light", "They are ionic conductors", "They need no oxygen", "They have very high melting points"], a: 0, why: "Combustion gives CO₂ + H₂O + a large amount of heat and light." },
  { q: "10. Explain the formation of scum in hard water.", options: ["Soap dissolves fully", "Ca²⁺/Mg²⁺ form insoluble salts with soap", "Detergent precipitates", "Water evaporates"], a: 1, why: "Insoluble calcium/magnesium carboxylates = the curdy white scum." },
  { q: "11. What happens when soap is tested with litmus?", options: ["Blue → red (acidic)", "No change (neutral salt)", "Red → blue (alkaline)", "It bleaches the paper"], a: 2, why: "Soap is a salt of a strong base and a weak acid, so its solution is alkaline." },
  { q: "12. What is hydrogenation and its industrial use?", options: ["Adding O₂ to alcohol", "Adding H₂ to unsaturated oils with Ni to make vanaspati ghee", "Replacing H by Cl", "Converting acid to ester"], a: 1, why: "Ni/Pd catalyses H₂ addition across C=C, hardening vegetable oil." },
  { q: "13. Which hydrocarbons undergo addition reactions?", options: ["C₂H₆, C₃H₈, CH₄", "C₃H₆ and C₂H₂", "Only CH₄", "All of them"], a: 1, why: "Only unsaturated C₃H₆ (alkene) and C₂H₂ (alkyne) have multiple bonds to add across." },
  { q: "14. A test to differentiate saturated from unsaturated hydrocarbons:", options: ["Litmus paper", "Bromine water / alkaline KMnO₄ colour change", "Flame with no air", "Sodium metal"], a: 1, why: "Unsaturated compounds decolourise bromine water; saturated ones do not." },
  { q: "15. Explain the cleaning action of soaps.", options: ["Soap dissolves dirt chemically", "Micelles emulsify oily dirt and ion repulsion keeps them suspended for rinsing", "Soap evaporates the oil", "Soap makes water acidic"], a: 1, why: "Hydrophobic tails trap oil; hydrophilic heads keep micelles in water as a colloid." },
  { q: "In-text: Why is ethanol → ethanoic acid an oxidation reaction?", options: ["Oxygen is added / hydrogen removed", "Hydrogen is added", "It is a substitution", "It is neutralisation"], a: 0, why: "Gain of O or loss of H is oxidation; oxidising agents supply the oxygen." },
  { q: "In-text: Name the two properties of carbon giving millions of compounds.", options: ["Catenation and tetravalency", "Allotropy and isomerism", "Ionisation and conductivity", "High density and hardness"], a: 0, why: "NCERT §4.2 — carbon bonds to itself strongly and forms four bonds." },
  { q: "In-text: Would you check hard water using a detergent?", options: ["Yes, it forms scum", "No — detergents lather in both hard and soft water", "Yes, it turns blue", "Only with litmus"], a: 1, why: "Detergents do not precipitate with Ca²⁺/Mg²⁺, so no difference appears." },
  { q: "In-text: Why is agitation needed when washing clothes?", options: ["To heat the water", "To help micelles lift and suspend oily dirt from the fabric", "To make soap acidic", "To evaporate the oil"], a: 1, why: "Beating/scrubbing speeds emulsification and removal of the dirt-laden micelles." },
  { q: "Exemplar: The first member of the alkyne homologous series is:", options: ["Methane", "Ethene", "Ethyne", "Propyne"], a: 2, why: "A triple bond needs at least two carbons, so ethyne C₂H₂ is the first alkyne." }
];

const CARBON_QUIZ_HI = [
  { q: "1. एथेन C₂H₆ में कितने सहसंयोजी बंध हैं?", options: ["6", "7", "8", "9"], a: 1, why: "छह C–H + एक C–C = 7; C–C बंध अक्सर भूल जाते हैं।" },
  { q: "2. ब्यूटेनोन में कौन-सा क्रियात्मक समूह है?", options: ["कार्बोक्सिलिक अम्ल", "एल्डिहाइड", "कीटोन", "एल्कोहॉल"], a: 2, why: "प्रत्यय -one कीटोन >C=O दर्शाता है।" },
  { q: "3. बर्तन का पेंदा काला होना दर्शाता है:", options: ["भोजन अधपका है", "ईंधन का अपूर्ण दहन", "ईंधन गीला है", "पूर्ण दहन"], a: 1, why: "वायु-छिद्र बंद होने से अपूर्ण दहन और कालिख जमती है।" },
  { q: "4. CH₃Cl में कार्बन सहसंयोजी बंध कैसे बनाता है?", options: ["चारों परमाणुओं से एक-एक युग्म साझा", "सभी इलेक्ट्रॉन क्लोरीन को देता है", "आयनिक बंध", "प्रत्येक H से दो युग्म"], a: 0, why: "3 H और 1 Cl से एक-एक युग्म → चार एकल सहसंयोजी बंध।" },
  { q: "5. किस अणु में त्रि-बंध है?", options: ["F₂", "H₂S", "एथेनोइक अम्ल", "N₂ / एथाइन C₂H₂"], a: 3, why: "N₂ व एथाइन तीन युग्म साझा करते हैं।" },
  { q: "6. समजात श्रेणी क्या है?", options: ["समान सूत्र, भिन्न समूह", "समान क्रियात्मक समूह, क्रमागत –CH₂– (14 u) अंतर", "भिन्न तत्वों के यौगिक", "केवल वलय यौगिक"], a: 1, why: "समान समूह, 14 u भार अंतर, भौतिक गुणों में क्रमिक परिवर्तन।" },
  { q: "7. एथेनॉल व एथेनोइक अम्ल में अंतर कैसे पहचानें?", options: ["दोनों नीला लिटमस लाल करते हैं", "केवल अम्ल नीला लिटमस लाल करता है और NaHCO₃ से CO₂ देता है", "दोनों सोडियम से H₂ देते हैं", "दोनों जल में अघुलनशील"], a: 1, why: "अम्ल अम्लीय है व NaHCO₃ से तेज़ CO₂ देता है; एथेनॉल नहीं।" },
  { q: "8. साबुन डालने पर मिसेल क्यों बनता है?", options: ["साबुन पूरी तरह घुल जाता है", "जल-विरोधी पूँछें भीतर, आयनिक सिर बाहर जल की ओर", "जल आयनिक सिर को दूर भगाता है", "साबुन जल से अम्ल बनाता है"], a: 1, why: "दो-सिरा अणु तेल के चारों ओर व्यवस्थित होता है; कोलॉइड बना रहता है।" },
  { q: "9. कार्बन यौगिक ईंधन क्यों हैं?", options: ["स्वच्छ ज्वाला से जलकर बहुत ऊष्मा व प्रकाश देते हैं", "आयनिक चालक हैं", "ऑक्सीजन की आवश्यकता नहीं", "बहुत उच्च गलनांक"], a: 0, why: "दहन से CO₂ + H₂O + अधिक ऊष्मा व प्रकाश मिलता है।" },
  { q: "10. कठोर जल में गाद (scum) कैसे बनती है?", options: ["साबुन पूर्ण घुल जाता है", "Ca²⁺/Mg²⁺ साबुन से अघुलनशील लवण बनाते हैं", "अपमार्जक अवक्षेपित होता है", "जल वाष्पित हो जाता है"], a: 1, why: "अघुलनशील कैल्शियम/मैग्नीशियम कार्बोक्सिलेट = सफ़ेद गाद।" },
  { q: "11. साबुन को लिटमस से जाँचें तो?", options: ["नीला → लाल (अम्लीय)", "कोई परिवर्तन नहीं", "लाल → नीला (क्षारीय)", "कागज़ विरंजित"], a: 2, why: "साबुन प्रबल क्षार व दुर्बल अम्ल का लवण है, अतः क्षारीय।" },
  { q: "12. हाइड्रोजनीकरण व उसका औद्योगिक उपयोग?", options: ["एल्कोहॉल में O₂ जोड़ना", "Ni पर असंतृप्त तेल में H₂ जोड़कर वनस्पति घी", "H को Cl से बदलना", "अम्ल से एस्टर"], a: 1, why: "Ni/Pd, C=C पर H₂ योग कर वनस्पति तेल को ठोस करता है।" },
  { q: "13. कौन-से हाइड्रोकार्बन योग अभिक्रिया करते हैं?", options: ["C₂H₆, C₃H₈, CH₄", "C₃H₆ व C₂H₂", "केवल CH₄", "सभी"], a: 1, why: "केवल असंतृप्त C₃H₆ व C₂H₂ में बहु-बंध हैं।" },
  { q: "14. संतृप्त व असंतृप्त में अंतर का परीक्षण:", options: ["लिटमस", "ब्रोमीन जल / क्षारीय KMnO₄ का रंग उड़ना", "बिना वायु ज्वाला", "सोडियम धातु"], a: 1, why: "असंतृप्त यौगिक ब्रोमीन जल का रंग उड़ाते हैं, संतृप्त नहीं।" },
  { q: "15. साबुन की सफ़ाई की क्रियाविधि?", options: ["मैल रासायनिक रूप से घुलता है", "मिसेल चिकने मैल का पायस बनाकर आयन-प्रतिकर्षण से निलंबित रखते हैं", "साबुन तेल को वाष्पित करता है", "साबुन जल को अम्लीय करता है"], a: 1, why: "पूँछें तेल पकड़तीं, सिर मिसेल को जल में कोलॉइड बनाए रखते हैं।" },
  { q: "पाठ्य प्रश्न: एथेनॉल → एथेनोइक अम्ल ऑक्सीकरण क्यों?", options: ["O जुड़ता / H हटता है", "H जुड़ता है", "प्रतिस्थापन", "उदासीनीकरण"], a: 0, why: "O का जुड़ना या H का हटना ऑक्सीकरण है।" },
  { q: "पाठ्य प्रश्न: लाखों यौगिकों के लिए कार्बन के दो गुण?", options: ["शृंखलन व चतुःसंयोजकता", "अपररूपता व समावयवता", "आयनीकरण व चालकता", "घनत्व व कठोरता"], a: 0, why: "NCERT §4.2 — आपस में प्रबल बंध और चार बंध बनाने की क्षमता।" },
  { q: "पाठ्य प्रश्न: क्या अपमार्जक से कठोर जल जाँचेंगे?", options: ["हाँ, गाद बनेगी", "नहीं — अपमार्जक कठोर व मृदु दोनों जल में झाग देता है", "हाँ, नीला हो जाएगा", "केवल लिटमस से"], a: 1, why: "अपमार्जक Ca²⁺/Mg²⁺ से अवक्षेप नहीं बनाता, अंतर दिखता ही नहीं।" },
  { q: "पाठ्य प्रश्न: कपड़े धोते समय मंथन/रगड़ क्यों?", options: ["जल गरम करने को", "मिसेल को मैल उठाकर निलंबित करने में सहायता", "साबुन अम्लीय बनाने को", "तेल वाष्पित करने को"], a: 1, why: "रगड़ पायसीकरण तेज़ कर मैल-युक्त मिसेल हटाती है।" },
  { q: "एग्ज़ेम्प्लर: एल्काइन श्रेणी का प्रथम सदस्य?", options: ["मेथेन", "एथीन", "एथाइन", "प्रोपाइन"], a: 2, why: "त्रि-बंध के लिए कम से कम दो कार्बन चाहिए, अतः C₂H₂ प्रथम है।" }
];

/* Five monoliths in the meta world, one per chapter group. Clicking one flies
   straight to the first spread of that group (sec:N deep navigation). */
const CARBON_GROUPS = [
  { id: "sec:0", title: "4.1 Bonding & allotropes", hi: "4.1 बंधन व अपररूप", cls: "X", color: "#4c7fa8", spread: 0 },
  { id: "sec:2", title: "4.2 Versatile carbon", hi: "4.2 बहुमुखी कार्बन", cls: "X", color: "#3f8f7f", spread: 2 },
  { id: "sec:8", title: "4.3 Chemical reactions", hi: "4.3 रासायनिक अभिक्रियाएँ", cls: "X", color: "#d07a48", spread: 8 },
  { id: "sec:12", title: "4.4 Ethanol & acids", hi: "4.4 एथेनॉल व अम्ल", cls: "X", color: "#d9564f", spread: 12 },
  { id: "sec:15", title: "4.5 Soaps & micelles", hi: "4.5 साबुन व मिसेल", cls: "X", color: "#4ad6ff", spread: 15 }
];

/* --------------------------------------------------------------------------
   Printed right-page Hindi captions + Hindi challenge wording.
   Attached by spread index so every Ch 4 spread is genuinely bilingual when
   the class selects EN + हिंदी / द्विभाषी mode.
   -------------------------------------------------------------------------- */
const CARBON_FIG_HI = [
  "चित्र 4.1–4.5 — H₂ एक, O₂ द्वि, N₂ त्रिबंध तथा CH₄ की इलेक्ट्रॉन-बिंदु संरचना।",
  "NCERT पृ. 61 — हीरा, ग्रेफाइट और बकमिंस्टरफुलरीन की संरचनाएँ।",
  "सारणी 4.2 — मेथेन, एथेन, प्रोपेन, ब्यूटेन, पेंटेन, हेक्सेन।",
  "चित्र 4.6 / 4.7 — एथेन व एथीन की चरणबद्ध संरचनाएँ।",
  "चित्र 4.8–4.10 — ब्यूटेन समावयवी, साइक्लोहेक्सेन और बेंजीन।",
  "सारणी 4.3 — कार्बन यौगिकों के कुछ क्रियात्मक समूह।",
  "क्रियाकलाप 4.2 — अल्कोहलों को एक श्रेणी में क्रमबद्ध करें।",
  "सारणी 4.4 — कार्बनिक यौगिकों का नामकरण।",
  "क्रियाकलाप 4.3/4.4 — बर्नर, वायु-छिद्र और धातु की प्लेट पर कालिख।",
  "क्रियाकलाप 4.5 — ड्रॉपर, गर्म एथेनॉल, बैंगनी रंग का फीका पड़ना।",
  "NCERT §4.3.3 — Ni सतह पर R–C=C–R का R–C–C–R बनना।",
  "NCERT §4.3.4 — धूप में मेथेन + क्लोरीन।",
  "क्रियाकलाप 4.6 + §4.4.1 — निर्जल अल्कोहल में सोडियम, 443 K पर निर्जलीकरण।",
  "क्रियाकलाप 4.7 + 4.9 — लिटमस, सार्वत्रिक सूचक, चूने का पानी।",
  "चित्र 4.11 — तिपाई पर जल-स्नान में परखनली, बीकर में डालना।",
  "क्रियाकलाप 4.10–4.12 / चित्र 4.12–4.13 — मिसेल, तेल बूँद, स्कम।"
];
const CARBON_HINT_HI = [
  "अणु चुनें और अष्टक पूर्ण होने तक इलेक्ट्रॉन साझा करें।",
  "अपररूप बदलें और चालकता जाँच 80% से ऊपर ले जाएँ।",
  "शृंखला छह कार्बन तक बढ़ाएँ और सूत्र व मोलर द्रव्यमान देखें।",
  "बंध-क्रम बदलें, फिर ब्रोमीन जल से असंतृप्तता जाँचें।",
  "दो ब्यूटेनों से छह-सदस्यीय बेंजीन वलय पर जाएँ।",
  "हर समूह क्रम से जोड़ें और वर्ग तथा नाम पढ़ें।",
  "चौथे सदस्य तक पहुँचें और सूत्र, द्रव्यमान, क्वथनांक मिलाएँ।",
  "अंतिम 'e' हटाने के नियम से प्रोपेनोन का सही नाम बनाएँ।",
  "वायु-आपूर्ति तब तक खोलें जब तक ज्वाला स्वच्छ नीली न हो (≥ 90)।",
  "KMnO₄ की बूँदें डालें और गर्म करें जब तक 90% एथेनॉल अम्ल न बने।",
  "Ni उत्प्रेरक चालू करें और H₂ दें जब तक संतृप्ति 90% न हो।",
  "धूप 50% से ऊपर करें और क्लोरीन से H प्रतिस्थापित करें।",
  "निर्जलीकरण चुनें और ताप 443 K तक बढ़ाएँ।",
  "NaHCO₃ परीक्षण चुनें — CO₂ से चूने का पानी दूधिया होगा।",
  "जल-स्नान गर्म करें और उत्प्रेरक डालें जब तक एस्टर 80% न बन जाए।",
  "कठोर जल बनाएँ, फिर अपमार्जक चुनकर सफाई 85% से ऊपर लाएँ।"
];
const CARBON_CHAL_HI = [
  "कार्बन का अष्टक पूर्ण करें: साझेदारी = 100%।",
  "ग्रेफाइट की चालकता दिखाएँ: जाँच ≥ 80%।",
  "कम से कम 6 कार्बन की शृंखला बनाएँ।",
  "असंतृप्त यौगिक से ब्रोमीन जल ≥ 90% रंगहीन करें।",
  "6 वलय परमाणुओं वाली संरचना तक पहुँचें।",
  "–COOH कार्बोक्सिलिक अम्ल समूह जोड़ें।",
  "श्रेणी के चौथे सदस्य तक पहुँचें।",
  "3-कार्बन कीटोन का सही नाम दें (अंक 100)।",
  "स्वच्छ नीली ज्वाला पाएँ: स्वच्छता ≥ 90।",
  "एथेनॉल का ≥ 90% भाग एथेनोइक अम्ल में बदलें।",
  "तेल संतृप्त करें: 90% हाइड्रोजनीकरण।",
  "धूप में कम से कम एक H को Cl से प्रतिस्थापित करें।",
  "एथेनॉल → एथीन हेतु 443 K तक पहुँचें।",
  "कार्बोनेट परीक्षण में CO₂ निकालें।",
  "सुगंधित एस्टर बनाएँ: उत्पादन ≥ 80%।",
  "कठोर जल में सफाई करें: 85% सफाई तक पहुँचें।"
];
WORLDS.c10_carbon.forEach((sp, i) => {
  sp.figHi = CARBON_FIG_HI[i] || sp.fig;
  sp.hintHi = CARBON_HINT_HI[i] || sp.tryHint;
  const chHi = CARBON_CHAL_HI[i];
  if (sp.challenge && chHi) sp.challenge.textHi = chHi;
  if (sp.scene && sp.scene.challenge && chHi) sp.scene.challenge.textHi = chHi;
});
