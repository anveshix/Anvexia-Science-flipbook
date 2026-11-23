# EduVerse: complete topic and scene audit

**Stage:** read-only checklist for confirmation. No new image assets or application code were generated as part of this audit.

**Audited runtime:** local preview, `index.html` SHA-256 `1084fd0ed091e91a48e2c8a73b829f79099c8661df95a2ffb5d1b0650137dedb`. The list is taken from the running app’s `CATALOGUE_ALL` + `getWorld()` and cross-checked against the chapter packs and the earlier 240-row coverage CSV.

## Scope and interpretation

| Scope | Chapters | Runtime spreads / planned 2D illustrations |
|---|---:|---:|
| Explicitly named in the request | 24 | 225 |
| Additional student chapters present in the app | 2 | 15 |
| Reference chapters outside the student list | 3 | 13 |
| Tools-shelf-only catalogue entries | 4 | 13 |
| **Total** | **33** | **266** |

Each row is a distinct runtime spread and has a configured `scene.type`. This is a data-level inventory, not proof that each scene has been manually viewed, that its 3D model is scientifically correct, or that there are no unlisted concepts inside a spread. Where a spread bundles several concepts, the illustration plan must explicitly cover each concept; one row is the minimum planning unit, not proof that a single image suffices.

**Current state:** all 266 rows still need the requested highly realistic, subject-reviewed 2D treatment. Eleven `c9_cell` rows have an existing **vector** 2D candidate and an enabled 2D toggle; these are not photorealistic and their teacher-team sign-off is pending. On other chapters the existing 2D plate option remains unavailable. The current zoom feature supports 2D pilot plates and an explicit 3D snapshot button; high-resolution assets and platform-wide image-click behavior have not been audited here.

**Pack cross-check:** all 29 chapter-pack section counts and section/spread indices match their runtime worlds. Across Carbon (16) and Light (10), the runtime title and the pack title differ on 26 rows; both are preserved in the CSV and, below, the pack titles appear in parentheses. The pack’s `3d_blocks` are capped at six in 25 longer packs (169 blocks total across 29 packs), so those blocks are **not** a complete per-spread inventory. Runtime spread scene data—not the pack block count—is the mapping basis.

**Tools fallback:** `c9_pure`, `c9_atoms`, and `c9_disease` use generated compiler-fallback worlds, including placeholder or generic titles. They are not evidence of fully authored science topics; retain them for scope review rather than inventing titles.

**Constraints needing confirmation:** the current single-file offline build is 4,572,551 bytes against its prior 5,000,000-byte budget, with no external runtime assets. Hundreds of high-resolution realistic images cannot be assumed to fit the remaining budget. Asset packaging and offline/network behaviour must be agreed before generation; scientific and bilingual labels require independent review.

Legend: `[ ]` = requested realistic asset not yet generated. `Vector pilot` = an existing non-photorealistic candidate only; `—` = no implemented topic-specific 2D opposite-page plate.

## Explicitly requested chapters

### Class IX — Cell: The Building Block of Life (`c9_cell`) — 11 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 2.1 | Discovery of the cell | कोशिका की खोज | `atlas` | Vector pilot |
| [ ] 2 | 2.2 | Plant cell and animal cell | पादप कोशिका और जन्तु कोशिका | `atlas` | Vector pilot |
| [ ] 3 | 2.3 | Prokaryotic and eukaryotic cells | प्रोकैरियोटी और यूकैरियोटी कोशिका | `atlas` | Vector pilot |
| [ ] 4 | 2.4 | Plasma membrane and permeability | जीवद्रव्य झिल्ली और पारगम्यता | `atlas` | Vector pilot |
| [ ] 5 | 2.5 | Cell wall and vacuoles | कोशिका भित्ति और रिक्तिका | `atlas` | Vector pilot |
| [ ] 6 | 2.6 | Nucleus and chromosomes | केन्द्रक और गुणसूत्र | `atlas` | Vector pilot |
| [ ] 7 | 2.7 | Mitochondria and chloroplast | माइटोकॉन्ड्रिया और हरितलवक | `atlas` | Vector pilot |
| [ ] 8 | 2.8 | Endoplasmic reticulum, Golgi and lysosomes | अंतर्द्रव्यी जालिका, गॉल्जी और लाइसोसोम | `atlas` | Vector pilot |
| [ ] 9 | 2.9 | Cell division: mitosis and meiosis | कोशिका विभाजन: समसूत्री और अर्धसूत्री | `atlas` | Vector pilot |
| [ ] 10 | 2.10 | Biomolecules and cell functions | जैव-अणु और कोशिका कार्य | `atlas` | Vector pilot |
| [ ] 11 | 2.11 | Recent advances, cell division and cancer | नई खोजें, विभाजन और कैंसर | `atlas` | Vector pilot |

### Class IX — Tissues in Action (`c9_tissues`) — 11 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 3.1 | What a tissue is | ऊतक क्या है | `atlas` | — |
| [ ] 2 | 3.2 | Levels of organisation in organisms | जीवों में संगठन के स्तर | `atlas` | — |
| [ ] 3 | 3.3 | Meristematic tissues | विभज्योतक ऊतक | `atlas` | — |
| [ ] 4 | 3.4 | Simple permanent plant tissues | सरल स्थायी पादप ऊतक | `atlas` | — |
| [ ] 5 | 3.5 | Xylem: water transport | जाइलम: जल परिवहन | `atlas` | — |
| [ ] 6 | 3.6 | Phloem: food transport | फ्लोएम: भोजन परिवहन | `atlas` | — |
| [ ] 7 | 3.7 | Epithelial tissue | उपकला ऊतक | `atlas` | — |
| [ ] 8 | 3.8 | Connective tissue | संयोजी ऊतक | `atlas` | — |
| [ ] 9 | 3.9 | Muscular and nervous tissue | पेशी और तंत्रिका ऊतक | `atlas` | — |
| [ ] 10 | 3.10 | Musculoskeletal system and its care | कंकाल-पेशी तंत्र और उसकी देखभाल | `atlas` | — |
| [ ] 11 | 3.11 | Injury, posture, nutrition and exercise | चोट, मुद्रा, पोषण और व्यायाम | `atlas` | — |

