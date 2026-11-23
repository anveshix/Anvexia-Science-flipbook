/* ==========================================================================
   EduVerse — NCERT Class X Science · Chapter 9 "Light – Reflection and Refraction"
   SECOND live chapter pack. Content from the official NCERT jesc109.pdf
   (sections 9.1–9.3, Activities 9.1–9.10, Tables 9.1–9.2, Fig. 9.1–9.10,
   17 end exercises). Distinct visual grammar: ray diagrams, mirror/lens arcs,
   principal axis, object/image arrows, normals, standing graph — not molecules.
   Every spread is bilingual EN + HI and shares the projector-safe book engine.
   ========================================================================== */

const LIGHT_SECTIONS = [
  { id: "9.1", en: "9.1 Reflection of light · laws", hi: "9.1 प्रकाश का परावर्तन · नियम", spread: 0, color: "#4ad6ff" },
  { id: "9.2", en: "9.2 Spherical mirrors · R = 2f", hi: "9.2 गोलीय दर्पण · R = 2f", spread: 1, color: "#4c7fa8" },
  { id: "9.2.1", en: "9.2.1 Image by concave mirror", hi: "9.2.1 अवतल दर्पण से प्रतिबिम्ब", spread: 2, color: "#3f9e7c" },
  { id: "9.2.2", en: "9.2.2 Ray diagrams · convex mirror", hi: "9.2.2 किरण आरेख · उत्तल दर्पण", spread: 3, color: "#8a6fd0" },
  { id: "9.2.4", en: "9.2.4 Mirror formula & m", hi: "9.2.4 दर्पण सूत्र व आवर्धन", spread: 4, color: "#c2763c" },
  { id: "9.3", en: "9.3 Refraction · refractive index", hi: "9.3 अपवर्तन · अपवर्तनांक", spread: 5, color: "#b5537f" },
  { id: "9.3.1", en: "9.3.1 Rectangular glass slab", hi: "9.3.1 आयताकार काँच की पट्टी", spread: 6, color: "#4fa88f" },
  { id: "9.3.3", en: "9.3.3 Spherical lenses", hi: "9.3.3 गोलीय लेंस", spread: 7, color: "#d07a48" },
  { id: "9.3.7", en: "9.3.7 Lens formula & m", hi: "9.3.7 लेंस सूत्र व आवर्धन", spread: 8, color: "#6d78c8" },
  { id: "9.3.8", en: "9.3.8 Power of a lens · dioptre", hi: "9.3.8 लेंस की क्षमता · डायोप्टर", spread: 9, color: "#c9a24a" }
];

/* shorthand that adds every Hindi field + the Hindi challenge wording */
function LS(type, title, hiTitle, section, o) {
  const s = S(type, title, hiTitle, section, o);
  if (o.vh) s.vocabHi = o.vh;
  if (o.ph) s.predictHi = { q: o.ph[0], options: o.ph[1], a: o.p[2] };
  if (o.fh) s.figHi = o.fh;
  if (o.hh) s.hintHi = o.hh;
  if (o.chal && o.chalh) s.challenge.textHi = o.chalh;
  return s;
}

