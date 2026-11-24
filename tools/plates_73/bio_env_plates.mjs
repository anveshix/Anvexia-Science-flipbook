// tools/plates_73/bio_env_plates.mjs
// 23 high-resolution 3D & studio Biology, Heredity, Diversity, Energy & Environment plates (2816x1536 -> 1408x768).
import {
  W, H, studioCanvas, floorShadow, drawSphere3D, roundRect,
  drawArrow, drawFloorTag, makeLabels
} from "./kit.mjs";

function drawDnaHelix(ctx, cx, y0, y1, radius = 64, turns = 2.5, mutIdx = -1) {
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = y0 + t * (y1 - y0);
    const a = t * Math.PI * 2 * turns;
    const x1 = cx + radius * Math.sin(a), x2 = cx - radius * Math.sin(a);
    // Base pair rung
    ctx.strokeStyle = i === mutIdx ? "#f59e0b" : (i % 2 === 0 ? "#60a5fa" : "#34d399");
    ctx.lineWidth = i === mutIdx ? 10 : 5.5;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    drawSphere3D(ctx, x1, y, 13, i === mutIdx ? "Au" : "N");
    drawSphere3D(ctx, x2, y, 13, i === mutIdx ? "O" : "N");
  }
}

export const BIO_ENV_PLATES = [
  // #18 c10_heredity §8.4 — Dihybrid cross & independent assortment (9 : 3 : 3 : 1)
  {
    id: "dihybrid_cross_punnett",
    wid: "c10_heredity",
    sec: "8.4",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1210 });
      const gametes = [["R","Y"], ["R","y"], ["r","Y"], ["r","y"]];
      const gx = 360, gy = 390, cs = 185;
      floorShadow(ctx, gx + cs * 2, 1185, 420, 36, 0.14);

      // Gamete headers
      gametes.forEach((g, i) => {
        ctx.fillStyle = "#1e293b"; ctx.font = '700 38px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText(g.join(""), gx + i * cs + cs / 2, gy - 26);
        ctx.fillText(g.join(""), gx - 58, gy + i * cs + cs / 2 + 12);
      });

      // 4x4 Punnett grid with exact 16 3D glossy Round/Wrinkled Yellow/Green pea seeds!
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const R_dom = gametes[r][0] === "R" || gametes[c][0] === "R";
          const Y_dom = gametes[r][1] === "Y" || gametes[c][1] === "Y";
          const x = gx + c * cs, y = gy + r * cs;
          ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 3.5;
          roundRect(ctx, x + 5, y + 5, cs - 10, cs - 10, 20); ctx.fill(); ctx.stroke();
          drawSphere3D(ctx, x + cs / 2, y + cs / 2 - 10, 48, Y_dom ? "peaYellow" : "peaGreen", { wrinkled: !R_dom });
          const geno = [gametes[r][0], gametes[c][0]].sort().join("") + [gametes[r][1], gametes[c][1]].sort().join("");
          ctx.fillStyle = "#334155"; ctx.font = '700 24px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
          ctx.fillText(geno, x + cs / 2, y + cs - 20);
        }
      }

      // Right: 9 : 3 : 3 : 1 Phenotype Tally Pedestals
      const phenos = [
        { y: 470, cnt: "9 / 16", lbl: "Round Yellow (R_Y_)", pal: "peaYellow", wr: false },
        { y: 655, cnt: "3 / 16", lbl: "Round Green (R_yy)", pal: "peaGreen", wr: false },
        { y: 840, cnt: "3 / 16", lbl: "Wrinkled Yellow (rrY_)", pal: "peaYellow", wr: true },
        { y: 1025, cnt: "1 / 16", lbl: "Wrinkled Green (rryy)", pal: "peaGreen", wr: true }
      ];
      for (const p of phenos) {
        ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4;
        roundRect(ctx, 1320, p.y - 68, 1260, 136, 26); ctx.fill(); ctx.stroke();
        drawSphere3D(ctx, 1425, p.y, 46, p.pal, { wrinkled: p.wr });
        ctx.fillStyle = "#1e3a8a"; ctx.font = '700 44px "DejaVu Sans", sans-serif'; ctx.textAlign = "left";
        ctx.fillText(p.cnt, 1515, p.y + 15);
        ctx.fillStyle = "#0f172a"; ctx.font = '600 36px "DejaVu Sans", sans-serif';
        ctx.fillText(p.lbl, 1715, p.y + 14);
      }
      drawFloorTag(ctx, 1408, 1315, "RrYy × RrYy: expected 9 : 3 : 3 : 1 with independent assortment", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 270, y: 185, en: "Four Gamete Types", hi: "चार प्रकार के युग्मक", info_en: "If R/r and Y/y assort independently, RY, Ry, rY and ry gametes are expected in equal proportions.", info_hi: "स्वतंत्र अपव्यूहन होने पर RY, Ry, rY और ry युग्मक समान अनुपात में अपेक्षित हैं।" },
      { x: 365, y: 380, en: "16 Gamete Combinations", hi: "16 युग्मक संयोजन", info_en: "With equally likely gametes and random fertilisation, the 4 × 4 grid has 16 equally probable combinations, not 16 different genotypes.", info_hi: "समान संभावित युग्मकों और यादृच्छिक निषेचन पर 4 × 4 वर्ग में 16 समान संभावित संयोजन होते हैं, 16 भिन्न जीनप्ररूप नहीं।" },
      { x: 715, y: 235, en: "9 Round Yellow", hi: "9 गोल पीले बीज", info_en: "Nine of the 16 equally probable combinations contain a dominant R and Y allele (R_Y_).", info_hi: "16 समान संभावित संयोजनों में से 9 में प्रभावी R और Y दोनों युग्मविकल्पी होते हैं (R_Y_)।" },
      { x: 715, y: 512, en: "3 : 3 : 1 Ratio Traits", hi: "3 : 3 : 1 नए व अप्रभावी", info_en: "Assuming independent assortment and complete dominance, the cross predicts 3/16 round green, 3/16 wrinkled yellow and 1/16 wrinkled green; individual samples may differ.", info_hi: "स्वतंत्र अपव्यूहन और पूर्ण प्रभाविता मानने पर इस संकरण में 3/16 गोल हरे, 3/16 झुर्रीदार पीले और 1/16 झुर्रीदार हरे अपेक्षित हैं; वास्तविक नमूने अलग हो सकते हैं।" }
    ])
  },

  // #25 c10_life §5.3 — Heterotrophic nutrition
  {
    id: "heterotrophic_nutrition_modes",
    wid: "c10_life",
    sec: "5.3",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // 1. Saprophytic: Gilled Mushrooms + White Mycelial Hyphae on decaying brown wood log
      floorShadow(ctx, 480, 1165, 310, 34, 0.16);
      ctx.fillStyle = "#78350f"; roundRect(ctx, 210, 960, 540, 180, 55); ctx.fill();
      // White hyphae threads inside wood + enzymes
      ctx.strokeStyle = "#fef9c3"; ctx.lineWidth = 4;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath(); ctx.moveTo(420 + i * 22, 960); ctx.quadraticCurveTo(390 + i * 28, 1040, 440 + i * 18, 1110); ctx.stroke();
      }
      // Two mushroom stalks & red-brown gilled caps
      for (const [mx, mh, cr] of [[410, 260, 125], [585, 190, 92]]) {
        ctx.fillStyle = "#fde68a"; ctx.strokeStyle = "#b45309"; ctx.lineWidth = 4;
        roundRect(ctx, mx - 24, 960 - mh, 48, mh, 18); ctx.fill(); ctx.stroke();
        // Gill underside ellipse
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath(); ctx.ellipse(mx, 960 - mh + 10, cr * 0.96, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        const cg = ctx.createRadialGradient(mx - 30, 960 - mh - 30, 10, mx, 960 - mh, cr);
        cg.addColorStop(0, "#fca5a5"); cg.addColorStop(1, "#991b1b");
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(mx, 960 - mh + 10, cr, Math.PI, 0); ctx.closePath(); ctx.fill();
      }
      drawFloorTag(ctx, 480, 1300, "Saprophytic (Fungi)", "#991b1b");

      // 2. Parasitic: Green host plant stem wrapped by golden-yellow Cuscuta (Amarbel) vine + penetrating haustoria
      floorShadow(ctx, 1408, 1165, 250, 34, 0.15);
      ctx.fillStyle = "#15803d"; roundRect(ctx, 1368, 430, 80, 720, 36); ctx.fill();
      drawSphere3D(ctx, 1310, 560, 44, "peaGreen"); drawSphere3D(ctx, 1505, 720, 44, "peaGreen");
      // Twining golden-yellow Cuscuta vine
      ctx.strokeStyle = "#eab308"; ctx.lineWidth = 18; ctx.lineCap = "round";
      ctx.beginPath();
      for (let y = 490; y <= 1080; y += 12) {
        const x = 1408 + 72 * Math.sin((y - 490) / 55);
        if (y === 490) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      drawFloorTag(ctx, 1408, 1300, "Parasitic (Cuscuta / Amarbel)", "#b45309");

      // 3. Holozoic: Translucent 3D Amoeba extending pseudopodia around green microalgae into food vacuole!
      floorShadow(ctx, 2310, 1165, 320, 34, 0.14);
      ctx.save();
      const ag = ctx.createRadialGradient(2260, 780, 30, 2280, 810, 310);
      ag.addColorStop(0, "rgba(186,230,253,0.88)"); ag.addColorStop(0.75, "rgba(56,189,248,0.58)"); ag.addColorStop(1, "rgba(2,132,199,0.82)");
      ctx.fillStyle = ag; ctx.strokeStyle = "#0369a1"; ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(2020, 810);
      ctx.bezierCurveTo(1990, 580, 2240, 520, 2490, 630);
      ctx.bezierCurveTo(2560, 665, 2410, 720, 2390, 780);
      ctx.bezierCurveTo(2415, 850, 2565, 900, 2490, 955);
      ctx.bezierCurveTo(2260, 1080, 2010, 1010, 2020, 810);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Nucleus + engulfed food vacuole + food particle between pseudopodia
      drawSphere3D(ctx, 2190, 810, 62, "Na");
      drawSphere3D(ctx, 2490, 790, 32, "peaGreen", { glow: "rgba(74,222,128,0.65)" });
      ctx.restore();
      drawFloorTag(ctx, 2310, 1300, "Holozoic (Amoeba Endocytosis)", "#0369a1");
      return cv;
    },
    marks: makeLabels([
      { x: 240, y: 410, en: "Saprophytic Nutrition", hi: "मृतजीवी पोषण (कवक)", info_en: "Fungi and moulds secrete digestive enzymes onto dead organic matter outside the body and absorb soluble nutrients.", info_hi: "कवक मृत कार्बनिक पदार्थ को शरीर के बाहर विघटित कर घुलित पोषक तत्व अवशोषित करते हैं।" },
      { x: 704, y: 395, en: "Parasitic Nutrition", hi: "परजीवी पोषण (अमरबेल)", info_en: "Cuscuta, ticks and tapeworms derive ready-made nutrition directly from a living host without killing it immediately.", info_hi: "अमरबेल जैसे परजीवी जीवित परपोषी पौधे या जंतु से बिना मारे अपना भोजन प्राप्त करते हैं।" },
      { x: 1095, y: 405, en: "Holozoic Amoeba", hi: "प्राणीसमभोजी पोषण (अमीबा)", info_en: "Organisms ingest solid complex food, digest it internally with enzymes, absorb nutrients and egest waste.", info_hi: "ठोस जटिल भोजन का अंतर्ग्रहण कर शरीर के भीतर पाचन व अवशोषण किया जाता है।" },
      { x: 1245, y: 395, en: "Pseudopodia & Food Vacuole", hi: "कूटपाद व खाद्य रसधानी", info_en: "Finger-like pseudopodia surround the food particle and fuse to form a digestive food vacuole.", info_hi: "अमीबा अँगुली जैसे कूटपाद फैलाकर भोजन घेरता है और खाद्य रसधानी में पचाता है।" }
    ])
  },

  // #26 c10_control §6.6 — Voluntary, involuntary and autonomic actions
  {
    id: "voluntary_involuntary_actions",
    wid: "c10_control",
    sec: "6.6",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // Left-center: 3D Sagittal Human Brain (Cerebrum, Cerebellum, Medulla + Spinal Cord)
      floorShadow(ctx, 760, 1175, 320, 36, 0.14);
      ctx.save();
      // Folded Pink Cerebrum
      const cbg = ctx.createRadialGradient(690, 560, 30, 740, 620, 320);
      cbg.addColorStop(0, "#fbcfe8"); cbg.addColorStop(0.65, "#f472b6"); cbg.addColorStop(1, "#be185d");
      ctx.fillStyle = cbg; ctx.strokeStyle = "#831843"; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(460, 720);
      ctx.bezierCurveTo(430, 440, 720, 360, 980, 460);
      ctx.bezierCurveTo(1090, 530, 1080, 720, 920, 760);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Gyri/sulci lines
      ctx.strokeStyle = "rgba(131,24,67,0.45)"; ctx.lineWidth = 4;
      for (const [x1,y1,x2,y2] of [[560,520,680,640],[710,450,790,630],[860,500,930,660]]) {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo((x1+x2)/2+25,(y1+y2)/2,x2,y2); ctx.stroke();
      }
      // Cerebellum (hindbrain dorsal)
      ctx.fillStyle = "#c084fc"; ctx.strokeStyle = "#581c87"; ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.ellipse(945, 835, 125, 88, -0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Medulla oblongata + brainstem descending
      ctx.fillStyle = "#fde047"; ctx.strokeStyle = "#a16207"; ctx.lineWidth = 4.5;
      roundRect(ctx, 735, 755, 92, 370, 40); ctx.fill(); ctx.stroke();
      ctx.restore();
      drawFloorTag(ctx, 760, 1300, "Forebrain (Cerebrum) · Hindbrain (Cerebellum & Medulla)", "#9d174d");

      // Right Upper: Voluntary Skeletal Muscle (Arm lifting / writing) driven by Cerebrum!
      drawArrow(ctx, 1020, 560, 1780, 540, "#be185d", 9, 28);
      ctx.fillStyle = "#ef4444"; ctx.strokeStyle = "#7f1d1d"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(2120, 540, 260, 82, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      drawFloorTag(ctx, 2120, 675, "Voluntary: Skeletal Muscle", "#b91c1c");

      // Right Lower: Involuntary & Autonomic Viscera (Heart + Peristaltic Gut) driven by Medulla!
      drawArrow(ctx, 835, 940, 1780, 940, "#ca8a04", 9, 28);
      drawSphere3D(ctx, 1980, 940, 88, "O", { symbol: "♥" });
      ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 34; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(2220, 890); ctx.bezierCurveTo(2380, 830, 2320, 1020, 2520, 960); ctx.stroke();
      drawFloorTag(ctx, 2180, 1140, "Involuntary: Heartbeat, Breathing & Gut", "#a16207");
      return cv;
    },
    marks: makeLabels([
      { x: 370, y: 285, en: "Cerebrum (Conscious)", hi: "प्रमस्तिष्क (ऐच्छिक कार्य)", info_en: "Thinking part of the forebrain initiates conscious voluntary actions such as writing, walking and speaking.", info_hi: "अग्रमस्तिष्क का प्रमस्तिष्क सोच-समझकर किए जाने वाले ऐच्छिक कार्यों को नियंत्रित करता है।" },
      { x: 472, y: 418, en: "Cerebellum (Posture)", hi: "अनुमस्तिष्क (संतुलन)", info_en: "Coordinates precision of voluntary movements like riding a bicycle and maintaining body balance.", info_hi: "अनुमस्तिष्क शरीर की मुद्रा, संतुलन और ऐच्छिक गतियों की सटीकता बनाए रखता है।" },
      { x: 390, y: 475, en: "Medulla (Involuntary)", hi: "मेडुला (अनैच्छिक क्रियाएँ)", info_en: "Hindbrain medulla regulates blood pressure, salivation, vomiting, heartbeat and breathing automatically.", info_hi: "पश्चमस्तिष्क का मेडुला रक्तचाप, लार आना, हृदय स्पंदन व श्वसन जैसी अनैच्छिक क्रियाएँ चलाता है।" },
      { x: 1060, y: 270, en: "Skeletal vs Smooth Effectors", hi: "कंकाल व चिकनी पेशियाँ", info_en: "Voluntary nerves drive striated skeletal muscles; autonomic pathways regulate cardiac and smooth visceral muscles.", info_hi: "ऐच्छिक तंत्रिकाएँ कंकाल पेशियों को तथा स्वायत्त तंत्रिकाएँ हृदय व आँत की पेशियों को चलाती हैं।" }
    ])
  },

  // #27 c10_control §6.8 — Feedback control and coordination
  {
    id: "hormonal_feedback_loop",
    wid: "c10_control",
    sec: "6.8",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1210 });
      // Circular negative feedback homeostasis diagram for Blood Glucose – Insulin
      // Top-left (680, 520): High Blood Glucose Vessel
      ctx.fillStyle = "#fee2e2"; ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 6;
      roundRect(ctx, 340, 420, 680, 170, 85); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 8; i++) drawSphere3D(ctx, 430 + i * 72, 505 + (i % 2) * 24 - 12, 20, "Au");
      drawFloorTag(ctx, 680, 365, "1. Blood Glucose Rises ↑", "#b91c1c");

      // Top-right (2120, 520): Pancreas secreting blue Insulin molecules
      ctx.fillStyle = "#fef08a"; ctx.strokeStyle = "#ca8a04"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.ellipse(2120, 505, 310, 95, -0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 5; i++) drawSphere3D(ctx, 1980 + i * 68, 635, 18, "electron", { glow: "rgba(59,130,246,0.55)" });
      drawFloorTag(ctx, 2120, 365, "2. Pancreas Secretes Insulin", "#1d4ed8");

      // Bottom-right (2120, 990): Liver & Muscle Cells converting Glucose -> Glycogen
      ctx.fillStyle = "#b45309"; ctx.strokeStyle = "#78350f"; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(1850, 1060); ctx.quadraticCurveTo(1920, 860, 2380, 910); ctx.lineTo(2340, 1080); ctx.closePath();
      ctx.fill(); ctx.stroke();
      drawFloorTag(ctx, 2120, 1155, "3. Cells Absorb Glucose → Glycogen", "#78350f");

      // Bottom-left (680, 990): Normal Balanced Blood Glucose Set-Point + Negative Feedback Inhibition (-)!
      ctx.fillStyle = "#dcfce7"; ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 6;
      roundRect(ctx, 340, 905, 680, 170, 85); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 3; i++) drawSphere3D(ctx, 520 + i * 160, 990, 20, "Au");
      drawFloorTag(ctx, 680, 1155, "4. Normal Glucose Restored", "#15803d");

      // Connecting arrows around cycle + diagonal dashed Negative Feedback Inhibition arrow to Pancreas!
      drawArrow(ctx, 1060, 505, 1760, 505, "#dc2626", 10, 30);
      drawArrow(ctx, 2120, 680, 2120, 845, "#2563eb", 10, 30);
      drawArrow(ctx, 1780, 990, 1060, 990, "#16a34a", 10, 30);
      drawArrow(ctx, 980, 885, 1820, 585, "#7e22ce", 9, 28, true);
      drawFloorTag(ctx, 1408, 735, "Negative Feedback (−): Stops Excess Insulin", "#6d28d9");
      drawFloorTag(ctx, 1408, 1315, "Feedback Mechanism Regulates Timing & Quantity of Hormone Release", "#0f172a");
      return cv;
    },
    marks: makeLabels([
      { x: 340, y: 252, en: "High Blood Sugar Stimulus", hi: "उच्च रक्त शर्करा संकेत", info_en: "After a carbohydrate-rich meal, rising blood glucose is sensed directly by pancreatic islet cells.", info_hi: "भोजन के बाद रक्त में बढ़ता ग्लूकोज़ स्तर अग्न्याशय की कोशिकाओं द्वारा पहचाना जाता है।" },
      { x: 1060, y: 252, en: "Pancreas Releases Insulin", hi: "अग्न्याशय से इंसुलिन स्राव", info_en: "In response, the pancreas secretes more insulin hormone into the bloodstream.", info_hi: "उच्च शर्करा के प्रत्युत्तर में अग्न्याशय रक्त में इंसुलिन हार्मोन स्रावित करता है।" },
      { x: 1060, y: 495, en: "Cellular Glucose Uptake", hi: "कोशिकीय शर्करा अवशोषण", info_en: "Insulin stimulates liver and muscle cells to take up glucose and store it as glycogen.", info_hi: "इंसुलिन यकृत व पेशी कोशिकाओं को ग्लूकोज़ ग्रहण कर ग्लाइकोजन बनाने को प्रेरित करता है।" },
      { x: 704, y: 368, en: "Negative Feedback Loop", hi: "ऋणात्मक पुनर्निवेश नियंत्रण", info_en: "Once blood sugar falls to normal, feedback inhibits further insulin secretion automatically.", info_hi: "रक्त शर्करा सामान्य होते ही पुनर्निवेश तंत्र इंसुलिन का स्राव स्वतः घटा देता है।" }
    ])
  },

  // #28 c10_repro §7.1 — Variation and the need for reproduction
  {
    id: "dna_copying_variation",
    wid: "c10_repro",
    sec: "7.1",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Left: Parent DNA helix splitting into two daughter DNA helices (one with glowing amber variation!)
      drawDnaHelix(ctx, 460, 380, 1080, 68, 2.2, -1);
      drawArrow(ctx, 580, 650, 860, 520, "#2563eb", 8, 24);
      drawArrow(ctx, 580, 810, 860, 940, "#d97706", 8, 24);
      drawDnaHelix(ctx, 1020, 340, 680, 48, 1.4, -1);
      drawDnaHelix(ctx, 1020, 760, 1110, 48, 1.4, 7);
      drawFloorTag(ctx, 740, 1300, "DNA Copying + Slight Biochemical Variation", "#1d4ed8");

      // Right: Microbial / Beetle population under Environmental Heat Shift — variants survive to continue species!
      ctx.fillStyle = "#dcfce7"; ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 5;
      roundRect(ctx, 1460, 430, 1120, 680, 42); ctx.fill(); ctx.stroke();
      // Normal blue microbes (sensitive to heat wave) vs Golden heat-tolerant variant microbes thriving on right!
      for (const [bx, by] of [[1660,590],[1780,740],[1640,910],[1820,960]]) {
        drawSphere3D(ctx, bx, by, 44, "electron");
      }
      drawArrow(ctx, 1940, 770, 2140, 770, "#ea580c", 11, 30);
      drawSphere3D(ctx, 2040, 560, 52, "Au", { glow: "rgba(251,146,60,0.7)", symbol: "ΔT" });
      for (const [gx, gy] of [[2280,580],[2420,710],[2260,860],[2430,950]]) {
        drawSphere3D(ctx, gx, gy, 48, "Au", { glow: "rgba(250,204,21,0.55)" });
      }
      drawFloorTag(ctx, 2020, 1300, "Adapted Variants Survive Environmental Change", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 230, y: 365, en: "Parent DNA Blueprint", hi: "जनक DNA ब्लूप्रिंट", info_en: "Chromosomal DNA holds the body-design blueprint copied before every cell division.", info_hi: "कोशिका विभाजन से पहले गुणसूत्र के DNA की प्रतिकृति बनकर शरीर-रचना की सूचना आगे जाती है।" },
      { x: 510, y: 470, en: "Inbuilt Variation", hi: "प्रतिकृति में विभिन्नता", info_en: "No biochemical copying reaction is 100% identical, generating subtle heritable variations.", info_hi: "जैव-रासायनिक प्रतिकृति पूर्णतः एकसमान न होने से संतति में सूक्ष्म विभिन्नताएँ उत्पन्न होती हैं।" },
      { x: 1020, y: 280, en: "Changing Niche (ΔT)", hi: "पर्यावरणीय बदलाव (ΔT)", info_en: "Sudden shifts in water temperature, climate or disease can wipe out uniform populations.", info_hi: "तापमान या आवास में अचानक बदलाव समान गुणों वाली पूरी समष्टि को नष्ट कर सकता है।" },
      { x: 1180, y: 410, en: "Species Survival", hi: "अनुकूलित जीवों की रक्षा", info_en: "Heat-resistant variants survive and reproduce, ensuring long-term continuity of the species.", info_hi: "ऊष्मा-रोधी विभिन्नता वाले जीव जीवित बचकर प्रजाति की निरंतरता बनाए रखते हैं।" }
    ])
  },

  // #29 c10_repro §7.7 — Fertilisation, embryo and menstrual cycle
  {
    id: "fertilisation_implantation_cycle",
    wid: "c10_repro",
    sec: "7.7",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // Clean 3D medical cutaway of Ovary -> Oviduct (Fallopian Tube) -> Muscular Uterus with thickened Endometrium!
      floorShadow(ctx, 1380, 1175, 680, 38, 0.14);
      ctx.save();
      // Uterine pear-shaped muscular wall + rich crimson endometrial lining
      ctx.fillStyle = "#fda4af"; ctx.strokeStyle = "#be123c"; ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(1180, 560); ctx.lineTo(1920, 560); ctx.bezierCurveTo(1960, 880, 1740, 1120, 1550, 1140);
      ctx.bezierCurveTo(1360, 1120, 1140, 880, 1180, 560); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Inner uterine cavity + vascular endometrium
      ctx.fillStyle = "#e11d48";
      ctx.beginPath(); ctx.moveTo(1310, 620); ctx.lineTo(1790, 620); ctx.lineTo(1550, 1050); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff1f2";
      ctx.beginPath(); ctx.moveTo(1390, 650); ctx.lineTo(1710, 650); ctx.lineTo(1550, 980); ctx.closePath(); ctx.fill();

      // Left Curved Fallopian Tube (Oviduct) + Ovary with fimbriae releasing Ovum!
      ctx.strokeStyle = "#fb7185"; ctx.lineWidth = 58; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(1220, 590); ctx.bezierCurveTo(860, 440, 520, 520, 460, 760); ctx.stroke();
      drawSphere3D(ctx, 520, 865, 84, "Au");
      ctx.fillStyle = "#78350f"; ctx.font = '700 32px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("Ovary", 520, 990);

      // Stages along Oviduct into Uterus: Ovulated Egg -> Fertilised Zygote -> Cleavage Morula -> Implanted Blastocyst!
      drawSphere3D(ctx, 545, 675, 28, "Au");
      drawSphere3D(ctx, 780, 520, 32, "N", { glow: "rgba(96,165,250,0.65)" });
      for (const [dx, dy] of [[-14,-12],[14,-12],[-14,14],[14,14]]) drawSphere3D(ctx, 1055 + dx, 545 + dy, 16, "Na");
      drawSphere3D(ctx, 1365, 775, 42, "O", { glow: "rgba(251,113,133,0.75)" });

      // Far Right Card: Placental Villi Disc vs 28-Day Menstrual Shedding if unfertilised
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4;
      roundRect(ctx, 2060, 480, 560, 620, 30); ctx.fill(); ctx.stroke();
      drawSphere3D(ctx, 2340, 655, 78, "O", { symbol: "O₂" });
      drawArrow(ctx, 2180, 765, 2500, 765, "#16a34a", 7, 22);
      ctx.fillStyle = "#334155"; ctx.font = '700 32px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("Placenta Disc (O₂ & Glucose)", 2340, 835);
      ctx.fillStyle = "#be123c";
      ctx.fillText("Unfertilised → ~28d Cycle", 2340, 985);
      ctx.restore();
      drawFloorTag(ctx, 1408, 1305, "Ovulation → Oviduct Fertilisation → Zygote Cleavage → Uterine Implantation & Placenta", "#9f1239");
      return cv;
    },
    marks: makeLabels([
      { x: 265, y: 420, en: "Ovary & Ovulation", hi: "अंडाशय व अंडोत्सर्ग", info_en: "One mature egg is released from an ovary roughly once every 28 days.", info_hi: "अंडाशय से लगभग हर 28 दिन में एक परिपक्व अंडाणु मुक्त होता है।" },
      { x: 390, y: 260, en: "Oviduct Fertilisation", hi: "अंडवाहिका में निषेचन", info_en: "Sperm fuses with the ovum inside the fallopian tube to form a diploid zygote that divides into an embryo.", info_hi: "फैलोपियन नलिका में शुक्राणु व अंडाणु के संलयन से युग्मनज बनता है जो विभाजित होकर भ्रूण बनाता है।" },
      { x: 682, y: 388, en: "Uterine Implantation", hi: "गर्भाशय अंतःरोपण व ऋतुस्राव", info_en: "Embryo embeds in thick spongy uterine lining; if unfertilised, the lining sheds as menstruation.", info_hi: "भ्रूण गर्भाशय की मोटी परत में रोपित होता है; निषेचन न होने पर यह परत मासिक धर्म के रूप में निकल जाती है।" },
      { x: 1170, y: 335, en: "Placenta Nutrition", hi: "अपरा (प्लैसेंटा) पोषण", info_en: "Disc-shaped placenta transfers glucose and O₂ from mother to embryo and removes wastes.", info_hi: "अपरा भ्रूण को माँ के रक्त से ग्लूकोज़ व ऑक्सीजन पहुँचाती है तथा अपशिष्ट हटाती है।" }
    ])
  },

  // #30 c10_repro §7.8 — Reproductive health and contraception
  {
    id: "contraceptive_methods_overview",
    wid: "c10_repro",
    sec: "7.8",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      const cards = [
        { cx: 400, col: "#0284c7", title: "Mechanical Barrier", sub: "Blocks sperm + STI shield" },
        { cx: 1072, col: "#b45309", title: "Copper-T (IUCD)", sub: "Prevents implantation" },
        { cx: 1744, col: "#7e22ce", title: "Oral Hormonal Pills", sub: "Inhibits egg release" },
        { cx: 2416, col: "#15803d", title: "Surgical Block", sub: "Vasectomy / Tubectomy" }
      ];
      for (const c of cards) {
        floorShadow(ctx, c.cx, 1175, 270, 32, 0.14);
        ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4.5;
        roundRect(ctx, c.cx - 295, 440, 590, 690, 32); ctx.fill(); ctx.stroke();
        ctx.fillStyle = c.col; ctx.font = '700 38px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText(c.title, c.cx, 1020);
        ctx.fillStyle = "#475569"; ctx.font = '600 28px "DejaVu Sans", sans-serif';
        ctx.fillText(c.sub, c.cx, 1075);
      }
      // 1. Barrier shield icon
      ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.moveTo(400, 540); ctx.lineTo(540, 600); ctx.quadraticCurveTo(540, 820, 400, 910); ctx.quadraticCurveTo(260, 820, 260, 600); ctx.closePath(); ctx.stroke();
      // 2. Copper-T geometric medical T-device wrapped in copper coil
      ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 22; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(935, 590); ctx.lineTo(1210, 590); ctx.moveTo(1072, 590); ctx.lineTo(1072, 890); ctx.stroke();
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 10;
      for (let y = 650; y <= 830; y += 26) { ctx.beginPath(); ctx.moveTo(1055, y); ctx.lineTo(1090, y + 12); ctx.stroke(); }
      // 3. Circular 21-tablet blister pack
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        drawSphere3D(ctx, 1744 + 135 * Math.cos(a), 725 + 135 * Math.sin(a), 22, "Li");
      }
      // 4. Surgical tube ligation schematic
      ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 18;
      ctx.beginPath(); ctx.moveTo(2240, 725); ctx.lineTo(2375, 725); ctx.moveTo(2455, 725); ctx.lineTo(2590, 725); ctx.stroke();
      ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(2375, 685); ctx.lineTo(2375, 765); ctx.moveTo(2455, 685); ctx.lineTo(2455, 765); ctx.stroke();
      drawFloorTag(ctx, 1408, 1305, "Four Categories of Contraception & Family Health Protection", "#0f172a");
      return cv;
    },
    marks: makeLabels([
      { x: 200, y: 365, en: "Mechanical Barrier", hi: "यांत्रिक अवरोध विधि", info_en: "Physically prevents sperm from reaching the egg and also protects against sexually transmitted infections.", info_hi: "शुक्राणु को अंडाणु तक पहुँचने से रोकती है और यौन संचारित संक्रमणों से भी सुरक्षा देती है।" },
      { x: 536, y: 365, en: "Intrauterine Copper-T", hi: "कॉपर-T (IUCD)", info_en: "Placed inside the uterus by a clinician to prevent fertilisation and implantation.", info_hi: "चिकित्सक द्वारा गर्भाशय में स्थापित कॉपर-T निषेचन और रोपण को रोकता है।" },
      { x: 872, y: 365, en: "Hormonal Oral Pills", hi: "हार्मोनल गर्भनिरोधक गोलियाँ", info_en: "Alter hormonal balance so the ovary does not release an egg; taken under medical guidance.", info_hi: "हार्मोन संतुलन बदलकर अंडोत्सर्ग रोकती हैं; इन्हें चिकित्सकीय सलाह से लिया जाता है।" },
      { x: 1208, y: 365, en: "Surgical Methods", hi: "शल्यक्रिया विधि", info_en: "Blocking vas deferens in males or fallopian tubes in females permanently stops gamete transport.", info_hi: "शुक्रवाहिका या अंडवाहिका को अवरुद्ध कर युग्मक स्थानांतरण स्थायी रूप से रोका जाता है।" }
    ])
  },

  // #31 c10_repro §7.9 — HIV, AIDS and women's health
  {
    id: "hiv_immunity_health",
    wid: "c10_repro",
    sec: "7.9",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Left: 3D Cutaway HIV Retrovirus showing Envelope Spikes, Conical Capsid & 2 ssRNA strands
      floorShadow(ctx, 640, 1170, 320, 36, 0.15);
      const vx = 640, vy = 760, vr = 240;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.moveTo(vx + (vr - 10) * Math.cos(a), vy + (vr - 10) * Math.sin(a));
        ctx.lineTo(vx + (vr + 44) * Math.cos(a), vy + (vr + 44) * Math.sin(a)); ctx.stroke();
        drawSphere3D(ctx, vx + (vr + 48) * Math.cos(a), vy + (vr + 48) * Math.sin(a), 18, "O");
      }
      drawSphere3D(ctx, vx, vy, vr, ["#fecaca", "#ef4444", "#7f1d1d", "#fee2e2"]);
      // Inner conical capsid + 2 RNA strands
      ctx.fillStyle = "#fef3c7"; ctx.strokeStyle = "#b45309"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(vx - 70, vy - 130); ctx.lineTo(vx + 70, vy - 130); ctx.lineTo(vx + 105, vy + 125); ctx.lineTo(vx - 105, vy + 125); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(vx - 30, vy - 95); ctx.quadraticCurveTo(vx - 55, vy, vx - 25, vy + 95); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(vx + 30, vy - 95); ctx.quadraticCurveTo(vx + 55, vy, vx + 25, vy + 95); ctx.stroke();

      // Center: CD4 Helper T-Lymphocyte Immune Cell
      floorShadow(ctx, 1520, 1170, 270, 34, 0.14);
      drawSphere3D(ctx, 1520, 770, 205, "electron", { symbol: "CD4⁺ T" });

      // Right: Diagnostic Screening Test + Maternal/Community Care Shield
      floorShadow(ctx, 2320, 1170, 290, 34, 0.14);
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 6;
      roundRect(ctx, 2040, 490, 560, 580, 36); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(2292, 620, 56, 210); ctx.fillRect(2215, 697, 210, 56);
      ctx.fillStyle = "#0f172a"; ctx.font = '700 34px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("Screening · ART · Zero Stigma", 2320, 965);
      drawFloorTag(ctx, 1408, 1305, "HIV Targets Immune T-Cells · Early Screening, Sterile Care & Antiretroviral Therapy Protect Life", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 320, y: 380, en: "HIV Retrovirus Structure", hi: "HIV विषाणु संरचना", info_en: "Enveloped RNA virus carrying surface glycoproteins and reverse transcriptase inside a protein capsid.", info_hi: "लिपिड आवरण और प्रोटीन कैप्सिड के भीतर RNA रखने वाला रेट्रोवायरस।" },
      { x: 760, y: 385, en: "Helper T-Lymphocyte", hi: "सहायक T-लसीकाणु (प्रतिरक्षा)", info_en: "HIV progressively depletes CD4⁺ immune T-cells, weakening defence against opportunistic infections.", info_hi: "HIV शरीर की प्रतिरक्षा करने वाली T-कोशिकाओं को कमजोर करता है।" },
      { x: 1160, y: 350, en: "Screening & Safe Blood", hi: "जाँच व सुरक्षित रक्त आधान", info_en: "Confidential blood testing, sterile needles and antenatal screening prevent transmission.", info_hi: "समय पर रक्त जाँच, विसंक्रमित सुइयाँ और प्रसवपूर्व देखभाल संक्रमण रोकते हैं।" },
      { x: 1160, y: 485, en: "Women's Health & Dignity", hi: "महिला स्वास्थ्य व जागरूकता", info_en: "Scientific awareness, nutrition, medical care and ending social stigma safeguard community health.", info_hi: "पोषण, चिकित्सकीय परामर्श और सामाजिक भेदभाव समाप्त करना सामुदायिक स्वास्थ्य की कुंजी है।" }
    ])
  },

  // #32 c10_env §13.1 — Ecosystem and its components
  {
    id: "ecosystem_biotic_abiotic",
    wid: "c10_env",
    sec: "13.1",
    render() {
      const { cv, ctx } = studioCanvas({ bench: false });
      // 3D Cutaway Pond-Meadow Ecosystem Block!
      floorShadow(ctx, 1408, 1320, 1180, 48, 0.16);
      // Sky & Sun (Abiotic)
      const sky = ctx.createLinearGradient(160, 250, 160, 880);
      sky.addColorStop(0, "#e0f2fe"); sky.addColorStop(1, "#bae6fd");
      ctx.fillStyle = sky; roundRect(ctx, 160, 250, 2496, 1020, 40); ctx.fill();
      drawSphere3D(ctx, 380, 390, 82, "Au", { glow: "rgba(250,204,21,0.85)" });

      // Green Terrestrial Bank (left) + Freshwater Pond Basin (center-right) + Soil/Benthic Bed (bottom)
      ctx.fillStyle = "#22c55e";
      ctx.beginPath(); ctx.moveTo(160, 780); ctx.lineTo(1060, 780); ctx.lineTo(1260, 1120); ctx.lineTo(160, 1120); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(14,165,233,0.62)";
      ctx.beginPath(); ctx.moveTo(1060, 810); ctx.lineTo(2656, 810); ctx.lineTo(2656, 1120); ctx.lineTo(1220, 1120); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#78350f";
      roundRect(ctx, 160, 1090, 2496, 180, 32); ctx.fill();

      // Producers: Green tree & reeds on left bank + aquatic plants
      ctx.fillStyle = "#92400e"; roundRect(ctx, 640, 560, 44, 240, 10); ctx.fill();
      drawSphere3D(ctx, 662, 510, 110, "peaGreen");
      for (const rx of [980, 1030, 2460]) {
        ctx.strokeStyle = "#15803d"; ctx.lineWidth = 14;
        ctx.beginPath(); ctx.moveTo(rx, 820); ctx.lineTo(rx, 610); ctx.stroke();
      }

      // Consumers: Golden fish + green frog
      ctx.fillStyle = "#f97316";
      ctx.beginPath(); ctx.ellipse(1740, 950, 95, 44, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(1830, 950); ctx.lineTo(1900, 910); ctx.lineTo(1900, 990); ctx.closePath(); ctx.fill();
      drawSphere3D(ctx, 1140, 765, 42, "peaGreen");

      // Decomposers in soil/sediment bed (fungi + microbes recycling minerals!)
      for (const dx of [520, 1560, 2180]) {
        drawSphere3D(ctx, dx, 1180, 26, "Cu");
        drawSphere3D(ctx, dx + 55, 1190, 20, "Fe");
      }
      drawArrow(ctx, 1600, 1150, 820, 780, "#fef08a", 7, 22, true);
      drawFloorTag(ctx, 1408, 1395, "Ecosystem = Biotic Community (Producers, Consumers, Decomposers) ⟷ Abiotic Factors", "#0f766e");
      return cv;
    },
    marks: makeLabels([
      { x: 190, y: 195, en: "Abiotic Factors", hi: "अजैविक घटक (धूप, जल, मृदा)", info_en: "Sunlight, temperature, water, dissolved gases and soil minerals supply energy and raw matter.", info_hi: "सूर्यप्रकाश, ताप, जल, वायु और खनिज मृदा पारिस्थितिक तंत्र के भौतिक अजैविक घटक हैं।" },
      { x: 331, y: 255, en: "Producers (Autotrophs)", hi: "उत्पादक (हरे पौधे व शैवाल)", info_en: "Green plants and phytoplankton capture solar energy via photosynthesis to synthesise organic food.", info_hi: "हरे पौधे व शैवाल प्रकाश-संश्लेषण द्वारा सौर ऊर्जा को रासायनिक भोजन में बदलते हैं।" },
      { x: 870, y: 475, en: "Consumers (Heterotrophs)", hi: "उपभोक्ता (परपोषी जंतु)", info_en: "Insects, fish, frogs and birds depend directly or indirectly on producers for energy.", info_hi: "मछली, मेंढक व कीट जैसे उपभोक्ता प्रत्यक्ष या परोक्ष रूप से उत्पादकों पर निर्भर रहते हैं।" },
      { x: 1090, y: 590, en: "Decomposers (Recyclers)", hi: "अपघटक (जीवाणु व कवक)", info_en: "Bacteria and fungi break down dead remains into simple inorganic minerals for reuse by plants.", info_hi: "जीवाणु और कवक मृत अवशेषों को सरल अकार्बनिक पोषकों में बदलकर मिट्टी में लौटाते हैं।" }
    ])
  },

  // #55 c9_reproduction9 §11.8 — Gametes, menstrual cycle and pregnancy
  {
    id: "gametes_cycle_pregnancy",
    wid: "c9_reproduction9",
    sec: "11.8",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // 1. Left: Haploid Ovum (n=23) + Flagellated Sperm (n=23)
      drawSphere3D(ctx, 390, 680, 92, "Au", { symbol: "Ovum (n)" });
      drawSphere3D(ctx, 625, 860, 26, "electron");
      ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(650, 860); ctx.bezierCurveTo(710, 830, 740, 895, 810, 865); ctx.stroke();
      drawFloorTag(ctx, 480, 1300, "Haploid Gametes (n + n → 2n)", "#1d4ed8");

      // 2. Center: 28-Day Endometrial Thickness Graph with Day-14 Ovulation Marker!
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4.5;
      roundRect(ctx, 920, 450, 920, 660, 30); ctx.fill(); ctx.stroke();
      drawArrow(ctx, 1000, 1010, 1780, 1010, "#334155", 6, 20);
      drawArrow(ctx, 1000, 1010, 1000, 520, "#334155", 6, 20);
      // Endometrial thickness wave (days 1-5 shedding, 6-14 rebuilding, 14 ovulation, 15-28 secretory)
      ctx.fillStyle = "rgba(244,63,94,0.38)"; ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(1010, 820); ctx.lineTo(1140, 965);
      ctx.bezierCurveTo(1280, 950, 1360, 740, 1420, 690);
      ctx.bezierCurveTo(1560, 610, 1680, 620, 1760, 690);
      ctx.lineTo(1760, 1006); ctx.lineTo(1010, 1006); ctx.closePath(); ctx.fill(); ctx.stroke();
      drawSphere3D(ctx, 1420, 555, 28, "Au", { glow: "rgba(250,204,21,0.85)" });
      ctx.fillStyle = "#0f172a"; ctx.font = '700 28px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("Day 1–5       Day 14 (Ovulation)       Day 28", 1390, 1065);
      drawFloorTag(ctx, 1380, 1300, "28-Day Ovarian & Uterine Cycle", "#be123c");

      // 3. Right: Embryo inside Amniotic Sac + Umbilical Cord + Placenta
      floorShadow(ctx, 2320, 1175, 270, 34, 0.14);
      ctx.fillStyle = "#ffe4e6"; ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.ellipse(2320, 780, 250, 310, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#bae6fd";
      ctx.beginPath(); ctx.ellipse(2320, 780, 195, 245, 0, 0, Math.PI * 2); ctx.fill();
      // Placenta wall + coiled cord + developing embryo curve
      ctx.fillStyle = "#be123c";
      ctx.beginPath(); ctx.ellipse(2150, 780, 36, 150, 0, 0, Math.PI * 2); ctx.fill();
      drawSphere3D(ctx, 2365, 730, 56, "Cu");
      drawSphere3D(ctx, 2350, 835, 68, "Cu");
      ctx.strokeStyle = "#9f1239"; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(2180, 780); ctx.quadraticCurveTo(2260, 850, 2310, 825); ctx.stroke();
      drawFloorTag(ctx, 2320, 1300, "Pregnancy: Amniotic Sac & Placenta", "#9f1239");
      return cv;
    },
    marks: makeLabels([
      { x: 215, y: 345, en: "Ovum & Sperm Gametes", hi: "अंडाणु और शुक्राणु युग्मक", info_en: "Large nutrient-rich female ovum fuses with motile male sperm to restore diploid chromosome count.", info_hi: "अंडाणु और गतिशील शुक्राणु के निषेचन से द्विगुणित युग्मनज बनता है।" },
      { x: 710, y: 278, en: "Day-14 Ovulation", hi: "14वें दिन अंडोत्सर्ग", info_en: "About mid-cycle (~day 14 of 28), the ovary releases a mature egg while uterine lining thickens.", info_hi: "लगभग 28 दिन के चक्र के मध्य में अंडाशय एक अंडाणु मुक्त करता है।" },
      { x: 760, y: 420, en: "Endometrial Lining", hi: "गर्भाशय अंतःस्तर चक्र", info_en: "Spongy blood-rich uterine wall prepares to nourish an embryo, or sheds as menstruation if unfertilised.", info_hi: "गर्भाशय की रक्त-समृद्ध परत गर्भावस्था को सहारा देती है; निषेचन न होने पर ऋतुस्राव होता है।" },
      { x: 1160, y: 390, en: "Embryo & Placenta", hi: "भ्रूण, उल्ब व अपरा", info_en: "Fluid-filled amniotic sac cushions the foetus while the placenta exchanges oxygen, food and wastes.", info_hi: "उल्ब तरल भ्रूण की रक्षा करता है तथा अपरा पोषण व ऑक्सीजन प्रदान करती है।" }
    ])
  },

  // #56 c9_reproduction9 §11.9 — Reproductive health, hygiene and birth control
  {
    id: "adolescent_reproductive_hygiene",
    wid: "c9_reproduction9",
    sec: "11.9",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // Four clean textbook health pillars left-to-right: Iron-rich Nutrition, Clean Hygiene, Medical Guidance, Family Planning
      const items = [
        { cx: 400, col: "#16a34a", sym: "Fe + Vit", tag: "Balanced Nutrition" },
        { cx: 1072, col: "#0284c7", sym: "H₂O", tag: "Personal Hygiene" },
        { cx: 1744, col: "#dc2626", sym: "+", tag: "Medical Check-ups" },
        { cx: 2416, col: "#7e22ce", sym: "Plan", tag: "Birth Control & Spacing" }
      ];
      for (const it of items) {
        floorShadow(ctx, it.cx, 1175, 265, 32, 0.14);
        ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4.5;
        roundRect(ctx, it.cx - 285, 450, 570, 680, 32); ctx.fill(); ctx.stroke();
        drawSphere3D(ctx, it.cx, 735, 130, it.col === "#16a34a" ? "peaGreen" : it.col === "#0284c7" ? "electron" : it.col === "#dc2626" ? "O" : "Na", { symbol: it.sym });
        drawFloorTag(ctx, it.cx, 1300, it.tag, it.col);
      }
      return cv;
    },
    marks: makeLabels([
      { x: 200, y: 368, en: "Iron & Protein Diet", hi: "लौह व प्रोटीन युक्त पोषण", info_en: "Green leafy vegetables, pulses and fruits prevent adolescent anaemia and support healthy growth.", info_hi: "हरी सब्जियाँ, दालें और फल किशोरावस्था में रक्ताल्पता रोकते हैं और स्वस्थ वृद्धि देते हैं।" },
      { x: 536, y: 368, en: "Menstrual & Daily Hygiene", hi: "व्यक्तिगत व मासिक स्वच्छता", info_en: "Clean water, soap and safe sanitary hygiene prevent reproductive tract infections.", info_hi: "नियमित स्नान व स्वच्छ सैनिटरी देखभाल संक्रमणों से बचाव करती है।" },
      { x: 872, y: 368, en: "Qualified Healthcare", hi: "चिकित्सकीय परामर्श व टीकाकरण", info_en: "Timely medical advice, STI prevention and antenatal care protect maternal and infant survival.", info_hi: "समय पर चिकित्सकीय जाँच और परामर्श माता व शिशु के स्वास्थ्य की रक्षा करते हैं।" },
      { x: 1208, y: 368, en: "Family Planning Methods", hi: "जन्म नियंत्रण व अंतराल", info_en: "Appropriate age at marriage and safe barrier/hormonal spacing protect physical and mental readiness.", info_hi: "सुरक्षित गर्भनिरोधक विधियाँ और उचित अंतराल परिवार व माता के स्वास्थ्य को सुरक्षित रखते हैं।" }
    ])
  },

  // #57 c9_diversity §12.1 — Why classification is needed
  {
    id: "need_for_classification",
    wid: "c9_diversity",
    sec: "12.1",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // Branching Phylogenetic Decision Tree sorting All Organisms by 3 foundational evolutionary traits!
      const nodes = [
        { x: 420, y: 760, w: 420, h: 130, bg: "#1e293b", fg: "#ffffff", txt: "Living Organisms" },
        { x: 1120, y: 490, w: 430, h: 120, bg: "#fef3c7", fg: "#92400e", txt: "Prokaryotes (Monera)" },
        { x: 1120, y: 960, w: 430, h: 120, bg: "#dbeafe", fg: "#1e40af", txt: "Eukaryotes (Nucleated)" },
        { x: 1860, y: 730, w: 410, h: 115, bg: "#ede9fe", fg: "#5b21b6", txt: "Unicellular (Protista)" },
        { x: 1860, y: 1080, w: 410, h: 115, bg: "#dcfce7", fg: "#166534", txt: "Multicellular" },
        { x: 2470, y: 890, w: 390, h: 115, bg: "#bbf7d0", fg: "#14532d", txt: "Plantae & Fungi" },
        { x: 2470, y: 1160, w: 390, h: 115, bg: "#fee2e2", fg: "#991b1b", txt: "Animalia (No Wall)" }
      ];
      const edges = [[0,1],[0,2],[2,3],[2,4],[4,5],[4,6]];
      for (const [a, b] of edges) {
        drawArrow(ctx, nodes[a].x + nodes[a].w / 2, nodes[a].y, nodes[b].x - nodes[b].w / 2, nodes[b].y, "#64748b", 7, 22);
      }
      for (const n of nodes) {
        floorShadow(ctx, n.x, n.y + n.h / 2 + 10, n.w * 0.45, 18, 0.12);
        ctx.fillStyle = n.bg; ctx.strokeStyle = n.fg; ctx.lineWidth = 4;
        roundRect(ctx, n.x - n.w / 2, n.y - n.h / 2, n.w, n.h, 24); ctx.fill(); ctx.stroke();
        ctx.fillStyle = n.fg; ctx.font = '700 32px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText(n.txt, n.x, n.y + 10);
      }
      drawFloorTag(ctx, 1408, 1320, "Fundamental Criteria: Cell Nucleus → Unicellular/Multicellular → Cell Wall & Photosynthesis", "#0f172a");
      return cv;
    },
    marks: makeLabels([
      { x: 210, y: 380, en: "Millions of Species", hi: "विशाल जैव-विविधता का संगठन", info_en: "Grouping organisms by shared fundamental traits makes studying millions of species systematic.", info_hi: "लाखों जीवों का एक-एक कर अध्ययन असंभव है; वर्गीकरण उन्हें समान गुणों वाले समूहों में बाँटता है।" },
      { x: 560, y: 245, en: "1. Nuclear Structure", hi: "1. केंद्रक की उपस्थिति", info_en: "First major split separates prokaryotic cells without a defined nucleus from nucleated eukaryotes.", info_hi: "पहला मुख्य आधार सुस्पष्ट केंद्रक का न होना (प्रोकैरियोट) या होना (यूकैरियोट) है।" },
      { x: 930, y: 365, en: "2. Cellularity", hi: "2. एककोशिकीय बनाम बहुकोशिकीय", info_en: "Multicellularity introduces division of labour among tissues and organs.", info_hi: "बहुकोशिकीय जीवों में श्रम-विभाजन के कारण ऊतक व अंग विकसित होते हैं।" },
      { x: 1235, y: 445, en: "3. Mode of Nutrition", hi: "3. कोशिका भित्ति व पोषण विधि", info_en: "Photosynthetic autotrophs (Plantae) separate from absorptive Fungi and ingestive Animalia.", info_hi: "प्रकाश-संश्लेषी पादप, मृतजीवी कवक तथा भित्ति-रहित जंतु पोषण के आधार पर अलग होते हैं।" }
    ])
  },

  // #58 c9_diversity §12.4 — Major divisions of plants
  {
    id: "major_plant_divisions",
    wid: "c9_diversity",
    sec: "12.4",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // 5 Divisions left-to-right showing evolutionary acquisition of Differentiated Body -> Vascular Tissue -> Seeds -> Fruit/Flowers!
      const divs = [
        { cx: 310, name: "Thallophyta", sub: "Algae (No root/stem)", h: 240, col: "#0d9488" },
        { cx: 859, name: "Bryophyta", sub: "Moss (Amphibian)", h: 310, col: "#16a34a" },
        { cx: 1408, name: "Pteridophyta", sub: "Fern (1st Vascular)", h: 420, col: "#15803d" },
        { cx: 1957, name: "Gymnospermae", sub: "Pine (Naked Seed)", h: 520, col: "#166534" },
        { cx: 2506, name: "Angiospermae", sub: "Flower + Enclosed Seed", h: 590, col: "#be185d" }
      ];
      divs.forEach((d, idx) => {
        floorShadow(ctx, d.cx, 1165, 210, 28, 0.14);
        ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4;
        roundRect(ctx, d.cx - 235, 1140 - d.h - 140, 470, d.h + 150, 28); ctx.fill(); ctx.stroke();

        // Botanical specimen visual
        ctx.strokeStyle = "#15803d"; ctx.lineWidth = 14; ctx.lineCap = "round";
        if (idx === 0) {
          // Spiral green Spirogyra filaments in water
          for (const dx of [-55, 0, 55]) {
            ctx.beginPath(); ctx.moveTo(d.cx + dx, 1020); ctx.bezierCurveTo(d.cx + dx - 30, 920, d.cx + dx + 30, 850, d.cx + dx, 780); ctx.stroke();
          }
        } else if (idx === 1) {
          // Leafy moss cushion + stalked spore capsule
          drawSphere3D(ctx, d.cx, 990, 75, "peaGreen");
          ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(d.cx, 930); ctx.lineTo(d.cx, 760); ctx.stroke();
          drawSphere3D(ctx, d.cx, 750, 24, "Fe");
        } else if (idx === 2) {
          // Pinnate vascular fern frond
          ctx.beginPath(); ctx.moveTo(d.cx, 1050); ctx.quadraticCurveTo(d.cx + 15, 820, d.cx - 10, 660); ctx.stroke();
          for (let y = 710; y <= 980; y += 54) {
            ctx.lineWidth = 10;
            ctx.beginPath(); ctx.moveTo(d.cx - 85, y + 18); ctx.lineTo(d.cx, y); ctx.lineTo(d.cx + 85, y + 18); ctx.stroke();
          }
        } else if (idx === 3) {
          // Woody pine branch + brown woody cone (naked seeds)
          ctx.strokeStyle = "#78350f"; ctx.lineWidth = 22;
          ctx.beginPath(); ctx.moveTo(d.cx, 1060); ctx.lineTo(d.cx, 560); ctx.stroke();
          drawSphere3D(ctx, d.cx, 660, 105, "peaGreen");
          drawSphere3D(ctx, d.cx + 55, 825, 48, "Fe");
        } else {
          // Flowering & fruiting angiosperm!
          ctx.strokeStyle = "#15803d"; ctx.lineWidth = 18;
          ctx.beginPath(); ctx.moveTo(d.cx, 1060); ctx.lineTo(d.cx, 540); ctx.stroke();
          for (let a = 0; a < 5; a++) {
            const ang = (a / 5) * Math.PI * 2;
            drawSphere3D(ctx, d.cx + 56 * Math.cos(ang), 560 + 56 * Math.sin(ang), 34, "Li");
          }
          drawSphere3D(ctx, d.cx, 560, 26, "Au");
          drawSphere3D(ctx, d.cx + 75, 825, 52, "O");
        }
        ctx.fillStyle = d.col; ctx.font = '700 34px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText(d.name, d.cx, 1095);
        ctx.fillStyle = "#475569"; ctx.font = '600 24px "DejaVu Sans", sans-serif';
        ctx.fillText(d.sub, d.cx, 1132);
      });
      drawFloorTag(ctx, 1408, 1305, "Plant Evolution: Undifferentiated Thallus → Differentiated → Vascular (Xylem/Phloem) → Naked Seeds → Fruits", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 155, y: 460, en: "Thallophyta & Bryophyta", hi: "थैलोफ़ाइटा व ब्रायोफ़ाइटा", info_en: "Algae lack differentiated organs; mosses have stem/leaf-like parts without true vascular tissue.", info_hi: "शैवाल में जड़-तना विभेदित नहीं होते; ब्रायोफ़ाइटा (मॉस) पादप जगत के उभयचर कहलाते हैं।" },
      { x: 704, y: 420, en: "Pteridophyta (Ferns)", hi: "टेरिडोफ़ाइटा (संवहनी पादप)", info_en: "First land plants with true roots, stems, leaves and vascular xylem/phloem, reproducing via spores.", info_hi: "वास्तविक जड़, तना, पत्ती तथा जाइलम-फ्लोएम संवहन ऊतक वाले प्रथम बीजरहित पादप।" },
      { x: 978, y: 390, en: "Gymnosperms (Naked Seeds)", hi: "जिम्नोस्पर्म (अनावृतबीजी)", info_en: "Evergreen woody pines and cycads bear uncovered seeds on cones without flowers or fruits.", info_hi: "चीड़ व साइकस जैसे पौधों में बीज फल के आवरण के बिना नग्न रूप से शंकुओं पर लगते हैं।" },
      { x: 1253, y: 330, en: "Angiosperms (Flowering)", hi: "एंजियोस्पर्म (आवृतबीजी)", info_en: "Seeds develop inside ovaries that ripen into fruits; includes monocots and dicots.", info_hi: "पुष्पी पादपों में बीज फलों के भीतर सुरक्षित रहते हैं (एकबीजपत्री व द्विबीजपत्री)।" }
    ])
  },

  // #59 c9_diversity §12.5 — Major divisions of animals
  {
    id: "major_animal_divisions",
    wid: "c9_diversity",
    sec: "12.5",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      const phyla = [
        { cx: 280, name: "Porifera", trait: "Pores · Cellular" },
        { cx: 731, name: "Cnidaria", trait: "Radial · 2 Layers" },
        { cx: 1182, name: "Annelida", trait: "Segmented Coelom" },
        { cx: 1633, name: "Arthropoda", trait: "Jointed Legs" },
        { cx: 2084, name: "Echinodermata", trait: "Spiny · Marine" },
        { cx: 2535, name: "Chordata", trait: "Dorsal Notochord" }
      ];
      phyla.forEach((p, idx) => {
        floorShadow(ctx, p.cx, 1165, 185, 26, 0.14);
        ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4;
        roundRect(ctx, p.cx - 205, 480, 410, 660, 26); ctx.fill(); ctx.stroke();

        // Zoological body-plan emblem
        if (idx === 0) {
          // Porous sponge cylinder with osculum
          ctx.fillStyle = "#fde047"; strokeRound(ctx, p.cx - 65, 620, 130, 290, 45);
          for (let y = 670; y <= 860; y += 52) { drawSphere3D(ctx, p.cx - 28, y, 10, "Fe"); drawSphere3D(ctx, p.cx + 28, y + 20, 10, "Fe"); }
        } else if (idx === 1) {
          // Hydra polyp with radial tentacles
          ctx.fillStyle = "#34d399"; strokeRound(ctx, p.cx - 32, 700, 64, 220, 28);
          ctx.strokeStyle = "#059669"; ctx.lineWidth = 8;
          for (const dx of [-85, -45, 0, 45, 85]) { ctx.beginPath(); ctx.moveTo(p.cx, 705); ctx.quadraticCurveTo(p.cx + dx * 0.6, 610, p.cx + dx, 565); ctx.stroke(); }
        } else if (idx === 2) {
          // Segmented annelid earthworm rings
          for (let s = 0; s < 8; s++) drawSphere3D(ctx, p.cx - 95 + s * 28, 760 + 38 * Math.sin(s * 0.7), 28, "Cu");
        } else if (idx === 3) {
          // Jointed-leg bilateral arthropod (butterfly/insect)
          drawSphere3D(ctx, p.cx - 68, 730, 58, "Na"); drawSphere3D(ctx, p.cx + 68, 730, 58, "Na");
          ctx.fillStyle = "#1e293b"; strokeRound(ctx, p.cx - 18, 650, 36, 190, 18);
        } else if (idx === 4) {
          // 5-arm radial Starfish
          ctx.fillStyle = "#f97316"; ctx.strokeStyle = "#9a3412"; ctx.lineWidth = 4;
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const a = (i * Math.PI) / 5 - Math.PI / 2, r = i % 2 === 0 ? 135 : 52;
            const x = p.cx + r * Math.cos(a), y = 760 + r * Math.sin(a);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.closePath(); ctx.fill(); ctx.stroke();
        } else {
          // Chordate fish showing highlighted glowing dorsal notochord / vertebral rod!
          ctx.fillStyle = "#38bdf8"; ctx.strokeStyle = "#0369a1"; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.ellipse(p.cx - 15, 760, 130, 68, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = "#fde047"; ctx.lineWidth = 10;
          ctx.beginPath(); ctx.moveTo(p.cx - 115, 742); ctx.lineTo(p.cx + 95, 742); ctx.stroke();
        }
        ctx.fillStyle = "#1e3a8a"; ctx.font = '700 32px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText(p.name, p.cx, 1050);
        ctx.fillStyle = "#475569"; ctx.font = '600 24px "DejaVu Sans", sans-serif';
        ctx.fillText(p.trait, p.cx, 1095);
      });
      drawFloorTag(ctx, 1408, 1305, "Animal Body Plans: Cellular → Radial Diploblastic → Bilateral Triploblastic → True Coelom → Notochord", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 250, y: 390, en: "Porifera & Cnidaria", hi: "पोरिफेरा व सीलेंटरेटा", info_en: "Sponges have pore-bearing cellular organisation; Hydra/corals show radial symmetry and two germ layers.", info_hi: "स्पंज में छिद्रयुक्त कोशिकीय स्तर तथा हाइड्रा में अरीय सममिति व द्विस्तरीय शरीर होता है।" },
      { x: 591, y: 390, en: "Annelida (True Coelom)", hi: "ऐनेलिडा (खंडयुक्त देहगुहा)", info_en: "Bilateral triploblastic worms with true body cavity (coelom) and metameric ring segmentation.", info_hi: "केंचुए जैसे द्विपार्श्व सममित जंतु जिनमें वास्तविक देहगुहा और खंडयुक्त शरीर पाया जाता है।" },
      { x: 816, y: 380, en: "Arthropoda (Largest Phylum)", hi: "आर्थ्रोपोडा (जुड़े हुए पैर)", info_en: "Largest animal phylum featuring chitinous exoskeleton, open circulation and jointed appendages.", info_hi: "जुड़े हुए उपांगों और काइटिन बाह्यकंकाल वाला प्राणी जगत का सबसे बड़ा संघ।" },
      { x: 1267, y: 380, en: "Chordata (Notochord)", hi: "कॉर्डेटा (पृष्ठरज्जु संघ)", info_en: "Defined by dorsal supporting notochord, dorsal hollow nerve cord and pharyngeal gill slits.", info_hi: "पृष्ठरज्जु (नोटोकॉर्ड), खोखली तंत्रिका रज्जु और क्लोम दरारों की उपस्थिति कॉर्डेटा की पहचान है।" }
    ])
  },

  // #60 c9_diversity §12.6 — Binomial nomenclature
  {
    id: "binomial_nomenclature_linnaeus",
    wid: "c9_diversity",
    sec: "12.6",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      const taxa = [
        { cx: 500, gen: "Mangifera", sp: "indica", common: "Mango · आम", pal: "Au" },
        { cx: 1408, gen: "Panthera", sp: "tigris", common: "Tiger · बाघ", pal: "Fe" },
        { cx: 2316, gen: "Pisum", sp: "sativum", common: "Garden Pea · मटर", pal: "peaGreen" }
      ];
      for (const t of taxa) {
        floorShadow(ctx, t.cx, 1170, 340, 34, 0.14);
        ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4.5;
        roundRect(ctx, t.cx - 380, 440, 760, 690, 34); ctx.fill(); ctx.stroke();
        drawSphere3D(ctx, t.cx, 640, 105, t.pal);

        // Highlighted Genus (Capitalized) + species (lowercase italic) boxes!
        ctx.fillStyle = "#dbeafe"; roundRect(ctx, t.cx - 330, 820, 320, 105, 18); ctx.fill();
        ctx.fillStyle = "#dcfce7"; roundRect(ctx, t.cx + 10, 820, 320, 105, 18); ctx.fill();
        ctx.fillStyle = "#1e3a8a"; ctx.font = 'italic 700 42px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText(t.gen, t.cx - 170, 886);
        ctx.fillStyle = "#166534";
        ctx.fillText(t.sp, t.cx + 170, 886);
        ctx.fillStyle = "#475569"; ctx.font = '600 32px "DejaVu Sans", sans-serif';
        ctx.fillText(t.common, t.cx, 1040);
      }
      drawFloorTag(ctx, 1408, 1305, "Carolus Linnaeus Binomial System:  Genus (Capital)  +  species (lowercase) · Printed in Italics", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 195, y: 440, en: "Generic Name (Genus)", hi: "वंश नाम (बड़े अक्षर से)", info_en: "First word names the Genus and always begins with a capital letter (e.g., Mangifera).", info_hi: "पहला शब्द वंश (Genus) बताता है और सदैव बड़े अक्षर से शुरू होता है।" },
      { x: 335, y: 440, en: "Specific Epithet (species)", hi: "जाति नाम (छोटे अक्षर से)", info_en: "Second word identifies the exact species and always begins with a lowercase letter (indica).", info_hi: "दूसरा शब्द विशिष्ट जाति (species) बताता है और छोटे अक्षर से शुरू होता है।" },
      { x: 704, y: 440, en: "Italic / Underlined Rule", hi: "तिरछे अक्षर या रेखांकन नियम", info_en: "Scientific names are printed in italics, or underlined separately when handwritten.", info_hi: "वैज्ञानिक नाम छपाई में तिरछे (italics) तथा हाथ से लिखने पर अलग-अलग रेखांकित किए जाते हैं।" },
      { x: 1158, y: 440, en: "Universal Clarity", hi: "विश्वव्यापी एकसमान पहचान", info_en: "Introduced by Carolus Linnaeus so every scientist worldwide refers unambiguously to the same species.", info_hi: "कैरोलस लीनियस की द्विनाम पद्धति क्षेत्रीय नामों के भ्रम को दूर कर विश्वभर में एक नाम देती है।" }
    ])
  },

  // #61 c9_diversity §12.7 — Hierarchy of taxonomic ranks
  {
    id: "taxonomic_hierarchy_ranks",
    wid: "c9_diversity",
    sec: "12.7",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1210 });
      const ranks = [
        ["KINGDOM  ·  Animalia", 2160, "#1e3a8a"],
        ["PHYLUM / DIVISION  ·  Chordata", 1880, "#1d4ed8"],
        ["CLASS  ·  Mammalia", 1600, "#0284c7"],
        ["ORDER  ·  Carnivora", 1320, "#0d9488"],
        ["FAMILY  ·  Felidae", 1040, "#16a34a"],
        ["GENUS  ·  Panthera", 760, "#ca8a04"],
        ["SPECIES  ·  Panthera tigris", 520, "#dc2626"]
      ];
      floorShadow(ctx, 1408, 1190, 420, 32, 0.15);
      ranks.forEach(([txt, w, col], idx) => {
        const y = 310 + idx * 122;
        ctx.fillStyle = col;
        roundRect(ctx, 1408 - w / 2, y, w, 102, 22); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.font = '700 36px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText(txt, 1408, y + 63);
      });
      drawArrow(ctx, 210, 360, 210, 1110, "#16a34a", 10, 30);
      drawArrow(ctx, 2606, 1110, 2606, 360, "#1e3a8a", 10, 30);
      drawFloorTag(ctx, 1408, 1320, "Kingdom → Phylum/Division → Class → Order → Family → Genus → Species", "#0f172a");
      return cv;
    },
    marks: makeLabels([
      { x: 704, y: 180, en: "Kingdom (Broadest Rank)", hi: "जगत (सर्वोच्च व व्यापक स्तर)", info_en: "Highest rank holding the largest number of diverse organisms with only basic traits in common.", info_hi: "सर्वोच्च श्रेणी जिसमें सर्वाधिक संख्या में जीव आते हैं पर समान गुण कम होते हैं।" },
      { x: 704, y: 302, en: "Phylum / Division & Class", hi: "संघ / विभाग तथा वर्ग", info_en: "Animals use Phylum while plants use Division above Class, Order and Family.", info_hi: "जंतुओं के लिए संघ (Phylum) तथा पादपों के लिए विभाग (Division) शब्द प्रयोग होता है।" },
      { x: 105, y: 420, en: "Shared Traits Increase ↓", hi: "समान लक्षण बढ़ते हैं ↓", info_en: "Moving downward from Kingdom to Species increases similarity and evolutionary closeness.", info_hi: "जगत से जाति की ओर नीचे आने पर जीवों में समान लक्षणों की संख्या बढ़ती जाती है।" },
      { x: 704, y: 545, en: "Species (Basic Unit)", hi: "जाति (वर्गीकरण की मूल इकाई)", info_en: "Smallest basic unit comprising organisms capable of interbreeding to produce fertile offspring.", info_hi: "वर्गीकरण की सबसे छोटी मूल इकाई जिसके जीव आपस में जनन कर उर्वर संतति उत्पन्न करते हैं।" }
    ])
  },

  // #67 c10_sources §S.1 — Conventional and non-conventional sources
  {
    id: "conventional_vs_nonconventional",
    wid: "c10_sources",
    sec: "S.1",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // LEFT: Conventional Fossil Fuels (Coal seam, Oil derrick, Thermal smoke stack)
      ctx.fillStyle = "#f1f5f9"; ctx.strokeStyle = "#64748b"; ctx.lineWidth = 5;
      roundRect(ctx, 160, 420, 1160, 730, 34); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#1e293b"; roundRect(ctx, 210, 960, 1060, 155, 22); ctx.fill(); // Underground coal/oil seam
      // Cooling tower / smokestack + grey smoke puffs
      ctx.fillStyle = "#64748b";
      ctx.beginPath(); ctx.moveTo(520, 960); ctx.lineTo(570, 580); ctx.lineTo(710, 580); ctx.lineTo(760, 960); ctx.closePath(); ctx.fill();
      for (const [sx, sy, sr] of [[660,515,44],[735,475,56],[830,455,48]]) drawSphere3D(ctx, sx, sy, sr, "C");
      // Oil pumpjack / barrel
      ctx.fillStyle = "#b45309"; roundRect(ctx, 940, 740, 180, 220, 22); ctx.fill();
      drawFloorTag(ctx, 740, 1305, "Conventional: Fossil Fuels (Exhaustible · CO₂/SO₂)", "#334155");

      // RIGHT: Non-conventional Clean Renewables (Sun + Solar PV + Wind Turbine + Wave)
      ctx.fillStyle = "#f0fdf4"; ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 5;
      roundRect(ctx, 1496, 420, 1160, 730, 34); ctx.fill(); ctx.stroke();
      drawSphere3D(ctx, 1710, 560, 76, "Au", { glow: "rgba(250,204,21,0.8)" });
      // Solar array
      ctx.fillStyle = "#1d4ed8"; ctx.strokeStyle = "#93c5fd"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(1620, 940); ctx.lineTo(1980, 850); ctx.lineTo(2030, 1060); ctx.lineTo(1670, 1110); ctx.closePath(); ctx.fill(); ctx.stroke();
      // White 3-blade Wind Turbine
      ctx.fillStyle = "#e2e8f0"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 4;
      roundRect(ctx, 2318, 660, 28, 450, 10); ctx.fill(); ctx.stroke();
      for (let b = 0; b < 3; b++) {
        const a = (b * Math.PI * 2) / 3 - Math.PI / 2;
        ctx.strokeStyle = "#334155"; ctx.lineWidth = 14; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(2332, 665); ctx.lineTo(2332 + 175 * Math.cos(a), 665 + 175 * Math.sin(a)); ctx.stroke();
      }
      drawSphere3D(ctx, 2332, 665, 24, "Al");
      drawFloorTag(ctx, 2076, 1305, "Non-Conventional: Solar, Wind & Ocean (Renewable)", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 320, y: 390, en: "Thermal Power & Emissions", hi: "तापीय संयंत्र व उत्सर्जन", info_en: "Burning coal and petroleum supplies steady power but emits greenhouse CO₂ and acidic oxides.", info_hi: "कोयला व पेट्रोलियम जलाने से ऊर्जा मिलती है पर CO₂ व अम्लीय वर्षा वाली गैसें निकलती हैं।" },
      { x: 370, y: 520, en: "Finite Fossil Reserves", hi: "सीमित जीवाश्म ईंधन भंडार", info_en: "Coal, oil and natural gas took millions of years to form and are non-renewable.", info_hi: "करोड़ों वर्षों में बने कोयला व पेट्रोलियम के भंडार सीमित और अनवीकरणीय हैं।" },
      { x: 915, y: 490, en: "Solar Photovoltaic Energy", hi: "सौर ऊर्जा (अपरंपरागत)", info_en: "Abundant non-conventional source harnessed increasingly via modern silicon technology.", info_hi: "सूर्यप्रकाश एक स्वच्छ, अक्षय व अपरंपरागत ऊर्जा स्रोत है।" },
      { x: 1166, y: 335, en: "Clean Wind & Ocean Power", hi: "पवन व समुद्री नवीकरणीय ऊर्जा", info_en: "Renewable kinetic energy of wind and waves generates electricity without fuel combustion.", info_hi: "पवन और समुद्री तरंगें बिना ईंधन दहन के प्रदूषण-मुक्त विद्युत बनाती हैं।" }
    ])
  },

  // #68 c10_sources §S.2 — Solar energy, panels and cookers
  {
    id: "solar_panel_and_cooker",
    wid: "c10_sources",
    sec: "S.2",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      drawSphere3D(ctx, 1408, 330, 82, "Au", { glow: "rgba(250,204,21,0.88)" });

      // LEFT: Silicon p-n Solar Panel Array -> Battery + Lamp (Light directly to Electricity!)
      drawArrow(ctx, 1310, 385, 780, 650, "#eab308", 8, 24);
      floorShadow(ctx, 680, 1165, 360, 34, 0.15);
      ctx.fillStyle = "#1e3a8a"; ctx.strokeStyle = "#60a5fa"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(320, 720); ctx.lineTo(940, 580); ctx.lineTo(1040, 960); ctx.lineTo(420, 1100); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "rgba(191,219,254,0.65)"; ctx.lineWidth = 3;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath(); ctx.moveTo(320 + i * 155, 720 - i * 35); ctx.lineTo(420 + i * 155, 1100 - i * 35); ctx.stroke();
      }
      drawSphere3D(ctx, 1165, 980, 58, "Au", { glow: "rgba(250,204,21,0.7)", symbol: "DC" });
      drawFloorTag(ctx, 720, 1300, "Silicon Solar Panel (Photons → DC Electricity)", "#1d4ed8");

      // RIGHT: Box-Type Solar Cooker (Plane Reflector Mirror + Glass Sheet Lid + Matte-Black Insulated Box)
      drawArrow(ctx, 1506, 385, 2362, 625, "#eab308", 8, 24);
      drawArrow(ctx, 2362, 625, 1980, 865, "#f59e0b", 8, 24);
      // Connect DC wire from Solar Panel to DC Lamp
      ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(1000, 945); ctx.lineTo(1110, 965); ctx.stroke();
      floorShadow(ctx, 2040, 1165, 340, 34, 0.16);
      // Black insulated outer/inner cooker box
      ctx.fillStyle = "#0f172a"; roundRect(ctx, 1710, 840, 560, 290, 24); ctx.fill();
      ctx.fillStyle = "#334155"; roundRect(ctx, 1765, 910, 200, 170, 16); ctx.fill();
      ctx.fillStyle = "#334155"; roundRect(ctx, 2015, 910, 200, 170, 16); ctx.fill();
      // Transparent Greenhouse Glass Sheet cover!
      ctx.fillStyle = "rgba(186,230,253,0.55)"; ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 6;
      roundRect(ctx, 1710, 812, 560, 32, 10); ctx.fill(); ctx.stroke();
      // Tilted Silvered Plane Mirror Lid at ~60 deg!
      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 18; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(2265, 825); ctx.lineTo(2465, 435); ctx.stroke();
      ctx.strokeStyle = "#e0f2fe"; ctx.lineWidth = 8; ctx.stroke();
      drawFloorTag(ctx, 2080, 1300, "Box Solar Cooker (Mirror + Glass Greenhouse Trap · 100–140 °C)", "#b45309");
      return cv;
    },
    marks: makeLabels([
      { x: 340, y: 410, en: "Silicon Solar Cell Panel", hi: "सिलिकॉन सौर सेल पैनल", info_en: "Interconnected silicon cells with silver wiring convert sunlight directly into electricity with no moving parts.", info_hi: "सिलिकॉन अर्धचालक सौर सेल बिना किसी गतिमान पुर्जे के धूप को सीधे विद्युत में बदलते हैं।" },
      { x: 704, y: 165, en: "Incident Solar Energy", hi: "आपतित सौर विकिरण", info_en: "Clean, inexhaustible radiant energy powers both photovoltaic cells and thermal solar cookers.", info_hi: "सूर्य की विकिरण ऊर्जा प्रकाश-विद्युत तथा तापीय दोनों उपकरणों का स्रोत है।" },
      { x: 990, y: 412, en: "Glass Lid & Black Interior", hi: "काँच का ढक्कन व काली सतह", info_en: "Black surfaces absorb maximum heat while the glass sheet traps infrared rays via the greenhouse effect.", info_hi: "काली सतह अधिक ऊष्मा सोखती है और काँच की प्लेट ग्रीनहाउस प्रभाव से ऊष्मा बाहर जाने से रोकती है।" },
      { x: 1182, y: 315, en: "Plane Reflector Mirror", hi: "समतल परावर्तक दर्पण", info_en: "Angled mirror reflects extra sunlight into the cooker box to reach 100–140 °C.", info_hi: "झुका हुआ समतल दर्पण अतिरिक्त धूप को बॉक्स के भीतर केंद्रित कर ताप बढ़ाता है।" }
    ])
  },

  // #69 c10_sources §S.3 — Wind, hydro and tidal energy
  {
    id: "wind_hydro_tidal_turbines",
    wid: "c10_sources",
    sec: "S.3",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // 1. Left: Wind Farm Turbine (> 15 km/h moving air)
      floorShadow(ctx, 480, 1175, 240, 30, 0.14);
      ctx.fillStyle = "#e2e8f0"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 4;
      roundRect(ctx, 464, 580, 34, 570, 12); ctx.fill(); ctx.stroke();
      for (let b = 0; b < 3; b++) {
        const a = (b * Math.PI * 2) / 3 - 0.4;
        ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 16; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(481, 590); ctx.lineTo(481 + 210 * Math.cos(a), 590 + 210 * Math.sin(a)); ctx.stroke();
      }
      drawSphere3D(ctx, 481, 590, 28, "Al");
      drawArrow(ctx, 180, 520, 370, 520, "#0284c7", 8, 24);
      drawArrow(ctx, 180, 640, 370, 640, "#0284c7", 8, 24);
      drawFloorTag(ctx, 480, 1305, "Wind Turbine (> 15 km/h)", "#0284c7");

      // 2. Center: Hydroelectric Dam Reservoir (High PE mgh -> Penstock Water Jet -> Turbine Generator)
      floorShadow(ctx, 1408, 1175, 360, 34, 0.15);
      ctx.fillStyle = "rgba(14,165,233,0.65)"; roundRect(ctx, 1020, 520, 310, 630, 18); ctx.fill();
      ctx.fillStyle = "#64748b";
      ctx.beginPath(); ctx.moveTo(1310, 480); ctx.lineTo(1440, 480); ctx.lineTo(1580, 1150); ctx.lineTo(1310, 1150); ctx.closePath(); ctx.fill();
      // Diagonal penstock pipe rushing water to turbine wheel!
      ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 28;
      ctx.beginPath(); ctx.moveTo(1290, 680); ctx.lineTo(1640, 1020); ctx.stroke();
      drawSphere3D(ctx, 1665, 1035, 68, "Cu", { symbol: "Gen" });
      drawFloorTag(ctx, 1408, 1305, "Hydroelectric Dam (mgh → KE → Electric)", "#1d4ed8");

      // 3. Right: Coastal Tidal Barrage with High-Tide Ocean vs Low-Tide Estuary & Reversible Underwater Turbine
      floorShadow(ctx, 2320, 1175, 330, 34, 0.14);
      ctx.fillStyle = "rgba(2,132,199,0.72)"; roundRect(ctx, 1960, 640, 310, 510, 18); ctx.fill(); // High tide sea
      ctx.fillStyle = "rgba(56,189,248,0.52)"; roundRect(ctx, 2370, 860, 290, 290, 18); ctx.fill(); // Low basin
      ctx.fillStyle = "#475569"; roundRect(ctx, 2265, 560, 110, 590, 16); ctx.fill();
      drawSphere3D(ctx, 2320, 995, 52, "Au", { symbol: "⇄" });
      drawArrow(ctx, 2140, 995, 2480, 995, "#fef08a", 9, 26);
      drawFloorTag(ctx, 2320, 1305, "Tidal Barrage (High ↔ Low Tide)", "#0f766e");
      return cv;
    },
    marks: makeLabels([
      { x: 240, y: 295, en: "Wind Kinetic Energy", hi: "पवन चक्की टरबाइन", info_en: "Moving air (> 15 km/h) turns rotor blades coupled directly to an electric generator.", info_hi: "15 km/h से तेज बहती पवन टरबाइन के ब्लेड घुमाकर जनित्र द्वारा विद्युत बनाती है।" },
      { x: 585, y: 340, en: "Elevated Dam Reservoir", hi: "ऊँचा जल-भंडार (mgh)", info_en: "Impounded river water stores gravitational potential energy mgh behind the dam.", info_hi: "बाँध के पीछे संचित ऊँचा जल गुरुत्वीय स्थितिज ऊर्जा (mgh) रखता है।" },
      { x: 832, y: 518, en: "Hydro Turbine & Generator", hi: "पेनस्टॉक व जल-टरबाइन", info_en: "Falling water rushes down the penstock to spin turbine blades and generate hydroelectricity.", info_hi: "गिरते जल की गतिज ऊर्जा टरबाइन घुमाकर स्वच्छ जल-विद्युत उत्पन्न करती है।" },
      { x: 1160, y: 498, en: "Tidal Barrage Turbine", hi: "ज्वारीय बाँध टरबाइन", info_en: "Gravitational pull of the Moon creates high and low tides whose water head turns coastal turbines.", info_hi: "चंद्रमा के गुरुत्वाकर्षण से उठते-गिरते ज्वार-भाटे संकरे बाँध की टरबाइन घुमाते हैं।" }
    ])
  },

  // #70 c10_sources §S.4 — Biomass, biogas and nuclear energy
  {
    id: "biogas_and_nuclear_energy",
    wid: "c10_sources",
    sec: "S.4",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // LEFT: Underground Fixed-Dome Biogas Plant Cutaway (Slurry Inlet -> Anaerobic Dome -> CH4 Gas Pipe -> Slurry Manure Outlet)
      floorShadow(ctx, 740, 1175, 480, 36, 0.15);
      // Soil cross-section + Brick Digester Dome
      ctx.fillStyle = "#d6d3d1"; roundRect(ctx, 200, 680, 1080, 470, 32); ctx.fill();
      ctx.fillStyle = "#9a3412";
      ctx.beginPath(); ctx.arc(740, 880, 290, Math.PI, 0); ctx.lineTo(1030, 1110); ctx.lineTo(450, 1110); ctx.closePath(); ctx.fill();
      // Green cow-dung slurry + pale-yellow CH4 gas pocket in upper dome!
      ctx.fillStyle = "#fef9c3"; ctx.beginPath(); ctx.arc(740, 860, 250, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#3f6212"; roundRect(ctx, 490, 860, 500, 225, 18); ctx.fill();
      // Inlet mixing tank (left) & Manure outlet tank (right) + diagonal slurry chutes + Top gas valve pipe!
      ctx.strokeStyle = "#4d7c0f"; ctx.lineWidth = 34; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(350, 740); ctx.lineTo(525, 980); ctx.moveTo(1130, 760); ctx.lineTo(955, 980); ctx.stroke();
      ctx.fillStyle = "#65a30d"; roundRect(ctx, 250, 540, 160, 220, 16); ctx.fill();
      ctx.fillStyle = "#4d7c0f"; roundRect(ctx, 1070, 580, 160, 200, 16); ctx.fill();
      ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.moveTo(740, 610); ctx.lineTo(740, 430); ctx.lineTo(960, 430); ctx.stroke();
      drawSphere3D(ctx, 845, 430, 20, "O");
      drawFloorTag(ctx, 740, 1305, "Fixed-Dome Biogas Digester (~75% CH₄ · Smoke-Free)", "#3f6212");

      // RIGHT: Nuclear Fission Chain Reaction (n + U-235 -> Ba + Kr + 3n + ΔE = Δmc²) + Control Rods
      floorShadow(ctx, 2080, 1175, 440, 36, 0.15);
      ctx.fillStyle = "#0f172a"; ctx.strokeStyle = "#334155"; ctx.lineWidth = 6;
      roundRect(ctx, 1560, 450, 1040, 690, 36); ctx.fill(); ctx.stroke();
      // Slow neutron hitting U-235 nucleus -> splitting into Ba + Kr + 3 neutrons + energy glow!
      drawSphere3D(ctx, 1680, 795, 22, "neutron");
      drawArrow(ctx, 1715, 795, 1865, 795, "#38bdf8", 7, 22);
      drawSphere3D(ctx, 1965, 795, 86, "U", { glow: "rgba(74,222,128,0.8)", symbol: "²³⁵U" });
      drawArrow(ctx, 2065, 755, 2285, 625, "#facc15", 8, 24);
      drawArrow(ctx, 2065, 835, 2285, 965, "#facc15", 8, 24);
      drawSphere3D(ctx, 2365, 600, 56, "Fe", { symbol: "Ba" });
      drawSphere3D(ctx, 2365, 985, 46, "Na", { symbol: "Kr" });
      for (const ny of [715, 795, 875]) drawSphere3D(ctx, 2500, ny, 18, "neutron", { glow: "rgba(250,204,21,0.75)" });
      // Boron control rods descending from top
      ctx.fillStyle = "#94a3b8"; roundRect(ctx, 1830, 456, 28, 190, 8); ctx.fill();
      ctx.fillStyle = "#94a3b8"; roundRect(ctx, 2110, 456, 28, 190, 8); ctx.fill();
      drawFloorTag(ctx, 2080, 1305, "Nuclear Fission (ΔE = Δmc² · Safe Waste Disposal Needed)", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 165, y: 320, en: "Slurry Inlet Tank", hi: "गोबर-जल कर्दम निवेश", info_en: "Cattle dung and biodegradable farm waste mixed with water enter the sealed digester.", info_hi: "गोबर व जैव-अपशिष्ट को जल में मिलाकर भूमिगत पाचित्र में भेजा जाता है।" },
      { x: 370, y: 390, en: "Anaerobic Biogas Dome", hi: "अवायवीय बायोगैस गुंबद", info_en: "Anaerobic bacteria decompose organic matter without O₂, producing ~75% methane fuel and N/P-rich manure.", info_hi: "ऑक्सीजन की अनुपस्थिति में जीवाणु ~75% मेथेन युक्त स्वच्छ बायोगैस व उत्तम खाद बनाते हैं।" },
      { x: 982, y: 398, en: "²³⁵U Nuclear Fission", hi: "²³⁵U नाभिकीय विखंडन", info_en: "Bombarding heavy Uranium-235 with a slow neutron splits it into lighter nuclei plus huge ΔE = Δmc² energy.", info_hi: "धीमे न्यूट्रॉन से यूरेनियम-235 नाभिक टूटकर अपार ऊर्जा (ΔE = Δmc²) मुक्त करता है।" },
      { x: 1062, y: 275, en: "Control Rods & Safety", hi: "नियंत्रक छड़ें व सुरक्षा", info_en: "Control rods absorb excess neutrons for steady power; radioactive waste requires shielded storage.", info_hi: "नियंत्रक छड़ें अतिरिक्त न्यूट्रॉन सोखकर शृंखला अभिक्रिया को सुरक्षित दर पर रखती हैं।" }
    ])
  },

  // #71 c10_sustainable §M.2 — Forest and wildlife conservation
  {
    id: "forest_wildlife_conservation",
    wid: "c10_sustainable",
    sec: "M.2",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1200 });
      // Concentric 3D Ecological Biosphere Reserve Zonation + Community Afforestation on Right!
      const cx = 1020, cy = 790;
      floorShadow(ctx, cx, 1175, 620, 42, 0.14);
      // Outer Transition Zone (Community & Sustainable Forestry)
      ctx.fillStyle = "#dcfce7"; ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.ellipse(cx, cy, 660, 350, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Middle Buffer Zone (Research, Education & Afforestation)
      ctx.fillStyle = "#86efac"; ctx.strokeStyle = "#15803d";
      ctx.beginPath(); ctx.ellipse(cx, cy, 450, 235, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Inner Protected Core Zone (Strict Wildlife & Biodiversity Hotspot)
      ctx.fillStyle = "#15803d";
      ctx.beginPath(); ctx.ellipse(cx, cy, 240, 130, 0, 0, Math.PI * 2); ctx.fill();
      drawSphere3D(ctx, cx - 55, cy - 10, 48, "Fe"); // Native fauna emblem
      drawSphere3D(ctx, cx + 65, cy - 15, 58, "peaGreen"); // Dense native canopy

      // Right: Four Stakeholder Stewardship Pillars (Local People, Forest Dept, Eco-Science, Sustainable Harvest)
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4.5;
      roundRect(ctx, 1840, 440, 780, 700, 34); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const tx = 2020 + i * 210;
        ctx.fillStyle = "#78350f"; roundRect(ctx, tx - 16, 780, 32, 180, 8); ctx.fill();
        drawSphere3D(ctx, tx, 710, 82, "peaGreen");
      }
      ctx.fillStyle = "#14532d"; ctx.font = '700 34px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("Joint Forest Management", 2230, 1045);
      ctx.fillText("(Chipko & Arabari Model)", 2230, 1095);
      drawFloorTag(ctx, 1408, 1315, "Biodiversity Hotspots: Core Protection + Buffer Restoration + Community Participation", "#14532d");
      return cv;
    },
    marks: makeLabels([
      { x: 510, y: 395, en: "Protected Core Zone", hi: "संरक्षित क्रोड क्षेत्र", info_en: "Strictly protected wildlife habitat preserving genetic, species and ecosystem biodiversity.", info_hi: "मानवीय हस्तक्षेप रहित क्षेत्र जहाँ वन्यजीवों और जैव-विविधता का पूर्ण संरक्षण होता है।" },
      { x: 350, y: 395, en: "Buffer Zone", hi: "मध्यवर्ती बफ़र क्षेत्र", info_en: "Surrounds the core for ecological monitoring, research and native sapling regeneration.", info_hi: "शोध, पारिस्थितिक शिक्षा और प्राकृतिक पुनर्जनन के लिए क्रोड के चारों ओर का क्षेत्र।" },
      { x: 205, y: 395, en: "Transition Zone", hi: "संक्रमण व सहभागिता क्षेत्र", info_en: "Outer zone supporting non-destructive livelihoods of forest-dependent local communities.", info_hi: "स्थानीय समुदायों के सतत और पर्यावरण-अनुकूल आजीविका उपयोग का बाहरी क्षेत्र।" },
      { x: 1115, y: 380, en: "Community Stewardship", hi: "सामुदायिक वन संरक्षण (चिपको)", info_en: "Movements like Chipko and Arabari sal-forest recovery show local participation is vital.", info_hi: "चिपको आंदोलन व अराबारी मॉडल सिद्ध करते हैं कि जन-सहभागिता से वन पुनर्जीवित होते हैं।" }
    ])
  },

  // #72 c10_sustainable §M.3 — Water harvesting and watershed management
  {
    id: "rainwater_harvesting_watershed",
    wid: "c10_sustainable",
    sec: "M.3",
    render() {
      const { cv, ctx } = studioCanvas({ bench: false });
      // 3D Hydrogeological Cross-Section: Rooftop Rainwater -> Filter Pit -> Deep Aquifer + Rural Check Dam / Khadin!
      const sky = ctx.createLinearGradient(140, 240, 140, 920);
      sky.addColorStop(0, "#e0f2fe"); sky.addColorStop(1, "#f0f9ff");
      ctx.fillStyle = sky; roundRect(ctx, 140, 240, 2536, 1040, 38); ctx.fill();

      // Underground Layered Strata: Topsoil -> Porous Sand/Gravel -> Deep Blue Groundwater Aquifer -> Bedrock!
      ctx.fillStyle = "#84cc16"; roundRect(ctx, 140, 810, 2536, 95, 12); ctx.fill();
      ctx.fillStyle = "#a16207"; roundRect(ctx, 140, 895, 2536, 155, 12); ctx.fill();
      ctx.fillStyle = "rgba(14,165,233,0.78)"; roundRect(ctx, 140, 1040, 2536, 195, 24); ctx.fill();

      // Left: House with Sloping Roof Gutter -> Downpipe -> Sand-Gravel Filter Pit -> Recharge Bore into Aquifer!
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 4;
      roundRect(ctx, 320, 560, 420, 260, 14); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#dc2626";
      ctx.beginPath(); ctx.moveTo(280, 570); ctx.lineTo(530, 410); ctx.lineTo(780, 570); ctx.closePath(); ctx.fill();
      // Blue rain streaks + House windows + Sand/Gravel/Pebble layers inside filter pit!
      ctx.fillStyle = "#bae6fd"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 3;
      roundRect(ctx, 390, 635, 95, 95, 10); ctx.fill(); ctx.stroke();
      roundRect(ctx, 575, 635, 95, 95, 10); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 5;
      for (let rx = 340; rx <= 2060; rx += 140) {
        ctx.beginPath(); ctx.moveTo(rx, 290); ctx.lineTo(rx - 18, 365); ctx.stroke();
      }
      ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.moveTo(760, 570); ctx.lineTo(920, 570); ctx.lineTo(920, 1090); ctx.stroke();
      ctx.fillStyle = "#fef3c7"; ctx.strokeStyle = "#334155"; ctx.lineWidth = 4;
      roundRect(ctx, 845, 815, 150, 165, 16); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#d97706"; ctx.fillRect(849, 870, 142, 52);
      ctx.fillStyle = "#64748b"; ctx.fillRect(849, 922, 142, 54);

      // Right: Sloping Watershed + Stone Check Dam / Khadin Bund impounding surface water + downward percolation arrows!
      ctx.fillStyle = "rgba(56,189,248,0.68)";
      roundRect(ctx, 1480, 725, 680, 95, 18); ctx.fill();
      ctx.fillStyle = "#475569";
      ctx.beginPath(); ctx.moveTo(2140, 685); ctx.lineTo(2260, 685); ctx.lineTo(2310, 825); ctx.lineTo(2110, 825); ctx.closePath(); ctx.fill();
      for (const px of [1620, 1820, 2020]) drawArrow(ctx, px, 835, px, 1055, "#0284c7", 8, 24, true);

      drawFloorTag(ctx, 1408, 1385, "Rooftop Harvesting + Check Dams (Khadin / Kulhs / Johads) → Groundwater Recharge (Zero Evaporation)", "#0369a1");
      return cv;
    },
    marks: makeLabels([
      { x: 265, y: 265, en: "Rooftop Catchment", hi: "छत वर्षा-जल संग्रहण", info_en: "Clean roof runoff is channelled via pipes instead of flowing away into drains.", info_hi: "छत पर गिरने वाले वर्षा जल को पाइपों द्वारा एकत्र कर सीधे पुनर्भरण गड्ढे में भेजा जाता है।" },
      { x: 460, y: 445, en: "Sand–Gravel Filter Pit", hi: "रेत-बजरी छनन गड्ढा", info_en: "Removes silt and debris before recharging underground wells and borewells.", info_hi: "जल को भूमिगत जलस्तर में भेजने से पहले रेत और बजरी की परतें अशुद्धियाँ छानती हैं।" },
      { x: 1090, y: 375, en: "Watershed Check Dam", hi: "चेक डैम / खादिन बंध", info_en: "Earthen or stone bunds slow runoff, prevent soil erosion and give water time to percolate.", info_hi: "छोटे रोक-बाँध व खादिन जल-प्रवाह धीमा कर मृदा अपरदन रोकते हैं और रिसाव बढ़ाते हैं।" },
      { x: 910, y: 565, en: "Underground Aquifer", hi: "भू-जल स्तर पुनर्भरण", info_en: "Stored underground water never evaporates, does not breed mosquitoes and moisturises vegetation.", info_hi: "भूमिगत संचित जल वाष्पित नहीं होता, मच्छर नहीं पनपते और बड़े क्षेत्र में नमी बनी रहती है।" }
    ])
  },

  // #73 c10_sustainable §M.4 — Coal, petroleum and the 3Rs
  {
    id: "coal_petroleum_and_3rs",
    wid: "c10_sustainable",
    sec: "M.4",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // LEFT: Geological Anticline Strata Trap (Impervious Cap Rock -> Natural Gas -> Crude Oil -> Water -> Deep Coal Seam)
      floorShadow(ctx, 720, 1175, 490, 36, 0.15);
      ctx.save();
      ctx.beginPath(); roundRect(ctx, 180, 440, 1080, 710, 34); ctx.clip();
      const layers = [
        ["#84cc16", 440, 120], ["#a16207", 560, 140], ["#fef08a", 700, 115], // Gas
        ["#451a03", 815, 140], ["#0284c7", 955, 95], ["#0f172a", 1050, 110]   // Crude oil, brine, coal seam
      ];
      for (const [col, y, h] of layers) {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(180, y + 55); ctx.quadraticCurveTo(720, y - 65, 1260, y + 55);
        ctx.lineTo(1260, y + h + 65); ctx.quadraticCurveTo(720, y + h - 55, 180, y + h + 65);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      ctx.strokeStyle = "#475569"; ctx.lineWidth = 5; roundRect(ctx, 180, 440, 1080, 710, 34); ctx.stroke();
      drawFloorTag(ctx, 720, 1305, "Finite Coal & Petroleum Strata (C, H, N, S → CO₂, SO₂, NOₓ)", "#334155");

      // RIGHT: Circular Conservation Wheel (Refuse · Reduce · Reuse · Repurpose · Recycle)
      floorShadow(ctx, 2060, 1175, 430, 36, 0.14);
      const cx = 2060, cy = 785, R = 265;
      ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 22;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      const rs = [
        ["Refuse", -Math.PI / 2, "#dc2626"],
        ["Reduce", -Math.PI / 2 + 1.256, "#d97706"],
        ["Reuse", -Math.PI / 2 + 2.513, "#16a34a"],
        ["Repurpose", -Math.PI / 2 + 3.770, "#0284c7"],
        ["Recycle", -Math.PI / 2 + 5.026, "#7e22ce"]
      ];
      for (const [lbl, a, col] of rs) {
        const px = cx + R * Math.cos(a), py = cy + R * Math.sin(a);
        drawSphere3D(ctx, px, py, 64, col === "#dc2626" ? "O" : col === "#d97706" ? "Au" : col === "#16a34a" ? "peaGreen" : col === "#0284c7" ? "electron" : "Na");
        ctx.fillStyle = "#0f172a"; ctx.font = '700 30px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText(lbl, px, py + 95 * (Math.sin(a) >= 0 ? 1 : -1));
      }
      drawFloorTag(ctx, 2060, 1305, "Circular Resource Stewardship: 3Rs / 5Rs Hierarchy", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 360, y: 420, en: "Petroleum & Natural Gas", hi: "पेट्रोलियम व प्राकृतिक गैस", info_en: "Formed from ancient marine biomass; incomplete combustion releases toxic carbon monoxide (CO).", info_hi: "प्राचीन समुद्री जीवों से निर्मित सीमित भंडार; अपूर्ण दहन से विषैली कार्बन मोनोऑक्साइड बनती है।" },
      { x: 360, y: 555, en: "Coal Seam Reserves", hi: "कोयला परत भंडार", info_en: "Contains carbon with traces of H, N and S whose burning adds CO₂, SO₂ and NOₓ to the atmosphere.", info_hi: "कोयले में कार्बन के साथ नाइट्रोजन व सल्फर होते हैं जो दहन पर ग्रीनहाउस व अम्लीय गैसें बनाते हैं।" },
      { x: 1030, y: 260, en: "Refuse & Reduce", hi: "इंकार व कम उपयोग (Reduce)", info_en: "Saying no to single-use plastics and switching off idle lights saves energy at the source.", info_hi: "अनावश्यक प्लास्टिक न लेना और बिजली-ईंधन की बचत संसाधनों पर दबाव घटाती है।" },
      { x: 1120, y: 490, en: "Reuse, Repurpose & Recycle", hi: "पुनः उपयोग व पुनर्चक्रण", info_en: "Reusing containers directly saves the extra energy needed to melt and remould materials in recycling.", info_hi: "पुनः उपयोग (Reuse) पुनर्चक्रण से भी उत्तम है क्योंकि इसमें गलाने की अतिरिक्त ऊर्जा नहीं लगती।" }
    ])
  }
];

function strokeRound(ctx, x, y, w, h, r) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 4;
  ctx.stroke();
}
