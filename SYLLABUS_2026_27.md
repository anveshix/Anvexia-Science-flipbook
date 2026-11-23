# CBSE 2026-27 Science · complete topic & subtopic coverage ledger

**Copyright / Developer : Paras Pranav** · EduVerse offline 3D textbook

| | |
|---|---|
| Session | 2026-27 (Class IX NCERT *Exploration*, April 2026 edition) |
| Class IX | 13 chapters — including Chapter 1 *Exploration: Entering the World of Secondary Science*, which is introductory and not in the 80-mark unit table |
| Class X | 13 assessed chapters · subject code 086 · 80 marks theory + 20 internal |
| Student chapters | 26 (all live, one 3D spread per topic/subtopic) |
| Reference packs | 3 (formative-only / outside syllabus, clearly labelled, Tools shelf only) |
| Generated packs | 27 |
| Generated spreads | 227 authored + 26 curated (Ch4 Carbon 16 + Ch9 Light 10) |
| Topic status | assessed 211 · formative-only 8 · archive 8 |
| Compiler | `python3 tools/build_chapters.py` → `src/chapters_generated.js` |
| Validator | `node qa/syllabus_smoke.js` asserts one section per topic, bilingual parity, model + challenge reachability |

## Source reconciliation (why this list is not the old 15-chapter list)

- Class IX 2026-27 uses the new NCERT **Exploration** textbook: 13 chapters including an introductory Chapter 1. The older *Science: Textbook for Class IX* sequence (Matter in Our Surroundings, Gravitation, Why Do We Fall Ill, Improvement in Food Resources, …) is **not** the current assessed sequence; those catalogue rows are retained in the Tools shelf as legacy, never as student chapters.
- Class X 2026-27 has 13 chapters. Ch 8 is **Heredity** (Evolution retained for formative assessment only), Ch 9 **Light – Reflection and Refraction**, Ch 10 **The Human Eye and the Colourful World**.
- CBSE does **not** publish a separate 'deleted syllabus' list for 2026-27. The Note for Teachers names Periodic Classification of Elements, Evolution, and Electric Motor / Electromagnetic Induction / Electric Generator as topics **not assessed in the year-end examination** but still used for class work and portfolio. They are built here with status `formative`, never dropped silently.
- Mirror/lens formula derivations, the logarithmic definition of pH, the sunrise/sunset colour explanation and NCERT boxed information are excluded from board assessment; the corresponding spreads are labelled `formative` where they occur.
- Sources of Energy and Sustainable Management of Natural Resources are outside the 2026-27 syllabus. They are retained as `archive` reference packs in the Tools shelf so nothing is skipped without a label.
- Secondary sources consulted: CBSE curriculum 2026-27 coverage, NCERT *Exploration* Grade 9 chapter list, NCERT Science X chapter PDFs (`jesc104.pdf`, `jesc109.pdf`, `jesc110.pdf`), myCBSEguide new-book topic table, Extramarks 2026-27 syllabus, Shiksha 2027 syllabus, LearnCBSE / SuperTutor notes on the Note for Teachers. Where secondary sources conflicted (12 vs 13 IX chapters, 'deleted' vs 'formative'), the more inclusive reading was used and the status recorded here.

## Chapter-by-chapter ledger

### IX · Exploration: Entering the World of Secondary Science (`c9_exploration`) — 6 spreads · STUDENT

*अन्वेषण: माध्यमिक विज्ञान की दुनिया में प्रवेश* · NCERT Exploration IX · Ch 1 · pp 1-7 · figure grammar `flow` · formula `Observe → Question → Test → Evidence → Share`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 1.1 | Science begins with observation | विज्ञान प्रेक्षण से शुरू होता है | assessed |
| 1.2 | Focused questions guide investigation | केन्द्रित प्रश्न जाँच का मार्ग दिखाते हैं | assessed |
| 1.3 | Scientific language must be precise | वैज्ञानिक भाषा सटीक होनी चाहिए | assessed |
| 1.4 | Experiments produce evidence | प्रयोग प्रमाण देते हैं | assessed |
| 1.5 | Models connect the unseen to the seen | प्रतिरूप अदृश्य को दृश्य से जोड़ते हैं | assessed |
| 1.6 | Science links mathematics, technology and society | विज्ञान गणित, तकनीक और समाज को जोड़ता है | assessed |

### IX · Cell: The Building Block of Life (`c9_cell`) — 11 spreads · STUDENT

