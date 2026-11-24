// tools/plates_73/phys_plates.mjs
// 15 high-resolution 3D & studio laboratory Physics & Inquiry plates (2816x1536 -> 1408x768).
import {
  W, H, studioCanvas, floorShadow, drawSphere3D, roundRect,
  drawBeaker, drawArrow, drawFloorTag, drawMeter, makeLabels
} from "./kit.mjs";

function drawAtomShells(ctx, cx, cy, pCount, nCount, shells, opts = {}) {
  const maxR = opts.maxR || 220;
  floorShadow(ctx, cx, cy + maxR + 55, maxR * 0.72, 26, 0.12);
  shells.forEach((cnt, idx) => {
    const r = 82 + idx * ((maxR - 82) / Math.max(1, shells.length - 0.35));
    ctx.strokeStyle = "rgba(59,130,246,0.45)";
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    for (let k = 0; k < cnt; k++) {
      const a = (k / cnt) * Math.PI * 2 - Math.PI / 2 + idx * 0.35;
      drawSphere3D(ctx, cx + r * Math.cos(a), cy + r * Math.sin(a), 14, "electron", { glow: "rgba(96,165,250,0.45)" });
    }
  });
  for (let i = 0; i < pCount + nCount; i++) {
    const a = i * 2.39996, rad = Math.min(36, 8 * Math.sqrt(i));
    drawSphere3D(ctx, cx + rad * Math.cos(a), cy + rad * Math.sin(a), 14, i % 2 === 0 ? "proton" : "neutron");
  }
}

