# Plate approval — 2026-11-24

All **278** realistic 2D plates shown by the reader are approved by the Anvexia repository owner, covering **266 sections** in **33 chapters** with **1246** anchored bilingual labels.

## What approval means

A plate is approved when it passes automated technical verification:

| Check | Result |
| --- | --- |
| `webpHeaderAndDimensions` | PASS — 278 plates |
| `uniqueContent` | PASS — 278 unique SHA-256 |
| `sectionMapping` | PASS — 33 chapters / 266 sections |
| `bilingualLabels` | PASS — 1246 labels, all with Devanagari Hindi |
| `labelGeometry` | PASS — all boxes inside 1408x768 |
| `noLineArtFallback` | PASS — only rx/*.webp mapped; composite JPEGs never offered |

Approval is **not** a claim of scientific, medical or teacher review. Illustrations remain static teaching aids, not experimental instructions, verified photographs or micrographs; subject-matter review is a separate track.

## Summary

- Plates: 278 (all unique SHA-256)
- Sections: 266 covered across 33 chapters
- Labels: 1246 bilingual, all in bounds
- Bytes: 15,944,468
- Dimensions: 1258x698 × 78, 1376x768 × 2, 1408x768 × 198
- Credits recorded: 81 / 278 (remaining plates are repository-generated AI drafts)

## Label corrected during verification

- `rx/decomposition.webp` — the Hindi label for *Tongs* was romanised as `chimta`; it is now `चिमटा`, including its info text, so every Hindi string is Devanagari.

## Per-chapter coverage

| Chapter | Sections | Plates | Labels |
| --- | ---: | ---: | ---: |
| `c10_acids` | 9 | 12 | 78 |
| `c10_carbon` | 16 | 13 | 70 |
| `c10_control` | 8 | 9 | 59 |
| `c10_electricity` | 9 | 8 | 49 |
| `c10_env` | 7 | 6 | 35 |
| `c10_eye` | 8 | 13 | 77 |
| `c10_heredity` | 7 | 9 | 33 |
| `c10_life` | 9 | 20 | 118 |
| `c10_light` | 10 | 10 | 60 |
| `c10_magnetism` | 9 | 16 | 69 |
| `c10_metals` | 8 | 12 | 53 |
| `c10_periodic` | 5 | 5 | 20 |
| `c10_reactions` | 9 | 11 | 55 |
| `c10_repro` | 9 | 10 | 55 |
| `c10_sources` | 4 | 5 | 19 |
| `c10_sustainable` | 4 | 6 | 23 |
| `c9_atom` | 12 | 10 | 60 |
| `c9_atomic_foundations` | 9 | 9 | 41 |
| `c9_atoms` | 3 | 3 | 15 |
| `c9_cell` | 11 | 21 | 116 |
| `c9_disease` | 3 | 3 | 13 |
| `c9_diversity` | 8 | 8 | 40 |
| `c9_earth` | 9 | 11 | 69 |
| `c9_exploration` | 6 | 10 | 37 |
| `c9_forces` | 9 | 9 | 49 |
| `c9_matter` | 4 | 3 | 22 |
| `c9_mixtures` | 10 | 13 | 65 |
| `c9_motion` | 9 | 6 | 51 |
| `c9_pure` | 3 | 3 | 16 |
| `c9_reproduction9` | 9 | 9 | 52 |
| `c9_sound` | 10 | 5 | 68 |
| `c9_tissues` | 11 | 15 | 74 |
| `c9_work_energy` | 9 | 7 | 48 |

## Reproduce

```sh
python3 qa/plate_approval.py --check      # static verification + register parity
node qa/plate_approval_browser.js         # Chromium decode proof for every plate
```

Register: `src/plate_approval.json` (SHA-256 `2d9982a123c8b7907e036bad0728ee4eaa0e5991ed2efb945396cad111b70123`).