*कोशिका: जीवन की निर्माण इकाई* · NCERT Exploration IX · Ch 2 · pp 8-27 · figure grammar `cell` · formula `Cell → Tissue → Organ → System`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 2.1 | Discovery of the cell | कोशिका की खोज | assessed |
| 2.2 | Plant cell and animal cell | पादप कोशिका और जन्तु कोशिका | assessed |
| 2.3 | Prokaryotic and eukaryotic cells | प्रोकैरियोटी और यूकैरियोटी कोशिका | assessed |
| 2.4 | Plasma membrane and permeability | जीवद्रव्य झिल्ली और पारगम्यता | assessed |
| 2.5 | Cell wall and vacuoles | कोशिका भित्ति और रिक्तिका | assessed |
| 2.6 | Nucleus and chromosomes | केन्द्रक और गुणसूत्र | assessed |
| 2.7 | Mitochondria and chloroplast | माइटोकॉन्ड्रिया और हरितलवक | assessed |
| 2.8 | Endoplasmic reticulum, Golgi and lysosomes | अंतर्द्रव्यी जालिका, गॉल्जी और लाइसोसोम | assessed |
| 2.9 | Cell division: mitosis and meiosis | कोशिका विभाजन: समसूत्री और अर्धसूत्री | assessed |
| 2.10 | Biomolecules and cell functions | जैव-अणु और कोशिका कार्य | assessed |
| 2.11 | Recent advances, cell division and cancer | नई खोजें, विभाजन और कैंसर | assessed |

### IX · Tissues in Action (`c9_tissues`) — 11 spreads · STUDENT

*ऊतक: क्रिया में* · NCERT Exploration IX · Ch 3 · pp 28-47 · figure grammar `layers` · formula `Cell → Tissue → Organ → Organ system → Organism`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 3.1 | What a tissue is | ऊतक क्या है | assessed |
| 3.2 | Levels of organisation in organisms | जीवों में संगठन के स्तर | assessed |
| 3.3 | Meristematic tissues | विभज्योतक ऊतक | assessed |
| 3.4 | Simple permanent plant tissues | सरल स्थायी पादप ऊतक | assessed |
| 3.5 | Xylem: water transport | जाइलम: जल परिवहन | assessed |
| 3.6 | Phloem: food transport | फ्लोएम: भोजन परिवहन | assessed |
| 3.7 | Epithelial tissue | उपकला ऊतक | assessed |
| 3.8 | Connective tissue | संयोजी ऊतक | assessed |
| 3.9 | Muscular and nervous tissue | पेशी और तंत्रिका ऊतक | assessed |
| 3.10 | Musculoskeletal system and its care | कंकाल-पेशी तंत्र और उसकी देखभाल | assessed |
| 3.11 | Injury, posture, nutrition and exercise | चोट, मुद्रा, पोषण और व्यायाम | assessed |

### IX · Describing Motion Around Us (`c9_motion`) — 9 spreads · STUDENT

*हमारे चारों ओर गति का वर्णन* · NCERT Exploration IX · Ch 4 · pp 48-71 · figure grammar `graph` · formula `v = u + at   ·   s = ut + ½at²`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 4.1 | Rest, motion and frame of reference | विराम, गति और सन्दर्भ फ़्रेम | assessed |
| 4.2 | Distance and displacement | दूरी और विस्थापन | assessed |
| 4.3 | Speed and average speed | चाल और औसत चाल | assessed |
| 4.4 | Velocity and uniform velocity | वेग और एकसमान वेग | assessed |
| 4.5 | Acceleration and retardation | त्वरण और मंदन | assessed |
| 4.6 | Distance-time graphs | दूरी-समय आलेख | assessed |
| 4.7 | Velocity-time graphs | वेग-समय आलेख | assessed |
| 4.8 | Kinematic equations by graphical method | आलेखी विधि से गति के समीकरण | assessed |
| 4.9 | Uniform circular motion | एकसमान वृत्तीय गति | assessed |

### IX · Exploring Mixtures and their Separation (`c9_mixtures`) — 10 spreads · STUDENT

*मिश्रणों की खोज और पृथक्करण* · NCERT Exploration IX · Ch 5 · pp 72-93 · figure grammar `layers` · formula `mass % = (solute / solution) × 100`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 5.1 | Homogeneous and heterogeneous mixtures | समांगी और विषमांगी मिश्रण | assessed |
| 5.2 | Solutions and their components | विलयन और उसके घटक | assessed |
| 5.3 | Suspensions | निलंबन | assessed |
| 5.4 | Colloids and Tyndall effect | कोलॉइड और टिण्डल प्रभाव | assessed |
| 5.5 | Mass by mass percentage | द्रव्यमान-द्रव्यमान प्रतिशत | assessed |
| 5.6 | Mass by volume and volume by volume | द्रव्यमान-आयतन और आयतन-आयतन | assessed |
| 5.7 | Filtration, evaporation and sedimentation | छानना, वाष्पन और अवसादन | assessed |
| 5.8 | Crystallisation and distillation | क्रिस्टलीकरण और आसवन | assessed |
| 5.9 | Chromatography and sublimation | वर्णलेखन और ऊर्ध्वपातन | assessed |
| 5.10 | Centrifugation and coagulation | अपकेन्द्रण और स्कंदन | assessed |