WORLDS.c10_light = [

  LS("reflection", "Light travels in rays · laws of reflection", "प्रकाश किरणों में चलता है · परावर्तन के नियम", "9.1", {
    c: "A sharp shadow shows that light travels in straight lines, drawn as a ray. At a polished surface the angle of incidence equals the angle of reflection, and the incident ray, the normal and the reflected ray all lie in the same plane. A plane mirror gives a virtual, erect, same-size image that is laterally inverted.",
    ch: "तीक्ष्ण छाया दर्शाती है कि प्रकाश सीधी रेखा में चलता है, जिसे किरण कहते हैं। चिकनी सतह पर आपतन कोण = परावर्तन कोण, और आपतित किरण, अभिलंब व परावर्तित किरण एक ही तल में होते हैं। समतल दर्पण आभासी, सीधा, समान आकार का पार्श्व-उल्टा प्रतिबिम्ब देता है।",
    f: ["LAW", "∠i = ∠r", "Both angles are measured from the normal."],
    v: [["Ray", "A straight-line path of light."], ["Normal", "Perpendicular at the point of incidence."], ["Virtual image", "Cannot be caught on a screen."]],
    vh: [["किरण", "प्रकाश का सीधा पथ।"], ["अभिलंब", "आपतन बिंदु पर लंब रेखा।"], ["आभासी प्रतिबिम्ब", "पर्दे पर नहीं लिया जा सकता।"]],
    p: ["If the angle of incidence is 40°, the angle of reflection is:", ["20°", "40°", "80°"], 1],
    ph: ["यदि आपतन कोण 40° है तो परावर्तन कोण होगा:", ["20°", "40°", "80°"], 1],
    e: "The two angles are always measured from the normal, never from the mirror surface. The laws hold for curved mirrors too, because a small part of a curved surface behaves like a plane tangent at that point.",
    eh: "दोनों कोण अभिलंब से मापे जाते हैं, दर्पण की सतह से नहीं। ये नियम गोलीय दर्पणों पर भी लागू होते हैं, क्योंकि हर छोटे भाग पर स्पर्शी समतल मानी जाती है।",
    fig: "Fig 9.1 — incident ray, normal and reflected ray on a plane mirror.",
    fh: "चित्र 9.1 — समतल दर्पण पर आपतित किरण, अभिलंब व परावर्तित किरण।",
    hint: "Drag the incidence angle and watch both angles stay equal.",
    hh: "आपतन कोण खींचें और दोनों कोण बराबर रहते देखें।",
    chal: { text: "Set the angle of incidence to 45°.", target: { key: "i", value: 45, op: "near", tol: 3 } },
    chalh: "आपतन कोण 45° पर लगाएँ।",
    q: ["The angle of reflection is measured from:", ["the mirror", "the normal", "the ray"], 1, "Angles are always measured from the normal."]
  }),

  LS("mirror", "Spherical mirrors · pole, focus, R = 2f", "गोलीय दर्पण · ध्रुव, फोकस, R = 2f", "9.2", {
    c: "A spherical mirror is a part of a reflecting sphere. Its centre is C, pole P, principal axis PC, aperture MN. Rays parallel to the axis meet at the principal focus F after reflection from a concave mirror, or appear to come from F behind a convex mirror. For a small aperture R = 2f.",
    ch: "गोलीय दर्पण किसी गोले के परावर्तक भाग हैं। केन्द्र C, ध्रुव P, मुख्य अक्ष PC तथा द्वारक MN कहलाते हैं। अक्ष के समांतर किरणें अवतल दर्पण से फोकस F पर मिलती हैं, उत्तल दर्पण में वे F से आती प्रतीत होती हैं। छोटे द्वारक के लिए R = 2f।",
    f: ["MIRROR", "R = 2f", "F lies midway between P and C (Activity 9.2)."],
    v: [["Concave mirror", "Converging, reflecting surface curves inward."], ["Convex mirror", "Diverging, bulges outward."], ["Focal length", "Distance PF; half the radius of curvature."]],
    vh: [["अवतल दर्पण", "अभिसारी, अंदर की ओर मुड़ा।"], ["उत्तल दर्पण", "अपसारी, बाहर की ओर उभरा।"], ["फोकस दूरी", "PF की दूरी; R की आधी।"]],
    p: ["R of a spherical mirror is 20 cm. Its focal length is:", ["5 cm", "10 cm", "40 cm"], 1],
    ph: ["किसी गोलीय दर्पण की R = 20 cm है। फोकस दूरी होगी:", ["5 cm", "10 cm", "40 cm"], 1],
    e: "f = R/2 only for mirrors of small aperture. In Activity 9.2 sunlight is concentrated at F; the bright spot is a real, inverted, point-sized image of the Sun, and the paper may even burn.",
    eh: "f = R/2 केवल छोटे द्वारक के लिए है। क्रियाकलाप 9.2 में सूर्य का प्रकाश F पर केन्द्रित होता है; वह चमकीला बिंदु सूर्य का वास्तविक, उल्टा प्रतिबिम्ब है और कागज़ जल भी सकता है।",
    fig: "Fig 9.2 — parallel rays converge at F (concave) or diverge from F (convex).",
    fh: "चित्र 9.2 — समांतर किरणें F पर मिलती हैं या F से आती दिखती हैं।",
    hint: "Switch the surface and drag f; watch F and C move together.",
    hh: "सतह बदलें और f खींचें; F व C साथ-साथ चलते हैं।",
    chal: { text: "Make the mirror convex (diverging).", target: { key: "convex", value: true, op: "eq" } },
    chalh: "दर्पण को उत्तल (अपसारी) बनाएँ।",
    q: ["A convex mirror has R = 32 cm. Its focal length is:", ["+16 cm", "−16 cm", "+32 cm"], 0, "For a convex mirror f = +R/2 = +16 cm."]
  }),

  LS("mirror", "Concave mirror · Table 9.1 of images", "अवतल दर्पण · प्रतिबिम्ब सारणी 9.1", "9.2.1", {
    c: "Activity 9.3 moves a candle beyond C, at C, between C and F, at F, and between P and F. Table 9.1: beyond C → diminished real inverted between F and C; at C → same size; between C and F → enlarged real beyond C; between P and F → enlarged virtual erect behind the mirror. Two rays are enough to locate the image.",
    ch: "क्रियाकलाप 9.3 में मोमबत्ती को C से आगे, C पर, C व F के बीच, F पर, तथा P व F के बीच रखा जाता है। सारणी 9.1: C से आगे → छोटा वास्तविक उल्टा; C पर → समान; C व F के बीच → बड़ा वास्तविक; P व F के बीच → बड़ा आभासी सीधा। दो किरणें पर्याप्त हैं।",
    f: ["TABLE 9.1", "object position → image position", "Real images are inverted; virtual images are erect."],
    v: [["Centre of curvature C", "At 2f from the pole."], ["Real image", "Can be caught on a screen."], ["Ray diagram", "Two chosen rays locate the image top."]],
    vh: [["वक्रता केन्द्र C", "ध्रुव से 2f दूरी पर।"], ["वास्तविक प्रतिबिम्ब", "पर्दे पर प्राप्त होता है।"], ["किरण आरेख", "दो किरणें प्रतिबिम्ब का शीर्ष बताती हैं।"]],
    p: ["An erect enlarged image in a concave mirror means the object is:", ["beyond C", "at C", "between P and F"], 2],
    ph: ["अवतल दर्पण में सीधा बड़ा प्रतिबिम्ब का अर्थ है वस्तु है:", ["C से आगे", "C पर", "P व F के बीच"], 2],
    e: "The image is virtual once the object is closer than F: reflected rays diverge and only their backward extensions meet behind the mirror. That is why a shaving or dentist mirror magnifies when held close.",
    eh: "जब वस्तु F से निकट हो तो प्रतिबिम्ब आभासी होता है: परावर्तित किरणें फैलती हैं और उनके पीछे के विस्तार मिलते हैं। इसीलिए शेविंग या दंत दर्पण पास रखने पर बड़ा दिखाता है।",
    fig: "Fig 9.7 — six ray diagrams for the concave mirror (Activity 9.4).",
    fh: "चित्र 9.7 — अवतल दर्पण के छह किरण आरेख (क्रियाकलाप 9.4)।",
    hint: "Drag |u| from beyond C to inside F and read the image nature.",
    hh: "|u| को C से आगे से F के भीतर तक खींचें और प्रतिबिम्ब देखें।",
    chal: { text: "Place the object between P and F for a virtual image.", target: { key: "region", value: "between P and F" } },
    chalh: "आभासी प्रतिबिम्ब के लिए वस्तु को P व F के बीच रखें।",
    q: ["A concave mirror gives a virtual erect enlarged image. Where is the object?", ["Beyond C", "At C", "Between P and F"], 2, "NCERT exercise 2: between the pole and focus."]
  }),

  LS("mirror", "Convex mirror · rear-view and full field", "उत्तल दर्पण · रियर-व्यू व विस्तृत दृश्य", "9.2.2", {
    c: "A convex mirror always forms a virtual, erect, diminished image between P and F behind the mirror (Table 9.2). As the object moves away, the image moves closer to F. Because it curves outward it has a wider field of view, so vehicles use it as a rear-view mirror and a small mirror can show a whole tall building.",
    ch: "उत्तल दर्पण सदा P व F के बीच आभासी, सीधा, छोटा प्रतिबिम्ब बनाता है (सारणी 9.2)। वस्तु दूर जाने पर प्रतिबिम्ब F के निकट आता है। बाहर की ओर मुड़ा होने से दृश्य-क्षेत्र बड़ा होता है, इसलिए वाहनों में रियर-व्यू दर्पण और छोटे दर्पण में पूरी ऊँची इमारत दिखती है।",
    f: ["TABLE 9.2", "always virtual · erect · diminished", "Wider field of view than a plane mirror."],
    v: [["Field of view", "The angular area visible in a mirror."], ["Rear-view mirror", "Convex mirror fitted on vehicle sides."], ["Virtual image", "Formed behind the mirror."]],
    vh: [["दृश्य-क्षेत्र", "दर्पण में दिखने वाला कोणीय क्षेत्र।"], ["रियर-व्यू दर्पण", "वाहन के पार्श्व में उत्तल दर्पण।"], ["आभासी प्रतिबिम्ब", "दर्पण के पीछे बनता है।"]],
    p: ["Why is a convex mirror preferred as a rear-view mirror?", ["It magnifies", "It gives an erect image and a wider field", "It forms real images"], 1],
    ph: ["रियर-व्यू के लिए उत्तल दर्पण क्यों चुना जाता है?", ["यह बड़ा करता है", "सीधा प्रतिबिम्ब व विस्तृत दृश्य देता है", "वास्तविक प्रतिबिम्ब बनाता है"], 1],
    e: "NCERT in-text question 4. The trade-off is size: the image is smaller, so objects look farther away than they are. Vehicles print a warning for this reason.",
    eh: "NCERT अंतः प्रश्न 4। समझौता आकार का है: प्रतिबिम्ब छोटा है, इसलिए वस्तुएँ वास्तविकता से दूर लगती हैं; वाहनों पर इसकी चेतावनी छपी होती है।",
    fig: "Fig 9.8 — image by a convex mirror at infinity and at a finite distance.",
    fh: "चित्र 9.8 — अनंत व निश्चित दूरी पर उत्तल दर्पण का प्रतिबिम्ब।",
    hint: "Set the surface to convex, then move the object away from the mirror.",
    hh: "सतह उत्तल करें, फिर वस्तु को दर्पण से दूर ले जाएँ।",
    chal: { text: "Obtain a virtual, erect image with the convex surface.", target: { key: "virtual", value: true, op: "eq" } },
    chalh: "उत्तल सतह से आभासी, सीधा प्रतिबिम्ब प्राप्त करें।",
    q: ["A mirror always gives an erect image. It is:", ["only concave", "plane or convex", "only convex"], 1, "NCERT exercise 5: either plane or convex."]
  }),

  LS("mirrorformula", "Mirror formula & magnification", "दर्पण सूत्र व आवर्धन", "9.2.4", {
    c: "Using the New Cartesian Sign Convention (pole as origin, object on the left), 1/v + 1/u = 1/f and m = h′/h = −v/u. A negative m means a real inverted image; a positive m means a virtual erect one. Use signed u, v, f and R in every numerical problem.",
    ch: "नवीन कार्तीय चिह्न परिपाटी में (ध्रुव मूल बिंदु, वस्तु बाएँ) 1/v + 1/u = 1/f तथा m = h′/h = −v/u। ऋणात्मक m वास्तविक उल्टा, धनात्मक m आभासी सीधा प्रतिबिम्ब बताता है। हर गणना में u, v, f, R के चिह्न लगाएँ।",
    f: ["EQ 9.1 / 9.3", "1/v + 1/u = 1/f  ·  m = −v/u", "Example 9.2: u = −25, f = −15 → v = −37.5 cm, h′ = −6 cm."],
    v: [["Sign convention", "Left of pole = negative x."], ["Magnification", "Ratio of image height to object height."], ["Real image", "Negative magnification for mirrors."]],
    vh: [["चिह्न परिपाटी", "ध्रुव के बाएँ = ऋणात्मक x।"], ["आवर्धन", "प्रतिबिम्ब व वस्तु की ऊँचाई का अनुपात।"], ["वास्तविक प्रतिबिम्ब", "दर्पण के लिए ऋणात्मक आवर्धन।"]],
    p: ["u = −10 cm, v = −5 cm for a mirror. m equals:", ["+0.5", "−0.5", "−2"], 1],
    ph: ["दर्पण के लिए u = −10 cm, v = −5 cm है। m होगा:", ["+0.5", "−0.5", "−2"], 1],
    e: "Example 9.2: a 4 cm object at 25 cm from a concave mirror of f = 15 cm gives v = −37.5 cm (screen 37.5 cm in front) and h′ = −6 cm — real, inverted, enlarged.",
    eh: "उदाहरण 9.2: 4 cm वस्तु, f = 15 cm अवतल दर्पण से 25 cm पर → v = −37.5 cm (पर्दा 37.5 cm आगे), h′ = −6 cm — वास्तविक, उल्टा, बड़ा।",
    fig: "Fig 9.9 — New Cartesian Sign Convention; standing v–u curve.",
    fh: "चित्र 9.9 — नवीन कार्तीय चिह्न परिपाटी; v–u वक्र।",
    hint: "Drag u and f; read v and m on the graph and in the live readings.",
    hh: "u व f खींचें; v व m ग्राफ और लाइव रीडिंग में पढ़ें।",
    chal: { text: "Reproduce NCERT Example 9.2: v ≈ −37.5 cm.", target: { key: "v", value: -37.5, op: "near", tol: 1.5 } },
    chalh: "NCERT उदाहरण 9.2 दोहराएँ: v ≈ −37.5 cm।",
    q: ["A concave mirror has f = −15 cm and u = −25 cm. Where is the image?", ["−37.5 cm", "+37.5 cm", "−15 cm"], 0, "1/v = 1/f − 1/u = −2/75 → v = −37.5 cm."]
  }),

  LS("slab", "Refraction & refractive index · Snell's law", "अपवर्तन व अपवर्तनांक · स्नेल का नियम", "9.3", {
    c: "Light bends when it passes obliquely from one transparent medium to another because its speed changes. From rarer to denser it bends towards the normal; from denser to rarer, away. n = c/v and n₁ sin i = n₂ sin r. Frequency stays unchanged; speed and wavelength change.",
    ch: "एक पारदर्शी माध्यम से दूसरे में तिरछी जाने पर प्रकाश मुड़ता है क्योंकि उसकी चाल बदलती है। विरल से सघन में अभिलंब की ओर, सघन से विरल में अभिलंब से दूर। n = c/v तथा n₁ sin i = n₂ sin r। आवृत्ति अपरिवर्तित, चाल व तरंगदैर्घ्य बदलते हैं।",
    f: ["SNELL", "n₁ sin i = n₂ sin r  ·  n = c/v", "c = 3 × 10⁸ m s⁻¹ in vacuum."],
    v: [["Refraction", "Bending of light at an interface."], ["Optical density", "Higher n, not necessarily higher mass density."], ["Normal incidence", "i = 0 → no bending."]],
    vh: [["अपवर्तन", "अंतरापृष्ठ पर प्रकाश का मुड़ना।"], ["प्रकाशिक घनत्व", "अधिक n, पर द्रव्यमान घनत्व से अलग।"], ["अभिलंब आपतन", "i = 0 → कोई मुड़न नहीं।"]],
    p: ["Light entering water from air bends:", ["away from the normal", "towards the normal", "not at all"], 1],
    ph: ["वायु से जल में जाती किरण मुड़ती है:", ["अभिलंब से दूर", "अभिलंब की ओर", "बिल्कुल नहीं"], 1],
    e: "Activities 9.7–9.9: a coin in water appears raised, a pencil looks displaced at the surface, and letters under a glass slab look bent. All are refraction, not a change in the object.",
    eh: "क्रियाकलाप 9.7–9.9: जल में सिक्का ऊपर उठा दिखता है, पेंसिल सतह पर टूटी लगती है, काँच के नीचे अक्षर मुड़े लगते हैं — यह अपवर्तन है, वस्तु नहीं बदलती।",
    fig: "Fig 9.10 — ray through a rectangular glass slab, normal drawn at O and O′.",
    fh: "चित्र 9.10 — काँच की पट्टी से किरण, O व O′ पर अभिलंब।",
    hint: "Raise n and watch r shrink while the emergent ray stays parallel.",
    hh: "n बढ़ाएँ; r घटता है पर निर्गत किरण समांतर रहती है।",
    chal: { text: "Raise the refractive index to about 1.5 (glass).", target: { key: "n", value: 1.5, op: "near", tol: 0.08 } },
    chalh: "अपवर्तनांक लगभग 1.5 (काँच) करें।",
    q: ["Refractive index of a medium is:", ["v/c", "c/v", "c × v"], 1, "n = speed in vacuum / speed in medium."]
  }),

  LS("slab", "Rectangular glass slab · lateral shift", "आयताकार काँच की पट्टी · पार्श्व विस्थापन", "9.3.1", {
    c: "Activity 9.10 traces a ray with four pins through a glass slab ABCD. At face AB the ray bends towards the normal, at CD it bends away by the same amount, so the emergent ray is parallel to the incident ray but shifted sideways. For normal incidence (i = 0) there is no bending and no shift.",
    ch: "क्रियाकलाप 9.10 में चार पिनों से किरण का पथ खींचा जाता है। AB पर किरण अभिलंब की ओर, CD पर उतनी ही दूर मुड़ती है, अतः निर्गत किरण आपतित किरण के समांतर पर पार्श्व में सरकी होती है। अभिलंब आपतन (i = 0) पर न मुड़न न विस्थापन।",
    f: ["ACTIVITY 9.10", "emergent ray ∥ incident ray", "Lateral shift grows with i, slab thickness and n."],
    v: [["Incident ray", "EO in Fig 9.10."], ["Emergent ray", "O′H, parallel to EO."], ["Lateral shift", "Perpendicular sideward displacement."]],
    vh: [["आपतित किरण", "चित्र 9.10 में EO।"], ["निर्गत किरण", "O′H, EO के समांतर।"], ["पार्श्व विस्थापन", "लंबवत पार्श्व सरकाव।"]],
    p: ["The emergent ray from a rectangular glass slab is:", ["converging", "parallel to the incident ray", "perpendicular"], 1],
    ph: ["आयताकार काँच की पट्टी से निर्गत किरण होती है:", ["अभिसारी", "आपतित किरण के समांतर", "लंबवत"], 1],
    e: "The equal and opposite bending at the two parallel faces cancels the change in direction but not the sideways displacement. A thicker slab, a larger i, or a larger n makes the shift bigger.",
    eh: "दो समांतर पृष्ठों पर समान व विपरीत मुड़न दिशा का परिवर्तन तो मिटा देती है, पर पार्श्व सरकाव नहीं। मोटी पट्टी, बड़ा i या बड़ा n विस्थापन बढ़ाते हैं।",
    fig: "Fig 9.10 — EO incident, OO′ refracted, O′H emergent, with normals NN′ and MM′.",
    fh: "चित्र 9.10 — EO आपतित, OO′ अपवर्तित, O′H निर्गत; अभिलंब NN′ व MM′।",
    hint: "Set i = 0 — the straight line passes through without shifting.",
    hh: "i = 0 करें — रेखा बिना मुड़े व बिना सरके निकलती है।",
    chal: { text: "Set normal incidence (i ≈ 0°).", target: { key: "i", value: 0, op: "near", tol: 2 } },
    chalh: "अभिलंब आपतन लगाएँ (i ≈ 0°)।",
    q: ["For what angle of incidence is the lateral shift through a glass slab zero?", ["0°", "45°", "90°"], 0, "At normal incidence the ray does not bend."]
  }),

  LS("lens", "Spherical lenses · converging and diverging", "गोलीय लेंस · अभिसारी व अपसारी", "9.3.3", {
    c: "A convex (converging) lens is thick in the middle; a concave (diverging) lens is thin in the middle. Its optical centre O lets a ray pass undeviated; a ray parallel to the principal axis passes through the principal focus F after refraction. Image formation uses the same two-ray construction as mirrors, with the lens formula instead.",
    ch: "उत्तल (अभिसारी) लेंस बीच में मोटा, अवतल (अपसारी) लेंस बीच में पतला होता है। प्रकाशिक केन्द्र O से होकर किरण बिना मुड़े निकलती है; अक्ष के समांतर किरण अपवर्तन के बाद फोकस F से होकर जाती है। प्रतिबिम्ब के लिए वही दो-किरण आरेख, पर सूत्र लेंस का।",
    f: ["LENS", "1/v − 1/u = 1/f", "Convex f > 0 · concave f < 0 · ray through O goes straight."],
    v: [["Convex lens", "Converging; positive power."], ["Concave lens", "Diverging; negative power."], ["Optical centre", "Point O, ray undeviated."]],
    vh: [["उत्तल लेंस", "अभिसारी; धनात्मक क्षमता।"], ["अवतल लेंस", "अपसारी; ऋणात्मक क्षमता।"], ["प्रकाशिक केन्द्र", "बिंदु O, किरण अविचलित।"]],
    p: ["To read small dictionary letters you would use:", ["convex lens of f = 5 cm", "concave lens of f = 50 cm", "plane glass"], 0],
    ph: ["शब्दकोश के छोटे अक्षर पढ़ने के लिए चुनेंगे:", ["f = 5 cm उत्तल लेंस", "f = 50 cm अवतल लेंस", "समतल काँच"], 0],
    e: "NCERT exercise 6. A short focal length convex lens is a magnifying glass when the object lies inside f — it gives a virtual, erect, enlarged image. Covering half the lens (exercise 9) still gives a complete, only dimmer, image.",
    eh: "NCERT अभ्यास 6। छोटी फोकस दूरी का उत्तल लेंस, वस्तु f के भीतर होने पर आवर्धक लेंस बनता है — आभासी, सीधा, बड़ा प्रतिबिम्ब। आधा लेंस ढकने पर भी पूरा प्रतिबिम्ब बनता है, बस मंद (अभ्यास 9)।",
    fig: "Fig 9.11–9.12 — ray diagrams for a convex and a concave lens.",
    fh: "चित्र 9.11–9.12 — उत्तल व अवतल लेंस के किरण आरेख।",
    hint: "Switch to concave and see the image stay virtual and erect.",
    hh: "अवतल चुनें; प्रतिबिम्ब आभासी व सीधा ही रहता है।",
    chal: { text: "Form a real image with the converging lens.", target: { key: "real", value: true, op: "eq" } },
    chalh: "अभिसारी लेंस से वास्तविक प्रतिबिम्ब बनाएँ।",
    q: ["Which material cannot be used to make a lens?", ["Water", "Glass", "Clay"], 2, "NCERT exercise 1: clay is opaque."]
  }),

  LS("lensformula", "Lens formula, magnification & sign convention", "लेंस सूत्र, आवर्धन व चिह्न परिपाटी", "9.3.7", {
    c: "For a thin spherical lens, 1/v − 1/u = 1/f and m = h′/h = v/u. Distances are measured from the optical centre using the New Cartesian convention; object on the left gives u < 0. A real inverted image has m < 0; a virtual erect one has m > 0.",
    ch: "पतले गोलीय लेंस के लिए 1/v − 1/u = 1/f तथा m = h′/h = v/u। दूरियाँ प्रकाशिक केन्द्र से नवीन कार्तीय परिपाटी में मापी जाती हैं; बाएँ वस्तु के लिए u < 0। वास्तविक उल्टे प्रतिबिम्ब का m < 0, आभासी सीधे का m > 0।",
    f: ["EQ 9.4", "1/v − 1/u = 1/f  ·  m = v/u", "Exercise 10: u = −25, f = +10 → v = +16.7 cm, h′ = −3.3 cm."],
    v: [["Lens formula", "Relates u, v and f."], ["m = v/u", "Positive m → virtual erect image."], ["Dioptre", "Unit of power, 1/m."]],
    vh: [["लेंस सूत्र", "u, v, f में संबंध।"], ["m = v/u", "धनात्मक m → आभासी सीधा।"], ["डायोप्टर", "क्षमता की इकाई, 1/m।"]],
    p: ["A convex lens forms a real image of the same size when the object is at:", ["F", "2F", "infinity"], 1],
    ph: ["उत्तल लेंस समान आकार का वास्तविक प्रतिबिम्ब देता है जब वस्तु है:", ["F पर", "2F पर", "अनंत पर"], 1],
    e: "NCERT exercise 10: a 5 cm object at 25 cm from a convex lens of f = 10 cm gives v = +16.7 cm and h′ = −3.3 cm — real, inverted, diminished. Exercise 3 places the object at twice the focal length for an equal-size real image.",
    eh: "NCERT अभ्यास 10: 5 cm वस्तु, f = 10 cm उत्तल लेंस से 25 cm पर → v = +16.7 cm, h′ = −3.3 cm — वास्तविक, उल्टा, छोटा। अभ्यास 3 में समान आकार हेतु वस्तु 2f पर।",
    fig: "Standing v–u curve with the current operating point highlighted.",
    fh: "v–u वक्र, वर्तमान बिंदु चिह्नित।",
    hint: "Slide u across 2f and watch m change sign at F.",
    hh: "u को 2f के आर-पार खींचें; F पर m का चिह्न बदलता है।",
    chal: { text: "Reproduce NCERT exercise 10: v ≈ +16.7 cm.", target: { key: "v", value: 16.7, op: "near", tol: 1.2 } },
    chalh: "NCERT अभ्यास 10 दोहराएँ: v ≈ +16.7 cm।",
    q: ["An object is at 20 cm from a convex mirror of f = 15 cm. The image is:", ["virtual erect", "real inverted", "at infinity"], 0, "1/v = 1/15 + 1/20 → v ≈ +8.6 cm, virtual."]
  }),

  LS("lenspower", "Power of a lens · dioptre & combinations", "लेंस की क्षमता · डायोप्टर व संयोजन", "9.3.8", {
    c: "The power of a lens is the reciprocal of its focal length in metres: P = 1/f(m), unit dioptre (D). Convex lenses have positive power, concave lenses negative. For thin lenses in contact the net power is the algebraic sum P = P₁ + P₂ + ⋯, which is why opticians can add trial-lens powers directly.",
    ch: "लेंस की क्षमता मीटर में फोकस दूरी का व्युत्क्रम है: P = 1/f(m), इकाई डायोप्टर (D)। उत्तल की क्षमता धनात्मक, अवतल की ऋणात्मक। संपर्क में रखे पतले लेंसों की कुल क्षमता P = P₁ + P₂ + ⋯ होती है, इसलिए चिकित्सक परीक्षण लेंसों की क्षमताएँ जोड़ देते हैं।",
    f: ["POWER", "P = 1/f (m)  ·  P = P₁ + P₂", "+2.0 D and +0.25 D in contact → +2.25 D."],
    v: [["Dioptre", "1 D = 1 m⁻¹."], ["Net power", "Algebraic sum for lenses in contact."], ["Spectacles", "Combination chosen to focus on the retina."]],
    vh: [["डायोप्टर", "1 D = 1 m⁻¹।"], ["कुल क्षमता", "संपर्क लेंसों का बीजीय योग।"], ["चश्मा", "रेटिना पर फोकस हेतु संयोजन।"]],
    p: ["A lens of power −2.0 D has focal length:", ["+0.5 m", "−0.5 m", "−2 m"], 1],
    ph: ["−2.0 D क्षमता के लेंस की फोकस दूरी है:", ["+0.5 m", "−0.5 m", "−2 m"], 1],
    e: "NCERT exercise 16: f = 1/P = −0.5 m = −50 cm, a diverging concave lens. Exercise 17: +1.5 D → f = +0.67 m, converging. One dioptre is the power of a lens of focal length 1 m.",
    eh: "NCERT अभ्यास 16: f = 1/P = −0.5 m = −50 cm, अपसारी अवतल लेंस। अभ्यास 17: +1.5 D → f = +0.67 m, अभिसारी। एक डायोप्टर 1 m फोकस दूरी के लेंस की क्षमता है।",
    fig: "Two thin lenses in contact with their powers added algebraically.",
    fh: "संपर्क में दो पतले लेंस, क्षमताएँ बीजीय रूप से जुड़ती हैं।",
    hint: "Combine +2.0 D and +0.25 D and read the net power.",
    hh: "+2.0 D व +0.25 D जोड़ें और कुल क्षमता पढ़ें।",
    chal: { text: "Make the net power +2.25 D from two converging lenses.", target: { key: "power", value: 2.25, op: "near", tol: 0.15 } },
    chalh: "दो अभिसारी लेंसों से कुल क्षमता +2.25 D बनाएँ।",
    q: ["Two thin lenses of +2.0 D and +0.25 D in contact have net power:", ["+1.75 D", "+2.25 D", "+8.0 D"], 1, "Powers add algebraically."]
  })
];