export const PHYS_PLATES = [
  // #19 c10_light §9.2.4 — Mirror formula & magnification (exact ray trace: u=-25, f=-15 -> v=-37.5, m=-1.5)
  {
    id: "mirror_formula_magnification",
    wid: "c10_light",
    sec: "9.2.4",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1210 });
      // Pole P at x = 2220, y = 760. Scale: 1 cm = 44 px!
      // f = -15 cm -> F at 2220 - 660 = 1560; C = -30 cm -> 2220 - 1320 = 900
      // Object at u = -25 cm -> x_obj = 2220 - 1100 = 1120, height h = +180 px (top y = 580)
      // Image at v = -37.5 cm -> x_img = 2220 - 1650 = 570, height h' = -1.5 * 180 = -270 px (tip y = 1030)!
      const Px = 2220, Py = 760, Fx = 1560, Cx = 900, ux = 1120, vx = 570;
      const objTopY = Py - 180, imgTipY = Py + 270;

      // Principal axis + Cartesian sign axes
      ctx.strokeStyle = "#475569"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(220, Py); ctx.lineTo(2580, Py); ctx.stroke();
      ctx.setLineDash([12, 10]); ctx.strokeStyle = "#94a3b8";
      ctx.beginPath(); ctx.moveTo(Px, 320); ctx.lineTo(Px, 1180); ctx.stroke(); ctx.setLineDash([]);

      // Concave spherical mirror glass arc + silvered rear hatchings
      ctx.save();
      ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 16;
      ctx.beginPath();
      for (let dy = -380; dy <= 380; dy += 8) {
        const mx = Px - (dy * dy) / (2 * 1320);
        if (dy === -380) ctx.moveTo(mx, Py + dy); else ctx.lineTo(mx, Py + dy);
      }
      ctx.stroke();
      ctx.strokeStyle = "#64748b"; ctx.lineWidth = 3.5;
      for (let dy = -360; dy <= 360; dy += 30) {
        const mx = Px - (dy * dy) / (2 * 1320);
        ctx.beginPath(); ctx.moveTo(mx + 8, Py + dy); ctx.lineTo(mx + 34, Py + dy - 18); ctx.stroke();
      }
      ctx.restore();

      // Ray 1: Parallel to principal axis -> hits mirror at (Px - 12, objTopY) -> reflects through F (1560, 760) to (vx, imgTipY)!
      const m1x = Px - (180 * 180) / (2 * 1320);
      drawArrow(ctx, ux, objTopY, m1x, objTopY, "#dc2626", 6.5, 22);
      drawArrow(ctx, m1x, objTopY, vx, imgTipY, "#2563eb", 6.5, 22);

      // Ray 2: Incident onto Pole P (Px, Py) -> reflects symmetrically to (vx, imgTipY)!
      drawArrow(ctx, ux, objTopY, Px, Py, "#ea580c", 6.5, 22);
      drawArrow(ctx, Px, Py, vx, imgTipY, "#0284c7", 6.5, 22);

      // Upright Object Arrow (+h) & Real Inverted Magnified Image Arrow (-h')
      drawArrow(ctx, ux, Py, ux, objTopY, "#15803d", 12, 32);
      drawArrow(ctx, vx, Py, vx, imgTipY, "#7e22ce", 12, 32);

      // Points C, F, P markers
      for (const [x, lbl] of [[Cx, "C"], [Fx, "F"], [Px, "P (0,0)"]]) {
        drawSphere3D(ctx, x, Py, 14, "C");
        ctx.fillStyle = "#0f172a"; ctx.font = '700 34px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText(lbl, x, Py - 34);
      }
      drawFloorTag(ctx, 1408, 1300, "1/v + 1/u = 1/f  ·  m = h′/h = −v/u  (u = −25, f = −15 → v = −37.5 cm, m = −1.5)", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 285, y: 515, en: "Real Inverted Image (h′)", hi: "वास्तविक उल्टा प्रतिबिंब", info_en: "Reflected rays converge at v = −37.5 cm with negative magnification m = −1.5 (enlarged & inverted).", info_hi: "परावर्तित किरणें v = −37.5 cm पर वास्तव में मिलती हैं; ऋणात्मक आवर्धन उल्टा प्रतिबिंब दर्शाता है।" },
      { x: 560, y: 310, en: "Object Distance (u < 0)", hi: "बिंब दूरी (u < 0)", info_en: "Placed to the left of Pole P, object distance u is negative and upright height h is positive.", info_hi: "ध्रुव P के बाईं ओर रखे सीधे बिंब की दूरी u ऋणात्मक तथा ऊँचाई h धनात्मक होती है।" },
      { x: 780, y: 380, en: "Principal Focus (f < 0)", hi: "मुख्य फोकस (f < 0)", info_en: "A concave mirror's focus F lies in front of the mirror, so f is negative under the Cartesian convention.", info_hi: "अवतल दर्पण का मुख्य फोकस दर्पण के सामने बाईं ओर होता है, अतः f ऋणात्मक होता है।" },
      { x: 1110, y: 380, en: "Pole Origin P (0, 0)", hi: "ध्रुव मूलबिंदु P (0, 0)", info_en: "All horizontal distances u, v and f are measured from the mirror's pole P along the principal axis.", info_hi: "नई कार्तीय चिह्न परिपाटी में सभी दूरियाँ दर्पण के ध्रुव P से मुख्य अक्ष के अनुदिश मापी जाती हैं।" }
    ])
  },

  // #20 c10_eye §10.8 — Twinkling, planets & atmospheric refraction
  {
    id: "atmospheric_refraction_twinkling",
    wid: "c10_eye",
    sec: "10.8",
    render() {
      const { cv, ctx } = studioCanvas({ bench: false });
      // Deep space upper-right & upper-left + stratified atmospheric shells over curved green Earth
      const sky = ctx.createLinearGradient(0, 220, 0, H);
      sky.addColorStop(0, "#ffffff");
      sky.addColorStop(0.14, "#0f172a");
      sky.addColorStop(0.55, "#1e3a8a");
      sky.addColorStop(0.82, "#60a5fa");
      sky.addColorStop(1, "#bae6fd");
      ctx.fillStyle = sky;
      roundRect(ctx, 80, 230, W - 160, H - 290, 42);
      ctx.fill();

      // Stratified atmospheric refractive-index shells
      for (let i = 1; i <= 4; i++) {
        ctx.strokeStyle = `rgba(255,255,255,${0.12 + i * 0.06})`;
        ctx.lineWidth = 3; ctx.setLineDash([16, 12]);
        ctx.beginPath();
        ctx.arc(1408, 2550, 1480 + i * 145, Math.PI * 1.18, Math.PI * 1.82);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Curved Earth surface at bottom
      const earthG = ctx.createLinearGradient(0, 1120, 0, 1470);
      earthG.addColorStop(0, "#16a34a"); earthG.addColorStop(1, "#14532d");
      ctx.save();
      ctx.beginPath(); roundRect(ctx, 80, 230, W - 160, H - 290, 42); ctx.clip();
      ctx.fillStyle = earthG;
      ctx.beginPath(); ctx.arc(1408, 2550, 1430, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Observer figure on left-center ground (1180, 1125)
      drawSphere3D(ctx, 1180, 1085, 28, "Au");

      // LEFT: True Star at (420, 560) -> curved refracting ray bending downward into observer (1180, 1085)
      // Apparent Star along straight tangent backward at (560, 345)!
      drawSphere3D(ctx, 420, 560, 24, "H", { glow: "rgba(255,255,255,0.85)" });
      ctx.strokeStyle = "#fde047"; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(420, 560); ctx.bezierCurveTo(700, 650, 960, 820, 1180, 1085); ctx.stroke();
      // Dashed straight line of sight to Apparent Higher Star!
      ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 6; ctx.setLineDash([16, 12]);
      ctx.beginPath(); ctx.moveTo(1180, 1085); ctx.lineTo(560, 345); ctx.stroke(); ctx.setLineDash([]);
      drawSphere3D(ctx, 560, 345, 30, "Au", { glow: "rgba(253,224,71,0.95)" });

      // RIGHT: Extended-disc Planet at (2320, 460) sending a wide bundle of multiple parallel rays to observer (2020, 1110)
      drawSphere3D(ctx, 2020, 1110, 28, "Au");
      drawSphere3D(ctx, 2320, 460, 74, "Fe", { glow: "rgba(251,146,60,0.65)" });
      for (const off of [-42, -14, 14, 42]) {
        ctx.strokeStyle = "rgba(253,186,116,0.82)"; ctx.lineWidth = 4.5;
        ctx.beginPath(); ctx.moveTo(2320 + off, 460 + off * 0.3); ctx.quadraticCurveTo(2190 + off * 0.6, 780, 2020, 1110); ctx.stroke();
      }
      drawFloorTag(ctx, 1408, 1395, "Atmospheric Refraction (n ↑ Near Ground): Point Star Twinkles · Extended Planet Steady", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 210, y: 280, en: "True Star Position", hi: "तारे की वास्तविक स्थिति", info_en: "Distant star acts as a point source whose light enters progressively denser air layers.", info_hi: "अत्यधिक दूर स्थित तारा बिंदु-स्रोत जैसा कार्य करता है जिसका प्रकाश वायुमंडल में प्रवेश करता है।" },
      { x: 280, y: 175, en: "Apparent Higher Star", hi: "तारे की आभासी ऊँची स्थिति", info_en: "Bending toward the normal makes the eye trace the ray straight back to a slightly higher apparent position.", info_hi: "अभिलंब की ओर मुड़ने से आँख को तारा वास्तविक स्थिति से थोड़ा ऊपर दिखाई देता है।" },
      { x: 460, y: 415, en: "Refracting Air Layers", hi: "वायुमंडलीय अपवर्तन परतें", info_en: "Shifting air density continually alters starlight intensity, producing twinkling.", info_hi: "वायु के बदलते अपवर्तनांक से आँख में पहुँचने वाले प्रकाश की मात्रा बदलती है और तारा टिमटिमाता है।" },
      { x: 1160, y: 230, en: "Steady Planet Disc", hi: "स्थिर चमकते ग्रह", info_en: "Closer planets behave as extended collections of many point sources whose variations average to zero.", info_hi: "ग्रह पास होने से विस्तृत स्रोत जैसे होते हैं; अनेक बिंदुओं के परिवर्तन का औसत शून्य रहता है।" }
    ])
  },

  // #21 c10_electricity §11.8 — Electric power and energy (P = VI, kWh)
  {
    id: "electric_power_kwh_energy",
    wid: "c10_electricity",
    sec: "11.8",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // Circuit wires linking Power Source -> Ammeter (A) -> Parallel Voltmeter (V) + Glowing Bulb -> Domestic kWh Meter
      ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(380, 820); ctx.lineTo(2320, 820); ctx.stroke();
      ctx.strokeStyle = "#1e293b";
      ctx.beginPath(); ctx.moveTo(380, 1060); ctx.lineTo(2320, 1060); ctx.stroke();

      // Supply unit on far left
      floorShadow(ctx, 360, 1140, 190, 28, 0.16);
      ctx.fillStyle = "#1e293b"; roundRect(ctx, 200, 740, 320, 380, 26); ctx.fill();
      ctx.fillStyle = "#38bdf8"; ctx.font = '700 44px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("220 V", 360, 910);

      // Series Ammeter (A)
      drawMeter(ctx, 820, 820, 250, 230, "A", 0.62, "#2563eb");

      // Glowing Lamp Load + Parallel Voltmeter (V)
      drawSphere3D(ctx, 1380, 790, 92, "Au", { glow: "rgba(250,204,21,0.85)", symbol: "100 W" });
      drawMeter(ctx, 1380, 1085, 250, 210, "V", 0.78, "#dc2626");

      // Right: Domestic Commercial Energy Meter (kWh = 3.6 × 10^6 J)
      floorShadow(ctx, 2220, 1165, 310, 34, 0.16);
      ctx.save();
      ctx.fillStyle = "#e2e8f0"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 6;
      roundRect(ctx, 1920, 520, 600, 620, 36); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#0f172a"; roundRect(ctx, 1990, 600, 460, 160, 18); ctx.fill();
      ctx.fillStyle = "#4ade80"; ctx.font = '700 58px "DejaVu Sans", sans-serif';
      ctx.fillText("0 1 4 2 . 5  kWh", 2220, 700);
      ctx.fillStyle = "#334155"; ctx.font = '700 34px "DejaVu Sans", sans-serif';
      ctx.fillText("1 Unit = 1 kWh = 3.6 × 10⁶ J", 2220, 940);
      ctx.restore();
      drawFloorTag(ctx, 1408, 1310, "P = V·I = I²R = V²/R  (Watt)   ·   E = P × t  (kWh)", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 180, y: 455, en: "220 V Supply", hi: "220 V विद्युत स्रोत", info_en: "Maintains potential difference V driving electric charge through the appliance.", info_hi: "परिपथ में आवेश प्रवाहित करने हेतु विभवांतर (V) प्रदान करता है।" },
      { x: 410, y: 410, en: "Current (I in Amperes)", hi: "विद्युत धारा (I)", info_en: "Series ammeter measures current I; electric power equals P = V × I.", info_hi: "श्रेणीक्रम अमीटर धारा I मापता है; विद्युत शक्ति P = V × I होती है।" },
      { x: 690, y: 395, en: "Rated Power (Watt)", hi: "उपकरण की शक्ति (वाट)", info_en: "1 Watt = 1 Volt × 1 Ampere (1 J/s rate of electrical energy consumption).", info_hi: "1 वाट = 1 वोल्ट × 1 ऐम्पियर (ऊर्जा उपभोग की दर = 1 जूल/सेकंड)।" },
      { x: 1110, y: 350, en: "Commercial Unit (kWh)", hi: "व्यावसायिक मात्रक (kWh)", info_en: "1 kWh ('1 unit') = 1000 W × 3600 s = 3.6 × 10⁶ Joules of electrical energy.", info_hi: "1 किलोवाट-घंटा (1 यूनिट) = 3.6 × 10⁶ जूल विद्युत ऊर्जा।" }
    ])
  },

  // #22 c10_magnetism §12.2 — Field due to straight current-carrying conductor
  {
    id: "straight_conductor_field",
    wid: "c10_magnetism",
    sec: "12.2",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1200 });
      // Perspective white acrylic sheet pierced at center (1260, 810) by vertical copper rod!
      floorShadow(ctx, 1260, 1150, 740, 48, 0.15);
      ctx.save();
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#64748b"; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(620, 620); ctx.lineTo(1940, 620); ctx.lineTo(2120, 1020); ctx.lineTo(440, 1020); ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Lower wire below board
      ctx.fillStyle = "#b45309"; roundRect(ctx, 1242, 1020, 36, 210, 8); ctx.fill();

      // Concentric elliptical magnetic field lines (closer near wire: B ∝ I/r!) + iron-filing speckles
      const radii = [110, 195, 305, 445, 610];
      radii.forEach((rx, idx) => {
        const ry = rx * 0.31;
        ctx.strokeStyle = `rgba(37,99,235,${0.88 - idx * 0.14})`;
        ctx.lineWidth = 6 - idx * 0.6;
        ctx.beginPath(); ctx.ellipse(1260, 815, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
        // CCW directional arrow on front & back of ellipse
        drawArrow(ctx, 1260 + 20, 815 + ry, 1260 - 30, 815 + ry, "#1d4ed8", 5, 18);
      });

      // Plotting compasses at right & front tangent to concentric circles
      for (const [cx, cy, ang] of [[1705, 815, -Math.PI / 2], [815, 815, Math.PI / 2]]) {
        ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#334155"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, cy, 48, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        drawArrow(ctx, cx - 32 * Math.cos(ang), cy - 32 * Math.sin(ang), cx + 32 * Math.cos(ang), cy + 32 * Math.sin(ang), "#dc2626", 6, 18);
      }

      // Upper copper conductor rod piercing board upward + Current I arrow
      const cg = ctx.createLinearGradient(1240, 0, 1280, 0);
      cg.addColorStop(0, "#92400e"); cg.addColorStop(0.45, "#fbbf24"); cg.addColorStop(1, "#78350f");
      ctx.fillStyle = cg; roundRect(ctx, 1242, 310, 36, 510, 10); ctx.fill();
      drawArrow(ctx, 1320, 600, 1320, 360, "#dc2626", 9, 28);

      // Iron-filing speckles clustered denser near wire
      ctx.fillStyle = "rgba(30,41,59,0.55)";
      for (let k = 0; k < 140; k++) {
        const a = k * 2.39996, r = 95 + (k / 140) * 510;
        ctx.beginPath(); ctx.arc(1260 + r * Math.cos(a), 815 + r * 0.31 * Math.sin(a), 3.2, 0, Math.PI * 2); ctx.fill();
      }

      // Closed external circuit wires connecting top & bottom of rod through Rheostat + DC Cell!
      ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(1260, 315); ctx.lineTo(2420, 315); ctx.lineTo(2420, 680); ctx.stroke();
      ctx.strokeStyle = "#1e293b";
      ctx.beginPath(); ctx.moveTo(1260, 1225); ctx.lineTo(2420, 1225); ctx.lineTo(2420, 840); ctx.stroke();

      // Right: Variable Rheostat + Battery controlling I
      ctx.fillStyle = "#334155"; roundRect(ctx, 2240, 680, 360, 160, 22); ctx.fill();
      ctx.fillStyle = "#facc15"; ctx.font = '700 36px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("Rheostat (I)", 2420, 772);
      ctx.fillStyle = "#dc2626"; roundRect(ctx, 2320, 960, 200, 120, 18); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = '700 32px "DejaVu Sans", sans-serif';
      ctx.fillText("+ DC −", 2420, 1032);
      ctx.restore();
      drawFloorTag(ctx, 1408, 1310, "Concentric Magnetic Field Circles:  B ∝ I   and   B ∝ 1 / r", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 630, y: 230, en: "Straight Current (I)", hi: "सीधा धारावाही चालक (I)", info_en: "Electric current flowing vertically through the straight copper wire generates a surrounding magnetic field.", info_hi: "सीधे ताँबे के तार में प्रवाहित धारा (I) अपने चारों ओर चुम्बकीय क्षेत्र उत्पन्न करती है।" },
      { x: 630, y: 408, en: "Concentric Field Circles", hi: "संकेंद्री चुम्बकीय वृत्त", info_en: "Iron filings align in concentric circles centred on the wire; closer spacing near the wire shows stronger B.", info_hi: "लौह-चूर्ण तार के चारों ओर संकेंद्री वृत्त बनाता है; तार के पास क्षेत्र अधिक प्रबल (B ∝ 1/r) होता है।" },
      { x: 852, y: 408, en: "Tangent Compass Needle", hi: "स्पर्शरेखीय दिक्सूचक सुई", info_en: "A magnetic compass needle placed at any point aligns tangentially to give the local field direction.", info_hi: "वृत्त के किसी बिंदु पर रखी दिक्सूचक सुई की उत्तर दिशा चुम्बकीय क्षेत्र की दिशा बताती है।" },
      { x: 1210, y: 385, en: "Variable Rheostat", hi: "धारा नियंत्रक (रियोस्टैट)", info_en: "Increasing current I increases compass deflection; reversing current reverses needle direction.", info_hi: "धारा I बढ़ाने पर चुम्बकीय क्षेत्र बढ़ता है और धारा उलटने पर क्षेत्र की दिशा भी उलट जाती है।" }
    ])
  },

  // #23 c10_magnetism §12.3 — Right-hand thumb rule
  {
    id: "right_hand_thumb_rule",
    wid: "c10_magnetism",
    sec: "12.3",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1200 });
      const cx = 1408;
      // Glowing concentric 3D magnetic field B rings (back halves first!)
      for (const rx of [260, 420, 580]) {
        ctx.strokeStyle = "rgba(37,99,235,0.45)"; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.ellipse(cx, 810, rx, rx * 0.28, 0, Math.PI, Math.PI * 2); ctx.stroke();
      }

      // Vertical copper conductor rod through center
      const cg = ctx.createLinearGradient(cx - 38, 0, cx + 38, 0);
      cg.addColorStop(0, "#78350f"); cg.addColorStop(0.42, "#fbbf24"); cg.addColorStop(1, "#7c2d12");
      ctx.fillStyle = cg; roundRect(ctx, cx - 36, 260, 72, 920, 18); ctx.fill();
      drawArrow(ctx, cx, 520, cx, 290, "#dc2626", 12, 34);

      // Sculpted 3D Right Hand gripping the vertical rod: thumb pointing UP, 4 curled fingers wrapping front CCW!
      ctx.save();
      // Palm & wrist on left-back
      const skin = ctx.createLinearGradient(cx - 260, 640, cx + 180, 960);
      skin.addColorStop(0, "#fdba74"); skin.addColorStop(0.55, "#fDBA74"); skin.addColorStop(1, "#c2410c");
      ctx.fillStyle = skin; ctx.strokeStyle = "#9a3412"; ctx.lineWidth = 4.5;
      // Extended upward THUMB along right/left of wire pointing straight UP!
      roundRect(ctx, cx - 145, 505, 86, 225, 42); ctx.fill(); ctx.stroke();
      // Palm base
      roundRect(ctx, cx - 210, 685, 190, 275, 58); ctx.fill(); ctx.stroke();
      // Four curled fingers wrapping across FRONT of copper rod from left to right (CCW viewed from above!)
      for (let f = 0; f < 4; f++) {
        const fy = 700 + f * 64;
        const fg = ctx.createLinearGradient(cx - 120, fy, cx + 145, fy + 54);
        fg.addColorStop(0, "#fed7aa"); fg.addColorStop(0.6, "#fb923c"); fg.addColorStop(1, "#c2410c");
        ctx.fillStyle = fg;
        roundRect(ctx, cx - 115, fy, 245, 54, 27); ctx.fill(); ctx.stroke();
      }
      ctx.restore();

      // Front halves of concentric 3D magnetic field B rings with bold CCW arrows!
      for (const rx of [260, 420, 580]) {
        const ry = rx * 0.28;
        ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 11;
        ctx.beginPath(); ctx.ellipse(cx, 810, rx, ry, 0, 0, Math.PI); ctx.stroke();
        drawArrow(ctx, cx - 35, 810 + ry, cx + 45, 810 + ry, "#1d4ed8", 9, 28);
      }
      drawFloorTag(ctx, cx, 1305, "Maxwell's Right-Hand Thumb Rule: Thumb = Current (I)  ·  Curled Fingers = Magnetic Field (B)", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 650, y: 300, en: "Upward Thumb = Current (I)", hi: "अँगूठा = विद्युत धारा (I)", info_en: "Point the thumb of your right hand in the direction of conventional electric current I.", info_hi: "दाहिने हाथ का सीधा अँगूठा चालक में प्रवाहित विद्युत धारा (I) की दिशा दर्शाता है।" },
      { x: 704, y: 175, en: "Current-Carrying Wire", hi: "धारावाही सीधा चालक", info_en: "Reversing current direction flips the thumb downward and reverses the circular magnetic field.", info_hi: "धारा की दिशा उलटने पर अँगूठा नीचे हो जाता है और चुम्बकीय क्षेत्र की दिशा भी उलट जाती है।" },
      { x: 715, y: 405, en: "Curled Fingers (Right Hand)", hi: "मुड़ी उँगलियाँ (दाहिना हाथ)", info_en: "Fingers wrapped around the conductor trace the sense of the circular magnetic field lines.", info_hi: "चालक के चारों ओर लिपटी उँगलियाँ चुम्बकीय क्षेत्र रेखाओं के घुमाव की दिशा बताती हैं।" },
      { x: 960, y: 465, en: "Circular Field Lines (B)", hi: "वृत्ताकार चुम्बकीय क्षेत्र", info_en: "Viewed from above an upward current, magnetic field B circulates anticlockwise.", info_hi: "ऊपर की ओर जाती धारा के चारों ओर चुम्बकीय क्षेत्र रेखाएँ वामावर्त वृत्त बनाती हैं।" }
    ])
  },

  // #24 c10_magnetism §12.7 — Direct and alternating current
  {
    id: "direct_vs_alternating_current",
    wid: "c10_magnetism",
    sec: "12.7",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1190 });
      // LEFT: DC Battery Cell + Unidirectional Flat Oscilloscope Graph
      floorShadow(ctx, 680, 1170, 480, 36, 0.14);
      // Battery cylinder
      ctx.fillStyle = "#1e293b"; roundRect(ctx, 220, 650, 180, 360, 28); ctx.fill();
      ctx.fillStyle = "#f59e0b"; roundRect(ctx, 220, 650, 180, 95, 24); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = '700 42px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("+ DC −", 310, 860);
      // DC Oscilloscope screen
      ctx.fillStyle = "#0f172a"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 6;
      roundRect(ctx, 470, 520, 740, 540, 30); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "rgba(148,163,184,0.35)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(520, 860); ctx.lineTo(1160, 860); ctx.moveTo(540, 570); ctx.lineTo(540, 1010); ctx.stroke();
      // Steady constant +I green line!
      ctx.strokeStyle = "#4ade80"; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(540, 685); ctx.lineTo(1150, 685); ctx.stroke();
      drawFloorTag(ctx, 720, 1300, "Direct Current (DC): Unidirectional · 0 Hz", "#15803d");

      // RIGHT: AC Generator Symbol + 50 Hz Sinusoidal Oscilloscope Graph (+ and - half cycles)
      floorShadow(ctx, 2060, 1170, 500, 36, 0.14);
      drawSphere3D(ctx, 1590, 790, 95, "N", { symbol: "~ AC" });
      ctx.fillStyle = "#0f172a"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 6;
      roundRect(ctx, 1750, 520, 840, 540, 30); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "rgba(148,163,184,0.35)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(1800, 790); ctx.lineTo(2540, 790); ctx.moveTo(1820, 570); ctx.lineTo(1820, 1010); ctx.stroke();
      // Smooth 2-cycle sine wave!
      ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 9;
      ctx.beginPath();
      for (let x = 0; x <= 700; x += 4) {
        const y = 790 - 155 * Math.sin((x / 350) * Math.PI * 2);
        if (x === 0) ctx.moveTo(1820 + x, y); else ctx.lineTo(1820 + x, y);
      }
      ctx.stroke();
      drawFloorTag(ctx, 2120, 1300, "Alternating Current (AC): 50 Hz in India (Reverses 100× / s)", "#0284c7");
      return cv;
    },
    marks: makeLabels([
      { x: 155, y: 425, en: "DC Cell / Battery", hi: "दिष्ट धारा स्रोत (बैटरी)", info_en: "Cells and solar panels supply direct current that always flows in one fixed direction.", info_hi: "सेल और बैटरी सदैव एक ही निश्चित दिशा में बहने वाली दिष्ट धारा (DC) देते हैं।" },
      { x: 420, y: 345, en: "Steady DC Waveform", hi: "स्थिर DC आलेख", info_en: "Current magnitude and polarity stay constant over time with zero frequency.", info_hi: "दिष्ट धारा का मान और दिशा समय के साथ स्थिर रहते हैं।" },
      { x: 795, y: 395, en: "AC Alternator (~)", hi: "प्रत्यावर्ती जनित्र (~)", info_en: "Power-station generators produce AC that can be stepped up by transformers for low-loss transmission.", info_hi: "प्रत्यावर्ती धारा (AC) को कम ऊर्जा हानि के साथ लंबी दूरी तक भेजा जा सकता है।" },
      { x: 1085, y: 395, en: "50 Hz Periodic Reversal", hi: "50 Hz आवर्ती परिवर्तन", info_en: "In India, AC completes 50 cycles per second (T = 1/50 s), reversing direction every 1/100 s.", info_hi: "भारत में घरेलू AC की आवृत्ति 50 Hz है, अर्थात् धारा हर 1/100 सेकंड में दिशा बदलती है।" }
    ])
  },

  // #33 c9_exploration §1.1 — Science begins with observation
  {
    id: "science_observation_patterns",
    wid: "c9_exploration",
    sec: "1.1",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Sunlit window beam + Potted seedling bending phototropically + Magnifying lens + Ruler + Data chart
      drawSphere3D(ctx, 310, 380, 78, "Au", { glow: "rgba(250,204,21,0.75)" });
      // Terracotta pot + curved green stem & leaves bending toward sun
      floorShadow(ctx, 760, 1165, 220, 32, 0.16);
      ctx.fillStyle = "#c2410c";
      ctx.beginPath(); ctx.moveTo(610, 880); ctx.lineTo(910, 880); ctx.lineTo(865, 1155); ctx.lineTo(655, 1155); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 18; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(760, 880); ctx.quadraticCurveTo(735, 650, 565, 515); ctx.stroke();
      drawSphere3D(ctx, 555, 505, 36, "peaGreen"); drawSphere3D(ctx, 685, 670, 32, "peaGreen");

      // Calibrated vertical millimetre scale beside plant
      ctx.fillStyle = "#fef3c7"; ctx.strokeStyle = "#b45309"; ctx.lineWidth = 4;
      roundRect(ctx, 1020, 480, 86, 675, 12); ctx.fill(); ctx.stroke();
      for (let y = 520; y <= 1120; y += 40) {
        ctx.beginPath(); ctx.moveTo(1020, y); ctx.lineTo(1062, y); ctx.stroke();
      }

      // Magnifying glass inspecting leaf venation
      ctx.strokeStyle = "#334155"; ctx.lineWidth = 14;
      ctx.fillStyle = "rgba(186,230,253,0.32)";
      ctx.beginPath(); ctx.arc(1460, 680, 155, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1570, 790); ctx.lineTo(1730, 965); ctx.stroke();

      // Right: Recorded field notebook plotting Day vs Shoot Height trend
      floorShadow(ctx, 2240, 1165, 340, 32, 0.15);
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 5;
      roundRect(ctx, 1890, 470, 700, 680, 28); ctx.fill(); ctx.stroke();
      drawArrow(ctx, 1980, 1050, 2510, 1050, "#334155", 6, 20);
      drawArrow(ctx, 1980, 1050, 1980, 540, "#334155", 6, 20);
      ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(2010, 995); ctx.lineTo(2140, 910); ctx.lineTo(2280, 790); ctx.lineTo(2450, 610); ctx.stroke();
      for (const [px, py] of [[2010,995],[2140,910],[2280,790],[2450,610]]) drawSphere3D(ctx, px, py, 16, "peaGreen");
      drawFloorTag(ctx, 1408, 1300, "Careful Sensing + Quantitative Measurement + Systematic Recording", "#0f766e");
      return cv;
    },
    marks: makeLabels([
      { x: 290, y: 265, en: "Natural Phenomenon", hi: "प्राकृतिक घटना व पैटर्न", info_en: "Inquiry begins by noticing repeatable patterns, such as shoots curving toward directional light.", info_hi: "विज्ञान की शुरुआत प्रकृति के दोहराए जाने वाले पैटर्न को ध्यान से देखने से होती है।" },
      { x: 530, y: 400, en: "Quantitative Scale", hi: "मात्रात्मक मापन पैमाना", info_en: "Rulers, clocks and balances turn qualitative impressions into objective numerical measurements.", info_hi: "पैमाने व यंत्र अनुमान के स्थान पर सटीक संख्यात्मक माप देते हैं।" },
      { x: 730, y: 340, en: "Close Inspection", hi: "सूक्ष्म प्रेक्षण", info_en: "Optical instruments extend human senses to reveal fine structural details.", info_hi: "आवर्धक लेंस व यंत्र मानव इंद्रियों की क्षमता बढ़ाकर सूक्ष्म विवरण दिखाते हैं।" },
      { x: 1120, y: 405, en: "Systematic Data Log", hi: "व्यवस्थित प्रेक्षण अभिलेख", info_hi: "दिनांक व माप को सारणी या आलेख में दर्ज करने से वैज्ञानिक व्याख्या का आधार बनता है।", info_en: "Recording observations before jumping to explanations provides verifiable raw scientific data." }
    ])
  },

  // #34 c9_exploration §1.2 — Focused questions guide investigation
  {
    id: "focused_testable_question",
    wid: "c9_exploration",
    sec: "1.2",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Three simple pendulums of systematically increasing string length L1 < L2 < L3 on rigid support bar + digital stopwatch!
      ctx.fillStyle = "#334155"; roundRect(ctx, 280, 380, 1420, 38, 16); ctx.fill();
      ctx.fillStyle = "#475569"; roundRect(ctx, 320, 380, 44, 790, 12); ctx.fill();
      const pends = [
        { x: 640, L: 290, lbl: "L₁ = 25 cm  →  T₁ = 1.0 s" },
        { x: 1060, L: 470, lbl: "L₂ = 50 cm  →  T₂ = 1.4 s" },
        { x: 1480, L: 660, lbl: "L₃ = 100 cm  →  T₃ = 2.0 s" }
      ];
      for (const p of pends) {
        ctx.strokeStyle = "#64748b"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(p.x, 418); ctx.lineTo(p.x + 55, 418 + p.L); ctx.stroke();
        ctx.setLineDash([10, 10]); ctx.strokeStyle = "rgba(37,99,235,0.45)";
        ctx.beginPath(); ctx.arc(p.x, 418, p.L, Math.PI * 0.42, Math.PI * 0.58); ctx.stroke(); ctx.setLineDash([]);
        drawSphere3D(ctx, p.x + 55, 418 + p.L, 42, "Cu");
      }
      // Right: Precision Stopwatch + Testable Variable Equation T ∝ √L
      floorShadow(ctx, 2240, 1165, 320, 34, 0.15);
      drawMeter(ctx, 2240, 770, 440, 420, "T (s)", 0.58, "#0284c7");
      drawFloorTag(ctx, 1408, 1300, "Testable Question: How does Length (L) affect Time Period (T) at constant mass?", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 335, y: 355, en: "Short Length (L₁)", hi: "छोटी लंबाई (L₁)", info_en: "Changing one measurable factor (pendulum length L) turns broad curiosity into a testable question.", info_hi: "केवल एक मापने योग्य चर (लंबाई L) चुनकर प्रश्न को परीक्षणीय बनाया जाता है।" },
      { x: 545, y: 445, en: "Medium Length (L₂)", hi: "मध्यम लंबाई (L₂)", info_en: "Identical brass bobs keep mass constant so only length L varies across trials.", info_hi: "गोलक का द्रव्यमान समान रखकर केवल डोरी की लंबाई बदली जाती है।" },
      { x: 755, y: 540, en: "Long Length (L₃)", hi: "अधिक लंबाई (L₃)", info_en: "Quadrupling length L doubles oscillation period T (T = 2π√(L/g)).", info_hi: "लंबाई चार गुनी करने पर आवर्तकाल दोगुना हो जाता है।" },
      { x: 1120, y: 385, en: "Measured Response (T)", hi: "मापित आवर्तकाल (T)", info_en: "Stopwatch records 20 oscillations to measure time period T with high repeatability.", info_hi: "विराम-घड़ी द्वारा दोलनों का समय मापकर स्पष्ट निष्कर्ष निकाला जाता है।" }
    ])
  },

  // #35 c9_exploration §1.4 — Experiments produce evidence
  {
    id: "controlled_experiment_evidence",
    wid: "c9_exploration",
    sec: "1.4",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Equal overhead LED sunbar (controlled light!) + 3 identical soil pots with 0 mL, 25 mL, 50 mL water -> measured growth!
      ctx.fillStyle = "#fef08a"; ctx.strokeStyle = "#ca8a04"; ctx.lineWidth = 4;
      roundRect(ctx, 340, 320, 2136, 44, 22); ctx.fill(); ctx.stroke();

      const setups = [
        { cx: 560, water: 0.08, shootH: 65, tag: "0 mL Water (Control)" },
        { cx: 1408, water: 0.48, shootH: 235, tag: "25 mL Water" },
        { cx: 2256, water: 0.85, shootH: 410, tag: "50 mL Water" }
      ];
      for (const s of setups) {
        floorShadow(ctx, s.cx, 1170, 240, 32, 0.15);
        // Watering cylinder beside pot
        drawBeaker(ctx, s.cx - 290, 830, 130, 320, "rgba(56,189,248,0.62)", s.water);
        // Identical pot & soil
        ctx.fillStyle = "#b45309";
        ctx.beginPath(); ctx.moveTo(s.cx - 120, 910); ctx.lineTo(s.cx + 120, 910); ctx.lineTo(s.cx + 92, 1155); ctx.lineTo(s.cx - 92, 1155); ctx.closePath(); ctx.fill();
        // Green shoot height (dependent variable!)
        ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 16; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(s.cx, 910); ctx.lineTo(s.cx, 910 - s.shootH); ctx.stroke();
        drawSphere3D(ctx, s.cx - 28, 910 - s.shootH + 20, 28, "peaGreen");
        drawSphere3D(ctx, s.cx + 28, 910 - s.shootH + 20, 28, "peaGreen");
        drawFloorTag(ctx, s.cx, 1300, s.tag, "#0f766e");
      }
      return cv;
    },
    marks: makeLabels([
      { x: 280, y: 495, en: "Baseline Control Group", hi: "नियंत्रक समूह (0 mL)", info_en: "Provides a baseline for comparison when the independent variable is withheld.", info_hi: "तुलना के लिए आधार प्रदान करता है जब स्वतंत्र चर नहीं दिया जाता।" },
      { x: 590, y: 495, en: "Independent Variable", hi: "स्वतंत्र चर (जल मात्रा)", info_en: "Only water volume is deliberately varied across pots (0 mL, 25 mL, 50 mL).", info_hi: "प्रयोग में केवल एक चर (जल की मात्रा) को जानबूझकर बदला जाता है।" },
      { x: 704, y: 175, en: "Controlled Variables", hi: "नियंत्रित चर (समान प्रकाश)", info_en: "Light intensity, pot size, seed type and temperature are kept strictly identical.", info_hi: "प्रकाश, ताप, मिट्टी और बीज के प्रकार सभी गमलों में समान रखे जाते हैं।" },
      { x: 1128, y: 360, en: "Dependent Variable", hi: "आश्रित चर (पौधे की ऊँचाई)", info_en: "Resulting seedling height is measured objectively as empirical evidence.", info_hi: "परिणामस्वरूप बढ़ी पौधे की ऊँचाई को प्रमाण के रूप में मापा जाता है।" }
    ])
  },

  // #36 c9_exploration §1.5 — Models connect the unseen to the seen
  {
    id: "scientific_models_unseen",
    wid: "c9_exploration",
    sec: "1.5",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // 1. Atomic orbital model (unseen subatomic world)
      drawAtomShells(ctx, 500, 770, 6, 6, [2, 4], { maxR: 250, nucR: 46 });
      drawFloorTag(ctx, 500, 1300, "Atomic Model (10⁻¹⁰ m)", "#1d4ed8");

      // 2. 3D Cutaway Eukaryotic Cell Model (microscopic world)
      floorShadow(ctx, 1408, 1170, 290, 36, 0.15);
      ctx.save();
      const cg = ctx.createRadialGradient(1360, 720, 40, 1408, 780, 270);
      cg.addColorStop(0, "#dcfce7"); cg.addColorStop(0.7, "#4ade80"); cg.addColorStop(1, "#15803d");
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(1408, 780, 260, 0, Math.PI * 2); ctx.fill();
      drawSphere3D(ctx, 1408, 760, 88, "Na", { symbol: "DNA" });
      drawSphere3D(ctx, 1260, 850, 38, "Fe"); drawSphere3D(ctx, 1555, 845, 38, "Fe");
      ctx.restore();
      drawFloorTag(ctx, 1408, 1300, "Cell Organelle Model (10⁻⁵ m)", "#15803d");

      // 3. Invisible Magnetic Field Model around N–S Bar Magnet
      floorShadow(ctx, 2316, 1170, 320, 36, 0.15);
      for (const ry of [130, 220, 310]) {
        ctx.strokeStyle = "rgba(37,99,235,0.55)"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.ellipse(2316, 780, 270, ry, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = "#dc2626"; roundRect(ctx, 2136, 735, 180, 90, 12); ctx.fill();
      ctx.fillStyle = "#2563eb"; roundRect(ctx, 2316, 735, 180, 90, 12); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = '700 44px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("N", 2226, 795); ctx.fillText("S", 2406, 795);
      drawFloorTag(ctx, 2316, 1300, "Magnetic Field-Line Model", "#b91c1c");
      return cv;
    },
    marks: makeLabels([
      { x: 250, y: 385, en: "Subatomic Shell Model", hi: "परमाणु कक्षक प्रतिरूप", info_en: "Visualises invisible electrons and nuclei whose energy transitions predict spectral lines.", info_hi: "अदृश्य इलेक्ट्रॉन व नाभिक की संरचना को समझाने और स्पेक्ट्रम की भविष्यवाणी करने वाला मॉडल।" },
      { x: 704, y: 390, en: "3D Cellular Model", hi: "त्रिविमीय कोशिका प्रतिरूप", info_en: "Represents microscopic organelles and membrane transport at human-readable scale.", info_hi: "सूक्ष्म कोशिकांगों और झिल्ली परिवहन को स्पष्ट अनुपात में दर्शाने वाला मॉडल।" },
      { x: 1158, y: 390, en: "Field-Line Representation", hi: "चुम्बकीय क्षेत्र-रेखा मॉडल", info_en: "Faraday's field lines make invisible magnetic forces concrete and mathematically testable.", info_hi: "अदृश्य चुम्बकीय बल क्षेत्र की दिशा व प्रबलता को रेखाओं द्वारा दृश्य बनाता है।" },
      { x: 1158, y: 545, en: "Testable Predictions", hi: "परीक्षणीय पूर्वानुमान", info_en: "Scientific models are refined or replaced whenever new experimental data demand better accuracy.", info_hi: "नए प्रायोगिक प्रमाण मिलने पर वैज्ञानिक प्रतिरूपों को सुधारा और परिष्कृत किया जाता है।" }
    ])
  },

  // #37 c9_exploration §1.6 — Science links mathematics, technology and society
  {
    id: "science_math_tech_society",
    wid: "c9_exploration",
    sec: "1.6",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // 1. Mathematics (equations & parabolic wave graph) -> 2. Technology (Solar PV + Optical Fibre) -> 3. Society (Clean Clinic & School)
      ctx.fillStyle = "#eff6ff"; ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 5;
      roundRect(ctx, 190, 470, 660, 640, 32); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 8;
      ctx.beginPath();
      for (let x = 0; x <= 520; x += 8) {
        const y = 860 - 160 * Math.sin((x / 260) * Math.PI * 2);
        if (x === 0) ctx.moveTo(260 + x, y); else ctx.lineTo(260 + x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "#1e3a8a"; ctx.font = '700 46px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("E = hν  ·  P = V·I", 520, 600);
      drawFloorTag(ctx, 520, 1300, "1. Mathematics & Physics Laws", "#1d4ed8");

      drawArrow(ctx, 885, 790, 1065, 790, "#0284c7", 10, 30);

      // 2. Technology: Tilted 3D Blue Photovoltaic Solar Array + Glowing Fiber-Optic Cable
      floorShadow(ctx, 1408, 1165, 310, 34, 0.15);
      ctx.save();
      ctx.fillStyle = "#1e3a8a"; ctx.strokeStyle = "#93c5fd"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(1120, 560); ctx.lineTo(1660, 480); ctx.lineTo(1730, 920); ctx.lineTo(1190, 1000); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "rgba(191,219,254,0.65)"; ctx.lineWidth = 3;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(1120 + i * 138, 560 - i * 20); ctx.lineTo(1190 + i * 138, 1000 - i * 20); ctx.stroke();
      }
      ctx.restore();
      drawFloorTag(ctx, 1408, 1300, "2. Clean Engineering & Instruments", "#0369a1");

      drawArrow(ctx, 1775, 790, 1955, 790, "#16a34a", 10, 30);

      // 3. Society: Lit Rural Health Clinic & Connected Classroom
      floorShadow(ctx, 2300, 1165, 330, 34, 0.15);
      ctx.fillStyle = "#f0fdf4"; ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 5;
      roundRect(ctx, 1990, 620, 620, 510, 24); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#15803d";
      ctx.beginPath(); ctx.moveTo(1950, 635); ctx.lineTo(2300, 445); ctx.lineTo(2650, 635); ctx.closePath(); ctx.fill();
      // Glowing warm windows + medical cross
      ctx.fillStyle = "#fde047";
      roundRect(ctx, 2060, 760, 140, 140, 14); ctx.fill();
      roundRect(ctx, 2400, 760, 140, 140, 14); ctx.fill();
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(2282, 690, 36, 110); ctx.fillRect(2245, 727, 110, 36);
      drawFloorTag(ctx, 2300, 1300, "3. Societal Health & Sustainability", "#15803d");
      return cv;
    },
    marks: makeLabels([
      { x: 260, y: 380, en: "Mathematical Laws", hi: "गणितीय सूत्र व नियम", info_en: "Mathematics expresses physical relationships precisely so outcomes can be calculated reliably.", info_hi: "गणित प्राकृतिक नियमों को सटीक समीकरणों में व्यक्त कर पूर्वानुमान संभव बनाता है।" },
      { x: 704, y: 375, en: "Technological Devices", hi: "तकनीकी यंत्र व सौर पैनल", info_en: "Scientific principles enable solar cells, sensors, vaccines and communication networks.", info_hi: "वैज्ञानिक सिद्धांतों के अनुप्रयोग से सौर सेल, चिकित्सा यंत्र और संचार तकनीकें बनती हैं।" },
      { x: 930, y: 395, en: "Power & Data Link", hi: "ऊर्जा व सूचना प्रवाह", info_en: "Engineering converts laboratory discoveries into scalable infrastructure.", info_hi: "अभियांत्रिकी प्रयोगशाला की खोजों को समाजोपयोगी तंत्र में बदलती है।" },
      { x: 1150, y: 390, en: "Societal Well-Being", hi: "समाज व जन-कल्याण", info_en: "Informed citizens use scientific evidence for healthcare, clean energy and environmental stewardship.", info_hi: "विज्ञान आधारित निर्णय स्वास्थ्य, स्वच्छ ऊर्जा और पर्यावरण संरक्षण को सुदृढ़ करते हैं।" }
    ])
  },

  // #42 c9_forces §6.3 — Balanced forces
  {
    id: "balanced_forces_equilibrium",
    wid: "c9_forces",
    sec: "6.3",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 980 });
      // Smooth horizontal lab table + Heavy metallic block at center (1408, 830)
      ctx.fillStyle = "#cbd5e1"; roundRect(ctx, 260, 960, 2296, 56, 16); ctx.fill();
      floorShadow(ctx, 1408, 960, 260, 22, 0.22);
      const bg = ctx.createLinearGradient(1210, 690, 1606, 960);
      bg.addColorStop(0, "#60a5fa"); bg.addColorStop(1, "#1e3a8a");
      ctx.fillStyle = bg; roundRect(ctx, 1210, 690, 396, 270, 26); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = '700 44px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("m = 5 kg", 1408, 840);

      // Equal & opposite horizontal forces: F1 = 20 N Left, F2 = 20 N Right + spring dynamometers!
      drawArrow(ctx, 1210, 825, 560, 825, "#dc2626", 14, 38);
      drawArrow(ctx, 1606, 825, 2256, 825, "#dc2626", 14, 38);
      ctx.fillStyle = "#fef3c7"; ctx.strokeStyle = "#b45309"; ctx.lineWidth = 4;
      roundRect(ctx, 760, 785, 280, 80, 18); ctx.fill(); ctx.stroke();
      roundRect(ctx, 1776, 785, 280, 80, 18); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#9a3412"; ctx.font = '700 34px "DejaVu Sans", sans-serif';
      ctx.fillText("F₁ = 20 N", 900, 836);
      ctx.fillText("F₂ = 20 N", 1916, 836);

      // Equal & opposite vertical forces: Normal N = 49 N Up, Gravity W = mg = 49 N Down!
      drawArrow(ctx, 1408, 690, 1408, 360, "#16a34a", 12, 34);
      drawArrow(ctx, 1408, 960, 1408, 1250, "#7e22ce", 12, 34);
      drawFloorTag(ctx, 1408, 1365, "ΣF_x = 20 N − 20 N = 0 N   ·   ΣF_y = N − mg = 0 N   →   a = 0 m/s²", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 450, y: 412, en: "Left Pull (F₁ = 20 N)", hi: "बायाँ खिंचाव बल (20 N)", info_en: "Calibrated spring balance pulls leftward with 20 N magnitude.", info_hi: "कमानीदार तुला ब्लॉक को 20 N बल से बाईं ओर खींचती है।" },
      { x: 704, y: 215, en: "Normal Force (N = mg)", hi: "अभिलंब प्रतिक्रिया बल (N)", info_en: "Upward table support force balances downward gravitational weight mg.", info_hi: "मेज का ऊपर की ओर अभिलंब बल (N) नीचे लगते भार (mg) को संतुलित करता है।" },
      { x: 704, y: 585, en: "Zero Net Acceleration", hi: "शून्य परिणामी बल (a = 0)", info_en: "Balanced forces give ΣF = 0, so a stationary body stays at rest and a moving body keeps constant velocity.", info_hi: "संतुलित बलों का परिणामी शून्य होने से वस्तु स्थिर रहती है या एकसमान वेग से चलती रहती है।" },
      { x: 958, y: 412, en: "Right Pull (F₂ = 20 N)", hi: "दायाँ खिंचाव बल (20 N)", info_en: "Equal and opposite 20 N rightward pull cancels F₁ exactly along the same line of action.", info_hi: "विपरीत दिशा में समान 20 N का दायाँ बल बाएँ बल को पूर्णतः निरस्त कर देता है।" }
    ])
  },

  // #43 c9_work_energy §7.2 — Positive, negative and zero work
  {
    id: "positive_negative_zero_work",
    wid: "c9_work_energy",
    sec: "7.2",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1140 });
      const cases = [
        { cx: 500, fx: 210, fy: 0, fCol: "#16a34a", title: "θ = 0°  →  W = +F·s (> 0)", sub: "Force along motion" },
        { cx: 1408, fx: -210, fy: 0, fCol: "#dc2626", title: "θ = 180°  →  W = −f·s (< 0)", sub: "Friction opposes motion" },
        { cx: 2316, fx: 0, fy: -230, fCol: "#7e22ce", title: "θ = 90°  →  W = 0", sub: "Force ⊥ displacement" }
      ];
      for (const c of cases) {
        floorShadow(ctx, c.cx, 1125, 290, 30, 0.15);
        // Track segment
        ctx.fillStyle = "#cbd5e1"; roundRect(ctx, c.cx - 340, 1080, 680, 30, 12); ctx.fill();
        // Wheeled block moving right (displacement s arrow always blue rightward!)
        ctx.fillStyle = "#3b82f6"; roundRect(ctx, c.cx - 110, 880, 220, 160, 22); ctx.fill();
        drawSphere3D(ctx, c.cx - 65, 1060, 24, "C"); drawSphere3D(ctx, c.cx + 65, 1060, 24, "C");
        // Displacement vector s (rightward)
        drawArrow(ctx, c.cx - 90, 780, c.cx + 210, 780, "#0284c7", 10, 28);
        ctx.fillStyle = "#0369a1"; ctx.font = '700 32px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText("Displacement (s →)", c.cx + 60, 742);
        // Force vector F!
        drawArrow(ctx, c.cx, 960, c.cx + c.fx, 960 + c.fy, c.fCol, 13, 34);
        drawFloorTag(ctx, c.cx, 1275, c.title, c.fCol);
      }
      return cv;
    },
    marks: makeLabels([
      { x: 250, y: 480, en: "Positive Work (θ = 0°)", hi: "धनात्मक कार्य (+W)", info_en: "When force acts in the direction of displacement (cos 0° = +1), W = +F·s increases speed.", info_hi: "जब बल विस्थापन की दिशा में लगता है, तब किया गया कार्य धनात्मक (+Fs) होता है।" },
      { x: 704, y: 390, en: "Displacement Vector (s)", hi: "विस्थापन सदिश (s)", info_en: "In all three cases the cart moves horizontally rightward through displacement s.", info_hi: "तीनों स्थितियों में वस्तु का विस्थापन (s) क्षैतिज रूप से दाईं ओर है।" },
      { x: 704, y: 480, en: "Negative Work (θ = 180°)", hi: "ऋणात्मक कार्य (−W)", info_en: "Retarding friction opposes motion (cos 180° = −1), doing negative work W = −f·s.", info_hi: "गति के विपरीत लगने वाला घर्षण बल ऋणात्मक कार्य (−fs) करता है।" },
      { x: 1158, y: 430, en: "Zero Work (θ = 90°)", hi: "शून्य कार्य (W = 0)", info_en: "Upward lift/normal force perpendicular to horizontal displacement does zero work (cos 90° = 0).", info_hi: "विस्थापन के लंबवत (90°) बल द्वारा किया गया कार्य शून्य होता है।" }
    ])
  },

  // #44 c9_work_energy §7.5 — Work-energy theorem
  {
    id: "work_energy_theorem_cart",
    wid: "c9_work_energy",
    sec: "7.5",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1160 });
      // Long horizontal low-friction track from x=320 to x=2500
      ctx.fillStyle = "#94a3b8"; roundRect(ctx, 260, 1060, 2296, 44, 16); ctx.fill();
      // State 1 at Photogate A (x=680): Cart at slow initial velocity u -> small KE1 bar
      ctx.fillStyle = "rgba(59,130,246,0.55)"; roundRect(ctx, 540, 880, 260, 145, 22); ctx.fill();
      drawSphere3D(ctx, 595, 1042, 24, "C"); drawSphere3D(ctx, 745, 1042, 24, "C");
      drawArrow(ctx, 800, 950, 960, 950, "#0284c7", 9, 24);
      // KE1 bar above State 1
      ctx.fillStyle = "#93c5fd"; strokeBar(ctx, 610, 620, 120, 160, "½mu²");

      // Constant Net Force F acting across distance s!
      drawArrow(ctx, 980, 830, 1780, 830, "#dc2626", 14, 38);
      ctx.fillStyle = "#b91c1c"; ctx.font = '700 40px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
      ctx.fillText("Net Work  W = F_net × s", 1380, 785);

      // State 2 at Photogate B (x=2080): Cart at fast final velocity v -> tall KE2 bar!
      ctx.fillStyle = "#1d4ed8"; roundRect(ctx, 1940, 880, 260, 145, 22); ctx.fill();
      drawSphere3D(ctx, 1995, 1042, 24, "C"); drawSphere3D(ctx, 2145, 1042, 24, "C");
      drawArrow(ctx, 2200, 950, 2540, 950, "#0284c7", 13, 34);
      // Tall KE2 bar above State 2
      ctx.fillStyle = "#16a34a"; strokeBar(ctx, 2010, 390, 120, 390, "½mv²");

      drawFloorTag(ctx, 1408, 1295, "Work–Energy Theorem:   W_net = F · s = ½mv² − ½mu² = ΔK", "#1e3a8a");
      return cv;
    },
    marks: makeLabels([
      { x: 335, y: 475, en: "Initial Velocity (u)", hi: "प्रारंभिक वेग (u)", info_en: "Moving cart enters with initial kinetic energy Kᵢ = ½mu².", info_hi: "गतिशील गाड़ी की प्रारंभिक गतिज ऊर्जा Kᵢ = ½mu² है।" },
      { x: 690, y: 415, en: "Net Work Done (F·s)", hi: "परिणामी बल का कार्य (F·s)", info_en: "Constant net force F acting over displacement s transfers mechanical energy to the cart.", info_hi: "विस्थापन s तक लगा परिणामी बल F वस्तु को यांत्रिक ऊर्जा देता है।" },
      { x: 1035, y: 290, en: "Final Kinetic Energy (½mv²)", hi: "अंतिम गतिज ऊर्जा (½mv²)", info_en: "Speed rises from u to v so kinetic energy grows by exactly W_net.", info_hi: "वेग u से बढ़कर v होने पर गतिज ऊर्जा बढ़कर ½mv² हो जाती है।" },
      { x: 1150, y: 475, en: "W_net = ΔK", hi: "कार्य-ऊर्जा प्रमेय (W = ΔK)", info_en: "Using v² − u² = 2as gives F·s = ma·s = ½m(v² − u²).", info_hi: "किया गया कुल कार्य गतिज ऊर्जा में परिवर्तन (½mv² − ½mu²) के बराबर होता है।" }
    ])
  },

  // #45 c9_work_energy §7.7 — Power and its unit
  {
    id: "mechanical_power_watt",
    wid: "c9_work_energy",
    sec: "7.7",
    render() {
      const { cv, ctx } = studioCanvas({ horizon: 1180 });
      // Two motorized hoist cranes lifting equal 50 kg loads by equal height h = 4 m (W = 1960 J), in 2 s vs 8 s!
      const rigs = [
        { cx: 740, loadY: 560, time: "t₁ = 2 s", power: "P₁ = 980 W (Fast)", frac: 0.88, col: "#dc2626" },
        { cx: 2076, loadY: 880, time: "t₂ = 8 s", power: "P₂ = 245 W (Slow)", frac: 0.28, col: "#2563eb" }
      ];
      for (const r of rigs) {
        floorShadow(ctx, r.cx, 1170, 320, 34, 0.15);
        // Steel gantry frame + top pulley wheel
        ctx.fillStyle = "#475569";
        roundRect(ctx, r.cx - 260, 380, 36, 780, 10); ctx.fill();
        roundRect(ctx, r.cx - 260, 380, 420, 36, 10); ctx.fill();
        drawSphere3D(ctx, r.cx, 425, 42, "Ni");
        // Cable + brass mass m
        ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(r.cx, 425); ctx.lineTo(r.cx, r.loadY); ctx.stroke();
        ctx.fillStyle = "#d97706"; ctx.strokeStyle = "#78350f"; ctx.lineWidth = 4;
        roundRect(ctx, r.cx - 85, r.loadY, 170, 140, 20); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#ffffff"; ctx.font = '700 34px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
        ctx.fillText("50 kg", r.cx, r.loadY + 82);
        drawArrow(ctx, r.cx + 125, r.loadY + 120, r.cx + 125, r.loadY - 40, r.col, 9, 26);

        // Wattmeter + Timer beside crane
        drawMeter(ctx, r.cx + 250, 960, 240, 220, "W", r.frac, r.col);
        drawFloorTag(ctx, r.cx, 1300, `${r.time}  →  ${r.power}`, r.col);
      }
      return cv;
    },
    marks: makeLabels([
      { x: 370, y: 315, en: "High Power Lift (2 s)", hi: "अधिक शक्ति (कम समय = 2 s)", info_en: "Doing the same work W = mgh in shorter time t delivers much greater power P = W/t.", info_hi: "समान कार्य (mgh) कम समय में करने पर शक्ति (P = W/t) अधिक होती है।" },
      { x: 495, y: 480, en: "Wattmeter (1 W = 1 J/s)", hi: "वाट मात्रक (1 W = 1 J/s)", info_en: "SI unit of power is the Watt (James Watt): 1 W = 1 Joule per second; 1 kW = 1000 W.", info_hi: "शक्ति का SI मात्रक वाट है: 1 वाट = 1 जूल प्रति सेकंड (1 kW = 1000 W)।" },
      { x: 1038, y: 475, en: "Equal Work, Longer Time", hi: "समान कार्य, अधिक समय (8 s)", info_en: "Lifting the same 50 kg load more slowly requires the same energy but only one-fourth the power.", info_hi: "उसी 50 kg भार को 4 गुना समय में उठाने पर ऊर्जा समान लगती है पर शक्ति चौथाई रह जाती है।" },
      { x: 1163, y: 480, en: "Average Power (W_total / t)", hi: "औसत शक्ति (कुल ऊर्जा / समय)", info_en: "Average power equals total energy transferred divided by total time taken.", info_hi: "कुल उपभुक्त ऊर्जा और कुल लिए गए समय के अनुपात को औसत शक्ति कहते हैं।" }
    ])
  }
];

function strokeBar(ctx, x, y, w, h, lbl) {
  ctx.save();
  roundRect(ctx, x, y, w, h, 16); ctx.fill();
  ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = "#0f172a"; ctx.font = '700 32px "DejaVu Sans", sans-serif'; ctx.textAlign = "center";
  ctx.fillText(lbl, x + w / 2, y - 24);
  ctx.restore();
}