### IX · How Forces Affect Motion (`c9_forces`) — 9 spreads · STUDENT

*बल गति को कैसे बदलते हैं* · NCERT Exploration IX · Ch 6 · pp 94-115 · figure grammar `field` · formula `F = ma   ·   p = mv`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 6.1 | Force as a push or a pull | धक्का या खिंचाव के रूप में बल | assessed |
| 6.2 | Effects of force | बल के प्रभाव | assessed |
| 6.3 | Balanced forces | संतुलित बल | assessed |
| 6.4 | Unbalanced forces change motion | असंतुलित बल गति बदलते हैं | assessed |
| 6.5 | Friction opposes relative motion | घर्षण सापेक्ष गति का विरोध करता है | assessed |
| 6.6 | Newton's first law and inertia | न्यूटन का प्रथम नियम और जड़त्व | assessed |
| 6.7 | Newton's second law and momentum | न्यूटन का दूसरा नियम और संवेग | assessed |
| 6.8 | Newton's third law | न्यूटन का तृतीय नियम | assessed |
| 6.9 | Conservation of momentum | संवेग संरक्षण | assessed |

### IX · Work, Energy, and Simple Machines (`c9_work_energy`) — 9 spreads · STUDENT

*कार्य, ऊर्जा और सरल मशीनें* · NCERT Exploration IX · Ch 7 · pp 116-139 · figure grammar `machine` · formula `W = Fs   ·   P = W/t   ·   KE = ½mv²`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 7.1 | Work done by a constant force | स्थिर बल द्वारा किया गया कार्य | assessed |
| 7.2 | Positive, negative and zero work | धनात्मक, ऋणात्मक और शून्य कार्य | assessed |
| 7.3 | Kinetic energy | गतिज ऊर्जा | assessed |
| 7.4 | Potential energy | स्थितिज ऊर्जा | assessed |
| 7.5 | Work-energy theorem | कार्य-ऊर्जा प्रमेय | assessed |
| 7.6 | Conservation of energy | ऊर्जा का संरक्षण | assessed |
| 7.7 | Power and its unit | शक्ति और उसकी इकाई | assessed |
| 7.8 | Simple machines and mechanical advantage | सरल मशीनें और यांत्रिक लाभ | assessed |
| 7.9 | Lever, pulley and inclined plane | उत्तोलक, घिरनी और आनत तल | assessed |

### IX · Journey Inside the Atom (`c9_atom`) — 12 spreads · STUDENT

*परमाणु के भीतर की यात्रा* · NCERT Exploration IX · Ch 8 · pp 140-161 · figure grammar `molecule` · formula `Z = protons   ·   A = protons + neutrons`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 8.1 | Atoms as basic units of elements | तत्वों की मूल इकाई परमाणु | assessed |
| 8.2 | Discovery of the electron | इलेक्ट्रॉन की खोज | assessed |
| 8.3 | Proton and neutron | प्रोटॉन और न्यूट्रॉन | assessed |
| 8.4 | Thomson's plum-pudding model | थॉमसन का प्लम-पुडिंग प्रतिरूप | assessed |
| 8.5 | Rutherford's nuclear model | रदरफ़ोर्ड का नाभिकीय प्रतिरूप | assessed |
| 8.6 | Bohr's model and shells | बोहर का प्रतिरूप और कोश | assessed |
| 8.7 | Electron distribution up to Z = 18 | Z = 18 तक इलेक्ट्रॉन वितरण | assessed |
| 8.8 | Atomic number and mass number | परमाणु क्रमांक और द्रव्यमान संख्या | assessed |
| 8.9 | Isotopes and isobars | समस्थानिक और समभारिक | assessed |
| 8.10 | Valency and combining capacity | संयोजकता और संयोजन क्षमता | assessed |
| 8.11 | Symbols of elements | तत्वों के प्रतीक | assessed |
| 8.12 | Symbols, valency and formulae | प्रतीक, संयोजकता और सूत्र | assessed |

### IX · Atomic Foundations of Matter (`c9_atomic_foundations`) — 9 spreads · STUDENT

