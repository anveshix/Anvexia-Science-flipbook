# 2D image coverage

**205 of 266 sections** show a realistic plate, a 3D-rendered teaching view, or a locally generated illustration first (`assets/2d/rx/`). The twelve local AI-generated drafts cover IX Exploration 1.1, 1.2, 1.4 and 1.6; IX Forces 6.3; IX Mixtures 5.2; IX Work and Energy 7.7; X Metals 3.8; X Environment 13.1; X Sources S.2; and X Sustainable Management M.2 and M.3. They have bilingual hotspots and remain subject and language review pending. The alloy objects are illustrative examples; their actual composition cannot be determined from appearance, and the medal lettering is not meaningful.

The **61 sections below** still show only the generated composite plate. For upstream illustrations, add an image in `ifinite-horizon` (`public/2d/<class>/<subject>/images/<id>.webp` + an entry with bilingual `marks` in `assets/va-2d.js`), then:

```bash
python3 tools/import_realistic_plates.py ../ifinite-horizon   # after adding the id to MAP/EXTRA in the script
npm run build && npm run qa
```

## Cell: The Building Block of Life (`c9_cell`, Class IX) — 1 missing
- § 2.10 Biomolecules and cell functions

## Tissues in Action (`c9_tissues`, Class IX) — 3 missing
- § 3.3 Meristematic tissues
- § 3.4 Simple permanent plant tissues
- § 3.6 Phloem: food transport

## Why Do We Fall Ill (`c9_disease`, Class IX) — 2 missing
- § 2 Concept 2
- § 3 Concept 3

## Chemical Reactions and Equations (`c10_reactions`, Class X) — 2 missing
- § 1.1 Chemical changes and their evidence
- § 1.8 Exothermic and endothermic reactions

## Carbon and its Compounds (`c10_carbon`, Class X) — 8 missing
- § 4.2.2 Chains, branches and rings
- § 4.2.3 A functional group changes everything
- § 4.2.5 Naming a carbon compound
- § 4.3.1 Clean blue flame or sooty yellow?
- § 4.3.2 Ethanol becomes ethanoic acid
- § 4.3.3 Addition across the double bond
- § 4.3.4 Chlorine replaces hydrogen
- § 4.4.2 Weak acid, four tests

## Heredity (`c10_heredity`, Class X) — 1 missing
- § 8.4 Dihybrid cross and independent assortment

## Light – Reflection and Refraction (`c10_light`, Class X) — 1 missing
- § 9.2.4 Mirror formula & magnification

## The Human Eye and the Colourful World (`c10_eye`, Class X) — 1 missing
- § 10.8 Twinkling, planets and atmospheric refraction

## Electricity (`c10_electricity`, Class X) — 1 missing
- § 11.8 Electric power and energy

## Magnetic Effects of Electric Current (`c10_magnetism`, Class X) — 3 missing
- § 12.2 Field due to a straight current-carrying conductor
- § 12.3 Right-hand thumb rule
- § 12.7 Direct and alternating current

## Life Processes (`c10_life`, Class X) — 1 missing
- § 5.3 Heterotrophic nutrition

## Control and Coordination (`c10_control`, Class X) — 2 missing
- § 6.6 Voluntary, involuntary and autonomic actions
- § 6.8 Feedback control and coordination

## How do Organisms Reproduce? (`c10_repro`, Class X) — 4 missing
- § 7.1 Variation and the need for reproduction
- § 7.7 Fertilisation, embryo and menstrual cycle
- § 7.8 Reproductive health and contraception
- § 7.9 HIV, AIDS and women's health

## Exploration: Entering the World of Secondary Science (`c9_exploration`, Class IX) — 1 missing
- § 1.5 Models connect the unseen to the seen

## Exploring Mixtures and their Separation (`c9_mixtures`, Class IX) — 3 missing
- § 5.5 Mass by mass percentage
- § 5.6 Mass by volume and volume by volume
- § 5.10 Centrifugation and coagulation

## Work, Energy, and Simple Machines (`c9_work_energy`, Class IX) — 2 missing
- § 7.2 Positive, negative and zero work
- § 7.5 Work-energy theorem

## Journey Inside the Atom (`c9_atom`, Class IX) — 5 missing
- § 8.4 Thomson's plum-pudding model
- § 8.8 Atomic number and mass number
- § 8.9 Isotopes and isobars
- § 8.11 Symbols of elements
- § 8.12 Symbols, valency and formulae

## Atomic Foundations of Matter (`c9_atomic_foundations`, Class IX) — 4 missing
- § 9.2 Law of constant proportion
- § 9.7 Writing chemical formulae
- § 9.8 Molecular mass
- § 9.9 Formula unit mass

## Reproduction: How Life Continues (`c9_reproduction9`, Class IX) — 2 missing
- § 11.8 Gametes, menstrual cycle and pregnancy
- § 11.9 Reproductive health, hygiene and birth control

## Patterns in Life: Diversity and Classification (`c9_diversity`, Class IX) — 5 missing
- § 12.1 Why classification is needed
- § 12.4 Major divisions of plants
- § 12.5 Major divisions of animals
- § 12.6 Binomial nomenclature
- § 12.7 Hierarchy of taxonomic ranks

## Periodic Classification of Elements (formative only) (`c10_periodic`, Class X) — 5 missing
- § P.1 Döbereiner's triads
- § P.2 Newlands' law of octaves
- § P.3 Mendeleev's periodic table
- § P.4 The modern periodic law
- § P.5 Trends in the modern table

## Sources of Energy (outside 2026-27 syllabus) (`c10_sources`, Class X) — 3 missing
- § S.1 Conventional and non-conventional sources
- § S.3 Wind, hydro and tidal energy
- § S.4 Biomass, biogas and nuclear energy

## Sustainable Management of Natural Resources (outside 2026-27) (`c10_sustainable`, Class X) — 1 missing
- § M.4 Coal, petroleum and the 3Rs


## Rejected candidates (not used in the app)

- `rejected/c9_exploration/1-5-model-order-draft.webp`: solar-system model has unreliable planet ordering and proportions; do not use it to teach astronomy.
- `rejected/c10_sources/s-3-tidal-context-draft.webp`: underwater turbines appear in an ambiguous river/dam setting with no evident tidal flow; it does not adequately explain tidal energy.

All new AI scenes are illustrative drafts, not procedures, measurements or evidence of experiments. In the solutions image, water and the example solution cannot be distinguished by appearance alone. The rainwater scene is not a construction plan and does not show treatment for drinking. The Sources and Sustainable Management sections are outside the 2026–27 syllabus.
