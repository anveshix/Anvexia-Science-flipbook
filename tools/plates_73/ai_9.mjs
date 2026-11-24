// tools/plates_73/ai_9.mjs
// Verified pixel-anchored bilingual labels for the 9 high-resolution AI 3D plates.
import { makeLabels } from "./kit.mjs";

export const AI_9_PLATES = [
  {
    id: "biomolecules_cell",
    wid: "c9_cell",
    sec: "2.10",
    marks: makeLabels([
      {
        x: 205, y: 520,
        en: "Carbohydrate Chain", hi: "कार्बोहाइड्रेट शृंखला",
        info_en: "Polysaccharide chains of glucose monomers store cellular energy and build structural walls.",
        info_hi: "ग्लूकोज़ इकाइयों से बनी पॉलीसैकेराइड शृंखलाएँ कोशिकीय ऊर्जा संचित करती हैं और संरचना बनाती हैं।"
      },
      {
        x: 540, y: 470,
        en: "Folded Protein", hi: "वलित प्रोटीन",
        info_en: "Amino-acid chains fold into 3D alpha-helices and sheets that catalyse reactions as enzymes and build cell machinery.",
        info_hi: "अमीनो अम्ल शृंखलाएँ 3D संरचना में मुड़कर एंज़ाइम के रूप में जैव-अभिक्रियाएँ चलाती हैं।"
      },
      {
        x: 882, y: 465,
        en: "Phospholipid Bilayer", hi: "फॉस्फोलिपिड द्विपरत",
        info_en: "Hydrophilic heads face water while hydrophobic fatty-acid tails form the selectively permeable cell membrane core.",
        info_hi: "जलरागी सिरे बाहर तथा जलविरागी वसा-अम्ल पूँछें भीतर रहकर अर्धपारगम्य कोशिका झिल्ली बनाती हैं।"
      },
      {
        x: 1210, y: 460,
        en: "Nucleic Acid (DNA)", hi: "न्यूक्लिक अम्ल (DNA)",
        info_en: "Double-helical DNA stores hereditary instructions that direct RNA synthesis and protein assembly.",
        info_hi: "द्विकुंडलित DNA आनुवंशिक सूचना संचित रखता है और प्रोटीन निर्माण का निर्देशन करता है।"
      }
    ])
  },
  {
    id: "meristematic_tissues",
    wid: "c9_tissues",
    sec: "3.3",
    marks: makeLabels([
      {
        x: 330, y: 610,
        en: "Lateral Meristem", hi: "पार्श्व विभज्योतक",
        info_en: "Cylindrical cambium rings divide radially to increase the girth (secondary thickness) of stems and roots.",
        info_hi: "कैम्बियम वलय अरीय विभाजन द्वारा तने और जड़ की मोटाई (परिधि) बढ़ाता है।"
      },
      {
        x: 780, y: 515,
        en: "Intercalary Meristem", hi: "अंतर्वेशी विभज्योतक",
        info_en: "Located near nodes and leaf bases, intercalary meristem elongates internodes rapidly in grasses and shoots.",
        info_hi: "पर्वसंधि और पत्ती के आधार पर स्थित अंतर्वेशी विभज्योतक पर्वों की लंबाई बढ़ाता है।"
      },
      {
        x: 1065, y: 235,
        en: "Apical Meristem", hi: "शीर्षस्थ विभज्योतक",
        info_en: "Actively dividing cells at root and shoot tips drive primary growth in plant length.",
        info_hi: "प्ररोह और जड़ के शीर्ष पर निरंतर विभाजित होकर पौधे की प्राथमिक लंबाई बढ़ाता है।"
      },
      {
        x: 1175, y: 615,
        en: "Dividing Cells", hi: "विभाजनशील कोशिकाएँ",
        info_en: "Meristematic cells have thin cellulose walls, dense cytoplasm, prominent nuclei and lack vacuoles.",
        info_hi: "इन कोशिकाओं में पतली सेलुलोज़ भित्ति, सघन कोशिकाद्रव्य व बड़ा केंद्रक होता है तथा रसधानी नहीं होती।"
      }
    ])
  },
  {
    id: "simple_permanent_tissues",
    wid: "c9_tissues",
    sec: "3.4",
    marks: makeLabels([
      {
        x: 225, y: 445,
        en: "Parenchyma", hi: "मृदुतक (पैरेन्काइमा)",
        info_en: "Living thin-walled unspecialised cells with loose intercellular air spaces that store food and nutrients.",
        info_hi: "पतली भित्ति व अंतरकोशिकीय स्थान वाली जीवित कोशिकाएँ जो भोजन संचय करती हैं।"
      },
      {
        x: 410, y: 515,
        en: "Large Central Vacuole", hi: "बड़ी केन्द्रीय रसधानी",
        info_en: "Turgid central vacuoles maintain osmotic pressure and cushion soft plant organs.",
        info_hi: "स्फीत केन्द्रीय रसधानी कोमल पादप भागों को सहारा और जल संतुलन देती है।"
      },
      {
        x: 700, y: 455,
        en: "Collenchyma", hi: "स्थूलकोण ऊतक",
        info_en: "Elongated living cells irregularly thickened at corners provide flexible mechanical support without breaking.",
        info_hi: "कोनों पर मोटी भित्ति वाली जीवित कोशिकाएँ पत्तियों व तनों को लचीला यांत्रिक सहारा देती हैं।"
      },
      {
        x: 1140, y: 465,
        en: "Sclerenchyma", hi: "दृढ़ोतक (स्क्लेरेन्काइमा)",
        info_en: "Dead cells with thick lignified secondary walls and narrow lumen give hard, rigid structural strength.",
        info_hi: "लिग्निन से मोटी भित्ति वाली मृत कोशिकाएँ पौधे को कठोरता और दृढ़ मजबूती प्रदान करती हैं।"
      }
    ])
  },
  {
    id: "phloem_translocation",
    wid: "c9_tissues",
    sec: "3.6",
    marks: makeLabels([
      {
        x: 165, y: 460,
        en: "Phloem Parenchyma", hi: "फ्लोएम मृदुतक",
        info_en: "Living thin-walled parenchyma cells alongside sieve tubes store starch, radial solutes and organic compounds.",
        info_hi: "चालनी नलिकाओं के पास स्थित जीवित मृदुतक कोशिकाएँ स्टार्च और कार्बनिक भोज्य पदार्थ संचित करती हैं।"
      },
      {
        x: 525, y: 435,
        en: "Sieve Tube & Plate", hi: "चालनी नलिका व पट्टिका",
        info_en: "Tubular living elements joined end-to-end across perforated sieve plates translocate sucrose both upward and downward.",
        info_hi: "छिद्रित चालनी पट्टिकाओं से जुड़ी नलिकाएँ पत्तियों से बने शर्करा भोजन को ऊपर व नीचे ले जाती हैं।"
      },
      {
        x: 875, y: 470,
        en: "Companion Cell", hi: "सहचर कोशिका",
        info_en: "Nucleated mitochondria-rich cell linked via plasmodesmata that supplies ATP to load sugars into the sieve tube.",
        info_hi: "केंद्रक व सूत्रकणिका से युक्त सहचर कोशिका ATP ऊर्जा देकर चालनी नलिका में शर्करा परिवहन नियंत्रित करती है।"
      },
      {
        x: 1215, y: 455,
        en: "Phloem Fibres", hi: "फ्लोएम रेशे",
        info_en: "Thick-walled dead sclerenchymatous bast fibres give tensile mechanical strength to the vascular bundle.",
        info_hi: "मोटी भित्ति वाले मृत दृढ़ोतकी फ्लोएम रेशे संवहन पूल को यांत्रिक दृढ़ता प्रदान करते हैं।"
      }
    ])
  },
  {
    id: "disease_transmission_modes",
    wid: "c9_disease",
    sec: "2",
    marks: makeLabels([
      {
        x: 205, y: 545,
        en: "Airborne Droplets", hi: "वायुजनित सूक्ष्म बूँदें",
        info_en: "Coughing or sneezing expels microscopic aerosol droplets that transmit respiratory microbes such as cold, influenza and TB.",
        info_hi: "खाँसने या छींकने से निकली सूक्ष्म बूँदें जुकाम, इन्फ्लुएंजा और क्षय रोग जैसे वायुजनित संक्रमण फैलाती हैं।"
      },
      {
        x: 540, y: 555,
        en: "Contaminated Water", hi: "संदूषित जल व भोजन",
        info_en: "Pathogenic bacteria and protozoa in untreated drinking water spread cholera, typhoid and dysentery.",
        info_hi: "अशुद्ध पेयजल में उपस्थित जीवाणु हैज़ा, टाइफ़ॉइड और पेचिश जैसे जलजनित रोग फैलाते हैं।"
      },
      {
        x: 885, y: 540,
        en: "Contact & Fomites", hi: "प्रत्यक्ष व सतह संपर्क",
        info_en: "Direct skin contact or shared contaminated surfaces transfer infectious microbes to new hosts.",
        info_hi: "संक्रमित सतह या प्रत्यक्ष स्पर्श से रोगाणु स्वस्थ व्यक्ति तक पहुँच सकते हैं।"
      },
      {
        x: 1225, y: 590,
        en: "Mosquito Vector", hi: "रोग वाहक मच्छर",
        info_en: "Female mosquitoes act as biological vectors carrying malaria protozoa or dengue virus between human hosts.",
        info_hi: "मादा मच्छर जैविक वाहक के रूप में मलेरिया परजीवी या डेंगू विषाणु को एक व्यक्ति से दूसरे तक पहुँचाती है।"
      }
    ])
  },
  {
    id: "disease_prevention_immunity",
    wid: "c9_disease",
    sec: "3",
    marks: makeLabels([
      {
        x: 165, y: 560,
        en: "Soap & Sanitation", hi: "साबुन व स्वच्छता",
        info_en: "Washing hands with soap and water removes microbes and reduces transmission; not all microbes have lipid envelopes.",
        info_hi: "साबुन और पानी से हाथ धोने पर रोगाणु हटते हैं और संक्रमण का जोखिम घटता है; सभी रोगाणुओं में लिपिड आवरण नहीं होता।"
      },
      {
        x: 525, y: 530,
        en: "Safe Clean Water", hi: "शुद्ध पेयजल छनन",
        info_en: "Water treatment can reduce microbial risks when properly designed and maintained. This illustration is not a treatment guide; methods vary by contaminant.",
        info_hi: "उचित जल उपचार रोगाणुओं का जोखिम घटा सकता है। यह चित्र उपचार का निर्देश नहीं है; विधि संदूषक पर निर्भर करती है।"
      },
      {
        x: 855, y: 585,
        en: "Vaccine Immunisation", hi: "टीकाकरण (प्रतिरक्षण)",
        info_en: "Vaccines train immune responses using different platforms, including components or genetic instructions; protection and duration vary by vaccine.",
        info_hi: "अलग टीके विभिन्न तरीकों से प्रतिरक्षा प्रतिक्रिया तैयार करते हैं; सुरक्षा और उसकी अवधि टीके के अनुसार बदलती है।"
      },
      {
        x: 1225, y: 520,
        en: "Antibodies & Memory", hi: "प्रतिरक्षी व स्मृति",
        info_en: "Antibodies can recognise specific targets; immune protection involves several mechanisms and is not always immediate or complete.",
        info_hi: "प्रतिरक्षी विशिष्ट लक्ष्यों को पहचान सकते हैं; प्रतिरक्षा में कई प्रक्रियाएँ हैं और सुरक्षा हमेशा तुरंत या पूर्ण नहीं होती।"
      }
    ])
  },
  {
    id: "chemical_change_evidence",
    wid: "c10_reactions",
    sec: "1.1",
    marks: makeLabels([
      {
        x: 245, y: 550,
        en: "Evolution of Gas", hi: "गैस का उत्सर्जन",
        info_en: "Zinc granules reacting with dilute acid release brisk hydrogen (H₂) bubbles, indicating new substance formation.",
        info_hi: "तनु अम्ल में जिंक कण डालने पर हाइड्रोजन (H₂) गैस के बुलबुले निकलना रासायनिक परिवर्तन का संकेत है।"
      },
      {
        x: 535, y: 565,
        en: "Change in Colour", hi: "रंग में परिवर्तन",
        info_en: "An iron nail displaces copper from blue CuSO₄ solution, turning the solution pale green (FeSO₄) with brown Cu deposit.",
        info_hi: "नीले कॉपर सल्फेट विलयन में लोहे की कील डालने पर हरा फेरस सल्फेट बनता है और कील पर ताँबा जमता है।"
      },
      {
        x: 845, y: 565,
        en: "Precipitate Formed", hi: "अवक्षेप का बनना",
        info_en: "Mixing potassium iodide and lead nitrate solutions immediately forms an insoluble yellow lead iodide (PbI₂) precipitate.",
        info_hi: "पोटैशियम आयोडाइड व लेड नाइट्रेट मिलाने पर अघुलनशील पीला लेड आयोडाइड (PbI₂) अवक्षेप बनता है।"
      },
      {
        x: 1155, y: 365,
        en: "Heat, Light & Ash", hi: "ऊष्मा, प्रकाश व राख",
        info_en: "Magnesium ribbon burns in air with a dazzling white flame to form white powdery magnesium oxide (MgO).",
        info_hi: "मैग्नीशियम रिबन वायु में चमकदार श्वेत ज्वाला के साथ जलकर सफेद मैग्नीशियम ऑक्साइड (MgO) चूर्ण बनाता है।"
      }
    ])
  },
  {
    id: "exothermic_endothermic",
    wid: "c10_reactions",
    sec: "1.8",
    marks: makeLabels([
      {
        x: 365, y: 635,
        en: "CaO + H₂O Reaction", hi: "बिना बुझा चूना + जल",
        info_en: "Quicklime (CaO) combines vigorously with water to form slaked lime Ca(OH)₂ while releasing abundant heat energy.",
        info_hi: "बिना बुझा चूना (CaO) जल से तीव्र अभिक्रिया कर बुझा चूना Ca(OH)₂ बनाता है और प्रचुर ऊष्मा छोड़ता है।"
      },
      {
        x: 505, y: 385,
        en: "Exothermic Rise (+ΔT)", hi: "ऊष्माक्षेपी ताप वृद्धि",
        info_en: "Heat flows into the surroundings, raising the thermometer column and warming the reaction vessel.",
        info_hi: "ऊष्मा बाहर निकलने से पात्र गर्म हो जाता है और तापमापी में पारा/द्रव ऊपर चढ़ता है।"
      },
      {
        x: 965, y: 625,
        en: "Ba(OH)₂ + NH₄Cl", hi: "ऊष्माशोषी लवण मिश्रण",
        info_en: "Mixing barium hydroxide and ammonium chloride absorbs thermal energy from the surroundings to drive the reaction.",
        info_hi: "बेरियम हाइड्रॉक्साइड और अमोनियम क्लोराइड मिलाने पर अभिक्रिया परिवेश से ऊष्मा सोख लेती है।"
      },
      {
        x: 1105, y: 420,
        en: "Endothermic Drop (−ΔT)", hi: "ऊष्माशोषी शीतलन",
        info_en: "Temperature drops sharply below freezing, condensing frost on the outer glass wall.",
        info_hi: "तापमान तेजी से गिरने के कारण बीकर की बाहरी सतह पर नमी जमकर पाला बन जाती है।"
      }
    ])
  },
  {
    id: "alloys_atomic_lattice",
    wid: "c10_metals",
    sec: "3.8",
    marks: makeLabels([
      {
        x: 155, y: 475,
        en: "Pure Metal Lattice", hi: "शुद्ध धातु जालक",
        info_en: "Identical metal atoms form smooth uniform crystal planes that slide past one another easily, making pure metals soft.",
        info_hi: "शुद्ध धातु में समान आकार के परमाणुओं की परतें बल लगने पर आसानी से फिसल जाती हैं, जिससे धातु नरम होती है।"
      },
      {
        x: 495, y: 485,
        en: "Alloy Locked Lattice", hi: "मिश्रधातु परमाणु जालक",
        info_en: "Different-sized solute atoms distort crystal planes and block layer slip, greatly increasing hardness and strength.",
        info_hi: "भिन्न आकार के परमाणु जालक की परतों को फिसलने से रोकते हैं, जिससे कठोरता और मजबूती बढ़ जाती है।"
      },
      {
        x: 925, y: 475,
        en: "Brass & Bronze", hi: "पीतल और काँसा",
        info_en: "Brass (Cu + Zn) resists corrosion in gears/fittings, while hard resonant Bronze (Cu + Sn) forms bells and statues.",
        info_hi: "पीतल (Cu + Zn) तथा काँसा (Cu + Sn) कठोर व संक्षारण-रोधी मिश्रधातुएँ हैं।"
      },
      {
        x: 1265, y: 545,
        en: "Stainless Steel & Solder", hi: "स्टेनलेस स्टील व सोल्डर",
        info_en: "Stainless steel (Fe + Ni + Cr) never rusts in surgical tools; solder (Pb + Sn) has a low melting point for joining wires.",
        info_hi: "स्टेनलेस स्टील (Fe + Ni + Cr) में जंग नहीं लगती और सोल्डर (Pb + Sn) कम गलनांक के कारण तार जोड़ने के काम आता है।"
      }
    ])
  }
];