*द्रव्य के परमाणविक आधार* · NCERT Exploration IX · Ch 9 · pp 162-183 · figure grammar `molecule` · formula `Mass conserved   ·   Fixed proportions`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 9.1 | Law of conservation of mass | द्रव्यमान संरक्षण का नियम | assessed |
| 9.2 | Law of constant proportion | निश्चित अनुपात का नियम | assessed |
| 9.3 | Dalton's atomic theory | डाल्टन का परमाणु सिद्धान्त | assessed |
| 9.4 | Molecules of elements | तत्वों के अणु | assessed |
| 9.5 | Molecules of covalent compounds | सहसंयोजक यौगिकों के अणु | assessed |
| 9.6 | Ions and ionic compounds | आयन और आयनिक यौगिक | assessed |
| 9.7 | Writing chemical formulae | रासायनिक सूत्र लिखना | assessed |
| 9.8 | Molecular mass | अणु द्रव्यमान | assessed |
| 9.9 | Formula unit mass | सूत्र इकाई द्रव्यमान | assessed |

### IX · Sound Waves: Characteristics and Applications (`c9_sound`) — 10 spreads · STUDENT

*ध्वनि तरंगें: लक्षण और उपयोग* · NCERT Exploration IX · Ch 10 · pp 184-207 · figure grammar `wave` · formula `v = fλ   ·   T = 1/f`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 10.1 | Sound is produced by vibration | ध्वनि कम्पन से उत्पन्न होती है | assessed |
| 10.2 | Sound needs a material medium | ध्वनि को माध्यम चाहिए | assessed |
| 10.3 | Longitudinal propagation and compressions | अनुदैर्घ्य संचरण और संपीडन | assessed |
| 10.4 | Graphical representation of a sound wave | ध्वनि तरंग का आलेखीय निरूपण | assessed |
| 10.5 | Wavelength, frequency and time period | तरंगदैर्घ्य, आवृत्ति और आवर्तकाल | assessed |
| 10.6 | Amplitude, intensity and speed | आयाम, तीव्रता और चाल | assessed |
| 10.7 | Wave speed v = fλ | तरंग चाल v = fλ | assessed |
| 10.8 | Sound in solids and liquids | ठोस और द्रव में ध्वनि | assessed |
| 10.9 | Reflection, echo and reverberation | परावर्तन, प्रतिध्वनि और अनुरणन | assessed |
| 10.10 | Pitch, loudness and echolocation | तारत्व, प्रबलता और प्रतिध्वनि-स्थिति | assessed |

### IX · Reproduction: How Life Continues (`c9_reproduction9`) — 9 spreads · STUDENT

*जनन: जीवन कैसे आगे बढ़ता है* · NCERT Exploration IX · Ch 11 · pp 208-227 · figure grammar `cycle` · formula `Gametes → Fertilisation → Embryo → Offspring`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 11.1 | Asexual reproduction | अलैंगिक जनन | assessed |
| 11.2 | Budding, fragmentation and spores | मुकुलन, खंडन और बीजाणु | assessed |
| 11.3 | Vegetative propagation | वानस्पतिक प्रवर्धन | assessed |
| 11.4 | Flower and its parts | पुष्प और उसके भाग | assessed |
| 11.5 | Pollination and fertilisation in plants | पादपों में परागण और निषेचन | assessed |
| 11.6 | Seed dispersal and germination | बीज प्रकीर्णन और अंकुरण | assessed |
| 11.7 | Human male and female reproductive systems | मानव नर और मादा जनन तंत्र | assessed |
| 11.8 | Gametes, menstrual cycle and pregnancy | युग्मक, मासिक चक्र और गर्भावस्था | assessed |
| 11.9 | Reproductive health, hygiene and birth control | जनन स्वास्थ्य, स्वच्छता और जन्म नियंत्रन | assessed |

### IX · Patterns in Life: Diversity and Classification (`c9_diversity`) — 8 spreads · STUDENT

*जीवन के प्रतिरूप: विविधता और वर्गीकरण* · NCERT Exploration IX · Ch 12 · pp 228-251 · figure grammar `tree` · formula `Kingdom → Phylum → Class → Order → Family → Genus → Species`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 12.1 | Why classification is needed | वर्गीकरण क्यों आवश्यक है | assessed |
| 12.2 | Five kingdoms and their features | पाँच जगत और उनके लक्षण | assessed |
| 12.3 | Monera, Protista and Fungi | मोनेरा, प्रोटिस्टा और फंजाई | assessed |
| 12.4 | Major divisions of plants | पादपों के प्रमुख विभाग | assessed |
| 12.5 | Major divisions of animals | प्राणियों के प्रमुख विभाग | assessed |
| 12.6 | Binomial nomenclature | द्विनाम पद्धति | assessed |
| 12.7 | Hierarchy of taxonomic ranks | वर्गीकरण श्रेणियों का पदानुक्रम | assessed |
| 12.8 | Acellular entities: viruses | अकोशिकीय सत्ताएँ: विषाणु | assessed |