### Class IX — Describing Motion Around Us (`c9_motion`) — 9 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 4.1 | Rest, motion and frame of reference | विराम, गति और सन्दर्भ फ़्रेम | `atlas` | — |
| [ ] 2 | 4.2 | Distance and displacement | दूरी और विस्थापन | `atlas` | — |
| [ ] 3 | 4.3 | Speed and average speed | चाल और औसत चाल | `atlas` | — |
| [ ] 4 | 4.4 | Velocity and uniform velocity | वेग और एकसमान वेग | `atlas` | — |
| [ ] 5 | 4.5 | Acceleration and retardation | त्वरण और मंदन | `atlas` | — |
| [ ] 6 | 4.6 | Distance-time graphs | दूरी-समय आलेख | `atlas` | — |
| [ ] 7 | 4.7 | Velocity-time graphs | वेग-समय आलेख | `atlas` | — |
| [ ] 8 | 4.8 | Kinematic equations by graphical method | आलेखी विधि से गति के समीकरण | `atlas` | — |
| [ ] 9 | 4.9 | Uniform circular motion | एकसमान वृत्तीय गति | `atlas` | — |

### Class IX — Exploring Mixtures and their Separation (`c9_mixtures`) — 10 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 5.1 | Homogeneous and heterogeneous mixtures | समांगी और विषमांगी मिश्रण | `atlas` | — |
| [ ] 2 | 5.2 | Solutions and their components | विलयन और उसके घटक | `atlas` | — |
| [ ] 3 | 5.3 | Suspensions | निलंबन | `atlas` | — |
| [ ] 4 | 5.4 | Colloids and Tyndall effect | कोलॉइड और टिण्डल प्रभाव | `atlas` | — |
| [ ] 5 | 5.5 | Mass by mass percentage | द्रव्यमान-द्रव्यमान प्रतिशत | `atlas` | — |
| [ ] 6 | 5.6 | Mass by volume and volume by volume | द्रव्यमान-आयतन और आयतन-आयतन | `atlas` | — |
| [ ] 7 | 5.7 | Filtration, evaporation and sedimentation | छानना, वाष्पन और अवसादन | `atlas` | — |
| [ ] 8 | 5.8 | Crystallisation and distillation | क्रिस्टलीकरण और आसवन | `atlas` | — |
| [ ] 9 | 5.9 | Chromatography and sublimation | वर्णलेखन और ऊर्ध्वपातन | `atlas` | — |
| [ ] 10 | 5.10 | Centrifugation and coagulation | अपकेन्द्रण और स्कंदन | `atlas` | — |

### Class IX — How Forces Affect Motion (`c9_forces`) — 9 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 6.1 | Force as a push or a pull | धक्का या खिंचाव के रूप में बल | `atlas` | — |
| [ ] 2 | 6.2 | Effects of force | बल के प्रभाव | `atlas` | — |
| [ ] 3 | 6.3 | Balanced forces | संतुलित बल | `atlas` | — |
| [ ] 4 | 6.4 | Unbalanced forces change motion | असंतुलित बल गति बदलते हैं | `atlas` | — |
| [ ] 5 | 6.5 | Friction opposes relative motion | घर्षण सापेक्ष गति का विरोध करता है | `atlas` | — |
| [ ] 6 | 6.6 | Newton's first law and inertia | न्यूटन का प्रथम नियम और जड़त्व | `atlas` | — |
| [ ] 7 | 6.7 | Newton's second law and momentum | न्यूटन का दूसरा नियम और संवेग | `atlas` | — |
| [ ] 8 | 6.8 | Newton's third law | न्यूटन का तृतीय नियम | `atlas` | — |
| [ ] 9 | 6.9 | Conservation of momentum | संवेग संरक्षण | `atlas` | — |

### Class IX — Work, Energy, and Simple Machines (`c9_work_energy`) — 9 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 7.1 | Work done by a constant force | स्थिर बल द्वारा किया गया कार्य | `atlas` | — |
| [ ] 2 | 7.2 | Positive, negative and zero work | धनात्मक, ऋणात्मक और शून्य कार्य | `atlas` | — |
| [ ] 3 | 7.3 | Kinetic energy | गतिज ऊर्जा | `atlas` | — |
| [ ] 4 | 7.4 | Potential energy | स्थितिज ऊर्जा | `atlas` | — |
| [ ] 5 | 7.5 | Work-energy theorem | कार्य-ऊर्जा प्रमेय | `atlas` | — |
| [ ] 6 | 7.6 | Conservation of energy | ऊर्जा का संरक्षण | `atlas` | — |
| [ ] 7 | 7.7 | Power and its unit | शक्ति और उसकी इकाई | `atlas` | — |
| [ ] 8 | 7.8 | Simple machines and mechanical advantage | सरल मशीनें और यांत्रिक लाभ | `atlas` | — |
| [ ] 9 | 7.9 | Lever, pulley and inclined plane | उत्तोलक, घिरनी और आनत तल | `atlas` | — |

