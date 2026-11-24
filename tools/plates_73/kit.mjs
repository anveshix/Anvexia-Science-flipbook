// tools/plates_73/kit.mjs
// Shared 2x-supersampled (2816x1536 -> 1408x768) 3D PBR & Studio Scientific Illustration Kit.
import { createCanvas } from "@napi-rs/canvas";

export const W = 2816;
export const H = 1536;
export const OUT_W = 1408;
export const OUT_H = 768;

export const PALETTES = {
  C: ["#6f7887", "#2e3542", "#131720", "#b8c2d1"],
  H: ["#ffffff", "#e5ecf5", "#aebbd0", "#ffffff"],
  O: ["#ff7070", "#d62828", "#6b0f1a", "#ffd6d6"],
  N: ["#6da8ff", "#2563eb", "#102a6b", "#cfe2ff"],
  Cl: ["#5be38b", "#1ca350", "#0b4f26", "#ccf9dc"],
  S: ["#ffe866", "#d9a406", "#6e5000", "#fff7c2"],
  Na: ["#b794f4", "#6b46c1", "#2e1669", "#e9d8fd"],
  K: ["#d6bcfa", "#805ad5", "#3b1d7a", "#f3e8ff"],
  Li: ["#f687b3", "#b83280", "#521237", "#fed7e2"],
  Mg: ["#81e6d9", "#2c7a7b", "#12383a", "#e6fffa"],
  Ca: ["#9ae6b4", "#2f855a", "#133d28", "#f0fff4"],
  Al: ["#e2e8f0", "#94a3b8", "#475569", "#f8fafc"],
  Ni: ["#cbd5e1", "#64748b", "#1e293b", "#f1f5f9"],
  Fe: ["#f6ad55", "#b45309", "#4c1d04", "#feebc8"],
  Cu: ["#fbd38d", "#c05621", "#5c2309", "#fffaf0"],
  Au: ["#fef08a", "#ca8a04", "#633f02", "#fefce8"],
  U: ["#68d391", "#276749", "#0f2e1f", "#c6f6d5"],
  proton: ["#ff7575", "#dc2626", "#7f1d1d", "#fecaca"],
  neutron: ["#cbd5e1", "#64748b", "#334155", "#f1f5f9"],
  electron: ["#60a5fa", "#1d4ed8", "#1e3a8a", "#dbeafe"],
  peaYellow: ["#fde047", "#ca8a04", "#713f12", "#fef9c3"],
  peaGreen: ["#86efac", "#16a34a", "#14532d", "#dcfce7"],
};

export function studioCanvas(opts = {}) {
  const cv = createCanvas(W, H);
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  if (opts.bench !== false) {
    const horizon = opts.horizon || Math.round(H * 0.72);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#ffffff");
    bg.addColorStop(Math.max(0.25, (horizon - 180) / H), "#ffffff");
    bg.addColorStop(horizon / H, opts.benchTop || "#f4f7fb");
    bg.addColorStop(1, opts.benchBot || "#fafcfe");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, horizon);
    ctx.lineTo(W - 80, horizon);
    ctx.stroke();
  }
  return { cv, ctx };
}

