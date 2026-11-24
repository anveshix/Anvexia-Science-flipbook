#!/usr/bin/env node
// Prevent reviewed source labels from diverging from the bundled manifest.
// This checks metadata consistency, not scientific or visual correctness.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHEM_PLATES } from '../tools/plates_73/chem_plates.mjs';
import { PHYS_PLATES } from '../tools/plates_73/phys_plates.mjs';
import { BIO_ENV_PLATES } from '../tools/plates_73/bio_env_plates.mjs';
import { AI_9_PLATES } from '../tools/plates_73/ai_9.mjs';

const manifest = JSON.parse(fs.readFileSync('src/realistic_plates.json', 'utf8'));
const plates = [...CHEM_PLATES, ...PHYS_PLATES, ...BIO_ENV_PLATES, ...AI_9_PLATES];
const reviewedIds = [
  'thomson_plum_pudding', 'law_constant_proportion', 'straight_conductor_field', 'dihybrid_cross_punnett',
  'electric_power_kwh_energy', 'contraceptive_methods_overview', 'hormonal_feedback_loop',
  'gametes_cycle_pregnancy', 'adolescent_reproductive_hygiene', 'need_for_classification',
  'dna_copying_variation', 'fertilisation_implantation_cycle', 'wind_hydro_tidal_turbines',
  'biogas_and_nuclear_energy', 'direct_vs_alternating_current', 'ethanoic_acid_tests',
  'modern_periodic_law', 'disease_prevention_immunity',
];
for (const id of reviewedIds) {
  const plate = plates.find(p => p.id === id);
  assert.ok(plate, `missing authoring plate ${id}`);
  assert.deepStrictEqual(manifest.labels[`rx/${id}.webp`], plate.marks, `manifest labels differ from source: ${id}`);
  assert.ok(manifest.assets[plate.wid]?.[plate.sec]?.includes(`rx/${id}.webp`), `missing mapping: ${id}`);
}
console.log(`PASS reviewed_plate_metadata: ${reviewedIds.length} plates match authoring labels and runtime mappings`);