### Class IX — Journey Inside the Atom (`c9_atom`) — 12 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 8.1 | Atoms as basic units of elements | तत्वों की मूल इकाई परमाणु | `atlas` | — |
| [ ] 2 | 8.2 | Discovery of the electron | इलेक्ट्रॉन की खोज | `atlas` | — |
| [ ] 3 | 8.3 | Proton and neutron | प्रोटॉन और न्यूट्रॉन | `atlas` | — |
| [ ] 4 | 8.4 | Thomson's plum-pudding model | थॉमसन का प्लम-पुडिंग प्रतिरूप | `atlas` | — |
| [ ] 5 | 8.5 | Rutherford's nuclear model | रदरफ़ोर्ड का नाभिकीय प्रतिरूप | `atlas` | — |
| [ ] 6 | 8.6 | Bohr's model and shells | बोहर का प्रतिरूप और कोश | `atlas` | — |
| [ ] 7 | 8.7 | Electron distribution up to Z = 18 | Z = 18 तक इलेक्ट्रॉन वितरण | `atlas` | — |
| [ ] 8 | 8.8 | Atomic number and mass number | परमाणु क्रमांक और द्रव्यमान संख्या | `atlas` | — |
| [ ] 9 | 8.9 | Isotopes and isobars | समस्थानिक और समभारिक | `atlas` | — |
| [ ] 10 | 8.10 | Valency and combining capacity | संयोजकता और संयोजन क्षमता | `atlas` | — |
| [ ] 11 | 8.11 | Symbols of elements | तत्वों के प्रतीक | `atlas` | — |
| [ ] 12 | 8.12 | Symbols, valency and formulae | प्रतीक, संयोजकता और सूत्र | `atlas` | — |

### Class IX — Atomic Foundations of Matter (`c9_atomic_foundations`) — 9 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 9.1 | Law of conservation of mass | द्रव्यमान संरक्षण का नियम | `atlas` | — |
| [ ] 2 | 9.2 | Law of constant proportion | निश्चित अनुपात का नियम | `atlas` | — |
| [ ] 3 | 9.3 | Dalton's atomic theory | डाल्टन का परमाणु सिद्धान्त | `atlas` | — |
| [ ] 4 | 9.4 | Molecules of elements | तत्वों के अणु | `atlas` | — |
| [ ] 5 | 9.5 | Molecules of covalent compounds | सहसंयोजक यौगिकों के अणु | `atlas` | — |
| [ ] 6 | 9.6 | Ions and ionic compounds | आयन और आयनिक यौगिक | `atlas` | — |
| [ ] 7 | 9.7 | Writing chemical formulae | रासायनिक सूत्र लिखना | `atlas` | — |
| [ ] 8 | 9.8 | Molecular mass | अणु द्रव्यमान | `atlas` | — |
| [ ] 9 | 9.9 | Formula unit mass | सूत्र इकाई द्रव्यमान | `atlas` | — |

### Class IX — Sound Waves: Characteristics and Applications (`c9_sound`) — 10 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 10.1 | Sound is produced by vibration | ध्वनि कम्पन से उत्पन्न होती है | `atlas` | — |
| [ ] 2 | 10.2 | Sound needs a material medium | ध्वनि को माध्यम चाहिए | `atlas` | — |
| [ ] 3 | 10.3 | Longitudinal propagation and compressions | अनुदैर्घ्य संचरण और संपीडन | `atlas` | — |
| [ ] 4 | 10.4 | Graphical representation of a sound wave | ध्वनि तरंग का आलेखीय निरूपण | `atlas` | — |
| [ ] 5 | 10.5 | Wavelength, frequency and time period | तरंगदैर्घ्य, आवृत्ति और आवर्तकाल | `atlas` | — |
| [ ] 6 | 10.6 | Amplitude, intensity and speed | आयाम, तीव्रता और चाल | `atlas` | — |
| [ ] 7 | 10.7 | Wave speed v = fλ | तरंग चाल v = fλ | `atlas` | — |
| [ ] 8 | 10.8 | Sound in solids and liquids | ठोस और द्रव में ध्वनि | `atlas` | — |
| [ ] 9 | 10.9 | Reflection, echo and reverberation | परावर्तन, प्रतिध्वनि और अनुरणन | `atlas` | — |
| [ ] 10 | 10.10 | Pitch, loudness and echolocation | तारत्व, प्रबलता और प्रतिध्वनि-स्थिति | `atlas` | — |

### Class IX — Patterns in Life: Diversity and Classification (`c9_diversity`) — 8 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 12.1 | Why classification is needed | वर्गीकरण क्यों आवश्यक है | `atlas` | — |
| [ ] 2 | 12.2 | Five kingdoms and their features | पाँच जगत और उनके लक्षण | `atlas` | — |
| [ ] 3 | 12.3 | Monera, Protista and Fungi | मोनेरा, प्रोटिस्टा और फंजाई | `atlas` | — |
| [ ] 4 | 12.4 | Major divisions of plants | पादपों के प्रमुख विभाग | `atlas` | — |
| [ ] 5 | 12.5 | Major divisions of animals | प्राणियों के प्रमुख विभाग | `atlas` | — |
| [ ] 6 | 12.6 | Binomial nomenclature | द्विनाम पद्धति | `atlas` | — |
| [ ] 7 | 12.7 | Hierarchy of taxonomic ranks | वर्गीकरण श्रेणियों का पदानुक्रम | `atlas` | — |
| [ ] 8 | 12.8 | Acellular entities: viruses | अकोशिकीय सत्ताएँ: विषाणु | `atlas` | — |

