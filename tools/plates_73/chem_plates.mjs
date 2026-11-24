// tools/plates_73/chem_plates.mjs
// 26 high-resolution 3D & studio laboratory Chemistry plates (2816x1536 -> 1408x768).
import {
  W, H, studioCanvas, floorShadow, drawSphere3D, renderMolecule3D,
  roundRect, drawBeaker, drawArrow, drawFloorTag, makeLabels
} from "./kit.mjs";

function drawBunsenFlame(ctx, cx, baseY, mode = "blue") {
  // Heavy cast-iron base + brass barrel
  floorShadow(ctx, cx, baseY + 14, 155, 28, 0.18);
  ctx.save();
  const baseG = ctx.createLinearGradient(cx - 140, baseY - 30, cx + 140, baseY);
  baseG.addColorStop(0, "#334155"); baseG.addColorStop(0.5, "#64748b"); baseG.addColorStop(1, "#1e293b");
  ctx.fillStyle = baseG;
  roundRect(ctx, cx - 135, baseY - 36, 270, 42, 16); ctx.fill();

  const tubeG = ctx.createLinearGradient(cx - 32, 0, cx + 32, 0);
  tubeG.addColorStop(0, "#92400e"); tubeG.addColorStop(0.4, "#fbbf24"); tubeG.addColorStop(0.75, "#d97706"); tubeG.addColorStop(1, "#78350f");
  ctx.fillStyle = tubeG;
  roundRect(ctx, cx - 28, baseY - 310, 56, 278, 8); ctx.fill();

  // Air-hole collar
  ctx.fillStyle = "#475569";
  roundRect(ctx, cx - 36, baseY - 125, 72, 56, 8); ctx.fill();
  if (mode === "blue") {
    // Open air hole showing oxygen entry
    ctx.fillStyle = "#bae6fd";
    roundRect(ctx, cx - 16, baseY - 110, 32, 26, 6); ctx.fill();
    drawArrow(ctx, cx - 120, baseY - 97, cx - 44, baseY - 97, "#0284c7", 6, 18);
    drawArrow(ctx, cx + 120, baseY - 97, cx + 44, baseY - 97, "#0284c7", 6, 18);
  } else {
    // Closed collar
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 3;
    ctx.strokeRect(cx - 18, baseY - 110, 36, 26);
  }

  const topY = baseY - 310;
  if (mode === "blue") {
    // Outer clean non-luminous blue cone
    const fg = ctx.createRadialGradient(cx, topY - 140, 12, cx, topY - 170, 230);
    fg.addColorStop(0, "rgba(186,230,253,0.95)");
    fg.addColorStop(0.45, "rgba(56,189,248,0.78)");
    fg.addColorStop(0.82, "rgba(37,99,235,0.38)");
    fg.addColorStop(1, "rgba(37,99,235,0)");
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(cx - 32, topY);
    ctx.quadraticCurveTo(cx - 95, topY - 190, cx, topY - 370);
    ctx.quadraticCurveTo(cx + 95, topY - 190, cx + 32, topY);
    ctx.closePath(); ctx.fill();
    // Inner pale-cyan hot cone
    ctx.fillStyle = "rgba(224,242,254,0.92)";
    ctx.beginPath();
    ctx.moveTo(cx - 20, topY);
    ctx.quadraticCurveTo(cx - 34, topY - 85, cx, topY - 165);
    ctx.quadraticCurveTo(cx + 34, topY - 85, cx + 20, topY);
    ctx.closePath(); ctx.fill();
    // Clean copper/porcelain plate above — spotless
    ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#64748b"; ctx.lineWidth = 4;
    roundRect(ctx, cx - 150, topY - 430, 300, 24, 10); ctx.fill(); ctx.stroke();
  } else {
    // Tall flickering yellow luminous flame + black soot
    const yg = ctx.createRadialGradient(cx, topY - 170, 18, cx, topY - 220, 280);
    yg.addColorStop(0, "#fef9c3");
    yg.addColorStop(0.38, "#facc15");
    yg.addColorStop(0.75, "#ea580c");
    yg.addColorStop(1, "rgba(234,88,12,0)");
    ctx.fillStyle = yg;
    ctx.beginPath();
    ctx.moveTo(cx - 32, topY);
    ctx.bezierCurveTo(cx - 135, topY - 160, cx - 75, topY - 330, cx + 8, topY - 420);
    ctx.bezierCurveTo(cx + 115, topY - 310, cx + 125, topY - 150, cx + 32, topY);
    ctx.closePath(); ctx.fill();

    // Porcelain plate coated underneath with black carbon soot + rising soot particles
    ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#64748b"; ctx.lineWidth = 4;
    roundRect(ctx, cx - 150, topY - 435, 300, 24, 10); ctx.fill(); ctx.stroke();
    const sg = ctx.createRadialGradient(cx, topY - 410, 8, cx, topY - 410, 120);
    sg.addColorStop(0, "#090d16"); sg.addColorStop(0.65, "rgba(15,23,42,0.85)"); sg.addColorStop(1, "rgba(15,23,42,0)");
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.ellipse(cx, topY - 408, 118, 22, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 18; i++) {
      const sx = cx - 85 + ((i * 37) % 170), sy = topY - 455 - ((i * 29) % 95);
      ctx.fillStyle = "rgba(15,23,42,0.72)";
      ctx.beginPath(); ctx.arc(sx, sy, 5 + (i % 4) * 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawAtomShells(ctx, cx, cy, pCount, nCount, shells, opts = {}) {
  const maxR = opts.maxR || 220;
  floorShadow(ctx, cx, cy + maxR + 55, maxR * 0.72, 26, 0.12);
  ctx.save();
  // Electron orbital rings
  shells.forEach((cnt, idx) => {
    const r = 82 + idx * ((maxR - 82) / Math.max(1, shells.length - 0.35));
    ctx.strokeStyle = "rgba(59,130,246,0.42)";
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    for (let k = 0; k < cnt; k++) {
      const a = (k / cnt) * Math.PI * 2 - Math.PI / 2 + idx * 0.35;
      drawSphere3D(ctx, cx + r * Math.cos(a), cy + r * Math.sin(a), 14, "electron", { glow: "rgba(96,165,250,0.45)" });
    }
  });
  // Nucleus cluster
  const totalNuc = Math.min(18, pCount + nCount);
  const nucR = opts.nucR || 38;
  const glow = ctx.createRadialGradient(cx, cy, 6, cx, cy, nucR * 1.9);
  glow.addColorStop(0, "rgba(251,146,60,0.38)"); glow.addColorStop(1, "rgba(251,146,60,0)");
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, nucR * 1.9, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < totalNuc; i++) {
    const a = i * 2.39996, rad = Math.min(nucR * 0.78, 8 * Math.sqrt(i));
    const isP = i % 2 === 0 ? (i / 2 < pCount) : ((i - 1) / 2 >= nCount);
    drawSphere3D(ctx, cx + rad * Math.cos(a), cy + rad * Math.sin(a), 14, isP ? "proton" : "neutron");
  }
  ctx.restore();
}

export const CHEM_PLATES = [
  // #10 c10_carbon §4.2.2
  {
    id: "carbon_chains_branches_rings",
    wid: "c10_carbon",
    sec: "4.2.2",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1160 });
      // 1. n-butane C4H10
      {
        const c = [[-1.8, -0.35, 0], [-0.6, 0.42, 0], [0.6, -0.35, 0], [1.8, 0.42, 0]];
        const h = [
          [-2.55, 0.25, 0], [-1.85, -0.98, 0.78], [-1.85, -0.98, -0.78],
          [-0.6, 1.06, 0.78], [-0.6, 1.06, -0.78],
          [0.6, -0.99, 0.78], [0.6, -0.99, -0.78],
          [2.55, -0.18, 0], [1.85, 1.05, 0.78], [1.85, 1.05, -0.78]
        ];
        const atoms = [...c.map(pos => ({ el: "C", pos })), ...h.map(pos => ({ el: "H", pos }))];
        const bonds = [[0,1,1],[1,2,1],[2,3,1],[0,4,1],[0,5,1],[0,6,1],[1,7,1],[1,8,1],[2,9,1],[2,10,1],[3,11,1],[3,12,1],[3,13,1]];
        floorShadow(ctx, 360, 1185, 250, 38, 0.14);
        renderMolecule3D(ctx, atoms, bonds, [360, 860], 0.30, -0.26, 106);
        drawFloorTag(ctx, 360, 1310, "n-C₄H₁₀");
      }
      // 2. 2-methylpropane (isobutane) C4H10
      {
        const c = [[0, -0.05, 0.15], [0, 1.32, 0], [-1.22, -0.72, 0], [1.22, -0.72, 0]];
        const h = [
          [0, -0.18, 1.15],
          [-0.78, 1.82, 0.45], [0.78, 1.82, 0.45], [0, 1.72, -0.88],
          [-1.98, -0.20, 0.45], [-1.25, -1.62, 0.48], [-1.42, -0.88, -0.92],
          [1.98, -0.20, 0.45], [1.25, -1.62, 0.48], [1.42, -0.88, -0.92]
        ];
        const atoms = [...c.map(pos => ({ el: "C", pos })), ...h.map(pos => ({ el: "H", pos }))];
        const bonds = [[0,1,1],[0,2,1],[0,3,1],[0,4,1],[1,5,1],[1,6,1],[1,7,1],[2,8,1],[2,9,1],[2,10,1],[3,11,1],[3,12,1],[3,13,1]];
        floorShadow(ctx, 1040, 1185, 235, 38, 0.14);
        renderMolecule3D(ctx, atoms, bonds, [1040, 855], 0.24, 0.22, 110);
        drawFloorTag(ctx, 1040, 1310, "iso-C₄H₁₀");
      }
      // 3. Cyclohexane C6H12 chair
      {
        const c = [], h = [], bonds = [];
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3, s = i % 2 === 0 ? 1 : -1;
          const cx = 1.38 * Math.cos(a), cz = 1.38 * Math.sin(a), cy = 0.28 * s;
          c.push([cx, cy, cz]);
          h.push([cx * 1.02, cy + 0.96 * s, cz * 1.02]);
          h.push([cx * 1.66, cy - 0.28 * s, cz * 1.66]);
        }
        const atoms = [...c.map(pos => ({ el: "C", pos })), ...h.map(pos => ({ el: "H", pos }))];
        for (let i = 0; i < 6; i++) bonds.push([i, (i + 1) % 6, 1], [i, 6 + i * 2, 1], [i, 6 + i * 2 + 1, 1]);
        floorShadow(ctx, 1750, 1185, 245, 38, 0.14);
        renderMolecule3D(ctx, atoms, bonds, [1750, 855], 0.48, 0.35, 110);
        drawFloorTag(ctx, 1750, 1310, "C₆H₁₂");
      }
      // 4. Benzene C6H6 planar ring
      {
        const c = [], h = [], bonds = [];
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3 - Math.PI / 2;
          c.push([1.35 * Math.cos(a), 1.35 * Math.sin(a), 0]);
          h.push([2.28 * Math.cos(a), 2.28 * Math.sin(a), 0]);
        }
        const atoms = [...c.map(pos => ({ el: "C", pos })), ...h.map(pos => ({ el: "H", pos }))];
        for (let i = 0; i < 6; i++) bonds.push([i, (i + 1) % 6, i % 2 === 0 ? 2 : 1], [i, 6 + i, 1]);
        floorShadow(ctx, 2450, 1185, 230, 38, 0.14);
        renderMolecule3D(ctx, atoms, bonds, [2450, 840], 0.18, -0.20, 110);
        drawFloorTag(ctx, 2450, 1310, "C₆H₆");
      }
      return cv;
    },
    marks: makeLabels([
      { x: 180, y: 430, en: "Straight Chain (n-Butane)", hi: "सीधी शृंखला (n-ब्यूटेन)", info_en: "Four carbon atoms linked end-to-end in an unbranched C₄H₁₀ skeleton.", info_hi: "चार कार्बन परमाणु बिना शाखा के सीधी C₄H₁₀ शृंखला में जुड़े होते हैं।" },
      { x: 520, y: 425, en: "Branched Isomer (C₄H₁₀)", hi: "शाखित समावयवी (C₄H₁₀)", info_en: "2-Methylpropane shares formula C₄H₁₀ with n-butane but has a branched carbon skeleton (structural isomer).", info_hi: "समान आणविक सूत्र C₄H₁₀ पर भिन्न शाखित कार्बन कंकाल वाले यौगिक संरचनात्मक समावयवी कहलाते हैं।" },
      { x: 875, y: 425, en: "Saturated Ring (C₆H₁₂)", hi: "संतृप्त वलय (साइक्लोहेक्सेन)", info_en: "Cyclohexane forms a six-carbon single-bonded closed ring with 12 hydrogens.", info_hi: "साइक्लोहेक्सेन (C₆H₁₂) छह कार्बन परमाणुओं का एकल-बंध संतृप्त वलय है।" },
      { x: 1225, y: 420, en: "Unsaturated Ring (C₆H₆)", hi: "असंतृप्त वलय (बेंजीन)", info_en: "Benzene has a planar hexagonal six-carbon ring with alternating double bonds.", info_hi: "बेंजीन (C₆H₆) एकांतर द्वि-बंधों वाला समतलीय षट्कोणीय कार्बन वलय है।" }
    ])
  },

  // #11 c10_carbon §4.2.3
  {
    id: "functional_groups_carbon",
    wid: "c10_carbon",
    sec: "4.2.3",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1160 });
      // 1. Haloalkane CH3-CH2-Cl
      {
        const atoms = [
          { el: "C", pos: [-1.0, -0.2, 0] }, { el: "C", pos: [0.3, 0.35, 0] }, { el: "Cl", pos: [1.75, -0.25, 0] },
          { el: "H", pos: [-1.75, 0.45, 0] }, { el: "H", pos: [-1.05, -0.82, 0.78] }, { el: "H", pos: [-1.05, -0.82, -0.78] },
          { el: "H", pos: [0.32, 0.98, 0.78] }, { el: "H", pos: [0.32, 0.98, -0.78] }
        ];
        const bonds = [[0,1,1],[1,2,1],[0,3,1],[0,4,1],[0,5,1],[1,6,1],[1,7,1]];
        floorShadow(ctx, 360, 1185, 230, 36, 0.14);
        renderMolecule3D(ctx, atoms, bonds, [360, 860], 0.25, -0.2, 116, true);
        drawFloorTag(ctx, 360, 1310, "–Cl  (C₂H₅Cl)", "#15803d");
      }
      // 2. Alcohol CH3-CH2-OH
      {
        const atoms = [
          { el: "C", pos: [-1.1, -0.2, 0] }, { el: "C", pos: [0.2, 0.35, 0] }, { el: "O", pos: [1.45, -0.22, 0] }, { el: "H", pos: [2.18, 0.35, 0] },
          { el: "H", pos: [-1.85, 0.45, 0] }, { el: "H", pos: [-1.15, -0.82, 0.78] }, { el: "H", pos: [-1.15, -0.82, -0.78] },
          { el: "H", pos: [0.22, 0.98, 0.78] }, { el: "H", pos: [0.22, 0.98, -0.78] }
        ];
        const bonds = [[0,1,1],[1,2,1],[2,3,1],[0,4,1],[0,5,1],[0,6,1],[1,7,1],[1,8,1]];
        floorShadow(ctx, 1040, 1185, 240, 36, 0.14);
        renderMolecule3D(ctx, atoms, bonds, [1040, 860], 0.25, -0.18, 114, true);
        drawFloorTag(ctx, 1040, 1310, "–OH  (C₂H₅OH)", "#b91c1c");
      }
      // 3. Aldehyde CH3-CHO
      {
        const atoms = [
          { el: "C", pos: [-1.0, -0.25, 0] }, { el: "C", pos: [0.35, 0.15, 0] }, { el: "O", pos: [0.75, 1.38, 0] }, { el: "H", pos: [1.28, -0.58, 0] },
          { el: "H", pos: [-1.75, 0.42, 0] }, { el: "H", pos: [-1.05, -0.88, 0.78] }, { el: "H", pos: [-1.05, -0.88, -0.78] }
        ];
        const bonds = [[0,1,1],[1,2,2],[1,3,1],[0,4,1],[0,5,1],[0,6,1]];
        floorShadow(ctx, 1740, 1185, 225, 36, 0.14);
        renderMolecule3D(ctx, atoms, bonds, [1740, 880], 0.20, -0.18, 118, true);
        drawFloorTag(ctx, 1740, 1310, "–CHO  (CH₃CHO)", "#b91c1c");
      }
      // 4. Carboxylic acid CH3-COOH
      {
        const atoms = [
          { el: "C", pos: [-1.15, -0.25, 0] }, { el: "C", pos: [0.20, 0.12, 0] }, { el: "O", pos: [0.55, 1.38, 0] },
          { el: "O", pos: [1.25, -0.72, 0] }, { el: "H", pos: [2.05, -0.35, 0] },
          { el: "H", pos: [-1.88, 0.42, 0] }, { el: "H", pos: [-1.18, -0.88, 0.78] }, { el: "H", pos: [-1.18, -0.88, -0.78] }
        ];
        const bonds = [[0,1,1],[1,2,2],[1,3,1],[3,4,1],[0,5,1],[0,6,1],[0,7,1]];
        floorShadow(ctx, 2440, 1185, 245, 36, 0.14);
        renderMolecule3D(ctx, atoms, bonds, [2440, 880], 0.20, -0.16, 114, true);
        drawFloorTag(ctx, 2440, 1310, "–COOH  (CH₃COOH)", "#991b1b");
      }
      return cv;
    },
    marks: makeLabels([
      { x: 245, y: 445, en: "Haloalkane (–Cl)", hi: "हैलोऐल्केन (–Cl)", info_en: "A halogen heteroatom (Cl or Br) replaces one hydrogen on the hydrocarbon chain.", info_hi: "हाइड्रोकार्बन शृंखला के एक हाइड्रोजन को क्लोरीन या ब्रोमीन परमाणु विस्थापित करता है।" },
      { x: 580, y: 440, en: "Alcohol Group (–OH)", hi: "ऐल्कोहॉल समूह (–OH)", info_en: "The hydroxyl group (–OH) makes ethanol polar, water-miscible and reactive toward sodium.", info_hi: "हाइड्रॉक्सिल समूह (–OH) यौगिक को जल में घुलनशील और विशिष्ट रासायनिक गुण देता है।" },
      { x: 905, y: 380, en: "Aldehyde Group (–CHO)", hi: "ऐल्डिहाइड समूह (–CHO)", info_en: "Terminal carbonyl carbon bonded to both double-bonded oxygen (=O) and one hydrogen.", info_hi: "सिरे के कार्बन पर द्वि-बंधित ऑक्सीजन (=O) और एक हाइड्रोजन जुड़ा होता है।" },
      { x: 1255, y: 425, en: "Carboxylic Acid (–COOH)", hi: "कार्बोक्सिलिक अम्ल (–COOH)", info_en: "Combines carbonyl (>C=O) and hydroxyl (–OH) on one carbon, imparting weak acidic properties.", info_hi: "कार्बोनिल व हाइड्रॉक्सिल युक्त –COOH समूह कार्बनिक यौगिक को अम्लीय गुण प्रदान करता है।" }
    ])
  },

  // #12 c10_carbon §4.2.5
  {
    id: "iupac_carbon_naming",
    wid: "c10_carbon",
    sec: "4.2.5",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1160 });
      // 1. Propane C3H8
      {
        const atoms = [
          { el: "C", pos: [-1.25, -0.25, 0] }, { el: "C", pos: [0, 0.48, 0] }, { el: "C", pos: [1.25, -0.25, 0] },
          { el: "H", pos: [-2.0, 0.35, 0] }, { el: "H", pos: [-1.28, -0.88, 0.78] }, { el: "H", pos: [-1.28, -0.88, -0.78] },
          { el: "H", pos: [0, 1.12, 0.78] }, { el: "H", pos: [0, 1.12, -0.78] },
          { el: "H", pos: [2.0, 0.35, 0] }, { el: "H", pos: [1.28, -0.88, 0.78] }, { el: "H", pos: [1.28, -0.88, -0.78] }
        ];
        const bonds = [[0,1,1],[1,2,1],[0,3,1],[0,4,1],[0,5,1],[1,6,1],[1,7,1],[2,8,1],[2,9,1],[2,10,1]];
        floorShadow(ctx, 360, 1185, 235, 36, 0.14);
        renderMolecule3D(ctx, atoms, bonds, [360, 865], 0.28, -0.2, 114);
        drawFloorTag(ctx, 360, 1310, "prop + ane");
      }
      // 2. Propene C3H6 (C=C)
      {
        const atoms = [
          { el: "C", pos: [-1.25, -0.28, 0] }, { el: "C", pos: [0, 0.35, 0] }, { el: "C", pos: [1.32, -0.18, 0] },
          { el: "H", pos: [-2.0, 0.35, 0] }, { el: "H", pos: [-1.28, -0.92, 0.78] }, { el: "H", pos: [-1.28, -0.92, -0.78] },
          { el: "H", pos: [-0.08, 1.32, 0] },
          { el: "H", pos: [2.08, 0.42, 0] }, { el: "H", pos: [1.52, -1.12, 0] }
        ];
        const bonds = [[0,1,1],[1,2,2],[0,3,1],[0,4,1],[0,5,1],[1,6,1],[2,7,1],[2,8,1]];
        floorShadow(ctx, 1040, 1185, 235, 36, 0.14);
        renderMolecule3D(ctx, atoms, bonds, [1040, 865], 0.22, -0.15, 114);
        drawFloorTag(ctx, 1040, 1310, "prop + ene (C=C)", "#1d4ed8");
      }
      // 3. Propyne C3H4 (linear C≡C)
      {
        const atoms = [
          { el: "C", pos: [-1.45, -0.1, 0] }, { el: "C", pos: [-0.05, 0.05, 0] }, { el: "C", pos: [1.28, 0.20, 0] },
          { el: "H", pos: [-2.12, 0.58, 0] }, { el: "H", pos: [-1.58, -0.78, 0.75] }, { el: "H", pos: [-1.58, -0.78, -0.75] },
          { el: "H", pos: [2.22, 0.31, 0] }
        ];
        const bonds = [[0,1,1],[1,2,3],[0,3,1],[0,4,1],[0,5,1],[2,6,1]];
        floorShadow(ctx, 1740, 1185, 235, 36, 0.14);
        renderMolecule3D(ctx, atoms, bonds, [1740, 865], 0.22, -0.15, 114);
        drawFloorTag(ctx, 1740, 1310, "prop + yne (C≡C)", "#6d28d9");
      }
      // 4. Propanone CH3-CO-CH3
      {
        const atoms = [
          { el: "C", pos: [-1.28, -0.35, 0] }, { el: "C", pos: [0, 0.22, 0] }, { el: "C", pos: [1.28, -0.35, 0] },
          { el: "O", pos: [0, 1.48, 0] },
          { el: "H", pos: [-2.02, 0.28, 0] }, { el: "H", pos: [-1.32, -0.98, 0.78] }, { el: "H", pos: [-1.32, -0.98, -0.78] },
          { el: "H", pos: [2.02, 0.28, 0] }, { el: "H", pos: [1.32, -0.98, 0.78] }, { el: "H", pos: [1.32, -0.98, -0.78] }
        ];
        const bonds = [[0,1,1],[1,2,1],[1,3,2],[0,4,1],[0,5,1],[0,6,1],[2,7,1],[2,8,1],[2,9,1]];
        floorShadow(ctx, 2440, 1185, 235, 36, 0.14);
        renderMolecule3D(ctx, atoms, bonds, [2440, 895], 0.22, -0.15, 114, true);
        drawFloorTag(ctx, 2440, 1310, "propan − e + one", "#b91c1c");
      }
      return cv;
    },
    marks: makeLabels([
      { x: 180, y: 435, en: "Propane (–ane)", hi: "प्रोपेन (–ऐन)", info_en: "Root 'prop-' counts 3 carbons; suffix '-ane' marks a saturated single-bonded alkane (C₃H₈).", info_hi: "मूल शब्द 'प्रोप-' 3 कार्बन गिनता है और प्रत्यय '-ऐन' एकल-बंध संतृप्त हाइड्रोकार्बन दर्शाता है।" },
      { x: 520, y: 435, en: "Propene (–ene)", hi: "प्रोपीन (–ईन)", info_en: "Replacing '-ane' with '-ene' denotes one carbon–carbon double bond (C₃H₆).", info_hi: "द्वि-बंध (C=C) उपस्थित होने पर नाम के अंत में '-ईन' प्रत्यय जुड़ता है (प्रोपीन, C₃H₆)।" },
      { x: 870, y: 435, en: "Propyne (–yne)", hi: "प्रोपाइन (–आइन)", info_en: "Suffix '-yne' indicates a linear carbon–carbon triple bond (C₃H₄).", info_hi: "त्रि-बंध (C≡C) वाले तीन-कार्बन यौगिक में '-आइन' प्रत्यय लगकर प्रोपाइन (C₃H₄) बनता है।" },
      { x: 1220, y: 380, en: "Propanone (–one)", hi: "प्रोपेनोन (–ओन)", info_en: "Drop final '-e' before vowel suffix '-one' for an internal ketone carbonyl group (CH₃COCH₃).", info_hi: "कीटोन समूह (>C=O) के लिए अंतिम 'e' हटाकर '-ओन' जोड़ने से प्रोपेनोन बनता है।" }
    ])
  },

  // #13 c10_carbon §4.3.1
  {
    id: "clean_vs_sooty_flame",
    wid: "c10_carbon",
    sec: "4.3.1",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1220 });
      drawBunsenFlame(ctx, 760, 1190, "blue");
      drawFloorTag(ctx, 760, 1330, "CH₄ + 2O₂ → CO₂ + 2H₂O + Heat", "#0369a1");
      drawBunsenFlame(ctx, 2060, 1190, "sooty");
      drawFloorTag(ctx, 2060, 1330, "Limited O₂ → CO + C (Soot)", "#b45309");
      return cv;
    },
    marks: makeLabels([
      { x: 380, y: 545, en: "Open Air Hole (+O₂)", hi: "खुला वायु छिद्र (+O₂)", info_en: "Sufficient oxygen mixes with fuel gas in the burner barrel for complete oxidation.", info_hi: "खुले वायु छिद्र से पर्याप्त ऑक्सीजन ईंधन के साथ मिलकर पूर्ण दहन करती है।" },
      { x: 410, y: 355, en: "Clean Blue Flame", hi: "स्वच्छ नीली ज्वाला", info_en: "Saturated hydrocarbons with ample air burn completely with a hot, soot-free blue flame.", info_hi: "संतृप्त हाइड्रोकार्बन पर्याप्त वायु में बिना कालिख की गर्म नीली ज्वाला देते हैं।" },
      { x: 1030, y: 345, en: "Yellow Luminous Flame", hi: "पीली दीप्त ज्वाला", info_en: "Unsaturated hydrocarbons or restricted air cause incomplete combustion with incandescent carbon particles.", info_hi: "असंतृप्त कार्बन यौगिक या कम वायु में अधूरे दहन से तप्त कार्बन कण पीली चमक देते हैं।" },
      { x: 1055, y: 235, en: "Black Carbon Soot", hi: "काली कार्बन कालिख", info_en: "Unburnt carbon deposits as black soot on vessels when air supply or stove inlets are blocked.", info_hi: "अधूरे दहन से बिना जला कार्बन बर्तन की तली पर काली कालिख के रूप में जम जाता है।" }
    ])
  },

  // #14 c10_carbon §4.3.2
  {
    id: "ethanol_oxidation_kmno4",
    wid: "c10_carbon",
    sec: "4.3.2",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Left: Ethanol 3D molecule
      const etoh = [
        { el: "C", pos: [-0.9, -0.2, 0] }, { el: "C", pos: [0.3, 0.35, 0] }, { el: "O", pos: [1.45, -0.2, 0] }, { el: "H", pos: [2.15, 0.35, 0] },
        { el: "H", pos: [-1.6, 0.45, 0] }, { el: "H", pos: [-0.95, -0.82, 0.76] }, { el: "H", pos: [-0.95, -0.82, -0.76] },
        { el: "H", pos: [0.32, 0.98, 0.76] }, { el: "H", pos: [0.32, 0.98, -0.76] }
      ];
      floorShadow(ctx, 430, 1180, 210, 34, 0.14);
      renderMolecule3D(ctx, etoh, [[0,1,1],[1,2,1],[2,3,1],[0,4,1],[0,5,1],[0,6,1],[1,7,1],[1,8,1]], [430, 880], 0.24, -0.18, 108, true);
      drawFloorTag(ctx, 430, 1300, "CH₃CH₂OH");

      // Center: Warm water bath beaker + immersed ethanol test tube + purple KMnO4 dropper
      drawBeaker(ctx, 1140, 680, 520, 480, "rgba(186,230,253,0.45)", 0.72, { bubbles: 14 });
      // Immersed test tube
      ctx.save();
      ctx.fillStyle = "rgba(233,213,255,0.78)";
      roundRect(ctx, 1345, 490, 110, 560, 54); ctx.fill();
      ctx.strokeStyle = "#475569"; ctx.lineWidth = 4.5; ctx.stroke();
      // Dropper above with deep purple KMnO4
      ctx.fillStyle = "#7e22ce";
      ctx.beginPath(); ctx.ellipse(1400, 285, 36, 56, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(226,232,240,0.8)"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 3.5;
      roundRect(ctx, 1384, 335, 32, 95, 8); ctx.fill(); ctx.stroke();
      // Falling purple drops
      for (const dy of [452, 505]) {
        drawSphere3D(ctx, 1400, dy, 15, ["#e879f9", "#9333ea", "#4c1d95", "#f5d0fe"]);
      }
      ctx.restore();
      drawFloorTag(ctx, 1400, 1300, "Alk. KMnO₄ + Heat (+2[O])", "#7e22ce");

      drawArrow(ctx, 720, 880, 1080, 880, "#7e22ce", 9, 28);
      drawArrow(ctx, 1720, 880, 2040, 880, "#b91c1c", 9, 28);

      // Right: Ethanoic acid 3D molecule
      const acoh = [
        { el: "C", pos: [-1.05, -0.25, 0] }, { el: "C", pos: [0.22, 0.12, 0] }, { el: "O", pos: [0.55, 1.35, 0] },
        { el: "O", pos: [1.22, -0.72, 0] }, { el: "H", pos: [2.0, -0.35, 0] },
        { el: "H", pos: [-1.75, 0.42, 0] }, { el: "H", pos: [-1.08, -0.88, 0.76] }, { el: "H", pos: [-1.08, -0.88, -0.76] }
      ];
      floorShadow(ctx, 2380, 1180, 225, 34, 0.14);
      renderMolecule3D(ctx, acoh, [[0,1,1],[1,2,2],[1,3,1],[3,4,1],[0,5,1],[0,6,1],[0,7,1]], [2380, 885], 0.20, -0.16, 108, true);
      drawFloorTag(ctx, 2380, 1300, "CH₃COOH + H₂O", "#b91c1c");
      return cv;
    },
    marks: makeLabels([
      { x: 215, y: 440, en: "Ethanol (CH₃CH₂OH)", hi: "एथेनॉल (CH₃CH₂OH)", info_en: "Primary alcohol reactant containing the –CH₂OH group before oxidation.", info_hi: "ऑक्सीकरण से पूर्व –CH₂OH समूह वाला प्राथमिक ऐल्कोहॉल अभिकारक।" },
      { x: 700, y: 225, en: "Alkaline KMnO₄ Drops", hi: "क्षारीय KMnO₄ ऑक्सीकारक", info_en: "Purple permanganate supplies nascent oxygen [O] and decolourises as it oxidises ethanol.", info_hi: "बैंगनी क्षारीय KMnO₄ नवजात ऑक्सीजन देकर एथेनॉल का ऑक्सीकरण करता है और स्वयं रंगहीन हो जाता है।" },
      { x: 650, y: 495, en: "Warm Water Bath", hi: "गर्म जल-ऊष्मक", info_en: "Gentle heating in a water bath safely accelerates complete oxidation without igniting ethanol.", info_hi: "जल-ऊष्मक में धीमा तापन सुरक्षित रूप से ऑक्सीकरण अभिक्रिया को पूर्ण करता है।" },
      { x: 1190, y: 440, en: "Ethanoic Acid (CH₃COOH)", hi: "एथेनोइक अम्ल उत्पाद", info_en: "Addition of oxygen and loss of hydrogen converts ethanol into carboxylic ethanoic acid.", info_hi: "ऑक्सीजन जुड़ने से एथेनॉल अंततः कार्बोक्सिलिक अम्ल (CH₃COOH) में बदल जाता है।" }
    ])
  },

  // #15 c10_carbon §4.3.3
  {
    id: "alkene_hydrogenation_ni",
    wid: "c10_carbon",
    sec: "4.3.3",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Left: Planar Ethene C2H4 + H2
      const ethene = [
        { el: "C", pos: [-0.68, 0, 0] }, { el: "C", pos: [0.68, 0, 0] },
        { el: "H", pos: [-1.35, 0.82, 0] }, { el: "H", pos: [-1.35, -0.82, 0] },
        { el: "H", pos: [1.35, 0.82, 0] }, { el: "H", pos: [1.35, -0.82, 0] }
      ];
      renderMolecule3D(ctx, ethene, [[0,1,2],[0,2,1],[0,3,1],[1,4,1],[1,5,1]], [450, 720], 0.18, -0.12, 115, true);
      renderMolecule3D(ctx, [{ el: "H", pos: [-0.45, 0, 0] }, { el: "H", pos: [0.45, 0, 0] }], [[0,1,1]], [450, 1020], 0, 0, 115, true);
      drawFloorTag(ctx, 450, 1300, "CH₂=CH₂ + H₂", "#1d4ed8");

      // Center: 3D Metallic Nickel (Ni) Catalyst Crystal Bed
      floorShadow(ctx, 1410, 1140, 340, 44, 0.18);
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 6; col++) {
          const nx = 1130 + col * 108 + (row % 2) * 36;
          const ny = 960 + row * 68;
          drawSphere3D(ctx, nx, ny, 48, "Ni", { symbol: row === 1 && col === 2 ? "Ni" : "" });
        }
      }
      // Adsorbed H atoms on Ni surface
      drawSphere3D(ctx, 1340, 880, 26, "H", { glow: "rgba(56,189,248,0.65)", symbol: "H" });
      drawSphere3D(ctx, 1510, 880, 26, "H", { glow: "rgba(56,189,248,0.65)", symbol: "H" });
      drawArrow(ctx, 790, 840, 1100, 860, "#0284c7", 9, 28);
      drawArrow(ctx, 1740, 860, 2040, 840, "#15803d", 9, 28);
      drawFloorTag(ctx, 1410, 1300, "Ni / Pd Catalyst · Heat", "#334155");

      // Right: Saturated Ethane C2H6
      const ethane = [
        { el: "C", pos: [-0.72, -0.1, 0] }, { el: "C", pos: [0.72, 0.1, 0] },
        { el: "H", pos: [-1.35, 0.68, 0] }, { el: "H", pos: [-0.82, -0.75, 0.78] }, { el: "H", pos: [-0.82, -0.75, -0.78] },
        { el: "H", pos: [1.35, -0.68, 0] }, { el: "H", pos: [0.82, 0.75, 0.78] }, { el: "H", pos: [0.82, 0.75, -0.78] }
      ];
      floorShadow(ctx, 2360, 1180, 230, 34, 0.14);
      renderMolecule3D(ctx, ethane, [[0,1,1],[0,2,1],[0,3,1],[0,4,1],[1,5,1],[1,6,1],[1,7,1]], [2360, 840], 0.26, -0.22, 115, true);
      drawFloorTag(ctx, 2360, 1300, "CH₃–CH₃ (Saturated)", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 225, y: 360, en: "Unsaturated Alkene (C=C)", hi: "असंतृप्त ऐल्कीन (C=C)", info_en: "Planar ethene (C₂H₄) has a reactive π-bond ready to add hydrogen across the double bond.", info_hi: "एथीन (C₂H₄) के द्वि-बंध पर हाइड्रोजन परमाणु जुड़ सकते हैं।" },
      { x: 225, y: 510, en: "Hydrogen Gas (H₂)", hi: "हाइड्रोजन अणु (H₂)", info_en: "Molecular hydrogen dissociates on the metal surface so single H atoms add to each carbon.", info_hi: "हाइड्रोजन गैस उत्प्रेरक सतह पर टूटकर दोनों कार्बनों से जुड़ती है।" },
      { x: 705, y: 495, en: "Nickel Catalyst Surface", hi: "निकेल (Ni) उत्प्रेरक", info_en: "Finely divided Ni or Pd adsorbs reactants without being consumed, converting vegetable oil to vanaspati ghee.", info_hi: "निकेल या पैलेडियम उत्प्रेरक बिना खर्च हुए अभिक्रिया कराता है; इसी से वनस्पति तेल से घी बनता है।" },
      { x: 1180, y: 420, en: "Saturated Alkane (C₂H₆)", hi: "संतृप्त ऐल्केन (C₂H₆)", info_en: "Double bond becomes a tetrahedral single C–C bond in saturated ethane.", info_hi: "द्वि-बंध एकल बंध में बदलकर संतृप्त एथेन (CH₃–CH₃) बनाता है।" }
    ])
  },

  // #16 c10_carbon §4.3.4
  {
    id: "methane_chlorination_uv",
    wid: "c10_carbon",
    sec: "4.3.4",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Golden UV sunlight beam diagonal across center
      ctx.save();
      const uv = ctx.createLinearGradient(1080, 220, 1520, 920);
      uv.addColorStop(0, "rgba(250,204,21,0.52)");
      uv.addColorStop(0.6, "rgba(253,224,71,0.22)");
      uv.addColorStop(1, "rgba(253,224,71,0)");
      ctx.fillStyle = uv;
      ctx.beginPath();
      ctx.moveTo(1060, 230); ctx.lineTo(1360, 230); ctx.lineTo(1620, 980); ctx.lineTo(1240, 980); ctx.closePath();
      ctx.fill();
      drawSphere3D(ctx, 1180, 310, 62, "Au", { glow: "rgba(250,204,21,0.7)", symbol: "hν" });
      ctx.restore();

      // Left: CH4 + Cl2
      const ch4 = [
        { el: "C", pos: [0, 0, 0] },
        { el: "H", pos: [0, 1.05, 0] }, { el: "H", pos: [0.98, -0.35, 0] },
        { el: "H", pos: [-0.55, -0.35, 0.82] }, { el: "H", pos: [-0.55, -0.35, -0.82] }
      ];
      renderMolecule3D(ctx, ch4, [[0,1,1],[0,2,1],[0,3,1],[0,4,1]], [420, 740], 0.22, -0.2, 120, true);
      renderMolecule3D(ctx, [{ el: "Cl", pos: [-0.68, 0, 0] }, { el: "Cl", pos: [0.68, 0, 0] }], [[0,1,1]], [860, 860], 0, 0, 112, true);
      drawFloorTag(ctx, 610, 1300, "CH₄ + Cl₂");

      drawArrow(ctx, 1120, 820, 1580, 820, "#ca8a04", 10, 30);

      // Right: CH3Cl + HCl
      const ch3cl = [
        { el: "C", pos: [0, 0, 0] },
        { el: "Cl", pos: [0, 1.25, 0] }, { el: "H", pos: [0.98, -0.38, 0] },
        { el: "H", pos: [-0.55, -0.38, 0.82] }, { el: "H", pos: [-0.55, -0.38, -0.82] }
      ];
      renderMolecule3D(ctx, ch3cl, [[0,1,1],[0,2,1],[0,3,1],[0,4,1]], [1950, 780], 0.22, -0.2, 120, true);
      renderMolecule3D(ctx, [{ el: "H", pos: [-0.52, 0, 0] }, { el: "Cl", pos: [0.58, 0, 0] }], [[0,1,1]], [2460, 880], 0, 0, 112, true);
      drawFloorTag(ctx, 2180, 1300, "CH₃Cl + HCl  (→ CH₂Cl₂ → CHCl₃ → CCl₄)", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 210, y: 370, en: "Methane (CH₄)", hi: "मेथेन (CH₄)", info_en: "Saturated alkane with four strong C–H single bonds, unreactive in the dark.", info_hi: "चार एकल C–H बंधों वाला संतृप्त हाइड्रोकार्बन जो अँधेरे में अक्रिय रहता है।" },
      { x: 590, y: 165, en: "Sunlight Photons (hν)", hi: "सूर्यप्रकाश ऊर्जा (hν)", info_en: "Ultraviolet light splits Cl₂ molecules to initiate rapid free-radical substitution.", info_hi: "सूर्य के प्रकाश की उपस्थिति में क्लोरीन सक्रिय होकर तीव्र प्रतिस्थापन अभिक्रिया शुरू करती है।" },
      { x: 975, y: 390, en: "Chloromethane (CH₃Cl)", hi: "क्लोरोमेथेन (CH₃Cl)", info_en: "One chlorine atom substitutes one hydrogen atom on carbon; further steps yield CH₂Cl₂, CHCl₃ and CCl₄.", info_hi: "क्लोरीन परमाणु एक-एक कर हाइड्रोजन को प्रतिस्थापित करके CH₃Cl, CH₂Cl₂, CHCl₃ व CCl₄ बनाता है।" },
      { x: 1230, y: 440, en: "Hydrogen Chloride (HCl)", hi: "हाइड्रोजन क्लोराइड (HCl)", info_en: "The displaced hydrogen combines with the second chlorine atom to form HCl by-product.", info_hi: "हटाया गया हाइड्रोजन परमाणु दूसरे क्लोरीन के साथ मिलकर सह-उत्पाद HCl बनाता है।" }
    ])
  },

  // #17 c10_carbon §4.4.2
  {
    id: "ethanoic_acid_tests",
    wid: "c10_carbon",
    sec: "4.4.2",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // 1. Glacial acetic acid frozen crystals at 290 K
      drawBeaker(ctx, 210, 690, 380, 470, "rgba(186,230,253,0.45)", 0.68);
      ctx.save();
      ctx.fillStyle = "rgba(241,245,249,0.92)"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 4;
      roundRect(ctx, 355, 510, 90, 560, 45); ctx.fill(); ctx.stroke();
      // Crystalline needles inside
      ctx.strokeStyle = "#93c5fd"; ctx.lineWidth = 5;
      for (let i = 0; i < 9; i++) {
        ctx.beginPath(); ctx.moveTo(372 + (i % 3) * 20, 760 + i * 28); ctx.lineTo(418 - (i % 2) * 22, 790 + i * 26); ctx.stroke();
      }
      ctx.restore();
      drawFloorTag(ctx, 400, 1310, "Glacial (mp 290 K)", "#0369a1");

      // 2. Weak acid pH 4 strip vs strong acid pH 1
      drawBeaker(ctx, 820, 740, 360, 420, "rgba(254,243,199,0.52)", 0.62);
      ctx.save();
      ctx.fillStyle = "#fb923c"; ctx.strokeStyle = "#9a3412"; ctx.lineWidth = 3;
      roundRect(ctx, 975, 520, 52, 430, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#fde047"; ctx.fillRect(977, 522, 48, 210);
      ctx.restore();
      drawFloorTag(ctx, 1000, 1310, "Weak Acid (pH depends on concentration)", "#ea580c");

      // 3. Reaction flask: CH3COOH + Na2CO3 -> brisk CO2 bubbles + delivery tube to 4. Milky lime water
      drawBeaker(ctx, 1480, 700, 390, 460, "rgba(226,232,240,0.55)", 0.58, { bubbles: 22 });
      drawBeaker(ctx, 2150, 740, 410, 420, "rgba(248,250,252,0.92)", 0.66, {
        liquidMid: "rgba(241,245,249,0.96)", liquidDark: "rgba(203,213,225,0.95)", bubbles: 12
      });
      // Bent glass delivery tube carrying CO2
      ctx.save();
      ctx.strokeStyle = "#64748b"; ctx.lineWidth = 18; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(1675, 760); ctx.lineTo(1675, 480); ctx.lineTo(2355, 480); ctx.lineTo(2355, 1020); ctx.stroke();
      ctx.strokeStyle = "#f8fafc"; ctx.lineWidth = 9; ctx.stroke();
      ctx.restore();
      drawFloorTag(ctx, 1675, 1310, "+ Na₂CO₃ → CO₂↑", "#1d4ed8");
      drawFloorTag(ctx, 2355, 1310, "Milky CaCO₃", "#334155");
      return cv;
    },
    marks: makeLabels([
      { x: 200, y: 420, en: "Glacial Acetic Acid", hi: "ग्लेशियल ऐसीटिक अम्ल", info_en: "Pure anhydrous ethanoic acid freezes at 290 K (17 °C) into ice-like crystals in cool weather.", info_hi: "शुद्ध एथेनोइक अम्ल का गलनांक 290 K होता है, इसलिए सर्दियों में यह बर्फ जैसा जम जाता है।" },
      { x: 500, y: 390, en: "Weak Acid", hi: "दुर्बल अम्ल", info_en: "Ethanoic acid ionises partially in water. Its pH and indicator colour depend on concentration, not acid strength alone.", info_hi: "एथेनोइक अम्ल जल में आंशिक आयनित होता है। इसका pH और सूचक का रंग सांद्रता पर भी निर्भर करते हैं।" },
      { x: 838, y: 460, en: "Carbonate Effervescence", hi: "कार्बोनेट से बुदबुदाहट", info_en: "Reacts with Na₂CO₃ or NaHCO₃ to form sodium ethanoate, water and brisk CO₂ bubbles.", info_hi: "सोडियम कार्बोनेट या बाइकार्बोनेट के साथ अभिक्रिया कर तीव्र CO₂ गैस छोड़ता है।" },
      { x: 1178, y: 485, en: "Milky Lime Water", hi: "दूधिया चूने का पानी", info_en: "Evolved CO₂ gas reacts with Ca(OH)₂ lime water to form white insoluble CaCO₃ suspension.", info_hi: "निकली हुई CO₂ गैस चूने के पानी को श्वेत कैल्सियम कार्बोनेट बनने से दूधिया कर देती है।" }
    ])
  },

  // #38 c9_mixtures §5.2
  {
    id: "solution_solute_solvent",
    wid: "c9_mixtures",
    sec: "5.2",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Watch glass with blue CuSO4 solute crystals
      floorShadow(ctx, 420, 1150, 220, 28, 0.14);
      ctx.fillStyle = "#e2e8f0"; ctx.strokeStyle = "#64748b"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(420, 1125, 210, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 16; i++) {
        drawSphere3D(ctx, 330 + (i % 5) * 44, 1105 - Math.floor(i / 5) * 26, 22, ["#60a5fa", "#2563eb", "#1e3a8a", "#dbeafe"]);
      }
      drawFloorTag(ctx, 420, 1295, "Solute (CuSO₄)", "#1d4ed8");

      drawArrow(ctx, 660, 960, 910, 900, "#2563eb", 9, 28);

      // True homogeneous solution beaker with green laser passing WITHOUT visible beam inside!
      drawBeaker(ctx, 980, 650, 520, 510, "rgba(59,130,246,0.46)", 0.74, {
        liquidMid: "rgba(37,99,235,0.48)", liquidDark: "rgba(29,78,216,0.56)"
      });
      // Laser pointer on left of beaker -> beam outside -> invisible inside true solution -> spot on screen!
      ctx.fillStyle = "#1e293b"; roundRect(ctx, 730, 885, 140, 38, 12); ctx.fill();
      ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(870, 904); ctx.lineTo(980, 904); ctx.stroke();
      ctx.setLineDash([8, 14]); ctx.strokeStyle = "rgba(34,197,94,0.18)";
      ctx.beginPath(); ctx.moveTo(988, 904); ctx.lineTo(1492, 904); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = "#22c55e";
      ctx.beginPath(); ctx.moveTo(1500, 904); ctx.lineTo(1660, 904); ctx.stroke();
      drawFloorTag(ctx, 1240, 1295, "Homogeneous Solution (No Scattering)", "#0f766e");

      // Right: Magnified sub-nm (<1 nm) molecular hydration zoom circle
      floorShadow(ctx, 2240, 1170, 290, 34, 0.14);
      ctx.save();
      const zg = ctx.createRadialGradient(2240, 820, 30, 2240, 820, 310);
      zg.addColorStop(0, "#eff6ff"); zg.addColorStop(1, "#bfdbfe");
      ctx.fillStyle = zg;
      ctx.beginPath(); ctx.arc(2240, 820, 300, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 8; ctx.stroke();
      // Evenly dispersed tiny hydrated ions & water molecules
      const pts = [[-130,-90],[110,-110],[0,10],[-140,120],[135,105]];
      for (const [dx, dy] of pts) {
        drawSphere3D(ctx, 2240 + dx, 820 + dy, 24, "N");
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + 0.4;
          drawSphere3D(ctx, 2240 + dx + 52 * Math.cos(a), 820 + dy + 52 * Math.sin(a), 14, "O");
        }
      }
      ctx.restore();
      drawFloorTag(ctx, 2240, 1295, "Particles < 1 nm", "#1e40af");
      return cv;
    },
    marks: makeLabels([
      { x: 210, y: 555, en: "Solute Component", hi: "विलेय घटक", info_en: "The minor component (such as copper sulphate or salt) that dissolves into the solvent.", info_hi: "कम मात्रा वाला घटक जो विलायक में घुल जाता है, विलेय कहलाता है।" },
      { x: 620, y: 410, en: "Solvent Medium", hi: "विलायक माध्यम", info_en: "The major liquid component (water) that dissolves the solute uniformly throughout its volume.", info_hi: "अधिक मात्रा वाला माध्यम (जैसे जल) जो विलेय को समान रूप से घोलता है।" },
      { x: 750, y: 452, en: "Zero Beam Scattering", hi: "प्रकाश प्रकीर्णन नहीं", info_en: "True solutions do not show the Tyndall effect because solute particles are too small to scatter light.", info_hi: "वास्तविक विलयन में कण अतिसूक्ष्म होने के कारण प्रकाश किरण का प्रकीर्णन नहीं होता।" },
      { x: 1120, y: 410, en: "Sub-nanometre (< 1 nm)", hi: "1 nm से छोटे कण", info_en: "Dissolved ions/molecules (< 10⁻⁹ m) never settle on standing and cannot be separated by filtration.", info_hi: "1 नैनोमीटर से छोटे कण न तो नीचे बैठते हैं और न ही छानने से अलग होते हैं।" }
    ])
  },

  // #39 c9_mixtures §5.5
  {
    id: "mass_by_mass_percent",
    wid: "c9_mixtures",
    sec: "5.5",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Digital balance weighing 15.0 g solute
      floorShadow(ctx, 480, 1165, 290, 34, 0.16);
      ctx.fillStyle = "#cbd5e1"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 4;
      roundRect(ctx, 220, 980, 520, 170, 26); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#0f172a"; roundRect(ctx, 320, 1025, 320, 82, 14); ctx.fill();
      ctx.fillStyle = "#4ade80"; ctx.font = '700 48px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("15.0 g", 480, 1082);
      // Weighing pan + white salt mound
      ctx.fillStyle = "#94a3b8"; roundRect(ctx, 280, 935, 400, 26, 10); ctx.fill();
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(350, 935); ctx.quadraticCurveTo(480, 805, 610, 935); ctx.closePath(); ctx.fill(); ctx.stroke();
      drawFloorTag(ctx, 480, 1300, "Solute = 15 g", "#1e40af");

      // Plus sign + 135 g Water Beaker
      ctx.fillStyle = "#334155"; ctx.font = '700 76px "DejaVu Sans", sans-serif'; ctx.fillText("+", 855, 920);
      drawBeaker(ctx, 980, 690, 420, 460, "rgba(125,211,252,0.45)", 0.65);
      drawFloorTag(ctx, 1190, 1300, "Solvent = 135 g", "#0369a1");

      drawArrow(ctx, 1480, 920, 1740, 920, "#0f766e", 10, 30);

      // Final 150 g Solution = 10% w/w with proportional stacked bar
      drawBeaker(ctx, 1820, 640, 460, 510, "rgba(56,189,248,0.55)", 0.76);
      // Vertical 10% vs 90% mass ratio bar on right
      ctx.fillStyle = "#bae6fd"; ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 4;
      roundRect(ctx, 2410, 640, 160, 510, 20); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#1d4ed8";
      roundRect(ctx, 2410, 1095, 160, 55, 14); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = '700 30px "DejaVu Sans", sans-serif';
      ctx.fillText("10%", 2490, 1132);
      drawFloorTag(ctx, 2190, 1300, "(15 / 150) × 100 = 10% w/w", "#0f766e");
      return cv;
    },
    marks: makeLabels([
      { x: 240, y: 460, en: "Solute Mass (15 g)", hi: "विलेय का द्रव्यमान (15 g)", info_en: "Measured on an analytical balance: m_solute = 15.0 g.", info_hi: "तुला पर मापा गया घुले पदार्थ (विलेय) का द्रव्यमान = 15.0 ग्राम।" },
      { x: 595, y: 460, en: "Solvent Mass (135 g)", hi: "विलायक का द्रव्यमान (135 g)", info_en: "Water mass added to dissolve the solute; total solution mass = 15 + 135 = 150 g.", info_hi: "विलायक जल का द्रव्यमान 135 g; कुल विलयन द्रव्यमान = 15 + 135 = 150 g।" },
      { x: 1025, y: 450, en: "Total Solution (150 g)", hi: "कुल विलयन (150 g)", info_en: "Denominator is always total solution mass (solute + solvent), never solvent alone.", info_hi: "सूत्र के हर में सदैव कुल विलयन का द्रव्यमान (विलेय + विलायक) रखा जाता है।" },
      { x: 1245, y: 555, en: "10% Mass Percentage", hi: "10% द्रव्यमान प्रतिशत", info_en: "Mass % = (15 g / 150 g) × 100 = 10% w/w, independent of temperature.", info_hi: "द्रव्यमान प्रतिशत = (15 / 150) × 100 = 10%, जो ताप बदलने पर नहीं बदलता।" }
    ])
  },

  // #40 c9_mixtures §5.6
  {
    id: "concentration_mv_vv",
    wid: "c9_mixtures",
    sec: "5.6",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Left half: w/v — Volumetric flask 100 mL with solid solute added
      floorShadow(ctx, 740, 1170, 250, 32, 0.15);
      ctx.save();
      // Volumetric flask bulb + long calibrated neck
      const fg = ctx.createLinearGradient(520, 600, 960, 1150);
      fg.addColorStop(0, "rgba(56,189,248,0.52)"); fg.addColorStop(1, "rgba(2,132,199,0.68)");
      ctx.fillStyle = fg; ctx.strokeStyle = "#475569"; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(695, 420); ctx.lineTo(695, 760);
      ctx.bezierCurveTo(480, 850, 490, 1150, 740, 1150);
      ctx.bezierCurveTo(990, 1150, 1000, 850, 785, 760);
      ctx.lineTo(785, 420); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Red calibration meniscus ring on neck (100 mL mark)
      ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(690, 585); ctx.lineTo(790, 585); ctx.stroke();
      // Small spoon/watch glass of solid crystals on left
      drawSphere3D(ctx, 430, 620, 26, "Na"); drawSphere3D(ctx, 475, 635, 24, "Na"); drawSphere3D(ctx, 450, 585, 22, "Na");
      drawArrow(ctx, 515, 605, 675, 460, "#7c3aed", 7, 22);
      ctx.restore();
      drawFloorTag(ctx, 740, 1300, "w / V  =  (g solute / 100 mL solution)", "#0369a1");

      // Right half: V/V — Graduated pipette delivering 20 mL liquid ethanol into 100 mL cylinder
      drawBeaker(ctx, 1890, 640, 340, 510, "rgba(167,243,208,0.55)", 0.78);
      // Amber/violet liquid layer mixing
      ctx.save();
      ctx.fillStyle = "rgba(16,185,129,0.45)";
      roundRect(ctx, 1900, 750, 320, 95, 16); ctx.fill();
      // Glass graduated pipette tilted above
      ctx.translate(2060, 480); ctx.rotate(0.22);
      ctx.fillStyle = "rgba(52,211,153,0.68)"; ctx.strokeStyle = "#334155"; ctx.lineWidth = 4;
      roundRect(ctx, -18, -190, 36, 360, 14); ctx.fill(); ctx.stroke();
      for (let t = -140; t <= 120; t += 40) {
        ctx.beginPath(); ctx.moveTo(-18, t); ctx.lineTo(4, t); ctx.stroke();
      }
      ctx.restore();
      drawFloorTag(ctx, 2060, 1300, "V / V  =  (mL solute / 100 mL solution)", "#047857");
      return cv;
    },
    marks: makeLabels([
      { x: 225, y: 305, en: "Weighed Solid Solute", hi: "तौला गया ठोस विलेय", info_en: "In mass-by-volume %(w/V), solute is measured in grams (common in saline & medicine).", info_hi: "द्रव्यमान-आयतन प्रतिशत (w/V) में ठोस विलेय को ग्राम में मापा जाता है।" },
      { x: 370, y: 295, en: "100 mL Calibration Mark", hi: "100 mL अंशांकन चिह्न", info_en: "Solvent is added up to the 100 mL volumetric mark so denominator is exact solution volume.", info_hi: "मापन फ्लास्क के 100 mL चिह्न तक विलयन बनाकर सटीक आयतन प्राप्त किया जाता है।" },
      { x: 1030, y: 245, en: "Liquid Solute Pipette", hi: "द्रव विलेय पिपेट", info_en: "In volume-by-volume %(V/V), liquid solutes such as ethanol are measured in millilitres.", info_hi: "दो द्रवों के विलयन (V/V) में विलेय का आयतन मिलीलीटर में मापा जाता है।" },
      { x: 1030, y: 460, en: "Miscible Liquid Solution", hi: "मिश्रणीय द्रव विलयन", info_en: "V/V % = (volume of solute / total solution volume) × 100.", info_hi: "आयतन प्रतिशत = (विलेय का आयतन / कुल विलयन का आयतन) × 100।" }
    ])
  },

  // #41 c9_mixtures §5.10
  {
    id: "centrifugation_coagulation",
    wid: "c9_mixtures",
    sec: "5.10",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Left: 3D High-speed Centrifuge rotor spinning angled tubes
      floorShadow(ctx, 700, 1165, 340, 38, 0.16);
      ctx.save();
      // Rotor spindle
      ctx.fillStyle = "#334155"; roundRect(ctx, 665, 520, 70, 620, 20); ctx.fill();
      ctx.fillStyle = "#64748b"; roundRect(ctx, 560, 1110, 280, 50, 18); ctx.fill();
      // Motion ellipse ring
      ctx.strokeStyle = "rgba(37,99,235,0.45)"; ctx.lineWidth = 6; ctx.setLineDash([22, 14]);
      ctx.beginPath(); ctx.ellipse(700, 790, 390, 95, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      // Left & right angled centrifuge tubes showing dense bottom pellet + clear supernatant
      for (const dir of [-1, 1]) {
        ctx.save();
        ctx.translate(700 + dir * 130, 610);
        ctx.rotate(dir * 0.52);
        // Supernatant
        ctx.fillStyle = "rgba(254,249,195,0.78)"; roundRect(ctx, -36, 0, 72, 340, 34); ctx.fill();
        // Dense dark pellet spun to tip
        ctx.fillStyle = "#b91c1c"; roundRect(ctx, -34, 265, 68, 75, 32); ctx.fill();
        ctx.strokeStyle = "#475569"; ctx.lineWidth = 4.5; roundRect(ctx, -36, 0, 72, 340, 34); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      drawFloorTag(ctx, 700, 1300, "Centrifugation (ω²r)", "#1d4ed8");

      // Right: Coagulation with Alum crystal (turbid clay colloid -> clear water + settled flocs)
      drawBeaker(ctx, 1620, 710, 360, 440, "rgba(180,130,80,0.62)", 0.72);
      drawArrow(ctx, 2020, 920, 2190, 920, "#0f766e", 9, 26);
      // Alum crystal suspended on thread + clear water above settled brown clay floc layer
      drawBeaker(ctx, 2230, 710, 380, 440, "rgba(186,230,253,0.38)", 0.72);
      ctx.save();
      ctx.fillStyle = "#92400e";
      roundRect(ctx, 2242, 1065, 356, 78, 22); ctx.fill();
      // Translucent octahedral alum crystal on string
      ctx.strokeStyle = "#475569"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(2420, 620); ctx.lineTo(2420, 850); ctx.stroke();
      ctx.fillStyle = "rgba(224,242,254,0.92)"; ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(2420, 815); ctx.lineTo(2465, 865); ctx.lineTo(2420, 915); ctx.lineTo(2375, 865); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
      drawFloorTag(ctx, 2120, 1300, "Alum Coagulation (Flocculation)", "#0f766e");
      return cv;
    },
    marks: makeLabels([
      { x: 350, y: 395, en: "Spinning Rotor", hi: "तीव्र घूर्णी अपकेंद्रित्र", info_en: "Rapid rotation creates outward centrifugal acceleration separating particles by density (cream from milk, blood cells).", info_hi: "तेज घूर्णन से घनत्व के आधार पर भारी कण बाहर व हल्के कण ऊपर अलग हो जाते हैं।" },
      { x: 475, y: 445, en: "Dense Pellet & Supernatant", hi: "सघन तलछट व स्वच्छ द्रव", info_en: "Denser suspended cells pack at the tube tip while lighter supernatant stays above.", info_hi: "भारी कण नली की तली में जम जाते हैं और स्वच्छ द्रव ऊपर रह जाता है।" },
      { x: 900, y: 465, en: "Turbid Clay Colloid", hi: "गंदला कोलॉइडी जल", info_en: "Charged fine clay particles repel one another and stay suspended without settling.", info_hi: "समान आवेशित सूक्ष्म मिट्टी कण प्रतिकर्षण के कारण बिना बैठे तैरते रहते हैं।" },
      { x: 1210, y: 435, en: "Alum Coagulation", hi: "फिटकरी द्वारा स्कंदन", info_en: "Al³⁺ ions neutralise colloidal charges so particles clump into heavy flocs and settle.", info_hi: "फिटकरी के आयन कोलॉइडी आवेश उदासीन कर कणों को भारी गुच्छों के रूप में नीचे बैठा देते हैं।" }
    ])
  },

  // #46 c9_atom §8.4
  {
    id: "thomson_plum_pudding",
    wid: "c9_atom",
    sec: "8.4",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Large 3D cutaway positively charged amber-crimson sphere with embedded blue electrons
      floorShadow(ctx, 980, 1175, 420, 44, 0.16);
      ctx.save();
      const cx = 980, cy = 760, R = 360;
      const g = ctx.createRadialGradient(cx - 110, cy - 120, 30, cx, cy, R);
      g.addColorStop(0, "#fca5a5"); g.addColorStop(0.52, "#ef4444"); g.addColorStop(0.88, "#991b1b"); g.addColorStop(1, "#fecaca");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      // Cutaway inner hemisphere glow showing uniform + charge distribution
      const ig = ctx.createRadialGradient(cx + 30, cy + 20, 20, cx + 30, cy + 20, R * 0.82);
      ig.addColorStop(0, "#fef2f2"); ig.addColorStop(0.65, "#fca5a5"); ig.addColorStop(1, "#dc2626");
      ctx.fillStyle = ig;
      ctx.beginPath(); ctx.arc(cx + 20, cy + 10, R * 0.78, -0.4, Math.PI + 0.4); ctx.closePath(); ctx.fill();

      // "+" charge symbols across uniform sphere
      ctx.fillStyle = "rgba(127,29,29,0.55)";
      ctx.font = '700 44px "DejaVu Sans", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (const [dx, dy] of [[-190,-150],[0,-210],[185,-140],[-230,40],[220,55],[-110,210],[120,205],[0,35]]) {
        ctx.fillText("+", cx + dx, cy + dy);
      }
      // Embedded negative electron "plums"
      const ePos = [[-130,-75],[115,-85],[-175,115],[0,130],[170,115],[-25,-145],[-55,15],[95,20]];
      for (const [dx, dy] of ePos) {
        drawSphere3D(ctx, cx + dx, cy + dy, 34, "electron", { glow: "rgba(96,165,250,0.65)", symbol: "−" });
      }
      ctx.restore();
      drawFloorTag(ctx, 980, 1300, "J. J. Thomson (1904) · Total (+) = Total (−)", "#991b1b");

      // Right: Cutaway Watermelon / Plum-Pudding visual analogy + electrical neutrality balance
      floorShadow(ctx, 2140, 1175, 290, 36, 0.15);
      ctx.save();
      const wx = 2140, wy = 830, wr = 260;
      ctx.fillStyle = "#15803d"; ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#dcfce7"; ctx.beginPath(); ctx.arc(wx, wy, wr - 24, 0, Math.PI); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#f43f5e"; ctx.beginPath(); ctx.arc(wx, wy, wr - 44, 0, Math.PI); ctx.closePath(); ctx.fill();
      for (const [sx, sy] of [[-130,65],[-55,120],[25,75],[115,105],[-15,165],[75,155],[-95,150]]) {
        drawSphere3D(ctx, wx + sx, wy + sy, 14, "C");
      }
      ctx.restore();
      drawFloorTag(ctx, 2140, 1300, "Red Flesh = (+) Sphere · Seeds = Electrons (e⁻)", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 380, y: 295, en: "Positive Charge Sphere", hi: "धनावेशित गोला", info_en: "Thomson proposed the atom is a continuous, uniformly positively charged sphere (~10⁻¹⁰ m radius).", info_hi: "थॉमसन के अनुसार परमाणु एकसमान रूप से वितरित धन आवेश का गोला है।" },
      { x: 535, y: 390, en: "Embedded Electrons (e⁻)", hi: "धँसे हुए इलेक्ट्रॉन (e⁻)", info_en: "Negatively charged electrons are studded inside the positive sphere like plums in a pudding.", info_hi: "ऋणावेशित इलेक्ट्रॉन धनावेशित गोले में पुडिंग के सूखे मेवों की तरह धँसे रहते हैं।" },
      { x: 490, y: 650, en: "Electrically Neutral Atom", hi: "विद्युत उदासीन परमाणु", info_en: "Total positive and negative charges are equal in magnitude, making the whole atom neutral.", info_hi: "ऋणात्मक और धनात्मक आवेश परिमाण में समान होने से परमाणु विद्युत रूप से उदासीन होता है।" },
      { x: 1070, y: 465, en: "Watermelon Analogy", hi: "तरबूज सदृश प्रतिरूप", info_en: "Edible red pulp represents distributed positive charge while black seeds represent electrons.", info_hi: "तरबूज का लाल भाग धन आवेश और काले बीज इलेक्ट्रॉनों की स्थिति समझाते हैं।" }
    ])
  },

  // #47 c9_atom §8.8
  {
    id: "atomic_and_mass_number",
    wid: "c9_atom",
    sec: "8.8",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Left: Carbon-12 complete Bohr atom (6p, 6n, 2+4 e-)
      drawAtomShells(ctx, 640, 770, 6, 6, [2, 4], { maxR: 290, nucR: 54 });
      drawFloorTag(ctx, 640, 1300, "Carbon-12 Atom (Z = 6, e⁻ = 6)", "#1d4ed8");

      // Center: Magnified 6 protons + 6 neutrons nucleon breakdown
      floorShadow(ctx, 1520, 1175, 250, 32, 0.14);
      for (let i = 0; i < 6; i++) {
        drawSphere3D(ctx, 1320 + i * 74, 680, 30, "proton", { symbol: "p⁺" });
        drawSphere3D(ctx, 1320 + i * 74, 860, 30, "neutron", { symbol: "n⁰", symbolColor: "#0f172a" });
      }
      drawFloorTag(ctx, 1520, 1300, "A = 6 Protons + 6 Neutrons = 12 Nucleons", "#b91c1c");

      // Right: Crisp Nuclide Notation Card  ¹²₆C
      floorShadow(ctx, 2360, 1175, 250, 32, 0.14);
      ctx.save();
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#334155"; ctx.lineWidth = 5;
      roundRect(ctx, 2110, 520, 500, 520, 36); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#0f172a"; ctx.font = '700 220px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("C", 2410, 865);
      ctx.fillStyle = "#b91c1c"; ctx.font = '700 96px "DejaVu Sans", sans-serif';
      ctx.fillText("12", 2245, 695);
      ctx.fillStyle = "#1d4ed8";
      ctx.fillText("6", 2265, 935);
      ctx.restore();
      drawFloorTag(ctx, 2360, 1300, "ᴬ_Z X  Notation", "#334155");
      return cv;
    },
    marks: makeLabels([
      { x: 320, y: 385, en: "Atomic Number (Z = 6)", hi: "परमाणु क्रमांक (Z = 6)", info_en: "Atomic number Z equals the number of protons in the nucleus and defines the element.", info_hi: "नाभिक में उपस्थित प्रोटॉनों की कुल संख्या परमाणु क्रमांक (Z) कहलाती है।" },
      { x: 760, y: 340, en: "Protons & Neutrons", hi: "प्रोटॉन व न्यूट्रॉन", info_en: "Protons (+1 charge, 1 u) and neutral neutrons (0 charge, 1 u) reside inside the dense nucleus.", info_hi: "प्रोटॉन तथा न्यूट्रॉन नाभिक में स्थित होते हैं और संयुक्त रूप से न्यूक्लिऑन कहलाते हैं।" },
      { x: 1122, y: 335, en: "Mass Number (A = 12)", hi: "द्रव्यमान संख्या (A = 12)", info_en: "Superscript A = Z + N gives total nucleons (6 protons + 6 neutrons = 12 for Carbon-12).", info_hi: "प्रोटॉनों व न्यूट्रॉनों के योग को द्रव्यमान संख्या (A = Z + N) कहते हैं और ऊपर बाईं ओर लिखते हैं।" },
      { x: 1135, y: 465, en: "Subscript Z Notation", hi: "पाद-अंक Z संकेत", info_en: "Standard nuclide symbol writes mass number A at top-left and atomic number Z at bottom-left of X.", info_hi: "तत्व प्रतीक के नीचे बाईं ओर परमाणु क्रमांक Z तथा ऊपर बाईं ओर द्रव्यमान संख्या A लिखी जाती है।" }
    ])
  },

  // #48 c9_atom §8.9
  {
    id: "isotopes_and_isobars",
    wid: "c9_atom",
    sec: "8.9",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Three Hydrogen Isotopes: Protium (1p,0n), Deuterium (1p,1n), Tritium (1p,2n)
      const hIso = [
        { cx: 360, n: 0, tag: "¹₁H  Protium" },
        { cx: 880, n: 1, tag: "²₁H  Deuterium" },
        { cx: 1400, n: 2, tag: "³₁H  Tritium" }
      ];
      for (const it of hIso) {
        drawAtomShells(ctx, it.cx, 780, 1, it.n, [1], { maxR: 185, nucR: 42 });
        drawFloorTag(ctx, it.cx, 1300, it.tag, "#1d4ed8");
      }
      // Divider
      ctx.strokeStyle = "rgba(148,163,184,0.45)"; ctx.lineWidth = 4; ctx.setLineDash([14, 12]);
      ctx.beginPath(); ctx.moveTo(1710, 340); ctx.lineTo(1710, 1240); ctx.stroke(); ctx.setLineDash([]);

      // Right: Isobars 40_18 Ar vs 40_20 Ca (different Z, same A = 40!)
      drawAtomShells(ctx, 2020, 780, 9, 9, [2, 8, 8], { maxR: 205, nucR: 48 });
      drawAtomShells(ctx, 2520, 780, 10, 8, [2, 8, 8, 2], { maxR: 225, nucR: 48 });
      drawFloorTag(ctx, 2020, 1300, "⁴⁰₁₈Ar (A = 40)", "#7e22ce");
      drawFloorTag(ctx, 2520, 1300, "⁴⁰₂₀Ca (A = 40)", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 180, y: 390, en: "Protium (¹₁H)", hi: "प्रोटियम (¹₁H)", info_en: "Most abundant hydrogen isotope with 1 proton and 0 neutrons (Z = 1, A = 1).", info_hi: "हाइड्रोजन का सबसे सामान्य समस्थानिक जिसमें 1 प्रोटॉन और 0 न्यूट्रॉन होते हैं।" },
      { x: 440, y: 390, en: "Deuterium (²₁H)", hi: "ड्यूटीरियम (²₁H)", info_en: "Heavy hydrogen isotope with 1 proton and 1 neutron (Z = 1, A = 2); identical chemical behaviour.", info_hi: "समान परमाणु क्रमांक (Z=1) पर 1 न्यूट्रॉन होने से द्रव्यमान संख्या A=2 होती है।" },
      { x: 700, y: 390, en: "Tritium (³₁H)", hi: "ट्रिटियम (³₁H)", info_en: "Radioactive hydrogen isotope containing 1 proton and 2 neutrons (Z = 1, A = 3).", info_hi: "1 प्रोटॉन और 2 न्यूट्रॉन वाला हाइड्रोजन का तीसरा समस्थानिक (A = 3)।" },
      { x: 1135, y: 390, en: "Isobars (⁴⁰₁₈Ar & ⁴⁰₂₀Ca)", hi: "समभारिक (⁴⁰Ar व ⁴⁰Ca)", info_en: "Atoms of different elements (Z = 18 vs Z = 20) that share the same mass number (A = 40).", info_hi: "भिन्न तत्वों के परमाणु जिनका परमाणु क्रमांक अलग परंतु द्रव्यमान संख्या समान (A = 40) होती है।" }
    ])
  },

  // #49 c9_atom §8.11
  {
    id: "element_symbols_iupac",
    wid: "c9_atom",
    sec: "8.11",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // 1. Dalton's historical circular symbols (H dot, O circle, C black disc)
      floorShadow(ctx, 420, 1170, 250, 32, 0.14);
      const dalton = [[300, 740, "H"], [540, 740, "O"], [420, 950, "C"]];
      for (const [dx, dy, kind] of dalton) {
        ctx.save();
        ctx.fillStyle = kind === "C" ? "#1e293b" : "#ffffff";
        ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.arc(dx, dy, 68, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (kind === "H") { ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.arc(dx, dy, 14, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      drawFloorTag(ctx, 420, 1300, "Dalton Pictorial Symbols", "#475569");

      // 2. Latin-derived IUPAC element tiles + 3D metal nuggets (Fe, Cu, Na, Au)
      const latin = [
        { x: 1020, y: 690, sym: "Fe", sub: "Ferrum", pal: "Fe" },
        { x: 1360, y: 690, sym: "Cu", sub: "Cuprum", pal: "Cu" },
        { x: 1020, y: 990, sym: "Na", sub: "Natrium", pal: "Na" },
        { x: 1360, y: 990, sym: "Au", sub: "Aurum", pal: "Au" }
      ];
      for (const t of latin) {
        ctx.save();
        ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#64748b"; ctx.lineWidth = 4;
        roundRect(ctx, t.x - 135, t.y - 115, 270, 220, 24); ctx.fill(); ctx.stroke();
        drawSphere3D(ctx, t.x - 65, t.y - 15, 42, t.pal);
        ctx.fillStyle = "#0f172a"; ctx.font = '700 66px "DejaVu Sans", sans-serif'; ctx.textAlign = "left";
        ctx.fillText(t.sym, t.x - 5, t.y + 5);
        ctx.fillStyle = "#64748b"; ctx.font = '600 28px "DejaVu Sans", sans-serif';
        ctx.fillText(t.sub, t.x - 105, t.y + 78);
        ctx.restore();
      }
      drawFloorTag(ctx, 1190, 1300, "Latin-Origin IUPAC Symbols", "#b45309");

      // 3. Capitalization Rule: Co (Cobalt metallic lattice) ≠ CO (Carbon Monoxide molecule!)
      floorShadow(ctx, 2240, 1170, 360, 34, 0.14);
      // Co metal cluster
      for (let i = 0; i < 7; i++) {
        const a = (i * Math.PI) / 3;
        drawSphere3D(ctx, 1980 + (i ? 62 * Math.cos(a) : 0), 820 + (i ? 62 * Math.sin(a) : 0), 34, "Ni");
      }
      drawFloorTag(ctx, 1980, 1110, "Co (Cobalt Element)", "#1d4ed8");
      // CO gas molecule
      renderMolecule3D(ctx, [{ el: "C", pos: [-0.65, 0, 0] }, { el: "O", pos: [0.65, 0, 0] }], [[0, 1, 3]], [2500, 820], 0, 0, 120, true);
      drawFloorTag(ctx, 2500, 1110, "CO (Compound)", "#b91c1c");
      drawFloorTag(ctx, 2240, 1300, "1st Capital + 2nd Lowercase (Co ≠ CO)", "#0f172a");
      return cv;
    },
    marks: makeLabels([
      { x: 210, y: 410, en: "Dalton's Pictorial Discs", hi: "डाल्टन के चित्रात्मक प्रतीक", info_en: "John Dalton first used specific circular emblems to represent one atom of each element.", info_hi: "डाल्टन ने प्रत्येक तत्व के एक परमाणु को दर्शाने हेतु वृत्ताकार चिह्नों का प्रयोग किया था।" },
      { x: 595, y: 350, en: "Latin-Derived Symbols", hi: "लैटिन नाम से बने प्रतीक", info_en: "Fe (Ferrum), Cu (Cuprum), Na (Natrium) and Au (Aurum) take letters from Latin names.", info_hi: "लोहा (Fe), ताँबा (Cu), सोडियम (Na) और सोना (Au) के प्रतीक लैटिन नामों से लिए गए हैं।" },
      { x: 990, y: 410, en: "Cobalt Element (Co)", hi: "कोबाल्ट तत्व (Co)", info_en: "IUPAC rule: first letter uppercase, second letter strictly lowercase (Co = Cobalt).", info_hi: "IUPAC नियम के अनुसार पहला अक्षर बड़ा और दूसरा छोटा लिखा जाता है (Co = कोबाल्ट)।" },
      { x: 1250, y: 410, en: "Carbon Monoxide (CO)", hi: "कार्बन मोनोऑक्साइड (CO)", info_en: "Two capital letters denote two distinct elements bonded in a compound (C + O), not Cobalt.", info_hi: "दोनों बड़े अक्षर लिखने (CO) से कोबाल्ट नहीं बल्कि कार्बन व ऑक्सीजन का यौगिक दर्शाया जाता है।" }
    ])
  },

  // #50 c9_atom §8.12
  {
    id: "symbols_valency_formulae",
    wid: "c9_atom",
    sec: "8.12",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Left: Criss-cross diagram for Al3+ and O2- -> Al2O3
      ctx.save();
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4;
      roundRect(ctx, 200, 440, 980, 680, 36); ctx.fill(); ctx.stroke();
      drawSphere3D(ctx, 460, 600, 68, "Al", { symbol: "Al" });
      drawSphere3D(ctx, 920, 600, 68, "O", { symbol: "O" });
      ctx.fillStyle = "#1d4ed8"; ctx.font = '700 68px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("3+", 460, 765);
      ctx.fillStyle = "#b91c1c";
      ctx.fillText("2−", 920, 765);
      // Criss-cross arrows!
      drawArrow(ctx, 510, 785, 860, 965, "#1d4ed8", 8, 26);
      drawArrow(ctx, 870, 785, 520, 965, "#b91c1c", 8, 26);
      ctx.fillStyle = "#0f172a"; ctx.font = '700 84px "DejaVu Sans", sans-serif';
      ctx.fillText("Al₂O₃", 690, 1055);
      ctx.restore();
      drawFloorTag(ctx, 690, 1300, "2(+3) + 3(−2) = 0 Net Charge", "#1e40af");

      // Right: 3D Combining-capacity model showing 2 Al atoms + 3 O atoms (6 total bonds!) + MgCl2
      const al2o3 = [
        { el: "Al", pos: [-1.05, 0.45, 0], r: 52 }, { el: "Al", pos: [1.05, 0.45, 0], r: 52 },
        { el: "O", pos: [-1.65, -0.75, 0] }, { el: "O", pos: [0, -0.55, 0.4] }, { el: "O", pos: [1.65, -0.75, 0] }
      ];
      floorShadow(ctx, 1960, 1175, 360, 36, 0.14);
      renderMolecule3D(ctx, al2o3, [[0,2,2],[0,3,1],[1,3,1],[1,4,2]], [1960, 690], 0.18, -0.1, 130, true);
      // Below right: MgCl2
      const mgcl2 = [{ el: "Cl", pos: [-1.45, -0.2, 0] }, { el: "Mg", pos: [0, 0.25, 0], r: 48 }, { el: "Cl", pos: [1.45, -0.2, 0] }];
      renderMolecule3D(ctx, mgcl2, [[0,1,1],[1,2,1]], [1960, 1045], 0.12, 0, 120, true);
      drawFloorTag(ctx, 1960, 1300, "Valency Balance: Al₂O₃  &  MgCl₂", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 230, y: 300, en: "Element Symbols (Al, O)", hi: "तत्व प्रतीक (Al, O)", info_en: "Write metal/electropositive symbol on the left and non-metal/electronegative symbol on the right.", info_hi: "धनात्मक धातु प्रतीक बाईं ओर तथा ऋणात्मक अधातु प्रतीक दाईं ओर लिखा जाता है।" },
      { x: 345, y: 435, en: "Crossing Valencies", hi: "संयोजकता का तिर्यक नियम", info_en: "Valency 3 of Al and valency 2 of O cross over to become subscripts of the partner atom.", info_hi: "दोनों तत्वों की संयोजकताओं को अदल-बदल कर पाद-अंक (subscript) के रूप में लिखते हैं।" },
      { x: 345, y: 525, en: "Neutral Formula (Al₂O₃)", hi: "उदासीन सूत्र (Al₂O₃)", info_en: "Two Al³⁺ (+6) balance three O²⁻ (−6), giving the simplest electrically neutral ratio.", info_hi: "दो Al³⁺ (+6) और तीन O²⁻ (−6) मिलकर कुल आवेश शून्य करते हैं।" },
      { x: 980, y: 350, en: "Combining Capacity", hi: "संयोजन क्षमता मॉडल", info_en: "Valency measures the number of bonds or electron transfers an atom makes to attain a stable octet.", info_hi: "किसी परमाणु द्वारा अष्टक पूर्ण करने हेतु बनाए गए बंधों की संख्या उसकी संयोजकता कहलाती है।" }
    ])
  },

  // #51 c9_atomic_foundations §9.2
  {
    id: "law_constant_proportion",
    wid: "c9_atomic_foundations",
    sec: "9.2",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Three pure H2O sources (Rain, River, Lab Synthesis) converging to 9 g H2O -> 1 g H2 : 8 g O2
      for (const [sy, col, lbl] of [[490, "#38bdf8", "Purified rain water"], [740, "#0284c7", "Purified river water"], [990, "#2563eb", "Lab water"]]) {
        drawSphere3D(ctx, 320, sy, 52, "N", { glow: "rgba(56,189,248,0.35)" });
        drawFloorTag(ctx, 320, sy + 84, lbl, col);
        drawArrow(ctx, 410, sy, 760, 740, col, 6, 20);
      }
      // Central 9 g pure Water Beaker + H2O molecule
      drawBeaker(ctx, 810, 560, 420, 520, "rgba(56,189,248,0.48)", 0.72);
      renderMolecule3D(ctx, [{ el: "O", pos: [0, 0.25, 0] }, { el: "H", pos: [-0.85, -0.45, 0] }, { el: "H", pos: [0.85, -0.45, 0] }], [[0,1,1],[0,2,1]], [1020, 860], 0.15, 0, 105, true);
      drawFloorTag(ctx, 1020, 1300, "9 g Pure H₂O", "#0369a1");

      drawArrow(ctx, 1290, 820, 1490, 820, "#0f172a", 9, 28);

      // The two element masses are a proportional example, not equal weights
      // on a balance. Separate cards avoid implying that 1 g balances 8 g.
      floorShadow(ctx, 2140, 1170, 430, 36, 0.16);
      ctx.save();
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4;
      for (const x of [1540, 2320]) {
        roundRect(ctx, x, 665, 430, 380, 24); ctx.fill(); ctx.stroke();
      }
      // Two H spheres are a molecular representation, not gram-sized samples.
      drawSphere3D(ctx, 1710, 850, 32, "H", { symbol: "H" });
      drawSphere3D(ctx, 1780, 850, 32, "H", { symbol: "H" });
      drawFloorTag(ctx, 1745, 960, "H: about 1 g", "#334155");
      drawSphere3D(ctx, 2540, 835, 76, "O", { symbol: "O" });
      drawFloorTag(ctx, 2540, 960, "O: about 8 g", "#b91c1c");
      ctx.restore();
      drawFloorTag(ctx, 2140, 1300, "Approximate mass ratio  H : O  =  1 : 8", "#b91c1c");
      return cv;
    },
    marks: makeLabels([
      { x: 160, y: 370, en: "Independent of Source", hi: "स्रोत से स्वतंत्र", info_en: "Pure water has the same composition regardless of source; rain and river water contain other substances unless purified.", info_hi: "स्रोत कोई भी हो, शुद्ध जल का संघटन समान होता है; वर्षा और नदी के जल में शुद्ध करने से पहले अन्य पदार्थ होते हैं।" },
      { x: 510, y: 430, en: "Pure Compound (H₂O)", hi: "शुद्ध यौगिक (H₂O)", info_en: "Proust's Law applies to every pure chemical compound: fixed elements in fixed proportion by mass.", info_hi: "प्राउस्ट के नियम के अनुसार किसी शुद्ध यौगिक में तत्व सदैव निश्चित द्रव्यमान अनुपात में होते हैं।" },
      { x: 872, y: 425, en: "Hydrogen Mass (1 Part)", hi: "हाइड्रोजन भाग (1 ग्राम)", info_en: "Using rounded atomic masses, two H atoms contribute about 2 u. In approximately 9 g of pure water, hydrogen contributes about 1 g.", info_hi: "पूर्णांकित परमाणु द्रव्यमान से दो H परमाणुओं का द्रव्यमान लगभग 2 u है। लगभग 9 ग्राम शुद्ध जल में हाइड्रोजन लगभग 1 ग्राम होता है।" },
      { x: 1270, y: 418, en: "Oxygen Mass (8 Parts)", hi: "ऑक्सीजन भाग (8 ग्राम)", info_en: "Using rounded atomic masses, one O atom contributes about 16 u: 2 : 16 gives the approximate H : O mass ratio 1 : 8.", info_hi: "पूर्णांकित परमाणु द्रव्यमान से एक O परमाणु लगभग 16 u का है: 2 : 16 से H : O का लगभग 1 : 8 द्रव्यमान अनुपात मिलता है।" }
    ])
  },

  // #52 c9_atomic_foundations §9.7
  {
    id: "writing_chemical_formulae",
    wid: "c9_atomic_foundations",
    sec: "9.7",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Three cards left-to-right showing binary & bracketed polyatomic formula rules!
      const cards = [
        { cx: 500, top: "Na⁺    CO₃²⁻", mid: "2 × (+1)  +  (−2) = 0", res: "Na₂CO₃", col: "#1d4ed8" },
        { cx: 1408, top: "Ca²⁺    (OH)⁻", mid: "Brackets for ≥ 2 polyatomic", res: "Ca(OH)₂", col: "#0f766e" },
        { cx: 2316, top: "NH₄⁺    SO₄²⁻", mid: "2 × (+1)  +  (−2) = 0", res: "(NH₄)₂SO₄", col: "#7e22ce" }
      ];
      for (const c of cards) {
        floorShadow(ctx, c.cx, 1175, 340, 34, 0.14);
        ctx.save();
        ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4.5;
        roundRect(ctx, c.cx - 380, 440, 760, 680, 34); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#334155"; ctx.font = '700 54px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText(c.top, c.cx, 560);
        ctx.fillStyle = "#64748b"; ctx.font = '600 32px "DejaVu Sans", sans-serif';
        ctx.fillText(c.mid, c.cx, 650);
        ctx.fillStyle = c.col; ctx.font = '700 86px "DejaVu Sans", sans-serif';
        ctx.fillText(c.res, c.cx, 1030);
        ctx.restore();
      }
      // 3D Polyatomic Ion visuals inside each card!
      // CO3^2- planar trigonal
      renderMolecule3D(ctx, [{ el: "C", pos: [0,0,0] }, { el: "O", pos: [0,1.1,0] }, { el: "O", pos: [-0.95,-0.55,0] }, { el: "O", pos: [0.95,-0.55,0] }], [[0,1,2],[0,2,1],[0,3,1]], [500, 815], 0.15, 0, 88, true);
      // Ca2+ + two OH- groups
      drawSphere3D(ctx, 1408, 815, 48, "Ca", { symbol: "Ca" });
      renderMolecule3D(ctx, [{ el: "O", pos: [0,0,0] }, { el: "H", pos: [-0.85,0.35,0] }], [[0,1,1]], [1210, 815], 0, 0, 85, true);
      renderMolecule3D(ctx, [{ el: "O", pos: [0,0,0] }, { el: "H", pos: [0.85,0.35,0] }], [[0,1,1]], [1606, 815], 0, 0, 85, true);
      // NH4+ + SO4^2-
      renderMolecule3D(ctx, [{ el: "S", pos: [0,0,0] }, { el: "O", pos: [0,1.1,0] }, { el: "O", pos: [1.05,-0.35,0] }, { el: "O", pos: [-0.65,-0.45,0.8] }, { el: "O", pos: [-0.65,-0.45,-0.8] }], [[0,1,2],[0,2,2],[0,3,1],[0,4,1]], [2316, 815], 0.22, -0.2, 85, true);
      return cv;
    },
    marks: makeLabels([
      { x: 250, y: 410, en: "Sodium Carbonate (Na₂CO₃)", hi: "सोडियम कार्बोनेट (Na₂CO₃)", info_en: "Single carbonate ion CO₃²⁻ needs no brackets when its subscript is 1.", info_hi: "जब बहुपरमाणुक आयन की संख्या 1 हो (जैसे CO₃²⁻), तब कोष्ठक नहीं लगाते।" },
      { x: 704, y: 280, en: "Cation First, Anion Next", hi: "धनायन पहले, ऋणायन बाद में", info_en: "Charges of the positive metal ion and negative ion must balance to zero.", info_hi: "सूत्र में धातु धनायन पहले और अधातु/बहुपरमाणुक ऋणायन बाद में लिखा जाता है।" },
      { x: 704, y: 515, en: "Bracket Rule: Ca(OH)₂", hi: "कोष्ठक नियम: Ca(OH)₂", info_en: "Enclose polyatomic OH⁻ in parentheses before writing subscript 2 so both O and H are doubled.", info_hi: "दो या अधिक बहुपरमाणुक आयन होने पर कोष्ठक लगाकर बाहर पाद-अंक लिखते हैं, जैसे Ca(OH)₂।" },
      { x: 1158, y: 515, en: "Ammonium Sulphate", hi: "अमोनियम सल्फेट (NH₄)₂SO₄", info_en: "Two NH₄⁺ (+1 each) balance one SO₄²⁻ (−2) in (NH₄)₂SO₄.", info_hi: "दो अमोनियम आयन (NH₄⁺) एक सल्फेट आयन (SO₄²⁻) के आवेश को संतुलित करते हैं।" }
    ])
  },

  // #53 c9_atomic_foundations §9.8
  {
    id: "molecular_mass_u",
    wid: "c9_atomic_foundations",
    sec: "9.8",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Left: H2O molecular mass = 2(1 u) + 16 u = 18 u
      floorShadow(ctx, 720, 1170, 360, 36, 0.14);
      renderMolecule3D(ctx, [{ el: "O", pos: [0, 0.35, 0] }, { el: "H", pos: [-1.05, -0.48, 0] }, { el: "H", pos: [1.05, -0.48, 0] }], [[0,1,1],[0,2,1]], [720, 680], 0.12, 0, 145, true);
      // Additive mass bar for H2O
      ctx.fillStyle = "#e2e8f0"; roundRect(ctx, 410, 960, 65, 86, 12); ctx.fill();
      ctx.fillStyle = "#ef4444"; roundRect(ctx, 485, 960, 470, 86, 12); ctx.fill();
      ctx.fillStyle = "#e2e8f0"; roundRect(ctx, 965, 960, 65, 86, 12); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = '700 36px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("16 u (O)", 720, 1015);
      drawFloorTag(ctx, 720, 1300, "H₂O  =  2(1 u) + 16 u  =  18 u", "#b91c1c");

      // Right: HNO3 molecular mass = 1 + 14 + 3(16) = 63 u
      floorShadow(ctx, 2080, 1170, 390, 36, 0.14);
      const hno3 = [
        { el: "N", pos: [0, 0.05, 0] }, { el: "O", pos: [0.1, 1.25, 0] }, { el: "O", pos: [1.15, -0.58, 0] },
        { el: "O", pos: [-1.15, -0.55, 0] }, { el: "H", pos: [-1.92, -0.05, 0] }
      ];
      renderMolecule3D(ctx, hno3, [[0,1,2],[0,2,1],[0,3,1],[3,4,1]], [2080, 690], 0.16, -0.1, 130, true);
      // Additive mass bar for HNO3
      ctx.fillStyle = "#cbd5e1"; roundRect(ctx, 1690, 960, 40, 86, 10); ctx.fill();
      ctx.fillStyle = "#2563eb"; roundRect(ctx, 1740, 960, 170, 86, 12); ctx.fill();
      ctx.fillStyle = "#dc2626"; roundRect(ctx, 1920, 960, 550, 86, 12); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = '700 34px "DejaVu Sans", sans-serif';
      ctx.fillText("14 u", 1825, 1015); ctx.fillText("3 × 16 u = 48 u", 2195, 1015);
      drawFloorTag(ctx, 2080, 1300, "HNO₃  =  1 + 14 + 48  =  63 u", "#1d4ed8");
      return cv;
    },
    marks: makeLabels([
      { x: 360, y: 325, en: "Water Molecule (18 u)", hi: "जल अणु (18 u)", info_en: "Sum of two hydrogen atoms (2 × 1 u) and one oxygen atom (16 u) equals 18 unified mass units.", info_hi: "दो हाइड्रोजन (2 × 1 u) और एक ऑक्सीजन (16 u) का योग = 18 u अणु द्रव्यमान देता है।" },
      { x: 360, y: 505, en: "Unified Atomic Mass (u)", hi: "एकीकृत परमाणु द्रव्यमान (u)", info_en: "1 u equals exactly 1/12th the mass of one Carbon-12 atom.", info_hi: "1 u कार्बन-12 के एक परमाणु के द्रव्यमान के 1/12वें भाग के बराबर होता है।" },
      { x: 1040, y: 345, en: "Nitric Acid (HNO₃)", hi: "नाइट्रिक अम्ल (HNO₃)", info_en: "Contains 1 H atom (1 u), 1 N atom (14 u) and 3 O atoms (3 × 16 = 48 u).", info_hi: "एक HNO₃ अणु में 1 हाइड्रोजन, 1 नाइट्रोजन और 3 ऑक्सीजन परमाणु होते हैं।" },
      { x: 1095, y: 505, en: "Additive Mass (63 u)", hi: "कुल अणु द्रव्यमान (63 u)", info_en: "Summing all constituent atomic masses gives 1 + 14 + 48 = 63 u.", info_hi: "सभी संघटक परमाणुओं के द्रव्यमान जोड़ने पर 1 + 14 + 48 = 63 u प्राप्त होता है।" }
    ])
  },

  // #54 c9_atomic_foundations §9.9
  {
    id: "formula_unit_mass",
    wid: "c9_atomic_foundations",
    sec: "9.9",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Left: 3x3x3 3D Cubic NaCl Ionic Crystal Lattice!
      floorShadow(ctx, 760, 1175, 360, 42, 0.16);
      const latAtoms = [], latBonds = [];
      for (let ix = -1; ix <= 1; ix++) {
        for (let iy = -1; iy <= 1; iy++) {
          for (let iz = -1; iz <= 1; iz++) {
            const isCl = (Math.abs(ix + iy + iz) % 2) === 0;
            latAtoms.push({ el: isCl ? "Cl" : "Na", pos: [ix * 1.05, iy * 1.05, iz * 1.05], r: isCl ? 44 : 32 });
          }
        }
      }
      for (let i = 0; i < latAtoms.length; i++) {
        for (let j = i + 1; j < latAtoms.length; j++) {
          const d = Math.hypot(
            latAtoms[i].pos[0] - latAtoms[j].pos[0],
            latAtoms[i].pos[1] - latAtoms[j].pos[1],
            latAtoms[i].pos[2] - latAtoms[j].pos[2]
          );
          if (Math.abs(d - 1.05) < 0.08) latBonds.push([i, j, 1]);
        }
      }
      renderMolecule3D(ctx, latAtoms, latBonds, [760, 770], 0.36, -0.44, 138, false);
      drawFloorTag(ctx, 760, 1300, "Extended NaCl Ionic Crystal Lattice", "#6b21a8");

      drawArrow(ctx, 1180, 770, 1490, 770, "#0f766e", 10, 30);

      // Right: Highlighted Single Formula Unit NaCl (23 + 35.5 = 58.5 u) & CaCl2 (40 + 71 = 111 u)
      floorShadow(ctx, 2060, 1175, 380, 36, 0.14);
      ctx.save();
      ctx.fillStyle = "#f0fdf4"; ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 5; ctx.setLineDash([14, 10]);
      roundRect(ctx, 1580, 470, 960, 300, 32); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      drawSphere3D(ctx, 1810, 620, 54, "Na", { symbol: "Na⁺" });
      drawSphere3D(ctx, 2040, 620, 74, "Cl", { symbol: "Cl⁻" });
      ctx.fillStyle = "#0f172a"; ctx.font = '700 46px "DejaVu Sans", sans-serif'; ctx.textAlign = "left";
      ctx.fillText("23 + 35.5 = 58.5 u", 2145, 635);
      ctx.restore();

      // CaCl2 below
      drawSphere3D(ctx, 1760, 975, 64, "Cl", { symbol: "Cl⁻" });
      drawSphere3D(ctx, 1960, 975, 56, "Ca", { symbol: "Ca²⁺" });
      drawSphere3D(ctx, 2160, 975, 64, "Cl", { symbol: "Cl⁻" });
      ctx.fillStyle = "#0f172a"; ctx.font = '700 42px "DejaVu Sans", sans-serif'; ctx.textAlign = "left";
      ctx.fillText("40 + 2(35.5) = 111 u", 2255, 990);
      drawFloorTag(ctx, 2060, 1300, "Formula Unit Mass: NaCl (58.5 u) · CaCl₂ (111 u)", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 380, y: 385, en: "3D Ionic Lattice", hi: "त्रिविमीय आयनिक जालक", info_en: "Ionic solids form continuous 3D networks of alternating cations and anions rather than discrete molecules.", info_hi: "आयनिक यौगिक अलग-अलग अणुओं के बजाय धनायनों व ऋणायनों का सतत 3D क्रिस्टल जालक बनाते हैं।" },
      { x: 905, y: 310, en: "Na⁺ : Cl⁻ Formula Unit", hi: "NaCl सूत्र इकाई (1 : 1)", info_en: "The simplest ratio of ions in sodium chloride is one Na⁺ (23 u) to one Cl⁻ (35.5 u).", info_hi: "सोडियम क्लोराइड में आयनों का सरलतम अनुपात 1 Na⁺ : 1 Cl⁻ इसकी सूत्र इकाई है।" },
      { x: 1120, y: 310, en: "NaCl Mass = 58.5 u", hi: "NaCl इकाई द्रव्यमान = 58.5 u", info_en: "Formula unit mass sums atomic masses in the empirical unit: 23 + 35.5 = 58.5 u.", info_hi: "NaCl का सूत्र इकाई द्रव्यमान = 23 + 35.5 = 58.5 u।" },
      { x: 980, y: 488, en: "CaCl₂ Mass = 111 u", hi: "CaCl₂ इकाई द्रव्यमान = 111 u", info_en: "One Ca²⁺ (40 u) plus two Cl⁻ ions (2 × 35.5 u) equals 111 u.", info_hi: "एक कैल्सियम (40 u) और दो क्लोरीन (71 u) का कुल सूत्र इकाई द्रव्यमान = 111 u।" }
    ])
  },

  // #62 c10_periodic §P.1
  {
    id: "dobereiner_triads",
    wid: "c10_periodic",
    sec: "P.1",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Centerpiece: Balance Beam proving Arithmetic Mean for Li (6.9), Na (23.0), K (39.1)
      floorShadow(ctx, 1020, 1170, 520, 38, 0.15);
      ctx.save();
      ctx.fillStyle = "#475569"; roundRect(ctx, 990, 740, 60, 420, 16); ctx.fill();
      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.moveTo(460, 760); ctx.lineTo(1580, 760); ctx.stroke();

      drawSphere3D(ctx, 460, 620, 54, "Li", { symbol: "Li" });
      drawFloorTag(ctx, 460, 880, "Li  =  6.9 u", "#be185d");

      drawSphere3D(ctx, 1020, 595, 76, "Na", { symbol: "Na", glow: "rgba(139,92,246,0.45)" });
      drawFloorTag(ctx, 1020, 455, "(6.9 + 39.1) / 2 = 23.0 u", "#6d28d9");

      drawSphere3D(ctx, 1580, 575, 96, "K", { symbol: "K" });
      drawFloorTag(ctx, 1580, 880, "K  =  39.1 u", "#5b21b6");
      ctx.restore();
      drawFloorTag(ctx, 1020, 1300, "Alkali Metal Triad: Li · Na · K", "#6d28d9");

      // Right: Halogen Triad flasks (Cl2 pale green gas, Br2 red-brown liquid, I2 violet crystals)
      const hal = [
        { x: 1930, col: "rgba(134,239,172,0.55)", sym: "Cl (35.5)", fill: 0.85 },
        { x: 2240, col: "rgba(180,83,9,0.78)", sym: "Br (79.9)", fill: 0.52 },
        { x: 2550, col: "rgba(126,34,206,0.75)", sym: "I (126.9)", fill: 0.28 }
      ];
      for (const h of hal) {
        drawBeaker(ctx, h.x - 115, 650, 230, 470, h.col, h.fill);
        drawFloorTag(ctx, h.x, 1185, h.sym, "#334155");
      }
      drawFloorTag(ctx, 2240, 1300, "Halogen Triad Mean = 81.2 ≈ 79.9 (Br)", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 230, y: 310, en: "Lightest Member (Li = 6.9)", hi: "प्रथम तत्व (Li = 6.9)", info_en: "Döbereiner arranged three chemically similar elements in order of increasing atomic mass.", info_hi: "डोबेराइनर ने समान रासायनिक गुणों वाले तीन तत्वों को बढ़ते परमाणु द्रव्यमान में रखा।" },
      { x: 510, y: 298, en: "Middle Mean (Na = 23.0)", hi: "मध्य तत्व औसत (Na = 23.0)", info_en: "Atomic mass of middle element Na equals the average of Li and K: (6.9 + 39.1)/2 = 23.0.", info_hi: "बीच के तत्व Na का परमाणु द्रव्यमान प्रथम व तृतीय के औसत (23.0) के बराबर होता है।" },
      { x: 790, y: 288, en: "Heaviest Member (K = 39.1)", hi: "तृतीय तत्व (K = 39.1)", info_en: "Lithium, sodium and potassium all react vigorously with water to form alkalis MOH.", info_hi: "लिथियम, सोडियम और पोटैशियम तीनों जल के साथ तीव्र अभिक्रिया कर क्षार बनाते हैं।" },
      { x: 1120, y: 440, en: "Halogen Triad (Cl, Br, I)", hi: "हैलोजन त्रिक (Cl, Br, I)", info_en: "Bromine's mass (79.9) lies close to the mean (81.2) of chlorine (35.5) and iodine (126.9).", info_hi: "क्लोरीन व आयोडीन का औसत (81.2) ब्रोमीन के परमाणु द्रव्यमान (79.9) के अत्यंत निकट है।" }
    ])
  },

  // #63 c10_periodic §P.2
  {
    id: "newlands_octaves",
    wid: "c10_periodic",
    sec: "P.2",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      const notes = ["1 · sa", "2 · re", "3 · ga", "4 · ma", "5 · pa", "6 · dha", "7 · ni"];
      const rows = [
        ["H", "Li", "Be", "B", "C", "N", "O"],
        ["F", "Na", "Mg", "Al", "Si", "P", "S"],
        ["Cl", "K", "Ca", "Cr*", "Ti*", "Mn*", "Fe*"]
      ];
      floorShadow(ctx, 1408, 1185, 1080, 38, 0.14);
      for (let c = 0; c < 7; c++) {
        const x = 250 + c * 335;
        // Musical note header key
        ctx.fillStyle = c === 1 || c === 2 ? "#1e3a8a" : "#334155";
        roundRect(ctx, x, 370, 305, 86, 18); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.font = '700 34px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText(notes[c], x + 152, 424);

        for (let r = 0; r < 3; r++) {
          const y = 485 + r * 210;
          const sym = rows[r][c];
          const isBreak = sym.endsWith("*");
          const isHi = c === 1 || c === 2;
          ctx.fillStyle = isBreak ? "#fef2f2" : isHi ? "#eff6ff" : "#f8fafc";
          ctx.strokeStyle = isBreak ? "#dc2626" : isHi ? "#2563eb" : "#cbd5e1";
          ctx.lineWidth = isHi || isBreak ? 5 : 3.5;
          roundRect(ctx, x, y, 305, 180, 22); ctx.fill(); ctx.stroke();
          ctx.fillStyle = isBreak ? "#b91c1c" : "#0f172a";
          ctx.font = '700 64px "DejaVu Sans", sans-serif';
          ctx.fillText(sym.replace("*", ""), x + 152, y + 112);
        }
      }
      // Harmonic arc connecting Li (col 1, row 0) -> Na (col 1, row 1) -> K (col 1, row 2)
      drawArrow(ctx, 735, 650, 735, 710, "#2563eb", 8, 22);
      drawArrow(ctx, 735, 860, 735, 920, "#2563eb", 8, 22);
      drawFloorTag(ctx, 1408, 1300, "Newlands' Law of Octaves (1866) — Valid up to Calcium (Ca)", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 200, y: 210, en: "Seven Musical Notes", hi: "संगीत के सात सुर (सा–नि)", info_en: "Newlands compared periodicity of elements to musical octaves where the 8th note repeats the 1st.", info_hi: "न्यूलैंड ने तत्वों की आवर्तिता की तुलना संगीत के सप्तक से की जहाँ आठवाँ सुर पहले सुर जैसा होता है।" },
      { x: 368, y: 390, en: "8th Element: Li → Na → K", hi: "आठवाँ तत्व: Li → Na → K", info_en: "Starting from Lithium, the eighth element is Sodium and the next eighth is Potassium with similar properties.", info_hi: "लिथियम से गिनने पर आठवाँ तत्व सोडियम और अगला पोटैशियम समान गुण दिखाते हैं।" },
      { x: 536, y: 500, en: "Calcium Limit (Ca)", hi: "कैल्सियम तक सीमा (Ca)", info_en: "Beryllium, Magnesium and Calcium align cleanly, but the octave pattern breaks down beyond Calcium.", info_hi: "अष्टक का यह नियम केवल हल्के तत्वों (कैल्सियम तक) पर ही सटीक लागू हो सका।" },
      { x: 1040, y: 500, en: "Heavy Metal Breakdown", hi: "भारी धातुओं में अपवाद", info_en: "Heavier transition metals like Fe were placed far from similar Co/Ni or forced into unlike columns.", info_hi: "कैल्सियम के बाद भारी तत्वों (जैसे Cr, Ti, Fe) के गुण आठवें तत्व से मेल नहीं खाते थे।" }
    ])
  },

  // #64 c10_periodic §P.3
  {
    id: "mendeleev_periodic_table",
    wid: "c10_periodic",
    sec: "P.3",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      const groups = ["I (R₂O)", "II (RO)", "III (R₂O₃)", "IV (RO₂)", "V (R₂O₅)", "VI (RO₃)", "VII (R₂O₇)", "VIII (RO₄)"];
      const grid = [
        ["H", "", "", "", "", "", "", ""],
        ["Li", "Be", "B", "C", "N", "O", "F", ""],
        ["Na", "Mg", "Al", "Si", "P", "S", "Cl", ""],
        ["K / Cu", "Ca / Zn", "? Eka-Al", "? Eka-Si", "As", "Se", "Br", "Fe Co Ni"]
      ];
      floorShadow(ctx, 1408, 1185, 1160, 38, 0.14);
      for (let g = 0; g < 8; g++) {
        const x = 148 + g * 318;
        ctx.fillStyle = "#1e293b"; roundRect(ctx, x, 355, 298, 78, 16); ctx.fill();
        ctx.fillStyle = "#f8fafc"; ctx.font = '700 28px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText(groups[g], x + 149, 404);
        for (let r = 0; r < 4; r++) {
          const y = 452 + r * 168;
          const val = grid[r][g];
          const isGap = val.startsWith("?");
          const isInv = val === "Fe Co Ni";
          ctx.fillStyle = isGap ? "#fef3c7" : isInv ? "#ede9fe" : val ? "#f8fafc" : "rgba(241,245,249,0.45)";
          ctx.strokeStyle = isGap ? "#d97706" : isInv ? "#7c3aed" : "#cbd5e1";
          ctx.lineWidth = isGap ? 5.5 : 3;
          if (isGap) ctx.setLineDash([12, 8]);
          roundRect(ctx, x, y, 298, 148, 18); ctx.fill(); ctx.stroke();
          ctx.setLineDash([]);
          if (val) {
            ctx.fillStyle = isGap ? "#b45309" : isInv ? "#5b21b6" : "#0f172a";
            ctx.font = `700 ${val.length > 5 ? 36 : 48}px "DejaVu Sans", sans-serif`;
            ctx.fillText(val, x + 149, y + 88);
          }
        }
      }
      drawFloorTag(ctx, 1408, 1295, "Mendeleev (1869): Eka-Al → Gallium (Ga)  ·  Eka-Si → Germanium (Ge)", "#b45309");
      return cv;
    },
    marks: makeLabels([
      { x: 295, y: 200, en: "Oxide & Hydride Formulae", hi: "ऑक्साइड व हाइड्राइड सूत्र", info_en: "Mendeleev grouped elements by general oxide (R₂O to RO₄) and hydride formulae as key chemical criteria.", info_hi: "मेंडेलीफ़ ने तत्वों के ऑक्साइड व हाइड्राइड सूत्रों को वर्गीकरण का मुख्य आधार बनाया।" },
      { x: 465, y: 515, en: "Eka-Aluminium Gap (Ga)", hi: "एका-एलुमिनियम रिक्त स्थान", info_en: "Boldly left an empty slot below Al and accurately predicted Gallium's atomic mass and density.", info_hi: "मेंडेलीफ़ ने अज्ञात तत्वों के लिए रिक्त स्थान छोड़े; एका-एलुमिनियम बाद में गैलियम (Ga) निकला।" },
      { x: 625, y: 515, en: "Eka-Silicon Gap (Ge)", hi: "एका-सिलिकॉन रिक्त स्थान", info_en: "Predicted Eka-silicon below Si, later discovered as Germanium with matching properties.", info_hi: "सिलिकॉन के नीचे छोड़ा गया रिक्त स्थान बाद में जर्मेनियम (Ge) की खोज से सत्यापित हुआ।" },
      { x: 1260, y: 515, en: "Group VIII & Mass Order", hi: "समूह VIII व द्रव्यमान क्रम", info_en: "Placed chemically similar transition triads together, occasionally inverting strict mass order (Co before Ni).", info_hi: "समान रासायनिक गुणों को प्राथमिकता देते हुए कोबाल्ट को निकेल से पहले रखा गया।" }
    ])
  },

  // #65 c10_periodic §P.4
  {
    id: "modern_periodic_law",
    wid: "c10_periodic",
    sec: "P.4",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // Left: Moseley's √ν vs Atomic Number Z straight-line plot!
      ctx.save();
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 4;
      roundRect(ctx, 160, 410, 740, 700, 28); ctx.fill(); ctx.stroke();
      drawArrow(ctx, 250, 1020, 840, 1020, "#334155", 6, 20);
      drawArrow(ctx, 250, 1020, 250, 470, "#334155", 6, 20);
      ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(290, 965); ctx.lineTo(800, 520); ctx.stroke();
      for (let i = 0; i < 6; i++) {
        drawSphere3D(ctx, 315 + i * 92, 943 - i * 80, 16, "O");
      }
      ctx.fillStyle = "#0f172a"; ctx.font = '700 32px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("Atomic Number (Z)", 550, 1075);
      ctx.save(); ctx.translate(205, 745); ctx.rotate(-Math.PI / 2); ctx.fillText("√ν (X-ray)", 0, 0); ctx.restore();
      ctx.restore();
      drawFloorTag(ctx, 530, 1300, "Moseley (1913): Z = Proton Count", "#1d4ed8");

      // Right: 18-Group × 7-Period Modern Periodic Table 3D Block Architecture (s, d, p, f)
      floorShadow(ctx, 1840, 1175, 760, 36, 0.14);
      const cellW = 88, cellH = 74, ox = 1040, oy = 420;
      const blocks = [
        // s-block cols 0..1
        { c0: 0, c1: 0, r0: 0, r1: 6, fill: "#dbeafe", stroke: "#2563eb", lbl: "s-block (1–2)" },
        { c0: 1, c1: 1, r0: 1, r1: 6, fill: "#dbeafe", stroke: "#2563eb" },
        // d-block cols 2..11, rows 3..6
        { c0: 2, c1: 11, r0: 3, r1: 6, fill: "#fef3c7", stroke: "#d97706", lbl: "d-block (3–12)" },
        // p-block cols 12..17, rows 1..6 + He
        { c0: 12, c1: 17, r0: 1, r1: 6, fill: "#dcfce7", stroke: "#16a34a", lbl: "p-block (13–18)" },
        { c0: 17, c1: 17, r0: 0, r1: 0, fill: "#dcfce7", stroke: "#16a34a" }
      ];
      for (const b of blocks) {
        for (let r = b.r0; r <= b.r1; r++) {
          for (let c = b.c0; c <= b.c1; c++) {
            ctx.fillStyle = b.fill; ctx.strokeStyle = b.stroke; ctx.lineWidth = 2.5;
            roundRect(ctx, ox + c * cellW, oy + r * cellH, cellW - 6, cellH - 6, 8); ctx.fill(); ctx.stroke();
          }
        }
      }
      // f-block 2 rows below
      for (let r = 0; r < 2; r++) {
        for (let c = 2; c <= 15; c++) {
          ctx.fillStyle = "#fae8ff"; ctx.strokeStyle = "#9333ea"; ctx.lineWidth = 2.5;
          roundRect(ctx, ox + c * cellW, oy + 560 + r * 66, cellW - 6, 60, 8); ctx.fill(); ctx.stroke();
        }
      }
      drawFloorTag(ctx, 1840, 1300, "18 Groups (Same Valence e⁻) · 7 Periods (Shells n = 1..7)", "#0f766e");
      return cv;
    },
    marks: makeLabels([
      { x: 275, y: 370, en: "Moseley's X-Ray Law", hi: "मोज़ले का आधुनिक नियम", info_en: "Henry Moseley showed √ν varies linearly with atomic number Z, proving Z is more fundamental than mass.", info_hi: "हेनरी मोज़ले ने सिद्ध किया कि परमाणु द्रव्यमान की तुलना में परमाणु क्रमांक (Z) अधिक मौलिक गुण है।" },
      { x: 565, y: 360, en: "Groups 1–2 (s-Block)", hi: "समूह 1–2 (संयोजी इलेक्ट्रॉन)", info_en: "Groups 1 and 2 have similar outer-shell patterns within each group; the shell number changes down the group.", info_hi: "समूह 1 और 2 में प्रत्येक समूह के तत्वों का बाहरी इलेक्ट्रॉन विन्यास समान प्रकार का होता है; कोश संख्या नीचे जाने पर बदलती है।" },
      { x: 875, y: 410, en: "7 Horizontal Periods", hi: "7 क्षैतिज आवर्त (कोश संख्या)", info_en: "Each new period starts filling a new principal electron shell (K, L, M, N…); Z rises by +1 per step.", info_hi: "प्रत्येक नया आवर्त एक नए इलेक्ट्रॉन कोश के भरने को दर्शाता है तथा Z एक-एक कर बढ़ता है।" },
      { x: 1185, y: 360, en: "Groups 13–18 & f-Block", hi: "समूह 13–18 व f-ब्लॉक", info_en: "18 vertical columns and 7 periods cleanly resolve isotope placement and Co/Ni mass anomalies.", info_hi: "आधुनिक आवर्त सारणी के 18 समूह व 7 आवर्त समस्थानिकों की स्थिति स्वतः स्पष्ट कर देते हैं।" }
    ])
  },

  // #66 c10_periodic §P.5
  {
    id: "periodic_table_trends",
    wid: "c10_periodic",
    sec: "P.5",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // Period 2 left-to-right shrinking 3D spheres: Li (152 pm) -> Be (112) -> B (88) -> C (77) -> N (70) -> O (66) -> F (64)
      const p2 = [
        ["Li", 78, "Li"], ["Be", 64, "Mg"], ["B", 54, "Fe"], ["C", 47, "C"], ["N", 42, "N"], ["O", 38, "O"], ["F", 34, "Cl"]
      ];
      drawArrow(ctx, 480, 395, 2240, 395, "#1d4ed8", 8, 26);
      ctx.fillStyle = "#1d4ed8"; ctx.font = '700 34px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("Across Period →  Z_eff Increases  ·  Atomic Radius Decreases", 1380, 365);

      p2.forEach(([sym, rad, pal], i) => {
        const x = 520 + i * 295;
        drawSphere3D(ctx, x, 535, rad, pal, { symbol: sym });
      });

      // Group 1 top-to-bottom expanding 3D spheres: Li -> Na -> K -> Rb
      const g1 = [["Na", 92, "Na", 760], ["K", 108, "K", 985]];
      for (const [sym, rad, pal, y] of g1) {
        drawSphere3D(ctx, 520, y, rad, pal, { symbol: sym });
      }
      drawArrow(ctx, 330, 520, 330, 1060, "#7e22ce", 8, 26);

      // Right-lower: Metallic vs Non-metallic zig-zag metalloid staircase (B, Si, Ge, As, Sb, Te)
      ctx.save();
      ctx.fillStyle = "#eff6ff"; roundRect(ctx, 980, 730, 720, 390, 24); ctx.fill();
      ctx.fillStyle = "#fef2f2"; roundRect(ctx, 1740, 730, 740, 390, 24); ctx.fill();
      // Zig-zag metalloid step border
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(1560, 735); ctx.lineTo(1660, 735); ctx.lineTo(1660, 830); ctx.lineTo(1760, 830);
      ctx.lineTo(1760, 925); ctx.lineTo(1860, 925); ctx.lineTo(1860, 1020); ctx.lineTo(1960, 1020); ctx.lineTo(1960, 1115);
      ctx.stroke();
      ctx.fillStyle = "#1e40af"; ctx.font = '700 40px "DejaVu Sans", sans-serif';
      ctx.fillText("Metals (Electropositive)", 1310, 955);
      ctx.fillStyle = "#b91c1c";
      ctx.fillText("Non-Metals (Electronegative)", 2140, 895);
      ctx.restore();
      drawFloorTag(ctx, 1408, 1300, "Radius ↓ Across Period, ↑ Down Group  ·  Metallic Character ↑ Left & Down", "#0f172a");
      return cv;
    },
    marks: makeLabels([
      { x: 260, y: 492, en: "Radius ↑ Down a Group", hi: "समूह में त्रिज्या वृद्धि ↑", info_en: "New electron shells are added down a group (Li → Na → K), increasing atomic size despite higher nuclear charge.", info_hi: "समूह में ऊपर से नीचे जाने पर नए इलेक्ट्रॉन कोश जुड़ते हैं, जिससे परमाणु आकार बढ़ता है।" },
      { x: 555, y: 268, en: "Radius ↓ Across Period", hi: "आवर्त में त्रिज्या में कमी", info_en: "Increasing nuclear charge pulls same-shell electrons closer from Li to F, shrinking atomic radius.", info_hi: "आवर्त में बाएँ से दाएँ नाभिकीय आवेश बढ़ने से इलेक्ट्रॉन पास खिंचते हैं और त्रिज्या घटती है।" },
      { x: 655, y: 475, en: "Metallic Character", hi: "धात्विक गुण (बाएँ अधिक)", info_en: "Larger atoms on the left/bottom lose valence electrons easily, showing strong metallic character.", info_hi: "बाएँ और नीचे के बड़े परमाणु आसानी से इलेक्ट्रॉन त्यागकर प्रबल धात्विक गुण दिखाते हैं।" },
      { x: 1070, y: 448, en: "Metalloids & Non-Metals", hi: "उपधातु सीमा व अधातु", info_en: "A zig-zag metalloid line (B, Si, Ge, As) separates metals from electron-gaining non-metals on the right.", info_hi: "टेढ़ी-मेढ़ी उपधातु रेखा (B, Si, Ge) धातुओं को दाईं ओर के अधातुओं से अलग करती है।" }
    ])
  }
];