/* --------------------------------------------------------------------------
   Printed right-page Hindi captions, Hindi hints and Hindi challenge wording.
   Attached by spread index; LS() already set figHi / hintHi / challenge.textHi
   from the per-spread fields, so these arrays are the explicit audit copy.
   -------------------------------------------------------------------------- */
const LIGHT_FIG_HI = WORLDS.c10_light.map(sp => sp.figHi || sp.fig);
const LIGHT_HINT_HI = WORLDS.c10_light.map(sp => sp.hintHi || sp.tryHint);
const LIGHT_CHAL_HI = WORLDS.c10_light.map(sp => (sp.challenge && sp.challenge.textHi) || (sp.challenge && sp.challenge.text) || "");

/* 12 bilingual chapter quiz items (NCERT exercises 1–17 + in-text questions). */
const LIGHT_QUIZ = [
  { q: "Which material cannot be used to make a lens?", options: ["Water", "Glass", "Clay"], a: 2, why: "Clay is opaque, so it cannot refract light into an image." },
  { q: "A concave mirror gives a virtual, erect, larger image. Where is the object?", options: ["Beyond C", "At C", "Between P and F"], a: 2, why: "Inside the focal length the reflected rays diverge; their extensions meet behind the mirror." },
  { q: "Where should an object be placed before a convex lens for a real image of the same size?", options: ["At F", "At 2F", "At infinity"], a: 1, why: "At twice the focal length v = 2f and m = −1." },
  { q: "A mirror and a lens each have f = −15 cm. They are:", options: ["both concave", "both convex", "mirror concave, lens convex"], a: 0, why: "Negative f means a concave mirror and a concave (diverging) lens." },
  { q: "A mirror always gives an erect image. It is:", options: ["only plane", "plane or convex", "only convex"], a: 1, why: "Both plane and convex mirrors give erect images." },
  { q: "Which lens helps read small dictionary print?", options: ["Convex f = 5 cm", "Concave f = 50 cm", "Convex f = 50 cm"], a: 0, why: "A short-focal-length convex lens is a magnifying glass." },
  { q: "Headlights of a car use a:", options: ["convex mirror", "concave mirror", "plane mirror"], a: 1, why: "A source at F of a concave mirror gives a powerful parallel beam." },
  { q: "An object 5 cm tall is 25 cm from a convex lens of f = 10 cm. v is about:", options: ["+16.7 cm", "−16.7 cm", "+50 cm"], a: 0, why: "1/v = 1/f − 1/uMag = 0.1 − 0.04 = 0.06 → v = 16.7 cm." },
  { q: "A concave lens of f = 15 cm forms an image 10 cm from it. The object is at:", options: ["30 cm", "10 cm", "6 cm"], a: 0, why: "1/v = −1/15 + 1/u → u = 30 cm in front (virtual image)." },
  { q: "Magnification +1 of a plane mirror means:", options: ["inverted and smaller", "erect and same size", "real and larger"], a: 1, why: "m = h′/h = +1: the image is erect and equal in size." },
  { q: "A lens of power −2.0 D is:", options: ["convex, f = +0.5 m", "concave, f = −0.5 m", "concave, f = −2 m"], a: 1, why: "P = 1/f(m) → f = −0.5 m; negative power means diverging." },
  { q: "Two lenses of +2.0 D and +0.25 D in contact have net power:", options: ["+1.75 D", "+2.25 D", "+8.0 D"], a: 1, why: "Powers in contact add algebraically." }
];
const LIGHT_QUIZ_HI = [
  { q: "लेंस बनाने के लिए कौन-सी सामग्री नहीं चुनी जा सकती?", options: ["जल", "काँच", "मिट्टी"], a: 2, why: "मिट्टी अपारदर्शी है, अतः प्रकाश को मोड़कर प्रतिबिम्ब नहीं बना सकती।" },
  { q: "अवतल दर्पण से आभासी, सीधा, बड़ा प्रतिबिम्ब मिले तो वस्तु कहाँ है?", options: ["C से आगे", "C पर", "P व F के बीच"], a: 2, why: "फोकस के भीतर परावर्तित किरणें फैलती हैं; उनके विस्तार दर्पण के पीछे मिलते हैं।" },
  { q: "उत्तल लेंस से समान आकार का वास्तविक प्रतिबिम्ब कहाँ रखने पर मिलेगा?", options: ["F पर", "2F पर", "अनंत पर"], a: 1, why: "दुगनी फोकस दूरी पर v = 2f तथा m = −1।" },
  { q: "दर्पण व लेंस दोनों की f = −15 cm है। वे हैं:", options: ["दोनों अवतल", "दोनों उत्तल", "दर्पण अवतल, लेंस उत्तल"], a: 0, why: "ऋणात्मक f का अर्थ अवतल दर्पण व अवतल (अपसारी) लेंस।" },
  { q: "जो दर्पण सदा सीधा प्रतिबिम्ब देता है, वह है:", options: ["केवल समतल", "समतल या उत्तल", "केवल उत्तल"], a: 1, why: "समतल व उत्तल दोनों दर्पण सीधा प्रतिबिम्ब देते हैं।" },
  { q: "शब्दकोश के छोटे अक्षर पढ़ने के लिए कौन-सा लेंस?", options: ["उत्तल f = 5 cm", "अवतल f = 50 cm", "उत्तल f = 50 cm"], a: 0, why: "छोटी फोकस दूरी का उत्तल लेंस आवर्धक लेंस है।" },
  { q: "कार की हेडलाइट में कौन-सा दर्पण लगता है?", options: ["उत्तल दर्पण", "अवतल दर्पण", "समतल दर्पण"], a: 1, why: "F पर रखा स्रोत अवतल दर्पण से शक्तिशाली समांतर पुंज देता है।" },
  { q: "5 cm वस्तु, f = 10 cm उत्तल लेंस से 25 cm पर है। v लगभग:", options: ["+16.7 cm", "−16.7 cm", "+50 cm"], a: 0, why: "1/v = 1/f − 1/u = 0.1 − 0.04 = 0.06 → v = 16.7 cm।" },
  { q: "f = 15 cm अवतल लेंस 10 cm पर प्रतिबिम्ब दे, तो वस्तु कहाँ है?", options: ["30 cm", "10 cm", "6 cm"], a: 0, why: "1/v = −1/15 + 1/u → u = 30 cm आगे (आभासी प्रतिबिम्ब)।" },
  { q: "समतल दर्पण का आवर्धन +1 का अर्थ है:", options: ["उल्टा व छोटा", "सीधा व समान आकार", "वास्तविक व बड़ा"], a: 1, why: "m = h′/h = +1: प्रतिबिम्ब सीधा व समान आकार।" },
  { q: "−2.0 D क्षमता का लेंस है:", options: ["उत्तल, f = +0.5 m", "अवतल, f = −0.5 m", "अवतल, f = −2 m"], a: 1, why: "P = 1/f(m) → f = −0.5 m; ऋणात्मक क्षमता अपसारी लेंस।" },
  { q: "+2.0 D व +0.25 D लेंस संपर्क में हों तो कुल क्षमता:", options: ["+1.75 D", "+2.25 D", "+8.0 D"], a: 1, why: "संपर्क में क्षमताएँ बीजीय रूप से जुड़ती हैं।" }
];