### Class IX — Earth as a System: Energy, Matter, and Life (`c9_earth`) — 9 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 13.1 | Earth as an interconnected system | पृथ्वी एक परस्पर जुड़ा तंत्र | `atlas` | — |
| [ ] 2 | 13.2 | Solar radiation and the electromagnetic spectrum | सौर विकिरण और विद्युतचुम्बकीय वर्णक्रम | `atlas` | — |
| [ ] 3 | 13.3 | Interaction with the surface and differential heating | सतह से अंतःक्रिया और असमान तापन | `atlas` | — |
| [ ] 4 | 13.4 | Winds from differential warming | असमान तापन से पवनें | `atlas` | — |
| [ ] 5 | 13.5 | The water cycle | जल चक्र | `atlas` | — |
| [ ] 6 | 13.6 | The carbon cycle | कार्बन चक्र | `atlas` | — |
| [ ] 7 | 13.7 | The nitrogen cycle | नाइट्रोजन चक्र | `atlas` | — |
| [ ] 8 | 13.8 | The oxygen cycle | ऑक्सीजन चक्र | `atlas` | — |
| [ ] 9 | 13.9 | Human impact on Earth's system | पृथ्वी तंत्र पर मानव प्रभाव | `atlas` | — |

### Class X — Chemical Reactions and Equations (`c10_reactions`) — 9 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 1.1 | Chemical changes and their evidence | रासायनिक परिवर्तन और उसके संकेत | `atlas` | — |
| [ ] 2 | 1.2 | Writing and balancing equations | समीकरण लिखना और संतुलित करना | `atlas` | — |
| [ ] 3 | 1.3 | Combination reactions | संयोजन अभिक्रियाएँ | `atlas` | — |
| [ ] 4 | 1.4 | Decomposition reactions | विघटन अभिक्रियाएँ | `atlas` | — |
| [ ] 5 | 1.5 | Displacement and double displacement | विस्थापन और द्वि-विस्थापन | `atlas` | — |
| [ ] 6 | 1.6 | Precipitation reactions | अवक्षेप अभिक्रियाएँ | `atlas` | — |
| [ ] 7 | 1.7 | Oxidation and reduction | ऑक्सीकरण और अपचयन | `atlas` | — |
| [ ] 8 | 1.8 | Exothermic and endothermic reactions | ऊष्माक्षेपी और ऊष्माशोषी अभिक्रियाएँ | `atlas` | — |
| [ ] 9 | 1.9 | Corrosion and rancidity | संक्षारण और विकृतगंधता | `atlas` | — |

### Class X — Acids, Bases and Salts (`c10_acids`) — 9 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 2.1 | Acids and bases: properties | अम्ल और क्षार के गुण | `atlas` | — |
| [ ] 2 | 2.2 | H+ and OH- ions in water | जल में H+ और OH- आयन | `atlas` | — |
| [ ] 3 | 2.3 | Indicators and their colours | सूचक और उनके रंग | `atlas` | — |
| [ ] 4 | 2.4 | Neutralisation and salt formation | उदासीनीकरण और लवण निर्माण | `atlas` | — |
| [ ] 5 | 2.5 | The pH scale and its importance | pH पैमाना और उसका महत्व | `atlas` | — |
| [ ] 6 | 2.6 | pH in everyday life | दैनिक जीवन में पीएच | `atlas` | — |
| [ ] 7 | 2.7 | Common salt and sodium hydroxide | साधारण नमक और सोडियम हाइड्रॉक्साइड | `atlas` | — |
| [ ] 8 | 2.8 | Bleaching powder, baking soda and washing soda | विरंजक चूर्ण, खाने का सोडा और धोने का सोडा | `atlas` | — |
| [ ] 9 | 2.9 | Plaster of Paris and water of crystallisation | प्लास्टर ऑफ़ पेरिस और क्रिस्टलन जल | `atlas` | — |

### Class X — Metals and Non-metals (`c10_metals`) — 8 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 3.1 | Physical properties of metals and non-metals | धातु और अधातु के भौतिक गुण | `atlas` | — |
| [ ] 2 | 3.2 | Chemical properties: oxygen, water and acids | रासायनिक गुण: ऑक्सीजन, जल और अम्ल | `atlas` | — |
| [ ] 3 | 3.3 | Amphoteric oxides and the reactivity series | उभयधर्मी ऑक्साइड और क्रियाशीलता श्रेणी | `atlas` | — |
| [ ] 4 | 3.4 | Ionic compounds and their properties | आयनिक यौगिक और उनके गुण | `atlas` | — |
| [ ] 5 | 3.5 | Occurrence and extraction of metals | धातुओं की प्राप्ति और निष्कर्षण | `atlas` | — |
| [ ] 6 | 3.6 | Refining and electrolytic purification | शोधन और वैद्युत परिष्करण | `atlas` | — |
| [ ] 7 | 3.7 | Corrosion and its prevention | संक्षारण और उसकी रोकथाम | `atlas` | — |
| [ ] 8 | 3.8 | Alloys and their uses | मिश्रधातुएँ और उनके उपयोग | `atlas` | — |