export function floorShadow(ctx, cx, cy, rx, ry = 38, alpha = 0.14) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, `rgba(15, 23, 42, ${alpha})`);
  g.addColorStop(0.55, `rgba(15, 23, 42, ${alpha * 0.42})`);
  g.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawSphere3D(ctx, x, y, r, kind = "C", opts = {}) {
  const pal = Array.isArray(kind) ? kind : (PALETTES[kind] || PALETTES.C);
  const [hi, mid, dk, rim] = pal;
  ctx.save();
  if (opts.glow) {
    const gl = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 1.9);
    gl.addColorStop(0, opts.glow);
    gl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
    ctx.fill();
  }
  const g = ctx.createRadialGradient(x - r * 0.34, y - r * 0.36, r * 0.06, x, y, r);
  g.addColorStop(0, hi);
  g.addColorStop(0.48, mid);
  g.addColorStop(0.88, dk);
  g.addColorStop(1, rim);
  ctx.fillStyle = g;
  ctx.beginPath();
  if (opts.wrinkled) {
    const lobes = 11;
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const rr = r * (0.91 + 0.085 * Math.sin(a * lobes * 0.55 + Math.cos(a * 3)));
      const px = x + rr * Math.cos(a), py = y + rr * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else {
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }
  ctx.fill();

  const sp = ctx.createRadialGradient(x - r * 0.36, y - r * 0.38, 0, x - r * 0.36, y - r * 0.38, r * 0.44);
  sp.addColorStop(0, "rgba(255,255,255,0.86)");
  sp.addColorStop(0.5, "rgba(255,255,255,0.22)");
  sp.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sp;
  ctx.fill();

  ctx.strokeStyle = "rgba(15,23,42,0.18)";
  ctx.lineWidth = Math.max(1.5, r * 0.045);
  ctx.stroke();

  if (opts.symbol) {
    ctx.fillStyle = opts.symbolColor || (kind === "H" || kind === "Al" || kind === "Au" || kind === "peaYellow" ? "#0f172a" : "#ffffff");
    const len = String(opts.symbol).length;
    const fs = Math.round(Math.min(r * 0.82, (r * 1.48) / Math.max(1.6, len * 0.58)));
    ctx.font = `700 ${Math.max(18, fs)}px "DejaVu Sans", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(opts.symbol, x, y + r * 0.04);
  }
  ctx.restore();
}

export function project3D(pt, center, rotX = 0.25, rotY = -0.25, scale = 110, fov = 960) {
  const [x, y, z] = pt;
  const x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
  const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
  const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
  const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
  const p = fov / (fov - z2 * scale * 0.34);
  return { x: center[0] + x1 * scale * p, y: center[1] - y2 * scale * p, z: z2, p };
}

export function drawBond3D(ctx, a, b, order = 1, radius = 12) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const offsets = order === 1 ? [0] : order === 2 ? [-radius * 1.08, radius * 1.08] : [-radius * 1.75, 0, radius * 1.75];
  const r = order === 1 ? radius : radius * 0.72;
  for (const off of offsets) {
    const x1 = a.x + nx * off, y1 = a.y + ny * off, x2 = b.x + nx * off, y2 = b.y + ny * off;
    ctx.save();
    const grad = ctx.createLinearGradient(x1 - nx * r, y1 - ny * r, x1 + nx * r, y1 + ny * r);
    grad.addColorStop(0, "#64748b");
    grad.addColorStop(0.35, "#f1f5f9");
    grad.addColorStop(0.68, "#94a3b8");
    grad.addColorStop(1, "#475569");
    ctx.strokeStyle = grad;
    ctx.lineWidth = r * 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
}

export function renderMolecule3D(ctx, atoms, bonds, center, rotX = 0.28, rotY = -0.26, scale = 110, showSymbols = false) {
  const radMap = { H: 26, C: 44, O: 44, N: 44, Cl: 50, S: 50 };
  const proj = atoms.map(a => ({ ...a, ...project3D(a.pos, center, rotX, rotY, scale) }));
  const items = [];
  for (const [i, j, ord] of bonds) {
    items.push({ kind: "bond", z: (proj[i].z + proj[j].z) * 0.5 - 0.05, a: proj[i], b: proj[j], ord: ord || 1 });
  }
  for (const p of proj) {
    const baseR = p.r || radMap[p.el] || 44;
    items.push({ kind: "atom", z: p.z, p, rad: baseR * p.p * (scale / 112) });
  }
  items.sort((u, v) => u.z - v.z);
  for (const it of items) {
    if (it.kind === "bond") drawBond3D(ctx, it.a, it.b, it.ord, 11.5 * (scale / 112));
    else drawSphere3D(ctx, it.p.x, it.p.y, it.rad, it.p.el, { symbol: showSymbols ? it.p.el : "" });
  }
}

export function roundRect(ctx, x, y, w, h, r = 18) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function drawBeaker(ctx, x, y, w, h, liquidRgba = "rgba(59,130,246,0.42)", fillFrac = 0.62, opts = {}) {
  floorShadow(ctx, x + w / 2, y + h + 16, w * 0.56, 28, 0.15);
  ctx.save();
  // Liquid fill
  if (fillFrac > 0) {
    const lh = h * fillFrac;
    const ly = y + h - lh;
    const lg = ctx.createLinearGradient(x, ly, x + w, y + h);
    lg.addColorStop(0, liquidRgba);
    lg.addColorStop(0.5, opts.liquidMid || liquidRgba);
    lg.addColorStop(1, opts.liquidDark || liquidRgba);
    ctx.fillStyle = lg;
    roundRect(ctx, x + 8, ly, w - 16, lh - 6, 24);
    ctx.fill();

    // Meniscus ellipse
    ctx.fillStyle = opts.meniscus || "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, ly + 4, (w - 18) / 2, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Optional bubbles
  if (opts.bubbles) {
    const lh = h * fillFrac, ly = y + h - lh;
    for (let i = 0; i < opts.bubbles; i++) {
      const bx = x + 36 + ((i * 73) % (w - 72));
      const by = ly + 22 + ((i * 59) % Math.max(30, lh - 46));
      const br = 5 + (i % 4) * 3;
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.strokeStyle = "rgba(148,163,184,0.55)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Borosilicate glass walls & spout
  const gg = ctx.createLinearGradient(x, y, x + w, y);
  gg.addColorStop(0, "rgba(203,213,225,0.55)");
  gg.addColorStop(0.14, "rgba(255,255,255,0.65)");
  gg.addColorStop(0.5, "rgba(241,245,249,0.08)");
  gg.addColorStop(0.88, "rgba(255,255,255,0.5)");
  gg.addColorStop(1, "rgba(148,163,184,0.48)");
  ctx.fillStyle = gg;
  roundRect(ctx, x, y, w, h, 28);
  ctx.fill();
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Top rim ellipse
  ctx.fillStyle = "rgba(248,250,252,0.55)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 4, w / 2 + 4, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Graduation ticks
  ctx.strokeStyle = "rgba(71,85,105,0.55)";
  ctx.lineWidth = 2.5;
  for (let i = 1; i <= 4; i++) {
    const ty = y + h - (h * 0.18 * i);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.68, ty);
    ctx.lineTo(x + w * 0.82, ty);
    ctx.stroke();
  }

  // Left specular highlight streak
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  roundRect(ctx, x + 18, y + 26, 14, h - 56, 7);
  ctx.fill();
  ctx.restore();
}

export function drawArrow(ctx, x1, y1, x2, y2, color = "#1d4ed8", width = 8, head = 26, dashed = false) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  if (dashed) ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(ang) * head * 0.7, y2 - Math.sin(ang) * head * 0.7);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(ang - 0.42), y2 - head * Math.sin(ang - 0.42));
  ctx.lineTo(x2 - head * Math.cos(ang + 0.42), y2 - head * Math.sin(ang + 0.42));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawFloorTag(ctx, cx, cy, text, accent = "#1e3a8a") {
  ctx.save();
  ctx.font = '700 32px "DejaVu Sans", sans-serif';
  const tw = ctx.measureText(text).width;
  const pw = tw + 48, ph = 54;
  ctx.fillStyle = "rgba(248, 250, 252, 0.94)";
  ctx.strokeStyle = "rgba(100, 116, 139, 0.35)";
  ctx.lineWidth = 2.5;
  roundRect(ctx, cx - pw / 2, cy - ph / 2, pw, ph, 27);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy + 1);
  ctx.restore();
}

export function drawMeter(ctx, cx, cy, w, h, unit = "V", frac = 0.65, accent = "#dc2626") {
  floorShadow(ctx, cx, cy + h / 2 + 14, w * 0.54, 24, 0.16);
  ctx.save();
  const x = cx - w / 2, y = cy - h / 2;
  // Casing
  const cg = ctx.createLinearGradient(x, y, x, y + h);
  cg.addColorStop(0, "#334155");
  cg.addColorStop(1, "#0f172a");
  ctx.fillStyle = cg;
  roundRect(ctx, x, y, w, h, 24);
  ctx.fill();
  // Dial window
  ctx.fillStyle = "#f8fafc";
  roundRect(ctx, x + 18, y + 18, w - 36, h * 0.62, 14);
  ctx.fill();
  // Scale arc
  const ox = cx, oy = y + h * 0.56, rad = Math.min(w * 0.34, h * 0.38);
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(ox, oy, rad, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI * (1.15 + 0.7 * (i / 6));
    ctx.beginPath();
    ctx.moveTo(ox + (rad - 10) * Math.cos(a), oy + (rad - 10) * Math.sin(a));
    ctx.lineTo(ox + (rad + 6) * Math.cos(a), oy + (rad + 6) * Math.sin(a));
    ctx.stroke();
  }
  // Needle
  const na = Math.PI * (1.15 + 0.7 * Math.max(0.05, Math.min(0.95, frac)));
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox + (rad - 6) * Math.cos(na), oy + (rad - 6) * Math.sin(na));
  ctx.stroke();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(ox, oy, 9, 0, Math.PI * 2);
  ctx.fill();
  // Unit symbol
  ctx.fillStyle = "#0f172a";
  ctx.font = '700 34px "DejaVu Sans", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(unit, cx, y + h * 0.42);
  // Terminals
  drawSphere3D(ctx, x + w * 0.28, y + h * 0.86, 15, "O");
  drawSphere3D(ctx, x + w * 0.72, y + h * 0.86, 15, "C");
  ctx.restore();
}

// Deterministic non-overlapping EVLABEL chip generator in 1408x768 coordinate space.
// Marks array: [{ x (0..1408), y (0..768), en, hi, info_en, info_hi }]
export function makeLabels(marks) {
  const PAD = 14, GAP = 10, CHIP_H = 66, ROW_GAP = 10, PER_ROW = 5;
  const sorted = [...marks].sort((a, b) => a.x - b.x);
  const rows = [];
  for (let i = 0; i < sorted.length; i += PER_ROW) rows.push(sorted.slice(i, i + PER_ROW));
  const specs = [];
  rows.forEach((row, r) => {
    row.sort((a, b) => a.x - b.x);
    const k = row.length;
    const w = k > 1 ? Math.floor((OUT_W - 2 * PAD - (k - 1) * GAP) / k) : 420;
    const x0 = k > 1 ? PAD : Math.floor(Math.min(Math.max(row[0].x - w / 2, PAD), OUT_W - PAD - w));
    const y = PAD + r * (CHIP_H + ROW_GAP);
    row.forEach((m, i) => {
      specs.push({
        anchor_x: Math.round(Math.max(12, Math.min(OUT_W - 12, m.x))),
        anchor_y: Math.round(Math.max(96, Math.min(OUT_H - 12, m.y))),
        en: m.en,
        h: CHIP_H,
        hi: m.hi,
        info_en: m.info_en,
        info_hi: m.info_hi,
        w,
        x: x0 + i * (w + GAP),
        y,
      });
    });
  });
  return specs;
}