### IX · Earth as a System: Energy, Matter, and Life (`c9_earth`) — 9 spreads · STUDENT

*पृथ्वी एक तंत्र: ऊर्जा, द्रव्य और जीवन* · NCERT Exploration IX · Ch 13 · pp 252-270 · figure grammar `cycle` · formula `Input → Storage → Cycling → Output`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 13.1 | Earth as an interconnected system | पृथ्वी एक परस्पर जुड़ा तंत्र | assessed |
| 13.2 | Solar radiation and the electromagnetic spectrum | सौर विकिरण और विद्युतचुम्बकीय वर्णक्रम | assessed |
| 13.3 | Interaction with the surface and differential heating | सतह से अंतःक्रिया और असमान तापन | assessed |
| 13.4 | Winds from differential warming | असमान तापन से पवनें | assessed |
| 13.5 | The water cycle | जल चक्र | assessed |
| 13.6 | The carbon cycle | कार्बन चक्र | assessed |
| 13.7 | The nitrogen cycle | नाइट्रोजन चक्र | assessed |
| 13.8 | The oxygen cycle | ऑक्सीजन चक्र | assessed |
| 13.9 | Human impact on Earth's system | पृथ्वी तंत्र पर मानव प्रभाव | assessed |

### X · Chemical Reactions and Equations (`c10_reactions`) — 9 spreads · STUDENT

*रासायनिक अभिक्रियाएँ एवं समीकरण* · CBSE 2026-27 · Unit I · Ch 1 · figure grammar `flow` · formula `Atoms in = Atoms out`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 1.1 | Chemical changes and their evidence | रासायनिक परिवर्तन और उसके संकेत | assessed |
| 1.2 | Writing and balancing equations | समीकरण लिखना और संतुलित करना | assessed |
| 1.3 | Combination reactions | संयोजन अभिक्रियाएँ | assessed |
| 1.4 | Decomposition reactions | विघटन अभिक्रियाएँ | assessed |
| 1.5 | Displacement and double displacement | विस्थापन और द्वि-विस्थापन | assessed |
| 1.6 | Precipitation reactions | अवक्षेप अभिक्रियाएँ | assessed |
| 1.7 | Oxidation and reduction | ऑक्सीकरण और अपचयन | assessed |
| 1.8 | Exothermic and endothermic reactions | ऊष्माक्षेपी और ऊष्माशोषी अभिक्रियाएँ | assessed |
| 1.9 | Corrosion and rancidity | संक्षारण और विकृतगंधता | assessed |

### X · Acids, Bases and Salts (`c10_acids`) — 9 spreads · STUDENT

*अम्ल, क्षार एवं लवण* · CBSE 2026-27 · Unit I · Ch 2 · figure grammar `layers` · formula `pH < 7 acid   ·   pH = 7 neutral   ·   pH > 7 base`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 2.1 | Acids and bases: properties | अम्ल और क्षार के गुण | assessed |
| 2.2 | H+ and OH- ions in water | जल में H+ और OH- आयन | assessed |
| 2.3 | Indicators and their colours | सूचक और उनके रंग | assessed |
| 2.4 | Neutralisation and salt formation | उदासीनीकरण और लवण निर्माण | assessed |
| 2.5 | The pH scale and its importance | pH पैमाना और उसका महत्व | assessed |
| 2.6 | pH in everyday life | दैनिक जीवन में पीएच | assessed |
| 2.7 | Common salt and sodium hydroxide | साधारण नमक और सोडियम हाइड्रॉक्साइड | assessed |
| 2.8 | Bleaching powder, baking soda and washing soda | विरंजक चूर्ण, खाने का सोडा और धोने का सोडा | assessed |
| 2.9 | Plaster of Paris and water of crystallisation | प्लास्टर ऑफ़ पेरिस और क्रिस्टलन जल | assessed |

### X · Metals and Non-metals (`c10_metals`) — 8 spreads · STUDENT