### Class X — Carbon and its Compounds (`c10_carbon`) — 16 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 4.1 | Carbon shares, it does not swap electrons<br>Pack: 4.1 Bonding in carbon · covalent bond | कार्बन इलेक्ट्रॉन साझा करता है, बदलता नहीं<br>Pack: 4.1 कार्बन में बंधन · सहसंयोजी बंध | `covalent` | — |
| [ ] 2 | 4.1b | One element, three structures<br>Pack: Allotropes · diamond, graphite, C₆₀ | एक तत्व, तीन संरचनाएँ<br>Pack: अपररूप · हीरा, ग्रेफाइट, C₆₀ | `allotrope` | — |
| [ ] 3 | 4.2 | Why carbon makes millions of compounds<br>Pack: 4.2 Versatile nature · catenation | कार्बन लाखों यौगिक क्यों बनाता है<br>Pack: 4.2 कार्बन की बहुमुखता · शृंखलन | `catenation` | — |
| [ ] 4 | 4.2.1 | Single, double and triple bonds<br>Pack: 4.2.1 Saturated / unsaturated | एकल, द्वि और त्रि बंध<br>Pack: 4.2.1 संतृप्त / असंतृप्त | `bondorder` | — |
| [ ] 5 | 4.2.2 | Chains, branches and rings<br>Pack: 4.2.2 Chains, branches, rings | शृंखला, शाखाएँ और वलय<br>Pack: 4.2.2 शृंखला, शाखाएँ, वलय | `isomer` | — |
| [ ] 6 | 4.2.3 | A functional group changes everything<br>Pack: 4.2.3 Functional groups | क्रियात्मक समूह सब बदल देता है<br>Pack: 4.2.3 क्रियात्मक समूह | `functional` | — |
| [ ] 7 | 4.2.4 | The CH₂ ladder<br>Pack: 4.2.4 Homologous series | CH₂ की सीढ़ी<br>Pack: 4.2.4 समजात श्रेणी | `homologous` | — |
| [ ] 8 | 4.2.5 | Naming a carbon compound<br>Pack: 4.2.5 Nomenclature | कार्बन यौगिक का नामकरण<br>Pack: 4.2.5 नामकरण | `nomenclature` | — |
| [ ] 9 | 4.3.1 | Clean blue flame or sooty yellow?<br>Pack: 4.3.1 Combustion | नीली ज्वाला या कालिख वाली पीली?<br>Pack: 4.3.1 दहन | `combustion` | — |
| [ ] 10 | 4.3.2 | Ethanol becomes ethanoic acid<br>Pack: 4.3.2 Oxidation | एथेनॉल से एथेनोइक अम्ल<br>Pack: 4.3.2 ऑक्सीकरण | `oxidation` | — |
| [ ] 11 | 4.3.3 | Addition across the double bond<br>Pack: 4.3.3 Addition · hydrogenation | द्वि-बंध पर योग अभिक्रिया<br>Pack: 4.3.3 योग · हाइड्रोजनीकरण | `hydrogenation` | — |
| [ ] 12 | 4.3.4 | Chlorine replaces hydrogen<br>Pack: 4.3.4 Substitution | क्लोरीन हाइड्रोजन को हटाता है<br>Pack: 4.3.4 प्रतिस्थापन | `substitution` | — |
| [ ] 13 | 4.4.1 | Ethanol: two reactions to know<br>Pack: 4.4.1 Ethanol | एथेनॉल: दो मुख्य अभिक्रियाएँ<br>Pack: 4.4.1 एथेनॉल | `ethanol` | — |
| [ ] 14 | 4.4.2 | Weak acid, four tests<br>Pack: 4.4.2 Ethanoic acid | दुर्बल अम्ल, चार परीक्षण<br>Pack: 4.4.2 एथेनोइक अम्ल | `ethanoic` | — |
| [ ] 15 | 4.4.2b | Sweet-smelling esters and soap<br>Pack: Esterification & saponification | मीठी गंध वाले एस्टर और साबुन<br>Pack: एस्टरीकरण व साबुनीकरण | `ester` | — |
| [ ] 16 | 4.5 | How soap lifts oily dirt<br>Pack: 4.5 Soaps & detergents | साबुन चिकना मैल कैसे उठाता है<br>Pack: 4.5 साबुन व अपमार्जक | `micelle` | — |

### Class X — Heredity (`c10_heredity`) — 7 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 8.1 | Inheritance and variation | आनुवंशिकता और विभिन्नता | `atlas` | — |
| [ ] 2 | 8.2 | Mendel and his pea experiments | मेंडेल और मटर के प्रयोग | `atlas` | — |
| [ ] 3 | 8.3 | Monohybrid cross and law of segregation | एकसंकर संकरण और पृथक्करण का नियम | `atlas` | — |
| [ ] 4 | 8.4 | Dihybrid cross and independent assortment | द्विसंकर संकरण और स्वतंत्र अपव्यूहन | `atlas` | — |
| [ ] 5 | 8.5 | Dominant and recessive traits | प्रभावी और अप्रभावी लक्षण | `atlas` | — |
| [ ] 6 | 8.6 | Sex determination | लिंग निर्धारण | `atlas` | — |
| [ ] 7 | 8.7 | Evolution: formative only, not board-assessed | विकास: केवल सृजनात्मक मूल्यांकन, बोर्ड परीक्षा में नहीं | `atlas` | — |

