#!/usr/bin/env node
// Prevent reviewed source labels from diverging from the bundled manifest.
// This checks metadata consistency, not scientific or visual correctness.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHEM_PLATES } from '../tools/plates_73/chem_plates.mjs';
import { PHYS_PLATES } from '../tools/plates_73/phys_plates.mjs';
import { BIO_ENV_PLATES } from '../tools/plates_73/bio_env_plates.mjs';

const manifest = JSON.parse(fs.readFileSync('src/realistic_plates.json', 'utf8'));
const plates = [...CHEM_PLATES, ...PHYS_PLATES, ...BIO_ENV_PLATES];
for (const id of ['thomson_plum_pudding', 'law_constant_proportion', 'straight_conductor_field', 'dihybrid_cross_punnett']) {
  const plate = plates.find(p => p.id === id);
  assert.ok(plate, `missing authoring plate ${id}`);
  assert.deepStrictEqual(manifest.labels[`rx/${id}.webp`], plate.marks, `manifest labels differ from source: ${id}`);
  assert.ok(manifest.assets[plate.wid]?.[plate.sec]?.includes(`rx/${id}.webp`), `missing mapping: ${id}`);
}
console.log('PASS reviewed_plate_metadata: four reviewed plates match authoring labels and runtime mappings');
