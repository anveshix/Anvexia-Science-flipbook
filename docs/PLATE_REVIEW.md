# Plate review: targeted and thumbnail passes

This is a limited source-assisted spot check, **not** independent teacher approval or a completed review of the 61 formerly unmapped sections. The generated illustrations are static conceptual diagrams and are not experimental evidence. All topics, Hindi translations, visual accessibility, and educational claims still need subject-teacher review.

| Runtime section / plate | Finding and action | Remaining caveat |
| --- | --- | --- |
| X Magnetism 12.2, `straight_conductor_field.webp` | Reversed the arrows at the front of the field circles to match the right-hand rule for an upward current; removed the ambiguous battery/rheostat circuit. Updated bilingual explanation. | Schematic only, not an electrical construction guide; field directions are idealised and do not account for Earth's field. |
| IX Atom 8.4, `thomson_plum_pudding.webp` | Corrected the model's displayed date from 1898 to 1904. | Historical analogy, not the modern atomic model; drawing is not to scale. |
| X Heredity 8.4, `dihybrid_cross_punnett.webp` | Distinguished 16 gamete combinations from 16 distinct genotypes; clarified that 9:3:3:1 is an expected ratio under independent assortment and complete dominance, not proof from an individual sample. | Linked genes need not assort independently; real observations may differ from expected proportions. |
| IX Atomic Foundations 9.2, `law_constant_proportion.webp` | Removed a misleading level balance implying 1 g and 8 g balance equally. Distinguished pure water from unpurified source water and marked the 1:8 mass ratio as approximate using rounded atomic masses. | Isotopic composition can change precise masses; visual atoms and grams are illustrative rather than a direct depiction of measurements. |

These four plates and their bilingual hotspots were changed in both the authoring sources and runtime manifest. `qa/reviewed_plate_metadata.mjs` checks source/manifest label parity, not scientific accuracy. Two other plates, X Light 9.2.4 and IX Disease 2, were visually spot-checked only and are **not** approved: the disease topic assignment remains provisional, and medical illustrations need qualified review. A subsequent thumbnail-only visual screening covered the other 55 plates. Fourteen received targeted corrections (including one AI plate where only hotspot text changed), while 41 received no correction. The screening was not a comprehensive scientific, Hindi, hotspot-anchor or accessibility audit. All 55 still require independent subject-teacher review; see [the 55-section tracker](plate_review_55.csv).

## References consulted

- J. J. Thomson's atomic model: [Chemistry LibreTexts, The Nuclear Atom](https://chem.libretexts.org/Courses/College_of_the_Canyons/Chem_151:_Preparatory_General_Chemistry_OER/04:_Atoms_and_Elements/4.03:_The_Nuclear_Atom).
- Straight conductor and right-hand rule: [Georgia Tech Physics Book, Magnetic Field of a Long Straight Wire](https://physicsbook.gatech.edu/Magnetic_Field_of_a_Long_Straight_Wire).
- Dihybrid cross, independence and linked genes: [OpenStax Biology 2e, Laws of Inheritance](https://openstax.org/books/biology-2e/pages/12-3-laws-of-inheritance).
- Pure water and definite proportions: [Chemistry LibreTexts, Law of Definite Proportions](https://chem.libretexts.org/Courses/Georgian_College/Chemistry_-_Academic_and_Career_Preparation/01:_Nature_of_Matter/1.08:_Law_of_Definite_Proportions).

## Subsequent targeted corrections

- X Electricity 11.8: replaced a misleading circuit with an energy calculation; the prior image placed a voltmeter in series.
- X Reproduction 7.8: corrected the copper-IUD mechanism and qualified condom, pill and sterilisation claims. IX Reproduction 11.8 and X Reproduction 7.7 now clarify that ovulation and cycle timing vary. IX Reproduction 11.9 no longer promises prevention of anaemia or infection from diet or hygiene alone.
- IX Disease 3: corrected overly broad claims about water treatment, vaccine types, handwashing and antibodies. The image is AI-generated and the section identity is still provisional.
- IX Diversity 12.1: replaced an incorrect exclusive classification tree with non-exhaustive examples; yeast is a unicellular fungus.
- X Control 6.8 and X Reproduction 7.1: qualified insulin feedback and the effect of variation on survival.
- X Carbon 4.4.2, X Magnetism 12.7, X Periodic P.4, and X Sources S.3 and S.4: qualified pH, direct current, valence configurations, wind-speed and biogas-composition claims.

Additional references consulted: [OpenStax: voltmeters and ammeters](https://openstax.org/books/college-physics-2e/pages/21-4-dc-voltmeters-and-ammeters), [WHO: intrauterine devices](https://www.who.int/news-room/fact-sheets/detail/intrauterine-devices), [CDC: cycle and ovulation variability](https://www.cdc.gov/contraception/hcp/usspr/not-pregnant.html), and [OpenStax: fungi](https://openstax.org/books/concepts-biology/pages/13-4-fungi). The visual screening did not verify every claim against these sources.