### Class X — Light – Reflection and Refraction (`c10_light`) — 10 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 9.1 | Light travels in rays · laws of reflection<br>Pack: 9.1 Reflection of light · laws | प्रकाश किरणों में चलता है · परावर्तन के नियम<br>Pack: 9.1 प्रकाश का परावर्तन · नियम | `reflection` | — |
| [ ] 2 | 9.2 | Spherical mirrors · pole, focus, R = 2f<br>Pack: 9.2 Spherical mirrors · R = 2f | गोलीय दर्पण · ध्रुव, फोकस, R = 2f<br>Pack: 9.2 गोलीय दर्पण · R = 2f | `mirror` | — |
| [ ] 3 | 9.2.1 | Concave mirror · Table 9.1 of images<br>Pack: 9.2.1 Image by concave mirror | अवतल दर्पण · प्रतिबिम्ब सारणी 9.1<br>Pack: 9.2.1 अवतल दर्पण से प्रतिबिम्ब | `mirror` | — |
| [ ] 4 | 9.2.2 | Convex mirror · rear-view and full field<br>Pack: 9.2.2 Ray diagrams · convex mirror | उत्तल दर्पण · रियर-व्यू व विस्तृत दृश्य<br>Pack: 9.2.2 किरण आरेख · उत्तल दर्पण | `mirror` | — |
| [ ] 5 | 9.2.4 | Mirror formula & magnification<br>Pack: 9.2.4 Mirror formula & m | दर्पण सूत्र व आवर्धन<br>Pack: 9.2.4 दर्पण सूत्र व आवर्धन | `mirrorformula` | — |
| [ ] 6 | 9.3 | Refraction & refractive index · Snell's law<br>Pack: 9.3 Refraction · refractive index | अपवर्तन व अपवर्तनांक · स्नेल का नियम<br>Pack: 9.3 अपवर्तन · अपवर्तनांक | `slab` | — |
| [ ] 7 | 9.3.1 | Rectangular glass slab · lateral shift<br>Pack: 9.3.1 Rectangular glass slab | आयताकार काँच की पट्टी · पार्श्व विस्थापन<br>Pack: 9.3.1 आयताकार काँच की पट्टी | `slab` | — |
| [ ] 8 | 9.3.3 | Spherical lenses · converging and diverging<br>Pack: 9.3.3 Spherical lenses | गोलीय लेंस · अभिसारी व अपसारी<br>Pack: 9.3.3 गोलीय लेंस | `lens` | — |
| [ ] 9 | 9.3.7 | Lens formula, magnification & sign convention<br>Pack: 9.3.7 Lens formula & m | लेंस सूत्र, आवर्धन व चिह्न परिपाटी<br>Pack: 9.3.7 लेंस सूत्र व आवर्धन | `lensformula` | — |
| [ ] 10 | 9.3.8 | Power of a lens · dioptre & combinations<br>Pack: 9.3.8 Power of a lens · dioptre | लेंस की क्षमता · डायोप्टर व संयोजन<br>Pack: 9.3.8 लेंस की क्षमता · डायोप्टर | `lenspower` | — |

### Class X — The Human Eye and the Colourful World (`c10_eye`) — 8 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 10.1 | Structure of the human eye | मानव नेत्र की संरचना | `atlas` | — |
| [ ] 2 | 10.2 | Accommodation and near point | समंजन और निकट बिंदु | `atlas` | — |
| [ ] 3 | 10.3 | Myopia and its correction | निकटदृष्टि और उसका सुधार | `atlas` | — |
| [ ] 4 | 10.4 | Hypermetropia and presbyopia | दूरदृष्टि और जरादूरदृष्टि | `atlas` | — |
| [ ] 5 | 10.5 | Refraction through a prism | प्रिज़्म से अपवर्तन | `atlas` | — |
| [ ] 6 | 10.6 | Dispersion and spectrum | विक्षेपण और वर्णक्रम | `atlas` | — |
| [ ] 7 | 10.7 | Scattering and the Tyndall effect | प्रकीर्णन और टिण्डल प्रभाव | `atlas` | — |
| [ ] 8 | 10.8 | Twinkling, planets and atmospheric refraction | टिमटिमाहट, ग्रह और वायुमंडलीय अपवर्तन | `atlas` | — |

### Class X — Electricity (`c10_electricity`) — 9 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 11.1 | Electric current and potential difference | विद्युत धारा और विभवांतर | `atlas` | — |
| [ ] 2 | 11.2 | Circuit symbols and diagrams | परिपथ प्रतीक और आरेख | `atlas` | — |
| [ ] 3 | 11.3 | Ohm's law and its graph | ओम का नियम और उसका आलेख | `atlas` | — |
| [ ] 4 | 11.4 | Resistance and resistivity | प्रतिरोध और प्रतिरोधकता | `atlas` | — |
| [ ] 5 | 11.5 | Series combination of resistors | प्रतिरोधकों का श्रेणीक्रम संयोजन | `atlas` | — |
| [ ] 6 | 11.6 | Parallel combination of resistors | प्रतिरोधकों का समान्तर संयोजन | `atlas` | — |
| [ ] 7 | 11.7 | Heating effect and Joule's law | ऊष्मीय प्रभाव और जूल का नियम | `atlas` | — |
| [ ] 8 | 11.8 | Electric power and energy | विद्युत शक्ति और ऊर्जा | `atlas` | — |
| [ ] 9 | 11.9 | Domestic circuits and safety | घरेलू परिपथ और सुरक्षा | `atlas` | — |

### Class X — Magnetic Effects of Electric Current (`c10_magnetism`) — 9 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 12.1 | Magnetic field and field lines | चुम्बकीय क्षेत्र और क्षेत्र रेखाएँ | `atlas` | — |
| [ ] 2 | 12.2 | Field due to a straight current-carrying conductor | सीधे धारावाही चालक का क्षेत्र | `atlas` | — |
| [ ] 3 | 12.3 | Right-hand thumb rule | दाहिने हाथ के अँगूठे का नियम | `atlas` | — |
| [ ] 4 | 12.4 | Field due to a circular loop and solenoid | वृत्ताकार कुंडली और सोलेनॉइड का क्षेत्र | `atlas` | — |
| [ ] 5 | 12.5 | Force on a current-carrying conductor | धारावाही चालक पर बल | `atlas` | — |
| [ ] 6 | 12.6 | Fleming's left-hand rule | फ़्लेमिंग का बायाँ-हाथ नियम | `atlas` | — |
| [ ] 7 | 12.7 | Direct and alternating current | दिष्ट और प्रत्यावर्ती धारा | `atlas` | — |
| [ ] 8 | 12.8 | Domestic wiring, earthing and fuse | घरेलू तार-व्यवस्था, अर्थिंग और फ़्यूज़ | `atlas` | — |
| [ ] 9 | 12.9 | Electric motor, induction and generator: formative only | विद्युत मोटर, प्रेरण और जनित्र: केवल सृजनात्मक | `atlas` | — |

