// tools/plates_73/build_all.mjs
// Renders all 64 supersampled 2816x1536 3D/studio plates and emits manifest_73.json
// combining the 9 verified AI 3D plates + 64 studio 3D/2D plates = 73 plates (100% coverage).
import fs from "node:fs";
import path from "node:path";
import { AI_9_PLATES } from "./ai_9.mjs";
import { CHEM_PLATES } from "./chem_plates.mjs";
import { PHYS_PLATES } from "./phys_plates.mjs";
import { BIO_ENV_PLATES } from "./bio_env_plates.mjs";

const OUT_RAW = "/tmp/studio_73_raw";
fs.mkdirSync(OUT_RAW, { recursive: true });

const studioAll = [...CHEM_PLATES, ...PHYS_PLATES, ...BIO_ENV_PLATES];
const all73 = [...AI_9_PLATES, ...studioAll];

console.log(`Total plates registered: ${all73.length} (AI=${AI_9_PLATES.length}, Chem=${CHEM_PLATES.length}, Phys=${PHYS_PLATES.length}, Bio/Env=${BIO_ENV_PLATES.length})`);
if (all73.length !== 73) {
  throw new Error(`Expected 73 plates, got ${all73.length}`);
}

const seenIds = new Set();
const seenSecs = new Set();
for (const p of all73) {
  if (seenIds.has(p.id)) throw new Error(`Duplicate id: ${p.id}`);
  seenIds.add(p.id);
  const sk = `${p.wid}::${p.sec}`;
  if (seenSecs.has(sk)) throw new Error(`Duplicate section mapping: ${sk}`);
  seenSecs.add(sk);
  if (!Array.isArray(p.marks) || p.marks.length < 4) {
    throw new Error(`Plate ${p.id} must have >= 4 bilingual anchored labels`);
  }
}

let idx = 0;
for (const p of studioAll) {
  idx += 1;
  const cv = p.render();
  const outPng = path.join(OUT_RAW, `${p.id}.png`);
  fs.writeFileSync(outPng, cv.toBuffer("image/png"));
  if (idx % 10 === 0 || idx === studioAll.length) {
    console.log(`Rendered [${idx}/${studioAll.length}] -> ${p.id}.png`);
  }
}

const manifest73 = all73.map(p => ({
  id: p.id,
  wid: p.wid,
  sec: p.sec,
  isAi: !p.render,
  marks: p.marks
}));
fs.writeFileSync("/tmp/studio_73_raw/manifest_73.json", JSON.stringify(manifest73, null, 2));
console.log("Wrote /tmp/studio_73_raw/manifest_73.json successfully.");