const LIGHT_GROUPS = [
  { id: "sec:0", title: "9.1 Reflection & rays", hi: "9.1 परावर्तन व किरणें", cls: "X", color: "#4ad6ff", spread: 0 },
  { id: "sec:1", title: "9.2 Spherical mirrors", hi: "9.2 गोलीय दर्पण", cls: "X", color: "#4c7fa8", spread: 1 },
  { id: "sec:5", title: "9.3 Refraction & slab", hi: "9.3 अपवर्तन व पट्टी", cls: "X", color: "#3f9e7c", spread: 5 },
  { id: "sec:7", title: "9.3.3 Lenses & power", hi: "9.3.3 लेंस व क्षमता", cls: "X", color: "#c9a24a", spread: 7 }
];

/* --------------------------------------------------------------------------
   The reusable CHAPTER PACK registry. Adding a new live chapter now means:
   one catalogue row + one data file that fills this shape. Nothing in world.js
   or app.js is chapter-specific any more.
   -------------------------------------------------------------------------- */
const CHAPTER_PACKS = {
  c10_carbon: {
    sections: typeof CARBON_SECTIONS !== "undefined" ? CARBON_SECTIONS : [],
    groups: typeof CARBON_GROUPS !== "undefined" ? CARBON_GROUPS : [],
    quiz: typeof CARBON_QUIZ !== "undefined" ? CARBON_QUIZ : undefined,
    quizHi: typeof CARBON_QUIZ_HI !== "undefined" ? CARBON_QUIZ_HI : undefined,
    generated_by: "EduVerse · NCERT Ch 4 deep chapter pack (16 sections / 12 activities / 15 exercises)",
    activities: 12, exercises: 15
  },
  c10_light: {
    sections: LIGHT_SECTIONS, groups: LIGHT_GROUPS, quiz: LIGHT_QUIZ, quizHi: LIGHT_QUIZ_HI,
    generated_by: "EduVerse · NCERT Ch 9 ray-optics chapter pack (10 sections / 10 activities / 17 exercises)",
    activities: 10, exercises: 17
  }
};