### Class X — Life Processes (`c10_life`) — 9 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 5.1 | Nutrition and autotrophic mode | पोषण और स्वपोषी पद्धति | `atlas` | — |
| [ ] 2 | 5.2 | Photosynthesis and chlorophyll | प्रकाश-संश्लेषण और क्लोरोफ़िल | `atlas` | — |
| [ ] 3 | 5.3 | Heterotrophic nutrition | विषमपोषी पोषण | `atlas` | — |
| [ ] 4 | 5.4 | Digestion in humans | मानव में पाचन | `atlas` | — |
| [ ] 5 | 5.5 | Aerobic and anaerobic respiration | वायवीय और अवायवीय श्वसन | `atlas` | — |
| [ ] 6 | 5.6 | Human respiratory system | मानव श्वसन तंत्र | `atlas` | — |
| [ ] 7 | 5.7 | Transport in plants | पादपों में परिवहन | `atlas` | — |
| [ ] 8 | 5.8 | Human circulatory system | मानव परिसंचरण तंत्र | `atlas` | — |
| [ ] 9 | 5.9 | Excretion in plants and humans | पादपों और मानव में उत्सर्जन | `atlas` | — |

### Class X — Control and Coordination (`c10_control`) — 8 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 6.1 | Tropic movements in plants | पादपों में अनुवर्ती गतियाँ | `atlas` | — |
| [ ] 2 | 6.2 | Plant hormones | पादप हॉर्मोन | `atlas` | — |
| [ ] 3 | 6.3 | Nervous system and neuron | तंत्रिका तंत्र और न्यूरॉन | `atlas` | — |
| [ ] 4 | 6.4 | Reflex action and reflex arc | प्रतिवर्त क्रिया और प्रतिवर्त चाप | `atlas` | — |
| [ ] 5 | 6.5 | Human brain and its parts | मानव मस्तिष्क और उसके भाग | `atlas` | — |
| [ ] 6 | 6.6 | Voluntary, involuntary and autonomic actions | ऐच्छिक, अनैच्छिक और स्वायत्त क्रियाएँ | `atlas` | — |
| [ ] 7 | 6.7 | Endocrine glands and animal hormones | अंतःस्रावी ग्रंथियाँ और जन्तु हॉर्मोन | `atlas` | — |
| [ ] 8 | 6.8 | Feedback control and coordination | पुनर्निवेश नियंत्रण और समन्वय | `atlas` | — |

### Class X — How do Organisms Reproduce? (`c10_repro`) — 9 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 7.1 | Variation and the need for reproduction | विभिन्नता और जनन की आवश्यकता | `atlas` | — |
| [ ] 2 | 7.2 | Asexual reproduction: fission, budding, regeneration | अलैंगिक जनन: विखंडन, मुकुलन, पुनर्जनन | `atlas` | — |
| [ ] 3 | 7.3 | Vegetative propagation and tissue culture | वानस्पतिक प्रवर्धन और ऊतक संवर्धन | `atlas` | — |
| [ ] 4 | 7.4 | Sexual reproduction in flowering plants | पुष्पी पादपों में लैंगिक जनन | `atlas` | — |
| [ ] 5 | 7.5 | Human male reproductive system | मानव नर जनन तंत्र | `atlas` | — |
| [ ] 6 | 7.6 | Human female reproductive system | मानव मादा जनन तंत्र | `atlas` | — |
| [ ] 7 | 7.7 | Fertilisation, embryo and menstrual cycle | निषेचन, भ्रूण और मासिक चक्र | `atlas` | — |
| [ ] 8 | 7.8 | Reproductive health and contraception | जनन स्वास्थ्य और गर्भनिरोध | `atlas` | — |
| [ ] 9 | 7.9 | HIV, AIDS and women's health | HIV, AIDS और महिला स्वास्थ्य | `atlas` | — |

### Class X — Our Environment (`c10_env`) — 7 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 13.1 | Ecosystem and its components | पारिस्थितिक तंत्र और उसके घटक | `atlas` | — |
| [ ] 2 | 13.2 | Food chains, webs and trophic levels | आहार श्रृंखला, जाल और पोषी स्तर | `atlas` | — |
| [ ] 3 | 13.3 | Ten percent law and energy flow | दस प्रतिशत नियम और ऊर्जा प्रवाह | `atlas` | — |
| [ ] 4 | 13.4 | Biological magnification | जैव-आवर्धन | `atlas` | — |
| [ ] 5 | 13.5 | Ozone layer and its depletion | ओज़ोन परत और उसका क्षरण | `atlas` | — |
| [ ] 6 | 13.6 | Waste: biodegradable and non-biodegradable | अपशिष्ट: जैव-अपघटनीय और अनपघटनीय | `atlas` | — |
| [ ] 7 | 13.7 | Reduce, reuse, recycle and our role | कम करें, पुनः उपयोग, पुनर्चक्रण और हमारी भूमिका | `atlas` | — |

## Additional student chapters not named in the request

### Class IX — Exploration: Entering the World of Secondary Science (`c9_exploration`) — 6 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 1.1 | Science begins with observation | विज्ञान प्रेक्षण से शुरू होता है | `atlas` | — |
| [ ] 2 | 1.2 | Focused questions guide investigation | केन्द्रित प्रश्न जाँच का मार्ग दिखाते हैं | `atlas` | — |
| [ ] 3 | 1.3 | Scientific language must be precise | वैज्ञानिक भाषा सटीक होनी चाहिए | `atlas` | — |
| [ ] 4 | 1.4 | Experiments produce evidence | प्रयोग प्रमाण देते हैं | `atlas` | — |
| [ ] 5 | 1.5 | Models connect the unseen to the seen | प्रतिरूप अदृश्य को दृश्य से जोड़ते हैं | `atlas` | — |
| [ ] 6 | 1.6 | Science links mathematics, technology and society | विज्ञान गणित, तकनीक और समाज को जोड़ता है | `atlas` | — |