*धातु एवं अधातु* · CBSE 2026-27 · Unit I · Ch 3 · figure grammar `layers` · formula `K > Na > Ca > Mg > Al > Zn > Fe > Cu > Ag > Au`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 3.1 | Physical properties of metals and non-metals | धातु और अधातु के भौतिक गुण | assessed |
| 3.2 | Chemical properties: oxygen, water and acids | रासायनिक गुण: ऑक्सीजन, जल और अम्ल | assessed |
| 3.3 | Amphoteric oxides and the reactivity series | उभयधर्मी ऑक्साइड और क्रियाशीलता श्रेणी | assessed |
| 3.4 | Ionic compounds and their properties | आयनिक यौगिक और उनके गुण | assessed |
| 3.5 | Occurrence and extraction of metals | धातुओं की प्राप्ति और निष्कर्षण | assessed |
| 3.6 | Refining and electrolytic purification | शोधन और वैद्युत परिष्करण | assessed |
| 3.7 | Corrosion and its prevention | संक्षारण और उसकी रोकथाम | assessed |
| 3.8 | Alloys and their uses | मिश्रधातुएँ और उनके उपयोग | assessed |

### X · Life Processes (`c10_life`) — 9 spreads · STUDENT

*जीवन प्रक्रम* · CBSE 2026-27 · Unit II · Ch 5 · figure grammar `flow` · formula `Nutrition → Respiration → Transport → Excretion`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 5.1 | Nutrition and autotrophic mode | पोषण और स्वपोषी पद्धति | assessed |
| 5.2 | Photosynthesis and chlorophyll | प्रकाश-संश्लेषण और क्लोरोफ़िल | assessed |
| 5.3 | Heterotrophic nutrition | विषमपोषी पोषण | assessed |
| 5.4 | Digestion in humans | मानव में पाचन | assessed |
| 5.5 | Aerobic and anaerobic respiration | वायवीय और अवायवीय श्वसन | assessed |
| 5.6 | Human respiratory system | मानव श्वसन तंत्र | assessed |
| 5.7 | Transport in plants | पादपों में परिवहन | assessed |
| 5.8 | Human circulatory system | मानव परिसंचरण तंत्र | assessed |
| 5.9 | Excretion in plants and humans | पादपों और मानव में उत्सर्जन | assessed |

### X · Control and Coordination (`c10_control`) — 8 spreads · STUDENT

*नियंत्रण एवं समन्वय* · CBSE 2026-27 · Unit II · Ch 6 · figure grammar `tree` · formula `Stimulus → Receptor → Neuron → Effector → Response`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 6.1 | Tropic movements in plants | पादपों में अनुवर्ती गतियाँ | assessed |
| 6.2 | Plant hormones | पादप हॉर्मोन | assessed |
| 6.3 | Nervous system and neuron | तंत्रिका तंत्र और न्यूरॉन | assessed |
| 6.4 | Reflex action and reflex arc | प्रतिवर्त क्रिया और प्रतिवर्त चाप | assessed |
| 6.5 | Human brain and its parts | मानव मस्तिष्क और उसके भाग | assessed |
| 6.6 | Voluntary, involuntary and autonomic actions | ऐच्छिक, अनैच्छिक और स्वायत्त क्रियाएँ | assessed |
| 6.7 | Endocrine glands and animal hormones | अंतःस्रावी ग्रंथियाँ और जन्तु हॉर्मोन | assessed |
| 6.8 | Feedback control and coordination | पुनर्निवेश नियंत्रण और समन्वय | assessed |

### X · How do Organisms Reproduce? (`c10_repro`) — 9 spreads · STUDENT

*जीव जनन कैसे करते हैं* · CBSE 2026-27 · Unit II · Ch 7 · figure grammar `cycle` · formula `Gametes → Fertilisation → Zygote → Embryo → Offspring`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 7.1 | Variation and the need for reproduction | विभिन्नता और जनन की आवश्यकता | assessed |
| 7.2 | Asexual reproduction: fission, budding, regeneration | अलैंगिक जनन: विखंडन, मुकुलन, पुनर्जनन | assessed |
| 7.3 | Vegetative propagation and tissue culture | वानस्पतिक प्रवर्धन और ऊतक संवर्धन | assessed |
| 7.4 | Sexual reproduction in flowering plants | पुष्पी पादपों में लैंगिक जनन | assessed |
| 7.5 | Human male reproductive system | मानव नर जनन तंत्र | assessed |
| 7.6 | Human female reproductive system | मानव मादा जनन तंत्र | assessed |
| 7.7 | Fertilisation, embryo and menstrual cycle | निषेचन, भ्रूण और मासिक चक्र | assessed |
| 7.8 | Reproductive health and contraception | जनन स्वास्थ्य और गर्भनिरोध | assessed |
| 7.9 | HIV, AIDS and women's health | HIV, AIDS और महिला स्वास्थ्य | assessed |

### X · Heredity (`c10_heredity`) — 7 spreads · STUDENT

*आनुवंशिकी* · CBSE 2026-27 · Unit II · Ch 8 · figure grammar `tree` · formula `Monohybrid F2 = 3 : 1   ·   Dihybrid F2 = 9 : 3 : 3 : 1`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 8.1 | Inheritance and variation | आनुवंशिकता और विभिन्नता | assessed |
| 8.2 | Mendel and his pea experiments | मेंडेल और मटर के प्रयोग | assessed |
| 8.3 | Monohybrid cross and law of segregation | एकसंकर संकरण और पृथक्करण का नियम | assessed |
| 8.4 | Dihybrid cross and independent assortment | द्विसंकर संकरण और स्वतंत्र अपव्यूहन | assessed |
| 8.5 | Dominant and recessive traits | प्रभावी और अप्रभावी लक्षण | assessed |
| 8.6 | Sex determination | लिंग निर्धारण | assessed |
| 8.7 | Evolution: formative only, not board-assessed | विकास: केवल सृजनात्मक मूल्यांकन, बोर्ड परीक्षा में नहीं | formative |

### X · The Human Eye and the Colourful World (`c10_eye`) — 8 spreads · STUDENT

*मानव नेत्र तथा रंगीन संसार* · CBSE 2026-27 · Unit III · Ch 10 · figure grammar `rays` · formula `P = 1/f   ·   f in metres, P in dioptres`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 10.1 | Structure of the human eye | मानव नेत्र की संरचना | assessed |
| 10.2 | Accommodation and near point | समंजन और निकट बिंदु | assessed |
| 10.3 | Myopia and its correction | निकटदृष्टि और उसका सुधार | assessed |
| 10.4 | Hypermetropia and presbyopia | दूरदृष्टि और जरादूरदृष्टि | assessed |
| 10.5 | Refraction through a prism | प्रिज़्म से अपवर्तन | assessed |
| 10.6 | Dispersion and spectrum | विक्षेपण और वर्णक्रम | assessed |
| 10.7 | Scattering and the Tyndall effect | प्रकीर्णन और टिण्डल प्रभाव | assessed |
| 10.8 | Twinkling, planets and atmospheric refraction | टिमटिमाहट, ग्रह और वायुमंडलीय अपवर्तन | formative |

### X · Electricity (`c10_electricity`) — 9 spreads · STUDENT

*विद्युत* · CBSE 2026-27 · Unit IV · Ch 11 · figure grammar `circuit` · formula `V = IR   ·   P = VI   ·   H = I²Rt`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 11.1 | Electric current and potential difference | विद्युत धारा और विभवांतर | assessed |
| 11.2 | Circuit symbols and diagrams | परिपथ प्रतीक और आरेख | assessed |
| 11.3 | Ohm's law and its graph | ओम का नियम और उसका आलेख | assessed |
| 11.4 | Resistance and resistivity | प्रतिरोध और प्रतिरोधकता | assessed |
| 11.5 | Series combination of resistors | प्रतिरोधकों का श्रेणीक्रम संयोजन | assessed |
| 11.6 | Parallel combination of resistors | प्रतिरोधकों का समान्तर संयोजन | assessed |
| 11.7 | Heating effect and Joule's law | ऊष्मीय प्रभाव और जूल का नियम | assessed |
| 11.8 | Electric power and energy | विद्युत शक्ति और ऊर्जा | assessed |
| 11.9 | Domestic circuits and safety | घरेलू परिपथ और सुरक्षा | assessed |

### X · Magnetic Effects of Electric Current (`c10_magnetism`) — 9 spreads · STUDENT

*विद्युत धारा के चुम्बकीय प्रभाव* · CBSE 2026-27 · Unit IV · Ch 12 · figure grammar `field` · formula `B ∝ I / r   ·   right-hand thumb rule`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 12.1 | Magnetic field and field lines | चुम्बकीय क्षेत्र और क्षेत्र रेखाएँ | assessed |
| 12.2 | Field due to a straight current-carrying conductor | सीधे धारावाही चालक का क्षेत्र | assessed |
| 12.3 | Right-hand thumb rule | दाहिने हाथ के अँगूठे का नियम | assessed |
| 12.4 | Field due to a circular loop and solenoid | वृत्ताकार कुंडली और सोलेनॉइड का क्षेत्र | assessed |
| 12.5 | Force on a current-carrying conductor | धारावाही चालक पर बल | assessed |
| 12.6 | Fleming's left-hand rule | फ़्लेमिंग का बायाँ-हाथ नियम | assessed |
| 12.7 | Direct and alternating current | दिष्ट और प्रत्यावर्ती धारा | assessed |
| 12.8 | Domestic wiring, earthing and fuse | घरेलू तार-व्यवस्था, अर्थिंग और फ़्यूज़ | assessed |
| 12.9 | Electric motor, induction and generator: formative only | विद्युत मोटर, प्रेरण और जनित्र: केवल सृजनात्मक | formative |