### Class IX — Reproduction: How Life Continues (`c9_reproduction9`) — 9 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 11.1 | Asexual reproduction | अलैंगिक जनन | `atlas` | — |
| [ ] 2 | 11.2 | Budding, fragmentation and spores | मुकुलन, खंडन और बीजाणु | `atlas` | — |
| [ ] 3 | 11.3 | Vegetative propagation | वानस्पतिक प्रवर्धन | `atlas` | — |
| [ ] 4 | 11.4 | Flower and its parts | पुष्प और उसके भाग | `atlas` | — |
| [ ] 5 | 11.5 | Pollination and fertilisation in plants | पादपों में परागण और निषेचन | `atlas` | — |
| [ ] 6 | 11.6 | Seed dispersal and germination | बीज प्रकीर्णन और अंकुरण | `atlas` | — |
| [ ] 7 | 11.7 | Human male and female reproductive systems | मानव नर और मादा जनन तंत्र | `atlas` | — |
| [ ] 8 | 11.8 | Gametes, menstrual cycle and pregnancy | युग्मक, मासिक चक्र और गर्भावस्था | `atlas` | — |
| [ ] 9 | 11.9 | Reproductive health, hygiene and birth control | जनन स्वास्थ्य, स्वच्छता और जन्म नियंत्रन | `atlas` | — |

## Additional reference chapters

### Class X — Periodic Classification of Elements (formative only) (`c10_periodic`) — 5 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | P.1 | Döbereiner's triads | डोबेराइनर के त्रिक | `atlas` | — |
| [ ] 2 | P.2 | Newlands' law of octaves | न्यूलैंड का अष्टक नियम | `atlas` | — |
| [ ] 3 | P.3 | Mendeleev's periodic table | मेंडेलीफ़ की आवर्त सारणी | `atlas` | — |
| [ ] 4 | P.4 | The modern periodic law | आधुनिक आवर्त नियम | `atlas` | — |
| [ ] 5 | P.5 | Trends in the modern table | आधुनिक सारणी में प्रवृत्तियाँ | `atlas` | — |

### Class X — Sources of Energy (outside 2026-27 syllabus) (`c10_sources`) — 4 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | S.1 | Conventional and non-conventional sources | परंपरागत और अपरंपरागत स्रोत | `atlas` | — |
| [ ] 2 | S.2 | Solar energy, panels and cookers | सौर ऊर्जा, पैनल और चूल्हा | `atlas` | — |
| [ ] 3 | S.3 | Wind, hydro and tidal energy | पवन, जल और ज्वारीय ऊर्जा | `atlas` | — |
| [ ] 4 | S.4 | Biomass, biogas and nuclear energy | जैवभार, बायोगैस और नाभिकीय ऊर्जा | `atlas` | — |

### Class X — Sustainable Management of Natural Resources (outside 2026-27) (`c10_sustainable`) — 4 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | M.1 | Why manage resources sustainably | सतत प्रबंधन क्यों | `atlas` | — |
| [ ] 2 | M.2 | Forest and wildlife conservation | वन और वन्यजीव संरक्षण | `atlas` | — |
| [ ] 3 | M.3 | Water harvesting and watershed management | जल संचयन और जलग्रहण प्रबंधन | `atlas` | — |
| [ ] 4 | M.4 | Coal, petroleum and the 3Rs | कोयला, पेट्रोलियम और तीन R | `atlas` | — |

## Tools-shelf-only entries

### Class IX — Matter in Our Surroundings (`c9_matter`) — 4 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 1.1 | Matter is made of particles | पदार्थ कणों से बना है | `particles` | — |
| [ ] 2 | 1.2 | Diffusion and intermingling | विसरण और मिश्रण | `diffusion` | — |
| [ ] 3 | 1.4 | Evaporation and cooling | वाष्पीकरण और शीतलता | `plot` | — |
| [ ] 4 | 1.3 | States of matter compared | पदार्थ की अवस्थाएँ | `race` | — |

### Class IX — Is Matter Around Us Pure (`c9_pure`) — 3 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 1 | - | - | `showcase` | — |
| [ ] 2 | 2 | Concept 2 | Concept 2 | `showcase` | — |
| [ ] 3 | 3 | Concept 3 | Concept 3 | `showcase` | — |

### Class IX — Atoms and Molecules (`c9_atoms`) — 3 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 1 | Atoms and Molecules | Atoms and Molecules | `molecule` | — |
| [ ] 2 | 2 | Concept 2 | Concept 2 | `showcase` | — |
| [ ] 3 | 3 | Concept 3 | Concept 3 | `showcase` | — |

### Class IX — Why Do We Fall Ill (`c9_disease`) — 3 spreads

| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |
|---:|---|---|---|---|---|
| [ ] 1 | 1 | Why Do We Fall Ill | Why Do We Fall Ill | `showcase` | — |
| [ ] 2 | 2 | Concept 2 | Concept 2 | `showcase` | — |
| [ ] 3 | 3 | Concept 3 | Concept 3 | `showcase` | — |

## Data files

- `COMPLETE_TOPIC_CHECKLIST.csv`: same 266 rows with scope, section, runtime and pack titles, scene, pack-block presence, and current 2D status.
- `runtime_inventory.json`: raw runtime scene records, useful for investigating the underlying scene labels and controls.

**Review boundary:** topic titles and labels are transcribed from the app and packs, not certified against a CBSE/NCERT source. No teacher-team or final owner sign-off is implied.