### X · Our Environment (`c10_env`) — 7 spreads · STUDENT

*हमारा पर्यावरण* · CBSE 2026-27 · Unit V · Ch 13 · figure grammar `cycle` · formula `Producers → Primary → Secondary → Tertiary   ·   10% law`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| 13.1 | Ecosystem and its components | पारिस्थितिक तंत्र और उसके घटक | assessed |
| 13.2 | Food chains, webs and trophic levels | आहार श्रृंखला, जाल और पोषी स्तर | assessed |
| 13.3 | Ten percent law and energy flow | दस प्रतिशत नियम और ऊर्जा प्रवाह | assessed |
| 13.4 | Biological magnification | जैव-आवर्धन | assessed |
| 13.5 | Ozone layer and its depletion | ओज़ोन परत और उसका क्षरण | assessed |
| 13.6 | Waste: biodegradable and non-biodegradable | अपशिष्ट: जैव-अपघटनीय और अनपघटनीय | assessed |
| 13.7 | Reduce, reuse, recycle and our role | कम करें, पुनः उपयोग, पुनर्चक्रण और हमारी भूमिका | assessed |

### X · Periodic Classification of Elements (formative only) (`c10_periodic`) — 5 spreads · REFERENCE

*तत्वों का आवर्त वर्गीकरण (केवल सृजनात्मक)* · CBSE 2026-27 · formative only · not board-assessed · figure grammar `table` · formula `Atomic radius ↓ across a period   ·   valency repeats`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| P.1 | Döbereiner's triads | डोबेराइनर के त्रिक | formative |
| P.2 | Newlands' law of octaves | न्यूलैंड का अष्टक नियम | formative |
| P.3 | Mendeleev's periodic table | मेंडेलीफ़ की आवर्त सारणी | formative |
| P.4 | The modern periodic law | आधुनिक आवर्त नियम | formative |
| P.5 | Trends in the modern table | आधुनिक सारणी में प्रवृत्तियाँ | formative |

### X · Sources of Energy (outside 2026-27 syllabus) (`c10_sources`) — 4 spreads · REFERENCE

*ऊर्जा के स्रोत (2026-27 पाठ्यक्रम के बाहर)* · Legacy NCERT X · reference only · figure grammar `cycle` · formula `Conventional ↔ Non-conventional   ·   renewable ↔ non-renewable`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| S.1 | Conventional and non-conventional sources | परंपरागत और अपरंपरागत स्रोत | archive |
| S.2 | Solar energy, panels and cookers | सौर ऊर्जा, पैनल और चूल्हा | archive |
| S.3 | Wind, hydro and tidal energy | पवन, जल और ज्वारीय ऊर्जा | archive |
| S.4 | Biomass, biogas and nuclear energy | जैवभार, बायोगैस और नाभिकीय ऊर्जा | archive |

### X · Sustainable Management of Natural Resources (outside 2026-27) (`c10_sustainable`) — 4 spreads · REFERENCE

*प्राकृतिक संसाधनों का सतत प्रबंधन (पाठ्यक्रम बाहर)* · Legacy NCERT X · reference only · figure grammar `cycle` · formula `Conserve → Reuse → Replenish → Participate`

| § | Topic / subtopic (EN) | हिंदी | status |
|---|---|---|---|
| M.1 | Why manage resources sustainably | सतत प्रबंधन क्यों | archive |
| M.2 | Forest and wildlife conservation | वन और वन्यजीव संरक्षण | archive |
| M.3 | Water harvesting and watershed management | जल संचयन और जलग्रहण प्रबंधन | archive |
| M.4 | Coal, petroleum and the 3Rs | कोयला, पेट्रोलियम और तीन R | archive |

## Curated deep chapters (already hand-built, preserved)

| Chapter | Spreads |
|---|---|
| Class X Ch 4 Carbon and its Compounds (`c10_carbon`) | 16 spreads, 16 carbon 3D blocks, 20-item bilingual quiz, 5 monoliths |
| Class X Ch 9 Light – Reflection and Refraction (`c10_light`) | 10 spreads, 7 optics 3D blocks, 12-item bilingual quiz, precision ray SVG |

## Credit

**Copyright / Developer : Paras Pranav** — application code, curriculum compiler, visual engine and documentation.
NCERT textbook content, chapter titles and syllabus belong to NCERT / CBSE. EduVerse is an independent, unofficial visual study aid; see `CREDITS.md` and `THIRD_PARTY.md`.
